#!/usr/bin/env python3
"""Paint one of OUR designed plates with an open image model, LOCALLY on the CPU (no key, no service): SDXL base 1.0
img2img (stabilityai/stable-diffusion-xl-base-1.0, CreativeML Open RAIL++-M, commercial use allowed). The AI-paint
test: docs/studies/2026-10-28_city_posters/ai_paint/NOTES.md. The design (layout, shapes, colours) is ours; the model only
paints it. The style is steered by WORDS only (never an artist's name, never the reference images as input).

    HF_HOME=/tmp/hf-cache /tmp/aipaint/venv/bin/python scripts/look/aipaint/sdxl_paint.py \
        --plate sky --init out/aipaint/init/sky_init.png --out out/aipaint/sky --strength 0.4,0.55,0.7 --seed 1029

One process loads the model once and paints each strength in turn (memory: the session's cgroup allows 14.3 GB, page
cache included; the text encoders are dropped once the prompt is encoded, and the last run frees the UNet before its
fp32 VAE decode: the 0.70 trial was OOM-killed at decode with both still loaded). Each run writes, as it goes:
  <out>/<plate>_s<strength>_seed<seed>.png    the painted plate (VAE decode in fp32)
  <out>/<plate>_s<strength>_seed<seed>.json   every setting + timing (model id + revision, prompt, negative, steps...)
  <out>/<plate>_s<strength>_seed<seed>_preview.png   a cheap latent preview, rewritten every step
  <out>/progress.log                           one line per step (seconds per step)
The weights stay outside the repo (HF_HOME). Safetensors only; no remote code.
"""
import argparse, gc, json, os, platform, sys, time

os.environ.setdefault('HF_HOME', '/tmp/hf-cache')
os.environ.setdefault('HF_HUB_OFFLINE', '1')
import numpy as np
import torch
from PIL import Image

MODEL = 'stabilityai/stable-diffusion-xl-base-1.0'
LICENCE = 'CreativeML Open RAIL++-M (commercial use allowed, with the use restrictions of its Attachment A)'
# --control: structure control on OUR edges (make_inits.py's canny map), so a higher strength can paint while the
# layout holds. xinsir/controlnet-canny-sdxl-1.0, licence Apache-2.0 (commercial use allowed).
CONTROLNET = 'xinsir/controlnet-canny-sdxl-1.0'
CONTROLNET_LICENCE = 'Apache-2.0 (commercial use allowed)'

# The style in words, from the owner's two models (refs_human_scale 03_beach_dusk, 02_bus_stop_night): big simple masses
# of a few broad deliberate strokes, soft dry-brush edges and atmosphere, one colour family lit by one low sun, layered
# clouds (far ones paler and flatter), a matte gouache / digital-painting finish. No artist names. <= 77 CLIP tokens.
PROMPTS = {
    'sky': ('matte gouache painting of a dusk sky, layered clouds in overlapping planes, near cumulus lit gold by a low '
            'sun on the left, far banks paler and flatter, thin streaks at the horizon, big simple masses, few broad '
            'brush strokes, soft dry-brush edges, soft atmosphere, lavender rose and peach palette'),
    'tree': ('matte gouache painting of a small round tree on a quay at dusk, one warm lit mass on the sunny left and one '
             'cool shade mass, big simple masses, few broad deliberate brush strokes, soft dry-brush edges, soft '
             'atmosphere, muted sage green, warm low evening light'),
}
NEGATIVE = ('text, letters, words, watermark, signature, logo, people, person, figure, face, photo, photograph, '
            'photorealistic, 3d render, cgi, noise, grain, jpeg artifacts, oversaturated, neon, harsh contrast, busy '
            'detail, outlines, blurry')

# SDXL latent -> RGB approximation (a preview only, as UIs use; the real image is the fp32 VAE decode)
LATENT_RGB = torch.tensor([[0.3651, 0.4232, 0.4341], [-0.2533, -0.0042, 0.1068], [0.1076, 0.1111, -0.0362],
                           [-0.3165, -0.2492, -0.2188]])
LATENT_BIAS = torch.tensor([0.1084, -0.0175, -0.0011])


def log(out, msg):
    line = f'{time.strftime("%H:%M:%S")} {msg}'
    print(line, flush=True)
    with open(os.path.join(out, 'progress.log'), 'a') as f:
        f.write(line + '\n')


def preview(latents, path):
    x = latents[0].float().permute(1, 2, 0) @ LATENT_RGB + LATENT_BIAS
    x = ((x.clamp(-1, 1) + 1) * 127.5).byte().numpy()
    Image.fromarray(x).resize((x.shape[1] * 4, x.shape[0] * 4), Image.BILINEAR).save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--plate', required=True, choices=sorted(PROMPTS))
    ap.add_argument('--init', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--strength', default='0.55', help='one or more, comma separated')
    ap.add_argument('--seed', type=int, default=1029)
    ap.add_argument('--steps', type=int, default=30, help='scheduler steps; img2img runs int(steps*strength) of them')
    ap.add_argument('--cfg', type=float, default=6.5)
    ap.add_argument('--threads', type=int, default=os.cpu_count())
    ap.add_argument('--control', help='a canny edge map of the init (make_inits.py *_canny.png): ControlNet canny')
    ap.add_argument('--control-scale', type=float, default=0.6)
    ap.add_argument('--tag', default='', help='a suffix for the output names (e.g. _cn)')
    ap.add_argument('--negative-extra', default='', help='words appended to the negative prompt (logged)')
    a = ap.parse_args()
    negative = NEGATIVE + (', ' + a.negative_extra if a.negative_extra else '')
    os.makedirs(a.out, exist_ok=True)
    torch.set_num_threads(a.threads)

    from diffusers import StableDiffusionXLImg2ImgPipeline, DPMSolverMultistepScheduler
    import diffusers, transformers
    ref = os.path.join(os.environ['HF_HOME'], 'hub', 'models--' + MODEL.replace('/', '--'), 'refs', 'main')
    revision = open(ref).read().strip() if os.path.exists(ref) else 'unknown'   # the commit fetch_model.py pulled

    t0 = time.time()
    snap = os.path.join(os.path.dirname(os.path.dirname(ref)), 'snapshots', revision)   # the local snapshot folder
    pipe = StableDiffusionXLImg2ImgPipeline.from_pretrained(
        snap, torch_dtype=torch.bfloat16, variant='fp16', use_safetensors=True, local_files_only=True)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
    vae = pipe.vae.to(torch.float32)   # encode/decode ourselves in fp32 (bf16 VAE output bands)
    crev = None
    if a.control:
        from diffusers import ControlNetModel, StableDiffusionXLControlNetImg2ImgPipeline
        cref = os.path.join(os.environ['HF_HOME'], 'hub', 'models--' + CONTROLNET.replace('/', '--'), 'refs', 'main')
        crev = open(cref).read().strip()
        cn = ControlNetModel.from_pretrained(os.path.join(os.path.dirname(os.path.dirname(cref)), 'snapshots', crev),
                                             torch_dtype=torch.bfloat16, use_safetensors=True, local_files_only=True)
        pipe = StableDiffusionXLControlNetImg2ImgPipeline(**pipe.components, controlnet=cn)
        control = Image.open(a.control).convert('RGB')
    pipe.set_progress_bar_config(disable=True)
    t_load = time.time() - t0
    log(a.out, f'loaded {MODEL}@{revision[:10]} bf16 (VAE fp32) in {t_load:.0f} s, threads {a.threads}')

    # the prompt once, then drop the text encoders (about 1.6 GB)
    with torch.no_grad():
        pe, npe, ppe, nppe = pipe.encode_prompt(prompt=PROMPTS[a.plate], negative_prompt=negative, device='cpu',
                                                num_images_per_prompt=1, do_classifier_free_guidance=True)
    pipe.text_encoder = None
    pipe.text_encoder_2 = None
    gc.collect()

    init = Image.open(a.init).convert('RGB')
    W, H = init.size
    assert W % 64 == 0 and H % 64 == 0, 'SDXL sizes are multiples of 64'
    x = torch.from_numpy(np.asarray(init).astype(np.float32) / 127.5 - 1).permute(2, 0, 1)[None]
    t0 = time.time()
    with torch.no_grad():
        lat0 = vae.encode(x).latent_dist.mode() * vae.config.scaling_factor   # the mean: deterministic
    t_enc = time.time() - t0
    log(a.out, f'encoded init {W}x{H} -> latents {tuple(lat0.shape)} in {t_enc:.0f} s')

    strengths = [float(v) for v in a.strength.split(',')]
    for si, s in enumerate(strengths):
        name = f'{a.plate}_s{s:.2f}_seed{a.seed}{a.tag}'
        if os.path.exists(os.path.join(a.out, name + '.png')):
            log(a.out, f'{name}: exists, skipped'); continue
        n_run = int(a.steps * s)
        stamps = [time.time()]

        def on_step(p, i, t, kw):
            stamps.append(time.time())
            log(a.out, f'{name}: step {i + 1}/{n_run} {stamps[-1] - stamps[-2]:.1f} s')
            preview(kw['latents'], os.path.join(a.out, name + '_preview.png'))
            return kw

        g = torch.Generator('cpu').manual_seed(a.seed)
        extra = {'control_image': control, 'controlnet_conditioning_scale': a.control_scale} if a.control else {}
        with torch.no_grad():
            lat = pipe(prompt_embeds=pe, negative_prompt_embeds=npe, pooled_prompt_embeds=ppe,
                       negative_pooled_prompt_embeds=nppe, image=lat0.to(torch.bfloat16), **extra,
                       strength=s, num_inference_steps=a.steps, guidance_scale=a.cfg, generator=g,
                       output_type='latent', callback_on_step_end=on_step,
                       callback_on_step_end_tensor_inputs=['latents']).images
            t_den = time.time() - stamps[0]
            if si == len(strengths) - 1:   # the last run: free the UNet (and ControlNet) before the fp32 decode
                pipe.unet = None
                if a.control:
                    pipe.controlnet = None
            gc.collect()
            t1 = time.time()
            img = vae.decode(lat.to(torch.float32) / vae.config.scaling_factor).sample
            t_dec = time.time() - t1
        arr = ((img[0].clamp(-1, 1) + 1) * 127.5).round().byte().permute(1, 2, 0).numpy()
        Image.fromarray(arr).save(os.path.join(a.out, name + '.png'))
        meta = {
            'plate': a.plate, 'model': MODEL, 'revision': revision, 'licence': LICENCE,
            'pipeline': 'StableDiffusionXLImg2ImgPipeline', 'dtype': 'bfloat16 (UNet, text encoders); VAE float32',
            'scheduler': 'DPMSolverMultistepScheduler, use_karras_sigmas=True (DPM++ 2M Karras)',
            'prompt': PROMPTS[a.plate], 'prompt_2': '(same)', 'negative_prompt': negative,
            'init': os.path.relpath(a.init), 'size': [W, H], 'strength': s, 'steps': a.steps, 'steps_run': n_run,
            'guidance_scale': a.cfg, 'seed': a.seed, 'generator': 'torch.Generator(cpu).manual_seed',
            'init_latents': 'vae.encode(init).latent_dist.mode() * scaling_factor',
            'seconds': {'load': round(t_load, 1), 'encode': round(t_enc, 1), 'denoise': round(t_den, 1),
                        'per_step': round(t_den / max(n_run, 1), 1), 'decode': round(t_dec, 1)},
            'minutes_total': round((t_den + t_dec) / 60, 2),
            'versions': {'torch': torch.__version__, 'diffusers': diffusers.__version__,
                         'transformers': transformers.__version__, 'python': platform.python_version()},
            'cpu': platform.processor() or platform.machine(), 'threads': a.threads,
        }
        if a.control:
            meta.update({'pipeline': 'StableDiffusionXLControlNetImg2ImgPipeline', 'controlnet': CONTROLNET,
                         'controlnet_revision': crev, 'controlnet_licence': CONTROLNET_LICENCE,
                         'control_image': os.path.relpath(a.control), 'controlnet_conditioning_scale': a.control_scale})
        json.dump(meta, open(os.path.join(a.out, name + '.json'), 'w'), indent=1)
        log(a.out, f'{name}: done, {n_run} steps in {t_den:.0f} s ({t_den / max(n_run, 1):.1f} s/step), decode {t_dec:.0f} s')


if __name__ == '__main__':
    sys.exit(main())

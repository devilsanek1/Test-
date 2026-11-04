#!/usr/bin/env python3
"""Fetch SDXL base 1.0 (stabilityai/stable-diffusion-xl-base-1.0, licence CreativeML Open RAIL++-M: commercial use
allowed) for the AI-paint test (docs/studies/2026-10-28_city_posters/ai_paint/NOTES.md). Weights live OUTSIDE the repo
(HF_HOME, default /tmp/hf-cache) and are never committed. Only the fp16 safetensors variant (about 6.9 GB) and the
configs and tokenizers; no .bin/.ckpt pickles, no remote code.
    HF_HOME=/tmp/hf-cache python3 scripts/look/aipaint/fetch_model.py [--controlnet]
--controlnet also fetches xinsir/controlnet-canny-sdxl-1.0 (licence Apache-2.0: commercial use allowed; 2.5 GB fp16
safetensors): structure control, so a higher strength can paint while our edges hold.
"""
import os, sys, time
os.environ.setdefault('HF_HOME', '/tmp/hf-cache')
from huggingface_hub import snapshot_download

REPO = 'stabilityai/stable-diffusion-xl-base-1.0'
PATTERNS = [
    'model_index.json', 'scheduler/*.json',
    'text_encoder/config.json', 'text_encoder/model.fp16.safetensors',
    'text_encoder_2/config.json', 'text_encoder_2/model.fp16.safetensors',
    'tokenizer/*', 'tokenizer_2/*',
    'unet/config.json', 'unet/diffusion_pytorch_model.fp16.safetensors',
    'vae/config.json', 'vae/diffusion_pytorch_model.fp16.safetensors',
]
CONTROLNET = 'xinsir/controlnet-canny-sdxl-1.0'
t0 = time.time()
path = snapshot_download(REPO, allow_patterns=PATTERNS)
print(f'{REPO} -> {path} in {time.time() - t0:.0f} s', flush=True)
if '--controlnet' in sys.argv:
    t0 = time.time()
    path = snapshot_download(CONTROLNET, allow_patterns=['config.json', 'diffusion_pytorch_model.safetensors'])
    print(f'{CONTROLNET} -> {path} in {time.time() - t0:.0f} s', flush=True)

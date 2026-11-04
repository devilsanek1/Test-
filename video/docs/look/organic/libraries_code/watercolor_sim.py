"""open-watercolor-sim (Apache-2.0, Taichi on the CPU): our zones as pigment + water masks, the sim lets them flow,
bloom and dry (edge darkening, granulation), then the piece is read back. Paper is white; for the cloud the result is
laid over the sky as a multiply (a transparent wash), the way the medium works. Seeded (engine seed + numpy seed)."""
import json, time, sys, numpy as np, cv2
from PIL import Image
sys.argv = sys.argv[:1]
from open_watercolor_sim import WatercolorEngine, SimParams
L = '/tmp/organic/libraries'


def zone_masks(name, R):
    plan = json.load(open(f'{L}/plans/{name}.json'))
    w, h = plan['size']
    S = R / max(w, h)
    out = []
    for z in plan['zones']:
        m = np.zeros((h, w), np.uint8)
        for poly in z['polys']:
            cv2.fillPoly(m, [np.round(np.array(poly)).astype(np.int32)], 255)
        mm = np.zeros((R, R), np.float32)
        r = cv2.resize(m, (round(w * S), round(h * S)), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        mm[:r.shape[0], :r.shape[1]] = r
        out.append((z['color'], mm))
    return out, (w, h), S


def run(name, R=512, steps=90, seed=3):
    np.random.seed(seed)
    eng = WatercolorEngine(res=R, seed=seed, arch='cpu', preview_res=128)
    p = SimParams()
    p.diffusion, p.gravity, p.granulation, p.edge_darkening = 0.35, 0.2, 0.5, 0.9
    p.canvas_evaporation = 0.35
    eng.set_params(p)
    eng.clear()
    zm, (w, h), S = zone_masks(name, R)
    t0 = time.time()
    for col, m in zm:                      # dark (back) to light, each laid wet and let flow
        rgb = [int(col[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        eng.set_color(*rgb)
        # Taichi fields are (i, j) = (x, y): transpose
        eng.paint_mask(np.ascontiguousarray(m.T * 0.9), np.ascontiguousarray(m.T))
        eng.step(steps)
    eng.step(steps)
    img = eng.render(full_res=True)          # (R, R, 3) indexed [i=x, j=y]
    img = np.transpose(img, (1, 0, 2))
    crop = img[:round(h * S), :round(w * S)]
    crop = cv2.resize(crop, (w, h), interpolation=cv2.INTER_CUBIC)
    print(name, f'{time.time() - t0:.1f} s sim at {R}^2, {steps} steps per zone')
    return crop


if __name__ == '__main__':
    for name in ['cloud', 'tree']:
        crop = run(name)
        Image.fromarray(crop).save(f'{L}/out/watercolor/{name}_paper.png')
        # as a wash over the piece's own ground: multiply (paper white = no change)
        if name == 'cloud':
            ground = np.asarray(Image.open(f'{L}/inputs/cloud_sky_v6.png').convert('RGB')).astype(np.float32) / 255
        else:
            ground = np.ones_like(crop, dtype=np.float32) * np.array([185, 128, 106], np.float32) / 255
        mul = ground * crop.astype(np.float32) / 255
        Image.fromarray((mul * 255 + 0.5).astype(np.uint8)).save(f'{L}/out/watercolor/{name}_multiply.png')

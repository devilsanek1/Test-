"""light_s1 bake: SOLVE the maps (light_proof.md §2.2; light.md §4.11 generalised). For each slot, the browser draws ONE
multiply map then ONE screen map over what is already there; at a pixel the slot carries, that is exactly the static
base render (common.carriers), so the pair can be solved per pixel and channel to land on ANY target colour:
    M = T / B where the target is darker (the shade), 1 elsewhere          (multiply: out = B x M)
    S = 1 - (1 - T) / (1 - B M) where the target is lighter (the light)    (screen:   out = 1 - (1 - BM)(1 - S))
in the browser's own sRGB values (no curve to undo). Everywhere a slot does not carry, its maps are identity (white
multiply, black screen), and each map is cropped to the box where it changes anything (light.md §7: the cost is the
blended area). M is quantised DOWN and S solved against the quantised M, so the pair never undershoots; the target
gets a seeded +-0.5-code triangular dither first (no ramp bands, CRAFT §g.4)."""
import os

import cv2
import numpy as np

from common import H, W, SLOT_SEGS, rng

FAR_SLOTS = ('farroofs', 'fartower', 'bridge')


def slot_pixels(car, L):
    """The pixel set each slot carries (the far group split by its three labels)."""
    out = {}
    for i, (name, _) in enumerate(SLOT_SEGS):
        m = car == i
        if name == 'far':
            stack = np.stack([L['farroofs'], L['fartower'], L['bridge']], 0)
            best = np.argmax(stack, 0)
            for j, fs in enumerate(FAR_SLOTS):
                out[fs] = m & (best == j)
        else:
            out[name] = m
    return out


def dither(name, shape):
    r = rng(f'light_s1/dither/{name}')
    return ((r.random(shape, dtype=np.float32) + r.random(shape, dtype=np.float32) - 1.0) * (0.5 / 255)).astype(np.float32)


def changed_px(B, T, mask):
    """The pixels the light really changes (more than half a code in a channel); elsewhere the maps stay identity."""
    return mask & (np.abs(T - B).max(-1) > 0.6 / 255)


def solve_pair(B, T, mask, name):
    """The multiply and screen maps (float 0..1, full frame) that take B to T inside `mask`."""
    ch = changed_px(B, T, mask)
    T = np.where(ch[..., None], np.clip(T + dither(name, T.shape), 0, 1), B)
    M = np.ones_like(B)
    dark = (T < B) & ch[..., None]
    M[dark] = T[dark] / np.maximum(B[dark], 1e-6)
    Mq = np.minimum(1.0, np.floor(M * 255 + 0.05) / 255)
    BM = B * Mq
    S = np.zeros_like(B)
    light = (T > BM + 0.2 / 255) & ch[..., None]
    S[light] = 1 - (1 - T[light]) / np.maximum(1 - BM[light], 1e-6)
    S = np.clip(S, 0, 1)
    return Mq, S


def bbox(changed, pad=1):
    ys, xs = np.nonzero(changed)
    if not len(xs):
        return None
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(W, xs.max() + 1 + pad), min(H, ys.max() + 1 + pad)
    return int(x0), int(y0), int(x1 - x0), int(y1 - y0)


def write_png(path, img01):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    q = np.clip(np.round(img01 * 255), 0, 255).astype(np.uint8)
    cv2.imwrite(path, q[..., ::-1], [cv2.IMWRITE_PNG_COMPRESSION, 9])
    return os.path.getsize(path)


def browser_blend(B, Mq, S8):
    """What the browser's two blends give (8-bit maps): the check the bake prints."""
    return 1 - (1 - B * Mq) * (1 - S8)


def solve_slots(base, target, car, L, out_dir, look):
    """Every slot's maps for one look: writes the PNGs, returns the manifest rows and the composite the maps give."""
    pix = slot_pixels(car, L)
    rows = {}
    comp = base.copy()
    sizes = {}
    for slot, m in pix.items():
        if not m.any():
            continue
        Mq, S = solve_pair(base, target, m, f'{look}/{slot}')
        S8 = np.round(S * 255) / 255
        comp[m] = browser_blend(base, Mq, S8)[m]
        maps = []
        bm = bbox((Mq < 1).any(-1))
        if bm:
            x, y, w, h = bm
            fn = f'{slot}_mul.lmap.png'
            sizes[fn] = write_png(os.path.join(out_dir, fn), Mq[y:y + h, x:x + w])
            maps.append(dict(file=fn, box=[x, y, w, h], blend='multiply'))
        bs = bbox((S8 > 0).any(-1))
        if bs:
            x, y, w, h = bs
            fn = f'{slot}_scr.lmap.png'
            sizes[fn] = write_png(os.path.join(out_dir, fn), S8[y:y + h, x:x + w])
            maps.append(dict(file=fn, box=[x, y, w, h], blend='screen'))
        if maps:
            rows[slot] = maps
    return rows, comp, sizes


def solve_screen_layer(under, target, mask, out_dir, fn, name):
    """A screen-only layer (the door's pool) over what the slot left there."""
    ch = changed_px(under, target, mask)
    T = np.where(ch[..., None], np.clip(target + dither(name, target.shape), 0, 1), under)
    S = np.zeros_like(under)
    lit = (T > under + 0.2 / 255) & ch[..., None]
    S[lit] = 1 - (1 - T[lit]) / np.maximum(1 - under[lit], 1e-6)
    S8 = np.round(np.clip(S, 0, 1) * 255) / 255
    b = bbox((S8 > 0).any(-1))
    if not b:
        return None, under
    x, y, w, h = b
    size = write_png(os.path.join(out_dir, fn), S8[y:y + h, x:x + w])
    comp = under.copy()
    comp[mask] = (1 - (1 - under) * (1 - S8))[mask]
    return dict(file=fn, box=[x, y, w, h], blend='screen', bytes=size), comp

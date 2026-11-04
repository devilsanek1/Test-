"""The type iteration's two backgrounds (1080 x 1920), made from the latest look still (scene-1 painter v6).

    python3 scripts/type/backgrounds.py      # -> scripts/type/bg/bg_dusk.png, bg_night.png (+ _small.jpg previews)

bg_dusk:  paint_still_v6.png with its burned-in caption ("She quit Google." in the band y 317-556) painted out by a
          harmonic fill from the sky around it plus the sky's own faint grain (std ~1 level), so any type can sit there.
bg_night: bg_dusk re-graded to video 4's colour key (a cold blue night, one warm accent): the world darkened and pushed
          blue, the sun removed, the warm windows and the doorway kept warm with a soft bloom, light snow falling.
          A stand-in for the light-ink recipes until video 4's own art exists; never a film asset.
bg_night_cover: bg_night shifted down 180 px for the cover stills (TYPE_GUIDE §h 11-12): the leaves cut by the top edge
          painted out (a harmonic fill, snow added back), the sky extended above in its own colour (a soft mirror of
          the top rows fading into the sky's colour), so the open sky reaches y ~780: a stand-in for a cover frame
          composed with more sky.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(REPO, 'docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png')
OUT = os.path.join(HERE, 'bg')


def harmonic_fill(a, y0, y1, x0, x1, iters=3000):
    """Fill a[y0:y1, x0:x1] by solving Laplace's equation with the rectangle's border as the boundary."""
    reg = a[y0 - 1:y1 + 1, x0 - 1:x1 + 1].copy()
    # start from a vertical linear blend of the top and bottom borders
    top, bot = reg[0], reg[-1]
    h = reg.shape[0]
    for i in range(1, h - 1):
        t = i / (h - 1)
        reg[i, 1:-1] = (1 - t) * top[1:-1] + t * bot[1:-1]
    for _ in range(iters):
        reg[1:-1, 1:-1] = 0.25 * (reg[:-2, 1:-1] + reg[2:, 1:-1] + reg[1:-1, :-2] + reg[1:-1, 2:])
    a[y0:y1, x0:x1] = reg[1:-1, 1:-1]
    return a


def dusk():
    im = Image.open(SRC).convert('RGB')
    a = np.asarray(im).astype(np.float64)
    y0, y1, x0, x1 = 345, 505, 205, 835          # the caption and its peach box, with margin (ink y 378-477, x 240-797)
    a = harmonic_fill(a, y0, y1, x0, x1)
    rng = np.random.default_rng(1030)
    grain = rng.normal(0, 1.0, (y1 - y0, x1 - x0, 1))
    g = Image.fromarray(((grain[..., 0] * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    grain = (np.asarray(g).astype(np.float64) - 128) / 40 * 1.6
    a[y0:y1, x0:x1] += grain[..., None]
    out = Image.fromarray(a.clip(0, 255).round().astype(np.uint8))
    out.save(os.path.join(OUT, 'bg_dusk.png'))
    return out


def night(d):
    a = np.asarray(d).astype(np.float64) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    H, W = r.shape
    # warm lights: the yellow windows, the lit doorway and the lamp globes (bright, warm, not the pink sky)
    # the yellow windows (r-b ~0.44), the bright doorway (near white, warm); never the peach far city or table tops
    warm = (((r > 0.85) & (g > 0.70) & (b < 0.66) & (r - b > 0.30)) |
            ((r > 0.95) & (g > 0.85) & (r - b > 0.18))).astype(np.float64)
    warm[:560] = 0                                 # nothing warm in the sky (the sun is handled below)
    warm[1150:] = 0                                # nor in the near ground
    warm[:, :300] = 0                              # the far city stays a cold silhouette
    sun = ((r > 0.85) & (g < 0.62) & (b < 0.55)).astype(np.float64)
    sun[:600] = 0
    sun[900:] = 0
    # the grade: darker, bluer, a touch of desaturation; the top of the frame darkest
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    base = np.stack([0.55 * a[..., 0] + 0.45 * lum, 0.55 * a[..., 1] + 0.45 * lum, 0.55 * a[..., 2] + 0.45 * lum], -1)
    tint = np.array([0.30, 0.37, 0.62])
    n = base * tint
    yy = np.linspace(0, 1, H)[:, None, None]
    n *= 0.78 + 0.30 * np.clip(yy / 0.42, 0, 1)    # the sky darkens toward the top
    # remove the sun: blend it into the graded sky around it
    if sun.any():
        sm = np.asarray(Image.fromarray((sun * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(4))).astype(np.float64)[..., None] / 255
        around = np.asarray(Image.fromarray((n * 255).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(30))).astype(np.float64) / 255
        n = n * (1 - sm) + around * sm
    # the warm accent: windows keep a warm, slightly deeper colour; a soft bloom around them
    wm = np.asarray(Image.fromarray((warm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float64)[..., None] / 255
    warm_col = np.array([1.0, 0.74, 0.40]) * (0.80 + 0.20 * lum[..., None])
    n = n * (1 - wm) + warm_col * wm
    bloom = np.asarray(Image.fromarray((warm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(26))).astype(np.float64)[..., None] / 255
    n = 1 - (1 - n) * (1 - 0.55 * bloom * np.array([1.0, 0.62, 0.30]))   # screen blend, warm
    # snow: soft flakes, bigger and fewer near the camera, none inside the band's centre so type stays clean
    img = Image.fromarray((n * 255).clip(0, 255).astype(np.uint8))
    snow = Image.new('L', (W, H), 0)
    rng = np.random.default_rng(29)
    from PIL import ImageDraw
    dr = ImageDraw.Draw(snow)
    for _ in range(900):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        depth = rng.uniform(0, 1) ** 2
        rad = 1.0 + 4.0 * depth
        alpha = int(90 + 120 * depth)
        if 290 <= y <= 600:                        # lighter in the caption band, so type stays clean
            alpha //= 2
        dr.ellipse([x - rad, y - rad, x + rad, y + rad], fill=alpha)
    snow = snow.filter(ImageFilter.GaussianBlur(0.9))
    sa = np.asarray(snow).astype(np.float64)[..., None] / 255
    n = np.asarray(img).astype(np.float64) / 255
    flake = np.array([0.88, 0.92, 1.0])
    n = n * (1 - 0.85 * sa) + flake * 0.85 * sa
    out = Image.fromarray((n * 255).clip(0, 255).round().astype(np.uint8))
    out.save(os.path.join(OUT, 'bg_night.png'))
    return out


def flakes(a, box, seed, n):
    """Add night snow (the night() look) into a float RGB array a (0-255) inside box (x0, y0, x1, y1)."""
    from PIL import ImageDraw
    H, W = a.shape[:2]
    snow = Image.new('L', (W, H), 0)
    dr = ImageDraw.Draw(snow)
    rng = np.random.default_rng(seed)
    x0, y0, x1, y1 = box
    for _ in range(n):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        depth = rng.uniform(0, 1) ** 2
        rad = 1.0 + 4.0 * depth
        dr.ellipse([x - rad, y - rad, x + rad, y + rad], fill=int(90 + 120 * depth))
    sa = np.asarray(snow.filter(ImageFilter.GaussianBlur(0.9))).astype(np.float64)[..., None] / 255
    flake = np.array([0.88, 0.92, 1.0]) * 255
    return a * (1 - 0.85 * sa) + flake * 0.85 * sa


def night_cover(nt, shift=180):
    a = np.asarray(nt).astype(np.float64)
    # the leaves and twig at the top left, cut by the frame's top: painted out (they would show a hard cut once shifted)
    y0, y1, x0, x1 = 1, 236, 1, 300
    a = harmonic_fill(a, y0, y1, x0, x1, iters=2500)
    a[:y1, :x1] = flakes(a[:y1 + 40, :x1 + 40], (0, 0, x1, y1), 7, 40)[:y1, :x1]
    H, W = a.shape[:2]
    out = np.zeros_like(a)
    out[shift:] = a[:H - shift]
    # the extension: the top rows mirrored (the cloud continues upward), fading into the sky's own colour toward the top
    mir = a[:shift][::-1].copy()
    sky = a[200:320, 300:640].reshape(-1, 3)
    sky = np.median(sky, axis=0) * 0.93                      # the night sky darkens toward the top
    soft = np.asarray(Image.fromarray(mir.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float64)
    w = np.linspace(0.0, 1.0, shift)[::-1][:, None, None] ** 1.5   # 1 at the very top (all sky), 0 at the seam
    ext = soft * (1 - w) + sky * w
    out[:shift] = ext
    out[:shift + 30] = flakes(out[:shift + 30], (0, 0, W, shift), 11, 70)
    im = Image.fromarray(out.clip(0, 255).round().astype(np.uint8))
    im.save(os.path.join(OUT, 'bg_night_cover.png'))
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    d = dusk()
    nt = night(d)
    nc = night_cover(nt)
    for name, im in (('bg_dusk', d), ('bg_night', nt), ('bg_night_cover', nc)):
        s = im.copy()
        s.thumbnail((540, 960))
        s.save(os.path.join(OUT, f'{name}_small.jpg'), quality=85)
    print('wrote', OUT)


if __name__ == '__main__':
    main()

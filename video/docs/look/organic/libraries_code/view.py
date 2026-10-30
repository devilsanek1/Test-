"""Quick look: a result beside v6 and the design, on the piece's own background, at 1:1 and at phone width."""
import sys, numpy as np
from PIL import Image
L = '/tmp/organic/libraries'
def on_bg(name, rgba):
    if name == 'cloud':
        bg = Image.open(f'{L}/inputs/cloud_sky_v6.png').convert('RGBA')
    else:
        bg = Image.new('RGBA', rgba.size, (185, 128, 106, 255))
    bg = bg.copy(); bg.alpha_composite(rgba.convert('RGBA')); return bg.convert('RGB')
def look(name, paths, out, scale=1.0):
    ims = [on_bg(name, Image.open(p)) for p in paths]
    if scale != 1.0:
        ims = [im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS) for im in ims]
    W = sum(im.width for im in ims) + 8 * (len(ims) - 1); H = max(im.height for im in ims)
    sheet = Image.new('RGB', (W, H), (255, 255, 255)); x = 0
    for im in ims: sheet.paste(im, (x, 0)); x += im.width + 8
    sheet.save(out)
if __name__ == '__main__':
    name, out = sys.argv[1], sys.argv[2]; scale = float(sys.argv[3]); paths = sys.argv[4:]
    look(name, paths, out, scale)

# coverage.py <frame.png> <t> : ink/tealDark coverage in the city band (screen y 985 .. coping) outside the board
import json, subprocess, sys
import numpy as np
from PIL import Image
SP = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad'
def cov(path, t):
    im = np.asarray(Image.open(path).convert('RGB')).astype(int)
    h, w, _ = im.shape
    a = w / 1080
    probe = json.loads(subprocess.check_output(['node', f'{SP}/camprobe.cjs', str(t)], cwd='/home/user/Test-/video').decode().strip().splitlines()[-1])
    bx0, by0, bx1, by1 = probe['board']
    cop = min(probe['coping'])
    y0, y1 = 985, cop
    ys, xs = np.mgrid[0:h, 0:w]
    X = xs / a; Y = ys / a
    region = (Y >= y0) & (Y < y1)
    board = (X >= bx0) & (X <= bx1) & (Y >= by0)
    m = region & ~board
    def near(c, tol=26):
        c = np.array([int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)])
        return (np.abs(im - c).sum(axis=2) <= tol)
    dark = near('#2B1B0A') | near('#3E605F') | near('#2F4A49')
    luma = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
    global LUMA
    LUMA = ((luma < 95) & m).sum() / m.sum()
    tot = m.sum()
    d = (dark & m).sum()
    # sub-regions
    left = m & (X < bx0); right = m & (X > bx1); top = m & (Y < by0) & (X >= bx0) & (X <= bx1)
    f = lambda r: (dark & r).sum() / max(1, r.sum())
    return d / tot, f(left), f(right), f(top)
for p, t in zip(sys.argv[1::2], sys.argv[2::2]):
    c, l, r, tp = cov(p, float(t))
    print(f'{p.split("/")[-1]} t={t}: dark {c*100:.1f}% (left {l*100:.1f}, right {r*100:.1f}, above board {tp*100:.1f}); luma<95 {LUMA*100:.1f}%')

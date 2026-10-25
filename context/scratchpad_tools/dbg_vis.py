import sys, qalib as Q, cv2, numpy as np
path, out = sys.argv[1], sys.argv[2]
frames = [int(x) for x in sys.argv[3].split(',')]
band = (280, 600) if len(sys.argv) < 5 else tuple(int(v) for v in sys.argv[4].split(','))
src = Q.FrameSource(path)
want = set(frames) | {f + 1 for f in frames}
fr = {}
for i, im in src:
    if i in want: fr[i] = im
    if i > max(want): break
mask = np.ones((src.ah, src.aw), np.uint8) * 255
mask[int(band[0] * src.a):int(band[1] * src.a)] = 0
cam = Q.Camera(src.aw, src.ah, mask)
tiles = []
for a in frames:
    fa = cam.features(cv2.cvtColor(fr[a], cv2.COLOR_BGR2GRAY)); fb = cam.features(cv2.cvtColor(fr[a + 1], cv2.COLOR_BGR2GRAY))
    ms, info = cam.models(fa, fb)
    res = Q.residual(fr[a], fr[a + 1], ms, Q.DEFAULTS)
    m, lab, st, n = Q.drop_small(res.changed & (mask > 0), 6)
    vis = fr[a + 1].copy(); vis[m] = (255, 0, 255)
    print(a, info, res.model, [tuple(round(v, 5) for v in Q.sim_params(M)) for M in ms], m.sum() * 4)
    tiles.append(vis)
cv2.imwrite(out, np.hstack(tiles))

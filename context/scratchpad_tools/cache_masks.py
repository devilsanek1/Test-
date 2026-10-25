import sys, math, numpy as np, cv2
sys.path.insert(0, '/home/user/Test-/video/scripts/qa')
import qalib as Q
path, out = sys.argv[1], sys.argv[2]
band = tuple(int(v) for v in sys.argv[3].split(','))
src = Q.FrameSource(path)
a = src.a; aw, ah = src.aw, src.ah
bm = np.zeros((ah, aw), bool); bm[int(band[0]*a):int(band[1]*a)] = True
cam = Q.Camera(aw, ah, (~bm).astype(np.uint8)*255)
opt = dict(Q.DEFAULTS)
masks = []; prev = pf = pg = None
for i, img in src:
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); f = cam.features(g); gm = Q.grad_mag(img)
    if prev is None:
        masks.append(np.packbits(np.zeros((ah, aw), bool)))
    else:
        ms, _ = cam.models(pf, f)
        r = Q.residual(prev, img, ms, opt, gprev=pg)
        masks.append(np.packbits(r.changed & ~bm))
    prev, pf, pg = img, f, gm
np.savez_compressed(out, masks=np.array(masks), shape=(ah, aw), a=a, fps=src.fps)
print('done', len(masks))

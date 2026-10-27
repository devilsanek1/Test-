import cv2, numpy as np, sys, json
path, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS)
prev=None; res=[]; i=0
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.resize(f, (135, 240) if f.shape[0]>f.shape[1]*1.5 else (135,169), interpolation=cv2.INTER_AREA)
    lab = cv2.cvtColor(g, cv2.COLOR_BGR2LAB).astype(np.float32)
    if prev is not None:
        d = np.abs(lab-prev).mean(axis=2)
        res.append([i/fps, float(d.mean()), float((d>12).mean())])
    prev=lab; i+=1
json.dump({'fps':fps,'d':res}, open(out,'w'))
print(path, fps, i)

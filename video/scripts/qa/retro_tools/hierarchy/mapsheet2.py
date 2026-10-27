"""Diagnostic sheet: grey frame, red = motion energy (camera removed), cyan contour = top-8 % static salience,
yellow = subject box, magenta = Pip box. usage: mapsheet.py out.jpg ids..."""
import sys, json, numpy as np, cv2
sys.path.insert(0, '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/hierarchy/tools')
from analyse import CFG, D
R = json.load(open(D + 'maps/results.json')); M2 = json.load(open(D + 'maps/motion2.json'))
out, ids = sys.argv[1], sys.argv[2:]
W = 290; tiles = []
for i in ids:
    b = np.load(D + 'frames/%s_burst.npy' % i); mid = b[len(b) // 2]
    S = np.load(D + 'maps/%s_S.npy' % i); E = np.load(D + 'maps/%s_M.npy' % i).astype(np.float32) * 40
    g = cv2.cvtColor(mid, cv2.COLOR_RGB2GRAY).astype(np.float32)
    base = (100 + g * 0.45)
    img = np.dstack([base] * 3)
    e = np.clip(E / 12, 0, 1)
    img[..., 0] = img[..., 0] * (1 - e) + 255 * e; img[..., 1] *= (1 - e); img[..., 2] *= (1 - e)
    img = img.astype(np.uint8).copy()
    thr = np.percentile(S, 92)
    cs, _ = cv2.findContours((S > thr).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(img, cs, -1, (0, 220, 255), 2)
    H, Wd = mid.shape[:2]
    for x0, y0, x1, y1 in CFG[i]['subj']:
        cv2.rectangle(img, (int(x0 * Wd), int(y0 * H)), (int(x1 * Wd), int(y1 * H)), (255, 230, 0), 3)
    if 'pip' in R[i]:
        x0, y0, x1, y1 = R[i]['pip']['box']; cv2.rectangle(img, (x0, y0), (x1, y1), (255, 0, 255), 3)
    for j, m in enumerate(M2[i]['top'][:6]):
        x0, y0, x1, y1 = m['box']; cv2.rectangle(img, (x0, y0), (x1, y1), (0, 255, 0) if j == 0 else (255, 150, 0), 2)
    img = cv2.resize(img, (W, int(W * H / Wd)), interpolation=cv2.INTER_AREA)
    cv2.rectangle(img, (0, img.shape[0] - 16), (W, img.shape[0]), (0, 0, 0), -1)
    cv2.putText(img, '%s mov%d %.0f%%' % (i, M2[i]['movers'], M2[i]['motion_px']), (3, img.shape[0] - 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1)
    tiles.append(img)
cols = min(7, len(tiles)); rows = (len(tiles) + cols - 1) // cols; Hm = max(t.shape[0] for t in tiles)
S_ = np.full((rows * (Hm + 4), cols * (W + 4), 3), 40, np.uint8)
for k, t in enumerate(tiles):
    y = (k // cols) * (Hm + 4); x = (k % cols) * (W + 4); S_[y:y + t.shape[0], x:x + W] = t
cv2.imwrite(out, cv2.cvtColor(S_, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85])

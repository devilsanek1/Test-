"""Silhouette separation: the subject (or a near mass) against what is right behind it.
python3 -I run_sep.py <frames_dir> <out_dir> <tools_dir>"""
import json, sys
import numpy as np, cv2
sys.path.insert(0, sys.argv[3])
import depth_measure as dm

dm.FR, OUT = sys.argv[1], sys.argv[2]


def grabcut(bgr, rect, iters=6):
    H, W = bgr.shape[:2]
    x0, y0, x1, y1 = rect
    r = (int(x0 * W), int(y0 * H), int((x1 - x0) * W), int((y1 - y0) * H))
    mask = np.zeros((H, W), np.uint8)
    bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, mask, r, bg, fg, iters, cv2.GC_INIT_WITH_RECT)
    m = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)
    n, lab_, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n > 1:
        k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        m = lab_ == k
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
    return m


# (frame, label, mask spec, roi boxes, roi-exclude boxes)
CASES = [
    ('look_5.4', 'wing west edge vs far city + gold band (owner: "Google office vs the building in the background")',
     dict(poly=[(0.3046, 0.30), (1.0, 0.30), (1.0, 0.565), (0.3046, 0.565)]), [(0.25, 0.318, 0.36, 0.484)], []),
    ('look_5.4', 'wing west edge, the part below the far roofs (y 760-930)',
     dict(poly=[(0.3046, 0.30), (1.0, 0.30), (1.0, 0.565), (0.3046, 0.565)]), [(0.25, 0.395, 0.36, 0.484)], []),
    ('look_5.4', 'wing west edge, the part against the gold band (y 610-760)',
     dict(poly=[(0.3046, 0.30), (1.0, 0.30), (1.0, 0.565), (0.3046, 0.565)]), [(0.25, 0.318, 0.36, 0.395)], []),
    ('look_5.4', 'her (tier A) vs the wing wall behind her', dict(grab=(0.440, 0.481, 0.500, 0.576)), [(0.40, 0.46, 0.54, 0.575)], []),
    ('look_5.4', 'the ghost row (tier A) vs the far city + bridge', dict(grab=(0.035, 0.479, 0.425, 0.572)), [(0.0, 0.47, 0.44, 0.555)], []),
    ('look_0.5', 'the glass door (tier A at 0.5 s) vs the wing wall', dict(poly=[(0.497, 0.440), (0.669, 0.440), (0.669, 0.565), (0.497, 0.565)]), [(0.47, 0.42, 0.70, 0.556)], []),
    ('r1_17.5', 'the shelter (subject) vs facades + plaza', dict(poly=[(0.162, 0.486), (0.494, 0.486), (0.494, 0.70), (0.162, 0.70)]), [(0.13, 0.45, 0.52, 0.685)], [(0.37, 0.40, 0.47, 0.53)]),
    ('r1_17.5', 'near heads (backs) vs plaza', dict(grab=(0.505, 0.598, 0.88, 0.705)), [(0.48, 0.58, 0.90, 0.69)], []),
    ('v1_1.0', 'near buildings vs far city + sun', dict(poly=[(0.0, 0.30), (0.600, 0.30), (0.600, 0.75), (0.0, 0.75)], poly2=[(0.742, 0.33), (1.0, 0.33), (1.0, 0.75), (0.742, 0.75)]), [(0.56, 0.50, 0.78, 0.575)], []),
    ('v1_10.0', 'the PHP house (subject) vs sky + side streets', dict(grab=(0.31, 0.36, 0.72, 0.625)), [(0.28, 0.33, 0.75, 0.60)], []),
    ('v1_20.5', 'the walker (subject) vs door + street', dict(grab=(0.44, 0.655, 0.645, 0.805)), [(0.40, 0.64, 0.55, 0.80)], []),
    ('v1_25.5', 'near heads (backs) vs wall + ground', dict(grab=(0.10, 0.835, 0.40, 1.0)), [(0.05, 0.82, 0.45, 0.99)], []),
]

res = []
for name, label, spec, roi, rex in CASES:
    bgr, lab = dm.load(name)
    H, W = lab.shape[:2]
    if 'grab' in spec:
        m = grabcut(bgr, spec['grab'])
    else:
        m = dm.polymask(lab.shape, spec['poly'])
        if 'poly2' in spec:
            m |= dm.polymask(lab.shape, spec['poly2'])
    roim = dm.boxmask(lab.shape, roi) & ~dm.boxmask(lab.shape, rex)
    r = dm.separation(lab, m, roim)
    r.update(frame=name, label=label)
    res.append(r)
    ov = bgr.copy()
    cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(ov, cnts, -1, (255, 0, 255), 1)
    for x0, y0, x1, y1 in roi:
        cv2.rectangle(ov, (int(x0 * W), int(y0 * H)), (int(x1 * W) - 1, int(y1 * H) - 1), (0, 200, 0), 1)
    cv2.imwrite(f"{OUT}/sep_{name}_{len(res)}.png", ov)

json.dump(res, open(f'{OUT}/sep.json', 'w'), indent=1)
print(f"{'frame':9s} {'n':>4} {'|dL|med':>7} {'p25':>5} {'dEmed':>6} {'sgn dL':>6} {'dC':>5} {'sameV':>5} {'sameC':>5} {'noLine':>6} {'line':>5} {'far|dL|':>7} {'far dE':>6} {'sameFar':>7} {'run':>4}  label")
for r in res:
    print(f"{r['frame']:9s} {r['n']:4d} {r['dL_med']:7.1f} {r['dL_p25']:5.1f} {r['dE_med']:6.1f} {r['signed_dL_med']:6.1f} {r['dC_med']:5.1f} {r['same_value']:5.2f} {r['same_colour']:5.2f} {r['same_value_noline']:6.2f} {r['line_share']:5.2f} {r['dLfar_med']:7.1f} {r['dEfar_med']:6.1f} {r['same_far']:7.2f} {r['longest_same_run_px']:4d}  {r['label']}")

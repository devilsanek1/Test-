"""Per-plane colour, contrast and detail (near -> far), with the air colour behind the farthest plane.
python3 -I run_planes.py <frames_dir> <out_dir>"""
import json, sys
import numpy as np, cv2
sys.path.insert(0, sys.argv[3] if len(sys.argv) > 3 else '.')
import depth_measure as dm

dm.FR, OUT = sys.argv[1], sys.argv[2]
SUN = dm.hexlab('#EE6A2E')

# name: (air boxes, [(plane name, boxes, exclude boxes)] near -> far, caption boxes)
LOOK_PLANES = [
    ('near treads (bike, planter)', [(0.0, 0.87, 1.0, 1.0)], []),
    ('mid treads (props)', [(0.0, 0.685, 1.0, 0.865)], []),
    ('landing (seated public)', [(0.0, 0.64, 1.0, 0.68)], [(0.60, 0.59, 0.74, 0.685)]),
    ('canal water', [(0.0, 0.59, 0.70, 0.628)], []),
    ('far towpath + row', [(0.0, 0.49, 0.72, 0.565)], []),
    ('wing facade (the main focus)', [(0.31, 0.315, 1.0, 0.49)], []),
    ('far city front row', [(0.035, 0.43, 0.30, 0.484)], []),
    ('far city back rows', [(0.035, 0.392, 0.30, 0.425)], []),
]
CFG = {
    'look_5.4': dict(air=[(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)], sky=[(0.30, 0.01, 0.58, 0.08)], planes=LOOK_PLANES),
    'look_0.5': dict(air=[(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)], sky=[(0.30, 0.01, 0.58, 0.08)], planes=LOOK_PLANES),
    'look_1.2': dict(air=[(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)], sky=[(0.30, 0.01, 0.58, 0.08)], planes=LOOK_PLANES),
    'look_3.0': dict(air=[(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)], sky=[(0.30, 0.01, 0.58, 0.08)], planes=LOOK_PLANES),
    'r1_17.5': dict(air=[(0.32, 0.115, 0.56, 0.16)], sky=None, planes=[
        ('near: heads (backs)', [(0.51, 0.605, 0.875, 0.70)], []),
        ('subject: shelter + cat', [(0.16, 0.485, 0.495, 0.695)], []),
        ('plaza ground (small people, bikes)', [(0.50, 0.465, 0.85, 0.595)], []),
        ('mid facades', [(0.15, 0.19, 0.74, 0.455)], [(0.53, 0.21, 0.77, 0.31)]),
        ('far: glass tower', [(0.75, 0.20, 0.85, 0.45)], []),
    ]),
    'r1_15.5': dict(air=[(0.32, 0.115, 0.55, 0.165)], sky=None, planes=[
        ('near: heads (backs)', [(0.51, 0.605, 0.80, 0.70)], []),
        ('plaza ground (small people, bikes)', [(0.15, 0.465, 0.84, 0.59)], []),
        ('mid facades', [(0.15, 0.19, 0.71, 0.45)], []),
        ('far: glass tower', [(0.72, 0.20, 0.84, 0.44)], []),
    ]),
    'r1_1.0': dict(air=[(0.58, 0.112, 0.70, 0.165)], sky=None, planes=[
        ('near: left facades + bikes', [(0.145, 0.13, 0.32, 0.67)], []),
        ('near: right glass building', [(0.72, 0.15, 0.84, 0.32)], []),
        ('mid: left facades along the street', [(0.40, 0.19, 0.50, 0.40)], []),
        ('far: street end', [(0.54, 0.22, 0.66, 0.36)], []),
        ('street ground near (markers)', [(0.36, 0.53, 0.70, 0.65)], []),
        ('street ground far (crowd)', [(0.53, 0.37, 0.64, 0.46)], []),
    ]),
    'v1_1.0': dict(air=[(0.05, 0.02, 0.95, 0.14)], sky=None, planes=[
        ('near: "you" + plaza', [(0.0, 0.84, 1.0, 1.0)], []),
        ('plaza + small people', [(0.0, 0.76, 1.0, 0.83)], []),
        ('government buildings (subject)', [(0.0, 0.32, 0.58, 0.75), (0.75, 0.37, 1.0, 0.75)], []),
        ('far city', [(0.60, 0.505, 0.74, 0.57)], []),
    ]),
    'v1_25.5': dict(air=[(0.0, 0.468, 0.20, 0.49)], sky=None, planes=[
        ('near: heads (backs)', [(0.10, 0.86, 0.40, 1.0), (0.80, 0.86, 1.0, 1.0)], []),
        ('near wall (parapet)', [(0.0, 0.72, 1.0, 0.84)], []),
        ('mid city (teal blocks)', [(0.08, 0.565, 0.92, 0.66)], [(0.22, 0.62, 0.37, 0.70)]),
        ('far city (pale)', [(0.0, 0.505, 0.40, 0.55)], []),
    ]),
    'v1_38.5': dict(air=[(0.05, 0.02, 0.95, 0.14)], sky=None, planes=[
        ('near ground (plaza)', [(0.03, 0.835, 0.85, 1.0)], []),
        ('near rows', [(0.02, 0.70, 0.95, 0.80)], []),
        ('mid rows', [(0.02, 0.555, 0.95, 0.655)], []),
        ('far rows', [(0.02, 0.465, 0.95, 0.53)], []),
        ('farthest rows', [(0.05, 0.405, 0.95, 0.455)], []),
    ]),
    'v1_10.0': dict(air=[(0.05, 0.02, 0.95, 0.15)], sky=None, planes=[
        ('near: side walls', [(0.0, 0.35, 0.10, 0.85), (0.90, 0.35, 1.0, 0.85)], []),
        ('ground near', [(0.05, 0.85, 0.95, 1.0)], []),
        ('mid: side walls', [(0.18, 0.40, 0.30, 0.65), (0.73, 0.40, 0.84, 0.65)], []),
        ('ground far', [(0.30, 0.63, 0.70, 0.68)], []),
        ('far: the PHP house (subject)', [(0.33, 0.40, 0.70, 0.62)], []),
    ]),
}

res = {}
for name, cfg in CFG.items():
    bgr, lab = dm.load(name)
    sunm = np.linalg.norm(lab - SUN, axis=2) < 25
    air = lab[dm.boxmask(lab.shape, cfg['air']) & ~sunm].mean(0)
    sky = lab[dm.boxmask(lab.shape, cfg['sky'])].mean(0) if cfg.get('sky') else None
    rows = []
    ov = bgr.copy()
    H, W = lab.shape[:2]
    cols = [(0, 0, 255), (0, 140, 255), (0, 220, 220), (0, 200, 0), (255, 160, 0), (255, 0, 0), (200, 0, 200), (120, 0, 120)]
    for i, (pn, boxes, exb) in enumerate(cfg['planes']):
        m = dm.boxmask(lab.shape, boxes) & ~dm.boxmask(lab.shape, exb) & ~sunm
        st = dm.stats(lab, m, air)
        st['plane'] = pn
        rows.append(st)
        for x0, y0, x1, y1 in boxes:
            cv2.rectangle(ov, (int(x0 * W), int(y0 * H)), (int(x1 * W) - 1, int(y1 * H) - 1), cols[i % len(cols)], 2)
            cv2.putText(ov, str(i + 1), (int(x0 * W) + 3, int(y0 * H) + 12), cv2.FONT_HERSHEY_SIMPLEX, 0.4, cols[i % len(cols)], 1)
    for x0, y0, x1, y1 in cfg['air']:
        cv2.rectangle(ov, (int(x0 * W), int(y0 * H)), (int(x1 * W) - 1, int(y1 * H) - 1), (255, 255, 255), 2)
    cv2.imwrite(f'{OUT}/planes_{name}.png', ov)
    res[name] = dict(air=[float(v) for v in air], airC=float(np.hypot(air[1], air[2])), sky=None if sky is None else [float(v) for v in sky], planes=rows)

json.dump(res, open(f'{OUT}/planes.json', 'w'), indent=1)
for name, r in res.items():
    a = r['air']
    print(f"\n{name}: air L {a[0]:.1f} C {r['airC']:.1f} h {np.degrees(np.arctan2(a[2], a[1])) % 360:.0f}")
    print(f"  {'plane':38s} {'L':>5} {'C':>5} {'C90':>5} {'h':>4} {'Lp5':>5} {'Lrng':>5} {'LC':>5} {'edge':>5} {'dEair':>6}")
    for p in r['planes']:
        print(f"  {p['plane'][:38]:38s} {p['L']:5.1f} {p['C']:5.1f} {p['C90']:5.1f} {p['h']:4.0f} {p['Lp5']:5.1f} {p['Lrange']:5.1f} {p['LC']:5.2f} {p['edge']:5.3f} {p['dEair']:6.1f}")

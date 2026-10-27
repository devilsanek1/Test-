"""Size gradient: px per metre of things of known size against their base's height below the horizon, and the eye
ratio (feet y - horizon) / height of people (one camera = one ratio per ground plane). Sizes in 1080 x 1920 px: from the
scene code (S1_SHEET, V2S1_public LOW / FOOT, the ducks in V2S1_set) and from zoomed crops (references: eye estimates).
python3 -I run_scale.py"""

# (label, plane, base y, drawn px, real metres, kind) ; kind 'person' = standing height, 'seated' = seated height
G4 = dict(horizon=965, objs=[  # the G4 look clip; horizon = V2S1_steps_stone BANK.vp (540, 965) as built then
    ('wing: ground storey', 'far bank', 1082, 288, 3.2, 'thing'),
    ('wing: glass door', 'far bank', 1082, 234, 2.6, 'thing'),
    ('her', 'far towpath', 1095, 170, 1.70, 'person'),
    ('ducks (3)', 'water', 1182, 24, 0.58, 'thing'),
    ('seated public (7)', 'our landing', 1292, 60, 0.95, 'seated'),
    ('cup A', 'tread 1', 1384, 26, 0.15, 'thing'),
    ('tote', 'tread 2', 1486, 58, 0.40, 'thing'),
    ('backpack', 'tread 2', 1492, 66, 0.45, 'thing'),
    ('cup B', 'tread 3', 1642, 38, 0.15, 'thing'),
    ('skateboard (length)', 'tread 3', 1640, 130, 0.80, 'thing'),
    ('guitar case (length)', 'tread 4', 1820, 190, 1.05, 'thing'),
    ('bike (height)', 'tread 5', 1912, 230, 1.00, 'thing'),
])
NOW = dict(horizon=1000, objs=[  # the code at 874799d (L1's ground pass); horizon = GROUND_VP y 1000
    ('her', 'far towpath', 1095, 170, 1.70, 'person'),
    ('ducks (3)', 'water', 1180, 24, 0.58, 'thing'),
    ('seated public, x 64', 'our landing (far end)', 1196, 43, 0.95, 'seated'),
    ('seated public, x 500', 'our landing', 1269, 58, 0.95, 'seated'),
    ('seated public, x 986', 'our landing (near end)', 1351, 76, 0.95, 'seated'),
    ('cafe table (height)', 'tread 4', 1696, 130, 0.75, 'thing'),
    ('tote', 'terrace', 1760, 56, 0.40, 'thing'),
])
R1 = dict(horizon=464, objs=[  # reference 1 @6.0 s (1080 x 1350), heads in the crowd (diameter, eye estimate), VP y 464
    ('head, near row', 'street', 800, 45, 0.22, 'thing'),
    ('head, mid row', 'street', 640, 22, 0.22, 'thing'),
    ('head, far row', 'street', 560, 12, 0.22, 'thing'),
    ('head, farthest', 'street', 515, 6, 0.22, 'thing'),
])
V1 = dict(horizon=1008, objs=[  # v1 @20.5 s, the side street's walkers (eye estimate), VP y 1008
    ('far walker', 'street', 1118, 45, 1.70, 'person'),
    ('walker, backpack', 'street', 1243, 103, 1.70, 'person'),
    ('walker, beanie', 'street', 1300, 143, 1.70, 'person'),
    ('the walker (subject)', 'street', 1530, 272, 1.70, 'person'),
])


def report(name, d):
    h = d['horizon']
    print(f'\n{name} (horizon y {h})')
    print(f"  {'thing':24s} {'plane':22s} {'base y':>6} {'below':>6} {'px/m':>6} {'px/m per 100 px below':>22} {'eye ratio':>9}")
    prev = None
    for lab, plane, y, px, m, kind in d['objs']:
        ppm = px / m
        below = y - h
        k = ppm / below * 100 if below > 0 else float('nan')
        eye = ''
        if kind == 'person':
            eye = f'{below / px:9.2f}'
        elif kind == 'seated':
            eye = f'{below / (px / 0.55):9.2f}'  # seated height ~0.55 of standing
        print(f'  {lab:24s} {plane:22s} {y:6d} {below:6d} {ppm:6.0f} {k:22.1f} {eye}')


for n, d in (('G4 look clip (S1)', G4), ('S1 code now (874799d)', NOW), ('reference 1 @6.0', R1), ('v1 @20.5', V1)):
    report(n, d)

from sb_common import *

SPANS = {
    'S01': {(1, -0.10): 1.0, (13, -0.10): 0.12, (14, -0.05): 0.6, (0, -0.03): 0.18, (2, -0.05): 0.12},
    'S02': {(15, -0.04): 0.6, (20, -0.10): 0.35, (26, 0): 0.3, (28, 0.32): 0.3},
    'S03': {(32, -0.05): 0.48, (34, -0.10): 0.5, (38, 0): 0.48, (41, -0.10): 0.15, (42, 0): 0.12, (35, 0.30): 0.5},
    'S04': {(50, 0.05): 0.95},
    'S05': {(56, -0.05): 0.2, (56, 0.30): 0.2, (58, 0.25): 0.36},
    'S07': {(75, -0.10): 0.16, (76, 0): 1.2, (78, -0.04): 0.8},
    'S08': {(81, 0.10): 0.6, (84, -0.10): 0.3, (85, -0.10): 0.3, (87, -0.10): 0.28, (89, -0.25): 0.5, (92, 0): 0.3, (98, 0): 0.4, (100, 0): 0.3, (105, -0.05): 0.6, (108, -0.15): 0.55, (109, 0): 0.6},
    'S09': {(113, 0): 0.55, (118, -0.10): 0.3, (121, 0): 0.3, (123, 0): 0.15, (125, -0.05): 0.64, (126, 0): 0.3},
    'S10': {(129, -0.10): 0.2, (130, 0): 0.32, (133, -0.10): 0.5, (135, -0.05): 0.35, (141, 0): 0.7, (142, 0): 0.4, (143, 0): 0.3},
    'S11': {(146, -0.10): 0.16, (151, 0): 0.75, (160, 0): 0.5},
    'S12': {(168, 0): 0.15, (173, -0.05): 0.6, (174, 0): 0.58, (175, 0): 0.45},
}
ADD = {
    'S01': [B(A(12, 0.28), "govB's dome lantern light pops off (cream -> sand); a pigeon circles back to the lamp.", 2)],
    'S02': [B(A(21, 0), "'could': Bit's antennae flatten; the connector's dashes march one step toward the icon.", 2)],
    'S03': [B(A(31, 0.78), "Ellipsis beat: Pip settles on the stamp after his bounce; the sun gives a small +4% pulse.", 2),
            B(A(42, 0.30), "The two near walkers turn their heads toward the press house; a far walker waves.", 2)],
    'S06': [B(A(68, 0.28), "A neighbour's curtain is drawn (1-frame pop); the messenger reaches the workshop door.", 2)],
    'S08': [B(A(84, 0.25), "The crane passes the parapet coping: chimney pots slide by (parallax); rattle marks pop at two doors.", 2),
            B(A(89, 0.40), "Glint bars sweep once across the new glass; two near rattlers rattle again (marks).", 3),
            B(A(95, 0.30), "The ticker rolls its first clicks; the searchlight crosses the dome's crown.", 2)],
    'S09': [B(A(114, 0), "'with': the lamp-post pigeons wake and hop; a cream rim strip pops on the hero facade (first light).", 2)],
    'S10': [B(A(134, -0.30), "The half pie settles (its spoke retracts); a second-row window lights.", 2),
            B(A(139, 0), "\"they're\": the old emblem's ear droops; a dust speck drifts down.", 2)],
    'S11': [B(A(146, 0.25), "The loading ring keeps spinning; Pip's ear flicks toward the notice.", 2),
            B(A(148, 0), "'if': the bar's fill edge flickers without moving forward.", 1),
            B(A(149, 0), "'you': the snail's shell appears at the sill's right edge.", 1),
            B(A(152, 0.25), "Pip glances from the bar up to the sun (look 0.7).", 1),
            B(A(159, 0.30), "The tag settles; the notice's pins glint once.", 2),
            B(A(161, 0), "\"support's\": the snail pokes one antenna out of its shell.", 1),
            B(A(163, 0), "'to': the sun's glyph glints (two ink ticks).", 1)],
    'S12': [B(A(169, 0.25), "A pigeon flaps; govA's tag twirls once more.", 2)],
}


def apply(scenes):
    by = {s['id']: s for s in scenes}
    for sid, sp in SPANS.items():
        for b in by[sid]['beats']:
            k = (b['t']['w'], b['t']['dt'])
            if k in sp:
                b['span'] = sp.pop(k)
        assert not sp, (sid, sp)
    for sid, beats in ADD.items():
        by[sid]['beats'] += beats
    for s in scenes:
        s['beats'].sort(key=lambda b: est(b['t']))
    # fixes
    s11 = by['S11']
    for c in s11['camera']:
        if c['to'] == {'x': 522, 'y': 836, 'zoom': 1.71}: c['to'] = {'x': 522, 'y': 832, 'zoom': 1.71}
        if c['from'] == {'x': 522, 'y': 836, 'zoom': 1.71}: c['from'] = {'x': 522, 'y': 832, 'zoom': 1.71}
    s08 = by['S08']
    for b in s08['beats']:
        if b['action'].startswith('STAMP 2'): b['t'] = A(108, -0.10)
    for l in s08['labels']:
        if l['id'] == 'L11': l['at'] = A(108, -0.10)
    for x in s08['sfx']:
        if x['notes'].endswith('stamp 2'): x['t'] = A(108, -0.10)
    s08['beats'].sort(key=lambda b: est(b['t']))


SKY = {
    'S01': [{'t': START, 'tod': 'day'}],
    'S02': [{'t': A(15, -0.04), 'tod': 'day'}],
    'S03': [{'t': A(29, -0.08), 'tod': 'day'}],
    'S04': [{'t': A(46, -0.15), 'tod': 'day'}],
    'S05': [{'t': A(55, 0), 'tod': 'day'}],
    'S06': [{'t': A(65, -0.25), 'tod': 'golden', 'wipe': 'snap', 'note': 'golden arrives with the cut on action'}],
    'S07': [{'t': A(72, -0.06), 'tod': 'golden'}],
    'S08': [{'t': A(81, -0.10), 'tod': 'golden'}, {'t': A(109, 0.02), 'tod': 'dusk', 'wipe': 'down', 'dur': 0.35, 'note': "the one sunset: golden -> sage, top-down, on 'within'"}],
    'S09': [{'t': A(112, -0.40), 'tod': 'dusk', 'note': "S08's last sky, matched across the cut"}, {'t': A(112, -0.25), 'tod': 'dawn', 'wipe': 'up', 'dur': 0.35, 'note': 'bright cream + peach band, bottom-up'},
            {'t': A(120, -0.05), 'tod': 'day', 'wipe': 'snap', 'note': 'full day from the hidden match-cut (Part B)'}],
    'S10': [{'t': A(128, -0.10), 'tod': 'day'}],
    'S11': [{'t': A(144, -0.30), 'tod': 'day'}],
    'S12': [{'t': A(165, -0.12), 'tod': 'day'}],
}


def apply2(scenes):
    for s in scenes:
        s['sky'] = SKY[s['id']]
        s['captionTone'] = [{'t': s['start'], 'tone': 'dark', 'note': 'ink on every v3 sky (ink on the sage dusk is 5:1); no tone switch'}]
    by = {s['id']: s for s in scenes}
    by['S02']['bit'] = {'where': "in the lock slot, drawn in the same ink as the blueprint: camouflaged as a detail of the lock drawing until 'bug', when he peeks out (he ducks again on 'over')",
                        'game': 'hidden in the drawing for the first 0.7 s; the eye finds him only when he moves'}

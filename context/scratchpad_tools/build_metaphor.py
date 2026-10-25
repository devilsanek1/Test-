#!/usr/bin/env python3
"""Builds docs/storyboard_drafts/metaphor.json and validates it (timing, captions, VO coverage)."""
import json, re, sys

OUT = '/home/user/Test-/video/docs/storyboard_drafts/metaphor.json'
WORDS = '/home/user/Test-/video/assets/vo_words_raw.json'

# ---------- corrected word list ----------
raw = json.load(open(WORDS))['words']
SPLIT = {
    'about7': [('about', 0.0), ('7', 0.32)],
    'of10': [('of', 0.0), ('10', 0.12)],
    'for14': [('for', 0.0), ('14', 0.24)],
    'in45': [('in', 0.0), ('45', 0.16)],
    'about22': [('about', 0.0), ('22', 0.32)],
    'aversion': [('a', 0.0), ('version', 0.12)],
}
words = []
for w in raw:
    if w['w'] in SPLIT:
        for tok, off in SPLIT[w['w']]:
            words.append({'w': tok, 's': round(w['s'] + off, 2)})
    else:
        words.append({'w': w['w'], 's': w['s']})

def norm(s):
    return re.sub(r"[^a-z0-9' ]", '', s.lower().replace('-', ' ')).split()

def vo_between(a, b):
    return ' '.join(w['w'] for w in words if a - 1e-6 <= w['s'] < b - 1e-6)

def cap(s, e, lines, hl=None):
    c = {'s': s, 'e': e, 'lines': [{'text': t, 's': ts} for t, ts in lines], 'highlights': []}
    if hl:
        c['highlights'].append({'text': hl[0], 's': hl[1]})
    return c

PHP = 'mascot.body (periwinkle #8D90CC, request theme key `php`)'

scenes = []

# =====================================================================================
scenes.append({
    'id': 'S01', 'start': 0.0, 'end': 4.78,
    'title': 'Capitol lights out',
    'transitionIn': {'type': 'loop-start', 'dur': 0.5, 'persist': ['sun', 'mascot', 'govRow'],
        'notes': 'Frame 0 = the exact state the S13 un-build lands on: full plaza line art (ink + card-white fills that occlude), sun 40% risen behind the govB/govC roofline at (480,340), Nell sit-back at (760,1050), caption line 1 "Government websites" already set. The sun rises to home by 0.5 s; color floods in from 0.16.'},
    'setting': 'A civic plaza in the city-that-is-the-web: four government buildings side by side, one per country. Every building in this film is a website, so each wears a browser address-bar sign on its frieze.',
    'composition': 'Frontal, eye-level, like the reference noticeboard shot but wide. Sky block (bg) y 95-820. Four facades share a ground line at y 820, slots: govA x 82-272, govB x 280-478, govC x 486-676, govD x 684-878 (these SLOTS are reused by S11 and S12/S13, which is what makes the loop work). Plaza (mintPale) y 820-1095 with paving lines converging on (480,600) and three low civic steps y 820-860. Foreground props hug the bottom corners so the facades stay readable. Palette: cream/peach/tan/sage walls, tealDark doors, flags in abstract palette designs, sun orange only on the disc.',
    'elements': [
        {'id': 'sky', 'what': 'flat sky block', 'where': '70,95,820,725', 'style': 'fill bg'},
        {'id': 'plaza', 'what': 'paved plaza + 3 low steps, paving lines to VP (480,600)', 'where': '70,820,820,275', 'style': 'fill mintPale, ink thin'},
        {'id': 'govA', 'what': 'domed hall: 4-column portico, drum, dome, flagpole', 'where': '82,300,190,520 (dome top y300)', 'style': 'walls cream, dome sage, ink'},
        {'id': 'govB', 'what': 'temple court: 6 thin columns, pediment apex (379,360), flagpole on apex', 'where': '280,360,198,460', 'style': 'walls peach, ink'},
        {'id': 'govC', 'what': 'civic hall with clock tower (tower x556-616 to y300, cream clock face r18 at (586,340))', 'where': '486,300,190,520', 'style': 'walls tan, clock cream, ink'},
        {'id': 'govD', 'what': 'modern ministry block, 5x6 window grid, roof flagpole at x850', 'where': '684,410,194,410', 'style': 'walls sage, windows cream, ink'},
        {'id': 'addrPill', 'what': 'x4 browser address-bar signs on the friezes: rounded pill, tiny padlock glyph left, 3 dots right (the "this building is a website" cue, used all film)', 'where': '110x20 each, govA y488, govB y440, govC y486, govD y424', 'style': 'fill cream, ink; dims to grey when off'},
        {'id': 'doors', 'what': 'x4 double front doors with 3 steps', 'where': '60x110 at each slot base centre', 'style': 'fill tealDark, ink'},
        {'id': 'shutters', 'what': 'x4 roll-down shutters (rolled up in a thin housing box above each door at start)', 'where': 'cover each door + ground-floor windows, ~150x170', 'style': 'fill grey, ink ribs every 8 px'},
        {'id': 'caretakers', 'what': 'x4 tiny back-view figures standing inside the lit doorways, one arm up on a pull-cord (they close their own building)', 'where': '26 px tall, in each doorway', 'style': 'fill cream/teal, ink'},
        {'id': 'clockTags', 'what': 'x4 small hanging "back soon" tags with a clock glyph, one per shutter handle (foreshadows "until it can" in S11)', 'where': '18x24 below each shutter', 'style': 'fill cream, ink'},
        {'id': 'flags', 'what': 'x4 abstract flags (no real nations): teal/cream bicolor + peach dot; salmon + cream chevron; sage + tan band; cream + tealDark diagonal', 'where': '46x30 atop each building', 'style': 'palette fills, sine wave'},
        {'id': 'plazaProps', 'what': 'lamp posts (x110, x850), bike rack with 3 bikes (x90-260,y980-1070), bench (x520-640,y960), 5 pigeons, 5 back-view pedestrians', 'where': 'foreground y 880-1080', 'style': 'ink + sparse fills'},
        {'id': 'mascot', 'what': 'Nell, sit-back, looking up at the facades', 'where': '(760,1050) scale 0.9', 'style': 'periwinkle colorway'},
    ],
    'beats': [
        {'t': 0.0, 'action': 'Frame 0: plaza line art (white fills), sun at (480,340) clipped by the roofline, Nell in colour, caption line 1 set. Sun rises to (480,100), 0.5 s, ease outBack (slight overshoot).'},
        {'t': 0.16, 'action': '"Government": fills sweep into the four facades left to right (govA 0.16, govB 0.30, govC 0.44, govD 0.58), each a 0.35 s misregistered wipe; tealDark doors land last.'},
        {'t': 0.56, 'action': '"websites": the four addrPills pop on the friezes (scale 0>1.12>1, 0.08 stagger); windows switch on (cream glow) with a one-frame flicker.'},
        {'t': 1.36, 'action': '"four": flags unfurl one per building (line draw-on then fill, 0.1 stagger), counting one-two-three-four.'},
        {'t': 1.6, 'action': '"countries": pedestrians, pigeons, bench and bikes fill in; pedestrians start slow walk cycles.'},
        {'t': 2.16, 'action': '"just": a caretaker figure appears in each lit doorway (pop), arm up on the pull-cord.'},
        {'t': 2.32, 'action': '"switched": govA shutter rolls down (0.28 s, bounce at the bottom), govA windows crossfade cream>tealDark.'},
        {'t': 2.8, 'action': '"themselves": govB shutter rolls down; 3.04 govC shutter.'},
        {'t': 3.28, 'action': '"off": govD shutter slams; the sun inks a power glyph (0.12 s) and is PRESSED (scale 0.9, 0.18 s, back to 1); every remaining window goes dark; addrPills dim to grey. 3.40-3.60 clockTags pop and swing on the four shutters.'},
        {'t': 3.76, 'action': '"Nobody": pedestrians stop and turn slightly toward the shutters (back views, 6 deg head turn). Power glyph fades out of the sun (0.3 s).'},
        {'t': 4.08, 'action': '"hacked": the tiny padlock glyph in each dimmed addrPill clicks shut with a cream sparkle tick (0.06 stagger): locked and intact, nothing broken. Doors and walls stay pristine.'},
        {'t': 4.48, 'action': '"them": card begins a gentle push toward govB (scale 1>1.04) as the S02 X-ray transition starts at 4.62.'},
    ],
    'sun': 'Rises from behind the roofline (loop seam) to home by 0.5 s; on "off" it becomes a power button and is pressed (the whole capitol goes dark with it); glyph fades by 4.06.',
    'mascot': 'Sit-back at (760,1050), watching like the reference cat. Each shutter makes her flinch (2 px squash, ear flap) in rhythm: 2.32, 2.80, 3.04, 3.28. On "Nobody hacked them" (3.80) she turns to camera into a small shrug (pose shrug, expression meh), reads as "they did it themselves".',
    'sfx': [
        {'t': 0.0, 'sound': 'whoosh', 'notes': 'soft rising air for the sun (must also work as the loop seam)'},
        {'t': 0.16, 'sound': 'pencil', 'notes': 'quick fill scratches, 4 hits'},
        {'t': 0.56, 'sound': 'pop', 'notes': 'x4 tiny pops for addrPills'},
        {'t': 1.36, 'sound': 'paper', 'notes': 'x4 cloth/flag flaps'},
        {'t': 2.32, 'sound': 'shutter', 'notes': 'metal roll-down rattle, x4 at 2.32/2.80/3.04/3.28, rising pitch'},
        {'t': 3.28, 'sound': 'power-off', 'notes': 'deep thunk + hum cut'},
        {'t': 3.45, 'sound': 'click', 'notes': 'tag tinks x4'},
        {'t': 4.08, 'sound': 'click', 'notes': 'x4 small lock clicks'},
    ],
    'captions': [
        cap(0.0, 2.16, [('Government websites', 0.0), ('in four countries', 1.12)], ('four countries', 1.36)),
        cap(2.16, 3.76, [('just switched', 2.16), ('themselves off.', 2.8)], ('off.', 3.28)),
        cap(3.76, 4.78, [('Nobody hacked them.', 3.76)], ('Nobody', 3.76)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S02', 'start': 4.78, 'end': 10.88,
    'title': 'Built from one blueprint',
    'transitionIn': {'type': 'zoom', 'dur': 0.42, 'persist': ['sun', 'mascot', 'govB'],
        'notes': 'X-ray push: 4.62-5.04 the camera pushes into govB (1>1.5) while govB inverts into its own blueprint: fills crossfade to teal, linework crossfades to cream. Neighbours slide out with the push. The building literally turns into what it is built from.'},
    'setting': 'The PHP master blueprint: a teal blueprint sheet of a standard building, stamped with an elephant. Then the city pops up out of it like a pop-up book.',
    'composition': 'Phase A (4.8-7.0): blueprint sheet x 110-850, y 200-780, rotated -1.5 deg, 4 corner tacks, cream grid; on it a cream-line elevation of a generic building with a back door + box lock at (600,560); a callout bubble x 600-820, y 230-420 (magnified lock). Elephant stamp lower right x 720-830, y 690-780. Phase B (7.04-10.88): the sheet slides down and lays flat as a perspective floor (y 780-1000); ten buildings rise from it across x 80-880 on base line y 820, heights 180-460, the tallest (WordPress) centred x 430-530 top y 360. Sun stays home above them.',
    'elements': [
        {'id': 'blueprint', 'what': 'PHP master blueprint sheet (persistent object: reappears S05, S07, S12)', 'where': '110,200,740,580', 'style': 'fill teal, lines cream, grid cream 30%'},
        {'id': 'bpDoor', 'what': 'back door + box lock drawn on the blueprint; bolt stops 8 px short of the strike plate so the door rests ajar', 'where': 'door 540-640 x, 470-700 y; lock at (600,560)', 'style': 'cream line on teal'},
        {'id': 'bugRing', 'what': 'hand-drawn orange ring around the lock (THE bug marker, reused S03, S05, S07)', 'where': 'r 46 around (600,560)', 'style': 'stroke sun 6 px, overshooting loop'},
        {'id': 'calloutBubble', 'what': 'magnified lock: box lock, bolt, visible gap', 'where': '600,230,220,190', 'style': 'fill cream, ink; gap in tealDark'},
        {'id': 'elephantStamp', 'what': 'PHP mark: rounded-rect stamp with an elephant silhouette, trunk up (deliberately Nell-shaped)', 'where': '720,690,110,90', 'style': 'ink ' + PHP + ', slightly rough print'},
        {'id': 'fixer', 'what': 'one back-view caretaker (from S01) with a toolbox, looking up at the sheet', 'where': '140,820,60,160', 'style': 'cream/teal, ink'},
        {'id': 'popCity', 'what': '10 pop-up buildings of varied silhouettes, each with an addrPill', 'where': 'x 80-880, base y 820', 'style': 'cream, peach, tan, sage walls; tealDark doors'},
        {'id': 'bigPress', 'what': 'the WordPress stand-in: tallest building, cream, many identical windows, a pen-nib glyph on its sign (generic "publishing", no logo)', 'where': '430,360,100,460', 'style': 'cream + peach trim'},
        {'id': 'phpPlaques', 'what': '7 elephant plaques on 7 of the 10 bases; the other 3 get plain grey bases', 'where': '28x20 at each base', 'style': PHP + ' / grey'},
        {'id': 'mascot', 'what': 'Nell sitting on the sheet edge', 'where': '(820,1060) scale 0.85', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 4.8, 'action': '"They were fixing": X-ray settles; fixer pops in bottom left, a small wrench icon pops by his shoulder.'},
        {'t': 5.44, 'action': '"security": bpDoor lines brighten; the drawn door creaks ajar 4 deg by itself.'},
        {'t': 5.84, 'action': '"bug": bugRing draws on around the lock (0.3 s, overshoot loop); dashed leader line draws to calloutBubble, which pops (0>1.1>1) showing the gap.'},
        {'t': 6.32, 'action': '"PHP": elephantStamp SLAMS onto the corner (scale 1.4>0.95>1, rot -8>-4 deg, 0.25 s), 4 ink dust ticks, card shakes 4 px for 3 frames.'},
        {'t': 7.04, 'action': '"the programming language": blueprint slides down and lays flat as a perspective floor (0.5 s); its grid stays visible as the "ground" everything stands on.'},
        {'t': 7.68, 'action': '"language": short cream dash rows (code-like lines) draw along the sheet margin, a quiet "this is written" cue.'},
        {'t': 8.0, 'action': '"behind": pop-up book: popCity buildings unfold up from the floor (scaleY 0>1.08>1 from base, 0.06 stagger, centre outward); the blueprint sits literally behind/under them.'},
        {'t': 8.24, 'action': '"WordPress": bigPress rises last and tallest with a pulse (1.06); its pen-nib sign pops.'},
        {'t': 9.04, 'action': '"about 7": phpPlaques pop on base after base, 0.12 s apart from 9.10 to 9.82 (seven ticks, rising pitch); the sun turns into a 70% pie.'},
        {'t': 9.88, 'action': '"10": the 3 non-PHP buildings get grey bases and desaturate 25%.'},
        {'t': 10.08, 'action': '"websites": all 10 addrPills pop (0.04 stagger). 10.55 card tilts 2 deg, anticipating the flip.'},
    ],
    'sun': 'Home. Pulse on the stamp slam (6.32). 9.36-10.08: becomes a pie chart, 30% wedge goes cream so 70% stays orange (7 out of 10). 10.5 wedge closes back to a full disc.',
    'mascot': 'Sits on the sheet edge watching the drawing. On the stamp slam she double-takes (look -1>1>-1, 6.4-6.9) and copies the stamp pose (trunk-up, 6.9-7.5): "that\'s me?". During the pop-up she bobs her head to each plaque tick.',
    'sfx': [
        {'t': 4.62, 'sound': 'whoosh', 'notes': 'push-in'},
        {'t': 4.95, 'sound': 'paper', 'notes': 'blueprint unroll'},
        {'t': 5.44, 'sound': 'creak', 'notes': 'small door creak'},
        {'t': 5.84, 'sound': 'pencil', 'notes': 'circle scribble'},
        {'t': 6.32, 'sound': 'stamp', 'notes': 'rubber-stamp thump'},
        {'t': 8.0, 'sound': 'paper', 'notes': 'pop-up book flaps, 10 quick'},
        {'t': 9.1, 'sound': 'tick', 'notes': '7 ticks rising pitch 9.10-9.82'},
        {'t': 10.08, 'sound': 'pop', 'notes': 'tiny pops x10'},
    ],
    'captions': [
        cap(4.78, 7.04, [('They were fixing', 4.8), ('a security bug in PHP,', 5.36)], ('security bug', 5.44)),
        cap(7.04, 8.88, [('the programming language', 7.04), ('behind WordPress', 8.0)], ('WordPress', 8.24)),
        cap(8.88, 10.88, [('and about 7 out of 10', 8.88), ('websites.', 10.08)], ('7 out of 10', 9.36)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S03', 'start': 10.88, 'end': 15.76,
    'title': 'Two steps',
    'transitionIn': {'type': 'flip', 'dur': 0.5, 'persist': ['sun', 'mascot'],
        'notes': '3D Y-axis card flip 10.70-11.20, edge-on at 10.95 (reference grammar). Back face is the Stoop Street set already in line art.'},
    'setting': 'Stoop Street: a townhouse whose front door sits up a side-running stoop of exactly TWO steps. Step 1 riser = magnifier (find). Step 2 riser = wrench (fix). The street recedes to the right with a row of more doors.',
    'composition': 'Townhouse facade x 80-560, cornice y 330 (sky above it so the sun can set behind it in S09), peach walls, 2 floors of windows. Side-running stoop climbing left to right: step 1 riser x 180-300, y 860-930; step 2 riser x 300-420, y 790-930; landing + front door x 420-560, door y 560-790 (tealDark) with the box lock at (540,680). Right half x 580-880: one-point street, VP (700,560), 6 smaller fronts with doors on the right sidewalk, lamp posts, power lines with 3 birds across the top. Sidewalk mintPale y 930-1095.',
    'elements': [
        {'id': 'townhouse', 'what': 'townhouse facade with addrPill over the door', 'where': '80,330,480,600', 'style': 'walls peach, trim cream, ink'},
        {'id': 'stoop', 'what': 'two-step side stoop (persistent: S04 step 1 grows, S09 step 2 stretches)', 'where': 'step1 180,860,120,70; step2 300,790,120,140', 'style': 'fill cream stone, ink, riser glyphs ink'},
        {'id': 'glyphFind', 'what': 'magnifier glyph on step 1 riser', 'where': 'centred (240,895), 40 px', 'style': 'ink + highlight fill lens'},
        {'id': 'glyphFix', 'what': 'wrench glyph on step 2 riser', 'where': 'centred (360,860), 44 px', 'style': 'ink + highlight fill'},
        {'id': 'frontDoor', 'what': 'front door with the faulty box lock (persistent bug instance)', 'where': '420,560,140,230; lock (540,680)', 'style': 'tealDark, lock tan'},
        {'id': 'street', 'what': '6 receding fronts with doors, lamp posts, wires + 3 birds', 'where': 'x 580-880, VP (700,560)', 'style': 'sage/tan/cream, ink thin'},
        {'id': 'miniWrenches', 'what': 'small wrench icons that pop over every door down the street', 'where': 'one per door, 18-8 px by depth', 'style': 'ink + highlight'},
        {'id': 'mascot', 'what': 'Nell on the sidewalk, then hopping up the stoop', 'where': 'start (150,1040) scale 0.8', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 10.88, 'action': '"Fixing": facade line art draws on (0.4 s) near-to-far, fills 0.15 s behind; street draws in depth order.'},
        {'t': 11.28, 'action': '"bug": the bugRing pops around frontDoor\'s lock (same orange ring as S02), door creaks ajar 2 deg.'},
        {'t': 12.0, 'action': '"takes": the stoop is empty slabs; 12.24 "two" step 1 pops up from the ground (scaleY 0>1.1>1), 12.48 "steps" step 2 pops (counting two).'},
        {'t': 13.12, 'action': '"First": Nell hops onto step 1 (0.35 s arc).'},
        {'t': 13.68, 'action': '"find": glyphFind draws and pops on step 1; a lens-sweep circle glides from the glyph across to the door lock, which glints (ring pulse).'},
        {'t': 14.32, 'action': '"Then": Nell hops onto step 2.'},
        {'t': 14.8, 'action': '"fix": glyphFix draws and pops; a cream new-lock silhouette flashes over the faulty lock for 0.3 s (preview of the fix) then fades.'},
        {'t': 15.2, 'action': '"everywhere": miniWrenches pop over every door down the street (0.06 stagger near>far) and continue past the VP as dots.'},
    ],
    'sun': 'Home. On "two" (12.24) and "steps" (12.48) it does two small bounces (y +10, squash 0.94), like a ball taking two steps.',
    'mascot': 'Starts on the sidewalk (sit-back). Hop to step 1 on "First" (13.12) and briefly holds a tiny magnifier (pose hold, prop magnifier, 13.6-14.2); hop to step 2 on "Then" (14.32), prop swaps to a wrench (popSwitch at 14.8). Props stay small: the risers carry the explanation, she only echoes the rhythm.',
    'sfx': [
        {'t': 10.7, 'sound': 'whoosh', 'notes': 'card flip'},
        {'t': 10.95, 'sound': 'paper', 'notes': 'flip edge flap'},
        {'t': 11.28, 'sound': 'creak', 'notes': 'small'},
        {'t': 12.24, 'sound': 'thunk', 'notes': 'stone step 1 (low)'},
        {'t': 12.48, 'sound': 'thunk', 'notes': 'stone step 2 (higher)'},
        {'t': 13.12, 'sound': 'pop', 'notes': 'hop'},
        {'t': 13.68, 'sound': 'pop', 'notes': 'glyph + glint ting'},
        {'t': 14.32, 'sound': 'pop', 'notes': 'hop'},
        {'t': 14.8, 'sound': 'click', 'notes': 'ratchet'},
        {'t': 15.2, 'sound': 'pop', 'notes': 'cascade of 6+ tiny pops'},
    ],
    'captions': [
        cap(10.88, 13.12, [('Fixing a bug like that', 10.88), ('takes two steps.', 12.0)], ('two steps.', 12.24)),
        cap(13.12, 14.32, [('First, you find it.', 13.12)], ('find', 13.68)),
        cap(14.32, 15.76, [('Then, you fix it', 14.32), ('everywhere.', 15.2)], ('everywhere.', 15.2)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S04', 'start': 15.76, 'end': 21.68,
    'title': 'Fourteen years of nobody',
    'transitionIn': {'type': 'matchcut', 'dur': 0.0, 'persist': ['sun', 'mascot', 'stoop', 'frontDoor', 'street', 'townhouse'],
        'notes': 'Same set, no cut: the stoop is the persistent object. Camera eases in 1>1.06 toward the stoop.'},
    'setting': 'Stoop Street, then the same street in time-lapse. Step one turns out to be a tower nobody climbs.',
    'composition': 'As S03. Step 1 extrudes into a brick pillar x 180-300 up to y 420 (taller than the door). A wall calendar (cream, 44x56) hangs on the facade at (130,620), left of the stoop. A street tree at x 820 (simple lollipop canopy) for season cycles. Ivy draws over the door frame. Passers-by walk the sidewalk y 960-1060.',
    'elements': [
        {'id': 'stoop', 'what': 'step 1 extrudes into a tall brick pillar (magnifier glyph scales with it)', 'where': '180,420,120,510 at full height', 'style': 'cream stone + tan brick ticks'},
        {'id': 'calendar', 'what': 'wall calendar with tear-off pages (persistent: S05 lands on a summer page)', 'where': '130,620,44,56', 'style': 'cream page, salmon header, ink'},
        {'id': 'ivy', 'what': 'ivy creeping over the door frame and lock', 'where': 'around 420-560 x, 540-800 y', 'style': 'sage leaves, ink stems'},
        {'id': 'cobweb', 'what': 'cobweb on the faulty lock', 'where': '(540,680) 40 px', 'style': 'ink thin'},
        {'id': 'passersby', 'what': '8 back-view walkers in time-lapse (ghosted with 2-frame trails), none look at the door', 'where': 'sidewalk y 960-1060', 'style': 'palette mix, ink'},
        {'id': 'tree', 'what': 'street tree cycling seasons: sage > salmon > bare > sage', 'where': '780,700,90,200', 'style': 'canopy fills cycle'},
        {'id': 'mascot', 'what': 'Nell riding the pillar, then asleep on top', 'where': 'on pillar top (240,420) scale 0.8', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 15.76, 'action': '"You\'d think": slow push-in 1>1.06 over 1.2 s.'},
        {'t': 16.24, 'action': '"finding": step 1 extrudes upward into a pillar (0.8 s, ease outBack), brick ticks drawing on as it rises, magnifier glyph scaling up with it; Nell rides up.'},
        {'t': 17.04, 'action': '"hard part": pillar settles with a wobble; 3 pebbles drop off its edge; glyphFind pulses 1>1.3>1.'},
        {'t': 17.92, 'action': '"right?": hold. Nell turns to camera (only fourth-wall look in the film). Everything else still for 0.5 s (comic beat).'},
        {'t': 18.72, 'action': '"for 14": time-lapse ON: calendar pages tear off and flutter away, 14 tears between 18.72 and 21.04 (accelerate then decelerate); tree cycles seasons; sun becomes a clock and its hand spins.'},
        {'t': 19.6, 'action': '"years": passersby stream past the stoop and the ajar door in ghosted time-lapse; nobody turns. Ivy draws over the door frame 19.6-21.0; cobweb draws on the lock at 20.1.'},
        {'t': 20.32, 'action': '"nobody": stream thickens then thins out; a leaf lands on sleeping Nell at 20.8.'},
        {'t': 21.04, 'action': '"did": time-lapse stops dead: last calendar page settles, street empty, clock hand stops. 21.2-21.68 camera zooms hard into the faulty lock (match-cut setup for S05).'},
    ],
    'sun': 'Home. 18.72-21.04: a cream clock face fades onto the disc, minute hand spins (ease-in-out, ~4 turns), hour hand creeps; stops dead at 21.04 and the face fades by 21.4.',
    'mascot': 'Rides the rising pillar (16.24), ends perched on top wide-eyed (expression wide). On "right?" turns to camera (sit-front, meh, single blink). From 18.72 curls into sleep pose (expression closed) and sleeps through 14 years; leaf lands on her ear at 20.8 (ear twitch).',
    'sfx': [
        {'t': 16.24, 'sound': 'rumble', 'notes': 'stone grinding rise'},
        {'t': 17.04, 'sound': 'pebbles', 'notes': '3 small ticks'},
        {'t': 17.92, 'sound': 'tick', 'notes': 'single dry blink tick'},
        {'t': 18.72, 'sound': 'tick', 'notes': 'clock ticking accelerating'},
        {'t': 18.8, 'sound': 'paper', 'notes': 'calendar riffle x14'},
        {'t': 19.6, 'sound': 'whoosh', 'notes': 'time-lapse footsteps swish'},
        {'t': 21.04, 'sound': 'tick', 'notes': 'hard stop, one final tick, then silence'},
        {'t': 21.3, 'sound': 'whoosh', 'notes': 'zoom into the lock'},
    ],
    'captions': [
        cap(15.76, 18.56, [("You'd think finding it", 15.76), ('is the hard part, right?', 16.72)], ('hard part', 17.04)),
        cap(18.56, 21.68, [('And for 14 years,', 18.56), ('nobody did.', 20.32)], ('14 years', 18.96)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S05', 'start': 21.68, 'end': 25.44,
    'title': 'Found it',
    'transitionIn': {'type': 'matchcut', 'dur': 0.5, 'persist': ['sun', 'mascot', 'lock', 'blueprint', 'calendar'],
        'notes': '21.2-21.8: the camera is inside S04\'s faulty lock; its linework holds still while colours swap to blueprint (teal ground, cream lines). Zoom out reveals it is the lock detail on the PHP master blueprint (same sheet as S02), now pinned on a wall. The bug was in the blueprint all along.'},
    'setting': 'A quiet wall where the PHP blueprint hangs big, like the reference noticeboard. Two security teams stand in front of it, back to us, holding up devices.',
    'composition': 'Wall (cream) behind; blueprint x 110-850, y 210-760; the S04 calendar pinned beside it at (80-110, 300) on the wall edge. Foreground y 780-1095: team L (3 back-view people, teal jackets) x 110-400, team R (3, salmon jackets) x 520-840, waist-up, heads ~y 820, like the reference crowd at the noticeboard. Devices (tablets) raised to y ~720. Nell on top of the blueprint frame at (700,205), like the reference cat on the board.',
    'elements': [
        {'id': 'blueprint', 'what': 'same PHP master blueprint as S02 incl. elephantStamp and bpDoor', 'where': '110,210,740,550', 'style': 'teal + cream'},
        {'id': 'teamL', 'what': '3 back-view people, small cream shield badge on each back', 'where': '110,780,290,315', 'style': 'jackets teal, hair brown/olive'},
        {'id': 'teamR', 'what': '3 back-view people, shield badges', 'where': '520,780,320,315', 'style': 'jackets salmon'},
        {'id': 'aiDevices', 'what': 'x2 raised tablets with a 4-point sparkle glyph (the generic "AI" icon)', 'where': '(250,720) and (680,720), 60x44', 'style': 'tealDark body, cream sparkle'},
        {'id': 'scanBeams', 'what': 'x2 translucent cone beams that sweep the blueprint; sparkles twinkle where they pass', 'where': 'from devices onto the sheet', 'style': 'cream 35% opacity, ink edge dashes'},
        {'id': 'bugRing', 'what': 'the orange ring around the lock detail', 'where': 'r 46 at (600,560)', 'style': 'stroke sun'},
        {'id': 'calendar', 'what': 'S04 calendar, next page shows a sun glyph (summer)', 'where': '80,280,40,52', 'style': 'cream, salmon header'},
        {'id': 'mascot', 'what': 'Nell asleep on the frame top, wakes on "found"', 'where': '(700,205) scale 0.75', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 21.68, 'action': '"Then": zoom-out reveal of the blueprint completes (0.5 s ease out).'},
        {'t': 22.16, 'action': '"August": calendar page flips to the summer page (sun glyph); 8 short heat ticks radiate around the sun and shimmer.'},
        {'t': 22.8, 'action': '"two": teamL slides up into frame (0.06 stagger); 23.04 "security": teamR slides up.'},
        {'t': 23.52, 'action': '"teams": shield badges pop on all six backs (0.04 stagger).'},
        {'t': 23.92, 'action': '"using": both teams raise their devices (arms up, like the reference phone-holders).'},
        {'t': 24.16, 'action': '"AI": sparkle glyphs pop on both devices (twinkle); 24.3 scanBeams switch on and sweep: L sweeps left>right, R sweeps right>left; blueprint lines glow briefly and tiny sparkles twinkle in their wake.'},
        {'t': 24.56, 'action': '"tools": beams speed up and converge toward the lock.'},
        {'t': 24.96, 'action': '"found": both beams lock onto the lock detail; bugRing draws on (0.25 s); the lock detail pops into a callout (1>1.25>1.15). Teams lean toward each other 3 deg (quiet triumph).'},
        {'t': 25.3, 'action': 'One teamR member turns and starts walking right with a cream envelope (S06 push begins).'},
    ],
    'sun': 'Home. August: heat ticks shimmer around it (22.16-24.0). On "found" a brief extra pulse (1.08).',
    'mascot': 'Asleep on the frame top (continuity from S04). Ear twitches when the beams start (24.3). Startle-wakes on "found" (24.96): tiny hop, expression wide, look down at the ring.',
    'sfx': [
        {'t': 21.68, 'sound': 'paper', 'notes': 'blueprint settle'},
        {'t': 22.16, 'sound': 'shimmer', 'notes': 'warm summer shimmer + calendar flip'},
        {'t': 22.8, 'sound': 'pop', 'notes': 'people x3, then x3 at 23.04'},
        {'t': 24.16, 'sound': 'sparkle', 'notes': 'two glassy chimes'},
        {'t': 24.3, 'sound': 'scan', 'notes': 'soft rising sweep hum'},
        {'t': 24.96, 'sound': 'ding', 'notes': 'bright found-it ding + pencil circle'},
    ],
    'captions': [
        cap(21.68, 23.92, [('Then, in August,', 21.68), ('two security teams', 22.8)], ('August,', 22.16)),
        cap(23.92, 25.44, [('using AI tools', 23.92), ('found it', 24.96)], ('found it', 24.96)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S06', 'start': 25.44, 'end': 30.64,
    'title': 'A quiet letter',
    'transitionIn': {'type': 'push', 'dur': 0.5, 'persist': ['sun', 'mascot', 'messenger', 'envelope'],
        'notes': 'Lateral pan right 25.30-25.80 following the teamR messenger and his envelope; the blueprint wall slides off left, the workshop slides in.'},
    'setting': 'The workshop of the people who make PHP: a narrow three-storey building with an elephant hanging sign, a mail slot, and a shop window onto their workbench.',
    'composition': 'Workshop facade x 300-860, roofline y 200 (tall so the sun can duck behind it), tan brick ground floor, cream upper floors. Hanging bracket sign with elephant silhouette at x 300-380, y 470-560. Door with mail slot x 330-420, y 600-860. Shop window x 430-800, y 560-820 with 3 workers, workbench, tool shelf, crate. Striped awning peach/cream y 520-560. Left x 80-300: quiet corner, lamp post, bench. Sidewalk y 860-1095.',
    'elements': [
        {'id': 'workshop', 'what': 'PHP workshop facade (persistent: small in S07 background)', 'where': '300,200,560,660', 'style': 'tan brick, cream upper, ink'},
        {'id': 'elephantSign', 'what': 'hanging bracket sign, elephant silhouette', 'where': '300,470,80,90', 'style': PHP + ' on cream board'},
        {'id': 'mailSlot', 'what': 'brass mail slot with flap', 'where': '(375,720) 44x8', 'style': 'tan, ink'},
        {'id': 'messenger', 'what': 'teamR member (salmon jacket) with envelope', 'where': 'walks x 120>330, y 700-1000', 'style': 'salmon, ink'},
        {'id': 'envelope', 'what': 'cream envelope with an orange seal dot', 'where': '30x20', 'style': 'cream + sun dot'},
        {'id': 'workers', 'what': '3 back-view workers in aprons at the bench, behind glass', 'where': '470-760 x, 640-820 y', 'style': 'cream/teal/olive, glass mintPale overlay'},
        {'id': 'fixCrate', 'what': 'crate filling with new locks: cream box locks, each with an orange keyhole dot (THE fix icon all film)', 'where': '600,760,140,50', 'style': 'tan crate, cream locks, sun dot'},
        {'id': 'blind', 'what': 'roller blind that pulls half down for privacy', 'where': 'over shop window', 'style': 'cream with peach stripes'},
        {'id': 'passersby', 'what': '2 back-view walkers who pass by oblivious', 'where': 'sidewalk y 960-1060', 'style': 'palette mix'},
        {'id': 'mascot', 'what': 'Nell tiptoeing behind the messenger, then sitting by the door', 'where': 'ends (250,1050) scale 0.8', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 25.44, 'action': '"and": messenger walks in from left with the envelope under his arm.'},
        {'t': 25.68, 'action': '"quietly": he switches to an exaggerated tiptoe; the sun sinks to half behind the workshop roofline (keeping the secret).'},
        {'t': 26.16, 'action': '"told": envelope slides into the mail slot and vanishes; slot flap pops shut.'},
        {'t': 26.48, 'action': '"people": shop window lights up (cream glow), revealing the 3 workers (pop, 0.08 stagger).'},
        {'t': 27.12, 'action': '"PHP": elephantSign swings and pulses; the opened envelope lands on the bench and the blueprint page with the orange ring unrolls.'},
        {'t': 28.08, 'action': '"fix": new locks pop into fixCrate one by one, 8 of them, 0.12 s apart until 28.96 (satisfying rhythm).'},
        {'t': 28.96, 'action': '"before": the blind pulls half down over the window (0.4 s), the crate still glinting below it.'},
        {'t': 29.2, 'action': '"anyone else": two passersby walk past left>right, never looking in.'},
        {'t': 29.92, 'action': '"knew": window glow dims behind the blind. 30.3 a corner of the ringed blueprint page flutters at the gap under the blind (foreshadow of the leak).'},
    ],
    'sun': 'Sinks from (480,100) to half-hidden behind the roofline at y ~200 on "quietly" (25.68, 0.6 s), peeks there like it is in on the secret; snaps back up to home on "Except," (30.64) at the start of S07.',
    'mascot': 'Tiptoes behind the messenger (walk-side, slow rate) with trunk raised to her mouth in a "shh" (trunk-up) on "quietly". Sits by the door (sit-back) from 26.4, watching the crate fill; head turns to follow the passersby at 29.2.',
    'sfx': [
        {'t': 25.44, 'sound': 'footsteps', 'notes': 'soft tiptoe'},
        {'t': 26.16, 'sound': 'click', 'notes': 'mail slot clack, soft'},
        {'t': 26.48, 'sound': 'click', 'notes': 'light switch + warm hum'},
        {'t': 27.12, 'sound': 'creak', 'notes': 'sign swing'},
        {'t': 28.08, 'sound': 'clink', 'notes': '8 metal clinks 28.08-28.96'},
        {'t': 28.96, 'sound': 'zip', 'notes': 'blind pull'},
        {'t': 29.2, 'sound': 'footsteps', 'notes': 'passers-by'},
        {'t': 30.3, 'sound': 'paper', 'notes': 'flutter'},
    ],
    'captions': [
        cap(25.44, 27.84, [('and quietly told', 25.44), ('the people who make PHP', 26.4)], ('quietly', 25.68)),
        cap(27.84, 30.64, [('so a fix could be ready', 27.84), ('before anyone else knew.', 28.96)], ('fix', 28.08)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S07', 'start': 30.64, 'end': 35.6,
    'title': 'Pinned for everyone',
    'transitionIn': {'type': 'push', 'dur': 0.46, 'persist': ['sun', 'mascot', 'leakedPage', 'workshop'],
        'notes': 'Whip pan left 30.64-31.10 riding a gust: the ringed blueprint page escapes the workshop and tumbles left; the workshop slides right and shrinks into the background right.'},
    'setting': 'The public square noticeboard (our version of the reference board): the internet as a public board anyone can read. An addrPill sits on top of the board frame: this board is "online".',
    'composition': 'Peach plaster wall x 70-890, y 220-820, cornice lines. Glass-cased double noticeboard on legs: frame teal x 140-560, y 380-700, glass mintPale, legs to y 820; addrPill on the top rail. Right x 640-860: the street receding with the workshop small in the distance (door + elephant sign + blind still down). Sidewalk y 820-1095; crowd gathers y 860-1095 (back views, some holding phones up). Nell on top of the board at (430,372).',
    'elements': [
        {'id': 'noticeboard', 'what': 'glass-cased double board on legs with addrPill on top', 'where': '140,380,420,440', 'style': 'frame teal, glass mintPale, ink'},
        {'id': 'leakedPage', 'what': 'the ringed blueprint page (teal sheet, cream lock drawing, orange ring)', 'where': '110x140 when pinned at (230,420)', 'style': 'teal + cream + sun ring'},
        {'id': 'pin', 'what': 'push pin', 'where': 'top of page', 'style': 'salmon head'},
        {'id': 'copies', 'what': 'clones of the page tiling the board glass: 2>4>8', 'where': 'grid in 150-550 x, 390-690 y', 'style': 'same as leakedPage, 55% scale'},
        {'id': 'crowd', 'what': '12-16 back-view people gathering, 5 raise phones whose screens show tiny teal pages; 3 wear tealDark hoods (just reading)', 'where': 'y 860-1095', 'style': 'palette mix'},
        {'id': 'workshopFar', 'what': 'workshop in the background: blind down, then door opens and the fix cart rolls out', 'where': '640,520,220,300', 'style': 'tan/cream, small'},
        {'id': 'fixCart', 'what': 'hand cart carrying fixCrate, elephant pennant', 'where': 'emerges at (700,800), 70x40', 'style': 'tan, cream locks, ' + PHP + ' pennant'},
        {'id': 'gust', 'what': 'ink wind strokes', 'where': 'across 300-880 x, 300-600 y', 'style': 'ink thin'},
        {'id': 'mascot', 'what': 'Nell on top of the board', 'where': '(430,372) scale 0.75', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 30.64, 'action': '"Except,": gust strokes slash in; leakedPage tumbles in from the right (rotation + flutter skew), sun snaps back to home.'},
        {'t': 31.36, 'action': '"the details": page slows, flattens, faces us: the ringed lock is readable.'},
        {'t': 32.08, 'action': '"of the bug": page glides onto the board glass.'},
        {'t': 32.72, 'action': '"leaked": PIN pops in (overshoot), glass glints; page settles with a 2 deg swing.'},
        {'t': 33.2, 'action': '"online": copies clone across the board 2>4>8 (0.08 s each); crowd pops in from the bottom (0.05 stagger), phones go up, phone screens light with tiny teal pages.'},
        {'t': 33.84, 'action': '"hours": sun becomes a clock face (cream ticks + hour hand), hour hand sweeps 12 to 4 over 33.9-35.0.'},
        {'t': 34.56, 'action': '"the fix": in the background, the workshop blind snaps up.'},
        {'t': 35.04, 'action': '"came out": workshop door swings open, fixCart rolls out (pop + small bell). The crowd at the board is already big: too late.'},
    ],
    'sun': 'Snaps up from behind the S06 roof to home on "Except," (startled). 33.84-35.1: clock face, hour hand sweeps four hours; face fades by 35.4.',
    'mascot': 'Sits on the board top exactly like the reference cat. 31.4: lunges trunk up at the passing page and misses (trunk-up, page slips under her trunk). 33.2: ear flattens, expression worried, as copies multiply. 35.04: head turns right toward the workshop door.',
    'sfx': [
        {'t': 30.64, 'sound': 'whoosh', 'notes': 'gust + paper flutter'},
        {'t': 32.72, 'sound': 'pin', 'notes': 'pin thock + glass tap'},
        {'t': 33.2, 'sound': 'paper', 'notes': 'rapid paper slaps x4'},
        {'t': 33.3, 'sound': 'click', 'notes': 'phone camera clicks x3'},
        {'t': 33.84, 'sound': 'tick', 'notes': 'fast clock ticks'},
        {'t': 35.04, 'sound': 'creak', 'notes': 'door + cart rumble + small bell'},
    ],
    'captions': [
        cap(30.64, 33.84, [('Except, the details', 30.64), ('of the bug leaked online', 32.08)], ('leaked', 32.72)),
        cap(33.84, 35.6, [('hours before', 33.84), ('the fix came out.', 34.56)], ('hours', 33.84)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S08', 'start': 35.6, 'end': 43.76,
    'title': 'The guard counts',
    'transitionIn': {'type': 'zoom', 'dur': 0.6, 'persist': ['sun', 'mascot', 'noticeboard'],
        'notes': 'Zoom out 35.45-36.05 (1 > 0.22) anchored on the noticeboard, which becomes one tiny square in a whole city: the web. Sun stays screen-fixed at home size.'},
    'setting': 'The whole city (the web). A glass dome covers a big chunk of it, with a watchtower guard inside: our generic stand-in for Cloudflare. Hooded figures rattle door handles everywhere.',
    'composition': 'Skyline of ~28 buildings in 3 depth rows: back row sage silhouettes, mid row peach/cream, front row tan/teal with doors at street level y 860-900; street mintPale y 900-1095. Dome: ellipse arc centre (380,900), rx 300, ry 560 (top y 340), spanning x 80-680 = "a big chunk". Watchtower inside on x 350-410 up to a booth at y 380-440, guard + searchlight; tally board (cream) on the tower x 300-460, y 560-680. Unprotected strip x 690-880 to the right. Tiny noticeboard visible mid-left (callback).',
    'elements': [
        {'id': 'city', 'what': '28 buildings, 3 rows, windows as small cream rects, each front-row building has a door', 'where': 'x 70-890, y 380-900', 'style': 'sage / peach / cream / tan / teal'},
        {'id': 'dome', 'what': 'glass dome with lattice lines and diagonal shine strokes', 'where': 'centre (380,900) rx 300 ry 560', 'style': 'ink stroke, fill mintPale 30%, shine cream'},
        {'id': 'watchtower', 'what': 'slim tower + lookout booth', 'where': '350,380,60,520', 'style': 'teal, ink'},
        {'id': 'guard', 'what': 'back-view guard in the booth with a searchlight', 'where': 'booth (380,410), 26 px', 'style': 'tealDark coat, cream lamp'},
        {'id': 'searchBeam', 'what': 'sweeping searchlight cone', 'where': 'from (395,400)', 'style': 'cream 35%'},
        {'id': 'tallyBoard', 'what': 'tally board filling with 5-bar tally bundles, then overflowing onto the tower and dome glass', 'where': '300,560,160,120', 'style': 'cream board, ink marks'},
        {'id': 'hoods', 'what': 'hooded figures (ink silhouettes, 22-30 px) rattling door handles and tapping the dome; never shown entering', 'where': 'street level + dome perimeter', 'style': 'tealDark fill, ink'},
        {'id': 'ripples', 'what': 'small cream arcs on the dome where it is knocked', 'where': 'on the dome edge', 'style': 'cream + ink'},
        {'id': 'dusk', 'what': 'sky bands for evening: mint > salmon low > tealDark high; window lights pop on', 'where': 'sky block', 'style': 'bg > salmon > tealDark'},
        {'id': 'mascot', 'what': 'Nell on a rooftop inside the dome', 'where': '(600,700) scale 0.6', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 35.6, 'action': '"Cloudflare": zoom-out lands; city fills settle. 35.9-36.5 dome arc draws on from left base over the apex to right base; fill fades in.'},
        {'t': 36.56, 'action': '"protects": lattice lines draw on; a shine sweep slides across the glass.'},
        {'t': 37.04, 'action': '"big chunk": covered buildings brighten, the unprotected right strip dims 20%.'},
        {'t': 37.68, 'action': '"web": thin wires draw rooftop to rooftop across the whole city (the web as a connected city).'},
        {'t': 38.16, 'action': '"says": watchtower booth lights up, guard pops in.'},
        {'t': 38.56, 'action': '"saw": searchBeam sweeps left>right across the city.'},
        {'t': 38.88, 'action': '"tens of thousands": hooded figures pop in at doors and around the dome (6 > 20 > 60, accelerating); each jiggles a handle; dome ripples where they tap; tallyBoard starts filling, bundles accelerating.'},
        {'t': 40.0, 'action': '"break-in attempts": rattles intensify; a few figures bounce back off the dome (small hop back). No door opens on screen.'},
        {'t': 40.88, 'action': '"in 45": sun becomes a clock; a tealDark hatched wedge sweeps from 12 to 9 (41.04-41.9) = 45 minutes.'},
        {'t': 42.24, 'action': '"and millions": clock fades; figures multiply into a dense stipple crowd along every street; tally marks spill off the board onto the tower and up the dome glass.'},
        {'t': 43.04, 'action': '"by evening": sun SETS: slides from (480,100) down behind the back skyline (horizon clip y ~560), 0.7 s; sky bands go dusk; window lights pop on (random stagger) 43.2-43.7; street lamps on.'},
    ],
    'sun': 'Home during the zoom. 40.88-42.1: clock with a 45-minute wedge. 43.04-43.74: sets behind the skyline (the reference\'s setting-sun move), ending half-hidden at the horizon.',
    'mascot': 'Sits on a rooftop inside the dome watching the tally. Looks around as the figures appear (38.9). On "millions" folds her ear over her eyes (ears-cover, 42.5). Peeks out at the sunset (43.3).',
    'sfx': [
        {'t': 35.45, 'sound': 'whoosh', 'notes': 'big zoom-out'},
        {'t': 35.9, 'sound': 'glass', 'notes': 'rising glassy hum as the dome draws'},
        {'t': 36.56, 'sound': 'shimmer', 'notes': 'shine sweep'},
        {'t': 38.16, 'sound': 'click', 'notes': 'lamp clunk'},
        {'t': 38.88, 'sound': 'rattle', 'notes': 'door-handle rattles layering up, accelerating; pencil tally scratches'},
        {'t': 40.88, 'sound': 'tick', 'notes': 'fast clock'},
        {'t': 42.48, 'sound': 'crowd', 'notes': 'murmur swell'},
        {'t': 43.04, 'sound': 'whoosh', 'notes': 'low falling sunset tone, then lights clicking on'},
    ],
    'captions': [
        cap(35.6, 37.52, [('Cloudflare, which', 35.6), ('protects a big chunk', 36.56)], ('big chunk', 37.04)),
        cap(37.52, 39.92, [('of the web, says it saw', 37.52), ('tens of thousands', 38.88)], ('tens of thousands', 38.88)),
        cap(39.92, 42.24, [('of break-in attempts', 39.92), ('in 45 minutes,', 40.88)], ('45 minutes,', 41.04)),
        cap(42.24, 43.76, [('and millions', 42.24), ('by evening.', 43.04)], ('millions', 42.48)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S09', 'start': 43.76, 'end': 47.84,
    'title': 'Question marks, then dawn',
    'transitionIn': {'type': 'matchcut', 'dur': 0.4, 'persist': ['sun', 'mascot'],
        'notes': '43.60-44.00: the dusk skyline line is held and morphs into the cornice/roofline of Stoop Street at night; the half-set sun stays on that line (moves to (480,330) clipped by the townhouse cornice).'},
    'setting': 'Stoop Street (S03/S04) at night, step 1 back to normal. Then dawn, and step two turns out to be very long.',
    'composition': 'As S03, night palette: sky tealDark, walls darkened 35%, windows dark except 2; street lamp cream glow cones. Doors along the receding street at right. At dawn the palette returns to day. Step 2 tread extends to the right along the curb toward the VP (700,560), with door after door along it.',
    'elements': [
        {'id': 'stoop', 'what': 'two-step stoop, step 2 later stretches into a long ledge running to the VP', 'where': 'step2 300,790 > extends to ~(690,600)', 'style': 'cream stone, ink'},
        {'id': 'frontDoor', 'what': 'door still ajar, dark sliver', 'where': '420,560,140,230', 'style': 'tealDark, black-teal sliver'},
        {'id': 'questionMarks', 'what': 'ink "?" marks popping above doors down the street, one big one at the front door', 'where': 'above each door, 40 > 10 px by depth', 'style': 'ink, cream halo'},
        {'id': 'nightSky', 'what': 'sky crossfade night > dawn > day', 'where': 'sky block', 'style': 'tealDark > salmon > bg'},
        {'id': 'snail', 'what': 'tiny snail on the step 2 tread (rewatch detail, "the slow one")', 'where': '(380,782), 24 px', 'style': 'tan shell spiral, cream body, ink'},
        {'id': 'mascot', 'what': 'Nell peeking from behind the stoop, then climbing step 2', 'where': '(170,1000) peek > (360,790)', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 43.76, 'action': '"Nobody": night settles; the street is empty (no figures anywhere).'},
        {'t': 44.08, 'action': '"knows": Nell peeks out from behind step 1 (peek pose, worried).'},
        {'t': 44.56, 'action': '"how many": "?" marks pop above doors down the street near>far (8 marks, 0.08 stagger), each wobbles; two windows flicker once.'},
        {'t': 44.96, 'action': '"got in": the biggest "?" pops in the dark sliver of the front door, right next to Nell.'},
        {'t': 45.52, 'action': '"So now comes": DAWN: sun rises from behind the cornice to home (45.52-46.2, ease out); sky crossfades night>salmon>mint; "?" marks fade out.'},
        {'t': 46.08, 'action': '"step two": glyphFix on step 2 re-draws and glows; step 2 fill flashes salmon; 46.4 "two" it bumps (1.08).'},
        {'t': 46.96, 'action': '"the slow one": step 2 STRETCHES: its tread and riser extend right along the curb toward the VP (0.8 s), door after door popping along it; 47.12 the snail pops on the tread.'},
    ],
    'sun': 'Starts set: half-disc behind the townhouse cornice at (480,330). On "So now comes" it RISES back to home: a new day, step two begins.',
    'mascot': 'Peeks from behind the stoop (peek, worried) during the "?" marks; on dawn hops onto step 2 (46.1), looks down the endless ledge, slumps (stand-side, expression meh) on "slow" (47.12).',
    'sfx': [
        {'t': 43.76, 'sound': 'ambience', 'notes': 'night: faint crickets, very low'},
        {'t': 44.56, 'sound': 'pop', 'notes': 'soft pitched pops for each "?"'},
        {'t': 45.52, 'sound': 'swell', 'notes': 'warm rising dawn tone + one bird chirp'},
        {'t': 46.08, 'sound': 'click', 'notes': 'ratchet'},
        {'t': 46.96, 'sound': 'creak', 'notes': 'long stone slide stretch'},
        {'t': 47.12, 'sound': 'pop', 'notes': 'tiny comic squish for the snail'},
    ],
    'captions': [
        cap(43.76, 45.52, [('Nobody knows yet', 43.76), ('how many got in.', 44.56)], ('how many', 44.56)),
        cap(45.52, 47.84, [('So now comes step two,', 45.52), ('the slow one.', 46.96)], ('slow', 47.12)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S10', 'start': 47.84, 'end': 54.56,
    'title': '22 million doors',
    'transitionIn': {'type': 'zoom', 'dur': 0.4, 'persist': ['sun', 'mascot', 'frontDoor', 'fixCart'],
        'notes': 'Zoom in 47.70-48.10 along the stretched step-2 ledge onto the first door, which fills the frame.'},
    'setting': 'One door, one worker, one new lock. Then powers-of-ten zoom out: a street of doors, then an endless wall of doors to the horizon, every one stamped with the elephant.',
    'composition': 'Close (47.84-49.44): door tealDark x 330-630, y 330-900 in a cream wall; faulty box lock at (590,620); addrPill above at x 380-580, y 280-310; elephant plaque beside the door x 660-720, y 520-580. Worker (S06 apron + cap, back/three-quarter view) and fixCart at left x 110-320, y 640-1000. Mid (49.44-50.48): scale 0.33, the door is #1 of a row of 9 along a facade. Far (50.48-54.56): scale ~0.08 then a procedural "door wall": rows of tiny doors stacked in a perspective grid receding to a horizon at y ~260, each a tealDark rect with a periwinkle dot; door #1 bottom-left with a cream tick.',
    'elements': [
        {'id': 'frontDoor', 'what': 'door #1 with faulty lock, then new lock', 'where': '330,330,300,570', 'style': 'tealDark, lock tan > new lock cream + sun keyhole dot'},
        {'id': 'worker', 'what': 'workshop worker with cap and apron', 'where': '200,640,80,300', 'style': 'olive apron, cream shirt, ink'},
        {'id': 'fixCart', 'what': 'cart with the crate of new locks + elephant pennant', 'where': '110,880,180,110', 'style': 'tan, cream, ' + PHP},
        {'id': 'tick', 'what': 'ink tick in a cream circle over a fixed door', 'where': 'above door, 40 px', 'style': 'ink + cream'},
        {'id': 'doorRow', 'what': 'row of 9 doors on one facade, all ajar except #1', 'where': 'mid zoom', 'style': 'tealDark doors, sliver darker'},
        {'id': 'doorWall', 'what': 'procedural endless grid of tiny doors with periwinkle stamp dots, perspective to a horizon', 'where': 'fills panel at far zoom, horizon y ~260', 'style': 'tealDark rects, ' + PHP + ' dots, mintPale gaps'},
        {'id': 'targetRings', 'what': 'small orange rings flickering on random doors (echo the bug ring and the sun)', 'where': '12-20 across the grid, r 6-14', 'style': 'stroke sun'},
        {'id': 'mascot', 'what': 'Nell handing the new lock, then a periwinkle speck beside door #1', 'where': '(300,1000) scale 0.8 > speck', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 47.84, 'action': '"Someone": worker rolls in with the cart (slide 0.4 s) and stops at the door.'},
        {'t': 48.48, 'action': '"install": the old faulty lock pops off and drops (clunk, bounces once at the bottom); the door swings fully shut.'},
        {'t': 49.04, 'action': '"fix": the new lock (cream box, orange keyhole dot) pops on (0>1.15>1) with a click; tick pops above the door.'},
        {'t': 49.44, 'action': '"on every site": zoom out #1 (1 > 0.33, 0.5 s): door #1 is one of 9 on a facade, the other 8 still ajar with old locks.'},
        {'t': 50.48, 'action': '"and there are": zoom out #2 (0.33 > 0.08, 0.6 s): the facade becomes one patch of the doorWall.'},
        {'t': 51.2, 'action': '"22 million": doorWall populates outward in a wave, rows filling bottom>top toward the horizon (51.2-52.4); parallax drift up 30 px.'},
        {'t': 52.24, 'action': '"copies": every periwinkle stamp dot blinks in a left>right wave: every door is a copy of PHP.'},
        {'t': 53.36, 'action': '"out there": slow drift continues; door #1\'s tick is the only cream dot in the whole wall.'},
        {'t': 53.84, 'action': '"could be hit": targetRings pop on random doors (0.03 stagger), each pop-then-fade; 54.08 "hit" a final flurry of 6.'},
    ],
    'sun': 'Screen-fixed at home through both zoom-outs (it is the only thing that does not shrink: the anchor). Pulse on "22" (51.2).',
    'mascot': 'Holds the new lock in her trunk (hold pose, prop newLock) 48.0-49.0; the lock hops from her trunk onto the door at 49.04 (helper gag). Sits beside door #1; with each zoom she shrinks to a single periwinkle speck next to the only ticked door (find-Nell rewatch reward).',
    'sfx': [
        {'t': 47.84, 'sound': 'rumble', 'notes': 'cart wheels'},
        {'t': 48.48, 'sound': 'clunk', 'notes': 'old lock drops + bounce'},
        {'t': 49.04, 'sound': 'click', 'notes': 'new lock click + tick'},
        {'t': 49.44, 'sound': 'whoosh', 'notes': 'zoom out'},
        {'t': 50.48, 'sound': 'whoosh', 'notes': 'deeper zoom out'},
        {'t': 51.2, 'sound': 'tick', 'notes': 'granular cascade of tiny ticks as the wall fills'},
        {'t': 52.24, 'sound': 'shimmer', 'notes': 'soft wave'},
        {'t': 53.84, 'sound': 'ping', 'notes': '12 light scattered pings'},
    ],
    'captions': [
        cap(47.84, 50.48, [('Someone has to install', 47.84), ('that fix on every site,', 48.8)], ('every site,', 49.68)),
        cap(50.48, 52.56, [('and there are about', 50.48), ('22 million copies', 51.2)], ('22 million', 51.2)),
        cap(52.56, 54.56, [('of PHP out there', 52.56), ('that could be hit.', 53.68)], ('hit.', 54.08)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S11', 'start': 54.56, 'end': 60.56,
    'title': 'Shutters down',
    'transitionIn': {'type': 'zoom', 'dur': 0.5, 'persist': ['sun', 'mascot', 'targetRings'],
        'notes': 'Zoom in 54.40-54.95 into one ring-marked door in the wall; it resolves into a single small shop building (a site).'},
    'setting': 'One ordinary site: a small shop building whose fix has not arrived. Far down its street the worker is still busy, many doors away. Then back to the capitol from S01.',
    'composition': 'Phase A (54.56-59.04): shop building x 160-800: fascia addrPill x 330-630, y 300-335; shutter housing box x 160-800, y 360-400; two big lit windows + door with the old faulty lock; elephant plaque. Right background x 700-880: street receding, the tiny worker + cart at a door far away (ticks on 2 doors) with a dashed queue of ~12 doors between. Nell sitting on the sidewalk (130,1040). Phase B (59.04-60.56): whip pan back to the S01 plaza in its end-state (all shutters down, clock tags, lights off, flags waving).',
    'elements': [
        {'id': 'shop', 'what': 'one site: small shop building with addrPill and elephant plaque', 'where': '160,300,640,560', 'style': 'cream walls, sage trim, windows cream glow'},
        {'id': 'shutter', 'what': 'big roll-down shutter over windows + door', 'where': '160,400,640,460', 'style': 'grey, ink ribs'},
        {'id': 'hourglass', 'what': 'hourglass icon popping above the door (waiting)', 'where': '(480,350) 34 px', 'style': 'ink + tan sand'},
        {'id': 'farWorker', 'what': 'tiny worker + cart at a far door, 2 ticks done, dashed queue line of doors to here', 'where': '700-880 x, 520-760 y', 'style': 'small, ink'},
        {'id': 'clockTag', 'what': '"back soon" tag with clock glyph swinging from the shutter handle (same as S01)', 'where': '(480,870) 26x34', 'style': 'cream, ink'},
        {'id': 'govRow', 'what': 'S01 plaza in its switched-off end state', 'where': 'S01 slots', 'style': 'S01 palette, windows dark'},
        {'id': 'mascot', 'what': 'Nell on the sidewalk, then back at her S01 spot', 'where': '(130,1040) > (760,1050)', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 54.56, 'action': '"If a site": zoom lands; shop lights on, addrPill pops.'},
        {'t': 55.04, 'action': '"can\'t update": hourglass pops above the door; far away the worker ticks a door (pop at 55.3), many doors still between him and us (dashed queue draws on).'},
        {'t': 55.68, 'action': '"fast enough": hourglass flips 180 deg; sand starts trickling; the far worker barely moves.'},
        {'t': 56.56, 'action': '"safest": the shutter peeks 10% out of its housing (anticipation), pull-cord swings.'},
        {'t': 57.52, 'action': '"switch": the sun inks the power glyph.'},
        {'t': 58.0, 'action': '"off": the sun is PRESSED; the shutter rolls all the way down (0.3 s, bounce); windows go dark one by one behind the slats; addrPill dims to grey.'},
        {'t': 58.24, 'action': '"until it can": clockTag pops and swings on the shutter handle; the hourglass keeps trickling.'},
        {'t': 59.04, 'action': '"That\'s what": whip pan left (0.4 s) into the S01 plaza, end-state: four shutters down, tags swinging.'},
        {'t': 59.52, 'action': '"government sites": the four clockTags pulse in sequence (0.08 stagger), flags wave, the dim addrPills glint.'},
        {'t': 60.16, 'action': '"did": Nell nods (small squash hop). 60.35 card tilts 2 deg for the flip.'},
    ],
    'sun': 'Home. Power button again (callback to S01): glyph on "switch" (57.52), pressed on "off" (58.0), fades by 58.7. Holds through the plaza callback.',
    'mascot': 'Sits watching the far worker (look right), impatient tail swish on "fast enough". When the shutter slams and the lights go out, only her dot eye and a white eye-glint read in the dark doorway shadow for a beat (58.1-58.5, gag). After the whip pan she is back at her S01 spot (760,1050) and nods on "did".',
    'sfx': [
        {'t': 54.4, 'sound': 'whoosh', 'notes': 'zoom in'},
        {'t': 55.04, 'sound': 'pop', 'notes': 'hourglass'},
        {'t': 55.68, 'sound': 'tick', 'notes': 'hourglass flip + sand trickle'},
        {'t': 56.56, 'sound': 'creak', 'notes': 'shutter strain'},
        {'t': 57.52, 'sound': 'pencil', 'notes': 'glyph'},
        {'t': 58.0, 'sound': 'power-off', 'notes': 'thunk + shutter slam rattle + lights clicking off'},
        {'t': 58.24, 'sound': 'click', 'notes': 'tag tink'},
        {'t': 59.04, 'sound': 'whoosh', 'notes': 'whip pan'},
        {'t': 59.52, 'sound': 'click', 'notes': '4 soft tinks'},
    ],
    'captions': [
        cap(54.56, 56.4, [("If a site can't", 54.56), ('update fast enough,', 55.28)], ('fast enough,', 55.68)),
        cap(56.4, 58.24, [('the safest thing is to', 56.4), ('switch it off', 57.52)], ('switch it off', 57.52)),
        cap(58.24, 59.04, [('until it can.', 58.24)]),
        cap(59.04, 60.56, [("That's what those", 59.04), ('government sites did.', 59.52)], ('government sites', 59.52)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S12', 'start': 60.56, 'end': 66.64,
    'title': 'Too old to fix',
    'transitionIn': {'type': 'flip', 'dur': 0.5, 'persist': ['sun', 'mascot'],
        'notes': '3D card flip 60.40-60.90, edge-on at 60.65. Back face: a street of three sites standing EXACTLY in S01 slots govA/govB/govC; slot D is a small pocket park.'},
    'setting': 'A street of three sites on PHP. The middle one is old: an outdated version the makers no longer service. The workshop\'s delivery cart rolls by.',
    'composition': 'siteL x 82-272 (modern townhouse, cream/sage), siteM x 280-478 (OLD classical facade whose silhouette = govB: pediment apex (379,360), columns; faded tan/grey, cracks, cobweb, vintage lamp, ivy), siteR x 486-676 (modern block peach/teal). Slot D x 684-878: pocket park, tree, bench, lamppost. Ground line y 820, sidewalk/street mintPale y 820-1095. Each site: door, addrPill, elephant plaque at the base. Cart path along y 900-1000 left>right.',
    'elements': [
        {'id': 'siteL', 'what': 'modern site, fresh plaque', 'where': '82,420,190,400', 'style': 'cream walls, sage trim'},
        {'id': 'siteM', 'what': 'old site, silhouette identical to govB (loop key)', 'where': '280,360,198,460', 'style': 'tan/grey faded fills, ink'},
        {'id': 'siteR', 'what': 'modern site, fresh plaque', 'where': '486,400,190,420', 'style': 'peach walls, teal trim'},
        {'id': 'oldPlaque', 'what': 'siteM plaque flips to an older version: chipped, faded, older elephant silhouette with a little ribbon', 'where': '(379,780) 40x30', 'style': 'faded periwinkle > tan'},
        {'id': 'aging', 'what': 'cracks, peeling patches, cobweb in the door corner, loose shutter slat, ivy', 'where': 'on siteM', 'style': 'ink thin, tan/grey patches, sage ivy'},
        {'id': 'fixCart', 'what': 'workshop cart with crate of new locks, elephant pennant, pushed by the worker', 'where': 'enters x -100 > exits x 900, y 900-1000', 'style': 'tan, cream, ' + PHP},
        {'id': 'noService', 'what': 'stamp: wrench in a circle with a slash', 'where': 'on siteM door (379,700) 44 px', 'style': 'ink + salmon'},
        {'id': 'ticks', 'what': 'ticks over siteL and siteR doors after new locks', 'where': 'above each door', 'style': 'ink + cream'},
        {'id': 'park', 'what': 'pocket park in slot D: tree, bench, lamppost', 'where': '684,600,194,220', 'style': 'sage, tan, ink'},
        {'id': 'mascot', 'what': 'Nell walking along the sidewalk, ends in front of siteM', 'where': 'ends (420,1040) scale 0.8', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 60.72, 'action': '"one": siteL pops up from its base (scaleY 0>1.1>1); 60.96 "in" siteM pops; 61.12 "three" siteR pops (counting three). Sun becomes a 1/3 pie (callback to S02\'s 7/10).'},
        {'t': 61.36, 'action': '"sites": addrPills pop on all three.'},
        {'t': 61.84, 'action': '"on PHP": elephant plaques pop at the three bases (0.08 stagger).'},
        {'t': 62.4, 'action': '"runs a version": siteM\'s plaque FLIPS (Y-rotate 0.3 s) to the old, chipped version; siteL and siteR desaturate 30% so the eye goes to siteM.'},
        {'t': 63.2, 'action': '"so old": cracks draw across siteM\'s plaster; 63.44 "old" paint peels (fills patch to tan/grey); 63.6 cobweb draws in the door corner; a shutter slat drops crooked.'},
        {'t': 64.08, 'action': '"the people who make PHP": the fixCart rolls in from the left, pennant fluttering, stops at siteL.'},
        {'t': 64.64, 'action': '"make": siteL gets a new lock (pop + click) and a tick.'},
        {'t': 65.52, 'action': '"don\'t fix it": the cart rolls straight past siteM without slowing; 65.76 "fix" the noService stamp thumps onto siteM\'s door.'},
        {'t': 66.0, 'action': '"anymore": the cart stops at siteR; 66.16 new lock + tick. siteM alone stays ajar and old.'},
    ],
    'sun': 'Home. 60.72-61.6: pie chart, 1/3 orange, 2/3 cream (rhyme with S02\'s 7/10), back to full by 62.2.',
    'mascot': 'Walks in along the sidewalk with the cart (walk-side) 64.1, stops in front of siteM at 65.5, watches the cart roll away (look right), then turns to the old door and shrugs (66.2, expression worried).',
    'sfx': [
        {'t': 60.4, 'sound': 'whoosh', 'notes': 'card flip'},
        {'t': 60.72, 'sound': 'pop', 'notes': '3 ascending pops 60.72/60.96/61.12'},
        {'t': 61.84, 'sound': 'pop', 'notes': 'plaques x3'},
        {'t': 62.4, 'sound': 'paper', 'notes': 'plaque flip flick'},
        {'t': 63.2, 'sound': 'crackle', 'notes': 'plaster cracks; 63.6 soft string pluck for the cobweb'},
        {'t': 64.08, 'sound': 'rumble', 'notes': 'cart'},
        {'t': 64.64, 'sound': 'click', 'notes': 'new lock + tick'},
        {'t': 65.76, 'sound': 'stamp', 'notes': 'soft stamp thud'},
        {'t': 66.16, 'sound': 'click', 'notes': 'new lock + tick'},
    ],
    'captions': [
        cap(60.56, 63.2, [('And one in three sites', 60.56), ('on PHP runs a version', 61.68)], ('one in three', 60.72)),
        cap(63.2, 65.52, [('so old that', 63.2), ('the people who make PHP', 64.08)], ('old', 63.44)),
        cap(65.52, 66.64, [("don't fix it anymore.", 65.52)], ('anymore.', 66.16)),
    ],
})

# =====================================================================================
scenes.append({
    'id': 'S13', 'start': 66.64, 'end': 70.687,
    'title': 'Switch off or hope',
    'transitionIn': {'type': 'zoom', 'dur': 0.45, 'persist': ['sun', 'mascot', 'siteM', 'siteL', 'siteR', 'park'],
        'notes': 'Same set as S12; push-in 66.50-66.95 (1 > 1.2) centred on siteM at (380,600). It pulls back to 1.0 during the un-build so the slots land on S01.'},
    'setting': 'The old site faces its two options: switch off, or hope the hosting company (the landlord\'s caretaker with a big key ring) sorts it out. Then the whole world un-builds back to the opening plaza.',
    'composition': 'As S12 pushed in 1.2x on siteM. Shutter housing appears over siteM\'s door. Caretaker enters from the right at x 520-600, y 800-1000. Un-build: fills drain into a tan slab that slides down out of the panel; line art of siteL/siteM/siteR cross-dissolves into govA/govB/govC line art in the same slots; govD line art draws into slot D over the park; plaza props draw in; sun sinks to (480,340) behind the roofline; Nell hops to (760,1050).',
    'elements': [
        {'id': 'siteM', 'what': 'old site with the faulty door, shutter housing', 'where': 'S12 slot B, pushed 1.2x', 'style': 'faded tan/grey'},
        {'id': 'shutterM', 'what': 'roll-down shutter on siteM', 'where': 'over siteM door', 'style': 'grey, ink ribs'},
        {'id': 'caretaker', 'what': 'hosting-company caretaker: back view, cap, big key ring, toolbox, short ladder', 'where': '520,800,80,200', 'style': 'sage overalls, tan toolbox, ink keys'},
        {'id': 'unbuildSlab', 'what': 'all scene fills collapse into one tan slab that slides down out of the panel (reference ending move)', 'where': 'panel width, y 400 > 1100', 'style': 'tan'},
        {'id': 'govRowLineArt', 'what': 'S01 plaza line art (white fills) revealed: the loop target', 'where': 'S01 geometry exactly', 'style': 'ink + card white'},
        {'id': 'mascot', 'what': 'Nell in front of siteM, then hops back to her frame-0 spot', 'where': '(420,1040) > (760,1050)', 'style': 'periwinkle'},
    ],
    'beats': [
        {'t': 66.64, 'action': '"For those": push-in on siteM; siteL and siteR desaturate further.'},
        {'t': 67.28, 'action': '"it\'s": shutter housing draws on over siteM\'s door.'},
        {'t': 67.6, 'action': '"switch": sun inks a smaller, fainter power glyph.'},
        {'t': 68.0, 'action': '"off": sun pressed; shutterM rolls down (0.3 s); siteM windows go dark.'},
        {'t': 68.56, 'action': '"or": shutterM rattles back UP 35% (the other option): a slice of warm light spills under it.'},
        {'t': 68.8, 'action': '"hope": sun glows (pulse 1.1, soft cream halo ring); Nell looks up hopefully.'},
        {'t': 69.2, 'action': '"the hosting company": caretaker slides in from the right with key ring and toolbox, stops at siteM\'s door, sets the short ladder down; keys jingle.'},
        {'t': 69.84, 'action': '"sorts it out": caretaker raises the key ring toward the lock... we never see the result (honest open ending).'},
        {'t': 70.0, 'action': 'UN-BUILD: camera eases back 1.2 > 1.0 (70.0-70.3); all fills collapse downward into the tan unbuildSlab which slides out the bottom (70.0-70.45); caretaker, cart, ticks and props fade to line art and vanish; siteL/siteM/siteR line art morphs into govA/govB/govC; govD line art and plaza props draw in (70.15-70.5).'},
        {'t': 70.1, 'action': 'Sun sinks from home to (480,340), clipped by the roofline (70.1-70.65) = frame-0 position.'},
        {'t': 70.4, 'action': 'Caption rolls to "Government websites" (line 1 only, 0.28 s) = frame-0 caption. 70.687 last frame == frame 0.'},
    ],
    'sun': 'Small power-button press on "off" (67.6-68.2). Glows on "hope" (68.8). Sinks behind the roofline to its frame-0 rise position during the un-build so the next loop rises from there.',
    'mascot': 'Sits in front of siteM. On "switch off" covers her eyes with her ear (ears-cover). On "hope" looks up (trunk-up, expression happy). Looks at the caretaker on "hosting company". During the un-build she hops twice to (760,1050) and settles into sit-back looking up (70.05-70.6): her frame-0 pose. She is the one thing that never un-builds (stays in colour), exactly like the reference cat.',
    'sfx': [
        {'t': 66.5, 'sound': 'whoosh', 'notes': 'push-in'},
        {'t': 67.28, 'sound': 'pencil', 'notes': 'housing draw'},
        {'t': 68.0, 'sound': 'power-off', 'notes': 'softer thunk + shutter rattle'},
        {'t': 68.56, 'sound': 'shutter', 'notes': 'rattle up'},
        {'t': 68.8, 'sound': 'chime', 'notes': 'warm hopeful chime'},
        {'t': 69.2, 'sound': 'keys', 'notes': 'footsteps + key jingle'},
        {'t': 70.0, 'sound': 'erase', 'notes': 'reverse pencil swish + paper slide (un-build)'},
        {'t': 70.4, 'sound': 'whoosh', 'notes': 'tail that must crossfade into the frame-0 sun-rise whoosh (loop seam)'},
    ],
    'captions': [
        cap(66.64, 68.56, [("For those, it's", 66.64), ('switch off', 67.6)], ('switch off', 67.6)),
        cap(68.56, 70.4, [('or hope the hosting', 68.56), ('company sorts it out.', 69.52)], ('hope', 68.8)),
        cap(70.4, 70.687, [('Government websites', 70.4)]),
    ],
})

# ---------- attach VO text ----------
for sc in scenes:
    sc['vo'] = vo_between(sc['start'], sc['end'] if sc['id'] != 'S13' else 99)

# reorder keys to the strict schema order
ORDER = ['id', 'start', 'end', 'vo', 'title', 'transitionIn', 'setting', 'composition', 'elements', 'beats', 'sun', 'mascot', 'sfx', 'captions']
scenes = [{k: sc[k] for k in ORDER} for sc in scenes]

doc = {
    'fps': 30,
    'duration': 70.687,
    'mascot': {
        'name': 'Nell',
        'design': 'An original baby elephant (a nod to the PHP "elePHPant", not the official mascot): bean-shaped body, short column legs with cream toenails, one big D-shaped ear that is her emotion dial (flaps, flattens, folds over her eyes), a short curled trunk that is her gesture tool (shh, reach, hold a tiny prop), tufted tail, dot eye with blink, small salmon cheek. No tusks, no text, no logo. About 100 px tall sitting at scale 1; used at 0.6-0.9 so she reads at the size of the reference cat. Built from src/lib/mascot (poses: sit-back, sit-front, stand-side, walk-side, peek, trunk-up, hold, ears-cover, shrug, sleep).',
        'colorway': 'Periwinkle (src/lib/mascot/colors.ts MASCOT_COLORWAY): body #8D90CC, shade #7377B5, inner ear + cheek salmon, toenails cream, lines theme ink. The PHP stamps and plaques use the same periwinkle on purpose, so "elephant colour" = PHP everywhere in the film.',
    },
    'scenes': scenes,
    'loop': 'S13 ends with an un-build: every fill collapses into a tan slab that slides down out of the panel (the reference ending move) while the old building, which stands in govB\'s exact slot and silhouette, and its neighbours in slots A and C morph back into the S01 government line art; govD draws into slot D. The sun sinks behind the roofline to (480,340), Nell hops back to (760,1050) in sit-back, and the caption rolls to "Government websites". The last frame (70.687) is pixel-equivalent to frame 0, where the sun is rising from that same spot, so the video restarts with the sun coming up on the line-art capitol and colour flooding in on "Government". The final VO line ("switch off") also lands on the same image the opening line describes, so the loop reads as a story circle, not only a visual one.',
}

# ---------- validation ----------
errs = []
prev_end = 0.0
for sc in doc['scenes']:
    if abs(sc['start'] - prev_end) > 1e-6:
        errs.append(f"{sc['id']}: gap/overlap {prev_end} -> {sc['start']}")
    prev_end = sc['end']
    d = sc['end'] - sc['start']
    if not (3.4 <= d <= 8.3):
        errs.append(f"{sc['id']}: duration {d:.2f}")
    for b in sc['beats']:
        if not (sc['start'] - 0.5 <= b['t'] <= sc['end'] + 1e-6):
            errs.append(f"{sc['id']}: beat t {b['t']} outside scene")
    for c in sc['captions']:
        if len(c['lines']) > 2:
            errs.append(f"{sc['id']}: >2 lines")
        if len(c['highlights']) > 1:
            errs.append(f"{sc['id']}: >1 highlight")
        for ln in c['lines']:
            if len(ln['text']) > 24:
                errs.append(f"{sc['id']}: line too long ({len(ln['text'])}): {ln['text']}")
            if not (c['s'] - 1e-6 <= ln['s'] <= c['e']):
                errs.append(f"{sc['id']}: line start outside caption: {ln}")
        for h in c['highlights']:
            if not any(h['text'] in ln['text'] for ln in c['lines']):
                errs.append(f"{sc['id']}: highlight not in lines: {h['text']}")
if abs(prev_end - doc['duration']) > 1e-6:
    errs.append(f'last scene ends {prev_end}')

# caption text == VO (excluding the loop pre-roll caption)
cap_words = []
for sc in doc['scenes']:
    for c in sc['captions']:
        if c['s'] >= 70.4:
            continue
        for ln in c['lines']:
            cap_words += norm(ln['text'])
vo_words = norm(' '.join(w['w'] for w in words))
if cap_words != vo_words:
    for i, (a, b) in enumerate(zip(cap_words, vo_words)):
        if a != b:
            errs.append(f'caption/VO mismatch at word {i}: caption "{a}" vs VO "{b}" ctx {cap_words[i-3:i+3]}')
            break
    if len(cap_words) != len(vo_words):
        errs.append(f'caption words {len(cap_words)} vs VO words {len(vo_words)}')

# line start must coincide with the start of its first word (+- 0.05) except pre-roll lines
starts = {}
for w in words:
    starts.setdefault(norm(w['w'])[0] if norm(w['w']) else w['w'], []).append(w['s'])
for sc in doc['scenes']:
    for c in sc['captions']:
        for ln in c['lines']:
            first = norm(ln['text'])[0]
            ok = any(abs(s - ln['s']) <= 0.05 for s in starts.get(first, []))
            if not ok and ln['s'] not in (0.0, 70.4) and ln['s'] != c['s']:
                errs.append(f"{sc['id']}: line '{ln['text']}' start {ln['s']} not on a word start")

# longest gap between beats (visual change cadence)
gaps = []
for sc in doc['scenes']:
    ts = sorted([sc['start']] + [b['t'] for b in sc['beats']] + [sc['end']])
    g = max(b - a for a, b in zip(ts, ts[1:]))
    gaps.append((sc['id'], round(g, 2)))

with open(OUT, 'w') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False)

print('scenes', len(doc['scenes']), 'beats', sum(len(s['beats']) for s in doc['scenes']))
print('max beat gap per scene', gaps)
print('ERRORS' if errs else 'OK', *errs, sep='\n')

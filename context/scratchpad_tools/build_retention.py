#!/usr/bin/env python3
"""Builds docs/storyboard_drafts/retention.json and validates it against the brief's rules."""
import json, sys

OUT = "/home/user/Test-/video/docs/storyboard_drafts/retention.json"

def L(text, s):
    return {"text": text, "s": s}

def C(s, e, lines, hl=None):
    return {"s": s, "e": e, "lines": lines, "highlights": ([{"text": hl[0], "s": hl[1]}] if hl else [])}

def E(id_, what, where, style):
    return {"id": id_, "what": what, "where": where, "style": style}

def B(t, action):
    return {"t": t, "action": action}

def S(t, sound, notes=""):
    return {"t": t, "sound": sound, "notes": notes}

mascot = {
    "name": "Pip",
    "design": (
        "An original baby elephant, about the size the reference cat reads at (70-90 px tall in card-local units). "
        "Bean-shaped body, four short column legs with three cream toenail arcs each, ONE big D-shaped ear (the emotion "
        "dial: perked = alert, flared = startled, droopy = sad, folded over the eyes = scared), a short trunk with a curl "
        "at the tip and three ink wrinkle ticks (our answer to the cat's stripes), a tiny tufted tail, a single dot eye, "
        "no tusks, no clothes, no text on the body. Hand-inked outline in theme ink with small overshoots; flat fill "
        "slightly misregistered like the rest of the art. Usually seen side-on or three-quarter-back, watching the "
        "explanation like the cat does; faces camera exactly once (S04 'right?'). Trunk gestures carry the gags: curl to "
        "mouth = 'shh', crossed trunk = 'fingers crossed', raised = pose-match / yawn, tapping = testing a padlock. "
        "Differs from the official elePHPant: rounder and smaller, single visible ear, no logo, no 'php' lettering."
    ),
    "colorway": (
        "Periwinkle, matching src/lib/mascot/colors.ts (body #8D90CC, shade #7377B5, earInner palette.salmon, cheek "
        "palette.salmon, nails palette.cream, ink palette.ink). Color code taught by the video: periwinkle = PHP. It is "
        "used ONLY for Pip and for the small elephant cornerstone emblems / PHP markers (S02 tally, S10 dots, S12 "
        "emblems). Orange stays reserved for the sun and the 'attention' accents, peach for highlights and the patch. "
        "Pip is therefore the single cool-violet shape in every frame, so the eye finds him instantly without him "
        "competing with the orange disc."
    ),
}

scenes = []

# ---------------------------------------------------------------- S01
scenes.append({
    "id": "S01", "start": 0.0, "end": 4.72,
    "vo": "Government websites in four countries just switched themselves off. Nobody hacked them.",
    "title": "Four capitols power down",
    "transitionIn": {"type": "loop-start", "dur": 0.0, "persist": ["sun", "mascot", "govA", "govB", "govC", "govD", "bugHidden"],
                     "notes": "Frame 0 is the exact frame the S13 un-build ends on: complete ink linework of this plaza, mint sky block, orange sun with a faint (60% cream) power glyph, periwinkle Pip, no other fills, empty caption zone. Fills flood in on the first word so the very first half-second already moves."},
    "setting": "A civic plaza on 'Web Street': four government buildings from four different countries, each with its main window drawn as a browser window (three dots + address bar). Websites are buildings; this is the city metaphor for the whole film.",
    "composition": "Mint sky block y 95-560. Back row: govC (brick tower) x 110-380 y 280-560 and govD (modern slab) x 580-870 y 260-560, bottoms hidden behind the front row. Front row: govA (columned portico + pediment) x 80-470 y 470-905 and govB (domed hall, dome y 420-520) x 490-880 y 440-905. Plaza paving in light perspective y 905-1095 (mintPale), lamp posts at x 120 and x 840 (y 760-1050), five back-view citizens x 300-560 y 975-1070. A phone/power wire with three pigeons spans x 70-890 at y ~250 between the back buildings. Pip on the plaza x 680-760 y 990-1070 facing the buildings. Palette: facades cream/peach/tan, columns cream, glass mintPale, doors and shutters teal/tealDark, pennants salmon/teal/sage/brown, orange only in the sun.",
    "elements": [
        E("skyBlock", "Mint sky block of the illustration panel", "70,95,820,465", "fill bg"),
        E("govA", "Columned civic hall: 6 columns, triangular pediment, 3 steps, arched 'browser window' as its main window", "80,470,390,435", "ink + cream facade, peach pediment, columns cream with ink flutes"),
        E("govB", "Domed civic hall: dome with lantern, 4 columns, wide 'browser window' entrance", "490,420,390,485", "ink + peach facade, tan dome with teal ribs"),
        E("govC", "Brick civic tower, narrow, with a tall browser window", "110,280,270,280", "ink + tan brick hatch, brown cornice"),
        E("govD", "Modern government slab with window grid and a glass browser-window lobby", "580,260,290,300", "ink + sage panels, mintPale glass"),
        E("browserWindows", "Four main windows: rounded rect frame, three dots top-left, address bar line; warm glow inside", "one per building, ~170x120 each", "ink frame, cream/peach glow fill, dots salmon/sage/cream"),
        E("pennants", "Four abstract pennants on rooftop poles (dot, chevron, stripe, star patterns) standing for four countries. NOT real national flags", "one per roof, ~60x36", "salmon/teal, sage/cream, brown/peach, tealDark/cream"),
        E("shutters", "Rolled roller-shutters above each browser window; drop down to cover the window", "same boxes as browserWindows", "tealDark with ink slat lines"),
        E("padlocks", "Four small padlocks on the shutter bottom bars", "~26x30 each", "ink + brown body, cream shackle glint"),
        E("plaza", "Paving lines, two lamp posts, five back-view citizens (simple heads + coats)", "70,905,820,190", "mintPale ground, coats teal/brown/salmon/sage"),
        E("pigeons", "Three pigeons on the wire", "~x 330-470, y 240-256", "ink + grey"),
        E("bugHidden", "Easter egg: the beetle 'Bit' (13 px) sitting on govA's cornice, never pointed at", "300,466,13,9", "ink body, one peach dot"),
        E("pip", "Mascot watching the buildings", "680,990,80,80", "mascot colorway"),
        E("dimWash", "Night/dim overlay for 'switched off'", "whole panel", "tealDark multiply, 0 -> 35%"),
    ],
    "beats": [
        B(0.0, "Frame 0 = loop seam: linework + sky + sun (faint power glyph) + Pip only. Slow camera push 1.00 -> 1.035 across the whole scene, back row moves 40% slower (parallax). Pennant outlines flutter."),
        B(0.16, "'Government': fills flood in bottom-up, building by building (govA, govB, govC, govD; 0.35 s wipe each, 0.08 s stagger), plaza mintPale wipes in 0.1 s later. Fills sit 3 px off the ink."),
        B(0.56, "'websites': the four main windows reveal browser chrome: three dots pop (0.04 s stagger, overshoot), address bar draws on (0.2 s), warm glow fades up. This is the 'buildings are websites' reveal."),
        B(1.12, "'in': five back-view citizens slide up 20 px into the plaza with overshoot, staggered 0.06 s; Pip's ear perks."),
        B(1.36, "'four': four pennants unfurl one per building at 1.36 / 1.48 / 1.60 / 1.72 (scaleX 0 -> 1, snap)."),
        B(2.32, "'switched': a bold cream power glyph draws onto the sun (0.25 s), replacing the faint one."),
        B(2.80, "'themselves': shutters drop by themselves (no hands, no people): govA 2.80, govB 3.04, govC 3.28, govD 3.44, each 0.18 s with a 6 px bounce. The window glow disappears behind each one."),
        B(3.28, "'off': the sun presses in (scale 1 -> 0.88 -> 1 over 0.3 s, one ink ripple ring), dimWash ramps to 35% in 0.3 s, lamp posts go dark, the three pigeons flap off the wire. Only the sun and Pip stay bright. Pip's ear flares (startled) with a tiny '!' tick."),
        B(3.76, "'Nobody': padlocks pop onto the four shutters (3.76 / 3.86 / 3.96 / 4.06), each with a short glint."),
        B(4.08, "'hacked': Pip trots 30 px to govB's shutter and taps its padlock with his trunk at 4.30; the lock jiggles and holds."),
        B(4.48, "'them': all four locks glint at once. Nothing is broken: windows intact, no intruders anywhere."),
    ],
    "sun": "Starts as the plain orange disc carrying a faint power glyph (the loop seam). On 'switched' the glyph inks in bold; on 'off' the disc is pressed like a power button and stays the brightest thing in the dimmed world. Glyph fades out during the S02 transition.",
    "mascot": "Stands on the plaza watching the buildings light up (ear perks on 'in'), flinches on 'off' (ear flares), then on 'hacked' trots over and taps a padlock with his trunk: it holds. Small, bottom-right, never between the viewer and the buildings.",
    "sfx": [
        S(0.16, "swish", "soft fill-flood whoosh"),
        S(0.56, "pop", "three tiny pops per window, very quiet"),
        S(1.36, "flag-snap", "four quick cloth snaps"),
        S(2.32, "pencil", "short ink stroke on the sun"),
        S(2.80, "clack", "shutter 1 of 4"), S(3.04, "clack", "shutter 2"), S(3.28, "power-off", "low thunk + hum drop, under shutter 3"), S(3.44, "clack", "shutter 4"),
        S(3.40, "wings", "pigeons leave"),
        S(3.76, "click", "padlock pops x4"),
        S(4.30, "tok", "trunk taps a solid lock"),
    ],
    "captions": [
        C(0.16, 2.16, [L("Government websites", 0.16), L("in four countries", 1.12)], ("four countries", 1.36)),
        C(2.16, 3.76, [L("just switched", 2.16), L("themselves off.", 2.80)], ("themselves", 2.80)),
        C(3.76, 4.80, [L("Nobody hacked them.", 3.76)], ("Nobody", 3.76)),
    ],
})

# ---------------------------------------------------------------- S02
scenes.append({
    "id": "S02", "start": 4.72, "end": 10.80,
    "vo": "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites.",
    "title": "What's under the street",
    "transitionIn": {"type": "push", "dur": 0.6, "persist": ["sun", "mascot", "govA", "govB", "govC", "govD"],
                     "notes": "4.72-5.32: camera pulls back and tilts DOWN. The four (still shuttered) civic buildings shrink to 0.42 and settle into a street row at the top; six more buildings slide in from the sides; the ground below opens as a cross-section (soil wipes in top-down). The dim wash lifts as we pass underground. The sun stays fixed at card level."},
    "setting": "Cross-section of Web Street: ten small buildings on top, and under each one its own foundation block. Seven foundations are identical brick blocks stamped with a small periwinkle elephant cornerstone (each a copy of PHP); three sit on plain grey concrete (other tech).",
    "composition": "Mint sky y 95-210. Street row of 10 buildings x 80-880, tops y 210-350, ground line y 470. Order L->R: house, govA', shop, govB', pressHouse, apartment, govC', bakery, govD', tower (shop, bakery, tower are the non-PHP three). Foundations y 490-640 under each building (width = building width): PHP ones teal brick with code glyphs and a 22 px periwinkle elephant cornerstone, non-PHP ones grey concrete. Soil (tan, pebble dots, root lines) y 470-1000. Work shaft with two hard-hat workers + work lamp under govB' x 300-360 y 520-660. Pip in a little burrow chamber bottom-left x 100-190 y 870-960. Tally row of 10 house pictograms x 180-780 y 1010-1070.",
    "elements": [
        E("streetRow", "Ten small buildings, each with a tiny browser window; the four gov ones keep their shutters down", "80,210,800,260", "ink + cream/peach/tan/sage facades"),
        E("pressHouse", "Little print house (the WordPress stand-in): press-roller sign, paper stacks in the window. No logo", "380,250,80,220", "ink + salmon facade, cream paper"),
        E("foundations", "Ten foundation blocks; 7 PHP (brick + elephant cornerstone), 3 grey concrete", "80,490,800,150", "PHP: teal fill, ink brick lines, periwinkle emblem; others: grey"),
        E("codeGlyphs", "Tiny glyphs inked on the PHP bricks: { } < > $ ;", "on PHP foundations", "cream ink on teal"),
        E("crack", "One zig-zag crack, identical in all 7 PHP foundations", "same local spot in each block", "ink, 3 px"),
        E("bugBit", "The beetle, peeking out of govB' foundation crack", "330,560,16,11", "ink body, peach dot"),
        E("workShaft", "Narrow shaft beside govB' foundation with two back-view hard-hat workers and a work lamp", "300,520,60,140", "ink + salmon hats, peach lamp cone"),
        E("pipes", "Short service pipes from each PHP foundation up into its building", "x of each PHP building, y 470-490", "ink, glow sun at 40% when lit"),
        E("soil", "Soil cross-section with pebbles and roots", "70,470,820,530", "tan fill, brown pebbles"),
        E("tally", "Ten little house pictograms in a row", "180,1010,600,60", "ink outlines; 7 fill periwinkle, 3 fill grey"),
        E("pip", "Mascot in a burrow chamber, looking at the nearest elephant cornerstone", "100,870,90,90", "mascot colorway"),
    ],
    "beats": [
        B(4.72, "Push: tilt down + pull back (0.6 s, ease in-out). Soil draws on as the camera moves; dim wash lifts to 0."),
        B(4.80, "'They': work lamp in the shaft under govB' switches on (peach cone)."),
        B(5.04, "'fixing': the two workers swing wrenches (2-pose loop, 0.25 s per swing)."),
        B(5.44, "'security': the crack draws through ALL seven PHP foundations at once (0.3 s zig-zag draw-on) - the same flaw in every copy."),
        B(5.84, "'bug': Bit pops out of govB' crack (overshoot), scurries 30 px, ducks back in at 6.60."),
        B(6.32, "'PHP': periwinkle elephant cornerstones stamp onto the 7 PHP foundations, left to right, 0.05 s stagger; teal fills wipe in behind them. At 6.45 Pip copies the emblem's pose (trunk up, one foot raised) - pose-match gag."),
        B(7.20, "'programming language': code glyphs ripple across the PHP bricks left to right (0.6 s)."),
        B(8.24, "'WordPress': pressHouse bounces (scale 1.08) and puffs three paper sheets that flutter down onto the street."),
        B(9.04, "'about': the tally row of 10 outlined house pictograms draws on (0.3 s)."),
        B(9.36, "'7': pictograms 1-7 fill periwinkle one by one (0.07 s stagger, rising ticks); the matching seven pipes glow."),
        B(9.88, "'10': pictograms 8-10 fill grey; the three non-PHP buildings get a brief grey outline pulse."),
        B(10.08, "'websites': hold. Pip nods once."),
    ],
    "sun": "Back to its plain self (power glyph fades during the push) and stays fixed while the world moves under it.",
    "mascot": "Sits in a tiny burrow in the soil like an ant-farm resident, watching the cornerstones; on 'PHP' strikes the same pose as the carved elephant (rewatch gag: the mascot is a little PHP).",
    "sfx": [
        S(4.72, "whoosh", "downward push"),
        S(5.04, "clank", "wrench, x2"),
        S(5.44, "crack", "dry stone crack"),
        S(5.84, "skitter", "tiny legs"),
        S(6.32, "stamp", "seven soft stamps, rising"),
        S(8.24, "paper", "flutter"),
        S(9.36, "tick", "seven ticks rising in pitch"),
    ],
    "captions": [
        C(4.80, 7.04, [L("They were fixing", 4.80), L("a security bug in PHP,", 5.36)], ("PHP", 6.32)),
        C(7.04, 8.88, [L("the programming language", 7.04), L("behind WordPress", 8.00)], ("WordPress", 8.24)),
        C(8.88, 10.88, [L("and about 7 out of 10", 8.88), L("websites.", 10.08)], ("7 out of 10", 9.36)),
    ],
})

# ---------------------------------------------------------------- S03
scenes.append({
    "id": "S03", "start": 10.80, "end": 15.70,
    "vo": "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere.",
    "title": "The two-step board",
    "transitionIn": {"type": "flip", "dur": 0.5, "persist": ["sun", "mascot"],
                     "notes": "10.55-11.05: card tilts ~3 deg and flips on the Y axis, edge-on exactly at 10.80, just before 'Fixing'. Introduces the persistent object of the film: a two-pane notice board (our version of the reference's bulletin board)."},
    "setting": "A sunny wall on the street with a two-pane public notice board, a teal double door on the right and three passers-by reading it, staged like the reference's bulletin-board shots.",
    "composition": "Sky strip y 95-180. Wall (cream with peach band) y 180-900, cornice line y 220. Board x 190-770 y 360-760 on two legs down to y 900; pane1 x 205-475, pane2 x 485-755; painted numerals '1' and '2' above each pane (y 300-350). Teal double door x 790-890 y 420-900 (cropped). Sidewalk mintPale y 900-1095 with three back-view readers x 330-640 y 930-1095. Pip sits on top of the board at x 440-530 y 285-360, trunk dangling over the frame like the cat's tail.",
    "elements": [
        E("wall", "Facade with cornice, pipe and a small round clock-less vent", "70,180,820,720", "cream fill, peach band, ink lines"),
        E("board", "Two-pane notice board on legs (persistent object; returns in S09 and S13)", "190,300,580,600", "tealDark frame, mintPale glass"),
        E("numerals", "Hand-painted '1' and '2' above the panes", "300,300 and 590,300, ~50 px tall", "ink on peach plaque"),
        E("wantedSheet", "Notice pinned in pane 1: a sketch of Bit and the crack under a big '?'", "240,400,200,240", "cream paper, ink sketch"),
        E("magnifierIcon", "Magnifier icon drawn over pane 1 (step one: find)", "250,420,180,180", "ink, lens mintPale, glint cream"),
        E("patchIcon", "Band-aid style patch icon in pane 2 (step two: fix). The film's 'fix' object", "540,470,160,80", "peach strip, cream pad, ink dots"),
        E("patchStickers", "16 small patches that multiply across the wall on 'everywhere'", "spiral around the board, ~50x24 each", "peach + cream"),
        E("door", "Teal double door, cropped at the right edge", "790,420,100,480", "teal, tealDark panels"),
        E("readers", "Three back-view passers-by", "330,930,310,165", "coats teal/brown/sage, simple heads"),
        E("pip", "Mascot sitting on the board's top rail", "440,285,90,80", "mascot colorway"),
        E("bugHidden", "Easter egg: Bit sitting on the board's left leg, in plain sight", "212,860,13,9", "ink"),
    ],
    "beats": [
        B(10.80, "Flip lands. Board linework draws on (0.4 s), fills follow 0.15 s behind."),
        B(11.28, "'bug': the wanted-style sheet pins into pane 1 (pop + pin)."),
        B(12.24, "'two': numerals '1' (12.24) and '2' (12.36) pop with overshoot. The sun does two small hops, one per word: 12.24 and 12.48 ('step, step')."),
        B(12.48, "'steps': pane glass fills wipe in."),
        B(13.12, "'First': pane 1 frame warms (peach glow), pane 2 dims to 70%."),
        B(13.68, "'find': magnifier icon draws over pane 1 (0.3 s), lens glint."),
        B(14.32, "'Then': focus swaps: pane 2 warms, pane 1 dims."),
        B(14.80, "'fix': patch icon pops into pane 2 with squash and stretch."),
        B(15.20, "'everywhere': 16 patch stickers burst out of pane 2 and slap onto the wall in a spiral (0.025 s stagger). One lands on Pip's head at 15.50; he shakes it off at 15.60."),
    ],
    "sun": "Plain disc. Hops twice on 'two steps' (12 px up each, 0.12 s), a playful count.",
    "mascot": "Sits on top of the board exactly like the reference cat on its bulletin board, trunk hanging over pane 1. Gets hit by a flying patch sticker on 'everywhere' and shakes it off.",
    "sfx": [
        S(10.80, "whoosh", "card flip"),
        S(11.28, "pin", "thumbtack"),
        S(12.24, "pop", "x2 numerals"),
        S(13.68, "pencil", "magnifier draw"),
        S(14.80, "pop", "patch squash"),
        S(15.20, "pop", "rapid pop-pop-pop flurry, 16 tiny pops"),
        S(15.50, "boing", "soft, sticker on Pip"),
    ],
    "captions": [
        C(10.88, 13.12, [L("Fixing a bug like that", 10.88), L("takes two steps.", 12.00)], ("two steps", 12.24)),
        C(13.12, 14.32, [L("First, you find it.", 13.12)], ("find", 13.68)),
        C(14.32, 15.76, [L("Then, you fix it", 14.32), L("everywhere.", 15.20)], ("everywhere", 15.20)),
    ],
})

# ---------------------------------------------------------------- S04
scenes.append({
    "id": "S04", "start": 15.70, "end": 21.56,
    "vo": "You'd think finding it is the hard part, right? And for 14 years, nobody did.",
    "title": "Fourteen years in plain sight",
    "transitionIn": {"type": "zoom", "dur": 0.5, "persist": ["sun", "mascot", "magnifierIcon"],
                     "notes": "15.62-16.12: iris zoom THROUGH the pane-1 magnifier lens: the lens circle expands from (340,510) to cover the panel, revealing the foundation close-up inside it; the magnifier itself becomes the big searching magnifier of this scene."},
    "setting": "Close cross-section of one PHP foundation (from S02) with the street above. Time-lapse: above ground the city lives and changes for 14 years; below, the crack and its beetle sit untouched.",
    "composition": "Sky y 95-260, building base and street above ground y 180-480 (door, two windows, a tree at x 760-860 y 260-480), ground line y 480. Foundation block x 140-820 y 520-900 (teal bricks, code glyphs), elephant cornerstone x 170-260 y 800-880, crack centered x 430-520 y 560-760 with Bit in it. Tear-off calendar nailed to the foundation at x 670-790 y 560-700. Vault floor y 900-1000 where Pip naps at x 600-700 y 900-980. Above ground, three back-view searchers with magnifiers walk along y 400-480.",
    "elements": [
        E("foundationClose", "One PHP foundation block, big", "140,520,680,380", "teal, ink bricks, cream code glyphs"),
        E("cornerstone", "Periwinkle elephant emblem cornerstone", "170,800,90,80", "periwinkle relief, ink"),
        E("crack", "The crack, with a little cobweb that grows across one corner during the time-lapse", "430,560,90,200", "ink; cobweb ink 1.5 px"),
        E("bugBit", "Bit in the crack, in plain sight", "468,650,16,11", "ink, peach dot"),
        E("bigMagnifier", "Large magnifier: circular clip shows bricks at 1.6x behind the lens", "lens r 110, sweeps x 220-720 at y 640", "ink rim, cream glint"),
        E("calendar", "Tear-off calendar showing big year numerals 1..14", "670,560,120,140", "cream pages, ink numerals, salmon header"),
        E("streetAbove", "Building base with door/windows, tree, lamp", "70,180,820,300", "peach/cream facade; tree cycles sage -> salmon -> bare -> sage"),
        E("crane", "A small construction crane that appears and leaves mid time-lapse; the building above grows one storey", "560,120,200,200", "ink + salmon"),
        E("searchers", "Three back-view people with magnifiers walking above ground", "y 400-480, cycle across", "coats teal/brown/sage"),
        E("pip", "Mascot on the vault floor; turns to camera, then naps", "600,900,100,80", "mascot colorway; Zzz in ink"),
    ],
    "beats": [
        B(15.76, "'You'd think': vault is open; bigMagnifier glides in from the left."),
        B(16.24, "'finding': the magnifier sweeps across the bricks (lens magnifies what it passes). As it passes over the crack (16.80) Bit ducks behind a brick edge, then pops back up after it has gone (17.10)."),
        B(17.04, "'hard part': the magnifier slows with a heavy wobble; three searchers pop in above ground, magnifiers raised, looking the wrong way."),
        B(17.92, "'right?': Pip turns to camera (the only front view of the film: two dot eyes), one ear raised like an eyebrow, a small '?' pops."),
        B(18.56, "'And': the calendar pops onto the wall with a nail tap. The magnifier exits right."),
        B(18.88, "'14': TIME-LAPSE 18.88-20.32. Calendar pages tear off 1 -> 14 (14 tears, ease-out: fast first, slower last). Sky above ground pulses day/night per year. The tree cycles seasons, searchers walk in and out, the crane arrives, the building above grows a storey, the crane leaves. The cobweb spins across the crack corner. Pip curls up and falls asleep (Zzz) at 19.20. Bit doesn't move."),
        B(20.32, "'nobody': everything snaps still on year 14. Silence beat."),
        B(21.04, "'did': Bit strolls out of the crack and walks across sleeping Pip's trunk; Pip snores a tiny puff and doesn't wake."),
    ],
    "sun": "Becomes a clock face on '14': 12 cream tick marks ink in, two cream hands spin 14 laps (in sync with the calendar tears, decelerating), then ticks and hands fade at 20.32 and it is the plain disc again.",
    "mascot": "The fourth-wall beat: turns to the viewer on 'right?'. Then sleeps through the whole 14-year time-lapse, and the bug walks over him on 'nobody did' (rewatch gag: the bug is literally sitting on the elephant).",
    "sfx": [
        S(15.62, "whoosh", "iris zoom"),
        S(16.24, "glass-slide", "magnifier sweep"),
        S(17.92, "pop", "tiny '?'"),
        S(18.56, "tap", "nail"),
        S(18.88, "paper", "rolling tear-off flutter, 14 tears decelerating"),
        S(18.88, "tick", "fast clock ticks under the time-lapse, slowing"),
        S(20.32, "stop", "everything stops: brief silence"),
        S(21.04, "skitter", "plus a tiny snore"),
    ],
    "captions": [
        C(15.76, 18.56, [L("You'd think finding it", 15.76), L("is the hard part, right?", 16.72)], ("hard part", 17.04)),
        C(18.56, 21.68, [L("And for 14 years,", 18.56), L("nobody did.", 20.32)], ("14 years", 18.88)),
    ],
})

# ---------------------------------------------------------------- S05
scenes.append({
    "id": "S05", "start": 21.56, "end": 25.40,
    "vo": "Then, in August, two security teams using AI tools found it",
    "title": "Found",
    "transitionIn": {"type": "matchcut", "dur": 0.3, "persist": ["sun", "mascot", "foundationClose", "crack", "bugBit", "calendar", "cornerstone"],
                     "notes": "Same vault, same objects; light shifts from the time-lapse night to summer day and the camera starts a slow push-in (1.00 -> 1.12 over the scene) toward the crack."},
    "setting": "The same foundation vault in summer. Two security teams climb down through two street hatches with AI-assisted scanners and catch the bug in their beams.",
    "composition": "Same layout as S04, camera pushing toward the crack. Hatches in the ground line at x 180-260 and x 700-780 (y 470-490), ladders down to y 900. Team A (2 back-view people with headlamps) on the left ladder, team B (2) on the right. Scanner beams are translucent peach cones that converge on the crack (x 475, y 650). Pip awake-able on the floor x 600-700 y 900-980.",
    "elements": [
        E("calendarAug", "Calendar's last page tears to reveal a month page reading 'AUG'", "670,560,120,140", "cream page, salmon header, ink letters"),
        E("hatchL", "Street hatch + ladder, left", "180,470,80,430", "tealDark hatch, ink ladder"),
        E("hatchR", "Street hatch + ladder, right", "700,470,80,430", "tealDark hatch, ink ladder"),
        E("teamA", "Two back-view security people with headlamps", "170,700,120,200", "coats teal/sage, salmon headlamps"),
        E("teamB", "Two back-view security people with headlamps", "680,700,120,200", "coats brown/teal"),
        E("scanners", "Handheld scanner tablets showing a four-point sparkle (generic 'AI' sign, no brand)", "one per team, ~40x30", "tealDark body, cream sparkle"),
        E("beams", "Scan beams: translucent cones with raster lines", "from each scanner to the crack", "peach 35% fill, ink raster lines"),
        E("targetRing", "Orange ring that locks onto Bit", "r 26 around (475,650)", "sun orange stroke 5 px + ink outline"),
        E("pip", "Mascot asleep on the floor, then wakes", "600,900,100,80", "mascot colorway"),
    ],
    "beats": [
        B(21.68, "'Then': the last calendar page tears away revealing 'AUG' (one big tear)."),
        B(22.16, "'August': three wavy heat strokes ink in around the sun (summer)."),
        B(22.80, "'two': hatches pop open left (22.80) and right (22.92)."),
        B(23.04, "'security teams': team A slides down its ladder (23.04), team B (23.20), each landing with a small bounce."),
        B(24.16, "'AI': both scanners light up with the sparkle icon (twinkle)."),
        B(24.56, "'tools': beams switch on and sweep across the bricks from both sides."),
        B(24.96, "'found': both beams converge on the crack; the orange targetRing pops around Bit (overshoot 1.25); Bit freezes, antennae straight up."),
        B(25.20, "'it': Pip wakes with a start (ear flares, 10 px hop)."),
    ],
    "sun": "Summer sun: three wavy heat strokes appear around the rim on 'August' and fade by 25.0. Otherwise plain.",
    "mascot": "Still asleep from the time-lapse; jolts awake exactly when the bug is found ('found it'), selling the payoff of the 14-year wait.",
    "sfx": [
        S(21.68, "paper", "single big tear"),
        S(22.80, "clunk", "hatch L"), S(22.92, "clunk", "hatch R"),
        S(23.04, "slide", "ladder slides x2"),
        S(24.16, "twinkle", "scanner sparkle"),
        S(24.56, "scan", "soft rising scan hum"),
        S(24.96, "ding", "target lock"),
    ],
    "captions": [
        C(21.68, 22.80, [L("Then, in August,", 21.68)], ("August", 22.16)),
        C(22.80, 25.44, [L("two security teams", 22.80), L("using AI tools found it", 23.92)], ("AI tools", 24.16)),
    ],
})

# ---------------------------------------------------------------- S06
scenes.append({
    "id": "S06", "start": 25.40, "end": 30.50,
    "vo": "and quietly told the people who make PHP so a fix could be ready before anyone else knew.",
    "title": "The quiet letter",
    "transitionIn": {"type": "push", "dur": 0.6, "persist": ["sun", "mascot", "teamA"],
                     "notes": "25.30-25.90: camera pans right and rises to street level; the vault slides out left with team A still visible at the left edge handing over a sealed envelope. Continuous world, no cut, because the sentence continues."},
    "setting": "A quiet evening street. On the right, the PHP workshop: a small brick workshop with a hanging elephant-silhouette sign and a lit window where three makers work at a bench. On the left, neighbors' houses with curtains drawn.",
    "composition": "Dusk sky y 95-300 (tealDark wash 20%). Neighbor houses x 80-400 y 330-860 with curtained windows; a street lamp x 410 y 520-860. Workshop x 420-860 y 300-860: door with mail slot x 560-640 y 680-860, big lit window x 650-840 y 460-640 showing three back-view makers at a bench, hanging sign with a periwinkle elephant silhouette x 520-600 y 400-470. Street y 860-1095. Envelope path: from x 120,y 700 arcing over to the mail slot. Pip on the street x 120-200 y 960-1040.",
    "elements": [
        E("envelope", "Sealed envelope that carries the secret", "60x40, travels x 120 -> 600", "cream paper, ink flap"),
        E("waxSeal", "Small orange wax dot left on the envelope when the sun stamps it", "r 9 on envelope flap", "sun orange"),
        E("workshop", "PHP workshop building (the people who make PHP): brick, lit window, door with mail slot", "420,300,440,560", "brown brick hatch, peach glow window, teal door"),
        E("elephantSign", "Hanging sign with a periwinkle elephant silhouette (generic, not the PHP logo)", "520,400,80,70", "cream board, periwinkle shape, ink chains"),
        E("makers", "Three back-view makers at a workbench inside the window", "650,470,190,170", "coats sage/salmon/teal"),
        E("patchStack", "Patches appearing on the bench, then packed in a crate", "700,580,120,50", "peach patches, brown crate"),
        E("neighbors", "Two neighbor houses, curtains closed, one with 'Zzz' in ink", "80,330,320,530", "tan/cream facades, salmon curtains"),
        E("streetLamp", "Street lamp with a small warm halo", "410,520,20,340", "ink, cream halo"),
        E("leakTease", "Foreshadow: the corner of a sheet slips out of the workshop's side vent", "860,760,30,20", "cream paper"),
        E("pip", "Mascot on the street", "120,960,80,80", "mascot colorway"),
    ],
    "beats": [
        B(25.44, "'and': team A (left edge) holds up the sealed envelope (pop)."),
        B(25.68, "'quietly': Pip curls his trunk to his mouth: 'shh'. The sun dips 90 px, gently presses the envelope (25.80-26.10) leaving an orange wax-seal dot, and floats back up by 26.30."),
        B(26.16, "'told': envelope glides on a paper-plane arc and slides into the workshop mail slot at 26.40."),
        B(26.48, "'people': the workshop window warms up and the three makers pop in, heads turning to the letter."),
        B(27.12, "'PHP': the elephant sign swings twice on its chains."),
        B(28.08, "'fix': patches pop onto the bench one, two, three (28.08 / 28.24 / 28.40)."),
        B(28.72, "'ready': patches slide into a crate; lid shuts; a little glint."),
        B(28.96, "'before anyone else': neighbor curtains stay shut, 'Zzz' floats from a window (29.20), lamp hums."),
        B(29.92, "'knew': the workshop door's lock clicks. Then at 30.20 the leakTease paper corner slides out of the side vent and Pip's ear twitches toward it (open loop for 'Except')."),
    ],
    "sun": "Plays the wax seal: dips down to stamp the envelope with an orange dot and returns to its place. Recognizably the same disc the whole time.",
    "mascot": "'Shh' with his trunk on 'quietly' (the scene's gag), then stands guard on the street; his ear twitches at the leaking paper corner just before the cut, planting the next beat.",
    "sfx": [
        S(25.30, "whoosh", "pan right, soft"),
        S(25.68, "shh", "tiny, under VO"),
        S(25.85, "stamp", "soft wax press"),
        S(26.40, "paper", "slide into mail slot"),
        S(28.08, "pop", "x3 patches"),
        S(28.72, "thunk", "crate lid"),
        S(29.92, "click", "door lock"),
        S(30.20, "paper", "very quiet rustle (foreshadow)"),
    ],
    "captions": [
        C(25.44, 27.84, [L("and quietly told", 25.44), L("the people who make PHP", 26.40)], ("quietly", 25.68)),
        C(27.84, 30.64, [L("so a fix could be ready", 27.84), L("before anyone else knew.", 28.96)], ("before", 28.96)),
    ],
})

# ---------------------------------------------------------------- S07
scenes.append({
    "id": "S07", "start": 30.50, "end": 35.50,
    "vo": "Except, the details of the bug leaked online hours before the fix came out.",
    "title": "Leaked on the line",
    "transitionIn": {"type": "flip", "dur": 0.5, "persist": ["sun", "mascot", "workshop"],
                     "notes": "30.40-30.90, edge-on at 30.64 on 'Except'. The flip is literal: it turns the workshop around and shows its BACK alley, where things are slipping out. A hard 'except' pattern interrupt."},
    "setting": "The alley behind the PHP workshop. Telephone poles carry wires across the sky; the leaked sheets end up pegged on the wires ('online' = on the line) and spread out over the rooftops.",
    "composition": "Sky y 95-560 with three sagging wires between poles at x 110 and x 850 (wires y 230-330), five birds on the wires. Workshop back wall x 300-860 y 330-900 with a barred back window x 420-600 y 450-600. Side door x 700-800 y 700-900. Rooftops of the city along y 560-640 behind. Alley ground y 900-1095. Pip x 150-230 y 960-1040.",
    "elements": [
        E("workshopBack", "Back of the workshop: plain brick, back window, side door, drainpipe", "300,330,560,570", "brown brick hatch, teal door"),
        E("detailSheets", "12 sheets, each with a tiny sketch of the crack and Bit", "~44x56 each", "cream paper, ink sketch"),
        E("wires", "Three sagging telephone wires between two poles, extending off-panel", "70,230,820,100", "ink"),
        E("pegs", "Clothes pegs that clip sheets onto the wires", "on wires", "brown"),
        E("birds", "Five small birds on the wires", "on wires", "ink + grey"),
        E("fixCrate", "The patch crate from S06 on a hand truck pushed by a back-view maker", "700,780,150,120", "brown crate, peach patches, teal coat"),
        E("poleShadows", "Long pole shadows on the alley that lengthen as hours pass", "ground y 900-1095", "tealDark 25%"),
        E("pip", "Mascot in the alley", "150,960,80,80", "mascot colorway"),
    ],
    "beats": [
        B(30.64, "'Except': back wall snaps on with a thunk; Pip lands in the alley."),
        B(31.60, "'details': a stack of sheets draws on behind the back window."),
        B(32.72, "'leaked': sheets slip out through the window gap one after another (32.72, 32.84, 32.96, 33.08) and flutter upward."),
        B(33.20, "'online': each sheet snaps onto a wire with a peg; then the wires carry them off right and new sheets keep appearing along the wires into the distance (12 total by 33.90). Birds hop aside. Pip jumps for a sheet at 33.40 and misses."),
        B(33.84, "'hours': the sun travels right along a short arc (+110 px x, +15 px y over 1.2 s); pole shadows stretch."),
        B(34.56, "'the fix': side door swings open (34.72)."),
        B(35.04, "'came out': a maker wheels the patch crate out on a hand truck - too late; the sky is already full of sheets."),
        B(35.25, "Pip looks from the crate up to the wires and covers his eyes with his trunk (facepalm)."),
    ],
    "sun": "Moves: slides right along a short arc on 'hours', showing time passing; the shadows follow. It glides back to center during the S08 zoom.",
    "mascot": "Tries to catch a leaking sheet and misses, then does a trunk facepalm when the fix finally comes out.",
    "sfx": [
        S(30.64, "whoosh", "flip + low thud"),
        S(32.72, "paper", "four slips"),
        S(33.20, "peg", "clip-clip-clip, accelerating"),
        S(33.40, "boing", "Pip's missed jump, tiny"),
        S(33.84, "tick", "two slow clock ticks"),
        S(34.72, "door-creak", ""),
        S(35.04, "rumble", "hand-truck wheels"),
    ],
    "captions": [
        C(30.64, 33.84, [L("Except, the details", 30.64), L("of the bug leaked online", 32.08)], ("leaked", 32.72)),
        C(33.84, 35.60, [L("hours before", 33.84), L("the fix came out.", 34.56)], ("hours", 33.84)),
    ],
})

# ---------------------------------------------------------------- S08
scenes.append({
    "id": "S08", "start": 35.50, "end": 43.70,
    "vo": "Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening.",
    "title": "Under the dome",
    "transitionIn": {"type": "zoom", "dur": 0.6, "persist": ["sun", "mascot", "wires"],
                     "notes": "35.40-36.00: zoom out. The wires full of sheets shrink until they are thin lines over a whole skyline; the city draws on around them."},
    "setting": "The whole web as a dense skyline. A big chunk of it sits under a glass shield-dome with a lookout on top (generic guard, no cloud shape, no logo). Outside the dome, unprotected buildings take knocks.",
    "composition": "Sky y 95-420. Dense skyline x 70-890 y 420-860 (window grids, repetition). Dome over the left-center chunk x 110-590 y 330-860, shield emblem at its top x 310-370 y 300-360, lookout on a small platform beside it x 380-420 y 300-340. Tally board on a pole x 610-700 y 500-700. Unprotected buildings x 600-890 with front doors at y 800-860. Darts arrive from the top-right sky (x 700-900, y 120-300). Street y 860-1095 with lamps. Pip inside the dome x 250-330 y 790-860.",
    "elements": [
        E("skyline", "Dense city skyline, 30+ buildings with window grids", "70,420,820,440", "cream/peach/tan/sage facades, ink grids"),
        E("dome", "Glass shield-dome over a big chunk of the city", "110,330,480,530", "ink arc, mintPale 45% fill, cream highlight streaks"),
        E("shieldEmblem", "Plain shield shape on the dome top (generic)", "310,300,60,60", "cream + teal border"),
        E("lookout", "Back-view guard with binoculars on a platform", "380,300,40,40", "teal coat"),
        E("darts", "Small ink darts flying in from the top-right; deflect off the dome", "spawn x 700-900 y 120-300", "ink"),
        E("sparks", "Impact sparks on the dome and knock bursts on outside doors", "dome surface / doors y 800-860", "cream sparks, salmon bursts"),
        E("tallyBoard", "Board where tally marks (bundles of five) fill up, then overflow into the sky", "610,500,90,200", "cream board, ink tallies"),
        E("hatchRain", "Dense diagonal ink hatching across the sky = millions", "sky y 95-420", "ink 1.5 px, 30-60% coverage"),
        E("dusk", "Dusk sky band + lamps lighting", "sky", "salmon -> tealDark gradient"),
        E("pip", "Mascot inside the dome, peeking up", "250,790,80,70", "mascot colorway"),
    ],
    "beats": [
        B(35.60, "'Cloudflare': the dome draws on in one ink arc from left base to right base (0.5 s); glass fill fades in 0.2 s behind; shield emblem pops at 36.10."),
        B(36.56, "'protects': a highlight glint sweeps across the dome glass."),
        B(37.04, "'big chunk': a dashed outline traces the covered chunk of skyline and pulses once; buildings under the dome lift 3%."),
        B(38.16, "'says it saw': the lookout raises binoculars; lens glint at 38.56."),
        B(38.88, "'tens of thousands': darts start - 3 (38.88), 10 (39.20), 30 (39.60) - each deflecting off the dome with a spark; tally marks fill row after row."),
        B(40.00, "'break-in attempts': darts also knock on the doors of the unprotected buildings at the right (burst stars on doors). Doors hold; nothing is shown getting in."),
        B(41.06, "'45': the sun becomes a clock: 12 ticks ink in, a cream wedge sweeps 0 -> 270 degrees (45 minutes) by 42.10."),
        B(42.48, "'millions': the dart rain turns into dense diagonal hatching across the whole sky (draws in over 0.5 s); tally marks overflow the board and spill into the sky. Pip folds his ear over his eyes."),
        B(43.04, "'by evening': the sun sinks halfway behind the panel's top edge (0.5 s), sky shifts to dusk, street lamps light up, the dome rim glows warm."),
    ],
    "sun": "Clock with a 45-minute wedge on '45', then SETS halfway behind the panel's top edge on 'by evening' (the reference's setting-sun move). Stays half-set into S09.",
    "mascot": "Hides inside the dome looking up, flinching at each spark; on 'millions' folds his ear over his eyes like an earmuff.",
    "sfx": [
        S(35.40, "whoosh", "zoom out"),
        S(35.60, "pencil", "long arc stroke"),
        S(36.56, "glint", ""),
        S(38.88, "tink", "dart deflections, accelerating into a hail texture"),
        S(40.00, "knock", "door knocks, scattered"),
        S(41.06, "tick", "fast clock ticks during the wedge sweep"),
        S(42.48, "hail", "dense rain of tinks, then duck under VO"),
        S(43.04, "whoosh", "low, sun setting"),
    ],
    "captions": [
        C(35.60, 37.04, [L("Cloudflare,", 35.60), L("which protects", 36.40)], ("Cloudflare", 35.60)),
        C(37.04, 38.88, [L("a big chunk of the web,", 37.04), L("says it saw", 38.16)], ("big chunk", 37.04)),
        C(38.88, 40.88, [L("tens of thousands", 38.88), L("of break-in attempts", 39.92)], ("tens of thousands", 38.88)),
        C(40.88, 42.24, [L("in 45 minutes,", 40.88)], ("45 minutes", 41.06)),
        C(42.24, 43.76, [L("and millions", 42.24), L("by evening.", 43.04)], ("millions", 42.48)),
    ],
})

# ---------------------------------------------------------------- S09
scenes.append({
    "id": "S09", "start": 43.70, "end": 47.78,
    "vo": "Nobody knows yet how many got in. So now comes step two, the slow one.",
    "title": "Question marks, then step two",
    "transitionIn": {"type": "matchcut", "dur": 0.3, "persist": ["sun", "mascot", "board"],
                     "notes": "43.62-43.92: cut from the dusk skyline to a close night street; the half-set sun and Pip hold their screen positions, the dome stays visible far in the background."},
    "setting": "A night street of house doors, lit only by Pip's flashlight. At the end of the street stands the two-step board from S03.",
    "composition": "Night sky y 95-380 with the small dome far back (y 200-380). Four house doors x 80-560 y 420-880 (each door ~100 wide with a small window). Two-step board at the right x 590-880 y 420-800 (partially in frame, same design as S03). Street y 880-1095. Pip x 110-190 y 920-1000 holding a flashlight in his trunk; beam is a cream cone. At 45.52 the camera pans right 220 px and scales 1.15 to center the board.",
    "elements": [
        E("nightStreet", "Row of four house fronts with doors, night", "80,420,480,460", "tealDark wash 45% over cream/tan facades"),
        E("questionMarks", "Big ink '?' in each door window", "one per door, ~40 px", "ink on cream"),
        E("flashlightBeam", "Pip's flashlight cone", "from Pip toward the doors", "cream 55% fill"),
        E("board", "The two-step board returns (persistent object): pane 1 gets a check, pane 2 lights up", "590,420,290,380", "tealDark frame, mintPale/peach panes"),
        E("checkPane1", "Ink check mark stamped in pane 1 (step one done)", "in pane 1", "ink on mintPale"),
        E("snail", "A snail carrying a patch on its shell, crawling into pane 2", "pane 2 bottom, ~70x40", "ink + tan shell, peach patch"),
        E("domeFar", "Distant dome silhouette", "200,200,300,180", "ink + mintPale 30%"),
        E("pip", "Mascot with flashlight", "110,920,90,80", "mascot colorway"),
    ],
    "beats": [
        B(43.76, "'Nobody': Pip clicks on the flashlight; the beam lands on door 1."),
        B(44.08, "'knows': '?' pops in door 1's window (44.08), then the beam swings and '?' pops in door 2 (44.32), door 3 (44.56), door 4 (44.72). Doors stay shut and unharmed: we just can't tell."),
        B(44.96, "'got in': the beam lingers on door 4; beat of stillness."),
        B(45.52, "'So now': Pip swings the beam right; camera pans to the board (0.4 s)."),
        B(45.84, "'comes': the sun rises back to its spot (0.5 s, ease-out); night wash lifts to dawn."),
        B(46.08, "'step': a check mark stamps into pane 1 (step one: done)."),
        B(46.40, "'two': pane 2 lights up peach and its '2' pops big (overshoot 1.3)."),
        B(47.12, "'slow': a snail carrying a patch inches into pane 2 (moves only 30 px in 0.6 s). Pip yawns, trunk up (47.40)."),
    ],
    "sun": "Starts half-set (night). On 'So now comes' it rises back to its home position like a sunrise: a new day, step two.",
    "mascot": "The flashlight holder: his beam is what reveals each '?' and what carries the eye from the doors to the board. Yawns at the snail.",
    "sfx": [
        S(43.76, "click", "flashlight"),
        S(44.08, "boop", "four soft question pops"),
        S(45.52, "whoosh", "short pan"),
        S(45.84, "rise", "soft swell, sunrise"),
        S(46.08, "stamp", "check mark"),
        S(46.40, "pop", "big 2"),
        S(47.12, "squelch", "tiny, comic snail"),
    ],
    "captions": [
        C(43.76, 45.52, [L("Nobody knows yet", 43.76), L("how many got in.", 44.72)], ("how many", 44.72)),
        C(45.52, 47.84, [L("So now comes step two,", 45.52), L("the slow one.", 46.96)], ("slow", 47.12)),
    ],
})

# ---------------------------------------------------------------- S10
scenes.append({
    "id": "S10", "start": 47.78, "end": 54.48,
    "vo": "Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit.",
    "title": "Twenty-two million copies",
    "transitionIn": {"type": "zoom", "dur": 0.5, "persist": ["sun", "mascot", "snail", "patchIcon"],
                     "notes": "47.68-48.18: iris zoom through pane 2 (the 'fix' pane), mirroring S04's zoom through pane 1. Step one was entered through pane 1, step two is entered through pane 2."},
    "setting": "One ordinary website-building on its cracked PHP foundation. Someone patches it - and then the camera pulls out in three steps to a sea of millions of rooftops, every one with the same foundation.",
    "composition": "Level 1: house x 250-710 y 260-760, ground line y 760, foundation cross-section y 760-900 with crack + periwinkle cornerstone; worker enters from left x 160-240 y 640-900; Pip beside him x 120-190 y 930-1000. Level 2 (scale 0.3): a street of 10 houses. Level 3 (0.08): a 10x10 block grid. Level 4 (0.02): a full-panel sea of tiny rooftops as a pattern, each with a periwinkle dot. Loupe inset x 560-820 y 160-420 in level 4.",
    "elements": [
        E("house1", "Ordinary website-building with a browser window, on a cracked PHP foundation", "250,260,460,640", "cream/peach facade, teal foundation, periwinkle cornerstone"),
        E("worker", "Back-view worker with a tool bag ('someone')", "160,640,80,260", "salmon coat, brown bag"),
        E("patch", "The patch (from the snail / pane 2) slapped over the crack", "on crack, ~90x40", "peach strip, cream pad"),
        E("zoomLevels", "Nested pattern levels: street of 10 -> block of 100 -> city sea", "whole panel", "ink rooftops; level 4 is a repeating tile pattern"),
        E("phpDots", "Periwinkle dot on every rooftop at level 4 (a PHP copy)", "pattern, ~4 px dots", "periwinkle"),
        E("loupe", "Circular inset magnifying one dot: the same cracked foundation with elephant cornerstone", "560,160,260,260", "ink rim, cream glint"),
        E("reticles", "Dark crosshair rings popping over random dots", "~24 px each", "ink 3 px"),
        E("patchedRoof", "The one patched roof at level 4: a single orange speck with a tiny periwinkle Pip waving next to it", "near panel center", "sun orange + periwinkle"),
        E("pip", "Mascot handing over the patch", "120,930,80,70", "mascot colorway"),
    ],
    "beats": [
        B(47.84, "'Someone': worker walks in from the left (0.4 s slide)."),
        B(48.48, "'install': worker kneels at the foundation; Pip hands him the patch with his trunk (48.60)."),
        B(48.80, "'that fix': patch slaps over the crack (squash and stretch); check glint at 49.10."),
        B(49.68, "'every': zoom-out 1 (0.5 s): house1 shrinks into a street of ten; the other nine still show cracks."),
        B(49.92, "'site': zoom-out 2 (0.5 s): a 10x10 block."),
        B(50.88, "'about': zoom-out 3 (0.6 s): a sea of tiny rooftops fills the panel."),
        B(51.08, "'22': periwinkle dots ripple out across the rooftops from the center (51.08-52.20), one per PHP copy."),
        B(52.56, "'copies': the loupe pops up over one dot: it is the same cracked foundation with the same elephant cornerstone."),
        B(53.36, "'out there': slow parallax drift across the sea."),
        B(53.84, "'could be hit': dark reticles pop over random dots (8 pops, 53.84-54.40, accelerating). The one orange patched roof stays safe; tiny Pip beside it gulps."),
    ],
    "sun": "Plain disc, fixed at card level while the world shrinks beneath it - the stable anchor during three zoom-outs.",
    "mascot": "The helper: hands the worker the patch. During the zoom-out he shrinks to a speck next to the one patched roof (rewatch hunt: 'find Pip in the 22 million').",
    "sfx": [
        S(47.68, "whoosh", "iris zoom"),
        S(47.84, "footsteps", "two light steps"),
        S(48.80, "thwap", "patch slap"),
        S(49.68, "whoosh", "zoom-out 1"), S(49.92, "whoosh", "zoom-out 2"), S(50.88, "whoosh", "zoom-out 3, deeper"),
        S(51.08, "shimmer", "rising glitter for the ripple"),
        S(52.56, "pop", "loupe"),
        S(53.84, "tick", "reticle pops, accelerating"),
    ],
    "captions": [
        C(47.84, 50.48, [L("Someone has to install", 47.84), L("that fix on every site,", 48.80)], ("every site", 49.68)),
        C(50.48, 53.36, [L("and there are about", 50.48), L("22 million copies of PHP", 51.08)], ("22 million", 51.08)),
        C(53.36, 54.56, [L("out there", 53.36), L("that could be hit.", 53.68)], ("hit", 54.08)),
    ],
})

# ---------------------------------------------------------------- S11
scenes.append({
    "id": "S11", "start": 54.48, "end": 60.48,
    "vo": "If a site can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did.",
    "title": "Why they switched off",
    "transitionIn": {"type": "zoom", "dur": 0.5, "persist": ["sun", "mascot", "reticles"],
                     "notes": "54.40-54.90: zoom IN on one reticled dot until it becomes govB, the domed civic hall from S01 - the hook's building returns to pay off the open loop."},
    "setting": "Close on govB from S01, lights on, its browser window now showing a slow progress bar while darts gather in the sky. Then a pull-back to the original four-building plaza.",
    "composition": "govB x 120-840 y 260-900 (dome y 260-400), browser window x 300-660 y 520-640 with a progress bar track inside. Shutter rolled at top of the window. Darts gather top-right x 650-880 y 140-300. Pip on the steps x 680-760 y 900-980. At 59.04 the camera pulls back to the exact S01 composition (all four buildings).",
    "elements": [
        E("govB", "Domed civic hall from S01, close", "120,260,720,640", "peach facade, tan dome, cream columns"),
        E("progressBar", "Progress bar inside the browser window", "320,580,320,26", "ink track, peach fill, cream spinner"),
        E("shutter", "Roller shutter that slams down over the window", "300,520,360,120", "tealDark"),
        E("updateLamp", "Small status lamp on the shutter that keeps blinking while the update runs; a peephole shows the bar still filling", "470,600,24,24", "sun orange blink, cream"),
        E("darts", "Darts gathering and then bouncing off the shutter", "650,140,230,160", "ink"),
        E("padlock", "Padlock on the shutter", "470,640,26,30", "brown + cream"),
        E("plazaWide", "Pull-back to the S01 plaza with all four civic buildings shuttered, each with a blinking update lamp", "S01 layout", "S01 palette, dim wash 20%"),
        E("pip", "Mascot on the steps", "680,900,80,80", "mascot colorway"),
    ],
    "beats": [
        B(54.56, "'If a site': the address bar morphs into a progress-bar track."),
        B(55.28, "'update': the bar fills slowly, 0 -> 18% (55.28-56.40), little spinner turning."),
        B(55.68, "'fast enough': three darts appear top-right and inch closer; Pip looks at the bar (55.80), then the darts (56.10)."),
        B(56.56, "'safest': the power glyph inks onto the sun again (callback to S01)."),
        B(57.52, "'switch it off': the sun presses (scale 0.88); shutter slams down at 57.84; lights dim; padlock pops at 58.00."),
        B(58.00, "'off': darts hit the shutter and bounce off with sparks (58.00-58.30)."),
        B(58.24, "'until it can': the updateLamp blinks and the peephole shows the bar still filling 18 -> 60% (58.24-59.00)."),
        B(59.04, "'That's what': camera pulls back (0.6 s) to the exact S01 framing: all four civic buildings shuttered, padlocked, each with a blinking update lamp."),
        B(59.52, "'government sites': the four abstract pennants wave."),
        B(60.16, "'did': Pip taps a padlock again - 'tok' (callback to S01) - and nods."),
    ],
    "sun": "Power button again (S01 callback): glyph inks on 'safest', disc presses on 'switch it off'. Glyph fades at 60.3.",
    "mascot": "Nervously checks progress bar vs. incoming darts; ends by repeating his S01 padlock tap and a knowing nod - the hook is now explained.",
    "sfx": [
        S(54.40, "whoosh", "zoom in"),
        S(55.28, "loading", "soft looping blip"),
        S(56.56, "pencil", "glyph"),
        S(57.52, "power-off", "callback to S01"),
        S(57.84, "clack", "shutter"),
        S(58.00, "tink", "darts bounce x3"),
        S(59.04, "whoosh", "pull back"),
        S(60.16, "tok", "padlock tap callback"),
    ],
    "captions": [
        C(54.56, 56.40, [L("If a site can't update", 54.56), L("fast enough,", 55.68)], ("fast enough", 55.68)),
        C(56.40, 58.24, [L("the safest thing", 56.40), L("is to switch it off", 57.20)], ("switch it off", 57.52)),
        C(58.24, 59.04, [L("until it can.", 58.24)], None),
        C(59.04, 60.56, [L("That's what those", 59.04), L("government sites did.", 59.52)], ("did", 60.16)),
    ],
})

# ---------------------------------------------------------------- S12
scenes.append({
    "id": "S12", "start": 60.48, "end": 66.56,
    "vo": "And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore.",
    "title": "Too old to fix",
    "transitionIn": {"type": "flip", "dur": 0.5, "persist": ["sun", "mascot"],
                     "notes": "60.30-60.80, edge-on at 60.56 on 'And'. Final-act pattern interrupt."},
    "setting": "A street cross-section (callback to S02): six website-buildings on PHP foundations. Every third one is old: crumbly stone foundation, cobwebs, a worn elephant emblem. The workshop's patch cart rolls by and skips the old ones.",
    "composition": "Sky y 95-300. Six houses x 80-880 y 300-640 in two groups of three; houses 3 and 6 are old-style (wooden shutters, crooked chimney, gas lamp). Foundations y 640-800 (new: neat teal brick + periwinkle emblem; old: grey-tan crumbly stone + cobwebs + faded emblem with a tiny cane). Road y 800-900 where the cart travels left to right. Tally of three house pictograms x 330-630 y 960-1060. Pip at the old house x 560-640 y 820-900.",
    "elements": [
        E("houses", "Six website-buildings; #3 and #6 are old-style", "80,300,800,340", "new: cream/peach; old: tan/brown, faded"),
        E("foundationsNew", "Neat PHP foundations with periwinkle emblem and crack", "under houses 1,2,4,5", "teal brick"),
        E("foundationsOld", "Crumbly stone foundations with cobwebs; emblem faded and leaning on a tiny cane (rewatch gag)", "under houses 3,6", "grey/tan stone, ink cobwebs, faded periwinkle"),
        E("cart", "The workshop's patch cart with the elephant sign, pulled by a back-view maker", "~140x90 on road", "brown cart, periwinkle sign, peach patches"),
        E("patchesNew", "Patches popping onto the new foundations", "on cracks of houses 1,2,4,5", "peach + cream"),
        E("tally3", "Three house pictograms, one of them old-style", "330,960,300,100", "ink; the old one tan with cobweb"),
        E("dust", "A few dust motes (simple circles) drifting at the old houses", "near houses 3,6", "cream 60%"),
        E("pip", "Mascot next to old house #3", "560,820,80,80", "mascot colorway"),
    ],
    "beats": [
        B(60.72, "'one': house 1 pops in."),
        B(61.12, "'three': houses 2-6 pop in two groups of three (61.12-61.40); the tally of three pictograms draws on."),
        B(61.36, "'sites': every third house 'ages' with a wobble: foundation swaps to crumbly stone, house tilts 2 deg, colors fade; tally icon 1 turns old-style."),
        B(61.84, "'PHP': elephant emblems pop on all six foundations; the old ones' emblems lean on tiny canes."),
        B(62.74, "'version': cobwebs draw across the old foundations (0.4 s)."),
        B(63.44, "'old': dust motes drift up; Pip blows dust off old emblem #3 (three little puff circles, 63.50)."),
        B(64.24, "'the people who make PHP': the workshop cart rolls in from the left (1.0 s slide)."),
        B(65.52, "'don't fix': the cart stops at the new houses and patches pop onto them (65.52 / 65.70 / 65.90 / 66.05) with check glints; at old houses 3 and 6 it rolls straight past without stopping (65.80, 66.20)."),
        B(66.16, "'anymore': cart exits right; the old foundations keep their cracks. Pip's ear droops (66.30)."),
    ],
    "sun": "Plain disc. Sags 8 px on 'anymore' and recovers - a tiny sigh.",
    "mascot": "Stands by an old house; blows dust off the old elephant emblem (it's his grandpa, basically), and droops when the cart skips it.",
    "sfx": [
        S(60.56, "whoosh", "flip"),
        S(61.12, "pop", "house pops, x6"),
        S(61.36, "creak", "aging wobble"),
        S(62.74, "pencil", "cobweb strokes, light"),
        S(63.50, "puff", "tiny"),
        S(64.24, "rumble", "cart wheels"),
        S(65.52, "pop", "patches x4 with small dings"),
    ],
    "captions": [
        C(60.56, 62.40, [L("And one in three", 60.56), L("sites on PHP", 61.36)], ("one in three", 60.72)),
        C(62.40, 64.24, [L("runs a version", 62.40), L("so old that", 63.20)], ("so old", 63.20)),
        C(64.24, 66.64, [L("the people who make PHP", 64.24), L("don't fix it anymore.", 65.52)], ("anymore", 66.16)),
    ],
})

# ---------------------------------------------------------------- S13
scenes.append({
    "id": "S13", "start": 66.56, "end": 70.687,
    "vo": "For those, it's switch off or hope the hosting company sorts it out.",
    "title": "Switch off, or hope",
    "transitionIn": {"type": "matchcut", "dur": 0.4, "persist": ["sun", "mascot", "board"],
                     "notes": "66.40-66.80: push into old house #3's facade; its wall becomes the backdrop and the two-step board from S03 slides into the same place it held in S03, now with two new choices. Mirrors the reference's two-pane ending."},
    "setting": "The old house's worn wall with the two-pane notice board in front of it, three back-view onlookers - the same staging as S03 and the reference's yes/no finale.",
    "composition": "Same layout as S03 for an exact callback: board x 190-770 y 360-760 on legs, pane1 x 205-475, pane2 x 485-755. Wall is the old house (tan, peeling plaster patches). Readers x 330-640 y 930-1095. Pip on top of the board x 440-530 y 285-360.",
    "elements": [
        E("oldWall", "Worn wall of old house #3 (peeling plaster, a cobweb in the corner)", "70,180,820,720", "tan fill, peach patches, ink cracks"),
        E("board", "Two-step board, same geometry as S03", "190,300,580,600", "tealDark frame"),
        E("powerPane", "Pane 1: big power glyph (switch off)", "205,360,270,400", "tealDark fill, cream glyph"),
        E("hostPane", "Pane 2: a small server-rack building (the hosting company) with blinking rack lights and a back-view tech carrying a toolbox toward it", "485,360,270,400", "peach fill, ink rack, sage/sun lights"),
        E("readers", "Three back-view onlookers", "330,930,310,165", "coats teal/brown/sage"),
        E("unbuildBlock", "Single tan rectangle that the fills collapse into and that shrinks downward to reveal the S01 line art", "full panel -> 0 height at bottom", "tan"),
        E("s01Lineart", "The S01 plaza linework underneath (loop target)", "S01 layout", "ink only"),
        E("pip", "Mascot on top of the board", "440,285,90,80", "mascot colorway"),
        E("bugBit", "Bit, who scuttles back to his frame-0 spot on govA's cornice during the un-build", "-> 300,466", "ink"),
    ],
    "beats": [
        B(66.64, "'For those': board frame draws on in front of the old wall; Pip lands on top (thump)."),
        B(67.60, "'switch off': pane 1 fills tealDark and a big cream power glyph draws on; the sun answers with a tiny press (scale 0.94)."),
        B(68.56, "'or': Pip's trunk swings from pane 1 to pane 2."),
        B(68.80, "'hope': pane 2 fills peach, the server-rack building pops in; Pip crosses his trunk (fingers crossed) with a tiny sparkle."),
        B(69.20, "'hosting company': rack lights blink in sequence; a tech with a toolbox walks toward the rack."),
        B(69.52, "'company': UN-BUILD starts. Pane contents and all fills drain into one tan rectangle (69.52-69.70); board linework un-draws (69.80-70.30)."),
        B(69.70, "The tan rectangle shrinks downward from the top (69.70-70.40), revealing the S01 plaza line art beneath, exactly as the reference's ending reveals its opening street."),
        B(70.00, "The power glyph from pane 1 floats up and docks on the sun as the faint frame-0 glyph (70.00-70.40)."),
        B(70.10, "Pip hops down off the collapsing board and lands on his S01 plaza spot (70.10-70.50); Bit scuttles to the govA cornice (70.30-70.50)."),
        B(70.45, "Caption rolls out upward (70.45-70.687). Final frame is pixel-identical to frame 0."),
    ],
    "sun": "Echoes 'switch off' with a small press, then receives the power glyph from pane 1 during the un-build, ending exactly as it begins the video (faint power glyph).",
    "mascot": "Sits on the board like the reference cat on its yes/no board; crosses his trunk on 'hope'; then rides the un-build back to his opening spot so the loop is seamless.",
    "sfx": [
        S(66.40, "whoosh", "push in"),
        S(66.64, "thump", "Pip lands"),
        S(67.60, "power-off", "soft echo of the S01 sound"),
        S(68.80, "twinkle", "hope sparkle"),
        S(69.20, "blip", "rack lights"),
        S(69.52, "swish", "reverse fill-flood (the S01 swish reversed) for the un-build"),
        S(70.10, "pop", "tiny landing"),
    ],
    "captions": [
        C(66.64, 68.56, [L("For those, it's", 66.64), L("switch off", 67.60)], ("switch off", 67.60)),
        C(68.56, 70.687, [L("or hope the hosting", 68.56), L("company sorts it out.", 69.52)], ("hope", 68.80)),
    ],
})

storyboard = {
    "fps": 30,
    "duration": 70.687,
    "mascot": mascot,
    "scenes": scenes,
    "loop": (
        "S13 un-builds (69.52-70.60) the way the reference ends: fills drain into one tan block that shrinks downward to "
        "reveal the S01 plaza linework; the pane-1 power glyph floats up onto the sun as the faint frame-0 glyph; Pip hops "
        "to his S01 spot; Bit returns to the govA cornice; the caption rolls out. The last frame equals frame 0 (linework + "
        "mint sky + sun with faint glyph + Pip, empty caption zone), and the VO restarts with 'Government websites' as the "
        "fills flood back in at 0.16. Narrative loop too: the video ends on 'switch off' and begins on 'switched themselves off'."
    ),
}

# ------------------------------------------------------------ validation
errors = []
words = json.load(open("/home/user/Test-/video/assets/vo_words_raw.json"))["words"]
prev_end = 0.0
for i, sc in enumerate(scenes):
    d = sc["end"] - sc["start"]
    if abs(sc["start"] - prev_end) > 1e-6:
        errors.append(f"{sc['id']} gap/overlap: start {sc['start']} prev end {prev_end}")
    prev_end = sc["end"]
    if not (3.5 <= d <= 8.3):
        errors.append(f"{sc['id']} duration {d:.2f}")
    for b in sc["beats"]:
        if not (sc["start"] - 0.35 <= b["t"] <= sc["end"] + 0.01):
            errors.append(f"{sc['id']} beat {b['t']} outside scene")
    for c in sc["captions"]:
        if len(c["lines"]) > 2:
            errors.append(f"{sc['id']} >2 lines")
        if len(c["highlights"]) > 1:
            errors.append(f"{sc['id']} >1 highlight")
        for ln in c["lines"]:
            if len(ln["text"]) > 24:
                errors.append(f"{sc['id']} line too long ({len(ln['text'])}): {ln['text']}")
            if not (c["s"] - 1e-6 <= ln["s"] < c["e"]):
                errors.append(f"{sc['id']} line start outside caption: {ln}")
        for h in c["highlights"]:
            if not any(h["text"] in ln["text"] for ln in c["lines"]):
                errors.append(f"{sc['id']} highlight not in lines: {h}")
            owner = [ln for ln in c["lines"] if h["text"] in ln["text"]][0]
            if h["s"] < owner["s"]:
                errors.append(f"{sc['id']} highlight before its line: {h}")
    # caption text must reproduce scene VO
    cap = " ".join(ln["text"] for c in sc["captions"] for ln in c["lines"])
    if cap.replace("  ", " ") != sc["vo"]:
        errors.append(f"{sc['id']} caption text != vo:\n   {cap}\n   {sc['vo']}")
if abs(prev_end - 70.687) > 1e-6:
    errors.append("last scene end != duration")
# captions must not overlap and must be contiguous-ish
caps = [c for sc in scenes for c in sc["captions"]]
for a, b in zip(caps, caps[1:]):
    if b["s"] < a["e"] - 1e-6:
        errors.append(f"caption overlap {a['lines'][0]['text']} / {b['lines'][0]['text']}")
full = " ".join(sc["vo"] for sc in scenes)
ref = json.load(open("/home/user/Test-/video/assets/vo_words_raw.json"))["text"]
norm = lambda s: s.replace("aversion", "a version").split()
if norm(full) != norm(ref):
    errors.append("VO concatenation does not match transcript")
    print(full); print(ref)

json.dump(storyboard, open(OUT, "w"), indent=2, ensure_ascii=False)
print("scenes:", len(scenes))
for sc in scenes:
    print(sc["id"], sc["start"], sc["end"], round(sc["end"] - sc["start"], 2), sc["transitionIn"]["type"], sc["title"])
print("ERRORS:" if errors else "OK", *errors, sep="\n")

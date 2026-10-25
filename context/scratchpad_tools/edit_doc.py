p='docs/scenes/S03.md'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old[:80], s.count(old))
    s=s.replace(old,new)
rep('''(absolute beat table -> scene-local), `scene03/camera.ts` (the 4 % breath + lock), `scene03/ground.tsx` (S03's plan
sheet: replaces the set's 'ground' node), `scene03/plan.tsx` (overlays on the shared set: far plain + horizon
construction rays, the inked footprints, the sheet's teal frame band + dog-ear, the re-coloured side rows, per-building
overlays (screens, pages, awnings, window boxes), the COUNT SIGNS, the edge tree, S03's roof vent + its puffs, the bird
wire, the visible pen-nib sign, the scribbled '?'), `scene03/stamp.tsx` (the solid elephant stamp print and its slam),
`scene03/cast.tsx` (Pip + his drop shadow, Bit on the sign, the six walkers + the doorway walker, the two near walkers),
`scene03/entry.tsx` (isolated preview entry, dev only).''','''(absolute beat table -> scene-local), `scene03/camera.ts` (the 4 % breath + lock), `scene03/ground.tsx` (S03's plan
sheet: replaces the set's 'ground' node), `scene03/plan.tsx` (overlays on the shared set: the far plain (paper + the
plan's grid to the horizon), the inked footprints, the sheet's teal frame band + dog-ear, the re-coloured side rows,
per-building overlays (the screens, which ARE the street's count, pages, pings, awnings, window boxes), the edge tree,
S03's roof vent + its puffs, the bird wire, the visible pen-nib sign + its swing, the scribbled '?'), `scene03/stamp.tsx`
(the solid elephant stamp print and its slam), `scene03/cast.tsx` (Pip + his drop shadow, Bit on the sign, the six
walkers + the doorway walker, the two near walkers + their sleeve cuffs), `scene03/entry.tsx` (isolated preview entry,
dev only).''')
rep('''Shared `BlueprintStreet` (wide) with `stampAt={false}` (S03 draws its own print), `sign={false}` (S03 hangs a visible
sign), `people={false}` and no `sun` prop (S03 draws the sun itself, above the side rows). Its 'ground' layer is
replaced by `GroundS03` and its 'sides' layer by `SideRows` (the same two `PerspRow`s from the same `quadRowLayout`
inputs and seeds, re-coloured); its 'press' layer is used with the old roof vent clipped out. Everything else is placed
from the set's anchors (`BLUEPRINT`, `blueprintAnchors()`) and injected through the set's `wrap` layers.''','''Shared `BlueprintStreet` (wide) with `stampAt={false}` (S03 draws its own print), `sign={false}` (S03 hangs a visible
sign), `people={false}` and no `sun` prop (S03 draws the sun itself in the 'sides' layer: behind the side rows until its
take-off squash, then in front). Its 'far' layer is replaced by `FarPlain` (the set's sage far peeks are not drawn), its
'ground' layer by `GroundS03` and its 'sides' layer by `SideRows` (the same two `PerspRow`s from the same
`quadRowLayout` inputs and seeds, re-coloured); its 'press' layer is used with the old roof vent clipped out. Everything
else is placed from the set's anchors (`BLUEPRINT`, `blueprintAnchors()`) and injected through the set's `wrap` layers.''')
rep('''| 0 | 8.393 | cut(password) | HARD CUT: the plan already DRAWN. Ten inked footprints (cream lots, 2.2 px ink, inner wall line, door swing, lot cross), the horizon line and the construction rays out of the VP, the far + mid grid rows, the margin with its ticks, the kerb dimension arrows, the title-block frame, plan furniture (two registration marks where the stamp will land, a '3.2 m' dimension line under it, a north arrow, note scribbles, a dimensioned 'lot 3' footprint detail at the bottom left), S02's teal frame band + dog-ear; the sun in its slot (690, 700) r110. Pip HIGH against the far haze at screen (830, 915), already falling down-left; his tan shadow on the plan under the landing point |''','''| 0 | 8.393 | cut(password) | HARD CUT: the plan already DRAWN, and the whole ground is PAPER (polish round 1): cream from the frame bottom to a bare horizon (an 8 px sand band under the horizon line, no skyline: only the sun above it), the plan's grid running on to the horizon (the sheet's rays continued, every second one to y 1060, every fourth to y 990, six cross lines by the sheet's depth law, inkHair 1.6; the sheet's own grid now 2.2 near / 1.9 mid / 1.6 far). Ten inked footprints (cream lots, 2.2 px ink, inner wall line, door swing, lot cross), the far + mid grid rows, the margin with its ticks, the kerb dimension arrows, the title-block frame, plan furniture (two registration marks where the stamp will land, a '3.2 m' dimension line under it, a north arrow, note scribbles, a dimensioned 'lot 3' footprint detail at the bottom left), S02's teal frame band + dog-ear; the sun in its slot (690, 700) r110. Pip HIGH at screen (830, 915), already falling down-left; his tan shadow on the plan under the landing point |''')
rep('''| 1.07-1.39 | 9.46-9.78 | w31+0.50 | ONE gesture: the press house pops up (sticker + '?', S03's vent, sign, Bit), then L1 R1 L2 R2 L3 R3 L4 R4 L5, 0.035 s apart (the tree with L1); every side screen is unlit sage glass; each building carries an EMPTY iron sign bracket |
| 1.52 | 9.915 | end(PHP)+0.10 | Pip settles; the roof vent (left slope, clear of the sun) puffs two paper sheets up-left (visible from their first frame) |
| 1.54 | 9.93 | | the bird wire draws from L3's cornice to the sign pole; two birds on it |''','''| 1.07-1.39 | 9.46-9.78 | w31+0.50 | ONE gesture: the press house pops up (sticker + '?', S03's vent, sign, Bit) and the sand street with it (`GroundS03 streetAt`), then L1 R1 L2 R2 L3 R3 L4 R4 L5, 0.035 s apart (the tree with L1); every side screen is unlit sage glass (no sign brackets: polish round 1) |
| 1.52 | 9.915 | end(PHP)+0.10 | Pip settles; the roof vent (left slope, clear of the sun) puffs THREE paper sheets (22 x 27) up-left, 0.12 s apart |
| 1.54 / 1.68 | 9.93 / 10.07 | | the bird wire draws from L3's cornice to the sign pole; two birds on it (10.05); the first one hops and turns round at 10.07 (life in the calm before the bait) |''')
rep('''| 1.91 | 10.305 | w33+0.10 | a walker pops up in R4's doorway and walks off up the street; Bit's antennae twitch |''','''| 1.91 | 10.305 | w33+0.10 | a walker pops up in R4's doorway and walks off up the street (from +0.12); Bit's antennae twitch |''')
rep('''| 2.15 | 10.54 | w34-0.10 'everyone' | six walkers (98-146 px) pop up out of the plan (0.05 s stagger), three walk toward the press house; the two near walkers slide in at the bottom corners (hood + strap left, bun + collar right, arms, rim strips) |''','''| 2.15 | 10.54 | w34-0.10 'everyone' | six walkers (98-146 px) pop up out of the plan (0.05 s stagger), three walk toward the press house; the two near walkers slide in at the bottom corners (hood + strap left, bun + collar right, the near arm with a coat-dark CUFF band over the hand, rim strips), heads at screen y ~1400 (L, top) / ~1363 (R, top; bun ~1330) |''')
rep('''| 2.71 | 11.105 | w35 'loves' | GAG: PRIDE, straight-faced: Pip pops to trunk-up (the trunk curls up into a toot, its two little puff marks), happy, chin up (a -7 deg lean back, out-back), chest out (a 1.10 -> 1.0 stretch over 0.3 s) |''','''| 2.71 | 11.105 | w35 'loves' | GAG: PRIDE, straight-faced (polish round 1: no open mouth / trumpet marks): Pip pops to sit-front, happy (closed eye-smiles, closed smile), chin up (a -7 deg lean back, out-back), chest out (a 1.10 -> 1.0 stretch over 0.3 s) |''')
rep('''| 3.21 | 11.605 | end(loves) | the pen-nib sign swings, Bit riding on top; the vent puffs again |
| 3.31 | 11.705 | end(loves)+0.10 | Pip pops back to sit-front (happy) |''','''| 3.21 | 11.605 | end(loves) | the pen-nib sign swings (polish round 1: `signAngle` = -14 e^-2.6t sin 8.5t: starts at 0 with a velocity kick, peaks ~-11 deg at +0.18 s, visible for ~0.9 s, period ~0.74 s), Bit riding on top; the vent puffs again (3 sheets) |
| 3.31 | 11.705 | end(loves)+0.10 | Pip settles (pop, look 0.3), the lean comes back |''')
rep('''| 3.56-4.04 | 11.955-12.435 | w38 'seven' | the COUNT, near -> far, 0.08 s apart: P (orange 3.4 px ping r42 on its plaque), then the six PHP count signs L1 R2 L2 R3 L4 R4: each plate (58-66 world, 60-69 px on screen: sand, SOLID ink elephant) pops onto its bracket with the 7 % spring, swings (pendulum) and fires an ORANGE 3.4 px ping ring (r 0.75 x the plate -> 1.8 x). All seven are inside x 90-950 on screen |
| 4.11 | 12.505 | w39+0.10 'out' | the card paper-flips (0.2 s) to L4 'of sites whose server / language is known · W3Techs' (mandatory, 36 px) |
| 4.11-4.26 | 12.50-12.65 | w41-0.10 'ten' | three cream sun slices (12.50 / 12.53 / 12.56, whole by ~12.71) + three BLANK cream plates on L3, L5, R1 (12.55 / 12.60 / 12.65): the 7/10 pie |
| 4.51-4.63 | 12.905-13.025 | w42 'websites' | the seven PHP screens light in a wave (0.02 s, 2-frame peach pop; the press screen re-pulses): each page a peach header and a BIG solid ink elephant (>= 36 px wide on screen). The three non-PHP screens stay dark sage to the cut: 7 lit, 3 dark, like the pie |
| 4.81 | 13.205 | w42+0.30 | the near walkers turn toward the press house (lean); a far walker waves; a bird turns round |''','''| 3.56-4.04 | 11.955-12.435 | w38 'seven' | the COUNT on the SCREENS (polish round 1: one street encoding), near -> far, 0.08 s apart: P (orange 3.4 px ping r42 on its plaque + its lit screen re-pulses peach for 2 frames), then the six side PHP screens L2 R2 L3 R3 L4 R4 (12.035 ... 12.435): each pops 2 frames of peach glow, then its page (peach header + a BIG solid ink elephant, 36-50 px on screen, springing in 7 %) and fires an ORANGE 3.4 px ping ring (r 0.8 x the screen width -> 1.8 x). All seven are inside x 89-980 on screen, in the clean screen band y ~870-980 |
| 4.11 | 12.505 | w39+0.10 'out' | the card paper-flips (0.2 s) to L4 'of sites whose server / language is known · W3Techs' (mandatory, 36 px) |
| 4.11-4.26 | 12.50-12.65 | w41-0.10 'ten' | three cream sun slices (12.50 / 12.53 / 12.56, whole by ~12.71) + BLANK cream pages (thin sand header, no elephant) pop on the three non-PHP screens L1, R1, L5 (12.55 / 12.60 / 12.65, 2-frame glow first): the 7/10 pie |
| 4.51-4.63 | 12.905-13.025 | w42 'websites' | the seven PHP pages re-pulse in a wave (2 frames peach, press house first, then L2 ... R4 0.02 s apart); the blank pages stay |
| 4.81 | 13.205 | w42+0.30 | the near walkers turn their heads toward the press house (polish round 1: a 6 deg tilt about the NECK, head in, shoulders out; was a 3.2 deg sway about a pivot under the feet that slid them sideways); a far walker waves; a bird turns round |''')
rep('''| 5.39 | 13.78 | w45-0.075 'it.' | the pie pops back to solid in ONE frame: f161 (13.760) the full pie, f162 (13.793) a clean solid disc (slices and spokes gone together), one frame before 'it.' and before the take-off squash |
| 5.45 / 5.55 | 13.945 | end(it) | the sun's anticipation squash (from 13.845), then take-off on the low glide-hop, IN FRONT of the R-row roofs |
| 5.66 | 14.05 | cut(it)-0.12 | Pip pops to stand-side facing right and crouches (S04 owns the leap) |''','''| 5.42 | 13.81 | w45-0.045 'it.' | the pie pops back to solid in ONE frame: f162 (13.793) the full pie, f163 (13.826) a clean solid disc (slices and spokes gone together), 0.03 s before 'it.' (13.855, f164: inside ENGINE rule 5's +-0.05) and one frame before the take-off squash (polish round 1: was 13.78, 0.062 s early) |
| 5.45 / 5.55 | 13.845 / 13.945 | end(it) | the sun's anticipation squash (from 13.845, when it also moves from BEHIND the side rows to IN FRONT: the squash hides the swap), then take-off on the low glide-hop, in front of the R-row roofs |
| 5.66 | 14.05 | cut(it)-0.12 | Pip pops to stand-side facing LEFT (polish round 1: the way S04 carries him) and crouches (S04 owns the leap); his tail clears the L4 card by ~15 px |''')
rep('''Pauser details (static, inked): the plan furniture above, two window boxes with plants on L2's top storey and one on
R3's, the nine sign brackets, the bird wire with two birds, the near-grid notes and the 'lot 3' footprint detail (the
last two under the bottom UI: pause / desktop).''','''Pauser details (static, inked): the plan furniture above, two window boxes with plants on L2's top storey and one on
R3's, the bird wire with two birds, the near-grid notes and the 'lot 3' footprint detail (the last two under the bottom
UI: pause / desktop).''')
rep('''(545, 945, 1.04) at
w34 'everyone' (10.64, local 2.247; fix round 2: was the walker beat 10.54), log zoom, then locked to the cut. The SUN is
screen space (inverse camera): (690, 700) r110, pinned.''','''(545, 945, 1.04) at
w34 'everyone' (10.64, local 2.247; fix round 2: was the walker beat 10.54), log zoom, then locked to the cut. The SUN is
screen space (inverse camera): (690, 700) r110, pinned. Measured clearances at the lock (polish round 1, f90 full res):
>= 17.9 px to the press-house roof, >= 19 px to R4's roof corner; the set's sage far peek that came within 7.6 px of the
disc's lower right is no longer drawn.''')

open(p,'w').write(s)

# GUST: fresh evaluation (THE FRAME LOOP, 2026-10-31)

**The feeling it gives:** a striking heroine braving a gale: a calm figure in a stiff rose cone of a coat while a
neon-magenta cape and a comb of straight black needles stream far behind her; alive and worth pausing on at phone size,
but heavy and dramatic rather than light and carried, the flag reads as a cape (a costume), and the strangers are quiet
paper cut-outs whose men look soft and boyish.

**The feeling intended:** light, graceful and alive: a person carried by the wind, simple and clean enough to read in a
glance at phone size, beautiful and pleasant; today's 20-30-year-olds, never children, never a costume.

**Shared:** alive, simple, clean, beautiful at a glance. **Missing:** light, carried, never a costume, men manly.

## Verdict: ALMOST

The feeling lives at the edges: one wind, hair and cloth streaming one way over a calm body, a figure you would stop on
at phone size, clearly closer to the references and clearly better than v4. What holds it back is specific and needs no
new approach: the flag reads as a cape, the coat is a rigid tent, the hair a comb of needles, the men boys.

## Beside the references (and v4)

- **(1) Closer to the references:** clearly: one garment shape, a dark cap and ribbons, one wind, near-blank faces, flat
  soft paint, a thin rim, pointed hems. The craft is shared at the edges and missed in the cloth (06's flag is the
  coat's own shaded back half, ours an added sail; their windward cloth hangs, ours flares) and in the hair (one mass
  that splits later, ours a fan of needles from the start).
- **(2) Beautiful, today's adults:** her yes, as a poster; the cast pleasant, adult, never children. Women feminine; the
  men soft and boyish. Costume: the cape; the big open shirt reads as a poncho.
- **(3) Film size, filled black:** every person reads as one clear shape; she reads as a caped figure.
- **(4) Motion:** flowing and clean: hair and flag lag, overshoot a touch and settle; no jitter or popping (the
  frame-to-frame change in the hair and flag is even, with no spikes). But the coat's body is a rigid cone the legs
  scissor under; only its flag and hem points live.
- **(5) The dusk still at phone size:** they belong in style and palette, and she is the one colour found first. The
  staging and the light let them down (fix 6).
- **(6) Better than v4 at a glance:** yes: a picture, not a mannequin.

**Keep:** one wind per shot; her hair's length and needle tips; the film-size face (a pale sliver, no eye); the gust
from behind (lift, overshoot, settle); the lilac skirt's flame panels (09) and swept lob; the trench's belt tails; the
chore jacket open over the tee; the clean paint and thin rim.

## Fixes (paint-overs: `EVAL_paintover_her.jpg` for 1-4, `EVAL_paintover_cast.jpg` for 5)

1. **Make her flag the coat's own back, not a cape.** In the 3/4 and profile views it leaves the collar and rejoins
   the coat at the hip on top of a whole coat; from behind it is a wide sail with a deep curved belly: at a glance a
   cape, a costume. Root it down the back from the shoulder blade to the hem, so what flies is the back half of the
   coat while the front half hangs (06); let it leave the body low and run in long straight edges to one point near
   knee height. In the profile walk let the back hem stream in two or three long points instead (05).
   (`garments.ts` COAT_Q, COAT_P, COAT_B, the `flag` shapes.)
2. **Paint the flag in the coat's own shade.** It is a neon magenta at the edge of the screen's range (sampled
   rgb 159, 0, 81, fully saturated, against a coat at about two-thirds saturation), so the cape reads before the woman
   and the coat splits into two colours. In 06 the flag is the coat's red a value darker and no more saturated, a deep
   wine. Keep it one red in shade; the lit front stays the brightest thing. (`figure.ts`, the `flag` fill from
   `toneOf`'s shade and deep, whose hue turn and chroma push it out of gamut.)
3. **Let the wind press the windward side; flare only downwind.** The upwind edge of her coat flares out nearly as far
   as the downwind one and its hem corner kicks upwind (3/4 and back views): a symmetric cone that only the flag
   animates, so she feels heavy, not carried. Let the windward side hang straight or press against the legs (06's
   hanging half, 09's skirt) so her slim figure shows through the cloth, and send all the flare and every hem point
   downwind.
4. **Hair: one mass first, then three waved ribbons.** Her six ribbons root all over the back of the head, crown to
   nape, and fan out at once as straight needles: a comb at hero size (the owner: "a few long tapering ribbons ...
   never many strands", "a little messy ... wavy"). Root them together low so the hair leaves as one mass for about a
   third of its length, then parts into three ribbons and one fine wisp, each with a slow visible wave and a needle
   tip (05, 06, 08). At film size it already reads this way; make the hero size match. (`hair.ts` LONG.)
5. **Give the men a man's head, neck and shoulders and a lifted cut; make the big shirt a shirt.** Their profile is
   hers (a small round chin and the same pink cheek, painted for both sexes in `figure.ts`) on a thin neck and her
   sloping shoulders, under a flat helmet cut whose straight fringe line reads as a cap at film size; the big open
   shirt from behind is one shape from the neck with a flag at the hip, a poncho. Give them a longer, squarer jaw with
   a corner under the ear, a firmer chin and brow, no cheek colour, a thicker neck, shoulders a touch squarer; lift the
   cut off the forehead and sweep it back into two or three points with a broken hairline; show the shirt with a
   dropped shoulder corner, an elbow-length sleeve plane with the slim forearm out, the open front over the dark tee
   (a 3/4 view) and short hem points. (`head.ts` M_P, M_Q; `hair.ts` SHORT_CAP; `garments_cast.ts` SHIRT_B.)
6. **In the dusk still, put the strangers behind her and in the scene's light.** The three promenade strangers stand
   nearer and larger than her (215-231 px against her 156; the owner keeps only the "you" in the foreground), and
   unlike the mascot nobody casts the low sun's long shadow, so they sit on the scene as clean cut-outs. Re-stage the
   sheet with her nearest or largest and the strangers smaller behind; give every figure the scene's long cast shadow
   and a warm rim on the sun side.

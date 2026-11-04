# FLOW v5 · GUST: notes (2026-10-31)

**The feeling:** light, graceful, alive: a person carried by the wind, read at a glance at phone size; closest to
the references (`../../../refs_people_flow/` 02, 05, 06, 07).

## The rules as built (what each serves)
1. **One long outer piece IS the figure** (one clean read): her open coat to the shin whose own back half flies as ONE
   pointed flag in the coat's shade while the windward half hangs (06); a belted trench, its belt tails streaming; a
   bias skirt in flame points under a cropped knit; an overcoat; a big open shirt over a dark tee; a chore jacket.
2. **Straight runs into sharp points,** 2-4 per hem, every point downwind; the windward side hangs or presses on the
   legs (light cloth in moving air, never a tent); folds only as long straight planes: the shade side and the sleeve.
3. **One wind per shot** (`air.ts`): each free node and ribbon bone moves between a still-air and a designed
   streaming shape through a damped spring, later and slower toward the tips (lag, overshoot, settle), plus a
   travelling flutter. Pure in time, cached: no jitter.
4. **Hair:** a dark cap; her hair leaves the back of the head low as ONE mass and parts into three waved ribbons and a
   wisp (`mass()`: the ribbons share their first bones); men's cuts lift off the forehead and sweep back into two or
   three points over a broken hairline; the calm cut is a low knot.
5. **Face:** about 6 heads; the 3/4 body turns its head into the wind (profiles, lost profiles); one small eye
   looking away from 300 px up, none at film size; hers soft with a warm cheek, his a longer, squarer jaw with a
   corner under the ear (its shadow on a thicker neck), a firmer brow, no blush.
6. **Paint:** one gradient per shape toward the key (upper left); the lit rim sized in screen px; shades kept inside
   the screen's range (a deep wine, never a clipped neon).
7. **Colour:** her raspberry; strangers camel, mauve, slate, sage, terracotta; hair and legs dark.
8. **Walk:** a 2D cycle after `walk5`, soft IK (no knee snap), a ground-matched swing (no foot snap); the headwind
   presses the coat's front onto the leading leg (the knee and shin show through), the back hem streams.
9. **In a scene:** the scene's low sun gives every figure its long soft cast shadow and a warm rim on the sun side
   (`paint.ts castShadow`, `env.sun`).

## Still rough
- Built views only: her three, one per stranger (Theo also walks); no turns, sitting, gestures, or facing right.
- No true 3/4 face (the 3/4 body borrows the profile head).
- The flag needs about 0.5 H of room downwind.
- Dark legs only (no light-leg variant for dark grounds, ref 09).

**Adjusted (round 1):** after `EVAL.md` (ALMOST), the six fixes and nothing else. (1) The flag read as a cape on a
whole coat: it is now the coat's own back half, rooted down the back from the shoulder blade to the hem, leaving the
body at the waist in long straight edges to one point near the knee, the hem rising into it (06); in the profile walk
the back hem streams in long points instead (05). (2) Its neon was `toneOf` clipping out-of-range shades: shade and
deep now stay inside the screen's range and never pass the lit's colourfulness, so it is the coat's red a value
darker, a deep wine. (3) The tent and its upwind kick: the windward side hangs straight and presses toward the legs as
the wind rises (onto the leading leg in the walk), all flare and every point downwind, so she reads as light cloth in
moving air. (4) The comb of needles: one mass leaving low, parting at about a third into three gently waved ribbons
and a wisp, the mass moving as one. (5) The boyish men: a longer, squarer jaw and its corner, a firmer chin and brow,
no blush, thicker necks, squarer shoulders, cuts lifted into swept points; the poncho became a shirt seen in 3/4 (a
dropped shoulder, an elbow sleeve with the forearm out, the open front over the tee). (6) The dusk still: her nearest
and largest, alone on the promenade with the mascot, the strangers smaller behind on the quay, each in the low sun's
long shadow with a warm rim on the sun side. The sheets give the longer flag room (her a step left in the cast, the
gust row a little smaller).

## Files and renders
Code `src/look/people_dirs/flow_v5/gust/` (`figure.ts` assembles; `sheets.ts` builds the sheets); entry
`src/entry-look-people-flow5-gust.tsx`. From `video/`, one at a time:
```
node scripts/render-frames.mjs F5GHer <dir> 0 --entry=src/entry-look-people-flow5-gust.tsx --concurrency=1
  (F5GCast, F5GMotion, F5GScene the same)
node scripts/render-media.mjs F5GClip motion.mp4 --entry=src/entry-look-people-flow5-gust.tsx --scale=0.5 --concurrency=1
```

# FLOW v5, BREEZE: notes

**It serves (read first):** a person carried by a breeze, light and alive at phone size: today's 20-30 New York and Los
Angeles cast read as one flowing shape, the hair swept one way, a near-blank face. The air lifts; it never tears.

## The rules as built
- **One shape, one colour.** Her oversized long coat (crimson, the one saturated colour) is one shape from narrow
  sloping shoulders, its width carried downwind; the opening is only a straight plane edge. Strangers: a top and a
  bottom at most, each one shape, the bottom a deep shade of the top's calmer related colour. *Clean at a glance; the
  "you" leads any crowd.*
- **Straight runs into points, all downwind:** two to four hem points, the downwind side one run out to a lifted tail,
  one straight shade plane from the shoulder. *Crisp, no noise.*
- **One air per shot** (`air.ts`): a breeze, a slow swell, optional gusts; each hair chain and free hem node reads it
  later the freer it is, with a travelling flutter; a walker adds a headwind and the hair lags the bob. Pure in time,
  so nothing pops (no shape changes its node count; a soft knee IK cut the coats' worst frame step from 16 to 4.5
  units). *A calm body, living edges.*
- **Hair:** a smooth dark cap, ONE mass forking into a long lead ribbon and two shorter tips; from behind it lies over
  her back. Men's cuts end in two or three swept points; the bun is the calm cut.
- **Body:** about 6.7 heads; legs two slim dark strokes, small wedge feet; arms inside (her near arm a sleeve plane
  with a hand tick), one acting arm (the walk's small swing, a hand on the hip, a forearm to a pocket); hands small
  closed tapered shapes.
- **Face:** features set a little low, a small soft nose; the iris toward the look (her lash flicks, his lid is
  straight under a firmer brow); a dot below 18 px. *Appeal without a child's face.*
- **Paint** (`render.ts`): a soft gradient toward the key, a straight shade plane, a falloff to the hem, a crisp rim
  1.25-2.4 screen px, a soft contact shadow; no outlines.

## Still rough
- Only the views in use are authored (her three, each stranger one).
- The curls' and crowns' points can look spiky at 640 px; the cast's poses are quiet.

## Render (from `video/`)
```
node scripts/render-frames.mjs F5BHer <dir> 0 --entry=src/entry-look-people-flow5-breeze.tsx --concurrency=1
node scripts/render-media.mjs F5BClip motion.mp4 --entry=src/entry-look-people-flow5-breeze.tsx --scale=0.5 --concurrency=1
```
(F5BCast, F5BMotion, F5BScene as F5BHer.) Fast loop without a bundle: `flow_v5/breeze/dev.ts`.

**Adjusted (round 1):** after the fresh evaluation (`EVAL.md`, ALMOST), its six fixes and nothing else.
1. *The breeze shapes her coat* (`garments.ts longCoat`, all three views): the upwind side hangs straight and close
   from the shoulder, and in the headwind walk the front runs from the chest onto the leading leg; the width the upwind
   corner had is all downwind now, where the coat's lower half runs out from the waist into one long, lifted tail point
   and a shorter second point (06's flag and 05's back flare, at breeze strength). She reads carried by the air, not a
   cone.
2. *A coat, not a cape:* each shoulder slopes into its side in one run, no hanger corner; in 3/4 the near arm hangs
   inside as one long sleeve plane (a lit leading edge, a soft back shade, a straight cut at mid-thigh) ending in a
   small hand tick (05); from behind, one plane edge where the upwind arm hangs.
3. *One lead ribbon* (`hair.ts LONG`): the fork's upper tip is the longest and thinnest, with a slow S (it rises out of
   the fork, runs level, its tip dips); the other two are shorter and fan out below it; the two crown wisps are folded
   into the mass (gone, and with them the spur at the cap).
4. *Each stranger's colour leads* (`cast.ts`, `wear.ts`): trousers in a deep shade of the person's own colour (W2
   cocoa, M2 slate blue, M3 deep brick), each leg one straight wide band from the hip, only its downwind corner swept;
   W2's big shirt longer, only its centre front tucked; M2's shirt closed into one short-sleeved shape (no dark tee);
   M3 stands a little narrower, so his straight legs no longer splay into a flare.
5. *One breeze on everyone* (`flow.ts`): each free point knows its place along its edge, and one flick (quick out,
   slower back) travels along the hem and reaches the tail last; the freest points also flap a quarter later and lift
   when a gust rises, so a tail's height lives (a check, not a target: in the clip her tail now moves ~90 px up and
   down and ~85 px across, at most ~9.5 px a frame at 1060 px tall, still gliding). Every stranger's hem, sleeve ends
   and hair points are drawn swept downwind and flutter a little on the same air (the men's cuts end in two or three
   graded points); a walking coat's tail follows the trailing knee a moment ago, so M1's tail, and hers, trails and
   swings after the stride. The shoulders stay held.
6. *Small hands, a quieter arm* (`body.ts fistD`, `figure.ts walkP`): every hand is a small closed tapered shape,
   longer than wide (08's fist); the walking arm swings less, with a slight elbow bend, and stays mostly inside the
   coat.
The polish notes (cast shadows and a warm rim in the dusk still, the 3/4 face's turn, M1's crown) are left for a later
round. The sheets and the clip are re-rendered under the same names.

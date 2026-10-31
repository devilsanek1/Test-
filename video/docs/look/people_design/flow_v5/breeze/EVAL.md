# FLOW v5, BREEZE: the evaluation (fresh evaluator, 2026-10-31)

**The feeling it gives:** calm, clean, pleasant and readable at a glance. Her streaming dark hair is the one living,
graceful thing. Her red coat is a stiff paper cone that tilts rather than flows, and from the front 3/4 and from behind
it reads as a cape. The strangers are upright flat-vector figures, boxy tops on heavy dark flares, standing in still air.

**The feeling wanted:** light, graceful and alive: a person carried by the wind, simple and clean enough to read in a
glance at phone size, beautiful and pleasant, a figure a viewer pauses on.

**Verdict: ALMOST.** For her, the feeling is there in the hair, the clean read of one colour and the calm walk. What
holds it back is the coat, which the breeze never shapes. The cast is the furthest from the feeling: W2, M2 and M3 read
as v4's "tube on a second tube" again, now flat.

How I looked: I looked at the pictures before opening any brief or notes. I looked at the four sheets at full size and
at 360 px wide, every 20th frame of `motion.mp4`, and runs of consecutive frames (hair tips, hem) at 4x. After that, I put the twelve references
upscaled beside her at one figure height, with v4's contact sheet as the "before".

## The six questions
1. **Closer to the references?** It is simpler, a touch cartoonish and has little detail: yes. Is it flowier? The hair
   is; the clothes are not. They are straight-sided cones and boxes that flare evenly on both sides, where the
   references' cloth leans downwind (05's back flare, 06's flag, 09's flames). It shares their craft: one colour shape,
   a soft gradient, a thin lit edge, a dark cap. It does not share their silhouette lifted by the air.
2. **Beautiful, today's 20-30?** Her profile face is lovely and adult. Women read feminine and men manly, and nobody
   reads as a child. Two costume risks: her coat with no arm reads as a red cape, and the men's flares read as the
   1970s.
3. **At film size, filled black:** every figure reads at a glance, and hers read best. M3 is a plank.
4. **Motion:** it is smooth, with no jitter or popping. The hair tips' ±2 px flicker is the anti-aliasing of the needle
   tips; at 4x the tips glide. The planted foot moves with the ground, so no foot slides. The body is calm, but the
   edges hardly live. The hem points flutter only a few degrees, so the coat pivots as one stiff piece with the stride,
   and its tail keeps the same height for 4 s. On the forward swing, the arm leaves the coat as a straight stick. One
   exception shows the way: in the background, W3's skirt point sweeps out and back, and it looks alive.
5. **The dusk still at phone size:** they belong to the flat painted world, and her red leads. The strangers stand
   like pins in still air. With only a contact shadow they sit on the light, not in it.
6. **Clearly better than v4?** Her: clearly yes. The cast is simpler but not clearly better.

## Fixes (marked on `01_her_paintover.png` and `02_cast_paintover.png`)
1. **Let the breeze shape her coat** (`garments.ts longCoat`, all three views). Today the upwind corner flares out as
   far as the downwind one: q `sfx − 62·fl`, b `lx − 54·fl`, and p's front tip ahead of the leading knee. The hem is
   one V, so she reads as a cone. Make the upwind side hang straight and close from the shoulder; in the headwind walk,
   the front presses onto the leading leg. Give that width to the downwind side and draw its hem out into one long
   tail point and a shorter second point, both a little lifted: 06's flag and 05's back flare, at breeze strength.
   *Serves: light, carried by the wind.*
2. **A coat, not a cape** (front 3/4 and from behind). Two things make her read as a cloak on a hanger: there is no
   arm, and the upwind shoulder turns a corner before falling straight. Slope each shoulder into its side in one run.
   Give the near arm as one long straight sleeve plane, from the shoulder's roll to mid-thigh, with a small skin tick
   for the hand (05's sleeve). From behind, one plane edge where the arm hangs is enough. *Serves: today's woman in a
   long coat, never the references' costume; narrow above, free below.*
3. **One lead ribbon** (her hair, `hair.ts LONG`). The three tips are almost the same length and fan out in parallel,
   like a comb. The two thin top wisps stand off the crown like antennae. Make one tip the leader: clearly the longest
   and thinnest, with a slow S along it. Make the other two shorter and spread them more. Fold the wisps into the mass,
   or keep one lying close to it. The breeze may keep the hair shorter than the references' hair. *Serves: the hair
   flows (05, 07: one mass that splits into tapering lines of different lengths).*
4. **Let each stranger's colour lead** (W2, M2, M3: the bottoms in `cast.ts`, `wear.ts wideTrousers` and `openShirt`).
   Their dark trousers are 40-45 % of each silhouette and flare at the hem to roughly twice the hip width. The
   upwind leg's corner flares into the wind (`ankleF − hw·0.62`). Give the trousers a deep shade of the person's own
   colour, still darker than the top. Cut each leg straight and wide from the hip, and sweep only the downwind corner.
   Make the big shirt a little longer so the colour is the bigger shape, and close M2's open front so the shirt is one
   shape. *Serves: one shape, one colour; today's wide-leg trousers, not flares.*
5. **One breeze on everyone, and edges that live** (`flow.ts` free nodes, and the strangers' garments and cuts). The
   free points swing a few degrees about a pivot well above them, so her hem moves with the legs, not with the air. In
   the clip, M1's coat hangs like a plank while he walks. On the sheets and in the still, W2's shirt point, M2's
   sleeves, M3's hem and the men's hair points show almost no sweep. Let the free points flick visibly, as a wave that
   travels along the hem and reaches the tail last; W3's skirt in the clip already does this. Give every stranger the
   same downwind sweep and a little flutter, and let M1's tail trail and swing behind his stride. Keep the shoulders
   held. *Serves: a calm body with living edges; one wind per shot.*
6. **Small hands, a quieter arm** (`body.ts armD`; her walk, M1's walk). The hands are round balls: mittens at 640 px,
   dots at film size. Make each hand a small tapered closed shape (08's fist). Bend the elbow a little, and keep the
   swing small enough that her arm stays mostly inside the coat's outline. *Serves: a calm body; the coat stays one
   shape.*

## Polish (not blocking)
- To seat them in the dusk light, give each person a long soft shadow cast away from the low sun, and a warm rim on the
  sun side. In the still, the strangers on the promenade are nearer and bigger than her (195-221 px against 156 px).
  That is a fault of the test staging, not of the people.
- Her 3/4 face reads flatter than her profile, a mask under the fringe; it needs a touch more turn at the brow and
  nose. M1's crown reads lumpy. At 640 px, a small spur shows where a top wisp meets her cap.

Measurements, only to explain what the eye saw. The dark below the waist as a share of the whole silhouette: W2 45 %,
M2 41 %, M3 45 %, against her 7 %, M1 9 % and W3 5 %. The trousers' hem against the hip: W2 1.7x, M2 1.75x, M3 2.3x. In
the clip, her coat's tail moves at most 3 px a frame and its height varies by 9 px over 4 s.

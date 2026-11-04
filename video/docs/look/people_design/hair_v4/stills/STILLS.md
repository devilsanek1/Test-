# Hair v4: the stills (2026-10-30)

Rendered with Remotion from `video/` (one at a time):
`node scripts/render-frames.mjs <H4Cuts|H4Shading|H4Motion> <dir> 0 --entry=src/entry-look-people-hair4.tsx --concurrency=1`
(the frame lands as `<dir>/f00000.png`, copied here under the names below). Code: `video/src/look/people_dirs/hair_v4/`
(`Sheets4.tsx` draws the three sheets). Every figure is the v3 body and the current LASH head with the v4 hair on the
skull's frame; grounds are mid-dark dusk (no pale-on-pale, `../../EVALUATION.md` §4).

| Still | What it shows | Look at |
|---|---|---|
| `01_cuts_v4.png` (2400 x 2965) | The six cuts, each on its own person: 3/4, profile and from behind (yaw -150, a slight lost profile) close up, then the same three at film size 1:1 (200 px tall); a reference crop beside five of them (ref 05 beside her long cut, **ref 03's bob beside the lob**, ref 03's curls beside the cloud, ref 03's swept crop beside the crop, ref 04 beside the flow) | Is each a clean, stylish haircut a regular viewer would call good-looking? Volume round the skull, one flow from the parting and the crown, ends of different sizes turning one way, a placed strand or two, the gloss and the rim. At film size: does each read as its cut? |
| `02_shading.png` (2400 x 1560) | Her cut painted two ways from the SAME authored shapes: A crisp two-tone (direction C: flat fill, the shadow shape and the highlight as hard flat shapes) and B soft (one gentle ramp across the hair from the key, the same shapes soft-edged); both with the flow lines and the silhouette rim; film size at 200 and 156 px | Which reads more premium and more like the bar (ref 03: flat colour with a soft shadow and a gloss)? |
| `03_motion_strips.png` (2400 x 2890) | Six strips of eight frames (60 fps; frame number and time under each): a head turn 3/4 -> profile on her long cut and on the ponytail; a walk from standing in profile on her long cut and on the lob; a gust from the left on her long cut from behind and on the coily cloud | Read along a row: the hanging pieces lag behind the head, overlap (the tips after the roots), overshoot a little and settle; the shapes stay smooth (no kinks, no crossing, nothing rubbery or jittery); the cap never moves on the head |

## The pick: SOFT (B)
Looked at side by side: the soft ramp turns the hair into a volume (lighter where the key hits the crown, deeper toward
the nape and the hem), and the soft-edged gloss reads as GLOSS; the crisp version's highlight reads as a pale chip cut
out of the hair and its shadow as a slab, the flatness the owner rejected in v3. The soft version is still "few shapes
lit warm on one side with soft gradients" (the playbook's people rule) and keeps crisp silhouettes and a crisp rim, so
it stays clean. 01 and 03 use it; crisp stays available (`shading: 'crisp'`).

## My own look (after fixing what I saw)
Fixed while looking: long hair flung to its bend limits by a summed gravity force (now a bounded plumb turn); the far
side of her long cut boxing the face in; the face-framing layer hidden behind the near sleeve (now over the shoulder,
z 61); the profile bang drawn as a slab across the forehead (now a C that sweeps back above the eye); the back view's
cap reading as a helmet over a curtain (one continuous silhouette, no seam shadow); the lob's swoop as a thin strap
(now a full mass with two flips); a skin tooth behind the lob's ear in profile (the cap edge lowered, the tuck widened);
the crop's crown tips reading as 2000s spikes and its zigzag overhang from behind; the flow reading as a woman's bob
(now a men's curtain cut ending above the ears with a tapered nape); the ponytail's tail vanishing into the cap from
behind (its cast shadow added, the tie and tail fuller). Motion: the walk did nothing (the sim's drag was 10x too strong,
every pose folded and the anti-fold guard silently returned the rest drawing; then damping on absolute velocity braked
a steady walk; then per-bone springs let a sideways load curl the chain): fixed with a realistic drag, damping relative
to the parent, and an absolute-direction strength term; the long back hair now lies over the coat in profile (z 46)
so the walk reads.

**Still rough (honest):** the heads are the current LASH heads (a profile face on a 3/4 skull, the ear far back) and the
faces are being redesigned (`../../faces_v2/`): the hair sits on the skull's frame so a new face drops in, but the lob's
tuck and the short cuts' hairlines around the ear follow the CURRENT ear's place and must be checked when the ear moves.
The turn strip reads mostly as the drawing changing (the head's own drawing pops 3/4 -> profile at yaw 70; the hair
morphs between yaw -38 and -69 and its lag is modest by design). The ponytail from behind is the plainest of the 18
views. The cloud's spring in a gust is visible but small at strip size.

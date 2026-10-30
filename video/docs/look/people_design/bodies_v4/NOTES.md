# Bodies v4: poses, hands, clothes, proportions (iteration, 2026-10-30)

Brief: `BRIEF.md`. Bar: the references' bodies (`../refs_hair_2026-10-30/` 05, 03, 02, 01). Build on
`video/src/look/people_dirs/people_v4/` (body.ts, assemble.ts) and `people_dirs/hair_v4/asm_*.ts`; the v4 hair and
faces stay as they are.

## Research (only what this round needs; strength in brackets)
- **Contrapposto.** The weight leg's axis runs straight from the hip joint to the footprint; the pelvis tilts and the
  shoulders tilt the opposite way, the spine curving laterally, the ribcage close to the pelvis on the compressed side
  [a practitioner school: Life Drawing Academy, https://lifedrawing.academy/drawing-lessons/contrapposto ;
  https://lifedrawing.academy/drawing-lessons/how-to-draw-person]; the pit of the neck sits over the supporting foot so
  the figure does not fall [the same, how-to-draw-person; a pro artist's lesson, Proko / Patrick Jones,
  https://proko.com/826, "balancing structure with gestural flow"]. Our numbers stay `../design_research.md` A2 (pelvis
  5-8 degrees, shoulders 3-5 the other way, the free knee 10-25 degrees, its foot forward and turned out 15-30) and
  RECIPE §4's never: no hip-out "model" stance, so the tilt stays at the low end and the hip shift small.
- **The walk.** The arms swing as counterweights, opposite to the legs; the shoulders rotate against the hips; the
  keys are contact, down, passing, up; the arms cross near the body at the passing position; over-rotated shoulders
  are the usual fault [teaching material built on Williams' Animator's Survival Kit: University of Washington CSE 459
  walk-cycle assignment, https://courses.cs.washington.edu/courses/cse459/19au/assignments/assignment_5/ ; ACM SIGGRAPH
  HyperGraph, https://education.siggraph.hosting.acm.org/static/HyperGraph/animation/character_animation/walking/walking_excercise.htm ;
  Animation Mentor blog, https://www.animationmentor.com/?p=45949]. Ours: A6's cool walk (a 2-4 degree lean, the arm
  swinging +-12-18 degrees from the shoulder, the elbow bending more on the forward swing, the hips turning ~8 degrees
  and the shoulders against them), the body lowest at the down and highest at the up.
- **Hands.** Simplified cartoon hands are a palm plus one finger mass (a mitten) with the thumb a separate form, a
  finger split off only when it acts; "always use straights against curves when designing hand shapes" (Disney's
  teaching, as quoted by an animator on Proko's cartoon-hand lesson, https://proko.com/course-lesson/cartoon-hand-demos
  [a practitioner's comment on a pro course]); grouped fingers read and animate better [a practitioner,
  https://davidrickert.substack.com/p/drawing-hands-3-finger-bundling]. Ours (`../design_research.md` H1-H3): the hand
  0.095-0.105 H, the wrist narrower than the hand's widest point, the wrist breaking 10-25 degrees, the fingers curling
  20-35, the thumb facing forward; at 18-40 px the mitten plus a thumb lobe with a notch 35-45 % down; one or two
  separations (index, little finger) at 40 px and up.
- **Clothes.** Folds come from tension points (pull, stretch, bunching) and support points under gravity: the drop
  fold falls in cones from one point, the diaper fold hangs between two, the half-lock forms where cloth compresses,
  the pipe fold from bunched excess; thick fabric makes fewer, bigger folds [a practitioner tutorial on Clip Studio
  Tips by jozlixart, https://tips.clip-studio.com/en-us/articles/6809; Bridgman's seven folds via
  https://swintonsart.com/post/7-kinds-of-fabric-folds-that-are-good-for-painting]; keep tension lines straight where
  the cloth is pulled tight, curves only where it is relaxed, and let gravity win below [a practitioner,
  https://artwod.com/blog/how-to-draw-clothing-folds-a-step-by-step-guide-for-beginner-artists]. Ours (C7): a fold is
  a tapered value sliver (never a line), 0-1 per garment at 130-220 px, 1-3 at 300 px and up, starting at a tension
  point (the inner elbow, the crotch to the forward knee, the back of the knee, a tuck) or hanging from a support (a
  drop fold under the coat's shoulder blade).

## Plan
New modules, the old ones untouched (the v4 stills still rebuild as they were): `people_v4/skel5.ts` (the pose: the
torso as a bent, leaned chain with the contrapposto tilts, two-bone IK for the limbs, the pose library: stand, walk
cycle, ledge, ground, lean), `people_v4/hand5.ts` (authored hands), `people_v4/wear5.ts` (the garments),
`people_v4/body5.ts` (the API body5(sex, build, pose, outfit)), `hair_v4/asm_bodies.ts` (the assembled person on the
new body, the cast's outfits, the props), `hair_v4/asm_sheets_bodies.tsx` (the four stills) and the entry
`src/entry-look-people-bodies4.tsx`.

## Log
- step 0: read the brief, hair_v4/BRIEF.md (the agent rules), EVALUATION.md, hair_v4/final/FINAL.md; this file started.
- step 1: looked at the refs (05, 03, 02, 01) and our v4 cast (`../hair_v4/final/01`, `02`): the bodies are stand-ins
  (arms hanging straight from square shoulders, mitten paddles, stilt legs, one tee and slim trousers, feet parallel).
  Read the code: `people_v4/body.ts` (smooth tubes and lofts on hair_v2's skeleton, `standV2`/`walkV2`, hand = one
  mitten), `hair_v4/asm_people.ts` (person5: body + head + hair on one head frame), `asm_render.ts`, `SheetsFinal.tsx`;
  the old wardrobe (`graphic/wear.ts`: coat, top, trousers, sleeves as rounded polygons) and her direction-C evening
  look (`graphic/cast.ts` herEvening). The craft rules already researched: `../design_research.md` §6 (hands H1-H4),
  §8 (clothing C1-C10), §10 (pose A1-A8); `../faces_v2/RECIPE.md` §3 (the composition) and §4 (never: no hip-out
  "model" stance as staging).

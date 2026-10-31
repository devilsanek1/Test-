export const meta = {
  name: 'people-flow-breakdown',
  description: 'Break down the owner\'s new people references and map our v4 people code for a FLOW rework',
  phases: [
    { title: 'Understand', detail: 'reference breakdown + current-model code map, in parallel' },
  ],
}

const HEADER = `THE FEELING (read first): the owner wants our people to feel light, graceful and alive, the kind of figure a
viewer would pause on at phone size: a person carried by the wind, simple and clean, never a stiff tailored mannequin.
His words (2026-10-31): "I think overall the models are simpler, more flowy, slightly more cartoonish, the clothing is
more fluid, less details and more flow, similarly with hair / I also generally like the visual style / I want you to
take our model and rethink given these references". The references and his full note: video/docs/look/refs_people_flow/
(README.md and five small JPEG screenshots, 01-05; upscale them to look closely, e.g. with PIL, they are ~270-390 px).
Our people now (v4, in use): video/docs/look/PEOPLE_DESIGN.md (top status blocks and section 5 headings only),
stills video/docs/look/people_design/bodies_v4/stills/contact_sheet.jpg and hair_v4/final/04_in_scene.png.
Numbers here are examples or checks, not targets: any measurement you take describes what we see; it never becomes a
number a figure is built to.
Repo rules that apply: write results into files, report in at most 3 lines; commit nothing (the orchestrator commits);
never write outside the paths named below except scratch files in /tmp/claude-0/ .
`

phase('Understand')
const [breakdown, codemap] = await parallel([
  () => agent(`${HEADER}
YOUR JOB: the art breakdown of the five references, for an art director who must rebuild our people from it.
Look hard at each picture (upscaled 3-4x), then make measurements where they help explain (segment the figure from the
sky with python/PIL/numpy: the figure's height, the head with its hair, the garment's share of the silhouette, the
garment's width at the shoulder vs at the hem, the visible legs, the hair's reach beyond the body, the stride, the
angles of the hair ribbons and hem points). Break them down under exactly these headings, each a few tight lines, in
words first, numbers only as labelled observations:
 1. Proportions (heads tall, head size vs body, leg length, how "slightly cartoonish" is achieved; note that 03 and 04
    read younger: say what an adult 20-30 version keeps and what it drops).
 2. Overall shape (the silhouette as one or two primitives; the lantern/A-line/column; negative spaces; what is hidden).
 3. Motion (what moves, which way, how the wind unifies hair and garment, the stride, the calm body vs the moving edges).
 4. Directional style of the clothing (how hems, folds and edges are drawn: straight runs into sharp points, every point
    sweeping one way, flag-like tatters; where curves vs straights go).
 5. Hair (how many ribbons, taper, how they leave the head, edge softness at the tips, the head as a dark cap).
 6. Face, hands and feet (what is drawn and what is left out at each size).
 7. Finish and colour (flat vs soft painted inside the shape, the lit edge, edge crisp vs brushy, the garment's colour
    against its sky; what of this "visual style" the owner likes we can carry into our painted look).
 8. Why they read more appealing and clean than our v4 people: a ranked list of the 6-8 biggest differences, each with
    the concrete fix in our terms (what to delete, simplify or merge in our figure).
 9. A sketch of the FLOW design grammar in 10-12 rules for an adult cast (women and men, today's 20-30 NY/LA clothes
    translated into flowing shapes: e.g. a long open coat, a trench's tails, wide trousers, a long skirt, a big shirt),
    each rule naming the feeling it serves. Keep the references' costume (capes, hats) and the cat out of the rules.
Write video/docs/look/refs_people_flow/BREAKDOWN.md (SMALL: at most ~1300 words; the owner said our guides are far
too long). Also make video/docs/look/refs_people_flow/breakdown_sheet.png (about 2400 px wide, dark neutral ground,
python/PIL): each reference upscaled, beside it its figure's silhouette filled black with head-height ticks and arrows
for the flow direction; a last column with our v4 her (crop her from bodies_v4/stills/01_her_before_after.png, the
NEW column, front 3/4 and from behind) at the same height with her own silhouette, so the difference is seen at a
glance. Short captions, readable when the sheet is viewed at half size. Look at your sheet before you finish.
Final reply: 3 lines (the files, the three biggest differences).`, { label: 'reference breakdown', phase: 'Understand', effort: 'max' }),

  () => agent(`${HEADER}
YOUR JOB: the code map an engineer needs to build a new FLOW figure fast, reusing what is good in our v4 people.
Read (skim, do not study every line) video/src/look/people_dirs/people_v4/ (skel5.ts, body5.ts, hand5.ts, head.ts,
faces.ts, paint.ts, pen.ts), video/src/look/people_dirs/hair_v4/ (rig.ts, sim.ts, hair.ts, bez.ts, cut.ts, one cut such
as cut_long.ts, asm_bodies.ts, asm_render.ts, asm_motion.ts, motion4.ts), video/src/lib/figure/wind.ts, and the entry
video/src/entry-look-people-bodies4.tsx with video/scripts/render-frames.mjs (dependencies are installed in video/).
Then write video/docs/look/people_design/flow_v5/TECH.md (at most ~900 words) with:
 1. How a v4 figure is built and drawn, in 8-10 lines (pose -> skeleton -> body shapes -> clothes -> hair rig -> paint).
 2. REUSE for FLOW: the exact modules/functions worth keeping (the pose/skeleton with IK and the pose library, the
    spring-chain sim and wind for ribbons, the bezier/path helpers, the paint ramps, the render harness), with file and
    function names and their signatures.
 3. REPLACE: what fights the references' simplicity (jointed limb segments, authored hands, tailored garment panels,
    strand-built cuts, many paths), and why.
 4. A recommended FLOW figure architecture in ~15 lines: a pose drives a FEW closed shapes (the head with its hair cap;
    ONE garment silhouette whose hem is a polyline/bezier swept by the wind with pointed tips; legs as tapered strokes
    with simple boot shapes; arms mostly inside the garment or as one tapered stroke; hair as 3-6 tapered ribbons on
    spring chains), painted flat with a soft inner gradient and a lit edge; how it stays animatable (every shape a
    function of pose + time + wind), and how a level of detail drops ribbons and tips at small sizes.
 5. How to render a sheet: a minimal entry file pattern and the exact command (from video/), with the time one frame
    took when you rendered the existing B6Cast once as a toolchain check (node scripts/render-frames.mjs B6Cast <dir in
    /tmp/claude-0/> 0 --entry=src/entry-look-people-bodies4.tsx --concurrency=1). Say if anything failed and how you
    fixed it (do not edit shared code; if a fix is needed only describe it).
Final reply: 3 lines.`, { label: 'current-model code map', phase: 'Understand', effort: 'max' }),
])
return { breakdown, codemap }

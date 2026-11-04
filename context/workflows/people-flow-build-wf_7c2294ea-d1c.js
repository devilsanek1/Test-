export const meta = {
  name: 'people-flow-build',
  description: 'Build two FLOW people variants (GUST, BREEZE) from the owner\'s references, evaluate each fresh, adjust once, then one compare sheet',
  phases: [
    { title: 'Build', detail: 'GUST and BREEZE in parallel; the breakdown gains refs 06-12' },
    { title: 'Evaluate', detail: 'a fresh evaluator per variant (one round: a look iteration)' },
    { title: 'Adjust', detail: 'one adjust (ALMOST) or one rework (NOT THERE) where needed' },
    { title: 'Compare', detail: 'one sheet: the references, v4, GUST, BREEZE' },
  ],
}

const FEELING = `THE FEELING (read first): our people should feel light, graceful and alive: a person carried by the wind,
simple and clean enough to read in a glance at phone size, beautiful and pleasant, the kind of figure a viewer pauses
on. Today's 20-30-year-olds (New York, Los Angeles), never children, never a costume. The owner (2026-10-31): "I think
overall the models are simpler, more flowy, slightly more cartoonish, the clothing is more fluid, less details and more
flow, similarly with hair / I also generally like the visual style / I wabt you to tske out model and rethink given
these references".`

const READ = `READ (in this order; nothing else unless you need it): the twelve references
video/docs/look/refs_people_flow/01-12 (small JPEGs: upscale them 3-4x to look; README.md says what each shows and what
we take and leave); BREAKDOWN.md and breakdown_sheet.png beside them (the art breakdown: 01-05 measured; 06-12 confirm
it and add a coat's back panel streaming as one pointed flag (06), a skirt in pointed flame panels (09), faceted
straight planes (07, 10), one tapered acting arm (08), a calm windless figure with a top bun (11));
video/docs/look/people_design/flow_v5/TECH.md (the code map: what to reuse from v4, how to render). Our v4 people, the
"before": video/docs/look/people_design/bodies_v4/stills/contact_sheet.jpg. The owner's people rules:
video/docs/OWNER_PLAYBOOK.md, the bullets that start "Hair is never static", "Faces, above all the profile" and
"People: small and simple".`

const GRAMMAR = `THE FLOW GRAMMAR (the art director's; both variants share it, each goes its own distance):
- One shape, one colour: a person reads as one garment shape, narrow at sloping shoulders and freer toward the hem,
  with the hair and legs as the dark accent. No kit of parts and no construction: no lapels, cuffs, pockets, seams,
  buttons, fold slivers, trouser stacks or shoe profiles.
- Directional cloth: long straight runs ending in sharp points; every hem is a few points, never a flat hem; all
  points sweep downwind; folds, where any, are long straight planes from the shoulder down (a lit plane and a shade
  plane), never curvy drapes. Curves belong only to the hair, the head cap and the shoulder's roll.
- One wind per shot drives the hair, the hems, a coat's tails or back panel; the body stays calm and upright while
  the edges live.
- Hair: a smooth dark cap (the head's darkest value, no strand lines) and a few tapering ribbons that leave the back
  of the head as one mass and split later, crisp at the root, needle or feathered tips. Author each ribbon's rest
  shape already streaming (TECH.md section 4, item 6: the spring sim only tilts a hanging chain); the sim adds
  flutter, lag and follow-through. Short men's cuts end in two or three swept points. One calm cut (a bun or a low
  knot) for stillness.
- Slightly cartoonish, still adult: a head a touch bigger than v4's on a slim visible neck, long legs, anatomy left
  undrawn; legs two slim dark tapered strokes, feet small dark wedges; arms inside the garment, one acting arm at a
  time as a slim stroke with a small tapered hand.
- Faces near-blank but appealing (the owner's rules hold): the contour and light on the head; one small open eye
  looking away (never at us) only where the head is big enough; from behind, the dark cap; women read feminine and
  men manly; never caricature.
- Paint: flat shapes softly painted inside (a soft gradient across each shape toward the light), crisp outer edges,
  ribbon tips feathered, a thin crisp lit edge on the light side sized in screen pixels so it survives at film size;
  no outlines; a soft contact shadow.
- Colour: the "you" wears the one saturated colour (her garment is her colour: the references' red, magenta or pink
  family, or a film's hero colour); strangers each wear one calmer related colour, so a crowd never becomes a field
  of saturated coats; hair and legs dark.
- Today's clothes translated, never the references' costume (no capes, no conical or round hats, no cat): the long
  open coat whose tails and back panel split into points; the belted trench with streaming belt tails; a long bias
  skirt as a bell under a cropped knit; wide trousers as one flared panel per leg under a big shirt; for men the long
  overcoat as a column flaring a little, the big open shirt fluttering at hem and sleeves over wide trousers, a chore
  jacket over wide trousers.`

const HARD = `HARD CONSTRAINTS: no outlines (no ink lines); our frame is 1080 x 1920 at 60 fps; people appear mostly at
film size (the "you" roughly 130-220 px tall, strangers smaller), so every design must read filled black at that size.
Numbers here are examples or checks, not targets.`

const RULES = `RULES: write only inside your own folders named below (scratch files under /tmp/claude-0/ are fine); never
edit shared code (people_v4, hair_v4, lib/figure, scripts): import it read-only or copy what you need into your folder;
commit nothing (the orchestrator commits); render one thing at a time with --concurrency=1 (another builder shares the
4 CPUs); working renders at half scale, the final sheets full size. Your final reply is at most 3 lines.`

const VARIANTS = [
  {
    key: 'gust', code: 'G', name: 'GUST',
    brief: `GUST, closest to the references. Every look is built around ONE long outer piece that IS the figure (her: a
long open coat to the shin whose back panel streams as one pointed flag and whose front tails split into points; the
cast: a belted trench, a long slip dress under a long open cardigan, a long bias skirt under a cropped knit, a long
overcoat for one man, a big open shirt over wide trousers for another). The wind is strong and clear: the ribbons
stream well past the body, the hems point downwind. The most cartoonish adult: the bigger head, the slimmest legs,
the arms almost always inside. Faces mostly from behind and in lost profile; at film size the profile edge with no
drawn eye.`,
  },
  {
    key: 'breeze', code: 'B', name: 'BREEZE',
    brief: `BREEZE, the same grammar calmer and more everyday: our 20-30 New York and Los Angeles cast. She keeps the long
coat (her one saturated colour); the cast is more varied, two simple fluid masses allowed (a top and a bottom, each one
shape with a few swept points): a big shirt half-tucked over wide trousers (each leg one flared panel), a cropped knit
over a long bias skirt, a short boxy jacket over wide trousers, an overcoat open over a dark column. A breeze, not a
gale: the ribbons stream gently and shorter, the hems lift a little. A touch closer to adult proportions than the
references (still simpler and bigger-headed than v4); arms as slim strokes outside the garment when the pose needs
them, small tapered hands; the face keeps the owner's small open eye looking away in 3/4 and profile at the "you"
size.`,
  },
]

const paths = v => `Your folders: code video/src/look/people_dirs/flow_v5/${v.key}/ ; entry
video/src/entry-look-people-flow5-${v.key}.tsx ; compositions named F5${v.code}* ; stills and notes
video/docs/look/people_design/flow_v5/${v.key}/ .`

const buildPrompt = v => `${FEELING}

YOU BUILD THE VARIANT ${v.name}. ${v.brief}

${READ}

${GRAMMAR}

${HARD}

${paths(v)}
WORK ORDER: (1) her first: build her in three views and LOOK at her at full and film size beside references 02, 05,
06 and 07; keep at it until she clearly belongs with them (simpler, flowier, cleaner than v4) before you build anyone
else; (2) her motion; (3) the cast; (4) the scene.
DELIVER:
- 01_her.png: her in three views (front 3/4 standing in the wind; profile walking; from behind standing, the
  references' favourite view), large (about 640 px tall) on a soft painted sky gradient of her colour family; below,
  the same three at film size; then a row of the same filled black at film size.
- 02_cast.png: her and five more (two women, three men; varied builds and heights; skin across the range; different
  cuts), each in a pose with weight, large; then all of them together at film size on one soft ground.
- 03_motion.png: eight frames of her walk in profile into a headwind; eight frames of her from behind as a gust passes
  (the hair and the hems rise and settle).
- motion.mp4: a 4 s 9:16 clip at 60 fps, rendered at half scale with scripts/render-media.mjs: her walking in profile,
  large, the camera tracking her, two strangers smaller behind, the wind alive in the hair and the hems, never jittery
  and no point popping.
- 04_in_scene.png: the cast at film size in our dusk still, reusing the plate and the places of P4Scene in
  video/src/look/people_dirs/hair_v4/SheetsFinal.tsx (import or copy, never edit), with 2x crops and the whole frame
  at phone size (360 px wide).
- NOTES.md (at most ~400 words): the rules as built, what each choice serves, what is still rough, the render commands.
Before you finish, look at every sheet at full and at phone size beside the references and fix what you can see is
off.

${RULES}`

const EVAL = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['THERE', 'ALMOST', 'NOT THERE'] },
    feeling_it_gives: { type: 'string' },
    fixes: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['verdict', 'feeling_it_gives', 'fixes', 'summary'],
}

const evalPrompt = v => `You are a FRESH evaluator of the people variant ${v.name} (you did not build it; THE FRAME LOOP in
video/docs/PIPELINE_V2.md). FIRST, before reading any brief or notes, open its sheets
(video/docs/look/people_design/flow_v5/${v.key}/01_her.png, 02_cast.png, 03_motion.png, 04_in_scene.png) and a few frames
of motion.mp4 (extract them with ffmpeg into /tmp/claude-0/), look at them at full size and at phone size, and write one
line: "The feeling it gives: ...". Only then read the intent:

${FEELING}

THE VARIANT: ${v.brief}

${READ}

${GRAMMAR}

JUDGE, beside the twelve references (and v4 as the "before"): (1) is it clearly closer to the references: simpler,
flowier, slightly cartoonish, fluid clothes with little detail, hair that flows? does it share their visual craft?
(2) beautiful and pleasant, today's 20-30-year-olds, never children or costume; women feminine, men manly? (3) does
each person read at film size, filled black? (4) the motion: flowy, a calm body, living edges, no jitter or popping?
(5) at phone size in our dusk still, do they belong? (6) at a glance, clearly better than v4? Measurements only to
explain a gap your eye found, never a verdict on their own.
VERDICT: THERE (it achieves the feeling; polish notes only), ALMOST (the feeling is there; specific things hold it
back), NOT THERE (it does not achieve the feeling; it needs a new approach, not a patch).
Write video/docs/look/people_design/flow_v5/${v.key}/EVAL.md: the feeling line first, the intended feeling beside it,
the verdict, then at most six numbered fixes, each naming exactly what to change and why (the feeling or reference it
serves); where it helps, a paint-over (a marked-up copy of a sheet saved beside it: circles, arrows, a short note),
never new rules. Change no code and commit nothing. Return the structured result (fixes as short imperative lines).`

const adjustPrompt = (v, ev) => `${FEELING}

YOU ADJUST THE VARIANT ${v.name} after its fresh evaluation. ${v.brief}
Its builder's notes: video/docs/look/people_design/flow_v5/${v.key}/NOTES.md; the evaluation (read it whole, with any
paint-over beside it): video/docs/look/people_design/flow_v5/${v.key}/EVAL.md. Verdict: ${ev.verdict}.
${ev.verdict === 'NOT THERE'
    ? 'NOT THERE means REWORK from the idea once: a new approach to what failed (a different shape idea, construction or device), never a patch; keep what the evaluation says works.'
    : 'ALMOST means ADJUST: fix exactly the numbered fixes, each as the evaluation names it, nothing else.'}
The fixes: ${ev.fixes.map((f, i) => `${i + 1}. ${f}`).join(' ')}

${READ}

${GRAMMAR}

${HARD}

${paths(v)}
Re-render every sheet and the clip the change touches (same file names, replacing them), look at them at full and phone
size beside the references, and add an "Adjusted (round 1):" paragraph to NOTES.md saying what changed and why.

${RULES}`

const BREAKDOWN_UPDATE = `${FEELING}

YOUR JOB: the art breakdown video/docs/look/refs_people_flow/BREAKDOWN.md measured references 01-05 only; 06-12 arrived
later. Look closely at 06-12 (upscale them 3-4x; README.md says what each shows), measure where it explains (the same
way the doc did: heads, the garment's share and flare, the hair's reach, the angles of hems and ribbons), and INTEGRATE
what they teach into the existing headings (rewrite lines, never append a new section; keep the whole doc at most ~1400
words; the owner finds our guides far too long). What they seem to add, to check with your own eye: the coat's back
panel or skirt streaming as one pointed flag (06, 09, 08's train); folds as long straight faceted planes (07, 10, 12);
one simple tapered acting arm with a small fist and an elbow-length sleeve (08); pale legs under a pink dress (09); a
full glowing lit rim when backlit (10); the calm windless figure, a top bun, the shape alone carrying her (11). Then add
a second sheet, video/docs/look/refs_people_flow/breakdown_sheet_2.png, in the same style as breakdown_sheet.png (each
reference over its silhouette at one height, head ticks, wind arrows, the one shape), for 06-12. Look at it before you
finish. Write only those two files; commit nothing. Numbers here are examples or checks, not targets. Final reply: 3 lines.`

const COMPARE = `${FEELING}

YOUR JOB: the comparison the owner will see. Two variants of our people were built from his references:
GUST (video/docs/look/people_design/flow_v5/gust/) and BREEZE (.../flow_v5/breeze/), each with 01_her.png, 02_cast.png,
03_motion.png, 04_in_scene.png, motion.mp4, NOTES.md and EVAL.md. The references: video/docs/look/refs_people_flow/01-12.
Our v4 people: video/docs/look/people_design/bodies_v4/stills/01_her_before_after.png (the NEW column) and 02_cast.png.
Make video/docs/look/people_design/flow_v5/compare.png (about 2400 px wide, a dark neutral ground; PIL is fine): row 1
the twelve references as small thumbnails; row 2 her, large, in three views: v4 | GUST | BREEZE, at one height; row 3
the casts at film size side by side (v4 | GUST | BREEZE); row 4 each variant's in-scene frame at phone size; row 5 a
few motion frames of each. Short labels readable when the sheet is viewed at half size; under each variant one line
from its EVAL.md (the feeling it gives and the verdict). Also make compare_phone.png: v4, GUST and BREEZE her and cast
at true phone viewing size (the frame 1080 px wide shown 360 px wide), side by side. And COMPARE.md (at most ~200
words: what each variant is, its evaluator's verdict, what is still rough). Look at the sheets before you finish.
Write only those three files; commit nothing. Final reply: 3 lines.`

phase('Build')
const breakdownP = agent(BREAKDOWN_UPDATE, { label: 'breakdown: refs 06-12', phase: 'Build', effort: 'max' })

const results = await pipeline(
  VARIANTS,
  v => agent(buildPrompt(v), { label: `build ${v.key}`, phase: 'Build', effort: 'max' }),
  (built, v) => agent(evalPrompt(v), { label: `evaluate ${v.key}`, phase: 'Evaluate', effort: 'max', schema: EVAL })
    .then(ev => ({ key: v.key, built, ev })),
  async (r, v) => {
    if (!r || !r.ev) { log(`${v.key}: no evaluation came back; skipping the adjust round`); return r }
    if (r.ev.verdict === 'THERE') { log(`${v.key}: THERE, no adjust`); return { ...r, adjusted: null } }
    log(`${v.key}: ${r.ev.verdict}, ${r.ev.fixes.length} fixes -> one ${r.ev.verdict === 'NOT THERE' ? 'rework' : 'adjust'} round`)
    const adjusted = await agent(adjustPrompt(v, r.ev), { label: `adjust ${v.key}`, phase: 'Adjust', effort: 'max' })
    return { ...r, adjusted }
  },
)
const breakdown = await breakdownP

phase('Compare')
const compare = await agent(COMPARE, { label: 'compare sheet', phase: 'Compare', effort: 'max' })
return { results, breakdown, compare }

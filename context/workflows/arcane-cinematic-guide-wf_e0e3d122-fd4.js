export const meta = {
  name: 'arcane-cinematic-guide',
  description: 'Dissect 165 measured Arcane S1 shots (14 contact sheets) into per-shot cinematography records, aggregate stats, write a reusable cinematic guidebook for all videos, critic pass',
  phases: [
    { title: 'Analyze', detail: '14 sheets, 12 shots each' },
    { title: 'Write', detail: '3 section writers in parallel' },
    { title: 'Edit', detail: 'merge into docs/look/CINEMATIC_GUIDE.md' },
    { title: 'Critic', detail: 'accuracy and usability' },
  ],
}

const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/arcane_rec'
const ROOT = '/home/user/Test-/video'
const LOOK = ROOT + '/docs/look'
const SRC = `"Amazing Shots of ARCANE SEASON 1" (YouTube channel Amazing Shots, video id HzJ7Nvwz1e8), a no-narration compilation of shots from Arcane season 1 (Fortiche / Riot / Netflix), screen-recorded by the owner, cropped and resampled to 24 fps (6:19). Timestamps are seconds into that compilation.`
const CTX = `Context: we make 30-45 s vertical (1080x1920) explainers for "What's All the Fuss About?", drawn in hand-drawn ink with flat colour in Remotion (2D layers, our own camera kit; cozy enclosure interiors and occasional Arcane-inspired scale moments; see ${LOOK}/COZY_AND_SCALE.md). The owner asked us to reverse-engineer Arcane's cinematography (camera positions, angles, shot sizes, composition, moves, transitions, light) into a guidebook we use across ALL videos. Source: ${SRC} We measured every shot automatically (cuts; camera move fitted from optical flow: pan/tilt as % of frame width, zoom %, roll, easing, parallax). Caveats: shot lengths partly reflect the compilation editor's cuts, not only the show's; YouTube's auto-captions ("[Music]", lyrics) are burned onto some frames: ignore them. We never copy footage: describe shots in words and translate them into our own 2D recipes.`

const SHOT = {
  type: 'object',
  properties: { shots: { type: 'array', items: { type: 'object', properties: {
    shot: { type: 'number' },
    start_s: { type: 'number' }, dur_s: { type: 'number' }, measured_move: { type: 'string' }, zoom_pct: { type: 'number' },
    pan_x: { type: 'number' }, pan_y: { type: 'number' }, easing: { type: 'string' },
    size: { type: 'string', enum: ['extreme wide', 'wide', 'full', 'medium', 'medium close-up', 'close-up', 'extreme close-up', 'insert/detail'] },
    angle: { type: 'string', enum: ['extreme low', 'low', 'eye level', 'high', 'overhead / top-down', 'dutch'] },
    lens_feel: { type: 'string', enum: ['wide-angle (deep, distorted)', 'normal', 'telephoto (flat, compressed)'] },
    composition: { type: 'string', description: 'e.g. centred symmetry, rule of thirds, frame within frame, leading lines, negative space, silhouette against light' },
    depth_layers: { type: 'number', description: 'distinct depth planes you can see (1-5)' },
    subject_scale: { type: 'string', description: 'how big the main figure/subject is: % of frame height, or "no figure"' },
    move: { type: 'string', description: 'the camera move as you read it, agreeing with or correcting the measured numbers' },
    light_colour: { type: 'string', description: 'key light source and direction, warm/cold contrast, palette in 3-5 words' },
    purpose: { type: 'string', description: 'what the shot does emotionally or in the story (awe/scale, intimacy, tension, reveal, establishing, transition...)' },
    tags: { type: 'array', items: { type: 'string', enum: ['scale', 'cozy', 'enclosure', 'silhouette', 'reveal', 'establishing', 'action', 'intimate', 'transition-friendly', 'symbolic insert'] } },
    recipe_2d: { type: 'string', description: 'how we would build this shot in a 2D layered vertical (9:16) frame: layers, parallax, camera move with numbers, timing' },
  }, required: ['shot', 'start_s', 'dur_s', 'measured_move', 'zoom_pct', 'pan_x', 'pan_y', 'easing', 'size', 'angle', 'lens_feel', 'composition', 'depth_layers', 'subject_scale', 'move', 'light_colour', 'purpose', 'tags', 'recipe_2d'] } } },
  required: ['shots'],
}

const ROWS = SP + '/cam/rows_slim.json'
const sheets = []
for (let i = 0; i < 14; i++) sheets.push({ n: i + 1, from: i * 12 + 1, to: Math.min(165, i * 12 + 12) })

phase('Analyze')
const analyzed = await parallel(sheets.map(s => () => agent(
  `${CTX}\n\nYour sheet: ${SP}/sheets/sheet_${String(s.n).padStart(2, '0')}.jpg (look at it with Read; each row is one shot: 3 frames at 10/50/90 % of the shot, labelled #shot, start time, duration, measured move). If a detail is too small, you may extract one larger frame with: ffmpeg -loglevel error -ss <seconds> -i ${SP}/arcane_s1.mp4 -frames:v 1 -vf scale=900:-1 ${SP}/zoom_${s.n}_<shot>.jpg (at most 4). The measured data for these shots (shots ${s.from}-${s.to}) is in ${ROWS} (a JSON array; read it and take the entries with "shot" ${s.from}-${s.to}); copy start_s, dur_s, move (as measured_move), zoom_pct, pan_x_pct_of_width (as pan_x), pan_y_pct_of_width (as pan_y) and easing into each record unchanged.\n\nClassify every shot on the sheet. Be precise and concrete; the recipe must be buildable in a 2D layered 9:16 frame. Don't write files except optional zoom frames in the scratchpad.`,
  { label: `sheet:${s.n}`, phase: 'Analyze', schema: SHOT })))
const recs = []
analyzed.forEach(a => { if (a) a.shots.forEach(r => recs.push({ ...r, measured: r.measured_move })) })
log(`${recs.length} shot records from ${analyzed.filter(Boolean).length}/14 sheets`)

const count = (key) => { const c = {}; recs.forEach(r => { const v = Array.isArray(r[key]) ? r[key] : [r[key]]; v.forEach(x => { c[x] = (c[x] || 0) + 1 }) }); return c }
const med = (xs) => { const s = xs.filter(x => typeof x === 'number').sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null }
const bySize = {}
recs.forEach(r => { (bySize[r.size] = bySize[r.size] || []).push(r) })
const sizeStats = Object.fromEntries(Object.entries(bySize).map(([k, v]) => [k, { n: v.length, median_dur: med(v.map(r => r.dur_s)), median_abs_zoom: med(v.map(r => Math.abs(r.zoom_pct || 0))) }]))
const stats = { n: recs.length, size: count('size'), angle: count('angle'), lens: count('lens_feel'), tags: count('tags'), depth_layers: count('depth_layers'), easing: count('easing'), sizeStats,
  median_dur: med(recs.map(r => r.dur_s)), moving_share: recs.filter(r => r.measured && r.measured !== 'locked off').length / Math.max(1, recs.length) }
log(`stats: ${JSON.stringify(stats.size)}`)

phase('Write')
const SECTIONS = [
  { key: 'shots', brief: `SHOT VOCABULARY, ANGLES AND COMPOSITION: shot sizes and how often each appears (stats), what each size is used for, camera angles (low for power/scale, high for vulnerability...), lens feel, composition patterns (symmetry, frame within frame, silhouettes against light, negative space), depth layering (how many planes, foreground framing), subject scale in scale shots (figure % of frame). For each pattern: the rule, the measured evidence, 2-3 reference shots (# and timestamp + one-line description), and how to do it in our 2D 9:16 frame.` },
  { key: 'motion', brief: `CAMERA MOVEMENT AND TIMING: how much the camera moves (share of moving shots, typical zoom %, pan %, by shot size), push vs pull and when each is used, easing (how moves start and settle), crane/tilt reveals, parallax, handheld feel, shot durations by size and by purpose (stats), the rhythm between intimate and huge shots. Turn it into numeric presets for our camera kit (e.g. "slow push: 2-5 % over the shot, ease-out"; "reveal pull-out: ..."), each with reference shots.` },
  { key: 'light', brief: `LIGHT, COLOUR, TRANSITIONS AND SEQUENCING: key light sources (windows, neon, sun shafts, rim light), warm/cold contrast and what it means, silhouettes, atmospheric haze for depth; which shot pairs work as transitions (match on shape, light, movement, scale jump across a cut), what makes a cut feel cinematic; how to sequence 3-5 shots into a mini-sequence (establish, scale, intimacy). Remember the compilation editor chose the order, so infer transition principles from shot content (shapes, light, motion direction) rather than the compilation's order. Map everything to our palette rules (soft warm base, one hero, one dark anchor, one pop: ${LOOK}/PALETTE.md) and our cozy/scale rules.` },
]
const written = await parallel(SECTIONS.map(s => () => agent(
  `${CTX}\n\nYou are a cinematographer writing one section of our cinematic guidebook. Section: ${s.brief}\n\nData: aggregate stats:\n${JSON.stringify(stats)}\n\nAll shot records (JSON):\n${JSON.stringify(recs)}\n\nAlso read ${LOOK}/COZY_AND_SCALE.md sections 4-5 (our current scale grammar K1-K10, some marked UNCERTAIN until measured) and say where the measurements confirm or change it. Write your section as markdown to ${LOOK}/research/cine_${s.key}.md (max ~120 lines): rules with numbers, evidence, reference shots (#, timestamp, description), 2D recipes for 9:16. Return at most 8 lines: the strongest rules.`,
  { label: `write:${s.key}`, phase: 'Write' })))

phase('Edit')
const ed = await agent(
  `${CTX}\n\nYou are the editor of our studio's cinematic guidebook. Read the three sections ${SECTIONS.map(s => `${LOOK}/research/cine_${s.key}.md`).join(', ')}, ${LOOK}/COZY_AND_SCALE.md, ${LOOK}/PALETTE.md, and ${ROOT}/src/v3/SketchReel.tsx (our animatic tool; its camera = {x,y,z} from/to with easing).\n\nWrite ${LOOK}/CINEMATIC_GUIDE.md, the guidebook every video uses from the storyboard (G3) to the blocking cut (G5). Max ~220 lines, practical, numbers over adjectives:\n1. One screen first: the 10 rules that matter most (each with a number).\n2. Shot vocabulary: a table of 8-12 named shot types we use (name, size, angle, lens feel, composition, typical duration, camera preset, purpose, 2 reference shots by # and timestamp in the source).\n3. Camera presets: named moves with numbers (zoom %, travel, duration, easing, parallax ratios), ready to put in SketchReel JSON and our kit.\n4. Composition and depth rules for 9:16 (how Arcane's 2.39:1 framings translate to vertical: what to keep, what to crop, where the caption band sits at the top).\n5. Light and colour rules mapped to our palettes.\n6. Transitions and sequencing: a small library of cut types and 3-4 mini-sequence templates (e.g. establish -> scale -> intimate).\n7. How this updates COZY_AND_SCALE.md's scale grammar (which K values are now measured).\n8. Source and method (the compilation, its id, what was measured, caveats: compilation editing, captions, season 1 only), and the rule that reference footage never goes into the repo.\nDon't commit. Return at most 10 lines: the 10 rules.`,
  { label: 'editor', phase: 'Edit' })

phase('Critic')
const cr = await agent(
  `${CTX}\n\nYou are a sceptical director of photography and animation layout artist. Read ${LOOK}/CINEMATIC_GUIDE.md and spot-check it against the shot records below and a few sheets in ${SP}/sheets/ (look at 2-3). Fix in place: claims the data doesn't support, numbers that don't match the stats, rules too vague to use, recipes our 2D 9:16 kit can't do, anything that conflicts with the owner's rules (pop captions in a band at the top, no paper edge at the top, scale only occasionally, one hot pop colour). Keep it under ~220 lines. Return at most 6 lines: what you changed.\n\nStats:\n${JSON.stringify(stats)}\n\nShot records:\n${JSON.stringify(recs)}`,
  { label: 'critic', phase: 'Critic' })

return { stats, records: recs, editor: ed, critic: cr }

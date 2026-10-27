export const meta = {
  name: 'arcane-env-guide',
  description: 'Rework: score 53 Arcane environment/architecture wides against our v1 style (3 reviewers), keep only unanimous high-confidence ones, write a short environment guide + sketches',
  phases: [
    { title: 'Review', detail: '3 lenses score 53 candidates' },
    { title: 'Guide', detail: 'short guide of high-confidence environment shot types' },
    { title: 'Sketch', detail: 'one sketch per type' },
  ],
}

const ROOT = '/home/user/Test-/video'
const LOOK = ROOT + '/docs/look'
const A = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/arcane_rec'
const CTX = `Context: we make 30-45 s vertical (1080x1920) explainers drawn in hand-drawn ink with flat colour. Our first video is good and is the baseline: see ${A}/v1_baseline.jpg (12 frames of it: eye-level streets and building facades, flat mint sky with a big orange sun disc, warm sand/teal palette, people seen from behind at the bottom, captions at the top) and the full film ${ROOT}/deliverables/v1/php2shell_final.mp4 (extract frames with ffmpeg if needed). The owner's direction (verbatim in substance): "For the references from Arcane we are not interested in close-ups, humans or faces: focus exclusively on the environment, buildings and bigger shots. Don't do a complicated one: start very simple, with very high-confidence references that fit very naturally into our style. Our videos are very good; we need to build on that incrementally: polish, better angles, better scene composition, lighting, cinematic shots and camera movements, but targeted, with high confidence." Source: 53 environment shots (wides and extreme wides, no or tiny figures) from "Amazing Shots of ARCANE SEASON 1" (YouTube HzJ7Nvwz1e8), contact sheets ${A}/env_sheets/sheet_01.jpg to sheet_05.jpg (each row = one shot: 3 frames at 10/50/90 %, labelled #shot, start s, duration, measured camera move). Measured data and earlier notes per shot: ${A}/cam/env_records.json. Ignore burned-in YouTube captions ("[Music]").`

const SCORES = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    shot: { type: 'number' },
    style_fit: { type: 'number', description: '1-10: translates naturally into OUR flat ink style (clear shapes, a readable value structure, not dependent on painterly texture, VFX, darkness or 3D detail)' },
    vertical_fit: { type: 'number', description: '1-10: works when re-framed in 9:16 with captions at the top' },
    clarity: { type: 'number', description: '1-10: one clear idea (angle, composition, light or move) we can name and copy' },
    move_clean: { type: 'number', description: '1-10: the camera move is clean and simple to reproduce (10 if a clean hold is the point)' },
    confidence: { type: 'number', description: '1-10: how sure you are this would make OUR videos better if added' },
    takeaway: { type: 'string', description: 'the one thing we take from it, concretely (angle / composition / light / move, with numbers)' },
    upgrades: { type: 'string', description: 'which kind of v1 shot it upgrades and how' },
  }, required: ['shot', 'style_fit', 'vertical_fit', 'clarity', 'move_clean', 'confidence', 'takeaway', 'upgrades'] } } },
  required: ['scores'],
}

const LENSES = [
  { key: 'art', lens: `our art director, protective of the v1 look: you only want references that slot into our flat, warm, sunny ink style without changing it` },
  { key: 'layout', lens: `a layout artist and cinematographer for vertical video: you judge angle, composition, depth and camera move, and how each re-frames into 9:16` },
  { key: 'sceptic', lens: `a sceptic: you reject anything ambiguous, dependent on Arcane's darkness or painterly detail, or hard to reproduce well in 2D; high scores only for sure bets` },
]

phase('Review')
const reviews = await parallel(LENSES.map(l => () => agent(
  `${CTX}\n\nYou are ${l.lens}. Look at the v1 baseline first, then all 5 contact sheets (Read shows images; extract a larger frame with ffmpeg -loglevel error -ss <s> -i ${A}/arcane_s1.mp4 -frames:v 1 -vf scale=900:-1 ${A}/env_${l.key}_<shot>.jpg when needed, at most 8). Score EVERY shot (53) honestly; use the full range. Don't write other files.`,
  { effort: 'max', label: `review:${l.key}`, phase: 'Review', schema: SCORES })))

const by = {}
reviews.filter(Boolean).forEach((r, i) => r.scores.forEach(s => { (by[s.shot] = by[s.shot] || []).push({ lens: LENSES[i].key, ...s }) }))
const agg = Object.entries(by).map(([shot, ss]) => {
  const mins = ss.map(s => Math.min(s.style_fit, s.vertical_fit, s.clarity, s.confidence))
  const avg = ss.reduce((n, s) => n + s.style_fit + s.vertical_fit + s.clarity + s.move_clean + 2 * s.confidence, 0) / (6 * ss.length)
  return { shot: Number(shot), n: ss.length, min: Math.min(...mins), avg: Math.round(avg * 10) / 10, notes: ss.map(s => ({ lens: s.lens, takeaway: s.takeaway, upgrades: s.upgrades })) }
}).sort((a, b) => b.avg - a.avg)
const strong = agg.filter(a => a.n >= 3 && a.min >= 7)
log(`unanimous high-confidence: ${strong.length} of ${agg.length}: ${strong.map(s => `#${s.shot} ${s.avg}`).join(', ')}`)

phase('Guide')
const guide = await agent(
  `${CTX}\n\nYou are the look director. Three reviewers (art director, layout, sceptic) scored every environment shot. These passed all three with every core score >= 7 (sorted by average):\n${JSON.stringify(strong)}\n\nAll scores for reference:\n${JSON.stringify(agg.slice(0, 25))}\n\nWrite ${LOOK}/CINEMATIC_GUIDE.md, SHORT and simple (max ~90 lines), for environment and architecture shots only:\n1. Why (3 lines): the owner's direction; our v1 look is the baseline; this adds targeted upgrades.\n2. "Shot types" (4-6, no more): each built only from the high-confidence shots above. For each: a name; the one idea (angle / composition / light / move); numbers for our 9:16 frame (horizon height, camera height or angle, how much is sky/flat field for captions, depth planes, camera move: % zoom or px of rise, duration, easing); which v1 shot it upgrades and how; 1-2 Arcane references as "#shot @ seconds" with a one-line description; a v1 frame it builds on as "v1 @ seconds" (pick from the 55 s v1 film).\n3. "Rules" (max 5) that apply to all of them.\n4. "Not for us" (3-5 lines): what we deliberately don't take from Arcane (darkness, faces, painterly texture...).\n5. Source and method (2-3 lines; full research archived in ${LOOK}/research/CINEMATIC_GUIDE_full_v1.md).\nDon't commit. Return the list of shot types (name, refs, v1 frame) in max 8 lines.`,
  { effort: 'max', label: 'look-director', phase: 'Guide' })

phase('Sketch')
const sk = await agent(
  `${CTX}\n\nYou are our storyboard artist. Read ${LOOK}/CINEMATIC_GUIDE.md (just written). For EACH shot type in it, look at its Arcane reference frames (ffmpeg as above) and its v1 frame (ffmpeg -loglevel error -ss <s> -i ${ROOT}/deliverables/v1/php2shell_final.mp4 -frames:v 1 -vf scale=540:-1 ${A}/v1_<n>.jpg), then draw OUR 9:16 version as a simple pencil sketch for the guide: environment and buildings only (a tiny figure only if the type needs one for scale), in the spirit of our v1 frames (flat sky over the captions, the sun disc where it helps), showing the type's angle, composition, depth planes, light and the camera move as a labelled arrow at the side.\n\nWrite ${ROOT}/public/look/cine_sketches.json = {"sketches": [{"name": "<type name>", "rule": "<one short sentence>", "refs": "<Arcane refs as #shot @s, ...>", "ours": "<v1 @s>", "shot": <Shot>}, ...]}. <Shot> uses SketchReel's schema (read ${ROOT}/src/v3/SketchReel.tsx): {"id": "E1", "s": 0, "e": 1, "note": "", "transition": {"type": "cut"}, "camera": {"from": {"x": 540, "y": 960, "z": 1}, "to": {"x": 540, "y": 960, "z": 1}}, "els": [...]}, drawn at the camera's end state in a 1080x1920 world; ids E1, E2, ... in order. Elements: rect, ellipse, line (pts, closed), arrow, hatch, figure, text; fills warm / cold / dark / paper / pop. Keep the top 230 px empty (title), y 317-556 a flat field (captions), key shapes above y 1650 (rule text). 10-25 elements each.\nPreview: cd ${ROOT} && npx remotion still src/entry-v3.tsx ShotSketch ${A}/esk_<k>.png --frame=<k> --scale=0.25, look, fix (at most 8 renders). Don't commit. Return one line per sketch.`,
  { effort: 'max', label: 'sketch-artist', phase: 'Sketch' })

return { strong, top: agg.slice(0, 15).map(a => ({ shot: a.shot, avg: a.avg, min: a.min })), guide, sketches: sk }

export const meta = {
  name: 'cine-guide-sketches',
  description: 'Draw a 9:16 pencil sketch (ShotSketch JSON) for each of the 12 shot types V1-V12 in CINEMATIC_GUIDE.md, translating the Arcane reference frames into our framing; 3 artists x 4 types, each checks a few stills',
  phases: [{ title: 'Sketch', detail: '3 artists, 4 shot types each' }],
}

const ROOT = '/home/user/Test-/video'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const SRC = SP + '/arcane_rec/arcane_s1.mp4'
const GROUPS = [['V1', 'V2', 'V3', 'V4'], ['V5', 'V6', 'V7', 'V8'], ['V9', 'V10', 'V11', 'V12']]

const SCHEMA = `Write ${ROOT}/public/look/sketch_part_<N>.json = {"sketches": [ {"name": "V1 Establisher", "rule": "<the shot's rule in one short sentence, max ~18 words>", "refs": "<the 2 reference shots, e.g. #24 @30.8, #29 @45.5>", "shot": <Shot> }, ... ]} in the order of your types.
<Shot> uses the SketchReel schema (read ${ROOT}/src/v3/SketchReel.tsx): {"id": "V1", "s": 0, "e": 1, "note": "", "transition": {"type": "cut"}, "camera": {"from": {"x": 540, "y": 960, "z": 1}, "to": {"x": 540, "y": 960, "z": 1}}, "els": [...]}. It is drawn at the camera's END state, in world px of a 1080x1920 frame (camera centre x 540, y 960, z 1 = the frame exactly). Elements: rect {x,y,w,h,fill?,label?}, ellipse {cx,cy,rx,ry,fill?,label?}, line {pts:[[x,y]...],closed?,fill?}, arrow {x1,y1,x2,y2}, hatch {x,y,w,h}, figure {x,y,h} (y = feet), text {x,y,text,size?}. Fills: warm (lamp light), cold (outside / sky), dark (silhouette, shadow mass), paper, pop (the ONE hot accent). Draw back to front.
Layout: the top 230 px hold the title (keep it empty); the caption band y 317-556 must be a flat field (sky, wall) with no detail; the bottom 1650-1920 holds the rule text (keep key shapes above it). Show the CAMERA PRESET as an arrow with a small text label (e.g. "pull-out 2 %", "rise 0.22 H + pull 1.4x") placed at the side (x 880-1040), and label anything ambiguous with small grey labels ("observer", "light", "colossus"). Respect the guide's numbers: figure size in fractions of frame height, horizon height, VP, number of depth planes, where the one light sits.`

phase('Sketch')
const res = await parallel(GROUPS.map((g, i) => () => agent(
  `You are a storyboard artist for our studio (vertical 1080x1920 explainers, hand-drawn ink with flat colour). Read ${ROOT}/docs/look/CINEMATIC_GUIDE.md (sections 1-4: the rules, the shot vocabulary table, the camera presets, composition in 9:16). Your shot types: ${g.join(', ')}.\n\nFor each type, first look at its 2 reference shots from the table: extract one frame each from the reference compilation with: ffmpeg -loglevel error -ss <seconds + 0.5> -i ${SRC} -frames:v 1 -vf scale=900:-1 ${SP}/ref_<type>_<n>.jpg and look at it (Read shows images). Then draw OUR 9:16 version of that shot type as a simple, bold pencil sketch that shows what the guide says matters (framing, angle, figure size, depth planes, light placement, the camera preset). It must read as the shot type at a glance; it is a diagram-like reference, not final art (8-25 elements).\n\n${SCHEMA.replace('<N>', String(i + 1))}\n\nCheck your work: the composition "ShotSketch" in ${ROOT}/src/entry-v3.tsx reads public/look/cine_sketches.json; to preview yours without touching that file, temporarily copy your part to ${ROOT}/public/look/cine_sketches.json ONLY IF that file does not exist, render with: cd ${ROOT} && npx remotion still src/entry-v3.tsx ShotSketch ${SP}/sk_${i + 1}_<k>.png --frame=<k> --scale=0.33 (k = 0-based index), look, fix, and delete the temporary cine_sketches.json when done (another artist may be using it: if it exists, wait 60 s and retry, at most 5 times; or skip the preview). At most 6 renders. Don't commit. Return at most 6 lines: one line per sketch saying what it shows.`,
  { label: `sketch:${g[0]}-${g[3]}`, phase: 'Sketch' })))
return res

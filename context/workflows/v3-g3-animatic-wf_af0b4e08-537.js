export const meta = {
  name: 'v3-g3-animatic',
  description: 'v3 G3: 3 whole-film visual concepts (shot lists), 2 judges, storyboard artist writes public/v3/animatic.json for SketchReel and checks a few stills',
  phases: [
    { title: 'Concepts', detail: '3 visual concepts, one shot list each' },
    { title: 'Judge', detail: 'story-in-pictures + cinematic/cozy-scale' },
    { title: 'Storyboard', detail: 'animatic.json for SketchReel' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const LINES = `Locked script with voice timings (seconds; the voice starts at 0.35 s after the cart-pop sound at 0.05 s; total 43.48 s):
L1 0.35-3.6 "Buying a laptop soon? AI's making it pricier."
L2 4.03-6.0 "Well, AI DATA CENTERS are."
L3 6.27-12.0 "Which is backwards. Laptops get better for the same money… usually right after you buy one."
L4 12.11-16.9 "But this past year, in the U.S., computers went UP almost ten percent."
L5 17.15-23.2 "Mostly because your laptop runs on memory chips, and so do AI data centers… by the mountain."
L6 23.39-25.7 "They pay more, so they get first dibs."
L7 25.95-32.0 "Which means what's left costs about FIVE times last year's price, and laptop makers pass that on."
L8 32.11-37.4 "Normally you'd wait for the better one… but chip makers say next year's even tighter."
L9 37.63-42.6 "So that's how an AI data center ends up on your NEXT laptop's price tag."
Word timings (word@start): see ${ROOT}/public/v3/voice_words.json.`

const CTX = `Context: video 3 of "What's All the Fuss About?" (30-45 s vertical 1080x1920 explainers, hand-drawn ink with flat colour). Topic and script are LOCKED; the story is "the laptop deal that flipped": you expect better laptops for the same money, but this year computers went up, because AI data centers run on mountains of the same memory chips, pay more and get first dibs; waiting won't help either. Core line / frame-0 text: "AI IS MAKING YOUR NEXT LAPTOP PRICIER". Read ${V3}/script/script_g1.md (the script table has a picture idea per line; the story in 3 sentences) and ${ROOT}/docs/look/COZY_AND_SCALE.md (sections 1-6: enclosure framing, cozy rules, the Arcane-inspired scale grammar K1-K10, vertical rules; section 6's v3 plan was written for an older script, so adapt it to the new lines). Owner rules (from the playbook): frame 0 states the payoff in words and starts mid-action; the first 2-5 s matter most; a positive phone sound in the first second (our cart pop at 0.05 s as a thumb taps "Add to cart"); scale moments occasionally (one big one per video), coziness through enclosure (a lamp-lit nook, walls holding the subject, a window as the opening); the story must read in pictures, each shot following from the last; cuts land on words; no villains (memory makers selling to the best payer is normal business); keep it calm and clear, not doom. Captions sit in a band at the top of the frame (y 260-600): keep that band empty or a flat fill, no key action there. Platform UI covers the bottom ~300 px and the right ~120 px: keep key action in x 60-940, y 620-1560.

${LINES}`

const CONCEPTS = [
  { key: 'room', lens: `ONE ROOM: everything happens from the cozy desk nook at night; the wider world (the data center, the chip factory, the auction) is seen through and beyond the window, with one big push through the window as the scale moment and a return home at the end` },
  { key: 'chip', lens: `FOLLOW THE CHIP: a single memory chip is the visual throughline (inside the laptop, on the factory line, swept toward the data center's mountain, the leftovers on a price tag), so the viewer can trace the cause with their eyes` },
  { key: 'deal', lens: `THE DEAL FLIPS: a strong visual metaphor for "the deal" (e.g. a price line on the frosty window or a seesaw/scale between laptop and data center) that flips at line 4 and keeps building, staged in cozy interiors with one big scale reveal` },
]

const SHOTS = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    idea: { type: 'string', description: '2 sentences: the visual throughline' },
    shots: { type: 'array', minItems: 8, maxItems: 16, items: { type: 'object', properties: {
      id: { type: 'string' }, start: { type: 'number' }, end: { type: 'number' }, cut_on_word: { type: 'string' },
      what_we_see: { type: 'string' }, camera: { type: 'string' }, transition_in: { type: 'string' }, tag: { type: 'string', description: 'cozy / scale / explain / hook' },
      why: { type: 'string', description: 'how it follows from the previous shot and serves the line' },
    }, required: ['id', 'start', 'end', 'cut_on_word', 'what_we_see', 'camera', 'transition_in', 'tag', 'why'] } },
  },
  required: ['title', 'idea', 'shots'],
}

const SCORE = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string' }, clarity: { type: 'number', description: 'the story reads in pictures with the sound off' },
    hook: { type: 'number' }, flow: { type: 'number', description: 'each shot follows from the last' }, cinematic: { type: 'number', description: 'cozy + scale used well, per COZY_AND_SCALE' },
    buildable: { type: 'number', description: 'drawable in our 2D kit in reasonable time' }, keep: { type: 'string' }, fix: { type: 'string' },
  }, required: ['key', 'clarity', 'hook', 'flow', 'cinematic', 'buildable', 'keep', 'fix'] } } },
  required: ['scores'],
}

phase('Concepts')
const concepts = await parallel(CONCEPTS.map(c => () => agent(
  `${CTX}\n\nYou are a storyboard director. Your concept: ${c.lens}.\n\nRead the two docs first. Write a shot list for the whole film (8-16 shots), each with start/end times that land cuts on words, what we see (simple, drawable, readable at phone size), the camera, the transition in, a tag and why it follows from the previous shot. Don't write files.`,
  { label: `concept:${c.key}`, phase: 'Concepts', schema: SHOTS })))
const cs = CONCEPTS.map((c, i) => concepts[i] ? { key: c.key, ...concepts[i] } : null).filter(Boolean)

phase('Judge')
const JUDGES = [
  { key: 'story', lens: `a storyboard supervisor: does the story read in pictures with the sound off, does each shot follow from the last, is the hook instant` },
  { key: 'cine', lens: `a cinematographer who knows ${ROOT}/docs/look/COZY_AND_SCALE.md: is cozy enclosure and the one scale moment used well, is it calm, clear and buildable in a 2D kit` },
]
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}. Score each concept 1-10 on clarity, hook, flow, cinematic, buildable; say what to keep and what to fix.\n\nConcepts (JSON):\n${JSON.stringify(cs)}`,
  { label: `judge:${j.key}`, phase: 'Judge', schema: SCORE })))
const tot = {}
cs.forEach(c => { tot[c.key] = 0 })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => { if (s.key in tot) tot[s.key] += 3 * s.clarity + 2 * s.hook + 2 * s.flow + 2 * s.cinematic + s.buildable }))
const ranked = cs.slice().sort((a, b) => tot[b.key] - tot[a.key])
log(`concepts: ${ranked.map(c => `${c.key} ${tot[c.key]}`).join(', ')}`)

phase('Storyboard')
const SCHEMA = `public/v3/animatic.json schema (TypeScript types from ${ROOT}/src/v3/SketchReel.tsx; read that file):
{ "label": "v3 G3 animatic", "audio": "v3/voice.wav", "durationSec": 43.48, "frame0": "AI IS MAKING YOUR NEXT LAPTOP PRICIER", "frame0Until": 3.7,
  "words": <copy the "words" array from public/v3/voice_words.json unchanged>,
  "sfx": [{"src": "v3/phone_cart_add.wav", "t": 0.05, "gain": 0.5}, optionally {"src": "v3/phone_notify_ding.wav", "t": ..., "gain": 0.4} at one re-hook],
  "shots": [ { "id": "S1", "s": 0, "e": 4.0, "note": "<what happens, 1 short line, shown under the picture>",
     "transition": {"type": "cut" | "dissolve" | "push-through" | "match-cut" | "wipe", "label": "<short>"},
     "camera": {"from": {"x": 540, "y": 1100, "z": 1}, "to": {"x": 540, "y": 1050, "z": 1.08}, "ease": "inout" | "out" | "in" | "linear", "start"?: s, "end"?: s},
     "els": [ elements in WORLD px, the frame shows 1080x1920 around the camera centre divided by z ],
     "moves"?: [{"el": <index in els>, "dx": px, "dy": px, "at": <s after shot start>, "dur": s}] } ] }
Elements: {"t":"rect",x,y,w,h,fill?,label?,in?} {"t":"ellipse",cx,cy,rx,ry,fill?,label?,in?} {"t":"line",pts:[[x,y],...],closed?,fill?,in?} {"t":"arrow",x1,y1,x2,y2,in?} {"t":"hatch",x,y,w,h,in?} {"t":"figure",x,y,h,in?} (y = feet) {"t":"text",x,y,text,size?,in?}. fill is one of "warm" (lamp light), "cold" (outside, data center), "dark", "paper", "pop" (the ONE hot accent: the price tag / Add to cart). "in" = seconds after the shot start when the element pops in. Labels are small grey words inside shapes: use them so a viewer can tell what a box is (e.g. "AI data center", "memory chip", "price tag").
Shots must tile the timeline with no gaps: each shot's s = the previous shot's e; first s = 0, last e = 43.48. Draw back to front (backgrounds first).`

const sb = await agent(
  `${CTX}\n\nYou are the storyboard artist. Build the winning concept as a sketch animatic, grafting the judges' "keep" ideas and applying their fixes.\n\nWinning concept:\n${JSON.stringify(ranked[0])}\n\nOther concepts:\n${JSON.stringify(ranked.slice(1))}\n\nJudges:\n${JSON.stringify(judged.filter(Boolean))}\n\n${SCHEMA}\n\nWrite ${ROOT}/public/v3/animatic.json. Keep drawings simple and bold (a sketch animatic, not final art): big readable shapes, 5-20 elements per shot, labels on anything ambiguous, value fills for cozy (warm) vs outside (cold). Then check it: from ${ROOT}, run "npx tsc --noEmit -p ." is not needed; instead render up to 6 stills at the key moments with "npx remotion still src/entry-v3.tsx Animatic /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/sb_<n>.png --frame=<f> --scale=0.33" (30 fps), look at them, and fix anything unreadable, overlapping the caption band, or off-frame. Don't render a video. Don't commit. Also write ${V3}/storyboard_g3.md: the shot list as a table (shot, time, what we see, camera, transition, cozy/scale) plus the concept in 2 sentences. Return at most 10 lines: the concept and the shot list in one line per shot.`,
  { label: 'storyboard-artist', phase: 'Storyboard' })

return { ranking: ranked.map(c => ({ key: c.key, score: tot[c.key], idea: c.idea })), storyboard: sb }

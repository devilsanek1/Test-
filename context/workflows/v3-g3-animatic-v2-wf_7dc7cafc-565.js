export const meta = {
  name: 'v3-g3-animatic-v2',
  description: 'v3 G3 rebuilt with the Arcane-measured CINEMATIC_GUIDE: 2 storyboard directors (refine vs fresh), 2 judges, storyboard artist writes animatic.json with true parallax, checks stills',
  phases: [
    { title: 'Plan', detail: '2 shot lists coded with V/P/T from the guide' },
    { title: 'Judge', detail: 'guide compliance + story in pictures' },
    { title: 'Storyboard', detail: 'animatic.json + storyboard_g3.md' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const GUIDE = ROOT + '/docs/look/CINEMATIC_GUIDE.md'
const LINES = `Locked script on the owner's take 4 (seconds; the voice starts at 0.35 s, after the cart-pop sound at 0.05 s; total 41.38 s):
L1 0.35-3.5 "Buying a laptop soon? AI's making it pricier."
L2 3.87-5.9 "Well, AI DATA CENTERS are."
L3 6.03-11.5 "Which is backwards. Laptops get better for the same money… usually right after you buy one."
L4 11.71-15.9 "But this past year, in the U.S., computers went UP almost ten percent."
L5 16.83-22.5 "Mostly because your laptop runs on memory chips, and so do AI data centers… by the mountain."
L6 22.91-25.1 "They pay more, so they get first dibs."
L7 25.47-31.4 "Which means what's left costs about FIVE times last year's price, and laptop makers pass that on."
L8 31.55-36.3 "Normally you'd wait for the better one… but chip makers say next year's even tighter."
L9 36.59-40.9 "So that's how an AI data center ends up on your NEXT laptop's price tag."
Word timings: ${ROOT}/public/v3/voice_words.json.`

const CTX = `Context: video 3 of "What's All the Fuss About?" (vertical 1080x1920, hand-drawn ink with flat colour). The story ("the laptop deal that flipped") and voice are LOCKED: ${V3}/script/script_g1.md. Frame-0 text: "AI IS MAKING YOUR NEXT LAPTOP PRICIER". The owner asked to rebuild the sketch animatic using our new cinematic guidebook ${GUIDE} (165 measured Arcane shots: the 10 rules, the shot vocabulary V1-V12, the camera presets P1-P10, 9:16 composition bands, light, transitions T1-T10 and the sequence templates). Read the WHOLE guide first; it is the rulebook for this storyboard. Also: ${ROOT}/docs/look/COZY_AND_SCALE.md (cozy enclosure, the nook) and the owner rules: frame 0 states the payoff in words and starts mid-action; the first 2-5 s matter most; a positive phone sound in the first second (our cart pop at 0.05 s as a thumb taps "Add to cart"); one big move per video; scale 1-2 times by a cut; cozy home base; no villains; calm and clear. Captions sit in the band y 317-556 (keep it a flat field); platform UI covers the bottom ~300 px and the right ~120 px. The previous storyboard (concept "one room": everything from a lamp-lit desk nook whose frosty window shows the world; a price line drawn on the fogged glass; one push through the window to a scale reveal of the data center; home to the price tag whose back shows a data center) is at ${V3}/archive/g3_v1/storyboard_g3_v1.md.

${LINES}`

const PLANS = [
  { key: 'refine', lens: `REFINE: keep the "one room" concept (it won the last round) and rebuild every shot to the guide: pick a V type, a P preset and a T transition for each, fix shot lengths to rule 1, apply the mix rule, the one big move (rule 5), scale as a cut (rule 6), light rules 8-9 and one change per cut (rule 10)` },
  { key: 'fresh', lens: `FRESH: design the strongest storyboard you can from the guide alone (any concept that serves the locked story), using the sequence templates in section 6 as the backbone` },
]
const PLAN = {
  type: 'object',
  properties: {
    concept: { type: 'string' },
    shots: { type: 'array', minItems: 10, maxItems: 18, items: { type: 'object', properties: {
      id: { type: 'string' }, start: { type: 'number' }, end: { type: 'number' }, cut_on_word: { type: 'string' },
      v: { type: 'string', description: 'shot type V1-V12' }, p: { type: 'string', description: 'camera preset P1-P10 with numbers' }, t: { type: 'string', description: 'transition in, T1-T10 or cut' },
      what_we_see: { type: 'string' }, light: { type: 'string' }, why: { type: 'string' },
    }, required: ['id', 'start', 'end', 'cut_on_word', 'v', 'p', 't', 'what_we_see', 'light', 'why'] } },
    rule_check: { type: 'string', description: 'how the list meets rules 1-10 and the mix rule, in 5-8 lines' },
  },
  required: ['concept', 'shots', 'rule_check'],
}
const SCORE = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string' }, guide: { type: 'number' }, story: { type: 'number' }, hook: { type: 'number' }, cinematic: { type: 'number' }, buildable: { type: 'number' },
    keep: { type: 'string' }, fix: { type: 'string' },
  }, required: ['key', 'guide', 'story', 'hook', 'cinematic', 'buildable', 'keep', 'fix'] } } },
  required: ['scores'],
}

phase('Plan')
const plans = await parallel(PLANS.map(p => () => agent(
  `${CTX}\n\nYou are a storyboard director. Approach: ${p.lens}.\n\nWrite the shot list (10-18 shots, cuts on words, tiling 0 to 41.38 s). Don't write files.`,
  { effort: 'max', label: `plan:${p.key}`, phase: 'Plan', schema: PLAN })))
const ps = PLANS.map((p, i) => plans[i] ? { key: p.key, ...plans[i] } : null).filter(Boolean)

phase('Judge')
const JUDGES = [
  { key: 'dop', lens: `a director of photography who wrote the guide: score guide compliance (rules 1-10, the mix, presets used as specified), cinematic quality, buildability` },
  { key: 'story', lens: `a storyboard supervisor: does the story read in pictures with the sound off, does each shot follow from the last, is the hook instant, is the payoff clear` },
]
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}. Score each plan 1-10 on guide, story, hook, cinematic, buildable; say what to keep and fix.\n\nPlans (JSON):\n${JSON.stringify(ps)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Judge', schema: SCORE })))
const tot = {}
ps.forEach(p => { tot[p.key] = 0 })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => { if (s.key in tot) tot[s.key] += 2 * s.guide + 3 * s.story + 2 * s.hook + 2 * s.cinematic + s.buildable }))
const ranked = ps.slice().sort((a, b) => tot[b.key] - tot[a.key])
log(`plans: ${ranked.map(p => `${p.key} ${tot[p.key]}`).join(', ')}`)

phase('Storyboard')
const sb = await agent(
  `${CTX}\n\nYou are the storyboard artist. Build the winning plan, grafting the judges' "keep" ideas from the other and applying their fixes.\n\nWinner:\n${JSON.stringify(ranked[0])}\n\nOther:\n${JSON.stringify(ranked.slice(1))}\n\nJudges:\n${JSON.stringify(judged.filter(Boolean))}\n\nWrite ${ROOT}/public/v3/animatic.json for SketchReel (read ${ROOT}/src/v3/SketchReel.tsx for the exact types). It now supports: per-element "f" depth factor for TRUE parallax (1 = with the camera, 0.15 = far colossus, 1.4 = foreground ledge; the authored end frame is exact for every f), camera eases "out" | "in" | "inout" | "linear" | "unveil" | "inQuad", camera roll "r" in degrees, transitions "cut" | "dissolve" | "push-through" | "match-cut" | "wipe" | "dip" | "flash" with optional "dur", "moves" for in-shot motion, "in" for elements popping in. Use the guide's "In SketchReel" camera mapping (section 3) for every preset. Top-level fields: {"label": "v3 G3 animatic v2", "audio": "v3/voice.wav", "durationSec": 41.38, "frame0": "AI IS MAKING YOUR NEXT LAPTOP PRICIER", "frame0Until": 3.6, "words": <copy "words" from public/v3/voice_words.json unchanged>, "sfx": [{"src": "v3/phone_cart_add.wav", "t": 0.05, "gain": 0.5}, plus at most 2 more of v3/phone_notify_ding.wav / v3/phone_like_pop.wav where the plan calls for them], "shots": [...]}. Shots tile 0 to 41.38 with no gaps. In each shot's "note", start with its codes, e.g. "V2 · P2 · T1 | ...". Keep drawings simple and bold, 8-25 elements, labels on anything ambiguous; fills: warm, cold, dark, paper, pop (the ONE hot accent). Respect the bands: caption band y 317-556 flat, key action in x 60-940, y 620-1560.\n\nCheck it: render up to 8 stills at key moments: cd ${ROOT} && npx remotion still src/entry-v3.tsx Animatic /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/sb2_<n>.png --frame=<f> --scale=0.25 (30 fps), look, fix. Don't render a video. Don't commit. Also write ${V3}/storyboard_g3.md: the concept in 2 sentences and the shot list as a table (shot, time, V, P, T, what we see, light, cozy/scale). Return at most 12 lines: the concept and one line per shot.`,
  { effort: 'max', label: 'storyboard-artist', phase: 'Storyboard' })

return { ranking: ranked.map(p => ({ key: p.key, score: tot[p.key], concept: p.concept })), storyboard: sb }

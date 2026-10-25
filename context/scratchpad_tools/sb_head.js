export const meta = {
  name: 'storyboard-panel',
  description: 'Three independent storyboards for the php2shell video, judged on three lenses, synthesized and critiqued into one final storyboard',
  phases: [
    { title: 'Write', detail: '3 storyboard writers with different angles' },
    { title: 'Judge', detail: '3 judges score all drafts on distinct lenses' },
    { title: 'Synthesize', detail: 'merge winner + best ideas into storyboard.md/json' },
    { title: 'Critique', detail: 'completeness/sync/feasibility critic, then fix' },
  ],
}

const ROOT = '/home/user/Test-/video'
const COMMON = `
You are part of a team producing a 70.7 s vertical (1080x1920) motion-design explainer for TikTok/Reels.
FIRST read ${ROOT}/docs/BRIEF.md fully (goal, transcript, what the reference does, format decisions, tech constraints).
Look at the reference: ${ROOT}/assets/ref/sheet_2fps_a.png (whole video at 2 fps), plus caproll.png, flip.png, ending.png, trans1.png, f_5.5.png, f_9.0.png in the same folder (use the Read tool on the images).
Word timestamps: ${ROOT}/assets/vo_words_raw.json (word starts accurate to ~40 ms; glued tokens: "about7"="about 7", "of10"="of 10", "for14"="for 14", "in45"="in 45", "about22"="about 22", "aversion"="a version" — split their time sensibly).
Card-local coordinate system for illustration: card 960x1400; illustration panel block at x 70..890, y 95..1095 (820x1000 portrait); caption zone y 1120..1360; orange disc centered (480,100) r 78 (it can move/morph).
Hard rules:
- Mascot: an ORIGINAL small elephant character (a nod to PHP's "elePHPant" mascot, but our own design, not the official logo), appearing in every scene the way the reference's orange cat does: watching, reacting, carrying the viewer's eye, and sometimes doing small physical gags. It must never steal focus from the explanation.
- The orange disc appears in every scene and is our visual anchor; it may morph meaningfully (e.g. power button, clock face, setting sun "by evening"), but keep it recognizably the same orange disc.
- No real logos (PHP, WordPress, Cloudflare). Names live in captions; visuals stay generic (e.g. a shield-dome or guard for Cloudflare, an elephant for PHP).
- Don't show anything the VO contradicts or doesn't claim (e.g. "Nobody hacked them" means no hackers broke into the government sites).
- Everything will be HAND-CODED SVG in the reference's ink style. Favor what code draws beautifully: architecture, facades, windows, doors, signs, simple back-view people and crowds, repetition and patterns, icons, objects, clocks and counters. Avoid faces in close-up, hands doing fine actions, photoreal or complex organic shapes, liquids or smoke sims.
- Use the reference's motion grammar: progressive build synced to words, linework then fills, pop-ins with overshoot, caption line roll-up, keyword highlight wipes, match-cuts on persistent objects, an occasional 3D card flip, and an un-build at the end that returns to the opening line art so the video loops seamlessly.
- Captions: max 2 lines, each line <= ~24 characters, centered. A new caption replaces the old at phrase boundaries (roll-up); line 2 appears when its first word is spoken. At most one highlighted keyword or number per caption, highlight wipes in at its word start.
- 9 to 14 scenes, each about 3.5 to 8 s. Scene boundaries at natural pauses (sentence ends). Every moment of the VO must be covered; change something meaningful every ~1.5–2.5 s.
`

const SCHEMA_DOC = `
storyboard.json shape (STRICT, valid JSON):
{
  "fps": 30, "duration": 70.687,
  "mascot": { "name": "...", "design": "...", "colorway": "..." },
  "scenes": [
    {
      "id": "S01", "start": 0.0, "end": 3.70,
      "vo": "exact VO text spoken in this scene",
      "title": "short name",
      "transitionIn": { "type": "loop-start|cut|matchcut|flip|unbuild|push|zoom", "dur": 0.5, "persist": ["sun","mascot","<object ids carried over>"], "notes": "..." },
      "setting": "where we are / what world",
      "composition": "layout in card-local coords: what sits where (x,y ranges), horizon, depth layers, palette usage",
      "elements": [ { "id": "govBuilding1", "what": "...", "where": "x,y,w,h approx card-local", "style": "ink+fill colors (theme palette keys)" } ],
      "beats": [ { "t": 0.16, "action": "what animates, which element ids, how (draw-on / pop / slide / fill / morph), duration" } ],
      "sun": "what the orange disc does",
      "mascot": "what the mascot does (pose, timing)",
      "sfx": [ { "t": 0.5, "sound": "pop|pencil|whoosh|click|power-off|tick|alarm|paper|..." , "notes": "" } ],
      "captions": [ { "s": 0.0, "e": 1.9, "lines": [ { "text": "Government websites", "s": 0.16 }, { "text": "in four countries", "s": 1.12 } ], "highlights": [ { "text": "four countries", "s": 1.36 } ] } ]
    }
  ],
  "loop": "how the ending returns to frame 1"
}
All times are ABSOLUTE seconds on the VO timeline. Beat times should hit word starts from the timestamps.
`

const ANGLES = [
  { key: 'editorial', brief: 'EDITORIAL-FAITHFUL: stay closest to the reference. One continuous illustrated world (a street or neighborhood where websites are buildings and shopfronts) with persistent objects and match-cuts. Calm, confident pacing; the beauty of the progressive build carries it.' },
  { key: 'retention', brief: 'RETENTION-MAX: optimize for TikTok/Reels watch-time. A first frame and first 1.5 s that stop the scroll, a pattern interrupt every 2–3 s, open loops and payoffs, mascot gags and hidden details that reward rewatching, a satisfying seamless loop. Never at the cost of clarity or the reference style.' },
  { key: 'metaphor', brief: 'METAPHOR-ARCHITECT: build one coherent visual metaphor system for the abstract ideas (e.g. web = a city, websites = buildings/shops, PHP = what they are built on, the bug = a hidden unlocked back door or crack, the fix = a new lock, the leak = the blueprint posted on a noticeboard, attack attempts = figures trying door handles, Cloudflare = a guard or shield over the city, 22 million copies = endless rows of doors, an unsupported old version = buildings whose builder no longer services them, switching off = shutters down / lights out). Every metaphor must read instantly to a non-technical viewer.' },
]

phase('Write')
const drafts = await parallel(ANGLES.map((a, i) => () => agent(
  `${COMMON}\nYOUR ANGLE: ${a.brief}\n\nWrite a complete, production-ready storyboard for the whole 70.7 s VO.\n${SCHEMA_DOC}\nWrite it to ${ROOT}/docs/storyboard_drafts/${a.key}.md (human-readable, with rationale per scene: why this visual, what makes it rewatchable) AND ${ROOT}/docs/storyboard_drafts/${a.key}.json (schema above; validate it with: python3 -c "import json;json.load(open('<path>'))"). Create the folder if needed. Only write inside docs/storyboard_drafts/.\nYour final message: the two file paths plus a 10-line pitch of your concept (hook, metaphor system, mascot role, loop).`,
  { label: `write:${a.key}`, phase: 'Write' })))

log('Drafts done: ' + drafts.filter(Boolean).length + '/3')

const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      draft: { type: 'string' }, score: { type: 'number' },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
    }, required: ['draft', 'score', 'strengths', 'weaknesses'] } },
    winner: { type: 'string' },
    must_keep_ideas: { type: 'array', items: { type: 'string' }, description: 'specific scene ideas from ANY draft that the final storyboard must include (name the draft + scene)' },
    must_fix: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'winner', 'must_keep_ideas', 'must_fix'],
}

const LENSES = [
  { key: 'virality', brief: 'VIRALITY & RETENTION STRATEGIST for TikTok/Reels: scroll-stopping first frame + first 1.5 s, visual change density, curiosity gaps and payoffs, rewatch bait, shareability, the loop. Score 1-10.' },
  { key: 'artdirector', brief: 'ART DIRECTOR: fidelity to the reference\'s style and motion grammar (look at the reference images), visual variety without breaking the world, composition in a portrait panel, AND feasibility: will this look gorgeous when hand-coded in SVG by an expert in ~1 day per scene? Penalize anything that will look cheap when coded. Score 1-10.' },
  { key: 'clarity', brief: 'CLARITY & ACCURACY EDITOR: will a non-technical viewer understand the story on first watch with sound on AND with sound off (captions)? Do visuals match exactly what the VO claims, with no added or contradicted facts? Do caption chunks read naturally and match word timing? Score 1-10.' },
]

phase('Judge')
const verdicts = await parallel(LENSES.map(l => () => agent(
  `${COMMON}\nYou are a judge. LENS: ${l.brief}\nRead all three drafts in ${ROOT}/docs/storyboard_drafts/ (editorial.md/.json, retention.md/.json, metaphor.md/.json). Judge them strictly through your lens. Be concrete: cite scene ids. Identify the winner and the specific ideas from any draft that must survive, and the must-fix problems.`,
  { label: `judge:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))

const v = verdicts.filter(Boolean)
const summary = v.map((x, i) => `## Judge ${LENSES[i] ? LENSES[i].key : i}\nwinner: ${x.winner}\nscores: ${x.scores.map(s => `${s.draft}=${s.score}`).join(', ')}\nmust_keep: \n- ${x.must_keep_ideas.join('\n- ')}\nmust_fix:\n- ${x.must_fix.join('\n- ')}\ndetails:\n${x.scores.map(s => `* ${s.draft}: + ${s.strengths.join('; ')} | - ${s.weaknesses.join('; ')}`).join('\n')}`).join('\n\n')
log('Judging done')


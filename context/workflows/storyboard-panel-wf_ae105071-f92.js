export const meta = {
  name: 'storyboard-panel',
  description: 'Three independent storyboards for the php2shell video, judged on three lenses, synthesized and critiqued into one final storyboard',
  phases: [
    { title: 'Write', detail: '3 storyboard writers with different angles' },
    { title: 'Judge', detail: '3 judges score all drafts on distinct lenses' },
    { title: 'Synthesize', detail: 'merge winner + best ideas into storyboard.md/json' },
    { title: 'Critique', detail: 'sync, cinematic-scale and retention critics, then fix' },
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

const CINE = `
=== NEW DIRECTION FROM THE USER (overrides the card layout, card-local coordinates and the 3D card flip above) ===
LATEST USER NOTE, applies to everything below: "Don't overdo it. It should be nuanced, and we still target TikTok / Reels." Read the BALANCE NOTE at the top of ${ROOT}/docs/BRIEF.md. The base is the references' bright, warm, legible, charming explainer look with snappy TikTok pacing; reference 2's immersive eye-level full-bleed framing is the everyday baseline. True Arcane-scale moments are reserved for 2–3 story peaks; elsewhere scale is a seasoning. Mostly day/golden light; dusk/night only where the story earns it; never murky; captions always crisp. Camera mostly gentle (5–15% push-ins, light parallax); at most one or two big reveal moves. Tone: smart, curious, slightly urgent explainer, not a trailer.
Read the section "CINEMATIC DIRECTION" at the top of ${ROOT}/docs/BRIEF.md and study ${ROOT}/assets/ref2/sheet.png, ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png, f_42.png (reference 2: same artist family, FULL-BLEED, immersive, captions in the sky) and ${ROOT}/assets/ref_cinematic/arcane_collage.jpg (Arcane stills: the scale we want).
The user: the card version makes the viewer feel BIG (looking down at a diorama). We want the viewer to feel SMALL, like Arcane's cinematic shots: tiny back-view figures and a tiny mascot facing colossal structures and endless cities; huge low sun behind silhouetted skylines; light shafts; deep layered atmospheric perspective; weighty camera moves (push-ins, crane/tilt-ups, pull-back reveals, multiplane parallax); time of day evolving.
Coordinates are now FULL-BLEED canvas coords (1080x1920) for the world at camera rest; describe camera moves explicitly. Captions sit in the SKY: line-1 baseline ~y 330, line-2 ~y 426, centered x 540, up to ~26 characters per line; dark ink on light skies, white text on dark skies. Safe zones: keep key action in x 90-990, y 200-1480; the bottom ~400 px is ground/foreground only. Sun about r 150, typically sitting on the horizon.
Also binding now (measured, read them): ${ROOT}/docs/motion_spec.md (no fades; pops/draw-ons/wipes; the sun is a character that pulses and hops on words; the mascot crosses every transition; sync grammar; >= 5 visual events per second, no gap > 1.0 s), ${ROOT}/docs/style_bible.md (the look), ${ROOT}/docs/mascot.md (the elephant's poses and API), ${ROOT}/assets/timing.json (authoritative word times and default caption beats; reuse its captions unless the layout demands a change).
Additional per-scene JSON fields: "timeOfDay" (day|golden|dusk|night|dawn), "scale": {"colossal": "...", "observer": "...", "ratio": "how small the observer is vs the colossal element"}, "layers": [ {"depth": 0..1 (0 = far), "contents": "...", "palette": "..."} ], "camera": [ {"t0": s, "t1": s, "move": "push-in|pull-back|tilt-up|tilt-down|truck-left|truck-right|crane-up|hold|whip", "from": {"x","y","zoom"}, "to": {"x","y","zoom"}, "ease": "...", "why": "..."} ], "light": "sun position/size, shafts, glows, lit windows, silhouettes".
Transition types now: "loop-start|cut|matchcut|camera-continuous|foreground-wipe|unbuild|push-through".
`

phase('Synthesize')
const synth = await agent(
  `${COMMON}\n${CINE}\nYou are the lead director and cinematographer. Three storyboard drafts are in ${ROOT}/docs/storyboard_drafts/ (written for the old card layout: keep their story beats, metaphors, wit and timing; re-stage them cinematically for the new direction). Three judges evaluated them:\n\n${summary}\n\nProduce the FINAL storyboard: take the strongest backbone (weigh the judges' winners), graft in every must-keep idea that fits, fix every must-fix, and RE-STAGE every scene for the full-bleed baseline, with cinematic scale used with restraint. One coherent world and metaphor system (a vast city of websites is a natural fit for scale). Stage every scene in the immersive full-bleed baseline (eye-level, depth, the viewer slightly small), choose the 2–3 story peaks that get true Arcane-scale treatment and say why, and keep the rest bright, clear and quick. Every scene still gets a deliberate (usually gentle) camera, depth layers and light that fits the time of day. Make each scene concrete enough that an illustrator-coder can build it without asking questions: element inventory with positions in canvas coords, depth layers, camera moves with times, beat-by-beat choreography locked to word start times, mascot action (pose names from docs/mascot.md), sun behavior, time of day and light, transition, SFX cues, captions with highlight.\n${SCHEMA_DOC}\nWrite ${ROOT}/docs/storyboard.md (human-readable; start with a one-paragraph concept, the time-of-day arc, and a scene table) and ${ROOT}/docs/storyboard.json (validate with python3 json.load). Also write ${ROOT}/docs/storyboard_decisions.md: what you took from which draft and why, in under 40 lines.\nFinal message: concise scene table (id, time range, one-line visual, camera move) + the hook + the loop.`,
  { label: 'synthesize-cinematic', phase: 'Synthesize' })

phase('Critique')
const CRIT_SCHEMA = {
  type: 'object',
  properties: {
    issues: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['severity', 'where', 'problem', 'fix'] } },
  },
  required: ['issues'],
}
const CRITICS = [
  { key: 'sync', brief: `MECHANICAL SYNC & COMPLETENESS. Check with a Python script you write in /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/ (not in the repo) against ${ROOT}/assets/timing.json: (1) scenes tile 0..70.687 s with no gaps/overlaps; (2) concatenated captions reproduce the transcript words exactly once, in order (ignore punctuation/case); (3) every caption line's "s" equals (±0.05 s) its first word's start and every highlight's "s" its word's start; (4) caption lines <= 26 chars, <= 2 lines; (5) scene boundaries fall in pauses; (6) beats reference element ids that exist; (7) camera segments lie inside their scene and do not overlap; (8) mascot pose names exist in docs/mascot.md. Report every violation with the exact fix.` },
  { key: 'cinema', brief: `CINEMATIC SCALE WITH RESTRAINT (the user's direction plus 'don't overdo it, nuanced, still TikTok/Reels'). Compare against ${ROOT}/assets/ref2/sheet.png (the everyday baseline) and ${ROOT}/assets/ref_cinematic/arcane_collage.jpg (the peaks). Is the immersive full-bleed baseline consistent? Are there exactly 2–3 well-chosen epic peaks that truly make the viewer feel small, and is everything else kept bright, readable and quick rather than over-dramatized (flag any scene that is overdone: too dark, too slow, too grandiose for its line)? Is the camera deliberate, mostly gentle, with at most one or two big reveals? Are depth layers and atmospheric perspective specified? Is light used dramatically (low sun, silhouettes, shafts, lit windows) within flat style? Does the time-of-day arc make sense across the video and for the loop? Is there variety of shot types (vista, worm's-eye, overhead, close/far) without breaking the world? Are transitions cinematic and smooth? Is anything going to look cheap in hand-coded flat SVG (if so, propose a staging that will look great)?` },
  { key: 'retention', brief: `RETENTION & CLARITY. Is the first frame scroll-stopping and the first 1.5 s gripping? Is there a meaningful visual event at least every ~1 s and >= 5 events/s of build detail (per docs/motion_spec.md)? Does any scene sag, especially during slow camera moves? Will a non-technical viewer follow every idea with sound off? Do visuals match exactly what the VO claims? Does the loop land seamlessly (end frame flows into frame 1 visually and in caption)?` },
]
const crits = await parallel(CRITICS.map(c => () => agent(
  `${COMMON}\n${CINE}\nYou are a storyboard critic for ${ROOT}/docs/storyboard.json and storyboard.md. Do NOT edit repo files. LENS: ${c.brief}\nReport issues with concrete fixes.`,
  { label: `critic:${c.key}`, phase: 'Critique', schema: CRIT_SCHEMA })))

const issues = crits.filter(Boolean).flatMap(c => c.issues)
log(`Critics: ${issues.filter(i => i.severity === 'blocker').length} blockers, ${issues.filter(i => i.severity === 'major').length} major, ${issues.filter(i => i.severity === 'minor').length} minor`)

let fixed = 'no fixes needed'
if (issues.length) {
  fixed = await agent(
    `${COMMON}\n${CINE}\nYou are the lead director. Apply these critic findings to ${ROOT}/docs/storyboard.json and ${ROOT}/docs/storyboard.md (keep them consistent; re-validate JSON; re-run timing checks in python yourself until clean). Where critics conflict, prefer the user's cinematic direction, then clarity, then retention.\n${JSON.stringify(issues, null, 1)}\nFinal message: what you changed, one line per issue, confirmation the mechanical checks pass, and the final scene table (id, time, visual, camera).`,
    { label: 'fix', phase: 'Critique' })
}

return { synth, issues, fixed }

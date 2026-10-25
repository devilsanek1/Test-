const CINE = `
=== NEW DIRECTION FROM THE USER (overrides the card layout, card-local coordinates and the 3D card flip above) ===
Read the section "CINEMATIC DIRECTION" at the top of ${ROOT}/docs/BRIEF.md and study ${ROOT}/assets/ref2/sheet.png, ${ROOT}/assets/ref2/f_1.png, f_12.png, f_33.png, f_42.png (reference 2: same artist family, FULL-BLEED, immersive, captions in the sky) and ${ROOT}/assets/ref_cinematic/arcane_collage.jpg (Arcane stills: the scale we want).
The user: the card version makes the viewer feel BIG (looking down at a diorama). We want the viewer to feel SMALL, like Arcane's cinematic shots: tiny back-view figures and a tiny mascot facing colossal structures and endless cities; huge low sun behind silhouetted skylines; light shafts; deep layered atmospheric perspective; weighty camera moves (push-ins, crane/tilt-ups, pull-back reveals, multiplane parallax); time of day evolving.
Coordinates are now FULL-BLEED canvas coords (1080x1920) for the world at camera rest; describe camera moves explicitly. Captions sit in the SKY: line-1 baseline ~y 330, line-2 ~y 426, centered x 540, up to ~26 characters per line; dark ink on light skies, white text on dark skies. Safe zones: keep key action in x 90-990, y 200-1480; the bottom ~400 px is ground/foreground only. Sun about r 150, typically sitting on the horizon.
Also binding now (measured, read them): ${ROOT}/docs/motion_spec.md (no fades; pops/draw-ons/wipes; the sun is a character that pulses and hops on words; the mascot crosses every transition; sync grammar; >= 5 visual events per second, no gap > 1.0 s), ${ROOT}/docs/style_bible.md (the look), ${ROOT}/docs/mascot.md (the elephant's poses and API), ${ROOT}/assets/timing.json (authoritative word times and default caption beats; reuse its captions unless the layout demands a change).
Additional per-scene JSON fields: "timeOfDay" (day|golden|dusk|night|dawn), "scale": {"colossal": "...", "observer": "...", "ratio": "how small the observer is vs the colossal element"}, "layers": [ {"depth": 0..1 (0 = far), "contents": "...", "palette": "..."} ], "camera": [ {"t0": s, "t1": s, "move": "push-in|pull-back|tilt-up|tilt-down|truck-left|truck-right|crane-up|hold|whip", "from": {"x","y","zoom"}, "to": {"x","y","zoom"}, "ease": "...", "why": "..."} ], "light": "sun position/size, shafts, glows, lit windows, silhouettes".
Transition types now: "loop-start|cut|matchcut|camera-continuous|foreground-wipe|unbuild|push-through".
`

phase('Synthesize')
const synth = await agent(
  `${COMMON}\n${CINE}\nYou are the lead director and cinematographer. Three storyboard drafts are in ${ROOT}/docs/storyboard_drafts/ (written for the old card layout: keep their story beats, metaphors, wit and timing; re-stage them cinematically for the new direction). Three judges evaluated them:\n\n${summary}\n\nProduce the FINAL storyboard: take the strongest backbone (weigh the judges' winners), graft in every must-keep idea that fits, fix every must-fix, and RE-STAGE every scene for full-bleed cinematic scale. One coherent world and metaphor system (a vast city of websites is a natural fit for scale). Each scene must make the viewer feel small, have one colossal element and a tiny observer, a deliberate camera, depth layers and light. Make each scene concrete enough that an illustrator-coder can build it without asking questions: element inventory with positions in canvas coords, depth layers, camera moves with times, beat-by-beat choreography locked to word start times, mascot action (pose names from docs/mascot.md), sun behavior, time of day and light, transition, SFX cues, captions with highlight.\n${SCHEMA_DOC}\nWrite ${ROOT}/docs/storyboard.md (human-readable; start with a one-paragraph concept, the time-of-day arc, and a scene table) and ${ROOT}/docs/storyboard.json (validate with python3 json.load). Also write ${ROOT}/docs/storyboard_decisions.md: what you took from which draft and why, in under 40 lines.\nFinal message: concise scene table (id, time range, one-line visual, camera move) + the hook + the loop.`,
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
  { key: 'cinema', brief: `CINEMATIC SCALE (the user's new direction). Compare against ${ROOT}/assets/ref_cinematic/arcane_collage.jpg and ${ROOT}/assets/ref2/sheet.png. For each scene: does it make the viewer feel SMALL? Is there a truly colossal element and a tiny observer? Is the camera deliberate and weighty with a reason? Are depth layers and atmospheric perspective specified? Is light used dramatically (low sun, silhouettes, shafts, lit windows) within flat style? Does the time-of-day arc make sense across the video and for the loop? Is there variety of shot types (vista, worm's-eye, overhead, close/far) without breaking the world? Are transitions cinematic and smooth? Is anything going to look cheap in hand-coded flat SVG (if so, propose a staging that will look great)?` },
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

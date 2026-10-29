export const meta = {
  name: 'storyboard-v3-remap',
  description: 'Re-map the storyboard onto the final script with word-anchored beats (seconds resolved later from the real voice), critique on three lenses, fix, and build the anchor-resolver tool',
  phases: [
    { title: 'Remap', detail: 'director re-maps scenes + resolver tool' },
    { title: 'Critique', detail: 'structure/sync, scale/style, retention/engagement' },
    { title: 'Fix', detail: 'apply critiques' },
  ],
}

const ROOT = '/home/user/Test-/video'
const CONTEXT = `
Project: ${ROOT}. FIRST read ${ROOT}/docs/BRIEF.md in full (BALANCE NOTE, ENGAGEMENT LAYER, QUALITY GATES, measured full-bleed numbers, CINEMATIC DIRECTION), then ${ROOT}/docs/script/final_script.md (the NEW final script: plain text, cued text, the "visual impact" notes and on-screen labels it requires), ${ROOT}/docs/storyboard.md + storyboard.json (the previous 13-scene storyboard written for the OLD script: its world, metaphors, sets, peaks and ideas are approved and should be reused), ${ROOT}/docs/SHARED_SETS.md and ${ROOT}/docs/SHARED_PROPS.md (the shared world kit that now exists: use its sets and props by name), ${ROOT}/docs/ENGINE.md, ${ROOT}/docs/CINE.md, ${ROOT}/docs/mascot.md, ${ROOT}/docs/QA.md (the gates every scene must pass: life score >= 8/10, no dead run > 0.40 s unless an allow-listed hold, captions readable, beat-locked cuts), ${ROOT}/docs/style_bible_ref2.md (two-tier scale playbook).
The new voiceover has NOT been recorded yet. So every timed thing must be anchored to WORDS, not seconds: {"w": <word index in the plain script, 0-based, counting words split on whitespace with punctuation attached>, "dt": <seconds offset from that word's start, may be negative>}. For planning, an ESTIMATED timeline is fine: use the previous ElevenLabs take's measured pace (assets/timing.json: per-word durations and pause lengths after commas/sentences) to estimate word starts for the new script, and store it in ${ROOT}/assets/timing_est_v3.json (same schema as timing.json, flagged "estimated": true).
`

phase('Remap')
const remap = await parallel([
  () => agent(`${CONTEXT}
YOU ARE THE DIRECTOR. Re-map the storyboard onto the new script:
- Keep the approved world, metaphors, sets, Pip and Bit, the sun as a character, the time-of-day arc, and 2–3 Arcane-scale peaks (likely the hook's government plaza, the Cloudflare dome counting attempts, and "every single server" as the sea-of-doors pull-back). Re-stage where the script changed (no "two steps" lesson; the heads-up / leak beat; "STILL has to install it on every single server"; "about half … not officially supported"; the FBI "turn it off" joke; the new last line "some of those governments did it before there was even a fix", which must still loop seamlessly into frame 1).
- Put the required on-screen labels from final_script.md in the right beats (small, legible, in-world where possible: on signs, cards, the dome's counter).
- Engagement layer: Bit hidden in EVERY scene (rewatch game), small pause-worthy sign jokes, a first frame that already tells the story, a seamless loop.
- Scene count about 9–12 for ~55 s; cuts at sentence/phrase boundaries; at least 5 events/s of in-frame life with no dead run over 0.4 s except deliberate, named holds; captions in the sky band kept calm.
- Every beat, camera key, caption line/highlight, tone switch, sfx cue and transition is word-anchored.
Write ${ROOT}/docs/storyboard_v3.md (concept, scene table, per-scene detail) and ${ROOT}/docs/storyboard_v3.json (same shape as docs/storyboard.json but every time field replaced by an anchor object {"w","dt"}, plus "wordsRef": the exact plain script used for indexing). Validate JSON. Final message: the scene table (id, words covered, est. time, visual, camera, peak?) and the loop.`, { effort: 'max', label: 'remap:director', phase: 'Remap' }),
  () => agent(`${CONTEXT}
YOU BUILD THE RESOLVER TOOL (lane: scripts/anchor/** and assets/timing_est_v3.json only).
1. assets/timing_est_v3.json: an estimated word timeline for the new plain script (from docs/script/final_script.md), built from the previous take's measured pace (assets/timing.json): typical word duration by syllable count, pause lengths after commas, sentence ends, and the ellipsis after "PHP". Flag "estimated": true.
2. scripts/anchor/resolve.py: inputs a word-anchored storyboard JSON (every time field is {"w": idx, "dt": s}) and a timing JSON (estimated or real), outputs a resolved storyboard with seconds (default: docs/storyboard_v3_resolved.json). It verifies that the storyboard's "wordsRef" matches the timing's words, and reports mismatches with a word-level diff so small script edits can be re-anchored. Also emit src/data/scenes.json and src/data/captions.json in the engine's formats (read scripts/gen-scenes.mjs and scripts/gen-captions.mjs and docs/ENGINE.md to match them exactly, or call those scripts).
3. scripts/anchor/reanchor.py: when the user's recorded script differs slightly from wordsRef (a word added or removed), re-map anchors through a word alignment (difflib on normalized tokens) and report anchors that landed on changed words.
4. Self-tests with a toy storyboard. Document in scripts/anchor/README.md.
Final message: usage, test results, and the estimated total duration of the new script.`, { effort: 'max', label: 'remap:resolver', phase: 'Remap' }),
])
log('Remap done')

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
phase('Critique')
const CRITICS = [
  { key: 'sync', brief: 'STRUCTURE & SYNC: run scripts/anchor/resolve.py with assets/timing_est_v3.json and check mechanically: scenes tile the whole script; every word is covered exactly once by captions in order; caption lines <= 26 chars, <= 2 lines; highlights on the right words; anchors reference valid words; camera segments inside scenes; beat density >= 5 events/s and no gap > 1.0 s except named holds; mascot poses exist; shared sets/props referenced by real names; required on-screen labels present; the loop lands on frame 1.' },
  { key: 'scale-style', brief: 'SCALE & STYLE: baseline vs the 2–3 peaks per the playbook (not overdone, mostly bright and quick); hand-drawn reference look; captions\' sky band kept calm behind text; Bit visible in every scene; staging uses the shared kit consistently; time-of-day arc sensible; transitions smooth and velocity-continuous.' },
  { key: 'retention', brief: 'RETENTION, CLARITY & ENGAGEMENT: does the first frame tell the story with sound off? does each line\'s visual make the idea instantly obvious to a non-technical viewer (especially "install it on every single server", "not officially supported", and the joke)? any sag? are the engagement hooks (bait line, rewatch Bit, sign jokes, loop) landing subtly, not needy?' },
]
const crits = await parallel(CRITICS.map(c => () => agent(`${CONTEXT}
You are a storyboard critic for ${ROOT}/docs/storyboard_v3.json and .md. Do NOT edit repo files. LENS: ${c.brief} Report issues with concrete fixes.`, { effort: 'max', label: `critic:${c.key}`, phase: 'Critique', schema: CRIT_SCHEMA })))
const issues = crits.filter(Boolean).flatMap(c => c.issues)
log(`Critics: ${issues.filter(i => i.severity === 'blocker').length} blockers, ${issues.filter(i => i.severity === 'major').length} major, ${issues.filter(i => i.severity === 'minor').length} minor`)

phase('Fix')
let fixed = 'no issues'
if (issues.length) {
  fixed = await agent(`${CONTEXT}
You are the DIRECTOR. Apply these critic findings to ${ROOT}/docs/storyboard_v3.json and storyboard_v3.md (keep them consistent; re-validate; re-run scripts/anchor/resolve.py with the estimated timing until its checks are clean).
${JSON.stringify(issues, null, 1)}
Final message: one line per finding, then the final scene table (id, words, est. time, visual, camera, peak?).`, { effort: 'max', label: 'fix:director', phase: 'Fix' })
}
return { remap, issues, fixed }

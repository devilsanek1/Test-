export const meta = {
  name: 'v3-assembly',
  description: 'v3 rework, final assembly: integrate the lanes, full-size render, three independent max-effort reviews, a fix round by file lane, an independent verify (and a second fix round if needed), the posting master, cover and posting kit',
  phases: [
    { title: 'Integrate', detail: 'cross-lane requests, every join and the loop seam, the full-size render' },
    { title: 'Review', detail: 'R1 story, joins and attention; R2 the look: line, light, fullness; R3 the owner\'s eye, cold, at phone size' },
    { title: 'Fix', detail: 'one agent per file lane, disjoint files' },
    { title: 'Verify', detail: 'an independent re-render and re-review: every finding, and anything the fixes broke' },
    { title: 'Fix 2', detail: 'only if blockers or majors are still open' },
    { title: 'Final', detail: 'verify every fix, re-render, master, cover, POSTING.md, HANDOFF' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly'
const REP = '/home/user/Test-/video/docs/v3/rework_reports'
const LANE_REPORTS = (args && args.laneReports) || '(no lane reports passed: read video/docs/v3/rework_reports/*.md)'

const GIT = `GIT: commit after every meaningful step (containers restart; uncommitted work is lost), only your own paths (git add <paths>), message
ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists wait 5 s and retry. Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (other
sessions push to this branch too, e.g. video 2's; resolve only conflicts in v3 files; never discard their work). The repo is PUBLIC: no email addresses,
secrets or model names in any file. Never commit copyrighted reference footage.`

const CTX = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s, 60 fps, 1080x1920), the REWORK's final assembly. The owner asked to apply their feedback
before publishing; verbatim: "It's too busy, too incoherent. There is no story, no clean transitions, just a bunch of shots put together ... too many
moving parts and I'm not sure what to keep my attention on. Across the story we should have the main arc going where the attention should be, and the
supporting details / supporting animation that adds subtle loveliness, like a bird flying, should be a bit more subtle but yet alive ... some supporting
environment can be drawn a bit more subtle. The style is too rough and messy ... cleaner, more refined, gentle, a lot more premium. We don't have the
shadows much and the light is weirdly put; lighting and shadows should be gentle but should exist." (Earlier, of G5: "way too empty": calm and tiered,
never empty.) The approved hook pilot (SQA 0-5.80) is ${V}/deliverables/v3/v3_rework_pilot.mp4: it is the bar for the rest of the film.
RULES (they win in this order): the owner's words (${V}/docs/OWNER_PLAYBOOK.md, ${V}/docs/v3/OWNER_NOTES.md), ${V}/docs/look/DIRECTION.md,
${V}/docs/look/CRAFT.md, the build spec ${V}/docs/v3/flow_v2.md, the kit README ${V}/src/v3/film/kit/README.md, ${V}/docs/G5_BLOCKING.md §2b and §8b.
CODE: entry ${V}/src/entry-v3-film.tsx (Film3, Film3Final = no draft label, Film3Shot, Film3Seams = the seam probe, Cover3), sequences SQA-SQF in
${V}/src/v3/film/scenes.json, scenes in ${V}/src/v3/film/scenes/ (shared: home_set.tsx, thread_plane.tsx, outside.tsx, h2_window.tsx), kit in
${V}/src/v3/film/kit/. The work list so far: ${V}/docs/v3/rework_reports/OPEN.md and the lane reports in that folder.
RENDER: ${V}/scripts/render-media.mjs (read its header: one bundle, --frames=a-b, --scale, --codec=wav, --master). The box has 4 cores and other agents
render too: --concurrency=2 for full films. QA: ${V}/scripts/qa/gate_check.py (--seam-comp Film3Seams, --density), ${V}/scripts/qa/density.py
(--cozy), ${V}/scripts/qa/check_light.py, ${V}/scripts/qa/retro_tools/ (story carry/jumps, hierarchy tiers, line/measure.py, light).
Work under ${SCR}/<your label>/. HOUSE RULE (limits): write your result into your report file in the repo AS YOU GO (named below) and commit it at
every step; never only as your final message; your final message repeats the file's text. Look at no more than ~20 images per pass (contact sheets help). If you spawn any subagent, give it effort "max".`

const FINDING = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'R1-n or R2-n' },
    severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
    time: { type: 'string', description: 'film seconds, e.g. 26.1-27.5' },
    area: { type: 'string' },
    owner_words: { type: 'string', description: 'the owner words it answers' },
    measured: { type: 'string', description: 'what you measured or saw, with numbers' },
    fix: { type: 'string', description: 'the concrete fix: what changes, in which file and component' },
    lane: { type: 'string', enum: ['home', 'thread', 'window', 'reveal'], description: 'home = SQA/SQB/SQC/home_set.tsx; thread = thread_plane.tsx, kit/*.tsx, captions.json, scenes.json, Film3.tsx; window = outside.tsx, h2_window.tsx, SQE*/SQF*; reveal = SQD*' },
  },
  required: ['id', 'severity', 'time', 'area', 'owner_words', 'measured', 'fix', 'lane'],
}
const REVIEW = {
  type: 'object',
  properties: {
    verdict: { type: 'string', description: '3-5 lines: does this cut answer the owner feedback; what an owner sees first' },
    scores: { type: 'string', description: 'the measures you ran, per sequence and join' },
    findings: { type: 'array', items: FINDING },
  },
  required: ['verdict', 'scores', 'findings'],
}

// ---------- 1. Integrate ----------
phase('Integrate')
const integ = (args && args.integReport) ? args.integReport : await agent(`${CTX}
YOU ARE THE INTEGRATOR (the transition agent, G5_BLOCKING §3). Four fix lanes just finished, each on its own files (WINDOW: SQE/SQF/outside/h2_window;
REVEAL: SQD; HOME: SQB/SQC; SHARED: thread_plane/home_set/PriceTag/captions). Their reports:
${LANE_REPORTS}
1. git pull. npx tsc --noEmit -p video. Apply every REQUEST in the reports that is still open (each one exactly, or say why not), and anything that
   crosses a lane border (you own every join and every shared file now).
2. Every join (J1 5.80, J2 16.60, J3 19.40 push-through, J4 22.68, J5 36.36) and the loop seam (41.15 -> frame 0): Film3Seams + gate_check
   --seam-comp Film3Seams, and look at the frames either side of each join at 0.5 scale. The joins must carry (flow_v2), no pops, no clipped captions.
3. Render the FULL film at full size (1080x1920, 60 fps, with the voice): node scripts/render-media.mjs Film3 ${SCR}/film_full.mp4
   --entry=src/entry-v3-film.tsx --concurrency=2 --crf=18 (if one run fails, chunk it per scripts/film_chunks.py and G5_BLOCKING §8b). Then a contact
   sheet (one frame per second) at ${SCR}/film_full_sheet.jpg, and a 0.25-scale phone-look sheet at ${SCR}/film_phone_sheet.jpg.
4. Look at the sheets against the pilot: is the whole film now at the pilot's bar (clean, calm, one focus, light and shadow)? Note the 3 worst spots.
${GIT}
RETURN (at most 18 lines): the requests applied, the join numbers (carry / eye jump / colour shift per join), the render path and its length in
frames, the 3 worst spots you saw, and anything still broken.`, { label: 'integrate', phase: 'Integrate', effort: 'max' })

if (!integ) return 'STOPPED: the integrator returned nothing (session limit or error); resume this run once it can work again.'

// ---------- 2. Review (independent reviewers) ----------
phase('Review')
const REVIEWERS = [
  { key: 'R1', lens: `STORY, JOINS AND ATTENTION. Watch the film as the owner will, at phone size, with the sound on, then with the sound off. Is it ONE
flowing story where every line follows from the last and every join carries something (flow_v2's carriers)? Where does the eye go at each beat: one
subject at a time, the support subtle but alive, the environment calm? Measure per CRAFT §e with the captions masked: subject share of the top-3 %
salience and of the motion (>= 60 %), noticeable movers per beat (<= 3-4), carry / eye jump / colour shift per join (retro_tools), the thread (the
price tag) on screen and reacting on its beats. Also the hook (DIRECTION's first 3 s), the payoff and the loop.` },
  { key: 'R2', lens: `THE LOOK: CLEAN, PREMIUM, LIGHT. At full size and at phone size: is the line clean and refined (no rough, doubled, broken or
misregistered strokes; CRAFT §c budgets via retro_tools/line/measure.py), the colour gentle and warm, never sickly; does every set have gentle light and
shadow that make sense (one light logic per set, contact shadows where things touch, form shade, rims inside the silhouette; check_light.py per set;
CRAFT §d); is the depth right (far planes paler and calmer, CRAFT §f); is it full but calm (density.py --cozy per sequence: never empty, never busy)?
Compare every sequence with the approved pilot SQA: name each place it falls below that bar.` },
  { key: 'R3', lens: `THE OWNER'S EYE, COLD. Before you read any spec, watch the film as a viewer scrolling a feed: at phone size (0.25 scale frames,
4-6 per second of film, and the audio), once with the sound on and once with it off. Write down, per 2-3 s: where your eye went, what you understood,
anything that looked rough, empty, busy, sickly, abrupt or confusing, and where you would swipe away. Only then read the owner's words and DIRECTION.md
and turn what you saw into findings (each tied to the owner words it answers). You are the check that the measures did not miss what a person sees.` },
]
const reviews = await parallel(REVIEWERS.map((r) => () => agent(`${CTX}
YOU ARE INDEPENDENT REVIEWER ${r.key}. The integrator rendered the full reworked film; its report:
${integ || '(the integrator returned nothing: render the film yourself first, as G5_BLOCKING §8b says)'}
The film: ${SCR}/film_full.mp4 (full size, 60 fps, with the voice); sheets ${SCR}/film_full_sheet.jpg and ${SCR}/film_phone_sheet.jpg. Render your own
stills or clips from the code where you need them (render-media.mjs --frames, --scale=0.5). Your lens: ${r.lens}
Judge ONLY against the owner's words and the rules; do not invent new taste. Every finding: the time, the area, the owner words it answers, what you
measured, and ONE concrete fix with its file and component (and its lane). Rank blockers first, then what the owner sees longest. At most 12 findings;
only real ones (a perfect sequence gets none). Edit NO repo file except your report: ${REP}/assembly_review_${r.key}.md (verdict, scores, findings; commit it as you go).`, { label: `review:${r.key}`, phase: 'Review', effort: 'max', schema: REVIEW })))

if (!reviews.some(Boolean)) return `STOPPED after the integrator: every reviewer failed.\n## Integrate\n${integ}`
const all = reviews.filter(Boolean).flatMap((r) => r.findings || [])
const LANES = ['home', 'thread', 'window', 'reveal']
const OWN = {
  home: 'scenes/SQA.tsx, SQB*.tsx, SQC*.tsx, scenes/home_set.tsx',
  thread: 'scenes/thread_plane.tsx, kit/*.tsx (every kit file), captions.json, scenes.json, Film3.tsx',
  window: 'scenes/outside.tsx, scenes/h2_window.tsx, SQE*.tsx, SQF*.tsx',
  reveal: 'scenes/SQD*.tsx',
}
const groups = LANES.map((l) => ({ lane: l, items: all.filter((f) => f.lane === l) })).filter((g) => g.items.length)
log(`reviews: ${all.length} findings (${groups.map((g) => g.lane + ' ' + g.items.length).join(', ')})`)
const verdicts = reviews.map((r, i) => r ? `${REVIEWERS[i].key}: ${r.verdict}\n${r.scores}` : `${REVIEWERS[i].key}: FAILED`).join('\n\n')
const fmt = (fs) => fs.map((f) => `- ${f.id} [${f.severity}] ${f.time}, ${f.area}. Owner: ${f.owner_words}. Measured: ${f.measured}. FIX: ${f.fix}`).join('\n')

// ---------- 3. Fix (one agent per lane, disjoint files) ----------
phase('Fix')
const fixes = await parallel(groups.map((g) => () => agent(`${CTX}
YOU ARE THE ${g.lane.toUpperCase()} FIX LANE of the final round. You own ONLY: ${OWN[g.lane]} (other lanes edit the rest right now; if a fix needs a file
you do not own, make the smallest version inside your files and name the rest under REQUESTS). The two independent reviewers' verdicts:
${verdicts}
YOUR FINDINGS:
${fmt(g.items)}
Fix every real one (skip one only if it is wrong: say why, with the evidence), at the approved pilot's bar. Keep what already works: change only what a
finding names. Re-check each fix with stills at its time (0.5 scale and a 0.25 phone look) and the measure the finding used; npx tsc --noEmit -p video.
Re-run the seam probe if you touched a join's frames. ${GIT}
REPORT FILE: ${REP}/assembly_fix_${g.lane}.md.
RETURN (at most 14 lines): each finding id -> fixed (the number before -> after) / skipped (why); REQUESTS (one exact line each).`, { label: `fix:${g.lane}`, phase: 'Fix', effort: 'max' })))
let fixReport = groups.map((g, i) => `### ${g.lane}\n${fixes[i] || 'FAILED'}`).join('\n\n')

// ---------- 3b. Verify (independent), then a second fix round only if blockers / majors are open ----------
phase('Verify')
const ver = await agent(`${CTX}
YOU ARE THE INDEPENDENT VERIFIER. Three reviewers found these problems in the reworked film:
${fmt(all)}
The fix lanes say:
${fixReport}
Do not trust the fix reports: git pull, then render the film again at full size (node scripts/render-media.mjs Film3 ${SCR}/film_verify.mp4
--entry=src/entry-v3-film.tsx --concurrency=2 --crf=18) and check EVERY finding at its time with the measure it used (fixed / not fixed / made worse).
Then watch the whole film at phone size, sound on, for anything the fixes broke (joins, the loop seam, captions, the thread, a pop, a regression against
the approved pilot SQA) and for any blocker the reviewers missed. Do NOT edit any repo file. In findings, list ONLY what is still open or newly broken
(re-use the reviewer's id for a finding that is still open; V-n for new ones), with its lane and one concrete fix; an empty list means the film is clean. Edit NO repo file except your report: ${REP}/assembly_verify.md (commit it as you go).`,
  { label: 'verify', phase: 'Verify', effort: 'max', schema: REVIEW })
if (!ver) return `STOPPED before the master: the verifier failed (resume this run).\n## Integrate\n${integ}\n## Fix\n${fixReport}`
const still = ((ver && ver.findings) || [])
const open2 = still.filter((f) => f.severity !== 'minor')
log(`verify: ${still.length} open (${open2.length} blocker/major)`)
if (open2.length) {
  phase('Fix 2')
  const groups2 = LANES.map((l) => ({ lane: l, items: still.filter((f) => f.lane === l) })).filter((g) => g.items.some((f) => f.severity !== 'minor'))
  const fixes2 = await parallel(groups2.map((g) => () => agent(`${CTX}
YOU ARE THE ${g.lane.toUpperCase()} LANE of the SECOND fix round. You own ONLY: ${OWN[g.lane]} (other lanes edit the rest right now; REQUESTS for the
rest). The independent verifier re-rendered the film after the first fix round; its verdict:
${ver.verdict}
STILL OPEN OR NEWLY BROKEN in your files:
${fmt(g.items)}
The first round's reports (what was tried):
${fixReport}
Fix each one at its root (a repeat means the first fix missed the cause), at the approved pilot's bar; change only what a finding names. Re-check each
with stills at its time (0.5 scale and a 0.25 phone look) and its measure; npx tsc --noEmit -p video; the seam probe if you touched a join. ${GIT}
REPORT FILE: ${REP}/assembly_fix2_${g.lane}.md.
RETURN (at most 12 lines): each id -> fixed (before -> after) / skipped (why); REQUESTS.`, { label: `fix2:${g.lane}`, phase: 'Fix 2', effort: 'max' })))
  fixReport += '\n\n## Second round (after the verifier)\n' + groups2.map((g, i) => `### ${g.lane}\n${fixes2[i] || 'FAILED'}`).join('\n\n')
}
const verReport = ver ? `${ver.verdict}\n${ver.scores}\n${fmt(still)}` : '(the verifier returned nothing)'

// ---------- 4. Final ----------
phase('Final')
const fin = await agent(`${CTX}
YOU ARE THE FINAL ASSEMBLER (G8). The review findings:
${fmt(all)}
The fix lanes' reports:
${fixReport}
The independent verifier (after the first fix round):
${verReport}
1. git pull; npx tsc --noEmit -p video. Apply any REQUEST still open. Verify every finding at its time on fresh stills: fixed or not (say which).
   Re-run the seam probe (every join and the loop seam).
2. THE MASTER (PIPELINE_V2 "Master encode", the one recipe): node scripts/render-media.mjs Film3Final ${V}/deliverables/v3/v3_final.mp4
   --entry=src/entry-v3-film.tsx --master --concurrency=2 (Film3Final has no draft label). Check: ffprobe (1080x1920, 60 fps, the film's frame count,
   BT.709 tagged, faststart); loudness with ffmpeg ebur128 / loudnorm print: -14 LUFS integrated (+-1) and true peak <= -1 dBTP; if it is off, remux
   with the audio normalised (two-pass loudnorm) and the video stream copied. python3 -I scripts/qa/check_banding.py on the master's open-sky shots (no
   FAIL); gate_check.py on the master. Then a contact sheet of the master (one frame per second) at ${SCR}/final_sheet.jpg.
3. THE COVER: ${V}/src/v3/film/Cover3.tsx is a film frame without captions plus the title. Re-check its frame against the reworked SQA (the hook's
   strongest clean frame with the tag and the data center; the title must not cover the subject); re-render ${V}/deliverables/v3/cover.png
   (Cover3 --frame=<f>, full size) and look at it at full and phone size.
4. ${V}/docs/v3/POSTING.md: update anything the rework changed (caption lines and times, the cover frame, the alt text describing the picture, the
   duration). ${V}/docs/v3/OWNER_NOTES.md: one line under the rework entry (what the final round fixed; owner's words stay as quoted). HANDOFF.md's v3
   status line: the rework master delivered, awaiting the owner's review. Commit the master, the cover and the docs (git add those paths).
${GIT}
REPORT FILE: ${REP}/assembly_final.md.
RETURN (at most 16 lines): the master's path, ffprobe facts, LUFS / dBTP, the banding and gate results, the cover frame, each finding fixed or not,
anything you would still change (ranked).`, { label: 'final', phase: 'Final', effort: 'max' })

return `## Integrate\n${integ}\n\n## Reviews\n${verdicts}\n\n${fmt(all)}\n\n## Fix\n${fixReport}\n\n## Verify\n${verReport}\n\n## Final\n${fin}`

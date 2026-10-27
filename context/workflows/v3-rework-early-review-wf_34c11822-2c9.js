export const meta = {
  name: 'v3-rework-early-review',
  description: 'v3 rework: while the SQA pilot is fixed, render the current film fast and run two independent max-effort reviews of SQB-SQF against the owner feedback (story/joins/hierarchy; look/line/light/fullness); findings land in OPEN.md for the final pass',
  phases: [
    { title: 'Render', detail: 'current film, half size, fast path' },
    { title: 'Review', detail: 'two independent reviewers, then one merged findings list' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/early'
const CTX = `
VIDEO 3 rework (the owner asked to apply their feedback before publishing). The owner's feedback, verbatim: "It's too busy, too incoherent. There is
no story, no clean transitions, just a bunch of shots put together ... too many moving parts and I'm not sure what to keep my attention on. Across the
story we should have the main arc going where the attention should be, and the supporting details / supporting animation that adds subtle loveliness,
like a bird flying, should be a bit more subtle but yet alive ... the style is too rough and messy, a lot of rough lines ... cleaner, more refined,
gentle, a lot more premium ... we don't have the shadows much and the light is weirdly put; lighting and shadows should be gentle but should exist."
(Earlier: G5 was "way too empty": calm and tiered, never empty.) Rules: ${V}/docs/look/DIRECTION.md, ${V}/docs/look/CRAFT.md; the build spec
${V}/docs/v3/flow_v2.md (sequences SQA-SQF, the thread tag, joins J1-J5, hierarchy and light per sequence); the lane reports and open items in
${V}/docs/v3/rework_reports/ (OPEN.md lists what is already known). SQA is being fixed by another agent right now: do not review or edit it. The
measuring tools: ${V}/scripts/qa/ (gate_check.py, density.py, check_light.py) and ${V}/scripts/qa/retro_tools/ (carry, jumps, tiers, line measure).`

phase('Render')
const render = await agent(`${CTX}
YOU ARE THE RENDERER. Work in ${V}. Do not edit any source file. Render Film3 (src/entry-v3-film.tsx) at half size (540x960), 60 fps, with the voice,
frames from 5.80 s to the end (frame 348 onward), using the faster renderer scripts/render-media.mjs if its header says it supports a frame range and
scale (otherwise npx remotion render with --frames and --scale=0.5 --concurrency=2), to ${SCR}/film_half.mp4 (render in chunks if needed and join).
Then make one contact sheet per sequence (SQB-SQF: 8-10 frames each, the beats in flow_v2 section 4) and one strip around each join J1-J5 (+-0.5 s,
10 frames) into ${SCR}/sheets/. REPORT the paths and the render time (at most 6 lines).`, { label: 'render', phase: 'Render', effort: 'max' })

phase('Review')
const LENSES = [
  'STORY, JOINS AND HIERARCHY: does each sequence carry the story and hand over cleanly at its joins (carry, eye jump, colour shift, movers at the join; the thread tag on screen and reacting on its beats); at every moment is it obvious where to look (one focus; supporters subtle but alive; environment calm); does anything read as a separate shot, a jump, or clutter?',
  'LOOK: LINE, LIGHT AND FULLNESS: is it clean, refined, gentle and premium everywhere (no rough or doubled lines, no jitter, clean fills; measure with the line tool); is the light gentle but present and consistent per place (soft coloured shadows, contact shadows, pools that agree with sources; check_light); is it full and alive but calm (no empty fields, no busy clutter; density.py); is the colour warm, never sickly?',
]
const reviews = await parallel(LENSES.map((lens, i) => () => agent(`${CTX}
YOU ARE INDEPENDENT REVIEWER ${i + 1}; your lens: ${lens}
Review SQB, SQC, SQD, SQE and SQF in ${SCR}/film_half.mp4 (the renderer's sheets are in ${SCR}/sheets/; extract your own frames as needed; the film
time = the clip time + 5.80 s). Ignore items already in OPEN.md unless they are worse than it says. At most 10 problems, most severe first, each: the
sequence and time, the screen area, what is wrong against the owner's words, and the concrete fix (file and what to change). Do not edit files.
At most 50 lines.
RENDERER: ${render || 'FAILED'}`, { label: 'review ' + (i + 1), phase: 'Review', effort: 'max' })))

const merged = await agent(`${CTX}
Merge the two independent reviews below into ONE ranked findings list (dedupe; keep the most severe first; each with sequence, time, area, the
owner-feedback reason and the concrete fix with the file). Append it to ${V}/docs/v3/rework_reports/OPEN.md under a heading "Early max-effort review
(SQB-SQF)". Commit only that file (git add it; if .git/index.lock exists wait 5 s and retry; pull --no-rebase origin video-production first, then push
origin HEAD:video-production), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
REPORT: the top 5 findings in one line each.
${reviews.map((r, i) => `### Reviewer ${i + 1}\n${r || 'FAILED'}`).join('\n\n')}`, { label: 'merge', phase: 'Review', effort: 'max' })

return { render, reviews, merged }

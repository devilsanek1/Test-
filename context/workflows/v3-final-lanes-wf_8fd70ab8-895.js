export const meta = {
  name: 'v3-final-lanes',
  description: 'v3 rework final pass, part 1 (in parallel with the SQA pilot fix): three max-effort fix lanes on the early review E1-E15 and the open items, each on its own files (window/street SQE+SQF+outside; reveal SQD; home SQB+SQC), each re-checked',
  phases: [
    { title: 'Lanes', detail: 'WINDOW, REVEAL, HOME fix lanes, each with its own files' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final'
const GIT = `GIT: commit after every meaningful step (containers restart; uncommitted work is lost), only your own paths (git add <paths>), message
ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists wait 5 s and retry. Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (other
agents and sessions push too; resolve only conflicts in your own files; never discard their work). The repo is PUBLIC: no email addresses or secrets.`

const CTX = `
VIDEO 3 REWORK, final pass. The owner asked to apply their feedback before publishing; verbatim: "It's too busy, too incoherent. There is no story, no
clean transitions, just a bunch of shots put together ... too many moving parts and I'm not sure what to keep my attention on. Across the story we
should have the main arc going where the attention should be, and the supporting details / supporting animation that adds subtle loveliness, like a
bird flying, should be a bit more subtle but yet alive ... some supporting environment can be drawn a bit more subtle. The style is too rough and
messy ... cleaner, more refined, gentle, a lot more premium. We don't have the shadows much and the light is weirdly put; lighting and shadows should
be gentle but should exist." (Earlier: G5 was "way too empty": calm and tiered, never empty.)
RULES (they win in this order): ${V}/docs/look/DIRECTION.md, ${V}/docs/look/CRAFT.md, the build spec ${V}/docs/v3/flow_v2.md, the kit README
${V}/src/v3/film/kit/README.md ("Clean pen and tiers", "Light and shadow"), ${V}/docs/G5_BLOCKING.md section 2b.
THE WORK LIST: ${V}/docs/v3/rework_reports/OPEN.md: items 1-12 from the lanes, and the early max-effort review E1-E15 (each with time, area, the
owner-feedback reason and a concrete fix). The SQA pilot fixer is working RIGHT NOW on SQA, scenes/home_set.tsx, scenes/thread_plane.tsx and
kit/PriceTag.tsx (incl. E2/OPEN 9, the thread plane's off-beat step-down and screen dim): do NOT edit those four files; if you need a change there,
write it under REQUESTS in your report. Pull before you start and before every push; the thread plane's API may change under you: re-read it.
CHECKS (re-run after your fixes, report the numbers): npx tsc --noEmit -p video; stills at 0.5 scale and a 0.25 phone look at every beat and join you
touched (render with video/scripts/render-media.mjs, the fast path); the CRAFT checks (thread, tiers: the subject owns contrast and >= 60 % of motion, at
most 3-4 noticeable supporters, clean-pen budgets via video/scripts/qa/retro_tools/line/measure.py); python3 video/scripts/qa/check_light.py per set;
python3 video/scripts/qa/density.py (calm, never empty); your joins' seam probe (Film3Seams + gate_check --seam-comp Film3Seams). Look at no more than
~15 images per pass. Work under ${SCR}/<lane>/. If you spawn any subagent, give it effort "max".`

const LANES = [
  { key: 'window', own: 'scenes/outside.tsx, scenes/h2_window.tsx, scenes/SQE.tsx, scenes/SQF.tsx, scenes/SQE_*.tsx, scenes/SQF_*.tsx (and SQE_front.tsx, which you delete) and new kit files', items: 'E1 (BLOCKING: replace FrontStandIn with the real ThreadPlane in H2Scene; CrateHop to threadAt(T).listingScreen; delete SQE_front.tsx), E3, E4, E9, E10, E11, E14, E15 and OPEN 1, 2 (the CrateHop side), 3, 5 (the street side), 6, 8; and E4 (the crate carry readable: the mid-arc scale peak) and the h2_window push hold' },
  { key: 'reveal', own: 'scenes/SQD.tsx and scenes/SQD_*.tsx', items: 'E5 (the mountain reads as memory sticks at phone size; the street does not steal "By the mountain": step the street down a tier during SQD), E6 (the push must not sweep the giant sign through the caption band, or declare it), E7 (THE stick lands on the pile, no hover) and OPEN 3 (no double birds), 5 (speed strobes by eye at full size) and 11 (J3 detection: note only)' },
  { key: 'home', own: 'scenes/SQB.tsx, scenes/SQC.tsx, scenes/SQB_*.tsx, scenes/SQC_*.tsx', items: 'E8 (H1\'s data center steps down to its tier while the chart / the stick lead; if the fix lives in home_set.tsx, write it as a REQUEST), E12 (SQB alive but calm: a little more quiet life and fullness without stealing the chart), E13 (the desk books\' shadows rotate with the books; if they are in home_set.tsx, REQUEST) and OPEN 10 (as REQUESTS for home_set), 12 (the doodles\' labels readable at phone size)' },
]

phase('Lanes')
const lanes = await parallel(LANES.map((L) => () => agent(`${CTX}
YOU ARE THE ${L.key.toUpperCase()} FIX LANE. You own: ${L.own}. Fix: ${L.items}. Fix every real problem (skip one only if it is wrong, and say why),
re-check, and commit. ${GIT}
REPORT (at most 14 lines): what you fixed (by item number), the check numbers before -> after, what is open, and REQUESTS for the four files the pilot
fixer owns (one exact line each).`, { label: L.key, phase: 'Lanes', effort: 'max' })))

return LANES.map((L, i) => `### ${L.key}\n${lanes[i] || 'FAILED'}`).join('\n\n')

export const meta = {
  name: 'v3-g5b-rollout',
  description: 'v3 G5b: roll the approved density + life bar out to the remaining panels (8 lanes: build, independent review, fix), then a full-res 60 fps assembly with density/cozy checks and a cross-panel continuity pass',
  phases: [
    { title: 'Lanes', detail: 'per panel group: build -> review -> fix (pipelined)' },
    { title: 'Assemble', detail: 'full film at 1080x1920 60 fps, density + cozy + gate checks, continuity fixes, deliverable' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b'

const GIT = `GIT: commit only your own paths (git add <paths>, never -A or .) after EVERY meaningful step (work-in-progress commits are fine: the
container has restarted twice today and uncommitted work is lost); message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists, wait 5 s and retry. After each commit run once: git push origin HEAD:video-production (if rejected, leave it; the
orchestrator merges). Never pull, merge, rebase, reset, stash or checkout. Never commit video/out or scratchpad files. The repo is PUBLIC: no
email addresses.`

const CTX = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s), stage G5b: the dense blocking cut. The owner judged the G5 cut "way too empty", then
APPROVED the density pilot ("go ahead yes"): ${V}/deliverables/v3/v3_g5b_pilot.mp4 (O1: the dressed nook with Pip and the snowy town through the
window; S4/S6: the chart in a glass noticeboard on the computer shop's street wall with a row of winter backs and Pip). THAT IS THE BAR: every
remaining panel must feel as full and alive as those (built in ${V}/src/v3/film/scenes/O1_set.tsx, O1_dress.tsx, O1_life.tsx, S4.tsx, S4_street.tsx).
Owner rules (${V}/docs/OWNER_PLAYBOOK.md, Visual style): every scene must FEEL ALIVE (a dense detailed world, people near and far, a living character,
ambient life; numbers are warnings, never a quota); a dense world makes a frame full even when little moves; when a scale shot comes the scale must
feel GREAT; warm, never sickly; paper edges never at the top or beside the caption band.
READ FIRST: ${V}/docs/look/LIFE_AND_DENSITY.md (incl. "Approved bar"), ${V}/docs/look/COZY_AND_SCALE.md section 3b (Coziness v2: cozy holds,
movers, the float camera, colour and light), ${V}/docs/look/CINEMATIC_GUIDE.md ("Scale cues" for S9), the v3 plans ${V}/docs/v3/density_plan_g5b.md
(per panel), ${V}/docs/v3/cozy_v2_application.md (it OVERRIDES the density plan where they differ), ${V}/docs/v3/s9_scale_plan.md (S9), and the kit
README ${V}/src/v3/film/kit/README.md (Autumn Ember, blue hour and first snow, Pip3, WinterPerson with coatDetail, window life, weather, room
dressing, street and industrial life, floatCam, backRowPhones).
THE FILM: ${V}/src/v3/film/ (entry ${V}/src/entry-v3-film.tsx: Film3 60 fps, Film3Shot {id}, Film3-<ID>; how-to ${V}/docs/G5_BLOCKING.md). The
STORY, the voice, the cut points, each panel's one idea, its framing and its camera move are LOCKED (${V}/docs/v3/storyboard_g3.md,
${V}/docs/v3/camera_plan_g3.md): add density and life AROUND them, never restage. Holds follow cozy_v2_application.md (the float on the listed
home-base holds). Keep the caption band (screen y ~290-600) calm and readable, and key information out of the platform UI zones.
SHARED FILES: lanes own only their panel files (scenes/<ID>.tsx and new scenes/<ID>_*.tsx). New shared props go in NEW kit files named
kit/<ID>_*.tsx or as ADDITIVE optional props on existing kit pieces (never change a default or another panel's look); list them in your report.
CHECKS: renders under ${SCR}/<lane>/; stills via Film3Shot at --scale=0.5; the meter: python3 scripts/qa/density.py (from ${V}) on a 0.5-scale
render of your panel(s) (Film3-<ID>, 60 fps, with the voice), plus --cozy for cozy holds; look at no more than ~10 images per session.`

const LANES = [
  { key: 'S9', panels: 'S9 (19.40-22.68), the S5 pull-back crane: the film\'s ONE big move and its scale moment', note: 'Follow s9_scale_plan.md for the end frame (the town in shrinking rows into haze past both edges, the data center campus, the mountain huge but far, the drop to a lit street with tiny walkers, a warm lived-in near corner with Pip beside you, a cloud bank, birds in a size ladder) and keep the start frame, the move shape and timing, the chimney-pot wipe and the landing on "mountain". The scale must feel GREAT (CINEMATIC_GUIDE Scale cues).' },
  { key: 'S13', panels: 'S13 (31.32-33.40), the home base returns: you seated, 3/4 back view, waiting', note: 'A calm cozy hold (check with --cozy): the dressed nook to O1\'s level, the window street seen from above with people and traffic passing calmly in the snow (cozy_v2_application.md: walkers 40-50 px), the float camera, Pip, the wall clock and the thought bubble with the BETTER laptop.' },
  { key: 'S10-S14', panels: 'S10 (22.68-25.24) and S14 (33.40-36.36), the queue at the chip factory (matched frames)', note: 'An industrial street alive: workers, forklifts, crates, trucks, steam, snow, lit windows, people waiting, the sticks flying from the factory into the data center first in line, the laptop van waiting behind. S14 stays the exact S10 frame plus its changes (the chip maker speaking with the 2026->2027 calendar, the second darker data center cutting in, the van pushed back); make the chip maker readable.' },
  { key: 'S5', panels: 'S5 (9.48-11.48), the face beat: you at the shop counter, the BETTER laptop appears on the shelf', note: 'A real computer shop alive: shelves of laptops and boxes, price cards, a shop assistant, other customers (back or 3/4 view), the street through the shop window with snow and walkers, string lights, Pip.' },
  { key: 'S7-S8', panels: 'S7 (16.60-18.28) close at your desk and S8 (18.28-19.40) the extreme close cut-in on the memory stick', note: 'Home-base desk dressed to O1\'s level (the same desk world: photos, mug, cookies, planner, headphones, lamp pool, Pip), the see-inside bubble in S7; S8 keeps the stick as the biggest thing in frame, with the keyboard and the desk clutter around it; the float camera per cozy_v2_application.md; the S7->S8 match stays aligned.' },
  { key: 'S11', panels: 'S11 (25.24-29.40), the bar chart: what is left costs five times last year', note: 'Put the chart in the world like S4 (e.g. a price board in the computer shop or the factory office, with people reacting and Pip), the bar still growing on "costs" and "5x" on "five", readable at phone size; fill the empty top half the G5 lanes flagged.' },
  { key: 'S12', panels: 'S12 (29.40-31.32), close on the laptop and its tag: $999 struck, $1,099 on "pass"', note: 'The same desk world as S7 (lamp pool, clutter, Pip reacting to the price), the float camera per cozy_v2_application.md, the tag beats on their words.' },
  { key: 'S16', panels: 'S16 (38.84-41.15), the close-up on the tag turning over to show the data center; the loop un-build into O1\'s frame 0', note: 'The tag hanging from the laptop corner in the dressed desk world (lamp pool, mug, photos, Pip watching it turn), the float camera, and the loop seam still clean (S16 un-builds into O1\'s bare-line frame 0).' },
]

phase('Lanes')
const results = await pipeline(LANES,
  (L) => agent(`${CTX}
YOU ARE THE BUILD LANE FOR ${L.key}. Panels: ${L.panels}.
${L.note}
Build it to the approved bar, then check: typecheck; stills at the panel's key beats beside the pilot frames and the references; a 0.25 phone look;
the meter (and --cozy where it is a cozy hold). Iterate until it feels as full and alive as the pilot and every locked beat still lands.
${GIT}
REPORT (at most 12 lines): what you added, the meter numbers (G5 -> now), the still sheet path, any shared kit additions, open items.`,
    { effort: 'max', label: L.key + ' build', phase: 'Lanes' }),
  (built, L) => agent(`${CTX}
YOU ARE AN INDEPENDENT REVIEWER for ${L.key} (${L.panels}). You did not build it. The lane's report is below. Render your own stills of the panel(s)
at --scale=0.5 at 5-6 times (start, every timed beat, end) and a 0.25 phone look, put them beside the pilot (${V}/deliverables/v3/v3_g5b_pilot.mp4 at
0.5, 2.0, 7.0 s) and run the meter yourself. Find at most 6 problems, most severe first: it does not feel as full and alive as the pilot (say where
the empty or flat area is); a locked beat moved or no longer reads; the caption band is busy or the captions are hard to read; the subject is lost
in the clutter at phone size; a sickly or cold colour, or the hero/pop colours misused; something inconsistent with the rest of the film (the laptop,
tag, phone, data center, You, Pip, the time of day); motion that is too busy for a cozy hold or too still for a busy beat; anything broken. For each:
what, where (time and screen area), and the concrete fix. Do not edit files.
LANE REPORT:
${built || 'FAILED'}`, { effort: 'max', label: L.key + ' review', phase: 'Lanes' }),
  (review, L, i) => agent(`${CTX}
YOU ARE THE FIX LANE FOR ${L.key} (${L.panels}). An independent reviewer found the problems below. Fix every real one (skip one only if it is wrong,
and say why), re-check with stills and the meter, and commit.
${GIT}
REVIEW:
${review || 'FAILED'}
REPORT (at most 10 lines): fixes, the final meter numbers, open items.`, { effort: 'max', label: L.key + ' fix', phase: 'Lanes' }),
)
const laneReports = LANES.map((L, i) => `### ${L.key}\n${results[i] || 'FAILED'}`).join('\n\n')

phase('Assemble')
const assemble = await agent(`${CTX}
YOU ARE THE ASSEMBLER. Every panel is now dressed (O1/S15 and S4/S6 in the pilot; the rest by the lanes below). Work in ${V}.
1. Typecheck. Render Film3 at 60 fps, FULL size 1080x1920, with the voice, to video/out/v3_g5b.mp4 (--concurrency=3, a long render: run it in the
   background and poll; if it is interrupted, render in chunks with --frames and join them with ffmpeg). Run scripts/qa/gate_check.py (with
   --density) and scripts/qa/density.py --cozy with the scenes list on it.
2. A whole-film contact sheet (one frame per panel at its key beat, plus O1 at 0.15 / 2.0 / 4.5 s, S9 start and landing, the last frame next to frame
   0) to ${SCR}/assemble/sheet.jpg; look at it at phone size. Find at most 8 CROSS-PANEL problems no single lane could see: the same laptop / tag /
   phone / data center / You / Pip drawn differently; the time of day or snow drifting; a panel much emptier or much busier than its neighbours; a
   cut that lands off its word; the loop seam. Fix them with small targeted edits, re-render the affected range, and re-join.
3. Copy the final MP4 to video/deliverables/v3/v3_g5b.mp4 and the sheet to video/review/v3_g5b/sheet.jpg; add a short "v3 G5b lessons" section to
   ${V}/docs/G5_BLOCKING.md (what made the rollout consistent, what to set up first next time).
${GIT}
REPORT (at most 12 lines): the deliverable, the gate/density/cozy results (per panel PASS/WARN), the fixes, anything open for the owner.

LANE REPORTS:
${laneReports}`, { effort: 'max', label: 'assemble', phase: 'Assemble' })

return { lanes: laneReports, assemble }

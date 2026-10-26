export const meta = {
  name: 'arcane-pullback-distill',
  description: 'Distil the owner-favourite Arcane shot #55 (S1E1 rooftop pull-back crane reveal) into the library, then pick and board the best v3 panel to replicate it',
  phases: [
    { title: 'Distil', detail: '3 analysts (camera, composition and staging, light and depth) on shot #55' },
    { title: 'Library', detail: 'one writer: new shot type in CINEMATIC_GUIDE + our 9:16 sketch' },
    { title: 'Pick', detail: '3 directors propose where it goes in v3, a judge picks, a board artist boards the proposal' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
const SRC = SCR + '/arcane_rec/arcane_s1.mp4'
const OUT = SCR + '/pullback'

const CTX = `
CONTEXT: a short-form explainer channel (TikTok/Reels/Shorts, 1080x1920, hand-drawn flat-colour house style). We keep an Arcane camera library,
${V}/docs/look/CINEMATIC_GUIDE.md (environment-first shot types S1-S4 with measured numbers, "The opening", 9:16 sketches E1-E4), built from the
owner's screen recording of the YouTube compilation "Amazing Shots of ARCANE SEASON 1": ${SRC} (1280x542, 24 fps, black bars cropped; times
= seconds into the compilation). Per-shot measurements: ${V}/docs/look/research/arcane_shots.json (records, field "shot") and
${SCR}/arcane_rec/cam/camera.json. Measuring tool: ${V}/scripts/look/measure_camera.py; contact sheets: ${V}/scripts/look/shot_sheets.py.

THE OWNER'S FAVOURITE SHOT (2026-10-26): compilation shot #55, ${SRC} from 109.46 s to 120.92 s (11.46 s, one continuous move). It is S1E1
"Welcome to the Playground", ~2:30 in: the two sisters on a rooftop ("It's nice getting above it all, huh?", then epic music). It starts as a
medium close-up of the two in profile on the left looking right into lead room toward the city, partly hidden by rooftop clutter; the camera pulls
back, arcs right and rises until they are tiny figures at a railing, backs to us, centre-low, with rooftops leading the eye to a sunlit upper
city of spires on a hill and the sea. The owner: "It has pretty much everything: suspense, sense of scale, fantastic environment and
composition, and the animation, the actual camera movement." Their rules: Arcane references are about environment and camera (figures only as
small scale anchors, backs to us); and "the speed of the transition should not be the reference point: speed up or slow down where it feels
appropriate; in a short reel we would usually speed it up" (a reference move gives the SHAPE: path, framing, reveal order, easing shape;
never its speed). Copyright: the footage and its frames stay in the scratchpad (${OUT}); only numbers, words and our own drawings go into the
repo. Never commit a frame of Arcane.`

const ANALYST_OUT = `Write your findings to ${OUT}/<your lens>.md (at most ~80 lines, numbers first, then a 2D recipe for our 9:16 frame) and return
the same text. Look at no more than ~10 images (contact sheets count as one). Do not edit or commit repo files.`

phase('Distil')
const lenses = [
  { key: 'camera', ask: `CAMERA. Measure the move frame by frame across the whole shot (re-run measure_camera.py on a trimmed clip of 109.3-121.0 s
into ${OUT}, or track features yourself with OpenCV): zoom (scale) curve, pan x, crane y, roll, the arc; split it into phases (any hold, the
acceleration, the cruise, the landing) with % of duration and % of travel; classify the easing; measure parallax per depth band (near clutter and
railing, mid roofs, far city, sky) as speed ratios; and note when foreground masses (the dormer roof, machinery) cross the frame and what they
hide or reveal. Then the RECIPE: the move expressed as SHAPE (path, total zoom ratio, crane distance in frame heights, arc, easing shape,
parallax factors per plane), retimed to a reel at 60 fps for three durations (2.0 s, 3.3 s, 5 s): what changes when it is compressed (which
phases shrink, the minimum landing hold so the end frame registers, strobe and readability limits for fast moves at 60 fps).` },
  { key: 'composition', ask: `COMPOSITION AND STAGING. At the start, 25 %, 50 %, 75 % and the end: the figures' height as a fraction of frame height,
their position, lead room, the horizon height, the thirds, the leading lines (roof ridges, gutters, the railing) and where they point, how many
depth planes, the framing masses (left machinery, right dormer), where the landmark (the upper city on its hill) sits, sky share. THE SUSPENSE:
what is withheld at the start and in which order things are revealed (and by what: the pull-back, the rise, an occluder clearing). Why it makes the
viewer feel small yet safe (the figures on their rooftop as a refuge looking out at the prospect). Then translate it to 9:16 (1080x1920): which
part of the 2.36:1 frame a vertical crop would keep at each phase (or how to re-stage it vertically: the rise becomes the main axis), the start
and end frames as layouts with numbers, keeping the caption band (y ~290-600) free of busy detail.` },
  { key: 'light', ask: `LIGHT, COLOUR AND DEPTH. The value structure (dark near frame, lit mid, pale far), atmospheric perspective (how saturation,
contrast and value change with distance), the light direction and the warm-light / cool-shadow split, the sky's share and shape (clouds as a
backdrop), and how light leads the eye to the landmark during the move. Then translate it to our flat house style in the warm Autumn Ember palette
(${V}/docs/v3/LOOK.md; ${V}/docs/look/palettes.json "9 Autumn Ember"; style frame ${V}/review/look/v3_g4/nook_C_warm.png): 3-5 flat value steps per
plane, which planes get ink and which are flat shapes, how to get haze with flat colour only (no gradients, no blur).` },
]
const analyses = await parallel(lenses.map((L) => () => agent(`${CTX}
YOUR LENS: ${L.ask}
${ANALYST_OUT}`, { label: 'distil:' + L.key, phase: 'Distil' })))
const A = lenses.map((L, i) => `### ${L.key}\n${analyses[i] || 'FAILED'}`).join('\n\n')

phase('Library')
const library = await agent(`${CTX}
YOU ARE THE LIBRARIAN. Three analysts distilled shot #55 (below). Land it in the library so every agent can use it:
1. ${V}/docs/look/CINEMATIC_GUIDE.md: add a new shot type, "S5 The pull-back crane reveal (the owner's favourite)", in the same format and length
   as S1-S4 (read them first): when to use it (a film's big reveal: from the viewer's small world to the vast system), the shape (path, zoom
   ratio, crane distance, arc, easing shape, parallax per plane), the staging and the suspense (what is withheld, the reveal order), light and
   depth in flat colour, the 9:16 start and end layouts with numbers, and the retiming rule (the shape, never the speed: compress to the reel,
   with the minimum landing hold). Keep figures as small scale anchors with their backs to us. Add a line to the guide's sources/notes: a Netflix
   screen recording comes out black (DRM): identify the scene from the subtitle and timecode, then find it in the YouTube compilation recording.
2. Our own 9:16 sketch E5 of S5 (start frame and end frame, like E1-E4): add it to the sketch data the guide's sketches come from
   (${V}/public/look/cine_sketches.json, composition ShotSketch in ${V}/src/entry-v3.tsx; see how E1-E4 were made and rendered into
   ${V}/docs/look/cine_sketches/), render it, look at it once, and link it in the guide's sketch table.
3. Add a short "owner favourite" note to record #55 in ${V}/docs/look/research/arcane_shots.json (words only) and update the guide's
   summary table if it has one.
4. Make a side-by-side check sheet for the owner (reference frames next to our E5 sketch) with ${V}/scripts/look/sketch_debug.py into ${OUT}/sheet
   (scratchpad only; never commit it).
Commit only the files you changed (git add <paths>; if .git/index.lock exists wait 5 s and retry; never pull, merge, rebase, reset or stash),
message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
then run once: git push origin HEAD:video-production (if rejected, leave it). Report in at most 10 lines with the sheet path.

ANALYSES:
${A}`, { label: 'library', phase: 'Library' })

phase('Pick')
const V3 = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s, voice locked): the G3 storyboard is LOCKED and G5 (real sets) is being built from it.
Read ${V}/docs/v3/storyboard_g3.md and ${V}/docs/v3/camera_plan_g3.md (one row per panel with times and voice), ${V}/public/v3/voice_words.json
(the words and their times), and watch the board's frames via ${V}/public/v3/animatic.json (render stills with
npx remotion still src/entry-v3.tsx Animatic --frame=<t*30> --scale=0.25 if you need to see a panel). The opening O1 (0-5.80) was just approved by
the owner and follows "The opening" rule; the film's one big move today is S9 (a rise-over reveal, 19.40-21.32) with S9b (a worm's-eye scale cut,
21.32-22.68). The cut points sit on the voice's words and the voice cannot change; a proposal may merge or re-stage panels inside the same time
window if the story (each panel's one idea, in order) stays the same.`

const lensesP = [
  'story and scale (which beat is the film\'s real "your small world vs their vast system" moment)',
  'pacing and the reel (where an extra continuous move helps retention most and where it would slow the film down)',
  'craft and feasibility (where the shape fits the time window, the voice and the existing sets with the least rework and the strongest result)',
]
const directors = await parallel(lensesP.map((lens, i) => () => agent(`${CTX}
${V3}
THE SHOT TYPE, as just distilled for the library:
${library || A}

YOU ARE DIRECTOR ${i + 1}; your lens: ${lens}. Propose the BEST place in video 3 to replicate this shot (one place; a runner-up allowed), and how:
the panel(s) and time window, the start frame (what the viewer sees close: their small world), the end frame (the vast thing revealed, the tiny
figure or object with its back to us), the reveal order and the suspense on this voice line, the retimed duration and speed (faster than Arcane
is expected), what it replaces in the locked board and what stays, and the risks (does every panel's one idea survive; does it read with the
sound off; does it compete with the opening). At most 25 lines. Do not edit files.`, { label: 'director:' + (i + 1), phase: 'Pick' })))

const judge = await agent(`${CTX}
${V3}
THREE DIRECTORS proposed where video 3 should replicate the owner's favourite shot (S5 pull-back crane reveal). Judge them on: the strongest
"small world to vast system" payoff for this story, sound-off readability, fit to the voice window and the locked story, retention in a 41 s reel,
and rework cost. Pick ONE (with grafts from the others) and write the build spec for a board artist: panels and exact times, start and end frame
layouts in frame pixels, the move's shape and timing (eases, parallax planes as element moves), what each existing element becomes, and the words
each beat lands on. At most 30 lines.

${directors.map((d, i) => `### Director ${i + 1}\n${d || 'FAILED'}`).join('\n\n')}`, { label: 'judge', phase: 'Pick' })

const board = await agent(`${CTX}
${V3}
YOU ARE THE BOARD ARTIST. Board the judge's pick (below) as a SHORT playable proposal in the locked board style (docs/look/STORYBOARD_STYLE.md,
SketchReel style "board", lint with scripts/v3/board_lint.py), WITHOUT touching the locked ${V}/public/v3/animatic.json or anything under
${V}/src/v3/film/ (G5 is being built there):
1. Copy animatic.json to ${V}/public/v3/proposal_pullback.json and change only the panels the pick replaces (keep the rest identical, so the
   proposal plays in context). Register a composition "AnimaticProposal" in ${V}/src/entry-v3.tsx that reads it (same as Animatic).
2. Lint, then render the window with 2 s of context on each side (--frames) at 30 fps, --scale=0.5, to ${V}/deliverables/v3/v3_proposal_pullback.mp4
   (with the voice), and a frame sheet of the new move (6-8 frames) to ${OUT}/proposal_sheet.jpg; look at the sheet once and fix what doesn't read.
3. Write ${V}/docs/v3/proposal_pullback.md (at most 30 lines): what changes, why, the times, and what G5 would rebuild if the owner says yes.
Commit only those files (git add <paths>; if .git/index.lock exists wait 5 s and retry; never pull, merge, rebase, reset or stash), message
ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
then run once: git push origin HEAD:video-production (if rejected, leave it). Report in at most 10 lines.

THE JUDGE'S PICK AND SPEC:
${judge}`, { label: 'board', phase: 'Pick' })

return { analyses: A, library, directors, judge, board }

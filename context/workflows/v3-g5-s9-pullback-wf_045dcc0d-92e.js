export const meta = {
  name: 'v3-g5-s9-pullback',
  description: 'v3 G5: rebuild S9 + S9b as one S5 pull-back crane set (owner approved), update the locked docs, sound-off cold read, final 60 fps G5 render',
  phases: [
    { title: 'Build', detail: 'the S9 set (builder) and the locked docs + G3 board render (docs) in parallel' },
    { title: 'Check', detail: 'one sound-off cold read of the new S9 frames' },
    { title: 'Finish', detail: 'small fixes from the read, full Film3 render, gate check, deliverable' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5/s9'

const GIT = `GIT: commit only your own paths (git add <paths> / git rm <paths>, never -A or .), message ending with exactly these two lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists, wait 5 s and retry. Then run once: git push origin HEAD:video-production; if rejected, leave it (the orchestrator
merges). Never pull, merge, rebase, reset, stash or checkout. Never commit video/out or scratchpad files. The repo is PUBLIC: no email addresses.`

const CTX = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s), gate G5 BLOCKING (real sets, final camera, key poses, no edges/paper/texture,
60 fps). The G5 film is built: ${V}/src/v3/film/ (entry ${V}/src/entry-v3-film.tsx: Film3, Film3Shot {id}, Film3-<ID>), how-to
${V}/docs/G5_BLOCKING.md, kit ${V}/src/v3/film/kit/ with its README (Autumn Ember, blue hour with first snow, white captions on the outdoor sky),
the current cut ${V}/deliverables/v3/v3_g5_blocking.mp4 and its sheet ${V}/review/v3_g5/sheet.jpg.
THE OWNER APPROVED A CHANGE ("pretty good, continue, swap"): S9 + S9b become ONE panel S9, 19.40-22.68 ("And so do AI data centers. By the
mountain."), staged as the library's S5 pull-back crane reveal (the owner's favourite Arcane shot): ${V}/docs/look/CINEMATIC_GUIDE.md section S5
(shape, the parallax law shift = 1 - D/Z, easing cubic-bezier(0.55, 0.03, 0.50, 1.0), the foreground wipe window, landing hold, 9:16 layouts).
The locked board panel is S9 in ${V}/public/v3/animatic.json (merged from the proposal; spec ${V}/docs/v3/proposal_pullback.md; exact boxes in
${V}/scripts/v3/build_proposal_pullback.py; the board render ${V}/deliverables/v3/v3_proposal_pullback.mp4). The owner's rule: a reference move
gives the SHAPE, never the speed (ours: a 155-frame move at 60 fps, then a 42-frame hold to the cut on "They").`

phase('Build')
const [build, docs] = await parallel([
  () => agent(`${CTX}
YOU ARE THE S9 BUILDER. Work in ${V}. Replace the G5 sets S9.tsx and S9b.tsx (the old rise-over + worm's-eye cut) with ONE S9 panel, 19.40-22.68,
that plays the approved pull-back in the Autumn Ember house style, as a real set:
- START (19.40, cut from S8's extreme close of the gold memory stick): you from behind, 3/4, head turned right (hair and ear, no face), cut at the
  hips, raising your ONE gold memory stick (the same stick as S8: a match on the object), on OUR roof at blue hour; a warm brick chimney stack
  standing where the data center will land, our vent cut by the left edge; the only view out is a bright cool slot of the far town.
- THE MOVE: pull back + crane up + a pinned truck, real multiplane parallax (sky locked; far town, hall and mountain; mid snowy roofs with a lit
  street; near clutter; the deck and you pinned as the pivot), on the S5 easing over 155 frames, then the hold. Frame 1 already moves; the
  chimney pot crosses close to the lens at peak speed (a flat soft mass, >= 10 frames) and hides the swap from your back view to the tiny you;
  out of it the AI data center appears (dark body, lit AI DATA CENTER sign, readable) with memory sticks streaming into its roof from the town's
  roofs; the mountain of gold memory sticks swings in over the right roofline and lands on "mountain" (21.72), bigger than the data center.
- END (hold): tiny you (about 170-200 px) at our parapet, back to us, your one stick held up and still readable; the lit street leads from you
  to the data center; the mountain on the right third, top at y >= 620 (captions stay on the plain sky; white captions).
- Fix in colour what a sound-off reader of the monochrome board got wrong: the lit street read as a SPOTLIGHT (make it a street: lit windows
  and lamps along a canyon between snowy roofs, no light cone); the snowy roofline read as TORN PAPER (make roofs with chimneys, snow caps and
  lit windows); the held object was unclear at the start (S8's gold stick, big, chips visible); the mound could read as banknotes (gold sticks
  with black chips, as the kit Pile).
- Reuse the kit (RoofLedge, DataCenter 'hall', TownBand, Snowfall, StickFlight, Pile, YouTiny, the ShotCam / Layer rig) and add what is missing
  TO THE KIT (a standing back view of You, the brick stack, the chimney pot, the mid roofs with the lit street), with a README update.
- Wiring: scenes.json gets one S9 row (19.40-22.68, captionTone light) and no S9b; scenes/index.ts drops S9b; git rm S9b.tsx and any S9b
  helper files. The board's sound cues (animatic.json "sfx") now include a swell at 19.95 and a low hit at 21.72 ("mountain"); Film3 reads
  them from there. If they miss the burst or the landing in your set, nudge only those two times in animatic.json and say so.
- Speed limits at 60 fps: detailed layers <= ~25 px per frame; only the flat chimney pot may go faster.
CHECK: typecheck; stills of S9 via Film3Shot at --scale=0.5 at 19.45, 20.05, 20.40, 20.75, 20.95, 21.32, 21.72 and 22.40 (one contact sheet),
next to the board at the same times (npx remotion still src/entry-v3.tsx Animatic --frame=<t*30> --scale=0.5); a 0.25 phone-size look. View at
most ~10 images. Fix what doesn't match the board or doesn't read. Then save FOUR cold-read stills at phone size (270x480, captions included)
for a sound-off reader: ${SCR}/coldread/a_19.50.png, b_20.40.png, c_21.15.png, d_22.40.png.
${GIT}
REPORT (at most 12 lines): files, checks (sheet path), what is open, and any sfx times you changed.`, { effort: 'max', label: 'S9 builder', phase: 'Build' }),
  () => agent(`${CTX}
YOU ARE THE DOCS AGENT (small task; do not touch ${V}/src/v3/film/** or public/v3/animatic.json). Work in ${V}.
1. ${V}/docs/v3/storyboard_g3.md and ${V}/docs/v3/camera_plan_g3.md: merge the S9 and S9b rows into ONE S9 row (19.40-22.68, "SCALE: S5
   PULL-BACK CRANE (the one big move)", the idea "your one stick vs their mountain of memory", start / move / end from the proposal doc), and update
   the film-level checks (the one big move is S5; the scale ladder (one stick, many, the mountain) now plays inside one move; the scale dose
   stays 3.28 s). Move the old S9 and S9b rows verbatim into ${V}/docs/v3/archive/g3/s9_s9b_board_cine_rows.md (locked means dropped).
2. ${V}/docs/look/STORYBOARD_STYLE.md section 7: one line: an S5 pull-back lands on the tiny figure inside the move instead of a separate scale
   cut (v3, 2026-10-26).
3. Re-render the locked board so the G3 record matches: npx remotion render src/entry-v3.tsx Animatic deliverables/v3/v3_g3_animatic_board.mp4
   --scale=0.5 --concurrency=2 (it is the locked story; check that it plays and the S9 window shows the pull-back).
${GIT}
REPORT: at most 6 lines.`, { effort: 'max', label: 'docs', phase: 'Build' }),
])

phase('Check')
const read = await agent(`You are a viewer scrolling short videos with the sound OFF. You know nothing about the video. Use the Read tool to view
these four stills, in order, from one continuous 3-second shot (phone-size thumbnails), and open no other file:
1. ${SCR}/coldread/a_19.50.png  2. ${SCR}/coldread/b_20.40.png  3. ${SCR}/coldread/c_21.15.png  4. ${SCR}/coldread/d_22.40.png
For each still: one or two plain sentences on what you see and what is happening. Then: what is the big pile in the last still made of (say what you
actually see)? What is the person holding, and how does it compare with the pile? What does the whole shot tell you, in one sentence? What
confused you, if anything? Be literal. At most 15 lines. If a file is missing, say which.`, { effort: 'max', label: 'cold read', phase: 'Check' })

phase('Finish')
const finish = await agent(`${CTX}
YOU ARE THE FINISHER (one agent, one round). Work in ${V}.
The S9 builder's report and a sound-off cold read of its frames are below. 1) If the reader misread something about S9 (the street, the roofs, the
held stick, the pile, the data center), make small, targeted fixes in S9 and its kit pieces only (no restaging); skip anything the reader got
right. 2) Typecheck, then render Film3 at 60 fps, --scale=0.5, --concurrency=3 to video/out/v3_g5_blocking.mp4 (long render: run it in the
background and poll), run video/scripts/qa/gate_check.py on it, and copy it to video/deliverables/v3/v3_g5_blocking.mp4. 3) Rebuild the whole-film
sheet (the same layout as ${V}/review/v3_g5/sheet.jpg, with S9 at 19.50, 20.95 and 22.40 instead of the old S9 / S9b frames) to that path, and look
at it once at phone size. 4) Add two lines to ${V}/docs/G5_BLOCKING.md "Lessons from v3" about re-staging one panel after the assembly.
${GIT}
REPORT (at most 10 lines): the deliverable, the gate check, the fixes, anything open.

S9 BUILDER REPORT:
${build || 'FAILED'}

COLD READ:
${read || 'FAILED'}

DOCS REPORT:
${docs || 'FAILED'}`, { effort: 'max', label: 'finish', phase: 'Finish' })

return { build, docs, read, finish }

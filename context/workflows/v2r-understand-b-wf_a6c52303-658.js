export const meta = {
  name: 'v2r-understand-b',
  description: 'v2 restart, understanding (b): v1 and reference teardown, engine and toolkit inventory',
  phases: [{ title: 'Understand', detail: 'teardown of v1 + references (rejected cut as the negative) + engine/toolkit inventory' }],
}
const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r'
const CTX = `
PROJECT: video 2 of "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920), a short
explainer channel. Repo: ${V} (Remotion). Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over where
Google's military AI work was heading, and says her contract bans her from criticizing Google, for life.
THE OWNER'S INSTRUCTION (2026-10-27, after rejecting our first production): "No I don't like it, let's start from scratch, let's reset all
cache, let's not do the sketch. Do the video right away, full creative freedom, but look at our GitHub repo's general direction and
principles. NO LIMIT ON TOKENS." So: a FRESH production straight to the FINISHED film (no sketch/board stage), full creative freedom inside
the repo's principles. The first production (G3 board, G4 look, G5 blocking cut) is DROPPED: never build on it or reuse its ideas.
FIXED: the script and its narration, take 2: ${V}/public/v2/voice.wav (39.08 s) + ${V}/public/v2/voice_words.json.
The owner LIKED and POSTED video 1 (PHP bug): ${V}/deliverables/v1/php2shell_final.mp4 (55 s), built with the house engine.
GIT: commit only the files you write (git add <paths>; never -A or .), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
If .git/index.lock exists, wait 5 s and retry. Never push, pull, merge, rebase, reset, stash or checkout. The repo is PUBLIC: no email
addresses, no keys, no third-party images committed (reference frames stay in the scratch dir ${SCR}). The machine has 4 CPUs and other
agents work at the same time: renders with --concurrency=2.
`
phase('Understand')
const [teardown, toolkit] = await parallel([
  () => agent(`${CTX}
YOU WRITE THE TEARDOWN: what makes the films the owner loves work, shot by shot, so a fresh creative team can hit that level. Sources (extract
frames with ffmpeg into ${SCR}/teardown/, many timestamps; contact sheets at phone size; look at them): our v1 ${V}/deliverables/v1/php2shell_final.mp4
(the owner's favourite of ours), reference 1 ${V}/assets/ref/reference.mp4 (France, the style reference: hand-drawn ink, flat colour, a cat in
every scene), reference 2 ${V}/assets/ref2/reference2.mp4, the owner's cozy references described in ${V}/docs/look/COZY_AND_SCALE.md and the
images in ${V}/docs/look/ (ref_sense_of_enclosure.jpg, ref_animated_sketchbook.png, palette_refs/). Also, as the NEGATIVE example only, the
rejected cut ${V}/deliverables/v2/archive/v2_g5_blocking.mp4 (the owner: "No I don't like it") and the v3 G5 cut the owner called "way too
empty" if you find it under ${V}/deliverables/v3/. Also read ${V}/docs/v1 or retro notes if present (${V}/docs/retro/) for what v1's makers learned.
Write ${V}/docs/v2/direction/teardown.md: (1) v1 and reference 1, shot by shot (time, what is shown, framing/shot type, camera move,
transition in/out, what moves, the mascot's/cat's role, caption treatment, how the frame stays full); (2) the 12-20 PATTERNS that make them
work (e.g. continuous camera journeys through one world, crowds with their backs to us, the sun disc motif, signage that explains, the
mascot reacting), each with timestamps; (3) the opening of each (frame 0 to 3 s) in detail; (4) the rejected v2 cut set side by side with v1
at the same phone size: the concrete differences that most likely made the owner say no (be specific and honest: composition, motion,
camera, story staging, colour, character animation, energy, transitions); (5) a list of DO / DON'T for the new v2 film. Put the contact
sheet paths (scratch) in the doc. At most ~240 lines. Commit it.`, { effort: 'max', label: 'teardown', phase: 'Understand' }),
  () => agent(`${CTX}
YOU WRITE THE TOOLKIT INVENTORY: what the house code offers to build a FINISHED film at v1 quality, fast and reliably, and how v1 was put
together. Read ${V}/docs/ENGINE.md, ${V}/docs/SHARED_SETS.md, ${V}/docs/SHARED_PROPS.md, ${V}/docs/CINE.md, ${V}/docs/EDGES.md, ${V}/docs/QA.md,
${V}/docs/mascot.md, ${V}/docs/G5_BLOCKING.md (the film shell pattern), ${V}/docs/sound_plan.md and skim the code: ${V}/src/lib (Film, World,
Ink, Fill, cine, kit, Person/people, mascot, edges, Captions, stage, persp, tod, motion), ${V}/src/scenes (v1's scenes and shared sets:
shared/sets/*, catalog, life, rows), ${V}/src/Main.tsx / Root (how v1's compositions are wired), ${V}/src/v3/film (the newest dense sets and the
v3 kit: what is generic and reusable, e.g. Wire3 birds, movers), ${V}/audio/tools (music beds and SFX synthesis), ${V}/scripts (render-frames,
sheet.sh, qa/gate_check.py, qa/density.py, film_captions.py, g5_scaffold.py). Render ONE contact sheet of the v1 shared sets and the
mascot at phone size (find their dev/sheet compositions, e.g. a SharedSets preview or MascotSheet) into ${SCR}/toolkit/ and look at it.
Write ${V}/docs/v2/direction/toolkit.md: (1) how a film is wired (entry, Film sequencer, scenes, captions, voice, sfx, edges/paper on/off,
60 fps); (2) every reusable SET and PROP with what it shows, its file, and how dense/alive it is out of the box (which could serve a story
about a tech company, a person's home, a government building, a newsroom, a city at night...); (3) people/crowds, the mascot (poses,
actions, API), ambient life pieces (birds, clouds, traffic, steam, windows), camera tools (ShotCam, multiplane, persp), transitions
(wipers, match cuts, unbuild loop); (4) the music beds and SFX available and how to make new ones; (5) QA tools and the exact commands;
(6) gaps: what a fresh v2 film would have to build new; (7) render times you measured (one 2 s still/clip) to plan a full 1080x1920 60 fps
render. Put the sheet path in the doc. At most ~240 lines. Commit it.`, { effort: 'max', label: 'toolkit', phase: 'Understand' }),
])
return { teardown, toolkit }

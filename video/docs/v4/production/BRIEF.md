# Video 4 production: the shared brief (2026-10-30)

**The owner, verbatim:** "Okay I think we have everything we need to actually start production of the video 4 / I think
we have a voice sound , visual script, we have made a collection and a guideline on the composition of scenes and
transitions, we made a lot of guidelines and recipes on visual part and style, etc / Go ahead and start working on the
video 4, make sure to refresh the repo to take the latest context and the guidelines and recipes and references / Make
sure to parallelize the work between subagents and subthreads if you need / Make sure to give me periodic updates with
what's been cooked - visuals, videos if done". This is PRODUCTION (the full gates), not an iteration.

**Where video 4 stands** (`video/docs/v4/README.md`, HANDOFF 2e): G0 topic, G1 script, G2 voice LOCKED
(`video/public/v4/voice.wav`, 42.24 s; `voice_words.json`); G2.5 the visual script v2 (`video/docs/v4/visual/VISUAL_SCRIPT.md`)
with what folds in before G3: `visual/STYLE_ADJUSTMENTS.md` (owner-approved), `visual/COMPOSITION_PASS.md` (the
composition-and-motion pass from `video/docs/look/COMPOSITION_SHOTS.md`; a FIRST DRAFT whose critic and fix pass run in
the study session and land on this branch: never edit COMPOSITION_PASS.md, fold it), the sync plan
(`video/docs/look/SOUND_SYNC.md` §4). The look: painter v7 (`video/docs/studies/2026-10-28_city_posters/paint_test/`),
the dark key T3 (`video/docs/look/ORGANIC.md` §8), PAINTED PIECES (`video/docs/look/PAINT_RECIPES.md`), the people in
use (`video/docs/look/PEOPLE_DESIGN.md` top: hair v4, open eyes, the rebuilt bodies), the words on screen
(`video/docs/look/TYPE_GUIDE.md`, PICKED). Open owner questions on the visual script (the un-draw after the hook; the
giant computer's size) and the pass's one plain cut on "But": decide them under the owner's hand-over (playbook,
Process: delegated calls) and list each call with its reason for the owner.

**The gates now** (`video/docs/PIPELINE_V2.md`): G2.5 lock -> G3 the animated sketchbook (`video/docs/G3_ANIMATIC.md`:
monochrome, 60 fps, every move, join and key action PLAYED with real timing; one 540p60 MP4 of the whole reel with
the voice and captions) -> the owner's G3 lock -> G4 a 6-8 s look clip in the final style -> G5 the build. W1 (the
world bible) runs beside G2.5 and feeds G3's tiers and rigs and G4's palette.

**Every agent:** reads the doc order in CLAUDE.md (owner's words > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC /
G5_BLOCKING > look/*.md); writes its files from its FIRST step and updates them as it goes (a usage limit can stop it at
any moment); returns at most 3 short lines; never runs a git command that changes the index or history (the
orchestrator commits); starts no agents (if it ever does, they run at max effort); renders one at a time on the shared
CPUs (`node scripts/render-frames.mjs ...`, from `video/`); never edits another lane's files (named in its brief).

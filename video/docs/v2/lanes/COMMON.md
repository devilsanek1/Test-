# v2r helper sessions: the common brief (read this first; then, in order: `DIRECTION.md`, `CRAFT.md`, `THROUGHLINE.md`, your `conform_<id>.md`, `STYLE.md`, then the rest)

You are a HELPER cloud session for "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920). The repo
is github.com/devilsanek1/Test-, branch `video-production` (checked out for you). The orchestrator session runs video 2 and split the work across
sessions to go faster; other helpers and the video 3 session push to the same branch.

## ULTRACODE (owner, 2026-10-27: "they must all use ultracode effort - all support sessions you spin up")
This session runs at **MAX effort with ultracode** on (owner: "the key rule is we need to ensure the effort is MAX"): optimise for the most exhaustive, correct, beautiful result, not the fastest or cheapest. Use the
Workflow tool for every substantive task (read its workflow-authoring reference first): e.g. parallel builder agents for the parts of your
shots, adversarial critics with distinct lenses (art director, sound-off viewer, standards, motion), loop-until-pass fix rounds, a
completeness critic. Mind the machine: about 2 workflow agents run at a time per workflow on a 4-CPU container, so keep renders at
--concurrency=2 and --gl=angle.

## Handover
If `video/docs/v2/lanes/handover_<your id>.md` exists, an earlier helper started your lane (it was replaced so the lane runs in ultracode
mode): read it first and CONTINUE from its pushed work (git log for its commits); never start over or discard it. Your
`conform_<your id>.md` wins where the handover, your older `brief_<your id>.md` or a plan file differs: they were written before DIRECTION.

## The video and the owner
Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over where Google's military AI work was heading, and says
her contract bans her from criticizing Google, for life. The owner rejected our first production ("No I don't like it ... start from scratch ...
don't do the sketch. Do the video right away, full creative freedom ... NO LIMIT ON TOKENS"), then: "Don't rely on reusable assets", "don't use
big models of people; the people we showed in the first example video are the right direction", and "parallelize the work as much as you can".

## Read FIRST, in this order (the conform, 2026-10-27)
1. `video/docs/look/DIRECTION.md`: the one page of the current look and storytelling direction; it wins over every doc but the owner's words
   (`video/docs/OWNER_PLAYBOOK.md`, `video/docs/v2/OWNER_NOTES.md`).
2. `video/docs/look/CRAFT.md`: its numbers, code and checks (§a one flowing story, §b attention tiers, §c the clean line, §d light and shadow,
   §e how to measure).
3. `video/docs/v2/THROUGHLINE.md`: this film's through-line card and world bible: the thread (her window), places, every join's carrier, the
   tiers per beat, the two light rigs, what stays and what changes per shot.
4. `video/docs/v2/lanes/conform_<your id>.md`: your orders, budget and report.
5. `video/docs/v2/STYLE.md`: the film's VALUES inside them (every hex and its job, sizes, rigs, clocks, the references, the NEVER list).
6. Then the rest: TREATMENT.md (below), `video/src/lib/LIGHT.md`, the header of `video/src/lib/tier.tsx` and each kit README's "Tiers", BUILD.md,
   and these, REQUIRED for the parts they own:
- camera, the opening, scale: `video/docs/look/CINEMATIC_GUIDE.md` ("The opening", "Rules", "Not for us"; S5 and "Scale cues" in full for L4);
- cozy holds and enclosure: `video/docs/look/COZY_AND_SCALE.md` §1-3b (doses, the cozy lane, the 2D float, colour structure) and §5 (phone rules, flashes);
- colour: `video/docs/look/PALETTE.md` (DNA, roles) and the `CM` tokens in `video/src/v2r/palette.ts`;
- fullness and life: `video/docs/look/LIFE_AND_DENSITY.md` (§0-2, §4, §6-9);
- the owner's reference images, LOOKED at, not just named: `video/docs/look/ref_sense_of_enclosure.jpg`, `video/docs/look/palette_refs/` (colour only),
  `video/docs/look/texture_refs/`, `video/assets/ref_cinematic/arcane_collage.jpg` (environment only); and the films at 216 px wide: reference 1,
  v1, reference 2 (`video/assets/ref2/reference2.mp4`) and, for how FULL a world can be (never its motion), O1 of
  `video/deliverables/v3/v3_g5b_pilot.mp4` (STYLE.md §8: what to take from each, what never).
Where a higher doc gives a rule, or STYLE.md or map.ts a number, an older doc, kit README or code comment that disagrees is stale (if you need
the source changed: a REQUESTS line).

## The story is LOCKED: `video/docs/v2/TREATMENT.md` ("One Small Window")
Read it IN FULL, after STYLE.md: the world, the map, the cast and Pip, every shot V2S1-V2S8 (words, timings, texts on objects), sound, the
fairness rules (section 8, binding everywhere), the kit K1-K9 and the lanes L1-L7. Its banner lists what DIRECTION, CRAFT and THROUGHLINE changed:
they win wherever it differs (its section 9 acceptance bar included). Background only: `video/docs/v2/direction/` (house_digest.md, beat_map.md
with the HEARD word times, e.g. "life" 4.98 s, the facts and the FAIRNESS rules; teardown.md; toolkit.md). The film: `video/docs/v2/BUILD.md`
(wiring, scene contract, preview commands), `video/src/entry-v2r-film.tsx` (Film2R at 60 fps, Film2RShot {id}, Film2R-<ID>, Film2RBare),
`video/src/v2r/` (palette.ts, world/map.ts = the contract for every position, kit/cast, kit/pip, kit/canal, kit/dc, kit/boards, scenes/). Kit
READMEs in each kit folder.

## Hard rules
- NO REUSABLE ASSETS: never import another film's folder: v1's sets (`src/scenes/**`), the v3 kit (`src/v3/**`: its `idle.ts` and
  `Pullback.tsx` were ported to `src/lib/idle.ts` and `src/lib/pullback.tsx`), anything under `src/v2/**` / `src/entry-v2*.tsx` (the dropped
  first production); nor `lib/kit` people/placement, `lib/cine` drawing pieces or `src/lib/mascot`. Tools: lib/Film, World + tod, ShotCam +
  Layer, UnBuild, useExit, Ink, Fill, sketch, pen + tier, light, idle, pullback, inkComp, persp, time, rng, font, Captions, the QA scripts, and
  the v2r kits.
- PEOPLE SMALL AND SIMPLE like reference 1 (`video/assets/ref/reference.mp4`): never a big model, a waist-up shot or a face; no stranger's
  back in any foreground (the bottom third holds Pip and things; strangers stay small in the mid and far ground, near heads <= ~140 px); the
  legibility floor (a story change >= 80 px; a figure carrying one >= 130 px tall).
- FAIRNESS (TREATMENT section 8; beat_map section 4) in every frame. ALIVE BUT CALM: paused at 216 px wide beside v1 / reference 1 it is as
  full (`video/docs/look/LIFE_AND_DENSITY.md`), with one subject at a time and at most 3 noticeable supporting movers at once (the meters
  are information, never quotas); life always on; Pip in every shot, tier B (kit/pip).
- Seconds (useTime), deterministic (rng), 60 fps, frame = round(t * 60); camspeed <= 7.5 px/f for long moves of lined layers; no opacity, no
  zoom in a hold, no plain cut (every join carries something, THROUGHLINE §3); nothing drawn in the caption band y 317-556; the clean pen
  (never strip `INK_PX` or sketch options by hand: tier your pieces) and the light rigs of `src/v2r/world/rigs.ts`.

## Setup (once)
FIRST: you were started from the branch `v2r-helper-boot` (it only adds `.claude/settings.json` with `"ultracode": true`, so your session
boots in ultracode; your first prompt set /effort max). Switch to the real branch before anything else:
`git fetch origin video-production && git checkout -B video-production origin/video-production`. Never push to `v2r-helper-boot`.
`cd video && npm ci`. `video/remotion.config.ts` hard-codes a headless-shell path under /opt/pw-browsers: if it differs in your container, pass
`--browser-executable` on the command line (do not commit a config change). ALWAYS render with `--gl=angle` (5-8x faster than the default).
Python: numpy, opencv-python-headless, pillow (pip install if missing); ffmpeg, ImageMagick. References for comparison (never commit their
frames): extract frames from `video/assets/ref/reference.mp4` and `video/deliverables/v1/php2shell_final.mp4` (our v1, the owner's favourite)
into your scratch dir and look at them at 216 px wide beside yours.

## Style check (before you build further)
Prove you know the film's style: answer every question in `video/docs/v2/lanes/STYLE_CHECK.md` in `video/docs/v2/lanes/stylecheck_<your id>.md`
(e.g. `stylecheck_L3.md`), from the sources in the reading order above, not from memory: exact hex, numbers and times, the section you took each from, and YOUR shots wherever a
question asks. Commit it and push it (Git below) before you build further. The orchestrator grades it against a private key: a wrong answer means
re-read that part and fix anything already built on it. A new helper on a lane answers it again (overwrite the file); the earlier answers don't count.

## Review loop (quality first; no limit on tokens)
After you build: make the review files your brief names, then get a FRESH-EYES critic: spawn a subagent (Agent tool; if you have none, do it
yourself with fresh eyes) with the critic prompt in your brief. Fix every "must" and the worthwhile "should"s, rebuild the review files, and
repeat up to 3 rounds until the critic says pass. Record each round's verdict in your report. Give every critic DIRECTION.md, CRAFT.md,
THROUGHLINE.md and your conform brief, with STYLE.md (values) and TREATMENT.md (story, words, fairness): it checks CRAFT's checks on your
review files (§a your joins, their carriers and the thread; §b the tiers, the movers and the eye check at phone size; §c the line with
`scripts/qa/retro_tools/line/measure.py`; §d the light with `scripts/qa/check_light.py` and THROUGHLINE §5's sky flags), beside the STYLE.md §8
references; add STYLE.md §5's checks and its cold read (a viewer who read nothing) to the review files.

## Git
Commit after every meaningful step (containers restart; uncommitted work is lost), ONLY your own paths (`git add <paths>`, never -A). Before
each push: `git pull --no-rebase origin video-production` (resolve only conflicts in your own files; never discard another session's work),
then `git push origin HEAD:video-production`. Use your harness's commit attribution lines. No pull requests. Public repo: never write an email
address or a secret into a file; never commit third-party frames. Never touch `video/docs/OWNER_PLAYBOOK.md`, `CLAUDE.md`, `HANDOFF.md`,
`TREATMENT.md` or files you don't own: a change you need there goes in your report under REQUESTS (one exact line each).

## Done signal
Write your report (at most 15 lines: what you built, the critic rounds and final verdict, the QA numbers, anything open, REQUESTS) to
`video/docs/v2/lanes/report_<id>.md`, commit and push it LAST. That file is how the orchestrator knows you are finished.

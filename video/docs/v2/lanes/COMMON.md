# v2r helper sessions: the common brief (read this first, then your own brief_<id>.md)

You are a HELPER cloud session for "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920). The repo
is github.com/devilsanek1/Test-, branch `video-production` (checked out for you). The orchestrator session runs video 2 and split the work across
sessions to go faster; other helpers and the video 3 session push to the same branch.

## The video and the owner
Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over where Google's military AI work was heading, and says
her contract bans her from criticizing Google, for life. The owner rejected our first production ("No I don't like it ... start from scratch ...
don't do the sketch. Do the video right away, full creative freedom ... NO LIMIT ON TOKENS"), then: "Don't rely on reusable assets", "don't use
big models of people; the people we showed in the first example video are the right direction", and "parallelize the work as much as you can".

## The direction is LOCKED: `video/docs/v2/TREATMENT.md` ("One Small Window")
Read it IN FULL: the world, the map, the palette "10 Canal Mint", the cast and Pip, every shot V2S1-V2S8, sound, the kit K1-K9, the lanes L1-L7,
the acceptance bar per shot (section 9). Background only: `video/docs/v2/direction/` (house_digest.md, beat_map.md with the HEARD word times, e.g.
"life" 4.98 s, the facts and the FAIRNESS rules; teardown.md; toolkit.md). The film: `video/docs/v2/BUILD.md` (wiring, scene contract, preview
commands), `video/src/entry-v2r-film.tsx` (Film2R at 60 fps, Film2RShot {id}, Film2R-<ID>, Film2RBare), `video/src/v2r/` (palette.ts,
world/map.ts = the contract for every position, kit/cast, kit/pip, kit/canal, kit/dc, kit/boards, scenes/). Kit READMEs in each kit folder.

## Hard rules
- NO REUSABLE ASSETS: never import v1's sets (`src/scenes/**`), the v3 kit (`src/v3/**`, except `src/v3/film/kit/idle.ts` and `Pullback.tsx`),
  `lib/kit` people/placement, the cine generators, `src/lib/mascot`, anything under `src/v2/**` / `src/entry-v2*.tsx` (the dropped first
  production) or `src/v3/film/kit/util.tsx`. Tools: lib/Film, World + tod, ShotCam + Layer, UnBuild, useExit, Ink, Fill, sketch, inkComp,
  persp, time, rng, font, Captions, the QA scripts, and the v2r kits.
- PEOPLE SMALL AND SIMPLE like reference 1 (`video/assets/ref/reference.mp4`): never a big model, a waist-up shot or a face; near head-backs at
  most ~140 px wide; the legibility floor (a story change >= 80 px; a figure carrying one >= 130 px tall).
- FAIRNESS (TREATMENT section 8; beat_map section 4) in every frame. FEEL ALIVE: paused at 216 px wide beside v1 / reference 1 it is as full
  (`video/docs/look/LIFE_AND_DENSITY.md`); life always on; Pip in every shot (kit/pip).
- Seconds (useTime), deterministic (rng), 60 fps, frame = round(t * 60); camspeed <= 7.5 px/f for long flat-ink moves; no opacity, no zoom in a
  hold; nothing drawn in the caption band y 317-556.

## Setup (once)
`cd video && npm ci`. `video/remotion.config.ts` hard-codes a headless-shell path under /opt/pw-browsers: if it differs in your container, pass
`--browser-executable` on the command line (do not commit a config change). ALWAYS render with `--gl=angle` (5-8x faster than the default).
Python: numpy, opencv-python-headless, pillow (pip install if missing); ffmpeg, ImageMagick. References for comparison (never commit their
frames): extract frames from `video/assets/ref/reference.mp4` and `video/deliverables/v1/php2shell_final.mp4` (our v1, the owner's favourite)
into your scratch dir and look at them at 216 px wide beside yours.

## Review loop (quality first; no limit on tokens)
After you build: make the review files your brief names, then get a FRESH-EYES critic: spawn a subagent (Agent tool; if you have none, do it
yourself with fresh eyes) with the critic prompt in your brief. Fix every "must" and the worthwhile "should"s, rebuild the review files, and
repeat up to 3 rounds until the critic says pass. Record each round's verdict in your report.

## Git
Commit after every meaningful step (containers restart; uncommitted work is lost), ONLY your own paths (`git add <paths>`, never -A). Before
each push: `git pull --no-rebase origin video-production` (resolve only conflicts in your own files; never discard another session's work),
then `git push origin HEAD:video-production`. Use your harness's commit attribution lines. No pull requests. Public repo: never write an email
address or a secret into a file; never commit third-party frames. Never touch `video/docs/OWNER_PLAYBOOK.md`, `CLAUDE.md`, `HANDOFF.md`,
`TREATMENT.md` or files you don't own: a change you need there goes in your report under REQUESTS (one exact line each).

## Done signal
Write your report (at most 15 lines: what you built, the critic rounds and final verdict, the QA numbers, anything open, REQUESTS) to
`video/docs/v2/lanes/report_<id>.md`, commit and push it LAST. That file is how the orchestrator knows you are finished.

# v2r helper sessions: the common brief (read this first, then `video/docs/v2/STYLE.md`, then your own brief_<id>.md)

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
mode): read it first and CONTINUE from its pushed work (git log for its commits); never start over or discard it.

## The video and the owner
Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over where Google's military AI work was heading, and says
her contract bans her from criticizing Google, for life. The owner rejected our first production ("No I don't like it ... start from scratch ...
don't do the sketch. Do the video right away, full creative freedom ... NO LIMIT ON TOKENS"), then: "Don't rely on reusable assets", "don't use
big models of people; the people we showed in the first example video are the right direction", and "parallelize the work as much as you can".

## Read FIRST: the style, `video/docs/v2/STYLE.md` (before TREATMENT.md)
STYLE.md is the film's one style page: every colour (exact hex and its job), the line, people and Pip, fullness and life, the camera, captions and
text, the references and what to take from each, the NEVER list, and the conflicts between older documents, settled. Read it IN FULL before
TREATMENT.md and before you touch a pixel. Where it gives a number, an older doc, kit README or map comment that disagrees is stale (if you need the
source changed: a REQUESTS line). Then these are REQUIRED reading (not background) for the parts they own:
- camera, the opening, scale: `video/docs/look/CINEMATIC_GUIDE.md` ("The opening", "Rules", "Not for us"; S5 and "Scale cues" in full for L4);
- cozy holds and enclosure: `video/docs/look/COZY_AND_SCALE.md` §1-3b (doses, the cozy lane, the 2D float, colour structure) and §5 (phone rules, flashes);
- colour: `video/docs/look/PALETTE.md` (DNA, roles, texture and lines) and the `CM` tokens in `video/src/v2r/palette.ts`;
- fullness and life: `video/docs/look/LIFE_AND_DENSITY.md` (§0-2, §4, §6-9);
- the owner's reference images, LOOKED at, not just named: `video/docs/look/ref_sense_of_enclosure.jpg`, `video/docs/look/palette_refs/` (colour only),
  `video/docs/look/texture_refs/`, `video/docs/look/ref_animated_sketchbook.png`, `video/assets/ref_cinematic/arcane_collage.jpg` (environment only);
  and the films at 216 px wide: reference 1, v1, reference 2 (`video/assets/ref2/reference2.mp4`) and the density bar
  `video/deliverables/v3/v3_g5b_pilot.mp4` (STYLE.md §8: what to take from each, what never).

## The direction is LOCKED: `video/docs/v2/TREATMENT.md` ("One Small Window")
Read it IN FULL, right after STYLE.md: the world, the map, the palette "10 Canal Mint", the cast and Pip, every shot V2S1-V2S8, sound, the kit
K1-K9, the lanes L1-L7, the acceptance bar per shot (section 9). Background only: `video/docs/v2/direction/` (house_digest.md, beat_map.md with
the HEARD word times, e.g. "life" 4.98 s, the facts and the FAIRNESS rules; teardown.md; toolkit.md). The film: `video/docs/v2/BUILD.md`
(wiring, scene contract, preview commands), `video/src/entry-v2r-film.tsx` (Film2R at 60 fps, Film2RShot {id}, Film2R-<ID>, Film2RBare),
`video/src/v2r/` (palette.ts, world/map.ts = the contract for every position, kit/cast, kit/pip, kit/canal, kit/dc, kit/boards, scenes/). Kit
READMEs in each kit folder.

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
(e.g. `stylecheck_L3.md`), from the sources, not from memory: exact hex, numbers and times, the section you took each from, and YOUR shots wherever a
question asks. Commit it and push it (Git below) before you build further. The orchestrator grades it against a private key: a wrong answer means
re-read that part and fix anything already built on it. A new helper on a lane answers it again (overwrite the file); the earlier answers don't count.

## Review loop (quality first; no limit on tokens)
After you build: make the review files your brief names, then get a FRESH-EYES critic: spawn a subagent (Agent tool; if you have none, do it
yourself with fresh eyes) with the critic prompt in your brief. Fix every "must" and the worthwhile "should"s, rebuild the review files, and
repeat up to 3 rounds until the critic says pass. Record each round's verdict in your report. Give every critic STYLE.md with TREATMENT.md (it
judges against both, beside the STYLE.md §8 references), and add STYLE.md §5's checks and its cold read (a viewer who read nothing) to the review files.

## Git
Commit after every meaningful step (containers restart; uncommitted work is lost), ONLY your own paths (`git add <paths>`, never -A). Before
each push: `git pull --no-rebase origin video-production` (resolve only conflicts in your own files; never discard another session's work),
then `git push origin HEAD:video-production`. Use your harness's commit attribution lines. No pull requests. Public repo: never write an email
address or a secret into a file; never commit third-party frames. Never touch `video/docs/OWNER_PLAYBOOK.md`, `CLAUDE.md`, `HANDOFF.md`,
`TREATMENT.md` or files you don't own: a change you need there goes in your report under REQUESTS (one exact line each).

## Done signal
Write your report (at most 15 lines: what you built, the critic rounds and final verdict, the QA numbers, anything open, REQUESTS) to
`video/docs/v2/lanes/report_<id>.md`, commit and push it LAST. That file is how the orchestrator knows you are finished.

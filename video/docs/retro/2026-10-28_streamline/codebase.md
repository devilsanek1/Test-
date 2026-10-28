# Codebase and automation hygiene (streamlining review, 2026-10-28)

Reviewer: codebase (`BRIEF.md`). Analysis only: nothing in the repo was changed. The numbers come from an import graph
of `video/src`, text-similarity runs over the workflows, and typechecks run on a scratch copy (`src`, `tsconfig.json`,
the JSON it imports, the project's own lockfile installed with `npm ci`). Each timing is 2 runs on this 4-core box.

## 1. How it works today

**`video/src`: 651 files (.ts/.tsx/.json), 164k lines; 22 `entry-*.tsx` at the root, plus v1's index/Root/FilmRoot/Main.**
I traced each film's entries through its imports (TypeScript resolution, including v1's `require.context`):

| Code group | Lines reached only by this group | Status |
|---|---|---|
| v1 (`index.ts`, `entry-film.ts`, `src/scenes`, `src/dev`, `src/data`) | 169 files, 48.4k | delivered and posted |
| v2's first production (`src/v2`, `entry-v2*.tsx`) | 48 files, 13.0k | dropped (v2r restarted it) |
| v2r (13 entries) | 223 files, 53.0k | in flight (the G7 master is with the owner) |
| v3 (4 entries) | 64 files, 19.6k | DONE (posted and closed 2026-10-28) |
| **shared by v2r and v3 (the live engine)** | 36 files, 10.8k | `lib/`: Film, Captions, World, pen, tier, light... |
| imported by no entry at all | 83 files, 12.4k | 45 are v3's old G5b panels (`v3/film/scenes/S4..S16, O1`, ~10k) |

- **Layout differs per film, so every tool needs per-film flags.** v3: `v3/film/{palette,look,Film3,Cover3,BoardPanel}`,
  `v3/film/scenes/`, compositions Film3/Film3Final/Cover3/Film3Shot/Film3-<ID>/Film3Seams. v2r: `v2r/palette.ts`,
  `v2r/pen.ts`, `v2r/scenes/` (outside `film/`), Film2R{draftLabel}/Film2RShot/Film2R-<ID>/Film2RBare, its cover in a
  separate entry, and no Seams composition. The film entries are renamed copies (`entry-v3-film.tsx` vs `entry-v2r-film.tsx`).
- **Copied code is rare (2.3 % of 12-line windows) and concentrated:** `lib/light.tsx` and `v3/film/kit/Light.tsx` (755
  shared windows, 1,197 and 1,270 lines); `lib/idle.ts` and `v3/film/kit/idle.ts` (235); `lib/pullback.tsx` and
  `v3/film/kit/Pullback.tsx` (47). These are ports to `lib` where v3 kept its own copy. Also within v2r,
  `kit/dc/{valley,pentagon}` and `scenes/V2S5_{valley,pentagon}` (111). `BoardPanel.tsx` is copied by design
  (`v3/film/BoardPanel.tsx:7` "For another video: copy this file").
- **Layering:** `lib/water_samples.ts:4-6` imports from `v2r/`, so the shared lib depends on a film. The G3 engine
  (`v3/SketchReel.tsx` 696 lines, `SketchIcons.tsx` 916, `ShotSketch.tsx`, `board.ts`) lives in a film folder and is
  imported by `entry-v2.tsx:12` and `v2/film/BoardPanel.tsx:11`. That goes against "a film never imports another
  film's folder" (`OWNER_PLAYBOOK.md:141`).
- **Stale code comment:** `v3/film/scenes/index.ts:5-6` still says the old panels are "sets the sequence builders reuse";
  in fact no file imports them.
- **Dead exports:** 174 exported names are never referenced anywhere else (45 of them in `lib`). That is normal API
  slack; not worth a pass.
- **Typecheck health: good.** The project's TypeScript (5.9.3) gives **0 errors in 15-18 s**. Two traps:
  1. This container has no `node_modules`. Here `npx tsc --noEmit` (the command in `ENGINE.md:434`) silently fetched
     TypeScript 6.0.2 and printed 12,041 false errors. v3's lanes saw the same mismatch ("repo-root tsc 6.0.2 shows 196
     old lib-target errors", `v3/rework_reports/final_lanes.md:21`).
  2. `tsconfig.json` has no `include`, so it also checks `video/review/**/tools/*.ts` and all the legacy code.
  `npm ci` takes 3.7 s with a warm cache.

**`video/scripts`: 20 top-level files and 9 folders, 104 code files, no index.** Only `anchor/README.md` and
`qa/retro_tools/README.md` exist; PIPELINE_V2's "Studio toolkit" table is the de-facto index for the gate tools.
- Current tools, all generic and argument-driven: `render-media.mjs`, `render-frames.mjs`, `film_captions.py`,
  `film_chunks.py`, `g5_scaffold.py`, `camspeed.py`, `qa/gate_check.py` (6-8 flags per film), `qa/check_*`,
  `qa/density.py`, `qa/master_sheets.py`, `voice/*`, `coreline.py`, `topic_chart.py`, `autocheckpoint.sh`.
- **v1-only** (none of them is mentioned in a current gate doc):
  - `check-storyboard.py` and `check-storyboard-v3.py`: two lints of v1's storyboard JSONs, at 30 fps. The "-v3"
    suffix means v1's third storyboard, not video 3.
  - `gen-captions.mjs`, `gen-scenes.mjs`, `timewarp.py`, `engine-numbers.mjs`, `anchor/` (8 files).
  - `qa/run_all.sh`, `qa/report.py`, `qa/calibrate.py` and `calib/`.
  - `review/checkin.sh`: rendered check-ins are retired (PIPELINE_V2 rule 8).
- **v1 couplings inside shared tools:**
  - `sheet.sh:33` runs v1's `engine-numbers.mjs --check` on every sheet.
  - `render-frames.mjs:62-67`: its `--entry=auto` falls back to v1's `index.ts` / `entry-film.ts`.
  - `strip.sh:21-22` hard-codes 30 fps.
  - `qa/sheets.sh` defaults to 30 fps.
- `capcheck.mjs` and `capcheck.py` are not duplicates: the first drives the render, the second analyses it.
- Per-film builders: `scripts/v2/` (3 files), `scripts/v3/` (7), `g3demo/` (1).

**`context/workflows`: 95 files.** That is 87 `.js` workflows, 3 `.sh`, 4 brief `.md` files and `INDEX.md` (a log of
runs, not a catalogue of templates).
- **They are run records, not templates:**
  - 81 of 87 carry the run's `-wf_<hash>` suffix.
  - 70 of 87 hard-code one session's scratchpad path, 34 a Claude-Session URL and 34 a date.
  - None imports a shared module (no `import` or `fs` in any of them), and 59 define their own `CTX`.
- **Real copies (8-word-shingle similarity of 0.75 or more): only 3 families, 8 files.** v1's scene-production (×2) +
  scene-polish; `v2r-treatments-1/2/3` (only 10 of 66 lines differ: the parameter pattern works); `v2r-sound` and
  `-sound-draft`.
- **The same gate across films shares almost nothing:** v2 vs v3, the G3 board 3 %, the G5 blocking 4 %, G4 1 %.
  Every film writes its G3-G8 automation from scratch: v3, 17 scripts (168 KB); v2r, 27 files (276 KB).
- PIPELINE_V2 already flags this (`PIPELINE_V2.md:193-196`): v3's G3 board brief is stale, `v3-g5b-rollout` is
  "retired as a template", and "Rebuild the G3 and G5 templates ... before the next video's G3". It has not been done:
  every G3-G8 entry in the toolkit table still points at a `v3-*` run.

**Starting a film's G3 and G5 today:**
- **G3.**
  - A per-film Python builder writes `public/vN/animatic.json`: v2, 617 lines; v3, 1,492 lines over 4 builders;
    g3demo, 218 lines.
  - Of the 20 helper functions repeated across builders, 8 are identical (`rect`, `ell`, `text`, `shape`, `hold`,
    `drawn`, `bezier`, `pts_to`). Generic helpers are 3-42 % of each builder.
  - The G3 entry is copied: `entry-v2.tsx:17` and `entry-v3.tsx:11` set `FPS = 30`, though the G3 reel is 60 fps.
    Only `entry-g3demo.tsx:8` uses 60.
  - The G3 tier-1 tooling (dress, loop, life, carrier, tier, rig, planes) is still unbuilt. Those fields appear 0 times
    in `SketchReel.tsx`, `board_lint.py` and `g5_scaffold.py`, yet `G3_ANIMATIC.md:225` says it must land before the
    next G3.
- **G5.** `g5_scaffold.py` generates `scenes.json`, `scenes/index.ts` and the placeholders. The rest is by hand:
  - transitions it flattens to `cut` are fixed in `scenes.json` (`G5_BLOCKING.md:39`);
  - the entry, `FilmN.tsx` and `BoardPanel.tsx` are copied from v3 ("Then copy ... and change the imports",
    `G5_BLOCKING.md:42`), with a cover, a `look.ts` and a palette module, about 360 lines of boilerplate per film;
  - each tool call repeats the film's paths as flags.

**Docs and repo weight:**
- `video/docs` has 22 root files; about 8 are current.
- The bannered v1-era files total 1.9 MB, including 4 storyboard JSONs (936 KB) and `storyboard_v3.md` (136 KB).
- **Search noise from legacy files:**

  | Search | Hits | From legacy files |
  |---|---|---|
  | "caption" in `video/docs` | 1,826 | 660 (36 %), in v1-era files |
  | `useTime` in `src` | 1,302 | 623 (47 %), in v1 and v2's first production |

- `.git` is 2.8 GB, 97 % of it media (wav 656 MB, mp4 642 MB, png 380 MB, jpg 167 MB). The working tree is 880 MB
  (`deliverables` 395 MB, `assets` 225 MB).

## 2. Findings, ranked by how much they speed up the next film

**F1. G3-G8 workflow templates, each with one parameter block (biggest saving).**
- *What:* each gate's workflow is rewritten per film, 168-276 KB per film (§1).
- *Proposal:* one self-contained template per gate under `context/workflows/templates/`: G3 board, G3 clarity, G4 look
  clip, G5 lanes, G6-G7 review-fix round, assembly.
  - Each starts with a `PARAMS` block: film id, manifest path (F3), core line, palette, lane split, scratch dir
    computed at run time.
  - Each points its agents at doc sections (G3_ANIMATIC, G5_BLOCKING, CRAFT) and the film's
    `docs/vN/briefs/<stage>.md` (already the rule: `PIPELINE_V2.md:156-157`) instead of restating them.
  - Run records keep landing in `context/workflows/` with their hash, and `max_effort.py --lint` still gates them.
  - Build them while rebuilding the stale G3/G5 briefs, which `PIPELINE_V2.md:195` requires anyway.
- *Saving (estimate):* the orchestrator writes about 2-4 KB of parameters per run instead of 15-50 KB of script. At
  ~4 characters per token that is about 35-60k output tokens per film, plus the context those scripts occupy for the
  rest of the session. It also removes stale copied rules, a known failure (`PIPELINE_V2.md:193-195`).
- *Quality risk:* low. The template carries the same rules and gates, and no pixel changes. Test: run the G3 template
  on v4's board; `board_lint.py` and the owner review are the check.
- *Effort:* M. Needs the owner's yes, since it changes how the gates run.

**F2. One home for the G3 toolkit, with tier 1 landed there.**
- *What:* the G3 engine sits in `src/v3/`, the board lint and builders in `scripts/v3/`, and builder helpers are copied
  per film. Tier 1 must be built before v4's G3 anyway.
- *Proposal:*
  - Move `SketchReel`, `ShotSketch`, `SketchIcons` and `board.ts` to `src/lib/g3/`, with a generic `BoardPanel` that
    takes the animatic as a prop. No change to their code.
  - Move `board_lint.py`, `coldread_sheet.py` and the identical builder helpers to `scripts/g3/` (+ a
    `boardkit.py`).
  - Build the tier-1 fields and lints (G3_ANIMATIC §7) in that home, with `g5_scaffold.py` carrying transition,
    carrier, tier and rig through.
- *Saving (estimate):* about 100-150 builder lines and one copied panel file per film, no cross-film import, and the
  60 fps G3 entry comes from the scaffold (F3).
- *Quality risk:* none if it is a pure move. Test: render the same 6 frames of the v3 and g3demo animatics before and
  after; the frame diff must be 0. v2r imports none of these files (checked in the import graph).
- *Effort:* S for the move; M for tier 1 (already owner-approved).

**F3. A film manifest and a single new-film command.**
- *What:* every film hand-copies its shell, and tools take 6-8 path flags.
- *Proposal:*
  - `python3 scripts/new_film.py vN --palette "<name>" --voice-end <s>` writes `src/vN/film/film.json` (entry,
    composition prefix, fps 60, voice, words, animatic, scenes, captions, pages, palette).
  - From v3's set it generates: the G3 entry (60 fps) and the film entry (Film/Final/Cover/Shot/-<ID>/Seams);
    `FilmN.tsx`, `CoverN.tsx` and `look.ts`; a palette stub from `docs/look/palettes.json`; a `scripts/vN/build_board.py`
    stub on `boardkit`; `docs/vN/{OWNER_NOTES,PROGRESS}.md`; and `public/vN/`. After the G3 lock it runs `g5_scaffold`.
  - `gate_check.py`, `render-media.mjs`, `render-frames.mjs`, `film_captions.py` and `film_chunks.py` accept
    `--film vN` and read the manifest. Their flags still win.
- *Saving (estimate):* about 360 lines of hand copying per film, and no more drift: 30 fps G3 entries, flattened
  transitions, v2r without a Seams composition so `gate_check --seam-comp` can't run on it. Briefs say `--film v4`
  instead of repeating paths.
- *Quality risk:* none (generated from existing code). Test: generate a throwaway "vT" from v3's data and diff its
  entry, Film and `scenes.json` against v3's (identical except names); render 3 frames of FilmT and Film3 and check
  the frame diff is 0.
- *Effort:* M. The tool changes wait until v2r ships, because v2r uses those tools.

**F4. Move finished films' code out of `src`, and tag each delivered film.**
- *What:* 74k of `src`'s 164k lines are v1, v2's first production or files no entry imports. Every lib or Film change
  must keep the old films rendering identically: 17 files carry "v1/v3 must render exactly as before", and
  `Film.tsx` has grown 37 optional props.
- *Proposal:*
  - `git tag v1-final v2-first v3-final`. No tags exist today; an old film re-renders from its tag in a worktree.
  - Move v1, v2's first production and v3's 45 dead panel files to `video/archive/<film>/`; v3's film follows once F2
    has moved its G3 engine out.
  - Set `tsconfig` `include: ["src"]`.
  - First cut the couplings: `sheet.sh:33`, `render-frames.mjs` auto entry, `Root.tsx` and `index.ts`.
- *Saving:* the scratch copy, measured, with 0 errors in every case:

  | `src` keeps | Lines | `tsc` |
  |---|---|---|
  | everything (today) | 164k | 15-18 s |
  | without v1, v2's first production and dead v3 | 96.7k | 9.2 s |
  | also without v3's film (its G3 engine kept) | 77.3k | 7.2-9.6 s |

  Plus about 40 % less grep noise in `src`, and the engine no longer has to keep archived films pixel-identical.
  Render bundling is unchanged (each film entry already bundles only its own imports).
- *Quality risk:* none for live films: the trimmed typecheck passes, and v2r imports none of it. Old films stay exact
  at their tags.
- *Effort:* S-M.

**F5. A scripts index, and v1 tools moved to `video/archive/v1/scripts`.**
- *What:* 104 tool files and no index; 13 tools are v1-only; 30 fps defaults remain in shared tools.
- *Proposal:* a `video/scripts/README.md` generated from each tool's docstring first line (`scripts/index.py`, so it
  never drifts); move the v1-only tools (§4); make `strip.sh` and `qa/sheets.sh` read the composition's fps.
- *Saving:* fewer wrong-tool picks and grep hits (estimate).
- *Quality risk:* none. *Effort:* S.

**F6. Move v1-era docs to `video/docs/v1/`.**
- *What:* about 14 of the 22 root docs are v1 history; they are bannered, but agents still `ls` and grep them.
- *Proposal:* move the history (§4) and keep the API docs (ENGINE, EDGES, QA, CINE, mascot) in place, bannered. Also
  rename `CINE.md` to `CINE_KIT.md` (the lib/cine API) so it stops reading like `look/CINEMATIC_GUIDE.md`.
- *Saving:* 36 % fewer "caption" hits in docs greps; 1.07 MB of storyboards out of the default path.
- *Quality risk:* none. Test: a link check showing every `docs/...` path cited in docs, src and scripts resolves.
- *Effort:* S.

**F7. Fresh-session hygiene.**
- *What:* a fresh container has no `node_modules`, so the documented `npx tsc` runs a different compiler.
- *Proposal:* briefs say `npm run typecheck` (it runs the pinned 5.9.3), after one `npm ci` in a SessionStart hook or
  in HANDOFF §5. Helper sessions that need no media pass `create_session`'s `blob_limit_kb`, so they skip the 880 MB
  of media in the working tree.
- *Saving:* minutes per helper session (estimate, not measured here); no false-error hunts.
- *Quality risk:* none. *Effort:* S.

**F8. After v2r ships: layering cleanups.**
- *Proposal:* move `lib/water_samples.ts` into v2r's folder; fold `kit/dc` and `scenes/V2S5_{valley,pentagon}` into
  one copy each; move v2r's 11 orphan QA/dev files to the archive; tag `v2r-final`.
- *Saving:* small. *Quality risk:* none (no change to v2r's renders). *Effort:* S.

## 3. Quick wins vs bigger changes
- **Quick wins (safe now, no quality risk, nothing v2r imports moves):**
  - the git tags for v1, v2's first production and v3;
  - F4's moves of v1, v2's first production and v3's dead panels, plus `tsconfig` `include`;
  - F2's pure move of the G3 engine, with the 0-diff frame test;
  - F5's index;
  - F6's doc moves, with the link check;
  - F7.
- **Bigger changes (need the owner's yes and a test):**
  - F1, the workflow templates: a process change, tested on v4's G3.
  - F3, the manifest and new-film command: tested by the generated "vT" against v3 (0-diff frames); its tool changes
    wait until v2r ships.
  - F2's tier 1: already approved; it is the G3 prerequisite.
- **Order for v4:** F4 and F6 tags/moves → F2 (move, then tier 1) → F3 → F1 (the templates read F3's manifest),
  all before v4's G3. G0-G2 never wait.

## 4. Archive list (moves, never deletions; tag first)
- **Code to `video/archive/v1/src`:** `scenes/`, `dev/`, `data/`, `Main.tsx`, `FilmRoot.tsx`, `Root.tsx`, `index.ts`,
  `entry-film.ts`. Then the v1-only lib pieces, once nothing imports them: `lib/cine/{city,frame,lens,monument,
  persp,props,sky,street,tower,wall,windows,figures,light,state}`, `lib/mascot/{ElephantTimeline,index}`.
- **Code to `video/archive/v2-first/src`:** `v2/`, `entry-v2.tsx`, `entry-v2-film.tsx`, `entry-v2-kit.tsx`.
- **Code to `video/archive/v3/src`:**
  - now: `v3/film/scenes/{O1,S4..S16 and their _* helpers, g5b_panels}.tsx` (45 files) and `v3/film/BoardPanel.tsx`;
  - after F2: the rest of `v3/` except the G3 engine, and `entry-v3*.tsx`.
- **Scripts to `video/archive/v1/scripts`:**
  - `check-storyboard.py`, `check-storyboard-v3.py`, `gen-captions.mjs`, `gen-scenes.mjs`, `timewarp.py`,
    `engine-numbers.mjs` (after `sheet.sh:33`), `anchor/`, `review/checkin.sh`;
  - `qa/run_all.sh`, `qa/report.py`, `qa/calibrate.py`, `qa/calib/`.
  - Keep `qa/beatsync.py`: v2r's TREATMENT uses it.
- **Docs to `video/docs/v1/`:**
  - the storyboards: `storyboard.json`, `storyboard_v2voice.json`, `storyboard_v3.json`, `storyboard_v3_resolved.json`,
    `storyboard_v3.md`;
  - the v1 project files: `theme_proposal.json`, `timing.md`, `WRAPUP.md`, `POSTING_KIT.md`, `BRIEF.md`,
    `sound_plan.md`, `sound_credits.md`, `scenes/`, `script/`;
  - v1's kit and style docs: `SHARED_SETS.md`, `SHARED_PROPS.md`, `style_bible.md`, `style_bible_ref2.md`,
    `motion_spec.md`, `motion_evidence/`;
  - the 8 v1 images at the docs root.
  - The anchor and storyboard tools above move with them.
- **Workflows:** move v1's runs to `context/workflows/archive/v1/` (engine-*, scene-*, edge-*, kit-*, storyboard-*,
  wrapup-*, hook-*, cut-continuity, inkscale, shared-world-kit), along with `scene-production.bak.js`. Mark
  `v3-g5b-rollout` and `v3-g3-board-cine` "retired" in INDEX. Index the 4 workflows hiding in `docs/v2/lanes/*_tools/`.

## 5. Rejected ideas
- **One shared kit for people, Pip, sets or light variants across films:** against the owner's "no reusable assets"
  (`OWNER_PLAYBOOK.md:138-141`). Only engine primitives are shared.
- **One root registering every film instead of 22 isolated entries:** isolation is deliberate (a half-written lane
  file can't break another film: `render-frames.mjs:5-8`), and one root would bundle every film on each render.
- **Pruning the 174 dead exports, or moving per-film entries into film folders now:** churn in files v2r imports and in
  paths its docs cite, with no speed gain.
- **A workflow "driver" that imports shared JS modules:** no workflow imports anything (0 of 87), so templates must be
  self-contained, with a parameter block.
- **Rewriting git history to drop the media (2.8 GB):** destructive for every other session's clone. Partial clones
  (F7) get the start-up gain without it.
- **Merging `capcheck.mjs` and `capcheck.py`:** they are a renderer and an analyser, not duplicates.

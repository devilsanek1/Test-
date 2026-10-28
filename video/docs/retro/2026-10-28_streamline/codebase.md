# Codebase and automation hygiene (streamlining review, 2026-10-28)

Reviewer: codebase (`BRIEF.md`). Analysis only: nothing in the repo was changed. The numbers come from an import graph
of `video/src`, text-similarity runs over the workflows, and typechecks of a scratch copy (`src`, `tsconfig.json`, the
JSON it imports, the project's lockfile installed with `npm ci`). Timings are 1-2 runs on this 4-core box.

## 1. How it works today

**`video/src`: 651 files (.ts/.tsx/.json), 164k lines; 22 `entry-*.tsx` at the root, plus v1's index/Root/FilmRoot/Main.**
Each film's entries, traced through their imports (TypeScript resolution, including v1's `require.context`):

| Code group | Lines reached only by this group | Status |
|---|---|---|
| v1 (`index.ts`, `entry-film.ts`, `src/scenes`, `src/dev`, `src/data`) | 169 files, 48.4k | delivered and posted |
| v2's first production (`src/v2`, `entry-v2*.tsx`) | 48 files, 13.0k | dropped (v2r restarted it) |
| v2r (13 entries) | 223 files, 53.0k | in flight (the G7 master is with the owner) |
| v3 (4 entries) | 64 files, 19.6k | DONE (posted and closed 2026-10-28) |
| **shared by v2r and v3 (the live engine)** | 36 files, 10.8k | `lib/`: Film, Captions, World, pen, tier, light... |
| imported by no entry at all | 83 files, 12.4k | 45 are v3's old G5b panels (`v3/film/scenes/S4..S16, O1`, ~10k) |

- **Each film has its own layout, so every tool needs per-film flags.** v3 uses `v3/film/{palette,look,Film3,Cover3,
  BoardPanel}` and `v3/film/scenes/` (compositions Film3/Final/Cover3/Shot/-<ID>/Seams). v2r uses `v2r/{palette,pen}.ts`
  and `v2r/scenes/` outside `film/` (Film2R{draftLabel}/Shot/-<ID>/Bare, a separate cover entry, no Seams). The film
  entries are renamed copies of each other.
- **Copied code is rare (2.3 % of 12-line windows).** Where it exists:
  - ports to `lib` that v3 kept its own copies of: `lib/light.tsx` vs `v3/film/kit/Light.tsx` (755 shared windows),
    `idle.ts` (235), `Pullback.tsx` (47);
  - v2r's `kit/dc/*` vs `scenes/V2S5_*` (111);
  - `BoardPanel.tsx`, copied by design (`v3/film/BoardPanel.tsx:7`).
- **The shared lib leans on films.**
  - `lib/water_samples.ts:4-6` imports from `v2r/`.
  - The G3 engine (`v3/SketchReel.tsx` 696 lines, `SketchIcons.tsx` 916, `ShotSketch.tsx`, `board.ts`) lives in v3's
    folder. `entry-v2.tsx:12` and `v2/film/BoardPanel.tsx:11` import it, against "a film never imports another
    film's folder" (`OWNER_PLAYBOOK.md:141`).
  - Minor: `v3/film/scenes/index.ts:5-6` still calls the dead panels reused sets; 174 exports are never referenced.
- **Typecheck health is good:** the project's TypeScript (5.9.3) gives 0 errors in 15-18 s, and `npm ci` takes 3.7 s
  (warm cache). Two traps:
  - Without `node_modules` (as here), `npx tsc --noEmit` (`ENGINE.md:434`) silently fetches TypeScript 6.0.2 and
    prints 12,041 false errors. v3 hit this too (`v3/rework_reports/final_lanes.md:21`).
  - `tsconfig.json` has no `include`, so it also checks `review/**/tools/*.ts` and all the legacy code.

**`video/scripts`: 20 top-level files and 9 folders, 104 code files, no index.** Only `anchor/` and `qa/retro_tools/`
have READMEs; PIPELINE_V2's "Studio toolkit" table stands in for an index.
- **Current tools are generic and take arguments:** `render-media`, `render-frames`, `film_captions`, `film_chunks`,
  `g5_scaffold`, `camspeed`, `qa/gate_check` (6-8 flags per film), `qa/check_*`, `qa/density`, `voice/*`.
- **v1-only tools** (no current gate doc names them): `check-storyboard.py` and `check-storyboard-v3.py`,
  `gen-captions.mjs`, `gen-scenes.mjs`, `timewarp.py`, `engine-numbers.mjs`, `anchor/`, `qa/{run_all.sh,report.py,
  calibrate.py}`, and `review/checkin.sh` (rendered check-ins are retired: PIPELINE_V2 rule 8). Both storyboard
  checkers are v1 lints at 30 fps; the "-v3" is v1's third storyboard.
- **v1 couplings inside shared tools:**
  - `sheet.sh:33` runs `engine-numbers.mjs --check` on every sheet;
  - `render-frames.mjs:64-70` falls back to v1's entries (`--entry=auto`);
  - `strip.sh:21` hard-codes 30 fps, and `qa/sheets.sh` defaults to 30.
- `capcheck.mjs` and `capcheck.py` are not duplicates: one renders, the other analyses.

**`context/workflows`: 95 files that record runs; none is a template.** 87 `.js` workflows, 3 `.sh`, 4 brief `.md`
files, and `INDEX.md`, which is a run log.
- **Run-specific values baked in:** 81 of the 87 carry a run's `-wf_<hash>`; 70 hard-code one session's scratchpad,
  34 a Claude-Session URL, 34 a date. None imports a shared module, and 59 define their own `CTX`.
- **True copies** (8-word-shingle similarity ≥ 0.75) are just 3 families, 8 files: v1's scene-production and
  scene-polish; `v2r-treatments-1/2/3` (only 10 of 66 lines differ, so parameters work); `v2r-sound` and `-sound-draft`.
- **The same gate shares almost nothing across films** (v2 vs v3): G3 board 3 %, G5 blocking 4 %, G4 1 %. v3's G3-G8
  is 17 scripts (168 KB); v2r's restart is 27 files (276 KB).
- `PIPELINE_V2.md:193-196` already orders "Rebuild the G3 and G5 templates ... before the next video's G3": v3's board
  brief is stale and `v3-g5b-rollout` is "retired as a template". This is not done.

**Starting a film's G3 and G5 today:**
- **G3.**
  - A hand-written Python builder per film writes `public/vN/animatic.json`: 617 lines (v2), 1,492 over 4 builders (v3),
    218 (g3demo). 8 helpers are identical copies (`rect`, `ell`, `text`, `shape`, `hold`, `drawn`, `bezier`,
    `pts_to`) and 12 more are variants.
  - The G3 entry is copied at `FPS = 30` (`entry-v2.tsx:17`, `entry-v3.tsx:11`); only `entry-g3demo.tsx:8` uses 60.
  - **The tier-1 tooling (dress, loop, life, carrier, tier, rig, planes) is still unbuilt:** 0 hits in `SketchReel.tsx`,
    `board_lint.py` and `g5_scaffold.py`. `G3_ANIMATIC.md:225` needs it before the next G3.
- **G5.** `g5_scaffold.py` writes `scenes.json`, the registry and the placeholders. The rest is by hand:
  - re-typing the transitions it flattens to cut (`G5_BLOCKING.md:39`);
  - copying the entry, `FilmN.tsx` and `BoardPanel.tsx` from v3 (`G5_BLOCKING.md:42`), plus a cover, `look.ts` and a
    palette: about 360 lines;
  - repeating the film's paths as flags on every tool call.

**Docs and repo weight:**
- The `video/docs` root holds 31 files (+8 images): 8 current, 5 bannered API docs (ENGINE, EDGES, QA, CINE, mascot),
  1 background, and 17 v1 history (2.3 MB with `scenes/`, `script/` and `motion_evidence/`).
- Old films crowd searches: they supply 32 % of "caption" hits in docs (those 17 files), and 47 % of `useTime` hits and
  37 % of "caption" hits in `src` (v1 and v2's first production).
- `.git` is 2.8 GB, 99 % of its 1.94 GB of blobs media; the working tree is 880 MB.

## 2. Findings, ranked by how much they speed up the next film

**F1. G3-G8 workflow templates with a parameter block (biggest saving).**
- *What:* each film rewrites every gate's workflow (168-276 KB per film).
- *Proposal:* one self-contained template per gate in `context/workflows/templates/` (G3 board, G3 clarity, G4 look
  clip, G5 lanes, G6-G7 review-fix, assembly), each opening with a `PARAMS` block (film id, F3's manifest, core line,
  palette, lane split). Agents read doc sections and `docs/vN/briefs/<stage>.md` (already the rule:
  `PIPELINE_V2.md:156-157`) instead of a script restating the rules. Build them while rebuilding the stale G3/G5 briefs
  (`PIPELINE_V2.md:195`); `max_effort.py --lint` still gates every run.
- *Saving (estimate):* 2-4 KB of parameters per run instead of a 15-50 KB script: about 35-60k orchestrator output
  tokens per film, plus the context those scripts occupy. It also ends stale rules being copied forward
  (`PIPELINE_V2.md:193-195`).
- *Risk:* low; no pixels change. Test: run it on v4's G3, judged by `board_lint.py` and the owner's review.
- *Effort:* M; needs the owner's yes.

**F2. One home for the G3 toolkit, with tier 1 built there.**
- *Proposal:*
  - Move SketchReel, ShotSketch, SketchIcons and `board.ts` to `src/lib/g3/` unchanged, plus a generic `BoardPanel`
    (animatic as a prop).
  - Move `board_lint.py`, `coldread_sheet.py` and the identical helpers to `scripts/g3/` (`boardkit.py`).
  - Build tier 1 there, and have `g5_scaffold.py` carry the transition, carrier, tier and rig.
- *Saving (estimate):* about 100-150 builder lines and one copied file per film; no cross-film imports.
- *Risk:* none for a pure move. Test: the same 6 frames of the v3 and g3demo animatics before and after, frame diff 0.
  v2r imports none of these files.
- *Effort:* S for the move; M for tier 1, which is owner-approved and due before v4's G3 anyway.

**F3. A film manifest and one new-film command.**
- *Proposal:* `python3 scripts/new_film.py vN --palette "<name>" --voice-end <s>` writes `src/vN/film/film.json`
  (entry, composition prefix, fps 60, voice, words, animatic, scenes, captions, pages, palette). From v3's set it
  generates the G3 entry at 60 fps, the film entry (Film/Final/Cover/Shot/-<ID>/Seams), `FilmN.tsx`, `CoverN.tsx`,
  `look.ts`, a palette stub (from `palettes.json`), a `build_board.py` stub on `boardkit`,
  `docs/vN/{OWNER_NOTES,PROGRESS}.md` and `public/vN/`, and it runs `g5_scaffold` after the G3 lock. The tools
  (`gate_check`, `render-media`, `render-frames`, `film_captions`, `film_chunks`) take `--film vN`; explicit flags win.
- *Saving (estimate):* about 360 hand-copied lines per film, and no drift. Today's drift: 30 fps G3 entries, flattened
  transitions, and v2r's missing Seams composition, which leaves `gate_check --seam-comp` unusable.
- *Risk:* none. Test: generate a throwaway "vT" from v3's data, diff it against v3, render 3 frames of FilmT vs Film3
  (frame diff 0).
- *Effort:* M; the edits to shared tools wait until v2r ships.

**F4. Tag the delivered films and move their finished code out of `src`.**
- *What:* 74k of the 164k lines are v1, v2's first production, or dead. Every engine change must still keep old films
  identical: `lib/Film.tsx:60` adds props "off by default, so v1 / v2 render exactly as before", and 17 files carry
  that constraint.
- *Proposal:*
  - Tag `v1-final`, `v2-first` and `v3-final` (no tags exist), so an old film re-renders from its tag.
  - Move v1, v2's first production and v3's 45 dead panels to `video/archive/<film>/`; the rest of v3 after F2.
  - Set `include: ["src"]` in tsconfig.
  - First cut the couplings: `sheet.sh:33`, the `render-frames` auto entry, `Root.tsx`, `index.ts`.
- *Saving (measured on the scratch copy, 0 errors each time):*

  | `src` keeps | Lines | `tsc` time |
  |---|---|---|
  | everything (today) | 164k | 15-18 s |
  | all but v1, v2's first production and dead v3 | 96.7k | 9.2 s |
  | also without v3's film (its G3 engine kept) | 77.3k | 7.2-9.6 s |

  `src` searches lose 37-47 % noise, and the old-film tax goes. Bundling is unchanged: each entry bundles only its
  imports.
- *Risk:* none for live films: the trimmed tree typechecks clean and v2r imports none of it. Old films stay exact at
  their tags.
- *Effort:* S-M.

**F5. A scripts index; v1 tools archived.**
- Generate `video/scripts/README.md` from each tool's first docstring line (`scripts/index.py`, so it can't drift);
  move the v1 tools (§4); make `strip.sh` and `qa/sheets.sh` read the composition's fps.
- *Saving:* fewer wrong-tool picks (estimate). *Risk:* none. *Effort:* S.

**F6. v1 history docs to `video/docs/v1/`.**
- Move the 17 history docs (§4); keep the 5 bannered API docs. Rename `CINE.md` to `CINE_KIT.md` so it stops reading like
  `look/CINEMATIC_GUIDE.md`.
- *Saving:* 26-32 % less noise in doc searches. *Risk:* none. Test: a link check that every cited `docs/...` path
  resolves. *Effort:* S.

**F7. Fresh sessions.**
- Briefs say `npm run typecheck` (the pinned 5.9.3, after one `npm ci` via a SessionStart hook or HANDOFF §5), never
  `npx tsc`. Helper sessions that need no media pass `create_session`'s `blob_limit_kb`.
- *Saving:* minutes per helper session (estimate). *Risk:* none. *Effort:* S.

**F8. After v2r ships.**
- Move `lib/water_samples.ts` into v2r; keep one copy of each `kit/dc` / `V2S5_*` pair; archive 11 orphan QA/dev
  files; tag `v2r-final`.
- *Saving:* small. *Risk:* none. *Effort:* S.

## 3. Quick wins vs bigger changes
- **Quick wins (safe now, no quality risk, nothing v2r imports moves):** the tags; F4's moves and the tsconfig change;
  F2's move (0-diff test); F5; F6 (link check); F7.
- **Bigger changes (need the owner's yes and a test):** F1, tested on v4's G3; F3, tested by "vT" vs v3 (0-diff
  frames), with its shared-tool edits after v2r ships; F2's tier 1, already approved and the G3 prerequisite.
- **Order for v4, all before its G3:** the tags and the F4/F6 moves, then F2, F3 and F1 (the templates read F3's
  manifest). G0-G2 never wait.

## 4. Archive list (moves, never deletions; tag first)
- **Code to `video/archive/v1/src`:** `scenes/`, `dev/`, `data/`, `Main.tsx`, `FilmRoot.tsx`, `Root.tsx`, `index.ts`,
  `entry-film.ts`; the v1-only `lib/cine/{city,frame,lens,monument,persp,props,sky,street,tower,wall,windows,figures,
  light,state}`; and `lib/mascot/{ElephantTimeline,index}`.
- **Code to `video/archive/v2-first/src`:** `v2/`, `entry-v2.tsx`, `entry-v2-film.tsx`, `entry-v2-kit.tsx`.
- **Code to `video/archive/v3/src`:** now, the 45 dead panels (`v3/film/scenes/{O1,S4..S16 + helpers,g5b_panels}`)
  and `v3/film/BoardPanel.tsx`; after F2, the rest of `v3/` and `entry-v3*.tsx`.
- **Scripts to `video/archive/v1/scripts`:** `check-storyboard{,-v3}.py`, `gen-captions.mjs`, `gen-scenes.mjs`,
  `timewarp.py`, `anchor/`, `review/checkin.sh`, `qa/{run_all.sh,report.py,calibrate.py,calib/}`, and
  `engine-numbers.mjs` once `sheet.sh:33` drops it. Keep `qa/beatsync.py`: v2r uses it.
- **Docs to `video/docs/v1/`:** `storyboard{,_v2voice,_v3,_v3_resolved}.json`, `storyboard_v3.md`,
  `theme_proposal.json`, `timing.md`, `WRAPUP.md`, `POSTING_KIT.md`, `BRIEF.md`, `sound_plan.md`, `sound_credits.md`,
  `SHARED_SETS.md`, `SHARED_PROPS.md`, `style_bible{,_ref2}.md`, `motion_spec.md`, `scenes/`, `script/`,
  `motion_evidence/`, and the 8 root images.
- **Workflows:** v1's runs move to `context/workflows/archive/v1/` (engine-*, scene-* with the `.bak`, edge-*, kit-*,
  storyboard-*, wrapup-*, hook-*, cut-continuity, inkscale, shared-world-kit). INDEX marks `v3-g5b-rollout` and
  `v3-g3-board-cine` "retired" and lists the 4 workflows in `docs/v2/lanes/*_tools/`.

## 5. Rejected ideas
- **One shared kit for people, Pip, sets or light:** against "no reusable assets" (`OWNER_PLAYBOOK.md:138-141`).
- **One root registering every film:** isolated entries are deliberate (`render-frames.mjs:5-8`), and one root would
  bundle every film on each render.
- **Pruning dead exports, or moving film entries into film folders now:** churn in v2r's files and paths, for no
  speed.
- **A workflow driver that imports shared JS modules:** no workflow imports anything, so templates stay
  self-contained.
- **Rewriting git history to drop the media:** destructive for every clone; F7's partial clones get the gain instead.
- **Merging `capcheck.mjs` and `capcheck.py`:** a renderer and an analyser, not duplicates.

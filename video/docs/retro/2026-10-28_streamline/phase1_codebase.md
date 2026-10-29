# Phase 1, lane C (codebase): PLAN.md item 8

Lane C of `PHASE1_BRIEF.md`. Status: **DONE** (2026-10-29, 19:15 UTC; the moves landed at 10:21 UTC and are committed in
the 10:28-10:38 checkpoints). No live file changed meaning: 26/26 live entries bundle byte-identically before and after,
and 6/6 film frames are byte-identical PNGs. Scratch and the test harness: `/tmp/phase1-C/` (graph, moves, link check).

## (a) The tags (found, not created)

| tag | commit | what is at that commit | why this one |
|---|---|---|---|
| `v1-final` | **`76c166c1`** (2026-10-25 19:47 UTC, "Handoff media: ... v1 produced videos") | v1's code as it rendered the posted film, and the master itself, `deliverables/v1/php2shell_final.mp4` (blob `b40c22f5`, the same file as today's) | v1's last code change is `662993bd` (14:35, the top paper strip removed); the final render ran at 15:50 and `fec11ed6` (15:51) committed its cover. `git diff fec11ed6 76c166c1 -- video/src video/scripts video/public video/assets video/audio video/remotion.config.ts video/package*.json` is empty, and `76c166c1` is the first commit holding the MP4. Posted on 2026-10-25 (HANDOFF §2). `fec11ed6` is the same code without the MP4, if the orchestrator prefers the render commit. |
| `v2-first` | **`56f905df`** (2026-10-27 05:01 UTC, "v2 G5 blocking delivered") | v2's first production at its last gate: the G5 blocking cut `deliverables/v2/v2_g5_blocking.mp4` (added in `617555c2`, 04:58), report and handoff | v2's code last changed at `0a56d6d5` (04:35, the finisher) and is identical here; the next v2 event is the owner's rejection and restart, `e8cd16e1` (08:34). The commits in between touch only v3's own files (`v3/film/kit`, `v3/film/scenes`), nothing v2 imports: this is the state v2's cut was rendered from, at its own delivery commit. |
| `v3-final` | **`79e956c3`** (2026-10-28 12:52 UTC, "v3 master: the hook's words follow the voice") | the last v3 master `deliverables/v3/v3_final.mp4` (blob `7d9ca04f`, today's file) and the code that rendered it, in one commit | v3's own files never changed afterwards; the close `91d10802` (13:29, "It's done") touched only HANDOFF and OWNER_NOTES. HANDOFF §2b: "The owner posted the reworked reel and closed it ... `v3_final.mp4` is the latest master, with the text fixes." **Caveat:** the owner first posted the 11:35 master (`ae7426f3`, blob `c4054a1c`), whose notes ("the text repeats") led to the re-masters `a298e337` (12:20) and `79e956c3`. The later notes (the fixed master viewed on the phone, then "the posted reel's opening") suggest the fixed master was the one finally posted. If the owner says only the first master was ever posted, tag `v3-final` at `ae7426f3` instead (or add `v3-posted-1` there). |

Commands for the orchestrator (`package-lock.json` is the same at all three commits and at HEAD, so one `npm ci` serves
every tag):

```bash
git tag -a v1-final 76c166c1 -m "v1 php2shell as delivered and posted 2026-10-25 (deliverables/v1/php2shell_final.mp4; code of the 15:50 UTC final render)"
git tag -a v2-first 56f905df -m "v2's first production at G5 blocking (2026-10-27 05:01 UTC), before the v2r restart e8cd16e1"
git tag -a v3-final 79e956c3 -m "v3 laptop prices, final master with the text fixes (deliverables/v3/v3_final.mp4), closed 2026-10-28"
git push origin v1-final v2-first v3-final
```

## (b) Code moves to `video/archive/` (plain `mv`, relative layout kept)

**How it was proven safe:** an import graph of the current tree (TypeScript's own module resolution with the project's
tsconfig, plus v1's webpack `require.context`) from all 26 live entries: the 13 `entry-v2r-*`, the 4 `entry-v3*`,
`entry-g3demo`, the 3 `entry-look-*`, the look test `src/look/pt/entry.tsx` and v2r's 4 scene dev entries
(`v2r/scenes/V2S1_row_entry`, `V2S5_entry`, `V2S5_deck_dev`, `V2S5_far_dev`). Before the moves: 389 files reached, none
in a move set, and no file outside a move set imports one. After: the same 389 files, 0 unresolved imports.

| group | moved to | files | lines (TS + JSON) |
|---|---|---|---|
| v1: `src/{scenes,dev,data}/`, `Main.tsx`, `FilmRoot.tsx`, `Root.tsx`, `index.ts`, `entry-film.ts` | `video/archive/v1/src/` | 179 | 45,090 |
| v2's first production: `src/v2/`, `entry-v2.tsx`, `entry-v2-film.tsx`, `entry-v2-kit.tsx` | `video/archive/v2-first/src/` | 51 | 13,071 |
| v3's dead panels: `v3/film/scenes/{O1, S4*-S16*, g5b_panels}` (44 files; none reached by any entry) | `video/archive/v3/src/v3/film/scenes/` | 44 | 9,512 |
| v1-only scripts: `check-storyboard{,-v3}.py`, `gen-captions.mjs`, `gen-scenes.mjs`, `timewarp.py`, `engine-numbers.mjs`, `anchor/`, `review/checkin.sh`, `qa/run_all.sh`, `qa/report.py` | `video/archive/v1/scripts/` | 22 | |

**Kept in place, against codebase.md §4 (each re-verified on today's tree):**
- `src/lib/cine/*`, `src/lib/mascot/*`: never moved (the brief: live code imports `lib/`).
- `src/v3/film/BoardPanel.tsx`: no import reaches it, but it is **used**: it is the G5 template the next film copies
  (`G5_BLOCKING.md`:27 and 42-43; its own header "For another video: copy this file"; `g5_scaffold.py`'s default
  `--board-import ../BoardPanel`). The rest of v3 stays too (its G3 engine is live).
- `scripts/qa/calibrate.py` and `scripts/qa/calib/`: they calibrate the live QA tools (deadframes, framecheck) and are
  live inputs: `docs/look/research/density_numbers.md`:5 runs `density.py ... --scenes scripts/qa/calib/ref1_scenes.json`,
  and `QA.md` (kept "for the tools and what they measure") documents the calibration.
- `scripts/v2/*` (not in §4); `scripts/v2/coldread_sheet.py` no longer runs: it hard-wires `--entry=src/entry-v2.tsx`
  (it only ever rendered v2's own animatic). `capcheck.mjs`, `qa/sheets.sh`, `camspeed.py`'s composition mode and
  `review/edges/tools/*` stay; see the follow-ups.
- `engine-numbers.mjs` moved after checking `sheet.sh`: with or without the file its line printed nothing (the
  check passed; a missing file's error has no "STALE" in it), and lane R has since removed the call.
- The tracked bytecode cache `scripts/anchor/__pycache__/anchorlib.cpython-313.pyc` moved with `anchor/`; `__pycache__/`
  is gitignored, so the 10:28 checkpoint recorded it as deleted (a build artifact; the tag keeps it).

## (c) `tsconfig.json` and `package.json`
- `video/tsconfig.json`: `"include":["src"]` added (set before the moves, so `archive/` is never typechecked); the
  `exclude` is unchanged. It also stops checking `review/**/tools/*.ts` (v1's edge-lab tools, 3 files).
- `video/package.json`: `still` and `render` removed (they bundled `src/index.ts`, which registered v1 only; nothing in
  the repo calls them); `typecheck` kept. `package-lock.json` is untouched (`npm ci` unaffected).

## (d) Scripts index
- New `video/scripts/index.py` writes `video/scripts/README.md`: 105 tools in 18 folders, one line each from the
  tool's own docstring or header comment (its first sentence; a leading usage line and self-name are skipped), folder
  READMEs linked, no dates or timings (it only changes when the tools do). `--check` exits 1 when the README is stale;
  `--stdout` prints it. 9 tools have no header (all in `qa/retro_tools/`, whose README covers them).
- Re-run after the lanes land: `python3 -I scripts/index.py` (lane R's `render/` tools are in today's run; a later
  header change makes `--check` fail until it is re-run).

## (e) Docs moves and the link check
- **To `video/docs/v1/`** (47 files, 2.9 MB): `storyboard{,_v2voice,_v3,_v3_resolved}.json`, `storyboard_v3.md`,
  `theme_proposal.json`, `timing.md`, `WRAPUP.md`, `BRIEF.md`, `sound_plan.md`, `SHARED_SETS.md` (+ its
  `shared_sets_sheet.png`), `SHARED_PROPS.md`, `style_bible{,_ref2}.md`, `motion_spec.md`, `scenes/`, `script/`,
  `motion_evidence/`. **Renamed:** `docs/CINE.md` to `docs/CINE_KIT.md`.
- **Kept, against §4:** `POSTING_KIT.md` (its "Upload checklist (every video)" and export line are live: DIRECTION.md
  25 and 201, OWNER_PLAYBOOK.md 534-535, CRAFT.md 451, v2's POSTING_KIT.md 161), `sound_credits.md` (the licence record of
  the shared sample libraries: v2r's `SOUND.md`:187 and `audio/tools/common.py`:28 cite it), and the 7 images the kept API
  docs show (`cine_demo.png` in CINE_KIT.md, the six `mascot_*.png` in mascot.md). The docs root went from 31 files and 8
  images to 16 files and 7 images (plus the folders).
- **The link check** (scratch `/tmp/phase1-C/linkcheck.py`): every path-like token in every tracked text file
  (Markdown, code, JSON) resolved against the move manifest from the citing file's folder and its ancestors, `video/`,
  the repo root, `/home/user/Test-/...` prefixes, unambiguous bare names (`motion_spec.md`) and unique path suffixes
  (`scenes/g5b_panels.tsx`); the first base where a path exists unmoved wins. **4,478 references to a moved path**
  (re-run at 19:15 UTC, this report included):
  - **309 in live files** (240 lines in 84 files): every one is listed under "Doc changes needed" below, by file and
    line with its new text.
  - 2,312 in history, left as is (records; they resolve at the tags): `context/agent_reports` 1,704 (37 files),
    `context/scratchpad_tools` 153 (46), `context/workflows` runs 86 (22), `context/summaries` 68 (3),
    `context/conversation` 41 (3), `docs/retro` 254 (7: this folder's reviews and reports cite the old paths on
    purpose), `docs/v2/archive` 6 (3).
  - 1,857 inside the moved files themselves, left byte-identical (snapshots: at their tag every path in them resolves):
    `archive/v1` 965 (182 files), `archive/v2-first` 234 (49), `docs/v1` 409 (28), `workflows/archive/v1` 249 (21).
- **Fixed in files I own:** `context/workflows/INDEX.md` (36 rows now point at `archive/v1/`). The one stale line left in
  my `scripts/README.md` (line 90) is generated from `scripts/qa/calibrate.py`'s docstring: it fixes itself when that
  docstring is updated and `index.py` re-run.

## (f) Workflows
- **To `context/workflows/archive/v1/`** (21 runs, 2026-10-24/25): `engine-{toolkit,v2-cinematic,verify-fix}`,
  `scene-polish.js`, `scene-production` (+ the `.bak`), `edge-{hints-a2,loose-paint,treatment-lab}`,
  `kit-{additions-v3,fixes-v3b}`, `storyboard-{panel,v3-remap}`, `wrapup-{cuts,scenes}`, `hook-{build,ideas}`,
  `cut-continuity`, `inkscale-raw-strokes`, `shared-world-kit`, and `script-strawman` (v1's script run, missing from §4).
  Kept: `storyboard-style-research` (2026-10-26, the G3 board style: it matches §4's `storyboard-*` glob but is not v1's)
  and `pipeline-retro` (the post-v1 retro that wrote PIPELINE_V2).
- **`INDEX.md`:** an intro (run records, never templates as is; v1's runs in `archive/v1/`; the 4 lane workflows in
  `docs/v2/lanes/L4_tools/{critics_wf,fix_wf}.js` and `l5_tools/{wf2_s6s7,wf3_lean}.js`); `v3-g3-board-cine` and
  `v3-g5b-rollout` marked **(retired)** with PIPELINE_V2's reasons.

## (g) ENGINE.md
- `video/docs/ENGINE.md`:434 is now `npm run typecheck  # must be clean (the pinned TypeScript; never npx tsc)`
  (outside the generated numbers block).

## Tests

| test | before | after | result |
|---|---|---|---|
| `npm run typecheck`, idle box (3 runs) | 18.6 / 17.2 / 16.6 s; tsc total 16.3 s (check 13.9 s) | 11.6 / 11.0 / 10.4 s; tsc total 10.1 s (check 8.2 s) | 0 errors both; -37 % |
| `npm run typecheck`, same load interleaved (load 7-9; the old tree extracted read-only from `1932757d`; 5 rounds) | 18.8-23.9 s, median 22.2; tsc 18.2 s | 11.4-15.4 s, median 14.2; tsc 12.1 s | 0 errors both; -36 % |
| what tsc reads | 1,181 files, 175,415 TS lines, 13,094 JSON lines | 906 files, 107,548 TS lines, 6,696 JSON lines | -39 % TS lines |
| every live entry bundles (26, webpack without cache; MD5 over all 52 emitted files) | 26 bundles | 26 bundles, at 10:28 and again at 19:06 on the final tree | **26/26 byte-identical** |
| Film2R (`entry-v2r-film`, `{draftLabel:false}`), frames 0 / 1170 / 2280, full size | `6760d047`, `48396b21`, `c7095521` | the same | **identical PNG bytes** (twice) |
| Film3 (`entry-v3-film`), frames 0 / 1230 / 2440, full size | `f9b89dce`, `d3431241`, `6c212d6f` | the same | **identical PNG bytes** (twice) |
| QA defaults on a live clip (`deliverables/v2/lanes/v2r_L4_S5_0.4.mp4`; with vs without v1's `src/data/`) | | | `deadframes.py <clip>` and `framecheck.py <clip>`: identical reports (per-frame CSV byte-identical; only the run's wall time differs). With `--t0 20.6` and no `--scenes`: see "For the production sessions" |

The bundle test is the strongest one: an unchanged bundle means every composition in it renders exactly as before.

## Follow-ups (not done here)
- **Tags:** create them (commands above); then old films re-render at their tag.
- **v1-only tools still in the live tree** (each fails or is v1-only without its data): `audio/tools/cues_from_storyboard.py`
  (default `docs/storyboard_v3_resolved.json`), `review/edges/tools/render-{lab,clips}.mjs` (import `src/dev/EdgeLab`),
  `scripts/v2/coldread_sheet.py`, and the v1 code paths of `capcheck.mjs` (no `--times`), `camspeed.py <CompId>`,
  `beatsync.py`'s defaults: archive them with v1 or generalise them (F2/F3/F5).
- **QA tool defaults:** the `--scenes auto` / `--cuts scenes` defaults and their docstrings still name v1's
  `src/data/scenes.json`; with F3's film manifest they can default to the film's own `scenes.json`.
- F2 (the G3 engine to `lib/g3`, then the rest of v3 to the archive) and F8 (after v2r ships) are untouched.
- A permanent doc link checker (`/tmp/phase1-C/linkcheck.py`, about 200 lines) would serve every later move (F2, F3):
  worth adding to `scripts/ops/` by whoever owns it.

## Doc changes needed

The orchestrator applies these (none touches a pixel). "a -> b" replaces the path `a` with `b` on that line; line
numbers are today's. **v1 commands** below means: the command is right at the `v1-final` tag, so the fix is a note that
it runs there, never a path swap (archived code does not run in place).

**Process docs**
- `HANDOFF.md` (§2 v1, §5, §6, §7):
  - 92-93: `video/docs/script/final_script.md` -> `video/docs/v1/script/final_script.md`; `video/docs/script/sources.md`
    -> `video/docs/v1/script/sources.md` (and its `fact_sheet.md`); `video/docs/timing.md` -> `video/docs/v1/timing.md`.
  - 98-99: "Remotion composition `Main`, entry `src/entry-film.ts`, scenes S01-S12 in `src/scenes/` (archived 2026-10-29:
    `video/archive/v1/src/`, in place at the `v1-final` tag), notes per scene in `video/docs/v1/scenes/`."
  - 109: `video/docs/WRAPUP.md` -> `video/docs/v1/WRAPUP.md`.
  - 395 (the heading of v1's commands, lines 396-405 unchanged): "**v1's commands (30 fps `Main`; v1 is archived since
    2026-10-29: run them at the `v1-final` tag, e.g. `git worktree add --detach /tmp/v1 v1-final && cd /tmp/v1/video &&
    npm ci`):**".
  - 437-443 (the `src/` map): replace the lines for `Main.tsx` / `FilmRoot.tsx` / `entry-film.ts`, `scenes/sceneNN/`,
    `data/` and `dev/` with: "`src/` holds the live code: `lib/` (the engine, edges, mascot, captions, theme, the clean pen
    and its tiers), one `entry-<film>*.tsx` set and one folder per live film (`v2r/`, `v3/`; v3's G3 engine is
    `v3/SketchReel.tsx`), `look/` (the look tests). `archive/` holds finished films' code (`v1/`, `v2-first/`, v3's
    unused panels), byte for byte as moved; each runs at its tag (`v1-final`, `v2-first`, `v3-final`)."
  - 454: `WRAPUP.md` -> `v1/WRAPUP.md`.
  - 465-473 (docs index): `BRIEF.md` -> `v1/BRIEF.md`, `script/` -> `v1/script/`, `timing.md` -> `v1/timing.md`,
    `storyboard_v3.md` / `.json` -> `v1/storyboard_v3.md` / `.json`, `style_bible.md` / `style_bible_ref2.md` ->
    `v1/...`, `motion_spec.md` -> `v1/motion_spec.md`, `motion_evidence/` -> `v1/motion_evidence/`, `CINE.md` ->
    `CINE_KIT.md`, `SHARED_SETS.md` / `SHARED_PROPS.md` -> `v1/...`, `sound_plan.md` -> `v1/sound_plan.md`
    (`ENGINE.md`, `EDGES.md`, `mascot.md`, `QA.md`, `sound_credits.md` stay in the root).
  - 480: `docs/style_bible.md` -> `docs/v1/style_bible.md`; `docs/motion_spec.md` -> `docs/v1/motion_spec.md`.
  - 482: `docs/style_bible_ref2.md` -> `docs/v1/style_bible_ref2.md`; `docs/CINE.md` -> `docs/CINE_KIT.md`.
  - §6 map, `context/`: add "`workflows/archive/v1/`: video 1's runs".
- `video/docs/G5_BLOCKING.md`:
  - 149: "v3: `scenes/g5b_panels.tsx`" -> "v3: `scenes/g5b_panels.tsx`, archived since 2026-10-29 in
    `archive/v3/src/v3/film/scenes/`".
  - 202: the parenthesis "(scripts/strip.sh samples at 30 fps and bundles src/index.ts: use this instead)" is stale twice
    (`src/index.ts` is archived; lane R's `strip.sh` now takes `--entry` and the composition's fps): take lane R's text.
- `video/docs/look/DIRECTION.md`: 166, 167, 177, 202: `style_bible.md` -> `v1/style_bible.md`, `style_bible_ref2.md` ->
  `v1/style_bible_ref2.md`, `motion_spec.md` -> `v1/motion_spec.md`; 186, 203: `CINE.md` -> `CINE_KIT.md`; 203:
  `BRIEF.md` -> `v1/BRIEF.md`. (Or one sentence at 202: "the v1-era docs live in `docs/v1/` since 2026-10-29, except
  `ENGINE.md`, `EDGES.md`, `QA.md`, `CINE_KIT.md`, `mascot.md`".)
- `video/docs/look/LAYOUT.md`: 31: `style_bible.md` -> `v1/style_bible.md`.
- `video/docs/look/research/` (dated research records; mechanical):
  - `arcane.md`: 6: `../../style_bible_ref2.md` -> `../../v1/style_bible_ref2.md`; 8: `../../CINE.md` -> `../../CINE_KIT.md`;
    50: `CINE.md` -> `CINE_KIT.md`.
  - `audit.md`: 3 and 141: `docs/CINE.md` -> `docs/CINE_KIT.md`, `docs/style_bible_ref2.md` -> `docs/v1/style_bible_ref2.md`;
    4: `docs/scenes/S01` -> `docs/v1/scenes/S01`; 42: `scene09/PartA.tsx`, `scene09/hill.tsx`, `scene09/PartB.tsx`,
    `scene08/tower.tsx` are v1's scene files, now under `archive/v1/src/scenes/`; 44: `docs/scenes` -> `docs/v1/scenes`;
    57: `src/dev/CineDemo.tsx` -> `archive/v1/src/dev/CineDemo.tsx`; 64, 80: `CINE.md` -> `CINE_KIT.md`; 142:
    `docs/scenes/S01.md` (+ `S08.md`, `S09.md`, `S12.md`) -> `docs/v1/scenes/...`, `docs/SHARED_SETS.md` -> `docs/v1/SHARED_SETS.md`.
  - `coziness.md`: 44: `style_bible_ref2.md` -> `v1/style_bible_ref2.md`.
  - `density_numbers.md`: 6: `--scenes src/data/scenes.json` -> `--scenes archive/v1/src/data/scenes.json` (a data
    input: this command works as rewritten).
  - `vertical.md`: 78: `../../style_bible_ref2.md` -> `../../v1/style_bible_ref2.md`.
- `CLAUDE.md`, `PIPELINE_V2.md`, `OWNER_PLAYBOOK.md`, `G3_ANIMATIC.md`, `look/CRAFT.md`: no reference to a moved path.

**The kept API docs** (bannered v1-era; one banner line can cover the v1 file names they cite)
- `video/docs/ENGINE.md`: add to the banner: "v1's files this page cites (`src/scenes/`, `src/data/`, `src/dev/`,
  `scripts/anchor/`, `scripts/gen-*.mjs`, `scripts/engine-numbers.mjs`, `docs/storyboard_v3*`) are archived since
  2026-10-29 (`archive/v1/`, `docs/v1/`), in place at the `v1-final` tag." Then: 8: `docs/storyboard_v3.md` ->
  `docs/v1/storyboard_v3.md`; 11: `docs/BRIEF.md` -> `docs/v1/BRIEF.md`; 21 and 343: `docs/CINE.md` -> `docs/CINE_KIT.md`;
  22: `docs/style_bible.md`, `docs/style_bible_ref2.md` -> `docs/v1/...`; 23: `docs/motion_spec.md` -> `docs/v1/motion_spec.md`;
  89 (numbers block header) and 445: `engine-numbers.mjs` is archived, so the block is frozen at v1's theme: say so;
  435-438 (§11): "`scripts/still.sh <Comp> <sec> out.png --entry=src/entry-<film>.tsx` (or lane R's auto entry); v1's
  `Main`, `S01..S13` and dev compositions render at the `v1-final` tag" in place of the auto-entry text naming
  `src/entry-film.ts` and `src/index.ts`; 448, 451-453: v1 commands. Lines 34, 85, 111, 168-170, 206, 218, 262, 306,
  309-311, 424 cite v1's files as API examples: covered by the banner line.
- `video/docs/QA.md`: 19, 24-26, 39, 215, 225: `run_all.sh` and `report.py` are v1's per-scene gate runner, archived in
  `archive/v1/scripts/qa/` (v1 commands; the banner already says a new film's gate is `gate_check.py`); 56, 84, 104, 174:
  "`--scenes auto` / `--cuts scenes` read v1's `src/data/scenes.json`, archived since 2026-10-29: pass
  `--scenes src/<film>/film/scenes.json` (deadframes, framecheck) or `--cuts json:...` / `--cuts scenes:<path>` (beatsync)";
  139: `src/data/captions.json` -> "the film's captions (`--captions <file>`)".
- `video/docs/EDGES.md`: 25: `docs/BRIEF.md` -> `docs/v1/BRIEF.md`; 238: v1 command (`src/index.ts Main`); 440:
  `src/dev/EdgeLab.tsx` -> `archive/v1/src/dev/EdgeLab.tsx` (renders at the `v1-final` tag).
- `video/docs/mascot.md`: 15: `src/dev/MascotSheet.tsx` -> `archive/v1/src/dev/MascotSheet.tsx`; 165 and 183-188: v1
  commands (MascotSheet via `src/index.ts`; the images stay in `docs/`).
- `video/docs/CINE_KIT.md` (renamed, content unchanged): 20: `src/dev/CineDemo.tsx` -> `archive/v1/src/dev/CineDemo.tsx`;
  36-38: v1 commands (CineDemo via `src/index.ts`).

**Other live docs**
- `video/docs/CREATIVE_BRIEF.md`: 151: `docs/script/original_annotated.md` -> `docs/v1/script/original_annotated.md`;
  159, 161: `final_script.md` / `final_script_elevenlabs.txt` -> `v1/script/...`.
- `video/docs/PIPELINE_RESEARCH.md`: 184: `video/docs/WRAPUP.md`, `video/docs/storyboard_v3.md` -> `video/docs/v1/...`.
- `video/docs/voice/evidence.md`: 12: `docs/script/original_annotated.md` -> `docs/v1/script/original_annotated.md`; 14:
  `docs/script/final_script_elevenlabs.txt` -> `docs/v1/script/final_script_elevenlabs.txt`.
- `video/docs/studies/2026-10-28_city_posters/INTEGRATION.md`: 130: `CINE.md` -> `CINE_KIT.md`, `BRIEF.md` ->
  `v1/BRIEF.md`, `style_bible*.md` -> `v1/style_bible*.md`; `content_fit.md`: 22: `docs/scenes/` -> `docs/v1/scenes/`.
- `video/scripts/qa/calib/calibration.md` (generated by `calibrate.py`): 7: `docs/motion_spec.md` ->
  `docs/v1/motion_spec.md`; 26: `docs/style_bible_ref2.md` -> `docs/v1/style_bible_ref2.md`.
- v2r's docs (`video/docs/v2/`, the v2r session's; optional, dated inventories): `direction/house_digest.md` 7 (`style_bible.md`,
  `motion_spec.md`, `sound_plan.md`), 8 (`BRIEF.md`), 198 (`WRAPUP.md`) -> `v1/...`; `direction/teardown.md` 19:
  `docs/scenes/S01-S12.md` -> `docs/v1/scenes/S01-S12.md`; `direction/toolkit.md` 20, 22, 26, 31, 72, 82, 85, 190, 193,
  194 (v1's toolkit inventory: `src/entry-film.ts`, `src/data/*.json`, `src/scenes/...`, `run_all.sh`, `src/index.ts`
  -> "archived in `archive/v1/`"), 53: `CINE.md` -> `CINE_KIT.md`, 72 and 85: `SHARED_SETS.md` / `SHARED_PROPS.md` -> `v1/...`.
- No action (a "never import another film's folder" rule that stays true): `docs/v2/BUILD.md` 38, `STYLE.md` 21,
  `direction/toolkit.md` 14, `direction/treatments/T1_camera-journey.md` 197, `lanes/COMMON.md` 57-58, `lanes/L4_spec.md`
  175, `lanes/plan_L3.md` 25, `lanes/l5_tools/wf2_s6s7.js` 18, `src/v2r/kit/pip/README.md` 4,
  `studies/2026-10-28_city_posters/test/ENGINE_PT.md` 317.

**Code comments and defaults** (no pixel changes; `src/lib/` is frozen for Phase 1, so batch these after the study)
- `video/src/lib/`: `Captions.tsx` 46 (`docs/motion_evidence/measurements.json` -> `docs/v1/motion_evidence/...`), 171
  (`docs/motion_spec.md` -> `docs/v1/motion_spec.md`), 186 (`src/data/captions.json`: v1's, archived); `Card.tsx` 11
  (`docs/motion_evidence` -> `docs/v1/motion_evidence`); `Fill.tsx` 3, `Ink.tsx` 11, `Sun.tsx` 1, `exit.tsx` 2, `motion.tsx` 4,
  `spec.ts` 1, `time.ts` 129, `theme.ts` 71 and 129 (`docs/motion_spec.md` -> `docs/v1/motion_spec.md`); `theme.ts` 80
  (`docs/style_bible.md`, `docs/theme_proposal.json` -> `docs/v1/...`), 91 (`docs/BRIEF.md` -> `docs/v1/BRIEF.md`), 98 and
  130 (`docs/style_bible_ref2.md` -> `docs/v1/style_bible_ref2.md`), 268 (`scripts/engine-numbers.mjs`, archived);
  `Film.tsx` 4 and `timeline.tsx` 5 (`src/data/scenes.json`: v1's, archived); `ShotCam.tsx` 41 and `cine/index.ts` 1
  (`docs/CINE.md` -> `docs/CINE_KIT.md`); `edges/config.tsx` 17 (`docs/BRIEF.md` -> `docs/v1/BRIEF.md`); `edges/hints.ts` 36
  and `kit/Town.tsx` 4 (`src/dev/EdgeLab.tsx`, `src/dev/KitDemo.tsx`: archived in `archive/v1/src/dev/`).
- `video/src/v3/film/`: `Film3.tsx` 9, `scenes/index.ts` 5 (`scenes/g5b_panels.tsx`) and `kit/KitSheet3.tsx` 95
  (`scenes/S9.tsx`): "archived in `archive/v3/src/v3/film/scenes/`".
- `video/scripts/qa/`: `deadframes.py` 5, 366, 419, 427; `framecheck.py` 4, 215, 221, 241, 261; `beatsync.py` 10, 12, 44,
  45, 145; `qalib.py` 417, 446; `density.py` 7; `sheets.sh` 42-43; `calibrate.py` 3, 28, 32 (`docs/motion_spec.md`,
  `docs/style_bible_ref2.md` -> `docs/v1/...`, then re-run `scripts/index.py`). Also `scripts/camspeed.py` 18, 57, 59,
  68, 80 and `scripts/capcheck.mjs` 65. They name v1's `src/data/*.json` and `src/dev/registry.ts` as defaults (see the
  follow-ups); a live call with explicit `--scenes` / `--cuts` / `--frames` is unaffected.
- `video/scripts/v2/coldread_sheet.py` 9, 66 (`--entry=src/entry-v2.tsx`, archived): give it `--entry` and an animatic
  argument before any reuse (F2).
- `video/audio/tools/cues_from_storyboard.py` 1, 3, 15, 77 (default `docs/storyboard_v3_resolved.json` -> `docs/v1/...`,
  or archive the v1-only tool); `audio/tools/warp.py` 5 (`scripts/timewarp.py`, archived).
- `video/review/edges/tools/render-lab.mjs` 28, `render-clips.mjs` 30 (import `src/dev/EdgeLab`): v1 tools, run at
  `v1-final`.
- Lane R's files: `scripts/render-frames.mjs` 15-16 and `scripts/render/lib.mjs` 5, 65, 67 name v1's old entries on
  purpose (history and the `--entry=full` error); no action. (`render-media.mjs` no longer defaults to `src/index.ts`:
  since lane R's 18:55 checkpoint it resolves its entry like `render-frames.mjs`.)

**No action** (data provenance and closed-film records; they resolve at the tags): `assets/timewarp_v1_to_v2.json` 2,
`assets/timing_est_v3.json` 3, 14, 16, `audio/tempo_map_proposal.json` 6, `scripts/qa/calib/{calibration,ref1_scenes,ref2_scenes}.json`;
`docs/v3/` (46 references in 9 files: `g5b_reports/fix_S10-S14.md`, `fix_S11_S16.md`, `fix_S7-S8_S12.md`,
`g5b_split/brief_{A,B,C}.md`, `proposal_pullback.md`, `rework_split/brief_R.md`, `s9_scale_plan.md` cite the archived panels).

## For the production sessions
- **What changed:** `video/src` holds only live code. v1's code is in `video/archive/v1/`, v2's first try in
  `video/archive/v2-first/`, v3's 44 unused G5b panels in `video/archive/v3/`; v1's history docs are in
  `video/docs/v1/`, and `docs/CINE.md` is now `docs/CINE_KIT.md`. v1's scripts (`anchor/`, `gen-*.mjs`,
  `engine-numbers.mjs`, `timewarp.py`, `check-storyboard*.py`, `qa/run_all.sh`, `qa/report.py`, `review/checkin.sh`) are in
  `video/archive/v1/scripts/`, v1's workflow runs in `context/workflows/archive/v1/`. Code searches in `src` lose about
  68k lines of old films.
- **Typecheck:** `npm run typecheck` (the pinned TypeScript 5.9.3; never `npx tsc`, which without `node_modules`
  fetches TypeScript 6 and prints 12,041 false errors): about 11 s on an idle box, was 17 s; 0 errors. It checks `src/`
  only (`tsconfig.json` `include`). `npm run still` and `npm run render` are gone (they only rendered v1): use
  `scripts/still.sh ... --entry=src/entry-<film>.tsx` or `npx remotion still src/entry-<film>.tsx ...` as before.
- **Find a tool:** `video/scripts/README.md`, one line per tool from its own header (`python3 -I scripts/index.py`
  regenerates it; `--check` says if it is stale).
- **What stays the same:** every live entry bundles byte-identically (26/26), Film2R and Film3 frames are identical,
  every live command keeps its flags and its output (the one exception is the QA case below), `lib/` is untouched,
  `src/v3/film/BoardPanel.tsx` stays (the G5 template to copy), and the QA calibration data stays in `scripts/qa/calib/`.
- **QA tools, one behaviour change:** `deadframes.py` / `framecheck.py` with the default `--scenes auto` never use v1's
  cut list now. A plain call gives the same report as before (measured). With `--t0` (or `--only`) and no `--scenes`,
  they used to score your clip against **v1's php2shell scenes** (on a v2r clip: S06-S08; framecheck masked 3 phantom
  cuts); now they use the detected cuts. Pass `--scenes src/<film>/film/scenes.json`, as the gate docs do.
  `beatsync.py` needs `--cuts json:<file>` or `--cuts scenes:<path>` (its bare default read v1's cut list).
- **Old films:** once the orchestrator creates the tags, `git worktree add --detach /tmp/v1 v1-final` (likewise
  `v2-first`, `v3-final`), then `cd /tmp/v1/video && npm ci`, and that film's own commands run as they did. v1's dev
  compositions (KitDemo, CineDemo, MascotSheet, EdgeLab, SharedKitSheet, FontTest, ProfilePic) render only there.
- **Lane R's auto entry** (`render-frames.mjs --entry=auto`): with v2's entries archived, `Animatic` now resolves to
  `entry-v3.tsx` alone. `scripts/v2/coldread_sheet.py` no longer runs (it hard-wired v2's own entry).

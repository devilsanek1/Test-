# Phase 1, lane D (docs): lane C's "Doc changes needed", the link check, a permanent checker

Lane D of `PHASE1_BRIEF.md`, set by the orchestrator on 2026-10-29: apply `phase1_codebase.md`'s "Doc changes needed"
(309 references to moved paths in 84 live files), re-run the link check, and make the checker permanent. Status: **DONE**
(2026-10-30 ~00:15 UTC). A usage limit stopped the lane at 19:35 UTC before any edit; it resumed at 23:46 UTC on a clean
tree (scratch kept: `/tmp/phase1-D/`). No pixel can change: no file under `video/src`, `video/public` or `video/archive`
was touched, and lane R's render scripts neither.

**Result:** 0 stale references to a moved path in live files (permanent checker, exit 0). Lane C's scanner still counts
237 mentions in live files (was 309), by design: every one is now a note that says where the file went, a deliberate
"No action" item, a closed film's record, a bare name next to the folder that holds it, or a deferred `video/src` comment
(table in §2).

## 1. The list, applied (42 files changed; lane R's `render-media.mjs` in the same diff is theirs)

| part of the list | files | what |
|---|---|---|
| Process docs | 9: `HANDOFF.md`, `G5_BLOCKING.md`, `look/DIRECTION.md`, `look/LAYOUT.md`, `look/research/{arcane,audit,coziness,density_numbers,vertical}.md` | every item as written: paths to `v1/...`, `CINE.md` to `CINE_KIT.md`, HANDOFF's v1 status, v1 commands heading, `src/` map (+ an `archive/` bullet), docs index, reference table, `workflows/archive/v1/` in §6 |
| The kept API docs | 5: `ENGINE.md`, `QA.md`, `EDGES.md`, `mascot.md`, `CINE_KIT.md` | ENGINE: the banner line, the listed paths, the numbers block marked frozen (marker kept), §11's still line and one note over v1's tools; QA/EDGES/mascot/CINE_KIT: the paths and the "runs at v1-final" notes |
| Other live docs | 9: `CREATIVE_BRIEF.md`, `PIPELINE_RESEARCH.md`, `voice/evidence.md`, the study's `INTEGRATION.md` and `content_fit.md`, `scripts/qa/calib/calibration.md`, v2r's `direction/{house_digest,teardown,toolkit}.md` (the optional ones, applied: untouched since 2026-10-27) | the paths; toolkit's v1 inventory gets one "archived in `archive/v1/`" per block |
| Code comments and defaults | 14: `scripts/qa/{calibrate,deadframes,framecheck,beatsync,qalib,density}.py`, `scripts/qa/sheets.sh`, `scripts/camspeed.py`, `scripts/capcheck.mjs`, `scripts/v2/coldread_sheet.py`, `audio/tools/{cues_from_storyboard,warp}.py`, `review/edges/tools/render-{lab,clips}.mjs` | comments, docstrings and usage lines only, plus the two paths the list rewrites: `calibrate.py`'s measurement sources and `cues_from_storyboard.py`'s default storyboard (`docs/v1/...`) |
| Beyond the list (missed by lane C's scanner, see §3) | `PIPELINE_RESEARCH.md`:92 and `ENGINE.md`:247 (files above), `INTEGRATION.md`:131, new: `scripts/qa/holds.json` (its `_doc` string) | the same moved paths: `v1/storyboard_v3.md`, `CINE_KIT.md`, `v1/scenes/`, "v1's run_all.sh, archived in ..." |
| Generated | `scripts/README.md` | `python3 -I scripts/index.py`: 106 tools (+ `ops/linkcheck.py`); calibrate's line now says `docs/v1/` |
| New | `scripts/ops/linkcheck.py`, `scripts/ops/linkcheck_known.tsv` | §3 |

**How the edits were made and checked:** two exact-match scripts (`/tmp/phase1-D/edits_docs.py`, 80 edits in 23 files;
`edits_code.py`, 30 edits in 14 files): each old text had to occur exactly once, so nothing landed by accident.
The owner's quoted words were not touched (EDGES:25 and HANDOFF §7 change only the path beside the quote). The tags
exist only locally, so every `v1-final` / `v2-first` / `v3-final` carries its commit ("the `v1-final` commit
(`76c166c1`)", 20 times), and commands use the hash, as `video/archive/README.md` does:
`git worktree add --detach /tmp/v1 76c166c1 && cd /tmp/v1/video && npm ci`.

**Code proof (no behaviour change):** the 10 Python files' ASTs with docstrings blanked are identical to the 19:35
checkpoint's except the two strings the list rewrites; the 3 `.mjs` and `sheets.sh` are identical with full-line comments
removed; `node --check` and `bash -n` pass. The cues tool's new default is the byte-identical moved file (MD5 `10d7e361`
before and after the move). QA tools' help strings and code defaults are unchanged (the defaults wait for F3, as lane C's
follow-ups say); their docstrings now say the auto defaults read v1's archived files, so pass `--scenes` / `--cuts`.

**Judgement calls (the list's wording left a choice):**
- G5_BLOCKING:202 says "take lane R's text": lane R wrote it while this lane ran (its report, ~00:10 UTC), so lines
  202-203 are now exactly lane R's three lines (a `0.5:1.0` frame range, and `strip.sh ... $E`; both work in today's
  scripts). Lane R's other G5_BLOCKING lines (200, 206-215, 174, §8b) are its own changes, not lane C's list: left for
  the orchestrator.
- QA.md's notes say where v1's file went ("archived since 2026-10-29 in `archive/v1/src/data/`"), not only "archived",
  and the deadframes usage note sits inside its code block. CINE_KIT's note heads the whole command block: every command
  there renders `CineDemo`, v1's, so none runs in the live tree, not only lines 36-38.
- `voice/evidence.md`:14 now names `docs/v1/script/...` beside "@ ece6b55"; at that commit the file sat at the old
  path, so `git show ece6b55:` needs the old one.

## 2. The link check, before and after

| | before (19:18 UTC) | after (00:12 UTC) |
|---|---|---|
| lane C's scanner (`/tmp/phase1-C/linkcheck.py`), all references | 4,478 | 4,406 |
| ... in live files (its categories process, live-doc, live-code, data, film-record + CINE_KIT) | **309 in 84 files** | **237 in 67 files** |
| permanent checker (`--git 1932757d`): stale in live files | n/a | **0** (exit 0) |

The 237 left, by the permanent checker's classes: 115 annotated (a note in the block or banner names the new place, or
the block names the commit where the old path lives), 46 history (`docs/v3/`, the closed film's records; lane C's
"No action"), 32 kept (the list's "No action": never-import rules in 10 files, data provenance in 6 JSON files, lane
R's 2 render tools), 29 deferred (`video/src/lib` 17 files and `video/src/v3/film` 3 files: outside this lane, in the known list as
`todo`), 15 bare names or partial paths that sit beside the folder holding them ("in `v1/script/`: `final_script.md`").
History and archived files are untouched (2,312 + 1,861 + 46 lane C mentions; 4,218 in the permanent checker's terms).

## 3. The permanent checker: `video/scripts/ops/linkcheck.py`

```bash
python3 -I video/scripts/ops/linkcheck.py --git <base>     # after a move: renames since <base>, committed or not
python3 -I video/scripts/ops/linkcheck.py --moves <list>   # or from a list ("old new" lines, or JSON)
#   [--known video/scripts/ops/linkcheck_known.tsv] [--history PREFIX] [--only PREFIX] [--all] [--json OUT]
#   exit 0 = no stale reference in a live file, 1 = some (each with its new path), 2 = bad arguments
```
- **The moves:** git's renames from `<base>` to HEAD, plus moves not committed yet (a file of HEAD missing on disk
  whose exact bytes sit at a path HEAD lacks), plus the folders that moved whole (so citing a folder counts). Or a
  list: text lines, a folder allowed, or JSON (lane C's manifest format too).
- **The scan** is lane C's resolver (bases, bare and partial names, `os.path.join` and `Path /` joins), with three fixes
  found here: a bare name citing a **sibling** was never flagged (now flagged unless the name still works where it is
  cited: that found `PIPELINE_RESEARCH.md`:92, `holds.json` and, for the in-place rename, `ENGINE.md`:247 `CINE.md`); a
  bare name or partial path is cleared when a folder cited in the same block holds it; it never flags its own examples.
- **Each reference is classed:** history (records: `context/` runs and reports, `docs/retro/`, closed films'
  `docs/v1/` and `docs/v3/`, any `archive/`), annotated (its block or the file's banner names where the file went; a
  commit counts only inside the block, since a banner's commit holds every pre-move path: that is how `ENGINE.md`:247
  surfaced), kept / deferred (the known list), stale.
- **The known list** `linkcheck_known.tsv`: 37 rules, each a file glob and one old path, so no rule hides a later move;
  `todo` rules print on every run until fixed; a rule that matches nothing any more is reported for removal.
- **Tests:** on this move, `--git 1932757d` finds 364 of lane C's 365 files with identical targets (the 365th is a
  gitignored `.pyc`) and all 8 of its folders; `--moves` with lane C's manifest gives the same classes; per (file, line,
  old path) it finds everything lane C's scanner finds except the 15 cleared names, plus 3 in history files (the inferred
  `scripts/review/` folder). A synthetic repo with a plain `mv` of a file and a folder: moves found, stale until a note or
  a known rule, exit 1 then 0; an in-place rename and a sibling citation are caught. Runtime about 7 s.

## Not applied, and why
- **`video/src/**` (17 files in `lib/`, 3 in `v3/film/`):** a hard limit of this task, and the list itself defers
  `src/lib` until the city-poster study lands. They stay in the known list as `todo` with the list's fix, so every
  checker run prints them.
- **Lane R's render scripts:** the list says no action (deliberate history and `--entry=full`'s error); kept.
- **The "No action" items:** untouched (kept, or history for `docs/v3/`).
- Bare folder names (`scenes/`) are ambiguous to any scanner; a grep of the 224 live docs for the moved folders' bare
  names found one real case (`INTEGRATION.md`:131, fixed) and two that name folders that still exist.

## Doc changes needed (for the orchestrator)
- After the city-poster study: apply `phase1_codebase.md`'s "Code comments and defaults" to `video/src/lib/**` and the
  v3 notes to `video/src/v3/film/{Film3.tsx,scenes/index.ts,kit/KitSheet3.tsx}`, then delete those `todo` lines from
  `video/scripts/ops/linkcheck_known.tsv` (the checker lists them).
- **Overlaps with lane R's report** (written while this lane ran; lane D applied lane C's list there, lane R proposes
  other text for the same lines; reconcile when applying lane R's items): ENGINE.md §11 (the still line and its note:
  merge lane R's flags and cache note with the "v1's `Main`... at the `v1-final` commit" note; `engine-numbers.mjs`:
  lane D kept it under a v1 note, lane R would delete it; the `src/index.ts Main` render line: lane R's
  `render-media.mjs` line replaces it), HANDOFF.md §5 lines 400-401 (lane D left them under the new v1 heading, lane R
  rewrites them for the live films: better moved out of the v1 block), v2r's `direction/toolkit.md`:194 (lane D added
  "archived in `archive/v1/`", lane R's "renders every frame at the composition's fps (pass `$E`)" is the current fact).
  Re-run the checker after: it must still say 0 stale. Lane R's item 7 (re-run `index.py`) is done: the README lists
  `render/parallel.mjs` and `--check` passes.
- Suggested, not applied (process docs beyond the list): HANDOFF §5 "Gotchas" or PIPELINE_V2's tooling section: "After
  moving files: `python3 -I video/scripts/ops/linkcheck.py --git <commit before the move>` must say 0 stale before the
  commit; fix each, add a note that says where the file went, or list it in `linkcheck_known.tsv`."

## For the production sessions
- **What changed:** the docs point at v1's new homes (`docs/v1/...`, `archive/v1/...`, `docs/CINE_KIT.md`); v1-only
  commands say they run at the `v1-final` commit (`76c166c1`): `git worktree add --detach /tmp/v1 76c166c1 && cd
  /tmp/v1/video && npm ci`. QA docs and tool headers say the `--scenes auto` / `--cuts scenes` defaults read v1's
  archived cut list: pass `--scenes src/<film>/film/scenes.json` or `--cuts json:<file>` (the gate docs already do).
- **New tool:** after any move, `python3 -I video/scripts/ops/linkcheck.py --git <base>`; it lists each stale
  reference with its new path. One line per tool in `video/scripts/README.md`.
- **What stays the same:** every command and flag, and every output but two texts that now match the move:
  `calibrate.py` writes `docs/v1/...` as its measurement source, and `audio/tools/cues_from_storyboard.py` finds its
  v1 storyboard again (its default broke with the move). No frame, master or render script changed.

# Phase 1, lane M (meter): the spend meter and the status script

Lane M of `PHASE1_BRIEF.md`: PLAN.md Phase 1 item 1 (fix the meter) and item 7's status script. STATUS: DONE
(2026-10-29 ~10:30 UTC). No agents started, no git writes, no pixels touched (no render path was edited). Files:
`video/docs/retro/spend.py` (v2), `spend_out.txt` (a note added), `spend_d840f028.txt` / `.json` (new: this session's
record), `video/scripts/ops/status.py` (new).

## Item 1: the spend meter (`video/docs/retro/spend.py`, v2)

**What changed.** v1 is in git at `27b63b11:video/docs/retro/spend.py`.
- **Each API call counted once:** usage deduplicated by `message.id` + `requestId`, across all transcripts of a session
  (a forked agent's copied history cannot count twice). Claude Code writes each content block as its own line and
  repeats the call's usage on each. Synthetic lines (e.g. "You've hit your 5-hour limit") are not calls.
- **The transcripts are an argument:** `spend.py [PATH ...]` takes:
  - a session folder or its `.jsonl`;
  - one `agent-*.jsonl`;
  - a project folder (every session in it).

  The default is the current session (`$CLAUDE_CODE_SESSION_ID`), else `/root/.claude/projects/-home-user-Test-/d840f028-…`
  (this session). It reads both kinds of agents:
  - the Agent tool's, labelled by their `.meta.json`;
  - workflow agents (`subagents/workflows/`), labelled by their `journal.jsonl` (v1's layout).
- **Reports per agent, per role, per film and gate, per workflow and per scene.** The columns are calls, tool calls,
  context per call (first, mean, max), images seen, cache read and write, output, `$` and `$doc`, and status (done,
  running, limit, failed, stopped).
  - The film is the `vN` in the label.
  - The gate is a `G<n>` in the label or the workflow's name, else a keyword guess.
  - The role is a keyword guess.
  - Each orchestrator call goes to the film and gate of the agent it started last ("start" = before any).
- **Dollars at two rates.**
  - `$` uses Claude Code's own rates, which are exact (below).
  - `$doc` uses the rates in `2026-10-28_v4_early_stage_cost.md`, as the brief asked; `--rates doc` makes them primary.
- **A meter check** comes with every full report: the transcripts against Claude Code's own cost tracker, and against
  every get_session reading the transcripts hold.
- **Options:**
  - `--since/--until` (an ISO time, `HH:MM`, or `90m` / `2h` / `1d` ago);
  - `--film vN`;
  - `--agents N` (the top N; 0 hides the table);
  - `--json`;
  - `--save [--out DIR]`, which writes `spend_<session>.txt` and `.json`. The JSON keeps every call, so the record
    outlives the container.

  Read-only otherwise; 0.25 s on this session's 49 MB of transcripts.
- `spend_out.txt` stays as v1's record, with a note on top: about 2.4x over, re-measured here.

**Tests and results.**
- **The over-count, re-measured.** On this session's 40 transcripts, v1's per-line sum gives 2.36x the real input
  (3,841 usage lines for 1,625 calls; 1.4-4.1x per transcript). Keys are unique: 1,611 calls, no id with two request
  ids, no call in two transcripts.
- **An independent cross-check.** My separate exploration script and v2 agree at 10-28 23:39:58: 1,300 calls,
  cache read 262.2M, cache write 11.58M, output 3.30M.
- **The exact rates.** Claude Code writes a `cost-state` line (per-model tokens and `costUSD`) into the orchestrator's
  transcript each time its worker stops. A least-squares fit to the 10 distinct snapshots leaves a zero residual
  (1e-13).

  | Model | Input | Output | Cache read | Cache write |
  |---|---|---|---|---|
  | Opus 5.5 | $4/M | $20/M | **$0.20/M** (0.05x input) | $5/M (5-minute), **$8/M (1-hour)** |
  | Haiku 5.5 | $0.10/M | $0.50/M | | |

  Haiku web searches cost $0.01 each. The cost doc's implied rates ($3.07 / $15.35 / $0.31 / $3.84) assumed the
  standard ratios: they price cache reads 55 % too high and 1-hour writes (all the orchestrator's) 52 % too low. On a
  total they come out 3-14 % low ($210.87 vs $217.59 for the session; $97 vs $113 for the cost doc's window).
- **The transcripts reproduce Claude Code's own meter**, snapshot by snapshot, as close as these differences:
  - cache writes within 0.13-0.50 %;
  - output within 0.03 %, until the 15:56 auto-compaction, whose 17.8k-token summary is in no transcript;
  - the split between 5-minute writes (the agents') and 1-hour writes (the orchestrator's) within 10k tokens.

  At its last snapshot (10-28 23:39) Claude Code's meter reads $192.31 = Opus $189.36 + Haiku $2.96. The transcripts
  give $186.61.
  - The $2.75 Opus gap is calls written to no transcript. They add 11.1M cache read and 15.6k input: the compaction (a
    784k-token context: +0.78M read, +5.2k input) plus about 3.5M of read in each of three windows up to 09:22.
  - The Haiku $2.96 is the WebSearch / WebFetch side calls (211 searches).

**Validation against the session's own meter.** The get_session `usage` the brief cites was read at 09:54:40 UTC.

| At 09:54:40 | cost | cache read | cache write | input | output |
|---|---|---|---|---|---|
| get_session `usage` (the server's meter) | $173.22 | 256.0M | 9.83M | 4.65M | 3.87M |
| the orchestrator alone, transcripts (254 calls) | $57.63 | 99.4M | 3.64M | 0.6k | 0.43M |
| orchestrator + 36 agents, transcripts (1,301 calls) | $188.50 | 262.3M | 11.80M | 2.7k | 3.30M |
| + calls in no transcript (Opus $2.75, Haiku $2.96) | **$194.21** | 273.4M | 11.81M | 5.03M | 4.01M |

- **That meter includes the agents and the Haiku side calls.** Its "input 4.65M" is Haiku's: Opus input is almost all
  cached (2.7k uncached in 1,301 calls). Two windows prove it:
  - **18:33 to 09:54.** The meter rose $43.23. The orchestrator spent $7.42, $1.88 of it in a call the 09:54 reading
    did not have yet. The three streamline reviewers spent $38.25. Claude Code's own meter rose $43.22 over the same
    work.
  - **09:54:40 to my reading at 10:01:17.** The meter rose by input +158, cache read +10.79M and output +0.08M. The
    transcripts (the orchestrator plus the three Phase 1 lanes) rose by input +158, cache read +10.85M and output +0.08M.

  Within one worker it tracks the transcripts call for call.
- **The orchestrator is under a third of it:** $57.63 of $194.21 (30 %) at 09:54, over 254 calls at a mean context of
  about 400k. The rest is the 36 agents ($130.87) and the side calls ($5.71).
- **The gap: get_session reads $21.0 (10.8 %) under the session's real total at 09:54.**
  - **$1.8 is lag.** After the overnight idle, the orchestrator's first call (09:53-09:54) rewrote its whole context to
    the 1-hour cache (0.22M tokens, $1.76). The 09:54:40 reading did not have it yet; the 10:01 reading did.
  - **$19.1 never reached the server.** It was lost in two windows with worker restarts at the 5-hour limits of 10-28:
    - **$14.24 by 13:32.** The server's 13:32 reading ($102.70; cache read 107.25M, input 2.42M, output 2.54M) equals
      Claude Code's own 09:22 snapshot ($102.82; 107.85M, 2.42M, 2.54M). The work between about 09:22 and 13:32 never
      reached it: the viewer panel and the sceptics finishing, the editor, the truth check, and the round-3 scouts
      killed at 11:26. The gap to Claude Code's meter then stays exactly $14.24 from 13:32 to 15:05.
    - **$4.86 between 15:05 and 18:33.** These are the limit stops at 16:57, 17:21 and 18:12: the server rose $13.30
      while Claude Code's meter rose $18.16.

    Since 18:33 it has missed nothing.
  - The likely mechanism is inferred, not documented: the server adds up what each worker reports, so a worker stopped
    at a limit can leave usage unreported. Claude Code's own cost-state is saved with the transcript and restored.
  - **So get_session's `usage` is a lower bound** (10 % low here). The full count is the transcripts plus the side calls.
- **Allowing for the time since:**
  - **10:01:17:** the server said $181.08, the transcripts $194.56.
  - **10:27:** the transcripts say $217.59. That is $30.98 since the worker started at 09:53: orchestrator $4.19, the
    three lanes $26.80. With the side calls it is about $223.

**What the fixed meter says about earlier numbers.**
- **The v4 cost doc's "Orchestrator (this session) $103 (metered)" row** is get_session's reading at 13:32. That covers
  the whole session (orchestrator, all 28 agents, the Haiku side calls), on a server meter that had lost $14 by then.
  Its agent rows are per-line sums, so "about $280" counted the agents twice, both times inflated. The doc's window
  (10-27 22:30 to 10-28 14:20), corrected (each call once, Claude Code's rates):

| Part | Agents / API calls | Cache reads | Cache writes | Output | $ (exact rates) | $ (doc rates) |
|---|---|---|---|---|---|---|
| Orchestrator | 1 / 159 | 60.4M | 2.64M | 0.23M | $37.81 | $32.40 |
| Research, 3 lanes | 3 / 116 | 15.9M | 0.69M | 0.26M | $11.88 | $11.60 |
| Fact lock | 1 / 28 | 3.5M | 0.38M | 0.11M | $4.78 | $4.21 |
| Core-line writers | 6 / 74 | 6.9M | 1.29M | 0.81M | $23.99 | $19.49 |
| Judges | 4 / 42 | 4.1M | 1.01M | 0.44M | $14.70 | $11.93 |
| Viewer panel | 4 / 15 | 0.6M | 0.27M | 0.07M | $2.80 | $2.24 |
| Sceptics | 2 / 30 | 3.1M | 0.33M | 0.13M | $4.84 | $4.20 |
| Editor | 1 / 32 | 4.7M | 0.43M | 0.11M | $5.35 | $4.85 |
| Truth check | 1 / 34 | 6.0M | 0.21M | 0.11M | $4.46 | $4.37 |
| Round-3 scouts (killed by the 5-hour limit) | 5 / 28 | 1.4M | 0.36M | 0.02M | $2.40 | $2.06 |
| **In the transcripts** | 28 agents / 558 | 106.5M | 7.61M | 2.29M | **$113.02** | $97.35 |
| + side calls (Haiku web search and fetch, Opus side calls) | | | | | about $4 | |
| **The window's real total** | | | | | **about $117** (Claude Code's meter at 13:33: $116.94) | |

  The doc's conclusions hold in proportion:
  - the dropped topic's G0.5 cost about $102 (22 agents $73 + the orchestrator's share $29), not about $150;
  - the orchestrator is still the largest single line: $38, 159 calls (not ~330), mean context 397k, max 648k;
  - the killed scouts cost $2.40, not $8.
- **tokens.md's ratios stand.** Its per-call and per-agent figures came from deduplicated counts. Its "v4: a 640k
  context over about 330 steps cost $103" becomes 159 calls and $38 by 14:20 (273 calls and $60 by 10:27 today).

**Left.**
- v1's table in PIPELINE_V2 cannot be re-run: its transcripts are gone. It stays as measured, with the 2.4x note.
- Helper sessions run in their own containers: run spend.py there (or `--save` there and commit the JSON).
- Re-run `spend.py --save` once Phase 1's lanes finish, to freeze this session's final record. The saved one is from
  10:25 and is overwritten in place.

## Item 7 (the status script): `video/scripts/ops/status.py` (new)

**What it does.** `python3 video/scripts/ops/status.py --film vN` runs from any folder. It prints one screen of Markdown
(26 lines for v4, 37 for v2), pasteable into PROGRESS.md or a message. The flags are `--commits N`, `--items N`,
`--width W`, `--no-meter` and `--transcripts PATH`. The screen has four sections:
1. **Commits.** The last commits touching the film's paths:
   - `video/{docs,src,public,assets,audio,deliverables,scripts}/vN` and `vNr`;
   - the entry files `video/src/entry-vN*`;
   - `video/review/vN_*`;
   - `context/workflows/vN-*`.

   It also shows newer non-merge commits on other branches, and the uncommitted files in those paths.
2. **The README** (`video/docs/vN/README.md`): the title, the status table and the next-step / handed-over / paused
   lines. A film without a README shows the newest PROGRESS.md entry instead.
3. **The open items**, newest file first, found by a marker scan: it can miss an item or show a stale one.
   - **Where it looks:** PROGRESS.md (its newest entry) and the film's status files: TODO and OPEN lists, REVIEW,
     MASTER, ASSEMBLY, POSTING_KIT, `report*`, `handover*` and `*_reports/`.
   - **What counts as open:** unchecked boxes; `**Open:**` / `**Next:**` / `**Left open.**` leads; "Open, …:" /
     "Left for …:" sentences; items under an open-looking heading ("Owner TODO", "What a viewer would still notice");
     every item of a TODO/OPEN list.
   - **What doesn't:** anything marked DONE / FIXED / SKIPPED / [x] / superseded.
4. **Spend.** It loads `spend.py` as a module, with no `__pycache__` written into the docs. It shows the session's
   total (and the estimate with the side calls), the orchestrator's and the agents' shares, the last hour's spend, the
   film's share and the running agents. When this container lacks the transcripts it says so and falls back to the
   saved `docs/retro/spend_*.json` records, so v4's $143.08 is still readable after this container is gone.

It is read-only: `git log`, `rev-parse` and `status` with optional locks off; no fetch, no network.

**Tests.**
- `--film v4` (0.3 s), from `/`, shows:
  - the 6 latest v4 commits;
  - the README's current gate table (G0 topic locked, fact lock shared with v5, G1 next, G2 waiting) and its next step
    and handover line;
  - no open items (v4 has no PROGRESS or reports);
  - "v4 in it: $143.09 (33 agents $92.62 + the orchestrator's share $50.47)" and the three running Phase 1 lanes.
- `--film v2` (0.4 s), from `video/`, shows:
  - the 6 latest v2 commits, plus "uncommitted: 51 file(s)" (lane C's moves in progress);
  - no README, so the newest PROGRESS entry (19:55, ready to post);
  - the open items, newest first:
    - PROGRESS: "Open, the owner's call: one small polish pass …";
    - POSTING_KIT's Owner TODO;
    - ASSEMBLY_TODO's tooling backlog;
    - MASTER §5's eight "still notice" items;
    - REVIEW_1's "Left open";
    - then "… 10 more files";
  - "v2 in it: nothing (its sessions ran elsewhere)".
- Also checked:
  - **v3:** no README or PROGRESS, so it points to HANDOFF and OWNER_NOTES; its open items come from `rework_reports/`.
  - **v5:** its gate table, the "was the next step" line and the handover line.
  - **Bad input:** `--film v9` → "no video/docs/v9/"; `--film 4` → "takes vN".
  - **Options:** `--width 80`, `--items 0`, `--commits 0`.
  - **No transcripts** (`--transcripts /nonexistent`): it falls back to the saved record (v4 $143.08).

**Left.** The open-items scan is a heuristic. It works best when reports keep their conventions: `**Open:**` leads,
`- [ ]` boxes, DONE markers, and a TODO or OPEN file per film.

## Doc changes needed
Lane M may not edit these files; the orchestrator applies them. Line numbers are as of commit 1932757d.

1. **`video/docs/PIPELINE_V2.md:29-32`** (the "meter over-counted" paragraph). Replace it with: "**The meter
   over-counted (found 2026-10-28, fixed 2026-10-29):** these totals come from v1 of `docs/retro/spend.py`, which added
   each API call's usage once per transcript line, about 2.4x too much. So v1's agent input was about 5 B tokens and the
   orchestrator made about 800 calls (est.; v1's transcripts are gone). The shares hold roughly. spend.py v2 counts each
   call once: `python3 video/docs/retro/spend.py` (`docs/retro/2026-10-28_streamline/phase1_meter.md`)."
2. **`video/docs/PIPELINE_V2.md:69`.** Change "(v4: about $280 for a topic and a line, much of it waste:" to "(v4:
   about $117 for a topic and a line, re-measured 2026-10-29 (the first count, $280, counted the agents twice), much of
   it waste:".
3. **`video/docs/PIPELINE_V2.md`, "Agent prompt rules"** (after the "One fact file" bullet, line ~247). Add:
   "- **Label every agent `vN G<n> role: what`** (the Agent tool's `description`, a workflow `agent()`'s label; e.g.
   `v4 G1 critic: cold retell`): the meter groups spend by film, gate and role from the label, and per-gate spend is
   exact only with it."
4. **`video/docs/PIPELINE_V2.md:173-176`** (a fresh orchestrator per gate). After "…with no agent and no reading in the
   session." add: "The hourly status is that command's output, pasted as the PROGRESS.md snapshot. The spend comes from
   the meter (`docs/retro/spend.py`, also in that output). get_session's `usage` includes the agents but is a lower
   bound: across worker restarts at the 5-hour limits on 2026-10-28 it lost about 10 %. Use it for `rate_limit_info`.
   `spend.py --save` at a gate's end keeps the gate's record in the repo, since the transcripts go with the container."
5. **`video/docs/retro/2026-10-28_v4_early_stage_cost.md`:**
   - **:8-13** (the rates and the caveat). Replace with: "From the fixed meter (`spend.py` v2: each API call once, at
     Claude Code's own rates: Opus 5.5 $4/M input, $20/M output, $0.20/M cache read, $5/M 5-minute and $8/M 1-hour
     cache write). The first version of this table took get_session's reading ($102.70 at 13:32) as the orchestrator's,
     but that meter covers the whole session, agents included; and it summed the agents' usage per transcript line
     (2.4x). Its total of about $280 counted the agents twice. The real total is about $117."
   - **:15-27** (the table). Replace it with the corrected table above.
   - **:31.** "(about $150 of agents plus the orchestrator's share)" → "(about $102: 22 agents $73 + the orchestrator's
     share $29)".
   - **:35.** "($8)" → "($2.40)".
   - **:38.** "($103, the largest line)" → "($38 by 14:20: 159 calls at a mean context of 397k, max 648k; still the
     largest line)".
6. **`video/docs/retro/2026-10-28_streamline/tokens.md`:**
   - **:14.** After "**The meter over-counts about 2.4x.**" add "(Fixed 2026-10-29: spend.py v2, `phase1_meter.md`.)"
   - **:96.** Replace with "- **v4:** a context of up to 648k (mean 397k) over 159 calls cost $38 by 10-28 14:20, still
     the largest single line (the $103 first quoted was the whole session's meter); $60 over 273 calls by 10-29."
7. **`video/docs/retro/2026-10-28_streamline/PLAN.md`:**
   - **:19.** "(433k mean per step on v1, 640k on v4)" → "(433k mean per step on v1, about 400k mean and up to 782k on
     v4)".
   - **:25.** Append "Fixed in Phase 1 (spend.py v2)."
8. **`HANDOFF.md:421`.** "The script is `video/docs/retro/spend.py`." → "The meter is `video/docs/retro/spend.py` (v2
   since 2026-10-29: each API call once; v1's numbers in that table are about 2.4x high). One film's state and spend on
   one screen: `python3 video/scripts/ops/status.py --film vN`."
9. **For the orchestrator to judge: `video/docs/OWNER_PLAYBOOK.md:465`** ("Track the spend hourly (helpers' `cost_usd`,
   workflow tokens)"). If that half is our wording rather than the owner's, make it "Track the spend hourly
   (`status.py --film vN`: the meter; a helper's get_session `cost_usd` is a lower bound)". If it is the owner's, leave
   it and let rule 4 above carry the how.

## For the production sessions
- **Your spend, exact and per gate.** `python3 video/docs/retro/spend.py` covers your own session and its agents
  (`--agents 0` for the summary only).
  - **What it shows:** spend per role and per film and gate, plus a table per agent.
  - **Windows and filters:** `--since 2h` or `--since 2026-10-29T09:00` for one gate's window; `--film vN` for one film.
  - **At a gate's end:** `--save` writes `docs/retro/spend_<session>.txt` and `.json`. Commit them: the transcripts
    vanish with the container.

  Older numbers that came from v1 (PIPELINE_V2's v1 table, the v4 cost doc's agent rows) are about 2.4x high.
- **Label agents `vN G<n> role: what`** (e.g. `v4 G1 critic: cold retell`). Then film, gate and role are exact. Without
  it the meter guesses from keywords.
- **get_session's `cost_usd` counts your agents too, but it is a lower bound.** It lost 10 % across this session's
  usage-limit restarts. Keep using get_session for `rate_limit_info` before a fan-out. For the spend, use the meter, or
  status.py, which includes it.
- **Hand-offs and the hourly status:** `python3 video/scripts/ops/status.py --film vN`. It needs no agent and no doc
  reading, takes about 0.4 s, and gives one screen of Markdown:
  - the commits;
  - the README gate table and next step;
  - the open items;
  - the spend.

  Paste it as the PROGRESS.md snapshot. To have your open items show up, write them as `**Open:**` or `- [ ]` and mark
  closed ones DONE.
- **What stays the same:** every render, QA and voice command, every gate and every review. Nothing in `video/src`,
  `video/public` or the render scripts was touched. The only command whose output changed is `spend.py` itself. It now
  prints the v2 report and writes files only with `--save`. v1 wrote `spend.json` for a session whose transcripts are
  gone.

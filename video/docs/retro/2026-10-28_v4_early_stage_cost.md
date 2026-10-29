# Early-stage cost review (v4, 2026-10-28)

The owner: "we've basically done nothing much here, but i can see we already spent 30% of the weekly budget. This seems
somewhat high. Can you evaluate if there is anything in the early stages of the process that is complete waste".

## What this session spent (2026-10-27 22:30 to 2026-10-28 14:20 UTC)

From the session's own meter (orchestrator) and the agents' transcripts. Dollar figures for the agents use the rates
implied by the orchestrator's meter ($102.70 for its usage, with the standard ratios: cache read 0.1x input, cache write
1.25x, output 5x: about $3.07/M input, $0.31/M cache read, $3.84/M cache write, $15.35/M output). Estimates, not a bill.
**Caveat (2026-10-28, `2026-10-28_streamline/tokens.md` F8):** summing usage on every transcript line over-counts about
2.4x (each API call's usage repeats on every content-block line), so the agents' rows may be that much too high; the
orchestrator's row is the session's own meter and holds.

| Part | Agents / API calls | Cache reads | Cache writes | Output | About |
|---|---|---|---|---|---|
| **Orchestrator (this session)** | 1 / ~330 | 107.2M | 6.1M | 2.5M (+2.4M input) | **$103** (metered) |
| Research, 3 lanes | 3 / 380 | 48.9M | 2.2M | 0.9M | $37 |
| Fact lock | 1 / 105 | 13.6M | 1.2M | 0.45M | $16 |
| Core-line writers | 6 / 167 | 13.9M | 3.4M | 1.7M | $43 |
| Judges | 4 / 80 | 7.5M | 2.0M | 0.9M | $24 |
| Viewer panel | 4 / 23 | 0.8M | 0.5M | 0.1M | $4 |
| Sceptics | 2 / 85 | 8.3M | 1.0M | 0.4M | $12 |
| Editor | 1 / 87 | 12.5M | 1.3M | 0.3M | $14 |
| Truth check | 1 / 123 | 21.9M | 0.8M | 0.45M | $17 |
| Round-3 scouts (killed by the 5-hour limit) | 5 / 108 | 5.0M | 1.4M | 0.07M | $8 |
| **Total** | 28 agents | | | | **about $280** |

## Complete waste: cut it

1. **A whole G0.5 for a topic that was then dropped** (about $150 of agents plus the orchestrator's share). The work was
   good, but the owner switched the topic right after it ("alternate ... positive"). Cause: the topic was locked
   without the mood the owner wanted. Fix: the scouting brief names the mood (rule added 2026-10-28), and the owner
   confirms the topic on the G0 screen before any G0.5 money is spent.
2. **Five scouts killed by the 5-hour limit with nothing saved** ($8). They were launched together close to the limit,
   and none had written a file yet. Fix: check the session's rate-limit status (get_session) before a fan-out; every
   agent writes a first partial file at its first step.
3. **The orchestrator re-reading a 640k-token context on every step** ($103, the largest line). What bloated it: a
   skill that dumped a ~70k-token settings schema for one small hook question; every writer's and judge's full JSON
   pasted back into the chat instead of read from a file; ~330 small steps (each commit re-reads the whole context);
   process and doc work mixed into the production session. Fix: a fresh orchestrator session per gate (the video's
   README is the handoff), agents write files and return at most 3 lines, steps batched, process work in its own short
   session.
4. **The same facts checked on the web five times**: the G0 scouts, three research lanes (380 calls), the fact lock,
   two sceptics and the truth check each searched again. Fix: one research-and-fact-lock agent (about 20 searches)
   builds the fact file once; every later check reads the fact file and searches only for a fact it lacks.

## Oversized: shrink it

5. **G0.5: 22 agents for one sentence** (6 writers, 4 judges scoring 47 lines each, 4 personas, 2 sceptics, an editor,
   a truth check). The decisive signals were the viewer panel and the truth check; the four judges' scores barely
   separated the top 7. Lean: one writer (12-15 lines across the levers) and one critic (the judges' lenses, the
   four-persona panel and the truth check in one), top 3, then the owner picks. Or fold it into G0: each topic on the
   owner's screen carries its proposed core line, and the owner picks both at once.
6. **The G1 template (~12 agents**: spines, judges, three writers, a cold-read panel, a flow critic, a merge, a fact
   check). Lean: one writer (two spines, picks one, writes the script with cues, runs `check_rhythm.py` and
   `check_paste.py`), one critic (a cold retell, flow, facts against the fact file, at most 6 findings), one fix pass.
7. **Max effort on mechanical tasks** (persona reactions, bookkeeping) multiplies the output tokens (most of the writers'
   1.7M output is thinking). The owner's rule is MAX for all delegated work, so it stays unless the owner exempts
   mechanical tasks.

## The lean early pipeline (proposed for v4 now)

- **G0:** two scouts (about 15 searches each) and one editor that judges, picks and fact-checks the top 3 and proposes a
  core line for each: 3 agents. The owner picks the topic and its line on one screen.
- **Fact lock:** one agent.
- **G1:** writer + critic + one fix pass: 2-3 agents. The owner approves the script.
- **G2:** the voice through the API (`generate_take.py`, `check_take.py`): no agents.

About 7 agents for G0-G2 instead of about 45, with the orchestrator in a fresh session per gate.

## Applied to the process (2026-10-28, owner: "update the process / clean up - so that the next videos are not encountering the same issues")

- `docs/PIPELINE_V2.md`: the G0, G0.5 and G1 rows and bullets are the lean defaults (G0: 2 scouts + 1 editor, the topic
  and its core line on one screen; one fact-lock agent, the only web check; G0.5 folded into G0, a separate round only
  on request; G1: writer + critic + one fix pass); the heavy templates run only on request; anti-waste rule 9 gains
  "Agents report in files, not in the chat" (files from the first step, 3-line reports, one shared brief file per stage,
  no big skill loads for small questions, batched steps, a rate-limit check before a fan-out); the agent prompt rules
  gain the 3-line report and "one fact file".
- `docs/OWNER_PLAYBOOK.md`: "Spend on the film, never on overhead" (Process); the core line is picked with the topic by
  default; the NO LIMIT rule says the early selection stages need few agents.
- `CLAUDE.md` and `HANDOFF.md`: the same, in their summaries and in "Starting the next video".
- The heavy workflow templates (G0 topics, G0.5 core line, G1 story; v2, v3, v4) carry a "HEAVY version" header.

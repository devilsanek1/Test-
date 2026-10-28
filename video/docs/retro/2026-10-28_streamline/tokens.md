# Streamlining review: TOKENS AND PROCESS, G3-G8 (2026-10-28)

Reviewer: tokens area (analysis only; evidence first; estimates marked "est."). Scratch: `/tmp/streamline-tokens/`.
STATUS: in progress (checkpoint 1).

## 1. How it works today

**The meter.** `video/docs/retro/spend.py` sums `message.usage` over every assistant JSONL line (spend.py:30-34) and
calls each line a "turn". Claude Code writes one line per content block (thinking, text, tool_use), each carrying the
SAME usage: measured on this session's 37 transcripts, 2.53 lines per API call, totals inflated 2.35x (median) to
2.59x (aggregate) (`/tmp/streamline-tokens/`, dedupe on message.id + requestId). So v1's "12.5 B input / 1,922 turns"
(`spend_out.txt`, PIPELINE_V2.md:16-18) is about 4.8-5.3 B real input and ~800 orchestrator API calls (est.). Shares and
per-call context sizes survive (both sides inflate alike); absolute totals and "turns" do not.

**Where v1's tokens went** (spend_out.txt; shares valid, totals ~2.4x high): fix 40 % (108 agents), review 28 % (220),
build 18 % (31), other 10 %; 66 failed agents (3 %). Per scene 12-25 reviews and 5-11 fixes (S08: 25 / 9).
(pending: cost model, v2r numbers, orchestrator)

## 2. Findings, ranked by expected saving

(pending)

## 3. Quick wins vs bigger changes

(pending)

## 4. Rejected ideas

(pending)

# Streamlining review: TOKENS AND PROCESS, G3-G8 (2026-10-28)

Reviewer: tokens area. Analysis only. Estimates are marked "est.". Scratch files: `/tmp/streamline-tokens/` (`agents_table.txt`
holds the per-agent numbers). STATUS: DONE.

**Bottom line.** A film's G3-G8 tokens grow with how long each agent session runs, roughly with its square, and with how many
fresh review rounds it gets. They do not grow much with what agents read. Three changes give most of the saving, with
every gate and check kept: (1) a closed list of findings per round, with a hard stop; (2) scripts that measure first,
then one taste reviewer and one cold viewer; (3) short sessions: long fix and build sessions split, a fresh orchestrator
per gate, resume instead of restart. Combined est.: 35-50 % of G3-G8 tokens, about 12-20 weekly points per film.

## 1. How it works today

**The meter over-counts about 2.4x.**
- `retro/spend.py:30-34` sums `usage` on every assistant JSONL line and calls each line a turn. Claude Code writes one line
  per content block, and every line repeats the same usage.
- Deduplicating by message.id + requestId on this session's 37 transcripts: 2.53 lines per API call, totals inflated 2.35x
  (median) to 2.59x (overall).
- So v1's "12.5 B input / 1,922 orchestrator turns" (PIPELINE_V2.md:13-24) is really about 5 B and about 800 calls (est.).
  Shares and per-call context sizes still hold.

**The cost model (measured in this harness).** Every call re-reads the whole context. Per agent:
input ≈ N·(B + R) + g·N²/2, where N is the number of calls.
- **B, the fixed base** (system prompt, tool schemas, CLAUDE.md): 49-52k tokens on the first call of all 36 subagents here
  (median 50.2k).
- **R and g:** from 161 agents in `context/agent_reports`, end context ≈ 83k + 2.2k per tool call, so the early reads R
  are about 35k and the growth g about 2.2k per call (images, code, logs).
- **Images:** a full 1080x1920 frame plus a 216-px still added 3.0k tokens (about 1.6k for the frame, 0.1k for the
  still), each re-read on every later call.
- **Scene files:** fixers read and edit files of 30-73 KB, 8-18k tokens each (`v3/film/scenes/outside.tsx` 73 KB).

**Where G3-G8 tokens went.**
- **v1, the old loop** (`spend_out.txt`; shares hold):
  - Fix 40 %, review 28 %, build 18 %. The scene workflows were 63 % of all input (scene-polish 10 runs, scene-production 4).
  - Per scene: 12-25 reviews (2 lenses, so 6-12 rounds) and 5-11 fixes. 141 of 173 reviews still found a blocker or major.
  - S08: 25 reviews, 9 fixes, shipped at 7/10.
- **v3, current gates** (recorded workflows, est.): G3 ≈ 70 M, G4 ≈ 8 M, G5 ≈ 153 M (helper sessions not recorded). The
  largest single agent was the G5b fixer: 137 tool calls, 406k end context, ≈ 30 M (69 % of its run). Sessions of 60+
  calls hold **55 %** of the recorded G3-G5 agent tokens.
- **v2r, G4-G8** (dollars from `v2/PROGRESS.md`):
  - Helpers ≈ $1,140: $496 in 1.5 h from 7 ultracode sessions (:267-269), "$897 total" at 09:18 (:97).
  - The local session: $3,502 → $3,801 over 17 h (:267, :114), plus about $230 to the master (est.).
  - The week went 50 % → 97 %, shared with the v3 rework and v4's G0 (about 9 points). So a G3-G8 film is about 30-45
    weekly points (est.).
  - The lean end phase (one critic round and must-fixes per lane, one fresh review, two fix passes; :99) got the owner's
    "Okay this is good" (v2/OWNER_NOTES.md:149).

**Q1. The review/fix loops: where they run and why they run long.**
They run at the G5 lanes, at the G6 assembly, at each G4 look-clip version, and in toolkit workflows
(`v2r-premium-water.js`: 8 agents). Six causes:
- **(a) A vague stop rule.** v1 stopped at "min score ≥ 8, no blocker or major" (`scene-polish.js:78`), with fresh reviewers
  each round, so it never converged. PIPELINE rule 2 (:110) is still open-ended ("while each round improves").
- **(b) Measuring inside LLM reviews:** v1's motion lens ran the QA gate, camspeed and the beat check itself (:51);
  v2r's LENS_B greps for Math.random, opacity, raw hex and imports, and checks map.ts rects, exact texts and type sizes
  by eye (`v2r-l3-critic-round.js:27`); v3's reviewer R2 ran the line, light, density and depth scripts itself
  (`assembly_review_R2.md` Status).
- **(c) Panels where rule 2 says one reviewer:** v1 used 2 lenses per round; v2r's round 0 put 4 lenses on an inherited
  build that was later redone, "all FAIL" (`handover_L2.md:117`); v3's assembly used 3 reviewers (`v3-assembly.js:92`);
  the v2r lane brief says "critics with distinct lenses, loop-until-pass" (`COMMON.md:7-12`).
- **(d) Re-review from scratch.** v3's verifier re-renders the whole film and re-watches all of it (`v3-assembly.js:153-155`).
- **(e) Restart, not resume.** v1's scene workflows "started over at round 1", so all 12 scenes were relaunched with fresh
  reviews (CONVERSATION_2026-10-25.md:44). v2r's helpers were replaced by new sessions that re-read everything
  (COMMON.md:15).
- **(f) No enforced caps.** No `agent()` call in the 95 scripts passes a turn cap (the only options used are label,
  phase, effort and schema). Image budgets drifted from about 8 (rule 3) to 10, 15 and 20 (`v3-g5b-rollout:41`,
  `v3-final-lanes:35`, `v3-assembly:44`).

**Why 57 review and fix agents failed (66 in all).**
- All were usage-limit kills, on three events of 10-25: the 5-hour limit at ~00:05 ("stopped about 37 agents",
  CONVERSATION:41), the 5-hour limit at ~05:00 (:536-560) and the weekly limit at 09:45 (:1210).
- They were mostly reviews because reviews were the most numerous agents running.
- The damage went beyond their 388 M (≈ 160 M real): a dead reviewer was counted as a pass (:43), and the failed resume
  forced a relaunch.

**Q2. The doc load.**

| Brief | Told to read | Size |
|---|---|---|
| v1 build, review and fix agents (`scene-polish.js:27`) | "READ FIRST, fully": 11 docs + storyboard sections | 512 KB ≈ 128k tokens |
| v2r helper (`COMMON.md`) | ~16 docs + kit READMEs + handover + plan | ≈ 330 KB ≈ 82k (est.) |
| v3 rework lane (`brief_H.md:16`) | 5 docs | ≈ 104 KB ≈ 26k |
| new orchestrator (`HANDOFF.md` §0) | HANDOFF, playbook, DIRECTION, CRAFT, PIPELINE, gate specs, compaction_3, USER_MESSAGES | ≈ 320 KB ≈ 80k (est.) |

- **What was actually read:** 5.0 MB in 207 Read calls across v1 (Bash reads not counted), so agents skipped most of
  "fully".
- **What it costs:** an early read is re-paid on every call. For a long v2r helper that is about 10-15 % of its context
  (est.).
- **Overlap is paraphrase, not copy:** 1-7 % of 8-word shingles per doc. But the "which doc wins" chain is in 7 docs, the
  caption band in 13, "3-4 noticeable movers" in 7, the 15 px/frame budget in 6 and MAX effort in 6. Each copy is a clash
  risk (CLAUDE.md: "a clash is a bug").

**Q3. The orchestrator.** Its cost is the context size times many small, clock-driven steps.
- **v1:** mean context **433k** per call, about 800 calls, 3 compactions.
  - Of 634 Bash calls, 171 were commit/push (27 %) and about 217 were check/status/wait.
  - There were also 38 scheduled check-ins and 36 notification reads (`ACTIONS_LOG.md`).
- **v4:** a 640k context over about 330 steps cost $103, the largest single line.
- **v2:** one session for 4 days ($3,502 → about $4,000, est.). The hour that held the hourly check-in and one hand-off
  cost +$11 (PROGRESS:129); four idle hours with the hourly report off cost +$7 (:114, :122); coordinating hours, local
  workflows included, cost +$26-51 (:149-232).

**Q4. Mechanical checks.**
- **Already exist:** `scripts/qa` gate_check (fps, duration, A/V sync, cuts by transition type, caption band, frame 0,
  seams, density), check_light, check_depth, check_banding, density, particles_phone, colour_meter, framecheck,
  deadframes, beatsync, av_lag; also capcheck, camspeed, board_lint, the lib lints and max_effort.
- **Missing as checks:** CRAFT §e's measures (carry, eye jump, colour shift, tier shares, movers, line budgets), raw in
  `qa/retro_tools` (craft lane item 1, not yet ported); a film-code lint and a contract check (positions, exact texts,
  type scale, colour roles).
- **Run first?** In v2r, yes: `v2r-l3-review.sh` built the pack, and the assembly ran gate_check, light, depth and banding
  before the review. In v1 and the v3 rework assembly, no: the reviewers did the measuring.

## 2. Findings, ranked by expected saving (est. % of a G3-G8 film; not additive)

**F1. Closed-list rounds with a hard stop. Saves 10-15 % (on v1-style loops, 60-80 % of review and fix).**
- **Proposal:**
  - Per scene, sequence or film: one review (at most 6 findings, each with an id, a time, a measure and a fix), then one
    fix.
  - Then one verify that checks only those ids, with the same measure on the same frames. It adds new findings only for
    blockers, and only once.
  - A fix2 runs only for open MUSTs. Then the work goes to the owner.
  - `v3-assembly.js:147-178` is most of this already; drop its full-film re-watch.
- **Risk:** needs a test (T1). **Effort:** S.

**F2. Scripts measure first; one taste reviewer plus one cold viewer. Saves 8-12 %.**
- **Proposal:** one command, `qa_pack <film> [range]`, generalized from `v2r-l3-review.sh`:
  - it renders the review files once (216-px sheets, strips, phone sheet, 1:1 crops);
  - it runs every existing check, CRAFT §e (port `retro_tools`) and a new `film_lint` (what LENS_B checks by hand);
  - it writes a one-page `qa.md`.
- **How it is used:** FAILs go straight to the fixer. The reviewer gets `qa.md` and the sheets and judges taste only; it
  never re-runs a script or re-renders. This replaces v1's motion lens, R2's measuring and LENS_B. The cold viewer stays:
  G5_BLOCKING §9 says it "found the rest".
- **Risk:** needs a test (T1). **Effort:** M.

**F3. Short sessions: split, cap, resume. Saves 12-18 %.**
- **Why:** cost is quadratic in N, and 55 % of the recorded tokens are in sessions of 60+ calls.
- **Proposal:**
  - A fixer owns one finding group and stops at about 60 calls or 250k context, writing a 1-page handover for a fresh
    session.
  - Splitting pays when g·N/2 > B + R (about 85k): a 137-call fix split into three saves about 40 % (est.).
  - Workflow steps become idempotent: `step(id)` reuses `runs/<run>/<id>.json` when it exists, so a relaunch replays
    nothing.
  - Keep rule 3's budget of about 8 images.
- **Risk:** needs a test. **T2:** the same finding list fixed split vs unsplit closes the same ids, with no regression in
  CRAFT numbers on the same frames. **Effort:** M.

**F4. Orchestrator: fresh per gate, event-driven, scripted status. Saves 5-10 %.**
- **Proposal:**
  - A new session per gate, as CLAUDE.md asks, onboarded from the film's README and the gate brief (about 10k tokens),
    not HANDOFF §0's 80k.
  - Wake only on completion events.
  - Hourly status becomes a script: PROGRESS from git log, the reports and the meter. It wakes the session only for a
    report or a limit threshold.
  - Each commit rides with the next action (in v1, 27 % of Bash calls were commits).
- **Risk:** none (no pixels). **Test:** per-gate spend on the fixed meter. **Effort:** S-M.

**F5. A generated per-gate brief instead of read lists. Saves 4-8 %.**
- **Proposal:** `docs/briefs/{G3,G4,G5_lane,G6_review,G8}.md`, each about 5-8k tokens:
  - that gate's rules quoted with source anchors, the owner's words first;
  - built by a script from the canonical docs' marked sections;
  - plus the film's one-page spec.
- It cuts R from 26-128k to about 8k on every call and removes 6-13 paraphrased copies of rules.
- **Risk:** needs a test. **T3:** the lane style quiz (rule 1; `v2/lanes/STYLE_CHECK.md`) answered from the brief must
  match the answers from the full read list. **Effort:** M.

**F6. Image diet. Saves 2-4 %.**
- **Proposal:** 216-px sheets (about 0.1k per frame) plus 1:1 crops of the area a finding names (540 px, about 0.4k)
  instead of full-size key frames (about 1.6k each). v2r's brief asked for full-size key frames of every shot
  (`brief_L2.md:14`).
- **Risk:** needs a test (T4: line findings from crops vs full frames, same render). **Effort:** S.

**F7. A doc clash: the lane brief's "distinct-lens critics, loop-until-pass" vs rule 2. Saves 3-8 % where it applies.**
- **Evidence:** the owner's words are "they must all use ultracode effort" and "the effort should be either max or
  ultracode" (v2/OWNER_NOTES.md:59-63). The panel shape is our wording (COMMON.md:9-12).
- **Proposal:** keep MAX and ultracode, and write F1/F2's review shape into every lane brief.
- **Risk:** low (T1). **Effort:** S.

**F8. Fix the meter (no direct saving; it proves the others).**
- **Proposal:** dedupe by message.id + requestId; report per gate and per role, with calls, per-call context and images
  per agent.
- **Risk:** none. **Effort:** S.

**T1, the replay test (no new film needed):** re-render the v3 rework film at be03dfa and run qa_pack, one combined
reviewer and one cold viewer. Every blocker or major in `assembly_review_R1-R3.md`, matched by time and area, must be
found (100 % recall), and every measured finding must appear in `qa.md`. The same on `v2r_G5_assembly_v1.mp4` against
REVIEW_1.md's six MUSTs. The closed-list verify, run on the fixed render, must match the old verifier's verdict. The
owner still sees every gate.

## 3. Quick wins vs bigger changes

**Safe now (no pixel effect):** F8; F4; F3's idempotent steps; F2's order for the checks that already exist (run first,
and the reviewer still reviews); F7's doc fix; the image budget of about 8 restored in the templates.

**Bigger (needs the owner's yes and a test):** F1's hard stop (T1); one reviewer instead of lens panels (T1); F5's briefs
(T3); F3's caps (T2); F6's crops (T4). Porting CRAFT §e into `scripts/qa` (the approved craft lane) unlocks F2 in full.

## 4. Rejected ideas
- **Lower effort or a smaller model for reviewers or mechanical agents.** The owner's rule is MAX; turn those agents into
  scripts instead (zero tokens).
- **Dropping the cold viewer or the G4 art director.** They catch what the numbers miss (G5_BLOCKING §9).
- **Low-res only for line review.** It hides line defects; keep 1:1 crops.
- **Fewer G4 look rounds, or skipping gates.** The owner drives that quality (v2r's look rounds built the reusable
  depth, sky and water libraries), and the gates are a hard rule.
- **Trimming the playbook.** The owner set "no size budget"; F5 cuts the reading instead.
- **Many tiny agents (1-call judges or personas).** Each pays the 50k base; fold them into a step or a script. A note,
  not a finding.
- **Shrinking B by restricting workflow agents' tool schemas.** Maybe 5-10 %, but the harness decides that; flagged only.

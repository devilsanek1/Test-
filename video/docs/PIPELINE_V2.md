# Production pipeline v2 (for video 2 onwards)

Why: on video 1 the owner first saw a playable film **18.7 h** in. Before that there were only stills, so they could not
steer. Story problems (S08's peak, S10's readability, the weak hook) surfaced during polish, where every change costs
a full scene round. Background research: `docs/PIPELINE_RESEARCH.md`.

## What video 1 actually cost (measured from the agent logs)

| | |
|---|---|
| Agents run | 442 |
| Agent input tokens | 12.5 B (98 % cache re-reads); output 66 M |
| Orchestrator input / output / turns | 0.83 B / 2.0 M / 1,922 |
| Fix agents: share of input | **40 %** (108 agents, avg 163 turns, 46 M input each) |
| Review agents: share of input | **28 %** (220 agents, 4,272 rendered images viewed, about 19 per review) |
| Scene builds | 18 % (31 agents, avg 210 turns) |
| Review/fix rounds per scene | 12-25 reviews, 5-11 fixes (S08: 25 / 9 / 985 M tokens, still shipped at 7/10) |
| Reviews that still found a blocker/major | 141 of 173: polish never converged |
| Agents lost to usage limits / kills | 66 (388 M tokens of work lost or redone) |
| Docs read into agent contexts | 5 MB (cheap; not the problem) |

**The cost driver is long, image-heavy agent sessions repeated on finished-looking scenes.** Every turn re-reads the
whole context, and every rendered frame an agent looks at stays in that context. Reading docs was a minor cost.

## The loop: gates G0-G8

Breadth-first: the whole film passes each gate together. At every gate from G1 on, the owner gets **one MP4 that plays
on the phone, with voice and captions**, plus at most 5 lines of notes. Nothing is built for a later gate before this
one is approved.

| Gate | Owner plays / sees | Owner approves | Frozen after | Budget |
|---|---|---|---|---|
| G0 Angle | 1 screen of text | topic, audience, takeaway, length | topic, length band | 15 min, orchestrator only |
| G1 Radio cut | TTS voice over plain paper with big captions, plus **3 hook-line variants** | every word, hook line | meaning and order of lines | 1 h, then 15 min per round |
| G2 Voice lock | the radio cut with the final take | voice, pace | the clock (word timings) | 30 min |
| **G3 Sketch animatic** | the whole film as line sketches timed to the voice, rough camera, **every transition labelled**, 2 hook-visual variants | **story in pictures**: shot per line, cuts, transitions, peaks | scene list, cut points, shot content, transition types | first cut 2 h; rounds 30 min |
| G4 Look (parallel to G3) | 1-3 finished stills plus a 3-5 s motion test | palette, line, mascot, edges | visual language | house style: 15-min check |
| G5 Blocking cut | real sets and props at draft quality, final camera, key poses, **no edges/paper/texture** | staging, readability at phone size, transitions that play | compositions, camera, timing | 4 h |
| G6 Polish cut | easing, secondary motion, edges, paper; **AI critics start here** | feel only (no restaging) | the picture | 6 h, 1 round + bug fixes |
| G7 Sound | SFX from the final beats, music, -14 LUFS mix | mix | audio | 1 h |
| G8 Final | full-res render, QA, cover, posting kit | blockers only | everything | 1.5 h |

Target: playable cuts at about hours 1, 3, 8 and 14 (video 1: hour 18.7).

## Anti-waste rules (each one fixes a measured waste)

1. **No AI critics before G6** (reviews were 28 % of spend, mostly on scenes that changed afterwards). Before G6 the
   owner is the reviewer, plus one scripted check (duration, A/V sync, captions inside the safe area).
2. **One combined reviewer per scene, one round at G6, max 6 findings**, then fix and stop. No re-review loops: a
   scene that is still under the bar after one fix goes to the owner (S08 took 25 reviews and still shipped at 7).
3. **Fix agents get a turn cap and an image budget** (avg 163 turns): render contact sheets at 0.33-0.5 scale, view at
   most ~8 images per session, and end the session after the fix. A new session is cheaper than a long one.
4. **No downstream build before its gate.** On video 1, engine, kit, mascot, edge lab and QA tooling were built before
   the script was locked, and a 78 s to 55 s script change threw away voice v1/v2, timing, storyboard v1/v2 and music.
5. **Lower concurrency, checkpoint every agent.** 66 agents died at usage limits. Run at most about 4 agents at once, commit
   after every agent, and keep each agent's task small enough to restart.
6. **Precise numbers only at G5 or later.** The G3 storyboard is data plus a video, never an 800-line prose spec with px/s values.
7. **The hook goes first at every gate**, as a swappable segment (the first 3-5 s), with variants at G1 (line) and G3
   (visual). It is never polished last.
8. **One deliverable per gate, no status reels.** Drop the 30-minute strips of every composition. The owner gets the gate video;
   between gates, one line, and only when something is blocked.
9. **Lean orchestrator.** Keep the task list short, use short check-in prompts, read agents' final summaries rather than full
   journals, and write handoff notes as a short WRAPUP-style doc instead of a growing log.

## Agent prompt rules

- Context: the gate's brief plus the scene's own data. **Point to sections, never "read all docs fully".**
- A report is at most 12 lines. Cross-lane requests go in one block, in an exact format.
- Lanes: one scene per agent; shared kit / engine changes go only through the orchestrator.
- Renders: 0.33-0.5 scale strips; full res only for a 1-2 frame measurement.

## Tooling to build before video 2 (in this order)

1. **`npm run preview`**: the whole film at 0.33 scale with audio, CRF 28, x264 veryfast, about 3-5 min. Also
   `preview:hook` (first 10 s) and `--frames` to re-render one scene. Every gate video comes from this. *(~1 h)*
2. **Draft flag in Film**: turns off edges, paper, noise and ink boil, and burns in a gate/version/scene/timecode label
   for all pre-final cuts. *(~1 h)*
3. **SketchReel composition (G3)**: draws the animatic from one JSON file (per line: shot sketch made of boxes,
   silhouettes from the mascot poses and labels; camera start/end; transition type and label). A G3 revision is then a data
   edit, not code. *(~half a day)*
4. **Hook segment**: the first 3-5 s as its own component with variants that all end on the body's first frame (and on
   S12's loop frame). *(~2 h)*
5. **Scripted gate check**: duration, A/V sync, caption safe area, cut list vs word anchors. It replaces review agents for
   mechanical checks. *(~1 h)*

Drop or slim: per-scene QA charts in every check-in, beat-sync against the old storyboard, critic panels before G6, edge
labs before G4.

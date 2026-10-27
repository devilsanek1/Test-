# Video 2 ("One Small Window"): live progress

Updated by the orchestrator every hour (scheduled check-in) and at every milestone. Newest snapshot first.

## Snapshot 2026-10-27 23:18 UTC (hourly)

| part | owner | status |
|---|---|---|
| S1 look clip v3 | L1 (idle, waiting for the libs) | done: depth pass (far city in 3 haze steps, the wing separated), ground pass (2-point perspective, treads foreshortened 4.4x, near things in 3 layers), corner polish, stepped sky + smaller, lower sun (SUN0 now (196, 772) r 52); next: wire lib/sky + lib/particles + lib/depth, render v3 |
| Depth + particles toolkit | local `wf_5d776523-d28` | scout + analyst DONE (research docs in docs/look/research/); builder running; critic next |
| Pro sky | local `wf_951757bf-213` | sky engineer running (OKLab eased gradient, sun warmth, blue-noise dither, check_banding, encode settings); critic next |
| Sound revision 2 | done (be9ecc0) | the film plays public/v2r/mix.wav; requests for L5 / L6 held for their resume |
| L2-L6 | paused (handovers) | resume after the owner sees S1 v3, with depth + sky sections in their briefs (+ L6: SUN0 moved) |

**Spend:** orchestrator $3,684.85 (+$51 in the last hour), L1 $139.21. Owner readings needed (last: 20:59 session 13 %, weekly 62 %).

## Note 2026-10-27 23:05 UTC: sound revision 2 DONE (be9ecc0)

Joins on their carriers and midpoints, no Pip hops, a positive glass-chime ding at 0.45, calm air from the conformed life, the music director's 12
fixes; -14.01 LUFS / -1.25 dBTP; every hit word has the voice >= 6 dB over everything at 1-4 and 4-10 kHz; Film2R now plays `public/v2r/mix.wav`
(cues.json points at it). Open: one listen on phone speakers + earbuds; re-time `sheet.CUES` from the final picture (W4). Requests for the lanes when
they resume: L5 S7 festoon in three switch-ons on f1812 / 1836 / 1848; S6 `f12LineAt` 26.40 -> 26.467 (f1588) and facade windows on f1626 / 1647 /
1670; L6 S8 lamp run on f2237 / 2261 / 2273 (same spacing as S7, fairness A5).

## Snapshot 2026-10-27 22:45 UTC: the owner's depth notes come first

The owner on the G4 look clip: the subject blurs with the background (the Google wing melts into the far city), no distance effect, no
perspective, the steps have no depth; shadows better; research GitHub libraries for more natural effects; add a few particles; "let's address
those first, distill and generalize into the production pipeline so the quality compounds, and show me this scene once again". Done/doing:
playbook rule DEPTH AND SEPARATION + DIRECTION rule 2 (committed); L2-L6 PAUSED cleanly (handovers); L1 does S1's depth pass by hand now (atmospheric
perspective on the far city, the wing separated, the steps receding to a vanishing point) with a slot for particles; local workflow
`wf_5d776523-d28`: library scout + depth analyst -> builder (lib/depth.ts, lib/particles.tsx, scripts/qa/check_depth.py, DEPTH.md, CRAFT §f,
PIPELINE_V2 gates, v2 brief sections) -> adversarial critic. Then L1 adds the particles and re-renders the look clip (v3) for the owner.

## Snapshot 2026-10-27 22:25 UTC: look APPROVED, all lanes conforming

The owner approved the G4 look clip ("okay good continue"; `deliverables/v2/v2r_G4_look.mp4`). Running now, each ONE agent + ONE critic round:
L1 the look clip v2 (foreground at foreground scale on the steps); L2 S2; L3 S3+S4; L4 S5; L5 boards + S6 + S7; L6 S8 + the loop seam (reports
due ~23:55-00:10 UTC, each with a 0.4-scale clip and CRAFT checks). Local: the sound revision (new joins). Next: assembly (full 60 fps render,
gate_check incl. carriers, check_light, density), one whole-film review round, fixes, final mix, master, QA, cover, posting kit.

## Snapshot 2026-10-27 21:19 UTC (hourly)

| part | owner | status |
|---|---|---|
| Groundwork integrator (STYLE values-only, TREATMENT banner, COMMON, THROUGHLINE §7) | local workflow (resumed after a container restart at ~20:45) | finishing: docs done, final typecheck + push |
| G4 look clip (S1, 0-~6.3 s) | L1 helper (resumed 20:57) | building: clean-pen frame 0 (pale cascade, subject draw-on), camera locked, tiers, light rig RIG_CANAL, life cut to budget (0e97dec); due ~22:30 |
| L2-L6 conform | helpers, idle | wait for the owner's approval of the look clip (approved pipeline: G4 before the lanes) |

**Spend:** orchestrator $3,607.51 (+$26 in the last hour); L1 +$28.5 since 20:57. Owner 20:59: session 13 % (resets ~23:30), weekly 62 %.
Projection: video 2 needs ~22-28 % more of the week -> ~85-90 % with the v3 rework sharing the week.

## Snapshot 2026-10-27 20:19 UTC (hourly)

| part | owner | status |
|---|---|---|
| THROUGHLINE.md + conform_L1..L6 | groundwork workflow | director DONE; critic DONE (verdict "fixed", 193cb35): thread = her window, 98 % outside the owner-approved fairness stretch S5-S7; 0 plain cuts; Pip carried across every join; shots avg 4.89 s, 2 places, 1 scale reveal |
| STYLE / map / scenes.json carriers / rigs.ts / TREATMENT / COMMON | groundwork workflow (integrator) | running |
| lib/light.tsx + tiered clean pen + kit tiers | engine | DONE (dc9c1bc, 7b400c4); v3 byte-identical |
| Lanes L1-L6 | cloud helpers | idle; resume when the integrator lands (L1 also builds the look clip) |
| Sound revision | local, paused | resumes with the new scenes.json carriers |

**Spend:** orchestrator $3,581.50 (+$31 in the last hour); helpers idle. Projection unchanged (~$650-800 to the finished film, ~81-87 % of the week).

## Snapshot 2026-10-27 19:19 UTC (hourly)

| part | owner | status |
|---|---|---|
| Groundwork: THROUGHLINE.md + conform_L1..L6 | local workflow `wf_fbca738e-09e` (director -> critic -> integrator) | director still writing (started 18:40) |
| Engine: lib/light.tsx | same workflow (engine agent) | DONE, pushed (dc9c1bc) |
| Engine: tiered clean pen + kit tier defaults for v2r | same workflow | DONE, pushed (7b400c4); proving it now (before/after stills, v3 identical) |
| Lanes L1-L6 | cloud helpers | idle since 15:07 (no spend); resume when their conform brief lands |
| Sound revision, kit review | local, paused | sound resumes once THROUGHLINE fixes the joins; kit review re-scoped (Pip fixes stay) |

**Spend:** orchestrator $3,550.84 cumulative (+$36 since 18:47, ~$70/h); helpers idle. Owner 18:47: weekly 59 %, session 0 %. Projection to
the finished film ~$650-800 (~22-28 % of the week) -> ~81-87 %.

## Snapshot 2026-10-27 18:45 UTC: RESUMED, conforming to DIRECTION

The session limit reset at 18:30 (owner: "Okay the limits seem to reset"). While paused, the video 3 session landed the owner-approved
direction: `docs/look/DIRECTION.md` (one page, it wins) + `docs/look/CRAFT.md` + the approved pipeline (look clip before the lanes). v2 was
built before it (dark ink everywhere, strangers' backs in the foreground, Pip-hop cuts, no light rig, no thread object), so the plan the owner
okayed: (1) groundwork workflow `wf_fbca738e-09e` (local, MAX): `THROUGHLINE.md` (thread, places, carriers per join, tiers per beat, light rig
per set) + `lanes/conform_L1..L6.md`, adversarially checked, then STYLE.md / map.ts / TREATMENT / COMMON integrated; in parallel the engine:
`lib/light.tsx` (port of v3's Light kit), the tiered clean pen for v2r (`lib/pen.ts` setPen('clean') + kit tier defaults); (2) a 6-8 s look
clip of the S1 opening for the owner; (3) the six lanes conform their shots (one agent each, one critic round); (4) assembly, review, mix, final.
Lanes stay idle until their conform brief lands. Hourly report re-enabled; branch sync re-armed.

## Snapshot 2026-10-27 15:10 UTC: CONTROLLED PAUSE (session limit)

**Why:** the owner's plan usage at ~15:02 UTC: the 5-hour **session limit 89 %** (resets 18:30 UTC; shared by every session on the
account) and the **weekly limit 58 %** (resets Mon 2 Nov 10:00 UTC). Hitting the session limit mid-turn would cut every session off
mid-work, so everything was paused at a safe point (owner: "make sure that if we do hit the current session limit we are not losing
any progress"). **Resume:** a scheduled message wakes the orchestrator at 18:33 UTC (`trig_01GWLPXtL6n3uc1uSUCKNWqs`); the hourly
report (`trig_01HUebJeJqxrK67qTURHNW4V`) is DISABLED until then (re-enable on resume).

| part | owner | state at the pause | resume from |
|---|---|---|---|
| L1 hook V2S1 | helper `session_014PwCXJtHzuLkUMsNQTU4LD` | part builders (row/set/steps/pip) mid-run | `lanes/handover_L1.md` |
| L2 wall V2S2 | helper `session_014PwCXHaMDZbQskHTPPEQYk` | fix round 1 builders mid-run; L5 board swap + one critic next | `lanes/handover_L2.md` |
| L3 her bank V2S3+V2S4 | helper `session_014PwCXJs9nWENkpKqVhHWMP` | 4 builders mid-run | `lanes/handover_L3.md` |
| L4 crane V2S5 | helper `session_014PwCXHEmk7T2Y5xLmUSX6h` | sky/far + terrace built, valley + figures next | `lanes/handover_L4.md` |
| L5 boards + V2S6 + V2S7 | helper `session_014PwCXJBpuhBWJAJtA6vrSe` | K3 boards landing; S6/S7 builders mid-run | `lanes/handover_L5.md` |
| L6 her words V2S8 + seam | helper `session_014PwCXKi95W1ntg73DuH1F5` | set + house builders mid-run | `lanes/handover_L6.md` |
| QA gate check | done, archived | `report_QA.md`; its 2 requests applied | n/a |
| Style alignment | done | `STYLE.md`, `lanes/COMMON.md` (STYLE.md first), `lanes/STYLE_CHECK.md` pushed; stylecheck answers pending; decisions sent to lanes (sizes, name tag, headline, float, flash safety, Pip at the S7->S8 wipe) | grade `stylecheck_*.md` |
| Kit review (local) | orchestrator | contract sheet + art-director verdict DONE ("fix": 8 placement checks fail); fixers cast (seated variants, traits, Dog) + Pip (watch rig, S1 ears-cover lead) STOPPED mid-run, their files committed | `Workflow({scriptPath: 'context/workflows/v2r-kitreview-wf_9112485e-4ca.js', resumeFromRunId: 'wf_9112485e-4ca'})` (the journal lives in the orchestrator's container; if it is gone, re-run the fixers from `context/agent_reports/2026-10-27_v2r-paused-workflows.md`) |
| Sound revision (local) | orchestrator | field grains done; bed.py + sfx.py mid-revision (committed); premix checks + SOUND.md next | `Workflow({scriptPath: 'context/workflows/v2r-sound-wf_7902a45a-8a4.js', resumeFromRunId: 'wf_7902a45a-8a4'})` |

**Spend (cumulative `cost_usd`):** orchestrator $3,502 (since 24 Oct); helpers L1 78.5, L2 52.0, L3 112.2, L4 52.9, L5 108.0, L6 58.3,
QA 33.8 = $496 (13:24-14:56 UTC). Calibration: weekly 50 % -> 57 % for ~$200 => ~$29 per weekly %; the session limit moves ~4x
faster (~$7-8 per session %). Before the pause the burn was ~$410/h (~14 weekly %/h); after the resume: ONE agent at a time per
lane, ONE combined critic round, no polling, checkpoints every <= 20 min, and a total burn that keeps the next 5-hour window < ~85 %.

## Snapshot 2026-10-27 14:18 UTC

**Stage:** building the finished film (no sketch, per the owner). Direction locked (`TREATMENT.md`); engine, palette, map and the
four new kits (cast, Pip, canal, Arlington) built; kit review, sound revision and the style alignment running; six shot lanes +
QA building in parallel cloud helpers at MAX effort + ultracode.

| part | owner | status |
|---|---|---|
| Direction (6 treatments, 4 judges, director, devil's advocate) | done | `TREATMENT.md` locked (One Small Window, palette 10 Canal Mint) |
| Engine, palette, map contract | done | Film2R plays end to end; `map.ts` = every position |
| Kits: cast, Pip, canal, Arlington | done (pre-MAX) | under the MAX-effort kit review now |
| Kit review (contract sheet, art director, fixers, report_KIT.md) | local workflow | contract sheet DONE (cdec81f); art-director review running; fixers next |
| Sound (new bed + SFX + premix) | local workflow | draft done; music-director critique done; MAX revision running |
| Style alignment (STYLE.md + audit + style check) | local workflow | STYLE.md and the coverage audit written; integration running; then every lane takes the style check |
| L1 hook V2S1 + cold read | cloud helper | split into parts on one clock; parallel builders running |
| L2 wall V2S2 | cloud helper | first build exists; critic panel running; fix brief next |
| L3 her bank V2S3 + V2S4 | cloud helper | plan + part split; 4 builders running |
| L4 crane V2S5 | cloud helper | build spec + camera check done; parallel builders launching |
| L5 boards + V2S6 + V2S7 | cloud helper | K3 StatementBoard builder running (checkpoint pushed); V2S7 camera/Pip done |
| L6 her words V2S8 + seam | cloud helper | contract v2 + clock + assembly; part builders next |
| QA gate check | cloud helper | verification round running; report next |

**Next:** the kit review's fixes and the style check reach the lanes; lanes finish build -> critic -> fix; then assembly (full
60 fps render), the whole-film cold read / art / standards reviews, the final mix, the 1080x1920 master, QA, cover, posting kit.

# Video 2 ("One Small Window"): live progress

Updated by the orchestrator every hour (scheduled check-in) and at every milestone. Newest snapshot first.

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

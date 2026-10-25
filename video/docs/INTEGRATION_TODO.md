# Integration TODO

Work for the integration pass, after every scene workflow has finished. Scene fix agents are still editing
their scenes, so none of this is done mid-flight; each item names the scenes it touches.

## Kit v3 adoption (from the kit workflow's review, wf_336a5cb0-728)

1. **One cart sign across the film (J3 -> J4 -> J5 payoff).** The shared `FixSign`
   (`src/scenes/shared/props/FixSign.tsx`) and the `MakersCart` `sign` slot now exist. Today the same
   story object is four different drawings:
   - S06: a LabelTag card in the MakersLane `blindSign` slot
   - S07: its own BlindSign shim (`Scene07.tsx`, ~line 99)
   - S09: a CartSign shim (`scene09/shims.tsx`)
   - S10: a copy of that shim (`scene10/shims.tsx`)

   Switch all four to `FixSign`, keeping its size, line breaks and ink identical where the sign is the
   same object. Then check the J3/J4/J5 frames side by side.
2. **S12 opening state = S11 last frame.** Build S12's plaza with `plazaShutdownGov(at, S01_GOV)` so it
   inherits the lettered "back soon" tags and S01's padlock and tag offsets. Diff S11's last frame
   against S12's first frame (the target is 0 px for the set).
3. **S08 CounterBoard footer.** Drop `footerSize={26}` (`Scene08.tsx:324`) or pass 28. The kit now ships a
   taller footer zone (`footerH`).
4. **S10 gap walker.** Can drop its local `GapWalker` (`scene10/walker.tsx`) for the kit's
   `people={{n: 1, walk, stop}}`, now that the kit anchor has moved up the gap. Optional; only if it
   matches S10's timing.
5. **S09 crate.** Can import the kit's `LidCrate` instead of the `scene09/shims.tsx` copy, and the sun slot
   instead of the injected SunLayer and tower redraw (the dawn band now draws before the sun slot).
   Optional; re-run QA if changed.
6. **S01 plaza numbers.** Can import `PLAZA_SHUTDOWN` from the kit instead of its own copy. If S01's
   numbers change, S12 must pass them (see item 2).
7. **LabelTag `minFont`.** Labels whose box was too small now grow the paper instead of shrinking the
   text. Re-check scenes that relied on shrink-to-fit (S05's L6 slip, BlueprintWall slips) for overlap
   with the art.

## Scenes still under 8/10 after their fix rounds

Polish-pass results (look / motion, last review; "+fix" = a final fix round ran after it, not yet re-reviewed):
- S02 8 / 8.5 PASS. S01 8 / 9 PASS. S06 8.5 / 8 PASS.
- S03 8 / 8.5 +fix (3 major findings went into fix r3). S05 8 / 8.5 +fix (1 major). S11 7.5 / 8.5 +fix (r3).
- Still running at 03:25: S04, S07, S08, S09, S10, S12.
The integration pass re-reviews every "+fix" scene and every scene under 8.


The scene workflows stop after 3 review/fix rounds. Any scene whose lowest reviewer score is still under 8 gets a
polish pass (same two reviewer lenses, plus a cross-scene continuity reviewer) before the final render. Scores at
22:58, round 1 -> round 2: S01 art 7/7, motion 6.5/8 (one caption-legibility gate error in the dive); S11 art 7/7.5;
S08 art 6; S09 art 6, motion 6.5; S04 art 6; S03 art 6.5; S05 art 6.5; S06 art 6.5. Every other lens is at 7-8.

## Cross-lane findings scene agents can't fix (polish pass)

- DONE (core, 23:40): S01 caption over the dive. `out` on caption pages; page 2 leaves at 4.285, page 3 rolls in on
  the cut at 4.715 (docs/ENGINE.md).
- Core: ink weight jumps across S01 -> S02 because the dive scales every stroke by up to 3.07x (8-10 px at the cut
  against S02's 3-4 px). Fix with stroke x zoom^-0.6 on transition-flagged camera segments, or a GovernmentPlaza
  `inkScale` driven by S01 over 4.385-4.715.
- Sets (GovernmentPlaza): (a) the plaza ground is ~60% sage, so the bottom half is a heavy teal mass. Make the field
  mintPale/cream with one diagonal sage shade wedge of <= 1/3. (b) The "Europe" far-civic silhouettes step only
  ~1.3:1 and the gap reads as one teal pillar. Give a two-value dark step, a horizon line at world y ~1150-1180, and
  3 shrinking tiers. (c) One flute stroke per column (govA reads as a barcode in the dive).
- S01 in lane (if its fix rounds don't get to it): padlocks 52-60 px, 3.4 px ink, cream/ochre body, overlapping the
  shutter's bottom rail.

## Continuity routing from kit v3b (check in the integration continuity pass)

- S05 -> S06 messenger: S05's shim Messenger (scene05/shims.tsx ~229) must draw the ink-brown hair + straight collar
  band (or use props `<Messenger>`), its local `Arm` (~39) -> `FigureArm`, `BentArm` (~63) -> one `FigureArm` with
  `elbow`. Otherwise the messenger changes look across the S05/S06 cut.
- S06: local `Arm` (scene06/parts.tsx:143) -> `FigureArm` (same props), so the arm doesn't snap straight at f26-27.
- S01: scene01/timing.ts comment "domeB is silhouette 2, domeF 3" is stale (PLAZA_CIVIC order is now domeF, templeM,
  spireB, spireM, domeB, templeF; lanterns can no longer go dark before their dome).
- S11: still draws its own padlock and tag (PadlockRock / TagTwirl); fine if it matches S01/S12. S03: still StampS03.
- DONE: raw strokeWidth in shared props/sets reads inkComp (wf_1036d3ea-5c5; pixel-identical outside InkScale).
- DONE 02:50 (orchestrator, after S01's polish finished; S01 gate PASS, dive end checked): APPLY WHEN S01's polish workflow is done (it was editing scene01 at 02:00): the S01 dive ends with a 17 px ink bar at
  govB's window right edge. `scene01/screens.tsx` l.46 and l.63 draw the dead-screen / CRT glass as
  `<Fill d={rectPath(-1, -1, w + 5, h + 5)} .../>`: a world-unit spill that grows x2.9 in the dive (fills are never
  compensated). Fix (tested in a scratch copy: the bar becomes normal 6 px and 5 px lines at 4.70, 4.385 unchanged):
  a component `Glass` with `const k = Math.max(1e-3, matScale(useXf()))` (useXf from lib/xf, matScale from
  shared/props/common) drawing `rectPath(-1 / k, -1 / k, w + 5 / k, h + 5 / k)`, used in place of both Fills (seeds
  `${seed}/crtg` and `${seed}/dg`). It must be a component: BrowserChrome calls `content()` as a plain function.

## Run log

- 00:05: a usage limit stopped ~37 agents mid-task across the 4 scene workflows and kit v3b; their last fix rounds were
  lost. 00:40: tree checked (tsc clean, Main renders). Kit v3b resumed (sets/props builds kept). Scenes relaunched as
  4 `scene-polish` workflows (scripts/scene-polish.js): fresh review of the current state, fix rounds carry the kit
  notes, S12 built after S01. Workflow resume does NOT replay concurrent scene runs (call order changes), so after
  any future interruption relaunch scene-polish for the unfinished scenes instead of resuming.

## Other

- Edge treatment: DONE, `paint-subtle` is wired into `Film` (full film only, captions above, one painting per scene).
  Still to do: generate per-scene `EDGE_HINTS` (src/lib/edges/hints.ts) with
  `review/edges/loose/final/tools/scan_hints.py` on the final scenes, so bare corners land where there is drawing and
  never cut actors or the mascot. Then re-run framecheck and capcheck on Main.
- `scripts/qa/holds.json`: no deliberate holds needed so far (every scene's longest dead run is <= 0.37 s).
- S09 pull-back speed (~76 px/frame against the strobe limit of 18): check in the Main QA run.
- Re-run the mixer with cues nudged to the final scene times, then the final high-quality render.
- Disk: `scripts/ops/disk_janitor.sh` prunes the Remotion webpack cache (it reached 9.9 GB with parallel
  agents). Keep it running during the integration renders.

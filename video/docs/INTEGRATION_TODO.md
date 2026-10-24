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

The scene workflows stop after 3 review/fix rounds. Any scene whose lowest reviewer score is still under 8 gets a
polish pass (same two reviewer lenses, plus a cross-scene continuity reviewer) before the final render. Scores at
22:58, round 1 -> round 2: S01 art 7/7, motion 6.5/8 (one caption-legibility gate error in the dive); S11 art 7/7.5;
S08 art 6; S09 art 6, motion 6.5; S04 art 6; S03 art 6.5; S05 art 6.5; S06 art 6.5. Every other lens is at 7-8.

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

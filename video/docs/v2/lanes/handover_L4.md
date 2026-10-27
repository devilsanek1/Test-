# L4 handover (V2S5, the crane): work in progress

**Done**
- Read COMMON, brief_L4, TREATMENT (all), map.ts S5, the dc kit (README, crane.ts, CraneSet.tsx, terrace.tsx, vista.tsx), cast and Pip READMEs.
- Rendered the kit's `CraneMove` / `CraneEnd` and compared with reference 1 / v1 at 216 px.
- Started `video/src/v2r/scenes/V2S5_text.tsx`: `NewsBox` (START coords, contract face x 470-780, y 880-1230, headline 40 px + 18 px
  credit) and `Plaque` (END coords `PLAQUE` x 532-776, y 1066-1168, pops on "Pentagon" scene 1.88). Not yet wired or rendered; not typechecked.
- `V2S5.tsx` is still the engine placeholder.

**Next (the plan)**
1. `V2S5_set.tsx`: fork `kit/dc/CraneSet.tsx` (same planes, ease, wipe, swap) so own layers can be inserted; `V2S5.tsx` = `<World sky={CM.sky}>` + that set.
2. Figures: cast `Stranger` (start (300, 1225) h 150, `turnPageAt`), end tiny (h ~62) after `swapAt`; Pip `PipTrack` in START coords:
   mid-hop from about (330, 780) at 0 landing on (415, 1120) by ~0.2 s, `lookUp` + look toward SUN1 at 0.21 (20.76), size 108 so it ends
   ~44 px; end seat = DECK inverse of (415, 1120) = (365, 1195); leap up-right at 3.35 (23.90). Tell L3 / L5 the cut points (REQUESTS).
3. Kit gaps seen in the kit render (fix in own files): start frame too empty below the bench (add a start-only near foreground that
   drops out down-left: tree root bottom-left, petals, a bag; plus a blossom-branch fringe in the top gutters, y <= 260, that lifts UP and
   out as the crane tilts: "under a canopy" without crossing y 317-556); end bottom third reads as flat mauve paving (lighter paving,
   more terrace people / dog / pigeons / drifts); top sky could carry one bigger cloud (y <= 300); keep everything out of y 317-556.
4. QA: `craneSpeeds()` / camspeed <= 15 px/f detailed, density.py, band check; review files + fresh-eyes critic per brief_L4.

**Files**: `video/src/v2r/scenes/V2S5.tsx` (placeholder), `video/src/v2r/scenes/V2S5_text.tsx` (WIP).

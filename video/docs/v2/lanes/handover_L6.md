# L6 handover (V2S8 + the seam): first session, stopped at the orchestrator's request before writing code

**Done:** read COMMON, brief_L6, TREATMENT (all), BUILD.md, map.ts S8 / PIP / MATCHES, the canal / cast / Pip READMEs,
lib/Film.tsx (foreground-wipe + unbuild + loop underlay), lib/exit.tsx; rendered `CanalSample-S8` (kit sample at the
landing pose). No V2S8 code written yet; `src/v2r/scenes/V2S8.tsx` is still the placeholder. No kit/boards yet (L5).

**Findings for the next session:**
- Kit `S8Set` (src/v2r/kit/canal/sets.tsx) is a usable base but sparse: big empty paving y 1250-1550 centre, and at the
  landing pose the board B (x 150-630) hides the lane's depth (VP (600, 948)) and every receding lamp, so the 37.18
  "lamp run west down the lane" does not read. Plan: own parallax layers in `V2S8_*.tsx` (far / water / path / house /
  near, each with its truck dx: map `S8.truck` board 250, ghosts 240, house 160, sky 0; S8Set only shifts house + lamps,
  the paving does not shift); make the run legible with lamp heads + string-light catenaries in y 600-700 above the board
  and lamps on the house side (x 640-1080; heads above y 840 are outside the rail).
- Ghosts: map spots (658/696/734, feet 1084-1060, 140/135/130 px) on the 240 px plane: pre-truck x 418-494, between the
  board and her door (520-610), then the truck slides them in front of her SHUT door. Keep that (decision to note).
- Pip handoff from S7's wiper: lib wipeEdgeX(p, 'left', half); BoatWiper.half = 630 (canal kit). At 33.00 the wiper
  centre is at x ~ -12 (stern ~ x 618). Plan: Pip leaps off the stern ~33.00 to the pre-truck bollard (450, 1205),
  landing 33.20; REQUEST L5 to draw Pip on the wiper roof until 33.00 at the matching spot.
- Seam: end on a 1.00 -> 1.05 push about W (860, 700) (37.70 -> 39.08, ease-out to zero speed, so S1's ease-in pull-out
  continues it); sky `useExit() > 0 ? 'transparent' : sky`; Pip in `<NoExit>` hopping to S1's f0 bollard on screen =
  s1Screen(S1_BOLLARD, 0) = (692, 1262). REQUEST L1: no Pip drawn at t < 0 (S8's Pip arrives), or both would show.
- Local times (film - 32.93): visible from -0.23; walk 0.23; Pip lands 0.27; can't 0.85; door 1.62 / shut 1.82; W 2.02;
  truck 2.06-2.67; wipe 2.79; pen 3.61; facts 4.25; Pip looks up 4.77; un-build 5.89-6.15.

**Next:** build V2S8 at finished quality per the brief, review files + critic loop, report_L6.md.

## 2026-10-27, second session (ultracode): skeleton pushed, no builders run yet
**Done (pushed):**
- `src/v2r/scenes/V2S8_clock.ts`: the shot's ONE clock (scene s = film - 32.93; every beat in `S8T`), the camera
  contract: a 7 % linear float multiplied into the in-out truck (`camC`, continuous speed, lands exactly at 35.60 with
  zero speed), per-plane truck dx `PLANE_DX` (map's sky 0 / house 160 / ghosts 240 / board 250 + L6's far 24, south 60,
  water 110, lampsFar 140, boat 270, near 320), `planeOffset`, `groundDxAtY` (paving shear by depth), the seam push
  `seamZoom` 1.00 -> 1.05 about W 37.70-38.82 (ease in-out, then held through the un-build so W = 157.5 x 178.5 =
  S1 f0 and S1's ease-in pull-out starts from rest), `pushPt`, `S1_F0_PIP` (692, 1261.75). Ghost decision noted there:
  they pop left of her door (pre-truck 418-494), the truck slides them in front of her SHUT door (658-734).
- `src/v2r/scenes/V2S8_exit.tsx`: `LateExit` (ghosts + W leave last) / `EarlyExit` (busy life first).
- `src/v2r/scenes/V2S8.tsx`: the assembly (World sky `skyBands('sunset', true)`, `'transparent'` once useExit() > 0;
  XG seam push about W; z-order S8Back, S8Window, S8Public, S8Her, S8DoorLeaf, S8GhostsLayer, S8Board, S8Front; S8Pip in
  screen space). Part files are STUBS: `V2S8_set.tsx` (kit S8Set at the plane offsets), `V2S8_board.tsx`,
  `V2S8_cast.tsx` (kit S8Ghosts on the ghost plane), `V2S8_pip.tsx`. Typecheck clean; Film2R-V2S8 renders.
- Wipe maths (BoatWiper.half 630): stern edge 1130 @32.93, 578 @33.00, 253 @33.05, 29 @33.10: an S8-drawn Pip at
  x ~540 is under the boat for only ~1-2 frames after 33.00, so the handoff reads even if L5 draws no Pip on the roof.
- References at 216 px were extracted to scratch (regenerate: ffmpeg fps=1, scale=216:-2).

**Next (planned workflow, not started):** 3 builders on separate files (set: denser parallax lane, lamp heads +
catenaries y 600-700 above B, house-side lamps, life, W + door leaf; board: interim HerBoard face per L5's handover
decisions until `kit/boards/StatementBoard` lands, SHE SAYS pop + clack 33.16, smudged menu, cafe owner one-stroke
wipe 35.72, quote pen 36.54-37.10 / 37.20-37.70, credit at 36.54, two readers stop left of B on 37.18; cast + Pip: her
walk home + goIn, the ghosts, the public, Pip hop 33.00-33.20, earsDown 33.78, lookUp at W 37.70, NoExit hop to
`S1_F0_PIP` on the un-build), then critics (brief prompt + seam checker + standards) and fix rounds, report_L6.md.
REQUESTS still to file: L1 draw no Pip at t < 0 (S8's Pip arrives on the seam); L5 Pip on the wiper roof until 33.00.

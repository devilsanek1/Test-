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

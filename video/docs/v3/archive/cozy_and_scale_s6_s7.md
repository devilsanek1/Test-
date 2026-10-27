# COZY_AND_SCALE §6-§7 (archived 2026-10-27)

Moved out of `docs/look/COZY_AND_SCALE.md` on 2026-10-27: §6 was v3's first cozy/scale plan (the chip mountain, a data
center in the window, "hard cut to a matching frame 0"), superseded by the owner's G3 notes and the v3 rework
(`docs/v3/OWNER_NOTES.md`), plus early v2 ideas (v2 restarted with its own treatment); §7 was the G3-G5 build list
of 2026-10-26. History only: never brief a lane from it. The current look is `docs/look/DIRECTION.md`; what is still
to build is the craft tooling lane in `docs/PIPELINE_V2.md`.

## 6. Applying it
**v3 (laptop prices; Sage Study nook, Dusk exterior).** The data center is a stylised stack; real campuses are wide (Meta's
Hyperion, Louisiana, ~4x Central Park by 2030; Abilene ~1 Central Park late 2026 [REPORTED, Epoch AI]): the footnote says so.
1. **Frame 0 (0-2.8 s), cozy 1:1 POV, hook caption on frame 0:** bookshelf x 0-0.22 W cut by the top, flat across the captions;
   the frosty window (20-25 % with its reveal) holds the data center as a flat `#BAC3CE` grid (>= 60 px, in y 600-1250); lamp
   pool on the taped hinge; phone cut by the bottom, "Add to cart" and the tag (the pop) in the stage; push 3 % on NEXT.
2. **Proofs (7-19 s), cozy:** the fogged window is the chart surface (opening <= 25 %); the glide along the line is a truck,
   `CAM.ease`, <= 15 px/frame. The data center's LEDs are light ticks, no glow; the hero sits on the laptop and the chips.
3. **Scale (19.9-24.3 s), K9 -> K3, landing in K6 framing:** the push through the window starts ~0.7 s before the cut; the
   mullion wipe flips Sage -> Dusk; a ~500 px crane in ~2.2 s (peak 15 with the roofs at f 1.3) over snowy roofs (`#8A9AA8`,
   snow `#D9DEE5`) unveils the data center (depth 0.85, cut by the top); on MOUNTAINS the chip mountain (hero) slides in beside
   the figure, one group on the axis; land by ~22.8 s: horizon 0.55-0.59 H, door in the stage, ruler = houses with 2-3 windows
   in the lamp tint (not the pop) + a 60-80 px back-view figure on a roof terrace at camera height (>= 10:1); hold 1.2-1.5 s
   through "they pay more" (the conveyor clunk = the one secondary motion); the footnote gives the true unit.
4. **Back home (30.7-37.6 s), cozy:** the K1 cut back from the auction hall to the nook (one floor taller outside). The breach,
   once: on the ding a single cold LED band crosses the desk for <= 0.5 s, one step, no flicker. Calendar flips at the window.
5. **Ending (37.9-42.8 s):** the tag close-up (pop), push 3 % (`CAM.slow`), the thumb hovering; hard cut to a matching frame 0.

**v2 (staff resigning, afraid to speak out), angle-agnostic ideas (use at most 1-2 of the scale ones):**
- **[cozy]** An engineer's table at night, lamp pool on hands and a half-written letter; the HQ's cold grid far off in the window.
- **[cozy, inverted]** "Afraid to speak": the room as a canyon (>= 2:1), blinds down, pool shrinking; speaking out = the window opens.
- **[scale]** K6: a lone back-view figure (60-100 px) on a plaza under a glass HQ cut by the top and both sides
  (`WallOfWindows`, keepDark behind captions), camera at their eye level, the building a flat cool fill: no hero, no rim.
- **[scale]** K4 + K8 (CineDemo C): from one lit desk window back to an unlit office block (cool mids): one window = one voice.
- **[cozy -> scale]** Night windows light one by one (`LitWindows`) for others who spoke out: the verified count, a minority.
- **[scale, once]** K10: the institution's high view over a crowd or campus, calm and symmetric; never down on one person.

## 7. Build list for G3-G5 (S = half a day, M = 1 day, L = 2+ days [AU §5])
1. **G3:** `revealPlan()` + a 5 s test of v3's K9 -> K3 move under the cap, through the cut (S), so it fits the VO; `roomBox`
   + openings as evenodd holes (S) + `Portal` at depth -0.5 (S, from the framing pack): every nook shot, K9, v2's room.
2. **G4:** palette scope (M): Sage Study <-> Dusk in core `<Tod map>` and cine `useTodPal`, TOD / `todSteps` per palette.
3. **G4:** `LightPool` + `LampCone` + pool anchor (M), replacing four scene one-offs; Tod `interior` role + WindowLight (S).
4. **G4:** DataCenter colossus (M): louvred faces, LED rows on `LitWindows`, chillers, vapour, `quietAbove`, door, chip mountain.
5. **G5:** interior props (L: Bookshelf with batched spines and a flat top, Desk, DeskLamp, FrostyWindow, Mug + steam,
   Calendar, Phone + PriceTag, old Laptop, in core `Ink` / `Fill`); Snow (S); capcheck UI mask (S); HangingLamp (S).
6. **G5 (cozy v2, before the next cozy hold):** a float mode in the shot camera (`ShotCam` / `CineCamera`: translation legs
   that turn back within ±12 px of home, eased turns, sub-pixel, overscan) (S); `density.py --cozy` DONE (float, movers,
   empty, cv: `LIFE_AND_DENSITY.md` §9); still TO BUILD in the meter (S): void (largest empty patch), thing counts, colours
   per patch, layers, and a profile tag per shot so film averages of ev/s and gap count BUSY shots only; BALCONY and
   RIVERSIDE set templates (lid, caption-plane facade, C-curve and mouth; backdrop, bank, water) (M).
7. **Later:** street kit (M: `quietY`, `closer`, ivy, `Flank`) before any lane shot; cine inkComp (M, before any K4 over cine
   pieces, e.g. v2's office-block pull-back); tilt keystone (M, cut first).

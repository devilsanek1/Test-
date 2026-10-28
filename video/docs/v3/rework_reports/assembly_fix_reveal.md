# v3 rework assembly, REVEAL fix lane (SQD 19.40-22.68 + the far pile in SQE / SQF), 2026-10-28

Files: `src/v3/film/scenes/SQD_peak.tsx` only. Run lean (the orchestrator's stop note): no full-film render, stills at 19.6-22.4.
Before = HEAD renders (PNG, same renderer); counters: R2's `pilecount.py` (dark marks in y 620-1800) and R2's speck definition
(`reveal/tools/specks.py`, the 430 x 245 px pile box). Evidence: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/reveal/`.

## Results
1. **R2-1 / R3-1 (blocker): fixed.** Chips and pins are drawn only on the crest's 8 sticks, in THE stick's values one step under it (chips L* 27, not #966E59 L* 50; pins L* 86; board L* 70). Every row stick is a flat gold board: rows near the summit have one flat pin band (L* 83), and the seams are 4 L* under the board (was 10). Dark marks: 19.7 210 -> 19.6 156; 20.0 352 -> 221; 20.4 760 -> 205; 20.8 634 -> 121; 21.2 216 -> 180 (pilot room 150-168). Phone look: "a stick on a pile of memory sticks" at 19.6-20.4, a gold pile at 20.8.
2. **R1-3 (major): fixed.** The second layer's six crest sticks now lie nearly level (tilts up to 26 deg -> up to 10 deg), each with a 12-tooth light pin comb (L* 86 on the L* 70 board; the old pins sat 5 L* above it). THE stick's share of the top-3 % salience: 19.6 / 20.0 100 / 90 % (before 99 / 91 %).
3. **R3-1's "muddy tan" flank:** the form shade keeps >= 0.95x the board's chroma (CRAFT §d.3): L* 60, C* 37 (was C* 31.5).
4. **R2-2 (major): fixed.** Every detail tone converges on its zone's flat value while THE stick shrinks from 120 to 39 px on screen (~20.8-21.45). After that the pile is its silhouette in three clean flat regions: the lit upper-left slope L* 75, the gold L* 70, the form shade L* 60. It takes half the +3 step toward FAR_AIR while it is the beat's subject, and the full step (k .40, hue kept, C* 39 -> 26) from 23.10, in the rim's 2-step. Specks at rest: 2,525 -> 370 per Mpx at 37.2 (351 at 22.4); the pilot's window is 207-323 on the same counter. Canny edges 13.2 -> 2.3 %, mean C* 32.7 -> 25.5. The calm switch at 21.45 changes 6.1 % of the pile box, against 4.0-5.4 % for its neighbours (camera motion): no pop.
5. **Not met: R2's "the mountain >= 3 dE closer to the air than the DC".** The gold sits across the hue circle from the dusk air, so CRAFT §f.2 keeps its hue, and its fills only fall from dE76 63 to 50 (DC 19.5). check_depth was not re-run (the lean brief).
6. **Checks:** `npx tsc --noEmit` 0 errors. Seam probe (Film3Seams, full size): J1 / J2 / J4 / J5 0.0000 % at f - 1 and f. J3, same script, the integrator's film (be03dfa) -> now: carry 0.44 -> 0.44, eye jump 0.037 -> 0.040, colour shift 8.7 -> 11.0 (a declared light change, under 15).

REQUESTS:
- flow_v2.md §4 SQD + §5 SQD light (orchestrator): replace "pins, four warm dark chips 20 L* under the board ... pale to tier C (11 L*) by 50 px, chips pale further out, the lower pile flat boards" with "chips (L* 27) and a 12-pin comb (L* 86) on the crest's 8 sticks only, near level; the rows flat gold boards (a pin band near the summit); all detail converges to three flat values (lit slope, gold, form shade) by 39 px; at rest the +3 air step, half on the pile's beat, full from 23.10".
- Integrator: re-run check_depth (R2's H2 sheet) and check_light at 20.8 / 21.4 on the next full render.

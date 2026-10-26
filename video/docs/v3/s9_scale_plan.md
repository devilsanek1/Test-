# S9 scale plan: the pull-back's end frame and move, vast and alive (G5b rollout, for the S9 lane)

**Why.** The owner on Arcane #55's end (2026-10-26): "how GREAT the SCALE feels"; "alive because of the density of the city and
the details there and the clouds / birds". Our G5 end (@3.0 s) fails it: the bottom 25 % is flat bright-orange deck, the town is
3 rows of one stamped house (62 / 86 / 112 px: neighbours within 1.5x), the hall is 9 far houses wide, the mountain a round heap
cut high by the right edge, the sky empty. Recipe: `docs/look/CINEMATIC_GUIDE.md` "Scale cues" 1-11. This plan wins over
`density_plan_g5b.md` S9 where they differ (far houses, birds, clouds; no tram: it would move inside the town mass).
**Locked:** the start frame and its slot (hill town y 884-896); maps S9_FAR / MID / DECK / STACK / VENT; 155 f on the S5 ease +
42 f hold; the pot (1.00-1.62 s) and swap (1.333 s); tiny you (184 px, feet (490, 1490)) at the parapet (top 1398); the dark hall,
sign lit (signH 52); the mountain in from 1.70 s, landing on "mountain" (2.32 s), summit y 626; y 317-556 plain sky.
**Ruler** F = 184 px. **Horizon y 960** (the far ground drops from the hill to 960 by far x -150): (feet - horizon) / F = 2.88
(Arcane 2.0-2.4, limit 3.0); heads 1.8 F under it. Each band 2.2-3x smaller than the one in front.

## 1. The end frame by plane (end coords = screen at rest). Values: flat mixes toward `skyLow` #7D8AB6, L* in brackets
| plane (y) | what and how big | darks / lights / windows; ink; values |
|---|---|---|
| sky 0-600 | flat; one corner cloud cut by the top and right edges (x 620-1080+, y 0-230): all 4 edges are cut | `sky` (45); cloud #6C7AA5 (52) / `skyLow`; no ink; 2 |
| hero cloud bank (far plane, behind all) | lobed top y 600-720 over x 0-650 (lobes 180-450 wide, 60-110 tall, biggest behind the hall), ~760 behind the mountain; flat base on a glow strip y 905-960; spans far x -1200..1400 to ride the 1 W slide; the hall (darkest) and summit (warmest) stand on the palest. New look: flag at G5b | body `skyLow` (58), belly #6C7AA5, crown rims `frost` (85) 15-25 %; glow strip #A4B0D1 (72), the brightest band; no ink; 3 |
| infinity 960-972 (65 %) | one line of 7-9 px roof chips exiting the left edge (over the stack top, in the gap left of the hall); a second data center x 60-95, 32 x 18, one LED dot, no sign ("data centers", plural) | #636E97 (47) / #A2ACCD (71); no windows, no ink; 2 |
| far field 972-1035 (40 %) | 6 seeded rows every 9-10 px, roofs 16 -> 9 wide x 6-8 tall (2 shapes), each hiding half the row behind, no gaps; a chimney tick (2 x 14-20) per 3-4 roofs; ~250 roofs: detail peaks here; hides the campus and mountain feet | #505A81 (39) / #BCC4DD (79) / 1-2 px dots #D2A978 on 1 roof in 3; no ink; 3 |
| campus + mountain (behind the far field) | hall x 270-650, w 380, top 795 (was 340 x 180) = ~30 far roofs; fans a run of 7 (18 px on 44), LEDs 3 x 6 px dots on 9 (2x the mid windows, 2 bands farther). Hall B (no sign) x 640-900, top 905, plume (y >= 680, never over sign or summit). 5 pylons off the right edge, 60/46/36/28/22 px. Mountain as a PEAK: summit (760, 626), crest of jutting stick ends 10-16 px, flanks 30-35 deg, the right one leaving the edge low (y ~830); sticks 40 px at the foot -> 20 at the crest | hall `dcDark` (18), ink #333958; hall B #373E5D (27); pylons #505A81; sign `led` + ink (locked); pile gold #CFA67C (71) / #BD956D (64), chips #463E46 (27), ink #826A5A: 44 L range = 0.65x the near (huge yet far) |
| mid band 1035-1100 (22 %), new plane S9_FAR2 | 3-4 rows of 22-34 px roofs with snow tops; the roofline climbs 40 px from x 560 to 1000 toward the mountain; ~60 roofs | #424C71 (33) / #CFD6E9 (86) / 2-3 px dots #E3AF6D on 6; hairline; 4 |
| near-mid 1100-1230 (12 %), mid plane | 2-3 rows of 50-80 px houses in 5 types (gable, terrace with dormer runs of 4-6, flat block with balconies, mansard, corner shop with a lit sign), +-15 % width, +-1 roof-height steps, 30 % overlap, 3-4 chimneys smoking | #3B4469 (30) / #D9DFEF (89) / 4-6 px windows #ECB266 on 12; full; 4-5 |
| the drop: the street as a canyon, VP (470, 980) under the hall | no floor near us: a slot 80 px wide at the parapet (x 430-510), its right wall lit behind your head (4-5 storeys of ticks 9 x 12 -> 3 x 4), string lights across it in 3 spans (y ~1150/1200/1260, bulbs 5-8); the floor only past y 1120: a lit ribbon 26 -> 3 px, the 5 lamps (halos 24 -> 10), 6-10 posed walkers (8-14 px, a sledge, a dog), one car's two lights heading for the gate | slot `dcDark`; lit wall #D9DFEF; ribbon `road`; lights `houseLit` / `core`; full |
| near roofs 1230-1398 (0 %), new plane S9_NEAR | 3 calm masses: a terrace x -40-400 (5 dormers 17 px on 28, 2 stacks 40-60 px smoking, a ~40 px neighbour shovelling), a mansard x 540-820 (windows 10 x 14 on 26), a flat roof behind the hut; a skylight ridge (620, 1395) -> (720, 1250) aimed at the campus | `dcDark` / `roofs` (18-25) / `snow` (93) / `houseLit` + `core`; full; 5 |
| our roof = near anchor, 30-35 % of the frame (warm, dark) | stack (left frame, shade side ~70 %); stair hut right x 800-1080, top 1170, cut right and bottom (snow roof, window 70 x 90, door ajar with a 2-step light pool x 560-900, y 1760-1920, antenna + pennant at y ~1060); deck in shade, snow drifts ~30 %, 8-10 footprint pairs from the bottom edge to you; vent + shovel + 2 snowy pots bottom-left; chair, table and steaming mug (x 620-780, y 1600-1760); fairy lights on the lip (20 bulbs) and the hut's eave; `PipTiny` (50-60 px) at your left; nothing else within 60 px of you | `anchor` (15), `brickShade` (32), parapet face `beam` (41) / snow #B4BEDC (77), pool `desk` (68) + `ring` (84) / `houseLit`; full; 5 |

Ranges 68 : 59 : 53 : 40 : 24 L from near to infinity; no gradients, no glow, warm only on our side and the sticks.

## 2. What moves
- **Move (locked timing):** parallax bank / infinity / far 1.0 | S9_FAR2 ~0.95 | mid 0.85 | S9_NEAR ~0.6 | stack 0.4 | deck 0; near
  flakes (8-10 px) rush past; 2-3 white wisps off the near stacks at p 0.4-0.7 (cut in 1-1.5 s); the pot's trailing edge uncovers
  the bank and glow strip (the burst); hut and clutter slide in after p 0.75; Pip moves behind the pot; streams as built.
- **Hold (3 tiers, never 1 s still, <= 2 % of the frame):** fast: a V of 5 birds (24-36 px `ink`, 2 far ones `roofs`) from the left
  edge at 1.85 s, (-40, 610) -> (440, 700), 5.5 wingspans/s, flap 3-4 Hz, one gliding, ~100 px above the streams. Periodic: pennant
  1.5-2 Hz, a bulb every ~0.5 s, mug steam, smoke drifting right, the shoveller. Slow: bank 3-5 px/s right, plume ~20 px/s, car 4-8
  px/s; one near window pops on (~2.9 s); your hair and sleeve 1-3 px; thoom (2.32 s): snow puffs off the roofs, Pip hops. Nothing
  else moves inside the town mass.

## 3. The S9 lane's file changes
1. `scenes/S9.tsx`: horizon 960 (hill kept, ground at 960 from x -150); BAND_TOP band -> `CloudBank` + glow strip + corner cloud;
   FAR_HOUSES keep the 2 hill rows (the start), the foot rows -> `FarField`; infinity line, second DC; HALL {x 460, y 1005, w 380,
   h 210}, hall B, plume, pylons; Pile as a peak; planes S9_FAR2 {o [500, 960], off [1040, -120], k 1.4} and S9_NEAR {o [480,
   1250], off [560, 60], k 3: hidden behind the start parapet, rising as it drops}, tuned with `planeSpeed` (<= 25 px/f); MidTown
   -> near-mid band + canyon; DeckPlane re-dressed; `Birds`; 3 snow layers (far 2-3 px sparse; clip y >= 625). The p 0 frame
   stays the locked start: the slot its only bright view.
2. `kit/Outside.tsx`: `FarField`, `CloudBank` (lobed flat silhouette, 3 fills), `DataCenter` options (fan run, LED dot grid, ink
   colour, no-sign hall B, plume), `Pylons`. 3. `kit/Memory.tsx` `Pile`: `peak`, crest stick ends, graded `stickW`, far `tone`.
4. `kit/Rooftop.tsx`: `MidTown` 5 types, runs by band, `canyon` mode; `RoofDeck` shade, drifts, footprints, pool; new `NearRoofs`,
   `StairHut`, `DeckClutter`. 5. `film/palette.ts` + `kit/README.md`: `planeTone(color, mix)` and the swatches above.
   6. `lib/cine/sky.tsx` `Birds`: a glide phase (TO BUILD); `PipTiny` per the density plan.

**Checks (@3.0 s, OpenCV):** horizon row 960 +-10; ridge offsets halve per band; per-plane L10 climbs to the sky; edge-density peak
in 972-1035; near anchor 30-35 %; `scripts/qa/density.py`. Phone cold read: does the world keep going, do the mountain's sticks
read (else foot sticks 48 px), do the birds read as birds, is the bank still but not frozen?

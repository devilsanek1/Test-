# Report L1 (look): V2S1 "Walking out" = the G4 look clip (2026-10-27)

**The clip:** `video/deliverables/v2/v2r_G4_look.mp4`: Film2R frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps,
h264 crf 16, with the voice (2.1 MB). It ends on the plum bridge, the push-through's midpoint. S2's first frames
(6.15-6.28) are left out: L2 has not conformed them yet, and they show near strangers' backs (see REQUESTS).
**The sheet:** `video/deliverables/v2/v2r_G4_look_sheet.jpg`: 0.4 scale (432 px per frame), every 0.25 s, 25 frames
and the plum.
Commits: 14ac5f5 ... 0b7f2a3 (the conform and the pre-critic clip); c8a9aed, 66aa2af and the last L1 commit (the fixes
after the critic and after the cold viewer, then this clip).

## v4: the art director's list on v3, in one pass (2026-10-28)
**The clip:** `video/deliverables/v2/v2r_G4_look_v4.mp4`, the master encode (PNG frames, BT.709, x264 CRF 14 slow
aq-mode 3, yuv420p). Frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps, with the current mix, 3.8 MB. It is rendered on
top of the sky critic's b6861a5 (S1_EVENING's sun warmth lower and wider, 340x153), so it shows S1's current sky.
**The sheet:** `video/deliverables/v2/v2r_G4_look_v4_sheet.jpg` (0.4 scale, every 0.25 s).
Commits: 02e0c9c (the far city, the wing, the canal), f48a342 (the terrace, the particles), a50f725 (the depth sheets),
bc9d11f and ab8f872 (two fixes the first v4 render's checks found, below), then this clip.

**MUST**
1. **The sun's tooth is gone.** One level roof edge runs under the sun: the near far-roof is a flat roof at y 758 from
   x 118 to 216, and the gable beside it lost its stacks. The disc (196, 772) r 52 sets on a clean roofline.
2. **The tower is a building** (`CalmTower`, V2S1_set_far), measured on the master:

   | part | what | value |
   |---|---|---|
   | body | lavender limestone, set by `backing` | L* 74.1 |
   | windows | `toneOnTone`, 14x18 px, rows of three every 34 px | L* 69.9, **dE 4.2** from the wall (<= 6) |
   | top | a set-back crown (26 px) with a small planted box | |
   | sun edge | a 5 px lit sliver at the left (the low sun is west) | L* 78.0 (+3.9) |
   | foot | the bottom 56 px in the warm air near the horizon | L* 78.9, h ~335 (rose; the body h 291) |

   The wing's lit end wall stands 17.3 L* off the tower.
3. **Particles at phone size** (`S1Particles`, V2S1; `particleProblems` and `floatProblems` clean, at most 10 alive):

   | field | size | when | where |
   |---|---|---|---|
   | glints | 14-24 px dashes | 2-4 at once from 1.5 s | the glitter path under the sun |
   | the second leaf | 13 px, gold or rust | alive from 2.75 s | across the mid ground: x 164-213, y 1412-1560 over 3.0-5.0 s, clear of the row and the band |
   | motes | 3-4 px, at most 4 | from 0.3 s | on the shaded tower (x 252-356, y 640-920) |

**SHOULD**

4. **The near terrace is calmer.**
   - The paving is peach cream `BANK_PAVE` #F4D6C2 (L* 87.6, C* 15.5, **h 61.8**; it was CM.paving, sand-beige h 71-83).
     The second stone #EFCEB9 (h 60) and the joints #E2C1AD (h 59) follow it.
   - The right pier is one warm value, #DDB49B (L* 76, C* 21.5, h 58.5; it was the taupe #B79B8A, L* 66 C* 14.9),
     under a lit coping, with its one `Shade` step.
   - Three props are cut: the tote, the flask (the bottle) and the nearest chair.
5. **One camera.** The wing's top and base now run toward the left vanishing point: the top falls 56 px over 750 px and
   the base rises 18 px. A 16 px west end wall shows at the corner. W stays on its map spot (its corners within 1.7 px),
   and so do the door, her path and the caption band.
   - **Decision: the end wall is LIT** (#F3EBDF), not shaded: it faces the low western sun.
   - **Decision: the convergence stays slight.** A full convergence to the ground's vanishing point would move W off
     the spot the S2 push-through needs.
6. **Birds and bus.**
   - The rail birds are pale (`atmos` 0.55 toward the haze) and small (10-12 px). They lift at **2.45**
     (`map.ts` S1_CLOCK.birdsLiftBridge, was 1.40), fly low west in front of the far roofs and leave off the left
     edge, never over the disc.
   - **Decision: the bus is calmer but not later.** It sits one step deeper in the haze (k 0.58) and keeps its 1.10
     time, which is its sound cue (`audio/v2r/sheet.py` LIFE).

**CHEAP**
- The door leaves are clipped to their track.
- The canal has two soft reflections only: the wing's and the sun's.
- The ghost duck is gone: one duck at the water's scale.
- The boater has hair (no mask-like head).
- The lavender steam (the chimney puff) is gone.
- The pink lifebuoy ring under W is gone.
- **A darker backing behind the oat copies:** the ground storey sits in one `Shade` step behind the row; the door bay
  and its sign stay lit. See the copies' row under WARNs.

**Found by the first v4 render's checks, fixed before this one**
- **check_light FAILED at 3.0 s** (greyed 333 px against a budget of 259). My softened reflections and the far water
  band were straight sRGB mixes, and a warm colour mixed into teal crosses grey:
  - the wing's reflection was khaki #C0B7A6;
  - the sun's was olive #CACBA3 (inside the olive band);
  - the far water was grey-green #BACBBD.

  The boats' waterline strips, in the rig's rose cast, then took them under C* 8. The fix:
  - all three go through `atmos` (hue kept, C* >= 12): #D7B2A1 soft peach, #E0C69B soft gold, #ADCEC8 pale teal;
  - the strips take the water's own deeper step (`tintFor(CM.water, CM.waterDeep)`).

  Greyed is now 39 / 123 / 80 px.
- **The tower's foot was lighter, not warmer.** `atmos` keeps a cool hue under a warm air. The foot now takes atmos's
  value step with its hue turned 50° the warm way round (lavender → rose → peach), C* >= 10.

**Checks (on the master)**
- **check_banding** at 0.5, 3.0 and 5.3 s, on my two open-sky regions and the sky critic's three (`skies.ts`):

  | region | verdict | max step dE00 | staircase | grain L* |
  |---|---|---|---|---|
  | x 0-160 y 262-700 | PASS x3 | 0.42-0.72 | 0.03-0.05 | 0.20 |
  | x 1005-1080 y 0-590 | PASS x3 | 0.36-0.53 | 0.05-0.13 | 0.22-0.23 |
  | the west gap, 0,560,250,712 | PASS x3 | 0.12-0.29 | 0.00 | 0.31 |
  | the zenith, 400,0,1080,170 | PASS x3 | 0.25-0.26 | 0.05-0.08 | 0.29 |
  | the band, 0,270,1080,560 | PASS at 3.0 and 5.3, WARN at 0.5 | 1.15-1.40 | 0.02-0.05 | 0.15-0.16 |

  The caption band stays flat: dL* 0.01-0.02 at L* 84.8. The one step at 0.5 s (x 512-576, y 467) is the caption
  line "She quit Google." (its "quit" highlight), not the sky; that line is gone by 3.0 s.
- **skyProblems(S1_EVENING, {ink}):** [] on the merged sky.
- **check_depth: 0 FAIL, 5 WARN** at 5.4 s and at 3.0 s. The sheets' wing outline now follows the end wall's edge
  (x 314) and the sloped top; the old outline FAILs on v4, the new one on v3. Their air is S1_AIR's new #FDD6B8.

  | at 5.4 s | v4 | v3 |
  |---|---|---|
  | the wing's west edge, median \|ΔL*\| (OK) | 13.9 | 14.9 |
  | her (OK) | 22.2 | 25.4 |
  | subject's plane → +3 (WARN, needs 12) | **9.4** | 7.7 |
  | the copies' row (WARN, needs 15) | 8.3 | 10.4 |
  | front row (+3) dE from the air | 12.4 | 12.3 |
  | farthest plane (+4) dE from the air | 10.4 | 10.2 |

  At 3.0 s the wing is 13.8, her 22.4, and G1-G2 **10.2** (6.4 on v3's frame; WARN, needs 12; a GrabCut box, which
  moves by a point or two with small changes behind the copies).
- **check_light A/B** at 0.5, 3.0 and 5.3 s: **OK** every time.
  - The brightest 5 % sits 0.045-0.058 H from the subject.
  - Greyed: 39 / 123 / 80 px (v3: 123 / 220 / 158).
  - The caption band stays flat (spread 0.0).
- **particleProblems** and **floatProblems**: clean. Typecheck clean.

**WARNs left**
- **The copies' row (8.3).** The coats now step off the glazed ground storey behind them by ~7 L*: oat L* 84-85
  against the unlit glass, which went from L* 86.7 to 77.7 in the shade (v3: ~2). But the row's whole outline also has
  dark heads and legs, and those now sit on a darker wall, so the median fell.
  - **A next step if you want the row to read by value:** the ground storey's unlit panes one step deeper (glass in
    shade reads dark). At L* ~70 the coats step ~14. It changes the window life, so it is not in this pass.
- **Her (22.2, OK, down from 25.4):** the same shade sits behind her dark coat.
- **The ladder:** +4 is not 3 closer to the air than +3 (10.4 against 12.4).
- **The far plane's edges:** 0.87x the subject plane's.
- **The bank's texture gradient:** the near half's big things add crossings.

**REQUESTS** (the orchestrator's answers, 2026-10-28: the birds' sound goes to the final sound re-time, W4, after
assembly; the water tint is approved and in `rigs.ts`)
- **Sound lane (`audio/v2r/sheet.py`, the birds against the picture), for W4:**
  - `wings:1` (1.46) and the bridge birds' calls (1.50, 1.74) were placed in the pause after "Google." (1.46-2.00)
    for the old 1.40 lift. In v4's mix they play while the birds are still on the rail.
  - The voice runs without a pause from 2.00 to 4.54 ("And she says her contract bans her from criticizing it"), and
    G2's tick is at 2.53.
  - The options:
    - wings soft under "her contract" at ~2.50, and the calls in the 4.54-4.79 pause;
    - no SFX (far birds can lift silently);
    - or the art director accepts a lift back in the 1.46-2.00 pause (still pale, small and off the disc), and I set
      `birdsLiftBridge` to ~1.50.
- **`src/v2r/world/rigs.ts`: DONE.** TINT_CANAL now has `water` (`tintFor(CM.water, CM.waterDeep)`), so every
  lane's shades on the canal stay teal; lanes write `tint="water"`. The rig's rose family greys teal water. S1's
  waterline strips use it, and their frames are pixel-identical to v4's.
- (The skies.ts banding region I meant to flag, 0,0,330,712, is already replaced by the sky critic's open-sky regions
  in b6861a5.)

---

## v3: the clip for the art director, then the owner (2026-10-28)
**The clip:** `video/deliverables/v2/v2r_G4_look_v3.mp4`, the MASTER encode: `scripts/render-media.mjs --master`
(PNG frames, BT.709, x264 CRF 14 slow aq-mode 3, yuv420p). Frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps, with the
current mix, 4.1 MB.
**The sheet:** `video/deliverables/v2/v2r_G4_look_v3_sheet.jpg` (0.4 scale, every 0.25 s).

What v3 holds, on top of v2:
- **The ground:** two-point perspective (one vanishing point on the canal's horizon; treads foreshortened 4.4x), near
  things at full value, a fern pot and a chair cut by the bottom edge, the planter box and the stone pier.
- **Depth:** the far city through lib/depth (atmos, planePalette, tone-on-tone windows), and a calm tower backing the
  wing's west edge.
- **Particles:** motes, glints in the glitter path, one leaf down the gutter.
- **The float:** the parallax float, at rest to 1.10 s and from 5.80 s.
- **People:** they sit at their depth. The seated public is off our bank; two people are on the bridge and one is
  through the arch; the ducks are at the water's scale.
- **The sky:** lib/sky's `<Sky spec={S1_EVENING}>`, one gentle OKLab gradient with the caption band flat. The low sun's
  warmth replaces the halo, and the far haze = `S1_AIR` (#FDD5B8).
- **The evening sun:** SUN0 (196, 772) r 52, setting behind the far roofs.

**Checks (on the master)**
- **check_banding** on the open sky (x 0-160 y 262-700, and x 1005-1080 y 0-590), at 0.5, 3.0 and 5.3 s: **PASS**
  every time.

  | | value |
  |---|---|
  | staircase | 0.00-0.06 |
  | max step dE00 | 0.07-0.82 |
  | grain | 0.28-0.29 L* |
  | caption band dL* | 0.13-0.15 (L* 84.9) |

  A box with the plane branch or the cloud bar in it counts their edges as steps.
- **skyProblems(S1_EVENING, {ink}):** [].
- **check_depth** on the master's frames: **0 FAIL** at 5.4 s (5 WARN) and at 3.0 s. At 5.4 s:

  | | value |
  |---|---|
  | the wing's west edge, median \|ΔL*\| | 14.9 |
  | her, median \|ΔL*\| | 25.4 |
  | farthest plane dE from the air | 10.2 |
  | front row (+3) dE from the air | 12.3 |
  | the bank's lines to the vanishing points | 91 % |
  | size inversion | none |

- **check_light A/B:** OK at 0.5, 3.0 and 5.3 s. The brightest 5 % sits 0.015-0.028 H from the subject, and the light
  layer leaves the caption band flat.

**WARNs left:**
- the ladder (it falls 2.1; it needs 3);
- the subject → +3 step (7.7; it needs 12);
- the far plane's edges (0.85x);
- the copies' row against the wing (10.4; it needs 15);
- the bank's texture gradient (the near half's things).

---

## S1 on lib/depth + lib/particles (2026-10-28; CRAFT §f, conform_L1 §11; the sky lib follows)
**What changed**
- **Haze.** It runs through `atmos` (lib/depth), and the far rows go through `planePalette` with S1's one atmosphere
  `S1_ATM` (V2S1_set_core):
  - the air is the lowest sky step;
  - the planes: the back rows at +4 (k 0.90, at most 2-3 values), the front row at +3 (k 0.66), a 30° hue turn toward the
    warm air;
  - the front row's windows are `toneOnTone` on their receded wall, so never the lamp colour; the 1.80 window is one
    soft step lighter;
  - the gasholder's 1-3 px lattice and the far chimney pots are gone: nothing under 12 px on +4 (`planeLod`).
- **The wing's corner.** A calm far tower (`CalmTower`, V2S1_set_far) stands behind the wing's west edge. Its value
  comes from `backing(tierFill(limestone), …, {tier: 'environment', min: 15})`.
- **The bank's texture gradient.** The block spacing now scales with depth too, so the blocks are finer toward the
  water.
- **Particles.** The `S1Particles` slot holds three tier-C `<Particles>` fields:

  | field | where |
  |---|---|
  | motes | over the west gap |
  | glints | in `glitterPath` under SUN0, on the water |
  | one leaf | from the plane branch, down the left gutter (x < 95) |

  All three share t0 0.30, t1 5.75, joins [6.1], and avoid the caption band and her path. `particleProblems` is
  clean. On screen: 0-1 motes at first, 4-6 from 3 s; up to 3 glints; the leaf from ~4.3 s.

**Checks** (`scripts/qa/depth_sheets/v2_s1.json`, and `v2_s1_t3.0.json` for 3.0 s)
- **check_depth at 5.4 s: 0 FAIL, 8 WARN.** The G4 clip had FAIL x3; the first look clip and v2 failed all three too.

  | measure | now | before |
  |---|---|---|
  | farthest plane dE from the air | 9.3 | 12.0 |
  | front row (+3) dE from the air | 11.6 | |
  | the wing's west edge, median \|ΔL*\| (OK) | 15.3 | 4.4 |
  | her, median \|ΔL*\| (OK) | 25.8 | |
  | our bank's lines to the vanishing points | 91 % | 0 % |

- **check_depth at 3.0 s: 0 FAIL.** The wing's edge 15.4 OK; her 20.7 OK; G1-G2 11.3 (WARN).
- **check_light A/B:** OK at all three times, with the brightest 5 % 0.039-0.045 H from the subject.
- **Lines:** strokes 64 / 70 per Mpx.

**WARNs left**
- The ladder falls 2.3 (it needs 3).
- The subject's plane → +3 step is dE 7.8 (it needs 12).
- The far plane's edges are 0.89x the subject plane's.
- The copies' row is at 11.1 (it needs 15).
- The bank's texture: the near half's things add crossings.
- **Size inversion (needs your call).** The ducks are at 41 px/m and the seated public at 61 px/m, against her 100 px/m.
  Fixing it means the seated public at ~95-120 px, which is a composition change.

---

## One continuous sky + the evening sun (the owner's sky note, 2026-10-27; before the particles)
**Stills:** `video/docs/v2/lanes/img/L1_sky_0.4.jpg` (0.4 scale, at 0.5, 3.0 and 5.3 s).

**What the owner said:** "what bothered me is different color of the space and sun, like why is it blue sky and then
suddenly abruptly orange, weird". It is now a playbook rule (ONE CONTINUOUS SKY) and DIRECTION rule 6.

- **One sky** (`S1_SKY` and `S1_SKY_Y` in V2S1_set_core, painted by V2S1_sky's flood):
  - The caption field's mint (#BCDCCF) stays flat down to y 572, so the caption band (y 317-556) is one value and the
    caption contrast is unchanged: the band's sky is still L* 85.1.
  - Below it, five flat steps through pale cream-gold to a warm peach horizon: #CEDECD, #DFE1CB, #EDE3C9, #F8E0C3,
    #FBD9BB. Each step is dE 4-6 with dL* <= 2.
  - The steps hide behind the wing's roofline (y ~600) and show only over the west gap. No seam between unrelated
    colours anywhere.
- **An evening sun.** SUN0 is now **(196, 772) r 52**, 65 % of r 80, and lower.
  - It sits in the warmest step and sets **behind** the west gap's far roofs: it is drawn before them now.
  - One flat halo (#FFD4AE) one step warmer than its sky, 1.6x the disc (CRAFT §d allows up to 1.7x).
  - Frame 0's half-coloured disc moved into the set's `SunDisc`, behind the roofs too. `SunHalf` is retired.
  - The colour role is unchanged: orange on the sun only. The flood still starts from the sun: its origin follows
    SUN0 in `map.ts`.
  - **map.ts changed:** SUN0, and its notes in UI and the map sheet. S4 and S5 keep their own suns.
- **The far city's haze is the lowest sky step** (#FBD9BB, `S1_HAZE`), so the atmospheric perspective agrees with the
  sky.
- **check_light A/B:** OK at 0.5, 3.0 and 5.3 s. The brightest 5 % sits 0.044-0.049 H from the subject, and the light
  layer leaves the caption band flat (spread 0.0). Typecheck clean.

---

## v2: the owner's depth notes + the orchestrator's foreground fix (the clip to show the owner next)
**The clip:** `video/deliverables/v2/v2r_G4_look_v2.mp4`: the same frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps, with
the voice.
**The sheets:**
- `video/deliverables/v2/v2r_G4_look_v2_sheet.jpg`: 0.4 scale, every 0.25 s.
- **Before / after** `video/deliverables/v2/v2r_G4_look_v2_before_after.jpg`: 0.4 scale at 0.0, 0.5, 3.0 and 5.3 s; the
  top row is the first look clip, the bottom row is v2.

The commits are 955e4c3 (the foreground) and efbd8b8 (the depth pass), plus this report's commit.

**What the owner asked:** "the foreground and the main focus still blurs with the background ... no distance effect
nor perspective ... the bottom part ... little to no perspective or depth here at all".

**1. Separation: the Google wing in front of the far city**
- **Atmospheric perspective in flat colour.** Every plane of the west gap mixes toward one cool haze `S1_HAZE`
  (#EADCD8, pale rose-lilac), using `hazeBatch` (V2S1_set_core). Three clear steps (`HAZE_K`), and every far plane drops
  its lines:

  | plane | haze | windows |
  |---|---|---|
  | farthest roofs and the gasholder | 0.80 | none |
  | middle terraces | 0.62 | none |
  | near terraces | 0.46 | sash windows kept, never near-black; the 1.80 window still switches |
  | the bridge and the bus | 0.30 | |
  | the bridge's railing | 0.36 | |

  The aerials are gone.
- **A calm field behind the wing's west edge.** The far block right behind it is a plain cool block (no windows, no
  roof garden), so the wing's pale pier reads against a clear, darker field.
- **The wing itself is unchanged**: its full value range, and her and the row at the strongest contrast.

At 3.0 s, before and after:

| region | L* | C* | local contrast |
|---|---|---|---|
| far city, before | 75.1 | 22.5 | 7.2 |
| far city, after | 80.3 | 16.7 | **4.0** |
| the wing (both) | 75.3 | 17.9 | 8.6 |

The city's C* includes the bottom of the sun disc. The city used to be as dark as the wing, more saturated and nearly as
busy; now the wing has 2.2x its local contrast.

**2. Perspective on the ground.** One vanishing point, (540, 965), for every receding edge.
- **The treads.** Stone blocks, ~1-1.4 m, staggered by half a block from tread to tread. Their joints are thin flat
  strips running to the vanishing point, finer with distance (0.8 px far, 3.4 px near), in a warm mid stone (L* ~80, a
  value step, never a dark line). The block contrast grows toward us: the near treads alternate with oat, the far ones
  with paving.
- **The far towpath (the quay).** Two-tone slabs whose sides run to the same point, finer and closer in value than ours.
- **The water.** Three depth steps: the far third mixes toward the haze, the near third a step deeper. The reflection
  bands now thicken toward us (the far band was the thicker one).
- **The foreground** (V2S1_fore, from the orchestrator's 22:13 brief). Big, simple tier-C things at near scale, cut by
  the frame edges, in three layers:
  - mid: a stone bench cut by the right edge, with a backpack and a flask;
  - near: a stone planter with a bay tree cut by the left edge, a canvas tote at its foot, two stacked flower crates, a
    café table with cups and a paper, two rattan bistro chairs;
  - front: a stone parapet across the bottom with a book, a folded scarf and leaves on its cap, and its pier cut by the
    right edge, with a pot of thyme.

  The props sit only in those clusters. The old scatter (`ThingsOn`, `Leaves`, the bike, the guitar case...) is
  retired; the code stays in V2S1_public for now.
- **Light on the new things.** Contact and cast shadows; a form step on the side away from the sun; the faces turned to
  us one Shade step.
  - The old off-screen-tree shade across the near steps (`S1BankShade`) is retired: it cut the new things at an
    arbitrary height.
  - The bank's lit stone is now `BANK_LIT` #EFDDC9 (L* ~89), just under the frame's brightest 5 %, so the brightest area
    stays on the subject.

**3. Particles: a marked, empty slot.** `S1Particles` in V2S1.tsx, between the Look and the sun's half. It is for motes
in the low sun's light, a drifting leaf or two from the plane branch, and glints on the water. It gets filled from
`src/lib/particles.tsx` when the shared toolkit lands; nothing hand-rolled.

**Checks (v2):**
- **check_light A/B:** OK at all three times, with the brightest 5 % now on the subject:

  | time | brightest 5 % from the subject | greyed px |
  |---|---|---|
  | 0.5 s | 0.007 H | 21 |
  | 3.0 s | 0.003 H | 23 |
  | 5.3 s | 0.013 H | 35 |

- **Line metrics:** strokes **64 / 70 per Mpx: OK** (budget 80). Short strokes 48 / 50 (budget 25): still over, down from
  63-65. Dark-line 0.83 / 1.42 %: OK.
- **Local contrast:** the environment band (y 600-1215) is 6.8, within 7 (was 7.2). The bank is 2.3 (soft).
- **Typecheck:** clean.

**Not touched:** the sun (the owner may comment on it), the camera (locked), and every map spot (W, her path, Pip's
bollard, the caption band). map.ts is unchanged.

**Open:**
- No critic or cold-viewer round has run on v2 yet.
- The particles are waiting for the shared lib.

---

# The first look clip (kept for the record)

## What changed (conform_L1 §1-§8; DIRECTION and CRAFT win over everything built before)
- **§1 Frame 0 in the clean pen.** For t < 0 and at f0 the world is paper with flat pale shapes (`S1_PALE` 0.7 toward
  the page through `Look cascade.pale`, no lines). Only the subject's outlines draw on, one closed stroke per object, from
  t -0.26 (`S1_DRAW`), so f0 shows them mid-draw: her behind the glass, the door, W. The sun is half-coloured. Pip has no
  colour before the flood; it draws on with its tinted line. The flood runs from SUN0 (`FLOOD` t0 0.02) and ends with her
  teal coat (`HER_COAT_AT` 0.30). The t < 0 state is exported as `S1_F0` (V2S1_clock.ts) for L6's un-build.
- **§2 Join out.** The camera is locked (`s1Zoom` 1.00 at every t, no pull-out). Pip stays on its bollard (700, 1235), with
  no hop. The push-through runs 5.95-6.25 as built, and nothing else enters, pops or turns in 5.80-6.40.
- **§3 Thread W.** Lamp-lit (flat `lamp` with a `lampCore` pool, no glow) to the click at 0.40, then the plum anchor. W is
  tier A in 0-0.40 and 5.59-6.25 and support in between (`wIsSubject`).
  - Its one line is the frame: one closed path in the pane's own shade (the lamp's, then the plum's), with no corner
    overshoot.
  - The mullions, the sill, the shelf with its box files (one stepped block), the chair, the anglepoise and the plant's
    ring are flat fills.
- **§4 Foreground: things only.** No stranger's back anywhere in front. The treads hold only things, as flat two-tone
  bands in warm stones (stucco and paving, so the shadows keep their chroma):
  - from the spec: a tote, two takeaway cups, a newspaper, a scarf, a bike cut by the bottom-right corner, a planter of
    grasses, the leaves;
  - added: a backpack, a flask, a book, flowers, a skateboard, a jacket, a picnic cloth, a guitar case, a carrier of four
    cups, a potted plant, a folded umbrella, a thermos with two mugs, ~17 leaves.

  The things' small parts (lids, caps, handles) are in a light warm brick, so they never read as ticks. The small seated
  public (7 kit `Seated`, ~60 px, feet y 1292) sits only on the step by the water. No two are alike, they make two slow
  head turns, and none looks like her within 300 px.
- **§5 Tiers** as specified.
  - A: her, the row, W in its spans, the door and its letters in 0.45-1.40.
  - B: Pip and the seated public.
  - C: everything else, which draws no outlines (the panes carry no lines).
- **§6 Life.** What stays: the cloud, one thin bar, the bus, one far jogger, the 1.40 birds, one window switch at a time,
  one chimney puff, pigeons at rest. What went: the 4.98 birds, the cyclist, the duck, the dog, the glints, every move on
  the near steps, Pip's head-follow (it turned Pip's whole body), and the plane branch's sway (its falling leaf stays).
- **§7 Light: RIG_CANAL** through one `<Lit>`.
  - Contact shadows under everything that touches a surface. Casts fall right and a little toward us. Form shade sits on
    the side away from the sun.
  - The fins cast short shades on the facade, and the canopy soffit is one `Shade` step. The step edges are one `Shade`
    step too. Each moored boat has a strip at its waterline.
  - The rim is on her coat's left edge only.
  - Every light shape lands with the flood at its spot (`floodAt`), so f0 has pale shapes only.
- **§8 Line.** The global clean pen draws everything.
  - Every A outline is in its own shade: the row's lines, per part, in that part's fill's deep shade.
  - The non-W lit panes are one flat lamp value, a step under W.
  - The hand marks are gone: ripple dashes, dabs, specks.

### The row after the cold viewer (a story change: please confirm it upstream, see REQUESTS)
The copies are still the same drawing as her (her coat cut, her bun, her walking scissor), and their hair still ages
from dark plum to grey, silver, then white. Two things changed:
- **Coats.** The copies now wear **oat coats** (`CM.coatOat`) instead of paper-white ones. White read as "lab coats, or
  hospital gowns tied at the back" at 3.0 s.
- **The "life" beat.** Three **more white-haired copies (G6)** now pop down the bend, in place of the three bare
  see-through outlines. Those outlines read as "her getting old, then ghosts: until she dies". The timing (4.98) and the
  pop stay. `OUTLINE_SPEC` stays exported for the dev sheet `V2S1_row_entry.tsx`.

## The checks (on the final clip's code)
- **check_light** A/B (`--sky '#BCDCCF'`, y < 600 excluded, subject boxes at her and the row): **OK at all three times.**

  | time | brightest 5 % from the subject (limit 0.15 H) | greyed px (limit 259) | caption band dL* spread (limit 1.5) |
  |---|---|---|---|
  | 0.5 s | 0.134 H | 161 | 0.0 |
  | 3.0 s | 0.127 H | 162 | 0.0 |
  | 5.3 s | 0.125 H | 175 | 0.0 |

  Shadow pixels are ~20 % in every frame, and the anchor-dark count is 0-1 px.
- **Line metrics** (`measure.py`, full size, caption band masked):

  | time | strokes / Mpx (budget 80) | short / Mpx (budget 25) | dark-line % (budget 3) | line L* |
  |---|---|---|---|---|
  | 3.0 s | **83: FAIL** | **63: FAIL** | 1.15: OK | 44.3 |
  | 5.3 s | **89: FAIL** | **65: FAIL** | 1.74: OK | 44.7 |

  The pre-critic clip measured 74-77 strokes and 57 short. The fixes for fullness and for the lines' own shades added
  some back:
  - The denser bank: +12 strokes at 5.3.
  - The row's per-part shades: the lines of the pale parts are lighter than the detector's L* 55, so they drop out, and
    the darker parts' lines count as separate pieces.

  The stroke map at 5.3 s (about 157 strokes, about 115 of them short):

  | band | strokes | short | where they come from |
  |---|---|---|---|
  | town + wing, y 600-900 | 59 | 45 | see below |
  | row + towpath | 44 | 27 | the per-part outlines (shoes, legs, sleeves) |
  | water + boats | 15 | 10 | |
  | bank | 41 | 34 | the things' small parts |

  **A tool limit, with evidence:** many "short strokes" are not strokes. The metric's 9 px blackhat counts the sharp
  corner of any dark flat shape on a light ground as a stroke, 3-4 px long, so every dark pane gives up to four. W alone
  gives ~12 of them at 5.3 s. They remained after W lost every line but its frame: its four panel corners and the box
  files' notches still count.
  Tool: `scratchpad/tools/shortmap.py` (it reuses `measure.run`).
- **Squint** (216 px with a 2.2 px blur):

  | time | where the eye lands |
  |---|---|
  | 0.0 s | the sun, then the caption, then the door and W drawing on |
  | 0.5 s | the door and her |
  | 2.0-3.0 s | the caption's highlight box, then her and the first copies at the door, then the sun and W |
  | 4.5-5.3 s | the row |

  The strongest C marks are the planter's block at the bottom-left and the bike's tyres. Pip (B) reads as a lilac mass
  in the middle of the frame.
- **Typecheck:** `npx tsc --noEmit -p .` is clean.

## Critic (ONE combined round, on the pre-critic clip 0b7f2a3): FAIL, 3 musts -> the fix pass
**Must 1: the bottom third was not full at 216 px.**
- Fixed: the bank got the carrier, the potted plant, the umbrella, the thermos and mugs, and five more leaves.
- The bike is now filled (slate tyre rings, a 7 px frame); before, it read as a wireframe.
- The planter is lighter (wood at L* ~64, a third tuft).
- The guitar case is now slate, with a handle and a pale seam; the plum blob did not read.

**Must 2: the A outlines were near-black (the row, W).**
- Fixed: each line is in its own shade.

**Must 3: 57 short strokes per Mpx (budget 25).**
- Still failing (see the checks), though the lines it named are gone: the pane lines, W's interior strokes and
  mullion/sill lines, its corner overshoot, and the bank's dark small parts.

**Shoulds done:**
- The lit panes are flat, a step under W.
- Pip is steady, and the branch is held.
- W's ring is a flat fill (it was a halo).
- The clip ends at the plum bridge.

**Should left open:** the pale pre-state turns cool fills grey at f0. It is an engine matter; see REQUESTS.

## Cold viewer (ONE: the 216 px frames and the clip from 66aa2af, i.e. before the row change above)
**What they understood.** "A woman walks out of a Google office carrying a small plant, so she has quit... a
single-file line of white-coated copies of her builds up behind her. Their hair goes grey and then white, and the last
few are see-through." Their guess at the story: "it explains the deal she signed when she left."

**Story reads, now fixed (see "The row after the cold viewer"):**
- "Lab coats / hospital gowns" at 3.0 s.
- "Then ghosts: until she dies" at 5.3 s.

**Story read still open:** "a queue at Google's door: they all face the door". They walk west with backs to us, and at
216 px a stride does not show.

**Eye path.** The headline first, every second. Then:
- 0.0 s: the sun, then the door.
- 0.5 s: her and Pip.
- 3.0 s: the copies at the door.
- 4.5 s: the row, then W.
- 5.3 s: the row's tail.

What pulls the eye away: the sun, Pip ("centred, has a face, unexplained") and the black W. Her size: "about 20 px tall
at feed size".

**Look.** "Premium, warm, calm and gently alive." Their problems:
- "The bottom 40 % is static clutter where nothing happens."
- "0.0-0.3 s looks washed out, like a picture still loading."
- W "snaps to black in one frame" at 0.3. That is the designed lamp click.
- "At 1.97 'She quit Google.' blinks out and leaves a hole in the text."
- "At 5.95-6.06 the headline blinks off and the dive takes about 4 frames: it reads as a glitch or jolt, not a dive."

**Keep watching?** "Yes, but for the claim in the text, not the picture. She is tiny and faceless, and the strongest
image, the line, arrives only after 3 s."

## Open (for the owner's look call and the polish pass)
- **The stroke budgets (must).** Planned levers:
  - the far roofs' and the wing's small darks in mid tones;
  - the row's shoes merged into the leg shapes;
  - the sign's slate under-edge moved above the letters' descenders;
  - small radii on the dark panes' corners, or a corner-aware `measure.py` (REQUESTS).

  Target: <= 80 strokes and <= 25 short per Mpx.
- **The direction calls these reads raise (DIRECTION / conform_L1; the owner decides):**
  - The bottom third: "full of things" against "static clutter". Fewer, larger things composed as one still life,
    or one slow near-life element, would answer both.
  - f0's pale state reads "like a picture still loading" (DIRECTION rule 9).
  - She is ~20 px tall at feed size in the first 3 s, under a locked camera.
  - Pip pulls the eye at the frame's centre.
  - The row reads as a queue at the door. A side view of the stride, or more spacing (`map.ts s1RowAt`), would help.
- The planter block and the bike's tyres one step lighter (squint).
- The cool pale fills at f0.

## REQUESTS
- TREATMENT §4, THROUGHLINE and conform_L1 §5: the "life" beat changes from "three bare outlines pop down the bend" to
  "three more white-haired copies (G6) pop down the bend". The copies' coats change from paper to oat, both for the
  death and gown reads, with the cold viewer's quotes above as the evidence.
- Captions (the film's caption layer): "She quit Google." blinks out at 1.97 and leaves a hole in the text block; the
  headline blinks off at 5.95 just before the dive. Hand both over without a gap: cross-fade the block or re-flow it.
- Film2R push-through (S1 -> S2, 5.95-6.25): at 216 px the scale change lands in ~4 frames and reads as a jolt. Ease it
  over the whole window (ease-in-out), or lengthen it to ~0.45 s.
- `scripts/qa/retro_tools/line/measure.py`: exclude the corner tips of dark flat shapes. For example, open the line mask
  with a 2 px disc, or drop components under 6 px that touch a > 9 px dark region. Today every dark pane counts as up to
  four short strokes.
- map.ts l.541 `pipHopsUpLeft: 5.9,` and entry-v2r-contract.tsx l.551 (`hop: {to: [560, 1010], ...}`) still model the
  retired S1 hop: retire both (conform_L1 §2: Pip stays on its bollard).
- L2: S2's frames right after the plum bridge (6.15-6.28) show near strangers' backs: a figure at the bottom-left, two
  people on the bench from behind (DIRECTION rule 3). The look clip stops at 6.13 to keep them out.
- Engine (`lib/exit.tsx` `cascade.pale`): mix cool fills toward a warm paper for the pale pre-state (f0's slates and blues
  read grey, the critic said).

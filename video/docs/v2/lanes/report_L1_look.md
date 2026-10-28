# Report L1 (look): V2S1 "Walking out" = the G4 look clip (2026-10-27)

**The clip:** `video/deliverables/v2/v2r_G4_look.mp4`: Film2R frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps,
h264 crf 16, with the voice (2.1 MB). It ends on the plum bridge, the push-through's midpoint. S2's first frames
(6.15-6.28) are left out: L2 has not conformed them yet, and they show near strangers' backs (see REQUESTS).
**The sheet:** `video/deliverables/v2/v2r_G4_look_sheet.jpg`: 0.4 scale (432 px per frame), every 0.25 s, 25 frames
and the plum.
Commits: 14ac5f5 ... 0b7f2a3 (the conform and the pre-critic clip); c8a9aed, 66aa2af and the last L1 commit (the fixes
after the critic and after the cold viewer, then this clip).

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

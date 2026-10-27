# Report L1 (look): V2S1 "Walking out" = the G4 look clip (2026-10-27)

**The clip:** `video/deliverables/v2/v2r_G4_look.mp4`: Film2R frames 0-367 (0.00-6.13 s), 1080x1920, 60 fps,
h264 crf 16, with the voice (2.1 MB). It ends on the plum bridge, the push-through's midpoint. S2's first frames
(6.15-6.28) are left out: L2 has not conformed them yet, and they show near strangers' backs (see REQUESTS).
**The sheet:** `video/deliverables/v2/v2r_G4_look_sheet.jpg`: 0.4 scale (432 px per frame), every 0.25 s, 25 frames
and the plum.
Commits: 14ac5f5 ... 0b7f2a3 (the conform and the pre-critic clip), c8a9aed and 66aa2af (the critic fixes and this clip).

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
- **§4 Foreground: things only.** No stranger's back anywhere in front. The treads hold only things, as flat two-tone
  bands in warm stones (stucco and paving, so the shadows keep their chroma):
  - from the spec: a tote, two takeaway cups, a newspaper, a scarf, a bike cut by the bottom-right corner, a planter of
    grasses, the leaves;
  - added: a backpack, a flask, a book, flowers, a skateboard, a jacket, a picnic cloth, a guitar case, a carrier of four
    cups, a potted plant, a folded umbrella, a thermos with two mugs, ~17 leaves.

  The small seated public (7 kit `Seated`, ~60 px, feet y 1292) sits only on the step by the water. No two are alike,
  they make two slow head turns, and none looks like her within 300 px.
- **§5 Tiers** as specified.
  - A: her, the row, the three outlines on 4.98, W in its spans, the door and its letters in 0.45-1.40.
  - B: Pip and the seated public.
  - C: everything else, which draws no outlines.
- **§6 Life.** What stays: the cloud, one thin bar, the bus, one far jogger, the 1.40 birds, one window switch at a time,
  one chimney puff, pigeons at rest. What went: the 4.98 birds, the cyclist, the duck, the dog, the glints, every move on
  the near steps. The critic round also cut Pip's head-follow (it turned Pip's whole body) and the plane branch's sway (the
  falling leaf stays).
- **§7 Light: RIG_CANAL** through one `<Lit>`.
  - Contact shadows under everything that touches a surface. Casts fall right and a little toward us. Form shade sits on
    the side away from the sun.
  - The fins cast short shades on the facade, and the canopy soffit is one `Shade` step. The step edges are one `Shade`
    step too. Each moored boat has a strip at its waterline.
  - The rim is on her coat's left edge only.
  - Every light shape lands with the flood at its spot (`floodAt`), so f0 has pale shapes only.
- **§8 Line.** The global clean pen draws everything.
  - Every A outline is in its own shade: the row's lines, per part, in that part's fill's deep shade; W's lines in the
    lamp's shade, then the plum's.
  - W's shelf, chair, lamp and sill ring are now flat fills.
  - The panes carry no lines, and the hand marks are gone (ripple dashes, dabs, specks).

## The checks (on the clip's code, 66aa2af)
- **check_light** A/B (`--sky '#BCDCCF'`, y < 600 excluded, subject boxes at her and the row): **OK at all three times.**

  | time | brightest 5 % from the subject (limit 0.15 H) | greyed px (limit 259) | caption band dL* spread (limit 1.5) |
  |---|---|---|---|
  | 0.5 s | 0.134 H | 161 | 0.0 |
  | 3.0 s | 0.124 H | 162 | 0.0 |
  | 5.3 s | 0.120 H | 178 | 0.0 |

  Shadow pixels are ~20 % in every frame, and the anchor-dark count is 0-1 px.
- **Line metrics** (`measure.py`, full size, caption band masked):

  | time | strokes / Mpx (budget 80) | short / Mpx (budget 25) | dark-line % (budget 3) | median width | line L* |
  |---|---|---|---|---|---|
  | 3.0 s | **85: FAIL** | **64: FAIL** | 1.07: OK | 1.83 px | 42.7 |
  | 5.3 s | **91: FAIL** | **66: FAIL** | 1.32: OK | 1.83 px | 41.2 |

  The pre-critic clip measured 74-77 strokes and 57 short. Two critic fixes added strokes:
  - The denser bank: +12 strokes at 5.3.
  - The row's per-part line shades: +12. The lines of the pale parts are lighter than the detector's L* 55, so they drop
    out, and the darker parts' lines count as separate pieces.

  The stroke map at 5.3 s (159 strokes, 116 of them short):

  | band | strokes | short | where they come from |
  |---|---|---|---|
  | town + wing, y 600-900 | 59 | 45 | the far roofs' small dark bits, the pane details, the sign's slate under-edge (cut into pieces by the letters' descenders), the pigeons |
  | row + towpath | 44 | 27 | the row's per-part outlines (shoes, legs, sleeves) |
  | water + boats | 15 | 10 | |
  | bank | 41 | 34 | the things' small parts |

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

## Critic (ONE combined round, on the pre-critic clip 0b7f2a3): FAIL, 3 musts
**Must 1: the bottom third was not full at 216 px.**
- Fixed: the bank got the carrier, the potted plant, the umbrella, the thermos and mugs, and five more leaves.
- The bike is now filled (slate tyre rings, a 7 px frame); before, it read as a wireframe.
- The planter is lighter (wood at L* ~64, a third tuft).
- The guitar case is now slate, with a handle and a pale seam; the plum blob did not read.

**Must 2: the A outlines were near-black (the row, W).**
- Fixed: the row and W now draw their lines in their own shades (§8).

**Must 3: 57 short strokes per Mpx (budget 25).**
- Only partly fixed, and still failing: the panes' lines and W's interior strokes are gone, and the bank's lids, caps,
  handles and rust leaves are now light warm values (L* ~74).
- Strokes rose to 85-91 per Mpx (budget 80) through the two must-1/2 fixes above.

**Shoulds done:**
- The non-W lit panes are one flat lamp value (no core), a step under W.
- Pip is steady, and the branch is held.
- W's ring is a flat fill (it was a halo).
- The clip ends at the plum bridge.

**Should left open:** the pale pre-state turns cool fills grey at f0. It is an engine matter; see REQUESTS.

## Cold viewer (ONE, the 216 px frames and the clip)
(pending: filled in below when it returns)

## Open (for the polish pass; none breaks the story)
- **The stroke budgets (must).** Planned levers, about -45 strokes: the far roofs' and the wing's small dark bits in mid
  tones; the row's shoes merged into the leg shapes; the sign's under-edge moved above the descenders; the bank's
  remaining small darks. Then re-measure toward <= 80 strokes and <= 25 short per Mpx.
- The planter block and the bike's tyres one step lighter (squint).
- The cool pale fills at f0.

## REQUESTS
- map.ts l.541 `pipHopsUpLeft: 5.9,` and entry-v2r-contract.tsx l.551 (`hop: {to: [560, 1010], ...}`) still model the
  retired S1 hop: retire both (conform_L1 §2: Pip stays on its bollard).
- L2: S2's frames right after the plum bridge (6.15-6.28) show near strangers' backs: a figure at the bottom-left, two
  people on the bench from behind (DIRECTION rule 3). The look clip stops at 6.13 to keep them out.
- Engine (`lib/exit.tsx` `cascade.pale`): mix cool fills toward a warm paper for the pale pre-state (f0's slates and blues
  read grey, the critic said).

# Video 3: Coziness v2 applied (the G5b density + life pass)

Coziness v2 (`docs/look/COZY_AND_SCALE.md` 3b, `LIFE_AND_DENSITY.md` §0; refs C2 balcony street, C3 riverside) in v3. A line
marked **OVERRIDES g5b** wins over `density_plan_g5b.md`; `s9_scale_plan.md` still wins for S9. **Locked:** story, voice, cuts,
each panel's idea and framing, the boarded moves (O1's pull-out, S9's crane + hold), the matched frames (S4 = S6, S10 = S14,
O1 end = S15, S16 = S15's tag at 1.275x), the colour jobs. **Why:** G5 moved more than both refs (2.6 ev/s) yet read empty: its paused frames are empty (flat 61 %, detail 16 %) and its 1.5 % breathe is invisible (~2 px/s). Fix the world first, then the people, then the camera, then the lane.

## 1. Per panel
| panel | profile | camera | the motion lane | rest next to it |
|---|---|---|---|---|
| O1 | BUSY (opening) | pull-out, locked | sticks own "up the glass"; the street sliver (§2) sideways under them, low contrast | Pip on the sill, neighbours below |
| S4/S6, S11, S5, S10/S14 | BUSY (inserts, face beat, the threat's queue: not cozy) | breathe as built | g5b's | the backs, the customer, the bus stop |
| S7, S8, S12, S16 | BUSY events, cozy look | **FLOAT** (§3), **OVERRIDES g5b** | back-row loops (steam, bulbs, pull chain), off the subject's ring | Pip between reactions |
| S9 | SCALE | crane + hold, locked | `s9_scale_plan.md`; about half the walkers in the drop stand | tiny you + PipTiny at the rail |
| S13, S15 | DENSE-CALM (S13 = the breath beat) | **FLOAT**, **OVERRIDES g5b** | the street sliver in the glass: S13 1-3 movers, S15 full width (phone lowered) 2-3, never 0 | you (S13), Pip, the neighbours below |

## 2. The home base: the nook is the refuge, the window the prospect
- **Refuge (as built):** shelf cut by left + top, attic slope, desk cut by the bottom, window 15 % (NOOK 15-30 %); load the
  edges; calm = the caption wall, the tag's ring, the dusk sky in the glass (the one cool field, C* 25).
- **Prospect: yes, a living street from above, as a sliver, not the full BALCONY dose** (that would drop the data center off
  its locked horizon). The attic is 3-4 floors up a hill street, so the band from horizon to sill (O1 / S15 y 955-1060, S13
  y 915-1006) looks DOWN on our street, stacked upward (C3): far kerb + snowy road (`snow`, tracks in `frost`), house fronts
  slightly from above (snowy roofs, lit windows, a lit shopfront), far roofs paling to `skyLow` hiding the data center's base.
- **Life (C2 + C3):** sideways along the kerb, in at cruising speed from a glass edge or from behind the mullion, phone, Pip or
  S13's lamp head (our C2 trees); walkers 0.7-1.1 body h/s, a car with lit headlights 1.2-1.8 lengths/s, a sledge; nothing toward us or upward (the sticks' way).
  Near walkers 40-50 px (`--cozy`'s 400 px² blob floor). Half rest: two chatting at the shopfront, one at the lamp, a kid on a sledge. No wires or birds.
- **OVERRIDES g5b:** its near house fronts are seen from above; S15 keeps 2-3 movers in every frame, the next in 0.3-0.5 s
  before the last leaves (was one walker + one window); S13 drops the foot tap: you hold still (1-2 px breath), one weight shift on "better": rest next to motion.

## 3. Camera: the float replaces the invisible breathe on S7, S8, S12, S13, S15, S16
Translation only, 8-12 px/s (peak <= 25), straight legs turning (eased) every 0.6-1.5 s and back, within ±12 px of home (±10
vertical in O1's set: window top y >= 603); one card under fixed captions, UI and paper edge; sets >= 40 px past every edge;
sub-pixel; seeded. S15 starts at home (O1's end) and passes within 3 px of home on its last frame, still moving (S16's cut-in stays on axis); S8 continues S7's last leg; S13 = 2 legs. Build: `COZY_AND_SCALE.md` §7.6.

## 4. Colour and light in Autumn Ember (new tones are proposals, checked on KitSheet3)
- **Shadows are colour, short (<= 4 % W), never grey or olive:** wall `reveal` #EBC2A4 penumbra then ~#C4968B (L* 66); desk
  red-brown ~#85504C (L* 40, dL* -28, C x0.7); snow `skyLow` #7D8AB6 with a `road` penumbra; under eaves `dcSide`.
- **Tinted whites** `card` #FFF8F0, `snow`; pure white only on the phone screen, "Add to cart", glints. **Warm accent where
  the eye rests:** the lamp's gold touches each home-base subject (tag, laptop, you); in the cool window, `houseLit` windows,
  the shopfront, lamp halos. Confetti in many hue families at C* <= 40 (hero C* 69).
- **>= 10 % cool per frame:** windows pass; the desk closes are at 0 % (G5 S7). Fix: the laptop's off screen in `dcSide` #323A5E
  (plain dark, matched S7 / S8 / S12), a dusk-blue night print, the sea postcard, Pip's lilac; never a window reflection on the
  screen ("is that a screen or a window?"). **Texture:** flat fields, tone-on-tone only on small things; paper edges (G6) bottom + sides from y >= 640.

**Checks.** Paused at phone size beside C3 / C2 (scratchpad only, never the repo): no hole bigger than the caption band, no flat field over 20 % but the calm one,
stacked layers, someone in frame. `density.py`; `--cozy` on S13, S15 (movers >= 2, empty <= 5 %, cv <= 0.3, float 8-15 px/s:
**OVERRIDES g5b**'s ev/s targets there). Cold read: sticks, tag, dark data center first.

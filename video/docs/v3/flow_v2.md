# v3 flow v2: the BUILD SPEC (one home, one view out, one price tag)

**Picked 2026-10-27 by the rework's flow judge** ("make it better before we publish"): FLOW 2 (one view from your seat, only C
and A joins, ONE trip out from the tag's own laptop and back through our window, a literal queue) + FLOW 3's split price + FLOW 1's
tag above the platform overlay. Rules: `docs/look/DIRECTION.md`, `look/CRAFT.md` §a-d; wins over G5b's board. Retro: 13 plain
cuts in 6 places -> 0 in 2 + 1 reveal; tag gone 17.9 s -> on 91 %; "you" five ways -> POV; 25 equal movers -> A/B/C; 2 light rigs.

## 1. Through-line card
- **THREAD = your next laptop's paper tag** on the phone's listing laptop (the FRONT PLANE: screen-fixed, never moved by the world
  camera). On 0-19.2 and 22.45-41.15 (91 %); off only in the declared scale reveal (it leaves from the stick that rose out of the
  tag's laptop; J4 brings it back). $999 -> $1,015 / $1,031 / $1,047 / $1,063 / **$1,079** on O1's launches 1.88 / 2.18 / 2.40 /
  2.60 / 2.72 ("$999" struck from 1.92) -> **$1,099 on "pass" 30.28** (ding). Reactions: the tap 0.50, jolt 15.30, tug 18.30,
  sway 24.44, tick 30.28, jolt 35.95, turn 39.70; "$999" again in the loop. OFF ITS BEATS the tag is tier B (SQA pilot review: a
  soft terracotta, no outline, the prices in its light tint; full only 0-4.04, 15.30-15.90, 17.24-18.90, 24.44-25.04,
  29.90-31.00, 35.95-36.98, 38.12-41.15, each switch a 2-step change; `thread_plane.tsx` TAG_FULL).
- **HOME = the nook, POV:** H1 = O1's framing (glass 180-900 x 630-1060, DC x 322-758) and a chart card pinned right of the window;
  H2 = standing at the glass (the reveal lands there; its far field is wider, so never a direct H1 <-> H2 move: a dolly-zoom).
  **OUTSIDE = one geography:** the DC, the mountain of sticks behind its right side, the town, OUR street with the chip factory's
  lit gate. **YOU = one right hand** (rust sleeve) on the phone; no figure of you, no strangers' backs.
- **PIP rides the phone**, clinging to its right edge (phone-local x 370-480, y 110-260 at w 400; <= 1 % of the frame, C* <= 25,
  same-hue ~2 px line): blinks and ears while a subject acts, head turns only in pauses >= 0.4 s from a join (1.20-1.67,
  9.02-9.42, 11.11-11.58, 30.95-31.42, 33.11-33.49), ears droop 10.92, shrug 40.30; home with the tag in the reveal.
- **Joins:** J1 C 5.80 · J2 C 16.60 · J3 A 19.40 · J4 A 22.68 · loop (midpoints on the first word, in the pause); 0 plain cuts.

## 2. Sequences = scenes.json rows (60 fps; frame = ceil(t x 60); every shared piece runs on FILM time)
| id | s - e | lines | framing | in | replaces | reuses (G5b) |
|---|---|---|---|---|---|---|
| SQA | 0.00-5.80 | 1-2 | H1 | frame 0 (loop target) | O1 | `O1_set`, `O1_dress`, `O1_life` |
| SQB | 5.80-16.60 | 3-4 | card wall | J1 seam, C | S4 S5 S6 | `S4_chart` PriceChart; kit Charts, Laptop, PriceTag |
| SQC | 16.60-19.40 | 5a | H1 | J2 seam, C | S7 S8 | `O1_set`; MemoryStick (S8's 700 px) |
| SQD | 19.40-22.68 | 5b | reveal | J3 push-through, A | S9 | `S9` rig, `S9_far`, `S9_peak`, `S9_town`, `S9_sky`, Pullback |
| SQE | 22.68-36.36 | 6-8 | H2 | J4 seam, A | S10-S14 | ChipFactory, GateBooth, Floodlight, StickCrate, Van, Calendar; S11 bars, S12 tick, S14 shove |
| SQF | 36.36-41.15 | 9 | H2 | J5 seam | S15 S16 | `S16` tag turn, shrug, loop (`EraseDown`, `o1FrontMat`) |

Dropped: the other G5b sets (shop, backs, desk close, roof deck, YouBack/YouTiny, S9's Pips, S11 room, S13) and the 90 %, 40 %,
"15 years" and 2027-28 chips. **Seam** = `{"type": "matchcut", "seam": true, "carrier": <the join's letter>}`: two IDENTICAL
frames (shared pieces at film time); gate_check must read it as "no cut, frames equal" (opt-in; <= 1 % of pixels differ > 4 L*).

## 3. Shared pieces (one owner each; every other builder draws them read-only)
- **`scenes/home_set.tsx` + `homeCam(T)`** (the SQA pilot): O1's nook extended right, the card (H1 px x 975-1715, y 612-1028) and
  2-3 flat notes on the wall right of the window (O1's calendar leaves it). The camera is LOCKED through the hook (SQA pilot
  review: O1's 1.05 -> 1.00 pull-out was a zoom in a hold, DIRECTION rule 8); J1 pans x 0 -> -775 over 5.15-6.45, J2 back over
  15.95-17.25 (inOutCubic, peak 14.9 px/f; room and outside together); the SQB hold floats.
- **`scenes/thread_plane.tsx`** (transition agent; from O1's front plane): hand, phone, listing, tag, Pip, ticker; the screen dims a
  step toward peach when the stage leads (lit 0-4.04, 17.24-19.40, 29.90-31.00, 38.12-41.15), the button and badge then a soft
  blue, the body a soft warm dark (L* 32, no outline) and the listing's laptop a soft terracotta (SQA pilot review: off-beat the
  plane is tier B, no near-black, never out-colouring the stage); the tag's own off-beat schedule is §1's; price glyphs above
  y 1480, all left of x 950:

  | spot | phone (top-left, w; rot -3) | tag box (top-left, w; rot -6) | when (move) |
  |---|---|---|---|
  | HIGH-C | (340, 980) w 400 | (360, 1290) w 360 | 0-3.64 (O1) |
  | LOW-C | (340, 1040) | (360, 1350) | 4.00-17.24 (3.64-4.00: down 60, was 140) |
  | HIGH2 | (340, 900) | (360, 1210) | 17.64-19.40 (17.24-17.64, "your laptop") |
  | LEFT | (20, 1100) w 320 | (36, 1348) w 288 | 22.95-38.12 (rises from below 22.45-22.95) |
  | PAYOFF | (310, 950) w 460 | (333, 1307) w 414 | 38.62-41.15 (38.12-38.62; HIGH-C x1.15 about (540, 1180)) |
- **`scenes/outside.tsx`** (the SQE lane; SQD draws it through its own camera): S9's far field and town re-laid + our street and
  its timeline. **H2 at rest:** flat sky behind the caption band (white captions); horizon y 930: the DC (S9's hall, sign lit) w
  330 at x 230-560, the mountain (PeakPile) summit (800, 640) behind its right side, past the right edge; town 930-1040 with a road
  from our street (x ~300) up to the DC; street 1040-1250: factory wall x 330-950 (y 1000-1090), lit gate opening x 480-640, booth
  on its left, floodlight pool (560, 1200) rx 230 ry 55, notice board x 680-880 (y 1010-1150), waiting lane x 720-940 (y 1140-1240);
  sill 1250-1292; flat frost on the glass's side edges below y 620. **`scenes/h2_window.tsx` + `entryCam(T)`** (the transition
  agent): the window from inside at H2 size, and J4's move.

## 4. The beats (visuals lead their word by ~0.1 s)
- **SQA HOOK.** O1 as built (frame-0 lines, sign 0.25, five launches each ticking the tag under the listing laptop, the phone
  lowers 3.64-4.00, the DC dark with its sign lit 4.04), in the clean pen, with the new ticker, LOW-C and Pip on the phone (calm
  keys). After the SQA pilot review: the colour floods out from the tag (the bezel last, every fill one step inside its line);
  the tap acted after the colour lands (the thumb lifts 0.30-0.40, presses 0.50 on "laptop", the cart pop sound 0.50, the badge
  0 -> 1 at 0.52); the camera locked; at 4.04 ONE event (the DC dark + sign lit + the thoom, the thread plane off-beat in the
  same frame), 4.16-4.87 the DC's server rows light one per syllable of "AI data centers" (the subject owns its line's motion).
- **SQB OLD DEAL.** The card (paper, unlit) at screen x 200-940, y 612-1028, ~150 px of night window at the left edge: "US computer
  prices" 58 px, "same computing power" 34 px, axes, 2005, 2025. 6.98-9.28 the line draws downhill (2021 bump); 10.50 a doodle
  laptop with "$999" lands on it (~2017); 10.82 a shinier BETTER one, same "$999", pops right after; 13.85-14.45 the line hooks
  UP (hero); 14.74 "+9.7%" (~110 px) pops alone; 15.05 "US computers · Sept 2026 vs a year earlier (BLS)" (24 px); 15.30 tag jolt.
- **SQC YOUR STICK.** 17.24-17.64 the phone rises to HIGH2, its screen lit. 18.28 one MemoryStick (130 px at the listing screen
  ~(529, 1070)) lifts toward the lens, outCubic, no overshoot, to centre (540, 870), w 700, rot -4 by 18.86 (chips clear on
  "chips"); the tag tugs 18.30; hold to 18.905.
- **SQD THEIR MOUNTAIN.** 19.40: the same stick on the pile's summit, sky above, lying on a BED of two sticks at its own angle
  (their tops tucked behind its bottom edge: gold under it at every zoom, never a strip of sky); its neighbours are kit-shaped
  MemorySticks at H2 size (~26 px), so x27 shows real chips (never hay). The pile reads as memory while it is big on screen and
  calms as it shrinks (final pass, E5): the crest's sticks in THE stick's own gold one value under it, pins, four warm dark
  chips 20 L* under the board while a crest stick is >= 120 px on screen (**the reveal's declared exception** to CRAFT §c's
  dL* 15), pale to tier C (11 L*) by 50 px (~20.8-21.2, inside the move's fastest stretch), chips pale further out, the lower
  pile flat boards with a soft lit top; so the hold, SQE and SQF see the calm pile. ONE pull-back on the S5 ease (155 f,
  19.40-21.98) to just outside our window: the far plane starts x27 (`planeMat` {o: the summit in H2 px, off: (540, 870) - o,
  k: 27}), town planes rise from the bottom, our street last; the DC's lit sign in frame by ~21.0 (whole DC by ~21.35;
  orchestrator, 2026-10-27: the x27 S5 move cannot bring it in earlier), the whole mountain by 21.32, thoom 21.72 (p 0.985);
  hold 21.98-22.35 (the birds: OutsideFar's one flock, rising from behind the mountain's flank); then J4. S9's streams from
  21.0 only, <= 1 per 0.25 s, no trails. While the far field leads, the street's loud pieces are calm until the load beat
  (`outside.tsx`, film time, both builders: one step at 23.10, none in the hold). Its peak plane speeds (OPEN 5, checked at
  full size): the far plane 42 px/f as the DC's right edge enters (20.92), the town 22, the street 30 (mostly under the frame):
  clean spacing, no repeating high-contrast pattern near the step (the lower pile is flat): not softened.
- **SQE FIRST DIBS.** 23.10-24.20 crates of gold sticks go into a DC truck in the gate's pool (two line-only workers); 24.20 the
  barrier lifts, 24.30-25.24 it drives up the road as a second rolls in; the van waits unlit. Push x1.25 about (600, 1120)
  24.90-25.70; 25.72-26.20 the van rolls into the pool (lit at last), ONE small crate on "left" 26.04; 27.08 the notice's 5x face
  swings on ("~5x" 72 px, S11's bars last year | now, "RAM chips · Gartner, Q2 2026" 22 px; never near a laptop); 28.93-29.60 the
  push releases; 29.20-29.85 the van drives along the near kerb to x ~420; 29.90-30.25 its crate hops over the sill into the
  listing laptop (D carry, shrinking into the screen at ~(171, 1236)); 30.28 the ding, $1,099; the van leaves left; 31.40-32.84 a
  van with the BETTER laptop decal joins the back of the queue; 34.60 the notice flips to "2027" (84 px) + "Micron: supply 'much
  tighter' in 2027 and 2028 than in 2026" (22 px); 35.32-35.90 two DC trucks overtake it and nudge it back; 35.95 the tag jolts.
- **SQF PAYOFF.** 36.36-36.98 nothing new; 36.98 the DC's sign steps up one value; 38.12-38.62 the phone rises to PAYOFF (DC and
  mountain uncovered above it); 39.70 the tag turns: the mini data center "AI" on its back; 39.88 like-pop; 40.30 Pip shrugs;
  40.85-41.15 S16's loop (window and sill under one `EraseDown`, the tag turns back to "$999" onto O1's frame-0 tag, the rest
  un-builds in place, captions roll at 41.00).

## 5. Hierarchy, light, read (A subject in turn · B support · C environment; read = the sound-off phone cold read)
| seq | A | B | C | light | read |
|---|---|---|---|---|---|
| SQA | tag (each tick) -> DC 4.04 | sticks (small), hand, Pip | room, town, snow | nook; tag rim (left) while it ticks | "its price goes up each time a stick flies to the AI data center" |
| SQB | line -> doodles -> hook, +9.7% | tag, Pip, dim phone | wall, notes, window strip | nook, lamp off left; card unlit; pins cast down-right | "the same money bought more for 20 years; now +9.7%" |
| SQC | listing laptop -> stick | tag, Pip, hand | room, DC calm | nook; the stick's warm rim (on its lamp side, left; CRAFT §d.8) | "your laptop runs on that stick" |
| SQD | stick -> DC -> mountain | streams, 2 trucks on the road | town, clouds, birds, snow; the street calm to 23.10 | street; pile tops a step lighter, brightest on the crest THE stick lies on (the frame's brightest 5 % on the stick); its flank turned from the sky in form shade; cold rim on the summit stick (inside its outline, over it); the pile's rim on its silhouette while it is the subject (21.32-23.10) | "one of a mountain of sticks by the data center" |
| SQE | truck; van + crate; 5x; hop + tag; BETTER van; flip + trucks | waiting vans, workers, guard, Pip, tag | street, lamps, walker + dog, steam, town, DC | street + the gate's pool as THE light; van unlit until 25.72 | "their trucks first; one crate, 5x; your price up; the better one stuck; 2027 tighter" |
| SQF | DC sign -> tag | Pip | window view | nook on the tag: rim left, form shade right third | "the data center ends up on the price tag" |

Rigs (`kit/Light.tsx`): **nook** `RIGS.nook` (lamp key screen-left: head (214, 990), pool (210, 1206) rx 236 ry 74; window = fill;
form shades right, contact under all; it lights the front plane in H2 too); **street** `RIGS.street` for every outside view (sky key
upper-left, tops lit, contact only; the DC sign the brightest cold light; 16 px contact under vehicles). Rim only on the subject.

## 6. Joins: the handoffs (two builders meet frame-exactly)
- **J1 5.80** SQA -> SQB, seam mid-pan (frame 348): both draw `home_set` + `thread_plane` with `homeCam` at film time; the card is
  static (title, axes) until 6.98; nothing enters 5.40-6.20 (the DC beat ends 4.24).
- **J2 16.60** SQB -> SQC, seam mid-pan (frame 996): `homeCam` back at x 0 by 17.25; the phone moves only from 17.24.
- **J3 19.40** SQC -> SQD: `{"type": "push-through", "from": [540, 870], "to": [540, 870], "zoom": 7, "dur": 1.1, "carrier": "A"}`,
  no bridge: out 18.905-19.40, cut at frame 1164, in 19.40-20.005. Both sides draw the same MemoryStick (centre (540, 870), w 700,
  rot -4), so at x7 only the bands above and below it change. SQD's own pull-back starts at its t 0 (summed log-zoom speed >= 30 %
  of its peak through 19.40-21.50). Captions dark while the stick fills the band, then white as its top edge drops past the
  line: SQD's `captionTone` 'down' wipe at t 0.016, 0.08 s, its edge riding the stick's (frame 1166). **A declared light
  change** (the colour shift 17.9 > 15): from the warm nook (the stick's warm rim on its lamp side) to the dusk sky (its cold
  rim, upper left). The push-out sweeps H1's window, with the data center's sign, through the band (18.905-19.40): calm only
  once the sign steps to C after SQA's beat (E8, `home_set.tsx`) and the "memory chips." page ends at ~19.12 (`captions.json`:
  "chips" ends ~19.15 in the voice), so no letters ride under a caption.
- **J4 22.68** SQD -> SQE, seam mid-entry (frame 1361): `entryCam` 22.35-22.95 (inOutCubic): window x3.0 -> H2 size about (540,
  1100), street x1.12 -> 1, far field x1.03 -> 1; the front plane rises into LEFT 22.45-22.95; the trucks already stand in the
  pool; no new mover 22.28-23.08; a declared light change (into the warm room).
- **J5 36.36** SQE -> SQF, seam on a held frame (frame 2182). **Loop:** SQF `transitionOut` `{"type": "unbuild", "loop": true,
  "dur": 0.3}` onto SQA's t < 0 bare lines.

## 7. Checks, risks, order
- CRAFT §a: carriers C C A A + loop, 0 F; thread 91 % (one gap: the reveal); per join carry >= 0.25, eye jump <= 0.10, colour shift
  <= 15 (J1 keeps the window strip, J3 the stick and declared, J4 declared), <= 4 movers in +-0.4 s. §b-§d: the subject owns contrast, hero,
  the only full outline and >= 60 % of motion; <= 3-4 noticeable supporters; clean pen budgets; `check_light.py` per panel.
- Risks: the summit close must read "a stick on a pile of sticks" (else start x18, more sky); the queue must read at phone size
  (else push x1.35, storybook scale, `S10_geo` `figK`); S9's end frame (tiny you on our roof) is gone: the anchor is our window.
  Kit: Van `dc` (x1.4, dcSide, mini DC sign) and `better` (NEW laptop, "BETTER"); a 5x | 2027 notice on the Calendar flip; a
  crate flight (StickFlight + StickCrate). Order: scenes.json rows + gate_check seams -> the SQA pilot (with `home_set`,
  `thread_plane`, J1's first half) -> lanes HOME (SQB, SQC), REVEAL (SQD), WINDOW (SQE, SQF; `outside` and `h2_window` first,
  REVEAL draws them in its last 0.6 s); one transition agent owns J1-J5 and the loop -> the full render and checks.

# Style bible, reference 2: full-bleed framing, scale and time of day

Stream: style and motion analysis (ref 2). This file only **adds to or overrides** `style_bible.md` and `motion_spec.md`
(reference 1). Anything not mentioned here (ink colour, fill rules, people construction, the 13-colour palette, caption
font) stays as in those files.

Source: `assets/ref2/reference2.mp4` (720x1280, 30 fps, 1,323 frames, 44.1 s). All 1,323 frames were extracted and measured
with code: ORB similarity fits per depth band (camera), least-squares dissolve alphas, an orange-disc RANSAC circle fit (sun),
caption glyph masks, palette k-means, pixel-mapping across the dusk tween, an RMS envelope, and Parakeet word timestamps.
**Every px value is scaled x1.5 to our 1080x1920 canvas** unless it is given as a fraction (`0.40 H` = 40 % of frame height,
`0.09 W` = 9 % of frame width). Tags: **[M]** measured, **[I]** inferred or read by eye off a grid (±0.015 H).
Evidence lives in `docs/ref2_evidence/` (index in section 10); raw numbers in `ref2_evidence/measurements_ref2.json`.

Transcript of ref 2 (for orientation): "So get this, right? There's this town in California where people are trying to stop
a data centre from being built. [...] But what are we actually getting out of this? And yeah, I can kind of see why people
are asking." 125 words, 2.9 words/s.

---

## 0. What is new versus reference 1 (TL;DR)

| topic | ref 1 (card) | **ref 2 (full-bleed), measured** | use for our build |
|---|---|---|---|
| frame | polaroid card on mint | the 9:16 frame is a window; art bleeds off all 4 edges [M] | full-bleed |
| horizon | panel-relative | **0.37-0.43 H in 15 of 16 shots (median 0.40 H = y 768)**; 0.56 H in the one towering shot [M] | baseline 0.38-0.45 H; peaks lower/higher (section 8) |
| sun | r 72, overlaps the card edge, a "character" (pulses, hops) | **r 94 px (0.087 W; p10-p90 78-101), centre y 0.333 H = 639**, bottom edge on the hills, part-hidden (50-99 % visible). Pure scenery: no pulses, no hops; it sets once [M] | baseline r 94-120; peak r 270-490 (section 8) |
| captions | 82 px, under the art, rolls + wipes | **98 px Patrick Hand, baselines y 387 / 510, block centred on x ≈ 520**, in the sky; whole chunks **pop** (1 frame), highlight box pops with its line [M] | 96-98 px, baselines 387 / 510 |
| caption colour | ink | ink `#2B1B0F` on day sky; **pure white `#FFFFFF`** on the night sky, switched at the first page change after the sky has darkened; highlighted word stays ink inside the peach box [M] | same |
| camera | locked, one push-in | **moves in every shot**: a 1.3-5.9 % zoom, 1.0-3.3 s, ease-in-out sine, starting under the cut, then a hold. 4 multiplane moves (dolly x1.2-1.4 on the foreground, a crane, a closing pull-back to x0.67) [M] | see section 6 |
| cuts | 6 designed transitions | **15 cuts, all 5-frame linear cross-dissolves (0.17 s)**; 14/15 land on a caption event [M] | conflicts with "no fades": see 9.1 |
| time of day | warm/cool alternate per scene | day for 72 % of the runtime, **one 2.2 s dusk tween** (sky, sun set, bulbs on), night to the end [M] | section 5 |
| density | 5.9 medium events/s | **3.6 events/s**; 36 % of frames nearly static apart from the slow zoom [M] | keep ref 1's density; ref 2 is the floor |
| audio | voice only | voice only (no music, no SFX) [M] | unchanged |

---

## 1. Full-bleed composition

### 1.1 Shot list (16 shots; evidence `shots_overview.jpg`)

Horizon = far edge of the ground plane where it meets the hills or houses (= eye level). VP = vanishing point. [M] = shot
times, sun, camera; [I] = horizon and VP read off grids.

| # | time (s) | set | horizon | VP (W, H) | sun cx, cy (frac), r (px) | camera |
|---|---|---|---|---|---|---|
| 1 | 0.00-2.83 | street queue, day | 0.395 | 0.50, 0.395 | 0.47, 0.333, 97 | walk-in 0-1.0 s, then multiplane push 1.6-2.8 s |
| 2 | 2.83-4.77 | protest street | 0.41 | 0.52, 0.41 | 0.50, 0.333, 97 | multiplane push 2.9-3.9 s, hold |
| 3 | 4.77-6.50 | crowd and chair field | 0.40 | 0.50, 0.40 | 0.50, 0.433→0.357, 97 | vertical multiplane crane 4.9-6.4 s |
| 4 | 6.50-8.97 | meeting seats, centre aisle | 0.43 | 0.50, 0.43 | 0.50, 0.323, 89 | zoom +5.9 % |
| 5 | 8.97-11.20 | data centre, high 3/4 aerial | 0.39 | - | 0.21, 0.32, 68 | zoom +5.0 % |
| 6 | 11.20-13.13 | seats, oblique | 0.40 | 0.45, 0.42 | 0.65, 0.338, 94 | zoom +1.3 % |
| 7 | 13.13-15.20 | giant plug hovering over town | 0.41 | - | 0.69, 0.335, 93 | zoom +2.9 % |
| 8 | 15.20-17.40 | water cooler foreground | 0.43 | - | 0.83, 0.34, 87 | zoom +3.7 % |
| 9 | 17.40-20.90 | speaker at mic | 0.42 | 0.45, 0.42 | 0.65, 0.34, 97 | zoom +5.0 % |
| 10 | 20.90-23.00 | speaker close, chart | 0.41 | - | 0.65, 0.344, 95 | zoom +2.2 % |
| 11 | 23.00-25.53 | **water tower over crowd, low angle** | **0.56** | - | 0.04-0.08 (cut by the left edge), 0.45, 104 | zoom +2.6 % + 31 px drift |
| 12 | 25.53-29.60 | presenters at a table | 0.40 | 0.50, 0.40 | 0.50, 0.325, 80 | zoom +3.9 % |
| 13 | 29.60-31.83 | audience reacts | 0.40 | 0.50, 0.40 | 0.50, 0.325, 78 | pull-out −3.8 % |
| 14 | 31.83-35.60 | seats, **dusk tween** | 0.43 | 0.50, 0.43 | 0.50, 0.328→0.364, 85 | pull-out −3.9 % |
| 15 | 35.60-38.67 | seats, **night**, hands up | 0.40 | 0.50, 0.40 | 0.50, 0.39 (43 % visible), 101 | pull-out −2.9 % |
| 16 | 38.67-44.10 | street queue at **night** (bookend of shot 1) | 0.37 | 0.53, 0.37 | 0.50, ~0.36 (a cap) | multiplane pull-back 38.8-42.2 s |

Patterns [M/I]:
- **One-point perspective centred on the frame**: in 11 of 16 shots the VP sits at x 0.45-0.53 W, and an aisle or path runs
  from the bottom centre to it. The sun sits above the VP in 9 shots. The corgi sits on that axis (section 2).
- **Only 3 recurring sets** are re-framed 16 times (street, seats/plaza, table). Reuse makes 16 cuts cheap. Shot 16 is shot 1
  at night: a bookend.
- The camera is at or **above** standing eye height. The heads of standing foreground adults sit 0.05-0.25 H **below** the
  horizon (shot 1 head top 0.445 vs horizon 0.395; shot 7 0.655 vs 0.41). Ref 2 is immersive but not low-angle. Only shot 11
  looks up (water tower 0.26-0.55 H rising above the crowd), and shot 5 is the one bird's-eye shot.

### 1.2 Vertical bands of a typical ref-2 frame (y at 1920)

| band | fraction of H | y px | contents |
|---|---|---|---|
| near string lights / palm fronds | 0.00-0.12 | 0-230 | 1-2 catenary strings cropped by the sides, palm fronds from the top corners (all under the platform's top UI, so purely framing) |
| caption block | 0.165-0.29 | 317-556 | ascender top to descender bottom of a 2-line caption, on flat sky |
| sun | 0.28-0.38 | 545-735 | disc top 0.28-0.29 H; the far string of lights crosses it |
| skyline: hills, small palms, water tower | 0.33-0.40 | 630-770 | fill-only hills, 6-10 tiny palms 0.05-0.08 H tall |
| horizon / far field / fence | 0.37-0.50 | 710-960 | far houses, field, chain-link fence (ink hatching) |
| mid-ground | 0.45-0.70 | 860-1345 | tables, speakers, far chairs, crowd |
| foreground | 0.60-1.00 | 1150-1920 | back-view figures and chairs, cropped by the bottom and side edges; the corgi |

The quiet field is the sky. **Sky from the top edge to the horizon = 37-43 % of the frame** and is flat, so the caption and sun
always sit on an empty field.

### 1.3 Sun (evidence `camera_sun_events.png`, middle panel)

- Size [M]: r = **94 px** median (0.087 W; p10 78, p90 101; the aerial shot 68). Diameter ≈ 0.17 W. **The brief's r 150 is 1.6x
  the reference.** Colour `#EE6B2E` all the way, unchanged at dusk and night.
- Height [M]: centre **y 639 (0.333 H)** median in day shots; 0.32-0.34 H in 12 of 13 day shots. The disc bottom (0.38 H)
  meets the hill line, so the sun sits on the skyline, 0.02-0.05 H above the ground horizon.
- Occlusion [M]: day shots show 50-99 % of the disc. It is cut by hills (bottom), small palms and the far string of lights
  (in front), and once by the left frame edge (shot 11, 0.04 W). Ink and fills of the far layer pass in front of it. **Ref 2
  layers the sun behind the far layer**, which pushes it into the distance. Ref 1 put it on top of everything.
- x position [M]: 0.50 W (on the VP) in 9 shots; 0.65-0.83 W (right third) in 4; 0.04-0.21 W in 2.
- Motion [M]: fixed to the world. It scales and shifts with the camera zoom and never moves on its own, except:
  shot 3, where it rises 146 px as a parallax layer during the crane; and **the set**, 31.9-33.7 s, where it sinks 69 px
  (0.328 → 0.364 H) with a sine ease and ends 76 % visible. After that it is 43 % visible (shot 15) and a ~20 % cap (shot 16).
  The sun never disappears, even at night.

### 1.4 Sky and clouds

- **Flat single colour, no bands, no gradient** [M]: the mode colour covers 95-100 % of the sky sample in every frame. Day
  `#ACD1BF` (≈ ref 1 `sky #A6CABB`), night `#588077` (≈ ref 1 `teal #547977`).
- Darkening [M] (evidence `dusk_transition.png`): **one continuous flat-colour tween**, 31.63 → 33.82 s (2.18 s,
  `easeInOutSine`, rms 0.007). It starts 0.03 s after the word "obviously." and finishes during "living there". The whole
  world tweens at once (section 5). There is no step and no opacity layer: each frame's sky is a single interpolated flat colour
  (intermediates `#A0C5B4`, `#8EB4A5`, `#7BA194`, `#6B9186`, `#5D857C`).
- Clouds [M/I]: one small cloud in the street shots (1, 2, 16), never more. 3 bumps on top, flat bottom, white fill, ink on the
  top contour only, about **195 x 75 px** at y 0.065-0.105 H, x ≈ 0.45 W, i.e. above the caption, in the top-UI zone. At night
  its fill turns sage `#6C998A` (one step lighter than the night sky).

### 1.5 String lights, poles, wires

| element | measured (1080x1920) |
|---|---|
| near strings | 1-2 catenaries across the top 0-0.12 H, cropped at both sides, often crossing; sag 0.04-0.08 H; line 3 px ink |
| near bulbs | white `#FFFFFF` core 23-33 px + ink ring → **30-38 px diameter**; a short ink socket on top; spacing 87-150 px |
| far string | at **0.29-0.33 H** (y 560-640), passing over or across the sun; bulbs 9-12 px, spacing 54-75 px |
| bulbs at night | lit `#FAB890` (≈ peach) + one flat **halo disc `#749484`, r = 2.2 x bulb r** (`zoom_bulb_halo_night.png`) |
| posts | 2 tealDark posts ≈ 12 px wide at x ≈ 0.10-0.12 W and 0.88-0.91 W, from the ground (0.52 H) up to 0.28 H; they hold the far string |
| utility poles | street shots: wooden poles with 2-3 crossbars at the left, 8-12 wires converging on the VP (2 px ink) |
| street lamps (night) | lamp head with a flat peach glow disc `#F0B394` behind it, r ≈ 25-37 px, smaller with depth (`zoom_streetlamp_glow_disc.png`) |

### 1.6 Foreground framing and frame-edge cropping [M/I]

- **Palm fronds from the top corners** in the street and plaza shots: 3-5 fronds, 0.15-0.25 W wide, 0.08-0.12 H deep, cropped by the
  top and side edges. Day fill teal `#588077` (darker than the sky), night fill sage `#709F8B` (**lighter** than the night sky): the
  framing layer always sits 1-2 palette steps off the sky (`zoom_palm_framing_day_night.png`).
- **Palm trunks / posts as side columns**: shots 3 and 15 run full-height trunks at x 0.02 and 0.98 W, cropped at the top.
- **Figures cut by the side edges**: presenters at the table (shot 12) are 0.40 H tall and half outside the frame. The plaid
  walker in shot 16 is cut by the left edge.
- **Audience along the bottom edge**: 3-6 heads (0.08-0.12 W wide) and chair backs (white) cut by the bottom edge, in 9 of 16 shots.
  Their tops sit at 0.62-0.85 H, so they live in the zone that the platform UI half-covers. This is foreground decoration, not action.
- Count [I]: every shot has at least 2 elements cut by the frame edge, and all 16 have a top-edge framing element (string lights
  in 12, palm fronds in 5, both in shot 15).

### 1.7 Depth layers and ink by depth

Typical ref-2 stack (back to front) [I, from the sets above]:
1. flat sky; 2. hills: fill-only, 1-2 tones (day sage `#709F8B`, night tealDark `#3E605F`), small ink palms and a water tower on top;
3. far houses, field (sand) and fence: thin ink + flat fills; 4. mid-ground: crowd, tables, chairs; far crowds near the VP are
mostly fill (heads as dots); 5. foreground figures and chairs: full ink, interior folds, cropped; 6. framing: string lights, fronds.
That is **5-6 layers in every wide shot**.

Ink weight [M, coverage cross-sections on 7 stills]: foreground outlines 3.5-4.5 px (jacket edge 3.5, corgi 4.2), mid and far lines
2.2-3.0 px; the median of all strokes is 2.3-3.6 px in every depth band. **Ref 2 hardly steps ink with depth**: depth comes from
size, overlap and fill-only far layers, not from line weight. Keep ref 1's ladder (4.8 / 3.4 / 2.2) for ourselves; it is
compatible.

New detail, the **rim strip** [M] (`zoom_rim_highlight_strip.png`): foreground figures carry a pure-white strip, **3 px wide,
touching the inside of the outline on one side** (the left edge of torsos and trouser legs, the right edge of arms), over
40-70 % of that edge. It is flat; no blur. It is the flat translation of rim light and is already in the reference style.

Light devices that ref 2 already uses [M]:
- table-lamp **cone**: a flat trapezoid from the lamp head to the table, widening ~3x; day cream `#F3E2CB` over the sand field,
  dusk peach. A lighter flat **light pool** ellipse (≈ 0.7 W wide, `#EDFBE7` over the dusk ground `#ACD1BF`) sits around the table
  (`zoom_lamp_cone_light_pool_dusk.png`).
- glow discs behind bulbs and lamps (1.5).

---

## 2. Figure scale (evidence `figure_scale.jpg`)

| tier | height (fraction of H) | px at 1920 | where / notes [I, grid reads ±0.01 H] |
|---|---|---|---|
| foreground standing adult | **0.27-0.39** | 520-750 | feet at 0.78-0.95 H; often cropped by a side edge; heads 0.05-0.25 H **below** the horizon |
| mid-ground adult | 0.19-0.24 | 365-460 | queue, speaker groups |
| child (fg / mid) | 0.12-0.27 | 230-520 | on shoulders, walking |
| mid-far standing | 0.10-0.12 | 190-230 | far couple in shot 8 |
| far crowd near the VP | **0.02-0.06** | 40-115 | heads as dots, little or no ink |
| seated audience (fg) | heads 0.08-0.12 W wide | heads 85-130 | torsos cut by the bottom edge |
| **corgi** | **0.06-0.09** (orange body + ears; add ~10 % for white paws) | 115-175 | [M] orange mask over 18 shots |

Corgi placement [M]: x = **0.50 W in 11 of 18** sampled frames (on the aisle or VP axis, under the sun), 0.78-0.84 W in 3 and
0.07-0.13 W in 2. Feet at 0.69-0.88 H. It sits **at people's feet**: its ear tips reach the knee of the adult next to it,
corgi height = **0.25-0.32 x that adult** (shot 1: 0.09 vs 0.35 H; shot 7: 0.07 vs 0.21 H). Smallness comes from that
adjacency and from the empty ground around it, not from absolute size. It is always in back view, except the last beat: it
**turns to face the camera on the final word** ("asking." 42.88 s; the turn runs 42.73-42.93 s,
`strip_corgi_turns_on_last_word.png`). In shot 16 it shrinks with the pull-back to 0.025-0.05 H.

---

## 3. Captions in the sky (evidence `caption_geometry.png`, `strip_caption_pops.png`)

### 3.1 Geometry [M]

| property | ref 2 measured (1080x1920) | brief's guess | note |
|---|---|---|---|
| font | Patrick Hand (glyph widths match within 1-2 % at this size) | Patrick Hand | unchanged |
| size | **98 px** (x-height 45 px; width fits at 97-99) | 82 | 1.2x ref 1 |
| line 1 baseline | **y 387** (0.2016 H) | 330 | a 1-line page sits on line 1 too (it is not centred) |
| line 2 baseline | **y 510** (0.2656 H) | 426 | pitch **122 px = 1.245 em** |
| block extent | ascender top y 317 → descender bottom y 556 | | sun top is at ≥ 545: the caption sits right on top of the sun |
| horizontal | each line centred on **x ≈ 520** (ink extents, 8 pages, 514-523) | 540 | 20 px left of centre: clear of the right-hand UI rail [I] |
| max line width | **849 px** (0.79 W; "where people are trying", "But what are we actually") | ~860 | ≈ 24-26 characters |
| emphasis page | one short phrase alone ("why?", "hang on,"): **168 px** (1.73x), baseline y 455, whole phrase in a peach box y 305-488 | | used 2x, each on an interjection |

Highlight box [M] (same on light and dark skies): colour `#F0B394` (ref 1 `peach #F6B892` after encoding; same token).
Height 1.10 em (106 px at 98 px); top = baseline − 0.90 em (−88 px), bottom = baseline + 0.19 em (+19 px), so descenders of g/y
poke out by 0-10 px; horizontal padding 0.19 em (18 px) each side; corners square (r ≤ 2 px). It covers a word, a phrase or a
**whole line**: 16 boxes on 21 pages; 2 cover a whole line 2, 2 are the emphasis pages, and one page has 2 boxes ("jobs," / "money"). Text inside the box stays ink `#2B1B0F` when the other words are white.

### 3.2 Colour switch [M] (`dusk_transition.png`)

- Ink `#2B1B0F` while the sky is day `#ACD1BF` (contrast 10.0:1).
- The sky reaches night `#588077` at 33.67 s, but the page on screen ("But then the people / living there are like,") **stays
  ink until the next page change**. At 34.10 s the new page ("okay,") arrives in **pure white `#FFFFFF`** (not cream: core pixels
  `#FEFEFF`). There is no colour animation on text. All later pages are white.
- Contrast check: ink on `#588077` = 3.8:1 (that is what ref 2 shows for 0.4 s, low); white on `#588077` = 4.4:1;
  white on tealDark `#3E605F` = 6.9:1. The crossover (ink = white) is a sky of relative luminance ≈ 0.20 (≈ `#67897F`).
  **Rule for us: ink on skies lighter than `#6E938B`, white on skies darker than `#5D857C`; never park a caption over a mid-tween
  sky.**

### 3.3 Caption motion and timing [M]

- **Pops, not rolls.** A new page: the old page vanishes, **1 empty frame**, the new page pops complete in 1 frame. Line 2 pops in
  1 frame. The highlight box pops **in the same frame as its line**. It does not wipe and it is not timed to its word ("loads of
  electricity." box at 13.17, the word "electricity" at 14.00). No scale, no opacity, no scroll.
- Chunks: a line can arrive in 2 chunks laid out at their final positions ("So get this," then "right?"; "okay," then "cool.").
- Timing vs the first word of the chunk (38 events): median **−0.09 s** (IQR −0.21…−0.01). Line 2: −0.11 s. Pages that arrive with
  a cut can lead by up to −1.0 s (the page comes with the new shot inside a pause).
- Cadence: 38 caption events in 43 s (**one every 1.13 s**), 21 pages, page life 0.8-4.0 s (mean 2.1 s).
- Ref 1's roll and wipe grammar is richer. The brief keeps ref 1's motion grammar, so use ref 1's motion (`motion_spec.md` §4)
  with ref 2's **positions, size and colours**.

---

## 4. Palette additions and time of day (evidence `palette_day_dusk_night.png`)

Ref 2 uses **the same 13 colours as ref 1** (k-means of flat pixels: every cluster within ΔRGB ≤ 21 of a ref-1 token). What is new is
**the role mapping per time of day** plus 2 glow colours. Measured hexes [M]:

| role | day | dusk (33.7-35.6 s) | night (35.6-44.1 s) |
|---|---|---|---|
| sky | `#ACD1BF` (sky) | `#588077` (teal) | `#588077` |
| seating lawn / near ground | `#EDFBE7` (mintPale) | `#ACD1BF` (sky) | `#709F8B` (sage) |
| street / sidewalk | `#F3E2CB` (cream) | - | `#DBBCA1` (sand) |
| far field, walls | `#D9BBA3` (sand) | `#B99982` (tan) | `#B99982` |
| far hills | `#709F8B` (sage) | - | `#3E605F` (tealDark) |
| cloud | `#FFFFFF` | - | `#6C998A` (sage) |
| palm fronds (framing) | `#588077` | - | `#709F8B` |
| bulbs | `#FFFFFF` | pop to `#FAB890` (peach) | `#FAB890` + **halo `#749484`** (new) |
| street-lamp glow disc | - | - | **`#F0B394`** (peach) |
| whites (chairs, tablecloth), mid and dark tones, ochre | unchanged | unchanged | unchanged |
| sun | `#EE6B2E` | `#EE6B2E` | `#EE6B2E` |
| caption text | `#2B1B0F` | `#2B1B0F` | `#FFFFFF` |

The rule [M, pixel-mapped across the tween]: **only the light fields step down**: sky → teal, mintPale → sky, sand → tan,
cream → sand. The step is one palette step at dusk and two for the near ground at night. Whites stay white, so they read as lit.
Mid and dark tones do not move. Warm light is peach. The whole tween is one 2.2 s sine over all fields together.
The new tokens are only `bulbHalo #749484` (≈ sage at night) and the glow role for peach.

Area: the night sky alone is 44 % of flat pixels; sand-family ground 20 %; peach 1.0 % (lights + box); orange ≈ 1-2 % of the
frame (a fully visible r-94 sun is 1.4 %, the corgi ≈ 0.3 %). Orange stays inside ref 1's 2-4 % budget.

---

## 5. The dusk sequence, step by step [M] (shot 14, `dusk_transition.png`, `strip_bulbs_switch_on.png`)

| t (s) | event | link to speech |
|---|---|---|
| 31.60 | "obviously." (end of a sentence, then a 0.4 s pause) | |
| 31.63 | sky + ground tween starts (2.18 s, sine in-out) | +0.03 after the word onset |
| 31.83 | cut (5-f dissolve) into the seats set, pull-out −3.9 % over 2.4 s begins | in the pause |
| 31.9 | sun starts sinking 69 px (sine, ends 33.7, 76 % visible) | |
| 32.48 | "But then the people" | |
| 32.63-33.67 | **23 bulbs pop white → peach one by one, left to right, ≈ 22 bulbs/s** (1 per 1.35 frames) | starts +0.15 after "But" |
| 33.67-33.82 | sky reaches `#588077`; everything holds | "living there" |
| 34.10 | next page pops in **white** | 0.62 s before "okay," |
| 35.60 | cut to a darker night set (near ground sage, hills tealDark, halos on bulbs) | |

---

## 6. Camera and motion (evidence `camera_sun_events.png`, strips)

### 6.1 Per-shot zoom (the default move) [M]

Fit of `s(t) = 1 + A·E((t − t0)/T)` to the ORB scale of each shot (rms 0.03-0.12 %):

| cut (s) | start vs cut | duration | scale | ease |
|---|---|---|---|---|
| 6.50 | −0.10 | 1.27 | +5.9 % | sine |
| 8.97 | −0.40 | 1.57 | +5.0 % | sine |
| 11.20 | −0.10 | 1.47 | +1.3 % | sine |
| 13.13 | −0.40 | 1.27 | +2.9 % | quad in-out |
| 15.20 | −0.20 | 1.00 | +3.7 % | sine |
| 17.40 | −0.20 | 2.40 | +5.0 % | sine |
| 20.90 | −0.13 | 1.23 | +2.2 % | quad in-out |
| 23.00 | +0.27 | 1.57 | +2.6 % (+31 px lateral) | out-cubic |
| 25.53 | −0.10 | 3.27 | +3.9 % | sine |
| 29.60 | −0.17 | 1.53 | **−3.8 %** | sine |
| 31.83 | −0.30 | 2.40 | **−3.9 %** | sine |
| 35.60 | −0.20 | 2.90 | **−2.9 %** | sine |

- **Every shot moves, starting with the cut** (median −0.2 s, i.e. under the dissolve), then **holds still** for 0.4-1.7 s until
  the next cut. Ease = `Easing.inOut(Easing.sin)`. Uniform scale (all depth bands equal within 0.3 %), so these are 2D zooms
  with no parallax. Anchor x = 0.48-0.56 W in 9 of 12 (the others sit off-centre, one with a lateral drift), y = 0.27-0.52 H
  (frame centre or the horizon/sun).
- Day act: push-ins (+1.3…+5.9 %, median +3.7 %). Night act: **pull-outs** (−2.9…−3.9 %). The direction flips with the mood [I].
- The caption is screen-fixed while the world zooms under it [M: top band scale 1.000 in every shot].

### 6.2 Multiplane moves (4 of 16 shots) [M]

| shot | move | far layer (horizon band) | mid | foreground | time, ease |
|---|---|---|---|---|---|
| 1 → 2 | dolly-in down the street, accelerating into the dissolve and decelerating after it: one continuous move across the cut | x1.02 → x1.07 | x1.29 → x1.14 | x1.33 → x1.20 | 1.6-2.8 s, then 2.9-3.9 s (ease-in, then ease-out) |
| 3 | **crane reveal**: layers move vertically apart; the sun and far field rise 146 px, foreground figures sink 150-300 px and partly exit the bottom; the chair field opens up between | +0 scale, −146 px | opens | down 150-300 px | 4.9-6.4 s, sine |
| 16 | **closing pull-back** down the night street while 3 walkers enter from the bottom-left | x0.95 | x0.755 | x0.67 | 38.8-42.2 s (3.4 s), sine |

Strips: `strip_open_walkin_push_S1.jpg`, `strip_crane_reveal_S3.jpg`, `strip_final_pullback_S16.jpg`.

### 6.3 Cuts [M] (`audio_and_dissolves.png`, `strip_dissolve_cut1.jpg`)

- 15 cuts, **every one a linear cross-dissolve of 5 frames (0.17 s, +0.2 alpha per frame)**. No wipes, no flips, no match-cuts.
- Shot length 1.73-5.43 s, **mean 2.76 s**, median 2.2 s.
- **14 of 15 cuts coincide with a caption event** (the new page or line 2 pops 1-3 frames after the dissolve midpoint). 40 % of
  caption events carry a cut. 8 of 15 cuts sit in speech pauses (< −40 dBFS within ±0.1 s); the other 7 cut mid-phrase on a line change.

### 6.4 In-shot animation and density [M/I]

- Medium events **3.6/s** (ref 1 5.9/s); 36 % of frames change < 0.1 % of pixels besides the zoom; longest near-static run 1.5 s
  (shot 12). Bursts: 17 events in the second at 4-5 s (crowd), 11 at 29-30 s (hands up), 10 at 37-38 s (hands raised).
- Event types: walk cycles (shot 1: the foreground man walks 3 steps into depth in 1.0 s, ≈ 0.33 s per step; shot 16: 3
  walkers enter from bottom-left 39.8-41.5 s), arm raises and hands-on-head reactions (shots 13, 15), pops (protest sign, the
  "data centre" roof lifting at 9.73 s with "full of computers" while the computer rows fill 9.87-10.6 s), the cable growing into a plug
  (shots 6-7), the water level, the bulbs, the corgi's turn.
- Liveliness in ref 2 comes from the always-on camera move plus a cut every 2.8 s plus a caption event every 1.1 s, not from
  build density. Our target stays ref 1's ≥ 5 events/s (brief).

---

## 7. Audio [M] (`audio_and_dissolves.png`)

Voice only. Speech RMS median −17.8 dBFS, peaks −1.9 dBFS. Pauses fall to −60…−80 dBFS (breath tails, then noise floor); exact
digital zero for 0-0.2 s and after 43.4 s. **No music bed** (a bed would hold the pauses at −30…−40 dB) and **no SFX**: nothing
at any of the 15 dissolves, the bulb pops or the dusk tween. 2.9 words/s. Same as ref 1.

---

## 8. Scale playbook: from Arcane to our flat style, in two tiers

Arcane measurements (12 stills, `arcane_measures.jpg`; fractions of each tile) [M/I]: back-view figure facing the vista in 7 of 12;
near-monochrome in 8 of 12 (one hue = 81-93 % of chromatic pixels in A2, A6, A7, A9); horizons 0.48-0.69 H; tiny figures
0.10-0.12 H against a mural, hall or facade (A3, A6, A8); a tower 0.85 H tall (A4); a low sun r 0.18 W on the horizon behind a
0.35 H figure (A7); a vertical light shaft with a core of 0.12 W and a glow of 0.22 W in a frame that is 88 % dark (A6); haze
layers that step in value toward the sky (A7 L* 147 sky → 135 → 110 → 78 → 42 foreground); median frame lightness 9-49 %.

**Tier 1, BASELINE (≈ 85-90 % of the runtime)**: ref 2's immersive eye-level full-bleed, bright and quick.
**Tier 2, PEAK (2-3 moments: hook, scale reveal, closing beat; each 1.5-4 s)**: true Arcane scale.

| device | baseline dose | peak dose | overdone on TikTok when... |
|---|---|---|---|
| **horizon / camera height** | horizon 0.38-0.45 H (y 730-865); camera at standing eye height, so foreground heads sit just under the horizon | worm's-eye: horizon **0.58-0.70 H** with the observer's head and shoulders **above** it, against the sky (A7); or towering: horizon ≥ 0.55 H and the tower top above 0.15 H (ref-2 shot 11, A4); or vista from a height: horizon 0.45-0.50 H, observer cut by the bottom, city to the horizon (A1) | the horizon rises above 0.30 H (the sky disappears, so the captions lose their field) or 3-point tilt everywhere |
| **figure vs colossus** | 1 foreground back-view adult 0.25-0.35 H, cut by an edge; one big element ≥ 1.5x that figure (building ≥ 0.5 H, tower, wall of windows) or a crowd shrinking to 0.02-0.04 H at the VP | observer **0.04-0.08 H** (75-150 px), back view, on the VP axis; colossus ≥ **0.7 H or ≥ 1.0 W** (cut by the frame so it continues), ratio colossus:observer **≥ 10:1**; 3-4 rows of crowd shrinking ×0.85 per row to 0.02 H | figures under 0.02 H (≈ 40 px: illegible on a phone); more than 1 peak-scale shot in a row |
| **corgi** | 0.06-0.09 H (115-175 px) at a person's feet, x ≈ 0.50 W | 0.025-0.035 H (50-70 px) beside the tiny observer; still the brightest orange after the sun | under 40 px tall, or not on the main axis (it gets lost) |
| **sun** | r 94-120 px, centre y 620-700, bottom on the skyline, 50-99 % visible, behind the far layer | r **270-490 px (0.25-0.45 W)**, centre **on** the horizon (half-set) behind a fill-only skyline; 2 stepped flat glow rings at r ×1.25 and ×1.5 (`#F19260` then peach `#F6B892` on a warm sky; [I] proposal); observer silhouetted in front with a 3 px peach rim strip | r > 0.5 W (reads as apocalypse), orange > 12 % of the frame, a sun every shot, or the sun under the caption block |
| **sky / time of day** | day `#ACD1BF`, flat; golden variant = same flat sky + peach-lit faces | one dusk or night beat where the story earns it ("by evening", lights off): tween 1.8-2.2 s sine, then the night mapping (section 4) with lit windows and bulbs popping L→R at ~20/s | sky darker than `#588077` behind captions; more than ~25 % of the runtime at night; frame median L* below ~35 % (Arcane's 9-30 % is trailer-dark on a phone) |
| **camera** | per-shot zoom **3-8 %** (ref 2: 1.3-5.9 %) over 1.0-2.5 s, sine, starting under the cut; light parallax: for a 5 % move scale far 1.02 / mid 1.05 / fore 1.08 | **one** big reveal per video: multiplane pull-back far x0.95 / mid x0.75 / fore x0.67 over 3-3.5 s (ref-2 shot 16), a crane that splits layers by 150-300 px (shot 3), or a push of 1.6-2.5x over 2-4 s; plus at most one more mid-size move | moves over 4 s; more than 2 big moves; holds over 1.5 s with nothing else moving; continuous drift that makes text shimmer |
| **depth layers / haze** | 5 layers like ref 2 (sky, fill-only hills, far town with thin ink, mid, cropped foreground) | 5-6 layers with **tint steps toward the sky**: day sky `#ACD1BF` → far `#98C0AE` (fill-only, no ink) → `#84B09C` (fill-only) → sage `#709F8B` + 2.2 px ink → teal + 3.4 px → foreground 4.8 px. Night: sky `#588077` → far `#4B706B` → tealDark `#3E605F` → ink-dark silhouettes. Step size grows toward the viewer (A7: ΔL 12, 25, 32, 36). [I: the 3 haze hexes are proposals, 50/50 mixes of palette tokens] | more than 6 layers (mud); haze tints used as gradients; far layers with ink |
| **light shafts / pools** | lamp cones and light pools as in ref 2 (flat trapezoid widening ~3x, lighter ellipse 0.5-0.7 W) | 1-3 flat shafts: core **0.10-0.14 W**, one stepped halo 1.8x the core width a step darker, vertical or 30-40° diagonal, widening 1.3-1.6x toward the ground, ending in an ellipse pool 2x the core width with the tiny observer in it (A6, A3) | soft gradients or blur; shafts crossing the caption block; more than 3 |
| **glows** | bulb halo r 2.2x the bulb (`#749484` at night), lamp glow discs (peach) | the same stepped discs scaled up: 2-3 concentric flat rings around windows, a portal or the sun | glow rings around everything |
| **silhouettes / rim** | white 3 px rim strip on the lit side of foreground figures (already in ref 2) | fill-only dark skyline and figures against the sun or a light field, with a peach or white rim strip 3-5 px on the sun side | silhouette faces or people you need to recognise |
| **monochrome field** | ref-2 balance: one big field (sky ≈ 40 % of the frame) + warm ground, orange ≤ 4 % | one shot where ≥ 75 % of the frame is one hue family in 3-4 values: warm (orange `#EC6B2E` / peach / sand / clay + ink silhouettes) or teal night (`#588077` / `#3E605F` / sage + ink); the sun, corgi and highlight are the only accents | longer than ~3 s, or used twice back to back |
| **foreground framing** | 1-2 elements cut by the frame edge per shot (top string lights or fronds, a side figure, audience heads at the bottom) | a near silhouette over 15-30 % of an edge (hanging lamp from the top as in A7, railings on both sides as in A9, a rooftop edge as in A1) | framing that enters the caption zone (y 300-560) or the centre third |
| **captions at peaks** | 98 px, y 387 / 510, ink or white per 3.2 | unchanged size and position; the caption sits on flat sky above the sun (sun top ≥ y 600) or on a monochrome field with ≥ 4.5:1 contrast | captions shrunk for "cinema", placed over detail, or a mid-tween sky behind them |

Peak recipes for this video [I] (suggestions; the orchestrator assigns scenes):
- **Hook (0-3 s)**: worm's-eye: horizon 0.62 H, one tiny back-view figure (0.06 H) and the corgi (0.03 H) on the VP axis under a
  sky-sized wall of identical lit government windows (≥ 0.8 W, cut by both sides), a sun r 300 half-set behind it. Then cut
  straight to baseline framing by 3 s.
- **Scale reveal (the attack / "millions by evening")**: the one big camera move: a multiplane pull-back from one door (fill the
  frame) to an endless city to the horizon (far x0.95 / fore x0.67 or bigger), with the dusk tween and windows or bulbs popping L→R.
- **Closing beat**: the bookend: the opening set at night (ref 2 does exactly this), a pull-back 3 s, the corgi turning to camera on
  the last word.

---

## 9. Conflicts with the brief and ref 1 (decide explicitly)

1. **Dissolves.** Ref 2 cuts with 5-frame linear cross-dissolves; the brief and ref 1 say "no fades". Recommendation: keep "no fades"
   (camera carry-overs, match-cuts on the sun or horizon, foreground wipes, as the brief lists). A 1-frame hard cut on a caption page
   is also faithful to ref 2's timing, since 14 of 15 of its cuts sit on caption events.
2. **Sky tween.** Ref 2 interpolates the flat sky colour continuously (2.2 s sine). This is a colour animation, not opacity, so it fits
   "flat, no fades". A stepped version (6-8 flat steps over 1.8 s) would look more "pop" if needed.
3. **Caption numbers.** The brief guessed 82 px, baselines 330 / 426, centre 540. Ref 2 measures 98 px, baselines 387 / 510, centre ≈ 520,
   max line 849 px. Ref 2's caption motion (pops) is simpler than ref 1 (rolls and wipes); the brief keeps ref 1's motion.
4. **Sun.** The brief says r 150; ref 2 is r 94 and pure scenery, layered behind the far layer. Ref 1's "sun as character" (pulses, hops) is
   absent from ref 2. Keep the character beats sparingly; at baseline the sun should sit behind the far layer at r 94-120.
5. **Camera height.** Ref 2's camera is at or above eye level (heads below the horizon). The brief wants eye level or lower, so the low
   camera is new to this style: give it to the peaks, not to every shot.

---

## 10. Evidence index (`docs/ref2_evidence/`)

| file | shows |
|---|---|
| `shots_overview.jpg` | all 16 shots, mid frames, with horizon / VP, sun fit and caption baselines |
| `camera_sun_events.png` | zoom curves per shot on 3 depth bands, sun y and r over time, in-frame events per second vs ref 1 |
| `dusk_transition.png` | sky colour over the whole video; the dusk tween, sun set and bulbs-on curves against the words; 5 frames |
| `palette_day_dusk_night.png` | role-by-role swatches with hexes for day, dusk and night |
| `caption_geometry.png` | 2-line, emphasis and white-on-night captions at 1080 scale with baselines and a Patrick Hand overlay |
| `strip_caption_pops.png` | frame-by-frame page and line pops (1 empty frame between pages; box pops with the line) |
| `figure_scale.jpg` | height bars for foreground, mid and far figures, corgi, the giant plug, horizons |
| `audio_and_dissolves.png` | RMS envelope (voice only, −80 dB pauses) and alpha curves of the 14 dissolves |
| `strip_dissolve_cut1.jpg` | one dissolve, frame by frame |
| `strip_open_walkin_push_S1.jpg`, `strip_crane_reveal_S3.jpg`, `strip_final_pullback_S16.jpg` | the multiplane moves |
| `strip_bulbs_switch_on.png` | bulbs popping peach left to right during the tween |
| `strip_corgi_turns_on_last_word.png` | the corgi turning to camera on "asking." |
| `zoom_rim_highlight_strip.png`, `zoom_bulb_halo_night.png`, `zoom_streetlamp_glow_disc.png`, `zoom_palm_framing_day_night.png`, `zoom_lamp_cone_light_pool_dusk.png` | detail crops: rim strip, halos, glow discs, framing fronds, lamp cone and pool |
| `arcane_measures.jpg` | 8 Arcane stills annotated with horizon, figure heights, sun and moon radius, shaft width, haze steps |
| `measurements_ref2.json` | raw numbers: shot table, zoom fits, dissolve alphas, sun, captions, palette, audio, Arcane |

Method scripts and the 30 fps frames live in the session scratchpad (`ref2scripts/`, `ref2an/`), not in the repo.

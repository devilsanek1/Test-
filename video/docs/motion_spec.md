# Motion spec: the reference's animation language, measured

Stream: motion analysis. Source: `assets/ref/reference.mp4` (1080x1350, 30 fps, 946 frames, 31.53 s).
All 946 frames were extracted and measured with code: frame differencing, colour-mask tracking, connected
components, ORB/affine camera estimation, ink-pixel growth, card-corner fitting, easing-curve fitting.
Every number has a **[M]** (measured) or **[I]** (inferred: read off frame strips or derived, not fitted) tag.
Evidence lives in `docs/motion_evidence/` (see section 11). The raw series are in `measurements.json`.

Conventions
- Times are given as **seconds and frames @30 fps** (`0.45 s / 13.5 f`). Write the code in seconds: the frame counts are only for checking.
- px = reference pixels. The reference card is 959 px wide and ours is 960 px (see `style_bible.md` section 1), so
  **horizontal px carry over 1:1**. Vertical caption distances are given relative to the caption clip window, because our window is taller.
- "Word onset" = refined ASR onset (accurate to about ±40 ms, see `ref_transcript_words.json`). Negative offset = the visual comes **before** the word.

---

## 0. TL;DR for engineers

1. **No fades. Ever.** Every pixel change in the reference is a 1-frame pop, a scale, a wipe or a slide. Opacity is never animated [M: pixel traces through every "drain"/"appear"].
2. **The camera is locked and the card is rock-steady.** The frame-to-frame global affine (ORB) stays within 1 px and 0.3 % scale except during the 6 transitions and large local moves such as door swings [M]. There is no parallax pan. The only camera move is one push-in (T5). Card corners stay within ±1 px outside transitions.
3. **Visuals lead the voice by about 3 frames.** Highlights lead by 105 ms, illustration elements by about 100 ms, caption pages by about 40 ms. Only the hand-drawn marks (✓, ✗) and the sun's beats land on the word itself.
4. **Something new starts about every 0.13 s.** The median gap between medium-size motion onsets is 4 frames. There is never more than 0.4 s with no motion at all.
5. **Two hero curves:** captions use a violent ease-out, `cubic-bezier(0, 0.7, 0.12, 1)` over 0.45 s. The card flip uses an ease-in-dominant S-curve, `cubic-bezier(0.7, 0.4, 0.3, 0.95)` over 0.78 s.
6. **The sun is a character.** It rises out of the vanishing point, pulses on beats, bounces on words while peeking over a wall, hops with squash and stretch across flips, and sets. **The cat is the continuity thread:** it jumps or falls across every transition.

---

## 1. Audio of the reference (what is under the voice)

| finding | value |
|---|---|
| music bed | **none** [M]. All 9 inter-phrase gaps are **exact digital zeros** (13.0 % of all samples): 2.000-2.094, 3.339-3.418, 5.323-5.509, 7.500-7.665, 12.342-12.825, 15.823-16.194, 22.857-23.960, 26.903-27.139, 30.328-31.552 s. A music bed would fill these. |
| SFX | **none** [M]. T1, T4, T5 and T6 overlap exact digital silence. T3 sits in a −60 dBFS breath pause (19.69-20.12). T2 runs under speech. None of them adds a transient, and the spectrum has no non-speech onsets. Energy below 80 Hz is 0.02 % and above 12 kHz is 0 % (voice band-limited at about 13 kHz). |
| room tone | none. Pauses inside phrases fall to -55…-65 dBFS (breath tails), then hard-gate to zero between phrases. |
| voice | starts at **0.08 s** (frame 2), so the opening build runs under the first word. It ends at 30.33 s. The last 1.2 s (the un-build/loop) is silent. |
| speech rate | 84 tokens / 30.25 s = **2.78 words/s**. Sentence pauses 80-1100 ms. |
| transcript | "France expected 200,000 marchers, half a million came, and they didn't all want the same thing. France has had bigger marches, but normally they march against one law and the government drops it or passes it. This time, it's prices, schools, and lots more. Saying yes on schools alone would cost 10 billion euros, and France now pays more to borrow than Greece. Saying no isn't easy with an election in April. So now it's hard to say yes and hard to say no." (word times: `ref_transcript_words.json`) |

Implication for us [I]: the motion carries all the "sound design". If the sound stream adds SFX, they must follow
the visual onsets below (whooshes on flip midpoints, ticks on pops), not the word onsets.
Evidence: `audio_spectrogram.png`.

---

## 2. Reference structure (scene and transition timeline) [M]

| id | time (s) | frames | content / motion |
|---|---|---|---|
| S1 | 0.00-7.70 | 0-231 | street march. Line art at f0. Sun rises 0-0.37. Fill cascade 0.03-0.37. Crowd rows recolour 1.40-1.47. "Half a million" crowd burst 2.00-2.13. Front row rises 2.53-2.70. Placards rise 3.23-3.80. Placards recolour 4.50-4.93. Far ghost crowd 6.07-6.67. Drain and sign rise 7.2-7.6 |
| T1 | 7.43-8.03 | 223-241 | sign zoom-through match-cut (full-white frames 7.73-7.80) |
| S2 | 7.83-13.67 | 235-410 | notice board: fills first, lines 8.07-8.9. Cat jumps onto board. Sun peeks behind wall and bounces on words. 2nd sheet. Paper drops 10.53. Stamp 11.10-11.47. Partial un-build plus people rise 12.8-13.37 |
| T2 | 13.33-14.20 | 400-426 | tilt, anticipation, horizontal card swipe (cards cross centre 13.80). Cat jumps across |
| S3 | 14.07-19.90 | 422-597 | city block builds building by building 14.2-15.7. People rise. Board. Tick 16.43-16.73. Price tag pops from the sun 16.40-16.80. 10 coins 16.87-18.5. Tag flies up and out 19.3-19.5 |
| T3 | 19.63-20.63 | 589-619 | tilt plus 3D Y-flip (edge-on 20.23). Sun arc-hops across |
| S4 | 20.30-23.27 | 609-698 | ATMs: screens fill, map, receipts print 21.0-22.0, sun hop 21.10-22.40, tag from S3 falls in 22.27-22.8 |
| T4 | 23.13-24.23 | 694-727 | sun squash, tilt plus 3D flip (edge-on 23.83). Sun arc-hops to S5 |
| S5 | 24.0-26.93 | 720-808 | ✓/✗ board. Sun sets behind wall. Wall lines draw. People rise 24.67-25.4. Election boards 25.5-26.3. Sun bobs |
| T5 | 26.93-28.20 | 808-846 | push-in 1.9x onto the board, marks drained |
| S6 | 27.7-30.77 | 831-923 | close-up board: glass doors swing, answer panels plus ✓ (28.33-28.70) and ✗ (29.67-30.03) |
| T6 | 30.77-31.53 | 923-945 | un-build back to the opening line art. Loops into f0 |

Cadence [M]: scene change every 3.4-6.4 s (mean 5.2 s). Caption page every 1.4-4.1 s (mean 2.8 s).

---

## 3. Master table: every motion type with numbers

`s / f` = seconds / frames @30. CW = card width (960). Easing in CSS cubic-bezier notation. Remotion: `Easing.bezier(...)`.

| # | motion | duration | distance / amount | easing (Remotion) | anchor, order, notes | tag |
|---|---|---|---|---|---|---|
| 1 | **caption page scroll** (whole stack up) | **0.45 s / 13.5 f** | 250 px = clip height (231) + 19 | `bezier(0, 0.7, 0.12, 1)` (rms 2 %). 40-56 % of the travel happens in the first frame (depends on sub-frame phase), then each frame keeps ×0.70 of the remainder | old page gone in 2-3 f, new page within 1 px after 11-12 f. No opacity. Hard clip at the window edges (ref y 1004-1235) | M |
| 2 | **caption line-2 rise** | 0.40-0.45 s / 12-13 f | ≈ 1 line pitch (≈110 px) from below the clip edge | same as #1 | line 1 does not move. Line 1 of a 2-line page is placed in slot 1 from the start; a 1-line page is vertically centred | M |
| 3 | **keyword highlight wipe** | **0.19 s + 0.3 ms × width_px** (82 px → 0.22 s / 7 f; 211 px → 0.26 s / 8 f; 467 px → 0.33 s / 10 f) | box full line height (80 px), left edge fixed, right edge grows L→R | `bezier(0.3, 0.3, 0.1, 1)` | starts 105 ms before the word. Persists until its page scrolls away and scrolls with the text. 8 highlights in 31 s; at most 1 per line, usually 1 per page (the final "yes … no" page has one per line; a phrase counts as one) | M |
| 4 | **line draw-on**, single stroke | **3-6 f (0.10-0.20 s)** whatever the length | average 2,000-3,600 px/s, peak 5,400 px/s (200 px stroke ≈ 3 f, 714 px ≈ 6 f) | short: linear or `inOut(sin)`; long: ease-out (fast start) | 3-6 strokes in flight at once. Successive strokes start **1 f (33 ms) apart**. Horizontals L→R, verticals mostly top→down | M |
| 5 | line draw-on, whole object | building ≈ 0.6-0.7 s (20 f). Buildings overlap ≈ 50 %, so a new building every 0.25-0.3 s | ink added ≈ 1,500-2,800 px²/frame per region | - | order: structure (top edges, horizon) → verticals → frames → ground lines → details. S3 order: centre-right → right → centre-left → left | M |
| 6 | circle stroke (coin, stamp ring) | 4-7 f (0.13-0.23 s) | ~85-190 px circumference | linear arc | coin fill pops 3-4 f after the stroke starts, i.e. mid-stroke | M |
| 7 | ✓ / ✗ mark | **5 f (0.17 s)** | ✓ = short down-stroke, then long up-right (≈300 px total). ✗ = two diagonals in sequence | stroke speeds 50→110→35 px/f (in-out) | starts on the word (−50…+70 ms) | M |
| 8 | fill arrival, ink-first mode | lag **4-8 f (0.13-0.27 s)** after its outline starts | - | hard 1-f pop, or grow from centre 0.2→1 over 3-4 f | slightly mis-registered from the lines (style). Used for detail fills (windows, coins) | M |
| 9 | fill arrival, fill-first mode | flat silhouettes first, lines drawn over them **0.1-0.9 s later** | - | 1-f pop | S2 opening (flat wall/door/ground, then ink). S3 buildings exist as silhouettes before they are detailed | M |
| 10 | large base fill wipe | 3-4 f (0.10-0.13 s) | whole facade | linear wipe bottom→top | S3 cream facade turning white before its windows draw | M |
| 11 | opening fill cascade | 10 f (0.33 s) | ~25 regions | each region a 1-f pop, radiating out from the vanishing point at ≈ 2-3 regions per frame | colour-pixel count rises linearly (≈ 25k px/frame) | M |
| 12 | recolour (white → colour or colour → white) | 1-2 f | - | pop, staggered ≈ 1 f between objects | placards turning orange/peach. Crowd draining to white before T1 | M |
| 13 | **scale-in "answer panel"** (big peach rect) | 0.30 s / 9 f | scale 0.2→1, from centre | `bezier(0.4, 0, 0.2, 1)` (rms 0.6 %) | no overshoot. Comes before its ✓/✗ | M |
| 14 | pop from a source (price tag out of the sun) | appear at 30 % scale, hold 2 f, grow 10 f (0.33 s) | drops 120 px on a string | ease-out ≈ `bezier(0.3, 0.2, 0.05, 1)`. Pendulum: −16° → −8° → 0 → −2°, period ≈ 0.5 s, decays in ≈ 0.8 s | no size overshoot | M |
| 15 | stamp slam | ring drawn 4 f, then disc **2.6× → 1.0×** in 8 f (0.27 s) | - | `inOut`, no undershoot | lands 320 ms before "passes" | M |
| 16 | **rise-in from below** (people, placards) | **0.2-0.33 s (6-10 f)**, 50 % in frame 1, then ×0.5 per frame | ≈ the object's own height (130-170 px) | `Easing.out(Easing.exp)` over 0.33 s, or spring `{damping: 40, stiffness: 700, mass: 1}` (≈ 3 % overshoot) | anchor = bottom (the panel's bottom edge or the crowd in front hides the entry). People **never walk in**: they rise | M |
| 17 | crowd fill-in stagger | 4-5 f (0.13-0.17 s) per person, L→R. Placards 0-9 f (mean 3.4 f). Coins 4.4 f (0.147 s). "Half a million" burst: 40+ figures in 4 f | ≈ 7 items/s steady. Bursts of 10+ items/frame on the big beat | per item = #16 or #8 | see §6 | M |
| 18 | exit by sinking | ≈ 0.2 s each, staggered ≈ 2 f | down behind the panel bottom | ease-in | S2 outline people at 12.9-13.4 | M |
| 19 | sun beat pulse | attack 2-3 f (0.07-0.1 s), hold 2-3 f, release 6-10 f (0.2-0.33 s) | **+4…+13 %** scale | attack ease-out, release ease-in-out | about the disc centre. At 0.97, 1.43, 2.00 and 5.47 s, and on arrival from the opening rise (+7 %) | M |
| 20 | sun bounce (peeking over a wall) | 0.45-0.9 s per bounce | 26-62 px up | ballistic (sine-like) | bottom of each bounce lands on a word onset (±10 ms) | M |
| 21 | **sun hop** (squash/stretch) | anticipation squash 3 f, airtime **1.03 s**, land squash 2 f, recover 4 f | 74 px high | rise ease-out, fall ease-in (accelerating). Floaty gravity ≈ 560 px/s² | squash sx 1.07 / sy 0.91 (anticipation), sx 1.085 / sy 0.88 (landing). Stretch on take-off sx 0.97 / sy 1.06. Anchor = bottom | M |
| 22 | sun arc hop across a flip | 1.2-1.3 s | 420 px sideways at a constant 330 px/s, apex 118-136 px | parabola | lands on the new scene's horizon, with the landing squash of #21 | M |
| 23 | sun drift (idle) | continuous | S1 7 px per 3.5 s, S2 **30 px/s linear**, S3 54 px slide (in-out, 1.5 s), S5 12 px/s | linear | never perfectly still for long | M |
| 24 | sun set | 2 steps (24.5 s, 26.3 s) | visible part 100 % → 63 % → 54 % | step plus bob | slides down behind a wall line. Exits during T5 | M |
| 25 | cat jump between cards/scenes | 0.33-0.37 s (10-11 f) | e.g. 100 px across, 420 px down | ballistic: constant vx, **g ≈ 3,000-8,000 px/s²**. Lands with squash (h × 0.8, 1-2 f) | billboard overlay: never foreshortened by flips | M |
| 26 | receipt printing | 1.07 s | 150 px | stepped: 2 fast frames (13-15 px) + 2-4 slow (5 px), ≈ 140 px/s on average | mechanical idle | M |
| 27 | placard idle bob | ~1 s period | ±3-4 px | sine | after the rise | M |
| 28 | glass door swing | 4 f (0.13 s) | 80 px/f edge travel | ease-out | S6, just before each answer panel | M |
| 29 | card tilt (pre-flip / pre-swipe) | 4-6 f (0.13-0.2 s), then hold 3-4 f | **±1.5°** (flip), +0.66° (swipe) | ease-out ≈ `bezier(0.2, 0.6, 0.4, 1)` | about the card centre. Direction alternates between flips | M |
| 30 | **3D card flip** | **0.78 s / 23 f** | rotateY 0→180°. Edge-on at 45 % (0.35 s). Scale bump **+2.6 %** at edge-on. Perspective: none measurable | `bezier(0.7, 0.4, 0.3, 0.95)` (rms 0.6 % on both flips) | thickness edge 12 px, kraft tan `#DBBEA3`. Peak speed 17-26°/frame | M |
| 31 | card swipe (horizontal) | 0.61 s / 18 f | 1,089 px ≈ card width + 96 px gap + 27 px wind-up | `bezier(0.43, 0.02, 0.04, 1)` (rms 0.0) | peak 205 px/f. Cards move as one strip with a 96 px gap | M |
| 32 | push-in (camera) | **1.1-1.27 s** | **1.0 → 1.9×** | `bezier(0.6, 0.25, 0.41, 0.87)` | anchor ≈ the board's top-left (about 12 % from the panel's left, 35 % from its top) | M |
| 33 | sign zoom-through | in: 4 f; full-white hold: 3 f; out: 6 f | in 101 px → 780 px (×7.7); out 780 → 122 px (×6.4) | in: accelerating (×1.35, ×1.8, ×2.0 per f). Out: ease-out | see T1 | M |
| 34 | un-build collapse | fills shrink 5-6 f; ink retracts 4 f; background slab collapses downward 5 f | to 0 | ease-in (accelerating) | see T6 | M |

Evidence for the curves: `easing_fits.png` (8 panels with data points and the recommended curves).

---

## 4. Caption system (detail)

- **Pages, not words.** A page is 1-2 centred lines (4-11 words). The text never types on word by word. Line 1 of a
  two-line page appears with the page. **Line 2 rises in separately** when its first word is near.
  A one-line page sits vertically centred in the window (ref top 1085 vs line-1 slot 1031).
- **Page change = the whole stack scrolls up** by `clipHeight + ~20 px` (ref 231 + 19 = 250) in 0.45 s with
  `cubic-bezier(0, 0.7, 0.12, 1)`. The outgoing page shoots off the top in 2-3 frames. The incoming page decelerates
  into place, keeping 70 % of the remaining distance each frame (from 3 f onward). **Overlap:** both pages are visible for 2 frames.
  Our window is taller (330 px, `style_bible.md` §1), so use D = 350 px. That keeps the incoming page fully hidden at t=0, as in the reference. [I]
- **No opacity, no blur, no scale** on any caption [M: ink darkness stays at 20-27 in every frame of every move].
- **Highlight**: box colour = peach. Box height = 80 px (≈ 1 line, a few px beyond the glyphs). It wipes L→R
  (clip-reveal, full height from frame 1). It belongs to the line and scrolls with it. It never wipes out.
- During flips the caption is **on the card** and rotates with it. During the T2 swipe it **stayed fixed in screen space**
  while the cards slid under it. [M: caption x unchanged f410-422]

Evidence: `strip_caption_page_scroll.jpg`, `strip_caption_line2_rise.jpg`, `strip_highlight_wipe_Greece.jpg`.

---

## 5. Characters as motion carriers

**Sun** (evidence: `sun_track.png`, `strip_sun_hop_squash.jpg`) [M unless noted]
- Opening: emerges from behind the buildings at the vanishing point (ref 650,376), travels to its slot (540,191) in
  11 f (0.37 s, ease-out), then pulses +7 % (f7-12). The same rise starts in the last 3 frames (f943-945), so the loop seam is mid-motion.
- On beats: +4…+13 % pulses (largest +13 % on "half a million").
- S2: half hidden behind the wall top. Drifts right at a linear 30 px/s. Bounces 26-62 px, with each **touch-down on a
  word onset** ("law" +10 ms, "and" +10 ms, "This" 0 ms).
- S4: hop with full squash and stretch (anticipation 3 f on "pays", land 70 ms before "Greece").
- Flips: the sun is a screen-space overlay that hops in an arc across the flipping card, then lands in the new scene.
- S5: sets behind the wall in steps while bobbing 20-28 px on "with", "election", "in". Gone after T5. Back at the loop.

**Cat** [M]
- Is present in every scene and **crosses every transition by jumping or falling**: falls into S2 (T1), arcs onto the next card
  (T2, 0.37 s, g ≈ 3,150 px/s², squash on landing), stays unflipped as a billboard on the flipping card (T3, T4), scales up with the push-in (T5),
  and jumps from the board to its opening balcony spot while shrinking 7× (T6, 0.37 s).
- Inside scenes it hops onto the main prop (S2 8.4-8.7: ground → board top) and then watches. Idle tail motion only [I].
  Tail/blink details live in `mascot.md`.

---

## 6. Crowds and accumulation

| build | count | time | rate / stagger | how each item arrives | tag |
|---|---|---|---|---|---|
| S1 front seat-rows recolour | 3 rows | 1.40-1.47 | 1 row / frame | outline heads → colour, 1-f pop | M |
| S1 "Half a million" | 40+ figures plus side crowds | 2.00-2.13 | all in 4 f (12 % of pixels change per frame) | front block rises from the bottom, sides pop | M |
| S1 nearest row | ~8 big figures | 2.53-2.70 | 5 f | rise from bottom | M |
| S1 placards | 6 | 3.23-3.80 | 0-9 f (mean 3.4 f) | rise 130-140 px in 4 f, then ±3 px bob | M |
| S1 far "bigger" ghost crowd | ~60 outline heads | 6.07-6.67 | clusters every 1-2 f | outline-only pops (no fill: a "ghost" crowd) | M/I |
| S3 people | 3 + 4 | 14.5-15.9 | 4-6 f | rise / pop | I |
| S3 coins | 10 | 16.87-18.5 | **4.4 f (0.147 s)** | circle stroke 6-7 f, fill pops 3-4 f after it starts | M |
| S5 audience | 6 | 24.67-25.4 | **4-5 f (0.13-0.17 s), L→R** | rise ~160 px, 6 f, `out(exp)` | M |
| S5 election boards | 4 | 25.5-26.3 | ~6 f | white rect pop, then poster detail | I |

Rule [I from M]: **stagger 3-5 frames for "counting" builds, 1 frame for "texture" builds, 0-1 frame (burst) for the
big number moment.** A burst is followed by ≤ 0.5 s of small settling events, never by stillness.
Evidence: `strip_crowd_fill_in.jpg`, `strip_placards_rise.jpg`, `strip_people_rise_in_stagger.jpg`, `strip_coins_stroke_then_fill.jpg`.

---

## 7. SYNC GRAMMAR (apply to `assets/timing.json` word times)

Measured offsets (visual onset minus word onset; plot: `sync_offsets.png`) [M]:

| event | median | IQR | n | rule for our build |
|---|---|---|---|---|
| keyword highlight wipe start | **−105 ms** | −118…−92 | 8 | `hlStart = word.s − 0.10` |
| caption page scroll start (first word of page) | **−40 ms** | −93…−9 | 8 | `pageStart = firstWord.s − 0.04` |
| caption line-2 rise start (first word of line 2) | **−77 ms** | −180…−63 | 9 | `line2Start = word.s − 0.08` (never later than +0.15) |
| illustration element start (word that names it) | **−100 ms** | −250…−60 | 17 | small item: `word.s − 0.10`. Big build or burst: `word.s − 0.25…0.40`, so it **completes on the word** |
| ✓ / ✗ / strike stroke start | **+25 ms** | −13…+55 | 4 | `mark = word.s + 0.0` (0.17 s stroke) |
| its colour panel (answer panel) | −250 ms | −260…−130 | 3 | `panel = word.s − 0.25`, completes ≈ `word.s + 0.05` |
| character beat (sun pulse, bounce touch-down, hop take-off/landing) | **−5 ms** | −55…+10 | 8 | on the stressed word, `±0.05` |
| transition midpoint (edge-on, cards crossing, full-white frame) | −10 ms | −140…+60 | 4 | midpoint on the first word of the new sentence |

Grammar rules [I, from the measurements above]:
1. **Lead, don't follow.** Picture onsets come 1-4 frames before the sound. Nothing in the reference starts more than 70 ms after its word.
2. **Read-in tail.** The highlight finishes ≈ 120 ms after its word starts, so the eye arrives as the word is heard.
3. **Marks hit, colours anticipate.** The colour field arrives ≈ 0.25 s early. The hand-drawn mark (✓/✗) strokes on the word.
4. **Transitions live in pauses.** T1, T3, T4 and T5 each start inside a ≥ 0.3 s pause (see the bold pauses in `timing.md`). The transition starts
   0.45-0.6 s before the next sentence's first word, so its midpoint lands on that word.
5. **One emphasis per line.** At most one highlight per caption line (normally one per page), plus at most one big visual beat (burst, stamp, hop) per sentence.
6. **Density per word**: ≈ 2 medium visual events per spoken word (5.9 events/s against 2.78 words/s).
7. A page is never shorter than 1.4 s. Mean 2.8 s.
8. The first frame is fully built (line art plus caption). The first motion is at frame 1. The voice is at frame 2.

---

## 8. Transition recipes (t = 0 at the anchor word onset unless stated)

### T-FLIP (card 3D flip) [M] — T3 19.63-20.63, T4 23.13-24.23. Evidence: `strip_T3_card_flip.jpg`, `strip_T4_card_flip.jpg`
| step | start | dur | what |
|---|---|---|---|
| 0 | −0.70 s | 0.10 s / 3 f | (T4 only) sun anticipation squash (sx 1.07, sy 0.91). Prior hero prop exits (T3: price tag flies up out of frame at −0.9 s) |
| 1 | −0.60 s | **0.13-0.16 s / 4-5 f** | card rotateZ to **±1.5°** about its centre, ease-out `bezier(0.2, 0.6, 0.4, 1)`. Alternate the sign per flip (T3 −1.5° CCW, T4 +1.5° CW) |
| 2 | −0.46 s | 0.13 s / 4 f | hold the tilt (the scene keeps its idle life) |
| 3 | −0.35 s | **0.78 s / 23 f** | rotateY 0→180°, `bezier(0.7, 0.4, 0.3, 0.95)`. **Edge-on at t = 0** (45 % of the duration). Tilt unwinds proportionally (−1.5° → 0 by edge-on). The new card arrives level (0°) |
| 3a | | | scale bump: `1 + 0.026·sin(π·p)` with p = angle/180 (peak +2.6 % at edge-on) |
| 3b | | | perspective: **none**. Left/right edge heights are equal within 0.1 % at 60° (`perspective ≥ 20000px` or orthographic) |
| 3c | | | card thickness: 12 px slab, kraft tan `#DBBEA3`. The visible edge width = 12·sin θ. It shows on the right in T3 and on the left in T4 (opposite side per flip, matching the tilt direction) |
| 3d | | | the caption is on the card (rotates with it). The **sun** stays in screen space and arc-hops across (#22). The **cat** is a billboard: its position follows the card, it is not squashed |
| 4 | +0.43 s | | settle: no overshoot on the rotation. The new scene's first build event starts ≈ +0.15 s (T3: ATM screens fill at 20.40), i.e. before the flip has settled |

### T-SWIPE (tilt plus horizontal carousel) [M] — T2 13.33-14.20. Evidence: `strip_T2_tilt_swipe_cat_jump.jpg`
1. −0.48 s: card wind-up: moves **+27 px right, 5 px up, rotateZ +0.66°** over 6 f (0.2 s), ease-out.
2. −0.28 s: hold 3-4 f.
3. −0.17 s: old and new cards move left as **one strip with a 96 px gap**. Travel 1,089 px in **0.61 s**, `bezier(0.43, 0.02, 0.04, 1)`,
   peak 205 px/f. **Cards cross the centre at t = 0** ("prices"). The new card is level, the old one keeps its 0.66° tilt.
4. The caption stays fixed in screen space. The sun stays in screen space and slides +54 px right over the next 1.5 s.
5. The cat jumps off the old card at −0.03 s and lands on the new card's ground at +0.33 s (ballistic, squash on landing).

### T-MATCH (zoom-through on a shared white rectangle) [M] — T1 7.43-8.03. Evidence: `strip_T1_sign_zoom_through.jpg`
1. −0.47 s: one placard turns white and rises out of the crowd (≈ 200 px over 0.35 s while growing ≈ 1.3×) [I for the rise numbers].
   −0.27 s: un-build of colour: crowd fills **pop to white**, staggered 1 f per figure over 3-4 f (pixel traces: 1-frame jumps, no fade).
2. −0.07 s: that white placard **zooms toward the camera** 101 → 780 px wide in 4 f (accelerating ×1.35, ×1.8, ×2.0 per frame).
   It covers the whole panel **and the sun**. The caption page scroll fires at t ≈ 0.
3. +0.06 s: **3 f of pure white panel** (the match frame).
4. +0.16 s: the white sheet **shrinks** 780 → 122 px in 6 f (ease-out) and *becomes the notice pinned on the new wall*. The new scene is
   revealed around it as **flat fills only** (fill-first). The sun reappears peeking over the wall. The cat falls in from the top with gravity and lands at +0.36 s.
5. +0.4 s → +1.2 s: the linework draws on over the flat fills (#4, #5), top to bottom.
Generalisation [I]: any flat shape (paper, screen, sign, tag) can be the bridge. Zoom it to fill the panel, hold 3 f, shrink it into its counterpart.

### T-PUSH (camera push-in plus mark reset) [M] — T5 26.93-28.20. Evidence: `strip_T5_push_in.jpg`
1. −0.22 s: push-in starts, **1.0 → 1.9×** over 1.1-1.27 s, `bezier(0.6, 0.25, 0.41, 0.87)`, anchored near the hero prop's top-left.
2. −0.08…+0.12 s: the previous marks are removed. The ✓/✗ peach panels pop back to the plain glass colour (1-f pops over 0.2 s). The caption page scrolls (t = −0.04).
3. The zoom pushes the setting sun and the side props (door, election boards) out of frame. Nothing else exits.
4. Settles at +1.05 s. The re-build starts at +1.18 s (answer panel scale-in, glass door swing, then ✓ on "yes"), repeating the earlier beat at hero scale.

### T-UNBUILD + LOOP (the ending) [M] — T6 30.77-31.53 (in silence). Evidence: `strip_T6_unbuild_and_loop.jpg`
Times are relative to the last word's end (30.33 s):
| step | t | dur | what |
|---|---|---|---|
| 1 | +0.44 s (30.77) | 3 f | frame lines go loose: the glass doors swing and lines extend past their corners. Ink count +40 % |
| 2 | +0.50 s | 5-6 f | fills **shrink to their centres** (scale → 0, ease-in). People sink out |
| 3 | +0.57 s | 4 f | the board linework retracts (ink −90 %) |
| 4 | +0.64 s (30.97) | 5 f | the flat background slab (brown wall) **collapses downward** (top edge falls, area 100/94/81/62/33/0 %, ease-in). It reveals the **opening scene's line art** underneath |
| 5 | +0.67 s (31.00) | 0.45 s | the caption page scrolls to the **opening caption** (same recipe as #1) |
| 6 | +0.54 s (30.87) | 11 f | the cat jumps from the board to its opening balcony pose: x linear 26 px/f, y with gravity, scale 1 → 0.15 |
| 7 | +0.80 s (31.13) | 9 f | crowd "seat" outlines draw on row by row (ink 40k → 58k px) |
| 8 | +1.10 s (31.43) | → loop | the **sun begins its opening rise** from the vanishing point. It continues across the seam: f0 = this same rise, 3 frames later |
The **seam is mid-motion**, not a held frame. f945 → f0 is just another step of the sun rise, and the fill cascade starts at f1.
Recipe for us [I]: end on the opening's line-art state, including the opening caption. Start the opening's first motion 3-4 frames
before the cut. Make frame 0 identical to "end + 1 frame" of that motion.

### T-OPEN (frame 0 → 0.37 s) [M] — evidence `strip_open_sun_rise_fill_cascade.jpg`
f0: full line art and caption (the hook). f1-11: the sun rises from the vanishing point to its slot (ease-out), pulses +7 % at f7-12. f1-10: fill cascade
radiating out from the vanishing point (1-f pops, ≈ 2-3 regions per frame). From 0.5 s, the first highlight and crowd beats follow.

---

## 9. Idle motion and change density (targets)

Measured on the reference [M] (plot: `change_density.png`):
- Fine change events (connected space-time change blobs ≥ 60 voxels at ¼ res): **22 onsets/s** raw, 12/s after merging neighbours.
- **Medium events** (≥ 500 voxels ≈ an object of 40×40 px moving over 5 f): **mean 5.9/s, median 5/s**, range 0-15/s.
  Median gap between medium onsets is 4 f (0.13 s). The longest gap outside transitions is 0.97 s (17.73-18.70, while coins still tick in).
- Only **3.6 %** of frames change < 0.1 % of their pixels. The longest near-static stretch (< 1,000 px changed) is **6 f (0.2 s)** (f560-565).
  At < 3,000 px it is 12 f (0.4 s) (f624-635, the sun resting after a landing).
- Idle sources while nothing is being built: sun drift, bounce and pulse. Placard bob (±3-4 px, ~1 s). Tag pendulum. Receipt stepping. Cat tail [I].
  There is **no** line boil, no camera drift and no card float (card corners fixed within ±1 px outside transitions).

**Target for our 70.7 s build:**
| metric | target |
|---|---|
| medium events | ≥ 5 per second on average (≈ 350-420 total). 2-4 per second allowed only during a held "counting" beat |
| largest gap between new medium events | ≤ 1.0 s (except inside a transition, which is one long event) |
| frames with < 0.1 % pixels changing | ≤ 5 % of frames. No run longer than 0.4 s (12 f @30) |
| bursts | 1 big burst (≥ 10 items within 4 f) per 6-10 s, on a number or a hero word |
| idle layer | always on: sun drift ≥ 10 px/s or a bob, plus mascot idle. Never zero motion on screen |

---

## 10. Remotion constants (recommended; seconds-based)

```ts
import {Easing} from 'remotion';
// all durations in SECONDS; derive frames with Math.round(sec * fps)
export const MOTION = {
  captionScroll: {dur: 0.45, ease: Easing.bezier(0, 0.7, 0.12, 1), dist: (clipH: number) => clipH + 20},
  captionLine2:  {dur: 0.42, ease: Easing.bezier(0, 0.7, 0.12, 1), dist: (linePitch: number) => 1.15 * linePitch},
  highlight:     {dur: (wPx: number) => 0.19 + 0.0003 * wPx, ease: Easing.bezier(0.3, 0.3, 0.1, 1), lead: 0.10},
  stroke:        {dur: (lenPx: number) => Math.min(0.2, Math.max(0.1, lenPx / 3000)), ease: Easing.inOut(Easing.sin), stagger: 1 / 30},
  fillLag:       {min: 0.13, max: 0.27},          // after its outline starts (ink-first mode)
  fillGrow:      {dur: 0.12, from: 0.2},          // 3-4 f centre scale-in; or a 1-frame pop
  rise:          {dur: 0.33, ease: Easing.out(Easing.exp)}, // or spring {damping: 40, stiffness: 700, mass: 1}
  riseStagger:   0.15,                            // people/coins "counting"; 1/30 for texture
  answerPanel:   {dur: 0.30, from: 0.2, ease: Easing.bezier(0.4, 0, 0.2, 1), lead: 0.25},
  mark:          {dur: 0.17, lead: 0.0},          // ✓ ✗ strokes
  sunPulse:      {attack: 0.08, hold: 0.08, release: 0.27, amp: [0.04, 0.13]},
  hop:           {antic: 0.10, air: 1.03, land: 0.07, recover: 0.13, height: 74, squash: [1.085, 0.88], stretch: [0.97, 1.06]},
  catJump:       {air: 0.35, gravity: 4000},     // px/s^2, constant vx, land squash scaleY 0.8 for 1-2 f
  tilt:          {dur: 0.15, deg: 1.5, ease: Easing.bezier(0.2, 0.6, 0.4, 1), hold: 0.13},
  flip:          {dur: 0.78, ease: Easing.bezier(0.7, 0.4, 0.3, 0.95), edgeOnAt: 0.45, scaleBump: 0.026, thickness: 12, edge: '#DBBEA3'},
  swipe:         {dur: 0.61, ease: Easing.bezier(0.43, 0.02, 0.04, 1), gap: 96, windup: {dx: 27, deg: 0.66, dur: 0.2}},
  pushIn:        {dur: 1.15, to: 1.9, ease: Easing.bezier(0.6, 0.25, 0.41, 0.87)},
  matchZoom:     {in: 4 / 30, hold: 3 / 30, out: 6 / 30},
  unbuild:       {fillShrink: 0.18, inkRetract: 0.13, slabCollapse: 0.17}, // all ease-in
} as const;
```
Springs: the measured rotation, scroll and swipe curves do **not** fit Remotion springs (their initial velocity is too high, or they have an ease-in). Use the beziers.
Use springs only for rises and pops: `{damping: 40, stiffness: 700}` (≈ 3 % overshoot). For a pop with 7 % overshoot peaking at 0.2 s:
`{damping: 27, stiffness: 430, mass: 1}` [I, derived from the 7 % overshoot measured on the sun arrival].

---

## 11. Evidence index (`docs/motion_evidence/`)

| file | shows |
|---|---|
| `change_density.png` | % pixels changed per frame (log), event onsets per second (fine and medium), word onsets, scene/transition boundaries |
| `easing_fits.png` | data plus recommended curves: caption scroll, highlight wipe, flip rotateY, swipe, rise-ins, scale-ins, push-in, stroke draw-on |
| `sync_offsets.png` | visual-onset minus word-onset for highlights, pages, line 2, elements, marks, sun beats |
| `sun_track.png` | sun centre x/y and bbox w/h over 31.5 s (pulses, bounces, hops, squash, drift, setting) |
| `audio_spectrogram.png` | voice-only audio, exact-zero silences marked |
| `strip_open_sun_rise_fill_cascade.jpg` | f0-12 |
| `strip_T1_sign_zoom_through.jpg` | f222-243 |
| `strip_T2_tilt_swipe_cat_jump.jpg` | f398-427 |
| `strip_T3_card_flip.jpg`, `strip_T4_card_flip.jpg` | f588-621, f696-729 |
| `strip_T5_push_in.jpg` | f804-848 (every 2 f) |
| `strip_T6_unbuild_and_loop.jpg` | f918-945, then f0-10 |
| `strip_caption_page_scroll.jpg`, `strip_caption_line2_rise.jpg`, `strip_highlight_wipe_Greece.jpg` | caption crops |
| `strip_drawon_building_lines_then_fills.jpg` | ink-first building build (f443-466) |
| `strip_drawon_S2_fills_first_then_lines.jpg` | fill-first scene build (f240-263) |
| `strip_coins_stroke_then_fill.jpg`, `strip_stamp_outline_then_slam.jpg`, `strip_tag_pop_from_sun.jpg` | pops |
| `strip_people_rise_in_stagger.jpg`, `strip_placards_rise.jpg`, `strip_crowd_fill_in.jpg` | rises and crowds |
| `strip_answer_panel_and_marks.jpg` | answer panel scale-in, then the ✓ and ✗ strokes (f848-863, f892-903) |
| `strip_sun_hop_squash.jpg` | anticipation squash, stretch, landing squash |
| `ref_transcript_words.json` | reference transcript, refined onsets, exact silences |
| `measurements.json` | raw series behind the fits (caption offsets, highlight widths, flip widths, swipe, push-in, sun track) |

## 12. Caveats

- Word onsets are ±40 ms, so sync medians are good to about ±1 frame. Some element-to-word pairings are judgement calls
  ("came" vs "million", "bigger" vs "had"). They are marked in `sync_offsets.png`.
- Easing fits come from 4-24 samples per event. Short motions (≤ 5 f) constrain the curve only loosely. Their rms is in `easing_fits.png`.
- The reference is H.264. Pixel traces were checked on JPEG q2 frames; 1-frame pops survived compression unambiguously.
- Push-in scale is measured from board-panel widths (146 → 278 px). An ORB-based estimate gave 1.26× because it under-tracks the large changes; use 1.9×.
- "[I]" items (cat tail, election boards, S3 people timings, T1 sign rise) are read off the frame strips and were not fitted.

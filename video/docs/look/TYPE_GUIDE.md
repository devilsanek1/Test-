# TYPE GUIDE: the words on screen (fonts, placement, motion, recipes) · DRAFT until the owner picks

**Status: DRAFT (2026-10-30, the type iteration).** Nothing here is a rule until the owner picks from the stills
(`docs/look/type/stills/`); until then `LAYOUT.md` (the band, Patrick Hand 98 px, the peach box) stays the default
(playbook: "The words on screen are DESIGNED"). The research behind every number: `docs/look/type/RESEARCH.md` (findings
F1-F15, with sources). Px at 1080 x 1920, y down, 60 fps; times are video 4's take (`public/v4/voice_words.json`, 42.24 s,
177.7 words/min); a "pop" happens 2 frames before its word's start (text a hair ahead of the sound reads as in sync).

## a. Principles (what makes our words premium, dynamic and engaging; the owner's rules never change)
1. Every spoken word, in the voice's order, few at once and big: groups of 2-4 words; frame 0 shows the first spoken words, never a title; the payoff in words by ~2 s. (owner; F3)
2. One look, one brand: ONE HAND (a light hand-print) for every spoken word, ONE BRUSH for the few landing words, numbers and titles; recipes vary, the system never does. (owner; F1, F9)
3. Set into the picture: words sit in the open sky or wall by the beat's subject, on one steady anchor per shot, moving at most 220 px between groups. (F5, F6)
4. Light and airy, never boxed: thin strokes, open spacing, a soft halo in the sky's own tone; dark ink on light skies, warm white on dusk and night; the film's one warm accent marks the stressed word. (F10, F11)
5. Calm motion that never clips: pop in place, or build word by word on the voice; one swell or brush write-on for a landing word; cut out whole. (owner; F7, F15)
6. Read at a glance on a phone: every word at 0.25 scale, >= 4.5:1, >= 0.8 s a group, <= 20 characters a second, "AI" never "Al". (owner; F4)
7. Never the template: no outlines, boxes, heavy or all-caps running words, rainbow keywords, emoji, bounce, slides or typewriters. (F2)
8. Never twice, never covered: no words twice on screen at once; nothing passes in front of words while they are the beat; no paper edge beside them. (owner)

## b. The type system (two families, three roles; all OFL, from `scripts/type/.fonts/`)

| role | face (CSS family) | weight | size (font-size) | measured at that size | tracking | lines |
|---|---|---|---|---|---|---|
| **The hand:** every running word | **Gaegu** | 300 on dusk and night skies; 400 on light skies (dark ink reads thinner) | **116 px** everyday; **136 px** for the hook's first two groups and the payoff's last group | 116 px: cap 71, x-height ~45, stroke ~6 px (8 % of its S; Patrick Hand 98 px: cap 65, stroke 9 px) | +0.02 em | baselines 120 px apart (1.03 em); a line <= 830 px (prefer <= 760, ~13 characters); <= 2 baselines (3 in a landing-word lockup) |
| **The brush:** the landing word | **Nanum Brush Script** | 400 | **200 px** (1.7x the hand) | cap ~98, stroke ~12 px; "WANTS" 541 px wide | +0.02 em | its own row, stepped right of the line before |
| **The brush:** big numbers | Nanum Brush Script | 400 | **260 px** | figures ~165 px tall; "70,000" 593 px, "40" 237 px | +0.02 em | its own row; the unit word beside or under it in the hand |
| **The brush:** a world word (on a thing) | Nanum Brush Script | 400 | 140-200 px, figures >= 120 px tall (`LAYOUT.md`: one number 120-160 px) | | 0 | on the object, in the object's ink |
| **The title:** the cover's core line | the hand + the brush key word | hand 400 | hand 112-128 px; the key word 240-280 px | | +0.02 em | 3-4 rows, ragged, stepped |
| **The title:** a series title (later) | the brush over the hand (ref 2's lockup) | 400 / 300 | brush 2.5-3x the hand | | +0.02 / +0.04 em | left-aligned lockup |

**Colours per tone** (contrast measured on `scripts/type/bg/`, band y 290-600; F11):

| sky | running words (the hand) | accent: stressed word, landing word, numbers | halo (contrast without a box) |
|---|---|---|---|
| dusk and night (dark: video 4's whole film) | warm white **#FFF0DE** (7.9:1 on the night band) | amber **#FFB868** (5.2:1); a lighter amber #FFC98A (5.9:1) where the sky is deeper | `text-shadow: 0 0 0.22em` the sky darkened (#141A3A) at 40 % + `0 0 0.06em` at 25 %; no offset, never a hard edge |
| day and light dusk (light) | umber ink **#2B1B0A** (10.3:1 on the dusk band) | burnt orange **#8E3A12** (4.7:1) | only if the field varies: the sky lightened (#FFFFFF) at 30 %, blur 0.22 em |
| a sky that crosses from light to dark within a film | flips ink on a join (a shot change), never inside a group | | |

**The accent** is the film's one warm story colour (video 4: the heat, the lit windows' amber), used only for the
stressed word, the landing words and the numbers; never a second accent, never on a whole line.

**Why, against what we had:** Patrick Hand is heavy (stroke 12.8 % of the cap against ref 1's 6.9 %), comic, and its
capital I is a bare stroke ("AI" reads "Al"); the peach box is a highlighter, not paint. Gaegu Light is the nearest free
match to ref 1's felt-tip hand (7.4 %), an upright print with a barred I; Nanum Brush Script is the nearest to ref 2 and
is "a brush, not a pen". The posters' Futura-like caps (Jost) stay on posters: geometric and cool against the organic,
painted look, slow as running words, and lost on a 360-px grid tile (RESEARCH "The fonts"). Fallback hand if the owner
finds Gaegu too young: Mali 300 / 400, same sizes minus 16 % (Mali runs larger).

## c. The placement system

**The type frame (every word's ink stays inside):** y 290-1250; x 96-944 above y 840, x 96-860 below it (the organic
right rail is x > 950 at y 900-1500). A cut made for ads: x 120-888, y 288-1248, and left of x 780 below y 840 (F13;
`LAYOUT.md` §1). Platform UI: top y < 180, bottom y > 1520; nothing key there.

**The anchor and the seats:** the home anchor is the band (y 290-600: the one calm flat field, `LAYOUT.md`): baselines
**395 / 515** (one line 455), group centre on one of three seats, **L x 440 · C x 520 · R x 600**. A landing-word
lockup uses three rows at baselines **365 / 495 / 598** (the middle one the brush). A big number sits at baseline 500,
its unit word at 600.

**Where words sit, by shot type:**
- **WIDE and the home view (S1, S7, S12):** the open sky above the subject, in the band. The far city starts just
  under it, so ink stays at y <= 610.
- **MEDIUM (S2's end, S4, S8, S11):** the same seats; the subject's top stays at y >= 600 (`LAYOUT.md`), so the words
  read straight above it, close to the eye (F5).
- **CLOSE (S3, S5, S9, S10):** above the subject's top while the band is clear (video 4's closes are all centred). When
  a later film frames its subject off-centre and the open side is a calm field >= 360 px wide, the group goes BESIDE it:
  its near edge 60-300 px from the silhouette, its baselines at the subject's upper third (y 600-1000), never over it.
- **EXTREME WIDE, the one big move (S6):** seat C only; one word or one line may stand alone in the big sky.
- **LOW:** only when a calm floor (snow, water, a floor) >= 300 px tall lies in y 950-1250 and the sky is busy; never
  below y 1250. (No shot in video 4.)

**Moving between groups (one steady anchor, small moves):**
- Within a shot, the group centre moves <= 220 px (0.10 of the frame diagonal, CRAFT's eye-jump number) and its
  baselines stay put (+-40 px at most). Two-word groups walk the seats (L, R, C, L ...), never the same seat three
  times running; long lines may hold one seat.
- On a join, words may move farther only toward the next shot's subject, on the join's word; at most 2 empty frames.
- During a camera move the words hold their seat in screen space (the fixed mat: `LAYOUT.md` §4); they never ride the
  camera, except a world word (R7).
- Never over the subject, a face, a key read or the right rail; never across the paper edge.

## d. The motion system (60 fps)

| event | frames | easing | rule |
|---|---|---|---|
| **Enter: the pop** (default) | 1 | none | the group appears whole, in place, 2 frames before its first word |
| Enter: the soft pop (calm beats) | 3 (opacity) + 6 (scale 0.98 -> 1.00) | ease-out cubic, `cubic-bezier(0.22, 1, 0.36, 1)` | never a slide, never from scale 0 |
| **Build** (word by word) | 1 per word | none | each word pops into a slot laid out for the whole group at the group's start: nothing reflows or shifts; earlier words stay (F7) |
| Emphasis: the tint | 0 | none | the stressed word pops already in the accent colour |
| **Emphasis: the swell** (a landing word) | 5 up (0.94 -> 1.04) + 9 back (-> 1.00) | ease-out cubic, then ease-in-out sine | origin: the word's baseline centre; its neighbours never move |
| Emphasis: the brush write-on (if the owner approves; RESEARCH Q3) | 10-16 (12 default) | ease-in-out over the strokes | the landing word painted on along its strokes, left to right, led by a soft brush tip, starting 4 frames before its word; never cut by a frame edge or a window; every other word pops whole |
| Settle (after a write-on) | 6 | ease-out | the halo fades 0 -> 40 % |
| **Leave** | 1 | none | the group cuts out whole when the next group pops (0-2 empty frames between), or holds up to 36 frames past its last word into a pause, then cuts out |
| Leave: the first line first (R6 only) | 1 | none | ref 1's "we just" -> "just": the lead-in line cuts out, the landing word stays until the next group |
| Leave: the soft out (a sentence end before a pause >= 0.4 s) | 3 | ease-in | opacity only |
| **A world word** (R7) | with its object | the object's | on the world layer, moving with the camera at its object's depth (parallax); enters with its object, leaves with the camera |

**Never:** a slide, roll, rise through a mask, bounce, wobble, rotate-in, typewriter, blur-in over 3 frames, a clip
window or wipe mask, animated letter-spacing or jiggling baselines (F8), anything that moves while it is being read.

## e. The recipes

Common to all: the hand and the brush of §b, the type frame and seats of §c, the motion of §d, the checks of §f.
Each example uses video 4's real words and times; a frame number is t x 60.

### R1 · The everyday caption (the default for most of the film)
- **For:** every group that is not a hook, a number, a landing word, a lettered phrase or the payoff (~70 % of the film).
- **Spec:** the hand, 116 px, weight 300 (night) / 400 (light), +0.02 em, warm white #FFF0DE (or umber #2B1B0A), the
  halo. One line if <= 760 px (830 max), else two baselines (395 / 515), the second stepped 80-140 px right of the
  first (a gentle stagger, never centred stacks), broken by Netflix's rules (never an article from its noun, nor a verb
  from its pronoun) into a bottom-heavy pair. Group centre on a seat (L/C/R), walking per §c.
- **Sync:** pops whole 2 frames before its first word; cuts out when the next group pops. 2-4 words, >= 0.8 s, <= 20 cps;
  a phrase shorter than 0.8 s joins the next as a build.
- **Video 4:** S2 (4.28-8.76, WIDE -> MEDIUM push onto the giant computer, landing on "giant" 5.68): "AI actually runs"
  (one line, 803 px, seat L) 4.233-5.283 s (frames 254-317) · **"on giant / computers,"** (two baselines: "on giant"
  407 px from x 300, "computers," 541 px from x 400; seat C) 5.283-6.467 s (frames 317-388) · "in buildings / called"
  (911 px on one line, so two; seat R) 6.467-7.517 s · "data centers." (one line, seat C) 7.517-8.717 s.
- **Checks:** <= 2 baselines; each line <= 830 px; centre moves <= 220 px; 0.25-scale glance; >= 4.5:1; >= 0.8 s.

### R2 · The hook at frame 0
- **For:** the first 3 s: frame 0 shows the first spoken words; the words are a step bigger, to stop a thumb.
- **Spec:** the hand at **136 px** (cap 83), +0.02 em, warm white, the halo; two baselines (395 / 525), the second
  stepped right; the first two groups only, then R3 for the number.
- **Sync:** line 1 is on screen at frame 0 (never an empty frame, never a title); line 2 builds on its word; group 2
  pops whole; the hook's number lands per R3.
- **Video 4:** S1 (0.00-4.28, WIDE, locked: the home view paints itself, the pipe first): **"Did you know"** (778 px,
  from x 120) at frame 0 · **"Helsinki"** (450 px, line 2 from x 400) pops at 0.600 s (frame 36) · group 2 "wants AI /
  to heat" (511 / 420 px, seat R) 1.067-2.300 s (frames 64-138) · then R3.
- **Checks:** frame 0 shows "Did you know" (in the voice's order); the payoff ("heat seventy thousand homes") is in
  words by 2.34 s; nothing paints over the words while the scene paints itself on (the band paints first, quietly).

### R3 · The big number
- **For:** a number the story turns on (the hook's claim, a comparison's punch); 1-2 per film.
- **Spec:** the brush (Nanum Brush Script 400), **260 px**, +0.02 em, accent amber #FFB868 (burnt #8E3A12 on light
  skies), the halo; figures on their own row at baseline 500, centred near seat C; the unit word in the hand (Gaegu 300,
  116 px, +0.02 em, warm white) on the row below (baseline 600), its right edge stepped to x ~900. Numerals, not words
  ("70,000", "40": 6 characters instead of 16). The swell on landing (5 + 9 frames).
- **Sync:** the figures pop (and swell) 2 frames before the number's first word; the unit word builds on its word.
- **Video 4 (two):** S1, from "seventy" (2.34) to the end of "homes?" (3.92), as the windows light one by one, so the
  amber figures land with the warm windows: **"70,000"** (593 px) pops at 2.300 s (frame 138), **"homes?"** at 3.383 s
  (frame 203), both until 4.233 s. And S4, "40" with "kettles," at 15.017 s (frame 901), the 40 drawn kettles popping
  on at the computer's foot on the same word (S4 keeps no "≈ 40" tag in the picture, so the caption's 40 is the only
  one: never twice).
- **Checks:** the figures read at 0.25 scale in < 0.5 s; >= 3:1 (the brush) and >= 4.5:1 (the hand); the figures never
  collide with the far city (ink <= 610).

### R4 · The landing word (the brush)
- **For:** the film's 3-5 key words, the ones the voice stresses (the take writes them in capitals: "FORTY", "WANTS")
  and the core line's key word; at most one per sentence.
- **Spec:** a three-row lockup in the band, like hand lettering: row 1, the lead-in words in the hand (Gaegu 300 / 400,
  116 px, +0.02 em, warm white or umber, baseline 365, from x ~130); row 2, **the word in the brush (Nanum Brush Script
  400), 200 px, +0.02 em, in the accent**, baseline 495, stepped right (from x ~260); row 3, the words after it in the
  hand, baseline 598, right-aligned near x 920; the halo on all. Inside y 294-610. The swell (5 + 9 frames) or, if
  approved, the brush write-on (12 frames) on the word.
- **Sync:** row 1 pops on its first word; the landing word on its own word; row 3 on its first word; all leave together
  when the next group pops. The lockup is one group (<= 5 words).
- **Video 4:** S7 (23.46-25.54, the turn: WIDE, the dive lands on "WANTS" and holds while the pen draws the plan's pipe
  out toward the computer): **"But Helsinki"** pops at 23.417 s (frame 1405) · **"WANTS"** at 24.000 s (frame 1440) ·
  **"that heat."** at 24.583 s (frame 1475) · all until 25.500 s (frame 1530).
- **Checks:** one landing word on screen; it reads first at a squint; rows never touch (>= 20 px between a row's lowest
  ink and the next row's highest); the brush >= 3:1.

### R5 · The stressed word (the tint)
- **For:** the everyday stress: a word the voice leans on that is not a landing word; at most one per group, not in
  every group (about one group in three).
- **Spec:** R1, with that one word in the accent colour (amber / burnt), same face, weight and size; no animation.
- **Sync:** a build, so the tinted word arrives on its own word.
- **Video 4:** S3 (8.76-10.96, CLOSE: snow melts on the computer's top, then steam pours off on "hot"): "Those
  computers" (824 px, one line, seat C) pops at 8.717 s (frame 523); line 2 builds "get" 9.367 (frame 562), "really"
  9.700 (frame 582), **"hot."** in amber at 10.167 s (frame 610), as the steam pours off; all until 10.917 s. (The same
  moment as R4's example, set with the tint instead of the brush, is still 7.)
- **Checks:** one tinted word per group; never a tinted word and a landing word in the same group.

### R6 · The phrase lettered into the open space (ref 1's manner)
- **For:** a slow, warm or funny beat with few words: the joke, a breath, a line meant to be felt. Once or twice per
  film.
- **Spec:** the hand (Gaegu 300 / 400), bigger: **150 px**, +0.02 em, warm white or umber, the halo; row 1 the
  lead-in, row 2 lower right with its last word **1.3x bigger (190 px)**, the ref's "our / day"; set in the open space
  above the subject's top, inside the band (baselines 400 / 570). Pops by phrase (1 frame); the last word may land alone;
  the first line may leave first.
- **Video 4:** S5 (17.76-19.26, CLOSE: the computer's top in all that steam; a mug pops onto it on "tea"): **"That's a
  lot"** (757 px, from x 110) pops at 17.717 s (frame 1063) · **"of"** at 18.417 (frame 1105) · **"tea."** (190 px,
  322 px wide, ending near x 890) at 18.583 s (frame 1115), landing with the mug · until 19.217 s (the start of S6's move).
- **Checks:** <= 5 words; row 2's big word never wider than row 1; the phrase stays clear of the mug and its steam curl.

### R7 · The word placed in the world
- **For:** a word that belongs to a thing in the picture (a year on a tag, a name on a sign): it lives on the thing and
  moves with it. At most one per film (the visual script's "one word in the picture").
- **Spec:** the brush (Nanum Brush Script 400), 140-200 px, tracking 0, figures >= 120 px tall, in the object's ink
  (umber #2B1B0A on cream paper), straight-on and level on its object (`LAYOUT.md`: words in the world), no halo (the
  paper is its ground); on the world layer with the camera's parallax, entering with its object; the captions keep their
  screen seats above it and never say the same words.
- **Video 4:** S8 (25.54-28.34, MEDIUM: the plan, walls only marked out; the slow push lands on "plan" 26.18): on "next"
  (27.40, frame 1644) a paper tag swings on, pinned to the plan's front wall on the subject axis below the computer's
  middle: **"2027"**, until S9's push takes it out of the frame's bottom (by "would", 29.02). The caption above says
  **"starting / next year."** (R1, seat C, 27.033-28.300 s): the paper says the year, the voice says "next year".
- **Checks:** the tag's words read at 0.25 scale; nothing passes in front of the tag while it is the beat; it never
  enters the band; the caption and the tag never repeat a word.

### R8 · Through the big move (the scale shot)
- **For:** the one big camera move: the world moves, the words hold still.
- **Spec:** R1 (Gaegu 300, 116 px, +0.02 em, warm white, the halo) at seat C only, one or two lines; 1-frame pops; no
  seat changes and no landing word until the move lands; a single word may stand alone in the big sky.
- **Video 4:** S6 (19.26-23.46, CLOSE -> EXTREME WIDE, the crane out to the Earth's curve, the mug's spot held as the
  pivot): **"Normally,"** pops at 19.217 s (frame 1153), "data centers" builds on line 2 at 19.900 (frame 1194; the
  group is 1.12 s, so "Normally," never stands alone under 0.8 s) · "just use / big fans" 20.333-21.583 · "to blow
  that / heat outside." 21.583-23.417, all at seat C while the plumes rise below the band.
- **Checks:** zero seat changes during the move; nothing in the band but the words (plumes thin out below it).

### R9 · The payoff line
- **For:** the film's last sentence, the core line in the voice; it lands, then the loop.
- **Spec:** two lockups: first, R4's three rows (the hand 116 px, the brush 200 px in the accent with the swell, +0.02
  em, the halo) with the core line's key word in the brush; then the last group in the hand (Gaegu 300, **136 px**: the
  hook's size, so the film's bookends match), two baselines at seat C, holding 36 frames past the last word, then
  cutting out in 1 frame before the loop's un-draw reaches the band.
- **Video 4:** S12 (38.48-42.24, WIDE POV: the home view again, your gloved hand and phone at the bottom right; on
  "could" the computer's lights blink back and a pulse of warm water runs home): **"So your chatbot"** pops at 38.433 s
  (frame 2306) · **"could soon"** at 39.367 (frame 2362) · **"heat"** in the brush, amber, at 39.933 s (frame 2396), as
  the pulse runs under the street · then **"an apartment / in Helsinki."** (136 px) at 40.217 s (frame 2413), held to
  41.92 s (frame 2515).
- **Checks:** the words stay clear of the phone (bottom right) and the run; "heat" is the only accent on screen.

### R10 · The cover title
- **For:** the cover (and the grid): the core line as a title, never over the film's captions.
- **Spec:** a frame of the film's own scene without captions; the core line in the hand (weight 400 on light skies, 300
  on dark; 112-128 px), its key word in the brush (240-280 px, the accent); 3-4 rows, ragged and stepped, on the sky's
  flat field, inside the 4:5 crop (y 285-1635) and the 3:4 crop (y 240-1680), x 96-944; read at 360 px wide (the grid
  tile); Pip hidden as in the film; no box, no source line.
- **Video 4:** "Your chatbot / could **heat** / an apartment / in Helsinki." over the home view's night sky, "heat" in
  amber (the core line: `docs/v4/THROUGHLINE.md`).
- **Checks:** reads at 360 px wide in one glance; inside both crops; the same words as the core line, nothing added.

## f. The checks (every still and every cut, before the owner sees it)
1. **Phone glance:** every word read at 0.25 scale (270 x 480) in one glance; the render's `_phone.jpg` at 100 %.
2. **The type frame:** all ink in y 290-1250, x 96-944 (x 96-860 below y 840); ads x 120-888, y 288-1248, x <= 780
   below y 840 (`render.mjs --ui --zones`).
3. **Contrast:** running words >= 4.5:1 against the pixels within 20 px of the glyphs (the house's 7:1 where the sky
   allows); landing words and numbers >= 3:1; no box, no outline (`capcheck`).
4. **How many:** a group 2-4 words; <= 5 in a landing-word lockup; <= 7 words on screen at once; <= 2 baselines (3 in a
   lockup); one landing word and one tinted word at most on screen.
5. **How long:** a group >= 0.8 s (48 frames); <= 20 characters per second; a built word on screen >= 0.35 s before
   its group leaves. Video 4 after merging its short phrases into builds ("Those computers" + "get really hot.", "The
   city has a plan" + "to use it,", "Then pipes" + "under the streets") runs 6.6-20.0 cps, except S10's "would take / the
   heat" (21.6) and "out of its / computers" (21.5): the voice's fastest stretch, flagged and kept (F4: viewers cope
   with ~20 cps); never three over-20 groups in a row.
6. **Never clipped:** every letter whole in every frame (the brush write-on alone excepted, if approved); no mask, clip
   window, slide or roll.
7. **Frame 0 and the order:** frame 0 shows the first spoken words; every word in the voice's order; never a title over
   the captions; the payoff in words by ~2 s.
8. **AI, not Al:** the capital I has bars; a new face is tested on "AI", "Il", "1l" before use.
9. **Never twice, never covered:** no word twice on screen; nothing passes in front of words while they are the beat;
   no paper edge beside them; weather in the band at half density, flakes <= 6 px.

## g. What changes in our docs if the owner picks this (the exact edits; NOT applied now)
- **`LAYOUT.md` §1, the "caption block (the ink)" row:** replace "Patrick Hand 98 px, baselines 387 / 510 (one line
  448), centred on x 520 (left of centre: clear of the rail), <= 850 px wide, <= 2 lines of ~20 characters; highlight
  boxes reach y 299" with "the words (`TYPE_GUIDE.md`): the hand (Gaegu 300 / 400) 116 px, baselines 395 / 515 (one
  line 455), group centre on a seat x 440 / 520 / 600, a line <= 830 px, <= 2 baselines; a landing-word lockup at 365 /
  495 / 598 (the brush, Nanum Brush Script 200 px); a number at 500 (260 px) over its unit at 600; no boxes; ink
  inside y 290-610 in the band". Add a row **"type frame | y 290-1250; x 96-944 above y 840, x 96-860 below; ads x
  120-888, y 288-1248, x <= 780 below y 840"**. In the row's rules, "ink >= 7:1 on its field" becomes ">= 4.5:1 for
  running words (7:1 where the sky allows), >= 3:1 for the brush". §5 (the cover): "the title in the caption type with
  the peach box on its key words" becomes "the core line in the hand with its key word in the brush, in the film's
  accent (R10), no box". §6 (checks): add `TYPE_GUIDE.md` §f. "The code must match": `theme.ts` `skyCaption` and
  `captionTones` (the hand, the seats, the tones, the accent), `font.ts` (`captionFontStack` -> Gaegu, plus the brush),
  `scripts/capcheck.py` (4.5:1 / 3:1).
- **`DIRECTION.md` rule 10:** replace "Captions pop in place, burned in, never a roll-in that clips letters; the caption
  band is one calm flat field (no lines, detail or shadow edge across it); ink on light, white on dark." with "The
  words on screen follow `TYPE_GUIDE.md`: one hand for every spoken word, one brush for the few landing words, numbers
  and titles; set in the open space by the subject, on one steady anchor per shot; popping in place or built word by
  word on the voice, never clipped; dark ink on light skies, warm white on dusk and night, the film's one warm accent
  for the stressed word. The caption band is one calm flat field (no lines, detail or shadow edge across it)." and add
  `TYPE_GUIDE.md` to its "->" list.
- **`OWNER_PLAYBOOK.md`, Visual style, "The words on screen are DESIGNED":** replace "the owner picks from still
  examples before a film uses one; until a pick, the current caption rules (`docs/look/LAYOUT.md`) stay the default"
  with "picked (<date>): the guide's system (the hand + the brush) and its recipes R1-R10 (the owner's picks:
  <list>); positions in `LAYOUT.md`", and add the owner's verdict quote. If the cover pick changes, the cover's "title
  in the caption type" lines in `LAYOUT.md` §5 and `docs/POSTING_KIT.md` follow. The "Captions are burned in and pop in
  place" bullet stays as it is (it holds for every recipe).
- **This guide:** drop "DRAFT", keep only the picked recipes, and mark the others "not picked (<date>)".

## h. THE STILL LIST (for job 2)
All 1080 x 1920 with `scripts/type/render.mjs` (`--phone --ui`), backgrounds `{{BG_NIGHT}}` (video 4's key) and
`{{BG_DUSK}}` (the light sky, for dark ink). The backgrounds are wides, so every still stands in for its shot's
placement; never invent a new picture beyond what a note asks. Sizes, seats and times are §b-§e's.

1. **BEFORE (our captions now).** S7 at 24.10 s: "But Helsinki / WANTS that heat." · Patrick Hand 98 px, umber
   #2B1B0A, two centred lines on x 520 at baselines 387 / 510, the peach box #F6B892 behind "WANTS" (square, 0.19 em
   padding, the word ink on peach) · `{{BG_DUSK}}` · Look at: how heavy and boxed it is, and the fixed band.
2. **AFTER, the same moment: R4 the landing word.** "But Helsinki" (hand 400, 116 px, umber, baseline 365, from x
   130) / **"WANTS"** (brush 200 px, burnt #8E3A12, baseline 495, from x 260) / "that heat." (hand, baseline 598,
   right-aligned near x 920) · `{{BG_DUSK}}` · Look at: one painted word carrying the turn; compare with still 1.
3. **THE HAND, three ways.** S2 at 4.50 s: "AI actually runs" in three bands of one still (each a 1080 x 600 crop of the
   band region, labelled small at the bottom-left), at one x-height (~45 px): Gaegu 300 116 px · Mali 300 90 px · Zen
   Kurenaido 400 106 px; warm white with the halo · `{{BG_NIGHT}}` · Look at: which hand feels like ours, and "AI"
   reading as "Al" in Zen Kurenaido.
4. **R1 the everyday caption.** S2 at 6.00 s: "on giant / computers," (two baselines 395 / 515, line 1 from x 300,
   line 2 from x 400, seat C), Gaegu 300 116 px, #FFF0DE, halo · `{{BG_NIGHT}}` · Look at: light and airy, yet read at a
   glance on the phone preview; the default look of most of the film.
5. **R2 the hook.** S1 at 0.70 s: "Did you know" (line 1, from x 120, baseline 395) / "Helsinki" (line 2, from x
   400, baseline 525), Gaegu 300 136 px, #FFF0DE (frame 0 shows line 1 alone in the same place) · `{{BG_NIGHT}}` · Look
   at: big enough to stop a thumb, still calm.
6. **R3 the big number.** S1 at 3.60 s: **"70,000"** (brush 260 px, amber #FFB868, baseline 500, centred near x 470)
   over "homes?" (hand 116 px, baseline 600, right edge x ~900) · `{{BG_NIGHT}}` (its amber windows echo the figures)
   · Look at: the number reads first and feels part of the lit city.
7. **R5 the tint, the same moment as still 2.** S7 at 24.70 s: the same three rows and positions as still 2, but
   "WANTS" in the hand (400, 116 px) tinted burnt #8E3A12 instead of the brush · `{{BG_DUSK}}` · Look at: stills 2 and
   7 side by side: the brush landing word or the quiet tint?
8. **R6 the lettered phrase.** S5 at 18.70 s: "That's a lot" (hand 300, 150 px, baseline 400, from x 110) / "of"
   (150 px) + **"tea."** (hand 190 px), row 2 baseline 570, ending near x 890 · `{{BG_NIGHT}}` · Look at: ref 1's
   manner, words lettered into the open sky, the big last word.
9. **R7 the word in the world.** S8 at 27.70 s: a small cream paper tag (~280 x 170 px, a slight swing angle of 3-4°,
   a pin, a soft contact shadow) on the lit building's facade near the doorway's top, on it **"2027"** in the brush
   (umber, figures ~120 px tall); above in the band the caption "starting / next year." (R1, seat C) · `{{BG_NIGHT}}` ·
   Look at: the year belongs to the place; the caption and the tag share the frame without repeating each other.
10. **R9 the payoff.** S12 at 40.00 s: "So your chatbot" (hand 116, baseline 365, from x 130) / "could soon" (baseline
    495) / **"heat"** (brush 200 px, amber, baseline 598, right-aligned near x 900) · `{{BG_NIGHT}}` · Look at: the
    core line landing on its one warm word.
11. **R10 the cover.** The cover: "Your chatbot / could **heat** / an apartment / in Helsinki." (hand 300, 120 px;
    "heat" brush 260 px amber; ragged, stepped, left edge x ~110) on `{{BG_NIGHT}}` shifted down ~180 px (the sky
    extended at the top in its own colour, so the open sky reaches y ~780, standing in for a cover frame composed with
    more sky); no captions · also judge it at 360 px wide · Look at: one series look on the grid; read at tile size.
12. **R10 in the posters' caps (the comparison).** The same cover in Jost 300 ALL CAPS, +12 % tracking, warm white
    #FFF0DE, centred rows sized to fit x 96-944 ("YOUR CHATBOT / COULD HEAT / AN APARTMENT / IN HELSINKI."),
    "HEAT" in amber · the same shifted `{{BG_NIGHT}}` · Look at: stills 11 and 12: the painted hand or the posters'
    geometric caps.
13. **Three groups in a row (the seats walking).** S2, 4.50 / 6.00 / 7.00 / 8.00 s as four 540 x 960 frames in a 2 x 2
    grid on one still: "AI actually runs" (seat L) · "on giant / computers," (seat C) · "in buildings / called" (seat
    R) · "data centers." (seat C), R1 throughout · `{{BG_NIGHT}}` · Look at: alive but steady: the words move less than
    220 px, so the eye never hunts.

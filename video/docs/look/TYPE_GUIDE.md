# TYPE GUIDE: the words on screen (fonts, placement, motion, recipes) · PICKED 2026-10-30

**Status: PICKED (2026-10-30).** The owner handed the pick over: "Okay you pick your best option for maximum engagement and pleasantry and user attention retention". Picked on those three, from the stills (`docs/look/type/stills/`): **the hand Gaegu** for every spoken word (Mali stays the fallback); **the stress both ways**: the big lit word (R4) for the film's 3-5 landing words and the numbers, the same-size Bold lift (R5) for everyday stress; **the warm halo** behind the stressed word on light skies (dusk option C; night B, honey with the golden glow; the number B); **words that follow the open space** by the subject on one steady anchor per shot (§c); **the cover in the hand** with one lit word (R10; the posters' caps stay a comparison); **the size steps as they are** (§b: 116 px is the largest that keeps 2-4 words on a line). Retired by the owner's note ("shouldn't look like a blood message on the wall"): the brush, the burnt red, the write-on. Positions live in `LAYOUT.md` §1 (applied, §g); the motion (the builds, the bloom) is judged moving in the film's G4 look clip before G5. The research behind every number: `docs/look/type/RESEARCH.md` (findings F1-F15, with sources); the pleasantness pass: `docs/look/type/PLEASANT.md` (P1-P8, the options). The owner's playbook rules win over this guide: the words are DESIGNED, and PLEASANT to look at, soft, warm and calm, never menacing. Px at 1080 x 1920, y down, 60 fps; times are video 4's take (`public/v4/voice_words.json`, 42.24 s,
177.7 words/min); a "pop" happens 2 frames before its word's start (text a hair ahead of the sound reads as in sync).

## a. Principles (what makes our words premium, dynamic and engaging; the owner's rules never change)
1. Every spoken word, in the voice's order, few at once and big: groups of 2-4 words; frame 0 shows the first spoken words, never a title; the payoff in words by ~2 s. (owner; F3)
2. One look, one brand: ONE HAND for every word on screen: its light weights for the running words, its Bold, bigger and LIT, for the few stressed words, numbers and titles (the brush retired, 2026-10-30); recipes vary, the system never does. (owner; F1, F9; P2, P8)
3. Set into the picture: words sit in the open sky or wall by the beat's subject, on one steady anchor per shot, moving at most 220 px between groups. (F5, F6)
4. Light and airy, never boxed: thin strokes, open spacing, a soft halo in the sky's own tone; deep plum ink on light skies, warm white on dusk and night; the stressed word is LIT by the film's warm light (honey on night skies, a gentle warm halo on light ones), never dark red or brown. (F10, F11; P3, P4, P7)
5. Calm motion that never clips: pop in place, or build word by word on the voice; a stressed word pops whole and its light blooms; cut out whole. (owner; F7, F15)
6. Read at a glance on a phone: every word at 0.25 scale, >= 4.5:1, >= 0.8 s a group, <= 20 characters a second, "AI" never "Al". (owner; F4)
7. Never the template, never menacing: no outlines, boxes, heavy or all-caps words (a stressed word stays lowercase, as spoken), rainbow keywords, emoji, bounce, slides or typewriters; no rough, scratchy, dripping or tapering letters, no red or brown words; every word calm and friendly at a glance. (owner, 2026-10-30; F2; P1, P5, P6)
8. Never twice, never covered: no words twice on screen at once; nothing passes in front of words while they are the beat; no paper edge beside them. (owner)

## b. The type system (ONE family, three roles; OFL, from `scripts/type/.fonts/`; the brush retired 2026-10-30, PLEASANT.md)

| role | face (CSS family) | weight | size (font-size) | measured at that size | tracking | lines |
|---|---|---|---|---|---|---|
| **The hand:** every running word | **Gaegu** | 300 on dusk and night skies; 400 on light skies (dark ink reads thinner) | **116 px** everyday; **136 px** for the hook's first two groups and the payoff's last group | 116 px: cap 71, x-height ~45, stroke ~6 px (8 % of its S; Patrick Hand 98 px: cap 65, stroke 9 px) | +0.02 em | baselines 120 px apart (1.03 em); a line <= 830 px (prefer <= 760, ~13 characters); <= 2 baselines (3 in a landing-word lockup) |
| **The lit hand:** the landing word | **Gaegu**, lowercase | **700** | **160 px** on light skies, **156 px** on night (1.35-1.4x the hand) | x-height ~55, stroke ~14 px with round ends, an even width (CV 0.07; the retired brush's 0.26); "wants" 365 px wide (ink) | +0.02 em | its own row, stepped right of the line before; lit (below) |
| **The lit hand:** big numbers | Gaegu | 700 | **250 px** | figures ~130 px tall (0.52 em); "70,000" 668 px with the comma tucked in ("70", the comma 0.02 em after, "000" 0.05 em after: the hand's own comma sits loose) | -0.02 em | its own row; the unit word under it in the hand |
| **The lit hand, quiet:** the everyday stress (R5) | Gaegu | 700 | the running size (116 px) | | +0.02 em | in its line; lit |
| **The hand:** a world word (on a thing) | Gaegu | 700 | fitted to its object: the figures' ink = the object's width - 44 px | "2027" at 122 px: 236 px wide, figures ~72 px tall on a ~280 x 170 tag | 0 | on the object, in the object's ink (plum on cream paper), no glow |
| **The title:** the cover's core line | the hand + the lit key word | 300 on dark (400 on light) + 700 | hand 112-128 px; the key word ~200 px (1.6-1.8x) | | +0.02 em | 3-4 rows, ragged, stepped |
| **The title:** a series title (later) | the lit hand over the hand (ref 2's lockup, in our one family) | 700 / 300 | 2.5-3x the hand | | +0.02 / +0.04 em | left-aligned lockup |

**Colours per tone** (contrast measured on `scripts/type/bg/`, band y 290-600; F11):

| sky | running words (the hand) | the lit hand: stressed word, landing word, numbers | halo (contrast without a box) |
|---|---|---|---|
| dusk and night (dark: video 4's whole film) | warm white **#FFF0DE** (7.9:1 on the night band) | the windows' **honey light #FFD58C** (L* 87, C* 42, hue 82°; 6.4:1 on the night band) with the **golden glow**: rgb(255,184,92) at 42 %, blur 0.34 em around the letters (dilated 0.04 em), over the dark halo at 30 % | running words: `text-shadow: 0 0 0.22em` the sky darkened (#141A3A) at 40 % + `0 0 0.06em` at 25 %; no offset, never a hard edge |
| day and light dusk (light) | deep plum ink **#3A2B48** (L* 20, C* 21, hue 311°, the dusk sky's own hue; 8.1:1 on the dusk band) | the same plum (no colour: a light colour cannot carry a word on a light sky, honey there is 1.2:1, and every dark warm is a brown or a red) with the **gentle warm halo**: rgb(255,214,160) at 95 %, blur 0.34 em | only if the field varies: the sky lightened (#FFFFFF) at 30 %, blur 0.22 em |
| a sky that crosses from light to dark within a film | flips ink on a join (a shot change), never inside a group | | |

**The accent is light, not paint:** the film's one warm story light (video 4: the heat, the lit windows' honey,
measured on the night frame at #F7C16F, hue 78°), used only for the stressed word, the landing words and the numbers;
never a second accent, never on a whole line. **Never in words:** dark red, burnt orange, rust, brown or any colour that
reads as blood (the retired burnt #8E3A12 sat at L* 36, C* 52, hue 50°, beside rust and dried blood); a rough, scratchy,
dripping or tapering face; capitals for stress (the take's "WANTS" is a direction to the voice; the picture says "wants").

**Why, against what we had:** Patrick Hand is heavy (stroke 12.8 % of the cap against ref 1's 6.9 %), comic, and its
capital I is a bare stroke ("AI" reads "Al"); the peach box is a highlighter, not paint. Gaegu Light is the nearest free
match to ref 1's felt-tip hand (7.4 %), an upright print with a barred I, and its Bold is the same round hand, so the
stress needs no second family. Nanum Brush Script (the nearest to ref 2) was the landing word's face until the owner's
note: in burnt red capitals on a light sky it read as "a blood message on the wall" (its tapering, dripping tails and
nicked edges; `PLEASANT.md` §1), and the gentler second faces tried instead (Caveat, a smooth script; Fraunces italic, a
soft serif) each read as a second speaker (`PLEASANT.md` §3). The posters' Futura-like caps (Jost) stay on posters: geometric and cool against the organic,
painted look, slow as running words, and lost on a 360-px grid tile (RESEARCH "The fonts"). Fallback hand if the owner
finds Gaegu too young: Mali 300 / 400, same sizes minus 16 % (Mali runs larger).

## c. The placement system

**The type frame (every word's ink stays inside):** y 290-1250; x 96-944 above y 840, x 96-860 below it (the organic
right rail is x > 950 at y 900-1500). A cut made for ads: x 120-888, y 288-1248, and left of x 780 below y 840 (F13;
`LAYOUT.md` §1). Platform UI: top y < 180, bottom y > 1520; nothing key there.

**The anchor and the seats:** the home anchor is the band (y 290-600: the one calm flat field, `LAYOUT.md`): baselines
**395 / 515** (one line 455), group centre on one of three seats, **L x 440 · C x 520 · R x 600**. A landing-word
lockup uses three rows at baselines **362 / 482 / 578** (the middle one the lit hand). A big number sits at baseline 482,
its unit word at 578. All ink in the band stays at y <= 585: the subject's top (a roof) starts at ~590-600, and a row
at 598 sat on the roof in the stills.

**Where words sit, by shot type:**
- **WIDE and the home view (S1, S7, S12):** the open sky above the subject, in the band. The far city starts just
  under it, so ink stays at y <= 585.
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
| **Emphasis: the bloom** (the lit hand: R3, R4, R5, R9) | 8 | ease-out cubic, `cubic-bezier(0.22, 1, 0.36, 1)` | the stressed word pops WHOLE in place (2 frames before its word) and its light comes on: the glow / halo 0 -> full while it settles 0.96 -> 1.00 (origin: its baseline centre; no overshoot; its neighbours never move): a warm light coming on, never paint going on |
| ~~Emphasis: the brush write-on~~ | | | retired with the brush (2026-10-30, `PLEASANT.md` §4): part-letters behind a dragged dry edge read as a word being daubed on, and a reveal that cuts letters is ruled out |
| **Leave** | 1 | none | the group cuts out whole when the next group pops (0-2 empty frames between), or holds up to 36 frames past its last word into a pause, then cuts out |
| Leave: the first line first (R6 only) | 1 | none | ref 1's "we just" -> "just": the lead-in line cuts out, the landing word stays until the next group |
| Leave: the soft out (a sentence end before a pause >= 0.4 s) | 3 | ease-in | opacity only |
| **A world word** (R7) | with its object | the object's | on the world layer, moving with the camera at its object's depth (parallax); enters with its object, leaves with the camera |

**Never:** a slide, roll, rise through a mask, bounce, wobble, rotate-in, typewriter, a write-on, blur-in over 3 frames,
a clip window or wipe mask, animated letter-spacing or jiggling baselines (F8), anything that moves while it is being read.

## e. The recipes

Common to all: the hand and the lit hand of §b, the type frame and seats of §c, the motion of §d, the checks of §f.
Each example uses video 4's real words and times; a frame number is t x 60.

### R1 · The everyday caption (the default for most of the film)
- **For:** every group that is not a hook, a number, a landing word, a lettered phrase or the payoff (~70 % of the film).
- **Spec:** the hand, 116 px, weight 300 (night) / 400 (light), +0.02 em, warm white #FFF0DE (or deep plum #3A2B48), the
  halo. One line if <= 760 px (830 max), else two baselines (395 / 515), the second stepped 80-140 px right of the
  first (a gentle stagger, never centred stacks), broken by Netflix's rules (never an article from its noun, nor a verb
  from its pronoun) into a bottom-heavy pair. Group centre on a seat (L/C/R), walking per §c.
- **Sync:** pops whole 2 frames before its first word; cuts out when the next group pops. 2-4 words, >= 0.8 s, <= 20 cps;
  a phrase shorter than 0.8 s joins the next as a build.
- **Video 4:** S2 (4.28-8.76, WIDE -> MEDIUM push onto the giant computer, landing on "giant" 5.68): "AI actually runs"
  (one line, 789 px, seat C: the only seat it fits inside x 96-944) 4.233-5.283 s (frames 254-317) · **"on giant /
  computers,"** (two baselines, seat L: "on giant" 396 px from x 131, "computers," 518 px from x 231) 5.283-6.467 s
  (frames 317-388) · "in buildings / called" (893 px on one line, so two; seat R) 6.467-7.517 s · "data centers." (one
  line, seat C) 7.517-8.717 s.
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
- **Spec:** the lit hand: Gaegu 700, **250 px** (figures ~130 px tall), -0.02 em, in the honey light #FFD58C with the
  golden glow (on light skies: plum with the warm halo); the comma tucked in ("70", the comma 0.02 em after, "000" 0.05 em
  after); figures on their own row at baseline 482, centred near x 466; the unit word in the hand (Gaegu 300, 116 px,
  +0.02 em, warm white) on the row below (baseline 578), its right edge stepped to x ~930. Numerals, not words
  ("70,000", "40": 6 characters instead of 16). The bloom on landing (8 frames).
- **Sync:** the figures pop whole (and bloom) 2 frames before the number's first word; the unit word builds on its word.
- **Video 4 (two):** S1, from "seventy" (2.34) to the end of "homes?" (3.92), as the windows light one by one, so the
  honey figures light up with the warm windows: **"70,000"** (668 px) pops at 2.300 s (frame 138), **"homes?"** at 3.383 s
  (frame 203), both until 4.233 s. And S4, "40" with "kettles," at 15.017 s (frame 901), the 40 drawn kettles popping
  on at the computer's foot on the same word (S4 keeps no "≈ 40" tag in the picture, so the caption's 40 is the only
  one: never twice).
- **Checks:** the figures read at 0.25 scale in < 0.5 s, as ONE number (the comma tucked); >= 4.5:1 (measured 6.2:1);
  the figures never collide with the far city (ink <= 585).

### R4 · The landing word (the lit hand)
- **For:** the film's 3-5 key words, the ones the voice stresses (the take writes them in capitals: "FORTY", "WANTS";
  the picture sets them in lowercase, as spoken) and the core line's key word; at most one per sentence.
- **Spec:** a three-row lockup in the band, like hand lettering: row 1, the lead-in words in the hand (Gaegu 300 / 400,
  116 px, +0.02 em, warm white or plum, baseline 362, from x ~130); row 2, **the word in the lit hand: Gaegu 700, 160 px
  (156 on night), lowercase, +0.02 em; on light skies in the plum ink with the gentle warm halo, on night skies in the
  honey light with the golden glow**, baseline 482, stepped right (from x ~236); row 3, the words after it in the hand,
  baseline 578, right-aligned near x 920; the halo on the running rows (on light skies only where the field varies).
  Inside y 292-585 (rows >= 23 px apart). The bloom (8 frames) on the word.
- **Sync:** row 1 pops on its first word; the landing word on its own word; row 3 on its first word; all leave together
  when the next group pops. The lockup is one group (<= 5 words).
- **Video 4:** S7 (23.46-25.54, the turn: WIDE, the dive lands on "WANTS" and holds while the pen draws the plan's pipe
  out toward the computer): **"But Helsinki"** pops at 23.417 s (frame 1405) · **"wants"** at 23.967 s (frame 1438, 2
  frames before its word) · **"that heat."** at 24.583 s (frame 1475) · all until 25.500 s (frame 1530).
- **Checks:** one landing word on screen; it reads first at a squint; calm and friendly at a glance (never capitals, never
  red or brown); rows never touch (>= 20 px between a row's lowest ink and the next row's highest); >= 4.5:1 (measured
  8.0:1 plum on dusk, 6.0:1 honey on night).

### R5 · The stressed word (the quiet lift; was the tint)
- **For:** the everyday stress: a word the voice leans on that is not a landing word; at most one per group, not in
  every group (about one group in three).
- **Spec:** R1, with that one word in the lit hand at the running size: Gaegu 700, 116 px, honey with the golden glow
  (night) or plum with the gentle warm halo (light); the bloom (8 frames).
- **Sync:** a build, so the lifted word arrives on its own word.
- **Video 4:** S3 (8.76-10.96, CLOSE: snow melts on the computer's top, then steam pours off on "hot"): "Those
  computers" (824 px, one line, seat C) pops at 8.717 s (frame 523); line 2 builds "get" 9.367 (frame 562), "really"
  9.700 (frame 582), **"hot."** lifted (Bold, honey, the glow) at 10.167 s (frame 610), as the steam pours off; all until
  10.917 s. (The same moment as R4's example, set with the quiet lift instead of the bigger word, is still 7.)
- **Checks:** one lifted word per group; never a lifted word and a landing word in the same group.

### R6 · The phrase lettered into the open space (ref 1's manner)
- **For:** a slow, warm or funny beat with few words: the joke, a breath, a line meant to be felt. Once or twice per
  film.
- **Spec:** the hand (Gaegu 300 / 400), bigger: **150 px**, +0.02 em, warm white or plum, the halo; row 1 the
  lead-in, row 2 lower right with its last word **1.3x bigger (190 px)**, the ref's "our / day", a 0.48 em space before it (the
  crossbars of "f" and "t" reach toward each other); set in the open space
  above the subject's top, inside the band (baselines 400 / 570). Pops by phrase (1 frame); the last word may land alone;
  the first line may leave first.
- **Video 4:** S5 (17.76-19.26, CLOSE: the computer's top in all that steam; a mug pops onto it on "tea"): **"That's a
  lot"** (757 px, from x 110) pops at 17.717 s (frame 1063) · **"of"** at 18.417 (frame 1105) · **"tea."** (190 px,
  322 px wide, ending near x 890) at 18.583 s (frame 1115), landing with the mug · until 19.217 s (the start of S6's move).
- **Checks:** <= 5 words; row 2's big word never wider than row 1; the phrase stays clear of the mug and its steam curl.

### R7 · The word placed in the world
- **For:** a word that belongs to a thing in the picture (a year on a tag, a name on a sign): it lives on the thing and
  moves with it. At most one per film (the visual script's "one word in the picture").
- **Spec:** the hand's Bold (Gaegu 700), fitted to its object (the figures' ink = the object's width - 44 px; at 122 px
  "2027" is 236 px wide, figures ~72 px tall, on a ~280 x 170 tag, and reads at phone size), tracking 0, in the object's
  ink (deep plum #3A2B48 on cream paper), straight-on and level on its object (`LAYOUT.md`: words in the world), no halo (the
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
- **Spec:** two lockups: first, two rows (the hand 116 px; the core line's key word in the lit hand, Gaegu 700 156 px,
  honey with the golden glow and the bloom, +0.02 em, LAST on row 2 after a 40 px space), baselines 390 / 545, row 1
  from x ~110, row 2 from x ~120 (three rows put the key word on the roofline in the stills); then the last group in the hand (Gaegu 300,
  **136 px**: the hook's size, so the film's bookends match), two baselines at seat C, holding 36 frames past the last word, then
  cutting out in 1 frame before the loop's un-draw reaches the band.
- **Video 4:** S12 (38.48-42.24, WIDE POV: the home view again, your gloved hand and phone at the bottom right; on
  "could" the computer's lights blink back and a pulse of warm water runs home): **"So your chatbot"** pops at 38.433 s
  (frame 2306) · **"could soon"** at 39.367 (frame 2362) · **"heat"** in the lit hand, honey, at 39.900 s (frame 2394,
  2 frames before its word), blooming as the pulse runs under the street · then **"an apartment / in Helsinki."** (136 px) at 40.217 s (frame 2413), held to
  41.92 s (frame 2515).
- **Checks:** the words stay clear of the phone (bottom right) and the run; "heat" is the only accent on screen.

### R10 · The cover title
- **For:** the cover (and the grid): the core line as a title, never over the film's captions.
- **Spec:** a frame of the film's own scene without captions; the core line in the hand (weight 400 on light skies, 300
  on dark; 112-128 px), its key word in the lit hand (Gaegu 700, ~200 px, lowercase, honey with the golden glow on dark
  skies, plum with the warm halo on light ones); 3-4 rows, ragged and stepped, on the sky's
  flat field, inside the 4:5 crop (y 285-1635) and the 3:4 crop (y 240-1680), x 96-944; read at 360 px wide (the grid
  tile); Pip hidden as in the film; no box, no source line. The still: the hand 112 px, the lit word 200 px, baselines
  365 / 530 / 628 / 737, rows from x 110 / 180 / 130 / 290 (ink y 300-743, inside the open sky).
- **Video 4:** "Your chatbot / could **heat** / an apartment / in Helsinki." over the home view's night sky, "heat" in
  the honey light (the core line: `docs/v4/THROUGHLINE.md`).
- **Checks:** reads at 360 px wide in one glance; inside both crops; the same words as the core line, nothing added.

## f. The checks (every still and every cut, before the owner sees it)
1. **Phone glance:** every word read at 0.25 scale (270 x 480) in one glance; the render's `_phone.jpg` at 100 %.
2. **The type frame:** all ink in y 290-1250, x 96-944 (x 96-860 below y 840); ads x 120-888, y 288-1248, x <= 780
   below y 840 (`render.mjs --ui --zones`).
3. **Contrast:** every word >= 4.5:1 against the pixels within 20 px of the glyphs (the house's 7:1 where the sky
   allows; the lit hand measures 6.0-8.0:1); no box, no outline (`capcheck`).
4. **How many:** a group 2-4 words; <= 5 in a landing-word lockup; <= 7 words on screen at once; <= 2 baselines (3 in a
   lockup); one lit word (landing or lifted) at most on screen.
5. **How long:** a group >= 0.8 s (48 frames); <= 20 characters per second; a built word on screen >= 0.35 s before
   its group leaves. Video 4 after merging its short phrases into builds ("Those computers" + "get really hot.", "The
   city has a plan" + "to use it,", "Then pipes" + "under the streets") runs 6.6-20.0 cps, except S10's "would take / the
   heat" (21.6) and "out of its / computers" (21.5): the voice's fastest stretch, flagged and kept (F4: viewers cope
   with ~20 cps); never three over-20 groups in a row.
6. **Never clipped:** every letter whole in every frame; no mask, clip window, write-on, slide or roll.
7. **Frame 0 and the order:** frame 0 shows the first spoken words; every word in the voice's order; never a title over
   the captions; the payoff in words by ~2 s.
8. **AI, not Al:** the capital I has bars; a new face is tested on "AI", "Il", "1l" before use.
9. **Never twice, never covered:** no word twice on screen; nothing passes in front of words while they are the beat;
   no paper edge beside them; weather in the band at half density, flakes <= 6 px.
10. **Pleasant (the owner, 2026-10-30):** every word calm and friendly at a glance, as a regular viewer would see it: no
   red, burnt, rust or brown words; no rough, scratchy, dripping or tapering letters; no capitals for stress; the stress
   by size, weight and warm light only (`PLEASANT.md`).

## g. What changed in our docs with the pick (applied 2026-10-30)
- **`LAYOUT.md` §1, the "caption block (the ink)" row:** replace "Patrick Hand 98 px, baselines 387 / 510 (one line
  448), centred on x 520 (left of centre: clear of the rail), <= 850 px wide, <= 2 lines of ~20 characters; highlight
  boxes reach y 299" with "the words (`TYPE_GUIDE.md`): the hand (Gaegu 300 / 400) 116 px, baselines 395 / 515 (one
  line 455), group centre on a seat x 440 / 520 / 600, a line <= 830 px, <= 2 baselines; a landing-word lockup at 362 /
  482 / 578 (the lit hand, Gaegu 700 160 px, lowercase, lit); a number at 482 (the lit hand 250 px) over its unit at
  578; no boxes; ink inside y 290-585 in the band". Add a row **"type frame | y 290-1250; x 96-944 above y 840, x 96-860
  below; ads x 120-888, y 288-1248, x <= 780 below y 840"**. In the row's rules, "ink >= 7:1 on its field" becomes
  ">= 4.5:1 for every word (7:1 where the sky allows)"; "ink on light" becomes "deep plum #3A2B48 on light". §5 (the
  cover): "the title in the caption type with the peach box on its key words" becomes "the core line in the hand with
  its key word in the lit hand (R10), no box". §6 (checks): add `TYPE_GUIDE.md` §f. "The code must match": `theme.ts`
  `skyCaption` and `captionTones` (the hand, the seats, the tones: plum on light, warm white on dark; the lit hand:
  honey #FFD58C + the golden glow, the warm halo on light; the bloom), `font.ts` (`captionFontStack` -> Gaegu 300 /
  400 / 700), `scripts/capcheck.py` (4.5:1 for every word).
- **`DIRECTION.md` rule 10:** replace "Captions pop in place, burned in, never a roll-in that clips letters; the caption
  band is one calm flat field (no lines, detail or shadow edge across it); ink on light, white on dark." with "The
  words on screen follow `TYPE_GUIDE.md`: one hand for every word, its Bold, bigger and lit, for the few stressed
  words, numbers and titles; pleasant to look at (soft, warm, calm: never red or brown, never rough or dripping, never
  capitals for stress); set in the open space by the subject, on one steady anchor per shot; popping in place or built
  word by word on the voice, never clipped; deep plum ink on light skies, warm white on dusk and night, the stressed
  word lit by the film's warm light. The caption band is one calm flat field (no lines, detail or shadow edge across
  it)." and add `TYPE_GUIDE.md` to its "->" list.
- **`OWNER_PLAYBOOK.md`, Visual style, "The words on screen are DESIGNED":** replace "the owner picks from still
  examples before a film uses one; until a pick, the current caption rules (`docs/look/LAYOUT.md`) stay the default"
  with "picked (<date>): the guide's system (the hand + the lit hand) and its recipes R1-R10 (the owner's picks:
  <list>); positions in `LAYOUT.md`", and add the owner's verdict quote. If the cover pick changes, the cover's "title
  in the caption type" lines in `LAYOUT.md` §5 and `docs/POSTING_KIT.md` follow. The "Captions are burned in and pop in
  place" bullet stays as it is (it holds for every recipe).
- **This guide:** "DRAFT" dropped (2026-10-30); every recipe R1-R10 picked (R4 and R5 both: the big lit word for the
  landing words and numbers, the same-size lift for everyday stress); not picked: Mali (the fallback hand), the posters'
  caps (a comparison), the painted wash, the script and the serif italic (PLEASANT.md options); retired: the brush, the
  burnt red, the write-on.

## h. THE STILL LIST (for job 2)
All 1080 x 1920 with `scripts/type/render.mjs` (`--phone --ui`), backgrounds `{{BG_NIGHT}}` (video 4's key) and
`{{BG_DUSK}}` (the light sky, for dark ink). The backgrounds are wides, so every still stands in for its shot's
placement; never invent a new picture beyond what a note asks. Sizes, seats and times are §b-§e's. Rendered: the pages
`scripts/type/stills/NN_*.html` (`bash scripts/type/stills/render_all.sh`), the results in `docs/look/type/stills/`
(`STILLS.md`, `contact_sheet.jpg`).

1. **BEFORE (our captions now).** S7 at 24.10 s: "But Helsinki / WANTS that heat." · Patrick Hand 98 px, umber
   #2B1B0A, two centred lines on x 520 at baselines 387 / 510, the peach box #F6B892 behind "WANTS" (square, 0.19 em
   padding, the word ink on peach) · `{{BG_DUSK}}` · Look at: how heavy and boxed it is, and the fixed band.
2. **AFTER, the same moment: R4 the landing word (the lit hand).** S7 at 24.70 s (all three rows on): "But Helsinki"
   (hand 400, 116 px, plum, baseline 362, from x 130) / **"wants"** (Gaegu 700 160 px, plum, the warm halo, baseline
   482, from x 236) / "that heat." (hand, baseline 578, right-aligned near x 920) · `{{BG_DUSK}}` · Look at: one bigger,
   warmer word carrying the turn, still calm; compare with still 1.
3. **THE HAND, three ways.** S2 at 4.50 s: "AI actually runs" in three bands of one still (each a 1080 x 600 crop of the
   band region, labelled small at the bottom-left), at one x-height (~45 px): Gaegu 300 116 px · Mali 300 90 px · Zen
   Kurenaido 400 106 px; warm white with the halo · `{{BG_NIGHT}}` · Look at: which hand feels like ours, and "AI"
   reading as "Al" in Zen Kurenaido.
4. **R1 the everyday caption.** S2 at 6.00 s: "on giant / computers," (two baselines 395 / 515, line 1 from x 131,
   line 2 from x 231, seat L), Gaegu 300 116 px, #FFF0DE, halo · `{{BG_NIGHT}}` · Look at: light and airy, yet read at a
   glance on the phone preview; the default look of most of the film.
5. **R2 the hook.** S1 at 0.70 s: "Did you know" (line 1, from x 120, baseline 395) / "Helsinki" (line 2, from x
   400, baseline 525), Gaegu 300 136 px, #FFF0DE (frame 0 shows line 1 alone in the same place) · `{{BG_NIGHT}}` · Look
   at: big enough to stop a thumb, still calm.
6. **R3 the big number.** S1 at 3.60 s: **"70,000"** (the lit hand 250 px, honey with the golden glow, the comma tucked,
   baseline 482, centred near x 466) over "homes?" (hand 116 px, baseline 578, right edge x ~930) · `{{BG_NIGHT}}` (its
   lit windows echo the figures) · Look at: the number reads first and glows like the lit city.
7. **R5 the quiet lift, the same moment as still 2.** S7 at 24.70 s: the same three rows as still 2, but "wants" at
   the running size (Gaegu 700, 116 px, plum, the warm halo) · `{{BG_DUSK}}` · Look at: stills 2 and 7 side by side:
   the bigger lit word or the quiet one?
8. **R6 the lettered phrase.** S5 at 18.70 s: "That's a lot" (hand 300, 150 px, baseline 400, from x 110) / "of"
   (150 px) + **"tea."** (hand 190 px), row 2 baseline 570, ending near x 890 · `{{BG_NIGHT}}` · Look at: ref 1's
   manner, words lettered into the open sky, the big last word.
9. **R7 the word in the world.** S8 at 27.70 s: a small cream paper tag (~280 x 170 px, a slight swing angle of 3-4°,
   a pin, a soft contact shadow) on the lit building's facade near the doorway's top, on it **"2027"** in the hand's
   Bold (plum, 122 px: figures ~72 px tall, fitted to the tag); above in the band the caption "starting / next year." (R1, seat C) · `{{BG_NIGHT}}` ·
   Look at: the year belongs to the place; the caption and the tag share the frame without repeating each other.
10. **R9 the payoff.** S12 at 40.00 s: "So your chatbot" (hand 116, baseline 390, from x 110) / "could soon" + **"heat"**
    (row 2, baseline 545, from x 120; "heat" the lit hand 156 px, honey, the golden glow, 40 px after "soon", 6 of its 8 bloom frames in) · `{{BG_NIGHT}}` ·
    Look at: the core line landing on its one warm word.
11. **R10 the cover.** The cover: "Your chatbot / could **heat** / an apartment / in Helsinki." (hand 300, 112 px;
    "heat" the lit hand 200 px, honey; ragged, stepped, left edge x ~110, baselines 365 / 530 / 628 / 737) on `{{BG_NIGHT}}` shifted down ~180 px (the sky
    extended at the top in its own colour, so the open sky reaches y ~780, standing in for a cover frame composed with
    more sky); no captions · also judge it at 360 px wide · Look at: one series look on the grid; read at tile size.
12. **R10 in the posters' caps (the comparison).** The same cover in Jost 300 96 px ALL CAPS, +12 % tracking, warm white
    #FFF0DE, centred rows (baselines 375 / 500 / 625 / 750) inside x 96-944 ("YOUR CHATBOT / COULD HEAT / AN APARTMENT / IN HELSINKI."),
    "HEAT" in honey with the golden glow (made gentle) · the same shifted `{{BG_NIGHT}}` · Look at: stills 11 and 12:
    the hand or the posters' thin geometric caps.
13. **Three groups in a row (the seats walking).** S2, 4.50 / 6.00 / 7.00 / 8.00 s as four 540 x 960 frames in a 2 x 2
    grid on one still: "AI actually runs" (seat C: at 789 px it fits no other) · "on giant / computers," (seat L) ·
    "in buildings / called" (seat R) · "data centers." (seat C), R1 throughout · `{{BG_NIGHT}}` · Look at: alive but
    steady: the words move less than 220 px, so the eye never hunts.
14. **R4's entrance: the bloom, mid-way (was the brush write-on, retired 2026-10-30).** S7 at 24.00 s: "But Helsinki"
    (row 1, as still 2) and **"wants"** popped whole at 23.967 s, 2 of its 8 bloom frames in (halo 58 %, scale 0.983);
    "that heat." not yet on · `{{BG_DUSK}}` · Look at: the word arrives whole, as a warm light coming on.
15. **The stress options, dusk (the pleasantness pass).** S7 at 24.70 s, seven options as band crops at 0.8 scale,
    labelled: A the hand Bold in umber · B in plum · C B + the warm halo (recommended) · D a pale honey painted wash · E
    Caveat · F Fraunces italic · G capitals · `{{BG_DUSK}}` · Look at: calm and friendly, and does the word stand out?
16. **The stress options, night.** S12 at 40.00 s, seven options: A warm white Bold · B honey + the golden glow
    (recommended) · C honey, no glow · D a lamplight wash · E Caveat · F Fraunces italic · G capitals · `{{BG_NIGHT}}`.
17. **The number options.** S1 at 3.60 s, four options: A the hand Bold, warm white · B honey + the golden glow
    (recommended) · C Caveat · D Fraunces italic · `{{BG_NIGHT}}`.

## i. Changes from the stills (2026-10-30, job 2: looked at on the phone preview and under the UI)
- **The brush's comma** (the orchestrator, after the run): Nanum Brush Script's comma is wide with a long tail, so
  "70,000" read "70 , 000" at a glance; R3 sets a number's comma in the brush at ~0.63 of the figures' size, tucked
  8-14 px from the figures on each side (still 06).
- **The band's floor:** ink stays at y <= 585, not 610: the third rows at 598-600 (R3, R4, R9) sat on the roofline
  (~590-600) at phone size. R4's lockup moved to baselines 362 / 484 / 578 and its brush to 184 px (1.6x the hand;
  three rows with a 200-px brush need ~330 px, the band has ~295); R3's figures to 480, its unit word to 578.
- **The brush's real size:** its figures are 0.45 em, so 260 px gave 118-px figures (not ~165) and the number did not
  read first: R3 is now 300 px (figures ~136 px), centred near x 440 with the unit word's edge at x ~930, so the
  brush comma's long tail stays clear of "homes?". A world word is 140-160 px (LAYOUT's "one number 120-160 px" is a
  font size): "2027" at 148 px (figures ~66 px) fits the ~280 x 170 tag and reads at phone size.
- **R9 is two rows** (390 / 545, "heat" last on row 2): with three rows the brush word sat on the roof, and lifting it
  ran its tall "h" into "soon".
- **Seats:** "AI actually runs" (789 px) fits only seat C inside x 96-944 (at seat L its ink began at x 46), so the walk
  is C, L, R, C and R1's example ("on giant / computers,") sits on seat L, from x 131 / 231; the old "from x 300 / 400"
  centred the group at x ~610, not seat C.
- **R6:** a 0.48 em space before "tea." (at 0.3 em, "of" and "tea." ran together on the phone).
- **R10:** the cover stack shrank a step (the hand 112 px, the brush 250 px; the caps 96 px) so all four rows sit in the
  open sky above the roofs (y ~780 on the shifted frame).
- **Still 14 added:** the brush write-on mid-stroke, so open question 3 is judged on a picture.
- **The owner, 2026-10-30: "The text should be pleasant to look at like it shouldn't look like a blood message on the
  wall / Reevaluate"** (on still 02: "WANTS" in Nanum Brush Script, burnt #8E3A12, all capitals, on the light dusk sky):
  the brush in burnt red retired; THE LIT HAND replaced it: every stressed word, landing word and number is the hand's
  own Bold (Gaegu 700), 1.35-1.4x (the number ~2.15x), lowercase, lit: in the windows' honey light #FFD58C with a soft
  golden glow on night skies, in the running ink with a gentle peach-gold halo on light skies; the running ink on light
  skies became a deep plum #3A2B48 (the dusk sky's own hue); the write-on gave way to the bloom (pops whole, the light
  comes on in 8 frames); R5's tint became the quiet lift; the "2027" tag is in the hand. The diagnosis, research (P1-P8),
  options (stills 15-17) and the measurements: `docs/look/type/PLEASANT.md`; the stills that used the brush or the burnt
  colour re-rendered (02, 06, 07, 09, 10, 11, 14; 12's accent made gentle).

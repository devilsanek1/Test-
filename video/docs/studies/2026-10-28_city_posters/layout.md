# Layout: one consolidated guide (Part A: what we already decided)

*City-poster study, 2026-10-28. The owner (answer 6): "layout is a big aspect. I think we've discussed a bunch of it
already, perhaps we can consolidate the previous discussions and reconcile it with your findings here". Part A (this
file): every layout and composition rule and owner note we already have, de-duplicated, each number with its source,
and every place the docs disagree (§6). Part B (§8) reconciles it with the posters: the synthesis fills it. A study,
not a rule change: until the owner approves a `docs/look/LAYOUT.md` (§7), DIRECTION and the playbook stand.*

Px at 1080 x 1920, y down, screen space. Diagram: `img/layout_zones.jpg` (drawn from one table of numbers by
`video/scripts/look/posters/layout.py`; `--measure` re-runs the two numbers measured here). Sources, from `video/docs/`:
DIR `look/DIRECTION.md` · CR `look/CRAFT.md` · CS `look/COZY_AND_SCALE.md` · CG `look/CINEMATIC_GUIDE.md` · SB
`look/STORYBOARD_STYLE.md` · LD `look/LIFE_AND_DENSITY.md` · G5 `G5_BLOCKING.md` · PB `OWNER_PLAYBOOK.md` · VT
`look/research/vertical.md` · v2S `v2/STYLE.md` · v2T `v2/THROUGHLINE.md` · PK `v2/POSTING_KIT.md` · v3CP
`v3/camera_plan_g3.md` · ENG `ENGINE.md` (v1-era: API and measurements, never style) · code `src/lib/theme.ts`
(`safe`, `skyCaption`, `world`), `lib/sky.tsx`, `lib/particles.tsx`, `scripts/capcheck.py`, `scripts/qa/framecheck.py`.
The owner's newest rule, Pip hidden on purpose (commit 1b6a24e, 22:21 UTC), is applied throughout.

## 1. The frame (9:16 zones)
The owner on the frame: "One thing I don't like is this white part at the top of the reel. Looks like it was screen
recorded from some other video?" (v1, 2026-10-25); "check out the text capture. Is it intentional effect?" (v1,
2026-10-25; PB reads it as the clipped caption roll); "why is it blue sky and then suddenly abruptly orange, weird"
(v2 G4, 2026-10-27).

| zone | numbers | what goes there | sources |
|---|---|---|---|
| canvas | 1080 x 1920, 60 fps; world = canvas at camera rest; author 140 px past every edge (pushes zoom out up to ~12 %); a float keeps >= 40 px overscan; a rise-over draws its layers ~500 px taller | | theme.ts `world`; ENG §2; CS 3b.5; CG S1 |
| platform UI (organic) | top y < 180; bottom y > 1520; right rail x > 950 at y 900-1500 | masses and dressing may run under it; key reads never | G5 §2 ("the one definition"); theme.ts `safe`; framecheck; DIR 10; LD §8; SB §3; CS §5 |
| ad overlay (a boosted post) | top 240-288; bottom 35 % (y > ~1250); rail x > 780 from y 840; sides 48-192 | the stricter stage below | VT §2 (ad templates, REPORTED); G5 §2; CS §5 (§6 rows 3-4) |
| top gutter | y 0-290 | framing only: a top-edge object (lamp, branches, beam; a whole lid from a high angle), wires (only here and below y 600), the jagged skyline and its sky, the hero cloud (v2 S1 y 120-280); a credit tab y ~185-288 (v2); never a paper edge | CS §2, 3b.2-3b.3; VT §1; v2S §5; G5 §5; PB |
| caption band | y 290-600, full width | ONE calm flat field: the one sky outdoors, or a flat light facade or wall (L* >= 70) where there is no sky; no lines, detail, roof tops, heads, props or shadow edge; weather at half density (flakes <= 6 px); tops of towers, discs and clouds at y >= 600 unless declared (v2: S1's planting to 575, sun tops >= 575) | DIR 6, 10; G5 §2; SB §3; LD §8; CS 3b.2, §5; CG rule 2; v2S §7; `particles.tsx` (§6 rows 1-2) |
| caption block | y 317-556, x 95-945; Patrick Hand 98 px, baselines 387 / 510 (one line 448), centred on x 520 (left of centre: clears the rail), <= 850 px, <= 2 lines of ~20 characters; highlight boxes reach y 299 | pops in place, screen space, never on a camera layer, a change at least every 1.5 s; ink >= 7:1 on L* >= 70, the sky flat to dL* <= 1.5 here; capcheck FAILs > 5 % of the near background under 3:1 | theme.ts `skyCaption`; CS intro, §5; CG notation; CR §g; `sky.tsx`; v2S §7; G5 §5; PALETTE; capcheck (§6 row 1) |
| read zone ("the stage") | y 600-1250, x 120-880 | every key read: the subject and its action, a label, a number, a contact point; a cozy shot's one opening | SB §3; VT §0-2 (the union of the ad templates); CS §2, §5; v2S §7 (§6 row 3) |
| subject axis and box | x 380-700; the subject 270-460 px wide (35-60 % of the 760 px stage; a standing figure 300-650 px tall), 80 px clear round it; <= 2 points of interest in a scale shot, inside x 380-700 | the beat's subject (tier A); a scale panel inverts it (>= 60 % of the frame or cut by both sides) | SB §3 and board lint; CS §5; VT §0 |
| key action (organic) | x 120-950, y 600-1480 | the loosest box for a key read | G5 §2 (the code differs: §6 row 3) |
| side margins | nothing key within 120 px of a side edge; the gutters beside the block (x < 95, x > 945) may hold detail and may rise | | CS §2, §5; SB §3 |
| bottom third | y 1250-1920 | masses: the foreground cut by the bottom edge, the dark anchor, a big near "you" that reads by mass; quiet only when it is the frame's one quiet field | v2S §1, §7 (`BOTTOM_THIRD`); VT §1; CS 3b.2; LD §0 (§6 row 14) |
| the one quiet field | one band touching the top or bottom edge (sky, water, a floor), 15-35 % (a bounded floor up to 50-60 %), patterned; at most one of the thirds (y 0-640 / 640-1280 / 1280-1920) | elsewhere no hole over ~200 px and no flat region over 20 %; drawn detail in most 240 px bands | LD §0, §2, §8; CS 3b.1, 3b.3 |
| labels and marks | world labels at y 600-1480, never in the band; draft label bottom-left y > 1850 (drafts only); G3 notes strip y 1680-1920 (board only) | | ENG §6; G5 §2; SB §3 (§6 row 12) |
| paper edge (opt-in) | sides from y >= 640 and the bottom, inset 12-40 px, 'paint-subtle' at most | never at the top or beside the band | PB; CS 3b.7; v2S §3; EDGES (§6 row 17) |
| sky and horizon | the sky is ONE gentle gradient from the frame top to the horizon; default horizon y 768 (0.40 H, reference 2's median); by shot type: §2 | **measured here:** the flat field behind the captions ends at y ~580-750 in v1 and v2 (medians 684 and 621): v2's sky y 0-600 is "the caption field and the only void" (v2S §6); v3's interior shots keep a flat wall to y ~1000-1380 (t 1-13 s) | DIR 6; CR §g; theme.ts `world`; `layout.py --measure` |
| Pip | hidden in a spot of the world, ~40-90 px, <= 1 % of the frame | never in the band, the rail (v2: x > 780 below y 840) or over the subject; a hop keeps its arc at y >= 600 | DIR 2; LD §5; v2S §4 (§6 row 13) |
| the "you" | one drawing or POV; head 90-140 px, cut by the bottom edge, head top y ~1380-1560; POV: hands cut by the bottom | in the foreground only it (or Pip); never strangers' backs | LD §4; CR §a.3; CS §2 (§6 row 10) |
| the cover | the grid's 4:5 crop y 285-1635 (1080 x 1350), the 3:4 crop y 240-1680 (1080 x 1440) | the title and the subject inside the 4:5 crop (§5) | PK; v3 POSTING |

## 2. Shot grammar
The owner: "there are videos that make it feel big and some that make it feel small ... arcane cinematic shots always
made me feel scale" (2026-10-24); "I do like the bigger scale scenes occasionally ... Another visual twists I think we
should rely on is a feeling of coziness via 1. Enclosure view" (2026-10-25); of the S5 pull-back: "It has pretty much
everything: suspense, sense of scale, fantastic environment and composition" (v3, 2026-10-26).

| shot | frame (numbers) | dose and use | sources |
|---|---|---|---|
| home place, cozy (NOOK, LANE, BALCONY, RIVERSIDE) | masses on 2-3 sides, 35-70 % of the frame, >= 40 % of the perimeter closed; ONE opening 15-30 % read in y 600-1250, >= 10 L* off its surround; refuge 35-55 % on >= 2 edges plus a top-edge object in y 0-290; asymmetric for the captions (one tall side cut by the top, flat across y 317-556; the other side tops out below y 600); the subject's head at 0.45-0.60 H, back to a wall, facing the opening. Bands: BALCONY lid 0-600, life 600-1250, floor 1250-1920; RIVERSIDE sky and skyline 0-290, flat far row 290-600, facades 600-1000, dark belt to 1115, lane to 1230, bank to 1420, water below | >= 50 % of the runtime outside full-frame charts; opens the film, returns on the quiet beat, hosts the callback; locked or the parallax float | DIR 7; CS §1-3b; SB §7 |
| street | horizon 0.50-0.60 H, VP at 0.60-0.70 W; H:W 1:1-1:1.5 cozy (1:2 baseline, >= 1:4 exposed); >= 75 % of each side continuous; one long sight line at most, ended by one object (a hidden VP is the coziest) | | CS §2, 3b.1 |
| close (an object) | drawn at its size, the biggest whole thing in frame (>= 60 % W) at the ladder's small end; reached by an A or C push of at most 2x per panel, or an F cut-in on the axis on a "But" turn; never a face, never a person as the subject | "close for the personal beat" | SB §7; CG "Not for us"; PB; v3CP S16 |
| chart, number | paper in the place the camera is already in (a printout, a phone, a board), straight-on and level; full-frame it is the subject, >= 60 % of the stage wide; axes an L, one line or 3-5 bars, <= 2 axis words at 56 px; one number 120-160 px on what it measures | entered by a push (A) or a card flip (E); counts neither cozy nor scale | CR §a.2; LD §7; SB §3, §7; CS §1.3 |
| scale: the ONE big move (S1 rise-over or S5 pull-back) | the world keeps going past every edge (near side masses x 0-30 % and 78-100 % W cut the far rows); 5-7 planes, each 2.2-3x smaller; one landmark huge yet far, 1.1-1.4 F over the horizon, top y >= 620, on a third (S5: (760, 760)); feet 2-3 F under the horizon; sky 30-40 % with a hero cloud >= 1 W behind the landmark. S1: starts at 0.37 H with the wall and the "you" filling the bottom 25 %, lands at 0.40 H (city in the lower 60 %). S5 end: 0.46 H, the figures at x 420-560, feet y 1490 | 1-2 scale moments per film, ~1.5-4 s each; never two scale wides in a row; a beat of agency within ~5 s | DIR 7; CG S1, S5, "Scale cues"; CS §1, §4-5; SB §7 |
| other scale frames | K1 close -> wide (a plain cut, F); K2 tilt-up (horizon 0.40 -> 0.70 H, the top lands at 0.08-0.15 H); K6 locked tiny-figure wide (the observer 0.04-0.08 H on the axis, a colossus cut by the frame, >= 10:1); K7 worm's-eye (0.58-0.64 H, the colossus >= 0.7 H cut by the top); K10 high angle (0.15-0.30 H, on a crowd, never one person, once) | the low angle goes on the quantity, never on the thing under critique | CS §4-5; SB §7 |
| breathers | S2 sun behind the roofline (a ~650 px disc at (580, 1060), roofline top y ~1500); S3 big sky, one landmark (horizon ~0.73 H, the landmark on the left third x ~220-420 up to y >= 600, sky ~70 %); S4 low horizon (0.82 H, a promenade band in the bottom 15-18 %) | S2, S4 once each at most; never back to back with S1 / S5 | CG S2-S4, rule 5 |
| the opening (frame 0) | ONE continuous shot, never still: the scene drawn on in the clean pen as a bold event (the subject's outline, pale C shapes, the colour flood); frame 0 shows the first spoken line as a normal caption (no title over it); the hook made physical, the expected thing then reality overtaking it at ~2 s through the real mechanism (v3: the cause outside the home window x 180-900, y 630-1060, the effect in the hand cut by the bottom); a visible story move (>= 3 % in <= 2 s) or a locked / floating hold | nothing scale before 3 s unless the move IS the claim; loops to frame 0's drawing state | DIR 9; CG "The opening"; PB Hook; G5 §5; CS §5; SB §7; v3CP O1 |
| angle | eye level by default, at or below the person's eye level; vary angle and size on purpose (close for the personal beat, wide for the system); never three wides in a row sharing a centred landmark on a ground line; a queue reads in depth from slightly above | | CS §5; SB §7; v2S §6 |

## 3. Composition rules
- **One subject at a time** (DIR 2; CR §b; the owner: "too many moving parts and I'm not sure what to keep my
  attention on", v3 G5b): tiers by story role; A (1-3 objects) owns the contrast, the hero colour, the only full outline
  and >= 60 % of the motion. It sits on the subject axis in the read zone (§1), with the brightest area (DIR 5) and the
  heaviest area at a squint (CR §f), a calm ring of one value 30-60 px round it (LD §2; the board: 80 px clear); any
  figure moving over 5 % of the frame is the subject (CR §b). On screen: before left, after right; more goes up or
  taller; time runs left to right (SB §3).
- **Enclosure: held, not shut** (CS §1-3b; DIR 7): doses by H:W (canyon >= 2:1 with sky <= 10 %; cozy 1:1-1:1.5 with
  an opening 15-30 %; baseline 1:2, sky ~30 %; exposed >= 1:4, sky >= 36 %); ONE opening the subject faces; a closed
  vista; the viewer as the refuge; life passing sideways in one band (nothing comes at the lens); the far side and the
  edges hold 3-6x the detail of the calm centre or floor; the value sandwich (the darkest mass right behind the light
  figures); the perimeter 5-8 L* darker through the masses, never a vignette.
- **Depth planes** (DIR 2; CR §f; the owner: "no distance effect nor perspective; similarly the bottom part ... little
  to no perspective or depth at all", v2 G4; "something WAY further out that gives me a sense of scale", the posters):
  plane 0 is the subject's, -1 and -2 nearer, +1 to +4 farther; 4-6 per shot, 5-7 on a vista (§6 row 5); one flat step
  per plane toward the air (k 0 / .12 / .22 / .40 / .65); the subject never shares a value with what is right behind
  it (counterchange; overlap, never a tangent); ONE camera for every ground, wall and figure (sizes fall with distance,
  never a nearer thing smaller per metre); the ground recedes (<= 65 % level lines, >= 20 % to the VP); >= 2 things
  cut by the frame edges in every shot; in a scale wide nothing ends inside the frame.
- **Leading lines** (CS §2, 3b.2; CR §f.4; CG "Scale cues" 8, S5): the ground's joints and kerbs run to the VP; one
  long sight line, ended by one object; BALCONY's C-curve enters just under the band (y 600-700), leaves at y
  860-1060 and dives under a mass through a mouth <= 8 % of that edge; in a scale wide lines lead UP to the landmark
  (a canyon VP over the figures' heads, a skyline stepping up, one diagonal at its base; the rail the one level line).
- **People** (DIR 3; PB; LD §4; the owner: "don't use big models of people; the people we showed in the first example
  video are the right direction", v2): small, from behind or rear 3/4, no faces; near heads <= ~140 px, mid walkers
  110-260 px tall, far 15-60 px fill only, window people 12-40 px; RIVERSIDE seated ~85 px, standing ~140 px; BALCONY
  70-190 px in the life band; v2: no figure over ~260 px, no tier-B figure over 3 % of the frame; about half at rest.
- **Words in the picture** (PB; SB §3; LD §7; the owner on v3: "Also this text is weird", of 11-13 px source lines):
  few and big, each read at phone size at a glance (every word checked at 0.25 scale) or not drawn; on a real object,
  straight-on and level; at most one label (56-72 px, within 40 px of its object, no box) and one number (120-160 px)
  per panel; no sources or fine print (they go in the post's text), never the same words twice on screen, nothing in
  front of words while they are the beat, nothing in the caption band; the core line as a title only on the cover.
- **Where the calm goes** (LD §0, §2; CS 3b.3; the owner: "way too empty", "less prescriptive on the amount of
  objects", v3 G5): calm only at a frame edge (the one quiet field), round the subject or behind the captions, never a
  slab mid-frame; in a scale wide the detail peaks just under the horizon (CG "Scale cues" 4).

## 4. Across shots
- **Joins and carriers** (DIR 1; CR §a; G5 §2; the owner: "no clean transitions, just a bunch of shots put together",
  v3 G5b): A push-through into a thing shown >= 0.5 s; B thread match, the thread in the same screen spot (±8 %) and
  size (±20 %); C one continuous camera; D an object leaving one edge and entering the next shot from the opposite edge
  at the same speed; E a card flip of the same paper; F a plain cut, at most 2, on a "But" turn, the thread on both
  sides, changing size or angle (a deliberate match keeps the exact frame: SB §7). The midpoint lands on the next
  sentence's first word; nothing enters, pops or turns in the 0.4 s around it (<= 4 movers); eye jump <= 0.10, colour
  shift <= 15, carry >= 0.25 (CR §a). The subject keeps its screen spot across a cut unless the cut is about movement
  (SB §3). Screen space is a fixed mat: captions, the paper edge and the UI never move with the picture (CS 3b.5); the
  parallax float is home by every join (DIR 8). A light never moves between cuts; v2's sun stayed at screen left on
  every north-facing shot and kept its spot through both sun push-throughs (DIR 5; v2T §5). Never two scale wides or
  breathers in a row (CS §1; CG rule 5).
- **The thread object's spot** (CR §a.1; G3_ANIMATIC: the board draws its path and home spot): on screen >= 80 % of the
  runtime, no gap over 3 s (the declared scale reveal and fairness stretch aside); when the shot is elsewhere it keeps
  a home spot (a corner, the window, the phone); it reacts at the end of every cause beat. v2: W (860, 700) 150 x 170
  and M (335, 785) 133 x 164, the same spot and size across its B matches (v2T §1, §3).
- **Pip's spot** (the owner, 2026-10-28: "keep it, but not as obvious ... hide it deliberately in the video"; DIR
  1-2, CR §a.3, §b, LD §5, PB): never a join's carrier and no longer on both sides of every join; it hides in a spot
  of the world (a window, a boat, a balcony, a crowd), off the subject's eye path, found on a second look; G3 plans the
  spots and W1 names them. v2's seats (y 1050-1410, x 360-700, within ~200 px across each join: v2T §1, §3) are
  history.
- **The "you"** (CR §a.3; LD §4): one drawing or POV for the whole film; the callback keeps the opening's exact end
  frame (SB §7; v3: S15 = O1's end frame).

## 5. The cover and the profile grid
- **Decided:** the core line as a title belongs on the cover, never over the film's captions (PB Hook; the owner: "Wait
  why do we have the text repeat itself?", v3); our covers read as one series on the grid ("the cover's layout" is part
  of the one look: PB); the cover is a frame of the film's own scene code without captions, draft label or paper edge
  (PK: v2 S1 frame 312; v3 POSTING: frame 192); the title in the caption type with the peach box on its key words,
  inside the 4:5 centre crop y 285-1635 (and the newer 3:4 crop y 240-1680), read at 360 px wide; no source line (PK).
- **Measured** (`layout.py --measure`): all three covers put the title on the band's flat field with the world below:
  v1 two lines y 311-538, x 85-925, sentence case, box y 420-531; v2 three lines y 312-559, x 124-953, ALL CAPS, box y
  477-576, in the sky above the roofline (first non-sky row y 590: PK); v3 two lines y 333-552, x 163-878, sentence
  case, box y 428-615, on the room's wall above the window. Each title starts 26-48 px inside the 4:5 crop's top. Pip
  is plain to see on all three (v1 bottom right, v2 on its post mid-frame, v3 at the window).
- **Open:** the case (v2's capitals vs v1's and v3's sentence case) and Pip on the cover (§6 rows 15-16).

## 6. Where the docs disagree or repeat each other
| # | topic | doc A says | doc B says | the owner's words | proposed resolution |
|---|---|---|---|---|---|
| 1 | the caption band's range | DIR 10, G5 §2, SB §3, LD §8, `particles.tsx`, v2's `--band`: y 290-600 | CS, CG, CR §g, `sky.tsx`, v2S §7: the block y 317-556; theme.ts, ENG, capcheck: a clip window y 280-570; framecheck: 280-600; CS K2: "flat across y 280-570" | "check out the text capture. Is it intentional effect?" (v1) | two names, one value each: the band (keep clear) y 290-600, the block (the ink) y 317-556; pop captions need no clip, so the tools and CS K2 use 290-600 |
| 2 | what fills the band | CG rule 2: "plain sky in every frame" | DIR 10, LD §8, CS 3b.2: one calm flat field (a facade at L* >= 70 where there is no sky) | "why is it blue sky and then suddenly abruptly orange, weird" (v2) | DIR's wording; outdoors it is the one sky (DIR 6); fix CG rule 2 |
| 3 | where key reads may go | G5 §2: x 120-950, y 600-1480 (organic UI) | VT, CS §5, v2S §7, v3CP: x 120-880, y 290-1250, minus x > 780 below y 840 (ad overlays); theme.ts `safe.action`: x 90-990, y 200-1480 | "Is boost worth it?" (2026-10-25; PB: boost the best performer once 3-5 posts exist) | design to the ad-safe stage by default (any post may be boosted); the organic box is the floor; align `safe.action` (tooling) |
| 4 | the right rail | G5 §2, theme.ts, framecheck: x > 950 at y 900-1500 | VT, CS §5, v2S §4, §7: x > 780 from y 840 | | as row 3; framecheck may also warn on the ad rail |
| 5 | planes per shot | CR §f.1: 4-6 (5-7 on a vista) | CG rule 4: 3-4 (5 in S1, 6 in S5); SB §3: at most 3 for staging | "some buildings are obviously closer to me, some further out and there is something WAY further out" | CR wins (the ladder): 4-6; the board stages near / mid / far and lists every plane (G3 `planes`); fix CG rule 4 |
| 6 | the tiny anchor's size | CS §5: 60-150 px (floor 40); SB §7: 0.04-0.08 H (>= ~80 px); VT: 0.03-0.08 H | CG S5, "Scale cues": F = 200 px (170-200); v3 S9: 180 px; v2 S5's end: a 62 px stranger | "how great the scale feels" (v3) | CG wins on its shot's numbers: S5's end keeps F 170-200 px; the K1 / K4 / K6 wides use 60-150 px; one table states both |
| 7 | a roof vista's horizon | CG S1: lands at 0.40 H; S5: 0.46 H | CS §5: "a city vista from a roof (S1/S5 landings) 0.43-0.46 H" | | CG wins (shot numbers); fix CS §5 to name the two apart |
| 8 | the worm's-eye horizon | CS K7: 0.58-0.64 H; VT: <= 0.64 H so the feet stay above y 1250 | SB §7: "horizon low (~0.78 H)"; v3 S9b: y 1500 | | 0.58-0.64 H: at 0.78 H the figure's feet fall under the bottom UI; fix SB §7 |
| 9 | S4's figure | CG S4: horizon 0.82 H (y ~1575), "the 'you' or the mascot small (~0.08 H) bottom-left" | G5 §2, CS §5: no figure or contact point under the bottom UI | | the strip may run under the UI as a mass; the figure stands on a wall top above y 1480, or nobody (S4 allows it); with Pip hidden, the "you" only |
| 10 | the "you" under the UI | LD §4: head top y ~1380-1560, cut by the bottom | CS §5: no "figures" under the UI; VT §1: big near figures may be (they read by mass), tiny far ones may not | | VT's distinction, with the head above the organic UI (head top <= ~1380) |
| 11 | frame 0's words | PB Hook, G5 §5, DIR 9: the first spoken line as a normal caption, no title over the captions | SB §3: "the frame-0 payoff line sits above them"; v2S §7: a frame-0 block (72 px, baselines 372 / 452, a 20 px source at 550); G5 §5's v2 `Frame0Text` note | "Wait why do we have the text repeat itself?"; "Why are we having this out of order weirdly?" (v3) | the owner's words: fix SB §3; mark v2S §7's block and G5 §5's note removed (v2 REVIEW_1 MUST 1 took it out of the film) |
| 12 | small words | PB: few and big, read at phone size, no sources or fine print; SB: labels 56-72 px, lint >= 48 px | v2S §7: body 30-34 px, credits 18-20, "sources as small print ON the object"; ENG §6: labels 34-40 px | "Also this text is weird" (v3) | the playbook: >= 56 px for any word a viewer must read (the board floor 48); v2S and ENG sizes are history |
| 13 | Pip's place | DIR 1-2, CR §a.3, §b, LD §5, PB (22:21): hidden, never a carrier, ~40-90 px | CG S1, S5, "Scale cues" 8: the mascot as one of the two tiny anchors (S4: "the 'you' or the mascot"); v2S §4, v2T §1: on both sides of every join, 86-120 px | "keep it, but not as obvious ... hide it deliberately in the video" | the newest words win: the scale anchor is the "you" (Pip may hide nearby, never as the anchor); fix CG S1, S4, S5 and cue 8; v2's seats are history |
| 14 | the bottom third | v2S §1, §7: y 1250-1920 "never quiet", things only | CS 3b.2: BALCONY's floor y 1250-1920 ">= 90 % one calm field"; RIVERSIDE's water y 1420+ | | one rule (LD §0): one quiet field per frame, at the top (the sky: then the bottom third holds things) or at the bottom (a bounded floor or water: then the top holds a lid or skyline) |
| 15 | the cover's case and place | v2's cover: ALL CAPS on the sky | v1's, v3's: sentence case; v3's on a wall | "a coherent style across all videos sharing one look, one brand" | one cover template (§5, §7); the owner picks the case; the place (the band's flat field) already agrees |
| 16 | Pip on the cover | v1-v3 covers: Pip plain to see | the hidden-Pip rule | "keep it, but not as obvious" | the owner's call: hidden on the cover too, or the cover as the one place it shows (the profile identity) |
| 17 | paper at the top | PB, DIR 10, CS 3b.7, v2S §3: never at the top or beside the band (sides from y 640) | EDGES' 'paint-subtle' preset: 14-25 px of paper at the top (v2S §3 flags it) | "this white part at the top of the reel" | the owner's rule; fix the preset before any film opts in (code) |
| 18 | v1-era layout | style_bible §1.2: captions at the bottom (baselines 1328 / 1424), safe x 90-930, y 160-1480; ENG §2b: near people "tower over the lower frame (0.30-0.45 H)" | today: captions in the sky band; near heads <= ~140 px | "don't use big models of people" (v2) | history (they carry the banner); LAYOUT.md never cites them for layout |
| 19 | repeats (no clash) | the band's numbers in 10 docs and 5 code files; the UI zones' numbers in 5 docs (G5 §2 calls itself "the one definition", yet LD §8, SB §3, CS §5 and ENG §2 restate them); the read zone in 5 | | | LAYOUT.md becomes the one definition, the docs point to it; the code reads one constant or a check compares them (tooling) |

## 7. A proposed `docs/look/LAYOUT.md`
**Rank and scope:** a look doc that wins on its own topic (DIR's tie-break: "each wins on its own topic"): every x and
y in the frame, the shot types' framing numbers and the cover. CG keeps its shot recipes (moves, light, scale cues),
CS its cozy and scale recipes, LD fullness, SB the board's drawing; each points to LAYOUT.md for a zone. DIR rule 10 and
G5 §2 keep one line and a link. It records the look as it stands, never a freeze (the owner: "our look is evolving - we
are finding out style i don't think we can overfixate on this"): each film may carry its next step.
1. **The frame:** the zone map (this study's image, redrawn from the doc's own table) and one table: canvas and bleed;
   the platform UI, organic and ad, with the decision to design to the ad stage (§6 row 3); the top gutter; the band
   and the block (one value each); the read zone, the subject axis and box; the side margins; the bottom third and
   the one quiet field; labels; paper edges; the code constants that must match (theme.ts `safe` and `skyCaption`,
   `sky.tsx`, `particles.tsx`, capcheck, framecheck).
2. **Shot grammar:** one row per shot type (the home place's doses, street, close, chart, the scale move and the K
   frames, the breathers, frame 0): horizon, the subject's spot, masses, sky share, and the doc holding the recipe.
3. **Composition:** one subject and where it sits; enclosure; planes and separation; leading lines; people's sizes;
   words in the picture; where the calm goes.
4. **Across shots:** the carriers' screen numbers; the thread's home spot; Pip's hiding spots; the "you"; screen space
   as a fixed mat; the light's side.
5. **The cover and the grid:** one cover template (the title on the band's field, the subject in the read zone, both
   inside the 4:5 crop; the case the owner picks).
6. **Checks, each number listed once:** framecheck (UI), capcheck (band), board_lint (subject box, band), check_depth
   (planes, ground), the 0.25-scale word check, the cover at 360 px.
7. **Reconciled with the city posters:** Part B's outcome, once the owner approves it.
**What moves out** (each keeps a one-line pointer): G5 §2 "Screen zones"; DIR 10's numbers; CS's intro numbers and §5
"Vertical short-form rules" (CS 3b.2's dose bands stay, quoting the band); CG's notation and rule 2; SB §3's zone
sentence; LD §8's first two bullets; v2S keeps its values. `research/vertical.md` stays as the evidence.
**Cost:** S for the doc (a move plus pointer edits; no number changes), M with the tooling (one constant the checks
read). **Risk:** low; the §6 resolutions change numbers and need the owner's yes where they touch the owner's words.

## 8. Part B: reconciled with the city posters
*Written by the synthesis (2026-10-29) from `composition.md` (CO), `perspective.md` (PE), `pro_1_depth.md` (P1),
`style.md` (ST), `details.md` (DE), `pro_2_hierarchy.md` (P2), `pro_4_colour.md` (P4); the whole study: `STUDY.md`.*
Each line carries its status: **[owner]** = already the owner's (the quote or rule named), **[open]** = the owner's
call, **[proposal]** = ours, to be seen in the next G4 look clip. Part A stands as written until the owner approves a
change; only [owner] lines may move into `docs/look/LAYOUT.md` (§7 item 7).

### 8.1 What stays: Part A holds against the posters
- **The zones (§1).** Extended into 9:16 (full width, the poster's top edge on the band's top, y 300) a poster's title
  lands inside our caption block (y 434-500) in 7 of 7, its tallest top at y 605-832, its hero's centre in the read
  zone in 6 of 7 and its darkest near frame under the bottom UI (CO §4): the posters fit our map; they ask for no new
  zone. **(a) answered:** the posters' title zone IS our caption block, on the film and on the cover. [owner: DIR 10]
- **The band stays one calm flat field.** The posters' skies change by dL* 0.4-3.1 across the block's rows (median
  1.4); 4 of 7 meet our <= 1.5 (CO §4). We take a poster-like sky flattened inside the band, its gradient above y 290
  and below y 600, and no texture in the band (rule 10; P4 §3.4). [owner: DIR 6, 10]
- **Cozy stays the home** (>= 50 % of the runtime). The poster frame's sky (36-53 % of a poster, 45-58 % once
  extended) is COZY_AND_SCALE's exposed dose: 1-3 frames a film (CO §5). [owner: DIR 7]
- **One subject at a time, owning the contrast.** The posters' hero is often quiet (the salience peak on it in 2 of 7;
  the near frame or a second icon holds it in 5: CO §2); in a 2-4 s shot that is the split focus the owner rejected
  ("too many moving parts", v3). We keep rule 2. [owner: DIR 2]
- **Words few and big, no title in the film's frame, the cover title in our caption type.** The posters' title caps
  (16-30 px at 1080) shrink to 5-10 px on a 360-px grid tile; ours are 17-20 px there (CO §6). [owner: playbook]
- **One camera for the near world; the ground recedes** (CR §f.4); the posters agree for everything near (PE §1.2).
  [owner: v2 G4, "no perspective"; the far stage below is the only proposed exception]

### 8.2 What the posters change (in Part A's order)
**§1 The frame**
- **The bottom and the side edges become the near frame:** dark, detailed masses cut by >= 2 edges (leaves, a rail, a
  rock, roof edges), median L* <= 60 and >= 30 from the air, edges >= 0.3, open ground <= 15 % of the frame (PE L1:
  the posters' nearest plane L* 45, open ground 7 %, the bottom fifth 59 % masses; v2 74, 25 %, 9 %); bottom corners
  L* <= ~55 (CO L1: posters 44 / 53, v2 ~72 / 74). Masses already may run under the UI (§1). [proposal; its values rest
  on the owner's full value range, DIR 6]
- **The one quiet field, measured:** when the sky is the field, calm below the skyline <= 5 % of the frame (posters 1-3
  %, v2 19-31 %: CO §1, §7) and no edge-free field over 2 % below the sky (P4 §3.5); 73-90 % of the detail in the lower
  half (v2 53-62 %). The bounded-floor variant (LD §0) stays for cozy shots whose quiet field is the floor. [proposal]
- **The far anchor's zone:** its top at y >= 620 (just under the band), its base on the horizon at y ~850-1050, >= 65 %
  of the width and off >= 1 side edge, 6-20 % of the height (P1 §3.2). [proposal]
- **Pip's spot:** the busiest 60-px spot of y 700-1480, x 140-760, >= 250 px from the hero, in the near patchwork; never
  the sky, the band, the rail or the hero (CO §4). [owner: hidden, DIR 2; the spot rule: proposal]

**§2 Shot grammar**
- **A new row, the poster frame** (the home place's establishing view and the scale landing's end frame): open sky from
  the frame top to the hero's shoulders (~45-58 % of the frame, the band inside it, flat), the hero standing in the read
  zone with its top at y >= 600, centred or on the left third, >= ~80 % of the detail in the lower half, dark bottom
  corners (CO L1). v2's S5 crane end is one already (sky 39 %, the subject 16.8 %, corners 57 / 57: CO §7). CG's sky
  30-40 % stays the scale move's default until the owner sees one. [proposal; CO question 1]
- **(b) Horizons.** For a place-led vista the posters' near eye level (median 0.74 H, 0.62-0.77) maps to y ~1380-1480;
  where a far city is lifted onto its own horizon (Hanoi, Buenos Aires, Cape Town: 0.14-0.27 H higher), that far stage
  sits at ~0.57-0.63 H, y ~1090-1215, behind a hiding band with no receding line (PE L2, `img/perspective_916.jpg`). CG's
  rooftop landings (S1 0.40 H, S5 0.46 H) stay the Arcane option; a figure-led street keeps the head on the eye level
  at 0.50-0.60 H (at 0.74 H the body would fall under the bottom UI: PE L2). [the low vista eye: proposal; the far
  stage: open, PE question 1, it clashes with CR §f.4-5's one camera per shot]
- **Vanishing points off the centre:** exterior vistas default to a yawed camera (`groundCam` yaw 20-25 deg puts the VP
  at or past a side edge with f 1400); the posters never centre one, v2 centres it in 5 of 8 shots (PE L4). CS's street
  (VP 0.60-0.70 W, one sight line) and a centred one-point corridor (v1) stay choices. [proposal]
- **Landmarks are frontal elevations, huge yet far:** no convergence, verticals parallel (21 of 23 posters'
  structures), the base hidden behind a band (5 of 7), the top in open sky at y >= 620, drawn up to 1.4-3.6x one
  camera's size, declared in W1 (PE L3). [proposal; rule 2's "never a flat elevation of stacked bands" read for floor
  bands only: open, PE question 2]

**§3 Composition rules**
- **(c) The hero's spot:** centred (x 380-700) or on the left third (x ~200-450, est.), never the right third below
  y 840: the posters' right-third heroes (Hanoi x 604-1061, Kyoto 571-1048) land under the rail (CO §4). [centre:
  owner (DIR 2's subject axis); the left third: open, CO question 2]
- **The hero big AND loud:** in a place-led shot the landmark is the biggest icon (>= 2x the next; posters median
  2.4x), ~8-15 % of the frame (est.), its top in open sky (>= 30 % of its ring), and it owns the salience peak (CO L2;
  v2's subjects lead per pixel but cover 1.4-4.6 %). Part A's subject box stays for figure-led beats. [proposal]
- **Lines don't lead, the sky does:** the posters' diagonals cross the hero no more often than chance (lead lift median
  0.78: CO §1); the hero is found by size, sky and value. Part A's leading lines stay. [no change]
- **Planes:** 5-7 and the sky in every poster (PE §1.3), as CR §f.1's vista count (§6 row 5); in two value groups with
  a gap (P1 §3.1, STUDY §1). [range: owner, DIR 6; numbers: proposal]
- **(e) The patchwork vs our planes rule:** frontal on mid and far masses; on a ground only projected through
  `groundCam` (facets receding to the VP, never level bands seen edge to edge: PE §5); in the sky only as masses (ghost
  blocks within dE 6 of the air), never abstract rectangles (ST §4); blocks 3.5-7.5 % W, far 6-10 % (ST §1.3); each
  facet belongs to its plane and takes its plane's step, so CR §f's ladder holds. [open: the owner has not answered on
  the patchwork]

**§4 Across shots**
- **A far landmark carries a join:** kept at one screen spot (±8 %) and size (±20 %) it is a B thread match between two
  near places of one city (CO §5). Never three wides in a row on a centred landmark (§2 "angle"). [proposal]
- **The capriccio as a sequence:** several icons of a place, one per beat, the establishing frame with exactly one A
  (CO L5); which icons is content (the owner). [proposal]
- **The float by distance:** each plane moves by 1/z (near 1, plane 0 0.6, +1 0.24, +2 0.10, +3 0.04, the anchor, the
  far stage and the sky 0), or by its measured scale when W1 declares units (P1 §3.4, PE L5). [the parallax float:
  owner, DIR 8; the numbers: a code-vs-doc fix, `lib/depth.ts` `PARALLAX_K` breaks CS §4's 1.8x]

**§5 The cover and the grid**
- **(d) What survives 9:16:** the extension (full width, top edge at y ~300, ~300 px more sky above, ~200 px more near
  frame below), the three bands, the dark bottom corners. What does not: the crop (the title under the top UI at y
  181-268, a tower through the band in 6 of 7, a quarter of the width lost), the right third, a steep sky in the band
  (CO §4, §9). In motion the far stage and sky hold still and the near frame moves most; a truck along the far stage's
  junction is the one move that could expose it (PE L2). [proposal]
- **One cover frame for the series:** the core line in the sky in our caption type, the film's A drawn big under it
  (~8-15 %, est.) with open sky round its top, the near frame dark at the bottom, all inside the 4:5 crop y 285-1635
  (CO L6). [covers read as one series: owner (playbook ONE LOOK); the template: proposal; the case and Pip on the
  cover: open, §6 rows 15-16]

### 8.3 Into LAYOUT.md (§7 item 7)
When approved: the poster-frame row into §2; the near frame, the quiet-field numbers and the far anchor's zone into
§1; the hero's spot and size into §3; the far-landmark carrier and the 1/z float into §4; the cover template into §5;
`composition.py frame` (the overlay and numbers on any 1080 x 1920 still) promoted to `scripts/qa/check_composition.py`
in §6 (CO L8, cost M). Cost of Part B in the docs: S; risk: a formula if every film opens on the same poster frame
(vary the hero's side and the near frame per film: CO L1).

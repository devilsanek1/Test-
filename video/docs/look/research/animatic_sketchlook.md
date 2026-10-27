# The animated sketchbook: loose but never empty (G3 look research, 2026-10-26)

Lane: the owner's "animated sketchbook" — how loose sketches stay dense, alive and readable, and how to encode that in
SketchReel board mode so a G3 pass can never again hide a G5 "way too empty" surprise. **VERIFIED** = primary page or
several sources agree; **REPORTED** = one secondary source; unsourced numbers are our own choices for 1080x1920 / 270x480.

## 0. The reference image (`../ref_animated_sketchbook.png`), what makes it work
An urban sketcher's open notebook held up against the real Piccadilly-like street it draws; loose ink, no colour. Our read:
- **Nothing is empty.** Every surface that holds detail in reality carries marks: facades are scribbled window rows, the
  statue is a wiry tangle, crowds are head-bumps over leg-ticks, signage is illegible squiggle. White paper appears only
  where the world is plain (sky, road) — emptiness is a decision, not an omission.
- **Confidence is rationed.** The focal subjects (the building fronts, the statue) get continuous, darker, surer contours;
  everything peripheral is broken, lighter, searching lines. Detail density peaks at the focal point and decays outward.
- **Value comes from mark density, not fills.** Dark areas are tight scribble/hatch mass; the page reads in 3-4 values at
  arm's length even though it is only line. At thumbnail size the squiggles melt into grey tone and the page still reads.
- **Wrong in the small, right in the large.** Individual windows are crooked ticks, but rooflines, verticals and relative
  scale are believable, so the eye trusts it. The backbone (big shapes, perspective, silhouette) is exact; the skin is loose.

## 1. How sketchers get a dense, alive page FAST (the 80/20 of detail)
- **Marc Taro Holmes (The Urban Sketcher): three passes.** 1) a loose pencil "scribble" establishing shot — big shapes,
  proportion, "even if your subject leaves you've still got the overall shape"; 2) a calligraphic ink line over it; 3) spot
  blacks / shadow shapes that pull the page together. Stop after pass three. VERIFIED [1][2].
- **Outside-in:** start from an accurate silhouette, fill inward — the contour carries the read, the inside can stay loose
  (Holmes; also taught as sight-size "drawing from the outside in"). VERIFIED [2][3].
- **Ian Fennelly (Urban Sketch Course):** block the scene in rectangles/lines as a "safety net"; draw ONE focal building
  truly, build outward from it; **"mark windows, don't draw them"** — small dashes for placement; distant areas get "a
  little suggestion" (a roofline, a hint of wall) and the viewer completes them. VERIFIED [4].
- **Loose != uncontrolled (Chris Wilson):** a loose sketch "selects important information" — it is "editing what you see";
  uncontrolled marks have no priority. Detail a few windows near the focal area, reduce the rest to simple marks; "a few
  carefully chosen details often make a sketch feel more convincing"; strong darks hold a loose drawing together; edges may
  fade unfinished — but omission must be intentional, never failure to observe. VERIFIED [5].
- **Texture vocabulary:** dots, squiggles and broken dashes for brick/texture; scribble hatching for "loose, energetic areas
  like foliage or crowd scenes"; a tree canopy is one large irregular shape, never leaves. REPORTED [6].
- **The classic name for all this is "indication"** — Guptill's *Rendering in Pen and Ink* (1928, still the standard text)
  teaches brickwork/shingles/"roof indications": a surface is shown by a patch of marks that fades out, not unit-by-unit;
  pen values are simplified because the pen can't hold a full range. REPORTED [7].
- **No source gives a numeric 80/20**; the agreed convention: ONE focal area gets real drawing + the darkest darks; every
  other surface gets placement marks and mass. Detail decays with distance from the focal point. VERIFIED (all above agree).

## 2. Sketch styles in MOTION: what boils, what holds still
- **Line boil** = the wobble of hand-redrawn lines. Killing it entirely makes characters "frozen in place like statues" —
  studios keep or exaggerate it for aliveness. The limited-animation recipe for readability: hold one drawing for parts
  that don't move, redraw only what moves — i.e. **stability is structural (silhouette, framing, pose), aliveness is
  textural (the line itself)**. VERIFIED [8][9].
- **The Snowman (1982):** whole frames redrawn in pastel/crayon, backgrounds made with the same tools so they match — the
  entire picture shimmers as one drawing while composition and silhouettes hold; the "crayon look" was treated as the
  film's core technical problem to protect. VERIFIED [10][11].
- **Take On Me (1985):** sketch scribble over rotoscoped live action — silhouettes and motion stay photographically
  readable while every line boils; ~3000 hand drawings. VERIFIED [12]. Ed, Edd n Eddy's boil = 3 tracings of each drawing;
  Dr. Katz "Squigglevision" looped 5. REPORTED [8][9].
- Lesson for a boiling board: the camera plan, cuts, silhouettes and the focal subject never wobble in MEANING — boil is a
  surface treatment on locked staging. Exactly our G3 contract: backbone exact, skin loose.

## 3. Placeholder vocabulary for our SVG / 4-tone setting (1-2 paths each)
Grounding: rough.js draws every "sketchy" line twice with randomized endpoints plus bow points at ~50%/75% of its length,
and builds fills from hachure scanlines (default angle -41 deg, gap = 4x strokeWidth); **zigzag connects consecutive hachure
lines into a continuous traversal** — i.e. a whole mass as one wandering path; "scribble" ports are a continuous zigzag
traversing the shape. VERIFIED [13][14][15]. Our primitives (all mid-grey 3 px unless noted, `role: far|mid`):
- **scribble-mass:** one path: hachure scanlines of the region's bounding shape joined zigzag-style, with per-vertex seeded
  jitter (±4-8 px) and line gap 10-20 px. At 270x480 (quarter scale) 3 px strokes with ~12 px gaps collapse into a flat
  25-40 % grey — it reads as TONE, not marks, which is exactly what a sketch page does at arm's length (§0).
- **crowd-row:** one path per row: a run of head bumps (r ~14-20 px arcs) whose underside drops into 2-3 leg ticks each,
  baseline shared. Reads as "people" at full size, as a grey band at thumbnail. A second darker bump = someone specific.
- **facade-row:** one path: a roofline contour (stepped, slightly crooked) plus dropped verticals every 60-120 px. Suggests
  a street in one stroke; depth = make the far row lighter (far role) and shorter.
- **window-ticks:** one path of grouped short dashes (2 per window, 10-16 px) laid in rows inside a facade — Fennelly's
  "mark windows, don't draw them" verbatim [4]. At thumbnail the rows read as facade texture; never draw window rectangles.
- **foliage-blob:** one closed irregular canopy contour + one interior scribble path (looser gap, 16-24 px). The canopy is
  one big shape [6]; the scribble gives it value so it isn't an empty balloon.
Each primitive is 1-2 `<path>` elements -> cheap to lint (counts as ONE element), cheap to boil, trivially replaced at G5
by the real drawing it stands for. The region it covers IS the contract: "final art goes here, this dense."

## 4. The rule to encode: LOOSE never means EMPTY
A sketch page is loose in PRECISION but dense in SUGGESTION — every detail-bearing surface carries marks (ref image §0;
Wilson's intentional-omission test [5]; Fennelly's "suggest distant areas" [4]). The v3 failure was reading "loose" as
"leave it out": the board showed bare paper where the final needed crowds, props and texture, so the owner approved
staging and unknowingly approved emptiness. Per-panel rule, lintable:
- **Coverage contract:** every surface that will hold detail or life at G5 carries a placeholder mass at G3 (one §3
  primitive). Plain paper is legal only where the final stays plain; mark deliberate negative space `negative: true`.
- **Check (squint test, mechanical):** render the panel at 270x480, grey-average it in a 6x10 grid; any cell outside the
  caption band / notes strip / `negative` zones that is >= 97 % paper-white fails as "unaccounted emptiness" — either add a
  placeholder or tag it negative. This makes "way too empty" a G3 lint failure instead of a G5 surprise.
- **Life list:** the shot JSON names its G5 life items (crowd, traffic, steam, clutter); lint requires one placeholder per
  item. Approval of the board = approval of WHERE the life goes and how much, not of bare walls.

## 5. Line boil in vector: cheap, and when to use it
- **Practice numbers:** 2-4 redrawn variants looped at ~8-12 fps; "change the boil every ~4 frames" (on threes); dedicated
  tools default to 12 fps with 2-4 frames and a ping-pong option; Ed Edd n Eddy used 3 tracings. VERIFIED [8][9][16][17].
- **Vector recipes:** (a) pre-generate 2-3 seeded jitter variants per path (re-run the rough.js-style randomization with
  seeds 1..3) and swap them on a clock — deterministic, renders identically everywhere; (b) SVG feTurbulence +
  feDisplacementMap (baseFrequency ~0.02-0.03, scale ~20) stepping offsets every ~100 ms — works, but warns of "boil
  over": too much displacement makes shapes "barely recognizable". VERIFIED [18]; (a) is safer for Remotion (pure
  function of frame, no filter cost). Our numbers at 60 fps: swap every 5-8 frames (7.5-12 Hz), ONE shared clock so the
  page boils as a single drawing; jitter amplitude ~0.3x stroke width, capped at 3 px.
- **Helps:** sketch feel, aliveness on held panels (the anti-"statue" effect [8]), hiding vector perfection, making
  placeholder masses read as "unfinished on purpose". **Hurts:** small text (wiggle tutorials boil TEXT as a stunt — our
  captions, numbers, notes must never boil [17]); meaning (a boiling arrow or chart line reads as uncertainty); and
  per-frame swaps at 60 fps read as vibration/strobing, not boil — stay at 8-12 Hz. VERIFIED [8][17][18] + our choice.
- **Amplitude by role:** subject contour lowest (silhouette is the read, §2), placeholder masses highest (they are the
  "alive" layer), far plane lowest-contrast. Contact sheets always sample variant 0 so stills stay comparable.

## Sources
[1] https://urbansketchers.org/2015/01/05/book-review-urban-sketcher-by-marc-taro/ · [2] https://larrydmarshall.com/book-review-the-urban-sketcher-by-marc-taro-holmes/
[3] https://www.artistsnetwork.com/art-mediums/drawing/sketching-techniques-drawing-from-the-outside-in/ · [4] https://www.urbansketchcourse.com/blog/capturing-the-shapes-beneath-the-detail/
[5] https://chriswilsonstudio.com/loose-urban-sketching/ · [6] https://skyryedesign.com/art/drawing/urban-landscape-sketching-techniques/
[7] https://archive.org/details/renderinginpenin0000gupt (TOC: "Roof Indications" etc.; chapter text not read) · [8] https://tvtropes.org/pmwiki/pmwiki.php/Main/LineBoil
[9] https://doodraw.com/blog/boiling-lines-animation/ · [10] https://www.bfi.org.uk/features/raymond-briggs-the-snowman-christmas
[11] https://animationobsessive.substack.com/p/the-specialness-of-the-snowman · [12] https://www.animationmagazine.net/2022/04/take-on-me-revisiting-the-making-of-a-has-trailblazing-animated-music-video/
[13] https://shihn.ca/posts/2020/roughjs-algorithms/ · [14] https://github.com/rough-stuff/rough/wiki · [15] https://github.com/sstradling/RoughSwiftUI
[16] https://lineboiler.com/ · [17] https://www.premiumbeat.com/blog/wiggle-text-line-boil/ · [18] https://camillovisini.com/coding/simulating-hand-drawn-motion-with-svg-filters

## What this means for our G3
1. Add 5 placeholder primitives to SketchReel, 1-2 SVG paths each, each counting as ONE lint element: scribble-mass, crowd-row, facade-row, window-ticks, foliage-blob (§3 specs: 3 px mid-grey, gap 10-20 px, seeded jitter ±4-8 px).
2. New per-shot JSON field `life: [...]` naming every G5 life item (crowd, traffic, clutter, steam); board-lint requires one placeholder element per listed item — approving the board now approves the density plan.
3. New lint check "unaccounted emptiness": at 270x480, grey-average a 6x10 grid; any cell outside caption band / notes strip / `negative: true` zones that is >= 97 % paper fails — bare paper must be declared, never defaulted.
4. Amend STORYBOARD_STYLE.md §2 "Texture: none": scribble-mass (mid-grey, far/mid role only) is now the ONE legal texture, as placeholder tone; the "40 % plain paper" rule becomes "40 % low-detail area (paper or scribble tone)".
5. Build order per panel = Holmes's three passes, then STOP: big shapes/silhouette -> confident contour on the subject only -> spot darks + placeholder masses everywhere the final has detail.
6. Detail decays from the focal point: the subject gets continuous 9 px contour + the only dark mass; adjacent surfaces get a few real details ("a few windows"); everything further gets ticks and masses — equal detail everywhere is a lint-able smell (>1 detailed region).
7. Windows, signage, crowds are NEVER drawn at G3: window-ticks, squiggle bars, crowd-rows only — if a peripheral element needs real drawing to be understood, it is probably the subject of its own panel.
8. Line boil ships in board mode: 3 pre-seeded jitter variants per path, swapped on one shared clock at 8-12 Hz (every 5-8 frames at 60 fps), ping-pong; amplitude ~0.3x stroke width capped at 3 px; subject contour boils at half amplitude, placeholder masses at full.
9. Never boil: captions, numbers, labels, the notes strip, chart lines and red marks — boil is aliveness, not meaning; and never swap variants per-frame at 60 fps (reads as strobing).
10. Boil is surface only: framing, cuts, silhouettes, poses and camera moves stay locked while lines boil — if a panel's read depends on the boil, the panel fails the sound-off checklist.
11. Contact sheets sample variant 0 of the boil so stills stay comparable across fix rounds.
12. G3 sign-off gains one owner question, stated in the gate notes: "every grey mass you see becomes real detail at G5, every bare area stays bare — OK?" — making density an explicit approval, not an accident.

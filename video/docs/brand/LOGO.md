# Studio logo: "What's All the Fuss About?"

**Status, 2026-10-29 ~20:05 UTC: round 4 (from scratch, premium, no text), with the owner.** The sheet:
`video/deliverables/brand/logo_options_v4.png`. Rounds 1-3 are superseded by the owner's verdicts below (no text; more
abstract, more premium; from scratch, more premium). All rounds are iterations (owner rule "Two modes"). Brief: the
owner asked the orchestrator to "spin up a thread to generate me the modern beautiful logo to put on the studio". The
logo lives on the avatar (a circle crop that must read at 110 px and at 40 px), as a small end card or watermark in the
videos, in the corner of a cover and on a banner.

## Round 4: emblems in the city posters' language (light at dusk, depth, a detail found on a second look)
Why from scratch: rounds 1-3 were flat icons in compass-perfect shapes, which read as stock; the premium the owner
showed us is the city posters (light, depth, atmosphere, craft).
1. **The Elephant and the Sun:** a calm adult elephant walking into a low sun, its back rimmed by the light: memory,
   patience, the light coming up on a story; today's Pip-and-sun avatar, grown up.
2. **The Window:** one lit arched window at dusk with a fanlight: a small window onto a big story, our films' cozy
   light; a little elephant stands on the inner sill (find Pip).
3. **The Seal:** a terracotta wax seal with the elephant pressed in relief: made by hand, checked, signed; the promise
   that we did the reading for you.

Each is on the sheet large, at 110 px and 40 px on a light and a dark app, in one colour and reversed (for watermarks
and end cards), and in a profile mock. Dropped on the way: a city-poster vignette (a far skyline over water with a
cloud shaped like Pip): at logo size it read as a cheap travel illustration.

## Recommendation (round 4)
- **Go with 1, The Elephant and the Sun:** the most iconic and the most premium at small size; a silhouette against
  light reads at 40 px like nothing else on the sheet.
- It keeps the soul of today's avatar (an elephant and a sun) and drops the cartoon: no face, no outline, one rim of
  light, the posters' dusk.
- The Window is the alternative if you want no animal up front (the elephant only as a hidden detail).

## Palette (proposal, from our warm family; never beige, olive or grey)
Round 4: dusk plum `#17111F` / `#2B1E3A` / `#4D3354` (the ground and the vignette), the sun `#FFE9BE` -> `#F9B978` -> `#EC8A55`,
the elephant `#1A1228` with a rim `#F5A766`; the window's glow `#FFF4DA` -> `#FFD999` -> `#F5A564` -> `#DD7848` on a wall
`#4C3A63` -> `#2E2342` -> `#191325`; the seal's wax `#D9693B` / `#C1532A` / `#A2411F` on paper `#F3E5D6`. Rounds 1-3:

| Role | Hex | Use |
|---|---|---|
| Cream | `#F7EDE3` | the page; the marks reversed on dark |
| Plum | `#2E2138` | ink and the dark ground (tinted, never black); the Fold's shade face |
| Plum, lit | `#433152` | the Fold's lit face |
| Peach shade | `#F3C4A6` | the cream Fold's shade face |
| Canal teal | `#0F8273` | the Eclipse's avatar; the teal Fold (shade `#0A5D53`) |
| Periwinkle | `#5A5CC4` | Pip's colour, a second colour for the Eclipse |
| Terracotta | `#E0683A` | the one pop: the point |

Earlier rounds also used Pip's periwinkles (`#7A7FE3`, `#6A6ED6`, `#AEB2F4`), peach `#F6B494` and the warm sky `#F9E3D2`.

## Earlier rounds (superseded)
- **Round 3** (`logo_options_v3.png`, abstract): The Fold (a folded speech bubble), The Eclipse (two circles), The
  Question (an open ring and a point). The owner: from scratch, more premium. Dropped on that scratch board: a split
  sphere (a "no entry" sign), broken rings (a target, a loading spinner), ripples, a golden spiral, an arch window (a
  tombstone), a Pip pressed into a coin.
- **Round 2** (`logo_options_v2.png`, marks only): The Point (a spiral question mark), Pip (a cartoon head with a lit
  and a shade face) and Pip hidden on purpose (a badge, Pip peeking over the ground). The owner: more abstract, more
  premium.
- **Round 1** (`logo_options_v1.png`): The Wordmark ("fuss / about?" in Fraunces Soft, the monogram f?), The Point and
  Pip, each with the name. The owner: no text. Round 1's type, all SIL OFL 1.1 and outlined to paths: Fraunces (SOFT
  100, opsz 144, wght 760; npm `@fontsource-variable/fraunces` 5.3.0), Jost 500 (`@fontsource/jost` 5.3.0),
  Bricolage Grotesque (wght 800; `@fontsource-variable/bricolage-grotesque` 5.3.0), Patrick Hand
  (`@fontsource/patrick-hand` 5.3.0). Rounds 2-4 use no type.

## Files
- Round 4: `video/brand/logo/make_logos_r4.py` (the sheet) and `marks_r4.py` (the emblems, the elephant outline,
  gradients); `svg/r4/` holds each emblem and its one-colour version (real knock-outs). Rebuild:
  `cd video/brand/logo && python3 make_logos_r4.py`.
- `video/brand/logo/make_logos_r3.py` and `marks_r3.py`: round 3 (the marks as exact geometry, the SVGs, the sheet);
  `make_logos_r2.py`, `make_logos.py` and `marks.py`: rounds 2 and 1; `logo_lib.py`: palette, text outlining,
  stroke-to-fill geometry; `render.cjs`: the Playwright Chromium screenshot. Rebuild: the setup line at the top of
  `logo_lib.py` (fonts only for round 1), then `cd video/brand/logo && python3 make_logos_r3.py`.
- `video/brand/logo/svg/r3/`: per direction `*_mark.svg`, `*_mark_dark.svg`, `*_mark_one_colour.svg` (real knock-outs,
  transparent background), a second colourway, and `*_avatar.svg` (square; the platforms crop the circle). Rounds 1
  and 2 are in `svg/` and `svg/r2/`. Fills only: no strokes, no outlines, no hairlines.
- Every mark is original, drawn from exact circles, arcs and straight cuts in code; nothing traced, no image generation.

## Owner's verdict
(the owner's words verbatim, newest at the bottom; the orchestrator folds approach-level lessons into the playbook)
- 2026-10-29 ~19:37 UTC, on round 1, written to the logo session directly: "The logo should not contain any text btw"
  -> round 2: marks only, no name, no letters (round 1's Wordmark and every lockup are out; the f? monogram too).
- 2026-10-29 ~19:50 UTC, on round 2 (the sheet and the pick, 3 Pip hidden on purpose): "More premium!!" then "No, more
  abstract more premium" -> round 3: abstract marks, premium (precise geometry, few shapes, restrained colour); no
  cartoon, no face; Pip only if abstracted past the cartoon.
- 2026-10-29 ~20:00 UTC, on round 3 (The Fold, The Eclipse, The Question): "Nope from scratch I don't like none of
  them" and "More premium" -> round 4 from scratch: flat geometric icons read as stock, not premium; premium is the
  city posters' language (light, depth, atmosphere, craft), drawn as small emblems at dusk.

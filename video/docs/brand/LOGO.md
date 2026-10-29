# Studio logo: "What's All the Fuss About?"

**Status, 2026-10-29 ~20:05 UTC: round 3 (abstract, premium, no text), with the owner.** The sheet:
`video/deliverables/brand/logo_options_v3.png`. Rounds 1 and 2 are superseded by the owner's verdicts below (no text;
more abstract, more premium). All rounds are iterations (owner rule "Two modes"). Brief: the owner asked the
orchestrator to "spin up a thread to generate me the modern beautiful logo to put on the studio". The logo lives on the
avatar (a circle crop that must read at 110 px and at 40 px), as a small end card or watermark in the videos, in the
corner of a cover and on a banner.

## Round 3: three abstract marks (no text, no character, no face)
1. **The Fold:** a speech bubble (a circle with one square corner) folded along its diagonal into a lit face and a shade
   face: everyone's talking about it, and we unfold it; the films' light and shade in one shape. Plum on cream; the
   avatar a cream and peach fold on plum.
2. **The Eclipse:** two circles, what you heard and what you understand; where they overlap, the point lights up in
   terracotta. Avatar on teal. In one colour the overlap is parted by a cut (never a lone crescent).
3. **The Question:** the question mark reduced to an open ring and the point, cut flat, no stem; the most direct link
   to the name. Avatar cream on plum.

Each is on the sheet as the mark, the avatar, on dark, in one colour, in a second colour, the avatar at 110 px and 40 px
(real pixels) on a light and a dark app, in the corner of a cover, as a watermark on a frame, and in a profile mock.
Tried and dropped on the way (scratch board): a split sphere (read as a "no entry" sign), broken rings round a point
(a target, a loading spinner), nested ripples, a golden spiral, an arch window (a tombstone), a Pip pressed into a coin.

## Recommendation (round 3)
- **Go with 1, The Fold:** the most premium and the most abstract of the three, and still about us: the conversation
  everyone's having, opened up.
- Its two flat tones are our films' light and shade, so the logo and the films speak the same visual language.
- The silhouette holds at 40 px (a bubble), it works in one colour, and the cream fold on plum is calm and expensive
  beside our warm covers. The Question is the fallback if you want the name's "?" to show.

## Palette (proposal, from our warm family; never beige, olive or grey)
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
- **Round 2** (`logo_options_v2.png`, marks only): The Point (a spiral question mark), Pip (a cartoon head with a lit
  and a shade face) and Pip hidden on purpose (a badge, Pip peeking over the ground). The owner: more abstract, more
  premium.
- **Round 1** (`logo_options_v1.png`): The Wordmark ("fuss / about?" in Fraunces Soft, the monogram f?), The Point and
  Pip, each with the name. The owner: no text. Round 1's type, all SIL OFL 1.1 and outlined to paths: Fraunces (SOFT
  100, opsz 144, wght 760; npm `@fontsource-variable/fraunces` 5.3.0), Jost 500 (`@fontsource/jost` 5.3.0),
  Bricolage Grotesque (wght 800; `@fontsource-variable/bricolage-grotesque` 5.3.0), Patrick Hand
  (`@fontsource/patrick-hand` 5.3.0). Rounds 2 and 3 use no type.

## Files
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

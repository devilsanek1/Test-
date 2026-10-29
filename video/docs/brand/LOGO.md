# Studio logo: "What's All the Fuss About?"

**Status, 2026-10-29 ~19:45 UTC: round 2 (no text), with the owner.** The sheet:
`video/deliverables/brand/logo_options_v2.png`. Round 1 (`logo_options_v1.png`) is superseded: the owner's rule is no
text in the logo (verdict below). Both rounds are iterations (owner rule "Two modes"). Brief: the owner asked the
orchestrator to "spin up a thread to generate me the modern beautiful logo to put on the studio". The logo lives on the
avatar (a circle crop that must read at 110 px and at 40 px), as a small end card or watermark in the videos, in the
corner of a cover and on a banner.

## Round 2: three directions, marks only (no letters, no name)
1. **The Point:** a question mark that goes round in circles, straightens out and lands on its dot (the fuss, then the
   point); drawn, not typed; one stroke, so an end card can draw it on. Avatar: cream on plum, the dot terracotta.
2. **Pip:** our elephant rebuilt from circles and lit from one side like the films' volumes (a lit face, a shade face,
   no outline): the biggest ears (heard it all), a memory that never forgets. Avatar: on teal, like today's.
   Pose B on the sheet: the raised trunk curls into a question mark's hook.
3. **Pip, hidden on purpose:** a round badge, Pip peeking over the ground with the trunk hooked over the edge: curious
   about the fuss, and the "find Pip" of every film in one picture; in one colour, Pip is cut out of the disc.

Each is on the sheet as the mark, the avatar, the mark on dark, in one colour and reversed, the avatar at 110 px and
40 px (real pixels) on a light and a dark app, in the corner of a cover, as a watermark on a frame (Pip's band: pose B
instead), and in a profile mock with our three covers.

## Recommendation (round 2)
- **Go with 3, Pip hidden on purpose:** the most ownable of the three. It is the playbook's "find Pip" in one picture,
  and it keeps Pip "not as obvious", peeking and half hidden.
- The round badge fills the avatar circle edge to edge, so at 40 px it still reads as a warm disc with Pip's dome and
  ears, and it sits well beside our warm covers.
- Its one-colour cut-out (Pip in the disc's negative space) is the boldest modern mark on the sheet, for watermarks,
  end cards and a two-colour avatar if you want it bolder. The Point is the alternative if you'd rather have no
  character at all.

## Palette (proposal, from our warm family; never beige, olive or grey)
| Role | Hex | Use |
|---|---|---|
| Cream | `#F7EDE3` | the page; the mark reversed on dark |
| Plum | `#2E2138` | ink and the dark ground (tinted, never black); The Point's avatar |
| Pip periwinkle | `#7A7FE3` | the brand colour; Pip's lit face |
| Periwinkle shade face | `#6A6ED6` | the shade side of Pip's head (round 2) |
| Periwinkle deep | `#5A5CC4` | Pip's ears |
| Periwinkle light | `#AEB2F4` | Pip's lit face on dark (shade `#9296EC`) |
| Canal teal | `#0F8273` | Pip's avatar; the reversed tiles |
| Terracotta | `#E0683A` | the one pop: the question's dot ("the point"); the ground in the badge (lit top `#EE8F66`) |
| Peach | `#F6B494` | Pip's inner ears |
| Warm sky | `#F9E3D2` | the sky behind the peeking Pip |

## Type
Round 2 has none: no letters anywhere in the marks. Round 1's lockups used four SIL OFL 1.1 fonts, outlined to paths
(no fonts in the SVGs): Fraunces (SOFT 100, opsz 144, wght 760; npm `@fontsource-variable/fraunces` 5.3.0), Jost 500
(`@fontsource/jost` 5.3.0), Bricolage Grotesque (wght 800; `@fontsource-variable/bricolage-grotesque` 5.3.0) and
Patrick Hand (`@fontsource/patrick-hand` 5.3.0, the films' caption font). The fonts are not committed: the generator
installs them into `video/brand/logo/.deps/` (git-ignored) and shapes text with HarfBuzz.

## Round 1 (superseded by the owner's no-text rule)
`logo_options_v1.png`: 1 The Wordmark ("fuss / about?" in Fraunces Soft under a tracked WHAT'S ALL THE, the avatar the
monogram f?), 2 The Point beside the name in Bricolage Grotesque, 3 Pip beside the name in Patrick Hand. Its pick (the
Wordmark) is out with the rule; The Point and Pip carried into round 2 as marks.

## Files
- `video/brand/logo/make_logos_r2.py`: round 2 (directions as data, the SVGs, the sheet); `make_logos.py`: round 1;
  `marks.py`: the marks as geometry; `logo_lib.py`: palette, text outlining, stroke-to-fill geometry; `render.cjs`: the
  Playwright Chromium screenshot. Rebuild: the setup line at the top of `logo_lib.py`, then
  `cd video/brand/logo && python3 make_logos_r2.py`.
- `video/brand/logo/svg/r2/`: per direction `*_mark.svg`, `*_mark_dark.svg`, `*_mark_one_colour.svg` (real knock-outs,
  transparent background) and `*_avatar.svg` (square; the platforms crop the circle); `2_pip_pose_b.svg`. Round 1's
  files are in `svg/`. Fills only: no strokes, no outlines, no hairlines.
- Every mark is original, drawn from circles, arcs and curves in code; nothing traced, no image generation.

## Owner's verdict
(the owner's words verbatim, newest at the bottom; the orchestrator folds approach-level lessons into the playbook)
- 2026-10-29 ~19:37 UTC, on round 1, written to the logo session directly: "The logo should not contain any text btw"
  -> round 2: marks only, no name, no letters (round 1's Wordmark and every lockup are out; the f? monogram too).
- 2026-10-29 ~19:50 UTC, on round 2 (the sheet and the pick, 3 Pip hidden on purpose): "More premium!!" then "No, more
  abstract more premium" -> round 3: abstract marks, premium (precise geometry, few shapes, restrained colour); no
  cartoon, no face; Pip only if abstracted past the cartoon.

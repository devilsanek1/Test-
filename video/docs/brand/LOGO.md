# Studio logo: "What's All the Fuss About?"

**Status, 2026-10-29: round 1 (an iteration, owner rule "Two modes"), with the owner.** The sheet:
`video/deliverables/brand/logo_options_v1.png`. Brief: the owner asked the orchestrator to "spin up a thread to generate
me the modern beautiful logo to put on the studio"; it lives on the avatar (a circle crop that must read at 110 px and
at 40 px), as a small end card or watermark in the videos, in the corner of a cover and on a banner.

## Round 1: three directions
1. **The Wordmark:** "fuss / about?" set big in Fraunces Soft under a tracked kicker WHAT'S ALL THE (like the city
   posters' titles); the avatar is the monogram **f?**, two hooks that rhyme, its dot the one terracotta "point".
2. **The Point:** a question mark that goes round in circles, straightens out and lands on its dot (the fuss, then the
   point); one stroke, so an end card can draw it on; beside the name in Bricolage Grotesque.
3. **Pip:** our elephant rebuilt from circles, the biggest ears (heard it all) and a memory that never forgets; two flat
   tones of periwinkle (lit head, shade ears) with no outline, the name in Patrick Hand, our caption hand. Pose B on
   the sheet: Pip raises the trunk into a question mark's hook.

Each is on the sheet as its full lockup, the lockup on dark and in one colour, the mark alone (light, dark, one colour,
one colour reversed), the avatar at 110 px and 40 px (real pixels) on a light and a dark app, the avatar in the corner
of a cover, and a profile mock with our three covers.

## Recommendation
- **Go with 1, The Wordmark:** the most premium and least generic of the three, type-led like the city posters'
  titles, warm rather than techy.
- Its **f?** avatar is the boldest at 40 px (cream on plum, the highest contrast here) and reads as a question at a
  glance; the terracotta dot becomes a reusable accent ("the point") for end cards and covers.
- It leaves Pip where the playbook wants it, hidden in the films; if Pip's face should stay on the profile, round 2
  can pair this wordmark with direction 3's Pip as the avatar.

## Palette (proposal, from our warm family; never beige, olive or grey)
| Role | Hex | Use |
|---|---|---|
| Cream | `#F7EDE3` | the page; the mark reversed on dark |
| Plum | `#2E2138` | ink and the dark ground (tinted, never black) |
| Pip periwinkle | `#7A7FE3` | the brand colour; Pip's lit face |
| Periwinkle shade | `#5A5CC4` | Pip's shade face (the ears) |
| Periwinkle light | `#AEB2F4` | Pip's lit face on dark |
| Canal teal | `#0F8273` | direction 2's ground; the reversed tiles |
| Terracotta | `#E0683A` | the one pop: the question's dot, "the point" |
| Peach | `#F6B494` | soft accent (Pip's inner ears) |

## Type (all SIL Open Font License 1.1; outlined to paths in every SVG, so the SVGs need no fonts)
| Font | Used for | Setting | Source |
|---|---|---|---|
| Fraunces (The Fraunces Project Authors, Undercase Type) | 1: "fuss about?", the f? monogram | SOFT 100, opsz 144, wght 760, WONK 0 | npm `@fontsource-variable/fraunces` 5.3.0 |
| Jost (The Jost Project Authors, indestructible type*) | 1: the kicker WHAT'S ALL THE | 500, tracked to the width of "about?" | npm `@fontsource/jost` 5.3.0 |
| Bricolage Grotesque (The Bricolage Grotesque Project Authors, Atelier Triay) | 2: the name | wght 800, opsz 96, wdth 100 | npm `@fontsource-variable/bricolage-grotesque` 5.3.0 |
| Patrick Hand (Patrick Wagesreiter) | 3: the name; the films' captions | 400 | npm `@fontsource/patrick-hand` 5.3.0 |

The fonts are not committed: the generator installs them into `video/brand/logo/.deps/` (git-ignored) and shapes the
text with HarfBuzz (kerning and the variable axes applied), then writes the outlines into the SVGs.

## Files
- `video/brand/logo/make_logos.py`: the generator (directions as data, the SVGs, the sheet); `marks.py`: the marks
  and lockups as geometry; `logo_lib.py`: palette, text outlining, stroke-to-fill geometry; `render.cjs`: the
  Playwright Chromium screenshot. Rebuild: the setup line at the top of `logo_lib.py`, then
  `cd video/brand/logo && python3 make_logos.py`.
- `video/brand/logo/svg/`: per direction `*_lockup.svg`, `*_lockup_dark.svg`, `*_mark.svg`, `*_mark_dark.svg`,
  `*_mark_one_colour.svg` (real knock-outs, transparent background) and `*_avatar.svg` (square; the platforms crop
  the circle); `3_pip_pose_b.svg`. Fills only: no strokes, no outlines, no hairlines.
- Every mark is original, drawn from circles, arcs and curves in code; nothing traced, no image generation.

## Owner's verdict
(the owner's words verbatim, newest at the bottom; the orchestrator folds approach-level lessons into the playbook)
- 2026-10-29 ~19:37 UTC, on round 1, written to the logo session directly: "The logo should not contain any text btw"
  -> round 2: marks only, no name, no letters (round 1's Wordmark and every lockup are out; the f? monogram too).

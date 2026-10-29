# Studio logo: "What's All the Fuss About?"

**Status, 2026-10-29 ~20:15 UTC: round 5 (the city view, made ours; stills only, no text), with the owner.** The
sheet: `video/deliverables/brand/logo_options_v5.png`. Rounds 1-4 are superseded by the owner's verdicts below. All
rounds are iterations (owner rule "Two modes"); stills only until the owner picks and approves one ("No video yet").
Brief: the owner asked the orchestrator to "spin up a thread to generate me the modern beautiful logo to put on the
studio". The logo lives on the avatar (a circle crop that must read at 110 px and at 40 px), as a small end card or
watermark in the videos, in the corner of a cover and on a banner.

## Round 5: one dusk city in the posters' language, made ours three ways
The city (shared by all three): a calm dusk sky, the far skyline with a spire, a clock tower and a dome, the mid city
with lit windows, the river with the low sun's glints and the windows mirrored, the quay; Pip hidden on it (find Pip).
1. **Talk of the Town:** the city seen inside a speech bubble with a real tail: the story everyone's talking about,
   opened up as a place; round 3's Fold (the owner: "directionally good but way too abstract") made concrete.
2. **The City Is Talking:** speech bubbles rise from the rooftops like lanterns, one glowing brighter than the rest:
   the whole city is talking about it, and one voice makes it clear.
3. **The Question Lamp:** on a street corner a lantern's iron bracket bends into a question mark and the lit lantern is
   its dot: the question everyone's asking, with the light right there; Pip on the quay, looking up.

Each is on the sheet large, at 110 px and 40 px on a light and a dark app, in one colour and reversed (the skyline cut
out), in the corner of a cover, and in a profile mock.

## Recommendation (round 5)
- **Go with 3, The Question Lamp:** the most clearly ours (the question in our name, the answer as light) and the only
  one that still reads at 40 px as a symbol, a question mark with a glowing dot.
- It keeps the city view you liked, adds no text (the question mark is iron in the scene), and hides Pip on the quay.
- Talk of the Town is the alternative if the speech bubble should lead (round 3's Fold, made concrete).

## Earlier rounds (superseded)
- **Round 4** (`logo_options_v4.png`, from scratch, premium emblems): The Elephant and the Sun, The Window (a little
  elephant on the sill), The Seal. The owner: "I like the city view but it's too generic like why is it relevant to us".
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
  (`@fontsource/patrick-hand` 5.3.0). Rounds 2-5 use no type.

## Palette (proposal, from our warm family; never beige, olive or grey)
Round 5's dusk: the sky `#2B2757` -> `#6A5A9C` -> `#C596AE` -> `#F5C39A` (horizon), the sun `#FCD8A6`, the far city
`#9284BF` / `#9D90C8` / `#8678B6`, the mid city `#4A3D7B` / `#544689` / `#3F3470` with unlit windows `#3A2F63` and lit
ones `#FFCB7E`, the river `#C99BAC` -> `#7E6BA6` -> `#4A3E7A`, the quay and the iron `#1E1733` / `#150E26`, the bubble's
rim cream `#F7EDE3`. Round 4:
dusk plum `#17111F` / `#2B1E3A` / `#4D3354` (the ground and the vignette), the sun `#FFE9BE` -> `#F9B978` -> `#EC8A55`,
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

## Files
- Round 5: `video/brand/logo/make_logos_r5.py` (the sheet) and `marks_r5.py` (the city, the three variants, their
  one-colour versions); `svg/r5/`. Rebuild: `cd video/brand/logo && python3 make_logos_r5.py`.
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
- before 2026-10-29 19:48 UTC, to the orchestrator (relayed): "Again let's start with stills" and "No video yet" ->
  stills only: no animated logo (no end-card draw-on, no motion) until the owner has picked and approved a still.
- 2026-10-29 ~19:58 UTC, on round 3, to the orchestrator (relayed), just before the next line: "The fold is
  directionally good but way too abstract" (the orchestrator then asked for a Fold-only round 4: three variants, each
  more literal; that request reached this session at 20:05, after round 4 below was made; round 5's Talk of the Town
  carries the Fold, made concrete).
- 2026-10-29 ~19:58 UTC, on round 3, written to the logo session directly: "Nope from scratch I don't like none of
  them" and "More premium" -> round 4 from scratch: flat geometric icons read as stock, not premium; premium is the
  city posters' language (light, depth, atmosphere, craft), drawn as small emblems at dusk. The Fold, less abstract,
  is the next round if the owner's answer to round 4 points back to it.
- 2026-10-29 ~20:10 UTC, on round 4, written to the logo session directly: "I like the city view but it's too generic
  like why is it relevant to us" -> round 5: keep the city view (the posters' dusk, depth, lit windows) and make it
  ours: the city is what everyone's talking about, so each variant ties it to the talk, the fuss or the question.

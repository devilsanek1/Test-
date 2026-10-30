# captions2: the words on screen, played from a caption file

The type guide's system (`docs/look/TYPE_GUIDE.md`, PICKED 2026-10-30; `docs/look/type/PLEASANT.md`; positions in
`docs/look/LAYOUT.md` §1) as one Remotion component: the hand (Gaegu 300 / 400) for every spoken word, the lit hand
(Gaegu 700, bigger, lowercase, in the honey light with the golden glow on dark skies, plum with the warm halo on light
ones) for the stressed words and numbers, the seats, the builds, the bloom, never clipped. Built 2026-10-30 (video 4
production, lane A4). **Tested:** it draws R1, R2 and R6 pixel-identical to the approved type stills (same frame, same
moment: maximum difference 0) and R3 within a sub-pixel (the still rounded its comma's position); every word of the ten
test stills measures >= 4.5:1 (6.0-8.2:1, `capcheck.py --words`). Video 4's file: `public/v4/captions2.json`.

## Use it

```tsx
import {Captions2, WorldWord, type CaptionFile} from '../lib/captions2';
import captions from '../../public/v4/captions2.json';   // or load it in calculateMetadata (see demo/entry.tsx)

<AbsoluteFill>
  {/* the camera layer ... the "2027" tag's own art, and on it: */}
  {/*   <WorldWord item={captions.world[0]} cx={tagCx} cy={tagCy} width={280} rotate={3.5} />  (inside its SVG)   */}
  <Captions2 data={captions as unknown as CaptionFile} />   {/* last: screen space, above the camera */}
</AbsoluteFill>
```

The chain, from `video/`:

```bash
python3 scripts/captions2/build_captions.py scripts/captions2/v4_groups.txt     # the groups file -> public/v4/captions2.json
node scripts/captions2/render_test.mjs --times=0,3.6,24.7,40 --capcheck        # stills -> out/v4/captions2_test_*.png
python3 scripts/capcheck.py out/v4/captions2_test_capcheck.txt --captions=public/v4/captions2.json   # every word >= 4.5:1
```

Edit `scripts/captions2/v4_groups.txt` (one line per group: its recipe, seat, words, build points and stressed word),
never the JSON. A first draft for a new film: `build_captions.py --propose public/vN/voice_words.json --hints h.txt`.

## What it plays (TYPE_GUIDE §d, at the composition's fps; the guide's frames are at 60)

| event | how |
|---|---|
| **pop** | a piece appears whole, in place, in 1 frame, `lead` frames (2 at 60 fps) before its build chunk's first word: frame = floor((at - 2/60) x fps); `at` 0 = on screen at frame 0 (the hook) |
| **build** | a group's later chunks pop on their own words into slots laid out for the whole group at its start: nothing reflows, earlier words stay |
| **the lit hand's bloom** | the stressed word pops whole and its light comes on: the glow 0 -> full while it swells 0.96 -> 1.00 about its ink's baseline centre, over 8 frames, ease-out cubic (`1 - (1 - f/8)^3`: 2 of 8 frames = 58 %, the stills' numbers); its neighbours never move |
| **the halo** | running words on dark skies: the sky darkened (#141A3A) at 40 % over 0.22 em + 25 % over 0.06 em, no offset; light skies: none (`haloOnLight` adds white at 30 % over 0.22 em) |
| **the glow** | the lit hand on dark skies: honey #FFD58C, glow #FFB85C at 42 % over 0.34 em, dilated 0.04 em, over a dark halo (0.06 em, 30 %); on light skies: plum #3A2B48 with #FFD6A0 at 95 % over 0.34 em |
| **leave** | a group cuts out whole when the next pops (its `end`, never past the next group's first pop), or holds up to 36 frames past its last word into a pause; `leave: 'soft'` fades it over its last 3 frames (a sentence end before a pause >= 0.4 s); a row may leave early (`row.out`, R6's "the first line first") |
| **soft pop** | optional (`enter: 'soft'`, calm beats): opacity over 3 frames, scale 0.98 -> 1.00 over 6, ease-out cubic |
| **never** | a clip path, a mask, a slide, a roll, a write-on, two groups at once; filter regions are the ink plus 3 sigma, so no glow is ever cut |

## Components

**`<Captions2>`**: the film's captions, one group at a time, a full-frame SVG at (0, 0) (mount it outside the camera).

| prop | type | what |
|---|---|---|
| `data` | `CaptionFile` | the parsed file (preferred) |
| `src` | `string` | or a path under `public/` (`'v4/captions2.json'`), fetched once (delayRender) |
| `tone` | `'dark' \| 'light'` | override every group's sky tone (a light board: plum ink) |
| `mono` | `boolean` | the lit hand without colour or glow (size, weight and the swell still carry the stress): a monochrome board |
| `haloOnLight` | `boolean` | the light-sky halo, only where the field behind varies (default off, the guide) |
| `range` | `[from, to]` | only groups starting in [from, to) seconds (scene previews) |
| `debug` | `boolean` | draws the type frame, the band floor (y 585), the seats, the group's id |

Time is `useGlobalTime()` (the house's TimeProvider, else frame / fps), so it stays on the voice inside any `<Sequence>`.
Capcheck modes (input props): `{capcheck: 'mask'}` draws a black frame with each piece in `rgb(255, id x 8, tone x 40)`
(`CAPTIONS2_MASK`), `{capcheck: 'bg'}` draws nothing.

**`<WorldWord item cx cy width? rotate? from? to? always?>`** (R7): the word on its object, inside the camera layer's SVG
(it moves with the camera and its object). (cx, cy) is the object face's centre; the figures' ink is fitted to
`width - 44` (`item.objectWidth` by default: "2027" on the 280-px tag = Gaegu 700 at ~122 px), plum, tracking 0, no
halo; shown from `item.at` to `item.until` unless `from` / `to` / `always`. The tag's art (paper, pin, swing) is the
scene's. Hidden in the capcheck mask (checked on stills: it sits on paper, not on the sky).

**`<CoverTitle cover tone?>`** (R10): the cover's core line, fully lit, a full-frame SVG over the cover frame
(`captions.cover`: "Your chatbot / could **heat** / an apartment / in Helsinki.", the hand 112 px, "heat" 200 px).

Also exported: `GroupView` (one group at one frame, for still pages), `groupWindows(file, fps)` (every group's first
and end frame), `layoutGroup`, `measure`, `pieceShape`, `rowShape` (the layout, below), `useHandFonts` /
`loadHandFonts` / `handStack` / `HAND_FAMILY` (the font), `bloomAt(f)`, `useCaptionFile`, `captionRecipes`
(`recipes.json`), and the file's types (`types.ts`).

## The layout (`layout.ts`)

Measured in the browser that draws it, after the fonts load, exactly as `scripts/type/lib/type.js` measured the stills:
a canvas with `font = '<weight> <size>px Gaegu'` and `letterSpacing = track x size`; the advance includes the spacing,
the ink's right edge has the trailing spacing taken off. A seat group's rows are laid out with row i's ink starting
`step x i` px right of the group's left edge (or `row.dx`), and the group's ink box centred on its seat (L 440, C 520,
R 600); an anchored row puts its ink start / centre / end at `row.x`. Inside a row, each piece follows the previous at
its advance plus a word space in the previous piece's face (as one typed line), or `gap` px from the previous piece's
ink (R6's 0.48 em before "tea.", R9's 40 px before "heat"); a number's comma is tucked (0.02 em after the figures'
ink, the next figures 0.05 em after the comma's). `scripts/captions2/build_captions.py` runs the same rules on
Chromium-measured metrics for its checks; its `est` boxes match the rendered ink within 1-3 px.

## The caption file (`captions2/1`)

```jsonc
{ "format": "captions2/1", "film": "v4", "fps": 60, "lead": 2, "durationSec": 42.24,
  "words": "public/v4/voice_words.json", "groupsFile": "scripts/captions2/v4_groups.txt",
  "groups": [{
    "id": "g18", "recipe": "R4", "shot": "S7",       // "part": "last" on R9's last group
    "tone": "dark",                       // the SKY: dark = dusk / night, light = day (theme.ts CaptionTone is the other way round)
    "text": "But Helsinki / wants / that heat.",
    // a seat group also has "seat": "L" | "C" | "R" and "step" (its stagger, px)
    "stress": {"kind": "landing", "t": "wants", "piece": [1, 0]},   // landing (R4, R9) | lift (R5) | number (R3)
    "rows": [{"baseline": 362, "x": 130, "anchor": "start", "pieces": [
      {"t": "But", "words": [63], "s": 23.46, "e": 23.6, "at": 23.46,   // drawn text, voice word indices and times; at = its pop's word
       "style": "hand", "size": 116, "weight": 300, "track": 0.02, "lit": false}, ...]}, ...],
    "start": 23.4167, "end": 25.5,        // first pop and first frame gone (s, at 60 fps)
    "enter": "pop", "leave": "cut",
    "est": {"x0": 130, "x1": 920, "y0": 292, "y1": 583, "cx": 525} }],   // the builder's ink box
  "world": [{"id": "w1", "recipe": "R7", "t": "2027", "at": 27.4, "until": 29.02, "object": "...", "objectWidth": 280,
             "fitPad": 44, "ink": "#3A2B48", "weight": 700, "track": 0}],
  "cover": {"recipe": "R10", "tone": "dark", "text": "...", "rows": [...]},
  "checks": {"errors": [], "warnings": ["..."]} }
```

Pieces carry their resolved style (from `recipes.json`), so the file is what is drawn; `lit` pieces bloom; `tuck` marks
a number's comma; `gap` an ink gap. The numbers behind every recipe live in `recipes.json` (read by the component and
the builder: change a number there, never in code; the guide wins over it).

## The groups file and the builder (`scripts/captions2/build_captions.py`)

One line per group, `<recipe>[.part] [opts] | <words>` with rows split by ` / `; `+word` starts a build chunk (it and
the words after it pop on its time; no `+` = the group pops whole), `*word*` is the stressed word, `[70,000](seventy
thousand)` draws numerals for spoken words; headers `@words`, `@out`, `@tone`, `@key`, `@shot <name> <start>` (seats
walk within a shot), `@world R7 ...`, `@cover ...`; options `seat=L|C|R|auto`, `step=`, `x=` (anchored rows), `tone=`,
`enter=`, `leave=`, `out=`, `hold=`, `track=` (an exception, warned), `id=`. The full syntax is the script's docstring.
The builder aligns every word to the voice (each voice word once, in order, or it stops), resolves the recipe (R1 /
R5 / R8 seats; R2 the hook: 136 px, frame 0's rows at x 120 / 400; R3 the number at 482 over its unit at 578; R4 the
three-row lockup at 362 / 482 / 578; R6 at 400 / 570 with the big last word; R9 the lockup at 390 / 545 then
`R9.last` at 136 px on seat C), times it (the pops, `end` = the next group's pop or 36 frames past the last word,
`leave` soft at a sentence end before a pause >= 0.4 s), walks the free seats (L, R, C ..., never the same seat three
times running, the centre moving <= 220 px, the full stagger first), lifts a band row whose ink would dip below y 585,
and checks TYPE_GUIDE §f: ERRORS (exit 1) for ink outside the type frame (y 290-1250, x 96-944, x 96-860 below
y 840) or under the band floor, a line over 830 px, lockup rows under 20 px apart, two lit words in a group, three
groups over 20 cps in a row, frame 0 without the first words; WARNINGS for 2-4 words (5 in a lockup), <= 7 on
screen, >= 0.8 s, <= 20 cps, a built word >= 0.35 s on screen, a squeezed stagger, a tracking exception.

**Propose** (`--propose voice_words.json --hints h.txt`): a draft groups file from the guide's rules: groups of 2-4
words, >= 0.8 s, <= 20 cps, never across a sentence, a short phrase joining the next as a build, Netflix line breaks
(never a determiner, adjective or possessive from its noun, a pronoun or auxiliary from its verb; after punctuation and
before a conjunction or preposition preferred), one line when it fits; the recipes the words tell (R2 the first groups,
R3 a spoken number with its unit word, R4 a capitalised word in a short sentence, R9 the last sentence up to `@key`);
hints add the rest (`@r5 hot.`, `@r6 <phrase>`, `@r8 <t0>-<t1>`, `@shot`, `@keep data centers`: a phrase never
split). It has no grammar parser: review the draft by eye (`scripts/captions2/v4_hints.txt` drafts video 4's file
nearly as written; the hand file differs where judgement beat the rules).

## Checks and tests

- `node scripts/captions2/render_test.mjs [--times=..] [--src=..] [--bg=..|none] [--capcheck] [--debug]`: bundles only
  `demo/entry.tsx` (composition `Captions2Test`, 60 fps) with a scratch public dir (the fonts, the file, the
  background: `scripts/type/bg/bg_night.png` by default), renders the times to `out/v4/captions2_test_<t>.png` (+
  `_phone.jpg`), and with `--capcheck` the mask and bare passes and the list for capcheck. ~10 s for ten frames.
- `python3 scripts/capcheck.py <list> --words [--min=4.5] [--captions=<file>]`: every word's colour against the BARE
  frame's pixels 2-20 px from its own glyphs (the type stills' method); FAIL when more than 5 % is under 4.5:1. It
  switches to this mode by itself on a captions2 mask; the old SkyCaptions mode (3:1) is unchanged.
  `node scripts/capcheck.mjs <Comp> --times=.. --words --captions=..` renders a film's bare and mask frames for it.
- `node scripts/captions2/measure.mjs --verify`: the canvas metrics against the SVG text's rendered pixels (1-3 px).

## Video 4 (`public/v4/captions2.json`, from `scripts/captions2/v4_groups.txt`)

30 groups, 0 errors, 21 warnings. By shot: S1 R2 "Did you know / Helsinki" (frame 0, "Helsinki" builds at 0.600) ·
R2 "wants AI / to heat" (seat R) · R3 "70,000 / homes?" (2.300, blooming with the windows); S2 R1 C, L, R, C as the
guide walks them; S3 R5 "Those computers / get really **hot.**" (word by word, the lift at 10.167); S4 R1 x 3, R3
"40 / kettles," (15.017), R1; S5 R6 "That's a lot / of **tea.**" (18.583, with the mug); S6 R8 x 3 at seat C; S7 R4
"But Helsinki / **wants** / that heat." ("wants" at 24.000); S8 R1 x 2 and the R7 "2027" tag (27.40-29.02); S9-S11
R1; S12 R9 "So your chatbot / could soon **heat**" ("heat" at 39.933) then "an apartment / in Helsinki." (136 px,
held to frame 2515). The cover: R10. Calls and flags, for the G3 watch (each in the file's `checks`):
1. **The two lit words follow the take, not the guide's example frames:** "wants" pops at frame 1440 (the guide wrote
   1438) and "heat" at 2396 (the guide wrote 2394): both are 2 frames before the locked take's word (24.04 s, 39.98 s),
   the guide's own rule; its examples used earlier word times.
2. **"heat" is on screen 0.28 s before the last group replaces it** (the guide's R9 design gives it 0.32 s; §f.5 asks
   >= 0.35 s for a built word): "an apartment" must pop 2 frames before "an" (40.26 s). If the 1x watch finds "heat"
   too brief, the fix is a call for the owner (pop it on "soon", or hold the lockup a few frames past "an").
3. **S8 keeps the guide's merge "The city has / a plan to use it,"** (8 words on screen; §f.4 says <= 7): the
   2-group alternative runs 23.8 cps with a 0.73 s group.
4. **Three seat groups keep only the stagger the frame holds** (34-44 px instead of 80-140: "To put it / into
   perspective,", "just one of / these computers", "The city has / a plan to use it,"): their second lines are
   804-813 px.
5. **S11 sets tracking 0 on "Then pipes under / the streets"** (853 px at +0.02 em; the frame holds 848): the one
   exception to the hand's +0.02 em.
6. **Two line breaks follow Netflix over the guide's draft:** "out of / its computers", "into / people's homes."
   (never a determiner or possessive from its noun). "to blow that / heat outside." stays (the only break that fits).
7. Eight groups have 5 words outside a lockup (2-4 is the aim; the guide's own examples include five), and four run
   20.5-22.2 cps (S4
   "just one of / these computers", S10 "would take / the heat" and "out of / its computers", S11; the guide's §f.5
   flags S10's two), never three in a row.

## Notes for the other lanes

- **G3 (the monochrome board):** captions are "final" at G3 (`docs/G3_ANIMATIC.md`): mount `<Captions2 data=...>` over
  the board; on a light paper pass `tone="light"` (plum ink), and `mono` if the honey must go; it plays at any fps (the
  pops and blooms are recomputed from the voice times).
- **The old code is untouched:** `src/lib/Captions.tsx` (SkyCaptions), `font.ts` (`captionFontStack`: Patrick Hand),
  `theme.ts` (`skyCaption`, `captionTones`) still draw videos 1-3. For video 4 on, LAYOUT §1's "The code must match"
  (the hand, the seats, the tones, the lit hand, the bloom, capcheck at 4.5:1) is this module plus `capcheck.py
  --words`; `recipes.json` holds the guide's numbers in code.
- **The fonts:** `public/fonts/Gaegu-300.woff2`, `-400`, `-700` (latin, from `scripts/type/.fonts/gaegu/`), OFL 1.1:
  `public/fonts/Gaegu-OFL.txt`. "AI" reads "AI" (the capital I is barred).

## Files

| file | what |
|---|---|
| `Captions2.tsx` | the component, `WorldWord`, `CoverTitle`, `GroupView`, the timing and the drawing (halo, glow, bloom, mask) |
| `layout.ts` | the measure and the placement (seats, anchors, word spaces, gaps, the comma tuck) |
| `fonts.ts` | loads Gaegu 300 / 400 / 700 from `public/fonts/` and holds the render until it is in |
| `types.ts` | the caption file and the layout types |
| `recipes.json` | the guide's numbers: tones, styles, seats, the type frame, motion, recipes R1-R10 |
| `index.ts` | the exports |
| `demo/entry.tsx` | `Captions2Test`: the file over a still background (render_test.mjs) |
| `scripts/captions2/build_captions.py` | the builder (groups file -> caption file, the checks) and the proposer |
| `scripts/captions2/v4_groups.txt`, `v4_hints.txt` | video 4's groups (hand-reviewed) and the proposer's hints |
| `scripts/captions2/measure.mjs` | Chromium ink metrics for the builder (cached in `node_modules/.cache/captions2/`) |
| `scripts/captions2/render_test.mjs` | the test stills (+ mask and bare passes for capcheck) |

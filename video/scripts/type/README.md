# scripts/type: the still renderer for type and caption examples

Built for the type iteration (2026-10-30; `docs/look/type/BRIEF.md`). Renders 1080 x 1920 stills of words on our
frames, with a phone-size preview and a platform-UI overlay, so a recipe is judged the way a viewer meets it.

| File | What it does |
|---|---|
| `fonts.json` | the candidate fonts (@fontsource slugs: Google Fonts, OFL or Apache), grouped hand / script / display |
| `fetch_fonts.py` | downloads them into `.fonts/<slug>/` (latin woff2, metadata, licence; gitignored) and writes `.fonts/index.json`; `--list` prints each family's CSS name and weights; `python3 scripts/type/fetch_fonts.py <slug>` adds one (put it in fonts.json too) |
| `backgrounds.py` | makes `bg/bg_dusk.png` (the latest look still, scene-1 painter v6, with its burned-in caption painted out), `bg/bg_night.png` (the same re-graded to video 4's key: a cold blue snowy night, warm windows) and `bg/bg_night_cover.png` (the night frame shifted down 180 px, the cut leaves painted out, the sky extended above: a cover frame with more sky); stand-ins until video 4's art exists, never film assets |
| `render.mjs` | HTML page or JSON spec -> PNG at 1080 x 1920 (Node + the pre-installed Playwright); every cached font is declared, so CSS just names the family; `--phone` writes `<out>_phone.jpg` (360 px wide), `--ui` writes `<out>_ui.jpg` (a generic app UI over the frame at our zones: top y < 180, bottom y > 1520, right rail x > 950 at y 900-1500), `--zones` tints those zones red; `--mask` also writes `<out>_mask.png` (the words only: elements with class `ink`, white on black, no halo), `<out>_bare.png` (the words hidden) and `<out>_layout.json` (each word's ink box, from `lib/type.js`); a page that lays itself out in JS sets `window.__ready` and the renderer waits for it |
| `lib/type.js` | the type guide's system as an SVG layout helper for still pages: every word an SVG `<text>` placed by its BASELINE and its INK edge (start / centre / end, canvas-measured), the roles (`hand` = Gaegu, `brush` = Nanum Brush Script), the tones (night: warm white + the halo filter; light: umber), the accent, the seats (`TYPE.group`: a group's ink box centred on L 440 / C 520 / R 600, line 2 stepped right), a swell `scale`, `rotate`, a `parent` group (a word riding a tag, a masked write-on); `TYPE.run(fn)` loads the faces before measuring |
| `stills/` | the type stills' pages (`NN_<recipe>.html`, one per still in `TYPE_GUIDE.md` §h) and `render_all.sh [NN ...]`: renders them to `out/` (with `--phone --ui --mask`) and copies `NN_<recipe>.png` + `_ui.jpg` to `docs/look/type/stills/` |
| `check_stills.py` | the guide's §f numbers on each rendered still: every word's ink box, the type frame (y 290-1250; x 96-944, x 96-860 below y 840), the gap to the row above (column by column), and its contrast against the frame's own pixels within 20 px of its glyphs (>= 4.5:1 the hand, >= 3:1 the brush); taste stays with the phone look |
| `contact_sheet.py` | every still in `docs/look/type/stills/` at the 0.25 glance scale (270 x 480), 7 a row, labelled -> `contact_sheet.jpg` |

```bash
python3 scripts/type/fetch_fonts.py            # once per container (about 1 min)
python3 scripts/type/backgrounds.py            # once (about 15 s)
node scripts/type/render.mjs spec.json --phone --ui
node scripts/type/render.mjs page.html docs/look/type/stills/01_x.png --phone --ui --zones
bash scripts/type/stills/render_all.sh        # every still page -> out/ + docs/look/type/stills/ (about 1 min)
python3 scripts/type/check_stills.py          # the numbers (ink box, type frame, row gaps, contrast)
python3 scripts/type/contact_sheet.py         # docs/look/type/stills/contact_sheet.jpg
```

**HTML pages:** a 1080 x 1920 stage at 1x; `{{BG_DUSK}}`, `{{BG_NIGHT}}`, `{{BG_NIGHT_COVER}}`, `{{REPO}}` become file:// URLs. Anything
CSS or inline SVG can draw works: a two-baseline lockup, a word on an SVG path, a partly drawn write-on (a clip or a
stroke-dash on outlined text), a soft local shadow. **JSON specs:** see the header of `render.mjs` (text layers with
font, weight, size, tracking, colour, position by baseline, rotation, shadow; or raw HTML layers).

All run from `video/`. Phone check: open `<out>_phone.jpg` at 100 %: if a word doesn't read at a glance there, it
doesn't read on the phone.

# scripts/type: the still renderer for type and caption examples

Built for the type iteration (2026-10-30; `docs/look/type/BRIEF.md`). Renders 1080 x 1920 stills of words on our
frames, with a phone-size preview and a platform-UI overlay, so a recipe is judged the way a viewer meets it.

| File | What it does |
|---|---|
| `fonts.json` | the candidate fonts (@fontsource slugs: Google Fonts, OFL or Apache), grouped hand / script / display |
| `fetch_fonts.py` | downloads them into `.fonts/<slug>/` (latin woff2, metadata, licence; gitignored) and writes `.fonts/index.json`; `--list` prints each family's CSS name and weights; `python3 scripts/type/fetch_fonts.py <slug>` adds one (put it in fonts.json too) |
| `backgrounds.py` | makes `bg/bg_dusk.png` (the latest look still, scene-1 painter v6, with its burned-in caption painted out) and `bg/bg_night.png` (the same re-graded to video 4's key: a cold blue snowy night, warm windows); stand-ins until video 4's art exists, never film assets |
| `render.mjs` | HTML page or JSON spec -> PNG at 1080 x 1920 (Node + the pre-installed Playwright); every cached font is declared, so CSS just names the family; `--phone` writes `<out>_phone.jpg` (360 px wide), `--ui` writes `<out>_ui.jpg` (a generic app UI over the frame at our zones: top y < 180, bottom y > 1520, right rail x > 950 at y 900-1500), `--zones` tints those zones red |

```bash
python3 scripts/type/fetch_fonts.py            # once per container (about 1 min)
python3 scripts/type/backgrounds.py            # once (about 15 s)
node scripts/type/render.mjs spec.json --phone --ui
node scripts/type/render.mjs page.html docs/look/type/stills/01_x.png --phone --ui --zones
```

**HTML pages:** a 1080 x 1920 stage at 1x; `{{BG_DUSK}}`, `{{BG_NIGHT}}`, `{{REPO}}` become file:// URLs. Anything
CSS or inline SVG can draw works: a two-baseline lockup, a word on an SVG path, a partly drawn write-on (a clip or a
stroke-dash on outlined text), a soft local shadow. **JSON specs:** see the header of `render.mjs` (text layers with
font, weight, size, tracking, colour, position by baseline, rotation, shadow; or raw HTML layers).

All run from `video/`. Phone check: open `<out>_phone.jpg` at 100 %: if a word doesn't read at a glance there, it
doesn't read on the phone.

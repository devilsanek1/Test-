# captions2: the type guide's captions (WORK IN PROGRESS, lane A4, 2026-10-30)

Status: being built. The component plays `docs/look/TYPE_GUIDE.md`'s recipes R1-R10 from a caption file
(`public/v4/captions2.json`, written by `scripts/captions2/build_captions.py`). This page becomes the API reference
once the first test stills pass.

Planned:
- `Captions2` (screen space, never clipped): pops 2 frames before each word, builds word by word on the voice, the lit
  stress with its bloom (8 frames: the glow 0 -> full, the swell 0.96 -> 1.00), the halo, cut / soft out.
- `WorldWord` (R7, on the world layer), `CoverTitle` (R10).
- Fonts: `public/fonts/Gaegu-300/400/700.woff2` (OFL: `public/fonts/Gaegu-OFL.txt`).

# lib/sky.tsx: one continuous, gentle sky that survives video

The film-agnostic sky DIRECTION rules 5-6 and `docs/look/CRAFT.md` §g ask for (CRAFT wins over this page; why this
method and every measurement: `docs/look/research/2026-10-27_sky_gradients.md`). The owner, v2 G4: "why is it blue sky
and then suddenly abruptly orange, weird ... maybe when it comes to sky we can find a beautiful way to do a gentle
gradient ... find the pro way and tools to do it the best way you can". Opt-in: nothing changes until a film draws
`<Sky>`; v1 and v3 never import it.

**The sky is the ONE gradient in the look** (rule 5: everything else stays flat colour with the clean pen and gentle
light). It is one sky from the frame top to the horizon: the caption field flat through the caption band, eased into a
pale warm light band and the warm horizon, warmest round the low sun, the far haze its lowest colour, dithered so it
never bands.

**Layer order:** the sky is the set's bottom layer, inside the set's camera group (its dither moves with it), under
everything; unlit (CRAFT §d.9: never under a light layer); the clean pen never recolours it (raw SVG, no Ink / Fill).
The sun's DISC is the film's own flat shape on top; with the sky's warmth it needs no halo.

```tsx
import {eveningSky, horizonColor, Sky, skyProblems} from '../lib/sky';
export const S1_EVENING = eveningSky({band: CM.sky, horizon: '#FBD9BB', horizonY: 800, sun: {x: 196, y: 772, rx: 340}});
<Sky spec={S1_EVENING} />                                     // first in the set
const ATM = makeAtmosphere({name: 'canal', air: horizonColor(S1_EVENING, SUN0.x)});   // lib/depth's air (CRAFT §f.1)
skyProblems(S1_EVENING, {ink: CM.ink});                      // [] = OK (run it in the film's problems())
```

## API

| export | what |
|---|---|
| `eveningSky({band, horizon, horizonY, zenith?, light?, lightY?, captionBand?, top?, sun?, dither?, x?, width?, bottom?})` | the painters' evening sky as a `SkySpec`: a slightly deeper, cooler zenith (default OKLCH L -0.012, C +0.004, h +6) at `top` (-120) -> `band` flat through the caption band -> a pale warm LIGHT band at `lightY` (55 % of the way from the band's foot to `horizonY`; L max(band, horizon) + 0.022, C 0.014, the horizon's hue + 8; `false` = none) -> `horizon` at `horizonY`; the `sun`'s warmth defaults to the horizon colour warmer and richer (L -0.004, C +0.028, h -6), `ry` 0.45 x `rx` (`SUN_RY`: low and wide, hugging the horizon). |
| `<Sky spec>` | draws it: one isolated group of the eased gradient (dense `color(srgb ...)` stops), the radial warmth (smootherstep opacity stops in an ellipse), and the dither (two pattern layers, `plus-lighter` / `difference`) only where the sky varies (`ditherRects`). |
| `SkySpec` | `keys` (>= 2 `{y, color}`, colour hex or OKLCH `{l, c, h}`), `x` / `width` / `top` / `bottom` (default -120 / 1320 / min(-120, first key) / 2040: room for a camera float), `band` (default `CAPTION_BAND` {317, 556, maxDL 1.5}; `null` = none), `sun` `{x, y, color, rx, ry?, strength?}`, `dither` (default `DEFAULT_DITHER` {amp 2, grain 2}; `false` = Chrome's own only), `interp` ('eased' default, 'linear' for an A/B). |
| `skyColorAt(spec, y, x?)` | the colour `<Sky>` draws there (before the zero-mean dither), '#RRGGBB'; with `x`, the sun's warmth composited as the browser does. `skyRgbAt`, `skyLabAt`: the same as sRGB 0..1 / OKLab. |
| `horizonColor(spec, x?)` | THE FAR HAZE: the sky's lowest colour (its last key), with `x` warmed by the sun there. Pass it to `lib/depth`'s `makeAtmosphere({air})`; for per-plane airs take `skyColorAt(spec, yBehindPlane, x)`. |
| `skyCheck(spec, {ink?})`, `skyProblems(spec, {ink?})` | CRAFT §g's budgets: band dL* <= maxDL (CIE, the whole band area, warmth included), `ink` >= 7:1 on the band, the yellow-green crossing at C* <= 7 on the ramp AND where the sun's warmth crosses it (composited as drawn; pale light, never khaki or olive), no grey run (C* < 2.5) over 60 px; the guard's own actions come back as `note:` lines. |
| `skyStops`, `sunStops`, `skyModel`, `ditherRects` | the sampled stops (the fewest within 0.25 code of the curve, every key and band edge a stop), the resolved model (the guard applied), and where the dither goes. All cached by VALUE: a spec rebuilt every render costs nothing; keys that change every frame refit the stops (~90 ms a frame), so animate the sun, never the keys, inside a shot. |
| OKLab helpers | `hexToRgb`, `rgbToOklab`, `oklabToRgb`, `oklabToRgbInGamut` (keeps L and hue, lowers chroma), `oklabToHex`, `oklch`, `fromOklch`, `oklabToLch`, `lchToOklab`, `toOklab`, `mixOklab`, `mixSky(a, b, t)`, `deltaEOK`, `rgbToCieLab`, `contrastRgb`. Matrices: CSS Color 4's reference code (= Ottosson's to 1e-8). |
| dither helpers | `blueNoiseTile()` (the 64 x 64 void-and-cluster thresholds, `scripts/look/make_blue_noise.py`), `tpdfLevels(amp)`, `ditherPaths({amp, grain, offset})`. |

## The numbers (CRAFT §g; measured on the S1 demo)
- **Interpolation:** OKLab, a monotone cubic through the keys (C1, no overshoot, smoothstep at plateaus and turns).
  S1: 21 vertical stops + 23 radial ones.
- **The caption band** (317-556): exactly flat by default (its two keys are equal and both edges are stops); the guard
  pulls any keys inside it toward their mean until dL* <= `maxDL` (1.5) and shortens the warmth's `ry` so it never
  reaches the band. S1: dL* 0, ink 11.3:1.
- **The hue path:** the light band carries the cool-to-warm crossing at low chroma (S1: C* 5.9 at h 95-140, 6.2 where
  the sun's warmth crosses it; a 2-key OKLab ramp crosses at 13.2, a 2-stop sRGB one through khaki #DCDBC5).
- **The zenith:** dL* 1.3 at the key above the frame (~1.0 at the frame top). Deeper is richer but warned after a 2 Mbps
  re-encode at dL* 2.4.
- **The sun's warmth:** an ellipse (S1: 340 x 153, `ry` 0.45 `rx`) of the warm colour at smootherstep opacity,
  composited in sRGB like every SVG layer (`skyColorAt` predicts it within 0.02 alpha); S1's horizon under the sun
  #FDD6B8 (#FBD9BB away from it). Low and wide on purpose (sky critic, 2026-10-28): the first default (340 x 204) rose
  into the mint as a round blob, a glow disc in an open sky, and crossed yellow-green at C* 8.1 where it met the mint
  (the ramp alone: 5.9); at 0.45 the crossing is C* 6.2 and the warmth hugs the horizon like a painter's sunset glow.
  Where its top arc shows over a wide open sky, keep `ry` <= 0.45 `rx`.
- **The dither:** Chrome dithers every gradient by +-0.5 code (ordered); on top, the blue-noise texture: +-2 codes per
  channel, TPDF-shaped (sigma 0.87 codes, 0.28 L* rms on screen: invisible), 2 px per texel, R / G / B at three
  toroidal shifts of the tile, kept 2 codes clear of 0 and 255. 1 px is erased by x264 even at CRF 14; 2 px survives
  (staircase 0.02). Only where the sky VARIES (`ditherRects`: the ramps, full width, and the warmth's box): a flat
  caption band and the sky held behind the set cannot band and get none. Cost: ~50 ms per full-size frame in Chrome
  (the first, full-frame layers: ~85; no dither: 0). At `--scale=4/3` (the YouTube master) Chrome resamples it: sigma
  0.73 codes (1x: 0.96), still zero-mean, no moire; that master PASSes.
- **Determinism:** a pure function of the spec (no Math.random, no clock); byte-identical in two processes and in the
  default and angle GL paths; models, stops and the warmth's stops are cached by value.

## The master and the check
- Render masters with `node scripts/render-media.mjs <Comp> <out>.mp4 --entry=... --master` (PNG frames, one BT.709
  encode, x264 CRF 14 slow aq-mode 3, 8-bit yuv420p): Remotion's default JPEG q80 frames and the old TV-range second
  pass both band the sky (and the TV pass shifted its colour).
- Check stills and clips with `python3 -I scripts/qa/check_banding.py <png|mp4> --region <the sky's OPEN area>`
  (`--times` for a clip; the caption band `--band 317,556`): PASS / WARN / FAIL with the steps (trend-corrected, down
  and across the sky), the wide-strip staircase, the grain and the band's flatness. The region must be open sky: a pale
  flat cloud, a far tower or a roofline in it reads as a strong step (S1's open sky at 3.0 s: `0,560,250,712` the west
  gap's ramp, `400,0,1080,170` the zenith, `0,270,1080,560` the band; all PASS). The S1 demo master: PASS (staircase
  0.02, grain 0.29, band dL* 0.14).
- A platform's re-encode (simulated: x264 CRF 23 / 3.5 Mbps at 1080 and at 720, x265 CRF 28 / 1.5 Mbps, VP9 1.8 Mbps,
  SVT-AV1 CRF 40) leaves lib/sky PASS or WARN (isolated soft contours, at most 2 stair steps in a wide strip) where the
  plain gradient FAILs with a staircase (4-10): upload with the posting kit's highest-quality settings.

## S1 (`src/v2r/world/skies.ts` holds the spec)
Wired by L1 (2026-10-28): `<Sky spec={S1_EVENING} />` where `V2S1_sky`'s six flat steps were (inside the flood's growing
clip: a clip on the isolated group is fine), no halo, the far city's haze `S1_AIR` (= `horizonColor(S1_EVENING,
SUN0.x)`). Demo and A/B: `src/entry-v2r-sky.tsx` (`SkyDemo2R` props `variant: 'after' | 'before' | 'steps'`).

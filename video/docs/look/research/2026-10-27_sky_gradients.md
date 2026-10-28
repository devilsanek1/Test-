# A gentle sky that survives video: OKLab, eased stops, blue-noise dither, the master encode (research, 2026-10-27/28)

The sky engineer's lane for the owner's note on video 2's S1 look clip (a flat mint caption sky above, then abruptly a
peach band holding a big orange sun): "why is it blue sky and then suddenly abruptly orange, weird" -> "maybe when it
comes to sky we can find a beautiful way to do a gentle gradient" -> "I think it might make the sky much nicer" ->
"again find the pro way and tools to do it the best way you can". The rules it produced are the playbook's ONE
CONTINUOUS SKY and "Find the PRO way and the pro tools", DIRECTION rules 5-6, and now `CRAFT.md` §g.

**Rank:** research notes, the lowest rank (DIRECTION > CRAFT > PIPELINE_V2 > gate specs > look docs > these notes).
What became a rule is in `CRAFT.md` §g; the code is `src/lib/sky.tsx` (how-to `src/lib/SKY.md`). **Tags:** VERIFIED =
read from source code, the npm registry or a spec file, run here, or measured on our renders. REPORTED = from a web
search summary (page fetches to most hosts are blocked in this sandbox: bottosson.github.io, larsenwork.com and
momentsingraphics.de did not resolve; raw.githubusercontent.com, the npm registry and en.wikipedia.org did). PROPOSAL =
our own reasoning, not measured.

## 0. Bottom line

**The method (built, measured, adopted):**
1. **Key colours in OKLCH, mixed in OKLab** (Ottosson 2020, the CSS Color 4 matrices). A plain sRGB mix of the mint and
   the peach goes through khaki (#DCDBC5, C* 9.6 at h ~100); ANY straight mix of a cool and a warm colour, OKLab
   included, crosses yellow-green (a two-key OKLab ramp: C* 13.2 at h 95-140, VERIFIED). The painters' answer, adopted:
   cross through a **light, low-chroma warm band**, lighter than both ends (the sky's lightest band sits near the
   horizon): the crossing then happens at C* <= 6 and reads as light, never as khaki (S1: C* 5.9, VERIFIED).
2. **Eased, never linear:** one C1 curve through the keys (a monotone cubic, Fritsch-Carlson), sampled into the fewest
   SVG stops that stay within 0.25 of a code value of it, written as `color(srgb ...)` floats (Chrome keeps them at
   sub-code precision, VERIFIED). Every key and both caption-band edges are stops, so the band is exactly flat.
3. **The sun is part of the sky:** an elliptical warmth (340 x 204 in S1) with a smootherstep falloff, no edge and no
   disc; the disc stays a flat shape on top; the warmth never enters the caption band.
4. **Dither for the encoder, not for the screen:** Chrome already dithers every gradient by +-0.5 of a code (VERIFIED),
   which keeps the raw frame smooth and is the first thing any encoder throws away. On top: a static **blue-noise**
   texture (our own 64 x 64 void-and-cluster tile), +-2 code values per channel, TPDF-shaped, at a **2 px grain**, added
   exactly with `plus-lighter` / `difference` blends (zero-mean, VERIFIED). The grain size is the finding: a 1 px
   texture at +-1-3 codes is erased by x264 even at CRF 14 and the bands come back; at 2 px it survives (staircase 0.02,
   PASS). Invisible: 0.28 L* rms.
5. **The master encode (the controllable half):** PNG frames (Remotion's default frames are JPEG q80), Remotion's own
   BT.709 conversion in ONE encode (the documented second "TV-range" pass relabelled BT.601 as BT.709: dE76 up to 2.5,
   1.7 L* darker, and a second generation that bands), x264 CRF 14, preset slow, aq-mode 3, 8-bit yuv420p.
   `scripts/render-media.mjs --master`.
6. **The platforms (the uncontrollable half):** a simulated re-encode at CRF 20-28 leaves our sky 2-5 faint isolated
   contours per strip (c 0.024-0.033, 1.3-1.7x the JND) where a plain gradient leaves a dense staircase (staircase
   0.49-0.81 vs ours 0.22-0.47). Nothing inside an invisible dither beats a platform's quantiser; the upload checklist's
   highest-quality toggles and the 1440 x 2560 YouTube master are the remaining levers.

**The tools:** `src/lib/sky.tsx` (`<Sky>`, `eveningSky`, `skyColorAt`, `horizonColor`, `skyProblems`),
`scripts/qa/check_banding.py` (the profile / staircase check with CAMBI's JND), `scripts/look/make_blue_noise.py` (the
tile), `scripts/render-media.mjs --master`, the demo `src/entry-v2r-sky.tsx`, S1's sky `src/v2r/world/skies.ts`.

## 1. Perceptual interpolation: OKLab / OKLCH

- **Oklab** (Björn Ottosson, December 2020) is a perceptual space for image processing built for even blends: the same
  L, a, b layout as CIELAB, better hue linearity (CIELAB turns blues toward purple in blends), public domain; Oklab and
  Oklch are in CSS Color Level 4 and 5 and in every current browser [1][2][3]. REPORTED (Wikipedia, VERIFIED fetch).
- **The matrices** come from the W3C CSS Color 4 reference code `conversions.js` (exact rational sRGB -> XYZ, then
  Ottosson's XYZ -> LMS and LMS -> Oklab) [4]; multiplied out they match Ottosson's published linear-sRGB -> LMS matrix
  to 1e-8 (VERIFIED here in Python and TypeScript; #BCDCCF -> OKLCH 0.8675 / 0.0383 / 168.9 in both).
- **Why sRGB midpoints go muddy:** a straight line between two colours in gamma sRGB (or in any opponent space) runs
  close to the neutral axis when the hues are far apart: Erik Kennedy's "gray dead zone" [5][6]; Josh Comeau's fix is a
  hue path, Kennedy's tool curves the path or takes the long way round [6][7]. For our pair (mint h 168, peach h 69) the
  sRGB midpoint is #DCDBC5 (L* 87, C* 9.6, h ~100): pale khaki, exactly DIRECTION rule 6's "never olive, never beige"
  (VERIFIED). OKLab alone does not fix it: a 2-key OKLab ramp still crosses yellow-green at C* 13.2 (VERIFIED with
  `skyProblems`), the same conclusion `research/2026-10-27_effects_libraries.md` §4 reached for far planes.
- **The fix painters use** (§2): do not let blue meet yellow directly; put a light band (or a rosy one) between them.
  We route the mint through a pale warm light key (OKLCH L = max(band, horizon) + 0.022, C 0.014, the horizon's hue + 8):
  the ramp's yellow-green zone then peaks at C* 5.9 (S1), well inside "pale light" (the budget: <= 7).
- **Libraries vs our own code** (registry, VERIFIED 2026-10-28): `culori` 4.0.2 (MIT, 0 deps, 3.37 M downloads/week),
  `colorjs.io` 0.7.1 (MIT, 0 deps, 8.69 M/week, by the CSS Color spec editors), `chroma-js` 3.2.0 (BSD-3 / Apache-2.0,
  2.72 M/week): all three implement Oklab / OKLCH (grep of their packages: 17-58 files mention it), none dithers.
  Decision: our own ~70 lines in `lib/sky.tsx` (the exact CSS matrices, a chroma-reducing gamut map, CIE L* for the
  house measures), like the CIELAB code `lib/pen.ts` and `lib/light.tsx` already carry: no dependency, identical maths in
  every bundle, checked against Python. `culori` stays the first choice if we ever need CSS gamut mapping or dE2000 in TS.
- **Critique to remember:** OKLCH lightness does not predict contrast [8]: the caption contrast is checked as a WCAG
  ratio on the actual colours (`skyProblems`: ink 11.3:1 on S1's band), never inferred from L.
- **Chrome detail (VERIFIED, Chrome 153 headless shell):** `hex` and `rgb()` stops are rounded to whole codes (rgb(188.25)
  renders 188); `color(srgb r g b)` stops keep sub-code precision (a flat 188.25 renders as a 188 / 189 dither with mean
  188.25 exactly), and Chrome interpolates between `color()` stops in Oklab (CSS Color 4's default for non-legacy
  colours: the mint -> peach midpoint moved from [219.5 218.5 197] to [220.5 218.9 197.5]). With dense stops the in-between
  interpolation no longer matters; `skyStops` checks both straight-sRGB and straight-OKLab runs against the curve.

## 2. Eased gradients, and how illustrators paint an evening sky

- **Linear multi-stop gradients draw lines:** the colour's slope jumps at every stop and where a gradient meets a flat
  field; the eye's lateral inhibition draws a Mach band there. Andreas Larsen's "easing gradients" (CSS-Tricks;
  larsenwork.com; `postcss-easing-gradients` 3.0.1, MIT) place many stops on an easing curve so the gradient starts and
  ends without a visible edge [9][10]; Eric Meyer on why CSS colour-stop hints are not easing and the CSS WG request to
  add easing functions to colour stops (issue 1332, still open in 2025) [11][12]. REPORTED.
- **Ours:** a monotone cubic Hermite through the keys (Fritsch-Carlson / Fritsch-Butland slopes): C1 everywhere, no
  overshoot (a key's value is never exceeded, so the band guard is exact), and zero slope where a key is a plateau (the
  caption band) or a turn (the light band's peak): there it IS smoothstep easing. Sampled every 2 px, simplified to the
  fewest stops within 0.25 code (S1: 21 stops; the warmth: 23 radial stops).
- **The sky, as painters paint it:** deep at the zenith, lighter toward the horizon, warm or rosy along it (the
  International Artist piece on James Gurney's gradients) [13]; "skies are a major light source: paint them lighter than
  they appear" (Gurney) [14]; the blue fades toward the horizon because the light travels through more air (Clip Studio
  tutorials) [15]. Where blue meets yellow, a painter keeps them apart with a light or rosy band or a touch of red, or
  the seam goes green (Red Wombat Studio); others keep a natural yellow-green band; both agree that a direct wet mix goes
  muddy [16][17]. REPORTED. Our evening recipe (`eveningSky`): a slightly deeper, cooler zenith -> the caption field flat
  through the band -> lighter through a pale warm light band (the lightest of the sky, L* 91.6 in S1) -> the warm horizon
  (= the far haze) -> the warmth gathered round the low sun. Value control: the band stays one value (dL* <= 1.5) so the
  ink keeps its contrast.
- **How deep a zenith (measured, §5 table E):** a deeper zenith is richer, but a slow ramp over a big area is exactly
  where a platform's re-encode leaves soft contours: zeniths up to dL* 1.3 passed the master and every simulated rung,
  dL* 2.4 left 3 weak contours at the 2 Mbps rung. Default: OKLCH L -0.012 (dL* 1.3 at the key above the frame, ~1.0 at
  the frame's top edge).

## 3. Banding: why it happens, what Chrome does, the fixes

- **Why 8-bit skies band:** one code value of a light sky (L* 85) is ~0.38 L*, a luminance step c = dY/Y of ~1.3 %; a
  smooth 8-bit gradient is a staircase of such steps, at the edge of visibility on a calm display and over it on a phone
  at full brightness in the dark, worst where the gradient is slow (wide plateaus). Encoders make it worse: they quantise
  the low-amplitude texture away and merge levels into 2-code steps (c ~2.5 %).
- **The visibility threshold we use** is CAMBI's (Netflix's Contrast Aware Multiscale Banding Index, open-sourced in
  libvmaf in 2021; score 0 = none, ~5 "slightly annoying", 24 "unwatchable") [18][19][20]: a step is visible when its
  luminance change exceeds 1.9 % of the mean (`tvi_threshold` 0.019 on a BT.1886 display, `cambi.c`, VERIFIED by reading
  the source). A consequence (VERIFIED from `tvi_condition`): with the default `max_log_contrast` 2 CAMBI ignores 1-code
  8-bit steps above 10-bit luma ~573 (V ~0.58): a bright pastel sky scores ~0 even when it bands in 2-code steps; run it
  with `max_log_contrast=3` on such skies. Our ffmpeg builds have no libvmaf, and building it in this session was not
  permitted, so `check_banding.py` implements the profile / staircase measure with CAMBI's threshold plus a dE00 test for
  chroma bands (CAMBI reads luma only).
- **What Chrome does (VERIFIED, headless shell 153):** Skia dithers SVG gradients before writing 8 bits. CPU raster
  (render-media's default GL): an 8 x 8 ordered pattern of +-0.5 code (row-mean error vs the exact ramp rms 0.16 code);
  ANGLE / SwiftShader (`--gl=angle`, v2's renders): a row-alternating pattern (rms 0.31). Skia's dither is opt-in per
  paint and Blink requests it for gradients; Firefox did not dither (2022) [21][22][23]. REPORTED for the history,
  VERIFIED for today's output. The raw frame of a plain SVG gradient is therefore smooth (check_banding PASS, staircase
  0.00); the same gradient after x264 CRF 14 has a staircase of 0.45 (FAIL), because +-0.5 code is the first thing a
  DCT quantiser discards.
- **Dither theory:** noise must be added BEFORE quantisation to remove the error from the mean; noise added after only
  hides the steps (VERIFIED on synthetic ramps: quantise-then-noise keeps its steps, TPDF-before-quantise is smooth).
  Triangular-PDF noise keeps the error's variance even across levels (Mikkel Gjøl, Playdead, "Banding in Games: A Noisy
  Rant", GDC Europe 2016, slide 27, cited by Blender's dithering commit) [24][25][26]. Blue noise (Ulichney's
  void-and-cluster, SPIE 1913, 1993) has no low-frequency energy, so at the finest grain it reads as nothing and averages
  cleanly; Christoph Peters publishes free blue-noise tiles (widely reported as CC0), Alan Wolfe explains and codes
  void-and-cluster [27][28][29]. REPORTED. We generate our own 64 x 64 tile (sigma 1.5, seed 20261027,
  `scripts/look/make_blue_noise.py`, 4096 bytes embedded): flat histogram, radial power 0.000 below 0.125 cycles/px (white
  noise 0.88) (VERIFIED).
- **Our layering:** Chrome rasterises the gradient (dithered +-0.5 code, so its local mean is right to ~0.2-0.3 code),
  then our zero-mean texture is added exactly in 8 bits (`plus-lighter` adds the positive part, `difference` takes off the
  negative part: exact in the CPU, SwiftShader and ANGLE paths, VERIFIED), so the mean stays the curve's and the texture
  only has to survive the encoder. Colours are kept 2 codes clear of 0 and 255 so the texture never clips (a clipped
  dither shifts the mean). Per channel at three toroidal shifts of the tile (decorrelated R, G, B: luma and chroma both
  dithered).
- **The grain size is what survives (VERIFIED, §5 table A):** through x264 CRF 14 slow, 1 px blue noise at +-1, +-2 or
  +-3 codes still bands (staircase 0.16-0.17, 2-3 visible steps per strip); 2 px at +-2 or +-3 PASSes (0.01-0.02); 3 px
  and 4 px also pass (4 px at lower bitrate) but show more texture; +-1.5 at 2 px is borderline (WARN). A 1 px texture is
  the highest spatial frequency, the first thing the transform's quantiser drops; 2 px puts its energy where x264 keeps
  it. Visible amplitude: 0.28 L* rms (the check's "grain"), invisible at 1:1 on a phone (eye check: the 4x crops in
  `2026-10-27_sky_gradients.jpg` show it, the 1:1 frames do not). Static, so the encoder codes it once per GOP and P
  frames copy it; it moves with the sky (inside the camera group), so it never sits on the screen like dust.
- **x264 knobs (VERIFIED, table B; REPORTED forum lore [30][31]):** CRF 10 and 14 PASS, 18 FAILs; slow = medium at
  CRF 14; aq-mode 3 (auto-variance with a dark bias, the anime-encoding community's banding setting) = default here and
  kept for darker, flatter skies; tune animation (stronger deblock, lower psy) and tune grain smear the 2 px texture
  (WARN); zscale error diffusion: no gain over a dithered source; **10-bit (High 10)** PASSes even a 1 px dither and a
  plain gradient (WARN), but High 10 H.264 does not play on most phones' hardware decoders and every platform re-encodes
  to 8-bit anyway: kept out of the master.
- **The master path's two bugs (VERIFIED):** (1) Remotion 4.0.538's video frames default to JPEG at quality 80
  (`DEFAULT_VIDEO_IMAGE_FORMAT 'jpeg'`, `DEFAULT_JPEG_QUALITY 80` in `@remotion/renderer`): 4:2:0, blocky, it halves the
  texture (grain 0.28 -> 0.14) and bands the sky (FAIL, 4 strong steps); its option docs themselves say to use PNG "for
  best color accuracy". (2) The TV-range pass in the handoff (`scale=in_range=full:out_range=tv` + `-colorspace bt709`)
  re-encodes Remotion's BT.601 (`yuvj420p`, `bt470bg`) file and only relabels it BT.709: players decode the mint band 1.7
  L* darker (dE76 2.5) and the second generation bands harder (c 0.041). Remotion's `colorSpace: 'bt709'` converts with
  zscale to limited-range BT.709 and tags it in one encode: the master matches the lossless still to dE76 0.30 median /
  0.77 p99 (VERIFIED).
- **Platforms (REPORTED [32]-[36]):** no platform publishes its ladder; creator guides suggest 8-12 Mbps uploads,
  report TikTok's re-encode banding in shadows, and a (third-party) report that Instagram serves lower-quality encodes to
  low-view videos. We simulated four rungs on our masters (x264 medium CRF 20 / 5 Mbps cap, CRF 23 / 3.5 Mbps, CRF 28 /
  2 Mbps, x265 CRF 28 / 2.5 Mbps): §5 tables A and D. The platform's quantiser turns slow gradients into 2-code steps
  whatever invisible texture we add (4 px block-aligned grain, +-3 codes: no better); the dithered sky keeps them as
  isolated soft contours (often a single line where the gradient leaves the flat band, y ~589 in S1), the plain gradient
  as a dense staircase.

## 4. A sun in a flat sky

- The disc is a flat shape (the film's, drawn on top); the warmth is part of the sky, below everything: brightest and
  warmest round the low sun, spread along the horizon (wider than tall), gone at its rim with a smootherstep (C2: no
  edge, no ring), never in the caption band (the guard shortens it). PROPOSAL from §2's painting practice and DIRECTION
  rule 5 (light shown on what it hits, never a glow disc; a halo is one step <= 1.7x, or none): with the warmth, S1 needs
  no halo.
- It composites the way SVG does (a constant warm colour at the smootherstep alpha, sRGB "over"), and `skyColorAt`
  predicts exactly that (rendered vs predicted alpha within 0.02, VERIFIED; an OKLab-mixed prediction was 7 codes off).
- The far haze takes the sky's lowest colour: `horizonColor(sky)` (S1 #FBD9BB), or under the sun `horizonColor(sky,
  x)` (S1's west gap at SUN0.x: #FDD5B8), the air of lib/depth's `makeAtmosphere` (CRAFT §f.1).

## 5. Measurements (VERIFIED; `scripts/qa/check_banding.py`, final verdict rules; demo `SkyDemo2R`)

Columns: verdict, the most visible steps in one 64 px strip, strong steps (over 2x the JND), the largest step's
luminance contrast c and dE00, the staircase share, the texture's rms (L*), the clip's bitrate (3 s, static).

**A. The texture, pure sky (`scene: false`), region 0,0,1080,1000** (master = PNG -> zscale BT.709 -> x264 CRF 14 slow):

| texture | master | P35 (CRF 23, 3.5M) | P20 (CRF 28, 2M) | H25 (x265 CRF 28) |
|---|---|---|---|---|
| plain 2-stop (Chrome +-0.5 only) | FAIL 5 / 0, stair 0.45 | FAIL 7, 0.80 | FAIL 4, 0.81 | FAIL 4, 0.49 |
| eased OKLab, no texture | WARN 2, 0.19 | FAIL 3, 0.28 | FAIL 5, 0.40 | FAIL 7, 0.45 |
| +-1 code, 1 px | FAIL 3, 0.17 | FAIL 5, 0.32 | WARN 2, 0.31 | FAIL 5, 0.36 |
| +-2, 1 px | FAIL 3, 0.17 | FAIL 4, 0.34 | FAIL 5, 0.50 | FAIL 8, 0.39 |
| +-3, 1 px | WARN 2, 0.16 | FAIL 5, 0.35 | FAIL 4, 0.44 | FAIL 4, 0.34 |
| +-1.5, 2 px | WARN 1, 0.03 | FAIL 5, 0.38 | FAIL 3, 0.39 | FAIL 7, 0.39 |
| **+-2, 2 px (default)** | **PASS 0, 0.02, grain 0.28, 1.0 Mbps** | FAIL 3, 0.35 | FAIL 3, 0.40 | FAIL 5, 0.35 |
| +-3, 2 px | PASS 0, 0.01, grain 0.36 | FAIL 6, 0.33 | FAIL 5, 0.47 | FAIL 5, 0.33 |
| +-2, 3 px | PASS 0, 0.02 | FAIL 4, 0.33 | FAIL 4, 0.41 | FAIL 4, 0.24 |
| +-3, 3 px | PASS 0, 0.01, grain 0.37 | FAIL 3, 0.22 | FAIL 4, 0.42 | FAIL 3, 0.27 |
| +-2, 4 px | PASS 0, 0.02, 0.6 Mbps | FAIL 3, 0.31 | FAIL 7, 0.42 | FAIL 3, 0.22 |

**B. The master encoder on the default texture (+-2, 2 px)**: CRF 10 slow PASS (0.01); CRF 14 slow PASS (0.02); CRF 14
medium PASS (0.03); CRF 14 slow aq-mode 3 PASS (0.02); zscale error diffusion PASS (0.01); High 10 PASS (0.04); tune
animation WARN 1 (0.06); tune grain WARN 1 (0.05); CRF 18 slow FAIL 3 (0.13). The same on a 1 px texture: only High 10
PASSes. A plain gradient: FAIL at every 8-bit setting (0.37-0.57), WARN in High 10.

**C. Today's path vs the new master (the same +-2, 2 px sky):** Remotion default (JPEG q80 frames, CRF 14 medium,
BT.601 full range) FAIL 2 + 4 strong, stair 0.21, grain 0.14; + the old TV-range pass FAIL 4 + 3 strong, c 0.041, the
band 1.7 L* dark; `--master` PASS 0, 0.02, grain 0.28, dE76 to the lossless still 0.30 median / 0.77 p99.

**D. The S1-like scene through `render-media.mjs --master` (GL angle), regions west gap 0,0,330,712 / top 330,0,1080,598**
(P50 = x264 CRF 20 / 5 Mbps cap):

| | master | P50 | P35 | P20 | H25 |
|---|---|---|---|---|---|
| S1's six flat steps + halo (2026-10-27) | FAIL / FAIL (dE00 8.5, 5.9: strong) | FAIL / PASS | FAIL / PASS | FAIL / PASS | FAIL / PASS |
| plain 2-stop | FAIL (stair 0.45) / PASS | FAIL / PASS | WARN (0.75) / PASS | WARN (0.85) / WARN | FAIL / WARN |
| **lib/sky** | **PASS (0.02) / PASS (0.05)** | WARN 1 / PASS | WARN 1 / WARN 1 | FAIL 3 / WARN | FAIL 2 + 1 strong / WARN |
| lib/sky, camera drifting 6 px | WARN 1 (0.09) / PASS | WARN 1 / PASS | WARN 1 / WARN 1 | FAIL 3 / WARN 2 | FAIL / WARN |
| plain 2-stop, drifting | FAIL / PASS | FAIL / WARN | FAIL / PASS | FAIL / WARN | FAIL / WARN |

(The steps' own top rows PASS after a re-encode only because the platform smooths them into its own blocks; their
west gap keeps the flat steps by design.)

**E. The zenith, pure sky, region 0,0,1080,317 (master CRF 14 slow aq-mode 3, then P35 / P20 / H25):** zenith dL* 0
(flat), 0.7 and **1.3 (default)**: PASS in the master and every rung (at most 1 weak step); dL* 2.4: PASS / PASS / WARN
(3 weak) / PASS.

**F. Raw renders (no encode), west gap:** six flat steps FAIL (27 strong, dE00 5.7, staircase 0.97); plain 2-stop PASS
(0.00); lib/sky PASS (0.01, grain 0.27, band dL* 0.11). Cost: the dither adds ~80-95 ms per full-size frame in Chrome
(136 vs 40-61 ms with concurrency 3) and ~1 Mbps to a static master.

## 6. What became rules and code
- `CRAFT.md` §g (the numbers, the code, the check); DIRECTION rule 6 links it; `PIPELINE_V2.md` puts `check_banding.py`
  in the G4 and G8 checks and `render-media.mjs --master` in "Master encode"; `POSTING_KIT.md`'s export line and the
  handoff's command point to `--master` (the TV-range pass is retired).
- Open: CAMBI itself (libvmaf, `max_log_contrast=3`) as a second opinion when a build with libvmaf is available; a
  per-film decision on the 1440 x 2560 YouTube master (already in the posting kit).

## 7. Sources
[1] Oklab color space, Wikipedia: https://en.wikipedia.org/wiki/Oklab_color_space (VERIFIED fetch) ·
[2] Ottosson, "A perceptual color space for image processing" (2020): https://bottosson.github.io/posts/oklab/ (blocked here) ·
[3] Smashing Magazine, interview with Björn Ottosson (2024): https://smashingmagazine.com/2024/10/interview-bjorn-ottosson-creator-oklab-color-space/ ·
[4] W3C csswg-drafts, css-color-4/conversions.js: https://raw.githubusercontent.com/w3c/csswg-drafts/main/css-color-4/conversions.js (VERIFIED) and https://www.w3.org/TR/css-color-4/ ·
[5] CSS-Tricks, "The Gray Dead Zone of Gradients": https://css-tricks.com/the-gray-dead-zone-of-gradients/ ·
[6] Josh W. Comeau, "Make Beautiful Gradients": https://www.joshwcomeau.com/css/make-beautiful-gradients/ ·
[7] Learn UI Design gradient generator: https://learnui.design/tools/gradient-generator.html ·
[8] "Stop using OKLCH lightness for your color scale", UX Collective: https://uxdesign.cc/stop-using-oklch-lightness-for-your-color-scale-02025deca49d ·
[9] Andreas Larsen, "Easing Linear Gradients", CSS-Tricks: https://css-tricks.com/easing-linear-gradients/ ·
[10] larsenwork easing gradients: https://larsenwork.com/easing-gradients (blocked here); postcss-easing-gradients 3.0.1 (npm, VERIFIED) ·
[11] Eric Meyer, "Color Easing Isn't Always Easy" (2019): https://meyerweb.com/eric/thoughts/2019/04/25/color-easing-isnt-always-easy/ ·
[12] CSS WG issue 1332, easing functions on colour stops: https://github.com/w3c/csswg-drafts/issues/1332 ·
[13] International Artist, "How to Make Gradients" (James Gurney): https://www.internationalartist.com/issues/142/How-to-Make-Gradients ·
[14] James Gurney, "Pro Tip: Painting Luminous Skies": https://jamesgurney.substack.com/p/pro-tip-painting-luminous-skies ·
[15] Clip Studio Tips, "Painting a Clear Blue Sky": https://tips.clip-studio.com/en-us/articles/3513 ·
[16] Red Wombat Studio, "Gradients in the Sky with Diamonds": https://redwombatstudio.com/2003/12/17/gradients-in-the-sky-with-diamonds/ ·
[17] gamedev.net, colour interpolation between orange and blue: https://gamedev.net/forums/topic/691498-color-interpolation-between-orange-and-blue/5353389/ ·
[18] Netflix Tech Blog, "CAMBI, a banding artifact detector": https://netflixtechblog.medium.com/cambi-a-banding-artifact-detector-96777ae12fe2 ·
[19] Netflix vmaf, resource/doc/cambi.md and libvmaf/src/feature/cambi.c: https://github.com/Netflix/vmaf (VERIFIED read of a clone) ·
[20] Tandon et al., CAMBI (PCS 2021): https://arxiv.org/pdf/2102.00079; "Banding vs. Quality" (2022): https://arxiv.org/pdf/2202.11038 ·
[21] Skia issues on gradient dithering: https://issues.skia.org/40036877 , https://issues.skia.org/issues/40037425 ·
[22] Flutter breaking change, paint.enableDithering: https://docs.flutter.dev/release/breaking-changes/paint-enableDithering.html ·
[23] www-style thread (2016) and the CSS WG proposal to require gradient dithering (2022): https://lists.w3.org/Archives/Public/www-style/2016Feb/0172.html , https://lists.w3.org/Archives/Public/public-css-archive/2022Jan/0223.html ·
[24] Playdead, INSIDE presentations (Gjøl, "Banding in Games: A Noisy Rant"): https://blog.playdead.com/articles/inside_presentations/inside_publications.html ·
[25] Blender commit "ColorManagement: Dithering Improvement" (triangular noise, citing slide 27): https://lists.blender.org/pipermail/bf-blender-cvs/2020-February/135857.html ·
[26] Anisoptera Games, "How to fix color banding with dithering": https://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/ ·
[27] R. Ulichney, "The void-and-cluster method for dither array generation", Proc. SPIE 1913 (1993) ·
[28] Alan Wolfe, "Generating Blue Noise Textures With Void And Cluster": https://blog.demofox.org/2019/06/25/generating-blue-noise-textures-with-void-and-cluster/ ; "Not All Blue Noise is Created Equal": https://blog.demofox.org/2018/08/12/not-all-blue-noise-is-created-equal/ ·
[29] Christoph Peters, free blue noise textures: https://momentsingraphics.de/BlueNoise.html (blocked here) ·
[30] Doom9 forum, x264 settings for banding: https://forum.doom9.org/archive/index.php/t-184972.html ·
[31] VideoHelp forum, aq-mode / psy-rd / tune grain: https://forum.videohelp.com/showthread.php?p=2348980 ·
[32] ClipSpeed, resolution guide for Shorts, Reels and TikTok: https://www.clipspeed.ai/blog/video-resolution-guide-shorts-reels-tiktok.html ·
[33] ClipSpeed, high-quality TikTok uploads: https://www.clipspeed.ai/blog/high-quality-tiktok-uploads.html ·
[34] Visnalize, Instagram media specs and compression: https://visnalize.com/blog/instagram-media-specs-compression-guide ·
[35] Lilach Bullock, Instagram Reels blurry after uploading: https://www.lilachbullock.com/instagram-reels-blurry-after-uploading/ ·
[36] The Post Flow, export settings for YouTube, Instagram, TikTok: https://thepostflow.com/post-production/post-production-workflows/export-settings-youtube-instagram-tiktok/ ·
[37] Remotion 4.0.538 `@remotion/renderer` (node_modules: image-format.js, jpeg-quality.js, ffmpeg-args.js, options/color-space.js, prespawn-ffmpeg.js; VERIFIED) and https://www.remotion.dev/docs/renderer/render-media

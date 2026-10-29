# lib/light.tsx: light and shadow for every film

The film-agnostic light module DIRECTION rule 5 and `docs/look/CRAFT.md` §d ask for (CRAFT wins over this page). It is
ported from v3's opt-in first version (`src/v3/film/kit/Light.tsx`, which v3 keeps for itself); every new film takes
its light from here and never from another film's folder. Opt-in: nothing draws outside a `<Lit rig>`, and the input prop
`{"lightOff": true}` switches every light layer of any composition off (the A side of `scripts/qa/check_light.py`).

**Everything is a flat shape.** A shadow is a flat shape MULTIPLIED with the set's one tint family (so every surface
turns darker and hue-shifted by itself: never grey, never a hand-picked fill; shadows in one layer never double-darken).
A light is a flat step LIGHTER and WARMER than what it lands on (a pool, a spill, a rim), never a glow disc. A soft edge
is two flat steps (a half-tint band): no blur, gradient or opacity fade. Every light shape is a clean-pen backdrop
(never recoloured by an attention tier), exact (no misregistration) and pops in one frame.

**Layer order** (bottom to top): the set's fills -> ground light (`LightPool`, `WindowSpill`; `Halo` right after the sky)
-> ground shadows (`ShadowLayer`: `ContactShadow`, `CastShadow`, `Shadow`) -> the objects -> `FormShade` / `Shade` per
object -> `Ambient` (interiors at night: LAST over the set) -> `Rim`, `PoolLift`, `SourceCore`. Captions are the Film's:
never lit. Geometry is canvas px at camera rest: put the layers in the same camera group as the set. Screen angles:
0 right, 90 down (toward us on a ground), 180 left, 270 up (away).

## API

| export | what |
|---|---|
| `makeRig({name, key, tints, pool, surface, ...})` | ONE rig per set (CRAFT §d.1). Defaults: no practicals, `ground` 0.3 (ry / rx), cast `cap` 1.5 h (lamp) / 1.0 h (sun), `rim` = the pool's core, `lift` `POOL_LIFT` #4A2E10, window pane L* 88, spill +4 L*, source L* 96.5, `form.frac` 0.32, soft edges contact 3.5 / cast 2-12 / hole 12 / wash 26 px; optional `lamps`, `fill`, `groundAmbient`, `skyCap`, `windowOff`, `wash`. `withKey(rig, key, lamps)` copies it with a shot's own geometry. |
| keys | `sunLight({toward or from, el})` (parallel shadows: `toward` = where they fall on screen, `el` = elevation, length h / tan(el), capped); `{kind: 'point', src, foot, H, pool}` (a lamp: shadows radiate from `foot`, live only in its `pool`; `streetLamp(src, base)`, `poolUnder(mouth, groundY)`); `{kind: 'sky', from}` (blue hour: tops lit, contact shadows only). |
| `tintFamily(base, {form, cast, contact}, ambient)` | the set's ONE shadow family: three strengths of one hue (`step(tint, k)` = a partial strength; the half step is the penumbra). |
| `Lit`, `useRig`, `useLightOff` | the rig for a set (`off` = the A side; outside any `Lit` everything is off). |
| `ShadowLayer` | one isolated `mix-blend-mode: multiply` group for a ground's shadows (`exclude` keeps already-drawn objects clear). |
| `ContactShadow` | `x y w` (+ `h`, `k`, `d`, `away`, `soft`, `tint`): the strip where a thing touches a surface. |
| `CastShadow` | `x y w` or `pts` (the footprint), `h`: the footprint swept along the light (`castVector`); inside a lamp's pool each pool step gets its own tint (`poolCastTints`); a sun's are parallel; sky: none. |
| `Shadow`, `dropOffset` | any shape (a drop shadow on a wall, an eave's strip, an off-screen building's shade), `dx dy`, `clip`, `soft`. |
| `FormShade` | `of` (the SAME element you drew) or `d`, `c` + `size`, `frac`, `kind` 'band' / 'crescent': one flat step on the side away from the key. |
| `Shade` | a whole plane one step down (a facade turned from the sun, an underside). |
| per tier (opt-in, 2026-10-29: CRAFT §d.3, the subject's shade face -20 to -25 L*, B and C -7 to -12) | `withTierForm(rig, base, k?)` gives a rig its tint family's `shadeBase` and `tierForm` (`TIER_FORM_K`: subject 0.56, the A vs B picture's B; support and environment 0.20, v2's); `FormShade` / `Shade` then take `tier` (default: the tier scope they sit in), `strength` (an explicit k of the base) and `base` (an object's own family: the cool one on a cool surface, `familyFor(surface, warm, cool)`). `formTint(rig, {tier, strength, tint, base})` the tint; `formStepOf(surface, base, k)` its dL*; `tierFormFor(surface, base, -22)` the k for a target (CM.shadeWarm at 0.56: stucco -27, brick -18; stucco at -22 is k 0.46); `TIER_UNDER_K` (subject 0.66) for undersides. A rig without `tierForm` and a FormShade without these props: exactly as before. No outlines: `lib/pen` `setPen('clean', {outlines: false})` (`setOutlines`). |
| `Ambient`, `LightHole`, `washHole` | one step down outside the light, with holes for the lit zones, the lit objects and every source (night interiors). |
| `LightPool`, `poolSteps` | a lamp's pool: two opaque steps, the core toward the source. |
| `LitWindow`, `WindowSpill`, `Halo`, `SourceCore` | a lit pane (L* 85-92), its trapezoid on the ground, one halo step on the sky (r <= 1.7x), a source's core (L* 95-98). |
| `PoolLift`, `Rim` | lift a warm object standing in a pool (screen #4A2E10); the subject's lit edge (4-6 px inside, key side only). |
| helpers | colour: `lab`, `lch`, `fromLch`, `multiply`, `screen`, `mixHex`, `step`, `tintFor`, `relit`; geometry: `ellipseD`, `polyD`, `rectD`, `ellipsePts`, `hull`, `inEllipse`; light: `lightAt`, `groundDir`, `castVector`, `lightDir`, `groundAmbientOf`; check: `lightProblems(rig, surfaces, {ground})`. |

## The CRAFT §d numbers it implements

| CRAFT §d | in the code |
|---|---|
| 1. one rig per set; a lamp's shadows radiate from the point under it, a sun's are parallel; sky light gives tops and contact shadows only | `makeRig`, `PointLight.foot`, `SunLight.toward`, `SkyLight`; `lightAt` picks the practical whose pool holds a spot |
| 2. light is lighter than what it lights; pool core 92-94, ring 88-91; lit windows 85-92; sources 95-98; caps 87-89 under the pool core | `LightPool` (two steps), `LitWindow`, `SourceCore`; `lightProblems` checks pools >= ground + 4, windows 85-92, sources >= 95, caps |
| 3. a shadow is its surface x ONE tint family: form dL* -7..-12, cast -10..-15, contact -15..-25; warm surfaces keep >= 0.95x chroma | `tintFamily` + multiply layers; `lightProblems` flags a family over 6 deg of hue, C* < 8 (grey) or L* < 35 off an anchor-dark surface |
| 4. form shadow on the side away from the key, 25-40 % of the width, one hard step; a crescent on round things | `FormShade` (`frac` default 0.32, `kind` band / crescent; backlit rigs shade from below) |
| 5. cast = the footprint swept along the light: a sun 0.3-0.8 h; a lamp h·d / (H - h) capped at 1.5 h, only in its pool; flattened by the ground; sharp at the base, a 10-14 px half-tint at the tip | `castVector`, `CastShadow` (`rig.cap`, `rig.ground`, `soft` [2, 12]) |
| 6. contact under everything that touches a surface: 1.05-1.15x the footprint (1.1-1.3x a stance), 6-12 px tall (16 a vehicle), 3-4 px away from the key, a 3-4 px half-tint | `ContactShadow` (`k` 1.1, `h` clamp(0.09 w, 6, 12), `away` 3.5, `soft` 3.5) |
| 7. pools centred under the mouth, rx 2.5-3.5x its half-width, ry/rx = the ground; two flat steps; a window spill widening 1.3-1.6x, 0.6-1x the window's height, +4 L*; warm objects in a pool +6..+11 L*; a halo <= 1.7x or none | `poolUnder` (k 3.2), `poolSteps`, `WindowSpill` (1.45, 0.7), `PoolLift` (#4A2E10), `Halo` (capped 1.7x) |
| 8. rim only on the subject, 4-6 px inside the silhouette along 25-50 % of the outline on the key side | `Rim` (`width` 5, `cover`) |
| 9. unlit: the sky, sources, cards, screens, captions; one value across the caption band | nothing draws outside `Lit`; `lightProblems` flags a hole edge in the band |
| 10. how much (night interior 20-30 % lit / 45-60 ambient / 10-20 shadow; day 20-30 % shade and cast) | reported by `check_light.py` (never a quota) |
| Code: shapes, not blur; one isolated multiply group after the fills, before the ink | `ShadowLayer` / the internal `Multiply`; soft edges are `step(tint, 0.5)` bands |

## The gate and the demo

`scripts/qa/check_light.py` on an A/B of the same frame (A with `--props='{"lightOff":true}'`). The v2r demo
(`src/entry-v2r-light.tsx`: `LightDemo2R`, a towpath at golden hour with her, Pip, a bench, a lamp and a narrowboat under
the evening sun; `LightRig2R`, the rig's `lightProblems` + the pen's `penProblems`) passes: the brightest 5 % centred
0.02 H from her, no greyed or too-dark shadow pixel past 0.05 %, one value across the caption band, shade and cast 26 %
of the frame (CRAFT day 20-30); 0 rig problems. Its canal family is the palette's own shadow colour, CM.shadeWarm at
0.20 / 0.28 / 0.48: on the paving form / cast / contact dL* -9 / -13 / -22, chroma kept, 11-29 deg toward rose; on the
water the hue turns toward violet (no contact strips on water: they grey).

## Learned on v3 (keep)

Never stack an `Ambient` on a tiered outside (the clean pen's environment tier already calms it); a lamp in front of a
window must not get a wall wash (its edge reads as the window glowing); the pool hole is hard (a soft band reads as a
target); a rim limited by a half-plane stops abruptly on a box (boxes take the moved copy's key-facing sides whole); a
pool must sit on CRAFT's ladder (88 / 93) or the brightest 5 % lands elsewhere; a violet multiply on a warm light greys
it (pick the family on the surfaces it lands on); inside a pool a shadow never ends darker than the unlit ground past
its edge (`poolCastTints`); a halo on a lighter sky band takes its step from that band (`Halo on`); kit pieces drawn
with raw SVG that ignore `Look` (a mascot's paths) cannot give a silhouette (`of`): give them contact and cast shadows
only. Cost: masks and blend groups are the expensive part; use `d` where a path exists and one `ShadowLayer` per ground.

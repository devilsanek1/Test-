# The look test's engine, lane E: build items 1-4 (STUDY.md §10)

*2026-10-29, lane E (one of four lanes in one working tree; PT has patchwork and texture: `ENGINE_PT.md`; N the
nature pieces: `ENGINE_NATURE.md`; S the scene: `SCENE.md`). Every piece is opt-in and non-breaking: the shipped films
render exactly as before (§0). Each piece has a demo still here, drawn from the engine's own outputs at render time.*

## 0. Checks before and after
- **Rule (c), recent commits:** `git log -3` on `src/lib/light.tsx`, `depth.ts`, `pen.ts` (and `tier.tsx`): newest
  `bb14eae` 2026-10-28T02:32:33Z (the clone is shallow: 560 commits), before the 03:00 UTC cutoff: no conflict, edited.
- **Rule (a), non-breaking, the pixel proof:** rendered before any edit (07:48 UTC) and after all of them (08:25 UTC),
  full size, `GL=angle`, the working tree as it stood (the other lanes' new files included):

  | Composition | frames | differing px |
  |---|---|---|
  | `Film2R-V2S1`, `--props='{"draftLabel":false}'` | 60, 180, 312 (1.0, 3.0, 5.2 s) | 0, 0, 0 of 2,073,600 (max channel delta 0) |
  | `Film2R-V2S1`, default props (draft label on) | 60, 312 | 0, 0 |
  | `Film3` (`src/entry-v3-film.tsx`) | 300, 1260 (5.0, 21.0 s) | 0, 0 |

  `GL=angle node scripts/render-frames.mjs Film2R-V2S1 <dir> 1.0,3.0,5.2 --entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`;
  the renderer is deterministic (the same frame twice: 0 px). A sanity pair (frame 60 vs 312) differs on 426,155 px.
  Plus a code-level check of every default path against the old formulas (`nearStep`, `recede` below 0, `planeK` 0-6,
  `parallaxK` -3..6, `formTint` on a v2-style rig, the pen's widths and `scopeLine`): 86 of 86 identical.
- `npx tsc --noEmit`: clean for every file of this lane (the one error at 08:20 was lane S's in-progress
  `V2S1_steps_stone.tsx`).

## 1. The "before" row (item 1): `BEFORE.md`
- `BEFORE.md`: the five scripts on v2's own S1 at 1.0, 3.0, 5.2 s, with the after's target beside each number;
  `before_row.json` all of them. It confirms the study's diagnosis on the shipped code (p5 55-59, darks 1.6-1.8 % in
  19-65 pieces, the near treads L* 75 vs the subject's plane 74, 12.6 L* from the air, pastel 57 %, 15 % edge-free
  fields below the sky, C near 3.6-4.2 shapes per 10,000 px, 23 % calm below the skyline).
- **For item 11, the after row:** `python3 -I scripts/look/posters/look_test_row.py --label after --frames t1.png
  t3.png t5.png --sheets <3 depth sheets> --out <json>` (from `video/`). New: the runner, and two depth sheets
  (`scripts/qa/depth_sheets/v2_s1_t1.0.json`, `v2_s1_t5.2.json`: L1's sheets with her and the copies' row as fixed-seed
  GrabCut boxes where they stand at 1.0 and 5.2 s). The scene's own sheets: copy these with its new plane boxes.

## 2. `lib/depth.ts` (item 2): the float by 1/z, the ghost step, nearStep's floor, anchorTones
Demo: `engine_depth.png` (`LookEngineDepth`). All opt-in; `PARALLAX_K`, `PLANE_STEPS` and `nearStep`'s relative steps
are untouched and stay the defaults.

| export | use |
|---|---|
| `PARALLAX_Z` | the float shares by 1/z (P1 §3.4, PE L5, STUDY §7): -2 1, -1 0.8, 0 0.6, +1 0.24, +2 0.10, +3 0.04, +4 (the anchor) 0, +5 (the ghost) 0; the sky 0 (`PARALLAX_SKY`). A 12 px float moves +1 2.9 px, +2 1.2, +3 0.5 |
| `parallaxK(plane, PARALLAX_Z)`, `parallaxOffset(float, plane, PARALLAX_Z)` | the existing helpers with an optional table (fractional planes interpolate) |
| `parallaxByDepth(z, zNear)`, `parallaxByScale(pxPerM, nearPxPerM)` | a measured share (zNear / z), for a far landmark that is the subject (PE L5: by its distance, never its index) |
| `parallaxProblems(planes, {table, minRatio = 1.8})`, `floatProblems(legs, {..., planes, table})` | the 1.8x lint from plane 0 out (COZY_AND_SCALE §4; the near group and still planes left out): `PARALLAX_K` 2 WARN, `PARALLAX_Z` OK |
| `PLANE_STEPS_GHOST`, `GHOST_PLANE`, `GHOST_K` | `makeAtmosphere({name, air, steps: PLANE_STEPS_GHOST})`: plane +5 at k 0.87 (S1's brick there: dE 4.1 from the air) |
| `nearStep(c, plane, atm, {maxL, ref, minL, keepChroma})` | the absolute floor: step = max(relative, `refL - maxL`), the same on all of a plane's or object's colours, never under `minL` (16); a pale warm colour landing under L* 86 takes C* 19 (out of the beige band) unless `keepChroma` |
| `nearPalette(colors \| [colour, area][], plane, atm, o)`, `NEAR_FLOOR_L` [60, 55] | a plane (or one object) at once: its area-weighted median L* is the reference, `maxL` by plane (-1 60, -2 55) |
| `makeAtmosphere({..., nearFloor: {maxL, minL, ref}})` | the same floor for every `recede(c, plane < 0, atm)` of the set |
| `anchorTones(air \| atm, 4, {shade, source, hueTurn, litStep, footK, nearRange})` | the far anchor (P1 §3.2): `body`, `lit`, `foot`, `ghost`, `detail`, `dE`, `problems`. On S1's air `#FDD6B8` with `shade: CM.shadeCool`: body `#E2B6AE` (dE 15.3, h 65 -> 35, C* 17.8), lit `#EEC1B8`, foot `#EFC5B3` (+5 L*), ghost `#FCD0BD` (dE 5.9); without a shade: body `#DABAA2` (dE 11.2). `anchorTones(atm, 5)` = the ghost as the anchor |

**How to use the near floor (S1):** per object, `nearStep(c, -2, ATM, {maxL: 55})` brings each prop's main colour to
L* 55 (the paving 87.7 -> 55 at C* 19, the light brick 73.7 -> 55; the brick 60.7 -> 50.7 by the relative step; the
plum anchor stays 16); per plane, `nearPalette([[paving, 14], [planter, 1], ...], -2)` moves the whole plane by one
step (-32.7: its darks then sit at the floor). P1's "the treads, planter and bike in their own hues at L* 50-60" is the
per-object use. Check the result with `check_depth.py` (plane -2's L*) and `neverBand` (0 of 42 test results in a
band).

## 3. The 10b palette and `lib/gamut.ts` (item 3)
Demo: `engine_palette.png` (`LookEnginePalette`).
- **`src/look/poster_s1/palette_10b.ts`** (the test's own folder; pure data, no side effects on import):
  `CM_V2` v2r's `CM` roles copied verbatim (`copyProblems(CM)` = [] today); `TENB` what 10b moves (16 roles) and its two
  new roles `pavingShade #CFAFA4` and `eaveShade #6B4B5F`; **`CM10B`** = v2's keys with 10b's values, so a scene
  switches `const C = pass2 ? CM10B : CM`; `JSON10B` the study's JSON exactly; `siblings10b(n, seed)`;
  `problems10b()`; `coatOat10b()`.
- Measured (CIE LCh D65): every moved hue within 7 deg of v2's (paneUnlit -6.7, the rest <= 3.3); sky C* 13.4 -> 10.1,
  stucco 11.0 -> 6.1, paving 14.5 -> 7.0, water L* 76.9 -> 70.0, waterDeep 67.6 -> 56.0, paneUnlit 46.3 -> 33.1, sage
  76.9 -> 66.1, stoneShade 79.6 -> 68.1: the study's numbers.
- **Decided here (the JSON has no value):** `coatOat #E7D6BC`: v2's `#E6D3B5` sits in the beige band (h 84, C* 17.4,
  L* 85.4); C* >= 18 at its value would leave the gamut mask, so it rises to L* 86.4 at C* 15.1, hue kept. `white`
  moves with `paper` (v2's white is its paper).
- **A flag for the owner's eye / lane S:** 10b's `waterDeep #59908A` sits dE 15.2 from her teal `#0B8577` (v2's palette
  rule: no role within dE 20 of the hero). Kept as the study proposes; where she stands against the deep water, keep
  her separation (her edge on the towpath, not the water) or move the deep water (measured: L* 62 at C* 17 `#709F99`,
  or L* 57 at C* 14.5 `#69908C`, both dE 20.5).
  `problems10b()` reports it; nothing else.
- **`src/lib/gamut.ts`:** `MASK_HUE` + `ENVELOPE` (ported exactly from `pro_4_colour.py`, so the engine and the meter
  agree), `maskChroma(L, h)`, `inMask(hex)`, `toMask(hex)`, `calmLight(hex, {cool})` (lights L* >= 86 to C* 4-8, the
  cool field 9-11), **`siblings(hex, n = 4, seed, opts)`**, `siblingSet(roles, n, seed)`, `siblingProblems(hex, sibs)`.
  Siblings: a grid of hue +-8, L* +-4-10, C* +-3-6 (seeded jitter), gamut-fit, in the mask, never beige / olive / grey
  (`lib/water` `neverBand`), never under C* 4, dE76 8-14 from the role, then farthest-first from 8 seeded starts (>= 8
  apart). Deterministic per seed. The mid roles get 4 (brick, brickLight, brickDeep, pavingShade, water, paneUnlit,
  eaveShade); the calm lights cannot hold 3-5 tints 8 apart (they can only go darker, the mask holds their chroma), so
  `siblings10b` gives them `LIGHT_SIBLINGS` (dE 6-14, 6 apart): stucco 2, limestone 3, paving 3; sage 2. Check
  `.length`.

## 4. `lib/light.tsx` FormShade per tier, and the line flags in `lib/pen.ts` (item 4)
Demo: `engine_light.png` (`LookEngineLight`, left `outlines: true`, right `false`).
- **Per tier:** `withTierForm(rig, CM.shadeWarm)` gives a rig `shadeBase` + `tierForm` (`TIER_FORM_K`: subject 0.56,
  the A vs B picture's B in `scripts/look/posters/ab_outlines/scene.py`; support and environment 0.20, v2's
  TINT_CANAL). `<FormShade>` and `<Shade>` take `tier` (default: the tier scope they sit in, when the rig has
  `tierForm`), `strength` (an explicit k) and `base` (the object's own family). Helpers: `formTint`, `formStepOf(surface,
  base, k)`, `tierFormFor(surface, base, dL)`, `familyFor(surface, warm, cool)`, `TIER_UNDER_K` (subject undersides 0.66).
- **Measured on the demo's pixels** (lit vs shade face): tier A stucco -27.2, brick -17.8, the hero teal -22.0 (the cool
  family, k 0.91 from `tierFormFor`); tier C stucco -9.6, brick -6.9, teal -5.0. CRAFT §d.3 asks -20 to -25 on the
  subject's main surfaces: 0.56 overshoots stucco and undershoots brick, so tune the subject per film:
  `strength={tierFormFor(itsMainSurface, base, -22)}` (stucco 0.46, brick 0.69, the hero teal with the warm family
  0.71, with the cool one 0.91).
- **A warm family greys cool surfaces** (glass, water: C* 2-5 at the tier-A strength) and a cool one greys warm ones:
  pass `base={familyFor(surface, CM.shadeWarm, CM.shadeCool)}` on cool objects (her coat, glass, water).
- **The tier-A line flag:** `setPen('clean', {outlines: false})` (or `setOutlines(false)` after setPen) = the
  no-outline look: no tier draws an outline or an edge stroke (the subject's contour, B's same-hue line in `lines`
  scopes and round Pip, untagged lines); `thing` strokes (glazing bars, railings, wires), light lines and graphic marks
  still draw. Default `true`. It gates everything drawn through the pen (`Ink`, `useTierLine`, v2r's Pip); a raw
  `stroke=` in scene code is not reached (v2r's ghost copies draw their own 2.2 px line: lane S's call).
- **Thin lines on floating planes:** `setPen('clean', {lineMin: 2})`: every tier line, `thing` and light line at least
  2 px (CRAFT §c: the owner's 2 px on planes that float); graphic marks keep theirs. Default 0 (off).
- The flags are film-wide (module state, like the rest of the pen): one value per render. The demo sets it per render
  from a prop; a scene with presets in one bundle sets it in its root before its children render.

## 5. Libraries (the owner: "only if it's genuinely better than built yourself")
| piece | chosen | looked at (licence, version) | why |
|---|---|---|---|
| depth 1/z, ghost, floor, anchorTones | our own (`lib/depth`, `lib/light` CIELAB) | none fits: these are our ladder's constants and rules | a few tables and formulas on the house colour maths |
| gamut mask, siblings | our own on `lib/light`'s CIELAB and `lib/water`'s `neverBand` | culori (MIT, 4.0.2), colorjs.io (MIT, 0.7.1), chroma-js (BSD-3-Clause + Apache-2.0, 3.2.0) | they convert, gamut-map and measure (CIEDE2000, OKLCH); none makes role tints under a mask and never bands, which is the ~100 lines here. Every study number and QA meter is CIE L*a*b* D65 with dE76, which `lib/light` already computes (matched to the python meters); a second colour engine could disagree with them by fractions of a dE. culori is the pick if a later piece needs CIEDE2000 or OKLCH gamut mapping in TS |
| FormShade per tier, line flags | our own (`lib/light`, `lib/pen`, `lib/tier`) | none: React and SVG options on our components | |
No dependency added; `package.json` unchanged.

## 6. Files
- Changed (additive only): `src/lib/depth.ts`, `src/lib/light.tsx`, `src/lib/pen.ts`, `src/lib/tier.tsx`,
  `src/lib/DEPTH.md`, `src/lib/LIGHT.md` (new rows).
- New: `src/lib/gamut.ts`; `src/look/poster_s1/palette_10b.ts`; the demos `src/look/engine/EngineDemo.tsx`,
  `src/look/engine/pen.ts`, `src/entry-look-engine.tsx`
  (`GL=angle node scripts/render-frames.mjs LookEngineLight <dir> 0 --entry=src/entry-look-engine.tsx --props='{"outlines":false}'`);
  `scripts/look/posters/look_test_row.py`; `scripts/qa/depth_sheets/v2_s1_t1.0.json`, `v2_s1_t5.2.json`; this folder's
  `BEFORE.md`, `before_row.json`, `ENGINE.md`, `engine_depth.png`, `engine_palette.png`, `engine_light.png`.

## 7. For lane S (wiring it into the scene)
- The float: `parallaxOffset(floatAt(t, LEGS), plane, PARALLAX_Z)` per plane group; lint with `floatProblems(LEGS,
  {rest, planes: [...the shot's planes], table: PARALLAX_Z})`.
- The far stage: `const ATM = makeAtmosphere({name: 'S1', air: S1_AIR, steps: PLANE_STEPS_GHOST})`; the anchor's fills
  `anchorTones(ATM, 4, {shade: CM.shadeCool})`, the ghost skyline `recede(c, 5, ATM)` or `anchorTones(...).ghost`.
- The near group: `nearStep(c, -2, ATM, {maxL: 55})` per prop colour (or `nearPalette` per object).
- Pass 2's colours: `CM10B` (and `siblings10b()` for the facade rows); pass 1 keeps `CM`.
- The edges: `setOutlines(false)` for the no-outline passes; `withTierForm(RIG, CM.shadeWarm)` and the subject's
  `FormShade tier="subject" strength={tierFormFor(mainSurface, base, -22)}`; `setPen('clean', {lineMin: 2})` for the
  floating planes.

## 8. Notes for the orchestrator
- CRAFT §c ("the tier-A line a per-film flag") and §d.3 ("`FormShade` per tier") now have their code; the docs agent may
  name it (`setPen({outlines})`, `withTierForm`); I left CRAFT alone (the docs agent is editing it).
- The scratchpad is shared between the lanes: another lane's `tools/pxdiff.py` replaced mine mid-run (same path, other
  arguments), which silently compared files with themselves; my proof above re-ran with a private script
  (`scratchpad/laneE/pairdiff.py`). Lanes should keep their own subfolder.

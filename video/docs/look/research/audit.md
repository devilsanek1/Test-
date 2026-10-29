# Kit audit: what we have and what we lack for coziness + scale (research lane, 2026-10-25)

Scope: our own kit (`docs/CINE_KIT.md`, `docs/ENGINE.md`, `docs/v1/style_bible_ref2.md`, `src/lib/cine/**`, `src/lib/ShotCam.tsx`,
`src/lib/persp.tsx`, `src/lib/tod.tsx`, `src/lib/kit/**`) and v1's scale scenes (`docs/v1/scenes/S01, S08, S09, S12`), checked
against the two goals: v3's cozy desk nook with its data-center reveal, and v2 (DeepMind staff afraid to speak out). Tags:
**VERIFIED** = read in our files or code, or plain arithmetic; **REPORTED** = from a web search summary (page fetches were blocked
in this sandbox); **UNCERTAIN** = inference or untested. Theory lives in the sibling notes `enclosure.md`, `coziness.md`, `arcane.md`.

## 0. Bottom line
1. **Scale is well covered; coziness is barely covered.** Full multiplane camera, haze ladders, big sun, colossi, walls of windows;
   but no interior set, no room helper and no reusable light pool. [VERIFIED]
2. **The palette family isn't in the code** (only `docs/look/palettes.json` + `scripts/look/*.py`; `theme.ts` has one `palette`).
   `<Tod map>` remaps core `<Fill>`s, but cine `useTodPal` ignores `map`: Sage Study / Dusk can't render across both kits. [VERIFIED]
3. **The night relight would dull a lamp-lit room:** `todSteps` darkens every light field at night; roles are only base / far /
   cloud / framing / rim. [VERIFIED]
4. **A tilt alone can't reveal a tower-tall colossus within the strobe cap** (~1,130 px in 3 s). Dolly out from the nook instead: the
   room shrinks 5x, a depth-0.85 colossus only 1.14x, so it "rises". [VERIFIED, section 4]

## 1. What exists (with how to call it)
| need | piece (file) | call / key facts [VERIFIED] |
|---|---|---|
| shot camera | `ShotCam` (src/lib/ShotCam.tsx) | `<World stage="context"><ShotCam push={{to: 1.06, dur: 2}}>` or `keys={[...]}`: CineCamera plus the transition camera. Flat scenes: `<World push={{to, dur, at, anchor}}>` |
| multiplane camera | `CineCamera`, `Layer` (cine/camera.tsx) | keys `{t, x, y` (truck / crane: near moves more)`, pan, tilt` (rotation: the whole frame shifts, sky included)`, push` (dolly, real parallax)`, zoom` (lens)`, rot, anchor, anchorDepth, anchorTo, ease, inkComp}` + `handheld`. `<Layer depth={1}>` sky ... `depth={-0.5}` framing |
| eases + caps | `MOTION.camera` (src/lib/spec.ts) = cine `CAM` | `ease` inOutCubic, `slow` sine, `reveal` = trapezoid(0.25, 0.35) (peak 1.43x avg), `settle`; `peakPxPerFrame` 18; dolly saturates at `maxPushF` 0.94 (nothing passes the lens) |
| speed checks | `camSpeed`, `camSpeedAt` (camera.tsx); `scripts/camspeed.py <Comp>`; `scripts/capcheck.mjs` | per-layer on-screen px / frame; seam rule: outgoing last key 1-2 s past the cut, incoming first key 0.5-1.5 s before |
| figure scale | `eyeLevel`, `measureEye` (src/lib/persp.tsx); `Crowd eye` | lens 1.1x person height; peaks go lower (worm's eye), never above ~1.3 |
| perspective | `Plane`, `wallQuad`, `groundQuad`, `frontQuad`, `rayPoint` (persp.tsx); cine `quadMap`, `persp1` | one-point planes that project whole kit components; strokes keep screen widths |
| haze / depth | `atmos(color, depth, tod)`, `TOD.*.ladder`, `inkForDepth`, `deep.teal78/60/45` (cine/atmosphere.ts); `<Tod role="far">` | stepped palette ladder (never a mix at dusk / night); far layers fill-only; `HazeBand` exists but is marked "avoid" |
| sky + life | `Sky`, `SkyCloud`, `Stars avoid`, `Birds`, `Hills` (cine/sky.tsx) | `CAPTION_BAND` [80, 270, 1000, 580] is the default avoid box |
| time of day | `<World sky={[{t, tod, wipe}]}>`, `<TodAnchor at>`, `<Tod value role map>` (src/lib/tod.tsx) | per-object one-frame flips as the sky edge passes; stepped `snap` tweens; roles base / far / cloud / framing / rim |
| sun + light | `BigSun`, `Glow`, `LightShaft`, `RimLight`, `Rimmed`, `Silhouette`, `FlatColor` (cine/light.tsx) | sun r 270-490 at peaks, hops between shots; Glow = stepped rings at static opacity 0.16; shafts = static translucent polygons with `sweep` |
| lamps + bulbs | `LampPost` (`lightAt`), `Festoon` (kit/Nature.tsx); cine `StringLights r1` | cone at static opacity 0.38 + opaque peach disc r 18 (+ halo r 30 at night); Festoon is plane-safe and relights |
| windows | `LitWindows` (cine/windows.tsx), `WallOfWindows`, `wallQuadVP`, `keepDark` (cine/wall.tsx) | patterns random / rows / cols / sweep / wave / collapse, `region` districts; caption-box cells kept dark, decided once per shot |
| room seen from outside | `WindowCloseup` (cine/props.tsx) | desk, monitor, pendant lamp + stepped glow, curtain, plant, chair, back-view person; drops detail by itself with `screenW` (person < 80 ... flat pane < 42 px) and hands off to the grid invisibly |
| colossi | `EndlessCity` landmark `kind: 'colossal'` + `quietAbove` (cine/city.tsx); `Monument quietY` (monument.tsx); `Tower` (tower.tsx) | Tower: 3-point from below, zenith `vpy`, lit and shade faces, window grid, `crown`, rises with `at` / `buildDur` |
| crowds | `TinyCrowd` (cine/figures.tsx, 6-30 px; kit `Person` above 40 px); `GroundPlane` (cine/street.tsx) | batched, idle bob, walkers |
| lens-scale observer | `LensFigure` (cine/lens.tsx) | backlit back view, rim inside the outline, `turns` on a word |
| near framing | `<Layer depth={-0.5}>`, kit `Fronds` / `Palm`, cine `Ledge detail`, `Balustrade`, `Plinth`, `Pole`, `Wires` | style_bible_ref2 1.6: at least 2 edge-cut elements per shot, a top-edge element in every shot |
| wipes | `WipeCut` / `WipePass` kinds column, passer, figure, pole, foliage (cine/props.tsx, wipers.tsx) | `wipeToneRegions` keeps the captions readable over the wiper |
| street | `PerspectiveStreet` (cine/street.tsx) | `heights`, `sides`, `road` / `walk`, `fence`, `poleStart`, `lights`, `windows`, `crowd` |
| interior bits | kit `Laptop`, `Server` (kit/Icons.tsx), `Window`, `WindowGrid`, `Door`, `Person` (rim, hero detail) | that's all: no shelf, desk, lamp, rug or room shell |
| light pools | only one-offs in v1's scenes (now under `archive/v1/src/scenes/`): `scene09/PartA.tsx` (`ell()` lamp pools), `scene09/hill.tsx` `FixedPool`, `scene09/PartB.tsx` headlamp fan, `scene08/tower.tsx` BeamSpot | stepped opaque ellipses (peach outer, cream core); ref 2 numbers in style_bible_ref2 1.7 |

## 2. v1's scale scenes and how they did it [VERIFIED from docs/v1/scenes]
- **S01, PEAK 1, hook (0-4.7 s).** GovernmentPlaza ~1.35x taller under the y-600 ceiling, horizon y 1384 (0.72 H, low camera), six
  back-view citizens (55-75 px) on the VP axis, an r 155 "power button" sun in the gap. Sine push 1.00 -> 1.04, hold, then a 0.33 s
  dive x3.19 anchored on the lock (inkComp). Parallax: far + sun 0.43, buildings 1, near 1.43.
- **S08, PEAK 2 (24.1-34.5 s).** DomeCity: a crane entering at S07's exit speed (26 px / frame) with a lens zoom 1.3 -> 1.0 on its
  own track; a colossal far dome draws its arc and closes on "Cloudflare"; the sun swells to r 260 with two stepped rings (x1.25
  `#F19260`, x1.5 peach); dolly push 1.0 -> 1.15; on "millions" a crowd flood + 1.0 s pull-back (peak 16.4), sunset in 5 snaps.
  Pip on our parapet coping is the observer.
- **S09, PEAK 3 (34.5-39.6 s).** A hidden match-cut at zoom 6 from a door into TerraceHill, then a log-anchored pull-back 6 -> 1
  landing on "single": terraces ~820 px tall vs standers 132-142 px (~6:1), running off both sides; haze bands and silhouettes as the
  sun crests the ridge on "server"; stone pier + balustrade framing ~22 % of the bottom edge; tags shrink 44 -> 8 px with depth.
  **Camera peak 80.3 px / frame** (4.5x the cap, allow-listed); S08's crane entry 25.4.
- **S12, closing.** S01's plaza at PEAK-1 framing, one gentle pull-back 1.03 -> 1.0, then the loop.
- **CineDemo** (`archive/v1/src/dev/CineDemo.tsx`): A a 640 px tilt in 2.5 s with a colossal tower crossing the caption band as a flat field;
  B a worm's-eye monument crane ~190 px; C a WallOfWindows pull-back 8x -> 1.3x in 6.2 s, close-ups melting into the grid.
- **What made them work:** ONE colossus per shot; tiny but readable back-view people on the VP axis; a low horizon; framing cut by the
  bottom edge; the sun as a scale ruler; the move landing on a word; things switching on during the hold. **What to fix:** reveal speed.

## 3. Gaps, by goal
**A. Enclosure framing** (the reference: tall walls on both sides, a closed vista, heavy greenery)
- `PerspectiveStreet` has no caption quiet zone (`quietY` / keepDark, as Monument and WallOfWindows have). CINE_KIT.md tells you to keep
  facades low (~1.5x camH), which is the opposite of the 1:1-1:1.5 cozy ratio in enclosure.md. [VERIFIED]
- No vista closer (a landmark at the VP ending the street, like the reference's tower), no ivy or overhanging tree masses (the
  reference is roughly 40 % greenery, UNCERTAIN), no wall lamps; no hanging lamp / awning / arch / doorway "portal" piece (style_bible_ref2
  8 lists "a hanging lamp from the top" as a peak device); no side-wall flank for the edge gutters (x < 95 and x > 945 are outside the
  850 px caption lines centred on 520, so a flank there can rise the full height). [VERIFIED for the code]

**B. Warm light pools**
- No reusable `LightPool` / `LampCone` (four scene one-offs), and nothing models "lit by the pool" (inside = the lit step, outside =
  a step darker): Tod steps only by time of day, for a whole subtree. [VERIFIED]
- There's no interior / lamp-lit `todSteps` role (night turns cream -> sand everywhere), no cold window light cast on the floor, and no
  warm-inside / cold-outside split. Artists say warm lamp light only reads as cozy when a darker, desaturated cool source sits beside it.
  [VERIFIED code / REPORTED art]
- `Glow` rings are static-translucent. Indoors, prefer opaque stepped discs (ref 2's lamp disc is opaque). [VERIFIED]

**C. Cozy interior set**: none. Missing: a room-box helper (walls, floor, ceiling from `persp.tsx` quads); openings as **evenodd
holes in the wall path**, so a deeper exterior `<Layer>` shows through without a clip (CINE_KIT.md 11 limits clips); props: bookshelf
(batched spines, quiet above y 600), desk + desk lamp, frosty window from inside (mullions, frost scallops, curtains, Festoon), mug +
steam (draw-on wisps, no fade), rug, radiator / plant, laptop "old, cracked hinge", price tag. Build in core `Ink` / `Fill` (relight,
un-build, inkComp), not raw SVG. [VERIFIED gaps]

**D. Crane / tower reveals in 9:16**
- No data-center colossus. `Tower` is an office tower (window grid + crown), and kit `Server` is an icon. [VERIFIED]
- `tilt` is a 2D shift with no keystone: verticals don't start converging as the camera looks up, because Tower's `vpy` is static.
  [VERIFIED]
- No reveal planner (section 4); cine raw strokes aren't ink-compensated (ENGINE 4b gap), so a 3-5x dolly over cine pieces swings
  line weight; no snow / particles. [VERIFIED] Projected painted sets hold up best on back- and midground with limited moves; our flat
  layers likely behave the same, so give the big travel to far layers. [REPORTED / UNCERTAIN transfer]

**E. Palette**: see 0.2. `TOD` palettes and `todSteps` are built from the v1 palette hexes, so a palette swap must rebuild them too.
[VERIFIED]

## 4. Numbers for 9:16 reveals and pools [VERIFIED arithmetic: 30 fps, cap 18 px / frame, `reveal` peak = 1.43x average]
- **Tilt / crane:** at most 12.6 px / frame on average = 378 px / s: 755 px in 2 s, 1,130 in 3 s, 1,510 in 4 s. That's under 0.8 of a
  frame height. (CineDemo A: 640 px in 2.5 s, peak 13.5.)
- **Zoom or dolly-out:** screen speed = r x d(ln scale)/dt, r = the farthest frame corner from the anchor. Centred anchor (r 1,101):
  <= 0.34 ln/s = 2.8x in 3 s, 3.9x in 4 s. Low anchor at y 1700 (the nook window, r 1,784): <= 0.21 ln/s = 1.9x in 3 s, 2.3x in
  4 s. Budget it or allow-list it on purpose (S09's 6x in ~1.6 s ran 80 px / frame).
- **Dolly beats zoom for "it rises":** s_f = zoom / (1 - push x f), f = 1 - depth. Dollying back from push 0.8 shrinks the room
  (depth 0) 5x but a colossus at depth 0.85 only 1.14x.
- **Captions:** anything crossing y 280-570 during a tilt must be a flat field (`quietAbove`, `quietY`, keepDark).
- **Pool colour:** Sage Study `hl` `#F2D49B` has C* 32, which is in the hero range (>= 30). Keep its full-strength core under 5 % of
  the frame, with an outer ring in a low-chroma step (C <= 20). The pop `#F2A541` (C* 64) goes on ONE look-here detail (the price
  tag), never on the pool. (PALETTE.md: one hero, one anchor, at most one hot pop.)
- **Pool shape** (style_bible_ref2 1.7): a cone trapezoid widening ~3x, and a pool ellipse ~0.5-0.7 W, one step lighter than the
  floor. Keep **darker gaps between pools** (Alexander's "pools of light"). [REPORTED]

## 5. Prioritised build list (effort: S = half a day, M = 1 day, L = 2+ days, one agent)
1. **Palette scope** (M). What: `<PaletteScope name>` that feeds core `<Tod map>` AND cine `useTodPal`, rebuilds TOD / `todSteps`
   per palette, and maps the palettes.json roles to theme keys. Why: G4 runs parallel to G3, and v3's Sage Study interior -> Dusk
   exterior (and v2's palette) can't render without it.
2. **Room box + openings** (S). What: `roomBox({vp, back, depth})` -> wall / floor / ceiling quads on `Plane`, openings as evenodd holes,
   the window showing a deeper `<Layer>`. Why: every interior shot; G3 blocking; v2's "letter at home at night" too.
3. **Reveal recipe + `revealPlan()`** (S). What: a helper that returns the minimum duration for a given tilt / dolly under the cap,
   plus a CineDemo-style test of a crane over a near parapet + a dolly-out anchored low + an optional tilt, carried through the cuts.
   Why: v3's scale moment has to fit the VO line at G3; it also avoids S09's 80 px / frame.
4. **LightPool + LampCone + pool anchor** (M). What: stepped opaque ellipses projected on `groundQuad`, a cone, and an in-pool /
   out-of-pool relight by anchor (like `TodAnchor`). It replaces the four one-offs. Why: the core of coziness, in both videos.
5. **Tod `interior` role + WindowLight** (S). What: lamp-lit inside and night outside, plus a cold window rectangle cast on the floor or
   desk. Why: without it the night relight dulls the nook.
6. **DataCenter colossus** (M). What: a Tower variant with louvred, windowless faces; LED rows driven by `LitWindows` events (a sweep on
   a word); rooftop chillers; vapour puffs that pop and grow; `quietAbove`; one lit rack at its foot; the nook window becomes a tiny lit
   window at its base (>= 10:1). Why: v3's colossus.
7. **Interior prop pack** (L). What: Bookshelf, Desk, DeskLamp, FrostyWindow + Festoon, Mug + steam, Rug, Radiator, Plant, Laptop
   `old`, PriceTag, all in core Ink / Fill with caption-quiet tops. Why: the nook at G5.
8. **Enclosure street kit** (M). What: PerspectiveStreet `quietY`, a `closer` landmark, ivy / tree overhang masses, wall lamps, and a
   `Flank` side wall for the edge gutters. Why: v3's snowy lane, v2's canyon corridor (two mirrored `wallQuadVP` WallOfWindows may
   already do it: UNCERTAIN, untested).
9. **Framing pack** (S-M). What: HangingLamp (top edge), Portal (doorway / arch / window frame at depth -0.5 with an inked reveal),
   Awning / Eave. Why: frame-within-frame in both videos.
10. **Snow** (S). What: batched, deterministic flakes with caption avoid boxes. Why: the frosty window, the winter beat.
11. **Tilt-coupled keystone** (M). What: Tower / Monument `vpy` follows `useCam().tilt`, memoised by quantised tilt. Why: polish for
    the look-up; cut it first if time is short.
12. **Cine inkComp coverage** (M). What: raw `strokeWidth` x `useInkScale()` in city, tower, wall, street and props. Why: big dolly
    reveals over cine pieces.

## Sources
- Internal [VERIFIED]: `docs/CINE_KIT.md` 1-12; `docs/ENGINE.md` 1, 2b, 4, 4b, 7-10, 14; `docs/v1/style_bible_ref2.md` 1.6, 1.7, 8;
  `docs/look/PALETTE.md`; `docs/look/palettes.json`; `docs/v1/scenes/S01.md`, `S08.md`, `S09.md`, `S12.md`; `docs/v1/SHARED_SETS.md`;
  `src/lib/{ShotCam.tsx, persp.tsx, tod.tsx, theme.ts, spec.ts}`; `src/lib/cine/*.tsx|ts` headers + exports; `src/lib/kit/{Nature,Icons}.tsx`.
- Sibling notes: `enclosure.md` (H:W dial, 9:16 sky-share table), `coziness.md`, `arcane.md`.
- Pools of light, Alexander's *A Pattern Language* (lamps low and apart, darker areas between pools, warm light), via a secondary blog
  [REPORTED]: https://aquagallery.com/blogs/news/pools-of-light-leaning-into-focus
- Warm / cool cozy light needs a darker, desaturated cool secondary source; tone the lamp toward red and down in saturation [REPORTED]:
  https://forum.svslearn.com/post/108724 ; https://www.therookies.co/projects/86439
- Arcane: painted backgrounds projected in 3D while refining camera moves [REPORTED]:
  https://80.lv/articles/riot-games-on-designing-arcane-s-piltover-zaun/ ; storyboards treated as live-action previs, "didn't rely
  heavily on virtual cameras" [REPORTED]: https://awn.com/animationworld/unveiling-arcane-conversation-pascal-charrue-and-alexis-wanneroy ;
  Piltover sunlit on its cliff vs Zaun in half-light (a vertical class split) [REPORTED]:
  https://api.thecrimson.com/article/2021/11/9/arcane-act-1-review-netflix
- Camera projection works best for back- and midground with limited camera movement [REPORTED]: https://tdl-ir.tdl.org/handle/1969.1/86069
- Multiplane: farther planes move slower; The Old Mill opens on a long push-in, closes on a long pull-out [REPORTED]:
  https://en.wikipedia.org/wiki/Multiplane_camera ; https://petapixel.com/2025/04/04/how-disneys-multiplane-camera-achieved-the-illusion-of-depth ; https://reverseshot.org/archive/entry/3417/snow_white_revolutions
- Frame within a frame adds depth and focuses the subject [REPORTED, weak]: https://morphic.com/ai-glossary/framing ; 9:16 suits
  tall subjects and tilt-up reveals [UNCERTAIN, marketing-grade]: https://www.cliprise.app/learn/guides/best-practices/aspect-ratios

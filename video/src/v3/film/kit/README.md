# v3 film kit (G5): one look, one cast, 15 panels

`import {...} from '../kit'` (from `src/v3/film/scenes/<ID>.tsx`). The barrel imports `../palette` first. Every prop
takes **canvas px** (1080 x 1920 at camera rest), an optional **`at`** (build start, scene seconds; omit = already built;
negative = part-drawn on frame 0) and a **`seed`**. Builds follow the house grammar: ink draws on first, fills land
`FILL_LAG` = 0.18 s later, text and small lights appear with the fills. Geometry is computed in screen px from the size
props (no scale transforms), so ink weights and overshoots never grow with size. Sheet:
`npx remotion still src/entry-v3-kit.tsx KitSheet3 out.png --frame=90 --scale=0.5` (every prop and variant, plus the
theme check, which must say "0 problems").

## Palette and time of day (`../palette.ts`)

- **`palette.ts` rewrites the house tokens in place at module load** (palette, skies, todSky, todTone, todSteps,
  todBulbHalo, glow, captionTones, type.color), so lib/Ink, Fill, World, lib/kit and lib/cine draw Autumn Ember inside the
  v3 entries, including the colour tables some modules build at import time (checked: Person `PERSON_BODIES`, cine
  `TOD`). It must be the FIRST import of each v3 film entry. Raw SVG that ignores `<Look>` (text, LED ticks, the chart
  line, snow): build the opening with `at`, not with `Look fills="paper"`.
- **`EMBER`** = the role tokens (StyleNook's EMBER, extended): room `wall reveal slope beam shelf books desk ring core trim
  sillTop sillFront pot leaf mug mugBand paper card screen newScreen`; you `skin nail hair sleeve sweaterRib jeans shoe
  chair`; outside `sky skyLow dc dcSide dcDark led roofs snow frost houseLit brick brickShade road`; jobs `hero heroDeep
  anchor pop popText hl`; the stick `board boardDeep chip pin`. House keys map to it: cream/sand/tan/peach = the room,
  brown/ochre = the red-brown wood, mintPale/sage/teal/tealDark/sky = the dusk-blue outside.
- **TIME OF DAY: ONE for the whole film, BLUE HOUR, FIRST SNOW.** Inside: the warm lamp-lit nook (peach cream wall,
  terracotta desk, golden pool). Outside (O1/S13/S15 windows, S9, S10, S14): flat sky `EMBER.sky` #5B6A94 (a
  saturated dusk blue, never grey; one optional flat lighter band `skyLow` toward the horizon, no gradient), snow on
  the roofs and the ground (`snow`), warm lit house windows (`houseLit`), the data center's small cold lights (`led`),
  gentle falling snow. Every house tod name maps to it (`FILM_TOD` = 'night' for World keys), with NO relight steps.
- **Captions:** white on every outdoor sky (5.3:1 on #5B6A94); ink on the wall and on the insert cards. The house
  `todTone` says 'light' for every tod, so interiors and inserts must set captionTone 'dark' explicitly.

## Colour jobs (owner: warm, never sickly)

- **Hero, burnt orange `hero` #D9542F: THE laptops and THE price tag only** (aim 5-15 % of the frame; the kit's O1 sample
  measures 2.4 %, so O1 / S15 / S16 should give the tag and the listing laptop their full board sizes). `heroDeep` is its
  one flat shade step (deck edge, tag back). Never on the data center, the sticks or the room.
- **Anchor `anchor` #3A1F16** (~5 %): hair, phone body, lamp, screen of the old laptop, the 5x bar.
- **ONE pop, blue `pop` #2F8EEB** (1-3 %): "Add to cart", the cart badge, the tag's eyelet. Nothing else is blue-bright.
- **The cold outside** is the dusk-blue family (`sky dc dcSide dcDark roofs`); **our side is warm** (our roof ledge and
  the chip factory are brick). **Memory sticks are gold** (`board`, near-black `chip`s, light `pin`s): warm value
  leaving home for the cold building; never green (olive reads sickly next to peach).
- The data center's "gone dark" (the board's dark fill) is `dcDark`; **the board's red focus circle becomes
  `signLitAt`**: the sign panel lights up cold white with ink letters (light, not a mark).
- **The sign stays lit after O1**: O1 lights it at 4.04 and every later panel that shows the named building draws it
  lit from the cut (`signLitAt={0}`: S9, S10, S15 via O1's set; in S14 the lit sign passes to the second
  building). Only S13's far silhouette has no sign, and the tag's back (S16) carries the short sign "AI".

## Exports

| Export | Props (beyond `at`, `seed`) | Sizes that read at phone size / notes |
|---|---|---|
| `Nook` | `variant` 'pov' \| 'objective', `layout` (partial `NookLayout`), `frost`, `lampOn`, `children` = the outside (clipped to the glass) | pov = O1/S15/LOOP: glass 180-900 x 630-1060, ONE mullion x 830, sill 1060-1086, desk from 1086, lamp over the window's lower-left corner, pool (210, 1206). objective = S13: glass 470-1110 x 640-1006 (cut by the right edge), mullion 1023, desk back edge 1060, floor 1400. `NOOK_LAYOUT` has every number. The wall snaps in at `at`. |
| `NookOutside` | `variant`, `dc` (DataCenter overrides: `sign`, `signAt`, `darkAt`, `signLitAt`), `snow` | pov: horizon 950, two houses, the data center x 322-758; objective: horizon 912, far silhouette x 591-961, no sign. |
| `Lamp`, `Mug`, `Notebook` | `pose` / `x, top` / `dy` | for S7 / S8 / S16 (lamp shade cut by the left edge, pool under the laptop). |
| `NightSky` | `x y w h`, `bandY` + `horizon` (the lighter band) | default covers the frame + bleed. |
| `Snowfall` | `x y w h`, `n`, `size`, `speed` | deterministic, wraps. |
| `TownBand` | `y` (ground), `houses` [{x, w, h?, lit?, chimney?, y?}] or `n x0 x1 houseW`, `far` (no ink), `ground` | houses >= 50 px wide (34-40 px as a far ruler, fill only). A house's own `y` steps a hill town up its slope. |
| `DataCenter` | `x y` (base centre) `w h`, `variant` 'normal' \| 'dark' \| 'far' \| 'hall' \| 'mini', `sign` (text, '' blank, null none), `signAt`, `darkAt`, `signLitAt`, `units` (3), `blink`, `signH` (panel height px), `ledColor` / `ledStyle` ('ticks' default \| 'bands': three long lit bands per row, the clean pen's server lights with no dash rows; the v3 rework's home view uses 'bands' with `ledColor` #A8B6DE), `rowsOn` {at, dur, color?} (opt-in, 'bands': dark from `darkAt`, the rows light one by one: the home view's 4.16-4.87, one per syllable), `signOnFace` (opt-in: the sign plate centred on the lit front face, so its letters sit in its middle; `signFaceShift(w)` = the shift) | ONE building everywhere. Board sizes: 436 window, 371 far, 330 S10, 340 dark at the end of S9's pull-back (`signH` 52: ~40 px letters, readable at phone size). Sign reads from w ~300. `dataCenterGeo(x, y, w, h, variant, signH)` gives the sign/roof rects. |
| `RoofLedge` | `y` (top of the lip), `x0 x1 h`, `ventX`, `lipH` (36), `bricks` (9), `exact` | warm brick, snow lip, one vent; front ink. S9's parapet seen from behind: `h` 34 `lipH` 16 at the end of the pull-back (`exact`: no misregistration when a plane shows it 5x). |
| `RoofVent` | `x y` (body centre, the roof line) `w h capH`, `exact` | OUR vent (RoofLedge's): brick-shade body, dark cowl, snow cap. S9's near clutter (100 x 330 at the end, 3.3x at the start, cut by the left edge). |
| `BrickStack` | `x y` (left, cap top) `w h`, `capH`, `pots` [u] + `potW`, `color shade` (town stacks: roofs / dcSide), `bricks`, `exact` | a chimney stack: brick with a shade side, corbelled cap with snow, terracotta pots. S9: 326 wide at the left frame, 1055 at the start (where the hall will land); keep pots where the stack's top is below the caption band while they are on screen (S9: u >= 0.8). |
| `ChimneyPot` | `x y` (left, rim top) `w` | the pot at the lens: ONE flat soft mass, no ink, rim one step lighter; wider than the frame (S9: 1200, crossing at 90 px/f, the only layer allowed that speed). |
| `MidTown` / `streetAt()` | `x0 x1`, `rows` [{y, w}] (back to front), `street` {yB yT xBL xBR xTL xTR}, `lamps` (5), `stacks`, `ground` (dc) | the mid roofs: rows of TownBand houses (varied heights, chimneys, lit windows) on shaded snow, and a LIT STREET: a dark road with snow banks, tall lamp posts on both curbs (a snow-lit edge so they read against the house fronts; a bright core in a warm halo) and small separate warm pools, the street-front houses lit. Short dark posts with big pools read as "a dotted path" in the v3 cold read. Never a light wedge (the monochrome board's bright wedge read as a SPOTLIGHT; its zigzag roofline as TORN PAPER). |
| `RoofDeck` | `y` (far edge) `x0 x1 h`, `vp`, `planks`, `exact` | OUR roof deck: warm terracotta planks; the seams converge toward `vp` beyond the parapet (they lead to you; seams that meet AT the figure read as rays). |
| `PullLayer`, `planeMat`, `boxMat`, `startMat`, `s5Ease`, `planeSpeed` (`Pullback.tsx`) | `PullPlane` {o, off, k}, `PullBox` {from, to, s0} | the S5 pull-back rig (CINEMATIC_GUIDE S5): one progress p = `s5Ease(t / move)` for every plane; a plane is authored in END coords and shown scaled k^(1-p) about a pivot that travels o + off -> o (the board's SketchReel `{s, o}` moves exactly); near clutter goes box to box (`lin`); `startMat` draws a figure authored at its start size (the close back view before the hand-over); `PullLayer` compensates ink (screen width = authored x scale^0.2). |
| `Laptop` | `x y` (hinge centre) `w`, `lidH` (0.64), `variant` 'old' \| 'new', `taped`, `label` ("BETTER") + `labelAt`, `screen`, `rot`, `lidOnly`, `children` (on screen); opt-in (v3 rework): `dim` 0 / 0.5 / 1 (off-beat: lid, deck and keys a soft terracotta, the screen a pale peach: `LAPTOP_DIM`, set for the phone listing under the screen's peach dim) | lid `lidH` w tall (S8's close-up from above: 0.36), deck 0.24 w. Reads from 150 px; at w >= 800 the keys are separate caps (dashed rows below). S8 at 1400 keeps the house line. `laptopGeo(x, y, w, lidH)` gives screen/keys centres. |
| `Phone` | `x y` (top-left) `w` (400) `h` (2.2 w) `rot` (-3), `title`, `badge` + `badgeAt`, `price` + `priceStrikeAt`, `newPrice` + `newPriceAt`, `priceY` (372), `buttonY` (400), `buttonText`, `pressAt`, `photoLaptop`, `children` (phone-local px); opt-in (v3 rework): `bodyFillAt` (the dark bezel and notch land last, closing round the lit screen), `dim` 0 / 0.5 / 1 (off-beat: the button and badge `PHONE_DIM_POP` #9AACCB, no button outline, the body and notch `PHONE_DIM_BODY` #634538 (L* 32) with no outline, the listing's laptop tier B with its own `dim`), `pressDark` (the button a value darker while pressed), `descTone` (the description lines as light hairlines), `titleRule` (false: no title rule under a hanging tag) | `phoneSlots(w)` = local rects (photo, listing laptop, price, button, cart, badge); `phonePoint(phone, lx, ly)` = canvas point (aim sticks / the tag string). |
| `Hand` | `phone` (same geometry), `thumbTo` (local), `pressAt`; opt-in (v3 rework): `skin` (its own value against what it lies over: thread_plane's `HAND_SKIN` #E2AD94, L* ~76 over a desk at 63), `details` (false: no creases or nail marks), `closedThumb` (the thumb's line is its fill's own contour, drawn inside it) | fingers, thumb on the button, palm + rust sleeve past the bottom; follows the phone when it lowers. Tier B in the film: `<Tier tier="support" lines>` gives it a same-hue line where it meets the desk, plus a `FormShade kind="crescent"`. |
| `PriceTag` | `x y` (box top-left) `w` (h = 0.5 w), `value` or `ticker` [{t, v}], `old` + `oldAt` + `strikeAt`, `oldSize` (0.16 w), `oldTone` 'white' \| 'cream', `stringFrom`, `rot`, `sway`, `turnAt` (back = mini data center), `backSign` ("AI"), `tone` 'hero' \| 'pop'; opt-in (v3 rework): `dim` 0 / 0.5 / 1 (off its beat: `TAG_DIM`, a soft terracotta body C* 38, prices in its light tint, no outline), `stringThrough` (the string tied through the hole: drawn over the paper, taut, into the eyelet from above) | 360 in O1 (subject), 190 on S5's laptops, 460 in S16. Each ticker step pops the price and jolts the tag. `tagHoleAt()` = where a string ties on. |
| `MemoryStick` | `x y` (centre) `w`, `rot`, `chips` (4 at every size), `board`, `flat` | h = 0.31 w. Reads from ~60 px; 130 flying, 700 in S8. |
| `StickFlight` / `flightPose()` | `from to t0 t1`, `arc`, `w0 w1`, `rot0 rot1`, `end` 'vanish' \| 'shrink' \| 'land', `ease`, `trail` | one stick on an arc, shrinking into its target; `flightPose(t, opts)` is pure (aim the tag ticks at it). Small far sticks (S9's streams, ~60 px): `trail={false}`, or the two dark ticks read as legs (birds, drones). |
| `Pile` | `x y` (base centre / ground) `w h`, `stickW` (<= 130), `at` + `dur` (pops row by row, bottom up) | a big pile gets MORE sticks, never bigger ones (S9: 840 x 372 of 62 px sticks, past the right edge; gold with black chips, so it never reads as banknotes; every stick shows its chips and lies mostly level, since pale backs at steep angles read as hay or fries). |
| `YouFront` | `x` (head centre) `y` (head top) `head` (250), `face` or [{t, face}] ('happy' \| 'worried' \| 'neutral'), `look` (-1..1), `hands` [[x,y],[x,y]], `children` = the held prop (under the hands) | S5. The torso runs ~4.4 heads (cut it with the counter). |
| `YouSeated` | `x` (hip) `y` (seat top) `head` (92), `floorY` | S13, 3/4 back facing right; the chair back sits in front of the lower back. |
| `YouBack` | `x` (head centre) `y` (head top) `head` (184), `hand` (the raised hand), `children` = the held prop (over the arm, under the fingers) | S9's opening: standing back view, 3/4 with the head turned right (hair, the right ear, a sliver of cheek: no face), cut at the hips; holds up your ONE stick (330 px, S8's object). |
| `YouTiny` | `x y` (feet) `h` (86), `stick`, `stickW` (46) | S9's landing at 184 px (stick 56, ink 2.6); reads from 60 px. Shown ~2x for 0.5 s after the hand-over: keep it under a crossing mass until then. |
| `ChartCard`, `LineChart`, `BarChart` | card `x y w h`; line: plot `x y w h`, `title`, `years`, `data`, `drawAt drawDur`, `hook hookAt hookDur`, `label labelAt labelPos`; bars: `bars` [{label, v, color, at, stick}], `value valueAt` | straight-on, level; words 56-64 px; the line is hero, 9 px, drawn on with the voice. S6 = S4 + `hook` + `label` (same props otherwise). |
| `ChipFactory` / `chipFactoryGeo()` | `x y` (base centre) `w` (300), `doorLit`, `doorSide` 'l' \| 'r' (mirrors the factory), `steam` (max rise px, default 0.3 w; false = none) | warm brick, sawtooth roof with snow, chimney steam, chip sign, lit door (the queue's goal: `geo.doorC`, door-left geometry; mirror it for 'r'). |
| `ChipMaker` | `x y` (feet) `h` (112), `facing`, `point` | S14's speaker: a clean-room suit. |
| `Van` | `x y` (centre, wheels' ground) `w` (380), `flip`, `lights`, `decalW` (0.42 of the box) | cream box van, THE laptop as its decal, faces right. |
| `WaitingDots` | `x y r gap n color` | bob one after another. |
| `SpeechBubble`, `ThoughtBubble` | `cx cy rx ry` (the cloud's centre and radii), `to` (the head), `children` | pop in from the tail; the thought dots step from the rim to the head. |
| `WallClock` | `cx cy r` (46), `startMin` | the second hand (wood red-brown, never the hero) ticks each second. |
| `Calendar` | `x y w` (170), `from to`, `flipAt` | the page flips up over the binding (no fade). |
| helpers | `b`, `fillAt`, `Show`, `Pop`, `Txt` (caption hand, `fit`), `Rot`, `Scale`, `quadPt`, `W` (depth ink) | |

## Consistency contract (every lane)

1. **The same objects in every panel**: the laptop is `Laptop` (hero lid, dark screen with a core glint; the NEW one
   `variant="new"` + `label="BETTER"`), the tag is `PriceTag` (hero body, white price, blue eyelet), the phone is
   `Phone` + `Hand`, the building is `DataCenter` (same sign, rows of small lights, 3 roof units, snow line), the
   person is `YouFront` / `YouSeated` / `YouTiny` (dark hair, rust sweater, dusk-blue jeans), the stick is
   `MemoryStick` (gold, 4 chips). Never redraw them by hand; extend the kit (request it) instead.
2. **Ink by ATTENTION TIER, not by depth** (the rework, 2026-10-27; "Clean pen and tiers" below, docs/look/CRAFT.md
   wins): the beat's subject is the only full outline (3.0 px, in its own deep shade, inside its fill); supporting life
   has no outline (Pip: a same-hue ~2 px line); the room, the sets, the street and the town have NO line. The authored
   widths (front 4.8, mid 3.4, far 2.2, hair 1.6) still set each piece's relative weights; the pen maps them per tier.
   Fills are flat and registered exactly; no gradients, blur, opacity fades.
3. **The caption band (screen y ~290-600) stays calm**: flat wall or flat sky only; no tops of buildings, roof units,
   piles or shelves' ink in it (Nook breaks the shelf upright's ink across it; the pov window's reveal starts at y 590).
   Platform UI covers the top, the bottom and the right rail (x > 950, y 900-1500): keep tags, signs and words out.
4. **One time of day** (blue hour, first snow): no day skies, no sun; outdoor captions white.
5. **Colour jobs as above**: hero only on laptops and the tag; one blue pop; gold sticks; warm = ours, blue = theirs.
6. **No board notation in G5**: no red pencil, no notes strip; the red circle is `signLitAt` (or another light / pop).

# Life and density kit (G5b): every frame full and alive

The owner on the G5 cut: "way too empty". The rules: `docs/look/LIFE_AND_DENSITY.md`; the per-panel plan and the kit
list: `docs/v3/density_plan_g5b.md` (§0 film-wide, §1 per panel, §2 kit list; `docs/v3/s9_scale_plan.md` wins for S9).
Same conventions as above: canvas px at camera rest, an optional build `at` (ink first, fills `FILL_LAG` later), a
`seed`; **every idle motion is a pure function of scene seconds** (60 fps moves every frame; only drawn poses step:
`stepped()`), deterministic, flat fills, **no opacity** (things pop, shrink to nothing, or sweep), ink by tier (the
clean pen below: dressing and ambient life are tier C, no line; their idle amplitudes scale with `useTierMotion()`).
Dressing never takes the hero orange or the blue pop; it lives in the room (warm) and outside (dusk-blue) families.
Sheet: KitSheet3 (2160 x 9600, two columns; screens 4-10 are this kit), or alone: `npx remotion still
src/entry-v3-kit.tsx KitSheetLife out.png --frame=90 --scale=0.5`; two dressed density-test frames at full size:
compositions `KitLifeO1`, `KitLifeS4` (kit pieces at the plan's places; the lanes own the real sets).

## The idle clocks (`idle.ts`)

| Export | Use |
|---|---|
| `sway(t, amp, period, phase)`, `sway2` (two-frequency), `bob(t, amp, hz, phase)` | vines, signs, laundry, breathing |
| `ring(t, at, amp, hz, decay)`, `rings(t, ats, ...)` | secondary motion: a damped jolt after a cause (things hop, a sign swings, notes flutter) |
| `hopY(t, at, h, dur)`, `ease01(t, at, dur)`, `stepped(t, fps)` | a hop; an eased 0..1; time quantised to drawn poses |
| `twinkle(t, seed, i, n, every 0.5)` | is bulb i dimmed (a bulb somewhere every ~0.5 s) |
| `windowLit(t, seed, i, n, {gap [0.6, 1.5], litFrac, force})` | is window i lit (one switches somewhere every 0.6-1.5 s; `force` = scripted switches) |
| `events(seed, t0, t1, gap)` | seeded event times (cached) |
| `loopPos`, `crossing`, `shuttle` (with `holdK`) | a wrapping mover, a one-off crossing, a back-and-forth (forklift, pacing worker) |
| `puffs(t, opts, originY)` | a puff train that grows, rises, drifts and SHRINKS TO NOTHING (`ceil`: never above the band) |
| `sweep(t, ats, dur)` | a headlight band's progress |
| `floatCam(t, {dur, seed, speed [8, 12], box [12, 10], leg [0.6, 1.5], startHome, endHome, turn 0.34})` | the cozy FLOAT (cozy v2 §3): the camera's [dx, dy] from home, straight legs that turn back eased, inside the box; from home at t 0 and back through home on the last frame, still moving. Wrap the set in `mat.translate(dx, dy)` (S15) |

## The living character: Pip in Autumn Ember (`Pip3.tsx`)

| Export | Props / notes |
|---|---|
| `PIP_EMBER` | the lib `Colorway`: body lilac `#A983C9`, shade `#8C68AE`, ear inner and cheeks `EMBER.nail`, nails `wall`, ink `EMBER.ink`. Measured ΔE76 (sheet screen 5): wall 56, desk 62, shelf 58, sky 28, skyLow 23, dc 33, snow 49, road 36, brick 66, pop 33, hero 82. Lilac is used for nothing else. |
| `Pip3` | `x y` (feet) `scale` (1 = ~96 px; close-ups 1.6-1.9 with `lineWeight` 1.25), `pose` or `keys` [{t, pose, look, expression, amount}] (each switch a squash-and-stretch pop), `look` (value or [{t, v}] eased over `lookDur` 0.16 s: the head turn that points the eye), `hops` [{t, to?, dur, height}] (in place, or to a new perch), `jolts` [t] (a startle without a pose change), `at` + `drawDur` (draws on), `exitAt`, `outdoor` (a snow-lit rim along head and back), `snowCap` (0..1 or [t0, t1]: grows), `shakeAt` (flung off), `idle` (1: blink, ears, tail, breath never stop), `flip`, `seed`. Poses: sit-back, sit-front, stand-side, walk-side, peek, trunk-up, hold, ears-cover, shrug, sleep (`src/lib/mascot`). `pipPlace(t, x, y, hops)` = where its feet are (aim things at it). |
| `PipTiny` | S9's end: a 50-60 px back-view silhouette (pear body, round head, two big ears, the trunk curl past one cheek, a tufted tail), idle ear flicks and tail, `hopAt` (the thoom), `outdoor` rim, `side`. |

## People (`People3.tsx`, on the house `Person`: back view always)

| Export | Props / notes |
|---|---|
| `WinterPerson` | Person + `wear`: earmuffs, umbrella, bag, coffee (steam), clipboard, hivis (peach with snow-white bands), hardhat, snow (hat + shoulders, clipped to the coat), badge (the van driver's cap), point (`pointAt`), wave (`waveAt`); `phoneWin` [t0, t1] (the phone goes up and drops), `moves` [{t, kind: lean / recoil / nudge / hop / turn, amp, dir}], `breathe` (2 px, staggered by seed). Colours by seed from `WINTER` (never rust, hero or pop). `x y` = hip line, `s` scale. `personGeo(seed, {torsoH, legs})` = the house figure's w, h, hr, round, head top. `coatDetail` [quilt, yoke, zip, pockets] (tone-on-tone folds + thin ink on the coat, clipped to it, under hair / scarf / hood / pack: no front-row back stays one flat fill; drawn through the house Person's `torsoOver` slot). `winterPhoneAt(props, t)` = where its raised phone is ({top: the camera end, mid}, canvas px; null while down); `winterPersonMat(props, t)` = its local -> canvas matrix. |
| `BackRow` | near backs (a LIFE_AND_DENSITY §4 size, not an attention tier; kit tier `support`, `CRAFT.md` §b): `x0 x1` `top` (the head tops' line) `head` (90-140 px, playbook) `n` (3-6), `people` (per-person overrides), `moves` (whole row, staggered 2 frames), `lookX` (all lean toward the subject), `snow`, `riseAt` {i: t} (someone squeezes in from below). Long torsos run past the frame bottom. `backRowPhones(rowProps, t)` = every raised phone [{i, top, mid}] in the row's space (S4's flash follows it); `backRowLayout(rowProps, t)` = each back's WinterPerson props and lean. |
| `Walker` | mid walkers (110-260 px; kit tier `environment`): `from to` (feet), `h` (`h1` into depth), `speed` / `phase` / `pause` (wraps) or `window` [t0, t1] (crosses once), `dog`, `wear`, stepping legs. `Dog`. |
| `TinyWalkers`, `Tiny` | far crowd (15-60 px; kit tier `environment`), fill-only: `from to` `n` `h` [near, far] `kinds` (walker, dog, sledge, umbrella, pair) `both` directions. |
| `WindowSilhouette` | a pane with a neighbour: `who` cross / read / wave / cook / stand / none, `lit` (bool or fn of t), `curtains`, `plant`, `far` (no ink). |
| `WindowLife` | a block of panes on ONE switching schedule (`gap`, `litFrac`, `force`), some with silhouettes. |
| `Worker`, `Guard`, `MiniCrate` | hi-vis + hard hat, `carry` (a crate of gold sticks on the shoulder), `walk` {a, b, dur} (paces), `stopAt` (stops and turns); the guard: cap + hi-vis, `stepAt`/`stepTo`, `waveAt`. |

## Weather and window life (`Weather.tsx`)

| Export | Props / notes |
|---|---|
| `SnowLayers` | far / mid / near flakes (dia 2-3 / 3-5 / 7-10 px), `x y w h`, `density`, `speed`, `wind`, `offset` per layer (parallax), `band` (default [290, 600]: every other flake shrinks away, none over 6 px; null inside a window under the band). |
| `SnowSill`, `SnowCap`, `Frost`, `Icicles` | a ridge on a sill / ledge (`drips`); a cap on any box; frost scallops with star ticks in pane corners; icicles that drip every ~1.2 s. |
| `PuffTrain`, `Smoke`, `Steam`, `CoolingPlume`, `Exhaust` | flat puff trains (`stretch`, `ceil`): chimney smoke (skyLow, drifting right), steam (snow, straight up), the data center's plume (never above y 600), a vehicle's exhaust. |
| `NearFronts` | the kit list's "NearRoofs" (renamed: the S9 lane owns a rooftop `NearRoofs`): 2-4 house fronts behind a window, snowy roofs, 6-10 warm windows on one schedule (`sil` {index: who}, `force`), chimneys with smoke; fill only. |
| `SkyClouds`, `LowClouds`, `BirdV` | flat cloud masses drifting 6-10 px/s (keep `y1` <= 290; `shape="lobed"`, opt-in: flat-bottomed lobes, never the crown's half-disc bulges, which read as a halo behind a building); a low pale bank (S9's lobed `CloudBank` is the S9 lane's); a V of birds flapping. `BAND` = [290, 600]. |

## Room dressing (`Room.tsx`)

| Export | Props / notes |
|---|---|
| `ShelfFill` | `planks` [{x0, x1, y, room}] `scale`: upright books (14-40 x 80-150, 5+ colours, bands, labels, a leaner), lying stacks, a framed photo, a jar, a succulent, a trailing pothos at one end. `Book`, `WallShelf` (plank + brackets + contents). |
| `Plant`, `Leaf`, `LEAF2` | `kind` pothos (vines trail `trail` px and sway +-3 px / 3 s) / succulent / snake / floor / cactus, `size`, `snow`, `shakeAt`. |
| `StringLights3` | `from to sag` or `points`, `n` `r`, `onAt onDur` (blink on one by one), `every` (a twinkle every ~0.5 s), `halo` steps (default room core / ring; outdoors pass [skyLow, ring]), `sway`, `swingAt`. |
| `Pinboard`, `PinnedThing` | cork board, 5-7 items (photo, note, postcard, ticket, list), each sways about its pin and flutters on `flutterAt`; `avoid` a rect. |
| `FramedPrint`, `Poster` | mountain / sea / leaf / sun prints; the lost-cat flyer (tabs flutter) and a concert poster. |
| `PenCup`, `Headphones`, `BookStack`, `StickyNotes`, `Cable`, `Glasses`, `Speaker` | desk clutter at both depths (`Cable` = a path through `points`: the lane moves it with the phone; `plug`; `Headphones bandFill`, opt-in: the band a filled shape, so the light layers' silhouettes include it). |
| `DeskGrain`, `WallMarks`, `PullChain`, `HaloStep`, `CupSteam`, `useJolt` | short organic grain pairs (never a long line), plaster ticks (not in the band), the lamp's swinging pull chain (S7's loop). |
| `Radiator`, `Rug`, `CoatHook`, `ToteBag`, `Slippers` | S13: a sock that sways on the radiator, a striped rug in perspective (`quad`), a coat and scarf. |

## Street and industrial life (`Street.tsx`)

| Export | Props / notes |
|---|---|
| `LampPost3`, `WallLamp` | post with a snow-lit edge, lantern core, flat halo steps (`halo`), snow cap; `arm` top / left / right; 70-300 px. |
| `SnowTree`, `Bike3` | pine (tiers with snow) or bare (snowy branches), slow sway; an ink-only bike with snow on the saddle. |
| `Car3`, `PassingCar`, `HeadlightSweep` | `view` side / back / front, `dir`, `lights` (+ a beam step), `snow`, `exhaust`, `rolling`; a one-off crossing; a flat band sweeping a wall (`at` [t], 0.8 s). |
| `RoadDress`, `roadPt`, `roadScale`, `Footprints`, `Pavement` | a road quad {yB, yT, xBL, xBR, xTL, xTR} dressed in true perspective (kerbs with gaps, snowbanks with ridge ink, two tyre tracks, lane dashes, a steaming manhole, footprints); a straight-on pavement (S4). |
| `BusStop`, `Fence`, `GateBooth` + `barrierAngle`, `PostSign`, `Floodlight` | shelter with 2-3 waiting people (`turnAt`); a receding fence; the booth with a barrier that lifts in 0.25 s on a stepped pivot (`liftAt` / `lowerAt`, `guardInside`); DELIVERIES (letters >= 22 px); floodlight halo steps on brick. |
| `Pallet`, `StickCrate`, `Forklift` | gold sticks with chips showing; the forklift's back-and-forth `loop` {a, b, dur, hold} (forks lift at b), a blinking beacon. |
| `UtilityPole3`, `Wire3` | pole with crossbar and snow; wires with sitting birds (head bobs) that lift off on `birds.liftAt` and wheel away. `lifeBeats`, `useHop` helpers. |

## The places round the information and the shop (`Shop.tsx`)

| Export | Props / notes |
|---|---|
| `CardBoard`, `Clipboard` | the board round a card (`card` rect, `margin` 24-30): 'notice' (red-brown frame, cork, glass glints) or 'cork'; `corners` [{corner, kind: flyer / concert / card / slip / note / photo / clipboard}] peek from behind the card (draw the card after it); `flutterAt`. |
| `Cornice`, `Fascia`, `Drainpipe`, `DisplayWindow`, `LaptopBox`, `ShopDoor` | S4 / S6's street wall: cornice with snow and dripping icicles, the COMPUTERS fascia (warm letters on dusk blue, ~56 px), a pipe with an ice foot, the lit display window (boxes, a monitor's screensaver), the glass door with the swinging OPEN sign (`signX`) and a bell (`bellAt`). |
| `ShopShelving`, `ShopWindowView`, `CardReader`, `ReceiptPrinter`, `PaperBag`, `UsbJar`, `CounterBell` | S5: shelves round the BETTER `slot`, a screensaver, router LEDs, hooks, talkers, `joltAt` (the pop jolts the shelf 4 px); the window onto the street with `walkers` [{t0, t1, dir, wear, dog}]; the counter (the receipt feeds on `feedAt`, the loop). |
| `StripLight`, `CableTray`, `DockWindow`, `CoffeeMachine`, `NoSmoking`, `Bench`, `BootMat` | S11's drivers' room: one stepped flicker (`flickerAt`), the dock window with a truck and a forklift passing (`forklift` [[t0, t1]]), the coffee machine's blinking button and steaming cup. |

## Town variety and the deck (`Town.tsx`)

| Export | Props / notes |
|---|---|
| `TownHouse`, `TownRow` | five types, never one stamped shape: cottage, terrace (a dormer run), block (balconies, a dish), mansard, shop (awning, lit sign); windows switching, chimneys smoking, antennas; `far` = fill only. A row cycles a seeded shuffle of the types, +-15 % widths, stepped heights. For the S9 lane's MidTown / FarField bands. |
| `RoofNeighbour`, `Pennant`, `RoofAerials` | a shoveller on a 4-drawing loop (snow puff on the throw) or a balcony light-hanger (30-60 px); a pennant at 1.5-2 Hz. |
| `FoldingChair`, `SideTable`, `LaundryLine`, `Shovel` | S9's deck: a snow cushion, a steaming mug, laundry that sways, a shovel leaning. (No tram: the S9 scale plan drops it.) |

# Clean pen and tiers (the rework before publishing, 2026-10-27)

The owner on G5b: "too busy ... too rough and messy, a lot of rough lines, not looking clean at all ... cleaner, more
refined, gentle ... premium"; supporting life "a bit more subtle but yet alive". The spec is `docs/look/CRAFT.md` §b-§c
(it wins over this page); the measurements behind it are the v3 retro (`docs/retro/2026-10-27_v3_retro.md`). The code:
`lib/pen.ts` (the switch, the tier values, the colour maths), `lib/tier.tsx` (the scopes and hooks), the strict
geometry in `lib/sketch.ts`, the clean paths in `lib/Ink.tsx` / `lib/Fill.tsx` / `lib/mascot/Elephant.tsx`. **All of it is
opt-in**: `src/v3/film/look.ts` calls `setPen('clean', {bg: EMBER.wall, emissive: V3_EMISSIVE})` and is imported right
after `../palette` by `src/entry-v3-film.tsx`, `src/entry-v3-kit.tsx` and this kit's barrel. Every other entry keeps the
sketch pen (v1, v2 and v2r frames checked pixel-identical before and after).

## The pen (every line, every tier)

- One subpath per shape: `rect()` / closed `poly()` / `ellipse()` / `circle()` end in `Z` (round joins), a rect's partial
  `edges` are one joined stroke per run; straight edges ruler-true (no bow, drift, jitter, overshoot or breaks);
  loops are true ellipses (wobble <= 0.01 only when asked) and sit exactly on their `blob()` fill; `glint()` is one
  light stroke; `hatch`, `scribbleMass`, `wallTicks`, `crownTicks`, `speedLines`, `scribble`, `cross` draw nothing.
- `<Ink>`: uniform round-capped strokes (no taper, width noise, open contours or loosening on the un-build); width and
  colour from the tier (below). `<Fill>`: registered exactly (authored offsets included); calmer tiers recoloured.
- Kit texture that is strokes is gone under the clean pen: `DeskGrain`, `WallMarks`, the frost star ticks, the NEW
  laptop's sparkle crosses, a flying stick's speed ticks, a small stick's pin row; the laptop's key rows are flat
  tone-on-tone caps (`heroDeep`; the S8 close-up keeps its anchor caps). Life stays, lighter (CRAFT: subtle never means
  removed): the mug's steam is a light wisp (`EMBER.card`), not a dark squiggle.

## The tiers (by story role, never by depth)

| tier | line (screen px, at camera rest) | fill | idle motion |
|---|---|---|---|
| `subject` (A: the beat's 1-3 objects) | the only full outline: authored x0.88, 1.2-3.0 (3.4 -> 3.0, 2.2 -> 1.9, 1.6 -> 1.4) in the object's own shade (tone L* -35, floor 16; no tone: `#4B2A1E`); an outline given `inside` is drawn inside its fill at 2x (the silhouette is the fill's clean edge) | as authored | x1 |
| `support` (B: supporting life, story objects off-beat) | none, unless the scope says `lines` (close values touch; the mascot; a line-drawn figure): same-hue x0.53, 1.6-2.2 at tone L* -20 (no tone: `#5A2E1E` at 42 %) | value pulled 8 % to the background's, chroma x0.9 (<= 40), hue kept | x0.5 |
| `environment` (C: the room, sets, dressing, street, town, weather) | none; strokes marked `thing` (wires, rails, frames, a bird's V) as hairlines 1.2-1.6 (`#5A2E1E` at 34 %, about dL* 15) | value pulled 16 % to the background's, chroma x0.85 (<= 36), hue kept | x0.4 |

On every tier: a LIGHT line (ink lighter than L* 64: glints, snow edges) stays light and <= 1.8 px; a GRAPHIC stroke
(>= 6 px, or dashed) keeps its width and colour (the lamp rod, a mug handle, the chart line); backdrops (>= ~30 % of the
frame, camera excluded, or `<Fill backdrop>`) and emissive colours (`V3_EMISSIVE`: lit windows, the lamp's pool and
mouth, server lights, screens) are never recoloured; open strokes under 8 px (support) / 24 px (environment) drop.

## API

- **Every kit export takes `tier`** (`'subject' | 'support' | 'environment'`) and has a default (below). Resolution: an
  explicit `tier` > a forced scope > the piece's default. A piece's `tone` (the fill its lines bound) is set at its
  export; `bg` (what calmer fills are pulled toward: the sky outdoors, the wall inside) and `lines` inherit down.
- **Scenes force a group:** `<Tier tier="environment" bg={EMBER.sky}>...</Tier>` (`lines` to keep tinted lines; `tone`
  for the raw lines inside). Ink / Fill outside any scope are `support` WITH tinted lines (`PEN.untaggedLines`) until the
  scene tiers them: a set the scene draws itself should sit in `<Tier tier="environment">`.
- **Kit code:** `tiered(def, {tone, bg, lines}, Body)` wraps an export; `<TierPart def tone bg lines>` scopes a sub-part
  (Nook: the window's outside gets `bg` sky); `<Ink thing>` (the stroke IS the object), `graphic`, `tone`, `inside={fillD}`
  (subject outline inside its fill); `<Fill backdrop>`; raw SVG as `TPath` / `TRect` / `TCircle` / `TEllipse` (`kit/util.tsx`:
  the stroke and a hex fill follow the tier; `thing`, `contour`, `tone`; a dashed stroke off the subject is texture: dropped);
  `useTierMotion()` scales idle amplitudes; `useTierPaint()` / `useTierLine()` for anything else raw; `pipLook(tier)`.
- **Defaults:** subject = `Laptop`, `ScreenDesktop`, `PriceTag`, `Phone`, `Hand`, `MemoryStick`, `StickFlight`,
  `StickDetail`, `LineChart`, `BarChart`, `YouFront` / `YouSeated` / `YouBack` / `YouTiny`, `DataCenter variant="mini"`;
  support = `DataCenter` (with tinted lines), `ChartCard`, `SpeechBubble`, `ThoughtBubble` (tinted lines), `Pip3` / `PipTiny`
  (C* <= 25, a same-hue line ~2 px, no offset rim), `WinterPerson`, `BackRow` (tinted lines: the backs overlap), `Worker`,
  `Guard`, `MiniCrate`, `Pile`, `Calendar` with `flipAt`, `WaitingDots`; environment = everything else (the `Nook` and its
  window, desk, lamp, shelf, mug and notebook; `NookOutside`; the roof, deck and town pieces; `ChipFactory`, `Van`,
  `DataCenter variant="far"`; walkers, tiny walkers, window people, dogs; all of Room, Shop, Street, Town and Weather).
  A scene raises a piece when the beat is about it (`<DataCenter tier="subject">` at O1's 4.04; `<Van tier="subject">`
  in S14; `<ChipMaker tier="subject">` when it speaks).

## Measured (full-res frames, caption band masked; before = G5b, after = this pen; tools in the retro)

| frame | line length / Mpx | dark-line px | lined colour edges | env local contrast | subject / env contrast | salience peak / median |
|---|---|---|---|---|---|---|
| O1 2.0 s | 23.5 k -> 7.9 k | 6.7 -> 1.9 % | 62 -> 26 % | 10.4 -> 6.8 | 1.5 -> 2.1 | 1.90 -> 2.23 |
| S13 32.9 s | 32.2 k -> 10.1 k | 8.3 -> 2.1 % | 65 -> 20 % | 10.6 -> 6.0 | 1.2 -> 1.5 | 1.75 -> 2.19 |
| S9 22.4 s | 23.5 k -> 15.1 k | 7.4 -> 5.5 % | 62 -> 42 % | 9.2 -> 8.3 | 1.5 -> 1.6 | 1.66 -> 1.71 |

S9 moves least: most of it is drawn by the scene itself (untagged, so its tinted lines stay). The stroke-count and
near-miss-end budgets now count flat dark shapes (key caps, LED strips, the town's gaps), not lines.

## Open (for the lanes)

- Scenes: tier their own sets (`<Tier tier="environment">` round S9's deck / town / far planes, S13's room dressing and
  window view, O1's desk dressing), mark their line-built things `thing`, raise the beat's subject; raw scene strokes
  (`<path stroke=...>`, e.g. O1's flying-stick speed ticks) bypass the pen: draw them as `TPath` or drop them.
- Soft corners on made objects (CRAFT: r 3-6 % of the short side): a clean `rect()` outline rounds by <= 3 px only; a
  matching rounded fill needs a shared path per object.
- The light and shadow layer is the light engineer's (`kit/Light.tsx`): its fills are clean-pen backdrops.

# Light and shadow (`Light.tsx`, the rework before publishing, 2026-10-27)

The owner on G5b: "we don't have the shadows much and the light is weirdly put; lighting and shadows should be gentle
but should exist". The spec is `docs/look/CRAFT.md` §d (it wins over this page); the measurements behind it are the
retro's light lens (`docs/retro/2026-10-27_v3_retro.md`). **Everything is a flat shape:** a shadow is a flat shape
MULTIPLIED with the set's one tint family (every surface gets darker and hue-shifted for free: never grey, never a
hand-picked fill; shadows inside one layer never double-darken); a light is a flat step LIGHTER and WARMER than what it
lands on (pools, spills, a rim), never a disc sticker; a soft edge is 2 flat steps (a half-tint band), never blur, a
gradient or an opacity fade. Opt-in and local to this kit (CRAFT's `lib/light.tsx` is its promotion): nothing in `lib/`
changes, every light fill is a clean-pen backdrop (never recoloured by a tier), and the module is pen-agnostic (exact
paths, no `lib/sketch` strokes). Demo: `node scripts/render-frames.mjs LightDemo out 3.0 --entry=src/entry-v3-kit.tsx`
(the nook's desk props + a blue-hour street corner, 2160 x 1920; `--props='{"lit":false}'` = the same frames before the
light system), `LightNook`, `LightStreet` (1080 x 1920 each), `LightRigCheck` (`lightProblems()` for every rig: it must
say 0 problems).

**Layer order** (bottom to top): the set's fills -> ground light (`LightPool`, `WindowSpill`; `Halo` right after the
sky) -> ground shadows (`ShadowLayer`: `ContactShadow`, `CastShadow`, `Shadow`) -> the objects -> per object `FormShade` /
`Shade` -> `Ambient` (LAST over the set: one step down outside the light) -> `Rim`, `PoolLift`, `SourceCore`. Captions
are the Film's: never lit. Ink is multiplied like the fill under it (near-black stays near-black: "ink stays unlit").
Geometry is canvas px at camera rest: put the layers inside the same camera group as the set.

**The gate:** `scripts/qa/check_light.py` on an A/B pair of the same frame. Any composition renders its A side with
`--props='{"lightOff":true}'` (every light layer off, no panel edited), so the diff finds every light and shadow pixel:
the brightest 5 % (sky and caption band out) centred within 0.15 H of the subject, no greyed or too-dark shadow pixel,
one light value across the caption band, every pool and spill >= 4 L* over its ground; the CRAFT §d.10 shares reported.

## One rig per set (CRAFT §d.1: decided with the story; the key is where the eye goes)

| place | key | shadows (one family per set) | light shapes |
|---|---|---|---|
| **nook** (O1, S7, S8, S12, S13, S15, S16): `nookRig({lamp, pool, glass})` | THE desk lamp, screen-left: a point light (`src` = the shade's mouth from the `LampPose`, `foot` under it, `H` its height over the desk); the window = a cool fill that only colours (`Rim from="fill"`); the glass is a source | rose base `#CBA6A6` at 0.40 / 0.55 / 0.90: form `#EADBDB`, cast `#E2CECE`, contact `#D0AFAF`; ambient `#EEDED8` (wall 91 -> 82, desk 68 -> 61: peach stays peach) | the pool `POOL_DESK` on the ladder: ring `#FFD7A4` (L* 88), core `#FFE8C1` (93), the core toward the lamp's foot; the lamp's mouth L* 96 |
| **shop** (S5): `RIGS.shop` | the ceiling's warm bank high upper-left: a sun (`toward` 35, `el` 64: short shadows falling right and toward us) | the room family | light on what it hits |
| **street** at blue hour (S4, S6, S10, S14, the window views): `withKey(RIGS.street, RIGS.street.key, [streetLamp(lantern, base)])` | the open sky (tops lit, no cast direction, contact shadows only; its bright side upper-left for form shades); street lamps are practicals (their own pools; cast shadows only inside them) | violet base `#BBA8DA` at 0.50 / 0.58 / 1.0: on the ambient snow form / cast / contact -12 / -13 / -23 | pools `#EADBD2` / `#F6E4CA` on the open snow painted at its ambient `#C9CFE6` (L* 83); lit panes `#FFD27A` (L* 86) with their spill `#EBD8C8`; one halo step on the sky only (r <= 1.7x the lantern; `on` = the sky band behind it); lanterns L* 96; sky-facing snow caps `#D9DFF2` (L* 89, thin, under the pool core) |
| **roof** (S9): `RIGS.roof` | the glow beyond the town as a 3/4 BACKLIGHT (a sun `toward` 100, `el` 58): tops and key-side edges lit, the camera-facing sides and backs in shade (`form.backlit`), short shadows toward us | the dusk family | `Rim` on You's back and the stick (the darker field behind them) |

`lightAt(rig, p)` picks the light that shapes a spot (the practical whose pool holds it, else the key if it casts);
`castVector`, `groundDir`, `lightDir` give the screen vectors; `withKey` copies a rig with a shot's own key geometry.

## API

| Export | Props / notes |
|---|---|
| `Lit` | `rig`, `off` (no light layer: the A side; `LitWindow` and a panel's own `useLightOff()` colours switch back with it; the input prop `{"lightOff": true}` does the same for every composition). `useRig()`, `useLightOff()`. |
| `ShadowLayer` | one isolated multiply group for a set's ground shadows; `exclude` = paths or the drawn elements (their silhouettes stay clear) when the objects were already drawn (a kit set that draws everything at once). |
| `ContactShadow` | `x y` (the footprint's centre on the ground) `w`, `h` (6-12; 16 a vehicle), `k` (1.05-1.15; people 1.2-1.3), `d` (a custom footprint: a strip under a laptop's deck, a notebook's cover: then it shows as a sliver on the side away from the key; the desk / wall crease), `away` (3.5 px away from the key), `tint` ('cast' for a building's base: gentler). Self-wrapping: works inside or outside a `ShadowLayer`. |
| `CastShadow` | the footprint (`x y w` + `depth`, or `pts`) swept along the light, `h` = the object's height; under a lamp h·d / (H - h) capped at `rig.cap` x h and clipped to the lamp's pool, each pool step with its own tint (`poolCastTints`: the cast tint, weakened just enough never to land darker than the unlit ground past the pool's edge: one family, never grey); under a sun h / tan(el); sky: nothing. `light` forces one light (a walker crossing a pool: no pop at its edge); `soft` [base, tip]. |
| `Shadow` | any shape: a drop shadow on a wall or a lid (`dx dy` = `dropOffset(rig, c, gap)`, `clip` = the surface it lands on), an eave's underside, a desk's front-edge strip; `soft`. |
| `FormShade` | `of` (the SAME element you drew) or `d`, `c` + `size` (with `of`), `frac` (0.25-0.4), `kind` 'band' (a side terminator: boxes, cylinders, people) or 'crescent' (round things: the object minus a copy moved toward the key), `dir` to force. Give it to every object in a lit zone; supporting things in the ambient get only their contact shadow (calm). |
| `Shade` | a whole plane one step down (`d` or `of`): the attic slope, a shelf's cubbies (`tint="cast"` strips under its boards), a facade turned away from the bright sky, an underside. |
| `Ambient` | one multiply of `tints.ambient` over `region` (default the frame) with ordered `holes` (`LightHole`: `e` / `d` / `rect` / `of`, `soft` + `steps` 1-2, `kind` 'lit' or 'dark' to paint the tint back, `clip`): the glass and every source (hard), the pool (hard: its two steps are its gradient), every object standing lit in the pool (`of`), a lamp's wall wash (`washHole(rig, deskY)`: 2-step ~26 px edge, cut at the desk's crease). |
| `LightPool` | the key's (or `light`'s) pool as two opaque steps (`poolSteps`; `poolFor(pose, groundY)` derives a lamp's pool from its mouth). |
| `WindowSpill`, `LitWindow` | a lit pane's trapezoid on the ground (`win`, `base` = the wall's foot, `widen` 1.3-1.6, `depth` 0.6-1); the pane itself at `rig.window`, exact. |
| `Halo`, `SourceCore` | one step on the sky behind a lantern (draw it right after the sky; r <= 1.7x `w`; `on` = a lighter sky band behind it: the step is taken from that); a source's core at L* 96 (a lantern's glass, the lamp's mouth). |
| `PoolLift` | screen `rig.lift` (#4A2E10: +6..+11 L*) on a warm object in the pool (`d` or `of`; clipped to the pool, `pool={false}` for a thing standing in it); never on cool or dark parts (lift the deck, not the screen). |
| `Rim` | the subject's lit edge: 4-6 px inside the silhouette along the key-facing sides (the object minus a copy moved away from the light; a box gets its two key-facing sides whole), `cover` < 0.5 trims a ROUND thing further; `d` or `of` (+ `c`, `size`); `from="fill"` = the window's cool light. Never an offset copy of the outline. |
| helpers | `lab`, `lch`, `fromLch`, `multiply`, `screen`, `mixHex`, `step`, `tintFor`, `relit` (a lighter warmer variant), `tintFamily`; `ellipseD`, `polyD`, `rectD`, `ellipsePts`, `hull`, `inEllipse`; `lampMouth`, `streetLamp`, `poolSteps`, `poolCastTints`, `groundAmbientOf`; `lightProblems(rig, surfaces, {ground})`. |

A panel (S7's desk; the set as before, the light in a few lines):

```tsx
const rig = nookRig({lamp: LAMP, pool: POOL, glass}); const laptop = <Laptop x={540} y={1145} w={420} />; const mug = <Mug x={820} top={1040} />;
<Lit rig={rig}> ...set (its own pool shrunk away)... <LightPool /> <ShadowLayer><ContactShadow x={540} y={1240} w={440} d={deckFront} /><CastShadow x={540} y={1145} w={420} pts={hinge} h={269} /></ShadowLayer>
  {laptop}{mug} <FormShade of={mug} c={[869, 1100]} size={[98, 112]} /> <Ambient holes={[{rect: glass}, {e: POOL}, {of: laptop}, {of: mug}]} /> <Rim d={polyD(laptopGeo(540, 1145, 420).lid)} /> </Lit>
```

**The air and the street's kit (the WINDOW lane, v3 rework):** `kit/Haze.tsx` `Haze` (`k`, `color`) = ONE flat plane step
(CRAFT §f.2) for a whole kit piece whose inner colours a scene cannot pass: every colour in the group mixed `k` toward the
air (sRGB colour matrix: no blur, no fade; dusk-blue pieces only: a warm hue across from the air would cross grey, so recolour
those with `lib/depth.ts` `recede`); `twoStepIn` / `stepAt` = the house 2-step switch (3 frames at the half step). H2's data
center is `<Haze k={0.35 * s}>` round the kit `DataCenter` off its beats. `kit/Fleet.tsx` (`FleetVan` van / dc / better,
`NoticeFlip`, `CrateFlight` / `CrateBox`): `NoticeFlip` takes `binding` / `rings` (a calm header off the board's beats).

## Measured in the demo (`LightDemo` at 3.0 s, clean pen, CIE L*; the gate: LIGHT OK on both frames)

**Nook:** the wall (caption band) 91 -> 82, one light value across the band (dL* spread 1.2); the attic slope 66, the
upper cubbies 73; the desk 68 -> 61; the pool 88 / 93 (+27 / +32 over the ambient desk); the lit laptop keeps its hero
(53), its deck lifted to 61; the mug in the pool 91 lit / 81 on its shade side; the lamp's mouth 96; the brightest 5 %
centred on the subject (0.00 H); lit 14 %, ambient 77 %, shadow shapes 10 % of the frame outside the window view (CRAFT
20-30 / 45-60 / 10-20: this frame is one third caption wall, which must stay one ambient value). **Street:** open snow
83; pools 88 / 91; spills 87 (+4); lit panes 86 (the old 78 sat under the snow); lanterns 96; caps 89; the halo 65 on
the sky band's 58; the facade turned from the sky -6; shadows inside the pool 79 (mauve, C* 8.5) against the open
snow's 83; warm-lit 14 % (CRAFT 8-15); the brightest 5 % 0.06 H from the subject. Against the cozy references: short,
soft (a 12-14 px half step at the far end), coloured (violet on snow, rose and mauve on the desk and in the pools)
shadows, and a contact shadow under everything that stands.

**Learned on the way (keep):** (1) under the clean pen the environment tier already pulls far snow toward the sky (the
window view sits near the night ambient by itself): never stack an `Ambient` on a tiered outside (it went to L* 74);
(2) v3's anglepoise points down and stands in front of the glass: a wall wash's edge wraps round the window and reads
as the WINDOW glowing, so `nookRig` has no wash (pass one only for a lamp against an open wall); (3) a soft band round
the pool hole reads as a third ring (a target): the pool hole is hard; (4) a rim limited by a half-plane stops abruptly
on a box's edge: boxes take the moved copy's key-facing sides whole; (5) CRAFT §d.7's example desk pool (#EBB07F /
#F6CD98, 76 / 85) sits under the ambient wall's 82, so the brightest 5 % lands on the upper wall: the pool goes on the
§d.2 ladder (88 / 93), and in a wall-heavy frame it must cover enough desk round the subject (the demo's is 5x the
mouth's half-width, past §d.7's 2.5-3.5x; S7's tighter frame passes with 3.5x); (6) a violet multiply on a warm light
(a spill, a pool, a cream shoe) cancels toward grey: the dusk base moved from #B4AED8 to #BBA8DA (a touch of plum); (7)
inside a pool a shadow must not end darker than the unlit ground past the pool's edge, and a "light removed" tint toward
the cool ground cannot be reached by a multiply on a warm pool (it lands grey): the cast tint weakened is both; (8) a
halo on the sky's lighter horizon band needs its step from that band (`on`), or it vanishes (+2 L*); (9) the
environment tier pulls sky-lit caps down to the ground's value: caps are drawn exact (`rig.snowCap`, backdrop).

## Open (for the lanes and the kit)

- `Nook`: an option to hand its pool to the rig (`pool: false` or pool colours); the demo shrinks `layout.pool` to
  nothing and draws `LightPool`. `EMBER.houseLit` (L* 78) -> `rig.window` (L* 86) for every kit house and window once the
  panels take the light (panes are the brightest warm things outside; the snow must sit under them).
- Kit silhouettes: `of` renders a piece with `Look fills="paper" ink={false}`; raw SVG that ignores `Look` (Pip's mascot
  paths) keeps its colours there, so give Pip only contact shadows. Pieces with exact outlines exported (`laptopGeo`,
  `tagShape`) can take `d` instead (cheaper: no second render).
- `Pip3`'s `outdoor` rim (an offset copy of its ink) -> `Rim`; `LampPost3` / `WallLamp` halo discs (2.6x and 1.5x the
  lantern; 3.2x the wall lamp) -> `halo={false}` + `Halo`; the street sets' ground snow -> `groundAmbientOf(rig)`.
- Export from the kit barrel (`index.ts`) once the pen work there settles; promote to `lib/light.tsx` (CRAFT) with the
  same opt-in.
- Cost: masks and blend groups took a demo frame (two full frames, ~30 light layers) from 0.8 to 2.7 s; use `d` where a
  path exists and one `ShadowLayer` per ground.

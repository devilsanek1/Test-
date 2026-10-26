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
| `DataCenter` | `x y` (base centre) `w h`, `variant` 'normal' \| 'dark' \| 'far' \| 'hall' \| 'mini', `sign` (text, '' blank, null none), `signAt`, `darkAt`, `signLitAt`, `units` (3), `blink`, `signH` (panel height px) | ONE building everywhere. Board sizes: 436 window, 371 far, 330 S10, 340 dark at the end of S9's pull-back (`signH` 52: ~40 px letters, readable at phone size). Sign reads from w ~300. `dataCenterGeo(x, y, w, h, variant, signH)` gives the sign/roof rects. |
| `RoofLedge` | `y` (top of the lip), `x0 x1 h`, `ventX`, `lipH` (36), `bricks` (9), `exact` | warm brick, snow lip, one vent; front ink. S9's parapet seen from behind: `h` 34 `lipH` 16 at the end of the pull-back (`exact`: no misregistration when a plane shows it 5x). |
| `RoofVent` | `x y` (body centre, the roof line) `w h capH`, `exact` | OUR vent (RoofLedge's): brick-shade body, dark cowl, snow cap. S9's near clutter (100 x 330 at the end, 3.3x at the start, cut by the left edge). |
| `BrickStack` | `x y` (left, cap top) `w h`, `capH`, `pots` [u] + `potW`, `color shade` (town stacks: roofs / dcSide), `bricks`, `exact` | a chimney stack: brick with a shade side, corbelled cap with snow, terracotta pots. S9: 326 wide at the left frame, 1055 at the start (where the hall will land); keep pots where the stack's top is below the caption band while they are on screen (S9: u >= 0.8). |
| `ChimneyPot` | `x y` (left, rim top) `w` | the pot at the lens: ONE flat soft mass, no ink, rim one step lighter; wider than the frame (S9: 1200, crossing at 90 px/f, the only layer allowed that speed). |
| `MidTown` / `streetAt()` | `x0 x1`, `rows` [{y, w}] (back to front), `street` {yB yT xBL xBR xTL xTR}, `lamps` (5), `stacks`, `ground` (dc) | the mid roofs: rows of TownBand houses (varied heights, chimneys, lit windows) on shaded snow, and a LIT STREET: a dark road with snow banks, lamp posts on both curbs with warm heads and small separate warm pools, the street-front houses lit. Never a light wedge (the monochrome board's bright wedge read as a SPOTLIGHT; its zigzag roofline as TORN PAPER). |
| `RoofDeck` | `y` (far edge) `x0 x1 h`, `vp`, `planks`, `exact` | OUR roof deck: warm terracotta planks; the seams converge toward `vp` beyond the parapet (they lead to you; seams that meet AT the figure read as rays). |
| `PullLayer`, `planeMat`, `boxMat`, `startMat`, `s5Ease`, `planeSpeed` (`Pullback.tsx`) | `PullPlane` {o, off, k}, `PullBox` {from, to, s0} | the S5 pull-back rig (CINEMATIC_GUIDE S5): one progress p = `s5Ease(t / move)` for every plane; a plane is authored in END coords and shown scaled k^(1-p) about a pivot that travels o + off -> o (the board's SketchReel `{s, o}` moves exactly); near clutter goes box to box (`lin`); `startMat` draws a figure authored at its start size (the close back view before the hand-over); `PullLayer` compensates ink (screen width = authored x scale^0.2). |
| `Laptop` | `x y` (hinge centre) `w`, `lidH` (0.64), `variant` 'old' \| 'new', `taped`, `label` ("BETTER") + `labelAt`, `screen`, `rot`, `lidOnly`, `children` (on screen) | lid `lidH` w tall (S8's close-up from above: 0.36), deck 0.24 w. Reads from 150 px; at w >= 800 the keys are separate caps (dashed rows below). S8 at 1400 keeps the house line. `laptopGeo(x, y, w, lidH)` gives screen/keys centres. |
| `Phone` | `x y` (top-left) `w` (400) `h` (2.2 w) `rot` (-3), `title`, `badge` + `badgeAt`, `price` + `priceStrikeAt`, `newPrice` + `newPriceAt`, `priceY` (372), `buttonY` (400), `buttonText`, `pressAt`, `photoLaptop`, `children` (phone-local px) | `phoneSlots(w)` = local rects (photo, listing laptop, price, button, cart, badge); `phonePoint(phone, lx, ly)` = canvas point (aim sticks / the tag string). |
| `Hand` | `phone` (same geometry), `thumbTo` (local), `pressAt` | fingers, thumb on the button, palm + rust sleeve past the bottom; follows the phone when it lowers. |
| `PriceTag` | `x y` (box top-left) `w` (h = 0.5 w), `value` or `ticker` [{t, v}], `old` + `oldAt` + `strikeAt`, `oldSize` (0.16 w), `oldTone` 'white' \| 'cream', `stringFrom`, `rot`, `sway`, `turnAt` (back = mini data center), `backSign` ("AI"), `tone` 'hero' \| 'pop' | 360 in O1 (subject), 190 on S5's laptops, 460 in S16. Each ticker step pops the price and jolts the tag. `tagHoleAt()` = where a string ties on. |
| `MemoryStick` | `x y` (centre) `w`, `rot`, `chips` (4 at every size), `board`, `flat` | h = 0.31 w. Reads from ~60 px; 130 flying, 700 in S8. |
| `StickFlight` / `flightPose()` | `from to t0 t1`, `arc`, `w0 w1`, `rot0 rot1`, `end` 'vanish' \| 'shrink' \| 'land', `ease`, `trail` | one stick on an arc, shrinking into its target; `flightPose(t, opts)` is pure (aim the tag ticks at it). |
| `Pile` | `x y` (base centre / ground) `w h`, `stickW` (<= 130), `at` + `dur` (pops row by row, bottom up) | a big pile gets MORE sticks, never bigger ones (S9: 840 x 372 of 62 px sticks, past the right edge; gold with black chips, so it never reads as banknotes). |
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
2. **Ink by depth** (screen px): front 4.8 (phone, hand, roof ledge, YouFront), mid 3.4 (sets, laptops, tags, the data
   center), far 2.2 (town bands in the wides), hair 1.6 (details); far planes get NO ink (houses and the data center
   behind a window, the S13 silhouette). Fills are flat and misregistered; no gradients, blur, opacity fades.
3. **The caption band (screen y ~290-600) stays calm**: flat wall or flat sky only; no tops of buildings, roof units,
   piles or shelves' ink in it (Nook breaks the shelf upright's ink across it; the pov window's reveal starts at y 590).
   Platform UI covers the top, the bottom and the right rail (x > 950, y 900-1500): keep tags, signs and words out.
4. **One time of day** (blue hour, first snow): no day skies, no sun; outdoor captions white.
5. **Colour jobs as above**: hero only on laptops and the tag; one blue pop; gold sticks; warm = ours, blue = theirs.
6. **No board notation in G5**: no red pencil, no notes strip; the red circle is `signLitAt` (or another light / pop).

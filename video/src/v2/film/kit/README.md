# v2 film kit (G5): one look, one cast, LIVING sets, 13 panels

`import {...} from '../kit'` (from `src/v2/film/scenes/<ID>.tsx`). The barrel imports `../palette` first. Every prop
takes **canvas px** (1080 x 1920 at camera rest), an optional **`at`** (build start, scene seconds; omit = already built;
negative = part-drawn on frame 0) and a **`seed`**. Builds follow the house grammar: ink draws on first, fills land
`FILL_LAG` = 0.18 s later; inside a `<BuildWave>` (O1's opening, `o1Wave()`) every piece with no `at` is made by
position (ink wave, then the colour wave; raw-SVG life appears with the colour). Ink stays at screen weight at any size
(no scale transforms on ink). Everything is in seconds, deterministic, flat, and nothing fades.
Sheets (render them after any kit change; read them at phone size):
`npx remotion still src/entry-v2-kit.tsx KitSheet2 out.png --frame=90 --scale=0.5` (every prop at every board size,
section A = phone size; the palette check must say "0 problems") and `KitSets2` with `--props='{"set":"nookWide"}'`
(sets: `nookWide nook12 nook14 desk p5 p6 town cold coldDusk interview`, each fully dressed and living).

## Decisions (kit lane, 2026-10-26)

- **Time of day, ONE for the film: EVENING.** Inside, her warm lamp-lit home: the desk (O1, P12, LOOP) and the nook
  (P2, P4, P13, P5, P6) are the same home (cream wall, apricot desk, red-brown wood, golden lamp light on the wall and
  the desk). Outside her window, desk_A.png's saturated dusk blue `CC.sky` #4D5C99 over a DENSE town in flat value steps
  (`DuskTown`): sky, a lower step, the last light at the horizon (lilac `glowHi`, peach `glow`), moon, stars, clouds, a
  far skyline in haze (towers, a dome, a crane), two rows of roofs, the facades across the street, a pavement. No relight
  steps; every house tod name maps to it (`FILM_TOD`).
- **The cold set (P7, P9, P10, P11): `ColdSet`, picked variant `dusk`** (`COLD_PICK`; both candidates were rendered next to desk_A.png
  and pentagon_dusk.png, `KitSets2` sets `coldDusk` / `cold`): an official desk seen straight down, edge to edge, in DUSK's
  family: a mid-violet top (#716DB0, the Pentagon's own facade colour), a blotter under the page, a desk lamp from above
  with its cool pool (top left), the window's light in two panes across the lower half (a cloud's shadow drifts
  through), an in-tray, other documents (their corners lift in the draft), folders, a notebook, a desk phone (its line light blinks),
  a cup of cold coffee, reading glasses, a fountain pen (it rolls a little), a stamp and its pad, paper clips, a glass of
  water (a ripple), people passing the window (their shadows cross the light every 3.2 s, both ways), dust motes in the lamp's pool. It
  reads cold and official against her apricot home and stays in one Dusk family with P8. The rejected `night` variant
  (#3A3570) is ~49 % dark (L* < 30) for 12 s and breaks from both style frames' lightness. **The SAME set, size, page box
  and tone for the deal page and Google's page** (fairness). P10 = `zoom={0.85}` (the pull-back, about COLD_CENTRE).
  Captions over it: **white** (4.6:1 on the desk, ink only 3.6:1; the light panes start under the band): export `captionTone` light.
- **P3's interview room: `InterviewRoom` + `InterviewTableTop`**: a cool periwinkle studio (`CC.studio*`, not her home,
  not the cold set): a glass wall onto the dusk city with walkers on the far pavement (people passing), a softbox on a
  tripod, plain panels behind the heads (calm behind the faces), archive shelving with boxes cut by the right edge,
  ceiling track lights above the band, a tall plant, a colleague walking past outside the glass every 4.4 s; on the table a recorder with a blinking light, two water glasses, the
  mic's cable, a pen. Captions over it: ink (the wall is light).
- **Her cat: a warm dark tabby** (`CC.cat*`): reads on cream, apricot and dusk blue; never the hero cobalt, never the pop
  (a ginger cat would sit beside the orange pop and vanish on the apricot desk).

## Colour jobs (owner: warm, never sickly; measured with `scripts/qa/colour_meter.py`)

- **Hero cobalt `CC.hero` #3F7FE0: HER ONLY** (sweater, sleeve, her badge's lanyard; `sweaterRib` is its one shade step).
  Never Google, the deal, the Pentagon, the staffers (their lanyards are `lanyardA` / `lanyardB`), the town or the room.
  Measured: desk_A 7 %, the P5 set 12 %, P2 wide 1 %.
- **Dark anchor `CC.anchor` #2B2A44** (~5-8 %): her hair, the lamp shade, the mic, the laptop, the pen, the near roofs.
- **ONE pop `CC.pop` #EC6B2E (1-3 %): the highlighted clause and FOR LIFE only** (the highlighter tip, the band). Not on
  stamps (anchor ink), not on the cat, not on the rug (terracotta `rug` is far from it).
- Warm side = hers (the room); cold side = theirs (`COLD`, `DUSK`); the interview room sits between (cool, plain).

## Exports

| Export | Props (beyond `at`, `seed`) | Sizes that read at phone size / notes |
|---|---|---|
| `NookRoom` | `layout` 'wide' \| 'm12' \| 'm14', `town` (DuskTown props), `cat` (Cat props in nook-world px, `false` = none; default: sitting on the sill at `NOOK.catSpots.sill`), `lampOn`, `mic`, `blindY`, `slab` (false = no wall slab: the LAST panel drops it while it un-builds, so O1's bare lines draw on in place), `children` (drawn in NOOK WORLD px inside the room's matrix, after the chair, before the floor plant) | The room is authored in P2's canvas px ("nook world"). wide = P2; m12 = P13 (x1.2 about (164, 957)); m14 = P4 (x1.4 about (254, 1139.5)). Board figures in world px: P2 her standing (540, 1600, h 640); P4 / P13 her seated (420, 1600, h 600) on the chair; mic (577, 1298, w 75). `nookPt(layout, p)` world -> screen, `nookWorld(layout, p)` screen -> world (bubbles are screen px: draw them after the room). P4 shows world x 72-844 (a cat at the right sill is cut: use `catSpots.sillLeft` or x <= 760), P13 x 27-927. |
| `NOOK` | numbers | soffit, high shelf, bookcase, window (glass 290..950 x 620..1090, mullion 740, sill 1090), curtain, desk (top 1294), lamp (845, 1296), chair (330..450, seat 1426), mic, rug, `catSpots` {sill, sillLeft, floor, underDesk, deskEnd}, `herStand`, `herSeat`. |
| `NookDeskClose` | `town`, `slab`, `children` | P5's set (screen px): the home's high shelf and a hanging plant on top, window right onto the town, corkboard left (behind her head), a print over the laptop, the desk top from behind her (back edge 980), the lamp (900, 1000), the golden pool (560, 1190), papers, pen, mug. Put the kit `Laptop` (530, 953, w 460, `screen="ai"`), `HerBack` (110, 1600, h 1100) and the cat (loaf ~300 at (1010, 1330), tail / paws in the pool) on top. |
| `NookAngle` | `town`, `slab`, `children` | P6's set (screen px): the high shelf, a print and a hanging plant on top, window behind her (glass 560..1080 x 640..1130, cut right, mullion 900, a candle on the sill), bookcase left, two prints + the clock between (clear of the bubble 120..520 x 650..914), the desk front left (top 1450) with the lamp, pool (260, 1540), mug, books, a succulent, notes, a pen. `HerSeated view="front34"` (640, 1960, h 1100, facing l), `Mic` (260, 1452, w 120), the bubble and the cat (on the sill, ~120) on top. |
| `DuskTown` | `x y w h` (the GLASS rect, it clips itself), `horizon` (default y + 0.55 h), `k` (content scale), `moon` (point or false), `stars`, `clouds`, `cloudSpeed`, `flock`, `street`, `life` | Nook 660 wide at k 1; desk strip 240 at k 0.9; P5 k 1.25; P6 k 1.12; the interview glass k 0.85. A far plane: fills only, no ink. Life: clouds drift, a flock + a single bird cross, ~8 % of windows switch, two stars twinkle, neighbours cross two lit windows, three walkers pass on the pavement. |
| `DeskBack`, `DeskFront`, `DESK`, `o1Wave`, `o1Cam`, `O1_WAVE` | `at`, `lampOn` | O1 / P12 / LOOP, ported 1:1 from the approved style frame (StyleDesk A), now living: the town in the window strip, steam, the shelf plant's sway, dust motes in the pool. Compose `<DeskBack/> <Box/> <ContractPage {...O1_PAGE}/> <DeskFront/> <HerArm/>` (+ the cat). |
| `HerStanding` | `x y h` (feet, standing height), `facing`, `face` 'calm' \| 'worried', `talking` (true or [t0, t1] windows), `turn`, `hands`, `grip`, `lanyard`, `children` (the held prop: it moves with her hands), `life` | P2 h 640 (head r 58). Holding her contract: `hands={[[648, 1176], [752, 1180]]}` + `<ContractPage x={640} y={1170} w={120} runOn={300}/>` as children. |
| `HerSeated` | + `view` 'side' (P4 h 840 / P13 h 720 screen = h 600 world) \| 'front34' (P6 h 1100), `hands`, `legs`, `life` | `herMouth({x, y, h, facing, view})` = the bubble tail's point. Talking = the mouth steps at 10 drawings / s and the head nods. |
| `HerBack` | `hand`, `life` | P5 h 1100: the hair mass (anchor) reads as her at phone size; the hand fidgets (typing). |
| `HerArm` | `tip` (the highlighter tip), `reach`, `holding`, `axis`, `forearm` | O1 / P12 (the style frame's Arm). `clauseTip(O1_PAGE, bands)` aims it. |
| `Cat` | `x y` (the ground point under its middle), `size` (body length px), `pose` 'sit' \| 'sitFront' \| 'loaf' \| 'sleep' \| 'walk' \| 'peek', `facing`, `look` (a canvas point: head + pupils turn to it), `eyes` 'open' \| 'half' \| 'closed', `wash` ([t0, t1] paw-wash windows, sit), `life` | ONE model. Sizes: nook wide 116 (sill), 150 (floor); P4 / P13 120-170; P5 300; O1 desk 300-360 (`peek` over the desk's front edge reads best: it watches the run-on pour). Reads from ~90 px. Idle life on its own seeded clocks: breathing, a slow blink, an ear twitch, a tail flick. `catHead()` = its head point. |
| `Staffer` | `x y h facing variant` 'A' \| 'B', `face`, `talking`, `part` 'all' \| 'body' \| 'arms', `badge`, `hands`, `life` | P3: `P3_STAFF.A` (640, 1780, h 900; the one who spoke: short dark hair, wine sweater) and `.B` (905, 1780, h 820; bald, glasses, camel jacket). Order: `body` -> `InterviewTable` -> `TablePage` -> `InterviewTableTop` -> `arms`. Default hands: forearms on the table, hands together in front of the body (worried); A's near arm crosses the board's page (x 300-620): keep the CONTRACT title clear (page x <= 270, or A's `hands`). Life: breath, blink, a glance toward camera every ~3.5 s, a hand fidget, a swallow. |
| `InterviewRoom`, `InterviewTableTop`, `INTERVIEW` | | P3, see Decisions. Mic (185, 1352, w 150). |
| `ContractPage` | `x y w rot`, `title`, `clause`, `bands` or `sweepAt`, `sigAt` (null = unsigned), `sigDur`, `runOn` (canvas px past the bottom edge), `edgeY` (an edge it hangs over: shaded), `detail` 'auto' \| 'full' \| 'simple' | O1 / P12 w 420 (`O1_PAGE`); P2 held w 120 (the SIMPLE face below w 240: title bar, two lines, the pop clause band, half the rows, big years). The run-on carries a year every other row (2030, 2040 ...). `runOnLength(t, {stepAt, pourAt})` = the approved step out + pour, faster and faster. `sweepBands(t, at)` = the approved highlighter sweep. **"for life" is never written; the running line only ever runs on HER page.** |
| `FloorRun` | `from {x0 x1 y}`, `to`, `p`, `firstYear`, `decades` | P2: the run-on on the floor coming toward us (start the years after the hanging part's last, e.g. 2080). |
| `Badge` | `x y w rot text strap lanyard` | 168 (O1), 90, 62 (a staffer's chest: worn, `lanyard` non-hero). Hand-lettered GOOGLE from w 90 (never a logo). Her lanyard = `CC.hero`. |
| `Box`, `BOX`, `BADGE_REST`, `BadgeState` | `x y w`, `badge` (omit = at rest, null = absent, else in flight + `drape`), `jolt`, `knock` | O1: she packs the badge (the box has a plant, a photo frame, a folder). |
| `Mic`, `micFromBoard(bx, by, bw)` | `x y` (base centre on the surface), `w`, `tilt` | ONE plain mic: 150 (P3), 120 (P6), 105 (P4), 90 (P13), 75 (nook world). |
| `Laptop` | `x y` (hinge centre) `w`, `lidH`, `screen` 'ai' \| 'blank' \| 'dark', `hub` | P5 w 460: the abstract AI network (nodes pulse one at a time; never a logo or a company name). In the nook it lies closed under papers. |
| `Bubble` | `x y w h` (box), `tail` (her mouth), `at` (pops from the tail), `text` (her own word: FACTS), `textAt` | P4 / P6 400 x 264 with speech lines (no words); P13 400 x 264 FACTS (nothing else in it). |
| `Stamp` | `x y w text rot at` | APRIL 2026 (240, P7), NO VETO (330, P10): anchor ink, slams from 1.6x in 0.09 s. Never the pop. |
| `ColdSet`, `InsertPage`, `INSERT_PAGES`, `COLD_CENTRE`, `ColdGround` | set: `zoom`, `variant`, `life`; page: `x y w h`, `lift`, `children` | See Decisions. The page is warm white with ink, never angled; its lower-right corner lifts in a draft every ~4.5 s (`lift`). Put the words on it with `Letter`. |
| Room pieces | `HighShelf` (x0 x1 y: books, a pile, a photo, a box, a trailing plant, a jar; the home's top edge), `PotPlant` (`kind` leafy / succulent / trailing), `FramedPicture` (`kind` hills / sea / shapes / portrait), `Corkboard` (`lean`), `CoatOnHook`, `TableLamp` (`glow`, `glowClip`, `pool`, `motes`), `NookMug` (= `Mug`, with steam), `BookPile`, `PaperStack`, `FloorPlant`, `Books` | Shared by every set; reuse them for any dressing so the home stays one home. |
| Ambient life | `Clouds`, `Flock` / `Bird`, `Steam`, `DustMotes`, `WallClock`, `Sway`, `CandleFlame`, `Live`, `onOff`, `swayAt`, `loopT`, `stepT` | Each has a rate (`speed`, `period`, `rate`, `hz`). `Live` gates raw-SVG life: appears with `at` or the BuildWave's colour, shrinks away in an un-build (never a fade). |
| Lettering | `Letter` (`x y size anchor fit rot at dur spacing`; writes on left to right), `Txt` | THE hand (the caption font) for pages, stamps, bubbles, NAME WITHHELD, GOOGLE SAYS. Read at phone size from ~34 px. |

## Keep a panel alive (owner, 2026-10-26: "HOLD" means the CAMERA holds; the world inside keeps living)

Draft life is on by default in every set and character (G6 raises it to >= 5 medium events / s, no gap over 1 s):
her breath, blink, hair sway, a hand fidget and a nod while talking; the cat's breathing, blink, ear twitch and tail
flick; the staffers' glance, fidget and swallow; the town's clouds, birds, switching windows, neighbours and walkers; the
mug's steam, the dust motes in the lamp light, the candle, the clock's second hand, the plants' sway, the curtain's hem,
the blind's cord, the coat; on the cold set the window light's drift and a cloud's shadow, the rolling pen, the glass's
ripple, the page's lifting corner; in the interview room the recorder's light. Add panel-specific life on top (the cat's
`look` following the action is the strongest). Check a strip of 8 frames 0.2-0.25 s apart: several places must move.
Thin moving lines (birds, steam, a ring) barely register at phone size: life that must read moves FILLED shapes.
Baselines, `scripts/qa/density.py` on 4 s `KitSets2` clips at 0.5 (ev/s, flat, detail; shot targets >= 3.5, <= 40 %,
>= 34 %): nook wide 4.0 / 13 % / 61 %; P4 3.0 / 26 % / 46 %; P6 3.5 / 27 % / 40 %; P5 2.8 / 41 % / 31 %; interview 3.5 /
31 % / 35 %; cold set with a blank page 3.0 / 41 % / 28 %. Each panel adds its subject, its cast and its beats on top.

## Consistency contract (every lane)

1. **The same things in every panel, never redrawn by hand**: her (`HerStanding` / `HerSeated` / `HerBack` / `HerArm`:
   long dark hair mass, cobalt sweater, plum trousers; a generic figure, never a likeness), her cat (`Cat`, one model),
   her contract (`ContractPage` + `FloorRun`), her home (`NookRoom` / `NookDeskClose` / `NookAngle` / `DeskBack` and the
   room pieces), the town (`DuskTown`), the mic (`Mic`), the bubble (`Bubble`), the badge (`Badge`), the lettering
   (`Letter`), the cold set (`ColdSet` + `InsertPage`). Need a variant? Request it (REQUESTS line) and work around it
   locally meanwhile.
2. **Ink by depth** (screen px): front 4.8, mid 3.4, far 2.2, hair 1.6; figures by head size (`inkForHead`); everything
   seen through a window gets NO ink. Fills flat and misregistered; no gradients, blur or opacity fades.
3. **The caption band (screen y ~290-600) stays calm**: flat wall, flat blind, flat desk, flat sky only (the nook's high
   shelf and the soffit sit above it; the window's blind fills it in P4). Platform UI covers y < 180, y > 1520 and the
   right rail (x > 950, y 900-1500): keep words, faces and the clause out of them.
4. **One time of day** (evening): her room lamp-lit, the window dusk blue, the cold set and P8 in the Dusk family.
5. **Colour jobs** as above: cobalt on her only; one orange pop on the clause / FOR LIFE; stamps in anchor ink.
6. **The cat lives in her home only** (O1, P2, P4, P5, P6, P12, P13): never in P3, P7-P11; never on the clause, the
   bubble or her face; out of the caption band; secondary to the key action.
7. **Fairness**: no "Google" lettering in P6-P10 (the badge's GOOGLE belongs to O1); the deal page and Google's page on
   the same `ColdSet`, same size and place; her bubble holds only her own word; no logos anywhere.
8. **No board notation in G5**: no red pencil, no notes strip.

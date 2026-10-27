# K3, the lettering + boards kit (video 2 "One Small Window")

Every word the film writes on an object, and the objects that carry them, made new for this film (TREATMENT.md section 5
"Texts on objects", section 8 fairness, section 9 K3; positions from the K2 contract `src/v2r/world/map.ts`). ONE owner:
lane L5. Palette: 10 Canal Mint role tokens only (`src/v2r/palette.ts`, imported first by every entry) and flat mixes of
them. Engine tools only (`lib/Fill`, `Ink`, `sketch`, `time`, `exit`, `xf`, `rng`, `font`). Flat fills, NO opacity,
gradient, blur or glow, ever: a build is a pen, a pop, a spring or a wipe. Deterministic (`lib/rng` seeds). Every piece
un-builds with the loop (Fill / Ink / WorldText read `useExit`). Barrel: `index.ts` (named exports only).

**The words** live in `texts.ts` and nowhere else: import `TXT_*`, never retype a line. Quote marks only on exact words
(V6; they are already right in texts.ts), US spelling except inside her quote ("criticising", A7), "classified", never
"secret" (V10). **The letters** go through `WorldText` and nowhere else (the caption hand, `lib/font` 'CaptionHand' =
Patrick Hand, measured exactly once the font has loaded).

Review: `src/entry-v2r-boards.tsx` (palette first) registers **KitBoards** (the contact sheet, 2160 x 3000: every piece
1:1 at its film size and spot, built, on a stand-in of its shot's ground; the key frames at 216 px; the type scale),
**Boards-Deal / -Google / -Her / -BBC / -S4 / -S5** (1080 x 1920, each piece's timeline on a plain stand-in of its
shot's ground with the shot's move on it) and **BoardActions** (every timeline in sequence, the landing, the un-build).

```bash
cd video && npx tsc --noEmit -p .
GL=angle node scripts/render-frames.mjs KitBoards <dir> 0.5 --entry=src/entry-v2r-boards.tsx --scale=0.5
GL=angle node scripts/render-frames.mjs Boards-Google <dir> 0.4,1.8,2.3,4.1 --entry=src/entry-v2r-boards.tsx --scale=1
npx remotion render src/entry-v2r-boards.tsx BoardActions out/k3_actions.mp4 --gl=angle --concurrency=2 --scale=0.5
convert <frame.png> -resize 216x <f_216.png>   # key lines must read here; -resize 390x for body and credits
```

## Files

| file | what |
|---|---|
| `texts.ts` | every board / tag / plate / box / plaque / door line, exact, with line breaks measured in the caption hand: `TXT_TOLD_THE_BBC`, `TXT_NAME_TAG`, `TXT_PLATES`, `TXT_NEWS_BOX`, `TXT_PLAQUE`, `TXT_DEAL`, `TXT_GOOGLE`, `TXT_HER`, `TXT_SERVICE_DOOR` |
| `WorldText.tsx` | the lettering primitive and the ONE type scale `TYPE`; `textW` (measured width), `penAt` / `penDur`, `flowBaselines` |
| `StatementBoard.tsx` | the ONE enamel A-board (`StatementBoard`), its four presets (`DealBoard`, `GoogleBoard`, `HerBoard`, `ToldTheBBCBoard`), the geometry (`boardFrame`, `DEAL_GEOM`, `B_GEOM`, `BBC_GEOM`), the motion helpers (`boardDy`, `clackDy`, `landDy`, `wipeEdgeX`, `herWipe`), `BoardShadow`, the pure content builders (`dealContent` ...) and layouts |
| `small.tsx` | the small lettered objects: `PaperTag` + the S4 `NameTag`, the S4 `Fingerpost` (= `SignPost` + two `ArrowPlate`s), the S5 `NewsBox`, the S5 `Plaque`, a generic `DoorSign` |
| `sheets.tsx` | the review compositions (stand-in grounds; not exported from the barrel) |

## Tiers (the clean pen, 2026-10-27)
`src/v2r/pen.ts` switches the film to the clean pen with ATTENTION TIERS (`docs/look/CRAFT.md` §b-§c; `../tiers.tsx`).
**Every board and small object defaults to `support`** (a story object off its beat: no outline, calmer fills):
`StatementBoard` (its lines, when drawn, in the frame's own plum shade), `DealBoard`, `GoogleBoard`, `HerBoard`,
`ToldTheBBCBoard`, `BoardShadow`, `PaperTag`, `NameTag`, `ArrowPlate`, `SignPost`, `Fingerpost`, `NewsBox`, `Plaque`,
`DoorSign`. A scene PROMOTES the board on the beat it carries: `<GoogleBoard tier="subject" ...>` (its frame outline
returns at 3.0 px in its own shade). Lettering never changes: `WorldText` is raw text in ink on every tier; the
keyline, the header rules, the tag's keyline and leader and the news box's rules are `graphic` (kept); the tag's string
and the half-wiped menu's scribbles are things (kept, thin); screw slots and edge contours follow the tier.

## The type scale and the readability rule (ONE scale for the whole film)

| `TYPE` | px | faux weight (the same on every board) | what | must read at |
|---|---|---|---|---|
| `header` | 60 | `KEY_WEIGHT` 1.2 | TOLD THE BBC is 56; GOOGLE SAYS / SHE SAYS 60 | 216 px wide |
| `key` | 56 | `KEY_WEIGHT` 1.2 | the purpose line, "AI principles", "of any kind", her quote, DEC 2025 / APR 2026, The Pentagon | 216 px wide (the cold read) |
| `body` / `bodySmall` | 34 / 30 | 0 | the clause, F12, tags, plate bodies, the S2 body | ~390 px (full-screen phone width) |
| `creditLarge` / `credit` | 20 / 18 | `CREDIT_WEIGHT` 0.45 | sources, the small row | ~390 px (at the floor: ~6.5 px tall) |

`weightFor(size)` gives the weight; one value per size on every piece, so no board is ever heavier than another.
Exceptions (measured, in the treatment): the name 44 px on the tag (weight 0.7), the news-box headline 40 px (0.5), the
tag rows 30. `WorldText` modes: `pen` (written left -> right behind a slanted nib edge; the face is there first), `pop`
(springs 0.55 -> 1 about its centre, 7 %), `none` (there / snaps on), `off` (shrinks away in 0.12 s), exit (shrinks with
the fills). `maxW` is only a guard: every preset is measured to fit.

## Per shot (spots at each shot's pose; clocks)

The presets default to **SCENE-LOCAL seconds** (`useTime()` inside the shot = film time - the shot's start). Lanes that
run their scene on FILM seconds (L2: `<TimeShift by={-6.1}>`; L3: `<TimeShift by={-S4_START}>`) pass FILM times, or wrap
the piece in `<TimeShift by={START}>` to give it scene-local time back. The board presets also take `t0` (the shot's
start on the caller's clock: every default becomes `t0 + default`; explicit times are taken as given).

| shot · lane | piece | spot | default times: scene s (film s) | clock |
|---|---|---|---|---|
| S2 · L2 | `ToldTheBBCBoard` | face `S2.aBoard` 160-560 x 1050-1250; frame 134-586 x 1034-1298 (stile 26, rail 16, legs `S2_LEGS_Y1` 1298, back wedge to 595, shadow to ~661); `BBC_GEOM` | none: already there; optional `at` (lands), `clackAt` | FILM s (e.g. `clackAt={8.74}`, the slide's end) |
| S4 · L3 | `NameTag` | x 600-869, y 605-875 (screen-locked over her, tilt -1.2 deg), leader to (720, 892) | build 1 0.21 (15.07), build 2 1.74 (16.60), off 3.94 (18.80) | FILM s: `at={15.07} growAt={16.6} off={18.8}` |
| S4 · L3 | `Fingerpost` (or `SignPost` + 2 `ArrowPlate`) | post x 575, shaft 735-1060 (finial above); plates x 110-560 (tip at x0) y 755-855 / 865-965, path plane; body 31 px | DEC pops 4.06 (18.92), pen to 4.52; APR fill 4.59 (19.45), pen to 4.94 (19.80, "heading") | FILM s: `decAt={18.92} aprAt={19.45} aprEnd={19.8}` |
| S5 · L4 | `NewsBox` | START coords `S5.start.newsBox` 470-780 x 880-1230 (drawn in 310 x 350 units, fitted to `rect`) | already there (`at` optional) | scene s |
| S5 · L4 | `Plaque` | END coords x 612, post foot 1182: plate 447-777 x 1029-1156 at key 56 / body 30 (329 x 127); key 40 / body 24: 271 x 104 | pops 1.88 (22.43, "Pentagon") | scene s |
| S6 · L5 | `DealBoard` | `S6_FACE` 160-640 x 700-1220 = `S6.board0` inset 40 / 20 (frame 120-680 x 680-1250); the scene moves it with the mid plane (`s6BoardAt`); `DEAL_GEOM` | clack 0 (24.00), purpose pops 0.03 (24.03, "any"), F12 + divider 2.40 (26.40, "veto") | scene s |
| S7 · L5 | `GoogleBoard` | face B 150-630 x 700-1220 (frame 110-670 x 680-1250, wedge to 684); `B_GEOM` | header + credit + clack 0.30 (28.36); follows its 1.59-1.72; "AI principles" 1.72-1.98 (complete 30.04); small row 2.24 (30.30); bans retaliation 2.68-3.22; "of any kind" 3.27-4.02 (complete 32.08) | scene s |
| S8 · L6 | `HerBoard` | B on the board plane (x -100-380 before the truck) | header already there unless `headerAt` (L6: 0.23 = 33.16, with the clack); wipe 2.79 (35.72) for 0.35 s; quote 3.61-4.17 / 4.27-4.77 (36.54-37.70); credit 3.61 | scene s |
| any | `DoorSign` | centre x, top y; sized by its lines | `at` optional | any |

Measured (builder renders, kerned in the browser): the deal's clause ink top 921.1 (>= `S6.clauseTopMinY` 920); Pip on
the corner post (770, 720) is 207 px from the clause block and 240 px from its ink; text margins to the keyline deal
12 / 12 / 13 / 11 px. Google's block left-aligned at x 241.3 (centred on its widest row). Her quote at x 190.3, baselines
962 / 1026. The S2 header's cap top sits 7.6 px under the keyline; its credit 8 px above it.

## API

**WorldText** `{x, y (BASELINE), size, text, anchor?, color?, at?, mode?: 'pen' | 'pop' | 'none', dur?, off?, maxW?,
letterSpacing?, weight?, seed?, exit?}`. `textW(text, size, ls?)` = the measured width; `flowBaselines(lines, y0)`.

**StatementBoard** `{face: Rect, stile = 40, rail = 20, legsTo = 1250, shadow?: colour | false, at?, clackAt?: t | t[],
lines?: BoardLine[], rules?: BoardRule[], smudges?: true | Rect, smudgeTop?, wipe?: Wipe, frame?: BoardFrameOpts,
inkWidth = INK_PX.mid, seed?, frameSeed = FRAME_SEED, children?}`. Back -> front: ground shadow (cast right, colour) | the
A's back frame past the right stile + the back leg | the plum frame (stiles to the ground as legs, top rail with a handle
slot, bottom rail, lit strips on the sun side) | the cream enamel plate (thickness edge right and below) | the plum keyline
notched round four brass screws | `children` (over the face, under the lettering; they ride the jolt) | rules and lines |
loose ink on the outer contour only (never on the face, never round the letters). `at` = the board lands (a 34 px drop in
0.1 s, then the clack); `clackAt` = a 3.2 px wooden jolt that springs back by 0.15 s.
- `BoardLine` `{text: string | string[] (a block), size, y (baseline), x?, anchor?, lead?, at?, mode?, dur?, weight?
  (default `weightFor(size)`), letterSpacing?, color?, off?, maxW?, seed?}`; `BoardRule` `{x0, x1, y, at?, dur?, width =
  2.6, color = plum, seed?}`; `Wipe` `{at, dur = 0.35, dir: 'right' | 'left', seed?}`.
- Presets: `DealBoard {face = S6_FACE, legsTo = 1250, t0, purposeAt, f12At, clackAt, shadow, at, seed, children}`,
  `GoogleBoard {face = B, t0, headerAt, creditAt, follows, principles, smallAt, bans, anyKind, clackAt, ...}` (spans are
  `[start, end]`), `HerBoard {face = B, t0, headerAt, wipeAt, wipeDur, wipeDir = 'right', quote1, quote2, creditAt,
  creditLines = 1 | 2, clackAt, ...}`, `ToldTheBBCBoard {face = S2.aBoard, legsTo = 1298, stile = 26, rail = 16, shadow,
  at, clackAt, seed, children}`.
- Geometry: `boardFrame(face, stile, rail, legsTo, {keyInset, side, handle, margin})` -> `BoardGeom` {face, outer, top,
  stileL/R, railT/B, side, backLeg, handle, keyline, notch, screws[4], column {x0, x1}, centre, feet[2], lift};
  `DEAL_GEOM`, `B_GEOM`, `BBC_GEOM`; `BoardShadow {g}` draws the shadow in another layer (pair with `shadow={false}`).
- Motion: `boardDy(t, at?, clackAt?)` (the board's vertical offset: keep a hand or a cloth on it), `clackDy`, `landDy`,
  `CLACK`, `LAND`; `wipeEdgeX(face, wipe, t, y?)` -> the wipe's ragged leading edge x (or null outside the stroke);
  `herWipe({t0, wipeAt, wipeDur, wipeDir})` = the exact `Wipe` HerBoard uses.
- Pure content (for QA and sheets): `dealContent`, `googleContent`, `herContent`, `bbcContent`, `lineExtent(line, g)`;
  layouts `DEAL_LAYOUT`, `GOOGLE_LAYOUT`, `HER_LAYOUT`, `BBC_LAYOUT`; default clocks `DEAL_T`, `GOOGLE_T`, `HER_T`.

**Small pieces** (every time scene-local; `null` = already there, or never for `off`; `exit={false}` opts out):
- `NameTag {x = 600, y = 605, to = (720, 892) | null, at = 0.21, growAt = 1.74, off = 3.94, tilt = -1.2, string, seed,
  exit}` on `PaperTag {x, y, rows: TagRow[], to?, at?, growAt?, off?, tilt?, hole: 'right' | 'left' | 'none', string?,
  ink?, leaderInk?, seed?, exit?}` (`TagRow {text, size, group?: 0 | 1, gap?, weight?, dur?}`; `tagLayout(rows, hole)`
  measures it). Build 1: the leader draws up, the paper pops out of it, its edge inks, the pen writes; build 2: the paper
  grows down on a spring and the pen writes the rest; off: a clean 0.14 s shrink into the leader's end.
- `Fingerpost {x = 575, top = 735, foot = 1060, w = 24, dec, apr, decAt = 4.06, decEnd, aprAt = 4.59, aprEnd = 4.94,
  postAt?, bodySize (auto: 31), shadow = true, ink, seed, exit}`; parts `SignPost {x, top, foot, w, at?, collars?}` and
  `ArrowPlate {rect, rootX, text: {key, body, credit}, bodySize = 31, at?, penAt?, penEnd?}` (a plate swings out on the
  rise spring, fill first, then ONE pen sweep at one speed over every row). `plateBodySize(plates, postX)`.
- `NewsBox {rect = S5.start.newsBox, at?, shadow = true, ink = 2.2, seed, exit}`: a slate honour box lit on its west side,
  no masthead or brand; keep the 310 : 350 aspect.
- `Plaque {x = 612, y = 1182 (post foot), keySize = 56, bodySize = plaqueBodySize(keySize), at = 1.88, stand = true,
  pointer: 'up' | 'left' | 'right' | 'none', ink, seed, exit}`; `plaqueLayout(keySize, bodySize, stand)` gives its size.
- `DoorSign {x (centre), y (top), size = 30, lines = TXT_SERVICE_DOOR, at?, ink, seed, exit}`; `doorSignLayout`.
- Shared: `SMALL_CLOCK`, `SMALL_COLORS` (= the boards' `BOARD_COLORS` family + the box / bronze tones), `MISREG`,
  `popK`, `offK`, `edgeInk`, `insetPoly`, `inkTop` / `inkBottom` / `EM` (glyph extents), `tone` (= `mixHex`).

## Fairness (TREATMENT section 8; checked on every board)

- **A5: Google's and her boards are ONE StatementBoard face at B** (480 x 520, frame 40 / 20, legs 1250): the same
  `FRAME_SEED` (identical hand-drawn contour, keyline and screws), the same colours and shadow (`BOARD_COLORS`: one
  light), the same type scale and faux weights, the same build grammar (header pop + clack, then the pen).
- **The deal board equals Google's** in size, face, frame, legs (`S6_LEGS_Y1` = `B_LEGS_Y1`), type and light. Measured on
  plain renders: bounding box 724 x 597 for both; lit strip 6220 / 6220 px, shade wedge 3082 / 3084, ground shadow
  13028 / 13024, brass 78 / 78; plum 54624 / 54018 (the deal's two thin rules vs Google's one header rule); keys 56 with
  weight 1.2 on both, body 34, credits 18 with 0.45. Ink covers 13.0 % of the deal's face vs 7.9 % of Google's: content
  (46 words with the mandatory full clause vs 22), never heavier type.
- **V9:** at S6's cut the frame, the tag, the FULL F11 clause and the credit are up; the purpose line pops ON "any"
  (0.03), never before the clause; both stay to the end. **V2:** no header naming the parties and no "Google" in any
  letters in the clause frame; its credit names no Google-titled outlet. **F12** ("Lawful use: decided by the Pentagon")
  carries no quote marks (a paraphrase).
- **V6 / A7 / V10 / V15:** quote marks only on exact words; US spelling except her "criticising"; "classified", never
  "secret"; no logos, seals, flags, insignia, mastheads or BBC styling anywhere (the news box has no name, the plaque only
  a plain pointer tab, "Google" appears only as words in its own statement).
- Pip at `BOARD_BOLLARD` clears B's face (its ear overlaps the right stile and back wedge: draw Pip after the board).

## How each lane swaps its stand-in

- **L2 (S2)** `V2S2_Board.tsx`: replace `BoardFace` inside the existing slide (`<XG m={mat.translate(boardDx(t), 0)}>`)
  with `<ToldTheBBCBoard clackAt={MAP.S2.aBoardOutAt + 0.3} />` (FILM s; or 8.44 to sit on the wood-clack SFX). The frame
  is 4 px wider a side than the stand-in (stile 26: x 134-586, the back wedge to 595) and stands on 1298 (= `BOARD_GROUND`).
  Before the slide keep the board AND its ground shadow (to x ~661 at rest) behind the kiosk, or pass
  `shadow={t < MAP.S2.aBoardOutAt ? false : undefined}`. The newsagent's hand can ride `boardDy(t, undefined, clackAt)`.
- **L3 (S4)** already draws its own tag and fingerpost with K3's `WorldText` + `TXT_*` (`V2S4_tag.tsx`, `V2S4_post.tsx`);
  to switch to the kit (FILM s): `S4Tag` -> `<NameTag at={15.07} growAt={16.6} off={18.8} />` (or `<TimeShift by={14.86}>
  <NameTag /></TimeShift>`); `S4Post` (inside `S4Path`) -> `<SignPost x={575} top={735} foot={1060} collars={...} />`;
  `S4Plates` (above Pip) -> two `<ArrowPlate rect={MAP.S4.plateDec2025} rootX={575} text={TXT_PLATES.dec} at={18.92}
  penAt={19.02} penEnd={19.38} />` (APR: `at={19.45} penAt={19.51} penEnd={19.8}`), or the one-piece
  `<Fingerpost decAt={18.92} aprAt={19.45} aprEnd={19.8} />` where post and plates may share one layer.
- **L4 (S5)** `V2S5_text.tsx`: `NewsBox` -> the kit's `<NewsBox />` (START coords by default; it rides the deck's start
  map like the draft); `Plaque` -> `<Plaque at={T5.pentagon} />` and pick the spot: the default (x 612, foot 1182, 329 x
  127) is wider than `TERRACE.plaqueMount` (200 x 106) and overlaps the box's END spot (x 388-516) over x 447-516; for the
  spec's mount (x 450-760, y 1140-1246) pass e.g. `x={605} y={1246} stand={false}` (plate 441-769 x 1119-1246), or
  `keySize={40}` (271 x 104, body 24: under the scale's 30).
- **L6 (S8)** `V2S8_board.tsx` `S8Board` -> inside the board plane's transform
  (`<XG m={mat.translate(planeOffset('board', t), 0)}>`): `<HerBoard headerAt={S8T.she} wipeDur={0.42} />` (wipe 35.72-
  36.14 in plan_L6; the default 0.35) and the cafe owner's cloth held on `wipeEdgeX(B, herWipe({wipeDur: 0.42}), t, y)` in
  the same coordinates (the board erases exactly what that edge has passed). Pip's bollard stays L6's.

## Decisions (and why)

- One frame for every board: the deal board's face is S6's 560 x 560 contract rect inset by the stiles / rails, so it is
  Google's face exactly; the S2 newsstand board is the same face smaller (400 x 200, stile 26, keyline 7) with the same
  type. No header rule on the S2 face: on 200 px it would underline THE.
- The A is hinted (a shade wedge past the right stile, a back-leg stub): the contract leaves the big boards 10 px of leg.
- The wipe only erases (a ragged edge in ONE stroke); the cloth is the lane's figure, so it can never drift off the erase.
- The small pieces share the boards' family colours (`SMALL_COLORS` reads `BOARD_COLORS`) and the one `KEY_WEIGHT`.

## Open

- **S8: SUN8 touches her board's frame.** SUN8 (420, 640) r 40 ends at y 680, exactly the top of the 20 px top rail
  (B's face top is 700; map.ts measured SUN8's 20 px clearance from the face). SUN2 (S7) clears it by 15 px. REQUEST to
  the director: SUN8 -> (420, 625) (top 585 >= the 575 sun minimum; 15 px clear of the frame, like SUN2).
- S6: dc/gate's `GateNear` paving (y >= 1255, near plane) covers most of the deal board's ground shadow: pass
  `shadow={false}` and draw `<BoardShadow g={DEAL_GEOM} />` above that paving inside the mid plane's transform, or accept.
- The kit `NameTag`'s credit row (baseline ~861, x 616-819) enters the right rail (x > 780 below y 840) by 39 px; L3's
  own tag splits the credit in two short lines instead.
- 18 px credits are ~6.5 px tall at 390 px wide: legible with attention (true of every 18 px credit in the film).
- Google's two pen groups run at ~1000 and ~340 px/s (both follow TREATMENT's word-timed spans); its face is blank from
  the cut until the header pops on "Google" (0.30).
- Not yet seen on the lanes' real sets (only the stand-in grounds here); her menu's looped scribbles can look slightly
  mechanical at full size; a big board's plum is ~2.7 % of the frame (S6-S8 keep their total plum near 5 %).

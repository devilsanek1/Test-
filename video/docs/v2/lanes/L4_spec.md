# L4 build spec: V2S5 "The far side" (the crane), lane L4's own working spec

Every L4 builder, fixer and critic reads THIS file in full, plus `COMMON.md`, `brief_L4.md`, `TREATMENT.md` (§1, §2
palette + line, §3 cast + Pip, §5 row S5 + its bottom third + its texts, §6 the scale moment, §8 fairness, §9 acceptance
bar), `docs/look/CINEMATIC_GUIDE.md` (S5 + "Scale cues"), `docs/look/LIFE_AND_DENSITY.md` §0-1 and the kit READMEs
(`src/v2r/kit/dc`, `cast`, `pip`). `docs/v2/STYLE.md` (the film's definitive style page) outranks this file on style: read its §1-9 too.
Where this file decides something the treatment leaves open, it is the lane's call, made here once.

## 0. The bar, and where the baseline stands
- The owner, on this shot: **"The scale must feel GREAT."** On the film: fresh, beautiful, ALIVE like reference 1 and v1,
  people small and simple (never big models), a new Pip in every shot, strictly fair.
- The baseline (the kit's `CraneSet` wired in `V2S5_set.tsx`, review `review/r0_baseline`) has the right SKELETON (the
  planes, the ease, the beats, a Pentagon that reads, the obelisk, the bank) but beside v1 / ref 1 at 216 px it is EMPTY:
  the bottom 50-60 % of every frame is the same bare mauve paving; the start is a bright open terrace, not "warm-dark under
  a blossoming canopy"; the figures read tiny at the start; the end is a plaza with a view. density.py passes
  (flat 16 %, detail 59 %, the paving joints count as detail) but static 19 % / run 0.53 s: the holds are dead.
- Pass = a fresh-eyes art director, a sound-off cold viewer, a SCALE critic and a speed checker all say "yes, this" with
  no must-fix. Judge the PAUSED frame first at 216 px beside v1 / ref 1 (LIFE_AND_DENSITY §0), then the motion.

## 1. Time (scene t = film - 20.55; `useTime()` inside V2S5 is scene time; film frame = 1233 + round(t x 60))
| scene t | film | what |
|---|---|---|
| 0.00 | 20.55 | the SUN MATCH-CUT: SUN1 (250, 650) r 65 on screen in S4 and S5. Pip is mid-air at ~(292, 721) (S4's leap into the sun, lane L3 `V2S4_rig.ts` `S4_PIP.outLeap`): in S5 it comes DOWN out of the sun onto the bench backrest (415, 1120) |
| 0.00-0.75 | 20.55-21.30 | HOLD (the cut, the calendar and the box each get their moment). Pip seated by ~0.17 |
| 0.12 / 0.21 | 20.67 "In" / 20.76 "April" | the disc flips into the calendar page APRIL 2026 (and back by 0.65); the slot's trees burst into blossom in 4 frames; Pip looks up at it (`lookUp`, its one reaction) |
| 0.65-0.75 | | the news box is read (and on through the creep) |
| 0.75-2.85 | 21.30-23.40 | THE MOVE: dolly back + crane up + ~75 deg arc round the two backs on ONE ease (`craneP`); p 0.15 at 1.20, 0.48 at 1.61, 0.70 at 1.88, 0.96 at 2.47 |
| 1.20-1.51 | p 0.15-0.40 | the big tree stands where the Pentagon will land (the darkest beat) |
| 1.47-1.64 | p 0.37-0.51 | the lamppost wipe across the backs at peak speed (>= 10 frames of contact); the tiny drawings swap in behind it at `swapAt` 1.567 (p 0.446) |
| 1.69-1.78 | p 0.55-0.62 | the light burst: the pale cloud bank and the far opening up |
| 1.88 | 22.43 "Pentagon" (heard 22.44) | the Pentagon clears the tree; the PLAQUE pops "The Pentagon / US Department of Defense" |
| 1.99-2.47 | p 0.77-0.96 | the obelisk rises out of the sinking crowns |
| 2.53 | 23.08 "use" | windows warm on along one wing (no screens) |
| 2.85-3.45 | 23.40-24.00 | HOLD: a V of birds toward the landmark; clouds drift 0-6 px/s; life on the terrace and the lawns; 3.35 (23.90) Pip leaps up-right (the cut on action into S6 at 24.00, Pip lands on S6's corner post (770, 720)) |
Words heard: In 0.12 · April 0.21-0.69 · that 0.82 · meant 0.93 · a 1.17 · deal 1.29 · letting 1.57 · the 1.73 · Pentagon
1.89-2.53 · use 2.53 · its 2.69 · AI 2.85 · for 3.25 (S6: "any" 3.48). Captions (engine) pop in the band y 317-556.

## 2. Space: the planes, the coordinates, the hard screen rules
- **END coords** = the screen at p 1 (1080 x 1920). **START coords** = the screen at p 0. Each plane is authored in END
  coords (the near-mid and the start figures / news box in START coords) and drawn through its map (`V2S5_rig.ts`
  `PLANES`; `src/v3/film/kit/Pullback.tsx` `planeMat`, `startMat`, `boxMat`, `PullLayer` = ink-compensated).
  | plane | owner file | map at p 0 (start) | seen at the start (END coords) |
  |---|---|---|---|
  | far (sky, clouds, bank, sun, city, obelisk) | V2S5_far | k 1.08 about (540, horizon), slid so the END sun lands on SUN1: ~ -850 px | x ~ 830-1830 |
  | river (Potomac, bridges, near bank, parkway) | V2S5_river | k 1.15, slid -780 | x ~ 750-1690 |
  | mid (the Pentagon, lawns, boulevard) | V2S5_mid | k 1.35, slid -640 and 380 px LOWER (it rises into view: the dolly) | hidden below the crowns |
  | near-mid (the slope's crowns, START coords) | V2S5_nearmid | identity; sinks 560 px and slides 300 left by p 1 (the crane) | as authored |
  | deck (terrace, balustrade, people, bench) | V2S5_deck | k 2.419 pinned on the stranger's feet (318, 1238) -> (300, 1225) | x 194-640, y 732-1525 |
  | left frame (terrace tree) / right frame (lamppost + corner tree) | V2S5_deck | boxes TREE_BOX / RIGHT_BOX: slide in from the left / bottom-right | off frame |
  | wipe (lamppost + two baskets) | V2S5_deck draws it, the rig moves it | screen path, p 0.02-0.75 | - |
  | start-only canopy + near foreground (screen) | V2S5_start | given p; gone by p ~0.35 | - |
  | figures / news box (start coords, ride the deck) / plaque (end coords) | V2S5_figs, V2S5_text | | |
- Numbers the rig needs live in the slot files (`FAR_END`, `RIVER_PL`, `MID_PLANE`, `NEARMID_PLANE`, `TREE_BOX`,
  `RIGHT_BOX`); `node` camera check: `V2S5_qa.ts` (command in its header) prints every plane's max px/f and where an END
  y of the far plane sits at the start.
- **Hard screen rules, at EVERY frame (check with `bandcheck.py`, §8):** nothing in the caption band y 317-556, ever (no
  cloud, crown, branch, Pip, hop arc, bird, finial, petal); the band margin y 290-600 is flat sky except the sun disc and
  its calendar page (top >= 575); no built top, crown or branch above y 600 (the start included); the cloud bank and the
  obelisk tops >= 610 at every p (the far plane is 1.08x at the start, so END tops >= ~625: the QA prints the mapping);
  the top gutter (y 0-290) holds only clouds (and, at the start only, an optional canopy fringe at y <= 240 that leaves
  SIDEWAYS, never down through the band). Key reads (the news box, the plaque, Pip's beat) in x 120-880, y 290-1250;
  nothing to read below y 1250; no Pip, board or key read in the right rail (x > 780 below y 840) at rest.
- **Speeds (60 fps, on-screen px per frame):** detailed layers <= 15 (the move peaks ~12 now: keep it there), long flat
  ink moves <= 7.5, the wipe is a flat mass (it may run ~40); no zoom in a hold; no opacity anywhere; strobe-free (a
  fine repeating pattern moving > 1/2 its period per frame strobes: keep fine patterns on slow planes).

## 3. The END frame (build it first, at final density): the scale moment
**Decisions (lane L4):**
- **Horizon y 750** (the orchestrator: "about y 740"; the far builder may choose 740-760 and records it in
  `FAR_END.horizon`). Sky y 0-750 = 39 % of the frame (Scale cues 9: 30-40 %). The cloud bank wants 150-280 px (Scale
  cues 9) but its tops must stay >= 610 at the start too, where the far plane is 1.08x: with the END sun at (1058, 661)
  that means END tops >= ~625 (a 125 px bank); moving the END sun UP to y ~636 (its top 576, still >= 575) shifts the
  whole far plane ~27 px lower at the start, so END tops can reach ~612 (a ~140 px bank). `V2S5_qa.ts` prints the mapping.
- **The camera stays high (~8 seated heights, not 2-3): reported, not built.** (feet - horizon) / F = (1238 - 750) / 62
  = 7.9. The contract fixes the tiny anchors (stranger 62 px, feet 1238; Pip (366, 1195) >= 44 px) and the Pentagon box
  (x 322-1080, y 846-1104), and the Pentagon's rings read only from a raised vantage (lens.ts MID: 13 deg). 2-3 heights
  would need ~200 px figures or feet at y ~900 inside the Pentagon box. Instead the end frame earns "a low crane, not a
  drone" from Scale cues 1-5 and 7-11 AND from the terrace itself: the floor is NOT a plaza seen from above but a busy
  near world with its own size gradient (big near things at the bottom edge, people 40-120 px, the tiny pair at the rail),
  so the eye reads distance, not a map.
- **The plaque** is a viewpoint orientation plaque at the rail, right of the bench: a slanted bronze-dark panel on a short
  stone pedestal standing just in front of the balustrade, END rect about x 450-760, y 1140-1246 (in front of the news
  box's lower right), "The Pentagon" 56 px + "US Department of Defense" 26 px, all text above y 1250. It never covers the
  Pentagon's building at the end (the facades' bottom edge runs y ~1000-1045); at its pop (p 0.70: the deck is 1.30x
  about the stranger, the mid plane 1.09x) its text stays inside x <= 880 and it may only graze the lower facade strip,
  never the roof and rings (the pentagon shape reads through the pop).

**Layout (END coords), top to bottom:**
| band | y | content | atmosphere step / ink |
|---|---|---|---|
| top gutter | 0-290 | 2-3 HUGE flat lobed clouds cut by the side edges (crown paper, body, belly: 3 flat fills, no outline), drifting 0-6 px/s; clouds = 45-55 % of the sky outside the band | sky / none |
| caption field | 290-600 | FLAT mint; the sun disc (cut by the right edge, top >= 575) | - |
| cloud bank | ~625-750 | >= 1 W, flat base on the horizon, lobed top (lobes 180-450 px), cut by the right edge; a low saddle where the obelisk stands; the sun above its right end | far 65 % / none |
| horizon | 750 | the far hills as a thin step, an infinity strip | 65 % |
| far city | 750-~805 | the low white city PACKED: 5-7 rows every 9-10 px, each hiding half the row behind, no sky gaps, a tick (chimney, cupola, tree) every 3-4 roofs; the obelisk (top >= 625) the one far shape over the horizon; the Capitol dome a tiny second landmark (~28 px) one step paler; the castle, the temple; DETAIL PEAKS just under the horizon | 65 % then 40 % |
| river | ~805-850 | the Potomac (cool water, glints), Memorial Bridge's low arches, the 14th Street spans with tiny traffic, rowers, two sails; the near bank's park trees and the parkway with tiny cars (6-10 px) | 40 % / none |
| mid | 846-1180 | THE PENTAGON in the box x 322-1080, y 846-1104 (huge yet calm: two facades + rings + courtyard, running past the right edge; windows as 2-3 px dots on a 5 px period; no flag, seal, helipad, vehicle, guard or glow); its lawns, the ring road, the boulevard with tiny cars (never at the building), jogging paths with 5-8 px joggers, groves, a pond; left of x 322 the lawns + groves + the parkway's curve continue past the left edge | 22 % / hairline |
| near-mid | ~1100-1190 | the slope's crowns just beyond the balustrade: dark warm masses with blossom, ridges halving downhill (the DROP between the lawns and the rail) | 12 % / full |
| rail | ~1176-1230 | the stone balustrade, the ONE level line, past both edges; the stranger + Pip on the bench at the rail (x 289-384), the news box (x 388-516), the plaque on its pedestal in front of the rail (x ~450-760, y ~1140-1246) | 0 / full |
| terrace | 1230-1920 | §3a | 0 / full |
| frames | | LEFT: the terrace tree (trunk + roots cut by the bottom-left, crown x <= ~300, top >= 642), the near anchor in the darkest swatches; RIGHT: the lamppost (base cut by the bottom-right) + the corner tree. Together ~30 % of the frame (Scale cues 8), never covering the Pentagon's left 2/3 or the pair | 0 / full |

**3a. The terrace (y 1230-1920), the bottom third: never an empty plaza (TREATMENT §5: "the terrace floor seen from the
crane's height (paving joints, petal drifts, a bench, a bin, a stroller), the tree's roots cut by the bottom-left, the
lamppost base cut by the bottom-right").** Make it a FIELD MADE OF THINGS:
- the paving's joints converge on the pair (the deck VP sits on the horizon above them: lines lead up); a border band and a
  decorative inlay (a compass-rose or radial joints toward the view) carry thin lines;
- flat dappled shade from the trees (big lobed shade shapes, 2 values, warm) with sunlit shafts; petal drifts in the
  joints and against the plinths;
- PEOPLE (10-16, small and simple, reference 1's grammar, K4 cast: `Person`, `Seated`, `FarCrowd`): two or three standing
  at the rail looking out (60-90 px), a couple on a second bench, a parent pushing a stroller, someone walking a dog, a
  jogger crossing, an older person with a guidebook, a kid on a parent's shoulders (no pointing at the Pentagon), half at
  rest; never teal; no faces; no phones or cameras raised (V12);
- props: 2-3 benches, a bin, a drinking fountain, tulip beds, a planter crabapple, a bike leaning on the balustrade, a
  viewpoint sign without legible words, lamp bases, drain grates, pigeons (a few take off in the hold);
- the near edge: big near masses cut by the bottom (a hedge / tulip bed rim / the tree's roots / the lamppost base) so the
  floor has a size gradient (near things 2-3x the rail people);
- life in the hold: walkers (0.7-1.1 body heights/s, 12 drawings/s), the stroller rolls, the dog trots, pigeons, petals,
  the baskets nod, a jogger; nothing over the pair, the plaque or the Pentagon's left 2/3. The scale hold's life (CG cue 11,
  STYLE §5): 3-4 kinds of mover on 3 speed tiers in the SKY (a V of birds, gulls, clouds 0-6 px/s) and BY THE FIGURES (the
  terrace), never 1 s still, <= ~2 % of the frame, never competing with the pair and the landmark; NOTHING moves inside
  the far city; the mid plane gets at most a few slow tiny movers (joggers, a car on the boulevard), never at the building.

**3b. The scale checklist (the SCALE critic reads it on the end frame at full size AND at 216 px):** nothing ends inside
the frame (every band runs past both side edges behind the side frames; something is cut by all four edges) · 5-7
planes, each ~2.2-3x smaller than the one in front (terrace people 40-120 px -> the pair 44-62 -> mid joggers 5-8 -> far
roofs 7-17 wide) · the far band packed, detail peaking just under the horizon · flat steps 0 / 12 / 22 / 40 / 65 %
toward the sky, ink full -> none, darks climbing toward the sky's hue · the drop: ridges halve downhill, then the rail ·
ONE huge-yet-calm landmark (the Pentagon, the subject, below the horizon; the obelisk the one far shape over it) · a huge
bank behind the obelisk + huge top-gutter clouds · lines lead up (the paving to the pair, the boulevard / parkway
curves to the Pentagon) · tiny anchors read at 216 px (the pair at the rail, Pip's ears) · 3 tiers of life in the hold,
never 1 s still. Then, at phone size: does the world keep going, and is it alive?

## 4. The START frame (held 0.00-0.75): "warm-dark under a blossoming canopy"
- **Composition (START coords):** the flat mint sky y 0-600 (the caption field; top-gutter clouds from the far plane); the
  BRIGHT SLOT x 150-560, y 580-880 holding SUN1 (250, 650) r 65 and the far view beyond (bank, city, river: the coolest,
  brightest patch); framing it, the canopy: dark warm blossoming crowns at the left (x <= ~170) and the big tree on the
  right (x ~510-1150, y ~590-1060), the slot trees' tops as its bottom edge; below them the balustrade (y ~1085-1196);
  the bench x ~230-460 with the stranger (feet (300, 1225), 150 px, reading an open newspaper, back to us) and Pip on its
  backrest (415, 1120); beside them, IN THE SLOT'S LIGHT, the news box (face x 470-780, y 880-1230).
- **Warm-dark:** below y 600 the frame is mostly dark warm masses (crowns, trunks, the canopy's shade on the floor, the
  bench), with the slot, the lit box face and a few sun flecks as the only bright patches (Arcane #55's start: "the
  brightest and coolest patch in a warm dark frame"). No overlay, no gradient, no opacity: the masses ARE dark colours.
- **The bottom third (y 1250-1920, TREATMENT §5):** the bench front, the stranger's bag, petal-strewn paving, the news
  box's base, a tree root cut by the bottom-left. The deck's floor near the bench (END region x ~150-700, y 1232-1560)
  IS this floor at 2.42x: the deck builder draws it as the canopy's shade zone (warm-dark paving, 2-value dapple, sun
  flecks, petals at a size that reads at both scales); the start builder adds start-only near masses on top (the canopy
  tree's trunk + roots at the bottom-left, a tulip bed rim or planter cut by the bottom-right, fallen blossom twigs, a
  pigeon or two) that DROP OUT down-left as the crane rises (near things move fastest; gone by p ~0.35), plus an optional
  blossom fringe in the top-left gutter (y <= 240) that leaves LEFT by p ~0.12. Life in the hold: Pip lands and looks up,
  the calendar flip, the 4-frame burst, petals drifting down through the frame below y 600, the stranger turns a page,
  pigeons peck, a far jogger crosses the slot, gulls. The dapple is STATIC (STYLE §3: no boil, shimmer or visible sway).
- **Sizes:** the stranger 150 px (feet to head top; seated), Pip 108 px: both are the legibility floor's carriers here.

## 5. The move (0.75-2.85): one breath out, never menace
- Keep the kit's ONE ease and the beats (§1). Each beat must READ on a cold sound-off watch: the darkest beat (the big
  tree where the Pentagon will land), the wipe hides the swap, the light burst, the Pentagon on "Pentagon" with the
  plaque, the obelisk rising, the windows warming. Check the motion strip at 0.1 s steps: something new every few frames.
- Every plane moves on its own map only (never animate a plane's content to fake camera motion); life keeps going during
  the move.
- Speeds stay inside §2 (`V2S5_qa.ts`); the wipe's contact >= 10 frames and the swap fully hidden (check frame by frame
  1.45-1.70).

## 6. Text objects (`V2S5_text.tsx`, TREATMENT §5 "Texts on objects", §8 credits)
- **News box** (START coords: face x 470-780, y 880-1230, 310 px wide, no masthead): headline **Google–Pentagon deal for
  classified work** (40 px, 3 lines) + "Reported Apr 2026 · The Information via Japan Times; 9to5Google" (18 px); read at
  full-screen phone width (~390 px); in the slot's light; it rides the deck (small at the rail at the end: x 388-516).
- **Plaque** (END coords about x 450-760, y 1140-1246, §3): **The Pentagon** (56 px) / US Department of Defense (26 px),
  pops on "Pentagon" (scene 1.88) with a scale overshoot (no fade); a viewpoint plaque (no seal, flag or insignia: V15).
- Letters in the caption font (`lib/font`), dark ink or paper on plum; quote marks never (no exact words here).

## 7. The rules every builder keeps (from TREATMENT / COMMON; a break is a must-fix)
- **No reusable assets:** engine primitives (`lib/Ink`, `Fill`, `sketch`, `persp`, `xf`, `time`, `rng`, `inkComp`, `font`),
  the v2r kits (`src/v2r/kit/**`), `src/v3/film/kit/Pullback.tsx` and `idle.ts` only. Forking kit code into your own
  `V2S5_*` file is fine (it is this film's kit); never import v1 sets, the v3 kit, `lib/kit`, the cine generators,
  `lib/mascot` or anything under `src/v2/**`.
- **Palette "10 Canal Mint" roles only** (`src/v2r/palette.ts` `CM`, steps via kit/dc/core `atm` / `atmShade` / `mix`):
  NO TEAL anywhere in S5 (teal is hers and she is never in Washington); ORANGE only in the sun disc and its calendar
  header (pop <= 3 %); shadows are colour, never grey; no beige / tan / olive / grey; warm, never sickly; the plum anchor
  ~5 % (trunks, the darkest crowns, the plaque, iron).
- **Line:** ink `#2B1B0A` by depth 4.8 / 3.4 / 2.2 / 1.6 px, tapered, loose architectural line, only where it carries form;
  far planes no ink (hairline at the mid); flat fills misregistered 2-5 px; no gradient, glow, blur, haze or opacity.
- **People** small and simple (K4 cast; reference 1): round heads that are the hair, tombstone torsos, one accessory each,
  no faces, no two neighbours alike, never teal, half at rest; the end pair tiny at the rail.
- **Pip** (K5): 108 px at the start, >= 44 px at the end; never in the band, the right rail at rest, or over the stranger;
  one reaction (look up at the calendar sun on "April"); idle always.
- **Fairness (§8):** the Pentagon calm, in daylight and blossom, at or below eye level; no glow, rim, looming, dolly-zoom
  or sting; no flag, seal, helipad, vehicle, guard, camera or uniform at the building; nothing military; "classified" only
  in the news box's headline; never "secret", "Department of War", "largest office building". The plaque is neutral.
- **Deterministic and in seconds:** `useTime()` seconds, `lib/rng` seeds (never Math.random), frame = round(t x 60); life
  is a pure function of t; static geometry in `useMemo`.
- **Performance:** batch shapes (kit/dc/core `Batch` + `Paint`: one Fill per colour, one Ink per weight); a frame should
  render in < 1 s at 0.5 scale.

## 8. Method: render, look, check (from `video/`; S = the lane scratch dir below)
- S = `/tmp/claude-0/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/scratchpad` (use your own subfolder in it).
- Stills (film seconds; Film2R has captions, Film2RBare not): `GL=angle node scripts/render-frames.mjs Film2RBare <dir>
  21.0,22.43,23.7 --entry=src/entry-v2r-film.tsx --scale=0.5` (bundle ~25 s, then ~0.3 s/frame). A drawing-only check of
  one moment: pass `p` to `<S5Set p={...}/>` in a throwaway local test only.
- Look at every still at FULL size and at 216 px wide beside the reference rows in `S/refs216/` (ref1_*.png, v1_*.png;
  `S/review/r0_baseline/sheet_216_vs_refs.png` is the baseline beside them).
- Band: `python3 S/tools/bandcheck.py` (renders Film2RBare f1233-1439 at 0.5 and counts non-sky pixels; `--step 3` for a
  quick pass). Camera: the `V2S5_qa.ts` header command. Typecheck: `npx tsc --noEmit -p .` (~25 s).
- Full review set (the critics' input): `bash S/tools/make_review.sh <tag>` (~2 min): keys at 216 px beside refs, full-size
  start / end, motion strips, the 0.5-scale clip with voice + cues, density.py (+ --cozy), the band + camera checks.
- Renders: always `--gl=angle`, `--concurrency=2` (4 shared CPUs; another builder may be rendering too).

## 9. Ownership and git (several builders work in ONE working tree at once)
- One owner per file: `V2S5_far.tsx` + `V2S5_river.tsx` (SKY & FAR) · `V2S5_mid.tsx` + `V2S5_nearmid.tsx` (+ new
  `V2S5_mid_*.tsx`) (VALLEY) · `V2S5_deck.tsx` (+ new `V2S5_deck_*.tsx`) (TERRACE) · `V2S5_start.tsx` (+ new
  `V2S5_start_*.tsx`) (START) · `V2S5_figs.tsx` + `V2S5_text.tsx` (FIGURES & TEXT). The lane lead owns `V2S5.tsx`,
  `V2S5_set.tsx`, `V2S5_rig.ts`, `V2S5_qa*.ts` and this spec: a change you need there is a REQUEST in your final answer.
- Never edit another builder's file, the kits, map.ts, the palette or any shared doc. Keep your files COMPILING at every
  save (another builder may be rendering): write complete code, typecheck before you render. If a render breaks in a file
  you do not own, wait a minute and retry; never "fix" it.
- Commit your own files after each meaningful step: `git add <your files>` (never -A) and `git commit -m "v2r L4 <part>:
  ..."` with the session's attribution lines; if `.git/index.lock` exists, wait a few seconds and retry. Do NOT pull or
  push (the lane lead does).

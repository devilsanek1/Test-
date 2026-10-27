# L6 build plan: V2S8 "Her words" + the seam (third session, ultracode)

The shared brief every V2S8 builder follows. Read first: `COMMON.md` (hard rules), `brief_L6.md`, TREATMENT.md
sections 2-5 (row S8, the S8 bottom third, the S8 board texts), 8 (fairness, Q9), map.ts `S8`, `PIP` (V2S8), `MATCHES`
(the last two), BUILD.md section 2, and **`src/v2r/scenes/V2S8_clock.ts` (THE contract: times, planes, bands, her
walk, the door swing, Pip's entry and seam, the lamp-run order)**. Kit APIs: the READMEs in `src/v2r/kit/*/`.

## 1. The frame
Looking WEST down her towpath at sunset. Every part draws at the **landing pose** (35.60; screen px = landing px) and
shifts by its plane's offset `planeOffset(plane, t)` (pre-truck ~ -dx, landing 0). Then the seam push (V2S8.tsx) scales
everything 1.00 -> 1.05 about W (37.70-38.82) and holds through the un-build.

| landing pose | where | plane (dx) |
|---|---|---|
| sky y 0-600: flat mint (the caption field, band y 317-556); sunset bands only below 600 (World draws them) | screen | sky 0 |
| SUN8 (420, 640) r 40: the ONE orange | over the canal, above the board | sky 0 |
| far roofs, gasholders, viaduct beyond the bend: tops y 606-720, x 0-640 (above / left of the board) | far | 24 |
| the south bank across the canal: warehouses, terrace backs, trees, receding from the left edge to the VP; tops <= 760 | left | 60 |
| the canal: water from the far coping (y ~945) to our coping (0, 1290) -> VP (600, 948); draw it wide | left | 110 |
| her house at the bend facing down the lane: TerraceRow, her door 680-770 x 880-1060 (teal), W (860, 700) 150 x 170 (teal frame, Juliet rail, blind up), ground y 1060, cornice >= 606; neighbour to the right (to x ~1300); a smaller row beyond the bend (left, behind the board) | right | house 160 |
| the forecourt setts y 1060-1100 (house band), the lane beyond the bend, canal-side lamp heads above the board (x ~280-360, y 610-690), a heritage lamp right of her house (x ~985), carriage lamps, bins, a bike, pots | right / behind the board | house 160 |
| the three ghosts at map S8.ghosts (658 / 696 / 734, feet 1084 / 1072 / 1060, 140 / 135 / 130 px) | before her shut door | ghosts 240 |
| her board: A-board face = B (150-630 x 700-1220), legs to 1250; Pip's bollard top (700, 1205), foot ~1300 | left | board 250 |
| the towpath flagstones y 1100-1340 + the coping segment (333, 1100) -> (0, 1290); the cafe boat moored in the canal along it (its near cabin end visible x 0-150, bow hidden behind the board) | | board / boat 250 |
| the near band y 1340-1920: the cafe deck bottom-left (x 0-560: two small tables, mugs with steam, a folded chair, a potted bay, a coiled rope), paving with leaves and a drain, a planter bottom-right, the near lamp-post (column x ~1068, foot below the frame, swan-neck arm leaving the right edge at y ~640-700; its pool on the paving lights first in the lamp run) | bottom | near 320 |

Pre-truck (32.93-34.99) the board is at x -100..380, her door 520-610, W (700, 700), the ghosts 418-494, Pip's bollard
(450, 1205), the near lamp column x ~748: the lane's depth (the bend, beyond-the-bend lamps, the canal's far reach) shows
in the gap x 380-480 between the board and her house; she walks home up the middle (house-plane keys `HER_KEYS`,
screen x ~ key x - 150).

**Multiplane ground:** three rigid bands (house < 1100 <= board < 1340 <= near). Nothing long and receding crosses a band
edge (no receding wall or kerb line on the right side of the lane: use objects), except the coping whose break at
(333, 1100) is always behind the board. Every object standing on the ground uses `groundOffset(footY, t)`.

## 2. Files, exports, z-order (V2S8.tsx draws them in this order)
S8Sky, S8Far, S8South, S8Water (set) · S8House, S8Window (house) · S8Boat, S8Ground (set) · S8Public, S8Her (cast) ·
S8DoorLeaf (house) · S8GhostsLayer (cast) · S8Board (board) · S8Front (set) · S8Readers (board) · S8Pip (pip).
- **V2S8_set.tsx** (builder A): sun, far, south bank, water, the cafe boat (+ its lights at `lampRunAt('boatLights')`),
  the ground bands (+ the near lamp's pool at `lampRunAt('nearPool')`), the far windows above the board
  (`lampRunAt('farWindows')`, a ripple), the near band objects in S8Front.
- **V2S8_house.tsx** (builder B): S8House (terrace + forecourt objects + lamps and string lights + window neighbours
  + the lamp run for 'houseLamp', 'carriageR', 'festoon', 'carriageL', 'canalLamp1', 'canalLamp2'), S8Window
  (W, in `LateExit`; lit 34.95; her silhouette from 35.85), S8DoorLeaf (the door swing `doorOpenK`; the lit hall behind
  her goes in S8House).
- **V2S8_board.tsx** (builder C): S8Board (the interim StatementBoard face, the bollard, the cafe owner + the one-stroke
  wipe), S8Readers (the two readers). Text from `kit/boards/texts.ts` TXT_HER, type from `kit/boards/WorldText.tsx` TYPE.
- **V2S8_cast.tsx + V2S8_pip.tsx** (builder D): S8Her, S8GhostsLayer (in `LateExit`), S8Public; S8Pip (`NoExit`).

## 3. Timeline (film s; scene = film - 32.93)
32.70-33.16 S7's boat wipes in (S8 shows right of `wiperX(t)`) · 32.97 Pip on the passing stern deck, 33.00 leaps,
33.20 lands on the bollard · 33.16 SHE SAYS pops on the board (clack) · she walks home (HER_KEYS) · 33.78 "can't": three
ghosts pop (0.04 s stagger), Pip's ears down · 34.50 she is at her door (goIn) · 34.52-34.60 the door swings in (lit hall)
· 34.68 she is through · 34.66-34.75 the door shuts (latch 34.75) · 34.95 W lights (3-frame flicker) · 34.99-35.60 THE
truck · 35.60-37.70 camera locked · 35.72-36.14 the cafe owner wipes the board clean in ONE stroke · 35.85 her silhouette
comes to W (phone at her ear, S3's picture) · 36.54 the credit pops, the quote pen line 1 36.54-37.10 · 37.18 "facts":
the lamp run (LAMP_RUN_ORDER, 0.06 s apart), the two readers stop under the board · 37.20-37.70 quote line 2 · 37.70
"not": Pip looks up at W; the seam push · 38.82-39.08 the un-build (ghosts + W last; Pip hops onto S1's f0 bollard and
becomes S1's frame-0 Pip).

## 4. Rules every builder keeps
- Engine primitives + the v2r kits only (COMMON hard rules); seconds (`useTime`), `rng` seeded, 60 fps; no opacity,
  blur, gradient or glow; flat fills misregistered 2-5 px; ink by depth 4.8 / 3.4 / 2.2 / 1.6 (`INK_PX`), loose and open,
  never on sky, water or shadows; shadows are colour (`CM.stoneShade`, `CM.shadeWarm`, `CM.shadeCool`).
- Nothing in y 290-600 except flat sky (landing y >= `SKYLINE_MIN_Y` 606 for built tops; smoke / steam / birds below
  `LIFE_CEIL` 602): the push lifts tops by up to 5 px. The sun is the only orange; teal only on her coat, her door and
  W's frame; never teal on anyone else; plum anchor only on her hair, gunwale stripes, board stiles, lamps, railings,
  near silhouettes (~5 %).
- People small and simple (reference 1): round head = hair, tombstone torso, one accessory; never a face, waist-up or a
  big model; neighbours unlike each other; never plum + bun + long coat near her (her signature).
- Key reads in x 120-880, y 290-1250; the right rail (x > 780 below y 840): masses only (never Pip, a board, a key read).
- DENSE-CALM: >= 2 movers always, something new every few frames, no dead run > 0.40 s; life never over lettering.
- Fairness (TREATMENT 8): nothing implies she leaked; the lamp run passes everything alike; Google's board is not here;
  no "free" chime; the ghosts stay to the seam; no eyes, guards or "watched" beat.
- Un-build: `Ink` / `Fill` read the exit; raw SVG reads `useExit()`; nothing fades. `LateExit` (V2S8_exit) for W and
  the ghosts; Pip in `NoExit`.

## 5. Self-check before you finish (scratch dir only; never commit renders)
`GL=angle node scripts/render-frames.mjs Film2R-V2S8 <dir> 0.05,0.3,0.9,1.6,1.8,2.1,2.4,2.8,3.0,3.7,4.3,4.9,5.6,5.95,6.1 --entry=src/entry-v2r-film.tsx --scale=0.5`
(shot-local s) and look at them; also `... Film2R <dir> 32.75,32.95,33.0,33.05,38.9,39.0,39.06 ...` (film s) for the wipe
and the seam. Compare at 216 px with reference 1 / v1 frames (extract with ffmpeg fps=1, scale=216:-2 from
`assets/ref/reference.mp4` and `deliverables/v1/php2shell_final.mp4`). `npx tsc --noEmit` clean. Commit ONLY your
own file(s) (`git add <paths> && git commit`; retry if index.lock is busy); never push, pull, reset, stash or checkout.

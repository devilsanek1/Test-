# src/v2r/world: K2, the map contract (video 2, "One Small Window")

`map.ts` is the ONE source of truth every lane (L1-L7) and kit (K3-K7) builds to. Numbers only, no imports, no
drawing (usable from node QA scripts). It mirrors `docs/v2/TREATMENT.md` sections 2-5 and 9; K1 `src/v2r/palette.ts`
owns every colour and ink token. Change a number only with the director (a lane writes one line under REQUESTS).

**Conventions.** px in 1080 x 1920; seconds of the voice clock (39.08 s, frame = round(t x 60)). `Spot` = centre + size,
`Rect` = edges, `Disc` = centre + r, `Seat` = Pip's base-centre (Pip grows UP from it), `Fig` = centre x, sole line,
height. "y <= 600" = no higher on screen than y 600. Positions are SCREEN px at each shot's pose (`POSE_T`); a camera
move maps them about its anchor (`scaleAbout`); match points are screen px AT the cut, hit by both lanes.

**What is in it**
- Zones: `UI` (caption band y 317-556, key reads x 120-880 / y 290-1250, right rail x > 780 below y 840, bottom
  third y 1250+, skyline y 600, no paper edge y 0-620), `SKYLINE_EXCEPTIONS`, `LEGIBILITY` (story change >= 80 px,
  carrier figure >= 130 px, staffer >= 180 seated, key lines >= 56 px, Pip 86-120 / >= 44 in S5's end), `CAMSPEED`.
- The map: `MAP_PLACES` (north bank east -> west), `LENSES` (where each shot looks; west = screen left on every
  north lens), `SHOT_LIGHT_MAP` (= K1 `SHOT_LIGHT`).
- Shared spots: `W`, `W2`, `W2_CUT`, `SUN0`-`SUN2`, `SUN8`, `B`, `BOARD_BOLLARD`, `S1_BOLLARD`, `PLUM_BRIDGE`.
- Shots: `SHOTS` (V2S1-V2S8, times, frames, lane, mood, light, pose, transition in, the one thing it explains; =
  K8 `src/v2r/film/scenes.json`), `shotById`, `shotAt`, `POSE_T`.
- The S1 scale sheet: `S1_LENS` (horizon 965, eye 1.3 m, 14 m, focal 1400; her line 100 px/m at feet 1095, the facade
  90 px/m at base 1082), `s1PxPerM`, `s1FigureH`, `S1_TOWPATH_FEET` (the bend), `S1_SHEET` (every S1 size),
  `S1_CAMERA` (pull-out 1.05 -> 1.00 ANCHORED ON W, the dive), `s1Screen`, `S1_CLOCK`, `FRAME0_TEXT`.
- The ghost row: `S1_ROW` (her, G1-G6, O1-O3: cover x, pop time, word, head value, cues), `s1HerX`, `s1RowAt(t)`
  (lockstep: every member walks her metres, compressed into the bend), `GHOST_POP`, `S1_ROW_STOP`, `S1_LIFE_T`,
  `S8_GHOSTS_SPEC`.
- Per shot: `S2` (her dark window, the five staff windows, blinds, bench, A-board, camera), `S3`, `S4`, `S5`
  (+ `S5_EASE`, progress beats), `S6` (+ `s6BoardAt`, `s6PipSeatAt`), `S7`, `S8` (+ `s8TruckU`, the three ghosts).
- Pip: `PIP_RULES`, `PIP` (seat, end seat, beats, the one reaction per shot), `PIP_HOP_S2_S3` / `pipHopS2S3At`.
- Cuts: `MATCHES` (every cut's screen-space shapes, side out / in / both, and its rule). `BOTTOM_THIRD` per shot.
- `shotShapes(id, t)`: every contract shape of a shot at any time, mapped through its camera; `contractProblems()`
  checks them all (band, rail, key reads, the floor, Pip clearances, suns, the S5 ease) - 0 errors at commit.

**Decisions the contract adds to the treatment** (each one keeps a treatment rule true)
- S1's pull-out is anchored on W: W's centre never moves, so the loop seam matches; at f0 W is 157.5 x 178.5 (1.05).
- S1 feet follow the one lens: G6 feet 1068, O3 1057 (sizes exactly 170 -> 135, outlines 130 -> 120).
- S6's board drifts 100 px / 4.06 s = 24.63 px/s (25 px/s would end 1.5 px in the rail).
- S5's lamppost wipe runs 22.02-22.19 (p 0.37-0.51): p 0.40-0.50 is only 7 frames, the treatment asks >= 10.
- S3 Pip leaves through the LEFT edge at y 620-700 (the top would cross the band); S4 Pip sits at (470, 1218),
  left of her, so its landing and its hop into the sun never cross her.
- S8's three ghosts stand left of her door before the truck and slide in front of her SHUT door with it (truck
  dx 240): after the truck x 632-780 is the only legal strip between her board and the rail.
- S7's positions are exact at the push landing (30.04); S2's at 6.70; W2 lands 133 x 164 at the S2 -> S3 cut.

**See it.** `src/entry-v2r-map.tsx`: `MapContract` (8 frames, one per shot at its pose), `MapContractShot` {id, t}
(overlay any shot at any time), `MapOverview` (the map). Sheet:
`node scripts/render-frames.mjs MapContract <dir> 0,1,2,3,4,5,6,7 --entry=src/entry-v2r-map.tsx --scale=0.25 --gl=angle`

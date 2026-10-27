# src/v2r/world: K2, the map contract (video 2, "One Small Window")

`map.ts` is the ONE source of truth every lane (L1-L7) and kit (K3-K7) builds to. Numbers only, no imports, no
drawing (usable from node QA scripts). It mirrors `docs/v2/TREATMENT.md` sections 2-5 and 9, CONFORMED (2026-10-27) to
`docs/look/DIRECTION.md`, `docs/look/CRAFT.md` and `docs/v2/THROUGHLINE.md` (they win where they differ); K1
`src/v2r/palette.ts` owns every colour and ink token; the light rigs live beside it in `rigs.ts` (one per set,
THROUGHLINE §5: lanes import them, never redefine them). Change a number only with the director (a lane writes one
line under REQUESTS). RETIRED fields keep their names and a neutral value (a zoom from 1.00 to 1.00, a zero-height
hop) so built code compiles until its lane conforms: never build on one.

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
- The thread (her window): `W` (S1, S8), `M` (S2's dark office window = S3's lit home window: the B match; `W2` and
  `W2_CUT` are now aliases of it), `S4.herWindow` (ahead at the far left); none in S5-S7 (the declared fairness stretch).
- Shared spots: `SUN0`-`SUN2`, `SUN8`, `B`, `BOARD_BOLLARD`, `S1_BOLLARD`, `PLUM_BRIDGE`.
- Shots: `SHOTS` (V2S1-V2S8, times, frames, lane, the alive profile (information only), light, pose, the join in with
  its carrier letter, the one thing it explains; = K8 `src/v2r/film/scenes.json`), `shotById`, `shotAt`, `POSE_T`,
  `LOOP_CARRIER`.
- The S1 scale sheet: `S1_LENS` (horizon 965, eye 1.3 m, 14 m, focal 1400; her line 100 px/m at feet 1095, the facade
  90 px/m at base 1082), `s1PxPerM`, `s1FigureH`, `S1_TOWPATH_FEET` (the bend), `S1_SHEET` (every S1 size),
  `S1_CAMERA` (zoom 1.00 throughout: the pull-out is retired; the dive), `s1Screen` (the identity now), `S1_CLOCK`
  (frame 0 drawn in the clean pen, the flood), `FRAME0_TEXT`.
- The ghost row: `S1_ROW` (her, G1-G6, O1-O3: cover x, pop time, word, head value, cues), `s1HerX`, `s1RowAt(t)`
  (lockstep: every member walks her metres, compressed into the bend), `GHOST_POP`, `S1_ROW_STOP`, `S1_LIFE_T`;
  S8's three: `S8.ghosts`.
- Per shot: `S2` (her dark window at M, the five staff windows, blinds, bench, A-board, camera), `S3`, `S4` (+ her far
  window), `S5` (+ `S5_EASE`, progress beats, the blossom-tree wipe out), `S6` (held: `s6BoardAt`, `s6PipSeatAt` return
  the pose; the corner post), `S7`, `S8` (+ `s8TruckU`, the three ghosts, the cafe owner).
- Pip: `PIP_RULES` (tier B; never hops across a join), `PIP` (seat, end seat, beats, the one reaction per shot);
  `PIP_HOP_S2_S3` / `pipHopS2S3At` are RETIRED (a zero-height hop in place).
- Joins: `MATCHES` (every join's carrier letter, screen-space shapes, side out / in / both, Pip on both sides, and its
  rule). `BOTTOM_THIRD` per shot: things only, no stranger's back in any foreground.
- `shotShapes(id, t)`: every contract shape of a shot at any time, mapped through its camera; `contractProblems()`
  checks them all (band, rail, key reads, the floor, Pip clearances, suns, the S5 ease, M on both sides of the match,
  every join's carrier and midpoint) - 0 errors at commit.

**Decisions the contract adds** (each one keeps a treatment or THROUGHLINE rule true)
- S1 and S8 both show W at zoom 1.00 (150 x 170): the loop seam matches with no pull-out and no seam push.
- S1 feet follow the one lens: G6 feet 1068, O3 1057 (sizes exactly 170 -> 135, outlines 130 -> 120).
- Her window takes M in S2 (the staff window there moved to her old spot): the S2 -> S3 match is the thread itself.
- S4's far window sits at (135, 698), 90 x 102 (S8's W proportion): the draft's ~(150, 790) lay behind the DEC plate
  (x 110-560, y 755-855 from 18.92) and crossed SUN1's disc, so the spot rises clear of both (6 px above the plate, left
  of the disc) and leaves y 600-647 for her house's eave, mansard and pots.
- S5's lamppost wipe runs 22.02-22.19 (p 0.37-0.51): p 0.40-0.50 is only 7 frames, the treatment asks >= 10.
- S6 is held (drift 0): Pip sits at the board's foot (360, 1410) at 98 px, its head 204 px under the clause's last
  line; the corner post keeps its own spot (`S6.cornerPost`).
- S8's three ghosts stand left of her door before the truck and slide in front of her SHUT door with it (truck
  dx 240): after the truck x 632-780 is the only legal strip between her board and the rail.
- S7's positions are exact at the push landing (30.04); S2's at 6.70; M is 132.5 x 164.3 in S2 and S3 alike.

**See it.** `src/entry-v2r-map.tsx`: `MapContract` (8 frames, one per shot at its pose), `MapContractShot` {id, t}
(overlay any shot at any time), `MapOverview` (the map). Sheet:
`node scripts/render-frames.mjs MapContract <dir> 0,1,2,3,4,5,6,7 --entry=src/entry-v2r-map.tsx --scale=0.25 --gl=angle`

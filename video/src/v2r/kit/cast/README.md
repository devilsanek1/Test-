# K4 cast (video 2, "One Small Window")

The film's people, drawn NEW for this film (TREATMENT.md sections 3 and 9, K4; map.ts for every spot and size).
Reference 1's grammar: small and simple, a round head that IS the hair (backs), a neck, a tombstone torso, one
accessory, two leg bars, few lines. **Never a face, never a feature, never a big model or a waist-up shot.** Never
teal on anyone but her (`traitProblems()` checks the tables). Import from `src/v2r/kit/cast` (the barrel); every entry
imports `src/v2r/palette.ts` first.

Sheet: `npx remotion still src/entry-v2r-cast.tsx KitCast out.png --frame=0 --scale=0.5 --gl=angle` (every piece at
every size + the engine states); `CastS1` (S1's cast at the cover, 5.30, on a plain stand-in) and `CastCrowd` (a dense
street of backs) are the 216 px checks beside reference 1; `CastWalk` (1080 x 300) is the walk-strip source.

## Conventions (every piece)
- **Position** = canvas px of the FEET (standing), the SEAT line (seated), the FRAME-BOTTOM cut (near backs) or the
  SILL (window figures). Drawings face LEFT; `flip` mirrors (back views: which shoulder the bag is on).
- **Size** in px: `h` standing height (feet to head top), seated `h` (seat to head top), `hv` near backs (cut to head
  top), `hb` window figures (sill to head top).
- **Build** `at` (scene s): ink draws on (the engine pen, 1 frame between parts), fills pop 0.15 s later (`fillLag`).
  No `at` = already built. Nothing fades. Every figure sits in ONE `ExitSync`: the un-build takes it away whole.
- **Seed**: traits, line jitter and misregistration are stable per seed (never Math.random).
- **Look states** just work: `<Look fills="paper">` = the f0 bare-line state, `<Look cascade>` = the flood, World tod.
- **Walks** are a STEP COUNT drawn at 12 drawings/s: `stepsAt(t, [{from, to, rate}])` (lockstep, stops mid-stride
  hold the pose) or `walk={{rate}}` (self-clocked). Travel (x/y) is the lane's and moves every frame. Keep the feet
  honest with `stride={strideFor(stepPx, h, view)}`: S1 her 27 px steps -> `strideFor(27, 170, 'rear34')`, ~1.5
  steps/s = her 40 px/s stroll; S4 `strideFor(34, 170)`.
- **Ink by size** (override `ink`): >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6, below: fill only. Ghosts 2.2.
- **LOD** (override `lod`): >= 105 px full detail (ears, seams, soles, hands, vents), 42-105 simplified (silhouette +
  one accessory), 16-42 fill only, under 16 use `FarCrowd`.

## Pieces
| piece | what | sizes in the shot list | key props |
|---|---|---|---|
| `Her` | her model (`HER`): plum round head + low bun, long teal coat, cream tote; S1 desk plant | 170 (S1, S4), 153 (S1 door), 150 (S8), floor 130 | `pose` walk / stand / stopLook / lookBack / goIn, `view` back / rear34 / profile, `step` or `walk`, `stride`, `plant`, `look` (0..1 turn back), `coatAt` (S1: coat paper until 0.30) |
| `HerWindow` | her full-figure silhouette (plum) pacing in the French window, phone at her ear | 137 at the S3 match (>= 130 after the ease-back) | `x0`/`x1` pace range, `y` floor, `gestureAt` 14.28 |
| `Ghost` | G1-G6: paper fill, closed 2.2 px outline, age = whole-head value; G4+ scarf + softer back; G5-G6 shorter stride | S1 170 -> 135 (map `s1RowAt`), S8 140 / 135 / 130 | `age`, `step` (HER step count = lockstep), `at` pop (outline 0.10 s, fill 2 f later, 4 f settle) |
| `BareOutline` | O1-O3: ink only, hidden lines knocked out (no fill, no age cue), whole | 130 -> 120 | as Ghost |
| `GhostRow` | S1's G1-G6 + O1-O3 placed, sized and popped by map.ts | (map) | `step`, `stride`, `toScreen` (e.g. `s1Screen` for the pull-out) |
| `S8Ghosts` | three ghosts with G4-G6's cues at map `S8.ghosts`, pop 33.78 | 140 / 135 / 130 | `dx` (plane shift during the truck), `view` |
| `Person` | the public (and the base of every standing figure) | 16-400 | `traits` (hair, coat, acc...), `pose` stand / walk / jog / cycle / tiller / reach / phoneEar, `view`, `step` / `walk`, `turn`, `tilt` |
| `Seated` | a seated back (steps, bench, café chair) | 30-260 | `cup` 0..1 (lap -> mouth), `read`, `phone`, `notebook` 0..1, `turn`, `side` |
| `NearBack` | head-and-shoulder back cut by the frame bottom | S1 250-330, S2 260-320, S3 260-300, S6 240-300, S7 200-260 | `hv`, `traits`, `turn` (head shifts; no skin patch at this size) |
| `S1Seated` / `S1_SEATED` | S1's ~14 seated backs in three rows + cups and totes on the treads, with life (a cup lifts, heads turn) | near 250-330, middle ~110, low ~60 | `rows` (move seat lines onto K6's treads), `life`, `only` (layer rows between treads), `at` |
| `SeatedRow` | any row of seated backs, no two neighbours alike | any | `spots` |
| `WindowPerson` | a neighbour in a window, never still (sway, watering, reading, phone) | 12-60 | `hb`, `act`, `tip` (can), `mono` (silhouette) |
| `StaffWindow` / `StaffWindows` | S2: the pane turns a cooler white, a standing silhouette pops in, steps back on "scared", the blind drops | windows 90-155 px (map `S2.staffWindows`) | `lightAt`, `backAt`, `blind` keys `[{t, k}]`, `pane` (false = the set draws it) |
| `Blind` | the blind rig alone: Venetian slats, bottom rail, cord, drop with a small bounce | any pane | `keys` |
| `Staffer` | S2 bench: slate coat, auburn hair, plain lanyard; turns to the reporter 9.48, hood up 10.36 | >= 180 seated (default 190) | `turnAt`, `toward`, `hoodAt` |
| `Reporter` | S2 bench: a small seated back, satchel, notebook opens 9.48, claps shut 12.85; no BBC marks | ~150-168 | `openAt`, `shutAt`, `side` |
| `Stranger` | S5: the public on the bench reading an open newspaper (no masthead, no words) | start 120-200, end 30-45 | `turnPageAt` |
| `CafeOwner` | S8: a small back in an apron, a cloth; one wiping stroke | 130-300 | `wipeAt`, `wipeDur`, `reachFrom` / `reachTo` (relative to the feet) |
| `FarCrowd` / `scatterCrowd` | far people, fill only, batched (one path per colour per 240 px band), walkers wrap, legs alternate at 12/s | 6-45 | `spots` (`vx`, `wrap`, `sit`) |

Helpers: `traitsFor(seed, overrides)`, `castRow(seed, n, pin)` (no two neighbours alike), `NO_TEAL(color)`,
`stepsAt`, `selfSteps`, `strideFor`, `inkFor`, `lodFor`.

## Rules baked in (do not undo in a lane)
- No line inside a head: the low bun is filled over the head in its colour and inked only outside it (an inner arc
  read as a mouth); the crop cut's hairline is a fill edge; a turned head shows a cheek crescent (skin, no features)
  only at seated / standing sizes, never on near backs or curls.
- Back-view arms live inside the coat (seams): a hanging arm outside the silhouette read as a stick on the ghosts.
- Scarf ends hang off-centre over a shoulder (a centred tail reads as a tie, i.e. a front view).
- Ghosts: whole, no bag, no stick, no stoop, nothing frail; ageing stops at white-silver + scarf + shorter stride.

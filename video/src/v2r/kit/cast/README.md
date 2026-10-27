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
- **Seed**: traits (and, under the old sketch pen, line jitter and misregistration: the film's clean pen draws neither)
  are stable per seed (never Math.random).
- **Look states** just work: `<Look fills="paper">` = the f0 bare-line state, `<Look cascade>` = the flood, World tod.
- **Walks** are a STEP COUNT drawn at 12 drawings/s: `stepsAt(t, [{from, to, rate}])` (lockstep, stops mid-stride
  hold the pose) or `walk={{rate}}` (self-clocked). Travel (x/y) is the lane's and moves every frame. Keep the feet
  honest with `stride={strideFor(stepPx, h, view)}`: S1 her 27 px steps -> `strideFor(27, 170, 'rear34')`, ~1.5
  steps/s = her 40 px/s stroll; S4 `strideFor(34, 170)`.
- **Authored ink by size** (override `ink`): >= 240 px 4.8, 130-240 3.4, 72-130 2.2, 42-72 1.6, below: fill only. Ghosts
  2.2. The film's clean pen then sets each drawn line's width and colour by its TIER, never by size ("Tiers" below).
- **LOD** (override `lod`): >= 105 px full detail (ears, seams, soles, hands, vents), 42-105 simplified (silhouette +
  one accessory), 16-42 fill only, under 16 use `FarCrowd`.

## Pieces
| piece | what | sizes in the shot list | key props |
|---|---|---|---|
| `Her` | her model (`HER`): plum round head + low bun, long teal coat, cream tote; S1 desk plant | 170 (S1, S4), 153 (S1 door), 150 (S8), floor 130 | `pose` walk / stand / stopLook / lookBack / goIn, `view` back / rear34 / profile, `step` or `walk`, `stride`, `plant`, `look` (0..1 turn back), `coatAt` (S1: coat paper until 0.30) |
| `HerWindow` | her full-figure silhouette (plum) pacing in the French window, phone at her ear | 137 at the S3 match (S3 holds zoom 1.00: the ease-back is retired) | `x0`/`x1` pace range, `y` floor, `gestureAt` 14.28 |
| `Ghost` | G1-G6: paper fill, closed 2.2 px outline, age = whole-head value; G4+ scarf + softer back; G5-G6 shorter stride | S1 170 -> 135 (map `s1RowAt`), S8 140 / 135 / 130 | `age`, `step` (HER step count = lockstep), `at` pop (outline 0.10 s, fill 2 f later, 4 f settle) |
| `BareOutline` | O1-O3: ink only, hidden lines knocked out (no fill, no age cue), whole | 130 -> 120 | as Ghost |
| `GhostRow` | S1's G1-G6 + O1-O3 placed, sized and popped by map.ts | (map) | `step`, `stride`, `toScreen` (`s1Screen` is the identity since S1's pull-out is retired) |
| `S8Ghosts` | three ghosts with G4-G6's cues at map `S8.ghosts`, pop 33.78 | 140 / 135 / 130 | `dx` (plane shift during the truck), `view` |
| `Person` | the public (and the base of every standing figure) | 16-400 | `traits` (hair, coat, acc...), `pose` stand / walk / jog / cycle / tiller / reach / phoneEar, `view`, `step` / `walk`, `turn`, `tilt` |
| `Seated` | a seated back (steps, bench, café chair) | 30-260 | `cup` 0..1 (lap -> mouth), `read`, `phone`, `notebook` 0..1, `turn`, `side` |
| `NearBack` | head-and-shoulder back cut by the frame bottom | NOT USED in this film (no stranger's back in any foreground: DIRECTION rule 3, THROUGHLINE §1.5); kept for the sheet | `hv`, `traits`, `turn` (head shifts; no skin patch at this size) |
| `S1Seated` / `S1_SEATED` | S1's seated backs + cups and totes on the treads, with life (a cup lifts, heads turn) | only the low row by the water (~60 px) since the conform; the near and middle rows are retired (things on the treads instead) | `rows` (move seat lines onto K6's treads), `life`, `only` (layer rows between treads), `at` |
| `SeatedRow` | any row of seated backs, no two neighbours alike | any | `spots` |
| `WindowPerson` | a neighbour in a window, never still (sway, watering, reading, phone) | 12-60 | `hb`, `act`, `tip` (can), `mono` (silhouette) |
| `StaffWindow` / `StaffWindows` | S2: the pane turns a cooler white, a standing silhouette pops in, steps back on "scared", the blind drops | windows 90-155 px (map `S2.staffWindows`) | `lightAt`, `backAt`, `blind` keys `[{t, k}]`, `pane` (false = the set draws it) |
| `Blind` | the blind rig alone: Venetian slats, bottom rail, cord, drop with a small bounce | any pane | `keys` |
| `Staffer` | S2 bench: slate coat, auburn hair, plain lanyard; turns to the reporter 9.48, hood up ~10.85 (after the blinds: map `S2.hoodAt`) | >= 180 seated (default 190) | `turnAt`, `toward`, `hoodAt` |
| `Reporter` | S2 bench: a small seated back, satchel, notebook opens 9.48, claps shut by 12.70 (map `S2.notebookShutAt`); no BBC marks | ~150-168 | `openAt`, `shutAt`, `side` |
| `Stranger` | S5: the public on the bench reading an open newspaper (no masthead, no words) | start 120-200, end 30-45 | `turnPageAt` |
| `CafeOwner` | S8: a small back in an apron, a cloth; one wiping stroke | 130-300 | `wipeAt`, `wipeDur`, `reachFrom` / `reachTo` (relative to the feet) |
| `FarCrowd` / `scatterCrowd` | far people, fill only, batched (one path per colour per 240 px band), walkers wrap, legs alternate at 12/s | 6-45 | `spots` (`vx`, `wrap`, `sit`) |

Helpers: `traitsFor(seed, overrides)`, `castRow(seed, n, pin)` (no two neighbours alike), `NO_TEAL(color)`,
`stepsAt`, `selfSteps`, `strideFor`, `inkFor`, `lodFor`.

## Tiers (the clean pen, 2026-10-27)
`src/v2r/pen.ts` switches the film to the clean pen with ATTENTION TIERS (`docs/look/CRAFT.md` §b-§c; `../tiers.tsx`).
Every part's line is its OWN fill's shade (`Parts` passes `tone`: a same-hue line, never near-black). **Defaults:**
`Her`, `HerWindow` = `subject` (the only full outline: 3.0 px, her own deep shade); `Person`, `Seated`, `NearBack`,
`SeatedRow`, `WindowPerson`, `S1Seated`, `Staffer`, `Reporter`, `StaffWindow(s)`, `Blind`, `Stranger`, `CafeOwner`,
`Dog`, and the ghosts `Ghost`, `BareOutline`, `GhostRow`, `S8Ghosts` = `support` with lines (ref 1's line-drawn
crowd: a thin same-hue line 1.6-2.2 px, fills calmer, C* <= 25); `FarCrowd` = `environment`. Each figure has ONE tier
(`tieredAll`: Her's Person is the subject too). Promote on the beat: `<GhostRow tier="subject">` (S1's row, S8's
callback: the ghosts' closed outline is on purpose), `<StaffWindows tier="subject">` on "scared"; a far walker can
drop to `tier="environment"`. `Parts` / `FigureG` have no tier of their own (a lane's figure draws in its scope).

## Rules baked in (do not undo in a lane)
- No line inside a head: the low bun is filled over the head in its colour and inked only outside it (an inner arc
  read as a mouth); the crop cut's hairline is a fill edge; a turned head shows a cheek crescent (skin, no features)
  only at seated / standing sizes, never on near backs or curls.
- Back-view arms live inside the coat (seams): a hanging arm outside the silhouette read as a stick on the ghosts.
- Scarf ends hang off-centre over a shoulder (a centred tail reads as a tie, i.e. a front view).
- Ghosts: whole, no bag, no stick, no stoop, nothing frail; ageing stops at white-silver + scarf + shorter stride.

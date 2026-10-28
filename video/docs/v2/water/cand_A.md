# Water candidate A: "True reflection" (S1, 2026-10-28)

**The brief** is the owner on v5's water (`deliverables/v2/v2r_G4_look_v5.mp4`): "I don't like the water too much, leafs
are great" ... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean
that about the water." **Rank:** a study note; the owner's words (playbook DEPTH AND SEPARATION, v2 OWNER_NOTES) >
`docs/look/DIRECTION.md` > `docs/look/CRAFT.md` > this page. Inputs: `DIAGNOSIS.md` (geometry, the seam) and
`docs/look/research/2026-10-28_water.md` (R1-R14).

**Images:** `cand_A_sheet.jpg` (1.0 / 2.5 / 3.8 / 5.0 s at 0.5 scale), `cand_A_phone.jpg` (the same at 360 px wide).
The full set is in `out/water_study/candA/final/` (gitignored): the four full-size stills, `crops_1to1.jpg` (the water
at 1:1, v5 above A at each time), `motion_strip.jpg` (f153-f207, 6-frame steps, the middle of the water at 1:1),
`drawin.jpg` (f0 / f3 / f6 / f9 / f12), `candA_2s_master.mp4` (2.50-4.48 s, `--master`).

**Code:** `src/v2r/water_study/candA.tsx` (`CandWater`, `GLINTS_OFF = true`, `CandDuck`), `candA_core.ts` (the engine,
pure TS: the would-be core of `lib/water.tsx`), `candA_s1.ts` (S1's spec: every reflection derived from S1's own
geometry). Nothing outside these three files changed.

## 1. What it is

The canal is drawn like a building: it is the MIRROR of S1 itself under the one camera, seen through the water.
1. **The open water** (the one allowed gradient): `S1_EVENING` mirrored about the horizon (water y shows the sky of
   1930 - y), toned by Fresnel: the far water mirrors the warm horizon (L* 86.5), crosses to the water's own pale veil
   at L* ~86 by y ~1165 (light: never beige, khaki or grey) and settles on the teal body (L* 77) from y ~1250. It is a
   lib/sky spec (eased OKLab curve, lib/sky's blue-noise dither) over the water's box, held still on screen while the
   water plane floats (the sky is at infinity). It shows only where nothing stands above the water, and in the gaps.
2. **Every reflection**, each mirrored about its OWN waterline (`geometry.ts`): Google's ground storey about the lens
   line under its base (its lowest ~21 px hide behind the coping's reflection, as they must); the door bay's lit lobby
   (the gold column); the corner pier and the slit bay; the lamp posts at the path's back (long thin streaks); her and
   the row on the front line (hung from the coping's reflection, as long as they are tall, walking and popping with
   them; her behind the glass until 0.97 s about the lens line); the door's sliding leaves (the stiles slide in the
   water at 0.45-0.58 and 0.97-1.10 s); the bollards; the coping's own face (the crisp contact band, R10); the road
   bridge about the far water under its arch (y 1050: the voussoir ring and the shaded soffit close the arch's ellipse
   across the far towpath; the deck, the posts, the bus crossing from 1.10 s); the far tower and the far roofs about the
   horizon (their roofline upside down under the bridge deck); the two moored boats about 1140 / 1196 (hull and cabin,
   the bow's sweep mirrored); the duck about 1136. Each rides its own parallax plane (`floatOf`).
3. **Cut by ripples:** 53 level rows at equal real spacing (0.33 m +- 30 %: 2.7 px at the far edge, 7.9 px at y 1215,
   13.5 px at our edge), each sliding sideways on two waves that travel toward us; every piece's ends recede a little
   in every row (an irregular zigzag) and a lot in the near rows (the reflection's near end breaking into rounded
   fragments); gaps are flat lenses of the open water's colour (thin warm light lines along the far quay, row-tall
   teal pills near us).
4. **The sun's glitter column** straight under SUN0: a still gold bed of level lenses, one per row, each breathing on
   its own cycle, and warm-white slivers that grow in and out; v5's star field is off (`GLINTS_OFF`).
5. **The duck** (`CandDuck`): the kit's mallard exactly (same paths through `<Fill>`, so the pen and the flood treat it
   as before), its paper V wake replaced by one slow, flat ring (a duck at rest paddles rings, R11); its reflection is
   in the water's rows.
6. **Frame 0:** the water lands as flat pale shapes (the reflections unsliced, mixed 0.7 toward the paper) and the
   colour floods in from SUN0 with the rest of the set (a circle, 5800 px/s: the left water at f6, the middle f9, the
   right f12; measured L* 88-92 at f0-f3, 72-82 from f12).

## 2. Why it reads premium (the choices)

1. **Every mark is the water's response to something** (the diagnosis' tell 2). Nothing is a stamp: each reflection is
   a thing of S1, at its mirrored place under the one camera, moving when it moves (her, the ghosts' pops, the doors,
   the bus, the duck). The classic premium cues come for free from the truth: the lit door's gold column, figures
   wavering in it, the arch closing into its reflection, dark hulls doubling the boats, lamp posts as long streaks.
2. **Hue from the water, value from the world, light keeps its colour.** A warm reflection mixed into teal water is
   khaki in RGB (research R4); so every opaque thing takes the water's own teal family at its toned VALUE (L* toward 76
   by the Fresnel ladder, h 182 + 0.9 deg bluer per L* deeper, C* 6.5-16), and only lights keep their warmth: the lobby's
   gold (L* 79-82, C* 38), the sun's glitter, the warm sky glints along the far quay. The water stays the frame's one
   cool field (the diagnosis' "what v5 gets right"), the reflections read by shape and value, and no colour in the
   water is beige, tan, olive or grey.
3. **Drawn one plane simpler than the facade** (R5): masses, verticals and lights only. The fins, the plinth, the
   door's jambs, the lobby's floor, counter and plant, the boats' portholes and gunwale stripe, the railing's bars, the
   people's legs (one silhouette per figure, one value) are all dropped: no lines, no small parts, nothing at a
   stamp's size. Tier C throughout: no outlines, local value steps of 3-12 L*.
4. **Ripples are structure, not stamps:** rows spaced by perspective, a sway that travels toward us, ragged edges that
   grow toward us (Fresnel by coverage: the reflection intact along the far quay, fragmenting near us where the body
   shows), gaps as lenses with pointed ends far and rounded ends near (R6: never square, never a barcode), the sun as
   one column of level slivers (R8), never four-point stars.
5. **Calm motion** (numbers in §3): masses, the sky ramp and the contact bands hold still; only the slices sway
   (+-1.6 px far, +-5.5 px near), the zigzag travels toward us at 0.39-0.44 m/s, gaps grow and shrink over 3.4-7 s, the
   bed's lenses breathe over 2.6-4.4 s, 4-6 slivers twinkle (0.42-0.9 s each), one duck ring every 3.4 s.

## 3. The numbers

**Camera** (`geometry.ts` S1W_CAM): level, horizon 965, focal 1400, the eye 1.45 m over the water. Fresnel R 0.53 at
the far edge (y 1111) -> 0.26 at our edge (y 1290).

**Rows** (`candA_s1` ROWS): from y 1054 (the bend's far water) to 1336; dz 0.33 m +- 30 %; nearness n 0 at y 1111 -> 1 at
y 1290.

**Sway** (SWAY): amplitude 1.6 px (far) -> 5.5 px (near) x (0.7 sin(2 pi z / 2.2 m + 2 pi t / 5.0 s) + 0.3 sin(2 pi z /
1.4 m + 2 pi t / 3.6 s)) + a static +-0.12 per row. Phase speed 0.44 / 0.39 m/s toward us: ~4.5 px/s at the far edge,
~13 px/s at y 1215, ~22 px/s at our edge; peak sideways speed of a slice ~2 px/s far, ~7 px/s near. Neighbouring rows
differ by 54 deg of the long wave (a gentle zigzag).

**Ragged edges** (RAGGED): each piece's ends recede 1.5 -> 3.5 px (square, every row) plus, from n 0.45 (y ~1192), up to
18 px more at our edge (rounded when 4.5 px or deeper: a half-lens bulging 0.4 of the row height, at most 5 px); each
end breathes on its own 3-6 s cycle; a thing under 80 px wide loses at most a fifth of its width per side.

**Gaps** (GAPS): 0.8 (far) -> 5.0 (near) lens slots per 1000 px per row; lengths 40-200 px far, 50-190 near; thickness
0.22 of the row (far: ~1 px light lines on the row's top edge) -> 1.0 (near: row-tall, centred, pills from n 0.55); each
lens grows along its length and shrinks out (sin^0.7) over 3.4-7.0 s, then comes back elsewhere. ~80 alive. Colour: the
open water's ramp at the lens's place (quantised to even codes), so a gap is seamless with the open water. No gap on
the coping's own face.

**The Fresnel ladder** (kOf): k = 0.40 (rows from y 1054) -> 0.70 (from y 1272) in 7 flat steps of 0.05, one per row.

**Reflection tones** (reflectTone, TONE {waterL 76, waterH 182, waterC 10, hueSlope 0.9, chromaSlope 0.32, C* 6.5-16}):

| source (on screen) | far, k 0.40 | near, k 0.70 |
|---|---|---|
| the wing's brick in shade #CE9985 (L* 67.7, C* 25) | #95B4B0 (L* 71.0, C* 11.4, h 187) | #9EBBB6 (L* 73.7) |
| the corner pier, limestone in shade #D5C6BB (80.8) | #B1C8C3 (L* 78.8, h 181) | #ACC5BF (L* 77.6) |
| the slit bay, slate #8F8F9E (59.8) | #84A8A5 (L* 66.2, C* 13.1, h 191) | #95B5B0 (L* 71.3) |
| the lit lobby, CM.lamp #F7CF86 (85.1, C* 41.7: emissive) | #ECC583 (L* 81.5, C* 38.6, h 82) | #E5BD7C (L* 78.8, C* 38.6) |
| lamp posts and bollards, iron #9DA3B3 (67.0) | #93B3AF (L* 70.6) | #9DBAB5 (L* 73.3) |
| the coping's face in shade #B8ADBA (72.0) | #9EBBB6 (L* 73.7) | (far only) |
| boats' hulls #707E92 (52.3) | #749D9B (L* 61.8, C* 14.7, h 194) | #8DAFAB (L* 68.9) |
| boat A's sage cabin #B5C7AF (78.3) / B's oat #E4D3BA (85.3) | #ABC5BF (77.5) / #BACFCA (81.5) | #A9C3BD / #B0C8C3 |
| her teal coat CM.hero (k >= 0.6) | #8BADA9 (L* 68.2, C* 12.5) | #8BADA9 |
| the ghosts' oat coats (k >= 0.6) | #B0C8C3 (L* 78.7) | #B0C8C3 |
| the duck #A66952 (50.5) | #709A99 (L* 60.7, C* 15.0, h 196) | #8BADAA (L* 68.2) |
| the bridge's brick #DAA28E / deck #EEDECD / soffit #D0CCD8 | #9DBAB5 (73.3) / #C3D6D0 (84.1) / #B5CBC6 (80.0) | #A2BDB8 / #B5CBC6 / #AEC6C1 |
| the far roofs (hazed stucco #F5D9C3) / tower #B5B7C6 | #C1D4CF (83.4) / #A4BFBA (75.3) | #B4CBC5 / #A5C0BB |

**The open-water ramp** (waterRamp; skyCheck: yellow-green crossing C* 6.95 <= 7, no grey run, 30 stops): y 1068-1130
#F3D3B7 (L* 86.5, C* 19.3, h 69: the mirrored horizon, toned) -> 1140 #EDD3BB (86.1, C* 16.1) -> 1160 #D9D7CC (85.9, C*
5.8: the light crossing) -> 1180 #C8D8D4 (85.1, h 179) -> 1200 #BED4D0 (83.2) -> 1230 #ACCBC5 (79.3, C* 11.5) -> 1260-1336
#A0C5BE (76.8, C* 13.7, h 182: the body; v5's on-screen water was #A6C7C3, L* 78).

**Glitter** (GLITTER): column centre x 196 (riding the sun's plane), rows y 1104-1172; half-width 0.06 rad slopes:
hw = 0.06 (y - 965) + 1400 x 0.06 x sin 7.85 deg = 19.8 px at 1104, 23.1 at 1158, 23.9 at 1172 (the column ~3.5x taller
than wide here). The bed: one level lens per row, 0.5-1.15 x 0.85 hw half-length, 0.62 of the row tall, wandering
+-30 % hw, swelling and shrinking on a 2.6-4.4 s cycle (to nothing now and then), BED #FACEA0 (L* 85.5, C* 30, h 72).
Slivers: 6 slots, each life 0.42-0.9 s (62-86 % of it lit, sin^0.6 along its length), y from N(1158, 22), x from N(196,
0.5 hw), 18 -> 34 px long at 8.5:1 (2.1-4 px tall), SLIVER #FFF5E8 (L* 97.0, C* 7.5): 4.2 alive on average, at most 6
(CRAFT §f.6: 4-6; S1's total stays <= 16 with the motes and the leaves); born from 0.30 s.

**The duck's ring:** from 0.45 s every 3.4 s, 2.4 s long: rx 22 + 28 px/s, ry 0.12 rx (the water's foreshortening at
y 1136), a hairline thinning 1.3 -> 0.45 px (grows in over 0.25 s: never a fade), the far water's warm glint colour.

## 4. Render cost

Bench (`out/water_study/candA/render.mjs --bench`: one bundle, frames 180-195 = 3.00-3.25 s, concurrency 1, JPEG, the two
compositions alternated twice on the shared 4-CPU machine): **WaterStudyBase median 558 / 584 ms per frame, A 561 / 579
ms** (means 608 / 668 vs 615 / 621): **A costs the same as v5's water within the bench's noise (+-25 ms).** The JS per
frame (node): 6.8 ms (slicing ~35 sources into 53 rows, the gaps, the glitter); ~82 reflection paths (~51 KB of path
data), ~20 gap paths, 2 glitter paths, the ramp (lib/sky: one gradient and its dither over the water's box). The 2 s
master clip: 120 frames in 66 s at concurrency 2.

## 5. Checks

- **Typecheck:** clean (`npx tsc --noEmit -p video`).
- **Determinism:** f150 and f301 rendered in two processes: identical sha256 (c7ba0f50..., c5802fe3...).
- **Draw-in:** water L* (three sample boxes) 91.8 / 88.7 / 88.9 at f0 and f3 (pale), the colour lands f6 (left), f9
  (middle), f12 (right): 81.8 / 72.4 / 74.9.
- **Particles:** 4.2 slivers alive on average, 6 at most (frames 18-367).
- **The ramp:** skyCheck khaki C* 6.95, grey run 0. `check_banding.py` was not run: the open mirrored sky shows only in
  thin gaps and small patches under the bridge's reflection, no open stretch big enough for its region; the ramp is
  lib/sky's own curve and dither.
- **The 5.80-6.40 join:** nothing new enters or pops in the water (the gaps, the bed and the slivers are steady
  fields; the duck's 3.85 s ring thins out by 6.25; the ghosts' reflections pop with the ghosts, last at 5.16).
- **The seam:** only `candA*.ts(x)` changed; WaterStudyBase still renders v5 (the comparison crops).

## 6. API sketch: one shared `lib/water.tsx` for S1, S2, S3, S4, S8 and S5

The engine is already scene-agnostic (`candA_core.ts`); S1's part is a spec (`candA_s1.ts`). Promoted, it would read:

```ts
// lib/water.tsx (proposal): the engine of candA_core.ts + the React layer of candA.tsx
export type WaterSpec = {
  cam: WaterCam;                       // {horizon, f, eye}: the shot's level lens over the WATER (eye in m)
  region: string;                      // the visible water as one closed path (screen px at rest), tucked under its banks
  sky: SkySpec;                        // the shot's lib/sky preset: mirrored + toned into the open-water ramp
  body: string;                        // the water's own colour (the near water; S1 #9CC3BC)
  ramp?: {far: number; veil: number; body: number};   // the ramp's toning (S1: the defaults above)
  tone?: Partial<ToneOpts>;            // hue from the water, value from the world (S1 TONE)
  ladder?: [number, number];           // the Fresnel ladder's k far -> near (S1 [0.40, 0.70]), steps of 0.05
  rows?: {dz: number; jitter: number; yTop: number; yBot: number; nearFrom: number; nearTo: number};
  sway?: Sway; ragged?: Ragged; gaps?: Gaps;
  sun?: Glitter & {bed: string; sliver: string; rows: [number, number]};
  sources: Src[];                      // static reflections, ALREADY mirrored (see the helpers)
  moving?: (t: number) => Src[];       // her, a boat passing, a bus, ducks
  float?: (plane: number, t: number) => Pt;  // the shot's parallax float per plane (S1: geometry floatOf)
  flood?: {origin: Pt; t0: number; speed: number; pale: number; paper: string};
  lod?: 'near' | 'far';                // far (R14): no slices or sway, 2-3 bands + flecks
};
export const Water: React.FC<{spec: WaterSpec; t: number}>;
export const WaterRing: React.FC<{x: number; y: number; t: number; spec: WaterSpec}>;   // a duck at rest (R11)
// helpers: mirror(poly, line | (x) => line); mirrorPlane(pm: PlaneMap, base: (x) => y) for a facade; horizonMirror;
// a receding quay's affine mirror (R1: y' = 2 (a0 + s x) - y); reflectTone; waterProblems(spec) (no ramp colour in the
// beige / olive / grey bands, slivers <= 6, gap ends never square, nothing new in a join's window).
```

How each water feeds it (read-only today: other lanes own these files):
- **S2** (`V2S2_Water.tsx`, the receding canal): the wedge region; the wall's bays and its lit band as `Src` through the
  sloped quay's affine mirror; the passing boat as a `moving` source. Missing in A: a moving wake (a Kelvin V opening
  wide for a boat heading into the picture, R11): a `wake` primitive next to `WaterRing`.
- **S3** (`V2S3_water.tsx`, `S3_WATER`): the canal plus the sliver under our hull; the sliver is a steep view: ladder
  k 0.7-0.8 (mostly body), coarse rows.
- **S4 / S8** (kit `Water` in `kit/canal/sets.tsx`, `V2S4_wcanal.tsx`): the set's water band; S8's lamps lit at sunset
  as `kind: 'light'` sources (gold columns, R7) and S8_EVENING as the sky.
- **S5** (`V2S5_river.tsx`, the Potomac in April, a 23 px far strip): `lod: 'far'` (R14): S5_SKY mirrored, the far
  shore as one darker band, the bridges' arches, glitter as small flecks (len 2-6 px), no sway.
- **S7** (`V2S7_water.tsx`, the basin): S7_SUNSET and its own sources.

## 7. Open points (for the judge and the integrator)

- **Colour identity.** A keeps the canal the frame's cool field: the warm world shows in the water as VALUES and only
  the lights stay warm. Physically the far water would be warmer (R 0.53 of a warm wall); a "warmer" variant is one
  knob (let the far rows keep a little of a warm source's hue in `reflectTone`), but every mix toward teal passes
  khaki or grey, so A does not.
- **The glitter under a low sun is mostly behind the bridge** in S1's drawn geometry (the sun 7.8 deg up, the bridge's
  waterline ~24 m away): a strict mirror would show almost none. A draws the column anyway (the water's strongest cue),
  over the bridge's reflection.
- **CRAFT §f.6:** A's slivers are counted as glints (<= 6). The gold bed is not a particle (a still light column, R8).
- **Kept from S1, drawn over the slot:** the far towpath's own 8 px waterDeep strip and S1BoatStrips read as the
  contact bands; no change needed.
- **The duck's ring** is a hairline (CRAFT §c: things that ARE lines); without it the duck still sits on its reflection.
- **Not run:** `check_light.py` (A adds no light layer; the boat strips multiply a teal hull reflection, which stays
  teal) and `check_banding.py` (§5).

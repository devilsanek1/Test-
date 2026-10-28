# Water study, candidate B: "designed editorial" (2026-10-28)

**Built (2026-10-28):** the study is closed. The shipped water is `src/lib/water.tsx` (how-to `src/lib/WATER.md`, rules
`docs/look/CRAFT.md` §f.7), fed S1's spec in `src/v2r/scenes/V2S1_water.tsx`; the study seam, `src/entry-v2r-waterstudy.tsx`
and `src/v2r/water_study/` are removed (their code is in git history up to 5506f34). The paths below are historical.

**The brief** is the owner on the G4 look clip v5's water (`docs/v2/OWNER_NOTES.md`): "I don't like the water too much,
leafs are great" ... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I
mean that about the water."

**Rank:** a study note. The owner's words (the playbook's depth and water rule) outrank it, then `docs/look/DIRECTION.md`,
then `docs/look/CRAFT.md`. It builds on the research (`docs/look/research/2026-10-28_water.md`, R1-R14) and the
diagnosis (`DIAGNOSIS.md`, S1's geometry and the seam).

**Files:**
- `src/v2r/water_study/candB.tsx`: S1's spec and the two components the seam takes (`CandWater`, `CandDuck`), `GLINTS_OFF = true`.
- `src/v2r/water_study/candB_lib.ts`: the engine. It is film-agnostic pure TS (no React) and is the seed of a shared `lib/water`.
- `cand_B_sheet.jpg`: WaterStudyB at 1.0, 2.5, 3.8 and 5.0 s, at 0.5 scale.
- `cand_B_phone.jpg`: the same four frames at 360 px wide, as the owner sees them.

Renders (gitignored) are in `out/water_study/candB/`:
- `final/`: the four stills at full size;
- `final_water_1to1.png`: the water at 1:1;
- `motion_strip.png`: 10 frames at 6-frame steps, 2.55-3.45 s, water crop only, with a 1:1 detail of the sun's column and the duck;
- `f0/`: frame 0's draw-in.

## 1. What it is

S1's canal is drawn like a refined editorial or poster print. It uses fewer, better shapes, and every shape is the
water's answer to something that stands over it. Everything is raw SVG with computed colours, inside the water's
parallax group. Each reflection is counter-shifted onto its own thing's plane (the bridge 0.35, the wing and the row
0.6, the boats 0.74; the glitter sits at infinity, under the sun). The layers, bottom to top:

1. **The ramp.** This is the one gradient (the brief's exception): `S1_EVENING` mirrored about the horizon. It is
   compressed 3.5x about y 1080, so the sky's lower ramp (horizon, light band, caption mint) lands in the far third of
   the strip. It is toned toward the canal's body by an art-directed Fresnel (0.9 of the sky at the far bank, 0.2 at
   our feet), drawn with `lib/sky` `<Sky>` (its eased OKLab curve and blue-noise dither), and clipped to the water.
   - Warm rows are toned in value only, so they never turn khaki.
   - The crossing from warm to cool goes through a light cream (L* 89, C* 5).
   - The near two thirds are the teal body, so the canal stays the frame's one cool field.
   - `skyProblems` is `[]` (the yellow-green crossing is at C* 5.9; there is no grey run).
2. **Reflections.** Each one is a single simplified shape, mirrored about its own waterline (R1), far to near:
   - **The bridge** is one rose value (spandrels, course and deck merged; R5: one value per object). The arch's bowl
     (the soffit, cool) and its light voussoir ring close the classic ellipse with the real arch (the far towpath
     crosses its middle). The pilaster is a light vertical, and the far city's haze sits below the deck.
   - **Google's wing** is its ground storey's lowest ~1.2 m: one brick mass, the light corner pier and the cool glass
     slit.
   - **The posts:** the lamp posts at x 6, 360 and 752 hang from the quay as wavering verticals, whole for 70 % of
     their length, then a few dashes.
   - **Her and the row** each get one slim vertical (the legs; her coat's hem below, calmed teal at C* 21). The bare
     outlines O1-O3 have no fill and reflect nothing. A ghost's reflection grows in with its pop (0.12 s).
   - **The lobby's gold** is a light column as wide as the door (R7), running through the whole strip.
   - **The moored boats:** the hulls are dark slate, with the raked bows mirrored as downward sweeps. The cabins are
     weak reflections of pale things in the near water, so they take the water's hue (pale mint, never beige).
     Boat A's reflection gives way to boat B's at B's bow.
   - Every mass is SOLID at its base (its sides wave with the sway), then cut into level SLICES on ONE shared
     perspective grid, so neighbouring reflections break on the same rows. Toward us, the slices narrow along a smooth
     symmetric envelope, break once at most and only in their last half, and the very last may drop.
   - Fresnel is drawn in three flat colour steps (R2, at y 1150 and 1195). A warm reflection sinks into the water
     through mauve (rose to mauve to the teal), and a cool one through slate. It never goes through khaki or grey.
3. **The quay:** the bollards' stubs (round, dome-capped), and one cool band (the coping's face mirrored) under the far
   towpath's own dark waterline strip.
4. **Ripples:** 6-11 long, level, tapered lines alive at once, in two tones (a crest catching the sky; a trough showing
   the body), on the near open water.
5. **The glitter:** one narrow column under SUN0 (R8). It is a still bed of 12 gold lenses, one per row, their lengths
   following the column's envelope (densest near the sun's mirror point). Warm-white cores nest inside the lenses and
   twinkle: each grows in and shrinks out along its length. It replaces v5's four-point stars (`GLINTS_OFF`).

**The duck (`CandDuck`)** is the kit's mallard, drawn with the same fills, bob and pen. It now glides east at 7 px/s,
because a V behind a still duck is false (DIAGNOSIS tell 5). Under it are its toned reflection in three slices and a thin
darker contact lens. Behind it is a clean, very flat Kelvin V (R11): 2.5 deg per arm at its row, 2.7 body lengths, each
arm three tapered pieces thinning from 3 px to 1.5 px. The V is light (the crests catch the sky) and is never paper
white. It ends short of the glitter.

**Frame 0** (`f0/`): the water lands as flat PALE shapes, like every fill before the flood. These are the ramp and the
big masses mixed S1_PALE toward the paper, still. The colour floods in with the front from SUN0, clipped to its circle
(f5-f12). Glitter and ripples are born from 0.24 s.

## 2. Why it reads premium (and not cheap)

1. **Every mark answers something above it.** The arch closes into its ellipse, the gold door drops a column of light,
   the row walks over its own reflections, the boats' bows sweep down, the posts waver, and the sun lays one column of
   light. v5's water mirrored nothing (DIAGNOSIS tells 1-2). Here nothing in the water is a stamp.
2. **One slice language, one grid.** Every reflection is a clean silhouette that breaks into level, tapered bars on the
   same perspective rows (0.45 m of water: 4.7 px far, 23 px near). Gaps line up across neighbours and the envelopes
   are smooth, so the slicing reads as ripples, never a barcode or a boil. Open water stays a calm field (R6).
3. **Colour that sinks, never muddies.** Toning is done in OKLCH (R3-R4). Lights hold their value, mids hold, and
   darks lift. Hue and warm chroma are kept, and from the second Fresnel step a warm reflection turns through mauve, a
   cool one through slate. There is no khaki, beige, olive or grey anywhere: `neverBand` holds on every colour the
   design uses (the 15 ramp keys, the 45 tones of §3, the ghosts' 18 and the duck's). The near water stays teal: the
   frame's cool field (DIRECTION rule 6).
4. **Light drawn as light.** The sun's path is a column of nested lenses, and the lit door is a column as wide as the
   door. The cores are warm white (L* 97, never #FFFFFF), and nothing glows, blurs or gradates except the mirrored sky.
5. **Calm, alive motion.** The masses and the ramp hold. Only the slices sway, and their phase travels toward us at
   ~0.3 m/s (real wave speeds). Ripples drift with the westerly that blows the leaves. The glitter twinkles inside its
   still bed.

## 3. The numbers

**Camera and grid:** S1's lens: horizon 965, focal 1400 px, the eye 1.45 m over the water.
- Slice rows every 0.45 m of water, projected: pitch 4.7 px at y 1111, 7.6 at 1150, 12.2 at 1200, 18 at 1250, 23 at 1290.
- Each band's gap: 16 % of its pitch far, 26 % near (y 1110 -> 1290).
- Fresnel steps at y 1150 and 1195.

**Ramp keys** (water y: hex, L*/C*/h):

| y | hex | L* / C* / h |
|---|---|---|
| 1060 | #F8D8BB | 88.3 / 19.6 / 70 |
| 1105 | #F4D9C2 | 88.3 / 15.8 / 69 |
| 1115 | #EBDED0 | 89.1 / 8.7 / 76 |
| 1125 | #E0E2D8 | 89.5 / 5.2 / 118 |
| 1135 | #D3E0D6 | 88.0 / 7.0 / 151 |
| 1145 | #C4DBD1 | 85.5 / 9.8 / 166 |
| 1165 | #B0D3C9 | 81.9 / 13.6 / 175 |
| 1200 | #A5CCC3 | 79.1 / 14.7 / 179 |
| 1230 | #9EC7BF | 77.2 / 15.2 / 182 |
| 1300 | #95C0B8 | 74.5 / 15.9 / 182 |

The body keys are #B4D6CD at y 1120, CM.water #9DC6BF at 1180, and #8CBAB3 at 1300. The ramp mirrors the sky away from
the sun (x 700); the sun's warmth in the water is the glitter's job.

**Reflection tones.** Each source is the on-screen colour sampled at 1.0 s. The three tones are the far, middle and
near Fresnel steps, as hex (L*):

| reflection | source | far | middle | near |
|---|---|---|---|---|
| bridge brick | #DAA28E | #D9A18D (71.0, C* 26, h 46) | #D6A8A1 (72.8, h 32) | #D1ADAF (73.9, h 16) |
| arch soffit (bowl) | #D0CCD8 | #BBCFCB (81.6) | #BBCBC8 (80.4) | #BCC7C5 (79.4) |
| stone (ring, pilaster) | #EEDCCB | #EAD8C8 (87.4) | #E7D6CC (86.7) | #EDD0CA (85.7) |
| far city's haze | #D8BEC4 | #D4BBC1 (78.1) | #CDBCC3 (77.8) | #C8BCC4 (77.4) |
| wing brick | #CD9985 | #CB9782 (66.9, C* 25, h 48) | #CDA29B (70.3, h 33) | #CAA9AA (72.1, h 18) |
| wing pier (limestone) | #D5C5BB | #E2BFAF (79.9) | #DDBFB7 (79.6) | #D0C2C0 (79.5) |
| wing glass | #93949F | #92A5A2 (66.2) | #9BAAA7 (68.4) | #A4AFAD (70.6) |
| lobby gold (a light) | CM.lamp #F7CF86 | #E9CB95 (83.0, C* 31) | #E7C994 (82.3) | #E5C792 (81.6) |
| iron (posts, stubs) | #9DA3B3 | #A5AAB9 (69.6) | #A5AFB8 (71.0) | #A8B3B6 (72.2) |
| hulls | #707E92 | #8490A3 (59.4) | #8A9AA4 (62.7) | #94A2A6 (65.7) |
| boat A cabin (sage) | #B5C7AF | #AEC6B8 (77.8) | #AEC5B8 (77.5) | #AEC4B7 (77.2) |
| boat B cabin (oat) | #E4D3BA | #BBD2C3 (82.2) | #B8CEBF (80.8) | #B5CBBD (79.7) |
| her legs | #5A3C4E | #9F8094 (57.0) | #9F8A9E (59.9) | #A195A5 (63.2) |
| her coat (hers only, C* <= 25) | CM.hero #0B8577 | #6DA79F (64.5, C* 21) | #73ADA4 (66.7) | #85AFA9 (68.4) |

- A ghost's reflection is its head colour (MAP.S1_ROW: they age by value) toned at k 0.68 / 0.74 / 0.80.
- The quay band is #A2C5BF (76.9), under the far towpath's strip (#8BB4AF on screen).
- Ripples are the water's own colour at their row, +0.045 OKLab L (crest) or -0.05 (trough).
- The glitter bed is #F9CD98 (85.0, C* 33, h 75) and its cores #FEF7E7 (97.4).
- The duck: its reflection is #A66952 toned at k 0.45, and its V is the water's colour +0.03 L.

**Sizes:**
- **Glitter:** a column at x 196, y 1099-1172, half-width 17 px far -> 36 px near. The bed is 12 lenses, 21-56 px x
  3-6.5 px. The cores are 6-26 px long, with 2-12 alive (mean 8).
- **Ripples:** 40-150 px x 1.5-3 px, 6-11 alive (mean 9). They are kept clear of the sun's column and Pip's seat.
- **Posts:** the lamps are 2 x 0.62 x 0.034 h wide (~10-15 px); the bollard stubs are 0.76 h wide and dome-capped.
- **The row:** legs 0.092 h wide, 0.36 h long; her coat 0.24 h wide, 0.26 h long.
- **The wake:** 2.7 body lengths (167 px), arms at 2.5 deg.

**Motion (R12):**
- Sway: +-1.5 px at the far bank, +-2.6 at y 1200, +-3.9 near. That is at most 2.3 / 3.6 / 6.5 px/s sideways. It is two
  sines (4.6 s and 2.9 s; wavelengths 1.5 m and 0.8 m) whose phase travels toward us at ~0.3 m/s: ~3 px/s far, ~16
  px/s near.
- Ripples drift east at 6-16 px/s and live 2.6-4.6 s (grow in 30 %, hold, shrink out 30 %).
- Glitter cores live 0.3-0.7 s with rests of 0.1-0.6 s. The duck glides at 7 px/s.
- Nothing new enters in 5.80-6.40: the glitter and ripples are steady fields that keep their pace, and the only pops
  are the ghosts' own.

## 4. Cost and proofs

**Render cost:** frames 150-173 (24 frames), concurrency 1, the default GL, two interleaved passes, the first two
frames of each pass dropped:

| | median ms/frame | mean ms/frame |
|---|---|---|
| WaterStudyBase | 778 | 819 |
| WaterStudyB | 830 | 848 |

That is **+51 ms median, +29 mean (+4-7 %)**, inside the bench's pass-to-pass noise (+-40-80 ms) and the research's
+50 ms budget. Server-side, the whole CandWater tree builds in 5-25 ms.

**Determinism:** frames 60 and 183, rendered in separate processes and in different batches, give identical sha256.

**Only the water changed:** against WaterStudyBase at 1.0, 2.5, 3.8 and 5.0 s, every differing pixel lies inside
y 1071-1285 (the water and the duck); 81-84 k pixels differ.

**Typecheck:** `npx tsc --noEmit -p video` is clean.

**Reproduce** (from `video/`; DIAGNOSIS §3.3 has the rest):
`node scripts/render-frames.mjs WaterStudyB <dir> 1.0,2.5,3.8,5.0 --entry=src/entry-v2r-waterstudy.tsx --concurrency=1`.
For the bench, add `PROFILE=1` and the 24 times 2.5 + k/60, with WaterStudyBase alternating.

**Not run here:**
- `check_light.py`: the study entry passes only `draftLabel`, so its `lightOff` A side cannot be rendered from it.
- `check_banding.py`: the ramp's open stretches are small and mostly under reflections; it uses lib/sky's own dither
  and keys (`skyProblems` []).
- A master clip: disk space, see below.

**Disk.** The disk fell to 90 MB free while two designers rendered, and three renders died with "Page crashed!". Only
my own crashed bundles were deleted. Render at concurrency 1 and check `df` first.

## 5. A shared component, sketched (`src/lib/water.ts` + a thin `<EditorialWater>`)

The engine is already split this way: `candB_lib.ts` is generic, and `candB.tsx` is S1's data. The proposal:

```ts
type WaterSpecB = {
  cam: WaterCam;                                  // {hz, f, eye over the water (m)}: rows, Fresnel, wakes
  clip: string;                                   // the visible water (tucked under its banks)
  ramp: RampSpec;                                 // the shot's lib/sky preset, anchor, compress, mirror(y), body keys
  grid: {dz: number; gap: [number, number]};      // the slice rows (S1: 0.45 m; gap 16 -> 26 %)
  steps: [number, number];                        // the Fresnel rows (y) for every mass's colours
  sway: Sway;                                     // amp far/near, periods, wavelengths (phase toward the viewer)
  groups: {plane: number; masses: Mass[] | ((t: number) => Mass[])}[]; // far to near, each on its thing's plane
  quay?: {band: string; path: string; stubs?: {x: number; y0: number; y1: number; w: number}[]};
  glitter?: Glitter;                              // only when the sun is in frame
  ripples?: Ripples;
  flood?: {origin: [number, number]; radius: (t: number) => number; pale: number; paper: string};
  lod?: 'near' | 'far';                           // far (R14): no slices; flat bands, flecks, current lines
};
<EditorialWater spec={spec} t={t} float={(plane, t) => floatOf(plane, t)} />
```

Helpers a set uses to feed it:
- `reflectTone` and `fresnelSteps` (the colour math, with the never-band guard);
- `rampKeys` (the sky mirrored, compressed and toned);
- `buildMass` (solid, then slices);
- `glitterBed` and `glitterCores`, and `ripplesAt`;
- builders still to lift out of `candB.tsx`: `boatReflection(boatGeom)`, `figureReflection(pose)` and
  `archReflection(bridge)`.

Per site:

| shot | what it feeds |
|---|---|
| **S2** (the receding canal) | The far coping slopes to the vanishing point, so a mass's span comes from R1's affine map (`matrix(1 2s 0 -1 0 2a0)`): one mirror line per x, the masses sheared. The passing boat is a dynamic mass with a wide V (R11: a mover heading into the picture opens 56-71 deg per arm). Two ducks reuse the duck's V. |
| **S3** (her canal + the sliver under our hull) | The canal as S1. The sliver is a steep view: `mirror(y)` low (mostly body), the hull's dark reflection the only mass. |
| **S4 / S8** (`kit/canal/sets.tsx`) | The kit `Water` gives way to the spec. The set's band gives the clip, and her towpath, the boat and the lamps give the masses. In S8 the lamps light at sunset: LIGHT COLUMNS (a `Mass` with a fixed span, 8-14 px wide) under each lamp, and `S8_EVENING` as the ramp's sky. |
| **S5** (the Potomac, April morning, a 23 px far strip) | `lod: 'far'`: no slices; the far shore's reflection as a darker band right under it; the mirrored morning sky (`S5_SKY`, its own gradient); the bridges' arches as bowls; the glitter as single short flecks in a wider, shorter column (sin e 0.34-0.5); 2-4 long tone-on-tone current lines. |

## 6. Open points (for the integrator or the owner)

- **The compression** (3.5x, teal-forward) is a declared art cheat. The exact mirror would make the far half of the
  water warm (it mirrors the horizon) and lose the cool field. The research's §5.6 leaves this for the owner at G4 v6.
- **The duck now glides** at 7 px/s; the kit duck only swayed +-6 px. This is a small change to an approved mover, made
  so its V is true.
- **The glitter is one field** of 2-12 twinkling cores in a still bed. CRAFT §f.6 still says "4-6 twinkling glints,
  20-36 px", so treating the sun's column as one phenomenon (the research's §5.6) needs CRAFT's amendment.
- **The lamp at x 6** (cut by the frame's left edge) reflects as a wavering vertical at the edge.

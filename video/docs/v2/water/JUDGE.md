# Water study: the judge's verdict on candidates A and B (S1, 2026-10-28)

**The brief** is the owner on v5's water (`deliverables/v2/v2r_G4_look_v5.mp4`): "I don't like the water too much, leafs
are great" ... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean
that about the water." **Rank:** a study note. The owner's words (the playbook's DEPTH AND SEPARATION water rule, the v2
OWNER_NOTES) outrank it, then `docs/look/DIRECTION.md`, then `docs/look/CRAFT.md`. Inputs: `DIAGNOSIS.md`, `cand_A.md`,
`cand_B.md`, the research `docs/look/research/2026-10-28_water.md` (R1-R14).

## Verdict
- **Winner: A ("true reflection"), as the BASE of the one shared water.** It keeps the approved look: the canal stays the
  frame's one cool field. It reads as water at a glance. Every reflection is derived from the set's own geometry and the
  pen's own colours, so it is the right engine for S2-S8 and S5.
- **Not shippable as it stands** (A or B). A is not CLEAN at 1:1: every reflection's sides are 1-3 px stair-steps, about
  30 thin light dashes are scattered over the water, and the glitter column is faint. B is clean but loud and off the
  approved palette: a rose field across the far canal, regular stripes, and too many glints for CRAFT §f.6.
- **The water that ships** is A with B's drawing language grafted in, then the six must-fixes below. After that it goes
  to the owner as the G4 look clip v6.

## How it was judged
- **What was rendered:** A at `09eb906` and B at `c48eb2d`, both still the latest commits of their files. A's own
  `final/` stills predate its last edit, so A was re-rendered.
  - Frames 0, 3, 6, 9, 12, 60, 150, 228, 300, 345, 360 and 367 of WaterStudyBase, WaterStudyA and WaterStudyB.
  - The 60 consecutive frames 150-209 (1 s) of each, and the light-off pair at 150 and 300.
  - The v5 frames 60 / 150 / 228 / 300 come from the look clip itself.
  - WaterStudyBase's f150 and f300 have the same sha256 as DIAGNOSIS §4, so the base is v5 byte for byte.
- **How it was looked at:** at 360 px wide (the phone test), at 720 px wide (what a phone at arm's length resolves), at
  1:1, at 2x on details (the arch, the glitter, the gold column, the boats), the frame-0 draw-in, a motion heat map
  over 1 s, and consecutive 1:1 frames.
- **How it was measured:** `judge_metrics.py` (in this folder; its docstring has the commands) for colour, edges, marks,
  glitter, Pip's separation and motion; `scripts/qa/check_light.py`; the per-frame times of the renders.

## Scores (0-10)
| criterion | v5 | A | B | why |
|---|---|---|---|---|
| CLEAN at 1:1 | 3 | 5 | **8** | B: smooth solid blocks, then tapered bars, one grid. A: every row's piece ends are square-cut and offset (a 1-3 px zigzag on every side), and ~80 gap lenses leave scattered light lines. |
| CLEAN at 360 px | 3 | 7 | 7 | At phone size A's zigzag disappears and B's stripes stay crisp. |
| PREMIUM at 1:1 | 1 | 6 | **7** | B looks designed (a print's bars and nested lenses). A looks like a reflection made by a procedure. |
| PREMIUM at 360 px | 2 | **7** | 6 | A: a calm, glassy canal with mirrored silhouettes and a gold door column. B: the far half is a pink striped band that reads as more brick. |
| REFINED at 1:1 | 1 | 5 | **7** | A has too many small fragments. B has fewer, better shapes. |
| REFINED at 360 px | 2 | **7** | 6 | A is gentle (teal on teal). B is loud (rose bars against light gaps, a gold ladder over the rose). |
| *the owner's words, mean* | *2.0* | *6.2* | ***6.8*** | |
| reads as water at a glance | 4 | **8** | 6 | A's canal is 84-89 % cool and B's 42-45 %: B's far half reads as pink, not water. |
| reflections logical under the one camera | 1 | **9** | 8 | Both mirror each thing about its own waterline. A has everything, derived from S1's geometry (the doors sliding, the bus, the tower, the roofs, the coping). B has the main masses, but its sky ramp is compressed 3.5x (a declared cheat). |
| sits in the approved look | 6 | **8** | 5 | A keeps the cool field, the duck's approved sway and CRAFT's glint count. B halves the cool field under the sky (4.9 % of the world vs v5's 8.4 %), makes the duck glide, runs 2-12 glints and makes the bridge's reflection the leaves' own hue and value (DIAGNOSIS §2.10 warns against exactly that). |
| motion calm and alive | 2 | 7 | **8** | B's breaks are static, so only the sway moves. A's ends breathe and its gaps regrow, so it toggles twice as often (table below). Both are calm. |
| render cost | 10 | 9 | 9 | Both cost what v5 costs (table below). It is a gate, not in the mean. |
| one shared component | 2 | **8** | 6 | A: a generic polygon slicer and ONE tone rule per water (no tuning per source), its sources and colours computed from the set. B: a good builder, but S1 is hand-placed rects (the wing 326-796, WING_TOP 1096) and hand-sampled hexes with a k triple tuned per source, so each lane would need art direction. |
| **overall** (the owner's words 50 %, the rest 50 %, cost out) | **2.5** | **7.1** | **6.7** | |

**Read the split, not only the total:**
- B wins the owner's three words at 1:1. Its drawing language is the better one, and it is the main graft.
- A wins everything a water must keep in this film, and it is the better base.
- Fixed the same way, both converge on one water: B's shapes on A's colour, geometry and engine. A starts nearer to it
  where the fixes are expensive: the derived sources, one tone rule, the palette.

## Measurements (S1 at 1.0 / 2.5 / 3.8 / 5.0 s; motion over 2.50-3.48 s)
| | v5 | A | B |
|---|---|---|---|
| water cool % (h 150-250, C* > 4) | 85-88 | 84-89 | 42-45 |
| water warm % | 10-14 | 8-14 | 43-45 |
| the world under the sky (y >= 950) cool % | 8.2-8.4 | 8.3-8.8 | 4.9-5.0 |
| dx edges per 1000 water px (piece ends, stair-steps) | 18-30 | 81-111 | 58-84 |
| dy edges per 1000 water px (stripes, slice gaps) | 119-145 | 194-215 | 259-283 |
| thin light marks per frame (dash-like) | 5-13 (stars, the V) | 27-32 | 33-36 |
| glitter gold px (x 130-270, y 1080-1180) | (beige cards, not gold) | 128-354 | 970-1104 |
| Pip dE to the water round him (median) | 27-32 | 28 | 29-33 |
| px changing > 3 L* per frame | 0.33 % | 0.95 % | 0.61 % |
| px with a quick toggle (reversed within 0.1 s) | 0.60 % | 1.46 % | 0.65 % |
| check_light A/B at 2.5 / 5.0 s (`--sky '#BCDCCF' --exclude 0,0,1080,950`) | centre (496, 1396) / (524, 1431); greyed 230 / 281 px | same centre +-2 px; greyed 209 / 201 | same centre +-2 px; greyed 201 / 188 |
| render ms/frame (60 frames, concurrency 2, median) | 835 | 838 | 790 |
| f150 in two processes | identical | identical | identical |

**Reading the light check:** with these flags, v5 and both candidates have the same verdict. The brightest 5 % sits on
the near paving, 0.155-0.174 H from the subject box, which is v5's own state. Neither water moves it or adds greyed
pixels.

**Also checked, equal for both:**
- The frame-0 draw-in: pale at f0-f3, the flood crosses at f6-f12.
- The bend: water up to the bent coping, so the sky wedge is gone.
- Nothing new is born in 5.80-6.40 s, read in the code (steady fields keep their pace). A's duck rings start at 0.45 +
  3.4 k s, and the last ghost reflection pops at 5.16 s.
- Pip parts from the water (dE 28-33).

## Why A wins, why it does not ship yet, and what B does better
- **A's strengths:**
  - **The colour logic suits this film.** The rule is "hue from the water, value from the world, light keeps its
    colour", so the canal stays the frame's one cool field holding the warm world (DIRECTION rule 6; DIAGNOSIS "what
    v5 gets right").
  - **It cannot turn khaki, beige or tan.** Every warm source is toned in CIE LCh to the water's hue.
  - **It reads as water, gently.** At 360-720 px it is the more convincing water: glassy, calm, with the row hanging
    upside down under the row and the door's gold column under the door. That is the owner's "gentle, premium" at
    phone size.
- **A's defects are in the drawing, not the design:**
  - The square per-row erosion (`RAGGED.small` 1.5-3.5 px) and the per-row static jitter (`SWAY.jitter` 0.12) cut a
    zigzag into every side.
  - About 80 gap lenses scatter thin light lines over the water, which is the "scattered dashes" tell in a new form.
  - The glitter bed breathes down to nothing, so the column is faint: a third or less of B's gold.
- **B's strengths:**
  - **It is the better draughtsman.** Each mass is one smooth block whose sides wave, then tapered bars on one grid,
    with static breaks.
  - **The glitter is nested lenses you can see.**
  - **The motion is calm by construction.**
- **B's cost:**
  - **The palette.** It keeps the source's hue at full strength in the far step (k -0.08 / -0.10: the wing's and the
    bridge's reflections are as rich as the brick). The far canal becomes a rose field, its light gaps make stripes,
    and the near third is the only cool water left.
- **The colour identity is still the owner's call** (research §5.6). The look clip v6 should show the cool canal (the
  approved palette). B's warm memory stays a documented knob (graft G8), shown only if the owner asks for a warmer
  canal.
- **Two rules clash here.** DIAGNOSIS tell 4 and research R4 say a reflection keeps its own hue family. DIRECTION rule
  6 ("a warm world held by one cool field") outranks both, so A's rule is the default, and G8 is the owner's knob.

## Grafts from B (specific, in `src/v2r/water_study/candB_lib.ts` / `candB.tsx`)
1. **G1, the mass builder (`buildMass`, `barPath`, `sliceGrid`, `snapRow`).**
   - Each reflection starts as ONE solid, smooth-sided block from its waterline. Its sides are sampled every 4 px with
     the sway and joined by a Catmull-Rom curve.
   - Below the block come level bars with tapered ends, on ONE shared perspective grid (gap 16 -> 26 % of the pitch).
   - Breaks are static and seeded per band: at most one per band, and only in the last half. A smooth envelope narrows
     the bars, and the last bar may drop.
   - Feed it A's derived polygons through a span adapter (a polygon's x-extent at each band's middle y), so A keeps its
     geometry and gains B's shapes.
2. **G2, the glitter (`glitterBed`, `glitterCores`).**
   - The bed: one still gold lens per band. Their lengths follow the column's envelope, densest at the sun's mirror
     point (y 1158).
   - The cores: warm-white slivers nested inside the bed lenses, each growing in and shrinking out along its length.
   - Capped to CRAFT §f.6: 4-6 alive, 20-36 px. The research's 12-24 needs CRAFT's amendment first (research §5.6).
3. **G3, the ripple lines (`ripplesAt`).**
   - 6-11 long, level, tapered lines in two tones: the crest +0.045 and the trough -0.05 OKLab L on the water's own row
     colour.
   - They drift east at 6-16 px/s (the leaves' westerly) and keep clear of the glitter column and Pip's seat.
   - They replace A's open-water gap lenses.
4. **G4, the colour guard.** `neverBand` / `cleanColour` run on every computed tone, and a palette QA hook
   (`CAND_B_PALETTE`) lists every colour with its L* / C* / h. Both become lib/water's `waterProblems`.
5. **G5, the duck's contact.**
   - A thin dark contact lens at its waterline, and the underside mirrored as 2-3 tapered bars.
   - The duck keeps the kit's approved sway: no glide and no V. A's single faint ring may stay.
6. **G6, the quay.** Dome-capped bollard stubs (`stubPath`), and the coping's face as one crisp, cool band under the far
   towpath's strip.
7. **G7, the arch's read.** The voussoir ring and the cool soffit bowl close the ellipse with a clear step. A's bowl sits
   ~4 L* under its ring; give it >= 6 L*, so the bridge reads at phone size.
8. **G8, a knob for the owner (off by default).**
   - What it is: B's warm memory. The far Fresnel step keeps a warm mass's hue family at low chroma (C* <= 12), turning
     through mauve (`fresnelSteps`' turn), never through khaki.
   - When it is on: only if the owner asks for a warmer canal, and only while the water stays >= 80 % cool.

## A's must-fixes (6, each measured by `judge_metrics.py` unless it says otherwise)
1. **Clean shapes, no stair-steps (G1).**
   - **The change:** every reflection is one smooth closed shape from its waterline down to >= 55 % of its length, then
     bars with tapered or round ends; no end is ever cut square. Set `RAGGED` off, `SWAY.jitter` to 0, and no end
     breathes.
   - **The target:** dx edges at most B's at each frame: f60 <= 59, f150 <= 65, f228 <= 76, f300 <= 84 per 1000 water
     px (A is now 81 / 93 / 109 / 111).
   - **The eye check:** at 2x on the gold column (x 520-720, y 1110-1210, f150), its sides are smooth curves.
2. **No scattered dashes (G3).**
   - **The change:** gap lenses only in a reflection's slice zone (below its solid block), <= 24 alive (now ~80), each
     >= 40 px long. The open water carries only R9's ripple lines: 6-14 alive, 40-150 px long, tapered, in two tones.
   - **The targets:**
     - The engine's own counts on every frame of f18-367.
     - Marks <= 24 per frame at f60 / 150 / 228 / 300 (A is now 27-32, B 33-36).
3. **A glitter column you see at phone size (G2).**
   - **The change:**
     - The bed is still: one lens per band (12 lenses, 21-56 x 3-6.5 px). It is densest at y 1158 and sways with its
       rows, never breathing down to nothing.
     - The slivers nest in it: 4-6 alive, 20-36 px, from 0.30 s.
   - **The targets:**
     - Glitter gold px >= 900 at each of f60 / 150 / 228 / 300 (A is now 128-354, B 970-1104).
     - `particleProblems` clean, and S1's fields <= 16 alive.
4. **Calm motion.**
   - **The change:** only the travelling sway (as now), the ripple drift and the slivers move. The breaks are static
     and seeded per band, and nothing regrows in a new place.
   - **The targets:**
     - With `--motion 150-209`: quick toggles <= 0.8 % (A is now 1.46 %, B 0.65 %, v5 0.60 %).
     - Pixels changing per frame <= 0.7 % (A is now 0.95 %).
     - Nothing is born in 5.80-6.40 s except the steady fields at their pace.
5. **Keep what A gets right while changing the drawing (a regression guard).**
   - **Colour:**
     - The water >= 83 % cool and <= 15 % warm (now 84-89 / 8-14).
     - The world under the sky >= 8 % cool (now 8.3-8.8).
     - No tone in the beige, olive or grey bands (`waterProblems`).
   - **Separation:** Pip dE >= 25 (now 28).
   - **Light:** `check_light.py` matches WaterStudyBase with the flags above (the centre within 5 px, greyed px no more
     than v5's).
   - **Cost and determinism:** at most +50 ms per frame against WaterStudyBase, and the same sha256 for f150 in two
     processes.
   - **The bend:** the water still reaches the bent coping.
6. **Make it the ONE component.**
   - **The change:**
     - Promote `candA_core.ts` and the grafted builders (the mass, the glitter bed, the ripples) into
       `src/lib/water.ts(x)`, with cand_A.md §6's `WaterSpec`.
     - The sources are polygons mirrored about their own waterlines, derived from the set's geometry and the pen's
       colours.
     - `lod: 'far'` serves S5's 23 px strip: no slices, 2-3 bands, 2-6 px flecks.
     - An affine mirror serves S2's sloped quay.
     - S1's spec becomes data, guarded by `waterProblems(spec)`.
   - **The targets:**
     - `npx tsc --noEmit -p video` is clean.
     - S1 through lib/water is byte-identical to the fixed study frame (sha256 at f150 and f300).
     - A far-LOD sample spec renders with no slice row under 2 px.

## Files
- **Measures:** `judge_metrics.py` (this folder).
- **The candidates:** `cand_A.md`, `cand_B.md`, their sheets, `src/v2r/water_study/candA*.ts(x)`, `candB*.ts(x)`.
- **The judge's renders** were scratch on the RAM disk and are not kept. To reproduce them (from `video/`, one folder
  per composition; render-frames takes seconds and writes `f00150.png` ...):
  ```sh
  E=--entry=src/entry-v2r-waterstudy.tsx
  for C in Base A B; do node scripts/render-frames.mjs WaterStudy$C /tmp/ws$C 1.0,2.5,3.8,5.0 $E --concurrency=2; done
  python3 -I docs/v2/water/judge_metrics.py --dirs v5=/tmp/wsBase,A=/tmp/wsA,B=/tmp/wsB --frames 60,150,228,300
  T=$(python3 -c "print(','.join(f'{f/60:.5f}' for f in range(150,210)))")
  for C in Base A; do node scripts/render-frames.mjs WaterStudy$C /tmp/m$C $T $E --concurrency=2; done
  python3 -I docs/v2/water/judge_metrics.py --dirs v5=/tmp/mBase,A=/tmp/mA --motion 150-209
  ```
- **The light check's A side:** the same frames with `--props='{"lightOff":true}'` (lib/light reads it from any
  composition's input props). Then run `scripts/qa/check_light.py off.png on.png --sky '#BCDCCF' --exclude
  0,0,1080,950 --subject 520,920,700,1100` (at 5.0 s: `--subject 440,920,700,1100`).

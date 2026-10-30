# LIGHT AND TEXTURE PROOF: proper light, one paper, one colour key on v6 (stills, 2026-10-30)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "I mean dark
and contrast are great but that's very doable that's just color palette and selection? Similarly point 2 [one colour
key] / I noticed this too the light source yes - can we do the proper lights? ... 9 [an overall texture] that seems
solvable too?"; and "Again let's start with stills", "No video yet". The rules this answers: the playbook's PROPER
LIGHT (one story light, real falloff, rims on what it touches, a soft glow at the source, pools and shadows that follow
it; darks, contrast and ONE COLOUR KEY as palette work) and its Texture bullet (VERY subtle paper and paint).

**What this is.** An iteration (stills only): v6's scene 1 at its still (1.0 s, "She quit Google."), re-rendered BY THE
ENGINE three ways: v6; v6 with the light planned in `light.md` §5; and that plus one paper grain and one colour key.
**Rank:** research notes (DIRECTION's ladder); nothing here is a rule until the owner picks from it. No reference is
copied, traced or used as an input (refs 02 and 03 are shown beside the stills, never fed to anything); no living artist
is a style target. Paths are from `video/`.

| File | What |
|---|---|
| `docs/look/organic/light_proof.png` | the sheet: the three stills at full size, then at 400 px beside refs 03 and 02 (400 px wide), three numbers under each |
| `docs/look/organic/light_proof.md` | this report |
| `src/look/light_s1/` | the proof's scene: `entry.tsx` (composition `LightS1`, props `look: 'v6' \| 'light' \| 'full'`), `LightS1.tsx`, the three composers copied from paint_s1 with light slots (`LightV2S1.tsx`, `LightS1World.tsx`, `LightS1Steps.tsx`), `context.tsx` (segments and slots), `movers.tsx` (her and Pip's live light), `rig.ts` (the light plan as data), `maps.ts` + `maps/{light,full}/*.lmap.png` (the bake's output, generated) |
| `src/look/light_s1/bake/` | `run.sh` (the whole proof), `render_many.mjs` (many renders, one bundle, one browser), `bake_light_s1.py` (the bake: `common.py`, `labels.py`, `light.py`, `key.py`, `texture.py`, `solve.py`), `measure.py` (§4's numbers), `sheet.py` |
| `src/lib/light2/` | the reusable engine pieces: `LightMap` / `LightMaps` (a baked map in its plane's group, with its blend), `RimOf`, `WrapOf`, `ShadeOf`, `ShadowCut`, `GrainOn` (live light on a mover, from its own drawing) |

No shared code was changed: `src/lib/*` defaults, `src/look/paint_s1` and `lib/light` are imported as they are.

## 0. Bottom line

- **Proper light works in the engine, and it reads at phone width.** In still 2 the lit doorway is the one place to look:
  the lobby a step up and warmer, a bloom at its frame, light on the jambs, its pool on the towpath (+10 L*, cos^3
  falloff, her shadows from the lobby's lamps cut out of it, live), its column in the canal (+7 L*); her backlit, with a
  gold rim from the sun on her front and the opening's light wrapped round her edge. The low October sun is the key: a
  soft glow at the disc (+2.2 L* and warmer within 70 px, a wide warm haze along the horizon), gold rims on what rises
  into it (the far roofline, the tower's sun side, the bridge, the wing's parapet, planting and west corner, the lamp
  heads, our coping), the sunlit gap of the far towpath (+10 L*, gold) falling off into the far roofs' shadow. The
  shade masses carry it: the backlit facade in rose-plum (68 -> 56 L*), our bank under a canopy off-screen left, one
  leafy-edged mass (56 -> 39) with a sunlit strip along the water.
- **The composition check moves with it** (`composition.md` §6, captions out): v6 9 WARNs -> 5; R4 (the strongest
  call on the subject, in value AND colour) fails on v6 (colour #2: the yellow panes) and passes with the light; R10 (a
  real dark mass) goes from 16 % at L* 45 in pieces to 38 % at L* 36, 97 % of it in two masses; three masses hold 82
  -> 89 % of the frame. What still fails (R2 pieces, R3 calls, R5 quiet) is the props: the composition lane's job.
- **One colour key, as palette work** (still 3): one function of the colour turns everything outside the dusk family's
  hue arc (violet .. rose .. gold) toward it, glazes every colour below the sky toward the family at its own value,
  calms every light but one (the lit panes to a quiet warm cream: C* 41 -> 19) and makes the doorway's gold the one hot
  accent (C* 41 -> 56). Off-family colour below the caption band: 16 % of the coloured pixels in v6 -> 2.5 %. The 1 %
  most saturated warm light: in v6 the yellow upper panes (24 % of it at the door), with the light and the key 100 % at
  the door. Colour rivals in the composition check: 4 -> 1. The keyed palette (§3.3) is the table production applies
  at the source (0 ms).
- **One paper over the whole frame** (still 3): a fine tooth + a little fibre + a gentle mottle, soft-light round mid-grey,
  the same material on every plane (baked into its maps, so it rides the plane's float) and on her and Pip (a tile
  locked to them). +0.4-0.8 L* std on the flats at full size, faint at 400 px; the caption band at 12 % (its ground's
  spread 1.27 L*, within CRAFT's 1.5; the ink's contrast unchanged, 68.9 L*). It takes the dead-flat area from 39 % to
  22.5 % (the references 0-20 %, `techniques.md` §1).
- **Exact and deterministic.** Each plane's maps are solved against the exact composite under them, so the engine lands
  on the bake within 0.08 L* (light) / 0.10 L* (full) on average, p99 0.4 (98 % of the frame; the movers' live layers and
  the pool's live cut are not baked). Still 1 is v6 pixel for pixel (md5 `7d35cccc...`); the bake and the renders give
  the same bytes on every run.
- **Cost:** the bake ~66 s on one core (+ 54 parts renders in ~1 min); 2.2 MB of maps (light) / 4.0 MB (full); the frame
  555 ms (v6) -> 730 ms (light) -> 775-820 ms (full) at concurrency 1. Production cuts it (§5): v6's own lib/light
  layers are ~340 ms of its frame (`light.md` §7), the key goes into the palette (0 ms), the grain into the painted
  pieces and the plane's one multiply map.
- **The biggest weak spot is motion, not the still** (§7.1): the maps are baked for one state of the scene; by 1.10 s
  the glass doors have slid shut and the fascia's letters have popped on, so the 1.0 s maps no longer match what is
  under them (a green cast on the shut glass, seen in the cost bench's frames). A film bakes one set per state and mixes
  them by their cause (`light.md` §4.10), and draws what changes as a mover over the maps.

## 1. The three stills (`light_proof.png`)

| | 1. v6 | 2. + proper light | 3. + paper + colour key |
|---|---|---|---|
| What changes | nothing (PaintS1 set `v6`, pixel-identical) | the dusk rig (no day casts), 9 slots of baked maps, the door's pool, her and Pip's live light | the same maps re-solved with the key and the grain folded in; the grain live on her and Pip |
| Darks (L* < 40) / median L* | 6.7 % / 66.9 | 33.1 % / 62.0 | 38.2 % / 60.7 |
| Facade / lobby / our bank (L*) | 68 / 77 / 56 | 56 / 82 / 39 | 54 / 80 / 34 |

## 2. The method, in the engine

### 2.1 The scene, cut into segments and slots
`src/look/light_s1` renders v6's scene 1 through COPIES of its three top-level composers (`V2S1.tsx`,
`V2S1_set.tsx`'s S1World, `V2S1_steps.tsx`'s S1Steps; ~340 lines with their comments), every leaf part imported unchanged from `paint_s1`.
The copies add two things: each part is a named **segment** (26; the wing's fin shades draw only in look v6: the sky,
the clouds, the spray, the west gap, the water, the far towpath, the wing, the door leaves, the lamps, her, the boats,
our bank, the near things, Pip, the particles, ...), and each plane gets a **slot** inside its own float group, right after what it lights (10 slots: sky,
spray, far roofs +4, tower +3, bridge +2, water -0.5, subject 0, boats -0.55, bank -1, near -2). A slot draws that plane's
maps with lib/light2's `LightMaps`, so they ride the plane's float like its shapes (`light.md` §4.2, §4.10). With look
`v6` no slot draws and the render is `paint_still_v6.png` byte for byte (checked).
The dusk rig (looks `light`, `full`): v6's rig with a white cast tint (v6's day casts of a sun at 36 deg go: `light.md`
§6.3 weak spot 1) and without the wing's fin shades (the facade is backlit: its shade is the subject's map); contact
shadows and form shades stay.

### 2.2 The bake (`bake/bake_light_s1.py`; numpy + OpenCV)
1. **Parts renders** (`render_many.mjs`, ~1 min): every segment alone on a black and on a white slab (54 renders, one
   bundle, one browser), and the static base (everything but the movers). The two slabs give each segment's exact
   coverage (the two-background matte).
2. **Carriers**: each pixel's light is carried by the LAST slot whose segments touch it; nothing static is drawn over
   it after that slot, so the composite under that slot's maps is exactly the static base render.
3. **Labels** (`labels.py`): what surface each pixel is (22: sky, cloud, far roofs, tower, bridge, water, towpath, lamps,
   boats, bank, near, and in the wing the lobby, the door frame, the lit panes, W, the glass, the planting, the sign,
   the wall), from the segments' coverage and, inside the wing, the flat colours and the door frame found in the render.
4. **The light** (`light.py`), in linear light on the static base: out = base x E + G (§3.1).
5. **The key and the paper** (look `full`: `key.py`, `texture.py`), on the lit picture (§3.2, §3.3).
6. **The solve** (`solve.py`): per slot ONE multiply map (where the target is darker: M = T / B, quantised down) and ONE
   screen map solved against it (S = 1 - (1 - T) / (1 - B M)), in the browser's own sRGB values, identity everywhere the
   slot does not carry, each cropped to the box where it changes anything; the target gets a seeded +-0.5-code dither
   where the light changes it (no bands). This is `light.md` §4.11's solved map made exact for every plane: the pair can
   reach any colour, so the same two maps carry the light, the key and the grain. The pool is one more screen map,
   solved over the subject's result, drawn in a group that her shadows cut (live).
7. `maps.ts` (generated) imports the PNGs; Remotion's webpack bundles them as asset URLs.

**Exactness** (the engine's render against the bake's target, captions off, the movers and the pool's cut left out:
98.1 % of the frame): look light |dL*| mean 0.082, p99 0.39, max 3.5, 0.0003 % of pixels over 2; look full 0.100, p99
0.41, max 4.9 (`light.md` measured 1.14 for naive maps and 0.48 for its solved maps).

### 2.3 Light on the movers (`movers.tsx`, lib/light2 `live.tsx`)
Her and Pip are drawn by paint_s1's own components; their light is computed every frame from that same drawing (it
follows every pose with no keys, `light.md` §4.0 home 3):
- **her**: `ShadeOf` (backlit: a violet multiply, #A99DD2 at 0.92), `RimOf` toward the sun's image (gold, 1.7 px + a
  softer 3.4 px band at 0.4, opacity 0.62: n . l by construction: the silhouette minus a copy moved away from the light),
  `WrapOf` (the lit opening blurred, baked, on her 1.3 px edge band, 0.3), a 1.1 px rim from the lobby's lamps, and
  `ShadowCut`: her drawing projected by each of the lobby's three lamps (a homography onto the towpath, fitted affine
  over her lower half) cut out of the door's pool, each removing half its lamp's light, 1.8 px penumbra;
- **Pip**: shade + a 1.6 px sun rim (tier B);
- in look `full`, `GrainOn`: the paper tile locked to each (it walks with her, never slides over her).
Her bands are scaled to her (153 px tall, limbs ~6 px wide): `light.md` §4.3's 4-6 px is for a figure twice her size;
at 4 px the first try washed her whole legs cream.

## 3. The design

### 3.1 The light as built (doses in `light.py` DOSE; `light.md` §5's plan)
| Layer | Home | Dose (`light.md` spec) | Measured (L*, v6 -> light) |
|---|---|---|---|
| Backlit facade: shade toward rose-plum #C79AB4 (warm surfaces) / violet #A49BD6 (cool), deeper toward the ground | subject map | 0.88 (0.52) | wall 68 -> 56, glass 63 -> 51 |
| The lit panes a step under the story light | subject map | x0.72 | 73 -> 66 |
| The lobby lifted toward its hot core #FFD08A; its three lamps; its bloom 2.5 / 8 / 22 px + a 55 px halo outside the frame | subject map | lift 0.42 | 77 -> 82 (the lobby with its furniture) |
| The jambs and the surround next to the opening lit (5 px falloff) | subject map | 0.9 | (the weak spot 4 of `light.md` §6.3, now done) |
| The pool: the opening projected forward (1.45x by the coping), cos^3, sides 3 -> 12 px; her shadows cut out | own layer, live cut | 1.6 | 83 -> 93 |
| The far towpath in the far roofs' shadow, the west gap's stretch sunlit, gold | subject map | 0.66 (0.36) | shade 77 -> 66, gap 77 -> 88 |
| Lamp posts in the shadow, the unlit lanterns toned down | subject map | 0.72-0.92 of the facade's | |
| The sun: its bloom (4 / 14 / 80x40 / 230x105 px), a warm haze round it, the disc lifted | sky + far maps | 0.7 | by the disc 88.9 -> 91.1 |
| The in-scatter veil over the far city by the sun; the far fronts backlit | far maps | 0.10 / 0.6 | bridge 81 -> 72 |
| Gold rims by tier, n . l toward the sun's image (far 1.8 px, C tier 1.6-2.6 px, our coping 3 px where sunlit) | each plane's map | `light.md` §4.3 | over their own (shaded) surface: the far roofline +4-6 L*, the wing's parapet, planting and west corner +10, the lamp heads +14, our coping's sunlit edge +31 |
| The door's column in the canal (+ a bloom), the sun's glitter | water map | | column 70 -> 77 |
| Boats backlit | boats map | 0.55 | 63 -> 53 |
| Our bank and its things under a canopy off-screen left: a leafy edge (clumps of three sizes, penumbra 10-24 px), 4 soft gaps of light at the edge, two small clusters of sun flecks, the sunlit strip along the water; open-sky shade (toward violet) | bank + near maps | 1.0 (0.80) | bank 56 -> 39, near 55 -> 36 |
| Her, Pip | live | §2.3 | her 44 -> 39 |
Every shade mass has a named caster and every light a named source. The caption band's sky (y 290-585, above the
wing's roofline): 0 codes changed in look light, at most 2 in look full (the paper at 12 %); its ground's spread 1.29 L*
in v6 and light, 1.27 in full. (The wing's own roof edge reaches the band's last rows, y 589-600, as it does in v6.)

### 3.2 One paper (`texture.py`)
One material, three scales: a fine tooth (1-2 px, the grain at full size), a little fibre (2 x 1 px along -24 deg:
never a streak; a first try at 4 x 1 px read as brushed linen, "an even streaky texture", and was cut), a gentle
mottle (40-90 px). Soft-light round mid-grey (a lift and a darkening of equal weight, strongest in the mid-tones: the
darks keep their depth, the lights never grey), ~0.9 L* std on a mid-tone, 12 % in the caption band. Measured added
std (high-pass, the flattest 41 px window of each surface): the sky above the band +0.38 L*, the facade +0.66, our bank
+0.84, the water +0.15 (its painted marks dominate). On the static planes it is folded into each slot's maps (it rides
the plane's float: never screen-fixed, never re-seeded); on her and Pip a 256 px tile of the same material, locked to
them.

### 3.3 One colour key (`key.py`): the palette, as a function
The family is the sky's own (the sky and clouds are its SOURCE and keep their hue; only the zenith goes a step deeper,
-5 L* at the top, 0 by y 250, well above the band): violet shade -> rose-plum -> rose -> peach -> cream-gold light.
- hues outside the arc (88-282 deg: greens, teals, blues, mints) turn 62 % toward the nearer end (gold at 85 deg,
  violet at 285) and lose chroma with the turn; in-family hues get 12 % more chroma (strong, never greyed);
- a 24 % glaze toward the family's colour at the pixel's own value (dusk's split: warm lights, violet darks);
- every light but one calms: the lit panes to 42 % chroma and -5 L*, the near maple leaves to 70 %; the door's light
  (the lobby, its bloom, its pool, its column) gets 1.28x chroma toward gold: the ONE hot accent;
- the darks below the band a step deeper (-8 L* at L* <= 25, none above 65).

The keyed palette (v6's dominant colours by surface, before -> after; the table a film's palette takes at the source):

| Surface | v6 | keyed | L* / C* / h |
|---|---|---|---|
| facade panel (terracotta) | #E4AC94 | #E5AC93 | 74.9 / 27 -> 28 / 50 (in family) |
| facade pier (cream) | #ECE4D4 | #F1E3CE | 90.8 / 9 -> 12 / 90 -> 83 |
| glass (teal) | #8CACAC | #A6A5AC | 68.1 / 11 -> 4 / 198 -> 297 (slate-violet) |
| lit pane (yellow) | #F4CC84 | #D9C0A1 | 84 -> 79 / 41 -> 19 / 83 -> 77 (a quiet warm cream) |
| the lobby's lower wall (the same yellow) | #F4CC84 | #FFC767 | 84 / 41 -> 56 / 80 (the hot accent) |
| the lobby's back wall | #FCE4C4 | #FFE2B6 | 92 -> 91 / 19 -> 26 |
| W (plum-dark pane) | #442C44 | #321A36 | 22 -> 14 / 19 -> 22 |
| roof planting, boat cabin (sage) | #B4C4AC | #CABEA8 | 77 / 14 -> 13 / 134 -> 87 |
| lamp post (grey-blue) | #9CA4B4 | #A8A1AC | 67 / 9 -> 6 / 273 -> 314 |
| lantern glass (mint) | #CCDCDC | #DCD8D5 | 87 / 6 -> 2 |
| hull (slate) | #344C5C | #35374B | 31 -> 24 / 13 -> 14 / 250 -> 290 |
| water (lavender) | #9C9CC4 | #A69ABB | 66 / 22 -> 19 / 292 -> 305 |
| our paving (terracotta) | #AC7C6C | #AA796E | 56 -> 55 / 23 / 44 -> 37 |
| near crate (brown) | #9C644C | #935C4D | 48 -> 45 / 30 -> 28 |
| maple leaves (orange) | #DCAC74 | #D6AD88 | 74 / 37 -> 26 |
Her teal coat is not keyed (the subject keeps her colour; against the gold door it is the complementary pair).
In production the key is palette work: these values go into the palette roles and the painted pieces' palettes at the
source (0 ms per frame); this proof applies the same function per pixel because v6's colours live in many modules and
baked PNGs that no one place can swap without editing shared code.

## 4. The numbers (`measure.py` on the engine's renders, captions off unless said)

| | v6 | light | full |
|---|---|---|---|
| Darks (L* < 40) | 6.7 % | 33.1 % | 38.2 % |
| Median L* / p2-p98 | 66.9 / 28.6-90.2 | 62.0 / 20.3-91.4 | 60.7 / 12.8-90.9 |
| The brightest 5 % below the sky (far planes out) within 0.1 H of her | 36 % | 58.5 % | 58.5 % |
| The 1 % most saturated warm light (L* > 60) at the door | 24 % (the yellow panes) | 100 % | 100 % |
| Off-family colour below the band (% of the coloured pixels) | 16.3 % | 10.9 % | 2.5 % |
| Band ground: L* / p2-p98 spread (x 150-800, y 317-556) | 81.9 / 1.29 | 81.9 / 1.29 | 81.9 / 1.27 |
| The words' contrast (captions on) | 68.9 | 68.9 | 68.9 |
| Paper: added std on the flats (sky / facade / bank) | - | - | +0.38 / +0.66 / +0.84 L* |
| `techniques.md` §1: crisp edges / straight runs / dead-flat area | 20.4 / 29.3 / 39.3 % | 18.5 / 22.3 / 39.7 % | 11.2 / 21.1 / 22.5 % |
| `composition.md` §6 check: WARNs; R4 value / colour; R10 dark group | 9; #1 / #2; 16 % at L* 45 (64 % in 2) | 5; #1 / #1; 38 % at L* 36 (97 %) | 5; #1 / #1; 38 % at L* 30 (94 %) |
| Calls (rivals) value / colour; masses; pieces | 10 (3) / 11 (4); 82 % in 3; 32 | 12 (3) / 10 (5); 89 %; 27 | 10 (4) / 10 (1); 89 %; 22 |
The `techniques.md` numbers are its `--measure` method re-implemented in `measure.py` at its thresholds, on our
captions-off renders (so v6 reads 20 / 29 / 39 here against its 22 / 26.5 / 35 on the captioned still): compare within
this table. The paper lowers the dead-flat share by construction and part of the crisp-edge share (grain along an
edge widens its measured step); the shapes themselves are the organic lane's.

## 5. Cost
- **Bake** (one core, the shared box): the parts renders 54 x ~1.1 s in one browser; reading and labelling 7.9 s, the
  light 6.6 s, each look's solve and PNGs 13.6 s (light) / 14.9 s (full); ~66 s in all. Maps: 18 + the pool + the door
  blur, 2.19 MB (light); 20 + pool + door blur + the grain tile, 4.04 MB (full).
- **Render** (`render_many.mjs`, 30 frames 1.0-1.48 s, concurrency 1, GL angle, two runs, load 2.0-2.5):

| Look | ms per frame | vs v6 |
|---|---|---|
| v6 | 555, 552 | - |
| light (9 slots: 18 cropped maps, 5.7 Mpx blended = 2.7 frames' worth, + the pool + her and Pip's live layers) | 725, 735 | +170-183 |
| full (10 slots: 20 maps over every plane, 7.6 Mpx = 3.6 frames, + the movers' grain) | 775, 822 | +220-270 |
An earlier run at load 2.7-4.8 read 571-630 / 828-949 / 876-943: the box is shared, differences under ~50 ms are noise.
- **Where it goes:** the blended image area (`light.md` §7: ~50-60 ms per full frame of blended pixels); the live layers
  are within the noise (`light.md` §7). The dusk rig still draws v6's casts (in white): wasted work.
- **The production path** (estimates from `light.md` §7's measurements): drop the lib/light layers the maps replace
  (`light.md`: v6's lib/light costs ~340 ms of its ~550 ms frame); fold a shade that never changes into the colours
  (home 1, 0 ms); merge the bank's and near maps and crop to the shade's own box; the key into the palette (0 ms); the
  paper into the painted pieces at paint time and into each plane's one multiply map. The full look should then cost
  about what the light look costs, and the frame less than v6 does today (`light.md`'s proposal measured 256 ms).
- **Deterministic:** the bake twice gives the same bytes (all maps); each look's still rendered twice in fresh jobs
  gives the same bytes; still 1 equals `paint_still_v6.png` (md5 `7d35cccc27ac...`).

## 6. Rerun
From `video/`; scratch in `/tmp/organic/light_proof/run` (nothing big outside the maps and the sheet is kept):
```bash
bash src/look/light_s1/bake/run.sh            # parts renders, bake, the three stills, numbers, docs/look/organic/light_proof.png
BENCH=1 bash src/look/light_s1/bake/run.sh    # + the cost bench (30 frames x 3 looks x 2)
# one still: GL=angle node scripts/render-frames.mjs LightS1 <dir> 1.0 --entry=src/look/light_s1/entry.tsx --props='{"look":"light"}'
```

## 7. Weak spots (honest)
1. **Motion: the maps are one state of the scene.** They are solved for 1.0 s. In the bench's later frames (1.10-1.48 s)
   the glass doors have slid shut and the fascia's letters have popped on under the subject's maps: the shut glass takes
   the lobby's solve (a green cast), the letters a wrong lift. The still is right; a film needs one map set per state
   (doors open / shut, W's lamp, the pane at 3.90) mixed by the cause, and the things that change (the leaves, the
   letters, the water's moving reflections, the duck, her contact shadow, the far jogger) drawn as movers over the maps or
   in their own. The solve is also exact only at rest: while the planes float their edges slide past each other's maps by
   up to a few px (`light.md` §4.11 measured p99 2.8 L* 0.1 s later for a solved map). Not checked in motion here.
2. **The canopy's gaps of light and the sun flecks** are procedural ellipses with noise: softened and few, but at full
   size a few still read as soft discs (`light.md` §6.3's weak spot 3, halfway fixed). The leafy edge is designed by
   rules, not drawn; the organic lane's shape generators (`shapes.md`) should cut it.
3. **Her light reads only at full size.** At 400 px she is a dark teal figure in the light (the counterchange works);
   the rim and the wrap are 1-2 px. Where the opening's light surrounds her the wrap is an even band (an outline-like
   edge at full size); a thinner wrap or a wrap only on her back would be truer. Her shadow streak in the pool is small.
4. **The frame stays high-key above the band.** The key keeps the sky as painted (the source; the zenith -5 L* only),
   so the top 40 % is light while refs 02 and 03 are low-key (their medians 21 and 34; ours 61). Going further (a darker
   sky, `composition.md`'s T3) is the owner's call on the sky, not a light change.
5. **The far city barely changes at 400 px** (its fronts backlit 81 -> 72 on the bridge, the roofs held in the veil); its
   gold rims are 1-2 px and read only at full size.
6. **The lit panes still call in still 2** (yellow, a step under the lobby); only the key (still 3) calms them. The
   unlit lanterns are toned down but stay pale.
7. **The paper is visible at 1:1 and faint at 400 px** (0.4-0.8 L* added), over CRAFT §c's 0.25 L* grain cap; its
   bitrate in motion is not measured (baked per plane it rides the float, `techniques.md` §3.13 measured +6-11 % for
   baked, locked marks).
8. **The cost as built is +170-270 ms a frame** and 6.2 MB of maps in the repo for two looks of one still; §5's
   production path is estimated, not built.
9. **The scene is still busy** (R2, R3, R5 WARN): this proof lights v6's props; removing them is the composition lane's.
10. **v6's day casts are gone everywhere**, including the sunlit gap of the far towpath, where a dusk sun would cast long
    shadows toward us (`light.md` §4.6: <= 2.5 h, fading). Not drawn.
11. **Doses are tuned by eye on one still** (the facade 0.88 against `light.md`'s 0.52; our bank 1.0 against 0.80): toward
    the owner's "dark and contrast are great", but a dose for the owner to pick, not a rule.

## 8. Libraries and licences
NumPy (BSD-3-Clause), OpenCV (Apache-2.0) and Pillow (MIT-CMU) in the bake, measure and sheet (already QA
dependencies); Remotion and the Chromium headless shell (the project's stack; Chromium BSD-3) for every render; the
sheet's DejaVu fonts (the Bitstream Vera licence: free, commercial use included). Nothing was installed; no new
dependency; no non-commercial library (no Mixbox, no LYGIA).

## 9. Doc clashes (flagged for the orchestrator, not edited)
- **CRAFT §c** ("no texture in the caption band"; grain <= 0.25 L*) against the owner's point 9 and this paper: 12 % in
  the band (its spread 1.27 L* stays within the band's 1.5) and +0.4-0.8 L* on the flats. Proposed: "one paper per film:
  tooth + mottle, soft-light, <= ~1 L* added on a mid-tone, <= 15 % in the band (spread <= 1.5 L*), baked per plane".
- **CRAFT §f.8** (darks 6-10 % in many small pieces) against still 2's 33 % and still 3's 38 % in two big masses: the
  same clash `composition.md` §7.3 flagged (its R10 asks 15-40 %).
- **DIRECTION rule 5 / CRAFT §d.8** ("rim light only on the subject") against the rims here on what the key touches (C
  tier 1.6-2.6 px, far +2-4 L*): `light.md` §9 D-L2.
- **`light.md` §9 D-L6** (a light map needs a blend on PaintedLayer): answered here without touching lib/paint, by
  lib/light2's `LightMap` in the plane's own group; the orchestrator may prefer a `blend` prop on PaintedLayer instead.
- **`light.md` §4.3's rim widths** (the subject 4-6 px) are for a bigger figure: scale them by the figure's height
  (here 1.7 px at 153 px tall).

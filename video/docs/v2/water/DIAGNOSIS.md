# Water study 1: what reads cheap in v5's water, S1's water geometry, the seam (2026-10-28)

**The brief** is the owner on the G4 look clip v5 (`deliverables/v2/v2r_G4_look_v5.mp4`), quoted in
`docs/v2/OWNER_NOTES.md`: "I don't like the water too much, leafs are great" ... "It's just looking way too cheap, not
clean or premium quality or refined. Just lazy and cheap. I mean that about the water."

**The plan:** two designers each draw a new S1 water. Each works in ONE file, `src/v2r/water_study/candA.tsx` or
`candB.tsx`. The two are judged on S1, and the winner becomes the film's one shared water component. The approved look
does not change: the leaves, the near motes, the people, Pip, the sky, the buildings and the captions stay as they are.

**Rank:** a study note. The owner's words (the playbook's depth and water rule, the v2 OWNER_NOTES) outrank it, then
`docs/look/DIRECTION.md`, then `docs/look/CRAFT.md` (§c line, §d light, §f depth, §g sky, "Failures the eye catches
first").

**Companion research:** the water researcher's `docs/look/research/2026-10-28_water.md` (optics, craft, rules with
numbers). It uses this page's camera and `geometry.ts`.

**Images:**
- `v5_water_1to1.jpg`: v5's water at 1:1, at 1.0, 2.5, 3.8 and 5.0 s.
- `geometry_map.jpg`: S1's water region with its edges and mirror lines over the 2.5 s frame.

## 1. What reads cheap in v5 (frames 1.0 / 2.5 / 3.8 / 5.0 s, at 360 px wide and at 1:1)

**At phone size** the water is a narrow mint band between two pale floors. Three things on it catch the eye:
- two beige cards under the sun;
- a pink ribbon under the wing;
- white sparkles and a white V by the duck.

Nothing else on it moves. **At 1:1** every mark is a stamp: none of them is the water's response to something.

**How v5 draws the water.** S1Water (`src/v2r/scenes/V2S1_set_life.tsx`: `REFL` from l.154, the component from
l.182) draws four flat bands:
- `CM.waterDeep`, 9 px;
- WATER_FAR, y 1117-1150;
- `CM.water`;
- WATER_NEAR, along our coping.

On top of them it draws two static pairs of rectangles. The glint field (`V2S1_particles.tsx`) adds the sparkles, and
the kit duck adds the V.

The tells, most damaging first:

1. **The reflections are boxes (shape).** Each is a `b.rect`: axis-aligned, with square corners, ruler edges and no
   break.
   - The sun's "gold column" is two stacked cards: x 126-274 by y 1120-1132, and x 146-245 by y 1143-1162.
   - The wing's reflection is a 9 px ribbon at y 1120-1129. It runs x 347-653, then a gap, then from ~700 on under
     the boats.

   A reflection in calm water is the mirror image of what stands above it. It is cut into horizontal slivers by the
   ripples, so its sides waver and its far end breaks up. Every other shape in the look is a designed, closed shape
   (CRAFT §c), so these cards read as sticky notes laid on a floor. This is the owner's "box-shaped" and "lazy".
2. **The reflections do not match what stands above them (logic).**
   - The wing is a two-storey facade standing 1.5 m behind the coping. Its reflection should fill the water under it:
     the lobby's gold under the open doors, brick piers, slate fins and the ground-storey glass. v5 shows one pink
     ribbon.
   - The two moored boats are the darkest masses on the water (slate hulls at L* 52, plum gunwales), yet they have no
     reflection at all. A 7 px darker strip at each waterline (`S1BoatStrips`) is all they get, which reads as a
     shadow on a floor.
   - Nothing on the far quay reflects: not the duck, the bollards or the lamp posts, and not her in her teal coat or
     the row.
   - The low sun's reflection is two short cards. It should be a glitter path: a column of light under the disc
     (x 196) running over the whole height of the water there.
   - The bridge beyond the bend should give the classic arch-and-reflection shape at the left. v5 has nothing there.
3. **A sky wedge in the canal (a geometry bug).** The water's top edge is a straight line at y 1108. The far towpath
   bends away to the left of x 470, and its coping rises to y 1068 at x 0. Between the bent coping's 8 px strip and the
   water's straight top, the SKY shows through. It is a peach (#F8D9BA) triangle, 32 px tall at the left edge, closing
   at x ~350. WaterStudyA with no water proves it: the whole canal then shows that same peach.
4. **The colours read as tan, dusty and sticker-white.**
   - The sun's cards are #DFC6A3 / #E1C7A1 (L* 81, C* 21-23, h 80). That is the beige and muddy tan the playbook bans.
   - The wing's ribbon is a dusty pink, #D6B5A8 (L* 76, C* 15, h 48).
   - How the colours got there: v4 mixed these warm colours into the teal in sRGB, and they crossed grey (khaki, olive;
     check_light FAILed). L1 rescued them through `atmos` (hue kept, C* >= 12), which landed them on tan and dusty pink
     (report_L1_look v4). Any warm reflection mixed toward teal dies this way. A reflection keeps its own hue family,
     darker and calmer than its source, and sits next to the water's body colour, never blended into it.
   - The sparkles' cores (#FFFAF0, L* 98) and the duck's wake (`CM.paper` #FBF3E6, L* 96) are paper white. They are
     the whitest marks below the caption band and whiter than the sky they would mirror (L* 88-91). They read as light
     pasted on, not as the low gold sun on water.
   - The water's body is one flat grey-mint. It is #A6C7C3 on screen: `CM.water` after the clean pen's environment
     pull, L* 78, C* 12. It has no relation to the sky it mirrors: by the mirror, the far water should show the warm
     horizon (#FBD9BB) and our edge on the right the pale light band (#DBE4DA); see §2.6. That is where the "swimming
     pool" read comes from.
5. **It is dead still, apart from stickers that blink (motion).**
   - The base and reflection batches are `useMemo`'d with no `t`. The comment says "swaying slowly", but nothing
     sways, so the water is a painted floor that only rides the camera float.
   - The only motion on it is the 4-6 four-point stars popping in and out at random spots in a trapezoid (grow 0.3,
     shrink 0.4 of a 0.3-0.8 s life). They follow no ripple and no light.
   - The duck sits still (a ±6 px sway with a 21 s period) behind a frozen V wake.

   Calm water never stops: its reflections shimmer and their ripple cuts drift, and the glitter is many small, short
   flashes on ripple crests inside the sun's column.
6. **No surface, no perspective (depth).**
   - There is not one mark that tells you the water is a horizontal plane going away from you. Its ripples should get
     finer and flatter toward the far edge: a round ripple is 0.10 as tall as it is wide there and 0.23 at our edge
     (§2.3).
   - Its value steps are three ruler-straight horizontal bands, a stripe pattern that reads as an elevation: CRAFT §f's
     "flat elevation", in the water.
7. **Icon shapes, not drawing.** The four-point stars are clip-art and the duck's white V is a cartoon speed line. No
   other part of the look uses a symbol for a phenomenon.
8. **Nothing touches it (contact).** The boats, the duck and the coping meet the water as if it were a floor. Nothing
   gives the meeting line a reflection, a waterline break or a ring.

**What v5 gets right, and a new water must keep:**
- **The value place.** The water is lighter than the slate hulls and darker than our paving.
- **The cool field.** The canal is the frame's one cool field holding a warm world: CM's "cool (>= 10 %)" job and
  DIRECTION rule 6.
- **The draw-in.** It floods in cell by cell with the frame-0 cascade.
- **Clear lanes for the life on top.** The leaves cross it legibly, and so does Pip (§2.10).

**The kit Water** (`src/v2r/kit/canal/water.tsx`; S4 and S8 in `kit/canal/sets.tsx`, the kit samples) has the same
"fill and stamps" read, with more stamps:
- Reflections are rows of short sheared dashes in the source's raw colour (no darkening, no Fresnel). Each wobbles on
  its own sine, which is jitter, not ripple.
- Ripples are identical `CM.waterDeep` lenses scrolling at one constant speed and wrapping round the frame: a conveyor
  belt.
- Glints are paper-white dashes blinking on a 1.4-3 s clock, lit 42 % of the time.
- The wake is paper ovals on a 1.5 Hz loop.
- Perspective is only a linear size factor (`near` 1.6).

**The other water sites** the shared component must later serve (read-only for this study: other lanes are editing
them):
- S2: `V2S2_Water.tsx` (bands, like S1).
- S3: `V2S3_water.tsx` (a flat placeholder with its spec `S3_WATER`).
- S4: `V2S4_wcanal.tsx` (L3's canal: dashes, wobble, blinking glints).
- S4 and S8 in the kit sets (kit `Water`).
- S5: `V2S5_river.tsx` (the Potomac: streaks, popping glints).
- S7: `V2S7_water.tsx` (a basin, a placeholder with `S7_WATER`).
- The far water under S1's bridge arch: `V2S1_set_far` `bridgeBody`, a 14 px strip at y 1042-1056.

## 2. S1's water geometry

The numbers below are in `src/v2r/water_study/geometry.ts`. The module is derived from the S1 sources, so it cannot
drift; designers import it and never edit it. It also exports `S1_WATER`, the spec in the lanes' vocabulary (as in
`S3_WATER` and `S7_WATER`). The map is `geometry_map.jpg`. Everything is screen px at 1080 x 1920 with the float at
rest, and scene seconds equal film seconds.

### 2.1 The camera
- **S1's lens** (map `S1_LENS`; lib/depth's S1 `groundCam`): a level pinhole, horizon y 965, focal 1400 px, vanishing
  point (540, 965). The eye is 1.3 m over the far towpath and 1.45 m over the water. The far coping's foot is the water
  line: y 1110-1111 at her line, 14 m away. `S1W_CAM`.
- **Our bank** (the steps) is drawn in its own two-point view, with VPs (-1100, 1000) and (2600, 1000). The water meets
  only one of its lines: our coping's top, `waterBottom(x) = edgeY(1215, x)`. On the lens that line is a straight line
  on the water plane vanishing at (-1367, 965) on the horizon, so the water plane is consistent: our bank is simply
  turned about 36 deg to the far bank, and the canal widens toward the right. Ripples and reflections use the lens.
  Never use the steps' y-1000 VPs for the water.
- **Reflection by a level camera on flat water.** A point at (x, y) on a thing whose water line (the surface right
  under it, at its depth) is y_m shows at (x, 2 y_m - y). Things at infinity (the sky, the sun, the far roofs to a
  pixel) mirror about the horizon: y' = 1930 - y. Helpers: `mirrorLine`, `mirrorY`, `skyMirrorY`, `mirrorTransform`.

### 2.2 The region (`waterTop`, `reflTop`, `waterBottom`, `WATER_REGION`, `waterPolygon`)
| x | far edge `waterTop` | quay reflections start `reflTop` | our edge `waterBottom` | visible height |
|---|---|---|---|---|
| 0 | 1067.9 | 1082.9 | 1144.2 | 76 |
| 100 | 1076.7 | 1091.7 | 1157.3 | 81 |
| 196 (the sun) | 1085.2 | 1100.2 | 1169.9 | 85 |
| 300 | 1095.0 | 1110.0 | 1183.5 | 89 |
| 400 | 1104.4 | 1119.4 | 1196.6 | 92 |
| 470 to 1080 | 1111 (straight) | 1126 | 1205.8 at 470; 1215 at 540; 1236 at 700; 1266 at 930; 1286 at 1080 | 95 to 175 |

- **The far edge** is the far coping's foot: `S1_PATH.edge` + `s1Bend(x)`. The far towpath, which is drawn over the
  slot, puts its limestone coping (15 px) above that edge and its own 8 px `CM.waterDeep` strip below it.
- **reflTop** = far edge + 15. By the lens, the band from the far edge down to reflTop is the coping's face mirrored,
  and everything on or behind the quay reflects below it.
- **Our edge:** our coping is drawn over the water, so run the water at least 16 px under it.
- **Margins:** cover x -40..1120, from 4 px above the far edge (`WATER_REGION`) to 24 px under our edge. The float
  moves the water group by up to ~7 px, and the planes round it by 1-2 px relative to it.

### 2.3 The water plane (`waterZ`, `waterPxPerM`, `waterPxPerMDeep`, `foreshorten`, `depressionDeg`, `fresnel`)
| screen y | depth (m) | px/m across | px/m in depth | ripple height:width | view angle (deg) | Fresnel R | sky it mirrors (y) |
|---|---|---|---|---|---|---|---|
| 1068 (the bend, x 0) | 19.7 | 71 | 5.2 | 0.074 | 4.2 | 0.63 | 862 |
| 1111 (the far edge) | 13.9 | 101 | 10.5 | 0.104 | 6.0 | 0.53 | 819 |
| 1150 | 11.0 | 128 | 16.9 | 0.132 | 7.5 | 0.45 | 780 |
| 1200 | 8.6 | 162 | 27.2 | 0.168 | 9.5 | 0.37 | 730 |
| 1250 | 7.1 | 197 | 40.0 | 0.204 | 11.5 | 0.30 | 680 |
| 1290 (our edge, right) | 6.2 | 224 | 52.0 | 0.232 | 13.1 | 0.26 | 640 |

How to read the table:
- The canal is ~6-8 m wide here. Things on it shrink 2.2x from our edge to the far edge.
- A ripple of one size in metres is ~5x flatter on screen at the far edge than at our edge. Its length shrinks as 1/z
  and its height as 1/z^2.
- Reflections fade from ~0.53 of their source's light at the far edge to ~0.26 at our edge, where the water shows more
  of its own deep body colour (Fresnel, water n 1.333).

### 2.4 What stands above the water and where its reflection lands
| reflector | where (screen px) | mirror line | visible in the water |
|---|---|---|---|
| **the coping face** (limestone; the face is in shade) | the whole far edge | the far edge | far edge to reflTop (under the far towpath's 8 px strip at first) |
| **Google's wing** | x 330 to past 1080. Base `1090.2 - 0.024 (1080 - x)`: 1072 at x 330, 1090 at x 1080. Ground storey from y 794. Glass double door x 540-720 (y 848 to the base). | `mirrorLine(x, base)`: 1087 at x 330, 1091 at x 540, 1106 at x 1080 | Its lowest ~21 px never show (they sit behind the mirrored coping). From reflTop down it shows the ground storey's lower part (at x 630: wing y 1061 up to 960): brick piers, slate fins, glass, and the lobby's gold through the door. Mostly hidden by the boats at x > 786. |
| **her and the row** | on the front line (feet 1095 on the straight, rising round the bend). `rowAt(t)`: her x 680 (0.5 s), 619 (2.5 s), 567 (3.8 s), 537 (4.6-5.0 s), 510 (5.6 s); 170 px tall. G1-G6 pop at 2.00 / 2.53 / 3.20 / 3.80 / 4.20 / 4.79 one step ahead each (smaller round the bend); O1-O3 from 4.98. | the far edge (1111 on the straight) | They hang from reflTop (1127) as long as they are tall: her feet and legs and the coat's hem down to our edge (~90 px of her 170). |
| **bollards on the coping** | x 770, 430, 262, 160, 66; foot 1101 down to 1064 round the bend; 22 to 16 px tall | the far edge at their x | 15-20 px slate stubs hanging from reflTop |
| **lamp posts** (off, slate iron) | at the path's back: x 1046 (base 1074, 366 tall), 752 (1074, 340), 360 (1064, 322), 6 (1031, 235) | 1088 / 1088 / 1077 / 1045 | Long thin streaks from reflTop to our edge: x 752 (1126-1243), 360 (1116-1191), 6 (1083-1145). x 1046 is behind the boats. |
| **the road bridge**, beyond the bend (the far towpath runs in front of its foot) | x -60..350; railing top 934, deck 958, string course 972, base 1056; arch cx 110, half-span 148, spring 1030, crown 984 | ~1050 (estimated: the far water under the arch is drawn at 1042-1056) | From reflTop: the lower half of the arch's reflection (crown at ~1116, a bowl at x 110), the spandrels' brick 1116-1128, deck and course (limestone) 1128-1142, the railing 1142-1166; the far tower (x 258-346) as a sliver under it. The bus crosses the deck from 1.10. |
| **the sun** SUN0 (196, 772) r 52 | elevation 7.8 deg | the horizon | Its still-water mirror sits at (196, 1158), behind the bridge's reflection except its lowest sliver. Ripples catch it as a glitter column at x ~196 over the whole visible water there (1085 to 1170), widest toward us. v5's glints used half-widths 40 to 80. |
| **boat A** (behind; sage cabin, slate hull, plum gunwale) | bow x 786 to the stern off right; water line 1140, hull top 1118, gunwale 1112, roof 1038 | its water line, 1140 | Hull, gunwale and cabin inverted from 1140 down, until boat B covers it (x > 930) and our edge (~1250) |
| **boat B** (front; oat cabin) | bow x 930; water line 1196, hull top 1170, gunwale 1164, roof 1078 | 1196 | Hull and gunwale from 1196 to ~1228, then the cabin, cut by our edge at 1266-1286 |
| **the duck** (CM.line mallard) | (396, 1136), 62 px, a ±6 px sway | 1136 | Its inverted body 1136-1150 |
| **the sky** S1_EVENING | | the horizon | All the water not covered by a reflector; see §2.6 |

**On-screen colours of what reflects** (sampled at 2.5 s, after the clean pen):

| what | hex | L* / C* / h |
|---|---|---|
| wing brick | #CD9985 | 68 / 25 / 47 |
| fins | #9DA3B3 | 67 / 9 / 277 |
| ground-storey glass, lit / in shade | #BBC3C3 / #858798 | 78 / 3; 57 / 10 |
| lobby gold (emissive, never calmed) | #F7CF86 | 85 / 42 / 83 |
| a lit ground-floor window, x 943-1032 | #E0B576 | |
| her coat (hers only) | #0B8577 | 50 / 33 / 182 |
| oat coats | #E6D3B5 | |
| far towpath paving | #EBD7C5 | |
| coping | #EAE2D4 | |
| hulls | #707E92 | 52 / 13 / 268 |
| boat A's sage | #B5C7AF | |
| boat B's oat | #E4D3BA | |
| duck | #A66952 | 50 / 32 / 47 |
| bridge brick / stone | #DAA28E / #EEDCCB | |
| the far towpath's strip on the water | #8AB3AD | |

A reflection is darker and calmer than its source: Fresnel (§2.3) plus the water's own colour. It stays tier C
(CRAFT §b: local contrast <= 7 on the plane, no outlines), and her reflection must never compete with her.

### 2.5 The sun and the glitter
- **The sun:** SUN0 at (196, 772), r 52, in the west gap, setting behind the far roofs (tops ~752-830). Elevation
  7.8 deg; azimuth 13.8 deg left of the view axis.
- **The flood:** it starts from the sun's screen spot (§2.10).
- **The glitter column:** for a level camera on flat water, it lies straight below the sun at x 196. The still mirror
  centre is y 1158. Ripple facets spread it over every depression angle the slopes allow, which here means all the
  visible water at that x.
- **Its shape:** narrow at the far edge, wider toward us; many short flashes, flattened by `foreshorten(y)`.
- **The particle rule still holds** (CRAFT §f.6): glints 20-36 px, 4-6 at once, L* +15..+25 over what is behind them,
  0.3-0.8 s, seen at phone size.
- **The light rule caps the glitter** (CRAFT §d.2): the brightest 5 % of the frame (sky and caption band out) stays on
  her and the row. Keep the glitter small in area and warm, and check it (§3.4).
- `S1_WATER.glitter` holds the column.

### 2.6 The sky preset: what the water mirrors where nothing stands
`S1_EVENING` (`src/v2r/world/skies.ts`, lib/sky `eveningSky`):
- the zenith key at y -120 (OKLCH l .855, c .042, h 175);
- `CM.sky` #BCDCCF flat through the caption band, 317-556;
- a light key at y 690 (l .928, c .014, h 71);
- the horizon `S1_HORIZON` #FBD9BB at y 800;
- the sun's warmth round SUN0: rx 340, ry 153, colour l .902, c .083, h 57.

`S1_AIR` = `horizonColor(S1_EVENING, 196)` = #FDD6B8, the far haze.

What the water mirrors at each y (sky y = 1930 - y; `skyColorAt(S1_EVENING, 1930 - y, x)`):

| water y | sky y | away from the sun | under the sun |
|---|---|---|---|
| 1111 | 819 | #FBD9BB | #FDD6B8 |
| 1150 | 780 | #FAD9BF | #FDD5B8 |
| 1200 | 730 | #F3E2D3 | #FBD8BE |
| 1250 | 680 | #EBE6DE | #F1E1D2 |
| 1290 | 640 | #DBE4DA | |

**The decided exception for this job:** the water may show this one sky through lib/sky (`<Sky spec={S1_EVENING}/>`
inside `mirrorTransform(965)`, clipped to the water), compressed, toned toward the water and dithered the same way.
It is the sky's own gradient seen in the water. Nothing else in the water may gradate.

**Keep the cool field:** the mirrored sky is warm at the far edge and pale toward us. Seen through Fresnel over the
teal body, the water must still read as the frame's cool field, and never cross grey, khaki or olive (CRAFT §f.2; §1,
tell 4).

### 2.7 The light rig
- **The rig:** `RIG_CANAL` (`src/v2r/world/rigs.ts`): the low western sun, `sunLight({toward: 15, el: 36})`, casts
  capped at 0.8 h, ground flattening 0.28. Shadows fall right and a little toward us. The pools and the rim stay off
  the water.
- **On water** a light-layer shade takes `tint="water"`: `TINT_CANAL.water` #CBE0E0, a multiply that gives the water's
  own deeper step (`CM.water` x it = `CM.waterDeep`). Never the rose family, which greys teal.
- **Draws over the slot:** `S1BoatStrips`, a cast-strength strip at each waterline.
- **The slot sits inside `<Lit rig={RIG_CANAL}>`,** so lib/light's `ShadowLayer` / `Shadow tint="water"` work there.

### 2.8 The palette keys (`src/v2r/palette.ts`, "10 Canal Mint")
- **The water family:**
  - `CM.water` #9DC6BF (L* 77, C* 15)
  - `CM.waterDeep` #7DAEA8 (L* 68, C* 18)
  - `CM.glass` #CDE1DF
  - `CM.sky` #BCDCCF
  - `CM.skyHigh` #CFE6DC
  - `CM.paneUnlit` #5E6F86
  - `CM.shadeCool` #6F80A0
- **Light:**
  - `CM.lamp` #F7CF86
  - `CM.lampCore` #FBE6C2
  - `CM.sun` #EE6A2E (the disc only)
  - `CM.paper` / `CM.white` #FBF3E6
  - `CM.bandGold` #F6D9BC
- **The emissive colours,** never calmed by a tier: `CM.lamp`, `CM.lampCore`, `CM.sun` (`src/v2r/pen.ts`).
- **The clean pen inside the slot:** it is an environment-tier scope, so a `<Fill>` colour is pulled 16 % toward
  `CM.sky` in L* and its chroma is x0.85 (cap 36): `CM.water` shows as #A6C7C3. To keep an authored colour exactly,
  pass `backdrop` or draw raw SVG.
- **Never** beige, muddy tan, olive or grey (the playbook); the hero teal is hers only.

### 2.9 The parallax float (`V2S1_float.tsx`)
- **The legs:** `S1_FLOAT_LEGS` (near-ground px): at rest to 1.10; to (-8, -3) at 2.30, (-4, -9) at 3.40, (4, -7) at
  4.60, (0, 0) at 5.80. Home at 0, 0.3, 0.97 and from 5.80.
- **The shares** (`parallaxK`): the water plane (-0.5) takes **0.725**. The wing, the far towpath, her and the row
  take 0.6; the boats 0.7375; our bank 0.85; the bridge 0.35; the far tower 0.15; the sky and the captions 0.
- **Counter-shifting a reflection:** strictly, a reflection rides its THING's plane. `floatOf(plane, t)` gives the
  counter-shift inside the slot: about 1 px for the wing and 3 px for the bridge at the float's widest.

### 2.10 Time: frame 0, the flood, the beats, the life on top
- **Frame 0 and the flood** (`V2S1_clock`; DIRECTION rule 9). The water must draw in with the scene:
  - At t < flood, every `<Fill>` is PALE: its colour mixed 0.7 toward the paper #FBF3E6. A `backdrop` Fill is plain
    paper.
  - The front leaves SUN0's spot (196, 772) at t 0.02 and runs at 5800 px/s. A fill turns to its colour when the front
    reaches its bbox centre.
  - The water floods from f5 (x ~196) to f12 (the right end): `floodAt(x, y)`, `floodRadius(t)`.
  - Split big fills into cells, as v5 did with 140 px cells, so the flood ripples across. Raw SVG (a mirrored `<Sky>`, a
    pattern) ignores the cascade: clip it to `floodRadius(t)` round `FLOOD_ORIGIN` over a pale copy (`palePaint`).
- **The beats** (`BEATS`):
  - the lobby's gold through the open doors, 0.45-1.10; her step-out at 0.97;
  - the ghost pops at 2.00-4.79; the stop at 4.54-4.98; "life" at 4.98;
  - the bus on the bridge from 1.10; the bridge birds lift at 2.45;
  - **5.80-6.40: nothing new enters, pops or turns.** The push-through into W runs 5.95-6.25 and the plum bridge
    6.05-6.15. A steady motion keeps its pace.
- **The mover budget** (DIRECTION rule 3): at most 3-4 noticeable movers at once, taking turns. The water's own life is
  tier C: slow, small, calm.
- **The life on top must stay readable** (the owner: "leafs are great"):
  - **The leaves** (34-40 px; rust #B8714F at L* 55, gold #D6A563 at L* 71) cross the left water and our landing from
    ~2.0 s: x 0 -> 460, y 1150-1340. Under that path, never put a warm field near their value: the bridge's brick
    #DAA28E is the leaves' own hue and value. Keep it cool or lighter, so the leaves part by hue and value.
  - **Pip** (body ~#999AC2, L* 65, tier B) sits in front of the water at x 650-750, y 1120-1300. Whatever is reflected
    behind it (the lobby's gold, her coat's teal) keeps ~12 L* or a clear hue step from Pip.
  - **The near motes** are on the bay tree, off the water. **The glint field** is replaceable (§3).

### 2.11 What draws over the slot (it cannot change these)
In z-order after the water:
- the far towpath (paving, coping, its 8 px `CM.waterDeep` strip at the edge), the wing, her and the row;
- the boats' waterline strips and the boats;
- the duck (replaceable: `CandDuck`);
- our bank and coping;
- Pip;
- the particles (the glints are switchable: `GLINTS_OFF`).

If a design needs one of these changed (the far strip, the boat strips), the integration step does it in S1's files,
not the study.

## 3. The seam: how a designer works

### 3.1 Files
- `src/v2r/water_study/candA.tsx` / `candB.tsx`, **each designer's one file.** Each exports:
  - `CandWater: React.FC<{t: number}>`: the whole canal; null for now;
  - `GLINTS_OFF`: true hides v5's glint field;
  - `CandDuck: React.FC<{t: number}> | null`: null keeps the kit duck.

  Put every helper, colour and constant for the design in this file. Use only npm packages already in `package.json`;
  adding a researched one is the orchestrator's call, so say so in your report.
- `src/v2r/water_study/geometry.ts`: §2's numbers, read-only. Import it.
- `src/entry-v2r-waterstudy.tsx` registers three compositions, each the film's first 368 frames (0.00-6.13 s, the G4
  look clips' span: S1 to the push-through's plum bridge), 1080x1920, 60 fps, with the voice, the captions and the
  frame-0 words, and no draft label (`{draftLabel}` prop):
  - `WaterStudyBase`: S1 as it is;
  - `WaterStudyA` / `WaterStudyB`: S1 with the candidate.
- **The contexts** (unset = S1 byte for byte as before, §4):
  - `S1WaterSlot` and `S1DuckSlot`, with `S1_DUCK`, in `V2S1_set_life.tsx`;
  - `S1GlintsOff` in `V2S1_particles.tsx`.

  Only the study entry sets them. `S1DuckSlot` was added beside the two asked for: the duck's paper V wake is one of
  v5's tells, and without it a candidate could not touch it.

### 3.2 What CandWater gets
- **Where it draws:** in S1Water's place: after the sky things, the west gap and the far jogger, and before everything
  in §2.11.
- **Its scope:** inside `<S1Plane plane={S1_PLANE.water}>` (the float x 0.725), `<Tier tier="environment">` (§2.8),
  the flood's `<Look cascade>` (§2.10) and `<Lit rig={RIG_CANAL}>` (§2.7).
- **`t`** is scene seconds.
- **Determinism:** draw from seeds (`lib/rng`) and `@remotion/noise`, never `Math.random` or `Date`.
- **Draw clean:** the clean pen, flat colour and closed paths, no blur, glow, filters or gradients. The ONE exception is
  the mirrored sky (§2.6).
- **Frame rate:** 60 fps. Drawn motion may step (12-24 drawings/s) while the float glides.
- **Cost:** stay near v5's frame cost (~0.9 s/frame in a master clip at concurrency 2).

### 3.3 Render (from `video/`; the machine has 4 CPUs and others render too: stills first, clips only to judge motion)
```sh
npx tsc --noEmit -p .                                        # typecheck (from the repo root: npx tsc --noEmit -p video)
# stills at 1.0 / 2.5 / 3.8 / 5.0 s (frames 60 / 150 / 228 / 300), full size, PNG: <dir>/f00150.png ...
node scripts/render-frames.mjs WaterStudyA /tmp/wsA 1.0,2.5,3.8,5.0 --entry=src/entry-v2r-waterstudy.tsx --concurrency=2
node scripts/render-frames.mjs WaterStudyBase /tmp/wsBase 1.0,2.5,3.8,5.0 --entry=src/entry-v2r-waterstudy.tsx --concurrency=2
# frame 0's draw-in (the flood crosses the water at f5-f12)
node scripts/render-frames.mjs WaterStudyA /tmp/wsA0 0,0.05,0.1,0.15,0.2,0.3 --entry=src/entry-v2r-waterstudy.tsx
# one still with the CLI (remotion.config's swangle GL: slower, anti-aliasing differs a little from render-frames)
npx remotion still src/entry-v2r-waterstudy.tsx WaterStudyA /tmp/wsA_150.png --frame=150
# a 2 s clip, master encode with the voice (2.50-4.48 s: the float's widest leg, the leaves, two ghost pops; ~2 min)
node scripts/render-media.mjs WaterStudyA /tmp/wsA_2s.mp4 --entry=src/entry-v2r-waterstudy.tsx --frames=150-269 --master --concurrency=2
# the whole 6.13 s look-clip span (the v6 candidate): drop --frames
node scripts/render-media.mjs WaterStudyA /tmp/wsA.mp4 --entry=src/entry-v2r-waterstudy.tsx --master --concurrency=2
```
**The phone view:** look at the frames at 360 px wide, as the owner does:
```sh
python3 -c "from PIL import Image; import sys; ims=[Image.open(p).resize((360,640),Image.LANCZOS) for p in sys.argv[1:]]; s=Image.new('RGB',(370*len(ims),640),'white'); [s.paste(im,(i*370,0)) for i,im in enumerate(ims)]; s.save('/tmp/wsA_phone.png')" /tmp/wsA/f00060.png /tmp/wsA/f00150.png /tmp/wsA/f00228.png /tmp/wsA/f00300.png
```
Also look at the water at 1:1 (crop y 1040-1340) beside `v5_water_1to1.jpg`.

### 3.4 Checks before judging
- **Typecheck:** clean.
- **Determinism:** the same frame rendered twice, in two processes, gives the same sha256.
- **Light:** `scripts/qa/check_light.py` A/B. Render the same frame with `--props='{"lightOff":true}'` (the A side),
  then run with `--sky '#BCDCCF' --exclude 0,0,1080,<the sky's bottom>` and `--subject` her and the row. S1's open sky
  reaches y ~950 in the west gap; L1's v5 runs passed with the brightest 5 % 0.045-0.058 H from the subject. Run the
  same flags on WaterStudyBase. The candidate must not move the brightest 5 % off her or add greyed pixels.
- **Particles:** if the candidate draws its own glitter as particles, `particleProblems` must be clean (CRAFT §f.6
  sizes, at most 16 alive across S1's fields).
- **Sky banding:** if the candidate mirrors the sky, run `scripts/qa/check_banding.py` on the master clip over an open
  stretch of mirrored sky (CRAFT §g.5).
- **Eye checks** (CRAFT "Failures the eye catches first"):
  - at phone size, no boxes, dashes or stars;
  - the leaves and Pip still part from the water;
  - the far towpath's bend has water up to its coping;
  - nothing new happens in 5.80-6.40.

### 3.5 Disk (2026-10-28 09:40)
The machine's disk filled up: 0 MB free, and `render-media` died with "Page crashed!". Crashed renders leave 75-90 MB
bundles in `/tmp/remotion-webpack-bundle-*`. Delete your own after a crash, and keep scratch renders few and small.

## 4. Proof: with the contexts unset, S1 is byte-identical
All renders used `scripts/render-frames.mjs`, default GL, full size, PNG, at three frames: f6 (0.1 s, mid-flood: the
water half pale), f150 (2.5 s: glints, a leaf, the float mid-leg) and f300 (5.0 s).
1. **Before the seam:** `Film2R` from `src/entry-v2r-film.tsx` with `{"draftLabel": false}`, base commit `5ec956f`.
2. **After the seam:** the same command (the contexts exist, unset).
3. **After the seam:** `WaterStudyBase` from `src/entry-v2r-waterstudy.tsx`.

| frame | sha256, identical in all three |
|---|---|
| f00006 | `a8968a5b87f91c44cdbdd2825fa7331b1ad3de47007f2ffb07bf5e749015f0c8` |
| f00150 | `59739a79db92ddf10765d544dc6accac8dcf01ec459e942739ef0cc9cda9abc8` |
| f00300 | `7b40190b694f43a2f3ee8e56c485e0eea8c3c42be5830fc86b870de02149745c` |

Nothing else S1 draws changed in between: the commits merged meanwhile touched S5, S7 and docs only.

**The seam reaches its slots.**
- A throwaway entry set a flat test water, `GLINTS_OFF` true and an empty duck. At 2.5 s it changed 93,521 pixels, all
  inside y 1068-1283: the water filled up to the bent coping, the glints and the duck were gone, and nothing outside
  the water changed.
- `WaterStudyA` with the null stub changed 85,814 pixels, all inside y 1105-1283. The canal shows the sky (the peach
  of tell 3) under the kept glints and duck.
- `master` render of `WaterStudyBase` frames 150-161: OK (h264, yuv420p, bt709, with audio).

# Scene 1 rethought: the iteration still (2026-10-29)

**What this is:** the light ITERATION the owner asked for ("we have the 'production' process and we have 'iteration'
process that needs to be more lightweight"): one agent, about an hour, no panel. ONE still, 1080 x 1920, of v2's first
scene ("She quit Google.": she walks out of Google's King's Cross office on Regent's Canal, an October evening),
rebuilt from a blank frame the way the city posters are built. It shows the big leap, not polish. (The README's table
is the production plan; this iteration's files are the ones below.)

| File | What |
|---|---|
| `thumb_A.png`, `thumb_B.png`, `thumb_C.png` | three constructions as grey value thumbnails (540 x 960, 7 flat values) |
| `thumbs_vs_posters.jpg` | the three beside Singapore and Reykjavik, all in grey, at 400 px |
| `stage_1_values.png` | the pick, big shapes only, each in the grey of its colour's L* |
| `stage_2_colour.png` | flat colour, a lit and a shade face on every volume |
| `stage_3_detail.png` | the hero's fin rhythm, the low-poly world, darks in many small pieces, her, Pip |
| `still_v1.png` | the final: stage 3 + a very subtle static paper mottle (also `video/deliverables/tests/poster_scene1_still_v1.png`) |
| `compare.jpg` | v2's scene 1 as shipped, the still, Singapore, Copenhagen, side by side at 400 px |

## The pick: A, the raised designed view (with C's icons grafted in)
1. A is the posters' own construction (Singapore, Reykjavik, Cape Town): over a dark near frame, across water (the
   gap), to a hero standing in open sky, with the far city lifted pale onto its own horizon.
2. It is the biggest leap from v2. v2 had a low eye, a pale floor over a third of the frame and a small building
   mid-frame. A puts near masses where that floor was, one flat water gap, and a far stage.
3. B gave the hero size, but as one heavy single-value wedge: a street view close to v2's and to Copenhagen's rail
   and paving (a copy risk).
4. C had the most icons but split the focus: the landscraper read as one of four.
5. A's weakness, a low and flat hero, was fixed in the build: the hero drawn bigger than the camera allows, a gentle
   two-point for a lit front and a shade end, its fin rhythm the strongest contrast in the frame. C's gasholder frames
   (the secondary icon) and the Coal Drops Yard shed (the near frame) are grafted in.

## The construction (y in the 1080 x 1920 frame)
- **Sky, y 0 to ~790:** one gentle gradient, pale aqua at the top to warm apricot at the horizon, nearly flat in the
  caption band (median L* 90). "She quit Google." sits at y ~405-500 in Patrick Hand, ink on light.
- **Far stage (second horizon ~y 1010; k 0.64-0.87):** the St Pancras clock tower and the hotel's gables are the pale
  far anchor (top y 642, base hidden behind the gasholders, detail only tone-on-tone). A ghost skyline sits behind,
  and the Shard is the faintest thing in the frame ("something WAY further out").
- **Hero, y ~730-1340:** the landscraper as a gentle two-point elevation (right VP 4000 px out, a steep left VP for
  its shade end). Its signature is slender lit fins with a wider pier every fourth, deep teal glass, warm evening
  windows scattered sparsely, and the roofline stepping down twice into terraces. Its roof garden of low-poly trees
  (green, some autumn) gives it a living skyline. Trees on the quay hide its base at both sides and leave the lit
  lobby and her open.
- **Secondary icon, left:** the gasholder frames, dark iron with a warm drum inside, overlapping the far anchor's base.
- **Gap, y ~1392-1512:** the canal, one flat light field, with calm pier reflections and warm glints under the lobby.
- **Near frame, y > 1440:** a moored narrowboat (colour as confetti), autumn plane trees cut by the left and bottom
  edges, Granary Square's grass steps with a lamp, and a Coal Drops Yard brick shed cut by the right and bottom edges.
  The shed's roof sweeps up toward its "kiss", and arched windows give real darks in many small pieces (one window
  warm). The bottom corners are dark.
- **People:** she is tier A, teal, about 84 px, from behind, no face, leaving the brightest spot (the lit lobby) with
  a small box (a literal "quit" for sound-off viewers; a proposal, drop it if the script disagrees). Three strangers
  are tiny and soft on the far quay.
- **Pip, hidden:** on the narrowboat's roof between the plant pots (x ~420, y ~1395), a periwinkle shape found on a
  second look.
- **Light:** a low October sun from the right. Lit faces are warm, shade faces cool lilac; no outlines anywhere (edges
  are steps of light, shade or value). Thin lines only on things that are lines (the gasholder irons, the lamp).

## Each stage's check beside two posters (400 px) and what it fixed
- **Thumbnails** (all three beside Singapore, Copenhagen and Reykjavik in grey): picked A, as above.
- **Values, first pass:** the bottom was still a floor (a flat towpath), not a frame. Fixed by raising the brick
  shed, the steps and the trees into near masses.
- **Colour, first pass:** the hero read as a pale pinstripe, and its roofline was one straight line. Fixed with bolder
  fins, wider piers, deeper glass and a stepped roofline (the terraces). Trees on the quay now hide its base, as in 5
  of the 7 posters.
- **Detail:** the random warm windows made the hero noisy. They are now fewer, so it is crisp and calm like the
  posters' heroes. The water's reflection specks broke DIRECTION rule 4 and became calm pier reflections.

## Measured (L*, outside the caption band; posters' ranges from `pro_1_depth.md` §3.1 and `composition.md`)
| | L* < 65 | in-between 65-80 | darks < 40 | bottom fifth, median | bottom corners | near-to-air span |
|---|---|---|---|---|---|---|
| v2 scene 1 | 11 % | 30 % | 2 % | 76 | 65 / 69 | 10 |
| **still_v1** | **43 %** | **10 %** | **17 %** | **48** | **49 / 48** | **40** |
| posters | 27-48 % | 8-14 % | 9-25 % | 47-59 (bottom quarter) | 44 / 53 | 27-46 |

## Weak spots the owner may see (next pass, if this direction is a yes)
- The gasholder frames read a little like scaffolding: they need lighter irons and a rounder ring.
- The shed's slate roof is one big flat wedge: it should be split into two or three facets (the posters' patchwork).
- The hero's front is lit evenly: it could take one gentle lit-to-shade step along its length.
- The canal gap is narrow next to Singapore's bay, so the water patchwork has little room.
- The mid band (the quay) is thinner and less lush than the posters' tree bands.

## Source and re-run
`video/scripts/look/scene1/`: `scene.py` (the still, staged), `thumbs.py` (the three thumbnails), `svgkit.py` (a tiny
SVG writer: flat fills, no strokes except true lines), `render.cjs` (Playwright Chromium, SVG to PNG), `sheet.py`
(labelled 400 px sheets; posters cropped to their content rows).
```
cd video/scripts/look/scene1
python3 thumbs.py ../../../docs/studies/2026-10-28_city_posters/scene_rethink
python3 scene.py  ../../../docs/studies/2026-10-28_city_posters/scene_rethink        # stages 1-4
```
SVGs land in `/tmp/scene1-iter/`. Each run is deterministic (fixed seeds).

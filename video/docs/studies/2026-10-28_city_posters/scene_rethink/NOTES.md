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

## The owner's verdict on still_v1 (2026-10-29)
"So there is no sense of depth here like the building is right here and there us really no scale depth I’m really
suffocating with the view / Some bits are good tho like the style of separation of foreground vs background / Also the
reference do have more details and density like the the street along the canal ours is pretty empty while their have
density m / Also the sky is not entirely single color there are more things happening / Also dont overindex on adding
labdmarks or putting weird camera angles on existing real views thats nit as important / The closest leafs and nature
on the left are way too big and not as subtle as they need be"

-> Keep: the near/far separation (the dark near frame, the lighter far world). Change in still_v2: the hero pulled far
back into an open, deep view (well under the frame's width, sky round its top, open water before it, the city receding
behind it in many paler layers to something tiny); the quay full of small life; a sky with things in it; the near
nature small and subtle; no effort on landmarks or an exact camera angle. The general rule: playbook "DEPTH IS AIR AND
DISTANCE".

## still_v2

**The owner, on still_v1** (2026-10-29): "So there is no sense of depth here like the building is right here and there
us really no scale depth I'm really suffocating with the view / Some bits are good tho like the style of separation of
foreground vs background / Also the reference do have more details and density like the the street along the canal
ours is pretty empty while their have density ... Also the sky is not entirely single color there are more things
happening / Also dont overindex on adding labdmarks or putting weird camera angles on existing real views thats nit
as important / The closest leafs and nature on the left are way too big and not as subtle as they need be". The
playbook's rule is now "DEPTH IS AIR AND DISTANCE".

| File | What |
|---|---|
| `stage_v2_values.png` | the new construction as values (big shapes, each in the grey of its colour's L*), checked beside Singapore and Cape Town at 400 px before any colour |
| `still_v2.png` | the still (also `video/deliverables/tests/poster_scene1_still_v2.png`) |
| `compare_v2.jpg` | still_v1, still_v2, Singapore, Cape Town at 400 px |

**What changed (the construction, not the paint):**
- **The camera is pulled far back across a canal basin.** The landscraper sits in the middle distance: its front is
  56 % of the width (59 % with its shade end; v1 ran off the right edge), its whole length is visible, and its base
  stands on its quay. It is 13 % of the frame's height at its near end (v1: 32 %). Sky and the cloud bank show round
  its top and both ends, because the blocks beside it are now lower than it. It is still the crispest thing in the
  frame (the widest value range, L* 30-90): fins, glass, warm windows and the roof garden.
- **Open water before it:** the basin (y ~1270-1540), with the sky seen in it and the hero's broken reflection.
  Ripples get longer and thicker as they near, which adds perspective. A narrowboat crosses with its wake, and three
  ducks.
- **The city recedes behind and beside it in five layers**, each paler, smaller and simpler:
  - warm brick blocks at its ends, with real windows, a few lit;
  - lilac mid-rises with fewer, smaller windows;
  - plain pale blocks with slender towers at the sides;
  - paler towers and cranes;
  - a ghost strip, where tiny towers peek over the hero's lower terraces: the "something tiny on the horizon".
  The far layers lean cool (lilac-rose) against the warm sky. No landmark is hunted: St Pancras and the Shard are gone
  into the generic far layers.
- **The quay is full** (the calm tier, all small):
  - 13 awnings with dark shade under each and cafe tables with seated people;
  - 15 walkers and a cyclist;
  - a row of 13 trees (Singapore's tree band), 7 lamps, planters and parked bikes;
  - three moored narrowboats.
  She, in teal and from behind with the box, leaves the lit lobby on a lit pool of paving, the one clear space on the
  quay. **Pip** is on the blue narrowboat's roof between the plant pots (x ~684, y ~1262).
- **The sky has things happening, calmly.** It is the gradient plus:
  - a paint-like tonal variation (fractal noise at a few % opacity, weaker inside the caption band);
  - a big soft cloud bank low behind the city, and two small clouds outside the band;
  - pale far towers rising into it, and five tiny birds.
  The caption band stays clear (median L* 89).
- **The near frame is a hint at the edges:**
  - one small branch at the top right and a few real leaf shapes at the bottom left (lit and shade halves, no outlines);
  - Granary-like steps down to the water: calm, darker bands that thicken as they near, with fallen leaves;
  - a smaller brick shed in shade at the bottom right;
  - one lamp.
- Source: `video/scripts/look/scene1/scene_v2.py` (`python3 scene_v2.py <out> values detail final`); v1 stays
  reproducible with `scene.py`.

**Measured** (L* outside the caption band; "edges" = share of pixels with a step > 6 L* to a neighbour):
| | still_v1 | still_v2 | posters |
|---|---|---|---|
| hero: width of frame (front) | ran off the edge | 56 % | Singapore ~55 %, heroes 21-45 % of the height |
| planes, near to far (+ sky) | ~5 | 9 (steps and shed, water, quay and tree band, hero, 5 city layers) + the cloud bank | 5-7 |
| open sky down to | y ~640-790 | y ~920-950 (48 %) | 36-53 % |
| quay / middle band edges | 8 % | 15 % | Singapore's tree band 22 %, Copenhagen's quay 36 % |
| L* < 65 / 65-80 / < 40 | 43 / 10 / 17 % | 33 / 16 / 7 % | 27-48 / 8-14 / 9-25 % |
| bottom corners | 49 / 48 | 58 / 41 | 44 / 53 |
| near-to-air span | 40 | 31 | 27-46 |

The v2 depth ladder (median L*): sky 90; far city layers at the sides 82; brick blocks at the hero's ends 68; hero 68
(p10-p90 30-90: it owns the contrast); quay 83; water 78; near steps 58; near shed 41. That is a lighter, airier world
in front of a darker near frame, the separation the owner liked.

**Weak spots I see:**
- The quay is about twice v1's density but still under the posters' (15 % edges vs 22-36 %): its things are crisp but
  flat, with little texture inside each shape.
- The steps are the largest near shape (the bottom ~20 %), calm but one repeated pattern. The posters' near frames are
  objects (roofs, plants): break the steps with a planter or a tree's base, or shorten them.
- The hero's reflection still reads as a striped block, not a soft broken mirror.
- The far side layers carry many small windows and read a little busy at the sides. The tiny towers above the hero's
  terraces nearly vanish at phone size.
- The high left cloud is cartoon-round, where the posters' clouds are flatter and more painterly. The sky's paint
  variation is very faint.
- She is now 44 px: readable as the teal figure on the lit pool, but small at phone size. In the film, a push-in or a
  stronger lobby glow would carry her.
- The darks fell to 7 % (posters 9-25 %): the airier world traded some punch. The darks now live in the hero's glass,
  the shed, the boats and the people.

## The owner's verdict on still_v2 (2026-10-29)
"I don’t like this we are going away in style i think it’s too cheap looking / And I’m not sure you can do much about
it in terms of actual video / I think our references point should be closer to the original like where a person would
be about this size / So I think our initial angle snd the view frankly wasn’t bad" (sent with three references, now
`video/docs/look/refs_human_scale/`, and the Cape Town poster).

-> still_v3 goes back to v2's own eye-level angle and view and our own v2 look, built in our Remotion engine (so it
can move), with her near the camera at the references' size (~15-30 % of the height), the vast evening world beyond.
Kept from v1-v2: the near/far separation, a full street across the water, a sky with things in it, subtle near
nature. The designed view is on hold. The general rule: playbook "DEPTH AND SCALE FROM A HUMAN VIEWPOINT" (it replaces
"DEPTH IS AIR AND DISTANCE").

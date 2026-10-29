# Composition and the one focus (look lens 4): the city-poster study

Lens: frame structure, the one hero (the owner's "focus": "i want us to experiment more with the style and the focus on
our videos"), framing, the sky and title zone, the 9:16 mapping, shots, the cover. Analysis only, not a rule change:
`video/docs/look/DIRECTION.md` and the playbook stand until the owner approves. It builds on `perspective.md` (the designed
view is a stack of cameras; near looks near), `pro_1_depth.md` (the plane ladder, the far anchor in 9:16),
`pro_2_hierarchy.md` (the finish ladder; its hero boxes are reused here), `style.md`, and `layout.md` (Part A's zones and
numbers are used as they stand; §4 answers its Part B questions (a), (c), (d)). Script:
`video/scripts/look/posters/composition.py`. Sheets: `img/composition_structure.jpg` (the grid, the thirds, the open-sky
line, the title, the icons, the lines that aim at the hero), `img/composition_focus.jpg` (CRAFT §b salience),
`img/composition_916.jpg` (three posters extended and cropped into 9:16 with our zones and Pip's spot; v2 S1 and S5 as
built), `img/composition_cover_grid.jpg` (our three covers and three posters as 360-px grid tiles).

## Top findings
1. **The posters' hero is big and quiet; v2's subject is small and loud.** The hero is the biggest of 3-5 icons in 6 of 7
   posters (1.4-3.5x the next, median 2.4x; 4-21 % of the frame, median 15 %), and its box's ring is 34-60 % open sky in 6
   of 7. Yet CRAFT §b's salience puts its peak (the top 1 %) on the hero in only 2 of 7 (Copenhagen, Kyoto); in the other 5
   the bottom third holds 71-100 % of the peak (saturated near houses, flowers, leaves). v2's subjects lead per pixel
   (x1.8-2.5, 45-70 % of the peak on them) but cover 1.4-4.6 % of the frame (S5 16.8 %) and touch no sky. For our films:
   big AND loud.
2. **One sky, one hero, one near frame, and all the calm in the sky.** Open sky 36-53 % (median 44), the city filling the
   lower 44-61 %, 73-90 % of the detail in the lower half, dark bottom corners (L* 44 / 53 against the frame's 83), and only
   1-3 % of the frame calm below the skyline. v2: sky 32-39 %, 53-62 % of the detail low (S5 77), light bottom corners
   (~72 / 74) and 19-31 % calm below the skyline: two quiet fields (the sky and the ground), the weight floating mid-frame.
3. **A poster maps onto 9:16 by extension, never by crop.** At full width with its top edge on the band's top (y 300), its
   title lands inside our caption block (y 434-500) in 7 of 7, its tallest top at y 605-832 (>= 600 in 7 of 7), its hero in
   the read zone in 6 of 7, its darkest near frame under the bottom UI; we add ~300 px of sky above. Cropped to fill, the
   title falls under the top UI (y 181-268), a tower cuts the band in 6 of 7 and a quarter of the width goes. Right-third
   heroes (Hanoi, Kyoto) land under the rail: centre or left third only.

**The owner's feelings:** findings 1-2 give feeling 2's "main parts that stand out" its composition (size, height, sky) and
feeling 1's depth its three bands; they answer "the focus", observation 6 (layout) and 7 (the designed view is also a
stack of icons: §3). **Not named by the owner:** the quiet hero, the one quiet field, the extension rule, the rail's
right third.

## 0. How it was measured
- `python3 -I video/scripts/look/posters/composition.py all` (~20 s; numbers to `/tmp/posters-composition/composition.json`,
  sheets to `img/`); `... frame STILL.png --subject x0,y0,x1,y1 --out overlay.jpg` runs the same on one 1080 x 1920 still
  (the check proposed in L8).
- Posters at 1080 px wide (content rows only), `ui_mask.json`'s boxes grown by 24 px (03's pill box is ~25 px short of the
  pill), the title box (+12 px) left out of every detail and salience number, as our caption block is. v2: 8 stills from
  the G7 master (S1 5.2 = the cover frame, S2 9.0, S3 14.0, S4 17.5, S5 23.4 = the crane end, S6 26.0, S7 30.5, S8
  36.0), the caption block (y 299-600, x 95-985) left out. Covers: `deliverables/cover.png` (v1), `v2/v2r_cover.png`,
  `v3/cover.png`.
- **Open sky** = the region joined to the top edge without crossing a colour step > dE 6 (over 6 px, sigma 2);
  **skyline** = per column the lowest open-sky row (its median; the tallest top = its 2nd percentile); **detail** = the
  L* gradient; **calm** = local contrast (|L* - Gaussian 16|, 31-px mean) < 2; **corners** = median L* of each 20 % x 20 %
  corner; **salience** = CRAFT §b's formula (`scripts/qa/retro_tools/hierarchy/analyse.py`: 540 wide, peak = p99; "lift" =
  the box's mean over the rest's), with a spectral-residual map (Hou & Zhang 2007) as a second opinion; **lead lift** = the
  share of oblique segments (LSD, 12-78 deg, >= 40 px, outside the sky and the hero) whose line crosses the hero's box
  (+3 % W), over the same share for that box at 200 random spots (1 = chance).
- Boxes: the heroes and A/B icons are `pro_2_hierarchy.py`'s (the lenses agree); the icons marked * were placed here from
  the contact sheets (+-15 px, est.). Limits: a box is a rectangle (a thin hero like the Obelisco shares it with sky); a
  salience map is a proxy for an eye, not eye tracking; LSD sees drawn edges, not implied lines (an avenue of trees).

## 1. What the posters do: the frame's structure (`img/composition_structure.jpg`)
| Poster | open sky | skyline median / tallest top (% H) | title y (% H), caps px | hero: x, y, w, h (% of frame), area | lower half: detail / stuff | calm (below the skyline) | bottom corners L* (frame) | lead lift |
|---|---|---|---|---|---|---|---|---|
| Singapore | 40 % | 42 / 21 | 11.3, 16 | MBS 19, 40, 53, 24: 13.5 % | 80 / 83 % | 41 % (3) | 43, 51 (83) | 0.74 |
| Reykjavik | 53 | 56 / 26 | 10.5, 19 | Hallgrimskirkja 4, 25, 40, 45: 18.7 | 87 / 95 | 51 (1) | 58, 48 (83) | 0.78 |
| Hanoi | 37 | 39 / 25 | 14.0, 24 | One Pillar 56, 51, 42, 34: 15.0 | 73 / 78 | 35 (1) | 30, 53 (67) | 1.19 |
| Buenos Aires | 48 | 52 / 27 | 9.4, 18 | Obelisco 46, 25, 9, 43: 4.2 | 90 / 93 | 44 (1) | 44, 54 (87) | 0.09 |
| Cape Town | 41 | 41 / 37 | 13.9, 16 | Table Mountain 0, 37, 100, 20: 20.9 | 84 / 85 | 40 (2) | 45, 58 (77) | 0.66 |
| Copenhagen | 53 | 55 / 25 | 12.8, 30 | Nyhavn 0, 44, 62, 31: 20.0 | 89 / 94 | 49 (1) | 45, 61 (84) | 0.89 |
| Kyoto | 44 | 47 / 33 | 12.5, 20 | Kinkaku-ji 53, 45, 44, 24: 11.1 | 86 / 90 | 42 (1) | 22, 51 (75) | 0.81 |
| **median** | **44** | **47 / 26** | **12.5, 19** | **15.0 %** | **86 / 90** | **42 (1)** | **44, 53 (83)** | **0.78** |

- **Three bands: light on top, weight below.** The open sky takes the top 36-53 %; the title sits inside it at 9-14 % of
  the height, about a quarter of the way down the sky; the heroes rise out of the skyline into it (tallest tops at 21-37 %);
  below the skyline the frame is full: 73-90 % of the detail and 78-95 % of the non-sky pixels lie in the lower half.
- **All the calm is the sky.** Calm areas cover 35-51 % of the frame and all but 1-3 % of it is sky: below the skyline
  nothing is flat (water carries reflections, grounds are patchwork). The sky itself holds soft things inside it (pale
  ghost blocks in Singapore and Reykjavik, the aurora, Cape Town's cloud bank) at steps under dE 6.
- **Repoussoir: dark bottom corners.** The bottom corners' median L* is 22-61 (median 44 left, 53 right) in frames of 67-87:
  leaves, proteas, roofs, a rail, a rock, cut by the edges (perspective §1.4 measures the masses: 59 % of the bottom fifth).
  The top corners are sky.
- **Diagonals do not aim at the hero.** Drawn oblique lines cross the hero's box no more often than chance (lead lift
  0.09-1.19, median 0.78; only Hanoi's bridge and shore sit above 1). Receding lines run to vanishing points at or beyond a
  side edge (perspective finding 3); the implied leads (Buenos Aires' avenue of trees and blocks toward the Obelisco's hidden
  base) are rows of objects, not lines. The eye finds the hero by the sky (§2).
- **The hero's place:** centred in 3 (Singapore 0.46 W, Buenos Aires 0.51, Cape Town full width), on the left third in 2
  (Reykjavik 0.24, Copenhagen 0.31), on the right third in 2 (Hanoi 0.77, Kyoto 0.75); its centre at 0.46-0.68 of the
  height (median 0.52): it stands in the middle band with its top in the sky.

## 2. What the posters do: the one focus (`img/composition_focus.jpg`)
| Poster | the biggest icon? (vs the next) | top above the skyline median (% H) | ring open sky | CRAFT salience: share on area, lift, peak on the hero | spectral residual: share, top 5 % on the hero |
|---|---|---|---|---|---|
| Singapore | yes (1.5x Supertrees) | 2 | 34 % | 16.5 % on 13.5 %, x1.26, 0 % | 14.4 %, 15 % |
| Reykjavik | yes (2.8x Harpa) | 31 | 58 | 15.5 on 18.7, x0.79, 0 | 14.8, 3 |
| Hanoi | yes (3.5x the cyclo) | -12 (below) | 0 | 19.9 on 15.0, x1.41, 0 | 27.6, 56 |
| Buenos Aires | no (the Casa Rosada is 3.1x) | 27 | 60 | 3.8 on 4.2, x0.91, 0 | 1.9, 0 |
| Cape Town | yes (1.4x Bo-Kaap) | 3 | 49 | 17.7 on 20.9, x0.81, 0 | 15.7, 0 |
| Copenhagen | yes (2.9x the mermaid) | 11 | 46 | 36.0 on 20.0, x2.24, 100 | 34.4, 33 |
| Kyoto | yes (2.1x the pagoda) | 2 | 34 | 18.7 on 11.1, x1.84, 93 | 16.5, 17 |

CRAFT §b's frame checks on the posters: peak/median 1.97-4.29 (median 2.86; Hanoi 1.97 and Kyoto 2.05 under the 2.4
floor), median salience 0.62-1.39 (<= 1.4: pass), top-10 % mass 20-27 % (>= 19 %: pass).
- **Geometry makes the hero obvious.** It is the biggest icon in 6 of 7 (1.4-3.5x the next, median 2.4x), its top rises
  above the skyline's median in 6 of 7, the ring round its box is 34-60 % open sky in 6 of 7: a big silhouette on the plain
  sky, often as pale as the air (Hallgrimskirkja's and the Obelisco's boxes sit within dE 1-2 of their rings: they read by
  their edge, pro_2's "clean silhouette"). Centre or a third helps; lines don't (§1).
- **Contrast does not.** The salience peak sits on the hero in 2 of 7 (Copenhagen 100 %, Kyoto 93 %); per pixel the hero is
  under the frame's average in 3 (Reykjavik 0.79, Cape Town 0.81, Buenos Aires 0.91). In the other 5 the bottom third holds
  71-100 % of the peak (74-94 % in the bottom fifth in Singapore, Reykjavik, Buenos Aires): the saturated near frame or a
  second icon there (La Boca 92 % of the peak, Bo-Kaap 67 %). The spectral residual agrees: the hero holds a third or more
  of its top 5 % only in Hanoi and Copenhagen. A held poster can afford it: the title names the place, the eye has seconds.
- **Two kinds of hero.** (a) *The tall quiet hero* (Hallgrimskirkja, the Obelisco, Table Mountain, MBS): the tallest, pale,
  alone in the sky, its colour peak spent on the near frame. (b) *The loud hero with a far tall partner* (Nyhavn with Our
  Saviour's spire, Kinkaku-ji with the pagoda): the biggest, warmest, most saturated mid-plane block holds the peak (93-100 %)
  while a taller, farther icon gives the scale. Hanoi's is a near hero with no sky (the spectral residual's pick: 56 %).
  Only (b) has DIRECTION rule 2's shape ("A ... owns the contrast, the hero colour").

## 3. The capriccio: one hero among several icons
Each poster composes 3-5 of one city's landmarks into a view no camera could take (perspective finding 1: a stack of
cameras, heroes drawn 1.4-3.6x one camera's size). This lens adds how the icons share the frame (area % of frame, top as %
of H, plane and side by eye):

| Poster | icons |
|---|---|
| Singapore | MBS 13.5 (40) mid, centre · Supertrees* 9.0 (44) mid, right · ArtScience* 2.4 (54) mid, left · Merlion 1.9 (61) near, right |
| Reykjavik | Hallgrimskirkja 18.7 (25) mid, left · Harpa 6.8 (62) mid-near, right · Sun Voyager* 2.0 (77) near, centre |
| Hanoi | One Pillar 15.0 (51) near, right · cyclo 4.3 (79) near, left · Huc bridge 3.3 (65) mid, left · Turtle Tower* 0.4 (52) far, centre |
| Buenos Aires | Casa Rosada 13.0 (61) near, right · La Boca 10.5 (59) near, left · domed palace* 4.6 (31) mid, left · Obelisco 4.2 (25) far, centre |
| Cape Town | Table Mountain 20.9 (37) far, full width · Bo-Kaap 15.0 (51) near, right · protea 9.4 (78) nearest, left · lighthouse* 0.4 (61) mid, left |
| Copenhagen | Nyhavn 20.0 (44) mid, left · mermaid 6.9 (68) near, right · spire 3.3 (21) far, left · round tower 1.8 (51) mid · Marble Church* 1.8 (53) far, right |
| Kyoto | Kinkaku-ji 11.1 (45) mid, right · pagoda 5.3 (28) far, left · torii 4.4 (65) near, left |

- **One icon per plane, sides alternating.** No two icons share a plane and a size; the next-biggest sits on another plane
  and on the hero's other side (Reykjavik, Hanoi, Copenhagen, Kyoto), or the icons flank a centred hero left and right
  (Singapore, Buenos Aires, Cape Town). In 5 of 7 the two leaders pair a tall shape with a wide one (the Obelisco and the
  Casa Rosada, Hallgrimskirkja and Harpa, the spire and Nyhavn, the pagoda and Kinkaku-ji, Bo-Kaap's stack and the mountain).
- **Size order is the hierarchy.** The hero is ~2.4x the next (median); the tiny ones (the Turtle Tower, the lighthouse:
  0.4 % each) work as scale cues more than icons. Buenos Aires keeps a thin hero by height (the highest top, 25 %), the
  centre and the open sky round it (60 % of its ring).
- **The cost is a split focus.** In 2 of 7 a second icon owns the salience peak, in 3 the near frame does: the viewer tours
  the poster. In a 2-4 s shot that is what the owner rejected in v3: "too many moving parts and I'm not sure what to keep my
  attention on".

## 4. 9:16: extending a 3:4 poster into our frame (`img/composition_916.jpg`)
Two placements against `layout.md` §1's zones (organic and ad UI; the band y 290-600 and the block y 317-556; the read zone
x 120-880, y 600-1250; the subject axis x 380-700). Sheet: Buenos Aires, Reykjavik, Cape Town each way, v2 S1 and S5 as
built; all 7 in the JSON.

| Poster | EXTEND (full width, top edge at y 300): title y, tallest top y, hero y (centre), hero x, area | the sky behind the block: dL* across its rows, ink contrast | CROP to fill: title y, tallest top y |
|---|---|---|---|
| Singapore | 463, 605, 875-1227 (1051), 208-785, 9.8 % | 3.0, 11.1:1 | 218, 407 |
| Reykjavik | 452, 676, 656-1301 (979), 40-476, 13.6 | 1.7, 11.6 | 202, 502 |
| Hanoi | 499, 659, 1025-1516 (1271), 604-1061, 10.8 | 1.4, 13.4 | 268, 484 |
| Buenos Aires | 434, 681, 652-1254 (953), 500-600, 2.9 | 0.4, 14.1 | 181, 517 |
| Cape Town | 500, 832, 837-1127 (982), 0-1080, 15.1 | 0.7, 11.1 | 267, 713 |
| Copenhagen | 484, 661, 931-1375 (1153), 0-672, 14.4 | 3.1, 11.1 | 246, 482 |
| Kyoto | 480, 771, 945-1294 (1119), 571-1048, 8.0 | 1.3, 13.5 | 241, 632 |

- **Extend works.** At full width a poster is ~1080 x 1438. With its top edge on the band's top (y 300) its title lands
  inside the caption block (y 434-500) in 7 of 7, so the caption takes exactly the title's place; the tallest top lands at
  y 605-832 (>= 600: 7 of 7); the hero's centre falls in the read zone in 6 of 7 (Hanoi's at 1271, just under); the last
  14-15 % of the poster, its darkest near frame, lands under the bottom UI (y > 1520), where masses may run (layout §1),
  with 182-206 px more near frame to draw below; above, ~300 px of sky to add (the top gutter, where a hero cloud or a
  branch frames: COZY_AND_SCALE 3b.2). The open sky then runs from the frame top to y ~860-1105 (45-58 % of the frame), and
  the hero is 290-645 px tall.
- **The sky-as-band idea holds, with one condition.** The band is open sky in 7 of 7 (97 %; the rest is the masked
  counter), its L* >= 81 and the caption ink reaches 11.1-14.1:1 (>= 7:1). But across the block's rows the posters' skies
  change by dL* 0.4-3.1 (median 1.4): 4 of 7 meet our "flat to dL* <= 1.5" (Buenos Aires, Cape Town, Kyoto, Hanoi),
  Reykjavik (1.7), Singapore (3.0) and Copenhagen (3.1) don't; v2's sky beside its captions: 0.06-0.10. Take the poster's
  sky flattened inside the band: its gradient lives above y 290 and below y 600.
- **Crop fails.** Scaled to fill the height, 25-26 % of the width goes; the title falls to y 181-268, right under the top
  UI; the tallest top lands at y 407-713, inside the band in 6 of 7 (a spire or tower through the captions: rule 10).
- **The hero's side: centre or left.** The right-third heroes (Hanoi x 604-1061, Kyoto 571-1048) run under the organic rail
  (x > 950, y 900-1500) and the ad rail (x > 780 from y 840); the left-third ones (Reykjavik x 40-476, Copenhagen 0-672) and
  the centred ones stay clear. Our subject axis (x 380-700) is the centre; the left third is the free second spot.
- **Pip:** hidden in the busiest 60-px spot of y 700-1480, x 140-760, >= 250 px from the hero (the purple ring: La Boca's
  windows, Reykjavik's roofs, Cape Town's harbour): in the near patchwork, never in the sky, the band, the rail or the hero.
- **For `layout.md` Part B:** (a) the posters' title zone maps onto our caption block once the poster's top sits at the
  band's top: no new zone, and the cover keeps the same place (§6); (c) the hero: centre (x 380-700) or the left third
  (x ~200-450, est.), never the right third below y 840; (d) what survives 9:16: the three bands (the sky down to the hero's
  shoulders, the hero standing in the read zone, the near frame under the bottom UI), the extension, the dark bottom
  corners; what doesn't: the crop, the right third, a steep sky in the band.

## 5. Many shots, not one
A poster is one held frame; our films are ~8 shots joined by carriers (DIRECTION rule 1), cozy for >= 50 % of the runtime
with 1-2 scale moments (rule 7).
- **Where the poster frame fits.** Its sky (36-53 %; 45-58 % once extended) is COZY_AND_SCALE's "exposed" dose (sky >= 36
  %), not the cozy doses (one opening of 15-30 %; sky ~30 % at the baseline). So it fits (1) the scale moment's landing
  (CG S1 / S5; rule 7: "a world that keeps going past every edge, a landmark huge yet far, tiny anchors, a big sky"),
  (2) the establishing view of the city the home place
  sits in, before the camera settles into the cozy shot, and (3) the cover (§6): 1-3 frames a film. v2's S5 end frame is one
  already (§7).
- **Where it doesn't:** the cozy home (masses on 2-3 sides, one opening), close shots (an object >= 60 % W), charts (paper
  straight-on), a figure-led street (the head on the eye level at 0.50-0.60 H: perspective §4's table).
- **A far landmark can carry a join.** A far hero hardly moves while the near world changes (pro_1 §3.3: parallax ~0 for the
  far anchor); kept at the same screen spot (+-8 %) and size (+-20 %) it IS a B thread match across a cut between two near
  places of one city: the near frame changes, the landmark holds. Cap: never three wides in a row sharing a centred landmark
  (layout §2, "angle"); change the near frame's size or side at each such join.
- **Frame 0 as the poster being drawn** (rule 9). Extended, a hero is 290-645 px tall: drawn in the clean pen it is a bold
  event a scrolling thumb sees; then the patchwork lands as flat pale blocks, the colour floods, and the first spoken line
  pops in the band where the poster's title would be (no title: the playbook). It fits when the landmark is the hook's
  subject; otherwise the poster frame is S1's landing after the hook ("nothing scale before 3 s unless the move IS the
  claim": layout §2).

## 6. The cover and the grid (`img/composition_cover_grid.jpg`)
- **The posters' title** is the city's name in small letter-spaced capitals: caps 16-30 px at 1080 wide (1.1-2.1 % of the
  height), 17-51 % of the width, at 9-14 % of the height in the open sky. On a 360-px grid tile that is 5-10 px: unreadable
  at a glance. Our covers' letters: 50 (v1), 61 (v2), 50 (v3) px at 1080, 17-20 px on the tile. Keep our caption-type title
  (playbook; layout §5); the posters' title is a print convention.
- **What the series teaches:** the posters are one frame repeated (the name at the same height in the same type, ~44 % open
  sky, one landmark touching it, a dark near frame) with a new hero each time: the grid reads as one series because the
  frame repeats and the subject changes. v2's cover already has the frame (its title in the sky above the roofline, layout
  §5; sky 34 %), but its subject is 4.6 % of the frame and touches no sky (lift x2.21, 64 % of the peak on it).
- **A poster-like cover:** the core line in the sky as now, the film's own A drawn big under it (~8-15 % of the 9:16 frame,
  est. from the extended posters) with open sky round its top, the near frame dark at the bottom, all inside the 4:5 crop
  (y 285-1635); the hero changes per film, the frame doesn't (ONE LOOK, ONE BRAND, still evolving: refined film by film).
  Pip on the cover stays layout §6 row 16's question.

## 7. Where our films stand (v2 first)
| v2 still | open sky | skyline median (% H) | lower-half detail | calm below the skyline | bottom corners L* | salience peak/median | subject: area, lift, peak on it |
|---|---|---|---|---|---|---|---|
| S1 5.2 (cover frame) | 34 % | 32 | 57 % | 23 % | 66, 69 | 2.94 | her + the door: 4.6 %, x2.24, 68 % |
| S2 9.0 | 33 | 34 | 62 | 21 | 68, 75 | 3.53 | |
| S3 14.0 | 32 | 32 | 62 | 19 | 76, 75 | 2.43 | her window: 1.4 %, x2.51, 70 % |
| S4 17.5 | 33 | 31 | 61 | 23 | 74, 74 | 2.66 | |
| S5 23.4 (crane end) | 39 | 41 | 77 | 19 | 57, 57 | 3.60 | the Pentagon + plaque: 16.8 %, x1.84, 45 % |
| S6 26.0 | 39 | 40 | 62 | 28 | 73, 87 | 5.28 | |
| S7 30.5 | 35 | 39 | 58 | 27 | 74, 71 | 3.82 | |
| S8 36.0 | 33 | 32 | 53 | 31 | 72, 73 | 3.68 | |
| **posters (median)** | **44** | **47** | **86** | **1** | **44, 53** | **2.86** | **15.0 %, x1.26, on the hero in 2 of 7** |

- **The band is already the posters' sky.** v2's mint sky holds every caption, flat (dL* 0.06-0.10 across the block): the
  posters' sky-and-title structure in our format. Its skyline sits higher (31-41 % vs 39-56 %): the city takes about two
  thirds of the frame.
- **The focus is clear but small.** In S1 and S3 the subject leads per pixel (x2.2-2.5) and holds 68-70 % of the peak:
  clearer than 5 of the 7 posters by CRAFT's measure; but it covers 1.4-4.6 % of the frame and none of its ring is sky, so a
  glance finds the brightest spot, not a landmark. S5 is split: 45 % of the peak on the Pentagon and its plaque, 55 % on
  the sun disc.
- **Two quiet fields and a light bottom.** 19-31 % of each frame is calm below the skyline (the paving, the water; posters
  1-3 %), the bottom corners are light (57-87, medians ~72 / 74; posters 44 / 53), and 53-62 % of the detail sits in the
  lower half in 7 of 8 shots (posters 73-90). The weight floats in a middle band between two pale fields: the composition
  side of perspective's "the near reads far" and pro_2's "big areas with nothing to read".
- **S5's crane end is the poster frame we already made:** sky 39 %, the subject 16.8 % (the posters' median 15 %), dark
  cherry corners (57, 57), 77 % of the detail low. Its subject runs under the right rail (x 322-1080) while its key read
  (the plaque, x 446-764) stays in the read zone: a mass under the rail, which the zones allow.
- **v1 and v3** (perspective §2, layout §5): v1's centred one-point streets frame both sides with lined walls; v3 is
  interiors; all three covers put the title on the band's flat field, as the posters do.

## 8. Lessons, ranked, with "In our films"
**L1. The poster frame for the establishing view and the scale landing: one sky, one hero, one near frame.** *What:* in
9:16, open sky from the frame top to the hero's shoulders (~45-58 % of the frame, the band inside it, flat), the hero
standing in the read zone with its top at y >= 600, centred or on the left third, >= ~80 % of the detail in the lower half,
the bottom corners dark (L* <= ~55) under the bottom UI. *Evidence:* §1, §4, v2 S5. *In our films:* a "poster frame" row
in layout.md §2 (CG S1 / S5 keep their moves; this is their end frame, and the establishing view's), drawn at G3 as that
panel, checked by `composition.py frame` (L8); in motion the parallax float keeps the sky and band still and moves the near
frame most (DIRECTION 8); on a phone its shapes are big. *Cost:* M. *Risk:* every opening on one template reads as a
formula (vary the hero's side and the near frame per film); an extended sky can read empty (the top gutter keeps its
framing object). *Clash:* none: it is the exposed dose, 1-3 frames a film; rule 7's cozy home (>= 50 %) stands.

**L2. The hero big AND loud.** *What:* in a place-led shot the landmark A is the biggest icon (>= 2x the next), ~8-15 % of
the frame (est.: the extended posters without the thin Obelisco), its top in open sky (>= 30 % of its ring), AND it owns
the contrast and the salience peak (rule 2; CRAFT §b), as Copenhagen and Kyoto do: kind (b) of §2, never the quiet hero.
*Evidence:* §2, §7. *In our films:* CRAFT §b's check adds, for place-led shots, A's area and A's ring of open sky beside
"the peak on A"; the near frame stays tier C (dark in value, low in chroma and local contrast), so it frames without taking
the peak, which the posters' near frame takes in 5 of 7. *Cost:* S (check), M (re-tuning a set's near palette). *Risk:* a
big hero crowds a figure-led beat: place-led shots only. *Clash:* if the owner says yes to perspective's open question 3
(a near frame above tier C's contrast cap), its chroma must stay low or the peak leaves A.

**L3. One quiet field: all the calm in the sky.** *What:* below the skyline nothing flat over ~5 % of the frame (posters
1-3 %, v2 19-31 %): ground and water carry joints, reflections, patchwork or near masses. *Evidence:* §1, §7. *In our
films:* LIFE_AND_DENSITY §0's "one quiet field" gets a number in the composition check (calm below the skyline <= 5 % when
the sky is the field), beside pro_2's emptiness check (no C region over 5 % under 8 shapes per 10,000 px) and perspective's
open ground <= 15 %. *Cost:* S. *Risk:* a busy bottom in motion (the near frame moves most in a float): keep its detail big
and low in contrast.

**L4. Into 9:16 by extension, never by crop; the hero centre or left.** *What:* compose a poster-like view at full width
with its top edge on the band's top (y ~300), ~300 px more sky above and ~200 px more near frame below; never crop a 3:4
view to fill; a landmark hero centred (x 380-700) or on the left third (x ~200-450, est.), never on the right third below y
840 (the rail). *Evidence:* §4. *In our films:* layout.md Part B (a), (c), (d) as in §4; the G3 board's frame template;
`composition.py frame --out` draws the zones over any still. *Cost:* S. *Risk:* low; a left-third landmark pulls the eye off
the caption's centre (x 520): the establishing frame only.

**L5. The capriccio as a sequence: one icon per beat.** *What:* a film may visit several of a place's icons, each the A of
its own beat (the others B or C: <= half the hero's area, another plane, the other side, a contrasting shape), the
establishing frame with exactly one A; a far landmark at one screen spot carries a B match (§5). *Evidence:* §3, §5. *In
our films:* W1 lists the place's icons and gives each a beat or cuts it (which icons is content: the owner, "more specific
to the content rather that the style and composition"); G3 checks one A per panel; CRAFT §a lists the far landmark as a
B-match pattern. *Cost:* S. *Risk:* a tour of sights reads as a list of facts (the playbook: one story); never three wides
in a row on a centred landmark.

**L6. The cover as the series' poster.** *What:* one cover frame for every film: the core line in the sky in our caption
type (17-20 px letters on a 360-px tile, never the posters' 5-10 px caps), the film's A big under it (~8-15 %, est.) with
open sky round its top, the near frame dark at the bottom, all inside the 4:5 crop. *Evidence:* §6. *In our films:* the
proposed LAYOUT.md §5 template gains the hero's size and sky; checked at 360 px. *Cost:* S. *Risk:* low; the owner's "our
look is evolving ... i don't think we can overfixate on this": refined film by film, never frozen.

**L7. Frame 0 as the poster being drawn.** *What:* when the landmark is the hook's subject, frame 0 draws its 290-645 px
outline, the C blocks land, the colour floods, the first spoken line pops in the band; otherwise the poster frame is S1's
landing after 3 s. *Evidence:* §5. *In our films:* a variant in CINEMATIC_GUIDE "The opening"; G3 boards the draw order;
G4's look clip may show it. *Cost:* S. *Risk:* a held poster is a still frame (rule 9): the draw-on is the event, long
enough to register (the owner: ~0.3 s was invisible).

**L8. A composition overlay and check (tool).** *What:* `composition.py frame STILL.png --subject ... --out overlay.jpg`
draws our zones over any 1080 x 1920 still and gives the numbers (open sky, skyline, tallest top, A's area and ring sky, the
salience peak on A, calm below the skyline, bottom corners). *In our films:* promote to `scripts/qa/check_composition.py`
beside framecheck and capcheck, run on the G3 board's establishing and scale panels and at G5, its constants from the one
table layout.md §6 row 19 asks for. *Cost:* M. *Risk:* numbers gamed instead of looked at; salience misreads pale heroes
(§2): the eye check at phone size stays the judge.

**What W1 and the G3 board decide.** W1: the place's icons, the one landmark A of the establishing frame and its side
(centre or left), the far landmark if a join uses it, Pip's hiding spots. G3: the poster frame drawn (the sky to the hero's
shoulders, the hero's box, the near frame's masses), one A per panel, the far-landmark joins, frame 0's draw order. G4's
look clip shows one poster frame in the final style.

## 9. What not to take
- **The quiet hero:** the peak on the near frame or a second icon (5 of 7). It works on a held poster with a title; in a
  2-4 s shot it is the split focus the owner rejected in v3, and it breaks rule 2.
- **The capriccio at once:** 3-5 icons in one frame; take them as a sequence (L5).
- **The crop to fill** (the title under the UI, towers through the band, a quarter of the width lost) and **the
  right-third hero** (under the rail).
- **The posters' title:** tiny letter-spaced caps on the cover (5-10 px on the grid) or any title in the film's frame (the
  playbook: the core line as a title goes on the cover; "Wait why do we have the text repeat itself?", v3).
- **A steep sky in the band** (Singapore 3.0, Copenhagen 3.1 L* across the block): our band stays flat (dL* <= 1.5).
- **A poster frame for every shot:** it is the exposed dose; cozy stays the home feeling (rule 7).

## 10. Open questions for the owner
1. **The establishing frame:** should the home place's establishing view and the scale landing follow the poster frame
   (open sky down to the hero's shoulders, about half the frame; one landmark big against it; a dark near frame at the
   bottom), as v2's S5 end frame already does?
2. **The hero's side:** may a landmark sit on the left third (x ~200-450), as in Reykjavik and Copenhagen, outside our
   subject axis (x 380-700), the right third staying the rail's?
3. **Several landmarks:** one icon per beat with a far landmark as a recurring carrier, or one landmark per film with the
   rest kept in the background?

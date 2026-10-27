# L3 build plan: V2S3 "Her window" + V2S4 "The walk home" (finished quality)

Lane L3's working spec for its builders and critics (2026-10-27). The direction is `docs/v2/TREATMENT.md` (LOCKED; S3/S4 rows,
§3 cast + Pip, §8 fairness, §9 acceptance bar); every position is `src/v2r/world/map.ts` (S3, S4, PIP, MATCHES, UI, LEGIBILITY);
the shared clocks are `src/v2r/scenes/V2S3_rig.ts` and `V2S4_rig.ts` (film seconds; the shots wrap themselves in
`<TimeShift by={-START}>`, so `useTime()` inside is FILM time). The v0 skeletons (`V2S3.tsx`, `V2S4.tsx`) render the kit sets at
the right spots and times; the build replaces them with finished drawing, density and life.

## 0. Rules every part keeps (COMMON.md, TREATMENT; the critic checks each)
- **Files:** L3 owns `src/v2r/scenes/V2S3*.{ts,tsx}` and `V2S4*.{ts,tsx}` only. Never edit a kit, map.ts, palette.ts, lib/, another
  lane's scene, the registry or any doc but this one. A kit defect: work around it in your own files (fork a kit function into
  `V2S4_*.tsx` if needed) and note it for REQUESTS.
- **No reusable assets:** engine tools (`lib/World`, `lib/Fill`, `lib/Ink`, `lib/time`, `lib/rng`, `lib/sketch`, `lib/xf`,
  `lib/exit`, `lib/inkComp`, `lib/persp`, `lib/font`) + the v2r kits (`src/v2r/kit/{canal,cast,pip,boards}`) + map/palette. NEVER
  `src/scenes/**`, `src/v3/**` (except `src/v3/film/kit/idle.ts`), `src/v2/**`, `src/entry-v2*.tsx` (old), `lib/kit`, `lib/cine`,
  `lib/mascot`, the barrel `lib/index`.
- **People small and simple** (reference 1): round heads, tombstone torsos, one accessory; NEVER a face or features, a big model or
  a waist-up shot; near head-backs at most ~140 px WIDE; a figure that carries a story change >= 130 px tall. The public is NEVER
  teal. Walk rates match travel (the feet never slide: `strideFor(stepPx, h)`; on a trucking plane, a walker's walk rate is its
  speed in PLANE coordinates).
- **Colour roles:** teal `CM.hero` ONLY on her (coat, her door, her French-window frame); orange `CM.sun` ONLY the sun disc; plum
  `CM.anchor` small (hair, gunwale stripes, frames, posts, near silhouettes; never a whole hull); shadows are colour (stone shade
  `#C8C3D3`, warm `#8C5E6B`, cool `#6F80A0`), never grey; no beige / tan / olive slabs. Only `CM.*` tokens, never raw hex.
- **Line:** ink by depth 4.8 / 3.4 / 2.2 / 1.6 px, tapered, loose (overshoots, 20-40 % of contours open), only where it carries
  form; never on sky, water, shadows or far planes; flat fills misregistered 2-5 px. No gradient, glow, blur, haze, opacity,
  texture.
- **Frame zones:** nothing in the caption band y 317-556, and y 290-600 stays flat sky (only allowed: sun discs with top >= 575,
  roofs / chimneys / aerials with tops >= 600, flyers clamped at `ceil` 580-600, smoke clamped at 580-600). Key reads (her, the
  tag, the plates, Pip's beats) inside x 120-880, y 600-1250; the right rail (x > 780 below y 840) holds masses only (no text,
  no Pip). Pip never in the band, the rail, or over her.
- **Motion:** seconds (`useTime`), deterministic (`lib/rng` seeds, never `Math.random` / `Date`), 60 fps; drawn poses step at
  12 drawings/s, ambient motion moves every frame; camspeed <= 7.5 px/frame for long flat-ink moves, <= 15 for detailed layers;
  no zoom in a hold; strobe-free (no 1-2 frame flicker of big shapes).
- **Fullness (DENSE-CALM, both shots):** paused at 216 px beside reference 1 / v1 it is as full and specific; no hole > 200 px
  outside the top sky; flat tiles <= 30 %; 12+ props; 3-4 planes; people; >= 2 things cut by an edge; 8+ specific dressing items;
  the y 1250-1920 mass as listed below (never flat paving or bare water). **Life:** >= 2 movers in every frame, something new
  every few frames, no dead run > 0.40 s; no life over lettering.
- **Fairness:** "classified", never "secret"; no protest gesture; she never touches the post; no Google logo / logo colours /
  product anywhere; Pip one reaction per shot (S3: turns to her on "she"; S4: turns west on "heading"), no gag.
- **Performance:** many small things through the kit's `Batch` + `Paint` (one Fill per colour per layer), static batches in
  `useMemo`; a 1080x1920 frame must render in <= ~1 s at --gl=angle.

## 1. V2S4 "The walk home" (film 14.86-20.55; 5.69 s; DENSE-CALM; light `lowSun`: sky `[CM.sky, CM.bandGold]`)
**Lens:** from the water, looking north, trucking WEST (left) with our narrowboat: planes slide RIGHT on screen (`V2S4_rig.ts`:
sun fixed; far roofs 0.3x; terrace backs 0.6x; her towpath + the post 1.0x; the canal strip 1.0x; the near water 2.0x; our boat
screen-fixed). Truck: 110.7 px/s on the path plane to 17.36, then a linear slow-down to a stop at 17.96 (`s4PathDx(t)`: -310 at
the cut -> 0 at the stop; every set is DRAWN at the 17.96 pose and translated by its plane's dx). Push: 1.00 -> 1.06 about
SUN1 (250, 650) 18.40-20.10 (`s4Zoom`, soft landing), locked to the cut. Every plane must cover the frame at every dx (draw each
plane from x -(k x 310 + 60) to 1140).

**Layout at the pose (screen px, zoom 1):**
- y 0-600: flat mint sky (the caption field). The gold band shows only between the far tops.
- **Far band y ~600-860 (0.3x / 0.6x):** SUN1 at (250, 650) r 61.3 (`MAP.S4.sunAtPose`; r 65 after the push), seen THROUGH a
  King's-Cross-like gasholder frame (the lattice slides across the disc with the 0.3x plane: a parallax cue); far roof rows in flat
  depth steps, chimney stacks with pots, aerials with birds, the viaduct with a train crossing; the terrace BACKS (0.6x) over garden
  walls: rear windows (a few warmly lit), back extensions, drainpipes, a washing line flapping, a tree in autumn leaf, ivy,
  pigeons on a wall. All tops >= 600. Long low-sun shadows fall to the EAST (screen right) as colour (`shadowInto`, light at SUN1).
- **Her towpath y 860-1082 (1.0x):** paving that is never flat, garden walls / gates at the back (y ~860-990), heritage lamp
  posts (off), a bench with a seated reader (page turns), planters, a bin, a parked bike, a lifebuoy on a post, mooring rings and
  bollards on the coping (y ~1082), leaves; walkers (see life). **The fingerpost** on this plane (section 1b).
- **Her** (screen-fixed, x 720, feet 1070, 170 px, walking LEFT in profile; `Her` pose walk view profile, `step = s4HerSteps(t)`,
  `stride = strideFor(62, 170)`); from 17.96 `stopLook` (head lifted toward the plates). She stays whole and >= 170 px.
- **The canal strip y 1082-1220 (1.0x):** water (`Water`, ripples, glints, broken reflections of the backs), two ducks, a heron
  on the coping or a mooring post, floating leaves.
- **Our narrowboat (screen-fixed), the bottom third:** roof edge y ~1220 with roof dressing standing on it (herb pots with
  herbs that flutter, a folded bike, a coiled rope, a watering can, a mop / boat pole, a stove chimney with smoke rising to
  <= y 600, a lifebuoy), Pip riding at (470, 1218); cabin side y 1290-1660 in SAGE, never a flat slab: panel beading, brass
  mushroom vents, cream portholes with curtains that sway (a pot plant behind one), a painted flower panel (roses-and-castles
  spirit, NO lettering), side doors, ONE plum gunwale stripe, rope fenders hanging, a slate hull strip to the waterline ~1700;
  the boat is cut by both edges. Same livery as V2S3's moored boat (it is the same boat): sage cabin, plum stripe, cream
  portholes, the flower panel, herb pots, bike, rope.
- **Near water y 1700-1920 (2.0x):** wake lines and ripples streaming right, floating leaves, the hull's broken reflection,
  glints; after the stop the wake calms but the water never stops.

**1b. The fingerpost** (`V2S4_post.tsx`, on the path plane; the post at x 575): ONE heritage post (plum `CM.anchor` or the warm
`CM.line`, ~14-16 px wide, a finial on top) from y 735 to its foot / plinth at y 1060, visible from the cut (it rides in from x
265 to 575). Bare until its plates build (two small empty collars may hint where they go). Two ARROW plates pointing WEST
(tip at x 110), stacked in time order, paper face (`CM.paper`) with a plum keyline / ink edge, ink lettering (`WorldText`,
`TXT_PLATES` from `kit/boards/texts.ts`; never retype):
- DEC plate x 110-560, y 755-855 (tip (110, 805); body x 140-560): "DEC 2025" 56 px at x 140 baseline 807 (faux weight ~0.9) +
  "unclassified work" 31 px at x ~350 baseline 807; credit "Gemini on the Pentagon's GenAI.mil · Fox Business; Decrypt" 18 px
  at x 140 baseline 840 (measured: 196 + 14 + 191 = 401 px and 385 px: both fit x 140-550).
- APR plate x 110-560, y 865-965 (tip (110, 915)): "APR 2026" 56 px at x 140 baseline 917 + "classified work" 31 px at x ~346
  baseline 917; credit "reported by The Information via Japan Times; 9to5Google" 18 px at x 140 baseline 950.
- Builds (fill first, then pen): **18.92 "military"**: the DEC plate knocks onto the post (its face grows out from the post to
  the tip in ~0.12 s with a small overshoot), its edge inks, "DEC 2025" pens ~18.97-19.17, the body ~19.10-19.28, the credit
  ~19.20-19.40. **19.45-19.80**: the APR plate pops at 19.45, "APR 2026" pens 19.48-19.62, "classified work" 19.58-19.72, the
  credit 19.64-19.80: complete ON "heading" (19.80). Nothing moves over the plates once written; nothing else pops near them.

**1c. The name tag** (`V2S4_tag.tsx`, screen-locked above her; drawn inside the push camera; `TXT_NAME_TAG`): a paper card
(`CM.paper`, loose ink outline 2.2 px) on a thin ink leader to her head (`S4_HER_HEAD`). Card x 594-876 (the post at x 575 below
y 735 never touches it). Text left-aligned at x 612:
- **Build 1, 15.07 ("She")**: the card pops (spring) y 600-764; "Sofia Liguori" 44 px (faux weight ~0.9) baseline ~644,
  "research engineer," / "Google DeepMind" / "(Google’s AI lab)" 30 px baselines ~680 / 713 / 746, pen-written fast (all done by
  ~15.55).
- **Build 2, 16.60**: the card grows down to y ~870 (a flap unfolds / the card extends with a spring); "3 years ·" /
  "resigned Oct 2026" 30 px baselines ~784 / 817; "Source: BBC News," / "21 Oct 2026" 18 px baselines ~842 / 861 (two short
  lines so no TEXT enters the right rail x > 780 below y 840).
- **18.80**: the whole tag pops off (shrinks to its centre, 0.12 s). It never covers her; the leader shortens as the card grows.

**1d. Pip** (`S4_PIP` in the rig): the in-leap is mid-air at the cut at ~(580, 1000) descending down-left (LEFT of her, never over
her), lands on the roof (470, 1218) at 14.95 (soft land, the herbs flinch); rides the roof (`ride`, bob + roll); watches her
(head target `S4_HER_HEAD`) while she walks and the tag builds; **19.55 turns west** (facing left: leads "heading"; its one
reaction); **20.25 leaps toward the sun** (0.45 s; mid-air at the cut at ~(293, 721) on screen, over the sun's lower right; its
ears stay below y 556, the arc at y >= 600).

**1e. Story beats (film s):** 14.86 cut · 14.95 Pip lands · 15.07 tag build 1 · 16.60 build 2 · 17.36-17.96 the truck slows, her
steps slow with it (feet honest) · 17.96 she stops ("objected") · 18.06 her head lifts to the post · 18.40-20.10 push · 18.80
tag off · 18.92 DEC plate · 19.45-19.80 APR plate · 19.55 Pip turns west · 19.80 birds lift off the gasholder / roofs and fly
WEST into the sun (their silhouettes cross the disc at y ~620-700; flyers never rise above the kit's `ceil` 580) ·
20.25 Pip leaps · 20.55 cut (SUN1 exactly (250, 650) r 65 on screen).
**Life, always (>= 2 movers in every frame):** walkers she passes (westbound, slower: they drift right on screen and pass behind
her), a jogger who overtakes her, a cyclist eastbound, a dog on a lead, the bench reader, an angler on the coping (float bobbing),
two ducks, the heron (one head turn), boat smoke, chimney smoke, a train on the viaduct, washing flapping, leaves falling and
floating, herbs fluttering, curtains swaying, the wake. After the stop the planes rest but the life does not.

## 2. V2S3 "Her window" (film 12.98-14.86; 1.88 s; DENSE-CALM; light `sunset`: sky `[CM.sky, CM.bandSunset]`, lamps ON)
**Lens:** across the canal from our moored boat, looking north at her terrace front; a flash-forward to the sunset (the picture
S8 catches up to). Camera (`V2S3_rig.ts`): identity at the match (12.98), the 5 % ease-back 13.00-13.60 about W2 (335, 785),
a 10 px/s float west easing in from 13.30. Draw everything over `S3_BLEED` (x -60..1160, y -60..2010).
**The match (12.98):** her French window exactly at `MAP.W2_CUT` (centre (335, 785), 132.5 x 164.3) = S2's W2. The swap pop:
her blind is rolling UP on the first frames (from ~35 % down at 12.98 to fully up by ~13.08, a small spring): S2's blinds came
down, hers goes up (the story point). Lamp on.
**Layout at the match (screen px):**
- y 0-600: flat mint sky; the sunset band only between the tops; **the low sun at left** (`CM.sun`, r ~46, around (96, 652)),
  half-hidden by the terrace's west end (a lower end house / a gap with far roofs and the viaduct), top >= 575.
- **Her terrace y 600-1100:** two storeys + mansard (mansard top >= 602, chimney stacks with pots and aerials, tops >= 600, birds
  on the aerials, one lifts), stock brick in several colours (never one slab), a stucco ground floor here and there, sash windows
  lit / unlit (sunset: ~60 % lit, a few switching), balconies with pots and string lights twinkling, window boxes, doors with
  fanlights and steps, area railings, a bike on the railings, bins, drainpipes. **Her house:** the French window at W2_CUT (teal
  frame, Juliet rail, blind rolled up, the lamp-lit room: a standard lamp, shelves, plants on the sill) with HER full-figure
  silhouette (`HerWindow`, plum, phone at her ear, pacing x 290-380, feet y 862, h 140: >= 137 px at the match, >= 130 after
  the ease-back; her free hand moves at 14.28); her window box x 255-520, y 868-900 (plants; Pip's seat (462, 878) at its right
  end, clear of the window opening); her TEAL door below-left of the window. **Two lit neighbours:** one with kettle steam rising
  from a window, one watering a window box (the can tips, drops fall).
- **Her towpath y ~1100-1128:** coping, a lit heritage lamp, a bench, walkers both ways (small, ~90-110 px), a cyclist.
- **The canal y ~1128-1260:** warm reflections of the lit windows broken in the ripples, a heron on a post, two ducks, glints.
- **Bottom third y 1260-1920:** our moored narrowboat cut by both edges (roof y ~1260-1330: herb pots, a bike, a coiled rope, a
  chimney with smoke; cabin side y 1330-1580: sage, the plum gunwale stripe, cream portholes with curtains, lit warm inside at
  sunset, the flower panel; fenders), our coping (stone edge, a mooring ring with the boat's rope), our towpath y 1640-1920 (paving
  with leaves and a drain), **two walkers' head-backs cut by the bottom (at most ~140 px WIDE each: a beanie, a cap) crossing
  slowly**, and a lamp-post foot cut by the bottom-right (x ~860-960).
**Pip** (`S3_PIP`): continues L2's hop at the match (PIP_HOP_S2_S3; world = screen at 12.98; size 106, seed 'pipS2'), lands on her
window box 13.10 (the plants flinch), settles facing us (frontLeft), **turns to her on "she" (13.90-13.96)**: its one reaction,
then **14.70 leaps up-LEFT** out through the left edge (on screen x 0-120, y 620-700 at 14.86). The leap must pass her window as
briefly as possible: time her pacing so she is at the far (left) end and the pass over her silhouette is <= 2 frames.
**Life, always (>= 2 movers):** her pacing (always), Pip, steam, the watering, string lights twinkling, window switches, birds,
smoke from our boat and a chimney, walkers both ways, the head-backs, the heron's head, ducks, ripples and glints.

## 3. Preview, self-review, QA (always --gl=angle, --concurrency=2)
```bash
E=--entry=src/entry-v2r-film.tsx
GL=angle node scripts/render-frames.mjs Film2R-V2S4 <dir> 0.05,1.0,2.4,3.1,4.0,5.0,5.6 $E --scale=0.5   # shot-local seconds
GL=angle node scripts/render-frames.mjs Film2R-V2S3 <dir> 0.0,0.12,0.6,1.0,1.4,1.8 $E --scale=0.5
GL=angle node scripts/render-frames.mjs Film2R <dir> 12.96,12.98,14.84,14.86,20.53,20.55 $E --scale=0.5          # the cuts (film s)
npx remotion render src/entry-v2r-film.tsx Film2R-V2S4 <out>.mp4 --gl=angle --concurrency=2 --scale=0.5
python3 -I scripts/qa/density.py <out>.mp4 --cozy          # flat, obj, detail, movers, empty
npx tsc --noEmit -p .                                       # typecheck (only your files must be clean)
```
References at 216 px (never commit their frames): `ffmpeg -i assets/ref/reference.mp4 -vf fps=1,scale=216:-2 <dir>/r_%03d.png`
and the same for `deliverables/v1/php2shell_final.mp4`. Look at your frames at 216 px BESIDE them: as full, as specific, as alive.

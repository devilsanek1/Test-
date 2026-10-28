# Video 2 ("One Small Window"): STYLE, the film's VALUES inside DIRECTION

**Values only (conformed 2026-10-27).** The rules are `docs/look/DIRECTION.md`'s (one page; it wins), their numbers, code and checks
`docs/look/CRAFT.md`'s, and this film's thread, places, joins, tiers per beat and light rigs are `THROUGHLINE.md`'s (the through-line card and
world bible). This page only picks v2's values inside them: colours and their jobs, sizes, rigs, clocks, the references. It never restates or
overrides a rule; where it seems to, the higher doc wins and this page is stale (fix it in the same turn). **Which doc wins:** the owner's words
(`docs/OWNER_PLAYBOOK.md`; `v2/OWNER_NOTES.md`, the quoted words) > DIRECTION > CRAFT > `PIPELINE_V2.md` > the gate specs > the look docs
(DIRECTION's intro: the full ladder) > this film's pages: `THROUGHLINE.md` > `TREATMENT.md` (story, words, timings; its fairness §8 binds every
page) > this page > the v1-era docs. Every spot and time lives in ONE contract, `src/v2r/world/map.ts` (K2); every colour in
`src/v2r/palette.ts` (K1, `CM`); the light rigs in `src/v2r/world/rigs.ts`. A lane's orders are its `lanes/conform_<id>.md`. Tags: DIR n =
DIRECTION rule n · CR = CRAFT · TL = THROUGHLINE · TR = TREATMENT · CG / CS / LD / PAL = `docs/look/` CINEMATIC_GUIDE, COZY_AND_SCALE,
LIFE_AND_DENSITY, PALETTE · BM = `direction/beat_map.md` · map / K1 / rigs = the code files above.

## 1. The film in one paragraph, and ten non-negotiables
One London canal on one golden October evening, plus one trip through the sun to an April morning in Arlington: hand-drawn flat colour like
reference 1, drawn with the clean pen and lit gently by one low sun per set; one continuous sky (one gentle OKLab gradient, nearly flat in the caption band, warm at
the sun and the horizon: `lib/sky.tsx`, presets in `src/v2r/world/skies.ts`); small people from behind;
one small woman in teal; her window, the one small window, carrying the story; a new periwinkle Pip at tier B in every shot; one crane that makes
it vast; one flowing story with no plain cut.
1. **New (DIR 3; owner: "Don't rely on reusable assets"):** every set, figure, Pip, prop, life element and the music is made for this film;
   engine, tools and QA come from `src/lib` and `scripts/`; never another film's folder (`src/v2/**`, `src/v3/**`, v1's `src/scenes/**`) and
   never a `lib/cine`, `lib/kit` people or `lib/mascot` drawing piece.
2. **One palette, fixed jobs (DIR 6):** "10 Canal Mint" (§2): teal = HER only, orange = the sun disc only, plum = the ~5 % anchor; a light
   state changes the bands, the lamps and the season, never a fill.
3. **One quiet field (DIR 6, 10):** the sky's caption band y 317-556 stays nearly flat (dL* <= 1.5, the mint key) and nothing is drawn
   in it; above and below it the sky is one gentle gradient (no seam); the bottom third y 1250-1920
   is never quiet and holds things only (map `BOTTOM_THIRD`).
4. **The thread is her window (DIR 1; TL §1.2, §2):** W (S1, S8), M (S2's dark office window = S3's lit home window), S4's far window; the
   owner-approved fairness stretch S5-S7 (20.55-33.00) runs without it.
5. **Every join carries something (DIR 1; TL §3):** A, B, A, A, D, A, D and the loop's B; no plain cut; Pip rides the carrier or keeps its
   spot.
6. **One subject at a time (DIR 2):** each beat's A per TL §4; Pip and the people near the story are B; the canal, Arlington and their slow
   life are C.
7. **The clean line (DIR 4):** the film-wide clean pen (`src/v2r/pen.ts`), every width and line colour by tier (§3); the captions keep the
   dark ink.
8. **Gentle light, always there (DIR 5):** two rigs, one shadow family (§2); no source moves between cuts; never two suns in a frame.
9. **People small and simple (DIR 3; owner: "don't use big models of people"):** reference 1's grammar, no faces; no stranger's back in any
   foreground (§4).
10. **Frame 0 drawn in the clean pen; literal, sourced, fair (DIR 9; TR §8):** §6's frame 0 and loop; each line an event in the world on its
    word; facts on real objects; exact quotes; Google at equal weight; she is never in Washington.

## 2. Colour and light: the palette, and one rig per set
**Palette "10 Canal Mint"** (K1 `CM` = TR §2's hex; `problems()` checks it at render time; CIE L* / C*):
| role | hex (L* / C*) | may go on | NEVER on |
|---|---|---|---|
| sky = caption field | mint `#BCDCCF` (85 / 13) · high step `#CFE6DC` | the sky's key in the caption band (y 317-556, nearly flat), the top of the one sky gradient | anything drawn in y 317-556; a hard seam or a second, unrelated sky colour |
| horizon bands | gold `#F6D9BC` · sunset `#F3C6A6` · dusk mint `#B3CDD2` | the lower stops of the one sky gradient (`lib/sky.tsx` presets in `src/v2r/world/skies.ts`), blending smoothly to the horizon; the far haze = `horizonColor()` | y 317-556; hard steps or seams |
| page (50-80 %) | stucco `#F4E4D2` · paving `#EFD8C2` · limestone `#EEE4D4` · glass `#CDE1DF` · paper `#FBF3E6` | walls, paving, stone, glass, board faces, frame 0's paper: MANY light fills | one empty slab; pure white (glints only) |
| mids | brick `#E3A88C` `#C9806A` `#A5604F` · sage `#AFC4A8` · stone shade `#C8C3D3` | facades, roofs, trees, boat cabins, stone in shade | a field big enough to read as a slab |
| cool (>= 10 % per frame) | water `#9DC6BF` `#7DAEA8` · unlit pane `#5E6F86` | the canal, the Potomac, cool shade, unlit glass | dark water right behind her (only ΔE 24 from the teal) |
| HERO | canal teal `#0B8577` (50 / 33) | HER only: her coat, her front door, her window frame; present on her shots (she is ~0.3 % of a frame, so `problems()`' 5-15 % reads low: expected) | boats, the public, boards, signs, Google, the Pentagon, Pip, props; a bigger her to "fix" the % |
| ANCHOR | plum `#36223A` (17 / 19) | her dark office window, her hair, gunwale stripes, board stiles, the push-through bridge; ~5 % (cap 8 %) | a whole hull; lamps, railings, birds; black; a big dark slab |
| POP (one) | sun orange `#EE6A2E` (61 / 74) | the sun disc only, 1-3 %: SUN0, SUN1, S5's end sun, SUN2, SUN8 | caption boxes, coats, signs, FOR LIFE, props, Google, the Pentagon; a calendar on the disc |
| support | box `#F6B892` · lamp `#F7CF86` `#FBE6C2` · ink `#2B1B0A` · line `#9A563C` · shade warm `#8C5E6B` / cool `#6F80A0` | box = the caption key box; lamp = lit panes, pools, bulbs (flat); ink = the captions and the caption-band words; line = wood, frames, posts, railings; shade warm = the rigs' one tint family | glow or halos; the ink as everyone's line (§3) |
| confetti (< 1 % each, C* <= 45) | leaves `#D6A563` `#B8714F` · blossom `#F3C3CD` · coats `#5E6F86` `#D4A960` `#E6D3B5` `#6E4A5E` · hair `#3E2A3A` `#6B4A3A` `#9A5A3E` `#B9B6C4` `#D9B98A` | people and dressing: many hues in small patches | fields; the hero's or the pop's hue |
| ghosts | paper `#FBF6EE`; whole-head value G1 `#3E2A3A` -> G2 `#7D7387` -> G3 `#A9A5B5` -> G4 `#CFCCD6` -> G5-G6 `#ECEAF0` | S1's row (+ the three bare outlines) and S8's three | any other figure |
| Pip (tier B) | body `#9495C1` (63 / 25) · shade `#73739D` (50 / 25) · inner ear, cheeks, soles `#F2C3CC` (83 / 18) · scarf `#D8C599` (80 / 25); its line (drawn by the pen) `#616389` (43 / 23) | Pip only (body ΔE76 23-50 from every ground; the shade 13 L* under the body) | its hue on anything else; any Pip colour at C* > 25 |
- **Family DNA (PAL; DIR 6):** page L* >= 75, C* <= 20, 50-80 % as many fills · ink L* <= 25 at >= 7:1 on the mint (11.3:1) · ONE hero
  (C* >= 30) · ONE tinted anchor (~5 %) · AT MOST one pop (C* >= 50, 1-3 %); Google and the Pentagon stay quiet stone and brick (no hero
  colour, glow or rim: V3); no beige, muddy tan, olive or grey (page C* >= 4.5; the rejected cut's beige frame 0); greens sage.
- **Loud tokens stay confetti (CS 3b.6):** dressing aims at C* <= 23; the locked tokens at or above the hero's 33 (mustard `#D4A960` 44:
  coats only · leaves `#D6A563` 42, `#B8714F` 39 · lamp `#F7CF86` 42 · line `#9A563C` 37 · hair `#9A5A3E` 36 · brick `#C9806A` 35,
  `#A5604F` 34) go in patches < 1 % each, brick as broken facades and hints, never a field; the pen calms tier B fills to C* <= 25.
- **CM only:** every fill is a `CM` token or a flat mix of two (the dc kit's `mix` / `atm`), the rigs' pool steps aside; never another
  palette's swatches (`colour_meter.py` defaults to Cobalt: pass §5's flags).
- **Pip's tier-B colourway (2026-10-27):** its periwinkle identity kept (hue 292°, as the old `#9497D8`), every colour at C* <= 25 (the
  old body / shade / scarf sat at C* 36 / 41 / 44); on screen the pen calms the body once more (~`#999AC2`, L* 65 / C* 22) and draws its
  same-hue line 20 L* under it.

**Light = story time** (K1 `LIGHT`, `SHOT_LIGHT`): one mint sky in every state; only the bands below y 600, the lamps and the season change.
S1, S2 golden (gold band) · S3 a flash-forward in S8's sunset state (lamp on, blind up) · S4 low sun (gold band) · S5, S6 an April morning
(high step + gold) · S7 = S8 ONE sunset state (sunset band, dusk + sunset late, lamps on: A5).

**One rig per set** (DIR 5; CR §d; TL §5; `src/v2r/world/rigs.ts`: lanes import the rigs, never redefine them):
- **The shadow family, both sets:** `TINT_CANAL` = `CM.shadeWarm` at form 0.20 / cast 0.28 / contact 0.48 (multiply): on the paving
  dL* -9 / -13 / -22, chroma kept, turned toward rose. Never a contact strip on water (it greys): a cast-strength strip at a waterline at most.
- **`RIG_CANAL`** (S1, S2, S3, S4, S7): the low western sun, `sunLight({toward: 15, el: 36})`, casts capped at 0.8 h. On these north lenses
  the sun is at screen LEFT (in frame in S1, S3, S4 and S7; off-screen left in S2): shadows fall right and a little toward us. Pools `#FBE6C2`
  / `#FFF2D9` (two flat steps, +4 L* over the paving); rim `#FFE7BE`; lit panes `CM.lamp`. **`RIG_CANAL_S8`:** S8 looks west into SUN8
  (420, 625): shadows fall toward us (toward 85), backlit form (tops lit, camera-facing sides one step down).
- **`RIG_APRIL`** (S5's start, S6): the same family; the April morning sun at el 40, no pools; the sun at the left (S5's slot, then SUN2):
  shadows right and toward us. **`RIG_APRIL_S5_END`:** after the crane's arc the sun is upper right: shadows left and toward us (toward 165),
  3/4 backlight; S5 switches rigs behind its lamppost wipe (one direction per frame).
- **Every shot:** contact shadows under everything that touches a surface (her, the ghosts, Pip, people, bollards, benches, board legs, lamp
  bases, bikes, planters, tables, bags); casts for people, posts, boards and trees along the key; `FormShade` away from the key (the right side
  on the north lenses); `Shade` one step on planes turned from the sun; rim only on her (S1, S4, S8); lit panes are `LitWindow` (L* 85-92,
  no glow), her lit window adds a `WindowSpill` (S3; S8 from 34.95); S8's lamps add their pools as they light (37.18). The brightest 5 % sits
  on the beat's A; the caption band holds one value; the sky, the sources and the screen-locked name tag stay unlit (CR §d.9).
- **Check:** `scripts/qa/check_light.py` on an A/B (`--props='{"lightOff":true}'`) with `--sky '#BCDCCF'` and `--exclude 0,0,1080,<the
  shot's sky bottom y>` (its default sky is v3's dusk blue).

## 3. Line, fill and texture (DIR 4; CR §c)
- **The pen:** `src/v2r/pen.ts` (imported first by `palette.ts`, so by every v2r entry) sets `lib/sketch`'s clean line AND `lib/pen.ts`
  `setPen('clean')`, with every line's width and colour set by its ATTENTION TIER, by story role (`lib/tier.tsx`), and B fills capped at
  C* 25. It already drops overshoot, breaks, jitter, drift, misregistration, open contours, taper and lib's texture marks: never strip `INK_PX`
  weights or sketch options by hand (TL §6 "Line").
- **By tier:** **A** (the beat's 1-3 subjects, TL §4): ONE closed outline 3.0 px in the object's own deep shade (its fill L* -35, hue kept,
  never under L* 16; a board's in its stiles' shade), inner details 1.8-2.0 px; an A promotion pops its outline on in one frame on its word.
  **B** (Pip, the people near the story, the ghosts after their beat): no outline, shapes parted by value (dL* >= 12); line-drawn figures (the
  ghosts, reference 1's kind of crowd) and Pip keep a same-hue line 1.6-2.2 px at fill L* -15 to -25. **C** (the canal, buildings, water,
  Arlington, far life): no line; things that ARE lines (wires, rails, a bird's V) as hairlines 1.2-1.6 px within dL* 15 of their ground;
  glints a light tint. The captions and the caption-band words keep the ink `#2B1B0A`.
- **Authoring:** tier every piece (`<Tier>`, `tier=`; each kit export has a default, its README's "Tiers"; untagged scene ink draws as B with
  thin tinted lines); author an A outline at `INK_PX.mid` (3.4) or wider (the pen draws it 3.0); route raw SVG strokes and fills through
  `useTierLine` / `useTierPaint`; delete the hand-drawn marks the pen cannot know (ripple dashes, brick and stone dabs, leaf specks, crumbs,
  hand hatching, steam squiggles). `INK_PX` and `MISREG_PX` stay only so built code compiles; rng placement jitter stays.
- **The ghosts keep their ONE closed outline on purpose** (outline = not yet real, as in reference 1's empty grid): A in S1 (one subject with
  her) and on their S8 pop (33.78), then B with their tinted line; the bare outlines O1-O3 have no fill.
- **Fills register exactly; big areas are flat but never empty:** things fill them, not marks (boats, the steps' things, leaves as a few flat
  shapes); texture only as flat same-hue shapes (plank seams or a rug as 2 long bands at dL* 6-8) on 1-2 small surfaces per shot; no grain;
  linework static per seed (no boil). Nothing soft: no gradient (the sky's gentle gradient aside, DIR 6), glow, blur, vignette or opacity; distance haze is flat-colour
  atmospheric perspective (`lib/depth.ts`), never a blur; every change is a pop, scale, wipe or
  slide, or a draw-on where the drawing is the beat (frame 0; the boards' pen lines in step with the voice).
- **Halftone off** (the owner's optional last step after G6; the film works flat). **Paper edges OFF** (Film2R `edges: false`); if the owner
  asks with the look clip or at the final: `paint-subtle` at most, never in y 0-620 or beside the band (sides from y >= 640), exclusion rects
  round her, Pip, the ghosts, boards and signs; the stock preset puts 14-25 px of paper at the top (fix that first).

## 4. People and Pip
- **Reference 1's grammar (DIR 3; cast README):** back view or rear 3/4; a round head that IS the hair colour; a neck; a tombstone torso; ONE
  accessory (bun, hood, beanie, cap, scarf, backpack, tote, headphones, phone); two leg bars; few lines; never a face, features, hands or
  anatomy; they act with their pose.
- **The foreground (DIR 3; TL §1.5):** no stranger's back in any foreground: the bottom third holds only Pip and things (map `BOTTOM_THIRD`);
  the "you" is POV only. S1's seated public sits only on the landing by the water (seat line ~1300, ~60 px, at the bollard's depth: the mid
  ground); the kit's `NearBack`, S1's near and middle seated rows, the head-backs of S2, S3, S6 and S7 and S8's two readers are out.
- **Sizes (map `LEGIBILITY`; TR §3):** her 150-170 px full figure (100 px/m; 153 behind the S1 door; 137-140 as S3's silhouette), never
  under 130 px while she carries a story change. The biggest strangers are mid-ground figures near the story: the S2 staffer (>= 180 seated)
  and reporter (~165 seated), the café owner (~210, S8, at the board's depth), S5's stranger (150 at the start, 62 at the end); everyone else
  smaller (far 15-60 px fill only, window people 12-60); no figure above ~260 px, no B figure over 3 % of the frame, near heads <= ~140 px.
  The floor: a story change >= 80 px, its carrier >= 130 px, staff windows >= 90 x 90, key lines >= 56 px.
- **The public and staff (TR §3, §8; LD §4):** 10-40 per shot, small, mid and far, half at rest, no two neighbours alike in hair and coat,
  NEVER teal or orange; Google's staff few, unnamed, faceless, never a row or a count (V11); the reporter (no BBC marks), S5's stranger, the
  café owner: small backs. **No look-alike:** her signature (plum head, low bun, long coat, teal) is hers alone: no extra pairs the darkest
  hair `#3E2A3A` with a low bun or a long dark coat, and none with a dark bun walks within ~300 px of her or the row.
- **Walkers (CS 3b.4):** real speeds in body heights (walk 0.7-1.1 bh/s, bike 1-3); S1 keeps her ~40 px/s stroll (the row is built on it);
  S4 one stride for her and the truck, feet planted (`strideFor`); walks at 12 drawings/s; extras enter at an edge or from behind a mass
  already walking; a figure that appears rises 0.2-0.33 s from behind a mass, never pops mid-frame.
- **Her (TR §3; cast):** invented, never a likeness (V4); a dark-plum round head with a low bun, a long teal coat, a cream tote (S1: a desk
  plant); back, rear 3/4 or walking profile; one model sheet at every size; never in Washington (V13). S3's window IS S8's (one French window:
  teal frame, Juliet rail, blind UP, lamp on): L3 and L6 compare.
- **The ghosts (TR §3; map `S1_ROW`, `S8.ghosts`):** six whole copies of her (coat cut, collar, hem, bun), paper fill, one closed outline;
  age only by whole-head value G1-G6, a scarf and a softer back from G4, a shorter stride G5-G6; nothing frail; lockstep, each separate,
  170 -> 135 px down the bend, three bare outlines 130 -> 120 px on "life"; the row goes on, the world passes through it, nothing counts years,
  never death. S8: three, 140 -> 130 px, to the seam, last out.
- **Pip, drawn new, tier B (DIR 2; CR §b; `kit/pip`; map `PIP`, `PIP_RULES`):** a pebble-round elephant, no neck, two big leaf ears that
  fold and flick, a one-curl trunk, a three-hair tuft, teddy-bear soles, a short knitted straw-mustard scarf in the wind; ONE closed same-hue
  line per pose (§3); §2's colours; 86-120 px (>= 44 in S5's end; 98 at S6's board foot), <= 1 % of the frame; idle always, and only blinks
  and ear moves (<= 10 %W/s) while the subject moves. It watches and turns its head BEFORE the voice names the next thing; ONE reaction per
  shot: S1 ears-cover on "life" 4.98 · S2 head to the wall on "But" 8.30 · S3 turns to her on "she" 13.96 · S4 turns west on "heading" 19.55
  · S5 looks up at the blossom on "April" 20.76 · S6 one ear flick on "veto" 26.50 · S7 NONE (V14) · S8 ears down on "can't" 33.78 (looking
  up at W on "not" 37.70 is a lead). **It never hops across a join** (TL §3): swept by a push-through, riding a wipe's carrier (S8's stern),
  or in the same spot (its seats: map `PIP`, `MATCHES`); at the loop it settles 30 px from the board bollard (700, 1205) to f0's (700, 1235);
  a hop inside a shot keeps its arc at y >= 600. Never in y 317-556, the rail (x > 780 below y 840) or over her; >= 200 px from the F11
  clause; no gag near harm; never furniture. **One Pip on screen at a time:** S1's t < 0 underlay draws none; S8's settles onto f0's bollard
  in frame 0's state (L6 matches L1's export).

## 5. Fullness and life (DIR 3; CR §b; LD)
- **The bar:** every PAUSED frame at 216 px reads as full and specific as reference 1 and v1 beside it, AND calm: one subject, the world
  around it softer and simpler. v2 has no G3 board (the owner's restart skipped the sketch), so those two are its density key; v3's G5b pilot
  O1 shows only how full a world can be. Fullness first (motion never fixes an empty still), then the hierarchy (TL §4), designed in.
- **Life never stops, small, slow and low in contrast:** at most 3 noticeable supporting movers at once in this film (a box over 0.3 % of
  the frame; DIRECTION's ceiling is 3-4), taking turns, one leading at a time; a pop is A's, never B's; nothing enters, pops or turns in the
  0.4 s around a join (what already moves keeps its pace; falling weather declared); a still subject never freezes the world. Each shot's
  kept and cut life is in its conform brief ("Life"). S1's sky: the hero cloud at 2 px/s (y 120-280) and a thin bar or two at 5-15 px/s the
  same way, above y 290.
- **The cozy lane (S3, S4, S7, S8; CS 3b.4):** life passes through ONE band, both ways, a new mover every ~1-2.5 s, entering and leaving
  at an edge or behind a mass already at cruising speed; half the people at rest; NOTHING comes at the lens (S8's cyclist's lamp crosses);
  bank, backdrop and water have no motion of their own; no sway, shimmer or boil.
- **The profiles are information, never quotas (LD §0; DIR "Retired"):** STORY-LED (S1, S2, S6; called LIVELY, earlier BUSY): flat <= 40 %,
  objects >= 105 / Mpx, detail >= 34 % · DENSE-CALM (S3, S4, S7, S8): flat <= 30 %, detail >= 33 %, objects >= 120, `--cozy` movers >= 2
  · SCALE (S5): CG's scale cues (§6). Events per second, gaps and the meters warn; there is no events/s quota and no density FAIL.
- **A full frame:** no hole bigger than ~200 px outside the band and the top sky; no other flat region > 20 %; >= 2 things cut by the edges;
  layers (a subject mid-frame, a living background, edge furniture); several colours per patch, varied repeats; lived-in infrastructure;
  signs of care (her plants, a neighbour watering, herb pots, mugs); the bottom third's mass as map `BOTTOM_THIRD` lists it.
- **Flash safety (CS §5; WCAG 2.3.1):** never more than 3 flashes in any 1 s: a lamp, bulb or window switches on ONCE (no `Lamp` flicker in
  S7's 30.10 and S8's 37.18 runs: <= 3 switch-ons per second); one bulb twinkles at a time; S2's five clicks and S6's 27.08-27.80 windows
  are single steps; S1's panes switch one at a time, >= 2 s apart.
- **Sync (BM §2):** TR's exact times win; elsewhere a small item leads its word by ~0.1 s, a big build starts 0.25-0.40 s early so it
  completes ON the word; marks and Pip's beats land on the word (±0.05 s); nothing trails its word.
- **Prove it (CR §a-§d's checks, §e's measures):** `check_light.py` (§2's flags); `python3 -I scripts/qa/retro_tools/line/measure.py`
  (strokes <= 80 / Mpx, near-miss ends <= 40, dark-line pixels <= 3 %); `python3 -I scripts/qa/density.py <clip> --scenes
  src/v2r/film/scenes.json --only V2Sn` (+ `--cozy` on S3, S4, S7, S8; information); `colour_meter.py <stills> --hero '#0B8577' --pop '#EE6A2E'
  --band 290,600`; `camspeed` (§6); y 317-556 pure mint in every frame; noticeable movers <= 3 at the busiest moment; an eye check at phone
  size every 1-2 s (the eye is on that beat's A); the shot's ONE thing (TR §5, last column) told back by a cold viewer, sound off; at the
  assembly the join measures (carry, eye jump, colour shift, movers) on a 0.4-scale render.

## 6. Camera, joins, frame 0
| shot | vantage | in (TL §3) | camera: at most ONE story move | out |
|---|---|---|---|---|
| S1 | RIVERSIDE, seated eye level on our steps, looking north | film start / the loop's un-build | zoom 1.00 at every t: locked or the 2D float, home by 5.90 | A push-through into W 5.95-6.25 |
| S2 | RIVERSIDE from the south towpath; the wing recedes right | A out of her dark office window at M (the 12 % ease-out 6.10-6.70 is the carrier's in-leg) | the 2D float 10 px/s, home at 12.98 | B match at M |
| S3 | RIVERSIDE across the water to her terrace | B at M | zoom 1.00; the float 8-12 px/s, home at 12.98 and from 14.60 | A push-through into her head 14.71-15.01 |
| S4 | RIVERSIDE truck from the water | A out of her head | truck west at her pace (far roofs 0.3x, backs 0.6x) -> stop on "objected" 17.36-17.96 -> hold, home by 20.40 | A push-through into SUN1 20.40-20.70 |
| S5 | a viewpoint terrace -> the pull-back crane | A out of the April sun in the slot | hold -> ONE crane 21.30-23.40 -> hold | D blossom-tree wipe, right to left, 23.62-23.98 |
| S6 | eye level, straight-on, looking south | D (V2S6 starts 23.80) | HELD at its 24.00 pose: locked or a slow 2D float | A push-through into SUN2 27.95-28.25 |
| S7 | eye level in Google's forecourt, looking north | A out of the sunset sun (V2S7 starts 28.10) | the float 8-12 px/s + ONE 4 % push on B 28.40-30.04, landing on "principles" (A5) | D narrowboat wipe 32.70-33.16 |
| S8 | LANE along her towpath, looking west | D (Pip on the stern) | the float -> ONE plain truck left 34.99-35.60 -> the float, home at 35.60 and 38.82 | B + the un-build 38.82-39.08 |
- **Joins (TL §3; map `MATCHES`; scenes.json `carrier`):** each midpoint 0.12-0.23 s before the next sentence's first heard word, in the
  voice's pause (the two forced exceptions: S5 -> S6 on the quote's first word, mid-sentence; the loop 0.37 s); within the midpoint ±0.2 s
  nothing enters, pops, turns or speeds up but the carrier and Pip riding it; slow life keeps its pace; <= 4 movers within 0.4 s; never two
  suns in a frame (the S5 -> S6 tree runs right to left; S8's sun un-builds before SUN0 shows); push-throughs last 0.30 s with `inkComp` 0.6
  (the plum bridge `#36223A` into W and into her, none into the suns). Declared light changes: S2 -> S3, S3 -> S4, S4 -> S5, S6 -> S7, S8 -> S1.
- **Frame 0 and the loop (DIR 9; TL §4.1; map `S1_CLOCK`; BUILD §2):** f0 = paper; the C world as flat PALE shapes (`Look cascade` with the
  opt-in `pale`, its value picked in the look clip); the A subjects' outlines (her behind the glass door, the door, W) drawing on as one
  stroke each from t ~-0.26, so f0 shows them mid-draw, with Pip's tinted line; no colour before the flood but the half-coloured sun; the
  flood from SUN0 by 0.30 s (f18), Pip with it, her teal coat last; the voice at 0.12; W dark at 0.40; the exit ding and the doors 0.45-0.52;
  she steps out on "Google" 0.97; birds lift at 1.40 (the expected thing: out, free); reality overtakes from 2.00 (a ghost per clause); the
  stop 4.54-4.79; on "life" 4.98 the row's step and three outlines; the cover 5.30. The loop: S8 ends on her lit window at W (860, 700)
  150 x 170 at zoom 1.00 and un-builds (fills shrink, lines retract, the sky slab drops, W and the ghosts last) onto S1's frame-0 state; f0's
  first motions start 3-4 frames early; the frame-0 words return at 39.04.
- **The crane (CG S5; TR §6; map `S5`):** the owner's favourite Arcane shape (S1E1's rooftop pull-back: one dolly back + crane up + a ~75°
  arc round the figures on ONE ease, no other move or roll; the figures are the pivot), retimed: `cubicBezier(0.35, 0.03, 0.45, 1.0)`
  21.30-23.40; the lamppost wipe at peak speed 22.02-22.19; the Pentagon clears the tree ON "Pentagon" 22.43 (the plaque pops); the obelisk
  rises; the wing's windows warm in ONE step at 23.08. Never menace: daylight, blossom, eye level or below; no flag, seal, guard, vehicle or
  glow (V3).
- **Great scale (CG "Scale cues"; DIR 7):** nothing ends inside the frame; 6 planes, each 2.2-3x smaller than the next nearer; the far band
  packed, detail peaking just under the horizon; flat steps 0 / 12 / 22 / 40 / 65 % toward the sky, far planes without lines (C); 3/4
  backlight; feet 2-3 F (figure heights) below the horizon (map's end stranger, 62 px at ~7 F, keeps L4's mitigation and is checked at 216 px
  never to read as a map); the obelisk ~4x true size, the darkest far shape on the palest cloud; a cloud bank >= 1 W behind it (tops >= 610);
  huge = slow (clouds 0-6 px/s); birds 24-44 px entering at 70-80 % of the move; nothing moves inside the city.
- **Cozy, held not shut (CS §1-3b; DIR 7):** her bank (S3, S4, S8) and the riverside holds (S1, S2, S7): masses on 2-3 sides, ONE opening the
  subject faces, the institutions far outside; mass 35-70 % of the frame, >= 40 % of the perimeter; something in the top gutter (y 0-290); a
  sign of care; one low lamp pool (two flat steps). The sky y 0-600 (31 %) is the caption field and the only void, so masses below y 600 and
  the side edges enclose. RIVERSIDE: the VALUE SANDWICH (the darkest mass, L* 20-38, right behind the people's lane; the lane C* <= 15; bank
  and water light again). LANE (S8; the owner's lane photo, H:W 1:1): one tall side, one soft low side, a closed end (her house). Google's
  riverside is cozy too (V3); the comfort breaks once, in S5-S6.
- **Camera numbers (CS 3b.5; CG "Rules"):** `camspeed` <= 7.5 px/f on long moves of lined layers, <= 15 on detailed layers (S5's flat wipe
  ~41 by design): `python3 -I scripts/camspeed.py --frames <dir> --fps 60 --limit 15` (S5: `--allow 1.47-1.64`). The float: translation
  only, 8-15 px/s (peak 25), straight eased legs turning every 0.6-1.5 s, net within ±12 px of home, >= 40 px overscan, no zoom, rotation or
  parallax. No zoom in a hold; a zoom is a visible story move (S7's 4 %) or a carrier; speed continuous, ease in, land over the last third; no
  roll, compound move or cut mid-move; at or below eye level.
- **Shape, never speed; 60 fps; the clock:** copy a move's path, framing, reveal order and easing, then retime it; frame = round(t x 60);
  poses step at 12/s while the camera glides; beats on the HEARD clock (`public/v2r/voice_words_heard.json`: "life" 4.98, "of any kind"
  32.08); `useTime()` is shot-local while map and kit times are film seconds (t = film - start; V2S6 starts 23.80, V2S7 28.10).

## 7. Captions, words in the world, sound
- **Captions (engine-owned; DIR 10):** burned in, Patrick Hand 98 px on baselines 387 / 510, <= 2 lines, centred, ink on the mint; they
  POP in place (never a roll-in, page scroll or clipped letter); a change at least every 1.5 s; ONE peach box `#F6B892` per line, ~0.06-0.1 s
  before its word, only on TR §5's key words; in screen space, never on a camera layer.
- **The band (map `UI`, `SKYLINE_EXCEPTIONS`):** the block y 317-556 (x 95-945) sits on ONE flat field; nothing is drawn in y 317-556; the
  boxes reach y 299, so y 299-317 stays clear; y 290-600 is flat sky but for the named exceptions (S1's roof planting to y 575, sun tops
  >= 575, S5's cloud bank and obelisk tops >= 610, the two wipers clipped at y >= 560; above the band S1's hero cloud y 120-280 and plane
  branch y 0-240); flyers and puffs keep to y >= 600 or the top gutter (`ceil={600}` over the kit's 580). Key reads x 120-880, y 290-1250;
  the rail x > 780 below y 840; y 1250+ holds masses only, nothing to read.
- **The frame-0 block (TR §4; BUILD §3):** SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452, no quote marks) +
  "Source: BBC News, 21 Oct 2026" (20 px, 550), to 5.95 and from 39.04; only "She [quit] Google." (52 px, 516) under it, 0.12-1.88; then the
  box walks the block's own words (SAYS 2.06 · NO 3.14 · NO CRITICIZING 3.74 · FOR LIFE 4.77): "for life" on screen once, boxed once, always
  under SHE SAYS (V5).
- **Words on real objects (LD §7; TR §5):** straight-on, level, big, people or Pip looking; one type scale (K3 `WorldText`): keys >= 56 px
  read at 216 px, body 30-34 and credits 18-20 read at full-screen phone width (~390 px); sources as small print ON the object. ONE
  StatementBoard face (enamel A-board, plum stiles) for TOLD THE BBC (S2), the deal board (S6), GOOGLE SAYS (S7) and SHE SAYS (S8), the last
  two at B (x 150-630, y 700-1220); a board is B until its beat promotes it (its one closed 3.0 px outline pops on, never drawn on);
  fill-first pen reveal, ONE clack, ONE pen. K3 has one owner, L5.
- **Quotes exact (TR §8 V6, A7):** quote marks ONLY on exact words: "for fear of retaliation" (F5) · "any lawful government purpose" (F10) ·
  the full 24-word oversight clause, never cut (F11) · "AI principles" (F13) · "of any kind" (F14) · "human oversight" (F16) · "talking about
  facts is not criticising" (F18); "for life" never quoted; British spelling only inside her quote; "Google" hand-lettered, never its logo;
  never "secret" or "Department of War" (V17).
- **Fair boards (TR §8 V9, A5, V14, Q9):** the deal board shows the full clause when the tree uncovers it (~23.88) and pops its purpose line
  ON "any" 24.03, the F12 line on "veto" 26.40, all held still and readable to >= 27.95. The identical pair is S7's GOOGLE SAYS and S8's SHE
  SAYS: the same face at B, one sunset light, type, pen build and clack, the same Pip pose at the bollard (700, 1205), ONE story move each
  before its key line (S7's 4 % push, S8's truck), a lamp run on each key word; Google's beat uninterrupted 28.31-32.70 (nothing starts before
  32.70), no irony, never lit on "facts", never in S8, never answering her clause. TOLD THE BBC / GOOGLE SAYS / SHE SAYS tell account,
  statement and record apart.
- **Sound (TR §7):** the voice always on top; 0-6.10 no music (air + S1's SFX: the picture is the hook); the exit ding at 0.45 is the
  first-second phone sound; every SFX sits on a visual onset, one sound per idea; ONE clack and ONE pen for every statement board; one soft
  tick per ghost pop at one pitch (nothing counts years); Google's beat keeps her pulse and level.

## 8. The references (study at 216 px beside your frames; extract to scratch, never commit: `ffmpeg -i <file> -vf fps=2,scale=216:-2 <dir>/f_%03d.png`)
| reference | file | study (s) | take | NOT |
|---|---|---|---|---|
| Reference 1 (France, 31.5 s, 30 fps): THE composition, colour and people | `assets/ref/reference.mp4` (stills in `assets/ref/`) | 0.0-0.6 the scene drawing itself, colour flooding in; 0.6-3.0 the expected grid fills, then overflows on "half a million" (2.0); 3.2-5.5 placards rise; 6.0-7.5 outline crowds; 8.0-13.7 the noticeboard (fill-first); 26.9-28.2 push-in; 30.8-31.5 un-build to f0 | flat colour; small simple backs (heads 40-55 px); outline = not yet real; the cat in every shot; scenes that build to the words; the loop | its line as drawn (ours is the clean pen, §3); the white polaroid card and its bottom captions; page-scroll captions; 3D card flips; a locked camera; its silence |
| v1 "php2shell" (55.4 s): the house model, the owner's favourite | `deliverables/v1/php2shell_final.mp4` | 0-4.7 plaza; 4.35-4.72 the dive into a lock; 19.8-22 the golden lane with string lights; 24.1-27 crane over a wall into the skyline; 37.2-39.4 pull-back to a hillside; 39.55 the tram wipe; 52.2-55.4 the loop | one sunny world under the mint caption sky; signage with sources; joins that carry (the dive, the wipe); scale peaks held | its big near backs; its sun as a character and Pip hopping across cuts (retired); the caption roll; its coloured frame 0; 30 fps; its night beat; its sets, Pip drawing and palette |
| Reference 2 (town meeting, 44.1 s) | `assets/ref2/reference2.mp4` | 0-6 a walking dolly behind walkers and a corgi; 32-38 dusk -> night, string lights | crowds from behind ("makes me feel small"); the animal low in frame looking where we should; one journey with no hard cut | its big near figures; dissolves; giant-object metaphors the facts don't support |
| v3 G5b pilot: how full, nothing else | `deliverables/v3/v3_g5b_pilot.mp4` | O1 (the nook) | how FULL a world can be (flat 18-24 %, detail 50-56 %) | its motion, lines and density plan, its S4 (a chart on a street board with strangers' backs), its winter, palette and kit (the owner: "too busy, too incoherent, too rough") |
| Sense of enclosure (owner photo) | `docs/look/ref_sense_of_enclosure.jpg` | the whole frame | an eye-level lane: one tall side, one soft low side, a curving lane, a vista closed by a tower; H:W ~1:1, sky ~27 % | its grey overcast and rain; photo realism; olive-grey stone; a wall cut by the top (our tops stay >= y 600) |
| Palette references: COLOUR only | `docs/look/palette_refs/1-5.webp` + `swatches.png` | the swatch bars | a warm off-white page 51-82 %, one saturated hero 4-10 %, a deep aubergine anchor ~5 % (refs 3, 5), tiny orange pops 1-3 %, soft secondaries | their big front-facing figures with faces (never a character style); olive and khaki (refs 1, 4); ref 5's pink wash |
| Texture reference | `docs/look/texture_refs/autumn_walk_detail.png` | the crop | lines only in key places, never round every silhouette | its halftone dots (off for v2 unless the owner asks, as a last step); olive |
| Arcane: ENVIRONMENT ONLY | words in CG (#55 @109.46 the S1E1 rooftop crane; #94 @238.0 rise-over; #24, #60, #61, #108); the owner's collage `assets/ref_cinematic/arcane_collage.jpg` | CG's measured shapes and cues | camera shape and staging; small backs facing a vast view; the scale cues; a big flat sky with huge clouds | footage, frames or tracing; faces or people as subject; night, red skies, glow, beams, haze, god rays, painterly texture, airships; source speed |
| Cozy references C2 / C3 (owner clips) | words only, `docs/look/COZY_AND_SCALE.md` 3b | the BALCONY and RIVERSIDE recipes | fullness first; rest next to motion; life passing sideways; the 2D float instead of a push | their louder saturation; olive darks |
| Anti-references | v3 G5 `deliverables/v3/v3_g5_blocking.mp4`; v3 G5b (above); the rejected v2 cut in words only (TD §3-4; its archive is never mined) | TD §4's table | "way too empty"; "too busy ... too many moving parts ... too rough and messy" | anything from them |
The animated sketchbook (`docs/look/ref_animated_sketchbook.png`) is the G3 board's look: not a reference for this film (no sketch stage; its
open contours are retired).

## 9. The NEVER list (DIRECTION's "Retired" as it bites here, the owner's rejections, every fairness break; plus every NEVER in §2-7)
- **Retired by DIRECTION (2026-10-27), with v2's old instances:** scratchy lines (jitter, overshoot, open contours, double strokes, taper
  everywhere) and misregistered fills (the 3-15 px overshoots, 20-40 % open contours and 2-5 px misregistration of TR §2) · line weight or detail
  by depth (`INK_PX` front / mid / far / hair as drawn widths; "ink full, full, hairline, none") · equal-weight clutter: dressing, crowds or Pip
  as loud as the subject; ripple dashes, stone and brick dabs, leaf specks, ticks, hatching, grain · an events-per-second quota or a density
  FAIL (the old BUSY row's >= 3.5 events/s) · a plain cut by default, a cut "on Pip's leap", a dissolve as a join · a zoom, push or breathe in
  any hold (S1's 5 % pull-out, S2's 6 % push, S3's ease-back, S4's push toward the sun, S8's seam push) and S6's parallax truck · a light that
  moves or hops between cuts, the sun as a character or idle motion (S5's APRIL 2026 calendar flip), glow discs and halo rings · Pip hopping
  across a join, or in full colour at frame 0 · strangers' backs in any foreground (S1's near and middle seated rows, the head-backs of S2, S3,
  S6, S7, S8's readers) · faces on people · life, places or tier promotions bolted onto a finished shot · one house kit reused across films;
  `lib/cine`, `lib/kit` people or `lib/mascot` drawing pieces in film code; importing another film's folder · the full-colour loop seam (the
  last shot un-builds into frame 0's drawing state) · v3's G5b density plan, per-panel lanes and S4 as models.
- **The dropped first cut (TD §3-5; N2):** rooms, desks and papers as the stage · big front-facing people with faces, posed busts, squiggle
  speech bubbles, a "FACTS" bubble · three palettes, saturated washes · a locked camera, long holds · props instead of events (a badge, a
  highlighter, a scroll of years) · text as slides (four tiers on frame 0, a source bar on every shot, legal paragraphs, a bullet list) · her
  cat at home instead of Pip · hard cuts between unrelated sets · energy dying after 1 s · a beige frame 0 · anything from that production.
- **People (owner; N2; LD §4):** big character models, waist-up shots, close-up faces, front-facing posed figures, "corporate flat" stock
  people; a figure over ~260 px; big passers-by framing a shot; an extra who looks like her; a likeness of Sofia Liguori (V4); staff as a crowd.
- **Rough, busy, stitched (owner, after v3 G5b):** rough, scratchy or sketchy lines; many equal moving parts, life at the subject's contrast;
  absent shadows, light "weirdly put" (a pool or shadow no source explains, two light directions in a frame); a bunch of shots stitched
  together, a join that carries neither the eye nor the story.
- **Emptiness, look and camera (DIR; LD; CS §5):** a big flat empty field, an object alone on a blank wall, a quiet bottom third, a still
  frame, motion on a void · a palette per scene, a hex outside `CM`, a violet world, loud fields, beige, tan, olive, grey, pure black, grey
  shadows · gradients (the sky's one gentle gradient aside), glow, blur, opacity, fades, dissolves, card flips, texture, boiling lines, an outline round every silhouette · a
  roll, a compound or source-speed move, a cut mid-move, a high angle on one person, night-black frames, red skies, more than 3 flashes in a
  second · anything in y 317-556, a clipped or rolling caption, life over lettering, quote marks on paraphrase.
- **Fairness (BM §4; TR §8):** war imagery: weapons, drones, missiles, explosions, soldiers, tanks, crosshairs, targets, radar over cities,
  blood, skulls, war footage (V1) · Google lettering, products, vans or signs in the clause frame; racks, carts, screens, deliveries; anything
  implying targeting (V2) · villains: a sinister HQ, looming figures, ominous stings, EXPOSED / glitch / siren graphics, hero vs villain light,
  glow or rim on Google or the Pentagon, a dolly-zoom (V3) · tape, padlocked lips, zips, muzzles, chains, cages (V7) · gavels, ILLEGAL / VOID
  stamps, courtrooms (V8) · the purpose line without the full clause (V9) · blank cheques, infinity, floodgates, "unlimited", "secret" (V10) ·
  cameras, eyes, guards, escorts, a camera inside Google watching her (V12) · her in Washington, her window in S5-S7, the deal at her home or
  desk (V13) · irony on Google's beat (V14) · logos, BBC styling, seals, insignia, partisan flags (V15) · charts or numbers for "heading" (V16)
  · Hegseth, Trump, Israel, Gaza, "kill", "bomb", "exclusive" (V17) · "for life" quoted, stamped or without SHE SAYS (V5).
- **Pip and the ghosts (TR §3):** two Pip reactions in a shot, two Pips on screen, a gag near harm, a reaction on Google's beat, Pip in the
  band, the rail or over her, Pip as furniture, Pip above C* 25 or with a dark outline; a frail ghost (stoop, stick, bag), the row walking
  off, counting years (dates, counters, faster ticks), a death read.
- **Settled for this film:** no sketch stage (the owner's restart, 2026-10-27), so the frame-0 drawing and the look clip are the clean pen's
  first tests here; `docs/v2/LOOK.md` is archived; "10 Canal Mint" is not yet in `palettes.json` (K1 is the source); C2 / C3 exist in words only.

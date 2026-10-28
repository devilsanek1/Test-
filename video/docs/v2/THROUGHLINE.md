# Video 2 ("One Small Window"): the through-line card and world bible (W1), conformed to DIRECTION

Director, 2026-10-27 (resume after the pause). v2 was built before `docs/look/DIRECTION.md`; this card makes it one
flowing story with the least rework. Order: owner's words > DIRECTION > `docs/look/CRAFT.md` > THIS card (thread, places,
joins, tiers, light) > `TREATMENT.md` (story, words, timings; its fairness §8 binds this card too) > `STYLE.md` (values).
Lanes build from `lanes/conform_Ln.md`. Times: film seconds on the heard clock (`direction/beat_map.md`). Spots: screen
px at 1080 x 1920.

## 1. The card
1. **Core line (locked):** "She quit Google, and says her contract bans criticizing it, for life." Frame 0: SHE SAYS: NO
   CRITICIZING GOOGLE. FOR LIFE. + "Source: BBC News, 21 Oct 2026". Payoff: "talking about facts is not criticising".
2. **Thread: her window, the one small window.** Lamp-lit at Google, it goes dark when she quits (0.40); it is the one
   dark pane while the staff's blinds come down (S2); lit and open at home while she talks (S3: the question); it waits
   ahead of her on the walk home (S4); it lights when she gets home (34.95) and the film loops on it. Home spots: **W**
   (860, 700) 150 x 170 (S1 office, S8 home) · **M** (335, 785) 133 x 164 (S2 her dark office window, S3 her lit home
   window: the match) · S4 far left under the sun (>= 90 px wide). It reacts at the end of her beats: dark (quit, "for
   life") · the one dark pane (the fear) · lit, blind up (why is she talking) · lights (her words).
3. **Declared fairness stretch, "the other side" (S5-S7, 20.55-~33.0, 12.4 s): no thread** (CRAFT §a.1's second
   exception; owner yes, 2026-10-27 ~20:10 UTC, `OWNER_NOTES.md`). Fairness rules here (the owner's brief §18-19, "fair,
   nonjudgmental, no manufactured villains"; CORE_LINE §2's equal weight for Google): she and anything of hers are never
   in Washington, and April is before she quit (TREATMENT V13); Google's reply is its own beat with nothing of hers in it
   (A5, V14). The excursion leaves from the thread (S4 pushes into the sun right above her far window), goes to April and
   back through the same sun (S4->S5, S6->S7) and returns to her window at its next join, as the exception asks (the
   S7->S8 boat wipe opens on W). Tried and rejected: the sun (DIRECTION retires the sun as a character; no disc in S2;
   not her arc) · Pip (the mascot has its own rule) · the boards (four objects, none in 0-8.4 s) · her window pinned as a
   card in a corner of S5-S7 (puts her into Washington and into Google's beat).
4. **Home place: the canal** (one London canal, one October evening: Google's bank, the towpath walk, her bank). Places:
   (1) the canal; (2) Arlington on an April morning (S5, S6), entered and left through the sun. The ONE scale reveal: S5's
   crane. Information is paper where we are: tag and plates (S4), news box and plaque (S5), deal board (S6), A-boards (S2,
   S7, S8).
5. **The "you": none** (POV only). No stranger's back in any foreground: strangers stay small in the mid and far ground;
   the foreground (bottom third) holds only Pip and things.
6. **Pip** (tier B, drawn new, C* <= 25: STYLE's new token): on both sides of every join: swept by a push-through (in
   frame before the dive and after the pull-back), riding a wipe's carrier, or across a match or a wipe in the same
   screen spot (within ~200 px); it never hops across a cut. One reaction per shot (TREATMENT §3), none on Google's beat.

## 2. The thread on screen
| shot | span | the thread | s |
|---|---|---|---|
| S1 | 0.00-6.10 | W lit, dark from 0.40; the dive into it | 6.10 |
| S2 | 6.10-12.98 | her dark office window at M (pulled out of; its A outline pops on at 6.82) | 6.88 |
| S3 | 12.98-14.86 | her lit home window at M, her silhouette inside (the push-through dives into her) | 1.88 |
| S4 | 14.86-20.55 | her window ahead at the far left (backs plane, 0.6x the truck: half in by ~15.4, whole by ~16.1), under the sun at the push-through | ~5.15 |
| S5-S7 | 20.55-~33.0 | none: the declared other side (§1.3) | 0 |
| S8 | ~33.0-39.08 | W (pre-truck (700, 700), uncovered by the boat's stern ~33.0; at W from 35.60), lights 34.95, the seam | ~6.1 |
**Sum ~26.1 s = 67 % of 39.08 s. With the owner-approved fairness stretch (§1.3, 20.55-33.0) set aside, as CRAFT
§a.1 allows: 98 % of the 26.6 s outside it, longest gap ~0.5 s (S3 -> S4): both FAIL lines pass. Counted over the whole
film they could not (68 % at most even at 100 % outside S5-S7), so the stretch must stay declared in scenes.json notes
and in the assembly's thread check.**

## 3. Joins (0 plain cuts; shots average 4.9 s)
At every join the midpoint leads the next sentence's first heard word by 0.12-0.23 s, in the voice's pause (two forced
exceptions: S5->S6 sits on the quote's first word mid-sentence, where the pause is 0.11 s; the loop leads by 0.37 s,
the file's tail plus its lead). Within midpoint +-0.2 s nothing enters, pops, turns or speeds up but the carrier (and
Pip riding it); slow life keeps its pace; <= 4 movers within 0.4 s; no frame ever shows two suns. A push-through or a
wipe is centred on the incoming shot's `start`; every `transitionIn` carries its `carrier` letter. Pip never hops across.

| join | midpoint · first word | carrier · engine (scenes.json `transitionIn` of the incoming shot) | what leads | Pip |
|---|---|---|---|---|
| S1->S2 | 6.10 · "You'd" 6.28 | A · `push-through` {from [860,700], to **[335,785]**, zoom 12, bridge #36223A, inkComp 0.6, dur 0.30} | the dive into W, out of her dark office window at M | stays on its bollard (700,1235), swept by the zoom; already seated on its S2 post (590,1050) |
| S2->S3 | 12.98 · "So" 13.16 | B · `matchcut` | her dark office window at M -> her lit home window at M: same spot, same size (133 x 164) | (590,1050) in both |
| S3->S4 | 14.86 · "She" 15.07 | A · `push-through` {from [330,742] (her silhouette's head), to [720,912] (her head in S4), zoom 12, bridge #36223A, inkComp 0.6, dur 0.30} | into her at her window, out of her walking (the name tag pops 15.07) | swept; seated on the boat roof (470,1218) from S4's first frame |
| S4->S5 | 20.55 · "In" 20.67 | A · `push-through` {from [250,650], to [250,650] (SUN1), zoom 7, no bridge, inkComp 0.6, dur 0.30} | into the low October sun just above her window, out of the April sun in the slot | (470,1218) -> on the bench (415,1120) from S5's first frame |
| S5->S6 | 23.80 · "any" 24.03 (the quote's first word) | D · `foreground-wipe` {element 'scene' (S5 exports `Wiper`: a blossom tree, trunk + crown ~300 px, clipped to y >= 560), dir **'left'**, dur **0.36**}; **V2S6 start 23.80** | the tree crosses the lens right to left (23.62-23.98): S5's end sun (right edge) is covered first, S6's SUN2 and board (left) are uncovered last, so two suns never share a frame; the board is clear by ~23.90 and the purpose line pops on "any" 24.03, after the wipe | tiny at the balustrade (366,1195) -> at the deal board's foot (360,1410): the tree swaps them in the same column (215 px) |
| S6->S7 | 28.10 · "But" 28.31 | A · `push-through` {from [260,620], to [260,620] (SUN2), zoom 7, no bridge, inkComp 0.6, dur 0.30}; **V2S7 start 28.10** | into the April sun, out of the October sunset sun: back to London | swept: from the board's foot (360,1410) to S7's board bollard (700,1205), seated from S7's first frame |
| S7->S8 | 32.93 · "She" 33.16 | D · `foreground-wipe` (S7's narrowboat `Wiper`, dir 'left', dur 0.46): as built; the bow only after 32.70 (A5) | the narrowboat | rides it: S7's Pip stays put until the bow covers it (~32.83); S8's Pip on the stern 32.97, steps off 33.00, lands (450,1205) 33.20 |
| S8->S1 | 38.95 · "She" 0.24 heard (next loop; json 0.12) | B + `unbuild` {dur 0.26, captionAt 39.04} | her lit home window W = her office window W at f0, both 150 x 170 at zoom 1.00; S8's sun un-builds before S1's shows through | board bollard (700,1205) -> f0 bollard (700,1235): a 30 px settle |

## 4. Tiers per shot (CRAFT §b), mover budget, colour script
A = the beat's 1-3 subject objects (the only full outline, the contrast, >= 60 % of the motion in its beat); B = Pip and
people near the story (soft, small, steady, tinted line or none); C = the environment (no lines, low contrast, slow life).
A promotion pops the A outline on (one frame) on its word; draw-ons only at frame 0 and where the drawing is the beat
(the boards' pen lines in step with the voice: DIRECTION rule 8). Kit defaults: `src/v2r/kit/tiers.tsx` and each kit
README's "Tiers". Noticeable supporting movers (a box over 0.3 % of the frame): at most 3 at once, taking turns; a pop
is A's, never B's. Still-subject stretches (S2 6.70-8.30, the S6 board between its pops, S5's start hold): A holds, the
world stays slow and nothing new enters; the motion-share meter is information there (CRAFT §b: a still subject never
freezes the world). S4's truck is A's walk: its world slide is camera, not supporting motion.
1. **S1** (golden). A: her + her ghost row (one subject) · W (0-0.40, 5.59-6.25) · the glass door with its canopy
   letters (0.45-1.40; the letters pop on "Google" 0.97). B: Pip, the small seated public on the step by the water. C:
   the wing (one window switch at a time, >= 2 s apart), canal, moored boats, bridge + one bus, far roofs, hero cloud,
   one small far jogger, birds lifting at 1.40 only (the hit at 4.98 is the row's). Colour: frame 0 = paper, the rest
   landing as flat pale shapes, her / the door / W drawing their outline with Pip's tinted line (DIRECTION rule 9: no
   colour before the flood) -> the flood from SUN0 by 0.30, her teal coat last; W lamp-gold -> plum dark (0.40); the
   ghosts paper, heads plum -> silver.
2. **S2** (golden). A: her dark window (outline on at 6.82 "one") · the five staff windows (lights 8.96, silhouettes,
   half blinds 10.26-10.60, the last blind 12.20) · the TOLD THE BBC board (from 8.44). B: Pip (head to the wall on "But"
   8.30), reporter and staffer (notebook 9.48; hood ~10.85, after the blinds), newsagent. C: the wall, canal, passing
   boat, far walkers, pigeons, urn steam. Colour: warm brick and gold panes; her pane the plum anchor; the five panes
   cool to white at 8.96; warm-shade blinds; the board's cream face.
3. **S3** (sunset flash-forward). A: her window with her silhouette on the phone. B: Pip (turns to her on "she" 13.96),
   two lit neighbours. C: terrace, canal, heron, boat smoke, string lights (one twinkle at a time). Colour: rose band;
   lamp-gold pane in its teal frame; her plum silhouette.
4. **S4** (low sun). A: her (walk, stop on "objected" 17.96, look west) + the name tag (15.07-18.80) · the fingerpost
   (plates from 18.92). B: Pip (turns west on "heading" 19.55), her far window (the thread's spot), walkers she passes. C:
   towpath, lamps, benches, backs, gasholders, viaduct, the boat, water (no motion of its own), ducks, heron, smoke; birds
   west 19.80. Colour: gold band; her teal coat; cream tag and plates; her far window dark in its teal frame.
5. **S5** (April morning; the scale reveal). A: the slot's blossom burst ("April" 20.76) -> the news box (to ~21.75) ->
   the Pentagon + the plaque (from 22.43). B: the stranger and Pip (the scale anchors). C: city, river, trees, the
   lamppost wipe, joggers, cars, birds, clouds; the wing's windows warm in ONE step (23.08). Colour: cool mint sky, pale
   gold band, blossom pinks, pale limestone; the far city in pale steps toward the sky.
6. **S6** (April; held locked at its 24.00 pose: the 4 s parallax truck is retired, DIRECTION rule 8). A: the deal board
   (the clause from the reveal, the purpose line 24.03, the F12 line 26.40). B: Pip (one ear flick on "veto" 26.50), the
   door staff (small backs). C: facade, door, fence, tulips, blossom, petals (steady falling weather), one jogger, the
   rest of the promenade small and far; facade windows 27.08-27.80 at <= 3 switch-ons per second. Colour: the cream board
   under a pale sky; tulip confetti; limestone.
7. **S7** (sunset). A: Google's board (whole shot; the 4 % push lands on "principles" 30.04). B: Pip (sit-watch, NO
   reaction), people in and out of the doors (small backs). C: the wing (plain lit windows), fountains (steady), plane
   trees, festoons (30.04 run, <= 3 switch-ons per second), a cyclist, smoke. Colour: rose band; cream board; plain gold
   windows.
8. **S8** (sunset -> lamps). A: her + the three ghosts (her walk 33.16-34.75; the ghosts pop on "can't" 33.78) · W
   (34.55-34.95, and the end) · her board (35.72 the wipe, 36.54 the quote). B: Pip (ears down on "can't"), the café
   owner (wiping from the board's left side, at its depth), her door. No readers in front of the board (backs reading a
   board from the foreground: v3's retired S4 model, DIRECTION "Retired"; Q9 (c) also wants nothing singled out on
   "facts"). C: the lane, lamps (37.18 run, <= 3 per second), the café boat, canal, roofs, sun, smoke, steam, walkers.
   Colour: rose band; teal door; W lamp-gold from 34.95; cream board; lamp-gold pools run west 37.18.

## 5. Light: one family, two rigs (CRAFT §d; `src/lib/light.tsx`, API in `src/lib/LIGHT.md`)
- **`src/v2r/world/rigs.ts`** holds every rig (the integrator writes it with map.ts; lanes import it, never redefine it).
  **Tint family, both sets:** `tintFamily(CM.shadeWarm #8C5E6B, {form 0.20, cast 0.28, contact 0.48})` (the engine demo's
  `TINT_CANAL`): on paving form / cast / contact dL* -9 / -13 / -22, chroma kept; never a contact strip on water (it
  greys: use a cast-strength strip at a waterline at most).
- **RIG_CANAL** (S1, S2, S3, S4, S7, S8; = the demo's `CANAL_EVENING`): key = the low western sun, `sunLight({toward, el:
  36})`, cast capped 0.8 h; ground 0.28; pools ['#FBE6C2', '#FFF2D9']; rim '#FFE7BE'; windows CM.lamp. North lenses
  (S1-S4, S7): the sun at screen LEFT (in frame in S1, S3, S4, S7; off-screen left in S2), shadows fall right and a
  little toward us (toward ~15). S8 looks west: the sun ahead (SUN8), shadows fall toward us (toward ~85), backlit form
  (tops lit).
- **RIG_APRIL** (S5, S6): the same family; key = the April morning sun, `el` ~40, no pools. S5 start: the sun in the slot
  at the left -> shadows right and toward us; the crane turns the view and the sun ends upper right -> shadows left and
  toward us (one direction per frame, matching the sun's side). S6 looks south (a >90° turn from S5's end, so the key may
  change side at the wipe), the sun at the left (SUN2): shadows right, toward us.
- Every shot: contact shadows under everything that touches a surface (people, ghosts, Pip, bollards, benches, boards'
  legs, lamp bases, bikes, planters, tables, bags); cast shadows for people, posts, boards and trees along the key;
  FormShade on the side away from the key (the right side on north lenses); `Shade` one step on planes turned from the
  sun (facades, undersides). Rim only on her (S1, S4, S8). Lit panes are `LitWindow` (L* 85-92, no glow); her lit window
  adds a `WindowSpill` (S3; S8 from 34.95); S8's lamps add pools (two flat steps, +4 L* over the paving) as they light
  (37.18). No source moves between cuts; the sun keeps its screen spot through both sun push-throughs; two suns never
  share a frame (the S5->S6 wipe runs right to left, S8's sun un-builds before S1's shows). The caption band holds one
  value. The brightest 5 % sits on the beat's A: run `check_light.py` with `--sky '#BCDCCF'` and `--exclude 0,0,1080,<the
  shot's sky bottom y>` (its default sky is v3's dusk blue; v2r's sky steps and bands are left out too).

## 5b. Depth: planes, the air, one camera, separation, a few particles (CRAFT §f; `src/lib/depth.ts`, `src/lib/particles.tsx`, how-to `src/lib/DEPTH.md`)
The owner on the G4 clip (2026-10-27, `OWNER_NOTES.md`): the wing and the far city "blurred together", no distance, no
perspective, the bottom flat; "a bit of particles here and there". Every shot, with its rig:
- **The air** (one atmosphere per set, `makeAtmosphere`): the shot's lowest sky colour right behind its far planes,
  `horizonColor(sky, x)` once the shot draws `lib/sky`'s one continuous sky (CRAFT §g.3; S1 `S1_AIR` in
  `world/skies.ts`: the #FBD9BB horizon warmed under SUN0, in place of `S1_HAZE`); until a shot's sky is converted, its
  lowest band (the gold band #F6D9BC on S2, S4; the sunset band #F3C6A6 on S3, S7, S8; the April band on S5, S6).
  Every far fill goes through `recede(colour, plane, ATM)` or `planePalette` (converging on the air, never grey or
  olive), never an sRGB mix toward the mint: the dc kit's `atm()` and S1's `hazeBatch` mix that way, swap them.
- **One camera per shot** (`groundCam`; the horizon and VP(s) every ground, figure and particle is sized from): S1
  `S1_LENS` (horizon 965, f 1400, eye 1.3 m) with L1's two-point VPs; S2 the wall's VP (1400, 700); S3 the towpath's
  (540, 1150); S7 (540, 560); S8 the lane's model (VP (600, 948), f 935, eye 1.3 m). Grounds recede (joints at
  |ΔL*| >= 6 or bands >= 3 px), nothing nearer is smaller per metre.
- **Particles** are tier-C life inside §4's mover budget (small: none counts as a noticeable mover), `t0` after S1's
  flood, `joins` = the shot's scene-local in and out (0 and its length), `avoid` the band and the A's box.
- **Check:** `scripts/qa/check_depth.py` on each lane's key stills with a sheet per shot (copy
  `scripts/qa/depth_sheets/v2_g4_look_s1.json`: planes, the air, the A silhouettes, the ground and its VPs): no FAIL.

| shot | planes (- foreground, 0 the subject's, + farther) | the field behind each A | particles |
|---|---|---|---|
| S1 | -2 our steps' things, -1 the landing, the water, 0 the far towpath + the wing (her, the row, W, the door), +1 the bridge, +3 / +4 the far city (behind the pale wing it starts at +3) | the lit fin: a far silhouette <= L* 76 rising behind the top-west corner (or the corner in brick); the copies' row: the bridge behind their bodies <= L* 70, the far rows behind their heads <= 78; her on the wall passes (25) | motes in SUN0's light over the west gap (on the far rows' shade), glints in SUN0's glitter column (x ~196, y 1110-1215), one leaf down the left gutter |
| S2 | -1 our towpath (things; its joints to the VP), 0 the bench, board, kiosk, the wall's near bays (her window M), +1 the wall receding, +2 the stepped tiers, +3 the far bank | her dark window: the plum on the light wall (passes); the board's cream face: a darker field behind its top (the wall's shade step or the water), never the pale paving | a few motes in the low light at the left edge |
| S3 | -2 our towpath, -1 the boat, the water, 0 her terrace (her window M), +1 roofs and chimneys, +2 the far city on the sunset band | her lit pane in the darker wall; her plum silhouette in it | glints in the low sun's glitter path, motes in her window's spill (on the wall's shade) |
| S4 | -1 the boat, 0 her, the towpath, the post, +1 the backs (0.6x truck), +2 the far roofs and gasholders (0.3x) | her teal on the towpath; the plates' cream: the backs behind them one shade step darker | motes near SUN1, a leaf or two across the towpath, glints under SUN1 on the bottom water |
| S5 | the crane's 6 planes (0 / 12 / 22 / 40 / 65 %) through `recede` with the April air | the Pentagon (A from 22.43): half its plane's step, the darkest far shape on the palest cloud bank | petals in the slot's burst (`leaves`, blossom colours, small); the V of birds as planned |
| S6 | -1 tulip kerb, bench, rack, fence posts, 0 the deal board + paving, +1 the facade band + door, +2 the promenade's trees | the board's cream on the limestone facade (L* ~90): a darker field behind it (the facade's shade step, the fence, a hedge band) | the steady falling petals stay S6's own declared falling weather (`S6Petals`: <= 8, no gust, flat, growing in and shrinking out, never through the band): a `leaves` field holds 2 at most |
| S7 | -1 café tables and things, 0 Google's board + the forecourt (setts to the VP), +1 the wing's facade, +2 plane trees, far | the board's cream on the wing: the wing behind it one shade step (it faces away from the low sun) | plane-tree leaves, motes in the low sun's light |
| S8 | -1 the café boat's stern things, 0 her, the board, the lane (to its VP), +1 the far bank across the basin, +2 the far rows on the sunset band | her backlit (rim) on the lane; the board's cream on the shaded lane wall; W lit in its wall | backlit motes in SUN8's light (the sun ahead: the best mote shot), glints in SUN8's glitter column on the basin |

## 6. What stays, what changes
| shot | keep exactly as built | change |
|---|---|---|
| S1 | frame-0 words, source, box keys; exit ding; her figure, walk, the ghost row (figures, timing, stop, step, outlines); wing, door, canopy, W; the far towpath bend; KEEP_CLEAR | frame 0 drawn in the clean pen (pale shapes, A outlines and Pip's tinted line drawing on, then the flood); the 5 % pull-out retired (zoom 1.00); every seated row nearer than the step by the water out, things in; life cut to budget; Pip's 5.90 hop out; tiers, light |
| S2 | the wall; the staff windows' story; bench figures; the board slide; Pip's head turn; the near lamp | her dark window to M (the staff window there moves to (200, 795)); the ring -> her window's A outline; the 6 % push retired; head-backs out, things in; hood after the blinds; Pip's hops out; tiers, light |
| S3 | terrace; her window (= S8's); the boat | ease-back retired; Pip to (590, 1050), no landing or leap; head-backs out; exit = push-through into her; tiers, light |
| S4 | the walk, stride, truck, tag builds, post + plates, the boat foreground | opens out of her head; her house + window at the far left; gasholder off the sun; the 6 % push retired; exit = push-through into SUN1; Pip seated, no hops; tiers, light |
| S5 | the crane: planes, ease, wipe, swap, plaque, the end frame | opens out of the sun; calendar flip retired (the sun as a character); the windows warm in one step; exit = its blossom-tree `Wiper`, right to left; Pip seated, no hops; light |
| S6 | gate set, deal board, facade, door | opens behind S5's wipe (23.80); the truck retired (held at its 24.00 pose, board x 120-680); readers' backs out, things in; Pip at the board's foot; exit = push-through into SUN2; tiers, light |
| S7 | forecourt, Google's board, the 4 % push, Pip at the bollard, the wiper | opens out of the sun (28.10); café backs out, things in; flash-safe lamp run; tiers, light |
| S8 | lane, her walk, door, W, board + wipe + quote, ghosts, lamp run, stern hand-off | seam push retired (W = S1's W at 1.00); the un-build lands on S1's new frame-0 state; the readers go, the café owner wipes from the board's side; light (W spill, lamp pools) |
Line, every lane: the clean pen is global (`src/v2r/pen.ts`): it already drops overshoot, breaks, jitter, drift,
misregistration, open contours, taper and lib's texture marks, and sets each line's width and colour by its tier, so do
NOT strip `INK_PX` weights or sketch options by hand. Do: tier your own pieces (`<Tier>` / `tier=`; untagged scene ink
draws as B with thin tinted lines); author each A outline at `INK_PX.mid` or wider (the pen makes it 3.0 px); route raw
SVG strokes and fills through `lib/tier.tsx`'s `useTierLine` / `useTierPaint`; delete the hand-drawn marks the pen
cannot know (ripple dashes, brick and stone dabs, leaf specks, crumbs, hand hatching, steam squiggles: CRAFT §c). Rng
placement jitter stays.

## 7. Shared files (one owner each; lanes edit only their own files)
- **Integrator** (with map.ts, one commit, before the lanes start): `film/scenes.json` transitions and starts per §3
  (V2S2 `to` [335,785]; V2S4, V2S5, V2S7 push-throughs; V2S6 wipe {dir 'left', dur 0.36} and start 23.80; V2S7 start
  28.10) with a `carrier` on every `transitionIn` (A, B, A, A, D, A, D; the loop's B in its note) so `gate_check.py` runs
  CRAFT §a's carrier FAIL; `world/rigs.ts` (§5); map.ts: S1 pull-out, S2 push, S3 ease-back, S4 push, S6 truck (every S6
  drift 0, the dc kit's `GATE_DRIFT.lawn` too) and S8 seam push retired; S2 her window at M and the swapped staff window;
  S3 Pip seat (590, 1050); PIP_HOP_S2_S3, the calendar flip, every pipLeap / pipHop retired; S4 her-window spot; S6 Pip
  at (360, 1410), still; MATCHES carriers; BOTTOM_THIRD = things; SUN8 (420, 625) (L5 and L6 asked); the Pip token at
  C* <= 25. Engine: the opt-in `cascade.pale` in `lib/Fill.tsx`'s Look cascade (before the wave a fill is
  `mix(colour, paper, pale)`; unset = today, v1 / v3 frames identical) for L1's frame 0.
- **L1** exports S1's frame-0 state (t < 0) for L6's un-build; **L2** sends its final near lamp (x, y, h, w, colour) to
  L3.
- Assembly (the orchestrator's transition pass): carry, eye jump, colour shift (declared light changes: S2->S3, S3->S4,
  S4->S5, S6->S7, S8->S1) and movers per join on a 0.4-scale render (CRAFT §e).

## 8. For the owner
1. Answered 2026-10-27 ~20:10 UTC: "Yes" to §1.3 (S5-S7 without her window; restaging the boards on the canal rejected).
   No open question on this card.

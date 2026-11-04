# The look test, reviewed: the panel's one verdict (chair)

*2026-10-29. The chair's merge of the three reviews of `video/deliverables/tests/poster_look_test_v1.mp4`
(`REVIEW_art.md`, the art director; `REVIEW_cold.md`, the cold phone viewer; `REVIEW_tech.md`, the technical verifier)
and the builder's `REPORT.md`. This file is the brief for lane S's one fix pass. Every claim a fix below relies on was
re-checked on the delivered clip: frames decoded with ffmpeg (BT.709, TV range, `accurate_rnd+full_chroma_int`); clip
frames 570 / 690 / 822 are pass 2's 1.0 / 3.0 / 5.2 s (they match the builder's lossless stills at 40.1 / 39.8 /
39.5 dB) and 132 / 252 / 384 the Before half's. Times are clip seconds, with pass 2's own clock as "p2" (p2 = clip -
8.5 s). Spots are px at 1080 x 1920. Scratch and sheets (not kept): `/tmp/review-chair/` (`sbs_cover.png`,
`phone_4.png` at 390 px, `squint.png`, `crop_row.png`, `her_sbs.png`, `crop_wing.png`, `crop_crown_822.png`,
`tower_822.png`, `cloud_822.png`, `opening_strip.png`).*

## 1. Verdict: FIX_FIRST
- **Why not SHOW.** The art director and the cold viewer each found things that would mislead the owner on the very
  decisions this clip exists to show (1 no outlines, 2 the darks and the near world in mid-tones, 3 the patchwork). I
  checked every one I rely on against the clip's frames, and each holds (§2).
- **The technical verifier's SHOW stands for what it covered.** The file is sound and the A/B is fair: the Before half
  is v2's shipped S1 frame for frame over S1 frames 5-354 (Y-PSNR >= 50.2 dB, mean 57.5; frames 0-4 lack the caption:
  SHOULD 1); both halves carry the same voice at -13.9 / -14.0 LUFS with a 0.0 ms A/V offset and one encoder setting;
  the darks and the mottle hold at both platform rungs, which add no twinkle. Nothing there has to change before the
  owner sees it.
- **The pass.** One fix pass by lane S: MUST 1-6, then the SHOULDs of §3, every change behind the pass-2 switches; one
  re-render; the re-check of §7. Then SHOW, with no second panel round (§7 is the gate). All of it is settings, tones
  and drawing in `src/look/poster_s1/`; no shared lib file changes.
- **Keep** (all three reviewers; don't lose it in the fixes): the value structure (p5 59 -> 33; darks 1.6 -> 8.2 % in
  130+ pieces over 12-13 cells; the near group under the subject's plane and 32 L* from the air); the drawing of the
  plane tree and the spray (true leaf edges, flat facets, one calm wind); the calm sun; the float by depth; the bolder
  opening flood; the captions; the motion (no twinkle, boil or banding at 1x).

## 2. MUST-FIX (6, ranked by how much each changes what the owner will judge)

**1. Her and her row lost their drawing with the outline: the copies read as pale posts.**
- *Where:* the towpath row, x 0-480, y 900-1100, and her, x 485-550 on the cover (x 560-640 at p2 3.0 s). From clip
  11.1 s (p2 2.6 s, the first copy pops in front of the lit door) to 15.5 s; worst on the cover (clip 13.7 s, p2 5.2 s)
  and through the hold (clip 14.6-15.5 s).
- *Why:*
  - The row is tier A ("her + her ghost row (one subject)", v2 `THROUGHLINE.md` §4) and now the least finished thing on
    screen. v2's belt, bow, collar, sleeves and bag strap were lines, and nothing replaced them (4x crops).
  - Measured on the clip: the first copy's coat is L* 85.9 against the lit door glass's 85.2 at 11.1 s. On the cover
    the white heads are L* 93.1 on the parapet's 89.4, and the coats part from the parapet and towpath (L* 88-90) by
    only 2-4 L*. Her tote is L* 50.0, C* 2.5 (v2: cream, L* 76.7, C* 16.3): a neutral grey.
  - `check_depth`: the row's step at 5.2 s is 7.9 L* (target >= 15; v2 13.0 with its line; 9.0 on the file); her one
    value 26-28 % (<= 20).
  - The palette is not the cause (the coats moved about +0.5 L* from v2, the parapet not at all where I sampled): the
    line's job went undone.
  - "the subject never melts into what is behind it" (owner, v2 G4: DIRECTION rule 2). Shown like this, the owner
    would judge decision 1 (no outlines) on a subject that looks cheaper than v2's, and the "for life" picture fails
    with the sound off (the cold viewer read the row as posts or a fence).
- *Fix* (`V2S1_row.tsx`, `V2S1_row_fig.tsx`):
  1. Each copy's `FormShade` across the side away from the key, about 40 % of the coat (CRAFT §d.4's 25-40 %), at
     -22 L* in the warm family (tier A's -20 to -25, §d.3). The lit half then parts from the rose wall (L* 67.7) and the
     shade half from the parapet, the towpath and the door glass (L* 84-92).
  2. The heads: a lit cap and a shade crescent away from the key (the cool family, C* >= 8), so the white hair still
     reads white and parts from the parapet.
  3. The coat's drawing back as value shapes, never lines, on every copy and on her: the belt a ~4 px band in the
     coat's deep shade with a small filled bow, the collar a lit / shade pair, the sleeves a shade sliver.
  4. Her: the tote cream again with a warm shade; its strap a 2.0 px line in the bag's deep shade (a strap is a line:
     rule 4; 2.0 px on a floating plane: decision 7); the plant she carries in a mid sage >= 10 L* off the lobby plant
     behind; a rim on her hair's key side where it crosses the dark door frame (CRAFT §d.8).
  5. Only if the row's step is still under 15: the copies' oat one step darker (-6 to -8 L*, the cold viewer's lever),
     as long as the lit half stays clear of the rose wall.
- *Check:* `check_depth` row step >= 15 L* at 5.2 s and her one value <= 20 %; at 390 px the row reads as a queue of
  people to its far end (the white heads against the parapet), and the first copy shows against the lit door at 11.1 s.
- *Raised by:* art MUST 1 (and SHOULD 10), cold MUST 1; REPORT §5 flag 1.

**2. The bank is one milk-tea-brown diamond chequer.**
- *Where:* our bank, x 0-1080, y 1150-1920 (about 40 % of the frame), from clip 9.0 s (p2 0.5 s; already in frame 0's
  pale wash) to the end.
- *Why:*
  - Both reviewers flag it at a glance. The cold viewer's 2 s look: "a big brown tiled floor ... a diamond pattern",
    the first thing that looked off; the art director: an argyle floor over about 30 % of the frame.
  - Measured (y 1190-1920): median L* 58.7, h 60, C* 19.1. 61 % of the bank (23 % of the frame) sits at h 50-70,
    C* 15-25, L* 50-66 (top colours #B09078, #A88870, #A88070); only 9 % at h <= 50. At 390 px the two facet tones
    read as diagonal diamonds (`phone_4.png`).
  - Two causes, both read in the code. `PAVING.calm` is 2 tones 4.5 L* apart on 1.2 m cells snapped to a 0.3 m grid,
    and with 2 tones lib/patchwork's neighbour rule (">= 3 for the neighbour rule; 2 = a far plane's two values")
    makes near neighbours alternate, which the bank's two-point camera turns into diamonds. `near.ts` `noBeige` trusts
    lib/water `neverBand`, which calls a colour beige only under C* 18; E's `nearStep` had already lifted the stone to
    C* ~19, so the terracotta turn (`TERRA_H` 50) never fires (SCENE §5: "noBeige is then a no-op").
  - The owner's feeling 2 is a simpler world that never shows at a glance ("Like you can't immidetaly spot that
    something is off"); DIRECTION rule 6: "never beige, muddy tan, olive or grey"; near.ts's own comment names h ~61
    "muddy tan". As it stands the owner would judge decision 2 (the near world in mid-tones) as muddy and decision 3
    (the patchwork) as a pattern fill.
- *Fix:*
  1. `V2S1_patch.tsx` `PAVING` / `treadPatch`, a new default setting: 3 tones 5-7 L* apart, each turned ~5 deg in hue
     within dE00 8 of the base (explicit tones or lib/gamut `siblings`: `patchTones` keeps the hue); cells ~2.0-2.4 m
     so the near facets land at ~60-80 px (CRAFT §b: 3.5-7.5 % of W); `jitter` 0.4 (the lib's maximum); `grid` 0.6 m
     or off; marks about 1 in 24; the key bias kept. Its flood: the facets under the one circle front, as the sky's
     (today `PatchFill` floods cell by cell, a front that steps tile by tile like a digital dissolve: cold SHOULD 1).
  2. `near.ts`: for the bank's big fields (plane -1's treads and paving, plane -2 things over ~1 % of the frame),
     treat h 55-95 at C* < 23 as beige (or `TERRA_H` 46 / `TERRA_C` 22 for them), so they turn a warm terracotta-rose
     stone at the same value.
- *Check:* `patchworkProblems` and pro_4's fields measure; the bank's median h <= 50, under 20 % of its pixels at h
  55-95 with C* < 22, L* p50 still 55-60 (decision 2's values kept); at 390 px no repeat in a 2 s flick, and it reads
  as warm stone next to v2.
- *Raised by:* art MUST 4, cold MUST 3 (and SHOULD 1); REPORT §5 flag 2.

**3. The darks made whole panes dark beside W: W stops being the one dark pane, and the squint leaves her.**
- *Where:* the wing, x 330-1080, y 600-1050: every unlit tier-C pane (W, x 807-913, y 609-773, and the door excepted).
  They go dark at p2 0.50-0.60 s (clip 9.0-9.1 s), 0.1-0.2 s after W's own click at 0.40, and stay to the end.
- *Why:*
  - Measured: the ground-floor panes beside the door L* 29.1 (v2 78.1), the first-floor rooms L* 33 (v2 85-87), W
    L* 22.3 in both, so W sits only 6.8 L* under them. The right ground-floor pair is as big as W (16.3k px against
    16.6k, art).
  - Their local contrast is 10.2-12.4 (v2 4.2-5.6) against her 16.8 (boxes round each): 1.4x, where CRAFT §b asks
    A >= 2x C. The café stranger now stands 44.7 L* off the pane behind him (v2 4.3), more than the row parts from its
    bridge.
  - Squinted at 300 px, v2's darkest masses are W and the figures at the door; pass 2's spread over five to seven
    panes, the spray and the crown (`squint.png`).
  - W is the film's thread ("it goes dark when she quits (0.40)", v2 THROUGHLINE §1.2) and tier A at its beats (0-0.40
    s, and from 5.59 s through the hold); her and her row are A in between (§4). A "owns the contrast" (DIRECTION
    rule 2), and rule 6 puts the real darks "where the eye should go, drawn in many small pieces", not in five big
    slabs on tier C (about 20 % of the dark area, art).
- *Fix* (`V2S1_set_wing.tsx` `darkPaneInto`, the unlit branch; `darks.ts`):
  1. The room becomes a band at the pane's foot, 12-25 % of its height (`lo` ~0.75-0.88; today 0.32-0.44, so 56-68 %
     of the pane is dark), under glass that mirrors the sky in v2's cool family (L* 60-75). The sill step stays.
  2. Drop the white diagonal glint (the `CM.paper` sliver) on the glass (art SHOULD 4: a stock-vector trope).
  3. W stays the only pane dark as a whole: every other pane's mean at least 15 L* above W's.
  4. If the darks then fall under 6 % or 120 pieces, put the difference where the eye should go, in small pieces at the
     door: its reveals, the lobby, the coping at her feet (cold).
- *Check:* pro_4: 6-10 % under L* 40, >= 120 pieces, >= 9 cells; the tier-C panes' local contrast back near v2's (7.5
  by the cold viewer's measure; CRAFT §b's C cap is 7) and hers >= 2x theirs; the 300 px squint at 3.0 and 5.2 s lands
  on W and the door.
- *Raised by:* art MUST 2 (and SHOULD 4), cold MUST 2 (a) and (c).

**4. The top-left spray left v2's autumn, and it outshouts her.**
- *Where:* the spray, x 0-340, y 0-300, all through pass 2 (clip 8.5-15.5 s); the near crown, x 0-360, y 1180-1460.
- *Why:*
  - Measured: v2's twig is 90 % warm (gold and rust), L* 72.9, C* 33.5, 9.5k px; pass 2's spray is 96 % green, L* 53.3,
    C* 20.0, 29.5k px (3.1x the area).
  - Its local contrast went from 1.8 to 6.3, and its edge pixels (8.6k at p2 3.0 s) are 2.3x hers (3.7k; dE >= 6 per
    px; the cold viewer's threshold gives ~5x).
  - Gold and rust leaves still fall past the summer-green crown (two of them at (285, 1265) and (412, 1300) on the
    cover).
  - The owner: "I like the colors of our last video about Google" (the study: keep v2's hues). The cold viewer's 10 s
    test named the spray, not her, as the crispest thing: the reverse of feeling 2 and of rule 2.
- *Fix* (`V2S1_nature.tsx`):
  1. `s1SpraySpec` `autumn` 0.1 -> ~0.75 (lib/foliage `autumnTone` gives v2's gold h 76 and rust h 52; two or three
     leaves stay sage).
  2. Lift its tones (`tones`, or a lighter species green). `autumnTone` keeps each leaf's value (+6 / +4 L* over its
     green), so the hue alone would leave a dark gold near L* 59; the lit gold should land near v2's L* ~70 and the shade
     steps stay tier C's -7 to -12 (CRAFT §d.3; the cold viewer's "lift its shade leaves ~12 L* toward the sky").
  3. Bring its weight back toward v2's twig: `leaves` 10 -> ~7 (or `twigs` 2 -> 1), or the branch ~60 px further
     off-frame.
  4. Only if it still wins the 10 s test: `veins: 'midrib'`, never 'none' (§5 item 4).
  5. `s1TreeSpec` `autumn` 0.035 -> ~0.15-0.2, so the falling leaves have a source; the crown's values stay (it is the
     dark near frame).
- *Check:* `s1NatureProblems` returns [] in both palettes; the spray >= 80 % warm; its edge pixels under her group's at
  p2 3.0 s; her local contrast >= 2x the world's; the 10 s test names her.
- *Raised by:* art MUST 3, cold MUST 2 (b).

**5. The send must separate what is decided from what is proposed.**
- *Where:* the message to the owner and `test/ab_switches.jpg`.
- *Why:*
  - Pass 2 carries 10b's palette, the one change in it that is still a proposal (SCENE §2: every switch is decided,
    "10b's palette aside"). It is the main reason pass 2 is less colourful than Before (C* p90 / p50 1.96 -> 1.45, the
    warm-lit share 31 -> 8 %: REPORT §5 flag 3), and the owner likes v2's colours. Without a word and a picture he
    judges decisions 1-6 and the proposal as one thing.
  - Three more things the clip can't show on a phone: the mottle (invisible there, by design); decision 4 (S1's wing
    leaves the far stage a 260 px gap, the landmark ~10 x 45 px at phone width); and the parts' lengths (v2 6.1 s,
    pass 2 7.0 s with its 0.9 s locked hold).
- *Fix* (a render from `src/look/poster_s1/PosterS1.tsx`; no code change):
  1. After MUST 1-4, render `PosterS1` at 5.2 s with `{"preset":"pass2","palette10b":false}`, put it beside pass 2 on
     `ab_switches.jpg`, and re-make the sheet's single-switch A/Bs from the fixed code.
  2. The message, in a few lines: a look test of v2's opening, not a film (playbook: "Every cut sent to the owner says
     what stage it is"); Before 1.2-7.3 s, After 8.5-15.5 s (the brief's "about 0.6-6.7 s" is 0.6 s early: all three
     reviewers); what is decided and what is proposed (10b: the pair on the sheet); the mottle is judged on the sheet's
     x10 crop; decision 4 is shown here in principle only and at full size on a scale landing; both halves carry v2's
     voice alone at -14 LUFS (v2's S1 with its mix is -16.4); open it as a file, not as a messenger video.
- *Raised by:* art SHOULD 8 and 9, cold SHOULD 5-7, tech SHOULD 5, 6 and 8.

**6. The far landmark is a pink sticker, darker than the roofs in front of it.**
- *Where:* the telecom tower, x 85-115, y 636-760, left of the sun, from clip 9.0 s (p2 0.5 s) to the end.
- *Why:*
  - Measured row by row: L* 81.4-82.5, C* 15-19, h 37; dE76 17-19 from the mint sky beside its top (rows 640-685),
    11-13 lower down (700-730), and near the sky only at its foot in the warm glow (7 at y 745, 1.5 at 760). The far
    roofs in front of it are L* 83-87 at C* 12-13. The farthest thing is darker and more chromatic than what is nearer:
    the ladder runs backwards.
  - Cause: `s1StageTones` tones it from `S1_AIR` (the warm horizon) at k 0.8, while its shaft stands in the mint band.
    SCENE §6 aimed at "dE ~8-10 ... paler than anything nearer".
  - Rule 2: "far planes converge on the air behind them: lighter, softer in contrast, simpler". The tower carries
    decision 4's one landmark and feeling 1's "something WAY further out".
- *Fix* (`V2S1_far_stage.tsx`): tone the shaft, the rings and the crown from the sky at their own height (`skyColorAt`
  at x ~100, y ~640-740, as the east ghost cluster already is at y 632), k 0.8-0.87, in at most two flat height bands
  (no gradient: rule 5); the pale warm foot only below ~y 740, where it meets the glow; the lit sliver +2-3 L*.
- *Check:* on every row L* >= 86 (paler than the far roofs), C* within 4 of the air, dE76 <= 8 from the sky beside it.
- *Raised by:* art MUST 5; the far stage's read: cold SHOULD 7, tech SHOULD 8.

## 3. SHOULD (the same pass: cheap and safe)
1. **Captions from frame 0** (tech SHOULD 2; noted by cold). Caption ink is 0 px on S1 frames 0-4 of both parts and
   ~11.1k from frame 5, while v2's master shows "She quit Google." from its frame 0 (rule 9: "frame 0 shows the first
   spoken line"; v2's own REVIEW_1 MUST 1). Cause: lib/Film passes `hookAtStart={!only}`, so a shot render hides page 1
   until its own start. Fix in `PosterS1.tsx`: start the first caption beat and its first line at s 0 before handing
   the captions to Film (the line is in REVIEW_tech §10.2). This changes the Before half on purpose, back to v2 as
   shipped. Check: ~11.1k caption px on frames 0-4 of both parts; the Before half against v2's master >= 50 dB on S1
   frames 0-354.
2. **Pass 2's water gets its own troughs** (tech SHOULD 1 and 7). lib/water's `TROUGHS` cache keys on
   `${col}|${y}|${gapMix}|${seed}` and not on the open water's colour, and v2's spec and the 10b copy share seed
   `s1water` and gapMix 0.4, so pass 2 draws v2's lighter troughs. Confirmed: in the box 560-860 x 1170-1250 the clip
   sits 1.76 levels from the lossless stills against the builder's own encode's 1.27, while the sky, the wing and the
   treads match that encode to 0.02. Fix in `V2S1_water.tsx` `ensure()`: the 10b spec gets
   `grid: {...S1_WATER.grid, gapMix: 0.4000001}` (the seed kept, so the ripples stay); tell lib/water's owner to key
   `TROUGHS` on the open-water colour. Then re-run the water's texture A/B on the new file.
3. **Dark bars that read as outlines** (art SHOULD 1, cold SHOULD 8; rule 4). The crate's two long hand slots
   (x 375-550, y 1590-1700) become short rounded slots (about a quarter of the crate's width) in the crate's own wood
   shade, and the long shade bar under the upper crate gets thinner. The planter's soil lip (x 0-280, y 1470-1590), the
   bench's top stripe (x 850-1080, y 1420-1470) and the pot's board become bands of 8 px or more with a lit edge, or
   go. The lintel shadow across the lit panes (`darkPaneInto`'s `qq(0, 0, 1, 0.07)`) gets thinner, or becomes the
   pane's own shade step. Files: `darks.ts`, `V2S1_fore.tsx`, `V2S1_set_wing.tsx`.
4. **The roof terrace's three dark trapezoids** (x 370-430, 480-550, 590-665, y 625-650; art SHOULD 2; SCENE §7's own
   open flag). Just under the caption band they read as the pitched roofs of hidden houses. Drop them, or give them
   their plants and a lit face (`V2S1_set_wing.tsx`).
5. **The wing's west corner** (tech SHOULD 3 and art SHOULD 8's last point: the same corner). Where the end wall
   (`s1SideWall`) meets the corner pier (x ~310-330, y 805-1033) a 1-px seam sits at L* 69-70 between 80-83 and splits
   to 74 / 78 at p2 5.2 s: it twinkles in the float (tech: a 6.2 L* swing against a ~2 budget). Give the corner a
   >= 2 px shade face (or run the wall 1-2 px under the pier), and give the end wall's outer face one shade step against
   the calm tower (`check_depth`'s 10.9 WARN). Pass 2 only: the Before half keeps v2's corner. Extend the `nudge`
   strict test to plane 0.
6. **The hero cumulus** (x 575-1055, y 111-272; art SHOULD 7, cold SHOULD 3). The lilac base slab runs past the lobes
   at both ends (a rectangle in the sky), and faint rings sit outside the right lobe (x 1005-1040, y 200-240): soft rims
   that read as glow (rule 5: "never glow discs, blur or gradients"). In `s1CloudSpec`, try `soft: {steps: 1}` or 0
   first (it may end both), then end the shade inside the silhouette as flat steps. If only lib/clouds can trim the
   belly band, flag its owner rather than edit the shared lib.
7. **The crown's two disc motes** (cold SHOULD 4). Two flat pale discs on the crown's shade side (about (272, 1300) and
   (273, 1338)) read as painted dots. Make them leaf-shaped glints at the crown's lit edge (`V2S1_particles.tsx`): the
   playbook's particles are "motes in the light", seen at phone size.
8. **Pip, once found, reads as Pip** (cold SHOULD 2). At x 154-191, y 1356-1415 it is a lavender blob with a pink dot
   (seen at 1:1) that reads as a flower. Let one recognisable piece clear the front leaves (an ear's curve and the
   trunk's tip) through the crown's draw order (`V2S1_pip.tsx`), staying <= 1 % of the frame (0.04 % today), off her eye
   path, and unseen in the 2 s glance (§5 item 7).
9. **The ghost skyline across the whole west gap, at two values** (art SHOULD 8), with MUST 6 in the same file
   (`V2S1_far_stage.tsx` `GHOST_WEST`): the far city goes on past the tower.
10. **REPORT.md's numbers** (tech SHOULD 4 and 7). Re-measure the darks and the twinkle at each rung through one
    accurate decode path (with it the master's p5 reads 33.0-33.5, not 32.2-32.9), and the 720p twinkle on the 1080
    tile grid. After this pass, update REPORT's after row and its §5 flags.

## 4. Where the reviewers disagree, decided
1. **The verdict** (tech SHOW; art and cold FIX_FIRST): **FIX_FIRST.** The tech review's scope (the file, the A/B's
   fairness, the encode, the numbers) holds, and nothing there blocks the send. But the art and cold findings are
   about what the owner will see and judge, and each one checked out on the frames. The brief: SHOW only if no reviewer
   found something that would mislead or embarrass the owner.
2. **The row: a wider shade face (art) or a darker coat and silver heads (cold)?** The shade face first. It is CRAFT's
   own method where close values touch ("a shade face or a counterchanged field parts them, never a line", §c), inside
   §d.4's 25-40 %. A darker coat alone narrows the gap to the rose wall behind the nearer copies (L* 67.7), and a
   neutral silver head breaks "never grey" (§5). The darker coat stays as the second lever if the check still fails.
3. **The panes: sky glass with a band at the foot (art: <= 25 %; cold: 12-15 %, or L* ~45 on the panes far from
   her)?** One rule for every unlit tier-C pane: a band of 12-25 % at the foot under sky glass. One rule is simpler than
   a value by distance, and it keeps the darks as small pieces.
4. **The spray: autumn hues (art) or a calmer silhouette (cold)?** Both, in that order. The hue comes first because it
   is the owner's ("I like the colors of our last video"); with the lifted tones it also lowers the spray's value
   contrast. Then its size; the veins go to 'midrib' only if it still wins the 10 s test. Never a featureless
   silhouette (§5 item 4): the art director rates the nature as the clip's best work, and the cold viewer's own motion
   checks find it clean.
5. **Pip: fine (art) or unrecognised (cold)?** A recognisable piece, still hidden (SHOULD 8). The owner's "keep it, but
   not as obvious" keeps Pip, and a find that reads as a flower isn't Pip.
6. **A palette variant (art, cold: "offer palette10b: false")?** Yes, as a still pair on the one sheet, never as a
   second clip (§5 item 6).
7. **v2's half without a hold** (tech SHOULD 5: tell the owner, or give v2 the hold): tell him (MUST 5). The Before half
   stays v2 as shipped (STUDY §10: "v2 is shipped: the clip copies its S1 code, never edits it").
8. **The opening flood** (cold SHOULD 1): the new paving floods under one front now (it rides on MUST 2). Its speed
   waits for the next film (§6), so the A/B keeps v2's timing in both halves.
9. **Her 5.2 s silhouette** (REPORT's `check_depth` WARN against tech's PASS on the file): both sit on the line, as
   REPORT says. Her drawing loss shows in the 4x crops either way, so MUST 1 stands.

## 5. What NOT to change (it would break an owner rule)
1. **No line back on the copies or on her:** neither REPORT §5 flag 1's third option ("the copies as the one lined
   exception") nor the belt, collar and sleeves as lines. DIRECTION rule 4: "No outlines on any tier (owner,
   2026-10-29: the A vs B picture's B, "Go with your suggestions"): an edge is a step of light and shade (rule 5) or of
   value". The strap is the exception the rule names itself: "Thin lines only on small things that ARE lines", at
   2.0 px on a floating plane (decision 7).
2. **No neutral grey for the heads, the tote or any shade** (the cold viewer's "mid silver (L* <= 72)" if read as
   grey; today's tote at C* 2.5). DIRECTION rule 6: "never beige, muddy tan, olive or grey"; rule 5: "Shadows are
   colour, never grey". White hair keeps a tint (C* >= 8, CRAFT §d's "no shadow pixel under C* 8").
3. **The darks don't fall under the decided range when the panes are lifted** (both pane fixes lower the share).
   Decision 2 (b), "6-10 % under L* 40 in many small pieces" (STUDY §9, the owner: "Go with your suggestions"), and
   DIRECTION rule 6: "real darks where the eye should go, drawn in many small pieces (windows, doorways, eave
   undersides, the shade under trees: owner, 2026-10-29)". Move them to the door; never just delete them.
4. **The spray is not flattened into a two-tone silhouette with no veins** (the cold viewer's "(two tones, not
   four)" and "drop the vein network"). The owner on nature: "they are obviously very real, but if you look closely
   we combine the real effects with the lower poly kind of effects"; on the world: it should "coherently fit into the
   style and the picture". The spray and the crown are one species and stay one drawing.
5. **The mottle is not strengthened so that it shows on a phone** (art and cold: invisible there). DIRECTION rule 4:
   "texture stays VERY subtle and opt-in"; the owner: "i like texture point yes we can perhaps start playing with it,
   very subtly especially if its adding to the premium look sure".
6. **No second clip with v2's palette** (art SHOULD 9, cold SHOULD 5). The playbook: "One version: one deliverable per
   gate (one script, one take, one animatic, one look clip), never several renders or takes of one gate unless asked".
   The palette pair goes on the one A/B sheet (MUST 5).
7. **Pip stays hidden while it gets its recognisable piece** (cold SHOULD 2). DIRECTION rule 2: "found on a second
   look, never on the subject's eye path; a quiet "find Pip" in most exterior shots, none in closes and charts, hidden
   on the cover too (owner, 2026-10-29)". The 5.2 s frame is the cover.

## 6. Deferred (not this pass; listed so nothing is dropped silently, as the playbook asks)
- **The lit panes' furniture** as fewer, nameable shapes on the sill line: a person at a screen, a plant, a pendant
  (art SHOULD 3). Drawing work; the owner's verdict doesn't hinge on it.
- **The near boxes' faces:** a lit top, a shade face and 2-3 planks, or one object of use such as a chalkboard menu
  (art SHOULD 5). Drawing work, part of the 19 % edge-free fields.
- **Vibrancy as confetti:** a canal livery on the boats, a red life-ring, warmer bunting (art SHOULD 6). Wait for the
  owner's call on 10b (MUST 5): new saturated pieces would mix one more proposal into the A/B. When it comes, keep rule
  6's "at most one pop" and "saturation as confetti, never fields".
- **The next films' opening** (cold SHOULD 1): a slower flood (5200 -> ~3000 px/s) and a first line bigger than a
  70 px door, for rule 9's "~0.3 s was invisible". It goes to v4 / v5's G4; here it is v2's timing in both parts.

## 7. The re-check after the fix pass (the gate before SHOW)
- **The copy is still v2:** `PosterS1` preset v2 against `Film2R-V2S1` at 1.0 / 3.0 / 5.2 s, 0 px (SCENE §4). After
  SHOULD 1: the Before half against v2's master >= 50 dB on S1 frames 0-354, and the caption on frames 0-4 of both
  parts.
- **The after row** (`look_test_row.py` at 1.0 / 3.0 / 5.2 s) against REPORT §2; `check_depth` (the row's step >= 15 at
  5.2 s, her one value <= 20 %).
- **The darks** (pro_4: 6-10 %, >= 120 pieces, >= 9 cells); **the hierarchy** (her local contrast >= 2x tier C's; the
  300 px squint at 3.0 and 5.2 s on W and the door).
- **The bank's hue** (median h <= 50; under 20 % at h 55-95 with C* < 22; L* p50 55-60), `patchworkProblems` and the
  fields measure; **the tower** row by row; `s1NatureProblems` in both palettes.
- **The clip:** capcheck, framecheck and the master's bitrate on the new file; at 390 px the 2 s flick (nothing looks
  off) and the 10 s test (the crispest things are her and her row).
- **The papers:** REPORT.md updated; `ab_switches.jpg` re-made from the same code, with the palette pair (MUST 5).

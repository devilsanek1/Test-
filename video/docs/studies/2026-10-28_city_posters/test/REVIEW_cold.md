# Review: the cold viewer on a phone (poster look test v1)

*Reviewer: the cold viewer (I had never seen this project's other films). 2026-10-29. The clip:
`video/deliverables/tests/poster_look_test_v1.mp4` (15.5 s, 1080 x 1920, 60 fps). I looked at frames ~400 px wide, as on
a phone. Times are given twice: pass 2's own clock ("p2 3.0 s"), then the clip's ("clip 11.5 s" = p2 + 8.5 s).*

**State: done.**

## 1. What I looked at
- **The timeline, measured** (luma per frame): the "Before: the Google video" card runs 0-1.2 s (f0-71), **v2's S1
  1.2-7.3 s** (f72-437), the "After: the poster lessons" card 7.3-8.5 s (f438-509), **pass 2 8.5-15.5 s** (f510-929).
  The brief's "Before 0.6-6.7 s" is 0.6 s early. The voice starts at 0.12 s in both parts (identical envelopes, speech
  by ~0.22 s). The cards and the 0.9 s hold are silent.
- **Stills** at 400 px: both parts at 0, 0.05 ... 6.98 s, the cover (5.2 s), and "squint" copies (300 px, blur sigma 3).
- **Strips** (every 4th frame over 1 s): p2 0.30-1.28 s (the flood), p2 2.0-3.0 s (the float's second leg and the gust:
  whole frame, crown, spray, people), p2 5.0-6.0 s ("for life.", Pip, the float home); v2 at the same moments. Every
  frame of the bank's flood (p2 0.48-0.72 s), every 2nd frame of p2 0-0.5 s.
- **Measures** (my own scripts, scratch only): L*, C* and hue per region; CRAFT's local contrast (mean |L* - Gauss(L*,
  sigma 16)|); edge density; the dark masses; a frame-to-frame reversal map for twinkle and boil (p2 0.7-7.0 s against
  v2 0.7-6.1 s); the pixels changing per frame in the hold; the sky's row profile for bands; pop detection.
- **Reference:** the seven posters at 300 px, DIRECTION, CRAFT's tier table and patchwork, SUMMARY, STUDY §9-10, REPORT,
  SCENE, and the code where a number needed explaining (`near.ts`, `V2S1_clock.ts`, `lib/water.tsx` `neverBand`).
- **Not done:** no real phone (400 px frames stand in for one); I did not review the A/B sheet or the sound mix.

## 2. Verdict: FIX_FIRST
Pass 2 is a clear step up from the Before half. The world has weight and depth now: dark window interiors, iron door
frames, dark hulls, a real plane tree, a pale far city with a tower, a calm sun. It looks less like stock vector art. It
is also smooth in motion: no twinkle, boil or banding that I could see or measure (§5).

But three things would mislead the owner's judgement of the very decisions the test is for:
1. **The row of copies reads as a row of pale posts** at the cover frame and in the hold. The "for life" picture is
   lost, and it would be blamed on "no outlines" (decision 1), when the cause is that the copies were given nothing in
   place of their lines.
2. **The crispest thing on screen is the top-left leaf spray, not her.** The owner's own 10 s test fails. The world got
   crisper (the spray, the wing's new dark panes) while the subject got plainer.
3. **The bottom 40 % of the frame is one milk-tea brown floor.** It is what looked "off" to me in the first 2 s, and it
   would make "the near world in mid-tones" (decision 2) read as muddy, when the problem is one hue on the whole bank.

Each is a fix to values and colour in 3-5 files of `src/look/poster_s1/`, not a rebuild (§7). With them fixed: SHOW.

## 3. The glance test on pass 2
- **2 s** (first look at p2 3.0 s, 400 px): "A canal-side office with a Google sign, people at the door, a café terrace
  on our side; dark leaves top-left, a cloud top-right; a big brown tiled floor across the bottom half." **What looked
  off:** the floor. It is a heavy, dull brown with a diamond pattern, more like an empty plaza than a canal bank. By 4-5
  s a second thing: the long pale row along the towpath, which I read as a fence or posts, not people.
- **10 s, the crispest thing:** **the leaf spray in the top-left corner** (dark, sharp leaves with veins and lit and
  shade facets against open sky). Then the plane tree bottom-left, then the wing's dark window panes and the "Google"
  sign. **The woman in teal is easy to find** (teal against the pale door) **but she is not the crispest thing.** She is
  small (~65 px tall at phone width) and plain. Her coat lost its belt, bow and collar, her bag lost its strap and
  floats beside her, and the plant she carries has almost no leaves left.
- **Numbers that agree** (p2 3.0 s against v2 3.0 s):
  - The spray's edge pixels rose 3.1 % -> 13.9 % and its hardest edges 5.3 -> 16.2 dL*/px. Its ~14,000 edge pixels are
    ~5x hers.
  - Her edge pixels fell 33 % -> 24 %.
  - The wing's tier-C panes (all but her window W) went from local contrast 7.5 to **13.9** (CRAFT's cap for C is 7, 9
    for the still near world). The ground-floor panes right of the door went 4.5 -> 9.6. These panes now outshout W
    itself (10.0).
  - Her local contrast is 16.5, only 1.2x the panes' (CRAFT: tier A >= 2x C; v2 2.2x). REPORT's salience share for
    the subject fell too (9.3-10.1 -> 8.5-9.3 %).
  - The squint versions show it at a glance: v2's heaviest contrast is on the row at the door; pass 2's is in the
    two left corners and on the wing.

## 4. The opening, sound off, captions, Pip
- **The opening, frame 0 to ~0.8 s.** Frame 0 is a washed-out still (L* p50 89, p5 78, nothing under L* 60). On it the
  pen draws her (~25 px wide at phone size) and the door's frame (~70 px), then W (0.27-0.39 s).
  - **On a phone the draw-on is a small event**, not a bold one. It is the same as v2's. I could miss it while
    scrolling.
  - What stops the thumb is the caption "She quit Google." (from frame 3), then the colour flood (p2 0.44-0.78 s).
    **Pass 2's flood is much bigger than v2's:** the bank's median drops from L* 85 to 59 and the leaves go dark green,
    while v2's bank barely moves (93 to 87). So pass 2's opening is the bolder of the two.
  - But the flood lasts 0.34 s. That is close to the owner's "~0.3 s was invisible". On the bank (0.53-0.72 s) its front
    steps tile by tile, a blocky edge that reads a little like a digital dissolve.
- **Sound off.** The captions carry the story. The picture reads "she walks out of Google" well (p2 1.0 s). The "for
  life" beat's picture (a queue of her copies, ageing to white hair) reads at phone size in v2 but not in pass 2 (§7.1).
- **Captions: good.** They are legible at 400 px: dark ink on a calm mint band, popping in place with no clipped
  letters. The highlight boxes ("quit", "criticizing", "for life.") read, and nothing crosses the band. One small
  inherited point: frame 0 has no caption ("She quit Google." pops at frame 3, 0.05 s; rule 9 wants it on frame 0).
- **Pip: hidden, yes; recognised once found, no.** On a second look I found a lavender patch inside the plane tree's
  lower crown (x 154-191, y 1356-1415, 0.04 % of the frame), with a pink paw pad on "life" (p2 5.0-5.4 s, clip
  13.5-13.9 s). At phone size it is a ~14 x 22 px lavender blob with a pink dot. It reads as a flower, not a
  character. v2's Pip on the bollard is an unmistakable lavender elephant. A "find Pip" pays off only if the found
  thing is Pip.

## 5. Motion: twinkle, boil, seams, pops, banding
- **Twinkle at the crown's edge: none visible at 1x.** Reversal energy in the crown box is 0.0098 per pixel per frame,
  v2's 0.0185, at the same motion. The spray moves 5x more than v2's twig (wind) and its reversals rise in proportion
  (0.017 per unit of motion in both). The water's reversals are well under v2's (0.005 against 0.030).
- **Boil: none.** In the hold (p2 6.1-7.0 s, clip 14.6-15.5 s) 0.84 % of the sky's pixels change per frame (max 1.8,
  codec level, the cloud's drift) and 0.27 % of the paving's. The mottle is locked to the world.
- **Banding: none** in either sky. The only row steps over 0.35 L* are the caption's own rows (and v2's thin cloud
  bar). The mottle shows only under an extreme contrast stretch, so **on a phone the texture is invisible** (§8.6).
- **Pops:** only the designed ones, shared with v2: her step-out (p2 1.0 s), the door frame's hand-off from tier A at
  1.40 s (near-black iron to slate in one frame; v2 does the same), the copies arriving (2.13, 2.67, 3.33, 4.33, 4.93,
  5.12 s), and the sign's letters typing on (~1.0-1.2 s). Nothing popped elsewhere.
- **Seams:** none at phone size. The crown's straight diagonal lit/shade split reads as one big facet, in the posters'
  spirit.
- **Small oddities that are not glitches:** two flat pale discs (the moved motes) sit on the crown's dark side and read
  as painted dots (§8.4). The cloud's lilac base runs past its body as a flat slab, and its bumps have soft feathered
  rims (§8.3).

## 6. Before vs after, in plain words
- **Before (v2):** a pale, airy pastel world where almost everything sits in the same light values and outlines hold
  the shapes. It is friendly and clean, but thin and cheap: the floor is a big empty peach area, the tree is a few green
  discs, the sun is a loud orange sticker, and the mascot sits mid-frame like a sticker too. Nothing feels solid.
- **After (pass 2):** the same scene with weight. Things have dark undersides and interiors, the space steps back in
  layers (a dark near edge, a mid-tone bank, the water, the wing, a pale far city and tower), the nature looks designed,
  and the sun is calm. **It is more premium than Before**, because it looks built and lit rather than printed.
- **Why it is not yet premium like the posters:**
  1. **Colour.** The posters ring with many small vivid pieces. Pass 2 is mint, cream and milk-tea brown, flatter in
     colour than Before (REPORT: chroma spread 1.96 -> 1.45, 10b's palette, a proposal).
  2. **The biggest area is still an empty floor**, now brown instead of peach. The posters never leave a big floor;
     their near ground is things.
  3. **The hierarchy of finish is upside down.** The story group (the copies, her coat, her bag) is now the least
     finished thing on screen, and a corner of leaves is the most finished. The posters do the opposite: the hero is
     the crispest thing and the world is simpler.
  4. **The texture adds nothing on a phone** because it can't be seen there.

## 7. MUST-FIX (3)
1. **The copies read as pale posts, and her finish went with the outlines.**
   - **Where:** the towpath row left of the door (x 0-480, y 920-1060) from p2 ~3.3 s, worst at the cover p2 5.2 s
     (clip 13.7 s) and through the hold (clip 14.6-15.5 s). Her own figure (x 560-640, y 900-1100) all beat.
   - **Why:** without their lines the copies are cream rectangles with round heads: no shoulders, sleeves, belt or
     collar. The white-haired ones vanish into the pale bridge. At 400 px I read the row as posts or a fence, so the
     "for life" picture fails with sound off.
     - Measured at p2 5.2 s: the row's edge pixels fell 40 % -> 22 % and its local contrast 12.6 -> 8.9.
     - REPORT's row step is median dL* 7.9 against the bridge and towpath (target >= 15; v2 13.0).
     - Her bag strap was a line, so the bag now floats beside her.
     - This would mislead the owner's verdict on "no outlines".
   - **Fix** (`V2S1_row.tsx`, `V2S1_row_fig.tsx`):
     - (a) Every copy's oat coat one step darker in its warm family (~-8 L*), with the white heads drawn a mid silver
       (L* <= 72) with a lit cap, not paper white, so the row sits >= 15 L* under the bridge and towpath.
     - (b) The coat's form back as fills, not outlines: a shade-face sliver for the sleeves and the shoulder slope, the
       belt as a ~4 px band in the coat's deep shade with the bow as a small filled knot, and the collar as a lit/shade
       pair.
     - (c) For her: the bag strap back as a 2 px line in the bag's deep shade (rule 4: a strap IS a line; `lines2px`),
       her belt and bow as fills, and the carried plant's leaves in a mid sage >= 10 L* off the lobby plant behind.
     - Check: the row's check_depth step >= 15 at p2 5.2 s, and at 400 px the row reads as a queue of people.
2. **The world outshouts the subject: the spray and the wing's dark panes are crisper than she is.**
   - **Where:** the whole beat (p2 0.8-6.1 s). The top-left spray (x 0-340, y 0-300); the wing's unlit panes (x
     330-1080, y 640-1050, except W at x 803-910 and the door); the crown (x 0-360, y 1180-1460).
   - **Why:** the owner's 10 s test names the top-left spray, not the woman in teal, as the crispest thing. The panes
     are tier C but sit at local contrast 13.9 (cap 7; v2 7.5) and outshout W (10.0). Her 16.5 is only 1.2x theirs
     (CRAFT: A >= 2x C). Rule 2: A owns the contrast. Shown like this, the owner would judge feeling 2 ("crisp main
     objects, a simpler world") on a frame that does the reverse.
   - **Fix:**
     - (a) `darks.ts` / `V2S1_set_wing.tsx`: on the tier-C panes, draw each unlit pane's dark room as a short band at
       the pane's foot (~12-15 % of its height, where SCENE §5's room starts 32-44 % down and fills the rest), keeping
       the furniture silhouettes. Or lift the room to L* ~45 on panes more than ~250 px from her. Either way the piece
       count holds. Target: those panes' local contrast <= 9 at p2 3.0 s.
     - (b) `V2S1_nature.tsx` `s1SpraySpec`: make the spray a tier-C silhouette. Lift its shade leaves ~12 L* toward the
       sky (two tones, not four), drop the vein network, and either use ~30 % fewer leaves or push it ~60 px further
       off-frame. Target: fewer edge pixels than her group.
     - (c) If the darks then dip under 6 %, take the difference from small darks around her (the door's reveals, the
       lobby, the coping at her feet): rule 6's "real darks where the eye should go".
     - Check: the squint at 300 px lands on the door, and her local contrast is >= 2x the panes'.
3. **The bank is one milk-tea brown field.**
   - **Where:** our bank, y 1190-1920 (the bottom ~40 % of the frame), from p2 0.72 s to the end.
   - **Why:** 70 % of the area below the coping is one brown family. Three quarters of it sits at hue 55-62, C* 18-22,
     L* 57-63 (mostly #A4806C, #B0907C, #AC8C78), and it covers ~25 % of the whole frame.
     - At phone size that reads as the "muddy tan" DIRECTION rule 6 rules out ("saturation as confetti, never
       fields"). `near.ts` names it "muddy tan" (h ~61) and means to turn it terracotta (h <= 50).
     - It slips through because `lib/water` `neverBand` calls it beige only under C* 18, and the bank shows C*
       18.4-19.5. Only 5.6 % of the bank ends up at h <= 50.
     - It was the first thing that looked off to me in 2 s, and it would make decision 2 (the near world in
       mid-tones) look muddy.
   - **Fix:**
     - (a) `near.ts`: for the bank's big fields (plane -1 treads and paving, plane -2 near things over ~1 % of the
       frame), treat h 55-95 at C* < 23 as beige (or TERRA_H 46 / TERRA_C 22 for them), so they move into a warm
       terracotta-rose stone with the value kept (L* 55-60).
     - (b) `V2S1_patch.tsx` `PAVING.calm`: let the two facet tones swing ~5 deg in hue as well as 4.5 L*, within dE00 8
       of the base (CRAFT's patchwork), so the floor reads as stone with colour, not two values of one brown.
     - Check: the bank's median h <= 50, under 20 % of its pixels in the beige band at a C* 22 cutoff, L* p50 still
       55-60, and at 400 px next to v2 it reads as warm stone.

## 8. SHOULD
1. **The opening's flood** (p2 0.44-0.78 s, clip 8.94-9.28 s): the bank's front steps tile by tile. Flood the paving's
   facets under the one circle front, as the sky does (one clean arc), in `V2S1_patch.tsx`. At 0.34 s the whole flood is
   at the owner's "~0.3 s was invisible" edge. For the next film's opening, slow it (FLOOD 5200 -> ~3000 px/s, so the
   bank lands over ~0.5 s) and draw a bigger first line than a 70 px door. Here it is v2's shipped timing, the same in
   both parts, so it doesn't bias the A/B.
2. **Pip, once found, should read as Pip** (`V2S1_pip.tsx`, the crown's draw order): let one recognisable piece clear
   the front leaves (an ear's curve and the trunk's tip, or the eye) while staying <= 1 % of the frame and off her eye
   path.
3. **The cloud** (x 575-1043, y 111-272): trim the lilac base slab to the cloud's own silhouette (it runs past the body
   on the right, a "rectangle in the sky") and give the bumps hard edges (the soft feathered rims read as glow; rule 5)
   in `s1CloudSpec`.
4. **The two pale disc motes** in the crown's shade (around (262, 1326)) read as painted dots: drop them or make them
   leaf-shaped glints at the crown's lit edge (`V2S1_particles.tsx`).
5. **Tell the owner that pass 2's palette is 10b, a proposal, not a decision**, and that it is the main reason pass 2 is
   less colourful than Before. Offer the same pass 2 with v2's palette (`palette10b: false`) beside it, so the approved
   decisions are judged apart from the palette.
6. **Tell the owner the texture can't be seen on a phone** (it shows only under an extreme contrast stretch), so this
   clip can't answer "does it add to the premium feel?". Point to `ab_switches.jpg`'s x10 crop.
7. **The far stage barely shows in S1:** the tower (x 88-111, y 636-759) is ~45 x 9 px at phone width, in the left
   sliver the wing leaves open. It reads as "a far city", not as scale. Feeling 1 ("something WAY further out") can't
   really be judged here. Say so, and test it on the scale-landing frame, where the designed view is allowed to be big.
8. **The crate's new darks** (the hand slots and the long shade bar under the upper crate; the crate at x ~365-545,
   y ~1555-1780) read as painted-on plum stripes. Make them thinner, or use the crate's own wood shade (`darks.ts`,
   `V2S1_fore.tsx`).

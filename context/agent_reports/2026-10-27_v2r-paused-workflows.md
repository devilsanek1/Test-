# kit review (wf_9112485e-4ca): completed agent results at the 15:05 UTC pause

- started: contract-sheet

## result
I built the kit contract sheet and the four assembled frames, and committed them. The kit is not ready to freeze yet: 8 placement checks fail, as do several size and fullness checks (details below).

BUILT: `/home/user/Test-/video/src/entry-v2r-contract.tsx` (commit cdec81f, tsc clean). `KitContract` is 1080 × 22846 and shows every cast piece, Pip pose, canal and DC piece at its map.ts size. Each piece is measured live (its drawn bbox) against its rule; there are 8 clearance checks between Pip/ghosts and what they sit next to, true-size windows into the sets, and the 4 sample frames at 0.5 with the map's shapes outlined. Also registered: `KitContractFrame-` and `KitContractBare-` for V2S1 / V2S2 / V2S4 / V2S8 (film seconds; Bare = no captions), plus `KitContractS5` / `KitContractS6`.

CHECKED: `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/contract/contract.png` (readable slices in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/contract/pages/contract_p00.png` to `contract_p09.png`), `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/contract/samples_vs_refs.jpg`, `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/contract/life.jpg` (camera pull-out removed from the change maps), `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/contract/fullness.json`. Pass: her and ghosts ≥ 130 (G6 139; S3 silhouette 141 → 133 after the ease-back), staffer 184, near backs at hv 150 are 124-137 wide, Pip 86-120. The caption band is empty in every sample except S2.
NUMBERS (density.py): S1 flat 20 %, 204 obj/Mpx, 4.7 ev/s; S2 27 %, 168, 7.7 ev/s. Fail: S4 flat 32 %, detail 32 %, one flat 1056 × 240 hole; S8 flat 34-35 %, 99-109 obj, 2.3 ev/s (FAR), 1.7 movers; S6 bottom third 40-43 % flat. At 216 px, S1, S2 and S5 read as full as v1; the bottoms of S4 and S8 read empty.
OPEN: boards, tag, post, news box and plaque are labelled K3 stand-ins until L5's K3 lands; S3 and S7 are shown as pieces only; the board clearances assume L5's planned 30 px stiles outside B.
DEFECTS K2 (map.ts):
- Near-head sizes are still 250-330 (S1_SHEET.seatedHeadPx, BOTTOM_THIRD for S1/S2/S3/S6/S7, S6.nearHeads); at that size they are 176-290 px wide.
- S2.pipSeat puts Pip on the reporter's head (overlap 90 × 51) and over the A-board (38 × 29).
- With 30 px stiles, Pip at BOARD_BOLLARD overlaps B's frame by 17 px and ghost S8G4 sits 27 px behind it.
- S6: Pip is 189 px from the clause (< 200).
- S5: Pip overlaps the news box by 14 px; 104 at the start becomes 43 at the end (< 44); S5.end.pipSeat differs from the deck mapping.
- pipBox (0.92 × size) under-reads Pip, which is drawn 1.23-1.3 × size wide.
- S4.nameTag is 200 tall; the 7 rows need about 262.
- S2.aBoard: the body line is 402 px wide, so it squeezes to 27.8 px.
DEFECTS K4 (cast): S1Seated's near row is hv 262-326, and the README sizes are over the cap. Defaults for Staffer, Reporter, S8Ghosts and StaffWindows are in film seconds while scenes run shot time. There is no dog. The steps' life is head turns and cups only, so the bottom 40 % is nearly static (life.jpg).
DEFECTS K5 (Pip): its drawn box (ears plus tail, 1.23-1.3 × size) is undocumented. Everything else passes.
DEFECTS K6 (canal):
- S2Set: the near lamp arm enters the caption band during the 6 % push (768 px in it at 12.90); the default busts are hv 280/304.
- S4Set: the boat's cabin side is the 1056 × 240 hole (bottom third 44 obj/Mpx vs v1's 171-237), and the roof bike sits under Pip.
- S8Set: the cyclist is 300 tall (308 wide); there is no bollard under Pip; there is no `inside` slot for her silhouette in W; its life is thin.
- TerraceRow has no S3 window box, so Pip floats.
- Steps' default people are oversized.
- WingS2's storyOverlay paints over the glazing bars.
DEFECTS K7 (dc): plaqueMount shrinks "The Pentagon" to 37 px (< 56); GateNear leaves y 1300-1780 flat; the GateDC sample heads are hv 248-300. L5 (K3): the her-board stand-in leaves a 384 × 240 blank on the face.
REQUESTS K2 map.ts:
- Near heads hv 140-155 in seatedHeadPx.near, S6.nearHeads and BOTTOM_THIRD.
- S2.pipSeat (520, 1050); BOARD_BOLLARD (735, 1205); S8.ghosts x +25; S6.pipSeat0/1 y 705.
- S5.start.pipSeat (400, 1120) with size ≥ 107; PIP_ASPECT_OVERLAY 1.3 plus the tail.
- S4.nameTag y1 862; S2.aBoard x 140-580.
REQUESTS K6: S2Set lamp-arm top at y ≥ 570 and busts hv ≤ 150; S4Set boat side broken up and the bike moved off (470, 1218); S8Set cyclist ≤ 170, a Bollard at (700, 1249) h 44, a her.inside slot, more lane life; TerraceRow window box at S3.windowBox; Steps defaults at the contract sizes.
REQUESTS K4 / K7 / L5: K4: S1_SEATED.near hv 140-155 (and the README), shot-time or required time props, add a dog. K7: plaqueMount ≥ 300 × 130; add mass to GateNear in y 1300-1780. L5: keep the stiles inside B, or confirm the K2 moves above.

- started: kit-critic

## result
{
 "verdict": "fix",
 "summary": "Not ready to freeze. All requested files were present. I judged them at 216 px beside v1 and reference 1, and measured colours, bottom thirds and motion myself.\n\nWhat works:\n- One coherent palette and line across all sets.\n- Teal is only on her. Orange is only on the sun and the calendar.\n- S1's wing, far roofs, water and boats, and S3's terrace, are specific and close to v1's fullness.\n- The caption band is clean.\n- Pip is charming and specific on the front and 3/4-front sheets, reads at 120 px, and keeps its shape at 44 px.\n\nWhy it still says no:\n\n1. **Empty floors.**\n   - The bottom third (y 1250-1920) is mostly one flat colour: S2 69 %, S6 81 %, S8 53 % paving + 17 % deck, S4 42 % sage cabin + 29 % still water, S5 start 64 % taupe floor.\n   - v1's worst is 42 % for one colour, 55 % for two; S1 is 27 %.\n   - density.py misses this because paving joint lines break its flat tiles.\n\n2. **Life.**\n   - S8 (the payoff) has no movers: 4.4 % of pixels change in 3 s.\n   - S4's water stands still while the world trucks past.\n   - S1's steps are nearly static.\n\n3. **People.**\n   - Small and simple in the contract samples.\n   - But crowds sit on even grids, everyone is the same upright tombstone, and seated figures are standing busts.\n   - Most shots have only about 4-10 people.\n   - Kit defaults still make the big near busts the owner banned (250-330 px, a 300 px cyclist).\n\n4. **The cover (5.30).** It reads as a queue at Google's door:\n   - The ghosts stop legs-together.\n   - A cyclist hides the three outlines.\n   - Her look-alike and a silver-haired walker stand beside her.\n   - The outlines have no fill, so over the brick they read as brick-coloured people.\n\n5. **Pip.** It is shown from behind in six of eight shots, so its charm and its one hook reaction (ears-cover on \"life\") don't land.\n\n6. **Arlington.**\n   - The Pentagon is unmistakable, but the scale is not great.\n   - Start and end share one layout (sky / thin view strip / ~35 % terrace floor).\n   - The start isn't enclosed, so the crane only shrinks the figures about 2.4x.\n   - S5 is the one sickly frame: muddy taupe floor #C7A79F (24 %), grey hedge #7C807A, dark mauve tree crowns.\n\nLanes L3-L6 are already building on these sets, so the fixes belong in kit defaults and K2, not in lane patches.",
 "problems": [
  {
   "owner": "L1",
   "where": "V2S1 4.40-6.10 including the cover 5.30; also 0.0-1.4 at the glass door",
   "problem": "The ghost row reads as a queue outside Google's door, not her future selves walking on. After the stop, all 7 figures stand legs-together, evenly spaced, facing left from the door. A cyclist rides through the row's far end from 4.5 to 5.8 s and hides O1-O3 on the cover. A plum-coated walker with a dark bun (her look-alike) and a silver-haired walker in mustard (a ghost look-alike) stay right of her for about 4 s. From 0.2 to 1.5 s a grey-haired passer-by stands beside her in the doorway, so 'She quit Google' reads as two people leaving.",
   "fix": "Freeze the 4.54 stop and land the 4.98 step mid-stride: one heel up, stride at least 25 % of figure height, one lockstep phase (strideFor/stepsAt). Keep a 60 px clear margin around the row's bbox for every life element from 4.40 to 6.10: the f195 jogger is gone by 3.6, and the cyclist goes before 4.2 or behind the bridge. She is alone in the doorway until 1.40 (nobody within 200 px). Within 300 px of her or the row: no plum or dark hair with a bun, no long coat, no silver or white hair, no paper or oat coat.",
   "severity": "must"
  },
  {
   "owner": "canal",
   "where": "S1Set far towpath and wing, x 0-560, y 800-1100 (the row's backdrop)",
   "problem": "The three bare outlines (O1-O3) have no fill, so over the brick embankment (x 20-170) they read as brick-coloured people, not reference 1's 'not yet real' ink outlines on a white page. G1-G3 stand in front of the pale gold lit pane (#FAE2B7, x 330-510), so paper on pale gold leans on the ink alone. That 160 x 250 pane and the other lit panes are flat gold slabs with one pendant or shelf, which counts as a hole over 200 px.",
   "fix": "Put a pale stucco or limestone mass (#F4E4D2 / #EEE4D4: a boathouse or the bridge abutment) behind x 0-200, y 930-1080 so the ink-only outlines read on a page. Make the pane behind G1-G3 unlit (#5E6F86) or half-blind, so the paper ghosts pop on a darker mass (STYLE's riverside rule). Fill the lit panes with layered interior silhouettes: plants, chair backs, shelves, a coat stand, blinds at three heights. Never screens.",
   "severity": "must"
  },
  {
   "owner": "canal",
   "where": "S8Set, the whole shot 32.93-39.08 (the 37.00 sample)",
   "problem": "The payoff is the emptiest, deadest frame in the kit. Over 3 s only 4.4 % of pixels change (the pen, two steam puffs, Pip's idle): zero movers against DENSE-CALM's 2 or more at all times. y 1250-1920 is 53 % one paving colour plus 17 % flat deck planks. No lamps recede down the lane for the 37.18 lamp run. The default cyclist is 300 px. The stand-in board's legs land at y 1560 and y 1360, so the 560 px board floats. The low sun (420, 640) r 40 touches the board top at y 680. A full-height plum lamppost walls off the right edge.",
   "fix": "Add 5-6 lamps receding down the lane about 110 px apart. Keep 2-4 movers at all times: walkers 60-150 px both ways, a cyclist 170 px or less with a lamp, and a dog. Add the caf\u00e9 owner, two small seated backs at the deck tables and a neighbour at a window. Paint the paving in 2-3 tones with a kerb, drain and planters; put a rug and crates on the deck. Both board feet go on B's leg line, y 1250. Move the sun to (420, 620) so it clears the board by 20 px. Cut the lamppost by the right edge and colour it line brown #9A563C. Add the contract's Bollard (700, 1249) and the her.inside slot.",
   "severity": "must"
  },
  {
   "owner": "L4",
   "where": "V2S5 start (20.55-21.30) and end frame (23.40-24.00)",
   "problem": "The one scale move does not feel great. At 216 px, start and end are the same three bands: sky, a thin view strip, and a terrace floor of about 35 %. The start is bright and open (no canopy), and the stranger and Pip are already 100-120 px, so the crane shrinks them only about 2.4x. In the end frame the view is about 20-25 % of the frame and the Pentagon sits whole inside it, like a model on a table.",
   "fix": "Start enclosed: blossom crowns in the top corners (y 0-300, above the band), trunks at both edges, warm shade on the bench. Scale the stranger and Pip to about 200-240 px full figures (still at most 140 px wide, per K2's S5 sizes) so they shrink at least 4x. End: horizon at about y 740 (as L4's spec has it). Scale the Pentagon about 1.3x so two facades and its rings run off the right edge. Carry lawns, parkway and joggers down to the balustrade. Cover the terrace floor with masses (slope crowns at the bottom corners, the lamppost, a group of 6-10 small backs at the rail) so 25 % or less of the frame reads as bare floor.",
   "severity": "must"
  },
  {
   "owner": "dc",
   "where": "CraneSet terrace floor, hedge and tree crowns; news box (both S5 frames)",
   "problem": "S5 is the one sickly frame. The floor is #C7A79F (L* 71, C* 13), a muddy dusty-rose taupe that is not in the palette; it covers 23.9 % of the start frame and 12.3 % of the end frame. The hedge #7C807A is grey (C* 4, 4.8 %). The crowns are dark mauve #684556 (L* 34, 4-6 %) and read purple next to the plum. A petal sits on the news-box credit in both renders, which puts life over lettering (on STYLE's never list).",
   "fix": "Paint the paving in page fills (#EFD8C2 / #EEE4D4, two tones) lit by the April sun. Draw tree shade as a few flat warm-shade polygons covering at most 12 % of the frame. Hedge: sage #AFC4A8 with a darker sage step. Crowns: blossom #F3C3CD masses with a #C0919C shade, plum only in trunks. Re-check with colour_meter: no C* under 4.5 fields, dark 6 % or less. Petal and blossom spawners skip the K2 text rects (news box, plaque, deal board).",
   "severity": "must"
  },
  {
   "owner": "canal",
   "where": "S4Set: the towpath wall y 860-1060 and the boat and water y 1250-1920",
   "problem": "The walk home is flat horizontal strata. y 1250-1920 is 42 % one sage cabin side plus 29 % flat water (the 1056 x 240 hole), with five portholes and a cream oval with a brown dot that reads as a fried egg. While the world trucks, the bottom third changes 0.01 % per 0.1 s: the water never moves. Behind the walkers, the towpath wall is a blank 1080 x 190 cream band. The roof bike tangles with Pip. About 4 people on a DENSE-CALM towpath.",
   "fix": "Cabin side: two-tone coach-line panels (sage plus a darker sage step, a cream coach line). Draw the painted panel as roses and castles, with no lettering. Portholes get brass rims and curtains; put a plant in one and a cat in another. Add tyre and rope fenders and a mooring line. Water: wake streaks and leaves streaming at truck speed, a duck alongside. Wall: garden walls with gates, bins, ivy and a back door. Put 10-15 people on the towpath (a bench pair, an angler, a jogger, a dog walker). Move the bike off (470, 1218).",
   "severity": "must"
  },
  {
   "owner": "canal",
   "where": "S2Set y 1250-1920 and the near lamp at x 920-960 (the 10.00 sample)",
   "problem": "y 1250-1920 is 69 % one paving colour: white pictograms and a white dog stand-in on flat peach. The near lamppost is a 40 px plum bar the full height of the frame, about 2.6 % plum, taking the frame's dark to 9.5 % (S1 is 7.2 %). Its arm enters the caption band during the 6 % push (768 px in the band at 12.90). A walker is pasted onto the post: feet at y 1560 but only about 210 px tall, too small for its ground line, so it reads as climbing the post. The default busts are hv 280/304.",
   "fix": "Build TR \u00a75's S2 list as overlapping masses: the planter of grasses cut by the left edge, a bike and lamp foot cut bottom-right, two head-backs at most 140 px wide, a dog on a lead, a drain cover, leaves. Add one bench pair. Paint the paving in 2-3 tones. Move the lamp to x 1000 or more (cut by the edge), in line brown #9A563C, with the arm top at y 620 or lower at full push. Size every walker from its feet on S2's ground plane, or use cut head-backs there.",
   "severity": "must"
  },
  {
   "owner": "dc",
   "where": "S6 GateSet near plane, y 1250-1920 (24.00-28.06)",
   "problem": "S6 reads as 'a board on an empty plaza'. 81 % of y 1250-1920 is one paving colour, the worst in the kit. Three heads of about 70 px sit at the very bottom, with no movers in a BUSY shot. The tulip beds on the lawn are thin plum ellipses with white dots and read as floating caterpillars.",
   "fix": "Fill the near plane with small people crossing with the truck: 6-10 readers' backs and head-backs (at most 140 px wide) in 2-3 overlapping clusters. Add a bench with a reader, the bike rack with two bikes, a lamppost foot, tulip beds in the foreground and drifting petals. Paint the paving in two tones with a kerb. Draw the lawn's tulip beds as flat beds with visible tulip heads, or drop them.",
   "severity": "must"
  },
  {
   "owner": "map",
   "where": "K2 map.ts S1_SHEET.seatedHeadPx.near, BOTTOM_THIRD, S6.nearHeads, plus every kit default",
   "problem": "The owner's 'no big models of people' rule is not in the contract yet. K2 still has near heads at 250-330, and the kit defaults follow it: K4 S1_SEATED.near hv 262-326, CastCrowd's near row at about 260 px wide, K6 Steps busts 262-316 and S2Set busts 280/304, a 300 px S8Set cyclist, K7 GateDC heads 248-300, and the caf\u00e9 owner up to 300 px. The canal kit's own S1 render at 0.2 s still shows heads about 200 px wide.",
   "fix": "One K2 constant, NEAR_BACK_HV = [140, 155] (shoulders 140 px or less), plus a mid-figure cap (cyclists and walkers 170 px or less). Every kit default and README reads it. contractProblems() fails any person drawn over it.",
   "severity": "must"
  },
  {
   "owner": "cast",
   "where": "K4 Crowd.tsx, S1Seated, People poses",
   "problem": "The public are laid on grids and drawn in one pose. CastCrowd sets even rows and columns with no overlap: a formation, not a crowd. S1's steps place singles about 200 px apart, like a seat chart. Every figure is the same upright tombstone, and seated figures are standing busts with no lap, knees or arms. At 216 px they read as pegs, not reference 1's crowd.",
   "fix": "Add a cluster placer: groups of 2-4 overlapping 20-40 %, a \u00b18-15 px y stagger, \u00b16\u00b0 lean, about 15 % in rear 3/4 or profile, a child, and one in eight standing among the seated. Add seated variants with a wider hip base and three arm states (elbows on knees, leaning back on hands, hugging knees), plus pairs leaning together. Re-shoot the kit sheet beside reference 1 at 216 px.",
   "severity": "must"
  },
  {
   "owner": "pip",
   "where": "K5 poses and README; S1, S2, S4, S7, S8 and the S5 start; the 44 px S5 end",
   "problem": "Pip's charm (face, blush, trunk curl, teddy soles) appears only on the sheets. The watcher pose is a 3/4 back in six of eight shots, and at 216 px it reads as a lilac lump with ears. S1's ears-cover on 'life' is Pip's one reaction in the hook, and it is on the cover; from behind it reads as a flinch (K5's own note). At 44 px, the back view loses the elephant.",
   "fix": "Add a watch34 pose: body 3/4 back on the perch, head turned to profile or 3/4 front so the trunk curl, one eye and the blush show. Make it the README's default watcher for S1 (f0-1.25), S2 and S8. Play S1's ears-cover as a head turn to camera at 4.86 and the cover from the front at 4.98, held through 5.30. Use profile only at 60 px or less.",
   "severity": "must"
  },
  {
   "owner": "canal",
   "where": "S1 Steps, y 1240-1920",
   "problem": "The steps read as an empty bleacher. The treads have no riser faces, and the radial joint lines make them read as a flat plaza. About 25 people sit singly, evenly about 200 px apart, with flat paving between them. life.jpg shows the bottom 40 % nearly static: one cup lift and one head turn.",
   "fix": "Draw a stone-shade riser band (#C8C3D3, 20-30 px) under each nosing line so all five steps read. Seat 30-40 people with K4's cluster placer: friends in twos to fours, bags, coats, a picnic cloth, a guitar case, a dog lying down. Put at least one event per second on the steps: someone stands up or sits down, a child runs down, a phone held up, a dog's tail, pigeons hopping along a tread, a cup set down. Give seated figures idle breathing at 12 drawings/s with offsets.",
   "severity": "must"
  },
  {
   "owner": "map",
   "where": "K2 seats and rects (S2, S4, S5, S6, S7/S8 board bollard)",
   "problem": "The contract's 8 clearance failures are visible defects. In the S2 sample, Pip sits on the reporter's head (overlap 90 x 51) and over the A-board. Pip at BOARD_BOLLARD overlaps B's stile, with S8's G4 behind it. S5's Pip covers the news box. S6's Pip is 189 px from the clause (the rule is 200). The name tag is 200 px tall for 262 px of text, and its credit line crushes the border in the S4 sample. S2's A-board squeezes its body text to 27.8 px.",
   "fix": "Apply the contract builder's K2 requests:\n- S2.pipSeat (520, 1050)\n- BOARD_BOLLARD (735, 1205)\n- S8.ghosts x +25\n- S6.pipSeat0/1 y 705\n- S5.start.pipSeat (400, 1120), size 107 or more\n- S5.end.pipSeat (366, 1195)\n- pipBox 1.3 x size plus the tail\n- S4.nameTag y1 862\n- S2.aBoard x 140-580\n\nThen re-run contractProblems() and the 8 clearance boxes until they are clean.",
   "severity": "must"
  },
  {
   "owner": "engine",
   "where": "scripts/qa/density.py fullness pass, and the contract's fullness table",
   "problem": "The fullness metric passes empty floors. Its flat-tile test (under 0.5 % edge pixels) is broken by thin paving joints and scattered leaves. S2's bottom third scores 16 % flat while 69 % of it is one colour (S6 81 %, S8 53 % + 17 %, S4 42 % + 29 %). Lanes judged on density.py will ship empty floors as PASS.",
   "fix": "Add a dominant-fill metric per region: the share of the single most common colour (quantized to merge anti-aliasing) and of the top two, in y 1250-1820 and y 600-1250. WARN over 45 % for one colour or 60 % for two (v1's worst bottom thirds are 42 % / 55 %; S1 is 27 % / 53 %). Report it in the contract's fullness table and the lane acceptance bar.",
   "severity": "must"
  },
  {
   "owner": "engine",
   "where": "K1 src/v2r/palette.ts problems({coverage}), line 297 (hero 5-15 % on her shots)",
   "problem": "problems() asks for the hero teal at 5-15 % on her shots. With the owner's small people, her coat measures 0.1-0.6 % (S1 0.2 %, S4 0.1 %, S8 0.6 %), so every one of her shots will warn. A lane chasing that warning would enlarge her into the big model the owner banned.",
   "fix": "Replace the share band with a findability check on her shots: teal present (at least 0.1 %), unique (no mid-dark hue with C* 30 or more within 300 px of her), and on a ground at least 15 \u0394E from the teal. Update the '5-15 %' note in TREATMENT \u00a72 and STYLE \u00a72 to match.",
   "severity": "should"
  },
  {
   "owner": "cast",
   "where": "K4 cast: no Dog; traitProblems()",
   "problem": "There is no dog, although TREATMENT asks for one in S1 (trotting down the steps, one lying), S2 (on a lead, nosing a leaf) and S4. The samples use a white pictogram (S2) and a tan blob (S4) as stand-ins. traitProblems() also lets the generator place her signature (plum hair, low bun, long coat) and ghost cues (silver hair, paper or oat coats) right beside her, which is how the S1 look-alikes appear.",
   "fix": "Add a Dog: side trot, back view, lying, sniffing; 3 coats from the confetti colours; a lead to a walker's hand; a tail-wag idle; 30-90 px. Add a nearHer option to traitProblems() that bans plum or dark hair with a bun, long coats, silver or white hair, and paper or oat coats for any figure within 300 px of her or a ghost.",
   "severity": "should"
  }
 ]
}

- started: fix-cast

- started: fix-pip

# sound (wf_7902a45a-8a4): completed agent results at the 15:05 UTC pause

- started: sound

## result
I built the bed, all the SFX, the cue sheet and a mastered draft mix. It measures **-14.01 LUFS / -1.25 dBTP** with the voice on top everywhere. Nobody has listened to it yet: every check below is a measurement.

**Built** (the orchestrator's checkpoints d2b9e3d and f08b649 already hold all of it; my paths are clean, so I made no commit of my own):
- `audio/v2r/`: `bed.py`, `sfx.py`, `premix.py`, plus `sheet.py` (the one cue list and timeline), `measure.py`, `dsp.py`, `music_bed.mid`.
- `public/v2r/`: `music_bed.wav`, `sfx/` (39 new synthesised sounds), `cues.json` (the bed at t 0 + 61 cues), and `mix.wav` (the mastered draft: voice + bed + every cue).
- `docs/v2/SOUND.md` (69 lines). Everything is exactly 2345 frames (39.0833 s) so it loops with the video. A full rebuild gives byte-identical files.
- **The bed:** her motif is a rising fourth (C to F) on felt piano, the same interval as the exit ding at 0.45 s. It follows TREATMENT §7: no music in the hook, soft accent 1 at 22.43 and accent 2 resolving on "facts" at 37.18. The music is pre-ducked against the locked voice, so it plays at gain 1.
- **Equal weight:** Google's board and hers use the same files at the same gains (clack, pens, lamp run). Google's pulse level matches the clause pulse within 0.2 dB.

**Checked** (in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/sound/`: `premix.wav`, `premix_report.json`, `bed_report.json`, `premix.png`, `hook_zoom.png`, `end_zoom.png`, `bed_roll.png`, `sfx_sheet.png`):
- Music sits a median 27.2 dB under the voice (never closer than 15.4). The whole bed is never closer than 12.8 dB.
- All SFX together stay at least 8.8 dB under the voice. In the 1-4 kHz band the voice stays on top (median 18.4 dB, never below 0.4).
- The loop seam is clean. The 6 remaining click flags are the voice's own consonants.

**Open:**
- Needs one listen on phone speakers and one on earbuds: the ding's level, the ticks, the crane swell.
- The voice's opening ("She quit Google.", and "for life") is about 8 dB quieter than the rest of the read. I left it as performed; lifting it would change the approved take.
- W4: the cue times come from TREATMENT, not the final picture. Re-time `sheet.CUES` from the final cut and run the 3 scripts again; the gains re-derive themselves.

**REQUESTS:**
- K8 `src/v2r/film/Film2R.tsx`: final render `audioSrc="v2r/mix.wav"` and no `sfx`. Drafts may use `audioSrc="v2/voice.wav"` with `sfx` from `public/v2r/cues.json` instead, never both.
- L5 boards: Google's "of any kind" pen and her quote pen share one 1.26 s pen file starting at 30.74 and 36.54. Tell sound if either pen build runs a different length.

- started: music-director

- started: music-director

## result
1. The payoff line is masked. On "facts" (37.18-37.48), lamp_run and pen_long are +4.1 dB over the voice at 4-10 kHz, which covers its /f/ and /ts/. On "is", pen_long is +2.5 dB over the voice at 1-4 kHz.
   Fix: end the pen by 37.10. Drop lamp_run 6 dB and keep it out of 37.18-37.26 and 37.38-37.50. Make the same two changes on Google's 30.04/30.74 (fairness rule A5). Add a premix.py check: voice at least 6 dB over everything else, at 1-4 and 4-10 kHz, on every hit word.
2. Two hook words are masked. letter_pops are +1.0 dB over "Google" at 1-4 kHz (1.10-1.30). outline_pops and ear_flap together are about +1.5 dB over the first 220 ms of "life" (premix's worst gap, 0.4 dB). Both passed only because sheet.TONAL exempts them, yet they carry noise puffs.
   Fix: letter_pops -6 dB and finished by 1.10. outline_pops and ear_flap -5 dB, puffs high-passed at 5 kHz, drop the 4186 Hz sine blip (or move them into the 5.59 pause). Take both out of TONAL.
3. The first-second ding does not read as a phone cue. 99.7% of its energy is four near-harmonic sines, a soft "boop-boop". At -33.7 LUFS it is the second-quietest of the 7 SFX in 0-1.5 s, because the bus guard cut the ding itself by 2.2 dB. A lamp-OFF click 50 ms earlier gets there first, and the ding rings 1.2 s under "quit Google."
   Fix: rebuild it as a struck glass chime (inharmonic partials, 1 ms mallet transient, decay constant about 0.2 s) and raise it 4 dB. Lower lamp_click 5 dB and door_glide 6 dB instead of the ding.
4. On phone speakers the music arc mostly disappears. 85-92% of the staff, walk and "military" music sits below 150 Hz. Through a 350 Hz phone-speaker filter it lands 35-38 dB under the voice and below the air (by 2.6, 4.3 and 12 dB). step_thup and boat_chug go silent too. The "question" gesture (13.16-14.64) is 37 dB under the voice even on full-range playback.
   Fix: add the cello-pizz octave to every pulse and light saturation on the low strings. Un-duck the C6 or move it into the 14.64 pause. Lower the air 4 dB wherever music plays.
5. The ducking pumps. The 14 dB duck with a 250 ms release lets the clause pulse, specified as "level", jump +13 dB in 25.60-26.08 to -32.2 LUFS. That is louder than either designed accent (-34.8 and -34.6), and Google's unbroken line never gets that swell (A5). It jumps +11.5 dB again at 34.99-35.45.
   Fix: add a 500 ms duck hold so gaps under 0.6 s stay ducked, and cut the music duck to 8 dB with its static level trimmed so the medians hold.
6. The air is hiss. It is static stacked noise, with a 16 dB cliff between 0.6 and 0.8 kHz and a 7 dB step up at 2.5 kHz. Events rarely rise 4-6 dB above it. It is the hook's only bed, it turns to thin hiss on phones, and the Arlington birds are bare sine glides.
   Fix: compose the canal from CC0 field-recording grains, as the score does with CC0 instruments. Failing that, smooth the band crossovers and sound the life already on screen (cyclist f15, bus f66, duck f138, dog f168, water laps).
7. The hook's exit whoosh is comb-filtered. dsp.widen() adds a 0.69 ms-shifted copy to each channel. whoosh_dive, alone in the 5.59-6.28 pause, gets 30-45 dB nulls every 1455 Hz from 727 Hz (up to 78 dB in mono), so it sounds metallic. glass_tone and pencil_flood have the same nulls.
   Fix: decorrelate with independent noise seeds per channel or an all-pass decorrelator, never a sub-millisecond copy. Check the mono fold-down.
8. glass_tone sounds like a test tone. It is a 99.3%-pure sine pair (880/881.3 Hz plus 1318.5 Hz) held 1.75 s. In its own bands it sits 3-14 dB above the voice under "In April, that meant", and 0-6 dB above it under "But Google says".
   Fix: a struck glass ting (inharmonic partials, noise excitation) that is 30 dB down before the next word (20.67 / 28.31). Rebuild lamp_run's 4.7 kHz sine tinks the same way.
9. The hits sound synthetic. They are bare decaying sines with no noise body and no room: board_clack is 99.8% tonal, a 196 Hz bonk used 4 times; plate_knock 94%; ghost_tick 77% plus a pure 523 Hz sine. Identical samples repeat 80 ms apart at 33.78, and the 24-32.7 s pulse is exactly on the grid (no timing variation, velocities 27 and 30 only).
   Fix: add a noise impact layer, one shared 40-80 ms outdoor slap send, 3-4 round-robin variants per file, and one seeded humanize applied identically to both pulses.
10. The loop seam has a dropout. The sample step is clean, but pencil_reverse ends at -23 dBFS with a 2 ms fade and pencil_flood fades in over 3 ms. That leaves a ~5 ms notch down to -47 dBFS, followed by an 11 dB drop at 2-8 kHz, on every loop.
    Fix: wrap cue overflow circularly in premix.py and crossfade the reverse into the flood over 15 ms at a matched level.
11. SFX land on or just after consonants. 28 of 61 cues start within ±20 ms of a word onset, 21 of them 0-12 ms after it. On "BBC", notebook_flap is +5.7 dB over the voice at 2-8 kHz; on "military", plate_knock is +13.8 dB at 0.5-2 kHz, both in their first ~50 ms. pop_high at 26.40 hits "can't", 100 ms before the heard "veto" (26.50).
    Fix: move every word-synced cue 2 frames earlier (the beat map allows hits to lead by 1-2 frames, never trail), and move pop_high to 26.47 with its line.
12. Checked and fine: no clipping (-14.01 LUFS, -1.24 dBTP, peak-to-loudness 12.8 dB; voice -0.61 dBTP, no flat tops). No harsh sibilance (the brightest SFX is 5.8 dB under the voice's sibilants). No boom (below 100 Hz sits 15-22 dB under 200 Hz-2 kHz).
    Outside items 1, 2 and 11 the voice band is healthy (third-octave medians 14-29 dB over the rest, 200 Hz-12 kHz), and on full-range playback the arc's shape matches SOUND.md except item 5.
Spectrograms and loudness plots: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/md_review/ (overview, hook, maskmap, phone, pump, seam, sfx_sheet, airzoom .png)

- started: sound-revise

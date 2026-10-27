You are a helper session for "What's All the Fuss About?", a short-form explainer channel. The repo is github.com/devilsanek1/Test-, branch
video-production (it is checked out for you). Another Claude session (the orchestrator) runs video 3 and split this work across sessions to go faster; the
video 2 session also pushes to this branch.

SETUP (once): read CLAUDE.md (auto-loaded) and HANDOFF.md section 5 (setup: cd video && npm ci; remotion.config.ts browser path; Python with
opencv-python-headless, numpy, pillow). Do not read the whole context archive: everything you need is named below.

VIDEO 3 ("AI is making your next laptop pricier", 41.15 s) is at stage G5b, the dense blocking cut. The owner judged G5 "way too empty", then approved the
density pilot video/deliverables/v3/v3_g5b_pilot.mp4 (O1: the dressed nook with Pip and the snowy town in the window; S4/S6: the chart in a glass
noticeboard on the computer shop's street wall with a row of winter backs and Pip). THAT IS THE BAR. Rules: video/docs/OWNER_PLAYBOOK.md (Visual style:
feel alive, a dense detailed world, warm never sickly), video/docs/look/LIFE_AND_DENSITY.md (incl. "Approved bar"), video/docs/look/COZY_AND_SCALE.md
section 3b, video/docs/v3/density_plan_g5b.md and video/docs/v3/cozy_v2_application.md (it overrides the density plan), the kit README
video/src/v3/film/kit/README.md. The film: video/src/v3/film/ (entry video/src/entry-v3-film.tsx: Film3 at 60 fps, Film3Shot {id}, Film3-<ID>; how-to
video/docs/G5_BLOCKING.md). The story, voice, cut points, each panel's idea, framing and camera are LOCKED: add and fix around them, never restage.

YOUR TASK: the FIX step for S11 and S16. A build lane already dressed them (its report and an independent reviewer's findings are below; the build commits are on
the branch). Fix every real problem the reviewer found (skip one only if it is wrong, or if it needs a change outside your panels; say which and why).
Own files only: video/src/v3/film/scenes/<ID>.tsx and <ID>_*.tsx for your panels; shared kit changes only as NEW files kit/<ID>_*.tsx or ADDITIVE optional
props (never change a default or another panel's look). CHECK: npx tsc --noEmit -p video; stills via Film3Shot at --scale=0.5 at the panel's beats beside
the pilot frames; a 0.25 phone look; python3 scripts/qa/density.py (run from video/; its header has the usage) on a 0.5-scale render of your panel (and
--cozy for cozy holds). Look at no more than ~12 images.
GIT: commit after every meaningful step (the container may restart; uncommitted work is lost), only your own paths (git add <paths>). Before each push:
git pull --no-rebase origin video-production (resolve only conflicts in your own files; never discard another session's work), then
git push origin HEAD:video-production. Use your harness's commit attribution lines. No pull requests. The repo is PUBLIC: never write an email address or a
secret into a file. Never touch video/docs/OWNER_PLAYBOOK.md, CLAUDE.md, HANDOFF.md or other panels.
WHEN DONE: write a report of at most 12 lines (fixes, final meter numbers, anything open) to video/docs/v3/g5b_reports/fix_S11_S16.md, commit and push it. That
file is how the orchestrator knows you are finished, so write it last.


=== S11: BUILD REPORT ===
S11 is built to the pilot's level. The chart now hangs on a cork price board in the drivers' room by the chip factory's loading dock (built in `S11_room.tsx` and `S11_people.tsx`, composed in `S11.tsx`).
- **Room:** the ceiling, high wall, dock window and coffee corner are full of detail, all kept out of the caption band. The empty top half is filled: a tiled ceiling, a dark cable tray, a strip light that flickers once at 0.76, a navy DRIVERS sign, a fan and a heating pipe. The left window shows the factory hall, the laptop van with its hazards on, a forklift crossing twice, a walking worker and snow. On the right are a clock, mugs, the coffee machine and a cabinet.
- **People and Pip:** four drivers' backs lean in on "costs". After "five" one takes a photo of the board (flash at 2.62), the van driver puts a hand to his cap, one sips coffee twice and one holds a clipboard that flutters. Pip sits on crates of gold sticks, follows the tall bar, covers his ears on "5x", then turns to us worried at 3.62 (picked up in S12).
- **Locked beats:** unchanged: the bar lands on "costs", "5x" leads "five", the 1.5 % breathe stays. The card is 0.94x its G5 size about its bottom edge, like S4's, so the board's top rail stays below the caption band.
- **Meter (G5 -> now):** 1.2 -> 6.2 ev/s, gap 2.87 -> 0.90 s, static 32 -> 2 %, flat 72 -> 24 %, obj 30 -> 178, detail 5 -> 54 %. All pass; the pilot's S4 was flat 24 %, detail 56 %, 6.5 ev/s. No `--cozy` run: S11 is a busy insert, not a cozy hold. Typecheck is clean.
- **Still sheet:** reference 1, v1, pilot O1 and pilot S4 on top; S11 at 0.3, 1.25, 2.0, 2.64 and 3.85 s below, at phone size: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S11/S11_sheet.png`. Half-scale render: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S11/s11_v3.mp4`.
- **Shared kit:** no changes and nothing new. S11 no longer uses `WallCard`; it imports only `breathe` from `S4_wall.tsx`.
- **Git:** 5 commits, last 5742bd0. Every push to `video-production` was rejected as non-fast-forward, so they are left for you to merge.

Open items:
- The card's upper-left stays empty cream: it is part of the plot, and the plan keeps the inside of the card clear.
- The settle (2.6-4.2 s) is the panel's thinnest stretch, just under the 1 s gap limit at 0.90 s. The drivers turning to each other doesn't register on the meter, because their constant breathing already counts as motion.
- I haven't checked a full-size 1080 render frame by frame; I looked at full-size crops of the drivers only.

=== S11: INDEPENDENT REVIEW ===
S11 is close to the pilot's bar. I found 6 problems, most severe first. Two of them can't be fixed inside the lane's own files: #4 changes the locked card and needs your OK, and #5 needs an additive kit prop. All times below are panel time (film time = +25.24 s). Positions are canvas px at 1080x1920.

**Meter, my own 0.5-scale render with voice:** 6.7 ev/s, gap 0.90 s, static 2 %, flat 24 % (worst frame 29 %), obj 177, detail 54 %. All pass. The pilot's S4 measured 6.5 ev/s, flat 24 %, detail 56 %. Event onsets: …2.03, 2.10, 2.53, 3.43, 3.57, then nothing to the end at 4.18.

**What holds:**
- **Fullness:** at phone size beside pilot S4 the frame is as full. The top strip (ceiling, tray, strip light, DRIVERS sign, fan, pipe), both side strips and the row of backs are dense.
- **Caption band:** it is clean plaster and the captions read easily.
- **Locked beats:** unchanged against the G5 code. The bar grows from 0.80 and lands at 1.15 on "costs" (1.12). "5x" comes at 1.74, ahead of "five" (1.84). The 1.5 % breathe still scales about (690, 1040). The board's top rail is at y ≈ 617, below the band.
- **Subject:** the 5x bar stays the subject at phone size.

**Problems:**

1. **Pip flips between back and front views three times in 1.7 s.** The sequence is: back (0-1.94), front with ears covered (1.94), back again at 3.05, front and worried at 3.62. The 0.57 s back turn at 3.05-3.62 reads as a jitter. It happens in the bottom-right corner (x 830-940, y 1440-1560) during "last year's price" and pulls the eye off the 5x bar.
   - **Fix (S11.tsx `CROWD.pip`):** delete the `{t: 3.05, pose: 'sit-back'}` key. At 3.0 go from ears-cover to `sit-front` (paws down) and look toward the drivers (look ≈ -0.6). At 3.62 keep `sit-front`, switch only the expression to `worried` and bring the look to 0 (at us). The settle keeps its beat at 3.0 without the extra turn.

2. **The dock hand's raised phone sits on the card's bottom edge, and the flash hits the "last year" label.**
   - From 2.08 to 3.42 the white phone (x ≈ 245-330, y ≈ 1335-1460) touches the card's bottom edge (y 1350). White on cream, it looks like a tab hanging off the card's bottom-left corner.
   - The 2-frame flash star at 2.62 (centre ≈ (290, 1333), radius 72) lands on the "l" of "last year", which the plan keeps calm.
   - In the pilot's S4 the phone and flash stay below the board.
   - **Fix (S11 files only):** bring the dock hand a step forward (`row[0]` `dy: +56`, `sMul: 1.04`) so the phone top clears the card by about 40 px and the flash sits on the board's bottom rail or the bench. Alternatively, in S11_people `PhoneFlash`, anchor the star at `phone.mid` and cap the radius at 48.

3. **The settle is thin by the meter's count, and the last 0.6 s fades into the cut.**
   - The meter finds no new event from 2.53 to 3.43 (0.90 s) or from 3.57 to the end at 4.18.
   - My per-region diff shows overall change falling to the panel's lowest (about 1.5 % per 0.1 s) at 3.9-4.16.
   - The cause: every settle beat (the drivers turning to each other, the sip, Pip's turn, the forklift) sits in an area that is already moving (breathing backs, the window's snow), so the meter merges it into what is already there.
   - **Fix:** put one beat where nothing else moves. `ROOM.flickerAt: [0.76, 3.3]` adds a second stepped flicker of the strip light. Because `DriversSign` takes its jolts from `flickerAt`, the sign jolts with it, and the tube's halo area is otherwise still. Add one more small beat at about 3.95 on "And" in the still coffee corner, for example the machine's button blinking with a steam puff.

4. **The card's upper-left is the largest flat area in the frame, and the card has no title, unlike S4's.**
   - The empty cream runs about x 230-560, y 680-1120, roughly 7 % of the frame.
   - S4/S6's card carries "U.S. computer prices" and "2005". S11's has no title, and the tall bar has no label under it (it is `''`), so with the sound off it reads as "last year vs ?".
   - **Fix (needs your OK, because the card was frozen at G3):** add a small title in S4's style and size at the card's top-left, e.g. "Memory chip price", and "now" under the tall bar. The plot itself stays empty. It needs either an additive optional `title` prop on `BarChart` or a `Txt` drawn in S11.tsx inside the card.

5. **The coffee machine is a dark block in the 5x bar's own colour, right beside the bar.**
   - The kit `CoffeeMachine` body is `EMBER.anchor`, a colour reserved for hair, the phone body, the lamp and the 5x bar. In S11 it forms a 115 x 360 dark block (x 966-1080, y 834-1194) at the bar's height, about 150 px to its right.
   - Together with the navy dock window on the left, the frame has three dark uprights at bar height, which weakens the bar as the one darkest shape.
   - **Fix:** add an optional `body` colour prop to `CoffeeMachine` in kit/Shop.tsx (default stays `anchor`, no other panel changes). S11 passes a mid tone such as `EMBER.beam` or `EMBER.shelf`.

6. **Full-density snow falls inside the caption band in the dock window.**
   - `DockView` sets `SnowLayers band={null}` at density 2.2. The kit treats `null` as "a window that sits entirely below the band", but this window (y 208-1316) crosses it.
   - The result is full-size near flakes at x < 94 within y 290-600, against the rule of half density and flakes no bigger than 6 px. It is outside the caption text, so the risk is low.
   - **Fix:** remove the `band={null}` (the kit's default band then applies) in S11_room `DockView`.

Files are in /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S11/:
- sheet_all.png
- phone_cmp.png
- pip_strip.png
- crop_flash.png
- crop_top.png
- s11_rev.mp4
- d.json
- st/ (stills at 0.05, 1.16, 1.86, 2.63, 3.70, 4.14 s)
- full/ (full-size frames)
- phone/ (the 0.25 phone still)


=== S16: BUILD REPORT ===
S16 is built to the pilot's level and committed in three commits, the last one 668acaa. The push to video-production was rejected (not a fast-forward) each time, so I left it for the orchestrator to merge. Typecheck passes. The story, cut, framing and the turn at 39.70 are unchanged, and Pip's beats still land.

- **What I added:** the same room as O1 and S7, built around the tag.
  - Above the caption band: the attic slope with the paper star, string lights, photos on a cord, a hanging pothos and a sea print.
  - Wall: a shelf above the tag (books, a photo, a jar, a trailing pothos), a leaf print, the 2026 calendar, a ticking clock, a pinboard cut by the right edge, and two sticky notes.
  - Desk: pen cup, mug with steam puffs, the charger cable, clementines, glasses, sticky notes, headphones, biscuits, a pencil, coins, the spiral notebook with a biro doodle, letters, the phone face down, and the planner.
  - The lamp's pull chain swings.
- **Pip (1.8x, right of the tag):** glances up the string at 39.14, leans in as the tag turns, trunk-up on the like-pop, shrugs at us at 40.24, then settles back to watching. It shrinks with the un-build.
- **Motion:** the float camera replaces the 1.5 % breathe. The tag's flip moves the room's air (pinboard notes, the lights, a sticky note, the pothos), and that settles through 40.1-40.8 before the un-build.
- **Loop seam:** clean. Five small pieces (the star's glow, the calendar's year, the clock hands, the notebook's lines, the pothos vines) were staying on screen until the cut. They now shrink away with everything else, so the last frame matches O1's frame 0.
- **Meter (G5 -> now, whole panel):**

  | | ev/s | longest gap | static | flat | obj/Mpx | detail | verdict |
  |---|---|---|---|---|---|---|---|
  | G5 | 4.3 | 1.03 s | 59 % | 70 % | 37 | 11 % | FAR |
  | now | 11.3 | 0.73 s | 3 % | 24 % | 149 | 43 % | PASS |

  `--cozy` on the hold alone (0-2.0 s): movers 1.2, empty 28 %, cv 0.68, float 9.7 px/s. The cozy plan lists S16 as a busy shot, so these are for information only.
- **Still sheets:** `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S16/S16_g5b_sheet.png` (the pilot's O1 and S4, five S16 beats, the last seam frame, O1 frame 0). Phone-size look: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S16/S16_phone.png`.
- **Shared kit:** no additions. S16 does import props from other lanes' files: `PhotoLine`, `StarLantern`, `Letters` and `Planner` from `O1_life`, and `Clementines`, `Pen`, `PhoneDown` and `SpiralNotebook` from `S7_desk`. If the S7-S8 lane changes those exports, S16 will stop typechecking.
- **Open items:**
  - THE laptop's screen is still light, as built, and is a large flat area. If S12 switches to the dark dcSide screen, S16 should match.
  - Pip's hop toward its O1 sill spot during the un-build is a G6 job.

Files are in `/home/user/Test-/video/src/v3/film/scenes/`: `S16.tsx`, plus the new `S16_wall.tsx` and `S16_desk.tsx`.

=== S16: INDEPENDENT REVIEW ===
I found 6 problems in S16. It is close to the pilot's fullness, but cooler colour, one continuity fix and calmer Pip motion are needed. The locked beats hold: the flip at 39.70 and the back landing by 40.06 both read, and the caption band (y 290-600) is plain wall and easy to read. The loop seam in Film3 is clean: 41.12 and 41.135 (the last frame) match O1's frame 0 exactly. The S15 to S16 cut lands on the same caption page. The laptop's light "new" screen matches S12, so that is not a problem.

**Meter** (my own 0.5-scale Film3-S16 render with voice):

| range | ev/s | gap | static | flat | obj/Mpx | detail | verdict |
|---|---|---|---|---|---|---|---|
| whole panel | 12.9 | 0.80 s | 3 % | 24 % | 149 | 43 % | PASS |
| hold only (0-2.0 s) | 11.5 | 0.77 s | 0 % | 24 % | 151 | 43 % | PASS |

- `--cozy` on 0-2.0 s: movers 1.2, empty 30 %, cv 0.67, float 9.6 px/s. This is information only, since S16 is a busy shot.
- The pilot measured O1 at flat 18 % / detail 50 % and S4 at flat 24 % / detail 56 %. S16 matches S4's flatness but has less detail than both.

**Problems, most severe first:**

1. **Your phone is face down on the desk, which contradicts the frames on either side.**
   - **Where:** bottom centre, x ~400-620, y ~1750-1920, for the whole panel. The lane added it as `PhoneDown` in `S16_desk.tsx`.
   - **Why it matters:** one frame earlier (S15) and again after the loop (O1's frame 0), your phone is face up in your hand. Its listing carries this very tag. Seeing it face down on the desk right after the cut breaks continuity. It is also the darkest block in the bottom third.
   - **Fix:** remove the `PhoneDown` from `S16DeskFront`. Put a non-phone prop in that spot, cut by the bottom edge: a dusk-blue paperback, or a coaster with clementine peel.

2. **The frame is almost all warm (sickly risk), and the hero orange is doubled.**
   - **Where:** the whole frame. I measured the cool share (hue 180-300°) at 3.3 % before the turn and 4.6 % after it. The rule is at least 10 % (`cozy_v2_application.md` §4), and the pilot's frames measure 13-14 %.
   - **Why it matters:** at phone size the frame reads as one orange, peach and brown mass. The hero-orange laptop lid and peach screen sit only ~30 px of wall away from the hero-orange tag's eyelet, so the subject loses separation on its left.
   - **Fix:** add room-family cool pieces until a re-measure shows at least 10 %:
     - a dusk-blue night print in the empty spot left of the tag (see item 3);
     - 3-4 shelf books in `dcSide` or `skyLow`;
     - swap the leaf print (x 24, y 622) for a blue-hour snow print;
     - a dusk-blue notebook cover;
     - a dusk-blue scarf over the pinboard's corner.

3. **The left-middle column is the one thin area left.**
   - **Where:** x 0-330, y 830-1390, the whole panel. The laptop's flat peach screen (~260x300 px) is the biggest flat block after the lamp pool. The bare wall pocket between the lamp shade, the shelf and the tag (x ~130-320, y ~840-1000, about 200x180 px) holds only a plaster "+". It sits at the size limit for a hole, and the pilot has nothing like it outside the caption band.
   - **Fix:**
     - Hang the night print from item 2 in the pocket, or let the shelf pothos trail lower into it, keeping the tag's calm ring (~40 px).
     - Give the screen desktop content through `Laptop` children: one document window, a dock row of 5-6 coloured app squares and a cursor. It must never look like a landscape that could read as a window.
     - Request the same children for S12, so the laptop stays matched across the two panels.

4. **Pip moves non-stop and competes with the payoff.**
   - **Where:** Pip, x ~790-960, y ~1150-1340. In order:
     - a hop toward the tag at 39.60-39.86;
     - a trunk-up at 39.86, during the flip (39.70-40.06) and right on the like-pop;
     - the shrug at 40.24-40.68;
     - the look back at 40.74.
   - **Measured:** with the camera float removed, Pip's area changes 21-56 % of its pixels per 0.1 s from 0.70 to 2.0 s. The rest of the room changes about 5-10 %, which is mostly float residue. That is three reactions in 0.6 s, one on the subject's own beat, against `LIFE_AND_DENSITY.md` §5 (one big reaction per shot, never on the subject's beat). At phone size the 1.8x lilac Pip is right beside the tag and pulls the eye off it as it turns.
   - **Fix:**
     - Replace the hop with an in-place lean: a 4-6 px tilt toward the tag, eased over 0.3 s, with no translation.
     - Hold still through the flip: eyes on the tag, one blink.
     - Drop the trunk-up, or shrink it to an ear flick at about 40.10, after the back has landed.
     - Keep the shrug on "tag" (40.24) and the settle after it.

5. **The room's clock runs backwards in film time.**
   - **Where:** the wall clock, top right (cx 1006, cy 676). It reads 7:12 (`startMin={12}` in `S16_wall.tsx`), but S13's clock earlier in the same evening reads 7:50 (`startMin={50}`).
   - **Fix:** set `startMin` to 53 or more.

6. **The single-panel renders show a broken ending. The film itself is fine.**
   - **Where:** Film3-S16 and Film3Shot S16 at 2.10-2.33 s. Once the un-build drops the sky to transparent, these renders show a solid dusk-blue page with scattered lines, because a single-panel render has no O1 underlay beneath it.
   - **Why it matters:** any per-panel review video looks broken at the end, and it skews the panel meter. My 2.0-2.33 s row reads 36.9 ev/s with 25 % static frames.
   - **Fix:** judge the seam only in Film3, and meter S16 on 0-2.0 s. If it should be fixed properly, send the engine a request: Film3Shot renders O1's t < 0 underlay under the loop panel during its un-build.

**Renders** (all under `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/`):
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/sheetA.png`: the pilot at 0.5, 2.0 and 7.0 s beside S16 at 0.0, 0.98 and 1.15.
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/sheetB.png`: S16 at 0.5, 1.45, 1.95, 2.2 and 2.29.
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/sheetC.png`: the Film3 cut at 38.82/38.84, the seam at 41.12/41.135, and O1 at 0.0/0.05.
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/ph/f00096.png`: the 0.25 phone-size look.
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/s16.mp4`: the panel render the meter ran on.
- `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S16/mot.py`: the per-area motion script behind the item 4 numbers.

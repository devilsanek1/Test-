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

YOUR TASK: the FIX step for S7-S8 and S12. A build lane already dressed them (its report and an independent reviewer's findings are below; the build commits are on
the branch). Fix every real problem the reviewer found (skip one only if it is wrong, or if it needs a change outside your panels; say which and why).
Own files only: video/src/v3/film/scenes/<ID>.tsx and <ID>_*.tsx for your panels; shared kit changes only as NEW files kit/<ID>_*.tsx or ADDITIVE optional
props (never change a default or another panel's look). CHECK: npx tsc --noEmit -p video; stills via Film3Shot at --scale=0.5 at the panel's beats beside
the pilot frames; a 0.25 phone look; python3 scripts/qa/density.py (run from video/; its header has the usage) on a 0.5-scale render of your panel (and
--cozy for cozy holds). Look at no more than ~12 images.
GIT: commit after every meaningful step (the container may restart; uncommitted work is lost), only your own paths (git add <paths>). Before each push:
git pull --no-rebase origin video-production (resolve only conflicts in your own files; never discard another session's work), then
git push origin HEAD:video-production. Use your harness's commit attribution lines. No pull requests. The repo is PUBLIC: never write an email address or a
secret into a file. Never touch video/docs/OWNER_PLAYBOOK.md, CLAUDE.md, HANDOFF.md or other panels.
WHEN DONE: write a report of at most 12 lines (fixes, final meter numbers, anything open) to video/docs/v3/g5b_reports/fix_S7-S8_S12.md, commit and push it. That
file is how the orchestrator knows you are finished, so write it last.


=== S7-S8: BUILD REPORT ===
S7 and S8 are dressed to the pilot's level and committed, but every push to `video-production` failed with HTTP 403, so the commits are only on the local branch for you to merge. Typecheck passes, `gate_check --only S7` and `--only S8` pass, and every locked beat still lands.

**S7** (`scenes/S7.tsx`, new `scenes/S7_desk.tsx`): it's now the O1 desk world. Above the caption band: the attic slope with O1's paper star, string lights, pegged photos, a hanging pothos and a sea print. On the wall: a pinboard (nothing behind the bubble), a shelf with books and a trailing pothos, the 2026 calendar, a leaf print, a postcard, wall notes and a socket. On the desk: books, pen cup, a lit candle, the mug with steam, a speaker, headphones, mittens, biscuits, clementines, glasses, sticky notes (one flutters at 16.7), the charger into the right port, a spiral notebook and pen, letters, your phone face down, a clip dish, the radio and O1's planner. Pip (1.4x) watches the laptop, turns up to the bubble just before it pops and hops on "your". The screen is now dcSide with one glint slide at 17.6, as cozy v2 asks.

**S8** (`scenes/S8.tsx`, new `scenes/S8_edges.tsx`): the stick stays the biggest thing in frame and the screen stays plain. Around it: the bottom bulbs, the photos and a print shown close up, a trailing pothos, a sticky note on the bezel that lifts on the landing, a snowflake sticker, legends on every key, speaker grilles, a webcam dot, three keys springing back, and a 2° wobble as the stick settles. On the desk: notebook and pen, biscuit, clementines, glasses, pens, a note, the phone's corner and the cable. Pip (1.85x) has wide eyes and reaches its trunk toward the stick on "chips".

**Camera:** one float plan runs across S7 and S8, so S8 continues S7's last leg and the S7→S8 match stays aligned.

| | ev/s | flat | objects | detail | float |
|---|---|---|---|---|---|
| S7, G5 | 0.6 | 73 % | 27 | 11 % | |
| S7, now (PASS) | 5.3-7.1 | 21 % | 153 | 44 % | 7.6 px/s |
| S8, G5 | 0.9 | 56 % | 50 | 12 % | |
| S8, now | 4.3-7.8 | 29 % | 115 | 31 % | 9.6 px/s |

The ev/s figure moves between renders because the meter counts few events in shots this short. Both gaps are under 0.65 s and neither shot has a static frame. For comparison, the pilot's O1 is flat 18 %, detail 50 %.

**Stills:** `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S7S8/sheet_final.png` (pilot O1 and S4 beside the S7 and S8 key beats). The phone-size look is `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S7S8/sheet_final_phone.png`.

**Shared kit:** nothing added or changed. S7_desk imports O1's exported PhotoLine, Planner, Letters, Mittens, Radio and StarLantern without changing them, and S8 imports the float from `S7.tsx`. S7_desk's pieces (notebook, pen, phone face down, clementines, desk rows) can be reused by S12 and S16 for the same desk.

**Open items:**
- S8's detail warns at 31 % against a 34 % target. What's left flat is the plain dark screen and the bezel, which are the calm backing the plan locks, so I left them.
- I put S8's Pip at bottom right, the same side as in S7, instead of the plan's bottom left.
- S8 has no mug or charger plug at the right edge. At 1400 px the laptop runs past both edges, so its side port is off-frame; a cable runs off the right edge instead.
- `--cozy` reads S7 at 1.2 movers and 27 % empty frames. That's for information only, since S7 is a busy shot rather than a cozy hold.

=== S7-S8: INDEPENDENT REVIEW ===
**Verdict:** S7 meets the pilot's bar. S8 does not yet: its whole upper-middle band is flat, and Pip's beats read badly across the cut. My meter results match the lane's.

**Meter** (my own 0.5-scale renders with voice):

| Panel | ev/s | gap | flat | obj/Mpx | detail | verdict | `--cozy` |
|---|---|---|---|---|---|---|---|
| S7 | 6.5 | 0.65 s | 21 % | 154 | 44 % | PASS | movers 1.1, empty 29 %, float 7.6 px/s (information only) |
| S8 | 7.8 | 0.40 s | 29 % | 110 | 31 % | WARN on detail | PASS, float 9.6 px/s |

Pilot for comparison: O1 flat 18 %, detail 50 %; S4 flat 24 %, detail 56 %.

**Problems, most severe first:**

1. **S8, 18.28-19.40, the full width at screen y ~590-1060 (the lid).** This is the emptiest part of either shot.
   - What's there: the plain navy screen (y 672-918) between two flat hero-orange bezel strips, right under the captions. My flat map puts this band at 82 % flat, with ~236 px empty discs across the whole width. S8 is also hero 20 % and dark 23 % of the frame.
   - Why: the stick doesn't land where the board puts it. The storyboard says it "lands on the hinge, over the bezel and the keys", and the density plan wants the calm screen "behind the stick's top half". Instead it stands in the 3rd key row (`SLOT_V` 0.54, inherited from G5). Its top edge (y ~1030) only meets the bottom of the bezel, so the calm field backs nothing.
   - Fix: in `S8.tsx`, change `SLOT_V` from 0.54 to about 0.05-0.1, so the stick's foot sits at the hinge (y ~1080). The 217 px stick then covers the whole bottom bezel and runs 60-80 px into the screen: gold against navy, the strongest contrast in the frame. Keep the 0.4 s rise and the wobble. Move the `KeySprings` caps to the row the stick now leaves. Re-run the colour meter afterwards (hero and dark should both drop).

2. **Pip doesn't read, and doesn't stay the same Pip across S7→S8.**
   - S7, ~17.07-17.40, right of the laptop: Pip uses the back-view `sit-back` pose. Its "turn up to the bubble" moves the head about 3 px and tilts it about 5°. In my crops at 17.18 and 17.32 it reads only as a purple blob squashing and hopping; it never points at the stick.
   - At the cut it jumps from behind the pool's right rim, back to us, to in front of the deck, facing us, and much smaller relative to the world:
     - against the laptop: 0.32 of its width in S7, 0.13 in S8;
     - against the clementines: 2.2x in S7, 1.56x in S8.

     It reads as a toy figurine.
   - S8's `wide` eyes still look like plain dots at 0.5 scale. The `hold` trunk curls sideways at mouth height instead of reaching up-left to the stick on "chips".
   - Fix in S7: at ~17.07 switch Pip round to a face pose (`sit-front`, then `trunk-up` on "your"), looking up-left with expression `wide`, trunk toward the bubble. Hold it to the cut. O1 already does this kind of turn at 0.92.
   - Fix in S8: keep the front-facing, wide-eyed Pip and scale it to ~2.6x (S7's 1.4x times the props' own 1.9x cheat, ~255 px). That is still far under the 700 px stick. Put the head over the deck's front edge, and use flipped `trunk-up` on "chips" so the trunk points at the stick.

3. **S8, the stick itself (centre, y ~1030-1250).** At 700 px it is still the small icon scaled up: 4 flat black chips on a plain gold board. The hero is the flattest object below the screen. The camera plan asks for "its pins and chips exaggerated".
   - Fix: add close-size detail as a new optional prop on `MemoryStick` (default off) or a new `kit/S8_stick.tsx` overlay. Per chip: a pin-1 dot and 2 hairline print lines. On the board: thin traces, a row of tiny parts above the pins, and a small label. This raises detail where the eye rests and leaves the calm screen alone. S9's start ("S8's stick, chips readable") gains from it too.

4. **S7, whole frame: too warm, and its desk doesn't match S12's view of the same desk.**
   - The cool share is 6.2-6.4 %. Cozy v2 §4 asks for at least 10 %; S8 is 16.6 %, pilot O1 13.7 %, S4 14.9 %. At phone size S7 reads as one orange-peach mass.
   - S12, shot from S7's angle, adds a dusk-blue thermos (exported as `S12Thermos`), a dusk-blue scarf nest and a `skyLow` clip dish. S7 has none of them.
   - Fix in S7: put `S12Thermos` on the back row behind Pip, make S7's clip dish `skyLow`, and drape S12's dusk-blue scarf across the front desk. Optionally add 2-3 dusk-toned spines on the shelf. That should bring the frame to about 10 %. Never use the pop blue.
   - Note for the S12 reviewer: S12's laptop screen is light peach, which breaks cozy v2's "dcSide, matched S7/S8/S12". Its wall is also re-hung (a hoop, and the pinboard moved right). S7 follows the rules here, so those fixes belong in S12.

Nothing broken. Both caption bands are calm and readable. No hero colour on dressing, no pop colour, and key information stays out of the platform UI zones. The locked S7 beats land: the note flutter at 16.7, the bubble at 17.14 with the stick at 17.22, Pip's hop at 17.20 and the glint at 17.6. The float is continuous across the cut. No files were edited.

Everything is in `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_S7S8/`:
- `pilot_sheet.png`, `s7_sheet.png`, `s8_sheet.png`, `phone.png`, `pipcrops.png`, `s7_s12.png`, `refs.png`
- `s7.mp4`, `s8.mp4`


=== S12: BUILD REPORT ===
I built S12 out to the approved pilot's bar and it passes the density meter. Typecheck is clean, the caption band (y 290-600) has no dressing in it, and every locked beat still lands. Code is in `video/src/v3/film/scenes/S12.tsx` plus new `S12_wall.tsx` and `S12_desk.tsx`, committed (02741b5, a8ff288). Both pushes were rejected as non-fast-forward, so I left them for you to merge.

**What I added:**
- **The room:** S7's wall top and back row are reused as built, and the mug and thermos sit there too. Below the band the wall is re-hung for S12: the leaf print, an embroidery hoop and a taped list, the pinboard in S7's empty bubble spot, the shelf with books and pothos, the postcard, the 2026 calendar, the socket and two sticky notes. O1's lamp and its pull chain (the loop) are in.
- **The desk:** headphones, mittens, the charger into the laptop, sticky notes, glasses, clementines, the notebook and pen, biscuits, letters, a clip dish, your phone face down, the planner and the radio.
- **Pip:** 1.55x, front view, sitting on a dusk-blue scarf left of the tag. Its eyes follow the stick in, go wide on "makers", it hops back with its ears down on "pass", and turns to us worried on "on".
- **The world reacts:** the laptop dips as the stick goes in. On the ding the pinned notes, sticky notes, hoop, postcard and pull chain all jolt.
- **Camera:** the float replaces the breathe.

**Meter:** G5 was 1.0 ev/s, 49 % static, 70 % flat, 12 % detail (the plan's figures). Now it is 14.9 ev/s, gap 0.37 s, 0 % static, 21 % flat, 169 obj/Mpx, 47 % detail: PASS. The pilot was O1 18 % flat / 50 % detail and S4 24 % / 56 %. S12 isn't a cozy hold, so `--cozy` is for reference only: float 9.7 px/s, movers 1.6, empty 15 %, cv 0.36.

**Still sheets** (pilot O1 and S4 beside five S12 beats): `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S12/sheet_final.png` and the 0.25 phone look `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S12/sheet_final_phone.png`.

**Shared kit:** no kit changes. S12 imports S7_desk's and O1_life's exported pieces, so if those lanes change them S12 changes too. I copied five small drawings that S7_desk doesn't export (socket, postcard, sticky note, biscuits, clip dish) into the S12 files.

**Open items:**
- **Laptop screen — needs your call:** the cool share is 4.3 %; cozy v2 asks for at least 10 % and names S12 for a dark screen. I kept the light screen because the storyboard's cold-read fix 15 says "the laptop stays light" and S16 uses the same laptop. The dark screen would add about 5 %.
- **The stick:** it still reads small at phone size, at the size G5 built it (150 to 84 px).

=== S12: INDEPENDENT REVIEW ===
**S12 review (29.40-31.32).** The stills are about as full as the pilot and the meter passes. It is not at the bar yet: Pip's last expression reads as the wrong emotion, the stick is hard to see at phone size, the colour is all one warm family, and one wall patch is empty. Every timed beat lands at the right time: the stick at 0.05-0.50, the strike on "makers" at 0.56, $1,099 on "pass" at 0.86-0.88, held 1.04 s. The caption band (y 290-600) has nothing in it and the captions read well. The hero orange is only on the laptop and the tag, apart from the kit mug's stripe.

**My meter run** (0.5-scale Film3-S12 render with the voice): 13.9 ev/s, gap **0.87 s**, 0 % static, 21 % flat, 165 obj/Mpx, 47 % detail: PASS. For reference only, `--cozy`: float 9.7 px/s, movers 1.6 (range 0-4), empty 12 %, cv 0.36. The pilot is O1 18 % flat / 50 % detail and S4 24 % / 56 %. The lane reported a gap of 0.37 s; my run gives 0.87 s.

**Problems, most severe first:**

1. **Pip looks angry, not worried, on "on" (30.80-31.32, Pip at x 80-340, y 1250-1490).** The brows slope down toward the middle, a V shape, so the hand-off to S13 reads as cross. I checked this at full scale (`pip.png`). The cause is the shared `'worried'` brow in `src/lib/mascot/poses.ts` (the `eye()` function, around line 265): it draws the inner end low. S11's worried Pip at 3.62 probably has the same problem.
   - Fix in S12 now: key `{pose:'sit-front', expression:'wide'}` at `on - 0.04` and add a small head tilt, so it reads as big anxious eyes at us.
   - REQUEST to the orchestrator: swap the two y offsets of the worried brow (-6.2 and -8.6) so the inner end is high. This also changes S11 and v2 (P3, P6), so it needs a decision there.

2. **The 5x stick is hard to read at phone size (0.05-0.50, upper-left wall into the keyboard).** It is 150 px shrinking to 84 px. From about 0.25 to 0.45 it crosses the peach screen, and gold on peach has almost no contrast. At 0.25 scale it is a 20-37 px strip. The wall around it is also busier now than in G5 (the hoop, the list, the pinboard).
   - Keep the path and timing. Raise the stick to about w0 190 and w1 120 in `S12.tsx` (the `StickFlight` line).
   - Give it front-weight ink (4.8) if `StickFlight` takes it; if not, add it as an optional prop in a new kit file.
   - Problem 4's print also gives the stick a dark ground to cross early in its flight.

3. **The colour is all one warm family.** The cool share is 4.3 % against cozy v2's minimum of 10 %. Next to the pilot (O1's blue window, S4's blue street and coats), the frame is peach and terracotta except Pip and the scarf.
   - **The screen: keep it light.** This is the new laptop, the same one as O1's listing and S16, and storyboard fix 15 says it stays light. Cozy v2's dark screen belongs to your old laptop in S7 and S8.
   - Add at least 6 % cool through S12-owned dressing, away from the tag's ring:
     - a closed planner with a dusk-blue (`dc`) cover instead of the open one, bottom right: about 3-4 %;
     - the radio drawn in `dc`, as an S12 copy;
     - the letters as `skyLow` airmail envelopes;
     - the biscuit plate in `frost`;
     - the night print from problem 4: about 1 %.
   - Re-measure afterwards.

4. **One empty wall patch on the upper left (30.55-31.32).** It sits at x 130-370, y 615-910 (full px), between the leaf print, the hoop, the lamp shade and the socket: plain wall, about 230 x 300 px. That breaks the "no hole over ~200 px outside the band" rule, and it makes the calm band look as if it runs down to y 900 on the left. It is the stick's clear zone, but the stick has left it after about 0.15 s.
   - Hang a dusk-blue night print (`sky` field, a lit window, `snow`) at about x 190-330, y 770-900. The stick still enters on plain wall at (240, 704), then crosses blue, and the print adds cool for problem 3.

5. **Nothing new happens after the ding (30.47-31.32, the whole frame).** The meter finds no new medium event in that stretch (gap 0.87 s), and some 0.2 s windows have no movers at all. Pip's turn on "on" is mostly eyes and expression, too small to register. The plan's steam puff on the ding was never built (`S7Mug` has no puff).
   - Add a steam puff over the mug at ding + 0.1, as S16 did.
   - Add one settle beat at about 30.70: a pinboard note drops to hang from one pin and swings, or the desk sticky note curls up and settles.
   - Make the turn on "on" read: body or head turned toward us, not only the look value.

6. **The bottom and edges pull the eye or don't read (whole shot).** The face-down phone (x 400-650, y 1680-1920) is the darkest, hardest-edged shape in the frame, straight under the tag, so at phone size the eye drops to it. At the left edge, the mittens (y 1310-1400) read as a chocolate bar and the scarf tail (y 1440-1530) as a striped tie. The scarf nest under Pip reads as a navy puddle.
   - Push the phone down and right so 120 px or less shows (for example x 560, y 1800), keeping its dark case to match O1.
   - Give the mittens a visible cuff and thumb, or swap them for something that reads.
   - Let one knitted fold of the scarf rise behind Pip so it reads as fabric.

**Kit and shared files:** the lane made no kit changes. S12 imports exported pieces from S7_desk (`S7WallTop`, `S7DeskBack`, `S7Mug`, `SpiralNotebook`, `PhoneDown`, `Pen`, `Clementines`) and O1_life (`Letters`, `Mittens`, `Planner`, `Radio`), so a change in those lanes changes S12. The only shared-file request is the brow swap in problem 1.

Files are in /tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/S12rev/:
- `sheet_all.png`: pilot frames at 0.5, 2.0 and 7.0 s beside S12 at 0.02, 0.30, 0.62, 0.92, 1.50 and 1.90
- `phone.png`: the 0.25 phone look, pilot O1 and S4 beside five S12 beats
- `crops.png`: the stick over the wall and screen, the tag and Pip at five beats
- `pip.png`: Pip at full scale on "makers" and on "on"
- `s12.mp4`: the 0.5-scale render the meter ran on

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

YOUR TASK: the FIX step for S10-S14. A build lane already dressed them (its report and an independent reviewer's findings are below; the build commits are on
the branch). Fix every real problem the reviewer found (skip one only if it is wrong, or if it needs a change outside your panels; say which and why).
Own files only: video/src/v3/film/scenes/<ID>.tsx and <ID>_*.tsx for your panels; shared kit changes only as NEW files kit/<ID>_*.tsx or ADDITIVE optional
props (never change a default or another panel's look). CHECK: npx tsc --noEmit -p video; stills via Film3Shot at --scale=0.5 at the panel's beats beside
the pilot frames; a 0.25 phone look; python3 scripts/qa/density.py (run from video/; its header has the usage) on a 0.5-scale render of your panel (and
--cozy for cozy holds). Look at no more than ~12 images.
GIT: commit after every meaningful step (the container may restart; uncommitted work is lost), only your own paths (git add <paths>). Before each push:
git pull --no-rebase origin video-production (resolve only conflicts in your own files; never discard another session's work), then
git push origin HEAD:video-production. Use your harness's commit attribution lines. No pull requests. The repo is PUBLIC: never write an email address or a
secret into a file. Never touch video/docs/OWNER_PLAYBOOK.md, CLAUDE.md, HANDOFF.md or other panels.
WHEN DONE: write a report of at most 12 lines (fixes, final meter numbers, anything open) to video/docs/v3/g5b_reports/fix_S10-S14.md, commit and push it. That
file is how the orchestrator knows you are finished, so write it last.


=== S10-S14: BUILD REPORT ===
S10 and S14 are built to the pilot bar. Both pass every density signal at a fullness level matching the pilot, typecheck is clean, and every step is committed; every push to `video-production` was rejected as non-fast-forward, so the branch needs your merge.

- **What I added:** a whole street around the locked queue, drawn in the road's own perspective.
  - **Far plane:** clouds above the caption band, a hill town with a car crossing it, and the chip works behind the factory (annex hall, silos, a stack).
  - **Left side:** a street of houses with a CAFE and a BAKERY, snowy roofs, chimney smoke, lit windows with neighbours, lamps, trees, a pair chatting, walkers both ways, and snow sliding off an eave.
  - **Right side:** the gate (booth, barrier, the guard who steps out and waves), workers carrying crates, a forklift loop, a fenced yard (lorry, floodlight mast, crates, pallets) and the DELIVERIES sign.
  - **Near:** the road dressed with tracks, a steaming manhole and a hydrant; a bus stop, a snowman, a walker with a dog; three backs in front, the kid pointing up the queue.
  - **Pip** rides the van roof; in S14 it slides and clings on the shove, then shakes the snow off. Plus the sparrows lifting off the wire, the bus stop turning, and the workers turning to the chip maker on "chip".
- **Locked parts:** frame, breathe, road, data centers, van, sticks, bubble and timings are unchanged. S14 at t = 0 differs from S10 at t = 0 only in the caption (1.2 % of pixels).
- **Things I changed in the existing set:** to make the chip maker readable he steps forward onto the forecourt and grows from 92 to 118 px; the barrier arm is now 58 px. The old horizon houses became the hill town, and the old snowfall became three snow layers.
- **Meter, G5 → now:** S10 2.7 → 5.4 ev/s, flat 69 → 18 %, detail 15 → 48 %, gap 0.58 s, 206 objects/Mpx. S14 5.7 → 8.4 ev/s, flat 64 → 18 %, detail 18 → 48 %, gap 0.55 s. All pass; for comparison the pilot measured O1 at 18 % / 50 % and S4 at 24 % / 56 %. These are busy shots, not cozy holds, so `--cozy` doesn't apply.
- **Still sheet:** `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/s10s14/v3_s10_s14_g5b_sheet.png` (key beats beside pilot O1, pilot S4, reference 1 and v1). The phone-size sheet is `.../g5b/s10s14/phone/sheet.png` and the renders are `.../g5b/s10s14/s10.mp4` and `s14.mp4`.
- **Shared kit addition:** `kit/Street.tsx` `Wire3` takes optional `birds.rise` and `birds.fly`. The defaults (240 / 260) are unchanged, so S4 looks the same.
- **Files:** `scenes/S10.tsx`, `S14.tsx`, `S10_set.tsx`, plus new `S10_geo.ts`, `S10_far.tsx`, `S10_left.tsx`, `S10_yard.tsx`, `S10_near.tsx`.
- **Open items:**
  - No parked cars at the kerb: they would hide behind the first data center and muddy the lane.
  - The van's wipers aren't done.
  - There are 4 lamp posts plus the yard mast instead of the planned 5.
  - The guard and barrier beats are tiny at phone size; they're background life only.
  - Pip's "ears droop" is a jolt with a worried expression, but the back view hides the face; G6 should give it a real ear droop.

=== S10-S14: INDEPENDENT REVIEW ===
**Verdict:** S10/S14 are not at the pilot bar yet. The top half (sky, hill town, factory, left street, yard) is as full and alive as the pilot. The bottom ~40 % is still a pale, cold snowfield. The meter passes (my numbers below), but only because falling snow and tyre-track edges count as detail. The locked beats all still read: van with dots, data center first, sticks door-to-roof, chip maker plus bubble, 2026 to 2027, van shoved, second data center cuts in. The S10 = S14 frame match holds.

**Problems, most severe first:**

1. **The bottom of the frame is empty and cold** (both panels, start to end, screen y ~1100-1920).
   - **Where it's worst:**
     - The near pavement left of the front row (x 223-600, y 1500-1920): it holds only the hydrant at (376, 1746).
     - The road below and right of the van (x 0-600, y 1440-1920): track slabs and one manhole.
     - The road centre between the van and the bus stop (x 420-760, y 1100-1450).
   - **Measured:**
     - Below y 1100, two cool tones fill 46-47 % of the area: snow #E6EBF7 and road #B9C3DE.
     - Colours per 96 px patch: 3.6-3.9, against the pilot's 5.1-5.2.
     - At 0.25 beside pilot 2.0 / 7.0 s, the top half reads full and the bottom half reads blank.
   - **Fix, in S10_near.tsx:**
     - Extend the front row left along the near pavement: `backRowLayout` x0 600 → ~300, n 3 → 5-6, head tops ~1480-1560, heads 100-140 px, cut by the bottom. New people could carry shopping bags, wear earmuffs and raise a phone at the queue, or wear a snowy hood. Keep everyone at x > 260 and head tops ≥ 1480, so S14's shoved van (x 0-260, y 1408-1600) stays clear.
     - Kerb-corner props: a grit bin, two bollards, a bike against the hydrant, a ploughed snow ridge, a sledge.
     - On the road: slush ruts and puddles with warm lamp and headlight reflections, and warm window spill from CAFE/BAKERY across the left pavement. The road stays the locked light band but stops being two flat tones.

2. **Pip is lost** (in S14 from ~1.5 s to the end, 34.9-36.36; in S10 at 1.66).
   - After the shove, Pip's feet settle at x ≈ 40, so its body spans x -5 to 85 and is half cut by the left edge. The cling and the snow shake (1.9 = 35.30) don't read at phone size.
   - In S10, the only reaction on "first dibs" is a jolt plus a worried face on a back-view sit-back, which can't be seen.
   - **Fix, in VanLife (S10_near.tsx ~L292-305):**
     - S14: make the slide net rightward (inertia toward the cab) and settle with feet at x ≥ 105, left of the waiting dots at x ≥ 165. Or hop Pip down onto the new near pavement at ~1.62 and shake there.
     - S10: use a silhouette change at 1.66, either `ears-cover` or a look toward camera (look ≤ -0.3) with the ears flat.

3. **The data center's outline runs into the BAKERY awning** (S10 for the whole panel; S14 from 0 until the cut-in covers it).
   - The awning uses `EMBER.dcSide` #323A5E, the data center's own shade colour, and touches its left edge at x ~430-470, y ~960-1010. At phone size the subject seems to grow a dark arm and loses its calm ring.
   - **Fix:** S10_left.tsx L55, change the awning to a warm tone (e.g. `EMBER.board` or a beam/card stripe) and end it 30-40 px short of the data center's edge.

4. **Grey and cold light colours.**
   - **Grey halos:**
     - `HALO_WALL` outer ring = mix(dc, ring, 0.35) = #847C81. It is used on the left-street lamps (S10_left.tsx L393): the edge lamp at x 0-160, y 1040-1200 and the bakery lamp at x 240-400, y 960-1040.
     - The FloodMast outer ring = mix(sky, ring, 0.3) = #8A8691 (S10_yard.tsx ~L131), at x 960-1100, y 640-800 under the band on the right.
     - Both read as dead grey-mauve rings, not light.
   - **Cold beam:** the van's headlight beam is mix(road, snow, 0.7) = #D8DEEF, a cold white slab beside the van's nose (x ~450-660, y ~1310-1440).
   - **Fix:** wall halos to a warm step (like `HALO_SNOW`'s mix(snow, ring, 0.42)), or `EMBER.skyLow` where a halo sits against the sky. The beam to `HALO_SNOW[0]`.

5. **Too many reactions land on the same frames in S14** (1.28-1.40 = 34.68-34.80, mid and bottom frame).
   - The guard steps out (1.30), the birds lift (1.30), the bus stop turns (1.34) and the kid points (1.36), all while the van shove and the cut-in are landing.
   - The kid's arm is the largest moving shape in the near plane, and it swings up exactly as the subject lands.
   - **Fix:** stagger the reactions 0.1-0.3 s after the cause: birds 1.42, guard 1.45 (barrier 1.70, wave 1.75), bus stop 1.48, kid 1.52. The cut-in then lands alone and the world answers it.

**Checked and fine:**
- **Caption band:** calm, and white on the dusk sky reads well. Sticks peak at ~y 640; only the chimney from the locked G5 frame reaches ~588.
- **Right rail:** DELIVERIES spans x 797-947, so it stays out.
- **Hero and pop colours:** hero orange appears only on the van's laptop (0.22 % of the frame); the blue pop isn't used.
- **Consistent with the film:** the data center, Pip, the hero laptop and blue hour with snow all match O1.
- **Chip maker:** the lane moved him forward and grew him from 92 to 118 px. He still reads as "at the door" and the bubble's tail hits his head. I accept it as a readability fix, but it is a small departure from the locked board.
- **Van in S14:** it ends half off-frame, but that push is unchanged from G5 (`VAN_PUSH` [-190, 170]).

**Meter (my renders at 0.5, 60 fps, with the voice):**

| panel | ev/s | gap | static | flat | obj/Mpx | detail | result |
|---|---|---|---|---|---|---|---|
| S10 | 6.6 | 0.45 s | 0 % | 18 % | 201 | 49 % | PASS |
| S14 | 8.4 | 0.55 s | 0 % | 18 % | 198 | 48 % | PASS |
| S10, crop y 1100-1820 | | | | 9 % | | 56 % | pale area, see problem 1 |

The lane's commits (up to 9b0859e) are on the local `video-production` branch, 21 ahead of origin and not pushed.

Everything is in `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/rev_s10s14/`:
- `cmp_pilot_s10.png`: pilot at 0.5, 2.0 and 7.0 s beside S10
- `s14_sheet.png`: S14 key beats
- `phone_sheet.png`: the 0.25 phone look
- `door_crops.png`, `van_crops.png`, `cutin_crops.png`: full-size crops
- `s10.mp4`, `s14.mp4`: the renders I metered

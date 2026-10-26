# Video 3, G3 storyboard (board v3, cine, fix round 1): "The laptop deal that flipped"

Data: `public/v3/animatic.json` (`"style": "board"`, label `v3 G3 cine`, drawn by `src/v3/SketchReel.tsx`, composition
`Animatic` in `src/entry-v3.tsx`), built by `scripts/v3/build_board_cine.py` from the camera plan
(`docs/v3/camera_plan_g3.md`, with the supervisor's changes). Board v3 puts the cinematography back into the clear
board v2 (the owner: "where is the scale / coziness / learnings from Arcane?") and replaces the opening (the owner: "why
is the AI data center growing and consuming the buildings?") with the real mechanism. Fix round 1 answers one sound-off
cold read and the cinematography review (below). House style: `docs/look/STORYBOARD_STYLE.md` (§0 signal per drawing,
§3 notes strip, §7 cinematography). The lint (`python3 scripts/v3/board_lint.py public/v3/animatic.json`) reports 0 errors
and 0 warnings. Voice: the owner's take 4 (`public/v3/voice.wav`, 0.12 s lead, 41.15 s). Words, audio and every cut (on
the same word) are unchanged; one sfx moved (the ding, with S12's new price, 30.84 to 30.28). The MP4
`deliverables/v3/v3_g3_animatic_board.mp4` predates fix round 1: re-render it before showing the owner.

**The story in pictures.** In your dim nook, the one bright window shows an AI data center over the houses; you're about
to buy a $999 laptop on your phone. Memory sticks lift off the listing's laptop, fly out past the lamp, up the window
and into the data center's roof, and every stick that leaves pushes your tag up one step, faster and faster, to $1,099
on "pricier". You lower the phone; the data center turns dark and gets circled. A plain chart shows the old deal; right
after you buy one, a BETTER one comes out for the same $999 (aw, man); this year the line turns up. Your laptop on your
lamp-lit desk runs on one memory stick, and that stick rises out of it, bigger than the laptop. We rise over OUR ROOF to
an AI data center too wide for the frame, swallowing sticks, then cut to the ground: their mountain of memory runs past
both edges and towers over tiny you with your one stick. Up the road at the chip factory the data center is first at the
door while the laptop van waits behind; a stick costs 5x; the laptop makers pass it on, $999 to $1,099. Back in your
nook you wait for the better one, the data center quiet outside your window, but the chip maker says 2027, a second
data center cuts in and the van is pushed back. The opening's last picture returns; on the phone, the tag turns over to
show a data center on its back.

| Panel | Time (s) | The one idea | Shot type | What we see | Camera |
|---|---|---|---|---|---|
| O1 | 0-5.80 | Each memory stick that leaves for the AI data center pushes your laptop's price up one step: $999 becomes $1,099. | HOME BASE (cozy nook), POV close-medium, one continuous shot | **Frame 0:** bare lines drawing on (55-90 % done): the window with its sill and one mullion, the horizon with 2 houses, the data center with a blank sign, the lamp shade, your phone with a laptop listing, the cart under your thumb (cart pop at 0.0); the tag already complete with its "$999" (the expected thing; also the loop frame). Tones flood in by 0.2 s: the ROOM, one mid tone over the whole frame (wall, shelf, desk), so the light glass is the brightest thing in the nook; the paper building; the paper lamp pool on the desk. **Expected (0.12-1.88):** "$999"; the AI DATA CENTER sign pops at 0.25. **Reality:** memory sticks rise off the listing's laptop at 1.88, 2.18, 2.40, then a burst at 2.60 and 2.72; each flies left past the lamp, up the clear glass and onto the roof, and each launch ticks the tag one step ($1,019, $1,039, $1,059, $1,079, $1,099) while a struck "$999" sits above it. **"Well, AI data centers are":** you lower the phone (3.64-4.00); at 4.04 the building goes dark (the subject) and a red circle draws round its sign; the tag stays below, now a mid line. | PULL OUT 1.05 to 1.00 about the centre, ease-in over the whole shot, no tilt (window top at screen y 613) |
| S4 | 5.80-9.48 | For 20 years, the same money bought more computer. | INSERT, chart straight-on | Frozen: "US computer prices", L axes, "2005", one line drawn downhill with the voice. | HOLD |
| S5 | 9.48-11.48 | Right after you buy one, a better one comes out at the same price. | MEDIUM, waist-up (the face beat) | You, big, behind a shop counter that cuts you at the waist, holding your laptop with its $999 tag, happy; on "after" (10.20) a BIGGER laptop labelled BETTER with the same $999 tag pops onto the shelf upper right and your face goes "aw, man" (worried; the shock face read as "something bad happened"). | HOLD |
| S6 | 11.48-16.60 | This past year, US computer prices turned up: +9.7 %. | INSERT, the exact S4 frame | Built from S4's elements (title, axes, "2005", the line, now 5 px) plus the hook rising from "US" to "went" and "+9.7%" on "almost 10%". | HOLD |
| S7 | 16.60-18.28 | Your laptop runs on the memory stick inside it. | CLOSE at your desk (home base) | O1's room tone with the desk's back edge, O1's lamp shade cut by the left edge, the laptop (420 px) in a 640 px paper lamp pool on the mid desk; on "your" (17.24) a see-inside bubble pops upper right with the stick. | HOLD |
| S8 | 18.28-19.40 | It runs on a stick of memory chips. | EXTREME CLOSE, cut-in on S7's axis; SCALE ladder 1/3 (`scale`) | Redrawn at size in the room tone: the laptop's keyboard cut by both side edges, its screen plain; the stick (700 px, 65 % of the frame) rises out of the keys (0.4 s) and lands on the hinge, over the bezel and the keys (inside the screen it read as a picture on the display); the pool's edge below. | HOLD |
| S9 | 19.40-21.32 | AI data centers run on memory chips too, lots of them. | SCALE 2/3: S1 rise-over reveal (the one big move), `scale` | Start: OUR ROOF (a mid parapet with a light coping lip and one vent, cut by both sides; "OUR ROOF" in the notes) fills from screen y 880 and hides half of the data center, a wide hall cut by both side edges; its roof units and its sign (AI DATA CENTER, on the building) show. The roof drops out while seven sticks (150 px) fly in from the side edges just over the roof units from 19.95 and dive into it. Land (20.8): the hall cut by both side edges (1290 px on screen), a row of small paper houses at its foot (~1:7), plain sky above, our roof's lip at the bottom. | RISE: camera y 1080 to 960, zoom 1.00 to 1.04, `unveil` ease, landing at 20.8; the roof's own 373 px drop runs `outSine` over the whole panel (peak 14.6 px per 30 fps frame on screen) |
| S9b | 21.32-22.68 | ... by the mountain. | SCALE 3/3: CUT to a WORM'S-EYE, tiny figure, `scale` | Ground-level camera, the horizon low at y 1500: the mountain of memory sticks (1480 x 880, ram-sized sticks) runs past both side edges up to just under the caption band; their data center small at its foot; tiny you (86 px, 10:1) on the paper ground in front, holding your one stick. | HOLD |
| S10 | 22.68-25.24 | They pay more, so they get first dibs. | MEDIUM-WIDE, slightly high, looking up the queue | The road (one light band) runs from the laptop van (near, bottom left, 380 px, a laptop on its side, three waiting dots over the cab) up to the chip factory's door (far, upper right); the data center (dark, the subject, labelled) is first at the door, and sticks fly from the door into its roof. | HOLD |
| S11 | 25.24-29.40 | What's left costs 5 times last year's price. | INSERT, bars straight-on | Frozen: a light "last year" bar and a dark bar five times as tall, "5x". | HOLD |
| S12 | 29.40-31.32 | Laptop makers pass it on. | CLOSE on the tag, S7's angle | The 5x stick slides into the laptop (light, as in S7); under it O1's price tag is the subject: $999 struck on "makers", $1,099 on "pass" (30.28, with the ding), so the change holds 1 s and is on the middle frame. | HOLD |
| S13 | 31.32-33.40 | Normally you'd just wait for the better one. | HOME BASE returns, MEDIUM-WIDE, 3/4 back | O1's room tone; O1's landscape window (0.85x, mullion and sill) on the right with its horizon and the data center outline outside (far lines, its sign); the lamp shade on the window's lower-left corner and its paper pool on the desk under the window; you sit facing the window (the darkest shape), the wall clock upper left, the thought bubble with the BETTER laptop on the wall above your head. | HOLD |
| S14 | 33.40-36.36 | Next year is even tighter: the line ahead of laptops gets longer. | MEDIUM-WIDE, the exact S10 frame | Built from S10's elements: on "chip" (33.56) the chip maker (a small figure at the factory door) speaks, the bubble's tail at his head, a calendar 2026 that flips to 2027 on "next"; at 34.60-34.90 the van (with its laptop and dots) is pushed back down the road, and at 34.76 a second data center (dark, the new subject) cuts in between it and the first one, which steps back to mid. | HOLD |
| S15 | 36.36-38.84 | That's how an AI data center ends up on your price. | HOME BASE callback = O1's end frame, POV | O1's last picture held: the dark, named data center in the window above your lowered phone, struck $999 and the $1,099 tag. No mark. | HOLD |
| S16 | 38.84-40.85 | ... on your next laptop's price tag. | CLOSE-UP, cut-in on S15's tag (1.275x on its axis) | S15's phone in the room tone: the listing laptop, the struck $999, the $1,099 tag (460 px, centred), the cart; the tag turns over at 39.70 (like-pop 39.88) to show a data center on its back. | HOLD |
| LOOP | 40.85-41.15 | Back to frame 0. | DISSOLVE 0.12 s | O1's frame-0 lines, drawing on slowly so every stroke ends at exactly its frame-0 progress: window, horizon, building with a blank sign, lamp, phone, listing, cart and thumb; the tag complete with its $999. | O1's start camera (zoom 1.05) |

**Film-level checks (as built, fix round 1):** two animated moves (O1's pull-out, S9's rise); one red mark (O1's circle
at 4.04); home base O1, S7, S8, S13, S15, S16, LOOP = 15.5 s, 38 % of the film and 55 % of the time outside chart
inserts, now all in ONE room tone with the lamp, so the place visibly returns; one scale moment S8 > S9 > S9b (a ladder:
one stick bigger than the laptop, a hall too wide for the frame, a mountain past both edges at 10:1 over you), the three
`scale` panels lint-checked as BIG; the wides change angle (eye-level reveal, worm's-eye, slightly high queue); size or
angle changes at every cut except the deliberate matches S4 = S6, S10 = S14, O1's end = S15, each now built from one
element list plus the changes.

**Sound:** unchanged except the ding (the cart pop at 0.0, led ticks, crane clunks at 1.88, 2.12, 2.30, 2.42, floor slams
and stamp at 2.60-2.75, the thoom at 4.76; the ding moved 30.84 to 30.28 with S12's new price on "pass"; the like-pop
at 39.88). The sticks launch at 1.88, 2.18, 2.40, 2.60 and
2.72, so two clunks are 60 and 20 ms off their stick, and the thoom lands 0.7 s after the turn at 4.04: the camera
plan's sound map (rising tiks on the sticks, the thoom on 4.04) is for the sound pass.

**Fix round 1: what changed, and the note it answers** (cold read = one sound-off viewer on the 25 % sheet; review =
the cinematography reviewer)
- **Notes strip (review 10-11):** line 1 in 48 px ink bold = shot type, COZY / SCALE and the move; line 2 in 38 px ink = the
  idea and the transition; no label or timecode (`SketchReel.tsx` strip; notes as "line 1\nline 2").
- **O1, S15, S13 (review 1, 3):** the room is one mid tone over the whole frame, so the light window is the opening, not a
  picture on paper. S13 reuses O1's landscape window and data center outline; its pool sits on the desk.
- **S7, S8, S16 (review 2):** the same room tone and lamp as O1; S16 is a cut-in on S15's phone and tag (1.275x on its axis).
- **S5 (cold read 6):** the new laptop is bigger and labelled BETTER; the face goes worried, not shocked.
- **S6 (review 9):** built from S4's elements, so "2005" is back.
- **S8 (review 7):** the stick (700 px) breaks out over the bezel and the keys.
- **S9 (cold read 10, review 4-5):** the hall is cut by both side edges at both ends; our roof has a lip and a vent and the
  notes say OUR ROOF; the sheet shows the start (19.5 s) and the landing (21.2 s), sampled off caption pops.
- **S9b (review 6):** worm's-eye: horizon at y 1500, the pile past both edges, 10:1 over tiny you on the ground in front.
- **S10 = S14 (cold read 13, 17; review 8-9):** a queue in depth from slightly above with waiting dots; S14 is S10's
  element list plus a speaking chip maker, 2027, the van pushed back and a second, darker data center cutting in.
- **S12 (cold read 15):** the laptop stays light; $1,099 comes on "pass" (the ding moved with it).
- **LOOP (cold read 20):** the tag carries its $999 on frame 0 and in the loop frame; the strip says "DISSOLVE back to frame 0".
- **Kit:** board-lint knows `scale` panels (subject >= 648 px or cut by both edges) and treats a bare year as an axis word;
  the pile icon keeps its sticks ram-sized (at most 130 px), so a wide pile gets more sticks, not bigger ones.

**Board v3: what changed vs board v2, panel by panel**
- **O1 (new concept):** no growing or swallowing. The home-base nook (refuge mass, one window, lamp and pool) with the
  real mechanism: memory sticks leave for the AI data center and the tag ticks up one step per stick ($999 to $1,099
  on "pricier"); the building turns dark and is circled on "AI" (4.04). 25 elements: window + mullion + sill is one
  shape, the horizon and both houses one far line, two of the three sticks relaunch for the burst.
- **S5:** waist-up behind a shop counter, head ~1.9x (was a full figure).
- **S7:** a light desk mass and a 640 px paper lamp pool under the laptop.
- **S8:** redrawn at extreme-close size: the keyboard cut by both edges, a plain screen behind the 460 px stick.
- **S9:** a real rise-over: the ledge hides half the building at the start and drops 520 px on screen (was a 140 px
  nudge); the sticks arc in from the sides; a low band of houses gives the scale.
- **S9b:** low angle with one ground line; the grey ground slab is gone; the data center at half size.
- **S12:** the price card is now O1's tag.
- **S13:** the nook around the frozen chair, figure, clock and bubble (moved 40 px left): shelf mass, window with the
  data center outside, lamp and pool.
- **S15, LOOP:** re-derived from O1's new end and start frames.
- **S16:** a desk mass and lamp pool, the laptop cut by the left edge.
- **S4, S6, S10, S11, S14:** drawings frozen; only the notes strip now names the shot type.
- Every notes strip now states the shot type, the framing and COZY / SCALE in plain words with the idea.

**Notes for the owner / G4-G5:**
- O1's fallback (judge): if the cold read takes the sticks as "data centers pull memory out of laptops", launch them
  from a small row of sticks beside the listing's laptop instead of from the laptop.
- $999 to $1,099 is an illustrative listing price (+10 %, in step with the US +9.7 %); not a fact, no source. The five
  $20 steps of O1's ticker are a picture of the mechanism, not data.
- S6's hook is schematic (a true +9.7 % would rise ~10 px on this scale); S11's 5x is verified (Gartner, Q2 2026); S14
  shows the chip makers' 2027 forecast without a price.
- The caption pager still splits into 1-3 word fragments (`MAX_CHARS = 16` in `SketchReel.tsx`); the owner's call.

Cold-read sheet (25 %, one frame per panel at its middle, kept off caption pops; the opening at 0.3, 2.0, 3.0 and 4.9 s;
S9 at its start 19.5 s and its landing 21.2 s): `coldread/sheet_board_cine.jpg`, indexed by
`coldread/index_board_cine.json` in the session scratchpad (board v2's sheet: `coldread/sheet_board.jpg`). Board v2 and
v1 are in git history (`90e8d69` and earlier).

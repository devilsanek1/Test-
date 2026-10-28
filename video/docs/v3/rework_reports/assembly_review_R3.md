# v3 rework assembly: independent review R3 (the owner's eye, cold)

Status: DONE. Reviewer R3, 2026-10-28.

Film under review: `scratchpad/rework/assembly/film_full.mp4` (2469 frames, 1080x1920, 60 fps, voice, code at be03dfa;
rendered from `Film3`). Bar: the approved hook pilot `video/deliverables/v3/v3_rework_pilot.mp4` (SQA 0-5.80).

Method: watched cold first, as a viewer scrolling a feed (0.25-scale frames, 5 per second of film, contact sheets;
once with the narration's words and timings beside the frames = "sound on", once with only the pictures and the
burned-in captions = "sound off"); notes per 2-3 s written BEFORE reading the owner's words, DIRECTION or any spec;
then turned into findings against the owner's words and the rules only.

## 1. Cold watch notes (written before reading any spec)

### Pass 1: sound off (pictures + burned-in captions only; 14 sheets, 5 frames per second, 0.25 scale)

| film s | where my eye went | what I understood | rough / empty / busy / abrupt / swipe? |
|---|---|---|---|
| 0-1 | pen outline of a phone and a $999 tag on frame 0, full colour by 0.2; the red tag, then the title | someone is about to buy a $999 laptop; the payoff line is printed on top | clean, warm, one subject. Two text blocks to read in the first second (title + caption) |
| 1-3 | the tag; the price ticks $1,015 ... $1,079; a tiny stick flies from the window into the phone | AI is making it pricier, the price is climbing | fine; the stick is tiny (I only saw it on the sheet, not as a read) |
| 3-6 | the phone washes pale, the "AI DATA CENTER" sign plate lights in the window | the data center is the cause | clear hand-off of focus; good |
| 5.4-6.4 | a pan right; a white chart card slides in | a chart is coming | smooth |
| 6.4-9.5 | the caption, then the chart: a thin red line falls 2005 -> 2025 | laptops get cheaper for the same power | the chart is small (about 2/3 of the width, 1/5 of the height, mostly empty white); the pale phone is the biggest thing on screen and says nothing new |
| 9.5-11.5 | two tiny laptop stickers ($999, BETTER $999) on the line | you buy, then a better one comes | the stickers' words are unreadable at phone size |
| 11.5-14.2 | only the caption changes ("But this past year, in the US,") | waiting | NOTHING new on screen: same framing since 6.0 s. First swipe point (~12-13 s) |
| 14.2-16.0 | the line's end kinks up (tiny), "+9.7%" in red; the tag on the pale phone flashes red | prices went up almost 10%; my laptop price is part of it | +9.7% reads; the up-kink itself is a few pixels |
| 16.0-17.4 | pan back left to the window, the phone lights up again | back to my phone | smooth, clear |
| 18.2-19.2 | a memory stick pops out of the phone top and grows over it | memory chips are inside laptops | strongest beat of the middle; clean, one subject |
| 19.4 | a giant close-up of the stick fills the frame: big black chip blocks, the caption printed over the board | ? | ABRUPT: reads as a cut into a heavy dark block; the caption sits on the stick |
| 19.6-21.0 | the stick sits on a heap; the camera pulls back to a hill of hundreds of tan rectangles with dark slots, a town at the foot | a pile ... of pallets? bricks? | the BUSIEST, roughest frames of the film; at phone size the heap does not read as memory chips; the voice says "AI data centers" but no data center is on screen |
| 21.0-21.4 | a near-black slab enters at the left edge, then "AI DATA CENTER" | oh, the data center sits by the hill | the slab is a black block cut by the edge for ~0.3 s |
| 21.4-22.6 | the street band: data center, gold hill, vans, a bench, a bike; a desk edge rises at the bottom | we are looking out of a window | fine settle |
| 22.6-25.2 | the hand and phone slide in from the left, cut by the left edge; many small vans in a row; a mug on the right | "they pay more, so they get first dibs" | I could not find "paying more" or "first dibs" on screen: who pays, which van goes first? Where do I look? |
| 25.2-27.0 | a slow push-in; a tiny crate hops above a white van; the mug grows | "what's left costs ..." | the crate is a few pixels; nothing says "what's left" |
| 27.0-29.0 | a white "~5x RAM chips" notice on the small shop at right | five times the price | readable, but small (about 1/5 of the width) and off to the side |
| 29.2-31.2 | the phone (half cut by the left edge) lights, $1,079 -> $1,099 | laptop makers pass it on | the beat plays on a half-visible phone |
| 31.3-33.4 | nothing new | "normally you'd wait for the better one" | NOTHING new on screen; second swipe point (~32 s): the same window frame since 23 s |
| 33.4-36.4 | a "2027" notice replaces "~5x" | next year is tighter | small, readable |
| 36.4-38.2 | a small camera nudge, the data-center sign lights white | "that's how an AI data center ..." | fine |
| 38.2-39.9 | the phone slides to the centre, big, full colour | it ends up on my price tag | clear payoff |
| 39.9-40.8 | the tag shows a tiny data center inside it; a purple toy elephant pops up beside the phone top | the data center IS my price tag | nice idea; the toy's pop at the same moment pulls my eye off the tag |
| 41.0 | top half wipes to the pale opening room while the bottom is still the window | loop | a split frame for a beat |

What stayed with me (sound off): the hook (0-6) and the chip pop (18-19) are the film at its best; the two long holds
(6-16 on the small chart, 23-36 on the street band) are where I would swipe; the heap (19.4-21) is the one place that
looks rough and busy rather than calm; the window band (23-36) has many small parts and no single place to look, and
the biggest bright shape there is the gold hill, which is not what the voice is talking about.

Motion as measured at phone size (moving-area share per 0.5 s, 0.1 s lag, luma step > 6): hook 2-3 %; 6.5-15.5 2-5 %
(the chart line plus a faint whole-scene float); 19-21.5 41-62 % (the zoom over the heap); 23-36 mostly 0.4-1.6 %,
with the only peaks at camera moves (25.0, 36.5) and the phone beats (30.0, 31.0).

### Pass 2: sound on (the voice's words and timings beside the frame at each spoken key word; 2 sheets, 38 beats)

The track is the voice alone (no bed): first sound at 0.20 s, pauses of 0.25-0.5 s between lines, silence 40.40-41.15.
Does the picture show what the voice says, when it says it?

| words heard (s) | on screen at that word | match? |
|---|---|---|
| "Buying a laptop soon?" (0.12) / "AI's making it pricier" (1.64-2.6) | the $999 tag, then the price ticking up | yes, exactly |
| "Well, AI data centers are." (3.64-4.04) | phone washes out, the data-center sign lights | yes |
| "Which is backwards." (5.80) | an empty chart card | late: "backwards" is only drawn from 7.0 |
| "Laptops get better for the same money ... right after you buy one" (7.08-10.44) | the falling line, two tiny laptop stickers | yes, but small |
| "But this past year, in the US," (11.48-12.60) | unchanged frame | NO: the story's turn ("But") has no picture for 2.7 s |
| "computers went up almost 10%." (13.56-14.84) | the up-kink at 14.2-14.6, "+9.7%" at 14.8 | yes (0.6 s late, fine) |
| "Mostly because your laptop runs on memory chips." (16.60-18.28) | back to the phone; the stick pops out of it | yes, the best-matched beat after the hook |
| "And so do" (19.40) | a giant dark close-up of the stick, caption over it | abrupt |
| "AI data centers." (19.96) | a heap of tan blocks; no data center anywhere | NO: the data center the voice names is not on screen until 21.0, and then as a black slab at the edge |
| "By the mountain." (21.32) | data center + hill + street | yes |
| "They pay more, so they get first dibs." (22.68-24.20) | the window band; a row of small vans; the pale phone's tag flashes at the left edge | NO: nobody visibly pays or goes first at phone size |
| "Which means what's left costs" (25.24-25.72) | a slow push; a few-pixel crate above a white van | NO: "what's left" is not readable |
| "about five times last year's price." (26.84-27.88) | "~5x RAM chips" notice on the far-right shop | yes, small |
| "And laptop makers pass that on." (29.16-30.28) | the half-visible phone lights, $1,079 -> $1,099 | yes, on a phone cut by the frame edge |
| "Normally you'd wait for the better one." (31.32-32.28) | unchanged frame | NO picture for 2.1 s |
| "But chip makers say next year's even tighter." (33.40-35.32) | "2027" notice replaces "~5x" | yes (from 34.8), small |
| "So that's how an AI data center ends up on your next laptop's price tag." (36.36-39.88) | sign lights; the phone slides to centre; the tag shows the data center | yes: a clean payoff; the toy elephant's pop at 40.4 competes with it |

Sound on, the film is easier to follow (the voice carries 11.5-14 and 22.7-26), but it confirms that four spoken beats
have no picture of their own and that two of the film's three longest holds (SQB's card, SQE's window band) are where
the picture falls behind the words.

## 2. Verdict

Mostly yes. The rework answers "no story, no clean transitions": one home, one view out, the tag carried through, joins
that flow at 60 fps (none reads as a cut), and the hook (0-6 s) and the chip pop (18-19 s) sit at the pilot's bar, with a
clean line and gentle light wherever I looked at phone size. It does not yet answer "too busy / too rough" and "what to
keep my attention on" in three places. What an owner sees first: the summit heap at 19.4-21.0 reads as wooden pallets or
bricks, the one rough, busy stretch, on the film's big reveal (the blocker). Then SQB's 10 s chart hold, where the night
strip at the left edge pulls the eye as hard as the falling line, and "But this past year" has no picture of its own.
Then the street, where "first dibs" and "the better one" don't read at phone size: the red tag's flash takes the eye off
the truck going first. Fix the blocker and the four majors and this cut meets the pilot's bar.

## 3. Scores (the measures run)

- **Cold watch:** 14 sheets at 5 frames per second (0.25 scale) watched with the sound off, 2 word-aligned sheets (38 spoken
  beats) for the sound-on pass, 8 detail and 1:1 crops; about 21 images per pass. Where I would swipe: ~12-13 s (SQB:
  nothing new on screen 11.5-14.2), ~20 s (the heap), ~32 s (SQE: nothing readable on screen 31.3-33.4).
- **Motion at phone size** (share of the frame moving per 0.5 s, luma step > 6 over 0.1 s): hook 2-3 %; SQB 2-5 % (the
  line, plus a faint whole-scene float); SQD 41-62 % (the pull-back over the heap); SQE 0.4-1.6 %, with peaks only at the
  camera moves (25.0, 36.5) and the phone beats (30.0, 31.0); SQF 2-9 %; the loop's wipe 52 %.
- **Salience** (CRAFT §e, the frame's top 3 %, captions out). SQB, card / window strip / phone: 6.6 s 5 / 49 / 32; 7.5 s
  14 / 44 / 18; 8.5 s 31 / 35 / 16; 9.0 s 36 / 34 / 15 (the strip's mullion column alone 18 %); 10.0 s 36 / 36 / 14;
  11.0-14.0 s 75-78 / 14-18 / 5-6; 15.0-16.0 s 59 / 24-25 / 8-9; the tag's jolt at 15.5 s takes 82 %. SQE: at 24.0 the
  gate and trucks hold 57 %, the lane's vans 28 %, the phone 14 %. At 24.3 gate and trucks 42 %, tag 15 %. At 24.6 (the
  sway) the tag 71 %, gate and trucks 12 %; at 24.9 the tag 71 %. At 26.0 the van into the pool 20 %, at 27.5 the "~5x"
  notice 53 %, at 32.5 the lane with the BETTER van 31 %, and at 36.1 (the jolt) the tag 69 %. The mountain holds 2.5 %
  at 24.0: not a magnet.
- **The heap at 20.40** (y 1000-1900): the largest fill is L* 56 C* 24 h 60 (23 %), then L* 48 C* 24 h 50 (6 %); the gold
  fills (L* 68-72, C* 36-40) are ~27 %. The crest chips are `#966E59` (L* ~50, C* ~17). SQE's mountain: 4.8-5.2 % of the
  frame, L* 67 C* 37 (gold, not a field).
- **J3 at 60 fps:** one continuous push into the stick and out onto the heap. Near-black (L* < 20) goes from 3.6 % at 19.10
  to 32.5 % at the cut (19.40) and back to 2 % at 19.85; the mean L* drops 71 -> 51. It reads as a 0.25 s whoosh, not a
  cut: not a finding.
- **The data center at 21.0-21.5:** its L* < 25 area is 1-3 % of the frame, inside the dark anchor. It enters ~1 s after
  its word, which flow_v2 §4 accepts (the S5 move); the heap's own read (R3-1) has to carry the line until then.
- **Right rail:** the "~5x" and "2027" notices end at x 945-948 (the rail starts at x > 950), so they are clear.
- **Sizes at phone size** (a phone shows 1080 px as ~390 pt, so 0.36 pt per px). Street at H2 rest (24.0): DC truck ~200
  px wide, workers 45-50 px tall, crates ~25 px (~9 pt). BETTER van: label ~60 x 18 px and decal laptop ~60 x 45 px, both
  measured in the pushed frame. SQB: the end dot's pulse at 11.80 grows from r 8.6 to 12.8 px. Pip: at 40.0 its side cling
  is ~110 x 170 px; at 40.30-40.70 a frontal shrug ~160 x 170 px (~1.3 % of the frame) sits over the phone's right edge.
- **Audio:** the voice plus sound cues (thoom 4.04 +10 dB, 21.72 +15 dB; ding 30.28; like-pop 39.88). No bed. First sound
  at 0.20 s; pauses of 0.25-0.5 s between lines.
- **Draft label:** the bottom-left "G5 · SQx · time" shows because this render is `Film3`, not `Film3Final`: expected for
  a stage-labelled cut.

## 4. Findings (blockers first, then what the owner sees longest)

- **R3-1. BLOCKER (reveal). SQD 19.40-21.30, the summit heap, centre and lower two thirds.** Owner: "The style is too rough
  and messy ... cleaner, more refined, gentle, a lot more premium"; "It's too busy". Playbook: "Every shot reads instantly
  with the sound off: literal beats clever. Recognisable things". DIRECTION 6: "never beige, muddy tan". Measured: cold at
  phone size it read "a pile ... of pallets? bricks?". These are the busiest frames of the film: 41-62 % of the frame
  moves per 0.5 s over 19.0-21.5 as the camera pulls back across a frame-filling texture of chip-slotted sticks. At 20.40
  the heap's largest fill is L* 56 C* 24 h 60 (23 %), plus L* 48 C* 24 (6 %): the crest chips `#966E59` (L* ~50, C* ~17)
  and the flank's lavender-multiplied boards, a muddy brown-tan. Sound on, the voice says "AI data centers" (19.96) over
  this heap, and the data center only enters at 21.0, so the heap has to read as memory on its own. **Fix:**
  `SQD_peak.tsx` `lodAt` / `PEAK_D`: chips and pins only on the hand-placed crest (`s.crest`: the bed's two sticks and the
  six of the second layer), in THE stick's own chip and pin values (one step under its L* 13 / 92, not `#966E59`); every
  row stick lod 2 (a flat gold board with its lit top) from frame 1164 on. Then check at phone size that it reads "a
  stick on a pile of sticks".
- **R3-2. MAJOR (home). SQB 6.45-10.30, the left window strip (x 0-190) against the card.** Owner: "too many moving parts
  and I'm not sure what to keep my attention on"; "some supporting environment can be drawn a bit more subtle". Measured:
  the top-3 % salience, card / strip / phone, is 5 / 49 / 32 % at 6.6, 14 / 44 / 18 at 7.5, 31 / 35 / 16 at 8.5, 36 /
  34 / 15 at 9.0 and 36 / 36 / 14 at 10.0. The strip's biggest blob is the mullion column (x 28-84, y 826-1060: 18 % at
  9.0). Only after the doodles land (11.0-14.0) does the card hold 75-78 %. So while the voice says "Laptops get better for
  the same money", the eye is split with the night strip at the frame's edge. **Fix:** `home_set.tsx` `windowCalm` (the
  6.35-6.95 settle, so SQA stays the pilot): the mullion and its latch, and the strip's houses, caps and lit windows, take
  one more `Haze` step toward the pane's dusk (no near-black latch; caps below the card's paper value). Target: the strip
  under ~10 % and the line leading from 7.08.
- **R3-3. MAJOR (home). SQB 10.90-13.85, the card's right end: the story's turn ("But this past year, in the US,").**
  Owner: "There is no story ... just a bunch of shots put together"; G5: "way too empty". Playbook: "Every shot reads
  instantly with the sound off". Measured: with the sound on and off, 11.48-13.56 has no picture. The only event is the
  end dot's x1.5 pulse at 11.80 (r 8.6 -> 12.8 px, ~9 pt on a phone), on a framing unchanged since 6.45; 2.4-4.6 % of the
  frame moves (the float and the snow). It was my first swipe point (~12-13 s); the integrator's density reads SQB static
  58 %, longest gap 3.3 s. **Fix:** `SQB_chart.tsx` `OldDealChart` at `CHART_BEATS.pulse` (11.80): make "this past year"
  one visible event on the chart. A soft hero-tint band over the plot's last year (2025-26, the plot's full height, tier-B
  value, no outline) pops in, the end dot sits in it, and it stays as the stage where the line hooks up at 13.85.
- **R3-4. MINOR (window). SQE 22.68-24.95, the street band (gate, loading, barrier).** Owner: "Across the story we should
  have the main arc going where the attention should be". DIRECTION 8: "Every hold is locked or a slow float, never a zoom;
  a zoom is a visible story move or a carrier". Measured: "They pay more, so they get first dibs" plays at H2's rest size:
  DC truck ~200 px wide, workers 45-50 px tall, crates ~25 px (~9 pt on a phone). The read push (x1.35) only comes after
  it, at 24.90-25.70: a second camera move inside SQE's hold, 2 s after J4's entry. Cold watch: "who pays, which van goes
  first?". **Fix:** `h2_window.tsx` `entryCam`: land on `pushCam`'s held x1.35 framing about (680, 1120) at 22.95 (J4's one
  move goes into the pushed frame) and remove the separate 24.90-25.70 push. The release at 36.36-36.98 stays.
- **R3-5. MAJOR (thread). SQE 31.32-33.40, the queue's head: the BETTER van.** Playbook: "Every shot reads instantly with
  the sound off: literal beats clever. Recognisable things". Owner: "There is no story". Measured: even in the pushed frame
  the van's "BETTER" label is ~60 x 18 px (~6.5 pt on a phone), drawn at `size` max(16, h*0.17), and the decal laptop is
  ~60 x 45 px. At phone size it is one more white laptop van, so "Normally you'd wait for the better one." has no readable
  picture (cold watch: "nothing new on screen", second swipe point ~32 s). At 32.5 the lane holds 31 % of the top-3 %
  salience: the eye goes there and finds nothing to read. **Fix:** `kit/Fleet.tsx` `FleetVan`, variant 'better': the
  "BETTER" label on a light panel across the box at ~2.5x (h*0.17 -> ~h*0.4, cap height >= 40 px at H2 rest), over the
  NEW laptop decal (lit peach screen, 0.6 of the box): the same BETTER laptop the chart showed at 10.82.
- **R3-6. MAJOR (thread). SQE 24.44-25.04 (and 35.95-36.25): the tag at the left edge against the DC truck going first.**
  Owner: "too many moving parts and I'm not sure what to keep my attention on"; "the main arc going where the attention
  should be". CRAFT §b: a second story action "never at the same moment". Measured: the tag's sway window (`TAG_FULL`
  24.44-25.04, a 2-step switch to full hero red) opens while the DC truck drives up through the lifted barrier
  (24.30-24.95), which is the picture of "first dibs". Top-3 % salience: at 24.3 gate and trucks 42 %, tag 15 %; at 24.6
  tag 71 %, gate and trucks 12 %; at 24.9 tag 71 %. The jolt does the same at 35.95: the tag holds 69 % at 36.1 while the
  overtaking trucks finish at 36.25. Cold watch: at 24.6 I saw the tag flash, not the truck. **Fix:** `thread_plane.tsx`
  `TAG_FULL`: open the sway window when the drive ends (24.95-25.25, in the pause before "Which means") and the jolt's when
  the overtake ends (36.25). Each cause beat then plays alone and the tag reacts after it (CRAFT §a: every cause beat ends
  with it reacting).
- **R3-7. MINOR (thread). SQF 40.30-40.70, the payoff: Pip at the phone's upper right.** Owner: "the supporting details /
  supporting animation that adds subtle loveliness ... should be a bit more subtle but yet alive". CRAFT §b, the mascot:
  "only blinks and ear moves ... while the subject moves, clear of the subject"; tier B: "no pops". Measured: on "tag",
  Pip swaps its side cling (~110 x 170 px) for a frontal arms-up shrug (~160 x 170 px, ~1.3 % of the frame) over the
  phone's right edge for 0.4 s, overlapping the plane's travel back (from 40.55). Cold watch: "the toy's pop at the same
  moment pulls my eye off the tag". **Fix:** `thread_plane.tsx` Pip (flow_v2 §1 "shrug 40.30"): play the shrug in the side
  pose, with its own ears and shoulders (no frontal pose swap, never over the screen), after "tag" ends (40.42-40.55), and
  finish it before the plane travels.

Status: DONE (2026-10-28). Overlap with R1/R2, read only after my findings were formed: R3-1 matches R1-3 and R2-1 (the
same heap; R2's fix is the same crest-only chip pass), and R3-2 matches R1-2 (the same strip and mullion). R3-3 to R3-7
are new angles: the turn's picture, the read push, the BETTER label, the tag's timing and Pip's pop.

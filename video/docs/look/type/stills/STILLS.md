# The type stills (job 2 of the type iteration, 2026-10-30)

The guide's still list (`docs/look/TYPE_GUIDE.md` §h, DRAFT), rendered at 1080 x 1920 from the pages in
`scripts/type/stills/` (`bash scripts/type/stills/render_all.sh`, from `video/`). Each still has `NN_<recipe>.png` and
`NN_<recipe>_ui.jpg` (phone size, with a generic app UI over it). All of them on one page at the 0.25 glance scale:
`contact_sheet.jpg`. Video 4's real words at their real times (`public/v4/voice_words.json`); the backgrounds are
stand-ins (the latest look still, at dusk and re-graded to video 4's snowy night), so each still shows placement, never
video 4's art. The type: **the hand** = Gaegu (300 on night skies, 400 for dark ink on light skies), **the brush** = Nanum
Brush Script, warm white #FFF0DE or umber #2B1B0A, the one accent amber #FFB868 (night) or burnt #8E3A12 (light).

| # | recipe | the words (time in video 4) | what to look at |
|---|---|---|---|
| 01 | BEFORE (our captions now) | S7 at 24.10 s (the page holds 24.04-25.54 s): "But Helsinki / WANTS that heat.", Patrick Hand 98 px, the peach box on WANTS | how heavy and boxed it is, and the fixed centred band; the baseline for every other still |
| 02 | R4 the landing word (the brush) | S7 at 24.70 s: "But Helsinki" (23.42) / **"WANTS"** (24.00, the brush 184 px, burnt) / "that heat." (24.58), stepped down-right | one painted word carrying the turn; set it beside 01 and 07 |
| 03 | the hand, three ways | S2 at 4.50 s: "AI actually runs" at one x-height (~46 px): Gaegu Light 116 px / Mali Light 90 px / Zen Kurenaido 106 px | which hand feels like ours (Gaegu warmer and hand-made, Mali cleaner); Zen Kurenaido reads "Al", so it is out |
| 04 | R1 the everyday caption | S2 at 6.00 s: "on giant / computers," (5.28-6.47 s), Gaegu Light 116 px, two staggered lines on seat L | light and airy, yet read at a glance on the phone: the look of ~70 % of the film |
| 05 | R2 the hook | S1 at 0.70 s: "Did you know" (on screen from frame 0) / "Helsinki" (pops 0.60 s), Gaegu Light 136 px | big enough to stop a thumb, still calm; frame 0 shows line 1 alone in the same place |
| 06 | R3 the big number | S1 at 3.60 s: **"70,000"** (2.30 s, the brush 300 px, amber) over "homes?" (3.38 s) | the number reads first and feels part of the lit city; the brush comma's long tail is the font's own |
| 07 | R5 the tint | S7 at 24.70 s: the same rows as 02, but "WANTS" in the hand (116 px), tinted burnt | 02 or 07: the painted landing word or the quiet tint? |
| 08 | R6 the lettered phrase | S5 at 18.70 s: "That's a lot" (17.72 s, 150 px) / "of" (18.42) **"tea."** (18.58, 190 px) | ref 1's manner: words lettered into the open sky, the big last word landing with the mug |
| 09 | R7 the word in the world | S8 at 27.70 s: caption "starting / next year." (27.03-28.30 s, seat C); a paper tag over the doorway with **"2027"** in the brush (148 px, umber), swung on at "next" (27.40) | the year belongs to the place; the caption and the tag share the frame without repeating a word |
| 10 | R9 the payoff | S12 at 40.00 s: "So your chatbot" (38.43 s) / "could soon" (39.37) **"heat"** (39.93, the brush 184 px, amber, at its swell's peak 1.04) | the core line landing on its one warm word, at the end of the sentence |
| 11 | R10 the cover | the cover: "Your chatbot / could **heat** / an apartment / in Helsinki." (the hand 112 px, "heat" the brush 250 px, amber), ragged and stepped, on the night frame shifted down 180 px | one series look on the grid; it must read at 360 px wide (the contact sheet's tile is smaller still) |
| 12 | R10 in the posters' caps | the same cover in Jost Light 96 px, all caps, +12 % tracking, centred, "HEAT" in amber | 11 or 12: the painted hand or the posters' geometric caps? |
| 13 | the seats walking (R1) | S2 at 4.50 / 6.00 / 7.00 / 8.00 s, four frames at half size: "AI actually runs" (seat C) · "on giant / computers," (L) · "in buildings / called" (R) · "data centers." (C) | alive but steady: each move is 80-160 px, so the eye never hunts |
| 14 | R4's brush write-on, mid-stroke (added) | S7 at 24.10 s: "But Helsinki" / "WANTS" 7.6 of its 12 frames in (70 % painted: "WAN" and the T's first stroke) | open question 3: does a word being painted on look "painted", or like the clipped reveal you ruled out? (an approximation: left to right behind a dry brush edge; the real one follows each letter's strokes) |

**Changed from the guide after the first render** (looked at on the phone preview and under the UI; the guide is
updated, see its "Changes from the stills"): the third row of the R4 lockup and R9's "heat" sat on the roofline (y
~590-600), so the lockup rows moved to 362 / 484 / 578 with the brush at 184 px, and R9 became two rows (390 / 545); the
big number grew to 300 px (the brush's figures are 0.45 em: 260 px gave 118-px figures, not 165) and lifted to 480 /
578; "AI actually runs" (789 px) only fits seat C, so the walk is C, L, R, C and still 04 sits on seat L; R6 got a
real word space before "tea."; the covers shrank a step (hand 112, brush 250, caps 96) to stay in the sky above the
roofs; the "2027" tag keeps ~280 x 170 px, so its year is the brush at 148 px (figures ~66 px tall, read at phone size).
Still 14 was added for open question 3. Contrast, measured on each still's own pixels within 20 px of the glyphs (5th
percentile): the hand 7.3-10.2:1, the brush 4.6-5.4:1, the tag 11:1; every word's ink inside the type frame (y 290-1250,
x 96-944) and clear of the UI (`python3 scripts/type/check_stills.py` after a render).

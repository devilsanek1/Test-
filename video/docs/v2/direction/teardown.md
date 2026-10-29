# v2 restart: teardown of the films the owner loves (and of the cut he rejected)

Written 2026-10-27 for the fresh v2 production (no sketch stage, straight to the finished film). It shows, shot by shot
and with timestamps, WHAT makes v1 and the two references work, so a new team can hit that level, and what most likely
made the owner say "No I don't like it" to the first v2 cut. The rules live in `house_digest.md` (same folder) and
`docs/OWNER_PLAYBOOK.md`; this file is the evidence. Take patterns, never assets: every set, figure and prop, and the Pip
drawing, are made new for v2 (playbook: "Don't rely on reusable assets"). The repo is public, so frames stay out of git;
the contact sheets are listed at the end. **Method:** ffmpeg frames at 1 s / 0.5 s steps (0.1-0.35 s in the openings and
around every cut), viewed as 216 px wide tiles (the size of a phone feed tile); motion measured on 90x160 grey frames at
30 fps (scratch `tools/motion.py`; the numbers are in §4).

## 0. In one paragraph
v1 and both references are ONE sunny world seen from the street, and it changes because of the words. Small people
with their backs to us watch something happen to buildings, signs and crowds. An orange sun hangs in every sky and
doubles as the chart. A small animal sits in every shot and hops across every cut. The camera never stops travelling.
The rejected v2 cut was rooms, papers and big front-facing characters, in three different palettes, mostly locked off.

## 1. Shot by shot
### 1a. v1 "php2shell" (55.4 s, 12 scenes; per-scene notes in `docs/v1/scenes/S01-S12.md`)
| S | time / line | shown (shot) | camera | in -> out | what moves | Pip | full because |
|---|---|---|---|---|---|---|---|
| 01 | 0.00-4.72 "Governments ... on purpose," | Government Plaza, eye-level wide: 3 civic fronts, the sun as a POWER BUTTON in the gap | slow push from rest; dives into govB's door lock at 4.35-4.70 | loop-in from S12 -> match cut on the lock | screens go CRT-dark one by one, a ripple ring out of the sun, the skyline goes dark, shutters slam ON "shut"/"down", "back soon" signs, pigeons, the crowd turns, phones go up (§3) | on a bollard: flinch 0.12, hop 2.9 | 3 rows of back-view people; a hood + a cap cut by the bottom; a branch top right; a skyline |
| 02 | 4.72-8.39 "because of this bug ... without a password." | the PHP blueprint on a wall, tight; the lock in a loupe | one log-zoom into the loupe from the cut | match-in -> hard cut | a hand reaches for the lock, the key is crossed out, the site icon is taken | on the rod, top right | 3 back-view onlookers at the bottom, the sun above |
| 03 | 8.39-14.17 "It's in PHP ... seven out of ten websites run on it." | Blueprint Street, one-point perspective | 4 % breath, then a lock | starts as bare plan lines; houses RISE and colour floods (8.45-9.45) -> sun hop | signs "I ♥ PHP", "PHP - the code most websites are built with"; a crowd gathers; windows count; the SUN becomes a 7/10 PIE (12.0-13.4) | on the manhole stamp | 2 rows of houses to the vanishing point, a crowd, wires |
| 04 | 14.17-16.59 "...for like fourteen years" | a corner house, 3/4 low | a creep, then a dive into its lock (16.2-16.6) | the sun hops in -> match cut on the lock | label "in the code since at least 2012", the bug on the lock, the pigeons take off | by the door | side rows, a far sun |
| 05 | 16.59-19.77 "before researchers using AI figured out how bad it was." | the blueprint on a civic front; the film's one low angle | landing, then an exit truck | match-in -> CUT ON ACTION | a dotted AI hand with sparkles; label "found with AI help, reported privately in August" | on the steps | a hatted audience from behind fills the bottom third |
| 06 | 19.77-21.99 "They gave the PHP people a heads-up," | Makers' Lane at GOLDEN HOUR, string lights | trucks right, then a 2 % breath | the messenger walks in mid-stride -> the notice flies at the lens | the envelope; the workshop's "still fixing..." sign | in the street | long shadows, a lane of shops, a cart |
| 07 | 21.99-24.10 "but word got out before the fix was ready," | the town noticeboard | a short push | fill-first pen reveal (22.0-22.3) -> match on the wires + sun + pigeons | COPIES multiply on the board and on the wires; label "word leaked Oct 20 · fix out Oct 21"; phones up | on the board's top | readers with their backs to us at both sides |
| 08 | 24.10-34.48 "and hackers were ALREADY ... millions within a day." | PEAK 2: over a wall, a whole skyline; the Cloudflare glass dome | a CRANE over the wall (24.1-25.5), then a dolly push | match-in -> the sun's set point | the sun rises and swells to fill the sky (24.5-27); the dome draws over a district; the board (with its source line) gets tally marks (29-33); the sun becomes a CLOCK at "forty-five minutes" (32); "millions" = a flood of figures under the dome (33-34); dusk | on the wall | two back-view heads on the wall; city to the horizon |
| 09 | 34.48-39.63 "But even with the fix out ... every single server." | Stoop Street, night -> DAWN; then a hillside of terraces | then a PULL-BACK + rise (37.2-38.3), a held vista | the set point = the street's vanishing point -> a tram wipes the frame (39.55) | the dawn sun rises in the vanishing point (35.1); a worker brings the fix to one door; ticks run across hundreds of doors (37.9-39.4) | hops to a ledge; rides the tram roof | the hillside keeps going into haze; tiny figures with long shadows |
| 10 | 39.63-45.62 "Plus something like half ... anymore." | Old Quarter frontal row | a 5 % push to "of" | Pip leaps off the tram; houses draw in one by one (39.85-40.45) -> hard cut | the sun fills HALF (41); a cobwebbed old shop; the maker's cart rolls; label "Rough estimate from W3Techs data"; Pip's "hey!" | on a bollard; gets skipped | railing + heads in the foreground |
| 11 | 45.62-52.16 "Even the FBI said ... answer to everything." | a domed civic building, low | a 4 % push, then locked | hard cut in and out | a window "updating... 8 %"; plaque "FBI · NSA · UK NCSC · CERT-EU"; the sun turns into the power button (49); the shutter drops; a note "Turn it off ~~and on again~~" (51) | on a ledge | two back-view heads, a far skyline |
| 12 | 52.16-55.36 "And some of those governments did it before there was even a fix." | S01's plaza, same framing | the S01 pull-back | hard cut -> LOOP (0 px seam) | the sun shows REWIND (54); everything rolls back to frame 0 | on the bollard | as S01 |

Captions: 1-2 hand-lettered lines (~26 characters) on the calm sky band at the top, dark ink, one key word in a peach box
as it's spoken. v1's page roll at 2.2 s clips letters: that's the flaw the owner flagged, so captions now pop in place.

### 1b. Reference 1 (France, 31.5 s, the style reference: a white card on teal; the card is retired, the drawing is not)
| shot | time / line | shown | camera | in -> out | what moves | the cat |
|---|---|---|---|---|---|---|
| R1 | 0.0-7.7 "France expected 200,000 marchers. Half a million came. And they didn't all want the same thing. France has had bigger marches." | a one-point street of tall facades, sun at the top | locked | bare lines -> colour (§3) -> the card clears to white | the outline grid fills, then OVERFLOWS (2.0); placards pop up, each a different colour, one orange (3.5-5.5); outline ghosts of bigger marches (6.5-7.5) | orange, on a balcony at the right |
| R2 | 8.0-13.7 "But normally they march against one law, and the government drops it or passes it." | a flat wall: a noticeboard and a glass door | locked | starts nearly empty, builds (8.1-9.6) -> slides left | one paper on the board; outline heads gather (backs); the paper falls (drops) / gets the orange mark (passes) | hops from the ground to the board's top (8.7) |
| R3 | 14.0-20.0 "This time it's prices, schools and lots more. Saying yes on schools alone would cost 10 billion euros," | an empty field -> a street | locked | buildings RISE, people appear (14.1-16.0) -> card flip | a booth slides into the foreground with an orange tick (16.5); a price tag counts up in euros on a building (17-19.5) | alone in the empty field first, then on the booth |
| R4 | 20.3-23.7 "and France now pays more to borrow than Greece." | two street machines on a wall | locked | flip -> flip | France on one screen; receipts print with % signs; "Greece" boxed | on the second machine |
| R5 | 24.0-31.5 "Saying no isn't easy with an election in April. So now it's hard to say yes and hard to say no." | a board with tick + cross panels | PUSH-IN to the board (27.5-28) | -> UN-BUILDS to frame 0's lines (31.4) = the loop | the crowd draws in from behind (25); posters (26-27); the tick fills (29), then the cross (30.2) | on top, tail hanging between the panels (28-31) |

Captions: under the picture, 1-2 lines, a peach box sweeping across the key word as it's spoken.

### 1c. Reference 2 (data-centre town, 44.1 s; the same house look, a corgi; ZERO hard cuts)
- 0-6 a dolly follows walkers (backs) and a corgi down a sidewalk toward a protest; 6-9 the town meeting from the back rows;
  9-11 a dissolve THROUGH the table model into an aerial of the data centre; 12-17 scale metaphors: a cable snakes across the
  floor, a GIANT plug over the town (14-15), a giant water urn (16-17); 18-25 residents at the mic from behind (an
  envelope = the bill, a chart sign, the water tower); 26-31 the companies' table, hard hats, the crowd cheers; 32-38 DUSK
  -> NIGHT, the string lights come on, hands up; 39-44 back on the opening sidewalk at dusk (bookend). The corgi is in
  every shot, usually bottom centre, looking where we should look.

## 2. The patterns (18), with timestamps (v1 unless marked)
1. **One world under one sky.** 12/12 scenes are outdoors or on an outdoor wall; R1-R5 and all of ref2 too. The sky is
   the top third, behind the captions. Light changes, palette never: day (0-19.8) -> golden hour (19.8-24) -> sunset
   (24-34.5) -> night -> dawn (34.5-36) -> day (39.6-55); ref2: afternoon -> dusk (32) -> night (36) -> dusk (39).
2. **The sun disc in every shot, and it WORKS:** a power button (0-4.7, 49-52), a pie for "seven out of ten" (12-13.4)
   and for "half" (41-45), a clock (32), REWIND (54), a hop that carries a cut (13.85-14.4), a sunrise swelling to fill
   the sky on "already" (24.5-27), its set point becoming a vanishing point (34.5). Ref1: half-coloured at frame 0, then
   in every card. Ref2: in every shot, the string lights strung across it.
3. **A small animal in every shot that watches, reacts and carries the cut.** Pip: flinches (0.12), hops on "websites"
   (2.9), crosses the S01->S02 match cut in one hop (4.7), sits on the manhole as the street draws itself (8.5-9), leaps
   off the tram roof (39.5-39.8), gets skipped ("hey!", 45). The cat: balcony (R1) -> a hop onto the board (8.7) -> alone
   in the empty field (14.0) -> the booth (17-20) -> the machine (20.5-23.7) -> its tail between tick and cross (28-31).
   The corgi: bottom centre, looking up. Always 5-10 % of the frame height, never the subject.
4. **People small, simple, with their backs to us = us.** The hood + cap (S01/S12), the hatted audience (16.6-19.7), two
   heads on the wall (24-34), heads at 46-52; ref1's outline heads (9-13, 25-31); ref2 nearly every shot. They look at
   the thing, raise phones (1.4, 23.5; ref1 26-29) and set the scale. There are no faces to read.
5. **Each line is an EVENT in the world, on its word:** "shut down" -> shutters slam (1.6-2.0); "take over" -> a hand at
   the lock, the key crossed out (6-8); "word got out" -> copies spread over the board and the wires (22.3-24); "millions" ->
   a flood (33-34); "every single server" -> a hillside of ticks (37.9-39.4); ref1 "drops it or passes it" -> the paper
   falls or is marked (11-13).
6. **The expected thing, then reality overtaking it:** ref1's neat outline grid, then the overflow (0.6-3.0), the ghosts
   of bigger marches (6.5-7.5), the tick, then the cross (29-30.2); v1's screens going off one by one -> the skyline dark ->
   the shutters (0-2.3); "fix out" (35) -> but EVERY server (37-39).
7. **Signage explains, inside the world, in 2-8 words, with the source on the sign:** "back soon" (3.9), "PHP - the code
   most websites are built with" (9.7), "in the code since at least 2012" (15), "found with AI help · reported privately
   in August" (19), "still fixing..." (20, 35), "word leaked Oct 20 · fix out Oct 21" (22.5), the Cloudflare board with
   its source line (28-34), "Rough estimate from W3Techs data" (42), the FBI plaque (47), the struck note (51). There are
   no headers and no paragraphs.
8. **Data grows out of the set:** the sun as pie and clock; lit windows as the count (11-13); tally marks (29-33); ticks
   across a hillside (38-39); ref1's euro counter on a building (17-19) and its receipts (21-23).
9. **Scenes build themselves to the words:** bare plan lines -> rising houses + colour (8.45-9.45), the pen reveal
   (22.0-22.3), the dome drawn over a district (27), house by house (39.85-40.45); every ref1 card starts sparse and fills
   (0-0.5, 8.1-9.6, 14.0-16.0), and the film un-builds to frame 0 (31.4).
10. **The camera always travels, one move per shot, each a different kind:** push (S01), loupe zoom (S02), breath (S03),
    dive (S04), truck (S06), crane (S08), pull-back + rise (S09); ref2's walking dolly (0-6). The locked holds are
    short and full of inner events: v1 has 5 still runs of 0.5 s or more, 3.1 s in all.
11. **Cuts carry motion, so the film is one journey:** 8 of v1's 11 scene changes are matched or carried: dives into a
    lock (4.72, 16.59), the sun hop (14.17), a cut on action (19.77), the paper at the lens (21.99), wires + sun +
    pigeons (24.10), set point = vanishing point (34.48), the tram wipe (39.63). Plain hard cuts: only 8.39, 45.62, 52.16.
    Ref2 never cuts. Ref1 changes cards only 4 times, and the cat is already waiting in each.
12. **Two scale peaks, earned and held:** the crane into a skyline under a swelling sun (24.1-27); the pull-back to a
    hillside of houses (37.2-39); ref2's giant plug and urn (14-17). Each lands on a held wide with tiny foreground figures.
13. **Full frames come from LAYERS:** heads cut by the bottom edge, a subject in the middle band, a living background
    (skyline, side streets), edge furniture (the branch 0-4.7 / 52-55, wires 20-35, string lights 19.9-22, lamps, flags).
    The calm field is the sky behind the caption, never a slab in the middle of the frame.
14. **Ambient life never stops:** pigeons (S01, S04, S07), walkers, a cart (S10), a tram (39.5), phones going up, birds
    over the skyline; ref2's walkers, a child on shoulders, lights switching on (36).
15. **Story time = time of day:** v1 runs through one day (1. above), ref2 into the night: the film feels like a journey.
16. **The end is the start:** S12 rewinds to S01's frame 0 (0 px seam); ref1 un-builds to its frame-0 lines; ref2 ends
    on its opening sidewalk.
17. **One text layer:** short phrase pages, one boxed payoff word each ("shut down", "purpose", "fourteen years",
    "already", "millions", "half", "FBI", "turn it off", "before"); the rest is in-world signage.
18. **Rhythm:** a new scene every 2.1-6.5 s (v1 median ~4.5 s; S08 holds 10.4 s by escalating inside: crane -> dome ->
    tally -> clock -> flood); ref1 every 3.4-6.4 s; v1 has 170 SFX cues in 55 s (~3/s, the first at 0.0 s), each on a visual hit.

## 3. The openings, frame 0 to 3 s
**v1** (`v1_open_*`): frame 0 is a finished, coloured plaza mid-event. (The "frame 0 = bare lines" rule came later, from
v3.) The sun-button has just been pressed: ink ticks at its rim, and govB's screen is collapsing to a CRT line. The
caption "Governments all over" is already up and the camera starts a slow push. 0.12 Pip flinches; 0.19 the voice
starts; 0.1-0.9 three pigeons fly in under the window band and land on the lamp; 0.2-1.3 a cream ripple ring sweeps
from the sun over the whole plaza; 0.34-0.50 the front walkers stop and turn to the buildings; 0.63 / 0.885 govA's
and govC's screens go off. 1.15-1.46 six skyline silhouettes go dark, 0.06 s apart; 1.40 two onlookers raise phones;
1.52-1.75 the sun's glyph glints. 1.55-1.98 on "shut" / "down", two shutters slam and the fronts step darker, with "shut
down" boxed. 2.24 on "bunch", a third shutter drops halfway; 2.9-3.0 Pip hops onto the bollard on "websites". That's
about 20 events in 3 s, one every ~0.15 s (motion 3.1 / 2.2 / 1.9 per second).
**Reference 1** (`ref1_open_*`): frame 0 is bare ink: a one-point street, and the "expected" 200,000 drawn as a neat grid
of EMPTY outline figures. The sun is half-coloured, the cat already orange on a balcony, and the caption "France
expected 200,000 marchers." complete. 0.1-0.5 colour floods in patches (sky, facades, shop fronts, trees), never as a
fade; 0.5-0.6 the peach box sweeps across "200,000"; 0.6-1.9 the grid fills with people, back rows first (the
expectation made physical, orderly). 2.0 the caption becomes "Half a million came." and the crowd OVERFLOWS the grid:
past its lines, into the side streets, out of the bottom of the frame toward us. 2.1-3.0 it keeps thickening. The
camera is locked: all the motion is the build.
**Reference 2** (`ref2_open_00`): frame 0 is full colour. A man in headphones walks away from us down a sidewalk with a
corgi, families ahead, a girl on her father's shoulders. The camera follows at walking pace (0-2.6), then dissolves on
down the street to the protest signs (2.8). Calm, but never still: the trot is the hook.
**The rejected v2** (`v2rej_open_00`): frame 0 is a beige pencil sketch of a desk, under THREE text tiers already in
colour (a caps headline with an orange FOR LIFE box, a source line, the caption). 0.2 the whole frame is coloured at
once. 0.4-1.6 a big blue arm drops a "GOOGLE" badge into a box; 2.0-3.0 it comes back with a highlighter and marks a
clause. The cat sits still; the camera is locked. It's one action at a time, on a prop, in a room.
**What the three that work share:** the voice by 0.2 s; the world already busy at frame 0; the claim escalating in
steps 0.1-0.3 s apart; one boxed payoff word by ~0.6-1.7 s; the animal on screen from frame 0.

## 4. The rejected v2 cut beside v1 (`side_by_side_v1_vs_v2rejected.jpg`, both at 216 px)
| measure (30 fps, 90x160 grey) | v1 | ref1* | ref2 | v2 rejected | v3 G5 ("way too empty") |
|---|---|---|---|---|---|
| median frame-to-frame change | 1.06 | 0.67 | 0.97 | **0.40** | 0.18 |
| still frames (change < 0.35) | 16 % | 25 % | 28 % | **43 %** | 70 % |
| still runs of 0.5 s or more, total | 3.1 s / 55 s | 1.3 s / 32 s | 6.3 s / 44 s | 3.0 s / 39 s (+ near-still 9-13, 21-33) | 24.8 s / 41 s |
| scene changes carried (matched / on action / wipe) | 8 of 11 | 4 card moves | no cuts | **0 of 13** | (not measured) |
| mean saturation | 0.23 | 0.14 | 0.22 | **0.29** | 0.28 |
| flat 4x4 blocks (empty-field proxy) | 51 % | 60 % | 49 % | 43 % | 74 % |
*ref1's static white card margin lowers its motion numbers.

What most likely made the owner say no (in order of weight):
1. **Not our world.** 100 % interiors: her flat (0-8, 13-20, 34-39), an office at night (9-13), a desk from above
   (21-33). There's no sky, no sun disc, no street and no city except through windows. The one exterior, the Pentagon
   (21.3-23.8), is a flat lilac diagram. v1 is 12/12 outdoors, under one sky.
2. **Big people with faces.** Her figure is big (up to the full frame height at 15-16), front-facing and worried at 17-20 and 35-39.
   The two staff at 9-13 are posed busts at a desk. It's the clean "corporate flat" stock-vector look (the palette refs,
   which are COLOUR refs, taken as a character style). The owner has since said "don't use big models of people"
   (2026-10-27). v1 and the refs have small, many people, from behind.
3. **Three palettes in 39 s:** a terracotta room, a periwinkle office, a violet desk, plus the lilac Pentagon, at
   saturation 0.29 vs v1's 0.23. It reads as three different films; v1 keeps one palette and changes only the light.
4. **Little motion, a locked camera.** Median change is 0.40 vs 1.06, and 43 % of frames are still vs 16 %. The office
   is frozen for 9-13 s, and the top-down desk holds 12 s (21-33) where only a hand writes. There's no journey, no crane
   and no pull-back, and the scale beat is a static aerial.
5. **Props instead of events.** An arm drops a badge, a highlighter marks a clause, a scroll of years unrolls (5-8),
   speech bubbles of squiggles appear (17-20), a "FACTS" bubble (37-38). Nobody watches anything happen, and nothing
   changes in a world.
6. **Text as slides.** Frame 0 has four tiers (headline, source, caption, the contract). A source header sits on every
   shot. The DEAL paper carries legal paragraphs (24-28) and "GOOGLE SAYS" is a bullet list (29-33), unreadable at phone
   size. v1 has one caption layer plus short signs.
7. **No living character.** There's no Pip (the house rule is Pip in every shot). A brown cat sits in her room as
   furniture: no reactions, no hops across cuts. The figures hold poses with blink-level life.
8. **Hard cuts between unrelated sets** (6.1, 8.4, 13.3, 15.0, 16.6, 20.5, 21.3, 23.8, 26.0, 28.2, 33.1, 35.3, 38.8),
   with nothing carried across.
9. **The energy dies after 1 s.** Motion runs 3.6 in the first second, then ~0.2-2.4 per second for 20 s (the 2s are the cuts),
   with one jump at the Pentagon (21-23). v1 spikes at every scene: 14.0 at the 4.7 dive, 10.9 at 16.4, 7.3 at 24, 11.7 at 37.
**Not the problem:** the fullness (43 % flat blocks vs v1's 51 %: the rooms were cluttered), the script, the voice and
the facts. It was a blocking render (540x960, debug labels), but the owner judged the DIRECTION. v3's "way too empty" cut
fails differently (74 % flat, 70 % still: one object on a big wall). Adding props to v2's rooms would NOT fix v2.

## 5. DO / DON'T for the new v2 film (voice take 2, 39.08 s, 10 lines; fairness rules: `beat_map.md` §4)
**DO**
1. **One world, outdoors-first, under one sky with the sun disc, in ONE palette.** Let story time move the light (for
   example dusk -> night -> dawn) instead of the palette. Show interiors only as a window onto that world (a cozy nook
   looking out), never as a sealed room.
2. **Keep her small:** a small figure in her own streets, mostly from behind or at a distance, with her name caption;
   the world around her carries the feeling. Crowds are the PUBLIC (readers, passers-by, commuters), never a crowd of
   "Google staff" (V11).
3. **Pip, drawn new for v2, in every shot:** watching her, pointing the eye, one reaction per shot on a stressed word,
   and hopping across every cut and the loop.
4. **Put the sun to work as the film's own infographic** (a dial, a clock, a calendar, a rewind): our motif, never a
   fact claim.
5. **Make each line an event in the world, on its word:** the expected thing, then reality overtaking it by ~2 s (the
   hook lands "for life" at 4.84-5.6 s). Show the real mechanism, never a gimmick prop.
6. **Text = captions + 2-8-word signs in the world:** frame 0 carries the payoff words + its source; every other required
   source line (A2/A3) sits as small print ON a sign, poster, plaque or screen in the world, like v1's Cloudflare board.
   The long oversight clause (V9/A4) goes on a big in-world board readable at phone size, not on a paper on a desk.
7. **A travelling camera, a different move per shot,** and ONE big move (the pull-back crane) on the scale beat (the
   deal, 20.5-25.2 s, or the turn: the treatment decides). Cozy holds float, never zoom.
8. **Carry every cut:** a sun or shape match, a dive, a cut on action, a foreground wipe, Pip's hop; at most 2-3 plain
   hard cuts.
9. **0-3 s:** frame 0 is the scene being drawn (lines, then colour within 0.3 s), with "SHE SAYS: NO CRITICIZING GOOGLE.
   FOR LIFE." + "Source: BBC News, 21 Oct 2026"; the voice at 0.12 s; ~15-20 events in 3 s; our chime in the first
   second; one boxed word.
10. **Fill every frame by layers:** back-view heads cut by the bottom edge, a subject in the middle band, a living
    background, edge furniture, sky behind the captions; ambient life always on.
11. **A new scene every 2-6 s (about 10-12 for 39 s),** escalating inside the longer beats; end on the frame-0 world so
    it loops.
12. **Test every frame at 216 px beside v1:** does it read as the same channel?

**DON'T**
1. No big character models, close-up faces or front-facing posed figures as the shot; no stock-vector "corporate flat"
   people (the palette refs are for COLOUR only).
2. No desks, papers or documents as the stage: no paragraphs, bullet lists, "Google says" cards on paper or highlighted
   clauses.
3. No stacked text tiers (headline + source + caption + document), and no source header bar on every shot.
4. No palette per scene, no violet or periwinkle world, no saturated slabs.
5. No sealed interiors: every shot has sky, or a window onto the world.
6. No locked shot over ~1 s without inner events, and no 10+ s on one composition.
7. No hard cut between unrelated sets without carried motion; no fades or dissolves (house rule, though ref2 dissolves).
8. No squiggle speech bubbles, word bubbles or gimmick props as the visual idea.
9. No idle mascot as furniture, and no animal tied to one location.
10. Nothing from the dropped pass: not its staging, sets, palette (Cream & Cobalt / Dusk), the cat at home, the scroll of
    years or the top-down desk.
11. No fairness breaks (`beat_map.md` §4): no war or gag imagery, no villain light, no likeness, no staff crowd.

## Contact sheets (scratch, not in git): /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/teardown/
- v1: `v1_every1s_00..03.jpg` (1 s steps), `v1_open_00..01.jpg` (0-3.1 s at 0.1 s), `v1_transitions_0..2.jpg` (12 cut windows)
- ref1: `ref1_every05s_00..03.jpg`, `ref1_open_00..01.jpg`, `ref1_transitions.jpg`; ref2: `ref2_every1s_00..02.jpg`, `ref2_open_00.jpg`
- rejected v2: `v2rej_every1s_00..02.jpg`, `v2rej_open_00.jpg`, `side_by_side_v1_vs_v2rejected.jpg` (16 matched times, both at 216 px)
- v3 G5 "too empty": `v3g5_every2s_00..01.jpg`; the look refs (enclosure, sketchbook, palette refs): `look_refs.jpg`
- numbers: `motion_stats.txt`; tools: `../tools/sheet.py`, `motion.py`, `pairs.py`

# Storyboard v3: php2shell, re-mapped onto the final script (word-anchored)

Machine-readable twin: `docs/storyboard_v3.json` (12 scenes, 244 beats, 28 caption pages, 15 on-screen labels incl. L5's continuation). Script: `docs/script/final_script.md` section 1 (178 words, the JSON's `wordsRef`). Voice: the RECORDED take `assets/vo_v3_final.wav`, timing `assets/timing_v3.json` (= `assets/timing.json`), **55.36 s**; the planning estimate `assets/timing_est_v3.json` (54.59 s, `"estimated": true`) is kept and the storyboard resolves cleanly against both. Resolved twin on the take: `docs/storyboard_v3_resolved.json`.

**Every time is a word anchor** (`scripts/anchor/README.md`): `{w, dt}` = word w's start + dt; `edge: 'e'` = the word's END + dt; `gap: g` = inside the pause after word w (its start + g x its length) + dt, so a cut stays in the pause on any take, or exactly on the word boundary where the take has no pause; `{w: 'START'}` = 0, `{w: 'END'}` = the timing's duration (the recorded lead-in 0.19 s and tail 0.125 s are NOT trimmed). Fixed-length moves (dives, exit trucks and tilts, the S08 crane, landings) are anchored on their cut with a dt, so their length never depends on the take. In this document an anchor is written `w14+0.35 'purpose'`, `cut(purpose)-0.33` (gap 0.5 unless noted) or `end(it)+0.05`, followed by **recorded | estimated** seconds.

**Validated (this round, actual tool output).** `python3 -I scripts/anchor/resolve.py` exits 0 on BOTH timings with 0 warnings (779 anchors; on the take the film is 0-55.36 s and the engine guard passes: scenes and captions end on the voice's duration; S12 emits `transitionOut {type: 'cut', loop: true, captionAt}`; `src/data/*.json` were NOT overwritten this round: they still carry the v2 13-scene timeline the engine renders today, and resolve.py's default run writes the v3 ones the moment the film switches). `python3 -I scripts/check-storyboard.py --sb <resolved> --timing <timing>`: recorded take 0 blockers / 0 majors / 0 minors, estimate 0 blockers / 0 majors / 0 minors (the lint now also checks labels, `holdAloneBefore`, word-boundary cuts and accepted short scenes). The director's extra lint `python3 -I scripts/check-storyboard-v3.py` (new: it resolves docs/storyboard_v3.json against both takes and checks beat order on both, life, label holds and placement through the camera, Pip's pose tops, sun and glow tops, on-screen camera speed and velocity steps outside the declared allow windows, the dive seams and the cut-on-action seams): 0 blockers / 0 majors / 0 minors. Measured: every scene has >= 5 events/s (S11 >= 6), the longest gap between beat onsets inside a scene (beat spans counted) is <= 0.43 s on both takes (per scene below), L8 holds alone 1.70 s on the take (1.97 s est) before the count, PEAK 3 holds still 0.83 s on the take (0.91 s est) before the tram. `scripts/anchor/selftest.py`: 48/50 as before this round (the two failures are the estimate-vs-current-timing checks, unrelated).

## This round: the critic findings applied

- **Start / end / loop**: the film runs START -> END (no trimmed lead-in or tail); `loop.captionAt` = END-0.10; S12 carries `transitionOut {type: 'cut', loop: true, captionAt}` and `scripts/anchor/engine_emit.py` now emits that type (no invented un-build); Film still has to honour it (engine request).
- **Beat-locked cuts**: every cut is a gap anchor with a `word` check; pre-cut moves (dives, the S05 truck, the S07 tilt) and post-cut moves (landings, the S06 truck, the S08 crane) have FIXED lengths anchored on their cut; `transitionIn.dur` is `auto` everywhere.
- **One owner per camera move**: no push-through or camera-continuous is emitted; the scene cameras carry every move (S02 / S04 / S05 / S08 / S09 are matchcuts). S10 -> S11 is a hard cut (no window match: the old site and govB are not the same window).
- **Speeds across cuts**: S05 -> S06 883 -> 845 px/s, S07 -> S08 789 -> 764 px/s (matched point); S04 -> S05 log-zoom 1.23 -> 1.05 /s at the cut (1.2x); S01 -> S02 6.8 -> 2.8 /s (2.4x, accepted). Every exception to the 18 px/frame strobe rule is listed in `cameraSpeedAllow`.
- **Peaks: fewer seconds, stronger dose**: S08 is peak only for the crane reveal and the 'millions' payoff (a baseline 15 % push carries the count between them); its sun is r260, half-set, with two stepped glow rings; Pip is 0.75 in the S08 vista and S09 Part B; S12 is listed as the closing-beat peak. Peak budget (take): S01 4.38 + S08 4.14 + S09B 1.90 + S12 3.20 (closing beat) = 13.62 s = 25 % (19 % without S12); (estimate): S01 3.88 + S08 3.95 + S09B 1.82 + S12 3.68 (closing beat) = 13.33 s = 24 % (18 % without S12).
- **Frame 0 = the press**: S12's rewind stops one step before it (the sun at the bottom of its SunPress, govB's screen a bright line); the power-off wave reads at phone size (govA on 'all', govC on 'over', the far civic skyline as whole shapes on 'Europe').
- **The rewind reads as a rewind**: a bold rewind glyph replaces the power glyph on 'before' and S01 plays backwards, stepped like a tape; no clock; Bit walking home is the film's last motion.
- **S08 decluttered**: one count device (hand-drawn tally gates + two stamps on the board; no ticker, no glass tallies, no footprint trace, no guard pop); L9c folded into L9a; the board narrowed to x 430-890 (screen <= 874).
- **Time of day**: the S08 dusk is a stepped uniform tween (no wipe edge through the captions); the dusk holds into S09 for >= 1.5 s; the crate is ALREADY there; dawn on 'with' (sun + peach band + rims); no day snap; the day relight comes with the S10 tram.
- **PEAK 3 is held**: hard cut on 'somebody' instead of an approach push; the pull-back starts from rest, anchored on the lock, lands on 'single'; EMPTY check-box tags (one ticked) wave over the settled hill; the tram wipe sits late in the pause; L12 dropped.
- **Story beats**: S03 bait on a calm frame (the city springs up in the ellipsis; Pip puffs up proudly on 'loves'; the sticker is a static pauser detail); S10's makers visibly hand out elephant-stamped support tags and skip the old site ('not officially' highlighted; re-paged); S11's note slaps on on 'tech' and is struck on 'everything', one shrug on 'answer', L14 taped inside the window.
- **Labels**: staggered after their focal events (L8 stays on 'Cloudflare' with the dome); L2 moved to world y 1100-1185; L13 / S08 board / S03 card inside the safe box; L5 continues into S05 (2.21 s in all on the take, 1.52 s on the estimate); L11 with the burst (1.63 s); all >= 1.5 s, L8 alone >= 1.5 s before the count (linted).
- **Ids, Bit, jokes**: `lock` (S01), `labelL5` / `envelope` (S05), `wireCopies` (S07 / S08), `progressBar` (S10); every scene's Bit has an on-screen size; Bit is a hidden-cut match object in S09; sign jokes J1-J6 unique, J3 / J4 paid off in S09 (J5); S12 `inheritsElements: S01` with end states.
- **Not taken** (see Declined): the 2.3x insert in S11 (no sky for the captions above ~1.7x), L12 on the reveal, stamp 2 on 'day' (it would hold 0.35 s), the clock in the rewind.

## Concept

**Unchanged world, new spine.** The web is a city and every building is a website (its main window is a browser window with chunky chrome). PHP is the elephant-stamped blueprint most of the city is built from; each PHP building has a sand elephant plaque. The bug is a flaw in that blueprint's lock (the bolt stops short), so every door built from the plan has it, and a tiny ink beetle called Bit lives in it. Pip, the periwinkle elephant, watches from ledges. The orange sun is the anchor and, sparingly, a character: a power button (pressed twice: frame 0 and the FBI line), a 7/10 pie, a wax seal, an hours clock, a 45-minute wedge, the one sunset and the one sunrise, a 1/2 pie, and a rewind button. No decorative pulses; on hard cuts it is simply already in its new slot; it hops only where it is the match object (S03 -> S04) or rides a wipe (S06 -> S07, S09 -> S10).

**The story in pictures.** A power-button sun has just been pressed and government websites switch themselves off, a bunch of them, on purpose (S01). Why: a drawing of the flawed lock shows a hand opening it with no key (S02). The flaw is in the PHP plan most of the city is built from (S03), it sat in plain sight for fourteen years (S04) until researchers with AI found it and saw how bad it was (S05). They sent the makers a heads-up (S06), but the leak hit the public board before the fix existed (S07), and hooded figures were already at the doors when Cloudflare's dome and its board started counting: tens of thousands in forty-five minutes, millions within a day (S08). The fix was out by the next morning, but somebody still has to install it, one door at a time, on a whole hillside of doors (S09), and about half the street runs plaques so old the makers' official tags skip them (S10). So the official advice: turn it off (S11). And some of those governments did it before there was even a fix: the plaza rewinds like a tape to the moment of the press (S12), and the loop plays it again.

**Scale, with restraint (BALANCE NOTE + style_bible_ref2 section 8).** Three Arcane-scale peaks, each short and stronger: the hook's Government Plaza (S01, mirrored by S12 as the closing beat), the rooftop vista with the film's biggest sun (S08: only the crane reveal and the 'millions' payoff), and the hillside of doors seen from the street (S09 Part B: the landing and a still hold). Two big camera moves only (the S08 crane and the S09 pull-back); S08's count runs under a baseline 15 % push. Everything else is the reference-2 baseline: eye level, full bleed, one gentle 2-6 % push per shot, then a locked camera so the builds read. Peak seconds: S01 4.38 + S08 4.14 + S09B 1.90 + S12 3.20 (closing beat) = 13.62 s = 25 % (19 % without S12) on the take. The hook cannot cut to baseline by 3 s: 'on purpose' lands at 3.6-4.7 s and final_script section 6 asks the plaza to carry it; S12 is the loop's bookend.

## What changed from the v1 storyboard

| v1 scene | v3 | why |
|---|---|---|
| S01 plaza | S01 (re-staged) + S12 | no count; only SOME buildings close, govC half ('a bunch of'); frame 0 is the moment of the press in COLOUR; the power-off wave reads at phone size; tags lettered |
| (new) | S02 takeover diagram | final_script section 6's new inset: the stakes shown on the plan, never on a real door; the hand wears the attackers' hooded cuff |
| S02 lock close-up + Blueprint Street | S03 (wide part only) | the lock close-up job moved to S02; no WordPress cue; the bait plays on a calm frame, Pip proud on his stamp |
| S03 two steps | cut | no 'two steps' lesson |
| S04 tower + 14 years | S04 (14 years only) | the 'hard part' tower, the look to camera and 'did' are gone; the ivy carries the seasons |
| S05 found it | S05 | ring on 'out'; the S02 hand redraws on 'bad'; 'August' in L6; Pip asleep on the banner's bottom rail |
| S06 quiet letter | S06 heads-up | the makers' heads pop UP on 'heads-up'; blind 'still fixing...' (J3) |
| S07 pinned for everyone | S07 word got out | lens wipe through the PRINTED sheet on 'but'; the clock says 'not ready yet'; dates in L7 |
| S08 dome + flood | S08 (re-staged) | hackers ALREADY at the doors; the dome covers ~1/5 of the city; one count device on a rooftop board; v1's push-and-pull shape; the r260 sunset |
| S09 night "?" | cut | no 'how many got in' line; the dusk carries into S09, the sunrise stays |
| S10 22 million doors | S09 every single server | the fix is already there at dawn; hard cut on 'somebody'; the hill holds still; empty check boxes over every door; no '22 million' |
| S12 one in three | S10 about half | 1/2 pie; ~half the plaques old; the makers hand out elephant-stamped support tags and skip the old ones; a host's own tag is a static detail |
| S11 shutters down | S11 FBI | hard cut in; advisory L14 taped in the window; press on 'turn', shutter on 'it off'; the note lands on 'tech', struck on 'everything' |
| S13 two options + un-build | cut | the loop job moves to S12's full-colour rewind (final_script section 6: S11 -> S01 hard cut) |

## Time-of-day arc

1. `day`: S01-S05 (S05 is high summer: the facade calendar tears to its summer page, 'August' is in L6).
2. `golden` (= the day sky + the golden relight, ENGINE.md 4): S06-S07, the heads-up and the leak.
3. S08 runs golden -> **dusk** on 'within a day': the film's one sunset in two steps at screen x 700, and the sky goes to sage as a STEPPED, UNIFORM flat tween (5 flat steps #A0C7B5 / #94BDAA / #88B3A0 / #7CA995 / #709F8B over 0.75 s): no wipe edge ever crosses the caption glyphs.
4. S09 opens on that dusk (sage sky, lamp glows on) and HOLDS it through 'But even' (>= 1.5 s of dusk in all: 1.61 s on the take, 1.81 s est); on 'with' the **dawn** wipes up (tod `dawn` = the day sky) with the sun rising at the exact point it set, StoopStreet's peach horizon band and peach rims, all below screen y 600: the next day. The crate of new locks has been there since last night. Part B stays in that dawn light; there is no day snap at the hidden cut.
5. `day`: S10-S12; the day relight arrives with the S10 tram wipe. The S12 rewind ends one step before the frame-0 press.

Captions are ink on every sky (ink on the sage dusk is 5.1:1, and on every intermediate step); no white page is needed. No night beat.

## Scene table

Times: **recorded | estimated** seconds.

| id | words | time (rec \| est) | visual | camera | peak? |
|---|---|---|---|---|---|
| S01 Government Plaza powers down | w0-w14 "Governments ... purpose," | 0.00-4.71 (4.71) \| 0.00-4.21 (4.21) | Government Plaza at the moment of a power-button press: the sun released, govB's screen collapsing; the power-off wave (govA on 'all', govC on 'over', the far civic skyline on 'Europe'); shutters slam on 'shut down / a bunch', govC half, govD stays lit; padlocks; lettered 'back soon' tags on 'on'. | sine push 1.00 -> 1.04 from rest, lock; a fixed 0.33 s dive into govB's lock box | PEAK 1 (hook) |
| S02 The takeover diagram | w15-w28 "because ... password." | 4.71-8.39 (3.68) \| 4.21-8.05 (3.84) | Tight on the PHP master blueprint: the lock detail with its short bolt, Bit in the gap; a dashed hand with a hooded cuff turns it with no key and a tiny schematic site is taken over. Labels L1 (static), L2. | lands 1.15 -> 1.30 (0.30 s), slow 3% creep | - |
| S03 Built from one blueprint | w29-w45 "It's ... it." | 8.39-14.17 (5.78) \| 8.05-13.85 (5.80) | Blueprint Street: the stamp slams on 'PHP', the whole street springs out of the plan in the ellipsis, the bait plays on a calm frame (Pip puffs up proudly on 'loves'), 7 plaques tick + the 7/10 sun pie. Labels L3 -> L4. | hard cut, 4% breath, lock | - |
| S04 Fourteen years in plain sight | w46-w54 "This ... years" | 14.17-16.59 (2.42) \| 13.85-16.03 (2.18) | Door #4 close: Bit sits on the lock in plain sight while 14 year pages tear, the ivy cycles seasons, ghosts pass, Pip sleeps. Label L5 hangs from the lock. | creep 1.50 -> 1.55; a fixed 0.33 s dive into lock4 (match) | - |
| S05 Found with AI | w55-w64 "before ... was." | 16.59-19.77 (3.18) \| 16.03-18.97 (2.94) | The blueprint wall (low angle): two teams rise, AI tablets, scan beams; ring on 'out', the S02 hand redraws on 'bad'. L5 rides in, L6. The messenger leaves with the envelope. | lands 1.08 -> 1.13 (0.30 s), lock; a fixed 0.30 s truck-right with the messenger | - |
| S06 A heads-up | w65-w71 "They ... heads-up," | 19.77-21.98 (2.21) \| 18.97-21.14 (2.17) | Makers' Lane (golden): the sun pops a wax seal onto the envelope, mail slot, three makers' heads pop UP on 'heads-up'; blind 'still fixing...' (J3). | cut on action: truck-right (0.63 s, matched speed), 2% breath | - |
| S07 Word got out | w72-w80 "but ... ready," | 21.98-24.09 (2.11) \| 21.14-23.52 (2.39) | Noticeboard: the printed leak sheet lens-wipes in on 'but', the address-bar rail goes online, clones 2-4-8, copies ride the wires, the sun becomes a spinning clock (fix not ready). Label L7. | lens wipe; 6% push, lock; a fixed 0.40 s tilt-up into S08 | - |
| S08 Counted from the announcement | w81-w111 "and ... day." | 24.09-34.48 (10.39) \| 23.52-33.45 (9.93) | Crane over our parapet (PEAK): hooded figures ALREADY at the doors of an endless city, the r260 sun half-set with two glow rings. Baseline push: on 'Cloudflare' a glass dome over ONE far district (~1/5) and a rooftop board; the count runs as hand-drawn tallies from the announcement; the 45-min wedge on the big sun; stamps. Pull back on 'millions' (PEAK): the flood, the stepped sunset. Labels L8-L11. | BIG MOVE 1: multiplane crane 1.3 -> 1.0 (2.0 s, PEAK); baseline dolly push 1.0 -> 1.15 over the count; 0.9 s pull-back on "millions" (PEAK) | PEAK 2 (crane + payoff only) |
| S09 Every single server | w112-w127 "But ... server." | 34.48-39.63 (5.15) \| 33.45-38.54 (5.08) | Dusk, then dawn on Stoop Street: the fix already there (crate lid + tags pop, 'still fixing...' -> 'fixed!'); hard cut: one keeper, one lock; hidden match-cut, pull-back up a hillside of ~650 doors that lands and HOLDS: empty check boxes over every door, one tick. | 3% breath; HARD CUT on 'somebody' (held still); hidden match at zoom 6; BIG MOVE 2: pull-back 6 -> 1 from rest, landing on 'single'; still hold | PEAK 3 (Part B) |
| S10 Half on versions too old | w128-w143 "Plus ... anymore." | 39.63-45.62 (5.98) \| 38.54-44.26 (5.72) | Old Quarter at door height: 1/2 sun pie, plaques flip old on ~half the sites, cobweb + cane; the makers' cart hands out elephant-stamped 'supported' tags and skips the old site; Pip 'hey!'; the stalled bar. Label L13. | tram wipe; 5% push, lock | - |
| S11 Just turn it off | w144-w164 "Even ... everything." | 45.62-52.16 (6.54) \| 44.26-50.91 (6.66) | govB's browser window: the stalled bar, the advisory taped inside the window (L14), the sun pressed on 'turn', the shutter down clean on 'it off'; the sticky note lands on 'tech' and 'and on again' is struck on 'everything'. | hard cut; 4% push, lock; 3% lean into the joke | - |
| S12 Before there was even a fix (the rewind) | w165-w177 "And ... fix." | 52.16-55.36 (3.20) \| 50.91-54.59 (3.68) | Hard cut back to the plaza as the shutdown left it; on 'before' the sun becomes a REWIND button and S01 plays backwards, stepped like a tape, to one step before the press; Bit walks home last. | hard cut at 1.03; ONE pull-back to rest = frame 0 | closing beat (PEAK-1 framing) |

**Cuts (beat-locked to the voice):** S02 at cut(purpose) (4.71 | 4.21), S03 at cut(password) (8.39 | 8.05), S04 at cut(it) (14.17 | 13.85), S05 at cut(years) (16.59 | 16.03), S06 at cut(was) (19.77 | 18.97), S07 at cut(heads-up) (21.98 | 21.14), S08 at cut(ready) (24.09 | 23.52), S09 at cut(day) (34.48 | 33.45), S10 at cut(server @0.8) (39.63 | 38.54), S11 at cut(anymore) (45.62 | 44.26), S12 at cut(everything) (52.16 | 50.91). Each is a gap anchor with a word check: in the pause, or on the word boundary where the take has none (after 'purpose,', 'years' and 'ready,' on the take: accepted, each carried by motion). S10's tram wipe is centred at 80 % of the pause after 'server.' so PEAK 3 holds still first. S08 is the one long scene (10.4 s: crane, baseline count, payoff); S04-S07 and S12 are short (2.1-3.2 s; reference 2's median shot is 2.2 s). Re-fit the music tempo map to these cuts on the take (`scripts/qa/beatsync.py --fit-tempo`).

## The loop

**Device: the rewind** (w172-0.05 'before' to the end; emitted as S12 `transitionOut {type: 'cut', loop: true, captionAt}`, never an un-build). The last line plays on the plaza as the shutdown left it. On 'before' the sun's power glyph pops to a bold REWIND glyph (two left-pointing triangles, the same button language and weight) and S01 plays BACKWARDS, stepped at ~12 fps like a tape rewind: the tags swing up and pop off, the padlocks pop off, Pip's startle hop runs backwards, the lanterns relight, the shutters roll UP (govC, govA, govB), the far civic silhouettes step back to lit, govC's and govA's screens un-collapse, and the rewind glyph pops back to the power glyph on 'fix.'. The last reversed step stops ONE STEP BEFORE THE PRESS: govB's screen is a bright line and the sun squashes down into its SunPress with the ripple ring at its emission radius. Bit walking backwards home along govA's cornice is the film's last motion (it ends 0.04 s before the end): the quiet 'watch it again' cue.

**The seam.** The last frame IS frame 0: camera at rest arriving at zero velocity (S12's single pull-back; S01's sine push starts from rest), every shutter up, govA / govC / govD lit, govB's screen a bright line, the sun at the bottom of its press, Pip sit-back on his bollard, Bit on govA's cornice, and caption page 1 rolling in (it starts at END-0.10 = 55.26 | 54.49, after 'fix.' has ended on either take, and is still 24 px low at the seam; frame 0 settles it by 0.25 s). Frame 0 RELEASES the press and the power-off wave spreads: the replay of 'Governments all over Europe just shut down...' is literally them doing it, before there was even a fix. Audio: the reversed whoosh / ticker and the music bed wrap across the seam; the frame-0 click is the press releasing.

Why a rewind and not the v1 un-build to line art: final_script.md section 6 gives the loop job to the cut back to the plaza with an end frame that matches frame 0, and the BRIEF asks for a first frame that tells the story on silent autoplay. A full-colour press frame does that; a line-art frame does not. A rewind glyph and S01's own beats played backwards (stepped) say 'rewind', so the shutters going up do not read as 'they reopened'.

## Engagement layer

- **First frame.** Frame 0 is the moment of the press, in full colour: the big orange sun at the bottom of a power-button press (the bold glyph, the ripple ring just emitted) and govB's browser window collapsing to a bright line, the other government websites still lit. In the first second the power-off wave spreads at phone size: govA's window on 'all', govC's on 'over', the far civic skyline as whole shapes on 'Europe'. On silent autoplay it reads 'a power button was just pushed and government websites are switching off' before a word is heard.
- **Cover frame:** w14+0.25 'purpose' (4.21 | 3.86 s): 'PURPOSE': three buildings shuttered, padlocked and tagged with lettered 'back soon' tags hanging still, govD lit, the far civic skyline dark, the ring about to pop on govB's lock (platform cover).
- **Open loop:** 'on purpose' (S01) is answered by the FBI advice (S11) and the rewind (S12).
- **Bait:** Bait line 'the language everyone loves' plays on a calm frame (the city springs up in the ellipsis before it); Pip puffs up proudly on 'loves', straight-faced; the 'I [heart] PHP?' sticker is a static pauser detail. 'forty-five minutes' gets the one-sweep wedge on the film's biggest sun + a stamp. The open loop 'on purpose' (S01) is closed by the FBI advice (S11) and the rewind (S12).

**Rewatch game: find Bit in every scene** (on-screen size >= 16 px in close shots, 20-24 px in wides).

| scene | where Bit is | size on screen | the game |
|---|---|---|---|
| S01 | govA's cornice (PLAZA.bit), idle antenna wiggle | 22 px | frame 0 and the last frame of the film: he is the first thing a rewatcher can find |
| S02 | in the lock slot, drawn in the same ink as the blueprint: camouflaged as a detail of the lock drawing until 'bug', when he peeks out (he ducks again on 'over') | 40 px | hidden in the drawing for the first 0.6 s; the eye finds him only when he moves |
| S03 | on top of the pen-nib sign of the press house, swinging with it | 20 px | small, in plain sight, moves only when the sign swings |
| S04 | sitting on lock4 in plain sight for fourteen years | 16 px | nobody looks at the door: the ghosts walk past him |
| S05 | on the blueprint lock detail, posing as part of the drawing | 20 px | he is drawn in the same ink as the plan: easy to miss until the "!" |
| S06 | on the messenger's shoulder, then on the mail-slot sill | 20 px | he hitches a ride with the heads-up |
| S07 | riding a wire copy over the rooftops (and doodled on the leaked page) | 18 px | two Bits in one shot: the drawing and the real one |
| S08 | rides the last wire copy, then hops onto the counter board's top edge and watches the count | 20 px | he watches the number go up like the rest of us |
| S09 | Part A: rides the dropped old lock and scurries up door #4's frame (he is a match object of the hidden cut, 18 px on screen); Part B: rides the snail's shell on Pip's bollard (screen space, 14 px) | 18 px | the slowest ride on the hill |
| S10 | caught in the old plaque's cobweb | 16 px | the bug, stuck to the old version |
| S11 | on the padlock's shackle (he rides nothing here; he hops on when the padlock pops) | 16 px | he guards the lock that keeps the bug out |
| S12 | govA's cornice (PLAZA.bit); he walks backwards to his frame-0 spot as the film's last motion | 22 px | he is in the last frame exactly where he is in the first |

**Pause-worthy sign jokes (small, true to the story):**

| id | scene | text | on | when | why it is true |
|---|---|---|---|---|---|
| J1 | S01 | back soon | backSoonTags (lettered) | w13-0.10 'on' | the shutdown was planned: 'on purpose' |
| J2 | S03 | I [heart] PHP + a scribbled '?' | sticker (static, >= 110 px wide, lettering >= 24 px) | w31+0.50 'PHP' | the bait line 'the language everyone loves', kept dry: a pauser detail, never animated |
| J3 | S06 | still fixing... | workshop blind (blindSign) | cut(was) | the fix is being made: the blind stays down until the fix exists (true to the story) |
| J4 | S07 | still fixing... | workshopCorner blind | w78-0.04 'fix' | callback from S06: 'before the fix was ready' (paid off in S09 as J5) |
| J5 | S09 | ~~still~~ fixed! (the 'still fixing...' sign) | cartSign | w117 'out' | the payoff of J3 / J4: the fix is out (and somebody STILL has to install it) |
| J6 | S11 | Turn it off ~~and on again~~ | stickyNote (on the closed shutter) | w164+0.05 'everything' | the FBI's advice was only the first half of tech support's answer: off, until it can be fixed |

## On-screen labels (final_script.md section 6)

Style: CaptionHand (Patrick Hand) at 34-40 px on screen (fine print 28-32 px, only on the S08 board and the S10 sign); ink #2B1B0F on cream paper (palette cream), 2.2 px ink outline, fill misregistered 3 px (props rule), corners slightly soft, a pin dot / string / clip / tape as the attachment. Motion: in: pop with the 7% spring (0.2 s), hanging tags add the pendulum (-16 -> 0 deg, 0.5 s), stamps slam (ink ring 0.13 s, print 2.6x -> 1.0x in 0.27 s, motion spec #15), cards can paper-flip to new text (0.2 s, swap at edge-on). out: 1-frame shrink pop, carried off by the camera / the next cut, or covered by an in-world action (a shutter). Never a fade. Timing: Stagger: the caption highlight, then the art event, then the label (0.35-0.5 s after its focal event, in the following unstressed words), never all three in the same frame. Exception: L8 sits on 'Cloudflare' with the dome and the board (mandatory, it must hold 1.5 s alone). Placement: screen x 90-930, y 600-1480 (under the caption band, above the bottom UI, left of the right rail); never over the focal event of the word they sit on; linted through every camera key of the label's life (each label's `box`). Hold: on screen >= 1.5 s (the S08 header holds >= 1.5 s alone before any count label appears: label.holdAloneBefore, linted); longer labels get more (>= 0.25 s per word is the target; L13 and the S08 credit cannot reach it and are fine print). Labels are in-world objects, never captions, never in the caption band.

| id | text (lines) | scene | in -> out | on | size | hold (rec \| est) |
|---|---|---|---|---|---|---|
| L1 | PHP2Shell · two linked flaws | S02 | w19+0.08 'where' -> cut(password) | blueprint (static title-block tag) | 40 px | 2.62 \| 2.75 |
| L2 | no password · / control of the site and its data | S02 | w22+0.15 'take' -> cut(password) | blueprint (annotation tag, short leader to the site icon) | 40 px | 1.82 \| 1.95 |
| L3 | PHP · the code most / websites are built with | S03 | w31+0.30 'PHP' -> w39+0.10 'out' | titleCard | 38 px | 3.25 \| 3.13 |
| L4 | of sites whose server / language is known · W3Techs | S03 | w39+0.10 'out' -> cut(it) | titleCard (paper flip from L3) | 36 px | 1.66 \| 1.72 |
| L5 | in the code since / at least 2012 | S04 | w53-0.10 'fourteen' -> cut(years) | lock4 (tag on a string, Lock rider); carried across the match-cut onto the blueprint lock (S05 owns its continuation) | 40 px | 1.20 \| 0.66 |
| L5 (cont.) | in the code since / at least 2012 | S05 | cut(years) -> w57+0.17 'using' | the blueprint lock (annotation, carried across the match-cut from S04) | 40 px | 1.02 \| 0.86 (with its S04 part: 2.21 \| 1.52 in all) |
| L6 | found with AI help · / reported privately in August | S05 | w58+0.40 'AI' -> cut(was) | banner top margin (clipped slip) | 38 px | 1.67 \| 1.58 |
| L7 | word leaked Oct 20 · / fix out Oct 21 | S07 | w73+0.10 'word' -> cut(ready) | board's bottom rail (pinned tag) | 40 px | 1.84 \| 1.95 |
| L8 | Cloudflare · sits in front / of about 1 in 5 websites | S08 | w89-0.15 'Cloudflare' -> cut(day) | counterBoard header | 38 px | 7.84 \| 7.59 |
| L9a | counted from the / public announcement / attempts, not break-ins | S08 | w95+0.15 'announced' -> cut(day) | counterBoard start flag (the count's left end) with its unit line | 30 px | 6.14 \| 5.62 |
| L9b | Matthew Prince, Cloudflare CEO, on X / Cloudflare's own count | S08 | end(announced)+0.10 -> cut(day) | counterBoard footer fine print | 28 px | 5.74 \| 5.25 |
| L10 | first 45 min: tens of thousands | S08 | w106-0.08 'minutes' -> cut(day) | counterBoard stamp slot 1 | 34 px | 2.47 \| 2.44 |
| L11 | millions · within a day | S08 | w108-0.08 'millions' -> cut(day) | counterBoard stamp slot 2 | 34 px | 1.63 \| 1.64 |
| L13 | Rough estimate from / W3Techs data · only sites / that show their version · / some hosts patch old / versions themselves | S10 | w133+0.15 'PHP' -> cut(anymore) | noticeSign (A-frame on the left pavement) | 30 px | 4.06 \| 4.43 |
| L14 | FBI · NSA / UK NCSC · CERT-EU | S11 | w147 'said' -> w155 'it' | advisory notice taped inside the lower left of govB's browser screen | 36 px | 2.17 \| 2.05 |

The long Cloudflare credit (final_script L9) is split in-world with every word kept: L9a = the start flag's note 'counted from the public announcement' with its unit line 'attempts, not break-ins' (one label, read as one), L9b = the board's footer 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count'. L8 holds ALONE 1.70 s on the take (1.97 s est) before any count label (asserted by both lints via `holdAloneBefore`). L12 'Updating WordPress won't fix it' is declined (see Declined).

## Transitions

| scene | in | window | match object | Film emits |
|---|---|---|---|---|
| S01 | loop-start | START -> START | - | `{"type": "cut"}` |
| S02 | matchcut | cut(purpose) -> cut(purpose) | lock | `{"type": "matchcut"}` |
| S03 | cut | cut(password) -> cut(password) | - | `{"type": "cut"}` |
| S04 | matchcut | cut(it) -> cut(it) | sun (mid-glide) | `{"type": "matchcut"}` |
| S05 | matchcut | cut(years) -> cut(years) | lock4 | `{"type": "matchcut"}` |
| S06 | cut | cut(was) -> cut(was) | - | `{"type": "cut"}` |
| S07 | foreground-wipe | cut(heads-up)-0.21 -> cut(heads-up)+0.21 | - | `{"type": "foreground-wipe", "dur": 0.42, "element": "scene", "dir": "right"}` |
| S08 | matchcut | cut(ready) -> cut(ready) | wires, sun (half behind the skyline) | `{"type": "matchcut"}` |
| S09 | matchcut | cut(day) -> cut(day) | sun set point = VP | `{"type": "matchcut"}` |
| S10 | foreground-wipe | cut(server @0.8)-0.25 -> cut(server @0.8)+0.25 | - | `{"type": "foreground-wipe", "dur": 0.5, "element": "scene", "dir": "right"}` |
| S11 | cut | cut(anymore) -> cut(anymore) | - | `{"type": "cut"}` |
| S12 | cut | cut(everything) -> cut(everything) | - | `{"type": "cut"}` |
| S12 out | loop (rewind) | w172-0.05 'before' -> END | the frame-0 state | `{"type": "cut", "loop": true, "captionAt": 55.26}` |

Inside scenes: the S09 hard cut on 'somebody' and the hidden match-cut on door #4 (lock, Bit on the door frame, door, window and cornice line at zoom 6, both frames at rest). Variety: dive match, hard cut, sun glide-hop match, dive match, cut on action, lens wipe through the printed sheet, tilt-into-crane match on the wires, sunset / sunrise match, tram wipe, hard cut, hard cut, rewind. No fades, no flips, no Film camera on any transition.

## Camera budget

- **Big moves (2):** the S08 multiplane crane (1.3 -> 1.0, out(quart), a fixed 2.0 s from the cut, entering at S07's exit speed) and the S09 pull-back (zoom 6 -> 1 from rest, log zoom anchored on house #4's lock, MOTION.camera.reveal shape, landing on 'single'; rows pop in as the caption floor passes them).
- **Medium (1):** S08's baseline dolly push 1.0 -> 1.15 over the count (~5.5 s), pulled back to rest on 'millions' (0.9 s).
- **Exempt (read as cuts):** the 0.33 s dives S01 -> S02 and S04 -> S05 and their 0.30 s landings, which keep moving IN (log-zoom rates at the cut 6.8 -> 2.8 /s and 1.23 -> 1.05 /s).
- **Exit / entry moves of the cuts on action** (screen speed of the matched point, both takes): S05's 0.30 s truck (exits ~883 px/s) into S06's 0.63 s truck (enters ~845 px/s); S07's 0.40 s tilt (exits ~790 px/s) into S08's crane (enters ~765 px/s).
- **Everything else:** one gentle 2-6 % push per shot from rest (in-out sine), then locked. S12 is ONE 3 % pull-back to frame 0 (no push-and-return).
- **Speed (flat 7 x 11 grid model, both takes):** outside the allow windows every scene stays under 18 px/frame with no velocity step over 2.5 px/frame/frame (S08's pull-back peaks at 17.4-17.5). Declared exceptions (`cameraSpeedAllow`, pass them to `scripts/camspeed.py --allow`): the dives (~110-380 px/frame: they read as cuts), the landings (~29-51), the S05 / S06 trucks (~25-30) and the S07 tilt / S08 crane start (~26-40) at the cut-on-action seams, and the S09 reveal (~76 px/frame on the take, ~94 on the faster estimate, at its cruise: the one big reveal, kept short so PEAK 3 can hold still).
- **Sky ceiling:** at every camera key only flat sky sits above screen y 560 inside x 90-990 (each scene's `ceiling` items and `sunKeys`, glow rings included, and now Pip's pose tops). S02's cornice at screen 676-748, S04's at 560-570, S05's at 564.5, S11's lean stops at 1.71 so govB's lantern stays at >= 563; S08's outer glow ring top is at 610.

## Scenes in detail

Beats are motion STARTS (small elements lead the word by ~0.10 s, big builds by 0.15-0.25 s; marks, presses and sun touch-downs sit ON the word). `span` in the JSON = how long a beat's staggered events run. Element positions are the shared kit's anchors (SHARED_SETS.md / SHARED_PROPS.md). Times: recorded | estimated.

### S01 Government Plaza powers down (START -> cut(purpose); 0.00-4.71 | 0.00-4.21)

*VO:* "Governments all over Europe just shut down a bunch of their own websites on purpose,"  
*ToD:* day. *In:* loop-start. *Reuses:* S01 (v1). *Sets:* GovernmentPlaza (state built; PLAZA anchors).  
*Scale tier:* PEAK 1 (the hook): 4.2-4.7 s; peak sun r155 (the hook needs the power glyph legible, not a half-set disc).

STORY PEAK 1/3 (the hook, Arcane scale). Government Plaza in Webtown, where every building is a website (its main window is a browser window). Monumental civic buildings at the far edge of a wide plaza, the outer ones cropped by the frame edges; through the gap between them the far city, a CIVIC skyline of domes, pediments and clock spires in haze tiers that runs to the horizon: 'governments all over Europe'. The huge low sun sits in the gap and is a power button. No count anywhere: only SOME buildings go dark ('a bunch of'), one only half, govD stays lit.

**Frame.** World = canvas px at camera rest; GovernmentPlaza anchors (PLAZA.*, review-5 PEAK layout): sun slot PLAZA.sun (720,900) r155 in the 150 px gap (x 640-790); Pip on PLAZA.bollard top (812,1426); Bit PLAZA.bit (262,742) size 22. govA Columned Hall (cropped left, window (118,906,144,108)), govB Domed Capitol (the hero, window (414,970,208,146), lock box (543,1318) 22 x 27 = the dive target), govC Clock Tower behind govD (window (812,734,132,106)), govD Modern Ministry (nearest, cropped right, window (800,1004,146,124), stays lit). The gap's far city carries farCivic (sets request): 6-8 fill-only civic silhouettes in two haze tiers (#98C0AE / #84B09C), EACH >= 40 px wide, that step dark as WHOLE shapes (one fill step) instead of window dots. SKY CEILING: nothing but sky above world y 600 inside x 90-990 (lantern tip 600, spire 606, pediment apex 614). Every padlock / tag at x <= 930. Bottom band = onlookers (framing only). Orange = the sun only.

**In.** Frame 0 = the moment of the PRESS (the loop seam; S12's rewind stops one step before it). Full colour. The sun sits at the bottom of its SunPress squash (0.88) at PLAZA.sun (720,900) r155 with the BOLD cream power glyph and its ripple ring just emitted; govB's browser window is mid power-off (its screen collapsed to a bright horizontal line); everything else is lit, govD too; Pip sit-back on his bollard; Bit on govA's cornice; the camera at rest; caption page 1 still 24 px low. Frame 0 RELEASES the press and the power-off wave spreads from the sun gap. Read without sound in the first frame: a big power button in the sky has just been pushed and a government website is switching off.

**Camera.** `START -> w6 'down'` (0.00-1.98 | 0.00-1.85) push-in (540,960,1.0) -> (552,972,1.04), inOut(sine): one gentle 4% push from REST (sine: the loop seam starts at zero velocity, S12's pull-back ends at rest), anchored on the sun gap; light parallax far x0.3 / buildings x0.7 / near x1.0. `w6 'down' -> cut(purpose)-0.33` (1.98-4.38 | 1.85-3.88) hold (552,972,1.04) -> (552,972,1.04), none: locked for the switch-off rhythm (shutters, padlocks, tags). `cut(purpose)-0.33 -> cut(purpose)` (4.38-4.71 | 3.88-4.21) push-in (552,972,1.04) -> (536.7,1258.4,3.19), in(quad): the dive into govB's lock box, a FIXED 0.33 s anchored on the cut (its length never depends on the take): at the cut the box is 70 x 86 px at screen (560,1150), exactly where S02's blueprint lock lands.

**Beats.**

- `START` (0.00 | 0.00): Frame 0 = the moment of the press (the loop seam, see the transition notes). Frame 0 RELEASES it: the sun springs back from its 0.88 squash (0.2 s) and its ripple ring runs out to r195 and pops off; govB's bright line shrinks to a dot and its screen goes dark (CRT off, 0.15 s); the camera's sine push starts from rest; caption page 1 settles its last 24 px.
- `w0+0.15 'Governments'` (0.34 | 0.28): 'Governments': two readable citizens stop and turn their heads toward govB; Pip's ear flicks and he looks at govB (look 0.3).
- `w1-0.10 'all'` (0.63 | 0.51): 'all': the power-off wave spreads from the sun gap: govA's browser window (144 x 108) collapses to a bright line and goes dark; a walking citizen slows.
- `w2-0.05 'over'` (0.89 | 0.78): 'over': govC's clock-tower window collapses the same way; three pigeons land on the lamp crossbar (0.06 s stagger).
- `w3 'Europe'` (1.16 | 1.18): 'Europe': the far civic skyline in the gap steps dark as WHOLE shapes, left to right (dome, pediment, clock spire, each >= 40 px wide on screen, one fill step, 0.06 s apart): governments all over Europe, readable on a phone.
- `w3+0.25 'Europe'` (1.41 | 1.43): Two far domes' lanterns pop off; two citizens raise phones toward govB.
- `w4 'just'` (1.56 | 1.53): 'just': the bold power glyph glints (two ink ticks).
- `w5 'shut'` (1.71 | 1.64): 'shut': govB's shutter SLAMS over its dark window (0.16 s ease-in + 6 px bounce); govB steps one palette step darker as it lands.
- `w6 'down'` (1.98 | 1.85): 'down': govA's shutter slams; govA steps darker.
- `w8 'bunch'` (2.35 | 2.15): 'bunch': govC's shutter drops only HALF way and stops with a 1-frame jolt (partly unavailable); its clock face stays white.
- `w9 'of'` (2.56 | 2.37): 'of': a citizen points up at govC; a pigeon shuffles on the crossbar.
- `w10 'their'` (2.69 | 2.46): 'their': the lamp lantern switches off (cream -> sand); the pigeons scatter (+0.06 s).
- `w11 'own'` (2.88 | 2.68): 'own': GAG: Pip startles, a quick trunk-up hop on the bollard (expression wide, 0.32 s).
- `w12-0.05 'websites'` (3.04 | 2.84): 'websites': Pip lands from the hop; a citizen lowers his phone.
- `w12+0.30 'websites'` (3.38 | 3.19): Padlocks pop onto the three closed shutters (0.06 s apart), each with a click.
- `w12+0.45 'websites'` (3.54 | 3.34): A pigeon circles back to the lamp.
- `w13-0.10 'on'` (3.69 | 3.37): 'on': the LETTERED 'back soon' tags swing onto the three closed shutters (pendulum -16 -> 0 deg, 0.35 s, 0.05 s stagger) and hang still before the dive: a planned closure, not a break-in (sign joke J1).
- `w14 'purpose'` (3.96 | 3.61): 'PURPOSE': govB's dome lantern pops off (cream -> sand); the citizens' heads turn back to the plaza.
- `cut(purpose)-0.45` (4.26 | 3.76): A small ink ring pops around govB's lock box (the bug is in there).
- `cut(purpose)-0.33` (4.38 | 3.88): The camera dives into the lock box (in(quad), a fixed 0.33 s ending on the cut); Pip hops toward the lens (he lands on the blueprint rod in S02).

**Sky keys.** START day. Captions: ink throughout.  
**Sun.** Peak size r155 in the gap (PLAZA.sun). Frame 0 is the bottom of its press (the power glyph has just been pushed), released in the first 0.2 s. Glints on 'just' (the only other sun beat: no decorative pulses). It leaves the frame with the dive; S02's sun is simply already in its slot.  
**Pip.** Pip, sit-back on PLAZA.bollard, scale 1.0 (the hop gag must read in the vista). Watches govB (ear flick on 'Governments'). GAG: startled trunk-up hop on 'own'. Hops toward the lens on the dive and lands on the master blueprint's rod in S02. No look to camera.  
**Bit.** govA's cornice (PLAZA.bit), idle antenna wiggle (22 px on screen).
**Captions** (highlight in brackets): Governments all over / Europe just shut down [shut down] | a bunch of their own / websites on purpose, [purpose,]  
**Sound.** switch_toggle START; power_off_thunk w1-0.10 'all'; power_off_thunk w2-0.05 'over'; typing_tick w3 'Europe'; click_light w4 'just'; pop_low w5 'shut'; pop_low w6 'down'; pop_low w8 'bunch'; power_off_thunk w10 'their'; lock_click w12+0.30 'websites'; pop_mid w13-0.10 'on'; whoosh_soft cut(purpose)-0.33.
**Life:** 48 events = 10.2/s on the take, 11.4/s on the estimate.

### S02 The takeover diagram (cut(purpose) -> cut(password); 4.71-8.39 | 4.21-8.05)

*VO:* "because of this bug where hackers could take over a site without a password."  
*ToD:* day. *In:* matchcut. *Reuses:* new: final_script.md section 6 'new small inset: takeover diagram'; S05 (v1) master blueprint, framed tight. *Sets:* BlueprintWall (draw variant: the plan draws outward from the lock).  
*Scale tier:* baseline.

The 'inset': no new world, just a close look at the PHP master blueprint (the plan every PHP building is built from; it hangs from the civic facade we meet properly in S05). Framed tight, the sheet fills the frame like a diagram, with a strip of day sky and the sun peeking over the cornice above it. On the sheet: the lock detail with its flaw, and a tiny schematic 'site' it guards.

**Frame.** BlueprintWall world. Lands at camera (470.6,794.8) zoom 1.15 and keeps pushing to (472.6,813.8) zoom 1.30, then creeps to (474,822) zoom 1.34 (screen = (world - cam) x zoom + (540,960)). The lock detail BLUEPRINT_WALL.lock (488,960) stays at screen (560,1150), 78 x 98 px at 1.30; the cornice (world 610) lands at screen 676-748, so the caption band is plain sky; the sheet (200,680,576,620) fills screen x ~186-935, y ~790-1600. Pip on the rod perch (700,680) -> screen (836,786). Diagram overlay (scene-owned, ink on the sheet): siteIcon world (640-760, 1090-1210) -> screen (758-914, 1319-1475) at 1.30 (1.34: (762-923, 1319-1480)); dashed connector lock -> icon; the hand enters from the right edge. Labels: L1 static title-block tag at the sheet's upper left (world 215-540 x 700-745 -> screen 205-628 x 812-870); L2 lower left (world 215-600 x 1100-1185 -> screen 205-706 x 1332-1446 at both 1.30 and 1.34, clear of the site icon in x). Sun screen-space (870,740) r110, lower part behind the facade.

**In.** Matchcut on the lock, in the end of 'purpose,' (the recorded take has no pause there; the cut sits on the word boundary). S01's own camera dives into govB's lock box (70 x 86 px at screen (560,1150) at the cut); S02's own camera lands on the SAME lock design drawn as a blueprint detail (BLUEPRINT_WALL.lock 60 x 75 at zoom 1.15) at the same screen position and size, and keeps moving IN while it decelerates (1.15 -> 1.30, out(expo), a fixed 0.30 s). ONE owner per move: Film adds no camera here (emitted as 'matchcut', not 'push-through': Film's push-through would zoom 7x about the frame centre and then pull the incoming scene back OUT). It is a drawing of the lock, not a door: attackers never get into real buildings. The sun is simply already in its S02 slot.

**Camera.** `cut(purpose) -> cut(purpose)+0.30` (4.71-5.01 | 4.21-4.51) push-in (470.6,794.8,1.15) -> (472.6,813.8,1.3), out(expo): the dive lands and keeps moving IN while it decelerates (a fixed 0.30 s from the cut); the lock stays at screen (560,1150); log-zoom rate ~6.8/s out of the dive, ~2.8/s into the landing (2.4x, accepted). `cut(purpose)+0.30 -> cut(password)` (5.01-8.39 | 4.51-8.05) push-in (472.6,813.8,1.3) -> (474.0,822.0,1.34), inOut(sine): a slow 3% creep while the diagram plays (never dead); the cornice stays at screen >= 560.

**Beats.**

- `cut(purpose)` (4.71 | 4.21): Matchcut (the S01 dive lands): the blueprint lock detail where S01's lock box was, same screen position and size; the camera keeps moving IN (1.15 -> 1.30, out(expo), 0.30 s). The sheet's linework draws outward from the lock (BlueprintWall draw, 0.6 s).
- `w15+0.15 'because'` (4.87 | 4.49): 'because': Pip lands on the rod with a squash (from his S01 hop).
- `w16 'of'` (4.96 | 4.69): 'of': the lock's cover swings open on its hinge (diagram dashes): the bolt in section.
- `w17 'this'` (5.11 | 4.78): 'this': bolt test: the bolt shoots out and STOPS SHORT of the strike, knocks back.
- `w18 'bug'` (5.30 | 5.00): 'bug': gap bracket + ring draw on and Bit peeks out of the slot, antennae up.
- `w19 'where'` (5.70 | 5.22): 'where': the site icon draws on at the sheet's right and the dashed connector runs from the lock to it.
- `w19+0.08 'where'` (5.78 | 5.30): Label L1 'PHP2Shell · two linked flaws' pops as a STATIC title-block tag at the sheet's upper left (after the highlight and the art event).
- `w20-0.05 'hackers'` (5.83 | 5.38): 'hackers': the dashed diagram hand, a dashed hooded cuff at its wrist, slides in from the right edge toward the lock (0.3 s, out(cubic)) and settles its fingers on the thumb-turn.
- `w21 'could'` (6.28 | 5.79): 'could': Bit's antennae flatten; the connector's dashes march one step toward the icon.
- `w22 'take'` (6.42 | 5.95): 'take': the hand pinches the thumb-turn and turns it 90 deg (0.2 s): the bolt retracts all the way, no key.
- `w22+0.15 'take'` (6.57 | 6.10): Label L2 'no password · control of the site and its data' pops at the sheet's lower left, a short leader toward the site icon.
- `w23 'over'` (6.63 | 6.17): 'over': a dashed arrow runs along the connector; the site icon's window fills with ink hatching and a tiny ink flag pops on its roof: taken over. Bit ducks into the slot.
- `w25 'site'` (6.90 | 6.61): 'site': the icon's padlock dot pops open.
- `w26 'without'` (7.28 | 6.92): 'without': a key glyph draws beside the lock, then an ink cross through it.
- `w28+0.10 'password'` (7.77 | 7.46): 'password': GAG: Pip folds his ears over his eyes (ears-cover), 0.3 s after the cross.
- `end(password)-0.15` (8.03 | 7.62): The little flag on the taken-over icon flutters; the key cross's ink settles.
- `cut(password)-0.12` (8.27 | 7.93): Sentence pause: the hand slides back out of frame (its job shown); Bit pops back up in the slot.
- `cut(password)-0.04` (8.35 | 8.01): Pip lifts his ears and hops off the rod toward the lens (crosses the hard cut).

**Sky keys.** cut(purpose) day. Captions: ink throughout.  
**Sun.** Screen-space peek over the cornice at (870,740) r110 (lower part behind the facade), already there at the cut (the dive is a cut: no glide, no landing, no pulse).  
**Pip.** Scale 1.2 on the rod. Lands on 'because'. GAG: ears-cover on 'password' (worried, the stakes). Hops out at the end toward S03.  
**Bit.** in the lock slot, drawn in the same ink as the blueprint: camouflaged as a detail of the lock drawing until 'bug', when he peeks out (he ducks again on 'over') (40 px on screen).
**Labels.** L1 'PHP2Shell · two linked flaws' on w19+0.08 'where'; L2 'no password · control of the site and its data' on w22+0.15 'take'.
**Captions** (highlight in brackets): because of this bug / where hackers could [bug] | take over a site / without a password. [without a password.]  
**Sound.** pencil_scratch_medium cut(purpose); card_flip w16 'of'; click_light w17 'this'; pencil_scratch_short w18 'bug'; pop_high w18+0.05 'bug'; pop_mid w19+0.08 'where'; whoosh_soft w20-0.05 'hackers'; lock_click w22 'take'; pop_mid w22+0.15 'take'; pencil_scratch_short w23 'over'; pencil_scratch_short w26 'without'; whoosh_soft cut(password)-0.12.
**Life:** 32 events = 8.7/s on the take, 8.3/s on the estimate.

### S03 Built from one blueprint (cut(password) -> cut(it); 8.39-14.17 | 8.05-13.85)

*VO:* "It's in PHP, the language everyone loves, and about seven out of ten websites run on it."  
*ToD:* day. *In:* cut. *Reuses:* S02 (v1), wide part only. *Sets:* BlueprintStreet (wide).  
*Scale tier:* baseline (horizon ~0.49 H).

Blueprint Street: a sunny street whose ground is a giant cream blueprint sheet with an ink perspective grid. The WordPress press house terminates the vista (no logo, no WordPress cue); in the ellipsis after 'PHP' the whole street springs out of the plan in one gesture, so the bait 'the language everyone loves' plays on a calm frame.

**Frame.** BLUEPRINT anchors at rest: press house 360-760 (apex (560,770), eaves 870, base 1180), VP (560,950), side buildings L1-L5 / R1-R4, stamp (330,1400), Pip BLUEPRINT.pip (350,1420). Sun r110 screen-space at (690,700), right of the apex. The plan's TITLE-BLOCK CARD at the plan's bottom-right corner (sets request): world x 490-910, y 1320-1440 (screen x 483-920, y 1350-1475 at the 1.04 breath), carrying L3 then L4. The 'I [heart] PHP' sticker, >= 110 px wide with lettering >= 24 px and a hand-scribbled '?', on the press-house door frame at (640,1060): a static pauser detail from the moment the house pops up. Near layer: the two BLUEPRINT.walkers.

**In.** HARD CUT in the sentence pause after 'password.', on the caption page change: from the plan's detail to the street whose floor IS that plan, still bare (only the buildings' footprints are drawn on it). Pip hops across; the sun is simply already in its wide slot (hard cut: no hop).

**Camera.** `cut(password) -> w34 'everyone'` (8.39-10.64 | 8.05-10.27) push-in (540,950,1.0) -> (545,945,1.04), inOut(sine): the hard cut lands at rest; the pop-up is the reveal, the camera only breathes 4% over ~2.2 s. `w34 'everyone' -> cut(it)` (10.64-14.17 | 10.27-13.85) hold (545,945,1.04) -> (545,945,1.04), none: locked while the bait plays and the count happens.

**Beats.**

- `cut(password)` (8.39 | 8.05): HARD CUT: the wide street at rest, the floor a bare blueprint with ten footprints; the sun already in its wide slot right of the apex; the camera starts its 4% breath.
- `w29 'It's'` (8.61 | 8.33): 'It's': grid lines draw on from the press house toward the viewer (0.37 s).
- `w30 'in'` (8.76 | 8.52): 'in': Pip lands on the blueprint at BLUEPRINT.pip with a squash.
- `w31-0.13 'PHP'` (8.83 | 8.57): 'PHP': the elephant stamp SLAMS onto the plan right under Pip (ring 0.13 s, print 2.6x -> 1.0x in 0.27 s); Pip bounces on it.
- `w31+0.30 'PHP'` (9.26 | 9.00): Label L3 'PHP · the code most websites are built with' pops on the title-block card (bottom right of the plan), 0.43 s after the stamp.
- `w31+0.50 'PHP'` (9.46 | 9.20): In the ellipsis, ONE gesture, 'the city springs out of the plan': the press house pops up first (scaleY 0 -> 1.06 -> 1), then the nine side buildings pop near -> far, alternating sides, 0.035 s apart (L1 R1 L2 R2 L3 R3 L4 R4 L5), all up by +0.85, each with its small browser window. The sticker with its '?' is already on the press-house door frame as the house rises (a pauser detail).
- `end(PHP)+0.10` (9.91 | 9.51): Pip settles on the stamp after his bounce; the roof vent puffs two paper sheets.
- `w32 'the'` (10.13 | 9.77): 'the': the press house's browser window lights (one screen); otherwise the frame holds still for the bait.
- `w33+0.10 'language'` (10.30 | 9.98): A far walker steps out of a doorway; Bit's antennae twitch on the sign.
- `w34-0.10 'everyone'` (10.54 | 10.16): 'everyone': six tiny walkers rise along the street (0.05 s stagger); the two big near walkers slide in from the frame edges.
- `w35 'loves'` (11.11 | 10.75): 'loves': Pip, the elephant, puffs up proudly on his stamp (sit-front, chest out: squash pulse -0.06 -> 0, expression happy, 0.3 s). He plays it straight; nothing on screen mocks PHP, the comments do the rest.
- `w35+0.25 'loves'` (11.36 | 11.00): A walker on the far pavement stops and looks up at the press house.
- `end(loves)` (11.61 | 11.17): The pen-nib sign swings (pendulum), Bit swinging on top of it; the roof vent puffs.
- `w37-0.10 'about'` (11.70 | 11.45): 'about': ten thin ink spokes draw across the sun (0.15 s): a 10-slice pie.
- `w38 'seven'` (11.96 | 11.68): 'seven': elephant plaques tick on, counting: P (re-pulse), L1, R1, L2, R2, L4, R3, 0.08 s apart.
- `w39+0.10 'out'` (12.51 | 12.13): The title-block card paper-flips (0.2 s) to L4 'of sites whose server language is known · W3Techs' (the mandatory footnote), after the count has started.
- `w41-0.10 'ten'` (12.55 | 12.19): 'ten': three blank cream plates pop on L3, L5, R4 (0.05 s apart); the matching 3 sun slices pop cream: the 7/10 pie.
- `w42 'websites'` (12.90 | 12.50): 'websites': the seven PHP buildings' screens light up in a wave (cream glow pop, 0.02 s stagger): the count is about websites.
- `w42+0.30 'websites'` (13.21 | 12.80): The two near walkers turn their heads toward the press house; a far walker waves.
- `w43 'run'` (13.48 | 13.08): 'run': walkers bob; Pip glances down the street (look 0.7); the vent puffs again.
- `w45 'it'` (13.86 | 13.44): 'it.': the pie slices pop back to solid (spokes retract).
- `end(it)` (13.95 | 13.57): The sun takes off on a low glide-hop toward S04 (anticipation squash, then a flat arc under the caption floor): it is mid-air at screen (810,680) on the cut and touches down on 'This'.
- `cut(it)-0.12` (14.05 | 13.73): Pip hops off the stamp toward the stoop (crosses the cut).

**Sky keys.** cut(password) day. Captions: ink throughout.  
**Sun.** Wide slot (690,700) r110, already there at the cut. Ten spokes on 'about', three cream slices on 'ten' (the 7/10 pie, no pulse), solid again on 'it.', then a low glide-hop across the cut (the sun is S04's match object: mid-air at (810,680) on the cut).  
**Pip.** Scale 1.2. Lands on 'in'; the stamp slams under him on 'PHP' and he bounces. GAG on 'loves': he puffs up proudly on his stamp, straight-faced. Glances down the street on 'run'. Hops out after 'it.'.  
**Bit.** on top of the pen-nib sign of the press house, swinging with it (20 px on screen).
**Labels.** L3 'PHP · the code most websites are built with' on w31+0.30 'PHP'; L4 'of sites whose server language is known · W3Techs' on w39+0.10 'out'.
**Captions** (highlight in brackets): It's in PHP, [PHP,] | the language / everyone loves, and | about seven out of ten / websites run on it. [seven out of ten]  
**Sound.** whoosh_soft cut(password); pencil_scratch_medium w29 'It's'; pop_low w31-0.13 'PHP'; pop_mid w31+0.30 'PHP'; paper_flip w31+0.50 'PHP'; pop_mid w35 'loves'; pop_mid end(loves); pop_high w38 'seven'; card_flip w39+0.10 'out'; pop_low w41-0.10 'ten'; whoosh_soft end(it).
**Life:** 59 events = 10.2/s on the take, 10.2/s on the estimate.

### S04 Fourteen years in plain sight (cut(it) -> cut(years); 14.17-16.59 | 13.85-16.03)

*VO:* "This bug was in there for like fourteen years"  
*ToD:* day. *In:* matchcut. *Reuses:* S04 (v1): only the 14 year pages, seasons, ivy, ghosts, cobweb; S10 (v1) Part A framing (330,900) zoom 1.5. *Sets:* StoopStreet (day, people={false}).  
*Scale tier:* baseline.

Stoop Street, close on door #4: the same PHP lock (lock4) with Bit sitting on it in plain sight, the tear-off calendar of YEAR pages beside the door, ivy at the door frame. A locked-off time-lapse: everything changes except the lock.

**Frame.** StoopStreet world. Camera (330,900) zoom 1.5: the hero cornice (world 640) lands at screen 570, lock4 (330,1130) at screen (540,1305) 51 x 63, the calendar (385,1040,70,80) at screen (622-727, 1170-1290): the year grids read. The season cue is the IVY at the door frame (world x 210-235 -> screen x 360-397, on the visible left of the door), not the near tree (cropped at screen x ~1027, inside the right rail). The sky right of the hero house (screen x > 825) holds the sun at (930,690) r110. Pip on step 2's tread (world (300,1230) -> screen (495,1455)), scale 1.2. Ghosts on the pavement to the right (screen x 600-900, y 1300-1470). The L5 tag hangs from lock4 on a short string (Lock rider), world ~(300-470, 1153-1207) -> screen ~(495-750, 1340-1420). StoopStreet people={false}.

**In.** Cut in the sentence pause after 'it.'. The SUN is the match object: it takes off from S03's slot at the end of 'it.' on a low glide-hop and is mid-air at screen (810,680) on the cut in both shots (the hop's midpoint is the cut on any take: take-off at the pause start, touch-down at the pause end on 'This'). We open on the flawed lock again ('This bug'), on a real door this time.

**Camera.** `cut(it) -> cut(years)-0.33` (14.17-16.26 | 13.85-15.70) push-in (330,900,1.5) -> (330,898,1.55), inOut(sine): a slow 3% creep during the time-lapse; the cornice stays at screen >= 560. `cut(years)-0.33 -> cut(years)` (16.26-16.59 | 15.70-16.03) push-in (330,898,1.55) -> (360,1130,1.9), in(quad): dive into lock4, a FIXED 0.33 s anchored on the cut: at the cut lock4 is 65 x 80 px at screen (483,960), exactly where S05's blueprint lock lands; the hero browser window crosses the caption band for <= 10 frames (its chrome flattens to one tealDark field during the dive, no ink).

**Beats.**

- `cut(it)` (14.17 | 13.85): MATCH on the sun (mid-glide at (810,680) in both shots): door #4 at medium-close; Bit sits on the lock box in plain sight; the calendar shows a year page; the slow creep begins.
- `w46 'This'` (14.39 | 14.12): 'This': the sun touches down in its slot (930,690); Pip lands on step 2's tread (from S03's hop).
- `w46+0.12 'This'` (14.52 | 14.24): Pip yawns.
- `w47 'bug'` (14.60 | 14.34): 'bug': Bit does a small hop on the lock box (he is 'this bug').
- `w48 'was'` (14.79 | 14.56): 'was': two ink-only ghost passers-by pop on the pavement, never looking at the door.
- `w49 'in'` (14.94 | 14.78): 'in': the ivy creeps up the door frame one step (green).
- `w50+0.05 'there'` (15.09 | 15.01): 'there': the time-lapse: the calendar tears 14 YEAR pages, 0.07 s apart, each flipping up and away; the ivy steps a season every 2 tears (green, peach, tan, bare: the season cue, on the visible left of the door); ghosts pop in and out (~1 per tear).
- `w51+0.10 'for'` (15.29 | 15.23): 'for': Pip curls up asleep on the step (sleep pose, z's float).
- `w52 'like'` (15.38 | 15.33): 'like': a second pair of ghosts strides past; Bit yawns and blinks (he does not move).
- `w53-0.10 'fourteen'` (15.39 | 15.37): Label L5 'in the code since at least 2012' swings in as a tag hanging from lock4 (rider; pendulum -16 -> 0), just before 'fourteen'.
- `w53+0.10 'fourteen'` (15.59 | 15.56): 'fourteen': a cobweb draws over the lock box corner (inkHair, 0.3 s); Bit does not move.
- `w53+0.20 'fourteen'` (15.69 | 15.66): A tan leaf drifts down toward sleeping Pip; the last year pages tear.
- `cut(years)-0.33` (16.26 | 15.70): 'years': the camera dives into lock4 (in(quad), a fixed 0.33 s ending on the cut); the leaf lands on sleeping Pip's ear.

**Sky keys.** cut(it) day. Captions: ink throughout.  
**Sun.** Mid-air at (810,680) on the cut (the match object), touches down in its slot (930,690) r110 on 'This'. No pulse-train. It leaves the frame with the dive; S05's sun is already in its notch.  
**Pip.** Scale 1.2. Lands on 'This', yawns, sleeps through fourteen years (his gag: a leaf lands on his ear). Stays asleep into S05.  
**Bit.** sitting on lock4 in plain sight for fourteen years (16 px on screen).
**Labels.** L5 'in the code since at least 2012' on w53-0.10 'fourteen'.
**Captions** (highlight in brackets): This bug was in there / for like fourteen years [fourteen years]  
**Sound.** whoosh_soft cut(it); pop_mid w46 'This'; pop_mid w47 'bug'; counter_ticker w50+0.05 'there'; paper_flip w50+0.05 'there'; paper_flip w53-0.10 'fourteen'; pencil_scratch_short w53+0.10 'fourteen'; whoosh_soft cut(years)-0.33.
**Life:** 45 events = 18.6/s on the take, 20.6/s on the estimate.

### S05 Found with AI (cut(years) -> cut(was); 16.59-19.77 | 16.03-18.97)

*VO:* "before researchers using AI figured out how bad it was."  
*ToD:* day. *In:* matchcut. *Reuses:* S05 (v1). *Sets:* BlueprintWall (wide; the one gentle low angle).  
*Scale tier:* baseline.

The blueprint wall, the film's one gentle LOW ANGLE (seasoning, not a peak): the PHP master blueprint hangs as a tall banner from the cornice of a civic facade, seen from the investigators' waist height so the pilasters lean in 4-6 deg. Two research teams stand at the foot of a broad flight of steps, backs to us.

**Frame.** BLUEPRINT_WALL anchors at rest; the camera lands at (540,960) zoom 1.08 and settles at 1.13 (cornice world 610 -> screen 564.5). Banner BLUEPRINT_WALL.sheet with the lock detail at (488,960); stamp (720,1230); calendar (90,760,70,90); sun notch (930,725) r110; steps 1320-1480, teams' feet BLUEPRINT_WALL.feetY 1470 (team A x 120-420, team B x 600-940: inside the rail). Pip asleep on the banner's BOTTOM RAIL at world (620,1300) -> screen (631,1344) (never up on the rod: his jolt would reach into the caption band); his trunk-up top stays at screen ~1214. L5 rides in as an annotation under the lock (world 420-680 x 1010-1080 -> screen 404-698 x 1016-1095). L6 is a cream slip clipped to the banner's top margin: world (205-650, 688-760) -> screen ~(161-664, 653-734), 2 lines; it slides out with the exit truck.

**In.** Phrase boundary 'years | before' (accepted: the recorded pause is 0.04 s, the cut sits in it). S04's own camera dives 1.55 -> 1.9 into lock4 (in(quad), 0.33 s: 65 x 80 px at screen (483,960) on the cut); S05's own camera lands on the SAME lock silhouette drawn in ink on the PHP master blueprint (60 x 75 at zoom 1.08), same screen position and size, and keeps moving IN (out(expo) 1.08 -> 1.13 over a fixed 0.30 s, then locks). Log-zoom rate across the cut: ~1.23/s out of the dive, ~1.05/s into the landing (1.2x: one decelerating push, no slam). The L5 tag rides across as a blueprint annotation. ONE owner per move: Film adds no camera (matchcut). The sun is already in its notch.

**Camera.** `cut(years) -> cut(years)+0.30` (16.59-16.89 | 16.03-16.33) push-in (540,960,1.08) -> (540,960,1.13), out(expo): the match-cut lands still moving IN and settles (a fixed 0.30 s): log-zoom rate ~1.05/s at the cut against the dive's ~1.23/s (1.2x). `cut(years)+0.30 -> cut(was)-0.30` (16.89-19.47 | 16.33-18.67) hold (540,960,1.13) -> (540,960,1.13), none: locked while the teams, tablets, beams and the ring build. `cut(was)-0.30 -> cut(was)` (19.47-19.77 | 18.67-18.97) truck-right (540,960,1.13) -> (690,960,1.13), in(sine): follow the messenger out of frame right: a FIXED 0.30 s anchored on the cut; 150 world px at zoom 1.13 exits at pi/2 x 150 / 0.30 x 1.13 = ~890 screen px/s into the cut on action.

**Beats.**

- `cut(years)` (16.59 | 16.03): Match-cut on the lock (the S04 dive lands): the blueprint lock detail lands where lock4 was, same screen spot and size; the L5 tag rides across as a blueprint annotation; the camera keeps creeping IN (1.08 -> 1.13, out(expo), 0.30 s), then locks. The steps are empty; Pip is already asleep on the banner's bottom rail.
- `w55+0.15 'before'` (16.76 | 16.18): A z floats up from sleeping Pip; the banner sways once on its rod.
- `w56-0.05 'researchers'` (16.77 | 16.18): 'researchers': team A rises at the foot of the steps (0.10 s stagger, rise 0.33 s).
- `w56+0.30 'researchers'` (17.12 | 16.53): Team B rises (0.10 s stagger).
- `w57 'using'` (17.43 | 16.72): 'using': the facade calendar tears to its summer page (August).
- `w57+0.17 'using'` (17.61 | 16.89): The L5 annotation pops off (shrink 0.12 s).
- `w58-0.06 'AI'` (17.64 | 16.93): 'AI': one tablet per team is raised (0.07 s apart), each sparkle twinkling.
- `w58+0.25 'AI'` (17.95 | 17.24): The two scan beams shoot out from the tablets and sweep the banner from opposite sides.
- `w58+0.40 'AI'` (18.11 | 17.39): Label L6 'found with AI help · reported privately in August' pops as a slip clipped to the banner's top margin.
- `w59 'figured'` (18.20 | 17.41): 'figured': both beams converge on the lock detail.
- `w60 'out'` (18.54 | 17.77): 'out': the ink target ring strokes on around the lock ON the word (0.17 s): found.
- `w61 'how'` (18.70 | 17.93): 'how': the ring pulses once; the teams lean in.
- `w62 'bad'` (18.87 | 18.11): 'bad': ONE focal event: the dashed hand from S02 redraws over the lock and turns it (callback: this is how bad it was) and Bit gets an ink '!'. Nothing else moves.
- `w63+0.05 'it'` (19.21 | 18.38): 'it': GAG: Pip jolts awake on the rail (trunk-up, expression wide), 0.27 s after the '!'.
- `w64+0.10 'was'` (19.43 | 18.54): 'was.': the messenger pulls the envelope from his coat and turns right; the dashed hand retracts.
- `cut(was)-0.30` (19.47 | 18.67): He walks out of frame right and the camera trucks with him (in(sine), a fixed 0.30 s ending on the cut); Pip jumps off the rail to follow.

**Sky keys.** cut(years) day. Captions: ink throughout.  
**Sun.** Screen-space notch (930,725) r110, already there at the cut (the dive is a cut: no landing, no heat ticks). No beat on 'bad' (one focal event).  
**Pip.** Scale 1.2. Already asleep on the banner's bottom rail (callback to S04). GAG: jolts awake on 'it', after the '!'. Follows the messenger across the cut on action.  
**Bit.** on the blueprint lock detail, posing as part of the drawing (20 px on screen).
**Labels.** L5 'in the code since at least 2012' on cut(years); L6 'found with AI help · reported privately in August' on w58+0.40 'AI'.
**Captions** (highlight in brackets): before researchers / using AI figured out [AI] | how bad it was. [bad]  
**Sound.** pencil_scratch_short cut(years); pop_mid w56-0.05 'researchers'; pop_mid w56+0.30 'researchers'; paper_flip w57 'using'; bubble_pop w58-0.06 'AI'; whoosh_soft w58+0.25 'AI'; pop_mid w58+0.40 'AI'; ding w60 'out'; pencil_scratch_medium w62 'bad'; alert_ping w63+0.05 'it'; whoosh_soft cut(was)-0.30.
**Life:** 28 events = 8.8/s on the take, 9.5/s on the estimate.

### S06 A heads-up (cut(was) -> cut(heads-up); 19.77-21.98 | 18.97-21.14)

*VO:* "They gave the PHP people a heads-up,"  
*ToD:* golden. *In:* cut. *Reuses:* S06 (v1). *Sets:* MakersLane + Workshop (WORKSHOP_LANE).  
*Scale tier:* baseline.

Makers' Lane at golden hour: a narrow lane toward a low golden sun. On the right the workshop of the people who make PHP (hanging elephant sign, mail slot, upstairs browser window: it is a website too). Its shop-window blind is DOWN with a little hand-lettered sign: 'still fixing...' (the fix is still being made).

**Frame.** MAKERS_LANE + WORKSHOP_LANE anchors: VP (430,1040), sun (420,985) r120 at the lane end behind far-roof silhouettes, peach band 920-1040; workshop 600-1000 (roof 720), upstairs browser window (680,790,220,110), door (620,1150,100,300) with the mail slot (670,1300), elephant sign r45 (700,980), shop window (740,1060,200,240) with the blind DOWN to 1180 and the sign 'still fixing...' on it (>= 24 px lettering on screen). Messenger (260 px) on MAKERS_LANE.messengerY 1520; Pip on MAKERS_LANE.pipY 1480. The camera trucks at y 970 (zoom 1.04, then a 2% breath): the workshop roof (720) and the left roofline stay under screen y 560.

**In.** CUT ON ACTION in the sentence pause after 'was.': the messenger walks out of frame right in S05 (camera trucking right, in(sine), ~890 screen px/s at the cut) and enters frame left in S06 mid-stride with the camera trucking RIGHT at the same speed (out(cubic) over a fixed 0.63 s: 3 x 180 x 1.04 / 0.63 = ~890 px/s), pure x on both sides. The golden light arrives on the cut (no wipe). Pip follows him across. The sun is already at the lane end.

**Camera.** `cut(was) -> cut(was)+0.63` (19.77-20.40 | 18.97-19.60) truck-right (380,970,1.04) -> (560,970,1.04), out(cubic): cut on action: enters at ~890 screen px/s (= S05's exit speed), decelerates with the messenger over a fixed 0.63 s; parallax sun x0.1, houses x0.6. `cut(was)+0.63 -> cut(heads-up)-0.21` (20.40-21.77 | 19.60-20.93) push-in (560,970,1.04) -> (560,970,1.06), inOut(sine): a 2% breath from rest so the letter, the heads and the sheet read. `cut(heads-up)-0.21 -> cut(heads-up)` (21.77-21.98 | 20.93-21.14) hold (560,970,1.06) -> (560,970,1.06), none: the lens wipe starts.

**Beats.**

- `cut(was)` (19.77 | 18.97): CUT ON ACTION: the messenger enters left mid-stride, envelope in hand; the camera trucks right with him at the speed S05 left with; golden light arrives with the cut. The workshop blind is down, its little sign reading 'still fixing...' (sign joke J3).
- `cut(was)+0.10` (19.87 | 19.07): Pip lands behind the messenger and tiptoes (walk-side, rate 0.8).
- `w65 'They'` (19.98 | 19.25): 'They': the sun (already at the lane end) gives an in-place press squash (-10% y) and a small orange wax seal pops out of it along a dotted arc onto the envelope (0.33 s): a private letter.
- `w66 'gave'` (20.09 | 19.34): 'gave': Bit peeks out from the messenger's collar (rewatch spot).
- `w68-0.10 'PHP'` (20.29 | 19.56): 'PHP': the hanging elephant sign swings (pendulum -16 -> 0, 0.5 s); the peach glow pops in the slit under the blind (the makers are in).
- `w67+0.15 'the'` (20.36 | 19.70): GAG: Pip stops and goes 'shh' (hold pose, trunk curled to his mouth), 0.3 s after the seal.
- `w68+0.28 'PHP'` (20.66 | 19.94): A neighbour's curtain is drawn (1-frame pop); the messenger reaches the workshop door.
- `w69-0.10 'people'` (20.82 | 20.15): 'people': the upstairs browser window's screen lights (the workshop is a website too).
- `w70 'a'` (21.16 | 20.50): 'a': the envelope slides through the mail slot (0.25 s), Bit hopping off onto the sill; the flap clicks.
- `w71 'heads-up'` (21.29 | 20.59): 'heads-up': three makers' heads pop UP into the upstairs window (back view, rise 0.2 s, 0.06 s stagger): a literal heads-up. The blind jolts once.
- `w71+0.25 'heads-up'` (21.54 | 20.84): The leak sheet flutters in at the LEFT frame edge from off-frame on a gust; Pip's ear twitches.
- `cut(heads-up)-0.21` (21.77 | 20.93): The gust lifts the sheet toward the lens: S07's lens wipe begins (its printed side faces us).

**Sky keys.** cut(was) golden (wipe snap). Captions: ink throughout.  
**Sun.** Screen-space (420,985) r120 at the lane end, already there on the cut: on 'They' it gives an in-place press squash and pops the seal (its one morph here).  
**Pip.** Scale 1.2. Tiptoes behind the messenger. GAG: 'shh' after the seal. Ear twitch at the sheet, then leaps after it into S07.  
**Bit.** on the messenger's shoulder, then on the mail-slot sill (20 px on screen).
**Captions** (highlight in brackets): They gave the PHP / people a heads-up, [heads-up,]  
**Sound.** whoosh_soft cut(was); pop_mid w65 'They'; pop_mid w68-0.10 'PHP'; click_light w70+0.20 'a'; pop_high w71 'heads-up'; paper_flip w71+0.25 'heads-up'.
**Life:** 22 events = 9.9/s on the take, 10.2/s on the estimate.

### S07 Word got out (cut(heads-up) -> cut(ready); 21.98-24.09 | 21.14-23.52)

*VO:* "but word got out before the fix was ready,"  
*ToD:* golden. *In:* foreground-wipe. *Reuses:* S07 (v1). *Sets:* NoticeboardCorner + TelephoneWires (WIRES.S07) + Workshop corner preset.  
*Scale tier:* baseline.

Town Square at golden hour: the public noticeboard on legs in front of a sunny public wall; its top rail is a browser address bar, so the board itself is online. Three telephone wires run from a pole on the workshop corner across the sky toward the city. The makers' workshop corner at the right edge, blind still down ('still fixing...').

**Frame.** NOTICE_CORNER anchors: wall (-140..780, top 840), board frame (140,930,600,430) + rail (220,900,440,30), legs to 1490; pole (1000, 620-700); wires WIRES.S07 (y 700 / 730 / 760 at x 540); sun (640,820) r110 half behind the wall top; Pip on the board top NOTICE_CORNER.pip (705,928); readers NOTICE_CORNER.readers at the frame sides. L7 tag pinned on the board's bottom rail: world (300-640, 1340-1430), 2 lines (screen y <= 1469 at the 1.06 push).

**In.** In the comma pause after 'heads-up,': the leak sheet (S06's exported Wiper, motion spec T-MATCH) sweeps across the lens left to right, growing x1 -> x8 about its PRINTED content (heading bar, the lock sketch with its short bolt, the Bit doodle, all in ink), so the frame is never a blank white field; it shrinks (6 f) into the notice pinned on the board's left pane. The new scene is revealed as flat fills; its linework draws on right after.

**Camera.** `cut(heads-up) -> cut(heads-up)+0.21` (21.98-22.20 | 21.14-21.34) hold (540,960,1.0) -> (540,960,1.0), none: the wipe does the work. `cut(heads-up)+0.21 -> w78 'fix'` (22.20-23.20 | 21.34-22.48) push-in (540,960,1.0) -> (480,950,1.06), inOut(sine): one gentle 6% push from rest onto the board after the wipe lands (aimed at y 950 so the sky stays clean). `w78 'fix' -> cut(ready)-0.40` (23.20-23.70 | 22.48-23.12) hold (480,950,1.06) -> (480,950,1.06), none: locked while copies multiply and the clock spins. `cut(ready)-0.40 -> cut(ready)` (23.70-24.09 | 23.12-23.52) tilt-up (480,950,1.06) -> (480,760,1.06), in(sine): follow the copies up the wires: a FIXED 0.40 s anchored on the cut, a TILT (every layer moves together, the sun too); 190 world px at 1.06 = 201 screen px, exiting at pi/2 x 201 / 0.40 = ~790 px/s into the S08 crane, which enters at ~780 px/s; the wires land at screen 896 / 928 / 960 (the S08 match).

**Beats.**

- `cut(heads-up)` (21.98 | 21.14): Lens wipe (centre on the cut): the leaked sheet sweeps across the lens growing to x8 with its PRINTED content facing us (heading bar, the lock sketch, the Bit doodle, in ink), so no frame is blank; it shrinks into the notice pinned on the left pane; the new scene is revealed as flat fills and its linework draws on (0.45 s).
- `w73-0.05 'word'` (22.11 | 21.43): 'word': the pin dot pops on the notice; Pip lands on the board top.
- `w73+0.10 'word'` (22.25 | 21.57): Label L7 'word leaked Oct 20 · fix out Oct 21' pops as a tag pinned on the board's bottom rail (after the wipe has landed).
- `w74 'got'` (22.50 | 21.69): 'got': the board's address-bar rail lights (cream pill + three dots pop): the board is online; two clones pop.
- `w75-0.10 'out'` (22.57 | 21.90): 'out': the clones double to 4, then 8 (0.16 s later); GAG: a copy slaps onto Pip's face on the word (he flips to sit-front; flyer overlay). The first two readers rise at the left side.
- `w76 'before'` (22.88 | 22.16): 'before': copies peg onto the wires and travel left across the sky over the rooftops, live Bit riding one; the pigeons hop; the sun hops up into view behind the wall top.
- `w77 'the'` (23.05 | 22.37): 'the': two more readers rise at the right side; four phones raise (0.05 s stagger).
- `w78-0.04 'fix'` (23.16 | 22.44): 'fix': the sun becomes a clock (cream ring + minute hand + hour hand pop, 0.15 s): the minute hand spins fast (2.5 turns) while the hour hand steps 3 ticks: hours pass and the fix is not ready. The workshop corner's blind stays down with its 'still fixing...' sign (J4), its elephant sign swings.
- `w79 'was'` (23.55 | 22.79): 'was': Pip peels the flyer off (overlay removed) and shakes his head; a reader's phone shows a tiny copy (pop); a pigeon flaps up.
- `cut(ready)-0.40` (23.70 | 23.12): The clock face pops off the sun; the camera tilts up after the wire copies (in(sine), a fixed 0.40 s ending on the cut; it exits at ~790 px/s into the S08 crane); Pip hops off the board.

**Sky keys.** cut(heads-up) golden. Captions: ink throughout.  
**Sun.** Screen-space (640,820) r110, half behind the wall top; hops in across the wipe and touches down on 'before'; becomes the hours clock on 'fix' (spinning hands: the fix is not ready yet; no numbers); during the tilt it moves down with the whole frame (a tilt moves every layer), so it is still half behind the wall top on the cut, at (640,1021): S08 picks it up there, half behind the far skyline.  
**Pip.** Scale 1.2 on the board top (the reference cat's spot). GAG: a leaked copy slaps onto his face on 'out'; peels it off on 'was'. Hops off at the tilt.  
**Bit.** riding a wire copy over the rooftops (and doodled on the leaked page) (18 px on screen).
**Labels.** L7 'word leaked Oct 20 · fix out Oct 21' on w73+0.10 'word'.
**Captions** (highlight in brackets): but word got out before / the fix was ready, [word got out]  
**Sound.** fg_wipe cut(heads-up); pop_mid w73-0.05 'word'; pop_mid w73+0.10 'word'; click_light w74 'got'; paper_flip w75-0.10 'out'; pop_mid w75 'out'; whoosh_soft w76 'before'; counter_ticker w78-0.04 'fix'; whoosh_soft cut(ready)-0.40.
**Life:** 30 events = 14.2/s on the take, 12.6/s on the estimate.

### S08 Counted from the announcement (cut(ready) -> cut(day); 24.09-34.48 | 23.52-33.45)

*VO:* "and hackers were already trying to use it. Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day."  
*ToD:* golden->dusk. *In:* matchcut. *Reuses:* S08 (v1), re-staged: the dome covers about 1/5 of the city; v1's push-and-pull shape. *Sets:* DomeCity (re-scaled dome: sets request) + TelephoneWires (WIRES.S08, ending at a rooftop pole).  
*Scale tier:* PEAK 2 only for the crane reveal (~2.5 s) and the payoff (~1.7 s); BASELINE medium push (1.0 -> 1.15) for the count in between.

STORY PEAK 2/3 in TWO short doses with a baseline count between them. (1) The reveal: Webtown from the rooftops at golden hour, an endless city of websites to the horizon, the film's biggest sun half-set on it; the hooded figures are ALREADY at the doors. (2) Baseline: on 'Cloudflare' a colossal glass shield-dome draws itself over ONE far district (about 1 in 5 of the city) and a counter board rises on our parapet; a slow push brings the board and the dome rim close while the count runs from the announcement (one count device: the board). (3) The payoff: on 'millions' the flood bursts over the whole city and the camera pulls back to the vista; the sun sets: 'within a day'.

**Frame.** DomeCity world at rest (crane end and payoff): golden sky to the horizon y 1000 (DOME.horizon), peach band 880-1000; rows 0-3 full width + bleed. THE DOME, re-scaled (sets request: `dome` prop): one bold 4.8 arc from (180,1080) over the apex (390,830) to (600,1080), over a far district on rows 0-1; inside it the Glass step, cream rim strip, 2 glint bars, 4 meridians + 2 parallels; ~1/5 of the visible city, everything else visibly uncovered. THE SUN (peak dose): r260 half-set on the horizon at screen (700,1000), its left edge behind the dome's right flank, clipped below row 0's base, with two stepped flat glow rings (peach x1.25 = r325, then x1.5 = r390: the outer ring's top at screen 610, under the caption floor). It lives in the sky layer (depth 1): the dolly push does not move or grow it. WATCHTOWER at the dome's right foot (x 600-650, cabin top ~880), silhouetted against the sun, cabin dark (no guard pop); searchlight sweep clamped to -10..+25 deg so its cone stays below screen y 600. Near PARAPET (DOME.parapet) with chimney pots; Pip on the coping DOME.pip (500,1448) at scale 0.75 (~72 px: peak tininess); observer off. COUNTER BOARD on the parapet: world x 430-890, y 1080-1440 (screen x 345-874 at the 1.15 push: left of the right rail), teal frame, cream face, a small shield-dome emblem top-left; zones: header L8 (y 1092-1172), start flag + L9a (x 450-720, y 1180-1290), hand-drawn ink tally gates (x 730-880, y 1185-1290; no digits), stamp slots L10 (y 1295-1338) and L11 (y 1340-1383), footer L9b (y 1388-1436). WIRES.S08 end at a rooftop pole at x 540 on our parapet. Baseline push target: camera (600,1100) zoom 1.15 (dome apex at screen ~650, horizon ~845, board x 345-874). Rattler doors: row-3 doors at x 100-460 (55-70 px figures) and row-2 doors across the width (30-40 px).

**In.** BIG REVEAL MOVE 1 of 2, on the end of 'ready,' (the recorded take has no pause there). ONE owner for the move: the scene cameras. S07's own camera tilts up after the copies on the wires (in(sine), 0.40 s, exits ~790 px/s); S08's own camera rises over our rooftop parapet (out(quart), a fixed 2.0 s, enters ~780 px/s: 4 x 300 x 1.3 / 2.0) with the same three wires at the same screen height and spacing. Film adds NO camera (emitted as 'matchcut', not 'camera-continuous', whose extra legs would start inside S07's locked hold). The sun is half behind S07's wall top on the cut and half behind the far skyline on S08's first frame, at the same screen spot.

**Camera.** `cut(ready) -> cut(ready)+2.00` (24.09-26.09 | 23.52-25.52) crane-up (540,1260,1.3) -> (540,960,1.0), out(quart): BIG MOVE 1 (PEAK): a multiplane CRANE over our own parapet, a fixed 2.0 s from the cut, entering at S07's exit speed: the parapet, wires and board plane (depth 0) travel the full 300 world px; rows 3 / 2 / 1 / 0 travel 80 / 55 / 30 / 15 %, so the city slides out from behind the parapet; the sky and the sun (depth 1) do not translate (only the lens zoom 1.3 -> 1.0 applies), and the sun is keyed to stay half-set on the row-0 skyline while it swells, so the horizon never slides against it. Flat-projection numbers (x, y, zoom) below are the depth-0 plane. `cut(ready)+2.00 -> w89-0.25 'Cloudflare'` (26.09-26.54 | 25.52-25.77) hold (540,960,1.0) -> (540,960,1.0), none: the vista at rest (PEAK framing) for a beat. `w89-0.25 'Cloudflare' -> w106 'minutes'` (26.54-32.09 | 25.77-31.09) push-in (540,960,1.0) -> (600,1100,1.15), inOut(sine): BASELINE: a slow dolly push toward the dome rim and the counter board over 'Cloudflare ... forty-five minutes' (~5.5 s); far rows grow less, the sky and sun not at all. `w106 'minutes' -> w108-0.15 'millions'` (32.09-32.78 | 31.09-31.74) hold (600,1100,1.15) -> (600,1100,1.15), none: a beat on the first stamp. `w108-0.15 'millions' -> w108+0.75 'millions'` (32.78-33.69 | 31.74-32.64) pull-back (600,1100,1.15) -> (540,960,1.0), inOut(sine): PEAK again: pull back to the vista on 'millions' as the flood bursts over the whole city (a fixed 0.9 s; peak <= ~17 px/frame). `w108+0.75 'millions' -> cut(day)` (33.69-34.48 | 32.64-33.45) hold (540,960,1.0) -> (540,960,1.0), none: the vista holds for the sunset.

**Beats.**

- `cut(ready)` (24.09 | 23.52): The crane begins (multiplane rise, out(quart), 2.0 s): the wall top drops away and we rise over our own rooftop parapet; the same three wires cross the frame at the same screen height, the S07 copies still pegged on them sliding left; the sun sits half behind the far skyline, where S07's sun went down behind its wall.
- `w81+0.10 'and'` (24.20 | 23.75): 'and hackers': the endless city slides out from behind our parapet row by row (rows 3 -> 0, multiplane), and the sun swells as the vista opens.
- `w83-0.10 'were'` (24.64 | 24.03): 'were': copies on the wires reach the city and flutter down into the streets (paper specks): word spreading.
- `w84-0.10 'already'` (24.82 | 24.15): 'ALREADY': four hooded attempters pop at row-3 doors on the left (55-70 px) and rattle handles (ink rattle marks): before any count, before the fix. Doors never open.
- `w84+0.25 'already'` (25.17 | 24.50): Chimney pots slide by (parallax); rattle marks pop at two more doors.
- `w85-0.10 'trying'` (25.45 | 24.69): 'trying': eight more pop at row-2 doors across the whole width (30-40 px), tapping and rattling; a pigeon flock lifts from our chimney.
- `w87-0.10 'use'` (25.84 | 25.02): 'use it': a scatter of ~40 attempter specks pops along far streets (AttemptStipple).
- `cut(ready)+2.00` (26.09 | 25.52): The crane settles at rest (PEAK framing): the sun, now r260 and half-set on the horizon, gets its two stepped flat glow rings (peach x1.25, then x1.5); Pip lands on the parapet coping (scale 0.75); the last wire copy slides along the wire with Bit on it.
- `end(it)+0.20` (26.52 | 25.66): Two near rattlers rattle again (marks).
- `w89-0.25 'Cloudflare'` (26.54 | 25.77): 'Cloudflare': the dome's bold arc draws from BOTH feet up over ONE far district (~1/5 of the city) and meets at the apex; the Glass step pops inside it (1-frame wave), then the rim strip and glint bars. The slow baseline push begins.
- `w89-0.15 'Cloudflare'` (26.64 | 25.87): With the dome, the counter board rises on our parapet (rise 0.33 s) with label L8 as its header ('Cloudflare · sits in front of / of about 1 in 5 websites') and the shield-dome emblem; the board holds ALONE (header only) until the count starts.
- `w89+0.30 'Cloudflare'` (27.09 | 26.32): Bit hops from the last wire copy onto the board's top edge.
- `w90 'says'` (27.29 | 26.72): 'says': the watchtower rises at the dome's right foot, silhouetted against the big sun (its cabin dark).
- `w91 'that'` (27.61 | 26.93): 'that': the searchlight switches on (flat cream cone, fixed opacity) and sweeps over the glass (sweep clamped: the cone stays below screen y 600).
- `w92 'once'` (27.77 | 27.15): 'once': glint bars sweep once across the new glass; a far window grid winks.
- `w94 'was'` (28.05 | 27.47): 'it was': two near rattlers rattle again; Pip glances at the empty board.
- `w95+0.15 'announced'` (28.34 | 27.84): 'announced': the count STARTS on the board: a start flag pops at its left with the note L9a ('counted from the / public announcement' + its unit line 'attempts, not break-ins'), and the first hand-drawn tally gate strokes on to its right (5 ink bars, 0.12 s). No digits anywhere: the stamps are the only numbers.
- `end(announced)+0.10` (28.74 | 28.20): The board's footer fine print L9b pops ('Matthew Prince, Cloudflare CEO, on X / Cloudflare's own count').
- `w96 'they'` (28.86 | 28.30): 'they saw': the first tiny attempters appear at the dome's rim tapping the glass (ripple arcs: seen, never getting in); a second tally gate strokes on.
- `w98 'tens'` (29.23 | 28.67): 'tens': three more gates stroke on (0.1 s apart); the searchlight crosses the dome's crown.
- `w100 'thousands'` (29.82 | 29.20): 'thousands': twenty more rim attempters tap in a ripple; two more gates; the near rattlers keep rattling (uncounted: outside the dome).
- `w102 'hacking'` (30.45 | 29.76): 'hacking': the searchlight sweeps back, catching groups at the rim (seen; nothing is blocked, nobody gets in).
- `w103 'attempts'` (30.86 | 30.11): 'attempts': two near rattlers give up on a door and hop to the next; a gate strokes on.
- `w104 'in'` (31.23 | 30.42): 'in': rim attempters tap again (ripple arcs).
- `w105-0.05 'forty-five'` (31.43 | 30.55): 'forty-five': the sun's glow rings pop off and the sun hops up 150 px (centre 850, top 590) and becomes a clock: 4 ink quarter ticks pop, then ONE minute hand sweeps a peach 3/4 wedge once (MinuteWedge, 0.6 s) and stops with a tick on 'minutes'.
- `w106-0.08 'minutes'` (32.02 | 31.01): 'minutes': STAMP 1 slams onto the board: L10 'first 45 min: tens of thousands' (ink ring 0.13 s, print 2.6x -> 1.0x in 0.27 s).
- `w106+0.25 'minutes'` (32.34 | 31.34): The stamp's ink ring pops off; rim attempters tap (ripples).
- `end(minutes)+0.05` (32.59 | 31.56): Comma pause: the clock overlay pops off; the sun sinks back onto the horizon and its glow rings pop back on; a gate strokes on.
- `w108-0.15 'millions'` (32.78 | 31.74): 'millions': BURST: the attempters multiply into a dense stipple crowd (hundreds, 1-frame burst) across the WHOLE city, inside and outside the dome; the camera pulls back to rest (0.9 s, in-out sine): the vista returns, PEAK framing for the payoff.
- `w108-0.08 'millions'` (32.85 | 31.81): STAMP 2 slams onto the board: L11 'millions · within a day'.
- `w108+0.35 'millions'` (33.28 | 32.24): A second stipple wave fills the far rows; more rattlers crowd row 3.
- `w109 'within'` (33.53 | 32.48): 'within': sunset step 1 on the word (the glow rings pop off, the sun drops to centre 1130); the sky starts its STEPPED flat tween golden -> sage dusk (5 uniform steps over 0.75 s, no wipe edge); windows pop peach across the city from the horizon outward.
- `w109+0.25 'within'` (33.78 | 32.73): GAG: Pip folds his ears over his eyes (ears-cover).
- `w111 'day'` (34.13 | 32.92): 'day': sunset step 2 (gone behind the horizon row at screen x 700, exactly where S09's sun will rise); the searchlight keeps sweeping.
- `cut(day)-0.15` (34.33 | 33.30): Dusk idle before the cut: the stipple flickers; Pip switches to sit-front (expression worried).

**Sky keys.** cut(ready) golden; w109 'within' #A0C7B5 (wipe snap); w109+0.15 'within' #94BDAA (wipe snap); w109+0.30 'within' #88B3A0 (wipe snap); w109+0.45 'within' #7CA995 (wipe snap); w109+0.60 'within' dusk (wipe snap). Captions: ink throughout.  
**Sun.** From S07 (half behind its wall top) it is half behind the far skyline at (640,1021) r110 on the cut, swells to r260 during the crane and settles half-set on the horizon at (700,1000) with two stepped flat glow rings (the film's peak sun). It lives in the sky layer: the baseline push leaves it in place. On 'forty-five' it hops up 150 px (rings off) so the whole clock face reads, sweeps the 3/4 wedge once, sinks back (rings on) and sets in two steps on 'within' / 'day' at screen x 700: the film's one sunset.  
**Pip.** Scale 0.75 (~72 px: the peak's tininess; the board and the flood are the subject). Lands on the parapet coping as the crane settles; glances at the board. GAG: ears-cover on 'within' (after the burst and the stamp, not stacked on them); sit-front worried in the dusk. Walks into S09.  
**Bit.** rides the last wire copy, then hops onto the counter board's top edge and watches the count (20 px on screen).
**Labels.** L8 'Cloudflare · sits in front of about 1 in 5 websites' on w89-0.15 'Cloudflare'; L9a 'counted from the public announcement · attempts, not break-ins' on w95+0.15 'announced'; L9b 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count' on end(announced)+0.10; L10 'first 45 min: tens of thousands' on w106-0.08 'minutes'; L11 'millions · within a day' on w108-0.08 'millions'.
**Captions** (highlight in brackets): and hackers were / already trying to use it. [already] | Cloudflare says that / once it was announced, [Cloudflare] | they saw / tens of thousands [tens of thousands] | of hacking attempts in / forty-five minutes, [forty-five minutes,] | and millions / within a day. [millions]  
**Sound.** whoosh_soft cut(ready); handle_rattle w84-0.10 'already'; door_knock w85-0.10 'trying'; light_shimmer cut(ready)+2.00; pencil_scratch_long w89-0.25 'Cloudflare'; pop_low w89-0.15 'Cloudflare'; pop_low w90 'says'; switch_toggle w91 'that'; click_light w95+0.15 'announced'; pencil_scratch_short w95+0.15 'announced'; counter_ticker w105-0.05 'forty-five'; pop_low w106-0.08 'minutes'; handle_rattle w108-0.15 'millions'; crowd_murmur w108-0.15 'millions'; pop_low w108-0.08 'millions'; whoosh_soft w109 'within'; low_swell w109 'within'.
**Life:** 85 events = 8.2/s on the take, 8.6/s on the estimate.

### S09 Every single server (cut(day) -> cut(server @0.8); 34.48-39.63 | 33.45-38.54)

*VO:* "But even with the fix out, somebody still has to install it on every single server."  
*ToD:* dusk->dawn (the day relight arrives with S10's tram wipe). *In:* matchcut. *Reuses:* S09 (v1) sunrise at the set point (the night beat is cut); S10 (v1) Part A install + hidden match-cut + Part B pull-back. *Sets:* StoopStreet (dusk -> dawn: World sky key + the set's dawnAt peach band); TerraceHill (hill mode, dawn light; people: both standers, the bollard moved right).  
*Scale tier:* baseline in Part A; PEAK 3 for the pull-back landing + the >= 0.8 s still vista (~1.5 s).

STORY PEAK 3/3 (Arcane scale, Part B only). Part A: Stoop Street at the end of the night: the fix is ALREADY there (the makers' cart parked by the stoop since yesterday, a crate of new locks on the top step); at dawn its lid pops and the cart's 'still fixing...' sign becomes 'fixed!'. Then a hard cut close on door #4: one keeper installs ONE new lock. Part B: a hidden match-cut on that door, then the camera pulls back and we stand in a street looking UP a whole hillside of identical PHP houses climbing in terraces to the ridge, and the vista HOLDS: one ticked tag among hundreds of empty check boxes.

**Frame.** Part A1 = StoopStreet wide: camera (560,1020) zoom 1.0 -> 1.03 (hero cornice world 640 -> screen 580-569). Makers' cart parked on the pavement by the stoop (~(520,1400): screen ~(500,1340)), its sign hanging on its side; the crate of new locks on step 2's tread at (395,1226) (screen (375,1166)). Part A2 (hard cut) = door #4 close (330,900) zoom 1.5, held STILL (cornice at screen 570, lock4 at (540,1305) 51 x 63, the crate at screen (637,1445), the keeper beside the stoop x 430-560 world -> screen 690-885). Pip on step 2's tread (300,1230), scale 1.2. Part B = TerraceHill hill mode: hidden match at TERRACE.matchCam (540,1407) zoom 6 (house #4's lock 8.5 x 10.5 -> 51 x 63 at screen (540,1305); Bit on the door frame (545,1452) 3 px -> 18 px at (570,1230); cornice line at screen 570), then the pull-back to rest (540,960,1.0): rows climb to the ridge ~700, ~650 doors before the haze bands; rows pop as the caption floor (screen y 570) passes their tops. Near layer in SCREEN space: Pip's bollard at (870,1460) (clear of TERRACE.walkers' right stander at x 700; both standers stay), the snail with Bit (14 px) on top of the bollard. Fixed door: TERRACE.fixedGlow + TERRACE.flag. Sun hidden behind the ridge, cresting at TERRACE.sun (700,720) r150 (top 570). No label on the reveal.

**In.** In the sentence pause after 'day.': S08's sun has just set at screen (700,1000); S09 opens on Stoop Street still in the DUSK (sage sky, lamp glows on) with camera (560,1020) zoom 1.0, so the street's vanishing point STOOP.vp (720,1060) sits at exactly that screen point. The dusk holds through 'But even' (>= 1.5 s of dusk in all), then the dawn wipes up on 'with' and the sun RISES there: the next day.

**Camera.** `cut(day) -> cut(out)` (34.48-36.08 | 33.45-35.25) push-in (560,1020,1.0) -> (560,1020,1.03), inOut(sine): a gentle 3% breath on the dusk street (the VP stays within 5 px of the set point). `cut(out) -> w120-0.05 'has'` (36.08-36.91 | 35.25-36.05) hold (330,900,1.5) -> (330,900,1.5), none: HARD CUT in the comma pause on 'somebody' (a rhythm cut, not a third big move): door #4 close, held STILL so the hidden cut that follows is between two frames at rest. `w120-0.05 'has' -> w126+0.05 'single'` (36.91-38.55 | 36.05-37.38) pull-back (540,1407,6.0) -> (540,960,1.0), reveal-from-rest (log zoom, anchored): BIG REVEAL MOVE 2 of 2: one door becomes a hillside of doors. Starts FROM REST with zero initial slope (MOTION.camera.reveal: sine ramp 25 %, cruise, soft landing 35 %), zoom eased in log space and ANCHORED on house #4's lock (world (540,1464.5)), released gradually from screen (540,1305) to its rest position (540,1464.5). It lands on 'single' so the finished hill holds still >= 0.8 s before the tram. Too fast for flat ink by the strobe rule (~76 px/frame at the cruise on the take, ~94 on the faster estimate): an explicit, allow-listed exception (cameraSpeedAllow), the one big reveal of the film. `w126+0.05 'single' -> cut(server @0.8)` (38.55-39.63 | 37.38-38.54) hold (540,960,1.0) -> (540,960,1.0), none: PEAK 3 holds STILL (no settle drift) until the tram wipe: >= 0.8 s on the take.

**Beats.**

- `cut(day)` (34.48 | 33.45): MATCH-CUT on the set point: Stoop Street under the last of the dusk (sage sky, lamp glows ON, a few windows lit), the VP exactly where the sun just set. The makers' cart is already parked by the stoop with the workshop's 'still fixing...' sign hanging on it; a crate of new locks already stands on the top step, lid shut: it arrived last night.
- `w112 'But'` (34.72 | 33.73): 'But': Pip (walking in from the left edge since the cut) hops up onto step 2's tread beside the crate.
- `w112+0.12 'But'` (34.84 | 33.85): A last lit window in the row pops off; a lamp glow flickers once (one step, no blink).
- `w113 'even'` (34.98 | 33.94): 'even': two more windows pop off, right to left; the pigeons on the lamp post shuffle in their sleep.
- `w114 'with'` (35.15 | 34.29): 'with': DAWN: the sky wipes UP from the horizon, dusk sage -> day sky (tod 'dawn', 0.4 s); the sun RISES at the VP (the film's one sunrise, at the point it set); StoopStreet's peach dawn band pops on the horizon and peach rim strips pop on the facades' sun side, all below screen y 600; the lamp glows pop off as the wipe passes them.
- `w115 'the'` (35.30 | 34.51): 'the': the pigeons wake and hop; Pip stretches (a little shake).
- `w116 'fix'` (35.45 | 34.62): 'fix': the crate's lid pops open: new locks inside (sage, cream check tags).
- `w117 'out'` (35.80 | 34.93): 'out': the check tags pop up out of the crate (0.04 s stagger); on the cart's sign 'still' is struck through and 'fixed!' is scribbled beside it (sign joke J5, the payoff of J3 / J4: the fix IS out, since yesterday); the maker pushes the cart off toward the VP (makers ship, they don't install).
- `cut(out)` (36.08 | 35.25): HARD CUT (comma pause, on 'somebody'): door #4 close, held still; the keeper rises in beside the stoop (rise 0.33 s).
- `w118+0.05 'somebody'` (36.23 | 35.43): Door #4's old lock drops off with a clunk, Bit riding it down, hopping off and scurrying up the door frame.
- `w118+0.25 'somebody'` (36.43 | 35.63): Pip lifts a new lock from the crate with his trunk (hold pose, prop NewLockIcon).
- `w119 'still'` (36.70 | 35.87): 'STILL': GAG: Pip hands the lock to the keeper on the word; the new lock pops onto door #4 (+0.06 s, overshoot).
- `w119+0.10 'still'` (36.80 | 35.97): Its check strokes on (0.17 s): ONE door fixed (the stroke finishes across the hidden cut, on house #4's lock).
- `w120-0.05 'has'` (36.91 | 36.05): HIDDEN MATCH-CUT on door #4 into the hillside (lock, Bit on the door frame, door, browser window and cornice line hold their screen position and size at zoom 6); both frames are at rest; the pull-back starts from rest (anchored on the lock, zero initial slope).
- `w121 'to'` (37.22 | 36.26): 'to install': row 0's neighbouring doors resolve, each with the same old lock and a plaque; the keeper walks from door #4 toward door #5 on a short dotted path (one at a time).
- `w122 'install'` (37.38 | 36.38): 'install': Pip hops onto the screen-space bollard at the near right (constant size, scale 0.75).
- `w122+0.25 'install'` (37.63 | 36.63): The keeper's dotted path draws on behind him; door #3's plaque glints.
- `w123 'it'` (37.84 | 36.76): 'it on': rows 1-3 pop up behind as the caption floor passes their tops (0.05 s stagger).
- `w125-0.05 'every'` (38.16 | 36.96): 'every': the upper terraces tile outward toward the ridge; retaining walls and zig-zag stairs draw on.
- `w126 'single'` (38.51 | 37.33): 'single': door #4's check flag pops up above the row-0 cornice (the ONE fixed door) with one ink ring pulse; its tag is the only TICKED one.
- `w126+0.10 'single'` (38.60 | 37.43): The vista has landed (still from here to the tram): EMPTY cream check-box tags (the crate's check tag, unticked) pop over EVERY other door in a wave from row 0 toward the ridge (0.6 s): one tick among hundreds of empty boxes, still to do.
- `w127 'server'` (38.87 | 37.68): 'server': the sun crests the ridge on the word (r150, peach rims on the ridge houses); the terraces extend at the frame's side edges.
- `w127+0.25 'server'` (39.12 | 37.93): The keeper reaches door #5 and kneels (his dotted path behind him); far-row window dots twinkle.
- `w127+0.35 'server'` (39.22 | 38.03): The snail crawls along the top of Pip's bollard, Bit (14 px) riding its shell (screen-space near layer: the slowest ride on the hill).
- `cut(server @0.8)-0.30` (39.33 | 38.24): Pip lets out a long sigh (sit-back squash pulse +0.08 -> 0), facing the hill; the tram's nose enters at the left edge.

**Sky keys.** cut(day) dusk; w114 'with' dawn (wipe up, 0.4 s); w120-0.05 'has' dawn. Captions: ink throughout.  
**Sun.** Hidden (set) at the cut; RISES at the VP (700,1000) r110 on 'with' with the dawn wipe (the one sunrise, at the set point); hidden behind the hero facade in the close Part A2; behind the terraces in Part B and crests the ridge at TERRACE.sun (700,720) r150 on 'server'. Hops off behind the tram.  
**Pip.** Part A scale 1.2: hops onto step 2 on 'But', stretches at dawn, lifts a new lock from the crate and hands it to the keeper on 'STILL' (GAG). Part B: hops onto a screen-space bollard at the near right, constant size 0.75 (peak tininess); sighs at the hillside. Rides the tram into S10.  
**Bit.** Part A: rides the dropped old lock and scurries up door #4's frame (he is a match object of the hidden cut, 18 px on screen); Part B: rides the snail's shell on Pip's bollard (screen space, 14 px) (18 px on screen).
**Captions** (highlight in brackets): But even with / the fix out, [fix out,] | somebody still has / to install it on [still] | every single server. [every single server.]  
**Sound.** whoosh_soft cut(day); light_shimmer w114 'with'; pop_low w116 'fix'; pencil_scratch_short w117 'out'; pop_mid cut(out); lock_click w118+0.05 'somebody'; pop_mid w119+0.06 'still'; ding w119+0.10 'still'; whoosh_soft w120-0.05 'has'; bubble_pop w126 'single'; pop_high w126+0.10 'single'; light_shimmer w127 'server'.
**Declined.** label L12 'Updating WordPress won't fix it': dropped: the voice never says WordPress (the script removed every WordPress cue), so a brand label introduces a new idea; on the PEAK 3 reveal it competes with 'every single server', and in Part A the crate's spot is under the platform UI in the close framing (and it would hold < 1.5 s in the wide). Suggested for the post's caption or a pinned comment instead (FS extra fact 5).
**Life:** 61 events = 11.8/s on the take, 12.0/s on the estimate.

### S10 Half on versions too old (cut(server @0.8) -> cut(anymore); 39.63-45.62 | 38.54-44.26)

*VO:* "Plus something like half of PHP sites run versions so old they're not officially supported anymore."  
*ToD:* day. *In:* foreground-wipe. *Reuses:* S12 (v1), re-staged: about half, rough-estimate label, the makers hand out the support tags. *Sets:* OldQuarter (day, door height; people: only the street-gap walker; furniture: no planter).  
*Scale tier:* baseline.

The Old Quarter at day, seen from DOOR HEIGHT: a frontal row of three sites (two six-storey ones flanking a shorter one) and a side street showing a second row of nine and the city beyond. Something like half of these run an old PHP: only their elephant plaques age (the buildings are fine). The people who make PHP hand out the official 'supported' tags from their cart and visibly skip the old ones.

**Frame.** OLD_QUARTER anchors at rest: eye 1150, bases 1300, kerb 1500; siteL (30,690,315) current, siteM (360,820,280) OLD, siteR (740,700,310) current; the second row of nine (5 OLD, alternating) above siteM and in the gap (640-740); hanging plaques at (300 / 590 / 800, 1190); sun OLD_QUARTER.sun (500,690) r110 over siteM. Pip on OLD_QUARTER.bollard (700,1450). The makers' cart rolls along the frontage on the stoop line (~y 1330), behind the bollard and the sign. An A-frame notice sign (sets request: OldQuarter `noticeSign` slot) on the left pavement, world (125-445, 1262-1462) -> screen (104-440, 1256-1466) at the 1.05 push, carries L13 in five lines at 30 px (widest 271 px). OldQuarter people: only the street-gap walker (the left stander at (64,1478) would sit behind the sign); furniture: the bike only (no planter at (420,1486)). siteM's browser window (420,920,190,120) shows the progress bar that stalls on 'anymore'.

**In.** Late in the sentence pause after 'server.' (the cut = the wipe's centre at 80 % of the pause, so S09's vista has held still >= 0.8 s): a tram (teal body, mintPale windows, peach lamps; S09's exported Wiper) crosses the near foreground left to right and wipes the hillside away, revealing an empty street at door height in FULL DAY (the day relight arrives with the wipe). Pip rides its roof; the sun hops across behind it.

**Camera.** `cut(server @0.8) -> cut(server @0.8)+0.25` (39.63-39.88 | 38.54-38.79) hold (540,960,1.0) -> (540,960,1.0), none: the tram wipe does the work. `cut(server @0.8)+0.25 -> w132 'of'` (39.88-41.15 | 38.79-39.59) push-in (540,960,1.0) -> (540,980,1.05), inOut(sine): one gentle 5% push from rest as the sites land; the plaques are big enough to read without more. `w132 'of' -> cut(anymore)` (41.15-45.62 | 39.59-44.26) hold (540,980,1.05) -> (540,980,1.05), none: locked for the flips, the cart and the stall (no dive: the S11 cut is a hard cut).

**Beats.**

- `cut(server @0.8)` (39.63 | 38.54): Tram wipe (centre on the cut, late in the pause): a tram crosses the near foreground and wipes the hillside away; behind it an empty street at door height in full day; Pip rides the tram roof.
- `w128+0.10 'Plus'` (39.80 | 38.75): Pip hops off the tram roof onto the bollard.
- `w129-0.10 'something'` (40.09 | 38.76): 'something': siteL pops up from the ground (scaleY 0 -> 1.06 -> 1), then siteM (+0.10), siteR (+0.20).
- `w129 'something'` (40.20 | 38.86): The sun lands over siteM on the word (its hop from S09 rode the tram wipe).
- `w130 'like'` (40.51 | 39.21): 'like': the nine second-row buildings pop up behind (0.04 s stagger); one OLD second-row door already carries a small sage tag tied to its handle (a host's own patch: a pre-existing detail for pausers, never animated).
- `w131 'half'` (40.76 | 39.35): 'HALF': the sun draws one ink spoke and HALF its disc pops cream with an ink rim arc (a 1/2 pie, the rhyme of S03's 7/10).
- `w131+0.20 'half'` (40.95 | 39.55): Pip's ears perk at the half-cream sun.
- `w133-0.10 'PHP'` (41.30 | 39.58): 'PHP': hanging plaque signs swing out on every site (pendulum).
- `w133+0.15 'PHP'` (41.55 | 39.83): Label L13 rises on the A-frame notice sign on the left pavement (0.2 s rise), after the pie and the plaques.
- `w134-0.30 'sites'` (41.60 | 39.98): The half pie settles (its spoke retracts); a second-row window lights.
- `w134 'sites'` (41.91 | 40.28): 'sites': the walker crosses the street gap; Pip looks up at siteM's plaque.
- `w135-0.05 'run'` (42.24 | 40.57): 'run': siteM's plaque paper-flips to the OLD version (tan, chipped).
- `w136 'versions'` (42.49 | 40.83): 'versions': five second-row plaques flip old (alternating, 0.04 s apart); a puff of dust from each.
- `w137 'so'` (42.88 | 41.18): 'so': a cobweb draws across the old plaque's corner (Bit gets caught in it: rewatch spot); dust specks pop (+0.12 s).
- `w138 'old'` (43.20 | 41.32): 'old': the old elephant emblem leans on a tiny cane (cane pops, emblem tilts 12 deg).
- `w138+0.15 'old'` (43.35 | 41.47): The makers' cart (from S09, its sign now 'fixed!') rolls in from the left along the frontage, a maker pushing, a satchel of support tags on it.
- `w139 'they're'` (43.60 | 41.72): "they're": the old emblem's ear droops; a dust speck drifts down.
- `w140 'not'` (43.85 | 41.94): 'not': the cart rolls on toward siteL; the maker pulls a tag from the satchel (each tag stamped with the elephant mark).
- `w141 'officially'` (44.02 | 42.15): 'officially': the maker tosses a sage support tag onto siteL's plaque (tick).
- `w141+0.30 'officially'` (44.33 | 42.45): The cart rolls PAST siteM without stopping: the next toss arcs visibly OVER siteM's old plaque (0.35 s flight).
- `w142 'supported'` (44.39 | 42.91): 'supported': the tag lands on siteR's plaque (tick); tiny tags pop onto the current second-row plaques in a wave that skips the old ones.
- `w142+0.10 'supported'` (44.49 | 43.01): GAG: Pip goes trunk-up 'hey!' at siteM's plaque (expression wide): it was skipped.
- `w143 'anymore'` (44.98 | 43.40): 'anymore': the last focal beat: siteM's browser window starts an update, a progress bar that STALLS at ~10%, its loading ring spinning; the cart rolls out at the right edge.
- `end(anymore)-0.10` (45.28 | 43.88): The old emblem's cane wobbles; the loading ring keeps spinning.

**Sky keys.** cut(server @0.8) day (wipe snap). Captions: ink throughout.  
**Sun.** Screen-space (500,690) r110 over siteM, landing on 'something' (its hop rode the tram wipe). On 'HALF' it becomes a 1/2 pie (one spoke, one cream half with an ink rim arc), no pulse; solid again by 'sites'. No hop at the end: S11's sun is simply already in its slot (hard cut).  
**Pip.** Scale 1.2 on the bollard. Looks up at siteM's plaque on 'sites'. GAG: trunk-up 'hey!' after the support tag has visibly skipped the old site. Hops toward the right edge at the end (into S11).  
**Bit.** caught in the old plaque's cobweb (16 px on screen).
**Labels.** L13 'Rough estimate from W3Techs data · only sites that show their version · some hosts patch old versions themselves' on w133+0.15 'PHP'.
**Captions** (highlight in brackets): Plus something like / half of PHP sites [half] | run versions so old | they're not officially / supported anymore. [not officially]  
**Sound.** fg_wipe cut(server @0.8); pop_mid w129-0.10 'something'; pop_high w130 'like'; pop_low w131 'half'; paper_flip w133+0.15 'PHP'; pop_mid w133-0.10 'PHP'; card_flip w135-0.05 'run'; card_flip w136 'versions'; pencil_scratch_short w137 'so'; pop_low w138 'old'; whoosh_soft w138+0.15 'old'; click_light w141 'officially'; click_light w142 'supported'; alert_ping w142+0.10 'supported'; typing_tick w143 'anymore'.
**Life:** 58 events = 9.7/s on the take, 10.1/s on the estimate.

### S11 Just turn it off (cut(anymore) -> cut(everything); 45.62-52.16 | 44.26-50.91)

*VO:* "Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything."  
*ToD:* day. *In:* cut. *Reuses:* S11 (v1) close-up part. *Sets:* GovernmentPlaza closeup (PLAZA.closeup) with BrowserChrome progress + ring in the govB window slot.  
*Scale tier:* baseline.

Government Plaza seen close on the Domed Capitol's browser window: a progress bar that can't finish, and the official advice taped up inside the window like a shop notice. Then the sun is pressed, the shutter comes down clean, and a little sticky note on the closed shutter makes the tech-support joke quietly, in sync with the voice.

**Frame.** PLAZA.closeup: camera (518,826) zoom 1.6 -> 1.66, then the lean to (522,832) 1.71 (govB's lantern stays at screen >= 563; the window fills screen x 374-707, y 1190-1424 at 1.6). Pip on the sill's left end (world (440,1122) -> screen ~(415,1434)), scale 1.2. L14 is a paper notice taped INSIDE the lower left of govB's browser screen (world (424-612, 1040-1107) -> screen ~(384-696, 1302-1427)): between the cornice and the drum there is no room, and on the glass it is covered naturally when the shutter comes down. Sticky note (J6) on the closed shutter's lower right, screen ~(560-700, 1290-1400), lettering >= 24 px. Sun screen-space (870,700) r110 in the gap right of the dome. (The 2.3x insert asked for at 'which' was not taken: above ~1.7x the caption band lands on govB's dome and drum and the sill and Pip drop under the bottom UI; the scene keeps one framing, a 3% lean and >= 6 events/s instead.)

**In.** HARD CUT in the sentence pause after 'anymore.' (no dive, no window match: diving from the old site's stalled window into govB's would make them the same window and imply the government sites ran unsupported PHP, which nothing in the script says). We land on govB's browser window close (the plaza; we don't say so yet): its own bar is just 'can't update yet'. The sun is simply already in the gap right of the dome.

**Camera.** `cut(anymore) -> w148 'if'` (45.62-47.09 | 44.26-45.70) push-in (518,826,1.6) -> (518,826,1.66), inOut(sine): a gentle 4% push from rest after the hard cut (~1.45 s). `w148 'if' -> cut(off)` (47.09-49.52 | 45.70-47.99) hold (518,826,1.66) -> (518,826,1.66), none: locked: the tension comes from the crawling bar, not the camera. `cut(off) -> end(everything)+0.05` (49.52-51.95 | 47.99-50.69) push-in (518,826,1.66) -> (522,832,1.71), inOut(sine): a slow 3% lean into the joke, from the comma pause after 'off,' (the lantern stays at screen >= 563). `end(everything)+0.05 -> cut(everything)` (51.95-52.16 | 50.69-50.91) hold (522,832,1.71) -> (522,832,1.71), none: hold for the exits.

**Beats.**

- `cut(anymore)` (45.62 | 44.26): HARD CUT (sentence pause) to govB's browser window, close: its address pill is a progress bar at 8%, the loading ring spinning; the sun already sits in the gap right of the dome; a gentle 4% push begins.
- `w144 'Even'` (45.85 | 44.54): 'Even': Pip lands on the sill's left end (from his hop at the end of S10).
- `w145 'the'` (46.03 | 44.89): 'the': the loading ring hiccups; a pigeon on the cornice shuffles.
- `w146 'FBI'` (46.20 | 45.00): 'FBI': the progress bar's fill edge flickers without moving.
- `w146+0.25 'FBI'` (46.45 | 45.25): Pip's ear flicks toward the window.
- `w147 'said'` (46.73 | 45.48): 'said': label L14, a paper advisory notice 'FBI · NSA / UK NCSC · CERT-EU', is taped up INSIDE the lower left of the browser screen (4 tape strips pop 0.04 s apart), like a notice in a shop window.
- `w148 'if'` (47.09 | 45.70): 'if': Pip looks up at the notice.
- `w149 'you'` (47.23 | 45.79): 'you': the snail's shell appears at the sill's right edge.
- `w150 'can't'` (47.31 | 45.95): "can't": the bar steps 8% -> 9% and stalls; the ring keeps spinning.
- `w151 'update'` (47.58 | 46.24): 'update': the snail crawls onto the sill from the right (running gag: slow).
- `w152 'yet'` (47.99 | 46.65): 'yet': the bar twitches back 9% -> 8%; the ring hiccups.
- `end(yet)+0.05` (48.20 | 47.01): Pip glances from the bar up to the sun.
- `w153-0.10 'just'` (48.27 | 47.11): 'just': a power glyph inks onto the sun (callback to S01).
- `w154 'turn'` (48.69 | 47.32): 'turn': the sun is PRESSED on the word (SunPress: squash 0.88, ripple ring).
- `w155 'it'` (48.91 | 47.53): 'it off': govB's shutter rolls down CLEAN over the window (0.16 s + 6 px bounce), covering the stalled bar and the taped notice (L14 out: it did its job on 'FBI').
- `w156 'off'` (49.06 | 47.64): 'off': lights out: govB steps one palette step darker (1-frame cascade top to bottom).
- `w156+0.14 'off'` (49.20 | 47.78): The padlock pops on the shutter and the lettered 'back soon' tag swings in with it (pendulum): the S01 tag, now explained.
- `end(off)+0.05` (49.45 | 47.94): Bit hops onto the padlock's shackle; the snail pulls into its shell at the clunk.
- `w157 'which'` (49.63 | 48.09): 'which': the slow lean-in starts; a pigeon lands on the shutter box.
- `w158 'is'` (49.73 | 48.22): 'is': the 'back soon' tag twirls once in a breeze.
- `w159 'basically'` (49.99 | 48.40): 'basically': the snail pokes one antenna out, then the other.
- `w160-0.05 'tech'` (50.19 | 48.98): 'tech': a cream sticky note flutters in on the breeze and slaps flat onto the CLOSED shutter (0.12 s squash): 'Turn it off and on again' (sign joke J6), in sync with the voice.
- `w161 'support's'` (50.55 | 49.24): "support's": the note's corner curls once; Bit looks up at it from the shackle.
- `w161+0.25 'support's'` (50.80 | 49.49): A pigeon on the cornice preens; the tag stills.
- `w162 'answer'` (51.03 | 49.59): 'answer': GAG: Pip turns toward the sun and does a tiny shrug (shrug pose, 0.5 s), after the note has landed. Nothing bigger: the joke is in the voice, said straight.
- `w163 'to'` (51.34 | 49.94): 'to': the padlock glints; the pigeon on the shutter box hops.
- `end(to)-0.05` (51.66 | 50.01): Bit taps the padlock's shackle.
- `w164+0.05 'everything'` (51.76 | 50.11): 'everything': on the sticky note, 'and on again' gets one ink strike-through (0.15 s): just turn it off. That is the whole joke on screen. The note's corner flutters after it.
- `end(everything)+0.05` (51.95 | 50.69): Pip hops off the sill toward the lens; the snail peeks out of its shell.
- `cut(everything)-0.10` (52.06 | 50.81): The 'back soon' tag sways; the pigeon flaps off the shutter box.

**Sky keys.** cut(anymore) day. Captions: ink throughout.  
**Sun.** Screen-space (870,700) r110 in the gap right of the dome, already there on the hard cut; the power glyph inks on on 'just'; PRESSED on 'turn'. No hop at the end (S12 is a hard cut).  
**Pip.** Scale 1.2 on the sill. Ear flick, looks at the notice, glances at the sun. GAG: ONE tiny shrug on 'answer', after the note has landed (no tag-tap). Hops off at the end into S12.  
**Bit.** on the padlock's shackle (he rides nothing here; he hops on when the padlock pops) (16 px on screen).
**Labels.** L14 'FBI · NSA · UK NCSC · CERT-EU' on w147 'said'.
**Captions** (highlight in brackets): Even the FBI said if / you can't update yet, [FBI] | just turn it off, / which is basically [turn it off,] | tech support's answer / to everything.  
**Sound.** pop_mid cut(anymore); typing_tick w145 'the'; pop_mid w147 'said'; typing_tick w150 'can't'; typing_tick w152 'yet'; pencil_scratch_short w153-0.10 'just'; switch_toggle w154 'turn'; pop_low w155 'it'; power_off_thunk w156 'off'; lock_click w156+0.14 'off'; paper_flip w160-0.05 'tech'; pencil_scratch_short w164+0.05 'everything'; whoosh_soft end(everything)+0.05.
**Declined.** an internal hard cut at 'which' to a ~2.3x insert on the shutter, note, tag and Pip: above ~1.7x the caption band falls on govB's dome and drum (no sky left for the captions) and the sill with Pip drops under the bottom UI; instead the scene got a hard cut in (no landing creep), a 3% lean into the joke, one focal event per word and >= 6 events/s.
**Life:** 46 events = 7.0/s on the take, 6.9/s on the estimate.

### S12 Before there was even a fix (the rewind) (cut(everything) -> END; 52.16-55.36 | 50.91-54.59)

*VO:* "And some of those governments did it before there was even a fix."  
*ToD:* day. *In:* cut. *Reuses:* S11 (v1) hard cut to the S01 frame; new: the rewind (replaces the v1 S13 un-build as the loop device). *Sets:* GovernmentPlaza (rest; the S01 state played backwards).  
*Scale tier:* PEAK 1 framing as the closing beat (3.2-3.7 s), camera <= 3%.

Government Plaza again, as the shutdown left it: some buildings shuttered, padlocked and tagged, one half shut, one still lit, the far civic skyline dark. Then the film REWINDS like a tape: the sun's button turns into a rewind glyph and S01 plays backwards, stepped, to one step before the press. The replay (the loop) then shows them doing it, before there was even a fix.

**Frame.** GovernmentPlaza at the S01 framing, zoom 1.03 at the cut easing to rest (540,960,1.0) on the last frame. State at the cut: govA + govB shuttered / padlocked / tagged and one step darker, govC's window half shut, govD lit, govA / govB / govC screens dark, farCivic dark, the lanterns off, citizens with phones up; the sun at PLAZA.sun (720,900) r155 with the power glyph. End state (= frame 0): every shutter UP, every screen lit EXCEPT govB's, which is mid power-off (a bright horizontal line); lanterns on; farCivic lit; the sun at the bottom of its SunPress (0.88) with the ripple ring at its emission radius; Pip sit-back on PLAZA.pip; Bit on PLAZA.bit.

**In.** HARD CUT in the sentence pause after 'everything.' to the S01 framing (zoom 1.03), in the state the shutdown left it (snappier than a pull-back; it answers the hook). The sun is simply already in its plaza slot (hard cut: no hop).

**Camera.** `cut(everything) -> END` (52.16-55.36 | 50.91-54.59) pull-back (552,972,1.03) -> (540,960,1.0), inOut(sine): ONE slow 3% pull-back from the hard cut to the last frame, arriving at zero velocity = frame 0's camera (S01's sine push starts from rest): no push-and-return bounce; the rewind reverses S01's push.

**Beats.**

- `cut(everything)` (52.16 | 50.91): HARD CUT (sentence pause) back to the plaza, framed at 1.03, in the state the shutdown left it: govA + govB shuttered, padlocked and tagged and one step darker, govC half shut, govD lit; govA / govB / govC screens dark; the far civic silhouettes dark; the lanterns off; citizens with phones up; the sun already in its slot with the power glyph. The single slow pull-back to frame 0 begins.
- `w165 'And'` (52.43 | 51.19): 'And': Pip lands on his bollard (from the S11 hop), scale 1.0.
- `w166 'some'` (52.51 | 51.32): 'some': the lettered 'back soon' tags on the closed buildings swing once (0.05 s stagger): these ones did it.
- `w168 'those'` (52.80 | 51.63): 'those': two pigeons land on the dark lamp crossbar.
- `w168+0.20 'those'` (53.01 | 51.83): A citizen points at govB.
- `w169 'governments'` (53.02 | 52.03): 'governments': the citizens lower their phones.
- `w169+0.25 'governments'` (53.27 | 52.28): A pigeon flaps; govA's tag twirls once more.
- `w170 'did'` (53.51 | 52.52): 'did': Pip nods (sit-back squash pulse +0.08 -> 0 over 0.2 s); the padlocks glint at once.
- `w172-0.05 'before'` (53.71 | 52.79): 'before': THE REWIND: the sun's power glyph pops to a bold cream REWIND glyph (two left-pointing triangles: the same 'button' language and weight), and S01 plays BACKWARDS, stepped at ~12 fps like a tape rewind (every pose held 2-3 frames): first the tags swing back up and pop off, then the padlocks pop off.
- `w173-0.05 'there'` (54.02 | 52.99): 'there': Pip's startle hop plays backwards; the lanterns relight (govB's dome lantern, then the lamp); the phones go up and down again, reversed.
- `w174 'was'` (54.23 | 53.22): 'was': the shutters roll UP in reverse order (govC, then govA, then govB, 0.08 s apart: each a reversed slam, stepped), each building popping one step lighter as its shutter clears.
- `w175 'even'` (54.40 | 53.43): 'even': the far civic silhouettes step back to lit, right to left (whole shapes); the pigeons fly back off the crossbar (a reversed landing).
- `w176 'a'` (54.56 | 53.78): 'a': govC's clock-tower window un-collapses (bright line -> lit screen); the walking citizens walk backwards.
- `w177 'fix'` (54.73 | 53.87): 'fix.': govA's browser window un-collapses (line -> lit screen); the rewind glyph pops back to the bold power glyph (the frame-0 state).
- `END-0.55` (54.81 | 54.04): Bit starts walking BACKWARDS along govA's cornice toward his frame-0 spot (0.5 s).
- `END-0.35` (55.01 | 54.24): The last reversed step, ONE STEP BEFORE THE PRESS: govB's screen comes back as a bright horizontal line (mid power-off), and the sun squashes DOWN into its SunPress (0.88), the ripple ring contracting back to the moment it was emitted: the frame-0 state. Everything else is lit, govD too; Pip sit-back on his bollard.
- `END-0.10` (55.26 | 54.49): Caption roll (the loop's caption time): the last page exits up and page 1 'Governments all over / Europe just shut down' rolls in, still 24 px low at the seam.
- `END-0.04` (55.32 | 54.55): Bit arrives on his frame-0 spot on govA's cornice: the LAST motion of the film (no look, no wave, no label): rewatchers find him there in frame 0.

**Sky keys.** cut(everything) day. Captions: ink throughout.  
**Sun.** Already in its plaza slot PLAZA.sun (720,900) r155 with the power glyph at the cut. On 'before' the glyph pops to a bold REWIND glyph (no clock: a backward spin aliases at 30 fps); on 'fix.' it pops back to the power glyph, and in the last reversed step the sun squashes DOWN into its SunPress with the ripple ring at its emission radius: frame 0 releases it.  
**Pip.** Scale 1.0 on his bollard. Nods on 'did'. GAG: his S01 startle hop plays backwards during the rewind. Ends sit-back = frame 0.  
**Bit.** govA's cornice (PLAZA.bit); he walks backwards to his frame-0 spot as the film's last motion (22 px on screen).
**Captions** (highlight in brackets): And some of those / governments did it [did it] | before there was / even a fix. [before]  
**Sound.** whoosh_soft cut(everything); pop_mid w165 'And'; pop_mid w166 'some'; click_light w170 'did'; whoosh_soft w172-0.05 'before'; counter_ticker w172-0.05 'before'; pop_low w174 'was'; click_light w177 'fix'; typing_tick END-0.35.
**Declined.** optional label 'most sites were back within hours to a day': during the rewind the shutters going up mean "earlier", not "back online"; a recovery label here would muddle it.
**Declined.** the Makers' Lane workshop with its blind down visible from the plaza: Makers' Lane is another location and would be a few px in the far city; 'no fix yet' is carried by S06 / S07 ('still fixing...') and the rewind itself.
**Declined.** a clock with hands spinning backwards on the sun: fast spins alias at 30 fps and can read forwards; the rewind glyph + S01's own beats played backwards, stepped like a tape, say 'rewind' unambiguously.
**Life:** 44 events = 13.8/s on the take, 12.0/s on the estimate.

## Life plan (QA gate 2)

| scene | length (rec \| est) | events | events/s (rec \| est) | longest onset gap (rec \| est) | allow-listed holds |
|---|---|---|---|---|---|
| S01 | 4.71 \| 4.21 s | 48 | 10.2 \| 11.4 | 0.37 \| 0.35 s | none |
| S02 | 3.68 \| 3.84 s | 32 | 8.7 \| 8.3 | 0.39 \| 0.31 s | none |
| S03 | 5.78 \| 5.80 s | 59 | 10.2 \| 10.2 | 0.37 \| 0.38 s | none |
| S04 | 2.42 \| 2.18 s | 45 | 18.6 \| 20.6 | 0.33 \| 0.28 s | none |
| S05 | 3.18 \| 2.94 s | 28 | 8.8 \| 9.5 | 0.34 \| 0.31 s | none |
| S06 | 2.21 \| 2.17 s | 22 | 9.9 \| 10.2 | 0.34 \| 0.35 s | none |
| S07 | 2.11 \| 2.39 s | 30 | 14.2 \| 12.6 | 0.33 \| 0.29 s | none |
| S08 | 10.39 \| 9.93 s | 85 | 8.2 \| 8.6 | 0.43 \| 0.43 s | none |
| S09 | 5.15 \| 5.08 s | 61 | 11.8 \| 12.0 | 0.30 \| 0.30 s | none |
| S10 | 5.98 \| 5.72 s | 58 | 9.7 \| 10.1 | 0.35 \| 0.38 s | none |
| S11 | 6.54 \| 6.66 s | 46 | 7.0 \| 6.9 | 0.42 \| 0.41 s | none |
| S12 | 3.20 \| 3.68 s | 44 | 13.8 \| 12.0 | 0.27 \| 0.28 s | none |

No allow-listed holds: the longest gap between beat onsets inside any scene (beat spans counted, scene edges included) is <= 0.43 s on both takes; the dead-run limit is 0.40 s of PIXELS and every beat's motion lasts 0.15-0.5 s, so the renders should clear it. If a render shows a dead run, add an event; do not allow-list it. Camera drift never counts as life. S11 (the joke) is >= 6 events/s by design (the QA counter's error is about +-20 %).

## Declined (on purpose)

- **S09: label L12 'Updating WordPress won't fix it'.** Dropped: the voice never says WordPress (the script removed every WordPress cue), so a brand label introduces a new idea; on the PEAK 3 reveal it competes with 'every single server', and in Part A the crate's spot is under the platform UI in the close framing (and it would hold < 1.5 s in the wide). Suggested for the post's caption or a pinned comment instead (FS extra fact 5).
- **S11: an internal hard cut at 'which' to a ~2.3x insert on the shutter, note, tag and Pip.** Above ~1.7x the caption band falls on govB's dome and drum (no sky left for the captions) and the sill with Pip drops under the bottom UI; instead the scene got a hard cut in (no landing creep), a 3% lean into the joke, one focal event per word and >= 6 events/s.
- **S12: optional label 'most sites were back within hours to a day'.** During the rewind the shutters going up mean "earlier", not "back online"; a recovery label here would muddle it.
- **S12: the Makers' Lane workshop with its blind down visible from the plaza.** Makers' Lane is another location and would be a few px in the far city; 'no fix yet' is carried by S06 / S07 ('still fixing...') and the rewind itself.
- **S12: a clock with hands spinning backwards on the sun.** Fast spins alias at 30 fps and can read forwards; the rewind glyph + S01's own beats played backwards, stepped like a tape, say 'rewind' unambiguously.
- **S08: stamp 2 on 'day'.** It would hold 0.35-0.4 s before the cut (the floor is 1.5 s); it stays on 'millions' with the burst (1.63 s on the take), and the 'within' -> 'day' gap is filled by the five dusk steps, the windows popping peach and Pip's ears-cover.
- **S08: a CineCamera tilt for the crane.** A tilt would put the horizon at screen ~622 at the crane start with a half-set sun in the caption band; the crane is a multiplane rise instead (the sky and sun never translate, the sun is keyed to stay half-set on the row-0 skyline while it swells), and S07's exit move IS a tilt, so the sun is continuous across the cut, half behind S07's wall top and then half behind the far skyline at the same screen spot (640,1021).
- **S09: running the pull-back all the way to the tram.** It would be slower (~39 px/frame) but the hillside would never be still; PEAK 3 needs >= 0.8 s still for 'every single server' to register, so the reveal lands on 'single' and is declared in `cameraSpeedAllow`.

## Requests to other lanes

**sets**

- GovernmentPlaza: `farCivic` far civic skyline in the gap: 6-8 fill-only domes / pediments / clock spires in the two haze tiers, EACH >= 40 px wide, with `civicOffAt` per silhouette (a WHOLE-shape step one fill darker, left to right) and `civicOnAt` (right to left) for the S12 rewind; no window dots needed, no pennants.
- GovernmentPlaza: per-building `screenOffAt` = the CRT collapse (screen -> bright horizontal line -> dot -> dark, 0.15 s) and `screenOnAt` reversed; a frame-0 state where govB's screen IS the bright line; rewind support: shutter `liftAt` (reversed slam, stepped), lights back on (`onAt`, one step lighter), padlock / tag `outAt`; govC partial shutter (stops at 0.5).
- BlueprintStreet: the title-block card at the plan's bottom-right corner (world x 490-910, y 1320-1440) as a label slot (L3 -> L4 paper flip).
- DomeCity: `dome` prop to re-scale the dome to one far district: feet (180,1080) and (600,1080), apex (390,830) (~1/5 of the visible city); watchtower at the dome's right foot (x 600-650, cabin top ~880) silhouetted against the sun, cabin dark (guard off); `searchAngle` clamp -10..+25 deg (cone below screen y 600); sun slot r260 at (700,1000) + SunGlowSteps rings x1.25 / x1.5; observer off; rattler-door anchors along rows 2-3 across the width; multiplane depths for the crane (rows 0-3 at 0.85 / 0.7 / 0.45 / 0.2).
- TelephoneWires: WIRES.S08 ends at a rooftop pole at x 540 on our parapet (the counter board must stay clear).
- MakersLane / Workshop: `blindSign` slot on the shop-window blind ('still fixing...') for S06 and the S07 corner preset; the same sign hangs on the MakersCart in S09 (strike + 'fixed!').
- StoopStreet: `dawnAt` peach band + peach rims usable with a dusk World sky key at the cut (S09: dusk held ~1.5 s, then dawn wipe up); the crate slot on step 2's tread (395,1226).
- TerraceHill: Bit dot on house #4's door frame at (545,1452) 3 px (the hidden-cut match); `checkBoxWaveAt` (EMPTY cream check-box tags over every door, door #4 ticked) replacing the wrench-tag wave; keeper speck >= 40 px at rest with a dotted path #4 -> #5.
- OldQuarter: `noticeSign` slot (A-frame on the left pavement, world 125-445 x 1262-1462); `people` = only the street-gap walker and `furniture` = the bike only in S10; second-row plaques with an `old` mask (5 of 9, alternating) and one old door with a pre-existing caretaker tag; support-tag slots on the plaques; the cart line on the stoop line (~y 1330).
- BlueprintWall: a clean top margin on the sheet (no grid above world y ~760) so the S02 tight framing and the L6 slip read; a bottom rail on the banner at y ~1300 (Pip's S05 perch).

**props**

- BackSoonTag: a LETTERED variant: 'back soon' in CaptionHand >= 22 px on screen, tag >= 80 px wide (at least on govB); `liftAt` / `outAt` for the rewind.
- RewindGlyph (new, S12): a bold cream rewind glyph (two left-pointing triangles) in the PowerGlyph weight, `at` / `outAt` swap with the power glyph.
- LabelTag (new): tag (string) / card (pin) / slip (clip) / notice (4 tape strips) / sign (A-frame) / stamp; `at`, `outAt`, `flipTo` (paper flip to new text), `swing`; CaptionHand 28-40 px; see labelStyle.
- CounterBoard (new, S08): rooftop sign board with a shield-dome emblem, header slot, start flag + note, hand-drawn ink tally gates (`gatesAt[]`, 5 bars each, no digits, never a digital ticker), two stamp slots (`stamps: [{at, text}]`), footer fine print; `riseAt`.
- DiagramHand (new, S02 + S05 callback): a bare hand drawn in DASHED ink, no fill, with a dashed hooded sleeve cuff (the attempters' hood); `enterAt`, `turnAt`, `exitAt`; plus KeyCross (key glyph + ink cross) and SiteIcon (schematic website house; `takenAt`: window hatching + roof flag).
- StickyNote (new, S11): cream note with text, `slapAt` (flutter in + slap squash) and `strikeAt` + `strike` substring ('and on again'); lettering >= 24 px on screen.
- Sticker (S03): 'I [heart] PHP' with a drawn heart (the font has no heart glyph) and a hand-scribbled '?', >= 110 px wide, lettering >= 24 px; static (no animation).
- CheckBoxTag (new, S09): the LockCrate's cream check tag, EMPTY (unticked) and ticked variants, batched for hundreds; SupportTag (S10): a sage check tag stamped with the elephant mark.
- SunGlowSteps at r260 (S08). SunPie: n=2 cream=1 (the 1/2 pie). RollerShutter: `stopAt` fraction (govC half). SunPress: a reversed press (S12 end state = the bottom of the squash, ripple at its emission radius).

**engine**

- Film: honour a non-unbuild loop: S12.transitionOut {type: 'cut', loop: true, captionAt} must NOT un-build S12 or show S01's t < 0 line art (the seam is a full-colour rewind whose last frame equals frame 0), and must still roll the captions back to page 1 at captionAt (today loopAt is set only when the type is 'unbuild'). scripts/anchor/engine_emit.py now emits that type instead of falling back to {type: 'unbuild', dur: 0.5}.
- Film: no camera from transitions in v3: S02 / S04 / S05 / S08 / S09 are 'matchcut', S07 / S10 'foreground-wipe' (element 'scene': S06 and S09 export their Wiper: the printed leak sheet, the tram), the rest 'cut'. If push-through is ever used again, an `incoming: 'in'` option (keep moving in, no pull-back from `to`) is the v3 grammar.
- Caption loop seam as in v1: frame 0 shows page 1 24 px low and settles it by 0.25 s (the roll starts at captionAt).
- Labels are scene-owned props (LabelTag); captions never render them.
- World sky keys: a stepped uniform tween is 5 consecutive `snap` keys with explicit colours (S08 dusk); confirm `snap` relights objects only on the key that carries `tod`.

**sound**

- Rewind sound = existing whoosh_soft + counter_ticker played REVERSED and stepped (no new file needed).
- Re-fit the music tempo map to the v3 cut list on the recorded take (scripts/qa/beatsync.py --fit-tempo once src/data/scenes.json carries the v3 cuts).

**voice**

- Done: the take is recorded and locked (assets/vo_v3_final.wav, assets/timing_v3.json = assets/timing.json, 55.36 s). resolve.py defaults to it; nothing in the storyboard changes if the take is re-recorded, only the timing file (re-run resolve.py, then the lint).


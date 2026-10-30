# Sound sync: our own practice, audited (2026-10-30)

The owner, verbatim (2026-10-30, with two phone screen recordings): "And then the next piece after that is the research
distill and practice of syncing the video and shots with with sounds so look here / We already do this and I think
decently okay we just need to be more intentional and educated about this effect and where it make sense to use". The
same day, on the composition study: "I didn’t get once again why you ignored all my references and came up with yours?"

**What this is.** The audit lane of the sound-sync research: what we ACTUALLY do, measured on our latest finished film,
video 2 "One Small Window" (the G7 master `deliverables/v2/v2r_G7_master_v1.mp4`, 39.083 s = 2345 frames at 60 fps,
sent 2026-10-28 19:25 UTC), with video 3 (posted 2026-10-28) and video 1 (posted 2026-10-25) for comparison.

**The spine is the owner's two reels** (`docs/look/refs_sound_sync/`; every moment measured in `reels.md`, the devices
named in `craft.md` Part A, R1-R10). Part 1 checks our film against each of the reels' devices, in their order. Parts
2-3 list every sync point we placed and its density. Parts 4-6 are OURS: how we decide sync today (docs, code, gates),
the gaps against good practice (research, labelled), and what to keep or change (proposals for the distill).

**Rank.** Research notes, the lowest rank on DIRECTION's ladder: nothing here is a rule until the sound-sync distill
integrates it into the docs that own each topic. Methods only: no footage or audio copied, no creator named.

**Conventions.** Times in seconds and 60 fps frames: "0.400 s (f24)"; 1 f = 16.7 ms. **Offset = picture time minus
sound time**, as in `reels.md`: "+2 f" means the picture comes 2 frames AFTER its sound (the sound is early); "-2 f"
means the sound is late. Every offset is also said in words. "Heard" is our estimate of whether a cue reaches the ear
as an event: its level against everything else (voice, bed, other cues) in its own octave band over its first 80 ms
(Part 7 has the method and its limits). Evidence: **MEASURED** (ours, on the master and its files), **CODE** (read in
our code), **DOC** (our docs), **SOURCE** (cited, Part 8), **EST** (our estimate).

---

## 0. Bottom line

1. **We sync a lot, and mostly on time** (MEASURED). Video 2 places **56 sound effects in 39.08 s (1.43 a second)**
   plus a score with 15 story marks. Against the frame each cue was AIMED at, **24 sit on it (within 0.75 f)**, 6
   come about 1 f early, **17 come exactly 2 f early by design**, 3 come 3-5 f early, and 6 trail by 1-2 f (mostly
   swells, whose crest is broad). All 8 joins carry a sound whose crest lands within 30 ms (2 f) of the join's
   midpoint, and nothing else starts in the 0.32 s around a midpoint. A one-source cue sheet, a carrier sound on every
   join, a guard that keeps 37 hit words clear: "decently okay" is fair, and the machinery is worth keeping (Part 6).
   **The exception is the hook's own mechanism**: the nine ghost ticks are aimed at the start of each ghost's thin
   outline, and the bold moment, the fill popping in 8 f later, has no sound: **the count's ticks come 8-10 f
   (133-167 ms) before the pops the eye sees**, past the 90 ms the broadcast standard accepts (Part 5, gap 5).
2. **But we spend sync like a texture, and the reels spend it like money** (MEASURED). The reels put all their hard
   sync into the first 2.0-4.4 s and then rest (0 and 0.11 sync points a second after the release). Video 2 keeps
   **0.9-1.6 cues a second in every shot, to the last frame**: no rest, no single place where sync is the event. Our
   video 3 (no music, 18 cues: **13 in the first 4.04 s**, then 5 in 37 s) had the reels' shape; video 2 lost it;
   video 1 (170 cues, 3.1 a second, beat-locked cuts) never had it.
3. **Half of what we place is not heard** (EST). Of the 56 cues, **24 reach the ear as events, 21 are marginal and 11
   are buried more than 10 dB under the rest in their own band**; 42 of 56 land under the voice. Buried: the TOLD THE
   BBC board's clack, the S5>S6 tree wipe (a join's carrier), the cloth wipe, her quote's pen, and **the payoff's lamp
   run on "facts"**. A sync point the viewer cannot hear does no work.
4. **The payoff has no audible sync** (MEASURED). On "facts" (37.18 s, f2231) the score's accent 2 steps the bed up
   **+17.8 dB**, but the master moves **+0.7 dB**: the voice covers it. The reels' release is **+26 / +32 dB in the
   open**, with nothing talking over it. Accent 1 (the crane's landing, 22.43 s) is under "Pentagon" in the same way.
5. **Our best moments are the reels' own devices** (MEASURED). (a) The pause 12.81-13.16 s (f769-f790): the bed drops away
   (master -25.1 to -41.8 dBFS) and ONE lamp click lands on the B match at 12.983 s (f779), on the frame, heard at
   +23 dB: a quiet floor plus one hit on one discrete change (the reels' R7 + R1). (b) The hook's ghost count into
   "for life", whose last tick sits in a 0.25 s air dip (R2 into a small R8): the right shape, with its ticks early
   (point 1) and two of them masked (point 3). (c) Frame 0's pen alone over air, no
   music for 6.28 s, f0-f377 (R7; the playbook's "cinematic but subtle, especially at the start").
6. **The 2-frame early lead is a misread rule** (CODE, DOC). The v2 beat map's "hits may lead the sound by 1-2 frames,
   never trail it" was about the PICTURE leading the VOICE. The cue sheet turned it into "every word-synced effect 2
   frames before its own picture" (`audio/v2r/sheet.py` `lead()`). Research puts sound-early on the side viewers
   notice first (from about 45 ms; for an impact about 75 ms) (SOURCE); the reels sit at 0 f. Inside tolerance, but the
   wrong default: added to an event whose visible moment comes after its clock's key time (a draw-on, a two-drawing
   close, an outline then its fill), it becomes 5-10 f early (the notebook's clap: 5 f, 83 ms, before the book shuts;
   the ghost ticks: 10 f, 167 ms, before each ghost's fill).
7. **Sync is chosen last, by matching sound to a locked picture** (DOC). Video 2 skipped G3 (the restart), drafted its
   sound from the treatment and re-spotted every cue after picture lock ("Sound sync (final)"). The picture moved for
   the sound only to keep consonants and flash limits clear, never to make a sync moment. The reels' sync is
   STRUCTURE (a count, a hold, a release), which has to be decided with the script and the sketch.
8. **Three gaps the owner named, confirmed** (DOC, CODE): **no named types** (every cue has a note, none says what
   kind of sync it is); **no rule for where** (v1's "at most about one every 2-3 s" exists and was never enforced: v1
   3.1 a second, v2 1.4); **no gate check** (`gate_check.py` checks only that an audio stream exists and lasts as long
   as the picture; v2's `premix.py` checks protect the voice from the effects, but nothing checks an effect against its
   picture, whether it is heard, or where sync is spent).

---

## 1. The reels' devices, checked against video 2 (the spine)

The devices and their names are the reels' (`craft.md` A3; the measurements in `reels.md`). For each: where the reels
use it, what video 2 does (MEASURED), and a verdict: **USED** (we do it, and it works), **ADAPTED** (we do it our way),
**PARTLY** (it is there in the picture or the plan, not in what is heard), **MISSING**, or **CONTRARY** (we do the
opposite).

| Device (reels) | In the reels | In video 2 | Verdict |
|---|---|---|---|
| **R1 the hit-cut** | 01-1..3: three knocks, each on the first frame of a hard cut (-5, +8, -2 ms); 02-5: the drop on the cut | No hard cuts (DIRECTION rule 1: every join carries something). The nearest: the **B match at 12.983 s (f779)**, her dark office window becoming her lit home window, with ONE lamp click on that frame (0 f), alone in the pause, +23.0 dB | **ADAPTED, and our best moment.** The other 7 joins ride moves (4 push-throughs, 2 wipes, the un-build), sounded by swells that crest on the midpoint |
| **R2 the count-in** | 01: three knocks 32 f apart; 02: three word-hits 1.11-1.26 s apart | The hook's **ghost ticks**: six, at 1.967 / 2.500 / 3.167 / 3.767 / 4.200 / 4.767 s (f118-f286), 0.43-0.67 s apart (keyed to words, so uneven). Heard: ticks 1 (+14.1 dB, pause), 4 (+2.1) and 6 (+21.8, pause); ticks 2 and 3 sit under the **birds' wings (2.45-3.59 s, f147-f215, heard +4.7)**, tick 5 under "criticizing". The S8 callback is three ticks in 0.08 s: a roll, not a count | **PARTLY.** The count is in the picture (six ghosts) but the ear gets three uneven ticks 1.80 s and 1.00 s apart; a background life sound masks two of its beats; and every tick lands on the start of a ghost's thin outline, 8-10 f (133-167 ms) before its fill pops (`POP` in `src/v2r/scenes/V2S1_row_fig.tsx`: the outline 0.10 s, the fill 2 f after it): the reels' count is frame-exact |
| **R3 the late fourth** | 01-4: the click 6 f later than the pulse predicts; 02: the longest gap before the drop | Nothing designed. Closest: the bed's 12 dB air dip at 4.54-4.79 s, f272-f287 (the "…"), tick 6 inside it, then "for life" with the outlines' pop | **MISSING** as a device (the hold exists, the bent timing does not) |
| **R4 the interface click** | 01-4: a bright two-tick click (8.6 kHz, peak 0 dBFS) on the player's reveal | **The exit ding** at 0.450 s (f27): two struck-glass notes rising a fourth (C6 to F6), the doors start to slide on the frame; heard just (+0.9 dB), held 8 dB under the voice by rule. **The thread's lamp clicks**: OFF 0.400 s (f24), ON 12.983 s (f779), ON 34.950 s (f2097), each on its frame | **USED.** The playbook's "positive phone sound in the first second" is this device. Ours is quiet: the reels' click is the loudest sound of its reel |
| **R5 cause, then effect** | 01-4 to 01-5: the click, then 0.48 s (29 f) later the song it starts | Lamp OFF (f24) then the ding and the doors (f27), then her step out (0.97 s): each with its sound; the lamp's OFF at 0.40 s is answered by ON at 12.98 and 34.95 s (the thread's own sound) | **USED** in the picture's logic (3 f apart, too close for the ear to hear cause then effect: the reels leave 29 f) |
| **R6 the word-on-hit** | 02-1..3: each title word pops whole on a soft low hit; the biggest word gets the lowest, loudest hit | 28 of the 56 cues are keyed to a spoken word (`lead()`); 12 of them are this device, a word, label or sign appearing on its word with a hit: the window outline on "one" (+23.0, heard), the name tag on "She" (+2.8), the DEC plate on "military" (+6.6), the plaque on "Pentagon" (+3.3); but the boards TOLD THE BBC (-13.4), GOOGLE SAYS (-10.4), SHE SAYS (-3.8), the purpose line (-5.6) and the F12 line (-2.9) are marginal or buried | **ADAPTED, half heard.** The reels' words have no voice over them; ours are said by the voice at the same moment, so the hit competes with the very word it marks (and loses, by our own rule: effects >= 8 dB under the voice) |
| **R7 the quiet floor** | 01: -44 dBFS between knocks; 02: falls to -41.8 dBFS before the drop | No music for the first 6.28 s (air only); the air dip 4.54-4.79 s; the pause 12.81-13.16 s (master -41.8 dBFS) holding the match click; the **held breath 36.18-36.54 s, f2171-f2192 (master -47.6 dBFS)** before "talking about facts" | **USED.** This is our strongest habit |
| **R8 the release** | 01: +26 dB (the song, 0.48 s after the click); 02: +32 dB on the drop's cut, the largest picture change on the same frame | **Accent 1** at 22.43 s (the crane lands, the plaque pops, "Pentagon"): bed +5.4 dB, master -14.2 to -18.1 dBFS (the voice dominates). **Accent 2** at 37.18 s ("facts"): bed **+17.8 dB**, master **+0.7 dB** | **MISSING in what is heard.** Both releases happen under speech; the held breath before the payoff is spent on "talking about", not on the release word |
| **R9 the rest** | 01: one held frame, 0 sync, for 7.55 s; 02: 1 sync point in 9.2 s | Every shot keeps 0.9-1.6 cues a second to the end (Part 3); the film ends on its payoff and loops | **CONTRARY.** There is no stretch where sync stops and the voice and bed carry |
| **R10 the punch-in** | 02-7: the same subject, closer, on an accent | Not in our camera grammar (pushes are slow story moves; no punch cuts) | **not used** (no verdict needed) |

**What the reels never do, and video 2 does** (MEASURED): whooshes on joins (4: the two dives, the two suns; plus the
lamppost and tree wipes' rushes and the boat's pass); sound on in-shot life (the two bird lifts, plus the bus, boats,
birds and fountain in the bed); hits on gradual moves (the door glide, the blinds, the cloth wipe, three pens); and
hits under continuous speech (42 of 56).

---
## 2. Every sync point in video 2 (MEASURED)

**How to read it.** One row per cue of `public/v2r/cue_sheet.json` (the bed aside), in the order the sheet lists them.
*Sound*: the frame of the cue's transient (its first sharp rise) or, for a swell, its crest; Film plays a cue at
round(t x 60). *Picture*: the first frame that shows the event; "seen" = checked frame by frame in the master, "detector"
= the frame-difference detector found the change on exactly that frame, "clock" = the scene clock in the code
(`src/v2r/world/map.ts`, the scenes), which the sound lane checked against the picture on 2026-10-28 (`docs/v2/SOUND.md`
"Sound sync (final)"). *Offset*: picture minus sound. *Where*: in a voice pause, or under which word. *Heard*: the cue
over everything else in its own octave band, first 80 ms (EST; >= 0 dB heard, -10 to 0 marginal, < -10 buried).
*Type*: the reels' device it plays (Part 1) or ours. *Verdict*: ours (EST).

| # | t (s) | sound | picture event | offset | type | where | heard (dB) | verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 (f0) | `pen_drawon` (f0) | the clean pen draws her, the door, W from f0 (strokes 0.00-0.39 s; colour floods f27-f47) (f0, clock) | -0.5 f (-8 ms): on frame | frame-0 pen (ours) on a quiet floor (R7) | pause | +10.8 | WORKS: the hook's first sound, alone, heard |
| 2 | 0.40 (f24) | `lamp_click_1` (f24) | W, her office window, goes dark (f24, detector) | +0.0 f (+0 ms): on frame | R4 interface click (the thread's lamp OFF) | "She" | -3.3 | marginal: under "She", 5 f before the ding |
| 3 | 0.45 (f27) | `exit_ding` (f27) | the glass doors start to slide (f27, clock) | +0.0 f (+0 ms): on frame | R4 interface click: our two-note ding, the first-second phone sound | "She" | +0.9 | WORKS (just heard: +0.9 dB; 8 dB under the voice by rule) |
| 4 | 0.45 (f27) | `door_glide` (f27) | the doors glide (0.45-0.52 s) (f27, clock) | -0.1 f (-1 ms): on frame | foley on a move | "She" | -8.8 | masked; texture |
| 5 | 0.97 (f58) | `step_thup` (f59) | her heel lands (12 a second drawing) (f60, seen) | +1.5 f (+24 ms): sound 1.5 f early | foley contact | "Google." | -15.0 | masked (-15.0) |
| 6 | 0.95 (f57) | `letter_pops` (f57) | six canopy letters pop (the G first visible f61) (f61, seen) | +4.0 f (+67 ms): sound 4.0 f early | R6 word-on-hit, six tiny pops | pause | -13.9 | EARLY 4 f and masked (-13.9) |
| 7 | 1.97 (f118) | `ghost_tick_1` (f118) | ghost G1: its outline draws on f121-f126, then **its fill pops on f128** with a 4-frame settle (the bold change: 6x the outline's frame difference) (seen) | to the outline's first stroke +3.0 f (+50 ms); **to the fill's pop +10.0 f (+167 ms)**: sound 10 f early | R2 count, tick 1 | pause | +14.1 | heard (pause), but **10 f EARLY on the pop the eye sees** |
| 8 | 2.50 (f150) | `ghost_tick_2` (f150) | ghost G2: outline from f152, fill f160 (clock; the detector finds f160) | +2.0 f to the outline; **+10.0 f (+167 ms) to the fill**: sound 10 f early | R2 count, tick 2 | "her" | -4.1 | marginal: covered by the birds' wings (#9); 10 f early |
| 9 | 2.45 (f147) | `wings_1` (f147) | five far birds lift off the rail (tier C life) (f147, clock) | +0.0 f (+0 ms): on frame | in-shot life (the reels never sound it) | "contract" | +4.7 | ARBITRARY: heard (+4.7), and masks ticks 2-3 of the count |
| 10 | 3.17 (f190) | `ghost_tick_3` (f190) | ghost G3: outline from f192, fill f200 (clock) | +2.0 f to the outline; **+10.0 f to the fill** | R2 count, tick 3 | a gap in speech | -1.8 | marginal: under the wings; 10 f early |
| 11 | 3.77 (f226) | `ghost_tick_4` (f226) | ghost G4: outline from f228, fill f236 (clock; detector f236) | +2.0 f to the outline; **+10.0 f to the fill** | R2 count, tick 4 | "from" | +2.1 | heard just; 10 f early |
| 12 | 4.20 (f252) | `ghost_tick_1` (f252) | ghost G5: outline from f252, fill f260 (clock; detector f260) | 0 f to the outline; **+8.0 f to the fill** | R2 count, tick 5 (not word-keyed) | "criticizing" | -0.6 | marginal: under "criticizing"; 8 f early |
| 13 | 4.77 (f286) | `ghost_tick_2` (f286) | ghost G6: outline from f288, fill f296 (clock; detector f296) | +2.0 f to the outline; **+10.0 f to the fill** | R2 count, tick 6 | pause | +21.8 | heard: in the 0.25 s air dip before "for life" (+21.8); 10 f early |
| 14 | 4.95 (f297) | `outline_pops` (f299) | three bare outlines pop down the towpath on "life" (f299, clock) | +0.2 f (+4 ms): on frame | R6 word-on-hit = the count's release | "for" | +6.1 | WORKS (+6.1): the hook's payoff |
| 15 | 4.95 (f297) | `ear_flap` (f297) | Pip's ears cover (4.98-5.08) (f299, clock) | +1.9 f (+32 ms): sound 1.9 f early | mascot reaction | "for" | -4.2 | ARBITRARY, marginal (-4.2); stacked on #14 |
| 16 | 5.95 (f357) | `whoosh_dive_1` (crest f368) | JOIN S1>S2: push-through into W, midpoint 6.10 (f366) (f366, clock) | -1.5 f (-25 ms): sound 1.5 f late | J carrier: whoosh (the reels use none) | pause | +18.0 | WORKS: in the pause, crest on the midpoint |
| 17 | 6.80 (f408) | `window_outline` (f408) | her dark window's outline pops on ("one") (f410, detector) | +2.0 f (+33 ms): sound 2.0 f early | R6 word-on-hit | "that's" | +23.0 | WORKS (+23.0) |
| 18 | 8.42 (f505) | `board_clack_2` (f507) | the A-board TOLD THE BBC is shoved out (lands f536) (f507, seen) | +0.5 f (+8 ms): on frame | R6 word-on-hit (a clack on the shove's start) | "But" | -13.4 | MASKED (-13.4) under "But" |
| 19 | 8.93 (f536) | `light_clicks` (f536) | five windows round hers cool, 0.04 s apart ("staff") (f538, detector) | +2.0 f (+33 ms): sound 2.0 f early | world reacts (background) | "Google's" | -9.5 | marginal (-9.5); also sounds the board's landing frame by chance |
| 20 | 9.45 (f567) | `notebook_flap` (f567) | the reporter's notebook appears (open by f575) (f569, seen) | +2.0 f (+33 ms): sound 2.0 f early | foley | "the" | +10.6 | heard (+10.6) |
| 21 | 10.26 (f616) | `blinds_five` (f617) | five blinds drop to half ("scared") (f616, clock) | -0.9 f (-15 ms): sound 0.9 f late | foley on a move | "they're" | -25.6 | MASKED (-25.6) |
| 22 | 12.17 (f730) | `blind_thump` (f731) | the blind beside hers comes down ("contracts") (f732, clock) | +0.9 f (+15 ms): sound 0.9 f early | foley on a move | "their" | -8.3 | marginal (-8.3) |
| 23 | 12.70 (f762) | `notebook_clap` (f762) | the notebook shuts (closed drawing f767) (f767, seen) | +5.0 f (+83 ms): sound 5.0 f early | foley contact | "contracts." | -7.9 | EARLY 5 f: on the close's start, not the shut |
| 24 | 12.98 (f779) | `lamp_click_2` (f779) | JOIN S2>S3: B match, her dark window = her lit home window (f779, detector) | +0.0 f (+0 ms): on frame | R4 click on a match (our R1: the hit on the new picture's first frame) | pause | +23.0 | WORKS, the film's best: one click in a quiet pause (+23.0) |
| 25 | 14.71 (f883) | `whoosh_dive_2` (crest f892) | JOIN S3>S4: push-through into her silhouette, midpoint 14.86 (f892, clock) | +0.1 f (+1 ms): on frame | J carrier: whoosh (callback, 3 dB softer) | pause | +9.8 | WORKS (+9.8) |
| 26 | 15.05 (f903) | `pop_high_1` (f903) | her name tag appears (grows f905-f910) on "She" (f905, seen) | +2.0 f (+33 ms): sound 2.0 f early | R6 word-on-hit | pause | +2.8 | heard (+2.8) |
| 27 | 16.60 (f996) | `pen_tick` (f996) | the tag's second build (in the gap after "AI") (f996, clock) | -0.2 f (-3 ms): on frame | build tick | a gap in speech | +26.3 | heard (+26.3) |
| 28 | 17.33 (f1040) | `steps_stop` (f1040) | her last two footfalls (f1040, f1076) (f1040, clock) | -0.1 f (-2 ms): on frame | foley contact | "BBC" | -22.2 | MASKED (-22.2) |
| 29 | 18.90 (f1134) | `plate_knock` (f1134) | the DEC 2025 plate builds ("military") (f1136, clock) | +2.0 f (+33 ms): sound 2.0 f early | R6 word-on-hit | "its" | +6.6 | heard (+6.6) |
| 30 | 19.45 (f1167) | `pen_short_1` (f1169) | the APR 2026 plate pen-reveals (f1167, clock) | -1.5 f (-25 ms): sound 1.5 f late | build sound (a pen on a draw) | "work" | +18.2 | heard (+18.2): a hiss, not a hit |
| 31 | 19.77 (f1186) | `wings_2` (f1186) | seven birds lift off the gasholder (f1187, clock) | +0.8 f (+13 ms): sound 0.8 f early | in-shot life | "heading." | -1.5 | ARBITRARY, marginal (-1.5) |
| 32 | 20.40 (f1224) | `sun_through_1` (crest f1233) | JOIN S4>S5: push-through into the sun, midpoint 20.55 (f1233, clock) | -0.1 f (-1 ms): on frame | J carrier: glass shimmer + tink | pause | +13.3 | WORKS (+13.3) |
| 33 | 20.73 (f1244) | `blossom_pops` (f1245) | the trees burst into blossom ("April") (f1246, clock) | +0.6 f (+10 ms): on frame | R6 word-on-hit (time passes) | "In" | -5.1 | marginal (-5.1) under "In April" |
| 34 | 21.95 (f1317) | `wipe_air` (crest f1326) | the lamppost wipes across the crane (centre 22.10) (f1326, clock) | -0.1 f (-2 ms): on frame | wipe air inside the one big move | "deal" | -16.2 | MASKED (-16.2) |
| 35 | 22.40 (f1344) | `pop_low` (f1344) | the plaque pops: the crane lands ("Pentagon"), with the bed's accent 1 (f1346, detector) | +2.0 f (+33 ms): sound 2.0 f early | R6 word-on-hit + R8 release (soft) | "the" | +3.3 | heard (+3.3); the release is under the voice |
| 36 | 23.05 (f1383) | `window_warm` (f1383) | the wing's windows warm in one step ("use") (f1385, clock) | +2.0 f (+33 ms): sound 2.0 f early | world reacts | "Pentagon" | -5.3 | marginal (-5.3) |
| 37 | 23.62 (f1417) | `tree_wipe` (crest f1429) | JOIN S5>S6: a blossom tree crosses the lens, midpoint 23.80 (f1428, clock) | -0.7 f (-12 ms): on frame | J carrier: wipe rush | "for" | -20.7 | MASKED (-20.7): a carrier nobody hears |
| 38 | 24.00 (f1440) | `pop` (f1440) | the purpose line pops ("any") (f1442, detector) | +2.0 f (+33 ms): sound 2.0 f early | R6 word-on-hit | "any" | -5.6 | marginal (-5.6) |
| 39 | 26.47 (f1588) | `pop_high_2` (f1588) | the F12 line pops ("veto") (f1589, detector) | +1.0 f (+17 ms): sound 1.0 f early | R6 word-on-hit | "can't" | -2.9 | marginal (-2.9) |
| 40 | 27.10 (f1626) | `window_ticks` (f1626) | three facade windows light (f1626/1647/1670) (f1626, detector) | +0.0 f (+0 ms): on frame | world reacts | "how" | -6.1 | marginal (-6.1) |
| 41 | 27.95 (f1677) | `sun_through_2` (crest f1686) | JOIN S6>S7: push-through into the April sun, midpoint 28.10 (f1686, clock) | -0.1 f (-1 ms): on frame | J carrier: shimmer + tink (callback) | pause | +19.8 | WORKS (+19.8) |
| 42 | 28.33 (f1700) | `board_clack_1` (f1701) | GOOGLE SAYS appears whole (f1700) (f1700, seen) | -1.0 f (-17 ms): sound 1.0 f late | R6 word-on-hit (clack 1 f after) | "But" | -10.4 | MASKED (-10.4) under "But Google" |
| 43 | 29.62 (f1777) | `pen_short_2` (f1779) | "AI principles" pen-builds (f1779, clock) | +0.5 f (+8 ms): on frame | build sound | "AI" | +2.0 | heard just (+2.0) |
| 44 | 30.20 (f1812) | `lamp_run` (f1812) | the forecourt lights, three switch-ons (f1812/1836/1848) (f1812, detector) | +0.0 f (+0 ms): on frame | world reacts | "principles" | +7.3 | heard (+7.3) |
| 45 | 30.74 (f1844) | `pen_long` (f1844) | "of any kind" pen-builds (f1845, clock) | +1.0 f (+17 ms): sound 1.0 f early | build sound | "and" | -7.4 | marginal (-7.4) |
| 46 | 32.70 (f1962) | `boat_pass` (crest f1978) | JOIN S7>S8: the narrowboat crosses the lens, midpoint 32.93 (f1976, clock) | -2.3 f (-39 ms): sound 2.3 f late | J carrier: the boat's pass | pause | -2.4 | marginal (-2.4), in the pause |
| 47 | 33.13 (f1988) | `board_clack_1` (f1989) | SHE SAYS appears whole (f1989) (f1989, seen) | -0.0 f (-0 ms): on frame | R6 word-on-hit (the same clack as Google's) | pause | -3.8 | marginal (-3.8): 6.6 dB clearer than Google's |
| 48 | 33.75 (f2025) | `ghost_tick_3` (f2025) | copy 1 pops on "can't": outline from f2027, fill ~f2035 (clock; the same pop as S1's) | +2.0 f to the outline; ~+10 f to the fill | R2 callback: three ticks in 0.08 s (a roll, not a count) | "she" | -1.0 | marginal; ~10 f early |
| 49 | 33.80 (f2028) | `ghost_tick_4` (f2028) | copy 2: outline from f2030, fill ~f2038 (the detector's peak f2038) | +2.0 f; ~+10 f to the fill | R2 callback | "can't" | -3.0 | marginal; ~10 f early |
| 50 | 33.83 (f2030) | `ghost_tick_1` (f2030) | copy 3: outline from f2032, fill ~f2040 (clock) | +2.0 f; ~+10 f to the fill | R2 callback | "can't" | -3.1 | marginal; ~10 f early |
| 51 | 34.75 (f2085) | `door_latch` (f2085) | her door shuts behind her (f2085, clock) | -0.3 f (-5 ms): on frame | foley contact | "Google." | +17.2 | WORKS (+17.2) |
| 52 | 34.95 (f2097) | `lamp_click_2` (f2097) | W lights: her home lamp ON ("Google.") (f2097, detector) | +0.0 f (+0 ms): on frame | R4 click: the thread's answer | "Google." | +9.5 | WORKS (+9.5) |
| 53 | 35.68 (f2141) | `cloth_wipe` (f2143) | the cafe owner wipes the board (35.72-36.14) (f2144, clock) | +1.2 f (+20 ms): sound 1.2 f early | foley on a move | "in" | -12.5 | MASKED (-12.5) |
| 54 | 36.52 (f2191) | `pen_long` (f2191) | her quote pen-draws on ("talking") (f2193, clock) | +2.0 f (+33 ms): sound 2.0 f early | build sound | pause | -18.4 | MASKED (-18.4) |
| 55 | 37.28 (f2237) | `lamp_run` (f2237) | the lamps light west down the lane ("facts", the payoff) (f2237, clock) | +0.0 f (+0 ms): on frame | world reacts on the payoff word | "facts" | -14.8 | MASKED (-14.8): the payoff's sync is not heard |
| 56 | 38.82 (f2329) | `pen_unbuild` (premix's loudest 20 ms: midpoint + 29 ms) | JOIN S8>S1: the un-build into frame 0, midpoint 38.95 (f2337, clock) | -1.7 f (-29 ms): sound 1.7 f late (premix); the reversed pen keeps swelling into the loop seam at 39.08 s (f2345) | J carrier: the pen reversed into frame 0's draw-on | pause | +13.7 | WORKS (+13.7) |

**The joins, measured two ways.** `premix.py` measured each carrier's loudest 20 ms in the master against the join's
midpoint (`docs/v2/SOUND.md`); we measured the crest of each file's own 2 ms envelope. They agree within 2 f except
where a sound has no single crest (the boat's pass, the reversed pen that swells into the loop seam).

| Join | Midpoint | Carrier (picture) | Sound | premix: crest vs midpoint | ours | Heard |
|---|---|---|---|---|---|---|
| S1>S2 | 6.100 s (f366) | A push-through into her dark window W | `whoosh_dive_1` | +20 ms (sound 1.2 f late) | +25 ms | +18.0, pause |
| S2>S3 | 12.983 s (f779) | B match: her dark office window = her lit home window | `lamp_click_2` | +14 ms | 0 ms (the click's onset on f779) | +23.0, pause |
| S3>S4 | 14.860 s (f892) | A push-through into her silhouette | `whoosh_dive_2` (callback, -3 dB) | +13 ms | -1 ms | +9.8, pause |
| S4>S5 | 20.550 s (f1233) | A push-through into the low October sun | `sun_through_1` (shimmer + glass tink) | -4 ms | +1 ms | +13.3, pause |
| S5>S6 | 23.800 s (f1428) | D wipe: a blossom tree crosses the lens | `tree_wipe` | +6 ms | +12 ms | **-20.7, under "for"** |
| S6>S7 | 28.100 s (f1686) | A push-through into the April sun | `sun_through_2` (callback) | +3 ms | +1 ms | +19.8, pause |
| S7>S8 | 32.930 s (f1976) | D wipe: the narrowboat glides west | `boat_pass` | -27 ms (1.6 f early) | +42 ms (broad crest) | -2.4, pause |
| S8>S1 | 38.950 s (f2337) | B + un-build into frame 0 | `pen_unbuild` into `pen_drawon` | +29 ms | (crest at the seam, 39.08 s) | +13.7, pause |

**The score's story marks** (`audio/v2r/sheet.py` MARK; the bed's tempo map is bent so its beats fall on 12 heard
words: `audio/v2r/bed.py` SEG, ~92 BPM, 84-100). The bed and master levels are RMS over 0.3 s before and after the
mark (MEASURED). The joins fall between beats, in the voice's pauses (CODE).

| t (s) | Mark | The picture there | Bed step | Master | Reads as |
|---|---|---|---|---|---|
| 0.00-6.28 | no music: canal air only; the air dips 12 dB at 4.54-4.79 | the hook: draw-on, the doors, the ghosts, "for life" | (air) | | R7 quiet floor (heard: the hook's effects carry) |
| 6.28 (f377) | two pizz notes C5 to F5, "You'd think" (false relief) | S2 opens on her window (the push-through ended 6.325) | +9.0 dB | -28.6 to -22.2 | a small entry under the voice |
| 8.44 (f506) | the pulse steadies in D minor, "But" | the A-board is shoved out (8.42) | +2.5 | -36.7 to -14.1 | the voice's "But" (the step is the voice) |
| 12.81 (f769) | the pulse dies out, "contracts." ends | the pause before the B match | -4.9 | -25.1 to **-41.8** | **R7: the floor before the match click** |
| 13.96 (f838) | one high piano C6 on "she", un-ducked | her lit window (S3) | +16.8 | -16.9 to -17.4 | under the voice |
| 15.07 (f904) | her walk: the motif over a walking pizz bass | S4 opens; the name tag on "She" | +4.5 | -28.0 to -12.5 | the voice's entry |
| 17.96 (f1078) | the motif stops with her, "objected" | her last step's stand (f1076) | | | a music-to-action stop (2 f apart), under the voice |
| 18.92 (f1135) | a low D minor sustain + a pp fifth, "military" | the DEC 2025 plate builds | +2.6 | | under the voice |
| 20.70 (f1242) | April air (after the sun push-through) | S5's slot in April | -0.9 | -27.7 to -13.2 | |
| 21.30 (f1278) | low strings + divided violins open with the crane and swell | the crane rises (the ONE big move) | +1.6 | | the only swell on a camera move |
| **22.43 (f1346)** | **accent 1**, a lydian bloom, +2.5 dB | the crane lands, the plaque pops, "Pentagon" | +5.4 | -14.2 to -18.1 | **R8 under speech: not heard as a release** |
| 24.00 (f1440) | the pulse, level and thin under the clause | the purpose line (24.03) | -0.1 | | |
| 28.31 (f1699) | Google's side: the SAME pulse (fairness) | GOOGLE SAYS (28.33) | +13.4 | -32.1 to -13.8 | under "But Google" |
| 33.16 (f1990) | the motif alone, quieter | SHE SAYS (33.16) | +9.2 | -28.8 to -17.1 | under "She says" |
| 36.18-36.54 | **held breath** | the board wiped clean (to 36.14), her quote about to draw | -3.1 | -15.1 to **-47.6** | **R7: a real 0.36 s hold** (before "talking", not before "facts") |
| **37.18 (f2231)** | **accent 2**: E5 to F5 resolves on "facts" (F add9) | the lane's lamps light (37.28, buried) | **+17.8** | -17.9 to -17.2 (**+0.7**) | **R8 under speech: the payoff's release is not heard** |

---
## 3. Density: where the sync is spent

**Video 2, shot by shot** (MEASURED; cues placed, and those heard by the EST of Part 2):

| Shot | Span (s) | Cues | per s | Heard | heard per s | What carries it |
|---|---|---|---|---|---|---|
| V2S1 walking out (the hook) | 0.00-6.10 | 16 | 2.62 | 8 | 1.31 | effects over air, no music |
| V2S2 the wall | 6.10-12.98 | 7 | 1.02 | 2 | 0.29 | the pulse enters; most hits under the voice |
| V2S3 her window | 12.98-14.86 | 2 | 1.06 | 2 | 1.06 | the match click and the dive, both in pauses |
| V2S4 the walk home | 14.86-20.55 | 7 | 1.23 | 5 | 0.88 | the motif; the plates and the tag |
| V2S5 the far side (the crane) | 20.55-23.80 | 5 | 1.54 | 1 | 0.31 | the swell and accent 1, under the voice |
| V2S6 the gate | 23.80-28.10 | 4 | 0.93 | 1 | 0.23 | the pulse |
| V2S7 Google says | 28.10-32.93 | 5 | 1.04 | 2 | 0.41 | the same pulse |
| V2S8 her words (the payoff) | 32.93-39.08 | 10 | 1.63 | 3 | 0.49 | the motif alone, the held breath, accent 2 |

**Against the reels and our other films** (the reels: `reels.md` 1.3, 2.3; video 3: `public/v3/animatic.json` + the
payoff's thoom in `src/v3/film/Film3.tsx`; video 1: `audio/cues.json`):

| Film | Length | Sync points | The opening (to ~4.4 s) | After it | Shape |
|---|---|---|---|---|---|
| Owner's reel 01 (no voice) | 9.5 s usable | 4 hard (of 23 onsets) | 4 in 1.97 s (2.0 a second) | **0 in 7.55 s** | count-in, late fourth, release, rest |
| Owner's reel 02 (no voice) | 13.6 s | 5 hard (of 40 onsets) | 5 in 4.38 s (~1.1 a second) | **1 in 9.2 s (0.11)** | count-in, hold, drop, rest |
| **Our video 3** (voice + effects, no music) | 41.15 s | 18 cues | **13 in 4.04 s (3.2 a second)**: cart-add ding 0.50, LED ticks 0.90 / 1.22, four crane clunks rising in pitch 1.88-2.72, four floor slams 2.60-2.75, the stamp 2.61, the thoom 4.04 | **5 in 37.1 s (0.13)**: the pull-back swell 19.95, the thoom 21.72, a notification ding 30.28, the payoff's thoom 36.98, the like pop at the loop's end 39.88 | **the reels' shape** (spend, then rest) |
| **Our video 2** (voice + effects + score) | 39.08 s | 56 cues + 15 score marks | 12 in 4.4 s (2.7 a second; 5 heard) | **44 in 34.7 s (1.27 a second; 19 heard, 0.55)** | even: no rest, no single release |
| Our video 1 (voice + effects + beat-locked score) | 55.37 s | 170 cues (126 marked provisional) + 10 of 11 cuts locked to beats | 22 in 4.4 s (5.0 a second) | 148 in 51 s (2.9 a second) | even and dense (every 5 s: 10-24 cues) |

**Reading** (ours). Our sync density has gone 3.1 (v1) to 0.44 (v3) to 1.43 a second (v2), and only v3 spent it the
way the owner's reels do. Video 3's shape was not a decision about sync: it shipped at G5b with no G6 polish and no music
bed (`docs/v3/OWNER_NOTES.md`, `docs/v3/POSTING.md`), and its board put 13 of its 17 cues on the opening's mechanism
(`public/v3/animatic.json`). Video 2 had a full sound lane, and the lane
did what our docs ask: a sound for every discrete picture event ("SFX land on visual hits", playbook v1), each "as small
as the gesture" (`docs/sound_plan.md` §7.3). Nothing asked it where NOT to sync.

---

## 4. How we decide sync today (OURS: docs, code, gates)

`craft.md` C1 squares every doc's words against the research; this part is what the films actually ran.

**4.1 The machinery, film by film** (CODE).

| Film | Where the cues come from | How a cue meets its picture | What is checked |
|---|---|---|---|
| v1 (php2shell, 30 fps) | `audio/tools/cues_from_storyboard.py`: the storyboard's `sfx` per scene -> `audio/cues.json` (170 cues, 126 still marked provisional at the end) | "Nudge each cue to its visual event once scenes exist (usually within ±100 ms)" (`docs/sound_plan.md` §7); the score bent so 10 of 11 cuts sit on beats (`scripts/qa/beatsync.py --fit-tempo`, `audio/tools/beatlock.py`) | `audio/mix.py`: every effect >= 8 dB under the voice (the SFX guard); `beatsync.py`: cuts against the beat grid |
| v3 (posted) | the G3 board: `public/v3/animatic.json` `sfx` `[{src, t, gain}]`, played by SketchReel, carried into `Film3` (`film3Sfx`), plus one cue added at assembly (the payoff's thoom, 36.98 s) | placed by the board's author on the board's own timing | the G3 sound-on read ("every cut lands on its word": cuts, not effects) |
| **v2 (latest)** | **`audio/v2r/sheet.py`, one source**: shots, the 8 joins (carrier, midpoint, span, ONE sound each), the voiced spans and pauses, 37 hit words, the score's marks, the life the picture keeps, and 56 cues; `sfx.py` renders each sound, `bed.py` composes on a tempo map bent to 12 heard words, `premix.py` mixes the master the film plays (`public/v2r/cues.json` = `{"audio": "v2r/mix.wav", "sfx": []}`) | `pic_frame(t)`: the frame the picture shows an event keyed at t; **`lead()`: a word-keyed cue 2 frames before that frame**; a join's sound peaks on its midpoint; then a final re-spot against the locked picture (W4, "Sound sync (final)") | `premix.py`: the voice >= 6 dB over everything on the hit words (1-4 and 4-10 kHz); no cue 0-12 ms after a word onset; each cue >= 8 dB under the voice where it lands; nothing but the carrier starts in [midpoint - 0.20, midpoint + 0.12); <= 3 light switch-ons a second; no pumping; the loop seam |
| house | `src/lib/Film.tsx` takes `sfx` (`G5_BLOCKING.md`); `video/audio/tools/make_phone_sfx.py` makes our own phone sounds (G2) | none | `scripts/qa/gate_check.py`: an audio stream exists, starts at 0, lasts as long as the picture (+-2 f); `scripts/qa/av_lag.py`: a track's lag inside the render |

**4.2 Who decides, and when** (DOC). PIPELINE_V2's table gives G7 "SFX from the final beats, music, -14 LUFS mix",
one hour. In video 2: no G3 (the restart, owner 2026-10-27: "let's not do the sketch. Do the video right away"); the
direction docs' beat map (`docs/v2/direction/beat_map.md` §2) chose which WORDS get a visual hit (its "Hit @ s"
column); the sound lane drafted from the treatment, a music director reviewed it (12 items), revision 2 followed
DIRECTION and the through-line card, and after the picture locked every cue was moved onto its picture's frame.
**The picture moved for the sound only to keep the voice clear** (the lamp runs placed in vowels, the facade's
switch-ons flash-safe, the F12 line "REQUEST: the line pops on this frame"), never to make a sync moment. Nobody
listened before it went out: "Not yet heard by a human: check once on phone speakers and once on earbuds"
(`docs/v2/SOUND.md`, Handover).

**4.3 Where the 2-frame lead came from** (DOC, CODE). The beat map: "Hit = the word that should land a visual hit
... Hits may lead the sound by 1-2 frames, never trail it": the PICTURE may lead the VOICE. The cue sheet: "word-synced
cues sit 2 frames BEFORE the word's heard onset (`lead`: the beat map lets hits lead the voice by 1-2 frames, never
trail, and an SFX transient on a consonant masks it)", and `lead()` counts the 2 frames back from the PICTURE's frame.
Two rules were merged: the picture leading its word (DIRECTION rule 8: ~0.1 s; `docs/motion_spec.md` §7: 2-8 f at
60 fps) and an effect meeting its own event (the reels: 0 f). Meanwhile most word-keyed picture events in video 2 sit
ON their word, not ~0.1 s before it (the A-board 8.44 s = "But", the name tag 15.07 s = "She", the purpose line 24.03 s
= "any", the plaque 22.43 s ~ "Pentagon" 22.44 s), so the order on screen is: effect (-2 f), then picture and word
together, where the house order is picture, then word, with the effect on the picture.

---

## 5. Gaps against good practice (OURS and the research: additions to the reels, labelled)

Each gap: what we do (measured), what the reels and the research say, and what it costs.

1. **No named types** (the owner's word "educated"; CODE). Each cue carries a careful note ("her lamp clicks OFF:
   the first picture of 'quit'"), none says which KIND of sync it is. So nobody can ask "where is our count-in?",
   "what is the release?", "how many hits did we spend in the hook?". The reels' devices (R1-R10, `craft.md` A3)
   give us the words; Chion's analysis of a film starts by locating its synch points and how they are distributed
   (SOURCE [A3]).
2. **No rule for where** (the owner's "where it make sense"; DOC). Our only density rule, "one sound per idea, at
   most about one every 2-3 s" (`docs/sound_plan.md` §7.2), was never enforced: v1 placed 3.1 a second, v2 1.4. Both
   films sounded nearly every discrete picture event (v2: the change detector finds no strong unsounded event except
   those left silent on purpose: the parapet pigeons at 7.85 s, Pip, the captions; one far window at 7.30 s). The reels marry only 13-17 % of
   their sound onsets to a picture event, and put all hard sync in the opening and one release (`reels.md` R1). Sync on every event is the template
   look the scoring tradition calls mickey-mousing (SOURCE [A4]); explainer studios "sound only the moments that
   matter" (SOURCE [A10]).
3. **No gate check** (DOC, CODE). `gate_check.py` checks that audio exists; `premix.py`'s checks are film code
   (`audio/v2r/`), and they guard the VOICE against the effects. Nothing checks an effect against its picture's
   first changed frame, whether it is heard, how many sync points are spent where, or whether the payoff has one.
4. **Early by default** (CODE, MEASURED). 17 cues sit exactly 2 f (33 ms) before their picture by design; viewers
   notice sound-early sooner than sound-late: ITU-R BT.1359 puts detection at about 45 ms of sound lead against 125 ms
   of lag (SOURCE [A1]); for an action (a hammer on a peg) the window runs from about 75 ms of lead to 188 ms of lag
   (summarised in [A2]); audio-lead thresholds are narrower than video-lead ones for speech and non-speech alike
   ([A5]). The reels' effects land on their frame (01: -5 to +8 ms). 2 f early is inside tolerance; it is the wrong
   default because it adds to every other error (gap 5).
5. **Keyed to the clock, not to what is seen** (MEASURED). The clock's key time is when an animation STARTS; the eye
   gets the first VISIBLE frame or the CONTACT. The notebook's clap sounds on f762, when the book starts to close; its
   closed drawing shows on f767 (**5 f, 83 ms early**: past the 45 ms line). The canopy's letters pop 4 f after their
   sound (the G first shows on f61). **The hook's count**: each ghost's tick is aimed at its outline's start (the
   first ghost's first stroke shows on f121, 3 f after its tick), while the frame that reads as the ghost popping in
   is its fill, 8 f later (f128: six times the outline's frame difference, with a 4-frame scale settle); so all nine
   ghost ticks (S1's six, S8's three) come **8-10 f (133-167 ms) before the pops the eye sees**, beyond the broadcast
   standard's 90 ms acceptability for sound-early (SOURCE [A1]). Practice: an impact's transient on the contact frame,
   placed by frame (SOURCE [A7]); for a pop, on the frame it appears (`craft.md` B6 maps each of our eases to where
   its hit belongs). A two-stage build (outline, then fill) needs its hit on the bold stage, or the build made one
   stage.
6. **Not heard** (EST). 11 of 56 cues are buried more than 10 dB under the rest in their own band and 21 are
   marginal; a sound under a masker's energy in its critical band is not heard (SOURCE [A6]). Our level rules all
   protect the voice (effects >= 8 dB under it, hit words >= 6 dB over everything); no rule protects a sync point,
   and 42 of 56 cues land under speech. The reels' hits are the foreground: 11 dB over their music, ~33 dB over the
   floor, with no voice. Buried in video 2: TOLD THE BBC, the tree wipe (a join's carrier), the footfalls, the
   blinds, the cloth wipe, her quote's pen, and the payoff's lamp run.
7. **The release happens under speech** (MEASURED). Accent 1 (the crane's landing) under "Pentagon"; accent 2 under
   "facts": +17.8 dB in the bed, +0.7 dB in the master. The 0.36 s held breath (36.18-36.54 s, the master at -47.6
   dBFS) is real and good, but it is spent before "talking about", two words ahead of the payoff. A release needs its
   own gap in the script and the take (`craft.md` C2.5).
8. **No rest** (MEASURED). Every shot keeps 0.9-1.6 cues a second; the reels rest after the release (R9) and let the
   music carry. Our quiet floors (Part 1, R7) exist but never long enough to become the shape.
9. **Background life competes with the story's sync** (MEASURED). The five birds' wings (2.45-3.59 s, heard at +4.7)
   cover the ghost count's 2nd and 3rd ticks (-4.1, -1.8): the count, the hook's mechanism, loses to tier-C life. Our
   own v1 rule says "if two things happen at once, sound only the one the eye goes to" (`docs/sound_plan.md` §7.2);
   the reels never sound in-shot life (the ice, the flowers).
10. **Fairness by file, not by ear** (MEASURED). GOOGLE SAYS and SHE SAYS get ONE clack file at ONE gain (the fairness
    rule A5), yet Google's lands on "But Google" (-10.4 dB, buried) and hers in the pause before "She" (-3.8): 6.6 dB
    apart in what is heard.
11. **Decided after the picture is locked** (DOC). Film practice spots sound on the locked cut (SOURCE [A8]), which
    suits effects and Foley; the reels' sync is structure (a count, a hold, a release), set when the film is timed.
    Our gates put no sync decision before G7 (`craft.md` C3 proposes G1 and G3).
12. **Never listened to** (DOC). Every number above is a measurement; the master went out unheard on a phone, and the
    reels' own capture shows how easily the ear and a file disagree (`reels.md` 0.3: a Bluetooth recording shifted
    sound 168 ms).

---

## 6. What to keep, what to change (proposals for the distill; none is a rule yet)

**Keep** (it works, measured):
- **One source for the sound timeline** (`audio/v2r/sheet.py`: shots, joins, words, cues in one file, rendered and
  checked from it). It deserves to become house tooling instead of film code.
- **A sound that rides each join's carrier and crests on its midpoint**, with nothing else starting around it: all 8
  within 2 f, all but one in a voice pause. (Whether a join wants a whoosh at all is the reels' open question: they
  use none; `craft.md` C4 lists the A/B test.)
- **The thread's own sound**: the lamp OFF at 0.40 s, ON on the match at 12.98 s, ON again at 34.95 s; a recurring
  object with a recurring sound, the callback 3 dB softer.
- **The quiet floors**: no music under the hook, the air dip before "for life", the pause that holds the match click,
  the held breath. These are the reels' R7, and our best sync moments sit on them.
- **The voice's guards**: hit words >= 6 dB over everything; effects >= 8 dB under the voice where they land; no
  effect 0-12 ms after a word's onset; flash-safe light runs (<= 3 a second).
- **One file per idea for both sides of a fairness beat**, now measured by ear as well (change 10).

**Change** (each with the doc that would own it, for the distill):
1. **Name every sync point's type** (the reels' R1-R10, plus ours: the join's carrier, the thread's sound, the
   word-on-hit under the voice, life) as a `type` field in the cue sheet and in the G3 board's `sfx`. Owner:
   PIPELINE_V2's toolkit, `G3_ANIMATIC.md`.
2. **A spend rule**: the hard sync goes to the hook (a count of 3, the thread's first change, the phone-like trigger)
   and to ONE release on the payoff, each in the clear; the middle is carried by the voice and the bed, with sync only
   on the story's turns and the joins' soft carriers; nothing on tier-C life. The numbers are the distill's (the
   reels: 4-5 hard sync points in 2-4.4 s, then at most one in 9 s). Owner: the playbook's "Sync picture to sound ON
   PURPOSE" line (the owner's words own it), DIRECTION rules 8-9, CRAFT for the numbers.
3. **Effects on their picture's first changed frame**: on it, or up to 2 f after it; never before it by design (the
   same window as `craft.md` C2.4; `../composition/motion.md` §4.4 allows up to ~2 f before, which this audit's
   compounding errors argue against). Retire `lead()`'s 2-frame lead for effects; keep the picture leading its WORD by
   ~0.1 s (DIRECTION rule 8), which video 2 mostly did not do. Owner: CRAFT (or the distill's sync doc), the cue tool.
4. **Key every cue to what is seen**: the contact frame for a contact, the first visible frame for an appearance, the
   bold stage of a two-stage build (a ghost's fill, not its outline's first stroke; a two-drawing close's last
   drawing), found on the render, not read from the clock. The hook's count is the first to fix. Owner: the cue tool.
5. **Heard or cut**: an intended sync point is the loudest thing in its band for its first ~80 ms, or sits in a voice
   pause; if it cannot be, it is texture (cut it, or move the event into a pause). Owner: G7, the cue tool.
6. **Write the release into the script**: a 0.8-1.0 s gap on or before the payoff word at G1 (carried by the take), so
   the bed's step and the picture's change can land in the open (`craft.md` C2.5). Owner: PIPELINE_V2 G1,
   `docs/voice/API_QUICKSTART.md`.
7. **Decide sync with the story**: G1's beat map names the 3-6 sync moments (the count-in, the release, the thread's
   sound, a phone trigger); G3 plays them with placeholder sounds and the sound-on read judges them; G5 carries them
   and its entry diff compares them; G7 swaps in final sounds, sizes and mixes them, and invents no new sync. Owner:
   PIPELINE_V2's gate table, `G3_ANIMATIC.md` §2 (a "Sound sync" row), `G5_BLOCKING.md` §1.
8. **A sync check at G3, G5 and G7** (a new `scripts/qa/sync_check.py`, proposed): per cue, its type; its transient
   against the first changed frame in its event's region (on that frame or up to 2 f after it: PASS; 1 f before it:
   WARN; earlier: FAIL); heard or not (the Part 7 estimate);
   the spend (heard sync points per 5 s, the hook's count, the release present and in the clear). Then one listen on a
   phone's own speaker, never over Bluetooth (`reels.md` 0.3). Owner: PIPELINE_V2's toolkit, `gate_check.py`.
9. **No sound on background life by default**; a life sound only where the picture has nothing else to say and the
   eye is on that life. Owner: `LIFE_AND_DENSITY.md`, CRAFT §b.
10. **Fairness measured by ear**: the two sides' matching sounds land equally clear (both in a pause, or both under
    the same kind of word), not only from the same file at the same gain. Owner: the film's fairness card.

---

## 7. Method, limits and files (MEASURED)

- **The picture.** The master decoded to 270 x 480 grey; for every frame the mean change in each 15 x 15 px block
  against the frame before; a "spike" is a block's change minus its largest change over the three frames before it
  (steady motion cancels, a pop does not); the caption band (y 240-600 at full size) left out, since captions pop on
  every word. 47 local events were found (spike > 30): every one lies inside a cue's span, or is silent on purpose
  (the parapet pigeons, Pip), or is a small far change left silent (a window at 7.30 s).
  Eleven events were checked frame by frame in crops of the master (the steps, the letters, the first ghost's outline
  and its fill, the A-board, the notebook opening and closing, the name tag, GOOGLE SAYS, SHE SAYS, and an unsounded
  window change at 7.30 s); ten were confirmed by the detector
  on exactly the clock's frame; the rest are the code's clocks (`src/v2r/world/map.ts`, the scenes), which the v2
  sound lane checked against the picture on 2026-10-28.
- **The sound.** Each cue's own file (`public/v2r/sfx/*.wav`) at its gain, placed at round(t x 60) / 60 as
  `premix.py` places it; its transient = the half-rise of the first peak of a 5 ms envelope (or the first sample
  within 30 dB of the file's peak); a swell's crest = the maximum of its 2 ms envelope. The master's sound matches
  `public/v2r/mix.wav` at 0 ms lag (cross-correlation), so the files' times hold in the master.
- **"Heard"** = the cue's energy over everything else (the voice, the bed, every other cue: the unmastered sum) in the
  80 ms from its first audible sample, broadband and in one octave each side of its spectral centroid. Limits: an
  energy ratio, not a loudness model. Speech has gaps a short hit can be heard in, and a tonal sound stands out from
  noise of the same energy, so a narrow cue can be heard below 0 dB: "marginal" is truly uncertain. An octave spans
  several critical bands. Phone speakers lose most energy below ~200-300 Hz (most of our cues sit at 1-5 kHz). The
  check that settles it is a listen on a phone's own speaker.
- **The score.** Levels are RMS over 0.3 s before and after each mark, in the bed file and in the master.
- **Not checked by ear.** No one in this lane listened; the owner's ear is the judge.
- **Scratch files** (not committed): `/tmp/sync/audit/scripts/` (`pic_metrics.py`, `cue_audio.py`, `detect2.py`,
  `strip.py`, `table.py`, `stats.py`, `bed_steps.py`, `unsounded.py`, `rows.py`), `/tmp/sync/audit/v2/` (the
  measurements as JSON, the frame strips), `/tmp/sync/audit/notes_*.md`.

---

## 8. Sources

Page fetches are unreliable from this sandbox, so the outside sources were read through search-result summaries
("summary"); where `craft.md` already cites a source, its number there is given.

- **[A1]** ITU-R Recommendation BT.1359-1 (1998), *Relative timing of sound and vision for broadcasting*: detection at
  about 45 ms of sound lead and 125 ms of lag; acceptability about 90 / 185 ms. STANDARD (summary; `craft.md` [C13]).
  https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf
- **[A2]** R. Eg and D. M. Behne (2015), "Perceived synchrony for realistic and dynamic audiovisual events",
  *Frontiers in Psychology* 6:736: tolerance depends on the content and the clip's length; the earlier windows it
  reviews run from about 75 ms of sound lead to 188 ms of lag for an action (a hammer on a peg), wider for speech
  (about 131 / 258 ms). STUDY (summary).
  https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.00736/full ;
  https://pmc.ncbi.nlm.nih.gov/articles/PMC4451240
- **[A3]** M. Chion, *Audio-Vision* (1994): the point of synchronization; analysing a film starts by locating its synch
  points and how they are distributed. BOOK (summary; `reels.md` [S3]). https://www.filmsound.org/chion/sync.htm
- **[A4]** "Mickey Mousing": music that tracks every on-screen action, long criticised as excess when used
  throughout. PRACTICE (summary; `reels.md` [S8]). https://en.wikipedia.org/wiki/Mickey_Mousing
- **[A5]** B. Conrey and D. B. Pisoni (2003), "Audiovisual asynchrony detection for speech and nonspeech signals",
  AVSP 2003: the detection threshold is narrower when the audio leads than when the video leads. STUDY (summary).
  https://www.isca-archive.org/avsp_2003/conrey03_avsp.html
- **[A6]** Auditory masking, Fletcher's critical band: a tone is just masked when its power equals the noise power in
  one critical band; noise outside the band does not matter. TEXTBOOK (summary).
  https://en.wikipedia.org/wiki/Auditory_masking ; MIT OCW HST.723J lecture notes on masking:
  https://ocw.mit.edu/courses/hst-723j-neural-coding-and-perception-of-sound-spring-2005/59720a09f7a0e6c4aa47b4f1e75dad9b_t1_masking.pdf
- **[A7]** The impact's transient on the contact frame, placed by frame, not by ear. PRACTICE / STUDY (summary;
  `craft.md` [C34]). https://morphic.com/resources/how-to/how-to-sync-sound-effects-to-video ;
  https://research.cs.cornell.edu/Sound/ifa/ifa.pdf
- **[A8]** Spotting: the team watches the locked cut and decides where every sound, music cue and silence goes; hit
  points are the moments a cue must line up with. PRACTICE (summary). https://en.wikipedia.org/wiki/Spotting_(filmmaking) ;
  https://sounddesign.irpr.agency/glossary/hit-point/ (a vendor glossary)
- **[A9]** A. Davis and M. Agrawala (2018), "Visual rhythm and beat": the picture's beat is a sudden change of speed.
  STUDY (summary; `craft.md` [C30]).
  https://openaccess.thecvf.com/content_cvpr_2018_workshops/papers/w49/Davis_Visual_Rhythm_and_CVPR_2018_paper.pdf
- **[A10]** Explainer practice: the sound pass comes after the animation, and only the moments that matter get sound.
  PRACTICE / VENDOR (summary; `craft.md` [C37]). https://kottke.org/18/01/the-soundtrack-to-kurzgesagt ;
  https://morphic.com/resources/use-cases/sound-effects-for-explainer-videos

**Our own sources** (read in full): `docs/v2/SOUND.md`, `audio/v2r/sheet.py`, `audio/v2r/premix.py`,
`audio/v2r/bed.py`, `audio/v2r/sfx.py`, `public/v2r/cue_sheet.json`, `public/v2r/voice_words_heard.json`,
`docs/v2/direction/beat_map.md`, `src/v2r/world/map.ts`, `src/v2r/scenes/V2S2_Board.tsx`, `src/v2r/kit/cast/Staff.tsx`,
`src/v2r/scenes/V2S2_Bench.tsx`, `docs/sound_plan.md`, `docs/motion_spec.md` §7, `audio/cues.json`,
`public/v3/animatic.json`, `src/v3/film/Film3.tsx`, `scripts/qa/gate_check.py`, `scripts/qa/av_lag.py`,
`scripts/qa/beatsync.py`, `docs/PIPELINE_V2.md`, `docs/G3_ANIMATIC.md`, `docs/G5_BLOCKING.md`, `docs/look/DIRECTION.md`,
`docs/look/CRAFT.md` §a, `docs/OWNER_PLAYBOOK.md`; the sibling lanes `reels.md` and `craft.md` (this folder) and the
composition study's `../composition/motion.md` §4.4.

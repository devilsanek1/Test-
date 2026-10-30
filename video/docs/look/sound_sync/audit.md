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
   plus a score with 15 story marks. Of the 56, **24 sit on their picture's frame (within 0.75 f)**, 6 come about
   1 f early, **17 come exactly 2 f early by design**, 3 come 3-5 f early by mistake, and 6 trail by 1-2 f (mostly
   swells, whose crest is broad). All 8 joins carry a sound whose crest lands within 30 ms (2 f) of the join's
   midpoint, and nothing else starts in the 0.32 s around a midpoint. A one-source cue sheet, a carrier sound on every join, a guard that keeps 37 hit words
   clear: "decently okay" is fair, and the machinery is worth keeping (Part 6).
2. **But we spend sync like a texture, and the reels spend it like money** (MEASURED). The reels put all their hard
   sync into the first 2.0-4.4 s and then rest (0 and 0.11 sync points a second after the release). Video 2 keeps
   **0.9-1.6 cues a second in every shot, to the last frame**: no rest, no single place where sync is the event. Our
   video 3 (no music, 18 cues: **14 in the first 4.04 s**, then 4 in 37 s) had the reels' shape; video 2 lost it;
   video 1 (170 cues, 3.1 a second, beat-locked cuts) never had it.
3. **Half of what we place is not heard** (EST). Of the 56 cues, **24 reach the ear as events, 21 are marginal and 11
   are buried more than 10 dB under the rest in their own band**; 42 of 56 land under the voice. Buried: the TOLD THE
   BBC board's clack, the S5>S6 tree wipe (a join's carrier), the cloth wipe, her quote's pen, and **the payoff's lamp
   run on "facts"**. A sync point the viewer cannot hear does no work.
4. **The payoff has no audible sync** (MEASURED). On "facts" (37.18 s, f2231) the score's accent 2 steps the bed up
   **+17.8 dB**, but the master moves **+0.7 dB**: the voice covers it. The reels' release is **+26 / +32 dB in the
   open**, with nothing talking over it. Accent 1 (the crane's landing, 22.43 s) is under "Pentagon" in the same way.
5. **Our best moments are the reels' own devices** (MEASURED). (a) The pause 12.81-13.16 s: the bed drops away
   (master -25.1 to -41.8 dBFS) and ONE lamp click lands on the B match at 12.983 s (f779), on the frame, heard at
   +23 dB: a quiet floor plus one hit on one discrete change (the reels' R7 + R1). (b) The hook's ghost count into
   "for life", whose last tick sits in a 0.25 s air dip (R2 into a small R8). (c) Frame 0's pen alone over air, no
   music for 6.28 s (R7; the playbook's "cinematic but subtle, especially at the start").
6. **The 2-frame early lead is a misread rule** (CODE, DOC). The v2 beat map's "hits may lead the sound by 1-2 frames,
   never trail it" was about the PICTURE leading the VOICE. The cue sheet turned it into "every word-synced effect 2
   frames before its own picture" (`audio/v2r/sheet.py` `lead()`). Research puts sound-early on the side viewers
   notice first (from about 45 ms; for an impact about 75 ms) (SOURCE); the reels sit at 0 f. Inside tolerance, but the
   wrong default: added to an event that starts a frame or two after its clock (a draw-on, a two-drawing close), it
   becomes 3-5 f early (the notebook's clap: 5 f, 83 ms, before the book shuts).
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
| **R2 the count-in** | 01: three knocks 32 f apart; 02: three word-hits 1.11-1.26 s apart | The hook's **ghost ticks**: six, at 1.967 / 2.500 / 3.167 / 3.767 / 4.200 / 4.767 s (f118-f286), 0.43-0.67 s apart (keyed to words, so uneven). Heard: ticks 1 (+14.1 dB, pause), 4 (+2.1) and 6 (+21.8, pause); ticks 2 and 3 sit under the **birds' wings (2.45-3.59 s, heard +4.7)**, tick 5 under "criticizing". The S8 callback is three ticks in 0.08 s: a roll, not a count | **PARTLY.** The count is in the picture (six ghosts) but the ear gets three uneven ticks 1.80 s and 1.00 s apart; a background life sound masks two of its beats |
| **R3 the late fourth** | 01-4: the click 6 f later than the pulse predicts; 02: the longest gap before the drop | Nothing designed. Closest: the bed's 12 dB air dip at 4.54-4.79 s (the "…"), tick 6 inside it, then "for life" with the outlines' pop | **MISSING** as a device (the hold exists, the bent timing does not) |
| **R4 the interface click** | 01-4: a bright two-tick click (8.6 kHz, peak 0 dBFS) on the player's reveal | **The exit ding** at 0.450 s (f27): two struck-glass notes rising a fourth (C6 to F6), the doors start to slide on the frame; heard just (+0.9 dB), held 8 dB under the voice by rule. **The thread's lamp clicks**: OFF 0.400 s (f24), ON 12.983 s (f779), ON 34.950 s (f2097), each on its frame | **USED.** The playbook's "positive phone sound in the first second" is this device. Ours is quiet: the reels' click is the loudest sound of its reel |
| **R5 cause, then effect** | 01-4 to 01-5: the click, then 0.48 s (29 f) later the song it starts | Lamp OFF (f24) then the ding and the doors (f27), then her step out (0.97 s): each with its sound; the lamp's OFF at 0.40 s is answered by ON at 12.98 and 34.95 s (the thread's own sound) | **USED** in the picture's logic (3 f apart, too close for the ear to hear cause then effect: the reels leave 29 f) |
| **R6 the word-on-hit** | 02-1..3: each title word pops whole on a soft low hit; the biggest word gets the lowest, loudest hit | 28 of the 56 cues are keyed to a spoken word (`lead()`); 12 of them are this device, a word, label or sign appearing on its word with a hit: the window outline on "one" (+23.0, heard), the name tag on "She" (+2.8), the DEC plate on "military" (+6.6), the plaque on "Pentagon" (+3.3); but the boards TOLD THE BBC (-13.4), GOOGLE SAYS (-10.4), SHE SAYS (-3.8), the purpose line (-5.6) and the F12 line (-2.9) are marginal or buried | **ADAPTED, half heard.** The reels' words have no voice over them; ours are said by the voice at the same moment, so the hit competes with the very word it marks (and loses, by our own rule: effects >= 8 dB under the voice) |
| **R7 the quiet floor** | 01: -44 dBFS between knocks; 02: falls to -41.8 dBFS before the drop | No music for the first 6.28 s (air only); the air dip 4.54-4.79 s; the pause 12.81-13.16 s (master -41.8 dBFS) holding the match click; the **held breath 36.18-36.54 s (master -47.6 dBFS)** before "talking about facts" | **USED.** This is our strongest habit |
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
| 7 | 1.97 (f118) | `ghost_tick_1` (f118) | ghost G1 draws on (f121-f125) (f121, seen) | +3.0 f (+50 ms): sound 3.0 f early | R2 count, tick 1 | pause | +14.1 | heard (pause), but 3 f EARLY on its first stroke |
| 8 | 2.50 (f150) | `ghost_tick_2` (f150) | ghost G2 (clock) (f152, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 count, tick 2 | "her" | -4.1 | marginal: covered by the birds' wings (#9) |
| 9 | 2.45 (f147) | `wings_1` (f147) | five far birds lift off the rail (tier C life) (f147, clock) | +0.0 f (+0 ms): on frame | in-shot life (the reels never sound it) | "contract" | +4.7 | ARBITRARY: heard (+4.7), and masks ticks 2-3 of the count |
| 10 | 3.17 (f190) | `ghost_tick_3` (f190) | ghost G3 (clock) (f192, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 count, tick 3 | a gap in speech | -1.8 | marginal: under the wings |
| 11 | 3.77 (f226) | `ghost_tick_4` (f226) | ghost G4 (clock) (f228, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 count, tick 4 | "from" | +2.1 | heard just (+2.1) |
| 12 | 4.20 (f252) | `ghost_tick_1` (f252) | ghost G5 (clock) (f252, clock) | -0.0 f (-0 ms): on frame | R2 count, tick 5 (not word-keyed) | "criticizing" | -0.6 | marginal: under "criticizing" |
| 13 | 4.77 (f286) | `ghost_tick_2` (f286) | ghost G6 (clock) (f288, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 count, tick 6 | pause | +21.8 | WORKS: in the 0.25 s air dip before "for life" (+21.8) |
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
| 48 | 33.75 (f2025) | `ghost_tick_3` (f2025) | ghost 1 pops ("can't") (f2027, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 callback: three ticks in 0.08 s (a roll, not a count) | "she" | -1.0 | marginal (-1.0) |
| 49 | 33.80 (f2028) | `ghost_tick_4` (f2028) | ghost 2 (f2030, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 callback | "can't" | -3.0 | marginal (-3.0) |
| 50 | 33.83 (f2030) | `ghost_tick_1` (f2030) | ghost 3 (f2032, clock) | +2.0 f (+33 ms): sound 2.0 f early | R2 callback | "can't" | -3.1 | marginal (-3.1) |
| 51 | 34.75 (f2085) | `door_latch` (f2085) | her door shuts behind her (f2085, clock) | -0.3 f (-5 ms): on frame | foley contact | "Google." | +17.2 | WORKS (+17.2) |
| 52 | 34.95 (f2097) | `lamp_click_2` (f2097) | W lights: her home lamp ON ("Google.") (f2097, detector) | +0.0 f (+0 ms): on frame | R4 click: the thread's answer | "Google." | +9.5 | WORKS (+9.5) |
| 53 | 35.68 (f2141) | `cloth_wipe` (f2143) | the cafe owner wipes the board (35.72-36.14) (f2144, clock) | +1.2 f (+20 ms): sound 1.2 f early | foley on a move | "in" | -12.5 | MASKED (-12.5) |
| 54 | 36.52 (f2191) | `pen_long` (f2191) | her quote pen-draws on ("talking") (f2193, clock) | +2.0 f (+33 ms): sound 2.0 f early | build sound | pause | -18.4 | MASKED (-18.4) |
| 55 | 37.28 (f2237) | `lamp_run` (f2237) | the lamps light west down the lane ("facts", the payoff) (f2237, clock) | +0.0 f (+0 ms): on frame | world reacts on the payoff word | "facts" | -14.8 | MASKED (-14.8): the payoff's sync is not heard |
| 56 | 38.82 (f2329) | `pen_unbuild` (crest f2345) | JOIN S8>S1: the un-build into frame 0, midpoint 38.95 (f2337, clock) | -7.9 f (-131 ms): sound 7.9 f late | J carrier: the pen reversed into frame 0's draw-on | pause | +13.7 | WORKS (+13.7) |

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

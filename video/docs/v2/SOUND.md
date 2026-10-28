# Video 2 sound: "Towpath" bed, the film's own SFX, the master (L7 / K9, revision 2)

Everything here is new for this film (owner: no reusable assets): no house bed, no `audio/sfx` kit, no platform sound.
Clock: voice take 2 (`public/v2/voice.wav`), heard times from `direction/beat_map.md`; the picture's times from
`THROUGHLINE.md` §3 (the joins), `src/v2r/film/scenes.json` and `src/v2r/world/map.ts`. Every file is exactly 2345 frames
(39.0833 s), so it loops with the video. Rebuild (~5 min): `python3 audio/v2r/bed.py && python3 audio/v2r/sfx.py &&
python3 audio/v2r/premix.py` (`python3 audio/v2r/field.py` once fetches the CC0 field recordings). One sheet:
`audio/v2r/sheet.py` (shots, joins, hit words, the life sounded, every cue).
Files: `public/v2r/music_bed.wav` (+ `audio/v2r/music_bed.mid`), `public/v2r/sfx/*.wav` (47 sounds),
`public/v2r/cue_sheet.json` (the bed at t 0 + 56 cues, `{src, t, gain, note, under_db, set_by}`), `public/v2r/mix.wav`
(the master: voice + bed + every cue), `public/v2r/cues.json` = `{"audio": "v2r/mix.wav", "sfx": []}`: Film2R now plays
the master in place of the voice (the browser's own sum of voice + bed + cues is unmastered: -15.1 LUFS, peaks near
0 dBTP).

## Revision 2 in one paragraph
DIRECTION.md and THROUGHLINE.md (approved after the draft) changed the joins: every join's sound now rides its CARRIER
and peaks on its MIDPOINT, and nothing but the carrier starts in [midpoint - 0.2, midpoint + 0.12) (no other cue, no
life sound, no lap, no music note: premix checks it). Pip never hops across a join, so its hop, leap and landing sounds
are gone. Frame 0 is the clean pen drawing the subject on, so its sound is a clean felt-tip glide (the scratchy pencil
is retired), and the loop's un-build rewinds into that same draw-on. "Alive but calm" (DIRECTION rule 3): the air sounds
only the life the conformed picture keeps, small and one at a time, and steps back under the music. The music
director's twelve items are all applied (table below; two adapted, with the reason).

## The bed's idea
One small window: her motif is a rising fourth on a felt upright piano (C -> F), the same interval as our exit ding at
0.45 s, so the first sound of her walking out is the tune she comes home to. F major; its relative D minor for the
staff's fear; B-flat lydian for the vast. CC0 instruments played by the script (felt piano, string pizzicato, contrabass
+ cello, pp violins, bowed vibraphone); the air is composed from CC0 field-recording grains (water laps, a far city, a
parkway, birds, leaves, a narrowboat, a bus, a fountain). Out of the voice's way: sustained notes below ~110 Hz or above
~800 Hz, mid-register only short pizzicati and a few soft piano notes; pre-ducked against the locked voice.

| heard time | the arc |
|---|---|
| 0.00-6.28 | NO music: canal air only; 4.54-4.79 the air dips 12 dB (the "…"); after "life" only air |
| 6.28 | two dry violin pizz notes C5 -> F5 (the ding's fourth): false relief on "You'd think…" |
| 8.44-12.81 | "But": the pulse steadies in D minor, thins on "scared", dies out by 12.81 (the window match is silent but its click) |
| 13.16 / 13.96 | air (pp violins + bowed vibes) and ONE high piano C6 on "she": the question, un-ducked |
| 15.07-17.96 | her walk: the motif C6 F6 E6 C6 over a walking pizz bass in tenths; it stops with her on "objected" |
| 18.92-20.10 | "military": a low D minor sustain + a pp open fifth high in the violins (A5 + D6), let go on "heading" |
| 20.70-24.00 | April air from "April" (after the sun push-through); 21.30 low strings + divided high violins open with the crane and swell; **22.43 soft accent 1** (lydian bloom), 2.5 dB up |
| 24.00-27.82 / 28.31-32.70 | the pulse, level and thin under the clause; Google's side the SAME pulse, notes, humanize and level (trimmed to ±0.4 dB) |
| 33.16-36.54 | the motif alone, quieter (C5 F5 E5 C5); held breath 36.18-36.54 |
| **37.18** | soft accent 2: E5 -> F5 resolves on "facts" (F add9); a circular tail thins into the hook's air |

No swell rides a camera move: the retired moves (S1's pull-out, S2's 6 % push, S6's truck, the seam push) never had one;
S5's crane, the ONE big move, keeps its swell.

## The joins (THROUGHLINE §3): the sound on each carrier, peaking on its midpoint (measured in the master)
| join | carrier | sound (cue) | peak vs midpoint |
|---|---|---|---|
| S1>S2 6.10 | A push-through into her dark window W (0.45 s since REVIEW_1 MUST 5: 5.875-6.325, the zoom seen from ~5.95) | `whoosh_dive:1` 5.95: air rises into the glass, a muffled bump on the plum bridge, settles by 6.27 | +20 ms |
| S2>S3 12.98 | B match: her dark office window = her lit home window | `lamp_click:2` 12.98: her lamp ON (the thread: OFF 0.40, ON here, ON 34.95) | +14 ms |
| S3>S4 14.86 | A push-through into her silhouette (0.45 s: 14.635-15.085) | `whoosh_dive:2` 14.71 (the callback, 3 dB softer) | +13 ms |
| S4>S5 20.55 | A push-through into the low October sun | `sun_through:1` 20.40: a glass shimmer swells into the light, a small A6 glass tink on the midpoint, 65 dB down by "In" 20.67 | -4 ms |
| S5>S6 23.80 | D wipe: a blossom tree crosses right to left | `tree_wipe` 23.62: a soft rush of leaves (CC0 rustle) and air, right to left, all under 2.2 kHz (the /f/ of "for") | +6 ms |
| S6>S7 28.10 | A push-through into the April sun | `sun_through:2` 27.95 (the callback) | +3 ms |
| S7>S8 32.93 | D wipe: the narrowboat glides west | `boat_pass` 32.70: its engine (CC0) with a small doppler glide and the bow wash, right to left; nothing before 32.70 | -27 ms |
| S8>S1 38.95 | B + un-build into frame 0 | `pen_unbuild` 38.82: S8's lines rewind (the pen reversed), turn into frame 0's draw-on at 38.95, crossfade 15 ms into `pen_drawon` at the seam | +29 ms |

## Every cue (on the picture's onset; word-synced cues 2 frames before the heard word; same idea = same file)
| shot | t (s) · sound · what |
|---|---|
| V2S1 | 0.00 pen_drawon (the clean pen draws her, the door, then W from frame 0, 0.00-0.39; the colour floods from the sun 0.44-0.80) · 0.40 lamp_click:1 (W goes dark) · **0.45 exit_ding** (C6 -> F6 struck glass, 58 ms apart; the first-second phone sound) + door_glide · 0.93 step_thup + letter_pops (done by 1.08) · 1.46 wings:1 (the far birds lift at 1.40) · 1.97 / 2.50 / 3.17 / 3.77 / 4.20 / 4.75 ghost_tick (ONE wooden tick, one pitch, per ghost) · 4.95 outline_pops + ear_flap ("life") · 5.95 whoosh_dive:1 |
| V2S2 | 6.78 window_outline (her window's outline pops on, "one") · 8.40 board_clack:2 (TOLD THE BBC) · 8.93 light_clicks (five switches in one step) · 9.45 notebook_flap · 10.26 blinds_five · 12.17 blind_thump · 12.70 notebook_clap · 12.98 lamp_click:2 (the match) |
| V2S3 | 14.71 whoosh_dive:2 |
| V2S4 | 15.03 pop_high:1 (name tag) · 16.60 pen_tick · 17.66 steps_stop · 18.88 plate_knock (DEC 2025) · 19.45 pen_short:1 (APR 2026) · 19.77 wings:2 · 20.40 sun_through:1 |
| V2S5 | 20.73 blossom_pops ("April") · 21.95 wipe_air (the lamppost, centred 22.10) · 22.40 pop_low (plaque, with accent 1) · 23.05 window_warm (ONE step) · 23.62 tree_wipe |
| V2S6 | 24.00 pop (the purpose line on "any") · 26.47 pop_high:2 (the F12 line on "veto") · 27.10 window_ticks (3 switch-ons) · 27.95 sun_through:2 |
| V2S7 | 28.33 board_clack:1 (GOOGLE SAYS) · 29.60 pen_short:2 · 30.20 lamp_run (3 switch-ons) · 30.74 pen_long · 32.70 boat_pass |
| V2S8 | 33.13 board_clack:1 (SHE SAYS) · 33.75 / 33.83 / 33.90 ghost_tick (-3 dB) · 34.75 door_latch · 34.95 lamp_click:2 (W lights) · 35.68 cloth_wipe · 36.50 pen_long · 37.28 lamp_run (= Google's) · 38.82 pen_unbuild |

Fairness (A5, Q9, V14): the board clack, the long pen and the lamp run are ONE file each at ONE gain on Google's board and
hers; Google's beat has no sting, no minor turn, no door sounds (its glass doors stay silent: they would echo her exit).

## Cues that moved, and why (against the paused draft)
| was | now | why |
|---|---|---|
| 0.00 pencil_flood (scratchy hatching) | 0.00 pen_drawon | DIRECTION rules 4 + 9: frame 0 is the clean pen drawing the subject on, then the flood. REVIEW_1 MUST 2 (fix pass A): the strokes start AT f0 and run 0.00-0.39 (re-touches at 0.12, 0.18, 0.27), the flood wash 0.44-0.80; the file is 0.86 s; gain 0.059 (set 20 dB under the voice); hit words pass (She 14.7, quit 10.2, Google 12.0 dB at 1-4 kHz); the seam crossfade still matched (rms step -0.63 dB, 2-8 kHz step 0.2 dB) |
| 0.45 exit_ding, 2nd strike +85 ms, +4 dB | 0.45, 2nd strike +58 ms, +3.2 dB | both mallets land in the /k/ closure of "quit", never on its burst; +3.2 keeps it 8 dB under the voice (TREATMENT §7) and still the first second's loudest |
| 5.95 whoosh_dive, peak +0.20 | 5.95 whoosh_dive:1, peak +0.15 | on the push-through's midpoint 6.10 |
| 6.82 pencil_ring (a drawn ring) | 6.78 window_outline (a pop) | the ring is board notation; her window's outline pops on in one frame (conform_L2 §1), 2 frames before "one" |
| 8.93 light_clicks (five over 0.17 s, 1.5-9 kHz) | 8.93 (five within 40 ms, under 2.6 kHz) | the five windows cool in ONE step (conform_L2 §6); a soft bank of switches leaves the /z s t/ of "Google's staff" free ("staff" 20.5 -> 32.0 dB over everything at 1-4 kHz) |
| 12.85 notebook_clap | 12.70 | map notebookShutAt 12.70: out of the join window 12.78-13.18 |
| 12.98 swap_pop | 12.98 lamp_click:2 | the B match is her window, dark -> lit: the thread's own sound (OFF at 0.40, ON at 34.95) |
| 13.10 pip_land, 14.70 pip_hop, 14.95 pip_land | - (and 14.71 whoosh_dive:2) | Pip keeps its seat across every join; the push-through into her is the new carrier |
| 20.45 glass_ting | 20.40 sun_through:1 | the push-through into SUN1: the tink on the midpoint 20.55, 65 dB down by "In" (no canal slap) |
| 20.73 calendar_flip | - | the calendar flip is retired (the sun as a character) |
| 21.95 wipe_air, 23.62 tree_wipe (full band) | the same times, under 2.8 / 2.2 kHz | the /t/ of "letting" and the /f/ of "for" keep their bands |
| 22.08 wipe_air, peak 22.23 | 21.95, peak 22.10 | the lamppost wipe was widened to 22.02-22.19: the air pass peaks on its middle |
| 23.05 window_ticks:1 (seven) | 23.05 window_warm (one) | the wing's windows warm in ONE flat step (map windowsWarmAt) |
| 23.90 pip_hop:2 | 23.62 tree_wipe | S5 -> S6 is the blossom-tree wipe (midpoint 23.80) |
| 24.00 board_clack:3 | - | the deal board is uncovered by the wipe, it never lands |
| 27.05 window_ticks:2 (seven in 0.6 s) | 27.10 window_ticks (three) | flash-safe facade (<= 3 switch-ons per second): 27.10 / 27.45 / 27.83, each in a vowel or the pause |
| 27.95 pip_hop:3, 28.00 glass_ting:2 | 27.95 sun_through:2 | the push-through into SUN2: the tink on the midpoint 28.10 |
| 30.18 lamp_run (seven tinks) | 30.20 lamp_run (three) | flash-safe run (<= 3 per second): 30.20 / 30.60 / 30.80, in "princ-I-ples", the pause, the end of "and" |
| pen_long at 19 dB under | 21 dB under, on both boards (A5) | its strokes run over the vowels of "talking": "talking" 6.5 -> 8.5 dB over everything at 4-10 kHz |
| 32.70 boat_chug (left to right, peak 33.15) | 32.70 boat_pass (right to left, peak 32.90) | the boat travels west (dir 'left'); nearest on the midpoint 32.93, ~16 dB down by "She" |
| 37.23 lamp_run (seven tinks) | 37.28 lamp_run (three) | 37.28 / 37.68 / 37.88: the vowels of "facts", "is", "not"; never in the /f/ (37.05-37.21), the /k/ (37.38-37.50) or the /ts/ (37.50-37.63) |
| 38.82 pencil_reverse | 38.82 pen_unbuild | the un-build rewinds the clean pen and turns into frame 0's draw-on at its midpoint 38.95 |
| pen_short (random strokes) | the same times, planned strokes | 19.45: a gap over the /z/ of "was" (19.69-19.75); 29.60: all strokes inside "AI", done by 29.90 |
| bed: April air 20.60 / 20.66 | 20.70 / 20.76 | out of the S4>S5 join window (20.35-20.67): it enters on "April" |
| air: S1 cyclist 0.25, duck 2.30, dog 2.80; S2 dog 10.40; S5 gulls 21.80 | - | cut from the conformed picture (conform_L1 §6, conform_L2 §5, conform_L4 §6) |
| air: S1 bus 1.10 (5.8 s, peak 4.6) | 0.40-2.70, nearest ~1.20 | it is in view ~0.25-2.3 (S1_BUS); far and small (C) |
| air: birds 14.66, 15.30, 20.12, 20.58, 26.70, 28.90 | 20.58 -> 21.25; the rest gone | in a join window (14.66, 20.12, 20.58), or under the voice beside another life sound or on Google's beat: one at a time, in pauses |
| air: S4 boat 14.86, S7 fountain 28.06 | 14.98, 28.22 (fading in) | a new shot's continuous life starts after its join's window |

## The music director's review: what was done
| item | done | measured now |
|---|---|---|
| 1 payoff masked | the long pen ends by 36.95 and sits 2 dB lower (both boards); lamp_run 6 dB down, three switch-ons clear of 37.18-37.26 and 37.38-37.50; the same on Google's (A5); premix checks every hit word | "facts" 33.1 / 55.3 dB over everything at 1-4 / 4-10 kHz, "is" 13.5 / 46.5, "not" 31.9 / 41.9, "principles" 27.4 / 35.1, "talking" 14.8 / 8.5; every hit word >= 6 (lowest 7.2 "use", 6.8 "her") |
| 2 hook words | letter_pops -6 dB, done by 1.08; outline_pops and ear_flap -5 dB, puffs >= 5 kHz, no sine blip; TONAL replaced by a measured tonality | "Google." 12.0 / 18.6, "life." 17.2 / 17.5 |
| 3 the ding | a struck glass chime (inharmonic partials, 1 ms mallet, tau 0.2 s); lamp_click -5, door_glide -6 dB. **Adapted:** +3.2 dB, not +4 (at +4 it sat 7.2 dB under the voice, against TREATMENT's >= 8), and its 2nd strike 58 ms after the 1st (both in the /k/ closure) | the first second's loudest SFX, 8.0 dB under the voice; it reads as a rising notification (C6 -> F6) |
| 4 phone | cello octave on every pulse note, saturated low strings, the C6 un-ducked, the air 7 dB down under music (laps 10), the contrabass 4 dB lighter and the mid voices up, high violins in the crane and on "military" | every arc section over the air on a 350 Hz speaker (+1.9 to +11 dB), 21-33 dB under the voice (was 35-38 and under the air); the share under 150 Hz 37-62 % (was 85-92) |
| 5 pumping | an 8 dB duck with a 500 ms hold; the static level keeps the 27 dB median; both pulses 2 velocity steps lighter, accent 1 2.5 dB up | no pause swells (loudest 100 ms in each pause vs the second before: <= +0.3 dB); every pause under both accents (>= 2.2 dB). **Note:** the review's own measure (max in a pause minus the MEDIAN before) still reads +9.1 at 25.60, +5.5 at 34.99, +5.2 at 36.18: those are the score's next notes (a pizz at 25.91, the motif's C5 at 35.17, the pickup at 36.51), not a release |
| 6 the air | composed from CC0 field-recording grains (14 recordings, below), the life the picture keeps, one at a time | no band cliffs (hook: 0.63-0.79 kHz +0.3 dB, 2.5-3.2 kHz +0.4 dB); events 12.7 dB over the floor (p95 - p10; peaks 16.0), 14.6 on a phone |
| 7 comb filter | stereo noise from independent seeds (dsp.decor); no sub-millisecond copies | the master's mono fold-down: worst notch -0.2 dB |
| 8 glass_tone | struck glass tinks (inharmonic, noise-excited, no canal slap); now the sun push-throughs' tink | 65 dB down 0.12 s after the midpoint ("In"), 78 dB by "But" |
| 9 synthetic hits | every impact a struck object with a noise body, the contact of the hit and ONE shared outdoor slap; round-robin variants; one seeded humanize shared by both pulses; the ghost tick and the door woodier | energy in the 4 strongest partials (the review's measure): board_clack 65 % (was 99.8), ghost_tick 59-64 % (77 + a sine), plate_knock 53 % (94); no identical sample repeats |
| 10 seam dropout | cue overflow wraps circularly; the un-build ends exactly 15 ms past the seam and crossfades into the draw-on at a matched level | deepest 5 ms dip at the seam -3.0 dB (was a ~5 ms notch to -47 dBFS); 2-8 kHz step +0.2 dB |
| 11 consonants | word-synced cues 2 frames before the word; pop_high at 26.47 | no cue starts 0-12 ms after a word onset |
| 12 checked fine | kept | -14.01 LUFS, -1.25 dBTP; no clicks of ours (the 7 flags are the voice's own plosives) |

## Levels and the mix (measured by `premix.py`, `bed.py`; speech = the voiced spans; momentary 400 ms)
| measure | result |
|---|---|
| master `mix.wav` (glue 1.5:1, true-peak limiter) | **-14.01 LUFS, -1.25 dBTP**, 48 kHz |
| music under the speaking voice | median **26.9 dB**, p5 18.8, min 13.7 (house: ~27, never < 12) |
| air under the voice / the whole bed | median 32.2 dB / min 12.8 dB (the hook's air sits 21 dB under the speech level before its duck) |
| SFX under the voice | every cue >= 8.0 dB under where it lands; the bus median 22.2, min 7.6 (the ding's 400 ms) |
| 1-4 kHz: voice over everything | median 18.8 dB, min 1.1 (one 400 ms window); every hit word >= 6 dB at 1-4 and 4-10 kHz |
| the arc (music, momentary medians) | walk -39.7 · crane -41.4 · **landing -34.2** · clause -39.2 = Google -39.2 · alone -44.4 · **facts -35.5** |
| joins | every carrier within 30 ms of its midpoint; nothing else starts in a join window (cues, life, birds, notes) |
| loop seam | sample step 0.45x typical; level +1.3 dB; deepest 5 ms dip -3.0 dB; 2-8 kHz +0.2 dB; the bed circular |

## Handover
- The film plays the master: `public/v2r/cues.json` = `{"audio": "v2r/mix.wav", "sfx": []}` (Film2R's `useCues`); the
  cue list itself is `cue_sheet.json`. No K8 change is needed.
- W4: re-spot `sheet.CUES` (and LIFE / BIRDS) from the FINAL picture (±1 frame) and rerun the three commands; the gains,
  the word guard and the join checks re-derive themselves.
- The picture should light on the sound's frames (REQUESTS in the report): S7's run 1812 / 1836 / 1848, S8's run 2237 /
  2261 / 2273 (A5: the same offsets), S6's facade 1626 / 1647 / 1670, S6's F12 line 1588.
- Not yet heard by a human: check once on phone speakers and once on earbuds (the ding, the ticks, the sun tinks, the
  boat, the crane swell).

## Licences
Instruments: VSCO 2 CE (Versilian Studios; upright piano by Simon Dalzell / Ivy Audio) and VCSL, CC0 1.0, downloaded
to `$SOUND_SAMPLES` (not committed; `docs/sound_credits.md`). Field recordings (freesound.org, every one CC0 1.0, fetched
and sha256-checked by `audio/v2r/field.py`, not committed): 426894 danner (rooftop city), 208502 monotraum (distant
highway: the parkway), 758858 Alex_hears_things and 480838 craigsmith (laps), 318064 ceich93 (river lapping), 418425
naturenotesuk (robin), 409145 baryy (London birds), 147594 kvgarlic (cardinal), 616969 TRP (American robin), 626652
Epease123 (spring birds), 347557 Kinoton (leaves), 138247 Hupguy (bus), 576577 gazbooth (narrowboat engine), 415027
roman_cgr (fountain). Every SFX is synthesised in `audio/v2r/sfx.py` except the shaped grains of boat_pass and tree_wipe.
Tools only: numpy, scipy, pedalboard, pretty_midi, pyloudnorm, soxr, librosa, ffmpeg.

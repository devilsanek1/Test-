# VO timing: source of truth (v2 take)

Owner: timing stream. Data: `assets/timing.json` (v2). Audio: `assets/vo_v2_eleven.wav` (ElevenLabs, 48 kHz mono PCM).
The previous take is archived as `assets/timing_v1.json` (for `assets/vo.mp3`, 70.687 s). `assets/timewarp_v1_to_v2.json` and `scripts/timewarp.py` move anything timed on v1 onto v2.
All times are in **seconds from the first audio sample**, with 3 decimals. To get a frame number, use `Math.round(t * fps)`; the `@30` columns assume 30 fps.

## v1 to v2 delta

| | v1 (`vo.mp3`) | v2 (`vo_v2_eleven.wav`) | Change |
|---|---|---|---|
| File length | 70.687 | 77.760 | **+7.07 s (+10.0 %)** |
| VO span (voStart to voEnd) | 0.040 to 70.445 | 0.035 to 77.560 | +7.12 s |
| Time inside words | 63.00 | 64.38 | +1.37 s (+2.2 %) |
| Pauses of 120 ms or more (count / total) | 28 / 6.13 | 30 / 11.97 | +5.85 s |
| Pauses of 300 ms or more | 7 | 18 | |
| Captions (same pages, lines, highlights) | 38 | 38 | shortest 0.97 s (v1 0.84 s) |

**Where the extra time comes from:** about 5.8 s of the 7.1 s is longer pauses, mostly between sentences. The words themselves are only 1.4 s (2 %) slower. The drift therefore grows in steps at sentence breaks, not evenly:

| Sentence starts | v1 | v2 | Drift |
|---|---|---|---|
| 1. Government websites in four countries ... | 0.160 | 0.125 | -0.04 |
| 4. Fixing a bug like that takes two steps... | 10.880 | 11.700 | +0.82 |
| 8. And for 14 years, nobody did.... | 18.558 | 20.535 | +1.98 |
| 10. Except, the details of the bug leaked ... | 30.615 | 33.080 | +2.46 |
| 11. Cloudflare, which protects a big chunk... | 35.604 | 38.850 | +3.25 |
| 13. So now comes step two, the slow one.... | 45.452 | 49.815 | +4.36 |
| 15. If a site can't update fast enough, th... | 54.556 | 60.075 | +5.52 |
| 17. And one in three sites on PHP runs a v... | 60.552 | 67.000 | +6.45 |
| 18. For those, it's switch off or hope the... | 66.665 | 73.515 | +6.85 |
| End of VO | 70.445 | 77.560 | +7.12 |

Biggest pacing changes:

- Break after "out." (into "Cloudflare, which protects..."): 189 → 640 ms (+451 ms) at v2 38.210.
- Break after "in." (into "So now comes..."): 115 → 560 ms (+445 ms) at v2 49.255.
- Break after "did." (into "And one in..."): 159 → 595 ms (+436 ms) at v2 66.405.
- Break after "did." (into "Then, in August,..."): 349 → 770 ms (+421 ms) at v2 23.135.
- Break after "evening." (into "Nobody knows yet..."): 159 → 565 ms (+406 ms) at v2 47.070.
- Break after "one." (into "Someone has to..."): 124 → 520 ms (+396 ms) at v2 52.135.
- Sentences spoken slower: #3 "They were fixing a..." +0.43 s; #10 "Except, the details of..." +0.33 s; #14 "Someone has to install..." +0.27 s. Everything else is within ±0.15 s.
- Every sentence break is now at least 255 ms long (in v1 the shortest was 115 ms). 14 of the 17 breaks are 400 ms or more. Scene changes at sentence boundaries now have room, and visual holds between beats get longer.

## Conventions

- `words[i].s` is the audible onset of the word. For stops (p, t, k, b) it is the release burst, for s/sh/ch it is the start of the hiss, and after silence it is where energy rises.
- `words[i].e` is where the word's energy falls below -48 dBFS before a gap (this take's silence floor is about -86 dBFS). In connected speech it equals the next word's `s`.
- `pauses` lists every gap of at least 120 ms between `words[after].e` and `words[after+1].s`. `kind` is `sentence`, `comma` or `phrase` (a pause the transcript has no punctuation for).
- `captions[k].e` is the next caption's `s`, and the last caption runs to `duration`. `lines[n].s` is the start of the line's first word. `highlights[0].s` is the start of the highlighted word. `lines[n].words` and `captions[k].words` hold `[firstIdx, lastIdx]` into `words`. The chunking is identical to v1: same 38 pages, same lines, same highlight words.
- `stress` (0 to 1) is a percentile rank of acoustic prominence, with function words damped. `hits` holds every word with stress of 0.9 or more, plus every numeral.
- `duration` = 77.76 s is the WAV length (`decodedDuration` is the same; there is no codec offset).

## Global

| Key | Value | Note |
|---|---|---|
| `voStart` | 0.035 | First audible energy: the voiced lead-in of "G". The /g/ burst is at 0.125. |
| first word | 0.125 | "Government" |
| `voEnd` | 77.560 | End of "out." |
| lead-in | 0.000 to 0.035 | None to speak of: frame 1 must already be the hook. |
| tail | 77.560 to 77.760 (0.200 s) | Short: start the loop-back motion under the last phrase. |
| words / sentences / pauses / captions | 230 / 18 / 30 / 38 | |

## Sentences

| # | Start | End | Dur | @30 | Words | Text |
|---|---|---|---|---|---|---|
| 1 | 0.125 | 3.415 | 3.29 | 4 | 0-8 | Government websites in four countries just switched themselves off. |
| 2 | 3.695 | 4.525 | 0.83 | 111 | 9-11 | Nobody hacked them. |
| 3 | 4.950 | 11.260 | 6.31 | 148 | 12-31 | They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites. |
| 4 | 11.700 | 13.800 | 2.10 | 351 | 32-39 | Fixing a bug like that takes two steps. |
| 5 | 14.055 | 15.025 | 0.97 | 422 | 40-43 | First, you find it. |
| 6 | 15.355 | 16.865 | 1.51 | 461 | 44-48 | Then, you fix it everywhere. |
| 7 | 17.380 | 19.970 | 2.59 | 521 | 49-57 | You'd think finding it is the hard part, right? |
| 8 | 20.535 | 23.135 | 2.60 | 616 | 58-63 | And for 14 years, nobody did. |
| 9 | 23.905 | 32.520 | 8.62 | 717 | 64-92 | Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew. |
| 10 | 33.080 | 38.210 | 5.13 | 992 | 93-106 | Except, the details of the bug leaked online hours before the fix came out. |
| 11 | 38.850 | 47.070 | 8.22 | 1166 | 107-131 | Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening. |
| 12 | 47.635 | 49.255 | 1.62 | 1429 | 132-138 | Nobody knows yet how many got in. |
| 13 | 49.815 | 52.135 | 2.32 | 1494 | 139-146 | So now comes step two, the slow one. |
| 14 | 52.655 | 59.515 | 6.86 | 1580 | 147-170 | Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit. |
| 15 | 60.075 | 64.510 | 4.44 | 1802 | 171-188 | If a site can't update fast enough, the safest thing is to switch it off until it can. |
| 16 | 65.065 | 66.405 | 1.34 | 1952 | 189-194 | That's what those government sites did. |
| 17 | 67.000 | 73.110 | 6.11 | 2010 | 195-216 | And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore. |
| 18 | 73.515 | 77.560 | 4.05 | 2205 | 217-229 | For those, it's switch off or hope the hosting company sorts it out. |

## Pauses (>= 120 ms)

Pauses of 300 ms or more are in **bold**. These are the natural places for scene changes, flips and un-builds.

| # | Start | End | Dur (ms) | @30 | After | Before | Kind |
|---|---|---|---|---|---|---|---|
| 1 | 3.415 | 3.695 | 280 | 102-111 | off. | Nobody | sentence |
| 2 | 4.525 | 4.950 | **425** | 136-148 | them. | They | sentence |
| 3 | 7.110 | 7.375 | 265 | 213-221 | PHP, | the | comma |
| 4 | 11.260 | 11.700 | **440** | 338-351 | websites. | Fixing | sentence |
| 5 | 13.800 | 14.055 | 255 | 414-422 | steps. | First, | sentence |
| 6 | 15.025 | 15.355 | **330** | 451-461 | it. | Then, | sentence |
| 7 | 16.865 | 17.380 | **515** | 506-521 | everywhere. | You'd | sentence |
| 8 | 19.285 | 19.635 | **350** | 579-589 | part, | right? | comma |
| 9 | 19.970 | 20.535 | **565** | 599-616 | right? | And | sentence |
| 10 | 21.990 | 22.245 | 255 | 660-667 | years, | nobody | comma |
| 11 | 23.135 | 23.905 | **770** | 694-717 | did. | Then, | sentence |
| 12 | 24.915 | 25.075 | 160 | 747-752 | August, | two | comma |
| 13 | 27.545 | 27.715 | 170 | 826-831 | it | and | phrase |
| 14 | 30.065 | 30.340 | 275 | 902-910 | PHP | so | phrase |
| 15 | 32.520 | 33.080 | **560** | 976-992 | knew. | Except, | sentence |
| 16 | 33.870 | 34.120 | 250 | 1016-1024 | Except, | the | comma |
| 17 | 36.290 | 36.655 | **365** | 1089-1100 | online | hours | phrase |
| 18 | 38.210 | 38.850 | **640** | 1146-1166 | out. | Cloudflare, | sentence |
| 19 | 45.510 | 45.765 | 255 | 1365-1373 | minutes, | and | comma |
| 20 | 47.070 | 47.635 | **565** | 1412-1429 | evening. | Nobody | sentence |
| 21 | 49.255 | 49.815 | **560** | 1478-1494 | in. | So | sentence |
| 22 | 51.205 | 51.560 | **355** | 1536-1547 | two, | the | comma |
| 23 | 52.135 | 52.655 | **520** | 1564-1580 | one. | Someone | sentence |
| 24 | 55.295 | 55.580 | 285 | 1659-1667 | site, | and | comma |
| 25 | 59.515 | 60.075 | **560** | 1785-1802 | hit. | If | sentence |
| 26 | 61.895 | 62.095 | 200 | 1857-1863 | enough, | the | comma |
| 27 | 64.510 | 65.065 | **555** | 1935-1952 | can. | That's | sentence |
| 28 | 66.405 | 67.000 | **595** | 1992-2010 | did. | And | sentence |
| 29 | 73.110 | 73.515 | **405** | 2193-2205 | anymore. | For | sentence |
| 30 | 75.335 | 75.585 | 250 | 2260-2268 | off | or | phrase |

There is also a lead-in of 0.000 to 0.035 and a tail of 77.560 to 77.760. Every sentence break is a pause of at least 120 ms.

## Caption beats

Grammar: at most 2 centered lines, each of 24 characters or fewer. Each caption is a natural phrase and replaces the previous one at a phrase boundary. Line 2 appears when its first word is spoken. A caption has at most one highlight, which starts when its word starts. Every caption is on screen for at least 0.8 s. The text keeps the transcript's punctuation, and the renderer may drop trailing commas and periods. Pages, lines and highlight words are identical to v1; only the times changed.

| # | In | Out | Dur | Line 1 | Line 2 (in) | Highlight (in) | v1 in |
|---|---|---|---|---|---|---|---|
| 1 | 0.125 | 2.025 | 1.90 | Government websites | in four countries (1.075) | **four** (1.245) | 0.160 |
| 2 | 2.025 | 3.695 | 1.67 | just switched | themselves off. (2.685) | **themselves** (2.685) | 2.155 |
| 3 | 3.695 | 4.950 | 1.26 | Nobody hacked them. |  | **Nobody** (3.695) | 3.741 |
| 4 | 4.950 | 7.375 | 2.42 | They were fixing | a security bug in PHP, (5.435) | **PHP** (6.405) | 4.834 |
| 5 | 7.375 | 9.275 | 1.90 | the programming language | behind WordPress (8.330) | **WordPress** (8.575) | 7.065 |
| 6 | 9.275 | 11.700 | 2.42 | and about 7 out of 10 | websites. (10.595) | **7** (9.535) | 8.895 |
| 7 | 11.700 | 14.055 | 2.36 | Fixing a bug like that | takes two steps. (12.785) | **two** (13.095) | 10.880 |
| 8 | 14.055 | 15.355 | 1.30 | First, you find it. |  | **find** (14.645) | 13.100 |
| 9 | 15.355 | 17.380 | 2.02 | Then, you fix it | everywhere. (16.305) | **everywhere** (16.305) | 14.228 |
| 10 | 17.380 | 20.535 | 3.16 | You'd think finding it | is the hard part, right? (18.455) | **hard** (18.765) | 15.769 |
| 11 | 20.535 | 23.905 | 3.37 | And for 14 years, | nobody did. (22.245) | **14** (20.800) | 18.558 |
| 12 | 23.905 | 26.105 | 2.20 | Then, in August, | two security teams (25.075) | **August** (24.405) | 21.606 |
| 13 | 26.105 | 27.715 | 1.61 | using AI tools | found it (27.175) | **AI** (26.375) | 23.885 |
| 14 | 27.715 | 30.340 | 2.62 | and quietly told | the people who make PHP (28.685) | **quietly** (27.970) | 25.527 |
| 15 | 30.340 | 33.080 | 2.74 | so a fix could be ready | before anyone else knew. (31.435) | **before** (31.435) | 27.902 |
| 16 | 33.080 | 36.655 | 3.58 | Except, the details | of the bug leaked online (34.685) | **leaked** (35.150) | 30.615 |
| 17 | 36.655 | 38.850 | 2.20 | hours before | the fix came out. (37.345) | **hours** (36.655) | 33.838 |
| 18 | 38.850 | 40.165 | 1.31 | Cloudflare, | which protects (39.585) | **Cloudflare** (38.850) | 35.604 |
| 19 | 40.165 | 41.540 | 1.38 | a big chunk of the web, |  | **big** (40.355) | 36.905 |
| 20 | 41.540 | 43.285 | 1.74 | says it saw | tens of thousands (42.190) | **thousands** (42.825) | 38.208 |
| 21 | 43.285 | 44.250 | 0.97 | of break-in attempts |  | **break-in** (43.370) | 39.895 |
| 22 | 44.250 | 45.765 | 1.52 | in 45 minutes, |  | **45** (44.485) | 40.895 |
| 23 | 45.765 | 47.635 | 1.87 | and millions by evening. |  | **millions** (45.925) | 42.304 |
| 24 | 47.635 | 49.815 | 2.18 | Nobody knows yet | how many got in. (48.435) | **Nobody** (47.635) | 43.785 |
| 25 | 49.815 | 52.655 | 2.84 | So now comes step two, | the slow one. (51.560) | **two** (50.880) | 45.452 |
| 26 | 52.655 | 55.580 | 2.92 | Someone has to install | that fix on every site, (53.725) | **every** (54.550) | 47.786 |
| 27 | 55.580 | 58.435 | 2.86 | and there are about | 22 million copies of PHP (56.145) | **22** (56.145) | 50.540 |
| 28 | 58.435 | 60.075 | 1.64 | out there | that could be hit. (58.765) | **hit** (59.275) | 53.375 |
| 29 | 60.075 | 62.095 | 2.02 | If a site can't update | fast enough, (61.255) | **can't** (60.560) | 54.556 |
| 30 | 62.095 | 63.825 | 1.73 | the safest thing | is to switch it off (62.815) | **switch** (63.080) | 56.472 |
| 31 | 63.825 | 65.065 | 1.24 | until it can. |  |  | 58.215 |
| 32 | 65.065 | 67.000 | 1.94 | That's what those | government sites did. (65.560) | **government** (65.560) | 59.051 |
| 33 | 67.000 | 68.905 | 1.91 | And one in three | sites on PHP (67.775) | **one** (67.095) | 60.552 |
| 34 | 68.905 | 70.395 | 1.49 | runs a version so old |  | **old** (69.995) | 62.425 |
| 35 | 70.395 | 72.140 | 1.75 | that the people | who make PHP (71.035) |  | 63.855 |
| 36 | 72.140 | 73.515 | 1.38 | don't fix it anymore. |  | **don't** (72.140) | 65.556 |
| 37 | 73.515 | 75.585 | 2.07 | For those, | it's switch off (74.335) | **switch** (74.530) | 66.665 |
| 38 | 75.585 | 77.760 | 2.18 | or hope the hosting | company sorts it out. (76.655) | **hope** (75.865) | 68.644 |

## Hit moments (sync visual punches here)

### Numbers and stats

| Time | @30 | Word | Stress | Note |
|---|---|---|---|---|
| 1.245 | 37 | four | 0.94 | four (countries) |
| 9.535 | 286 | 7 | 0.90 | 7 (out of 10) |
| 10.290 | 309 | 10 | 0.58 | 10 (websites) |
| 13.095 | 393 | two | 0.44 | two (steps) |
| 20.800 | 624 | 14 | 1.00 | 14 (years) |
| 21.400 | 642 | years, | 0.98 | years: held for about 0.6 s, then a 255 ms pause |
| 25.075 | 752 | two | 0.65 | two (security teams) |
| 42.190 | 1266 | tens | 0.83 | tens (of thousands) |
| 42.825 | 1285 | thousands | 0.81 | thousands |
| 44.485 | 1335 | 45 | 0.84 | 45 (minutes). The /f/ is soft and the vowel lands about 40 ms later. |
| 45.925 | 1378 | millions | 0.98 | millions |
| 50.880 | 1526 | two, | 0.78 | (step) two |
| 56.145 | 1684 | 22 | 0.67 | 22 (million) |
| 56.775 | 1703 | million | 0.80 | million |
| 67.095 | 2013 | one | 0.72 | one (in three) |
| 67.525 | 2026 | three | 0.48 | three |

### Strongest emphasis (acoustic stress of 0.9 or more, numbers excluded)

| Time | @30 | Word | Stress | Sentence |
|---|---|---|---|---|
| 0.125 | 4 | Government | 0.94 | 1 |
| 3.695 | 111 | Nobody | 0.93 | 2 |
| 8.575 | 257 | WordPress | 0.91 | 3 |
| 14.055 | 422 | First, | 0.99 | 5 |
| 18.765 | 563 | hard | 0.93 | 7 |
| 24.405 | 732 | August, | 0.97 | 9 |
| 27.175 | 815 | found | 0.91 | 9 |
| 27.970 | 839 | quietly | 0.97 | 9 |
| 28.460 | 854 | told | 0.93 | 9 |
| 30.545 | 916 | fix | 1.00 | 9 |
| 33.080 | 992 | Except, | 0.96 | 10 |
| 36.655 | 1100 | hours | 0.96 | 10 |
| 38.850 | 1166 | Cloudflare, | 0.99 | 11 |
| 50.545 | 1516 | step | 0.90 | 13 |
| 51.610 | 1548 | slow | 0.95 | 13 |
| 60.205 | 1806 | site | 0.95 | 15 |
| 62.145 | 1864 | safest | 0.92 | 15 |
| 65.560 | 1967 | government | 0.90 | 16 |
| 69.995 | 2100 | old | 0.92 | 17 |
| 74.530 | 2236 | switch | 0.97 | 18 |

### Top 12 punches (curated: meaning × prominence; same beats as v1)

1. **2.685** (frame 81): "themselves (off)": the hook payoff
1. **3.695** (frame 111): "Nobody (hacked them)": first twist
1. **9.535** (frame 286): "7 out of 10": scale reveal
1. **20.800** (frame 624): "14 years": slow-burn number, then a 255 ms pause after "years,"
1. **26.375** (frame 791): "AI (tools)": the discovery beat
1. **35.150** (frame 1054): "leaked": the turn (560 ms pause before "Except,")
1. **38.850** (frame 1166): "Cloudflare": new act, after a 640 ms pause
1. **42.190** (frame 1266): "tens of thousands": attack-counter start
1. **44.485** (frame 1335): "45 minutes": counter / clock hit
1. **45.925** (frame 1378): "millions": counter peak
1. **56.145** (frame 1684): "22 million (copies)": scale beat
1. **67.095** (frame 2013): "one in three": final stat

### Structural beats

- Longest pauses (best spots for flips, un-builds and scene changes): after "right?" 19.970 to 20.535 (**565 ms**); after "did." 23.135 to 23.905 (**770 ms**); after "knew." 32.520 to 33.080 (**560 ms**); after "out." 38.210 to 38.850 (**640 ms**); after "evening." 47.070 to 47.635 (**565 ms**); after "did." 66.405 to 67.000 (**595 ms**).
- Hook: the VO starts at 0.035. "off." ends at 3.415, then a 280 ms pause before "Nobody" (3.695).
- Two-step setup: "First," 14.055 / "Then," 15.355. "right?" (19.635) sits alone between pauses of 350 and 565 ms.
- Act change: "knew." ends 32.520, then 560 ms, then "Except," 33.080, then 250 ms before "the details" (34.120).
- Ending: "switch off" 74.530 to 75.335, then a 250 ms pause, then "or hope..." 75.585 to 77.560. The tail is 0.200 s.

## Using the v1 → v2 time-warp

`assets/timewarp_v1_to_v2.json` holds 462 anchor pairs `[v1_time, v2_time]`: every word start and end in both takes, plus the file start and the file ends (70.687 → 77.76). `labels` names each anchor. `scripts/timewarp.py` interpolates linearly between anchors, so a v1 time inside a pause lands proportionally inside the matching v2 pause.

```bash
python3 scripts/timewarp.py --t 9.18 30.6 41.05                       # map single times
python3 scripts/timewarp.py src/data/scenes_v1.json --dry-run         # show what would change
python3 scripts/timewarp.py src/data/scenes_v1.json -o src/data/scenes.json
python3 scripts/timewarp.py IN.json -o OUT.json --keys s,e,start --add-keys voStart   # choose keys
python3 scripts/timewarp.py assets/timing_v1.json --compare assets/timing.json        # self-test
```

- By default the keys `s, e, t, t0, t1, start, end, at, time` are warped. `dur` is recomputed as end minus start in the same object. Every other value is left as is.
- In 9 places v1 ran two words together but v2 has a gap between them. The map jumps there, and the value at that exact instant is the later side, the next word's start. This keeps starts and "until the next beat" ends exact. Pass `--end-keys e` for word-end style fields to take the earlier side.
- Validation: warping `timing_v1.json` reproduces the v2 captions exactly (179 caption times, max error 0.000 s; tolerance 0.03 s). With `--end-keys e` it also reproduces all 460 word starts and ends exactly.

## Method and audio-vs-transcript notes

- **Word list.** The words are the BRIEF transcript, token for token. Parakeet's "seven" and "ten" are mapped back to "7" and "10", and the glued tokens "for14", "in45", "about22" and "aversion" are split at the bare word-boundary token. Each start is the median of 8 Parakeet runs at 10 ms sub-frame offsets.
- **Split boundaries, taken from the audio:**
  - about | 7 at **9.535**: the /s/ hiss starts right after the /t/ closure of "about". The ASR said 9.68, which is mid-hiss.
  - of | 10 at **10.290**: /t/ burst after a 60 ms closure.
  - for | 14 at **20.800**: the second /f/ frication after "for".
  - in | 45 at **44.485**: the /f/ cannot be separated from the noisy "in". This is the ASR boundary, and the vowel onset is about 44.53.
  - about | 22 at **56.145**: /t/ burst after the closure.
  - a | version at **69.240**: /v/ onset. "a" is at 69.165.
- **Refinement.** The same pipeline as v1: a 20 ms RMS envelope at a 5 ms hop, onset strength and 4 to 11 kHz band energy. Starts that fell inside silence move to the next onset; an onset after silence wins; s/sh/ch words snap to the hiss onset; stop-initial words snap to the burst; otherwise the ASR start is kept. Doubtful spots were checked on spectrograms and by truncating the clip and re-running the ASR, and 25 starts were set by hand.
- **Raw ASR starts that were off by 100 ms or more:** "Government" 0.00→0.125, "switched" 2.24→2.135, "them." 4.48→4.330, "They" 4.80→4.950, "7" 9.68→9.535, "steps." 13.36→13.255, "years," 21.52→21.400, "did." 23.20→22.775, "so" 30.24→30.340, "knew." 32.40→32.265, "the" 33.92→34.120, "details" 34.16→34.295, "leaked" 35.28→35.150, "out." 38.16→37.975, "Cloudflare," 38.72→38.850, "Nobody" 47.52→47.635, "the" 51.44→51.560, "of" 57.60→57.715, "If" 59.92→60.075, "That's" 64.96→65.065, "did." 66.32→66.200, "And" 66.88→67.000, "so" 69.76→69.550, "switch" 74.64→74.530. The largest are "did." (the raw ASR said 23.20, but the /d/ burst is at 22.775, which truncation confirms), "so" (old) (the /s/ is drawn out from 69.55), and "years" (21.40, again late in the raw ASR as in v1).
- **Cross-check with Whisper small.en** on v2: the wording matches the transcript with one exception. Whisper hears "says it *sought* tens of thousands" where the transcript and Parakeet have "saw". This is the usual "saw it" → "sought" ASR slip, not a change in the script. Whisper's other differences are only punctuation and casing ("Except the", "CloudFlare", "switch off, or"). Parakeet on v2 matches word for word, apart from writing out "seven" and "ten".
- **Audio vs transcript.** No word differs. Pauses the transcript has no punctuation for: after "it" (170 ms), after "PHP" (275 ms), after "online" (365 ms), after "off" (250 ms). The ElevenLabs take has clean digital silence between phrases, at about -86 dBFS. "Government" starts with about 90 ms of voicing before the /g/ burst. "did." and "years," are drawn out, as in v1.
- **Stress.** For each word: loudness (90th percentile dB), pitch (90th percentile f0) and duration per syllable, each normalised against the words within ±2.5 s and weighted 0.45 / 0.35 / 0.20. Function words ×0.45, numerals ×1.15, then a percentile rank.
- **Validation.** All checks passed: the words equal the transcript; times are monotonic; the pause list is complete; the sentences tile the words; the captions cover every word exactly once and in order; there are at most 2 lines of 24 characters or fewer; every line and highlight `s` equals its word's start; there is at most one highlight per caption; every caption is at least 0.8 s long; captions are contiguous; and each highlight's first substring match lands on the intended word. The chunking also matches v1 page for page.

<details><summary>Validation script (run: <code>python3 validate.py assets/timing.json docs/BRIEF.md</code>)</summary>

```python
"""Validate assets/timing.json against docs/BRIEF.md transcript and the caption grammar."""
import json, re, sys
tj = sys.argv[1] if len(sys.argv) > 1 else '/home/user/Test-/video/assets/timing.json'
brief = sys.argv[2] if len(sys.argv) > 2 else '/home/user/Test-/video/docs/BRIEF.md'
d = json.load(open(tj))
tx = ' '.join(open(brief).read().split('## Transcript', 1)[1].split('\n## ', 1)[0].split())
norm = lambda s: re.sub(r"[^a-z0-9]", '', s.lower())
errs = []
def check(c, msg):
    if not c: errs.append(msg)
W = d['words']
# 1. words == transcript
check(norm(''.join(w['w'] for w in W)) == norm(tx), 'word concat != transcript (normalized)')
check([w['w'] for w in W] == tx.split(' '), 'word tokens != transcript tokens (exact)')
check([w['i'] for w in W] == list(range(len(W))), 'word indices not 0..n-1')
# 2. monotonic times
check(0 <= d['voStart'] <= W[0]['s'], 'voStart after first word')
check(W[-1]['e'] <= d['voEnd'] + 1e-9 and d['voEnd'] <= d['duration'], 'voEnd/duration order')
for a, b in zip(W, W[1:]):
    check(a['s'] < a['e'] <= b['s'] < b['e'], f"non-monotonic at {a['i']} {a['w']} -> {b['w']}")
for w in W:
    check(0 <= w['stress'] <= 1, f"stress out of range {w['i']}")
# pauses
for p in d['pauses']:
    a, b = W[p['after']], W[p['after'] + 1]
    check(abs(p['s'] - a['e']) < 1e-6 and abs(p['e'] - b['s']) < 1e-6 and abs(p['dur'] - (p['e'] - p['s'])) < 2e-3 and p['dur'] >= 0.12,
          f"pause mismatch after {p['after']}")
gaps = [(a['i']) for a, b in zip(W, W[1:]) if b['s'] - a['e'] >= 0.12 - 1e-9]
check(gaps == [p['after'] for p in d['pauses']], 'pause list != gaps >= 120 ms')
# sentences
idx = 0
for s in d['sentences']:
    a, b = s['words']
    check(a == idx and s['text'] == ' '.join(w['w'] for w in W[a:b + 1]) and s['s'] == W[a]['s'] and s['e'] == W[b]['e'], f"sentence {s['text'][:20]}")
    idx = b + 1
check(idx == len(W), 'sentences do not cover all words')
check(' '.join(s['text'] for s in d['sentences']) == tx, 'sentences text != transcript')
# 3-5. captions
seen = []
C = d['captions']
for k, c in enumerate(C):
    check(1 <= len(c['lines']) <= 2, f"caption {k}: {len(c['lines'])} lines")
    check(len(c['highlights']) <= 1, f"caption {k}: >1 highlight")
    cw = []
    for ln in c['lines']:
        check(len(ln['text']) <= 24, f"caption {k}: line too long ({len(ln['text'])}) '{ln['text']}'")
        a, b = ln['words']
        check(ln['text'] == ' '.join(w['w'] for w in W[a:b + 1]), f"caption {k}: line text != words")
        check(ln['s'] == W[a]['s'], f"caption {k}: line s != word start")
        cw += list(range(a, b + 1))
    check(c['s'] == c['lines'][0]['s'], f"caption {k}: s != first line s")
    check(c['e'] - c['s'] >= 0.8, f"caption {k}: shorter than 0.8 s ({c['e'] - c['s']:.2f})")
    if k + 1 < len(C):
        check(abs(c['e'] - C[k + 1]['s']) < 1e-9, f"caption {k}: e != next s")
    for h in c['highlights']:
        check(h['i'] in cw and h['s'] == W[h['i']]['s'] and norm(h['text']) == norm(W[h['i']]['w']), f"caption {k}: highlight mismatch")
        # src/lib/Captions.tsx highlights the FIRST substring match across lines: it must land on word h['i']
        hit = None
        for ln in c['lines']:
            p = ln['text'].find(h['text'])
            if p >= 0:
                hit = ln['words'][0] + ln['text'][:p].count(' '); break
        check(hit == h['i'], f"caption {k}: first substring match of '{h['text']}' is not word {h['i']}")
    seen += cw
check(seen == list(range(len(W))), 'captions do not cover every word exactly once in order')
check(C[-1]['e'] <= d['duration'] + 1e-9, 'last caption past duration')
print(f"{len(W)} words, {len(d['pauses'])} pauses, {len(d['sentences'])} sentences, {len(C)} captions")
if errs:
    print('FAIL'); [print(' -', e) for e in errs]; sys.exit(1)
print('OK: all checks passed')
```

</details>

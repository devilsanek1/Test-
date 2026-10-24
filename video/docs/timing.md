# VO timing: source of truth

Owner: timing stream. Data: `assets/timing.json`. Audio: `assets/vo.mp3` (mono, also at `public/vo.mp3`).
All times are in **seconds from the first audio sample**, with 3 decimals. To get a frame number, use `Math.round(t * fps)`; the `@30` columns below assume 30 fps.

## Conventions

- `words[i].s` is the audible onset of the word. For stops (p, t, k, b) it is the release burst, for s/sh/ch it is the start of the hiss, and after silence it is where energy rises.
- `words[i].e` is where the word's energy falls below -40 dBFS before a gap. In connected speech it equals the next word's `s`, so adjacent words touch.
- `pauses` lists every gap of at least 120 ms between `words[after].e` and `words[after+1].s`. `kind` is `sentence`, `comma` or `phrase` (a pause the transcript has no punctuation for).
- `captions[k].e` is the next caption's `s`, so captions are back to back. The last caption runs to `duration`. `lines[n].s` is the start of the line's first word (line 2 appears when its first word is spoken). `highlights[0].s` is the start of the highlighted word. `lines[n].words` and `captions[k].words` hold `[firstIdx, lastIdx]` into `words`.
- `stress` (0 to 1) is a percentile rank of acoustic prominence, with function words damped. 0.9 or more means the top 10 % of the VO. `hits` holds every word with stress of 0.9 or more, plus every numeral.
- `duration` = 70.687 s is the container duration of `vo.mp3` (as in the brief). The decoded PCM is 70.64 s long. The MP3 has a 25 ms container start offset. It is ignored here because it is less than one frame.

## Global

| Key | Value | Note |
|---|---|---|
| `voStart` | 0.040 | First audible energy: the voiced lead-in of "G". The burst of "Government" is at about 0.17. |
| first word | 0.160 | "Government" |
| `voEnd` | 70.445 | End of "out." |
| lead-in | 0.000 to 0.040 | Effectively none: the VO starts immediately, so frame 1 needs its visuals ready. |
| tail | 70.445 to 70.687 (0.242 s) | Very short: plan the loop-back motion across the cut, not after the VO. |
| words / sentences / pauses / captions | 230 / 18 / 28 / 38 | |

## Sentences

| # | Start | End | Dur | @30 | Words | Text |
|---|---|---|---|---|---|---|
| 1 | 0.160 | 3.592 | 3.43 | 5 | 0-8 | Government websites in four countries just switched themselves off. |
| 2 | 3.741 | 4.654 | 0.91 | 112 | 9-11 | Nobody hacked them. |
| 3 | 4.834 | 10.711 | 5.88 | 145 | 12-31 | They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites. |
| 4 | 10.880 | 12.926 | 2.05 | 326 | 32-39 | Fixing a bug like that takes two steps. |
| 5 | 13.100 | 14.063 | 0.96 | 393 | 40-43 | First, you find it. |
| 6 | 14.228 | 15.620 | 1.39 | 427 | 44-48 | Then, you fix it everywhere. |
| 7 | 15.769 | 18.169 | 2.40 | 473 | 49-57 | You'd think finding it is the hard part, right? |
| 8 | 18.558 | 21.257 | 2.70 | 557 | 58-63 | And for 14 years, nobody did. |
| 9 | 21.606 | 30.132 | 8.53 | 648 | 64-92 | Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew. |
| 10 | 30.615 | 35.415 | 4.80 | 918 | 93-106 | Except, the details of the bug leaked online hours before the fix came out. |
| 11 | 35.604 | 43.626 | 8.02 | 1068 | 107-131 | Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening. |
| 12 | 43.785 | 45.337 | 1.55 | 1314 | 132-138 | Nobody knows yet how many got in. |
| 13 | 45.452 | 47.662 | 2.21 | 1364 | 139-146 | So now comes step two, the slow one. |
| 14 | 47.786 | 54.371 | 6.59 | 1434 | 147-170 | Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit. |
| 15 | 54.556 | 58.891 | 4.34 | 1637 | 171-188 | If a site can't update fast enough, the safest thing is to switch it off until it can. |
| 16 | 59.051 | 60.393 | 1.34 | 1772 | 189-194 | That's what those government sites did. |
| 17 | 60.552 | 66.519 | 5.97 | 1817 | 195-216 | And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore. |
| 18 | 66.665 | 70.445 | 3.78 | 2000 | 217-229 | For those, it's switch off or hope the hosting company sorts it out. |

## Pauses (>= 120 ms)

Pauses of 300 ms or more are in **bold**. These are the natural places for scene changes, flips and un-builds.

| # | Start | End | Dur (ms) | @30 | After | Before | Kind |
|---|---|---|---|---|---|---|---|
| 1 | 3.592 | 3.741 | 149 | 108-112 | off. | Nobody | sentence |
| 2 | 4.654 | 4.834 | 180 | 140-145 | them. | They | sentence |
| 3 | 6.934 | 7.065 | 131 | 208-212 | PHP, | the | comma |
| 4 | 10.711 | 10.880 | 169 | 321-326 | websites. | Fixing | sentence |
| 5 | 12.926 | 13.100 | 174 | 388-393 | steps. | First, | sentence |
| 6 | 14.063 | 14.228 | 165 | 422-427 | it. | Then, | sentence |
| 7 | 15.620 | 15.769 | 149 | 469-473 | everywhere. | You'd | sentence |
| 8 | 17.520 | 17.905 | **385** | 526-537 | part, | right? | comma |
| 9 | 18.169 | 18.558 | **389** | 545-557 | right? | And | sentence |
| 10 | 20.074 | 20.379 | **305** | 602-611 | years, | nobody | comma |
| 11 | 21.257 | 21.606 | **349** | 638-648 | did. | Then, | sentence |
| 12 | 25.347 | 25.527 | 180 | 760-766 | it | and | phrase |
| 13 | 30.132 | 30.615 | **483** | 904-918 | knew. | Except, | sentence |
| 14 | 31.234 | 31.515 | 281 | 937-945 | Except, | the | comma |
| 15 | 33.698 | 33.838 | 140 | 1011-1015 | online | hours | phrase |
| 16 | 35.415 | 35.604 | 189 | 1062-1068 | out. | Cloudflare, | sentence |
| 17 | 42.109 | 42.304 | 195 | 1263-1269 | minutes, | and | comma |
| 18 | 43.626 | 43.785 | 159 | 1309-1314 | evening. | Nobody | sentence |
| 19 | 46.694 | 47.013 | **319** | 1401-1410 | two, | the | comma |
| 20 | 47.662 | 47.786 | 124 | 1430-1434 | one. | Someone | sentence |
| 21 | 50.371 | 50.540 | 169 | 1511-1516 | site, | and | comma |
| 22 | 54.371 | 54.556 | 185 | 1631-1637 | hit. | If | sentence |
| 23 | 56.307 | 56.472 | 165 | 1689-1694 | enough, | the | comma |
| 24 | 58.891 | 59.051 | 160 | 1767-1772 | can. | That's | sentence |
| 25 | 60.393 | 60.552 | 159 | 1812-1817 | did. | And | sentence |
| 26 | 66.519 | 66.665 | 146 | 1996-2000 | anymore. | For | sentence |
| 27 | 67.232 | 67.390 | 158 | 2017-2022 | those, | it's | comma |
| 28 | 68.275 | 68.644 | **369** | 2048-2059 | off | or | phrase |

There is also a lead-in of 0.000 to 0.040 and a tail of 70.445 to 70.687. One sentence join has no pause of 120 ms or more: "got in. / So" is only 100 ms. "slow one. / Someone" is barely over the threshold at 124 ms. Treat both as continuous speech, not scene breaks.

## Caption beats

Grammar: at most 2 centered lines, each of 24 characters or fewer. Each caption is a natural phrase and replaces the previous one at a phrase boundary. Line 2 appears when its first word is spoken. A caption has at most one highlight, which starts when its word starts. Every caption is on screen for at least 0.8 s. The text keeps the transcript's punctuation, and the renderer may drop trailing commas and periods.

| # | In | Out | Dur | Line 1 | Line 2 (in) | Highlight (in) |
|---|---|---|---|---|---|---|
| 1 | 0.160 | 2.155 | 1.99 | Government websites | in four countries (1.155) | **four** (1.325) |
| 2 | 2.155 | 3.741 | 1.59 | just switched | themselves off. (2.815) | **themselves** (2.815) |
| 3 | 3.741 | 4.834 | 1.09 | Nobody hacked them. |  | **Nobody** (3.741) |
| 4 | 4.834 | 7.065 | 2.23 | They were fixing | a security bug in PHP, (5.335) | **PHP** (6.291) |
| 5 | 7.065 | 8.895 | 1.83 | the programming language | behind WordPress (8.032) | **WordPress** (8.265) |
| 6 | 8.895 | 10.880 | 1.99 | and about 7 out of 10 | websites. (10.105) | **7** (9.180) |
| 7 | 10.880 | 13.100 | 2.22 | Fixing a bug like that | takes two steps. (11.958) | **two** (12.247) |
| 8 | 13.100 | 14.228 | 1.13 | First, you find it. |  | **find** (13.665) |
| 9 | 14.228 | 15.769 | 1.54 | Then, you fix it | everywhere. (15.225) | **everywhere** (15.225) |
| 10 | 15.769 | 18.558 | 2.79 | You'd think finding it | is the hard part, right? (16.755) | **hard** (17.025) |
| 11 | 18.558 | 21.606 | 3.05 | And for 14 years, | nobody did. (20.379) | **14** (18.850) |
| 12 | 21.606 | 23.885 | 2.28 | Then, in August, | two security teams (22.853) | **August** (22.185) |
| 13 | 23.885 | 25.527 | 1.64 | using AI tools | found it (24.965) | **AI** (24.155) |
| 14 | 25.527 | 27.902 | 2.38 | and quietly told | the people who make PHP (26.375) | **quietly** (25.667) |
| 15 | 27.902 | 30.615 | 2.71 | so a fix could be ready | before anyone else knew. (28.929) | **before** (28.929) |
| 16 | 30.615 | 33.838 | 3.22 | Except, the details | of the bug leaked online (32.085) | **leaked** (32.715) |
| 17 | 33.838 | 35.604 | 1.77 | hours before | the fix came out. (34.535) | **hours** (33.838) |
| 18 | 35.604 | 36.905 | 1.30 | Cloudflare, | which protects (36.385) | **Cloudflare** (35.604) |
| 19 | 36.905 | 38.208 | 1.30 | a big chunk of the web, |  | **big** (37.071) |
| 20 | 38.208 | 39.895 | 1.69 | says it saw | tens of thousands (38.812) | **thousands** (39.435) |
| 21 | 39.895 | 40.895 | 1.00 | of break-in attempts |  | **break-in** (40.015) |
| 22 | 40.895 | 42.304 | 1.41 | in 45 minutes, |  | **45** (41.050) |
| 23 | 42.304 | 43.785 | 1.48 | and millions by evening. |  | **millions** (42.465) |
| 24 | 43.785 | 45.452 | 1.67 | Nobody knows yet | how many got in. (44.565) | **Nobody** (43.785) |
| 25 | 45.452 | 47.786 | 2.33 | So now comes step two, | the slow one. (47.013) | **two** (46.390) |
| 26 | 47.786 | 50.540 | 2.75 | Someone has to install | that fix on every site, (48.825) | **every** (49.617) |
| 27 | 50.540 | 53.375 | 2.84 | and there are about | 22 million copies of PHP (51.074) | **22** (51.074) |
| 28 | 53.375 | 54.556 | 1.18 | out there | that could be hit. (53.685) | **hit** (54.085) |
| 29 | 54.556 | 56.472 | 1.92 | If a site can't update | fast enough, (55.685) | **can't** (55.025) |
| 30 | 56.472 | 58.215 | 1.74 | the safest thing | is to switch it off (57.225) | **switch** (57.430) |
| 31 | 58.215 | 59.051 | 0.84 | until it can. |  |  |
| 32 | 59.051 | 60.552 | 1.50 | That's what those | government sites did. (59.530) | **government** (59.530) |
| 33 | 60.552 | 62.425 | 1.87 | And one in three | sites on PHP (61.285) | **one** (60.735) |
| 34 | 62.425 | 63.855 | 1.43 | runs a version so old |  | **old** (63.475) |
| 35 | 63.855 | 65.556 | 1.70 | that the people | who make PHP (64.495) |  |
| 36 | 65.556 | 66.665 | 1.11 | don't fix it anymore. |  | **don't** (65.556) |
| 37 | 66.665 | 68.644 | 1.98 | For those, | it's switch off (67.390) | **switch** (67.550) |
| 38 | 68.644 | 70.687 | 2.04 | or hope the hosting | company sorts it out. (69.542) | **hope** (68.805) |

## Hit moments (sync visual punches here)

### Numbers and stats (strongest story beats)

| Time | @30 | Word | Stress | Note |
|---|---|---|---|---|
| 1.325 | 40 | four | 0.93 | four (countries) |
| 9.180 | 275 | 7 | 0.89 | 7 (out of 10) |
| 9.818 | 295 | 10 | 0.45 | 10 (websites) |
| 12.247 | 367 | two | 0.71 | two (steps) |
| 18.850 | 566 | 14 | 0.96 | 14 (years). The VO leans on it. |
| 19.460 | 584 | years, | 0.99 | years: the most prominent word in the first half, held for about 0.6 s |
| 22.853 | 686 | two | 0.97 | two (security teams) |
| 38.812 | 1164 | tens | 0.93 | tens (of thousands) |
| 39.435 | 1183 | thousands | 0.68 | thousands |
| 41.050 | 1232 | 45 | 0.92 | 45 (minutes). Vowel onset at 41.075. |
| 42.465 | 1274 | millions | 1.00 | millions: the loudest word in the VO |
| 46.390 | 1392 | two, | 0.87 | (step) two |
| 51.074 | 1532 | 22 | 0.85 | 22 (million) |
| 51.725 | 1552 | million | 0.98 | million |
| 60.735 | 1822 | one | 0.98 | one (in three) |
| 61.095 | 1833 | three | 0.56 | three |

### Strongest emphasis (acoustic stress of 0.9 or more, numbers excluded)

| Time | @30 | Word | Stress | Sentence |
|---|---|---|---|---|
| 8.265 | 248 | WordPress | 0.94 | 3 |
| 11.370 | 341 | bug | 0.91 | 4 |
| 13.100 | 393 | First, | 0.90 | 5 |
| 23.043 | 691 | security | 0.91 | 9 |
| 25.667 | 770 | quietly | 0.94 | 9 |
| 28.115 | 843 | fix | 0.90 | 9 |
| 28.425 | 853 | could | 0.95 | 9 |
| 31.595 | 948 | details | 0.96 | 10 |
| 35.604 | 1068 | Cloudflare, | 0.99 | 11 |
| 37.071 | 1112 | big | 1.00 | 11 |
| 37.695 | 1131 | web, | 0.95 | 11 |
| 38.208 | 1146 | says | 0.92 | 11 |
| 47.088 | 1413 | slow | 0.93 | 13 |
| 61.285 | 1839 | sites | 0.90 | 17 |
| 63.475 | 1904 | old | 0.97 | 17 |
| 67.550 | 2026 | switch | 0.97 | 18 |

### Top 12 punches (curated: meaning × prominence)

1. **2.815** (frame 84): "themselves (off)": the hook payoff
1. **3.741** (frame 112): "Nobody (hacked them)": first twist
1. **9.180** (frame 275): "7 out of 10": scale reveal
1. **18.850** (frame 566): "14 years": slow-burn number, then a 305 ms pause after "years,"
1. **24.155** (frame 725): "AI (tools)": the discovery beat
1. **32.715** (frame 981): "leaked": the turn that follows the longest pause (483 ms before "Except,")
1. **35.604** (frame 1068): "Cloudflare": new act, after a pause
1. **38.812** (frame 1164): "tens of thousands": attack-counter start
1. **41.050** (frame 1232): "45 minutes": counter / clock hit
1. **42.465** (frame 1274): "millions": counter peak
1. **51.074** (frame 1532): "22 million (copies)": scale beat
1. **60.735** (frame 1822): "one in three": final stat

### Structural beats

- Hook: VO starts at 0.040. "off." ends at 3.592, then a 149 ms breath before "Nobody" (3.741).
- Two-step setup: "First," 13.100 / "Then," 14.228 (step 1 and step 2 cards), followed by "right?" 17.905, which sits alone between two pauses of about 0.38 s.
- Act change: "knew." ends 30.132, then a **483 ms** pause, "Except," 30.615, then another 281 ms pause before "the details" 31.515. This is the biggest gap in the VO and the best spot for a full flip or un-build.
- "So now comes step two," 45.452. A 319 ms pause after "two," (46.694 to 47.013) sets up "the slow one."
- Ending: "switch off" 67.550 to 68.275, then a 369 ms pause, then "or hope..." 68.644 to 70.445. The tail is only 0.242 s, so the loop-back motion should start under the last phrase.

## Method and audio-vs-transcript notes

- **Word list.** The words are the transcript in `docs/BRIEF.md`, token for token, with punctuation and numerals as written. I re-decoded Parakeet TDT at token level. The glued tokens came from a bare word-boundary token (a space before the digits) that the raw merge had dropped. I re-ran Parakeet at 8 sub-frame offsets (10 ms steps) and used the median start of each word, which gives about 10 ms resolution instead of 80 ms.
- **Split boundaries, taken from the audio:**
  - about | 7 at **9.180**: the /s/ hiss starts right after the /t/ closure of "about". The ASR said 9.28, which is mid-hiss.
  - of | 10 at **9.818**: /t/ burst after a 40 ms closure.
  - for | 14 at **18.850**: the second /f/ frication after "for".
  - in | 45 at **41.050**: the /f/ is barely separable from the noisy "in". The strong vowel onset is at 41.075.
  - about | 22 at **51.074**: /t/ burst after the closure.
  - a | version at **62.740**: /v/ onset. "a" is at 62.665.
- **Refinement.** Each ASR start was snapped to the audio, using a 20 ms RMS envelope at a 5 ms hop, onset strength and 4 to 11 kHz band energy. The rules, in order: (1) a word whose ASR start fell inside silence moves to the next onset; (2) an onset after 30 ms or more of silence (below -42 dBFS) wins; (3) words starting with s/sh/ch snap to the hiss onset; (4) words starting with a stop snap to the release burst; (5) otherwise the ASR start is kept. Doubtful spots were checked by eye on spectrograms, and 21 starts were set by hand. Some were also checked by truncating the clip and re-running the ASR.
- **ASR starts corrected by 60 ms or more:** switched 2.35→2.280, them. 4.46→4.385, 7 9.28→9.180, Then, 14.31→14.228, you 14.63→14.707, 14 18.91→18.850, years, 19.61→19.460, and 25.46→25.527, so 27.84→27.902, before 29.00→28.929, the 31.36→31.515, bug 32.34→32.430, saw 38.58→38.483, So 45.52→45.452, safest 56.59→56.522, switch 57.52→57.430, so 63.23→63.090, PHP 64.92→64.987, it's 67.28→67.390, or 68.56→68.644. The largest were "the" (details) at 31.36, which sat in silence and was really 31.515, "years" at 19.60 (really 19.46), "it's" at 67.28 (really 67.39) and "so" (old) at 63.22 (really 63.09).
- **Cross-check with Whisper small.en** (sherpa-onnx, by chunk and on 2 s windows around each split). The wording is identical to the transcript, including "about seven out of ten", "for 14 years", "in 45 minutes", "about 22 million" and "runs a version so". Whisper only adds commas after "WordPress", "found it" and "online".
- **Audio vs transcript.** No word differs. Prosody differs from the punctuation in a few places: the VO pauses where the transcript has no comma, after "found it" (180 ms), "online" (140 ms) and "switch off" (369 ms). It barely pauses at "got in. So" (100 ms). "Government" starts with about 130 ms of voicing (0.040 to 0.170) before the /g/ burst. "did." (21.04) and "years," (19.46) are drawn out, with long decaying tails.
- **Stress.** For each word I took loudness (90th percentile dB), pitch (90th percentile f0 in semitones) and duration per syllable. Each was normalised against the words within ±2.5 s and weighted 0.45 / 0.35 / 0.20, then passed through a logistic. Function words were multiplied by 0.45 and numerals by 1.15. The result was converted to a percentile rank.
- **Validation.** A script checked that the words equal the transcript (exactly and ignoring case and punctuation), that times are monotonic (`s < e <= next s`), that every pause is a gap of 120 ms or more and the list is complete, that the sentences tile the words, that the captions cover every word exactly once and in order, that there are at most 2 lines of 24 characters or fewer, that every line and highlight `s` equals its word's start, that there is at most one highlight per caption, that every caption is at least 0.8 s long, that captions are contiguous, and that each highlight's first substring match (which is how `src/lib/Captions.tsx` finds it) lands on the intended word. All checks passed.

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

# VO timing: source of truth (v3 FINAL)

Owner: timing stream. Data: `assets/timing.json` for **`assets/vo_v3_final.wav`** (ElevenLabs, 48 kHz mono PCM, LOCKED).
The script is `docs/script/final_script_elevenlabs.txt`, using the spoken lines and ignoring the [cue] lines. Earlier takes are archived as `assets/timing_v1.json` (`vo.mp3`) and `assets/timing_v2.json` (`vo_v2_eleven.wav`). Those were a different, longer script, so there is no time-warp to v3: storyboards anchor to word indices, and `scripts/anchor/resolve.py` turns the anchors into times.
All times are in **seconds from the first audio sample**, with 3 decimals. Frame = `Math.round(t * fps)`; the `@30` columns assume 30 fps.

## v2 to v3 delta

| | v2 (old script, `vo_v2_eleven.wav`) | v3 FINAL (new script) | Change |
|---|---|---|---|
| Words (tokens) | 230 | 178 | -52 |
| File length | 77.760 s | 55.360 s | **-22.40 s (-29 %)** |
| VO span (voStart to voEnd) | 0.035 to 77.560 | 0.060 to 55.235 | -22.35 s |
| Speaking rate over the span | 178 wpm | 194 wpm | +16 wpm |
| Time inside words | 64.38 s (83 % of span) | 48.77 s (88 %) | |
| Pauses of 120 ms or more (count / total) | 30 / 11.97 s | 16 / 5.23 s | -6.74 s |
| Pauses of 300 ms or more | 18 | 9 | |
| Sentence breaks (mean, min to max) | 502 ms (255 to 770) | 447 ms (355 to 535) | tighter, more even |
| Sentences / default caption pages | 18 / 38 | 9 / 30 | |
| Tail after voEnd | 0.200 s | 0.125 s | |

Pacing: v3 is a brisker read, at 194 vs 178 words per minute. Sentence breaks are a steady 355 to 535 ms, where v2 ran from 255 to 770 ms, so the rhythm is even and there are no long dead holds. Within sentences, the only pause over 300 ms is the cued ellipsis after "PHP…" (320 ms). The comma breaths are 120 to 230 ms.

## Conventions

- **Word indexing** (what storyboard anchors `{"w": i}` point at): the spoken lines of the cued script, split on whitespace, punctuation attached, 0-based: **178 tokens, w0 "Governments" to w177 "fix."**. `words[i].w` is the cued text exactly, including the CAPS (`PURPOSE,` `ALREADY` `STILL` `HALF`), the ellipsis `PHP…` (w31), and the spelled numbers `seven` (w38), `ten` (w41), `fourteen` (w53) and `forty-five` (w105). `heads-up,` (w71) and `forty-five` are one token each. That is why the count is 178 here and 180 when counting hyphen halves. Under `scripts/anchor/anchorlib.py`'s comparison key, every index matches the plain script in `final_script.md` §1 and the estimate `timing_est_v3.json`.
- `words[i].s` is the audible onset: for stops, the release burst; for s/sh, the start of the hiss; after silence, where energy rises. `words[i].e` is where energy falls below -48 dBFS before a gap (the silence floor of this take is about -86 dBFS); otherwise it is the next word's `s`.
- `pauses` lists every gap of 120 ms or more. `kind` is `sentence`, `comma`, `ellipsis` or `phrase` (unpunctuated).
- `captions` is a **default fallback** only, because the storyboard owns caption chunking. It has at most 2 lines of 26 characters or fewer, one highlight per page timed at its word's start, line 2 appearing at its first word, and every page on screen for at least 0.8 s. `e` is the next page's `s`, and the last page runs to `duration`.
- `stress` (0 to 1) is a percentile rank of acoustic prominence (loudness, pitch, duration per syllable), with function words damped and numbers boosted. `hits` holds every word with stress of 0.9 or more, plus every number word.

## Global

| Key | Value | Note |
|---|---|---|
| `duration` | 55.36 | WAV length (= `decodedDuration`) |
| `voStart` | 0.060 | First audible energy: the voiced lead-in of "G" |
| first word | 0.190 | "Governments" /g/ burst |
| `voEnd` | 55.235 | End of "fix." |
| tail | 55.235 to 55.360 (0.125 s) | Very short: start the loop-back under the last phrase |
| words / sentences / pauses / captions | 178 / 9 / 16 / 30 | |

## Sentences

| # | Start | End | Dur | @30 | Words | Text |
|---|---|---|---|---|---|---|
| 1 | 0.190 | 8.180 | 7.99 | 6 | w0-w28 | Governments all over Europe just shut down a bunch of their own websites on PURPOSE, because of this bug where hackers could take over a site without a password. |
| 2 | 8.605 | 13.945 | 5.34 | 258 | w29-w45 | It's in PHP… the language everyone loves, and about seven out of ten websites run on it. |
| 3 | 14.395 | 19.565 | 5.17 | 432 | w46-w64 | This bug was in there for like fourteen years before researchers using AI figured out how bad it was. |
| 4 | 19.980 | 26.325 | 6.34 | 599 | w65-w88 | They gave the PHP people a heads-up, but word got out before the fix was ready, and hackers were ALREADY trying to use it. |
| 5 | 26.790 | 34.250 | 7.46 | 804 | w89-w111 | Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day. |
| 6 | 34.715 | 39.350 | 4.63 | 1041 | w112-w127 | But even with the fix out, somebody STILL has to install it on every single server. |
| 7 | 39.705 | 45.385 | 5.68 | 1191 | w128-w143 | Plus something like HALF of PHP sites run versions so old they're not officially supported anymore. |
| 8 | 45.850 | 51.895 | 6.05 | 1376 | w144-w164 | Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything. |
| 9 | 52.430 | 55.235 | 2.80 | 1573 | w165-w177 | And some of those governments did it before there was even a fix. |

## Pauses (>= 120 ms)

Pauses of 300 ms or more are in **bold**.

| # | Start | End | Dur (ms) | @30 | After | Before | Kind |
|---|---|---|---|---|---|---|---|
| 1 | 8.180 | 8.605 | **425** | 245-258 | w28 password. | It's | sentence |
| 2 | 9.815 | 10.135 | **320** | 294-304 | w31 PHP… | the | ellipsis |
| 3 | 13.945 | 14.395 | **450** | 418-432 | w45 it. | This | sentence |
| 4 | 19.565 | 19.980 | **415** | 587-599 | w64 was. | They | sentence |
| 5 | 21.920 | 22.050 | 130 | 658-662 | w71 heads-up, | but | comma |
| 6 | 26.325 | 26.790 | **465** | 790-804 | w88 it. | Cloudflare | sentence |
| 7 | 28.640 | 28.860 | 220 | 859-866 | w95 announced, | they | comma |
| 8 | 32.545 | 32.765 | 220 | 976-983 | w106 minutes, | and | comma |
| 9 | 34.250 | 34.715 | **465** | 1028-1041 | w111 day. | But | sentence |
| 10 | 35.985 | 36.180 | 195 | 1080-1085 | w117 out, | somebody | comma |
| 11 | 39.350 | 39.705 | **355** | 1180-1191 | w127 server. | Plus | sentence |
| 12 | 45.385 | 45.850 | **465** | 1362-1376 | w143 anymore. | Even | sentence |
| 13 | 48.145 | 48.365 | 220 | 1444-1451 | w152 yet, | just | comma |
| 14 | 49.400 | 49.630 | 230 | 1482-1489 | w156 off, | which | comma |
| 15 | 49.870 | 49.990 | 120 | 1496-1500 | w158 is | basically | phrase |
| 16 | 51.895 | 52.430 | **535** | 1557-1573 | w164 everything. | And | sentence |

## Default caption pages (fallback; the storyboard owns chunking)

| # | In | Out | Dur | Line 1 | Line 2 (in) | Highlight (in) | Words |
|---|---|---|---|---|---|---|---|
| 1 | 0.190 | 2.205 | 2.02 | Governments all over | Europe just shut down (1.155) | **Europe** (1.155) | w0-w6 |
| 2 | 2.205 | 4.715 | 2.51 | a bunch of their own | websites on PURPOSE, (3.085) | **PURPOSE** (3.955) | w7-w14 |
| 3 | 4.715 | 5.695 | 0.98 | because of this bug |  | **bug** (5.305) | w15-w18 |
| 4 | 5.695 | 7.275 | 1.58 | where hackers could | take over a site (6.420) | **hackers** (5.875) | w19-w25 |
| 5 | 7.275 | 8.605 | 1.33 | without a password. |  | **password** (7.670) | w26-w28 |
| 6 | 8.605 | 10.135 | 1.53 | It's in PHP… |  | **PHP** (8.960) | w29-w31 |
| 7 | 10.135 | 11.605 | 1.47 | the language | everyone loves, (10.640) | **loves** (11.105) | w32-w35 |
| 8 | 11.605 | 14.395 | 2.79 | and about seven out of ten | websites run on it. (12.905) | **seven** (11.955) | w36-w45 |
| 9 | 14.395 | 16.610 | 2.21 | This bug was in there | for like fourteen years (15.195) | **fourteen** (15.490) | w46-w54 |
| 10 | 16.610 | 18.705 | 2.09 | before researchers | using AI figured out (17.435) | **AI** (17.705) | w55-w60 |
| 11 | 18.705 | 19.980 | 1.28 | how bad it was. |  | **bad** (18.870) | w61-w64 |
| 12 | 19.980 | 22.050 | 2.07 | They gave the PHP people | a heads-up, (21.165) | **heads-up** (21.285) | w65-w71 |
| 13 | 22.050 | 24.095 | 2.04 | but word got out | before the fix was ready, (22.875) | **out** (22.665) | w72-w80 |
| 14 | 24.095 | 26.790 | 2.70 | and hackers were ALREADY | trying to use it. (25.545) | **ALREADY** (24.920) | w81-w88 |
| 15 | 26.790 | 28.860 | 2.07 | Cloudflare says that | once it was announced, (27.765) | **Cloudflare** (26.790) | w89-w95 |
| 16 | 28.860 | 31.235 | 2.38 | they saw tens of thousands | of hacking attempts (30.295) | **thousands** (29.825) | w96-w103 |
| 17 | 31.235 | 32.765 | 1.53 | in forty-five minutes, |  | **forty-five** (31.475) | w104-w106 |
| 18 | 32.765 | 34.715 | 1.95 | and millions within a day. |  | **millions** (32.935) | w107-w111 |
| 19 | 34.715 | 36.180 | 1.46 | But even with | the fix out, (35.305) | **fix** (35.445) | w112-w117 |
| 20 | 36.180 | 38.005 | 1.83 | somebody STILL | has to install it (36.965) | **STILL** (36.705) | w118-w123 |
| 21 | 38.005 | 39.705 | 1.70 | on every single server. |  | **every** (38.210) | w124-w127 |
| 22 | 39.705 | 42.295 | 2.59 | Plus something like HALF | of PHP sites (41.145) | **HALF** (40.755) | w128-w134 |
| 23 | 42.295 | 43.605 | 1.31 | run versions so old |  | **old** (43.205) | w135-w138 |
| 24 | 43.605 | 45.850 | 2.25 | they're not officially | supported anymore. (44.390) | **not** (43.855) | w139-w143 |
| 25 | 45.850 | 48.365 | 2.52 | Even the FBI said | if you can't update yet, (47.095) | **FBI** (46.195) | w144-w152 |
| 26 | 48.365 | 49.630 | 1.27 | just turn it off, |  | **off** (49.065) | w153-w156 |
| 27 | 49.630 | 51.345 | 1.71 | which is basically | tech support's answer (50.235) | **tech** (50.235) | w157-w162 |
| 28 | 51.345 | 52.430 | 1.09 | to everything. |  | **everything** (51.705) | w163-w164 |
| 29 | 52.430 | 53.760 | 1.33 | And some of those | governments did it (53.015) | **governments** (53.015) | w165-w171 |
| 30 | 53.760 | 55.360 | 1.60 | before there was | even a fix. (54.395) | **before** (53.760) | w172-w177 |

## Hit moments

### Numbers, stats and cued words

| Time | @30 | w | Word | Stress | Note |
|---|---|---|---|---|---|
| 3.955 | 119 | w14 | PURPOSE, | 0.94 | cued CAPS: the hook ("on PURPOSE") |
| 8.960 | 269 | w31 | PHP… | 0.72 | cued ellipsis: the bait. 320 ms pause after it |
| 11.955 | 359 | w38 | seven | 0.85 | seven (out of ten) |
| 12.650 | 380 | w41 | ten | 0.58 | ten |
| 15.490 | 465 | w53 | fourteen | 0.90 | fourteen (years) |
| 17.705 | 531 | w58 | AI | 0.83 | AI |
| 24.920 | 748 | w84 | ALREADY | 0.94 | cued CAPS |
| 29.235 | 877 | w98 | tens | 0.76 | tens (of thousands) |
| 29.825 | 895 | w100 | thousands | 0.78 | thousands |
| 31.475 | 944 | w105 | forty-five | 0.89 | forty-five (minutes) |
| 32.935 | 988 | w108 | millions | 1.00 | millions: the loudest word in the VO |
| 36.705 | 1101 | w119 | STILL | 0.97 | cued CAPS |
| 40.755 | 1223 | w131 | HALF | 0.77 | cued CAPS: HALF (of PHP sites) |
| 46.195 | 1386 | w146 | FBI | 0.88 | FBI: the joke setup |

### Strongest emphasis (acoustic stress of 0.9 or more)

| Time | @30 | w | Word | Stress |
|---|---|---|---|---|
| 3.955 | 119 | w14 | PURPOSE, | 0.94 |
| 5.305 | 159 | w18 | bug | 0.96 |
| 10.640 | 319 | w34 | everyone | 0.92 |
| 11.105 | 333 | w35 | loves, | 0.90 |
| 15.490 | 465 | w53 | fourteen | 0.90 |
| 16.225 | 487 | w54 | years | 0.97 |
| 20.085 | 603 | w66 | gave | 0.95 |
| 22.155 | 665 | w73 | word | 0.92 |
| 23.205 | 696 | w78 | fix | 0.98 |
| 24.920 | 748 | w84 | ALREADY | 0.94 |
| 26.790 | 804 | w89 | Cloudflare | 0.95 |
| 27.290 | 819 | w90 | says | 0.91 |
| 32.935 | 988 | w108 | millions | 1.00 |
| 35.445 | 1063 | w116 | fix | 0.93 |
| 36.705 | 1101 | w119 | STILL | 0.97 |
| 39.705 | 1191 | w128 | Plus | 0.99 |
| 43.205 | 1296 | w138 | old | 0.99 |
| 50.235 | 1507 | w160 | tech | 0.93 |
| 53.015 | 1590 | w169 | governments | 0.98 |

### Structural beats

- Sentence breaks, the natural cut points: after w28 "password." 8.180 to 8.605 (425 ms); after w45 "it." 13.945 to 14.395 (450 ms); after w64 "was." 19.565 to 19.980 (415 ms); after w88 "it." 26.325 to 26.790 (465 ms); after w111 "day." 34.250 to 34.715 (465 ms); after w127 "server." 39.350 to 39.705 (355 ms); after w143 "anymore." 45.385 to 45.850 (465 ms); after w164 "everything." 51.895 to 52.430 (535 ms).
- Inside sentences, the only long beat is the ellipsis "PHP…" (9.815 to 10.135). The joke lands at "which is basically tech support's answer to everything." (49.630 to 51.895), right after a 230 ms comma breath.
- Ending: "before there was even a fix." runs 53.760 to 55.235. The tail is 0.125 s.

## Method and audio-vs-script notes

- **Alignment.** Parakeet TDT tokens were aligned to the script at character level, with digits spelled out. The match ratio was 1.0: the audio says exactly the 178 script tokens. Each start is the median of 8 runs at 10 ms sub-frame offsets. Starts were then snapped to the audio, as for v1 and v2: onsets after silence, hiss onsets for s/sh words, release bursts for stop-initial words. The doubtful spots were checked on spectrograms and by truncating the clip and re-running the ASR. 6 starts were set by hand.
- **Glued ASR tokens, split at audio boundaries:** about | seven at 11.955 (/s/ hiss right after the /t/ closure); of | ten at 12.650 (/t/ burst); like | fourteen at 15.490 (/f/ onset after the /k/ release, confirmed by truncation); in | forty-five at 31.475 (soft /f/; the vowel lands at about 31.52); run | versions at 42.495. "heads up" (two ASR words) is the one script token `heads-up,`.
- **Raw ASR starts that were off by 80 ms or more:** w29 "It's" 8.48→8.605, w32 "the" 10.00→10.135, w47 "bug" 14.48→14.600, w53 "fourteen" 15.60→15.490, w65 "They" 19.84→19.980, w66 "gave" 20.00→20.085, w89 "Cloudflare" 26.64→26.790, w90 "says" 27.44→27.290, w113 "even" 34.88→34.980, w127 "server." 38.96→38.865, w142 "supported" 44.48→44.390, w163 "to" 51.44→51.345, w165 "And" 52.32→52.430, w172 "before" 53.84→53.760. As in the earlier takes, the raw ASR tends to mark s/sh words mid-hiss and to put some words inside the preceding silence.
- **Cross-check with Whisper small.en:** the wording matches the script. Whisper writes digits (14, 45), drops the ellipsis and CAPS, and writes "fixout" and "heads up". There are no word-level disagreements.
- **Audio vs script.** No word differs. The cued ellipsis after "PHP…" is a real 320 ms pause. The comma after "announced," is a short breath (220 ms), as the script notes asked. "basically" follows a tiny unpunctuated 120 ms gap after "is". "and" (w81, before "hackers were ALREADY") is almost swallowed, at about -48 dBFS.
- **Validation.** All checks passed: the tokens equal the script exactly, CAPS and "…" included; times are monotonic; the pause list is complete; the sentences tile the words; the captions cover every word once and in order; there are at most 2 lines of 26 characters or fewer; every line and highlight `s` equals its word's start; there is one highlight per page, and each one is found by the engine's first-substring match; every page is at least 0.8 s long. Indices were also checked against `scripts/anchor/anchorlib.py` (`key()` match against `final_script.md` §1 and `timing_est_v3.json`: 178/178).

<details><summary>Validation script (run: <code>python3 validate.py assets/timing.json docs/script/final_script_elevenlabs.txt 26</code>)</summary>

```python
"""Validate assets/timing.json against the script and the caption grammar.

  python3 validate.py [timing.json] [script: final_script_elevenlabs.txt | BRIEF.md] [max line chars, default 26]
"""
import json, re, sys
tj = sys.argv[1] if len(sys.argv) > 1 else '/home/user/Test-/video/assets/timing.json'
script = sys.argv[2] if len(sys.argv) > 2 else '/home/user/Test-/video/docs/script/final_script_elevenlabs.txt'
MAXLEN = int(sys.argv[3]) if len(sys.argv) > 3 else 26
d = json.load(open(tj))
if script.endswith('.txt'):   # spoken lines of the cued script: drop [cue] lines
    tx = ' '.join(' '.join(l.strip() for l in open(script, encoding='utf-8').read().splitlines()
                           if l.strip() and not re.match(r'^\s*\[.*\]\s*$', l)).split())
else:                         # BRIEF.md '## Transcript' section (v1/v2 takes)
    tx = ' '.join(open(script).read().split('## Transcript', 1)[1].split('\n## ', 1)[0].split())
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
        check(len(ln['text']) <= MAXLEN, f"caption {k}: line too long ({len(ln['text'])} > {MAXLEN}) '{ln['text']}'")
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

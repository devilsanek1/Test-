# Word anchors: storyboards timed to WORDS, not seconds

The v3 voice has not been recorded yet, so nothing in the v3 storyboard may be written in seconds. Every time is
anchored to a word of the plain script, and these tools turn anchors into seconds for whatever timing exists: the
estimate now, the recording later. When the voice arrives, the storyboard is not edited. You only resolve it again.

| file | what |
|---|---|
| `estimate_timing.py` | builds `assets/timing_est_v3.json`: an estimated word timeline for the v3 plain script, from the measured pace of the previous ElevenLabs take (`assets/timing.json`) |
| `resolve.py` | anchored storyboard + timing gives the resolved storyboard in seconds (`docs/storyboard_v3_resolved.json`) + `src/data/scenes.json` + `src/data/captions.json` |
| `reanchor.py` | the recorded script differs slightly (a word added, removed or changed): re-maps every anchor through a word alignment and reports the anchors that landed on changed words |
| `words.py` | authoring helper: word index table, find a word, seconds to anchor, anchor to seconds, caption pages |
| `engine_emit.py` | Python port of `scripts/gen-scenes.mjs` + `scripts/gen-captions.mjs --storyboard` (byte-identical, tested) |
| `anchorlib.py` | shared: tokens, normalization, anchors, JS-compatible JSON |
| `selftest.py`, `fixtures/` | 50 checks on a toy storyboard, plus parity with the node generators and the v3 estimate |

```bash
python3 -I scripts/anchor/estimate_timing.py            # (re)build assets/timing_est_v3.json, print the summary
python3 -I scripts/anchor/words.py | less               # w0 0.125 0.565 Governments ... (index = anchor "w")
python3 -I scripts/anchor/resolve.py                    # docs/storyboard_v3.json -> resolved + src/data/*.json
python3 -I scripts/anchor/selftest.py                   # 50/50 passed (~1 s)
```

## 1. The anchor

`w` indexes the **plain script** (`docs/script/final_script.md`, section "1. Plain script"), split on whitespace
with punctuation attached, 0-based: `Governments`=0 ... `purpose,`=14 ... `PHP,`=31 ... `fix.`=177 (178 words).

| anchor | seconds |
|---|---|
| `{"w": 14, "dt": -0.1}` | start of word 14 ("purpose,") minus 0.10 s (a small element leads the word by 0.10) |
| `{"w": 14, "dt": 0, "word": "purpose,"}` | the same, plus a text check: resolve fails if word 14 is not "purpose" (case and punctuation ignored) |
| `{"w": 28, "dt": 0.05, "edge": "e"}` | END of word 28 plus 0.05 s |
| `{"w": 28, "dt": 0, "gap": 0.5}` | the middle of the pause after word 28. A cut placed this way stays inside the pause whatever its recorded length |
| `{"w": "START", "dt": 0}` / `{"w": "END", "dt": -0.5}` | 0 s / the timing's `duration` minus 0.5 s (the file end, not the last word) |
| `{"w": "VO_START", "dt": 0}` / `{"w": "VO_END", "dt": 0}` | first and last audible voice (`voStart`, `voEnd`) |

A dict is an anchor when it has both `w` and `dt`, so match boxes such as `{"cx", "cy", "w", "h"}` are never read as
anchors. Positions, sizes, zooms and durations stay plain numbers. A plain number under a time key (`s e t t0 t1 start
end at time captionAt coverFrame`) is reported as UN-ANCHORED, because it will not follow the voice.

Lead conventions (`docs/ENGINE.md` rule 5) go into `dt`: small element `-0.10`, big build `-0.25..-0.40`, marks and sun
touch-downs `0`. Caption times are always word starts (`dt` 0). The engine applies its own caption leads.

## 2. The storyboard contract (`docs/storyboard_v3.json`)

The schema is the same as the 13-scene `docs/storyboard.json`, with three changes: a top-level `wordsRef`, every time
written as an anchor, and caption times that may be omitted.

```jsonc
{
  "wordsRef": "Governments all over Europe just shut down ... before there was even a fix.",  // or a list of words
  "duration": {"w": "END", "dt": 0},
  "coverFrame": {"w": 14, "dt": 0.3},
  "loop": {"t0": {"w": "END", "dt": -0.8}, "t1": {"w": "END", "dt": 0}, "captionAt": {"w": "END", "dt": -0.2}},
  "scenes": [{
    "id": "S01", "title": "Government Plaza powers down",
    "start": {"w": "START", "dt": 0}, "end": {"w": 28, "dt": 0, "gap": 0.6},
    "transitionIn": {"type": "loop-start"},
    "camera": [{"t0": {"w": "START", "dt": 0}, "t1": {"w": 5, "dt": 0}, "move": "push-in", "from": {...}, "to": {...}}],
    "beats": [{"t": {"w": 5, "dt": -0.3, "word": "shut"}, "action": "shutters slam"}],
    "sunKeys": [{"t": {"w": 14, "dt": 0}, "kind": "press", "word": 14, "x": 630, "y": 800, "r": 150}],
    "sfx": [{"t": {"w": 5, "dt": 0}, "sound": "pop_low"}],
    "captions": [
      {"lines": [{"text": "Governments all over"}, {"text": "Europe just shut down"}], "highlights": [{"text": "Governments"}], "tone": "dark"},
      ...
    ]
  }, {
    "id": "S02", "start": {"w": 28, "dt": 0, "gap": 0.6}, ...,
    "transitionIn": {"type": "camera-continuous", "t0": {"w": 28, "dt": -0.4}, "t1": {"w": 29, "dt": 0.3}, "dur": "auto",
                     "notes": "the camera trucks right", "engine": {"amount": 1.1}}
  }]
}
```

- **wordsRef** is the plain script the anchors index. `resolve.py` checks it against the timing's words, normalized:
  case, punctuation, apostrophes and hyphens are ignored, and number words equal digits ("forty-five" == "45").
- **Scenes tile 0 to END.** One scene's `end` and the next scene's `start` use the same anchor. Put cuts in pauses
  with `gap`.
- **Captions can be text only.** A line without `s` starts at its first word, counted through the script in caption
  order. A page's `s` is its first line's start. A page's `e` is the next page's start, and the last page ends at END. A
  highlight's `s` is its first word in the page. The lint checks that the lines tile the script word for word, that
  explicit anchors match the text, and that no line is over 26 characters. `words.py --pages` prints a starting
  paging. Without any pages, `captions.json` takes the timing's own paging, like `gen-captions.mjs` with no
  `--storyboard`.
- `"dur": "auto"` next to two anchored ends (`t0`/`t1`, `s`/`e`, `start`/`end`) resolves to end minus start.
- **Integer `"word": 14` fields** (the old sunKeys style) are word indices. They are range-checked, compared with their
  `t` anchor, and re-mapped by `reanchor.py`.
- **Engine extensions, all optional.** A storyboard without them gives byte-identical output to the node scripts.
  - `transitionIn.dir` and `transitionIn.element` win over the direction parsed from `notes`, and `transitionIn.engine`
    is merged last.
  - A `toneAt` key keeps `wipe` and `dur`.
  - The loop un-build can be structured: a top-level `loop` `{t0, t1, captionAt}`, or the last scene's
    `transitionOut`. The old free-text "un-build (a-b) ... rolled in (c-" note still works.
  - A structured loop whose `type` is not `unbuild` (the v3 rewind: S12 `transitionOut: {type: 'cut', loop: true,
    captionAt}`) is emitted as `{type, loop, captionAt}`: no un-build. Film has to honour it (engine request in
    `docs/storyboard_v3.json`: no un-build, captions still roll back at `captionAt`).

## 3. resolve.py

```bash
python3 -I scripts/anchor/resolve.py [SB=docs/storyboard_v3.json] [--timing T] [-o docs/storyboard_v3_resolved.json]
        [--scenes-out src/data/scenes.json] [--captions-out src/data/captions.json] [--no-engine] [--reanchor]
        [--strict] [--force] [--no-overrides] [--no-hook] [--anchor-map map.json] [--quiet]
```

- **Timing.** The default is `assets/timing_v3.json` when it exists (the real recording, in the `assets/timing.json`
  schema), else `assets/timing_est_v3.json`. A raw ASR word list (`{duration, words: [{w, s, e}]}`, for example
  `assets/vo_v3_draft_take_words_raw.json`) also works. ASR digit glue ("about7") is split in memory.
- **Output.** The resolved storyboard has every anchor replaced by seconds (3 decimals) and a top-level `duration`
  equal to the timing's. Its `resolved` block records `{from, timing, estimated, anchors, autoCaptionTimes}`. Lint a
  full storyboard with `python3 -I scripts/check-storyboard.py --sb docs/storyboard_v3_resolved.json --timing <timing>`.
- **Engine files.** `src/data/scenes.json` and `src/data/captions.json` follow the rules and byte format of
  `gen-scenes.mjs` / `gen-captions.mjs --storyboard`, including their `src/data/*.overrides.json`. Overrides of captions
  are applied by page index, so check them whenever the paging changes. The guard is the same as in gen-scenes: the cut
  list and the captions must end on the timing's `duration`. Otherwise nothing goes to `src/data` (exit 1), unless you
  pass `--force`.
- **Exit codes.** 0 ok. 1 errors: a bad anchor, a failed `word` check, the guard. 2 `wordsRef` does not match the
  timing; a word-level diff is printed and nothing is written:

```
  --- storyboard wordsRef (22 words)
  +++ timing words (23 words)
  @@ insert w 4..4 -> 4..4: ...switched off their {+own+} sites, on purpose....
  @@ insert w 12..12 -> 13..13: ...bug hid for {+about+} fourteen years. Now...
  @@ replace w 15..15 -> 17..17: ...fourteen years. Now [-somebody-] {+someone+} has to fix...
  @@ delete w 20..20 -> 22..22: ...to fix every [-single-] server....
```

## 4. reanchor.py

```bash
python3 -I scripts/anchor/reanchor.py docs/storyboard_v3.json --timing assets/timing_v3.json -o docs/storyboard_v3.json
python3 -I scripts/anchor/reanchor.py SB.json --script recorded.txt --dry-run          # report only
python3 -I scripts/anchor/resolve.py --reanchor                                       # the same, in memory, then resolve
```

`difflib` aligns the normalized tokens of `wordsRef` and the new words. Each anchor moves with its word:

| case | what happens | reported |
|---|---|---|
| equal | the anchor keeps its word at the new index | no |
| split or merge ("heads-up" and "heads up", "forty-five" and "forty five") | moved proportionally | info |
| CHANGED ("somebody" became "someone") | moved proportionally inside the replaced span | FLAG |
| DELETED | moved to the next surviving word (`--deleted prev` for the previous one) | FLAG |
| inserted words | no anchor moves onto them; everything after them follows the voice | listed |

`dt` is never changed. `"word"` checks get the new text. Caption lines are rebuilt from the new words: inserted words
join the line before them, and a line or page with no words left is removed. A highlight whose word is gone is
retargeted to its anchored word when that word is still on the page, and removed otherwise. Every caption change is
listed. `wordsRef` becomes the new words. Exit code 3 means some anchors were flagged; the file is still written.
Read the flags before you render. The toy test and the 166-word v3 draft take, which differs from the final text in
22 places, both go through cleanly.

## 5. The estimated timeline (`assets/timing_est_v3.json`)

The schema is that of `assets/timing.json`: `words`, `pauses`, `sentences`, `captions` (an automatic paging), `hits`,
`leadIn`, `tail`. It adds `"estimated": true` and an `estimate` block with every model number. `words[i].w` is the
plain script, so `w` = `i`. The pause kind `ellipsis` is new.

| measured on the v2 take (230 words, 77.76 s) | value |
|---|---|
| word slot (start to next start, or to its end before punctuation) | 0.237 + 0.080 per syllable, minus 0.154 for a function word, plus a per-(syllables, class) correction (shrunk, k = 5) |
| typical slot by syllable count | content words: 1 syl 0.296, 2 syl 0.423, 3 syl 0.440, 4 syl 0.542 s; function words: 1 syl 0.159, 2 syl 0.240 s |
| final lengthening | +0.146 s before a comma (also used before the ellipsis), -0.017 s before a full stop |
| letter acronyms (PHP, AI, FBI) | 0.214 s per spoken letter |
| pauses (means, zero gaps included) | comma 0.167, full stop 0.502, ellipsis after "PHP" 0.335 (the comma/full-stop midpoint: the cue asks for a "tiny pause"); lead-in 0.125, tail 0.200 |
| stress | text heuristic (no audio yet): the cued CAPS words PURPOSE, ALREADY, STILL, HALF are 1.0, numbers 0.9 |

**Result: 57.12 s** (the voice runs 0.035 to 56.92 s), ±1.4 s at 1 sigma. The sigma comes from leave-one-sentence-out
error on v2 (0.43 s per sentence) plus the spread of the pauses. Sentences start at 0.13 / 8.84 / 15.00 / 20.48 / 28.40
/ 36.11 / 41.29 / 46.96 / 54.15 s. "purpose" lands at 3.84 s (w14), "PHP" at 9.15 (w31), "forty-five" at 32.99 (w105),
"half" at 42.16 (w131) and "FBI" at 47.36 (w146).

**Out-of-sample check.** The same model predicted the v3 DRAFT take (`assets/vo_v3_draft_take_words_raw.json`,
eleven_v4, a different 166-word text). Word starts were off by 0.47 s rms (max 0.98 s), and the predicted end was
55.00 s against 54.56 s measured. Fitting the pace to the draft take instead gives 56.92 s for the final script. The
v1 pace gives 53.18 s, but v1 under-predicts the draft take by 3.5 s, so it is not used.

Options: `--pace 0.95` (5 % faster overall), `--ellipsis-pause 0.4`, `--pace-from <timing or raw ASR>`, `--dry-run`.

## 6. When the voice is recorded

1. The timing stream writes `assets/timing_v3.json` in the `assets/timing.json` schema, with `words[].w` = the
   recorded words.
2. Run `python3 -I scripts/anchor/resolve.py`. If the words match `wordsRef`, it re-times everything. If the script
   changed slightly, run `reanchor.py ... -o docs/storyboard_v3.json`, read the FLAG list, then resolve.
3. To time an animatic to the v3 draft take as a stand-in, run `resolve.py --timing
   assets/vo_v3_draft_take_words_raw.json --reanchor -o <tmp> --no-engine`. This maps the anchors in memory and
   leaves the storyboard untouched.

## 7. Notes for other lanes

- `scripts/gen-scenes.mjs` and `scripts/engine-numbers.mjs --check` compare the cut list with
  `assets/timing.json`'s `duration` (still v2, 77.76 s). Once `src/data/*.json` come from the v3 timing, those
  checks report STALE. Do one of two things: point those scripts at the v3 timing, or make `assets/timing.json` the
  v3 timing when the film switches. The audio (`public/vo.mp3` / `mix.wav`) has to switch at the same time.
- `scripts/check-storyboard.py` lints a resolved v3 storyboard against any timing with `--timing`.

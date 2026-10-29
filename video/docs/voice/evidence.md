# ElevenLabs takes: forensic evidence (2026-10-26)

Every raw take we have, transcribed with Parakeet (`scripts/voice/transcribe.py`) and aligned word by word (same
tokeniser as `check_take.py`) to the exact paste version it was generated from (recovered from git). Goal: find what in
our paste files goes with a failure. 8 generations, 4 videos' worth of pastes. ASR splits ("aversion" for "a version")
are ignored.

## 1. The takes

| Take (file) | Paste it came from | Length (expected) | Result |
|---|---|---|---|
| v1 `assets/vo.mp3` | owner's annotated script (`docs/v1/script/original_annotated.md`) | 70.6 s (~70) | clean, word for word |
| v1 `assets/vo_v2_eleven.wav` | same paste, regenerated | 77.8 s | clean |
| v1 `assets/vo_v3_draft_take.wav` | `docs/v1/script/final_script_elevenlabs.txt` @ ece6b55 | 54.6 s | clean |
| v1 `assets/vo_v3_final.wav` | same file @ 0f1f845 | 55.4 s | clean |
| v3 `take1_raw_eleven_v4.wav` | v3 paste @ 4693e6f (notes, H2/H3 block, quoted cues) | 55.9 s (43 + alternates) | 3 read-alouds |
| v3 `take2_raw_eleven_v4.wav` (commit 1ca72e7 calls it "take 3") | v3 paste @ ac73038 | 45.0 s (43) | opening repeat |
| v3 `take4_raw_eleven_v4.wav` | v3 paste @ 1ca72e7 | 42.4 s (43) | opening repeat |
| v2 `take1_raw.wav` | `docs/v2/archive/script_elevenlabs_take1.md` | 87.9 s (43) | 6 failures |

No take from the v3 pastes @ a9bdb62 / a982383 is in the repo (the owner's real "take 2" is missing).

## 2. Every failure

| Take | Time | Type | What v4 said | Paste line, and the tag before it |
|---|---|---|---|---|
| v3 t1 | 3.2 s | read-aloud | "AI data centers and losing." before line 2 | own-line tag, 22 words: `[leaning in, dry, like "wait till you hear this", "AI data centers" crisp and clear, "and losing" flat with a tiny wince]` |
| v3 t1 | 10.2 s | read-aloud | "Give or take a pandemic." before line 3 | own-line tag, 26 words, ends `"give or take a pandemic" tossed off with a tiny smile]` |
| v3 t1 | 43.4 s | read-aloud | "Alternate first lines if you want to record them to test. H2. … H3. …" | the note line `Alternate first lines (same script after them):` (reworded) and the labels H2/H3 |
| v3 t"2" | 3.7 s | repeat | "…soon? AI's making it pricier. **Well, AI's making it pricier.** Well, AI data centers are." | line 1 has a mid-line tag (`Buying a laptop soon? [plain and level, a touch amazed, …] AI's making it pricier.`); line 2 tag `[quick and throwaway, correcting yourself to be precise, not a big reveal]` |
| v3 t4 | 3.4 s | repeat | "…soon? AI's making it pricier. **AI's making it pricier.** Well, AI data centers are." | same line 1; line 2 tag now `[quick and throwaway, a little wry]` (no action word) |
| v2 t1 | 0.0 s | repeat (doubled opening) | "She quit. She quit Google." | line 1, own-line tag, 21 words: `[quiet disbelief, like news about a friend you can't quite believe, a small beat, then low and flat at the end]` |
| v2 t1 | 21.8 s | garble | "told the BBC she objected to **swear its military.**" (for "where its military work was heading") | line 4, own-line tag `[warm and steady, fair, like someone you respect, easy pace]`; right after the paste's 2nd "told the BBC" |
| v2 t1 | 27.4 s | truncation + restart from the top | line 5 stops at "any lawful", 1.2 s silence, then "**She quit.** So why is SHE talking?" (top of paste, then line 3), lines 4-5 re-said | line 5: tag on the same line + mid-line tag right after "purpose…" (2 words after the cut): `[level and dry, nothing extra, no doom]` |
| v2 t1 | 43.9 s | swallowed sound | "And **'oogle** can't veto" | the first word after line 5's mid-line tag (2nd pass) |
| v2 t1 | 54.3-71.2 s | loop x3 | after line 7a "She says she can't criticize Google." it jumps back to line 6 "But Google says…" twice; 3rd time goes on to 7b | line 7's mid-line tag `[warm and plain, a little slower, like the end of a story at the kitchen table, soft landing, no mic drop]`; lines 6 and 7b both start with "But" |
| v2 t1 | 77.3 s | wrap to the top after the end | "**She quit. She quit Google.** But in her words…" (last line again) | the paste's end, right after 7b (the segment after the mid-line tag) |

Pattern of the jumps: v4 loses its place at a tag boundary and lands either on an earlier copy of the next word
("But"→ line 6; "AI…"→ "AI's making it pricier") or on the very top ("She quit." three times in v2 take 1).

## 3. Paste-level features

| Paste | Generations | Structural failures | Chars | Spoken words | Tags | Tags / 100 words | Mid-line tags | Tag words avg / max | Negations | Quoted bits | Ellipses |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v1 annotated | 2 | 0 | 1,819 | 230 | 12 | 5.2 | 0 | 7.2 / 12 | 1 | 0 | 5 |
| v1 @ ece6b55 | 1 | 0 | 1,745 | 170 | 9 | 5.3 | 0 | 14.7 / 17 | 10 | 16 | 1 |
| v1 @ 0f1f845 | 1 | 0 | 1,758 | 178 | 9 | 5.1 | 0 | 14.7 / 16 | 6 | 4 | 1 |
| v3 @ 4693e6f | 1 | 0 (3 read-alouds) | 2,337 | 130 | 9 | 6.9 | 0 | 19.0 / 26 | 5 | 15 | 5 |
| v3 @ ac73038 | 1 | 1 | 1,584 | 114 | 14 | 12.3 | 5 | 11.6 / 18 | 7 | 0 | 3 |
| v3 @ 1ca72e7 | 1 | 1 | 1,545 | 114 | 14 | 12.3 | 5 | 11.2 / 18 | 6 | 0 | 3 |
| v2 take-1 paste | 1 | 6 | 1,338 | 113 | 10 | 8.8 | 3 | 12.5 / 21 | 7 | 0 | 3 |

"Structural" = repeat, loop, restart, garble, swallowed sound (not read-alouds).

## 4. Line-level features (78 line instances in 8 generations; a line "failed" if a structural failure starts there)

| Feature | Lines with it that failed | Lines without it that failed | Verdict |
|---|---|---|---|
| Mid-line tag (a tag after spoken words in the same paragraph) | 4/13 (31 %) | 2/65 (3 %) | **correlates** |
| First line of the paste | 3/8 | 3/70 | **correlates**, but only in pastes with mid-line tags (0/5 otherwise) |
| Negation in a tag | 2/36 | 4/42 | no (if anything reversed) |
| One tag over 15 words | 1/16 | 5/62 | no |
| Ellipsis in the line | 2/26 | 4/52 | no |
| CAPS emphasis | 2/31 | 4/47 | no |
| Quotes in a tag (for loops/repeats) | 0/20 | 6/58 | no |
| Line over 20 words | 1/20 | 5/58 | no |
| A sentence start used again elsewhere ("But…" twice) | 4/36 | 2/42 | weak; only bites at a tag boundary |

Read-alouds are a separate mechanism:

| Feature | Spoken aloud | Not spoken |
|---|---|---|
| Text outside brackets that isn't script (notes, "H2", "Alternate first lines") | 3/3 | 0 |
| Multi-word script phrase quoted as the subject of a cue (`"give or take a pandemic" tossed off`) | 3/3 | 0 |
| Every other quoted bit: single words (`lean on "NEXT"`, `"password" plain`), phrases after "on"/"let", non-script phrases | 0/32 | 32 |

## 5. What clearly correlates

1. **Mid-line tags.** All 3 generations that had them broke (repeat, loop, restart, garble, swallowed G); all 5 that
   didn't had zero structural failures (0/53 lines), including the longest paste (2,337 chars) and the longest tags.
   Every structural failure in our history is in a paste with mid-line tags. Tag density moves with it (clean
   5.1-6.9 tags per 100 words, broken 8.8-12.3); this data can't separate the two.
2. **The opening, in those pastes.** 3/3 openings repeated; both broken openings start with a 3-4 word sentence
   followed by more in the same paragraph ("She quit Google. And…", "Buying a laptop soon? [tag] AI's…"). 0/5 openings
   broke in pastes without mid-line tags.
3. **Non-script text and quoted script phrases** are spoken (6/6). Single quoted words never were (0/26).

## 6. What does not correlate (on this data)

- **Negations** in tags: the v1 draft had 10 and was clean; in the broken pastes, lines with negations failed less.
- **Tag length**: v1 tags of 13-17 words and v3 take 1's 19-word average were structurally clean.
- **Total length** (chars) and **number of tags**: the clean pastes were longer (1,745-2,337 chars vs 1,338-1,584);
  tag counts overlap (9-12 vs 10-14). Under ~2,400 chars, length is not the cause.
- **Ellipses, CAPS, line length**: same failure rate with or without.
- **Action words in cues** ("correcting yourself"): take 4 repeated the opening without it; the cue changed only the
  shape of the repeat (an extra "Well,").
- **"And" + name loses its first sound**: one case, the first word after a mid-line tag in a take that had already
  derailed. Not supported as its own rule.
- **Repeated phrases**: the v1 annotated script repeats "the people who make PHP" and was clean twice; repeats only
  mattered where v4 had just lost its place at a tag.

## 7. Caveats

- Small sample: 8 generations, 7 distinct pastes, one voice. All are assumed eleven_v4 (v1's annotated script says
  so; v1 WAVs carry no model name). Settings (stability, speed) per take are unknown.
- The ASR normalises slurred words; a swallowed sound is caught only when the word changes ("Ugo").
- Tags inline at the start of a line (`[serious] But Google staff…`) and untagged lines appear only in v2's broken
  paste or later, untested pastes. The only format with a clean record is v1's: one tag on its own line before each
  paragraph, no tag inside a paragraph, no notes, no quoted phrases (5/5 generations clean, up to 230 words).

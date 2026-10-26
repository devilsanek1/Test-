# Voice: the ElevenLabs handoff (every video)

The owner records the voice in ElevenLabs (v4 so far); we never add a voice of our own to a deliverable. Our job is a
paste file that produces the script word for word, and a check of every take. Learned on v1 and v3; owner rules in
`OWNER_PLAYBOOK.md` (Script and voice).

## 1. The paste file (`docs/vN/script/script_elevenlabs.md`)

- **Only tags and spoken words.** No titles, notes, labels, "H2", "alternate", separators or markdown: v4 reads them aloud.
- **One cue in brackets per line, then the line** (blank line between lines). Cues are short and human, in the v1 style:
  tone + "like you..." + where it goes, e.g. `[deadpan, like you're stating the obvious]`.
- **Tags describe delivery only:**
  - never quote script words (v4 speaks quoted text);
  - never name an action ("correcting yourself" made v4 say the previous line again; no correcting, repeating, quoting,
    reading, listing, saying);
  - no digits.
- **Avoid mid-line tags: one short tag per line** (`check_paste.py` warns). Where the delivery changes inside a sentence, split it into two lines,
  each with its own tag. On v2 take 1, both places with a mid-line tag broke:
  - line 5 derailed and v4 restarted from the top;
  - the closing lines looped three times.
  (v3 used mid-line tags without trouble, but the risk isn't worth it.)
- **Tags are 3-8 words and positive, with no negations** (`check_paste.py` warns). "no gasp", "no doom", "no mic drop" and "no irony, no edge" were
  all in v2 take 1's broken stretch. Say what you want, not what to avoid.
- **A key name right after "And" can lose its first sound:** v2 take 1 said "And 'oogle can't veto". Put CAPS on the name
  when it carries the contrast ("And GOOGLE can't veto"). Check every name in the take transcript.
- **The first words may be said twice** ("She quit. She quit Google.": v3 take 4 and v2 take 1). `check_take.py` flags
  it and `clean_take.py` cuts it; no paste fix is known yet.
- **Keep the opening block under ONE tag, with no mid-line tag in it,** and never follow it with a line that only makes
  sense by referring back (v3: "Buying a laptop soon? [tag] AI's making it pricier." + "Well, AI DATA CENTERS are." made v4
  say "AI's making it pricier" twice, in two takes in a row).
- **Emphasis = CAPS on the word in the line; a beat = …**
- **Numbers and symbols spelled out** (ten percent, five times, twenty twenty-seven); write "U.S." (v4 can read "US" as "us").
- **Alternate hooks go in their own paste file.**
- **Hand the owner the FULL paste text in one copy-paste block, every time anything changes,** never a single line.

Before sending: `python3 scripts/voice/check_paste.py docs/vN/script/script_elevenlabs.md` must print "OK: paste-safe".

## 2. Checking a take

1. Save the take to `assets/vN/` (the raw file stays untouched).
2. `python3 scripts/voice/check_take.py <take>.wav docs/vN/script/script_elevenlabs.md <parakeet model dir>`
   It transcribes the take, aligns it to the script and prints MATCH, or each EXTRA / MISSING bit with timestamps and a
   ready `clean_take.py` command. Setup for the model: see the header of `scripts/voice/transcribe.py`.
3. Extras (a repeat, a read-aloud note) are cut with `scripts/voice/clean_take.py` (cuts at the quietest point, 15 ms
   crossfades); re-run the check on the cleaned file until it prints MATCH. Missing words need a regeneration.
4. Tell the owner what was wrong, why (which cue or note caused it), what was cut, and send the cleaned WAV (audio only
   before G3). Fix the paste file so the next generation is clean, and give them the full text again.
5. The word timings (`<take>_words.json`) are the clock for G3 onward.

## 3. Hand-off format to the owner

The full paste block in one code block, nothing else in it; one line before it ("paste everything inside the box"),
the length after it. If only one line changed, still send everything.

## 4. Automated takes via the API (owner chose this, 2026-10-26)

`video/scripts/voice/generate_take.py PASTE.md OUT_DIR --voice VOICE_ID` generates the take with the owner's voice:
1. Each paste line is generated on its own, with the neighbouring lines as context.
2. Each line is checked by speech recognition. Parakeet runs first, and Whisper gives a second opinion so a misheard
   "BBC" doesn't fail a good line.
3. A line that doesn't match the script exactly, or runs too fast or too slow, is regenerated with a new seed (up to
   `--tries`).
4. The clean lines are stitched with natural pauses into `take.wav`, with `take_words.json` and `report.json`.

The owner hears only a take whose report says ALL LINES CLEAN. Tested offline on 2026-10-26: the pipeline ran end to
end and caught v2 take 1's swallowed "Google". Needs the `ELEVENLABS_API_KEY` secret and the voice id
(`docs/voice/VOICE.md`). `--dry-run` parses only; `--list-models` and `--list-voices` show what the key can use.

## 5. Take log (model, paste format, outcome)

| Date | Video, take | Paste | Outcome |
|---|---|---|---|
| 2026-10-26 | v2 take 1 | 10 long tags (8-20 words), 2 mid-line tags, negations, 1,345 characters | 88 s instead of 43: opening repeat, derail and restart, closing lines looped 3 times, "And 'oogle". Rescued by cutting. |
| 2026-10-26 | v2 take 2 | **5 short tags (1-3 words) inline before their words, tags carry forward, no mid-line tags, no brand after "And", 714 characters** | **Clean on the first generation:** 38.96 s, every word matches (Parakeet + Whisper), no repeats. |

What changed between them is now the default format: short tags on the same line as their words, 4-6 per script,
only where the delivery shifts, and the whole paste at about 800 characters or less. The root-cause proposal
(`docs/voice/PROPOSAL.md`) will refine this.

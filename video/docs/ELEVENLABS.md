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
- **Put a short extra tag mid-line where the delivery changes** (a tag carries on until the next one):
  `Laptops get better for the same money… [deadpan, a half-smile you can hear] usually right after you buy one.`
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

# Voice: the ElevenLabs handoff (every video)

**Default since 2026-10-26: we generate the take through the API with the owner's voice (`docs/voice/API_QUICKSTART.md`,
section 4 below).** Without the key, the owner records it in ElevenLabs. Never a voice other than the owner's. Our job is a
paste file that produces the script word for word, and a check of every take. Learned on v1 and v3; owner rules in
`OWNER_PLAYBOOK.md` (Script and voice).

## 1. The paste file: format v2 (`docs/vN/script/script_elevenlabs.md`)

Root-cause study, 2026-10-26: `docs/voice/PROPOSAL.md`, evidence in `docs/voice/evidence.md`. Every repeat, loop,
restart and garble we had (8 of 8) came from the 3 pastes with a tag mid-line or a delivery change inside a paragraph.
The 6 pastes without one were clean; the confidence is medium-high on the cause and high on the fix. Text that isn't a
tag or a spoken line was read aloud every time. **The format of v2 take 2, which was clean on the first generation, is
the format.**

- **What goes in:** exactly what the owner pastes. No headings, notes, labels, markdown or separators; alternate hooks
  go in their own file.
- **Paragraphs:** one beat (1-2 whole sentences) per paragraph, each on ONE line, with a blank line between.
- **Tags: 4-6 per script, at the START of a paragraph on the same line, 1-4 words:** `[warm, steady] She worked on...`
  - Only where the delivery changes; an untagged paragraph carries the last tag.
  - Never after spoken words, never alone on a line, never two in one paragraph.
  - Tag words are a voice quality: tone (quiet disbelief, curious, warm, serious, dry) or pace/volume (steady, slower,
    quiet, close).
  - Never in a tag: quotes, script words, digits, actions (repeat, correct, read, say), sounds (gasp, laugh, sigh, pause,
    beat), gestures (smile, shrug, lean), or steps ("then", "at the end").
- **Punctuation:** full stops, question marks, and commas for a breath.
  - No dashes (v4 cuts the speaker off).
  - At most one ellipsis per script, inside a sentence.
  - CAPS for one stressed word per paragraph, three per script at most (acronyms don't count).
  - Numbers and symbols spelled out; "U.S." with dots.
  - Avoid "And" right before a name (v4 once swallowed it: "And 'oogle").
- **Opening:** a tag, then the words, with one delivery for the whole first paragraph. The next sentence never restates
  the first.
- **Ending:** the last paragraph ends on a full stop; nothing after it.
- **Length:** 650-900 characters with tags (take 2: 714), and tags under 15 % of them.
- **Cues in the script doc:** the owner's rule "detailed emotional cues" stays met in `script_gN.md` (a full cue per
  line, to read). The paste carries only the short tags v4 needs. This replaces the paste format in
  `CREATIVE_BRIEF.md` ("a bracketed cue on its own line before each beat"), which broke takes (2026-10-26).
- **The linter enforces all of this:** `python3 scripts/voice/check_paste.py PASTE` errors on every pattern that broke a
  take. Its regression set: it fails the v2 take-1 paste and three v3 pastes, and passes the v2 take-2 paste. Nothing
  reaches the owner except its `--handoff` output, and `generate_take.py` refuses a paste that fails it.

## 2. Checking a take

1. Save the take to `assets/vN/`. The raw file stays untouched, and its original name must contain `eleven_v4`.
2. `python3 scripts/voice/check_take.py <take>.wav docs/vN/script/script_elevenlabs.md <parakeet model dir>` (setup in
   the header of `scripts/voice/transcribe.py`).
   - **Exit 0 = MATCH:** the take says exactly the script. Words that Parakeet hears differently get a Whisper second
     opinion; spacing and sounds merged at a word boundary don't count, but a swallowed "Google" does.
   - **BROKEN:** the take is over 1.3x the expected length (words / 2.8 per s). Reject it; don't cut it.
   - **LISTEN:** a silence over 1.0 s inside the take.
3. With three takes from one paste, keep the best take that is MATCH with no cuts. Cut only if none is
   (`clean_take.py`), re-check until MATCH, and listen to every cut and every name.
4. Tell the owner what was wrong and why, then send the chosen take (audio only before G3). Log it in section 5.
5. The word timings (`<take>_words.json`) are the clock for G3 onward.

## 3. Hand-off format to the owner

**The owner only ever gets the text printed by `python3 scripts/voice/check_paste.py PASTE --handoff`.** It prints
nothing but errors if the paste fails. It gives:
- the full paste block, in one code block;
- the expected length and the maximum (1.3x): "a longer take went wrong, press Regenerate";
- the settings: Text to Speech page, model Eleven v4, Stability 50 % (65 % after a broken take, never below 40 %),
  Similarity default, Clone Strength 0 % if shown, never press Enhance;
- the routine: make three takes from one paste (Generate, then Regenerate twice without editing, which is free), send
  all three plus a screenshot of the settings panel, and we keep the best.

Always send the full text, even if only one word changed.

## 4. Automated takes via the API (owner chose this, 2026-10-26)

`video/scripts/voice/generate_take.py PASTE.md OUT_DIR --voice VOICE_ID` generates the take with the owner's voice.
1. It refuses a paste that fails `check_paste.py`.
2. **The whole script first** (`eleven_v4`, stability 0.5, up to 3 seeds). The first take that matches the script
   word for word, within 1.3x the expected length, wins: this keeps v4's whole-scene delivery.
3. **Otherwise per paragraph:** each paragraph with its carried tag, chained with `previous_request_ids` + `next_text`.
   - Each is checked by Parakeet, with Whisper as a second opinion; a paragraph that passed only on Whisper is flagged
     for one human listen.
   - A failing paragraph is regenerated with new seeds (up to `--tries`).
   - The paragraphs are stitched at natural pauses.
4. Output: WAV (`pcm_44100`, Pro plan) with an MP3 fallback, plus word timings and `report.json`.

The owner hears only a take whose report says ALL CLEAN; run `check_take.py` on it too. Tested offline on 2026-10-26:
it rejected the broken take 1 (84 s), accepted a clean whole take, and caught the swallowed "Google".
- Needs the `ELEVENLABS_API_KEY` secret and the voice id (`docs/voice/VOICE.md`).
- `--dry-run` parses only; `--list-models` and `--list-voices` show what the key can use.
- Every API try costs credits (about 1 per character).

## 5. Take log (model, paste format, outcome)

| Date | Video, take | Paste | Outcome |
|---|---|---|---|
| 2026-10-26 | v2 take 1 | 10 long tags (8-20 words), 2 mid-line tags, negations, 1,345 characters | 88 s instead of 43: opening repeat, derail and restart, closing lines looped 3 times, "And 'oogle". Rescued by cutting. |
| 2026-10-26 | v2 take 2 | **5 short tags (1-3 words) inline before their words, tags carry forward, no mid-line tags, no brand after "And", 714 characters** | **Clean on the first generation:** 38.96 s, every word matches (Parakeet + Whisper), no repeats. |
| 2026-10-26 | v2 API take 1 (`generate_take.py`, whole script, eleven_v4, stability 0.5, voice "Test 3") | the take-2 paste (format v2) | **Clean on the first try:** 40.09 s, MATCH (Parakeet + Whisper), 44.1 kHz WAV. |
| 2026-10-29 | v4 variants, voice "Lady1" (`MQnUCZUAQLYMCY1Ztz6d`), per paragraph: eleven_v4 at stability 0.5, 0.35 and 0.45 with livelier tags, eleven_v3, eleven_v3_conversational | the G1 draft 3 paste; a livelier-tag version (`[bright, curious]`, `[amazed]`, `[playful]`, `[warm, bright]`, `[curious, quick]`, `[warm, slower]`) | All said every word, but our check failed them all on "70 000" (the recogniser's digits vs "seventy thousand"), so `generate_take.py` dropped the whole-script reads: fixed with `scripts/voice/textnorm.py`. 150-157 words/min, 46-48 s stitched. |
| 2026-10-29 | **v4 take** (`assets/v4/voice/`): whole script, try 1, **eleven_v4, stability 0.35, the livelier-tag paste** (now `docs/v4/script/script_elevenlabs.md`); the other whole reads: eleven_v4 0.45 (161 wpm), v3 Conversational 0.5 (176 wpm, but ran "outside. But Helsinki WANTS" together with no pause, losing the turn), v3 at 0.0 (144 wpm, 51.5 s) | 769 characters, 6 tags | Raw: 46.0 s, 163 words/min, pauses 0.50 s mean, pitch spread 11.8 st, MATCH. **Shaped** (`scripts/voice/shape_take.py`: sentence gaps 0.26 s, paragraph 0.30, a 0.45 s beat before "But Helsinki WANTS that heat", 0.5 s before the payoff, tempo 1.10 by Rubber Band with the payoff line at 1.0, light polish to -16 LUFS): **41.2 s, 183 words/min, spread 11.5 st, MATCH.** A first shaping cut pauses to their edges and made "non-stop" "non-stock": cuts now keep 60 ms after a word and 30 ms before one, and the tempo runs in one pass per stretch. |
| 2026-10-29 | v4 take 2 (`assets/v4/voice/take.wav`) | the same raw read | Take 1's 1.10 Rubber Band stretch sounded "extremely robotic like there is some weird background", all but its unstretched last line (owner). **Take 2: no stretch**, pauses set from their own audio (sentence 0.24 s, paragraph 0.28, beats 0.45 and 0.5), a lighter polish (no de-esser): **44.1 s, 171 words/min, spread 11.8 st, MATCH**; on the player page https://claude.ai/artifact/Gn8KCPfZ6uh1AXos2koE8N (version 2). |

What changed between them is now the default format: short tags on the same line as their words, 4-6 per script,
only where the delivery shifts, and the whole paste at about 800 characters or less. The root-cause proposal
(`docs/voice/PROPOSAL.md`) will refine this.

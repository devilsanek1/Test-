# ElevenLabs API quickstart (any Claude session on this repo)

**The owner's standing instruction for every future video (2026-10-26):** read `HANDOFF.md`, then follow this page;
send the take as .m4a (+ .mp3) attachments (the Claude app on the owner's phone can't play .wav), lock it into `public/vN/`, log it in `docs/ELEVENLABS.md` section 5, and commit and push to
`video-production` after each step (pull first: another session pushes to the same branch).

Goal: generate a video's narration with the owner's voice through the ElevenLabs API, checked word for word, so the
owner never pastes anything. Proven on 2026-10-26: video 2's API take was clean on the first whole-script try (40.1 s).

## 1. Setup (once per session)

- **Key:** the environment secret `ELEVENLABS_API_KEY` (the owner adds it under cloud environment → Edit → Network
  secrets; a new session sees it).
  - Check it with `[ -n "$ELEVENLABS_API_KEY" ] && echo set`.
  - Never print the key, write it to a file, put it in an agent prompt or commit it.
  - If the owner pastes a key in chat, ask them to rotate it and store the new one as the secret.
  - The key itself starts with `sk_` and is shown only once, when it is created or rotated. The 64-character hex
    string in ElevenLabs' key list is the key's ID: the API rejects it (`api_key_id_used_as_api_key`), and it is not a
    secret. To get a usable key again, rotate the key (or create a new one) and copy the `sk_...` value. (v4,
    2026-10-27; the ID was sent again on 2026-10-29, so the ask to the owner names both: the value that starts with
    `sk_`, never the 64-character string in the key list, stored as the network secret, never pasted in chat.)
- **Voice:** the film's voice from `docs/voice/VOICE.md` (the owner picks it per film; the default is
  `gHYdn45bUiDI9umVTpCo`, "Test 3", the owner's cloned narrator voice; v4 uses `MQnUCZUAQLYMCY1Ztz6d`).
- **Model:** `eleven_v4`, passed explicitly (the key can't list models; the API's default model is older).
- **Tools:** `pip install sherpa-onnx faster-whisper soundfile requests numpy` if any is missing; ffmpeg.
- **Parakeet model:** set `PARAKEET_DIR` to the unpacked model, used for word timings and the check:
  ```
  mkdir -p models && cd models
  curl -sSL -o p.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2
  tar xjf p.tar.bz2 && rm p.tar.bz2
  export PARAKEET_DIR=$PWD/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
  ```
  Also set `WHISPER_DIR` to any writable folder. Whisper `small.en` downloads there and gives the second opinion.

## 2. Make a take (from `video/`)

1. **Paste file:** write `docs/vN/script/script_elevenlabs.md` in paste format v2 (`docs/ELEVENLABS.md` section 1).
   `python3 scripts/voice/check_paste.py docs/vN/script/script_elevenlabs.md` must print `OK: paste-safe`.
2. **Generate:**
   ```
   python3 scripts/voice/generate_take.py docs/vN/script/script_elevenlabs.md assets/vN/api_take1 \
     --voice <the film's voice id: VOICE.md> --model-dir "$PARAKEET_DIR" --whisper-dir "$WHISPER_DIR"
   ```
   It tries the whole script first (up to 3 tries, each kept as `whole_tryK.wav`), then falls back to per paragraph.
   Numbers: the recogniser writes digits ("70 000", "40"); `scripts/voice/textnorm.py` spells them the way the script
   says them (cardinal, year, digit by digit) for both checks; until 2026-10-29 "70 000" failed every v4 whole-script
   read and forced stitched paragraphs (`python3 scripts/voice/textnorm.py --selftest`). `report.json` must say
   `all_clean: true`. Options: `--stability 0.5` (0.4 is more expressive, 0.65 steadier) and `--dry-run`.
3. **Check:**
   `python3 scripts/voice/check_take.py assets/vN/api_take1/take.wav docs/vN/script/script_elevenlabs.md "$PARAKEET_DIR"`
   must print MATCH (exit 0). Listen once to anything marked "OK (Whisper)" or "LISTEN".
4. **Explore and shape the delivery (owner, v4 G2: "play with the cadence and emotions to get to the best possible
   outcome"):** Eleven v4 takes no speed or style, so the delivery is explored with the model, the stability and the
   tags (a few whole-script reads: e.g. v4 at 0.35-0.5 with the plain and a livelier tag set, v3 Conversational),
   compared with `python3 scripts/voice/measure_take.py A.wav B.wav --words <stressed words>` (words/min, pauses,
   pitch spread, stress) against the owner's reference (`docs/voice/refs/`), then the best read is shaped with
   `python3 scripts/voice/shape_take.py take.wav paste.md shaped.wav --tempo 1.10 --tempo-at "<payoff words>=1.0"
   --beat "<turn words>=0.45" --beat "<payoff words>=0.5" --polish --report shape.json` (gaps 0.26 s at a sentence,
   0.30 at a paragraph, commas and breaths only shortened; Rubber Band keeps the pitch) and checked again with
   `check_take.py` (MATCH). The owner still gets ONE take; the variants stay ours.
5. **Deliver:** send the take as `take.m4a` and `take.mp3` attachments (`ffmpeg -i take.wav -c:a aac -b:a 256k
   -movflags +faststart take.m4a`; `-c:a libmp3lame -b:a 320k take.mp3`): the Claude app on the owner's phone shows
   "File preview unavailable" for a .wav (v4, 2026-10-29). Audio only before G3; the .wav stays in the repo for the mix.
6. **Lock it for G3:** add a 0.12 s lead and write `public/vN/voice.wav` + `public/vN/voice_words.json`, as for video
   2 in commit 93852c3. The first word then lands at ~0.12 s (frame 7 at 60 fps): that is the playbook's "voice from
   the first frames", with room for frame 0's drawing to lead it; never a longer silent lead.
7. **Log:** add the take (paste stats, settings, outcome) to `docs/ELEVENLABS.md` section 5.

Cost: about 1 credit per character per try (~700 for a 40 s script). Every API try is charged.

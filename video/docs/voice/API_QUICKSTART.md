# ElevenLabs API quickstart (any Claude session on this repo)

**The owner's standing instruction for every future video (2026-10-26):** read `HANDOFF.md`, then follow this page;
send take.wav as an attachment, lock it into `public/vN/`, log it in `docs/ELEVENLABS.md` section 5, and commit and push to
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
    2026-10-27)
- **Voice:** `gHYdn45bUiDI9umVTpCo` ("Test 3", the owner's cloned narrator voice; `docs/voice/VOICE.md`).
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
     --voice gHYdn45bUiDI9umVTpCo --model-dir "$PARAKEET_DIR" --whisper-dir "$WHISPER_DIR"
   ```
   It tries the whole script first (up to 3 tries), then falls back to per paragraph. `report.json` must say
   `all_clean: true`. Options: `--stability 0.5` (0.4 is more expressive, 0.65 steadier) and `--dry-run`.
3. **Check:**
   `python3 scripts/voice/check_take.py assets/vN/api_take1/take.wav docs/vN/script/script_elevenlabs.md "$PARAKEET_DIR"`
   must print MATCH (exit 0). Listen once to anything marked "OK (Whisper)" or "LISTEN".
4. **Deliver:** send `take.wav` to the owner as an attachment (audio only before G3).
5. **Lock it for G3:** add a 0.12 s lead and write `public/vN/voice.wav` + `public/vN/voice_words.json`, as for video
   2 in commit 93852c3. The first word then lands at ~0.12 s (frame 7 at 60 fps): that is the playbook's "voice from
   the first frames", with room for frame 0's drawing to lead it; never a longer silent lead.
6. **Log:** add the take (paste stats, settings, outcome) to `docs/ELEVENLABS.md` section 5.

Cost: about 1 credit per character per try (~700 for a 40 s script). Every API try is charged.

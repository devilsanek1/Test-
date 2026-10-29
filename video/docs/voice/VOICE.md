# The owner's ElevenLabs voice (not secret)

- Voice id: **gHYdn45bUiDI9umVTpCo** ("Test 3", the owner's cloned narrator voice, 2026-10-26): the default. Pass it as
  `--voice` or set `ELEVENLABS_VOICE_ID`.
- **The voice is the owner's pick, per film** (playbook, Script and voice). Films that use another voice:
  - v4 (Helsinki): **MQnUCZUAQLYMCY1Ztz6d**, the owner's try (2026-10-29: "lets try another voice - with this id
    MQnUCZUAQLYMCY1Ztz6d"). Not yet checked with a valid key: at G2, first `GET /v1/voices/MQnUCZUAQLYMCY1Ztz6d`
    (its name, its category; a voice from the shared library may first need adding to the account's voices), then
    the take as usual; PROPOSAL.md's settings were tuned on the default voice, so judge the stability on this one.
- API key: the environment secret `ELEVENLABS_API_KEY`. Never print it, write it to a file or commit it.
- Model and settings: `PROPOSAL.md` (root-cause study, 2026-10-26). `python3 video/scripts/voice/generate_take.py
  --list-models` shows what the key can use.

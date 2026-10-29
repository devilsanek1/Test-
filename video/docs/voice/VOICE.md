# The owner's ElevenLabs voice (not secret)

- Voice id: **gHYdn45bUiDI9umVTpCo** ("Test 3", the owner's cloned narrator voice, 2026-10-26): the default. Pass it as
  `--voice` or set `ELEVENLABS_VOICE_ID`.
- **The voice is the owner's pick, per film** (playbook, Script and voice). Films that use another voice:
  - v4 (Helsinki): **MQnUCZUAQLYMCY1Ztz6d**, the owner's try (2026-10-29: "lets try another voice - with this id
    MQnUCZUAQLYMCY1Ztz6d"). Checked 2026-10-29 (`GET /v1/voices/<id>`, HTTP 200): **"Lady1"**, category `cloned`
    (in the owner's account, so the API uses it directly), labels female, young, American English. PROPOSAL.md's
    settings were tuned on the default voice, so judge the stability on this one. **Pace:** the owner's El Niño
    reference (`refs/2026-10-29_el_nino/`) reads at about 214 words a minute with 0.2-0.3 s pauses and a lively pitch;
    measure Lady1's pace on the first take and, if it reads much slower, try ElevenLabs' speed setting (about 1.05-1.15)
    before cutting words; the word budget follows the measured pace.
- API key: the environment secret `ELEVENLABS_API_KEY`. Never print it, write it to a file or commit it.
- Model and settings: `PROPOSAL.md` (root-cause study, 2026-10-26). `python3 video/scripts/voice/generate_take.py
  --list-models` shows what the key can use.

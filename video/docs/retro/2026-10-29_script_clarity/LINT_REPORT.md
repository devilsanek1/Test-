# check_clarity.py: the build report (2026-10-29)

**Status: IN PROGRESS.** Building `video/scripts/voice/check_clarity.py` from `LINT_SPEC.md` (principles:
`PRINCIPLES.md`). This file is updated at every step.

## Progress
- [x] read the spec, the house-style tools (`check_rhythm.py`, `check_paste.py`), the corpus and the spec writer's
  scratch prototype (the spec's numbers come from it; its codes differ: its C4 is the spec's C3, its C5 the spec's C4)
- [x] installed for the system `python3`: spacy 3.8.18, en_core_web_sm 3.8.0, wordfreq 3.1.1
- [x] library choice: spaCy + en_core_web_sm and wordfreq kept; coreferee 1.5.0 and proselint 0.16.0 tested on our
  cases and rejected; no-cliches, write-good, retext, Vale, Stanza, NLTK, UDPipe, textstat weighed (written up below)
- [x] the tool: `video/scripts/voice/check_clarity.py`, fixtures and cases in `video/scripts/voice/clarity_tests/`
- [x] the selftest: 28 of 28 cases pass (R1-R5)
- [ ] the corpus run (v1, v2, v3, v4 draft 1, v5 draft 1): every flag read by hand
- [ ] "Doc changes needed"

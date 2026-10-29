# Video 5: the spine draft, checked against our script rules (2026-10-29 ~09:30 UTC)

The owner: "Evaluate it based on our script rules - like for example rhythm?" (on the 6-beat spine sent ~09:20 UTC:
`spine_draft_as_sent.md`). Checks: playbook "Script and voice" and "Hook and pacing"; the brief's RULE #1 (AI tells);
`scripts/voice/check_rhythm.py`; the 30-45 s target (at ~165 words a minute).

| Rule | As sent | Note |
|---|---|---|
| One story, one throughline, a turn and a payoff | PASS | "where do you put a machine this hot?"; the turn "use the heat"; the payoff Helsinki; it loops back to the bunker |
| Retell test | PASS | a bunker, weird places, space overheats, the bunker heats the city, Helsinki goes bigger |
| First line ("Did you know ...", a friend, a place and a thing) | PASS | |
| Rhythm (`check_rhythm.py`) | **FAIL** | 8 sentences, 0 short (all 10-28 words) |
| Length 30-45 s | **FAIL** | 141 words, about 51 s |
| AI tells (RULE #1) | **FAIL** | "The smart move isn't hiding the heat, it's using it" (the "not X, it's Y" template); two colon reveals ("crazy heat: ...", "weirdest places: ...") |
| Every join by so / but / because | weak | beat 1 to 2 has no join (why is the bunker there? needs "and it gets hot down there") |
| One "you" | weak | "you" arrives only in the last line; seed it early (the viewer's own chatbot question) |
| Comment pull (a plus now) | PASS | the "weirdest places" list; "space is freezing, so why overheat?" |
| True enough (fact lock floor) | PASS | Helsinki "is meant to"; space never "keeps the chips cool" |

**A tightened demo** (`spine_tight_demo.md`, not the G1 script): 121 words (about 42 s), 15 sentences, 8 short:
`check_rhythm.py` OK. Open issue for G1: "Inside a mountain. Under the sea. Even in space." can read as staccato fragments (a
RULE #1 tell); the writer smooths them with connectives ("like inside a mountain, or under the sea").

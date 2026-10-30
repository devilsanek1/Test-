# Video 4, G1 draft 3: the critic's report (round 3)

**Status: DONE. Verdict: FIX AND SEND** (0 blockers, 1 major, 1 minor). Critic of workflow `v4-g1-draft3b`,
2026-10-29. Judged: the paste `script_elevenlabs.md` (hook option 1, 118 words), `script_g1.md` draft 3 and
`../THROUGHLINE.md` draft 3. Against: the owner's words (`../OWNER_NOTES.md`, every G1 entry; above all the note on
draft 2 and the El Niño line); the playbook's Script and voice (CLEAR TO A REGULAR PERSON ON ONE HEARING; ONE SUBJECT,
GONE DEEP with "No side quests"; RULE #1; "Human connectors, placed TACTICALLY"; Rhythm); the principles
`../../retro/2026-10-29_script_clarity/PRINCIPLES.md` (P1-P11); the reference `../../voice/refs/2026-10-29_el_nino/`
(README and transcript); and the fact file `../../v5/research/factlock.md` (FL). The cold panel on draft 3
(`panel_d3/`) runs beside this critique, and this file was written without it. Every replacement below was run as its
own paste through the three checks (scratch copies), and the verdicts are quoted.

**In one line:** draft 3 does what the owner asked. The side quest is gone. The owner's "To put it into perspective,"
sits where the owner put it. "Normally," and the viewer's own question come from the El Niño line. Every line is clear
on one hearing and stays inside the fact file. One stretch still sounds written: "But Helsinki WANTS that heat. So
Helsinki has a plan for twenty twenty-seven. How would that work?" It names the city twice in a row, puts three full
stops in about 6 s, and asks the question without the reference's "So". One small swap fixes it (finding 1).

## The three checks (run on `script_elevenlabs.md`)

- `python3 video/scripts/voice/check_rhythm.py video/docs/v4/script/script_elevenlabs.md` -> exit 0:
  `12 sentences, 4 short (<= 5 words, 33%), 7 long (>= 9 words)` / `OK: long sentences are broken up by short ones`
  (per sentence: 11, 10, 5 SHORT, 19, 5 SHORT, 12, 5 SHORT, 8, 4 SHORT, 17, 11, 9).
- `python3 video/scripts/voice/check_paste.py video/docs/v4/script/script_elevenlabs.md` -> exit 0:
  `118 words, 728 characters, 5 tags (4.2 per 100 words); expected about 42 s, max 55 s` / `OK: paste-safe`
  (no warnings).
- `python3 video/scripts/voice/check_clarity.py video/docs/v4/script/script_elevenlabs.md --film video/docs/v4/script/clarity.json --questions`
  -> exit 0: `12 sentences, 0 errors, 1 warnings; 0 of 116 words below Zipf 3.0 (allowed: chatbot)`. The one warning:
  `5 W2 "That's" points at a whole idea. Say the thing` (panel question: "What is 'that' here?"). Then `OK: none of
  the error patterns`. The warning is answered right in `script_g1.md`, "Checks": "That's" = the forty kettles
  boiling non-stop, the only thing line 4 says, and every draft-2 viewer read it that way.

## (1) No side quest: each beat's job, and what could go

| # | Line | Its job | Cut in the head |
|---|---|---|---|
| 1 | Did you know Helsinki wants AI to heat seventy thousand homes? | the news for a friend; opens "how?" | stays (the owner's praised line) |
| 2 | AI runs on giant computers, in buildings called data centers. | the plain base, the film's two names | stays: line 3's "Those computers" needs it |
| 3 | Those computers get really hot. | the heat, said plainly | stays: without it the heat is never said |
| 4 | To put it into perspective, just one of these computers makes as much heat as FORTY kettles, boiling non-stop. | the one scale beat | stays (the owner asked for its connector) |
| 5 | That's a lot of tea. | the one smile | no fact; kept as P10's one exception (the joke) |
| 6 | Normally, data centers just use big fans to blow that heat outside. | the usual case, so the turn is a turn | stays |
| 7 | But Helsinki WANTS that heat. | THE TURN | stays |
| 8 | So Helsinki has a plan for twenty twenty-seven. | the honest floor and its year, where the plan starts | stays (FL 6.7; panel_r2 lesson) |
| 9 | How would that work? | the viewer's question before the mechanism | no fact; kept as a P11 connector |
| 10 | A big new data center would cool its computers with water, so the water comes out hot. | how the heat is caught | stays |
| 11 | Then pipes under the streets carry that heat into people's homes. | how the heat reaches homes | stays |
| 12 | Soon, your chatbot could heat an apartment in Helsinki. | THE PAYOFF, the core line | stays |

**No side quest left.** One subject (Helsinki's AI heat), one home place, one comparison shot (line 6), 3 spoken
numbers. Cut in the head, only lines 5 and 9 leave the story standing, and the rules allow both. Line 5 is the one
joke: no fact, just the plain situation of the kettles, and every draft-2 viewer kept the thumb there. Line 9 adds
words, not facts (the owner: "its actually okay to keep the text longer if needed"). Neither is information "packed
in". Everything the owner's note warned about stays out of the voice: the cathedral, 2010, the heat pumps, the tenth
of the city's heat, the coal, the quote. The reserve cuts are in the right order (the tea line, then "boiling
non-stop").

## (2) The connectors and the flow, against the El Niño line

| Connector | Line | The job of its sentence | Would a person say it there? | Verdict |
|---|---|---|---|---|
| "To put it into perspective," | 4 | the comparison | yes: the owner's words, at the owner's spot | keep |
| "Normally," | 6 | the usual case before the change | yes: the reference uses it the same way ("Normally, trade winds blow west, ...") | keep |
| "So" | 8 | the consequence (Helsinki wants the heat, so a plan) | yes, but it uses up the "So" that line 9 needs | finding 1 |
| "How would that work?" | 9 | the viewer's question before the mechanism, answered at length in lines 10-11 | yes, at the turn into the mechanism, where the reference asks its question | keep the move; change its form (finding 1) |

That makes three connectors plus the small "So", inside "about two to four". None is a stock reveal (no "Here's the
thing", "The catch?", "Turns out", and no self-answered "The result? X."). None could open just any sentence. "Actually"
(the owner's other example) is left out for a reason that doesn't hold (finding 2).

**Does it sound like the reference?** Mostly yes: a person explaining, with the connectors at the joins. Line 4 carries
19 words as one picture. Line 6 opens like the reference's usual case. Line 9 asks the question, and line 10 answers it
in one flowing 17-word thought, joined by a true "so". The short lines sit where a beat needs a punch (3, the heat; 7,
the turn; 9, the question) and at the smile (5), and each keeps its noun or has one obvious target. **The exception is
lines 7-9** (finding 1). The measures:

| | Draft 3 | El Niño (its 5 whole sentences) |
|---|---|---|
| Sentence lengths (words) | 11, 10, 5, 19, 5, 12, 5, 8, 4, 17, 11, 9 | 19, 5, 15, 24, 24 |
| Mean words per sentence | about 9.7 | about 17 |
| Short lines (5 words or fewer) | 4 of 12 (33 %) | 1 of 5 (20 %) |

Draft 3 still uses about half the reference's sentence length. That is right under P5 (one new idea per sentence; the
reference's 24-word lines carry two steps each, which our clarity rule would split). So the rest of the flow belongs to
G2: a brisk read with short pauses between sentences (the reference: about 3.6 words a second, pauses of 0.18-0.32 s;
README, "A brisk, lively read"). Two notes for the fix pass:
- **`script_g1.md`'s flow claims should say the measures as they are.** "The reference's run of three" at lines 10-12
  is 17, 11 and 9 words; the reference's run is 15, 24 and 24.
- **The paste's paragraphs are right.** There are 7, each 1-2 whole sentences (`docs/ELEVENLABS.md` §1). The only break
  inside a flowing thought is 10 | 11 ("...comes out hot." / "Then pipes ..."). The format forces it: the question
  shares its answer's paragraph, as it should, and a paragraph holds at most two sentences. "Then" after a beat sounds
  natural; G2 keeps that pause short.

## (3) Clear on one hearing

- **Pointers, each with one target:** 3 "Those computers" -> the giant computers (2). 4 "these computers" -> the same;
  the "it" in "To put it into perspective" belongs to the phrase itself (nothing to mistake). 5 "That's" -> the forty
  kettles boiling (W2, answered). 6 "that heat" -> the heat one of these computers makes. 7 "that heat" -> the heat the
  fans blow outside. 9 "that" -> the plan (8). 10 "its" -> the new data center; "the water" -> the water in the same
  line. 11 "that heat" -> the heat the hot water carries; "the streets" -> Helsinki's.
- **Names, one per thing:** AI -> giant computers / those / these / its computers; data centers / a big new data
  center; Helsinki; your chatbot (the AI you use). No trade word: `clarity.json`'s rivals (chips, cabinet, rack,
  servers) are never said.
- **Nothing figurative**, apart from two exceptions that are fine. "To put it into perspective" is the owner's own
  phrase and a common spoken lead-in (the panel's non-native viewer is the check). The core line's "your chatbot could
  heat" is the plain funny thought every draft-2 viewer got.
- **Draft 2's snags that draft 3 fixed:**
  - "one of them" -> "one of these computers" (the one-computer-or-one-building doubt);
  - "big fans just blow" -> "use big fans to blow" (Lucía heard football fans);
  - "there" is out;
  - "carry it" -> "carry that heat" (the shower doubt).
- **Still open, but passing:**
  - "Water and computers?" (2 of 3 in `panel_r5/`; each worked it out alone, and the pipes in the picture answer it).
  - The smart-thermostat first picture at line 1 (every draft-2 panel); lines 2-3 close it, and finding 2 closes it
    sooner.

## (4) The story

- **One thing:** Helsinki's AI heat. One home place (the snowy street, above and below the snow) and one comparison
  shot (line 6).
- **The spine:**
  1. the hook (1);
  2. the base (2-3);
  3. the scale and the smile (4-5);
  4. the usual case (6);
  5. THE TURN (7: short, keeps its noun);
  6. the plan and its year (8: said where the plan starts, before the mechanism);
  7. the question (9);
  8. how it works (10-11);
  9. THE PAYOFF (12: the core line, last; "Soon" points back at 2027).
- **The joins:** every one is a but, so, because or then, and the film ends on the payoff.
- **Length:** 118 words. That is about 41.7 s at the old measured 2.87 words a second, or about 33-36 s at a brisk
  3.3-3.6: inside 30-45 s either way.
- **The turn comes late, but it is not a finding.** It lands at about 22 s (53 % of the way in), later than
  PRINCIPLES' ~14 s, because the scale and the joke (the owner's keeps) come before it. No draft-2 viewer lost the
  thumb before it, and a brisk G2 read brings it to about 18 s.
- **If the owner picks hook option 2** ("There's a plan in Helsinki ..."), line 8 adds a second "plan". Pointing back
  at the first one keeps it as one plan: "That plan starts in twenty twenty-seven." (P8's own example; tested with
  option 2 and finding 1: all three checks OK, 118 words, the same 1 warning).

## (5) Facts (FL), the floor above all

Every spoken claim is inside FL, and the floor holds:
- "wants" (1);
- "a plan for twenty twenty-seven" (8; FL 6.7: heat recovery "scheduled to begin in 2027");
- "would" (9-10);
- "could" and "Soon" (12; FL's floor allows "from next year").

Nothing says the plant is built, has a tenant, or runs. The round-ups are all ones FL allows:
- 70,000 homes = flats at full size (6.5);
- one giant computer = one 120 kW rack = forty 3 kW kettles (2.2);
- "Normally ... big fans" = Sirkka's "cooled to sea or air" as the typical case, with the exceptions in 8.2 (7.1,
  8.10);
- "water" for the coolant, and "hot" for 50-60 C (6.3);
- the heat pumps left out (6.3);
- "your chatbot", "could" (FL's own comment line).

Lines 10 ("comes out") and 11 ("carry") switch to the present tense to tell the mechanism, inside the frame of
"would". Draft 2 did the same, and every viewer in `panel_r5/` heard the plan as a plan ("'Would' tells me it's still
a plan, not built yet"). So that is not a finding. If `panel_d3/` hears line 11 as already running, there is a tested
fallback: "Then pipes under the streets would carry that heat into people's homes." (all three OK, 119 words). It is
not proposed now, because it makes three "would"s in three lines.

## Findings (ranked)

### 1. MAJOR: lines 7-9, the one stretch that still sounds like clipped written lines
- **The lines:** "But Helsinki WANTS that heat. So Helsinki has a plan for twenty twenty-seven. How would that work?"
- **The problem:** it names the city twice in a row, a written workaround for "it" that nobody says out loud. It puts
  three full stops in about 6 s. And the question lacks the "So" that makes the reference's "So how does it work?"
  sound like a friend's pivot. Bare, "How would that work?" is also how a doubter talks ("how would that even work?"),
  right after the line that says it is only a plan. The plan line is the film's one dip. Four draft-2 hearings of this
  exact line felt it, though every thumb stayed:
  - `panel_r3/` Maya: "'2027' makes it sound a bit like the news";
  - `panel_r4/` Daniel: "A beat slow";
  - `panel_r5/` Maya: "'has a plan' sounds a bit like the news. I dipped a little here";
  - `panel_r5/` Lucía: "a bit less exciting".

  Draft 3 kept the line word for word and added the question after it.
- **The replacement (tested):** line 7 unchanged; **line 8 "The city has a plan for twenty twenty-seven."**;
  **line 9 "So how would that work?"**
- **Checks:** rhythm OK (8 and 5 words; 4 short, 33 %); paste OK (119 words, no warnings); clarity 0 errors and the
  same 1 warning (5 W2), with the names line unchanged.
- **Facts:** FL 6.1, 6.7. "The city" is the same round-up as "Helsinki": Helen, the City of Helsinki's energy
  company, with OnZero. "For twenty twenty-seven" and "would" keep the plan a plan.
- **Why it holds the rules:**
  - "The city" is the everyday way to say a city you just named. It is not a rival name for the film's one thing
    (P2's targets are chips, cabinets and racks), and Helsinki is the only city the film names.
  - The pronoun versions fail the check: "So it has a plan ..." gets a W1 (Helsinki or the heat), and "So they have a
    plan ..." gets a C2 (FAIL).
  - The "So" moves; it doesn't go. The owner's "so" stays in the film, in the reference's own spot. The count stays at
    three connectors plus "So", and the short line at the turn (7) is untouched.
- **The fallback (one word, tested):** line 8 "So the city has a plan for twenty twenty-seven." with line 9 as it is
  (all three OK, 119 words). It fixes the repeated name but not the question's form.
- **Sync:**
  - the paste's paragraphs 4-5;
  - the line table (8-9: words; line 9's cue: "'So' light and quick, a friend's pivot, as in the El Niño line");
  - the connector table (the "So" row moves to line 9);
  - `../THROUGHLINE.md` §3 (the L7 -> L8 first word becomes "The", the L8 -> L9 first word "So") and §5.8 (the
    question takes about 1.7 s);
  - every time from line 9 on, about +0.35 s;
  - and the flow measures in "Where the sentences flow now" (note under (2)).

### 2. MINOR: line 2, "Actually" where it is true
- **The line:** "AI runs on giant computers, in buildings called data centers."
- **The problem:** the owner named "Actually" as a connector to try ("something like 'Actually' / 'so'"). The draft
  leaves it out because "no sentence here opens on a correction of what the viewer expects". But line 2 is exactly
  that correction. In every draft-2 panel, the viewers first pictured a smart thermostat at "AI to heat"
  (`script_g1.md`'s own note; in `panel_r5/`, all three). Six hearings even retold line 2 as a correction, in their
  own words: "isn't really inside my phone" (`panel/` Maya); "AI isn't just in my phone ... OK, so not a thermostat"
  (`panel_r2/` Daniel); "Oh, so not the thermostat thing then" (`panel_r2/` Maya); "isn't actually in my phone"
  (`panel_r3/` Maya); "aren't just in my phone" (`panel_r5/` Maya); "AI isn't really in my phone" (`panel_r5/`
  Daniel). So the line that tells them AI is giant, hot machines is "the part that surprises" (P11). The word also
  turns the line the teen called school-like in all five draft-2 panels ("A bit science-lesson", "Bit school-lesson",
  "A bit like school", "A bit school-ish", "Bit school-lesson"; thumb kept each time) into a friend's aside.
- **The replacement (tested):** **"AI actually runs on giant computers, in buildings called data centers."** In the
  middle of the sentence it reads as "in fact", never as the narrator taking back line 1.
- **Checks:** all three OK (119 words; together with finding 1, 120). `check_clarity.py` lists "actually" as a wanted
  connector (`CONNECTORS`).
- **Facts:** FL 2.1, 2.2 (the same claim).
- **The count:** together with finding 1 there are four connectors ("actually", "To put it into perspective,",
  "Normally,", "So how would that work?"), the top of "about two to four". Without finding 1 it would be four plus the
  small "So", so take it only with finding 1.
- **The cue for line 2:** add "'actually' light, a friend's aside, never a correction of the viewer".

## The paste with both findings applied (tested)

```
[curious, bright] Did you know Helsinki wants AI to heat seventy thousand homes? AI actually runs on giant computers, in buildings called data centers.

Those computers get really hot. To put it into perspective, just one of these computers makes as much heat as FORTY kettles, boiling non-stop.

[light] That's a lot of tea. Normally, data centers just use big fans to blow that heat outside.

[warm] But Helsinki WANTS that heat. The city has a plan for twenty twenty-seven.

[curious] So how would that work? A big new data center would cool its computers with water, so the water comes out hot.

Then pipes under the streets carry that heat into people's homes.

[warm, slower] Soon, your chatbot could heat an apartment in Helsinki.
```

The checks on this paste:
- `check_rhythm.py`: `12 sentences, 4 short (<= 5 words, 33%), 7 long (>= 9 words)` / `OK: long sentences are
  broken up by short ones` (11, 11, 5, 19, 5, 12, 5, 8, 5, 17, 11, 9);
- `check_paste.py`: `120 words, 737 characters, 5 tags (4.2 per 100 words); expected about 43 s, max 56 s` / `OK:
  paste-safe`;
- `check_clarity.py`: `12 sentences, 0 errors, 1 warnings` (5 W2, as now) / `OK: none of the error patterns`.

That is about 41.9 s to the last word at 2.87 words a second, and about 42.4 s with the room tone.

## For the re-hear (cold first, then these questions)
- Line 2: "What does AI run on? Did 'actually' sound like a friend telling you something, or like a know-it-all?"
- Line 8: "Whose plan is it, and for when?"
- Line 9: "Did 'So how would that work?' sound like a question you had, or like a doubt?"
- Then P10's and P11's questions: "Which sentence could the film lose?" and "Where did it sound most like a person
  talking, and where most like a script?"

**Verdict: FIX AND SEND.** The spine passes the one-subject test and holds the turn, the plan with its year, and the
payoff at the end. No line fails clarity, and the facts and the floor hold. The fix pass swaps two words in line 8 and
adds "So" to line 9 (finding 1), and adds one word to line 2 (finding 2, only together with finding 1).

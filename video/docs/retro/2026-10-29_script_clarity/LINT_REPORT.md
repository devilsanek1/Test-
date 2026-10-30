# check_clarity.py: the build report (2026-10-29)

**Status: DONE.** `video/scripts/voice/check_clarity.py` is built from `LINT_SPEC.md` (principles: `PRINCIPLES.md`).
Its selftest passes 38 of 38 cases: the spec's R1-R5 plus 5 cases for fixes made during the build and, since the
same day's update for the owner's connectors (section 2, item 11; `INTEGRATION_2.md`), 5 more. On v1, v2, v3,
v4 draft 1 and v5 draft 1 its errors are exactly the spec's. Every warning on those five scripts was read by hand.
Files: the tool; `video/scripts/voice/clarity_tests/` (frozen copies of the corpus, two film lists, `cases.json`);
this report. Nothing else was changed: the doc edits are listed in section 6 for the integrator.

---

## 1. Usage

From `video/` (it runs from any folder; the film list is found from the script's own path):

```
python3 scripts/voice/check_clarity.py SCRIPT.md                     # every sentence with its flags, then the summary
python3 scripts/voice/check_clarity.py SCRIPT.md --film CLARITY.json # with the film's word list
python3 scripts/voice/check_clarity.py SCRIPT.md --no-film           # ignore docs/vN/script/clarity.json (e.g. an archived draft)
python3 scripts/voice/check_clarity.py SCRIPT.md --questions         # also the panel's targeted questions, one per flag
python3 scripts/voice/check_clarity.py SCRIPT.md --quiet             # only the flagged sentences and the summary
python3 scripts/voice/check_clarity.py SCRIPT.md --json              # machine-readable (flags, questions, info, versions)
python3 scripts/voice/check_clarity.py --selftest                    # the regression set (clarity_tests/cases.json)
```

- **Input:** a plain-text or markdown file of spoken lines. An ElevenLabs paste works: tags, headings, tables,
  quotes and blank lines are ignored. Sentences come from `check_rhythm.py`'s own `sentences()` (imported, not
  copied), so the numbering matches it exactly.
- **The film's list:** without `--film`, a script under `docs/vN/` uses `docs/vN/script/clarity.json` if it exists.
  The first output line says which list was used, or why none was. The format is LINT_SPEC section 3:
  `thread` {name, rivals}, `trade` {term: [plain descriptions]}, `allow` {word: reason}, `unique` [nouns].
- **Exit codes:** 0 = OK: no errors. Each warning is fixed, or answered in the script doc's "Checks" section.
  1 = FAIL: an error. Fix it, or allow it in the film's list with a reason; the reason is printed.
  2 = a usage error, a bad film list, or a missing library. It prints the install line and never passes silently.
- **Install** (pinned; validated in this session, and the `--direct` model line was run end to end):
  `pip install "spacy==3.8.18" "wordfreq==3.1.1" && python3 -m spacy download en_core_web_sm-3.8.0 --direct`.
  With other versions, the tool prints a note asking for `--selftest` to be run first.
- **Speed:** about 1.3 s to load and 0.24 s for draft 1. The output is deterministic: two runs over the corpus were
  byte-identical.
- **Don't run it with `python3 -I`** on this machine. spaCy's dependency jinja2 sits in root's user site-packages,
  which `-I` excludes; the tool then exits 2 naming jinja2. The tool only reads our own files, so `-I` isn't needed.
- **Python:** written for 3.10 and up. Checked on 3.13 (runs) and 3.11 (parses and compiles). No f-string syntax
  that needs 3.12 or later.

**How to read the output:**
- Each sentence is printed, followed by its flags. Each flag has a code, the words it is about, and what to do.
- Then come the info lines:
  - `names:` the name chain. Every name the script gives its things, in order, so a name swap shows at a glance.
    Draft 1: `AI 1 -> chips 2 -> cabinet 3 -> chips 7 -> data center 12 -> chatbot 13`.
  - `pointers:` each it / they / them / their, with its candidates and the reading the script would pick, and why.
  - `numbers:` numbers per 10 s, at 2.87 words a second.
  - `allowed by the film's list:` each allowed word that would have fired, with its reason.
  - The share of words below Zipf 3.0.
- Last comes the verdict.

## 2. The checks (as built)

**Errors** fail the script (exit 1). Each is a pattern the owner flagged as losing people, found with high
precision.

| Code | What | Draft 1 |
|---|---|---|
| C1 | A trade word, at its first use, not described plainly. It passes after "called / named / known as", a description joined after a comma or colon, or one of the film's plain descriptions in the same or the line before. A false friend (chips, cabinet, rack, server, model, node, cluster, grid, token, agent, compute as a noun) passes only inside an everyday compound ("potato chips") or by the film's `allow`. | 2 "chips", 3 "cabinet", 7 "water-cooled", 8 "heat pumps", 12 "data center" |
| C2 | A pointer that fails in one of three ways: rivals in a short line (5 words or fewer); rivals side by side ("the air or the sea"); or a "they" with no plural thing before it (the generic "they say" is exempt) | 6 "it" (heat, air, sea); 10 "it" (city, heat); 11 "they" |
| C3 | A vague scope ("almost everywhere", "most places", "in many countries") | 5 |
| C4 | An idiom a worldwide ear must decode ("first dibs", "a heads-up", "word got out", "by the mountain") | (v1, v3) |

**Warnings** don't fail the script (exit 0). Each one is fixed or answered in "Checks", and each becomes a
targeted question for the panel after its cold pass (`--questions`):

| Code | What | Panel question (example) |
|---|---|---|
| W1 | A pointer with rivals in a longer line | "Helsinki wants what?" |
| W2 | A pointer at a whole idea: "That's", "Which", a bare "this/that", "did it" | "What is 'that' here?" |
| W3 | A degree with nothing to point at ("that hot") | "How hot is 'that hot'?" |
| W4 | A first mention with "the / those / this" | "Which chips?" |
| W5 | No doer: a passive with no "by" or "with", or "someone" | "Who dumps it?" |
| W6 | A figurative phrasal verb ("gets a boost", "end up", "pass that on") | "What does 'gets a boost' mean here?" |
| W7 | A scolding or outrage frame ("nobody's even", "of course") | "How does this line sound to you: kind, funny or angry?" |
| W8 | A rare word or unknown name (Zipf < 3.0, scored on the word's base form) | "Do you know the word 'overheats'?" |
| W9 | Numbers: more than one in a sentence, a multiplier, a percentage, or degrees with no everyday anchor | "What was the number, and what did it mean?" |
| W10 | A "like" that doesn't say what is alike | "Like in what way?" |
| W11 | More than 4 words before the subject (a 4-word place or time signpost passes) | "Say this line back in your own words." |
| W12 | More than one step: 3+ finite verbs outside relative clauses, or ", then" | (the same) |
| W13 | A rival name for the film's thread object (needs the film's list) | "Are the 'chips' the same thing as the computers?" |

**Left to the panel and the writer**, as the spec says:
- a two-step or ironic joke (the tea line gets W7 for its tone only);
- a hint where the plain thought belongs ("Luckily, ...");
- a "so" that doesn't follow;
- a common word in a trade sense that no list holds (v1's "officially supported", v2's "any lawful government
  purpose");
- whether a name is world-famous;
- whether a line works without its picture;
- the story.

### Where the build departs from LINT_SPEC (each a fix found on the corpus; the cases guard them)

1. **Pronoun chains.** A pronoun the tool resolved passes its thing on to the next line's pronoun. Before this, "...
   nobody is using them. They're too far from the homes." got a false C2 "no plural thing" (case R5.12). One
   side effect: v1's "Cloudflare says that once it was announced, they saw ..." now gets a W1, because "they" could
   be the researchers, the PHP people or the hackers. That is a fair question: the line means Cloudflare.
2. **One flag per span.** No W2 or W4 inside a flagged idiom or figure ("by the mountain" no longer also gets W4;
   "pass that on" no longer also gets W2; R5.14). No W8 on words already flagged C1 or C4. Nouns inside idioms are
   not pronoun candidates on any line ("word" in "word got out").
3. **One question per sentence** for pronouns with the same candidates ("They pay more, so they get ...": one W1;
   R5.15).
4. **The binding rule covers objects only**, as the spec says (direct and indirect objects). spaCy hangs "above it" on
   the verb in "heating the city above it". Extending the rule to such phrases removed the right reading (the bunker),
   so it is kept to objects (R5.6).
5. **W5 skips stative passives.** "Is based", "is located" and "what's left" (the rest, not a deed) no longer ask for
   a doer (R5.13).
6. **Numbers.**
   - Ordinals count only as fractions ("a tenth"), so "first" is no number.
   - "Tens of thousands" is one number.
   - The multiplier's span ends at "times".
   - Month and day names are time nouns ("April" is no pronoun candidate in v2).
7. **The film's list.**
   - Rivals are de-duplicated by their singular. v4's real list names "chips" and "chip", which had printed every W13
     twice (R5.16).
   - A film trade word the defaults already know gets the film's descriptions ("heat pump", "data center").
   - The longer phrase wins ("district heating network" over "district heating").
   - `allow` also covers C3, C4, W6 and W7.
   - A bare list is accepted for `allow`, with the reason "(no reason given)".
   - A rival followed by "called / named / known as" is exempt ("machines called heat pumps"). The spec's own example
     list uses "machines" both as a rival of "computers" and as the gloss of "heat pump" (section 6).
   - Malformed lists exit 2.
   - `--no-film` is added for archived drafts: the auto-lookup now finds the rework's `docs/v4/script/clarity.json`
     for v4's archived draft 1.
8. **CAPS emphasis is read as lower case for the parse.** "WANTS" and "FORTY" were tagged as names. Acronyms stay as
   they are: check_paste.py's list plus tech acronyms. Spans are printed as written.
9. **The gloss after a comma is read from the parse:** a description joined to the term, not a list with "and"
   ("data centers, buildings full of computers" passes; "In most data centers, the fans ..." doesn't). The connecting
   words "which / that is / meaning / basically / or / in other words" are also accepted.
10. **Display.**
    - Candidates are shown as heard ("memory chips | AI data centers"), not as lemmas.
    - The name chain merges repeats ("AI 2, 3") and includes "computers", so the one good name shows too.
    - The word count is `check_rhythm.py`'s (114 words for draft 1; the spec's example said 117, counted in spaCy
      tokens).
11. **The owner's connectors (2026-10-29, after the owner's notes on draft 2 and the El Niño reference; now in the
    spec, section 2).** A sentence's opening connector (the CONNECTORS list: "To put that / it into perspective,",
    "Actually,", "So,", "Now,", "Normally,", "Or in other words,", "The result is that") raises no flag of its own: v4
    draft 3's "To put it into perspective, ..." had got W11, the worked example's "To put that into perspective, ..."
    W2 and W11, and "The result is that ..." W4. "So how does it work?" had got W2 "does it", a misread: "does" is the
    question's auxiliary, not the pro-verb "do it"; its "it" is now checked like any other pointer (nothing in the El
    Niño reference, where it is El Niño; C2 after "But Helsinki wants that heat."). Cases R5.17-R5.20b; each fails on
    the tool before the fix (checked). The corpus fixtures (v1, v2, v3, v4 draft 1, v5 draft 1, the Big Bend) and v4's
    archived drafts 2 give the same output as before.

## 3. The library choice (the playbook's "Find the PRO way and the pro tools")

Each part was searched for a maintained, small, permissively licensed, deterministic library, and one was used only
where it is genuinely better than a few lines of our own. The versions are pinned. The record is also in the
script's header.

| Part | Choice | Weighed, and why not |
|---|---|---|
| Parse (POS, lemma, number, dependencies) | **spaCy 3.8.18 + en_core_web_sm 3.8.0**: MIT, released 2026-10-26, a 15 MB model, deterministic on CPU (measured: identical output on two runs) | **NLTK** 3.10.4 (Apache-2.0): no pretrained English dependency parser (only wrappers for Java parsers), so no passives, subjects or objects. **Stanza** 1.15.0 (Apache-2.0) and **Flair** 0.15.1 (MIT): need PyTorch, hundreds of MB. **UDPipe** (`ufal.udpipe` 1.4.0.1): the software is MPL-2.0, but its models are CC BY-NC-SA, no commercial use (https://ufal.mff.cuni.cz/node/1802). A regex-only linter can't see "it" as an object, so it can't apply the rule behind "But Helsinki WANTS it". |
| Word frequency (W8) | **wordfreq 3.1.1**: code Apache-2.0, data CC BY-SA 4.0. It is frozen at 2021 data by its author, which keeps it deterministic; an everyday-new list covers "chatbot" and similar. Zipf scale over 7 English sources, subtitles among them (SUBTLEX and OpenSubtitles 2018: its README), and names included (Cloudflare 2.44) | **SUBTLEX-US** alone: one of wordfreq's own sources. **Word prevalence norms** (Brysbaert et al. 2019, *Behavior Research Methods* 51: 467-479, 61,858 lemmas, the share of 220,000+ people who know each word; study; a CC BY 4.0 edition on NorARE, https://norare.clld.org/contributions/Brysbaert-2019-Prevalence): it measures "known" directly, the right idea, but it is a static research table of lemmas with no names and no package, and its sample is native speakers. Worth a second look if W8 misfires. |
| Pronouns (C2, W1) | **ours**: the listener's window (the line before, extended over verbless fragments, plus the own line), number agreement, prominence vs recency, the object-binding rule, pronoun chains, about 120 lines over spaCy's parse | **coreferee 1.5.0** (MIT, 2026-09-15, spaCy 3.7-3.8), tested here on its rule layer: it is a resolver that picks one antecedent, and the check needs the rivals a listener weighs. Its English rules (the neural model isn't downloadable through this session's proxy) list candidates over 5 sentences, numbers and pronouns included: 5 to 12 per pronoun on draft 1 ("But Helsinki WANTS it": Helsinki, AI, seventy, that, cabinet, tea, heat, air, sea). They rule out the right reading of "the city above it" (no candidate) and don't count "staff" as plural (Google, years, BBC). Its config also stops at spaCy 3.8.11. **fastcoref** 2.1.6 (2023), **Maverick** 1.0.7 and **AllenNLP**: transformers, archived or heavy. **spacy-experimental** 0.6.4: spaCy < 3.8. **neuralcoref** 4.0: spaCy 2, dead since 2019. |
| Lists: trade words, scope, idioms, scolding (C1, C3, C4, W6, W7) | **ours**, curated for a worldwide ear, as regex at the top of the file like `check_paste.py`'s patterns | **proselint 0.16.0** (BSD-3, 2025-11), run on our five scripts: it flags only "No paragraph should start with a 'But'" (twice in v2), which contradicts our spoken joins. Its cliché lists hold 3 of 26 idioms sampled from ours. **no-cliches 0.3.6** (MIT, 740 written clichés): holds 8 of our 36 idioms, and none of the ten idioms and figures our five scripts used (first dibs, a heads-up, word got out, by the mountain, gets a boost, end up, pass that on, figured out, where ... was heading, the smart move). A cliché is tired writing; our C4 is a phrase whose words don't say its meaning. **write-good 1.0.8**, **retext-simplify/passive** and **Vale** (all MIT): linters for written prose, by regex or POS-sequence rules ("Vale's sequence rule ... each token can match a part-of-speech tag", https://docs.vale.sh/checks/sequence), with no dependency parse and no frequency. |
| Sentence splitting | **`check_rhythm.py`'s `sentences()`, imported**, so the numbers match | **pysbd** 0.3.4 (MIT): unmaintained since 2021, and a different splitter would break the shared numbering |
| Number words (W9) | **ours** over spaCy's `like_num`: one run per number, "N out of M" counts once, "tens of thousands" is one number, and a bare "one" and plain ordinals don't count | **text2num** 3.1.0 (MIT, 2026-08), tested here: it turns "tens of thousands" into "10 of 1000" and "twenty twenty-seven" into "20 27", two numbers each, where the ear hears one. It parses values, which we don't need. **word2number** 1.1: unmaintained since 2017. |
| Readability score | **none** (PRINCIPLES P9: a formula rates "The chips get that hot." the easiest line) | **textstat** 0.7.13 (MIT): rejected by design |

Versions, licences and release dates come from PyPI's and npm's metadata, pulled 2026-10-29. coreferee and proselint
were installed in a scratch venv, not the system Python, and run on our cases.

## 4. The selftest

`python3 scripts/voice/check_clarity.py --selftest`. The result: **OK, all 38 regression cases pass** (33 at the build,
5 added for the owner's connectors the same day). The cases live
in `clarity_tests/cases.json`. Each runs as its own script. The corpus fixtures are frozen copies, with their source
paths and commits recorded in the file.

| Cases | Level | Result |
|---|---|---|
| R1: v4 G1 draft 1, no film list | MUST | exit 1, 9 errors, 9 warnings; the owner's lines exactly as the spec requires (below) |
| R1f: draft 1 with the spec's example film list | SHOULD | 9 errors, 12 warnings: plus W13 on lines 2, 3 and 7 |
| R2.1-R2.7: the clean rewrites in PRINCIPLES.md | MUST | exit 0, no warning, each one |
| R2.8: v1's and v3's plain jokes, in their scripts | MUST | no flag of their own |
| R3: the Big Bend opening | MUST | exit 0; its one warning is W4 "the architect" (allowed) |
| R4: v1, v2, v3, v5 draft 1 | SHOULD | the spec's errors exactly (section 5) |
| R5.1-R5.11: the spec's unit cases (12) | MUST | all hold |
| R5.12-R5.16: the build's own fixes (5) | ADDED | all hold (section 2); R5.12 fails when pronoun chains are switched off (checked) |
| R5.17-R5.20b: the owner's connectors (5; 2026-10-29) | ADDED | all hold (section 2, item 11); each fails on the tool before the fix (checked), and so does R2.1 with its new connector |

**R1 line by line: the owner's lines are flagged for the owner's reasons.**

| Line | The owner | The tool |
|---|---|---|
| 1 "Did you know Helsinki wants AI to heat seventy thousand homes?" | "great thats what i would like to tell my friends." | nothing |
| 2 "The chips get that hot." | "which chips? ... Chips is a word not a lot of people would understand." | C1 "chips" (to most people: food); W4 "The chips" (which chips?); W3 "that hot" |
| 3 "One cabinet of them is like FORTY kettles, boiling non-stop." | "also similarly the next one too." | C1 "cabinet" (a cupboard); W10 "like" (like in what way?) |
| 4 "And nobody's even making tea." | "simpler less scandalous language" | W7 "nobody's even" (a warning, as the spec has it; its two-step irony is the panel's) |
| 5 "So almost everywhere, that heat just gets dumped into the air or the sea." | "'almost everywhere' - this is very ambigous" | C3 "almost everywhere"; W5 "gets dumped" (who dumps it?) |
| 6 "But Helsinki WANTS it." | "what exactly is it - heat or air or sea?" | C2 "it" could be: heat, air, sea. Panel question: "Helsinki wants what?" |

The lines the owner didn't flag match the spec too:
- 7: C1 "water-cooled".
- 8: C1 "heat pumps", W6 "gets a boost", W12 ", then".
- 9: W2 "That's".
- 10: C2 "it" (city, heat).
- 11: C2 "they" (no plural thing) and W2 "this".
- 12: C1 "data center".
- 13: nothing.

## 5. The corpus run

All runs used `--no-film`; v4 draft 1 was also run with v4's own list. The errors equal the spec's R4 exactly on
every script.

| Script | Errors | Warnings, first build -> final | The errors |
|---|---|---|---|
| v1 final script (section 1, the plain text) | 3 | 15 -> 16 | C4 "a heads-up", C4 "word got out", C1 "server" |
| v2 script | 0 | 5 -> 5 | none (accepted by the owner with no word notes) |
| v3 script | 4 | 12 -> 8 | C1 "DATA CENTERS", C1 "memory chips", C4 "by the mountain", C4 "first dibs" |
| v4 G1 draft 1 | 9 | 9 -> 9 (12 with v4's list: W13 x3) | lines 2, 3, 5, 6, 7, 8, 10, 11, 12 (section 4) |
| v5 spine draft 1 | 3 | 17 -> 14 | C1 "data centre", C1 "chips", C1 "cabinet" |

**What the warnings found** (every one read by hand). Most are real questions a regular listener would have:
- **v1:**
  - 2 W1 x2 ("It's in PHP", "run on it")
  - 3 W6 "figured out"
  - 4 W4 "the PHP people" and "the fix", W12 (three clauses)
  - 5 W1 "they" (it means Cloudflare), W5 "was announced", W8 "Cloudflare", W9 (three numbers)
  - 6 W1 "install it", W5 "somebody", W11 (5 words before the subject)
  - 7 W1 "they" (sites or versions?), W5 "'re supported" (the spec names v1's "officially supported" as the panel's
    word; this asks about it)
  - 9 W2 "did it"
- **v2:**
  - 7 W1 "its" (Google's or the AI's military work?), W6 "where its military work was heading", W12
  - 9 W5 "it's used" (by whom? the Pentagon)
  - 10 W12
- **v3:**
  - 4 W2 "Which is backwards."
  - 7 W9 "percent", W11 (6 words)
  - 10 W1 "They" (memory chips or AI data centers?: PRINCIPLES' own example)
  - 11 W2 "Which", W6 "pass that on", W9 "FIVE times"
  - 14 W6 "ends up"
- **v5:**
  - 3 W4 "the rock", W6 "end up", W9 "12 degrees"
  - 4 W1 "it overheats", W5 "someone", W8 "overheats"
  - 5 W1, W12
  - 6 W1, W6 "The smart move"
  - 8 W2 "do it", W5 "is meant", W9 x2 (three numbers, "100 times")

**Noise fixed during the build** (section 2): a false C2 on a chained "they"; W4 on "the mountain" inside "by the
mountain"; W2 on "that" inside "pass that on"; W4 on "The smart move" (also W6); a repeated W1 for a sentence's
second "they"; W5 on "what's left"; every W13 printed twice with v4's real list. The questions' spacing ("whatis")
was also fixed. A crash sweep over every markdown and text file under `video/docs/` (359 files, 34,578 sentences,
mostly prose that isn't a script) ran clean.

**The rework, for a first look** (`video/docs/v4/script/script_elevenlabs.md` as it stood at 13:30 UTC, in
progress, read only):
- 0 errors, 2 warnings: W2 "That's a lot of tea." and W5 "Nothing is built yet." Both are fair to answer in Checks.
- `check_rhythm.py`: OK.
- The name chain shows one name per thing: `AI 1, 2 -> computers 2 -> data centers 2 -> computers 3 -> ...`.

**False positives and misses I can't fix** (each needs meaning, which a parse doesn't have; the panel is the check):
1. **W1 lists rivals a listener rules out by meaning.** The question each W1 asks is still fair, but the candidate
   list overstates the doubt:
   - v1 2 "It's in PHP": Europe, site, password are listed with the bug.
   - v1 6 "install it": Cloudflare is listed with the fix.
   - v5 6 "it's using it": air is listed with the heat.
2. **W1 can be right for the wrong reason.** In v5 4, "someone sent one into space ..., and it overheats", the true
   referent "one" is a number word, so it is no candidate. The flag fires on the other nouns.
3. **Silent wrong readings (misses, not flags).** The tool picks a reading and stays quiet, because prominence and
   recency agree on a noun that is not the meant one:
   - v2 2 "criticizing it" (the tool reads "contract"; it is Google);
   - v3 2 "AI's making it pricier" (the tool reads AI; it is the laptop);
   - v1 5 "once it was announced" (the tool reads Cloudflare; it is the bug).
   The panel's "what does each 'it' point at" question covers these.
4. **By design, a writer may find these pedantic. Answer them in Checks:**
   - W4 on a bridging "the" ("the fix" after "this bug", "the rock" after "a mountain"). Bridging costs the listener
     time (Haviland and Clark 1974, PRINCIPLES P3).
   - W11 on a signpost longer than 4 words (v3's "But this past year, in the U.S.,").
   - W6 on common phrasal verbs ("figured out").
5. **Parse limits.**
   - An unknown acronym that is also a common word in lower case (say "WHO", the health body) is read as emphasis
     and lower-cased. Add it to `ACRONYMS` when a script needs it.
   - spaCy's model may mis-parse a rare construction. The `pointers:` line shows each reading, so a wrong one is
     visible.

## 6. Doc changes needed (for the integrator)

**a. `video/docs/PIPELINE_V2.md`, the Studio toolkit row "G1/G2 voice"** (line 208). Replace the whole row with:

```
| G1/G2 voice | `docs/ELEVENLABS.md`; `video/scripts/voice/` | paste-file rules + `check_paste.py`; `check_rhythm.py` (long sentences broken by short ones); `check_clarity.py` (clear to a regular listener on one hearing: errors for trade words and false friends, pointers with rivals or no target, vague scope, idioms; 13 warnings, each a targeted question for the G1 panel via `--questions`; reads the film's word list `docs/vN/script/clarity.json`; `--selftest` keeps the owner's v4 notes as its regression; spec and build: `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md`, `LINT_REPORT.md`); `check_take.py` (transcribe + diff), `clean_take.py`, `transcribe.py` |
```

**b. `video/docs/PIPELINE_V2.md`, the G1 bullet.** Take `RULES_DRAFT.md` 2a as drafted, with these three exact
phrase changes so it names the tool as built (the rest of 2a stands):
1. `(the thread object's one everyday name and its rivals, the film's trade words with their plain descriptions:
   `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md`)` becomes `(the thread object's one everyday name and its
   rivals, the film's trade words with their plain descriptions, any allowed word with its reason; format:
   `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md` section 3)`.
2. `and runs `check_clarity.py`, `check_rhythm.py` and `check_paste.py` until all three pass,` becomes `and runs
   `check_clarity.py` (it reads `clarity.json` by itself), `check_rhythm.py` and `check_paste.py` until all three
   print OK (`check_clarity.py` OK means no error, never that the script is clear),`.
3. `then (c) `check_clarity.py`'s questions put to the same three viewers,` becomes `then (c) the lint's targeted
   questions (`check_clarity.py --questions`) put to the same three viewers,`.

The closing clause, "the script must pass `scripts/voice/check_rhythm.py` and `scripts/voice/check_clarity.py`
before it goes to the owner", stays as 2a has it. In both docs, "pass" means exit 0.

**c. `video/docs/voice/API_QUICKSTART.md`, the tools line** (line 25, LINT_SPEC section 3 asks for it). Replace:

```
- **Tools:** `pip install sherpa-onnx faster-whisper soundfile requests numpy` if any is missing; ffmpeg.
```

with:

```
- **Tools:** `pip install sherpa-onnx faster-whisper soundfile requests numpy` if any is missing; ffmpeg. For the G1 clarity check (`scripts/voice/check_clarity.py`): `pip install "spacy==3.8.18" "wordfreq==3.1.1" && python3 -m spacy download en_core_web_sm-3.8.0 --direct`.
```

**d. The G1 template and briefs** (`RULES_DRAFT.md` section 5). Wherever they say "re-run
`python3 video/scripts/voice/check_rhythm.py` and `python3 video/scripts/voice/check_paste.py`" (e.g.
`context/workflows/v4-g1-script-lean-wf_c7c0628a-726.js`, line 59), add
`python3 video/scripts/voice/check_clarity.py video/docs/vN/script/script_elevenlabs.md` (exit 0, every warning
answered in "Checks"). The critic's step (c) runs the same command with `--questions`, after the cold pass.

**e. `LINT_SPEC.md` section 3, the example film list.** Drop `"machines"` from `thread.rivals`: the same example uses
"machine(s)" as the plain description of "heat pump". The tool exempts "machines called heat pumps", but a line like
"these machines make the water hotter" would get W13 under that list. v4's real list
(`docs/v4/script/clarity.json`) doesn't have the clash. It names each rival twice ("chips", "chip"), which the tool
now handles. Optionally, fold section 2's departures into the spec's next revision; until then, this report is their
record.

**f. Commit:** the auto-checkpoints (`a39ac42`, `2f8121f`, `4a5b114`) already hold
`video/scripts/voice/check_clarity.py` and all of `video/scripts/voice/clarity_tests/` (the fixtures, `cases.json`,
`v4_clarity_example.json`, `rivals_dupes.json`). Only this report and the tool's last header edits are left for the
orchestrator's next commit. `video/scripts/voice/.gitignore` already ignores `__pycache__/`.

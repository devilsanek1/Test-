# check_clarity.py: the spec (2026-10-29)

**Status: DONE (spec for the build step; updated 2026-10-29 for the owner's connectors, `INTEGRATION_2.md`).** What
`video/scripts/voice/check_clarity.py` checks, how, its inputs and outputs, and the regression set it must pass. The
principles it serves: `PRINCIPLES.md` (P1-P9; P11's connectors it leaves unflagged, P10 and P11 are the writer's and
the panel's); the rule that gates it: `RULES_DRAFT.md` (playbook 1a, PIPELINE_V2 G1 2a).

**What it is for.** It finds, by script, the clarity failures a script can find reliably, and turns each one into a
question for the writer and, after the cold pass, for the critic's viewer panel. **It never passes a line:** "OK"
means it found none of its patterns, never that the script is clear (a readability formula rated "The chips get that
hot." the easiest line in draft 1; PRINCIPLES P9). Everything that needs meaning, taste or the picture is the panel's.

**Validated before it is built.** A scratch prototype of every check below, C1-C4 and W1-W13 (Python 3.13, spaCy
3.8.18 with en_core_web_sm 3.8.0, wordfreq 3.1.1), produced every regression result in section 4, on v4 draft 1 (with
and without v4's word list), the clean rewrites in PRINCIPLES.md, the Big Bend opening and v1, v2, v3 and v5. The
numbers quoted here are its measurements; the info lines, `--questions`, `--json` and `--selftest` are specified, not
prototyped. The builder re-implements it in the repo's style; the expectations in section 4 are the contract.

---

## 1. What it checks, and what it leaves to the panel

**Errors** (exit 1: the script does not go to the critic or the owner until each is fixed, or allowed in the film's
word list with a reason). Each is a pattern the owner flagged as losing people and that a script finds with high
precision: on our corpus it raises no error on the Big Bend reel and none on v2's script (accepted by the owner with
no word notes), and every error on v4 draft 1 sits on a line the owner or both research lanes flagged.

| Code | What | Principle | Draft 1 example |
|---|---|---|---|
| C1 | A trade word, or a common word in its trade sense (a false friend), at its first use, not described plainly | P2 | "The chips get that hot." (chips: to most people, food) |
| C2 | A pointer with rivals or with no target, in the cases a script gets right: a short line (5 words or fewer) or rivals side by side ("the air or the sea"); a "they" with no plural thing before it | P3 | "But Helsinki WANTS it." (it: heat, air, sea) |
| C3 | A vague scope ("almost everywhere", "most places", "in many countries") | P4 | "So almost everywhere, that heat ..." |
| C4 | An idiom a worldwide ear must decode ("first dibs", "a heads-up", "by the mountain") | P6 | (v3) "They pay more, so they get first dibs." |

**Warnings** (exit 0, printed; the writer fixes each or answers it in the script doc's "Checks" section, and each
becomes a targeted question for the panel after its cold pass):

| Code | What | Principle |
|---|---|---|
| W1 | A pointer with rivals in a longer sentence (the reading a script can't settle) | P3 |
| W2 | A pointer at a whole idea: a sentence opening "That's" / "This is" / "Which", a bare "this" or "that" as an object, "do it" / "did that" (the pro-verb, never a question's auxiliary: "So how does it work?") | P3 |
| W3 | A degree with nothing to point at: "that hot", "that much", "this big" | P3 |
| W4 | A first mention that says we already know it: "the / those / these / that / this" + a noun not heard before | P3 |
| W5 | No doer: a passive with no "by" or "with" ("gets dumped", "is meant to"), or a vague doer ("someone", "somebody") | P4 |
| W6 | A figurative phrasal verb or soft figure ("gets a boost", "end up", "turns out", "pass that on") | P6 |
| W7 | A scolding or outrage frame ("nobody's even", "can't even", "of course") | P7 |
| W8 | A rare word or an unknown name: Zipf below 3.0 on its base form (wordfreq 3.1.1) | P2, P6 |
| W9 | Numbers: more than one in a sentence, a multiplier ("five times", "100 times bigger"), a percentage, a unit nobody pictures | P8 |
| W10 | A "like" comparison that doesn't say what is alike ("is like FORTY kettles") | P8 |
| W11 | More than 4 words before the subject (a leading join or one of the owner's connectors doesn't count) | P5 |
| W12 | More than one step: 3 or more finite clauses, or a ", then" chain | P5 |
| W13 | A rival name for the film's thread object (needs the film's word list) | P2 |

**Info** (printed, never counted): the pronoun table (each pointer, its candidates, the reading the script would pick
and why); the name chain (every trade word, false friend, thread name and rival, in order, so a name swap shows at a
glance: draft 1 "AI 1 -> chips 2 -> cabinet 3 -> chips 7 -> data center 12 -> chatbot 13"); numbers per 10 s at
2.87 words a second; the share of words below the rare-word threshold.

**Left to the panel and the writer (a script can't catch these reliably):** whether a joke needs two steps or reads as
irony (draft 1's tea line gets W7 for its tone; its two-step irony is the panel's); a hint where the plain thought
belongs ("Luckily, those chips are water-cooled.": why lucky?) and a "so" that doesn't follow; a common word used in a
trade sense when no list holds it (v1's "officially supported"; v2's "any lawful government purpose"); whether a
name is world-famous; whether a line works without its picture; the story itself. The lint's job is to make the
panel's questions sharp, never to replace them.

---

## 2. Each check in detail

**Text and sentences.** The same splitter as `check_rhythm.py` (import or copy its `sentences()`): [tags], headings,
tables, quotes and rules are dropped; "…" and "..." end a sentence; so sentence numbers match across both tools. Each
sentence is parsed with spaCy `en_core_web_sm` (POS, lemma, morphology, dependencies). Matching ignores case and
treats ’ as '.

**C1, trade words.** Fires once per term per script, at its first use.
- *False friends* (spaCy lemma, noun use; the message names what most people hear): chip (food: crisps, fries),
  cabinet (a cupboard; a government's ministers), rack (a shelf, a coat rack), server (a waiter), model (a fashion
  model, a toy), node (a lump), cluster (a bunch of grapes), grid (a pattern of squares), token (a coin for a machine),
  agent (a spy, an estate agent), compute as a noun. A definition doesn't fix a false friend (the everyday meaning
  comes first: Leinenger and Rayner 2013, study, https://pubmed.ncbi.nlm.nih.gov/24073328/; PRINCIPLES P2), so it passes only inside an everyday compound (computer chip(s), potato chips,
  kitchen cabinet, fashion model, role model, travel agent, real estate agent) or when the film's list allows it with
  a reason.
- *Tech words* (phrases, matched as whole words; hyphenated forms included): data center(s), data centre(s),
  datacenter(s), heat pump(s), district heating, heat recovery, water-cooled, liquid-cooled, air-cooled, liquid
  cooling, memory chip(s), server farm(s), the cloud, AI model(s), language model(s), training data, neural
  network(s), machine learning, heat exchanger(s), GPU(s), CPU(s), processor(s), semiconductor(s), coolant, inference,
  kilowatt(s), megawatt(s), gigawatt(s), kWh, MWh, GWh, kW, MW, GW, API(s), LLM(s), bandwidth, latency,
  hyperscaler(s), chiller(s), firmware. A tech word passes when it is described plainly where it first appears:
  "called", "named" or "known as" right before it ("machines called heat pumps", "buildings called data centers"); a
  comma or colon right after it followed by a description ("data centers, buildings full of computers"); or one of
  its plain descriptions from the film's list in the same or the previous sentence. Later uses pass.
- *The film's own trade words* come from its list (section 3), with their plain descriptions.
- A false friend inside a matched tech phrase ("memory chips") is reported once, as the phrase, and counts as used.
- Never flagged: "AI" and the everyday-new words below.

**C2 and W1, pointers.** For each "it", "its", "itself", "they", "them", "their", "theirs", "themselves" (spaCy
PRON; expletive "it", the "it" of the pro-verb "do it" (W2's) and the "it" inside an opening connector ("To put it
into perspective,") skipped; the "it" after a question's auxiliary, "So how does it work?", is checked like any other):
- *Candidates:* the nouns (NOUN, PROPN) in the previous sentence (extended back over verbless fragments such as v3's
  "by the mountain.") and in the pronoun's own sentence before it, whose number agrees (spaCy morphology or tag;
  collective nouns count as plural: staff, team, crew, police, family, audience, public, couple; two nouns joined by
  "and" count as one plural candidate). Left out: compound modifiers ("data" in "data center"); time and measure
  nouns (minute, hour, day, week, month, year, decade, century, time, second, percent, degree, foot, meter, mile,
  kilometer, ton, tenth, half, third, quarter); filler nouns (purpose, bunch, fact, life, kind, sort, lot, way, end,
  course, while, now); numbers; the subject of the pronoun's own clause when the pronoun is its direct object ("But
  Helsinki WANTS it": "it" can't be Helsinki); and proper names when the clause is a naming one ("It's called the Big
  Bend": a named thing isn't renamed).
- *Reading:* one candidate (by lemma) -> fine. Otherwise: the **prominent** candidates are subjects and nouns marked
  with "this / that / these / those"; the **recent** one is the last candidate before the pronoun. Fine when there is
  exactly one prominent candidate and it is also the recent one (the Big Bend's skyscraper), or when the pronoun's own
  sentence has exactly one agreeing subject before it and no rivals side by side ("That bunker under the park has
  been heating the city above it").
- *Severity:* **C2** when the sentence is 5 words or fewer (the rhythm rule's short line, which has no context of its
  own) or the candidates include nouns side by side ("the air or the sea"); **W1** otherwise. **C2** also for a
  plural pronoun with no plural candidate ("But they've done this before." after "For now, it's a plan.": a city or a
  company is "it", or its name), except the generic "they say" / "they call". The message lists the candidates:
  `"it" could be: heat, air, sea. Say the noun again`.
- *Why this rule:* listeners weigh the prominent thing (the subject) against the most recent ones, and "it" carries no
  cue to settle it (Arnold et al. 2000, study: https://pubmed.ncbi.nlm.nih.gov/10822045/; Gordon, Grosz and Gilliom
  1993, study: https://doi.org/10.1207/s15516709cog1703_1; research_ear, finding 4); the owner heard "heat or air or sea?", so prominence alone can't clear a
  short line. In longer sentences a script often can't tell, so it only asks (W1).

**C3, vague scope.** The phrases: almost everywhere, nearly everywhere, pretty much everywhere, everywhere,
everywhere else, most places, many places, some places, other places, elsewhere, in many / most / other / some
countries. A typical case named by a concrete noun ("in most data centers", "most homes") is not on the list and
passes. The film's list may allow a phrase with a reason.

**C4, opaque idioms; W6, soft figures.** C4 is a list of idioms whose words don't say their meaning: first dibs, dibs,
by the mountain, by the ton, a heads-up, heads-up, word got out, word gets out, the elephant in the room, the tip of
the iceberg, a drop in the bucket, low-hanging fruit, game changer, in a nutshell, out of the blue, through the roof,
an arm and a leg, break the bank, under the radar, ballpark, catch-22, no-brainer, bite the bullet, piece of cake,
back to square one, at the end of the day, the bottom line, red tape, pull the plug, the last straw, on the same page,
up in the air, in hot water, hot potato, spill the beans, out of the bag, once in a blue moon, jump the gun. W6 is a
list of figurative phrasal verbs and soft figures, which are often fine, so they only ask: get(s) a boost, give(s) a
boost, end(s/ed) up, turn(s/ed) out, figure(s/d) out, pass(es/ed) that / it / this on, kick(s/ed) in, blow(s) up,
step(s) up, take(s) off, where ... is / was heading, the smart move. Both lists grow when the panel finds a new one
(the builder keeps them in one place at the top of the file, like `check_paste.py`'s patterns).

**W2, whole-idea pointers.** A sentence opening (after "And / But / So") on "That's", "That is", "This is", "That
was", "This was", unless an explanation follows at once ("That's because / why / how / what / where / when");
a sentence opening on "Which"; "this" or "that" as a bare object pronoun ("done this before"), except inside an
opening connector ("To put that into perspective,"); "do it", "does it", "did it", "doing it", "do that", "did that"
as a pro-verb ("Helsinki did it"), never a question's auxiliary before its subject ("So how does it work?").

**The owner's connectors (2026-10-29, `INTEGRATION_2.md`).** A sentence's opening connector from the list at the top
of the tool (CONNECTORS: "To put that / it / this into perspective,", "Actually,", "So,", "Now,", "Normally,", "Or in
other words,", "The result is that", after an optional "And / But / So / Or / Now") raises no flag of its own (the
playbook, Script and voice: "Human connectors, placed TACTICALLY"): its words don't count for W11, its "that" or "it"
is no W1 or W2, "The result" is no W4, no W8 inside it, and its nouns ("perspective", "words", "result") are no
pronoun candidates later. RULE #1's stock reveals are not on the list (the critic's to catch).

**W3, a degree with nothing to point at.** "that" or "this" as a degree word (spaCy advmod) before an adjective or
adverb: "that hot", "that much", "this big".

**W4, a first mention with "the".** A noun with the determiner the / those / these / that / this whose lemma was not
heard earlier in the script (any part of speech: "heat" the verb introduces "that heat"), or earlier in the same
sentence. Not flagged: world-unique and situational nouns (world, sun, moon, sky, air, sea, ocean, weather, internet,
news, planet, earth, future, past, rest, end, same, way, first, last, top, bottom, middle, the seasons, snow, night,
morning, day, year, time, moment, truth, answer, point, street(s), city, the U.S., the UK, the EU) and the film's own;
time and measure nouns; a noun defined on the spot by "of ..." or a relative clause ("the heat of one computer", "the
water that ..."); a superlative or "same / other / next / last / first" before it; "this / these" in the first
sentence (frame 0 shows it) or before a noun with two or more modifiers (it describes what it points at: "this giant
2,000-foot tall bending skyscraper"); and "this / that / these / those" before a general noun that recaps (project,
plan, idea, thing, place, building, deal, story, problem, move, proposal, case, kind, number, fact, change, trick,
question, news, way, stuff, one, machine: "This crazy project").

**W5, no doer.** A passive (spaCy auxpass) with no "by" agent and no "with" or "by" phrase on its verb ("gets dumped",
"is meant to", "was announced"), except naming passives (called, named, known as); and the vague doers "someone" and
"somebody" as a subject.

**W7, scolding or outrage.** nobody's even, no one's even, not even, can't / couldn't / doesn't / didn't / won't /
isn't / aren't even, of course, how dare, shameful, outrageous, scandal, scandalous, ridiculous.

**W8, rare words and unknown names.** For each content word (NOUN, VERB, ADJ, ADV, PROPN; numbers skipped): its
**best Zipf frequency** in wordfreq 3.1.1, English, taken over the word, its spaCy lemma and simple de-inflections
(possessive 's; plural -s, -es, -ies; -ed, -ing; comparative -er, -ier, -est), and for a hyphenated word the rarest
part. Below **3.0** -> W8 ("a rare word" or, for a proper noun, "a name most people may not know").
- *Why 3.0:* in wordfreq's English list, Zipf 4.5 is about the 3,000th word form, 3.5 the 15,000th and 3.0 the
  30,000th (our measurement). At 3.0, everyday words pass on their base form (kettle 3.54, radiator 3.34, pricey
  3.34, skyscraper 3.20, Helsinki 3.36), and the rare ones stop (overheat 2.70, dibs 2.83, Cloudflare 2.44,
  megawatt 2.68). Scoring the base form matters: "kettles" alone is 2.56 and "radiators" 2.84.
- *Why not more:* frequency can't see false friends ("chips" 4.21 and "cabinet" 4.49, as common as "computers" 4.33),
  which is why C1 is a list, and a frequency-based jargon finder has the same blind spot by its authors' own account
  (Rakedzon et al. 2017, study: https://pmc.ncbi.nlm.nih.gov/articles/PMC5549884).
- *Everyday-new words:* wordfreq's data "is a snapshot of language ... up through 2021" and will not be updated (its
  author, 2024: https://github.com/rspeer/wordfreq/blob/master/SUNSET.md), so words that became everyday since score
  low ("chatbot" 2.30). Never flagged: AI, chatbot(s), ChatGPT, app(s), emoji, selfie, smartphone, Wi-Fi, online,
  livestream, TikTok, YouTube, Instagram, Netflix, Google, iPhone; the film's list adds its own.
- *Info line:* the share of the script's words below 3.0 (a lay audience needs about 98 % familiar words: about two
  unfamiliar words in a 115-word script; Rakedzon et al. 2017, above). Draft 1: one word before the allow list (chatbot 2.30); on
  word forms alone it would also stop kettles (2.56) and radiators (2.84).

**W9, numbers.** A number is a run of digits or number words (seventy thousand, twenty twenty-seven, forty-five: one
each; a bare "one" is not counted; "N out of M" and "N in M" count once). Fires on more than one number in a sentence;
"N times" before bigger / more / higher / larger / smaller / as / the / last; "percent", "per cent" or "%" ("one in
ten" is easier by ear); a unit nobody pictures (degrees without an everyday anchor; the power units are C1).

**W10, comparisons.** "is / are / was / were / 's / 're like" in a sentence with no shared quantity named ("as much",
"as many", "as ... as", "the size of", "the weight of", "the price of", "worth of").

**W11, front-loading.** Words before the first subject (nsubj, nsubjpass or expletive "there"), counting a number as
one word and not counting a leading "And / But / So / Then / Plus" or an opening connector (above); skipped after "Did
you know (that)"; fires above 4.
A 4-word signpost that names the place or time ("In most data centers,", "In twenty ten,") is the structure's own
advice (PRINCIPLES, "How each sentence hands the next its subject") and passes.

**W12, more than one step.** Three or more finite verbs (tags VBD, VBP, VBZ, MD; not auxiliaries; not inside a
relative clause, which describes rather than steps), after any "Did you know (that)" frame; or ", then".

**W13, rival names.** With the film's list: every use of one of the thread object's rivals ("you called the computers
'chips' here"), whether or not the one name has been said yet: the name is the film's decision. Without a list, the
name chain (info) shows the swaps.

**The panel's questions** (`--questions`): one per flag, in the viewer's words, for the critic to ask only AFTER the
cold pass: C1 "What are the chips?"; C2 and W1 "What did Helsinki want?" (the sentence with the pronoun replaced by
"what"); C3 "Where is 'almost everywhere'?"; C4 and W6 "What does 'first dibs' mean here?"; W2 "What is 'that'?"; W3
"How hot is 'that hot'?"; W4 "Which chips?"; W5 "Who dumps it?"; W7 "How does this line sound to you: kind, funny or
angry?"; W8 "Do you know the word 'overheats'?"; W9 "What was the number, and what did it mean?"; W10 "Like in what
way?"; W11 and W12 "Say this line back in your own words."

---

## 3. Inputs and outputs

**Usage** (the house style of `check_rhythm.py` and `check_paste.py`):

```
python3 scripts/voice/check_clarity.py SCRIPT.md                     # every sentence with its flags, then the summary
python3 scripts/voice/check_clarity.py SCRIPT.md --film CLARITY.json # with the film's word list
python3 scripts/voice/check_clarity.py SCRIPT.md --questions         # also the panel's targeted questions
python3 scripts/voice/check_clarity.py SCRIPT.md --quiet             # only the flagged sentences and the summary
python3 scripts/voice/check_clarity.py SCRIPT.md --json              # machine-readable, for workflows
python3 scripts/voice/check_clarity.py --selftest                    # the regression set (section 4)
```

**Input:** a plain text or markdown file of spoken lines; an ElevenLabs paste works ([tags] and blank lines are
ignored). Without `--film`, the tool looks for `docs/vN/script/clarity.json` beside the script (the `vN` of the
script's path) and says whether it found one.

**The film's word list** (`docs/vN/script/clarity.json`; the writer fills it in G1's clarity pass):

```json
{
  "thread": {"name": "computers", "rivals": ["chips", "cabinet", "rack", "servers", "machines"]},
  "trade":  {"heat pump": ["machine", "machines"], "district heating": ["pipes under the streets"]},
  "allow":  {"radiator": "everyday in Helsinki and in the picture"},
  "unique": ["harbour", "cathedral"]
}
```

`thread`: the thread object's one everyday name and the names it must never be swapped for (W13; the card's thread
object, `docs/look/CRAFT.md` §a). `trade`: the film's trade words, each with the plain descriptions that count as its
gloss (C1). `allow`: words the default lists or the rare-word check would flag, each with the reason it is fine for
this film (the reason is printed, so a reviewer sees it). `unique`: nouns this film may use with "the" from the start
(W4).

**Output:** every sentence, numbered as `check_rhythm.py` numbers it, with its flags under it, then the info lines and
the verdict. Draft 1, with the prototype's flags (messages shortened; the info lines are this spec's format):

```
 5  So almost everywhere, that heat just gets dumped into the air or the sea.
      C3  "almost everywhere": vague scope (where is that?). Say the typical case: who does what, where
      W5  "gets dumped": who does it? Name the actor
 6  But Helsinki WANTS it.
      C2  "it" could be: heat, air, sea. Say the noun again
...
names: AI 1 -> chips 2 -> cabinet 3 -> chips 7 -> data center 12 -> chatbot 13
pointers: 3 them -> chips; 6 it -> heat | air | sea; 8 their -> chips; 10 it -> city | heat; 11 they -> (no plural thing)
13 sentences, 9 errors, 9 warnings; 0 of 117 words below Zipf 3.0 (chatbot allowed)
FAIL: 9 errors (C1 x5, C2 x3, C3 x1): fix each, or allow it in the film's list with a reason
```

**Exit codes:** 0 = OK (no errors; warnings printed, each fixed or answered in the script doc); 1 = FAIL (any error);
2 = a usage error or a missing dependency (it prints the install line and never passes silently).

**Dependencies:** `pip install "spacy>=3.8,<3.9" wordfreq==3.1.1 && python3 -m spacy download en_core_web_sm` (the
model's version must match spaCy's minor version: en_core_web_sm 3.8.0 for spaCy 3.8; both installed through the
session proxy in this environment). The prototype loaded in ~1.5 s and checked draft 1 (13 sentences) in 0.4 s.
Add the line to `docs/voice/API_QUICKSTART.md`'s tools line.

**Docstring:** like `check_paste.py`, the rule it serves (the playbook's CLEAR bullet), the usage, the codes, and the
regression it must keep passing.

---

## 4. The regression set (`--selftest`; the fixtures in `video/scripts/voice/clarity_tests/`)

Each case runs as its own script (no context carries over between cases).

**R1, MUST: v4 G1 draft 1** (`video/docs/v4/archive/g1_draft1/script_elevenlabs.md`, no film list): exit 1, and on
the owner's lines exactly these, for the owner's reasons:

| Line | The owner | Must flag |
|---|---|---|
| 1 "Did you know Helsinki wants AI to heat seventy thousand homes?" | "great thats what i would like to tell my friends." | **nothing at all** |
| 2 "The chips get that hot." | "which chips? ... Chips is a word not a lot of people would understand." | C1 "chips" (food); W4 "The chips" (which chips?); W3 "that hot" may also fire |
| 3 "One cabinet of them is like FORTY kettles, boiling non-stop." | "also similarly the next one too." | C1 "cabinet" (a cupboard); W10 "like" may also fire |
| 4 "And nobody's even making tea." | "simpler less scandalous language" | W7 "nobody's even" |
| 5 "So almost everywhere, that heat just gets dumped into the air or the sea." | "'almost everywhere' - this is very ambigous" | C3 "almost everywhere"; W5 "gets dumped" may also fire |
| 6 "But Helsinki WANTS it." | "what exactly is it - heat or air or sea?" | C2 "it" with candidates heat, air and sea |

SHOULD (the same failures in lines the owner didn't flag; the prototype's results): 7 C1 "water-cooled"; 8 C1 "heat
pumps", W6 "gets a boost", W12; 9 W2 "That's"; 10 C2 "it" (city, heat); 11 C2 "they" (no plural thing), W2 "this";
12 C1 "data center"; 13 nothing. In all: 9 errors, 9 warnings. With v4's word list (the example in section 3), also
W13 on lines 2, 3 and 7 ("chips", "cabinet", "chips").

**R2, MUST: the clean rewrites in PRINCIPLES.md**, each with its context: exit 0 and **no warning**.

1. "Did you know Helsinki wants AI to heat seventy thousand homes? AI runs on giant computers, in buildings called
   data centers. Those computers get really hot. To put that into perspective, just one stack of them gives off as
   much heat as forty kettles, boiling non-stop. In most data centers, big fans just blow that heat outside. But
   Helsinki wants that heat." (the structure's worked example; also P3, P4; since 2026-10-29 with the owner's
   connector before the kettles, as PRINCIPLES has it)
2. "AI runs on giant computers. Those computers get really hot. Just one stack of these computers gives off as much
   heat as forty kettles, boiling non-stop." (P2, P3, P8)
3. "These computers are cooled with water, so the water gets warm. Machines called heat pumps make it even hotter.
   Then that hot water runs through pipes under the streets, into people's homes." (P5)
4. "Your laptop needs memory, and so do the giant computers that run AI. AI companies pay more, so they get the
   memory first." (P6)
5. "AI runs on giant computers. Those computers get really hot. Just one stack of them gives off as much heat as
   forty kettles, boiling non-stop. And usually, nobody uses that heat." (P7)
6. "Helsinki has a plan to heat seventy thousand homes this way. That plan starts in twenty twenty-seven." (P8)
7. "AI runs on giant computers, in buildings called data centers. Helsinki wants to build a new data center. The new
   data center would make nearly a tenth of Helsinki's heat. But the new data center doesn't exist yet." (the
   structure's beats 6-7)
8. The corpus jokes PRINCIPLES P7 holds up, in their scripts: v1's "Even the FBI said ..." and v3's "Laptops get
   better for the same money… usually right after you buy one." raise no flag of their own.

**R3, MUST: the Big Bend opening** (the owner's model reel: "Did you know that New York once got a proposal to build
this giant 2,000-foot tall bending skyscraper? It's called the Big Bend. This crazy project was proposed in 2017 for
New York City by the architect."): exit 0, no error. Allowed: one W4 on "the architect" (the recording cuts the line
before the architect's name).

**R4, SHOULD: the rest of the corpus** (no film list), errors as the prototype found them:
- v1 (`video/docs/script/final_script.md`, the plain script of its section 1, copied as a fixture): C4 "a heads-up",
  C4 "word got out", C1 "server";
- v2 (`video/docs/v2/script/script_elevenlabs.md`): none;
- v3 (`video/docs/v3/script/script_elevenlabs.md`): C1 "data centers", C1 "memory chips", C4 "by the mountain", C4
  "first dibs";
- v5 draft 1 (`video/docs/v5/script/spine_draft_as_sent.md`): C1 "data centre", C1 "chips", C1 "cabinet".
v2's legal phrases and v1's "supported" pass: they are the panel's (section 1).

**R5, MUST: unit cases** (one pair of sentences each; the lesson each guards):
- "So almost everywhere, that heat just gets dumped into the air or the sea. But Helsinki WANTS it." -> includes C2
  (rivals side by side, a short line) and C3.
- "So almost everywhere, that heat just gets dumped into the air or the sea. But Helsinki wants that heat." -> no C2
  (C3 and the warnings on the first sentence stay).
- "Did you know that New York once got a proposal to build this giant 2,000-foot tall bending skyscraper? It's called
  the Big Bend." -> no C2 (a naming clause; prominent and recent agree).
- "She worked at Google for years. But Google staff told the BBC they're scared to speak out." -> no C2 ("staff" is
  plural).
- "For now, it's a plan. But they've done this before." -> C2 (a "they" with no plural thing).
- "That bunker under the park has been heating the city above it since 2014." -> no flag on "it" (one subject in its
  own sentence).
- "These computers are cooled with water." -> no W5 (the passive names its "with").
- "So from twenty twenty-seven, your chatbot could heat an apartment in Helsinki." -> nothing (the year is one
  number; a 3-word signpost; "chatbot" allowed).
- "Machines called heat pumps make it even hotter." -> no C1 (described by "called").
- "Then someone sent one into space this month. They say it runs for 15 minutes. The rock stays at 12 degrees." ->
  W5 "someone" (a vague doer), no C2 on the generic "They say", W9 (a unit nobody pictures).
- "AI runs on giant computers. One cabinet of them is like FORTY kettles." -> C1 "cabinet" and W10; "AI runs on giant
  computers. One cabinet of them gives off as much heat as forty kettles." -> C1 only.

Added 2026-10-29 for the owner's connectors (`INTEGRATION_2.md`; the tool before the fix fails each one):
- R5.17 "Those computers get really hot. To put it into perspective, just one of these computers makes as much heat
  as FORTY kettles, boiling non-stop." (v4 G1 draft 3) -> nothing on the second sentence (it got W11, "5 words before
  the subject").
- R5.18 the El Niño reference as heard ("... and people aren't really ready for it. So how does it work? El Niño is
  ... Or in other words, El Niño is when ... Normally, trade winds blow west, ...") -> nothing on "So how does it
  work?" (it got W2 "does it"; its "it" is El Niño, prominent and recent), only W8 "Niño" on "Or in other words, ...",
  nothing on "Normally, ...".
- R5.19 "Giant computers make a lot of heat. The result is that big fans blow that heat outside. Actually, Helsinki
  wants that heat. So Helsinki has a plan. Now, the plan starts in twenty twenty-seven." -> no flag at all (it got W4
  "The result").
- R5.20a "But Helsinki wants that heat. So how does it work?" -> C2 "it" (Helsinki or the heat: a short line keeps its
  noun), no W2.
- R5.20b "Helsinki heats homes with computers. But how does it do that?" -> W2 "do that" (the pro-verb), no W2 "does
  it", no pointer flag.

When the panel or the owner finds a line the lint missed or flagged wrongly, the line joins R5 with what it should do,
in the same commit as the fix (the playbook: every lesson goes into the generic process).

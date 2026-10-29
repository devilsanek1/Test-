# Script clarity: the principles (2026-10-29)

**Status: DONE.** Distilled from the owner's notes on video 4's G1 draft 1 (`video/docs/v4/OWNER_NOTES.md`, last
entry), grounded in the two research lanes (`research_ear.md`, `research_explainers.md`: every source below is opened
and listed there) and checked against our own scripts, v1 to v5, read as one corpus (the table at the end). The rule
text for each doc is in `RULES_DRAFT.md`; the check is specified in `LINT_SPEC.md`.

**Who we write for:** the biggest audience on TikTok, Reels and Shorts, worldwide. Regular people, not tech people;
many learned English at school. They hear each line ONCE, at feed speed, reading the captions as it plays, and they
can't rewind. One confusing sentence is a swipe.

**Every "good" line below is an illustration, not the rework.** Each one stays inside video 4's fact lock
(`video/docs/v5/research/factlock.md`) and passes the clarity check's prototype with no flag. The rework writes the
real lines.

Strength of a source: **study** (an experiment, or a review of them), **style guide** (a newsroom's, a government's or
a standards body's rules), **practitioner** (a working writer's advice), **ours** (measured here).

---

## The 9 principles

### 1. Tell it like news you'd pass to a friend
- **The principle:** every sentence passes the owner's own question: "is that sentence good and will be received well
  by regular people?" Would you say it to a friend who doesn't do tech, would they get it the first time, and could
  they pass it on?
- **The owner's example:** "Did you know Helsinki wants AI to heat seventy thousand homes?" -> "great thats what i
  would like to tell my friends." The very next line, "The chips get that hot." -> "we would lose people on this
  sentence." Same script, same writer: one line is news for a friend, the next is a note to ourselves.
- **The research:** an easy sentence is believed more and liked more (Reber and Schwarz 1999, study:
  https://pubmed.ncbi.nlm.nih.gov/10487787/); hard words made 650 people push back against the message itself
  (Bullock et al. 2019, study: https://doi.org/10.1177/0963662519865687).
- **The test:** say the line to an imagined friend who doesn't do tech. If they would ask "what?", rewrite it.

### 2. Call every thing by its everyday name, and keep that one name
- **The principle:** name each thing the way regular people do and use that same name all film. No trade words, and
  no common word in its trade sense: to most people "chips" are food, a "cabinet" is a cupboard, a "server" is a
  waiter.
- **The owner's example:** "Chips is a word not a lot of people would understand"; then, on "One cabinet of them is
  like FORTY kettles, boiling non-stop.": "also similarly the next one too." -> "Just one stack of these computers
  gives off as much heat as forty kettles, boiling non-stop." Draft 1 called its one thing by five names in 40 s (AI,
  the chips, one cabinet of them, a data center, your chatbot). Better: "the computers that run AI",
  then "these computers", every time. A term the story needs is described once, plainly, where it first appears
  ("buildings called data centers").
- **The research:** a word's everyday meaning comes first, even when the sentence points elsewhere (Leinenger and
  Rayner 2013, study: https://pubmed.ncbi.nlm.nih.gov/24073328/), and a definition doesn't undo a trade word's cost
  (Bullock et al. 2019, study); a lay listener needs about 98 % familiar words, so about two unfamiliar words in a
  115-word script (Rakedzon et al. 2017, study: https://pmc.ncbi.nlm.nih.gov/articles/PMC5549884); "Use one word for
  a concept" (Microsoft Style Guide, style guide:
  https://learn.microsoft.com/en-us/style-guide/global-communications/writing-tips).
- **The test:** for every noun, "what would a 14-year-old who learned English at school call this?" If not this word,
  use theirs. The check lists every trade word; the panel is asked "what are the chips?".

### 3. Introduce a thing before you point at it; every "it" has one obvious target
- **The principle:** "the X", "those X" and "that hot" only for what this script has already said; every "it",
  "they", "this" or "that" points at ONE obvious thing in the line before, or say the noun again.
- **The owner's example:** "... that heat just gets dumped into the air or the sea. But Helsinki WANTS it." -> "When
  you say IT - what exactly is it - heat or air or sea?" -> "But Helsinki wants that heat." And "The chips get that
  hot." -> "which chips?": no chips had been mentioned, and "that hot" points at a heat nobody had said -> "AI runs on
  giant computers. Those computers get really hot."
- **The research:** "the X" sends the listener looking for an X they already know; when there is none, they must
  build a bridge, and that costs time (Haviland and Clark 1974, study:
  https://doi.org/10.1016/S0022-5371(74)80003-4); listeners pick a pronoun's target within about 200 ms from cues like
  gender, and "it" has none (Arnold et al. 2000, study: https://pubmed.ncbi.nlm.nih.gov/10822045/); "if a pronoun is
  ambiguous, then replace it with the appropriate noun" (Google's style guide, style guide:
  https://developers.google.com/style/translation).
- **The test:** for each pointer, name its target and count the things in the line before it could mean; more than
  one, or none: say the noun. A short line keeps its noun: five of draft 1's six short lines had shed theirs for the
  rhythm. The panel is asked "what did Helsinki want?".

### 4. Say the plain thought itself, as the typical case: who does what, where
- **The principle:** say the thought you have in mind, in plain physical words, as what typically happens: who does
  what, where. Never a hint at it, never a vague scope.
- **The owner's example:** "So almost everywhere, that heat just gets dumped into the air or the sea." -> "I think you
  are having some deeper thought here and you choose to be obscure about it. So i think you want to say that in a
  typical datacenter here is what happens. When you say "almost everywhere" - this is very ambigous" -> "In most data
  centers, big fans just blow that heat outside." (We knew the deeper thought: Helsinki's energy boss says that in
  almost all other countries the heat is cooled into the sea or the air and wasted. The listener got only "almost
  everywhere".)
- **The research:** the curse of knowledge: people tapping out a song expected listeners to name half of them;
  listeners named 2.5 % (Newton 1990, study, reported at https://www.bps.org.uk/psychologist/cursed-knowledge);
  concreteness was "overwhelmingly the best predictor" of how well a text was understood and remembered (Sadoski,
  Goetz and Rodriguez 2000, study: https://doi.org/10.1037/0022-0663.92.1.85).
- **The test:** under the line, write "What I mean is: ___" in the plainest words; if that is clearer, it becomes the
  line. Ask "what would the camera show here?" The check flags scope words ("almost everywhere", "most places") and
  verbs with no doer ("gets dumped": by whom?).

### 5. One new idea per sentence, hooked onto what the last one ended on
- **The principle:** each sentence starts from something the listener already has and ends on its one new part; the
  next sentence picks that part up. The joins are said and true ("but", "so", "because"), and no step is skipped.
- **Draft 1, the same failure in lines the owner didn't flag:** "Luckily, those chips are water-cooled. So their warm
  water gets a boost from heat pumps, then runs under the snow, into people's radiators." (Why "luckily"? Then three
  steps in one breath.) -> "These computers are cooled with water, so the water gets warm. Machines called heat pumps
  make it even hotter. Then that hot water runs through pipes under the streets, into people's homes."
- **The research:** listeners hang each sentence's new part on what they already hold (Haviland and Clark 1974,
  study); "our ears can only handle one fact or idea per sentence" (NPR Training, style guide:
  https://www.npr.org/sections/npr-training/2025/05/30/g-s1-65814/the-journey-from-print-to-radio-storytelling-a-guide-for-navigating-a-new-landscape);
  curiosity needs a base, so a skipped step reads as confusion, not as a question (Loewenstein 1994, study:
  https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf).
- **The test:** count the new ideas in each sentence: at most one. For each pair of lines: "could a stranger get from
  this line to the next with nothing missing?" Read each join as "A, so B" or "A, but B": does it hold, literally?

### 6. Literal words for a worldwide ear
- **The principle:** use words in their everyday, literal sense. No idioms, slang or wordplay that the listener has to
  decode.
- **Video 3's example:** "They pay more, so they get first dibs." and "... by the mountain." -> "Your laptop needs
  memory, and so do the giant computers that run AI. AI companies pay more, so they get the memory first." (The owner
  stumbled on the same idea when it was drawn in v3's animatic: "what does the AI mountain signify?") Video 4: "gets a
  boost from heat pumps" -> "heat pumps make it even hotter".
- **The research:** listeners in a second language work out an idiom's literal words first, even for idioms they know
  (Cieślicka 2006, study: https://doi.org/10.1191/0267658306sr263oa); "Avoid idioms, colloquial expressions, and
  culture-specific references" (Microsoft Style Guide, style guide); "Use words in their primary sense" (Google's
  style guide, style guide).
- **The test:** the panel's non-native viewer is asked "what does 'first dibs' mean here?". The check stops on known
  idioms and asks about figurative verbs ("end up", "gets a boost").

### 7. The one joke is the plain situation, said kindly
- **The principle:** the joke states the funny situation in one step, in simple, gentle, everyday words. It blames no
  one, and it still works for someone who takes every word literally.
- **The owner's example:** "And nobody's even making tea." -> "this is directionally okay, but still weird we need a
  simpler less scandalous language." It takes two steps (kettles, so tea; no tea, so the heat is wasted), and
  "nobody's even" sounds like an outrage -> "And usually, nobody uses that heat." (the smile goes in the voice and in
  the picture: one empty mug). Our plain jokes that worked: v1, "Even the FBI said if you can't update yet, just turn
  it off, which is basically tech support's answer to everything."; v3, "Laptops get better for the same money…
  usually right after you buy one."
- **The research:** a joke lands only when the "wrong" in it feels harmless; once it reads as a real wrong, it stops
  being funny (McGraw and Warren 2010, study: https://leeds-faculty.colorado.edu/mcgrawp/pdf/mcgraw.warren.2010.pdf);
  sarcasm is much harder to catch in a second language (Cheang and Pell 2011, small study:
  https://www.jbe-platform.com/content/journals/10.1075/pc.19.2.02che); humour does raise how much people like the
  speaker and want to comment (Yeo and colleagues, studies: https://jcom.sissa.it/author/sara-k-yeo), so keep one.
- **The test:** after one cold hearing, did they smile AND can they say the point? Both, or the joke goes. The check
  flags scolding frames ("nobody's even", "can't even", "of course").

### 8. Numbers and comparisons by ear
- **The principle:** one number per sentence, round, tied to an everyday thing. A comparison says what is alike ("as
  much heat as forty kettles", never only "like forty kettles"). No sums for the listener.
- **Video 5's example:** "And Helsinki wants to do it about 100 times bigger: from 2027, heat from AI chips is meant to
  warm about 70,000 flats." (three numbers, a multiplication, a "do it") -> "Helsinki has a plan to heat seventy
  thousand homes this way. That plan starts in twenty twenty-seven." Video 4: "One cabinet of them is like FORTY
  kettles" (like in what way: size, noise, heat?) -> "... gives off as much heat as forty kettles".
- **The research:** numbers make the listener do math and "are more easily missed, misheard or forgotten" (NPR
  Training, style guide); people understand counts better than percentages (Hoffrage et al. 2000, study:
  https://pubmed.ncbi.nlm.nih.gov/11188724/); an analogy confuses unless what is alike is said (Glynn's
  Teaching-With-Analogies, from education research:
  https://www.csun.edu/~vceed002/books/sourcebook/chapters/10-analogies/teaching-analogies.html).
- **The test:** per sentence, count the numbers (more than one?), any "N times" or percentage, any "like" that doesn't
  say what is alike. The panel is asked "what was the number, and what did it mean?".

### 9. The cold ear decides, not us and not a score
- **The principle:** a line is clear only when regular people who never saw the script hear it once, at feed speed,
  and can say it back. Every snag is a finding; a readability score proves nothing.
- **Our example:** draft 1's critic heard the problem and let it through: "'The chips get that hot.' landed a beat
  late (I had to re-link it to the question)", then "noted, no finding of their own". A readability formula rates
  "The chips get that hot." the EASIEST line in the script (grade -1.8: ours). Video 1, still our best performer, had a
  clarity critic with a "jargon and names audit" for "a smart non-coder"; the lean G1 had dropped that lens.
- **The research:** people who know something can't hear it as if they didn't (Camerer, Loewenstein and Weber 1989,
  study: https://doi.org/10.1086/261651); "No score can accurately predict whether an actual person would be able to
  understand your content" (Caroline Jarrett with Ginny Redish, practitioner:
  https://www.effortmark.co.uk/readability-formulas-seven-reasons-to-avoid-them-and-what-to-do-instead/); physics
  videos that felt clear taught almost nothing, and only the audience showed it (Muller 2008, study:
  https://thejournal.com/articles/2015/05/05/watching-videos-does-not-necessarily-lead-to-learning.aspx).
- **The test:** the G1 critic's cold viewer panel: three regular people (a non-native English speaker, a non-tech
  adult, a fast-scrolling teen) hear each sentence once and say what they understood, the words they missed, what
  each "it" points at, and whether their thumb stays. One wrong, unsure or re-linked line, and it is rewritten.

---

## How a 40-second script is structured so it lands

About 115 words at our measured ~2.87 words a second (the v2 and v3 takes). One story question, opened at once and
closed at the end; every beat a step toward the answer.

**The order of beats**

| Beat | When | Sentences | What it does |
|---|---|---|---|
| 1. Hook | 0-4 s | 1 | A friend's "Did you know ..." with one surprising, true claim: a place, a thing, a number. It opens ONE question ("how?") and states the payoff in words by ~2 s. |
| 2. Base | 4-8 s | 1-2 | The one plain fact that makes the claim possible, in everyday names, at once: the viewer's question stays about the story ("how hot?"), never about a word ("which chips?"). The film's one thing gets its one name here. |
| 3. BUT, the usual case | 8-14 s | 1-2 | What typically happens, as who does what, where ("In most data centers, big fans just blow that heat outside."). The joke, if any, sits around here. |
| 4. The turn | ~14 s | 1 short | "But Helsinki wants that heat." Short, and it keeps its noun. |
| 5. SO, how it works | 14-26 s | 3-4 | The plain mechanism, one physical step per sentence, in the order the thing moves (the computers, the water, a machine, the pipes, the homes). The picture shows each step as it is said. |
| 6. How much | ~27 s | 1 | One number, tied to an everyday thing ("The new data center would make nearly a tenth of Helsinki's heat."). |
| 7. BUT, the honest floor, then the proof | 28-36 s | 2-3 | The doubt in plain words, with its noun ("But the new data center doesn't exist yet."), then the proof or twist as one new idea (done before, under a cathedral). |
| 8. SO, for you: the payoff | 36-41 s | 1 | The core line, last, and the film ends close to it. |

**How each sentence hands the next its subject.** Old first, new last: a sentence starts from what the listener
already has (what the last sentence ended on, or the film's one thing) and ends on its one new part, where the voice
puts the stress. The next sentence takes that new part as its subject, by its noun ("it" only when nothing else could
fit). The joins are said and true: "but" brings the problem or the surprise, "so" the consequence, "because" the
reason; "and" only adds to the same step. At each turn, the first words name the place, the time or the actor ("In
most data centers, ...", "But Helsinki ...", "Back in twenty ten, ..."). Draft 1's opening, reworked as an
illustration (no flag from the clarity prototype; `check_rhythm.py` OK; facts: FL 2.1, 2.2, 6.1, 7.1):

| # | Line | Starts from (old) | Ends on (new) |
|---|---|---|---|
| 1 | Did you know Helsinki wants AI to heat seventy thousand homes? | (the hook) | AI heating homes |
| 2 | AI runs on giant computers, in buildings called data centers. | AI | the computers and their building, named once |
| 3 | Those computers get really hot. | those computers | really hot |
| 4 | Just one stack of them gives off as much heat as forty kettles, boiling non-stop. | one stack of them | forty kettles |
| 5 | In most data centers, big fans just blow that heat outside. | data centers, that heat | blown outside: wasted |
| 6 | But Helsinki wants that heat. | Helsinki, that heat | WANTS: the turn |

**Where the plain mechanism goes.** Twice. A short form right after the hook (beat 2, by ~8 s at the latest): the hook
raises "how?", and the base answers it with one physical fact. Draft 1's "The chips get that hot." left the viewer
guessing at 4 s. Then the full form after the turn (beat 5): one physical step per sentence, each step's subject the
thing the last step moved. Never a hint ("Luckily, ..."), always the reason said.

**Where a number goes.** The hook's one number (it makes the claim concrete), then at most one per beat: 4-5 in 40 s.
It goes at the END of its sentence, where the stress falls, round, and tied to an everyday thing (forty kettles,
seventy thousand homes, one in ten). A year only where "when" is the point ("from twenty twenty-seven"). Every other
number goes on paper, in the post's text.

**Where a joke may go.** One per film, after the base, when the viewer has the picture to smile at, or in the payoff
when the payoff itself is the plain funny thought. Never in the hook, the turn or the mechanism: a joke there costs a
step. Cut the joke and the story must still stand. It is plain and kind (principle 7), and it passes the panel (a
smile AND the point).

---

## The corpus: where the same failures recur (v1-v5)

Counted by hand, sentence by sentence, in v1's final script (9 sentences), v2's (12), v3's (14), v4's G1 draft 1 (13)
and v5's draft 1 (8); "4/9" means 4 of v1's 9 sentences. A sentence can show several patterns. On the same texts, the
clarity check's prototype (LINT_SPEC) finds most of rows 1, 2, 5, 6, 8 and 9 by itself; rows 3, 4 and 7 (the names,
the hints, the joke) and words no list holds (v2's legal phrases, v1's "supported") are the panel's to catch.

| Pattern | v1 | v2 | v3 | v4 d1 | v5 d1 | Two examples |
|---|---|---|---|---|---|---|
| 1. A trade word or false friend, never put in everyday words (P2) | 4/9 | 3/12 | 3/14 | 5/13 | 2/8 | v4 "The chips get that hot."; v1 "somebody still has to install it on every single server." |
| 2. A pointer with no single target: "it", "they", "which", a new "the X", "that hot" (P3) | 3/9 | 3/12 | 4/14 | 5/13 | 4/8 | v4 "But Helsinki WANTS it."; v3 "They pay more, so they get first dibs." (the chips or the data centers?) |
| 3. One thing, several names (P2) | 1 name | 1 name | 2 swaps | 5 names | 4 names | v4: AI, the chips, a cabinet, those chips, a data center, your chatbot; v5: a data centre, AI chips, one cabinet, "one" |
| 4. A hint where the thought belongs: a skipped step, a "luckily" for the reason (P4) | 0/9 | 1/12 | 3/14 | 3/13 | 2/8 | v4 "So almost everywhere, that heat just gets dumped into the air or the sea."; v3 "Which is backwards." |
| 5. A vague scope, or no doer (P4) | 1/9 | 0/12 | 0/14 | 1/13 | 2/8 | v4 "almost everywhere ... gets dumped"; v5 "Then someone sent one into space this month" |
| 6. An idiom, slang or figure of speech (P6) | 1/9 | 1/12 | 4/14 | 1/13 | 2/8 | v3 "first dibs", "by the mountain", "pass that on"; v1 "a heads-up, but word got out" |
| 7. A joke that needs decoding, or a scolding tone (P7) | 0/9 | 0/12 | 0/14 | 1/13 | 0/8 | v4 "And nobody's even making tea."; the plain ones that worked: v1's "tech support's answer to everything", v3's "right after you buy one" |
| 8. Two or more new ideas in one sentence (P5) | 2/9 | 2/12 | 2/14 | 1/13 | 3/8 | v4 "So their warm water gets a boost from heat pumps, then runs under the snow, into people's radiators."; v5 "So data centres end up in the weirdest places: inside a mountain ..., or under the sea, wired to a wind farm." |
| 9. Numbers or comparisons the ear can't use (P8) | 1/9 | 0/12 | 2/14 | 1/13 | 2/8 | v5 "about 100 times bigger: from 2027 ... about 70,000 flats"; v3 "about FIVE times last year's price" |

**What the corpus says.**
- **The failures grew as the scripts got shorter and the process leaner.** Video 1, still our best performer, ran a
  clarity critic with a "jargon and names audit" for "a smart non-coder" and fixed its own unclear "it" lines before it
  shipped; the lean G1 (one writer, one critic) checks the story, the opening, the facts and AI-sounding phrasing, but not
  whether a regular person knows the words.
  Draft 1 has the most trade words and pointers of all five.
- **The rhythm rule pulls short lines toward pointers.** Five of draft 1's six short sentences lean on a pointer ("that
  hot", "it", "those chips", "it's", "they've ... this"). The rule stands; the short line keeps its noun.
- **Each video's topic brings its own trade words** (PHP and servers, the Pentagon and "any lawful government purpose",
  memory chips, chips and cabinets): a fixed word list can never be complete, so each film adds its own (LINT_SPEC),
  and the panel catches the rest.
- **The owner has flagged this before:** video 1's "Who even knows WordPress now?" (the creative brief) and video 3's
  "what does the AI mountain signify?" (a figure of speech, drawn). Video 4's notes are the same lesson, line by line.
- **Our jokes were plain before:** v1's and v3's jokes are one step, kind and literal; v4's tea line is the outlier.

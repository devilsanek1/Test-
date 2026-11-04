# Research lane EXPLAINERS: how short explainers land with the biggest audience (2026-10-29)

Status: DONE (all sections written; sources at the end).

**Question:** how top explainers build a 30-60 s spoken script so a lay, worldwide viewer follows every step on one
hearing; how they name technical things; what makes viewers swipe; what humour lands. Applied to the Big Bend reel (the
owner's model, `video/docs/studies/2026-10-28_city_posters/refs/bigbend_reel/README.md`) and to video 4's G1 draft 1
(`video/docs/v4/archive/g1_draft1/script_elevenlabs.md`). The owner's words are the spec (S0).

**Strength marks:** **study** (an experiment or a peer-reviewed review), **style guide** (a newsroom, platform or
standards body's rules, or a research-based teaching model), **practitioner** (a working creator or writer's advice),
**our measurement** (computed here; method at the end).

**The short answer.** The owner's six notes point at four failures, all well documented: (1) a trade word where an
everyday name belongs ("chips", "cabinet"); (2) a pointer with no single target ("it", "that", "they"); (3) a hint where
the plain thought belongs ("almost everywhere ... the air or the sea"); (4) a joke that needs two steps and sounds like
blame ("nobody's even making tea"). The same failures sit in five lines the owner didn't flag (7-11). Readability
formulas miss all four: by them, draft 1 is EASIER than the Big Bend reel (grade ~4.9 against ~5.8), because they count
only word and sentence length. Clarity on one hearing comes from naming and pointing, not from shortness.

## Findings (ranked by impact for a 30-45 s spoken short)

### 1. Call every thing by the name a regular person uses for it, first and every time: one everyday name per thing, kept for the whole film.
- **Why.** Jargon makes a message feel hard and makes people push back, and a definition doesn't fix it: in a
  650-person experiment, texts with jargon were processed less fluently (F(1,636) = 76.03, eta2 = .11), which raised
  resistance to the message and its perceived risk and lowered support; definitions on mouseover changed nothing (no
  main effect, no interaction) [S3, study]. So never say the trade word and explain it: say the everyday name. The
  worst trade words are common words with a second, trade meaning: scientists' "aerosol" is the public's "spray can",
  their "positive feedback" is the public's "praise" [S5, style guide by scientists]. "Chips" is one (to a regular
  person: crisps, fries, poker chips); so is "cabinet" (a kitchen cupboard; a government's ministers). A frequency list
  can't catch them: "chips" scores Zipf 4.2 and "cabinet" 4.5, nearly as common as "apartment" (4.7) [S24, our
  measurement]; the De-Jargonizer's authors name this exact blind spot ("the same word holds a different meaning for
  scientists and layperson") [S6]. **How much a general audience tolerates:** a lay text is understood when about 98 %
  of its words are familiar (at most ~2 % jargon; 95 % is the bare minimum) [S6, study, after Hu and Nation]: a
  115-word script can afford about two unfamiliar words in total, each described in everyday words where it first
  appears. Draft 1 ran at 5-7 % (chips twice, cabinet, water-cooled, heat pumps, radiators; plus data center and
  chatbot if those count), the level of the scientists' "lay summaries" the study found "still far beyond the
  recommended 2 %" (8-12 %) [S6; S24]. **One thing, one name:** switching terms for one thing "will confuse your
  audience"; no synonyms for variety [S23, style guide]. Draft 1 calls its one thing AI, the chips, one cabinet of
  them, those chips, their (water), a data center, your chatbot: seven names in 40 s. **The pattern that works:**
  describe first in everyday words, name second, only if the name earns its place. The Big Bend: "this giant
  2,000-foot tall bending skyscraper", then "It's called the Big Bend." A news explainer: "servers, or computers that
  are designed to store and process data" [S19, example]. MrBeast's production guide: "for 50 million people to
  understand something it must be simple" [S8, practitioner].
- **Draft 1, bad -> good.** "The chips get that hot." -> "The computers that run AI get really hot." / "One cabinet
  of them ..." -> "Just one stack of these computers ...".
- **Check.** (a) List every noun phrase the script uses for its main thing and for what moves (here: the computers,
  the heat, the water): one everyday name each, kept all film. (b) Every content word passes: "would a 14-year-old
  who learned English at school use this word for this thing?" (c) A lint flags a curated list of trade-sense words
  (chips, chip, cabinet, rack, server, cloud, model, node, cluster, compute, load, GPU, processor, inference, token,
  water-cooled, liquid-cooled, heat pump, grid, district heating, megawatt, kilowatt) and rare words (Zipf below 3.0:
  kettles 2.6, radiators 2.8, chatbot 2.3) for a person to judge (the corpus lags: "chatbot" is everyday in 2026).

### 2. Name it before you point at it: every "it", "that", "this", "they", "those", "their" and every first "the + noun" points at ONE thing just named or on screen; if two could fit, say the noun.
- **Why.** Listeners hook each sentence's "given" part onto something already in mind; when nothing fits ("the beer"
  after "we checked the picnic supplies"), they must build a bridge by inference, and that costs time [S15, study]. At
  feed speed, with no rewind, the bridge is where the viewer falls off. Pronouns beat repeated nouns only when their
  target is the single obvious focus (the "repeated-name penalty" depends on that prominence) [S20, study]: a pronoun is
  right when one thing is in focus (the Big Bend's "It's called the Big Bend.": one tower on screen) and wrong after a
  sentence with several candidates.
- **Draft 1, bad -> good.** "But Helsinki WANTS it." follows "... that heat just gets dumped into the air or the sea.":
  three candidates, and the nearest are the air and the sea (the owner: "heat or air or sea?") -> "But Helsinki wants
  that heat." The same failure: "The chips get that hot." (no chips before; "that hot" points at a degree never
  said), "For now, it's a plan." (the heat? the city? the data center?), "But they've done this before." (who? what?).
  8 of 13 lines lean on a pointer the listener must resolve (lines 2, 3, 6, 7, 8, 9, 10, 11).
- **Check.** Mark every pointer word and every "the + noun" whose noun wasn't heard before; for each, write its target
  and count the candidates in the previous sentence and in the picture; more than one, or none, -> the noun. A lint
  can find the words and the first-mention "the X"; a person confirms the target.

### 3. Say the plain thought itself, never a compressed hint that works only if you already know what the writer knows.
- **Why.** The curse of knowledge: people who tapped out a well-known song predicted listeners would name it half the
  time; listeners named 3 of 120 (2.5 %), because the tapper hears the tune and the listener hears knocks [S4, study,
  via a practitioner book]. A writer who has read the fact file hears "the chips get that hot" as a whole thought.
  Kurzgesagt says outright that its scripts simplify on purpose, and its viewers thank it for doing so [S13,
  practitioner; a small study of comments]. The owner: "I think you are having some deeper thought here and you choose
  to be obscure about it" [S0].
- **Draft 1, bad -> good.** "So almost everywhere, that heat just gets dumped into the air or the sea." The thought
  behind it (Helsinki's energy boss: in almost all other countries the heat is cooled into the sea or the air and
  wasted; how cooling works) is hinted, never said -> "In most data centers, big fans just blow that heat outside."
- **Check.** Under each line write "What I mean is: ___" in the plainest words; if that sentence is clearer, it becomes
  the line. Then a cold listener says each line back after one hearing (finding 13).

### 4. One sentence, one step: each sentence adds one new thing to a picture the viewer already has; none adds two, none is skipped.
- **Why.** A sentence is understood by hooking its one new piece onto something given [S15, study]. Curiosity needs a
  base: it "is unlikely to arise in the absence of an existing knowledge base" (Loewenstein, p. 89) [S2, study], so a
  skipped step leaves the viewer with no base, and the gap reads as confusion, not curiosity. A story told event by
  event is easier to follow and more engaging than a bundle of facts [S14, study review].
- **Draft 1, bad -> good.** "So their warm water gets a boost from heat pumps, then runs under the snow, into people's
  radiators." (18 words, three steps, two trade words, one pointer) -> "Machines called heat pumps make that water even
  hotter. Then pipes under the streets carry it into people's homes." The skipped step before it: "Luckily, those chips
  are water-cooled." never says why that's lucky (the heat ends up in water, and water can travel through pipes) ->
  "These computers are cooled with water, so their heat ends up in hot water."
- **Check.** Count the new things in each sentence (a thing or a claim not heard before): at most one. For each pair of
  lines ask: "could a stranger get from this line to the next with nothing missing?"

### 5. Show the typical case, concretely: one place, one moment, one thing the camera can show; never a vague scope.
- **Why.** Made to Stick's "concrete": ideas told as things you can picture are understood and remembered; abstractions
  slide off [S4, practitioner book built on research]. MrBeast's guide: "Stop telling people what they will be watching
  and start showing them" [S8, practitioner]. The Big Bend names a place, a number, a name and a year within 6 s, each
  one shown in the picture. The owner: "When you say 'almost everywhere' - this is very ambigous ... i think you want to
  say that in a typical datacenter here is what happens" [S0].
- **Draft 1, bad -> good.** "So almost everywhere, that heat ..." -> "In a normal data center, that heat ...";
  "That's nearly a tenth of the city's heat." (an abstract total nobody pictures) -> "That's almost a tenth of all the
  heat Helsinki uses." (8.8 % of the city energy company's heat sales: FL 6.6).
- **Check.** Every quantifier or scope word (almost, most, everywhere, many, some, often, typically, around the world,
  in many countries) and every abstract noun (the city's heat, a boost, a plan): "what would the camera show here?" If
  nothing specific, rewrite it as the typical case.

### 6. Build the message as ONE question, then the base, then BUT and SO to the payoff, and make every join a said, true "but", "so" or "because".
- **Why.** Randy Olson's ABT (And, But, Therefore), from South Park's "rule of replacing and's with either but's or
  therefore": "and, and, and" is a list; "but" brings the problem; "therefore" the consequence [S1, practitioner].
  Narratives are easier to understand and more engaging than "logical-scientific" lists [S14, study review]. Curiosity
  is attention "focused on a gap in one's knowledge", and its pull grows with how much the next piece can close it
  (Loewenstein, pp. 87-88) [S2, study]. So the hook opens one question, the next line gives the base, and every line
  after closes a little more. **The shape** (the brief's §11 order inside 30-45 s; the playbook's join rule):
  1. hook: a friend's "Did you know ..." with the one surprising claim (opens the question);
  2. base: the one plain fact that makes it possible, in everyday names (AI's computers get very hot);
  3. BUT: the problem or the expected thing (usually that heat is wasted);
  4. SO: the turn and how it works, one step a line (Helsinki catches it: water, then pipes, then homes);
  5. BUT: the honest floor and the proof or twist (still a plan; done before, under a cathedral);
  6. SO, for you: the payoff (your chatbot could heat an apartment).
  A join must be TRUE: a "so" that doesn't follow is a hidden step; the listener checks the logic and finds a hole.
  "And" may add to the same step (the brief welcomes it as connective tissue); a new beat gets "but", "so" or
  "because".
- **Draft 1, bad -> good.** "And nobody's even making tea. So almost everywhere, that heat just gets dumped ..." (the
  "so" doesn't follow from the tea; the real link is "nobody uses it, so it's blown away") -> "But usually, nobody uses
  that heat. So big fans just blow it outside."
- **Check.** Read each join as "A, therefore B" or "A, but B": does it hold literally? Flag a sentence-initial "And"
  that starts a new beat, and any "So" whose previous line is not its reason (a person decides).

### 7. Make the viewer wonder about the story, never about the words: after each line the question must be "how?" or "then what?", never "which chips?" or "what is 'it'?".
- **Why.** Curiosity needs a specific gap the viewer can name; vague not-knowing doesn't make people curious: "people
  are not always curious, even though they are surrounded by vast regions of ignorance" (Loewenstein, p. 87) [S2,
  study]. Confusion about the IDEA, named and then resolved, helps: Muller's physics videos taught more when they
  first voiced the viewer's wrong idea, while clear "textbook" videos felt clear and taught almost nothing [S7, study].
  Confusion about the WORDS has no payoff: it is processing cost [S3], and retention dips are where viewers abandon
  [S21, platform].
- **Draft 1, bad -> good.** Line 1 opens a perfect story question (how can AI heat a home?). Line 2, "The chips get
  that hot.", answers it with a word puzzle (which chips? how hot is "that hot"?) that replaces the story question ->
  "That's because the computers that run AI get really hot." (the story question lives on: how hot? and then what?).
- **Check.** After each line, write the one question a first-time viewer now has: it must be about the story.

### 8. Tie every comparison to the real thing: say what is alike ("as much heat as forty kettles"), one comparison per idea, and only a true one.
- **Why.** Analogies teach when the shared feature is mapped and the limits are said; "if ... the analogies are not
  well chosen or applied systematically, they may be ineffective or cause confusion" (Glynn's Teaching-With-Analogies:
  introduce the target, recall the analogue, identify the features, map them, say where it breaks down, conclude) [S11,
  style guide from education research]. The playbook: literal beats clever; never a metaphor the facts don't support.
- **Draft 1, bad -> good.** "One cabinet of them is like FORTY kettles, boiling non-stop." Like in what way: size?
  noise? temperature? The true link is heat output (a 120 kW rack is about forty 3 kW kettles), while the water it
  warms is ~50-60 C, cooler than a kettle, so "like a kettle" heard as temperature is false; "boiling non-stop" stacks a
  second image -> "Just one stack of these computers gives off as much heat as forty kettles."
- **Check.** Every "like", "as ... as", "the size of", "worth of": does the sentence name the shared quantity (heat,
  size, weight, price), and is it true on that quantity? One comparison per sentence. The base object is everyday
  worldwide (an electric kettle is common in Europe and Asia, less so in US homes; "kettles" Zipf 2.6).

### 9. Humour: the joke is the plain thought said with a smile; it lands in one step, blames no one, and works for a non-native listener.
- **Why.** A joke lands only when something "wrong" is felt as harmless at the same moment; when it reads as a real
  wrong, it stops being funny [S16, study]. "And nobody's even making tea" frames the waste as an outrage ("nobody's
  even ...": the owner's "scandalous") and needs two steps on one hearing (kettles -> tea; no tea -> the heat is
  wasted). Irony and sarcasm are recognised less well in a second language [S17, small studies]. Humour does pay: it
  raises the speaker's likability and people's wish to comment and follow [S18, study], and the brief wants humour
  "from the situation". So keep it, plain and kind.
- **Draft 1, bad -> good.** "And nobody's even making tea." -> "And usually, all that heat just goes to waste." (the
  smile goes in the voice). A kettle joke may come back only if a cold viewer smiles AND says "the heat is wasted"
  after one hearing.
- **Check.** One cold hearing: did they smile, and can they say the point? Flag words that blame, scold or sneer
  ("nobody's even", "can't even", "of course") and irony that needs a tone to decode.

### 10. Short lines carry their own noun: the rhythm rule's short sentence names its subject; readability scores never prove clarity.
- **Why (our measurement).** Draft 1 is "easy" by the formulas: 8.8 words a sentence, Flesch-Kincaid grade ~4.9,
  Flesch ease ~75; the Big Bend's opening is "harder" (13.3 words a sentence, grade ~5.8) and is the clear one [S24].
  The formulas count only sentence length and syllables; draft 1's problems are pointers, senses and missing steps. And
  5 of its 6 short sentences (5 words or fewer) lean on a pointer ("that hot", "it", "those chips", "it's", "they've
  ... this"): chasing rhythm, the short line sheds its noun. The playbook's rhythm rule (a short line after every 1-2
  long ones, `check_rhythm.py`) stays; the short line keeps its noun.
- **Draft 1, bad -> good.** "But Helsinki WANTS it." -> "Helsinki wants that heat."; "For now, it's a plan." -> "The
  data center isn't built yet."
- **Check.** Every sentence of 5 words or fewer names its subject or has a pointer with one clear target.
  `check_rhythm.py` OK is never evidence of clarity.

### 11. The captions are the same words, read: each caption makes sense on its own, sound off, at a glance; a strange word is read as well as heard.
- **Why.** Captions improve comprehension, attention and memory, most for viewers in a second language [S10, study
  review of 100+ studies; a critique notes much of it is self-report]. Viewers read along, so the caption is a second
  channel for the same words: it can't rescue a vague line (the caption says "IT" too), and it prints a trade word in
  big letters. TikTok's own guidance: introduce what the video offers in the first 3 seconds; captions give context, at
  5-10 words a second [S22, platform guidance, written for ads].
- **Draft 1, bad -> good.** Caption "THE CHIPS GET THAT HOT." over a steaming metal cabinet reads as food -> "THE
  COMPUTERS THAT RUN AI GET REALLY HOT."
- **Check.** Read the caption track alone, sound off, at speed: each caption chunk makes sense without the voice and
  without the caption before it.

### 12. Say the expected thing, then the surprise: name what a viewer would assume, then overturn it (the hook made physical, in words), once per film.
- **Why.** Videos that first state the viewer's likely wrong idea and then correct it teach more than smooth, clear
  expositions [S7, study]; the BUT of the ABT is exactly this [S1]; the playbook already asks for it in the picture
  ("the expected thing, then reality overtaking it"). Say it as a person would ("You'd think ... but ..."), never as
  the brief's banned templates ("Not X. Y.", "It's not X, it's Y").
- **Draft 1, bad -> good.** "Did you know Helsinki wants AI to heat seventy thousand homes?" can be heard as "AI will
  run the heating" (a smart thermostat); line 2 must kill that reading at once, and "The chips get that hot." doesn't ->
  "That's because the computers that run AI get really hot." (the expected reading is overturned by naming the real
  mechanism; a "You'd think ..." line is optional).
- **Check.** Ask a cold listener after line 1: "how do you think AI heats a home?" If their guess differs from the
  real mechanism, line 2 names the real one in everyday words.

### 13. Test every line the way the feed does: one stranger, one hearing, feed speed (ideally a non-native speaker), says each line back; a line they can't retell is a swipe.
- **Why.** Retention dips "mean that viewers are abandoning or skipping at that specific part of your video" [S21,
  platform]; Shorts counts the feed's verdict as "viewed vs. swiped away" [S9, platform metric]; MrBeast's guide: "the
  first minute has the most loss" [S8, practitioner]; Mark Rober: "No one shares a video they didn't finish watching"
  [S12, practitioner]; ours: v1's calm opening lost ~80 % by 3 s; v3 was skipped by 64.5 % (playbook) [S25]. A clear
  exposition can feel clear to its makers and still fail [S7]: only a cold listener tells.
- **Draft 1, bad -> good.** The writer's own "cold retell" reused the fact file's words ("the heat from AI chips, which
  run so hot ..."). The critic did retell after one hearing, before reading the facts, and noticed the very snags:
  "'The chips get that hot.' landed a beat late (I had to re-link it to the question)"; "'Luckily, those chips are
  water-cooled' felt like a gear change I had to take on trust"; then waved them through as "paid off by the next line
  each time ... no finding of their own" (`archive/g1_draft1/critique_g1.md`). A tech-literate listener re-links; a
  regular viewer swipes. -> Every snag in a cold retell is a finding, never "paid off by the next line", and the
  retelling listener is briefed as a regular, non-tech, non-native viewer.
- **Check.** The cold panel hears the take once, at speed, with no script and no fact file, and retells it line by
  line; any line retold wrong, met with "I don't know what X was", or one they had to re-link, is rewritten. At G1,
  before a take, the critic's cold retell counts every snag as a finding.

## The Big Bend reel, line by line (why it is clear)

Only the first ~11 s survive the recording (S0's reference, `refs/bigbend_reel/`; the first words were cut and are
restored from the owner's description). Sources for the screen: the contact sheet (6 frames, 0-11 s).

| # | Voice (or text) | On screen | Why it is clear |
|---|---|---|---|
| title | (fixed bar) "Why This Skyscraper Curves Back Down??" | the white arch over Central Park, alone in the sky | ONE question, about the one thing in the picture; "this" can only mean that tower; everyday words ("skyscraper", "curves back down"); it opens a gap anyone can name (finding 7). |
| 1 | "Did you know that New York once got a proposal to build this giant 2,000-foot tall bending skyscraper?" | captions pop 1-2 words at a time ("once got", "2,000 feet", "skyscraper"); a height marker climbs the tower | A friend's question; every noun is new and indefinite ("a proposal"), so nothing to bridge (finding 2); "this" is backed by the picture; one number in a unit Americans use; the plain words "giant", "tall", "bending" are proved by the image; one step: someone wanted to build this tower (finding 4). Described first in everyday words, named next (finding 1). |
| 2 | "It's called the Big Bend." | street-level view up at the arch; caption "the Big Bend" | 5 words; "it" has one candidate (finding 2); the name re-describes what you see (big, bend), so it adds a label, not a puzzle; the short line follows the long one (the rhythm rule) and keeps a clear subject (finding 10). |
| 3 | "This crazy project was proposed in 2017 for New York City by the architect ..." | aerial along the river; caption "in 2017"; then a lineup chart, "The longest tower": 4,000 ft beside the Burj Khalifa's 2,722 ft | Re-names the subject with a new plain noun that recaps it ("this crazy project": "this" plus a noun, never a bare "this"); a year and a maker, one step; "crazy" is the one bit of personality: plain, kind, one word (finding 9); the comparison is literal, on one labelled quantity (finding 8). |
| post text | "The strange part isn't how high this skyscraper ..." | (under the reel) | The BUT that opens the next gap (it is the longest building in the world): the shape of finding 6. |

**What it does that draft 1 doesn't:** one thing in focus the whole time, so its pointers can't miss; only everyday
nouns; one step a sentence; the picture shows each noun as it is said; personality from one plain adjective, not a
riddle; LONGER sentences (13.3 words on average against draft 1's 8.8), yet clearer: the clarity comes from naming and
pointing, not from shortness. Its two nits (our evaluation, `content_discussion.md` exchange 10): "got a proposal"
overstates (a studio's concept), and "New York" twice in 11 s (harmless: a repeated noun is never a puzzle).

## Video 4 draft 1, line by line (why each flagged line fails; which unflagged lines fail the same way)

"F" = finding number above. The plainer lines are illustrations of the principle, not the rework (facts per
`video/docs/v5/research/factlock.md`, FL).

| # | Line | The owner | What a first-time listener hits | F | A plainer line (illustration) |
|---|---|---|---|---|---|
| 1 | Did you know Helsinki wants AI to heat seventy thousand homes? | "great thats what i would like to tell my friends." | A friend's news: one place, one number, one surprising pair (AI and heating homes); one story question (how?). Risk: "AI to heat" can be heard as "AI will run the heating"; line 2 must say at once that it is the computers' heat. | passes (1, 2, 6, 7); 12 | keep |
| 2 | The chips get that hot. | "which chips? ... Chips is a word not a lot of people would understand." | "The chips": no chips before (a bridge); "chips" is food to most people; "that hot" points at a degree never said; the "because" is unsaid; a word puzzle replaces the story question. Formula grade ~-1.8: the "simplest" sentence in the film, and the one that loses people. | 1, 2, 3, 7, 11 | "That's because the computers that run AI get really hot." |
| 3 | One cabinet of them is like FORTY kettles, boiling non-stop. | "also similarly the next one too." | "cabinet" means a cupboard or ministers; "of them" stacks a pointer on the unclear "chips"; "like" never says in what way (heat); two images at once. | 1, 2, 8 | "Just one stack of these computers gives off as much heat as forty kettles." |
| 4 | And nobody's even making tea. | "directionally okay, but still weird we need a simpler less scandalous language." | Two steps to get the joke (kettles -> tea -> wasted heat); "nobody's even" sounds like an outrage; irony is harder in a second language; "And" adds a quip, not a step. | 9, 6 | "And usually, all that heat just goes to waste." |
| 5 | So almost everywhere, that heat just gets dumped into the air or the sea. | "find an easier, simpler way to land the thought ... you choose to be obscure about it ... 'almost everywhere' - this is very ambigous" | Vague scope (where is "almost everywhere"?); the mechanism (fans, cooling towers, sea water) squeezed into "the air or the sea"; "the sea" is a surprise left unexplained; the "So" doesn't follow from the tea; the deeper thought (the energy boss's "almost all other countries") is hinted, not said. | 3, 5, 6 | "In most data centers, big fans just blow that heat outside." |
| 6 | But Helsinki WANTS it. | "When you say IT - what exactly is it - heat or air or sea?" | "it" after three candidates, the nearest being "the air" and "the sea"; the film's turn rides on a pronoun. | 2, 10 | "But Helsinki wants that heat." |
| 7 | Luckily, those chips are water-cooled. | (not flagged) | "chips" again, behind a pointer ("those"); "water-cooled" is a trade word for the film's key step; "Luckily" stands in for the reason (the heat ends up in water, and water can be piped). | 1, 2, 4, 6 | "These computers are cooled with water, so their heat ends up in hot water." |
| 8 | So their warm water gets a boost from heat pumps, then runs under the snow, into people's radiators. | (not flagged) | "their" = the chips; three steps in one sentence; "a boost" and "heat pumps" for "gets hotter in machines"; "runs under the snow" is poetry for "pipes under the streets"; "radiators" is rare in warm countries (Zipf 2.8). | 1, 2, 4, 5 | "Machines called heat pumps make that water even hotter. Then pipes under the streets carry it into people's homes." |
| 9 | That's nearly a tenth of the city's heat. | (not flagged) | "That" = the water? the plan? the data center?; "the city's heat" is an abstract total. | 2, 5 | "That's almost a tenth of all the heat Helsinki uses." (FL 6.6) |
| 10 | For now, it's a plan. | (not flagged) | "it" = the heat, the city or the data center? The draft's own notes dropped "It isn't built yet" because "it" read as the heat; the same "it" stayed here. | 2, 10 | "The data center isn't built yet." |
| 11 | But they've done this before. | (not flagged) | "they" = Helsinki (a city as "they"); "this" = heating homes with computer heat, a thought spread over four lines. | 2, 10 | "But Helsinki has done this before." |
| 12 | In twenty ten, a data center under a cathedral started heating homes. | (not flagged) | Clear on its own, and the film's best WOW; but the everyday name for the film's thing ("data center") first appears here, at ~32 s: it belongs near the start, described plainly ("a building full of these computers"). | 1 (late) | keep; name the data center early |
| 13 | So from twenty twenty-seven, your chatbot could heat an apartment in Helsinki. | (not flagged) | A playful leap (the chatbot doesn't heat; its computers do) that lands only if the film said earlier that these are the computers behind your chatbot; the "So" follows weakly from "done this before". | 3, 6 (borderline) | keep, if the set-up names the computers behind the chatbot |

**The tally.** The owner flagged lines 2-6. Lines 7-11 fail the same ways: pointers (7, 8, 9, 10, 11), trade words (7,
8), three steps in one sentence (8), a skipped step (7), an abstract total (9). Line 13 is borderline; only lines 1
and 12 stand on their own. The root causes: the writer's knowledge filled the gaps (finding 3), the subject changed
names seven times (finding 1), the short lines shed their nouns for rhythm (finding 10), and the critic heard the snags
at lines 2 and 7 and let them pass (finding 13).

## The 6 that matter most

1. **Everyday names, one per thing, kept all film** ("the computers that run AI"; at most ~2 unfamiliar words per
   script, each described plainly where it first appears; a common word with a trade meaning, like "chips", counts as
   unfamiliar). (F1)
2. **Name it before you point at it** (every "it", "that", "they", "this" and every first "the X" has exactly one
   target, or say the noun; short lines keep their noun). (F2, F10)
3. **Say the plain thought** (write "What I mean is: ___" and use that sentence; no hints at a deeper thought). (F3)
4. **One step per sentence, none missing, each joined by a true "but", "so" or "because", in the shape question ->
   base -> but -> so -> payoff.** (F4, F6)
5. **The typical case, concrete** (what the camera would show; no "almost everywhere"; a comparison says what is alike
   and is true on it). (F5, F8)
6. **Humour is the plain thought with a smile** (one step, blames no one, works for a non-native listener). (F9)

Over all six, the one check that catches them: **one stranger, one hearing, feed speed, retells every line** (F13).

## Method notes (our measurements, S24)

- **Word frequency:** `wordfreq` (Python, Zipf scale: log10 of uses per billion words; 4 = 10 per million, 3 = 1 per
  million), English, each hyphenated part scored separately. Draft 1 words below Zipf 4.0: Helsinki 3.4, seventy 3.8,
  kettles 2.6, boiling 3.8, nobody's 3.6, dumped 3.9, Luckily 3.9, water-cooled 3.6, pumps 3.8, radiators 2.8, tenth
  3.9, chatbot 2.3. Trade-sense words that pass any frequency list: chips 4.2, cabinet 4.5 (for scale: computers 4.3,
  apartment 4.7, heat 4.9).
- **Readability:** Flesch-Kincaid grade and Flesch reading ease from the standard formulas, with an approximate
  vowel-group syllable count (the usual dictionary was blocked), on the plain voice-over (numbers spelled as spoken):
  draft 1, 114 words, 13 sentences, 8.8 words a sentence, grade ~4.9, ease ~75; the Big Bend's first 11 s, 40 words,
  3 sentences, 13.3 words a sentence, grade ~5.8, ease ~77. Line grades: "The chips get that hot." ~-1.8; "But
  Helsinki wants it." ~3.7; "One cabinet of them ..." ~7.2; "So almost everywhere ..." ~5.9; "And nobody's even making
  tea." ~7.6.
- **Pointer count:** by hand, every "it / that / this / they / them / their / those" and every "the + noun" with no
  earlier mention, per line of the paste.

## Sources

- S0. The owner's words on draft 1 (2026-10-29 ~11:30 UTC), verbatim in `video/docs/v4/OWNER_NOTES.md` (last entry)
  and `BRIEF.md` (the spec).
- S1. Olson, R. (2015) *Houston, We Have a Narrative* (U. Chicago Press); NCSE on the ABT and South Park's rule ("the
  rule of replacing and's with either but's or therefore"):
  https://ncse.ngo/and-therefore-randy-olson-and-art-science-storytelling-part-1 (practitioner: a scientist turned
  filmmaker).
- S2. Loewenstein, G. (1994) "The Psychology of Curiosity: A Review and Reinterpretation", *Psychological Bulletin*
  116(1) 75-98; abstract: https://stafforini.com/works/loewenstein-1994-psychology-curiosity-review/ ; scan read at
  pp. 87-89: https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf (study: a review; "curiosity as
  arising when attention becomes focused on a gap in one's knowledge"; "people are not always curious, even though they
  are surrounded by vast regions of ignorance"; curiosity "is unlikely to arise in the absence of an existing knowledge
  base").
- S3. Bullock, Colón Amill, Shulman, Dixon (2019) "Jargon as a barrier to effective science communication: Evidence
  from metacognition", *Public Understanding of Science* 28(7): https://pubmed.ncbi.nlm.nih.gov/31354058/ ; full text:
  https://comm.osu.edu/sites/comm.osu.edu/files/PUS%202019-%20Bullock%20et%20al..pdf (study: N = 650, 2 x 2
  experiment; jargon lowered processing fluency, F(1,636) = 76.03, eta2 = .11; definitions had no effect on fluency
  and no interaction; lower fluency raised resistance and risk perception and lowered support).
- S4. Heath, C. and Heath, D. (2007) *Made to Stick* (simple, unexpected, concrete, credible, emotional, stories);
  Newton's 1990 tappers study (tappers predicted 50 %; listeners named 3 of 120 songs, 2.5 %):
  https://law.temple.edu/aer/?p=2964 (study, reported via a practitioner book).
- S5. Somerville, R. and Hassol, S. J. (2011) "Communicating the science of climate change", *Physics Today* 64(10);
  its table of words the public hears differently ("aerosol" = "spray can", "positive feedback" = "praise",
  "enhance" = "improve"), reproduced: https://grist.org/climate-change/2011-11-22-the-art-of-talking-climate-science/
  (style guide by scientists).
- S6. Rakedzon, Segev, Chapnik, Yosef, Baram-Tsabari (2017) "Automatic jargon identifier for scientists engaging with
  the public and science communication educators" (the De-Jargonizer), *PLOS ONE* 12(8) e0181742:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5549884 (study: 98 % familiar words, so at most 2 % jargon, after Hu and
  Nation; 95 % as the minimum, after Laufer and Ravenhorst-Kalovski; lay summaries still had 8-12 %; words with a
  different everyday meaning are a named blind spot).
- S7. Muller, D. (2008) PhD thesis, U. Sydney, *Designing Effective Multimedia for Physics Education*; summary:
  https://thejournal.com/articles/2015/05/05/watching-videos-does-not-necessarily-lead-to-learning.aspx ; journal
  version: https://openjournals.library.sydney.edu.au/IISME/article/view/6345 (study: clear expository videos felt
  clear and taught almost nothing; videos that first voiced the viewer's wrong idea taught more).
- S8. "How to Succeed in MrBeast Production" (internal guide, leaked 2024; its authenticity was reported by former
  producers, not by the company), text: https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/ ;
  context: https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/ (practitioner).
- S9. YouTube Shorts' "viewed vs. swiped away" (Studio > Analytics > Content), as creator guides describe it:
  https://buffer.com/resources/the-creators-guide-to-youtube-shorts-analytics (platform metric, via practitioners; no
  official benchmark).
- S10. Gernsbacher, M. A. (2015) "Video Captions Benefit Everyone", *Policy Insights from the Behavioral and Brain
  Sciences* 2(1): https://successforkidswithhearingloss.com/wp-content/uploads/2020/04/Video-Captions-Benefit-Everyone_2015.pdf
  (study: a review of 100+ studies); critique:
  https://www.learningandthebrain.com/blog/video-captions-benefit-everyone-an-investigation/ (practitioner).
- S11. Glynn, Duit and Thiele (1995), Teaching-With-Analogies, summarised in Herr's *Sourcebook for Teaching Science*:
  https://www.csun.edu/~vceed002/books/sourcebook/chapters/10-analogies/teaching-analogies.html (style guide from
  education research).
- S12. Rober, M., on ReThinking with Adam Grant (TED, 2024), transcript:
  https://www.ted.com/pages/how-mark-rober-hides-science-vegetables-in-viral-videos-transcript ("you gotta hook 'em";
  "No one shares a video they didn't finish watching"); Stanford talk, 2025:
  https://stanforddaily.com/2025/05/19/youtuber-and-former-nasa-engineer-mark-rober-draws-full-crowd-speaks-to-scientific-storytelling/
  ("Focus on the feeling") (practitioner).
- S13. Kurzgesagt, "Can You Trust Kurzgesagt Videos?" (scripts of ~1,300 words, "so there's always some degree of
  simplification", as a search index quotes the transcript at https://voicetube.com/videos/73977 ; the page did not
  render for us) (practitioner); Young, Driessen, Pridmore, "'We Lied to You... and We'll Do It Again':
  Communicating Science via YouTube", *Kairos* 30.1: https://kairos.technorhetoric.net/30.1/topoi/young-et-al/ (study,
  small: of the top 50 comments on Kurzgesagt's simplification video, 42 expressed appreciation).
- S14. Dahlstrom, M. F. (2014) "Using narratives and storytelling to communicate science with nonexpert audiences",
  *PNAS* 111 (Suppl. 4) 13614-13620: https://pmc.ncbi.nlm.nih.gov/articles/PMC4183170 (study: a review).
- S15. Haviland, S. E. and Clark, H. H. (1974) "What's new? Acquiring new information as a process in comprehension",
  *Journal of Verbal Learning and Verbal Behavior* 13; Clark (1977) "Bridging":
  https://web.stanford.edu/~clark/1970s/Clark,%20H.H.%20_Bridging_%20reprint%201977.pdf (study: the given-new
  contract; a "the X" with no earlier X forces a slower bridging inference).
- S16. McGraw, A. P. and Warren, C. (2010) "Benign violations: making immoral behavior funny", *Psychological Science*
  21(8): https://leeds-faculty.colorado.edu/mcgrawp/pdf/mcgraw.warren.2010.pdf (study: five experiments).
- S17. Sarcasm and irony in a second language: Dolan (BYU), https://schwa.byu.edu/files/2016/01/Dolan_Sarcasm.pdf
  (ESL listeners less accurate on sarcastic context and tone); Cheang and Pell (2011), *Pragmatics and Cognition*
  19(2), https://www.jbe-platform.com/content/journals/10.1075/pc.19.2.02che (sarcasm in an unfamiliar language
  recognised near chance) (studies, small).
- S18. Yeo, Cacciatore and colleagues on humour in science posts (JCOM; *Public Understanding of Science*, 2021): mirth
  raised the communicator's likability and the wish to comment and follow, varying with what people already know:
  https://jcom.sissa.it/author/sara-k-yeo ; project:
  https://informalscience.org/project/exploring-effectiveness-using-humor-communicating-about-science/ (studies).
- S19. Technical.ly, 16 Jun 2025, a news explainer naming the object for lay readers ("servers, or computers that are
  designed to store and process data"): https://technical.ly/civics/what-are-data-centers-explainer.md (example).
- S20. Gordon, Grosz and Gilliom (1993) "Pronouns, names, and the centering of attention in discourse", *Cognitive
  Science* 17, the repeated-name penalty, reviewed in https://revistas.ufrj.br/index.php/rl/article/view/4548 (study:
  pronouns beat repeated names only when the referent is the prominent one).
- S21. YouTube Help, "Measure key moments for audience retention": https://support.google.com/youtube/answer/9314415
  ("Dips mean that viewers are abandoning or skipping at that specific part of your video") (platform).
- S22. TikTok Ads, "Creative best practices for performance ads": https://ads.tiktok.com/help/article/creative-best-practices
  (introduce the proposition in the first 3 seconds; captions for context, 5-10 words per second) (platform, for ads).
- S23. Federal Plain Language Guidelines, "Use the same terms consistently":
  https://www.plainlanguage.gov/guidelines/words/use-the-same-terms-consistently/ (style guide).
- S24. Our measurements (this file, method notes): wordfreq, https://pypi.org/project/wordfreq/ ; the Flesch-Kincaid
  formulas, https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests (our measurement).
- S25. Our own performance data: `video/docs/OWNER_PLAYBOOK.md` (Audience and goal; Hook and pacing; Performance log):
  v1 lost ~80 % by 3 s with a calm opening; v3 60 % gone by ~2 s, skip rate 64.5 % against v1's 32 %.

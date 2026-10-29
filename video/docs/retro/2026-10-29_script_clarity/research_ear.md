# Research lane EAR: understood on ONE hearing (2026-10-29)

**Status: DONE.** 17 web searches, plus a direct read of each page or paper cited (curl through the session proxy; the
PubMed, ERIC, Crossref and OpenAlex APIs; the authors' own PDFs). Every claim names its source; where only an abstract
or a summary could be opened, the claim goes no further than that text.

**Question:** how is a spoken line understood on ONE hearing, at feed speed, by the biggest worldwide audience (regular
people, many not native English speakers, reading the captions as it plays, unable to rewind)?
**Examples:** video 4's G1 draft 1 (`video/docs/v4/archive/g1_draft1/script_elevenlabs.md`; line numbers as in the
table of `script_g1.md` beside it). A "better" line only illustrates its rule: it stays inside the fact lock, and the
rework writes the real lines.
**Strength:** **study** (an experiment, or a review of experiments), **style guide** (a newsroom's, a government's or a
standards body's written rules), **practitioner** (a working writer's, editor's or teacher's advice).

## Why the ear is different (the frame for every finding)

- **The listener can't go back.** "Radio is linear; it always moves forward ... with no opportunity to slow down or
  rewind", and "once a listener gets confused, the forward momentum of the information outpaces their ability to
  comprehend what's happening" (Alison MacAdam, NPR Training, [N1] and [N2]; style guide).
- **When a sentence ends, mostly its meaning survives, not its words:** verbatim recall is good only for the clause
  just heard (Jarvella 1971; Sachs 1967; [C7]; studies; Gurevich et al. 2010 show some wording does survive). So the
  listener can't re-parse the last line to find what "it" was: they carry a gist forward.
- **Working memory holds about four chunks** (Cowan 2001, [C8]; study).
- **Our pace is about 172 words a minute** (2.87 words a second, measured on the v2 and v3 takes), and faster speech
  cuts second-language comprehension (Griffiths 1990, [L5]; study). The speed is set by the feed; word choice and
  sentence shape are the levers left.

## Findings (ranked by impact for a 30-45 s spoken short)

### 1. Name each thing with the everyday word regular people use for it: no tech word, and never a common word in its tech sense (a "false friend": chips, cabinet, rack, cloud, cooling, model).
- **Why.** The usual meaning of a word comes first, and a context that points at a rarer meaning still costs effort
  (the "subordinate bias effect": Leinenger and Rayner 2013, [C10]; study). Which meaning is "usual" depends on what you
  know: baseball experts stumbled, where non-experts didn't, on words whose common meaning for them was the baseball one
  (Wiley, George and Rayner 2016, [C11]; study). To us "chips" are processors; to most people they are fries or crisps,
  and a second-language listener reaches for the literal, everyday meaning first (Cieślicka 2006, [L3]; study). A wrong
  first reading tends to linger even after the sentence corrects it (Christianson et al. 2001, [C9]; study). Jargon
  lowers processing fluency, which raised resistance and cut support, and definitions on mouseover made no difference
  (Bullock et al. 2019, N = 650, [J1]; study). Science communicators keep tables of exactly these words: "enhance" heard
  as improve, "aerosol" as spray can, "positive feedback" as praise (Somerville and Hassol 2011, [J2]; practitioner).
  Ed Yong writes "things that cause cancer rather than carcinogens" ([J4]; practitioner); GOV.UK: use the words your
  users use, "heavy goods vehicle" or "lorry" ([P3]; style guide). Tools miss false friends: a frequency-based jargon
  finder can't flag a common word (Rakedzon et al. 2017, [J3]; study), and a readability formula rates "The chips get
  that hot." the easiest line in the script (finding 6).
- **Draft 1 -> better.** "The chips get that hot. One cabinet of them is like FORTY kettles, boiling non-stop." ->
  "AI runs on giant computers. And those computers get really hot. Just one of them, about the size of a big fridge,
  makes as much heat as forty kettles, boiling non-stop." Rounding a thing to "its nearest understandable form" (Ed
  Yong's phrase, [J4]) is what the owner's "no law-firm precision" allows: a 72-chip rack is one giant computer.
- **Check.** Script: flag every word on a false-friend list (chip(s), cabinet, rack, server, cloud, cooling/cooled,
  model, training, node, cluster, farm, load, stack, grid) and on a tech list (GPU, processor, kilowatt, megawatt,
  liquid-cooled, heat recovery, district heating, heat pump); a flagged word passes only with its everyday name in the
  same or the previous sentence; a rare-word check covers the rest. Cold listener: for each flagged word, "what are the
  chips?"; one wrong or unsure answer fails the line.

### 2. Introduce a thing before you point at it: "the X", "those X", "that hot" only for something this script has already said; a new thing enters as the familiar thing it is, one new thing per sentence.
- **Why.** The given-new contract: a listener treats "the beer" as already known and searches memory for it. With a
  direct antecedent ("We got some beer out of the trunk. The beer was warm.") the target was understood in 835 ms;
  when the link had to be inferred ("We checked the picnic supplies. The beer was warm.") in 1016 ms (Haviland and
  Clark 1974, [C1]; study). That was an easy, everyday bridge, read, by students; a listener who can't build the bridge
  at all (AI -> computers -> chips) gets nothing from the line. Science writers introduce, then reuse: "Explain a word
  once and you can often get away with using it again", and a term that isn't "core to the story" is left out (Ed Yong,
  [J4]; practitioner); GOV.UK: explain a specialist term "the first time you use them" ([P3]; style guide); "Provide
  context. Don't assume that the reader already knows what you're talking about" (Google, [L8]; style guide). Since a
  definition doesn't undo a term's cost (Bullock et al., finding 1), the familiar description comes first, and the
  term only if the story needs it.
- **Draft 1 -> better.** "Did you know Helsinki wants AI to heat seventy thousand homes? The chips get that hot." ("the
  chips" were never introduced; "that hot" points at a temperature nobody said) -> "... seventy thousand homes? AI runs
  on giant computers. And those computers get really hot." "Data center" enters the same way, once, as what it is: "a
  building full of these computers".
- **Check.** Script: list each definite phrase (the, that, those, these, this + noun) whose noun has not appeared
  earlier in the script (world-unique things such as the sea, the air, the snow pass), each degree word with nothing to
  point at ("that hot", "that much", "so much"), and each sentence that brings in more than one new thing. Cold
  listener: "which chips?"; "how hot is 'that hot'?".

### 3. One name per thing, kept the whole way: pick the everyday name of the thread object and never swap it for a synonym.
- **Why.** "Use one word for a concept, and use it consistently. Avoid using synonyms to refer to the same concept or
  feature. And don't use the same word to refer to multiple concepts or features" (Microsoft Style Guide, [L7]; style
  guide); "If you use different names for the same thing, translators might think you're referring to different
  concepts" (Google, [L8]; style guide), and a listener is in the translator's seat. Each mention is matched to one
  already heard (finding 2), so every new name is a new thing to place; and listeners track the thing a passage is about
  and expect it to continue (centering: Gordon, Grosz and Gilliom 1993, [C3]; study).
- **Draft 1 -> better.** One thing goes by five names in 40 s: "AI" (line 1), "the chips" (2), "one cabinet of them"
  (3), "those chips" (7), "a data center" (12), "your chatbot" (13). -> "AI" -> "giant computers" -> "these computers"
  (lines 3, 7, 8) -> "a data center, a building full of these computers" (once) -> "your chatbot" (fine: everyone knows
  a chatbot is AI, the film's first name for the thing).
- **Check.** Script: the through-line card names the thread object and its one everyday name; the lint prints the chain
  of thing-nouns in order (here "AI -> chips -> cabinet -> chips -> data center -> chatbot"), so a reviewer sees every
  swap at a glance. Cold listener: "were the chips and the data center the same thing?".

### 4. Every "it", "they", "this" or "that" points at one obvious thing; when two things could fit, say the noun again (or take the rival out of the line before).
- **Why.** Listeners pick a pronoun's referent about 200 ms after hearing it, from cues such as gender and which thing
  is most prominent, the first-mentioned one (Arnold et al. 2000, a listening eye-tracking study, [C4]; study). "It"
  has no gender, so "heat", "air" and "sea" all fit, and the prominent one (that heat, the subject) competes with the
  most recent ones (the air or the sea). A pronoun beats a repeated noun only when its referent is the clear center of
  attention (Gordon et al. 1993, [C3]; in spoken comprehension too, Peters, Boiteau and Almor 2016, [C5]; studies);
  anywhere else the noun costs nothing and saves the line: "if a pronoun is ambiguous, then replace it with the noun";
  "Repeat a word if the redundancy improves comprehension" (Google, [L8]; style guide). And the listener can't look back
  to check (the frame).
- **Draft 1 -> better.** "So almost everywhere, that heat just gets dumped into the air or the sea. But Helsinki WANTS
  it." (the heat, the air or the sea: the owner's question) -> "... But Helsinki wants that heat." Or end the line
  before on the heat alone ("Most data centers just blow that heat outside."), and "But Helsinki WANTS it." has one
  thing left to mean. Also "But they've done this before." (who are they? what is this?) -> "But Helsinki has done this
  before."
- **Check.** Script: for each pronoun, count the nouns of the same number in its own and the previous sentence; flag
  more than one, a "they" for a place or a company, and a sentence that opens on "That's", "This is" or "It's" pointing
  at a whole idea ("That's nearly a tenth of the city's heat."). Cold listener: "what did Helsinki want?"; "who has done
  this before?".

### 5. Say the plain, concrete thought itself: who does what, where. Never a hint at a thought, never a vague scope.
- **Why.** The curse of knowledge: people who know something can't think as if they didn't; "Better-informed agents
  are unable to ignore private information even when it is in their interest to do so" (Camerer, Loewenstein and Weber
  1989, [C14]; study). Tappers expected listeners to name 50 % of the songs they tapped; listeners named 2.5 % (3 of
  120) (Newton 1990, reported in the BPS Psychologist's review of Pinker's The Sense of Style, [C15]; study). An
  expert's abstract phrase is them "summarizing the wealth of concrete data in their heads", while the listener hears
  "only opaque phrases" (Chip and Dan Heath, HBR, [C16]; practitioner). That is the owner's "you are having some deeper
  thought here and you choose to be obscure about it": we held the fact lock (Helen's CEO said "almost all other
  countries", with Stockholm and Odense as exceptions), the listener heard "almost everywhere". Concrete wins: across
  four kinds of text, "Concreteness was overwhelmingly the best predictor of overall comprehensibility, interest, and
  recall" (Sadoski, Goetz and Rodriguez 2000, [C13]; study). Name the actor: active voice "makes it clear who should do
  what", and passive sentences "often do not identify who is performing the action" (digital.gov, [P2]; style guide);
  "Go with S-V-O" (Mervin Block, [N4]; practitioner).
- **Draft 1 -> better.** "So almost everywhere, that heat just gets dumped into the air or the sea." (where is "almost
  everywhere"? dumped by whom?) -> "Most data centers just blow that heat outside, into the air or the sea." (The
  owner's own shape: "in a typical datacenter here is what happens".)
- **Check.** Script: flag vague-scope words (almost everywhere, everywhere, many places, most places, some places,
  somewhere, things, stuff), agentless passives ("gets dumped", "is wasted"), and a sentence that carries only a degree
  or a hint ("that hot"). Cold listener: the paraphrase test (finding 6): "say that line in your own words"; if they
  can't say who does what, where, it fails.

### 6. The cold ear decides: one hearing, at feed speed, by people who haven't seen the script, who then say each line back. Never pass a line on a readability score.
- **Why.** Formulas count word and sentence length only: "a big word might be one your readers know, while a short word
  could be one they don't know", and "No score can accurately predict whether an actual person would be able to
  understand your content"; "Promise Money" scored better than "Security Deposit" and upset the very readers it was
  written for (Caroline Jarrett with Ginny Redish, [P4]; practitioner; Redish 2000, [P5]; review). Our own
  Flesch-Kincaid run on draft 1 passes every line the owner failed: "The chips get that hot." grade -1.8, the easiest
  in the script; "But Helsinki WANTS it." 3.7; "So almost everywhere ..." 5.9, the same as the line the owner loved;
  and it rates "And nobody's even making tea." the hardest (7.6) (a scratch script with a simple syllable count: the
  ranking is the point, not the decimals). The writer can't check alone (finding 5): draft 1's critic, reading cold,
  felt line 2 snag ("landed a beat late (I had to re-link it to the question)", `critique_g1.md`) and kept it, because
  the critic could build the bridge. What works: paraphrase testing, one person at a time (digital.gov, [P2]; style
  guide); the first edit by ear, without reading along, because "Listeners only have one chance to hear a story"
  (NPR, [N2]; style guide); Ed Yong's test readers were a fellow blogger's parents ([J4]; practitioner).
- **Draft 1.** Line 2 passed the formula, the writer and the critic, and failed the first regular person who heard it.
- **Check.** Cold listener (this is the check): 2-3 people who haven't seen the script, at least one non-native English
  speaker and one non-tech person; play the take once, at speed, with the captions, as the feed does; then (a) retell
  the story (the playbook's test), (b) line by line, "what did that one say?", (c) the lint's targeted questions
  ("which chips?", "what did Helsinki want?"). A line fails if one listener gets it wrong or says "what?". Script: the
  clarity lint only raises questions; it never passes a line.

### 7. Say it the way you'd tell a friend, in the easiest words: easy lines are liked and believed; hard ones get argued with.
- **Why.** Processing fluency: easier-to-process statements are judged true more often (Reber and Schwarz 1999, [C17];
  study) and liked more (Reber, Schwarz and Winkielman 2004, [C18]; review), across every kind of ease, "phonologically
  simple" language included (Alter and Oppenheimer 2009, [C19]; review). Needlessly complex words made writers seem
  less intelligent, through the same fluency (Oppenheimer 2006, [C20]; study). Jargon's lost fluency raised "motivated
  resistance to persuasion" (Bullock et al. 2019, [J1]; study): confusion makes people argue against us, which is not
  the comment the ENGAGEMENT LAYER wants (an arguable claim works only once it is clear). Experts prefer plain too: "80%
  of people preferred sentences written in clear English", and "the more specialist their knowledge, the greater their
  preference for plain English" (GOV.UK, [P3]; style guide). The broadcast rule: "Write the way you talk"; "Use familiar
  words in familiar combinations" (Mervin Block, [N4]; practitioner); "If you wouldn't say it that way, don't write it
  that way" (NPR, [N1]; style guide); "the vehicle" for "the car": "No one talks like that" (NPR Life Kit, [N3];
  practitioner); conversational is "someone speaking to you as a familiar" (Chris Wodskou, CBC, [N5]; practitioner).
- **Draft 1 -> better.** "Luckily, those chips are water-cooled." -> "Luckily, these computers are cooled with water."
- **Check.** Script: a rare-word check (words outside a list of the few thousand most common English words get a look)
  and RULE #1's AI-tell list. Cold listener: "would you say it like that to a friend?" (RULE #1's read-aloud test).

### 8. Literal words in their everyday sense, for a worldwide ear: no idioms, figurative phrasal verbs, slang or wordplay; the one joke literal and kind.
- **Why.** Second-language listeners compute the literal word meanings first, even in idioms they know (Cieślicka
  2006, [L3]; study), and learners avoid phrasal verbs, the figurative ones most (Liao and Fukuya 2004, [L4]; study).
  Comfortable listening needs about 95-98 % of the words known (Nation 2006, [L1]; van Zeeland and Schmitt 2013, via
  [L2]; studies): in a 115-word script that is 2 to 6 unfamiliar words in all. Global style guides: "Avoid idioms,
  colloquial expressions, and culture-specific references" (Microsoft, [L7]; style guide); avoid phrasal verbs, idioms
  and humor, and "Use words in their primary sense" (Google, [L8]; style guide). Plays on words "can also sound cheesy or
  corny when it's clear they're there for the sake of appearing clever" (Wodskou, CBC, [N5]; practitioner). Captions
  help second-language viewers get the gist (full captions beat none: Montero Perez, Peters and Desmet 2014, [L6];
  study), but a caption shows the same misleading word. The creative brief keeps one joke where documentation guides
  drop humor, so ours is the situation itself, said literally, never irony the listener has to decode.
- **Draft 1 -> better.** "And nobody's even making tea." (irony in three steps: kettles, so tea, but nobody, so waste;
  the owner: "directionally okay, but still weird we need a simpler less scandalous language") -> "All that heat, and
  nobody uses it." (the empty mug in the picture can carry the smile). Also "gets a boost from heat pumps" -> "heat
  pumps make it even hotter"; "gets dumped" -> "blow ... outside".
- **Check.** Script: an idiom and figurative phrasal-verb list (get a boost, get dumped, end up, figure out, turn out,
  run on fumes, ...), flagged for a look. Cold listener: at least one non-native English speaker; ask what each flagged
  phrase means, and whether the joke landed or puzzled.

### 9. One idea per sentence, subject first, its verb right after it.
- **Why.** "It's often said that our ears can only handle one fact or idea per sentence"; "keep subjects cozy with their
  verbs"; dependent clauses "are toxic to radio writing" (NPR, [N1]; style guide); "Limit a sentence to one idea"; "Go
  with S-V-O" (Block, [N4]; practitioner); "keep the main subject and verb as close to the beginning of the sentence as
  possible" (Google, [L8]; style guide). Working memory holds about four chunks (Cowan 2001, [C8]; study), and only the
  clause just heard is held word for word (Jarvella 1971, [C6]; study).
- **Draft 1 -> better.** "So their warm water gets a boost from heat pumps, then runs under the snow, into people's
  radiators." (18 words, three moves, and whose is "their"?) -> "Heat pumps make that warm water even hotter. Then it
  runs in pipes under the snow, into people's radiators." Two full sentences with a subject and a verb each, never
  fragments: RULE #1 and the rhythm rule still hold.
- **Check.** Script: per sentence, the words before the subject (flag more than 3: "So almost everywhere, that heat
  ..."), and the verbs or clauses (flag more than 2), alongside `check_rhythm.py`. Cold listener: does any part of the
  sentence go missing in the retell?

### 10. Old first, new last: start from what the listener already has, and end the sentence on the new or surprising part.
- **Why.** Listeners hang new information on what they already hold (the given-new strategy: Haviland and Clark 1974,
  [C1]; study). "Put the word or words you want to stress at the end of your sentence" (Block, [N4]; practitioner): the
  end is where a speaker, and our TTS, naturally puts the stress, so the new part belongs there.
- **Draft 1 -> better.** "In twenty ten, a data center under a cathedral started heating homes." (the surprise sits in
  the middle; the line ends on "heating homes", which we've heard since line 1) -> "In twenty ten, Helsinki started
  heating homes with a data center ... under a cathedral."
- **Check.** Script: print each sentence's last content word for a reviewer to confirm it is the new part (an unstressed
  pronoun after a stressed verb, as in "Helsinki WANTS it.", is fine when it has one referent: finding 4). Cold
  listener: "which word from that line stuck?": it should be the new one.

### 11. At every turn, say plainly where we are now: which place, which time, whose heat. A signpost names the scene; a stock reveal names nothing.
- **Why.** Audio has no headings, so transitions have to be "explicitly narrated" (NPR, [N1]; style guide); "Prepare
  readers for what to expect" (digital.gov, [P2]; style guide). Second-language students recalled a lecture better with
  macro markers, which show its overall organization, than with micro markers, the fillers and links between sentences
  (Chaudron and Richards 1985, [L9]; study). RULE #1's stock reveal phrases ("Here's the thing", "The catch?") promise
  drama and name nothing: they stay banned.
- **Draft 1 -> better.** "So almost everywhere, that heat just gets dumped into the air or the sea. But Helsinki WANTS
  it." (the film jumps from one cabinet in Helsinki to the whole planet and back, signposted only by "almost
  everywhere") -> "Around the world, most data centers just blow that heat outside. But Helsinki wants to keep that
  heat." Draft 1's "For now, it's a plan." and "But they've done this before." are good signposts once "they" is named.
- **Check.** Script: the spine lists the turns; the first sentence of each turn names its place, time or actor in its
  first few words and never opens on a bare pronoun. Cold listener: at each turn, "where are we now?".

### 12. Numbers by ear: few, round, one per sentence, each tied to an everyday thing; never a sum for the listener.
- **Why.** Numbers "can require your listener to do math, which distracts from your story", and "Listeners can't see the
  numbers, so they are more easily missed, misheard or forgotten" (NPR, [N1]; style guide); "filling a script with too
  many numbers will guarantee your audience will be either lost or zone out" (Wodskou, CBC, [N5]; practitioner). Round
  them: "Accuracy is lost, but acceptably so" (Ed Yong, [J4]; practitioner). Counts ("1 in 10") are understood better
  than percentages and probabilities (natural frequencies: Hoffrage et al. 2000, [L10]; study).
- **Draft 1 (mostly right here) -> better.** The fact lock's "a seventy-two-chip rack draws a hundred and twenty
  kilowatts" became "like FORTY kettles, boiling non-stop": round, everyday, one number. Keep that. Draft 1 speaks five
  numbers in 40 s (seventy thousand, forty, a tenth, twenty ten, twenty twenty-seven), the top of the range: a number
  the story doesn't need goes on the paper tag only (2010, if the cathedral line works without it).
- **Check.** Script: numbers per sentence (flag more than one), numbers per 10 s, unrounded figures (more than two
  significant digits), technical units (kW, MW, GWh, °C, %). Cold listener: "what was the number, and what did it
  mean?".

## The 6 that matter most

1. **Everyday names, no false friends** (finding 1): "computers", never "chips"; "a box the size of a fridge", never
   "a cabinet".
2. **Introduce before you point** (finding 2): "the X", "those X", "that hot" only for what this script already said;
   one new thing per sentence, as the familiar thing it is.
3. **One name per thing** (finding 3): the thread object keeps one everyday name from the first line to the last.
4. **One obvious "it", or say the noun** (finding 4): "But Helsinki wants that heat."
5. **The plain, concrete thought: who does what, where** (finding 5): "Most data centers just blow that heat
   outside", never "almost everywhere it gets dumped".
6. **The cold ear decides, not a score** (finding 6): one hearing with captions, then each line said back; a formula
   passed every line the owner failed.

Why these six: together they explain every line the owner flagged (line 2: findings 1, 2, 3, 5; line 3: 1, 3; line 5:
5, 11; line 6: 4; the "weird" tea line: 8), and the sixth is the only check that catches all of them. Findings 7-12
refine lines that already pass.

## Fit with the rules we already have (for PRINCIPLES.md and RULES_DRAFT.md)

- The playbook's "CLEAR TO A REGULAR PERSON ON ONE HEARING" already says findings 1, 4, 5 and the joke half of 8 in the
  owner's words; this lane grounds them, and adds 2, 3, 6, 10, 11 and 12 as method.
- RULE #1 (sound like a real person) is finding 7's register half; this adds the why (fluency: liked and believed).
- The rhythm rule and `check_rhythm.py` stand: finding 9's splits make full short sentences, never RULE #1's
  "staccato dramatic fragments".
- RULE #1 bans "Here's the thing" and colon reveals; finding 11's signposts name a place, a time or an actor, which is
  information (as in the owner's own "in a typical datacenter here is what happens").
- RULE #1 likes natural hedges ("pretty much", "a bunch of"): common enough to keep; finding 8 removes idioms and
  figurative phrasal verbs; a cold non-native listener settles any doubt.
- "Exaggerating, generalizing and making it bigger are fine": finding 1's "nearest understandable form" is the same
  licence for names (computers for chips, water for liquid, a box the size of a fridge for a rack).
- The ENGAGEMENT LAYER's arguable line must be clear first (finding 7): confusion makes people resist, not comment.
- Two tensions, resolved: the repeated-name penalty says a pronoun is best for the one obvious center, and Google says
  repeat the noun when a pronoun is ambiguous: both hold (finding 4). GOV.UK says explain a term the first time, and
  Bullock et al. found definitions don't restore fluency: describe the familiar thing first, and use the term only if
  the story needs it (finding 2).

## Sources (all opened and checked on 2026-10-29)

**Broadcast and audio writing**
- [N1] Alison MacAdam, NPR Training, "The journey from print to radio storytelling: a guide for navigating a new
  landscape" (2017; re-posted 2025):
  https://www.npr.org/sections/npr-training/2025/05/30/g-s1-65814/the-journey-from-print-to-radio-storytelling-a-guide-for-navigating-a-new-landscape
  Style guide.
- [N2] Alison MacAdam, NPR Training, "How to edit with your ears":
  https://www.npr.org/sections/npr-training/2025/05/28/g-s1-67202/how-to-edit-with-your-ears Style guide.
- [N3] Abē Levine with Marielle Segarra, NPR Life Kit, "Need to write a toast or a script? Here are 7 tips" (2023):
  https://www.npr.org/2023/02/17/1156597697/how-to-write-script-speech-podcast-voice Practitioner.
- [N4] Mervin Block, top tips, from Writing Broadcast News: Shorter, Sharper, Stronger (2nd ed., 1998):
  https://highered.mheducation.com/sites/0073511935/student_view0/nrw_plus/chapter9/top_tips_of_the_trade.html
  Practitioner (the standard broadcast-writing text).
- [N5] Chris Wodskou, CBC Radio, "The craft of writing for radio: 16 tips from a veteran script-writer" (2016):
  https://www.cbc.ca/radio/docproject/blog/the-craft-of-writing-for-radio-16-tips-from-a-veteran-script-writer-1.3562474
  Practitioner.

**Cognitive science of listening and reading**
- [C1] Haviland and Clark 1974, "What's new? Acquiring new information as a process in comprehension", Journal of
  Verbal Learning and Verbal Behavior 13: 512-521, https://doi.org/10.1016/S0022-5371(74)80003-4 ; the authors' PDF:
  https://web.stanford.edu/~clark/1970s/Haviland,%20S.E.%20_%20Clark,%20H.H.%20_What's%20new_%20Acquiring%20new%20information%20as%20a%20process%20in%20comprehension_%201974.pdf
  Study.
- [C3] Gordon, Grosz and Gilliom 1993, "Pronouns, names, and the centering of attention in discourse", Cognitive
  Science 17: 311-347, https://doi.org/10.1207/s15516709cog1703_1 Study.
- [C4] Arnold, Eisenband, Brown-Schmidt and Trueswell 2000, "The rapid use of gender information: evidence of the time
  course of pronoun resolution from eyetracking", Cognition 76: B13-B26, https://pubmed.ncbi.nlm.nih.gov/10822045/
  Study (listeners).
- [C5] Peters, Boiteau and Almor 2016, "Semantic relations cause interference in spoken language comprehension when
  using repeated definite references, not pronouns", Frontiers in Psychology, https://doi.org/10.3389/fpsyg.2016.00214
  Study (listeners).
- [C6] Jarvella 1971, "Syntactic processing of connected speech", JVLVB 10: 409-416,
  https://doi.org/10.1016/S0022-5371(71)80040-3 Study (listeners).
- [C7] Sachs 1967, "Recognition memory for syntactic and semantic aspects of connected discourse", Perception &
  Psychophysics 2: 437-442, https://doi.org/10.3758/BF03208784 ; both classics as summed up by later work (meaning is
  kept past the sentence boundary, wording mainly for the latest constituent), e.g. Schweppe, Rummer and Fürstenberg
  2009, Memory & Cognition 37: 73-80, https://doi.org/10.3758/MC.37.1.73 ; qualified by Gurevich, Johnson and Goldberg
  2010, Language and Cognition 2: 45-78, https://doi.org/10.1515/langcog.2010.003 Studies.
- [C8] Cowan 2001, "The magical number 4 in short-term memory", Behavioral and Brain Sciences 24: 87-114,
  https://doi.org/10.1017/S0140525X01003922 Study (review).
- [C9] Christianson, Hollingworth, Halliwell and Ferreira 2001, "Thematic roles assigned along the garden path
  linger", Cognitive Psychology 42: 368-407,
  https://ferreiralab.faculty.ucdavis.edu/wp-content/uploads/sites/222/2015/05/Christianson-et-al.-2001_LingeringInterpretationsGP_Cog-Psych.pdf
  Study.
- [C10] Leinenger and Rayner 2013, "Eye movements while reading biased homographs", Journal of Cognitive Psychology 25:
  665-681, https://pubmed.ncbi.nlm.nih.gov/24073328/ Study. (Background: Duffy, Morris and Rayner 1988, Journal of
  Memory and Language 27: 429-446, https://doi.org/10.1016/0749-596X(88)90066-6 .)
- [C11] Wiley, George and Rayner 2016, "Baseball fans don't like lumpy batters: influence of domain knowledge on the
  access of subordinate meanings", Quarterly Journal of Experimental Psychology, https://pubmed.ncbi.nlm.nih.gov/27767384/
  Study.
- [C13] Sadoski, Goetz and Rodriguez 2000, "Engaging texts: effects of concreteness on comprehensibility, interest, and
  recall in four text types", Journal of Educational Psychology 92: 85-95, https://doi.org/10.1037/0022-0663.92.1.85 ;
  abstract https://eric.ed.gov/?id=EJ619358 Study.
- [C14] Camerer, Loewenstein and Weber 1989, "The curse of knowledge in economic settings: an experimental analysis",
  Journal of Political Economy 97: 1232-1254, https://doi.org/10.1086/261651 Study.
- [C15] Newton 1990 (Stanford PhD), the tapping study, reported in the BPS Psychologist's review of Pinker's The Sense of
  Style: https://www.bps.org.uk/psychologist/cursed-knowledge Study (reported) and practitioner (Pinker).
- [C16] Chip Heath and Dan Heath, "The Curse of Knowledge", Harvard Business Review, Dec 2006:
  https://hbr.org/2006/12/the-curse-of-knowledge Practitioner.
- [C17] Reber and Schwarz 1999, "Effects of perceptual fluency on judgments of truth", Consciousness and Cognition 8:
  338-342, https://pubmed.ncbi.nlm.nih.gov/10487787/ Study.
- [C18] Reber, Schwarz and Winkielman 2004, "Processing fluency and aesthetic pleasure", Personality and Social
  Psychology Review 8: 364-382, https://doi.org/10.1207/s15327957pspr0804_3 Study (review).
- [C19] Alter and Oppenheimer 2009, "Uniting the tribes of fluency to form a metacognitive nation", Personality and
  Social Psychology Review 13: 219-235, https://pubmed.ncbi.nlm.nih.gov/19638628/ Study (review).
- [C20] Oppenheimer 2006, "Consequences of erudite vernacular utilized irrespective of necessity: problems with using
  long words needlessly", Applied Cognitive Psychology 20: 139-156, https://doi.org/10.1002/acp.1178 Study.

**Plain language and readability**
- [P1] ISO 24495-1:2023, Plain language, Part 1: governing principles and guidelines:
  https://www.iso.org/standard/78907.html (scope: https://committee.iso.org/standard/78907.html ); the definition it
  builds on, as quoted by PLAIN: "A communication is in plain language if its wording, structure, and design are so
  clear that the intended audience can easily find what they need, understand what they find, and use that
  information" (https://plainlanguage.com/what-is-plain-language/ ). Standard. (iplfederation.org now serves a gambling
  site: never cite it.)
- [P2] digital.gov plain language guides (the successor of plainlanguage.gov): principles
  https://digital.gov/guides/plain-language/principles , writing https://digital.gov/guides/plain-language/writing ,
  testing https://digital.gov/guides/plain-language/test Style guide (US government).
- [P3] GOV.UK, "Use clear language":
  https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ Style guide
  (UK government).
- [P4] Caroline Jarrett with Ginny Redish, "Readability formulas: seven reasons to avoid them and what to do instead":
  https://www.effortmark.co.uk/readability-formulas-seven-reasons-to-avoid-them-and-what-to-do-instead/ Practitioner.
- [P5] Redish 2000, "Readability formulas have even more limitations than Klare discusses", ACM Journal of Computer
  Documentation 24(3): 132-137, https://doi.org/10.1145/344599.344637 Study (review).

**Jargon and science writing**
- [J1] Bullock, Colón Amill, Shulman and Dixon 2019, "Jargon as a barrier to effective science communication: evidence
  from metacognitive judgments", Public Understanding of Science, https://doi.org/10.1177/0963662519865687 ; PDF
  https://comm.osu.edu/sites/comm.osu.edu/files/PUS%202019-%20Bullock%20et%20al..pdf (definitions: F(1, 636) = 0.37,
  p = .543). Study. Also Shulman, Dixon, Bullock and Colón Amill 2020, Journal of Language and Social Psychology 39:
  579-597, https://doi.org/10.1177/0261927X20902177 Study.
- [J2] Somerville and Hassol 2011, "Communicating the science of climate change", Physics Today 64(10): 48-53,
  https://doi.org/10.1063/PT.3.1296 ; its table as quoted by the Yale Environment Review:
  https://environment-review.yale.edu/node/3381 Practitioner.
- [J3] Rakedzon, Segev, Chapnik, Yosef and Baram-Tsabari 2017, "Automatic jargon identifier for scientists engaging with
  the public and science communication educators", PLOS ONE 12: e0181742, https://pubmed.ncbi.nlm.nih.gov/28792945/
  Study.
- [J4] Ed Yong, "On jargon, and why it matters in science writing", National Geographic (Phenomena), 2010:
  https://www.nationalgeographic.com/science/article/on-jargon-and-why-it-matters-in-science-writing Practitioner.

**Non-native listeners and global style**
- [L1] Nation 2006, "How large a vocabulary is needed for reading and listening?", Canadian Modern Language Review:
  https://eric.ed.gov/?id=EJ750537 Study.
- [L2] Schmitt, Cobb, Horst and Schmitt 2017, on replicating van Zeeland and Schmitt (2012/2013) and Nation (2006),
  Language Teaching: https://eric.ed.gov/?id=EJ1139942 Study.
- [L3] Cieślicka 2006, "Literal salience in on-line processing of idiomatic expressions by second language learners",
  Second Language Research 22: 115-144, https://doi.org/10.1191/0267658306sr263oa Study.
- [L4] Liao and Fukuya 2004, "Avoidance of phrasal verbs: the case of Chinese learners of English", Language Learning:
  https://eric.ed.gov/?id=EJ686952 Study.
- [L5] Griffiths 1990, "Speech rate and NNS comprehension: a preliminary study in time-benefit analysis", Language
  Learning: https://eric.ed.gov/?id=EJ415102 Study.
- [L6] Montero Perez, Peters and Desmet 2014, "Is less more? Effectiveness and perceived usefulness of keyword and full
  captioned video for L2 listening comprehension", ReCALL: https://eric.ed.gov/?id=EJ1020100 Study.
- [L7] Microsoft Style Guide, global communications, writing tips:
  https://learn.microsoft.com/en-us/style-guide/global-communications/writing-tips Style guide.
- [L8] Google developer documentation style guide, "Write for a global audience":
  https://developers.google.com/style/translation Style guide.
- [L9] Chaudron and Richards 1985, "The effect of discourse markers on the comprehension of lectures":
  https://eric.ed.gov/?id=ED259565 Study.
- [L10] Hoffrage, Lindsey, Hertwig and Gigerenzer 2000, "Communicating statistical information", Science 290:
  2261-2262, https://pubmed.ncbi.nlm.nih.gov/11188724/ Study.

# v4 G1 critique (critic, 2026-10-29)

Lean G1, part A of `CRITIC_BRIEF.md`: the cold retell first, then at most 6 findings, then the verdict. Judged: the
paste `script_elevenlabs.md` (hook option 1, 121 words), `script_g1.md` and `../THROUGHLINE.md` as the writer left them.
FL = `video/docs/v5/research/factlock.md`. Status: **DONE. Verdict: FIX AND SEND** (0 blockers, 2 majors, 3 minors).

## Cold retell

Written after one hearing of the spoken words in `script_elevenlabs.md` (tags skipped), before reading the brief,
the notes, the fact file or `script_g1.md`, and without looking back at the script.

> Helsinki is planning to use the heat from AI chips to warm about seventy thousand homes. Those chips run crazy
> hot (one cabinet is like forty kettles boiling non-stop), and almost everywhere that heat just gets dumped into the
> air or the sea. Because the chips are water-cooled, Helsinki can take the warm water, boost it with heat pumps and
> pipe it under the snow into people's radiators, nearly a tenth of the city's heat, though for now it's only a plan.
> And they've done it before: back in 2010 a data center in a bomb shelter under a cathedral started heating homes, so
> from 2027 your chatbot could be heating a flat in Helsinki.

First-listen notes (what stuck, what slipped, before any checking):
- Stuck: Helsinki + AI heat + homes; forty kettles; dumped into air/sea; bomb shelter under a cathedral; "your chatbot
  could heat a flat".
- Slipped or snagged: "The chips get that hot." landed a beat late (I had to re-link it to the question); "Luckily,
  those chips are water-cooled" felt like a gear change I had to take on trust; "It's all still a plan" deflated the
  build right at the peak; "twenty twenty-seven" arrived only in the last line, with no earlier set-up; the 2010
  sentence stacks three places (data center, bomb shelter, cathedral) in one breath.

**Judgement: ONE STORY, not a list.** One thing (Helsinki's AI heat), each beat deeper and joined by cause: what (the
plan), why it matters (the heat is huge and thrown away elsewhere), how (water, heat pumps, pipes), how much (a tenth),
the honest floor (a plan), the twist (done before, under a cathedral), what it means for you (your chatbot, 2027). Nearly
every line survived one hearing. Two soft spots it shows: the floor shrank to a "though, for now" (finding 3), and the
twist's picture is the one that stuck hardest, which is the problem in finding 1. The snags at lines 2 and 7 were paid
off by the next line each time, and the late "twenty twenty-seven" lands as the "later" once line 10 says "for now"
(finding 3): noted, no finding of their own.

## The brief's tests (part A, 2-6)

- **Ad or news? NEWS.** "Did you know Helsinki wants AI to heat seventy thousand homes?" with frame 0's dark snowy street
  lighting up is a friend's surprising news: a city, a number, an odd pairing; no company, product, price or ask in the
  line or frame 0 (the cabinet has no logo). The payoff in words: "AI" ~1.9 s, "heat" ~2.6 s, "homes" ~3.6 s, in the
  voice's order; the owner's model opener (Big Bend) runs longer.
- **One subject, gone deep: PASS, with one leak.** The one thing in 3 words: Helsinki's AI heat. Places: one home place
  (the snowy street and its harbour view), one comparison shot (line 5's Earth's curve), plus the card's shelter
  interior at S5, a second place beside the comparison (finding 1). Every line is about the one thing. Distinct from
  video 5 in subject, not in its twist (finding 1).
- **Flow: PASS.** Every join is a but / so / because (line 4's "And" is the joke's "and yet"; line 7's "Luckily" is an
  "and it can, because" that line 8 pays off at once); the turn "But Helsinki WANTS it." at ~16 s; the payoff is the
  last line and lands the core line; ~42 s (121 words; 117 after finding 1), inside 30-45 s, ending on the payoff.
- **Facts: PASS, no floor breach.** Every number, name and date against FL: seventy thousand homes (6.5: flats, the full
  plant, a round-up the file allows), forty kettles (2.2: 3 kW, est.), "almost everywhere ... the air or the sea" (7.1,
  his view rounded up; no city named, so the "Stockholm wastes its heat" floor is untouched), water-cooled (2.2, 2.7,
  6.3), the heat pumps and the pipes (6.3, 6.1), nearly a tenth (6.6: 8.8 %), a plan (6.7), done before (6.9: since
  2010), the 2010 shelter under a cathedral (6.10: "in 2010", never "still"), from 2027 (6.7), "your chatbot could heat
  a flat in Helsinki" (FL's own comment-drawing line). No quote is voiced, no company named. No web search was needed.
- **Language and rules: PASS, with notes.** No AI tells found (no stock reveal, contrast template, "imagine",
  em-dash or semicolon; line 8's three steps are a process, not a list); a short sentence after every 1-2 long ones; a
  full cue per line in the table, 6 short tags in the paste (format v2); one joke that lands (line 4); two comment lines,
  tagged and defensible (lines 5, 13); positive mood except line 10 (finding 3); three hook options in the brief's
  families, all true (option 3: finding 5); the card has one thread, one home place, one "you" (POV at line 13), Pip
  hidden, a carrier for every join from the script's own joins (A x3, B x1, C x9, no F), but its thread is a glow
  (finding 2) and S5 a second place (finding 1).
- **Checks (run by the critic on the paste as it stands):**
  `python3 video/scripts/voice/check_rhythm.py video/docs/v4/script/script_elevenlabs.md`: "13 sentences, 6 short
  (<= 5 words, 46%), 6 long (>= 9 words)" / **"OK: long sentences are broken up by short ones"**.
  `python3 video/scripts/voice/check_paste.py video/docs/v4/script/script_elevenlabs.md`: "121 words, 744 characters,
  6 tags (5.0 per 100 words); expected about 43 s, max 56 s" / **"OK: paste-safe"**, no warnings.
  With findings 1 and 3 applied (scratch copy): rhythm OK (13 sentences, 6 short); paste OK, 117 words, about 42 s.
- **The writer's open questions:** "they've" (line 11) did not snag on the cold listen: keep it. The coal stays out of
  the voice: agreed (the join after the radiators is weaker). The reserve cuts stand.

## Findings (ranked)

### 1. MAJOR: line 12 and the card's S5 give away video 5's twist, in video 5's picture
- **Line:** "In twenty ten, a data center in a bomb shelter, under a cathedral, started heating homes." With its picture
  (`script_g1.md` row 12; `THROUGHLINE.md` S5): "Push down through the rock under the cathedral into a wartime shelter:
  rows of servers, warm".
- **Problem:** video 5's subject is a data centre in a shelter under a park and its twist is "the bunker warms the
  homes above it" (`v5/script/WRITER_BRIEF.md`; its frame-0 draft "drops 30 m through the granite to a blast door and a
  hall of glowing servers", `v5/G0_TOPIC.md`), so this line and S5 say and show that twist first, while S5's interior is
  a second place beside the comparison shot (CRAFT §a.2) and the line stacks three places in one 16-word breath.
- **Fix:** the line becomes **"In twenty ten, a data center under a cathedral started heating homes."** (12 words; FL
  6.10: the data centre sat in a shelter cut into the rock under Uspenski Cathedral, due online Jan 2010, its heat for
  homes; FL's safe wording without "in a wartime shelter", no new claim; "in 2010", never "still"). S5 stays inside the
  home view: line 11's pan ends close on the red-brick cathedral with gold domes; on "In twenty ten" the rock under it
  opens like the street's cross-section (the film's own below-the-snow language): a small room, a few old racks, the
  2010 tag, a thin warm pipe climbing into a few nearby windows. No blast door, no hall of servers, no push into an
  interior: the L11 -> L12 carrier becomes C (a push inside the view); L12 -> L13 stays A (into one of those windows, out
  of the one warm window). Update the place count, S5's line and the joins table in `THROUGHLINE.md`, and the word count
  and times in `script_g1.md` (117 words: about 41 s at the v2/v3 pace, more room for the new voice).
  If the owner wants "bomb shelter" voiced, keep the old line but still make the picture change, and tell video 5's
  writer what v4 says before v5's G1.

### 2. MAJOR: the thread is a symbolic glow, which DIRECTION and CRAFT forbid
- **Where:** `THROUGHLINE.md` §1.2, "the heat, drawn as one warm glow (an ember-orange light about a fist on screen
  ...)", and its glow states (L2 "glows orange-hot in the chips", L10 "shrinks to a spark", L12 "an older, smaller
  glow", S2 and the L5 -> L6 carrier "into Helsinki's glow"; 15 "glow"s in the card); `script_g1.md`'s frame-0 and
  first-second-sound bullets ("a small warm glow (the thread) lights at the pipe's far end"; the cabinet "glowing hot
  orange like a stove") and the Picture column of rows 1, 2, 5, 6, 8, 10 and 12. The writer took it from
  `WRITER_BRIEF.md` ("thread: the heat as one warm glow").
- **Problem:** DIRECTION rule 5, which outranks the card and the brief, shows light "on what it hits (never glow discs
  ...)", CRAFT §d.7 says "No symbolic glow", and CRAFT §a.1 asks for a thread OBJECT (v3: a price tag); a fist-sized
  floating light that stands for heat is a symbolic glow disc, and G3 would have to replace it after the owner approved
  the card.
- **Fix:** the thread is **the warm water, a drawn thing**: an orange ribbon of water in the cut-open pipe (blue where
  it runs cool), a curl of steam where the heat meets the air, in flat lit and shade tones; its warmth shown on what it
  reaches (the radiator's fins, the lit window pane: lit panes are allowed, CRAFT §d.9). Every beat keeps its reaction,
  renamed: L1 warm water starts to run in the dark pipe at ~0.4 s (the ding) and reaches the one window, which lights,
  then the city's windows; L2 the cabinet's coolant pipes run orange; L3-L4 the kettles' steam; L5 the steam plumes on
  the curve fade, Helsinki's lit harbour stays (L5 -> L6: A, a push into Helsinki's lit windows); L6 its plume bends
  down into the pipe; L7 blue in, orange out; L8 orange to gold at the heat pump, into the radiator; L9 one window in
  ten lights; L10 the pipe stops at the plan's pale edge, its water still; L12 the thin old pipe (finding 1); L13 and
  the loop: the one lit window (B, same spot and size). The thread's screen time does not change. Note the clash on
  `WRITER_BRIEF.md` so the next brief doesn't repeat it (CLAUDE.md: a clash is a bug).

### 3. MINOR: line 10, "It's all still a plan.", takes the build back at its peak
- **Problem:** "all" retracts lines 6-9 at ~29 s, the one downbeat in a positive film; my cold retell said it the way a
  friend would, "though for now it's only a plan".
- **Fix:** **"For now, it's a plan."** (5 words, still a short one; FL 6.7: "Everything about it is a plan"; the
  writer's own alternative wording). The floor still holds with line 1's "wants" and line 13's "from twenty
  twenty-seven ... could", and line 11's "But they've done this before." still answers it. Both checks OK.

### 4. MINOR: line 13 says "flat" in an American voice
- **Problem:** v4's voice is now known ("Lady1": female, young, American English, `docs/voice/VOICE.md`), and an
  American friend says "apartment" (CREATIVE_BRIEF §14-17; RULE #1: would a normal person say these exact words?);
  the opener study's American rendering of this core line already says "an apartment" (OPENERS, Summary).
- **Fix:** **"So from twenty twenty-seven, your chatbot could heat an apartment in Helsinki."** (12 words; FL 6.5:
  Helen "around 70,000 flats", OnZero "approximately 70,000 apartment homes"); cover: YOUR CHATBOT COULD HEAT AN
  APARTMENT IN HELSINKI. The owner's call: send "apartment" as the voiced default and "flat" as the alternative ("a
  home" would make "homes" three times, with lines 1 and 12). Both checks OK.

### 5. MINOR: hook option 3 is heard as a question answered at once
- **Problem:** "Why does this city want AI to heat seventy thousand homes? The chips get that hot." plays, heard cold, as
  a question and its answer back to back (RULE #1: self-answered rhetorical questions), and the answer fits "how", not
  "why".
- **Fix:** for option 3 only, lines 2 and 3 become one line that deepens instead of answering: "Why does this city want
  AI to heat seventy thousand homes? One cabinet of AI chips is like FORTY kettles, boiling non-stop." then "And
  nobody's even making tea." (FL 2.2; 113 words with findings 1 and 3, both checks OK as its own paste); the why is then
  answered by lines 5-9 (thrown away everywhere, caught here). Options 1 and 2 stand as they are.

## Verdict: FIX AND SEND

The spine passes both tests that would force a rewrite: the cold retell comes out as one story, and the film is one
subject in one place, gone deep. The facts hold to the floor. The fix pass needs two changed lines (findings 1 and 3),
two card changes (S5 inside the home view; the thread as warm water), and the owner's two calls (apartment or flat;
option 3's own second line if picked).

# Video 4, G1 script: "Your chatbot could heat a flat in Helsinki"

Written 2026-10-29 by the G1 writer (lean G1: one writer, one critic, one fix pass; `docs/PIPELINE_V2.md`), from
`WRITER_BRIEF.md`. Not owner-approved yet. Facts: `video/docs/v5/research/factlock.md` (FL below; the one fact file for
videos 4 and 5); every spoken claim is in the fact table at the end. Card: `../THROUGHLINE.md`. Paste:
`script_elevenlabs.md` (hook option 1 voiced). Status: **DRAFT DONE, both checks OK; next: the critic
(`CRITIC_BRIEF.md` part A), then the fix pass (part B).**

- **Core line (the payoff, the last line):** "Your chatbot could heat a flat in Helsinki." (the brief's default; pick 1
  of the three below). Spoken as "So from twenty twenty-seven, your chatbot could heat a flat in Helsinki." It is the
  cover's title (YOUR CHATBOT COULD HEAT A FLAT IN HELSINKI), never a title over the captions.
- **The other two core lines** (the owner may swap; the script lands any of them, since each is said in it):
  2. "Helsinki wants AI to heat seventy thousand homes." (the news itself; line 1 without "Did you know"; as a cover:
     HELSINKI WANTS AI TO HEAT 70,000 HOMES). Plainer, a headline, no "you".
  3. "Almost everywhere, AI's heat is thrown away. Helsinki wants it." (the turn as the line: lines 5-6; the biggest
     "that's good" feeling, but two sentences, and a cover needs one).
  Why 1: plain, personal and positive, the one line with "you" in it, true enough as a plan ("could", "from 2027"),
  and the fact lock's own comment-drawing line ("finally, a use for my chatbot"; "mine runs in Virginia").
- **One subject, in 3 words: Helsinki's AI heat.** Places: ONE home place (a snowy Helsinki street with one warm window,
  seen with its view down to the harbour: the red-brick cathedral on its rock across the water, the plant's pale plan at
  the city's edge; above and below the snow) and ONE comparison shot (line 5: the rise to the Earth's curve, where heat
  rises off data centers everywhere else). The bomb shelter under the cathedral is in that same view, one sentence
  (line 12), the twist; never a bunker tour, never Stockholm (video 5's subject is never mentioned).
- **Frame-0 on-screen text:** the first spoken line as the captions, popping in the voice's order: DID YOU KNOW
  HELSINKI WANTS AI TO HEAT 70,000 HOMES? No title over them (playbook, Hook and pacing). No company in line 1 or frame 0
  (no company is named anywhere in the voice).
- **Frame-0 picture (one continuous shot; the expected thing, then reality overtaking it):** the home place drawn on in
  the clean pen, big and bold (the subject's shapes first, then the colour floods in over them, ~0.6 s, with the pen tip
  visible): a snowy Helsinki street at dusk, one apartment block with ONE big window, dark and cold; the street cut open
  below the snow like a poster's cross-section, one dark pipe running under it; far off across the harbour, the
  red-brick cathedral with gold domes on its rock (it waits for the twist). The expected: a dark, freezing winter
  evening. At ~0.4 s a small warm glow (the thread) lights at the pipe's far end, by the harbour, with our own soft
  "ding". On "AI" (~1.9 s) its source draws on there: one tall cabinet of chips glowing hot orange like a stove, inside a
  building that is only a pale pencil plan (it isn't built: FL 6.7). On "heat seventy thousand homes" (~2.6-3.6 s) the
  glow runs along the pipe under the snow and up into the one window, which floods warm gold, then window after window
  down the street and across the city lights up warm in a ripple: reality overtaking the cold, through the real
  mechanism (heat carried by water under the street). Never still; the payoff is in the picture by ~2.5 s.
- **First-second sound:** a soft positive "ding" at ~0.4 s as the glow lights (our own sound, never a platform's;
  playbook, Music and sound).
- **Word count (spoken):** 121 (`check_paste.py`, which splits "non-stop", "water-cooled" and "twenty-seven"); 118 by
  `check_rhythm.py`'s count.
- **Estimated length:** about 42.3 s at the measured pace of the v2 and v3 API takes (~2.87 words a second: v2's 112
  words ended at 39.08 s), the 0.12 s lead included, plus ~0.5 s of room tone after the last word; `check_paste.py`
  says about 43 s at its 2.8 words a second (max 56 s: a take longer than that went wrong). Inside 30-45 s. If the take
  runs over ~44 s, the reserve cuts are in "Notes for the fix pass".
- **Spoken numbers:** seventy thousand, forty, a tenth, twenty ten, twenty twenty-seven. On screen only (paper in the
  place, few and big): 70,000 (the captions), ≈ 40, 1 IN 10, FROM 2027, 2010. No megawatts, no company names, no logos.
- **Rhythm:** 13 sentences, 6 of them short (46 %), never more than two long ones in a row; every short one is a real
  sentence with a subject and a verb.

## Spines

Drafted before any line, as the G1 bullet asks: three spines, each with its throughline question, the viewer's
situation, the beats joined by but / so / because, the turn and the payoff that lands the core line. The fix pass
continues from these notes.

**The viewer's situation (all three):** you ask a chatbot things every day and never think about where its heat goes;
it is the start of the heating season (late October), cold outside wherever you are; you know Helsinki only as a
snowy northern capital.

### Spine 1, "everyone else throws it away" (PICKED)
- **Throughline question:** how could AI heat seventy thousand homes in Helsinki, and what does your chatbot have to do
  with it?
- **Beats:** Helsinki wants AI to heat 70,000 homes, BECAUSE the chips get that hot (one cabinet is like forty kettles,
  boiling non-stop), BUT nobody uses that heat (the joke: nobody's even making tea), SO almost everywhere it gets dumped
  into the air or the sea. BUT Helsinki wants it (THE TURN), BECAUSE those chips are water-cooled, SO their warm water
  gets a boost from heat pumps and runs under the snow into people's radiators, WHICH MEANS nearly a tenth of the
  city's heat. BUT it's all still a plan; BUT they've done this before: in 2010, a data center in a bomb shelter, under
  a cathedral, started heating homes (THE TWIST). SO from 2027, your chatbot could heat a flat in Helsinki (THE PAYOFF,
  the core line).
- **Depth, Big Bend style (one thing, each line deeper):** what it is (the plan, line 1), how hot (2-4), why it's
  worth catching (5), the turn (6), how it works (7-8), how much (9), the honest floor (10), the twist (11-12), what it
  means for you (13).

### Spine 2, the twist as the turn
- **Throughline question:** the same.
- **Beats:** Helsinki wants AI to heat 70,000 homes, BECAUSE the chips get that hot (forty kettles), SO almost
  everywhere that heat is dumped; BUT Helsinki has caught it for years: in 2010 a data center in a bomb shelter under a
  cathedral started heating homes (TURN and TWIST at ~15-20 s); SO now it wants a huge one: water-cooled chips, heat
  pumps, pipes under the snow, nearly a tenth of the city's heat; BUT it's still a plan; SO from 2027 your chatbot could
  heat a flat in Helsinki.
- **Why not:** it spends the strangest picture mid-film, so the second half is mechanism and numbers with nothing left
  to surprise; "data center" is said twice in the first 20 s; and the shelter gets more weight and screen time, which
  pulls toward video 5's bunker (the critic's distinctness test).

### Spine 3, you first ("Where does your chatbot's heat go?")
- **Throughline question:** where does the heat from your chatbot go?
- **Beats:** "Did you know your chatbot could heat a flat in Helsinki?" (the core line as the opener), BECAUSE the chips
  behind it get as hot as forty kettles; BUT almost everywhere that heat is dumped; SO Helsinki wants to catch it
  (water, heat pumps, pipes; 70,000 flats); BUT it's a plan; BUT it's done it before (the shelter under the cathedral);
  SO ... the end needs a new landing.
- **Why not:** it spends the payoff in the first second (OPENERS scores it 7.7, against 8.0+ for a place-first line);
  the one subject (Helsinki) arrives at the end of line 1 instead of at its start; the end would have to echo the
  opening (RULE #1: "mic-drop endings that echo the opening too neatly"); and a first line about the viewer's own thing
  edges toward v3's "Buying a laptop soon?" shape (playbook, never baity).

### The pick and why
**Spine 1.** It follows the playbook's depth order (what, how, why, the twist, what it means for you) with every join a
but, so or because; its turn ("But Helsinki wants it.") is the film's feeling, waste turning into warmth, at ~16 s; the
twist lands late, where the brief puts it, and does story work: it answers the honest doubt ("it's all still a plan")
with proof from the weirdest place in town, so the payoff follows as a "so", not an "and also". It keeps the shelter
to one sentence (distinct from video 5) and ends on the core line.

## The story in 3 sentences

Helsinki wants AI to heat seventy thousand homes, because AI chips get so hot that one cabinet of them is like forty
kettles boiling non-stop, and almost everywhere that heat just gets dumped into the air or the sea. Helsinki wants it
instead: the chips are water-cooled, so their warm water can get a boost from heat pumps and run under the snow into
people's radiators, nearly a tenth of the city's heat. It's all still a plan, but Helsinki has done this before (in
2010, a data center in a bomb shelter under a cathedral started heating homes), so from 2027 your chatbot could heat a
flat in Helsinki.

- **Throughline question:** "How could AI heat seventy thousand homes in Helsinki, and what does my chatbot have to do
  with it?" Line 1 opens it; lines 2-5 sharpen it (the heat is huge, and almost everywhere it's thrown away); line 6
  turns it; lines 7-9 answer how and how much; lines 10-12 test it (a plan, but proven, under a cathedral); line 13
  closes it.
- **The turn (line 6): "But Helsinki WANTS it."** Everything before it is heat being wasted; everything after it is
  heat being kept.
- **The twist (lines 11-12):** Helsinki has already done this, in 2010, from a data center in a wartime bomb shelter
  under a cathedral. It changes "nice plan" into "they know it works", and it is the film's weirdest picture.
- **The one joke (line 4): "And nobody's even making tea."** Forty kettles boiling non-stop, and not one cup of tea:
  the waste, said as a dry aside. It also does story work: it sets up "so almost everywhere, that heat just gets
  dumped".
- **Ad or news?** News: a friend's "did you know" about a city (what's happening), then why it works and why it
  matters (the waste, the homes, your chatbot). No product, no company, no ask, no price.
- **Cold retell (the writer's own, for the critic to beat):** Helsinki wants to heat 70,000 homes with the heat from AI
  chips, which run so hot that one cabinet is like forty boiling kettles, and almost everywhere that heat gets dumped.
  Helsinki wants it: the chips are water-cooled, so the warm water gets boosted and piped under the snow into
  radiators, about a tenth of the city's heat. It's still a plan, but they did it before, from a bomb shelter under a
  cathedral in 2010, so from 2027 your chatbot could heat a flat in Helsinki.

## The script (hook option 1, as voiced)

Times: the estimated first word of each line at ~2.87 words a second with the 0.12 s lead (the G2 take sets the real
clock). The cue column is the full delivery cue the owner asked for; the paste carries only its 6 short tags
(`docs/ELEVENLABS.md` §1, format v2).

| # | t (s) | How it follows | Delivery cue | Line | Picture | Fact |
|---|---|---|---|---|---|---|
| 1 | 0.12 | (first) | Bright and curious, quick and friendly (~175 wpm), like news you just read and can't wait to share; a small lift on "AI", "seventy thousand homes" clean. DON'T sell it, no trailer voice, no news-anchor drop. | Did you know Helsinki wants AI to heat seventy thousand homes? | **FRAME 0** (above): the snowy street drawn on, the glow lights with the ding (~0.4 s), the cabinet glows on "AI", the one window and then the city's windows light warm on "heat seventy thousand homes". | FL 6.1, 6.5, 6.7: a signed plan for a plant that isn't built ("wants"); 70,000 = the companies' conversion, flats, at full size; "AI to heat" = the heat of an AI data center (a round-up the owner allows). |
| 2 | 3.95 | because (how can AI heat a home?) | Plain and a touch amazed, a little quicker, stating the wild part matter-of-factly; a light lean on "that hot". DON'T make it a punchline. | The chips get that hot. | The camera glides along the pipe to the cabinet: its chips glow orange-hot, heat shimmering off it into the snowy air. | FL 2.1 (IEA: "Effectively all the electricity consumed by a data centre's IT equipment is converted into heat"), 2.2. "That hot" means that much heat, not a higher temperature (FL 2.3's note). |
| 3 | 5.69 | how hot | Leaning in, a notch slower on "FORTY kettles", letting them picture it; "boiling non-stop" easy, a little amused. DON'T gasp on the number. | One cabinet of them is like forty kettles, boiling non-stop. | Forty kettles draw on in rows around the cabinet, all boiling at once, steam rising into the dusk; a paper tag swings on: ≈ 40. | FL 2.2 (Nvidia's 72-chip rack: 120 kW; forty 3 kW kettles is our arithmetic, est.; the kettle in the post's text: "a 3 kW kettle"). "Is like" = gives off as much heat as (FL's safe wording, shortened). |
| 4 | 9.53 | but (all that boiling, and nobody uses it) **THE ONE JOKE** | Deadpan and dry, a hair slower, a half-smile you can hear. DON'T wink or wait for the laugh. | And nobody's even making tea. | One empty mug waits on top of the cabinet in the steam. Nobody comes for it. | No claim: a joke about the situation. |
| 5 | 11.27 | so (nobody uses it, so it's dumped) **[COMMENTS: "my city does this too"]** | Easy and a little rueful, like it's a shame; "just gets dumped" casual, "or the sea" lighter. DON'T lecture or blame anyone. | So almost everywhere, that heat just gets dumped into the air or the sea. | **THE ONE COMPARISON SHOT, the film's one big move:** the camera rises with the steam, up over the roofs and the clouds to the Earth's curve at dusk; across it, plumes of heat rise off data centers into the sky and the sea, and fade. One warm glow on the curve stays put: Helsinki. | FL 7.1 (Helen's CEO Olli Sirkka: "In almost all other countries, the data center heat is cooled to sea or air, so it's completely wasted."); FL 8.2 (the exceptions: Stockholm, Odense, Paris, Espoo). "Almost everywhere" rounds up his "almost all other countries". Optional on paper here, attributed: "...it's completely wasted." HELSINKI'S ENERGY BOSS (the quote's exact end, FL 7.1). |
| 6 | 16.15 | but (**THE TURN**) | Warmer and brighter after a tiny beat, good news; lean on "WANTS", a small smile. DON'T punch it. | But Helsinki wants it. | Push down into Helsinki's glow, out of the snowy street: the cabinet's plume bends down and drops into the pipe under the snow. | FL 6.1 (Helen, the City of Helsinki's energy company, signed on 31 Aug 2026 to connect a planned AI data center to the city's heating pipes), 6.9 (Helen has used data-center heat since 2010). |
| 7 | 17.54 | because (why the heat can be caught) | Simple and clear, explaining to a friend who doesn't do tech; "Luckily" light and quick. DON'T get technical. | Luckily, those chips are water-cooled. | Cutaway at the cabinet: cool blue water runs in, warm orange water runs out. | FL 2.2 (the 120 kW rack is liquid-cooled), 2.7 (the newest AI chips are liquid-cooled, and that warm liquid can heat homes; not every AI chip is), 6.3 (the plan's servers give off heat at about 50-60 C). "Water" for the liquid is a round-up. |
| 8 | 19.63 | so (how it works) | Flowing, one easy breath, a little pleased, following the water along; "under the snow" softer, cozy. DON'T rush "heat pumps". | So their warm water gets a boost from heat pumps, then runs under the snow, into people's radiators. | The camera follows the warm water along the pipe: a small heat-pump box lifts the glow from orange to gold; it runs under the snowy street (a tram crosses above) and climbs into the radiator under the one window, which glows warm. | FL 6.3 (industrial heat pumps lift the water to the 95 C the city's pipes need; REPORTED, the company via Forbes, consistent with the IEA's 2.7); FL 6.1 (district heating = hot water piped under the streets from central plants to homes). |
| 9 | 25.90 | which means (how much) | Steady, quietly impressed; "nearly a tenth" clean and level. DON'T inflate it. | That's nearly a tenth of the city's heat. | Crane up from the window over the snowy roofs: one window in ten across the city lights warm; a paper tag on a rooftop: 1 IN 10. By the harbour, a tall old chimney stands cold (the coal era, picture only). | FL 6.6 (VERIFIED, checked: 525 GWh is 8.8 % of the heat Helen sold in 2024; "if it is built and runs at full size"). The chimney: FL 6.8 (Helen's last coal plant shut on 1 Apr 2025), never spoken. |
| 10 | 28.69 | but (the floor) | Honest and level, a small shrug in the voice, quick. DON'T apologize or make it a warning. | It's all still a plan. | The crane's arc ends on the cabinet by the harbour: around it the building is only a pale pencil plan on the snow, with a paper tag FROM 2027; the glow shrinks to a small spark. | FL 6.7 (VERIFIED, not built: heat recovery "scheduled to begin in 2027"; no tenant signed; site not public; "Everything about it is a plan"). |
| 11 | 30.43 | but (the doubt answered) | Lighter, a little sly, letting them in on it; a small lift on "before". DON'T do a reveal voice. | But they've done this before. | The camera turns across the harbour to the red-brick cathedral with gold domes on its rock (frame 0's far landmark). | FL 6.9 (Helen: data-center heat "since 2010"; the Equinix heat-recovery plant since 2024). "They" = Helsinki. |
| 12 | 32.18 | for example (**THE TWIST**) | Savoring the weird bit, a touch slower on "bomb shelter" and "under a cathedral"; a smile on "started heating homes". DON'T rush the places. | In twenty ten, a data center in a bomb shelter, under a cathedral, started heating homes. | Push down through the rock under the cathedral into a wartime shelter: rows of servers, warm; a small old glow climbs pipes up into a few windows nearby; paper tag: 2010. | FL 6.10 (VERIFIED history: a WWII bomb shelter cut into the rock under Uspenski Cathedral, a data center for the IT firm Academica, due online Jan 2010, its heat "enough to heat 500 large private houses"; Reuters, 2009). Never "still": unknown since about 2014. Uspenski is the red-brick one with gold domes, never the white Helsinki Cathedral. |
| 13 | 37.75 | so (**THE PAYOFF**, the core line) **[COMMENTS: "mine runs in Virginia"]** | Relaxed and warm, a little slower, to one person; a light lean on "your chatbot", let "Helsinki" fall; then 0.5 s of room tone. DON'T mic-drop or echo the hook's tone. | So from twenty twenty-seven, your chatbot could heat a flat in Helsinki. | Pull out of one of those warm windows, out of our street's one warm window: your gloved hand holds your phone in the snow (POV), a chat bubble pops, and the window above glows a little warmer; paper tag FROM 2027. Hold, then the street un-builds into frame 0's drawing state (the loop). | The core line. FL 6.1, 6.5, 6.7: the heat is meant to start in 2027 and the 70,000 flats are the full plant, so "could" and "from 2027" keep it a plan; it is the fact lock's own comment-drawing line, "true enough at full size". Never "Helsinki heats 70,000 homes with AI". |

## Plain voice-over (for captions and timing)

Captions use digits (70,000, 40, 2010, 2027).

Did you know Helsinki wants AI to heat seventy thousand homes? The chips get that hot. One cabinet of them is like
forty kettles, boiling non-stop. And nobody's even making tea. So almost everywhere, that heat just gets dumped into
the air or the sea. But Helsinki wants it. Luckily, those chips are water-cooled. So their warm water gets a boost from
heat pumps, then runs under the snow, into people's radiators. That's nearly a tenth of the city's heat. It's all still
a plan. But they've done this before. In twenty ten, a data center in a bomb shelter, under a cathedral, started
heating homes. So from twenty twenty-seven, your chatbot could heat a flat in Helsinki.

ElevenLabs paste file: `script_elevenlabs.md`.

## Hook options (the owner picks one; option 1 is in the paste)

The brief's three families. Lines 2-13 survive any swap unchanged; each option was tested as its own paste: both checks
OK for all three. Scores are not re-run here: OPENERS' family scores are P3 "There's a ..." 8.4, P5 "Why does this
...?" 8.1, P1 "Did you know ..." 8.0, and its own advice is that the content of the line matters more than the family.

| # | Family | Opener (then the next line) | Frame 0 | Key words by (est.) | What it changes | Watch out |
|---|---|---|---|---|---|---|
| **1 (voiced)** | "Did you know ..." (the owner's model) | "Did you know Helsinki wants AI to heat seventy thousand homes?" Then: "The chips get that hot." | as above: the dark street, the glow, the cabinet on "AI", the windows on "seventy thousand homes" | "AI" ~1.9 s, "heat" ~2.6 s, "homes" ~3.6 s | nothing: it is the script (121 words, ~42 s) | The brief's own example, "Did you know Helsinki wants to heat seventy thousand homes with AI?", is its twin (same length, also true): it saves the surprise for the end of the question, but "AI" lands at ~3.9 s instead of ~1.9 s; the playbook wants the payoff in words by ~2 s, so the reordered one is voiced. |
| 2 | "There's a ..." (P3) | "There's a city in Finland that wants AI to heat seventy thousand homes." Then: "The chips get that hot." | the same; the city's name arrives in the captions at line 6 ("But Helsinki wants it.") | "AI" ~2.6 s, "homes" ~4.3 s | line 1 only (123 words, ~43 s) | the calmest and asks the viewer nothing, but "a city in Finland" is less concrete than "Helsinki" and two words longer; Helsinki's name then lands as a small reveal on the turn. A "Did you know there's a ..." twin ("Did you know there's a city that wants AI to heat seventy thousand homes?") reads the same. |
| 3 | "Why does this ...?" (P5, the Big Bend title's pattern) | "Why does this city want AI to heat seventy thousand homes?" Then: "The chips get that hot." | the same; "this city" points at the picture | "AI" ~1.9 s, "homes" ~3.6 s | line 1 only (121 words, ~42 s); also the strongest cover line if the owner prefers a question cover | the "why" is answered across the film (wasted elsewhere, catchable, proven), not by line 2, so it is not a self-answered question (RULE #1); but line 2 can still be heard as a quick "because", and "Helsinki" is first named at line 6. |

## Comment-drawing lines (tagged above; the brief's ENGAGEMENT LAYER mechanisms)

1. **Line 5, "So almost everywhere, that heat just gets dumped into the air or the sea."** Comment bait: a true
   generalization that people love to correct with their own city (Stockholm since 2014, Odense since 2019-2020, the
   Paris pool in 2024, Espoo from 2027: FL 8.2, 6.11). The narrator stays right: Helsinki's own energy boss says it of
   "almost all other countries" (FL 7.1), and reuse needs pipes, a buyer nearby and often a heat pump (IEA, FL 2.1).
   Arguable, defensible.
2. **Line 13, the core line, "So from twenty twenty-seven, your chatbot could heat a flat in Helsinki."** A "wait,
   seriously?" line made to be quoted and sent ("finally, a use for my chatbot"), with a built-in argument ("my chatbot
   runs in Virginia": true, which is why it says "could"). Also the loop: it ends on "Helsinki" and the film restarts on
   "Did you know Helsinki ...".

Likely without engineering: the forty kettles ("which kettle?": an American kettle is about half a UK kettle's power,
so it would be about eighty: our note, not in FL; commenters correct the count upward, never down), the bomb shelter
under the cathedral ("is it still there?": we say "in 2010" only), and heat pumps using power (FL 8.1: each unit of
power brings back about five of heat; never in the voice). Open loop: line 1's "how?" closes at line 8; "is it real?"
closes at lines 10-12. No "comment below", no "follow for more", no "send this to".

## Facts used (every spoken claim)

FL = `video/docs/v5/research/factlock.md`. "Round-up" = bigger or more general than the exact fact, as the owner
allows ("Exaggerating and generalizing and making it bigger is fine", 2026-10-29); the exact version is in brackets.
No web search was needed: every claim is in FL.

| Claim as spoken | Line | Status | Source | Round-up (exact version) |
|---|---|---|---|---|
| Helsinki wants AI to heat seventy thousand homes | 1 | VERIFIED as a plan | FL 6.1, 6.5, 6.7: Helen, 31 Aug 2026, https://www.helen.fi/en/news/2026/helen-hyodyntaa-uuden-datakeskuksen-hukkalampoa-helsingin-kaukolammossa ; OnZero via EQS, https://www.webdisclosure.com/press-release/onzero-signs-agreement-with-helen-to-supply-recovered-ai-compute-heat-to-helsinkis-district-heating-network-1IAaIv6FVJE ; Forbes, 4 Oct 2026, https://www.forbes.com/sites/kensilverstein/2026/10/04/helsinki-turns-ais-biggest-problem-into-heat-for-70000-homes/ | yes (Helen signed to take the heat of a planned AI data center into its district heating; "around 70,000 flats", once fully running; not built; start 2027) |
| The chips get that hot | 2 | VERIFIED (physics) | FL 2.1 (IEA, Energy and AI, Box 5.5, https://iea.blob.core.windows.net/assets/de9dea13-b07d-42c5-a398-d1b3ae17d866/EnergyandAI.pdf ), 2.2 | yes ("that hot" = enough heat to warm homes; more heat, not a higher temperature) |
| One cabinet of them is like forty kettles, boiling non-stop | 3 | VERIFIED + est. | FL 2.2: eeNews Europe, 15 Oct 2024, https://www.eenewseurope.com/en/nvidia-offers-120kw-liquid-cooled-blackwell-rack-as-industry-standard | yes (one 72-chip AI rack: 120 kW; forty 3 kW kettles is our arithmetic; a 2.4 kW EU kettle makes it fifty) |
| Almost everywhere, that heat just gets dumped into the air or the sea | 5 | REPORTED (his view) + generalization | FL 7.1 (Olli Sirkka, Helen's CEO, Forbes, URL above); FL 8.2 (the exceptions) | yes (Sirkka: "In almost all other countries, the data center heat is cooled to sea or air, so it's completely wasted."; Nordic cities and Paris do reuse some) |
| But Helsinki wants it | 6 | VERIFIED | FL 6.1, 6.9 (Helen URL above) | no |
| Those chips are water-cooled | 7 | VERIFIED | FL 2.2 (liquid-cooled rack), 2.7 (IEA), 6.3 (Forbes) | yes (liquid-cooled; the newest AI racks, not every AI chip) |
| Their warm water gets a boost from heat pumps, then runs under the snow into people's radiators | 8 | REPORTED (the company, one outlet; consistent with the IEA) | FL 6.3 (Forbes: about 50-60 C, lifted to 95 C by industrial heat pumps), 6.1 (district heating), 2.7 (IEA: 40-80 C, often with a heat pump) | yes (the heat passes through heat pumps into the city's district-heating water, which heats buildings; "under the snow" in winter) |
| That's nearly a tenth of the city's heat | 9 | VERIFIED (checked) | FL 6.6: Forbes ("roughly 9 %"); Helen's 2024 financial statements, https://www.helen.fi/globalassets/tietoa-meist%C3%A4/raportit-ja-julkaisut/helen_financial_statements_release_2024.pdf | yes (525 GWh = 8.8 % of the 5,981 GWh Helen sold in 2024, at full size) |
| It's all still a plan | 10 | VERIFIED | FL 6.7 (Helen: "scheduled to begin in 2027"; Forbes: no tenant before the plant gets built; site not public) | no |
| They've done this before | 11 | VERIFIED | FL 6.9 (Helen: "since 2010") | no |
| In twenty ten, a data center in a bomb shelter, under a cathedral, started heating homes | 12 | VERIFIED (history) | FL 6.10: Reuters via IBTimes, 2009, https://www.ibtimes.com/cloud-computing-goes-green-underground-finland-349097 ; Gizmodo (search summary), https://gizmodo.com/500-helsinki-homes-to-be-heated-by-cathedrals-undergrou-5416147 | no (a WWII bomb shelter cut into the rock under Uspenski Cathedral; online from Jan 2010; FL's safe wording: "In 2010 ... began warming homes"; never "still") |
| From twenty twenty-seven, your chatbot could heat a flat in Helsinki | 13 | VERIFIED as a plan | FL 6.1, 6.5, 6.7 (URLs above); FL's own comment-drawing line | yes (the start is 2027, the 70,000 flats are the full plant, no tenant yet: "could"; "your chatbot" generalizes AI work done in that data center) |

Picture-only facts to keep true at G3: the plant is a pale plan with no name and no real site (FL 6.7); the cabinet is
a generic AI rack, no logo (FL 2.2); Uspenski is red brick with gold domes (FL 6.10); the shelter's servers carry
"2010", never shown as running today (FL 6.10); the cold chimney stands for the coal era, never labelled with a plant's
name or a share (FL 6.8). Re-check at G8: OnZero's tenant and site (FL 6.7).

## Checks (G1)

`python3 video/scripts/voice/check_rhythm.py video/docs/v4/script/script_elevenlabs.md`, last lines:

```
13 sentences, 6 short (<= 5 words, 46%), 6 long (>= 9 words)
OK: long sentences are broken up by short ones
```

`python3 video/scripts/voice/check_paste.py video/docs/v4/script/script_elevenlabs.md`, last lines:

```
121 words, 744 characters, 6 tags (5.0 per 100 words); expected about 43 s, max 56 s
OK: paste-safe
```

No warnings. Hook options 2 and 3, tested as their own pastes: both checks OK (option 2: 123 words, ~44 s by the
paste's estimate; option 3: 121 words, ~43 s).

## Notes for the critic and the fix pass

- **Deliberately left out of the voice (budget: 95-125 words):** (1) the coal. It is in the picture (line 9's cold
  chimney). To voice it, swap line 9 for "Until last year, Helsinki still burned coal for heat." (FL 6.8's safe
  wording; 9 words, rhythm still OK: lines 8 and 9 long, line 10 short). (2) The energy boss's quote. Line 5 says it in
  our words; his exact end can go on paper at line 5, attributed ("...it's completely wasted." HELSINKI'S ENERGY BOSS).
  Voiced, it would be "The man who runs Helsinki's heating says it's completely wasted." (exact, trimmed at the start
  only: FL 7.1), which costs 11 words and needs a cut elsewhere. (3) Heat pumps using power, summer surplus, Microsoft's
  bigger project next door (FL 8.1, 8.10, 6.11): comment answers, never claims. The script never says "the first" or
  "the biggest" (FL 8.12).
- **Reserve cuts, if the G2 take runs over ~44 s:** "boiling non-stop" (3 words; the joke still lands on "forty
  kettles"), then line 9 (8 words; lines 8 and 10 still alternate), then "Luckily," and "just".
- **"Flat" or "apartment":** the narrator is American; the core line keeps the brief's "flat" (one syllable, the line
  the owner has seen, and FL's own wording). The owner's call.
- **"They've" (line 11)** means Helsinki. If a cold reader stumbles, "But Helsinki's done this before." is the fix (then
  two paragraphs start with "But Helsinki": a `check_paste.py` warning only).
- **"It's all still a plan" (line 10)** is the floor in words; "wants" (line 1) and "could ... from twenty twenty-seven"
  (line 13) carry it too. "It isn't built yet" was tried and dropped: after "the city's heat", "it" read as the heat.
- **Line 1 reordered from the brief's example** so "AI" and "heat" land by ~2.6 s (Hook options, row 1).
- **The comparison shot (line 5)** is the only place outside Helsinki; the cathedral is inside the home view (across
  the harbour), and the shelter is a cutaway under it, entered and left by push-throughs.
- **Distinct from video 5:** the shelter is one sentence of proof, in Helsinki, with its date; Stockholm and its bunker
  are never mentioned; the film's subject is the heat in a city.

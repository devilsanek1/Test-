# Journal corpus: the clusters, what comes out of them, and the top 10

Written 2026-10-29 by the clusterer-editor (brief `context/workflows/journals-briefs/brief_cluster.txt`; method: `README.md`;
tool: `video/scripts/look/posters/journals.py`; owner's screen: `SUMMARY.md`). A study, not a rule: the owner decides.
**Fit** = visual fit with our look (0-10); **value** = story value (0-10); **owner** = the owner's topic order with fit as
"visually appealing" (README 4.3, 4.6).

## 1. Top findings
- **About 1 in 10 big-journal stories fits our look at all** (fit >= 6): 9 % of the 1,113 feed rows (the triage corrected
  by its random control; range 8-13 %) and 11 % of the section-neutral search sample (8 of 70; 95 % CI 6-21 %). The fits
  come from a few desks: the Guardian's environment (43 %) and cities (7 of 12), the NYT's climate and travel (31 %) and
  science (25 %), the Economist's Asia (30 %); business, finance, politics and culture feeds are near 0 %.
- **14 kinds of story; six fit well** (mean fit 6.6-8.9; 75-100 % of rows fit >= 6): floods, storms and quakes; history
  (new finds about the past); space and sky; nature; journeys; towns and buildings. **Five placeless kinds** (politics,
  business, AI and the web, health, culture) hold half the stage-2 rows (155 of 308) and average fit 1.4 or less.
- **High fit AND high value:** history (fit 7.4, value 6.9; 69 % positive, 54 % WOW 2), space and sky (7.2, 6.8; 90 %
  positive, 40 % WOW 2) and nature (7.2, 6.3; its rescues: 8 rows, all positive, value 6.8). Floods, storms and quakes
  fits best of all (8.9, 6.5) but is 0 % positive and 0 % tech in this window.
- **The story must happen TO the place:** those rows fit 8.0 (92 % fit >= 6) against 5.1 when the place is only the stage,
  but they are mostly bad news (34 % positive vs 53 %). The positive exceptions are rescues and fixes: an island turns its
  lights off for young seabirds (fit 10), Oxford Street goes car-free (8), Finland licenses a tomb for nuclear waste (9).
- **Tech news as such does not fit; tech in a weird place does.** "AI and the web" (29 rows) averages fit 1.3; of 9
  metaphor worlds only the PHP flaw (v1's past topic) passed. The WOW tech sat in weird places: a telescope of Antarctic
  ice (Nobel, 6 Oct), a waste tomb in ancient bedrock (licensed 22 Oct), a probe to a moon of Mars (launched 20 Oct).
- **Data centres:** 14 of 1,209 rows mention them: all backlash, votes, power or money; none in a weird place, none
  positive; the best fits 6 (residents say xAI offered to buy homes if they don't sue over the noise). **Real-city news**
  ("towns and buildings", 28 rows) draws well (6.6) but never had a WOW 2.
- **Top 10 ideas** (section 6): 7 verified, 2 partly, 1 unverified; 6 positive; led by Japan's probe to Phobos, the ice
  age our warming stopped, the Venice lagoon (unverified) and a volcano's stone forest, America's newest national park.

## 2. The corpus and how far to trust it
- **What:** 1,209 stories, 28 Sep - 28 Oct 2026, 13 outlets. **Feeds** (RSS; headline, section, tags): 1,113: Economist
  415, NYT 299, Guardian 190, New Yorker 50, Wired 50, Forbes 48, Atlantic 25, TIME 25, FT 11. **Search** (with our
  summaries): 96: Forbes 24, TIME 21, MIT Technology Review 18, Scientific American 15, National Geographic 14,
  Smithsonian 4 (stratum A, section-neutral: 70; B, place-targeted: 26).
- **Two stages:** a quick triage of all 1,113 feed rows, then the full rubric on 308 rows (272 distinct events): the 96
  search rows, the triage's 111 picks (t_fit >= 5 or WOW 2) and a seeded random 10 % of the rest (101) as a control.
- **Blind check (README section 6): GOOD.** 63 rows re-scored blind: fit rho 0.96, mean absolute difference 0.52, 89 %
  within +-1; value rho 0.94. Same model and rubric on both sides: the rubric is unambiguous, which does not mean a human
  art director would agree. **Audit:** 8 of 8 sampled search rows re-found; one summary matched only partly (a wording).
- **Biases:** (1) the feeds are capped lists of each section's latest items: 69 % of feed rows are dated 21-28 Oct and big
  events repeat (the Kelvin wave: 7 rows; Israel's election: 6); (2) they cover some sections only (the Guardian: 8, no UK
  news or business), so "not in the corpus" never means "not covered"; (3) all 212 stage-2 feed rows were scored from the
  headline alone (the Economist's cryptic ones: 15 of 64 at low confidence); (4) Smithsonian has 4 rows; (5) 11 outlets
  are missing: 6 refused and feedless (WSJ, BBC, Reuters, AP, New Scientist, LA Times; 7 of the 13 the search tool refused
  came back by RSS) and 5 dropped for the usage limit (Bloomberg, Fortune, Washington Post, CNN, NPR); (6) one editor's cut.

## 3. Base rates: how many big-journal stories fit our look at all
- **Feeds, all 1,113 (`T base`):** the triage rated 84 (7.5 %) t_fit >= 6, 25 t_fit >= 8, 22 WOW 2. The full rubric: 92
  of its 111 picks fit >= 6 (83 %), and 1 of the control's 101 (F0741, the ozone treaty), so it missed about 10 more among
  the 1,002 it passed over (95 % range 2-54). Corrected: **about 9 % fit (102 of 1,113; range 8-13 %)**; candidates (fit
  >= 6, WOW >= 1, gate pass, not a past topic) about 85 (7.6 %).
- **Search, stratum A (section-neutral):** mean fit 2.2; **8 of 70 fit >= 6 (11 %; 95 % CI 6-21 %)**; 3 fit >= 8; 3
  WOW 2. Stratum B targets places on purpose (62 % fit >= 6): it feeds the clusters, never a base rate.

| Outlet (source) | Rows | Fit >= 6 | Share |
|---|---|---|---|
| The Guardian (feeds) | 190 | 32 | 17 % |
| The New York Times (feeds) | 299 | 28 | 9 % |
| The Economist (feeds) | 415 | 19 | 5 % |
| The New Yorker; TIME (feeds) | 50; 25 | 2; 1 | 4 %; 4 % |
| Forbes; Wired (feeds) | 48; 50 | 1; 1 | 2 %; 2 % |
| The Atlantic; the FT (feeds) | 25; 11 | 0; 0 | 0 % |
| National Geographic; Smithsonian (search A) | 8; 2 | 4; 1 | 50 %; 1 of 2 |
| Scientific American; MIT Technology Review (search A) | 12; 13 | 2; 1 | 17 %; 8 % |
| TIME; Forbes (search A) | 17; 18 | 0; 0 | 0 % |

**By section** (feeds, triage): Guardian cities 7/12, travel 4/9, environment 12/28; NYT climate 10/32, travel 5/16, science
5/20, technology 2/20; Economist Asia 7/23. Near zero: NYT business 1/48, world 1/49, arts 1/60; Economist latest 3/157,
business, culture, finance 0; Guardian technology 1/32; Wired 1/50; Atlantic 0/25. **Read:** the environment, climate,
science, cities and travel desks fit our look; tech desks rarely do.

## 4. The clusters (`T stats`; chart: `cluster_chart.png`)
The scorer's open `news_shape` codes, consolidated into 14 kinds of what happens. Names are chart labels ("History" = new
finds about the past; "Nature" = wildlife and wild places, both shortened to keep the chart's labels apart). All 308 rows:
mean fit 3.8, value 5.9. A flaw names cannot fix: the "Politics and crime" label covers part of the grey "average value
5.9" note (the placer does not know the note; the fix belongs in the tool).

| Cluster | Rows | Events | Mean fit | Mean value | Mean owner | Fit >= 6 | WOW 2 | Positive | Real place | Happens TO | Tech/AI | Gate fail | Top telling shapes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Floods, storms, quakes | 16 | 9 | 8.9 | 6.5 | 6.9 | 100% | 56% | 0% | 100% | 94% | 0% | 0% | nature hits a town (16) |
| History | 13 | 11 | 7.4 | 6.9 | 7.0 | 92% | 54% | 69% | 100% | 23% | 69% | 0% | finds at the edge (5), two worlds side by side (4) |
| Space and sky | 20 | 14 | 7.2 | 6.8 | 6.9 | 95% | 40% | 90% | 100% | 10% | 100% | 0% | finds at the edge (8), one person crosses a big world (8) |
| Nature | 24 | 22 | 7.2 | 6.3 | 6.5 | 92% | 8% | 58% | 96% | 38% | 8% | 0% | the place changes (13), none fits (4) |
| Journeys | 10 | 10 | 7.0 | 5.9 | 6.1 | 90% | 10% | 70% | 100% | 20% | 0% | 0% | one person crosses a big world (5), two worlds side by side (4) |
| Towns and buildings | 28 | 26 | 6.6 | 6.0 | 6.1 | 75% | 0% | 50% | 100% | 57% | 0% | 0% | something huge gets built (13), the place changes (11) |
| Tech in real places | 17 | 14 | 5.6 | 6.3 | 6.2 | 53% | 18% | 35% | 94% | 18% | 82% | 0% | none fits (6), the place changes (3) |
| War and borders | 11 | 11 | 5.7 | 5.8 | 5.8 | 36% | 9% | 0% | 100% | 64% | 9% | 0% | the place changes (4), none fits (3) |
| Climate reports and policy | 14 | 12 | 4.2 | 6.2 | 5.8 | 7% | 0% | 29% | 86% | 0% | 50% | 0% | two worlds side by side (5), none fits (5) |
| Health and biotech | 14 | 12 | 1.4 | 6.2 | 5.3 | 0% | 0% | 0% | 14% | 0% | 43% | 0% | none fits (14) |
| AI and the web | 29 | 27 | 1.3 | 5.6 | 4.8 | 7% | 0% | 7% | 7% | 7% | 100% | 0% | none fits (21), the system as a world (7) |
| Business | 23 | 22 | 0.8 | 5.5 | 4.6 | 4% | 0% | 13% | 17% | 0% | 39% | 0% | none fits (22), two worlds side by side (1) |
| Politics and crime | 37 | 32 | 0.5 | 5.7 | 4.7 | 0% | 0% | 5% | 14% | 0% | 8% | 0% | none fits (33), real capers (2) |
| Culture and lifestyle | 52 | 52 | 1.1 | 4.8 | 4.1 | 2% | 0% | 52% | 42% | 0% | 10% | 19% | none fits (50), two worlds side by side (1) |

**Definitions and best examples** (id, outlet, date, headline; view = home place / hero / far-out thing):
- **Floods, storms, quakes:** nature strikes a real place (sea surges, floods, a quake, a thaw, drought, seaweed). F0921 NYT
  10-28 "California's High Tides Set Records This Week..." (the Bay / the Golden Gate / the swelling Pacific); F1009 NYT
  10-28 "...Mexico Declares War on Seaweed" (Cancun's beaches / the sargassum / the seaweed belt from space).
- **History:** a study, a dig or a lab reveals the past of a real place or thing. C4-016 Smithsonian 10-27 "...a New Ice
  Age Began..." (Baffin's tundra / the Barnes Ice Cap / 2,000 years of ice); C2-027 Scientific American 10-22 "...The
  Starry Night" (Saint-Remy / the painted sky / the Hyades); F0572 Guardian 10-25 "...Roman colour-changing glass".
- **Space and sky:** a machine goes out there, or a find comes back. F0327 Economist 10-21 "Japan's mission to Mars's moons
  takes off" (Tanegashima / the MMX probe / Phobos); F0113 Economist 10-06 "A Nobel for the strangest telescope ever
  built" (the South Pole / sensors in the ice / neutrinos from deep space).
- **Nature:** animals, plants and wild places harmed, rescued, protected or on show. F0568 Guardian 10-25 "Lights out: the
  island that goes dark to save young seabirds" (the island at night / a shearwater / the dark ocean); F0773 NYT 10-22
  "...Most Shallow Coral Reefs as Critically Endangered" (a reef / bleaching coral / the ocean).
- **Journeys:** one person or one ship crosses a big landscape, or a writer retraces one. F0718 New Yorker 10-26 "...Skied
  Down Everest" (the north face / a lone skier / the sky); F0077 Economist 10-01 "The world's busiest migration route has
  gone quiet" (the Darien / the trail / two continents).
- **Towns and buildings:** a street, town or landmark built, restored, revived, reshaped, torn down or fought over. F0593
  Guardian 10-27 "...Oxford Street pedestrianisation" (the street / car-free / the skyline); F1013 NYT 10-28 "...Plans to
  Dismantle Russia's 'Eiffel Tower'" (Shabolovka / the Shukhov tower / Moscow).
- **Tech in real places:** a machine, plant or network in a real place built, tried, failing or fought over. F0068
  Economist 10-01 "Finland has a fix for nuclear waste" (Olkiluoto / the Onkalo repository / the bedrock); F0879 NYT 10-27
  "Wanted: Robot-Dog Walkers. $20/Hour." (a San Francisco street / a robot dog / the bay).
- **War and borders:** war, bases, borders and war's leftovers hit real places. F0504 Guardian 10-06 "...defusing a second
  world war bomb" (a Devon street / the buried bomb); F0331 Economist 10-22 "India is pouring... concrete into its border".
- **Climate reports and policy:** reports, records, plans and decisions in numbers and rules, no one place changing.
  F0741 NYT 10-15 "How One Global Climate Deal Worked 'Perfectly'..." (fit 7); C1-013 TIME 10-14 "Climate Change Is
  Accelerating Faster Than We Can Respond..." (5).
- **Placeless kinds** (their best examples are the closest to a world; most have none): **Health and biotech** (C2-024
  Scientific American 10-28 "Animal-borne Shamonda virus infects and kills a human for the first time", fit 4: Lyon's
  hospital / a midge / cattle fields; C2-007 MIT Technology Review 10-16 "Can't bear to say goodbye to your pet?...", 3);
  **AI and the web**, claims, debates, risks and outages (F0786 NYT 10-22 "PHP Security Flaw Sets Off Global Rush to
  Patch...", 8, the only pass, a past topic: a town of websites; C2-006 MIT Technology Review 10-19 "How far can we push
  computing?", 4); **Business** (F0054 Economist 10-01 "Japan's tea farmers enjoy a matcha boom", 6, the exception: tea
  terraces / a tea bush / Mount Fuji; F0237 Economist 10-15 "SpaceX's Starlink expansion is a bold gamble...", 4);
  **Politics and crime**, people and words (F0216 Economist 10-14 "European museums are seeing a spike in high-value art
  theft", 5; F0401 Economist 10-26 "...Vucic... loses to a bunch of students", 3); **Culture and lifestyle**, arts,
  reviews, guides, lists and deals (C1-046 Forbes 10-06 "New York Is The Best City In The World...", 4; C4-008 National
  Geographic 10-13 "16 Striking Photos From This Year's Best Wildlife Photographers", 4).

## 5. What comes out
**5.1 Directions: the kinds both high-fit and high-value** (top right of the chart).
1. **History, as new finds about real places and things** (7.4, 6.9; 11 events). Time is the far-out thing (the layered
   depth becomes layers of time) and the change is physical (an ice cap grows, the sea drowns dry land), so it reads with
   the sound off. The owner's middle (true, in a big world, neither about a city nor made up), with WOW facts, 69 %
   positive, and the owner's own "history videos?" seed with a fresh peg. Risks: contested readings; less buzz.
2. **Space and sky** (7.2, 6.8; 14 events): the far-out thing is built in; one machine travels or one strange instrument
   finds; 90 % positive; inside the tech focus. Risks: a launch pad is a poor home; a weak everyday "so what"; ad risk.
3. **Nature, its rescues** (8 rows: 7.4, 6.8, all positive): a place changes for the animals (the island goes dark, India's
   tigers, bug highways, a new park): v1's lights-out, made kind. Risks: no tech; a charity-appeal tone; seasonal pegs.
4. **Floods, storms and quakes** (8.9, 6.5): the most drawable, but 16 of 16 bad news and none with tech on the town's side
   (Isaias's AI forecast ran at NPR and CNN, outside this corpus): the slot after a positive film, or a "fighting back" angle.

The middle: **tech in real places** (5.6, 6.3) has value but a thin, mostly negative or ad-risk supply (5.3); **towns and
buildings** (6.6, 6.0) and **journeys** (7.0, 5.9) draw well but rarely WOW and rarely carry news.

**5.2 Our earlier beliefs, tested.** `../content_fit.md` section 2, the nine archetypes:

| Archetype (its rank) | What the stories show | Verdict |
|---|---|---|
| 1 Nature against the city, tech on its side (8.12) | the best-fitting kind (8.9, 16 of 16 fit >= 6), but 0 positive, 0 tech | confirmed on fit; tech on our side is rare here |
| 2= The system drawn as a city (7.76) | 9 metaphor rows: only the PHP flaw passed (8, a past topic); the rest 2-4 | overturned on supply: rare, not weekly |
| 2= The hidden machine under the city (7.76) | "above and below" is the 2nd-best shape (7.9, 56 % WOW 2), but what hides is a waste tomb, an ice telescope, a WWII bomb, sea slugs; data centres 4-6 | refined: the shape works; it is wider than data centres |
| 4 The street that works differently now (7.40) | robotaxis in Manchester, robot-dog walkers in San Francisco (7 each, ad risk); without tech, Oxford Street car-free (8) | confirmed but thin; widen it beyond tech |
| 5 Two places, two choices (7.04) | "two worlds side by side": 19 rows, fit 5.5 | refined down: only when both sides are one picture |
| 6= The place where it happened (7.00) | the place as a stage: fit 5.1, vs 8.0 when it happens TO the place | confirmed: a setting, never the reason |
| 6= A building as the protagonist (7.00) | "something huge gets built": 17 rows, 6.6, 0 % WOW 2 | refined: drawable, rarely WOW |
| 8 Your city from above; 9 The map story | no story needed the view from above; global reports sit at 4.2 | not tested; confirmed weak |

The content thread's "middle" kinds (`../content_discussion.md` exchange 4, with the kept shapes), as telling shapes:

| Telling shape | Rows | Fit | Value | WOW 2 | Positive | What it means |
|---|---|---|---|---|---|---|
| nature hits a town | 17 | 8.8 | 6.4 | 53 % | 6 % | the most drawable; bad news |
| above and below | 9 | 7.9 | 6.3 | 56 % | 56 % | strong; the WOW shape |
| the place changes | 37 | 7.3 | 6.4 | 14 % | 41 % | broad and good |
| one person crosses a big world | 15 | 7.1 | 6.3 | 27 % | 80 % | confirmed; the traveller is usually a machine |
| finds at the edge | 13 | 7.0 | 6.8 | 23 % | 92 % | confirmed; the best value |
| something huge gets built | 17 | 6.6 | 6.0 | 0 % | 47 % | drawable, no WOW |
| a crowd does one thing at once | 3 | 6.3 | 6.6 | 33 % | 67 % | rare; holds the best positive story (the island) |
| new machines on real streets | 4 | 6.0 | 6.6 | 25 % | 25 % | thin; ad risk |
| two worlds side by side | 19 | 5.5 | 6.4 | 16 % | 53 % | weak |
| the system as a world | 12 | 4.7 | 6.3 | 0 % | 17 % | overturned: only v1's own topic passed |
| real capers | 2 | 3.0 | 5.9 | 0 % | 0 % | none in this window |

**5.3 The owner's two slices** (`T slices`; playbook, Taste signals, "Places on screen").
- **Tech in the cities:** the tool's slice (tech/AI with W >= 2) holds 32 rows (fit 7.6, value 6.9, 14 WOW 2, 24 positive),
  but 23 are space, sky and the science of the past (the rubric counts science as AI-adjacent), 2 the PHP flaw, 1
  Finland's waste tomb. Tech in an actual town: **6 rows, 6 events** (fit 6.7, value 6.8, 2 WOW 2, 3 positive): robot-dog
  walkers in San Francisco (F0879), Uber's robotaxi trial in Manchester (F0509), xAI's offer in Mississippi (F0670),
  data-centre towns turning Democrat (F0191), Samsung's chip complex in Pyeongtaek (C2-012), China's trash-to-treasure
  plants (F0199). The WOW sits in **tech in weird places**: Onkalo's tomb in bedrock (F0068, fit 9), IceCube's ice (F0113,
  8), an AI computer bound for the Moon (C2-016, 7, a company plan), a mirror satellite lighting a field at night (F0583,
  10, criticised). None of the content thread's 13 shortlisted city-tech stories (exchange 7) is in our 1,209 rows.
- **Data centres:** 14 corpus rows, 5 scored (fit 4.2, value 6.5, 1 WOW 2, 0 positive), 4 events: xAI's offer to buy homes
  over the noise (F0670, Guardian 10-28, fit 6, WOW 2), data centres turning Trump voters into Democrats (F0191, F0272,
  Economist; 6, 5), anger that may not swing votes (F0788, NYT; 4), the industry funding a Senate race (F0848, NYT; 0).
  Triage only: "The data centre backlash" (Economist), Google's virtual power plant, "How the A.I. Boom Is Driving Up Sales
  of Gray Paint" (NYT), Microsoft's delays (FT). The one WOW is a company offering to buy a street's silence (negative);
  the weird places the owner liked (Stockholm's bunker, Barcelona's chapel, Devon's pool) are older and need a peg.

## 6. The 10 best stories as candidate ideas
From `T top` (100 rows, 83 events, 14 positive with WOW 2), each event once at its best row (the top 15 rows hold 11
events); none skipped. Checked with 1-2 standard web searches on 2026-10-29 (summaries, not full reads: a pick still gets
its fact lock). World = home place / hero / far-out thing.

1. **Japan's probe to bring back soil from a moon of Mars** (F0327 Economist 10-21 "Japan's mission to Mars's moons takes
   off"; +C1-050). Owner 7.90, fit 8, WOW 2, positive. Story: Japan launched a probe that will land on Phobos and bring a
   pinch of its soil home around 2031. World: Tanegashima's launch pad / the MMX probe / Mars and Phobos; one thing
   travels. Ad or news? News (a public agency's launch); keep the rocket unbranded. **Verified:** an H3 lifted it off on 20
   Oct; Mars in 2027 (https://www.esa.int/ESA_Multimedia/Images/2026/10/MMX_lifts_off_to_Mars_s_moon_Phobos).
2. **The ice age we stopped** (C4-016 Smithsonian 10-27 "Two Thousand Years Ago, a New Ice Age Began—but Human-Caused
   Climate Change Recently Reversed It..."). Owner 7.81, fit 10, WOW 2, mixed. Story: plants buried at the edge of Canada's
   Barnes Ice Cap show it began growing again about 2,000 years ago, which the authors read as the start of the next ice
   age, until our warming reversed it. World: Baffin Island's tundra / the ice cap / 2,000 years of ice and sky; the place
   changes. Ad or news? News (peer-reviewed); say "the scientists say" and give the models that put the next ice age far
   off. **Verified:** Science, 22 Oct, 88 new radiocarbon dates (https://www.martincid.com/science/next-ice-age-began-barnes-ice-cap-warming-stopped-it/).
3. **How rising seas made the Venice lagoon** (F0654 Guardian 10-28 "How rising seas transformed dry land into Venice
   lagoon"). Owner 7.67, fit 10, WOW 2, mixed. Story (headline only): the sea's rise turned dry land into Venice's lagoon.
   World: the lagoon / Venice on its islands / millennia of rising sea; the place changes. Ad or news? News; avoid the
   postcard at frame 0 (open on the dry land). **Unverified:** two searches found only older work (a sonar survey of a
   Roman road under the lagoon, a 2024 sea-level reconstruction, a 2026 sediment-core project), not this study.
4. **A volcano's stone forest becomes America's newest national park** (F0764 NYT 10-21 "America Mints a New National Park,
   Elevating an Arizonan 'Sky Island'"; +C4-005, NatGeo's volcano story, fit 10). Owner 7.62, fit 8, WOW 1, positive.
   Story: Chiricahua, a forest of stone spires left by an ancient eruption, became the 64th US national park. World: the
   Arizona desert / the spires / the volcano and the monsoon sky; the place changes. Ad or news? A tourism-ad risk: open
   on the eruption, then the law; no travel tips. **Verified:** signed 20 Oct; about 12,000 acres; the first new park in six
   years, per Outside (https://www.nps.gov/chir/learn/news/chiricahua-national-monument-becomes-america-s-newest-national-park.htm).
5. **California's sea is up to a foot higher this autumn** (F0921 NYT 10-28 "California's High Tides Set Records This Week.
   They're Going to Get Higher."; one of 7 Kelvin-wave rows). Owner 7.57, fit 9, WOW 2, negative. Story: a slow pulse of
   warm Pacific water from El Nino lifted California's sea, and high tides flood beaches and streets. World: the Bay's
   shore / the Golden Gate Bridge / the swelling Pacific; nature hits a town. Ad or news? News; bad news (the slot after a
   positive film). **Partly verified:** 6-8 inches in the south (NPR, https://www.wunc.org/2026-10-19/a-kelvin-wave-raised-sea-levels-on-the-west-coast-more-are-coming)
   and a warning of possible record tides from 25 Oct (NBC Los Angeles); the records not found. Newer: king tides on top
   of it, 21-28 Nov and 20-27 Dec (San Mateo County), a ready peg.
6. **Van Gogh's Starry Night shows a real sky** (C2-027 Scientific American 10-22 "Astronomers unlock a mystery hidden in
   van Gogh's The Starry Night"; +C4-018). Owner 7.48, fit 8, WOW 2, positive. Story: astronomers matched five painted stars
   to the Hyades and say the painting shows the pre-dawn sky over Saint-Remy on 22 July 1889. World: Saint-Remy / the
   painted sky / the Hyades; finds at the edge. Ad or news? News; give the doubt a line. **Verified:** Scientific Reports,
   22 Oct; disputed by at least one astronomer (https://sciencenews.org/article/van-gogh-starry-night-real-sky-stars).
7. **A telescope made of Antarctic ice wins the Nobel** (F0113 Economist 10-06 "A Nobel for the strangest telescope ever
   built"; +C1-009, F0902). Owner 7.43, fit 8, WOW 2, positive. Story: the physics Nobel went to Francis Halzen for
   IceCube, a cubic kilometre of South Pole ice wired with 5,160 light sensors that caught neutrinos from deep space.
   World: the South Pole station / the sensors in the ice / the far universe; above and below. Ad or news? News; the
   laureate small or not at all (the gate). **Verified:** 6 Oct, sole laureate (https://nobelprize.org/prizes/physics/2026/summary);
   next peg: the ceremony on 10 Dec.
8. **An island switches off its lights for baby seabirds** (F0568 Guardian 10-25 "Lights out: the island that goes dark to
   save young seabirds"). Owner 7.38, fit 10, WOW 2, positive. Story: every autumn an Atlantic island (most likely Corvo,
   Azores) turns off its public lights for five nights so young shearwaters fly to sea instead of crashing into lit
   streets. World: the island at night / a young shearwater / the dark ocean and the stars; a crowd does one thing at
   once (v1's lights-out, made kind). Ad or news? It can sound like a charity appeal: lead with the island's decision.
   **Verified in substance:** Corvo's yearly blackout (https://www.portugalresident.com/azores-island-turns-off-lights-to-protect-endangered-seabirds/);
   this year's dates and the gallery not seen.
9. **Nearly all shallow coral reefs are now critically endangered** (F0773 NYT 10-22 "I.U.C.N. Red List Classifies Most
   Shallow Coral Reefs as Critically Endangered"). Owner 7.33, fit 8, WOW 1, negative. Story: the IUCN rated 96 % of shallow
   reef ecosystems critically endangered, at very high risk of collapse by 2075, mainly from ocean heat. World: a reef /
   bleaching coral / the open ocean; the place changes. Ad or news? News; bad news; no home reef named yet.
   **Verified:** https://iucn.org/node/47912 (24 % if only the past 50 years are counted).
10. **Finland licenses the world's first tomb for nuclear waste** (F0068 Economist 10-01 "Finland has a fix for nuclear
   waste"). Owner 7.29, fit 9, WOW 2, positive. Story: Finland will bury its spent fuel in 1.9-billion-year-old bedrock at
   Onkalo, on the island of Olkiluoto, sealed for some 100,000 years. World: the forested island / the repository / the
   bedrock below; above and below. Ad or news? Industry PR if only the operator speaks: lead with the licence and add the
   open question (how to warn people 100,000 years from now). **Verified, and newer than the row:** licensed on 22 Oct;
   first canisters late 2026 or early 2027 (https://www.cp24.com/news/world/2026/10/22/finland-grants-licence-for-worlds-first-nuclear-waste-repository/).

Next in line: 11 a dwarf-planet candidate beyond Pluto (C2-030; verified by the audit: Scientific American, 27 Oct, 2026 ED138); 12 Roman glass that
turns from green to red, remade in Sheffield (F0572; verified, the University of Sheffield's news); 13 the UK's claw for
space junk (C4-017); 14 a dinosaur skeleton auctioned for $47.3m (F0614); 15 Oxford Street goes car-free (F0593).

## 7. Blind spots, and what would test them
- **What these outlets don't carry:** the content thread's WOW city-tech stories (hospital drones, mine-water heat, sea
  gates, a ship tunnel) are absent from our rows; they ran in local, trade and specialist outlets or in outlets we dropped
  (the Washington Post's bears in Japan, NPR's AI hurricane forecast). For "tech in the cities", big journals are thin.
- **Evergreen history with no peg** (Lisbon 1755) cannot appear in a news window; **headline-only scoring** (212 of 308
  rows) made some calls inferences (Onkalo proved right; Venice is still open).
- **One scorer, one editor:** the blind check agreed (rho 0.96) but used the same model; the clusters are one cut (a
  second editor might split space into missions and finds, or towns from buildings: each pair overlaps on the chart).
- **The window:** 30 days, 69 % of feed rows from the last week; autumn's own stories (king tides, seabird blackouts, the
  Nobels) may make this month look more nature-and-space than a typical one.
- **What search favours:** popular pages, in the order returned; the triage missed about 10 fits. **Fit is not
  performance:** the rubric says how a story draws in our look, not whether it travels; v1 is our one number.
- **Tests:** the owner's picks among the top 10; a blind re-clustering by a second editor; the missing outlets and sections
  through RSS; November with the same rubric; `../content_fit.md`'s publish test (a place event at frame 0, read at 24 h).

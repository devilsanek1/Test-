# Journal corpus: which recent big-journal stories fit our visual storytelling (method and rubric)

**State (2026-10-29 ~04:45 UTC): DONE, waiting on the owner.** Corpus (1,209), triage, stage 2 (308), scores and the
blind check (GOOD), the audit, 14 clusters (`clusters.csv`, `clusters.md`), the chart (`cluster_chart.png`), the top
10 checked on the web, and `SUMMARY.md` (the owner's screen). Next: the owner's reactions, captured in the playbook
and in this folder; the content thread (session_01YGLGMrgF1Cfg5gMAND1VNt) has the summary.

## 1. The question, made testable
Of the stories big journals published in the last 30 days (2026-09-28 to 2026-10-28), **which could be TOLD through the
posters' views in our look** (a layered world, one hero, something WAY far out for scale, subtle nature, a mechanism you
can see with the sound off), **which of those are also good stories for us**, and **what kinds of story (clusters) do the
good fits fall into?** The output is content directions with real examples, not a pick.

**Frame (the owner's words win):**
- The views are a way of telling a story, not its subject (owner, 2026-10-28 ~22:20 UTC, in the content thread: "im
  thinking more about what kind of content would contain storytelling that is around these views. Like previously we
  discusesd arcane shots ... has nothing to do wiht the actual cities"; playbook, Taste signals, "Places on screen"):
  the world can be a real place or a faithful metaphor (v1's town of websites, our best performer). So the rubric scores
  the WORLD a story can be told in; a real named place is recorded as a tag, never required.
- Neither extreme (owner, ~22:28 UTC, on the content thread's myths, fables and metaphor worlds: "now i feel like you
  went the other direction, like completely made up content like"; playbook, "Places on screen"): not content ABOUT
  real cities, and not made-up content; **the middle is true stories whose action happens in a big world we can show**,
  with a metaphor world only when a true story needs it and the facts map one-to-one (v1). Every row in this corpus is
  a true story by construction; the telling shapes (4.4) are the content thread's "middle" kinds (its exchange 4).
- Any subject, not only tech and AI ("Don't be fixated on tech or AI, all goes, the best kind of content that fits into
  this and people would love to hear about"); news from a real city is positive (playbook). Tech/AI is a tag, because
  picks keep the tech/AI focus until the owner picks a direction.
- Our evidence (`../content_fit.md` §1): v1 worked as the story happened TO the buildings; v2's canal was only a
  backdrop while text boards carried the argument; place stories that travel pair a real, named place with a conflict
  and an everyday consequence (`../content_market.md` §2).

## 2. What we refined in the approach, and why
1. **"World", not "place"** (above): the owner's 22:20 reframe would otherwise score down exactly the stories they now
   want considered. Guard against "anything can be a metaphor": a metaphor world scores high only if it passes the
   metaphor test (rubric W).
2. **Two sampling strata.** Stratum A, section-neutral (each outlet's sections, results taken in the order returned):
   the base rate, how often a big-journal story fits at all. Stratum B, place-targeted (cities, buildings, nature,
   infrastructure, archaeology): enough of the high-fit tail to cluster it. Every row carries its stratum; base rates
   come from A only.
3. **The outlets we can reach.** The search tool is refused by The Economist, The New York Times, The Guardian, The
   Atlantic, The New Yorker, The Wall Street Journal, the Financial Times, Wired, the BBC, Reuters, AP, New Scientist and
   the LA Times (their crawler opt-out, tested 2026-10-28 ~22:30 UTC), and the environment's network policy denies their
   hosts and feeds (checked 22:20 UTC). Reachable and used (11): **TIME, Forbes, Bloomberg** (incl. CityLab, Opinion and
   Businessweek: the nearest stand-in for The Economist's world-and-business analysis), **Fortune, MIT Technology
   Review, The Washington Post, CNN, NPR, National Geographic, Smithsonian, Scientific American.** If the owner allows the
   blocked hosts (the environment's Network access settings), their RSS feeds can be collected with curl and scored with
   this same rubric.
4. **Equal information for both scorers.** Both score from the corpus row alone (outlet, date, headline, section, type,
   our one-line summary), so their agreement measures the rubric, not research effort. A separate auditor re-finds
   about 10 % of the rows by fresh searches (no invented story, URL or date).
5. **Two shapes per story.** The NEWS shape (open-coded: what kind of event it is) and the TELLING shape (how it would
   be told in these views: the content thread's "middle" kinds, section 4.4), so the clusters say both which news fits
   and how we would tell it, and test the content thread's kinds against real stories.
6. **The top 10 use the owner's own order**, with our visual fit standing in for "visually appealing" (section 4.6).

## 3. The corpus
- **Window:** published 2026-09-28 to 2026-10-28 (the date as the search result or its URL gives it; a row with no date
  seen is dropped, never guessed).
- **Size:** about 240 rows from 11 outlets (about 22 each: ~16 stratum A + ~6 stratum B), two collectors (C1: TIME,
  Forbes, Bloomberg, Fortune, MIT Technology Review; C2: The Washington Post, CNN, NPR, National Geographic, Smithsonian,
  Scientific American).
- **Stratum A queries:** one per section the outlet runs (world, US and politics, business and economy, technology and
  AI, science, health, climate and environment, culture and arts, travel and lifestyle, history, sport where it has one),
  as "<outlet> <section> October 2026" (late-September variants for the window's first days), restricted to the
  outlet's domain; take the in-window ARTICLE results in the order returned, at most 3 per query; never choose by whether
  a story looks visual.
- **Stratum B queries:** 2-3 per outlet from: city, architecture or building, landmark, archaeology, storm or flood or
  wildfire or earthquake, river or ocean or coast, mountain or volcano or glacier, infrastructure (bridge, dam, rail,
  port, tunnel), festival or season, wildlife in a place, megaproject, the sky or space; same "in the order returned"
  rule.
- **Not stories (skipped):** section, tag, author and index pages; price and data tickers; methodology pages; videos or
  podcasts with no article page; press-room posts; sponsored content and Forbes Councils posts (paid membership
  content); exact duplicates. The same event at two outlets stays as two rows, linked by `dup_of` at scoring.
- **Fields** (`corpus.csv`, UTF-8, RFC 4180 quoting): `id` (J001...), `outlet`, `date` (YYYY-MM-DD), `date_source` (url /
  result), `headline` (the result's title), `url`, `section`, `type` (news / feature / analysis / opinion / interview /
  review / list / live), `stratum` (A / B), `query`, `summary` (one line in OUR words, 15-35 words: what happened, where,
  and the so-what; never article text: the repo is public, and paywalls are respected), `collector`.
- **The feed frame (added 2026-10-28 ~22:55 UTC, when the owner opened the network):** the orchestrating session
  fetched the outlets' RSS feeds (`feeds_raw.csv`: The Economist 415, The New York Times 299, The Guardian 190, The New
  Yorker 50, Wired 50, Forbes 48, The Atlantic 25, TIME 25, the FT 11; dated 2026-09-28..10-28; headlines, links and the
  feeds' tags only, no article text). Ids F0001-F1113, stratum F, source rss; the search rows keep their collector ids
  (C1-001...), source search. A story found both ways keeps its feed row. Feed rows have no summary: they are scored
  from the headline, section and tags (confidence marks the cryptic ones). Feeds carry recent items, so the last week
  is over-represented (about 70 % of feed rows are dated 10-21..28).
- **Bias, stated:** search favours popular pages; the section list is ours; one week's big events can crowd a section;
  the 13 blocked outlets (above) are missing, and with them much of the long-form analysis the owner named.

## 4. The rubric (each story; score from the corpus row only)

### 4.1 The gate: drawable in our look (pass / fail)
FAIL only if the story cannot be told without: a brand's logo or a product's screen as the subject; a real person's
recognisable likeness (a face or portrait as the point); gore, a death scene or graphic violence; explicit content.
A story ABOUT a person, a company or a disaster usually PASSES: draw the place, the building unbranded, people small and
from behind, the disaster gently (`../../../look/DIRECTION.md` rule 3; `../../../TOPIC_CRITERIA.md` 3). A fail keeps its
scores but never reaches the candidates.

### 4.2 Visual fit, 0-10 = W + H + D + N + M
- **W, the world, 0-3: can the story live in ONE drawable world, and does it happen TO that world?**
  - 3: the story's event happens TO one place we can draw as one home world: a real place (a city, a street, a
    building, a landscape, an interior) that changes because of the story, OR a metaphor world that passes all four
    parts of the **metaphor test**: (a) it maps one-to-one (each part of the system is one drawable thing), (b) it reads
    cold with the sound off, (c) the facts support it, (d) the news event is a physical change in that world (v1: each
    website is a building, and the bug turns the buildings dark).
  - 2: a place or world is central, but part of the mechanism lives elsewhere (papers, screens, money, a contract), or a
    metaphor fails one part of the test.
  - 1: a place is only the stage where it happened (v2's canal), or a metaphor would need explaining.
  - 0: no place and no honest world (a quarrel between people, a market number, an abstract rule): any world would be
    forced.
- **H, the hero, 0-2:** one building, landmark, machine, creature or object the story orbits (2: one obvious hero; 1: a
  hero exists but is shared, weak or generic; 0: none).
- **D, depth and scale, 0-2:** a layered world with something WAY further out (a skyline, mountains, the sea, the sky,
  the planet, deep time). 2: scale is built into the story itself (a storm over a town, a giant under a city, a tiny
  figure before something vast); 1: a scale move is possible but added; 0: close and flat (an office, a courtroom, a
  screen).
- **N, nature, season, light, 0-1:** weather, a season, light, water, plants or animals are part of the story (1), or
  not (0).
- **M, the mechanism shown, 0-2:** the "so what" can be shown with the sound off as the world or the hero changing. 2:
  literal and physical (a building goes dark, a street floods, a river comes back); 1: it needs a chart, a label, a
  board or a metaphor step; 0: only words can carry it.

### 4.3 Story value, 0-10 = (6 R + 5 T + 3 Mo + 2 F + 1 S) / 17 (each 1-10)
`TOPIC_CRITERIA.md`'s order and weights, with "visually appealing" left out (it is the other axis).
- **R, relevant with buzz and surprise:** 9-10: a big question millions care about, people already arguing about it, a
  "wait, seriously?" fact or twist and a concrete so-what for an ordinary person; 6-7: relevant to many, but little
  buzz or no twist; 3-4: niche or distant; 1-2: trivia or industry inside baseball. Any subject (the owner lifted the
  tech/AI clause for this brainstorm).
- **T, true and solid:** 9-10: hard news with primary sources (official data, a peer-reviewed study, on the record);
  6-8: solid reporting with some uncertainty (one source, an early study, estimates), or analysis built on data; 4-6:
  opinion, a column, a forecast; 2-4: a company's own claim told without a check; 1: rumour.
- **Mo, the mood the slate needs now** (the next video needs a positive story; news from a real city is positive:
  playbook): positive or hopeful 9; mixed 6; negative 3; tragic (deaths, violence) 1.
- **F, fresh:** 10: dated 2026-10-21 to 10-28; 8: 2026-09-28 to 10-20; minus 2-4 when nothing new happened (an evergreen
  feature, a guide, a retelling of history with no new find).
- **S, shareable:** 9-10: a strong reason to send it (identity: my city or my country; awe; outrage; something useful);
  5: mild; 1-2: none.

### 4.4 Tags (per story)
- `world`: real / metaphor / none (the world W scored). `real_place`: the named real place, or "none".
- `happens_to`: to (the story changes the place or world) / in (the place is the stage) / none.
- `conflict` Y/N (two sides, a threat, a dilemma); `everyday` Y/N (a consequence an ordinary person feels: money, home,
  health, commute, safety, weather); `mood`: pos / neg / mixed.
- `wow`, 0-2 (owner, 2026-10-28: "we need some WOW stories here"; playbook: every pick needs a WOW, a "wait,
  seriously?" fact or picture): 2: a fact AND a picture that would stop a thumb (something enormous, strange or
  seemingly impossible happening in a place: tech in a weird place, such as a data centre in a Cold War bunker or a
  supercomputer in a chapel; a city sinking; a storm turning at the last minute); 1: one surprising fact or picture,
  not both; 0: expected news (a rate decision, an election result, a quarterly report).
- `ad_risk` Y/N (a launch, a product or a company's own claim leads); `past_topic` Y/N (a past video's topic: the PHP
  flaw and government sites, the DeepMind contract, laptop and memory-chip prices, AI songs and fake plays);
  `tech_ai` Y/N (tech, AI or AI-adjacent: science, health tech, space, robots, computers, energy).
- `news_shape`: an OPEN code, 2-6 words, the kind of event (for example "a city's water runs out", "a landmark
  restored"); written fresh from each story, never picked from a list.
- `telling_shape`, ONE of (how this true story would be told in these views: the content thread's exchange 4 kinds,
  plus the true-story shapes kept from its exchange 3, `../content_discussion.md`): **nature hits a town** (storms,
  quakes, fires, floods, and what warned people); **something huge gets built** (or restored, torn down, reborn);
  **one person crosses a big world** (or one thing travels through it); **a crowd does one thing at once**; **new
  machines on real streets**; **real capers** (heists, scams, spies in real buildings); **finds at the edge** (the field,
  the deep sea, the sky: digs, new species, space); **the system as a world** (an invisible system drawn one-to-one, v1);
  **above and below** (the hidden machine under or behind the visible place); **two worlds side by side** (here and
  there, before and after); **the place changes** (a real place changes for any other reason); **none fits**. Myths,
  fables and what-ifs are not on the list (the owner's second steer).
- `view`: one line, the world we would draw: home place / hero / the far-out thing.
- `dup_of` (the id of the same event at another outlet), `confidence` (high / med / low: low when the row is too thin
  to judge), `note`.

### 4.5 Calibration anchors (scored with this rubric; our films use their real stories)
| Story | W | H | D | N | M | Fit | Why |
|---|---|---|---|---|---|---|---|
| v1: European governments switch off their own websites over a PHP flaw | 3 | 2 | 1 | 0 | 2 | **8** | metaphor world passes the test: each site a building, the buildings go dark |
| v2: she quit Google DeepMind; her contract bans criticising it for life | 1 | 1 | 1 | 1 | 0 | **4** | the canal is a stage; the mechanism is a contract on boards |
| v3: AI data centres buy the memory chips, so laptops cost more | 1 | 1 | 1 | 0 | 1 | **4** | the town sits behind a shopping screen; the price is a label (gate: pass only if no app screen leads) |
| The AI forecast that called the hurricane's turn toward one town | 3 | 2 | 2 | 1 | 2 | **10** | the storm happens TO the town; scale built in |
| The central bank holds interest rates | 0 | 0 | 0 | 0 | 0-1 | **0-1** | no world without forcing one |
| A city's taps run dry; neighbourhoods on rotating supply | 3 | 1 | 1 | 1 | 2 | **8** | the city changes; one reservoir could be the hero (2 if the story names it) |
| A new museum by a famous architect opens | 3 | 2 | 1 | 0 | 1 | **7** | the building is the hero; little changes but the skyline |

### 4.6 The candidates (top 10)
Gate pass, fit >= 6, WOW >= 1 (every pick needs a WOW), not a past topic, ranked by the owner's own topic order with
our fit as "visually appealing" (ties: the higher WOW):
**owner score = (6 R + 5 T + 4 fit + 3 Mo + 2 F + 1 S) / 21.** Each candidate gets its home place, hero, the far-out
thing, its telling shape, and the "ad or news?" check (`TOPIC_CRITERIA.md`: heard cold over its first frame, would its
line sound like a commercial?). A candidate is an idea, not a fact lock.

## 5. Reliability, clustering and outputs
- **Two stages (for ~1,250 rows, with a usage limit near):** a quick triage of every feed row (`t_fit` 0-10 and
  `t_wow` 0-2 from the headline, section and tags: `parts/triage_feeds.csv`, one agent); then the full rubric on stage 2
  (`stage2_ids.txt`, roles in `triage.csv`): every search row (already a sample, with summaries), the feed rows with
  `t_fit` >= 5 or WOW 2, and a seeded random 10 % of the other feed rows as a control, so the clusters are not only what
  the triage favoured and the control measures what it misses. Base rates for the feeds come from the triage over every
  feed row, corrected by the control; for the search rows, from stratum A.
- **The blind second scorer** re-scores a 20 % seeded random sample of stage 2 (stratified by source; ids in
  `blind_sample_ids.txt`) without seeing the first scores. Reported: on fit, Spearman rho, the mean absolute difference
  (MAD) and the share within +-1; on each sub-score, exact and +-1 agreement and the quadratic weighted kappa; on the
  gate, `world`, `happens_to`, `mood` and `telling_shape`, Cohen's kappa; on value, rho and MAD. **Good:** fit rho >=
  0.7, MAD <= 1.0 and >= 70 % within +-1. **Poor:** fit rho < 0.6 or MAD > 1.5: then the rubric is sharpened where the
  two disagreed (new anchors, never new weights), every row is rescored, and a fresh 20 % sample is checked.
- **The audit:** the search rows whose id ends in 0 (about 10 %) re-found by fresh searches (headline, URL and date match a real result); a row
  that cannot be re-found is dropped and counted.
- **Clustering:** the open `news_shape` codes are consolidated into about 8-15 clusters (each with a one-line
  definition; every row in exactly one). Per cluster: size (rows and distinct events), mean fit, mean value, share
  positive, share with a real place, the share with WOW 2, the top telling shapes, the best examples; and where
  high-fit stories come from (outlet, section, stratum). Two slices the owner named, reported whatever the clusters
  are: **tech in the cities** (tech or AI happening in a real place: `tech_ai` Y and W >= 2; the owner's possible
  umbrella) and **data centres** (every data-centre story, with its place and WOW). One chart: clusters by mean story value (x) against mean visual fit (y), bubble size =
  rows, readable on a phone.
- **Files (this folder):** `README.md` (this), `corpus.csv`, `scores.csv` (the first scorer, every row),
  `scores_blind.csv` (the second scorer, the sample), `blind_sample_ids.txt`, `clusters.csv` (id -> cluster),
  `clusters.md` (the analysis, the top 10 and the blind spots), `cluster_chart.png`, `SUMMARY.md` (one phone screen
  for the owner). Tools: `video/scripts/look/posters/journals.py` (merge, sample, agreement, stats).

## 6. Reliability result and changes after collection
- **2026-10-28 ~22:55 UTC, collecting, before any scoring:** the `wow` tag (4.4) and the WOW >= 1 condition for the
  candidates (4.6), and the two slices (section 5), from the owner's notes in the content thread (~22:38-22:50 UTC:
  "we need some WOW stories here"; tech in the cities as one possible direction; data centres in weird places: "those
  are interesting ones"; the playbook, "Places on screen"). The scoring formulas are unchanged.
- **The feeds:** the orchestrator reported (~22:30 UTC) that the owner opened the network and that the outlets' RSS
  feeds (The Economist, TIME, Forbes, The Atlantic, The Guardian, the NYT, the WSJ, Wired, The New Yorker, the FT) and
  Google News answer in its environment. From this session they do not: the fetch tool cannot reach economist.com, and
  news.google.com does not resolve (the session's network settings), and a curl check of the feeds was refused by this
  session's permission check. So the corpus stays search-based from the 11 reachable outlets; a session that can read
  the feeds can add the blocked outlets later with this same rubric (rows marked by source).
- **The blind check (2026-10-29 ~03:55 UTC): GOOD, no sharpening needed.** The first scorer scored all 308 stage-2
  rows (mean fit 3.84; 117 with fit >= 6), the blind scorer 63 of them. How to read it: both scorers are instances of
  the same model with the same rubric, so the agreement shows the rubric is unambiguous in those hands, not that a
  human art director would agree (a shared bias would not show here; the owner's reactions to the candidates are the
  real test). The gate's kappa is 0.00 only because nearly every row passes (98 % agreement: one fail on one side).
  The hardest calls, from both scorers' notes: W 2 vs 3 for soft, trend-driven change; a street or landform as the
  hero; M for placeless numbers (a chart = M 1); headline-only feed rows; the gate for TV and film.

  **Blind check: 63 stories** (the second scorer saw only the corpus rows and the rubric).

  | Measure | Fit (0-10) | Value (0-10) | Owner score |
  |---|---|---|---|
  | Spearman rho | 0.96 | 0.94 | 0.96 |
  | Pearson r | 0.96 | 0.94 | 0.97 |
  | Mean absolute difference | 0.52 | 0.27 | 0.27 |
  | Within +-1 | 89% | 98% | 98% |
  | Mean (second - first) | +0.17 | +0.06 | +0.08 |

  **Verdict on fit: GOOD** (good: rho >= 0.7, MAD <= 1.0, >= 70 % within +-1; poor: rho < 0.6 or MAD > 1.5).

  | Sub-score | Exact | Within +-1 | Weighted kappa | Mean (second - first) |
  |---|---|---|---|---|
  | W | 84% | 100% | 0.93 | +0.06 |
  | H | 87% | 100% | 0.90 | -0.03 |
  | D | 92% | 100% | 0.93 | +0.08 |
  | N | 98% | 100% | 0.96 | +0.02 |
  | M | 83% | 100% | 0.82 | +0.05 |
  | R | 60% | 100% | 0.92 | +0.14 |
  | T | 78% | 97% | 0.94 | -0.03 |
  | Mo | 56% | 84% | 0.93 | +0.29 |
  | F | 86% | 89% | 0.85 | -0.27 |
  | S | 57% | 100% | 0.90 | -0.08 |
  | wow | 79% | 100% | 0.73 | -0.17 |

  | Tag | Agreement | Cohen kappa |
  |---|---|---|
  | gate | 98% | 0.00 |
  | world | 89% | 0.76 |
  | happens_to | 76% | 0.64 |
  | mood | 87% | 0.81 |
  | telling_shape | 83% | 0.78 |
  | conflict | 90% | 0.81 |
  | everyday | 97% | 0.91 |
  | ad_risk | 98% | 0.92 |
  | tech_ai | 97% | 0.93 |

  Fit disagreements of 3+ points: F0552 (0 vs 3); F0450 (0 vs 3)

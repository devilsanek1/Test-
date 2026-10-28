# Content fit: which stories put cities and buildings on screen, for our channel (content lens B)

**Lens:** OUR FIT. The owner's question (2026-10-28): "which type of content would be best fit into videos where we have
more of cities / architectures / buildings / etc". Study brief: `README.md` (this folder). Analysis only; nothing here is
a rule until the owner approves it. Status: SKELETON (being filled).

## 1. Our evidence (and its limits)

**What the three films put on screen.** Tagged by eye at 1 frame every 2 s from the delivered masters
(`img/content_fit_place_share.jpg`; tags in the sheet's colour bars): **P** = a street, building or skyline is the
frame's subject; **A** = a building's blueprint; **B** = a text board leads; **O** = an object or screen leads.

| Film | Story | Frame 0 | P (place-led) | Other | Length | Instagram (playbook, Performance log) |
|---|---|---|---|---|---|---|
| v1 "php2shell" | a PHP bug; governments in Europe switch off their own websites | civic buildings power down under a power-button sun (a place event) | **23 / 28 (82 %)** | A 4, B 1 | 55.4 s, 30 fps | ~24 h: ~2.1K views (86 % Reels tab, 11 % Explore); skip rate **32.2 %**; likes 2.5 %, shares 0.7 %, saves 0.4 %; retention ~76 % at 2 s, ~58 % at 5 s, ~33 % at 15 s, ~19 % at the end |
| v2 "One Small Window" | she quit Google DeepMind; she says her contract bans criticising it for life | she walks out of a canal-side office | **13 / 20 (65 %)** | B 6, O 1 | 39.1 s, 60 fps | **none in the repo**: the master, cover and posting kit were finished 2026-10-28 19:55 UTC (`docs/v2/PROGRESS.md`); no post, no insights logged |
| v3 "laptop prices" | AI data centres buy the memory chips, so laptops cost more | a shopping app's price tag and "Add to cart", "Buying a laptop soon?" | **1 / 21 (5 %)** | O 20 (the phone; the data-centre town sits behind it in 15) | 41.2 s | early check (not 24 h): skip rate **64.5 %** ("higher"); likes 1.1 %, shares, saves, comments 0; retention ~40 % at ~2 s, ~33 % at 5 s, ~6 % at the end |

**What the places did in each film** (our reading, not the owner's words):
- **v1's city was the mechanism, not a backdrop.** It is not a real city: each website is a building (S01's civic
  buildings are the government sites that go dark; S03's street of houses built "from one blueprint" is the 7 in 10
  sites on PHP; the makers' lane is PHP's own workshop: `docs/scenes/S01.md`, `S03.md`, `S06.md`). Every "so what" of the
  script happens TO a building, so the place, the story and the payoff are one picture. That is the strongest reading of
  "places on screen" in our own data: places that DO the story.
- **v2's canal was a real place where it happened** (her office's bank, the towpath, her bank; Arlington for the one
  scale reveal: `docs/v2/THROUGHLINE.md` §1.4). It is the look the owner likes. But the argument rode on text boards
  (6 of 20 frames: "APRIL 2026 DEAL", "GOOGLE SAYS", "SHE SAYS"), and nothing in the canal changes because of the story:
  the place was the stage, not the mechanism. The owner found the story weak; a beautiful place did not rescue it.
- **v3's place was behind the product.** The one shot where the data-centre town leads (20 s) is the film's only P
  frame; everywhere else a shopping screen leads, and frame 0 read as an ad (the owner's read, playbook Audience and goal).

**What can be concluded.** (1) The ranking by place share (v1 82 % > v2 65 % > v3 5 %) agrees with the one performance
ranking we have (v1 > v3). (2) Most of the measured gap is in the first 2-3 s: v3 lost ~60 points by ~2 s, v1 ~24; after
~5 s both curves slide slowly. Instagram's skip rate is the share of views that leave within the first 3 s (in Insights
since Aug 2025: https://metricool.com/instagram-reel-analytics/ and https://marketing4ecommerce.net/en/retention-and-skip-rate-reels/,
search summaries, accessed 2026-10-28), so what our numbers speak to is **frame 0 and the first line**, not the whole
film's share of places. (3) A place that IS the mechanism (v1) is compatible with our best numbers; a place used as a
stage for boards (v2) is the look the owner likes with the story they found weak.

**What cannot be concluded.** That places help. v1 and v3 differ in almost everything at once: topic (a security event
vs prices), hook (news vs a sales question the owner read as an ad), frame 0 (buildings vs a shopping app), length
(55 vs 41 s), line style (v1's ink vs the clean pen), measurement window (~24 h vs an early check), account age (post
1 on 25 Oct vs post 2 on 28 Oct, est. from the logs), posting time (not logged). v2, the place-led film the owner likes,
has no numbers. Two data points with no control cannot separate "places" from "not an ad"; Instagram's distribution is
also noisy from post to post (est.).

**The owner's hypothesis, stated as one:** *videos whose world is cities, architecture and buildings will look better and
perform better for us.* Split it so it can fail:
- **H1 (the opening):** a frame 0 where a place changes (a building goes dark, a street floods, a skyline lights up)
  lowers the skip rate against a frame 0 led by an object or screen, for the same story and the same first line.
- **H2 (the film):** films where the place carries the mechanism (v1's way) hold viewers better after 5 s and earn more
  saves and shares than films where places are a stage (v2's way).

**What the next 2-3 videos can measure** (cheap, no control film made on purpose):
1. **The same film, two openings, as Instagram Trial Reels** (shown to non-followers only, results after ~24-72 h;
   test announced May 2024, launched Dec 2024: https://techcrunch.com/2024/05/31/instagram-tests-trial-reels-that-dont-display-to-a-creators-followers,
   https://business-standard.com/technology/tech-news/instagram-introduces-trial-reels-feature-what-it-is-how-it-works-more-124121100429_1.html,
   accessed 2026-10-28; eligibility unclear: some guides say 1,000+ followers, so check the account first). Opening A:
   the place event at frame 0; opening B: the same line over the thread object in close-up. Only the first ~3 s differ
   (cost S: one extra opening shot). Compare skip rate, 3 s hold and average watch at the same hour. Tests H1 directly.
2. **One log line per film, the same way every time** (an addition to the playbook's Performance log, the orchestrator's
   call): place share (P frames at 1 per 2 s, as in `img/content_fit_place_share.jpg`), frame-0 type (place event /
   object / person / screen), the ad-or-news verdict, archetype (section 2), length, post day, hour and post number;
   Instagram at **exactly 24 h** (v3's numbers are an early check, v1's are 24 h: not comparable): views, % non-followers,
   skip rate, retention at 2 / 5 / 15 s, average watch, shares and saves per 1,000 views. Tests H2 over time.
3. **A decision rule, set before the results (est.):** if the place-led opening beats the object-led one by 5+ skip-rate
   points in 2 of 2-3 trials, "a place event at frame 0" becomes a default; if not, places stay a look choice (the owner
   likes it, reason enough) rather than a growth lever. At ~2,000 views a skip rate's sampling error is about ±1 point
   (est., binomial), so a 5-point gap is visible; the bigger noise is which audience Instagram picks.

## 2. Archetypes ranked

_(pending)_

## 3. Candidates now

_(pending)_

## 4. Recommendation and open questions

_(pending)_

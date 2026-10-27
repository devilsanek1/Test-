# Video 4, G0 round 2: pick the topic (tech + AI)

Written 2026-10-27 (Tue) by head of editorial, after the owner's note on round 1: "lets focus on tech and AI related news"
(round 1 is in `archive/G0_TOPICS_round1.md`). Input: 6 tech/AI scouts (`scouting_r2/`) plus round 1's tech candidates
(R*), 31 candidates in all, 3 judges. Rules used: different beats, average judge evidence of 7 or more, no
Anthropic/Claude as a key entity, no Google-military-AI or AI-memory-chip stories (v2/v3), at least one AI story and one
non-AI tech story. Fact status: adversarial fact-check 2026-10-27 (scouts + fresh web checks); per-topic status under each pick; the picked
topic still gets a full source check before G0.5.
Committed 2026-10-27.

## Pick one

**A. "Grandma has 7 days" (Spotify's family-plan QR check).** Everyday wallet. 90.7/110, evidence 7.3, top 3 for 3/3 judges.
- What: since about 19-21 Oct 2026 Spotify asks some Family-plan members to scan a QR code from the plan manager's phone, in person, within 7 days.
- Thesis: The code doesn't check where you live, it checks that two phones are in the same room, so the grandparent, the student and the sibling across town drop to ads or pay for their own plan ($12.99 Individual, $6.99 Student, instead of about $3.67 a seat).
- Frame 0: "Your mum's Spotify now needs your phone"
- Hook: "Your mum loses her Spotify Premium unless she scans a code from your phone. In person. Within 7 days."
- Alt: "This QR code changes every few seconds, and that's the whole point." / "Spotify just turned your family plan into a scavenger hunt."
- Twist: the code rotates so you can't text a screenshot (video-call workarounds are reported), and failing locks you out of every Family and Duo plan for 12 months.
- Why it works: consequence 9/9/9, shareability 9/10/10, relevance 9/9/9; the owner's favourite kind of story, with a built-in send ("send this to whoever's on your Spotify").
- Main risk: no named person yet, rollout countries and selection share unclear; Spotify is enforcing a rule that was always there, not inventing one (co-CEO Alex Norström, Q3 call 22 Oct: a "routine improvement").
- Fact status: CHECKED 2026-10-27. Mechanism, 7 days, 12-month lock, drop to Free (9to5Google 19 Oct, US support page), US prices (Jan 2026) and the Q3-call "routine improvement" (Norström, 22 Oct, secondary) confirmed; fixed: "stop working" (it drops to Free, not off), "random" (unsourced), "bill triples" (per person, not per family), "can't be faked" (video calls reportedly work), uni student ($6.99 Student). Open: countries, share selected, transcript wording, no named user.

**B. "Nobody listens, artists still pay" (AI songs and the shared pot).** AI. 83.0/110, evidence 7.3, top 3 for 2/3 judges.
- What: 20 Oct 2026 Spotify said it has pulled 50M+ likely-AI tracks from its recommendations this year; NPR, 27 Oct: "Is 2026 the fakest year in music?"; Deezer (July): AI is over half of daily uploads but 1-3% of streams.
- Thesis: Streaming pays artists from one shared pot split by share of all streams, so bot plays that slip past fraud filters shrink every real artist's slice, even if no human ever listens to the songs.
- Frame 0: "Half of one app's new songs aren't human"
- Hook: "Half the new songs uploaded to one streaming app are made by AI. Almost nobody listens to them. That's exactly the problem."
- Alt: "Almost nobody listens to AI songs. They still take money from your favourite artist." / "Spotify just hid 50 million AI-looking songs from you. Here's who they were taking from."
- Twist: the fakes don't need fans: the money comes from bots "listening", and whatever the filters miss drains a pot real artists share.
- Why it works: surprise 8/8/8, visual 9/8/9; a "wait, that's how it works?" mechanism, and an AI story of a different kind from v2/v3 (culture and pay, not military or chips).
- Main risk: the artist loses money, not the viewer; no per-artist dollar figure exists; Hayduk's quote is only partly verbatim; detected fraud is already removed from the pot (Deezer), so the drain is the undetected part. Also Spotify again, like A.
- Fact status: CHECKED 2026-10-27. NBC 20 Oct (50M+ pulled from recommendations, not deleted; AI Persona), Deezer July figures, NPR 27 Oct, Blake quote and Smith sentence (6 Oct, 18 months, ~$8.09M) confirmed; fixed: Deezer removes all detected fraud from the royalty pool, so the drain is only fraud that slips through (thesis, twist, payoff reworded); the stakes line no longer joins Deezer's "half" to Spotify's 50M as "them". Open: Hayduk's full sentence, a primary pro-rata explainer.

**C. "The box in your hallway" (a router hole nobody will fix).** Home security, non-AI. 82.0/110, evidence 7.7, top 3 for 1/3.
- What: 16 Oct 2026 (Hexacon, Paris; covered 19-20 Oct) Quentin Kaiser showed a flaw (in the code since at least 2010) in Broadcom's Wi-Fi pairing (WPS) code that opens some ISP routers with no Wi-Fi password; Broadcom won't fix the older chips (per Kaiser; no on-record Broadcom statement).
- Thesis: Your strong Wi-Fi password doesn't help if the chip inside your ISP's box is past its support date, and nobody prints that date on the box.
- Frame 0: "Some routers open without your Wi-Fi password"
- Hook: "Strong Wi-Fi password? For this one, it doesn't matter. And the chip maker says it won't fix it."
- Alt: "This bug is 16 years old, and it's staying." / "The box in your hallway has an expiry date nobody told you about."
- Twist: Broadcom has known since 2018 (per Kaiser), shipped half a fix, and refused a CVE number, so the usual alarm systems don't even see it.
- Why it works: relevance 8/8/8, shareability 8/8/8, a named researcher in his own words, and a tip people send their parents (ask your provider about your box; turning WPS off may not be enough).
- Main risk: confirmed devices are Belgian ISP boxes (about 1.56M, rough estimate); "worldwide" is the researcher's estimate (Zyxel thinks only a few older models); no attacks seen, so always "could". The "turn WPS off" tip is disputed: PCWorld reports Kaiser says disabling WPS isn't enough on affected models.
- Fact status: CHECKED 2026-10-27. Hexacon 16 Oct, code since 2010, half-fix 2018, no CVE, Belgian estimates, demo devices confirmed (THN, Techzine 19 Oct, PCWorld 20 Oct); fixed: Kaiser quote restored to "...routers in Belgium, and likely elsewhere as well"; "turn WPS off" demoted from the payoff (PCWorld: per Kaiser, not enough on affected models; Techzine lists it); Broadcom stance marked as Kaiser's account. Open: WPS-off effectiveness (check Kaiser's blog), worldwide scope (Zyxel: few older models), ~11 days old.

**Recommendation: A (Spotify family QR).** It's the clearest everyday-wallet hit with the strongest send reason in the pool; C is the pick if the owner wants a story about safety rather than money.

---

## A. Grandma has 7 days (Spotify's family-plan QR check)

Fact status: checked 2026-10-27, wording fixed in place; details and open points in the A summary above.

**Big question.** Why does everything I subscribe to keep getting more expensive, and what's next?

**So-what chain.** Spotify now checks Family-plan members with a QR code, so what? The code changes every few seconds and has to be
scanned in person from the manager's phone, so a forwarded screenshot won't work. So what? Anyone on the plan who doesn't live
there (grandma, the kid at college, the sibling across town) fails it within 7 days. So what? They drop to free with ads and
can't join any Family or Duo plan for 12 months, or they pay $12.99 for their own account ($6.99 if a student) instead of about $3.67 for a seat
on a full $21.99 plan. So what? That person's music bill can more than triple, and "family" now means "people who live
under one roof".

**Understanding shift.**
- Before: "Spotify's cracking down on sharing, like Netflix did."
- During: "Wait, it doesn't check my address at all? It checks that our phones are in the same room?"
- After: "Oh, that's why a screenshot won't work, and why grandma needs to physically see my phone. And if she fails, she's locked out for a year."
- Tell-a-friend version: "Spotify's family plan now makes everyone scan a QR code from the main phone, in person, within a week. If your mum doesn't live with you, she's going to ads or paying full price."

**Beat outline (about 38 s, roughly 105 spoken words).**
| Time | Beat | Line idea | Key image |
|---|---|---|---|
| 0-3 s | Hook | "Your mum loses her Spotify Premium unless she scans a code from your phone. In person. Within 7 days." | Frame 0: "Your mum's Spotify now needs your phone"; ink lines of a kitchen draw in, colour floods; mum's phone buzzes, a 7-day countdown pops up over her music. |
| 3-10 s | Stakes | "Because Spotify's started checking who's really on your family plan. And the code it uses changes every few seconds." | A QR code on the manager's phone flickering to a new pattern every beat; mum holds up her phone to the camera and the screenshot she was sent goes grey. |
| 10-20 s | Explanation | "So it doesn't check your address. It checks one thing: are your two phones in the same room. That's it." | **Cozy enclosure:** a warm apartment cut-away, the family on the sofa, phones tapping together; every scan lights a little green tick. |
| 20-30 s | Twist | "But your sister across town, grandma two towns over? They can't. And if they fail, they're back to ads, and locked out of every family plan for a year." | **Scale moment:** pull out of the apartment to a map of the country, dotted lines to a dorm, grandma's cottage, a flat across town, each line snapping as the countdown hits zero. |
| 30-38 s | Payoff | "So a seat that cost about three sixty-seven becomes her own plan at twelve ninety-nine. Send this to whoever's on your Spotify, before their week runs out." | Back to mum's kitchen: the music cuts to an ad; she looks at her phone, then at the door. Hold. |

**Real person.** None verified yet. Fallbacks: Spotify's support page, quoted by 9to5Google: members must "verify they live with
the plan manager by scanning a QR code"; co-CEO Alex Norström called it a "routine improvement" rather than a crackdown on the Q3 call, 22 Oct 2026 (mezha.ua,
TechCrunch; confirm against the transcript). Next step: find a named affected user in press (an on-record family member, not an anonymous Reddit post).

**Facts, sources, dates.**
- Some Family members asked to verify (9to5Google: members "may need to"; "random" is not in Spotify's text); manager opens a QR code (Your Premium > Manage), member scans it in person; code rotates every few seconds; 7 days to do it; failing means free tier with ads and a 12-month block from Family and Duo plans. Sources: 9to5Google (Ben Schoon), 2026-10-19, https://9to5google.com/?p=733773 ; TechSpot, ~2026-10-21, https://techspot.com/news/114285-spotify-thinks-rotating-qr-codes-stop-family-plan.html ; ProPakistani, 2026-10-21 ; Galaxus/Digitec, https://www.digitec.ch/en/page/family-plan-spotify-verifies-households-44152
- US prices since Jan 2026: Family $21.99 (up to 6 accounts), Individual $12.99. Notebookcheck, Jan 2026; Hypebot, Jan 2026.
- Spotify's Q3 call, 2026-10-22: co-CEO Alex Norström, "routine improvement" (secondary reports; confirm against the transcript). Code rotation "every few seconds" is per Spotify's warning as relayed by TechSpot/Galaxus and Reddit users in 9to5Google.

**Uncertain or disputed.**
- Which countries (9to5Google linked the US support page; Galaxus is Swiss, ProPakistani regional) and what share of members get picked.
- Whether Spotify scales the check up or softens it after the backlash.
- "$3.67 a seat" assumes all 6 seats are used; say "about" and localise for the audience (EUR/GBP prices differ).
- Netflix's post-crackdown sign-ups: only mention with a checked figure.
- Reddit workarounds (video calls, spare devices): anecdotal, leave out of the script, but don't claim the check "can't be faked": video calls reportedly get past it.
- Students: a uni student can move to Student ($6.99), not $12.99; keep the $12.99 payoff on a non-student (mum, grandma, sibling).

**Fairness notes.** Spotify isn't a villain: the household rule has always been in the terms, and it's now enforced. Say that
once, plainly. No "Spotify is stealing from you". Grandma and the student are sympathetic, not victims of a scheme.

---

## B. Nobody listens, artists still pay (AI songs and the shared pot)

Fact status: checked 2026-10-27, wording fixed in place (fraud filters, two platforms, frame 0 scoped to one app); open points in the B summary above.

**Big question.** Is AI quietly taking money from real artists, and does it change what I hear?

**So-what chain.** Spotify has pulled 50M+ likely-AI tracks out of its recommendations this year, so what? On Deezer, AI tracks
are now over half of daily uploads (about 90,000 a day) yet only 1-3% of streams. So what? Most of what those fakes do earn
comes from bots: Deezer found up to 85% of streams on fully-AI tracks were fraudulent (2025), and strips the ones it catches
from the pot. So what? Streaming pays artists from one shared pot, split by each track's share of all streams, so every bot
stream that isn't caught makes everyone else's slice smaller. So
what? Your favourite small artist gets a little less every month from songs nobody wrote and nobody heard, and the app now
uses an algorithm to decide what counts as "human" in your feed.

**Understanding shift.**
- Before: "There's AI junk on Spotify, but I just don't listen to it, so who cares?"
- During: "Wait, they don't need anyone to listen? Bots do the listening?"
- After: "Oh, it's one pot. Fake plays shrink the slice for every real artist, whether I hear the fakes or not."
- Tell-a-friend version: "Half the songs being uploaded are AI, and almost nobody listens to them. But bots do, and streaming money is one shared pot, so every fake play takes a bit from real artists."

**Beat outline (about 40 s, roughly 110 spoken words).**
| Time | Beat | Line idea | Key image |
|---|---|---|---|
| 0-3 s | Hook | "Half the new songs uploaded to one streaming app are made by AI. Almost nobody listens to them. That's exactly the problem." | Frame 0: "Half of one app's new songs aren't human"; ink lines of a record shop wall draw in, colour floods; every second sleeve flips to a blank grey face. |
| 3-10 s | Stakes | "And Spotify just pulled more than 50 million AI-looking tracks out of its recommendations this year. So who were they for?" | **Scale moment:** a vast factory pours grey records onto belts that run out to the horizon, tiny workers drowning in the stack. |
| 10-20 s | Explanation | "Here's how you get paid on streaming: all the money goes into one pot, and each song gets a slice the size of its share of all plays." | A giant royalty cake on a table; each artist's slice drawn to the size of their play count. |
| 20-30 s | Twist | "So the fakes don't need fans. They need bots. A queue of fake listeners plays them all day, and every play that isn't caught makes their slice bigger, and everyone else's thinner." | Robot "listeners" with headphones queueing at turnstiles; the cake's real slices thin out one by one. |
| 30-40 s | Payoff | "So your favourite singer gets paid a bit less every time a robot gets away with playing a song nobody wrote." | **Cozy enclosure:** a lamp-lit attic, one small guitarist playing to three real listeners; her slice on a saucer, visibly thinner. Hold. |

**Real person.** Morgan Hayduk, CEO of the streaming-fraud company Beatdapp (NBC News, 2026-10-20), verbatim start: "If the denominator has
grown because of AI slop, the percentage that each legitimate rights holder..." (get the rest of the sentence before G0.5).
Alternative: James Blake (NPR, 2026-10-27), verified: "If you're an artist, remember that in 2026 there's not a single part of the system that isn't faked."
Background: Michael Smith was sentenced on 2026-10-06 to 18 months in prison and ordered to forfeit about $8.09M for bot-streaming AI songs (MBW, WUNC).

**Facts, sources, dates.**
- Spotify: 50M+ likely-AI tracks removed from curated recommendations in 2026 (most still on the platform); "AI Persona" badge, profiles left out of recommendations by default. NBC News, 2026-10-20, https://www.nbcnews.com/business/media/spotify-slop-spam-ai-tracks-rcna604571
- Deezer: AI tracks over 50% of daily uploads in June 2026 (~90,000/day), 1-3% of streams; up to 85% of streams on fully-AI tracks fraudulent (2025); "All fraudulent streams are removed from the royalty pool" (Deezer FAQ). Deezer newsroom, 2026-07; TechCrunch, 2026-07-21.
- NPR, "Is 2026 the fakest year in music?", 2026-10-27 (via KPBS). Sony's 260,000+ takedown requests: Music Business Worldwide.
- Pro-rata "one pot" payout model: standard streaming payout model; cite a primary explainer before scripting.

**Uncertain or disputed.**
- "50 million" means removed from recommendations, not deleted. Say "pulled from recommendations" or "hid".
- "Half of uploads" is Deezer's figure only; on frame 0 say "one streaming app", never "Spotify".
- The 85% fraud share is from 2025; date it on screen.
- The per-artist effect is real but unquantified: no dollar figure. Platforms already demonetise the fraud they catch (Deezer: all of it), so the line must be about fraud that gets through, not every bot play.
- The hook's "half" (Deezer, June) and Spotify's 50M are two different platforms; never let "them" link the two.
- Detection is imperfect; some human tracks may be flagged.

**Fairness notes.** Not "AI music is theft": AI-assisted songs by real people are a different thing. The villain isn't AI or
Spotify, it's fraud (bots), and the platforms are actively fighting it; give them that. A and B both touch Spotify: if the
owner wants two different worlds on the shortlist, swap B for runner-up T6 (Barclays, "the icing, not the cake").

---

## C. The box in your hallway (a router hole nobody will fix)

Fact status: checked 2026-10-27, payoff and quote fixed in place; open points in the C summary above.

**Big question.** Is my home Wi-Fi actually safe?

**So-what chain.** A researcher showed a flaw in Broadcom's WPS code, the "press the button to pair" feature, so what? Someone
within Wi-Fi range can take over affected routers without the Wi-Fi password. So what? The code dates to at least 2010,
Broadcom shipped an incomplete fix in 2018 and says the older chips are out of support, so on those it will never be fixed.
So what? Your provider chose the box and the chip, you didn't, and nobody told you it has a security expiry date. So what?
Someone parked across the street could get onto your home network; the thing you can do is ask your provider to check or
swap the box (turning WPS off is worth trying but, per PCWorld's report of Kaiser, may not be enough).

**Understanding shift.**
- Before: "I've got a long Wi-Fi password, so I'm fine."
- During: "Wait, they can get in without the password? And the company just won't fix it?"
- After: "Oh, the box runs code from a chip maker that stopped caring years ago. My password protects the front door, but this is a side door in the box itself."
- Tell-a-friend version: "Some internet-provider routers have a 16-year-old hole that lets someone nearby in without your Wi-Fi password, and the chip maker won't fix it. Ask your provider about your box."

**Beat outline (about 40 s, roughly 110 spoken words).**
| Time | Beat | Line idea | Key image |
|---|---|---|---|
| 0-3 s | Hook | "Strong Wi-Fi password? For this one, it doesn't matter. And the chip maker says it won't fix it." | Frame 0: "Some routers open without your Wi-Fi password"; ink lines of a hallway shelf draw in, colour floods; a long password types itself on a sticky note, then a side panel on the router swings open anyway. |
| 3-10 s | Stakes | "A researcher just showed that someone across the street can take over certain home routers. No password needed." | **Cozy enclosure:** a warm apartment at night, family on the sofa, the router blinking in the hallway; outside the window, a tiny figure on a bench with a laptop. |
| 10-20 s | Explanation | "Because of the little pairing button, WPS. The code behind it is from 2010, and it's in the chip your provider picked, not you." | Cutaway inside the router: a tiny chip stamped "2010", a little worker pressing the pair button, a crack in the code. |
| 20-30 s | Twist | "But the chip maker has known since 2018. It sent half a fix, and now says those chips are too old to support. Even though they're still in people's hallways." | **Scale moment:** pull back to a city of apartment blocks, every window with the same blinking router; then a giant warehouse shelf of identical boxes with a crooked "SUPPORT ENDED" sign. |
| 30-40 s | Payoff | "So your router has an expiry date nobody printed on the box. Ask your provider if yours is on the list, and if it is, ask for a new one." | Back in the hallway: a hand dials the provider, then swaps the old box for a new one; the side panel is gone. Hold. |

**Real person.** Quentin Kaiser, security researcher: "from across the street, you can gain a root shell on a
significant portion of the routers in Belgium, and likely elsewhere as well" (Techzine, 2026-10-19; never cut "in Belgium"). Use his "forever day" phrasing only from his own talk or blog.

**Facts, sources, dates.**
- WPSplinter presented at Hexacon, Paris, 2026-10-16; demos on an Orange Belgium Askey TCG3000 (read the Wi-Fi key, joined the network) and a Proximus Sagemcom BBOX3V+ (remote shell). Code from at least 2010; incomplete fix 2018; Broadcom refused a CVE. The Hacker News, 2026-10-19, https://thehackernews.com/2026/10/unpatched-broadcom-wi-fi-flaw-lets.html ; Techzine, 2026-10-19, https://www.techzine.eu/news/security/145085/broadcom-wpsplinter-vulnerability-leaves-millions-of-belgian-routers-vulnerable/ ; Security Affairs, Oct 2026 ; Dutch IT Channel, 2026-10-20 ; Cybernews, Oct 2026.
- Belgian estimates (from BIPT data): ~850k Proximus, ~500k VOO, ~210k Orange gateways, ~1.56M total; none patched as of 15 Oct. No attacks seen in the wild.
- "Forever day" on older eCos chips (BCM3380/3383/33834): Kaiser.

**Uncertain or disputed.**
- Confirmed devices are Belgian ISP boxes; "millions worldwide" is Kaiser's estimate, and part of his wider vendor list is only "likely vulnerable" from automated checks. Say "the same chip family is sold widely".
- Broadcom's position comes via Kaiser and press paraphrase; no on-record statement. Request one, or say "according to the researcher".
- Turning WPS off: Techzine lists it as a mitigation, PCWorld (2026-10-20) says per Kaiser it isn't enough on affected models. Don't sell it as the fix; check Kaiser's blog before scripting.
- About 11 days old: the peg is the talk and the coverage, not a new event this week.

**Fairness notes.** Demonstrated possibility, not attacks: always "could". Broadcom isn't a cartoon villain: ending support
for old code is normal; the story is that the box outlives the support and nobody tells you. Don't name or shame ISPs beyond
the confirmed demo devices.

---

## Score table (weighted /110; hook, consequence and evidence count double)

| Rank | ID | Beat | Topic | Score | Evidence avg | Status |
|---|---|---|---|---|---|---|
| 1 | T20 | viral_tech | Spotify family plan QR check | 90.7 | 7.3 | **Pick A** |
| 2 | R1 | round1_tech | 700 supermarket freezers turned into ovens | 83.0 | 8.0 | Eligible; 16 days old, no named quote, owner already saw it in round 1's runner-ups; runner-up |
| 2 | T8 | ai_frontier | AI songs drain the shared royalty pot | 83.0 | 7.3 | **Pick B** |
| 4 | T12 | security_scams | Router hole nobody will fix (WPSplinter) | 82.0 | 7.7 | **Pick C** |
| 5 | T6 | ai_jobs_money | Barclays: AI "the icing, not the cake" | 81.3 | 7.3 | Eligible; judge 2 says the thesis overreads the quote; runner-up |
| 6 | R2 | round1_tech | WhatsApp bot told not to mention regulators | 80.7 | 7.0 | Eligible; 3 weeks old, no verbatim quote |
| 6 | T13 | security_scams | Forgotten app, expired domain (Popcorn Time) | 80.7 | 8.0 | Eligible; piracy-adjacent, fix months old |
| 6 | T23 | viral_tech | Ad auctions leak your data, spyware case | 80.7 | 7.0 | Eligible; geopolitically sensitive, no quote |
| 9 | T1 | ai_everyday | Character.AI bankrupt: who gets your chats? | 80.3 | 7.3 | Eligible; 30 Oct hearing peg, no named voice; runner-up |
| 10 | R7 | round1_tech | One London power cut froze bank cards | 80.0 | 6.7 | Out (evidence < 7) |
| 11 | R3 | round1_tech | Padlock key was the number 4 | 78.3 | 8.3 | Eligible; near miss, owner passed on it in round 1 |
| 12 | T16 | platforms_gadgets | Phone checks with your bank app, hangs up | 77.7 | 6.0 | Out (evidence < 7; 13 days old) |
| 13 | T9 | ai_frontier | OpenAI cuts its AI off the live internet | 77.3 | 7.0 | Eligible; small personal consequence, doom risk |
| 13 | T21 | viral_tech | Folding iPhone breaks from opening | 77.3 | 6.0 | Out (evidence < 7) |
| 15 | T10 | ai_frontier | ChatGPT ads, some talk back | 77.0 | 7.3 | Eligible; low surprise, weak named voice |
| 16 | T17 | platforms_gadgets | $1,999 foldable cracks, $19 layer | 76.7 | 7.0 | Eligible; narrow audience, may fizzle |
| 17 | T22 | viral_tech | AI costs up to 6x more in Amharic | 74.7 | 6.0 | Out (evidence < 7) |
| 18 | R5 | round1_tech | Türkiye age tokens from 1 Nov | 73.7 | 7.0 | Eligible; regional, politically delicate, tiny window |
| 19 | T5 | ai_jobs_money | Netherlands cuts 25,000 jobs, AI plan later | 73.3 | 7.3 | Eligible; distant for non-Dutch viewers |
| 20 | R8 | round1_tech | Microsoft offers 60,000 staff money to quit | 72.3 | 8.3 | Eligible; outcome unknown until Dec |
| 21 | T3 | ai_everyday | Two chatbots, opposite votes | 70.0 | 4.7 | Out (evidence < 7; partisan) |
| 22 | T18 | platforms_gadgets | Smart glasses, EU says a light isn't enough | 69.0 | 6.7 | Out (evidence < 7) |
| 23 | T14 | security_scams | Samsung TV borrows soundbar mic (unverified) | 68.7 | 3.0 | Out (evidence < 7; single pseudonymous source) |
| 24 | T7 | ai_jobs_money | Meta's AI spending outran its cash | 67.3 | 7.0 | Eligible; too close to v3 |
| 25 | T4 | ai_everyday | AI tutor, lower grades | 66.7 | 6.0 | Out (evidence < 7; 25 days old) |
| 26 | R6 | round1_tech | Meta, 43.9M violations in New Mexico | 65.0 | 7.7 | Eligible; no new peg |
| 27 | T2 | ai_everyday | 1 in 3 young adults ask chatbots about drugs | 64.7 | 5.7 | Out (evidence < 7) |
| 28 | T19 | platforms_gadgets | Starlink terms of service slowed a war's internet | 63.0 | 6.7 | Out (evidence < 7; military, partisan) |
| 29 | R4 | round1_tech | 18,835 crypto wallets destroyed | 62.0 | 7.0 | Eligible; crypto niche |
| 30 | T11 | ai_frontier | Siri remembers voicemails and browsing | 61.3 | 5.0 | Out (evidence < 7) |
| 31 | T15 | security_scams | Meta glasses recorded unprompted | 56.7 | 5.0 | Out (evidence < 7) |

Judges' top 3: judge 1 T20, T8, T12; judge 2 T20, R1, T8; judge 3 T20, T6, R1.
No candidate breaks the Anthropic exclusion (T9 mentions it only in passing; it would stay out of any script).

## Runner-ups worth keeping for later videos

1. **T6, "The icing, not the cake" (Barclays, 5,000 jobs).** A named CEO in his own words (C.S. Venkatakrishnan, Reuters,
   22 Oct: AI is "the icing on the cake, not the cake"; not found by fresh search, verify) and a reusable test for any "AI took the jobs" headline. Before using: get the full quote context (judge 2: the
   "cake" is earlier platform modernisation and process simplification, not plain cost-cutting), so frame it as "the cake is
   boring tech plumbing" and pose "AI-washing" only as a question. Also the swap for B if the owner wants no second Spotify story.
2. **R1, "700 supermarket freezers turned into ovens."** Still the most drawable idea in the pool (displays ticking -18 to +50,
   a map of France lighting up). Needs a fresh peg (prosecutor findings, an arrest) and a named quote from French press; never
   name a culprit or the entry route, and don't single out Danfoss (ANSSI also names Copeland modules).
3. **T1, "You told an AI your secrets. Now a bankruptcy judge decides."** Character.AI's Chapter 11; the 30 Oct sale-rules
   hearing (unconfirmed in fresh search) and the ~23 Nov auction (proposed; sale hearing ~24 Nov) are natural pegs, with a clear action (delete or export your data before the sale). Check
   dates on the court docket, find a named AG quote, and never say "Disney is buying your chats".

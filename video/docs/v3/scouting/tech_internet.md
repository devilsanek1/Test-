# Video 3 scouting: tech, internet, security, platforms

Scout: tech/internet beat. Date: 2026-10-25. Window searched: 2026-10-16 to 2026-10-25.
Excluded: Google DeepMind / Google military AI (video 2) and PHP2Shell (too close to video 1).
Note: WebFetch/curl were blocked from this container (DNS / proxy 403), so every fact below comes from search-result
summaries of the outlets listed. Before scripting, open the primary sources by hand (Google incident report,
NM court order, Greek law text, Kaiser's slides).

---

## 1. The backup failed too (Google Cloud London + Orange France, 20-21 Oct 2026)

- **News:** Tue 20 Oct 2026, ~06:00-06:08 UTC: a grid power disruption hit the building that holds zone europe-west2-b
  of Google Cloud's London region. The batteries (UPS) took over while the diesel generators were meant to start.
  Google's preliminary report: the primary AND the backup generator controllers (PLCs) both failed to start the
  generators, so the batteries ran flat (about 7 min per secondary reports) and the zone went dark. Revolut (card payments,
  transfers, log-in; 28-30 services "partially unavailable"), Lloyds, HSBC, the HM Courts remote-hearing video platform and
  the NHS app were hit. Google says most workloads recovered by 05:10 PT (13:10 UTC); Revolut and MoJ took hours longer.
  Wed 21 Oct 2026, ~11:20-21:00 CET: Orange France's mobile network (calls, SMS, data) went down nationally for almost
  10 hours, ~22 million mobile customers (Orange + Sosh). Orange France CEO Jérôme Hénique told Le Figaro it was a
  software bug in a Nokia core-network box. The backup boxes, spread across different sites in France, ran the same
  software version and crashed on the same error messages. Each restart crashed again, in a loop.
- **Big question:** When "the internet goes down", why doesn't the backup just take over?
- **So what:** The backup is a copy of the main system, so it can fail for the same reason, at the same moment
  (engineers call this a common-mode failure). Two days, two countries: millions couldn't pay by card, couldn't
  call or text, courts couldn't hold hearings. Google has only one UK cloud region, so London firms had nowhere in the UK
  to fail over to. For you: your bank app and your phone line depend on a few buildings and a few pieces of
  software, and a backup is only as different as it is from the main system.
- **Thesis:** Everyone's talking about Revolut and Orange going down, but both outages reveal the same hidden flaw: the
  backup failed for the same reason as the main system, which matters because "we have a backup" doesn't protect you
  if the backup is a twin.
- **Frame 0:** "The backup failed. Twice. In one week."
- **Hooks:** (a) "Your bank had a backup. Your phone network had a backup. Both backups failed this week, and for the
  same reason." (b) "A London building lost power for seven minutes, and people in seven countries couldn't pay for
  lunch." (c) "22 million French phones went silent for ten hours, because the spare was an exact copy."
- **Twist:** Redundancy that's identical isn't redundancy. Uninterruptible power supplies got interrupted. Spare
  equipment in separate cities crashed together because they all ran the same code.
- **Key image:** Scale: one dark building in London, threads running out from it to card terminals across Europe.
  Cozy/enclosure: two identical twins holding hands as they both trip over the same pebble.
- **Evidence:** Google side is strong (Google status page + preliminary report as quoted by Computer Weekly, CNN,
  Cybernews, TechRadar, incidenthub). The exact "7 minutes" and "7 nations" figures come from secondary write-ups,
  so check them against Google's report. Orange outage and the ~22.5M figure: Franceinfo, Next.ink. The "same software
  on main + backup" detail comes from Le Figaro's interview, reported by Univers Freebox, Journal du Geek and
  Alloforfait. Open the Figaro piece itself. Orange's official release names only "core network equipment".
- **Risks:** Two stories in one video (keep the Google one as the spine and use Orange as the "and again, the next
  day" beat). Don't imply the two outages are linked (they aren't). Google's final RCA may revise details. Don't say
  emergency numbers failed (prefectures said 15/17/18 still worked, with 112 advised from another network).
- **Sources:**
  - CNN, 2026-10-20: https://www.cnn.com/2026/10/20/europe/google-cloud-outage-london-revolut-intl
  - Computer Weekly: https://www.computerweekly.com/news/366652539/Google-Cloud-power-event-knocks-out-UK-banks-courts-and-couriers
  - TechRadar: https://www.techradar.com/pro/a-major-google-cloud-outage-was-caused-by-uninterruptible-power-supplies-being-interrupted
  - Google status page: https://status.cloud.google.com/incidents/ETJGhvY9Xaktw7tgi8dF
  - Irish Times, 2026-10-20: https://www.irishtimes.com/business/2026/10/20/revolut-services-hit-by-outage-including-in-ireland/
  - incidenthub analysis: https://blog.incidenthub.cloud/google-cloud-europe-west2-outage-oct-20-2026
  - Franceinfo: https://www.franceinfo.fr/faits-divers/des-millions-d-abonnes-orange-sans-reseau-mobile-une-panne-en-chaine-evoquee_8247907.html
  - Univers Freebox (citing Le Figaro): https://www.universfreebox.com/article/598730/panne-geante-dorange-cest-officiel-un-bug-inedit-et-complexe-chez-nokia-a-fait-tomber-le-reseau-et-ses-systemes-de-secours
  - Journal du Geek, 2026-10-22: https://www.journaldugeek.com/2026/10/22/panne-geante-chez-orange-apres-dix-heures-sans-reseau-que-sest-il-reellement-passe/
  - Next.ink: https://next.ink/brief-article/orange-confirme-un-incident-en-cours-sur-son-reseau-mobile/

---

## 2. Meta's $25 billion bill: 43 million "lies" in a state of 2 million people (New Mexico, 21 Oct 2026)

- **News:** 21 Oct 2026: New Mexico District Judge Francis Mathew ordered Meta to pay the state $25 billion under the
  Unfair Practices Act for misleading Facebook users about their data privacy. A Santa Fe jury (25 Sep 2026) had found
  26 of 29 public statements by Meta misleading. Each statement counted once per New Mexican in its audience, so the
  total is about 43-44 million violations, each worth up to $5,000, a maximum of about $219-220 billion. The state asked for
  $35-40 billion and Meta asked for $3.45 billion. The judgment carries 15 % annual interest, and state law sends the money to
  New Mexico's schools. Meta will appeal and has posted a $1.8 billion bond. The NM AG calls it the largest judgment of its kind.
- **Big question:** Can anyone actually make Big Tech pay for what it does with our data?
- **So what:** The new mechanism isn't a privacy law, it's an old consumer-fraud law, with every user who saw a
  misleading promise counted as a separate victim. That maths is now open to any US state with a similar law. For an
  ordinary person: what an app says about your privacy can now cost it per user, so the promises in privacy pop-ups
  become a liability.
- **Thesis:** Everyone's talking about the $25B headline, but the real story is how the judge got there, counting every
  user who read a misleading privacy promise as a separate violation. That matters because it turns an app's privacy
  promises into a per-user bill that other states can copy.
- **Frame 0:** "One state. 43 million violations. $25 billion."
- **Hooks:** (a) "New Mexico has about 2 million people. A court just found Meta broke the law there 43 million times."
  (b) "The fine could legally have been $220 billion. The judge went easy." (c) "Facebook's privacy promises just got
  a price tag: per user, per promise."
- **Twist:** The count is bigger than the population, because it's people times statements. The money goes to schools,
  and it grows 15 % a year while Meta appeals.
- **Key image:** Scale: a small desert state with a tally-mark counter spinning past its population sign. Enclosure: one
  person at a kitchen table reading a privacy pop-up, a tiny $5,000 tag hanging off it.
- **Evidence:** Strong. Multiple reputable outlets (CNN, NBC, Washington Post, Source NM, Albuquerque Journal, Santa Fe New
  Mexican) and the NM DOJ press release. "Tied to Cambridge Analytica" appears in CNN's headline but some summaries
  don't make the link, so check the court order's wording. Population (~2.1M, 2020 census) is my own context figure.
- **Risks:** It's a trial-court ruling under appeal, so say "ordered", not "paid". It sits close to an earlier NM verdict
  ($375M, child safety, March 2026), so don't mix them up. Stay neutral (Meta's position: AG conflates privacy and speech).
- **Sources:**
  - CNN, 2026-10-21: https://www.cnn.com/2026/10/21/tech/meta-25-billion-new-mexico-judgment
  - NBC News: https://www.nbcnews.com/tech/tech-news/meta-ordered-pay-25-billion-new-mexico-consumers-data-privacy-rcna604864
  - Washington Post, 2026-10-21: https://www.washingtonpost.com/technology/2026/10/21/meta-ordered-pay-25b-new-mexico-misleading-users-privacy/
  - Source NM, 2026-10-21: https://sourcenm.com/2026/10/21/new-mexico-judge-orders-meta-to-pay-state-25b/
  - Albuquerque Journal: https://www.abqjournal.com/news/judge-orders-meta-to-pay-25-billion-to-new-mexico-for-violations-of-state-law/3146756
  - Santa Fe New Mexican (jury, 43M): https://www.santafenewmexican.com/news/local_news/santa-fe-jury-finds-43-million-violations-by-meta-in-states-second-court-win/article_e4a95a15-5303-473d-9005-fdedb1ebd619.html
  - NM DOJ: https://nmdoj.gov/press-release/new-mexico-department-of-justice-wins-landmark-verdict-against-meta/

---

## 3. To keep kids off social media, adults must prove their age (Greece 22-23 Oct, Türkiye 1 Nov 2026)

- **News:** Night of 22-23 Oct 2026: Greek parliament passed an under-15 social media ban (Facebook, Instagram, TikTok
  etc.), in force 1 Jan 2027, fines up to 6 % of global turnover. Platforms may verify age via the state Kids Wallet /
  Gov.gr Wallet, which tells the platform only "over/under 15" (no name, no birth date). Only New Democracy voted for it.
  Türkiye: rules published in the Official Gazette 10 Oct 2026 take effect **1 Nov 2026** (next Sunday) for new
  accounts. Users get an age token from the government e-Devlet portal, and existing accounts must verify by 31 Mar 2027.
  Officials are already warning about scam "verify your age now" messages. AFP counts 20+ countries with similar laws.
- **Big question:** Is the internet about to make everyone show ID?
- **So what:** You can't tell who's under 15 without checking everyone, so these "child" laws are in practice
  age checks for every adult. The new twist is that governments are building the checker themselves, a state wallet
  that answers only yes/no. For you: soon signing up for an app could mean a government-app step, and a new scam
  ("verify your age") is already arriving.
- **Thesis:** Everyone's talking about banning kids from social media, but this week's Greek and Turkish laws show
  that to stop kids you have to check everyone, and governments are now the ones issuing the yes/no age pass. That
  matters because the next app you sign up for may ask you to prove your age through a state app.
- **Frame 0:** "To ban kids, they'll check you."
- **Hooks:** (a) "Greece just banned kids from social media, and the surprise is that adults have to prove their age too."
  (b) "Next Sunday, a whole country starts needing a government token to open an Instagram account."
  (c) "The new ID for the internet doesn't know your name. It knows one thing."
- **Twist:** The privacy-friendly design: the token says only "over 15: yes/no", no name. And the first side effect
  isn't censorship, it's a scam wave.
- **Key image:** Scale: a long queue of grown-ups at a cartoon turnstile in front of a giant phone. Enclosure: a teen and
  a parent on a sofa, both holding up phones to the same small bouncer.
- **Evidence:** Greece: Greek Reporter, The Next Web, ID Tech Wire, Athens News (all 23 Oct), sources differ by hours
  on the vote time. Türkiye: Hürriyet Daily News, TRT, Biometric Update, Bianet, Medianama. Whether all *adults* must
  verify in Türkiye is partly analysis ("could require"), and some reports say "all new users". Don't overstate.
- **Risks:** Political (Türkiye's speech record, Greek opposition votes). Stay strictly factual and nonjudgmental. Freshness
  is good but crowded (Australia/UK coverage). The angle must be "everyone gets checked + how", not "kids banned".
- **Sources:**
  - Greek Reporter, 2026-10-23: https://greekreporter.com/2026/10/23/greece-children-under-15-social-media-ban/
  - The Next Web: https://thenextweb.com/news/greece-passes-law-banning-social-media
  - ID Tech Wire: https://idtechwire.com/greece-passes-under-15-social-media-ban-with-wallet-based-age-checks/
  - Athens News, 2026-10-23: https://en.rua.gr/2026/10/23/the-greek-parliament-has-adopted-a-law-restricting-social-networks-for-children-under-15-years-of-age-from-january-1-2027-age-verification-kids-wallet-and-rules/
  - Hürriyet Daily News: https://www.hurriyetdailynews.com/turkiye-sets-rules-for-under-15-social-media-ban-227953
  - Biometric Update: https://www.biometricupdate.com/202610/turkiyes-age-assurance-law-sets-minimum-age-of-15-for-having-social-media-accounts
  - Bianet: https://bianet.org/haber/turkey-s-under-15-social-media-ban-could-require-adults-to-verify-age-through-government-portal-324340
  - Türkiye Today (scam warning): https://www.turkiyetoday.com/nation/turkiye-warns-of-scams-ahead-of-social-media-ban-for-under-15s-3230898

---

## 4. Your router can be hijacked from the pavement, through a 16-year-old bug (WPSplinter, disclosed 16 Oct 2026)

- **News:** 16 Oct 2026, Hexacon (Paris): researcher Quentin Kaiser showed "WPSplinter", a memory bug in Broadcom's
  old Wi-Fi Protected Setup (WPS) code, in use since ~2010. Anyone in Wi-Fi range can run code on the router as root
  without the Wi-Fi password and without completing WPS pairing. Demos: pulled the Wi-Fi key out of an Orange Belgium
  (Askey) box over the air, and got a shell on a Proximus (Sagemcom) box. About 1.5 million vulnerable boxes in Belgium alone.
  The affected chips are in gear from Cisco, Netgear, Nokia, Sagemcom, TP-Link, ZTE and Zyxel. Broadcom says it replaced the
  code in 2018 and won't issue a CVE. Kaiser says the 2018 fix was incomplete. Turning WPS off or changing the password
  may not help, and only a firmware update from your ISP/vendor does.
- **Big question:** Is the box in my hallway that runs my whole home internet actually safe?
- **So what:** The fix never reached most homes because routers are rented from ISPs, run old chip code and rarely
  update, and with no CVE number there's no official alarm to push ISPs. For you: someone parked outside could take
  over your home Wi-Fi, read your traffic or use your connection, and the usual advice (change your password) doesn't fix it.
- **Thesis:** Everyone assumes changing the Wi-Fi password keeps strangers out, but WPSplinter shows a 16-year-old chip
  bug lets someone in range take over the router without it, and the fix from 2018 never reached most homes. That
  matters because the only real fix is in your ISP's hands.
- **Frame 0:** "No password needed. Just stand outside."
- **Hooks:** (a) "Someone on your street could take over your Wi-Fi without the password, and changing it won't help."
  (b) "The bug is 16 years old. The fix is from 2018. Your router probably never got it." (c) "1.5 million routers in
  one small country, wide open to anyone within Wi-Fi range."
- **Twist:** The company says it fixed it eight years ago and won't give it an official bug number. The "fix" was
  incomplete, and the boxes kept shipping.
- **Key image:** Scale: a street of houses at night, every window glowing the same Broadcom-blue, one figure on the pavement.
  Enclosure: the cozy hallway shelf with the blinking router, a tiny door in it open.
- **Evidence:** Medium-strong. The Hacker News, TechSpot, Cybernews and others report the talk. Figures (1.5M, vendor list)
  are the researcher's estimates. No CVE, Broadcom disputes the severity. Not yet seen exploited in the wild.
- **Risks:** Freshness (9 days old). Security/bug theme repeats video 1 (PHP). Don't scare people: say "in range",
  "not seen in attacks yet", and give the actionable step (ask your ISP for a firmware update or a newer box).
- **Sources:**
  - The Hacker News, 2026-10: https://thehackernews.com/2026/10/unpatched-broadcom-wi-fi-flaw-lets.html
  - TechSpot: https://www.techspot.com/news/114276-millions-routers-can-hijacked-over-wi-fi-thanks.html
  - Cybernews: https://cybernews.com/security/broadcom-wifi-flaw-millions-routers-no-password/
  - Noypigeeks: https://www.noypigeeks.com/tech-news/wpsplinter-router-flaw-wifi/

---

## Scout's ranking
1. **Backup failed too**: best mechanism twist, everyday consequence (card payments, phone), fresh (20-21 Oct), and visual.
2. **Meta $25B**: most rock-solid evidence, a clean "how the maths works" reveal, fresh (21 Oct).
3. **Age checks for everyone**: biggest everyday reach, with a deadline next Sunday, but politically sensitive.
4. **WPSplinter**: very concrete, but 9 days old and repeats video 1's security theme.

Also seen, rejected: Capcom 11.77M CAPCOM ID breach (22 Oct, mostly emails, low consequence); PHP2Shell (video 1
overlap); Character.AI investigation (Futurism, 24 Oct, single outlet); Android developer verification (live since 30 Sep,
narrower than headlines, stale).

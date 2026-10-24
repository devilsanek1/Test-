# Audience anchors and the "So what?" chain (PHP2Shell episode)

Stream: AUDIENCE ANCHORS + SO-WHAT. Written 2026-10-24 against `docs/CREATIVE_BRIEF.md` and the current 226-word VO.
Scope: what an 18–40 TikTok/Reels/Shorts viewer already knows, true anchors for "how big is PHP", the so-what ladder,
theses, understanding shifts, hooks. Not a full fact-check of the story (other streams own that), but story facts that
change the anchors or the payoff are flagged in section 3.6.

**How the research was done (read this before you rely on any source):** every WebFetch failed on DNS in this
environment (php.net, w3techs.com, blog.cloudflare.com, wiz.io, techtarget.com, wikipedia.org, tidbits.com, wjla.com
were all tried), and curl through the proxy got a 403. **Everything below therefore comes from WebSearch result
summaries, with the original URLs listed in section 9.** No primary page was opened directly. Any number that goes into
the final VO should be checked by opening the primary page from a normal browser before lock. Wherever a claim rests on
reasoning rather than evidence, it is marked **[judgment]**.

---

## 0. Bottom line (the five things to take from this file)

1. **Drop "behind WordPress" as the lead anchor, and never say "most popular programming language".** The second is
   false (TIOBE has PHP around 13th–14th in 2026, and about 18% of developers use it per Stack Overflow 2024). The TRUE
   version that's even more impressive is: **"the language most websites are built with, about ten times more common
   than the runner-up"** (W3Techs: PHP ~70% of sites whose server-side language is known, next is Ruby at ~6.8%).
2. **Best single relatable anchor: Wikipedia.** It is universally known, runs on MediaWiki, which is written in PHP,
   and Wikimedia production runs PHP 8.3 today, so it's current, not historical. Pair it with "and about 4 in 10 of all
   websites through WordPress" when you need scale. For a gamer-skewing audience, Fandom wikis (also MediaWiki) work
   well too. **Don't use Facebook or Slack**: both moved to Hack/HHVM, a fork that no longer runs standard PHP, so naming
   them implies they were exposed to this bug, which is misleading.
3. **The denominator trap is also the twist.** "7 in 10 websites" counts *sites*, not *visits*. The giants where people
   spend most of their time (Google, YouTube, Instagram, TikTok, ChatGPT) don't run standard PHP. So "most of the
   websites you use" is FALSE. "Most websites" is TRUE. The real exposure sits in the long tail: councils, hospitals,
   schools, small shops, blogs, fan wikis. Those are exactly the kinds of sites that switched off.
4. **The strongest so-what:** the fix exists, but it can't be shipped once. It has to be installed separately on
   millions of servers, and roughly half of PHP sites run versions the PHP team no longer officially fixes. So this week,
   safety is set by the slowest updater, and for a site that can't update in time the safest setting is "off".
   Ordinary-person consequences: some sites you rely on may go dark (a precaution, not a hack); your phone needs no
   update; be wary of odd downloads, redirects and "security patch" links, even on familiar sites.
5. **Two numbers in the current VO need changing** (section 3.6): "one in three sites on PHP runs a version so old…"
   understates the share (the evidence says about half, or more than half by host counts), and "four countries"
   understates the spread (reports name sites in at least eight European countries, including the UK).

---

## 1. What the audience already knows

Target viewer: 18–40, curious, not technical, on TikTok/Reels/Shorts.

| Term | Est. recognition (18–40, general) | Evidence / reasoning | Recommendation | Plain-English swap |
|---|---|---|---|---|
| **PHP** | **Very low.** Most viewers can't say what it is. | Reuters had to run an explainer headlined *"What is PHP and why did it take government websites offline?"* (syndicated by CP24, The Star, Korea Times). AP/ABC's headline avoided the name entirely: *"Urgent security fix issued for code vital to estimated 70% of all websites."* TIOBE ~13th–14th; Stack Overflow 2024: ~18% of devs use it. Fun aside: in search results "PHP" mostly means the Philippine peso (ISO currency code). | Name it once, immediately anchored (Wikipedia + "7 in 10 websites"). Never assume it's known. | "the code most websites are built with"; "the language under Wikipedia" |
| **WordPress** | **Low to medium.** Known to people who've built a blog or small-business site; vague for the rest. **[judgment]** | Matches the user's instinct ("Who even knows WordPress now?"). Younger creators mostly see Squarespace, Wix, Shopify and Linktree in ads and sponsorships **[judgment]** (none of those are PHP, so don't use them as anchors). WordPress's share is drifting down: about 43.6% peak in mid-2025 to about 41.2% in July 2026 (W3Techs via secondary). | Use as *scale* ("about 4 in 10 of all websites"), not as the explanation of what PHP is. | "the website builder behind about 4 in 10 websites" |
| **Cloudflare** | **Medium and rising.** | The 18 Nov 2025 Cloudflare outage took down X, ChatGPT, Canva and Letterboxd and got worldwide coverage. Almost everyone has clicked a Cloudflare "Verify you are human" check (Turnstile/challenge page). W3Techs: Cloudflare sits in front of about 24–25% of all websites (July–Sept 2026). | Anchor it on the checkbox, not on "protects a big chunk of the web". Caveat: not every human-check is Cloudflare (Google's "I'm not a robot" and hCaptcha also exist), so say "those 'Verify you are human' pages", not "every captcha". | "the company behind those 'Verify you are human' pages" / "the company that sits in front of about 1 in 4 websites" |
| **patch** | **Medium.** | Gamers know "patch notes" very well **[judgment]**, and everyone knows phone "updates". | Fine to say "fix" or "update". Use "patch" only if the gaming sense is intended. | "fix", "update" |
| **vulnerability** | **Medium as a word, low as a picture.** | Abstract. Pew (2023): only 48% of US adults could identify a two-factor-authentication example, though 67% knew what cookies do. Security literacy is patchy. | Avoid it. Use a concrete image instead. | "a flaw", "a bug", "a broken lock" |
| **hosting company** | **Low to medium.** | People know brands (GoDaddy, Hostinger, Bluehost from ads and YouTube sponsorships) more than the category **[judgment]**. The phrase doesn't explain who's responsible. | Say who does the work. | "whoever runs the site's server"; "the company that runs the website for them" |
| **remote code execution** | **Very low.** | Jargon. | Never say it. Describe it. | "strangers could run their own commands on the server, no password needed" (CERT-EU's own plain gloss) |
| **Wikipedia / Etsy / Fandom / Moodle** | **Very high / high / high for gamers and fans / high for students.** | Wikipedia is universal. Etsy is a mainstream marketplace. Fandom is the default game and TV wiki. Moodle is the course site at many universities and schools (stronger outside the US, where Canvas leads) **[judgment]**. | Best "oh, *that* runs on it?" anchors (see 3.1). | — |

**Takeaway:** the audience recognizes *things they use* (Wikipedia, Etsy, fan wikis, "Verify you are human" pages),
not *infrastructure names* (PHP, WordPress, hosting). Build every technical noun on a thing they've touched.

---

## 2. Why "the most popular programming language in the world" fails, and what's true instead

- FALSE: PHP is not the most popular language. Developers use JavaScript and Python far more. TIOBE ranks PHP around
  13th (Aug 2026, 1.11%), and Stack Overflow 2024 has about 18.2% of respondents using it.
- TRUE, and more surprising: **PHP is by far the most common language websites run on.** W3Techs reports about
  70.3% (22 Aug 2026) of websites whose server-side language it can detect. The runners-up are Ruby (~6.8%),
  JavaScript (~6.4%) and Java (~5.4%) (June 2026), so PHP is about **ten times** the runner-up.
- TRUE and witty (one line of personality, which brief §17 allows): **"Programmers have been calling PHP dead for
  years. It still runs about 7 in 10 websites."** The "PHP is dead" meme is real and recurring (e.g. articles titled
  "PHP is dead 2026"; DreamHost's "Why PHP Won't Die"). Keep "for years" vague; there's no good source for a start date.

---

## 3. Anchors for "how big PHP is"

### 3.1 Verified current anchors (ranked by relatability × certainty)

| # | Anchor | Exactly what we can say | Status | Evidence | Risk notes |
|---|---|---|---|---|---|
| A1 | **Wikipedia** | "Wikipedia runs on PHP" / "the language Wikipedia is built with" | **Current** | MediaWiki is written in PHP. Wikimedia production runs PHP 8.3 (a branch that received the 21 Oct fix), and a move to 8.5 is tracked in Phabricator T413223. MediaWiki 1.46 requires PHP 8.3+. Sansec reportedly demonstrated the PHP2Shell RCE against MediaWiki-based apps. | **Do not imply Wikipedia was hacked, offline or exposed.** No report says so, and it runs a patched branch. Use it only as a scale and familiarity anchor. |
| A2 | **WordPress (about 4 in 10 of ALL websites)** | "about 4 in 10 websites are built with WordPress, which runs on PHP" | **Current** | W3Techs via secondaries: 41.2% (July 2026); 42–43% earlier in 2026. Reuters/AP: "about 40%" / "more than 40%". | Say "about 4 in 10", not "43%". WordPress *core and plugin updates do NOT fix this*, which is a useful clarifying line for site owners. |
| A3 | **Fandom wikis** (game and TV wikis) | "the fan wikis you check for game guides run on the same software as Wikipedia, which is written in PHP" | **Current** | Fandom announced its upgrade to MediaWiki 1.43 (Nov 2024 post, rolled out 2025). During PHP2Shell the esports wiki **Liquipedia** (MediaWiki) went down for users (outof.games / talkesport). | Great for 18–30 gamers. Don't claim Fandom itself went down (not reported). The Liquipedia outage is reported but niche. |
| A4 | **Etsy** | "Etsy is built mostly in PHP" | **Current (moderate confidence)** | Etsy job listings: engineers "primarily write in PHP and JavaScript". Etsy engineering talks on running PHP 8/8.2 at scale. PHP's creator Rasmus Lerdorf is listed as an Etsy engineer (undated Glassdoor item). | No report of Etsy being affected. Use as a familiarity anchor only. Confirm on codeascraft.com before using it in the VO. |
| A5 | **Online stores (WooCommerce)** | "the WordPress add-on behind millions of online stores" | **Current** | Store Leads 2026: ~4.34M live WooCommerce stores (~40% of listed stores). Magento/Adobe Commerce is PHP too (~114k stores). | The count depends on the tracker (BuiltWith is much lower). Say "millions of online shops" at most. |
| A6 | **Moodle** (school and university course sites) | "the course site lots of schools and universities use runs on PHP" | **Current** | Moodle is written in PHP (Wikipedia infobox). It claims 90M+ users (vendor), and its stats counter shows 500M+ registered users (via technologychecker.io). | Vendor numbers. Weaker in the US (Canvas). Good for EU and global viewers. |
| A7 | **Big music and entertainment news sites** (Rolling Stone, Billboard, Variety) | "sites like Rolling Stone and Billboard run on WordPress" | **Current (single secondary source)** | PublishPress: Penske Media brands are "standardized on WordPress", mostly on WordPress VIP. | Only one secondary source, so verify by source inspection. Also one report says Automattic told customers WordPress.com/VIP sites were already protected, so these are poor examples of *at-risk* sites. Fine for "how big". |
| A8 | **Tumblr** | "Tumblr's backend is PHP" | **Current (moderate confidence)** | Automattic's 2024 plan to move Tumblr's backend to WordPress called for "experienced PHP programmers". The plan has been on hold since mid-2025. | Moderate. Skip unless confirmed. |
| A9 | **Webmail, file clouds, government CMSs** (Roundcube, Nextcloud, Drupal, Joomla, Laravel, phpMyAdmin) | "…plus the software behind lots of government, university and company sites" | **Current** | Sansec reportedly demonstrated unauthenticated RCE against WordPress, Drupal, Joomla, Magento, MediaWiki, Roundcube, phpMyAdmin, Nextcloud, Laravel, Symfony and WHMCS (via search summary). | Names mean nothing to the audience. Use only as a visual crowd of buildings, not in narration. |

### 3.2 Anchors to AVOID (historical or misleading)

| Anchor | Why it's tempting | Why it's risky |
|---|---|---|
| **Facebook / Meta** | "Facebook was built in PHP" is famous. | Historical. Meta now runs **Hack on HHVM**, and HHVM dropped PHP support with v4.0 (2019). Naming Facebook implies Facebook was exposed to a flaw in the standard PHP engine. It wasn't (no evidence). If you want the line at all: "Facebook started out in PHP", but it pulls focus and invites the wrong inference. **Cut it.** |
| **Slack** | "Slack's backend is PHP" is often repeated. | Slack launched on PHP 5 (2014), moved to HHVM in 2016 and migrated to Hack (Slack Engineering, "Hacklang at Slack: A Better PHP", 2020). Same problem as Facebook. **Cut it.** |
| **"Most of the websites you use"** | Feels personal. | **False by traffic.** The most-visited sites (Google, YouTube, Facebook, Instagram, ChatGPT, Reddit, TikTok) don't run standard PHP. "7 in 10" is a share of *sites by count* in W3Techs's top-10-million sample. **Use "most websites", never "most of the sites you visit".** |
| **whitehouse.gov** (WordPress) | Famous. | Only agency blogs support it, and it's politically loaded for a neutral channel. Skip. |
| **New York Times** | Appears on agency "famous WordPress sites" lists. | The main NYT site isn't WordPress (historically only blogs were). Skip. |
| **Yahoo, Mailchimp, Box, Baidu** | Old "built on PHP" trivia. | Historical or unverified for 2026. Skip. |
| **"the most popular programming language in the world"** | The user's suggestion. | False (section 2). |

### 3.3 The denominator, stated precisely (for the fact-check sheet)

- **"About 7 in 10 websites"** = W3Techs: PHP is used by ~70% (69.3–71.1% across Jun–Oct 2026 snapshots) **of the
  websites whose server-side programming language W3Techs can detect**, within its sample of the **top 10 million
  websites** (ranked via Chrome UX Report + a customized Tranco list; parked and duplicate sites excluded). It's a share of
  *sites*, not of *traffic* and not of *all ~1 billion hostnames*.
- Reuters' wording is the safe broadcast phrasing: *"nearly 70% of all websites whose programming language can be
  identified."* In a 60-second VO, "about 7 in 10 websites" plus a small on-screen footnote ("of sites whose language is
  known · W3Techs") is accurate enough. Drop the footnote and it slightly overstates.

### 3.4 Vivid but accurate ways to say "about 7 in 10 websites"

1. **"Line up ten websites; about seven are built with PHP. The runner-up? Less than one."** (70% vs Ruby 6.8% / JS 6.4%.)
   Visual: ten buildings, seven stamped with the elephant blueprint, one other. Perfect for the city world.
2. **"PHP is about ten times more common on websites than whatever's in second place."**
3. **"Programmers have been calling it dead for years. It still runs about 7 in 10 websites."** (personality line)
4. **"It's the language under Wikipedia, and under about 4 in 10 of all websites through WordPress alone."**
5. **"About 7 in 10 websites, mostly not the giant apps, but the millions of ordinary sites: your city hall, your
   dentist, the shop you bought a gift from, the wiki you check mid-game."** (sets up the long-tail twist; the examples
   are illustrative categories, **[judgment]**, not specific verified sites)

### 3.5 Ways to say "22.6 million instances" (and why "millions" is safer)

- **What the number is:** Palo Alto Networks said on 21 Oct it identified **"more than 22.6 million exposed instances
  potentially vulnerable"** (TechTarget; TNND/Sinclair stations). These are *internet-facing PHP instances*, **not unique
  websites and not confirmed breaches.** No Unit 42 / Xpanse primary post surfaced in search.
- **Other counts differ by about 10×:** Shodan banner counts give ~2.24M internet-facing hosts advertising PHP
  (CybelAngel, citing Mallory). Censys: ~2.6M hosts report a PHP version, and ~55M "web properties" run PHP. Infrawatch:
  ~11M services on 4.38M IPs. One researcher estimated ~1.3M systems. The method decides the number.
- **Recommendation:** narrate **"millions of servers"**, and if the number goes on screen, attribute it:
  "22.6M exposed PHP installs (Palo Alto Networks)". Don't call them "copies of PHP" or "websites".
- **Vivid options (if the number is used):**
  - "**More than 22 million**, by one count. That's more PHP installs facing the internet than there are people in
    New York State." (NY ~19.9M; check the current Census estimate. Comparing servers to people is vivid but
    explains little.)
  - "If you fixed **one every second, around the clock, it would take eight and a half months.**" (22.6M s = 261.6 days.)
    **Caveat:** fixes happen in parallel, so this only illustrates size, not time-to-fix. Used near "step two is slow"
    it could imply an 8-month timeline, which would mislead. Use it only with "if one person had to…" framing, or not at all.
  - Visual-only (safest): the city camera pull-back. One door becomes a street, a district, a horizon of identical locks,
    with a counter ticking into the millions. No narration claim needed.

### 3.6 Story numbers in the current VO that the evidence contradicts (hand to fact-check)

| VO line | Evidence | Suggested fix |
|---|---|---|
| "**one in three** sites on PHP runs a version so old that the people who make PHP don't fix it anymore" | W3Techs Aug 2026: PHP 7 = 28.9%, PHP 5 = 7.9%, PHP 4 = 0.1% of PHP sites (36.9% on ≤7). Add PHP 8.0 + 8.1 (also end-of-life; 24.8% of PHP-8 sites in June) and the unsupported share is about **52%** of PHP sites (my estimate, mixing the June and August snapshots). Host-based counts are higher: Bitsight says only about a third of version-identifiable instances run a fixed branch (so ~2/3 don't); CybelAngel/Shodan 59%; Censys ~1.5M of 2.6M (58%). Bluewin cites an analysis of 7.2M PHP pages finding "nearly half" on deprecated versions. | "**About half** of PHP sites run versions so old that PHP no longer officially fixes them." Nuance: PHP published *source-only* backports for 7.4/8.0/8.1 this time, and Linux distributions (Debian/Ubuntu/Red Hat) often patch old versions themselves. So "no official fix", not "can never be fixed". |
| "Government websites in **four countries**" | Reports name Finland, the Netherlands, Belgium and France, plus Germany (Mainz and Rhineland-Palatinate agencies), Austria, the UK (Edinburgh and Oxford councils, the Met Police), Denmark (Kombit) and Switzerland. | "Government websites **across Europe**…" (or "in at least eight countries"). |
| "Cloudflare… saw tens of thousands of break-in attempts in 45 minutes, and millions **by evening**" | This comes from Cloudflare CEO Matthew Prince's posts on X (not the Cloudflare blog, which gives no counts): thousands in the 10 h before the announcement, tens of thousands within ~45 min after, hundreds of thousands within 2 h, "millions now". "By evening" isn't confirmed. | "…tens of thousands of attempts within 45 minutes. Within a day: millions." Or attribute: "Cloudflare's CEO says…". "Attempts" is right. Security Affairs and Sophos report **no confirmed successful compromise** so far, so "Nobody knows yet how many got in" is fair. |
| "the details of the bug **leaked online hours before** the fix" | Leak on Tue 20 Oct, and PHP pre-announced and moved the patch up to Wed 21 Oct ~13:45 UTC. Cloudflare saw attempts *before* disclosure, and The Hacker News / TechRadar report someone (per AWS) tried to exploit it **~4 days before** public disclosure. | Fine as is, but "hours before" undersells it if the AWS report holds. Leave to the facts stream. |
| "**two security teams** using AI tools found it… in August" | CNN: teams at OpenAI, Wiz (Google-owned) and Calif. Deseret/WSJ: Calif's Ryan Austin found it with OpenAI's GPT-5.6 Sol in an August audit. OpenAI says it "led a coalition" for about two months. One outlier (roic.ai) says the PHP Foundation saw signs in 2024. | "security researchers using AI" is safe. |

---

## 4. The "So what?" chain (ordinary person's point of view)

Each rung is the answer to "so what?" about the rung above. The **bold** rungs are the ones the VO must land. Evidence is
in brackets.

1. **Government websites across Europe switched themselves off.** *So what? Was it a hack?*
2. No. They pulled the plug *on purpose*, because a flaw had just been found in **PHP**, the code most websites are
   built with. It lets a stranger run their own commands on a site's server, no password needed. [CERT-EU gloss; CVSS 9.2]
   *So what? I don't use PHP.*
3. **You use it without knowing.** About 7 in 10 websites run on it: Wikipedia, about 4 in 10 sites through WordPress, fan
   wikis, Etsy, millions of shops, school course sites, city halls. [W3Techs; MediaWiki; Fandom; Etsy listings]
   *So what? Then fix PHP.*
4. **The flaw isn't in one building, it's in the blueprint.** Every site built from it has the same broken lock, so one
   flaw put millions of sites at risk *at the same moment*. [Palo Alto: >22.6M exposed instances; other counts 2–11M]
   *So what? A fix came out Wednesday, right?*
5. **A fix existing isn't the same as a fix installed.** It doesn't install itself, and updating WordPress or plugins
   doesn't apply it. Every server has to update PHP and restart, one by one. [PHP advisory via BleepingComputer/Help Net;
   Wordfence via Cybernews; Malwarebytes] *So what? They'll get to it.*
6. **Attackers already have the details.** The details leaked before the fix. Tens of thousands of attempts came within
   about 45 minutes of the announcement, and millions within a day (Cloudflare's CEO). Sansec warned mass attacks would
   start within ~15 minutes of the patches. [The Register / TechRadar / Gizmodo] *So what? It's a race.*
7. **The race is decided by the slowest updater, and the slow ones are the sites nobody's watching.** Big operators got a
   head start: Cloudflare's protections went live ~9 h before disclosure, some hosts patched before release, and the
   giants (Google, YouTube, Instagram) don't run standard PHP anyway. But **about half of PHP sites run versions too old
   to get the official fix.** [W3Techs calc; Bitsight; CybelAngel; Censys] *So what? What can they do?*
8. **If you can't fix it in time, the safest website is a switched-off one.** That's what the governments did, and
   it's what the FBI/NSA, the UK's NCSC and CERT-EU advised for systems that can't be patched promptly. [AP; NCSC;
   CERT-EU] *So what, for me?*
9. **Concrete consequences for a normal person** (all sourced, nothing invented):
   - Some sites you rely on (your council, a hospital portal, a school site, a fan wiki) may be offline this week.
     That's a **precaution, not proof of a hack**. [Malwarebytes; Newsweek]
   - **Your phone and laptop don't need any update for this.** It's a server bug. [Malwarebytes; Newsweek; Bluewin]
   - **Don't trust "security patch" downloads or "mirror" links**, and leave any familiar site that suddenly shows odd
     downloads, redirects or repeated login prompts. [Malwarebytes; outof.games]
   - If you run a site (a WordPress blog, a small shop, a portfolio), **updating WordPress won't fix it. Ask whoever runs
     your server which PHP version you're on and whether it's patched.** [Wordfence via Cybernews; CERT-EU]
10. **The understanding to keep** (tellable in two sentences): *One flaw in the code under most websites put millions of
    them at risk at once, and the fix has to be installed site by site. Until each one does, the safe sites are the
    patched ones and the switched-off ones, and the risky ones are the sites nobody's looking after.*

Rungs NOT to claim (would break brief §7 "never invent or exaggerate"): that sites *were* broken into at scale (no
confirmed compromises yet); that visitors' devices get infected just by visiting (not supported for this bug); that "AI
now finds bugs faster than we can fix them" as a general law (it's interpretation; if used, scope it to this case: "an AI
helped find it in weeks; installing the fix will take the world much longer" **[judgment]**).

---

## 5. Three candidate one-sentence theses (brief §22 format)

**T1 (recommended): the blueprint and the slowest updater**
> Everyone's talking about governments switching off their own websites, but this week's PHP flaw reveals that most
> websites are built on the same foundation, so one flaw put millions of them at risk at once, which matters because the
> fix has to be installed site by site, and the sites nobody maintains stay open the longest.

Payoff (brief §9): *After watching this, people will understand that a flaw in the code under most websites can't be fixed
once. It has to be fixed millions of times, by each site separately. That matters because until each one does, the
safest website is a switched-off one, and the neglected ones are the open doors.*

**T2: finding vs fixing**
> Everyone's talking about the AI that found a 14-year-old bug in the code behind most websites, but the leak before the
> fix reveals that finding the bug was the fast part, which matters because installing the fix on millions of servers is
> slow, and attackers had the details from day one.

**T3: the long tail**
> Everyone's talking about government websites going dark, but this flaw reveals that the internet's real weak spot isn't
> the giant apps, it's the millions of ordinary sites built on PHP, about half of them on versions too old to get the
> official fix, which matters because those are the sites (councils, clinics, shops, wikis) that stay vulnerable longest.

---

## 6. Three candidate understanding shifts (brief §10)

**U1 (pairs with T1)**
- BEFORE: "Some government websites went down. Probably a hack?"
- DURING: "Wait, they switched *themselves* off, because the bug is in the code most websites are built on, even
  Wikipedia?"
- AFTER: "Oh. The fix exists, but every site has to install it separately, so until they do, off is the safe setting.
  The ones nobody updates are the real problem."

**U2 (pairs with T2)**
- BEFORE: "AI found a bug, they patched it, done."
- DURING: "Wait, patched doesn't mean *installed*, and attackers had the details before the fix even came out?"
- AFTER: "So the danger isn't the bug, it's the gap between a fix existing and a fix being installed, and that gap is
  longest for the sites nobody maintains."

**U3 (pairs with T3)**
- BEFORE: "PHP? Never heard of it. Not my problem."
- DURING: "Wait, it's under about 7 in 10 websites, and about half of them run versions too old to get the fix?"
- AFTER: "Got it. Google's fine; it's my council, my clinic and the little shops that are exposed. If a site's down this
  week, that's caution, and I don't need to update my phone, just ignore any 'security patch' downloads."

---

## 7. Six hook lines (attention from information, not shouting)

| # | Hook | Why it works | Accuracy notes |
|---|---|---|---|
| H1 | **"The fix for the bug that knocked government websites offline already exists. It just has to be installed millions of times."** | Stakes and twist in about 5 s. Raises the obvious question (why didn't they just install it?). Sets up the whole BUT/SO chain. | "millions": safe across all counts (2.2M–22.6M). |
| H2 | **"For a lot of websites this week, the safest setting is 'off.'"** | Paradox, under 2 s. Pays off visually (buildings switching their windows dark). The payoff line is already in the hook. | Matches FBI/NSA, NCSC and CERT-EU advice. |
| H3 | **"The code under Wikipedia, and about 7 in 10 websites, just got an emergency fix. Fixing it was the easy part."** | Instantly familiar anchor plus scale plus a reversal. | Wikipedia = PHP (current). Footnote "of sites whose language is known". Don't show Wikipedia as hacked or offline. |
| H4 | "Programmers have been calling PHP dead for years. On Wednesday, about 7 in 10 websites needed an emergency fix for it." | One witty line that also teaches scale. Natural personality. | "needed an emergency fix" = PHP shipped an emergency release. Fine. |
| H5 | "Your phone doesn't need this update. Millions of websites do." | Answers the viewer's first selfish question at second 0, then turns outward. | Supported by Malwarebytes, Newsweek and Bluewin ("no action on your own phone or computer"). |
| H6 | "An AI helped find a bug that sat in the code under most websites for 14 years. Now the hard part: fixing it, one site at a time." | Uses the AI angle the news led with, then redirects to the real story. | 14 years: affected versions go back to PHP 5.4 (2012) per Wiz / Google Cloud. "Helped find": Calif/Wiz researchers used OpenAI's model. |

**Top 3: H1, H2, H3.** H1 is the strongest standalone opener because it contains the thesis. H2 is the best first
1.5 seconds if the edit wants a short, quotable cold open (follow it immediately with "Governments across Europe just
switched off their own websites. Nobody hacked them."). H3 gives the most instant recognition. H5 is a strong alternate
if the edit wants to speak directly to the viewer.

Avoid in hooks: "most popular programming language" (false); "most of the websites you use" (false by traffic);
"hackers broke into…" (unconfirmed); "four countries" (undercount).

---

## 8. Fit with the visual world (city / buildings / elephant-stamped blueprint / broken lock / Cloudflare dome)

Fits as is, or with small additions:
- **"Ten buildings, seven stamped with the elephant blueprint, the runner-up less than one":** a pure city shot.
- **Long tail vs giants:** a few huge towers in the distance built from *other* blueprints (unstamped), and a sprawling
  sea of ordinary buildings (city hall, clinic, school, shop, a fan-wiki tower with a game controller sign) all stamped
  with the elephant. This turns the denominator caveat into a picture. Small addition.
- **Old blueprints:** buildings on faded, sepia blueprints with an old stamp ("v7", "v5") that the elephant no longer
  services, about half the district. Small addition.
- **Wikipedia:** a puzzle-globe-topped library tower. Only to say "built from this blueprint", never shown broken into.
  Use of real marks is an editorial/legal call; a "W" library building without the logo also reads.
- **Cloudflare as the "Verify you are human" gate:** a checkbox sign on the glass dome. Small addition and very
  recognizable.
- **Switch-off payoff:** windows going dark district by district. Already in this world.

Would need visuals that differ noticeably from this world:
- The **"one per second for 8.5 months"** illustration needs a clock or calendar device (moderate, and not recommended
  anyway; see 3.5).
- The **"programmers call PHP dead"** line needs a gag beat (e.g. the elephant mascot stepping past an "R.I.P. PHP"
  sign, unbothered). Moderate addition; mascot-compatible.
- **Viewer-advice beat** ("your phone needs nothing; ignore 'security patch' downloads") leaves the city for a
  phone/hand close-up. Moderate departure. It could also live as a sign or a pop-up window on a building.
- **Gaming "patch notes" framing** would need a game-UI motif. Not recommended; it's a different world.

---

## 9. Sources (URLs from search results; **none could be opened directly in this environment**)

Story facts and scale
- TechTarget, "PHP2Shell: 22M exposed servers at risk as emergency patches released": https://www.techtarget.com/cybersecurity/news/366652444/PHP2Shell-22M-exposed-servers-at-risk-as-emergency-patches-released
- TNND/Sinclair (WJLA etc.), "Critical PHP flaws put millions of websites at risk as governments pull sites offline": https://wjla.com/news/nation-world/critical-php-flaws-put-millions-of-websites-at-risk-as-governments-pull-sites-offline
- Reuters explainer via The Star / CP24, "What is PHP and why did it take government websites offline?": https://www.thestar.com.my/news/world/2026/10/21/explainer-what-is-php-and-why-did-it-take-government-websites-offline , https://www.cp24.com/news/world/2026/10/21/government-websites-were-taken-offline-across-europe-what-to-know-about-php/
- AP via ABC11, "Urgent security fix issued for code vital to estimated 70% of all websites": https://abc11.com/story/urgent-security-fix-issued-code-vital-estimated-70-websites/19965216/
- Deseret News (discovery timeline, Calif/GPT-5.6 Sol, leak): https://www.deseret.com/business/2026/10/21/website-computer-server-security-flaw-artificial-intelligence-hackers-cybersecurity-php-programming-language/
- Wiz blog, "PHP2Shell: AI uncovers critical RCE vulnerabilities affecting 70% of the Internet": https://wiz.io/blog/php2shell-php-rce
- Bitsight (about a third of identifiable instances on fixed branches; PHP 7.4 most common): https://www.bitsight.com/blog/critical-vulnerability-alert-cve-2026-109618-and-cve-2026-109619-php2shell
- CybelAngel (2.24M hosts; 59% on no-fix branches): https://cybelangel.com/blog/critical-php-rce-vulnerabilities-cve-2026-109618-and-cve-2026-109619/
- Bluewin (Palo Alto 22.6M vs other counts; "nearly half" deprecated; no action on phones): https://www.bluewin.ch/en/digital/security-vulnerability-threatens-millions-of-websites-what-does-that-mean-li.3643831
- The Register, "Hackers pile on PHP2Shell as AWS reveals attacks began before disclosure": https://www.theregister.com/cyber-crime/2026/10/22/hackers-pile-on-php2shell-as-aws-reveals-attacks-began-before-disclosure/5304749
- TechRadar (AWS; Cloudflare CEO attack counts): https://www.techradar.com/pro/security/aws-says-hackers-tried-to-exploit-php-security-issues-days-before-fix-as-cloudflare-ceo-says-it-saw-a-huge-rise-in-targeted-attack-attempts
- The Hacker News, "Someone tried to exploit PHP2Shell 4 days before…": https://thehackernews.com/2026/10/someone-tried-to-exploit-php2shell-4.html
- Security Affairs, "Millions of attacks, no confirmed successful exploits yet": https://securityaffairs.com/201538/hacking/php2shell-millions-of-attacks-no-confirmed-successful-exploits-yet.html
- PPC Land (Cloudflare WAF rules live 03:02 UTC, ~9 h before disclosure; blog has no counts): https://ppc.land/cloudflare-blocks-php2shell-exploits-9-hours-before-php-flaws-went-public/
- Gizmodo (Sansec: mass attacks within 15 minutes): https://gizmodo.com/expect-mass-attacks-within-15-minutes-hackers-poised-to-exploit-newly-discovered-website-flaws-2000828878
- Insurance Business UK (UK councils, Met Police offline after NCSC alert): https://www.insurancebusinessmag.com/uk/news/cyber/uk-councils-and-met-police-among-sites-pulled-offline-after-ncsc-alert-594424.aspx
- outof.games (Liquipedia down; visiting isn't risky; fake patch/mirror scams): https://outof.games/news/10188-why-half-your-favourite-gaming-sites-were-down-today-php2shell-explained/
- Malwarebytes, "PHP2Shell: Why websites are going offline for emergency security updates": https://www.malwarebytes.com/?p=479720
- Newsweek: https://www.newsweek.com/php-vunerability-php2shell-issue-websites-hack-server-12601225
- Cybernews (Wordfence: updating WordPress won't fix it): https://cybernews.com/security/wordpress-php-severe-rce-flaws-emergency-patches/
- Canadian Centre for Cyber Security AL26-026: https://cyber.gc.ca/en/alerts-advisories/al26-026-critical-vulnerabilities-impacting-php-cve-2026-109618-cve-2026-109619

PHP's reach and anchors
- W3Techs PHP: https://w3techs.com/technologies/details/pl-php ; history: https://w3techs.com/technologies/history_overview/programming_language ; PHP 8 subversions: https://w3techs.com/technologies/details/pl-php/8
- W3Techs Cloudflare: https://w3techs.com/technologies/comparison/cn-cloudflare
- WordPress share (W3Techs via Barn2 / Colorlib): https://barn2.com/blog/wordpress-market-share/ , https://colorlib.com/wp/cms-market-share/
- MediaWiki compatibility / Wikimedia PHP upgrade: https://www.mediawiki.org/wiki/Compatibility , https://phabricator.wikimedia.org/T413223
- Fandom MediaWiki 1.43 upgrade notice: https://criticalrole.fandom.com/f/p/4400000000003766339/r/4400000000014418110
- Etsy job listing (PHP and JavaScript): https://careers.etsy.com/jobs/fullstack-software-engineer-ii-cdmx-mexico-city-mexico
- Store Leads via Barn2 (WooCommerce stores): https://barn2.com/blog/woocommerce-stats
- Moodle (written in PHP): https://en.wikipedia.org/wiki/Moodle ; https://moodle.org/stats/
- PublishPress on Penske Media and WordPress: https://publishpress.com/?p=4013
- Tumblr migration on hold (TechCrunch): https://techcrunch.com/2025/07/01/automattic-puts-tumblr-migration-to-wordpress-on-hold/
- HHVM ends PHP support: https://hhvm.com/blog/2018/09/12/end-of-php-support-future-of-hack.html ; https://www.phoronix.com/news/HHVM-4.0-Released
- Slack, "Hacklang at Slack: A Better PHP": https://slack.engineering/hacklang-at-slack-a-better-php/
- TIOBE Oct 2026 coverage: https://www.techrepublic.com/article/news-tiobe-october-2026-java-closes-cpp-gap/
- Stack Overflow 2024 PHP usage (via ZenRows): https://zenrows.com/blog/php-usage-statistics
- "PHP is dead" meme: https://benjamincrozat.com/php-is-dead-2026 , https://www.dreamhost.com/blog/is-php-dead/

Audience recognition
- Cloudflare 18 Nov 2025 outage (X, ChatGPT): https://www.outlookbusiness.com/news/cloudflare-outage-triggers-widespread-errors-disrupts-x-chatgpt-and-numerous-websites
- Cloudflare Turnstile ("Verify you are human"): https://developers.cloudflare.com/turnstile/index.md
- Pew Research 2023, "What Americans know about AI, cybersecurity and big tech": https://www.pewresearch.org/internet/2023/08/17/what-americans-know-about-ai-cybersecurity-and-big-tech/
- Most-visited sites (traffic denominator): https://en.wikipedia.org/wiki/List_of_most-visited_websites
- Google Trends could not be queried in this environment. Recognition levels above are marked **[judgment]** where no
  survey exists.

# Fact sheet: PHP2Shell script ("What's All the Fuss About?")

Prepared 2026-10-24 by the fact-base pass. Scope: every factual claim in the current 226-word voiceover, plus extra
verified facts the rewriters may use. Full URL list with dates: `sources.md` (same folder).

## How this was verified (read first)
- **No page could be opened directly.** WebFetch failed DNS on every domain tried (wikipedia.org, paloaltonetworks.com,
  ncsc.gov.uk, techradar.com) and curl was refused by the sandbox proxy (403). All verification was done through
  WebSearch result extracts (the search tool returns quoted passages from the pages). So every row below rests on quoted
  extracts, not a full read of the page.
- Rule used: a fact is **verified** only when two or more independent outlets agree, or when a primary source (the
  vendor, agency or PHP project itself) is quoted directly. Single-source items say so.
- This is a story that is still moving (3 days old). Exploitation status, counts and outage lists changed between
  Oct 21 and Oct 23. **Re-check the items marked (MOVING) on the day of publishing.**
- Naming: the bugs are **CVE-2026-109618** and **CVE-2026-109619**, nicknamed **"PHP2Shell"**, both rated **9.2/10**
  (CVSS v4.0, "critical"). The fixed releases are **PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35**, published
  **Wed 21 Oct 2026, around 14:00 UTC**.

## Timeline (all UTC unless noted)
| When | What | Confidence |
|---|---|---|
| 2004 / 2020 | Stefan Esser publishes a "PHP memory_limit interruption" attack idea (2004). The out-of-memory behaviour is flagged again in bug report #78876 (2020). | Single secondary source (security write-up); background only |
| Mar 2012 | PHP 5.4.0 released. It is the oldest version Calif/Sansec trace the affected code back to. | Multiple sources |
| 2024 | PHP's first external security audit in years (funded by the Sovereign Tech Agency, carried out by Quarkslab). A core developer notices that hitting the memory limit at a specific moment leaves the engine in a broken state. No exploit was shown and every fix had a cost, so it stalls for almost two years. The PHP Foundation later calls this a "structural failure". | Multiple outlets, citing the PHP Foundation's own post-mortem |
| ~Aug 1 / Aug 11 | Calif (researcher Ryan Austin, using OpenAI's GPT-5.6 Sol through OpenAI's "Patch the Planet" program) finds the first issue (Fortune: Aug 1) and reports it to PHP (Aug 11). | Dates differ by source |
| Aug 19 / Aug 24 | Wiz Research (owned by Google) independently finds the bugs (Aug 19) using its own Wiz Atlas plus Google's Gemini 4 Argon (and GPT-5.6 Sol), then reports them privately (Aug 24). | Wiz, via Recorded Future and others |
| Aug–Oct | Coordinated, confidential fix work. Linux distributions and LTS vendors get the patches early. The public release is planned for **Thu Oct 22**. | Multiple |
| **Oct 17** | Amazon's MadPot decoy servers log a PHP2Shell exploit attempt **4 days before** public disclosure. Amazon "can't explain" how the attacker knew. | Amazon (AWS Security Blog) + THN, The Register |
| Oct 20, afternoon | The CVE IDs start circulating online (an anonymous Hacker News post, later removed, with screenshots spread on X and Mastodon). They carry a **wrong** score (10.0) and a wrong release time. | PHP security team member (Daubois), Computer Weekly, CybelAngel |
| Oct 20, 19:33 | PHP's advance notice moves the release to Oct 21, 14:00 UTC. | TuxCare, CybelAngel |
| Oct 20, ~20:00 | Calif mistakenly publishes a video of a proof-of-concept exploit working. It is deleted, but copies spread. PHP says no technical details leaked, but the video "contributed to the faster development" of exploits. | Computer Weekly, InfoWorld, PHP Foundation (as quoted) |
| Oct 21, ~02:00 | First public proof-of-concept exploits appear (Amazon). | AWS via THN |
| Oct 21, 03:02 | Cloudflare's emergency firewall rules go live for all plans, including Free. | Cloudflare blog via ppc.land |
| Oct 21, 07:41 | Chainguard publishes built images containing the fix, about 6 hours before the agreed time. The PHP Foundation objects. | Multiple |
| Oct 21, morning (Europe) | Governments start pulling sites offline, **before the fix exists**. | Multiple |
| **Oct 21, ~14:00** | PHP 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35 released (one outlet: ~13:35). | Multiple + php.net/Foundation |
| Oct 21, evening | The FBI, NSA, UK NCSC, Germany's BSI, CERT-EU and Japan's Prime Minister all say: patch, or take systems offline. The Dutch DigiD website is back ~20:30 CEST. The Czech government site is back ~21:00 local time. | Multiple |
| Oct 21 late (US) / Oct 22 | Cloudflare CEO posts the attempt numbers ("millions now"). | His X post, quoted by many |
| Oct 23 | Unit 42 updates its brief (22.6M exposed instances; one European government victim). PHP publishes a third, narrower issue, CVE-2026-115560, with no emergency patch. CISA updates its alert. | Multiple |

## Claim-by-claim table (current script)

Verdicts: accurate / accurate-with-caveat / misleading / wrong / unverified.

| # | Claim in current script | Verdict | Safe TikTok wording (plain English, right denominator) | Best sources | Caveats |
|---|---|---|---|---|---|
| 1 | "Government websites in **four countries** just switched themselves off." | **WRONG (undercount)** | "Governments in **at least eight countries**, from France and Germany to the UK, Australia and Japan, pulled their own websites offline." | Reuters factbox (Oct 21); AP (Oct 21); AAP (Oct 22); The Register (Oct 22); NOS (Oct 21); Czech Government Office/echo24 (Oct 21) | Firmly sourced (2+ outlets each): **Netherlands, Finland, France, Belgium, Germany, Czech Republic, UK, Australia**. Japan (Ministry of Finance and the weather agency partly suspended online services) rests on the Reuters factbox alone. Denmark, Austria and Canada were reported only by weak sources, so leave them out. All of this happened on **Wed Oct 21**, so on Oct 24 say "this week". Most sites came back within hours to a day. |
| 2 | "switched themselves **off**" (voluntary) | **accurate-with-caveat** | "...pulled their own websites offline, on purpose, as a precaution." | Valtori/Kaleva/Yle (FI); Logius via NOS (NL); French Interior Ministry via Connexion/Selectra; German digital ministry via Reuters | It was voluntary and precautionary, often on the national cyber agency's advice (France: at ANSSI's request; Czechia: NÚKIB). It was partial in places: for DigiD only the **public website** went down, and DigiD log-ins kept working at many agencies. Many went dark **before the fix existed** (morning of Oct 21). |
| 3 | "**Nobody hacked them.**" | **accurate-with-caveat** | "None of them says it was hacked. They pulled the plug just in case." | Valtori (no exploit attempts found); Belgium CCB (no attacks recorded); Logius (not linked to a breach); German digital ministry ("purely preventive"); ASD (not aware of active exploitation); US government (no evidence federal sites compromised) | Unit 42 (Oct 23) describes **one unnamed "government entity in Europe"** where attackers stole password hashes and MFA secrets within 2 hours of exploitation. Nothing ties it to the sites that went offline, but do **not** say "no government was hacked." |
| 4 | "They were fixing a security bug in PHP" | **accurate-with-caveat** | "...waiting for, then installing, an emergency fix for PHP." | PHP release notes / PHP Foundation (Oct 21) | It's **two** related bugs (CVE-2026-109618, -109619). Several governments went offline **before** the fix was out, so they were waiting for a fix as much as installing one. |
| 5 | "PHP, the programming language behind **WordPress** and **about 7 out of 10 websites**" | **accurate-with-caveat** | "PHP, the code running behind about **7 in 10 websites**." Optional: "...including WordPress, which alone runs about **4 in 10** websites." On-screen footnote: "W3Techs, sites whose server language is known." | W3Techs PHP page (Oct 21–23 2026: **69.3%**); W3Techs WordPress page (Oct 22 2026: **39.6%** of all websites, 58.3% of sites with a known CMS) | 69.3% is the share of websites **whose server-side language W3Techs can detect** (W3Techs surveys the top 10 million sites, not every site). The share is drifting down (73.4% in Oct 2025, 70.8% in Jul 2026). WordPress is written in PHP: correct, but the user doubts it works as an anchor (see the "most popular" section). |
| 6 | "Fixing a bug like that takes two steps. First find it, then fix it everywhere. You'd think finding it is the hard part, right?" | framing (no factual error), **but undercut** | If kept: "find it, fix it, then install the fix everywhere." | PHP Foundation post-mortem (via TNW, Oct 21–22); Daubois (PHP security team, Oct 21) | There was a hard **middle** step: PHP **knew of the weak spot in 2024** but couldn't agree on a fix. The final fix touched **390 files**. Implying "finding" was the only obstacle misstates the story. |
| 7 | "And for **14 years**, nobody did [find it]." | **MISLEADING** | "The flaw had been sitting in PHP **since 2012**. PHP's own developers even **spotted the weak spot in 2024**, but nobody could prove it was dangerous, so it never got fixed." | Sansec, Calif via secondary sources, iTWire ("14-year-old bugs"); TNW "PHP knew about one of the flaws in 2024 but could not agree a fix"; Wikipedia PHP2Shell (via extracts) | The **affected code** dates to PHP 5.4.0 (Mar 2012), about **14½ years**, so "14 years old" is fine. But "nobody found it" is wrong: the out-of-memory weakness was flagged in 2004 (as an idea), in 2020 (a bug report) and in 2024 (an audit). It just wasn't proven exploitable. Heise quotes PHP saying the flaws reach "every version since PHP 5", so the scope is disputed. Say "since at least 2012". |
| 8 | "Then, **in August, two security teams using AI tools found it**" | **accurate-with-caveat** | "In August, **two security teams, both using AI models**, found it independently." Optional detail: "...one using OpenAI's model, the other Google's." | OpenAI "Patch the Planet" post (Oct 21); Wiz blog (Oct 21); Fortune, CNN, CBS (Oct 21); Recorded Future | Teams: **Calif** (with OpenAI's GPT-5.6 Sol, in OpenAI's Patch the Planet program; reported Aug 11) and **Wiz Research** (Wiz Atlas plus Google's Gemini 4 Argon, also GPT-5.6 Sol; found Aug 19, reported Aug 24). Press usually credits **three** organisations (OpenAI, Wiz, Calif). Humans ran the research and **AI assisted**, so "AI helped find" is safer than "AI found". Calif said no special harness or non-public model was used. |
| 9 | "and **quietly told the people who make PHP** so a fix could be ready before anyone else knew" | **accurate** | Keep it. | OpenAI (Oct 21: led "a coalition of maintainers, researchers, and security providers" for 2 months); Computer Weekly (Oct 22); Recorded Future | This is standard "coordinated disclosure". The planned public date was **Oct 22**. Distributions got patches early. |
| 10 | "Except, **the details of the bug leaked** online **hours before** the fix came out." | **MISLEADING** | "Except **word leaked a day early**, and the fix had to be **rushed out**." Stronger and verified: "**Attackers were already trying it before the fix existed.**" | Computer Weekly (Oct 22); TechTarget (Oct 22); InfoWorld; Daubois/PHP security team (Oct 21); CybelAngel; AWS (Oct 22) | **What leaked**: the CVE IDs, with a wrong score and a wrong date (afternoon of Oct 20), plus a **video** of an exploit working (~20:00 UTC Oct 20). **PHP says no technical details leaked.** The gap to the fix (~14:00 UTC Oct 21) was **about 18–22 hours**: "a day early", not "hours". Chainguard also published patched images ~6 h early. And **Amazon saw an attempt on Oct 17, before any leak**. |
| 11 | "**Cloudflare, which protects a big chunk of the web**" | **accurate** | "Cloudflare, which sits in front of **about 1 in 5 websites**." | W3Techs reverse-proxy data (Jul 2026: **23.9%** of all websites; ~84% of sites with a known reverse proxy) | Could also say "roughly a quarter". 1 in 5 is safely conservative. |
| 12 | "says it saw **tens of thousands of break-in attempts in 45 minutes, and millions by evening**" | **accurate-with-caveat** | "Cloudflare's CEO says its network saw **tens of thousands of attempts to use the flaw in the first 45 minutes, and millions within the day**." | Matthew Prince on X (late Oct 21 US time / dated Oct 22): "In the 10 hours before it was publicly announced... thousands of attempts... tens of thousands in the 45 minutes post announcement, hundreds of thousands within 2 hours, and millions now." Quoted by The Register, TNW, Neowin, BetaNews | These are **attempts**, mostly automated and blocked by Cloudflare's firewall. They are **not break-ins**. The 45 minutes are counted **from the public announcement**, not from the leak. "Millions" was "now" at posting, late Wed US time (about 10–12 h later), so "by that night" or "within the day" both work. The figures come from a company that sells the protection and are not independently verified. Bonus fact: "thousands" came **in the 10 hours before** the announcement. |
| 13 | "**Nobody knows yet how many got in.**" | **accurate-with-caveat** (MOVING) | "No one has a count of how many got in. Officials say they've found **no confirmed break-ins** so far, but one security firm describes **at least one** successful attack on a European government body." | Recorded Future ("insufficient to establish the extent"); Sophos (only failed attempts); PHP Foundation (no evidence of successful exploitation before disclosure); Unit 42 (Oct 23, one case); watchTowr (in-the-wild exploitation) | As of Oct 22–23, CISA had **not** added the CVEs to its Known Exploited list. Exploit reliability is disputed: the PHP Foundation called early public exploits "non-working", while Tolmo says it built a working one in under a day. |
| 14 | "there are about **22 million copies of PHP** out there that could be hit" | **MISLEADING** (wording) | "One security firm counts **more than 22 million exposed PHP systems** that could be vulnerable." | Palo Alto Networks Unit 42 threat brief (updated Oct 23): "over **22.6 million exposed instances potentially vulnerable**", from Cortex Xpanse telemetry; CXOToday (PANW release) | An "instance" is an **internet-facing service Palo Alto detected running PHP**. It is not a website and not a "copy". One server can host many sites, and many services can be one server. It is an **exposure estimate**, not confirmed-vulnerable. Other counts differ by ~10x: Censys ~41M services with vulnerable version numbers (single source), VulnCheck 2.6M hosts, CybelAngel 2.24M hosts, OX 1.97M "measurable instances". Many servers (Censys: ~54% of services) hide their version. **Attribute the number**, or use "millions of servers". |
| 15 | "If a site can't update fast enough, the safest thing is to switch it off until it can." | **accurate** (it is official advice) | "The **FBI's** advice was literally: if you can't update right away, **take it offline** until you can." | FBI Cyber Division on X (Oct 21); NSA advisory (Oct 21); UK NCSC (Oct 21); BSI warning (level 3/orange); CERT-EU; Japan PM Takaichi on X (Oct 21) | The NSA and CISA reaffirmed this on Oct 23. Japan's PM framed it as "temporarily suspending website functions". |
| 16 | "That's what those government sites did." | **accurate-with-caveat** | "That's what those governments did, and many did it **before the fix even existed**." | NOS/Logius; Valtori; Interior Ministry (FR); Úřad vlády (CZ) | Most went dark on the morning of Oct 21 (Europe), **before** the 14:00 UTC release: there was nothing to install yet. They came back after patching (DigiD site ~20:30 CEST Oct 21; Czech site ~21:00 Oct 21). |
| 17 | "And **one in three sites on PHP** runs a version so old that the people who make PHP don't fix it anymore." | **accurate but UNDERSTATED** (needs caveat) | Conservative: "**At least 1 in 3** PHP websites run a version so old PHP no longer fixes it." Stronger (estimate): "**About half** of PHP websites that show their version run one PHP has stopped fixing." | W3Techs PHP versions (Oct 23 2026): v8 **65.3%**, v7 **26.9%**, v5 **7.7%**, v4 0.1% of PHP sites. W3Techs PHP 8 sub-versions (Jul 2026): 8.0 **7.0%**, 8.1 **17.7%** of PHP 8 sites. php.net supported versions (8.1 EOL **31 Dec 2025**; 8.2 security-only until **31 Dec 2026**) | v7+v5+v4 = **34.7%** of PHP sites, so "1 in 3" holds. But **PHP 8.0 and 8.1 are also out of support** and got **no official release** (≈0.247 × 65.3% ≈ **16%** more, from 3-month-old sub-version data). Total ≈ **~50%**. Cross-checks: CybelAngel finds **59%** of 2.24M internet-facing PHP hosts on versions "with no fix coming"; TechnologyChecker finds 45.6% of domains. Important nuance: the PHP security team **did** publish minimal **source-only backports for 7.4, 8.0 and 8.1** (code commits, no release). Linux distros (Debian, Red Hat, Ubuntu), cPanel, Plesk, CloudLinux and TuxCare ship fixed builds of old versions. So an old version number ≠ necessarily unpatched. W3Techs only sees sites that reveal their version. |
| 18 | "For those, it's **switch off or hope the hosting company sorts it out**." | **MISLEADING** (leaves out the real fix) | "For those sites there's no quick patch: they have to **upgrade**, count on their **hosting company** to backport a fix, or **go dark**." | Automattic/Wordfence via secondary sources; php2shell distro/backport coverage (safeguard.sh, digitalapplied, TuxCare); Huntress | The main remedy is **upgrading to PHP 8.2+**. For shared-hosting customers PHP really is the host's job. Updating WordPress, themes or plugins **does not** fix it (Automattic, Wordfence). |

## Other claims the team asked about

| Topic | Verdict | Safe wording | Sources | Caveats |
|---|---|---|---|---|
| **What the bug lets an attacker do** | verified | "Send the right web request and **a stranger can make the website's server run their own code: no password, no click from anyone**. That's effectively taking over the site." Or: "...and read leftover memory that can hold **passwords and log-in tokens**." | PHP advisory/Foundation (unauthenticated RCE; shown against default Apache/mod_php); Canadian Cyber Centre AL26-026; NSA ("often provide a direct path to the server's file system or database"); Wiz/sagitz (pre-auth RCE on WordPress, Drupal, Joomla, plus memory disclosure from any PHP app) | The code runs as the **web-server user** (control of the site and its data), not automatically "the whole machine". Visitors' own devices aren't directly attacked, but a taken-over site can expose the data it holds. mod_php is the most exposed setup. |
| **Official "take it offline" guidance** | verified | "The FBI and NSA told organisations: update now, or take the system offline." | FBI Cyber Division X post (Oct 21); NSA advisory (Oct 21); NCSC UK; BSI; CERT-EU; ASD; Japan PM | CISA urged immediate patching but at first said it had not seen exploitation. |
| **Real human consequences** | verified (examples) | "In the Netherlands, the national log-in site **DigiD** and the citizens' portal **MijnOverheid** went dark. In France, prefecture websites went down. In Finland, the national library search went offline. Japanese manga apps paused." | NOS (NL, Oct 21); French Interior Ministry via Connexion/Selectra; Valtori/Kaleva (FI: National Land Survey, Finna library search used by 80%+ of municipal libraries); Reuters factbox (Japan MoF and weather agency, Nomura, ANA, Orange, Port of Rotterdam, KNVB, Wikimedia); Anime Corner/Jiji (Magazine Pocket, K MANGA, MANGA Plus, Niconico Manga); Insurance Business/LBC (UK councils: Edinburgh, Oxford, Bristol, Lambeth, Barnet; Met Police); The Register (32 UK government services offline plus 4 partly, per a minister in the Lords; single source) | No affected service reports **data stolen**. The disruption was **access**, mostly for hours. For Wikimedia, reports say volunteer tools (Toolforge, Cloud VPS, e.g. anti-vandalism bots) went offline while Wikipedia itself stayed up; that rests on weak sources, so don't say "Wikipedia went down". French tax (DGFiP) and Météo-France outages come from French press only. |
| **Data at risk** | verified, but hypothetical for victims | "If a site is hit, whatever it stores (accounts, passwords, forms people filled in) could be exposed." | Wiz; NSA; Unit 42 (one case: password hashes and MFA secrets) | Don't imply viewers' data **was** stolen. No confirmed mass breach. |

## Additional strong, verified facts (for hook / stakes / payoff)

1. **PHP knew about the weak spot in 2024 and couldn't agree on a fix.** A core developer noticed it during PHP's first
   external security audit in years. Nobody had proved it was exploitable, and every fix broke something, so it sat for
   ~2 years. The PHP Foundation called this a "structural failure" and is moving its security team from consensus to
   majority vote. *Safe:* "PHP's own team spotted the weak spot two years ago. They just couldn't prove it was dangerous,
   or agree on how to fix it." (TNW / PHP Foundation post-mortem, Oct 21–22.) Twist value: high. Visual fit: high
   (inspectors find a hairline crack in the blueprint, then argue around a table).
2. **Someone tried to use it four days before the world knew.** Amazon's decoy servers ("honeypots") logged an attempt
   on **Oct 17**. Amazon says it's unclear how the attacker got the exploit information. *Safe:* "Four days before the
   flaw was announced, Amazon's decoy servers caught someone already trying it." (AWS Security Blog; THN; The Register,
   Oct 22.) A single attempt, and Amazon can't say it would have worked. Visual fit: high (a decoy building with a
   figure trying the lock).
3. **A day after the fix, almost nobody had installed it.** OX Security looked at **1,974,890** internet-visible PHP
   servers in the affected range. 24 hours after the release, only **14,151 (0.7%)** showed a patched version.
   *Safe:* "A day after the fix came out, more than 99 out of 100 PHP servers you could check still hadn't installed
   it." (OX Security, ~Oct 22.) Caveat: based on the version servers **report**. Patched distro builds can keep old
   version numbers, so this overstates "unpatched" somewhat. Use as "hadn't visibly updated". Visual fit: perfect (a city
   of windows where only a handful light up "fixed").
4. **Japan's prime minister personally posted a warning about a programming language.** Sanae Takaichi posted on X on
   the night of Oct 21, urging operators to patch and, if they couldn't, to consider suspending their sites. The FBI,
   NSA, the UK's NCSC and Germany's BSI said similar things the same day. *Safe:* "Japan's prime minister posted a
   warning about a programming language. The FBI said: patch it or take it offline." (Nippon.com/Jiji, Oct 21;
   FBI X post.) The view counts reported (23M/30M) differ, so skip them. Visual fit: medium (a billboard or loudspeaker
   in the city, no real logos or likeness).
5. **Updating WordPress doesn't fix it.** The flaw lives in PHP itself, so the fix has to come from whoever runs the
   server (hosting company, Linux distribution, container image). Updating WordPress, themes or plugins does nothing.
   *Safe:* "If your site runs on WordPress, hitting 'update' won't help. The fix has to come from whoever runs the
   server." (Automattic and Wordfence via secondary reports; Oct 21–22.) Payoff value for ordinary site owners and
   small businesses.
6. **At least one break-in, fast.** Unit 42 reports one case at an unnamed **European government entity**: within
   **two hours** of the first exploitation, attackers had password hashes and multi-factor-authentication secrets and
   tried to take over its Windows network. *Safe:* "Palo Alto's researchers describe one European government body where
   attackers got hold of passwords within two hours." (Unit 42 threat brief, updated Oct 23.) Single vendor source,
   unnamed victim. Present it as their report, and don't link it to the sites that went offline.
7. (Context, optional) **There's already a third related flaw.** On Oct 23 PHP published CVE-2026-115560. It's
   narrower: it needs a non-default setup and won't get an emergency patch, so the advice is to keep the session upload
   progress setting off. (The Register, Security Affairs, Oct 23.) Good for "and it's not over", but easy to overstate.

## "PHP is the most popular programming language in the world": FALSE

| Ranking | Who's on top | Where PHP is |
|---|---|---|
| TIOBE index, Oct 2026 | Python (19.23%) | about #12 (1.26%). The PHP rank comes from one secondary source, ifeng; the Python figure is from TechRepublic |
| Stack Overflow Developer Survey 2025 | JavaScript (~66% of all respondents, ~69% of professionals) | ~19% of professional developers (≈ #12) |
| GitHub Octoverse 2025 (Oct 28 2025) | TypeScript #1 (passed Python and JavaScript in Aug 2025) | not near the top |

**TRUE, punchy alternatives** (all with the W3Techs denominator "sites whose server-side language is known"):
- "PHP is **the most-used language for running websites**, and it's not close: about **7 in 10** sites. The runner-up,
  JavaScript, is about 1 in 12." (W3Techs Oct 2026: PHP 69.3%, JavaScript 8.2%.)
- "The language quietly running **about 7 in 10 websites**." (Simplest; footnote the denominator on screen.)
- "PHP runs **more of the web than every other server language combined**." (69.3% vs. the rest ≈ 31%. Sites can use
  more than one language, so keep this as a spoken flourish and footnote it.)
- "It's the code behind **Wikipedia** and **WordPress**, which alone runs about **4 in 10 websites**." (MediaWiki is
  written in PHP; WordPress 39.6% of all websites, W3Techs Oct 22 2026.) "Facebook started out on PHP" is also true
  (it later moved to Hack, a PHP offshoot), but that's history, not present tense.
- Avoid: "the most popular programming language", "powers the internet", "70% of the internet" (it's 70% of websites
  whose language can be detected, not of "the internet"; several outlets used this sloppy phrasing).

## Wrong or misleading in the current script (summary)
1. **"four countries"**: wrong. At least eight (NL, FI, FR, BE, DE, CZ, UK, AU), plus Japan per Reuters.
2. **"for 14 years, nobody did [find it]"**: misleading. The code is ~14 years old, but PHP's own developers spotted the
   weak spot in 2024 (and it was flagged in 2020) and didn't fix it because nobody proved it was exploitable.
3. **"the details of the bug leaked online hours before the fix"**: misleading. The CVE IDs (with a wrong score and
   date) and an exploit **video** leaked about **a day** before the fix. PHP says no technical details leaked. An
   attempt was seen even earlier (Oct 17).
4. **"22 million copies of PHP"**: misleading. These are Palo Alto's "22.6 million exposed instances **potentially**
   vulnerable": internet-facing services, not copies or websites, and not confirmed vulnerable. Other scanners count
   2M–41M.
5. **"one in three sites on PHP runs a version... [PHP doesn't] fix anymore"**: understated, with a nuance. PHP 7/5 alone
   is 34.7%. Adding the also-unsupported 8.0/8.1 gives ≈ half. PHP did publish source-only backports for 7.4/8.0/8.1,
   and distros and hosts ship fixed builds.
6. **"switch off or hope the hosting company sorts it out"**: misleading. It leaves out the actual fix (upgrade to
   8.2+); hosts and distros are shipping backports.
7. **"Cloudflare... break-in attempts"**: OK only as "attempts". Never imply they were successful break-ins.
   "By evening" is US-centric and loose; "within the day" is safer.
8. **"Nobody hacked them"**: keep, but as "none of them says it was hacked". Don't extend it to "no government was
   hacked" (see Unit 42's European government case).
9. **"two security teams using AI tools found it"**: fine, but "AI **helped**" is more accurate. Press usually credits
   three organisations (OpenAI, Wiz, Calif).

## Notes for the visual world (city / blueprint / elephant / glass dome)
- Fits the existing world with little change: the 2024 "crack spotted, then argued over" beat (inspectors at the
  blueprint), the Oct 17 decoy building (honeypot), the 99%-still-unpatched city (windows that don't light up), "about
  half the buildings use an old blueprint the architects no longer support", the dome counter ticking from thousands
  to millions, and buildings with generic signs for "national log-in", "library", "weather".
- Needs new assets, but still in-world: Japan's PM / FBI warning (a city loudspeaker or billboard; **no real faces,
  seals or logos**), the AI helpers (two inspector robots or lenses, one per team, unbranded), a leaked "video"
  (a screen in the square).
- Moves away from the world (avoid or redesign): the Chainguard/embargo dispute (too inside-baseball), the Unit 42
  Active Directory/NTLM detail (use "stole passwords" only), anything implying real-org branding (DigiD, Wikipedia,
  Cloudflare marks). Cloudflare as a "glass dome over part of the city" is fine. The dome should cover **about a fifth
  or a quarter** of the skyline, not the whole city, to match the 1-in-5 fact.

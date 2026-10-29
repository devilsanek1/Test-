# Sources: PHP2Shell fact base (compiled 2026-10-24)

**Access note.** None of these pages could be opened directly in this environment. WebFetch failed DNS for every
domain, and curl was refused by the sandbox proxy (HTTP 403 CONNECT). Everything below was checked through WebSearch
extracts (quoted passages returned by the search tool). Before the final script locks, someone with normal browser
access should open the **[P]** sources to confirm the exact wording.

Legend: **[P]** primary (vendor, agency, project or company's own statement), **[R]** credible reporting,
**[S]** secondary or aggregator (use only for leads or corroboration). Dates are publication or snapshot dates as
they appeared in the extracts.

## Primary: PHP project
| Source | Date | Supports |
|---|---|---|
| [P] PHP Foundation, "Today's PHP Security Release, and How We're Strengthening PHP Security": https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/ | 2026-10-21 | Fixed versions; unauthenticated RCE shown against default Apache/mod_php; sequence of events; process changes |
| [P] PHP 8.5.12 announcement (php.announce): https://discourse.thephp.foundation/t/announce-php-8-5-12-released/6288 | 2026-10-21 | Security release; CVE-2026-109618 = out-of-memory leaves request data half-initialised; -109619 = request state outliving the request; no complete mitigation; IDs leaked Oct 20 with a wrong 10.0 score; release moved up a day |
| [P] php.net news archive 2026: https://www.php.net/archive/2026.php | 2026-10 | Release announcements |
| [P] php.net supported versions: https://www.php.net/supported-versions.php | live | 8.2 security support ends 31 Dec 2026; 4-year support policy (8.1 EOL 31 Dec 2025 per third-party guide herodevs) |
| [P] Alexandre Daubois (PHP security team), "What the PHP2Shell rumors got wrong": https://daubois.dev/blog/cve-2026-109618-php2shell-rumors/ | 2026-10-21 | Real score 9.2, not 10.0; the anonymous HN post leaked on Oct 20 and screenshots spread; fix touches 390 files; memory_limit=-1 stopgap |
| [P] php-src releases: https://github.com/php/php-src/releases | 2026-10-21 | Release tags |
| [P] NCSC-NL php2shell repo: https://github.com/NCSC-NL/php2shell | 2026-10 | Dutch operational info (not opened) |

## Primary: discoverers
| Source | Date | Supports |
|---|---|---|
| [P] OpenAI, "Patch the Planet: global response coordination as agents uncover critical vulnerabilities": https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/ | 2026-10-21 | Calif found a critical flaw using GPT-5.6 Sol in Patch the Planet; Wiz independently found and reported both; OpenAI led a coalition for two months; "estimated 70% of websites" |
| [P] OpenAI on X: https://x.com/OpenAI/status/2112907856018309586 | 2026-10-21 | Same |
| [P] Greg Brockman on X: https://x.com/gdb/status/2112921529650688312 | 2026-10-21 | Coalition for 2 months; release moved from Oct 22 to Oct 21 after the leak |
| [P] Wiz Research, "PHP2Shell: AI uncovers critical RCE vulnerabilities affecting 70% of the Internet": https://www.wiz.io/blog/php2shell-php-rce | 2026-10-21 | Found Aug 19 / reported Aug 24 (per Recorded Future and Brandefense extracts); tools Wiz Atlas, Gemini 4 Argon, GPT-5.6 Sol; every PHP release back to 5.4 affected; memory disclosure plus RCE |
| [P] sagitz (Wiz) on X: https://x.com/sagitz_/status/2112901380080058778 | 2026-10-21 | Pre-auth RCE on WordPress, Drupal, Joomla; memory disclosure in any PHP app |
| [P] php2shell.com: https://www.php2shell.com/ | 2026-10-21 | Same claims (researcher site) |
| [P] Google Cloud blog, "Responding to core PHP vulnerabilities...": https://cloud.google.com/blog/products/identity-security/responding-to-core-php-vulnerabilities-cve-2026-109618-cve-2026-109619 | 2026-10 | Gemini 4 Argon's contribution |

## Primary: security vendors (telemetry and claims)
| Source | Date | Supports |
|---|---|---|
| [P] Palo Alto Networks Unit 42, "Threat Brief: Critical Vulnerabilities in PHP: CVE-2026-109618, CVE-2026-109619 (Updated October 23)": https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/ | 2026-10-21, updated 10-23 | "over 22.6 million exposed instances potentially vulnerable" (Cortex Xpanse); one European government entity: password hashes and MFA secrets within 2 h, NTLM relay, Domain Admin attempt; at least one European government took its site offline. Wording on exploitation changed between versions |
| [P] Palo Alto Networks blog, "Millions of PHP Instances Exposed...": https://www.paloaltonetworks.com/blog/2026/10/millions-of-php-instances-exposed-what-organizations-need-to-do-right-now/ | 2026-10 | 22.6M figure context |
| [R] CXOToday (PANW release), "22.6M Exposed Instances Potentially Vulnerable...": https://cxotoday.com/media-coverage/22-6m-exposed-instances-potentially-vulnerable-following-critical-php-disclosure-palo-alto-networks-unit-42/ | 2026-10-21/22 | 22.6M is exposure, not compromise |
| [P] Cloudflare blog, "Cloudflare deploys protections against php2shell vulnerability": https://blog.cloudflare.com/php-vulnerabilities-waf-protection/ | 2026-10-21 (updated 10-23) | WAF rules deployed before disclosure (03:02 UTC Oct 21 per ppc.land); attackers tweaking payloads; mentions CVE-2026-115560 |
| [P] Matthew Prince (Cloudflare CEO) on X: https://x.com/eastdakota/status/2113079352682570051 | late 2026-10-21 US / 10-22 | "In the 10 hours before it was publicly announced... thousands of attempts... tens of thousands in the 45 minutes post announcement, hundreds of thousands within 2 hours, and millions now." |
| [P] AWS Security Blog, "Amazon Threat Intelligence identifies PHP2Shell exploitation prior to public disclosure in MadPot": https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/ | 2026-10-22 | Attempt on Oct 17 (4 days early) from an anonymisation network; how the actor got the exploit info is unclear; public PoCs from ~02:00 UTC Oct 21; multiple actors |
| [P] AWS security bulletin 2026-143: https://aws.amazon.com/security/security-bulletins/2026-143-aws/ | 2026-10-21 | Affected and fixed version ranges |
| [P] watchTowr FAQ: https://watchtowr.com/intelligence/php-cve-2026-109618-faq/ and https://watchtowr.com/intelligence/php-remote-code-execution-php2shell/ | 2026-10-21/22 | In-the-wild exploitation seen via honeypots from Oct 21; CISA KEV not listed as of Oct 22; credits Calif |
| [P] Huntress rapid response: https://www.huntress.com/blog/php2shell-leaked-critical-php-vulnerabilities | 2026-10-21 | "Leaked" framing; no exploitation in its partner base as of 10am ET Oct 21; CWE-416 |
| [P] OX Security, "PHP2Shell: 24 hours in, 99.3% of Measurable PHP Instances Are Still Unpatched": https://www.ox.security/blog/php2shell-24-hours-in-99-3-of-measurable-php-instances-are-still-unpatched/ | ~2026-10-22 | 14,151 of 1,974,890 measurable instances showed a patched version after 24 h (Shodan, version-based) |
| [P] CybelAngel, "2.24M Internet-Facing PHP Hosts, 59% on Versions With No Fix Coming": https://cybelangel.com/blog/critical-php-rce-vulnerabilities-cve-2026-109618-and-cve-2026-109619/ | 2026-10-21/22 | Release ~13:35 UTC; HN post broke the embargo; 5.x 368,570 / 7.x 329,358 / 8.0–8.1 185,789 hosts |
| [P] VulnCheck: https://www.vulncheck.com/blog/php2shell-vulnerabilities | 2026-10 | 2,608,039 internet-facing PHP hosts |
| [P] Sansec: https://sansec.io/research/php2shell | 2026-10-21 | Code back to PHP 5.4.0 (2012); Calif reported Aug 11, Wiz Aug 24 (via secondary extract) |
| [P] Recorded Future: https://www.recordedfuture.com/blog/php2shell-vulnerability-exploitation | 2026-10-22 | Timeline (Aug 19, Aug 24); evidence "insufficient to establish the extent of successful compromise" |
| [P] TuxCare: https://tuxcare.com/blog/php2shell-cve/ | 2026-10-21 | PHP advance notice 19:33 UTC Oct 20; backports for old branches |
| [P] Tenable FAQ: https://www.tenable.com/blog/php2shell-cve-2026-109618-cve-2026-109619-frequently-asked-questions-about-critical-php-remote | 2026-10-21 | Cloudflare CTO "early attacks emerging" |
| [P] Hunt.io: https://hunt.io/blog/php2shell-cve-2026-109618-109619-open-directories | 2026-10-22 | ~1.1M IPs on EOL 7.x/5.x/4.x |
| [S] TechnologyChecker.io: https://technologychecker.io/blog/php2shell-vulnerability | 2026-10 | 45.55% of version-announcing domains on EOL branches |

## Primary: governments and agencies
| Source | Date | Supports |
|---|---|---|
| [P] FBI Cyber Division on X: https://x.com/FBICyberDiv/status/2112921648252719420 | 2026-10-21 | "If an immediate update is not feasible... take the system offline until it can be fully mitigated" |
| [P] UK NCSC, "Critical security issue affecting PHP": https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php | 2026-10-21 | Update; consider taking offline |
| [P] Canadian Centre for Cyber Security AL26-026: https://cyber.gc.ca/en/alerts-advisories/al26-026-critical-vulnerabilities-impacting-php-cve-2026-109618-cve-2026-109619 | 2026-10-21 | CWE-416; unauthenticated arbitrary code execution; PoC available, no active exploitation seen at the time |
| [P] Singapore CSA AL-2026-151: https://www.csa.gov.sg/alerts-and-advisories/alerts/al-2026-151/ | 2026-10 | Advisory (not opened) |
| [R] NSA advisory (via SecureWorld / ExecutiveGov / HackerNoon): https://www.secureworld.io/industry-news/patch-php-now-php2shell ; https://www.executivegov.com/articles/nsa-cisa-urge-immediate-patching-critical-php2shell-vulnerabilities | 2026-10-21/23 | "often provide a direct path to the server's file system or database"; patch or take offline; reaffirmed Oct 23 |
| [R] Nippon.com / Jiji, "Japan PM Warns of Vulnerabilities in PHP Programming Language": https://www.nippon.com/en/news/yjj2026102101249/ | 2026-10-21 | PM Takaichi's X warning; suspend sites if patching is hard; Sakura Internet suspended some functions |
| [R] NOS (NL), "Websites als MijnOverheid en DigiD offline vanwege lek": https://nos.nl/artikel/2636055-websites-als-mijnoverheid-en-digid-offline-vanwege-lek-risico-op-hacks ; liveblog https://nos.nl/liveblog/2636066-mijnoverheid-en-digid-weer-online-wereldwijd-oproepen-om-beveiligingsupdate-te-installeren | 2026-10-21 | DigiD website, MijnOverheid, Tweede Kamer offline; Logius: DigiD log-in still usable, not a breach; NCSC-NL saw no active abuse; back online that evening |
| [R] Kaleva (FI): https://www.kaleva.fi/verkkosivustoissa-laajoja-hairioita-valtion-tieto/13718711 ; Yle: https://yle.fi/a/74-20252600 | 2026-10-21 | Valtori shut public government web services; National Land Survey, Finna; no exploitation attempts found |
| [R] Connexion France, prefecture sites offline: https://www.connexionfrance.com/news/french-prefecture-websites-taken-offline-after-critical-php-security-flaws-found/823055 ; Selectra: https://selectra.info/telecom/actualites/marche/failles-php-sites-coupes-21-octobre-internet | 2026-10-21 | Interior Ministry put exposed sites into preventive maintenance at ANSSI's request; DGFiP, Préfecture de police, Météo-France reported |
| [R] echo24 (CZ): https://www.echo24.cz/a/HPe53/zpravy-domov-nukib-doporucil-webum-s-php-rychlou-aktualizaci ; Devdiscourse/Reuters: https://www.devdiscourse.com/article/international/3995975-czech-government-takes-website-offline-due-to-php-security-warning | 2026-10-21 | Government Office site offline 19:00, back ~21:00; NÚKIB advice |
| [R] ZDFheute (DE), BSI warning: https://zdfheute.de/politik/sicherheitsluecke-php-webseiten-onlinedienste-cybersicherheit-bsi-100.html | 2026-10-21 | BSI level 3/orange; temporary disconnection can be considered |

## Credible reporting
| Source | Date | Supports |
|---|---|---|
| [R] Reuters factbox (syndicated), "Governments, companies take websites offline over PHP flaws": https://finance.yahoo.com/news/factbox-websites-taken-offline-over-185931163.html ; https://www.investing.com/news/stock-market-news/factboxwebsites-taken-offline-over-php-risks-4963631 ; https://www.thestar.com.my/tech/tech-news/2026/10/21/factbox-websites-taken-offline-over-php-risks | 2026-10-21/22 | Country list: DE (ITZBund), FR (prefectures), BE (foreign ministry; CCB recorded no attacks), NL (Overheid.nl, Port of Rotterdam, KNVB), FI (Valtori), CZ, JP (MoF, weather agency, Nomura, ANA), UK; Orange; Wikimedia |
| [R] AP, "Some websites go dark as operators address an AI-detected flaw in a web programming language": https://www.yahoo.com/news/science/articles/websites-dark-operators-address-ai-021032218.html | 2026-10-21 | Gov sites in FR, NL, DE, BE, FI; FBI offline advice; private report, leak a day early; Wikimedia took supporting services offline |
| [R] The Register, "PHP2Shell puts dozens of UK government services out of service": https://www.theregister.com/security/2026/10/22/php2shell-puts-dozens-of-uk-government-services-out-of-service/5304840 | 2026-10-22 | 32 UK services offline plus 4 partly (minister in the Lords); OBR; DVLA and police raised; no confirmed compromise; Australia's cyber agency site |
| [R] The Register, "Hackers pile on PHP2Shell as AWS reveals attacks began before disclosure": https://www.theregister.com/cyber-crime/2026/10/22/hackers-pile-on-php2shell-as-aws-reveals-attacks-began-before-disclosure/5304749 | 2026-10-22 | Prince numbers; AWS Oct 17 |
| [R] The Register, "There's a third PHP2Shell bug, but it won't get an emergency fix": https://www.theregister.com/security/2026/10/23/theres-a-third-php2shell-bug-but-it-wont-get-an-emergency-fix/5305208 | 2026-10-23 | CVE-2026-115560 |
| [R] Computer Weekly, "Botched PHP2Shell disclosure revealed as panic continues": https://www.computerweekly.com/news/366652674/Botched-PHP2Shell-disclosure-revealed-as-panic-continues | 2026-10-22 | Disclosure work since August; CVE IDs and misinformation circulating on the afternoon of Oct 20; timeline moved ~24 h; Calif video; Chainguard 07:41 UTC |
| [R] TechTarget, "PHP2Shell disclosure unravels after leaks forced early patch drop": https://www.techtarget.com/cybersecurity/news/366652613/PHP2Shell-disclosure-unravels-after-leaks-forced-early-patch-drop | 2026-10-22 | Leak and embargo break; Chainguard dispute |
| [R] InfoWorld, "PHP2Shell exposes the weakness in coordinated vulnerability disclosure": https://www.infoworld.com/article/4239342/php2shell-exposes-the-weakness-in-coordinated-vulnerability-disclosure.html | 2026-10-22 | Calif video ~20:00 UTC Oct 20; PHP: no technical details leaked; Barron: no evidence of working exploits; Tolmo: working exploit in under a day |
| [R] The Next Web, "PHP knew about one of the flaws in 2024 but could not agree a fix": https://thenextweb.com/news/php-foundation-structural-failure-2024-flaw-leak | 2026-10-22 | 2024 audit (Sovereign Tech Agency / Quarkslab); stalled ~2 years; "structural failure"; move to majority vote |
| [R] The Next Web, "Cloudflare sees millions of attempts...": https://thenextweb.com/news/cloudflare-php2shell-millions-exploit-attempts ; "Millions of PHP2Shell attempts so far, but officials see no break-in": https://thenextweb.com/news/php2shell-millions-exploit-attempts-no-confirmed-breaches | 2026-10-22 | Attempts ≠ breaches |
| [R] The Hacker News, "Someone Tried to Exploit PHP2Shell 4 Days Before...": https://thehackernews.com/2026/10/someone-tried-to-exploit-php2shell-4.html ; "PHP Issues Emergency Patches...": https://thehackernews.com/2026/10/php-issues-emergency-patches-for-two.html | 2026-10-21/22 | Oct 17 attempt; patches; source backports for 7.4/8.0/8.1 |
| [R] SecurityWeek: https://www.securityweek.com/php2shell-exploitation-started-days-before-patches/ ; https://www.securityweek.com/php2shell-patches-land-as-first-exploitation-attempts-hit-sensors/ | 2026-10-21/22 | Planned Oct 22, leaked Oct 20; first attempts |
| [R] Help Net Security: https://www.helpnetsecurity.com/2026/10/21/php2shell-php-vulnerabilities-patched-cve-2026-109618-cve-2026-109619/ | 2026-10-21 | Patched versions |
| [R] BleepingComputer: https://bleepingcomputer.com/news/security/php-ships-emergency-patches-for-critical-php2shell-flaws | 2026-10-21 | Patch details |
| [R] Dark Reading: https://www.darkreading.com/application-security/php2shell-bugs-red-alert-security-industry | 2026-10-21/22 | Scan counts (4.4M services / 1.9M hosts; ~79% on unsupported versions, per one researcher) |
| [R] CNN (Lisa Eadicicco): https://us.cnn.com/2026/10/21/tech/php2shell-vulnerability-ai | 2026-10-21 | Three companies (OpenAI, Wiz, Calif) used AI; passwords in memory |
| [R] Fortune (Emily Forlini): https://fortune.com/2026/10/21/ai-tools-discovered-the-php-vulnerability-that-could-take-down-70-of-the-internet-now-the-race-is-on-to-patch-it-before-ai-powered-hackers-attack/ | 2026-10-21 | Calif found the first issue Aug 1 with GPT-5.6 Sol; Wiz: one researcher in a week (company claim); 70% "where the server-side language is known" |
| [R] CBS News: https://www.cbsnews.com/news/php2shell-vulnerability-ai-security-flaw/ | 2026-10-21/22 | NSA advice; overview |
| [R] CNBC, "Why governments pulled websites offline over the decades-old PHP programming language": https://www.cnbc.com/2026/10/22/php2shell-vulnerability-what-is-it-and-is-your-data-at-risk.html | 2026-10-22 | Overview (extract only) |
| [R] Euronews: https://www.euronews.com/2026/10/22/websites-go-dark-after-ai-exposes-major-programming-language-security-flaw | 2026-10-22 | Overview |
| [R] AAP via Canberra Times, "Government websites go dark in software flaw scramble": https://www.canberratimes.com.au/story/9373041/government-websites-go-dark-in-software-flaw-scramble/ | 2026-10-22 | Australian departments affected (Home Affairs minister's spokesperson); ASD not aware of active exploitation |
| [R] iTWire, "PHP2Shell: the 14-year-old bugs that pulled cyber.gov.au and government sites worldwide offline": https://itwire.com/business-it-news/security/php2shell-the-14-year-old-bugs-that-pulled-cyber-gov-au-and-government-sites-worldwide-offline | 2026-10-22 | 14-year age; cyber.gov.au offline |
| [R] Insurance Business UK, "UK councils and Met Police among sites pulled offline after NCSC alert": https://www.insurancebusinessmag.com/uk/news/cyber/uk-councils-and-met-police-among-sites-pulled-offline-after-ncsc-alert-594424.aspx | 2026-10-21/22 | Edinburgh, Oxford, Bristol, Lambeth, Barnet councils; Met Police |
| [R] heise, "php2shell: Critical flaws allow code injection in PHP": https://www.heise.de/en/news/php2shell-Critical-flaws-allow-code-injection-in-PHP-11494897.html | 2026-10-21 | PHP team: flaws in every version since PHP 5 (scope dispute) |
| [R] Anime Corner, manga platforms in emergency maintenance: https://animecorner.me/magazine-pocket-k-manga-manga-plus-and-more-enter-emergency-maintenance-due-t | 2026-10-21 | Japanese consumer services paused |
| [R] Security Affairs, third flaw: https://securityaffairs.com/201595/security/php-warns-of-new-code-execution-flaw-days-after-php2shell-patches.html | 2026-10-23 | CVE-2026-115560 |
| [R] BankInfoSecurity, "How PHP's Coordinated Disclosure Process Went Belly Up": https://www.bankinfosecurity.com/how-phps-coordinated-disclosure-process-went-belly-up-a-33176 | 2026-10-22/23 | Post-mortem coverage |

## Usage and market-share data
| Source | Date | Supports |
|---|---|---|
| [P] W3Techs, PHP usage: https://w3techs.com/technologies/details/pl-php | snapshot 2026-10-21..23 | PHP used by **69.3%** of websites whose server-side language is known; versions among PHP sites: v8 65.3%, v7 26.9%, v5 7.7%, v4 0.1% |
| [P] W3Techs, server-side languages overview: https://w3techs.com/technologies/overview/programming_language | 2026-10 | PHP 69.3%, JavaScript 8.2%, Ruby 7.1%, Java 5.5%, ASP.NET 4.2% (sites can use more than one) |
| [P] W3Techs, PHP 8 sub-versions: https://w3techs.com/technologies/history_details/pl-php/8 | 2026-07-04 | 8.3 31.2%, 8.2 31.0%, 8.1 17.7%, 8.4 10.8%, 8.0 7.0%, 8.5 2.4% of PHP 8 sites (3 months old) |
| [P] W3Techs, PHP version history: https://w3techs.com/technologies/history_details/pl-php | 2026-10 | PHP 8 rose from ~51% (Oct 2025) to ~65% |
| [P] W3Techs, WordPress: https://w3techs.com/technologies/details/cm-wordpress | 2026-10-22 | **39.6%** of all websites; 58.3% of sites with a known CMS |
| [P] W3Techs, Cloudflare (reverse proxy): https://w3techs.com/technologies/comparison/cn-cloudflare ; history https://w3techs.com/technologies/history_overview/proxy/all | 2026-07-16 | **23.9%** of all websites; ~84% of sites with a known reverse proxy |
| [R] TechRepublic, TIOBE October 2026: https://www.techrepublic.com/article/news-tiobe-october-2026-java-closes-cpp-gap/ | 2026-10 | Python #1, 19.23% |
| [S] tech.ifeng.com (TIOBE Oct 2026 PHP rank): https://tech.ifeng.com/c/8xAGg81hZVd | 2026-10 | PHP #12, 1.26% (single source) |
| [P] Stack Overflow Developer Survey 2025, technology: https://survey.stackoverflow.co/2025/technology/ | 2025 | JavaScript leads usage; PHP ≈19% of professionals (figure via secondtalent.com calculation) |
| [P] GitHub Octoverse 2025: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/ | 2025-10-28 | TypeScript #1 by monthly contributors (since Aug 2025), Python #2 |
| [R] Wikipedia, MediaWiki: https://en.wikipedia.org/wiki/MediaWiki | live | MediaWiki (Wikipedia's software) is written in PHP |
| [R] Wikipedia, HHVM: https://en.wikipedia.org/wiki/HHVM | live | Facebook's PHP heritage (HipHop, then HHVM and Hack) |

## Secondary or aggregator (leads only; don't cite on screen)
- Wikipedia "PHP2Shell": https://en.wikipedia.org/wiki/PHP2Shell (affected 5.4–8.5; the 2024 audit; Wikimedia shut supporting services). Live article, changing fast.
- TechRadar live blog: https://www.techradar.com/pro/live/php-issues-affect-websites-across-the-world-all-the-latest-updates-and-what-you-need-to-know
- ScienceTimes: https://www.sciencetimes.com/articles/62783/20261022/european-government-websites-go-offline-after-critical-php-security-flaw-emerges.htm
- Insider Paper list: https://insiderpaper.com/list-of-websites-affected-by-critical-php-flaws/
- ppc.land (Cloudflare 03:02 UTC rules; vendor-claim caveat): https://ppc.land/cloudflare-blocks-php2shell-exploits-9-hours-before-php-flaws-went-public/
- BigGo Finance (hundreds of thousands in 2 h; "one full-time employee" claim, unverified): https://finance.biggo.com/news/f8fa58bc-884f-48ec-b57e-f3155a08c73f
- safeguard.sh (EOL options, source backports dated Oct 18): https://safeguard.sh/resources/blog/php2shell-end-of-life-php-7-4-8-0-8-1-options
- digitalapplied (fixes by distro and panel; Plesk reuses version numbers): https://www.digitalapplied.com/blog/php2shell-fixes-by-distro-control-panel-php-version
- dev.to "Wikipedia Stayed Up. Toolforge Did Not.": https://dev.to/flisk/wikipedia-stayed-up-toolforge-did-not-5h8o
- letsdatascience "Canada Pulls Government Websites..." (weak; not used): https://letsdatascience.com/news/canada-pulls-government-websites-after-ai-found-php-flaws-4e373485
- smartscope "Did AI Really Find the PHP Vulnerability?": https://smartscope.blog/en/blog/php2shell-ai-really-find-php-vulnerability-roles-openai-2026/

## Could not open / could not confirm
- **Every URL above was not directly opened** (DNS failure for WebFetch, proxy 403 for curl).
- Not confirmed: Censys "41M / 33.5M vulnerable services" (one extract only, heise article not found); the exact
  timestamp of Prince's post; the full list of 32 UK services (the government hasn't published one); Japan's Ministry of
  Finance and weather agency (Reuters factbox only); Hansard record of the Lords statement; the official CISA KEV
  status after Oct 23.

# Video 3, topic B: fact lock

Topic: "AI is outbidding you for the memory in your laptop". Locked 2026-10-25 (research only, nothing committed).

Verdicts: **VERIFIED** = primary source, or 2+ reputable outlets agree. **REPORTED** = one outlet, an aggregator, or a forecast
we can only quote as a forecast. **FALSE** = contradicted by the data, or wrong as currently worded.

Method note: bls.gov, FRED and api.bls.gov were unreachable from this session (proxy 403 / DNS), and WebFetch failed on every
host, so BLS figures rest on the BLS release table (checked earlier, see G0 doc), plus Counterpoint and secondary outlets that
quote the series. Search snippets were used for everything else. Before G8, open the BLS series page
(data.bls.gov/timeseries/CUUR0000SEEE01, 12-month % view) in a browser once to tick the four 1-line BLS rows below. It takes 2 minutes.

## 1. US CPI, computers, peripherals and smart home assistants (CUUR0000SEEE01, index Dec 2007 = 100, US only)

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 1.1 | Sept 2026 year-on-year change | VERIFIED | +9.7% y/y | Sept 2026 data, released 14 Oct 2026 | BLS CPI release table: https://www.bls.gov/news.release/archives/cpi_10142026.htm ; ROIC.ai: https://www.roic.ai/news/ai-boom-fuels-sharpest-computer-price-inflation-in-two-decades-10-14-2026 | "In the US, computers cost almost 10% more than a year ago." |
| 1.2 | Weight in the CPI | VERIFIED | about 0.3% (0.293 Dec 2025 weights; 0.309 Aug table; 0.319 Sept table) | Dec 2025 to Sept 2026 | BLS factsheet: https://www.bls.gov/cpi/factsheets/personal-computers.htm ; ROIC.ai (above) | "Computers are a tiny slice of overall inflation." Never "AI is raising prices on everything". |
| 1.3 | "Largest rise in at least 15 years" | VERIFIED | Sept 2026 = highest y/y "in at least 15 years" (Counterpoint); "largest since at least 2006" (ROIC.ai) | Oct 2026 | Counterpoint: https://counterpointresearch.com/en/reports/us-inflation-numbers-show-impact-of-memory-shortage-on-pc-prices ; ROIC.ai (above) | "The biggest jump in at least 15 years." |
| 1.4 | "Largest since 2006" (about 20 years) | REPORTED | +9.7% = largest since at least 2006; the BLS series' monthly data seem to start Jan 2005, so 2006 is the first year a y/y figure exists | 14 Oct 2026 | ROIC.ai (above); Trading Economics (FRED data, record high Jan 2005): https://tradingeconomics.com/united-states/consumer-price-index-for-all-urban-consumers-personal-computers-and-peripheral-equipment-fed-data.html | Only after a direct check of the BLS series: "the biggest jump in about 20 years". Until then, use 1.3. |
| 1.5 | "Biggest ever / a record" | FALSE as a claim we can make (not shown) | The series seems to start in 2005; older linked data (1997-2004) show falls of 10-30% a year, so a record is likely but not established | n/a | in2013dollars (BLS-based): https://www.in2013dollars.com/Computers,-peripherals,-and-smart-home-assistants/price-inflation | Don't say "record" or "ever". |
| 1.6 | Earlier y/y rises: only the pandemic bump | VERIFIED | Last 15 years: up y/y only once before, at the height of COVID. 2021 figures: +5.1% y/y in Aug 2021, +5.3% in Sept 2021; 2021 annual average +2.9% (38.30 to 39.42); Jan 2021 38.32 to Dec 2021 39.40 | Counterpoint report June 2026; BLS releases Sept/Oct 2021 | Counterpoint (1.3 URL); BLS: https://www.bls.gov/news.release/archives/cpi_09142021.pdf and https://www.bls.gov/news.release/archives/cpi_10132021.pdf ; in2013dollars (1.5 URL) | "For 20 years computers kept getting cheaper, apart from one small bump in the pandemic." Chart: one bump in 2021. |
| 1.7 | "Cheaper every single year for 20 years" | FALSE | The index rose year on year in 2021 | 2021 | as 1.6 | Use 1.6 wording ("kept getting cheaper", "almost every year"). |
| 1.8 | Long-run fall since 2005 | VERIFIED (levels) / REPORTED (Sept 2026 level) | Jan 2005 155.7 (series high) to Dec 2025 33.73 (all-time low) = -78%. May 2026 35.66. Sept 2026 about 38.55 (one commentary, consistent with +9.7%) = still about 75% below 2005. About -5.5% a year since Dec 2007 (100 to 35.66) | Jan 2005 to Sept 2026 | Trading Economics (1.4 URL); Counterpoint June 2026 (1.3 URL, gives 35.661 and the Dec 2025 low of 33.73); Business Model Analyst: https://businessmodelanalyst.com/warsh-ai-shock-computer-prices-inflation/ | "For the same computing power, prices fell about three-quarters since 2005." Not "a laptop cost 4x more in 2005": the index is quality-adjusted (see 1.9). |
| 1.9 | Quality adjustment caveat | VERIFIED (method) / REPORTED (Fed caution) | BLS adjusts PC prices for better specs (attribute costs); the Fed reportedly warns part of the 2026 rise may be measurement | 2026 | BLS factsheet (1.2 URL); Fed note (on software and accessories): https://www.federalreserve.gov/econres/notes/feds-notes/measurement-of-computer-software-and-accessories-inflation-20260522.html | No on-screen line needed; keep "for the same computing power" wording. |

## 2. PC shipments, Q3 2026 (worldwide, preliminary)

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 2.1 | Counterpoint Q3 | VERIFIED | 57M units, -21% y/y, -13.8% q/q | 22-23 Oct 2026 | Counterpoint: https://counterpointresearch.com/en/insights/global-pc-shipments-plunge-21-percent-in-q3-2026 ; GSMArena: https://www.gsmarena.com/counterpoint_global_pc_shipments_were_down_21_in_q3-news-75193.php ; Dataconomy: https://dataconomy.com/2026/10/23/pc-shipments-fall-21-percent-q3-2026-component-costs/ | "About a fifth fewer computers shipped last quarter." |
| 2.2 | Counterpoint Q4 forecast | VERIFIED (as forecast) | -27% y/y in Q4 2026; 2027 roughly flat vs 2026 ("stabilization, not recovery", David Naranjo) | 22-23 Oct 2026 | as 2.1 | "Analysts expect an even bigger drop this quarter." |
| 2.3 | Year-ago base was inflated | VERIFIED | Q3 2025 was boosted by the Windows 10 end-of-support rush and tariff stockpiling (Counterpoint); IDC blames a pull-in in H1 2026 first, then supply and prices | Oct 2026 | Counterpoint (2.1); IDC via TweakTown: https://www.tweaktown.com/news/114035/pc-shipments-fell-by-a-massive-20-percent-year-over-year-last-quarter-and-yes-its-due-to-the-memory-crisis/index.html | Don't say the drop is only prices, and don't say "not because people stopped wanting them". Say "...as prices climbed". |
| 2.4 | Gartner Q3 | VERIFIED | 55.4M, -22.4% (from 71.3M); HP -30.9%, Dell -25.4%; all top six down; Gartner says prices and scarce parts, "not excess inventory" | 12 Oct 2026 | Gartner newsroom (G0 URL); Electronics Weekly: https://www.electronicsweekly.com/news/business/q3-pc-units-down-22-4-yoy-2026-10/ | as 2.1 |
| 2.5 | IDC Q3 | VERIFIED | 62.7M, -20.1% (from 78.5M) | 8 Oct 2026 | TweakTown (2.3); Windows Central: https://www.windowscentral.com/hardware/laptops/global-pc-shipments-drop-20-yoy | as 2.1 |
| 2.6 | Omdia Q3 | VERIFIED | 58.1M, -21.2%; Q4 forecast -24%; 2027 -7% | 9 Oct 2026 | Omdia: https://omdia.tech.informa.com/pr/2026/oct/global-pc-shipments-fall-21percent-in-3q26-as-pull-forward-demand-subsides ; EMSNow: https://www.emsnow.com/omdia-global-pc-shipments-fall-21-in-3q26-as-pull-forward-demand-subsides/ | as 2.1 |

## 3. Memory's share of a PC's cost

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 3.1 | Omdia: memory + storage share | VERIFIED | DRAM and SSDs "nearly 40% of PC costs", vs a typical "around 15%"; PC material costs up over 40% at every price point | 9 Oct 2026 | Omdia release (2.6 URL); StockTitan copy: https://www.stocktitan.net/news/TTGT/omdia-global-pc-shipments-fall-21-in-3q26-as-pull-forward-demand-rhc1jfolr85u.html | "Memory and storage chips: now almost 40% of what a PC's parts cost. Normally it's about 15%." |
| 3.2 | "RAM alone is 40% of a PC" | FALSE as worded | The 40% covers RAM and SSD storage together. Gartner's narrower memory-only estimate: 16% of parts cost (2025) to about 23% (2026 forecast) | Feb 2026 (Gartner) | Tom's Hardware: https://www.tomshardware.com/tech-industry/rising-memory-prices-pile-more-strain-on-consumer-pc-market | Always "memory and storage" (or "memory chips", since SSDs are flash memory chips). Never "RAM is 40%". |

## 4. DRAM prices in 2026, why, and who makes it

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 4.1 | "About 5x" | VERIFIED | Gartner (Namrata Banerjee): DRAM costs about 5x year on year in Q2 2026, passed on to buyers | 12 Oct 2026 | Gartner newsroom (G0 URL); ITVoice copy: https://www.itvoice.in/gartner-says-worldwide-pc-shipments-declined-22-4-in-third-quarter-of-2026-as-component-cost-inflation-raised-asps | "The memory chips cost about five times what they did a year earlier." |
| 4.2 | TrendForce Q1 2026 contract prices | VERIFIED | Conventional DRAM +93-98% q/q (actual), the biggest quarterly rise on record; PC DRAM forecast >100% | Feb and Jun 2026 | TrendForce: https://www.trendforce.com/presscenter/news/20260601-13070.html and https://www.trendforce.com/presscenter/news/20260202-12911.html | "In the first three months of 2026 alone, memory prices roughly doubled." |
| 4.3 | TrendForce Q2-Q4 2026 | VERIFIED (forecasts) | Q2 +58-63% q/q (forecast; Q2 DRAM industry revenue +59.5% to $154.7B); Q3 conventional +13-18% (PC DRAM +15-20%); Q4 conventional +10-15% | Jun-Sep 2026 | TrendForce: https://www.trendforce.com/presscenter/news/20260907-13219.html , https://www.trendforce.com/presscenter/news/20260703-13134.html , https://www.trendforce.com/presscenter/news/20260930-13258.html | "And they're still climbing." (rises are slowing, not reversing) |
| 4.4 | UBS price view | REPORTED | Q3 DDR contract +32% q/q, Q4 +18%; DRAM demand +36% vs supply +19% in 2027 | 3 Jul 2026 | Wccftech: https://wccftech.com/ubs-doubles-its-dram-price-forecast-as-memory-demand-outpaces-supply-by-17-points-through-2027/ | Not for screen. |
| 4.5 | Why: makers prioritise AI/server memory | VERIFIED | Makers put server and HBM first (TrendForce); Micron "prioritized higher-priced server DRAM"; Omdia: DRAM/NAND output "increasingly going to AI servers" | Jan-Sep 2026 | TrendForce: https://www.trendforce.com/presscenter/news/20260105-12860.html ; TrendForce 2Q26 ranking (4.3 first URL); Omdia US 1Q26 (5.1 URL) | "Memory makers are selling to AI data centres first, because they pay more." |
| 4.6 | Why: HBM eats factory capacity | REPORTED | HBM uses about 3x the wafer per GB; HBM about 22% of DRAM wafer input in 2026, 30% in 2027 (TrendForce model via IntuitionLabs) | 2026 | IntuitionLabs: https://intuitionlabs.ai/articles/hbm-dram-ai-memory-demand | "The memory AI needs takes about three times the factory space." (only with "about") |
| 4.7 | The big 3 and their share | VERIFIED | Q2 2026 DRAM revenue share: Samsung 39.4%, SK hynix 24.9%, Micron 23.3% = 87.6%; CXMT (China) 9.5% | 7 Sep 2026 | TrendForce (4.3 first URL); Evertiq: https://evertiq.com/news/2026-09-07-dram-industry-revenue-surges-595-in-q2-as-supply-lags-demand | "Three companies make almost 9 in 10 of the world's memory chips." |
| 4.8 | "It's not a shortage" | FALSE | Every source calls it a shortage | n/a | all of the above | Keep "less a shortage than an auction". |

## 5. Are cheap laptops hit hardest?

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 5.1 | US sub-$500 PCs fell much faster (measured) | VERIFIED | Q1 2026 US: PCs under $500 -18.7% y/y vs whole US market -7.0% (15.8M); consumer -9.5%, business -5.0%; Omdia: low-priced PCs "increasingly unviable" | 30 Jun 2026 | Omdia/Business Wire: https://www.businesswire.com/news/home/20260630124419/en/Omdia-US-PC-Shipments-Fell-7.0-in-1Q26-Marking-Steepest-Decline-Since-2023 ; HotHardware: https://hothardware.com/news/slumping-us-pc-shipments-sharpest-decline-nearly-3-years | "In the US, sales of PCs under $500 fell almost three times faster than the rest." Or just "The cheap ones go first." |
| 5.2 | US average PC price passes $1,000 | VERIFIED | Q2 2026 US average sell-in price above $1,000 for the first time, +12% y/y | Sep 2026 | Omdia: https://omdia.tech.informa.com/pr/2026/sep/us-pc-shipments-grew-1point0percent-in-2q26-while-full-year-market-forecast-to-decline-10point7-percent | "The average new PC in the US now costs over $1,000, a first." |
| 5.3 | Makers shift to pricier models | VERIFIED | Gartner: "shift toward higher-priced configurations"; Counterpoint: fewer affordable choices for price-sensitive buyers | Oct 2026 | Gartner (4.1 URL); Counterpoint (2.1 URL) | "Makers are dropping the cheap models." |
| 5.4 | Sub-$500 segment "gone by 2028" | REPORTED (forecast) | Gartner (Ranjit Atwal): the sub-$500 PC segment will disappear by 2028 | 26 Feb 2026 | Tom's Hardware (3.2 URL); TechRadar: https://www.techradar.com/computing/laptops/the-sub-usd500-entry-level-pc-segment-will-disappear-by-2028-gartner-predicts-that-budget-computers-are-on-borrowed-time | Only as a forecast: "One analyst firm says the under-$500 laptop could be gone by 2028." |

## 6. When does it ease?

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| 6.1 | Micron: tighter before it eases | VERIFIED | Supply "much tighter in 2027 and 2028 than in 2026"; over 75% of 2027 output already committed | 30 Sep 2026 (FQ4 call) | TechPowerUp: https://www.techpowerup.com/353296/micron-ceo-says-memory-supply-will-be-much-tighter-in-2027-and-2028-than-in-2026 ; Investing.com transcript: https://www.investing.com/news/transcripts/earnings-call-transcript-micron-tops-q4-2026-estimates-as-demand-stays-hot-93CH-4925992 | "One of the big three says 2027 and 2028 will be even tighter." |
| 6.2 | Analysts: relief late 2027 at the earliest, more likely 2028 | REPORTED (several, mostly via aggregators) | Counterpoint: shortage could last to H2 2027 or beyond; UBS: undersupplied until at least Q2 2028; BofA: mild price fall not until 2028; Gartner: late 2027 at the earliest; SK hynix CEO (Reuters): 2027 the worst supply year in the industry's history | Jul-Oct 2026 | Wccftech (Counterpoint): https://wccftech.com/there-is-no-scenario-where-memory-prices-will-drop-anytime-soon/ ; Wccftech (UBS, 4.4 URL); BuySellRam roundup: https://www.buysellram.com/blog/when-will-the-memory-shortage-end/ ; tbreak (Reuters): https://tbreak.com/memory-chip-crunch-gets-worse-sk-hynix-boss/ | "Experts don't expect it to ease before 2027-28." (keep the range, not one year) |
| 6.3 | Dissent | REPORTED | Bloomberg Intelligence: shortage may have peaked in Q2 2026, possible oversupply by 2028 | 2026 | via Wccftech (4.4 URL) | Not for screen; reason to say "expect", not "will". |

## Supporting facts (from the G0 open list)

| # | Fact | Verdict | Number | Date | Outlet + URL | Safe on-screen wording |
|---|---|---|---|---|---|---|
| S.1 | Intel CPU price hike | REPORTED | About +10% on PC CPUs from 5 Oct, the third 2026 hike; DigiTimes supply-chain sources, not confirmed by Intel | Sep-Oct 2026 | Notebookcheck: https://www.notebookcheck.net/Intel-plans-another-10-PC-CPU-price-hike-in-October-per-report.1393708.0.html | Not for screen. |

## What this changes in the script

- Hook: "For 20 years computers kept getting cheaper (one small bump in the pandemic). In the past year they went up almost 10%." OK.
  Add "in the US" on screen. "Biggest jump in at least 15 years" is safe; "in 20 years" only after the BLS check; never "record".
- Twist: "Memory now makes up about 40%" must become "memory and storage chips (or memory chips) now make up almost 40% of a PC's parts cost, up from about 15%".
- Payoff: "The world bought a fifth fewer computers... not mainly because people stopped wanting them" fails twice: the numbers are
  shipments, and last year's figure was inflated by the Windows 10 rush. Use "About a fifth fewer computers shipped last quarter as prices climbed, and the cheap ones are going first."
  "Cheap ones go first" is now measured (US PCs under $500 -18.7% vs -7.0% overall, Q1 2026).
- Explanation: "The few companies that make it" can become "three companies make almost 9 in 10 of the world's memory chips".
- Relief line: "analysts don't expect relief before 2027-28" holds. Micron says it gets tighter first.

**G8 check, 2026-10-27:** the BLS series page (data.bls.gov/timeseries/CUUR0000SEEE01, 12-month % view) read in this session: 2026 Jan 1.6, Feb 0.9, Mar 2.2, Apr 2.3, May 1.3, Jun -0.8, Jul 3.9, Aug 8.4, **Sep 9.7**. Fact 1.1 ticked.

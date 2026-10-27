# Video 2: beat map of the fixed narration (take 2)

The clock and the meaning every visual must serve. Written 2026-10-27 for the fresh production (no sketch stage). It
prescribes no pictures, palette or style: it fixes WHEN things happen, WHAT the viewer must get at that moment, and
what visuals may never do. Nothing from the dropped first production (`archive/restart_2026-10-27/`) is used.

- **Audio:** `public/v2/voice.wav`, 39.08 s (2345 frames at 60 fps), 0.12 s lead. Voice is audible from 0.24 s to 38.82 s.
- **Clock data:** `public/v2/voice_words.json` (111 tokens; `can'tveto` = "can't veto", so 112 spoken words, ~174 wpm).
- **Inputs:** `../CORE_LINE.md` (core line, s2 rules), `../research/factlock.md` (FL), `guardrails.md`, `timeline.md`,
  `industry.md`, `../source_bbc_2026-10-21.md` (BBC), `../script/script_g1.md`, `../../CREATIVE_BRIEF.md` (s9-11, s18-19).

**Read this before using the json (listen-proxy).** The aligner (Parakeet TDT) gives word STARTS on a 0.04 s grid and
stretches every word to the next start, so the json has zero gaps: every pause hides inside the previous word's `e`.
The real pauses below come from the waveform (10 ms RMS envelope, voiced = within 40 dB of the peak; cross-checked with
ffmpeg silencedetect at -45 and -38 dB). Json onsets match the audio within about 0.07 s, except for four words:

| Word | json `s` | Audible onset | Use |
|---|---|---|---|
| "life" (hook) | 5.32 | **4.98** ("for" 4.80) | key the "for life" hit to 4.98 s (f299), not 5.32 |
| "it" ("criticizing it…") | 4.52-4.84 | ends 4.54 | the "…" pause is 4.54-4.79 |
| "of" ("of any kind") | 31.88 | 32.08 | the quote "of any kind" starts at 32.08 |
| "not" / "criticizing" (last line) | 37.88 / 38.12 | 37.70 / 38.20 | the last word ends at 38.82 |

Phrase-final words end at the voiced end, not the json `e` (for example "Google." ends at 1.46, not 1.88).

## 1. Story spine

| Act | Time (s) | What the story does |
|---|---|---|
| HOOK | 0.00-6.28 | She quit Google, and she says her contract bans her from criticizing it, for life. The expected thing (leaving a job sets you free) gets overtaken by the claim (not this time, she says). |
| STAKES | 6.28-15.07 | It's not one odd contract: Google staff told the BBC they're scared to speak out because of their contracts. **So why is she talking?** (the throughline question) |
| EXPLANATION | 15.07-28.31 | She worked on Google's AI and objected to where its military work was heading. In April that meant a deal letting the Pentagon use Google's AI for "any lawful government purpose" (with its oversight clause), and Google can't veto how it's used. |
| COUNTERWEIGHT | 28.31-33.16 | Google's side, at equal weight: it says it follows its AI principles (the answer to the deal) and bans retaliation "of any kind" (the answer to the fear). |
| TWIST | 33.16-36.54 | Back to her: she still says she can't criticize Google... but in her words, |
| PAYOFF | 36.54-39.08 | "talking about facts is not criticising". Everything the film just showed was facts, which is how she talks, as she sees it. The film is never narrated as "it was all facts". End close to the payoff and loop to frame 0. |

**Understanding shift (brief s9-10).** BEFORE: "Once you quit, you can say what you like about your old job." AFTER, in
one sentence a viewer can pass on: *A Google AI engineer who quit over its military work says her contract bans her from
criticizing Google for life, and she talks anyway because, in her words, "talking about facts is not criticising". The
facts are public: an April deal lets the Pentagon use Google's AI for "any lawful government purpose", and Google can't
veto how it's used (Google says it follows its AI principles and bans retaliation).* It matters because what the public
learns about military AI depends on insiders, and they told the BBC they're scared to speak.

## 2. Beat table

Temperature: 1 = cool and neutral, 5 = the hottest moment (heat means stakes, never volume; the delivery stays quiet).
"Voiced" = audible span from the waveform. Cut = the pause after the phrase (>= 0.15 s is a natural cut point).
Hit = the word that should land a visual hit; frame = round(s x 60). Hits may lead the sound by 1-2 frames, never trail it.

| # | Phrase (as spoken) | json s-e | Voiced | The ONE thing the viewer must get | Temp | Pause after | Hit @ s (frame) |
|---|---|---|---|---|---|---|---|
| 1 | She quit Google. | 0.12-1.88 | 0.24-1.46 | A real person left her job at Google: a work story. (0.79-0.97 is the "t" of "quit", not a pause.) | 2 plain news about someone real | **0.54 (1.46-2.00)** | Google @0.97 (f58) |
| 2 | And she says her contract | 1.88-3.08 | 2.00-3.13 | It's HER account, about her own job contract. "Says" is content: the claim is hers. | 3 leaning in | - | contract @2.53 (f152) |
| 3 | bans her from criticizing it… | 3.08-4.84 | 3.21-4.54 | The rule: she may not criticize Google. | 3 | **0.25 (4.54-4.79)**: the "…" beat. Hold, the sentence isn't done | bans @3.20 (f192) |
| 4 | for life. | 4.84-6.12 | 4.79-5.59 | Even after quitting, she says. The expected freedom is overtaken. | 4 cold, low, flat sting | **0.69 (5.59-6.28)**, the longest pause | life @4.98 (f299) |
| 5 | You'd think that's one odd contract. | 6.12-8.36 | 6.28-8.08 | The viewer's own guess: a one-off. | 2 dry shrug, false relief | **0.36 (8.08-8.44)** | odd @7.18 (f431) |
| 6 | But Google's staff told the BBC | 8.36-10.04 | 8.44-~10.07 | No: other people at Google say it too, to the BBC (reported, not our claim). | 3 serious, steady | - | staff @8.96 (f538) |
| 7 | they're scared to speak out, | 10.04-11.56 | ~10.10-11.36 | The fear is wider than one person. | 3 steady, never alarmed | 0.21 (11.36-11.57), a comma, minor | scared @10.36 (f622) |
| 8 | because of their contracts. | 11.56-13.24 | 11.57-12.81 | The same cause: their contracts (not "for life", which is only her account). | 3 | **0.35 (12.81-13.16)** | contracts @12.20 (f732) |
| 9 | So why is she talking? | 13.24-15.00 | 13.16-14.64 | The throughline question. The rest of the film answers it. | 3 curious lean-in | **0.43 (14.64-15.07)** | she @13.96 (f838) |
| 10 | She worked on Google's AI | 15.00-16.60 | 15.07-16.56 | Who she is: an insider at Google's AI lab, not an outside critic. | 2 warm, respectful | 0.11, not a cut | AI @16.12 (f967) |
| 11 | and told the BBC she objected | 16.60-18.44 | 16.67-~18.42 | She objected (her account to the BBC): a staffer who objected and then quit, not a neutral insider, not a hero. | 2 | - | objected @17.96 (f1078) |
| 12 | to where its military work | 18.44-19.64 | ~18.45-19.62 | What she objected to: Google's military work. | 3 weight, no drama | - | military @18.92 (f1135) |
| 13 | was heading. | 19.64-20.52 | ~19.62-20.10 | A direction over time, not one act. | 3 | **0.57 (20.10-20.67)**, breath at ~20.35. Act break | heading @19.80 (f1188) |
| 14 | In April, that meant | 20.52-21.72 | 20.67-21.24, 21.37- | A concrete date: here is what "heading" looked like. | 3 plain | 0.13 after "April," | April @20.76 (f1246) |
| 15 | a deal letting the Pentagon | 21.72-23.08 | ~21.70-22.98 | A deal between Google and the US Department of Defense. | 3 | - | deal @21.84 (f1310), Pentagon @22.46 (f1348) |
| 16 | use its AI for | 23.08-24.04 | ~23.00-23.92 | The Pentagon gets to use Google's AI. | 3 | 0.11: the quote opens | use @23.08 (f1385) |
| 17 | "any lawful government purpose". | 24.04-25.96 | 24.03-25.60 | The deal's exact words: very broad use, under its own oversight clause. | 4 fine print that surprised, level | **0.48 (25.60-26.08)** | any @24.03 (f1442) |
| 18 | Google can't veto how it's used. | 25.96-28.20 | 26.08-27.82 | Once it's handed over, Google has no say in how it's used. | 4 dry, plain, the hard fact | **0.49 (27.82-28.31)**: the side switch | veto ≈26.50 (f1590), json token 26.36 |
| 19 | But Google says it follows | 28.20-29.48 | 28.31-~29.48 | Google's side, in its own words, at the same weight. | 2 fair and even, the room cools | - | Google says @28.36 (f1702) |
| 20 | its AI principles, | 29.48-30.60 | ~29.50-30.62 | Google says its work goes through its AI principles (which promise human oversight). This answers the deal. | 2 | none audible: no hard cut | principles @30.04 (f1802) |
| 21 | and bans retaliation | 30.60-31.88 | ~30.64-31.99 | Google says staff can raise concerns without punishment. This answers the fear in #7. | 2 | 0.09, not a cut | bans @30.84 (f1850) |
| 22 | "of any kind". | 31.88-33.08 | 32.08-32.70 | Google's exact words. | 2 | **0.46 (32.70-33.16)** | of any kind @32.08 (f1925) |
| 23 | She says she can't criticize Google. | 33.08-35.32 | 33.16-34.99 | Back to her. Whoever you believe, her claim stands, and it's still her account. | 3 quieter, closer | **0.46 (34.99-35.45)** | can't @33.78 (f2027) |
| 24 | But in her words, | 35.32-36.44 | 35.45-36.18 | What comes next is her exact quote. | 3 held breath | **0.36 (36.18-36.54)** | her words @35.72 (f2143) |
| 25 | "talking about facts | 36.44-37.64 | 36.54-~37.48 | Her distinction: stating facts isn't criticizing. The reframe starts. | 4 warm lean on FACTS | - | facts @37.18 (f2231) |
| 26 | is not criticising." | 37.64-39.08 | ~37.50-38.82 | The payoff: what we just saw was facts. That's how she talks, as she sees it. | 3 resolves, let it fall | end at 38.82, then 0.26 of tail, then the loop | not @37.70 (f2262) |

**Natural cut points** (all pauses >= 0.15 s; 13 of them, 5.65 s in all, about one every 3 s, so something new every 3-5 s
holds): 1.46-2.00 · 4.54-4.79 (a hold, mid-sentence) · 5.59-6.28 · 8.08-8.44 · 11.36-11.57 (minor) · 12.81-13.16 ·
14.64-15.07 · 20.10-20.67 · 25.60-26.08 · 27.82-28.31 · 32.70-33.16 · 34.99-35.45 · 36.18-36.54, plus the tail
38.82-39.08. There is no pause >= 0.15 s inside 15.07-20.10 (one 5 s sentence), 21.37-23.92 or 28.31-32.70 (Google's line runs
straight through, so it can't be cut short at a pause either). Big act edges: 6.28, 15.07, 20.67, 28.31, 33.16, 36.54.
Sentence ends are at 1.46, 5.59, 8.08, 12.81, 14.64, 20.10, 25.60, 27.82, 32.70, 34.99 and 38.82.

**Time shares.** Her material (hook 0-6.28, intro 15.07-20.67, twist and payoff 33.16-39.08) runs about 18 s. The
staff beat (6.28-13.16) runs 6.9 s, the deal (20.67-28.31) 7.6 s and Google's side (28.31-33.16) 4.85 s. Google's beat is the shortest, so it must never be shortened further: no early
cut-away and no overlapping start of the next idea before 32.70.

## 3. Facts usable on screen

Statuses as in FL. "Quote" = exact, in quote marks, attributed. "Para" = our paraphrase, never in quote marks. While any
BBC quote or BBC-reported claim is on screen, show "Source: BBC News, 21 Oct 2026".

| # | Fact (exact words where quoted) | Status | Source | How it may be shown |
|---|---|---|---|---|
| F1 | Sofia Liguori: London-based research engineer at Google DeepMind (Google's AI lab), 3 years; resigned the week of 21 Oct 2026; spoke "in a personal capacity" | VERIFIED | BBC; The Intercept; Il Sole 24 Ore (FL 1.4) | Name caption, para OK: "Sofia Liguori · research engineer, Google DeepMind · 3 years · resigned Oct 2026". Best at #10-13. |
| F2 | "In principle I'm not allowed to criticise Google for the duration of my life" | REPORTED (her account; the contract is unseen) | BBC (FL 5.2) | A quote with "Sofia Liguori to the BBC" (keep "In principle"), or para "she says her contract bans her from criticizing Google, for life", with "for life" never in quote marks. |
| F3 | She spoke "despite her contract restricting her from doing so" | VERIFIED (the BBC's own wording) | BBC (FL 5.3) | Quote, credited "BBC News". Fits #9. |
| F4 | "Employees at Google have told the BBC that staff are scared to speak out about AI safety and its uses in warfare because their employment contracts prohibit them from publicly criticising the company." | VERIFIED as BBC reporting | BBC (FL 5.1) | Prefer the para "Google staff told the BBC they're scared to speak out, because of their contracts". If quoted, quote the whole sentence. |
| F5 | One current staffer declined to be named "for fear of retaliation" | VERIFIED | BBC (FL 1.13) | On screen only, "told the BBC". Fits #6-8. |
| F6 | The BBC spoke to "several tech workers" who had resigned from Google DeepMind or were leaving | VERIFIED (wording) | BBC (FL 1.2) | "several", never a number. |
| F7 | She resigned "over Google's increasing work with the US and Israeli militaries" | VERIFIED (BBC) | BBC (FL 1.7) | Para "Google's growing military work". Israel stays off screen by default (reach; see rule V17). |
| F8 | Dec 2025: Gemini for Government was the first model on the Pentagon's GenAI.mil, unclassified (about 3 million staff) | VERIFIED | Fox Business; Decrypt (FL 2.12) | Optional, the only sourced "heading" step before April: unclassified, then classified. Never as a chart. |
| F9 | April 2026 (27/28 Apr): an amendment to Google's existing Pentagon contract that brings its AI (Gemini) onto classified networks | VERIFIED | The Information via Japan Times; 9to5Google (FL 2.1) | "April 2026: Google-Pentagon deal for classified work". Month only, never "secret", never "hours after". |
| F10 | "any lawful government purpose" | VERIFIED (exact) | BBC; 9to5Google; Tom's Hardware (FL 2.2) | Quote. ALWAYS together with F11. |
| F11 | "should not be used for domestic mass surveillance or autonomous weapons (including target selection) without appropriate human oversight and control" | VERIFIED (exact) | BBC; 9to5Google (FL 2.3) | In full, as a quote, readable, from 24.03 for as long as F10 is up. Never cut its tail. 24 words: give it at least the 3.8 s to 27.82. |
| F12 | The deal does "not confer any right to control or veto lawful Government operational decision-making" | VERIFIED | Japan Times; Android Authority (FL 2.4) | A quote (keep "lawful"), or the para "Google gets no veto over how the Pentagon uses it". Credit "reported Apr 2026". Fits #18. |
| F13 | Google to the BBC: "We work with public sector organisations worldwide and follow a consistent process for reviewing and entering these contracts, including compliance with our acceptable use policies and AI principles." | VERIFIED | BBC (FL 6.1) | "Google says" + "Statement to the BBC, 21 Oct 2026". The spoken part ("AI principles") large, the rest readable. |
| F14 | Google to the BBC: "We also have dedicated channels for employees to safely raise any concerns - ranging from business ethics to misconduct - and have strict workplace policies in place to prevent retaliation of any kind." | VERIFIED | BBC (FL 6.2) | "of any kind" as a quote; "bans retaliation" is para only. Same page and weight as F13. |
| F15 | Google on the deal: "We are proud to be part of a broad consortium of leading AI labs and technology and cloud companies providing AI services and infrastructure in support of national security." | VERIFIED | 9to5Google; ClearanceJobs, 28 Apr 2026 (FL 6.3) | Optional, credited, inside Google's side (#19-22) or the deal beat. |
| F16 | Google's AI Principles: implement AI with "human oversight"; align with "international law and human rights" | VERIFIED | BBC; Google (FL 6.4) | Exact fragments credited "Google's AI Principles". They make "its AI principles" (#20) concrete. |
| F17 | Not only Google: OpenAI, Amazon, Microsoft, SpaceX, Oracle, Nvidia and the start-up Reflection signed similar contracts | VERIFIED | BBC; Nextgov (FL 4.1) | Optional fairness context in the deal beat: small text, no logos. Google isn't singled out. |
| F18 | "because I believe it's important for these things to be known and I also think that talking about facts is not criticising" | VERIFIED (exact) | BBC (FL 5.4) | The spoken span as a quote in British spelling, one unbroken span (the full sentence is allowed), + Source line. |
| F19 | The article: "Google staff resign in backlash over its AI contracts with military", Christopher Giles, BBC Eye investigations (additional reporting Rosa Rahimi), 21 Oct 2026 | VERIFIED | BBC (FL 1.1) | On screen: "Source: BBC News, 21 Oct 2026", text only. The headline, byline and URL go in the post caption. |
| F20 | "The Pentagon" = the US Department of Defense | VERIFIED | guardrails s1 | "the Pentagon (US Department of Defense)". Never "Department of War". |

**Verified, but NOT on screen:**
- Her opinion quotes: "ashamed" (1.5), "I don't agree with this direction..." (1.6), "watched... can't speak" (5.5). Any one
  lets a viewer say "but that IS criticism" and blunts the payoff.
- Andreas Kirsch (1.9-1.12): a second person, and his resignation is BBC-only.
- The ~600-staff letter and "within a day" (2.7, 2.8): not narrated, and they read as a villain beat.
- Safety filters (2.5), and experts on whether "should not" binds (2.6).
- Maven, targets, Shoker and Shanahan (7.x): general military AI, not Google, and they invite war imagery.
- Nimbus, Israel and NAZA (3.6, N13); the 2018 pledge and its 2025 deletion (3.4, 3.5).
- Any legal point (5.8, N10).
- Her sick-out and protest (1.8): context only, so she is shown as someone who objected and then quit.

## 4. Fairness rules for visuals (strict)

From CORE_LINE s2, guardrails s1-5, FL "Never say" and the brief's s19 (factual, fair, nonpartisan, nonjudgmental, no
manufactured villains). A frame that breaks one of these doesn't ship.

**NEVER show or imply:**
- V1. **War imagery:** weapons, drones, missiles, explosions, soldiers, tanks, battlefields, strike maps, crosshairs or
  targets, radar over cities, blood, skulls, real war footage or photos. "Military" and "classified" stay
  institutional: buildings, doors, paper, clearance stamps.
- V2. **Google near violence:** no Google lettering, colours or products near weapons, targets, strikes, Maven, Iran,
  Israel or Gaza. Never imply Google's AI picks targets or was used in a strike; that is not reported (FL 7.2, N3).
- V3. **Villains:**
  - no sinister Google HQ, shadowy executives or Pentagon-as-monster;
  - no Pichai, Hegseth or Trump;
  - no looming figures over her, no ominous stings, no "EXPOSED", glitch or siren graphics;
  - no hero lighting on her and villain lighting on Google.
- V4. **A likeness of Sofia Liguori:**
  - never traced from or matched to BBC or Intercept photos (face, hair, clothes), and no realistic face; she is a
    generic figure with a name caption;
  - anonymous staff are faceless and unnamed;
  - never a synthetic voice of her: the narrator reads every quote.
- V5. **"For life" as fact:**
  - "for life" never goes in quote marks;
  - the lifetime ban never appears as text without "she says" in the same frame;
  - no stamp or label that presents it as an established contract term.
- V6. **Invented documents:**
  - any drawn contract is illustrative, with unreadable lines and no printed clause;
  - nothing goes in quote marks that the person didn't say: no paraphrase in quotes, no two quotes spliced into one.
- V7. **Gag imagery:** no tape over mouths, padlocked lips, zips, muzzles, chains, handcuffs or cages ("silenced" and
  "gagged" are overclaims, since others did speak publicly: FL 5.9, N2).
- V8. **A legal verdict:** no gavel, ILLEGAL, VOID or UNENFORCEABLE stamps, courtrooms, or scales of justice (N10).
- V9. **The purpose line alone:** "any lawful government purpose" is never on screen without the full oversight clause
  (F11) readable beside it, and "without appropriate human oversight and control" is never cut.
- V10. **"Anything goes":** no blank cheques, "unlimited", infinity signs or open floodgates for the deal. Never
  "secret": the work is classified, and the terms were reported (N4, N6). Never show the Pentagon misusing it; "can't
  veto" means Google has no say over lawful operational decisions, nothing more.
- V11. **A count or a crowd:** no rows of empty desks, mass walkouts, numbers or counters, and no "exodus". "Google's
  staff" means a few unnamed people, never all of Google (N1, N7).
- V12. **Retaliation by Google:** no firing, security escorts, cameras or watching eyes on her or on staff. No sign that
  Google confirmed or denied her clause: Google's statement never "answers" her contract.
- V13. **Her inside the military work:** the deal is never on her screen or desk as if she worked on it or leaked it.
  Deal facts carry their own public source tags. Keep the timeline true: the deal was in April 2026, she resigned in
  October 2026, so never show her quitting on the day of the deal.
- V14. **Irony on Google's beat (28.31-33.16):** no eye-rolls, crossed fingers, Pinocchio noses, smirks or sarcastic
  sound effects, and no cut from "of any kind" to an image that contradicts it.
- V15. **Logos and seals:** no BBC logo, footage, photos or BBC-styled graphics. No Google logo: hand-letter "Google",
  never defaced. No Pentagon or DoD seal, no military insignia, and no flags used as partisan symbols.
- V16. **Invented data:** no charts, growth curves or numbers for "where its military work was heading". No figure
  exists; show direction, not quantity. F8 is the only sourced step.
- V17. **Reach and partisanship:**
  - no Hegseth, Trump, elections, or Israel and Gaza imagery;
  - "kill", "bomb", "genocide" and "Gaza" never appear in on-screen text;
  - never "Department of War" and never "BBC exclusive".

**ALWAYS show:**
- A1. "SHE SAYS" / "she says" in the frame whenever her contract claim appears as text (frame 0, the cover, #23).
  Frame 0 states the payoff in words. CORE_LINE s1's approved words are **SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.**,
  with no quote marks, plus a small "Source: BBC News, 21 Oct 2026".
- A2. "Source: BBC News, 21 Oct 2026" whenever a BBC quote or BBC-reported claim is on screen. That covers the hook
  (0.00-6.28), the staff beat (8.44-12.81), #9 if F3 is used, and her quote (35.45 to the end). Google's words carry
  "Statement to the BBC, 21 Oct 2026".
- A3. Deal facts carry their own credit, e.g. "Reported Apr 2026 · BBC; The Information via Japan Times / 9to5Google".
- A4. The full oversight clause whenever F10 shows (V9).
- A5. Google's side at equal weight:
  - the same size, light and colour temperature as her material;
  - the whole 28.31-33.16 beat, uninterrupted;
  - its own words under "Google says", with quote marks only on exact words.
- A6. Her name caption (F1) when she is introduced (#10-13).
- A7. Quotes are exact, marked as quotes and read by the narrator. British spelling inside her quotes ("criticise",
  "criticising"), US spelling everywhere else.
- A8. Three kinds of statement, told apart at a glance and readable with the sound off:
  - an account carries "she says" or "told the BBC";
  - a document carries its source;
  - Google's words carry "Google says".
- A9. Credits: per-beat source lines in the film, and full sources (headline, byline, date, URL) in the post caption and
  the pinned comment. Nothing follows the payoff line in the film: it loops.
- A10. The platform AI label is ON for the synthetic narration.

## 5. Open questions a treatment must answer visually

1. **Who are "Google's staff" (#6-8)?** In the BBC's words, "employees at Google" told it that staff are scared. It
   spoke to several tech workers, two of them current DeepMind staff who stayed anonymous. How does the film show some
   unnamed people at Google, not all of Google and not a crowd? And how does it show "told the BBC" with no BBC logo
   or footage?
2. **Her contract, unseen (#2-4).** How is "her contract bans her... for life" made physical as HER claim (V5, V6)?
   And how does the hook overtake the expected thing (quitting sets you free) by about 2 s and hit "life" at 4.98 s?
3. **Who is she, without a likeness (#10-13)?** A London research engineer, 3 years at Google's AI lab, who objected
   and then quit. She is specific and human, but not a hero, not a neutral insider, and nobody's photo.
4. **What is "its AI", and what does "use" mean (#16)?** Google's AI models (Gemini), brought onto classified networks.
   The only reported military use so far is unclassified office work (F8). How does "use" read concretely without
   inventing uses or going near targeting (V1, V2)?
5. **What was the deal (#14-18)?** An April 2026 amendment between Google and the Pentagon. How do we show it with the
   following constraints?
   - "classified" without war or "secret", and the Pentagon without a seal;
   - its exact words with the 24-word clause readable inside 24.03-27.82 (or held to 28.31);
   - optionally, that seven other firms signed similar deals (F17).
6. **What does "can't veto" mean physically (#18)?** Who decides once it's handed over (the Pentagon decides lawful
   operational use, and Google has no right to control it). Show the mechanism, not a judgement (V10).
7. **"Where its military work was heading" (#12-13)?** It's a direction with no numbers (V16). F8 to F9 (unclassified
   in Dec 2025, classified in Apr 2026) is the only sourced progression. The link "that meant" ties the deal to her
   objection, but it is not her stated reason for quitting.
8. **Google's side (#19-22).** How does one equal-weight beat answer both earlier beats, with principles against the
   deal and "retaliation" against the fear, with no irony (V14)? And how does the story still turn cleanly back to her
   at 33.16?
9. **Why can she talk (#23-26)?** Her answer is the payoff. At 36.54-37.48 the viewer must FEEL that the film's facts
   were "the facts", without:
   - (a) narrating it;
   - (b) implying she is legally safe;
   - (c) implying she told the BBC only facts, or leaked anything;
   - (d) folding Google's statement into "her facts".

   After that, how do 38.82-39.08 close the loop to frame 0?
10. **Sound off.** Every beat must read literally without audio, and the three kinds of statement (A8) must be
    distinguishable. What carries "she says" vs "Google says" vs "the deal says" in the picture itself?

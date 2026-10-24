# Strawman critique: VOICE, HUMOUR & ACCURACY (PHP2Shell VO, current 226-word take)

Lens: does it sound like the brief's warm, dry-witted American friend, or like news copy? Where can ONE good,
situation-born line go? What does ElevenLabs need (sentence length, punctuation, numbers, contractions)? Then accuracy
against `fact_sheet.md`: compressions that mislead, claims stronger than the evidence, neutrality.
Written 2026-10-24 against `docs/CREATIVE_BRIEF.md`, `fact_sheet.md`, `audience_and_sowhat.md`, `original_annotated.md`
and the measured v2 take in `docs/timing.md` (77.56 s, 230 tokens, 18 sentences). Hook/flow and clarity/so-what have
their own critiques (`critique_hook-flow.md`, `critique_clarity-sowhat.md`). I agree with both on structure and don't
repeat their arguments. This file adds the voice, TTS and accuracy detail.
"Register" labels and humour calls are **editorial judgment**. Facts are checked in section 10.

---

## 0. Verdict in five lines

1. **About two-thirds of it reads as wire copy or a classroom, not the friend in the brief.** 7 of 18 sentences use
   news syntax: appositive tags ("PHP, the programming language behind…", "Cloudflare, which protects…"), attribution
   verbs ("says it saw"), nominal phrases ("the details of the bug"). 5 more are teacher scaffolding ("two steps",
   "First… Then…", "right?", "step two, the slow one"). Only a handful of phrases sound like a person talking: "Nobody
   hacked them", "quietly told", "the safest thing is to switch it off", "That's what those government sites did."
2. **The one joke ("And for fourteen years… nobody did.") is broken twice.** It's built on a false premise: PHP's own
   team spotted the weak spot in 2024. And it isn't structurally a joke: the setup ("you'd think finding is the hard
   part") primes a reversal, and the punchline *confirms* the setup instead.
3. **There's a much better line sitting in the situation, and nobody's using it.** Governments, the FBI and Europe's
   cyber agencies all gave the oldest advice in tech support: *turn it off.* Put it in the payoff (section 4).
4. **For ElevenLabs, every full stop costs about half a second.** In the v2 take, the 17 sentence breaks add up to
   8.5 s of silence, averaging 502 ms. Long sentences (29 and 25 words) flatten into a newsreader glide, and short ones
   stack into dead air ("right?" sits alone between 350 ms and 565 ms of silence). Rule: 13 to 16 sentences, none over
   about 20 words, and no more than 2 ellipses.
5. **Seven claims are stronger or weaker than the evidence.** "Four countries" (it was at least eight). "They were
   fixing" (most went dark *before* a fix existed). "Nobody did [find it] for 14 years" (it was spotted in 2024).
   "The details… leaked… hours before" (PHP says no technical details leaked, and it was about a day). "22 million
   copies of PHP" (these are exposed instances). "One in three" (about half). "Switch off or hope the hosting company"
   (leaves out upgrading).

---

## 1. Register scan, sentence by sentence

Times come from `timing.md` (v2 take). "Words" counts whitespace tokens.

| # | Starts | Words | Sentence (short) | Register | Note |
|---|---|---|---|---|---|
| S1 | 0.13 | 9 | "Government websites in four countries just switched themselves off." | **News** (wire lede) | subject + place + count + verb |
| S2 | 3.70 | 3 | "Nobody hacked them." | **Friend** | best line in the first 30 s |
| S3 | 4.95 | 20 | "They were fixing a security bug in PHP, the programming language behind WordPress…" | **News** | appositive tag |
| S4 | 11.70 | 8 | "Fixing a bug like that takes two steps." | **Teacher** | the brief bans "school-presentation narration" |
| S5 | 14.06 | 4 | "First, you find it." | **Teacher** | list cadence |
| S6 | 15.36 | 5 | "Then, you fix it everywhere." | **Teacher** | list cadence |
| S7 | 17.38 | 9 | "You'd think finding it is the hard part, right?" | **Teacher / podcast** | thinking aloud (Mistake 6) |
| S8 | 20.54 | 6 | "And for 14 years, nobody did." | Friend (attempted) | the named joke: false and inverted |
| S9 | 23.91 | 29 | "Then, in August, two security teams using AI tools found it and quietly told…" | **News** (chronology) | "quietly told" is the one human touch |
| S10 | 33.08 | 14 | "Except, the details of the bug leaked online hours before the fix came out." | **News** | nominal phrase, TTS breaks after "online" |
| S11 | 38.85 | 25 | "Cloudflare, which protects a big chunk of the web, says it saw…" | **News** | appositive, attribution, stacked numbers |
| S12 | 47.64 | 7 | "Nobody knows yet how many got in." | **News-anchor drop** | right content, wrong tone |
| S13 | 49.82 | 8 | "So now comes step two, the slow one." | **Teacher** | signpost to a frame from 36 s earlier |
| S14 | 52.66 | 24 | "Someone has to install that fix on every site, and there are about 22 million copies…" | Mixed | "Someone", "out there", "could be hit": vague |
| S15 | 60.08 | 18 | "If a site can't update fast enough, the safest thing is to switch it off until it can." | **Friend** | plain, good. Unattributed opinion, though |
| S16 | 65.07 | 6 | "That's what those government sites did." | **Friend** | good loop; causal claim is off |
| S17 | 67.00 | 22 | "And one in three sites on PHP runs a version so old that the people who make PHP…" | **Report** | stat-sentence; "sites on PHP" clumsy |
| S18 | 73.52 | 13 | "For those, it's switch off or hope the hosting company sorts it out." | Friend, but **British** and a shrug | "sorts it out" isn't natural American |

**Tally:** News or report 7, Teacher 5, Friend or mixed 6 (S2, S8, S14, S15, S16, S18). Four of those six (S8, S14,
S16, S18) carry an accuracy or idiom problem.

### Tics that flatten the voice
- **"Nobody" three times** (S2, S8, S12). Every reuse dulls the strongest one (S2). Keep one.
- **"the people who make PHP" twice** (S9, S17). It's warm the first time and padding the second. "PHP's team" works on
  the second mention, or just "PHP".
- **"fix" seven times, in four senses:** installing (S3 "were fixing"), making a patch (S9), rolling it out (S6), and
  supporting (S17 "don't fix it anymore"). For a non-coder this blurs the story's one distinction. Lock the words:
  **"the fix" = the patch PHP made; "install" = what each site has to do; "support" = what PHP stops doing for old
  versions.**
- **Contractions aren't the problem.** There are 5 in 230 words (you'd, can't, that's, don't, it's), which is fine.
  The stiffness is in the *syntax*: appositive tags, "says it saw", "the details of the bug", "a version so old that…".
  Swap those for subject-verb sentences a friend would say.

---

## 2. TTS mechanics (ElevenLabs): what the measured take tells us

From `timing.md`, v2 take:
- **230 tokens in 77.56 s = 178 wpm overall**, just above the brief's 155–175. The words themselves run fast (230 in
  64.4 s of voiced time). The extra length is **silence: 12.0 s of pauses**, 8.5 s of it at the 17 sentence breaks
  (average 502 ms, maximum 770 ms after "nobody did.").
- **Rule of thumb for this voice:** runtime ≈ words ÷ 3.6 per second + 0.5 s per full stop + about 0.2 s per comma.
  So 165 words in 14 sentences ≈ 46 + 6.5 + 2 ≈ **55 s**. The current 18 sentences cost 8.5 s before a single word is
  said.
- **Unplanned breath breaks show where the sentences are too long:** 275 ms after "PHP" and 170 ms after "it" inside
  S9 (29 words), and **365 ms after "online"** in S10. The break after "online" detaches "hours before the fix came
  out", so the key fact sounds like an afterthought. Put the key fact at the end, right before the period.
- **Rhetorical questions:** ElevenLabs lifts pitch on "?", and it isolated "right?" between a 350 ms and a 565 ms
  pause. That's 2.6 s spent on a classroom question. Keep at most one question, and only one the next sentence answers
  straight away ("How many got in? Nobody knows yet.").
- **Ellipses and CAPS:** the cued original has 5 "…" and CAPS on number phrases ("TENS OF THOUSANDS", "MILLIONS",
  "twenty-two MILLION"). The v2 take's pauses grew by 5.9 s over v1, and the ellipses plus "slow" cues are the
  likely cause **[judgment]**. Use **at most 2 ellipses** in the whole script. Put CAPS on **one stressed word per
  beat at most** (about 3–4 in the whole script), never on whole number phrases: capitalised numbers make the voice
  "sell" them like an ad, which is the news-anchor delivery the brief bans.
- **Sentence length:** current mean 12.8 words, standard deviation 7.9 (range 3–29). The spread is the problem, not
  the mean. Aim for most sentences at 8–18 words, use 2–4 short punches (2–5 words) only where a beat is intended, and
  cap at about 20.
- **Em dashes and colons** give short pauses (about 150–250 ms) without a full-stop drop. Use them to chain cause and
  effect ("Here's the catch: there's no…") instead of starting new sentences.
- **Pronunciation:** "PHP" (letters) and "AI" are fine. Never voice "CVE", version numbers ("eight point two"),
  "W3Techs", "DigiD" or "Unit 42". Keep them on screen.

### Number formats for speech

| In the current script | Problem | Write it as (cued and ElevenLabs file) |
|---|---|---|
| "7 out of 10" | fine, but one syllable longer than the standard | "**seven in ten**" + on-screen footnote "of sites whose server language is known · W3Techs" |
| "14 years" | the claim is the problem (S8) | if a date is used: "since **twenty twelve**" (written out, or TTS may say "two thousand twelve") |
| "45 minutes" | no anchor (45 minutes after what?) | "**forty-five minutes** after it went public" |
| "tens of thousands… millions by evening" | fine as spoken; "by evening" is loose | "tens of thousands… **by that night, millions**" |
| "22 million copies" | wrong unit; collides with "millions" of attempts 8 s earlier | cut, or "**more than twenty-two million exposed systems, by one count**" |
| "one in three" | understated | "**about half**" (on screen: "estimate · W3Techs") |
| (if used) 0.7% patched | "zero point seven percent" is unspeakable | "**fewer than one in a hundred**" |
| (if used) Cloudflare 23.9% | | "**about one in five** websites" |
| dates (Oct 21) | | "**Wednesday**" or "**this week**" (sites were back within hours to a day, so on publish day "just" can go stale) |

---

## 3. Line by line

Format: the quote, then **Voice**, **Accuracy** and **Fix**.

### S1. "Government websites in four countries just switched themselves off."
- **Voice:** a wire-service lede. "Switched themselves off" is reflexive, so it sounds like a malfunction (as if the
  sites did it). The surprise is *agency*: governments did it to their own sites, deliberately.
- **Accuracy:** **wrong (undercount).** It was at least eight: NL, FI, FR, BE, DE, CZ, AT and the UK (councils and
  the Met Police). Japan rests on the Reuters factbox alone. My search of the Reuters factbox lists the UK
  and Australia only as *advisories* (see section 10), so if "eight" goes on screen, re-check the list before lock.
  "Just" goes stale after a few days, and most sites were back within hours.
- **Fix:** "Governments across Europe just switched off their own websites. **On purpose.**" (11 words. "On purpose"
  opens the loop and does S2's job too.) Safe with no country list.

### S2. "Nobody hacked them."
- **Voice:** the best line in the first 30 s. Keep the shape.
- **Accuracy:** accurate-with-caveat. No affected site reports a breach, and all describe the shutdown as a
  precaution. But it's a universal claim about every site, and the fact sheet cites Unit 42 describing one unnamed
  European government body that *was* breached (I couldn't re-confirm that; section 10).
- **Fix:** "**Not a hack.**" It describes *why* they went dark (verified for every case) without vouching for every
  server. It's just as punchy, and it frees "nobody" for later. If S1 ends on "On purpose.", this can merge into the
  next line: "Not a hack, a flaw in PHP."

### S3. "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites."
- **Voice:** the most news-anchor sentence in the script: "X, the Y behind Z". "Security bug" is bland and says
  nothing about stakes. "Behind WordPress" spends the scale beat on a name many viewers don't know, as the user
  suspected.
- **Accuracy:** "They were **fixing**" is **misleading**: many went dark on the morning of Oct 21, *before* the fix
  was released at about 14:00 UTC. They were protecting themselves, not installing. It's also **two** related bugs.
  "7 out of 10 websites" needs the denominator on screen.
- **Fix (the approved bait, with stakes added):**
  "Not a hack, a flaw in PHP. / The language everyone loves. / It runs about seven in ten websites, and this flaw lets
  a stranger take one over, no password needed."
  Delivery: "The language everyone loves." stands alone as its own sentence and is played **flat**. ElevenLabs will
  lift "loves" if the cue says "teasing" or "playful", so cue it "deadpan, flat, don't smile". The irony lands through
  the plain fact after it, not through the read. Don't CAPS "loves".

### S4–S6. "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere."
- **Voice:** textbook school-presentation narration (brief §14–17 bans it). The take spends 5.2 s and 3 sentence
  breaks on a list.
- **Accuracy:** framing only, but it **erases the real middle step**: PHP *knew* of the weak spot in 2024 and couldn't
  agree on a fix (the final fix touched 390 files). "Fix it everywhere" also blurs "make the fix" with "install it".
- **Fix: CUT.** The find/install distinction comes back once, at the twist, as a concrete image: "there's no 'update
  the internet' button."

### S7. "You'd think finding it is the hard part, right?"
- **Voice:** thinking aloud plus a rhetorical "right?" stranded in 0.9 s of silence. It reads as a podcast tic, not
  the brief's "lively but unhurried rhythm".
- **Fix: CUT.**

### S8. "And for 14 years, nobody did." (the named joke)
- **Voice:** deadpan needs a contradiction. The setup "you'd think finding is the hard part" invites "…but actually
  it's the easy part", and the punchline says "yes, it was hard", so the laugh has nothing to turn on. The 770 ms pause
  after it (the longest in the take) is the sound of a joke not landing.
- **Accuracy:** **misleading.** The affected code dates to PHP 5.4 (March 2012), so "about 14 years old" is fine. But
  "nobody found it" is false: the out-of-memory weakness was flagged in 2020 and noticed by a PHP core developer during
  the 2024 audit. It wasn't fixed because no one could show it was exploitable and every fix had a cost. The PHP
  Foundation itself calls this a "structural failure".
- **Fix: CUT the joke.** If the 2024 story earns time (it's a strong "wait, seriously?"), play it straight and
  neutral, with no wink: "PHP's own team actually noticed the weak spot two years ago. Nobody could prove it was
  dangerous, so it waited." Never pair this with the "everyone loves" irony. Two digs at PHP in 20 s starts to look
  like a manufactured villain (brief §18–19).

### S9. "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew."
- **Voice:** a 29-word "and then" chronology, the longest sentence (8.6 s), with two unplanned breath breaks.
  "Quietly told" is the warmest phrase in the script. Keep it.
- **Accuracy:** "AI tools **found** it" overstates a little: human researchers led and AI models assisted (OpenAI:
  the model "helped researchers"). Press also credits three organisations (OpenAI, Wiz, Calif). "Before anyone else
  knew" is the *intent* of coordinated disclosure, so that's fine.
- **Fix (18 words):** "Researchers found it in August, with AI's help, and quietly warned PHP so a fix would be ready
  first." Don't name OpenAI or Google in narration: it's promotional, adds no understanding, and pulls in brand
  visuals.

### S10. "Except, the details of the bug leaked online hours before the fix came out."
- **Voice:** "the details of the bug" is a newsroom noun phrase. The comma after "Except" plus the 560 ms before it
  makes 0.8 s of dead air before the turn, and the 365 ms break after "online" buries "hours before".
- **Accuracy:** **misleading on two counts.** (1) *What* leaked: the CVE IDs (with a wrong 10.0 score and a wrong
  date) and a video of an exploit working. PHP says **no technical details** leaked. (2) *When*: Oct 20 afternoon/
  evening against a fix at about 14:00 UTC Oct 21, so **about a day**, not "hours". The more important verified fact
  is missing: **attackers were trying it before the fix existed** (Cloudflare: thousands of attempts in the 10 hours
  before the announcement; Amazon logged one attempt on Oct 17).
- **Fix (17 words):** "Except word leaked a day early, and attackers were trying it before the fix was even out."
  Neutrality: don't name or blame the researcher firm whose video slipped out. That's a manufactured villain for a
  60-second video.

### S11. "Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening."
- **Voice:** appositive tag plus attribution plus three stacked numbers in 25 words (8.2 s). "Which protects a big
  chunk of the web" reads like the company's own boilerplate.
- **Accuracy:** the numbers come from **CEO Matthew Prince's X post** (I confirmed the post text, section 10):
  "thousands… in the 10 hours before it was publicly announced… tens of thousands in the 45 minutes post announcement,
  hundreds of thousands within 2 hours, and millions now", posted about 9:25 pm ET Oct 21. Two problems: "in 45
  minutes" has no anchor (it's *after the announcement*, not after the leak), and these are **attempts**, mostly
  automated and blocked, not break-ins. "Break-in attempts" next to "how many got in" pushes the listener toward
  "lots got in". It's also a vendor's own unaudited count, from the company that sells the protection, so attribute
  it to him.
- **Fix:** "Once it went public, Cloudflare's CEO says they saw tens of thousands of tries in forty-five minutes. By
  that night, millions." "Tries" fits the lock metaphor (someone rattling the flawed lock). If you want a recognition
  anchor instead of the boilerplate, see the backup line in section 4 ("the 'Verify you are human' people").

### S12. "Nobody knows yet how many got in."
- **Voice:** right content, wrong delivery. The cue ("slower, level") plus the period produce the news-anchor
  ominous drop.
- **Accuracy:** fair. Officials report no confirmed break-ins, and there's one vendor-reported case (unconfirmed in my
  pass). It's still MOVING, so re-check on publish day.
- **Fix:** "How many got in? Nobody knows yet." This is the one allowed question, answered at once. Cue it as an
  honest friend's shrug, not a threat. (It also leaves "nobody" with a single use if S2 becomes "Not a hack.")

### S13. "So now comes step two, the slow one."
- **Voice:** teacher signpost, calling back to a frame from 36 s earlier. It's also a fake "so", because nothing
  above causes it.
- **Fix: CUT.**

### S14. "Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit."
- **Voice:** "Someone" (who?), "out there" (filler), "could be hit" (a vague passive). It mixes units (sites, then
  copies) in one sentence.
- **Accuracy:** **misleading.** Palo Alto counts "over 22.6 million exposed instances **potentially** vulnerable":
  internet-facing services, not copies or websites, and not confirmed vulnerable. Other scanners count 2M to 41M.
  "Every site" is also slightly off: a WordPress owner on shared hosting can't install PHP themselves. Whoever runs
  the *server* does.
- **Fix (two sentences, 19 words):** "Here's the catch: there's no 'update the internet' button. Whoever runs each
  server has to install the fix." Cut the 22-million figure from narration. If the scale must be shown, let the camera
  pull back across the city with a counter that's attributed on screen ("22.6M exposed instances · Palo Alto
  Networks").

### S15. "If a site can't update fast enough, the safest thing is to switch it off until it can."
- **Voice:** good: plain, conversational, the friend talking.
- **Accuracy:** true, but it's presented as the narrator's opinion when it was **official advice** (FBI and NSA, the
  UK's NCSC, Germany's BSI, CERT-EU, Japan's PM). Attribution makes it stronger *and* neutral.
- **Fix:** this is where the one good line goes (section 4): "So the official Plan B, FBI included, was the oldest
  line in tech support: turn it off."

### S16. "That's what those government sites did."
- **Voice:** good, a satisfying callback.
- **Accuracy:** **causal compression.** After S15 it implies they "couldn't update fast enough". In fact many went dark
  *before there was anything to install*. That nuance is the better line. Also "sites did": sites don't decide,
  governments do.
- **Fix:** "That's what those governments did… many before there was even a fix to install." Watch the trap: if the
  line before it says only "the FBI's advice", it implies European governments followed the FBI. They acted on their
  own agencies' advice (ANSSI, NÚKIB, NCSC-NL), mostly *before* the FBI's evening post. "The official Plan B, FBI
  included" avoids that.

### S17. "And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore."
- **Voice:** report syntax ("a version so old that…"), "sites on PHP" is clumsy, and it repeats "the people who make
  PHP". It also arrives *after* the loop closed (flow critique).
- **Accuracy:** **understated, plus one wrong verb.** PHP 7/5/4 = 34.7% of PHP sites (W3Techs, Oct 23). Add the
  also-unsupported 8.0 and 8.1 and the estimate is **about half**. Other counts run from about 46% to about
  two-thirds (TechnologyChecker, CybelAngel, Censys, Bitsight). "Don't fix it
  anymore" is contradicted *this time*: PHP pushed minimal **source-only backports for 7.4, 8.0 and 8.1** (no release),
  and distros and hosts ship patched builds. "No longer officially supports" is true.
- **Fix (16 words), placed before the payoff:** "And about half of PHP sites run versions so old, PHP doesn't
  officially support them anymore." On screen: "estimate · W3Techs".

### S18. "For those, it's switch off or hope the hosting company sorts it out."
- **Voice:** "sorts it out" is British. An American friend says "figures it out" or "handles it". The cue literally
  says "trailing off", so the video ends on a shrug, which the brief rules out (§9, Mistake 8).
- **Accuracy:** **misleading: a false either/or.** It leaves out the actual remedy (**upgrade** to a supported
  version), and "hope" sells short the hosts and distros that *are* shipping backports (cPanel, Plesk, CloudLinux,
  Debian/Ubuntu/Red Hat). That's a small neutrality slip against a whole industry.
- **Fix: CUT.** End on S16's fixed version. If a viewer consequence is wanted (clarity critique), keep it factual:
  "So if a site you use goes dark this week, that's probably why." Use "probably", not "definitely": not every outage
  this week is PHP.

---

## 4. Humour: where the ONE good line goes

The brief: humour "emerges from the situation", "one fantastic line beats five forced jokes", "never force a
punchline into the ending", never ridicule the people affected. The approved engagement line ("PHP. The language
everyone loves.") is **bait, not a joke**: play it flat and let the fact after it do the work. That leaves room for
exactly **one** real line of wit. Everything else is played straight.

**Primary (recommended): the payoff, replacing S15.**
> "So the official Plan B, FBI included, was the oldest line in tech support: turn it off."

- **Situation-born:** governments really did take tech support's universal advice ("have you tried turning it off and
  on again?") at national scale. Everyone on earth recognizes the line. Nobody is mocked: the people affected did the
  sensible thing.
- **True:** the FBI and NSA, NCSC, BSI and CERT-EU all said to patch, or if you can't, take it offline until it's
  mitigated. "Plan B" carries that "if you can't patch" condition in two words, so the joke doesn't overstate the
  advice. Sites came back after patching (Dutch DigiD site about 20:30 CEST; Czech government site about 21:00), so
  the unspoken "…and on again" is true too.
- **Not the last line:** it's followed by the plain twist ("That's what those governments did… many before there was
  even a fix to install"), so no punchline is forced into the ending.
- **Delivery cue:** `[dry, half-smile, THE joke: say "Plan B" straight, then let "turn it off" land flat; don't sell it]`.
  No CAPS, no ellipsis before "turn it off" (the colon gives the beat).
- **Visual:** in-world. A big wall switch on City Hall flips, windows go dark district by district, then one window
  re-lights behind a new lock.

**Backup A (zero extra words): a recognition anchor instead of boilerplate for Cloudflare.**
> "Cloudflare, yes, the 'Verify you are human' people, says…"
Everyone has clicked that box. It's a memorable, unexpected description (brief §17), not a punchline, and it costs
the same as "which protects a big chunk of the web". Caveat: not every human-check is Cloudflare's, so say "the
'Verify you are human' people", never "every captcha". Visual: a checkbox sign on the glass dome (small addition).
Use it only if the CEO attribution stays somewhere ("its CEO says…").

**Backup B (a "wait, seriously?" fact rather than a joke):** "Japan's prime minister posted a warning about a
programming language." It's verified (her X post, Oct 21), the humour is in the fact, and it's shareable. It costs
about 4 s and needs a new in-world asset (a city loudspeaker or billboard, with no likeness or seal).

**Kill:** "And for fourteen years… nobody did." (false, and an inverted joke), "You'd think… right?" (a teacher's
wink), "hope the hosting company sorts it out" (a shrug dressed as wit).

---

## 5. Accuracy and neutrality ledger (my lens)

### Claims stronger than the evidence
| Line | Overreach | Safe version |
|---|---|---|
| S3 "They were fixing" | implies a fix existed | "Not a hack, a flaw in PHP." / "…many before there was even a fix" |
| S8 "for 14 years, nobody did" | absence claim, false (2020 and 2024) | cut, or "PHP's own team noticed the weak spot two years ago…" |
| S9 "AI tools found it" | humans led | "with AI's help" |
| S10 "the details of the bug leaked" | PHP: no technical details leaked | "word leaked" |
| S11 "break-in attempts" | connotes entry; vendor count | "tries", attributed to Cloudflare's CEO |
| S14 "22 million copies of PHP… could be hit" | wrong unit; exposure estimate stated as fact | cut, or "more than 22 million exposed systems, by one count" |
| S16 "That's what those government sites did" (after "can't update fast enough") | wrong cause | "…many before there was even a fix to install" |
| S17 "don't fix it anymore" | source backports exist | "doesn't officially support" |
| S18 "switch off or hope…" | false either/or | cut, or name the real fix (upgrade) |

### Compressions that understate (also misleading)
- "four countries" → at least eight / "across Europe".
- "hours before" → about a day; attempts came even earlier.
- "one in three" → about half (estimate).

### Neutrality
- **Vendor voice:** "Cloudflare, which protects a big chunk of the web" is close to the company's own pitch. Attribute
  its numbers to the CEO, and describe the company neutrally or by the checkbox. Keep the dome to about a fifth or a
  quarter of the skyline (it's in front of about 1 in 5 websites), not the whole city.
- **No villains:** don't name the firm whose exploit video slipped out, don't name Chainguard, and don't stack a
  second dig at the PHP team on top of "the language everyone loves". If the 2024 story is used, its cause ("couldn't
  prove it was dangerous") goes in the same breath.
- **Don't punch down at site owners:** "so old", "nobody's looking after", "neglected" all edge toward blaming
  councils, clinics and small shops. "Run versions PHP no longer supports" is factual and enough.
- **Hosts:** "hope the hosting company sorts it out" casts a whole industry as unreliable while many shipped
  backports. Cut it.
- **Brands:** don't name OpenAI, Google, Wiz or Calif in narration. That keeps us neutral among competitors and keeps
  real logos out of the city.

---

## 6. Proof of concept: a voice pass (not a final script)

This only shows that the fixes above fit the voice and the clock. Structure follows the flow and clarity critiques.
The rewriters own the final. **169 words, 16 sentences** → about 47 s of speech + 7.5 s of sentence breaks + about
2.5 s of commas ≈ **57 s** at this voice's measured rate.

```
[quick, bright, a little amazed, like you just saw this; land "on purpose" flat, no drop]
Governments across Europe just switched off their own websites. On PURPOSE.

[easy, matter-of-fact, letting a friend who doesn't code in on it]
Not a hack, a flaw in PHP.

[deadpan, flat, tiny beat before it; the bait, not a joke; don't smile, don't sell it]
The language everyone loves.

[back to normal pace, plain fact; the irony lands by contrast; lean on "seven", no CAPS]
It runs about seven in ten websites, and this flaw lets a stranger take one over, no password needed.

[warming up, a little quicker, the story getting going; "quietly" soft]
Researchers found it in August, with AI's help, and quietly warned PHP so a fix would be ready first.

[lower and slower, "here's where it went wrong"; no news-anchor drop]
Except word leaked a day early… and attackers were trying it before the fix was even out.

[quicker and brighter, each number clear; don't rush "forty-five"; let "millions" land, don't sell it]
Once it went public, Cloudflare's CEO says they saw tens of thousands of tries in forty-five minutes. By that night, millions.

[level, honest, a friend's shrug, not a threat]
How many got in? Nobody knows yet.

[easy, connecting the dots; the twist, said like it's obvious once you hear it]
Here's the catch: there's no "update the internet" button. Whoever runs each server has to install the fix.

[a touch more serious, unhurried; stress the share, not "old"]
And about HALF of PHP sites run versions so old, PHP doesn't officially support them anymore.

[dry, half-smile, THE joke: "Plan B" straight, then "turn it off" lands flat; don't sell it]
So the official Plan B, FBI included, was the oldest line in tech support: turn it off.

[warm, plain, landing it; slow a little on the last clause, no trailing off]
That's what those governments did… many before there was even a fix to install.
```

Engagement tags (per the brief's layer): "The language everyone loves." = **comment bait**. "On purpose." = **open loop**
(closed by the last line). "there's no 'update the internet' button" and "the oldest line in tech support" =
**quotable / share trigger**. The last line ("…a fix to install") runs back into "switched off their own websites" =
**loop**.
On-screen footnotes needed: "of sites whose server language is known · W3Techs"; "estimate · W3Techs" on "about
half"; "Matthew Prince, Cloudflare CEO, on X" on the numbers.

---

## 7. Visual-world impact of these changes

| Change | Fits the city world? | Asset note |
|---|---|---|
| "On purpose" / governments switch off | yes | GovernmentPlaza windows going dark |
| "take one over, no password" | yes | a stranger opens a door whose lock carries the blueprint flaw |
| "word leaked a day early" | yes | a screen in the square, or a blueprint page blowing down the street |
| "tens of thousands of tries" | yes | figures rattling locks; the dome counter ticks; the dome covers about a fifth of the skyline |
| "no 'update the internet' button" | yes, small addition | the mascot hunting for a master switch and finding only a sea of separate doors (SeaOfDoors) |
| "about half… so old" | yes | OldQuarter on sepia blueprints with faded elephant stamps |
| "turn it off" (the joke) | yes, small addition | a big wall switch on City Hall; one window re-lights behind a new lock |
| Backup A, "Verify you are human" | small addition | a checkbox sign on the dome (generic, no logo) |
| Backup B, Japan's PM | **moderate departure** | a city loudspeaker or billboard; no face, seal or flag |
| Viewer line "if a site you use goes dark" (optional) | **moderate departure** | a phone close-up leaves the city; or show it as a "closed" sign on a familiar building |

---

## 8. What I would NOT change

- "Nobody hacked them" as a *shape* (three words, a reversal at 3 s). Keep the beat, change the words to "Not a
  hack."
- "quietly told/warned": the most human verb in the script.
- The plain "switch it off" register of S15 and S16. That's the narrator's natural voice, so build the payoff out of
  it.

---

## 9. The 5 most important changes

1. **Replace the false, inverted joke with a true, situation-born one.** Cut "You'd think finding it is the hard
   part, right? And for fourteen years… nobody did." (false: PHP's own team spotted it in 2024; and the punchline
   confirms its setup). Put the one wit beat in the payoff: "So the official Plan B, FBI included, was the oldest line
   in tech support: turn it off." Then the plain twist: "That's what those governments did… many before there was
   even a fix to install." Play "The language everyone loves." as flat bait, not a second joke.
2. **De-newsify the syntax.** Kill the appositive tags ("PHP, the programming language behind WordPress…",
   "Cloudflare, which protects a big chunk of the web…"), the noun phrases ("the details of the bug") and the teacher
   scaffolding ("two steps / First… Then… / step two, the slow one"). Write subject-verb sentences a friend would say.
   Use "nobody" once, "the people who make PHP" once, and fixed vocabulary: fix = the patch, install = what each
   server does, support = what PHP stops doing.
3. **Write for ElevenLabs' clock.** Every full stop costs about 0.5 s (8.5 s across 17 breaks in the take). Use 13–16
   sentences, none over about 20 words (split S9's 29 and S11's 25), and put the key fact right before the period
   (not "…leaked online [365 ms] hours before"). At most 2 ellipses and one question. CAPS on one stressed word per
   beat at most, never on whole number phrases. Spell numbers as spoken ("seven in ten", "forty-five", "about half"). That gets about 165
   words to about 55–57 s.
4. **Make every claim match its evidence (the ones listed in section 5).** "Across Europe" or "at least eight" (not
   four). "Not a hack" (not a blanket "nobody hacked them"). Not "they were fixing": many went dark before a fix
   existed. "Word leaked a day early, and attackers were trying it before the fix was out" (not "the details… hours
   before"). "Tries… forty-five minutes after it went public… by that night, millions", attributed to Cloudflare's
   CEO. Cut "22 million copies". "About half… doesn't officially support" (not "one in three… don't fix").
5. **End on the true twist, not a British shrug, and keep it neutral.** Cut "switch off or hope the hosting company
   sorts it out" (a false either/or, it leaves out upgrading, it slights hosts that are shipping backports, and "sorts
   it out" isn't American). Move "about half run unsupported versions" before the payoff. Attribute "switch it off" to
   official advice (without implying Europe followed the FBI). Name no company or researcher as a villain, and no
   brand in narration.

---

## 10. Verification log (this pass, 2026-10-24)

WebFetch of the PHP Foundation blog failed (DNS ENOTFOUND), as it did for the earlier streams. Everything below rests
on WebSearch result extracts.

- **Confirmed:** Matthew Prince's X post (x.com/eastdakota/status/2113079352682570051, title text in the search
  result): "In the 10 hours before it was publicly announced… thousands of attempts… tens of thousands in the 45 minutes
  post announcement, hundreds of thousands within 2 hours, and millions no[w]". Cryptonews dates it 9:25 pm ET Oct 21.
  TNW: "Millions of PHP2Shell attempts so far, but officials see no break-in." My first two searches missed it; the
  extended search found it.
- **Confirmed:** Reuters factbox (via The Star / Devdiscourse): NL (NCSC, Overheid.nl, Port of Rotterdam, KNVB), DE
  (ITZBund, "purely preventive"), FR (prefecture sites "while waiting for a patch"), BE (foreign ministry; CCB recorded
  no attacks), FI (Valtori). **In that factbox, Britain and Australia appear as agencies urging patch-or-offline, not
  as sites going dark.** UK sites going down is reported separately (Insurance Business, LBC, The Scotsman: Edinburgh,
  Oxford, the Met Police; Edinburgh called it "essential maintenance" and hadn't confirmed the link). Austria:
  trendingtopics.eu, pasqualepillitteri.it. So "at least eight" holds with AT/CZ/UK, but **Australia needs a
  re-check** before any list goes on screen.
- **Confirmed:** FBI Cyber Division X post: take affected systems offline until fully mitigated if they can't patch
  right away (Business Today, OfficeChai, AP via local stations). The same day Japan's PM urged considering suspending
  sites (OfficeChai).
- **Confirmed:** PHP knew in 2024 (Quarkslab audit funded by the Sovereign Tech Agency); "theorized, but no concrete
  vectors were found"; "structural failure"; moving to majority vote (TNW, The Standard/Reuters, The Record, The Stack).
- **Confirmed:** leak = CVE IDs posted on Hacker News on Oct 20, later deleted, screenshots spread (Infosecurity
  Magazine, Picus); release moved up a day. The **Calif video** surfaced in my searches only via Ecosistema Startup and
  a TryHackMe mention of "a video said to demonstrate an exploit". The fact sheet cites Computer Weekly and InfoWorld.
  Fine as background; it's not needed in the script.
- **Confirmed:** Palo Alto: "more than 22.6 million" potentially vulnerable internet-connected instances, "not unique
  websites or confirmed breaches" (TechTarget, TNND). Updating WordPress or plugins won't fix it.
- **Confirmed:** no official releases for 7.4, 8.0 or 8.1; minimal **source-only backports** pushed for those
  branches; Sury, Ubuntu Pro, Red Hat, cPanel, Plesk, CloudLinux and TuxCare ship builds (HeroDevs, digitalapplied,
  linuxcompatible).
- **Confirmed (older snapshot):** W3Techs PHP 70.2% (27 Aug 2026) and 70.8% (15 Jul 2026) of sites whose server-side
  language is known.
- **NOT confirmed in my pass:** Unit 42's Oct 23 case of a breached European government body (password hashes and
  MFA secrets within 2 h). My search returned no such report. The fact sheet cites the Unit 42 brief directly. Open
  that page before any line relies on it. It's also why S2 should be "Not a hack" rather than a blanket "nobody hacked
  them".

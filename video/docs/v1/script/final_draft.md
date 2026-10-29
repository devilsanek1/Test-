# Final draft v1: PHP2Shell ("What's All the Fuss About?")

Status: FIRST FINAL DRAFT, 2026-10-24. It builds on the twist skeleton the judges chose, adds their best lines, handles
every must-fix, and puts every sentence through RULE #1 (it has to sound like a real person telling a friend). Inputs:
`CREATIVE_BRIEF.md`, `fact_sheet.md` (FS), the four rewrites, the three critiques, the three judge reports,
`original_annotated.md` (cue format). Verification for this pass is logged in section 9.

---

## 1. Plain script (captions and timing)

Governments across Europe switched off their own websites on purpose this week. They did it because of a flaw that can
let a stranger take over a website without a password. It's in PHP, the language everyone loves, and about seven in ten
websites run on it. That flaw had been sitting there for fourteen years, until researchers using AI figured out how bad
it was. But word got out about a day before the fix did, and attackers were already trying it. Once it was announced,
Cloudflare's CEO says they saw tens of thousands of attempts in forty-five minutes, and millions within a day. You'd
think everyone would just install the fix, but somebody has to put it on every single server. And about half the sites
running PHP are on versions so old they're not even officially supported anymore. So the official advice, even the
FBI's, was basically what tech support always tells you. Turn it off until you can update it. And that's what those
governments did.

## 2. Cued script (ElevenLabs paste format, per `original_annotated.md`)

There are 4 CAPS words (no more than one per beat, none on a number) and 1 ellipsis (the bait beat). There are no
questions, every number is spelled out, and the cues use commas only. THE one joke is named in its cue. The bait is
cued flat, so the voice doesn't play it as a second joke.

```
[quick and bright, a little amazed, like you just saw this, lean on "purpose"]
Governments across Europe switched off their own websites on PURPOSE this week.

[easy, normal pace, telling a friend who doesn't code, plain on "password", don't dramatize]
They did it because of a flaw that can let a stranger take over a website without a password.

[the bait, not the joke, tiny beat after "PHP", "loves" flat, don't smile]
It's in PHP… the language everyone loves, and about seven in ten websites run on it.

[a notch quicker, the story getting going, "fourteen years" plain, no wink, curious]
That flaw had been sitting there for fourteen years, until researchers using AI figured out how bad it was.

[the turn, a touch lower on "But", then level and brisk, stress "already", no ominous drop]
But word got out about a day before the fix did, and attackers were ALREADY trying it.

[brighter and quicker, each number clean, don't rush "forty-five", "millions" plain, don't sell it]
Once it was announced, Cloudflare's CEO says they saw tens of thousands of attempts in forty-five minutes, and millions within a day.

[ease off, back to easy, saying what they're already thinking, then matter-of-fact, stress "every"]
You'd think everyone would just install the fix, but somebody has to put it on EVERY single server.

[a touch more serious, unhurried, stress "half" not "old", no doom, no blame]
And about HALF the sites running PHP are on versions so old they're not even officially supported anymore.

[THE one joke, dry half-smile, short pause after "tells you", "turn it off" flat, don't sell it]
So the official advice, even the FBI's, was basically what tech support always tells you. Turn it off until you can update it.

[warm and settled, the loop closing, a touch slower, land "did" and stop, no trailing off]
And that's what those governments did.
```

## 3. Word count and estimated duration

- **170 words** (`wc -w`), 11 sentences, 9 commas, average 15.5 words per sentence (range 6 to 22).
- **At 165 wpm: 61.8 s.** At 155 wpm it's 65.8 s, and at 175 wpm 58.3 s.
- **Recorded ElevenLabs voice** (rule of thumb from `critique_voice-accuracy.md`: words ÷ 3.6/s, plus 0.5 s per full
  stop and 0.2 s per comma): 47.2 + 5.5 + 1.8 ≈ **54.5 s**. The current take runs 77.6 s, so this is about 23 s shorter.
- "Purpose" is word 10. That's about 3.6 s in at 165 wpm, or about 2.8 s at the voice's measured rate.
- Why it's longer than the twist rewrite (147 words): RULE #1 replaces fragments with full sentences and real
  connecting words ("They did it because of…", "You'd think…", "basically"), and it brings back the fourteen years. To
  stay within 62 s I cut the "researchers told PHP" clause and the "data and all" aside (it moves on screen; see section 5).

| Slot (brief §11) | Brief | This draft (165 wpm) |
|---|---|---|
| HOOK | 0–3 s | 0–4.4 s: switched off their own websites on purpose (lands at ~3.6 s, or ~2.8 s with the recorded voice) |
| STAKES | 3–10 s | 4.4–11.3 s: a stranger can take over a website without a password. Scale by 17.1 s (seven in ten) |
| EXPLANATION | 10–30 s | 17.1–30.2 s: sitting there for fourteen years, researchers using AI, word got out, attackers already trying it |
| TWIST | 30–45 s | 30.2–51.3 s: tens of thousands in 45 min, millions in a day; you'd think everyone would just install it; about half are on unsupported versions |
| PAYOFF | 45–55 s | 51.3–61.8 s: the official advice, even the FBI's, is turn it off until you can update; that's what those governments did. Then it ends and loops |

---

## 4. RULE #1 pass, line by line

Each line was checked with one question: would a normal person say exactly these words out loud to a friend? The AI tells
that got removed are named using the brief's own list.

| # | t (165) | Line now | Came from (judged line) | AI tells removed | Accuracy (FS) |
|---|---|---|---|---|---|
| 1 | 0.0 | Governments across Europe switched off their own websites on purpose this week. | "…this week. On purpose." (twist/narrator) | staccato fragment "On purpose." (now inside the sentence, still ~3 s in) | FS 1–2: NL, FI, FR, BE, DE, CZ, UK; voluntary and precautionary; Wed Oct 21 = "this week" |
| 2 | 4.4 | They did it because of a flaw that can let a stranger take over a website without a password. | "Not a hack. A flaw that can let a stranger take over a website. No password." | "X. Not Y." template ("Not a hack."), fragment "No password." This also fixes the judges' whiplash, since "because of" gives the reason instead of a contradiction | FS attacker row: unauthenticated code execution, hedged as "can let" (reliability disputed, mod_php most exposed). It doesn't claim "nobody was hacked" (FS 3, Unit 42) |
| 3 | 11.3 | It's in PHP, the language everyone loves, and about seven in ten websites run on it. | "It's in PHP. The language everyone loves." + "It runs about seven in ten websites." | Fragment chain. The user-approved bait is kept word for word, and the fact follows with nothing in between. "run on it" is how people say it | FS 5: W3Techs, sites whose server language is known (69.3% FS; 70.5–70.8% Jul–Aug). The denominator is on screen |
| 4 | 17.1 | That flaw had been sitting there for fourteen years, until researchers using AI figured out how bad it was. | tight: "It sat in PHP for fourteen years, until researchers using AI proved it was dangerous and quietly told PHP." | stock "quietly"; "proved it was dangerous" → "figured out how bad it was"; "told PHP" (PHP as a person) cut | FS 7–8: the code dates to 5.4.0 (2012); PHP spotted the weak spot in 2024 but couldn't prove it was dangerous. The line never says or implies "nobody found it". Humans led and AI helped ("researchers using AI") |
| 5 | 24.0 | But word got out about a day before the fix did, and attackers were already trying it. | tight "Except… word leaked a day before the fix. Attackers were already trying it." / twist "But the internet's bad at secrets." | aphorism cut ("the internet's bad at secrets"), the "Except…" reveal, and the two-fragment split | FS 10: word (not details) leaked about 18–22 h before the fix. "And", never "so", because Amazon saw an attempt Oct 17, before any leak |
| 6 | 30.2 | Once it was announced, Cloudflare's CEO says they saw tens of thousands of attempts in forty-five minutes, and millions within a day. | "Once it went public, Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes. Within a day… millions." | writerly compression "attempts hit tens of thousands"; fragment "Within a day… millions." | FS 12: Prince on X: 45 min after the public announcement; "attempts", mostly blocked, the vendor's own count. "Millions" is used once in the whole script |
| 7 | 38.2 | You'd think everyone would just install the fix, but somebody has to put it on every single server. | payoff-first "So why not just install the fix? Because there's no 'update the internet' button. Whoever runs EACH server has to install it." | self-answered rhetorical question; "there's no X button"; "whoever runs each server". The viewer's own question is now said the way a friend says it ("You'd think…") | FS extra fact 5: the fix has to come from whoever runs the server. On screen: "Updating WordPress won't fix it" |
| 8 | 44.7 | And about half the sites running PHP are on versions so old they're not even officially supported anymore. | "And about HALF of PHP sites run versions so old, PHP no longer releases/supports them." | compression "PHP no longer releases fixes for them" (and PHP as a person). "Not supported anymore" is the everyday phrase people know from old phones and laptops | FS 17: an estimate (~35% on 7.x/5.x plus ~16% on 8.0/8.1). "Officially" covers the source-only backports and distro builds. On-screen credit with the denominator; fallback "more than a third" |
| 9 | 51.3 | So the official advice, even the FBI's, was basically what tech support always tells you. | payoff-first "So the official Plan B, FBI included, was the oldest line in tech support: turn it off." | colon reveal; crafted zinger ("Plan B", "oldest line"). The joke now comes out of the situation and is told plainly | FS 15: FBI, NSA, UK NCSC, BSI, CERT-EU and Japan's PM. "Even the FBI's" puts the FBI among others and doesn't imply that Europe followed the FBI |
| 10 | 56.7 | Turn it off until you can update it. | (same) | none. It's plain advice in plain words | FBI: "take the system offline until it can be fully mitigated" |
| 11 | 59.6 | And that's what those governments did. | all four ("That's what those governments did.") | Kept almost as it was. It's the user's own original line and plain speech, not a zinger. There is no coda after it | FS 16: many went dark before the fix existed ("can't update yet" covers that) |

Also checked across the whole script: there are no em-dashes, semicolons, colons or questions, no lists of three, no
"quietly / in secret / turns out / problem is / here's / the catch", and no "Not X. Y." The connecting words
(because, and, but, until, so, you'd think, basically) carry the BUT/SO chain: on purpose → because of a flaw → it's in
the code under most sites → sitting there 14 years until researchers saw how bad it was → BUT word got out → attempts in
the millions → you'd think they'd just install it, BUT it's every server → AND half are unsupported → SO turn it off →
that's what they did.

---

## 5. Must-fixes: how each was handled (and where the judges disagreed)

| Must-fix | Done how |
|---|---|
| Twist skeleton + payoff-first question + tech-support joke; cut "the internet's bad at secrets" | Done. The question becomes "You'd think everyone would just install the fix, but…" (RULE #1 bans self-answered questions). The tech-support line is THE one joke. "Bad at secrets" is cut |
| "On purpose" inside ~3 s | It's word 10: ~2.8 s with the recorded voice, ~3.6 s at 165 wpm |
| "Just" (retention) vs "this week" (editorial, viewer, FS 1) | "This week" (2 of 3 judges plus the fact sheet). **After Sun Oct 25, change it to "last week"** |
| "Not a hack" whiplash | The line is gone. "They did it because of a flaw…" gives the BECAUSE, so there's nothing to contradict |
| Restore fourteen years in the accurate form | Done (line 4). It never says "nobody found it". On screen: "in the code since at least 2012" |
| Keep the AI angle, as "helped" not "found" | "researchers using AI figured out how bad it was": humans are the subject and AI is the tool |
| "PHP's makers", not PHP acting like a person (viewer) | PHP never acts now. The "told PHP" clause was cut for length, and line 8 is in the passive ("not officially supported") |
| Jargon before stakes | The takeover (line 2) comes before the word "PHP" (line 3) |
| Bait, then fact with nothing in between, and no second dig | Done in one sentence. Line 4 states a fact with no editorializing about PHP |
| "Once it went public", not "then the fix came out" | "Once it was announced" (also avoids "word got out" / "went public" sounding like the same event) |
| "Cloudflare's CEO says", "attempts", never "break-ins" | Done, spoken and on screen |
| Explain Cloudflare (viewer) | On screen: "Cloudflare · sits in front of about 1 in 5 websites". The dome shrinks to ~1/5 of the skyline |
| "Millions" once only; 22.6M kept out of the voiceover | Done |
| "Releases fixes" (retention, viewer) vs "supports" (editorial) | "Not even officially supported anymore": true given the source-only backports, and everyday wording |
| "About half" credit and fallback | On screen: "estimate · PHP sites that show their version · W3Techs". If it isn't signed off: "And more than a third of the sites running PHP are on versions so old…" |
| "FBI included" must not imply Europe followed the FBI | "the official advice, even the FBI's" plus the caption band "FBI · NSA · UK NCSC · CERT-EU" (no seals, faces or logos). No invented US outage |
| End on the loop closure, no viewer coda or phone line | Ends on "And that's what those governments did." |
| "Data and all" in the stakes (viewer) | Moved **on screen** in the takeover diagram ("the site and its data"). Spoken, it broke the flow of line 2 and pushed the draft past 62 s |
| No "two steps" frame | Not used |
| Literal "most popular" option shown with its risk | Section 8 |

---

## 6. On-screen text (never voiced)

- On "a flaw": "PHP2Shell · two linked flaws"
- Takeover inset (a blueprint DIAGRAM, not a real building): "no password · control of the site and its data"
- On "seven in ten": "of sites whose server language is known · W3Techs"
- On "fourteen years": "in the code since at least 2012"
- On "researchers using AI": "found with AI help · reported privately in August" (no company names or logos)
- On "word got out": "word leaked Oct 20 · fix out Oct 21"
- On the numbers: "Cloudflare · sits in front of about 1 in 5 websites", then "Matthew Prince, Cloudflare CEO, on X · after
  the public announcement · attempts, mostly blocked"
- On "every single server": "Updating WordPress won't fix it"
- On "about half": "estimate · PHP sites that show their version · W3Techs"
- On the advice: "FBI · NSA · UK NCSC · CERT-EU"

## 7. Engagement tags (brief, engagement layer)

- **[open loop]** "…switched off their own websites on purpose": why would anyone do that? Closed by the last line.
- **[comment bait]** "the language everyone loves": the user-approved irony, with the true fact in the same sentence.
- **["wait, seriously?"]** "sitting there for fourteen years"; "attackers were already trying it"; "millions within a day".
- **[share trigger, THE one joke]** "even the FBI's, was basically what tech support always tells you". Sharing it
  passes on the insight.
- **[loop line]** "And that's what those governments did." runs straight back into "Governments across Europe
  switched off…".

## 8. Visuals: what changes in the city / blueprint / elephant world

Nothing needs a different world. Beat order: S01 → takeover inset → S02 → 14-year pages (reused from S04, about 2 s)
→ S05 AI lenses → S06/S07 leak → S08 dome → S10 hillside of doors → S12 old quarter → advice → S11 hard cut to S01.
- S01: drop the "four" pennant count.
- Takeover: an inset DIAGRAM on the blueprint (a bare hand turns the flawed lock with no key). Attackers never get
  into real buildings. Small new asset.
- Bait: Pip trots past while two passers-by roll their eyes. Small gag beat.
- Leak: a sheet slips out under the workshop blind (S06 reversed). The S07 clock sweeps a full DAY, not hours.
- S08: the dome covers about **1/5** of the skyline, not most of it.
- "Every single server": S10, where the keeper fixes one lock, then BIG MOVE 2 pulls back to the hillside of doors. The
  City Hall "update the internet" button is no longer needed.
- S12: the old-versions pie reads **1/2**, not 1/3.
- Tech-support joke: Pip's hand goes back to the S01 sun-switch (an existing asset) while the caption band names the
  agencies. If there's a loudspeaker or billboard, keep it in-world with no seals, faces or logos. Small to moderate.
- Ending: the existing S11 hard cut, now on "that's", to the exact S01 frame.

## 9. The user's literal "most popular" option (for the user to decide)

- Literal: "It's in PHP, the most popular programming language in the world, and…" **FALSE.** TIOBE (Oct 2026) puts
  Python first, with PHP around #12. Stack Overflow 2025 puts JavaScript first. GitHub Octoverse 2025 puts TypeScript
  first. Expect the top comment to be a correction that is right.
- Closest true wording, in the same casual register: "It's in PHP, which is what most websites run on, about seven in
  ten of them." (W3Techs: PHP ~69–71% vs JavaScript ~8% among sites with a known server language.)
- The main script keeps the user's final choice: "the language everyone loves", with the fact in the same sentence.

## 10. Verification log (this pass) and publish-day checks

This pass's search worked, unlike the earlier passes. Everything below rests on search extracts, not full page reads.
- **FBI advice: confirmed.** AP syndication (Oct 21), Business Today, OfficeChai and Defense One quote the FBI Cyber
  Division post: "take the system offline until it can be fully mitigated" for anyone unable to patch right away.
  Japan's PM gave similar advice.
- **Prince's numbers: confirmed** (TNW, GIGAZINE Oct 23, OfficeChai, BigGo, TradingView/Seeking Alpha): thousands in the
  10 h before the announcement, tens of thousands in the 45 min after, hundreds of thousands within 2 h, millions by
  the time of his post. Outlets give the post as late Oct 21 or Oct 22, so the script says "within a day", not "by
  that night".
- **W3Techs: not reachable.** WebFetch failed (DNS `ENOTFOUND w3techs.com`). Search extracts show 70.8% (Jul 15) and
  70.5% (Aug 7) of sites with a known server language. The fact sheet's Oct figure of 69.3% isn't re-confirmed. "About
  seven in ten" holds either way. The version split behind "about half" was **not** re-checked this pass.
- **New MOVING item:** TNW reports that officials in Germany, the Netherlands and Japan said no attempts had succeeded,
  while SecNews (citing Reuters) says Prince saw isolated evidence of successful breaches. The script makes no claim
  either way. Don't add a "nobody got in" line.
- **Before lock, open in a normal browser:** W3Techs PHP share and version pages; Prince's X post; the FBI Cyber
  Division post; the AWS Security Blog (Oct 17 attempt); the PHP 8.5.12 release notes. On publish day re-check the
  country spread ("across Europe"), exploitation and breach status, and "this week" vs "last week".

Sources opened through search this pass:
[TNW, millions of attempts](https://thenextweb.com/news/cloudflare-php2shell-millions-exploit-attempts) ·
[TNW, no confirmed break-in](https://thenextweb.com/news/php2shell-millions-exploit-attempts-no-confirmed-breaches) ·
[GIGAZINE](https://gigazine.net/gsc_news/en/20261023-cloudflare-stats-php2shell-attempts/) ·
[OfficeChai, Prince](https://officechai.com/stories/cloudflare-ceo-says-php-exploit-attempts-went-from-thousands-to-millions-within-hours-of-disclosure/) ·
[SecNews](https://www.secnews.gr/en/743113/cloudflare-matthew-prince-nees-efpatheies/) ·
[AP via News4Jax](https://www.news4jax.com/business/2026/10/21/some-websites-go-dark-as-operators-address-an-ai-detected-flaw-in-a-web-programming-language/) ·
[Business Today](https://businesstoday.in/technology/story/critical-vulnerabilities-govt-websites-in-europe-shut-down-over-php-security-scare-fbi-issues-urgent-advisory-562935-2026-10-21) ·
[OfficeChai, FBI and Japan's PM](https://officechai.com/stories/japans-prime-minister-usas-fbi-take-to-x-warning-people-over-the-php-vulnerability/) ·
[Defense One](https://www.defenseone.com/threats/2026/10/critical-flaws-php-warning/416727) ·
[ppc.land, Cloudflare WAF](https://ppc.land/cloudflare-blocks-php2shell-exploits-9-hours-before-php-flaws-went-public/) ·
[W3Techs comparison (search extract)](https://w3techs.com/technologies/comparison/pl-php)

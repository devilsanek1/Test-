# Final script: PHP2Shell ("What's All the Fuss About?")

Locked 2026-10-24. The base is `everyday_dinner.md`, which all three judges picked as the winner. Into it go the best
lines from `everyday_walk.md` and `everyday_narrator.md`, plus every must-fix from the human, detector and TikTok judges.
Every sentence went through RULE #1 in `CREATIVE_BRIEF.md` first: would a normal person say exactly these words to a
friend? Accuracy uses only the safe wording in `fact_sheet.md` (FS) and was re-checked this pass (section 8). The one
deliberately crafted line is the user's approved bait, "PHP, the language everyone loves".

---

## 1. Plain script (captions and timing)

Governments all over Europe just shut down their own websites on purpose, because of this bug where anyone could take
over a site without a password. It's in PHP, the language everyone loves, and about seven out of ten websites run on it.
It was in there for like fourteen years before some researchers using AI figured out how bad it was. They gave the PHP
people a heads-up so they could fix it first, but word got out a day early, and hackers were already trying it.
Cloudflare says once it was official, they saw tens of thousands of attempts in forty-five minutes, and then millions.
And the fix doesn't help until somebody actually installs it on every single server. Plus about half of PHP sites are on
versions so old they're not officially supported anymore. So even the FBI said if you can't update yet, just turn it
off, which is basically what tech support tells you about everything. And that's pretty much what those governments
already did.

## 2. Cued script (main script; ElevenLabs paste format per `original_annotated.md`)

The same text is saved on its own, exactly as you'd paste it, in `final_script_elevenlabs.txt`. It has 4 CAPS words (one
per beat at most, never on a number) and 1 ellipsis (the bait). Every number is spelled out and there are no questions.
THE one joke is named in its cue, and the bait is cued flat so it doesn't play as a second joke. Compared with the plain
script, the only differences are the CAPS, the ellipsis and one comma after "says", which gives the voice a tiny breath so
"says once" isn't heard as "said one time". The words are identical.

```
[quick and bright, a little amazed, lean on "purpose", "password" plain, no drama]
Governments all over Europe just shut down their own websites on PURPOSE, because of this bug where anyone could take over a site without a password.

[the bait, not the joke, tiny pause after "PHP", "loves" dead flat, straight into the number]
It's in PHP… the language everyone loves, and about seven out of ten websites run on it.

[a notch quicker, easy, letting a friend who doesn't code in on it, "like" tossed off]
It was in there for like fourteen years before some researchers using AI figured out how bad it was.

[brisk and level, small dip on "but", stress "already", no ominous drop]
They gave the PHP people a heads-up so they could fix it first, but word got out a day early, and hackers were ALREADY trying it.

[brighter, passing on what they said, tiny breath after "says", "millions" plain, no build]
Cloudflare says, once it was official, they saw tens of thousands of attempts in forty-five minutes, and then millions.

[ease off, the "oh, I get it" line, lean on "actually", slower on "every single server"]
And the fix doesn't help until somebody ACTUALLY installs it on every single server.

[a touch more serious, unhurried, stress "half" not "old", no doom, no blame]
Plus about HALF of PHP sites are on versions so old they're not officially supported anymore.

[THE one joke, dry half-smile, advice said straight, no pause before "which", don't sell it]
So even the FBI said if you can't update yet, just turn it off, which is basically what tech support tells you about everything.

[relaxed and warm, a touch slower, shrug on "pretty much", don't land it like a title card]
And that's pretty much what those governments already did.
```

**Listen for these when you render it:**
- "for like fourteen years": if the voice stresses "like" or reads it as a comparison, change it to "for about fourteen
  years" (same word count).
- "Cloudflare says, once it was official": the comma should be a breath, not a dramatic pause. If it drags, delete the
  comma.
- "AI" and "PHP" should come out as letters. "and then millions" should sound tossed off, not like a trailer build.

## 3. Thesis, understanding shift, length

**Thesis (brief §22):** Everyone's talking about the bug that made governments switch off their own websites. What's new
is the gap between how fast hackers moved once it was public (tens of thousands of attempts in forty-five minutes) and how
slowly a fix actually reaches sites (someone has to install it on every server, and about half of PHP sites run versions
that don't officially get it). That matters because a fix being out doesn't mean the web is fixed, so for a lot of sites,
switching off really was the safe move.

**Payoff sentence (brief §9):** After watching, people will understand that a fix existing doesn't make a site safe until
someone installs it on that server, while attackers start within minutes. That matters because about seven in ten websites
run on PHP and about half of those are on versions that don't officially get fixes, so the official advice, even the
FBI's, was to switch off until you can update.

**Understanding shift (brief §10):**
- BEFORE: "Some government websites went down. Was it a hack?"
- DURING: "Wait, they turned them off themselves? And hackers were trying it within minutes?"
- AFTER: "Oh, a fix being out doesn't mean sites are fixed. Somebody has to install it everywhere, and lots of sites are
  too old to even get it, so turning them off was the safe thing to do."
- Told to a friend in two sentences: "There was this bug in the code most websites run on, and hackers started trying it
  within minutes of it going public. The fix only helps once somebody installs it on each server, so governments just
  turned their sites off until they could."

**Word count and duration:**
- **170 words** (`wc -w`), 9 sentences, 9 commas. Sentences run 26 / 17 / 19 / 26 / 19 / 14 / 16 / 24 / 9 words.
- **At 165 wpm: 61.8 s.** At 155 wpm it's 65.8 s, and at 175 wpm 58.3 s.
- **Recorded ElevenLabs voice** (rule of thumb from earlier passes: words ÷ 3.6/s, plus 0.5 s per full stop and 0.2 s per
  comma): 47.2 + 4.5 + 1.8, plus about 0.3 s for the bait ellipsis, ≈ **54 s**. The current take is 77.6 s.
- "Purpose" is word 12, which is about 3.3 s into the recorded voice. Frame 1 has to carry the hook visually (section 6).

| Slot (brief §11) | 165 wpm | Recorded (est.) | Line |
|---|---|---|---|
| HOOK + STAKES | 0–9.5 s | 0–7.9 s | governments shut their own sites on purpose, because anyone could take over a site |
| SCALE (bait) | 9.5–15.6 s | 7.9–13.5 s | PHP, the language everyone loves, seven out of ten websites |
| EXPLANATION | 15.6–32.0 s | 13.5–27.4 s | fourteen years; researchers using AI; heads-up, BUT word got out and hackers were already trying it |
| TWIST | 32.0–49.8 s | 27.4–43.0 s | tens of thousands in forty-five minutes, then millions; the fix doesn't help until it's installed; about half unsupported |
| PAYOFF + LOOP | 49.8–61.8 s | 43.0–53.8 s | SO even the FBI said turn it off (the joke), and those governments already did. It loops into line 1 |

**RULE #1 sweep of the final text:** there are no em-dashes, semicolons, colons or questions, no "X. Not Y." contrasts,
no fragments, no lists of three, and none of the banned stock phrases ("quietly", "turns out", "problem is", "here's",
"the catch", "in secret", "there's no X button"). The connecting words are the spoken ones: because, and, but, so, plus,
which is basically. The hedges ("like", "about", "basically", "pretty much") each sit where a person would actually be
unsure. Two spots are still slightly shaped, and both are on purpose. "And then millions" is a mild build, so it's cued
flat. The last line echoes the opening because the loop needs it, and "pretty much" and the flat cue keep it from landing
like a mic-drop.

---

## 4. Line by line

FS = `fact_sheet.md` row. Search-extract sources are listed in section 8. "Current" means the 226-word script that was
recorded.

| # | Line | Job | Engagement mechanism | Source(s) | What changed vs the current script, and why |
|---|---|---|---|---|---|
| 1 | Governments all over Europe just shut down their own websites on purpose, because of this bug where anyone could take over a site without a password. | HOOK + STAKES: a surprising act and a fear anyone gets, in one breath | **[open loop]** why would anyone do that on purpose? Line 9 closes it | FS 1–3; AP (NL, FI dark as a precaution); TechRepublic (NL, DE, FR, BE, FI on Oct 21); Insurance Business (UK councils, Met Police); FBI via AP (code can run with no login) | "Four countries" was **wrong**, since at least eight went dark. "Switched themselves off" became "shut down their own websites on purpose", which is how people say it, and "their own… on purpose" is the surprise. "Nobody hacked them" is cut, because one European government body was reportedly breached (FS 3), so it can't be said safely. The old script never said what the bug does, and now the stakes come in the first breath. "Could" keeps the hedge, because how reliable the exploit is is still disputed (FS 13). The flow is taken from the dinner version and the walk/narrator versions |
| 2 | It's in PHP, the language everyone loves, and about seven out of ten websites run on it. | SCALE: why this is everybody's problem | **[comment bait]** user-approved irony, with the true fact in the same breath | W3Techs: 70.3% of sites whose server language is known (Aug 22 2026); AP ("estimated 70% of all websites"); FS 5 | "The programming language behind WordPress" is gone. You doubted WordPress works as an anchor, and the bait replaces it. "Seven out of ten… run on it" is how people say it out loud. The denominator goes on screen |
| 3 | It was in there for like fourteen years before some researchers using AI figured out how bad it was. | EXPLANATION: how long it hid and how it got found | **["wait, seriously?"]** fourteen years | FS 7–8; Google Cloud/Wiz via search (affected since PHP 5.4, which came out in 2012); the 2024 audit had flagged the weak spot without proving it; Calif with OpenAI's model, Wiz with Google's | The whole "two steps… You'd think finding it is the hard part, right?… And for 14 years, nobody did" setup is cut. It was **misleading**, because PHP's own developers spotted the weak spot in 2024 (FS 7), and it relied on a self-answered question. "Figured out how bad it was" is true. "Two security teams using AI tools found it" became "some researchers using AI", because people did the work and AI helped. "For like" was added on the detector's advice, since without "for" the voice can read "like" as a comparison |
| 4 | They gave the PHP people a heads-up so they could fix it first, but word got out a day early, and hackers were already trying it. | EXPLANATION, then the BUT: the plan and how it broke | **["wait, seriously?"]** "already trying it" | Boston Globe (Calif warned a PHP developer Aug 11, kept it secret during the fix); Infosecurity Magazine (CVE IDs leaked Oct 20); SecurityWeek (attempts before the patches); AWS via TechRadar (attempt on Oct 17); FS 9–10 | "Quietly told the people who make PHP" is a banned stock phrase, and "a heads-up" is the everyday word. "First" gives "a day early" something to be early against, which was a must-fix. "Except, the details of the bug leaked online hours before the fix" was **wrong twice**: it was about a day (18–22 h), and PHP says no technical details leaked, only the IDs and a video. "Except," worked as a reveal word and is now a plain "but". "Hackers were already trying it" is new, verified and stronger. It stays "and", never "so", because Amazon's Oct 17 attempt came before the leak |
| 5 | Cloudflare says once it was official, they saw tens of thousands of attempts in forty-five minutes, and then millions. | TWIST: how fast and how big | **["wait, seriously?"]** forty-five minutes, the number people will quote | Matthew Prince on X, via Seeking Alpha/TradingView, TNW, OfficeChai, BigGo (search extracts; the post itself couldn't be opened); FS 12; W3Techs Cloudflare 23.9% of all sites (on screen) | "Break-in attempts" became "attempts", since they were mostly blocked and none is a confirmed break-in. "By evening" is gone, because outlets date the post differently (late Wed or early Thu). "Once it was official" counts the 45 minutes from the announcement, not the leak, and plays off "word got out". "Cloudflare's CEO says" became "Cloudflare says": "they" now clearly means Cloudflare, it's how people pass this on, and Prince is named on screen. "Which protects a big chunk of the web" moved **on screen** ("sits in front of about 1 in 5 websites", mandatory) to keep under 62 s. "Nobody knows yet how many got in" is cut, because the status keeps moving (FS 13) and it would date fast. The walk version's "and then millions" was kept over "within a day", which is written register, with a flat cue so it doesn't build |
| 6 | And the fix doesn't help until somebody actually installs it on every single server. | TWIST, and the understanding shift: a fix existing isn't the same as sites being fixed | none (it's the insight) | FS extra fact 5 (Automattic/Wordfence: updating WordPress doesn't fix it, the server has to be fixed); OX Security, under 1% patched after 24 h (FS extra 3, optional on screen) | "So now comes step two, the slow one. Someone has to install that fix on every site" is gone, because the "step two" frame went with the two-steps setup. The narrator version's line was used as its own sentence (must-fix). "Every site" became "every single server", since the fix goes on servers. "Actually" carries the point that a fix being out and a fix being installed aren't the same. "22 million copies of PHP" is cut as **misleading**: it's one firm's count of exposed systems, not copies or sites, and other counts run from 2M to 41M (FS 14) |
| 7 | Plus about half of PHP sites are on versions so old they're not officially supported anymore. | TWIST: the complication, many sites can't even get the official fix | **["wait, seriously?"]** "about half" | W3Techs Aug 22 (v7 28.9%, v5 7.9%) plus PHP 8.0/8.1 ≈ 15.6% gives ≈ 52%; CybelAngel 59% of hosts that show a version; php.net end-of-life dates; FS 17 | "One in three" was **understated**, because 8.0 and 8.1 are out of support too. "The people who make PHP don't fix it anymore" became "not officially supported anymore", the phrase people know from old phones, and "officially" keeps it true given PHP's source-only backports. "For those, it's switch off or hope the hosting company sorts it out" is cut as **misleading**, because it left out upgrading, the real fix (FS 18). It's its own "Plus…" sentence, not buried behind "and" (must-fix) |
| 8 | So even the FBI said if you can't update yet, just turn it off, which is basically what tech support tells you about everything. | PAYOFF: what it means, switching off is the official safe move. Also THE one joke | **[share trigger]** the tech-support joke | AP via ClickOnDetroit/KSAT/News4Jax and Business Today: "If an immediate update is not feasible… take the system offline until it can be fully mitigated"; NSA and UK NCSC said the same; FS 15 | "If a site can't update fast enough, the safest thing is to switch it off until it can" was advice with nobody's name on it. Now it's the FBI's, which is more credible and more surprising, and the joke trails after it as an aside (narrator wording). "If you can't update yet" is the FBI's own condition. "Tells you about everything" points at "turn it off and on again" |
| 9 | And that's pretty much what those governments already did. | PAYOFF close, and the loop | **[loop line]** runs straight back into line 1 | FS 16; NL and FI sites off before the patch; Valtori started early afternoon, before the 17:00 local fix; the French Interior Ministry went offline until the 4 p.m. patch | "That's what those government sites did" gained "pretty much" (some went dark before a fix existed, some only partly) and "already" (they did it before the FBI said so, so it doesn't sound like Europe followed the FBI, a TikTok must-fix). It's now the last line, so the loop seam is clean. The old script ran the hosting line after its loop line |

---

## 5. Two alternative opening hooks to A/B

Both are drop-in replacements for line 1. Lines 2–9 stay the same, and the loop line still works because "those
governments" has something to point back to.

**A. Stakes first ("a fear anyone gets" hook), 27 words (+1), 62.2 s at 165 wpm, about 54 s recorded**
> There's this bug where anyone could take over a website without a password, and governments all over Europe just shut
> down their own sites because of it.

- Cue: `[easy and a little conspiratorial, like you're about to tell them something, "password" plain]`
- Why test it: the first three seconds are a worry every viewer already has (someone hijacking a website), instead of a
  news event. "There's this…" is how people start telling a story. It doesn't say "on purpose", because "shut down their
  own sites because of it" already makes that clear.
- Verified: unauthenticated code execution (FBI via AP, FS attacker row), and the European shutdowns (FS 1–2, AP,
  TechRepublic).
- Visual: open on the takeover inset (a bare hand turns the flawed lock), then hard cut to S01 on "governments". Both
  shots already exist in the plan.

**B. Named countries ("that's my country" hook), 29 words (+3), 62.9 s at 165 wpm, about 54.5 s recorded**
> Countries like the Netherlands and France just shut down their own government websites on purpose, because of this bug
> where anyone could take over a site without a password.

- Cue: `[quick and bright, a little amazed, lean on "purpose", no drama on "password"]`
- Why test it: real place names are concrete, and viewers from those countries stop scrolling. It names two countries, not
  three, so it doesn't turn into a list of three, and "countries like" signals there were more.
- Verified: the Netherlands (Logius: MijnOverheid, Overheid.nl) and France (Interior Ministry, prefectures), per AP,
  TechRepublic and Hart van Nederland.
- To get back to 170 words (61.8 s) with B, cut "for" and "some" in line 3 and "actually" in line 6. With A, cutting "some"
  is enough.
- Visual: S01's pennants carry the two names as on-screen text (no flags or crests needed, keep them generic).

---

## 6. Visual impact (city / blueprint / elephant world)

**Nothing needs a different world.** The new voiceover is about 54 s against the 77.6 s take, so every scene has to be
re-timed to the new recording. Scene order changes at the end: S10 → S12 → S11, then the loop.

| Line | Scene | Verdict |
|---|---|---|
| 1 | **S01** government buildings, sun-switch, shutters | **Fits, light re-stage.** Remove the "four" pennants: use no count, or more buildings receding. The shutters slam on "shut down" and the sun is pressed on "purpose" (about 3.3 s), not on "themselves". Frame 1 has to read "a government building switching itself off" with no title card, because "purpose" lands just after the 3 s window |
| 1 | **New small inset:** takeover diagram | **New, small.** On "anyone could take over a site": a blueprint diagram where a bare hand turns the flawed lock with no key. Attackers never get into real buildings. Inset label: "no password · control of the site and its data" |
| 2 | **S02** lock close-up, then Blueprint Street, 7/10 pie | **Fits.** Drop any WordPress cue. Optional bait gag: Pip trots past while two passers-by roll their eyes on "loves" |
| 3 | **S04** (only the 14 "year" pages tearing, about 2 s) | **Partly reused.** The "hard part" tower, the look to camera on "right?" and the hard stop on "did" are cut, because those words are gone |
| 3 | **S03** two steps (find / fix) | **Cut.** The two-steps frame is gone. The sage wrench tags for "everywhere" can move to S10 |
| 3 | **S05** master blueprint, two teams, beams | **Fits.** The ring lands on "figured out how bad it was" instead of "found" |
| 4 | **S06** Makers' Lane: envelope, fix made, sheet blows in | **Fits.** The sealed envelope to the elephant-stamped workshop is the heads-up. Blind down is "fix it first", and the sheet slipping out is "word got out" |
| 4 | **S07** notice board, copies on wires, clock | **Fits, one change.** The clock must sweep a full DAY, not "hours". Show the figures trying locks on "already trying it" |
| 5 | **S08** dome, tallies, 45-min wedge, millions | **Fits, one change.** The dome covers only about **1/5** of the skyline (the 1-in-5 fact). The counter starts at the announcement. The "by evening" sunset is no longer spoken, but it can stay as time passing |
| 6 | **S10** keeper installs one lock, then pull-back to the hillside of doors | **Fits as is.** It's the strongest picture of "until somebody actually installs it on every single server" |
| — | **S09** night flashlight "?" and the "step two" sunrise | **Cut.** "Nobody knows how many got in" and "step two" are gone. The snail can cameo in S10 |
| 7 | **S12** old quarter, version pie, tick-skip-tick cart | **Fits, re-staged.** The pie reads **1/2**, not 1/3. It now comes before S11, so its entry and exit transitions need re-blocking |
| 8 | **S11** progress bar crawls, sun pressed, shutter drops | **Fits.** The crawling bar is "can't update yet", and the sun-switch press is "just turn it off". Caption band: "FBI · NSA · UK NCSC · CERT-EU", with no seals or faces. "Tech support" gets a tiny Pip shrug, nothing bigger |
| 9 | **S11 hard cut to the S01 frame** on "that's" | **Fits, and it becomes the ending.** The end frame must match frame 0 (shutters up, sun mid-rise), so the loop seam is invisible and the shutters slam again on "shut down" |
| — | **S13** two-option board, caretaker, un-build | **Cut.** The "switch off or hope the hosting company" line is gone. The S11 cut to S01 now does S13's loop job |

**On-screen text (never voiced):**
- On "bug": "PHP2Shell · two linked flaws"
- On "seven out of ten": "of sites whose server language is known · W3Techs"
- On "fourteen years": "in the code since at least 2012"
- On "researchers using AI": "found with AI help · reported privately in August"
- On "word got out": "word leaked Oct 20 · fix out Oct 21"
- On "Cloudflare" (**mandatory**, because the voice never says what Cloudflare is): "Cloudflare · sits in front of about 1
  in 5 websites", then "Matthew Prince, Cloudflare CEO, on X · after the public announcement · attempts, mostly blocked".
  Counter stamps: "first 45 min: tens of thousands", then "millions · in under a day"
- On "every single server": "Updating WordPress won't fix it"
- On "about half": "estimate · PHP sites that show their version · W3Techs"
- On the FBI: "FBI · NSA · UK NCSC · CERT-EU"

---

## 7. What got better (plain words, for you)

1. **It sounds like a person talking.** The "two steps… you'd think… right?… nobody did" setup, the "Except," reveal,
   "quietly" and the stacked short sentences are gone. It's nine relaxed sentences joined with "because", "but", "so" and
   "plus", the way you'd tell it over dinner.
2. **It's accurate.** Five things in the old script were wrong or misleading: "four countries" (at least eight), "nobody
   found it for fourteen years" (PHP spotted the weak spot in 2024), "the details leaked hours before" (word got out about
   a day before, without the technical details), "22 million copies" (one firm's estimate, counted differently), and "one
   in three" (closer to half). The "hosting company" ending was cut because it left out the real fix.
3. **People know why to care in the first breath.** The old script never said what the bug does. Now the opening says
   anyone could take over a site without a password.
4. **The "oh, I get it" moment is clear.** A fix being out doesn't mean sites are fixed. Someone has to actually install
   it on every server, hackers moved in minutes, and about half of PHP sites don't even get the official fix. That's why
   switching off made sense.
5. **The ending lands and loops.** The FBI's real advice ("if you can't update yet, just turn it off") carries the one
   joke as an aside. Then "and that's pretty much what those governments already did" runs straight back into the
   opening line.
6. **It's tighter.** 170 words instead of 226, so about 54 s with the recorded voice instead of 78 s.
7. **The engagement hooks are subtle and true.** The "language everyone loves" bait, the forty-five-minutes fact people
   will quote, and a loop line, with no asking for comments or follows.

---

## 8. Verification this pass, and publish-day checks

WebSearch worked. Every direct page fetch failed DNS (`ENOTFOUND` for thenextweb.com, wiz.io, php.net and
officechai.com), so everything below rests on search extracts, not full page reads.

- **Countries and timing:** NL, DE, FR, BE and FI suspended sites on Oct 21 (TechRepublic, AP), and UK councils and the
  Met Police too (Insurance Business). Valtori (FI) started taking sites down in the early afternoon local time, and the
  French Interior Ministry stayed offline "until the patch published at 4 p.m.". Both went dark before the fix
  (14:00 UTC), and so before the FBI's advice, which supports "already did".
- **FBI wording:** confirmed via AP syndication ("If an immediate update is not feasible it is recommended that
  organizations take the system offline until it can be fully mitigated"). The NSA and UK NCSC said the same, and so did
  Japan's PM Takaichi on X (nippon.com).
- **Prince's numbers:** confirmed via search extracts (Seeking Alpha/TradingView, TNW, OfficeChai, BigGo): thousands in the
  10 h before the announcement, tens of thousands in the 45 min after, hundreds of thousands within 2 h, and millions
  when he posted. Outlets date the post differently (late Wed or early Thu), which is why the voice says "and then
  millions" with no time on it. **Open his X post before you lock the edit.**
- **Leak:** the CVE IDs leaked on Oct 20, according to Infosecurity Magazine. The sources disagree on whether the plan was
  Oct 21 or Oct 22, but "a day early" means a day before the fix, which holds either way. Attempts came before the
  patches (SecurityWeek, and the Oct 17 attempt via AWS/TechRadar).
- **Researchers and AI:** Calif warned PHP on Aug 11, and the fix work stayed secret (Boston Globe, Wiz via search).
  Affected code goes back to PHP 5.4, released 2012. The 2024 audit flagged the weak spot without proving it.
- **About seven in ten:** W3Techs shows 70.3% on Aug 22 2026, of sites whose server language is known.
- **About half:** the W3Techs Aug 22 version split plus the 8.0/8.1 share comes to ≈ 52%, and CybelAngel finds 59% of
  internet-facing PHP hosts that show a version are on branches with no official fix. It's an estimate, so credit it on
  screen. If it isn't signed off, use "Plus more than a third of PHP sites…" (+2 words).
- **Cloudflare 1 in 5:** W3Techs shows 23.9% of all websites (Jul 2026).
- **Breach status (MOVING):** none of the organisations that went offline reports a breach, and no CISA KEV listing
  turned up as of Oct 21–23. The script makes no claim either way. Don't add a "nobody got in" line.

**On publish day:**
- "Just" holds until about Oct 28. After that, use "...shut down their own websites on purpose last week, because...".
- Re-check exploitation and breach status.
- Open in a normal browser: Prince's X post, the FBI Cyber Division post, the W3Techs PHP version page and the PHP 8.5.12
  release notes.

Sources (search extracts):
[AP via News4Jax](https://www.news4jax.com/business/2026/10/21/some-websites-go-dark-as-operators-address-an-ai-detected-flaw-in-a-web-programming-language/) ·
[AP via ClickOnDetroit](https://www.clickondetroit.com/business/2026/10/21/some-websites-go-dark-as-operators-address-an-ai-detected-flaw-in-a-web-programming-language/) ·
[Business Today](https://businesstoday.in/technology/story/critical-vulnerabilities-govt-websites-in-europe-shut-down-over-php-security-scare-fbi-issues-urgent-advisory-562935-2026-10-21) ·
[TechRepublic](https://www.techrepublic.com/article/news-critical-php-flaws-government-websites-patches-europe-emea/) ·
[Insurance Business UK](https://www.insurancebusinessmag.com/uk/news/cyber/uk-councils-and-met-police-among-sites-pulled-offline-after-ncsc-alert-594424.aspx) ·
[Pillitteri: NL/FI before patch](https://pasqualepillitteri.it/en/news/26110/php2shell-netherlands-finland-switch-off-government-sites-before-patch) ·
[Hart van Nederland](https://hartvannederland.nl/tech/nieuws/artikelen/liveblog-websites-overheid-mijnoverheid-offline-php-kwetsbaarheden) ·
[Seeking Alpha: Cloudflare millions](https://seekingalpha.com/news/4655681-php-vulnerabilities-trigger-millions-of-exploit-attempts-cloudflare-says) ·
[TNW: no confirmed break-in](https://thenextweb.com/news/php2shell-millions-exploit-attempts-no-confirmed-breaches) ·
[OfficeChai: Prince](https://officechai.com/stories/cloudflare-ceo-says-php-exploit-attempts-went-from-thousands-to-millions-within-hours-of-disclosure/) ·
[BigGo](https://finance.biggo.com/news/f8fa58bc-884f-48ec-b57e-f3155a08c73f) ·
[TechRadar: AWS Oct 17](https://www.techradar.com/pro/security/aws-says-hackers-tried-to-exploit-php-security-issues-days-before-fix-as-cloudflare-ceo-says-it-saw-a-huge-rise-in-targeted-attack-attempts) ·
[Infosecurity Magazine: leak](https://www.infosecurity-magazine.com/news/critical-php-vulnerabilities-leaked/) ·
[SecurityWeek](https://www.securityweek.com/php2shell-patches-land-as-first-exploitation-attempts-hit-sensors) ·
[Boston Globe](https://www.bostonglobe.com/2026/10/21/business/website-vulnerabilities-php-update-php2shell/) ·
[Wiz blog](https://wiz.io/blog/php2shell-php-rce) ·
[CybelAngel](https://cybelangel.com/blog/critical-php-rce-vulnerabilities-cve-2026-109618-and-cve-2026-109619/) ·
[W3Techs PHP](https://w3techs.com/technologies/details/pl-php) ·
[W3Techs Cloudflare](https://w3techs.com/technologies/details/cn-cloudflare) ·
[nippon.com: Japan PM](https://www.nippon.com/en/news/yjj2026102101249/) ·
[tech-ish: PM, NSA, FBI](https://tech-ish.com/2026/10/21/japans-pm-the-nsa-and-the-fbi-tell-websites-to-update-php-or-go-offline/)

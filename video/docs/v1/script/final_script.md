# Final script: PHP2Shell ("What's All the Fuss About?")

Locked 2026-10-24, revised the same day after the accuracy and RULE #1 review (section 9 lists every finding and what
happened to it). The base is `everyday_dinner.md`, which all three judges picked as the winner. Into it go the best
lines from `everyday_walk.md` and `everyday_narrator.md`, plus every must-fix from the human, detector and TikTok judges.
Every sentence went through RULE #1 in `CREATIVE_BRIEF.md` first: would a normal person say exactly these words to a
friend? Accuracy uses only the safe wording in `fact_sheet.md` (FS) and was re-checked this pass (section 8). The one
deliberately crafted line is the user's approved bait, "PHP, the language everyone loves".

---

## 1. Plain script (captions and timing)

Governments all over Europe just shut down a bunch of their own websites on purpose, because of this bug where hackers
could take over a site without a password. It's in PHP, the language everyone loves, and about seven out of ten websites
run on it. This bug was in there for like fourteen years before researchers using AI figured out how bad it was. They
gave the PHP people a heads-up, but word got out before the fix was ready, and hackers were already trying to use it.
Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and
millions within a day. But even with the fix out, somebody still has to install it on every single server. Plus
something like half of PHP sites run versions so old they're not officially supported anymore. Even the FBI said if you
can't update yet, just turn it off, which is basically tech support's answer to everything. And some of those
governments did it before there was even a fix.

## 2. Cued script (main script; ElevenLabs paste format per `original_annotated.md`)

The same text is saved on its own, exactly as you'd paste it, in `final_script_elevenlabs.txt`. It has 4 CAPS words (one
per beat at most, never on a number) and 1 ellipsis (the bait). Every number is spelled out and there are no questions.
THE one joke is named in its cue. Each cue is one line of 13 to 16 words: a mood, a "like you..." picture of who we're
talking to, at most one quoted word, and a "don't" where there's a trap. The back half (cues 6 to 9) says "same pace" on
purpose, because the old take sagged to 77.6 s when four cues in a row asked for slower. Compared with the plain script,
the only differences are the CAPS and the ellipsis after "PHP" (the plain script has a comma there). The words are
identical.

```
[quick and bright, a little amazed, like you just saw this, lean on "purpose"]
Governments all over Europe just shut down a bunch of their own websites on PURPOSE, because of this bug where hackers could take over a site without a password.

[deadpan, like you're stating the obvious, tiny pause after "PHP", roll right into the number]
It's in PHP… the language everyone loves, and about seven out of ten websites run on it.

[a notch quicker, easy, like filling in a friend who doesn't code, "like" tossed off]
This bug was in there for like fourteen years before researchers using AI figured out how bad it was.

[brisk and level, like you're telling them where it went sideways, no ominous drop]
They gave the PHP people a heads-up, but word got out before the fix was ready, and hackers were ALREADY trying to use it.

[brighter, like passing on something wild you read, numbers clear, no trailer build]
Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day.

[same pace, plain and clear, like it just clicked for you, lean on "still"]
But even with the fix out, somebody STILL has to install it on every single server.

[a touch more serious, same pace, like being straight with a friend, no doom, no blame]
Plus something like HALF of PHP sites run versions so old they're not officially supported anymore.

[THE one joke, advice said straight, dry half-smile like you've been there, don't sell it]
Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything.

[relaxed and warm, same pace, like an easy shrug, don't land it like a title card]
And some of those governments did it before there was even a fix.
```

**Listen for these when you render it:**
- "for like fourteen years": if the voice stresses "like" or reads it as a comparison, change it to "for about fourteen
  years" (same word count).
- "Cloudflare says that once it was announced": "that" is there so "says once" can't be heard as "said one time". The
  comma after "announced" should be a breath, not a dramatic pause.
- "and millions within a day" should sound tossed off, like the rest of the sentence, not like a trailer build.
- "just turn it off, which is basically...": the comma before "which" gives a small breath, and that's fine. If the voice
  turns it into a big comic pause, regenerate. The FBI's advice itself should sound sensible.
- Cues 6 to 9: if the read slows down after "But even with the fix out", regenerate. The timing below assumes it doesn't.
- "AI" and "PHP" should come out as letters.

## 3. Thesis, understanding shift, length

**Thesis (brief §22):** Everyone's talking about the bug that made governments switch off their own websites. What's new
is the gap between how fast hackers moved once it was public (tens of thousands of attempts in forty-five minutes) and how
slowly a fix actually reaches sites (somebody has to install it on every server, and something like half of PHP sites run
versions PHP doesn't officially support anymore). That matters because a fix being out doesn't mean the web is fixed, so
for a lot of sites, switching off really was the safe move.

**Payoff sentence (brief §9):** After watching, people will understand that a fix being out doesn't make a site safe until
somebody installs it on that site's server, while attackers start within minutes. That matters because about seven in ten
websites run on PHP and something like half of those run versions PHP doesn't officially support anymore, so updating
isn't quick, and the official advice, even the FBI's, was to switch off until you can update.

**Understanding shift (brief §10):**
- BEFORE: "Some government websites went down. Was it a hack?"
- DURING: "Wait, they turned them off themselves? And hackers were trying it within minutes?"
- AFTER: "Oh, a fix being out doesn't mean sites are fixed. Somebody has to install it on every server, and lots of sites
  run versions so old that updating is a real job, so turning them off was the safe thing to do."
- Told to a friend in two sentences: "There was this bug in the code most websites run on, and hackers started trying it
  within minutes of it going public. The fix only helps once somebody installs it on each server, so governments just
  turned their sites off until they could."

**Word count and duration:**
- **178 words** (`wc -w`), 9 sentences, 10 commas in the plain script (9 plus the ellipsis in the cued one). Sentences
  run 29 / 17 / 19 / 24 / 23 / 16 / 16 / 21 / 13 words. That's 8 more than the 170-word version, a hair over the
  ~175 target. Section 9 says where the words went and what to cut if it has to come down.
- **At 165 wpm: 64.7 s.** At 155 wpm it's 68.9 s, and at 175 wpm 61.0 s.
- **Recorded ElevenLabs voice** (rule of thumb from earlier passes: words ÷ 3.6/s, plus 0.5 s per full stop and 0.2 s per
  comma): 49.4 + 4.5 + 1.8, plus about 0.3 s for the bait ellipsis, ≈ **56 s**. The current take is 77.6 s.
- "Purpose" is word 15, which is about 4.2 s into the recorded voice ("a bunch of" pushed it back about a second). Frame 1
  has to carry the hook visually (section 6).

| Slot (brief §11) | 165 wpm | Recorded (est.) | Line |
|---|---|---|---|
| HOOK + STAKES | 0–10.5 s | 0–8.8 s | governments shut a bunch of their own sites on purpose, because hackers could take over a site |
| SCALE (bait) | 10.5–16.7 s | 8.8–14.5 s | PHP, the language everyone loves, seven out of ten websites |
| EXPLANATION | 16.7–32.4 s | 14.5–27.8 s | fourteen years; researchers using AI; heads-up, BUT word got out before the fix and hackers were already trying to use it |
| TWIST | 32.4–52.4 s | 27.8–45.2 s | tens of thousands in forty-five minutes, millions within a day; BUT somebody still has to install the fix on every server; plus something like half unsupported |
| PAYOFF + LOOP | 52.4–64.7 s | 45.2–56.0 s | even the FBI said turn it off (the joke), and some of those governments did it before there was even a fix. It loops into line 1 |

**RULE #1 sweep of the final text:** there are no em-dashes, semicolons, colons or questions, no "X. Not Y." contrasts,
no fragments, no lists of three, and none of the banned stock phrases ("quietly", "turns out", "problem is", "here's",
"the catch", "in secret", "there's no X button", "and that's..."). The connecting words are the spoken ones: because,
and, but, plus, even, which is basically. The hedges ("a bunch of", "like", "about", "something like", "basically") each
sit where a person would actually be unsure, and they're spread out instead of stacked. The pronoun flip between lines 2
and 3 is gone ("This bug was in there"), and so is the "They... they" double meaning in line 4. What's still slightly
shaped: "and millions within a day" is a trailing clause after the forty-five minutes, so it's cued flat. The last line
loops into the opening, but it adds a new fact ("before there was even a fix") instead of echoing the first line.

---

## 4. Line by line

FS = `fact_sheet.md` row. Search-extract sources are listed in section 8. "Current" means the 226-word script that was
recorded. "This pass" is the review round in section 9.

| # | Line | Job | Engagement mechanism | Source(s) | What changed vs the current script, and why |
|---|---|---|---|---|---|
| 1 | Governments all over Europe just shut down a bunch of their own websites on purpose, because of this bug where hackers could take over a site without a password. | HOOK + STAKES: a surprising act and a fear anyone gets, in one breath | **[open loop]** why would anyone do that on purpose? Line 9 answers it | FS 1–3; AP (governments "took their websites offline temporarily"); Finnish notice ("fully or partially unavailable"); Reuters factbox (DE "several sites", FR prefectures, BE foreign ministry); Insurance Business (UK councils, Met Police); FBI via AP (code can run with no login) | "Four countries" was **wrong**, since at least eight went dark. "Switched themselves off" became "shut down their own websites on purpose". "Nobody hacked them" is cut, because one European government body was reportedly breached (FS 3). The old script never said what the bug does, and now the stakes come in the first breath. **This pass:** "a bunch of" added, because "their own websites" sounded like all of them, and some went only partly dark. "Anyone" became "hackers", because full takeover was only shown on some setups (Apache with mod_php) and the exploit chain is complex. "Could" still hedges reliability |
| 2 | It's in PHP, the language everyone loves, and about seven out of ten websites run on it. | SCALE: why this is everybody's problem | **[comment bait]** user-approved irony, with the true fact in the same breath | W3Techs: 70.3% of sites whose server language is known (Aug 22 2026), about 69.3% Oct 21–23; AP ("estimated 70% of all websites"); FS 5 | "The programming language behind WordPress" is gone, and the bait replaces it. **This pass:** words unchanged (user-approved). The cue no longer says "the bait, not the joke" (editorial jargon, and an "X, not Y" itself). Non-coders now get a label on screen that PHP is code (section 6). The denominator footnote stays mandatory |
| 3 | This bug was in there for like fourteen years before researchers using AI figured out how bad it was. | EXPLANATION: how long it hid and how it got found | **["wait, seriously?"]** fourteen years | FS 7–8; affected code traced to PHP 5.4.0 (2012); the 2024 audit flagged the weak spot without proving it; Calif with OpenAI's model, Wiz with its own tool plus Google's and OpenAI's models | The "two steps… You'd think finding it is the hard part, right?" setup is cut, because it was **misleading** (PHP spotted the weak spot in 2024) and relied on a self-answered question. **This pass:** "It was in there" became "This bug was in there", because "it" at the end of line 2 means PHP and "It" here meant the bug, so on one listen it sounded like PHP was in there for fourteen years. "Some" was cut to save a word. Don't firm it up to "exactly fourteen years" or "AI found it" |
| 4 | They gave the PHP people a heads-up, but word got out before the fix was ready, and hackers were already trying to use it. | EXPLANATION, then the BUT: the plan and how it broke | **["wait, seriously?"]** "already trying to use it" | BleepingComputer, Huntress (leak Oct 20, release pulled forward to Oct 21, 14:00 UTC); CybelAngel (leaked two days before the planned disclosure); watchTowr (the leak had IDs, a score and a date, not how the flaws work); Cloudflare (thousands of attempts in the 10 h before the announcement); AWS (an attempt on Oct 17); FS 9–10 | "Quietly told the people who make PHP" is a banned stock phrase, and "a heads-up" is the everyday word. "Details leaked hours before" was **wrong twice**. **This pass:** "a day early" became "before the fix was ready", because "a day early" sounded like "a day ahead of schedule" (the leak was two days ahead of the planned disclosure) and the dates are on screen anyway. "So they could fix it first" is cut: by ear it could mean "make it the first priority", and it made "They... they" point at two different groups. "Trying it" became "trying to use it", which a non-coder gets. It stays "and", never "so", because Amazon's Oct 17 attempt came before the leak |
| 5 | Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day. | TWIST: how fast and how big | **["wait, seriously?"]** forty-five minutes, the number people will quote | Matthew Prince on X, via Seeking Alpha/TradingView, TNW, OfficeChai, BigGo and The Register (search extracts from earlier passes; the post itself couldn't be opened); FS 12; W3Techs Cloudflare 23.9% of all sites (on screen) | "Break-in attempts" became attempts, since none is a confirmed break-in. "Nobody knows yet how many got in" is cut, because the status keeps moving (FS 13). "Which protects a big chunk of the web" moved on screen. **This pass:** "and then millions" became "and millions within a day", because with no time on it a viewer could assume minutes (it was hours, and "within a day" is FS 12's safe wording that holds whichever date the post carries). It also stops being a bare trailer build. "Attempts" became "hacking attempts" (attempts at what?). "Once it was official" became "once it was announced" ("it was official" had a vague "it" and sounded like the same event as "word got out"). "Says, once" became "says that once", so captions match the audio. On screen: "Cloudflare's own count · attempts, not break-ins" |
| 6 | But even with the fix out, somebody still has to install it on every single server. | TWIST, and the understanding shift: a fix being out isn't the same as sites being fixed | none (it's the insight) | FS extra fact 5 (Automattic/Wordfence: updating WordPress doesn't fix it); PHP security team (updating PHP is the only reliable fix, per installation); Cloudflare's WAF rules described by its CTO as a stopgap; OX Security, under 1% visibly patched after 24 h (FS extra 3, optional on screen) | "So now comes step two, the slow one" went with the two-steps setup. "22 million copies of PHP" is cut as **misleading** (FS 14). **This pass:** "And the fix doesn't help until somebody actually installs it on every single server" was **false read literally**: each server is protected as soon as it's installed there, and nothing waits for the whole internet. The new line says the work that's left, per server, without saying unpatched sites had no protection at all. "But" brings back the BUT the story needs here (hackers are fast, BUT installing is slow), and "even with the fix out" makes clear a fix came out. The stress moved from "actually" to "still" |
| 7 | Plus something like half of PHP sites run versions so old they're not officially supported anymore. | TWIST: the complication, many sites are on versions PHP has stopped supporting | **["wait, seriously?"]** "something like half" | W3Techs Aug 22 2026 (of PHP sites that show their version: v8 63.1%, v7 28.9%, v5 7.9%, v4 0.1%) plus the PHP 8 sub-version split from Jun/Jul (8.0 7.0%, 8.1 17.8%) gives ≈ 52%; CybelAngel 59% of hosts that report a version (Shodan banners, hosts not sites); php.net (8.1 support ended 31 Dec 2025); FS 17 | "One in three" was **understated**, because 8.0 and 8.1 are out of support too. "For those, it's switch off or hope the hosting company sorts it out" is cut as **misleading** (FS 18). **This pass:** "about half" became "something like half", so it's heard as a rough estimate, because it's our own calculation from two W3Techs snapshots and only covers sites that reveal their version. "Are on" became "run" (one word shorter). "Officially" stays, because PHP's team posted source-only backports for 7.4, 8.0 and 8.1, and hosts and distros ship fixed builds that keep old version numbers, so an old version number doesn't mean unpatched. The on-screen credit now says all of that. If nobody signs off on the estimate, say "Plus more than a third of PHP sites run versions..." (+1 word; v7+v5+v4 alone is about 37%) |
| 8 | Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything. | PAYOFF: what it means, switching off is the official safe move. Also THE one joke | **[share trigger]** the tech-support joke | AP via ClickOnDetroit/KSAT/News4Jax and Business Today: "If an immediate update is not feasible it is recommended that organizations take the system offline until it can be fully mitigated"; NSA, UK NCSC, CERT-EU, AHA advisory (joint FBI/NSA guidance); FS 15 | "If a site can't update fast enough, the safest thing is to switch it off" was advice with nobody's name on it, and now it's the FBI's. **This pass:** "So even the FBI said" became "Even the FBI said", because "So" made it sound like the FBI said it because of the old versions, and its guidance was general and came out before the patch. "Which is basically what tech support tells you about everything" became "which is basically tech support's answer to everything", because the old wording could also be heard as "tech support tells you about [everything]", meaning keeps you informed, and then the joke is gone. "X's answer to everything" is how people say it |
| 9 | And some of those governments did it before there was even a fix. | PAYOFF close, and the loop | **[loop line]** runs straight back into line 1 | Pillitteri (NL and FI switched off before the patch); Valtori started in the early afternoon local time and expected the fix around 17:00 local; the French Interior Ministry stayed offline "until the patch published at 4 p.m."; FS 16 | **This pass:** "And that's pretty much what those governments already did" had two problems. "Already" claimed they acted before the FBI spoke, but no time for the FBI post could be found (searched again this pass), and many governments acted on their own national agency's advice anyway. And "And that's [X]" is the closer template RULE #1 flags. The new line says what's verified (some went dark before a fix existed), doesn't suggest Europe followed the FBI, and gives the loop a new fact instead of a neat echo. "Pretty much" is gone, and "basically" in line 8 is now the only hedge in the back half |

---

## 5. Two alternative opening hooks to A/B

Both are drop-in replacements for line 1. Lines 2–9 stay the same, and the loop line still works because "those
governments" has something to point back to.

**A. Stakes first ("a fear anyone gets" hook), 30 words (+1), 179 total, 65.1 s at 165 wpm, about 56.3 s recorded**
> There's this bug where hackers could take over a website without a password, and governments all over Europe just shut
> down a bunch of their own sites because of it.

- Cue: `[easy and a little conspiratorial, like you're letting a friend in on something]`
- Why test it: the first three seconds are a worry every viewer already has (someone hijacking a website), instead of a
  news event. "There's this…" is how people start telling a story. It doesn't say "on purpose", because "shut down their
  own sites because of it" already makes that clear.
- Verified: unauthenticated code execution (FBI via AP, FS attacker row), and the European shutdowns (FS 1–2, AP,
  TechRepublic, Reuters factbox).
- Visual: open on the takeover inset (a bare hand turns the flawed lock), then hard cut to S01 on "governments". Both
  shots already exist in the plan.

**B. Named countries ("that's my country" hook), 32 words (+3), 181 total, 65.8 s at 165 wpm, about 56.8 s recorded**
> Countries like the Netherlands and France just shut down a bunch of their own government websites on purpose, because
> of this bug where hackers could take over a site without a password.

- Cue: `[quick and bright, a little amazed, like you just saw this, lean on "purpose"]`
- Why test it: real place names are concrete, and viewers from those countries stop scrolling. It names two countries, not
  three, so it doesn't turn into a list of three, and "countries like" signals there were more.
- Verified: the Netherlands (Logius: MijnOverheid, Overheid.nl) and France (Interior Ministry, prefectures), per AP,
  TechRepublic, Reuters and Hart van Nederland.
- It adds about 0.8 s recorded. Don't win the words back by cutting "a bunch of", which is an accuracy hedge. If you
  need a word back, "single" in line 6 is the easiest one to lose.
- Visual: S01's pennants carry the two names as on-screen text (no flags or crests needed, keep them generic).

---

## 6. Visual impact (city / blueprint / elephant world)

**Nothing needs a different world.** The new voiceover is about 56 s against the 77.6 s take, so every scene has to be
re-timed to the new recording. Scene order changes at the end: S10 → S12 → S11, then the loop.

| Line | Scene | Verdict |
|---|---|---|
| 1 | **S01** government buildings, sun-switch, shutters | **Fits, light re-stage.** Remove the "four" pennants: use no count, or more buildings receding. Only **some** of the buildings drop their shutters, and one or two half-close (one shutter of a row), to match "a bunch of" and the partial shutdowns. The shutters slam on "shut down" and the sun is pressed on "purpose" (about 4.2 s). Frame 1 has to read "a government building switching itself off" with no title card, because "purpose" lands after the 3 s window |
| 1 | **New small inset:** takeover diagram | **New, small.** On "hackers could take over a site": a blueprint diagram where a bare hand turns the flawed lock with no key. Attackers never get into real buildings. Inset label: "no password · control of the site and its data" |
| 2 | **S02** lock close-up, then Blueprint Street, 7/10 pie | **Fits.** Drop any WordPress cue. Optional bait gag: Pip trots past while two passers-by roll their eyes on "loves" |
| 3 | **S04** (only the 14 "year" pages tearing, about 2 s) | **Partly reused.** Open on the flawed lock again for "This bug", then the pages tear. The "hard part" tower, the look to camera on "right?" and the hard stop on "did" are cut |
| 3 | **S03** two steps (find / fix) | **Cut.** The sage wrench tags for "everywhere" can move to S10 |
| 3 | **S05** master blueprint, two teams, beams | **Fits.** The ring lands on "figured out how bad it was" |
| 4 | **S06** Makers' Lane: envelope, fix being made, sheet blows in | **Fits, one change.** The sealed envelope to the elephant-stamped workshop is the heads-up. The "blind down on 'fix it first'" beat has no line now; keep the blind down as "fix still being made" and let the sheet slip out on "word got out" |
| 4 | **S07** notice board, copies on wires, clock | **Fits.** The clock no longer has to match a spoken "day"; it just shows the fix isn't ready yet (the dates are on screen). Show the figures trying locks on "already trying to use it" |
| 5 | **S08** dome, tallies, 45-min wedge, millions | **Fits, two changes.** The dome covers only about **1/5** of the skyline (the 1-in-5 fact). The Cloudflare card appears on "Cloudflare" and holds at least 1.5 s before the counter stamps come in. The counter starts at the announcement, and the last stamp reads "within a day" |
| 6 | **S10** keeper installs one lock, then pull-back to the hillside of doors | **Fits as is.** "But even with the fix out" is the fix sheet arriving at the first door; "STILL has to install it on every single server" is the pull-back to the hillside of doors that still need it |
| — | **S09** night flashlight "?" and the "step two" sunrise | **Cut.** The snail can cameo in S10 |
| 7 | **S12** old quarter, version pie, tick-skip-tick cart | **Fits, re-staged.** The pie reads **about 1/2** and carries the "rough estimate" label. Optional: a few old-quarter doors carry a small tag from a caretaker (the host patching old versions), which matches the on-screen caveat. It now comes before S11, so its entry and exit transitions need re-blocking |
| 8 | **S11** progress bar crawls, sun pressed, shutter drops | **Fits.** The crawling bar is "can't update yet", and the sun-switch press is "just turn it off". Caption band: "FBI · NSA · UK NCSC · CERT-EU", with no seals or faces. "Tech support" gets a tiny Pip shrug, nothing bigger |
| 9 | **S11 hard cut to the S01 frame** on "some of those governments" | **Fits, and it becomes the ending.** On "before there was even a fix", the Makers' Lane workshop in the background still has its blind down (no fix yet) while some shutters drop. The end frame must match frame 0 (shutters up, sun mid-rise), so the loop seam is invisible and the shutters slam again on "shut down" |
| — | **S13** two-option board, caretaker, un-build | **Cut.** The S11 cut to S01 now does S13's loop job |

**On-screen text (never voiced):**
- On "bug": "PHP2Shell · two linked flaws"
- On "PHP" (**new**): "PHP · the code most websites are built with"
- On "seven out of ten" (**mandatory**): "of sites whose server language is known · W3Techs"
- On "fourteen years": "in the code since at least 2012"
- On "researchers using AI": "found with AI help · reported privately in August"
- On "word got out": "word leaked Oct 20 · fix out Oct 21"
- On "Cloudflare" (**mandatory**, because the voice never says what Cloudflare is; on "Cloudflare", held at least 1.5 s
  before the counters): "Cloudflare · sits in front of about 1 in 5 websites", then "Matthew Prince, Cloudflare CEO, on
  X · counted from the public announcement · Cloudflare's own count · attempts, not break-ins". Counter stamps: "first
  45 min: tens of thousands", then "millions · within a day"
- On "every single server": "Updating WordPress won't fix it"
- On "half" (**changed**): "Rough estimate from W3Techs data · only sites that show their version · some hosts patch old
  versions themselves"
- On the FBI: "FBI · NSA · UK NCSC · CERT-EU"
- Optional on "before there was even a fix": "most sites were back within hours to a day"

---

## 7. What got better (plain words, for you)

1. **It sounds like a person talking.** The "two steps… you'd think… right?… nobody did" setup, the "Except," reveal,
   "quietly", the stacked short sentences and the "And that's..." closer are gone. It's nine relaxed sentences joined
   with "because", "but", "plus" and "and", the way you'd tell it over dinner.
2. **It's accurate.** Five things in the old script were wrong or misleading: "four countries" (at least eight), "nobody
   found it for fourteen years" (PHP spotted the weak spot in 2024), "the details leaked hours before" (word got out
   before the fix, without the technical details), "22 million copies" (one firm's estimate, counted differently), and
   "one in three" (closer to half). This pass also fixed the fix line, which read as "the patch is useless until the
   whole internet installs it", and stopped claiming the governments acted before the FBI spoke.
3. **People know why to care in the first breath.** The old script never said what the bug does. Now the opening says
   hackers could take over a site without a password.
4. **The "oh, I get it" moment is clear.** Hackers moved within minutes, BUT even with the fix out, somebody still has to
   install it on every server, and something like half of PHP sites run versions PHP doesn't officially support anymore.
   That's why switching off made sense.
5. **The ending lands and loops.** The FBI's real advice ("if you can't update yet, just turn it off") carries the one
   joke as an aside. Then "some of those governments did it before there was even a fix" runs straight back into the
   opening line.
6. **It's tighter.** 178 words instead of 226, so about 56 s with the recorded voice instead of 78 s.
7. **The engagement hooks are subtle and true.** The "language everyone loves" bait, the forty-five-minutes fact people
   will quote, and a loop line, with no asking for comments or follows.

---

## 8. Verification this pass, and publish-day checks

WebSearch worked. Direct page fetches failed DNS again (`ENOTFOUND` for officechai.com this pass; thenextweb.com,
wiz.io, php.net and nextgov.com in earlier passes), so everything below rests on search extracts, not full page reads.

- **Countries and timing:** NL, DE, FR, BE and FI suspended sites on Oct 21 (TechRepublic, AP, Reuters factbox), and UK
  councils and the Met Police too (Insurance Business). Re-checked this pass: Dutch and Finnish government sites went
  offline as a precaution before the 14:00 UTC patch, and Valtori expected the fix around 17:00 local time
  (Pillitteri, via search). The French Interior Ministry stayed offline "until the patch published at 4 p.m.". That
  supports "some of those governments did it before there was even a fix". Finland's notice says sites were "fully or
  partially unavailable", which supports "a bunch of".
- **FBI wording:** confirmed via AP syndication and Business Today ("If an immediate update is not feasible it is
  recommended that organizations take the system offline until it can be fully mitigated"), and the AHA advisory repeats
  the joint FBI/NSA guidance. Searched again for the FBI Cyber Division post's timestamp this pass: not found (OfficeChai
  also notes it couldn't independently confirm the account). That's why "already" is gone from the last line.
- **Prince's numbers:** earlier passes confirmed them through search extracts (Seeking Alpha/TradingView, TNW, OfficeChai,
  BigGo, The Register): thousands in the 10 h before the announcement, tens of thousands in the 45 min after, hundreds of
  thousands within 2 h, and millions when he posted. This pass's searches only surfaced Cloudflare's CTO and blog
  (emergency WAF rules live for all plans from 03:02 UTC Oct 21, a "stopgap", attackers tweaking payloads, observations
  not independently verified), and the OfficeChai page couldn't be opened. Outlets date the post differently, which is
  why the voice says "within a day". **Open his X post before you lock the edit.**
- **Leak:** re-checked this pass. An anonymous post on Oct 20 named the CVEs and an Oct 22 disclosure, and PHP pulled
  the release forward to Oct 21, 14:00 UTC (BleepingComputer, Huntress, CybelAngel via search). watchTowr says the leak
  didn't include how the flaws work. "Word got out before the fix was ready" holds. Attempts came before the patches
  (Cloudflare's 10 h before the announcement, and the Oct 17 attempt via AWS).
- **Researchers and AI:** Calif warned PHP on Aug 11, and the fix work stayed confidential (Boston Globe, Wiz via
  search). Affected code goes back to PHP 5.4, released 2012. The 2024 audit flagged the weak spot without proving it.
- **About seven in ten:** W3Techs shows 70.3% on Aug 22 2026 and about 69.3% on Oct 21–23, of sites whose server
  language is known.
- **Something like half:** re-checked this pass. W3Techs Aug 22 2026, of PHP sites that show their version: v8 63.1%, v7
  28.9%, v5 7.9%, v4 0.1%. Adding the 8.0/8.1 share of PHP 8 sites (7.0% + 17.8%, from a Jun/Jul snapshot) gives ≈ 52%.
  CybelAngel finds 59% of internet-facing PHP hosts that show a version are on branches with no official fix. It's our
  estimate from two snapshots, so it's voiced as "something like half" and credited on screen with its limits. If it
  isn't signed off, use "Plus more than a third of PHP sites run versions..." (+1 word).
- **Cloudflare 1 in 5:** W3Techs shows 23.9% of all websites (Jul 2026).
- **Breach status (MOVING):** none of the organisations that went offline reports a breach, and no CISA KEV listing
  turned up as of Oct 21–23. The script makes no claim either way. Don't add a "nobody got in" line.

**On publish day:**
- "Just" holds until about Oct 28. After that, use "...shut down a bunch of their own websites on purpose last week,
  because...".
- Re-check exploitation and breach status.
- Open in a normal browser: Prince's X post, the FBI Cyber Division post (and its time), the W3Techs PHP version page and
  the PHP 8.5.12 release notes.

Sources (search extracts):
[AP via News4Jax](https://www.news4jax.com/business/2026/10/21/some-websites-go-dark-as-operators-address-an-ai-detected-flaw-in-a-web-programming-language/) ·
[AP via ClickOnDetroit](https://www.clickondetroit.com/business/2026/10/21/some-websites-go-dark-as-operators-address-an-ai-detected-flaw-in-a-web-programming-language/) ·
[Business Today](https://businesstoday.in/technology/story/critical-vulnerabilities-govt-websites-in-europe-shut-down-over-php-security-scare-fbi-issues-urgent-advisory-562935-2026-10-21) ·
[AHA advisory](https://www.aha.org/advisories/2026-10-21-critical-vulnerabilities-discovered-impacting-popular-programming-language-websites) ·
[OfficeChai: FBI and Japan PM on X](https://officechai.com/stories/japans-prime-minister-usas-fbi-take-to-x-warning-people-over-the-php-vulnerability/) ·
[TechRepublic](https://www.techrepublic.com/article/news-critical-php-flaws-government-websites-patches-europe-emea/) ·
[Insurance Business UK](https://www.insurancebusinessmag.com/uk/news/cyber/uk-councils-and-met-police-among-sites-pulled-offline-after-ncsc-alert-594424.aspx) ·
[Pillitteri: NL/FI before patch](https://pasqualepillitteri.it/en/news/26110/php2shell-netherlands-finland-switch-off-government-sites-before-patch) ·
[Hart van Nederland](https://hartvannederland.nl/tech/nieuws/artikelen/liveblog-websites-overheid-mijnoverheid-offline-php-kwetsbaarheden) ·
[Seeking Alpha: Cloudflare millions](https://seekingalpha.com/news/4655681-php-vulnerabilities-trigger-millions-of-exploit-attempts-cloudflare-says) ·
[TNW: no confirmed break-in](https://thenextweb.com/news/php2shell-millions-exploit-attempts-no-confirmed-breaches) ·
[OfficeChai: Prince](https://officechai.com/stories/cloudflare-ceo-says-php-exploit-attempts-went-from-thousands-to-millions-within-hours-of-disclosure/) ·
[BigGo](https://finance.biggo.com/news/f8fa58bc-884f-48ec-b57e-f3155a08c73f) ·
[ppc.land: Cloudflare WAF timing](https://ppc.land/cloudflare-blocks-php2shell-exploits-9-hours-before-php-flaws-went-public/) ·
[Roic: Cloudflare stopgap, not independently verified](https://www.roic.ai/news/cloudflare-deploys-emergency-waf-rules-as-critical-php-flaws-spark-global-shutdowns-10-21-2026) ·
[TechRadar: AWS Oct 17](https://www.techradar.com/pro/security/aws-says-hackers-tried-to-exploit-php-security-issues-days-before-fix-as-cloudflare-ceo-says-it-saw-a-huge-rise-in-targeted-attack-attempts) ·
[BleepingComputer: leak and early release](https://bleepingcomputer.com/news/security/php-warns-admins-of-two-critical-flaws-emergency-patches-coming-tomorrow) ·
[Huntress: leaked PHP flaws](https://huntress.com/blog/php2shell-leaked-critical-php-vulnerabilities) ·
[Infosecurity Magazine: leak](https://www.infosecurity-magazine.com/news/critical-php-vulnerabilities-leaked/) ·
[SecurityWeek](https://www.securityweek.com/php2shell-patches-land-as-first-exploitation-attempts-hit-sensors) ·
[Boston Globe](https://www.bostonglobe.com/2026/10/21/business/website-vulnerabilities-php-update-php2shell/) ·
[Wiz blog](https://wiz.io/blog/php2shell-php-rce) ·
[CybelAngel](https://cybelangel.com/blog/critical-php-rce-vulnerabilities-cve-2026-109618-and-cve-2026-109619/) ·
[W3Techs PHP](https://w3techs.com/technologies/details/pl-php) ·
[W3Techs PHP 8 history](https://w3techs.com/technologies/history_details/pl-php/8) ·
[W3Techs Cloudflare](https://w3techs.com/technologies/details/cn-cloudflare) ·
[nippon.com: Japan PM](https://www.nippon.com/en/news/yjj2026102101249/) ·
[tech-ish: PM, NSA, FBI](https://tech-ish.com/2026/10/21/japans-pm-the-nsa-and-the-fbi-tell-websites-to-update-php-or-go-offline/)

---

## 9. Review findings applied this pass

Order of priority: accuracy first, then RULE #1, then everything else, with the script kept near 175 words.

| # | Finding | What was done |
|---|---|---|
| A1 | L6 fix line false read literally ("doesn't help until... every single server") | Fixed. Now "But even with the fix out, somebody still has to install it on every single server." It's per server and doesn't say unpatched sites had no protection. Used the flow reviewer's wording (R1), which fixes the same slip and brings back the BUT. "Updating WordPress won't fix it" stays on screen |
| A2 | L7 "about half" has no denominator and implies half can't get the fix | Fixed. Voiced as an estimate ("something like half", shorter than "from what anyone can tell"), "officially" kept, on-screen credit replaced with "Rough estimate from W3Techs data · only sites that show their version · some hosts patch old versions themselves", thesis and payoff now say "versions PHP doesn't officially support anymore". Fallback "more than a third" noted |
| A3 | L1 "anyone could take over" overstates | Fixed. "Anyone" became "hackers". Kept "without a password" and dropped "even needing" to save two words |
| A4 | L1 "their own websites" sounds like all of them | Fixed. Added "a bunch of". Publish-day "last week" note kept |
| A5 | L4 "a day early" sounds like ahead of schedule | Fixed. Now "word got out before the fix was ready", with the dates kept on screen. That's two words shorter than the suggested "the day before the fix was ready" and just as true |
| A6 | L5 "and then millions" has no timeframe; one company's count | Fixed. Now "and millions within a day" (FS 12's safe wording; the suggested "a few hours later" may be too tight if the post was 10 to 13 h later). On screen: "Cloudflare's own count · attempts, not break-ins". "1 in 5" card stays mandatory |
| A7 | L8 causal "So" before the FBI | Fixed. Now "Even the FBI said...", with no "So" and no "And" (line 9 starts with "And") |
| A8 | L9 "already" unverified | Fixed. Now "And some of those governments did it before there was even a fix." FBI post time searched again, not found |
| A9 | L2 "seven out of ten" needs its denominator | No script change. Footnote kept and marked mandatory |
| A10 | L3 "fourteen years" / "researchers using AI" | No change needed beyond R4. Flagged in the table so nobody firms it up |
| R1 | L6 logic slip, missing BUT | Fixed as A1. Stress moved to STILL, and the cue rewritten |
| R2 | L8 joke can be misheard; cue says no pause but text has a comma | Fixed. "Which is basically tech support's answer to everything." Cue no longer says "no pause before 'which'" |
| R3 | L5 staccato tail, bare "attempts", vague "once it was official" | Fixed. "Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day." |
| R4 | L2 to L3 pronoun flip | Fixed. "This bug was in there..." (+1 word, not 0 as estimated) |
| R5 | L7 so-what left to the viewer | Partly done. The bolted-on "So" in L8 is gone (A7), so L7 no longer has to justify a "So". "Which makes updating a whole thing" (+5) was left out to stay near 175 words, since "not officially supported anymore" already reads as "no easy updates" to most people (old phones, old Windows). Easy to add back if length allows |
| R6 | Cues 6, 7, 9 stack up slowdowns | Fixed. Cues 6 to 9 all say "same pace" |
| R7 | L4 "fix it first", "They... they", "trying it" | Fixed. "So they could fix it first" cut, "trying it" became "trying to use it", and the cue dropped the contradictory "small dip on 'but'" |
| R8 | L9 "And that's..." template; "basically" plus "pretty much" | Fixed. New L9 (A8) has no template and no "pretty much" |
| R9 | "Cloudflare" is a cold proper noun | Kept off the voice to save five words. The "1 in 5 websites" card now appears on "Cloudflare" and holds 1.5 s before the counters |
| R10 | Non-coders aren't told PHP is code; cue jargon | Words kept. On-screen label "PHP · the code most websites are built with" added, cue rewritten as a sound ("deadpan, like you're stating the obvious, tiny pause after 'PHP', roll right into the number") |
| R11 | Cues don't match the user's format | Fixed. Every cue leads with a mood and a "like you..." picture, has at most one quoted word, and is 13 to 16 words |
| R12 | Timing and self-check out of date | Fixed. Recounted with `wc -w` (178), timing table, slot timings and RULE #1 sweep updated, and the plain captions now match the cued text word for word |

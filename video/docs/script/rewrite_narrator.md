# Rewrite: NARRATOR-FORWARD (PHP2Shell VO)

Strategy: the same verified facts, told by the brief's warm, dry-witted American friend. The writing does the voice work:
- Every sentence is something a person would actually say: subject, verb, done. No appositive tags ("PHP, the
  programming language behind…") and no classroom scaffolding.
- Warm everyday idioms where they're also accurate: "a stranger", "quietly tipped off", "Here's the catch", "It's not
  broken. It's being careful."
- A lively short-long-short rhythm: 22 sentences, mean 7.5 words, longest 16.
- **Exactly one situation-born joke**: "Your phone doesn't need an update for this one. For once." It comes from the
  story itself (for once, the emergency update is somebody else's job), it's true, it laughs at nobody affected, and it
  is not the last line.
- "PHP. The language everyone loves." stays, because the user approved it as the comment-bait irony. It's cued flat as
  bait, not played as a joke (section 3b and section 8).

Inputs: `docs/CREATIVE_BRIEF.md`, `fact_sheet.md`, `audience_and_sowhat.md`, `critique_clarity-sowhat.md`,
`critique_hook-flow.md`, `critique_voice-accuracy.md`, `original_annotated.md`, and `docs/storyboard.md` for the sets.
Every factual line uses a `fact_sheet.md` row marked accurate, accurate-with-caveat or verified, in its safe wording.
Two exceptions are labelled: the phone line (supported by a caveat inside a verified row, not a row of its own) and the
last line (**[judgment]**). Written 2026-10-24. **Verification status is at the end. My own web checks could not run.**

---

## 1. One-sentence thesis

> Everyone's talking about governments switching off their own websites, but this week's PHP flaw shows there's no
> button that updates the whole web: every server has to install the fix itself, and about half of PHP sites run
> versions PHP no longer supports. That matters because until a site is updated, "off" is the officially safe setting,
> so a site that goes dark over this is being careful, not broken.

Payoff (brief §9): *After watching, people will understand that **a fix that exists isn't a fix that's installed**,
because every server has to install it separately. That matters because **until each one does, switching off is the
official safe move**. That's why governments went dark, why a dark site this week is the careful one, and why their own
phone needs nothing.*

Tell-a-friend version (brief §10): *"A flaw in the code most websites run on can let strangers take sites over. There's
a fix, but no button to install it everywhere, so until each site does, switching off is the safe move. Your phone's
fine."*

## 2. The understanding shift

| Stage | What the viewer thinks |
|---|---|
| **BEFORE** | "Government websites went dark? Must be hackers. And if there's a bug, they'll just patch it, the way my phone does." |
| **DURING** | "Wait, they did it *on purpose*? A stranger can take over a site with no password, it's in code under seven in ten websites, attackers were trying it before the fix even existed, and there's no way to update every site at once?" |
| **AFTER** | "Oh. A fix existing isn't a fix installed. Every server installs it on its own, and about half of PHP sites are on versions PHP doesn't support. So until then, off is the safe setting. A dark site is a careful site, and for once my phone's not the one that needs updating." |

---

## 3. The script

### 3a. Plain paragraphs (for captions and timing)

Governments across Europe just switched off their own websites. On purpose.

Not a hack. A flaw that can let a stranger take over a website. No password. It's in PHP. The language everyone loves.
It runs about seven in ten websites.

AI helped researchers find the flaw, and they quietly tipped off PHP's makers. Except word leaked early, and attackers
were trying it before the fix even existed. Once it went public, Cloudflare says it saw tens of thousands of attempts in
forty-five minutes. Within a day, millions.

Here's the catch: there's no "update the internet" button. Whoever runs each server has to install the fix. And about
half of PHP sites run versions so old, PHP no longer supports them.

So the official advice, FBI included: can't update yet? Take it offline. That's what those governments did.

Your phone doesn't need an update for this one. For once. If a site you use goes dark over this, it's not broken. It's
being careful.

### 3b. Cued version (ElevenLabs paste format, per `original_annotated.md`)

It has 3 CAPS words (one per beat at most, none on numbers), 1 ellipsis and 1 question. Numbers are spelled as spoken.
The one joke is named in its cue. The bait line is cued as bait, so the voice doesn't play it as a second joke.

```
[quick, bright, a little amazed, like you just saw this; "on purpose" level, no drop]
Governments across Europe just switched off their own websites. On PURPOSE.

[easy and plain, letting a friend who doesn't code in on it; "No password" short, let it sit, don't dramatize]
Not a hack. A flaw that can let a stranger take over a website. No password.

[the bait, NOT the joke: tiny beat before "The language", deadpan and flat; don't smile, don't sell it]
It's in PHP. The language everyone loves.

[straight back to normal pace, plain fact; lean on "seven", no news-anchor weight]
It runs about seven in ten websites.

[warmer, a little quicker, the story getting going; soft and low on "quietly tipped off"]
AI helped researchers find the flaw, and they quietly tipped off PHP's makers.

[the turn: a touch lower on "Except", then level and brisk; no ominous drop]
Except word leaked early, and attackers were trying it before the fix even existed.

[quicker and brighter, each number clean; don't rush "forty-five"; "millions" plain, not sold]
Once it went public, Cloudflare says it saw tens of thousands of attempts in forty-five minutes. Within a day… millions.

[back to easy, explaining the catch like it's obvious once you hear it; plain, not a gag; stress "each"]
Here's the catch: there's no "update the internet" button. Whoever runs EACH server has to install the fix.

[a touch more serious, unhurried; stress "half", not "old"; no blame]
And about HALF of PHP sites run versions so old, PHP no longer supports them.

[brisk and plain, quoting the advice; small lift on the question, flat on the answer]
So the official advice, FBI included: can't update yet? Take it offline.

[slower, satisfied, the hook's loop closing; to the friend]
That's what those governments did.

[THE one joke: warm, dry, half-smile; tiny beat after "this one", then "For once" flat; don't sell it]
Your phone doesn't need an update for this one. For once.

[warm and reassuring, to one friend; land "careful" and stop, no trailing off]
If a site you use goes dark over this, it's not broken. It's being careful.
```

**Engagement tags (3, per the brief's engagement layer):**
- **[open loop]** "On purpose." The viewer asks "why would you do that?", and "That's what those governments did." closes it.
- **[comment bait]** "The language everyone loves." It's the user-approved irony, and the true scale fact (seven in ten,
  footnoted) follows it with nothing in between.
- **[loop line]** "It's being careful." runs straight back into "Governments across Europe just switched off their own
  websites. On purpose." ("careful" → "on purpose").

"For once" is the quotable line, but it isn't counted as bait. It's the personality beat.

**On-screen text the script relies on (never voiced):**
- "PHP2Shell · two linked flaws" on "A flaw…" (FS row 4).
- "of sites whose server language is known · W3Techs" on "seven in ten" (FS row 5).
- "Matthew Prince, Cloudflare CEO, on X · counted from the public announcement · attempts, mostly blocked" on the
  numbers (FS row 12).
- "Updating WordPress won't fix it" on "Whoever runs each server…" (FS additional fact 5).
- "estimate · PHP sites that show their version · W3Techs" on "about half" (FS row 17).
- "FBI · NSA · UK NCSC · BSI · CERT-EU" on the advice, in the caption band, with no seals or logos (FS row 15).

---

## 4. Word count and duration

- **164 words** (`wc -w`), **22 sentences**: mean 7.5 words, longest 16.
- **At 165 wpm: 59.6 s.**
- With the measured clock of the current ElevenLabs voice (`critique_voice-accuracy.md`: about 3.6 words/s, plus about
  0.5 s per full stop and about 0.2 s per comma or colon): 45.6 + 11.0 + 1.8 ≈ **58.4 s**.
- At the current take's real pace (174–178 wpm): about **55–57 s**.
- Change from the current script: 226 words / ~78 s → 164 words / under 60 s (−62 words, about −18 to −20 s).

Beat map at 165 wpm, against the brief's §11 slots:

| Slot | Brief | This script | Lines |
|---|---|---|---|
| HOOK | 0–3 s | 0–4.0 s | switched off their own websites, on purpose |
| STAKES | 3–10 s | 4.0–9.8 s | not a hack; a stranger can take over a website; no password |
| EXPLANATION | 10–30 s | 9.8–32.0 s | PHP (bait), seven in ten, AI find + quiet tip-off, the leak, attempts before the fix, tens of thousands → millions |
| TWIST | 30–45 s | 32.0–44.0 s | no "update the internet" button; each server installs it; about half on unsupported versions |
| PAYOFF | 45–55 s | 44.0–59.6 s | official advice: take it offline; that's what they did; your phone (the joke); a dark site is a careful one (loop) |

The payoff runs about 4 s past the brief's 55 s, because it carries the viewer consequence that the critiques said was
missing. Section 8 has a trim that brings the whole script to about 54 s.

---

## 5. Line table

Job tags follow brief §13: **SURPRISE** (introduces something surprising or relevant), **HOW** (explains how something
works), **EVIDENCE** (adds concrete evidence), **TWIST** (reveals a twist or complication), **CONSEQUENCE** (explains a
consequence), **PERSONALITY** (one worthwhile bit of personality or humour). The slot and BUT/SO link are in [brackets],
and engagement mechanisms are in {braces}. "FS" means `fact_sheet.md`. Times are at 165 wpm.

Visual fit: **fits** = existing sets and props; **small** = a new in-world asset or shot; **moderate** = in-world, but
it needs new design work; **departs** = leaves the city world.

| # | Line (time) | Job tag | Source(s) | Visual idea |
|---|---|---|---|---|
| 1 | "Governments across Europe just switched off their own websites." (0.0–3.3) | **SURPRISE** [HOOK] | FS rows 1–2. Reuters factbox (Oct 21), AP, NOS/Logius (NL), Valtori (FI), FR Interior Ministry, Czech Government Office, Insurance Business UK (UK councils, Met Police). "Across Europe" avoids the disputed Australia/Japan entries. "Just" is fine through Oct 25 (section 8). | S01 GovernmentPlaza as built: the sun (power glyph) is pressed on "switched" and the shutters slam. **Drop the four pennants on "four"** (no count is spoken now). **Fits.** |
| 2 | "On purpose." (3.3–4.0) | **SURPRISE** [HOOK] {open loop} | FS row 2 (voluntary and precautionary, often on the national cyber agency's advice: ANSSI, NÚKIB) | Hold on the shutter, with its "back soon" tag swinging. No hacker anywhere on screen. **Fits.** |
| 3 | "Not a hack." (4.0–5.1) | **SURPRISE** [STAKES, BUT] | FS row 3, safe form ("none of them says it was hacked"): Valtori, Belgian CCB, Logius, German digital ministry ("purely preventive"). It describes why they went dark and doesn't vouch for every server (FS row 3 caveat: Unit 42's one European case). | The S01 dive into govB's lock: the padlock is untouched and Bit sits on the cornice. **Fits.** |
| 4 | "A flaw that can let a stranger take over a website." (5.1–9.1) | **CONSEQUENCE** (the stakes) [STAKES, BECAUSE] | FS "What the bug lets an attacker do" (verified): PHP advisory/Foundation (unauthenticated remote code execution), Canadian Cyber Centre AL26-026, NSA, Wiz. Code runs as the web-server user, which means control of the site and its data. "Can let" respects the caveat that the default Apache/mod_php setup is the most exposed. On screen: "two linked flaws". | S02 lock close-up (short bolt, Bit in the lock). **Small addition:** a blueprint-diagram inset where a bare hand turns the short-bolt lock with no key and the door swings open. Keep it a diagram, so the storyboard rule that attackers never get into a real building holds. |
| 5 | "No password." (9.1–9.8) | **EVIDENCE** [STAKES] | Same row ("no password, no click from anyone") | A key icon pops beside the lock and is crossed out. **Fits / small.** |
| 6 | "It's in PHP." (9.8–10.9) | **HOW** [EXPLANATION, SO] | FS row 4 (two related bugs in PHP) | **Hard cut on "PHP"** to Blueprint Street; the elephant stamp slams under Pip. **Fits** (S02's hard cut, moved one beat later). |
| 7 | "The language everyone loves." (10.9–12.4) | **PERSONALITY** (bait, not the joke) {comment bait} | Brief, engagement layer (user-approved wording, final). It's irony, not a factual claim; line 8 carries the fact. | Pip sits on the stamp, unbothered, while one passer-by gives the blueprint a long sideways look. **Small** (a new 1-s mascot beat). |
| 8 | "It runs about seven in ten websites." (12.4–14.9) | **EVIDENCE** [EXPLANATION] | FS row 5: W3Techs 69.3% of websites whose server-side language is known (Oct 21–23 2026, top 10M sample). Footnote: "of sites whose server language is known · W3Techs". | As built: 7 of 10 plaques tick and the sun becomes the 7/10 pie. **Fits.** |
| 9 | "AI helped researchers find the flaw, and they quietly tipped off PHP's makers." (14.9–19.6) | **HOW** (sets up the BUT) [EXPLANATION, AND] | FS row 8 (two teams, both using AI models; "AI helped" because humans led): OpenAI "Patch the Planet" post, Wiz blog, Fortune, CNN, CBS, Recorded Future. FS row 9 (coordinated disclosure, accurate): OpenAI, Computer Weekly. No brand is named in the VO. "August · two teams" can go on screen. | S05, shortened: the master blueprint banner, two unbranded teams, lens beams converge (one beam can carry a small sparkle glyph for "AI"; no logos). Then S06 Makers' Lane: wax seal, envelope through the mail slot, blind down. **Fits** (the two scenes compress to about 5 s). |
| 10 | "Except word leaked early, and attackers were trying it before the fix even existed." (19.6–24.7) | **TWIST** (first complication) [BUT] | FS row 10. The CVE IDs and an exploit video leaked on Oct 20, about 18–22 h before the ~14:00 UTC Oct 21 release; PHP says no technical details leaked, so the line says "word", not "details". Stronger verified wording: attackers were trying it before the fix existed (Cloudflare CEO: thousands of attempts in the 10 h before the announcement; AWS MadPot attempt on Oct 17; AWS: public proof-of-concept exploits ~02:00 UTC Oct 21). | S07 foreground wipe on "Except"; the notice lands on the board and clones 2-4-8. **Change:** drop the clock spin on "hours" (no time is spoken now). Hooded figures rattle a few locks while the Makers' Lane blind is still down. **Small change** (the storyboard keeps hoods to S08; tally marks on the board are the fallback). |
| 11 | "Once it went public, Cloudflare says it saw tens of thousands of attempts in forty-five minutes." (24.7–30.5) | **EVIDENCE** [SO] | FS row 12: Matthew Prince on X ("tens of thousands in the 45 minutes post announcement"), quoted by The Register, TNW, Neowin, BetaNews; the post text is confirmed in `critique_voice-accuracy.md` §10. These are attempts, mostly automated and blocked, and the count is the vendor's own, so it's attributed with "says". | S08 PEAK 2 crane: tallies climb the glass and a 45-minute wedge appears. **Fact fix needed whatever script is chosen:** the dome covers about a fifth of the skyline, not most of it (FS row 11: in front of ~1 in 5 websites). |
| 12 | "Within a day, millions." (30.5–32.0) | **EVIDENCE** [SO] | FS row 12 ("millions now" was posted about 9:25 pm ET Oct 21; "within the day" is the safe wording) | Pull back to 1.0 on "millions"; the film's one sunset. **Fits.** |
| 13 | "Here's the catch: there's no 'update the internet' button." (32.0–35.3) | **TWIST** (the "ohhh") [BUT] | FS additional fact 5 (the fix has to come from whoever runs the server: host, Linux distribution, container image); FS row 18. `audience_and_sowhat.md` rung 5. | **Small addition:** Pip slaps a big round glyph-only button on the noticeboard (no text) and nothing happens. Replaces S09's night "?" beat. |
| 14 | "Whoever runs each server has to install the fix." (35.3–38.5) | **HOW** [TWIST] | FS additional fact 5; FS row 18 (updating WordPress, themes or plugins doesn't fix it: Automattic, Wordfence via secondary reports). On screen: "Updating WordPress won't fix it." | S10 PEAK 3, re-sequenced earlier: the keeper installs one lock, then the BIG MOVE pull-back reveals the hillside of ~650 identical doors with one fixed. **Fits.** |
| 15 | "And about half of PHP sites run versions so old, PHP no longer supports them." (38.5–44.0) | **TWIST + EVIDENCE** [AND → SO] | FS row 17, stronger estimate: W3Techs Oct 23, v7 26.9% + v5 7.7% + v4 0.1% = 34.7% of PHP sites, plus the also-unsupported 8.0/8.1 (≈16%), gives about half. Cross-checks: CybelAngel 59% of hosts, TechnologyChecker 45.6%. php.net supported versions (8.1 end of life 31 Dec 2025). "No longer supports", not "won't fix": PHP pushed source-only backports for 7.4/8.0/8.1, and distros and hosts ship patched builds. On screen: "estimate". Fallback: "more than a third". | S12 OldQuarter (tram wipe, door height): about half the plaques turn sepia. **Change:** the pie reads 1/2, not 1/3. Only plaques age, never the people. **Fits.** |
| 16 | "So the official advice, FBI included: can't update yet? Take it offline." (44.0–48.4) | **CONSEQUENCE** [PAYOFF, SO] | FS row 15 and "Official take-it-offline guidance": FBI Cyber Division on X (Oct 21), NSA advisory, UK NCSC, BSI, CERT-EU, Japan's PM. "FBI included" avoids implying that Europe followed the FBI; European governments acted on their own agencies' advice, mostly before the FBI's post (FS row 2). | S11 as built: govB's progress bar crawls (the snail), the sun is pressed, the shutter drops. Credits go in the caption band. **Optional moderate addition:** a loudspeaker in the square (no seals, faces or logos). |
| 17 | "That's what those governments did." (48.4–50.2) | **CONSEQUENCE** [PAYOFF] {closes the open loop} | FS row 16. Many went dark before the fix existed, which "can't update yet" covers literally. Sites came back after patching (DigiD site ~20:30 CEST, Czech site ~21:00, Oct 21). | Hard cut on "That's" to the exact S01 frame. **Fits.** |
| 18 | "Your phone doesn't need an update for this one." (50.2–53.5) | **CONSEQUENCE** (the viewer's so-what) [PAYOFF] | FS "What the bug lets an attacker do" (verified), caveat: "Visitors' own devices aren't directly attacked". FS additional fact 5: the fix is installed on the server. `audience_and_sowhat.md` rung 9 (Malwarebytes, Newsweek, Bluewin: no action needed on your own devices), which `critique_clarity-sowhat.md`'s log confirmed from search extracts. **Flag:** not its own FS row, so the fact lane should sign it off (fallback in section 8). | A passer-by on the plaza glances at a phone. Every lit window behind them wears a small "update" badge, and the phone doesn't. **Small** (a hand-held prop inside the city shot). **Don't** go to a full-screen phone close-up: that is the one place this script could **depart** from the world. |
| 19 | "For once." (53.5–54.2) | **PERSONALITY** (THE one joke) | No factual claim. Situation-born: everyone's phone nags them about updates, and this time the update is somebody else's job. Nobody affected is the butt of it. | Pip, on his bollard, glances at the phone and gives the smallest approving nod. Hold, no extra gag. **Small.** |
| 20 | "If a site you use goes dark over this, it's not broken." (54.2–58.5) | **CONSEQUENCE** [PAYOFF] | **[judgment]**, inferred from FS rows 2, 3 and 15 and FS "Real human consequences" (DigiD and MijnOverheid, French prefecture sites, Finland's library search, Japanese manga apps; all precautionary, mostly back within hours to a day). "Over this" scopes it to this flaw, so it doesn't claim that every outage is PHP. | Push in on one ordinary shuttered building (a shop or library, generic sign) with its "back soon" tag. **Fits.** |
| 21 | "It's being careful." (58.5–59.6) | **CONSEQUENCE** [PAYOFF] {loop line} | Same as line 20 | S13's un-build straight to frame 0 (S01 linework, sun with its power glyph), so "careful" runs into "Governments across Europe just switched off…". The caretaker/"hope" board pane is dropped. **Fits.** |

**What the new script asks of the visual world, summed up:**
- **Nothing leaves the city.** The one risk is line 18: keep the phone as a small prop in a street shot. A full-screen
  phone close-up would be the only real departure.
- **New small in-world assets:** the no-key lock diagram (4), Pip's "everyone loves" beat (7), the glyph button that
  does nothing (13), the passer-by's phone without a badge (18–19). The loudspeaker for line 16 is optional.
- **Storyboard beats this script no longer uses:**
  - S03–S04: the two-step stoop, Pip's look to camera on "right?" and the 14 year pages (about 10.7 s on the v1
    timeline). This is the biggest re-staging.
  - S09: the night "?" flashlight and "step two" ledge (the snail survives in S11).
  - S13's board finale (the caretaker pane on "hope").
  - The S07 clock spin on "hours".
- **Fact fixes the art needs anyway:**
  - The dome covers about 1/5 of the skyline.
  - The old-versions pie reads 1/2.
  - No "four" pennant count in S01.

---

## 6. What I cut from the current script, and why

| Current wording | What happened | Why |
|---|---|---|
| "Government websites in **four countries** just switched **themselves** off." | → "Governments across Europe just switched off their own websites. On purpose." | "Four" is wrong: at least eight (FS row 1). "Themselves" sounds like a malfunction, but the surprise is that governments chose to do it. "On purpose" opens the loop the ending closes. |
| "Nobody hacked them." | → "Not a hack." | It's the same reversal at 4 s. But the old line vouched for every server, and Unit 42 describes one breached European government body (FS row 3). It was also the first of three "nobody"s. |
| "They were **fixing** a security bug in PHP" | → "A flaw that can let a stranger take over a website. No password. It's in PHP." | Many governments went dark *before* the fix existed (FS rows 4 and 16). "A security bug" never said what was at stake. Now the danger is stated by 10 s (brief §11 stakes slot). |
| "the programming language **behind WordPress**" | cut from the VO; WordPress moves to on-screen text ("Updating WordPress won't fix it") | Weak anchor for 18–40s (the user's own note). It adds no scale, since WordPress is a subset of the seven in ten, and it plants the wrong fix. It also used the news-copy appositive the voice critique flagged. |
| "about 7 out of 10 websites" | → "It runs about seven in ten websites." (its own sentence, right after the bait) | It lands as a fact instead of trailing off a clause. Written as spoken. Denominator footnoted (FS row 5). |
| "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere." | cut | School-presentation narration (brief §14–17). "Fix it everywhere" blurred *making* the fix with *installing* it, which is the one distinction the payoff needs. It now arrives once, concretely, as "no 'update the internet' button". |
| "You'd think finding it is the hard part, right?" | cut | Thinking aloud (mistake 6), and the reversal it promised never came. |
| "And for 14 years, nobody did." (the old named joke) | cut; the one joke is now "For once." | Misleading: PHP's own team spotted the weak spot in 2024 and it was flagged in 2020 (FS row 7). The joke also had no turn, because the punchline confirmed its setup. The new joke is true, comes from the situation and is at nobody's expense. |
| "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew." | → "AI helped researchers find the flaw, and they quietly tipped off PHP's makers." | 29 words → 13. "AI helped" is accurate, because humans led (FS row 8). "In August" and "two teams" can go on screen. "Quietly" (the warmest word in the old script) stays, and "tipped off" is the natural American verb. "Quietly" plus "Except" already carry "before anyone else knew". |
| "Except, the details of the bug leaked online **hours** before the fix came out." | → "Except word leaked early, and attackers were trying it before the fix even existed." | PHP says no technical details leaked, and the gap was about a day, not hours (FS row 10). The replacement adds the verified consequence: attackers were already trying it. |
| "Cloudflare, **which protects a big chunk of the web**, says it saw tens of thousands of **break-in** attempts in 45 minutes, and millions **by evening**." | → "Once it went public, Cloudflare says it saw tens of thousands of attempts in forty-five minutes. Within a day, millions." | The vendor-boilerplate clause is gone (the 1/5 dome shows Cloudflare's reach). The 45 minutes now have an anchor (after the announcement). "Attempts", not "break-ins" (they were mostly blocked). "Within a day", not a US-centric "by evening" (FS row 12). Two sentences, so "millions" gets its own beat. |
| "Nobody knows yet how many got in." | cut | A MOVING claim (FS row 13), the third "nobody", and a thread the script never closed. "Attempts" already avoids implying success. It's the first thing to restore if time allows (section 8). |
| "So now comes step two, the slow one." | → "Here's the catch:" | A fake SO, signposting a frame that's gone. "The slow one" also contradicted "fourteen years". "Here's the catch" is the real BUT, said the way a friend says it. |
| "Someone has to install that fix on every site, and there are about **22 million copies of PHP** out there that could be hit." | → "there's no 'update the internet' button. Whoever runs each server has to install the fix." | "Someone" was vague, and "server" is right, because a WordPress owner on shared hosting can't install PHP. "22 million copies" was the wrong unit and one vendor's exposure estimate (FS row 14: other counts run 2M–41M). It also blurred with the "millions" of attempts said 10 s earlier. |
| "If a site can't update fast enough, the safest thing is to switch it off until it can." | → "So the official advice, FBI included: can't update yet? Take it offline." | Same meaning, but it's now attributed: it was official advice, not the narrator's opinion (FS row 15). Being attributed makes it more credible and more of a "wait, seriously?". |
| "That's what those government sites did." | kept as "That's what those governments did." | The best structural moment in the old script (it closes the hook's loop). Sites don't decide; governments do. |
| "And **one in three** sites on PHP runs a version so old that the people who make PHP **don't fix it anymore**." | → "And about half of PHP sites run versions so old, PHP no longer supports them." **Moved before the advice.** | It was understated (FS row 17: about half, as an estimate). "Don't fix it" ignores the source-only backports. Coming after the loop had closed, it was an afterthought. Now it's part of the twist, so "take it offline" answers both the speed problem and the old-version problem. |
| "For those, it's switch off or hope the hosting company sorts it out." | cut; replaced by the viewer's so-what (phone line, joke, "it's being careful") | It was a shrug ending (brief §9, mistake 8) and a false either/or that left out upgrading (FS row 18). It also slighted hosts that are shipping backports, "hosting company" was never explained, "sorts it out" is British, not American, and it spoke only to site operators. |

**Kept from the current script:**
- the 0–4 s switch-off reversal;
- "quietly";
- the "Except" turn;
- Cloudflare's speed numbers (now with their anchors);
- the plain "take it offline" register;
- "That's what those governments did";
- the old-versions fact (now correct and in the right place);
- a loop back to the opening.

---

## 7. Why this reads as narrator-forward, line by line

- **Contractions and everyday verbs:** it's, doesn't, can't, that's, here's; "tipped off", "take over", "goes dark".
- **Connectors a friend uses, not a newsreader:** "Except", "Here's the catch", "So". Every transition is a BUT or a SO
  except line 9's setup AND (BUT/SO chain: on purpose → BECAUSE a flaw lets a stranger in → it's in code under seven in
  ten sites → found quietly → BUT word leaked → SO attackers piled in → BUT there's no update button → AND half run
  unsupported versions → SO take it offline → SO that's what they did → SO, for you: your phone's fine, and a dark site
  is a careful one).
- **Rhythm:** short punches only where a beat is intended ("On purpose." / "Not a hack." / "No password." / "For
  once." / "It's being careful."), between 12–16-word explaining sentences. No sentence is over 16 words.
- **One joke, placed where a friend would make it:** after the serious part is done, aimed at the viewer's own phone,
  with the real takeaway after it, so the ending isn't a punchline.
- **The narrator never thinks aloud** and never says "I". The personality is in word choice and timing, so it doesn't
  carry the story (mistake 5).

---

## 8. Options and flags for the editor

- **To get to about 54 s (−17 words):** drop "AI helped researchers find the flaw, and they quietly tipped off PHP's
  makers." and change "Except word leaked early, and…" to "Worse, attackers were trying it before the fix even
  existed." That gives 147 words ≈ 53.5 s at 165 wpm, but it loses the AI angle the news led with (which this audience cares about)
  and the "quietly … Except" tension. Second trim, if needed: "versions so old, PHP no longer supports them" →
  "versions PHP no longer supports" (−3).
- **If the fact lane won't sign off the phone line**, or the editor prefers the team's other strong joke:
  1. Cut "Your phone doesn't need an update for this one. For once."
  2. Make the advice line "So the official Plan B, FBI included, was the oldest line in tech support: turn it off."
     (the line from `critique_voice-accuracy.md` §4, used in `rewrite_payoff-first.md`).

  Either way there is still exactly one joke. That version is 158 words ≈ 57.5 s.
- **If the editor counts "The language everyone loves." as the one joke:** it's user-mandated, so keep it, and cut only
  "For once." (−2 words). "Your phone doesn't need an update for this one." still works as a plain consequence line.
- **If 2 s are free:** after "Within a day… millions.", add "How many got in? Nobody knows yet." (FS row 13: MOVING, so
  re-check on publish day). It would be the script's second question, so cue it as an honest shrug.
- **If "about half" isn't signed off:** "And more than a third of PHP sites run versions so old, PHP no longer supports
  them." (FS row 17, conservative).
- **The user's literal "most popular" option (flagged):** "It's in PHP. The most popular programming language in the
  world." **Risk:** false by every mainstream ranking (TIOBE Oct 2026: Python first, PHP around 12th; Stack Overflow
  2025: JavaScript; Octoverse 2025: TypeScript), so the top comment is likely a correction we'd lose. The closest true
  wording is "the most-used language for running websites" (W3Techs ~69% vs a runner-up of ~8%). This script uses the
  approved "The language everyone loves."
- **Hook freshness:** "just" holds through Sun Oct 25. After that, use "Governments across Europe switched off their
  own websites last week."
- **Re-check on publish day (MOVING):** the country spread behind "across Europe"; the attack counts; any confirmed
  break-ins (which would not change "Not a hack", since that line describes the switch-offs only); W3Techs' current PHP
  share and version split.

---

## Verification status (this pass, 2026-10-24)

My own checks **could not run**:
- WebSearch returned "this turn's web search budget is used up" (a per-turn limit shared by every agent in the
  workflow).
- WebFetch failed on DNS (ENOTFOUND) for `w3techs.com`, `www.php.net` and `www.malwarebytes.com`, the same failure the
  earlier passes logged.

So **every claim above rests on `fact_sheet.md`** (and its URL list in `sources.md`) plus the search extracts logged in
the three critiques and the two earlier rewrites. Among those, the logs confirm:
- the Prince X post text;
- the Reuters factbox countries;
- the FBI/NSA/CERT-EU take-offline advice;
- no official releases for 7.4/8.0/8.1;
- updating WordPress doesn't fix it;
- no action needed on viewers' own devices;
- the W3Techs shares (Jul–Aug 2026 snapshots).

Before lock, open the primary pages from a normal browser, especially W3Techs (the seven in ten and the version split
behind "about half"), the Cloudflare CEO's post, the FBI post and the source for the phone line.

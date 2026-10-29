# Rewrite: TWIST-DRIVEN ("Wait, they did it on purpose?")

Strategy: open on the most counter-intuitive verified fact, which is that **governments switched off their own websites,
on purpose**. Then climb a **ladder of reversals**. Each answer the viewer gets breaks the assumption they just made,
and the last rung explains the opening. Every rung is a verified fact; there's no artificial suspense. The order:
not a hack → a stranger could walk in → it's in code under seven in ten websites → the secret fix leaked →
attackers got there before the fix → the fix came out and attempts *went up* → the fix can't be pushed to every site →
half of PHP sites don't even get an official one → so the official advice was "take it offline" → which is exactly
what the governments in the first line did.

How this differs from `rewrite_payoff-first.md`: the stakes land by **10 s**, not 16 s. It keeps the AI angle (the news
led with it), using it to set up the one joke. It turns "the fix came out" into a twist of its own, because attempts
climbed after the release. Its single joke is a different one ("the internet's bad at secrets", not the tech-support
line). And it ends on the closure line, which matches the storyboard's existing hard cut back to the S01 frame.

Inputs: `CREATIVE_BRIEF.md`, `fact_sheet.md` (FS), `audience_and_sowhat.md`, `critique_hook-flow.md`,
`critique_clarity-sowhat.md`, `critique_voice-accuracy.md`, `original_annotated.md`, `sources.md`, `storyboard.md`
(scene IDs). Every spoken claim is one the fact sheet marks **accurate** or **accurate-with-caveat** (or lists as a
verified fact), and each uses the fact sheet's safe wording. **I couldn't re-verify anything independently in this pass**
(see the verification log at the end).

---

## 1. One-sentence thesis

> Everyone's talking about governments switching off their own websites, but the PHP2Shell story reveals that **a fix
> existing isn't a fix installed**: word leaked before the fix, attackers piled in within minutes, and every server has
> to install the fix itself (about half of PHP sites run versions PHP no longer releases fixes for). That matters
> because until a site is updated, **"off" is the officially recommended safe setting**, which is exactly why those
> governments went dark.

Payoff (brief §9): *After watching this, people will understand that **a flaw in the code under most websites can't be
fixed with one button**, because each server has to install the fix itself, and that matters because **until it does,
switching the site off is the official safe move**. That's why governments did it.*

Tell-a-friend version (brief §10): *"A flaw in the code under most websites let strangers take sites over. Attackers
were on it before the fix even came out, and there's no way to install the fix everywhere at once, so the official
advice was literally 'switch it off'. That's why governments did."*

## 2. The understanding shift

| Stage | What the viewer thinks |
|---|---|
| **BEFORE** | "Government websites went down? Must be a hack. And if there's a bug, they'll patch it, like my phone does." |
| **DURING** | "Wait, they switched them off *on purpose*? A stranger could take over a site with no password, in code under seven in ten websites? Attackers were trying it before the fix existed, and when the fix came out it got *worse*?" |
| **AFTER** | "Oh. The fix doesn't install itself. Every server has to do it, and about half of PHP sites don't even get an official one. Until they're updated, off is the safe setting. That's why governments went dark, and that's what the experts told everyone to do." |

### The twist ladder (what makes this version twist-driven)

| t (165 wpm) | What the viewer assumes | The verified reversal |
|---|---|---|
| 0–4 s | Sites going dark = a crash or an attack | "On purpose." |
| 4–6 s | Then they were hacked | "Not a hack." |
| 5–10 s | So the danger is abstract | "A stranger can take over a website. No password." |
| 10–15 s | Some niche code | "It runs about seven in ten websites." |
| 15–22 s | AI found it, PHP fixed it quietly, the system worked | "But the internet's bad at secrets." |
| 22–28 s | Attackers need the fix to know where to look | They were trying it **before the fix existed** |
| 28–35 s | Fix is out, so things calm down | Attempts hit **tens of thousands in 45 minutes, millions in a day** |
| 35–47 s | So everyone just installs it | No "update the internet" button, and **about half** of PHP sites get no official fix |
| 47–53 s | (the opening puzzle, still open) | Official advice: can't update yet? Take it offline. **That's what those governments did.** |

The hook's open loop ("why would you switch off your own website?") stays open the whole way and closes on the last
line. Then the video loops back to its first frame.

---

## 3. The script

### 3a. Plain text (captions and timing)

Governments across Europe switched off their own websites this week. On purpose.

Not a hack. A flaw that can let a stranger take over a website. No password. It's in PHP. The language everyone loves.
It runs about seven in ten websites.

AI helped researchers find the flaw, and PHP built a fix in secret. But the internet's bad at secrets. Word leaked a day
early, and attackers were trying it before the fix even existed.

Then the fix came out, and Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes. Within a day,
millions.

Problem is, there's no "update the internet" button. Whoever runs each server has to install it. And about half of PHP
sites run versions so old, PHP no longer releases fixes for them.

So the official advice, FBI included: can't update yet? Take it offline. That's what those governments did.

### 3b. Cued version (ElevenLabs paste format, per `original_annotated.md`)

It has 4 CAPS words, 1 ellipsis and 1 question, and every number is spelled out. The ONE joke is named in its cue. "The
language everyone loves" is cued as bait, played flat, not as a second joke.

```
[quick, bright, a little amazed, like you just saw this; land "on purpose" flat, no drop]
Governments across Europe switched off their own websites this week. On PURPOSE.

[easy and level, letting a friend who doesn't code in on it; let "No password" sit]
Not a hack. A flaw that can let a stranger take over a website. No password.

[brisk on "It's in PHP", tiny beat, then deadpan and flat; the bait, not a joke; don't smile]
It's in PHP. The language everyone loves.

[straight back to plain fact, normal pace; the irony lands by contrast; lean on "seven"]
It runs about seven in ten websites.

[a little quicker, the story getting going; soft, almost conspiratorial on "in secret"]
AI helped researchers find the flaw, and PHP built a fix in secret.

[dry, half-smile, THE one joke; say it straight and move on; don't sell it]
But the internet's bad at secrets.

[lower and steadier, the turn; no news-anchor drop; stress "before"]
Word leaked a day early, and attackers were trying it BEFORE the fix even existed.

[quicker and brighter, each number clear; don't rush "forty-five"]
Then the fix came out, and Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes.

[small beat after "day", then land "millions" plainly; don't sell it]
Within a day… millions.

[back to easy, explaining the catch to a friend; small smile on "update the internet"; stress "each"]
Problem is, there's no "update the internet" button. Whoever runs EACH server has to install it.

[a touch more serious, unhurried; stress "half", not "old"; no doom]
And about HALF of PHP sites run versions so old, PHP no longer releases fixes for them.

[brisk and plain, quoting the advice; the colon is the beat; no wink]
So the official advice, FBI included: can't update yet? Take it offline.

[warm, settled, the loop closing; slow a touch, land "did" and stop, no trailing off]
That's what those governments did.
```

**On-screen text the script relies on** (never voiced):
- "of sites whose server language is known · W3Techs" (on "seven in ten")
- "PHP2Shell · two linked flaws" (on "It's in PHP")
- "found with AI help · reported privately in August" (on the AI line; no company names or logos)
- "Matthew Prince, Cloudflare CEO, on X · after the public announcement · attempts, mostly blocked" (on the numbers)
- "Updating WordPress won't fix it" (on "Whoever runs each server")
- "estimate · W3Techs" (on "about half")
- "FBI · NSA · UK NCSC · CERT-EU" (on the advice; no seals, faces or logos)

---

## 4. Length

- **147 words** (`wc -w`), 19 sentences.
- **At 165 wpm: 53.5 s**, inside the 45–55 s target. (At 155 wpm it's 56.9 s; at 175 wpm, 50.4 s.)
- With the measured clock of the current ElevenLabs voice (`critique_voice-accuracy.md`: about 3.6 words/s, plus about
  0.5 s per full stop and about 0.2 s per comma or colon): 40.8 + 9.5 + 1.6 ≈ **52 s**.

| Slot (brief §11) | Brief | This script (165 wpm) |
|---|---|---|
| HOOK | 0–3 s | 0–4.4 s "…switched off their own websites this week. On purpose." |
| STAKES | 3–10 s | 4.4–10.2 s "Not a hack. A flaw that can let a stranger take over a website. No password." Scale by 15.3 s ("seven in ten websites"). |
| EXPLANATION | 10–30 s | 15.3–27.6 s: AI finds it, the fix is built in secret, the leak, attackers before the fix |
| TWIST | 30–45 s | 27.6–47.3 s: the fix came out and attempts climbed; there's no "update the internet" button; about half of PHP sites have no released fix |
| PAYOFF | 45–55 s | 47.3–53.5 s: the official advice is "take it offline"; "That's what those governments did." Then it ends and loops. |

---

## 5. Line table

Job tags follow brief §13: **SURPRISE** (introduces something surprising or relevant), **HOW** (explains how
something works), **EVIDENCE** (concrete evidence), **TWIST** (a twist or complication), **CONSEQUENCE** (explains a
consequence), **PERSONALITY** (one worthwhile bit of personality or humour). The slot and the BUT/SO link are in
[brackets]. Engagement mechanisms (brief, engagement layer) are in {braces}. FS = `fact_sheet.md`.
Times are at 165 wpm. Visual fit: **fits** (existing sets and beats), **small** (a new in-world asset), **moderate** (an
in-world asset that needs new design work). **No line needs a different world.** Scene IDs refer to `storyboard.md`.

| # | t | Line | Job tag | Source(s) | Visual idea |
|---|---|---|---|---|---|
| 1 | 0.0 | "Governments across Europe switched off their own websites this week." | **SURPRISE** [HOOK] | FS rows 1–2. Reuters factbox, Oct 21 (DE ITZBund "purely preventive"; FR prefectures "while waiting for a patch"; BE foreign ministry; NL Overheid.nl; FI Valtori; CZ); AP, Oct 21; NOS; Kaleva/Yle. "Across Europe" undercounts (UK councils, Australia, Japan) but never misstates, and it avoids the Australia entry that two critiques flag as advisory-only. "This week", not "just", per FS row 1. | S01 GovernmentPlaza: the sun is pressed and the shutters slam, building by building. **Fits.** Drop the four pennants ("four countries" is gone). |
| 2 | 3.6 | "On purpose." | **SURPRISE** [HOOK, BUT] {open loop: why would you do that? Closed by line 18} | FS row 2 (voluntary, precautionary, often on the national cyber agency's advice: ANSSI, NÚKIB, NCSC-NL) | Hold on Pip's hand still on the sun-switch. No hacker anywhere in frame. **Fits.** |
| 3 | 4.4 | "Not a hack." | **TWIST** (reversal 1) [STAKES, BUT] | FS row 3, safe form ("none of them says it was hacked"). Valtori (no exploitation attempts found); Belgian CCB (no attacks recorded); Logius (not a breach); German digital ministry ("purely preventive"). Doesn't vouch for every server (Unit 42's one European government case). | The plaza's doors are intact; a burglar silhouette pops up and gets crossed out. **Fits / small.** |
| 4 | 5.5 | "A flaw that can let a stranger take over a website." | **HOW + CONSEQUENCE** [STAKES, BECAUSE] | FS "What the bug lets an attacker do" (unauthenticated code execution as the web-server user = control of the site and its data). PHP Foundation release post (unauthenticated RCE on default Apache/mod_php); Canadian Cyber Centre AL26-026; NSA ("a direct path to the server's file system or database"). "Can let", because exploit reliability and setups vary (FS row 13). | S02 lock close-up (short bolt, Bit). Inset **diagram** on the blueprint: a bare hand turns the flawed lock with no key and the door swings open. Keep it a diagram, so the storyboard rule "attackers never get into real buildings" holds. **Small.** |
| 5 | 9.5 | "No password." | **EVIDENCE** [STAKES] | Same as line 4 ("no password, no click from anyone") | A key icon pops beside the lock and gets crossed out. **Fits.** |
| 6 | 10.2 | "It's in PHP." | **HOW** [STAKES] | FS row 4 (two linked bugs, CVE-2026-109618 and -109619; on screen: "two linked flaws") | Hard cut to S02 Blueprint Street; the elephant stamp slams under Pip. **Fits** (existing cut, moved from "the" to "PHP"). |
| 7 | 11.3 | "The language everyone loves." | **PERSONALITY** {comment bait} | Brief, engagement layer (the user's final wording). It's irony, not a factual claim; the fact follows straight away in line 8, with nothing in between (clarity critique). | Pip trots past, unbothered, while two passers-by roll their eyes. **Small** (a mascot gag beat). |
| 8 | 12.7 | "It runs about seven in ten websites." | **EVIDENCE** [STAKES, SO] {"wait, seriously?" fact} | FS row 5 (W3Techs: 69.3% of sites whose server-side language is known, Oct 21–23 2026); FS "most popular" section for the denominator. On screen: "of sites whose server language is known · W3Techs". Never "sites you use". | S02: seven of ten plaques tick; the sun becomes a 7/10 pie. **Fits.** |
| 9 | 15.3 | "AI helped researchers find the flaw, and PHP built a fix in secret." | **HOW** (sets up the expectation the next twist breaks) [EXPLANATION, AND] | FS rows 8–9 ("AI helped" rather than "AI found", because humans led; "quietly told the people who make PHP so a fix could be ready" = coordinated, confidential disclosure). OpenAI "Patch the Planet" (Oct 21); Wiz blog (Oct 21); Fortune and CNN (Oct 21); Computer Weekly (confidential fix work since August). No companies are named in narration (neutral, no brand visuals). | S05, cut down to about 2 s: two unbranded inspector teams with lens beams on the blueprint banner. Then S06 Makers' Lane: the fix is made by lamplight and the blind comes down. **Fits.** |
| 10 | 20.0 | "But the internet's bad at secrets." | **PERSONALITY** (THE one joke) + **TWIST** (reversal) [BUT] {quotable} | FS row 10 (word leaked; the CVE IDs and an exploit video circulated on Oct 20). It blames no one: the researcher firm and the anonymous poster stay unnamed (voice critique: no villains). | End of S06, **reversed**: instead of a sheet blowing *in*, one slips out under the workshop blind and tumbles down the street. **Fits** (an existing beat, flipped). |
| 11 | 22.2 | "Word leaked a day early, and attackers were trying it before the fix even existed." | **TWIST + EVIDENCE** [SO] | FS row 10's safe wording plus its stronger verified line ("attackers were already trying it before the fix existed"). Timeline: IDs leaked on the afternoon of Oct 20; release moved up to ~14:00 UTC Oct 21 (PHP 8.5.12 announcement; Daubois; Computer Weekly). Attempts before the fix: Prince on X ("thousands of attempts" in the 10 h before the announcement); AWS Security Blog (an attempt on Oct 17; public PoCs from ~02:00 UTC Oct 21). PHP says no technical details leaked, so the script says "word", not "details". | S07 noticeboard: the notice lands and clones 2-4-8. The sun clock spins **a full day** (not "hours"). Figures are already rattling doors while the workshop lamp still burns. **Fits.** |
| 12 | 27.6 | "Then the fix came out, and Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes." | **TWIST** (reversal: the fix didn't calm things down) **+ EVIDENCE** [AND THEN → escalation] | FS row 12 (attempts, not break-ins; counted from the public announcement, which came with the fix; a vendor's own figure, so it's attributed). Matthew Prince on X (x.com/eastdakota/status/2113079352682570051), quoted by The Register, TNW and TechRadar. **Don't imply the fix caused the attacks.** The sequence is factual; the script makes no claim about why. | The S07 cart (the fix) rolls out, then the S08 DomeCity crane reveal. The **dome covers about a fifth of the skyline** (FS row 11: about 1 in 5 websites). The 45-minute wedge and the tallies on the glass climb. **Fits** (the dome has to shrink whatever script is chosen). |
| 13 | 33.8 | "Within a day, millions." | **EVIDENCE** {"wait, seriously?" fact} | FS row 12 ("millions within the day"; the post came about 10–12 h after the release) | The counter spins to millions; the one sunset. **Fits.** |
| 14 | 35.3 | "Problem is, there's no 'update the internet' button." | **HOW** (the core mechanism) **+ TWIST** [BUT] {quotable / share trigger} | FS "Additional facts" #5 (the fix has to come from whoever runs the server: host, Linux distribution or container image); FS row 18 | Pip finds a big button on City Hall, presses it, and nothing happens. **Small.** (Or cut straight to line 15's pull-back.) |
| 15 | 38.2 | "Whoever runs each server has to install it." | **HOW** [SO] | FS "Additional facts" #5; Automattic and Wordfence (via Cybernews: updating WordPress, themes or plugins doesn't fix it); The Hacker News. On screen: "Updating WordPress won't fix it." | S10: the keeper installs one lock, then **BIG MOVE 2** pulls back to a hillside of about 650 identical doors with only one fixed. **Fits.** |
| 16 | 41.1 | "And about half of PHP sites run versions so old, PHP no longer releases fixes for them." | **TWIST + EVIDENCE** [AND → SO] | FS row 17's stronger estimate. W3Techs, Oct 23: v7 26.9% + v5 7.7% + v4 0.1% = 34.7% of PHP sites, plus the unsupported 8.0/8.1 at about 16% gives about half. Cross-checks: CybelAngel 59% of hosts; TechnologyChecker 45.6% of domains. php.net supported versions. "Releases" respects the nuance that PHP pushed source-only backports for 7.4/8.0/8.1 and distros and hosts ship patched builds, but PHP *released* no fix. On screen: "estimate · W3Techs". | S12: the tram wipe, then aged plaques on **about half** the doors. Change the pie from 1/3 to 1/2. **Fits.** |
| 17 | 47.3 | "So the official advice, FBI included: can't update yet? Take it offline." | **CONSEQUENCE** (the payoff, as official advice rather than the narrator's opinion) [PAYOFF, SO] | FS row 15 and "Official take it offline guidance": FBI Cyber Division on X (Oct 21: "If an immediate update is not feasible… take the system offline until it can be fully mitigated"); NSA advisory; UK NCSC; BSI; CERT-EU; Japan's PM. "FBI included" avoids implying that Europe followed the FBI; the European governments acted on their own agencies' advice, mostly before the FBI's post. | A city loudspeaker or billboard in the square, with no seals, faces or logos (**moderate**, a new asset). Then S11: govB's browser progress bar crawls and the shutter drops. **Fits.** |
| 18 | 50.5 | "That's what those governments did." | **CONSEQUENCE** (closes the hook's open loop) [PAYOFF] {loop line: runs straight back into "Governments across Europe switched off…"} | FS rows 2 and 16 (precautionary, many before the fix existed; they came back after patching: the DigiD site at ~20:30 CEST, the Czech government site at ~21:00) | S11's existing **hard cut on "That's"** to the exact S01 frame. The video loops on that frame. **Fits.** |

**Visual summary.** Everything stays in the city, blueprint, dome and elephant world, and most beats reuse existing
storyboard scenes in nearly their existing order (S01 → S02 → S05 → S06 → S07 → S08 → S10 → S12 → S11). New assets:
the takeover inset diagram (line 4), the eye-roll gag (7), the reversed "sheet slips out" beat (10), the City Hall
button (14) and the loudspeaker or billboard (17). Scenes this script no longer uses: **S03–S04** (the two-step stoop
and the 14 year pages, about 11 s), **S09** (the night stoop and the snail) and **S13** (the "hope" board finale). The
dome has to shrink to about a fifth of the skyline whichever script is chosen.

---

## 6. What I cut from the current script, and why

| Current line or phrase | What happened | Why |
|---|---|---|
| "Government websites in **four countries** just switched **themselves** off." | → "Governments across Europe switched off their own websites this week. On purpose." | "Four" is wrong: at least eight (FS row 1). "Themselves" sounds like a malfunction, but the surprise is that governments chose to do it, and "On purpose" makes that the open loop. "This week" because the event was on Oct 21. |
| "Nobody hacked them." | → "Not a hack." | Same beat and the first reversal, but it doesn't vouch for every server (FS row 3). It also frees "nobody", which the old script used three times. |
| "They were **fixing** a security bug in PHP, the programming language **behind WordPress** and about **7 out of 10** websites." | Split into a stakes beat ("A flaw that can let a stranger take over a website. No password.") and a scale beat ("It's in PHP. The language everyone loves. It runs about seven in ten websites.") | Many sites went dark **before** the fix existed (FS rows 4, 16). "Security bug" carries no stakes, and the old script never says what the flaw does. Now that's said by 10 s. WordPress has low recognition and suggests the wrong fix, so it moves to on-screen text ("Updating WordPress won't fix it"). |
| "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere." | Cut | School-presentation narration, and it blurs *making* the fix with *installing* it, the one distinction the payoff depends on. That distinction now arrives once, concretely, in lines 14–15. |
| "You'd think finding it is the hard part, right?" / "And for 14 years, nobody did." | Cut | Thinking aloud, and the joke had no turn (its punchline confirmed its setup). It was also misleading: the weak spot was flagged in 2020 and spotted by PHP's own team in 2024 (FS row 7). The one joke is now "the internet's bad at secrets", which is true and comes out of the situation. |
| "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew." (29 words) | → "AI helped researchers find the flaw, and PHP built a fix in secret." (13 words) | It keeps the AI angle the news led with and the "quiet" plan, which the twist needs, and drops the date, the team count and the five-word "people who make PHP". "AI helped" is more accurate than "AI found" (FS row 8). |
| "Except, the **details of the bug** leaked online **hours** before the fix came out." | → "But the internet's bad at secrets. Word leaked a day early, and attackers were trying it before the fix even existed." | It was misleading on *what* leaked (PHP says no technical details did) and on *when* (about a day, not hours) (FS row 10). The added fact, attackers before the fix, is the verified consequence, and it explains why governments went dark early. |
| "Cloudflare, **which protects a big chunk of the web**, says it saw … **break-in** attempts in 45 minutes, and millions **by evening**." | → "Then the fix came out, and Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes. Within a day, millions." | It drops the boilerplate clause (the dome shows Cloudflare's reach), anchors the 45 minutes to the release, says "attempts" (mostly blocked) instead of "break-in", says "within a day" instead of the US-centric "by evening", and attributes the figures to the CEO (FS rows 11–12). It's now also a twist: the fix didn't calm things down. |
| "Nobody knows yet how many got in." | Cut | The status is still MOVING (FS row 13). The danger is already carried by lines 4–5 and 11–13, and it was the third "nobody". |
| "So now comes step two, the slow one." | Cut | A fake SO pointing back to a frame that no longer exists. The real BUT ("Problem is, there's no 'update the internet' button") replaces it. |
| "**Someone** has to install that fix on every site, and there are about **22 million copies of PHP** out there that could be hit." | → "Whoever runs each server has to install it." The 22 million figure is cut from narration. | "Server" is right (a site owner on shared hosting can't install PHP). "22 million copies" is the wrong unit and a single vendor's exposure estimate (other counts run from 2M to 41M) (FS row 14), and it blurred with the "millions" of attempts. Optional attributed on-screen counter: "22.6M exposed instances · Palo Alto Networks". |
| "If a site can't update fast enough, the safest thing is to switch it off until it can." | → "So the official advice, FBI included: can't update yet? Take it offline." | Same payoff, but attributed to the official advice (FS row 15), so it's more credible, more surprising and neutral. It lands at 47 s, not 60 s. |
| "That's what those government sites did." | Kept as the last line: "That's what those governments did." | It's the best structural moment in the old script. It closes the hook's loop, and the storyboard already hard-cuts to the S01 frame on "That's". "Governments", because sites don't decide anything. |
| "And **one in three** sites on PHP runs a version so old that the people who make PHP **don't fix it anymore**." | → "And about half of PHP sites run versions so old, PHP no longer releases fixes for them." **Moved before the payoff.** | Understated (about half, FS row 17). "Don't fix it" ignores the source-only backports. And it came *after* the loop had closed. Now it's the last rung of the twist, so "take it offline" answers both the speed problem and the old-version problem. |
| "For those, it's switch off or hope the hosting company sorts it out." | Cut | A false either/or that leaves out upgrading (FS row 18), an unexplained term, a British idiom, and a shrug ending (brief mistake 8). |

Kept from the current script: the hook's shape (a switch-off, then a reversal by about 4 s), "seven in ten", the
"quiet" plan and the AI angle (compressed), the Cloudflare speed numbers (corrected), the plain "switch it off" register
of the payoff, and "That's what those governments did" as the loop-closer.

---

## 7. Alternates and swaps (not in the main script)

- **Alternative cold opens (same body):**
  - "When the fix for this flaw came out, attempts to use it went UP." This is the boldest twist-first open, and it's
    verified as a sequence (Prince: thousands in the 10 h before, tens of thousands in 45 min after, FS row 12). Risk: it
    leads with vendor-counted *attempts* instead of a human consequence, and it invites "why?", which the script can't
    answer with a sourced cause. I'd keep it as a second-take or A/B test only.
  - "This week, the safest website was a switched-off one." A paradox in under 3 s that matches official advice
    (FS row 15), but it gives away the payoff, so it suits the payoff-first lane better.
- **Stronger joke swap:** if the user prefers the tech-support line from `rewrite_payoff-first.md` ("the oldest line in
  tech support: turn it off"), swap it in for line 17 ("So the official Plan B, FBI included, was the oldest line in
  tech support: turn it off.", +5 words) and cut line 10 (−6 words). That's net −1 word, still about 53 s. Line 11 then
  opens with "But word leaked…". Don't run both jokes.
- **The 2024 twist (+15 words, about +5.5 s, pushing past 55 s):** "PHP's own team spotted the weak spot two years ago.
  They just couldn't prove it was dangerous." It's verified (FS "Additional facts" #1) and very "wait, seriously?", but
  it opens a second thread (how PHP is run), and coming right after "The language everyone loves" it starts to look like
  a second dig at PHP (voice critique). Better as a pinned comment.
- **Speed proof (+11 words):** "A day later, one scan found ninety-nine in a hundred still hadn't." This is OX Security
  (FS "Additional facts" #3), but it's version-based and contested (OX later revised to 97.5%; Melurna found 23% patched
  among sites that show their version). If it's used, the safe fallback is "A day later, most still hadn't."
- **Viewer line (+7 words):** "Your phone doesn't need anything for this." It's sourced in `audience_and_sowhat.md`
  (Malwarebytes, Newsweek, Bluewin) but **isn't a row in `fact_sheet.md`**, so the fact lane must sign it off first.
- **The user's literal "most popular" option:** "PHP, the most popular programming language in the world" is **false**
  by every mainstream ranking (Python, JavaScript or TypeScript lead; FS "most popular" section). The closest true
  wording: "the most-used language for running websites" (W3Techs: PHP 69.3% vs JavaScript 8.2%). The main script uses
  the user's final choice, "The language everyone loves", followed straight away by the fact.
- **Freshness:** if it publishes after Sunday Oct 25, change "this week" to "last week".

---

## Verification log (this pass, 2026-10-24)

- **No independent re-verification was possible in this pass.** WebSearch refused every query: "this turn's web search
  budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)". WebFetch failed on DNS
  (`ENOTFOUND`) for www.php.net, w3techs.com and www.theregister.com. A direct curl was refused by the proxy (403 on
  CONNECT). More searches would need a follow-up turn or a higher `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.
- So every claim rests on `fact_sheet.md` (built from WebSearch extracts, with two-source or primary-source rules),
  `sources.md`, and the verification logs in the three critiques and in `rewrite_payoff-first.md`. Those logs
  independently confirmed, via search extracts: Prince's X post and its numbers; the Reuters factbox country list
  (Europe; the UK and Australia appear there as advisories); the FBI and NSA "take it offline" advice; the 2024 audit
  story; the source-only backports with no releases for 7.4/8.0/8.1; updating WordPress not fixing it; CERT-EU's
  "without authentication"; and older W3Techs snapshots (70.2–70.8% in Jul–Aug 2026; v7 + v5 = 36.9% of PHP sites in
  Aug), which are consistent with "about seven in ten" and "about half".
- **Open these before lock** (the [P] sources in `sources.md`): the W3Techs PHP and version pages (the Oct 23 figures);
  Prince's X post (the "45 minutes post announcement" wording, which line 12 depends on); the AWS Security Blog post
  (Oct 17 attempt; PoCs ~02:00 UTC); the PHP 8.5.12 announcement (IDs leaked Oct 20, release moved up a day); the FBI
  Cyber Division post. Re-check the MOVING items (exploitation status, outage list) on publish day.

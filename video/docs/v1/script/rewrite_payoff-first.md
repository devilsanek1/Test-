# Rewrite: PAYOFF-FIRST ("Why can't they just install the fix?")

Strategy: start from the payoff and work backward. The video is built around one familiar question that everyone has
asked about a phone, a bank app or a laptop: **"There's a fix, so why not just install it?"** The hook plants the news
version of that question ("why would a government switch off its own websites?"), the narrator says it out loud at the
twist, and the payoff answers it and gives the viewer something to do with the answer.

Inputs: `CREATIVE_BRIEF.md`, `fact_sheet.md`, `audience_and_sowhat.md`, `critique_clarity-sowhat.md`,
`critique_hook-flow.md`, `critique_voice-accuracy.md`, `original_annotated.md`. Every claim in the script is marked
**accurate** or **accurate-with-caveat** in `fact_sheet.md` and uses its safe wording. The one exception is the last line,
which is an inference and is labeled **[judgment]**. My own verification pass is logged at the end.

---

## 1. One-sentence thesis

> Everyone's talking about governments switching off their own websites, but this week's PHP flaw shows that a fix for
> the code under most websites can't be sent out once: whoever runs each server has to install it, and about half of PHP
> sites run versions PHP no longer releases fixes for. That matters because until a site is fixed, "off" is the official
> safe setting, so a dark site this week may be the careful one.

Payoff (brief §9): *After watching this, people will understand that **a fix existing isn't the same as a fix
installed**, because there's no button that updates every website at once. That matters because **until each site
installs it, switching off is the officially recommended safe move**, which is why governments went dark and why a site
you use might too.*

Tell-a-friend version (brief §10): *"A flaw in the code most websites run on lets strangers take them over. There's a
fix, but no button to install it everywhere, so until each site does, switching off is the safe move. That's why
governments went dark."*

## 2. The understanding shift

| Stage | What the viewer thinks |
|---|---|
| **BEFORE** | "Government websites went down? Probably a hack. And if there's a bug, they'll just patch it, like my phone does." |
| **DURING** | "Wait, they switched them off *on purpose*? The flaw is in code that runs seven in ten websites, attackers were trying it before the fix even existed, and there's no way to update every site at once?" |
| **AFTER** | "Oh. A fix existing isn't a fix installed. Every server has to install it, and about half of PHP sites run versions too old to get an official one. So until then, off is the safe setting. If a site's dark this week, it might be the careful one." |

---

## 3. The script

### 3a. Plain text (for captions and timing)

Governments across Europe switched off their own websites this week. On purpose.

Not a hack. A flaw in PHP. The language everyone loves. It runs about seven in ten websites, and this flaw can let a
stranger take one over, data and all. No password.

Worse, attackers were trying it before the fix even existed. Once it went public, Cloudflare's CEO says attempts hit
tens of thousands in forty-five minutes. Within a day, millions.

So why not just install the fix? Because there's no "update the internet" button. Whoever runs each server has to
install it. And about half of PHP sites run versions so old, PHP no longer releases fixes for them.

So the official Plan B, FBI included, was the oldest line in tech support: turn it off. That's what those governments
did. If a site you use goes dark, it might just be the careful one.

### 3b. Cued version (ElevenLabs paste format, per `original_annotated.md`)

There's 1 ellipsis and 3 CAPS words, all numbers are spelled out, and only 1 question is asked, which is answered right away.

```
[quick, bright, a little amazed, like you just saw this; land "on purpose" flat, no drop]
Governments across Europe switched off their own websites this week. On PURPOSE.

[easy, matter-of-fact, letting a friend who doesn't code in on it; brisk]
Not a hack. A flaw in PHP.

[deadpan, flat, tiny beat before it; this is the bait, not a joke; don't smile, don't sell it]
The language everyone loves.

[back to normal pace, plain and level; lean on "stranger", let "No password" sit; don't dramatize]
It runs about seven in ten websites, and this flaw can let a stranger take one over, data and all. No password.

[a notch quicker, leaning in; "Worse" is the turn; no news-anchor drop]
Worse, attackers were trying it before the fix even existed.

[quicker and brighter, each number clear; don't rush "forty-five"; let "millions" land, don't sell it]
Once it went public, Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes. Within a day… millions.

[slower, genuinely asking on the viewer's behalf, the question they're already thinking; light lift on "just"]
So why not just install the fix?

[easy, like it's obvious once you hear it; small smile on "update the internet"; stress "each"]
Because there's no "update the internet" button. Whoever runs EACH server has to install it.

[a touch more serious, unhurried; stress "half", not "old"; no doom]
And about HALF of PHP sites run versions so old, PHP no longer releases fixes for them.

[dry, half-smile, THE one joke: say "Plan B" straight, the colon is the beat, "turn it off" lands flat; don't sell it]
So the official Plan B, FBI included, was the oldest line in tech support: turn it off.

[warm, settled, the loop closing; a little slower]
That's what those governments did.

[warm, reassuring, talking to one friend; land "careful one" and stop, no trailing off]
If a site you use goes dark, it might just be the careful one.
```

On-screen text the script relies on (never voiced):
- "of sites whose server language is known · W3Techs" (on "seven in ten")
- "PHP2Shell: two linked flaws" (on "A flaw in PHP")
- "Matthew Prince, Cloudflare CEO, on X · after the public announcement · attempts, mostly blocked" (on the numbers)
- "Updating WordPress won't fix it" (on "Whoever runs each server")
- "estimate · W3Techs" (on "about half")
- "FBI · NSA · UK NCSC · CERT-EU" (on "Plan B"; no seals, logos or faces)

---

## 4. Length

- **149 words** (by `wc -w`), 17 sentences.
- **At 165 wpm: 54.2 s.** That's inside the 45–55 s target.
- Using the measured clock of the current ElevenLabs voice (from `critique_voice-accuracy.md`: about 3.6 words/s, plus
  about 0.5 s per full stop and about 0.2 s per comma): 41.4 s + 8.5 s + 1.8 s ≈ **52 s**.
- Structure at 165 wpm:

| Slot (brief §11) | Brief | This script |
|---|---|---|
| HOOK | 0–3 s | 0–4.4 s "…switched off their own websites… On purpose." |
| STAKES | 3–10 s | 4.4–16.4 s "Not a hack. A flaw in PHP… take one over… No password." (the question is posed by 7 s; the danger is fully stated by 16 s) |
| EXPLANATION | 10–30 s | 16.4–26.9 s: attackers before the fix, tens of thousands, millions |
| TWIST | 30–45 s | 26.9–41.1 s: "why not just install it?", no "update the internet" button, about half on versions with no released fix |
| PAYOFF | 45–55 s | 41.1–54.2 s: official Plan B is "turn it off", that's what they did, and what that means for the viewer. Then it ends. |

---

## 5. Line table

Job tags follow brief §13: **SURPRISE** (introduces something surprising or relevant), **HOW** (explains how
something works), **EVIDENCE** (adds concrete evidence), **TWIST** (reveals a twist or complication), **CONSEQUENCE**
(explains a consequence), **PERSONALITY** (one worthwhile bit of personality or humour). The slot and the BUT/SO link
are in brackets, and engagement mechanisms (brief, engagement layer) are in braces. "FS" means `fact_sheet.md`.

Visual fit: **fits** = existing world and sets; **small** = a new in-world asset; **moderate** = an in-world asset that
needs new design work. No line needs a different world.

| # | Line | Job tag | Source(s) | Visual idea |
|---|---|---|---|---|
| 1 | "Governments across Europe switched off their own websites this week." | **SURPRISE** [HOOK] | FS rows 1–2 ("across Europe" is safe and avoids the disputed Australia/Japan count). Reuters factbox, Oct 21 (DE: ITZBund, "purely preventive"; BE: foreign ministry; FR: prefecture sites "while waiting for a patch"; NL: NCSC, Overheid.nl); NOS; Valtori; Insurance Business UK (Edinburgh, Oxford, Met Police) | GovernmentPlaza: a hand throws a big wall breaker and the browser windows go dark building by building. **Fits** (S01 set; drop the four pennants). |
| 2 | "On purpose." | **SURPRISE** [HOOK] {open loop: why would you do that?} | FS row 2 (voluntary, precautionary, often on the national cyber agency's advice) | Hold on the hand still on the switch. No hacker on screen. **Fits.** |
| 3 | "Not a hack." | **SURPRISE** [STAKES, BUT] | FS row 3, safe form ("none of them says it was hacked"). Valtori ("not due to a data breach"); German digital ministry ("purely preventive"); Belgian CCB (no attacks recorded) | The plaza's doors are intact; a burglar silhouette pops in and is crossed out. **Fits.** |
| 4 | "A flaw in PHP." | **HOW** [STAKES, BECAUSE] | FS row 4 (two linked bugs, CVE-2026-109618 and -109619; on-screen "two linked flaws") | Camera drops below the street to the elephant-stamped blueprint, where a hairline flaw glows in the lock drawing. **Fits.** |
| 5 | "The language everyone loves." | **PERSONALITY** {comment bait} | Brief, engagement layer (user-approved wording). Ironic, not a factual claim; the fact comes in the next line. | The tiny elephant mascot walks past, unbothered, while a couple of passers-by roll their eyes. **Small** (a mascot gag beat). |
| 6 | "It runs about seven in ten websites, and this flaw can let a stranger take one over, data and all." | **EVIDENCE + CONSEQUENCE** [STAKES, SO] | FS row 5 (W3Techs: 69.3% of sites whose server-side language is known, Oct 2026) and FS "What the bug lets an attacker do" (unauthenticated code execution as the web-server user = control of the site and its data). CERT-EU via SecurityWeek ("exploitation without authentication"); Reuters ("run code on a server without logging in"); Canadian Cyber Centre AL26-026 | Ten buildings, seven stamped with the elephant. Then an inset diagram on the blueprint: a bare hand turns the flawed lock with no key and the door's filing cabinet slides open. Keep it a diagram, not a real building, so the storyboard rule "attackers never get in" holds. **Small.** |
| 7 | "No password." | **EVIDENCE** [STAKES] | Same as line 6 ("no password, no click from anyone") | A key icon crossed out beside the lock. **Fits.** |
| 8 | "Worse, attackers were trying it before the fix even existed." | **TWIST** (first complication) [EXPLANATION, BUT] | FS row 10, the stronger verified wording ("attackers were already trying it before the fix existed"). Prince on X (thousands of attempts in the 10 h before the announcement); AWS, Oct 17 attempt (via TechRadar, THN, The Register). This also explains why governments went dark *before* the fix (FS row 16). | Night street: figures already rattling doors while, across the road in MakersLane, the fix is still on the workbench. **Fits.** |
| 9 | "Once it went public, Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes." | **EVIDENCE** [EXPLANATION, SO] | FS row 12 (safe wording; attempts, not break-ins; counted from the announcement; a vendor figure, so it's attributed). Matthew Prince on X (x.com/eastdakota/status/2113079352682570051), quoted by TNW, OfficeChai and TechRadar | DomeCity: the glass dome covers **about a fifth** of the skyline, and a counter on it ticks into the tens of thousands as attempts bounce off. **Fits** (shrink the dome to match the 1-in-5 fact). |
| 10 | "Within a day, millions." | **EVIDENCE** [EXPLANATION] {"wait, seriously?" fact} | FS row 12 ("millions within the day"; the post went up about 11–12 h after the release) | The counter spins to millions. **Fits.** |
| 11 | "So why not just install the fix?" | **SURPRISE** (says the episode's big familiar question out loud) [TWIST setup, SO] {open loop 2, closed by lines 12–17} | No claim | The mascot holds up the fixed blueprint page in the workshop and looks out at the city. **Fits.** |
| 12 | "Because there's no 'update the internet' button." | **HOW** [TWIST, BECAUSE] {quotable / share trigger} | FS "Additional facts" #5 (the fix has to come from whoever runs the server). Automattic and Wordfence (via Cybernews, martincid.com); The Hacker News ("what actually protects you") | The mascot searches City Hall for a master switch and finds none. The camera pulls back over a sea of separate doors. **Small** (uses the SeaOfDoors set). |
| 13 | "Whoever runs each server has to install it." | **HOW** [TWIST] | FS "Additional facts" #5; FS row 18 (hosts, distros and container images ship it; updating WordPress doesn't). On screen: "Updating WordPress won't fix it." | Locksmiths go door to door, and only a handful of doors light up "fixed". **Fits** (TerraceHill/SeaOfDoors). |
| 14 | "And about half of PHP sites run versions so old, PHP no longer releases fixes for them." | **TWIST + EVIDENCE** [TWIST, AND → SO] | FS row 17, the stronger estimate (W3Techs Oct 23: v7 + v5 + v4 = 34.7% of PHP sites, plus unsupported 8.0/8.1 ≈ 16%, so about half; CybelAngel: 59% of hosts). php.net supported versions (8.1 end of life 31 Dec 2025). BleepingComputer and ThreatLocker ("8.1 and older have no official fix"). Wording respects the nuance: source-only backports and distro builds exist, but PHP *releases* no fix. On screen: "estimate · W3Techs". | OldQuarter: about half the doors are on sepia blueprints with faded elephant stamps that the workshop no longer prints. **Fits / small.** |
| 15 | "So the official Plan B, FBI included, was the oldest line in tech support: turn it off." | **PERSONALITY + CONSEQUENCE** (the one joke, carrying the official advice) [PAYOFF, SO] {share trigger} | FS row 15 and "Official take it offline guidance" (FBI Cyber Division on X; NSA advisory; UK NCSC; BSI; CERT-EU; Japan's PM, all Oct 21). Nextgov and Defense One (NSA and FBI: if you can't update right away, take systems offline until you can). "FBI included" avoids implying Europe followed the FBI; European governments acted on their own agencies' advice (FS row 2). | A city loudspeaker or billboard in the square (no seals, faces or logos), then a big wall switch on City Hall flips. **Moderate** (the loudspeaker is new; the switch reuses line 1). |
| 16 | "That's what those governments did." | **CONSEQUENCE** (closes the hook's loop) [PAYOFF] | FS rows 2 and 16 (precautionary, many before the fix existed; sites came back after patching) | Same framing as line 1. Then one window relights behind a new lock, the "and on again". **Fits.** |
| 17 | "If a site you use goes dark, it might just be the careful one." | **CONSEQUENCE** (the viewer's so-what) [PAYOFF] {loop line: "careful one" runs into "Governments… switched off… on purpose"} | **[judgment]**: an inference from FS rows 2, 3 and 15 (sites went dark as a documented precaution, on official advice). The Reuters factbox and FS "Real human consequences" show it wasn't only governments (hospitals, Port of Rotterdam, KNVB, Japanese manga apps). It's worded as "might" because not every outage is PHP. | A passer-by stops at a darkened shop window with a small "back soon" sign. Behind it, a few lit buildings with aged plaques are still open. The last frame matches the first for the loop. **Small.** |

**Visual departures, summed up:** nothing leaves the city, blueprint, dome and elephant world. New assets: the mascot
eye-roll gag (5), the "flawed lock" inset diagram (6), the master-switch hunt (12), the loudspeaker or billboard (15)
and the "back soon" window (17). Storyboard beats that this script no longer uses and that need re-staging: **S03–S04,
the two-step stoop and the 14 year pages** (about 12 s), **the S05 AI sparkle tablets** and **the S07 leak board**. The
dome must shrink to about a fifth of the skyline whatever script is chosen.

---

## 6. What I cut from the current script, and why

| Current line or phrase | What happened | Why |
|---|---|---|
| "Government websites in **four countries** just switched **themselves** off." | → "Governments across Europe switched off their own websites this week. On purpose." | "Four" is wrong (at least eight; FS row 1). "Themselves" sounds like a malfunction, but the surprise is that governments did it deliberately. "Across Europe" can't be misread, and it sidesteps the disputed Australia entry (both critiques flag Australia as advisory-only in the Reuters factbox). |
| "Nobody hacked them." | → "Not a hack." | Same beat, but it doesn't vouch for every server (FS row 3; Unit 42's one European government case). |
| "They were **fixing** a security bug in PHP" | → "A flaw in PHP" + the takeover line | Many went dark *before* the fix existed (FS rows 4, 16). "Security bug" carries no stakes, and the old script never says what the flaw does. Line 6 does. |
| "the programming language **behind WordPress**" | Cut. WordPress moves to on-screen text ("Updating WordPress won't fix it"). | Low recognition for 18–40s, adds no scale, and suggests the wrong fix. The user-approved bait plus "seven in ten" does the job. |
| "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere." | Cut | School-presentation narration. It blurs *making* the fix with *installing* it, which is the one distinction this script is built on. It now arrives once, concretely, at line 12. |
| "You'd think finding it is the hard part, right?" | Cut | Thinking aloud, and it asks for an intuition the viewer doesn't have. The script's one question is now one the viewer actually has ("why not just install it?"). |
| "And for 14 years, nobody did." (the old joke) | Cut | Misleading: the weak spot was flagged in 2020 and noticed by PHP's own team in 2024 (FS row 7). The joke also had no turn, and it contradicted "step two, the slow one". The one joke is now the tech-support line, which is true and comes from the situation. |
| "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP…" | Cut | It doesn't serve the question. Its only job was to set up the leak, and line 8 now states the verified consequence directly. **Cost:** this loses the angle the news led with (AI). It's a separate episode ("Is AI finding bugs faster than we can fix them?"), or a pinned-comment fact ("AI helped find it; PHP's own team had noticed the weak spot in 2024"). |
| "Except, the details of the bug leaked online **hours** before the fix came out." | → "Worse, attackers were trying it before the fix even existed." | Misleading on what leaked (PHP says no technical details did) and when (about a day, not hours) (FS row 10). The replacement is the stronger, verified fact, and it explains why governments went dark early. |
| "Cloudflare, **which protects a big chunk of the web**, says it saw… **break-in** attempts in 45 minutes, and millions **by evening**." | → "Once it went public, Cloudflare's CEO says attempts hit tens of thousands in forty-five minutes. Within a day, millions." | It drops the boilerplate (the dome shows Cloudflare's share), gives the 45 minutes an anchor, uses "attempts" rather than "break-in attempts" (they were mostly blocked), uses "within a day" rather than "by evening", and attributes the numbers to the CEO (FS row 12). |
| "Nobody knows yet how many got in." | Cut | The status is still moving (FS row 13), the danger is already carried by lines 6–10, and it was the third "nobody". |
| "So now comes step two, the slow one." | Cut | A fake SO and a signpost to a frame that no longer exists. Line 11 replaces it with the real question. |
| "Someone has to install that fix on every site" | → "Whoever runs each server has to install it." | It says who, and "server" is right (a site owner on shared hosting can't install PHP). |
| "about **22 million copies** of PHP out there that could be hit" | Cut from narration (optional attributed on-screen counter: "22.6M exposed instances · Palo Alto Networks") | Wrong unit, and a single vendor's estimate (other counts run from 2M to 41M; FS row 14). It also blurred with "millions" of attempts. |
| "If a site can't update fast enough, the safest thing is to switch it off until it can." | → "So the official Plan B, FBI included, was the oldest line in tech support: turn it off." | The same payoff, now attributed to the official advice (FS row 15), which makes it more credible and more surprising. It's also where the one joke goes. It lands at about 41 s instead of 60 s. |
| "That's what those government sites did." | Kept as "That's what those governments did." | It's the best structural moment in the old script, because it closes the hook's loop. "Governments", because sites don't decide anything. |
| "And **one in three** sites on PHP runs a version so old that the people who make PHP **don't fix it anymore**." | → "And about half of PHP sites run versions so old, PHP no longer releases fixes for them." **Moved before the payoff.** | It was understated (FS row 17: about half), "don't fix it" ignores the source-only backports, and it came *after* the loop had closed. Now it's part of the twist, and "turn it off" answers both the speed problem and the old-version problem. |
| "For those, it's switch off or hope the hosting company sorts it out." | Cut. The new ending is the viewer's so-what plus a loop line. | A false either/or that leaves out upgrading (FS row 18), a British idiom, a shrug ending (brief mistake 8), and it talks only to site operators. |

Kept from the current script: the hook's shape (a switch-off, then a reversal by 3–4 s), "seven in ten", the
Cloudflare speed numbers (now fixed), the plain "switch it off" register of the payoff, and "That's what those
governments did" as the loop-closer.

### Alternates (not in the main script)
- **Phone line** (+7 words): "Your phone doesn't need anything for this." It's sourced in `audience_and_sowhat.md` (Malwarebytes, Newsweek,
  Bluewin), but **it isn't a row in `fact_sheet.md`**, so the fact lane must sign it off first. If approved, it goes
  just before line 17.
- **Speed proof** (+12 words): "A day later, one scan found fewer than one in a hundred had." This is OX Security (0.7%). It's contested: OX
  revised to 97.5% unpatched, and Melurna found 23% patched among sites that show their version. If the fact lane wants
  it, use the fallback "A day later, most still hadn't."
- **Hook freshness:** if the video publishes after Sunday Oct 25, change "this week" to "last week".

---

## Verification log (this pass, 2026-10-24)

WebFetch failed on DNS (ENOTFOUND) for w3techs.com and thenextweb.com, as it did for the earlier passes. Everything
below rests on WebSearch result extracts. No primary page was opened directly.

- **Confirmed:** Matthew Prince's X post: thousands of attempts in the 10 h before the announcement, tens of thousands in
  the 45 min after, hundreds of thousands within 2 h, and millions at posting (x.com/eastdakota/status/2113079352682570051;
  TNW; OfficeChai; TechRadar). TNW also says officials in Germany, the Netherlands and Japan hadn't seen an attempt
  succeed.
- **Confirmed:** Reuters factbox, Oct 21 (The Star, Devdiscourse): DE ITZBund "purely preventive", BE foreign ministry
  (the CCB recorded no attacks), FR prefectures "while waiting for a patch", NL NCSC, Overheid.nl and Port of Rotterdam.
  Australia's agency appears there only as "not aware of active exploitation". So "across Europe" is the safe hook.
- **Confirmed:** Finland's Valtori took sites offline in the early afternoon while waiting for the fix, and said it was
  "not due to a data breach" (pasqualepillitteri.it summary of Yle/Kaleva). That supports "before the fix existed".
- **Confirmed:** NSA and FBI: if you can't update right away, take systems offline until you can. The UK NCSC and
  CERT-EU said similar (Nextgov, Defense One, tech-ish, Business Today).
- **Confirmed:** "PHP 8.1 and older… will get no official fix". There are source-only backports for 7.4/8.0/8.1 but no
  releases (BleepingComputer, ThreatLocker, HeroDevs/CybelAngel extracts). CybelAngel: 59% of version-reporting hosts
  are on no-fix branches.
- **Confirmed:** updating WordPress, themes or plugins doesn't fix it; the fix comes from the host, distro or container
  image (martincid.com, The Hacker News, CybelAngel).
- **Confirmed:** CERT-EU says the flaws can be exploited without authentication (SecurityWeek). Reuters: "run code on a
  server without logging in".
- **Confirmed (older snapshot):** W3Techs, 22 Aug 2026: PHP is 70.3% of sites whose server-side language is known; of
  PHP sites, v7 is 28.9% and v5 is 7.9%. That's already 36.9% before adding 8.0/8.1, which is consistent with "about
  half". The fact sheet's Oct 23 figures (69.3%; v7 26.9%, v5 7.7%) **could not be re-opened**, so check them on
  w3techs.com before lock.
- **Not re-checked (relying on FS):** the Amazon Oct 17 attempt beyond the TechRadar headline, and the 8.0/8.1 share of
  PHP 8 sites (Jul 2026).

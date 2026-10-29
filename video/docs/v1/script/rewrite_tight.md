# Rewrite: TIGHT POLISH (PHP2Shell VO)

Strategy: keep the current arc and beats (switch-off hook, two steps, 14 years, AI found it, leak, attack wave, the slow
fix, old versions), cut every wasted word, fix every accuracy and clarity problem, and end on an explicit payoff that
loops. Every claim comes from a row in `fact_sheet.md` marked accurate or accurate-with-caveat, using its safe wording.
Written 2026-10-24.

---

## 1. One-sentence thesis

Everyone's talking about governments switching off their own websites, but this week's PHP flaw shows that finding a bug
is only step one: the fix then has to be installed separately on millions of servers while attackers are already trying
it. That matters because until a site is updated, the safest setting really is off.

Payoff, in the brief's §9 format: *after watching, people will understand that a fix that exists isn't a fix that's
installed. A flaw in the code under about 7 in 10 websites gets found once but has to be fixed on millions of servers.
That matters because until each site installs the fix, going offline is the officially safest move, and that's why
government sites went dark.*

Tell-a-friend version: "A flaw in the code most websites run on let strangers take sites over. The fix is out, but every
server has to install it itself, so until it does, switching off is the safe move. That's what those governments did."

## 2. Understanding shift

| Stage | What the viewer thinks |
|---|---|
| **BEFORE** | "Government websites went dark? Must be hackers. And if there's a fix, isn't it fixed?" |
| **DURING** | "Wait, they switched them off *themselves*? The flaw sat there for fourteen years, AI helped prove it, and attackers were trying it before the fix was even out?" |
| **AFTER** | "Oh. Finding it happened once. Installing the fix has to happen on millions of servers, and about half of PHP sites run versions PHP doesn't support. Until a site's updated, off really is the safest setting. That's why they went dark." |

## 3. The script

### 3a. Plain (for captions and timing)

Governments across Europe switched off their own websites this week. On purpose.

Not a hack. A flaw that lets a stranger take over a website, no password needed. It's in PHP. The language everyone
loves. It runs about seven in ten websites.

Fixing it takes two steps: find it, then install the fix everywhere. It sat in PHP for fourteen years, until researchers
using AI proved it was dangerous and quietly told PHP.

Except… word leaked a day before the fix. Attackers were already trying it. Once it went public, Cloudflare says it saw
tens of thousands of attempts in forty-five minutes. Within a day, millions.

So step two is a race, with no "update the internet" button. Worse, about half of PHP sites run old, unsupported
versions.

The official advice, FBI included: can't update yet? Take it offline. That's what those governments did.

Step one's done. Step two has to happen millions of times. Until it does, the safest setting is… off.

### 3b. Cued (ElevenLabs format, per `original_annotated.md`)

There are 4 CAPS words, 2 ellipses and 1 question. Numbers have no CAPS. The one joke is named.

```
[quick, bright, a little amazed, like you just saw this; "on purpose" level, no drop]
Governments across Europe switched off their own websites this week. On PURPOSE.

[easy, plain, letting a friend in on it; let "no password" sit, don't dramatize]
Not a hack. A flaw that lets a stranger take over a website, no password needed.

[THE one joke: tiny beat before it, deadpan, flat; don't smile, don't sell it]
It's in PHP. The language everyone loves.

[straight back to normal pace, plain fact; lean on "seven", no news-anchor weight]
It runs about seven in ten websites.

[easy, matter-of-fact, a bit quicker; not a classroom list, no pause at the colon]
Fixing it takes two steps: find it, then install the fix everywhere.

[warming up, story moving; "fourteen years" plain, no wink; soft and low on "quietly"]
It sat in PHP for fourteen years, until researchers using AI proved it was dangerous and quietly told PHP.

[lower and slower on "Except", that's the turn; then level, no ominous drop]
Except… word leaked a day before the fix. Attackers were already trying it.

[quicker and brighter, each number clear; don't rush "forty-five"; "millions" plain, not sold]
Once it went public, Cloudflare says it saw tens of thousands of attempts in forty-five minutes. Within a day, millions.

[back to normal, explaining the catch to a friend; stress "race"; button line dry, not a gag]
So step two is a RACE, with no "update the internet" button.

[a touch more serious, unhurried; stress "half", no pity, no blame]
Worse, about HALF of PHP sites run old, unsupported versions.

[brisk and plain, quoting the advice; small lift on the question, flat on the answer]
The official advice, FBI included: can't update yet? Take it offline.

[slower, satisfied, the loop closing; warm, to the friend]
That's what those governments did.

[warm, settled, landing it; ease off on the last line, land "off" and stop, no trailing]
Step one's DONE. Step two has to happen millions of times. Until it does, the safest setting is… off.
```

**Engagement tags (3, per the brief's layer):**
- **[comment bait]**: "The language everyone loves." It's the user-approved irony. The true stakes fact (7 in 10) follows immediately.
- **[open loop]**: "On purpose." The viewer asks why, and "That's what those governments did." closes it.
- **[loop line]**: "…the safest setting is… off." The last word runs straight into "switched off their own websites."

"No 'update the internet' button" is the one memorable description (§17). It is played dry and isn't counted as bait.

## 4. Word count and duration

- **163 words, 21 sentences.** The longest sentence is 19 words; the average is 7.8.
- **≈ 59 s at 165 wpm.** About 56 s at the recorded voice's ~175 wpm. About 58 s with the voice critique's ElevenLabs
  formula (words ÷ 3.6 + 0.5 s per full stop + 0.2 s per comma or colon).
- The current script is 226 words and ~78 s, so this is −63 words and about −19 s.
- Beat map at 165 wpm, against the brief's §11 slots:

| Slot | Time | Lines |
|---|---|---|
| Hook | 0–4.4 s | "Governments across Europe switched off…" |
| Stakes | 4.4–10.2 s | "stranger… no password" |
| Explanation | 10.2–31 s | PHP / bait / 7 in 10, two steps, 14 years, AI, leak |
| Twist | 31–46.5 s | attack wave, race / no button, about half unsupported |
| Payoff | 46.5–59.3 s | official advice, callback, "step one's done…", "off" |

## 5. Line table

Job tags (brief §13): **SURPRISE**, **HOW** (explains how it works), **EVIDENCE**, **TWIST**, **CONSEQUENCE**,
**PERSONALITY**. FS # = row in `fact_sheet.md`. "Search 10/24" = my own spot check (see the verification note at the end).

| Line | Job tag | Source(s) | Visual idea (city / blueprint / dome world) |
|---|---|---|---|
| Governments across Europe switched off their own websites this week. | SURPRISE (hook) | FS #1, #2: Reuters factbox (Oct 21), NOS/Logius, Valtori, FR Interior Ministry, Insurance Business UK; Search 10/24 (Reuters factbox via The Star; NL, FI, FR, BE, CZ, DK, UK councils). "This week", because it all happened Wed Oct 21. | S01 GovernmentPlaza as built: the sun/power glyph is pressed and the shutters slam. **Drop the "four" pennant count** (or show more than four generic pennants with no flags). |
| On purpose. | SURPRISE + **[open loop]** | FS #2 (voluntary and precautionary, often on the national cyber agency's advice) | Hold on the hand still on the switch; the "back soon" tags (already planted). |
| Not a hack. | SURPRISE | FS #3, safe form: "None of them says it was hacked" (Valtori, CCB, Logius, German digital ministry) | The shutter is down and the lock is untouched. |
| A flaw that lets a stranger take over a website, no password needed. | CONSEQUENCE (stakes) | FS "What the bug lets an attacker do": PHP advisory (unauthenticated RCE), Canadian Cyber Centre AL26-026, CERT-EU gloss, NSA. The code runs as the web-server user, which means control of the site. | S02 lock close-up (short bolt). **Small addition:** a blueprint-diagram inset where a bare hand turns the short-bolt lock with no key. It stays a diagram, so the storyboard rule "attempts never succeed on real buildings" holds. |
| It's in PHP. The language everyone loves. | PERSONALITY (the one joke) + **[comment bait]** | None needed: irony, not a factual claim (CREATIVE_BRIEF engagement layer, user-approved) | Hard cut to Blueprint Street; the elephant stamp slams. Pip sits unbothered on the stamp, a 1-s gag beat (small new shot). |
| It runs about seven in ten websites. | EVIDENCE | FS #5: W3Techs 69.3% of sites whose server-side language is known (Oct 21–23 2026). **On-screen footnote:** "of sites whose server language is known · W3Techs". | Existing: 7 of 10 plaques tick; the sun becomes the 7/10 pie. |
| Fixing it takes two steps: find it, then install the fix everywhere. | HOW | FS #6 (a framing, no factual error). The vocabulary is fixed from here on: "fix" = the patch, "install" = what each server does. | S03 Stoop Street as built: two steps pop up, a magnifier riser (find) and an install riser with the keeper. Sage wrench tags ripple to the VP on "everywhere". |
| It sat in PHP for fourteen years, | EVIDENCE + SURPRISE | FS #7: affected code traced to PHP 5.4.0 (Mar 2012); "14 years old is fine". Search 10/24 (SentinelOne: earliest path PHP 5.4.0). On screen: "in PHP since at least 2012". | S04 as built, minus the look to camera: calendar pages and seasons, no clock. |
| until researchers using AI proved it was dangerous | EVIDENCE | FS #7 (weak spot noticed in 2024, never proven exploitable); FS #8 ("AI helped", humans led; two teams). Search 10/24 (SentinelOne/TNW: 2024 OSTIF–Quarkslab audit, "no exploitation path was proven"; AI-assisted auditing turned it into working RCE). "Proved it was dangerous" avoids the false "nobody found it". | S05 as built: the master blueprint banner, two unbranded teams, lens beams converge, the ring lands on "proved". |
| and quietly told PHP. | HOW (sets up the twist) | FS #9 (coordinated disclosure; accurate) | S06 Makers' Lane as built: the wax seal, the envelope through the mail slot, the blind down. |
| Except… word leaked a day before the fix. | TWIST | FS #10: CVE IDs (wrong score) plus an exploit video, Oct 20, ~18–22 h before the ~14:00 UTC Oct 21 release; PHP says no technical details leaked. Search 10/24 (Infosecurity Magazine; SecurityWeek: patch moved up a day). | S07 foreground wipe on "Except"; the notice lands on the board. **Change:** the sun-clock hand sweeps one full day, not "hours". |
| Attackers were already trying it. | TWIST / EVIDENCE | FS #10, stronger wording ("Attackers were already trying it before the fix existed"): Cloudflare CEO (thousands in the 10 h before the announcement), AWS MadPot (Oct 17). Search 10/24 (SecurityWeek: Patchstack and Cloudflare saw attempts before the patches). | A few hooded figures rattle locks while the workshop blind is still down. **Small change:** the storyboard confines hoods to S08. Allow them here, or show it as tally marks on the board. |
| Once it went public, Cloudflare says it saw tens of thousands of attempts in forty-five minutes. | EVIDENCE | FS #11–12: Matthew Prince on X ("tens of thousands in the 45 minutes post announcement"); attempts, mostly automated and blocked; the vendor's own count. **On screen:** "Cloudflare CEO, on X · attempts, mostly blocked". | S08 PEAK 2 crane: tallies climb the glass, with a 45-min wedge. **Fact fix needed regardless:** shrink the dome to about 1/5–1/4 of the skyline (it sits in front of ~1 in 5 websites, FS #11). |
| Within a day, millions. | EVIDENCE | FS #12 ("millions now", posted about 9:25 pm ET Oct 21; "within the day" is the safe wording) | Pull back to 1.0 on "millions"; the one sunset. |
| So step two is a race, with no "update the internet" button. | TWIST (the "ohhh") + PERSONALITY (memorable description) | FS add'l #5 / "Updating WordPress doesn't fix it": the fix has to come from whoever runs each server (Automattic, Wordfence via secondary reports). Audience file, rung 5. | S09 dawn: step 2 stretches into a ledge to the horizon. **Small addition:** Pip slaps a big round button on the board (glyph only, no text) and nothing happens. |
| Worse, about half of PHP sites run old, unsupported versions. | TWIST | FS #17: W3Techs (Oct 23) v7 26.9% + v5 7.7% + v4 0.1% = 34.7%, plus the also-EOL 8.0/8.1 ≈ 16% → ~50%. Cross-checks: CybelAngel 59% of hosts, TechnologyChecker 45.6%. php.net EOL dates. "Unsupported", not "no fix": PHP pushed source-only backports for 7.4/8.0/8.1, and distros and hosts ship patched builds (Search 10/24: SecurityWeek). **On screen:** "estimate · PHP sites that show their version · W3Techs". **Fallback:** "more than a third". | S12 OldQuarter (door height): about half the plaques turn sepia. **Change:** the pie is 1/2, not 1/3. Only plaques age, never the sites. |
| The official advice, FBI included: can't update yet? Take it offline. | CONSEQUENCE | FS #15 and "Official take-it-offline guidance": FBI Cyber Division on X (Oct 21), NSA, UK NCSC, BSI, CERT-EU, Japan's PM. Search 10/24 (CERT-EU: consider taking sites offline if you can't patch in time). "FBI included" avoids implying Europe followed the FBI. | S11 as built: govB's browser progress bar crawls (the snail), the sun is pressed, the shutter drops. **Optional new asset:** a loudspeaker or notice in the square, with no seals, faces or logos. The credit goes in the caption band. |
| That's what those governments did. | CONSEQUENCE; closes **[open loop]** | FS #16 (many went dark before the fix existed; "can't update yet" covers that) | Hard cut on "That's" to the exact S01 frame (existing). |
| Step one's done. | CONSEQUENCE (payoff) | FS timeline (fixes 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35, Oct 21). The narrower third issue (CVE-2026-115560, Oct 23) is outside this claim. | S09 stoop: a check pops on step 1. |
| Step two has to happen millions of times. | CONSEQUENCE (payoff) | FS #14: counts of exposed PHP systems run from ~2M (OX, CybelAngel) to 22.6M (Palo Alto), so "millions" is safe across all of them. Audience file 3.5. | **Re-sequenced:** S10 PEAK 3 moves here. The keeper installs one lock, then the pull-back reveals a hillside of identical doors. |
| Until it does, the safest setting is… off. | CONSEQUENCE (payoff) + **[loop line]** | FS #15 (official advice for anything not yet patched) | The unfixed windows on the hillside go dark district by district, ending on a frame that matches S01, so the video loops. |

## 6. What I cut from the current script, and why

| Current wording | What happened | Why |
|---|---|---|
| "in four countries" | → "across Europe" | Wrong (an undercount, FS #1). A small, precise, wrong number invites corrections; "across Europe" is safe without a list. |
| "switched themselves off" | → "switched off their own websites… On purpose." | "Themselves" sounds like a malfunction. The surprise is that governments chose to do it. |
| "Nobody hacked them." | → "Not a hack." | It's absolute, and Unit 42 describes one breached European government body (FS #3). The new wording describes why they went dark and frees "nobody" (it was used 3 times). |
| "They were fixing a security bug in PHP" | → stakes line + "It's in PHP." | Wrong sequence: many went dark *before* the fix existed (FS #4, #16). And "a security bug" says nothing about danger, so the line now says what the flaw lets a stranger do. |
| "the programming language behind WordPress" | cut | Weak anchor for 18–40s (the user's note). It also implies that updating WordPress fixes it, which it doesn't. Replaced by the approved bait plus "seven in ten". |
| "7 out of 10" | → "seven in ten" | One word shorter, written as spoken. Footnote on screen. |
| "First, you find it. Then, you fix it everywhere." | merged into one sentence | Keeps the two-step frame but drops the list cadence. "Fix it everywhere" blurred making the fix with installing it, and the story turns on that difference. |
| "You'd think finding it is the hard part, right?" | cut | Thinking aloud (Mistake 6). The promised reversal never came, and 2.6 s of the take sat on a rhetorical question. |
| "And for 14 years, nobody did." | → "It sat in PHP for fourteen years, until researchers… proved it was dangerous" | Misleading (FS #7): it was flagged in 2020 and spotted in 2024, just never proven. The fourteen years stay, as a true fact. It also removes the spine's contradiction (14 years to find vs. "the slow one" to install). |
| "Then, in August, two security teams using AI tools found it" | → "researchers using AI proved it was dangerous" | It was a 29-word AND-THEN chronology. "In August" and "two teams" are dates and counts no viewer uses (they can go on screen). "Using AI" stays: humans led, AI helped (FS #8). |
| "so a fix could be ready before anyone else knew" | cut | "Quietly" plus "Except" already carry the secret plan. |
| "the details of the bug leaked online hours before the fix came out" | → "word leaked a day before the fix" | PHP says no technical details leaked; the gap was ~a day, not hours (FS #10). "Online" was filler. |
| (missing) | + "Attackers were already trying it." | The verified consequence of the leak, and the reason step two becomes a race. |
| "which protects a big chunk of the web" | cut (on-screen / dome) | Seven words that delay the payload and sound like vendor boilerplate. A dome covering ~1/5 of the skyline shows it. |
| "break-in attempts… in 45 minutes… by evening" | → "attempts… once it went public… forty-five minutes… within a day" | They were attempts, not break-ins. The 45 minutes are counted from the announcement, and "by evening" was loose (FS #12). |
| "Nobody knows yet how many got in." | cut | A MOVING claim (FS #13), complicated by the Unit 42 case. It was the third "nobody" and opened a thread the script never closed. "Attempts" already avoids implying success. First thing to restore if 2 s are free. |
| "So now comes step two, the slow one." | → "So step two is a race" | A fake SO, and "slow" contradicted "fourteen years". "A race" follows from the attack wave, which makes it a real SO. |
| "Someone has to install that fix on every site" | → "install the fix everywhere" (the frame) + "no 'update the internet' button" + "millions of times" | "Someone" was vague. The point (there's no central button; each server installs it) is now said as one image. |
| "about 22 million copies of PHP out there that could be hit" | → "millions" | Wrong unit and a single-vendor exposure estimate (FS #14; other counts are 2–41M). It also collided with the "millions" of attempts. "Out there" and "could be hit" were filler. |
| "If a site can't update fast enough, the safest thing is to switch it off until it can." | → "The official advice, FBI included: can't update yet? Take it offline." | Same meaning, attributed. It was official advice, not the narrator's opinion (FS #15). |
| "That's what those government sites did." | → "those governments did" | Kept. Sites don't decide; governments do. |
| "And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore." | → "Worse, about half of PHP sites run old, unsupported versions." (moved *before* the advice) | It was understated (FS #17: ~half, estimate), and "don't fix" is contradicted by the source-only backports. Placed after the ending, it was an afterthought; it now causes the advice (SO). "The people who make PHP" was 5 words. |
| "For those, it's switch off or hope the hosting company sorts it out." | cut; replaced by the explicit payoff | A shrug ending (§9, Mistake 8) and a misleading either/or that leaves out the real fix (upgrade, or a host/distro backport) and slights hosts that are shipping backports. "Hosting company" was never explained, and "sorts it out" isn't American English. |

**Kept from the current script:** the hook shape (a 0–3 s reversal), the two-step frame (now load-bearing: the payoff
closes it), the fourteen years, AI, "quietly", the "Except" turn, Cloudflare's numbers, the switch-off advice, the
callback to the governments, the old-versions fact, and "off" as the loop word.

## 7. Visual-world notes

Nothing leaves the city. All the differences are re-sequencing or small in-world additions:
- **Re-sequenced:** S10 (the hillside of doors) moves to the payoff. S12 OldQuarter comes before S11 (advice). S13's
  board finale (caretaker, "hope") is dropped, and the last shot is the hillside going dark into the S01 frame.
- **Dropped beats:** S04's look to camera on "right?" and the hard stop on "did". The calendar pages stay. S07's clock
  becomes a full-day sweep.
- **Fact fixes the art needs anyway:** the dome covers ~1/5–1/4 of the skyline, the pie becomes 1/2 instead of 1/3, and
  S01 no longer shows a count of four.
- **Small additions:** the "no password" lock diagram inset, Pip's 1-s beat on "everyone loves", the glyph-only "update"
  button that does nothing, and hooded figures before the fix (or tally marks, if hoods must stay in S08).
- **Moderate (optional):** a loudspeaker or notice for the official advice, with no seals, faces or logos. S11's
  existing "sun pressed, shutter drops" can carry the line without it.

## 8. Options and flags for the editor

- **If 2–4 s are free (best adds, in order):** (1) "How many got in? Nobody knows yet." after "millions" (MOVING,
  re-check on publish day). (2) "Cloudflare, which sits in front of about one in five websites," (FS #11).
- **If "about half" isn't signed off:** "Worse, more than a third of PHP sites run old, unsupported versions." (FS #17,
  conservative).
- **The user's literal "most popular" option (flagged):** "It's in PHP. The most popular programming language in the
  world." **Risk:** it's false by every mainstream ranking (TIOBE Oct 2026: Python #1, PHP around #12; Stack Overflow 2025:
  JavaScript; GitHub Octoverse 2025: TypeScript), so the top comment is likely a correction we'd lose. The closest true
  wording: "the most-used language for running websites" (W3Techs ~69% vs a runner-up of ~8%). This script uses the
  approved "The language everyone loves."
- **On-screen credits needed:** the W3Techs denominator on "seven in ten"; "estimate" on "about half"; "Cloudflare CEO,
  on X · attempts" on the numbers; "since at least 2012" under "fourteen years"; "FBI · NSA · UK NCSC · CERT-EU" on the
  advice (caption band, no seals).
- **Re-check on publish day (MOVING):** the country list behind "across Europe", the attack counts, and whether any
  confirmed break-ins change the "Not a hack" framing (it describes the switch-offs only).

## Verification note (this pass, 2026-10-24)

I ran 4 WebSearch spot checks before the session's shared search budget ran out. WebFetch of php.net and w3techs.com
failed (DNS ENOTFOUND), so no primary page was opened. The checks confirmed:
- precautionary shutdowns in NL, FI, FR, BE, CZ and DK and at UK councils, plus CERT-EU's "take offline if you can't
  patch in time" advice (Reuters factbox via The Star; Insurance Business UK; Newsweek);
- the 2024 audit flagged the out-of-memory weakness but proved no exploitation path; the earliest affected path is
  PHP 5.4.0; AI-assisted auditing turned it into working RCE (SentinelOne; TNW; The Hacker News);
- the CVE IDs leaked on Hacker News on Oct 20, the patch moved up a day, and attempts came before the patches
  (Infosecurity Magazine; SecurityWeek);
- minimal backports for 7.4, 8.0 and 8.1 (SecurityWeek).

I did not re-confirm these myself, and they rest on `fact_sheet.md` and the critiques' logs:
- the Cloudflare CEO's counts (the voice critique confirmed the X post text);
- the FBI post;
- the W3Techs shares.

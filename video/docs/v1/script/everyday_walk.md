# Everyday walk version: PHP2Shell ("What's All the Fuss About?")

Status: rewrite pass, 2026-10-24. Voice: someone telling a friend the story on a walk. It's a touch quicker and more
casual than `final_draft.md`, has the odd tiny aside, and stays clear. RULE #1 (sound like a real person, not like AI)
was applied to every sentence. Inputs: `CREATIVE_BRIEF.md`, `final_draft.md` (structure and facts), `fact_sheet.md`
(FS, the only facts allowed, in their safe wording), `dinner_retelling.md`, and the AI-detector's sentence flags
(score 6/10 on the draft). The story order is the same as the draft's.

---

## 1. Plain script (captions and timing)

Governments all over Europe just shut down their own websites on purpose, because there's this bug where some random
person can take over a site without a password. And it's in PHP, the language everyone loves, and about seven out of
ten websites run on it. It was in there like fourteen years before some researchers using AI figured out how bad it was.
They gave the PHP folks a heads-up so they could fix it first, but word got out a day early, and hackers were already
trying it. Cloudflare's CEO says once it was official, they saw tens of thousands of attempts in forty-five minutes, and
then millions. And somebody has to go put the fix on every single server, and about half the sites on PHP run versions
so old they're not officially supported anymore. So even the FBI said if you can't update, turn it off for now, which
is basically what tech support always tells you. And that's pretty much what all those governments did.

## 2. Cued script (ElevenLabs paste format, per `original_annotated.md`)

There are 4 CAPS words (one per beat at most, none on a number) and 1 ellipsis, on the bait beat. There are no questions,
every number is spelled out, and the cues use commas only. THE one joke is named in its cue. The bait is cued flat so it
doesn't play as a second joke. Overall pace: a walk, a touch quicker than the draft's cues, never rushed on a number.

```
[quick and casual, a little amazed, friend on a walk, lean on "purpose", "password" plain]
Governments all over Europe just shut down their own websites on PURPOSE, because there's this bug where some random person can take over a site without a password.

[the bait, not the joke, tiny beat after "PHP", "loves" flat, no smile]
And it's in PHP… the language everyone loves, and about seven out of ten websites run on it.

[a notch quicker, story getting going, "like fourteen years" tossed off, curious not spooky, stress "bad"]
It was in there like fourteen years before some researchers using AI figured out how BAD it was.

[easy, letting them in on it, tiny dip on "but", stress "already", no ominous drop]
They gave the PHP folks a heads-up so they could fix it first, but word got out a day early, and hackers were ALREADY trying it.

[brighter and quicker, passing on what he said, each number clean, don't rush "forty-five", "millions" plain]
Cloudflare's CEO says once it was official, they saw tens of thousands of attempts in forty-five minutes, and then millions.

[ease off, a little weary like a chore, stress "every", "half" plain, no doom]
And somebody has to go put the fix on EVERY single server, and about half the sites on PHP run versions so old they're not officially supported anymore.

[THE one joke, dry half-smile, tossed off, no pause before "which", don't sell it]
So even the FBI said if you can't update, turn it off for now, which is basically what tech support always tells you.

[relaxed, wrapping up, shrug on "pretty much", a touch slower, don't land it]
And that's pretty much what all those governments did.
```

## 3. Word count and duration

- **170 words** (`wc -w`), 8 sentences, 10 commas. Sentences run 9 to 28 words: two long ones that keep going, one short
  one at the end, and the rest in between.
- **At 165 wpm: 61.8 s.** At 175 wpm (the walk pace this voice is going for) it's 58.3 s, and at 155 wpm 65.8 s.
- **Recorded ElevenLabs voice** (the rule of thumb from `final_draft.md` §3: words ÷ 3.6 per second, plus 0.5 s per
  full stop and 0.2 s per comma): 47.2 + 4.0 + 2.0 ≈ **53 s**. The current take is 77.6 s.
- "Purpose" is word 12. That's about 3.3 s in at the recorded voice's rate, or about 4.4 s at 165 wpm.

| Slot (brief §11) | Starts at (165 wpm) | Line |
|---|---|---|
| HOOK + STAKES | 0.0 s | shut down their own websites on purpose, because some random person can take over a site |
| Scale (comment bait) | 10.2 s | PHP, the language everyone loves, about seven out of ten websites |
| EXPLANATION | 16.7 s | in there like fourteen years, then researchers using AI figure out how bad it is |
| EXPLANATION, then the BUT | 23.3 s | heads-up so PHP can fix it first, but word gets out a day early, hackers already trying it |
| TWIST | 32.7 s | tens of thousands of attempts in forty-five minutes, then millions |
| TWIST | 40.0 s | someone has to put the fix on every single server, and about half are on unsupported versions |
| PAYOFF | 50.2 s | if you can't update, turn it off for now (THE joke) |
| Loop | 58.5 s | that's pretty much what all those governments did, which runs back into the opening |

## 4. What changed vs `final_draft.md`, and why

1. **The draft's sentences 1 and 2 are now one breath.** "...on purpose, because there's this bug where some random
   person can take over a site without a password." This drops the stand-alone "They did it because..." (an answer to a
   question nobody asked). It also swaps the news-lede "across Europe" for "all over Europe", "switched off" for "shut
   down", "flaw" for "bug", and "a stranger" for "some random person". "Can" stays, because how reliable the exploit is
   is still disputed (FS 13).
2. **"This week" became "just".** That keeps "purpose" near the start, and the line doesn't have to change after Oct 25.
   If it publishes after about Oct 28, switch to "last week".
3. **"seven in ten" became "seven out of ten"**, which is how people say it out loud. The bait is unchanged.
4. **The fourteen years line lost its documentary shape.** "That flaw had been sitting there for fourteen years, until..."
   became "It was in there like fourteen years before some researchers using AI figured out how bad it was." That drops
   the past perfect, the written callback "That flaw", and the "for N years, until" template. "Figured out how bad it
   was" stays, because it never claims nobody had noticed it.
5. **The heads-up is back, in plain words:** "They gave the PHP folks a heads-up so they could fix it first, but...".
   In the draft the BUT had nothing to push against and "the fix" came out of nowhere. There's no "quietly" and no "in
   secret". "Attackers" became "hackers", and "before the fix did" became "a day early" (FS 10 safe wording). It's still
   "and", never "so", before "hackers were already trying it", because Amazon logged an attempt on Oct 17, before any
   leak.
6. **The Cloudflare line now names who said it first.** The time sits with "they saw" ("says once it was official, they
   saw..."), so the passive "Once it was announced" at the front of the sentence is gone. "Once it was official" keeps
   the announcement apart from the leak. "Millions" is said once, as "and then millions". "Within a day" is gone because
   it's written register.
7. **"You'd think everyone would just install the fix, but..." is gone.** That was an expectation-flip template with a
   weak "but". It's now "And somebody has to go put the fix on every single server". "Go put" carries the chore and
   "every single" carries the scale. The old-versions fact joins on with "and", so it lands as part of why this is slow
   and not as one more item on a list. "Not even officially supported" became "not officially supported anymore" (the
   stacked "even" is dropped and "officially" stays for accuracy), and "sites running PHP are on" became "sites on PHP
   run".
8. **The ending now passes the advice on first and the joke trails after it.** The draft had a setup, a pause, a punch
   sentence and a bookend. Now it's "So even the FBI said if you can't update, turn it off for now, which is basically
   what tech support always tells you." The condition "if you can't update" matches the FBI's real wording (offline
   only for anyone unable to patch right away), so the "So" no longer suggests the advice was caused by old versions.
   "For now" keeps the advice temporary.
9. **The loop line is softer.** "And that's what those governments did" became "And that's pretty much what all those
   governments did." It's relaxed, not a closing title card, and "pretty much" covers the sites that went dark before
   the fix existed (FS 16).
10. **Length.** The detector's stitched version ran 198 words. This one is 170, the same as the draft. To get there I
    cut "pretty much" from the opening, "out there", "less than a day later", "right away" and "officially announced",
    and turned "you'd think..." into a plain statement. I kept the heads-up, because it's what makes the BUT work.

**What could still read as scripted (so the team can judge):** "tens of thousands... and then millions" is still a
two-step build-up, though a mild one. "Like fourteen years before..." is a timeline shape, but it's said casually.
The last line still echoes the opening on purpose, because the loop needs it. None of the other tells from the brief's
list appear: no em-dashes, semicolons, colons, questions, "Not X. Y.", fragments or lists of three, and none of the
stock reveal phrases. The filler words appear once each: "like", "basically", "pretty much".

## 5. Accuracy against `fact_sheet.md`

| Script says | FS basis |
|---|---|
| "Governments all over Europe just shut down their own websites on purpose" | FS 1–2: NL, FI, FR, BE, DE, CZ, UK (one outlet adds AT). Voluntary and precautionary, Wed Oct 21. "Europe" doesn't rule out AU or JP |
| "some random person can take over a site without a password" | FS "what the bug lets an attacker do": unauthenticated code execution, as the web-server user (the site and its data). Hedged with "can" |
| "about seven out of ten websites run on it" | FS 5: W3Techs, sites whose server language is known (~69–71%). The denominator goes on screen |
| "in there like fourteen years before some researchers using AI figured out how bad it was" | FS 7–8: the code dates to 5.4.0 (Mar 2012). The weakness was spotted in 2024 but never proven. The research was human-led and AI-assisted |
| "gave the PHP folks a heads-up so they could fix it first" | FS 9: coordinated disclosure, with PHP's maintainers leading the fix and release |
| "word got out a day early, and hackers were already trying it" | FS 10: the CVE IDs and an exploit video leaked on Oct 20, about 18–22 h before the fix. Attempts came before the fix (Oct 17 at Amazon, and Cloudflare's pre-announcement thousands) |
| "once it was official, they saw tens of thousands of attempts in forty-five minutes, and then millions" | FS 12: Prince on X. The count starts at the public announcement, and these are attempts, mostly blocked. "Millions now" was about 10–12 h later |
| "somebody has to go put the fix on every single server" | FS extra fact 5: the fix has to come from whoever runs the server |
| "about half the sites on PHP run versions so old they're not officially supported anymore" | FS 17: an **estimate** (about 35% on 7.x/5.x plus about 16% on 8.0/8.1), and CybelAngel finds 59% of internet-facing PHP hosts. "Officially" covers the source-only backports and distro builds. **It needs the on-screen credit. Fallback: "more than a third of the sites on PHP"** |
| "even the FBI said if you can't update, turn it off for now" | FS 15: the FBI Cyber Division said to take the system offline until it can be fully mitigated, for anyone who can't patch right away. "Even" puts the FBI among others (NSA, NCSC, BSI, CERT-EU) |
| "that's pretty much what all those governments did" | FS 16: many went dark before the fix existed, which "pretty much" covers |

It doesn't claim "nobody got in" either way (FS 13 is still moving).

## 6. On-screen text, engagement tags, visuals

**On-screen text (never voiced):** the same as `final_draft.md` §6. The Cloudflare label ("sits in front of about 1 in 5
websites") matters most, because the voiceover doesn't explain Cloudflare. The others are the W3Techs denominator on
"seven out of ten", "in the code since at least 2012", "word leaked Oct 20 · fix out Oct 21", "Prince, Cloudflare CEO,
on X · attempts, mostly blocked", "Updating WordPress won't fix it", the "about half" estimate credit, and the
FBI · NSA · UK NCSC · CERT-EU caption band.

**Engagement tags:** [open loop] "shut down their own websites on purpose", closed by the last line. [comment bait]
"the language everyone loves". ["wait, seriously?"] "like fourteen years", "hackers were already trying it", "tens of
thousands of attempts in forty-five minutes". [share trigger, THE one joke] "basically what tech support always tells
you". [loop line] "And that's pretty much what all those governments did.", which runs into "Governments all over
Europe...".

**Visuals:** nothing needs a different world. The beat order is the same as the draft's §8. Two small changes:
- **Heads-up:** this beat is back, and it reuses the S05/S06 workshop. The AI lenses hand the flawed lock page to the
  elephant-stamped workshop, then the sheet slips out under the blind for "word got out".
- **"And then millions":** the S08 dome counter ticks past tens of thousands and keeps going. Because "if you can't
  update" now comes before the joke, the S01 sun-switch gag lands about half a second later.

## 7. Verification this pass

WebSearch worked. WebFetch failed with DNS errors (ENOTFOUND for thenextweb.com and officechai.com), so everything below
rests on search extracts.
- **FBI advice: confirmed.** AP syndication (News4Jax, KSAT), Business Today, OfficeChai and Defense One all say it:
  "take the system offline until it can be fully mitigated", for anyone who can't patch right away. The NSA said the
  same.
- **The leak and the moved release: confirmed.** Infosecurity Magazine, SecurityWeek and BleepingComputer say the CVE
  IDs leaked on Oct 20, the release moved from Oct 22 to Oct 21 at 14:00 UTC, and a PoC video was published by mistake.
  SecurityWeek says several firms saw attempts before the patches shipped.
- **The heads-up: confirmed.** OpenAI says it led a coalition for two months and that "PHP's maintainers led the fixes
  and release" (via search extracts, ppc.land and Decrypt). Note: Decrypt says OpenAI's own team found a fuller version
  of the bug in September. "Figured out how bad it was" still holds, and the on-screen "reported privately in August"
  still holds for the first reports.
- **Prince's numbers: confirmed** through BetaNews, TNW (two pieces), OfficeChai and BigGo. Officials in DE, NL and JP
  report no confirmed break-in.
- **About 70% (W3Techs): confirmed** through AP. Source-only backports for 7.4, 8.0 and 8.1 are confirmed (search
  extract), and CybelAngel's 59% too. The W3Techs version split behind "about half" was **not** re-checked, because
  W3Techs wasn't reachable.
- **On publish day:** re-check "just" (switch to "last week" if it's more than about a week later), the breach and
  exploitation status, and whether "about half" is signed off (fallback: "more than a third").

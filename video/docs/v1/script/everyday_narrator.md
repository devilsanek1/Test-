# Everyday narrator version: PHP2Shell ("What's All the Fuss About?")

Pass done 2026-10-24. The voice is the channel's warm short-form narrator: quick and confident, but every line has to sound like
someone telling a friend. Inputs: `CREATIVE_BRIEF.md` (RULE #1 first), `final_draft.md` (structure and facts),
`fact_sheet.md` (FS, safe wording only), `dinner_retelling.md`, the AI-detector's sentence flags (human score 6/10), and
`original_annotated.md` (cue format). The story order is the same as the draft. Nothing needs a different visual world.

---

## 1. Plain script (captions and timing)

Governments all over Europe just shut down their websites on purpose, because of a bug that can let anybody take over a
site without a password. It's in PHP, the language everyone loves, and about seven out of ten websites run on it. And it
was in there like fourteen years before some researchers using AI figured out how bad it was. They gave the PHP people a
heads-up so they could fix it first, but word got out a day early, and hackers were already trying it. Cloudflare's CEO
says once it was announced, they saw millions of attempts in less than a day. And the fix doesn't help until somebody
goes and installs it on every single server, plus about half the sites on PHP are running versions so old they're not
officially supported anymore. So even the FBI said if you can't update yet, just turn it off, which is basically what
tech support tells you about everything. And that's pretty much what all those governments did.

## 2. Cued script (ElevenLabs paste format, per `original_annotated.md`)

There are 4 CAPS words (one or two per beat, never a number word), 1 ellipsis (the bait beat), no questions, and every number is
spelled out. THE one joke is named in its cue, and the bait is cued flat so the voice doesn't play it as a second joke.

```
[quick and bright, a little amazed, lean on "purpose", then plain, no drama on "password"]
Governments all over Europe just shut down their websites on PURPOSE, because of a bug that can let anybody take over a site without a password.

[the bait, tiny beat after "PHP", "loves" dead flat, then straight on into the number]
It's in PHP… the language everyone loves, and about seven out of ten websites run on it.

[a notch quicker, the story getting going, "fourteen years" plain, curious, no wink]
And it was in there like fourteen years before some researchers using AI figured out how bad it was.

[easy, letting them in on it, a touch lower on "but", stress "already", no ominous drop]
They gave the PHP people a heads-up so they could fix it first, but word got out a day early, and hackers were ALREADY trying it.

[brighter and a little quicker, passing on what he said, "millions" clean, don't sell it]
Cloudflare's CEO says once it was announced, they saw millions of attempts in less than a day.

[slower, explaining to a friend who doesn't code, stress "every", "half" a touch serious, no doom]
And the fix doesn't help until somebody goes and installs it on EVERY single server, plus about HALF the sites on PHP are running versions so old they're not officially supported anymore.

[THE one joke, said in passing, dry half-smile on "tech support", no setup pause]
So even the FBI said if you can't update yet, just turn it off, which is basically what tech support tells you about everything.

[relaxed, wrapping up, a touch slower, easy shrug, don't land it like a title card]
And that's pretty much what all those governments did.
```

## 3. Word count and duration

- **170 words** (`wc -w`, plain script), 8 sentences, 9 commas. Sentence lengths are 27, 17, 19, 26, 17, 32, 24 and 9, so
  there are two long sentences and one short close where the draft had eleven even ones.
- **At 165 wpm: 61.8 s.** At 155 wpm it's 65.8 s, and at 175 wpm 58.3 s.
- **Recorded ElevenLabs voice** (rule of thumb from `final_draft.md` §3: words ÷ 3.6/s, plus 0.5 s per full stop and 0.2 s per
  comma): 47.2 + 4.0 + 1.8 ≈ **53 s**, plus about 0.3 s for the bait ellipsis. The current take is 77.6 s.
- "Purpose" is word 11, which is about 3 s in with the recorded voice (4.0 s at 165 wpm). "Shut down their websites" lands
  before that.

| Slot (brief §11) | 165 wpm | Beat |
|---|---|---|
| HOOK | 0–4 s | governments shut down their websites on purpose |
| STAKES | 4–16 s | anybody can take over a site without a password, and seven out of ten websites run on PHP |
| EXPLANATION | 16–35 s | fourteen years, then researchers using AI, a heads-up, the leak a day early, hackers already trying it |
| TWIST | 35–50 s | millions of attempts in less than a day, the fix only helps once it's installed on every server, about half are on unsupported versions |
| PAYOFF | 50–62 s | even the FBI said turn it off if you can't update yet (the joke), and that's what the governments did. Then it loops |

---

## 4. What changed vs `final_draft.md`, and why

1. **Opener.** "Governments across Europe switched off their own websites on purpose this week" became "Governments all
   over Europe just shut down their websites on purpose". "Across Europe" sounds like a news anchor and "switched off"
   sounds British. "Their own" plus "on purpose" was double emphasis, and "this week" was tacked on the end. "Purpose"
   now comes one word earlier.
2. **Sentences 1 and 2 merged** with "because of a bug…". That removes the "They did it because…" restart, which sounded
   like an essay answering itself. "Flaw" became "bug" and "a stranger" became "anybody". "Can let" stays (FS: how reliable
   the exploit is is still disputed).
3. **Bait line.** It's word for word except for "seven in ten", which is survey wording. It's now "seven out of ten".
4. **Fourteen years.** "That flaw had been sitting there for fourteen years, until…" was a documentary template with a
   written callback. It's now "And it was in there like fourteen years before some researchers using AI figured out how bad
   it was." It still never says nobody found it (FS 7).
5. **Heads-up restored** in plain words: "They gave the PHP people a heads-up so they could fix it first, but…". Now the
   BUT has a plan to break, and "the fix" doesn't appear from nowhere. There's no "quietly" or "in secret". "Attackers"
   became "hackers", and the ellipsis "before the fix did" became "a day early" (FS 10 safe wording). It keeps "and", not
   "so", because of Amazon's Oct 17 attempt.
6. **Cloudflare line, the detector's major flag.** The rising number pair and the time clause stuck in front of the
   attribution are gone. It's now one number, said the way people pass on a quote: "Cloudflare's CEO says once it was
   announced, they saw millions of attempts in less than a day." The "tens of thousands in forty-five minutes" figure moves
   **on screen** onto the dome counter, so the animation carries it. That saves 7 words. If you want it spoken anyway, see
   §6.
7. **"You'd think everyone would just install the fix, but…"** (an expectation-flip template with a weak "but") became
   "And the fix doesn't help until somebody goes and installs it on every single server". That's a plain cause, said as a
   person explains it, and it's the "oh, I get it" moment: a fix existing isn't the same as sites being fixed. "Goes and"
   carries the chore.
8. **"About half…" joined with ", plus"** into the same breath, so it lands as a second reason fixing is slow instead of the
   next item on a checklist. "Sites running PHP" became "sites on PHP". "Even" is dropped from the hedge stack, and
   "officially" stays for accuracy.
9. **Ending.** The draft had a setup, a pause, a punch sentence and a bookend, which is a trailer landing. Now the advice
   comes first as plain reported speech ("So even the FBI said if you can't update yet, just turn it off"), and the joke
   trails after it as an aside ("which is basically what tech support tells you about everything"). That way the joke is
   told, not staged. "If you can't update yet" matches the FBI's own condition and also covers the governments that went
   dark before the fix existed. "The official advice, even the FBI's," is gone.
10. **Last line.** It's now "And that's pretty much what all those governments did." It's cued relaxed instead of landed,
    and it still loops into "Governments all over Europe…".
11. **Rhythm.** There are 8 sentences instead of 11. "And", "so", "plus" and "which is" do the joining. The written
    callbacks ("They did it", "That flaw", "the official advice") are gone.

RULE #1 sweep of the final text: there are no "X. Not Y." contrasts, no fragments, aphorisms or zingers, and none of the stock
reveal phrases. There are also no colons, questions, em-dashes, semicolons or lists of three. The script uses "like" once
and "pretty much" once. The only crafted line is the approved bait.

## 5. Accuracy (FS rows), on screen, visuals

| Line says | Basis | On screen |
|---|---|---|
| governments all over Europe shut down their websites on purpose | FS 1–2: NL, FI, FR, BE, DE, CZ, UK (+LU, AT reported). Voluntary and precautionary, Wed Oct 21 | "PHP2Shell · two linked flaws" on "bug" |
| a bug that can let anybody take over a site without a password | FS attacker row: unauthenticated code execution, hedged with "can" | takeover inset: "no password · control of the site and its data" |
| about seven out of ten websites run on it | FS 5: W3Techs, sites with a known server language (69–70%) | "of sites whose server language is known · W3Techs" |
| in there like fourteen years | FS 7: code since PHP 5.4.0 (Mar 2012), about 14½ years | "in the code since at least 2012" |
| researchers using AI figured out how bad it was | FS 8: human-led, AI-assisted (Calif, Wiz) | "found with AI help · reported privately in August" |
| heads-up… word got out a day early… hackers already trying it | FS 9–10: coordinated disclosure. Word leaked Oct 20, fix Oct 21 (18–22 h). Attempts before the fix | "word leaked Oct 20 · fix out Oct 21" |
| Cloudflare's CEO… millions of attempts in less than a day | FS 12: Prince on X, "millions now" about 10–12 h after the announcement. Attempts, mostly blocked | "Cloudflare · sits in front of about 1 in 5 websites", then counter stamp "first 45 min: tens of thousands", then "Matthew Prince, Cloudflare CEO, on X · attempts, mostly blocked" |
| the fix doesn't help until somebody installs it on every single server | FS extra fact 5 | "Updating WordPress won't fix it" |
| about half… not officially supported anymore | FS 17: estimate ≈ 50% (W3Techs Aug 22: v7+v5+v4 = 36.9%, plus 8.0/8.1 ≈ 16%). Backports and distro builds exist | "estimate · PHP sites that show their version · W3Techs". Fallback: "more than a third of the sites on PHP" |
| even the FBI said if you can't update yet, just turn it off | FS 15: FBI Cyber Division, "take the system offline until it can be fully mitigated" if unable to patch right away | "FBI · NSA · UK NCSC · CERT-EU" |
| that's pretty much what all those governments did | FS 16: many went dark before the fix existed | (hard cut to the S01 frame) |

**Visuals:** nothing needs a different world, and the beat order is the same as `final_draft.md` §8. Two small timing
shifts:
- The heads-up beat reuses the S05/S06 workshop. The AI lenses hand the flawed lock page to the elephant-stamped
  workshop, then a sheet slips out under the blind on "word got out".
- With the joke reordered, Pip's hand flips the S01 sun-switch on "turn it off", not at the end of the beat. "Tech
  support" gets a tiny in-world shrug from Pip and nothing more.

S08 dome counter: tick past the "first 45 min" stamp up to "millions" (same asset, one extra label). S10 keeper
then hillside on "every single server". S12 old quarter pie at 1/2. The ending is the existing S11 hard cut.

## 6. Options for the team (each one changes the counts above)

- **"Just" vs "this week".** "Just" stays true through about the end of October. The alternative is "So this week,
  governments all over Europe shut down their websites on purpose, because…" (+2 words). Change it to "last week" after
  Sun Oct 25.
- **Spoken 45-minute figure.** "Cloudflare's CEO says once it was announced, they saw tens of thousands of attempts in
  forty-five minutes, and millions in less than a day." That's +7 words (177 total, about 64 s at 165 wpm, about 55 s
  recorded), and it brings back the rising-pair shape the detector flagged.
- **"About half" not signed off:** "plus more than a third of the sites on PHP are running versions so old…" (+3 words).

## 7. Verification this pass

I checked these through WebSearch extracts. WebFetch of officechai.com and thenextweb.com failed (DNS `ENOTFOUND`), so no
full page was read.
- FBI wording "take the system offline until it can be fully mitigated" for those who can't patch right away: AP
  syndication (News4Jax, Oct 21), Business Today, Defense One.
- Prince's sequence (thousands in the 10 h before, tens of thousands in the 45 min after, hundreds of thousands in 2 h,
  millions at posting): TNW, PYMNTS, TradingView/Seeking Alpha, OfficeChai, BigGo, The Register.
- Leak on Oct 20 (CVE IDs on Hacker News, then a PoC video): Infosecurity Magazine, SecurityWeek.
- 5.4 (2012) origin, and Wiz finding it Aug 19 and reporting it Aug 24 with Gemini and GPT assisting: Wiz blog.
- W3Techs (Aug 22 2026): v8 63.1%, v7 28.9%, v5 7.9%, v4 0.1%, and PHP on 70.3% of sites with a known server language.
  The October snapshot wasn't reachable.
- Countries: NL, FI, FR, LU and AT confirmed in this pass's search. BE, DE, CZ and UK rest on the fact sheet's sources.
  "All over Europe" holds either way.

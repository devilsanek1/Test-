# Everyday dinner version: PHP2Shell ("What's All the Fuss About?")

Pass done 2026-10-24. The voice is a smart friend telling the story over dinner: relaxed, a little amused, not
performing. It starts from `final_draft.md` (structure and facts), takes its wording from `dinner_retelling.md` and the
AI-detector's sentence flags, and uses only the safe wording in `fact_sheet.md` (FS). Every sentence was checked against
RULE #1 in `CREATIVE_BRIEF.md`. The only deliberately crafted line is the user's approved bait, "PHP, the language
everyone loves".

---

## 1. Plain script (captions and timing)

Governments all over Europe just shut down their own websites on purpose, because of this bug where anyone could take
over a site without a password. It's in PHP, the language everyone loves, and about seven out of ten websites run on it.
It's been in there like fourteen years, and some researchers using AI finally figured out how bad it was. They gave the
PHP people a heads-up so they could fix it, but word got out a day early, and hackers were already trying it.
Cloudflare's CEO says once it was announced, they saw tens of thousands of attempts in forty-five minutes, and millions
within a day. And now somebody has to go install the fix on every single server. Plus about half of PHP sites are on
versions so old they're not officially supported anymore. So even the FBI said if you can't update right away, just turn
it off, which is basically what tech support always says. And that's pretty much what those governments did.

## 2. Cued script (ElevenLabs paste format, per `original_annotated.md`)

There are 4 CAPS words (one per beat at most, none on a number) and 1 ellipsis (the bait beat). The ONE joke is named in
its cue. The bait is cued flat so the voice doesn't play it as a second joke. Apart from the CAPS and the ellipsis, the
words match the plain script exactly.

```
[quick and bright, a little amazed, lean on "purpose", then plain, no drama on "password"]
Governments all over Europe just shut down their own websites on PURPOSE, because of this bug where anyone could take over a site without a password.

[the bait, not the joke, tiny pause after "PHP", "loves" dead flat, straight into the number]
It's in PHP… the language everyone loves, and about seven out of ten websites run on it.

[a notch quicker, easy, letting a friend who doesn't code in on it, "fourteen" plain, no wink]
It's been in there like fourteen years, and some researchers using AI finally figured out how bad it was.

[brisk and level, just a touch lower on "but", stress "already", no ominous drop]
They gave the PHP people a heads-up so they could fix it, but word got out a day early, and hackers were ALREADY trying it.

[brighter, passing on what he said, each number clean, don't rush "forty-five", "millions" plain, don't sell it]
Cloudflare's CEO says once it was announced, they saw tens of thousands of attempts in forty-five minutes, and millions within a day.

[ease off, back to normal pace, a little "ugh, imagine", slow slightly on "every single server"]
And now somebody has to go install the fix on EVERY single server.

[a touch more serious, unhurried, stress "half" not "old", no doom, no blame]
Plus about HALF of PHP sites are on versions so old they're not officially supported anymore.

[THE one joke, dry half-smile, advice said straight, no pause before "which", toss the tech-support bit away]
So even the FBI said if you can't update right away, just turn it off, which is basically what tech support always says.

[relaxed, warm, wrapping up, a touch slower, don't land it like a title card, just stop]
And that's pretty much what those governments did.
```

## 3. Word count and duration

- **169 words** (`wc -w` on the plain script), 9 sentences, 10 commas. Sentences run 26 / 17 / 19 / 25 / 22 / 13 / 16 /
  23 / 8 words, so long, flowing sentences sit next to short ones instead of all landing at 12–22 words.
- **At 165 wpm: 61.5 s.** At 155 wpm it's 65.4 s, and at 175 wpm 57.9 s.
- **Recorded ElevenLabs voice** (rule of thumb from `final_draft.md` §3: words ÷ 3.6/s, plus 0.5 s per full stop and 0.2 s
  per comma): 46.9 + 4.5 + 2.0 ≈ **53.4 s**.
- "Purpose" is word 12: about 3.3 s in with the recorded voice, or 4.4 s at 165 wpm.
- Compared with the detector's stitched version (198 words): it's 29 words shorter, and it still keeps the heads-up
  beat.

| Slot (brief §11) | This version (165 wpm) |
|---|---|
| HOOK 0–3 s | 0–9.5 s: governments shut down their own sites on purpose ("purpose" at about 3.3 s recorded), because anyone could take over a site |
| STAKES / SCALE | 9.5–15.6 s: it's in PHP (the bait), about seven out of ten websites |
| EXPLANATION | 15.6–31.6 s: been in there about fourteen years, AI researchers figured out how bad it was, heads-up to PHP, BUT word got out and hackers were already trying it |
| TWIST | 31.6–50.2 s: tens of thousands of attempts in forty-five minutes, millions within a day; now somebody has to install the fix on every single server; about half are on unsupported versions |
| PAYOFF | 50.2–61.5 s: so even the FBI said turn it off if you can't update right away (the joke), and that's what those governments did. Then it loops |

---

## 4. What changed from `final_draft.md`, and why

1. **Opener.** It was "Governments across Europe switched off their own websites on purpose this week. They did it
   because of a flaw…". Now it's "Governments all over Europe just shut down their own websites on purpose, because of
   this bug where…". "Across Europe" sounds like a news anchor and "switched off" is a bit British. Ending on "this
   week" is written word order. The full stop followed by "They did it because" answered a question nobody had asked,
   so the reason now just carries on in the same breath.
2. **"a flaw that can let a stranger" became "this bug where anyone could".** "Bug" is the everyday word and "a stranger"
   sounded storybook. "Could" keeps the hedge: watchTowr says most exploits going around don't actually get code running,
   and FS 13 says how reliable the exploit is is still disputed. I didn't use "pretty much anyone" because it would
   repeat the closing line's "pretty much", and it sounds like an easier attack than the evidence supports.
3. **"seven in ten" became "seven out of ten",** which is how people say it out loud. The bait wording is unchanged.
4. **"That flaw had been sitting there for fourteen years, until researchers…" became "It's been in there like fourteen
   years, and some researchers using AI finally figured out how bad it was."** This drops the documentary "had been X
   for N years, until Y" turn and the written callback "That flaw". "Finally" is true: experts had flagged the weak spot
   before but put it aside as too hard to exploit (FS 7, Deseret/AP).
5. **The heads-up is back** (the detector's biggest fix): "They gave the PHP people a heads-up so they could fix it,
   but word got out a day early, and hackers were already trying it." Now the BUT has a plan to break, and "the fix"
   doesn't come out of nowhere later. "Hackers" replaces "attackers". It stays "and", never "so", because Amazon logged
   an attempt on Oct 17, before any leak.
6. **Cloudflare line.** The attribution goes first, the way people pass on something someone said, and "once it was
   announced" now hangs off "they saw" instead of "says". "Once it was announced" also keeps the forty-five minutes
   apart from the leak.
7. **"You'd think everyone would just install the fix, but somebody has to…" became "And now somebody has to go install
   the fix on every single server."** That cuts the "you'd think X, but Y" expectation-flip template. "Now" marks the
   next stage, and "go install" makes it sound like a chore someone has to do by hand.
8. **"And about half the sites running PHP are on versions so old they're not even officially supported anymore"
   became "Plus about half of PHP sites are on versions so old they're not officially supported anymore."** "Plus"
   piles it onto the problem instead of making it the next item on a list. "Even" was a stacked hedge. "Officially"
   stays because it's what keeps the line accurate.
9. **The ending.** It used to be a setup, a pause and a punch sentence ("…what tech support always tells you. Turn it
   off until you can update it."), which is basically a colon reveal. Now it's one sentence: "So even the FBI said if
   you can't update right away, just turn it off, which is basically what tech support always says." The advice comes
   first, the way you'd pass it on, and the joke trails after it as an aside, so the situation makes the joke and
   nothing is staged. "If you can't update right away" is the FBI's own condition, and it also fixes the old "So" that
   made the advice sound like it was only for old versions. I used "tech support" rather than "IT" because ElevenLabs
   can read a capitalized "IT" as a stressed "it".
10. **"And that's what those governments did." became "And that's pretty much what those governments did."** "Pretty
    much" softens the bookend so it doesn't sound like a mic-drop, and it covers that many sites went dark before the
    fix even existed. It still loops straight back into "Governments all over Europe…".

What I tried and dropped: "fixing it is a whole thing, because…" (it's vague about what the "thing" is), "about a day
early" (cut for length, and "a day early" is the FS's own safe wording), "IT" (the TTS risk above), and "So" at the very
start (it pushes "purpose" to word 13 and makes the loop clumsy).

**RULE #1 sweep of the whole script:** there are no "X. Not Y." contrasts, fragments, colons, questions, em-dashes,
semicolons or lists of three. None of the banned stock phrases appear ("quietly", "turns out", "problem is", "here's",
"the catch", "there's no X button"). There's no setup-and-punch split and no standalone mic-drop. The connecting words
are spoken ones (because, and, but, so, plus, and now, which is basically). Hedges appear once each ("like", "about",
"basically", "pretty much"), only where a person would actually be unsure, and "just" appears twice.

## 5. Accuracy against FS safe wording

| Line | Basis | Note |
|---|---|---|
| all over Europe, shut down their own sites on purpose | FS 1–2 (NL, FI, FR, BE, DE, CZ, UK) | It was voluntary and precautionary. Say "just" until about Oct 26, then switch to "…on purpose last week, because…" ("purpose" moves to word 11) |
| anyone could take over a site without a password | FS attacker row (unauthenticated code execution) | "Could" is the hedge. On screen: "control of the site and its data" |
| about seven out of ten websites | FS 5, W3Techs | On screen: "of sites whose server language is known" |
| like fourteen years | FS 7 (code dates to 5.4.0, 2012) | On screen: "in the code since at least 2012". It never says nobody found it |
| researchers using AI finally figured out how bad it was | FS 7–8 | Humans ran the research and AI helped. It had been flagged before but never proven dangerous |
| heads-up… word got out a day early, hackers already trying it | FS 9–10 | Planned disclosure was Oct 22 and the leak was Oct 20, so the fix came out a day early. The gap was 18–22 h. Amazon logged an attempt Oct 17 |
| tens of thousands in forty-five minutes, millions within a day | FS 12, Prince on X | Counted from the public announcement. They're "attempts", never break-ins. "Millions" came about 12 h later |
| somebody has to go install the fix on every single server | FS extra fact 5 | On screen: "Updating WordPress won't fix it" |
| about half of PHP sites… not officially supported | FS 17 | An estimate (see §6). On-screen credit: "estimate · PHP sites that show their version · W3Techs". Fallback: "more than a third" |
| even the FBI said if you can't update right away, just turn it off | FS 15 | FBI: take the system offline "until it can be fully mitigated" if you can't patch right away |
| pretty much what those governments did | FS 16 | Many went dark before the fix existed |

## 6. Verification this pass

Every page I tried to open directly failed DNS (`ENOTFOUND` for w3techs.com, cybelangel.com, officechai.com and
thenextweb.com), so everything below comes from search extracts.
- **Prince's numbers:** the X post text appears verbatim in search results: "In the 10 hours before it was publicly
  announced… thousands of attempts… tens of thousands in the 45 minutes post announcement, hundreds of thousands within
  2 hours, and millions no[w]". One outlet puts "millions" at about 12 h after the announcement. Germany's BSI and
  watchTowr say no break-in has been publicly confirmed.
- **"About half" is re-checked and holds.** W3Techs (22 Aug 2026): v7 28.9%, v5 7.9%, v4 0.1% of PHP sites. W3Techs PHP 8
  sub-versions (29 Jun 2026): 8.0 at 7.0% and 8.1 at 17.8%, so 63.1% × 24.8% ≈ 15.6%. That totals about **52.5%**.
  CybelAngel separately finds 59% of internet-facing PHP hosts that report a version (883,717 of about 1.5M) on branches
  with no official release.
- **Leak timing:** SecurityWeek and SocRadar extracts say disclosure was planned for Oct 22, information leaked Oct 20,
  and PHP pushed the patches a day earlier.
- **FBI:** the AP syndication and the OfficeChai extract both say it told organisations that couldn't patch right away to
  shut the system down until it was fully mitigated.
- **"Finally figured out":** Deseret/AP say experts had flagged the issue earlier but put it aside as too hard to
  exploit. Wiz says AI lowered that barrier.
- **Countries:** extracts name NL, FI, FR, Austria, Denmark and Luxembourg on top of the FS list, which supports "all
  over Europe".

## 7. Visuals (city / blueprint / elephant world)

Nothing needs a different world, and the beat order is the same as `final_draft.md` §8.
- **Heads-up beat (restored):** reuse S05/S06. The AI lenses hand the flawed lock page to the elephant-stamped workshop,
  then a sheet slips out under the blind and figures start trying locks. There are no new assets.
- **"Once it was announced":** the S08 dome counter starts ticking at the announcement (the dome still covers about 1/5
  of the skyline).
- **"And now somebody has to go install the fix":** S10. The keeper fixes one lock, then BIG MOVE 2 pulls back to the
  hillside of doors.
- **The joke:** the advice now comes before the tech-support aside, so Pip reaches for the S01 sun-switch on "just turn
  it off", and the caption band "FBI · NSA · UK NCSC · CERT-EU" shows while the aside plays. That's only a timing shift.
- **Ending:** the S11 hard cut on "that's" to the exact S01 frame.

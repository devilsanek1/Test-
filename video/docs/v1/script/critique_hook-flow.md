# Strawman critique: HOOK, RETENTION & FLOW (PHP2Shell VO, current 226-word take)

Lens: the first 3 seconds, the stakes by 10 s, BUT/SO causality, attention drops, dead words, redundancy, wasted setups,
twist placement, the ending. Accuracy is flagged only where a flow fix depends on it (the fact lane owns the full check;
see `fact_sheet.md`). Written 2026-10-24 against `docs/CREATIVE_BRIEF.md`, `fact_sheet.md`, `audience_and_sowhat.md`.
Swipe-away estimates are **editorial judgment**, not analytics: we have no retention graph for this take.

---

## 0. Verdict in five lines

1. **The video's spine (leak, then attack numbers, then "switch it off") starts at 31 s.** The first 31 s are a hook,
   one long jargon sentence and a generic lecture about how bugs get fixed. On TikTok, most of the audience is gone
   before the good part.
2. **The script never says what the bug does.** "A security bug" carries no stakes. Without "a stranger can take over
   a website, no password needed", the break-in attempts and the switch-offs are just numbers and noise.
3. **The real twist (the fix exists, but every site has to install it, and about half of PHP sites are too old to get
   it) arrives at 50 s and 66 s.** The brief puts the twist at 30–45 s and the payoff at 45–55 s. Ours is about 20 s late.
4. **About half the transitions are AND/THEN or fake SO, not BUT/SO** (7 of 17; table in section 3).
5. **It ends twice, and the second ending is a shrug.** "That's what those government sites did" (66 s) feels like the
   end. Then 12 more seconds add a new fact and trail off into "hope the hosting company sorts it out." That gives no
   payoff, no loop and no rewatch.

Length: about 226 words (230 by whitespace count) in ~78 s (~174 wpm). The brief wants 45–60 s, which at this voice's
pace means **≤ 165 words**. So about **65 words have to go**, and section 2 finds more than that in dead material.

---

## 1. Timing map and where viewers swipe

Timestamps are proportional to word count at the recorded pace (78 s / 230 words), so treat them as ±1 s.

| Time | Line(s) | Swipe risk | Why |
|---|---|---|---|
| 0.0–3.1 | S01 "Government websites in four countries just switched themselves off." | **Medium** | Concrete and odd, which is good. But the first two words, "Government websites", are the dullest in the script. "Four countries" sounds small and foreign to a US viewer, and nothing is at stake for *you*. |
| 3.1–4.1 | S02 "Nobody hacked them." | Low | A 3-word reversal that raises "then why?". The best beat in the first 30 s. |
| 4.1–10.9 | S03 "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites." | **High** | It answers the hook's "why?" right away with the most deflating answer possible ("fixing a bug" sounds like maintenance). Then it stacks bug, PHP, programming language and WordPress before the only big number arrives at ~10 s. A non-coder files this as "tech video, not for me" at ~6–8 s and never hears "7 in 10". |
| 10.9–19.7 | S04–S07 "Fixing a bug like that takes two steps… You'd think finding it is the hard part, right?" | **HIGHEST** | **~9 s with zero new information**, in school-presentation voice, ending on a rhetorical question. The brief asks for something worth knowing every 3–5 s. I'd expect the steepest drop of the video here. |
| 19.7–21.7 | S08 "And for 14 years, nobody did." | Medium | "14 years" is a good fact. But the line *confirms* the setup instead of flipping it, so the "joke" has no turn (section 2). |
| 21.7–31.5 | S09 "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP…" | **High** | A 29-word "and then" chronology, the longest sentence in the script. The one clickable word ("AI") is buried mid-sentence and never pays off. |
| 31.5–47.1 | S10–S12 leak, then Cloudflare numbers, then "Nobody knows yet how many got in." | **Low (best stretch)** | A real BUT, big numbers, an honest ominous beat. This is the spine, and it starts at 40% of runtime. |
| 47.1–58.0 | S13–S14 "So now comes step two, the slow one… 22 million copies of PHP…" | **High** | A dead signpost calling back to a frame from 36 s earlier that nobody kept, then "22 million" right after "millions" (of attempts). Two different "millions" in 10 s blur together. |
| 58.0–66.1 | S15–S16 "…the safest thing is to switch it off… That's what those government sites did." | Medium-low | The real payoff, and it closes the loop. It also *feels like the end*, so many viewers leave here. |
| 66.1–78.0 | S17–S18 "And one in three sites… hope the hosting company sorts it out." | **High (kills completion and the loop)** | A new fact after the ending, then a trailing shrug. Viewers who stayed get no button and no reason to rewatch. |

---

## 2. Line by line

Format: **quote**, then what's wrong, then the fix (or **CUT**).

### S01 (0–3 s): "Government websites in four countries just switched themselves off."
- **"four countries" is wrong and shrinks the stakes.** Reports cover at least seven European countries (NL, FI, FR, BE,
  DE, CZ, UK), plus Japan in the Reuters factbox. A small exact number invites "actually it was eight" comments. That's
  the bad kind of comment bait, because it makes us look sloppy rather than starting a debate we win. Note for the fact
  lane: in the Reuters factbox I found, **Australia appears as an advisory ("patch or take offline"), not as sites going
  dark**. `fact_sheet.md` lists Australia as firmly sourced, so please re-check. "Across Europe" avoids the whole problem.
- **"Government websites"** makes the dullest possible first two words. Lead with who did it and the paradox.
- **"switched themselves off"**: websites don't switch themselves off. The phrase suggests a malfunction, so the next
  line has to spend words correcting it. The real surprise is *agency*: governments did this to their own sites, on
  purpose.
- **Fix:** "Governments across Europe just switched off their own websites. On purpose." (11 words, ~3.8 s.) "On purpose"
  opens the loop ("why would you do that?"). Visual: a hand throws a breaker in a government building and its browser
  windows go dark. No hackers on screen.

### S02 (3–4 s): "Nobody hacked them."
- It works as a beat, but it's the **first of three "nobody" lines** (S02, S08, S12), and the device is worn out by the
  third.
- Accuracy constraint for flow: Unit 42 describes one breached European government body, and TNW reports Cloudflare's
  CEO telling Reuters he'd seen "isolated evidence" of successful breaches. "Nobody hacked them" is only safe if it
  clearly means *the sites that switched off*.
- **Fix:** replace it with "On purpose." (above), which carries the same open loop and can't be disputed. If you keep
  "Nobody hacked them", cut the other two "nobody"s.

### S03 (4–11 s): "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites."
- **It closes the hook's loop at 4 s with a boring answer.** "They were fixing a bug" sounds like routine maintenance.
  The tension we just built drains away.
- **It's also inaccurate in a way that matters for the story.** Many sites went dark on the morning of Oct 21, *before
  the fix existed*. They weren't fixing anything; they were waiting.
- **"a security bug" carries no stakes, and the script never says what the bug does.** That's the biggest stakes gap in
  the video. The viewer needs one plain sentence: a stranger can take over a website, no password needed (CERT-EU's own
  plain gloss; unauthenticated remote code execution).
- **Jargon pile-up:** bug, PHP, programming language, WordPress, websites, all in one appositive chain. The listener has
  to hold "PHP" in mind through 12 more words.
- **"behind WordPress":** the user is right. It's a weak anchor for non-builders aged 18–40, and it makes PHP sound like
  a part of WordPress. Cut it.
- **"7 out of 10"** should be "7 in 10" (one word shorter), in **its own sentence**, so it lands as a fact instead of
  trailing off the end of a clause.
- **Fix: split it into a stakes beat and a scale beat** (stakes by ~8 s, scale by ~13 s):
  - "Blame a flaw that lets a stranger take over a website. No password needed."
  - "It's in PHP. The language everyone loves. It runs about seven in ten websites." This uses the approved ironic line,
    tagged **[comment bait]**. On-screen footnote: "of sites whose server language is known · W3Techs".

### S04 (11–14 s): "Fixing a bug like that takes two steps."
- This is school-presentation narration, which the brief (sections 14–17) rules out by name. It's generic: true of
  every bug ever, and it tells us nothing about this one. "A bug like that": like what? We haven't said what it does.
- It opens a 9-second dead zone. **CUT.**

### S05–S06 (14–17 s): "First, you find it. Then, you fix it everywhere."
- Abstract. Worse, **"fix it everywhere" blurs writing the fix and installing it**, and that's exactly the distinction
  the story turns on (section 4).
- **CUT.** If you want the find/install contrast, it can come back later as *evidence* (a scan a day later), not as a
  framework.

### S07 (17–20 s): "You'd think finding it is the hard part, right?"
- This is thinking aloud (Mistake #6) and artificial suspense. It asks the viewer to guess about a process they don't
  yet care about.
- **The setup promises a reversal that never comes.** "You'd think X is the hard part" sets up "but actually it's Y."
  The next line says nobody found it for 14 years, which *confirms* that finding was hard. The reversal ("step two, the
  slow one") arrives 30 s later, long after anyone is keeping track. **CUT.**

### S08 (20–22 s): "And for 14 years, nobody did."
- The cues bill this as THE one joke, but it has no turn (see S07), and as worded it's misleading: the code dates to
  2012, a bug report flagged the weakness in 2020, and PHP's own developers spotted the weak spot in 2024 but couldn't
  prove it was dangerous (TNW, from the PHP Foundation post-mortem).
- The fact itself (sitting in PHP since 2012) is good. **Fix:** cut the line. If there's room, fold the fact into the
  stakes line: "…a flaw that's been sitting in PHP since 2012." The one joke becomes "PHP. The language everyone loves."
- Optional "wait, seriously?" for a pinned comment or a sequel: "PHP's own team spotted the weak spot two years ago.
  They just couldn't prove it was dangerous." It's strong, but it opens a second thread (how PHP is run) that this
  payoff never closes, so keep it out of the main line.

### S09 (22–31 s): "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew."
- At 29 words it's the longest sentence in the script, at the point where attention is weakest.
- "**Then**" is AND-THEN chronology. "**in August**" is a date no viewer needs. "**two security teams**" is a count no
  viewer needs. "**using AI tools**" buries the most clickable word in the story mid-sentence, and it's never paid off.
  "**the people who make PHP**" is five words for "PHP", and it comes back in S17. "**anyone else**" should be
  "**attackers**", because that's the stake.
- Its only job is to set up the leak: the plan was secret, then the secret broke. Keep that job and nothing else.
- **Fix (20 words):** "AI helped researchers find it, and they told PHP in secret, so the fix would be ready before
  attackers knew." ("AI helped" is more accurate than "AI found"; humans ran the research.) Leaner (12 words): "The
  plan was to keep it secret until the fix was ready."

### S10 (31–36 s): "Except, the details of the bug leaked online hours before the fix came out."
- **This is a good BUT, placed too late.** It's the first real complication, and it should land around 20 s.
- "**the details of the bug**": PHP says no technical details leaked. What leaked was the CVE IDs and a video of an
  exploit working. "**hours**" undersells it: the gap was about a day. "**online**" is filler.
- "Leaked" is abstract. "Attackers were trying it" is stakes.
- **Fix (14 words):** "Except word leaked early. Attackers were trying it before the fix was even out." (Amazon saw
  public exploits ~12 h before the release; Cloudflare saw thousands of attempts in the 10 h before the announcement.)

### S11 (36–45 s): "Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening."
- **"which protects a big chunk of the web"** is a 7-word clause that holds the payload back by ~2.5 s. Who Cloudflare is
  matters only for credibility, and the screen can carry that: the glass dome with a counter ticking up. Saying
  "Cloudflare" alone is enough.
- "**in 45 minutes**": 45 minutes from what? It's unanchored. "**by evening**": whose evening? It's vague and US-centric.
- One 25-word sentence holds both numbers, so "millions" never gets its own beat.
- **Fix (18 words, two sentences):** "Once it went public, Cloudflare saw tens of thousands of attempts in forty-five
  minutes. Within a day, millions." Keep the word "attempts". Never say or imply "break-ins".

### S12 (45–47 s): "Nobody knows yet how many got in."
- The rhythm is good (short after long) and it's honest. But it's the third "nobody", and it opens a thread the script
  never closes.
- **Fix:** keep it only if the cut lands under ~55 s, and make it the *only* "nobody" ("No one knows yet how many got
  in."). Otherwise cut it first. Its job (danger is real) is covered by the attempt numbers and by "take it offline".

### S13 (47–50 s): "So now comes step two, the slow one."
- **A fake SO.** It doesn't follow from S12. It signposts a framework from 36 s earlier that the viewer has already
  forgotten. It's 3 s of transition at the point where back-half retention is shakiest. **CUT.**
- Replace it with the real BUT: "**But PHP can't push the fix out like a phone update. Whoever runs each server has to
  install it.**" This is the "Ohhh" of the whole video: why didn't they just fix it? Because there's no central update
  button. In the visual world, the architect's office fixes the blueprint, but every building has to change its own
  locks.

### S14 (50–58 s): "Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit."
- **This is the thesis, and it arrives at 50 s (64% of the runtime).** It belongs at ~30–35 s.
- "**Someone**" is vague. Name the person: whoever runs each server.
- "**22 million copies of PHP**" is misleading. Palo Alto counted "exposed instances potentially vulnerable": internet-
  facing services, not copies and not websites, and other scanners get 2–41 M. It's also the second "millions" in
  10 s, so the ear merges it with the attack count. "**out there**" and "**that could be hit**" are filler.
- **Fix:** swap the big count for a *rate* fact, which surprises far more: "**A day later, one scan found ninety-nine
  in a hundred still hadn't.**" (OX Security: 99.3% of 1.97 M measurable instances, 24 h after the release.)
  **Fact-lane flag:** this is based on version banners, and OX revised it to 97.5% unpatched on Oct 23. Melurna found
  23% patched among sites that show their version. If the fact lane vetoes the number, the safe version is "A day
  later, most still hadn't." That's true across every count, but much weaker. Tag: **[wait, seriously? / share
  trigger]**.

### S15 (58–64 s): "If a site can't update fast enough, the safest thing is to switch it off until it can."
- The logic is right; this is the payoff. But without attribution it sounds like the narrator's opinion, at 18 words.
  With a source it becomes a "wait, seriously?" moment, and it brings the story home for US viewers.
- **Fix (12 words):** "So the FBI's advice was blunt: can't update yet? Take it offline." (The FBI and NSA, Oct 21: if
  you can't update right away, take the system offline until you can.) Visual: a loudspeaker or billboard in the
  square. No seals, no real logos.

### S16 (64–66 s): "That's what those government sites did."
- It closes the loop well, but this is where the video *ends emotionally*, and 12 s are still to come. Either end here
  with a stronger line, or put the old-version fact **before** it.
- **Fix:** merge it into a final payoff that also loops back to the opening: "**Which is why, for a lot of websites this
  week, the safest setting is off.**" Its last word, "off", runs straight into the first line, "Governments across
  Europe just switched off…". Tag: **[loop line]**.

### S17 (66–74 s): "And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore."
- **The most important second-half fact is introduced as an afterthought**, with "And", *after* the loop has closed.
  This fact explains who stays exposed, the sites nobody looks after, and it's what makes "switch it off" follow (SO).
- "**one in three**" understates it. About half is the evidence-based estimate (v7/v5/v4 = 34.7%, plus unsupported
  8.0/8.1 ≈ 16%), and "half" is both stronger and more accurate. Footnote "estimate". "**the people who make PHP**"
  appears for the second time. "**sites on PHP**" is clumsy.
- **Fix (16 words), moved before the FBI line:** "And about half of PHP sites run versions so old, PHP doesn't even
  support them anymore." ("Doesn't support" sidesteps the source-only backports PHP published for 7.4/8.0/8.1, which
  "don't fix it anymore" gets wrong.)

### S18 (74–78 s): "For those, it's switch off or hope the hosting company sorts it out."
- **A shrug ending.** The brief rules out "it's complicated" payoffs (section 9) and endings that don't follow (Mistake
  #8). The delivery cue literally says "trailing off". That means no button, no loop and no rewatch.
- **It's also misleading:** it leaves out the real remedy (upgrade to 8.2+, or use a host/distro backport).
- "**hosting company**" isn't widely recognized. "**sorts it out**" reads British, not the brief's natural American.
- **CUT.** End on the payoff that loops (S16 fix).

---

## 3. BUT/SO audit (every transition)

| From → To | Connector as written | Real relation | Verdict |
|---|---|---|---|
| S01 → S02 | (none) | BUT: switched off, *but* not hacked | ✓ |
| S02 → S03 | "They were fixing…" | BECAUSE (weak, and closes the loop too early) | ~ |
| S03 → S04 | (topic jump) | AND THEN: from the news to a generic lecture | ✗ |
| S04 → S05 → S06 | "First… Then…" | a list | ✗ |
| S06 → S07 | rhetorical question | none | ✗ |
| S07 → S08 | "And" | *confirms* the setup (fake BUT) | ✗ |
| S08 → S09 | "Then" | AND THEN chronology | ✗ |
| S09 → S10 | "Except" | BUT | ✓ |
| S10 → S11 | (none) | SO: leak → attacks | ✓ |
| S11 → S12 | (none) | BUT: attempts, *but* we don't know how many got in | ✓ |
| S12 → S13 | "So" | doesn't follow (fake SO) | ✗ |
| S13 → S14 | (none) | explains | ✓ |
| S14 → S15 | (none) | SO | ✓ |
| S15 → S16 | "That's what…" | callback / loop | ✓ |
| S16 → S17 | "And" | new topic after the closure | ✗ |
| S17 → S18 | "For those" | SO, into a shrug | ~ |

**7 ✗ and 2 ~ out of 17.** Almost every failure sits in two places: 11–31 s (lecture plus chronology) and 47–78 s
(signpost plus epilogue). The middle (31–47 s) already flows. The fix is to grow the whole script out of that middle.

Target chain, which the flow demo in section 7 follows: **switched off on purpose → BECAUSE a flaw lets strangers take
over sites → it's in code under 7 in 10 sites → the fix was meant to stay secret → BUT it leaked → SO attackers piled in
→ BUT the fix doesn't install itself → SO most hadn't installed it → AND half can't easily → SO "take it offline" →
SO for a lot of sites, "off" is the safe setting (loop).**

---

## 4. Dead words, redundancy, vocabulary discipline

**Repetition counts in 78 s:**
- "fix" family **×7** (fixing, Fixing, fix it everywhere, a fix could be ready, the fix came out, install that fix,
  don't fix it). Worse, it means three different things: *writing* the patch, *the patch itself*, and *installing* it.
  The story depends on exactly that difference, and the vocabulary erases it. **Rule for the rewrite: "fix" is a
  noun meaning the patch; "install" or "update" is the verb a site does. Never use "fix" for installing.**
- "PHP" ×5. "the people who make PHP" ×2 (5 words each, so say "PHP"). "nobody" ×3. "switch(ed) off" ×3, plus one
  implied. "Then" ×2.
- **Numbers and counts: 11** (four countries, two steps, 7 of 10, 14 years, August, two teams, tens of thousands,
  45 minutes, millions, 22 million, one in three). The brief prefers one or two strong, memorable facts. Keep **7 in
  10** (scale), **tens of thousands → millions** (speed) and **about half** (who stays exposed), plus at most one
  "wait, seriously?" (99 in 100, if it's cleared). Everything else goes on screen or gets cut.

**Pure dead material (cut, ~60 words, ~21 s):** "Fixing a bug like that takes two steps. First, you find it. Then, you
fix it everywhere. You'd think finding it is the hard part, right?" (26) · "So now comes step two, the slow one." (8) ·
"Then, in August," (3) · "which protects a big chunk of the web" (7) · "out there that could be hit" (6) · "For those,
it's switch off or hope the hosting company sorts it out." (13).

**Filler inside lines:** "online" (S10), "out of" → "in" (S03), "the details of the bug" → "word" (S10), "Someone" →
"whoever runs each server" (S14), "a version so old that the people who make PHP don't fix it anymore" → "versions so
old, PHP doesn't even support them anymore" (S17).

**Sentence length:** 9, 3, 20, 8, 4, 5, 9, 6, **29**, 14, **25**, 7, 8, **24**, 18, 6, **22**, 13. Every 20+ word sentence
sits on a swipe-risk window in section 1. Cap sentences at ~18 words and aim for an average of ~10. Use short-long-short.

---

## 5. Structure vs the brief's 45–60 s template

| Slot (brief section 11) | Brief | Current | Proposed (section 7 demo) |
|---|---|---|---|
| HOOK | 0–3 s | 0–3 s, but weak words and a wrong number | 0–4 s "…switched off their own websites. On purpose." |
| STAKES | 3–10 s | "7 in 10" at ~10 s. What the bug does: **never said** | 4–9 s "a stranger can take over a website, no password"; 9–13 s "7 in 10" |
| EXPLANATION | 10–30 s | 11–31 s spent on a generic two-step lecture and a chronology | 13–31 s: secret plan, leak, attempt numbers |
| TWIST | 30–45 s | Leak at 31 s (only a complication). Real twist at **50 s** (install site by site) and **66 s** (old versions) | 31–48 s: no update button, then 99 in 100 hadn't, then half too old |
| PAYOFF | 45–55 s | 58–66 s, then a 12-s epilogue ending in a shrug | 48–57 s: FBI "take it offline", then "the safest setting is off" (loop) |

**The open loop needs to move.** At the moment, "why did they switch off?" opens at 0 s and closes at 4 s ("they were
fixing a bug"). The better open loop is the question every viewer is already asking: **"there's a fix, so why go
dark?"** Raise it implicitly early (on purpose, with a fix coming) and close it at the very end (it doesn't install
itself, half can't easily, so "off" is the safe setting). That closure is the understanding shift the brief asks for.
Tag: **[open loop]**.

---

## 6. The ending

- **Does it follow?** Partly. "Switch off or hope the hosting company sorts it out" does follow from "versions PHP
  doesn't fix", but as a shrug that drops the real remedy.
- **Payoff or shrug?** A shrug. The cue "trailing off" makes it audible. The viewer can't retell anything in two
  sentences.
- **Loop?** No. The final words ("sorts it out") don't run into the first ("Government websites…").
- **What the ending should do:** state the understanding plainly, in a line that's quotable and loops: "**Which is why,
  for a lot of websites this week, the safest setting is off.**" It follows from the FBI line (SO), it answers the
  opening "on purpose" (closes the loop), and "off" leads straight into "switched off their own websites" (the video
  loops). It isn't a forced punchline. It's the thesis stated once.

---

## 7. Flow demo (proves the fixes fit in under 60 s; the rewrite lane owns the final wording)

165 words, **~57 s at the current voice's ~174 wpm** (about 60 s at 165 wpm). Cue format follows
`original_annotated.md`.

```
[quick, bright, a little amazed, like you just saw this]
Governments across Europe just switched off their own websites… on PURPOSE.

[level, straight to a friend who doesn't code; let the danger sit, don't dramatize]
Blame a flaw that lets a stranger take over a website. No password needed.

[dry, tiny beat before it, THE one joke, don't sell it; then brisk on the number]
It's in PHP. The language everyone LOVES. It runs about seven in ten websites.

[easy, story moving, a little conspiratorial on "in secret"]
AI helped researchers find it, and they told PHP in secret, so the fix would be ready before attackers knew.

[lower and slower, "Except" is the turn; no news-anchor drop]
Except… word leaked early. Attackers were trying it before the fix was even out.

[quicker and brighter, each number clear; don't rush "millions"]
Once it went public, Cloudflare saw TENS OF THOUSANDS of attempts in forty-five minutes. Within a day… MILLIONS.

[back to normal pace, explaining the catch to a friend; lean on "each"]
But PHP can't push the fix out like a phone update. Whoever runs EACH server has to install it.

[slower, honest, let the number land; not a shocked voice]
A day later, one scan found ninety-nine in a hundred still hadn't.

[a touch more serious, level; stress "half"]
And about HALF of PHP sites run versions so old, PHP doesn't even support them anymore.

[brisk, a little wry, quoting the advice plainly]
So the FBI's advice was blunt: can't update yet? Take it OFFLINE.

[warm, settled, the loop closing; land "off" and stop, no trailing]
Which is why, for a lot of websites this week, the safest setting is… off.
```

| t (s) | Beat | Connector | Engagement tag | Visual (city world) |
|---|---|---|---|---|
| 0–4 | switched off on purpose | HOOK | [open loop] | A hand throws a breaker in a government building; windows go dark. In-world. |
| 4–9 | stranger takeover, no password | BECAUSE | none | A figure tries the blueprint-flaw lock and walks in. In-world (the lock already exists). |
| 9–13 | PHP, "everyone loves", 7 in 10 | SO (scale) | **[comment bait]** | The elephant mascot is unbothered while the crowd rolls its eyes; 7 of 10 buildings carry the elephant stamp. Small gag beat, in-world. |
| 13–20 | AI helps, told PHP in secret | AND (setup) | none | Two unbranded inspector robots/lenses at the blueprint, then an envelope to the elephant office. New asset, in-world. |
| 20–25 | leaked, attackers trying before the fix | **BUT** | none | A paper blows out of a window into the square; figures gather at doors. In-world. |
| 25–31 | tens of thousands → millions | SO | none | The glass dome counter ticks; the dome covers about 1/5–1/4 of the skyline. In-world. |
| 31–38 | no phone-style update; each server installs it | **BUT** | none | The architect's office fixes the master blueprint; locksmiths go door to door. **Moderate departure if you show a phone** (keep it in-world: no city-wide switch). |
| 38–42 | 99 in 100 still hadn't (one scan) | SO | **[wait, seriously? / share]** | A night skyline where only a handful of windows light up "fixed". In-world. |
| 42–48 | about half too old to support | AND (twist) | none | A sepia old-blueprint district with "v7"/"v5" stamps. Small addition. |
| 48–52 | FBI: can't update? Take it offline | SO | none | A loudspeaker/billboard in the square, no seals or faces. New asset, in-world. |
| 52–57 | safest setting is off | SO, payoff | **[loop line]** | Windows switch off district by district, matching the opening frame so it loops. In-world. |

**Accuracy notes on the demo** (the fact lane makes the final call):
- "across Europe" is safe; "their own websites" means *some of* their sites.
- "take over a website" is the fact sheet's own gloss for unauthenticated RCE as the web-server user.
- "7 in 10" needs the W3Techs footnote. "about half" is an estimate (footnote it); the conservative fallback is "at
  least a third".
- "99 in 100" is OX Security at 24 h and is contested (see S14); the fallback is "most still hadn't".
- "Cloudflare saw" stands for the CEO's posted figures, so add "its CEO says" on screen if the fact lane wants it.
- If there are words to spare (~4 s), the best adds are, in order: "…a flaw that's been sitting in PHP since 2012"
  (to the stakes beat), then "No one knows yet how many got in" (after the millions beat).
- Cut on purpose: "four countries", "behind WordPress", "two steps", "for 14 years nobody did", "in August / two teams",
  "22 million copies", "hope the hosting company sorts it out".

---

## 8. Where a rewrite pulls away from the visual world

Almost nothing in the proposed flow leaves the city. Watch three things:
1. **"Like a phone update"** is the one line that invites a phone close-up, which leaves the city. Keep the comparison
   in the VO only and show it in-world (the architect's office can't change locks remotely; locksmiths go door to door),
   or replace the line with "There's no button that fixes every website at once."
2. **The FBI line** needs a new in-world asset (a loudspeaker or billboard). Never use real seals, faces or agency logos.
3. **"The language everyone loves"** needs a short gag beat for the elephant mascot. It's compatible with the mascot,
   but it's a new shot.

---

## 9. The five most important changes

1. **Cut the 9-second "two steps / you'd think… right? / nobody did" lecture (S04–S08) and the "step two" signpost
   (S13).** That's ~40 words of zero-information setup sitting on the two biggest swipe windows (11–20 s, 47–50 s). It
   also makes the runtime fit: 226 words down to ≤165, so 78 s down to ~57 s.
2. **Put the stakes in by 10 s: say what the bug does, and stop saying "they were fixing a bug".** "A flaw that lets a
   stranger take over a website. No password needed." Then the scale in its own short sentence, with the approved bait:
   "It's in PHP. The language everyone loves. It runs about seven in ten websites." Drop "behind WordPress".
3. **Pull the real twist forward to ~30–45 s and make every transition a BUT or SO.** Leak → attackers trying before the
   fix (~20 s) → **BUT the fix doesn't install itself; whoever runs each server has to** (~31 s) → most hadn't a day
   later → about half are too old to be supported. This replaces the AND-THEN chronology ("Then, in August…") and the
   fake SO.
4. **Replace the shrug ending with a payoff that follows and loops.** Cut "hope the hosting company sorts it out" and
   don't add new facts after the loop closes. Move "about half run unsupported versions" *before* the advice, then end:
   "So the FBI's advice was blunt: can't update yet? Take it offline. Which is why, for a lot of websites this week, the
   safest setting is off." The last word runs into the first line.
5. **Fix the hook's first 3 seconds and stick to strict vocabulary.** "Governments across Europe just switched off their
   own websites. On purpose." Wrong "four countries" and the vague "switched themselves off" go; "on purpose" opens the
   loop. Throughout, "fix" = the patch and "install" = what each site does, one "nobody" at most, and at most three
   spoken numbers (7 in 10, tens of thousands → millions, about half) plus one cleared "wait, seriously?".

---

## 10. What I checked myself (2026-10-24)

WebFetch failed on DNS for every news domain I tried (thehackernews.com, theregister.com), so the checks below rest on
WebSearch result extracts. I couldn't open any primary page directly.
- Government shutdowns across NL, FI, FR, DE, UK, Luxembourg, Belgium (foreign ministry), Czech Republic, plus Japan's
  partial suspensions: Reuters factbox via [ThePrint](https://theprint.in/world/factbox-governments-companies-take-websites-offline-over-php-flaws/3078821/);
  [Newsweek](https://www.newsweek.com/php-vunerability-php2shell-issue-websites-hack-server-12601225);
  [Insurance Business UK](https://www.insurancebusinessmag.com/uk/news/cyber/uk-councils-and-met-police-among-sites-pulled-offline-after-ncsc-alert-594424.aspx);
  [Paperjam (LU)](https://en.paperjam.lu/article/php2shell-thousands-of-websites-exposed-in-luxembourg).
  **In this factbox, Australia appears only as an advisory.**
- Cloudflare CEO figures (thousands in the 10 h before; tens of thousands within 45 min of the announcement; hundreds of
  thousands in 2 h; millions at posting) and "officials see no break-in" vs the CEO telling Reuters he saw "isolated
  evidence" of breaches: [TNW](https://thenextweb.com/news/cloudflare-php2shell-millions-exploit-attempts),
  [TNW](https://thenextweb.com/news/php2shell-millions-exploit-attempts-no-confirmed-breaches),
  [OfficeChai](https://officechai.com/stories/cloudflare-ceo-says-php-exploit-attempts-went-from-thousands-to-millions-within-hours-of-disclosure/).
- Leak (CVE IDs; Hacker News forum post; PoC concerns) and pre-release attempts (Amazon MadPot Oct 17; PoCs ~02:00 UTC,
  ~12 h before the patch): [Infosecurity](https://www.infosecurity-magazine.com/news/php2shell-exploitation-attempt/),
  [Security Affairs](https://securityaffairs.com/201479/hacking/php2shell-attacks-started-four-days-before-public-disclosure-aws-reports.html),
  [SecurityWeek](https://securityweek.com/php2shell-patches-land-as-first-exploitation-attempts-hit-sensors).
- PHP knew of the weak spot in 2024 and couldn't agree on a fix ("structural failure"):
  [TNW](https://thenextweb.com/news/php-foundation-structural-failure-2024-flaw-leak).
- FBI/NSA "update or take it offline": [tech-ish](https://tech-ish.com/2026/10/21/japans-pm-the-nsa-and-the-fbi-tell-websites-to-update-php-or-go-offline/),
  [Business Today](https://businesstoday.in/technology/story/critical-vulnerabilities-govt-websites-in-europe-shut-down-over-php-security-scare-fbi-issues-urgent-advisory-562935-2026-10-21),
  [Defense One](https://www.defenseone.com/threats/2026/10/critical-flaws-php-warning/416727).
- 99.3% unpatched at 24 h (later 97.5%), with the conflicting count of 23% patched:
  [OX Security](https://www.ox.security/blog/php2shell-24-hours-in-99-3-of-measurable-php-instances-are-still-unpatched/),
  [Dark Reading](https://www.darkreading.com/application-security/exposed-php2shell-cyber-experts-advice),
  [Melurna](https://www.melurna.com/blog/php2shell-patch-status/).
- Everything else (W3Techs shares, PHP version split, Palo Alto's 22.6 M) is taken from `fact_sheet.md` and
  `audience_and_sowhat.md`, not re-checked here.

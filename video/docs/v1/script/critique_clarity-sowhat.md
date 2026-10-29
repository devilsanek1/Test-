# Strawman critique: CLARITY & SO-WHAT (current 226-word VO)

Lens: can a smart non-coder follow every name and number, does every number have an honest denominator, does the viewer
end with something concrete they could tell a friend, is the consequence for ordinary people stated out loud (brief,
mistake 3), and does the story answer one big, familiar question? Scored against the brief's FINAL EDITORIAL STANDARD
(questions 1 to 10).

Inputs: `docs/CREATIVE_BRIEF.md`, `fact_sheet.md`, `audience_and_sowhat.md`, `original_annotated.md`, `docs/storyboard.md`,
and the timings of the v2 ElevenLabs take (`storyboard_v2voice.json`: 77.76 s). Timestamps below come from the v2 take.
My own verification pass is logged at the end. Most primary pages could not be opened from this environment.

---

## 0. Verdict

The script has a good hook ("switched themselves off / Nobody hacked them") and one real insight buried in it ("if a site
can't update fast enough, the safest thing is to switch it off"). Everything between those two moments is a tour of the
**process** (find, fix, leak, attempts, install). It never stops on the **consequence**. The four biggest failures:

1. **It never says what the bug lets someone do.** "A security bug", "break-in attempts", "how many got in" and "could be
   hit" all point at a danger the viewer is never shown. Without "a stranger could take over the website, no password",
   switching government sites off looks like an overreaction, not the smart move.
2. **The spine doesn't hold together.** It sets up "you'd think finding is the hard part", then says finding took
   **14 years**, then calls installing the fix "the slow one". By the script's own numbers, finding was the slow step.
   A sharp viewer notices, and so do the comments. (And "nobody found it for 14 years" is itself misleading: PHP's own
   team spotted the weak spot in 2024.)
3. **The payoff arrives at 59.8 s, and then the script keeps going.** "Safest thing is to switch it off" starts at 59.8 s
   of a 77.8 s take. The brief puts the payoff at 45 to 55 s, and then the video ends. Here it's followed by a new twist
   (old versions) and a shrug ("hope the hosting company sorts it out") that uses a term the script never explains.
4. **Nothing is said to the viewer.** There's no line about what this means for someone who doesn't run a website:
   whether sites they use go dark, whether their phone needs anything, who is actually exposed. That is brief mistake 3,
   word for word.

Numbers and names are the second layer: 7 of the 10 numbers have a wrong, misleading or missing denominator (section 5). Three names
(WordPress, Cloudflare, "hosting company") are used without the anchor a general viewer needs (section 4).

---

## 1. The tell-a-friend test

**What a viewer would actually repeat after the current script:**
> "Some governments turned their websites off because of a bug in PHP, which is... some code? AI found it, it leaked,
> there are 22 million copies, and a third are too old to fix."

That's a list of events. It has no "because", no danger and no "and that means for me". It fails brief §10 ("tellable in
1 to 2 sentences" as an *understanding*, not a recap).

**What the viewer should be able to say (the target):**
> "A flaw in the code most websites run on let strangers take sites over. The fix is out, but every site has to install
> it itself, and lots run versions too old to get it. So until they do, switching off is the safe move. That's why
> government sites went dark. Your phone's fine; the sites nobody looks after are the problem."

Every change below serves that second paragraph.

---

## 2. Scorecard: Final Editorial Standard (current script)

| # | Question | Score /10 | Why |
|---|---|---|---|
| 1 | What big question does this help answer? | **2** | None is stated or implied. The script answers a news question ("why did these sites go offline?"), not a familiar one. Candidates are in section 7. |
| 2 | What new information makes it worth telling now? | **7** | Fresh (Oct 21) and genuinely new. Points lost for an undercounted "four countries" and for passing over the freshest so-what facts (attacks before the fix; FBI "take it offline"). |
| 3 | What's the surprising discovery? | **5** | "Switched themselves off / nobody hacked them" is a real "wait, seriously?". The other surprise, "14 years, nobody", is misleading. The strongest true surprise (the fix exists, but there's no way to push it to every site, so "off" is the official advice) is said too late and too softly. |
| 4 | The clearest, most powerful "So what?" | **4** | It's in there ("safest thing is to switch it off"), but at 59.8 s, generic, and diluted by two more beats after it. |
| 5 | Why would an ordinary person care? | **2** | Never stated. No line about what the flaw does, what is at stake on a hijacked site, or what the viewer should do or not do. |
| 6 | What should the viewer understand differently afterward? | **5** | "A fix has to be installed everywhere" is the right idea, but it's dressed as "step two is slow", which the 14-year line contradicts. |
| 7 | Can we explain it accurately in under a minute? | **3** | 77.8 s and 226 words. At least six accuracy problems that are also clarity problems (four countries; nobody found it; details leaked hours early; 22 million "copies"; one in three; the hosting-company shrug). |
| 8 | Does every sentence advance the story? | **5** | About 32 words (sentences 4 to 8, 11.6 to 23.7 s) are scaffolding with one misleading fact. "Which protects a big chunk of the web" explains nothing. Sentences 17 and 18 come after the payoff. |
| 9 | Can animation make the insight more obvious? | **7** | The blueprint/locks world is excellent for "one flaw, every door". But some visuals encode wrong facts: the dome over "most" of the city (truth: about 1 in 5 websites), 14 year pages, and a two-step stoop built around the broken "find vs fix" frame. |
| 10 | Would the viewer want to share what they learned? | **4** | No quotable, true "wait, seriously?" line with a clean denominator, and the ending is a shrug. Shareable candidates that exist and are true: "The FBI's advice was: take it offline"; "Your phone doesn't need this update. Millions of websites do." |
| | **Total** | **44 / 100** | Strong world, strong hook, weak stakes, no viewer consequence, payoff too late. |

---

## 3. Line by line

Format: **quote** (v2 time, words). What's wrong. **Fix / cut.** Visual note only where a fix changes the picture.

### S1. "Government websites in four countries just switched themselves off." (0.0 s, 9 w)
- **Wrong denominator.** "Four countries" is an undercount. At least eight (NL, FI, FR, BE, DE, CZ, UK, AU; Japan per
  Reuters), and my own search also turned up Austria, Denmark, Switzerland and Luxembourg in press reports. A precise
  small number that's wrong is worse than a correct vague one.
- **Ambiguous agent.** "Websites ... switched *themselves* off" can be heard as automatic (a crash, a kill switch). The
  surprise is that **governments did it to their own sites, on purpose**. Say so.
- **US viewer problem.** It doesn't say where. "Countries" with no region leaves an American viewer wondering whether
  it's theirs (US federal sites were not taken down).
- **Fix:** "Governments in at least eight countries just switched off their own websites." (12 w) Or, shorter and safe:
  "Governments across Europe just switched off their own websites." (UK and Australia also did, so "across Europe"
  undercounts too, but it doesn't misstate.)
- Visual: S01 has four buildings and four pennants. Drop the pennant count or make it eight. Minor.

### S2. "Nobody hacked them." (3 w)
- The best line in the script: short, counter-intuitive, and the viewer immediately asks "then why?". Keep the move.
- **Accuracy edge:** Unit 42 describes one unnamed European government body that *was* breached. "Nobody hacked them"
  about these sites is defensible but absolute.
- **Fix (clearer and safer):** "Not a hack. A precaution." It answers "why" in two words and leads straight into the
  reason. (4 w)

### S3. "They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites." (4.8 s, 20 w)
This is the stakes slot (brief: 3 to 10 s), and it has no stakes in it. Five separate problems:
1. **"They were fixing"** is wrong in sequence and wrong in so-what. Most went dark the *morning* of Oct 21, before the
   fix existed (released about 14:00 UTC). They weren't fixing anything yet; they were **waiting for a fix**, and
   switching off was the only lock they had. That's a stronger story.
2. **"A security bug"** is the most abstract possible label for the most important fact. The viewer needs the picture:
   **a stranger could take over the website with a single web request, no password.** (Verified: unauthenticated remote
   code execution; CERT-EU's plain gloss; Canadian Cyber Centre AL26-026.) Nothing later in the script fills this hole.
3. **"Behind WordPress"**: the user's instinct is right. WordPress has low recognition with an 18 to 40 audience, it adds
   no scale (it's a subset of the 7 in 10), and it plants a wrong idea, that WordPress is the thing that needs updating.
   (It isn't. Updating WordPress, themes or plugins doesn't fix this.) **Cut it from the hook.** If you want it at all,
   use it in a site-owner line later ("updating WordPress won't fix it").
4. **"About 7 out of 10 websites"**: true, but the denominator is "websites whose server-side language W3Techs can
   detect, in its top-10-million sample" (about 70%, Jul to Oct 2026). A general viewer will hear "7 of 10 sites *I
   use*", which is false by traffic (Google, YouTube, Instagram and TikTok don't run standard PHP). Fix: say "websites",
   never "sites you use", and add the on-screen footnote "of sites whose language is known · W3Techs".
5. **Overload**: four new concepts (the fix, PHP, WordPress, 7 in 10) in 20 words and 6.8 s, and the most important one
   (what the flaw does) isn't among them.
- **Fix:** "A precaution, against a flaw in PHP. The language everyone loves. It's the code running about seven in ten
  websites, and this flaw can let a stranger take one over. No password." (about 30 w with S2's fix)
- The approved bait line ("PHP. The language everyone loves.") is invisible irony to non-coders. That's fine, **as long
  as the next sentence does the explaining** ("It's the code running..."). Don't put anything between them.
- Visual: "take one over" needs one new in-world beat: a bare hand turns the short-bolted lock with no key and the door
  swings open (hypothetical, shown on the blueprint lock, not on a real government building). Small addition. It
  clashes with the storyboard rule "attackers never get in", so stage it as a diagram or "what the flaw allows" inset,
  not as a real break-in.

### S4 to S6. "Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere." (11.6 s, 17 w)
- **School-presentation narration** (brief §14 to 17: avoid). It announces a structure instead of telling the story.
- **It blurs the one distinction that matters.** "Fix it everywhere" mixes up *making* the fix (PHP's makers, once) with
  *installing* it (every server, separately). The script later relabels step two as "install that fix on every site",
  so the frame shifts under the viewer.
- **It's also factually thin.** There was a hard middle step: PHP's team knew about the weak spot in 2024 and couldn't
  agree on a fix.
- **Fix:** cut the frame. Replace it later with the real distinction, said once: "There's no 'update all' button for the
  internet. Whoever runs each site has to install the fix." (17 w, used at the twist.)
- Visual: the S03 two-step stoop (magnifier riser, wrench riser) and S04's tower are built for this frame. That's the
  **largest visual change** my fixes cause (about 12 s of storyboard). The stoop can survive if the risers become
  "make the fix" (makers' workshop, done once) and "install it" (the keeper, every door). That's a relabel inside the
  existing world, not a new world.

### S7. "You'd think finding it is the hard part, right?" (9 w)
- **Thinking aloud** (mistake 6), and it asks for an intuition the viewer doesn't have. Nobody outside security has a view
  on whether finding or fixing is harder, so the "right?" lands on air.
- **Logic trap**: see S8.
- **Cut.**

### S8. "And for 14 years, nobody did." (6 w): the named joke
- **Misleading.** The code dates back to PHP 5.4 (2012), so "14 years old" is fine. "Nobody found it" isn't: the
  out-of-memory weakness was flagged in 2020 and spotted again by PHP's own developers in a 2024 audit; nobody proved it
  was exploitable, so it wasn't fixed.
- **It breaks the spine.** S7 says "you'd think finding is hard". S8 confirms finding *was* hard (14 years). S13 then
  says installing is "the slow one". So the script contradicts itself: 14 years to find vs. "the slow one" to install.
- **Fix:** cut. If the 14-year fact is wanted as a "wait, seriously?", the true version is stronger: "The flaw had been
  in PHP since 2012. PHP's own team even spotted the weak spot two years ago, but couldn't prove it was dangerous." But
  it costs about 20 words and opens a second storyline (the institutional failure). In a 60-second cut it doesn't serve
  the so-what. **Recommend cutting it.**
- Losing the one joke: the replacement personality line is "The language everyone loves" (user-approved), so the script
  still has exactly one.

### S9. "Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew." (23.7 s, 29 w; about 9 s)
- **Too long for what it does.** Its job is to set up the leak: a secret was being kept. That takes about 8 words.
- **"Using AI tools" opens a loop the script never closes.** The AI angle is what the news led with, and it's a big
  familiar topic, but here it's a passing clause that never pays off. Either make AI the episode's question (a different
  video) or make it a passing fact in five words.
- **"In August" and "two security teams"** cost words and add nothing a viewer could use. (And the press usually credits
  three organizations: OpenAI, Wiz, Calif.)
- **"The people who make PHP"** is a good plain gloss. "PHP's makers" says it in two words.
- **Fix:** "It was found quietly, with help from AI." (8 w) or "AI helped researchers find it, and they quietly warned
  PHP's makers." (12 w)

### S10. "Except, the details of the bug leaked online hours before the fix came out." (32.9 s, 14 w)
- **Misleading, and the misleading part is the so-what.** What leaked was the CVE IDs (with a wrong score) and a video of
  an exploit working, about a **day** before the fix. PHP says no technical details leaked. The consequence that
  matters, **attackers were already trying it before the fix existed**, is left unsaid (Cloudflare's CEO: thousands of
  attempts in the 10 hours before; Amazon: one attempt on Oct 17).
- "Details of the bug" is vague: details for whom, enabling what?
- **Fix:** "But word leaked a day early, and attackers were trying it before the fix was even out." (17 w) This is the
  BUT the brief asks for, and it creates the race.

### S11. "Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening." (38.6 s, 25 w; about 8 s)
- **"Cloudflare"** has medium recognition, and **"protects a big chunk of the web"** has no denominator. The true number
  is better: it sits in front of **about 1 in 5 websites** (W3Techs: 23.9%).
- **"In 45 minutes"**: 45 minutes from *what*? It's from the public announcement of the fix. Without that anchor, the
  number floats.
- **"By evening"**: whose evening? The "millions" came from a post late Wednesday US time. "Within a day" is safe.
- **"Break-in attempts"**: these were *attempts*, mostly automated and mostly **blocked** by Cloudflare. "Break-in" plus
  the dome visual risks the viewer hearing "millions of break-ins". Say "attempts".
- **Attribution**: the figures come from the CEO's post on X, not from a published dataset, and the company sells the
  protection. "Says" stays.
- **So-what gap**: the viewer learns attackers are fast, but not what it means. If Cloudflare covers 1 in 5 sites, the
  other 4 in 5 rely on patching. That's the bridge to the twist, and it's currently missing.
- **Fix:** "Cloudflare, which sits in front of one in five websites, says it saw tens of thousands of attempts in the
  first forty-five minutes. Millions within a day." (27 w) If over budget, drop the 1-in-5 clause and let the dome show
  it, with "after the fix went public" as an on-screen tag.
- **Visual conflict (fix regardless of script):** the storyboard's dome covers "most (not all) of the city". The fact is
  about a fifth to a quarter. Shrink the dome to cover a district, so the uncovered city does the explaining.

### S12. "Nobody knows yet how many got in." (47.3 s, 7 w)
- Honest, and the right instinct (brief §18 to 19: say what's uncertain). Keep the idea.
- **But "got in" to what?** Without S3's missing "take over the site" line, "got in" has no picture. With that line in
  place, this sentence works.
- It also dead-ends: no BUT or SO links it to the next beat.
- **Fix:** keep it only if there's room after the stakes line exists. Otherwise cut. The uncertainty is already implied
  by "attempts". If kept, the safe wording: "No one knows yet how many got in."

### S13. "So now comes step two, the slow one." (49.8 s, 8 w)
- Callback to the broken frame (see S4 to S8). "The slow one" collides with "14 years".
- **Fix:** replace with the twist marker, "Here's the catch:", followed by the real distinction (see S14).

### S14. "Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit." (52.7 s, 24 w)
- **"Someone"** dodges the question the ending then answers with jargon. Name it once, plainly: "whoever runs each site".
- **"22 million copies of PHP"** is the wrong unit and an unattributed single estimate. It's Palo Alto's "22.6 million
  exposed instances, *potentially* vulnerable": internet-facing services, not copies and not websites. Other scanners
  count 2 to 41 million. A viewer can't do anything with "22 million copies" anyway: is that a lot of the web?
- **"Could be hit"** is vague: hit by what?
- **The better fact for this slot proves "slow" with a real denominator:** "A day after the fix came out, fewer than 1 in
  100 PHP servers anyone could check showed it installed." (OX Security: 14,151 of 1,974,890, 0.7%; based on reported
  versions, so it overstates "unpatched" somewhat. **Single vendor source; I could not re-find it myself. Open the page
  before using it.**)
- **Fix (no new numbers):** "There's no 'update all' button for the internet. Whoever runs each site has to install the
  fix." (17 w) Optionally add the OX line if it checks out, or "millions of servers" if a count is needed.
- Visual: the S10 hillside of doors with one fixed door already *is* this idea. With OX's 0.7%, about 4 or 5 of the
  roughly 650 doors would show the fix. Fits as is.

### S15. "If a site can't update fast enough, the safest thing is to switch it off until it can." (59.8 s, 18 w)
- **The real payoff, in the wrong place** (59.8 s; the brief wants 45 to 55 s, then end).
- It's stated as the narrator's opinion. It's actually **the official advice**, which is both more credible and more
  surprising: the FBI, NSA, UK NCSC, BSI and CERT-EU all said patch it or take it offline (FBI Cyber Division on X,
  Oct 21; NSA advisory). Saying who said it turns a generic line into a "wait, seriously?".
- **Fix:** "So the FBI's advice: can't update? Take it offline." (9 w) Caveat: one outlet couldn't confirm the FBI post
  came from an official account. The NSA and NCSC advisories say the same thing, so the claim stands; keep the on-screen
  credit generic ("FBI · NSA · UK NCSC") with no seals.

### S16. "That's what those government sites did." (6 w)
- The best structural moment: it closes the hook's open loop. Keep it.
- **Optional upgrade:** "That's what those governments did. Some before the fix even existed." It makes the precaution
  logic sharper, since off was the only lock available.

### S17. "And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore." (66.4 s, 22 w)
- **Wrong place**: a new twist *after* the payoff. Move it before S15, so "take it offline" is the answer to both the
  speed problem and the old-version problem.
- **Denominator, heard vs. meant**: "one in three sites on PHP" in fast speech becomes "one in three sites". Stress
  "PHP *sites*".
- **Understated**: PHP 7, 5 and 4 alone are 34.7% of PHP sites with a known version. Add PHP 8.0 and 8.1, also out of
  support, and it's about half (an estimate mixing two W3Techs snapshots). Other counts agree (CybelAngel 59% of hosts).
- **Nuance**: PHP did publish source-only backports for 7.4, 8.0 and 8.1, and Linux distributions and hosts ship patched
  builds of old versions. So "don't fix it anymore" should be "no longer *release* fixes for".
- **Fix:** "And about half of PHP sites run versions so old, PHP no longer releases fixes for them." (16 w)
  Conservative fallback if the fact-check won't sign off on "about half": "more than one in three".

### S18. "For those, it's switch off or hope the hosting company sorts it out." (73.3 s, 13 w)
- **"Hosting company"** has low recognition, appears for the first time in the last sentence, and gets no explanation.
- **"Sorts it out"** is vague.
- **Misleading by omission**: the real fix (upgrade to PHP 8.2 or later, or install a host or distro backport) is left
  out, so "hope" becomes the takeaway.
- **It's a shrug, not a consequence** (mistake 3), and a clever-sounding ending that doesn't follow (mistake 8). It also
  speaks only to site operators, not to the viewer.
- What it does well: it ends on "switch off", which loops back to the first line. Keep that word at the end.
- **Fix: end on the viewer.** "So if a site you use goes dark this week, that's the safe version. Your phone needs
  nothing. Worry about the ones nobody's looking after. The ones that never switch off." (31 w) "Never switch off"
  loops into "just switched off their own websites". (Phones: Malwarebytes, Newsweek, Bluewin: no action needed on
  your own devices. "The ones nobody's looking after" is the logical consequence of the old-version fact, not a
  separate claim; flag it **[judgment]** in the fact sheet.)
- Visual: the payoff needs one viewer-side beat. In-world option: a citizen on the street glances at a phone showing a
  check (small addition), while across the city, lit, neglected buildings with chipped, aged plaques stay open (the
  existing S12 "old plaque" asset). A full phone close-up would leave the city (moderate departure; not needed).

---

## 4. Jargon and names audit

| Term in script | Problem for a general viewer | Fix |
|---|---|---|
| PHP | Very low recognition (Reuters had to run "What is PHP?"). Introduced once, with the wrong anchor. | The approved bait line plus "It's the code running about 7 in 10 websites", said back to back. |
| "programming language" | Fine, but "code" is warmer and shorter. | "the code running..." |
| WordPress | Low to medium recognition among 18 to 40s, no added scale, implies the wrong fix. | Cut from the hook. Optional site-owner line: "Updating WordPress won't fix it." |
| "security bug" | Says nothing about danger. | "a flaw that can let a stranger take a website over. No password." |
| "two security teams using AI tools" | Unnamed actors plus a buzzword that never pays off. | "found quietly, with help from AI." |
| "the people who make PHP" | Good gloss, but used twice (10 words). | "PHP's makers" (once), or drop. |
| Cloudflare | Medium recognition; "big chunk of the web" is empty. | "which sits in front of one in five websites" (or let the dome show it). Optional anchor from the audience file: "the company behind those 'Verify you are human' pages" (not every such page is Cloudflare's, so say "those", never "every"). |
| "break-in attempts" | Easily heard as "break-ins". | "attempts" |
| "copies of PHP" | Wrong unit. | Cut, or "millions of servers". |
| "version" | Fine in context, if "so old" carries the meaning. | Keep, with "so old". |
| "hosting company" | Unknown category, first used in the last line. | "whoever runs each site" (said earlier, at the twist). |

---

## 5. Denominator audit (every number in the script)

| Number | What the viewer hears | What it actually measures | Verdict | Fix |
|---|---|---|---|---|
| "four countries" | "only four" | At least 8 (NL, FI, FR, BE, DE, CZ, UK, AU), plus Japan per Reuters | Wrong | "at least eight countries" |
| "about 7 out of 10 websites" | "7 of 10 sites I use" | ~70% of sites whose server language W3Techs can detect (top 10M), by count, not traffic | True with caveat | Say "websites"; footnote "of sites whose language is known · W3Techs" |
| "14 years" | "Nobody saw it for 14 years" | The code dates to 2012; the weakness was flagged in 2020 and 2024 | Misleading | Cut, or "in PHP since 2012... spotted two years ago" |
| "two security teams" | (nothing usable) | Calif + Wiz (press credits OpenAI, Wiz, Calif) | Accurate, useless | Cut the count |
| "in August" | (nothing usable) | Aug 1 to 24 discovery and reports | Accurate, useless | Cut |
| "hours before the fix" | "a few hours" | ~18 to 22 h (CVE IDs + exploit video); attempts days earlier | Misleading | "a day early" |
| "tens of thousands ... in 45 minutes" | 45 min after what? | After the public announcement; the CEO's post; mostly blocked attempts | Missing anchor | "in the first 45 minutes" + on-screen "after the fix went public" |
| "millions by evening" | whose evening? | "millions now", posted late Wed US time | Loose | "Millions within a day." |
| "22 million copies of PHP" | 22M websites at risk | 22.6M internet-facing "instances potentially vulnerable", one vendor (others: 2 to 41M) | Misleading unit | Cut, or "millions of servers", or attribute |
| "one in three sites on PHP" | "1 in 3 websites" | 34.7% of PHP sites with a visible version on PHP 7/5/4; ~50% including 8.0/8.1 | Understated + mishearable | "about half of PHP sites" (estimate), stressing "PHP" |

---

## 6. Structural problems (bigger than any single line)

1. **No stakes beat.** Brief §11: 3 to 10 s is "STAKES (human consequence or central question)". The script spends
   4.8 to 11.6 s on "they were fixing a security bug in PHP behind WordPress". The danger is never named anywhere.
2. **The explanation slot goes to scaffolding.** 11.6 to 23.7 s (12 s, 16% of the runtime) is "two steps / you'd think /
   14 years", with one misleading fact. That's the brief's prime explanation window (10 to 30 s).
3. **The comparison frame contradicts itself** (finding took 14 years; installing is "the slow one").
4. **The payoff is late, and then a twist follows it.** Payoff at 59.8 s; twist at 66.4 s; shrug at 73.3 s. The order
   should be twist, then payoff, then end.
5. **The ending talks to site operators, not to the viewer.** There's no line for the person watching.
6. **Overlength.** 226 words / 77.8 s. At 165 to 175 wpm the target is about 150 to 170 words. Nearly every fix above saves
   words. The two that add words, the stakes line and the viewer line, are the two that matter most.

---

## 7. The one big familiar question

The script needs one question a non-coder has already asked themselves. Ranked:

1. **"If there's a fix, why are websites still going dark?"** (Recommended.) Everyone knows "just update it" from their
   phone. The answer is the whole story: there's no "update all" button for the internet, each site has to install it,
   about half run versions too old to get it, so until then off is the safe setting. It directly explains the hook,
   and it uses a habit every viewer has (phone updates).
2. "Do I need to do anything?" Personal and shareable, but it answers in one line ("No, your phone's fine"), so it works
   better as the closing consequence than as the episode's question.
3. "Is AI finding bugs faster than we can fix them?" Big and familiar, but it's a different episode, and the general law
   isn't supported (the audience file flags this as interpretation).

The question doesn't need to be spoken. It needs to be what the hook raises and what the payoff answers. With S1/S2
fixed ("switched off their own websites. Not a hack. A precaution."), the viewer asks "against what?", then "so why not
just fix it?". The script answers both.

---

## 8. What the fixes add up to (proof of concept, not a rewrite)

This is only to show that the fixes fit the time budget and keep the city world. Rewriters own wording, cues and the
engagement layer.

> Governments in at least eight countries just switched off their own websites. Not a hack. A precaution, against a flaw
> in PHP. The language everyone loves. It's the code running about seven in ten websites, and this flaw can let a
> stranger take one over. No password.
> [It was found quietly, with help from AI.] But word leaked a day early, and attackers were trying it before the fix was
> even out.
> Cloudflare[, which sits in front of one in five websites,] says it saw tens of thousands of attempts in forty-five
> minutes. Millions within a day.
> Here's the catch: there's no "update all" button for the internet. Whoever runs each site has to install the fix. And
> about half of PHP sites run versions so old, PHP no longer releases fixes for them.
> So the FBI's advice: can't update? Take it offline. That's what those governments did.
> So if a site you use goes dark this week, that's the safe version. Your phone needs nothing. Worry about the ones
> nobody's looking after. The ones that never switch off.

- 179 words as written (about 61 s at 175 wpm). Without the two bracketed pieces it's about 162 words (about 56 to 59 s).
  If the AI sentence goes, "word leaked" needs one clause of secrecy before it ("The fix was being made in secret.").
- Structure: hook 0 to 3 s; stakes ("take one over, no password") by about 12 s; race (leak, attempts) to about 30 s;
  twist (no "update all" button, half on old versions) about 30 to 45 s; payoff (FBI: take it offline; that's what they
  did) about 45 to 52 s; viewer consequence and loop to the end.
- Tell-a-friend version is now possible: "A flaw in the code under most websites lets strangers take them over. The fix
  is out, but every site has to install it, so off is the safe setting until they do."

## 9. Visual-world impact of these changes

| Change | Fit with the city / blueprint / dome world |
|---|---|
| "at least eight countries" | Fits. S01's four buildings stay; drop the four pennants or show eight. |
| "take one over, no password" | Small addition: the short-bolt lock opens to a bare hand, shown as a blueprint diagram, so the "never get in" rule for real buildings holds. |
| Cut "two steps / 14 years" (S03 to S04, about 12 s) | **Biggest change.** The stoop and year-pages go, or the risers are relabelled "make the fix" (workshop, once) and "install it" (keeper, every door). It stays in-world, but S03 to S04 need re-staging. |
| AI compressed to one clause | Fits. S05's sparkle tablets shrink to one 2 to 3 s beat. |
| "a day early" + attempts before the fix | Fits. The S07 board, with the sun clock spinning a full day, not "hours". |
| Cloudflare 1 in 5 | **The visual must change regardless:** shrink the dome to about a fifth of the skyline. |
| "No 'update all' button" | Small addition: Pip presses a big "update all" button on the board and nothing happens; or a keeper climbs to one door. The S10 hillside is already the right picture. |
| "about half on old versions" | Fits. S12's aged plaques, now on about half of the doors. |
| FBI advice | Moderate addition: a city loudspeaker or billboard, no seals or logos (per fact sheet). |
| Viewer ending ("your phone needs nothing", neglected sites stay open) | Small addition: a passer-by's phone with a check, plus aged-plaque buildings still lit and unlocked. A phone close-up would leave the world (moderate; avoid). |

---

## 10. The 5 most important changes

1. **Say what the flaw lets someone do, by about 10 s.** "...and this flaw can let a stranger take a website over. No
   password." The current script never says it, so "nobody hacked them", "break-in attempts", "how many got in" and
   "switch it off" all lack stakes. Replace "They were fixing a security bug" (wrong: most went dark *before* the fix
   existed) with "Not a hack. A precaution, against a flaw in PHP".
2. **Kill the "two steps / you'd think finding is hard / 14 years nobody did / step two, the slow one" frame (about 40
   words, about 14 s).** It's school-presentation scaffolding, it's misleading (PHP's team spotted the weak spot in
   2024), and it contradicts itself (14 years to find vs. "the slow one" to install). Replace it with the true
   distinction, said once at the twist: "There's no 'update all' button for the internet. Whoever runs each site has to
   install the fix." That's the one familiar big question ("if there's a fix, why are sites still going dark?") and its
   answer.
3. **Give every name an anchor and every number its denominator.** PHP: "The language everyone loves" followed
   immediately by "It's the code running about seven in ten websites" (footnote: of sites whose language is known).
   WordPress: out of the hook. Cloudflare: "sits in front of one in five websites" (and shrink the dome to match).
   "45 minutes" is "first 45 minutes" after the fix went public; "by evening" becomes "within a day"; "break-in attempts"
   becomes "attempts". "Four countries" becomes "at least eight". "22 million copies" is cut (or "millions of servers").
   "One in three sites on PHP" becomes "about half of PHP sites". "Hours before" becomes "a day early, and attackers were
   trying it before the fix was out".
4. **Reorder the back half: twist, then payoff, then end.** Move the old-versions fact *before* "take it offline". Make
   the payoff the official advice, not the narrator's opinion: "The FBI's advice: can't update? Take it offline. That's
   what those governments did." It currently lands at 59.8 s, with two more beats after it.
5. **End on the viewer, not on "hope the hosting company sorts it out."** Cut the unexplained "hosting company" shrug
   (it also leaves out the real fix, upgrading). Close with the ordinary-person consequence and keep "switch off" as the
   loop word: "So if a site you use goes dark this week, that's the safe version. Your phone needs nothing. Worry about
   the ones nobody's looking after. The ones that never switch off." Together with changes 1 to 4, this brings the
   script from 226 words / 77.8 s to about 160 to 180 words / 56 to 61 s.

---

## Verification log (this pass, 2026-10-24)

- **WebFetch of w3techs.com failed (DNS: ENOTFOUND).** No primary page could be opened. Everything below rests on
  WebSearch extracts, plus the two input files (which were built the same way).
- **Confirmed via search extracts:**
  - W3Techs "PHP is used by 70.8% (Jul 15 2026) / 70.5% (Aug 4 2026) of all the websites whose server-side programming
    language we know". Aug 2026 versions: v8 62.5%, v7 29.4%, v5 8.0%.
  - No action needed on viewers' phones or computers (Bluewin, Newsweek, Malwarebytes).
  - Updating WordPress, plugins or the CMS doesn't fix it; the fix has to come from the host, distro or container image
    (martincid.com, CybelAngel, The Hacker News). PHP releases no fixes for branches older than 8.2 (THN).
  - The FBI said patch or take systems offline until mitigated (Defense One, Business Today, OfficeChai). One outlet
    couldn't confirm the X account is official, so pair it with the NSA/NCSC advisories.
  - Countries with sites pulled offline: NL, FI, AT, DE (Mainz/Rhineland-Palatinate), UK (councils, Met Police), FR,
    DK, CH, LU (press reports, no single authoritative list). "At least eight" is safe; "four" is not.
  - The attack is an unauthenticated web request that runs code on the server with the web process's permissions
    (Harness, Island, Techzine, IT Pro Expert, Canadian Cyber Centre via the input files).
- **Not re-confirmed in my pass (rely on the fact sheet's sources; open before lock):**
  - The Cloudflare CEO's counts ("tens of thousands in 45 minutes", "millions"). My searches only surfaced Cloudflare's
    blog/CTO statements (WAF rules live 03:02 UTC Oct 21; attackers adapting payloads), with no counts. The fact sheet
    cites The Register, TNW, Neowin and BetaNews quoting his X post.
  - OX Security's "0.7% patched after 24 h" (single vendor source in the fact sheet; no hit in my search).

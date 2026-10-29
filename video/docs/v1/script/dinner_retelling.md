# Dinner retelling: PHP2Shell, told out loud (RULE #1 test)

Pass done 2026-10-24. The setup: a 29-year-old non-technical American read about this story today and is telling it to a
friend over dinner. The friend codes, which is why the "PHP, the language everyone loves" tease is in there. Every fact
comes from the safe wording in `fact_sheet.md` (FS) and the facts already in `final_draft.md`, and nothing new was added.
The point is to hear how a real person would say it and then bring the most natural phrasings back into the voiceover.

---

## The retelling (said out loud)

Okay, so a bunch of European governments turned off their own websites this week, like on purpose, because there's this
flaw where a stranger can take over a website without even needing a password. And it's in PHP, the language everyone
loves, and about seven in ten websites run on it. It's been in there like fourteen years, and nobody knew how bad it was
until researchers using AI figured it out. But word leaked a day before the fix came out, and hackers were already trying
it. Cloudflare's CEO says once it went public they saw tens of thousands of attempts in forty-five minutes, and millions
within a day. And fixing it is a whole thing, because somebody has to install it on every single server, and like half
the sites on PHP are on versions so old they're not even officially supported anymore. So even the FBI said if you can't
update, just turn it off for now, which is basically what IT tells you about everything. And that's what those
governments did.

- **175 words** (`wc -w`), 8 sentences, 12 commas. That's 63.6 s at 165 wpm (60.0 s at 175, 67.7 s at 155). Using the
  recorded-voice rule of thumb from `final_draft.md` §3 it comes to about **55 s**.
- I checked it for every AI tell in the brief's RULE #1 list. There are no "X. Not Y." contrasts, fragments, colons,
  questions, em-dashes, semicolons or lists of three, and none of the stock reveal phrases. The only crafted line is the
  approved bait.

---

## Phrasings that sound more natural than the draft's, and why

Each item shows the `final_draft.md` wording, then the retelling's wording, then why the retelling version sounds more
like a person talking.

1. **"Governments across Europe switched off their own websites on purpose this week."** → **"a bunch of European
   governments turned off their own websites this week, like on purpose"**
   "Across Europe" is how a news anchor talks, while "a bunch of" is how people talk about a number they don't know
   exactly. "Turned off" is the American verb ("switched off" sounds a bit British). Putting "like on purpose" at the end
   is where a person puts the part they can't believe, so the stress falls there without any CAPS.

2. **"They did it because of a flaw that can let a stranger take over a website without a password."** → **"…because
   there's this flaw where a stranger can take over a website without even needing a password."**
   "There's this…" is the most common way people start telling a story. The draft breaks the thought into two sentences
   and then restarts with "They did it because", which sounds like an essay explaining itself. "Without even needing a
   password" uses "even" to carry the disbelief the way a person would. "A flaw that can let" is a written relative
   clause, and "a flaw where a stranger can" is the spoken version. The "can" stays because the FS says how reliable the
   exploit is is still disputed.

3. **"It's in PHP, the language everyone loves, and about seven in ten websites run on it."** → **"And it's in PHP, the
   language everyone loves, and about seven in ten websites run on it."**
   It's nearly the same, because the draft already had this line right. The leading "And" makes it the next thing you'd
   tell someone, so it doesn't sound like a new announcement. The bait still goes straight into the fact with nothing in
   between (brief, engagement layer).

4. **"That flaw had been sitting there for fourteen years, until researchers using AI figured out how bad it was."** →
   **"It's been in there like fourteen years, and nobody knew how bad it was until researchers using AI figured it out."**
   "Had been sitting there" is past perfect, which is narration tense. People say "it's been in there". "Like fourteen
   years" is the natural spoken hedge, and it's accurate, since the code dates to PHP 5.4.0 in March 2012, about 14½
   years ago (FS 7). Saying "nobody knew how bad it was" first and only then naming who figured it out is how people tell
   it, and it keeps the FS point that the weak spot had been noticed but never proven dangerous.

5. **"But word got out about a day before the fix did, and attackers were already trying it."** → **"But word leaked a
   day before the fix came out, and hackers were already trying it."**
   "Before the fix did" is a written ellipsis, and nobody says that out loud. "Came out" is how people talk about any
   release. "Attackers" is security-industry vocabulary, and "hackers" is the word a non-technical person actually uses.
   The line keeps "and" rather than "so" for the reason in FS 10 (Amazon saw an attempt on Oct 17, before any leak).

6. **"Once it was announced, Cloudflare's CEO says they saw…"** → **"Cloudflare's CEO says once it went public they
   saw…"**
   When people pass on something someone said, they name who said it first ("my boss says…"). The draft opens with a
   passive time clause, which sounds like a press release. "Went public" is active and everyday. It still marks the
   start of the forty-five minutes as the public announcement, and it doesn't blur with "word leaked" (FS 12).

7. **"You'd think everyone would just install the fix, but somebody has to put it on every single server."** → **"And
   fixing it is a whole thing, because somebody has to install it on every single server"**
   "You'd think…, but…" sets up an expectation and then knocks it down, which is a mild version of the "Not X. Y."
   shape. "It's a whole thing" is very everyday American for "harder than it sounds", and then "because" just gives the
   reason. That means it's a plain BUT/SO link with no setup in it.

8. **"And about half the sites running PHP are on versions so old they're not even officially supported anymore."** →
   **"…and like half the sites on PHP are on versions so old they're not even officially supported anymore."**
   It joins the server point with "and" so it lands as one reason why fixing is a pain, instead of a new numbered point.
   "Like half" is how people hedge an estimate out loud, and "sites on PHP" sounds more casual than "sites running PHP".
   "Officially" stays because it's what makes the line accurate (source-only backports, distro builds, FS 17). For the
   voiceover, "about half" is safer if "like" twice in one minute feels sloppy.

9. **"So the official advice, even the FBI's, was basically what tech support always tells you. Turn it off until you
   can update it."** → **"So even the FBI said if you can't update, just turn it off for now, which is basically what IT
   tells you about everything."**
   "The official advice, even the FBI's" is a parenthetical that nobody says out loud. The draft also builds a setup and
   then gives a separate punch sentence, which is close to a colon reveal. In the retelling the advice comes first, the
   way you'd pass it on, and the joke trails off as an aside with "which is basically…". That's how people add a joke at
   dinner, and that way it comes out of the situation instead of being staged. "IT" is the word people use at work.
   "Just… for now" keeps the advice temporary, like the FBI's ("offline until it can be fully mitigated"). "Even the
   FBI" puts the FBI among others, so it doesn't sound like Europe followed the FBI.

10. **"And that's what those governments did."** → kept word for word. It's plain speech and it closes the loop. I
    didn't add a coda.

**Patterns worth carrying into the voiceover, beyond single lines:**
- **Fewer full stops.** The retelling has 8 sentences against the draft's 11, because a person links thoughts with
  "because", "and" and "which is" instead of starting over.
- **The attribution comes first** ("Cloudflare's CEO says…", "So even the FBI said…"), the way people pass on what
  someone told them.
- **Hedges go where a person would actually be unsure** ("a bunch of", "like fourteen years", "like half"), and nowhere
  else. Keep at most two "like"s in the recorded version so it doesn't sound put on.

---

## Accuracy check (FS rows)

| Retelling says | FS basis |
|---|---|
| "a bunch of European governments… this week, like on purpose" | FS 1–2: NL, FI, FR, BE, DE, CZ, UK firmly sourced (plus AU, and JP per Reuters). Voluntary and precautionary, on Wed Oct 21. "European" doesn't rule the others out. Change it to "last week" after Sun Oct 25 |
| "a stranger can take over a website without even needing a password" | FS "what the bug lets an attacker do": unauthenticated code execution, hedged with "can" |
| "about seven in ten websites run on it" | FS 5: W3Techs, of sites whose server language is known. The denominator stays on screen |
| "like fourteen years… nobody knew how bad it was until researchers using AI figured it out" | FS 7–8: the code dates to 5.4.0 (2012), it was spotted but never proven dangerous, and the research was human-led with AI helping |
| "word leaked a day before the fix came out, and hackers were already trying it" | FS 10: word (not the technical details) leaked ~18–22 h early, and attempts started before the fix existed. "And", not "so" |
| "Cloudflare's CEO says… tens of thousands of attempts in forty-five minutes, and millions within a day" | FS 12: Prince on X, counted from the public announcement, "attempts" (mostly blocked) |
| "somebody has to install it on every single server" | FS extra fact 5: the fix comes from whoever runs the server |
| "like half the sites on PHP… not even officially supported anymore" | FS 17: an estimate of ~50% of PHP sites that show their version. The fallback is "more than a third". Credit on screen |
| "even the FBI said if you can't update, just turn it off for now" | FS 15: FBI Cyber Division, "take the system offline until it can be fully mitigated" |
| "that's what those governments did" | FS 16 |

**Visuals:** nothing here needs a different world from the city, blueprint and elephant one. The beats map onto the
same scenes `final_draft.md` §8 already lists. The one thing still needed is the on-screen Cloudflare label ("sits in
front of about 1 in 5 websites"), because the retelling, like the draft, doesn't explain Cloudflare out loud.

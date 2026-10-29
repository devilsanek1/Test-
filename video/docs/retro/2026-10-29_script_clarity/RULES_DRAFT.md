# Script clarity: the rule text, doc by doc (draft, 2026-10-29)

**Status: DONE (draft for the integration step).** The exact new text for each doc, and the exact text it replaces.
The method behind it: `PRINCIPLES.md` (9 principles, the structure of a 40-second script, the v1-v5 corpus); the check:
`LINT_SPEC.md`. Rank (CLAUDE.md): the owner's words > DIRECTION > CRAFT > PIPELINE_V2 > ...; so the playbook's
bullet is the source and every other doc points at it, never restates it differently.

**The owner's words, verbatim** (`video/docs/v4/OWNER_NOTES.md`, 2026-10-29 ~11:30 UTC; typos kept, as the playbook
keeps them elsewhere): "so what i don;t like about these scripts we write lately is we are being too ambiguous and
weird at times"; on line 1: "great thats what i would like to tell my friends."; on line 2: "what is it? Like which
chips? We are talking about reaching the biggest audience and getting the engagement - but we would lose people on
this sentence. Like we need to ask ourselves - is that sentence good and will be received well by regular people?
Chips is a word not a lot of people would understand."; on line 3: "also similarly the next one too."; on line 4:
"this is directionally okay, but still weird we need a simpler less scandalous language."; on line 5: "also find an
easier, simpler way to land the thought. I think you are having some deeper thought here and you choose to be obscure
about it. So i think you want to say that in a typical datacenter here is what happens. When you say "almost
everywhere" - this is very ambigous like what do you mean? we lose people here."; on line 6: "this is again too
ambiguous for the audience. When you say IT - what exactly is it - heat or air or sea?". Earlier, the same lesson:
"Who even knows WordPress now?" (v1, `docs/CREATIVE_BRIEF.md`, "The user's note on THIS script").

## Summary: what changes where

| Doc | What | Merges / retires |
|---|---|---|
| `video/docs/OWNER_PLAYBOOK.md`, Script and voice | 1a: the CLEAR bullet gets the method (8 rules and the check), the owner's quotes verbatim | absorbs the "Everyday spoken language" half of the next bullet |
| same | 1b: that next bullet splits into RULE #1 (AI-sounding wording) and the rhythm rule, whose short line keeps its noun | "Everyday spoken language" moves into 1a; nothing retired |
| same, Taste signals | 1c: "Lines: plain, direct and personal over clever" points at 1a and narrows "a question to the viewer works as a hook" to a friend's question | the "question to the viewer" clause narrowed (it already clashed with "never baity"); no rule reversed, so nothing moves to "Retired" |
| same, Hook and pacing | no change (why: 1e) | none |
| `video/docs/PIPELINE_V2.md`, the G1 bullet | 2a: the writer's clarity pass, the critic's cold viewer panel, what counts as a finding | none |
| same, gates table G1 row and tooling table | 2b: the panel and `check_clarity.py` named | none |
| `video/docs/CREATIVE_BRIEF.md`, the banner | 3: one new bullet: clarity updates §11-17 and RULE #1 | narrows §14-17's "natural American expressions" and "dry ... humour" |
| `CLAUDE.md`, the script bullet | 4: one clause | replaces "Everyday spoken language, no AI-sounding phrasing;" |
| the G1 briefs and template | 5: the integration list | none |

---

## 1. `video/docs/OWNER_PLAYBOOK.md`

### 1a. Script and voice: the CLEAR bullet

**Replaces** (the whole bullet as it stands now, lines 64-77):

> - **CLEAR TO A REGULAR PERSON ON ONE HEARING: every sentence is understood the first time, at feed speed, by regular
>   people, never only by us.** Ask of every sentence: "is that sentence good, and will it be received well by regular
>   people?" Name every thing in everyday words before talking about it (no bare tech words: "the chips", "a cabinet of
>   them"; a common word with a tech meaning, like "chips", misleads); every "it", "that", "this" or "they" points at
>   one obvious thing, or say the noun again ("But Helsinki WANTS it": the heat, the air or the sea?); say the plain
>   thought itself, never a compressed or clever hint at a deeper one, and no vague scope ("almost everywhere": say what
>   happens, e.g. "in a typical data center, here is what happens"); jokes in simple, gentle, everyday words, never weird
>   or cheeky. Ambiguous or weird loses the biggest audience, the one we write for. The method (research, principles,
>   the clarity check): `docs/retro/2026-10-29_script_clarity/`. — ("so what i don't like about these scripts we write
>   lately is we are being too ambiguous and weird at times"; "We are talking about reaching the biggest audience and
>   getting the engagement - but we would lose people on this sentence. Like we need to ask ourselves - is that sentence
>   good and will be received well by regular people? Chips is a word not a lot of people would understand"; "we need a
>   simpler less scandalous language"; "I think you are having some deeper thought here and you choose to be obscure
>   about it"; "When you say IT - what exactly is it - heat or air or sea?", v4 G1, 2026-10-29).

**New text:**

```
- **CLEAR TO A REGULAR PERSON ON ONE HEARING: every sentence is understood the first time, at feed speed, by regular
  people worldwide (many learned English at school; they read the captions as it plays and can't rewind), never only
  by us.** Ask of every sentence the owner's question, "is that sentence good and will be received well by regular
  people?", and write it as news you'd pass to a friend (v4's line 1, "Did you know Helsinki wants AI to heat seventy
  thousand homes?": "great thats what i would like to tell my friends"). How (the principles, their research and the
  failures of v1-v5: `docs/retro/2026-10-29_script_clarity/PRINCIPLES.md`):
  - **Everyday names, one per thing:** call each thing what regular people call it and keep that one name all film;
    no trade words, and no common word in its trade sense ("the chips", "a cabinet of them": to most people chips are
    food). A term the story needs is described once, plainly, where it first appears ("buildings called data
    centers"). Rounding a thing to its everyday form is the licence "generalizing is fine" gives (a 72-chip rack is
    "one stack of these computers").
  - **Introduce, then point:** "the X", "those X", "that hot" only for what the script already said; every "it",
    "they", "this" or "that" points at ONE obvious thing in the line before, or say the noun again ("But Helsinki
    WANTS it": the heat, the air or the sea? -> "But Helsinki wants that heat."). A short line keeps its noun.
  - **The plain thought, as the typical case:** say who does what, where, in physical words; never a compressed or
    clever hint at a deeper thought, and no vague scope ("almost everywhere": say what happens, e.g. "in a typical
    data center, here is what happens"). Test: write "What I mean is: ___" under the line; if that is clearer, it
    becomes the line.
  - **One new idea per sentence, hooked onto the last:** each sentence starts from what the listener just heard and
    ends on its new part; the joins are said and true ("but", "so", "because"); the line right after the hook gives
    the plain base (what makes the claim possible) at once, so the viewer wonders about the story ("how?"), never
    about a word ("which chips?"). The beat order: PRINCIPLES.md, "How a 40-second script is structured".
  - **Literal words for a worldwide ear:** no idioms, slang or wordplay to decode ("first dibs", "by the mountain").
  - **The one joke is the plain situation, said kindly:** one step, in simple, gentle, everyday words, never weird,
    cheeky or scandalous ("nobody's even ..."); after one hearing a viewer smiles AND can say the point, or it goes.
  - **Numbers and comparisons by ear:** one number per sentence, round, tied to an everyday thing; a comparison says
    what is alike ("as much heat as forty kettles", never only "like forty kettles").
  - **Checked, never assumed:** `scripts/voice/check_clarity.py` OK at G1 (it raises questions; it never passes a
    line), then the G1 critic's cold viewer panel (`docs/PIPELINE_V2.md`, G1): three regular people hear the
    narration once, sentence by sentence, and any line one of them gets wrong, misses or has to re-link is rewritten.
    A readability score proves nothing ("The chips get that hot." scores as the easiest line), and neither does our
    own ear: we know what we meant.
  A line written to draw comments is clear first: people argue with what they understood, and swipe past what they
  didn't. Ambiguous or weird loses the biggest audience, the one we write for. — ("so what i don;t like about these
  scripts we write lately is we are being too ambiguous and weird at times"; "We are talking about reaching the
  biggest audience and getting the engagement - but we would lose people on this sentence. Like we need to ask
  ourselves - is that sentence good and will be received well by regular people? Chips is a word not a lot of people
  would understand"; "this is directionally okay, but still weird we need a simpler less scandalous language"; "I
  think you are having some deeper thought here and you choose to be obscure about it. So i think you want to say that
  in a typical datacenter here is what happens. When you say "almost everywhere" - this is very ambigous"; "When you
  say IT - what exactly is it - heat or air or sea?", v4 G1, 2026-10-29; earlier, "Who even knows WordPress now?", v1,
  2026-10-24.)
```

**Why these changes:** the bullet already had the owner's rules; it gains the method (the principles as eight short
rules, each with the owner's or the corpus's example), the check (the lint and the panel, both new), the structure
(the base right after the hook: the owner's note on line 2) and the comment-line clause (the Audience and goal rule,
"comments are a massive plus", made safe: Bullock et al. 2019 found jargon raised resistance, not engagement). The
quotes are now exactly the owner's (the old bullet had "don't" and an inserted "it" in the question; the playbook keeps
the owner's spelling elsewhere, "ambigous" included), plus the tea line's quote and v1's WordPress note, so the rule
carries the evidence of two videos (Maintenance, step 3).

### 1b. Script and voice: the next bullet splits in two

**Replaces** (lines 78-80):

> - **Everyday spoken language; check every sentence for AI-sounding wording.** — (v1, 2026-10-24). **Rhythm: never a run of
>   long sentences; put a short one (5 words or fewer, e.g. "Let's find out." "But there was a problem.") after every 1-2
>   long ones, at the turns,** gated by `scripts/voice/check_rhythm.py` OK at G1. — (owner's reference reel, 2026-10-27).

**New text:**

```
- **Sound like a real person talking, never like AI (the brief's RULE #1): check every sentence for AI-sounding
  wording.** The everyday words themselves are the clarity rule's (above). — (v1, 2026-10-24).
- **Rhythm: never a run of long sentences; put a short one (5 words or fewer, e.g. "Let's find out." "But there was a
  problem.") after every 1-2 long ones, at the turns, and the short line keeps its noun** ("But Helsinki wants that
  heat.", never a bare "it" after three things it could mean: five of v4 draft 1's six short lines had shed their
  noun), gated by `scripts/voice/check_rhythm.py` OK at G1; rhythm OK is never evidence of clarity. — (owner's
  reference reel, 2026-10-27; v4 G1, 2026-10-29).
```

**Why:** "Everyday spoken language" now lives in 1a (everyday names, literal words), so it is merged, not lost; RULE #1
(AI-sounding phrasing) and the rhythm rule were two rules in one bullet and now stand apart; the rhythm rule gains the
one clause the corpus showed it needs (the rule pushed short lines toward pointers).

### 1c. Taste signals: "Lines"

**Replaces** (lines 426-427):

> - **Lines: plain, direct and personal over clever;** a question to the viewer works as a hook. A plain line needs the
>   frame-0 image, the first-second sound and the second line to bring the jolt. — (v3 G0.5-G2).

**New text:**

```
- **Lines: plain, direct and personal over clever** (how: Script and voice, CLEAR TO A REGULAR PERSON ON ONE HEARING);
  a friend's question works as a hook ("Did you know ..."), a sales question doesn't (Audience and goal: never baity).
  A plain line needs the frame-0 image, the first-second sound and the second line to bring the jolt. — (v3 G0.5-G2;
  v3 insights, 2026-10-28; v4 G1, 2026-10-29).
```

**Why:** "plain over clever" is the clarity rule's taste form, so it points there instead of standing alone;
"a question to the viewer works as a hook" came from v3's "Buying a laptop soon?", which the owner later read as an
ad (Audience and goal: never baity): narrowed to the friend's question the owner now models ("Did you know that
..."). Narrowed, not reversed, so nothing moves to "Retired".

### 1d. Script and voice: the STORY bullet

No change. Its "joinable by 'but', 'so' or 'because', never 'and also'" is the same rule as 1a's "the joins are said
and true"; 1a links to the structure that applies it.

### 1e. Hook and pacing

No change, checked line by line: the hook rules (frame 0, the payoff in words by ~2 s, the true claim with stakes,
natural personal framings, 30-45 s, joins on the beat) are about the picture and the claim; the one new hook rule, the
plain base right after the hook, lives in 1a with the other clarity rules, so the hook section keeps one subject.

### 1f. Last reviewed

The integration step updates the "Last reviewed for coherence" line and commits "Review owner playbook" (Maintenance,
step 5).

---

## 2. `video/docs/PIPELINE_V2.md`

### 2a. The G1 bullet

**Replaces** (lines 85-94):

> - **G1 script = story first (owner, 2026-10-26; lean since 2026-10-28):** one writer (1) drafts 2-3 competing story
>   spines (the throughline question, the viewer's situation, beats joined by but/so, the turn, the payoff that lands the
>   core line) and picks one, with its reason; (2) writes the script with cues; (3) runs `check_rhythm.py` and
>   `check_paste.py` until both pass. Then one critic: a cold retell (a list-like retelling fails), the first line heard cold: "ad or news?" (an ad-like or
>   baity opening fails: playbook, never baity), the flow (every line
>   follows from the previous) and the facts against the fact file, at most 6 findings; then one fix pass by the same
>   writer (resumed, not restarted). The through-line card's carriers come from the script's joins (G1 row). Never
>   structure a script as a list of facts to prove. **Rhythm (owner, 2026-10-27):** short sentences (<= 5 words) break up
>   the long ones, at least one after every 1-2 long sentences; the script must pass `scripts/voice/check_rhythm.py`
>   before it goes to the owner. The heavy version (~12 agents: `v3-g1-story-*.js`) runs only on request.

**New text:**

```
- **G1 script = story first, clear on one hearing (owner, 2026-10-26 and 2026-10-29; lean since 2026-10-28):** one
  writer (1) drafts 2-3 competing story spines (the throughline question, the viewer's situation, beats joined by
  but/so, the turn, the payoff that lands the core line) and picks one, with its reason; (2) writes the script with
  cues, in the beat order of `docs/retro/2026-10-29_script_clarity/PRINCIPLES.md` ("How a 40-second script is
  structured"); (3) **the clarity pass:** fills the film's word list `docs/vN/script/clarity.json` (the thread
  object's one everyday name and its rivals, the film's trade words with their plain descriptions:
  `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md`), writes "What I mean is: ___" under every line that leans on
  what the writer knows, and runs `check_clarity.py`, `check_rhythm.py` and `check_paste.py` until all three pass,
  answering every clarity warning in the script doc's "Checks" section (fixed, or why it stays). Then one critic, cold
  first (before the brief, the notes, the script doc or the fact file: only the spoken words): (a) **the cold viewer
  panel:** the critic plays three regular people in turn (the cards in the critic brief: a non-native English speaker
  who learned English at school, a non-tech adult, a fast-scrolling teen); each hears the narration once, one
  sentence at a time, never looking back or ahead, and after each sentence reports what they understood (in their
  own words), the words they missed or took another way, what each "it", "they", "this", "that" and new "the X"
  points at, and their thumb (stays, unsure, swipes) with why; (b) the cold retell (a list-like retelling fails);
  then (c) `check_clarity.py`'s questions put to the same three viewers, the first line heard cold: "ad or news?" (an
  ad-like or baity opening fails: playbook, never baity), the flow (every line follows from the previous) and the
  facts against the fact file. **A clarity finding** is any line a viewer retells wrong or can't retell, a word one
  of them doesn't know or takes in another sense, a pointer one of them resolves wrongly or not at all, a line one of
  them had to re-link to an earlier one, or an "unsure" or "swipe" thumb; each is listed by line, with the viewer's
  own words and a plainer line, and never waved through as "paid off by the next line". The panel's list is complete
  and all of it is fixed; the critic's other findings stay at most 6. Then one fix pass by the same writer (resumed,
  not restarted): every panel line rewritten, the three checks re-run, and the panel re-hears each changed line with
  the line before and after it. The through-line card's carriers come from the script's joins (G1 row). Never
  structure a script as a list of facts to prove. **Rhythm (owner, 2026-10-27):** short sentences (<= 5 words) break
  up the long ones, at least one after every 1-2 long sentences, each keeping its noun; the script must pass
  `scripts/voice/check_rhythm.py` and `scripts/voice/check_clarity.py` before it goes to the owner. The heavy version
  (~12 agents: `v3-g1-story-*.js`) runs only on request.
```

**Why:** the lean G1's critic checked the story, the opening, the flow and the facts, but no one checked the words
against a regular listener: draft 1's critic heard the snags at lines 2 and 7 and passed them as "paid off by the next
line each time ... no finding of their own" (`v4/archive/g1_draft1/critique_g1.md`). The panel adds no agent (the
critic plays it, cold, before reading anything but the spoken words), and its findings are uncapped because one unclear
line is a swipe. A played panel still knows every word, so each persona card says concretely what that viewer doesn't
know, and the lint's targeted questions come only after the cold pass, so they can't prime it.

**The three persona cards** (for the critic brief; the integration step puts them in the G1 critic template):

```
1. A NON-NATIVE ENGLISH SPEAKER (24, in São Paulo or Jakarta or Kraków; learned English at school; watches Reels with
   the captions on). Knows everyday words; takes every word in its most common, literal sense; knows no idioms beyond
   the most basic, no slang, no American cultural references; knows world-famous names only (Google, Apple, Microsoft,
   Amazon, Tesla, Netflix, the FBI), not company or product names from the news; misses irony.
2. A NON-TECH ADULT (45, a nurse or a bus driver; uses a phone daily, never thinks about how computers work). To them
   chips are food, a cabinet is a cupboard, a server is a waiter, the cloud is in the sky; knows "AI" and "chatbot"
   from the news, not how they work; a number means something only next to an everyday thing.
3. A FAST-SCROLLING TEEN (15; thumb on the screen, two seconds of patience). Knows apps and memes, not news, not trade
   words; swipes on the first line that doesn't make sense or sounds like an ad.
Each hears one sentence at a time, once, and answers only from that sentence and the ones before it.
```

### 2b. The gates table and the tooling table

- **Gates table, the G1 row, its last column** (line 45). Replaces: `one writer + one critic + one fix pass; 1 h, then 15
  min per round`. New: `one writer + one critic (with the cold viewer panel) + one fix pass; 1 h, then 15 min per
  round`.
- **Tooling table, the "G1/G2 voice" row** (line 208). Replaces: `paste-file rules + `check_paste.py`; `check_rhythm.py`
  (long sentences broken by short ones);`. New: `paste-file rules + `check_paste.py`; `check_rhythm.py` (long
  sentences broken by short ones); `check_clarity.py` (the clarity questions: trade words, pointers, vague scope,
  idioms, numbers; `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md`);`.

---

## 3. `video/docs/CREATIVE_BRIEF.md`: the banner line

**Adds** one bullet to "Later owner rules that update this brief", after "Accuracy (owner, 2026-10-29)":

```
> - **Clarity (owner, 2026-10-29):** every sentence is understood the first time by a regular person anywhere in the
>   world (many learned English at school), on one hearing at feed speed: everyday names, one per thing (never a
>   trade word like "chips" or "cabinet"); every "it" or "that" with one obvious target; the plain thought as the
>   typical case, never a hint; literal words; the one joke plain and kind. This sharpens §11-17 ("simple language",
>   "a great teacher's clarity") and narrows "natural American expressions" and "dry ... humour" to what a listener
>   needn't decode (no idioms, slang or irony); RULE #1 still holds (a real person talking), and the line must also be
>   understood at once. The method and the check: the playbook, "CLEAR TO A REGULAR PERSON ON ONE HEARING".
```

**Replaces:** nothing (a new bullet). **Why:** the brief's §14-17 asks for "natural American expressions" and "dry,
self-aware American" humour, and RULE #1 recommends natural hedges; the owner's clarity rule wins where they meet (an
idiom like "first dibs", irony like "nobody's even making tea"), while the plain hedges RULE #1 likes ("a bunch of",
"pretty much") stay: they are common words a non-native ear knows.

---

## 4. `CLAUDE.md`: the script bullet

**Replaces** (in "Top rules", the bullet "A script is one coherent story ..."): `Everyday spoken language, no
AI-sounding phrasing;`

**New text:** `Everyday spoken language a regular person gets on ONE hearing (everyday names, never a trade word like
"chips"; every "it" with one obvious target; the plain thought, never a hint; `check_clarity.py` OK and the critic's
cold viewer panel at G1), no AI-sounding phrasing;`

So the bullet reads: "A script is one coherent story (spine first; every line follows from the last), never a list of
facts. Everyday spoken language a regular person gets on ONE hearing (...), no AI-sounding phrasing; detailed emotional
cues. The narration is generated ..."

---

## 5. For the integration step: the other places that must agree

- **The G1 briefs:** `video/docs/v4/script/WRITER_BRIEF.md` and `CRITIC_BRIEF.md` (and v5's `WRITER_BRIEF.md`, with
  a `CRITIC_BRIEF.md` made from v4's): the writer's clarity pass and `clarity.json`; the critic's order (panel, then
  retell, then the lint's questions and the rest), the three persona cards, what a clarity finding is, the uncapped
  panel list; `check_clarity.py` beside `check_rhythm.py` and `check_paste.py` in every "run these checks" line.
- **The lean G1 workflow template** `context/workflows/v4-g1-script-lean-wf_c7c0628a-726.js`: its writer and fix-pass
  prompts name `check_rhythm.py` and `check_paste.py` (add `check_clarity.py`); its critic prompt says "cold retell
  first" (make it "the cold viewer panel first, then the cold retell").
- **Each film's word list** `video/docs/vN/script/clarity.json` (format: `LINT_SPEC.md`); v4's first, for the rework.
- **The playbook's Maintenance** (1f) and HANDOFF's log line: the orchestrator's.

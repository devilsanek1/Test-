# Script clarity (2026-10-29): integration log

**Status: DONE (2026-10-29 ~14:05 UTC).** Five files changed, nothing committed (the orchestrator commits; for the
playbook, the Maintenance message "Review owner playbook"). Inputs: BRIEF, PRINCIPLES, RULES_DRAFT, LINT_REPORT (the
tool exists, `--selftest` OK 33/33, so its rows went in). The owner's quotes in RULES_DRAFT were checked against
`video/docs/v4/OWNER_NOTES.md` (the ~11:30 UTC entry) and are verbatim, typos kept ("don;t", "ambigous"). Rank kept:
the playbook's CLEAR bullet is the source; PIPELINE_V2, the creative brief's banner, CLAUDE.md and v5's brief point at
it and never restate it differently.

At a glance:
1. Playbook: the CLEAR bullet gets the method (9 sub-rules, the check), the quotes verbatim; "Everyday spoken
   language" merged into it; RULE #1 and the rhythm rule split into their own bullets (short lines keep their noun);
   Taste signals' "Lines" points at it, narrows "a question to the viewer" to a friend's question, and its "second
   line ... jolt" now agrees with the base rule; "Last reviewed" updated.
2. PIPELINE_V2: the G1 bullet (the clarity pass, three checks, the critic's cold viewer panel first, what a clarity
   finding is, the uncapped panel list, the re-hear), the three viewer cards, the G1 budget cell, two toolkit rows,
   anti-waste rule 1's name for the panel.
3. CREATIVE_BRIEF: one banner bullet.
4. CLAUDE.md: one clause in the script bullet, nothing else.
5. v5's WRITER_BRIEF: one line, plus its critic's "cold retell first" made "the cold viewer panel first" (else the
   new line would clash with it).

## Files changed

### 1. `video/docs/OWNER_PLAYBOOK.md` (DONE)

- **Script and voice, the CLEAR bullet (RULES_DRAFT 1a).**
  Old: "CLEAR TO A REGULAR PERSON ON ONE HEARING ... by regular people, never only by us." + one run-on sentence of
  four rules (everyday words, one target per "it", the plain thought, gentle jokes) + a pointer to the retro folder;
  quotes with "don't" and a shortened tea quote.
  New: the same rule, its audience said (worldwide, many learned English at school, captions, no rewind), the owner's
  question verbatim and line 1 as the model ("news you'd pass to a friend"), then the method as 9 short sub-rules:
  everyday names, one per thing (+ "generalizing is fine" as the licence to round: "one stack of these computers");
  introduce, then point; the plain thought as the typical case ("What I mean is: ___"); one new idea per sentence,
  the base right after the hook; literal words; the one joke plain and kind; numbers and comparisons by ear; a
  comment line is clear first; checked, never assumed (`check_clarity.py` OK = no error and every warning answered,
  never "clear"; the G1 critic's cold viewer panel; no readability score). Quotes now exactly the owner's ("don;t",
  the full tea and "almost everywhere" quotes) plus v1's "Who even knows WordPress now?".
  Changed from RULES_DRAFT 1a: the comment clause became its own sub-rule (it had trailed the list); "A short line
  keeps its noun" points at the rhythm bullet (one rule, stated with its evidence once); the panel's snag list matches
  PIPELINE_V2's clarity finding (an unsure or swiping thumb included); `check_clarity.py` OK is defined as LINT_REPORT
  section 1 has it; "the line right after the hook" became "the line right after the hook and its payoff" (when the
  voice opens with a question, the next line is the payoff: Hook and pacing; the base comes after it, as PRINCIPLES'
  beat order has it).
- **Script and voice, the next bullet split in two (RULES_DRAFT 1b).**
  Old: "Everyday spoken language; check every sentence for AI-sounding wording. — (v1) **Rhythm:** ... gated by
  `check_rhythm.py` OK at G1. — (owner's reference reel, 2026-10-27)" (two rules in one bullet).
  New: "Sound like a real person talking, never like AI (the creative brief's RULE #1): check every sentence for
  AI-sounding wording; the everyday words it asks for are the clarity rule's, above. — (v1)" and "Rhythm: ... at the
  turns, and the short line keeps its noun ("But Helsinki wants that heat." ...: five of v4 draft 1's six short lines
  had shed their noun), gated by `check_rhythm.py` OK at G1; rhythm OK is never evidence of clarity. — (owner's
  reference reel, 2026-10-27; v4 G1, 2026-10-29)". "Everyday spoken language" is merged into the CLEAR bullet, not lost.
- **Taste signals, "Lines" (RULES_DRAFT 1c, one clause beyond it).**
  Old: "Lines: plain, direct and personal over clever; a question to the viewer works as a hook. A plain line needs the
  frame-0 image, the first-second sound and the second line to bring the jolt. — (v3 G0.5-G2)."
  New: "Lines: plain, direct and personal over clever (how: Script and voice, CLEAR ...); a friend's question works as
  a hook ("Did you know ..."), a sales question doesn't (Audience and goal: never baity). A plain line needs the
  frame-0 image, the first-second sound and the payoff in words by ~2 s (Hook and pacing) to bring the jolt; the line
  after the payoff is the plain base (what makes the claim possible), never a compressed punch ("The chips get that
  hot."). — (v3 G0.5-G2; v3 insights, 2026-10-28; v4 G1, 2026-10-29)."
  Why beyond the draft: "the second line to bring the jolt" now clashed with the new base rule (the line after the hook
  gives the plain base), and draft 1's punchy second line was exactly "The chips get that hot.". In v3, where the rule
  came from, the second line WAS the payoff ("AI's making it pricier."), so "the payoff in words by ~2 s" keeps its
  meaning and agrees with Hook and pacing (a question first, the payoff as the next caption). Narrowed, not reversed:
  nothing moves to "Retired".
- **"Last reviewed for coherence" (RULES_DRAFT 1f).**
  Old: "2026-10-27 (sixth pass: a cold read as if starting video 4, every conflict it found fixed at its source: the
  card's timing, one version, ... the brief)".
  New: "2026-10-29 (seventh pass, scoped to the script-clarity note: integrated into Script and voice and the Taste
  signals' "Lines", checked against Audience and goal and Hook and pacing; the other sections as of the sixth pass,
  2026-10-27 ...)". Scoped on purpose: this pass read the whole file but judged it only against this note. The commit
  "Review owner playbook" (Maintenance step 5) is the orchestrator's: this agent runs no git command that changes the
  index.

### 2. `video/docs/PIPELINE_V2.md` (DONE)

- **Gates table, the G1 row's budget cell (RULES_DRAFT 2b).**
  Old: "one writer + one critic + one fix pass; 1 h, then 15 min per round".
  New: "one writer + one critic (with the cold viewer panel) + one fix pass; 1 h, then 15 min per round".
- **Creative exploration, the G1 bullet (RULES_DRAFT 2a, with LINT_REPORT 6b's three phrases).**
  Old: "G1 script = story first (owner, 2026-10-26; lean since 2026-10-28): one writer (1) spines (2) the script with
  cues (3) `check_rhythm.py` and `check_paste.py`. Then one critic: a cold retell, the first line heard cold: "ad or
  news?", the flow and the facts, at most 6 findings; then one fix pass ... the script must pass `check_rhythm.py`".
  New: "G1 script = story first, clear on one hearing (owner, 2026-10-26 and 2026-10-29; ...)": (2) the script in
  PRINCIPLES.md's beat order; (3) the clarity pass (the film's `docs/vN/script/clarity.json`, "What I mean is: ___",
  `check_clarity.py` + `check_rhythm.py` + `check_paste.py` until all three print OK, every clarity warning answered
  in "Checks"); the critic cold first: (a) the cold viewer panel (three played viewers, one sentence at a time, what
  they understood, missed words, every pointer's target, their thumb), (b) the cold retell, (c) the lint's
  `--questions`, (d) the flow and the facts; what a clarity finding is; the panel's list uncapped and all fixed, the
  other findings at most 6; the fix pass rewrites every panel line and the resumed critic re-hears each changed line
  with its neighbours until none snags; short lines keep their noun; `check_clarity.py` (exit 0) beside
  `check_rhythm.py` before the owner.
  Changed from RULES_DRAFT 2a: "ad or news?" moved INTO the panel, after its first sentence (the old order asked it
  after the retell, when the first line was no longer cold; now it matches the playbook's Audience and goal: "a cold
  viewer panel hears the first line ... 'does this sound like an ad or bait?'"); the re-hear is done by "the critic
  (resumed)" (the draft said "the panel", which in the lean flow is the critic: still no added agent) and runs "until
  no changed line snags"; the "What I mean is" notes go in the script doc's notes (never in the paste).
- **The three viewer cards, a sub-bullet under the G1 bullet (RULES_DRAFT 2a's cards, verbatim in substance).**
  Old: none. New: "The three viewers": a non-native English speaker (24, learned English at school), a non-tech adult
  (45), a fast-scrolling teen (15), each card saying what that viewer doesn't know. Why here: RULES_DRAFT asked for
  them in "the G1 critic template", and no generic critic brief exists (v4's CRITIC_BRIEF is v4's, v5 has none), so
  the gate's own bullet is the one place every film's critic reads.
- **Studio toolkit, the "G1 script" row (beyond RULES_DRAFT: it named the checks).**
  Old: "spines, the script with cues, rhythm and paste checks, critique, fix".
  New: "spines, the script with cues, the clarity pass (the film's `clarity.json`), the clarity, rhythm and paste
  checks, critique (the cold viewer panel first), fix".
- **Studio toolkit, the "G1/G2 voice" row (LINT_REPORT 6a; RULES_DRAFT 2b's shorter version superseded by the tool as
  built).**
  Old: "paste-file rules + `check_paste.py`; `check_rhythm.py` (long sentences broken by short ones); `check_take.py`
  ...".
  New: the same, with `check_clarity.py` after `check_rhythm.py`: its errors and 13 warnings, `--questions` for the
  panel, the film's `clarity.json`, `--selftest` on the owner's v4 notes, plus two lines of my own from LINT_REPORT
  section 1 (the pinned spaCy and wordfreq, the install line it prints on exit 2; never with `python3 -I`, which
  hides jinja2 on this machine), and the spec and build report.
- **Anti-waste rule 1 (beyond RULES_DRAFT: the panel's name).**
  Old: "cold reads that only retell what they see (G1's retell panel, G3's ...)".
  New: "cold reads that only retell what they see (G1's cold viewer panel and retell, G3's ...)".

### 3. `video/docs/CREATIVE_BRIEF.md` (DONE)

- **The banner, one new bullet after "Accuracy" (RULES_DRAFT 3).**
  Old: none (the banner listed Length, Sound effects, The voice, Visuals, Accuracy, Freshness, the v1 note).
  New: "Clarity (owner, 2026-10-29): every sentence is understood the first time, at feed speed, by a regular person
  anywhere in the world (many learned English at school): everyday names, one per thing (never a trade word like
  "chips" or "cabinet"); every "it" or "that" with one obvious target; the plain thought as the typical case, never a
  hint; literal words; the one joke plain and kind. This sharpens §3's "a great teacher's clarity" and §11's "simple
  language", and narrows §14-17's "natural American expressions", "dry ... humour" and "describing things in a
  memorable unexpected way" to what a listener needn't decode (no idioms, slang or irony); RULE #1 still holds, and
  the line must also be understood at once. The method and the check: the playbook, "CLEAR TO A REGULAR PERSON ON ONE
  HEARING"."
  Changed from RULES_DRAFT 3: §14-17's "describing things in a memorable unexpected way" added to the narrowed
  clauses (read alone, it invites "like FORTY kettles" and "by the mountain"); the rest trimmed to the banner's length.

### 4. `CLAUDE.md` (DONE; one clause, nothing else)

- **Top rules, the script bullet (RULES_DRAFT 4, exactly).**
  Old: "Everyday spoken language, no AI-sounding phrasing; detailed emotional cues."
  New: "Everyday spoken language a regular person gets on ONE hearing (everyday names, never a trade word like
  "chips"; every "it" with one obvious target; the plain thought, never a hint; `check_clarity.py` OK and the critic's
  cold viewer panel at G1), no AI-sounding phrasing; detailed emotional cues."

### 5. `video/docs/v5/script/WRITER_BRIEF.md` (DONE)

- **The one line, after "Rules: ...".**
  Old: none.
  New: "Clarity (owner, 2026-10-29, on video 4's draft 1: "too ambiguous and weird"): every line clear to a regular
  person on one hearing (the playbook, Script and voice, "CLEAR TO A REGULAR PERSON ON ONE HEARING"; the method:
  `video/docs/retro/2026-10-29_script_clarity/PRINCIPLES.md`): the writer's clarity pass with the film's word list
  `script/clarity.json` and `video/scripts/voice/check_clarity.py` OK beside the other two checks, then the critic's
  cold viewer panel (`video/docs/PIPELINE_V2.md`, G1)."
- **The status line's critic (beyond "one line", to remove a clash the new line would create).**
  Old: "then one critic (a cold retell first, at most 6 findings), then one fix pass."
  New: "then one critic (the cold viewer panel first, then a cold retell: `video/docs/PIPELINE_V2.md`, G1), then one
  fix pass." (The panel comes first now and its list is uncapped; the other findings stay at most 6, as the PIPELINE
  says. CLAUDE.md: "A clash is a bug: fix the lower doc in the same turn.")
- Checked, kept: the brief's own example hooks ("Thirty meters under this park in Stockholm, there's a nuclear bunker
  full of computers." / "And it gets hot down there.") pass `check_clarity.py` (exit 0) with two warnings the writer
  answers in "Checks": W11 (a 7-word place signpost before the subject) and W1 on the ambient "it" of "it gets hot down
  there", which the tool can't tell from a pointer.

## Chosen not to change, and why

**In the files above:**
- **Playbook, Hook and pacing** (RULES_DRAFT 1e): checked line by line; its rules are about the picture and the claim,
  and the one new hook rule (the plain base right after the hook and its payoff) lives in the CLEAR bullet. The Taste
  signals' "Lines" now points at its "payoff in words by ~2 s".
- **Playbook, the STORY bullet** (RULES_DRAFT 1d): "joinable by 'but', 'so' or 'because'" is the CLEAR bullet's "the
  joins are said and true"; one rule, no clash.
- **Playbook, the first-line bullet** ("Did you know that ..." is the owner's model opener): agrees; the CLEAR bullet
  uses v4's line 1 as its model.
- **Playbook, Audience and goal:** "subtle, defensible hooks, e.g. 'the language everyone loves'" still works taken
  literally (a regular listener hears a clear, exaggerated claim, and the comments argue with it), which is what "a
  comment line is clear first" asks. Its "cold viewer panel" before G2 is now the G1 critic's panel, whose "ad or
  news?" question sits after the first sentence, so the first line is still heard cold.
- **Playbook, Storyboard, "literal beats clever":** the picture's twin of "literal words". v3's "what does the AI
  mountain signify?" (`video/docs/v3/OWNER_NOTES.md`, 2026-10-26) was about a drawn figure and is that rule's evidence,
  so it is not added to the CLEAR bullet (PRINCIPLES P6 cites it).
- **Playbook, Retired:** nothing reversed. The clarity rule grew; "a question to the viewer" and "the second line" were
  narrowed, not reversed.
- **Playbook, the other sections and the Performance log:** outside this note (Maintenance steps 3-4 aren't due; the
  last full pass was 2026-10-27). The "Last reviewed" line says the pass was scoped.
- **PIPELINE_V2, the G0.5 bullet (the core line):** "plain beats clever" is already there, and the core line is voiced
  as line 1 at G1, where the check and the panel hear it.
- **PIPELINE_V2, the panel's form:** this run heard v4's draft 2 with three separate cold agents
  (`video/docs/v4/script/panel/`), the heavier form. The PIPELINE keeps RULES_DRAFT's lean default (the critic plays the
  three viewers, no added agent), under the owner's lean early stages ("a writer and a critic for the script",
  2026-10-28). If v4's critique shows the separate agents catch more, that becomes the default only with the owner's
  yes.
- **CREATIVE_BRIEF's body** (§3, §11, §14-17, RULE #1, the ENGAGEMENT LAYER): not edited. The banner is how later
  owner rules update the owner's brief, which stays "verbatim in substance". RULE #1's "Fewer full stops, more
  'and'/'so'" doesn't clash with "one new idea per sentence": the joins the clarity rule asks for are the same "so" and
  "but", and the rhythm rule (2026-10-27) already sits beside it. The ENGAGEMENT LAYER's ironic PHP line is v1's history
  (the banner says so), and its comment bait is covered by "a comment line is clear first".

**Outside this step's files (each for the orchestrator or a later step):**
- **`video/docs/v4/`** (WRITER_BRIEF, CRITIC_BRIEF, clarity.json, README): not touched; other agents own it, and the
  workflow's fix pass adds the pointers to v4's two briefs.
- **`video/docs/v5/README.md` line 24** ("then one critic (cold retell, at most 6 findings)"): marked "(Superseded by
  the handover below.)", and the handover points to `script/WRITER_BRIEF.md`, now fixed. No change.
- **`context/workflows/v4-g1-script-lean-wf_c7c0628a-726.js`** (RULES_DRAFT 5, LINT_REPORT 6d): not changed. It is v4's
  run record (v4 paths throughout), outside this step's list, and the toolkit's rule for templates is "copy their
  structure, never their briefs". When it is copied for the next film: lines 3 and 6 "cold retell first" become "the
  cold viewer panel first, then the cold retell"; line 48 (the critic's STEP 1) becomes the panel of PIPELINE_V2's G1
  (the three viewer cards, one sentence at a time, "ad or news?" after the first); the writer's check line and line 59
  (the fix pass) add `python3 video/scripts/voice/check_clarity.py <the paste>` (exit 0, every warning answered in
  "Checks"); the critic's step (c) runs it with `--questions`.
- **`video/docs/voice/API_QUICKSTART.md`, the "Tools" line** (LINT_REPORT 6c): not changed. It is G2's procedure and the
  check runs at G1; the tool prints its pinned install line when spaCy or wordfreq is missing (exit 2, never a silent
  pass), and PIPELINE_V2's toolkit row now says so. LINT_REPORT 6c's line is ready if the orchestrator wants it there.
- **`LINT_SPEC.md` section 3's example list** ("machines" as a rival; LINT_REPORT 6e): the lint's spec, not a process
  doc, and v4's real list has no such clash. No change.
- **`HANDOFF.md`'s log line and every commit:** the orchestrator's. This agent ran no git command that changes the index
  or history.
- **Old wording in history docs:** `video/docs/v2/direction/house_digest.md` line 61 quotes the old "second line to bring
  the jolt" signal, and the v2/v3 G1 workflows describe a "cold-read retell panel". They are records of past films, not
  rules. No change.
- **`docs/look/DIRECTION.md`, `CRAFT.md`:** no script-wording rule (DIRECTION's "literal beats clever" is about shots);
  nothing contradicts the new rule.

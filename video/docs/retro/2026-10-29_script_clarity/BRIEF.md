# Script clarity (2026-10-29): the shared brief

**Why:** the owner read video 4's G1 draft 1 (archived: `video/docs/v4/archive/g1_draft1/script_g1.md`, the paste
`script_elevenlabs.md` beside it) and said our recent scripts are "too ambiguous and weird at times". Their words,
verbatim, line by line, are in `video/docs/v4/OWNER_NOTES.md` (the last entry); read them first, they are the spec.
In short:
- "Did you know Helsinki wants AI to heat seventy thousand homes?": "great thats what i would like to tell my friends."
- "The chips get that hot.": "which chips? ... we would lose people on this sentence ... is that sentence good and will
  be received well by regular people? Chips is a word not a lot of people would understand."
- "One cabinet of them is like FORTY kettles, boiling non-stop.": the same problem.
- "And nobody's even making tea.": "directionally okay, but still weird we need a simpler less scandalous language."
- "So almost everywhere, that heat just gets dumped into the air or the sea.": "find an easier, simpler way to land the
  thought. I think you are having some deeper thought here and you choose to be obscure about it. So i think you want
  to say that in a typical datacenter here is what happens. When you say 'almost everywhere' - this is very ambigous".
- "But Helsinki WANTS it.": "When you say IT - what exactly is it - heat or air or sea?"
- The ask: "Distill and generalize the principles, then do the research on them around how the message should be
  structured to land with the audience, bake into our rule set for the script generation and rework the script."

**The audience** (`video/docs/CREATIVE_BRIEF.md`; the playbook, "Audience and goal"): the biggest audience on TikTok,
Reels and Shorts, worldwide (many viewers are not native English speakers), regular people, not tech people; they hear
each line ONCE, at feed speed, reading the captions as it plays, and they can't rewind: one confusing sentence is a
swipe. The first rule is already in the playbook (Script and voice, "CLEAR TO A REGULAR PERSON ON ONE HEARING"); this
work grounds it in research, turns it into a method (how a message is structured so it lands) and a check, and applies
it. It must sit coherently with the rules already there (the playbook's "Script and voice", "Hook and pacing",
"Taste signals: Lines: plain, direct and personal over clever"; the creative brief's RULE #1 and ENGAGEMENT LAYER;
ONE SUBJECT, GONE DEEP; the rhythm rule and `check_rhythm.py`; never baity; exaggeration is fine).

**Files in this folder:** `research_ear.md` and `research_explainers.md` (the two research lanes), `PRINCIPLES.md`
(the distilled, generalized principles: owner-facing, short), `RULES_DRAFT.md` (the exact rule text for each doc and
what it replaces), `LINT_SPEC.md` (what `video/scripts/voice/check_clarity.py` checks), `INTEGRATION.md` (what was
changed where), `LINT_REPORT.md` (the tool, its tests).

**Every agent:** writes its file from its FIRST step and updates it as it goes (a usage limit can stop it at any
moment); returns at most 3 short lines; never runs a git command that changes the index or history (the orchestrator
commits); never touches `video/src`, `video/public`, `video/out`; starts no agents (if it ever does, they run at max
effort); cites a source (URL) for every research claim and marks how strong it is (a study, a style guide, a
practitioner's advice); never bbc.co.uk (blocked). WebFetch may fail: fetch with curl through the session proxy and read
as text.

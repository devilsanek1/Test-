# Video 4, G1: the critic's brief and the fix pass (Helsinki)

The lean G1 (`video/docs/PIPELINE_V2.md`, the G1 bullet): one writer (`WRITER_BRIEF.md`), then ONE critic (this file,
part A), then ONE fix pass (part B). Every agent writes its file from its first step (a usage limit can stop it at any
moment), returns at most 3 lines, never runs a git command that changes the index (the orchestrator commits), never
touches `video/src`, `video/public`, `video/out`, and starts no agents (if it ever does, they run at max effort).

## A. The critic: `video/docs/v4/script/critique_g1.md`, at most 6 findings

1. **The cold retell, BEFORE reading anything else** (no brief, no notes, no fact file, not `script_g1.md`): read only
   the spoken words of the paste block in `video/docs/v4/script/script_elevenlabs.md` (skip the tags), once, as a viewer
   scrolling past who hears it one time. Then, without looking back, retell it in 3-5 sentences as you would to a friend,
   and write that retell into the critique file first. Judge it: does it come out as one story (one thing, each line
   deeper: what, how, why, the twist, what it means for you) or as a list of facts? A list-like retell is a blocker.
2. **Ad or news?** The first spoken line heard cold, with the frame-0 picture from `script_g1.md`: does it sound like an
   ad or bait (a sales question, a pitch, a product or company first)? It must be no. The payoff is in words by ~2 s, in
   the voice's order. No company in the first line or frame 0. The opener sounds like a friend telling surprising news
   ("Did you know ..." is the owner's model: playbook, Script and voice).
3. **ONE SUBJECT, GONE DEEP** (playbook, Script and voice): name the film's one thing in 3 words; count the places (one
   home place, at most one comparison or scale shot); every line is about the one thing. A tour of places, or a line
   that leaves the subject, is a blocker. **Distinct from video 5** (`video/docs/v5/README.md`, the bunker under a
   Stockholm park): video 4 is Helsinki and its heat; the 2010 cathedral shelter is one twist beat, never the subject.
4. **Flow:** every line follows from the one before (joinable by "but", "so", "because"; never "and also"); a clear
   turn; the payoff lands the core line; the end sits close to the payoff (30-45 s, 95-125 words).
5. **Facts** against the ONE fact file `video/docs/v5/research/factlock.md` (sections 2, 6, 7.1-7.4, 8, "What the script
   may say", "What it must never say"): every number, name, date and quote. The floor is absolute (the plant is not
   built and has no tenant: "is meant to", "from 2027"; quotes word for word, trimmed only at the ends; the cathedral
   shelter "in 2010", never "still"; Uspenski is the red-brick one with gold domes). Round-ups the file allows are fine
   (owner: exaggeration is fine, no law-firm precision; only a made-up core event is out). Search the web only for a
   fact the file lacks, and never bbc.co.uk.
6. **The spoken language and the rules:** everyday speech, no AI tells (no "imagine", "here's the thing", "let that
   sink in", stacked triplets, em-dashes); short sentences (<= 5 words) after every 1-2 long ones; a delivery cue per
   line; one joke that lands; one or two comment lines, tagged, that are arguable but defensible; positive mood; the 3
   hook options in the brief's families, each one true; the through-line card (`video/docs/v4/THROUGHLINE.md`): one
   thread object, one home place, one "you", Pip hidden, a carrier for every join taken from the script's own joins
   (`video/docs/look/CRAFT.md` §a). Run `python3 video/scripts/voice/check_rhythm.py` and
   `python3 video/scripts/voice/check_paste.py` on the paste file and quote their verdicts.

Rank the findings blocker > major > minor; each names the line, the problem in one sentence, and a concrete fix (a
replacement line when a line is the problem, checked against the fact file). Then a verdict: **FIX AND SEND** (the fix
pass can make it ready) or **REWRITE** (the spine fails the retell or the one-subject test).

## B. The fix pass: the same files, plus a "Fix pass" section at the end of `script_g1.md`

Continue the writer's work: read the writer's own notes first (its spines and why it picked one, the story in 3
sentences), then the critique, then the fact file. Apply every blocker and major and the minors that are plainly right,
in the writer's voice; for each finding, one line in the "Fix pass" section: done (what changed) or not done (why). Keep
`script_g1.md`, the paste in `script_elevenlabs.md` and the card's carriers in `THROUGHLINE.md` in sync (word count,
length, the joins); re-run both checks until both say OK and record their verdicts. If the critic said REWRITE, redo
the spine from the writer's second spine or a new one, then the lines, then the checks.

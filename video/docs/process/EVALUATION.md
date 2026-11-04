# How our rules, guides and agent instructions should change: feeling first (evaluation, 2026-10-31)

**The owner asked** (2026-10-31): "look at the repo and evaluate how the rules and guides and instructions to agents
should change holistically so that we achieve what I've described". What he described: "saying the scene should be
constrasrful to achieve feeling X" instead of "65% contrast"; "each scene would have a different contrast level
depending on what is shown and what the mood and setup is"; "keep all the stylistic tooling and recipes ... reframe the
recipes and guides to focus on achieving feelings with our tools rather than filling checkboxes"; and the day before:
"not the concrete steps 'PUT A BUILDING HERE', but more abstarct like 'layers and feel of distance'".

Written by the study session as input for the rework that video 4's session owns (`BRIEF.md`). Evidence: `AUDIT.md`
(its §7 "The v7 lesson" is the worked case), the counts below, and how painter v7 was briefed and checked.

## 1. What happens today (the mechanism, not the symptoms)

1. **Every feeling the owner gives us gets turned into a number within a day, and the number outlives the feeling.**
   "Our scene is very busy" became "at most 6 objects, at most 2 near props, at least 65 % quiet"; "dark and contrast
   are great" became "up to ~45 % of the frame under L* 40"; "a person about this size" became "130-220 px". Our capture
   rule (CLAUDE.md: capture every note as a rule) has no step that stops this: we write the owner's feeling, then our
   own number beside it, and agents can only act on the number.
2. **The guides are too big to read, so agents act on what they can grep.** About 170,000 words of rules across the
   playbook, PIPELINE_V2, the gate specs and the look guides; in the look guides about 2,800 numeric values and 1,000
   "must / never / at most" against about 50 uses of "feel / feeling / mood" (ORGANIC.md: 582 numbers, 1 "feel"; COMPOSITION_SHOTS:
   445 numbers, 6). The workflow briefs themselves carry almost no numbers; they point agents at 11-29 docs, and the
   numbers come in from there.
3. **The numbers combine into one template frame.** Each rule is reasonable alone; together (the sky and words on top,
   the focal at about (540, 980), the quiet ground at the bottom, one counterweight cloud, the props capped) they decide
   one picture before the story is read. Every test frame starts to look the same, and the beat's own feeling has no
   number to defend it (AUDIT §7: twelve numbers v7 was built to, every one met, the feeling lost).
4. **Checkers gate on look numbers, so agents optimise what is measured.** `composition_study.py`, `check_light.py`,
   `check_banding.py --texture`, ORGANIC §6's step checks WARN or FAIL a frame for a value share, a prop count, an edge
   share; v7's "near nature" was vetoed by a count ("one more value piece").
5. **Frames are judged against numbers and references, not the beat.** v7's sheet was a numbers table plus "beside refs
   03 and 02": two night and dusk paintings of solitude became the bar, and their mood came with their key into a beat
   of surprising news and a bold step.
6. **Briefs are hand-assembled by each orchestrator,** each with a different subset of docs and decisions; mine for v7a
   carried the key as a percentage. Nothing stops a brief from carrying a look number or a placement.
7. **The ladder of authority is long** (owner > DIRECTION > CRAFT > PIPELINE > gate specs > look docs > STYLE > v1 docs,
   plus topic docs): contradictions get resolved by rank, never by asking which choice serves this beat.

## 2. The target, in one line per layer

| Layer | Today | Should be |
|---|---|---|
| Capturing the owner's notes | his words + our threshold | his words + the FEELING + the TOOLS that create it; a number only as "one example we measured" |
| What every agent reads first | 11-29 docs, ~170k words | ONE page: the three rules, feeling first, the frame loop, the hard constraints only |
| The guides | rules with targets | the toolbox: intent -> tools (recipes, code) -> labelled examples -> checks for real mistakes |
| A brief | hand-picked docs and decisions | a standard header + the beat's feeling and story moment in words, written by the director |
| A frame plan | layout numbers | the frame card: questions, answered with the artist's own tools |
| Checks | gate on look numbers | gate only on mistakes (captions readable, safe zones, timing, banding, frame rate); look numbers print as diagnostics |
| Review | numbers table + references | a fresh eye judges the FEELING of the beat first, at phone size; numbers explain, never decide |
| References | the bar, mood included | named for what to take (craft: how paint, light, people are made) and what not (their mood, unless the beat shares it) |
| Variety | one template | every scene lands differently: the card asks what THIS beat feels like and how it differs from the last |

## 3. The changes, cheapest and highest-leverage first

1. **Fix the capture rule at the source** (CLAUDE.md and the playbook's Maintenance): an owner note is recorded as his
   words, the feeling, and the tools that create it; a number may follow only as a labelled example ("v7 measured
   43 %"), never as "must be". Small; stops new numbers from being born. The playbook's "A number is never a target"
   line (2026-10-31) already states the principle.
2. **One page every agent gets** (the "constitution"): the three rules, feeling first, THE FRAME LOOP, the true hard
   constraints (the caption band and safe zones, 9:16 at 60 fps, the voice's first word, no ink in the build, the
   people in use), and two pointers (DESIGN_LANGUAGE, FRAME_CARD). Everything else is consulted as a toolbox when a
   tool is needed, never pre-loaded. Small.
3. **A standard brief header + a brief lint**, like the max-effort hook: a look or frame brief must open with the beat's
   feeling and story moment in words; the hook WARNS when a look brief carries a percentage, a pixel position or an L*
   target. Small code; it enforces the habit for every orchestrator, including the next session.
4. **Split every checker into mistakes and diagnostics:** mistakes keep failing (caption contrast, safe zones, av lag,
   banding on the master, dead frames, timing); look numbers print as a report the reviewer may use to explain a
   feeling, never a WARN or FAIL. Small to medium (about six scripts).
5. **DESIGN_LANGUAGE.md and FRAME_CARD.md** (the rework already planned in BRIEF.md, RESEARCH.md done): the toolbox per
   aspect of a frame as intent -> tools -> examples -> checks, and the card of questions led by "what should the viewer
   feel, and where is the life and action". Medium.
6. **Reframe the guides incrementally, not in one pass:** each guide is reframed the next time a film actually uses it
   (numbers moved into a labelled "Examples and measurements" section at its end, every tool and recipe kept), the
   biggest offenders first when they come up: ORGANIC §4-§6, COMPOSITION_SHOTS' planning card and "five numbers",
   CRAFT §d/§f, LAYOUT's fixed zones, COZY_AND_SCALE's caps. This spreads the cost over real work and tests each change
   on a real frame.
7. **References get a "take / leave" line** in each README (what craft to learn; which mood is theirs, not ours by
   default). Small.
8. **The review step names the feeling first:** THE FRAME LOOP's evaluator writes one line "the feeling it gives" before
   anything else, compares it to the beat's intended feeling, and only then looks at craft; numbers appear only to
   explain a gap. Small (one line in PIPELINE_V2 and the evaluator brief).

What NOT to do: a big-bang rewrite of ~170k words (it costs a week of tokens and invents new rules in the process), or
deleting measurements (they are useful as diagnostics and as examples of what worked).

## 4. How we will know it worked

The next frame built under the new header: the brief has no look number; the evaluator's first line names a feeling
that matches the beat; two different beats come out with visibly different keys and layouts; the owner reacts to the
feeling, not to a missing piece. For scene 1 specifically: her moment in front and alive, the evening opening up around
her, built with v7's tools (AUDIT §7, "What v7 proves is worth keeping").

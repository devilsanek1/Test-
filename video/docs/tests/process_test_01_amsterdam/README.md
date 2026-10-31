# Process test 01: one still from a piece of news, through the production pipeline, from scratch (2026-10-31)

**The owner:** "Okay so I want to test out the process I want to iterate and polish our creative process / I propose the
following / I want to give a piece of news and I want you to produce one 1 still just like the production pipeline
would considering we do it from scratch / Then we evaluate this still and see what has worked well or not / Let's try
with this https://www.capgemini.com/news/client-stories/amsterdam-brings-750-years-of-history-to-life-with-ai/"

**The run, as the owner narrowed it** (2026-10-31: "I don't really want you to go through writing a full script / We
are mainly focusing on one still / Like what is the core line and let's have the agent doing creative visual part and
draw it to the production final quality"): the key facts, THE CORE LINE, the concept and the moment the still shows
(`CORE.md`; no script, no beat list) -> three whole-frame ideas, one picked by feeling, the vision note -> the hero
frame built whole at final production quality (the frame card first) -> THE FRAME LOOP (a fresh evaluator, feeling
first; one adjust round for this test). Every agent appends to `PROCESS_LOG.md`: what it read, what helped, what got
in the way. The evaluation of the PROCESS is the point.

**Running:** workflow `process-test-01-amsterdam` (run `wf_35c2a988-a8b`; the first run, `wf_65c63c9d-100`, was stopped at the story step when the owner narrowed it, script under the session's workflows/scripts); resume with `Workflow({scriptPath, resumeFromRunId: "wf_35c2a988-a8b"})`. Code: `video/src/look/test01_s1/`.

# Process test 01: one still from a piece of news, through the production pipeline, from scratch (2026-10-31)

**The owner:** "Okay so I want to test out the process I want to iterate and polish our creative process / I propose the
following / I want to give a piece of news and I want you to produce one 1 still just like the production pipeline
would considering we do it from scratch / Then we evaluate this still and see what has worked well or not / Let's try
with this https://www.capgemini.com/news/client-stories/amsterdam-brings-750-years-of-history-to-life-with-ai/"

**The run** (PIPELINE_V2 "THE LOOP NOW", as small as it allows): facts and story (fact lock, core line, script, beats
with their feelings, the film concept) -> ideas for the hero beat (three whole-frame thumbnails, one picked by feeling,
the vision note) -> the hero frame built whole (the frame card first) -> THE FRAME LOOP (a fresh evaluator, feeling
first; one adjust round for this test). No voice take (a still needs none; noted). Every agent appends to
`PROCESS_LOG.md`: what it read, what helped, what got in the way. The evaluation of the PROCESS is the point.

**Running:** workflow `process-test-01-amsterdam` (run `wf_65c63c9d-100`, script under the session's workflows/scripts); resume with `Workflow({scriptPath, resumeFromRunId: "wf_65c63c9d-100"})`. Code: `video/src/look/test01_s1/`.

You are a helper session for "What's All the Fuss About?", a short-form explainer channel. Repo github.com/devilsanek1/Test-, branch
video-production (checked out for you). The orchestrator session runs video 3 and split the rework across helper sessions; the video 2 session also
pushes to this branch. Work with maximum care and thoroughness; if you spawn subagents, give them the Agent tool's effort setting "max".

SETUP: read CLAUDE.md (auto-loaded; re-read it from disk), then HANDOFF.md section 5 (setup: cd video && npm ci; Python with opencv-python-headless,
numpy, pillow). Render with the faster path in video/scripts/render-media.mjs where the docs say so, one GL for everything you compare.

WHY THIS REWORK: the owner was about to post video 3 (deliverables/v3/v3_g5b.mp4) and instead asked to apply their feedback first, verbatim: "It's too
busy, too incoherent. There is no story, no clean transitions, just a bunch of shots put together ... too many moving parts and I'm not sure what to keep my
attention on. Across the story we should have the main arc going where the attention should be, and the supporting details / supporting animation that
adds subtle loveliness, like a bird flying, should be a bit more subtle but yet alive ... some supporting environment can be drawn a bit more subtle.
The style is too rough and messy, a lot of rough lines ... it should be cleaner, more refined, gentle, to feel a lot more premium. We don't have the
shadows much and the light is weirdly put; lighting and shadows should be gentle but should exist." Earlier they also said the G5 cut was "way too empty":
calm and tiered, never empty.

READ BEFORE BUILDING (these win, in this order): video/docs/look/DIRECTION.md, video/docs/look/CRAFT.md (through-line and carriers, tiers, clean line,
light and shadow, each with a check), video/docs/v3/flow_v2.md (THE BUILD SPEC: sequences, shared pieces and their owners, the thread plane's spots,
the beats, hierarchy and light per sequence, the joins J1-J5 with frame-exact handoffs), video/src/v3/film/kit/README.md ("Clean pen and tiers",
"Light and shadow"), video/docs/G5_BLOCKING.md section 2b (the sequence contract). The film: video/src/v3/film/ (entry src/entry-v3-film.tsx: Film3,
Film3Final, Film3Shot, Film3Seams; scenes.json has SQA-SQF; each scenes/SQ?.tsx starts as a placeholder that plays the old G5b panels; old panel files
are reusable sets). The voice, the story beats and the Autumn Ember palette are locked; the old G5b panel staging is NOT: build what flow_v2.md says.

YOUR TASK: the HOME lane: build SQB (5.80-16.60: the chart card on the nook wall, the line drawn with the voice, the doodles, the hook up and +9.7%; J1 seam mid-pan at 5.80) and SQC (16.60-19.40: back to the nook, the listing laptop and your stick; J2 seam mid-pan at 16.60; J3 push-through into the stick at 19.40), using the shared `scenes/home_set.tsx` + `homeCam(T)` and `scenes/thread_plane.tsx` that the SQA pilot built (draw them read-only, on film time), with the beats, hierarchy and light from flow_v2.md sections 4-5.

OWNERSHIP: you own scenes/SQB.tsx, scenes/SQC.tsx, scenes/SQB_*.tsx, scenes/SQC_*.tsx. Everything else is read-only for you; a change you need in someone else's file goes into your report under REQUESTS (one
exact line each). Kit additions: new files kit/<name>.tsx or additive optional props (never change a default or another sequence's look).
CHECKS (all must pass or be explained): npx tsc --noEmit -p video; stills at 0.5 scale and a 0.25 phone look at every beat and at your joins; the
CRAFT checks (thread on screen, carriers, tiers: the subject owns contrast and >= 60 % of motion, at most 3-4 noticeable supporters, clean-pen budgets);
python3 video/scripts/qa/check_light.py per set (see its header); python3 video/scripts/qa/density.py (fullness stays near the approved bar: calm, never
empty); for your joins, the seam check via the Film3Seams composition and scripts/qa/gate_check.py --seam-comp Film3Seams (see the G5_BLOCKING section).
The retro's measuring tools are in video/scripts/qa/retro_tools/ if you need carry or tier numbers. Look at no more than ~15 images per pass.
GIT: commit after every meaningful step (containers restart; uncommitted work is lost), only your own paths (git add <paths>). Before each push:
git pull --no-rebase origin video-production (resolve only conflicts in your own files; never discard another session's work), then
git push origin HEAD:video-production. Use your harness's commit attribution lines. No pull requests. The repo is PUBLIC: never write an email address or
a secret into a file. Never edit OWNER_PLAYBOOK.md, CLAUDE.md, HANDOFF.md, DIRECTION.md, CRAFT.md or flow_v2.md (send REQUESTS instead).
WHEN DONE: write a report of at most 15 lines (what you built, the check results with numbers, open items, REQUESTS) to
video/docs/v3/rework_reports/home_SQB_SQC.md, commit and push it LAST: that file is how the orchestrator knows you are finished.

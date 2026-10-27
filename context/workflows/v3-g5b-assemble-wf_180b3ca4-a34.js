export const meta = {
  name: 'v3-g5b-assemble',
  description: 'v3 G5b assembly: full film at 1080x1920 60 fps rendered per panel in chunks, gate/density/cozy checks, an independent cross-panel continuity review, one fix round, deliverable',
  phases: [
    { title: 'Render', detail: 'per-panel chunks, joined; checks; whole-film sheet' },
    { title: 'Review', detail: 'independent cross-panel continuity review' },
    { title: 'Fix', detail: 'fix, re-render affected chunks, re-join, deliver' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/g5b/assemble'
const GIT = `GIT: commit only the paths you changed (git add <paths>), after every meaningful step; message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
If .git/index.lock exists wait 5 s and retry. Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (another
session pushes to this branch; resolve only conflicts in v3 files, never discard its work). Never commit video/out or scratchpad files. The repo is
PUBLIC: no email addresses or secrets.`
const CTX = `
VIDEO 3 ("AI is making your next laptop pricier", 41.15 s), stage G5b, the dense blocking cut. Every panel is now dressed to the owner-approved density
bar (the pilot ${V}/deliverables/v3/v3_g5b_pilot.mp4; rules ${V}/docs/look/LIFE_AND_DENSITY.md, ${V}/docs/look/COZY_AND_SCALE.md 3b). Lane reports:
${V}/docs/v3/g5b_reports/*.md and ${V}/../context/agent_reports/ (the rollout). The film: ${V}/src/v3/film/ (entry src/entry-v3-film.tsx: Film3 at 60 fps,
scenes.json with each panel's s/e; Film3-<ID>; how-to ${V}/docs/G5_BLOCKING.md). The story, voice, cuts, framing and camera are LOCKED.
Known cross-panel items from the lanes: S12's laptop should show the same desktop as S16 (the ScreenDesktop component in scenes/S16.tsx) so the laptop
matches; the S16 -> O1 loop seam can only be judged in the full Film3 (single-panel renders have no O1 underlay); the shared 'worried' brow in
src/lib/mascot/poses.ts reads cross (do NOT change shared mascot poses: video 2 uses them; override per v3 panel if needed).`

phase('Render')
const render = await agent(`${CTX}
YOU ARE THE RENDERER. Work in ${V}. Typecheck first. Render Film3 at 60 fps, FULL size 1080x1920, with the voice, in CHUNKS by panel so later fixes
re-render only what changed: for each panel in scenes.json, render its frame range (round(s*60) .. round(e*60)-1; the last panel to the end) with
--frames to ${SCR}/chunks/<idx>_<ID>.mp4 (--concurrency=3; run long renders in the background and poll; if one is interrupted, re-run just that
chunk). Join them losslessly with ffmpeg concat into ${SCR}/v3_g5b.mp4 and check the join (frame count = ceil(41.15*60), audio in sync, no duplicate or
missing frame at the seams: compare the frames around each seam with a direct still of Film3 at those frames). Write the chunk list and the exact
render and join commands to ${SCR}/RENDER.md so a fixer can re-render one chunk and re-join.
Then run on the joined file: scripts/qa/gate_check.py (with --density) and scripts/qa/density.py --cozy with the scenes list. Make a whole-film contact
sheet (one frame per panel at its key beat, plus O1 at 0.15 / 2.0 / 4.5 s, S9 start and landing, the last frame next to frame 0) to ${SCR}/sheet.jpg.
Do not fix anything. Do not commit renders.
REPORT (at most 12 lines): the joined file, render time, the checks per panel (PASS/WARN/FAIL with the numbers), the sheet path, RENDER.md.`,
  { effort: 'max', label: 'render', phase: 'Render' })

phase('Review')
const review = await agent(`${CTX}
YOU ARE THE INDEPENDENT CONTINUITY REVIEWER. You did not build any panel. The renderer's report is below. Watch the joined film
${SCR}/v3_g5b.mp4 (extract frames with ffmpeg; build your own strips around every cut and through every panel) and the sheet ${SCR}/sheet.jpg. Find at
most 10 CROSS-PANEL problems no single lane could see, most severe first: the same laptop / tag / phone / data center / You / Pip drawn differently
(colours, sizes, details); the time of day, the snow or the light drifting between panels; a panel much emptier or busier than its neighbours; a cut
that lands off its word or a jump at a cut; matched frames that don't match (S4/S6, S10/S14, S7/S8, S15/S16); captions colliding with detail or
unreadable; Pip's continuity (where it is, what it does across cuts); the loop seam S16 -> frame 0; anything broken. For each: what, where (time,
screen area), and the concrete fix (which file). Do not edit files. At most 40 lines.
RENDERER:
${render || 'FAILED'}`, { effort: 'max', label: 'review', phase: 'Review' })

phase('Fix')
const fix = await agent(`${CTX}
YOU ARE THE FIXER (one round). Fix every real problem in the review below (skip one only if it is wrong or would change the locked story; say why), with
small targeted edits in the v3 panel or kit files. Typecheck. Re-render ONLY the affected chunks with the commands in ${SCR}/RENDER.md, re-join, re-check
the seams, re-run gate_check (--density) and density.py --cozy, and rebuild the sheet. Then copy the final film to video/deliverables/v3/v3_g5b.mp4 and
the sheet to video/review/v3_g5b/sheet.jpg, and add a short "v3 G5b lessons" section to ${V}/docs/G5_BLOCKING.md (what made the rollout consistent, the
split across helper sessions, the chunked render, what to set up first next time). ${GIT}
REPORT (at most 12 lines): the deliverable (length, size), what you fixed, the final checks per panel, anything open for the owner.
REVIEW:
${review || 'FAILED'}
RENDERER:
${render || 'FAILED'}`, { effort: 'max', label: 'fix', phase: 'Fix' })

return { render, review, fix }

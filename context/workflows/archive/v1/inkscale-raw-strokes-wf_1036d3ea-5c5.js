export const meta = {
  name: 'inkscale-raw-strokes',
  description: 'Make raw strokeWidth paths in shared props/sets follow the opt-in ink compensation (useInkScale), so S01 dive props (Lock, BrowserChrome, SunMorphs, plaza chevron) thin like the rest',
  phases: [
    { title: 'Build', detail: 'multiply raw strokeWidth by useInkScale() in shared props/sets' },
    { title: 'Review', detail: 'verify zero change outside InkScale, S01 dive end weights' },
  ],
}
const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/inkraw'
const CTX = `Project ${ROOT} (Remotion + React + TS). docs/ENGINE.md section 4b documents the opt-in ink compensation: inside <InkScale> (src/lib/inkComp.tsx) the engine's <Ink> strokes are multiplied by a factor (useInkScale()); outside it the factor is exactly 1. S01 wraps its whole plaza in InkScale during its 0.33 s camera dive (4.385-4.715 s), but shared props and sets that draw RAW <path strokeWidth=...> / <circle strokeWidth> / <line> strokes ignore the factor, so at the dive's end the Lock, the window/shutter frame (BrowserChrome) and other raw strokes stay 2-3x heavier than everything else. docs/SHARED_PROPS.md and docs/SHARED_SETS.md section 1 list the open request (BrowserChrome, Lock, SunMorphs first; Shutter, Figures rings/glints; GovernmentPlaza chevron ~line 880; DomeCity).
Scene workflows are editing src/scenes/SceneNN.tsx and src/scenes/sceneNN/** right now: do NOT touch those, src/lib/**, or src/data/**. Do not commit.`
const built = await agent(`${CTX}
TASK: in src/scenes/shared/props/** and src/scenes/shared/sets/**, make every raw stroke width follow the factor: const k = useInkScale() (import from the lib) and strokeWidth={w * k}. Hooks rules: call useInkScale at component top level (not in loops/conditions); for helper functions that return JSX, pass k down. Keep everything else identical: outside an InkScale the factor is 1, so every scene must render pixel-identical. grep for strokeWidth in those dirs and handle all of them, prioritising Lock, BrowserChrome, SunMorphs, Shutter, GovernmentPlaza, DomeCity. Verify: npx tsc --noEmit clean; render S01 at 4.0, 4.55, 4.70 (node scripts/render-frames.mjs S01 ${SCRATCH}/s01 4.0,4.55,4.70 --scale=0.5 --concurrency=1) and compare the lock/window frame weight to the set lines; render 3 other scenes that use these props (S02, S08, S11) at a couple of times before and after (git stash is NOT allowed - other agents are working; instead compare against renders you make first, before editing) and confirm pixel-identical (compare with python/PIL). Update the open-request lines in docs/SHARED_PROPS.md and docs/SHARED_SETS.md to done. Final message: files changed, S01 dive-end measurements (px) before/after, pixel-identity results.`, { effort: 'max', label: 'build', phase: 'Build' })
const review = await agent(`${CTX}
You are an ADVERSARIAL REVIEWER. Do NOT edit files. The builder reported:
${built}
Check: git diff -- src/scenes/shared docs; every raw strokeWidth in shared props/sets multiplied by the factor (grep for any missed); hooks called legally (top level of components, never conditionally or in loops/callbacks); tsc clean; S01 at 4.70 renders the lock and window frame at about the weight of the surrounding set lines (render it into ${SCRATCH}/review and LOOK); scenes outside an InkScale unchanged (render S03 and S09 at two times and compare against renders of HEAD made in a separate checkout: git worktree add ${SCRATCH}/head HEAD, then render there with node scripts/render-frames.mjs from that dir after symlinking node_modules; remove the worktree after). Report concrete problems with exact fixes, or 'ok'.`, { effort: 'max', label: 'review', phase: 'Review' })
let fix = null
if (!/^\s*ok\b/i.test(review)) {
  fix = await agent(`${CTX}
Fix what this reviewer found (verify each claim first; ignore it if it does not reproduce):
${review}
Re-run tsc and the S01 dive-end render. Final message: what changed.`, { effort: 'max', label: 'fix', phase: 'Review' })
}
return { built, review, fix }
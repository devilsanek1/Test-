export const meta = {
  name: 'kit-fixes-v3b',
  description: 'Fix shared sets/props/engine findings that scene agents cannot fix (plaza z-order + ground + civic, stoop dawn rims, terrace check boxes, elephant stamp, messenger hair, onlooker arms, ink weight in dives), each reviewed adversarially then fixed',
  phases: [
    { title: 'Build', detail: 'sets lane, props lane, core lane' },
    { title: 'Review', detail: 'one adversarial reviewer per lane, renders of every consumer scene' },
    { title: 'Fix', detail: 'one fix round per lane' },
  ],
}

const ROOT = '/home/user/Test-/video'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/kitv3b'
const CONTEXT = `Project: ${ROOT} (Remotion 4 + React + TS, a 55 s 1080x1920 hand-drawn explainer about a PHP bug). Read docs/BRIEF.md (look, palette, motion grammar: no opacity fades, draw-ons, fill pops), docs/style_bible.md, docs/SHARED_SETS.md, docs/SHARED_PROPS.md, docs/ENGINE.md as needed.
SITUATION: four scene workflows are building and fixing scenes S01-S11 RIGHT NOW in src/scenes/SceneNN.tsx and src/scenes/sceneNN/**. Their reviewers found problems that live in SHARED code the scene agents may not edit. You fix those in shared code.
HARD RULES:
- Do NOT edit src/scenes/SceneNN.tsx or src/scenes/sceneNN/** (scene lanes), src/data/**, or another lane's files.
- Keep every existing export and prop working (backward compatible). Change a DEFAULT only where your task says so, and say so in your report.
- After each change, render the consumer scenes that use the piece (grep src/scenes for imports) with scripts/still.sh <SceneId> <t> out.png or scripts/render-frames.mjs <SceneId> <dir> <times> --scale=0.5 --concurrency=1, and LOOK at them. Put renders in ${SCRATCH}/<lane>/. The machine is shared by ~10 agents: scale 0.5, concurrency 1-2.
- npx tsc --noEmit must stay clean for your files. Update docs/SHARED_SETS.md / docs/SHARED_PROPS.md / docs/ENGINE.md for what you changed.
- Do not commit; the orchestrator commits.`

const LANES = [
  { key: 'sets', task: `SETS LANE (src/scenes/shared/sets/**):
1. GovernmentPlaza z-order bug (S11, S01, later S12): in GovB the sill <Ink> (around line 861) draws AFTER <WindowRig id="govB"> (line ~859), which carries TagRig and PadlockRig, so the sill strokes cut through the padlock/tag. Draw tag + padlock rigs after the sill (split them out of WindowRig or move the sill above). Check govA/govC/govD for the same pattern.
2. GovernmentPlaza ground (S01 reviewer): ~60% of the plaza is the sage shade wedge rgb(109,152,139); with the tealDark near observer, teal onlooker and teal tree the bottom half is a heavy cool teal mass. References put teal/dark figures on a LIGHT ground (cream sidewalk, mintPale). Make the plaza field mintPale/cream and cut the sage to ONE diagonal shade wedge from govA's side covering <= 1/3 of the plaza (style bible: one shade plane). Make it the default (S01, S11 and S12 share the plaza); keep the old look reachable via a prop (e.g. ground="sage").
3. GovernmentPlaza far civic skyline on 'Europe' (S01 reviewer): the far civic silhouettes step only ~1.3:1 (#A2C8B6 -> #88B3A0, #84B09C -> sage) inside a ~150 px gap overlapping the sun's lower quarter; dome lantern pop-offs are 5x9 px; below the silhouettes a featureless ~150x280 px teal slab runs down to the plaza and on 'Europe' darkens to almost exactly the plaza field value, so gap + ground merge into one teal pillar. Fix: the dark step becomes two clear values (far #A2C8B6 -> ~#6E9A88, nearer #84B09C -> ~#4E786A) and each silhouette's cream clock face / window dots switch to tealDark on the same step; end the far city on a horizon line at world y ~1150-1180 and show the plaza's far steps/edge below it instead of a slab; 3 tiers that shrink with distance. Keep the civicOffAt timing API.
4. GovernmentPlaza columns (S01 dive scales them 3x): govA's 4-6 parallel flutes per column turn into a barcode. Use one flute stroke per column (or 2 short broken ones).
5. StoopStreet dawn rims (S09): STOOP.dawnRims[1..4] (6 px x 150-240 px peach strips at world x 640/716/748/818) are drawn in the stoop/hero layer ON TOP of the sun -> stray peach vertical bars across the sunrise. Move tower rims into the far layer with the towers (after the sun slot, clipped to the tower silhouettes) or add a prop dawnRims={[0]} (hero rim only) and make hero-only the default when the sun slot is used.
6. TerraceHill check boxes (S09 payoff 'one tick among hundreds of EMPTY check boxes'): batched CheckBoxTags render ~14-18 px cream squares on row 0 and smaller behind; with sound off the empty boxes don't read. Give each tag a minimum on-screen size of ~22 px on row 0 and >= 10 px on row 3 (about 1.4x TERRACE checkBox.size), a cream card with a ~2 px ink box and a tealDark loop, min ink ~1.6 px, and pop each row with the 7% spring overshoot (no fades). Keep checkBoxWaveAt.
7. ElephantStamp print (S03 'It's in PHP' beat): at rest the print is ~130 px of hairline ink with cream fill on the cream ground, so it doesn't read. Draw it as a flat SOLID fill (style-bible ink/teal value) filling the full stamp silhouette with a slightly misregistered (3 px) edge, like a rubber stamp. Find where ElephantStamp lives (grep) - if it is a prop, coordinate by doing it anyway (the props lane won't touch it).`},
  { key: 'props', task: `PROPS LANE (src/scenes/shared/props/**):
1. Messenger (S06 hero, 260 px, back view): props Messenger hard-codes hair='short', which draws a skin-coloured sand disc where the hair should be, so it doesn't read as a back view. Add a hair passthrough (default to a full hair-colour disc for back views, ink-brown), and a straight collar band instead of the V (as Figures.tsx review 5 does for other figures).
2. EdgeOnlooker Arm (S07: four phone raises; also used elsewhere - grep): arms are straight tubes of uniform width with no elbow/taper/cuff/hand, swung as rigid sticks. Give Arm a 25-35 deg elbow bend that follows the raise, taper the sleeve toward the wrist, add a cuff line and a sand hand wrapping the phone's lower edge; add one fold or seam line on the coat back. Keep the existing Arm/EdgeOnlooker props working.
3. While there: render docs/SHARED_PROPS sheet (src/dev/SharedKitSheet.tsx) and check every figure prop's back view reads (hair disc, collar) - fix any other figure with the same skin-disc problem.`},
  { key: 'core', task: `CORE LANE (src/lib/**, docs/ENGINE.md):
Ink weight across camera dives. S01 ends on a 0.33 s dive (4.385-4.715) that scales the whole world up to 3.07x, so set ink arrives at the cut as 8-10 px lines (the style ceiling is 5.2 px), while S02 opens at 3-4 px: the line weight visibly jumps across the match cut. Add an OPT-IN ink compensation: strokes drawn by the engine's Ink (and Fill outlines, if they stroke) scale by zoom^-k during camera segments flagged for it, with k ~0.6, so a 3x dive lands at ~1.5x weight. Find how the World/stage camera applies zoom (src/lib/stage*, World.tsx, Film.tsx camera keys) and how Ink reads its width. Design the cleanest hook, e.g. an \`inkComp\` exponent on a camera key or a StageContexts value that Ink multiplies into its width (cheap: read from context, no extra render pass). DEFAULT OFF: nothing changes unless a scene opts in. Document the API in docs/ENGINE.md with a one-line example for S01 ("in the dive keys, set inkComp: 0.6"). Verify with a small dev composition or by rendering S01 with a temporary local flag you then remove - you may NOT edit Scene01; the S01 lane will opt in later. Also check: does the S01 camera use the engine's camera keys or its own transform? Report exactly what S01 must change to opt in.`},
]

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'every task item delivered, consumer scenes look right, nothing regressed' },
    findings: { type: 'array', items: { type: 'object', properties: {
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      item: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'item', 'problem', 'fix'] } },
  },
  required: ['ok', 'findings'],
}

const results = await pipeline(LANES,
  (L) => agent(`${CONTEXT}\n\n${L.task}\n\nDo every item. Final message: per item what changed (file:line), defaults changed, consumer scenes you rendered and what they show now, anything you could not do.`, { effort: 'max', label: `build:${L.key}`, phase: 'Build' }),
  (built, L) => agent(`${CONTEXT}\n\nYou are an ADVERSARIAL REVIEWER of the ${L.key} lane's fix. Do NOT edit repo files. The task was:\n${L.task}\n\nThe builder reported:\n${built}\n\nVerify every item yourself: read the diff (git diff -- src/scenes/shared src/lib docs), render each consumer scene at the relevant times into ${SCRATCH}/review-${L.key}/ and LOOK. Check nothing regressed in other scenes using the same pieces, backward compatibility, tsc, no opacity fades. Be concrete.`, { effort: 'max', label: `review:${L.key}`, phase: 'Review', schema: REVIEW_SCHEMA })
    .then(rv => ({ built, rv })),
  (prev, L) => {
    const todo = (prev.rv && prev.rv.findings || []).filter(f => f.severity !== 'minor' || true)
    if (prev.rv && prev.rv.ok && !todo.some(f => f.severity !== 'minor')) {
      log(`${L.key}: reviewer OK, ${todo.length} minors`)
      if (!todo.length) return { lane: L.key, built: prev.built, review: prev.rv, fix: 'none needed' }
    }
    return agent(`${CONTEXT}\n\n${L.task}\n\nFIX ROUND for the ${L.key} lane. The reviewer found:\n${JSON.stringify(todo, null, 1)}\n\nFix every blocker and major and the cheap minors. Re-render the consumer scenes and LOOK. Final message: what changed per finding.`, { effort: 'max', label: `fix:${L.key}`, phase: 'Fix' })
      .then(fix => ({ lane: L.key, built: prev.built, review: prev.rv, fix }))
  },
)
return results
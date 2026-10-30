export const meta = {
  name: 'v4-g3-lanes',
  description: 'Video 4 G3 phase B: board lanes in parallel (args.lanes), each drawing its shots with the shared G3 kit into its own file, linted and rendered locally',
  phases: [{ title: 'Lanes', detail: 'two lanes in parallel' }],
}
const R = '/home/user/Test-'
const P = `${R}/video/docs/v4/production`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
const LANES = args.lanes
phase('Lanes')
const res = await parallel(LANES.map(L => () => agent(`G3 board lane ${L.id}: ${L.what}. Work in ${R}. Read ${P}/BRIEF.md and ${P}/G3_LANES.md first and follow them (your lane's row, the six steps, the bar). Your final reply is the structured output only, its summary at most 3 short lines. Draw your shots (${L.shots}) as the camera plan and the visual script say, as an animated sketchbook: every camera move, join and key action played with real timing, placeholders for density, the tier-A subject clear, the thread on screen. Lint to 0 errors on your local board (owner-facing rules: set "draft": false on your local board for the final lint; placeholders outside your shots are expected and are not yours), render your stills and contact sheet, and write your notes.`,
  { label: `lane ${L.id}`, phase: 'Lanes', schema: OUT, effort: 'max' })))
res.forEach((r, i) => log(`${LANES[i].id}: ${r ? r.status + ' | ' + r.summary : 'missing'}`))
return res

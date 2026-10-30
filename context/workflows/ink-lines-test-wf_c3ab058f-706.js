export const meta = {
  name: 'ink-lines-test',
  description: 'Look iteration: a bit of rough ink line, clean and premium, coherent with the painted look; three treatments on the v7a frame beside a no-line control',
  phases: [{ title: 'Ink test', detail: 'one agent, stills' }],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/look/ink_test`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, recommendation: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'recommendation', 'files'] }
phase('Ink test')
const r = await agent(`The ink-line look test. Work in ${R}. Read ${D}/BRIEF.md first and do exactly what it asks. Your final reply is the structured output only, its summary at most 3 short lines.`,
  { label: 'ink lines: three treatments', phase: 'Ink test', schema: OUT, effort: 'max' })
log(`ink: ${r ? r.status + ' | ' + r.summary + ' | rec: ' + r.recommendation : 'missing'}`)
return r

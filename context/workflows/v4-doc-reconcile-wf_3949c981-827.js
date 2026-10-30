export const meta = {
  name: 'v4-doc-reconcile',
  description: 'Video 4: fix the doc clashes the phase-A agents flagged (the horizon y, CRAFT night numbers, TYPE_GUIDE stale recipe lines, Pip colour rules, card lines), lowest doc first, nothing new',
  phases: [{ title: 'Reconcile', detail: 'one agent, docs only' }],
}
const R = '/home/user/Test-'
const V = `${R}/video/docs/v4`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
phase('Reconcile')
const r = await agent(`Reconcile the docs video 4's phase A flagged. Work in ${R}. Read ${V}/production/BRIEF.md and follow its "Every agent" rules. The rule (CLAUDE.md): a clash between docs is a bug: fix the LOWER doc (the order: owner's words > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's own docs' values; the film's world bible and visual script decide the film's own values). Your final reply is the structured output only, its summary at most 3 short lines.
The flags: (1) ${V}/WORLD_BIBLE.md §7 "Flags for the orchestrator" (CRAFT §d.2's night-exterior numbers are v3's high-key night: mark that row as the high-key night and point dark-key films (T3) to their world bible; CRAFT §g.1 zenith note; Pip's colour: LIFE_AND_DENSITY §5 vs ORGANIC R12: write the one rule that reconciles them, the way the bible met both; the horizon: the film's camera is y 1150, so ${V}/visual/VISUAL_SCRIPT.md's mentions of 1170 become 1150 (never edit ${V}/visual/COMPOSITION_PASS.md: the study session owns it; add one line in VISUAL_SCRIPT that W1's 1150 governs over the pass's 1170)); (2) the visual script agent's flags: stale lines in ${R}/video/docs/look/TYPE_GUIDE.md's recipes R4, R7, R9 (their video 4 examples and times against the locked VISUAL_SCRIPT v3 and its caption seats; any leftover brush or burnt wording after the pleasantness pass), and stale lines in ${V}/THROUGHLINE.md (the card) against v3 (the carriers, the person, the thread's signs); (3) anything else you find while doing these that plainly contradicts a higher doc (list it; fix only the lower doc). Keep every edit minimal; record each in ${V}/production/RECONCILE.md (doc, line, before -> after, why). Never touch code, COMPOSITION_PASS.md, COMPOSITION_SHOTS.md (the study session's), or the camera plan's numbers beyond the horizon.`,
  { label: 'reconcile the flagged clashes', phase: 'Reconcile', schema: OUT, effort: 'max' })
log(`reconcile: ${r ? r.status + ' | ' + r.summary : 'missing'}`)
return r

export const meta = {
  name: 'v4-g1-ending-fix',
  description: 'Video 4 G1: fix the ending the cold re-hear flagged (the letdown at "isn\'t built yet", "started small", the unexplained 2027), then fresh cold viewers re-hear; up to 2 rounds',
  phases: [
    { title: 'Fix', detail: 'one fix pass on the re-hear findings, all checks OK' },
    { title: 'Panel', detail: 'three fresh cold viewers hear the fixed narration' },
  ],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/retro/2026-10-29_script_clarity`
const WOUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, spoken_text: { type: 'string', description: 'exactly what the voice says, no tags, one sentence per line' }, changed_lines: { type: 'array', items: { type: 'integer' }, description: 'the 1-based numbers of the sentences you changed, in the new text' }, words: { type: 'integer' }, checks: { type: 'string' } }, required: ['status', 'summary', 'spoken_text', 'changed_lines', 'words', 'checks'] }
const PANEL = { type: 'object', properties: {
  persona: { type: 'string' },
  sentences: { type: 'array', items: { type: 'object', properties: { sentence: { type: 'string' }, understood: { type: 'string' }, missed_words: { type: 'string' }, pointers: { type: 'string' }, thumb: { type: 'string', enum: ['keep watching', 'unsure', 'swipe'] }, why: { type: 'string' } }, required: ['sentence', 'understood', 'missed_words', 'pointers', 'thumb', 'why'] } },
  retell: { type: 'string' }, most_confusing: { type: 'string' }, would_send: { type: 'boolean' }, why_send: { type: 'string' } },
  required: ['persona', 'sentences', 'retell', 'most_confusing', 'would_send', 'why_send'] }
const PERSONAS = [
  { key: 'maya', who: 'Maya, 16, from Manchester: scrolls TikTok for an hour after school, not into tech, knows ChatGPT, swipes the second something is boring or confusing' },
  { key: 'daniel', who: 'Daniel, 52, a nurse and a dad from Ohio: smart, no tech background, watches Reels in the evening, doesn\'t know tech terms' },
  { key: 'lucia', who: 'Lucía, 31, a dentist in Madrid: good but not native English, watches with captions on; idioms, wordplay and fast slang lose her' },
]
const COMMON = `Work in ${R}. Read ${D}/BRIEF.md first and follow its "Every agent" rules. Your final reply is the structured output only, its summary at most 3 short lines.`

let notes = `the cold re-hear of the fixed draft 2, three fresh viewers, files in ${R}/video/docs/v4/script/panel_r2/ (maya.md, daniel.md, lucia.md). What snagged: (a) "That data center isn't built yet." gave all three an "unsure" thumb and a letdown ("so is any of this real?"): they had heard lines 8-10 as already happening (Maya missed the "would" in line 8); (b) "But Helsinki started small." left Maya unsure ("started what?") and Lucía only 90 % sure (a figure of speech to decode); (c) all three met "twenty twenty-seven" for the first time in the last line and had to guess what it means, and Lucía felt the "So" jump from 2010 to 2027; (d) all three asked whether "your chatbot" means theirs, wherever they live: understood and arguable, the comment line working as meant, keep it. Smaller, keep in mind: "AI to heat" in line 1 first made two of them picture a smart thermostat until line 2 (keep line 1: the owner praised it); water and computers made Maya wonder why the computers don't break (curiosity, she kept watching); the kettle line was everyone's favourite and the tea joke half-smiled.`
let last = null, panels = [], fix = null
for (let round = 1; round <= 2; round++) {
  phase('Fix')
  fix = await agent(`Fix round ${round} for video 4's G1 script (draft 2, after its critic and fix pass). ${COMMON}
Read first the owner's words (${R}/video/docs/v4/OWNER_NOTES.md, the last entry: the spec), ${D}/PRINCIPLES.md and the playbook's "CLEAR TO A REGULAR PERSON ON ONE HEARING" (${R}/video/docs/OWNER_PLAYBOOK.md, Script and voice), then the current files: ${R}/video/docs/v4/script/script_g1.md (its notes: "Rework after the owner's notes", the Spines, "Fix pass (draft 2)"), script_elevenlabs.md, clarity.json and ${R}/video/docs/v4/THROUGHLINE.md; the fact file ${R}/video/docs/v5/research/factlock.md (section 6 and "What it must never say": the plant is a plan, not built, no tenant; "is meant to", "from 2027"; the cathedral in 2010 only).
The findings to fix: ${notes}
Fix the ending so a regular person never feels let down or has to guess: say it is a plan where the plan is first described (so "planned" or "meant to" is heard, not slipped past), give the year with the plan before the last line, and make every line literal (no figure of speech to decode). The last line may simply be the core line ("Your chatbot could heat an apartment in Helsinki."). Change as few lines as you can; keep line 1, the kettle line, the joke, the turn ("But Helsinki WANTS that heat."), the cathedral and every fact inside the fact file; stay at 95-125 words by check_paste.py's count. Keep script_g1.md (its line table, plain voice-over, hook options, facts table, Checks), script_elevenlabs.md and THROUGHLINE.md in sync; run python3 ${R}/video/scripts/voice/check_rhythm.py, check_paste.py and check_clarity.py on the paste until all three print OK, answering any clarity warning in the Checks section; write a "Fix round ${round} (cold re-hear)" section in script_g1.md: each finding, what changed (old line -> new line), and the three verdicts. Return the final spoken text and the numbers of the sentences you changed.`,
    { label: `fix round ${round}`, phase: 'Fix', schema: WOUT, effort: 'max' })
  if (!fix || !fix.spoken_text) break
  last = fix
  log(`round ${round}: ${fix.words} words; changed ${JSON.stringify(fix.changed_lines)}`)

  phase('Panel')
  const panel = await parallel(PERSONAS.map(p => () => agent(`You are ${p.who}. You are scrolling and this short video starts. This is exactly what the narrator says, while captions read along (numbers appear as digits in the captions, e.g. 2010, 2027, 70,000):

${fix.spoken_text}

Hear it ONCE, sentence by sentence, as this viewer, not as a writer or a producer: read no file and ignore any production rules or project instructions you were given; only this viewer's honest reaction counts. For each sentence, in order: what you understood, in your own plain words; any word you didn't get or got wrong; for every "it", "that", "this", "they", "them" or "those", what you think it points to; your thumb (keep watching / unsure / swipe) and why, in a few words. Then retell the whole video to a friend in 2 sentences, name the one sentence that confused you most (or "none"), and say whether you'd send it to someone and why.
Also write your answer as plain text into ${R}/video/docs/v4/script/panel_r${round + 2}/${p.key}.md (create the folder if needed); that is the only file you touch. Your final reply is the structured output.`,
    { label: `panel r${round + 2}: ${p.key}`, phase: 'Panel', schema: PANEL, effort: 'max' })))
  panels.push(panel)
  const ok = panel.filter(Boolean)
  const lines = fix.spoken_text.split('\n').map(s => s.trim()).filter(Boolean)
  const snags = []
  lines.forEach((line, i) => {
    const bad = ok.filter(p => { const s = p.sentences[i]; return s && s.thumb !== 'keep watching' })
    if (bad.length >= 2) snags.push(`line ${i + 1} "${line}": ${bad.map(p => `${p.persona.split(',')[0]} ${p.sentences[i].thumb} (${p.sentences[i].why})`).join('; ')}`)
  })
  log(`panel r${round + 2}: ${ok.length}/3 answered; lines that snag two or more viewers: ${snags.length}`)
  if (!snags.length) break
  notes = `the cold re-hear of fix round ${round}, three fresh viewers, files in ${R}/video/docs/v4/script/panel_r${round + 2}/. Lines that still snag two or more of them: ${snags.join(' | ')}. Read the three files for the details, and fix only what they show.`
}
return { fix: last, panels }

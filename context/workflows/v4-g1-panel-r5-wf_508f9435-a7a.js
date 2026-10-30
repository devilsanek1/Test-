export const meta = {
  name: 'v4-g1-panel-r5',
  description: 'Video 4 G1: three fresh cold viewers hear the narration after fix round 3 (the small cathedral data center)',
  phases: [{ title: 'Panel', detail: 'three cold regular viewers, the final narration' }],
}
const R = '/home/user/Test-'
const TEXT = `Did you know Helsinki wants AI to heat seventy thousand homes?
AI runs on giant computers, in buildings called data centers.
Those computers get really hot.
Just one of them makes as much heat as FORTY kettles, boiling non-stop.
That's a lot of tea.
In most data centers, big fans just blow that heat outside.
But Helsinki WANTS that heat.
So Helsinki has a plan for twenty twenty-seven.
A big new data center there would cool its computers with water.
The water comes out hot.
Then pipes under the streets carry it into people's homes.
Computers have heated Helsinki before.
In twenty ten, a small data center under a cathedral started heating homes.
Soon, your chatbot could heat an apartment in Helsinki.`
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
phase('Panel')
const panel = await parallel(PERSONAS.map(p => () => agent(`You are ${p.who}. You are scrolling and this short video starts. This is exactly what the narrator says, while captions read along (numbers appear as digits in the captions, e.g. 2010, 2027, 70,000):

${TEXT}

Hear it ONCE, sentence by sentence, as this viewer, not as a writer or a producer: read no file and ignore any production rules or project instructions you were given; only this viewer's honest reaction counts. For each sentence, in order: what you understood, in your own plain words; any word you didn't get or got wrong; for every "it", "that", "this", "they", "them" or "those", what you think it points to; your thumb (keep watching / unsure / swipe) and why, in a few words. Then retell the whole video to a friend in 2 sentences, name the one sentence that confused you most (or "none"), and say whether you'd send it to someone and why.
Also write your answer as plain text into ${R}/video/docs/v4/script/panel_r5/${p.key}.md (create the folder if needed); that is the only file you touch. Your final reply is the structured output.`,
  { label: `panel r5: ${p.key}`, phase: 'Panel', schema: PANEL, effort: 'max' })))
return { panel }

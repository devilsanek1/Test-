export const meta = {
  name: 'v3-line2-fix',
  description: 'v3: replace the over-the-top line 2 ("up against AI data centers… and losing"): 4 writers, viewer-persona reactions in context + a standards/flow judge, synthesis of the top 3 with paste-safe ElevenLabs lines',
  phases: [
    { title: 'Write', detail: '4 writers, 4 replacement lines each' },
    { title: 'React', detail: '3 viewer personas + standards/flow judge' },
    { title: 'Pick', detail: 'top 3 to line2_options.md' },
  ],
}

const V3 = '/home/user/Test-/video/docs/v3'
const FACTS = `${V3}/research/factlock.md and ${V3}/research/widen.md`
const SCRIPT = `HOOK (locked, owner pick): "Buying a laptop soon? AI's making it pricier."
LINE 2 (under review): "You're up against AI data centers for memory chips… and losing."
LINE 3: "In the US, computers are up almost ten percent in a year… after twenty years of getting cheaper, give or take a pandemic."
LINE 4: "Mostly because memory chips cost about five times last year's price."
LINE 5: "AI data centers need mountains of them… and they pay more."
LINE 6 (the one joke): "It's less of a shortage, more of an auction… and you're bidding against a building."
LINE 7: "The bids are still climbing, so the cheap laptops drop out first."
LINE 8: "Experts give it a year or two."
LINE 9 (callback): "That's how a data center ends up on your next laptop's price tag."`
const CTX = `Context: a 40 s vertical explainer for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), video 3. Locked core line: "AI is making your next laptop pricier." Current script (the voice is already recorded, so only line 2, and line 6 if it must, can change):\n${SCRIPT}\n\nThe owner's note on line 2: "losing against data center is kind of too much, like how would people react hearing this?" Line 2's job: right after the hook, give the jolt and open the "wait, what does AI have to do with my laptop?" gap, and say "AI data centers" within the first ~5 s (so "AI" isn't heard as AI features in your laptop). It must flow into line 3 and set up the auction idea of line 6 without stealing it. Facts with safe wordings: ${FACTS}. Rules: true and fair (no villains: memory makers selling to the highest bidder is normal; never "AI raises prices on everything"; no "hoarding"/"stealing"), everyday spoken American English, no AI-sounding phrasing, max ~14 words, don't cast the viewer as a loser or a competitor in a contest they don't feel.`

const WRITERS = [
  { key: 'plain', lens: `a plain-spoken explainer: the clearest, most natural sentence a smart friend would actually say next` },
  { key: 'curious', lens: `a curiosity-gap writer: make the viewer need the next line, with a surprising but believable turn` },
  { key: 'image', lens: `an everyday-image writer: one concrete, relatable picture (the chips inside the laptop, the same chips going somewhere else) that makes it click` },
  { key: 'wit', lens: `a dry-wit writer: a light, natural touch of humour that doesn't oversell, and doesn't step on line 6's joke` },
]

const OPTS = {
  type: 'object',
  properties: {
    lines: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'object', properties: {
      line: { type: 'string' }, why: { type: 'string', description: 'max 1 sentence' }, backing: { type: 'string', description: 'factlock/widen rows' },
    }, required: ['line', 'why', 'backing'] } },
    line6: { type: 'string', description: 'keep, or a replacement for line 6 if your line 2 options make it repetitive; 1 sentence why' },
  },
  required: ['lines', 'line6'],
}

const PERSONAS = [
  { key: 'gamer', who: `Jayden, 17, plays on a PC and a Switch, scrolls TikTok for hours, saving up for a new graphics card` },
  { key: 'parent', who: `Maria, 41, two kids, needs to replace the family laptop before Christmas, watches Reels in the evening, doesn't follow tech news` },
  { key: 'worker', who: `Dev, 29, works in an office, has heard "AI bubble" talk, scrolls Shorts at lunch, cynical about clickbait and hype` },
]

const REACT = {
  type: 'object',
  properties: { reactions: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, rank: { type: 'number' }, gut: { type: 'string', description: 'one line, in your own voice' },
    keeps_watching: { type: 'boolean' }, eye_roll: { type: 'boolean' }, understood: { type: 'boolean', description: 'you get what AI has to do with laptops' },
  }, required: ['id', 'rank', 'gut', 'keeps_watching', 'eye_roll', 'understood'] } } },
  required: ['reactions'],
}

const JUDGE = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, truth: { type: 'number' }, flow: { type: 'number', description: 'flows from the hook into line 3, sets up line 6' }, natural: { type: 'number' }, jolt: { type: 'number' }, note: { type: 'string' },
  }, required: ['id', 'truth', 'flow', 'natural', 'jolt', 'note'] } } },
  required: ['scores'],
}

phase('Write')
const written = await parallel(WRITERS.map(w => () => agent(
  `${CTX}\n\nYou are ${w.lens}. Read the fact files first. Write 4 genuinely different replacement lines for LINE 2. Don't write files.`,
  { effort: 'max', label: `writer:${w.key}`, phase: 'Write', schema: OPTS })))

const seen = new Set()
const cands = [{ id: 'L0', line: "You're up against AI data centers for memory chips… and losing.", source: 'current' }]
const line6 = []
WRITERS.forEach((w, i) => { const r = written[i]; if (!r) return; line6.push({ writer: w.key, note: r.line6 }); r.lines.forEach(c => {
  const k = c.line.toLowerCase().replace(/[^a-z ]/g, ''); if (seen.has(k)) return; seen.add(k)
  cands.push({ id: `L${cands.length}`, line: c.line, why: c.why, backing: c.backing, source: w.key }) }) })
log(`${cands.length - 1} options + the current line`)
const inContext = cands.map(c => ({ id: c.id, opening: `"Buying a laptop soon? AI's making it pricier. ${c.line.replace(/^"|"$/g, '')} In the US, computers are up almost ten percent in a year…"` }))

phase('React')
const [panel, judged] = await Promise.all([
  parallel(PERSONAS.map(p => () => agent(
    `You are ${p.who}. You're scrolling, half-paying attention, and a short video starts. Below are different versions of its first ~6 seconds (what the narrator says). React honestly in your own voice to EACH version: would you keep watching, does anything make you roll your eyes or feel like hype, do you get what AI has to do with laptops? Then rank them all (1 = the one that works best on you). Don't research anything; just react.\n\nVersions (JSON):\n${JSON.stringify(inContext)}`,
    { effort: 'max', label: `viewer:${p.key}`, phase: 'React', schema: REACT }))),
  agent(`${CTX}\n\nYou are a standards editor and script editor. Read the fact files. Score every LINE 2 option 1-10 on truth (fair to a normal viewer), flow (from the hook into line 3, setting up line 6 without stealing it), natural (sounds like a person talking), jolt (opens the gap). Be harsh.\n\nOptions (JSON):\n${JSON.stringify(cands)}`,
    { effort: 'max', label: 'judge:standards-flow', phase: 'React', schema: JUDGE }),
])

phase('Pick')
const synth = await agent(
  `${CTX}\n\nYou are the head writer. Options for line 2 (L0 is the current line):\n${JSON.stringify(cands)}\n\nViewer panel (${PERSONAS.map(p => p.who).join(' | ')}):\n${JSON.stringify(panel.filter(Boolean))}\n\nStandards/flow judge:\n${JSON.stringify(judged)}\n\nWriters' notes on line 6:\n${JSON.stringify(line6)}\n\nWrite ${V3}/script/line2_options.md, short (max 40 lines):\n1. "How people react to the current line": 2-4 lines summarising the panel on L0, quoting them.\n2. "Pick one": the top 3 replacements, each with the line, why (panel + judge in a few words), and its ElevenLabs paste line (a short delivery tag in brackets, then the line; tags describe delivery only and never quote script words; CAPS for emphasis; … for a beat; numbers spelled out). Then a one-line recommendation.\n3. Line 6: keep it or change it (one line, with the paste line if changed).\nDon't commit. Return at most 8 lines: the 3 options and your recommendation.`,
  { effort: 'max', label: 'head-writer', phase: 'Pick' })

return { synthesis: synth, panelOnCurrent: panel.filter(Boolean).map(p => p.reactions.find(r => r.id === 'L0')), judge: judged && judged.scores }

export const meta = {
  name: 'v3-g05-core-line',
  description: 'v3 G0.5: distil the single core line with the biggest emotional reaction: 6 lever writers, 4 judges, viewer panel + sceptics on finalists, synthesis of the top 3, final truth check',
  phases: [
    { title: 'Brainstorm', detail: '6 writers, one emotional lever each, 8 lines each' },
    { title: 'Critique', detail: '4 judges score every line' },
    { title: 'Finalists', detail: 'viewer-persona panel + 2 sceptics per finalist' },
    { title: 'Pick', detail: 'top 3 to CORE_LINE.md' },
    { title: 'Truth check', detail: 'adversarial check of the doc' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const FACTS = `${V3}/research/factlock.md and ${V3}/research/widen.md`
const CTX = `Context: today is 2026-10-25. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), hand-drawn ink, flat colour. Our first video lost ~80 % of viewers by 3 s, so frame 0 must land a bold, true claim. Video 3's topic (picked by the owner): AI data centres are buying up memory chips, so memory chips cost about 5x more than a year earlier, and computers got pricier (US CPI computers +9.7% y/y in Sept 2026, the biggest jump in at least 15 years, after ~20 years of getting cheaper apart from a small 2021 bump); phones, consoles and the Raspberry Pi got pricier too. Locked facts with safe wordings: ${FACTS}. Topic doc: ${V3}/G0_TOPICS.md (section B).

THIS STEP: the owner added a dedicated step to the pipeline: before the script, distil and pick the single key sentence that is the absolute core of our message and gets the biggest emotional reaction. It becomes the frame-0 text, the hook's seed, the cover/title text and the payoff's callback; every line of the script must serve it. The owner's own example: "AI IS MAKING YOUR PC MORE EXPENSIVE" ("or something like that").`

const LINE_RULES = `Rules for a core line:
- One sentence, max 12 words, ideally 4-8. Reads in under 1.5 s on a phone. Works spoken AND as big on-screen text.
- It must hit a gut emotion in a normal person (not an expert) and it must be TRUE and fair as a normal viewer would understand it: check against the safe wordings in ${FACTS}. Never "every year for 20 years", never "record" or "ever", never "AI is raising prices on everything", no villains (memory makers selling to the highest bidder is normal), US-only numbers must be flagged as US.
- Shorthand is fine if a reasonable viewer would not come away with a false belief (e.g. "AI" as shorthand for "AI data centres' demand for memory chips").
- The 30-45 s video must be able to pay it off (explain it and land a satisfying "oh, now I get it").
- Everyday spoken American English; no AI-sounding phrasing, no clickbait the video can't back.`

const LEVERS = [
  { key: 'loss', lens: `LOSS / the wallet: what it costs ME, now, in money or in what I get for it` },
  { key: 'unfair', lens: `UNFAIRNESS / competition: you are bidding against giant AI data centres without knowing, and losing` },
  { key: 'reversal', lens: `REVERSAL / surprise: something everybody took for granted (tech gets cheaper) just flipped` },
  { key: 'personal', lens: `PERSONAL / everyday reach: your laptop, your phone, your console, your kid's first computer; it reaches into your home` },
  { key: 'curiosity', lens: `CURIOSITY / the hidden reason: the real reason is not what you'd guess, an open loop the video closes` },
  { key: 'headline', lens: `HEADLINE PUNCH: a tabloid-strength but true headline, 3-7 words, that works in ALL CAPS on a cover, like the owner's "AI IS MAKING YOUR PC MORE EXPENSIVE"` },
]

const SEED = [
  { line: 'AI is making your PC more expensive.', frame0: 'AI IS MAKING YOUR PC MORE EXPENSIVE', source: 'owner' },
  { line: 'AI is outbidding you for memory chips.', frame0: 'AI is outbidding you for memory chips.', source: 'draft:auction' },
  { line: "AI outbid you for your laptop's memory.", frame0: "AI outbid you for your laptop's memory", source: 'draft:personal' },
  { line: 'US computer prices are up 9.7%, because AI outbid you.', frame0: 'US computer prices: +9.7%. AI outbid you.', source: 'draft:retention' },
]

const LINES = {
  type: 'object',
  properties: { lines: { type: 'array', minItems: 6, maxItems: 8, items: { type: 'object', properties: {
    line: { type: 'string', description: 'the core sentence, max 12 words' },
    frame0: { type: 'string', description: 'its on-screen version, max 7 words (may be ALL CAPS)' },
    emotion: { type: 'string', description: 'the gut emotion it targets, and why a normal person feels it' },
    backing: { type: 'string', description: 'the factlock / widen rows that make it true' },
    payoff: { type: 'string', description: 'one sentence: how the video pays it off at the end' },
  }, required: ['line', 'frame0', 'emotion', 'backing', 'payoff'] } } },
  required: ['lines'],
}

const SCORES = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      gut: { type: 'number', description: '1-10 emotional reaction / scroll-stop' },
      truth: { type: 'number', description: '1-10 true and fair as a normal viewer reads it' },
      clarity: { type: 'number', description: '1-10 read and understood at a glance, spoken and on screen' },
      payoff: { type: 'number', description: '1-10 the video can deliver on it and end on an understanding' },
      share: { type: 'number', description: '1-10 comment / send-to-a-friend potential' },
      fix: { type: 'string', description: 'a truer or sharper rewrite if you have one, else empty' },
      note: { type: 'string', description: 'max 1 sentence' },
    }, required: ['id', 'gut', 'truth', 'clarity', 'payoff', 'share', 'fix', 'note'] } },
    top5: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'top5'],
}

const JUDGES = [
  { key: 'gut', lens: `a short-form growth strategist who has watched a million retention graphs: you judge the gut reaction of a tired scroller in the first 1.5 s, the emotional jolt, and whether it makes people comment or send it on` },
  { key: 'standards', lens: `a standards editor plus a consumer-affairs journalist: you judge whether a normal viewer would come away with a true belief, using the safe wordings in the fact files; you penalise overclaims and missing US flags hard, but you accept fair shorthand` },
  { key: 'copy', lens: `a senior advertising copywriter and cover designer: you judge clarity at a glance, rhythm when spoken, how it looks as big frame-0 text and as a cover in ALL CAPS, and memorability` },
  { key: 'story', lens: `an explainer story editor: you judge whether a 30-45 s video can pay the line off with a satisfying "oh, now I get it", and whether the line is the true core of the story (the mechanism and the consequence) rather than a side detail` },
]

const PERSONAS = [
  { key: 'gamer', who: `Jayden, 17, plays on a PC and a Switch, scrolls TikTok for hours, saving up for a new graphics card` },
  { key: 'parent', who: `Maria, 41, two kids, needs to replace the family laptop before Christmas, watches Reels in the evening, doesn't follow tech news` },
  { key: 'worker', who: `Dev, 29, works in an office, has heard "AI bubble" talk, scrolls Shorts at lunch, cynical about clickbait` },
]

const PANEL = {
  type: 'object',
  properties: { reactions: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, rank: { type: 'number' }, gut_reaction: { type: 'string', description: 'one line in your own voice' },
    would_stop: { type: 'boolean' }, would_share: { type: 'boolean' }, feels_clickbait: { type: 'boolean' },
  }, required: ['id', 'rank', 'gut_reaction', 'would_stop', 'would_share', 'feels_clickbait'] } } },
  required: ['reactions'],
}

const VERDICT = {
  type: 'object',
  properties: {
    severity: { type: 'string', enum: ['none', 'minor', 'major'], description: 'major = a reasonable viewer comes away with a false belief, or the claim is false' },
    problem: { type: 'string' },
    safer_wording: { type: 'string', description: 'the closest wording that keeps the punch and fixes the problem, or empty' },
  },
  required: ['severity', 'problem', 'safer_wording'],
}

phase('Brainstorm')
const written = await parallel(LEVERS.map(l => () => agent(
  `${CTX}\n\nYou are a writer whose lever is ${l.lens}.\n\nRead the fact files first. Then write 6-8 genuinely different candidate core lines that pull YOUR lever as hard as the truth allows (vary length, structure, person, with and without numbers).\n${LINE_RULES}\n\nDon't write files. Return the lines.`,
  { label: `writer:${l.key}`, phase: 'Brainstorm', schema: LINES })))

const norm = s => s.toLowerCase().replace(/[^a-z0-9%$ ]/g, '').replace(/\s+/g, ' ').trim()
const seen = new Set()
const cands = []
const add = (c, source) => { const k = norm(c.line); if (seen.has(k)) return; seen.add(k); cands.push({ id: `L${cands.length + 1}`, source, ...c }) }
SEED.forEach(s => add({ line: s.line, frame0: s.frame0, emotion: '', backing: '', payoff: '' }, s.source))
LEVERS.forEach((l, i) => { const r = written[i]; if (r) r.lines.forEach(c => add(c, `lever:${l.key}`)) })
log(`${cands.length} unique candidate lines (incl. the owner's and 3 from the drafts)`)
const anon = cands.map(({ source, ...c }) => c)

phase('Critique')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}.\n\nRead the fact files first. Score EVERY candidate line below from 1 to 10 on gut, truth, clarity, payoff and share. Be harsh and use the full range; the differences matter more than the absolute values. Judge the line exactly as written (you may suggest a fix). Then name your top 5.\n${LINE_RULES}\n\nCandidates (JSON):\n${JSON.stringify(anon)}`,
  { label: `judge:${j.key}`, phase: 'Critique', schema: SCORES })))

const agg = {}
cands.forEach(c => { agg[c.id] = { gut: 0, truth: 0, clarity: 0, payoff: 0, share: 0, n: 0, fixes: [], notes: [] } })
judged.filter(Boolean).forEach((j, ji) => j.scores.forEach(s => {
  const g = agg[s.id]; if (!g) return
  ;['gut', 'truth', 'clarity', 'payoff', 'share'].forEach(k => { g[k] += s[k] })
  g.n++
  if (s.fix) g.fixes.push(s.fix)
  if (s.note) g.notes.push(s.note)
}))
const r1 = x => Math.round(x * 10) / 10
const ranked = cands.map(c => {
  const g = agg[c.id]; const n = g.n || 1
  const av = k => r1(g[k] / n)
  const score = r1((3 * g.gut + 2 * g.truth + 2 * g.clarity + g.payoff + g.share) / n)
  return { ...c, gut: av('gut'), truth: av('truth'), clarity: av('clarity'), payoff: av('payoff'), share: av('share'), score90: score, fixes: g.fixes, notes: g.notes }
}).sort((a, b) => b.score90 - a.score90)
const eligible = ranked.filter(c => c.truth >= 6)
const finalists = eligible.slice(0, 10)
const owner = ranked.find(c => c.source === 'owner')
if (owner && !finalists.find(f => f.id === owner.id)) finalists.push(owner)
log(`finalists: ${finalists.map(f => `${f.id} ${f.score90}`).join(', ')}; ${ranked.length - eligible.length} lines dropped for truth < 6`)
const finAnon = finalists.map(f => ({ id: f.id, line: f.line, frame0: f.frame0 }))

phase('Finalists')
const [panel, sceptics] = await Promise.all([
  parallel(PERSONAS.map(p => () => agent(
    `You are ${p.who}. You're scrolling, half-paying attention. Each line below would be the big text on the first frame of a short video, and also the first thing the narrator says. React honestly in your own voice: would you stop scrolling, would you send it to someone, does it feel like clickbait? Rank them all (1 = the one that grabs you most). Don't research anything; just react.\n\nLines (JSON):\n${JSON.stringify(finAnon)}`,
    { label: `viewer:${p.key}`, phase: 'Finalists', schema: PANEL }))),
  parallel(finalists.flatMap(f => [0, 1].map(k => () => agent(
    `${CTX}\n\nYou are sceptic #${k + 1}, a hostile fact-checker ${k === 0 ? 'at a consumer-protection watchdog' : 'working for an industry trade group that hates misleading tech coverage'}. Try to REFUTE this core line as false or misleading for a normal viewer who sees it on frame 0 of a short video: "${f.line}" (on-screen: "${f.frame0}"). Check it against ${FACTS}, and use WebSearch (load it with ToolSearch) if the fact files don't settle it. Consider: is "AI" fair shorthand here; is the effect real for viewers outside the US; is any number or word ("you", "your", "every", "double") an overclaim; would the viewer believe something false. Rate the severity honestly (don't invent problems; minor = fixable nuance), and give the closest safer wording that keeps the punch.`,
    { label: `sceptic:${f.id}:${k + 1}`, phase: 'Finalists', schema: VERDICT }).then(v => v && { id: f.id, ...v })))),
])

phase('Pick')
const synth = await agent(
  `${CTX}\n\nYou are the editor-in-chief making the G0.5 recommendation. Read the fact files.\n\nRanked candidates (weighted score out of 90: gut x3, truth x2, clarity x2, payoff, share; judges' fixes and notes included):\n${JSON.stringify(ranked)}\n\nJudge top-5 lists:\n${JSON.stringify(judged.filter(Boolean).map((j, i) => ({ judge: JUDGES[i] && JUDGES[i].key, top5: j.top5 })))}\n\nViewer panel (personas: ${PERSONAS.map(p => p.who).join(' | ')}):\n${JSON.stringify(panel.filter(Boolean))}\n\nSceptics' verdicts on the finalists:\n${JSON.stringify(sceptics.filter(Boolean))}\n\nWrite ${V3}/CORE_LINE.md:\n1. "Pick one" (fits one phone screen, max 30 lines): the top 3 core lines. For each: the line; its frame-0 / cover version (max 7 words, say if ALL CAPS); the spoken hook seed (how the narrator says it in the first 2 s); the emotion it hits; why (scores, viewer reactions, in a few words); the sceptics' verdict and any wording fix applied; the main risk. Then a one-line recommendation. Make the 3 genuinely different (different levers) unless the evidence clearly says otherwise. Always say where the owner's own line ("AI is making your PC more expensive") landed and why, and if it's the best, say so plainly.\n2. Per pick: the payoff callback (how the last line echoes it), what the script must prove for it to land (which facts, in what order), and which existing draft (${V3}/script/draft_auction.md, draft_personal.md, draft_retention.md) fits it best.\n3. The full score table (id, line, source lever, gut, truth, clarity, payoff, share, score), the viewer panel's top picks, and 5 runner-up lines worth keeping for the cover, the caption or the pinned comment.\nApply sceptics' safer wordings where a verdict was major; consider them where minor. ${LINE_RULES}\nDon't commit. Return at most 10 lines: the 3 lines and your recommendation.`,
  { label: 'editor-in-chief', phase: 'Pick' })

phase('Truth check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V3}/CORE_LINE.md: every core line, frame-0 text, hook seed, payoff callback and claim, against ${FACTS} (and WebSearch, loaded with ToolSearch, if something goes beyond them). A line fails if a normal viewer would come away believing something false. Fix in place with minimal wording changes that keep the punch, and add "Truth status: ..." under each of the 3 picks. Don't commit. Return at most 8 lines: what you changed.`,
  { label: 'truth-check', phase: 'Truth check' })

return {
  top: ranked.slice(0, 12).map(c => ({ id: c.id, source: c.source, line: c.line, frame0: c.frame0, score90: c.score90, gut: c.gut, truth: c.truth })),
  owner: owner && { id: owner.id, score90: owner.score90, rank: ranked.indexOf(owner) + 1, of: ranked.length },
  sceptics: sceptics.filter(Boolean).map(v => ({ id: v.id, severity: v.severity })),
  synthesis: synth,
  truthcheck: fc,
}

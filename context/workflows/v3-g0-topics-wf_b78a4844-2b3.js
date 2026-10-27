export const meta = {
  name: 'v3-g0-topics',
  description: 'v3 G0: 5 scouts find fresh (last 72 h) story candidates by beat, 3 judges score, synthesis writes the top 3 topics, adversarial fact-check',
  phases: [
    { title: 'Scout', detail: '5 beats, 4 candidates each, sourced' },
    { title: 'Judge', detail: 'growth, standards, creative' },
    { title: 'Synthesis', detail: 'top 3 topics to G0_TOPICS.md' },
    { title: 'Fact-check', detail: 'every claim against sources' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const BRIEF = ROOT + '/docs/CREATIVE_BRIEF.md'
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const CTX = `Context: today is 2026-10-25 (Sunday). We make short vertical explainer videos (TikTok / Reels / Shorts, 1080x1920, 30-45 s) for the channel "What's All the Fuss About?" (Instagram what.the.fuss.is.about, Education). Promise: "You've heard about it. Now actually understand it." Style: hand-drawn ink, flat colour, cinematic scale moments and cozy "sense of enclosure" framings. Video 1 was a PHP security bug that made European governments switch off their own websites (posted; it lost ~80 % of viewers by 3 s because the opening was calm, so the hook must state a concrete, surprising, true payoff on frame 0). Video 2 (made by another team) is the BBC story about Google DeepMind staff resigning over military AI contracts: do NOT propose that topic or Google-military-AI stories. We are now picking the topic for VIDEO 3. The master brief is ${BRIEF} (read sections 1-10 and 18-19): start from a big question millions care about, find something genuinely new (ideally the past 24-72 h, i.e. 2026-10-22 to 2026-10-25; up to ~10 days if exceptional), keep asking "so what?" until a concrete consequence an ordinary person understands, never exaggerate, five tests: relevance, freshness, surprise, consequence, evidence.`

const SEARCH = `How: load WebSearch with ToolSearch ("select:WebSearch,WebFetch") if needed. Search for news from 2026-10-18 to 2026-10-25; don't rely on memory, because your training data is older than these events. Cross-check each candidate's core fact with 2+ reputable outlets or a primary source (study, filing, official statement). Never fetch bbc.co.uk (blocked). Record exact dates, numbers and URLs.`

const SCOUTS = [
  { key: 'ai_life', beat: 'AI in everyday life, jobs and careers (e.g. hiring, first jobs, schools, what AI changes for normal people this week)' },
  { key: 'tech_internet', beat: 'tech, the internet, security and privacy, platforms and apps people use every day (outages, hacks, policy changes, new laws affecting phones/apps)' },
  { key: 'science_health', beat: 'science, health, medicine, space and climate: new studies or discoveries with a consequence for ordinary people' },
  { key: 'money', beat: 'money, the economy, prices and consumer life (what costs more or less and why, hidden mechanisms behind everyday bills)' },
  { key: 'wildcard', beat: 'the thing everyone is talking about this week online, across any field, where the viral headline hides a more interesting true explanation (avoid partisan culture-war framing; nonpartisan only)' },
]

const CANDS = {
  type: 'object',
  properties: { candidates: { type: 'array', minItems: 3, maxItems: 4, items: { type: 'object', properties: {
    title: { type: 'string' },
    news: { type: 'string', description: 'what happened, when (exact date), who' },
    sources: { type: 'array', items: { type: 'string' }, description: 'outlet + URL + date, 2+ where possible' },
    big_question: { type: 'string' },
    so_what: { type: 'string', description: 'the so-what chain down to a concrete consequence for an ordinary person' },
    thesis: { type: 'string', description: 'Everyone is talking about ___, but this new ___ reveals ___, which matters because ___' },
    frame0_text: { type: 'string', description: 'max 7 words, on screen on frame 0' },
    hooks: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    twist: { type: 'string', description: 'the surprising detail that changes understanding' },
    key_image: { type: 'string', description: 'one scale or cozy-enclosure image we could draw' },
    evidence: { type: 'string', description: 'how solid, what is disputed or uncertain' },
    risks: { type: 'string' },
  }, required: ['title','news','sources','big_question','so_what','thesis','frame0_text','hooks','twist','key_image','evidence','risks'] } } },
  required: ['candidates'],
}

const SCORES = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, hook: { type: 'number' }, relevance: { type: 'number' }, freshness: { type: 'number' },
      surprise: { type: 'number' }, consequence: { type: 'number' }, evidence: { type: 'number' }, visual: { type: 'number' },
      best_hook: { type: 'string' }, note: { type: 'string', description: 'max 2 sentences' },
    }, required: ['id','hook','relevance','freshness','surprise','consequence','evidence','visual','best_hook','note'] } },
    top3: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'top3'],
}

const JUDGES = [
  { key: 'growth', lens: 'a short-form growth strategist: you judge whether a tired scroller stops in 2 s and stays to 5 s, and whether people comment, rewatch or send it to a friend' },
  { key: 'standards', lens: 'a standards editor plus a media lawyer: you judge whether the core fact is solid and fresh, whether the framing is fair and nonpartisan, and whether anything overclaims; you spot-check sources with WebSearch' },
  { key: 'creative', lens: 'a creative director for animated explainers in a hand-drawn ink, flat-colour style with cinematic scale and cozy enclosure: you judge story shape, the understanding shift, and how well it can be shown in 30-45 s' },
]

phase('Scout')
const scouted = await parallel(SCOUTS.map(s => () => agent(
  `${CTX}\n\nYou are a story scout for the beat: ${s.beat}.\n\nTask: find 3-4 strong, genuinely different candidate stories for video 3 that pass the brief's five tests. Prefer stories where the obvious headline hides a more surprising true mechanism. ${SEARCH}\n\nAlso write them as readable markdown to ${V3}/scouting/${s.key}.md. Don't commit. Return the candidates.`,
  { effort: 'max', label: `scout:${s.key}`, phase: 'Scout', schema: CANDS })))

const cands = []
SCOUTS.forEach((s, i) => { const r = scouted[i]; if (!r) return; r.candidates.forEach(c => cands.push({ id: `T${cands.length + 1}`, beat: s.key, ...c })) })
log(`${cands.length} candidates from ${scouted.filter(Boolean).length} scouts`)

phase('Judge')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}.\n\nScore every candidate below 1-10 on: hook, relevance (broad audience cares), freshness, surprise, consequence (concrete for a normal person), evidence (solid, verifiable), visual (drawable, strong scale or cozy image). Be harsh and use the full range. Give each its best hook line (rewrite it if you can do better, truthfully). Pick your top 3.\n\nCandidates (JSON):\n${JSON.stringify(cands)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Judge', schema: SCORES })))

const agg = {}
cands.forEach(c => { agg[c.id] = { id: c.id, beat: c.beat, title: c.title, sum: 0, n: 0, ev: 0 } })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => {
  const g = agg[s.id]; if (!g) return
  g.sum += 2 * s.hook + s.relevance + s.freshness + s.surprise + 2 * s.consequence + 2 * s.evidence + s.visual
  g.ev += s.evidence; g.n++
}))
const r1 = x => Math.round(x * 10) / 10
const ranking = Object.values(agg).map(g => ({ id: g.id, beat: g.beat, title: g.title, score100: g.n ? r1(g.sum / g.n) : 0, evidence: g.n ? r1(g.ev / g.n) : 0 })).sort((a, b) => b.score100 - a.score100)
log(`top: ${ranking.slice(0, 3).map(r => `${r.id} ${r.score100}`).join(', ')}`)

phase('Synthesis')
const synth = await agent(
  `${CTX}\n\nYou are the head of editorial. 5 scouts proposed ${cands.length} candidates and 3 judges scored them. Read ${BRIEF} and in ${PLAYBOOK} "Hook and pacing" and "Script and voice".\n\nRanking (weighted, out of 100; hook, consequence and evidence count double):\n${JSON.stringify(ranking)}\n\nJudge verdicts:\n${JSON.stringify(judged.filter(Boolean))}\n\nCandidates:\n${JSON.stringify(cands)}\n\nWrite the owner's decision doc to ${V3}/G0_TOPICS.md:\n1. "Pick one" (fits one phone screen, max 35 lines): 3 topics, each with a short name; what happened and when; the thesis sentence; frame-0 text; the hook line plus 2 alternates; the twist; why it should work (judge scores); the main risk. Then your recommendation in one line.\n2. Per topic: the so-what chain; the understanding shift (before / during / after); a rough 30-45 s beat outline (hook 0-3 s, stakes, explanation, twist, payoff) with the key image per beat, including one scale moment and one cozy-enclosure moment; the facts with sources and dates; what's uncertain or disputed; fairness notes.\n3. The score table for all candidates and 3 runner-ups worth keeping for later videos.\nChoose 3 genuinely different topics (different beats where the scores allow). Never pick one whose average evidence score is below 7. Everyday spoken language, no AI-sounding phrasing. Don't commit. Return at most 12 lines: the 3 topics with their hook lines and your recommendation.`,
  { effort: 'max', label: 'synthesis', phase: 'Synthesis' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V3}/G0_TOPICS.md line by line: every claim, number, date, name, quote, hook line and implication, against the scouting files in ${V3}/scouting/ and with fresh WebSearch checks (load with ToolSearch if needed). Confirm each story's date really is recent. Flag framings that mislead even if every word is true. Fix problems in place with minimal wording changes that keep the punch. Under each topic add a line "Fact status: ...". Don't commit. Return at most 12 lines: what you changed and what is still uncertain.`,
  { effort: 'max', label: 'fact-check', phase: 'Fact-check' })

return { ranking, synthesis: synth, factcheck: fc }

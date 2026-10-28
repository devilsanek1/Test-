// HEAVY version (owner, 2026-10-28): the default early pipeline is lean (docs/PIPELINE_V2.md, the G0-G1 bullets; review
// docs/retro/2026-10-28_v4_early_stage_cost.md). Run this only when the owner asks for a wider search.
export const meta = {
  name: 'v4-g0-topics',
  description: 'v4 G0: 6 scouts (5 fresh beats + ideas-bank recheck), 3 judges, synthesis of top 3 topics, adversarial fact-check',
  phases: [
    { title: 'Scout', detail: '6 lanes, 3-4 candidates each, sourced' },
    { title: 'Judge', detail: 'growth, standards, creative' },
    { title: 'Synthesis', detail: 'top 3 topics to G0_TOPICS.md' },
    { title: 'Fact-check', detail: 'every claim against sources' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V4 = ROOT + '/docs/v4'
const BRIEF = ROOT + '/docs/CREATIVE_BRIEF.md'
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const IDEAS = ROOT + '/docs/IDEAS_BANK.md'
const CTX = `Context: today is 2026-10-27 (Tuesday). We make short vertical explainer videos (TikTok / Reels / Shorts, 1080x1920, 30-45 s) for the channel "What's All the Fuss About?" (Instagram what.the.fuss.is.about, Education). Promise: "You've heard about it. Now actually understand it." Style: hand-drawn ink, flat colour, small simple people living in dense, alive worlds, cinematic scale moments and cozy "sense of enclosure" framings. Past videos: v1 a PHP security bug that made European governments switch off their own websites (posted; it lost ~80 % of viewers by 3 s, so the hook must state a concrete, surprising, true payoff on frame 0; retention leaks most in the first 15 s; saves and shares were low, so give people a reason to send it); v2 Google DeepMind staff resigning over military AI contracts; v3 AI data centres outbidding consumers for memory chips, so laptops cost more. We are now picking the topic for VIDEO 4.
HARD EXCLUSIONS: (1) the topic must NOT have Anthropic (or its products, e.g. Claude) as a key entity; a passing mention in a wider story is acceptable only if the story stands without it; (2) no Google-military-AI or AI-memory-chip-price stories (v2/v3). Variety: v2 and v3 were both AI stories, so non-AI topics are welcome and get no penalty; an AI topic must be clearly different in kind.
The owner's taste so far (from their picks): the everyday wallet / everyday-life consequence wins over a bigger but more distant story; plain, direct, personal lines over clever ones; one real person in their own attributed words beats a plural headline.
The master brief is ${BRIEF} (read sections 1-10 and 18-19): start from a big question millions care about, find something genuinely new (ideally the past 24-72 h, i.e. 2026-10-24 to 2026-10-27; up to ~10 days if exceptional), keep asking "so what?" until a concrete consequence an ordinary person understands, never exaggerate, five tests: relevance, freshness, surprise, consequence, evidence. Nonpartisan, no manufactured villains.`

const SEARCH = `How: load WebSearch with ToolSearch ("select:WebSearch,WebFetch") if needed. Search for news from 2026-10-17 to 2026-10-27; don't rely on memory, because your training data is older than these events. Cross-check each candidate's core fact with 2+ reputable outlets or a primary source (study, filing, official statement). Never fetch bbc.co.uk (blocked). Record exact dates, numbers and URLs. Keep your session lean: a dozen or two searches, not hundreds.`

const SCOUTS = [
  { key: 'jobs_life', beat: 'jobs, work, careers, education and everyday life (first jobs, schools, housing, commuting, how normal people live and work this week); AI only if it is clearly not about Anthropic and not about chips' },
  { key: 'tech_internet', beat: 'tech, the internet, security and privacy, platforms and apps people use every day (outages, hacks, scams, policy changes, new laws affecting phones/apps)' },
  { key: 'science_health', beat: 'science, health, medicine, food, space and climate: new studies or discoveries with a consequence for ordinary people' },
  { key: 'money', beat: 'money, the economy, prices and consumer life (what costs more or less and why, hidden mechanisms behind everyday bills, groceries, travel, insurance, energy)' },
  { key: 'wildcard', beat: 'the thing everyone is talking about this week online, across any field, where the viral headline hides a more interesting true explanation (avoid partisan culture-war framing; nonpartisan only)' },
  { key: 'ideas_bank', beat: `the ideas bank: read ${IDEAS} and the research files it points to (under ${ROOT}/docs/). For each idea there, check with fresh searches whether it now has a NEW peg in the last ~7 days (a ruling, appeal, launch, deadline such as Türkiye age checks on 1 Nov, an incident report) and whether the facts still hold. Return the 3-4 strongest as candidates, updated with the new peg and current sources; drop any that are stale` },
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
    frame0_text: { type: 'string', description: 'max 7 words, on screen on frame 0, states the payoff' },
    hooks: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    twist: { type: 'string', description: 'the surprising detail that changes understanding' },
    real_person: { type: 'string', description: 'one real, named person in their own attributed words, if the story has one (else "none")' },
    share_reason: { type: 'string', description: 'why a viewer would send it to someone' },
    key_image: { type: 'string', description: 'one scale or cozy-enclosure image we could draw, in a dense alive world' },
    evidence: { type: 'string', description: 'how solid, what is disputed or uncertain' },
    risks: { type: 'string' },
  }, required: ['title','news','sources','big_question','so_what','thesis','frame0_text','hooks','twist','real_person','share_reason','key_image','evidence','risks'] } } },
  required: ['candidates'],
}

const SCORES = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, hook: { type: 'number' }, relevance: { type: 'number' }, freshness: { type: 'number' },
      surprise: { type: 'number' }, consequence: { type: 'number' }, evidence: { type: 'number' }, visual: { type: 'number' },
      shareability: { type: 'number' },
      best_hook: { type: 'string' }, note: { type: 'string', description: 'max 2 sentences' },
    }, required: ['id','hook','relevance','freshness','surprise','consequence','evidence','visual','shareability','best_hook','note'] } },
    top3: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'top3'],
}

const JUDGES = [
  { key: 'growth', lens: 'a short-form growth strategist: you judge whether a tired scroller stops in 2 s and stays to 15 s, and whether people comment, rewatch, save or send it to a friend' },
  { key: 'standards', lens: 'a standards editor plus a media lawyer: you judge whether the core fact is solid and fresh, whether the framing is fair and nonpartisan, and whether anything overclaims; you spot-check sources with WebSearch (load with ToolSearch)' },
  { key: 'creative', lens: 'a creative director for animated explainers in a hand-drawn ink, flat-colour style with small simple people in dense, alive worlds, cinematic scale and cozy enclosure: you judge story shape (one coherent story, not a list of facts), the understanding shift, and how well it can be shown in 30-45 s with every shot readable with the sound off' },
]

phase('Scout')
const scouted = await parallel(SCOUTS.map(s => () => agent(
  `${CTX}\n\nYou are a story scout for: ${s.beat}.\n\nTask: find 3-4 strong, genuinely different candidate stories for video 4 that pass the brief's five tests and the hard exclusions. Prefer stories where the obvious headline hides a more surprising true mechanism. ${SEARCH}\n\nAlso write them as readable markdown to ${V4}/scouting/${s.key}.md. Don't commit. Return the candidates.`,
  { effort: 'max', label: `scout:${s.key}`, phase: 'Scout', schema: CANDS })))

const cands = []
SCOUTS.forEach((s, i) => { const r = scouted[i]; if (!r) return; r.candidates.forEach(c => cands.push({ id: `T${cands.length + 1}`, beat: s.key, ...c })) })
log(`${cands.length} candidates from ${scouted.filter(Boolean).length} scouts`)

phase('Judge')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}.\n\nScore every candidate below 1-10 on: hook, relevance (broad audience cares), freshness, surprise, consequence (concrete for a normal person), evidence (solid, verifiable), visual (drawable, strong scale or cozy image), shareability (a reason to send it). Score 1 on everything for any candidate that breaks a hard exclusion. Be harsh and use the full range. Give each its best hook line (rewrite it if you can do better, truthfully). Pick your top 3.\n\nCandidates (JSON):\n${JSON.stringify(cands)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Judge', schema: SCORES })))

const agg = {}
cands.forEach(c => { agg[c.id] = { id: c.id, beat: c.beat, title: c.title, sum: 0, n: 0, ev: 0 } })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => {
  const g = agg[s.id]; if (!g) return
  g.sum += 2 * s.hook + s.relevance + s.freshness + s.surprise + 2 * s.consequence + 2 * s.evidence + s.visual + s.shareability
  g.ev += s.evidence; g.n++
}))
const r1 = x => Math.round(x * 10) / 10
const ranking = Object.values(agg).map(g => ({ id: g.id, beat: g.beat, title: g.title, score110: g.n ? r1(g.sum / g.n) : 0, evidence: g.n ? r1(g.ev / g.n) : 0 })).sort((a, b) => b.score110 - a.score110)
log(`top: ${ranking.slice(0, 3).map(r => `${r.id} ${r.score110}`).join(', ')}`)

phase('Synthesis')
const synth = await agent(
  `${CTX}\n\nYou are the head of editorial. 6 scouts proposed ${cands.length} candidates and 3 judges scored them. Read ${BRIEF} and in ${PLAYBOOK} "Hook and pacing", "Script and voice" and "Taste signals". The format model is ${ROOT}/docs/v3/archive/G0_TOPICS_options.md if it exists (else ${ROOT}/docs/v3/G0_TOPICS.md).\n\nRanking (weighted, out of 110; hook, consequence and evidence count double):\n${JSON.stringify(ranking)}\n\nJudge verdicts:\n${JSON.stringify(judged.filter(Boolean))}\n\nCandidates:\n${JSON.stringify(cands)}\n\nWrite the owner's decision doc to ${V4}/G0_TOPICS.md:\n1. "Pick one" (fits one phone screen, max 35 lines): 3 topics, each with a short name; what happened and when; the thesis sentence; frame-0 text; the hook line plus 2 alternates; the twist; why it should work (judge scores); the main risk. Then your recommendation in one line.\n2. Per topic: the so-what chain; the understanding shift (before / during / after, plus the tell-a-friend version); a rough 30-45 s beat outline as one coherent story (hook 0-3 s, stakes, explanation, twist, payoff; beats joined by but/so) with the key image per beat, including one scale moment and one cozy-enclosure moment; the real person and their attributed words if any; the facts with sources and dates; what's uncertain or disputed; fairness notes.\n3. The score table for all candidates and 3 runner-ups worth keeping for later videos.\nChoose 3 genuinely different topics (different beats where the scores allow; at least one not about AI). Never pick one whose average evidence score is below 7 or that breaks a hard exclusion. Everyday spoken language, no AI-sounding phrasing. Don't commit. Return at most 12 lines: the 3 topics with their hook lines and your recommendation.`,
  { effort: 'max', label: 'synthesis', phase: 'Synthesis' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V4}/G0_TOPICS.md line by line: every claim, number, date, name, quote, hook line and implication, against the scouting files in ${V4}/scouting/ and with fresh WebSearch checks (load with ToolSearch if needed). Confirm each story's date really is recent and that no topic has Anthropic as a key entity. Flag framings that mislead even if every word is true. Fix problems in place with minimal wording changes that keep the punch. Under each topic add a line "Fact status: ...". Don't commit. Return at most 12 lines: what you changed and what is still uncertain.`,
  { effort: 'max', label: 'fact-check', phase: 'Fact-check' })

return { ranking, synthesis: synth, factcheck: fc }

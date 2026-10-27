export const meta = {
  name: 'v4-g05-facts-and-core-line',
  description: 'v4 G0.5 (AI songs): 3 research lanes, fact lock, then the core line: 6 lever writers, 4 judges, viewer panel + sceptics, top 3, truth check',
  phases: [
    { title: 'Research', detail: 'mechanism, the fuss, real voices + guardrails' },
    { title: 'Fact lock', detail: 'one numbered fact file with safe wordings' },
    { title: 'Brainstorm', detail: '6 writers, one emotional lever each' },
    { title: 'Critique', detail: '4 judges score every line' },
    { title: 'Finalists', detail: 'viewer panel + 2 sceptics per finalist' },
    { title: 'Pick', detail: 'top 3 to CORE_LINE.md' },
    { title: 'Truth check', detail: 'adversarial check of the doc' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V4 = ROOT + '/docs/v4'
const TOPIC = V4 + '/G0_TOPICS.md'
const RES = V4 + '/research'
const FACTS = `${RES}/factlock.md`
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const BRIEF = ROOT + '/docs/CREATIVE_BRIEF.md'
const CTX = `Context: today is 2026-10-27. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), hand-drawn ink, flat colour. Our first video lost ~80 % of viewers by 3 s, so frame 0 must land a bold, true claim. Video 4's topic (picked by the owner at G0, locked in ${TOPIC}; read it first): AI-generated songs flooding streaming (Spotify pulled 50M+ likely-AI tracks from its recommendations this year, NBC 20 Oct 2026; on Deezer AI is over half of daily uploads but 1-3% of streams; NPR 27 Oct "Is 2026 the fakest year in music?"), and the mechanism that streaming pays artists from one shared pot, so fraudulent bot plays that slip past filters shrink every real artist's slice. The owner picked it because "there is good amount of fuss about AI songs", so the core line can lean into the wider fuss (what people are arguing about), not only the royalty mechanism, as long as the video can pay it off. Hard rule: Anthropic must not be a key entity. The owner's taste (playbook "Taste signals"): plain, direct and personal lines over clever ones; one real person in their own attributed words beats a plural headline; "you" framings must feel natural, never over the top.`

const RESEARCH = [
  { key: 'mechanism', title: 'how streaming money and AI songs actually work',
    brief: `Pin down the mechanism with primary sources: the pro-rata "one pot" payout (Spotify's own Loud & Clear / support pages; how the pot is split by stream share; the 1,000-streams-a-year minimum since 2024; Deezer's and others' artist-centric models); how AI tracks get made and uploaded (Suno, Udio, distributors like DistroKid), the scale (Deezer uploads, Spotify's 50M+ and its "AI Persona" badge and spam filter, Sony's takedown requests); bot streaming fraud (Deezer's fraud shares, Beatdapp estimates of the share of all streams that are fake and the money involved, the Michael Smith case: AI songs + bots, sentence 6 Oct 2026); what the platforms already do (demonetise detected fraud) and what gets through. Find any credible dollar or percentage estimate of how much real artists lose, with its caveats. Get Morgan Hayduk's (Beatdapp) full sentence from NBC 20 Oct 2026 verbatim.` },
  { key: 'fuss', title: 'the fuss: what people are arguing about right now',
    brief: `Map the public fuss around AI music in 2025-2026, newest first: the viral moments (AI "bands" like The Velvet Sundown, AI artists on Billboard charts such as Xania Monet / Breaking Rust, AI songs topping playlists, listeners discovering a favourite song is AI), the labels' lawsuits and then licensing deals with Suno and Udio, artist protests and statements, polls on whether listeners can tell or care, platform labelling debates, the NPR 27 Oct piece, anything in the last 7 days. For each: date, numbers, outlet + URL. Note the strongest "wait, seriously?" facts a normal person would react to, and the most common misconceptions people hold. Include the other side fairly (people who enjoy AI music, artists using AI as a tool).` },
  { key: 'voices', title: 'real voices and guardrails',
    brief: `(1) Find 3-6 real, named people with verifiable quotes in their own words: ideally a working, not-famous musician who lost money or found AI copies of themselves, plus well-known voices (e.g. James Blake on NPR 27 Oct 2026: "If you're an artist, remember that in 2026 there's not a single part of the system that isn't faked." — verify verbatim). Exact quote, date, outlet + URL, and whether we can quote it on screen. (2) Guardrails: fairness to Spotify, Deezer, Suno, Udio and AI-using artists (no villain; fraud is the problem, not every AI-assisted song); which phrasings overclaim ("AI is stealing your artist's money", "half of all music is AI", "Spotify is full of fakes"); depicting real artists and logos in cartoon commentary; platform reach (does music-industry content or AI talk get limited reach; using real song audio is a copyright risk, so we never play real songs). Give do / don't lists and safe phrasings for the strongest claims.` },
]

const LINE_RULES = `Rules for a core line:
- One sentence, max 12 words, ideally 4-8. Reads in under 1.5 s on a phone. Works spoken AND as big on-screen text.
- It must hit a gut emotion in a normal person (not an expert) and be TRUE and fair as a normal viewer would understand it, using the safe wordings in ${FACTS}. Never say or imply "half of all music is AI" (the half is Deezer's uploads), that Spotify deleted 50M songs (it pulled them from recommendations), that every AI song or every bot play takes money (detected fraud is removed from the pot), or a dollar loss nobody measured. No cartoon villain: the problem is fraud and the flood, not AI-assisted artists; the platforms are fighting it.
- Shorthand is fine if a reasonable viewer would not come away with a false belief.
- The 30-45 s video must be able to pay it off (explain it and land a satisfying "oh, now I get it").
- Everyday spoken American English; plain, direct, personal over clever; no AI-sounding phrasing; no clickbait the video can't back; nonpartisan.`

const LEVERS = [
  { key: 'unfair', lens: `UNFAIRNESS / LOSS: real musicians quietly lose money to songs nobody wrote and nobody listens to; who pays for the flood` },
  { key: 'curiosity', lens: `CURIOSITY / THE HIDDEN MECHANISM: the surprising way it works (one shared pot; fakes don't need fans, they need bots); an open loop the video closes` },
  { key: 'personal', lens: `PERSONAL / YOUR PLAYLIST: the viewer's own listening and subscription money; "the song you liked might not be human", "your monthly fee", natural, never over the top` },
  { key: 'reversal', lens: `REVERSAL / SCALE: the paradox in the numbers (over half of one app's new uploads, almost none of the listening; 50 million hidden), the expected thing then reality overtaking it` },
  { key: 'voice', lens: `ONE REAL VOICE: a line built on one real, named person's own words (verify against the fact file; attribute it), e.g. an artist or an anti-fraud expert` },
  { key: 'headline', lens: `HEADLINE PUNCH: a tabloid-strength but true headline, 3-7 words, that works in ALL CAPS on a cover and rides the existing fuss about AI songs` },
]

const SEED = [
  { line: "Almost nobody listens to AI songs. They still take money from your favourite artist.", frame0: "AI SONGS: NOBODY LISTENS, ARTISTS PAY", source: 'G0 doc' },
  { line: "Half of one app's new songs aren't human.", frame0: "HALF OF NEW SONGS AREN'T HUMAN", source: 'G0 doc' },
]

const LINES = {
  type: 'object',
  properties: { lines: { type: 'array', minItems: 6, maxItems: 8, items: { type: 'object', properties: {
    line: { type: 'string', description: 'the core sentence, max 12 words' },
    frame0: { type: 'string', description: 'its on-screen version, max 7 words (may be ALL CAPS)' },
    emotion: { type: 'string', description: 'the gut emotion it targets, and why a normal person feels it' },
    backing: { type: 'string', description: 'the factlock rows that make it true' },
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
  { key: 'standards', lens: `a standards editor at a news organisation together with a media lawyer: you judge whether a normal viewer would come away with a true belief, whether it is fair to the platforms, AI companies, AI-using artists and named people, and whether it is safe to publish; you use the safe wordings in the fact file and penalise overclaims hard, but accept fair shorthand` },
  { key: 'copy', lens: `a senior advertising copywriter and cover designer: you judge clarity at a glance, rhythm when spoken, how it looks as big frame-0 text and as a cover in ALL CAPS, and memorability` },
  { key: 'story', lens: `an explainer story editor: you judge whether a 30-45 s video can pay the line off with a satisfying "oh, now I get it", and whether the line is the true core of the story rather than a side detail` },
]

const PERSONAS = [
  { key: 'teen', who: `Maya, 17, lives on TikTok and Spotify, has a favourite small indie artist she found through a playlist` },
  { key: 'parent', who: `Rob, 44, pays for the family Spotify plan, listens to old rock in the car, doesn't follow tech news` },
  { key: 'worker', who: `Dev, 29, office worker, Spotify playlists all day at work, has heard endless AI hype, cynical about clickbait` },
  { key: 'musician', who: `Lena, 26, plays in a small band, has a few thousand monthly listeners, earns pocket money from streams` },
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
    severity: { type: 'string', enum: ['none', 'minor', 'major'], description: 'major = a reasonable viewer comes away with a false belief, or the claim is false or unfair' },
    problem: { type: 'string' },
    safer_wording: { type: 'string', description: 'the closest wording that keeps the punch and fixes the problem, or empty' },
  },
  required: ['severity', 'problem', 'safer_wording'],
}

phase('Research')
const research = await parallel(RESEARCH.map(r => () => agent(
  `${CTX}\n\nTask: research ${r.title}. ${r.brief}\n\nThe G0 topic doc ${TOPIC} and the scouting notes in ${V4}/scouting_r2/ (ai_frontier.md especially) are your starting point: read them and don't redo what is solid.\n\nHow: use WebSearch (load it with ToolSearch "select:WebSearch,WebFetch" if it isn't loaded). WebFetch is often blocked here, so cross-check with results from several outlets. Never fetch bbc.co.uk. Search for 2025-2026 events rather than relying on memory. Keep it lean: a few dozen searches at most.\n\nWrite the findings to ${RES}/${r.key}.md (max about 150 lines, grouped by topic). Every claim gets its date, numbers, outlet + URL, and a tag: VERIFIED (2+ reputable sources or a primary document), REPORTED (one reputable source) or UNCERTAIN. End with "Hook-worthy facts": the 5-8 most striking VERIFIED facts, one line each. Don't commit.\n\nReturn at most 10 lines: the hook-worthy facts, and anything that contradicts or weakens the G0 framing.`,
  { effort: 'max', label: `research:${r.key}`, phase: 'Research' })))
log(`research: ${RESEARCH.filter((r, i) => research[i]).map(r => r.key).join(', ') || 'none'} done`)

phase('Fact lock')
const lock = await agent(
  `${CTX}\n\nYou are the fact-lock editor. Read ${TOPIC}, ${RES}/mechanism.md, ${RES}/fuss.md and ${RES}/voices.md (skip any that is missing). Use WebSearch (load with ToolSearch) only to settle conflicts between them.\n\nWrite ${FACTS}, the single fact file every later step uses (max about 200 lines):\n- A header with the verdict legend: VERIFIED / REPORTED / UNCERTAIN / FALSE-as-worded.\n- Numbered sections and rows (FL 1.1, 1.2, ...) as tables: | # | Fact | Verdict | Number or exact quote | Date | Outlet + URL | Safe on-screen wording |. Sections: 1 the news peg (Spotify 50M+, AI Persona badge, NPR 27 Oct, anything newer); 2 the scale (Deezer uploads and streams, other platforms); 3 how payouts work (pro-rata pot, minimums, artist-centric models); 4 bot fraud (shares, money, the Smith case, what platforms remove); 5 the fuss (viral moments, charts, lawsuits and deals, polls); 6 real voices (exact quotes, attributable on screen); 7 the platforms' and AI companies' side (their statements verbatim); 8 what is NOT established (no measured per-artist loss, detection limits).\n- "Never say" list: the overclaims and false implications to avoid, each with the safe alternative.\n- "Platform reach" in 5 lines: what to avoid so the video isn't throttled.\nDon't commit. Return at most 8 lines: the 5 strongest safe facts for a hook and the 3 most important "never say" items.`,
  { effort: 'max', label: 'fact-lock', phase: 'Fact lock' })

phase('Brainstorm')
const written = await parallel(LEVERS.map(l => () => agent(
  `${CTX}\n\nYou are a writer whose lever is ${l.lens}.\n\nRead ${FACTS} first (and ${PLAYBOOK}, sections "Hook and pacing" and "Taste signals"). Then write 6-8 genuinely different candidate core lines that pull YOUR lever as hard as the truth allows (vary length, structure, person, with and without numbers or names).\n${LINE_RULES}\n\nDon't write files. Return the lines.`,
  { effort: 'max', label: `writer:${l.key}`, phase: 'Brainstorm', schema: LINES })))

const norm = s => s.toLowerCase().replace(/[^a-z0-9%$ ]/g, '').replace(/\s+/g, ' ').trim()
const seen = new Set()
const cands = []
const add = (c, source) => { const k = norm(c.line); if (seen.has(k)) return; seen.add(k); cands.push({ id: `L${cands.length + 1}`, source, ...c }) }
SEED.forEach(s => add({ line: s.line, frame0: s.frame0, emotion: '', backing: '', payoff: '' }, s.source))
LEVERS.forEach((l, i) => { const r = written[i]; if (r) r.lines.forEach(c => add(c, `lever:${l.key}`)) })
log(`${cands.length} unique candidate lines (incl. 2 G0 seeds)`)
const anon = cands.map(({ source, ...c }) => c)

phase('Critique')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}.\n\nRead ${FACTS} first. Score EVERY candidate line below from 1 to 10 on gut, truth, clarity, payoff and share. Be harsh and use the full range; the differences matter more than the absolute values. Judge the line exactly as written (you may suggest a fix). Then name your top 5.\n${LINE_RULES}\n\nCandidates (JSON):\n${JSON.stringify(anon)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Critique', schema: SCORES })))

const agg = {}
cands.forEach(c => { agg[c.id] = { gut: 0, truth: 0, clarity: 0, payoff: 0, share: 0, n: 0, fixes: [], notes: [] } })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => {
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
const finalists = eligible.slice(0, 7)
ranked.filter(c => c.source === 'G0 doc').forEach(o => { if (!finalists.find(f => f.id === o.id)) finalists.push(o) })
log(`finalists: ${finalists.map(f => `${f.id} ${f.score90}`).join(', ')}; ${ranked.length - eligible.length} lines dropped for truth < 6`)
const finAnon = finalists.map(f => ({ id: f.id, line: f.line, frame0: f.frame0 }))

phase('Finalists')
const [panel, sceptics] = await Promise.all([
  parallel(PERSONAS.map(p => () => agent(
    `You are ${p.who}. You're scrolling, half-paying attention. Each line below would be the big text on the first frame of a short video, and also the first thing the narrator says. React honestly in your own voice: would you stop scrolling, would you send it to someone, does it feel like clickbait or over the top? Rank them all (1 = the one that grabs you most). Don't research anything; just react.\n\nLines (JSON):\n${JSON.stringify(finAnon)}`,
    { effort: 'max', label: `viewer:${p.key}`, phase: 'Finalists', schema: PANEL }))),
  parallel(finalists.flatMap(f => [0, 1].map(k => () => agent(
    `${CTX}\n\nYou are sceptic #${k + 1}, ${k === 0 ? 'a hostile fact-checker at a news-standards watchdog' : "a lawyer for a streaming platform and an AI-music company looking for anything unfair, misleading or defamatory"}. Try to REFUTE this core line as false, misleading or unfair for a normal viewer who sees it on frame 0 of a short video: "${f.line}" (on-screen: "${f.frame0}"). Check it against ${FACTS}, and use WebSearch (load it with ToolSearch) if the fact file doesn't settle it. Consider: does it imply half of all music is AI, that Spotify deleted songs, that every AI song or bot play takes money, a measured dollar loss, that AI-assisted artists are frauds, or anything else a viewer would wrongly believe. Rate the severity honestly (don't invent problems; minor = fixable nuance), and give the closest safer wording that keeps the punch.`,
    { effort: 'max', label: `sceptic:${f.id}:${k + 1}`, phase: 'Finalists', schema: VERDICT }).then(v => v && { id: f.id, ...v })))),
])

phase('Pick')
const synth = await agent(
  `${CTX}\n\nYou are the editor-in-chief making the G0.5 recommendation. Read ${FACTS}.\n\nRanked candidates (weighted score out of 90: gut x3, truth x2, clarity x2, payoff, share; judges' fixes and notes included):\n${JSON.stringify(ranked)}\n\nJudge top-5 lists:\n${JSON.stringify(judged.filter(Boolean).map((j, i) => ({ judge: JUDGES[i] && JUDGES[i].key, top5: j.top5 })))}\n\nViewer panel (personas: ${PERSONAS.map(p => p.who).join(' | ')}):\n${JSON.stringify(panel.filter(Boolean))}\n\nSceptics' verdicts on the finalists:\n${JSON.stringify(sceptics.filter(Boolean))}\n\nWrite ${V4}/CORE_LINE.md:\n1. "Pick one" (fits one phone screen, max 30 lines): the top 3 core lines. For each: the line; its frame-0 / cover version (max 7 words, say if ALL CAPS); the spoken hook seed (how the narrator says it in the first 2 s); the angle it implies (what the video is really about); the emotion it hits; why (scores, viewer reactions, in a few words); the sceptics' verdict and any wording fix applied; the main risk. Then a one-line recommendation. Make the 3 genuinely different (different levers) unless the evidence clearly says otherwise. Say where the G0 doc's two seed lines landed and why.\n2. Per pick: the payoff callback (how the last line echoes it), what the script must prove for it to land (which FL rows, in what order), where the platforms' side sits, a first-second phone sound idea (playbook: a positive phone sound in the first second, e.g. a streaming 'new release' ping or a like pop; our own sounds, never real songs), and a suggested palette from ${ROOT}/docs/look/PALETTE.md.\n3. The full score table (id, line, source lever, gut, truth, clarity, payoff, share, score), the viewer panel's top picks, and 5 runner-up lines worth keeping for the cover, the caption or the pinned comment.\nApply sceptics' safer wordings where a verdict was major; consider them where minor. ${LINE_RULES}\nDon't commit. Return at most 10 lines: the 3 lines and your recommendation.`,
  { effort: 'max', label: 'editor-in-chief', phase: 'Pick' })

phase('Truth check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V4}/CORE_LINE.md: every core line, frame-0 text, hook seed, payoff callback and claim, against ${FACTS} (and WebSearch, loaded with ToolSearch, if something goes beyond it). A line fails if a normal viewer would come away believing something false or unfair. Quotes must be verbatim. Fix in place with minimal wording changes that keep the punch, and add "Truth status: ..." under each of the 3 picks. Don't commit. Return at most 8 lines: what you changed.`,
  { effort: 'max', label: 'truth-check', phase: 'Truth check' })

return {
  research: research.filter(Boolean),
  factlock: lock,
  top: ranked.slice(0, 12).map(c => ({ id: c.id, source: c.source, line: c.line, frame0: c.frame0, score90: c.score90, gut: c.gut, truth: c.truth })),
  seeds: ranked.filter(c => c.source === 'G0 doc').map(o => ({ id: o.id, line: o.line, score90: o.score90, rank: ranked.indexOf(o) + 1, of: ranked.length })),
  sceptics: sceptics.filter(Boolean).map(v => ({ id: v.id, severity: v.severity })),
  synthesis: synth,
  truthcheck: fc,
}

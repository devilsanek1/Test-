export const meta = {
  name: 'v2-g0-facts-and-core-line',
  description: 'v2 G0/G0.5: finish research (industry, guardrails), lock the facts, then distil the core line: 6 lever writers, 4 judges, viewer panel + sceptics, top 3, truth check',
  phases: [
    { title: 'Research', detail: 'industry pattern + guardrails (timeline already done)' },
    { title: 'Fact lock', detail: 'one numbered fact file with safe wordings' },
    { title: 'Brainstorm', detail: '6 writers, one emotional lever each' },
    { title: 'Critique', detail: '4 judges score every line' },
    { title: 'Finalists', detail: 'viewer panel + 2 sceptics per finalist' },
    { title: 'Pick', detail: 'top 3 to CORE_LINE.md' },
    { title: 'Truth check', detail: 'adversarial check of the doc' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V2 = ROOT + '/docs/v2'
const SRC = V2 + '/source_bbc_2026-10-21.md'
const RES = V2 + '/research'
const FACTS = `${RES}/factlock.md`
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const CTX = `Context: today is 2026-10-26. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), hand-drawn ink, flat colour. Our first video lost ~80 % of viewers by 3 s, so frame 0 must land a bold, true claim. Video 2's topic (picked by the owner): the BBC report of 21 Oct 2026 that Google DeepMind staff are resigning over Google's AI contracts with the US military, and that staff say they are scared to speak out (full text: ${SRC}; bbc.co.uk is blocked, never fetch it). The owner's direction: "make it into something bigger: ENGINEERS ARE RESIGNING AND AFRAID kind of vibe", a hook more powerful than "Engineers are leaving Google!", but every claim true and defensible, and Google's response represented. The owner's taste (playbook "Taste signals"): plain, direct and personal lines over clever ones; "you" framings must feel natural, never over the top.`

const RESEARCH = [
  { key: 'industry', title: 'the industry-wide shift and the "afraid to speak" pattern',
    brief: `Show whether this is one company or an industry-wide shift, and the pattern of tech workers being afraid to speak. Apply the same standard to every company. Cover: OpenAI dropping its ban on "military and warfare" use (Jan 2024) and its later defence deals (Anduril, Dec 2024; Pentagon contracts 2025-2026); Anthropic + Palantir + AWS (Nov 2024) and Anthropic's 2026 dispute with the Pentagon over "all lawful purposes" terms; Meta opening Llama to US national-security use (Nov 2024); Microsoft and Amazon worker protests and firings over Israel-related contracts (2024-2025); the 2026 contracts the BBC lists (OpenAI, Amazon, Microsoft, SpaceX, Oracle, Nvidia, Reflection) and what they allow; Palantir's Maven Smart System (what it does, scale); the human-oversight / decision-time concern (e.g. Sarah Shoker; per-target review-time figures only if sourced); the speaking-out pattern: OpenAI's 2024 non-disparagement / equity clawback story, the June 2024 "Right to Warn" letter (who signed, incl. DeepMind staff), whistleblower-protection proposals 2024-2026, other AI-lab resignations over safety or ethics (names, dates). Collect striking numbers that could anchor a hook, each with a source.` },
  { key: 'guardrails', title: 'fairness, legal, tone and platform-reach guardrails',
    brief: `Work out what we can say, and how, without being unfair, defamatory, misleading, or throttled by the platforms. Cover: (1) fairness: Google's response must be represented (quote it exactly from the source); what Google's contract allows and forbids; what is NOT claimed anywhere (no source puts Google's AI in target selection; Maven is Palantir's); which phrasings overclaim ("mass exodus", "Google builds killer robots", "engineers are banned from speaking") vs what people actually said; (2) legal: quoting named people accurately; lifetime non-disparagement clauses (how common; UK and US law on them and on whistleblowing, e.g. UK rules on NDAs, the US NLRB McLaren Macomb 2023 ruling); depicting real people and logos in cartoon form in commentary; crediting the BBC on screen; (3) disputed claims (the Naza documentary vs the Israeli minister's rebuttal; Lavender reporting vs IDF denials): whether to mention or avoid them; (4) platform reach: how Instagram / Threads treat "political content" in recommendations (the 2024 policy and any later changes), TikTok and YouTube policies for war, violence and news content, which images or words trigger limited reach or age gates, and whether this topic is likely classed as political; (5) tone: a war-related topic, what to avoid and how a cartoon style stays respectful. Give concrete do / don't lists and "safe phrasings" for the strongest claims.` },
]

const LINE_RULES = `Rules for a core line:
- One sentence, max 12 words, ideally 4-8. Reads in under 1.5 s on a phone. Works spoken AND as big on-screen text.
- It must hit a gut emotion in a normal person (not an expert) and be TRUE and fair as a normal viewer would understand it, using the safe wordings in ${FACTS}. Never imply a mass exodus or a count nobody has ("several" staff per the BBC; the 600+ signed a letter, they did not quit). "Afraid" / "scared to speak" must rest on what staff actually said. Never imply Google's AI picks targets or kills anyone (no source says so). No cartoon villain; Google's side exists.
- Shorthand is fine if a reasonable viewer would not come away with a false belief.
- The 30-45 s video must be able to pay it off (explain it and land a satisfying "oh, now I get it").
- Everyday spoken American English; plain, direct, personal over clever; no AI-sounding phrasing; no clickbait the video can't back; nonpartisan.`

const LEVERS = [
  { key: 'fear', lens: `FEAR / SILENCE: the people inside are scared to speak; what does it mean when the engineers building it are afraid to talk` },
  { key: 'conscience', lens: `CONSCIENCE / SACRIFICE: people walking away from dream jobs at the top AI lab rather than build this; shame, principle` },
  { key: 'promise', lens: `BROKEN PROMISE / REVERSAL: something everyone took for granted flipped (Google once promised not to build AI for weapons, then deleted the promise; staff asked it not to sign and it signed within a day)` },
  { key: 'stakes', lens: `STAKES / WHY A NORMAL PERSON CARES: AI in military decisions, who controls it, how fast it moves compared to a human checking it; true and careful` },
  { key: 'curiosity', lens: `CURIOSITY / THE HIDDEN REASON: what is actually in the deal or behind the resignations that a viewer would not guess; an open loop the video closes` },
  { key: 'headline', lens: `HEADLINE PUNCH: a tabloid-strength but true headline, 3-7 words, that works in ALL CAPS on a cover, in the spirit of the owner's "ENGINEERS ARE RESIGNING AND AFRAID"` },
]

const SEED = [
  { line: 'Engineers are leaving Google!', frame0: 'ENGINEERS ARE LEAVING GOOGLE', source: 'owner' },
  { line: 'Engineers are resigning, and they are afraid.', frame0: 'ENGINEERS ARE RESIGNING AND AFRAID', source: 'owner' },
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
  { key: 'standards', lens: `a standards editor at a news organisation together with a media lawyer: you judge whether a normal viewer would come away with a true belief, whether it is fair to Google and to the named people, and whether it is safe to publish; you use the safe wordings in the fact file and penalise overclaims hard, but accept fair shorthand` },
  { key: 'copy', lens: `a senior advertising copywriter and cover designer: you judge clarity at a glance, rhythm when spoken, how it looks as big frame-0 text and as a cover in ALL CAPS, and memorability` },
  { key: 'story', lens: `an explainer story editor: you judge whether a 30-45 s video can pay the line off with a satisfying "oh, now I get it", and whether the line is the true core of the story rather than a side detail` },
]

const PERSONAS = [
  { key: 'teen', who: `Jayden, 17, scrolls TikTok for hours, wants to study computer science, thinks working at Google would be the dream` },
  { key: 'parent', who: `Maria, 41, two kids, watches Reels in the evening, doesn't follow tech news, uneasy about war in the news` },
  { key: 'worker', who: `Dev, 29, works in an office, has heard endless AI hype, scrolls Shorts at lunch, cynical about clickbait` },
  { key: 'engineer', who: `Sam, 24, junior software engineer at a mid-size company, follows AI news, has friends at big tech companies` },
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
  `${CTX}\n\nTask: research ${r.title}. ${r.brief}\n\nThe 2018-2026 Google timeline is already done in ${RES}/timeline.md: read it first and don't redo it.\n\nHow: use WebSearch (load it with ToolSearch "select:WebSearch,WebFetch" if it isn't loaded). WebFetch is often blocked here, so cross-check with results from several outlets. Never fetch bbc.co.uk. Search for 2025-2026 events rather than relying on memory.\n\nWrite the findings to ${RES}/${r.key}.md (max about 150 lines, grouped by topic). Every claim gets its date, numbers, outlet + URL, and a tag: VERIFIED (2+ reputable sources or a primary document), REPORTED (one reputable source) or UNCERTAIN. End with "Hook-worthy facts": the 5-8 most striking VERIFIED facts, one line each. Don't commit.\n\nReturn at most 10 lines: the hook-worthy facts, and anything that contradicts or weakens the BBC framing.`,
  { label: `research:${r.key}`, phase: 'Research' })))
log(`research: ${RESEARCH.filter((r, i) => research[i]).map(r => r.key).join(', ') || 'none'} done`)

phase('Fact lock')
const lock = await agent(
  `${CTX}\n\nYou are the fact-lock editor. Read ${SRC}, ${RES}/timeline.md, ${RES}/industry.md and ${RES}/guardrails.md (skip any that is missing). Use WebSearch (load with ToolSearch) only to settle conflicts between them.\n\nWrite ${FACTS}, the single fact file every later step uses (max about 200 lines):\n- A header with the verdict legend: VERIFIED / REPORTED / UNCERTAIN / FALSE-as-worded.\n- Numbered sections and rows (FL 1.1, 1.2, ...) as tables: | # | Fact | Verdict | Number or exact quote | Date | Outlet + URL | Safe on-screen wording |. Sections: 1 the BBC story itself (who resigned, exact quotes, what "several" means); 2 the deal (what it allows: "any lawful government purpose"; the oversight clause; no veto; dates; the 600+ letter and how fast Google signed); 3 history (2018 Maven, the 2018 pledge and its 2025 removal, Nimbus); 4 the industry pattern (who else signed, Anthropic's refusal); 5 fear and speaking out (Liguori's lifetime-criticism quote, anonymous staff, what is legally true about such clauses, the counter-evidence that others spoke publicly); 6 Google's side (its statements verbatim); 7 AI in war decisions (Maven, Shoker's quote; what is NOT established).\n- "Never say" list: the overclaims and false implications to avoid, each with the safe alternative.\n- "Platform reach" in 5 lines: what to avoid so the video isn't throttled.\nDon't commit. Return at most 8 lines: the 5 strongest safe facts for a hook and the 3 most important "never say" items.`,
  { label: 'fact-lock', phase: 'Fact lock' })

phase('Brainstorm')
const written = await parallel(LEVERS.map(l => () => agent(
  `${CTX}\n\nYou are a writer whose lever is ${l.lens}.\n\nRead ${FACTS} first (and ${PLAYBOOK}, sections "Hook and pacing" and "Taste signals"). Then write 6-8 genuinely different candidate core lines that pull YOUR lever as hard as the truth allows (vary length, structure, person, with and without numbers or names).\n${LINE_RULES}\n\nDon't write files. Return the lines.`,
  { label: `writer:${l.key}`, phase: 'Brainstorm', schema: LINES })))

const norm = s => s.toLowerCase().replace(/[^a-z0-9%$ ]/g, '').replace(/\s+/g, ' ').trim()
const seen = new Set()
const cands = []
const add = (c, source) => { const k = norm(c.line); if (seen.has(k)) return; seen.add(k); cands.push({ id: `L${cands.length + 1}`, source, ...c }) }
SEED.forEach(s => add({ line: s.line, frame0: s.frame0, emotion: '', backing: '', payoff: '' }, s.source))
LEVERS.forEach((l, i) => { const r = written[i]; if (r) r.lines.forEach(c => add(c, `lever:${l.key}`)) })
log(`${cands.length} unique candidate lines (incl. the owner's 2)`)
const anon = cands.map(({ source, ...c }) => c)

phase('Critique')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}.\n\nRead ${FACTS} first. Score EVERY candidate line below from 1 to 10 on gut, truth, clarity, payoff and share. Be harsh and use the full range; the differences matter more than the absolute values. Judge the line exactly as written (you may suggest a fix). Then name your top 5.\n${LINE_RULES}\n\nCandidates (JSON):\n${JSON.stringify(anon)}`,
  { label: `judge:${j.key}`, phase: 'Critique', schema: SCORES })))

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
const finalists = eligible.slice(0, 8)
ranked.filter(c => c.source === 'owner').forEach(o => { if (!finalists.find(f => f.id === o.id)) finalists.push(o) })
log(`finalists: ${finalists.map(f => `${f.id} ${f.score90}`).join(', ')}; ${ranked.length - eligible.length} lines dropped for truth < 6`)
const finAnon = finalists.map(f => ({ id: f.id, line: f.line, frame0: f.frame0 }))

phase('Finalists')
const [panel, sceptics] = await Promise.all([
  parallel(PERSONAS.map(p => () => agent(
    `You are ${p.who}. You're scrolling, half-paying attention. Each line below would be the big text on the first frame of a short video, and also the first thing the narrator says. React honestly in your own voice: would you stop scrolling, would you send it to someone, does it feel like clickbait or over the top? Rank them all (1 = the one that grabs you most). Don't research anything; just react.\n\nLines (JSON):\n${JSON.stringify(finAnon)}`,
    { label: `viewer:${p.key}`, phase: 'Finalists', schema: PANEL }))),
  parallel(finalists.flatMap(f => [0, 1].map(k => () => agent(
    `${CTX}\n\nYou are sceptic #${k + 1}, ${k === 0 ? 'a hostile fact-checker at a news-standards watchdog' : "a lawyer for Google's communications team looking for anything unfair or defamatory"}. Try to REFUTE this core line as false, misleading or unfair for a normal viewer who sees it on frame 0 of a short video: "${f.line}" (on-screen: "${f.frame0}"). Check it against ${FACTS}, and use WebSearch (load it with ToolSearch) if the fact file doesn't settle it. Consider: does it imply a mass exodus, that Google's AI kills or picks targets, that a law bans staff from speaking, or anything else a viewer would wrongly believe. Rate the severity honestly (don't invent problems; minor = fixable nuance), and give the closest safer wording that keeps the punch.`,
    { label: `sceptic:${f.id}:${k + 1}`, phase: 'Finalists', schema: VERDICT }).then(v => v && { id: f.id, ...v })))),
])

phase('Pick')
const synth = await agent(
  `${CTX}\n\nYou are the editor-in-chief making the G0.5 recommendation. Read ${FACTS}.\n\nRanked candidates (weighted score out of 90: gut x3, truth x2, clarity x2, payoff, share; judges' fixes and notes included):\n${JSON.stringify(ranked)}\n\nJudge top-5 lists:\n${JSON.stringify(judged.filter(Boolean).map((j, i) => ({ judge: JUDGES[i] && JUDGES[i].key, top5: j.top5 })))}\n\nViewer panel (personas: ${PERSONAS.map(p => p.who).join(' | ')}):\n${JSON.stringify(panel.filter(Boolean))}\n\nSceptics' verdicts on the finalists:\n${JSON.stringify(sceptics.filter(Boolean))}\n\nWrite ${V2}/CORE_LINE.md:\n1. "Pick one" (fits one phone screen, max 30 lines): the top 3 core lines. For each: the line; its frame-0 / cover version (max 7 words, say if ALL CAPS); the spoken hook seed (how the narrator says it in the first 2 s); the angle it implies (what the video is really about); the emotion it hits; why (scores, viewer reactions, in a few words); the sceptics' verdict and any wording fix applied; the main risk. Then a one-line recommendation. Make the 3 genuinely different (different levers) unless the evidence clearly says otherwise. Always say where the owner's own lines ("Engineers are leaving Google!", "Engineers are resigning and afraid") landed and why; if one is the best, say so plainly.\n2. Per pick: the payoff callback (how the last line echoes it), what the script must prove for it to land (which FL rows, in what order), where Google's response sits, a first-second phone sound idea (playbook: a positive phone sound in the first second; for this serious story it may be ironic, e.g. a message ding on a resignation email, never cheerful about war), and a suggested palette from ${ROOT}/docs/look/PALETTE.md.\n3. The full score table (id, line, source lever, gut, truth, clarity, payoff, share, score), the viewer panel's top picks, and 5 runner-up lines worth keeping for the cover, the caption or the pinned comment.\nApply sceptics' safer wordings where a verdict was major; consider them where minor. ${LINE_RULES}\nDon't commit. Return at most 10 lines: the 3 lines and your recommendation.`,
  { label: 'editor-in-chief', phase: 'Pick' })

phase('Truth check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V2}/CORE_LINE.md: every core line, frame-0 text, hook seed, payoff callback and claim, against ${FACTS} (and WebSearch, loaded with ToolSearch, if something goes beyond it). A line fails if a normal viewer would come away believing something false or unfair. Quotes must be verbatim. Fix in place with minimal wording changes that keep the punch, and add "Truth status: ..." under each of the 3 picks. Don't commit. Return at most 8 lines: what you changed.`,
  { label: 'truth-check', phase: 'Truth check' })

return {
  research: research.filter(Boolean),
  factlock: lock,
  top: ranked.slice(0, 12).map(c => ({ id: c.id, source: c.source, line: c.line, frame0: c.frame0, score90: c.score90, gut: c.gut, truth: c.truth })),
  owner: ranked.filter(c => c.source === 'owner').map(o => ({ id: o.id, line: o.line, score90: o.score90, rank: ranked.indexOf(o) + 1, of: ranked.length })),
  sceptics: sceptics.filter(Boolean).map(v => ({ id: v.id, severity: v.severity })),
  synthesis: synth,
  truthcheck: fc,
}

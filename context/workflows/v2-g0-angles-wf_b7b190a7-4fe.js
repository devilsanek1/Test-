export const meta = {
  name: 'v2-g0-angles',
  description: 'v2 G0: research the Google military-AI resignations story, 5 writers brainstorm angles, 3 judges score, synthesize and fact-check the top 3',
  phases: [
    { title: 'Research', detail: 'timeline 2018-2026, industry pattern, guardrails and reach' },
    { title: 'Brainstorm', detail: '5 writers with different lenses, 2 angles each' },
    { title: 'Judge', detail: '3 judges with different lenses score every angle' },
    { title: 'Synthesis', detail: 'top 3 angles written to G0_ANGLES.md' },
    { title: 'Fact-check', detail: 'adversarial check of every claim in the doc' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V2 = ROOT + '/docs/v2'
const SRC = V2 + '/source_bbc_2026-10-21.md'
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const CTX = `Context: today is 2026-10-25. We make short vertical explainer videos (TikTok / Reels / Shorts, 1080x1920) for the account "what.the.fuss.is.about" (tech news explained, Education category). Video 1 was about a PHP security bug, drawn in a hand-drawn ink, flat-colour style with a mascot (Pip, a purple elephant); it lost about 80 % of viewers by 3 s because the opening was calm. Video 2's topic: the BBC report of 21 Oct 2026 that Google DeepMind staff are resigning over Google's AI contracts with the US military, and that staff say they are scared to speak out. The primary source is the full article text at ${SRC} (bbc.co.uk is blocked from this container; never try to fetch it). The owner wants the bigger story, with "ENGINEERS ARE RESIGNING AND AFRAID" energy, stronger than "Engineers are leaving Google!", but every claim must be true and defensible.`

const RESEARCH = [
  { key: 'timeline', title: 'Google and military AI, 2018 to October 2026',
    brief: `Build the verified timeline of Google / Google DeepMind and military AI from 2018 to October 2026. Cover at least: the 2018 Project Maven protest (how many signed, how many resigned, the non-renewal); the June 2018 AI Principles and their weapons / surveillance pledge (exact wording); the reported removal of that pledge in early 2025 (date, outlets, Google's explanation); the Project Nimbus protests and firings in 2024 (numbers, dates); DeepMind staff letters or union efforts over military work (2024-2026); Google's 2025-2026 Pentagon work (e.g. GenAI.mil / Gemini for Government, the 2026 classified-environment contracts in the BBC piece, the "any lawful government purpose" wording); Hegseth's "AI-first" push; anything public from or about Sofia Liguori and Andreas Kirsch (posts, statements) and any other named leavers; any follow-up coverage of the BBC story since 21 Oct 2026 (other outlets, Google statements, counts of resignations).` },
  { key: 'industry', title: 'the industry-wide shift and the "afraid to speak" pattern',
    brief: `Show whether this is one company or an industry-wide shift, and the pattern of tech workers being afraid to speak. Apply the same standard to every company. Cover: OpenAI dropping its ban on "military and warfare" use (Jan 2024) and its later defence deals (Anduril, Dec 2024; Pentagon contracts 2025-2026); Anthropic + Palantir + AWS (Nov 2024) and any 2025-2026 Anthropic-Pentagon developments; Meta opening Llama to US national-security use (Nov 2024); Microsoft and Amazon worker protests and firings over Israel-related contracts (2024-2025); the 2026 contracts the BBC lists (OpenAI, Amazon, Microsoft, SpaceX, Oracle, Nvidia, Reflection) and what they allow; Palantir's Maven Smart System (what it does, scale, users); AI targeting reporting (e.g. +972 Magazine on Lavender / Gospel, the Naza documentary) together with the official rebuttals; the human-oversight / decision-time concern (e.g. Sarah Shoker; per-target review-time figures only if sourced); the speaking-out pattern: OpenAI's 2024 non-disparagement / equity clawback story, the June 2024 "Right to Warn" letter (who signed, including DeepMind staff), whistleblower-protection proposals 2024-2026, other AI-lab resignations over safety or ethics (names, dates). Collect striking numbers that could anchor a hook (contract values, staff counts, speed claims), each with a source.` },
  { key: 'guardrails', title: 'fairness, legal, tone and platform-reach guardrails',
    brief: `Work out what we can say, and how, without being unfair, defamatory, misleading, or throttled by the platforms. Cover: (1) fairness: Google's response must be represented; what Google's contract allows and forbids (quote the source exactly); what is NOT claimed anywhere (e.g. no source says Google's AI selects targets; Maven is Palantir's); which phrasings overclaim ("mass exodus", "Google builds killer robots", "engineers are banned from speaking") versus what the people actually said; (2) legal: quoting named people accurately; lifetime non-disparagement clauses (how common, UK and US law on them and on whistleblowing, e.g. UK rules on NDAs, the US NLRB McLaren Macomb 2023 ruling); depicting real people and company logos in cartoon form in commentary; crediting the BBC on screen; (3) disputed claims: the Naza documentary vs the Israeli minister's rebuttal, Lavender reporting vs IDF denials, and whether to mention or avoid them; (4) platform reach: how Instagram / Threads treat "political content" in recommendations (the 2024 policy and any later changes), TikTok and YouTube policies for war, violence, sensitive and news content, which images or words trigger limited reach or age gates, and whether this topic is likely classed as political; (5) tone: a war-related topic with real casualties, what to avoid (jokes about deaths, gore, taking sides) and how a cartoon style can stay respectful. Give concrete do / don't lists for script and visuals, and "safe phrasings" for the strongest claims.` },
]

const WRITERS = [
  { key: 'retention', lens: 'a retention editor for TikTok / Reels: you live in the first 3 seconds, open loops, pattern interrupts, curiosity gaps, a re-hook every 5-8 s, and endings that loop or demand a comment' },
  { key: 'story', lens: 'a documentary storyteller: you find the human character and the arc (an engineer who joined a company that once promised never to build AI for weapons, and leaves when that changes), with a turn and a quiet, chilling ending' },
  { key: 'sceptic', lens: 'a sceptical investigative journalist: you only accept framings that survive a hostile fact-check, you hunt for what is genuinely NEW here, and you find the strongest hook that needs no exaggeration' },
  { key: 'teen', lens: 'someone explaining this to a smart 16-year-old who has never heard of DeepMind or the Pentagon contracts: why should a normal person care, in plain words, with one concrete image that makes it click' },
  { key: 'scroller', lens: 'an ordinary scroller and part-time comedian: you know what makes people stop, feel something, comment and send it to a friend; you use relatable everyday comparisons (imagine your contract said you can never criticise your boss, for life), but never joke about war or deaths' },
]

const JUDGES = [
  { key: 'growth', lens: 'a short-form growth strategist: you judge the first 2 seconds and retention through the middle the way the algorithm and a tired scroller would. Our last video lost 80 % of viewers by 3 s, so the hook is everything.' },
  { key: 'standards', lens: 'a standards editor at a news organisation together with a media lawyer: you judge whether every claim and implication is true, fair to Google and to the named people, and safe to publish; you read the research files and penalise overclaims hard.' },
  { key: 'creative', lens: 'a creative director for animated explainers: you judge story shape, emotional pull, how well it can be shown in a hand-drawn ink, flat-colour style in 30-45 s, and whether it would earn comments, rewatches and shares.' },
]

const RULES = `Rules:
- 30-45 s, about 85-115 spoken words.
- Frame 0 states the payoff in words: a bold, true claim on screen from the very first frame, starting mid-action. No calm intro.
- The hook is a concrete, surprising claim with stakes (names, numbers, a curiosity gap). Do better than "Engineers are leaving Google!": the owner wants "engineers are resigning and afraid to speak" energy.
- Every fact comes from the BBC source or a research line marked VERIFIED or REPORTED; cite which. No overclaims (see guardrails.md), e.g. the BBC says "several" staff, not a mass exodus.
- Google's response appears fairly, in a line or on screen.
- Everyday spoken language, like a person talking to a friend. No AI-sounding phrasing ("delve", "in a world where", "here's the thing", rhetorical triplets).
- End close to the payoff, with a last line that makes people comment or rewatch. No "follow for more".
- Visuals are drawn in our hand-drawn ink, flat-colour style (we can draw anything: offices, badges, contracts, drones, a ticking clock). Name the key image per beat. No gore, no real war footage.
- Sound: the owner wants a sound people link with their phone (a notification ding, a like pop, a message whoosh) in the first second. Say which one and how it fits the hook; it can be ironic for a serious story (e.g. a message ding on a resignation email), never cheerful about war.
- The 2 angles must be genuinely different (a different hook, structure or emotional core), not variants of one idea.`

const ANGLES = {
  type: 'object',
  properties: {
    angles: { type: 'array', minItems: 2, maxItems: 2, items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        logline: { type: 'string', description: 'one sentence: the story and the takeaway' },
        frame0_text: { type: 'string', description: 'on-screen text on the very first frame, max 7 words' },
        hooks: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' }, description: '3 alternative spoken first lines (first 2-3 s)' },
        visual_hook: { type: 'string', description: 'what the viewer sees in the first 2 s' },
        hook_sound: { type: 'string', description: 'the phone-like sound in the first second and why it fits' },
        beats: { type: 'array', items: { type: 'object', properties: { t: { type: 'string' }, vo: { type: 'string' }, visual: { type: 'string' } }, required: ['t', 'vo', 'visual'] } },
        vo_draft: { type: 'string', description: 'the full voice-over draft, 85-115 words' },
        ending: { type: 'string', description: 'the last line, and why viewers comment, rewatch or share' },
        facts: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, source: { type: 'string' } }, required: ['claim', 'source'] } },
        risks: { type: 'string' },
      },
      required: ['title', 'logline', 'frame0_text', 'hooks', 'visual_hook', 'hook_sound', 'beats', 'vo_draft', 'ending', 'facts', 'risks'],
    } },
  },
  required: ['angles'],
}

const SCORES = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      hook: { type: 'number' }, truth: { type: 'number' }, stakes: { type: 'number' },
      freshness: { type: 'number' }, fit: { type: 'number' }, share: { type: 'number' },
      best_hook: { type: 'string', description: 'the best hook line for this angle; rewrite it if you can do better, truthfully' },
      note: { type: 'string', description: 'max 2 sentences' },
    }, required: ['id', 'hook', 'truth', 'stakes', 'freshness', 'fit', 'share', 'best_hook', 'note'] } },
    top3: { type: 'array', items: { type: 'string' } },
    grafts: { type: 'array', items: { type: 'string' }, description: 'specific ideas from other angles that would make the winners stronger' },
    favourite_hooks: { type: 'array', items: { type: 'string' }, description: 'your 3 favourite hook lines across all angles, improved if you can' },
  },
  required: ['scores', 'top3', 'grafts', 'favourite_hooks'],
}

phase('Research')
const research = await parallel(RESEARCH.map(r => () => agent(
  `${CTX}\n\nTask: research ${r.title}. ${r.brief}\n\nHow: use WebSearch (load it with ToolSearch "select:WebSearch,WebFetch" if it isn't loaded). WebFetch may be blocked for some sites, so cross-check with results from several outlets. Never fetch bbc.co.uk. Today is 2026-10-25: search for 2025-2026 events rather than relying on memory.\n\nWrite the findings to ${V2}/research/${r.key}.md (max about 150 lines, grouped by topic). Every claim gets its date, numbers, outlet + URL, and a confidence tag: VERIFIED (2+ reputable sources or a primary document), REPORTED (one reputable source) or UNCERTAIN. End the file with "Hook-worthy facts": the 5-8 most striking VERIFIED facts, one line each. Don't commit.\n\nReturn at most 12 lines: the hook-worthy facts, and anything that contradicts or weakens the BBC framing.`,
  { label: `research:${r.key}`, phase: 'Research' })))
const researchOk = RESEARCH.filter((r, i) => research[i]).map(r => r.key)
const files = researchOk.map(k => `${V2}/research/${k}.md`).join(', ')
log(`research done: ${researchOk.join(', ')}`)

phase('Brainstorm')
const written = await parallel(WRITERS.map(w => () => agent(
  `${CTX}\n\nYou are ${w.lens}.\n\nRead: ${SRC}; the research files ${files}; and in ${PLAYBOOK} the sections "Script and voice" and "Hook and pacing".\n\nTask: propose 2 clearly different angles for video 2.\n${RULES}\n\nAlso write both angles as readable markdown to ${V2}/brainstorm/${w.key}.md. Don't commit. Return the 2 angles.`,
  { label: `writer:${w.key}`, phase: 'Brainstorm', schema: ANGLES })))

const angles = []
WRITERS.forEach((w, i) => { const r = written[i]; if (!r) return; r.angles.forEach(a => angles.push({ id: `A${angles.length + 1}`, writer: w.key, ...a })) })
const anon = angles.map(({ writer, ...a }) => a)
log(`${angles.length} angles from ${written.filter(Boolean).length} writers`)

phase('Judge')
const judged = await parallel(JUDGES.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}\n\nFor reference: ${SRC} and the research files ${files} (read guardrails.md before scoring truth).\n\nScore every angle below from 1 to 10 on: hook (would a scroller stop in the first 2 s and still be there at 5 s), truth (true, fair and defensible, no overclaim, Google's side represented), stakes (why a normal person cares), freshness (not the obvious headline everyone already posted), fit (works in 30-45 s and can be drawn in our hand-drawn ink, flat-colour style), share (would people comment, rewatch or send it to someone). Be harsh and use the full range; the differences matter more than the absolute values. For each angle give its best hook line. Then pick your top 3 and list grafts.\n\nAngles (JSON):\n${JSON.stringify(anon)}`,
  { label: `judge:${j.key}`, phase: 'Judge', schema: SCORES })))

const agg = {}
angles.forEach(a => { agg[a.id] = { id: a.id, writer: a.writer, title: a.title, sum: 0, truth: 0, hook: 0, n: 0 } })
judged.filter(Boolean).forEach(j => j.scores.forEach(s => {
  const g = agg[s.id]; if (!g) return
  g.sum += 2 * s.hook + 2 * s.truth + s.stakes + s.freshness + s.fit + s.share
  g.truth += s.truth; g.hook += s.hook; g.n++
}))
const r1 = x => Math.round(x * 10) / 10
const ranking = Object.values(agg)
  .map(g => ({ id: g.id, writer: g.writer, title: g.title, score80: g.n ? r1(g.sum / g.n) : 0, truth: g.n ? r1(g.truth / g.n) : 0, hook: g.n ? r1(g.hook / g.n) : 0 }))
  .sort((a, b) => b.score80 - a.score80)
log(`top: ${ranking.slice(0, 3).map(r => `${r.id} ${r.score80}`).join(', ')}`)

phase('Synthesis')
const synth = await agent(
  `${CTX}\n\nYou are the head writer. 5 writers proposed ${angles.length} angles and 3 judges (growth strategist, standards editor + media lawyer, creative director) scored them. First read ${SRC}, the research files ${files}, and in ${PLAYBOOK} the sections "Script and voice" and "Hook and pacing".\n\nRanking (average weighted score out of 80; hook and truth count double):\n${JSON.stringify(ranking)}\n\nJudge verdicts:\n${JSON.stringify(judged.filter(Boolean))}\n\nAll angles (JSON):\n${JSON.stringify(angles)}\n\nWrite the owner's G0 decision doc to ${V2}/G0_ANGLES.md:\n1. "Pick one" (must fit one phone screen, max 35 lines): 3 options, each with a short name; the frame-0 on-screen text; the spoken hook line plus 2 alternates; the story in 2 lines; why it should work (cite the judges' scores); the main risk. Then one line with your recommendation and why.\n2. Per option: a beat table (time / voice-over / what we see); the full voice-over draft (85-115 words, everyday spoken language, with delivery cues in brackets such as [quieter, close to the mic]); the ending and the comment prompt; the facts used, each with its source; fairness notes (where Google's response sits).\n3. The score table for all angles (id, title, writer lens, score, truth), the best unused hook lines, and 2-3 runner-up ideas worth keeping.\n4. If the story is bigger than one 45 s video, one short paragraph on how it could be a 2-3 part series.\n5. Per option, one line: the hook sound (from the angle) and a suggested palette from our house family in ${ROOT}/docs/look/PALETTE.md (pick by name, e.g. Dusk for serious, Sage Study for cozy interiors), with why.\nBuild the 3 options from the top-ranked angles, grafting the best ideas from the others. Make them genuinely different choices (a different emotional core or structure) unless the scores clearly say otherwise. Never use an angle whose average truth score is below 7 without fixing its overclaim.\n${RULES}\n\nDon't commit. Return at most 15 lines: the 3 options (name + hook line) and your recommendation.`,
  { label: 'synthesis', phase: 'Synthesis' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V2}/G0_ANGLES.md line by line: every claim, number, date, name, quote, on-screen text, hook line and implication. Verify against ${SRC} and ${files}, and with WebSearch (load it with ToolSearch if needed) wherever a research line is only REPORTED or UNCERTAIN or the doc goes beyond the research. Quotes must be verbatim. Flag implications that mislead even when every word is true (e.g. implying that Google's AI picks targets, that there is a mass exodus, or that a law bans staff from speaking). Fix problems in place with minimal wording changes that keep the punch. Under each option add one line "Fact status: ...". Don't commit. Return at most 15 lines: what you changed and anything still uncertain.`,
  { label: 'fact-check', phase: 'Fact-check' })

return { research: research.filter(Boolean), ranking, synthesis: synth, factcheck: fc }

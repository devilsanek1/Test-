export const meta = {
  name: 'v3-g1-story',
  description: 'v3 G1 from scratch, story first: 4 story spines + 3 judges, 3 writers on the winning spine, cold-read retell panel + flow critic + standards, merge into one script + ElevenLabs paste file, final fact check',
  phases: [
    { title: 'Spines', detail: '4 story architects, one narrative device each' },
    { title: 'Judge spines', detail: 'story editor, retention, standards' },
    { title: 'Write', detail: '3 writers draft the winning spine' },
    { title: 'Test', detail: 'cold-read retell panel, flow critic, standards' },
    { title: 'Merge', detail: 'one script + paste file' },
    { title: 'Fact-check', detail: 'final script, paste-safe check' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const FACTS = `${V3}/research/factlock.md and ${V3}/research/widen.md`
const CTX = `Context: today is 2026-10-26. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), drawn in hand-drawn ink with flat colour (cozy interiors, occasional big scale moments). Video 3's topic and core line are LOCKED (read ${V3}/CORE_LINE.md): the core line is "AI is making your next laptop pricier." and the frame-0 on-screen text is "AI IS MAKING YOUR NEXT LAPTOP PRICIER". The owner liked this opening line: "Buying a laptop soon? AI's making it pricier." Facts with safe wordings: ${FACTS} (use only VERIFIED rows, or REPORTED with soft wording). The master brief is ${ROOT}/docs/CREATIVE_BRIEF.md (read sections 9-17: start with the payoff, the understanding shift, structure, BUT and SO, every sentence earns its place, voice, humour).

WHY WE'RE HERE: the owner rejected the previous script: "the story doesn't coherently flow. It seems like it's just a collection of sentences that are around the same big topic. We need a coherent story, as if we are writing a professional script. Start from scratch." The old script was built from a checklist of facts to prove, so it read like a list. Do NOT structure anything as a list of facts. A story has one throughline question the viewer wants answered, a situation the viewer is in, and a chain where every line follows from the one before (you could join each pair with "but", "so", "because" or "which means", never "and also"), building to a turn (the moment it clicks) and a payoff that lands the core line.

Hard rules: 30-45 s, 90-115 spoken words. Frame 0 shows the core-line text; the first spoken line lands the core line's meaning in the first ~2 s. Say "AI data centers" (not just "AI") early, so viewers don't think we mean AI features in their laptop. Never cast the viewer as a loser or a competitor in a contest they don't feel (the owner found "you're up against AI data centers… and losing" too much). No villains: memory makers selling to whoever pays most is normal business. Never "AI is raising prices on everything", never "every year for 20 years", never "record" or "ever"; US-only numbers are said as US. Everyday spoken American English, like a smart, warm, dryly funny friend; no AI-sounding phrasing ("here's the thing", "let's dive in", "in a world where", rhetorical triplets, "it's not X, it's Y" patterns). At most one joke, and it must come from the situation. End close to the payoff; no "follow for more".`

const DEVICES = [
  { key: 'mystery', lens: `a mystery: the viewer's next laptop costs more and it makes no sense (tech always got cheaper), so we follow the clues one step at a time until the culprit is revealed` },
  { key: 'journey', lens: `a journey: follow one thing (e.g. a single memory chip leaving the factory, or one laptop on its way to the viewer) and show where it goes and why, so the cause becomes a route the viewer can picture` },
  { key: 'then_now', lens: `then vs now: the deal the viewer grew up with (every new laptop more for less) and what quietly changed this year, told as a before/after with one clear turning point` },
  { key: 'everyday', lens: `an everyday scene: one relatable moment (shopping for a laptop for a kid, or the old one dying) that the story keeps returning to, with the explanation unfolding as answers to the questions that moment raises` },
]

const SPINE = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    throughline: { type: 'string', description: 'the one question the viewer wants answered' },
    situation: { type: 'string', description: 'the situation the viewer is in' },
    opening_line: { type: 'string' },
    beats: { type: 'array', minItems: 5, maxItems: 9, items: { type: 'object', properties: {
      link: { type: 'string', description: 'how it follows from the previous beat: but / so / because / which means / (first)' },
      happens: { type: 'string', description: 'what happens in the story at this beat, in one sentence' },
      fact: { type: 'string', description: 'factlock/widen row, or none' },
    }, required: ['link', 'happens', 'fact'] } },
    turn: { type: 'string', description: 'the moment it clicks' },
    payoff: { type: 'string', description: 'the last line idea and how it lands the core line' },
    retell: { type: 'string', description: 'the story as a viewer would retell it to a friend, 2 sentences' },
  },
  required: ['title', 'throughline', 'situation', 'opening_line', 'beats', 'turn', 'payoff', 'retell'],
}

const SPINE_SCORES = {
  type: 'object',
  properties: { scores: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string' }, coherence: { type: 'number' }, hook: { type: 'number' }, truth: { type: 'number' }, payoff: { type: 'number' }, fit: { type: 'number' },
    best_ideas: { type: 'string', description: 'what to keep or graft' }, problems: { type: 'string' },
  }, required: ['key', 'coherence', 'hook', 'truth', 'payoff', 'fit', 'best_ideas', 'problems'] } } },
  required: ['scores'],
}

const DRAFT = {
  type: 'object',
  properties: {
    lines: { type: 'array', items: { type: 'object', properties: {
      link: { type: 'string', description: 'but / so / because / which means / (first)' },
      cue: { type: 'string', description: 'v1-style delivery cue: tone, "like you...", what to lean on; short and human, no ms or wpm, never quote script words' },
      vo: { type: 'string', description: 'the spoken line; CAPS on the word to lean on; … for a beat; numbers as digits' },
      picture: { type: 'string', description: 'what we see, one short sentence' },
      fact: { type: 'string' },
    }, required: ['link', 'cue', 'vo', 'picture', 'fact'] } },
    word_count: { type: 'number' },
  },
  required: ['lines', 'word_count'],
}

phase('Spines')
const spines = await parallel(DEVICES.map(d => () => agent(
  `${CTX}\n\nYou are a story architect for short documentary scripts. Your narrative device: ${d.lens}.\n\nRead the core line doc, the fact files and the brief sections first. Then design the STORY SPINE (not the final lines): the throughline question, the viewer's situation, the opening line, 5-9 beats each linked to the previous by but/so/because/which means, the turn, the payoff, and the 2-sentence retelling. Make it a story someone would retell, true to the facts. Don't write files.`,
  { label: `spine:${d.key}`, phase: 'Spines', schema: SPINE })))
const sp = DEVICES.map((d, i) => spines[i] ? { key: d.key, ...spines[i] } : null).filter(Boolean)

phase('Judge spines')
const SJ = [
  { key: 'story', lens: `a story editor for documentaries: you judge coherence (one throughline, real cause and effect, every beat follows from the last, no "and also" beats), the turn, and whether the payoff lands the core line` },
  { key: 'retention', lens: `a short-form retention editor: you judge the first 2 s, whether each beat makes you need the next, and the ending` },
  { key: 'standards', lens: `a standards editor: you judge truth and fairness against the fact files (penalise overclaims hard)` },
]
const sj = await parallel(SJ.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}. Read the fact files. Score each spine 1-10 on coherence, hook, truth, payoff, fit (30-45 s, drawable). Be harsh; use the full range. Say what to keep or graft, and the problems.\n\nSpines (JSON):\n${JSON.stringify(sp)}`,
  { label: `judge:${j.key}`, phase: 'Judge spines', schema: SPINE_SCORES })))
const tot = {}
sp.forEach(s => { tot[s.key] = 0 })
sj.filter(Boolean).forEach(j => j.scores.forEach(s => { if (s.key in tot) tot[s.key] += 3 * s.coherence + 2 * s.hook + 2 * s.truth + 2 * s.payoff + s.fit }))
const ranked = sp.slice().sort((a, b) => tot[b.key] - tot[a.key])
const win = ranked[0]
log(`spine ranking: ${ranked.map(s => `${s.key} ${tot[s.key]}`).join(', ')}`)
const notes = JSON.stringify(sj.filter(Boolean).map((j, i) => ({ judge: SJ[i].key, scores: j.scores })))

phase('Write')
const WRITERS = [
  { key: 'warm', lens: `a warm documentary storyteller who makes every transition feel inevitable` },
  { key: 'tight', lens: `a tight short-form editor: no wasted word, a reason to keep watching in every line, still a story` },
  { key: 'wit', lens: `a dry, witty writer: one well-placed laugh that comes from the situation, warmth everywhere else` },
]
const drafts = await parallel(WRITERS.map(w => () => agent(
  `${CTX}\n\nYou are ${w.lens}.\n\nThe winning story spine (build on it; graft the judges' best ideas from the others if they make the story stronger):\n${JSON.stringify(win)}\n\nOther spines:\n${JSON.stringify(ranked.slice(1))}\n\nJudges' notes:\n${notes}\n\nWrite the full script, line by line. Every line must follow from the previous one (give the link). Cues in the owner's v1 format, e.g. [deadpan, like you're stating the obvious, tiny pause after the name]: short, human, never quoting script words. Read the fact files and the brief sections first. Also write it as readable markdown to ${V3}/script/story_draft_${w.key}.md. Don't commit.`,
  { label: `writer:${w.key}`, phase: 'Write', schema: DRAFT })))
const ds = WRITERS.map((w, i) => drafts[i] ? { id: `D${i + 1}`, key: w.key, ...drafts[i] } : null).filter(Boolean)
const spoken = ds.map(d => ({ id: d.id, script: d.lines.map(l => l.vo).join(' ') }))

phase('Test')
const PERSONAS = [
  { key: 'gamer', who: `Jayden, 17, plays on a PC and a Switch, scrolls TikTok for hours` },
  { key: 'parent', who: `Maria, 41, two kids, needs to replace the family laptop before Christmas, doesn't follow tech news` },
  { key: 'worker', who: `Dev, 29, office job, has heard "AI bubble" talk, cynical about clickbait` },
]
const RETELL = {
  type: 'object',
  properties: { reactions: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, retell: { type: 'string', description: 'retell what the video said to a friend, 2 sentences, from memory' },
    story_or_list: { type: 'number', description: '1 = a list of facts, 10 = a story that flows' },
    kept_watching: { type: 'boolean' }, confused_by: { type: 'string' }, eye_roll: { type: 'string', description: 'what felt like hype, or empty' }, rank: { type: 'number' },
  }, required: ['id', 'retell', 'story_or_list', 'kept_watching', 'confused_by', 'eye_roll', 'rank'] } } },
  required: ['reactions'],
}
const FLOW = {
  type: 'object',
  properties: { reviews: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, flow: { type: 'number' }, breaks: { type: 'array', items: { type: 'string' }, description: 'each pair of lines joined only by "and also", or a jump' },
    ai_phrasing: { type: 'array', items: { type: 'string' } }, truth: { type: 'number' }, truth_issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } },
  }, required: ['id', 'flow', 'breaks', 'ai_phrasing', 'truth', 'truth_issues', 'fixes'] } } },
  required: ['reviews'],
}
const [panel, flow] = await Promise.all([
  parallel(PERSONAS.map(p => () => agent(
    `You are ${p.who}. You hear each of these short-video voice-overs ONCE while scrolling. For each: retell it to a friend from memory in 2 sentences, say whether it felt like a story that flows or a list of facts (1-10), whether you'd keep watching, what confused you, what felt like hype. Rank them. Don't research anything.\n\nScripts (JSON):\n${JSON.stringify(spoken)}`,
    { label: `cold-read:${p.key}`, phase: 'Test', schema: RETELL }))),
  agent(`${CTX}\n\nYou are a script doctor and standards editor in one. Read the fact files. For each draft: check every consecutive pair of lines (is it joined by but/so/because, or only "and also"? any jump?), flag AI-sounding phrasing, check every claim against the fact files, score flow and truth 1-10, give up to 6 concrete fixes.\n\nDrafts (JSON):\n${JSON.stringify(ds)}`,
    { label: 'flow+standards', phase: 'Test', schema: FLOW }),
])

phase('Merge')
const merged = await agent(
  `${CTX}\n\nYou are the head writer. Winning spine:\n${JSON.stringify(win)}\n\nDrafts:\n${JSON.stringify(ds)}\n\nCold-read panel (retellings, story-vs-list scores):\n${JSON.stringify(panel.filter(Boolean))}\n\nFlow + standards review:\n${JSON.stringify(flow)}\n\nWrite ONE final script. Start from the draft with the best retellings and flow, apply the fixes, graft the best lines. Then write:\n1. ${V3}/script/script_g1.md: header (core line, frame-0 text, word count, estimated length at 165 wpm); "The story in 3 sentences" (the spine); "The script" as a table (# / how it follows: but-so-because / delivery cue / line / picture / fact); "Facts used" with sources.\n2. ${V3}/script/script_elevenlabs.md: the paste file ONLY, nothing else in it: for each line a cue in brackets on its own line, then the spoken line, a blank line between lines. Paste-safe rules (the owner's ElevenLabs v4 read notes and quoted words aloud last time): only tags and spoken words, no titles or notes; tags describe delivery only and NEVER quote script words; put a short extra tag mid-line where the delivery changes; CAPS on the word to lean on; … for a beat; numbers and symbols spelled out (ten percent, five times, twenty twenty-seven).\nDon't commit. Return the final spoken script as one paragraph, the word count, and the 3-sentence story.`,
  { label: 'head-writer', phase: 'Merge' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker and a paste-file checker. Check ${V3}/script/script_g1.md line by line against the fact files (WebSearch, loaded with ToolSearch, only if a line goes beyond them): every claim, number and implication; US-only figures said as US. Fix in place with minimal wording changes that keep the story and the voice. Keep ${V3}/script/script_elevenlabs.md in sync, and check it is paste-safe (only bracket tags and spoken words; no tag quotes a script word; numbers spelled out). Add "Fact status: ..." under the header of script_g1.md. Don't commit. Return at most 8 lines: what you changed.`,
  { label: 'fact-check', phase: 'Fact-check' })

return { spineRanking: ranked.map(s => ({ key: s.key, score: tot[s.key], retell: s.retell })), panel: panel.filter(Boolean).map(p => p.reactions.map(r => ({ id: r.id, story_or_list: r.story_or_list, rank: r.rank }))), merged, factcheck: fc }

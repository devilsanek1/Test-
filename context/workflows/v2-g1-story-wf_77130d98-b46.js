export const meta = {
  name: 'v2-g1-story',
  description: 'v2 G1, story first: 4 story spines + 3 judges, 3 writers on the winning spine, cold-read retell panel + flow/standards critic, merge into one script + ElevenLabs paste file + hook variants, final fact and paste check',
  phases: [
    { title: 'Spines', detail: '4 story architects, one narrative device each' },
    { title: 'Judge spines', detail: 'story editor, retention, standards' },
    { title: 'Write', detail: '3 writers draft the winning spine' },
    { title: 'Test', detail: 'cold-read retell panel, flow + standards critic' },
    { title: 'Merge', detail: 'one script + paste file + hook variants' },
    { title: 'Fact-check', detail: 'final script, paste-safe check' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V2 = ROOT + '/docs/v2'
const FACTS = `${V2}/research/factlock.md`
const CORE = `${V2}/CORE_LINE.md`
const CTX = `Context: today is 2026-10-26. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), drawn in hand-drawn ink with flat colour (cozy interiors, occasional big scale moments). Video 2's topic and core line are LOCKED: read ${CORE} first, all of it (the locked line, the rules, what the script must prove and in what order, Google's side, the callback, the first-second sound and frame-0 idea). The core line is "She quit Google, and says her contract bans criticizing it, for life." Frame-0 text: "SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE." Facts with safe wordings and the "Never say" list: ${FACTS} (use only VERIFIED rows, or REPORTED rows with attribution). The master brief is ${ROOT}/docs/CREATIVE_BRIEF.md (read sections 9-17). The owner's rules: ${ROOT}/docs/OWNER_PLAYBOOK.md, sections "Script and voice", "Hook and pacing", "Taste signals".

A script is ONE coherent story, never a list of facts: one throughline question the viewer wants answered, a situation, and a chain where every line follows from the one before (you could join each pair with "but", "so", "because" or "which means", never "and also"), building to a turn (the moment it clicks) and a payoff that lands the core line. The owner rejected a previous video's script as "a collection of sentences around the same topic"; don't repeat that.

Hard rules: 30-45 s, 90-115 spoken words. The opening (owner rule): the first spoken words come on the first frames and land the core line in ~2 s ("She quit Google. And she says her contract bans her from criticizing it... for life."), the hook is made physical on screen (the contract is drawn live, the highlighted line keeps running, the page unrolls past the frame: "for life"), and something new happens every few frames. Attribution always ("she says"); "for life" never in quote marks; never a count of leavers ("several told the BBC"); never "silenced", "gagged", "exodus", or any legal claim; no war, weapons, Hegseth or Trump in the hook; never imply Google's AI picks targets; Google's reply gets its own beat with equal weight; BBC quotes exact and credited. Introduce her as a staffer who objected and then quit. The payoff callback: her own "talking about facts is not criticising", which answers "so why is she talking?". Everyday spoken American English, like a smart, warm friend; plain, direct and personal over clever; no AI-sounding phrasing ("here's the thing", "let's dive in", "in a world where", rhetorical triplets, "it's not X, it's Y"). No jokes about war; at most one light touch, from the situation. End close to the payoff; no "follow for more".`

const DEVICES = [
  { key: 'mystery', lens: `a mystery: she quit and says she can't criticize Google for life, so why is she talking? Follow the clues one step at a time (what she objected to, why others stay quiet) until her own answer closes it` },
  { key: 'two_contracts', lens: `two contracts: the story runs on two documents, her job contract (the clause she says bans criticism for life) and the contract Google signed with the Pentagon ("any lawful government purpose", with its oversight clause); one explains why she left, the other why people stay quiet` },
  { key: 'then_now', lens: `then vs now: once, staff pushed back and Google listened (2018); this year about 600 asked it to say no and it signed within a day; told through her, with one clear turning point` },
  { key: 'one_room', lens: `one room: her desk, the last evening (a cozy, lamp-lit, enclosed space), the decision she makes there; the story keeps returning to that small room while the explanation unfolds as answers to the questions it raises` },
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
      fact: { type: 'string', description: 'factlock row, or none' },
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
      cue: { type: 'string', description: 'v1-style delivery cue: tone, "like you...", what to lean on; short and human; never quote script words; never name an action' },
      vo: { type: 'string', description: 'the spoken line; CAPS on the word to lean on; … for a beat' },
      picture: { type: 'string', description: 'what we see, one short sentence' },
      fact: { type: 'string' },
    }, required: ['link', 'cue', 'vo', 'picture', 'fact'] } },
    word_count: { type: 'number' },
  },
  required: ['lines', 'word_count'],
}

phase('Spines')
const spines = await parallel(DEVICES.map(d => () => agent(
  `${CTX}\n\nYou are a story architect for short documentary scripts. Your narrative device: ${d.lens}.\n\nRead the core line doc, the fact file and the brief sections first. Then design the STORY SPINE (not the final lines): the throughline question, the viewer's situation, the opening line, 5-9 beats each linked to the previous by but/so/because/which means, the turn, the payoff, and the 2-sentence retelling. Make it a story someone would retell, true to the facts. Don't write files.`,
  { effort: 'max', label: `spine:${d.key}`, phase: 'Spines', schema: SPINE })))
const sp = DEVICES.map((d, i) => spines[i] ? { key: d.key, ...spines[i] } : null).filter(Boolean)

phase('Judge spines')
const SJ = [
  { key: 'story', lens: `a story editor for documentaries: you judge coherence (one throughline, real cause and effect, every beat follows from the last, no "and also" beats), the turn, and whether the payoff lands the core line` },
  { key: 'retention', lens: `a short-form retention editor: you judge the first 2 s, whether each beat makes you need the next, and the ending` },
  { key: 'standards', lens: `a standards editor and media lawyer: you judge truth and fairness against the fact file and the "Never say" list (penalise overclaims and anything unfair to Google or the named people hard)` },
]
const sj = await parallel(SJ.map(j => () => agent(
  `${CTX}\n\nYou are ${j.lens}. Read the core line doc and the fact file. Score each spine 1-10 on coherence, hook, truth, payoff, fit (30-45 s, drawable). Be harsh; use the full range. Say what to keep or graft, and the problems.\n\nSpines (JSON):\n${JSON.stringify(sp)}`,
  { effort: 'max', label: `judge:${j.key}`, phase: 'Judge spines', schema: SPINE_SCORES })))
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
  { key: 'tension', lens: `a quiet-tension documentary writer: calm, close, a little uneasy, the feeling that something is about to happen, never alarmist` },
]
const drafts = await parallel(WRITERS.map(w => () => agent(
  `${CTX}\n\nYou are ${w.lens}.\n\nThe winning story spine (build on it; graft the judges' best ideas from the others if they make the story stronger):\n${JSON.stringify(win)}\n\nOther spines:\n${JSON.stringify(ranked.slice(1))}\n\nJudges' notes:\n${notes}\n\nWrite the full script, line by line. Every line must follow from the previous one (give the link). Cues in the owner's v1 format, e.g. [quiet disbelief, like you're reading a friend's text aloud]: short, human, describing tone only, never quoting script words, never naming an action. Read the core line doc, the fact file and the brief sections first. Also write it as readable markdown to ${V2}/script/story_draft_${w.key}.md. Don't commit.`,
  { effort: 'max', label: `writer:${w.key}`, phase: 'Write', schema: DRAFT })))
const ds = WRITERS.map((w, i) => drafts[i] ? { id: `D${i + 1}`, key: w.key, ...drafts[i] } : null).filter(Boolean)
const spoken = ds.map(d => ({ id: d.id, script: d.lines.map(l => l.vo).join(' ') }))

phase('Test')
const PERSONAS = [
  { key: 'teen', who: `Jayden, 17, scrolls TikTok for hours, wants to study computer science, thinks working at Google would be the dream` },
  { key: 'parent', who: `Maria, 41, two kids, watches Reels in the evening, doesn't follow tech news, uneasy about war in the news` },
  { key: 'worker', who: `Dev, 29, office job, has heard endless AI hype, cynical about clickbait` },
  { key: 'engineer', who: `Sam, 24, junior software engineer, follows AI news, has friends at big tech companies` },
]
const RETELL = {
  type: 'object',
  properties: { reactions: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, retell: { type: 'string', description: 'retell what the video said to a friend, 2 sentences, from memory' },
    story_or_list: { type: 'number', description: '1 = a list of facts, 10 = a story that flows' },
    kept_watching: { type: 'boolean' }, confused_by: { type: 'string' }, eye_roll: { type: 'string', description: 'what felt like hype or unfair, or empty' }, rank: { type: 'number' },
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
    `You are ${p.who}. You hear each of these short-video voice-overs ONCE while scrolling. For each: retell it to a friend from memory in 2 sentences, say whether it felt like a story that flows or a list of facts (1-10), whether you'd keep watching, what confused you, what felt like hype or unfair. Rank them. Don't research anything.\n\nScripts (JSON):\n${JSON.stringify(spoken)}`,
    { effort: 'max', label: `cold-read:${p.key}`, phase: 'Test', schema: RETELL }))),
  agent(`${CTX}\n\nYou are a script doctor and standards editor in one. Read the core line doc and the fact file. For each draft: check every consecutive pair of lines (is it joined by but/so/because, or only "and also"? any jump?), flag AI-sounding phrasing, check every claim and quote against the fact file and its "Never say" list, score flow and truth 1-10, give up to 6 concrete fixes.\n\nDrafts (JSON):\n${JSON.stringify(ds)}`,
    { effort: 'max', label: 'flow+standards', phase: 'Test', schema: FLOW }),
])

phase('Merge')
const merged = await agent(
  `${CTX}\n\nYou are the head writer. Winning spine:\n${JSON.stringify(win)}\n\nDrafts:\n${JSON.stringify(ds)}\n\nCold-read panel (retellings, story-vs-list scores):\n${JSON.stringify(panel.filter(Boolean))}\n\nFlow + standards review:\n${JSON.stringify(flow)}\n\nRead ${ROOT}/docs/ELEVENLABS.md first. Write ONE final script. Start from the draft with the best retellings and flow, apply the fixes, graft the best lines. Then write:\n1. ${V2}/script/script_g1.md: header (core line, frame-0 text, word count, estimated length at 165 wpm); "The story in 3 sentences" (the spine); "The script" as a table (# / how it follows: but-so-because / delivery cue / line / picture / fact); "Hook variants": H1 = the opening used in the script, plus H2 and H3, two genuinely different alternative opening lines that keep the core line (each with its frame-0 picture and why); "Facts used" with sources; "Google's side" (where and how it is represented).\n2. ${V2}/script/script_elevenlabs.md: the paste file ONLY, following ELEVENLABS.md exactly (only bracket tags and spoken words; one cue per line; tags describe tone only, never quote script words, never name an action, no digits; the opening block under ONE tag with no mid-line tag; CAPS for emphasis, … for a beat; numbers spelled out; "U.S."). Then run: cd ${ROOT} && python3 scripts/voice/check_paste.py docs/v2/script/script_elevenlabs.md, and fix the file until it prints "OK: paste-safe".\nDon't commit. Return the final spoken script as one paragraph, the word count, the 3-sentence story, and the 3 hook variants.`,
  { effort: 'max', label: 'head-writer', phase: 'Merge' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker and a paste-file checker. Check ${V2}/script/script_g1.md line by line against ${FACTS} and its "Never say" list (WebSearch, loaded with ToolSearch, only if a line goes beyond it): every claim, quote (verbatim), attribution and implication, fairness to Google and to the named people. Fix in place with minimal wording changes that keep the story and the voice. Keep ${V2}/script/script_elevenlabs.md in sync, and run cd ${ROOT} && python3 scripts/voice/check_paste.py docs/v2/script/script_elevenlabs.md until it prints "OK: paste-safe". Add "Fact status: ..." under the header of script_g1.md. Don't commit. Return at most 8 lines: what you changed.`,
  { effort: 'max', label: 'fact-check', phase: 'Fact-check' })

return { spineRanking: ranked.map(s => ({ key: s.key, score: tot[s.key], retell: s.retell })), panel: panel.filter(Boolean).map(p => p.reactions.map(r => ({ id: r.id, story_or_list: r.story_or_list, kept: r.kept_watching, rank: r.rank }))), merged, factcheck: fc }

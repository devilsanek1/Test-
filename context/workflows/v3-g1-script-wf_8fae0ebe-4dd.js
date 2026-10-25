export const meta = {
  name: 'v3-g1-script',
  description: 'v3 G1: lock the open facts, 3 competing scripts, 2 critics, head-writer merge with 3 hook variants, final fact-check',
  phases: [
    { title: 'Facts', detail: 'open items + consequence widening' },
    { title: 'Write', detail: '3 writers, different structures' },
    { title: 'Critique', detail: 'voice critic, growth+standards critic' },
    { title: 'Merge', detail: 'script_g1.md with 3 hooks and cues' },
    { title: 'Fact-check', detail: 'final script line by line' },
  ],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const G0 = V3 + '/G0_TOPICS.md'
const SCOUT = V3 + '/scouting/money.md'
const BRIEF = ROOT + '/docs/CREATIVE_BRIEF.md'
const PLAYBOOK = ROOT + '/docs/OWNER_PLAYBOOK.md'
const CTX = `Context: today is 2026-10-25. We make 30-45 s vertical explainers (TikTok / Reels / Shorts) for "What's All the Fuss About?" ("You've heard about it. Now actually understand it."), drawn in hand-drawn ink, flat colour, with cinematic scale moments and cozy enclosure framings. The owner picked video 3's topic: "AI is outbidding you for the memory in your laptop": AI data centres buy up memory chips (DRAM), so computer prices rose (US CPI computers +9.7% y/y, Sept 2026) after ~20 years of getting cheaper, and PC shipments fell ~20-22% in Q3 2026. The G0 doc is ${G0} (section "B." and its fact status), scouting notes ${SCOUT}. Never fetch bbc.co.uk.`

const FACTS = [
  { key: 'factlock', brief: `Lock the open facts for topic B. Settle each with primary or 2+ reputable sources, and write the verdict: (1) BLS CPI series CUUR0000SEEE01 (computers, peripherals and smart home assistants): is +9.7% y/y in Sept 2026 the largest since 2006 / ever? In which years did the y/y index rise before (the ~2021 bump)? What is the long-run fall since ~2005 (e.g. index level then vs now)? (2) Counterpoint Q3 2026 shipments (57M, -21%) and its Q4 forecast; (3) Omdia's "memory and storage ~40% of PC build cost vs ~15% normally"; (4) DRAM price moves in 2026 (TrendForce / Gartner contract prices, the "~5x" claim) and why: HBM for AI, capacity shifted, who the 3 big makers are (Samsung, SK hynix, Micron) and their share; (5) whether cheap / entry laptops are hit hardest (any measured data); (6) when analysts expect relief (2027-28?). Write ${V3}/research/factlock.md: each fact as one line with VERIFIED / REPORTED / FALSE, number, date, outlet + URL, and a "safe on-screen wording" column.` },
  { key: 'widen', brief: `Widen the consequence for topic B, so a viewer who isn't buying a laptop still cares. Find VERIFIED 2026 facts on whether the memory squeeze is raising prices or cutting specs for: smartphones (e.g. any 2026 phone price rises or base-storage cuts blamed on memory), game consoles, graphics cards, Raspberry Pi or other small computers, cars, TVs, SSDs/storage, cloud subscriptions. Also: one concrete, relatable illustration (e.g. how much memory one AI server or data centre uses compared with a laptop; what share of DRAM production goes to AI in 2026), and anything genuinely useful a viewer can do (no financial advice; e.g. "repair or upgrade before replacing" only if sourced). Write ${V3}/research/widen.md, each item with date, numbers, outlet + URL and VERIFIED / REPORTED / UNCERTAIN, ending with the 5 strongest "this hits you too" facts.` },
]

const WRITERS = [
  { key: 'auction', lens: `a metaphor-first explainer writer: build the whole script around one central image (an auction you didn't know you were in) that makes the mechanism click, with a dry, witty narrator` },
  { key: 'personal', lens: `a second-person storyteller: start with the viewer's own dead laptop / Christmas shopping, make it personal and relatable, then pull back to the giant data-centre scale, then land back home` },
  { key: 'retention', lens: `a TikTok retention editor: a number that goes the wrong way on frame 0, a re-hook every 5-8 s, open loops, and a last line that makes people comment or rewatch` },
]

const RULES = `Script rules (all must hold):
- 30-45 s at about 160-170 words per minute: 90-115 spoken words. The body must make sense with any of the 3 hook lines.
- Frame 0 states the payoff in words (a bold true claim on screen, max 7 words), starting mid-action. No calm intro, no greeting, no "I started reading about".
- A positive phone sound lands in the first second (a like pop, a notification ding, an "added to cart" pop or similar): say exactly where and why it fits.
- Everyday spoken natural American English, like a smart friend: contractions, plain words, dry wit from the situation. No AI-sounding phrasing ("delve", "in a world where", "here's the thing", "let's dive in", "game-changer", rhetorical triplets, "it's not X, it's Y" more than once). No news-anchor tone.
- Structure: hook 0-3 s, stakes 3-8 s, explanation, twist ("less a shortage than an auction" or better), payoff that says what it means for the viewer; end close to the payoff; no "follow for more".
- Every fact must be in ${V3}/research/factlock.md or widen.md as VERIFIED (or REPORTED with soft wording). US-only figures are flagged as US ("in the US") in the line or on screen. No villains: memory makers selling to the highest bidder is normal. Never "AI is raising prices on everything". Never "every year for 20 years".
- Delivery cues for every line, detailed and concrete, in brackets: emotion, pace, emphasis words, pauses in ms, smile or not (e.g. [half-amused disbelief, quick, lean on "up", 200 ms beat after]).
- Per line, the key image (we can draw anything, with one scale moment and one cozy-enclosure moment).`

const DRAFT = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    frame0_text: { type: 'string' },
    first_second_sound: { type: 'string' },
    hooks: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    lines: { type: 'array', items: { type: 'object', properties: { vo: { type: 'string' }, cue: { type: 'string' }, image: { type: 'string' }, fact: { type: 'string', description: 'which factlock/widen line backs it, or none' } }, required: ['vo', 'cue', 'image', 'fact'] } },
    word_count: { type: 'number' },
    why: { type: 'string', description: 'max 3 sentences' },
  },
  required: ['title', 'frame0_text', 'first_second_sound', 'hooks', 'lines', 'word_count', 'why'],
}

const CRIT = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      key: { type: 'string' }, hook: { type: 'number' }, clarity: { type: 'number' }, voice: { type: 'number' }, truth: { type: 'number' }, payoff: { type: 'number' },
      fixes: { type: 'array', items: { type: 'string' }, description: 'max 5 concrete line edits' },
    }, required: ['key', 'hook', 'clarity', 'voice', 'truth', 'payoff', 'fixes'] } },
    best_lines: { type: 'array', items: { type: 'string' }, description: 'the best individual lines across drafts, to graft' },
    best_hooks: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'best_lines', 'best_hooks'],
}

phase('Facts')
const facts = await parallel(FACTS.map(f => () => agent(
  `${CTX}\n\nTask: ${f.brief}\n\nHow: load WebSearch with ToolSearch ("select:WebSearch,WebFetch") if needed; search for 2026 data rather than relying on memory (your training data predates these events). bls.gov may block fetching; then use reputable outlets that quote the table. Don't commit. Return at most 12 lines: the verdicts that change what the script can say.`,
  { label: `facts:${f.key}`, phase: 'Facts' })))
log('facts done')

phase('Write')
const drafts = await parallel(WRITERS.map(w => () => agent(
  `${CTX}\n\nYou are ${w.lens}.\n\nRead: ${G0} (section B), ${V3}/research/factlock.md, ${V3}/research/widen.md, ${BRIEF} sections 9-17, and in ${PLAYBOOK} the sections "Script and voice", "Music and sound" and "Hook and pacing".\n\nTask: write a complete script for video 3.\n${RULES}\n\nAlso write it as readable markdown to ${V3}/script/draft_${w.key}.md. Don't commit. Return the draft.`,
  { label: `writer:${w.key}`, phase: 'Write', schema: DRAFT })))
const ds = WRITERS.map((w, i) => drafts[i] ? { key: w.key, ...drafts[i] } : null).filter(Boolean)

phase('Critique')
const CRITICS = [
  { key: 'voice', lens: `a voice and dialogue editor: you read every line aloud in your head. You judge whether it sounds like a real, warm, witty American friend talking (not an AI, not a news anchor, not a school presentation), whether it flows at 160-170 wpm, and whether the delivery cues are concrete enough for a voice actor or TTS. You flag every AI-sounding phrase.` },
  { key: 'growth_standards', lens: `a short-form growth strategist together with a standards editor: you judge whether a tired scroller stops in 2 s and stays to the payoff, and whether every claim and implication is true and fair against the factlock and widen files (penalise overclaims hard, check US-only flags).` },
]
const crits = await parallel(CRITICS.map(c => () => agent(
  `${CTX}\n\nYou are ${c.lens}\n\nReference: ${V3}/research/factlock.md and ${V3}/research/widen.md.\n\nScore each draft 1-10 on hook, clarity (a non-expert gets it once, at speed), voice, truth, payoff. Be harsh, use the full range. Give max 5 concrete line edits per draft, the best lines to graft across drafts, and the 3 best hook lines (improved if you can).\n\nDrafts (JSON):\n${JSON.stringify(ds)}`,
  { label: `critic:${c.key}`, phase: 'Critique', schema: CRIT })))

phase('Merge')
const merged = await agent(
  `${CTX}\n\nYou are the head writer. Read ${V3}/research/factlock.md, ${V3}/research/widen.md, ${BRIEF} sections 9-17, and in ${PLAYBOOK} "Script and voice", "Music and sound", "Hook and pacing".\n\nDrafts:\n${JSON.stringify(ds)}\n\nCritic verdicts:\n${JSON.stringify(crits.filter(Boolean))}\n\nTask: write the G1 script to ${V3}/script/script_g1.md:\n1. Header: title, frame-0 on-screen text, word count, estimated length at 165 wpm, the first-second phone sound and where it lands.\n2. "Hook variants": exactly 3 hook lines (H1 recommended, H2, H3), each with its own frame-0 text; each must flow into the same body's first line.\n3. "Script": a table, one row per spoken line: # / voice-over / delivery cue (detailed, concrete: emotion, pace, emphasis words, pauses in ms) / key image / backing fact.\n4. "Plain voice-over": the full text of H1 + body as one paragraph, exactly as spoken, ready for TTS; then the two other hook lines alone.\n5. "Why this version": max 5 lines naming what you grafted from which draft.\n6. "Facts used": each with its source line from factlock / widen.\nStart from the highest-scoring draft and graft the best lines and fixes. ${RULES}\nDon't commit. Return at most 12 lines: the 3 hook lines, the word count, and the plain voice-over.`,
  { label: 'merge', phase: 'Merge' })

phase('Fact-check')
const fc = await agent(
  `${CTX}\n\nYou are an adversarial fact-checker. Check ${V3}/script/script_g1.md line by line (hooks, every spoken line, on-screen texts, implications) against ${V3}/research/factlock.md, ${V3}/research/widen.md, and fresh WebSearch checks where a line is only REPORTED or goes beyond the research (load WebSearch with ToolSearch if needed). Flag implications that mislead even if every word is true (global vs US figures, "first time ever", "AI raises all prices", blaming companies). Fix in place with minimal wording changes that keep the voice and the word count, keeping section 4's plain voice-over in sync with the table. Add a line "Fact status: ..." under the header. Don't commit. Return at most 10 lines: what you changed and what is still uncertain.`,
  { label: 'fact-check', phase: 'Fact-check' })

return { facts, merged, factcheck: fc, critics: crits.filter(Boolean).map(c => c.scores.map(s => ({ key: s.key, hook: s.hook, clarity: s.clarity, voice: s.voice, truth: s.truth, payoff: s.payoff }))) }

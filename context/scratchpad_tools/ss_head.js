export const meta = {
  name: 'script-strawman',
  description: 'Fact-check and strawman the php2shell VO script against the channel brief, write competing lean rewrites, judge them, synthesize and adversarially fact-check a final TikTok-ready script',
  phases: [
    { title: 'Research', detail: 'fact base with sources + audience anchors' },
    { title: 'Critique', detail: 'line-by-line strawman on 3 lenses' },
    { title: 'Rewrite', detail: '4 competing rewrites with different strategies' },
    { title: 'Judge', detail: '3 judges score the rewrites' },
    { title: 'Final', detail: 'synthesize, adversarial fact-check, fix' },
  ],
}

const ROOT = '/home/user/Test-/video'
const OUT = `${ROOT}/docs/script`
const CURRENT = `Government websites in four countries just switched themselves off. Nobody hacked them. They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites. Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere. You'd think finding it is the hard part, right? And for 14 years, nobody did. Then, in August, two security teams using AI tools found it and quietly told the people who make PHP so a fix could be ready before anyone else knew. Except, the details of the bug leaked online hours before the fix came out. Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening. Nobody knows yet how many got in. So now comes step two, the slow one. Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit. If a site can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did. And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore. For those, it's switch off or hope the hosting company sorts it out.`

const COMMON = `
You are on the editorial team of the short-form channel "What's All the Fuss About?" (TikTok / Reels / Shorts).
FIRST read ${ROOT}/docs/CREATIVE_BRIEF.md in full: it is the standing editorial direction (so-what chain, understanding shift, hook/stakes/explanation/twist/payoff, BUT/SO flow, every sentence earns its place, warm witty American narrator, 155–175 wpm, strict accuracy and neutrality, no clever endings that don't follow).
The current voiceover script (226 words, ~78 s as recorded with an ElevenLabs voice):
"""${CURRENT}"""
Context: today is 2026-10-24. The story is real and fresh: a critical PHP flaw (reported as CVE-2026-109618 / CVE-2026-109619) disclosed and patched on 2026-10-21, with government sites in Finland, the Netherlands, Belgium and France taken offline, early exploit details leaking before the patch, Cloudflare reporting attack traffic, and Palo Alto Networks counting ~22.6 million potentially vulnerable internet-facing instances. Verify everything yourself; do not trust this summary.
Web research: load the WebSearch and WebFetch tools via ToolSearch ("select:WebSearch,WebFetch"). Prefer primary sources (php.net advisories and release notes, CVE/NVD, vendor blogs: Cloudflare, Palo Alto Networks/Unit 42, watchTowr, the original researchers, government statements, W3Techs) and credible reporting. Many direct URLs may be blocked by this environment's network proxy; WebFetch and WebSearch usually work; note when a source could not be opened.
The animation is already being produced around a visual metaphor (the web as a city, websites as buildings with browser windows, PHP as the elephant-stamped blueprint they're built from, the bug as a flaw in the blueprint's lock repeated in every door, Cloudflare as a glass dome/guard, a tiny elephant mascot). A rewrite may change the words freely, but note where a rewrite would need visuals that differ a lot from this world.
Write files only inside ${OUT}/.
`

phase('Research')
const research = await parallel([
  () => agent(`${COMMON}
YOUR JOB: the FACT BASE. Verify every factual claim in the current script and build the evidence the rewriters will be allowed to use. For each claim: verdict (accurate / accurate-with-caveat / misleading / wrong / unverified), the precise wording we can safely say in a TikTok (plain English, correct denominator), the best source URLs with dates, and caveats. Claims to check include: four countries and which; "switched themselves off" (voluntary/precautionary?); "Nobody hacked them"; PHP share of websites (W3Techs: share of sites whose server-side language is known) and WordPress's share; "14 years" (how old is the vulnerable code?); "in August, two security teams using AI tools found it" (who, when, which AI); "quietly told the people who make PHP" (coordinated disclosure/embargo); "details leaked online hours before the fix" (what leaked, when, how many hours); Cloudflare's numbers ("tens of thousands of break-in attempts in 45 minutes, and millions by evening") and what they do and don't show; "Nobody knows yet how many got in"; "22 million copies of PHP" (Palo Alto's 22.6M instances: what an instance is); "one in three sites on PHP runs a version so old that the makers don't fix it anymore" (W3Techs PHP version stats vs PHP's supported-versions policy; which versions got no patch); what the bug lets an attacker do in plain words (e.g. run their own code on the server = take over the site); FBI/NSA or other official guidance to take systems offline; any real human consequence (services people couldn't access; data at risk). Also collect 3–6 ADDITIONAL strong, verified facts that could make a better hook, stakes or payoff (for ordinary people). Also check the user's idea "PHP is the most popular programming language in the world" (we believe false: TIOBE/Stack Overflow/GitHub rank Python/JavaScript higher) and propose TRUE, punchy alternatives.
Write ${OUT}/fact_sheet.md (a table plus notes) and ${OUT}/sources.md (all URLs with dates and what each supports). Final message: the 12 most important verified facts with their safe wording, plus the claims in the current script that are wrong or misleading.`, { label: 'research:facts', phase: 'Research' }),
  () => agent(`${COMMON}
YOUR JOB: AUDIENCE ANCHORS and the SO-WHAT chain. (1) What do ordinary 18–40-year-old TikTok/Reels viewers already know? Assess recognition of "PHP", "WordPress", "Cloudflare", "patch", "vulnerability", "hosting company" for a general audience (use evidence where you can: search trends, surveys, or reasoned judgment marked as such). (2) Find TRUE, instantly relatable anchors that explain how big PHP is: famous sites or apps that run on PHP today (e.g. Wikipedia/MediaWiki, WordPress-powered sites, Facebook's PHP origins/Hack, Slack's backend, Etsy, Tumblr, big news sites...). Verify each with a source; mark anything historical vs current; flag anything risky. Also find vivid but accurate ways to say "about 7 in 10 websites" (with the right denominator) and "22.6 million instances". (3) Do the brief's repeated "So what?" chain for this story from an ordinary person's point of view until you reach a concrete consequence (e.g. most of the websites you use are built on the same foundation; one flaw means millions of doors with the same broken lock; the fix exists but must be installed site by site; the race is now about who updates first; sites nobody maintains stay open; what can a normal person actually do or notice?). Propose 3 candidate one-sentence theses in the brief's format and 3 candidate "understanding shifts" (before / during / after). (4) Propose 6 hook lines that get attention from information, not shouting.
Write ${OUT}/audience_and_sowhat.md. Final message: the best anchor(s) with sources, the strongest so-what chain, the best thesis, the 3 best hooks.`, { label: 'research:audience', phase: 'Research' }),
])
log('Research done')

phase('Critique')
const CRIT_LENSES = [
  { key: 'hook-flow', brief: 'HOOK, RETENTION & FLOW: the first 3 seconds, the stakes by 10 s, BUT/SO causality between sentences, places where attention will drop, dead words and phrases, redundancy, setups that waste time ("Fixing a bug like that takes two steps"? "You\'d think...right?"), the twist placement, the ending (does it follow? is it a payoff or a shrug?). Estimate where a TikTok viewer swipes away and why.' },
  { key: 'clarity-sowhat', brief: 'CLARITY & SO-WHAT for a general audience: jargon and unexplained names (PHP, WordPress, Cloudflare, versions, hosting company), the denominator of every number, whether the viewer ends with a concrete understanding they could tell a friend, whether the consequence for ordinary people is explicit (brief mistake 3), whether the story answers one big familiar question. Score against the brief\'s FINAL EDITORIAL STANDARD questions 1–10.' },
  { key: 'voice-accuracy', brief: 'VOICE, HUMOUR & ACCURACY: does it sound like the warm, dry-witted American narrator in the brief or like a news script? Where could ONE genuinely good, situation-born line go (and what)? Contractions, rhythm, sentence length for a TTS voice (ElevenLabs), number formats for speech. Then accuracy against the fact sheet: any compression that misleads, any claim stronger than the evidence, neutrality.' },
]
const critiques = await parallel(CRIT_LENSES.map(l => () => agent(`${COMMON}
Read ${OUT}/fact_sheet.md and ${OUT}/audience_and_sowhat.md first.
YOUR JOB: STRAWMAN the current script, line by line, through this lens: ${l.brief}
Be blunt and specific: quote each phrase, say exactly what's wrong, and propose a concrete fix (or a cut). Then list the 5 most important changes overall.
Write ${OUT}/critique_${l.key}.md. Final message: the 5 most important changes.`, { label: `critique:${l.key}`, phase: 'Critique' })))
log('Critiques done')

phase('Rewrite')
const STRATEGIES = [
  { key: 'tight', brief: 'TIGHT POLISH: keep the current story arc and beats (switch-off hook, two steps, 14 years, AI found it, leak, attack wave, the slow fix, old versions), but cut every wasted word, fix every accuracy and clarity problem, and land an explicit payoff. Target 50–60 s at ~165 wpm (about 140–165 words).' },
  { key: 'payoff-first', brief: 'PAYOFF-FIRST: restructure around one big familiar question ordinary people care about (pick the strongest from the research, e.g. "Could one bug break most of the internet?" or "Why would a government switch off its own websites?"). Use the brief\'s hook → stakes → explanation → twist → payoff with BUT/SO links and an explicit so-what for the viewer. Target 45–55 s (about 125–150 words).' },
  { key: 'twist', brief: 'TWIST-DRIVEN: open on the most counter-intuitive verified fact (e.g. governments switching off their own sites on purpose, or AI finding a bug humans missed for years and then it leaking before the fix), make the viewer need the answer, and reveal the mechanism and consequence in the most satisfying order. Target 45–55 s.' },
  { key: 'narrator', brief: 'NARRATOR-FORWARD: the same verified facts told by the brief\'s warm, dry-witted American narrator, with exactly one memorable situation-born line of humour (never at the expense of affected people) and a lively rhythm, still lean and fully accurate. Target 50–60 s.' },
]
const rewrites = await parallel(STRATEGIES.map(s => () => agent(`${COMMON}
Read ${OUT}/fact_sheet.md, ${OUT}/audience_and_sowhat.md and all ${OUT}/critique_*.md first.
YOUR JOB: write a rewrite. STRATEGY: ${s.brief}
Rules: use only claims marked accurate or accurate-with-caveat in the fact sheet, phrased with their safe wording; no invented consequences; no "it's complicated" endings; every sentence tagged with its job from brief §13; spoken-word friendly for an ElevenLabs American voice (contractions, short sentences, numbers written the way they should be spoken).
Write ${OUT}/rewrite_${s.key}.md containing: (1) the one-sentence thesis; (2) the understanding shift (before/during/after); (3) the script as plain paragraphs; (4) word count and estimated duration at 165 wpm; (5) a table: line | job tag | source(s) | visual idea; (6) what you cut from the current script and why.
Final message: the script text, word count, and estimated duration.`, { label: `rewrite:${s.key}`, phase: 'Rewrite' })))
log('Rewrites done')

phase('Judge')
const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      rewrite: { type: 'string' }, score: { type: 'number' },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
    }, required: ['rewrite', 'score', 'strengths', 'weaknesses'] } },
    winner: { type: 'string' },
    best_lines: { type: 'array', items: { type: 'string' }, description: 'exact lines from any rewrite that the final must keep, with the rewrite name' },
    must_fix: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'winner', 'best_lines', 'must_fix'],
}
const JUDGES = [
  { key: 'retention', brief: 'TikTok/Reels RETENTION & SHAREABILITY strategist: would this stop the scroll in 1–3 s, hold to the end, and get sent to a friend? Penalize any sentence that does not earn its place.' },
  { key: 'editorial', brief: 'EDITORIAL STANDARDS editor for this brief: accuracy against the fact sheet (any misleading compression is disqualifying), neutrality, the five tests, the final editorial standard questions, explicit payoff, no clever-but-unearned ending.' },
  { key: 'viewer', brief: 'A SMART 24-YEAR-OLD VIEWER who has never heard of PHP and barely knows WordPress: after one listen, can you explain to a friend what happened and why it matters? Which lines lost you? Which line made you go "wait, seriously?"' },
]
const verdicts = await parallel(JUDGES.map(j => () => agent(`${COMMON}
Read ${OUT}/fact_sheet.md and the four rewrites ${OUT}/rewrite_tight.md, rewrite_payoff-first.md, rewrite_twist.md, rewrite_narrator.md (and the current script above for comparison).
You are a JUDGE. LENS: ${j.brief} Score each rewrite 1–10, pick a winner, list the exact best lines from any rewrite that must survive, and the must-fix problems.`, { label: `judge:${j.key}`, phase: 'Judge', schema: JUDGE_SCHEMA })))
const v = verdicts.filter(Boolean)
const summary = v.map((x, i) => `## Judge ${JUDGES[i].key}\nwinner: ${x.winner}\nscores: ${x.scores.map(s => `${s.rewrite}=${s.score}`).join(', ')}\nbest lines:\n- ${x.best_lines.join('\n- ')}\nmust fix:\n- ${x.must_fix.join('\n- ')}\n${x.scores.map(s => `* ${s.rewrite}: + ${s.strengths.join('; ')} | - ${s.weaknesses.join('; ')}`).join('\n')}`).join('\n\n')
log('Judging done')


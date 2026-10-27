export const meta = {
  name: 'v2r-direction',
  description: 'v2 restart: four judges score six treatments, a director synthesizes TREATMENT.md, a devil\'s advocate attacks it, the director revises',
  phases: [
    { title: 'Judge', detail: 'viewer panel, art director, standards and facts, producer' },
    { title: 'Synthesize', detail: 'the director writes TREATMENT.md from the winner plus grafts' },
    { title: 'Challenge', detail: 'devil\'s advocate, then one revision' },
  ],
}
const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r'
const CTX = `
PROJECT: video 2 of "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920). Repo: ${V}
(Remotion, the house engine that made video 1). Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit over
where Google's military AI work was heading, and says her contract bans her from criticizing Google, for life.
THE OWNER (2026-10-27, after rejecting our first production): "No I don't like it, let's start from scratch, let's reset all cache, let's not
do the sketch. Do the video right away, full creative freedom, but look at our GitHub repo's general direction and principles. NO LIMIT ON
TOKENS." A FRESH production straight to the FINISHED film. The first production is DROPPED (never reuse its ideas; the teardown names why it
failed). FIXED: the narration, take 2 (${V}/public/v2/voice.wav, 39.08 s; timings ${V}/public/v2/voice_words.json).
READ FIRST, in full: ${V}/docs/v2/direction/house_digest.md (the repo's principles), beat_map.md (the clock, facts and FAIRNESS rules),
teardown.md (what makes v1 and reference 1 work; why the rejected cut failed; DO/DON'T) and toolkit.md (what our engine can build); look at
the contact sheets they name. Then ${V}/docs/CREATIVE_BRIEF.md and ${V}/docs/OWNER_PLAYBOOK.md if anything is unclear.
OWNER RULE (2026-10-27): "Don't rely on reusable assets." Every set, character (Pip too: redrawn NEW in this film's own design),
prop, piece of background life and the music are made NEW for this film. No v1 shared sets, no v3 kit, no stock mascot code, no house music
bed. toolkit.md is only for ENGINE PRIMITIVES (the sequencer, drawing primitives like Ink/Fill/sketch, camera, captions, timing, render and
QA commands), never for sets, props, characters or music.
OWNER RULE (2026-10-27): "don't use big models of people; the people we showed in the first example video are the right direction."
People are SMALL and SIMPLE like reference 1 (France, ${V}/assets/ref/reference.mp4): figures that live in the world (crowds, small full
figures, backs of heads, simple round heads, rows of people), NEVER big character models, waist-up character shots or close-up faces. The
story's "she" is shown as a small figure in her world (or by her things, her window, her bubble), never as a big portrait.
ON toolkit.md's tags: treat its procedural cine generators (EndlessCity, Monument, WallOfWindows, PerspectiveStreet), the lib/kit people and
placement pieces and the mascot rig as ASSETS for this film (owner rule), not tools: study their code if useful, but this film's city,
people and Pip are designed and drawn NEW. Camera and motion helpers (ShotCam, World push, the pull-back crane rig, idle/float helpers),
the drawing primitives, the Film sequencer, captions, the sample instruments for composing NEW music, and the QA scripts are tools.
GIT: commit only your file (git add <path>), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
If .git/index.lock exists, wait 5 s and retry. Never push, pull, merge, rebase, reset, stash or checkout. Public repo: no emails, no keys.
`

const TDIR = `${V}/docs/v2/direction/treatments`
const SCORE = {
  type: 'object',
  properties: {
    ranking: { type: 'array', items: { type: 'string' }, description: 'treatment ids best first, e.g. ["T3","T1",...]' },
    per: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      score: { type: 'number', description: '1-10 overall from your lens' },
      sub: { type: 'object', additionalProperties: { type: 'number' } },
      best_ideas: { type: 'array', items: { type: 'string' } },
      flaws: { type: 'array', items: { type: 'string' } },
      fatal: { type: 'array', items: { type: 'string' }, description: 'disqualifying problems only' },
    }, required: ['id', 'score', 'best_ideas', 'flaws', 'fatal'] } },
    verdict: { type: 'string' },
  },
  required: ['ranking', 'per', 'verdict'],
}
const JUDGE = (lens) => `${CTX}
YOU ARE A JUDGE. Read every treatment in ${TDIR}/ (T1 ... T6; if one is missing, judge the ones there and say so) after the four direction
docs. Score each from YOUR LENS ONLY, 1-10, with sub-scores, its best ideas worth grafting into the winner, its flaws and any FATAL problem.
Be decisive and specific (cite shot times). YOUR LENS: ${lens}`
phase('Judge')
const judges = await parallel([
  () => agent(JUDGE(`VIEWER PANEL. Simulate six distinct viewers scrolling Reels/TikTok with the sound on and then off: a 19-year-old on TikTok,
a 35-year-old parent who isn't into tech, a software engineer, a skeptic who distrusts media, a Google fan, a politics-curious student. For each
treatment and viewer: stop at 1 s? still there at 3 s, 5 s, 15 s, the end? what did they understand (retell it in one line)? would they comment
or send it to someone, and why? Sub-scores: stop1s, hold15s, clarity, share.`), { effort: 'max', label: 'judge-viewers', phase: 'Judge', schema: SCORE }),
  () => agent(JUDGE(`ART DIRECTOR of this channel. Does it look like OUR house at v1's level or better (house_digest, teardown): hand-drawn ink,
flat colour, warm never sickly, one coherent living world at the reference density, Pip in every scene, cinematic camera (the Arcane crane DNA),
cozy + great scale, beautiful transitions, captions that sit well, a banger opening that loops? Would the owner, who rejected our last cut,
say "yes, this"? Sub-scores: beauty, house_fit, aliveness, cinema, opening.`), { effort: 'max', label: 'judge-art', phase: 'Judge', schema: SCORE }),
  () => agent(JUDGE(`STANDARDS AND FACTS EDITOR. Check every treatment against the beat map's fairness rules, the fact lock and the master brief's
nonpartisan, no-villain, attributed-claims standard: war imagery, a likeness of the real person, manufactured villains, implied accusations,
quotes without attribution or out of context, the deal's purpose line shown without its oversight clause, Google's side at equal weight,
credits, anything defamatory or misleading at phone size with the sound off. Sub-scores: fairness, accuracy, risk (10 = no risk).`),
    { effort: 'max', label: 'judge-standards', phase: 'Judge', schema: SCORE }),
  () => agent(JUDGE(`PRODUCER. Can our engine and toolkit (toolkit.md) build it at FINISHED quality (v1 level) reliably, with many builder agents
working in parallel lanes, in roughly a day of agent time on a 4-CPU machine (renders included)? Everything is built NEW (owner rule: no reusable assets): what must be built, where
the risk is (character animation, crowds, long continuous moves, text legibility, 60 fps speed limits), what to simplify without losing the
idea. Sub-scores: feasibility, build_cost (10 = cheap), risk (10 = low risk).`), { effort: 'max', label: 'judge-producer', phase: 'Judge', schema: SCORE }),
])
const fmt = (j, name) => !j ? `### ${name}: (judge failed)` : `### ${name}\nranking: ${j.ranking.join(' > ')}\nverdict: ${j.verdict}\n` +
  j.per.map((p) => `- ${p.id} ${p.score}/10 ${p.sub ? JSON.stringify(p.sub) : ''}\n  best: ${p.best_ideas.join(' | ')}\n  flaws: ${p.flaws.join(' | ')}${p.fatal.length ? '\n  FATAL: ' + p.fatal.join(' | ') : ''}`).join('\n')
const panel = [fmt(judges[0], 'viewer panel'), fmt(judges[1], 'art director'), fmt(judges[2], 'standards and facts'), fmt(judges[3], 'producer')].join('\n\n')
log('judges done')

phase('Synthesize')
const DIRECTOR_SPEC = `Write ${V}/docs/v2/TREATMENT.md, THE locked direction for the finished film (at most ~320 lines), with these sections:
1. Concept in one sentence; the understanding shift; why it stops, holds and gets shared.
2. The world and its sets (one coherent world), the time of day, the PALETTE with exact hex values per role (hero, dark anchor, at most one pop,
   plus the set colours), warm never sickly; line and edge treatment (EDGES/paper rules: never at the top or by the caption band).
3. The cast: her (design spec: a SMALL, simple generic figure like reference 1's people; never a likeness, never a big model), Google's staff, Pip in every shot (its action per shot), crowds.
4. Frame 0 and the first 3 s, frame by frame; the frame-0 words; the loop back to frame 0.
5. THE SHOT LIST as a table: id, start s, end s, words, picture (fg / mid / bg), framing, camera move (from/to, easing), life (what moves),
   Pip, transition in, caption zone and tone, SFX (time), the one thing it explains. Times from voice_words.json; every cut on a word or pause.
6. Scale moment and cozy home base. 7. Sound: music bed (which house bed or a new one, its arc), SFX list, the positive phone sound in the
   first second, the mix target. 8. Fairness and facts compliance, rule by rule; credits per shot.
9. PRODUCTION PLAN: the film's own kit to build NEW first (palette module, cast incl. a new Pip, sets, props, background life, camera rigs; owner
   rule: no reusable assets, engine primitives only), and 6-8 builder LANES (which shots each owns; shots that share a set go together), the acceptance bar per shot (fullness,
   life, readability at phone size, fairness), and the render plan (60 fps, 1080x1920 final).
10. What the judges flagged and how this direction answers it. Keep the voice of a director: decisive, concrete, buildable.`
const director = await agent(`${CTX}
YOU ARE THE DIRECTOR. Six treatments competed (${TDIR}/); four judges scored them (below). Pick the strongest spine (usually the best-ranked
across the viewer panel and the art director, with no FATAL problem from standards), then GRAFT the best ideas of the others where they make
the film better, and fix every flaw the judges named. Read the four direction docs and every treatment first.
${DIRECTOR_SPEC}
Commit it. Final message: the winner, the grafts, and the concept in 5 lines.

JUDGES:
${panel}`, { effort: 'max', label: 'director', phase: 'Synthesize' })

phase('Challenge')
const CRIT = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ship', 'revise'] },
    problems: { type: 'array', items: { type: 'object', properties: {
      where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['must', 'should'] },
    }, required: ['where', 'problem', 'fix', 'severity'] } },
    summary: { type: 'string' },
  },
  required: ['verdict', 'problems', 'summary'],
}
const devil = await agent(`${CTX}
YOU ARE THE DEVIL'S ADVOCATE. The owner rejected our last cut with "No I don't like it" and gave full creative freedom. Attack
${V}/docs/v2/TREATMENT.md as the owner would, and as a sound-off viewer would: is it beautiful and alive at v1's level or will it be "empty"
and "a slideshow of tableaux" again? Does frame 0-3 s stop a thumb? Does every shot read literally with the sound off? Is it fair (beat map
rules)? Is the shot list really buildable and timed to the words? Is Pip in every shot without trivialising? Do the camera moves and
transitions make it feel like one cinematic film? Is anything vague that builders would guess at? Compare against house_digest.md's
checklist and teardown.md's DON'T list. Return 'ship' only if nothing must change; at most 15 problems, most important first, each with a
concrete fix.`, { effort: 'max', label: 'devils-advocate', phase: 'Challenge', schema: CRIT })
let revised = null
if (devil && devil.problems.length) {
  revised = await agent(`${CTX}
YOU ARE THE DIRECTOR (revision). Revise ${V}/docs/v2/TREATMENT.md: fix every "must" and the "should" problems that make the film better
(you may reject a "should" with a one-line reason in section 10). Keep it decisive and buildable; keep the section structure. Commit it.
Final message: what changed in 5 lines.
DEVIL'S ADVOCATE (${devil.verdict}): ${devil.summary}
${devil.problems.map((p, i) => `${i + 1}. [${p.severity}] ${p.where}: ${p.problem} -> ${p.fix}`).join('\n')}`, { effort: 'max', label: 'director-revise', phase: 'Challenge' })
}
return { panel, director, devil, revised }

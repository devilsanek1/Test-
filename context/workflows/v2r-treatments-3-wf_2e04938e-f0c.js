export const meta = {
  name: 'v2r-treatments-3',
  description: 'v2 restart: competing film treatments T5 (small-vs-vast) and T6 (retention)',
  phases: [{ title: 'Treatments', detail: 'two writers, two lenses' }],
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
const TASK = (k, slug, lens) => `${CTX}
YOU ARE TREATMENT WRITER T${k} ("${slug}"). Full creative freedom inside the principles. YOUR LENS (push it hard, but the film must still
satisfy every principle and fairness rule): ${lens}
Write a complete treatment for the FINISHED 39.08 s film to ${V}/docs/v2/direction/treatments/T${k}_${slug}.md (at most ~220 lines), concrete
enough that builders can build it without asking:
1. Title; the concept in one sentence; why a scroller stops, understands and shares it (the understanding shift).
2. The world: where the film lives (one coherent world; its sets), the time of day, the palette (a palette from docs/look/palettes.json or a
   new sister palette in the house family, with its roles: hero, dark anchor, at most one pop; warm, never sickly) and why it fits a serious
   story.
3. Cast: her (a SMALL, simple generic figure, never a likeness, never a big model), "Google's staff", Pip the channel mascot, redrawn NEW in this film's design, in EVERY scene (concrete reactions and
   small gags that never mock the people affected or trivialise the topic), people near and far.
4. The opening, frame by frame from frame 0 to 3.0 s (frame 0 = the scene being drawn, then colour; the hook made physical: the expected
   thing, then reality overtaking it at ~2 s; a positive phone-like sound in the first second; the frame-0 words that state the payoff,
   fair and attributed), and how the film loops back to frame 0.
5. The shot list over the whole film, timed to the beat map: for every shot its start/end seconds and words, what we see (foreground, mid,
   background), framing / shot type, camera move, what moves (character action, ambient life), transition in and out (cuts on words or
   pauses, match cuts, camera journeys), the one thing it explains, and where the captions sit. Something new every ~0.5-1 s, a reveal
   every 3-5 s; every frame full and alive at the reference bar.
6. The scale moment (great scale) and the cozy home base: where, how they feel.
7. Sound: the music bed's character and arc; the SFX on visual hits (with times).
8. Fairness and facts: each rule from the beat map and how this treatment satisfies it.
9. Production: everything it must build NEW (sets, cast incl. a new Pip, props, background life, music), the engine primitives and tools it
   uses (paths from toolkit.md), the risks, and how it reaches v1-level finish fast with many builder agents in parallel.
Commit your file. Your final message: the file path and the concept in 3 lines.`

phase('Treatments')
const r = await parallel([
  () => agent(TASK(5, "small-vs-vast", "Scale as the spine: one small person and her voice against vast institutions (a giant tech campus, the Pentagon, a city of offices), the cozy enclosed home against a huge world; the great-scale shot is the turn, and the payoff returns to the small, warm human scale."), { label: 'T5-small-vs-vast', phase: 'Treatments' }),
  () => agent(TASK(6, "retention", "The retention editor's cut: designed from v1's measured drop-off (about 80% gone by 3 s on the first post; the leak is the first 15 s) for the most scroll-stopping first 1 s, 3 s, 5 s and 10 s, relentless visual pacing, open loops that pay off, and a share-worthy last beat, while staying true, fair and beautiful."), { label: 'T6-retention', phase: 'Treatments' }),
])
return { T5: r[0], T6: r[1] }

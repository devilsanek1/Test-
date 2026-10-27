export const meta = {
  name: 'v2r-w1a',
  description: 'v2 restart wave 1 (a): K4 the cast (small simple people like reference 1, her, the ghosts, staff) and K5 a NEW Pip',
  phases: [{ title: 'W1', detail: 'cast + Pip in parallel' }],
}
const REPO = '/home/user/Test-'
const V = REPO + '/video'
const SCR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r'
const CTX = `
PROJECT: video 2 of "What's All the Fuss About?" (Instagram what.the.fuss.is.about; TikTok/Reels/Shorts, vertical 1080x1920), a FINISHED
film at v1's quality or better. Repo ${V} (Remotion). Topic: a former Google DeepMind research engineer told BBC News (21 Oct 2026) she quit
over where Google's military AI work was heading, and says her contract bans her from criticizing Google, for life.
THE OWNER: "No I don't like it [our first cut], let's start from scratch ... let's not do the sketch. Do the video right away, full creative
freedom, but look at our GitHub repo's general direction and principles. NO LIMIT ON TOKENS." Then: "Don't rely on reusable assets." Then:
"don't use big models of people; the people we showed in the first example video are the right direction."
THE DIRECTION IS LOCKED: ${V}/docs/v2/TREATMENT.md ("One Small Window"). Read it IN FULL first: it decides the world, the map, the palette
("10 Canal Mint"), the cast and Pip, every shot V2S1-V2S8, sound, the kit K1-K9, the lanes L1-L7, the waves and the acceptance bar per shot.
Background only: ${V}/docs/v2/direction/house_digest.md, beat_map.md (HEARD word times, e.g. "life" 4.98 s; facts; FAIRNESS rules F/V/A/Q),
teardown.md (v1 / reference 1 patterns; contact sheets in ${SCR}/teardown/), toolkit.md (engine commands). The six treatments are background,
never specs.
HARD RULES (TREATMENT.md section 9 has the full list):
- NO REUSABLE ASSETS: every set, figure, Pip, prop, life element, sound and the music is made NEW for this film. Never import v1's sets
  (src/scenes/**), the v3 kit (src/v3/** except src/v3/film/kit/idle.ts and Pullback.tsx), lib/kit people/placement, the cine generators,
  src/lib/mascot, or anything under src/v2/** / src/entry-v2*.tsx (the dropped first production) or src/v3/film/kit/util.tsx (it loads EMBER).
  TOOLS: lib/Film, World + tod, ShotCam + Layer, Look cascade, UnBuild, useExit, Ink, Fill, sketch, inkComp, persp, time, rng, font, Captions,
  edges, the audio tools, the QA scripts.
- PEOPLE SMALL AND SIMPLE like reference 1 (${V}/assets/ref/reference.mp4): never a big model, a waist-up shot or a face; the legibility floor
  (a story change >= 80 px, a figure carrying one >= 130 px tall).
- FAIRNESS (TREATMENT section 8, beat_map section 4) in every frame. FEEL ALIVE (TREATMENT acceptance bar; docs/look/LIFE_AND_DENSITY.md):
  paused at 216 px beside v1 / reference 1 it is as full; life always on; Pip in every shot.
- Everything in seconds (useTime), deterministic (rng, never Math.random), 60 fps, frame = round(t * 60); camspeed <= 7.5 px/f for long
  flat-ink moves; no opacity, no zoom in a hold. Captions pop; nothing drawn in the caption band y 317-556.
FILES AND OWNERS (TREATMENT section 9): ENGINE = K1 src/v2r/palette.ts + K8 src/entry-v2r-film.tsx, src/v2r/film/**, src/v2r/scenes/index.ts
+ the scene placeholders, the three small optional edits in src/lib/Film.tsx (v1 and v3 must render exactly as before) and
scripts/film_captions.py (backward compatible), public/v2r/voice_words_heard.json. MAP = K2 src/v2r/world/map.ts (+ src/entry-v2r-map.tsx).
K4 CAST = src/v2r/kit/cast/** (+ src/entry-v2r-cast.tsx). K5 PIP = src/v2r/kit/pip/** (+ src/entry-v2r-pip.tsx). K6 CANAL =
src/v2r/kit/canal/** (+ src/entry-v2r-canal.tsx). K7 DC = src/v2r/kit/dc/** (+ src/entry-v2r-dc.tsx). K3 BOARDS + S6 + S7 = lane L5
(src/v2r/kit/boards/** + its scenes). A LANE owns only src/v2r/scenes/<ID>.tsx + <ID>_*.tsx. SOUND (K9 / L7) owns audio/v2r/** and
public/v2r/** except voice_words_heard.json. Every entry imports src/v2r/palette.ts FIRST. A change you need in someone else's file goes in your
report under REQUESTS: one exact line each.
RENDERS: always --gl=angle (5-8x faster). 4 CPUs shared by several agents: --concurrency=2. Stills/sheets at --scale=0.5 and a 0.25 (216 px)
phone-size look beside the teardown's v1 / reference 1 frames; write them under ${SCR}/<your role>/. Typecheck with npx tsc --noEmit (fix
errors in your own files).
GIT: commit only your own paths (git add <paths>, never -A or .), message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
If .git/index.lock exists, wait 5 s and retry. Never push, pull, merge, rebase, reset, stash or checkout (the orchestrator pushes). Public
repo: no emails, no keys, no third-party frames committed.
REPORT: at most 15 lines: what you built (files), what you checked (sheet paths), what is open, then REQUESTS.
`

phase('W1')
const [cast, pip] = await parallel([
  () => agent(`${CTX}
YOU ARE K4, THE CAST AGENT. Wait for ${V}/src/v2r/palette.ts and ${V}/src/v2r/world/map.ts (the engine and map agents commit them early: poll every 60 s for up to 30 min; start with design studies and reference frames meanwhile; if a file never comes, use TREATMENT.md's values through a local module and say so).
First study the people in reference 1: extract 12+ frames from ${V}/assets/ref/reference.mp4 into ${SCR}/cast/ref/ and look at them at 216 px
(their size in frame, head shapes, how bodies simplify to round heads and tombstone torsos, crowds and backs of heads, colour variety, how
few lines). Then build ${V}/src/v2r/kit/cast/ (+ index.ts) per TREATMENT.md sections 3 and 9 (K4): the back-view people generator (hair x coat
x accessory tables, 12-drawings/s walks, sit / read poses, LOD down to fill-only blobs, batched far crowds, never teal; S1's seated rows on the
steps), HER (walk-back, walk-profile, stop-look, look-back, go-in, the French-window silhouette with phone; the teal coat, the bun; never a
face or likeness), the 6 GHOSTS with their age values and the bare outlines (the TREATMENT's exact spec: whole figures, ageing by head value,
no stoop or stick), the staff silhouettes and the blind rig, the reporter, the staffer on the bench, the stranger, the cafe owner. Every
piece: canvas px position/size, an optional build time "at" (ink draws on, then fills), a seed; at every size the shot list uses.
${V}/src/entry-v2r-cast.tsx (palette first): a "KitCast" sheet with every piece at every size + a crowd row at 216 px beside your reference 1
frames. Render to ${SCR}/cast/ (kit_cast.png, people_vs_ref1.jpg, a walk strip). Does it read like reference 1's people? Fix what doesn't.
${V}/src/v2r/kit/cast/README.md (API, sizes, poses). Commit your paths.`, { effort: 'max', label: 'K4-cast', phase: 'W1' }),
  () => agent(`${CTX}
YOU ARE K5, THE PIP AGENT: design and build a NEW Pip for this film ("towpath Pip", TREATMENT.md section 3 and K5): a pebble-round elephant,
leaf ears that fold and flick, a short curled trunk, a three-hair tuft, teddy-bear soles, a short knitted mustard scarf lifting in the wind, its
contour ONE loose continuous stroke per pose with 2-3 gaps, body #9497D8 etc. Read docs/mascot.md for who Pip is (never import src/lib/mascot
or copy its drawing). Wait for ${V}/src/v2r/palette.ts and ${V}/src/v2r/world/map.ts (the engine and map agents commit them early: poll every 60 s for up to 30 min; start with design studies and reference frames meanwhile; if a file never comes, use TREATMENT.md's values through a local module and say so).
Build ${V}/src/v2r/kit/pip/ (+ index.ts): the model, every pose and action TREATMENT.md gives Pip per shot (perch on a bollard, head follows a
target, ears-cover on "life", hop and leap arcs, ride a boat roof, look up, ears down, one ear flick, sit-watch, draw-on for frame 0, un-build),
idle life (blink, ear flick, breathing, scarf lift), sizes 44-120 px. ${V}/src/entry-v2r-pip.tsx (palette first): a "KitPip" sheet (the
character sheet: turnaround, every pose, sizes, against every ground colour of the palette) and a "PipActions" 1080x1920 clip composition
(each action in sequence). Render the sheet and a strip of the actions to ${SCR}/pip/; check charm and readability at 216 px against
reference 1's cat and v1's elephant (the teardown sheets): Pip must read as a lovable, specific character at 44 px and at 120 px. Fix what
doesn't. ${V}/src/v2r/kit/pip/README.md. Commit your paths.`, { effort: 'max', label: 'K5-pip', phase: 'W1' }),
])
return { cast, pip }

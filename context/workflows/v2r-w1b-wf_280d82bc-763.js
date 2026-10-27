export const meta = {
  name: 'v2r-w1b',
  description: 'v2 restart wave 1 (b): K6 the canal kit (Google canal wing, her terrace, water, towpath, boats, the life layer) and K7 the Arlington kit (crane planes, the gate)',
  phases: [{ title: 'W1', detail: 'canal + DC in parallel' }],
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
const [canal, dc] = await parallel([
  () => agent(`${CTX}
YOU ARE K6, THE CANAL KIT AGENT. Wait for ${V}/src/v2r/palette.ts and ${V}/src/v2r/world/map.ts (the engine and map agents commit them early: poll every 60 s for up to 30 min; start with design studies and reference frames meanwhile; if a file never comes, use TREATMENT.md's values through a local module and say so).
Study first how reference 1 and v1 make a world full (${SCR}/teardown/ sheets; docs/look/LIFE_AND_DENSITY.md section 0: many small things,
stacked depth, local colour variety, thin lines, signage). Build ${V}/src/v2r/kit/canal/ (+ index.ts) per TREATMENT.md K6: CanalWing (two
storeys, window states lit / switching / blind / dark, the glass doors + the canopy hand-lettered "Google" (ink, no logo or logo colours),
the planted roof terrace; S1 frontal and close, S2 a receding wall + stepped tiers as ONE batched path with LOD, S7 its forecourt), Terrace
(her brick terrace, French window, teal door, balconies, pots, string lights, chimney pots, aerials), Water, Towpath (lamps with lightAt,
railings, benches), Steps (S1's seated public slots), Narrowboat (sage cabin, plum gunwale, smoke; the cafe boat and its deck; S7's Wiper),
FarRoofs (seeded rows, gasholders, viaduct), Newsstand, and the LIFE LAYER (birds on wires lifting off, ducks, a heron, smoke, steam, leaves,
walkers / joggers / cyclists / dogs slots for K4's people, window switching, string lights), all at every size the shot list uses, with
slots where K4's people and K5's Pip plug in; positions from map.ts. ${V}/src/entry-v2r-canal.tsx (palette first): a "KitCanal" sheet and
"CanalSample-S1/S2/S4/S8" 1080x1920 sample frames (sets assembled at the map's positions, people as simple placeholders until K4 exists).
Render to ${SCR}/canal/ and put the samples at 216 px beside the teardown's v1 / reference 1 frames (canal_vs_refs.jpg): as full, specific
and layered? Fix what isn't. ${V}/src/v2r/kit/canal/README.md. Commit your paths.`, { effort: 'max', label: 'K6-canal', phase: 'W1' }),
  () => agent(`${CTX}
YOU ARE K7, THE ARLINGTON KIT AGENT. Wait for ${V}/src/v2r/palette.ts and ${V}/src/v2r/world/map.ts (the engine and map agents commit them early: poll every 60 s for up to 30 min; start with design studies and reference frames meanwhile; if a file never comes, use TREATMENT.md's values through a local module and say so).
Build ${V}/src/v2r/kit/dc/ (+ index.ts) per TREATMENT.md K7 and shots V2S5-V2S6: the public viewpoint terrace + canopy, blossom with a
4-frame burst, the SIX crane planes for the pull-back (the Pentagon in 3/4 on correct ground-quad perspective math, true to the real
building's five rings and courtyard; lawns, parkway, the Potomac, the low white city, the Washington Monument obelisk, the cloud bank), built
for src/v3/film/kit/Pullback.tsx (PullLayer, planeMat, cubicBezier: read it), the scale cues (playbook: a world that keeps going into haze in
flat steps, the landmark huge yet far, tiny anchors: birds, moving cars, small people where fairness allows; no figures in uniform, no
aircraft, no weapons, no flags as villain signs), and S6's gate: the facade band, the fence with the tall corner post, tulip beds, the sliding
service door "CLASSIFIED · AUTHORIZED PERSONNEL ONLY". ${V}/src/entry-v2r-dc.tsx (palette first): a "KitDC" sheet, a "CraneEnd" 1080x1920
end frame of S5 and a "CraneMove" clip of the move with the TREATMENT's ease (check every frame's speed at 60 fps). Render to ${SCR}/dc/ and
put the end frame at 216 px beside the teardown's scale frames (v1's scale shots; the Arcane-style great-scale cues in
docs/look/CINEMATIC_GUIDE.md): does the scale feel GREAT? Fix what doesn't. ${V}/src/v2r/kit/dc/README.md. Commit your paths.`, { effort: 'max', label: 'K7-dc', phase: 'W1' }),
])
return { canal, dc }

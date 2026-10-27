export const meta = {
  name: 'v2r-w0',
  description: 'v2 restart wave 0: K1 palette + K8 film shell + engine edits, and K2 the map contract with the S1 scale sheet',
  phases: [{ title: 'W0', detail: 'engine + map in parallel' }],
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

phase('W0')
const [engine, map] = await parallel([
  () => agent(`${CTX}
YOU ARE THE ENGINE AGENT (K1 + K8 + the three engine edits). Work in ${V}. Template for wiring (patterns only): src/entry-v3-film.tsx,
src/v3/film/Film3.tsx, src/v3/film/palette.ts, docs/G5_BLOCKING.md sections 1, 5, 6.
1. FIRST, commit within ~10 minutes (four kit agents wait for it): K1 ${V}/src/v2r/palette.ts exactly per TREATMENT.md section 2 and K1
   (role tokens with the exact hex values, rewriting the house theme tokens in place at module load, the tod states golden / low sun /
   April morning / sunset, the caption tones, and problems()). Then refine it.
2. ${V}/public/v2r/voice_words_heard.json: voice_words.json with the beat map's heard times where they differ and "can'tveto" split into
   "can't" + "veto" (durationSec 39.08).
3. The three engine edits TREATMENT.md section 9 names, as OPTIONAL props (v1 and v3 render exactly as before: prove it with one before/after
   still each): Frame0Text.source; Frame0Text.keys + spoken: 'first'; a film_captions.py spelling override ("criticising" for the last token).
4. K8: ${V}/src/entry-v2r-film.tsx (palette import first; "Film2R" 1080x1920 at 60 fps, 2345 frames; "Film2RShot" {id}; "Film2R-<ID>" per
   shot; "Film2RBare" without captions, frame-0 words, credits or label), ${V}/src/v2r/film/Film2R.tsx (the Film3 pattern: voice 'v2/voice.wav',
   cues from ${V}/public/v2r/cues.json when it exists, pop captions, the frame-0 block per TREATMENT.md section 4, per-shot credits per
   section 8, a draftLabel prop ON for review renders and OFF for the final, transitions per the shot list, the loop), hand-written
   scenes.json (V2S1-V2S8 with TREATMENT.md's times and transitions), captions_pages.txt -> captions.json (scripts/film_captions.py with the
   heard words; quotes exact), and a placeholder per shot (src/v2r/scenes/V2S<n>.tsx: a palette card with the id, words and picture text,
   "Lane: replace this file") registered in src/v2r/scenes/index.ts.
5. Smoke test: tsc; render Film2R at --scale=0.25 --gl=angle --concurrency=2 to ${SCR}/engine/smoke.mp4; scripts/qa/gate_check.py on it;
   look at a contact sheet.
6. ${V}/docs/v2/BUILD.md (<= 80 lines): the wiring, the scene contract (default export, useTime local seconds, captionTone export, the
   first shot's t < 0 bare state, Wiper / matchcut hooks), ownership, preview commands with --gl=angle, the gate check. Commit your paths.`,
    { label: 'engine', phase: 'W0' }),
  () => agent(`${CTX}
YOU ARE THE MAP AGENT (K2: the contract every lane and kit agent builds to). Work in ${V}. Write ${V}/src/v2r/world/map.ts exactly from
TREATMENT.md (sections 2-5 and 9): the map (the canal east-west, every place in order), the shared spots (W, W2, SUN0-SUN2, B, the board
bollard, Pip's seats per shot, the S2 window list with each window's position and size, the ghost-row spec with every ghost's position, size,
value and timing, the match points both lanes of every cut must hit), shot ids V2S1-V2S8 with their times, the S1 SCALE SHEET (the lens,
px/m on her line and on the facade, every S1 size derived from it), the legibility floor, the caption band, the UI zones. Typed, documented,
one source of truth; numbers only (no drawing). COMMIT A FIRST VERSION WITHIN ~15 MINUTES (kit agents wait for it), then complete it.
Then ${V}/src/entry-v2r-map.tsx (palette import first, once src/v2r/palette.ts exists: poll) with a "MapContract" composition: for each shot
a 1080x1920 frame drawing the contract as labelled boxes, lines and points over the palette's sky/ground (no art), so builders and critics can
overlay it; render the eight frames at 0.25 to ${SCR}/map/contract.jpg and check every number against TREATMENT.md (sizes above the
legibility floor, nothing in the caption band, key reads in x 120-880 / y 290-1250, Pip never in the band or the right rail). Write
${V}/src/v2r/world/README.md (<= 50 lines). Commit your paths.`, { label: 'map', phase: 'W0' }),
])
return { engine, map }

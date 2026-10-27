export const meta = {
  name: 'v2r-sound-draft',
  description: 'v2 restart sound (K9/L7 draft): a NEW music bed and SFX on the beat map, a music director critique, one revision',
  phases: [{ title: 'Sound', detail: 'compose + design, critique, revise' }],
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

phase('Sound')
const draft = await agent(`${CTX}
YOU ARE THE SOUND AGENT (composer + sound designer; K9 / L7 draft). Make NEW audio for this film only (never the house beds
audio/music_*.wav). Read TREATMENT.md section 7 (the bed's character and arc, every SFX with its time; the hook has NO music, one tick per
ghost at one pitch), the beat map (heard times, temperatures, pauses), docs/sound_plan.md and docs/sound_credits.md (machinery + licences),
the master brief's music rule (subtle, atmospheric, supportive; the playbook: cinematic but subtle at the start; a positive phone-like sound
of our own design in the first second: TREATMENT puts the exit ding at 0.45 s; -14 LUFS / -1 dBTP; the voice always on top). The CC0
libraries are downloaded in /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/sound/dl (audio/tools/common.py,
SOUND_SAMPLES); audio/tools has the machinery (tools only).
1. Compose the bed for exactly 39.08 s in audio/v2r/bed.py -> public/v2r/music_bed.wav (48 kHz), its arc on the beat map and TREATMENT.md
   (silence/air under the hook, the scale swell at the crane, the turn, the payoff, the end flowing into the start for the loop), out of the
   voice's way (no busy mids under speech).
2. Design every SFX TREATMENT.md lists, new, in audio/v2r/sfx.py -> public/v2r/sfx/*.wav, and public/v2r/cues.json = [{src: "v2r/...", t,
   gain, note}] on the heard times (the bed included at t 0).
3. Premix voice (public/v2/voice.wav) + bed + cues in audio/v2r/premix.py -> ${SCR}/sound/premix.wav; measure integrated loudness, true peak
   (pyloudnorm), the voice-to-bed ratio under speech and the 1-4 kHz balance; set gains/ducking until the voice is clearly on top at
   -14 LUFS / -1 dBTP. Write docs/v2/SOUND.md (<= 70 lines: the bed's idea and arc, every cue with time and reason, the mix numbers,
   licences). Commit your paths.`, { label: 'sound', phase: 'Sound' })
const crit = await agent(`You are a MUSIC DIRECTOR and re-recording mixer for short documentaries. Judge the draft audio of a 39 s vertical explainer:
${V}/public/v2r/music_bed.wav, ${V}/public/v2r/sfx/, ${V}/public/v2r/cues.json and the premix
/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/sound/premix.wav, against ${V}/docs/v2/TREATMENT.md
section 7, ${V}/docs/v2/SOUND.md and the beat map. You cannot listen, so analyse: render spectrograms and loudness curves (librosa/pyloudnorm/
matplotlib) to PNGs and look at them; check the voice band under speech, the bed's dynamics against the arc, where SFX land vs the heard
word onsets, clipping, the loop seam (the last 0.5 s into the first 0.5 s), anything harsh (sibilant highs, boomy lows) or cheap-sounding
(pure sine tones, obvious synthesis, static loops), and whether the first-second sound reads as a positive phone-like cue. Write your
findings as a numbered list (most important first, each with a concrete fix) in your final message, at most 25 lines.`, { label: 'music-director', phase: 'Sound' })
const rev = await agent(`${CTX}
YOU ARE THE SOUND AGENT (revision). A music director reviewed your draft. Apply every fix that makes it better (say why for any you skip),
re-render the bed, SFX, cues and the premix, re-measure, update docs/v2/SOUND.md. Commit your paths.
YOUR DRAFT REPORT:
${draft || '(missing)'}
MUSIC DIRECTOR:
${crit || '(missing: do your own spectral check)'}`, { label: 'sound-revise', phase: 'Sound' })
return { draft, crit, rev }

export const meta = {
  name: 'hook-ideas',
  description: 'Two independent hook doctors propose ranked, buildable changes to make the first 2 s / 5 s / 10 s of the film as hooky as possible',
  phases: [{ title: 'Ideas', detail: 'retention editor + motion director, independently' }],
}
const ROOT = '/home/user/Test-/video'
const FR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/hook/now'
const CTX = `Project ${ROOT}: a 55 s vertical (1080x1920) hand-drawn ink explainer for TikTok/Reels about a PHP security bug, comp "Main". THE FIRST 2 s AND FIRST 5 s DECIDE WHETHER PEOPLE STAY. The owner wants the opening (0-10 s) as hook-powerful as possible; later scenes may keep small quirks.
Voice (word: start s): read assets/timing.json for 0-10 s (it starts: 'Governments' 0.19 ... 'shut down' ~1.7 ... 'a bunch of their own websites on purpose,' 2.2-4.3 ... 'because of this bug' 4.7 ... 'where hackers could take over a site without a password.' ... 'It's in PHP,' 8.6). Captions are drawn by the engine in the sky band (y 280-570) - not your concern.
Current picture: frames every 1/3 s of the first 10 s at half res in ${FR}/ (f00000.png = frame 0). Scenes: S01 = 0-4.715 s (Government Plaza: screens / power-button sun go off, shutters, 'back soon' tags, then a fast dive into govB's door), S02 = 4.715-8.393 (the blueprint board: lock diagram, a hand, scissors/key, 'no password' callout), S03 from 8.393 (bare plan -> street). Code: src/scenes/Scene01.tsx + src/scenes/scene01/**, src/scenes/Scene02.tsx + scene02/**. Notes: docs/scenes/S01.md, S02.md (skim the top). The style: docs/BRIEF.md 'CINEMATIC DIRECTION' + refs assets/ref/f_5.5.png, assets/ref2/f_1.png, f_12.png (Arcane-like scale, but nuanced). docs/CREATIVE_BRIEF.md lines 35-65 (hook guidance).
HARD CONSTRAINTS: the film loops: S12's last frame must equal S01's frame 0 (S12 rewinds onto it), so frame 0's composition can change only if S12's tail follows (say so); keep the hand-drawn ink style, no opacity fades, no new text beyond short labels; keep every beat on its word; the voice and timing are fixed. Changes must be buildable by one engineer in ~1 hour each in the existing Remotion code.
You may render more frames: node scripts/render-frames.mjs Main <dir> <film seconds,...> --scale=0.5 --concurrency=2. Do NOT edit any files.`
const SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', description: '3-5 sentences: what the opening does to a scrolling viewer at 0-1 s, 1-2 s, 2-5 s, 5-10 s' },
    changes: { type: 'array', maxItems: 8, items: { type: 'object', properties: {
      window: { type: 'string', enum: ['0-1s', '1-2s', '2-5s', '5-10s'] },
      scene: { type: 'string' },
      change: { type: 'string', description: 'exactly what to build (positions, timings on words, motion), concrete enough to implement' },
      why: { type: 'string' },
      impact: { type: 'number', description: '1-5 on retention' },
      cost: { type: 'number', description: '1-5 build effort/risk' },
    }, required: ['window', 'scene', 'change', 'why', 'impact', 'cost'] } },
  },
  required: ['verdict', 'changes'],
}
const lenses = [
  { key: 'retention', brief: 'You are a top TikTok/Reels RETENTION EDITOR who has cut hundreds of viral explainers. Judge as a scrolling viewer with sound off and sound on: what stops the thumb in the first 0.5 s, what promise is made by 2 s, what escalates 2-5 s, what pays off by 10 s. Dead or repetitive frames are your enemy.' },
  { key: 'director', brief: 'You are a MOTION DIRECTOR / cinematographer (Arcane, Kurzgesagt, top motion-design reels). Judge camera energy, scale, contrast, focal clarity, the size of the key events on a phone, and rhythm against the voice. Propose motion and staging changes that land the story beats harder in this exact style.' },
]
phase('Ideas')
const out = await parallel(lenses.map(l => () => agent(`${CTX}\nLENS: ${l.brief}\nLook at every frame in ${FR} (and render more where needed). Propose at most 8 changes ranked by impact/cost, most valuable first; prefer few strong changes over many small ones.`, { effort: 'max', label: `ideas:${l.key}`, phase: 'Ideas', schema: SCHEMA })))
return out

export const meta = {
  name: 'v3-g3-animatic-v2-simple',
  description: 'v3 G3 v2: retime the first animatic to take 4 and apply only the reworked guide\'s targeted environment upgrades (S1 rise-over reveal as the one scale move; S2-S4 only where natural)',
  phases: [{ title: 'Storyboard', detail: 'one artist, targeted edits, still checks' }],
}

const ROOT = '/home/user/Test-/video'
const V3 = ROOT + '/docs/v3'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'

phase('Storyboard')
const r = await agent(
  `You are our storyboard artist. Task: produce the v2 sketch animatic for video 3 by making TARGETED edits to the first animatic, nothing more. The owner: "our videos are very good; build on that incrementally: polish, better angles, scene composition, lighting, cinematic shots and camera movements, but targeted, with high confidence. Don't do a complicated one."

Inputs:
- The first animatic (good story in pictures, "one room": a lamp-lit desk nook whose frosty window shows the world, a price line on the fogged glass, one push through the window to a scale reveal of the data center, home to the price tag): ${V3}/archive/g3_v1/animatic_v1.json and its shot list ${V3}/archive/g3_v1/storyboard_g3_v1.md. It is timed to an OLD voice take.
- The NEW voice timings (owner's take 4, already wired into public/v3/voice.wav): ${ROOT}/public/v3/voice_words.json (words with start/end seconds; total 41.38 s). Line starts: "Buying" 0.35, "Well," 3.87, "Which is backwards" 6.03, "But this past year" 11.71, "Mostly" 16.83, "They pay more" 22.91, "Which means" 25.47, "Normally" 31.55, "So that's how" 36.59, ends 40.9.
- The reworked guide (environment only, 4 shot types tied to v1): ${ROOT}/docs/look/CINEMATIC_GUIDE.md. S1 Rise-over reveal is the only unanimous, highest-confidence type: use it for the video's ONE big scale move (the data center reveal, on "AI data centers… by the mountain"). Use S2 (sun behind the roofline), S3 (big sky, one landmark) or S4 (low-horizon breather) only where a shot already wants it and it is a clear improvement; otherwise leave shots as they are.
- The animatic tool now supports true parallax per element ("f": 1 = with the camera, 0 = fixed far plane, >1 foreground; the end frame is exact for every f), eases "out" | "in" | "inout" | "linear" | "unveil" | "inQuad", camera roll "r", and transitions incl. "dip" | "flash" with "dur". Types: ${ROOT}/src/v3/SketchReel.tsx.

Do:
1. Retime every shot to the new word timings (cuts on the same words as before), so shots tile 0 to 41.38 with no gaps; update "words" from voice_words.json unchanged, "durationSec": 41.38, "frame0Until": 3.6, "label": "v3 G3 animatic v2"; keep the cart pop at 0.05 s and move the other sounds to the same words.
2. Rebuild the scale shot as S1 (rise over a near wall/ledge with real parallax planes f 1.3 / 1 / 0.5-0.65 / 0.15 / 0, ease-out, landing then a short hold), keeping its story role.
3. At most 2-3 other shots get an S2/S3/S4 upgrade, only where it clearly helps. Note each change in the shot's "note" (e.g. "S1 · rise-over reveal | ...").
4. Keep caption band y 317-556 flat and key action in x 60-940, y 620-1560.
Write ${ROOT}/public/v3/animatic.json, and ${V3}/storyboard_g3.md (concept in 2 sentences; shot table: shot, time, what we see, camera, transition, guide type if any, and a "changed vs v1" column).
Check: render up to 8 stills at key moments, including 3 frames across the S1 move: cd ${ROOT} && npx remotion still src/entry-v3.tsx Animatic ${SP}/sbv2_<n>.png --frame=<f> --scale=0.25 (30 fps). Look and fix. Don't render a video. Don't commit. Return at most 10 lines: what changed and the S1 shot's numbers.`,
  { effort: 'max', label: 'storyboard-artist', phase: 'Storyboard' })
return r

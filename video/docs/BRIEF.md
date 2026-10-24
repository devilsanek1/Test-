# Project brief: "php2shell" short-form explainer

## Goal
A 70.7-second vertical video (TikTok / Instagram Reels / YouTube Shorts) built on the supplied voiceover,
in the visual style, animation language and motion design of the supplied reference video.
Quality bar: top-tier editorial motion design that people rewatch and share. Every frame should be worth pausing on.

## Inputs (all in this repo)
- `assets/vo.mp3`: voiceover, mono, 70.687 s (also copied to `public/vo.mp3` for Remotion)
- `assets/vo_words_raw.json`: ASR word timestamps (Parakeet TDT). Starts are accurate (~±40 ms); ends are approximate.
  Known ASR glitches: digits got glued to the previous word: "about7", "of10", "for14", "in45", "about22",
  plus "aversion" (= "a version"). `assets/timing.json` (made by the timing stream) is the corrected source of truth.
- `assets/ref/reference.mp4`: style reference, 1080x1350, 30 fps, 31.5 s
- `assets/ref/frame_0001.jpg ...`: reference frames at 10 fps (frame N = t of (N-1)/10 s)
- `assets/ref/sheet_2fps_a.png`: 2 fps contact sheet of the whole reference; `caproll.png`, `flip.png`, `ending.png`,
  `trans1.png`: dense strips of key transitions; `f_*.png`: full-res stills at t = * seconds

## Transcript
Government websites in four countries just switched themselves off. Nobody hacked them. They were fixing a security
bug in PHP, the programming language behind WordPress and about 7 out of 10 websites. Fixing a bug like that takes two
steps. First, you find it. Then, you fix it everywhere. You'd think finding it is the hard part, right? And for 14
years, nobody did. Then, in August, two security teams using AI tools found it and quietly told the people who make
PHP so a fix could be ready before anyone else knew. Except, the details of the bug leaked online hours before the fix
came out. Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45
minutes, and millions by evening. Nobody knows yet how many got in. So now comes step two, the slow one. Someone has to
install that fix on every site, and there are about 22 million copies of PHP out there that could be hit. If a site
can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did.
And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore. For those, it's
switch off or hope the hosting company sorts it out.

## What the reference does (first-pass observations; the style/motion bible refines these)
- Layout: white "polaroid" card on a flat mint background (~#A5C9BC). Illustration panel in the upper card, a hand-lettered
  caption (1–2 centered lines, dark brown ink) below it. A flat orange disc ("the sun", ~#EC6A2F) sits top-center,
  overlapping the panel's top edge. It appears in every scene and is the visual anchor.
- Illustration: loose architectural ink sketch. Thin dark-brown lines that overshoot their corners, flat color fills
  slightly misregistered from the linework, limited palette (mint, deep teal, peach/salmon, cream, warm tan, orange accent).
  Dense, satisfying detail (crowds, windows, bikes, trees, birds on wires).
- Recurring mascot: a small orange striped cat in every scene, often watching, reacting or moving between scenes.
- Animation: scenes build progressively while the narrator speaks. Linework draws on, fills arrive a beat later, objects
  pop in with small overshoot, people walk or slide in, crowds fill up. Nothing is ever static for long.
- Captions: word-group captions synced to the VO. The next line rolls up from below as the old one rolls out the top.
  Keywords get a peach highlight box that wipes in left-to-right as the word is spoken.
- Transitions: (a) match-cuts on persistent objects (the bulletin board and the cat stay put while the world changes
  around them); (b) the card tilts a few degrees and does a 3D Y-axis flip to the next scene (edge-on at the midpoint);
  (c) "un-build": colors drain or collapse, leaving bare line art. The video ends on the opening line art, so it loops.
- Camera: subtle parallax pans; the sun can move (it slides and "sets" behind a wall).

## Format decisions
- Output: 1080x1920 (9:16), 30 fps primary. All animation code must be written in SECONDS (time-based), never raw frame
  counts, so we can also render 60 fps.
- Platform safe zones (TikTok/Reels UI): keep captions and key action inside x 90–930, y 160–1480. The bottom ~400 px is
  covered by platform UI. Background or decoration only there.
- The card is a portrait polaroid centered horizontally and placed high (roughly x 60–1020, y 150–1560). Final geometry
  comes from the style bible.
- Hook: the first frame must already be visually arresting (never a blank card). The ending must loop seamlessly into
  frame 1.

## Tech stack (decided)
- Remotion 4.0.538 (React + SVG), TypeScript. Project root: `/home/user/Test-/video`.
- Browser: Remotion is configured (`remotion.config.ts`) to use `/opt/pw-browsers/chromium_headless_shell-1243/...`. Do NOT download browsers.
- Render a still: `npx remotion still src/index.ts <CompositionId> previews/<name>.png --frame=<n>`
- Render video: `npx remotion render src/index.ts <CompositionId> out/<name>.mp4`
- Python 3.13 with numpy, scipy, librosa, opencv-python-headless, Pillow. ffmpeg is installed.
- Network: npm registry, PyPI and github.com (incl. release downloads) work. Hugging Face, jsDelivr/unpkg CDNs and most
  other hosts are blocked. Get fonts from npm `@fontsource/*` packages.
- The machine has 4 CPUs and is shared with other agents. Render stills or short ranges while iterating, not full videos.

## File ownership (parallel agents: stay inside your lane)
- `src/lib/**`: engine/toolkit stream only (primitives, captions, card, transitions, theme).
- `src/scenes/SceneNN.tsx` (+ optional `src/scenes/sceneNN/**`): only the agent assigned scene NN.
- `src/Root.tsx`, `src/Main.tsx`: the orchestrator (or the engine stream during setup).
- `docs/*.md`: the stream named in each file.
- `audio/**`: the sound stream.
Never delete or rewrite another lane's files. If you need a toolkit change, write the request in your final report.

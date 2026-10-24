# Project brief: "php2shell" short-form explainer

## Goal
A 70.7-second vertical video (TikTok / Instagram Reels / YouTube Shorts) built on the supplied voiceover,
in the visual style, animation language and motion design of the supplied reference video.
Quality bar: top-tier editorial motion design that people rewatch and share. Every frame should be worth pausing on.

## VOICEOVER v2 (latest): the user replaced the voice with a new take: `assets/vo_v2_eleven.wav` (ElevenLabs, WAV 48 kHz,
lossless, 77.76 s; same script, slower pacing, about +7 s by the end). `assets/timing.json` is being rebuilt for it (the old
take's timing is kept as `assets/timing_v1.json`). Anything timed to the old take (storyboard, cues) is mapped onto the new
one with `scripts/timewarp.py` (word-anchored, piecewise-linear). The video is now ~78 s long.
APPROVED BY THE USER: the treated voice (`audio/vo_clean.wav`, chain in `audio/tools/vo_clean.py`) and the subtler
cinematic bed (`audio/music_cinematic.wav`; near-silent first ~10.7 s). Don't change the voice chain without asking.

## BALANCE NOTE (from the user, latest; read this first): "Don't overdo it. It should be nuanced, and we still target TikTok / Reels."
How to apply the cinematic direction below with restraint:
- The BASE stays the references' look and feel: bright, warm, legible, charming editorial illustration with snappy
  TikTok pacing. Reference 2's immersive eye-level full-bleed framing is the everyday baseline that makes the viewer
  feel a little small. That is most of the video.
- Reserve true Arcane-scale moments for 2–3 story peaks (e.g. the hook, the attack/scale reveal, the closing beat).
  Everywhere else, scale is a seasoning: a taller building, a deeper street, a sun a bit bigger, a slightly lower camera.
- Camera: mostly gentle (5–15% push-ins, light parallax). At most one or two big reveal moves in the whole video.
- Light and time of day: mostly day and golden hour. Dusk or night only where the story earns it (lights switching off,
  "by evening"). Never murky or trailer-dark; captions always crisp and readable on a phone.
- Tone: a smart, curious, slightly urgent explainer, not a dramatic movie trailer. Clarity and the hook beat spectacle.
- Pacing stays TikTok-native: the hook lands in the first second, something meaningful changes every ~1–2 s, no
  lingering establishing shots.

MEASURED FULL-BLEED NUMBERS: `docs/style_bible_ref2.md` (reference 2 measurements + the two-tier scale playbook in its
section 8) is authoritative for full-bleed framing and wins over the guesses in the section below. Key values (already in
`src/lib/theme.ts`): captions Patrick Hand 98 px, baselines y 387 / 510, centred x 520, max line 850, ink on day sky and
white on night sky; horizon ~0.40 H (y 768); sun r 94–120 (peaks only: 270–490); day sky #ACD1BF, night #588077; every
shot carries a gentle 3–8% zoom over 1–2.5 s. Decisions: keep NO fades (reference 2's cross-dissolves are not adopted);
caption MOTION follows reference 1 (scroll/rise/wipe) with reference 2's size, positions and colours; the sun-as-character
beats from reference 1 are used sparingly.

## CINEMATIC DIRECTION (from the user; overrides the card layout and anything below that conflicts; apply with the balance note above)
The user's note: some videos make the viewer feel big (reference 1: we look down at a little diorama on a card),
others make the viewer feel small. We want SMALL: the sense of scale of Arcane's cinematic shots.
References: `assets/ref2/` (same artist family as reference 1 but full-bleed and immersive: `sheet.png`, `f_*.png`,
`frame_XXXX.jpg` at 5 fps, `reference2.mp4`) and `assets/ref_cinematic/arcane_collage.jpg` (Arcane stills).
1. FULL-BLEED world. No polaroid card. The 1080x1920 frame is a window into the world (like reference 2). Keep the
   reference's ink style, palette, mascot role, captions, highlight boxes and motion grammar (pops, draw-ons, no fades).
2. Captions live in the SKY, upper third, centered on x=540 (line-1 baseline ~y 330, line-2 ~y 426, 82 px Patrick Hand,
   max width ~860). Dark ink on light skies; white/cream text on dark dusk/night skies (reference 2 does exactly this).
3. Make the viewer feel SMALL in every scene:
   - Scale contrast: tiny people and a tiny mascot against something colossal (monumental buildings, an endless city to
     the horizon, a wall of windows, a vast server hall, a sky-filling sun). One colossal element per scene, minimum.
   - Camera at eye level or lower, looking out or up. Deep perspective with a clear vanishing point. Towers rise into the
     sky. Back-view figures facing vast vistas (Arcane's signature shot; reference 2's crowd).
   - Depth: 4–6 layers with atmospheric perspective (far layers flatter, closer to the sky color, thinner or no ink).
     Foreground framing elements cropped by the frame edge (figures, wires, string lights, branches) push the world back.
   - Light as drama, in FLAT style: a huge low sun on the horizon behind silhouetted skylines; time of day that evolves
     (day, golden, dusk, night with lit windows); light shafts as flat translucent polygons; glows as stepped concentric
     flat discs; silhouettes as fill-only dark shapes; rim light as one-sided lighter edge strips. No blur or gradients.
   - Camera with weight: slow push-ins, crane/tilt-ups that reveal height, pull-backs that reveal scale (one door becomes
     a million doors), lateral moves with multiplane parallax. Long, smooth in-out eases (2–6 s). The build animation
     density inside the frame stays high (>= 5 events/s) so grandeur never becomes slow.
4. Transitions suit full-bleed: continuous camera moves that carry one scene into the next, match-cuts on the sun or the
   horizon, foreground wipes (something passes close to the lens), and the un-build to bare line art for the loop.
   The 3D card flip is retired.
5. Safe zones for full-bleed: platform UI covers the top ~180 px, the bottom ~400 px and a right rail (x > 950,
   y 900–1500). Keep captions and key action inside x 90–990, y 200–1480; the bottom of the frame holds ground and
   foreground only.
The sun in reference 2 is about r 150 at 1080 wide and sits on the horizon, setting as the video goes on.

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

## What the reference does (first-pass observations)
AUTHORITATIVE SPECS NOW EXIST, and they win over the notes below: `docs/style_bible.md` (measured look),
`docs/motion_spec.md` (measured motion and sync rules), `assets/timing.json` (VO timing), `docs/mascot.md` (mascot API).
Key corrections from measurement: there are NO opacity fades anywhere (everything pops, scales, wipes or slides); the
camera never pans (one push-in only); the sun is a character (beat pulses, bounces on words, hops with squash and stretch
across transitions); the mascot crosses every transition; target at least 5 visual events per second and no gap over
1.0 s; the reference audio is voice only (no music, no SFX).

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

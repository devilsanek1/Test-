# Animatic practice in motion design / explainer studios (research, 2026-10-26)

Lane: the mograph/explainer-studio pipeline, the industry closest to our G3. **VERIFIED** = primary page fetched or several
independent sources agree; **REPORTED** = one secondary source. Sources numbered at the end.

## 1. The standard pipeline and why the animatic is a timing contract
- Common stage order: script -> VO (scratch or final) -> boards -> animatic -> style frames -> design/production boards ->
  animation, with a client sign-off at each gate; style frames sometimes precede the animatic [1][2]. VERIFIED.
- The animatic is the storyboard "cut to the recorded (or scratch) voiceover at real duration", delivered with burnt-in
  timecode and shot numbers; scratch VO on a laptop mic is acceptable [1]. VERIFIED.
- **Timing contract:** "once signed off, shot durations are locked". Revision rounds narrow: round 1 may change shot durations
  and order, round 2 only "durations by under 1 second". After the lock, "feedback against a locked layer gets priced as a
  change request, not absorbed" — fixing a drag later means re-timing keyframes across many layers, re-rendering, possibly
  re-recording VO [1]. VERIFIED (primary page; the lock itself agreed across [1][2][6]).
- What it contains (boords, primary): rough sketches not finished art; "a duration for each frame, matched to how long the
  shot will run on screen"; scratch VO/music/SFX so timing is judged against audio; its goal is to "check pacing and get the
  flow approved before animation or filming starts" [3]. VERIFIED. Secondary guides add rough transitions and camera moves
  to the typical contents [6]. REPORTED.
- Boardomatic vs animatic: a boardomatic is frames on a timeline over VO, nothing moves; an animatic adds motion (camera
  pushes, element moves, character movement). Tight budgets merge board+animatic into one boardomatic pass [4][5]. VERIFIED.
- School of Motion's animatic recipe is 3 steps: lay the art boards on the timeline, sync to music/VO, then "create a simple
  animation for your main subject or key elements"; it communicates "with minimal viable effort" the timing and "what will
  happen, where and when", and "should serve as your guide during production" [2]. VERIFIED.

## 2. Named studio processes
- **Kurzgesagt** (own site): research -> script ("about a dozen drafts") -> a sketch phase that decides "the best visual
  metaphors and ideas for each scene" before any illustration -> illustration -> narration sets the animation timing ->
  animation -> composed score [7]. VERIFIED. Scale: ~1200+ hours and ~200 unique assets per 10-min video [8]. REPORTED.
- **TED-Ed**: the freelance animator receives the script and the finished VO, then owns "everything from design and
  storyboarding through to the final edit and sound design" [9] (VERIFIED, primary); episodes of the Ada series ran
  storyboards -> script lock -> VO + animatics -> combine, ~8-9 weeks per episode with 4 animators [10] (REPORTED). A
  student TED-Ed team described "constantly updating the animatic" as the (unglamorous) heart of production — the animatic
  is the living master document every change lands in [11]. REPORTED.
- **Buck**: for "Come Together", they "animated the whole piece in 3D first for exact timing", then designed/executed the
  final craft against that previs — motion and timing decided in a rough pass before design [12]. REPORTED.
- **Ordinary Folk** (own site): script -> design (sketches and storyboards shared as the work develops) -> animation; the
  score is composed "once there is an animatic" [13]. VERIFIED. On their SOM podcast, the point is made that animators must
  design "how they get from one style frame to the next", not only the frames themselves [14]. REPORTED.
- **Style frames carry the look/density signal, not the animatic.** A style frame is "a fully rendered, final-quality
  still (or a very short clip)" — grade "applied, not a rough approximation" — approved before animation precisely because a
  client "genuinely couldn't tell how the palette would read in motion until they saw it in motion"; a disagreement settled
  here "never gets the chance to become a mid-project fire drill" [15]. VERIFIED (primary). Storyboards settle structure,
  style frames settle look; most projects run both gates before animation [15][16]. VERIFIED.
  => The industry does NOT ask the animatic to predict finish density; it pairs the rough timed reel with near-final stills
  (and short motion tests) so the client approves story/timing AND look/density before build. This is the fix for our v3
  "G3 approved, G5 too empty" failure.

## 3. Transition grammar (what joins scenes, and what the board must decide)
From School of Motion's transitions tutorial [17] (VERIFIED, primary) plus film-grammar sources; no explainer-specific
standard catalogue exists — these are film devices applied in AE (honest gap).
- **Hard cut** — default; "impact", re-timing to a beat, alternating viewpoints. Decide: nothing but the composition change.
- **Cut on action** — an action begun in shot A completes in shot B; a "visual bridge ... leaving the audience to complete
  the story"; also hides/reveals information. Decide at board time: the same action, split across the cut, moving in the
  same screen direction. VERIFIED.
- **Match cut / graphic match** — a shared "compositional element" is "an anchor for the viewer"; says "an object passing
  through time" or "the relationship between two different objects"; cut at the element's "fastest movement". Decide: the
  anchor's silhouette, screen position and scale match in both panels [17][22][26]. VERIFIED.
- **Shape morph** — one icon becomes another ("this IS that" / transformation); "the most complicated" device [17].
  Practitioners often fake it: ramp velocity (e.g. 95% influence) and cut at peak speed instead of true-tweening the
  shapes [21][22]. VERIFIED (two sources agree). Decide: the two shapes, a shared centre, the peak-speed cut point.
- **Dynamic / infinite zoom (scale-through)** — the camera pushes into a sub-frame (window, screen) that contains or
  becomes the next scene; says "going inside" / a level change. Decide: panel A must contain the sub-frame element that is
  panel B's frame [17]. VERIFIED.
- **Whip pan / camera carry** — a fast swing blurs the frame and the cut hides mid-blur; the next shot starts mid-whip.
  Decide: both shots whip in the same direction at matched speed, or it jars [18][19]. VERIFIED.
- **Object wipe** — a foreground element crosses and covers the frame, hiding the cut. Decide: which element wipes and its
  direction of travel [20]. REPORTED.
- **Dissolve** — time passing, change of location, flashback [17]. VERIFIED.
- Planning advice across sources: pick ONE dominant anchor per transition, align the outgoing and incoming frames, and test
  nearby cut points frame by frame [20]. REPORTED.

## 4. Blocking timing to the VO
- Standard AE practice: show the VO layer's waveform, drop layer markers on key words/beats (tap them live with * during
  playback), then snap keyframes/cuts to the markers; word-level markers are placed by hand or generated from a transcript/
  SRT [23][24]. VERIFIED.
- Narration and cuts: "narration pauses should coincide with visual cuts or important moments on screen" and "sentences
  generally shouldn't begin right at a cut" (the cut sits in the breath before the line) [25]. REPORTED.
- Pace: ~130-150 wpm with small deliberate pauses so shots can breathe [26b]. REPORTED. Editors keep natural breaths rather
  than stripping them; the breath is where the cut lives [27]. VERIFIED (several agree).
- Vary rhythm on purpose: fast cuts for conflict, breathing room for reflection; constant speed numbs either way [27]. REPORTED.

## 5. "Blocking in": first-pass animation vs polish
- Blocking = key poses/positions + FINAL timing, deliberately unfinished; character animators use stepped tangents so only
  the poses show, then switch to splines after the blocking is approved [28][29]. VERIFIED.
- The test is clarity: if the shot doesn't read in blocking, polish won't save it; detailed easing can mask structural
  problems, so curves are adjusted only after the sequence communicates [28][29]. VERIFIED.
- Polish pass owns: arcs, overlap/follow-through, weight, overshoot and settles, secondary action — "often the longest part"
  of animation [28]. VERIFIED. Mograph equivalent: Buck's rough previs "for exact timing" before design [12]; SOM's
  production phases split "rough animation" from "finalize the animation" [2]. VERIFIED.

## What this means for our G3
- G3 stays the timing contract: owner approval locks shot order and per-shot durations; later timing feedback may move a cut by under 1 s, anything bigger reopens G3 explicitly (never absorbed silently).
- Fix the v3 G5 surprise the industry way: G3 ships the monochrome reel PLUS 2-3 final-quality style frames (busiest shot, home base, one scale shot) and ONE 2-4 s final-density motion test, so look/density/smoothness is approved before build — people can only approve what they can see in motion.
- Every cut in the board JSON names its device from a fixed grammar — cut (default) | cut-on-action | match | morph | scale-through | carry/whip | object-wipe | dissolve — and board-lint knows each device's board-time requirement.
- Lintable per-device requirements: match = anchor element at same position+scale in both panels; cut-on-action = same action split across the cut, same screen direction; scale-through = panel A contains a 15-30%-of-frame sub-frame that IS panel B; carry/whip = both notes strips name the same direction; object-wipe = the wiping element already exists in panel A; morph = both shapes share a centre.
- Morphs are planned as peak-speed cuts, not true tweens: the board shows start shape, end shape and the cut point; the tween itself (if any) is G5 work.
- Animated moves in the G3 reel are blocking: final start/end frames on the locked VO, default ease, no overshoot/settle/secondary/breathes — those are G5-only, so the owner judges timing, not polish.
- Blocking is the kill test: a panel that only reads with polish gets redrawn, never polished; the sound-off cold read stays the gate.
- Cuts sit in the VO's breaths and land changes on the stressed word; a sentence never starts exactly on a cut unless the cut is that sentence's subject; keep per-word markers in the board JSON (we already cut on words — make the breath rule explicit).
- Every shot's notes strip (or JSON) gets a one-line DENSITY placeholder — what G5 will fill in (props, texture, ambient motion, crowd) — so emptiness at G3 is an approved plan, not a missing signal.
- Vary cut rhythm on purpose: fast around the conflict beat, one breathing shot after the payoff; flag three near-equal shot durations in a row as a pacing smell.
- The animatic is the living master: every approved change lands in the board JSON first and the reel always plays end-to-end (TED-Ed's "constantly updating the animatic"); no change exists only in a note or a final-build file.
- Keep metaphor-lock before boarding (Kurzgesagt sketches decide "the best visual metaphors ... for each scene" before illustration) and iterate in text — a dozen script drafts is normal, a dozen re-boards is not.

## Sources
[1] https://artofstyleframe.com/blog/motion-graphics-production-workflow/ · [2] https://schoolofmotion.com/blog/guide-completing-motion-design-project
[3] https://boords.com/animatic/what-is-the-definition-of-an-animatic-storyboard · [4] https://invideo.io/faq/what-is-a-boardomatic-and-how-is-it-different-from-a/
[5] https://richardgladman.co.uk/motion-design-process · [6] https://mstudio.ai/blog/storyboarding/what-is-an-animatic · [7] https://kurzgesagt.org/youtube/
[8] https://10.studio/the-incredible-amount-of-work-behind-kurzgesagts-beautiful-animated-videos/ · [9] https://nickhilditch.com/work/ted-ed/
[10] https://www.forbes.com/sites/bennyhareven/2025/01/27/animation-meets-big-ideas-in-ada-a-new-ted-ed-narrative-series/
[11] https://ed.ted.com/blog/2014/11/26/college-animation-students-collaborate-to-make-one-of-our-favorite-ted-ed-lessons-to-date
[12] https://motionarray.com/learn/motion-design/industry-spotlight-buck/ · [13] https://www.ordinaryfolk.co/process · [14] https://schoolofmotion.com/blog/ordinary-folk-podcast
[15] https://playpause.io/blogs/style-frame-approval-animation · [16] https://boords.com/blog/what-are-style-frames-definition-and-examples
[17] https://schoolofmotion.com/blog/six-essential-motion-design-transitions-tutorial · [18] https://morphic.com/resources/shots/whip-pan
[19] https://wolfcrow.com/the-3-important-in-camera-transitions-in-filmmaking/ · [20] https://www.capcut.com/resource/best-film-transitions
[21] https://www.toolify.ai/ai-news/master-the-art-of-morphing-transitions-in-after-effects-99218
[22] https://www.skillshare.com/en/classes/transition-mastery-create-explainer-videos-and-multi-scene-projects-in-adobe-after-effects/1395431251
[23] https://adobevideoworld.com/markers-after-effects/ · [24] https://www.richardharrington.com/blog/2025/1/13/syncing-motion-graphics-to-music-in-after-effects-tap-out-the-beat
[25] https://morphic.com/ai-glossary/voice-over · [26] https://morphic.com/resources/shots/match-cut · [26b] https://recapo.ai/blog/how-to-make-a-documentary-style-recap-video/
[27] https://www.production-expert.com/production-expert-1/5-techniques-for-dialogue-editing-in-film-and-tv (+ https://fiveable.me/lists/documentary-editing-techniques)
[28] https://mocaponline.com/blogs/mocap-news/animation-curves-graph-editor-guide · [29] https://blenderartists.org/t/how-do-you-do-the-blocking-animation/472096

# Layout & previs: final camera, rough art (research for G3, 2026-10-26)

Lane: the industry stage where the CAMERA is final but the art is placeholder — feature rough layout, anime layout,
live-action previs. Question: what must be real in a rough reel for a director to safely approve story, transitions,
animation intent and camera moves. **VERIFIED** = primary page or several sources agree; **REPORTED** = one secondary source.

## 1. Feature animation: rough layout (the first 3D version of the storyboard)
- Disney: layout "stages, blocks and shoots the film shot by shot" from the editor's story reel. Rough layout = the first
  3D version of the storyboard: rough character animation, fast iteration, temp effects/lighting added only to make camera
  and composition choices. Layout decides lens, f-stop, camera move and angle, "to express the right feeling and show the
  story from the right point of view" [1]. VERIFIED.
- What is approved: directors and department heads approve each shot above all for **how it cuts with the shots around
  it**; layout may add, combine or remove shots for clarity. After animation a finaling pass only *polishes* camera,
  framing and focus — the move itself was set at rough layout [1][2]. VERIFIED.
- Rough layout works in sequences (it is in-house previs); final layout works per shot [2]. REPORTED.
- Craft rules from a Sony Imageworks senior layout artist [3], VERIFIED: a camera following a subject starts a few frames
  AFTER the subject (an operator can't anticipate); a camera has mass, so a pan begins with a slight lag or it reads
  mechanical; headroom minimal, nose room grows with profile; the frame edge never cuts neck or joints; a push-in aims at
  the eyes; 180° rule; a cut needs >= 20 % subject-size change or >= 30° angle change or it reads as a jump cut; don't
  reuse the same lens across a cut.
- In anime the same stage degrades under schedule pressure: "very rough layouts" get fleshed out downstream and quality
  collapses — the rough stage is where the film is actually decided [8]. VERIFIED (Sakuga Blog).

## 2. Anime: e-konte -> layout (レイアウト), the blueprint of a cut
- The e-konte cut specifies: scene/cut number, the frame box, an action column (acting + camera in words), dialogue/SFX,
  and timing in seconds+frames per cut, e.g. (1+12) = 1.5 s at 24 fps [4]. REPORTED. The layout then expands "the usually
  simple visual ideas from the storyboard into the actual skeleton of animation": the composed cut at final framing, the BG
  perspective sent to the art department, characters placed at size, and annotations for every later department — "the
  blueprints for a cut", checked and approved before any key animation exists [5][6]. VERIFIED. Layouts are called the
  backbone of anime's immersion; the system dates to Miyazaki on *Heidi* (1974) [6]. VERIFIED.
- **Camera moves are drawn, not described:** a pan/tilt is drawn past the frame line into the bleed — ONE oversized
  drawing that the camera frame travels across, and the overspill IS the instruction [4]. REPORTED. PAN keeps the camera
  position fixed and rotates; Follow/Dolly travels with the subject and keeps the camera-subject relation stable; pick the
  word first, the technique second [7]. VERIFIED.
- **A move is specified with five values** (T.U/T.B page [9], VERIFIED): the move word, duration (start/end frames in the
  timesheet's camera column), start and end magnification (%), the anchor point ("fix on face"), and easing — drawn on the
  timechart as a line from A to B where even spacing = steady speed and compressed spacing at an end = ease-in/out.
  Multi-plane parallax gets separate lines for cel and BG with different slopes. T.U/T.B must feel like the camera
  physically moving (layers scale at different rates), not a lens zoom [9]. VERIFIED.
- Mixed frame rates rattle a move: characters on 2s against a BG panning on 1s judders; put everything the camera moves
  over on the same step [7]. VERIFIED.

## 3. Live-action previs: gray-box with a real camera
- Previsualization Society definition: "a collaborative process that generates preliminary versions of shots or
  sequences, predominantly using 3D animation tools and a virtual environment" — a tool to communicate the vision so the
  crew can plan and execute it [10]. VERIFIED (several sources quote it).
- The low fidelity is deliberate: gray placeholder shapes stand in for sets and actors **so the decisions are about
  framing and pacing rather than detail** [11]. REPORTED. A gray-box carries where things are, how they move, and how the
  camera covers them; what it cannot carry is lighting, silhouette finish and emotional weight — those are judged later [12]. REPORTED.
- A generated/baked frame is "a picture of a camera move, not a camera move": real previs has a real camera in 3D space,
  so the lens and path data survive into production [13]. REPORTED. Previs review judges: does the move serve the story,
  does layout steer the eye, do story flow and transitions work, is the timing right [14]. REPORTED.

## 4. Judging a camera move from rough material
What must be REAL (every source above converges): (a) the **start frame and end frame**, each a composition that passes
framing rules on its own [1][3][9]; (b) the **path shape** (pan vs dolly vs push changes the subject-BG relation [7]);
(c) **duration and easing** — the default "constant speed then abrupt stop" is the known bad look that ease-in/ease-out
exists to fix [15] VERIFIED, plus the few-frame lag behind the subject [3]; (d) **what enters and leaves the frame and
when** (the anime bleed drawing exists exactly to fix this [4]); (e) the **anchor point** the move holds onto [9].
What may be FAKE: surface detail, colour, light, finished silhouettes [11][12][1]. A move judged without (a)-(e) is not
judged; a move rendered pretty but with a baked path is a picture, not a move [13].

## 5. Transition planning before production
- The animatic is where editorial intent locks: panels on a timeline against temp/locked audio so hold lengths and rhythm
  are judged before production guesses them [16]. REPORTED.
- Spec a transition by **the relationship it creates, not the effect name** ("one week later" / "same shape, new world"),
  so the team can test whether the relationship lands [17]. REPORTED.
- Numbers: fades and dissolves typically run 1-2 s (24-48 frames); 6-12-frame micro-dissolves soften a hard or jump cut;
  a dissolve implies MORE elapsed time than a cut [18]. VERIFIED.
- A match cut is a graphic match — shapes and movement match in composition across the cut — so it only works at exact
  frames and must be verified in the animatic, both frames on screen [19]. VERIFIED (definition; the animatic check is the
  practice consequence). Every other cut gets the 20 %-size / 30°-angle check [3]. VERIFIED.
- Disney's approval unit is the cut-with-neighbours, not the shot [1]: transitions are reviewed as pairs in context. VERIFIED.

## What this means for our G3
1. Rename the contract: G3 = rough layout, camera and cut FINAL, art placeholder — what the owner approves is lens-feel, framing, move, cut timing; what stays gray is surface only.
2. Every animated move ships with the anime five: move word, duration (s+frames), start/end scale or offset %, anchor ("fix on sign"), ease — board-lint rejects a camera move missing any.
3. No linear camera: every move eases in AND out; a subject-following move starts 2-4 frames (30 fps) after the subject; its start and end frames must each pass the §5 panel checklist as stills.
4. Pans/rises are one oversized drawing the camera frame travels across (anime bleed), never a redraw per position — then the exact same path/curve data carries to G5 untouched.
5. Keep moves as real camera transforms in SketchReel (one camera node), never baked into element motion: a baked move is a picture of a move and can't be reused or re-timed.
6. Fix the v3 G5 surprise with gray-box density: every element that will exist at G5 stands at G3 as a gray mass at final position/size — the G5 set plan and the G3 panel must have the same element count (lint: compare lists).
7. Same for motion: everything that will move at G5 moves at G3, crudely (a sliding gray shape, a 2-frame pop) — a still G3 panel promises a still G5 shot; stillness is a claim, not a default.
8. Add a per-shot "G5 promise" line to the notes strip / camera plan: what is placeholder and what it becomes ("gray row = 6 pedestrians, walking"), so the owner approves the future, not the gray.
9. Transitions are first-class shots: every cut labelled with the relationship ("time passes", "same shape"), dissolves 0.2-0.4 s only to soften, 1-2 s only for time, match cuts built from the first panel's element list and checked at the exact boundary frames.
10. Jump-cut lint at every cut: subject size changes >= 20 % or angle >= 30°, unless a declared match (then the frame is identical and the change is the only difference).
11. Review the reel like layout dailies: shots judged in pairs (does the cut land?), whole reel against the locked VO on a phone, sound off then on — approval is of the cut-with-neighbours, not panels.
12. Budget easing by screen speed as we already do (<= 15 px/frame at 30 fps peak): spacing on the move's curve is the easing spec (even = steady, compressed ends = ease), same convention as the anime timechart.

## Sources
[1] https://www.disneyanimation.com/process/layout/ · [2] https://filmclusive.com/encyclopedia/animation-layout-artist
[3] https://www.cgchannel.com/2018/10/10-essential-tips-to-improve-your-cg-layout-work/ · [4] https://www.screenweaver.ai/blog/anime-storyboard-e-konte
[5] https://blog.sakugabooru.com/glossary/layouts/ · [6] https://blog.sakugabooru.com/2022/08/05/the-layout-crisis-the-collapse-of-animes-traditional-immersion-and-the-attemps-to-build-it-anew/
[7] https://sakyuuga.wordpress.com/2018/08/08/tadashi-hiramatsus-camerawork-lesson/ · [8] https://blog.sakugabooru.com/2019/08/31/the-fragmentation-of-anime-production-too-many-cooks-spoil-the-broth/
[9] https://animego.erosakuga.com/notation/t-u-t-b/ · [10] https://www.postmagazine.com/Press-Center/Daily-News/2009/NEW-ORGANIZATION-DEDICATED-TO-PREVIS-LAUNCHES.aspx
[11] https://morphic.com/ai-glossary/pre-visualization-previz · [12] https://blockshot.in/ · [13] https://runway.com/resources/ai-previs
[14] https://blog.cg-wire.com/previs-artist/ · [15] https://docs.toonboom.com/help/storyboard-pro-22/storyboard/camera/add-ease.html
[16] https://ciaro.pro/answers/animatic-vs-storyboard · [17] https://story2board.com/blog/scene-transitions-storyboard-guide
[18] https://en.wikipedia.org/wiki/Dissolve_(filmmaking) · [19] https://en.wikipedia.org/wiki/Match_cut

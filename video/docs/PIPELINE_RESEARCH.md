# Pipeline research: fast feedback loops for short animated explainers

> **Background (2026-10-25); the process is `docs/PIPELINE_V2.md`.** The owner later narrowed two of its constraints:
> no MP4s before the sketch animatic (G3: text and audio only, one version), and the G4 look is a clip made after the
> G3 lock, never a lane beside G3.

Scope: how studios structure animation production for feedback, mapped to our Remotion + AI-agent setup.
Constraint from the owner: every gate gives a **playable low-res video with voice** on the phone, not stills.
Web searches used: 6. Sources are listed at the end. Most are studio or agency process pages, not peer-reviewed.
Claims that come from a single secondary source are marked (secondary).

---

## 1. TL;DR

1. Every studio we looked at runs the same funnel: **words -> sound -> pictures in time -> motion -> polish**. Each step
   has a sign-off, and after the sign-off the upstream layer stays frozen. Changes get cheap again only by reopening a gate on purpose.
2. The stage that does the most work is the **animatic** (Pixar calls it a story reel): rough boards timed to the
   voice, with rough camera and transitions. It is the first point where timing and story can be judged, and it is cheap to redo.
   "A story reel that works gets better in production; one that doesn't won't be fixed by animation" (Lasseter, secondary).
3. Polish (spline, texture, edges, sound sweetening) always comes last. Critic panels and quality scores belong there too.
4. Short-form creators treat the **first 3 s as a separate, swappable unit**. They make 3-5 hook variants on the same body and
   judge them by the 3-s retention drop.
5. In our run the owner first saw a playable film **18.7 h** after the start, and 11.4 h after scene production began
   (git: 24 Oct 13:38 to 25 Oct 08:21). We had no animatic. The storyboard was an 815-line text spec. Story and readability problems
   (S08 peak, S10 readability, S09 leap timing) only showed up in per-scene polish scoring, where every fix costs a full
   scene round. With the proposed loop, a playable cut reaches the owner at about hour 1 (radio cut), hour 3 (sketch animatic) and hour 8 (blocking cut).

---

## 2. What studios do (findings)

### 2.1 Named workflows

- **Kurzgesagt.** About 1,200 hours per video. Research and script take the biggest share. Visuals start from a settled script and narration;
  then come design/storyboard, animation, and music/sound by a separate team. ([official "1200 hours" video, summary]; [U-Mich INK])
- **TED-Ed lessons.** A 5.5-min lesson: storyboard and animatic took about 4 days out of a total under 3 weeks, made by two people. An
  educator checked accuracy at board stage ([Buzzco], 2012). Another lesson went script revisions -> animator's storyboard ->
  narration recorded and approved -> animation finished ([Kate Messner]).
- **Motion-design and explainer agencies.** Brief/refs -> script -> style frames (look) -> storyboard (narrative only; the look
  is already settled by the style frames) -> animatic on scratch VO -> animation -> sound -> delivery, with **sign-off after each stage**
  ([Head Gear], [Mechanism], [School of Motion], [Boords]). Typical budgets are **2-3 revision rounds per stage**, and some studios allow up to 5
  ([Yans Media], [Contra listings], [VideoExplainers], [b2w]). Voice-over: no revisions after approval except technical errors.
  Storyboard: 2 rounds ([agency process page]). Small script tweaks during the board stage are normally accepted ([Yans Media]).
  Scratch VO stays in until the script truly cannot change, because re-recording professional VO costs a session ([School of Motion]).
- **Pixar-style pre-production.** Boards are cut into story reels with scratch dialogue and temp sound. The reels go through many
  versions until the sequence plays, and production starts only after that. Toy Story's "falling with style" timing was set in 2D reels
  before any CG was made ([Denki], [FilmLifestyle]; secondary).
- **Character animation inside a shot** (common practice, not separately sourced): layout (camera and staging) -> **blocking**
  (key poses, stepped interpolation; the director approves acting and timing here) -> blocking-plus -> **spline** -> **polish**.
  Notes after spline that change poses throw away the spline work.
- **Short-form creators.** The hook is tested as its own unit: only the first 3 s differ between versions, while caption, sound and body
  stay the same. The versions are posted at different times. The signal is a steep drop on the retention graph by 3 s.
  The usual advice is 3-5 hook variants per body ([Jeff Bullas forum], [PostEverywhere], [Sotrender]; vendor pages,
  so treat their thresholds as heuristics).

### 2.2 Stage table (industry pattern)

| Stage | Artifact | Client approves | Frozen after | Typical rounds | Cost of a change here |
|---|---|---|---|---|---|
| Brief / research | 1-page brief, refs, fact sheet | angle, audience, length, look refs | topic, length band | 1 | ~0 |
| Script | text + read-through | every word, hook line | meaning and order of lines | 2-5 (the most iterated stage) | minutes |
| Scratch / final VO | audio + word timings | voice, pace, emphasis | the clock (timings) | 0-1 (tech fixes only) | a re-record + retime |
| Thumbnails / beat board | tiny sketches per line | what we see on each line | shot list | 1-2 | minutes per panel |
| Style frames | 1-3 finished stills (+ optional motion test) | look: palette, line, character | visual language | 1-3 | hours, but separate from story |
| Storyboard | panels per shot with camera notes | staging, shot order | shot content | 2 | ~1 panel |
| **Animatic** | boards cut to VO, rough camera and transitions, temp sound | **story, timing, cut points, transitions** | edit (cut list, durations) | 2-4 | re-cut panels: still cheap |
| Layout | real sets/characters, final camera | composition, camera paths | camera and composition | 1-2 | rebuild shots |
| Blocking | key poses, stepped motion | acting and timing of action | poses, timing | 1-2 | re-pose |
| Spline / polish | final motion, FX, texture | feel | picture | 1 + fixes | discards finished work |
| Sound / mix | SFX, music, mix | mix | audio | 1 | low if picture is locked |
| Final / QA | master render | delivery | everything | 0 | full re-render and re-QA |

**Cost-of-change curve.** Every source makes the same point, with no consistent numbers: a change costs roughly the
work already built on top of the layer that changes. Our own run shows the curve clearly:
- **Script change after build started.** The 78 s script became 55 s at 18:55. That discarded voice v1/v2, timing v1/v2, a
  v1->v2 time-warp tool, storyboard v1/v2, a music fit to 78 s, and two sound reworks. Changing the script before any of that existed would have cost minutes.
- **Story or staging problem found at polish.** S08 "PEAK-2 not landing" got a redesign note at 08:10 on day 2. After several
  rounds it shipped at 7/10. S10 "sites don't read at thumbnail size" shipped at 7.5. A sketch animatic would have shown both in one viewing.
- **Hook decided last.** Hook passes 1-2 ran at 11:03-12:32 on day 2, after the "final" was nearly done. Each one touched
  finished scenes, the sound cues and the mix.

---

## 3. Where our run broke the funnel (evidence from git)

| Symptom | Evidence | Studio rule it breaks |
|---|---|---|
| Owner saw a playable film only at the end | first full-film preview 25 Oct 08:21 (40 %), about 18.7 h in; before that, 30-min still strips | animatic before production |
| Build before script lock | engine v1/v2, cinematic kit (3 rounds), mascot (10 poses), motion spec, sound, voice v1/v2 all before script final (18:55) | script and VO lock first |
| Polish before story | edge lab (2 rounds, 6 variants, judges) from 19:18, shared kit (5 review / 2 AD rounds), QA tooling (dead-frame detector, calibration) before any scene existed | polish last |
| Storyboard was text, not timed pictures | v1/storyboard_v3.md: 815 lines with px/s cut-speed matching; JSON 10k lines | boards to animatic; numbers belong to layout |
| Depth-first scenes | per-scene ">= 8/10 from independent critics" from the first build; scenes reached polish while others were still placeholders | breadth-first: whole film per stage |
| Hook last | hook build / pass 2 after the posting kit | hook first, as its own unit |
| Overhead per cycle | 30-min check-ins rendering strips of every composition plus QA charts plus commits; 3 usage-limit stops | one deliverable per gate |

---

## 4. Recommended pipeline for us (gates G0-G8)

Principles: **breadth-first** (the whole film moves through each stage together), **one playable cut per gate**, the **voice is the clock**
(word anchors, which we already have), and **polish is banned until G5 is approved**.

Every gate deliverable has the same shape (see section 5): an MP4 that plays on the phone, with voice and captions, plus at most 5 lines of notes.

| Gate | Artifact (what the owner plays) | Owner approves | Target time (agent wall-clock) | Rounds budget |
|---|---|---|---|---|
| **G0 Angle** | text only: 1 screen (topic, audience, one takeaway, hook promise, length, look = house style or new) | angle, length | 15 min | 1 |
| **G1 Script: radio cut** | 360x640 MP4: TTS voice (final provider and settings) over plain paper, big captions, 1 colour per section; **plus 3 hook clips** (first 3-5 s, alternative lines) | words, order, hook line | first cut <= 1 h; rounds ~15 min | 2-4 |
| **G2 Voice lock** | same radio cut with the final take, temp music bed, word timings resolved | voice, pace, emphasis | 30 min | 1 (tech fixes only) |
| **G3 Sketch animatic** (the new stage) | 360x640 MP4, whole film: black-line sketch boards on cream (boxes, stick figures, mascot silhouettes from existing poses, labels), timed to the locked voice; rough camera (linear pan/zoom); **every transition visible and labelled** ("MATCH: sun -> lock"); captions on; scene ID and timecode burned in; **2 hook-visual variants** | **the story in pictures**: what is on screen for every line, scene count and cuts, transitions, the 3 peaks, the hook visual | first cut <= 1.5 h; rounds ~30 min | 2-4 (iterate here, it's cheap) |
| **G4 Look** (runs in parallel with G3) | 1-3 stills at full quality (hook frame, one peak, one typical frame) **plus one 3-5 s motion test** with voice | palette, line, mascot, captions, edge style | reuse house style: 15-min check; new style: <= 2 h | 1-2 |
| **G5 Blocking cut** | 360x640 MP4, whole film in real kit sets/props at draft quality: final compositions and camera paths, key poses, stepped or linear motion OK, **no edges / paper / grain / ink boil**, grey stand-ins where a prop is missing, temp SFX optional | staging, camera, phone-size readability, transitions that actually play, timing of moves | <= 4 h | 1-2 |
| **G6 Polish cut** | 540x960 MP4 with draft mix: easing/spline, secondary motion, mascot acting, edges, paper, caption polish. Per-scene critic scoring happens HERE | feel; no restaging | <= 6 h | 1 + bug fixes |
| **G7 Sound** (overlaps the end of G6) | same cut with SFX re-derived from the final beats, music, -14 LUFS mix | mix | <= 1 h | 1 |
| **G8 Final** | full-res render, QA gate, cover, posting kit | nothing creative: blockers only | <= 1.5 h | 0 |

Result: playable cuts reach the owner at about h1, h3, h8 and h14, instead of h18.7. G3 and G5 are where most of the owner's notes should land.

### 4.1 What may change after each gate (change control)

| After | Frozen | Still allowed without reopening |
|---|---|---|
| G1 | meaning and order of lines, hook line, length band +-10 % | delivery cues, pronunciation, trims of a few words if G3 shows a line can't be shown |
| G2 | voice take and word timings (the clock) | a re-take for errors only; anchors re-resolve automatically |
| G3 | scene list, cut points (word anchors), shot content per line, transition type per cut, hook visual, peaks, mascot's role per scene | exact composition and camera values, all look decisions |
| G4 | palette, line and ink style, mascot design, caption style, edge treatment type | per-scene tuning in G6 |
| G5 | compositions, camera paths and move timing, key poses, what is on screen when | easing, secondary motion, texture, edges, colour tweaks, SFX |
| G6 | the picture | QA blockers, mix |
| G7 | the mix | nothing |

**Rules**

1. **No downstream build before its gate**, except the declared parallel lane (G4 next to G3). In particular: no kit pieces,
   QA tooling, edge labs, mascot poses or sound design beyond what the current gate's video needs (just-in-time tooling).
2. **A late change means reopening a gate, said out loud.** The agent names the gate and lists which approved artifacts it
   invalidates, with a time estimate. The owner decides. Ideas that aren't blockers go to a "next video" list.
3. **Breadth-first.** No scene moves to the next stage while another scene is still in the previous one.
4. **Gate reviewers.** G1-G5 are judged by the owner plus at most one cheap automated check (duration, A/V sync, captions inside the
   safe area). Multi-critic panels and 8/10 scoring start at G6. Pixel-level checks (edge keeps, loop seam pixels, clipping by a few frames) start at G8.
5. **Precise numbers go in late.** Cut-speed matching, px/s and haze ladders belong to G5/G6. The G3 storyboard is data plus a video, never a long prose spec.
6. **The hook goes first at every gate.** It has variants at G1 (lines) and G3 (visual), and it is built as a separate swappable segment so a post-launch hook test
   (same body, only the first 3 s differ, posted at different times, compare 3-s retention) costs one short render. Our loop film adds one
   constraint: every variant must end on the same frame the body (and S12's rewind) expects.
7. **One deliverable per gate, no status reels.** Replace the 30-min check-in strips with the gate MP4. Between gates the owner
   gets at most a one-line status, and only when something is blocked.

---

## 5. How it works in Remotion with phone review

- **One preview command, used at every gate.** Render the whole film (it's 55 s, so the owner judges the flow) with
  `--scale=0.333` (360x640) or `0.5` (540x960), `--crf=28-30`, `--x264-preset=veryfast`, with audio. All of these are standard
  Remotion render options and present in our install. Measure the wall-clock once; if it goes over about 5 min, re-render only the changed scene with `--frames`
  and splice. (Not run now: a render is in progress.)
- **Draft switch.** A `draft` input prop that turns off edges, paper, noise or ink boil and heavy filters at G3-G5. This makes renders faster and also stops
  reviewers (human or agent) from judging polish early. Profile which effects are expensive before building it.
- **SketchReel: the only new tool to build.** One generic composition that reads `sketch.json`: per scene, the word-anchored in/out, panels
  (box / circle / stick / arrow / text / mascot-pose silhouette), linear camera keyframes, and `transitionOut {type, note}` drawn as an on-screen label.
  A G3 revision then means editing JSON and re-rendering, with no TSX per scene. Later, G5 scene builds start from the same JSON.
- **Overlay on every pre-final cut:** gate name, version, scene ID and timecode in a corner. Owner notes can then say "v3 S05 0:21".
- **Delivering to the phone:** send the MP4 directly (SendUserFile, display render). Optionally, a private review page with the
  video and timecoded notes stored in the page database, so the agent can read the notes back without retyping.
- **Gate message template (max 5 lines):** what changed since the last cut; what to judge at THIS gate; what NOT to judge (for example
  "sketch: ignore line quality and colour"); up to 3 questions with timecodes; reply with `OK` / notes with timecodes / `reopen Gx`.
  Studios brief clients the same way before showing rough animatics, so that clients don't give polish notes on boards.

---

## Sources

- Kurzgesagt, "How to Make a Kurzgesagt Video in 1200 Hours" (summary): https://gist.ly/youtube-summarizer/how-kurzgesagt-creates-videos-1200-hours-of-science-art
- Arts at Michigan, "Simple, Bright, Beautiful: The Work of Kurzgesagt": https://artsatmichigan.umich.edu/ink/2019/09/27/simple-bright-beautiful-the-work-of-kurzgesagt
- Buzzco (TED-Ed "Sex Determination" production notes): https://buzzco.nyc/?p=366
- Kate Messner, "The making of a TED-Ed video": https://katemessner.com/the-making-of-a-ted-ed-video/
- Head Gear Animation process: https://headgearanimation.com/head-gear-caivan-reel
- Mechanism Digital, "Trust the process": https://www.mechanismdigital.com/post/trust-the-process
- School of Motion, "What are animatics and why are they important": https://schoolofmotion.com/blog/what-are-animatics-and-why-are-they-important
- Boords, "The seven steps of animation production": https://boords.com/blog/the-seven-steps-of-animation-production
- Yans Media, "The ultimate guide to animation revisions": https://www.yansmedia.com/blog/animation-revisions-guide
- VideoExplainers process: https://videoexplainers.com/our-process ; b2w process: https://b2w.tv/process ; Contra explainer listings: https://contra.com/s/W6Uo73QL-2-d-animated-explainer-video
- Denki, "The Importance of Story Reels" (Lasseter quote, secondary): https://denki.co.uk/?p=9285 ; FilmLifestyle, "What is an animatic": https://filmlifestyle.com/what-is-an-animatic/
- Hook testing: https://www.jeffbullas.com/thread/how-can-i-effectively-a-b-test-different-video-hooks-or-styles-on-tiktok/ ; https://posteverywhere.ai/social-media-terms/hook-rate ; https://www.sotrender.com/blog/?p=56913
- Our run: `git log` of /home/user/Test- (timestamps above), video/docs/v1/WRAPUP.md, video/docs/v1/storyboard_v3.md.

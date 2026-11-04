# Video 4, visual concepts: the craft and feasibility judge (2026-10-29)

**Status: DONE (2026-10-29).** One of the two judges of workflow `v4-visual-script` (`BRIEF.md`); its sister is
`judge_story.md`, and where the two split, the story verdict leads (`METHOD.md` step 2). Judged: `concepts/A.md` (THE
HEAT'S JOURNEY), `B.md` (THE DESIGNED VIEW), `C.md` (FROM YOUR CHAT TO A HOME), against the take
(`video/public/v4/voice_words.json`: every time below is a word's start in it), `DIRECTION.md`, `CRAFT.md` §a,
`LAYOUT.md`, `CINEMATIC_GUIDE.md`, `G3_ANIMATIC.md`, `research_craft.md` (findings 1-12), the engine as it stands
(`src/lib/Film.tsx`, `lib/pullback.tsx`, `lib/ShotCam.tsx`, `src/v3/SketchReel.tsx`; `G5_BLOCKING.md` §1-2) and the fact
file (`video/docs/v5/research/factlock.md`, FL). Style-neutral: nothing here judges how anything looks. Every time
quoted from a concept was checked against the take: all three are right to the word.

## Scores (1-10)

| criterion | A, the heat's journey | B, the designed view | C, your chat to a home |
|---|---|---|---|
| Camera grammar | 8 | 8 | 6 |
| Carriers at every join, the thread | 8 | 9 | 8 |
| Timing against the voice | 9 | 8 | 7 |
| Fit with our rules | 8 | 9 | 7 |
| Buildability in our engine | 7 | 8 | 6 |
| Truth to the fact file | 8 | 9 | 6 |
| **Total (of 60)** | **48** | **51** | **40** |

### Why each score
**Camera grammar** (motivated moves, one move per shot, readable at 60 fps)
- **A, 8.** Every move has a one-line reason whose direction means it (push for attention, pull for context, tilt
  and rise as the heat goes up, drop to look inside, follow for the water); the big beats are vertical (finding 8);
  each C move straddles its join; the L11 follow is costed (~1,600 px in ~3.1 s). Against: its small moves cannot make
  the sizes it names (a ~5 % push takes L2's medium to L3's close, a ~10 % pull takes that to L4's medium-wide: G3
  needs ~1.5-2x); the L1 -> L2 push-through goes from a small machine in the wide to a medium in 0.76 s (est. 5-8x,
  ~3.5-4.5 % a frame on average, over the ~3 % zoom budget at the subject: `G3_ANIMATIC.md` §4, `CINEMATIC_GUIDE.md`
  S5) right after the hook; the rise's anchor (the plume) thins away mid-move and the landing puts Helsinki in a new
  spot, so the eye searches on the curve.
- **B, 8.** Twelve shots, one move each, sizes named and varied, every move with a why. Its one big move is the S5
  crane's back-and-up (the owner's favourite) about a FIXED pivot: Helsinki held at the mug's screen spot from the
  insert out to the planet, and the dive on "But" goes back down the same axis through the same nest. The
  best-anchored scale trip of the three. Against: pushes come in runs (S2, S3; then S7, S8, S9 in a row), which blunts
  "look closer"; S5's push from the medium (the computer and its kettles) to an insert in 0.44 s is called small but
  is est. ~3x (over the 2x a C push may take in one panel, ~4 % a frame); S2 -> S3 (wide to close in 0.64 s) is
  borderline too; the out-move's "~3 % a frame" holds only if the nest packs mug-to-planet into ~50x (G3 measures it).
- **C, 6.** Its L2 device is textbook (the phone's screen as the push-through's sub-frame, the dots kept in spot and
  size as a match zoom: `CRAFT.md` §a, B), but L2 stacks four camera events into 4.0-7.8 s (a tilt down, the
  push-through, the match, a pull back) in the hook's second beat; the computer close is entered through the phone, so
  where it stands is shown only by the pull back at 6.92-7.84 (finding 9: every close entered from a view that showed
  where it is); "a slow float up the column of steam to the top" (L4 -> L5) is a tilt plus a push, not a float, and L1
  is "locked with a slow float" (DIRECTION rule 8: a hold is locked or a float; a move is a story move or a carrier).

**Carriers at every join (at most 2 plain cuts) and the thread on screen**
- **A, 8.** 0 plain cuts (A x3, B x1, C x8), the thread ~99 %, one screen direction with the camera upstream once
  (finding 4). Against: the mug pops on "That's" (17.76), the L4 -> L5 join's midpoint, while the tilt carries
  (`CRAFT.md` §a: nothing enters in the 0.4 s around a join); in the scale stretch the camera rides Helsinki's OWN
  plume into the sky, the curve then shows Helsinki as the one spot with no plume, and the dive lands on its steam
  rising "again as before": the thread contradicts itself across one join.
- **B, 9.** 0 plain cuts (A x2, B x1, C x9) in a join table that names what leads each one, every cue 0.2-0.5 s before
  its join (Smith 2012, textbook: https://ualresearchonline.arts.ac.uk/id/eprint/21187/), and nothing changing in the
  0.4 s round any join, checked one by one (S9's side opens on "how", 28.70, to stay clear of the no-pause join; the
  tag at rest by ~27.9; the bubble 0.38 s after "So"). The thread ~99 %, ~92 % even outside the declared reveal, no
  gap over 3 s.
- **C, 8.** 0 plain cuts (C x9, A x2, B x1, plus an A + B hand-over on "giant", 5.68), the thread ~98 %, a legal
  match zoom. Against: the whole row lights on "Those" (8.76), at the L2 -> L3 join; the thread is gone ~0.5 s at the
  phone dive; the hands enter as L12 lands, the reply popping in the same ~0.1 s.

**Timing against the voice** (no beat too short to read, none idle)
- **A, 9.** Every event on its stressed word; each C move's midpoint on its first word (8.50-9.02 round "Those",
  10.62-11.30 round "To", 17.46-18.06 round "That's"); the no-pause L9 -> L10 solved (the drop starts at 27.98 with half
  its travel done by "So", 28.34, lands as "work?" ends, and nothing new starts before "big", 29.96); L4's 6.8 s has an
  event every ~1.2 s (12.54, 13.72, 15.06, 16.22); the camera rests on "WANTS" and from "chatbot". Tight: the dive
  lands 0.08 s before "WANTS" (all three are this tight there).
- **B, 8.** Events on words, its two short lines (S5 1.50 s, S9 1.22 s) carried by continuous camera, the payoff's
  two events 1.5 s apart. Against: its C moves start ON the first word (S3 8.76, S4 10.96, S5 17.76, S8 25.54, S9
  28.34, S11 34.46), so each join's midpoint lands 0.2-0.7 s late (`CRAFT.md` §a timing; the engine's
  `camera-continuous` puts the cut mid-move, `src/lib/Film.tsx`); S4 holds 2.0 s with no story event (12.54-14.56,
  against finding 6's ~1-2 s).
- **C, 7.** Clean from L3 on. Against: L2 puts the phone, the dots, the dive and the pull back into ~3.6 s, the phone
  at rest only ~0.2 s (4.6-4.8) before the push; the mug's entrance has no time; L12's hands, landing and reply share
  ~0.1 s (38.86-38.88); its C moves also start on the word (L4 10.96, L8 25.54, L9 28.34).

**Fit with our rules** (one home place, at most one comparison or scale shot, people small, Pip hidden, words few and
big, the caption band)
- **A, 8.** One home place (the road), one comparison and scale shot, one in-world number (2027), the "you" as POV,
  Pip planned and kept out of the closes, the curve and the cover, the band named where it matters (L6's plumes,
  L10's walls). Against: cozy ~50-65 % by its own count (DIRECTION rule 7: >= 50 %), so L4 rests on G3's framing; its
  home view is a designed view, yet the L11 diagonal truck is not checked against the far stage's junction
  (`CRAFT.md` §f.5: a truck along it exposes it); the L5 mug never gets a close (`LAYOUT.md` §2), so the joke reads
  small.
- **B, 9.** The one home place taken literally (one designed view); exactly the two designed frames `CRAFT.md` §f.5
  allows (the establishing view, the scale landing); the far stage still in every move and no truck along its
  junction (its pushes aim below the hiding band, so the band only covers more); cozy ~71 % at human scale with masses
  on 2-3 sides; the band clear in every shot (the steam thins below it, nothing of the hall crosses it); one number;
  Pip planned. The risk it names, a poster explored by a camera reading as a slideshow, it answers with the rules'
  own tools (life in every frame, the parallax float).
- **C, 7.** One home place, one scale shot, POV "you", Pip, one number. Against: the caption band appears nowhere (the
  steam off the computer in L3-L5 and the curve's plumes rise into it); its cozy share is at risk by its own count
  (~13 s certain; ~25 s at the plan's site must be composed as home); the "you" the cold panels stopped on ("My
  chatbot? I'm in Ohio.") is planted at 4.3 s, which the playbook's "test 'you' claims with a viewer panel" puts on the
  cold read.

**Buildability in our engine within one film's budget** (2D layers, camera moves, parallax planes, drawn sets)
- **A, 7.** One road set; the existing push-through, un-build and draw-on. New or heavy: a vertical variant of the
  pull-back rig (its own estimate, ~half a day); the plume kept one continuous thing across nested scales; the ~49x dive
  as the engine's 7x + 7x push-through hands a zoomed curve to a zoomed machine that do not match at the cut (a flat
  bridge frame, or a second nest); its six suggested G3 panels carry up to three moves each (P2: a push, a pull, a
  tilt; P5: the drop, the tilt, the follow), which needs the tier-2 multi-key camera (`G3_ANIMATIC.md` §7, M) or a
  split into 12 panels.
- **B, 8.** One designed set and one camera function for most of the film (v3's `homeCam(T)` pattern, `G5_BLOCKING.md`
  §2b); 12 one-move shots map 1:1 onto SketchReel's one camera segment per panel (`src/v3/SketchReel.tsx`; the float
  on S6's landing aside, which board mode skips), so G3 needs no new camera tooling; the
  big move is `lib/pullback.tsx`'s depth-graded planes about one pivot, as built; the dive replays the same nest
  backwards (no new drawings; its fallback lands one step early); the computer's opening is a casing layer over an
  interior. Costs: one set that must hold detail from planet scale down to the radiator (one owner, many resolutions);
  a ~5-step nest at ~0.45 s a step.
- **C, 6.** Every device exists (`push-through`, `matchcut`), but its costliest join (the phone dive: a phone layer, a
  dots layer, the swap frame, the morph) sits in the first 8 s, where a 1x failure costs the most; the rise needs the
  multi-key camera (its own note); the state rule gives the street's windows a second state; two POV moments to draw.

**Truth to the fact file** (the plant drawn as a plan; FL)
- **A, 8.** The plan only marked out in every shot, even when its walls rise on "big"; 2027 on the plan; generic
  boxes; the heat pump calm and unlabelled; 70,000 a wave, never a count; an honest fallback if L2-L7 read as "already
  running" (no warm run before L8's "plan"). Against: the curve makes Helsinki the one spot with no plume, which reads
  "only Helsinki keeps its heat" (false: FL 8.2, 8.12), right after the rise showed Helsinki's own heat thrown away.
- **B, 9.** The plan never finishes, frame 0 and the end included; even "big new data center" is a hall of
  marked-out machines; the curve lets one or two far boxes send up no plume, so it never claims Helsinki alone (FL
  8.2, 8.12); the one stream is honestly two loops joined at the box (FL 6.3); Uspenski, never Helsinki Cathedral (FL
  6.10); 2027 a G8 re-check. Against: the roof line closing over the computer on "data" (7.56) risks a
  finished-building read (FL 6.7).
- **C, 6.** Its state rule (frame 0 the promise; L7 the street as it is now, windows dark) and its honest note on
  steam are the best truth devices of the three. Against: the dive turns your own chat into the machine standing in
  Helsinki's plan, in the present tense ("AI actually runs on ..."), at 5-8 s, while the plant has no building, no
  tenant and no site (FL 6.7); "a row of its kind ... every machine at work" makes the plan look running; the rule is
  half-applied (the computer still steams in the plan at L7, so "not running yet" covers only the windows).

## Ranking
1. **B, the designed view (51):** the most buildable and the most rule-tight; its big move is the best anchored.
2. **A, the heat's journey (48):** the best-timed camera and the most causal opening; costlier to build, one thread
   contradiction on the curve.
3. **C, your chat to a home (40):** a strong idea for the story judge, but its signature join is the riskiest piece
   to build and to read at 1x, in the first 8 s, and it draws a claim the fact file does not hold.

## Why B wins on craft and feasibility
- **One world, one camera.** The film is one designed set the camera explores: every close is a part of a picture the
  viewer already saw (finding 9), it is staged in the one world space G3 wants (`G3_ANIMATIC.md` §1), and it is the v3
  pattern G5 already runs (one home set, one shared camera, `G5_BLOCKING.md` §2b).
- **The scale trip done the readable way.** All three make the same trip (out to the curve on "Normally", back in on
  "But"); only B holds one pivot from the mug to the planet and returns down the same axis, so the eye never searches,
  and the dive costs no new drawings (`lib/pullback.tsx` about one pivot, then the nest reversed).
- **It plays on the tools we have.** One move per shot maps onto SketchReel's one camera segment per panel; A and C
  need the tier-2 multi-key camera or a re-split, and A a new rig variant.
- **The cleanest joins.** Every join names what leads it, every cue sits 0.2-0.5 s before it, nothing changes in the
  0.4 s round any join, and the pipe's topology holds (cool in at the computer's top, out at its foot straight into
  the pipe under the street, the steam poured into that same pipe on "WANTS").
- **The rules are checked, not assumed:** the two designed frames and the far stage's junction (`CRAFT.md` §f.5), the
  cozy share, the caption band in every shot.
- **The truest picture:** the plan never finishes in any frame, the hall of planned machines is marked out too, and the
  curve never says Helsinki alone keeps its heat.
- **Where B is weaker than A** (timing on the joins, the speed numbers, frame 0's causality) are mechanical fixes,
  taken as grafts below; A's and C's weak points (the rise's anchor, the dive's hand-over, the phone dive in the hook)
  are structural.

## Grafts onto B
1. **From A: centre every C move on its join.** Start each move in the pause so its midpoint lands on the first word
   (as A does: 8.50-9.02 round "Those", 10.62-11.30 round "To"); for B's S3, S4, S5, S8, S9 and S11, which start on the
   word. S5 in particular: start the push in the pause (~17.46) and keep it a close on the computer's top at <= 2x,
   landing by "lot" (18.20), the mug popping on "tea" (18.62) as B has it.
2. **From A: the honest speed sheet.** Each big move with its zoom % a frame and px a frame, the WARN named, and a 1x
   phone check with its fallback: S6's out-move (est. ~4-5 % a frame on average and about twice that at the S5 ease's
   peak if the nest really spans mug to planet), the S7 dive, S12's pull back (close to extreme wide in ~0.9 s).
3. **From A: the truth fallback.** If the cold read sees the plant as already running, S7 stops at the steam entering
   the pipe at the computer's foot, and no water runs warm until S10, after "plan" and the 2027 tag are on screen.
4. **From A: an event on "makes" (13.72):** the computer's hum deepens and its steam thickens, filling S4's 2.0 s with
   no story event (12.54-14.56).
5. **From A: the pipe drawn first at frame 0.** One long bold stroke from the plan's footprint along the pipe to the
   radiator opens the build (a big, visible first event, and the film's path), so the warm water's run at ~0.40 follows
   a line the viewer just watched drawn, the computer still drawing on with "AI" (1.50); the loop's un-draw then runs
   from the window back to the computer.
6. **From C: the state rule.** Frame 0 is the promise; from the dive on "But", the one window and the street's windows
   along the pipe are dark (now), and each lights only as the water reaches it in S11 (C: two windows on "carry that
   heat", the one window on "homes"). The plan reads as not yet running, and the thread reacts on its word.
7. **From C: the open plan.** Walls marked out and no roof, snow falling through it (drop B's roof line closing over the
   computer on "data", 7.56): the plan reads as a plan at a glance (FL 6.7), and the steam has its reason to rise
   (the heat meeting the snowy air through the open plan, C's honest note).

## Risks all three share (for the writer and G3)
- **The computer runs and steams inside the plan from L2,** before "a plan" is said at L8 (FL 6.7): grafts 3 and 6
  are the cure; the cold read checks it.
- **Helsinki on the curve:** marked by having no plume, then landed on with its steam rising. Mark it by its lit
  windows instead, with the boxes' plumes as the contrast and one or two far boxes plume-free (B), so the landing's
  steam is no contradiction.
- **Every dive and every out-move passes the ~3 % a frame zoom budget at the subject** (flat masses may:
  `CINEMATIC_GUIDE.md` S5; Kurzgesagt's nested zoom runs ~0.7 s a step, measured:
  https://archive.org/details/youtube_-_UCsXVk37bltHxD1rDPwtNM8Q_2018). G3's 1x phone watch decides, with each concept's
  fallback.
- **The cutaway ground is a frontal section:** the street's top must recede behind the cut edge (`CRAFT.md` §f.4;
  `check_depth.py`'s "elevation" FAIL), which B states; G4 and G5 draw it.

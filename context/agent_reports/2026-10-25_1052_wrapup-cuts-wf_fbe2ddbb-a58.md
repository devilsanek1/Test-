# Workflow wrapup-cuts-wf_fbe2ddbb-a58.js (run wf_fbe2ddbb-a58, last activity 2026-10-25 10:52 UTC)

Script: `context/workflows/wrapup-cuts-wf_fbe2ddbb-a58.js`

---

## audit

{
 "cuts": [
  {
   "cut": "S02|S03 film 8.393 s (Main f251|f252), hard cut on 'password'",
   "pass": false,
   "score": 7,
   "problems": [
    {
     "severity": "major",
     "at": "Main f252-f258 (8.400-8.600 s), caption band y 280-570",
     "problem": "Page 3 ('take over a site / without a password.', 2 lines, no `out`) hangs settled over S03's first 5 frames (f252-f256). It then scrolls on f257-f258: on f258 'without a password.' is cut through at the band top with 'It's in PHP,' under it. 'password.' ends at 7.67-8.18 in assets/timing.json, so the page has been stale since 8.18. The 8.393 `out` that S03.md asks for does not fix this. A 2-line page is only dropped once the curve reaches q >= 0.695, which takes about 0.054 s after `out`. With out 8.393 it would still be half-scrolled on f252-f253.",
     "fix": "Captions data (cross-lane). In src/data/captions.overrides.json add \"3\": {\"out\": 8.335}, and in src/data/captions.json add \"out\": 8.335 to page index 3. Result: f250 (8.3333) stays settled, f251 (S02's last frame) gets one scroll frame (q 0.59), and f252 is empty (q 0.73, line-2 baseline 284 against the 294.7 drop line). 'It's in PHP,' then rolls into an empty band from 8.565."
    },
    {
     "severity": "minor",
     "at": "Main f249-f253 (Pip centroid, full res)",
     "problem": "Pip has one slow frame just before the cut: steps (-13,+56), (-24,+33) | (-35,+43), (-35,+42), so speed goes 57 -> 41 -> 55 px/frame. Position hand-off is exact: f251 centroid (861,848) is S03's straight-line extrapolation of f252 (826,891). Pose, scale (h 126 -> 124), facing (left) and the arc direction (126 deg -> 129 deg) all carry. S02's Hermite still aims at S03's old pickup velocity (-1133,+257) px/s, but S03 now drops at (-1000,+1250).",
     "fix": "src/scenes/Scene02.tsx l.313: change S03_PICKUP.v from [-1133, 257] to [-1000, 1250], or import pipDropState(PIP_HANDOFF.t - S03_START).v from scene03/cast.tsx. The S03 doc predicts dy +34, +53, +50 | +42, +42 after this."
    },
    {
     "severity": "minor",
     "at": "Main f252 (ink)",
     "problem": "S03 opens on thin construction-line plan ink (~2 px) after S02's ~4 px board ink. This is by design (the street springs out of the plan) and there is no match object, so no change is needed. Checked and passing: sun locked (S02 cap centre (689,~700), top 590 -> S03 disc (690,699) r110, drifting to (692,698) by f264); paper edge repaints exactly on f252 (20.2k px changed at half res vs <= 44 px/frame inside either shot); caption tone dark | dark.",
     "fix": "None."
    }
   ]
  },
  {
   "cut": "S04|S05 film 16.59 s (Main f497|f498), dive matchcut on the lock",
   "pass": false,
   "score": 6,
   "problems": [
    {
     "severity": "major",
     "at": "Main f497 -> f498, Pip (full res)",
     "problem": "Pip jumps (+345, +166) px on the cut. Sleeping centroid goes (262,1126) -> (606,1292) and width shrinks 127 -> 108 px (-15%) while the camera is still zooming in. The lock disc (x 424-540/y 868-970 -> 424-538/868-978), label L5 and Bit hold, which makes the jump obvious. Pose (asleep) and facing (left) match. S04.md and S05.md each list this as the other lane's open major. S04 shows that none of its options work: S05's spot maps under the bottom UI during S04's creep, and the tag blocks the alternative.",
     "fix": "Fix on the S05 side, in src/scenes/scene05/cast.tsx `PipOnRail`. For scene t in [0, 0.30] s, draw him on a short sleep-pose hop() (height ~40, keeping rollOver's 14 deg settle). Start from S04's last-frame screen feet (~(270,1150), scale 1.30), converted with toWorld(c0, ...) as Scene05.tsx does for discFrom/S04_SPOT. Land on PIP_RAIL (screen feet ~(606,1316)). Move the 16.76 'z' pop to after the landing (cut+0.30). This turns the teleport into one sleepy tumble along the dive's outward direction, and the rail, the 19.376 leap and the S05|S06 cut stay untouched. The cheaper alternative is PIP_RAIL at screen x ~270 (a straight +166 px drop on the cut), but the leap to (1420,1440) would then need ~37% more speed and the verified S05|S06 hand-off would have to be redone."
    },
    {
     "severity": "major",
     "at": "Main f498 (16.600 s), caption band",
     "problem": "S05's first frame shows a half-scrolled stale page. 'for like fourteen years' with its peach highlight sits at the band top while 'before researchers' rolls in under it. The page change starts at 16.57 (page 9 s 16.61 - 0.04 lead), and a 2-line page cannot clear in the one frame before f498.",
     "fix": "Captions data. In src/data/captions.overrides.json add \"8\": {\"out\": 16.535}, and in src/data/captions.json add \"out\": 16.535 to page index 8. Result: f496 stays settled, f497 (S04's last frame) gets one scroll frame, and f498 has an empty band plus 'before researchers' rolling in. 'years' ends 16.57, so at most ~1 frame of overlap."
    },
    {
     "severity": "minor",
     "at": "Main f494-f498, sun",
     "problem": "The sun leaves S04 off the top-right during the dive (f493 centroid (1022,650), gone f494-f497). It pops back in on f498 at (902,761) (S05 SUN (885,790) r110, partly behind the wing). That is S05's storyboarded slot, but a large orange disc reappearing on the matchcut frame pulls the eye off the lock for a moment.",
     "fix": "Optional, in Scene05.tsx: hold SUN about 60 px further right/up for the first 0.3 s, so it slides into its notch instead of popping. Or accept as is."
    },
    {
     "severity": "minor",
     "at": "Main f497 -> f498, lock box",
     "problem": "S04's hair cobweb on lock4's top-left corner (hub ~(451,920)) is missing on S05's lock box (S04 request 3 is still open). The lock face also changes from keyhole to blueprint section by design. Ink ~5 px box / 2.2 label on both sides, the paper edge repaints exactly on f498 (19.4k px vs <= 2.3k inside the dive), and the tone is dark | dark.",
     "fix": "Optional, in Scene05.tsx: draw the S04 hair web (r ~28 px, ~2.3 px ink, fanning up-left from the box's top-left corner) for 16.59-16.89."
    }
   ]
  },
  {
   "cut": "S06|S07 film 21.985 s (Main f659|f660), lens-sheet hold then S07 pull-back",
   "pass": false,
   "score": 7.5,
   "problems": [
    {
     "severity": "major",
     "at": "Main f660-f661 (22.000-22.033 s), caption band",
     "problem": "Page 10 ('They gave the PHP / people a heads-up,', no `out`) is still settled on S07's first frame f660. On f661, the first frame of S07's pull-back and page-curl reveal, it is half-scrolled: 'people a heads-up,' with its highlight sits at the band top, 'but word got out before' rises under it, and the sheet's black title bar passes between them. 'heads-up,' ends 21.92 and the next page starts at 22.01.",
     "fix": "Captions data. In src/data/captions.overrides.json add \"10\": {\"out\": 21.935}, and in src/data/captions.json add \"out\": 21.935 to page index 10. Result: f658 stays settled; f659 (S06's last frame, the held white page) gets one scroll frame; f660 is empty (q 0.73); 'but word got out before' rolls into an empty band on f661."
    },
    {
     "severity": "minor",
     "at": "Main f653 -> f662, Pip",
     "problem": "Pip leaps straight up after the sheet at the left (f652 (156,1461) -> f653 (150,1332), facing left), then is hidden by the full-frame page for 8 frames (f654-f661). S07 brings him in from the RIGHT, moving left at 57/50 px/frame (f662 (799,838), f663 (742,853)), and lands on the board top at f665 (~(697,888)). Facing (left) and scale (h 112 -> 98) carry, but his screen direction reverses behind the white page.",
     "fix": "Optional, in src/scenes/scene07: start his drop-in arc from behind the shrinking sheet's top-left area (moving right/down) instead of from (1150,880) off-frame right. Acceptable as is, because the full-frame page is a true wipe."
    },
    {
     "severity": "minor",
     "at": "Main f656-f661, the page move",
     "problem": "Checked and acceptable. The move is: push-in (page log-scale +0.43, +0.56, +0.54, +0.7 per frame, f652-f656), a dead stop with the page held f656-f660 (5 frames, inside the voice pause 21.92-22.05), the cut inside the hold, then S07 pulls back from rest (bug-circle radius 283 -> 220 -> 120 -> 72 -> 48 -> 44 -> 40, f660-f666). That reads as in, beat, out. The page is identical across the cut (bug circle centre (774,1445) r283 on f658/f659/f660, title bar same, ink same). FixSign matches: S06 J3 card ~144 px wide, lettering ~113 px, one line 'still fixing...', ink ~2.6 px; S07 J4 card ~131 px (f672) -> 139 px (f690), lettering 107-110 px, one line, same ink and string (fs 26 vs 25 world, within 5-9%). The S07 sign writes itself on f666-f669 as part of S07's pen-like set reveal. The S06 sun (433,940) is covered by the page from f655; S07's storyboarded sun hop rises from f663. The paper edge cannot be seen on the white frames; S07's edge arrives with the reveal (f661) and settles by f663. Tone dark | dark.",
     "fix": "None needed."
    }
   ]
  }
 ]
}

---

## fix:S02|S03 film 8.393 s (Main f251|f252), hard cut on 'password'

S02|S03 cut at f251|f252: the Pip fix is in `src/scenes/Scene02.tsx`. The caption fix is cross-lane, so I tested it only in a scratch copy and the real caption data is unchanged. Nothing committed.
- **Major, stale caption page (cross-lane, not applied):** before, page 3 sat settled over S03 on f252-f256 and was half-scrolled on f257-f258. With page 3 `out` 8.335 in the scratch copy: f250 is settled, f251 (S02's last frame) is the one scroll frame, the band is empty f252-f257, and 'It's in PHP,' rolls in on f258. capcheck on f246-f261 there: 0 FAIL, 0 warn.
- **Minor, Pip's slow frame (fixed):** I changed `S03_PICKUP.v` from (-1133, 257) to (-1300, 1000), not the audit's (-1000, 1250). Rendered, that one turned Pip's path 17 deg on the cut frame, because Pip rotates slightly on S02's last frame. Measured at full res, speed per frame f249-f252 was 58, 42, 55 and is now 55, 54, 55, with heading 103 -> 120 -> 130 deg. Position on f251 (861, 850), pose, size and facing are unchanged.
- **Minor, thin ink on S03's first frame:** no change, by design. Sun, paper-edge repaint and caption tone are as the audit found.
- **QA:** S02 PASS (life 10.0, 0 errors, 0 warnings); S03 PASS (life 10.0, 0 errors, the same 3 ui-zone warnings). Both run on the real files, with captions unchanged. Notes added at the end of `docs/scenes/S02.md` and `docs/scenes/S03.md`.
- **CROSS-LANE (exact):** `src/data/captions.overrides.json` add `"3": {"out": 8.335}`. `src/data/captions.json` page index 3 (the "take over a site" line) append `,"out":8.335` before its closing `}`. This replaces S03.md's older 8.393 request, which would still leave the page half-scrolled on f252-f253.
- **Strips:** /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s02s03/strip_S02S03.png (f248-f255), /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s02s03/after_cap.png (caption band, f248-f259; before: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s02s03/before_cap.png), /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s02s03/after_pip.png (Pip, full res).

---

## fix:S04|S05 film 16.59 s (Main f497|f498), dive matchcut on the lock

1. Pip: before, he jumped (+345, +166) px on the cut, from centroid (261,1125) to (606,1291), width 127 to 108. After, f497 to f498 is (261,1125) to (257,1130), width 127 to 123: asleep, facing left, leaf on his head, scale 1.30. He then drops and rolls onto the rail over 0.30 s (no overlap with L5), tilting 14° and settling as before. The rail, the 19.376 leap and the S05|S06 cut are untouched (`src/scenes/scene05/cast.tsx` `S04_PIP` / `pipRailPose`, `src/scenes/Scene05.tsx`).
2. 'z' pop: it stays at 16.76 on 'before', so no beat moved off its word. Instead of jumping to the rail spot, it now rides beside his head until he lands.
3. Captions: before, f498 showed 'for like fourteen years' half-scrolled. The auditor's index "8" is wrong (page 8 is 'before researchers'); the right page is index 7. I tested the fix on a sandbox copy: f496 settled, f497 one scroll frame, f498 empty band with 'before researchers' rolling in. Needs the data lane (below).
4. Cobweb (minor, fixed): S04's hair web is now on S05's lock box top-left corner for cut to cut+0.30 (`src/scenes/scene05/plan.tsx` `LockWeb`), matching S04's within ~4 px.
5. Sun (minor): accepted. On a cut the sun is already in its new slot, and sliding it in would add a third moving thing to the matchcut.
6. QA: S05 PASS (life 10.0, 0 errors, 2 bottom/rail UI-zone warnings). S04 PASS (0 errors, 1 right-rail warning, already noted in S04.md). tsc clean. S04 code unchanged; a note is appended to `docs/scenes/S04.md` and `docs/scenes/S05.md`.
7. Commit status: I committed nothing, but another session's commit 8cc336d already includes my `Scene05.tsx`, `scene05/cast.tsx` and `scene05/plan.tsx` changes. Only the two doc notes are uncommitted.
8. CROSS-LANE (exact): in `src/data/captions.overrides.json` add `"7": {"out": 16.535}`; in `src/data/captions.json` add `"out": 16.535` to page index 7 ("This bug was in there / for like fourteen years").
9. Strip: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s45/S04S05_strip_f494-f510.png

---

## fix:S06|S07 film 21.985 s (Main f659|f660), lens-sheet hold then S07 pull-back

Before -> after for each problem:
1. Major, caption page 10 at f660/f661: confirmed on a render. f660 showed page 10 settled, and on f661 it was half-scrolled across S07's reveal with the title bar between its two lines. The fix is in `src/data`, which is outside my lane, so it is listed under CROSS-LANE below and not applied in the repo. I tested it on a sandbox copy (f658-f662 at full res): f658 settled, f659 has one scroll frame on S06's held white page, f660 has an empty band, and on f661 'but word got out before' rolls into an empty band. Nothing stale or half-scrolled shows over S07.
2. Minor, Pip's direction reverses behind the page (f653 -> f662): kept as is. An earlier S07 fix round (A1 r2) moved his entry from left to right on purpose because the lens sheet hides a left entry until he lands. The full-frame white page (f654-f661) works as a true wipe, and his facing and scale carry.
3. Minor, the page move (f656-f661): confirmed acceptable, no change.

QA: run in the sandbox with the caption fix applied. S06 gate PASS (life 1/1, framecheck 0 errors, 1 ui-zone warning). S07 gate PASS (life 1/1, framecheck 0 errors, 2 ui-zone warnings). No code changed in my lane. I only added the cut notes to `docs/scenes/S06.md` and `docs/scenes/S07.md`. Nothing is committed.

CROSS-LANE (exact): in `src/data/captions.overrides.json` add `"10": {"out": 21.935}`. In `src/data/captions.json` line 12 (page index 10), change `{"s":19.98,"e":22.05,` to `{"s":19.98,"e":22.05,"out":21.935,`. Also add page 10 (21.935) to the out list in the Captions section of `docs/WRAPUP.md`.

Strips (before / after): /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s0607_before_strip.png and /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s0607_after_strip.png
Full-res caption band f658-f662: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrapcuts/s0607_after_band.png


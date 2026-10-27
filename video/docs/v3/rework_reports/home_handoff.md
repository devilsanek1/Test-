# HOME lane (SQB, SQC): handoff (stopped on the orchestrator's request, 2026-10-27)

**Built: nothing yet.** `scenes/SQB.tsx` and `scenes/SQC.tsx` are still the engine lane's G5b placeholders; no
`SQB_*` / `SQC_*` files exist. The session got through setup (`npm ci`, the Python deps) and the reading only.

**What the reading found (to save the next builder time):**
- `home_set.tsx` already has what SQB needs: `<HomeSet T card={...} />` draws SQB's chart in H1 px right after the card's
  paper. `CARD`, `PLOT`, `plotPt` (u 0..1 = 2005..2026), `YEAR_U` are exported. The card face (title 58, subtitle 34,
  axes, 2005 and 2025) is drawn there from 0.24, so SQB only adds the line, the doodles, the hook, "+9.7%" and the source.
- Kit `LineChart` still draws its axes with `poly(..., {over: [4, 10]})` and its own title and years. Draw SQB's line as a
  plain clean `TPath` (a graphic stroke, 9 px, `EMBER.hero`) over `plotPt` points, with your own partial-polyline
  progress. Don't use `LineChart` (CRAFT §c's grep, and the card face would be doubled).
- Voice word starts (`public/v3/voice_words.json`, key `words[].{w,s,e}`): Which 5.80 · Laptops 7.08 · better 7.88 · same
  8.52 · money 8.68 · Usually 9.48 · buy 10.60 · one. 10.92 · But 11.48 · past 11.88 · US 12.92 · computers 13.56 ·
  up 14.52 · almost10% 14.84 · Mostly 16.60 · your 17.24 · laptop 17.40 · runs 17.96 · memory 18.28 · chips 18.76 ·
  And 19.40. These match flow_v2 §4's beat times.
- `ThreadPlane` takes `children` (drawn phone-local, under the screen dim). The SQC stick leaves the phone for screen
  centre, so draw it in screen space after `<ThreadPlane />`, starting from `threadAt(T).listingScreen`.
  `threadAt(18.28)` is at HIGH2.
- Setup notes: the container's checkout was a detached HEAD behind origin. `git merge --ff-only origin/video-production`
  fixed it. cv2 was not installed (`pip install opencv-python-headless`).

**Left:** everything in brief_H: SQB (5.80-16.60), SQC (16.60-19.40), and the checks (tsc, stills, CRAFT, check_light,
density, the seam probe for J1/J2) and the final report `home_SQB_SQC.md`.

**J3Stick request:** this session never saw or filed one; status unknown here.

**REQUESTS:** none.

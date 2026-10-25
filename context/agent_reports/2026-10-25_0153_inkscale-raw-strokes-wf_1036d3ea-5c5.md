# Workflow inkscale-raw-strokes-wf_1036d3ea-5c5.js (run wf_1036d3ea-5c5, last activity 2026-10-25 01:53 UTC)

Script: `context/workflows/inkscale-raw-strokes-wf_1036d3ea-5c5.js`

---

## build

All raw stroke widths in `src/scenes/shared/props/**` and `src/scenes/shared/sets/**` now follow the ink factor, except four that are deliberately left alone (below). `npx tsc --noEmit` is clean, and every scene I rendered is pixel-identical before and after.

The premise didn't hold in the current S01, though: the change makes no difference at the dive end. The Lock outline, the BrowserChrome frame and RollerShutter in the plaza already draw their lines with `<Ink>`, which already applies the factor. The cream padlock and the ring around the door lock belong to the scene's own code and also use `<Ink>`. At 4.0 → 4.70 the lock and window frame lines thicken by about the same amount as the set lines (x1.2–1.6, roughly what the 3x dive should give with compensation). Nothing stays 2–3x heavier.

**Files changed** (not committed)
- Props: `Lock.tsx`, `BrowserChrome.tsx` (`LoadingRing`), `SunMorphs.tsx`, `Shutter.tsx`, `Figures.tsx`, `Labels.tsx`, `Glyphs.tsx`, `Bit.tsx`, `Diagram.tsx`, `Elephant.tsx`, `FixSign.tsx`, `Tablet.tsx`.
- Sets: `GovernmentPlaza.tsx` (pennant chevron), `DomeCity.tsx` (searchlight).
- Each component calls `const ks = useInkScale()` once at the top, before any early return, and multiplies the width by `ks` at the end of the expression. With `ks` = 1 every value is unchanged.
- **Not compensated, on purpose:** four strokes that are really shape, not linework. Thinning them would leave gaps or thin limbs. They are the coloured band of the loading ring, the peephole's cream rim, the question mark's cream body, and the Attempter's arm. Each has a comment saying why.
- The `SunPie` rim inset now uses the compensated width, so the rim stays on the slice edge.
- Docs: the open-request lines in `docs/SHARED_PROPS.md` and `docs/SHARED_SETS.md` are now marked done, with the list of what changed and the exceptions.

**S01 line widths (px, full-res renders), before = after at all three times**

| Line | 4.00 | 4.55 | 4.70 (dive end) |
|---|---|---|---|
| Padlock body | 3.56 | 3.88 | 5.09 |
| Shutter box top | 4.40 | 3.33 | 5.34 |
| Door frame, left | 3.63 | 4.37 | 5.37 |
| Door frame, right | 3.95 | 3.58 | 6.36 |
| Building line, right | 3.41 | 3.85 | 5.05 |
| Door Lock outline | 1.65 | 2.00 | 3.00 |

At 4.70 only: padlock shackle 7.04 (scene-owned padlock), shutter side 4.98, shutter slats 2.51, back-soon tag 3.63, pediment 5.76, door-lock ring 5.49, plaque frame 2.49, ground line 3.26.

**Pixel identity (PIL)**
- Other agents broke the live tree mid-check (S02, then S08), so I didn't compare live renders. I rendered two frozen copies of the project instead, identical except for the original vs edited shared folders. For S08 both copies use the earlier working version of its scene files.
- 20 of 20 frames identical: S01 (4.0, 4.55, 4.70), S02 (0.6, 2.0, 3.4), S08 (2.0, 6.0, 9.5), S11 (1.5, 3.5, 5.5), plus S05, S07, S10, S12 at two times each.
- An earlier pair of copies also matched (S01, S02, S08, S11, 12 of 12 frames).
- The S01 command you gave, run on the live tree, matches the "after" copy exactly.
- To show the factor actually does something, I rendered a test page in a scratch copy with the props at factor 1 next to factor 0.5. The raw strokes come out visibly thinner at 0.5.

`docs/ENGINE.md` section 4b still lists these raw strokes as coverage gaps. That's another lane's doc, so I didn't edit it.

Renders and scripts are in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/inkraw/`:
- `s01/` — the S01 command you gave, run on the live tree
- `C/` and `D/` — before and after
- `full/` — full-res S01
- `inktest/f00003.png` — the factor 1 vs 0.5 test page
- `cmp.py` and `measure2.py`

---

## review

Not ok. The shared-lane change itself is correct, but one claim in the report is wrong and the change has three small in-lane inconsistencies.

**1. At the dive end one line is still about 3x heavier than its neighbours (S01 lane, not this one).** In my live S01 render at 4.70, the right edge of the govB window (where the shutter meets the window frame) is a solid 17 px ink bar. The left edge of the same window is 5 px, and the set lines are about 5–6 px. At 4.385 the bar is 7 px. So the report's "Nothing stays 2–3x heavier" is false here.
- **Cause:** `src/scenes/scene01/screens.tsx` lines 46 and 63 draw the dark dead-screen and CRT glass as `<Fill d={rectPath(-1, -1, w + 5, h + 5)} .../>`. That spills 4 world units past the window, to hide the screen fill's misregistration, which is at most 4 screen px. It's a fill, so it's never compensated, and it grows x2.9 in the dive.
- **Fix:** make the spill a fixed size in screen px. Add near the top of screens.tsx:
```tsx
import {useXf} from '../../lib/xf';
import {matScale} from '../shared/props/common';
const Glass: React.FC<{w: number; h: number; seed: string}> = ({w, h, seed}) => {
  const k = Math.max(1e-3, matScale(useXf()));
  return <Fill d={rectPath(-1 / k, -1 / k, w + 5 / k, h + 5 / k)} color={palette.ink} offset={false} mode="none" seed={seed} />;
};
```
  Then replace the two Fills with `<Glass w={w} h={h} seed={`${seed}/crtg`} />` and `<Glass w={w} h={h} seed={`${seed}/dg`} />`. It has to be rendered as a component: BrowserChrome calls `content()` as a plain function, so a hook directly in the callback would break the hook rules.
- **Tested in a scratch copy:** at 4.70 the 17 px bar becomes two normal 6 px and 5 px lines, like the left edge. 4.385 is unchanged at 7 px.
- scene01 is off-limits, so hand this to the S01 lane. Also soften `docs/SHARED_SETS.md`, which says "everything inside S01's plaza `<InkScale>` is compensated". That's true of strokes, but fills are never compensated.

**2. Hub dots and a rim don't thin with their lines (this lane).** The engine's ClockHands shrinks its hub with the factor (`r={w * 0.9}` with `w = width * useInkScale()`); these don't:
- `SunMorphs.tsx`, HoursClock: `<circle r={sw * 0.95} fill={color} />` → `r={sw * 0.95 * ks}`
- `SunMorphs.tsx`, MinuteWedge: `<circle r={w * 1.3} fill={palette.ink} />` → `r={w * 1.3 * ks}`
- `Glyphs.tsx`, QuestionMark: the hook's ink rim is compensated but the dot's isn't. `<circle cx={x} cy={dy} r={body * 0.62 + w} fill={palette.ink} />` → `r={body * 0.62 + w * ks}`

**3. Text stand-in bars now thin, but the text they swap to doesn't (this lane, minor).** Below 7 px on screen, labels draw a bar instead of `<text>`, and text is never compensated. Inside an `<InkScale>` the bar is now thinner than the text it becomes at 7 px, so the weight jumps at the swap. Remove `* ks` from:
- `Labels.tsx` ~l.112, InkTextBlock: `Math.max(0.6, L.fs * 0.14) * ks`
- `FixSign.tsx` ~l.148: `Math.max(0.6, fs * 0.14) * ks`
- `FixSign.tsx` ~l.182: `Math.max(0.6, ffs * 0.14) * ks`

Keep `* ks` on the strike-through, which is an ink line.

**4. ENGINE.md is now out of date (core lane).** The "Coverage gaps (raw strokes)" paragraph in section 4b still lists the shared props and sets, plus the chevron at "~l. 914". It should say they're done (see SHARED_PROPS.md / SHARED_SETS.md section 1), keeping only FigureWiper and the lib/cine pieces.

**Checked and fine:**
- **The diff:** it only adds `* ks` to `strokeWidth` values, plus the SunPie rim inset, imports, hook calls and comments. No other logic changed.
- **Missed strokes:** grep finds no raw `strokeWidth` left in shared props or sets except the four intended exceptions. There are no `strokeWidth` style keys, no `<line>`, and no `ks` used outside a `strokeWidth`, so nothing is compensated twice through `<Ink>`. No scene passes pre-compensated widths into these props.
- **Hooks:** all 27 `useInkScale()` calls are at the top level of components, before every early return, never in loops or callbacks. None of these components is called as a plain function (`withOut` renders `<C/>`).
- **Types:** `npx tsc --noEmit` exits 0.
- **Scenes without an InkScale:** I rendered a HEAD worktree before and after applying `git diff -- src/scenes/shared`, at full resolution, so the other lanes' scene edits don't mix in.
  - Pixel-identical: S03 1.5/4.0, S09 2.0/6.0, S12 1.0/2.5, S08 6.0, S01 4.0/4.70.
  - S01 4.55 at HEAD differs only in the Bit's shell highlight (box 126,371–138,378), which now thins as it should.
  - The worktree is removed.
- **S01 at 4.70, looked at:** the cream padlock, the door lock and its ring, the shutter box and the door frame all read at the weight of the surrounding set lines. Only the window edge in point 1 stands out.

The disk filled up (ENOSPC) partway through, mostly from about 170 leftover `/tmp/remotion-webpack-bundle-*` folders of ~54 MB each. Other lanes rendering at the same time may hit the same error.

Everything is in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/inkraw/review/`:
- `s01/f00141.png`: live S01 at 4.70
- `jamb_before_after.png`: the window edge before and after the fix
- `fix/S01/`: S01 renders with the fix
- `headA/`, `headB/`: HEAD before and after the shared patch
- `s01_137_diff.png`: the Bit highlight difference at 4.55

---

## fix

I fixed the three in-lane items (2, 3 and 4). Item 1 is real but its code is in `scene01/` (off-limits), so it is written up for the S01 lane. At the dive end the 17 px bar at the right edge of the govB window is still there (5 px on the left edge), as expected until the S01 lane applies its fix. tsc fails with 6 errors, all in other lanes' files (`Scene05.tsx`, `Scene11.tsx`, `scene05/cast.tsx`), none in shared code. I did not commit, but the workflow's own WIP commits (9ead74d, 3def858) have already picked up these edits.

**Verification of the claims**
- **Item 1:** confirmed. `scene01/screens.tsx` lines 46 and 63 draw the glass fill 4 world units past the window, and the reviewer's before/after crop shows the bar. My render at 4.70 measures the same 17 px vs 5 px.
- **Item 2:** confirmed. The engine's `ClockHands` hub in `lib/Sun.tsx` shrinks with the factor (`r={w * 0.9}`, `w = width * useInkScale()`); these three dots did not.
- **Item 3:** confirmed. The stand-in bars were thinned, but the `<text>` they swap to at 7 px is not.

**Code (`src/scenes/shared/props/`)**
- `SunMorphs.tsx`: the HoursClock hub is now `r={sw * 0.95 * ks}` and the MinuteWedge hub is `r={w * 1.3 * ks}`.
- `Glyphs.tsx`: the ink rim on the QuestionMark dot is now `r={body * 0.62 + w * ks}`.
- `Labels.tsx`: removed `* ks` from the stand-in bar in `InkTextBlock` and added a comment saying why. The strike-through keeps `* ks`.
- `FixSign.tsx`: removed `* ks` from both stand-in bars. The `useInkScale` import and hook call were then unused, so I removed them too; the file is now identical to what it was before the ink-scale change.

**Docs**
- **`docs/ENGINE.md` section 4b, "Coverage gaps":** now says the shared props and sets are done (pointing to SHARED_PROPS.md / SHARED_SETS.md section 1). Only `FigureWiper` and the `lib/cine` pieces are still listed as raw. I removed the "~l. 914" chevron reference and added a note that fills are never compensated, so a world-unit spill past an edge should be sized in screen px.
- **`docs/SHARED_PROPS.md`:**
  - FixSign is out of the compensated list, and Labels is now listed as "`InkTextBlock` strike" only.
  - It records that the hub dots shrink with their lines.
  - The "deliberately not compensated" list now includes the sub-7 px text stand-in bars (`InkTextBlock` and both FixSign bars) and all fills.
- **`docs/SHARED_SETS.md`:**
  - Softened to "every ink STROKE inside S01's plaza `<InkScale>` is compensated; fills never are".
  - Added the open request for the S01 lane (the screens.tsx glass spill, with the reviewer's screen-px `Glass` component fix).
  - Noted that GovernmentPlaza's own `crtContent` (tealDark glass, around line 771) has the same world-unit spill. S01 doesn't use it because it passes `windowSlot`, so I left it unchanged.

**Hand-off to the S01 lane (item 1):** in `src/scenes/scene01/screens.tsx`, render the two glass fills through a small component that sizes the spill in screen px:
```tsx
const k = Math.max(1e-3, matScale(useXf()));
rectPath(-1 / k, -1 / k, w + 5 / k, h + 5 / k)
```
It has to be a component, not a hook call inside `crtContent` / `deadContent`, because BrowserChrome calls `content()` as a plain function.

**Renders:** I rendered S01 at full resolution at 4.385, 4.55 and 4.70. To check my own edits, I rendered 4.70 from a temporary copy of the repo with the new edits reversed; it was pixel-identical to the render with them, and the same frame rendered twice matched. I removed the copy and my bundle temp folders afterwards and did not delete other lanes' `/tmp/remotion-webpack-bundle-*` folders; the disk has 9.3 GB free.

**For the S01 lane:** compared with all of the reviewer's 01:36 renders, the current tree at 4.70 differs only at the "back soon" tag string. The string now stops at the top of the eyelet instead of running through it (box 567,514–570,558). My edits don't cause it, since the frame is identical with them reversed.

Files are in `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/inkraw/fix2/`:
- `f00132.png`
- `f00137.png`
- `f00141.png`
- `string_cmp.png`
- `pre/f00141.png`


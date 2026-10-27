# L1 handover (V2S1, the hook): work in progress

**Done (first build, not yet reviewed):**
- `src/v2r/scenes/V2S1.tsx`: the shot. World sky = paper; `XG` camera = the map's pull-out about W (`s1Zoom`);
  `Look cascade` from SUN0 (at 0.02, speed 4800); K6 `S1Set` with K4 `Her` (behind the door at 153 px, steps out
  0.97 via `s1RowAt`, lockstep step count `herStep`, look back 5.59, coat paper until 0.30), `GhostRow`, K5 `PipTrack`
  (head follows her 1.25, earsCover 4.98, sit 5.55, hop up-left 5.90 to (560, 1010)); `captionTone` dark.
- `src/v2r/scenes/V2S1_sky.tsx`: `SkyFlood` (mint sky + gold band flood as a growing disc from SUN0, f2-f5) and
  `SunHalf` (frame-0 half-coloured sun + loose ink ring, only before the flood).
- `src/v2r/scenes/V2S1_public.tsx`: the steps' public (own rows: low 7 / mid1 5 / mid2 3 seated + 6 near head-backs at
  hv 160-184 so heads stay <= ~140 px wide, owner rule), cups / turns / phone / beside props, a dog trotting down 2.80.
- Typecheck clean for these files. One still pass rendered (14 frames, Film2R 0-5.7 s, 0.5 scale), NOT yet inspected.

**Next:**
1. Look at the stills (`GL=angle node scripts/render-frames.mjs Film2R <dir> 0,0.05,0.15,0.3,0.5,1,1.6,2.1,2.6,3.5,4.8,5.1,5.3,5.7
   --entry=src/entry-v2r-film.tsx --scale=0.5`): check the flood order (her coat last), the cascade granularity (Batch
   fills flood per batch bbox), the near-head widths, nothing in y 317-556, Pip's hop arc >= y 600, the f0 ink state.
2. The canal kit's S1Set already carries most S1 life (cyclist 0.25, bus 1.1, birds 1.40 / 4.98, duck 2.3, chimney 0.7,
   pigeons 0.15, jogger 1.6 / 3.25); still to verify: the "..." stop 4.54-4.98 (her `walk` pose with a frozen step
   count; maybe switch to stand), the 4.98 one step together, the ambience of the stop, a far window lighting at 1.80.
3. Pull for `report_KIT.md` (not landed yet) and apply its fixes.
4. Review files, critic loop (brief_L1.md), the six-viewer cold read, then `report_L1.md`.
References extracted at 216 px: reference 1 and v1 frames (regenerate with ffmpeg fps=1, scale=216:-2; never commit them).

## 2026-10-27, second helper (ultracode), handed over before building
No code changed (V2S1*.tsx are still the first helper's build). What I did: rendered the build (it works: 14 stills
in ~3 s after a ~22 s bundle; a 0-6.5 s clip at 0.5 scale in ~30 s), extracted reference 1 / v1 frames at 216 px, and
ran a critic round 0. `density.py` on the 0-6.5 s clip, after `pip install opencv-python-headless`: **PASS, 7.5 ev/s,
max gap 0.53 s, flat 25 %, 343 objects/frame, detail 48 %.** (The critics saw an earlier copy of density.txt that
still held the cv2 traceback, so ignore their "density never ran" point.) `report_KIT.md` had not landed yet.
**Critic round 0, FAIL** (art director + sound-off lenses finished; the standards / timing lenses and the code map were stopped). Musts, by agreement:
1. **The ghosts read as a queue of white gowns or shrouds (a death read), not copies of her.** Each needs HER silhouette:
   coat cut (collar, hem flare), the bun, a mid-stride lockstep with a visible ~25 px leg scissor, and clear gaps
   between figures (they bunch shoulder to shoulder; widen toward ~55-60 px clear). The fill change (e.g. a
   desaturated tint vs paper) is a TREATMENT question: paper + whole-head value is the spec, so raise any change as a REQUEST.
2. **The doorway is shared:** a grey-haired figure in mustard stands or walks beside her at 0.6, so she reads as half
   of a pair walking IN. Keep the doorway hers alone from 0.40 to 1.40. Make the glass leaves visibly slide (frames + glints).
3. **A plum walker with a dark bun (x ~680-760, 4.7-5.8) carries her head signature.** Recast: no plum, no bun, no long coat within 300 px of her.
4. **The life on the far towpath hides the row:** the cyclist crosses her at the G1 pop (2.00) and covers the three bare
   outlines at x 0-200 (4.98-5.95). Keep x 0-220 clear 4.5-6.1 and nothing over her or G1 at 1.8-2.4. Draw the bend visibly.
5. **The bottom third is sparse versus reference 1:** bare paving, gaps of 180-250 px. Go to 20-24 seated people, staggered
   and overlapping, with specific dressing (leaves, a picnic cloth, a guitar case, a pram, a dog). Life every 0.4-0.8 s,
   >= 40 px of motion. Turn a few sitters toward each other so the steps don't read as an audience.
Shoulds: the five birds at 1.40 are too small (30-40 px wingspan, arcing across SUN0); Pip's ears-cover at 4.98 doesn't
read (make it a whole-silhouette change) and the bollard is too small (a 40-50 px post); W reads as a flat black hole
(add bars in ink and the plant ring on the sill); "She quit Google." vanishes at 1.88; the dive at 6.00 reads as a centre zoom (an engine push-through, so check
its origin is W). My own read of f0 at full size: the bike (bottom right) and a blue double line are already in colour at
f0 (they should be ink only); the far roofs / bridge in the west gap are bare vertical lines that don't read; the plane branch reads as noise.
**Next:** fix the musts (most in `V2S1_public.tsx` and `V2S1.tsx`; the ghost shape is in the cast kit's `Ghosts.tsx`:
work around it in a `V2S1_*.tsx` helper plus a REQUESTS line); then the review loop, the six-viewer cold read and `report_L1.md`.
Review tooling (scratch only, not committed): a script that renders 20 key-time stills, three full-size frames (0 / 0.6 / 5.3),
the busy / calm strips, a labelled 216 px sheet beside ref 1 / v1, the 0-6.5 s clip and density. Run density with `python3 -I scripts/qa/density.py <clip>.mp4`.

## 2026-10-27, third helper (MAX + ultracode): parts split, builders running
- `V2S1.tsx` is now the assembly only (camera, Look cascade at 5800 px/s from SUN0's screen spot, slots); the shared clock and
  contract is `V2S1_clock.ts` (floodAt, `s1Step`: the stop at 4.54 freezes the row exactly mid-stride (x.5), one step on
  "life"; `KEEP_CLEAR` zones for the far-towpath life; the lookalike radius). Parts: `V2S1_set` (S1World), `V2S1_row`
  (her + ghosts), `V2S1_steps` (+ `_public`, our bank), `V2S1_pip` (Pip + bollard; no Pip at t < 0, L6's request).
- Four builders run in local git worktrees (branches `l1-row`, `l1-set`, `l1-steps`, `l1-pip`, scratch only) with a part
  critic loop each; their files are merged into video-production when they pass, then the brief's critic loop and the
  six-viewer cold read. If this session dies: the pushed stubs render; restart the builders from the fix lists above.

## 2026-10-27 15:10 UTC, third helper: CONTROLLED PAUSE (owner's 5-hour limit), state for the resume after 18:30
**On video-production (pushed, typecheck clean, renders):** `V2S1.tsx` (assembly), `V2S1_clock.ts` (the contract),
`V2S1_row.tsx` + `V2S1_row_fig.tsx` (+ dev entry `V2S1_row_entry.tsx`): her + the ghost row FINISHED (one figure for her and
every ghost: belted long coat, collar, low bun, sleeves without hands, a ~27 px scissor on both freeze phases, slim, 15-20 px
gaps; ghost legs in the head value clamped at G3; outlines knocked out); `V2S1_set.tsx` + `_set_core/_far/_life/_wing.tsx`:
the world FINISHED (f0 line drawing of roofs / bridge / water flooding away region by region, door leaves that slide and
stay visible, W dark with bars + lamp + chair + plant ring, recast far life on KEEP_CLEAR: jogger 1 runs WEST 0-0.9 instead
of passing her at 1.60, jogger 2 passes her ~3.85 (one constant `S1_JOG1` in `_set_life` if the 1.60 pass is wanted), the
bridge cyclist 0.25 at 150 px/s, birds over SUN0, the bend, every stroke ink). `stylecheck_L1.md` answered.
**Still stubs on video-production:** `V2S1_steps.tsx` (+ `V2S1_public.tsx`) and `V2S1_pip.tsx` (no Pip at t < 0 already).
**Work in progress, backed up on the remote:** `l1-wip-steps` (517744b: our bank redrawn: stone, hands-free stacked crowd,
props, life; the builder was mid-way, STYLE v2 merged in) and `l1-wip-pip` (73f62b7, the first builder's 8b21e45: bollard
at every t + Pip from t 0; the ears-cover readability not yet done). Also `l1-wip-row`, `l1-wip-set` (= what is merged).
**Stopped agents:** workflow run `wf_3fa1231e-0f1` (script `<scratchpad>/tools/builders_v3.js`, a pipeline of 4 time-boxed
continuation builders, 2 at a time): build:row and build:set DONE (cached); build:steps (agent a177a176, continuing the
stacked crowd) and build:pip (agent a29aadf5, had just started) STOPPED. Same session: resume with
`Workflow({scriptPath: <scratchpad>/tools/builders_v3.js, resumeFromRunId: "wf_3fa1231e-0f1", args: {parts: [row, set,
steps, pip], until: {row: "15:20", set: "15:35", steps: <new>, pip: <new>}}})` (row / set keep their until so they stay
cached). New container: `git worktree add` from `origin/l1-wip-steps` / `l1-wip-pip`, link node_modules per package.
**Next, in order:** (1) finish steps + pip (2 agents); (2) merge them (`git checkout l1-steps -- <V2S1_steps*, V2S1_public>`,
`l1-pip -- <V2S1_pip*>`), typecheck, render; (3) STYLE v2 deltas the builders did not have: birds, lamp posts, railings and
the bollard NOT plum (kit defaults), flyers ceil 600, one or two thin cloud bars at 5-15 px/s in y < 290, the near-row low
bun takes a light hair, no dark-bun extra within 300 px; the bare outlines O1-O3 sit on the brick bridge (read as brick
figures at 216 px: a lighter backing behind x 40-160, y 930-1060); (4) review files (`<scratchpad>/tools/review.py <video>
<out> --clip --qa`: density --only V2S1, deadframes, camspeed, colour_meter, band check on Film2RBare); (5) at most 2 critic
-> fix rounds (`<scratchpad>/tools/critics.js`: the brief's prompt + standards / motion / completeness, 2 agents at a time);
(6) the six-viewer cold read once (`<scratchpad>/tools/coldread.js`, args {dir: <review>/coldread}); (7) report_L1.md.
Budget (orchestrator 14:34): <= 2 agents at a time, <= 2 critic rounds, shot-only 0.5-scale renders, one cold read.

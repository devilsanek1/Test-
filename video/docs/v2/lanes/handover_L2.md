# L2 handover (V2S2 "The wall"), 2026-10-27

**Done:** reading and planning only; no scene code written yet (`src/v2r/scenes/V2S2.tsx` is still the engine placeholder).
Setup checked: `npm ci` OK, the headless shell path in remotion.config.ts exists, `CanalSample-S2` renders
(`GL=angle node scripts/render-frames.mjs CanalSample-S2 <dir> 3.0 --entry=src/entry-v2r-canal.tsx --scale=0.5`, ~0.4 s/frame).

**Findings that shape the build:**
- Kit times are FILM seconds (map.ts `S2.*`, K4 `Staffer`/`Reporter`/`StaffWindow` defaults read `useTime()`): wrap the scene
  body in `<TimeShift by={-6.1}>` (lib/time) so every kit default and map time lands right.
- `S2Set` (kit/canal/sets.tsx) is a good base but fork it into `V2S2_Set.tsx` for layering: the A-board must be drawn
  BEFORE `Newsstand` to slide out from behind the kiosk (8.44); the kit's near busts (hv 280/304, ~260 px wide
  shoulders) break the owner's people rule (heads <= ~140 px wide): pass `people={false}` / draw 3 `NearBack`s at
  hv ~200 (x ~330 / 560 / 760); the passing boat pops in at x ~1021 (bow starts at u 13): start it at u 17, ~1.4 u/s,
  from ~7.0 film s; lower the near lamp (`h` ~1290) so its arm stays below y 600.
- Story windows: `storyOverlay(w)` -> K4 `StaffWindow` (pane={false}; the set draws 'cool' via `staffCoolAt` 8.96),
  `lightAt` 8.96 + i*0.04, `backAt`/blind half 10.26 + i*0.085, W2 full at 12.20; HER -> an ink ring drawn on at 6.82.
- Camera: own `<g>` matrix: pull 1.12 -> 1.00 about (200,795) 6.10-6.70 (InkScale `inkCompFactor(z,0.6)`), float ~10 px/s
  back to 0 by 12.80, push 1.06 about W2 8.50-12.80; so W2 = W2_CUT at 12.98.
- Pip: `PipTrack` INSIDE the camera group at S2.pipSeat (590,1050), size ~100, facing back; enter with a hop from
  bottom-left (~(-60,1250), t0 ~6.14, land by 6.70); target the bench until 8.30, then target W2 (335,785); hop 12.85
  dur 0.25 to the world-space inverse of S3.pipSeat under the 1.06 push, height 50/1.06 (hopAt is linear, = map
  `pipHopS2S3At`).
- No K3 boards kit yet (L5): draw the TOLD THE BBC A-board in `V2S2_Board.tsx` (face 160-560 x 1050-1250: heading 56 px
  baseline ~1104, body 30 px on 3 lines ~1142/1174/1206, credit 20 px ~1236; plum frame) + a newsagent (K4 Person) who
  pushes it out; swap to L5's StatementBoard when it lands (REQUEST line in the report).

**Next:** write V2S2_Set.tsx / V2S2_Board.tsx / V2S2.tsx, render review files per brief_L2.md, critic loop, report_L2.md.

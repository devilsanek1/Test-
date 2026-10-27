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

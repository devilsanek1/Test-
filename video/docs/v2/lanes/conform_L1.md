# Conform brief L1: V2S1 (the hook) = the G4 look clip

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` for values only.
Where `handover_L1.md` or TREATMENT disagree, this brief wins. Budget: ONE agent, ~75 min, a commit every ~20 min; only
your shot, 0.4 scale (`--gl=angle --concurrency=2`). This shot is the owner's next approval (the look clip): polish 0-2
s.

## 1. Frame 0 drawn in the clean pen (DIRECTION rule 9; replaces the bare-ink f0)
- t < 0 (the loop underlay) and f0: paper; everything but the subject lands as flat PALE shapes (each fill a pale step
  toward the paper, no lines); the subject's outline draws on, one stroke per object (her behind the glass door, the door,
  W), from t ~-0.26 so f0 shows it mid-draw, with Pip's tinted line (B's lines draw on with the subject; no colour before
  the flood, so a full-colour Pip at f0 is out: DIRECTION rule 9); the sun half-coloured as now (the flood starts from
  it). Then the flood from SUN0 by 0.30 s, Pip with it, her teal coat last (keep `FLOOD`, `HER_COAT_AT`).
- `Look cascade` floods from white only (`lib/Fill.tsx` ~l.213-217). The opt-in pale pre-state (`cascade.pale`: before
  the wave a fill is `mix(colour, paper, pale)`; unset = today's paper) is the integrator's engine edit (THROUGHLINE §7);
  if it has not landed when you reach frame 0, add exactly that, check one v3 frame is pixel-identical, and list it under
  REQUESTS. Export the t < 0 state for L6 (S8 un-builds onto it) and tell L6.

## 2. Join out, A push-through into W (THROUGHLINE §3)
5.95-6.25 as built; its `to` becomes [335, 785] (the integrator's scenes.json; L2 moves her window there). Retire the 5 %
pull-out (`s1Zoom` = 1.00 at every t; every S1 spot is its zoom-1.00 value): hold locked or the 2D float (eased legs within
+-12 px, home by 5.90). Pip stays on its bollard (700, 1235): delete the 5.90 hop (the zoom sweeps it out). In 5.80-6.40
nothing enters, pops or turns but the dive.

## 3. Thread: W (860, 700) 150 x 170, on screen 0-6.25
A `LitWindow` (L* 85-92, no glow) to 0.40, then the plum anchor (the lamp click). A at 0-0.40 and 5.59-6.25.

## 4. Foreground: no stranger's back (DIRECTION rule 3)
Every seated row nearer than the step by the water goes (the near head-backs at y ~1800, the rows at ~1600 and ~1450:
rows of seated backs in front read as "you"). Those steps (y ~1350-1920) hold things only: step edges as flat 2-tone
bands, a tote, two takeaway cups, a folded newspaper, a scarf left on a step, a bike cut by the bottom-right, a planter of
grasses, a few leaves as flat shapes; the bottom third stays the densest band. The seated public stays only on the step
by the water (feet y ~1280, the mid ground, ~60 px), half at rest, no two alike, no dark bun or long dark coat within
300 px of her (look-alike rule).

## 5. Tiers (CRAFT §b)
A: her + the ghost row (+ the three outlines on 4.98) · W (0-0.40, 5.59-6.25) · the glass door with its canopy letters
(0.45-1.40; the letters pop on "Google" 0.97: a pop is A's, never B's). B: Pip, the seated public by the water. C:
everything else (the far jogger too). Only A has a full outline; C draws none (hairlines for wires and rails). Kit
defaults hold; promote with `WingFront wTier` / `tier` / `<Tier>`.

## 6. Life (<= 3 noticeable supporting movers at once; the hook's novelty is her build only)
Keep: the hero cloud (2 px/s) + one thin bar (y < 290), the bus once on the far bridge, ONE far jogger, small (C, <= ~60
px) on the far bend, never crossing her or the row, birds lifting at 1.40 (small, far: her step out), one window switch
at a time >= 2 s apart, one slow chimney puff, pigeons at rest. Cut: the birds at 4.98 (the hit is the row's), the
bridge cyclist, the duck, the dog trotting down our steps, water glints, every near-step move.

## 7. Light: RIG_CANAL (`src/v2r/world/rigs.ts`; if the integrator has not pushed it, create it FIRST from
`src/entry-v2r-light.tsx`'s `TINT_CANAL` + `CANAL_EVENING`, add RIG_APRIL per THROUGHLINE §5, push before anything else)
- Key: SUN0 low at the left; shadows fall right and a little toward us (`toward` ~15, `el` 36, cap 0.8 h).
- Contact: her, every ghost and outline, Pip and its bollard, the seated public, bags, bike, planters; the moored boats get
  a cast-strength strip at the waterline (never a contact strip on water). Cast: her and the row (parallel), lamp posts,
  the bollard. FormShade on the right of round things. The wing's fins cast short shades right on the facade (`Shadow`);
  the canopy underside and the step risers one `Shade` step. Rim on her coat's left edge only.

## 8. Line
THROUGHLINE §6 "Line": the global pen already cleans every stroke, so don't strip `INK_PX` or sketch options by hand;
tier your pieces, author A outlines at `INK_PX.mid` or wider, and delete the hand-drawn marks in `V2S1*` (ripple dashes,
brick and stone dabs, leaf specks). The ghosts keep their one closed outline (A on their beat).

## 9. Keep exactly
Frame-0 words, source line, box keys; the exit ding (0.45); her figure, walk, look back; the ghost row (figures, timing,
the stop 4.54-4.79, the step on "life", the outlines); wing, door, canopy, W; the far towpath bend; `KEEP_CLEAR`; Pip's
ears-cover on "life" (its one reaction).

## 10. Report (<= 12 lines, `docs/v2/lanes/report_L1.md`, pushed last)
- The look clip: Film2R frames 0-450 (0-7.5 s, S2's opening from L2) at 0.4 scale with voice; its path.
- `check_light.py` A/B (`--props='{"lightOff":true}'`, the sky flags of THROUGHLINE §5) at 0.5, 3.0, 5.3 (`--subject`
  her + the row): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 3.0 and 5.3: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line <= 3 %.
- Eye check at phone size every 1 s (her / W / the row); movers at 2.0-3.0 <= 3; stills at f0 (lines and pale shapes
  only, the sun aside), f9 and 5.3 (no stranger's back; y 317-556 pure sky); `npx tsc --noEmit -p .` clean; REQUEST lines.

## 11. Depth tooling + the particles slot (2026-10-27; `src/lib/DEPTH.md`, CRAFT §f, THROUGHLINE §5b)
Your S1 depth pass is by hand; the engine has landed, so pull it where it saves work:
- **The slot:** fill `S1Particles` (V2S1.tsx) with `<Particles>` from `src/lib/particles.tsx`, inside the `<Lit>`, `t0`
  0.30 (after the flood), `joins` [6.10], `avoid` [CAPTION_BAND, her box]: `motes` over the west gap on the far rows'
  shade (`sun` = SUN0), `glints` in `glitterPath({x: 196, yFar: ~1112, yNear: ~1212})` with `horizon` 965, one
  `leaves` from the plane branch falling down the left gutter (x < 95, `floor` the bottom). This is the owner's newer
  note: §6's cut water glints come back ONLY as this small field. `particleProblems(fields, {joins: [6.1]})` clean.
- **Haze:** `atmos(c, k, S1_HAZE)` (`lib/depth`) in place of `hazeBatch`'s sRGB `mixHex`: same k, but a far brick
  converges on the air instead of greying; behind the pale wing the far city reads from +3 (`planePalette` merges a far
  row's materials into 2-3 close values).
- **The corner:** `backing(tierFill(stucco, 'environment'), farField, {tier: 'environment'})` gives the far silhouette's
  value behind the lit fin (>= 15 L* SHOWN, the pen's pull included).
- **Check:** copy `scripts/qa/depth_sheets/v2_g4_look_s1.json` to `v2_s1.json` with your two-point VPs and the
  current planes, then `check_depth.py` at 3.0 and 5.4: no FAIL (the G4 clip FAILs all three: no air, melts, elevation).

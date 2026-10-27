# Conform brief L2: V2S2 (the wall of windows)

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` for values only.
Where `handover_L2.md` (its builder-A list included) or TREATMENT disagree, this brief wins. Budget: ONE agent, ~60-75
min, a commit every ~20 min; only your shot, 0.4 scale (`--gl=angle --concurrency=2`). **Do 6.10-7.5 s first:** it is the
look clip's one transition; push it as soon as it plays and tell the orchestrator.

## 1. Her window takes the match spot M (the thread; THROUGHLINE §1.2)
- Her dark office window moves to **M (335, 785), 133 x 164** (= map `W2_CUT`); the staff window that sat there moves to
  her old spot (200, 795), 125 x 155. The five staff windows now sit round hers: (200, 795), (465, 776), (460, 948),
  (330, 955), (190, 960). The 12.20 "contracts" full blind-down goes to (465, 776), beside hers.
- 6.82 "one": the ink ring is board notation (`G5_BLOCKING.md` §2, never a drawn circle). Instead her window's own A
  outline pops on (one frame; DIRECTION rule 8 keeps draw-ons for frame 0): one closed 3.0 px line in the frame's own
  deep warm shade (CRAFT §c, `WingS2 storyTier`). It is the only full outline in the frame; her pane stays the plum
  anchor all shot (the thread's reaction: the one dark pane).

## 2. Joins
- **In, A push-through** out of S1's W (5.95-6.25; the integrator sets `to: [335, 785]`): the 12 % pull-back 6.10-6.70 is
  now about M. Pip is already seated on its railing post (590, 1050) on the first frame: delete the hop-in (6.14-6.70).
- **Out, B match** at 12.98: her dark office window at M -> S3's lit home window at M, same spot and size. Retire the 6 %
  push (8.50-12.80); keep the 2D float (straight eased legs turning every 0.6-1.5 s, within +-12 px) and land it home
  exactly at 12.98. Pip at (590, 1050) on both sides: delete the 12.85 hop. Move the notebook clap from 12.85 to <= 12.70:
  nothing enters, pops or turns in 12.78-13.18.

## 3. Foreground: no stranger's back
Delete every head-back at the bottom (the beanie, the cap, the passer-by gliding left to right, the planned cyclist and
jogger head-backs). The bottom third holds things: York-stone paving as long 2-tone bands, a drain cover, a few fallen
leaves as flat shapes, the planter of grasses (left), a bike locked to the near lamp-post's foot (right; the lamp in
CM.line, slim, x ~1030: send its final x / y / h / w / colour to L3, who holds it across the match), newspaper bundles and a
crate at the kiosk foot, the dog lying at rest by the kiosk. The bench (reporter, staffer) stays mid ground.

## 4. Tiers (CRAFT §b)
A: her dark window · the five staff windows (lights 8.96, silhouettes, half blinds 10.26-10.60, the last blind 12.20) ·
the TOLD THE BBC board (K3 `ToldTheBBCBoard`, promoted from its slide-out at 8.44). B: Pip (head to the wall on "But"
8.30: its one reaction), the reporter (notebook 9.48), the staffer (turns 9.48; the hood moves from 10.36 to ~10.85, after
the blinds: never two story actions at once), the newsagent. C: the wall's other ~400 windows (one batched LOD path;
any switching stays away from the story panes and never within 1 s of 8.96 or 10.26-10.60), canal, the passing boat,
far walkers, pigeons, urn steam.

## 5. Life (<= 3 noticeable supporting movers at once, taking turns)
Keep: the board's slide (8.44), the passing narrowboat (from the right edge ~10.65, steady), one far walker per towpath,
urn steam, parapet pigeons lifting once. Cut: the dog's trot, paving pigeons fluttering, every near head-back move, any
far mover that pops or stops in open view (movers enter and leave at an edge or behind a mass, already moving).

## 6. Light: RIG_CANAL (`src/v2r/world/rigs.ts`)
- The sun is off-screen left (west): shadows fall right and a little toward us (`toward` ~15, `el` 36, cap 0.8 h).
- The wall: planes turned from the sun one `Shade` step; window reveals and fins cast short shades right; the lit staff
  panes are `LitWindow` (L* 85-92), cooling to white at 8.96 in one step; blinds are flat warm-shade shapes, no ink.
- Contact shadows: bench legs, board legs, kiosk, planter, bike, lamp foot, Pip's post, reporter, staffer, newsagent.
  Cast: the board, bench, lamp post, the three people. FormShade on round things (planter, bins, Pip). No rim (no subject
  here is a figure).

## 7. Line
In `V2S2_*` delete `INK_PX.*` per-element weights and every `over` / `breaks` / `jitter:` / `drift` / `misreg` / `open` /
`exitLoose` option, hatching, ripple dashes, stone dabs, leaf specks; delete the paper-white pictograms. Keep rng
placement jitter. Swap the stand-in board for K3's `ToldTheBBCBoard` (L5's API, its README).

## 8. Keep exactly
The wall and its receding geometry; the staff windows' story and timings; the bench figures and their actions (but the
hood's time); the board's slide-out and text; Pip's head turn; the near lamp.

## 9. Report (<= 12 lines, `docs/v2/lanes/report_L2.md`, pushed last)
- 0.4-scale clip of Film2R 5.9-13.2 s (S1's dive in, S3's first frames out), path in the report.
- `check_light.py` A/B at 7.0 (`--subject` her window) and 11.0 (the staff windows): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 10.0: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line px <= 3 %.
- The match: frames 12.95 / 12.98 / 13.00 side by side: M at (335, 785) 133 x 164 and Pip at (590, 1050) in both.
- Eye check at phone size every 1 s (her window -> the board -> the five windows -> the blinds); movers at 10.3: <= 3; a
  still at 11.0 with no stranger's back; `npx tsc --noEmit -p .` clean; REQUEST lines for map.ts if any.

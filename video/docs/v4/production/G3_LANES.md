# Video 4, G3 phase B: the board lanes (2026-10-30)

Read `BRIEF.md` (this folder) first, then this page. The stage spec is `video/docs/G3_ANIMATIC.md` (it wins; §1-§4:
the principle, the signal contract, the placeholder vocabulary "loose never means empty", motion at G3), the drawing
spec `video/docs/look/STORYBOARD_STYLE.md`, the kit `video/src/lib/g3/README.md` (read it and `types.ts` first; the
helpers `video/scripts/g3/g3kit.py`; the lint `video/scripts/g3/board_lint.py`), the locked visual script
`video/docs/v4/visual/VISUAL_SCRIPT.md` (v3; its blocks, sync points, caption seats, delegated calls), the camera plan
`video/docs/v4/camera_plan_g3.md` (the contract: shot type, framing, the move's five values, the join's device and
carrier, the tier map, the rig, the life list), the world bible `video/docs/v4/WORLD_BIBLE.md` (the sets, the rigs,
the tiers, the resident; ONE camera: horizon y 1150, VP (540, 1150)), `video/docs/look/CRAFT.md` §a (carriers A-F, at
most 2 plain cuts; the film has one, on "But"), §b (tiers), §f (planes), `video/docs/look/SOUND_SYNC.md` §4 (the sync
points are on the board's sfx track), the playbook's Hook and pacing and Storyboard (G3) and flow.

**The lanes (one set owner each; shots and times are the skeleton's: never change a shot's id, times or join type):**
| lane | shots | owns the set(s) |
|---|---|---|
| L1 | S1 hook, S7 "WANTS", S11 into homes, S12 payoff | the home view (the snowy street, the block, the one window, the resident, the far city, the pipe run under the street, the home and the phone) |
| L2 | S2 computer, S3 really hot, S4 forty kettles, S5 a lot of tea | the giant computer (outside, its top, the kettles at its foot, the mug) |
| L3 | S6 the planet, S8 the plan | the planet view; the plan site (chalk walls, the 2027 tag) |
| L4 | S9 how?, S10 water | the computer's side opening and inside it (the hall, the water in pipes, the vanishing point) |

**How a lane works (never touch another lane's files or `public/v4/animatic.json`):**
1. Your builder `video/scripts/v4/build_L<n>.py` (g3kit) writes your panels and sets to `video/public/v4/lanes/L<n>.json`
   (`{"shots": [...], "sets": {...}}`).
2. Your local board: copy the skeleton `video/public/v4/animatic.json` to `video/public/v4/lanes/L<n>_board.json` once,
   land your file into it with `python3 -I scripts/g3/merge_panels.py public/v4/lanes/L<n>_board.json
   public/v4/lanes/L<n>.json`, lint it (`board_lint.py`, the TODOs are your to-do list), and render it through your own
   entry `video/src/entry-v4-L<n>.tsx` (a copy of `entry-v4.tsx` with `id="G3ReelL<n>"` and
   `animatic="v4/lanes/L<n>_board.json"`): stills at each of your shots' start, peak, landing and join frames
   (`node scripts/render-frames.mjs G3ReelL<n> out/v4/lanes/L<n> <times> --entry=src/entry-v4-L<n>.tsx --scale=0.5`,
   one render at a time), and a short clip of your shots (`render-media.mjs` with a frame range if supported, else stills).
3. Another lane's set: reference it by its id as the camera plan says; for your local tests draw a minimal stand-in
   in your own file under a `stub_` id, and say in your notes what the owner lane's set must contain at your join.
4. Joins across lanes (S1->S2 L1/L2, S5->S6 L2/L3, S6->S7 L3/L1 the one plain cut, S7->S8 L1/L3, S8->S9 L3/L4,
   S10->S11 L4/L1): draw your side exactly as the camera plan's join row says (the device, the carrier, the frame);
   write the frame and what the carrier is at that frame in your notes so the assembler can match the other side.
5. Notes `video/docs/v4/production/lanes/L<n>.md` from your first step: what each panel shows, its tier map, its life,
   the joins, the lint's last result, open questions; a contact sheet `out/v4/lanes/L<n>_sheet.jpg` of your stills.

**The bar:** the animated sketchbook (G3_ANIMATIC §1): story, joins, framing, every camera move, transition and key action
PLAYED with real shape and timing; density and life as grey placeholders (loose never means empty); monochrome; it reads
with the sound off; each panel's tier-A subject is where the eye goes; the thread (the warm water / the heat) on screen.

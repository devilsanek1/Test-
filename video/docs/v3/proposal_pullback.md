# v3 proposal: S9 + S9b as one S5 pull-back crane (APPROVED by the owner 2026-10-26: "pretty good, continue, swap")

**Play:** `deliverables/v3/v3_proposal_pullback.mp4` (17.40-24.68, 540p 30 fps, voice), from composition `AnimaticProposal`
(`src/entry-v3.tsx`). It reads `public/v3/proposal_pullback.json`: the locked board with only S9 + S9b replaced, built by
`scripts/v3/build_proposal_pullback.py`, lint 0 / 0. `animatic.json` and `src/v3/film/` are untouched.
**What changes:** one panel S9, 19.40-22.68 (scale, 25 elements). It cuts in on "And" and out on "They"; only the cut on "By"
goes. Start: your back in MCU, head turned right (hair and the ear side, no face), raising your one stick (S8's drawing,
matched on the object) against the brick stack; the only view out is the slot. Move: 19.40-21.98 (155 f at 60 fps) on
cubic-bezier(0.55, 0.03, 0.50, 1.0), then a hold to 22.68. That is Arcane #55's shape at 3.5x its speed (the owner: speed
it up for a reel). The far plane slides 1 W, peaking at 14.5 px/f at 20.75. Frame 1 moves at 3 % of peak, under 5 % from
21.88; you shrink 5x; roll 0. Planes are element moves on one p: far x1.11 to 1 from 1080 px right, mid x2 to 1 from
920 right / 300 up, clutter box to box (~x0.3), deck x5 to 1 pinned on (480, 1430); the pot crosses on its own at 90 px/f.
Beats: sticks rise in the slot and streak behind the stack (to 20.05); the darkest beat (to 20.60); the pot hides the
hand-over to tiny you (20.67-20.83); its trailing edge uncovers the hall, its sign and the sticks pouring in; the summit
swings in at 21.10, is at x 967 on "By" and lands on "mountain". End: tiny you (180 px) at OUR ROOF's parapet, stick up;
the deck lines and the lit street lead to the dark hall, and the mountain of ~65 px sticks runs past the right edge.
Sound: our own swell peaks with the burst (`v3_pullback_swell.wav`), and `v3_thoom.wav` hits on "mountain" (21.72).
Engine (additive): SketchReel moves take `s`/`o`/`lin` scale and a bezier ease; board_lint checks each subject when on screen.
**Why:** D1's payoff (your one stick vs their mountain, with the roofs streaming sticks: O1's cause at city scale) comes in
one move at 47 % of the film, right after the fastest cuts (S7 1.68 s, S8 1.12 s), with a reveal about every 0.5 s.
O1 stays a 5 % pull-out, S1 leaves the film, and the scale dose stays 3.28 s.
Board choices: the sign is 48 px roof letters (the hall's own box gives 20 px text); the chimneys have pots (notches read as
battlements); at 30 fps the far plane peaks at 29 px/frame, over the 15 px budget (G5 renders at 60 fps).
**Gate:** do a sound-off cold read of 21.3 s and 22.3 s (do the mound's sticks read, and your one stick vs theirs?), then show
the owner a 25 % playable of 18.28-25.24. If the read fails, fall back to D3: S5 inside S9 only, keeping S9b's cut.
**If yes, G5 rebuilds:** one set replaces the finished `S9.tsx` (106 lines) and `S9b.tsx` (56). It reuses RoofLedge,
DataCenter 'hall', TownBand, Snowfall, StickFlight, Pile, YouTiny and the ShotCam/Layer rig. New: a standing back view of
you, the brick stack, the chimney pot and the mid roofs; build it as one checkpointed task. Also: one S9 row in
scenes.json; S9 merged into animatic.json (S9b goes); the S9/S9b rows merged in camera_plan_g3.md and storyboard_g3.md;
STORYBOARD_STYLE §7: "an S5 lands on the tiny figure instead of a scale cut". The contact sheet shows S9 at 19.5 and 22.4 s.

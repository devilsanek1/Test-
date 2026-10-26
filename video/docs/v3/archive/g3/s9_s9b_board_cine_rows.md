# v3 G3: the S9 + S9b rows as they stood before the S5 merge (archived 2026-10-26)

Locked means dropped: the owner approved the S5 pull-back crane ("pretty good, continue, swap"), so S9 (rise-over,
19.40-21.32) and S9b (worm's-eye scale cut, 21.32-22.68) became ONE panel S9, 19.40-22.68 (`docs/v3/proposal_pullback.md`,
`public/v3/animatic.json`). The rows below are verbatim copies of the replaced rows; the live docs carry the merged S9.
The board data before the merge is in git history (`41abf5a^:video/public/v3/animatic.json`).

## From `docs/v3/storyboard_g3.md` (board v3, fix round 1), panel table

| Panel | Time (s) | The one idea | Shot type | What we see | Camera |
|---|---|---|---|---|---|
| S9 | 19.40-21.32 | AI data centers run on memory chips too, lots of them. | SCALE 2/3: S1 rise-over reveal (the one big move), `scale` | Start: OUR ROOF (a mid parapet with a light coping lip and one vent, cut by both sides; "OUR ROOF" in the notes) fills from screen y 880 and hides half of the data center, a wide hall cut by both side edges; its roof units and its sign (AI DATA CENTER, on the building) show. The roof drops out while seven sticks (150 px) fly in from the side edges just over the roof units from 19.95 and dive into it. Land (20.8): the hall cut by both side edges (1290 px on screen), a row of small paper houses at its foot (~1:7), plain sky above, our roof's lip at the bottom. | RISE: camera y 1080 to 960, zoom 1.00 to 1.04, `unveil` ease, landing at 20.8; the roof's own 373 px drop runs `outSine` over the whole panel (peak 14.6 px per 30 fps frame on screen) |
| S9b | 21.32-22.68 | ... by the mountain. | SCALE 3/3: CUT to a WORM'S-EYE, tiny figure, `scale` | Ground-level camera, the horizon low at y 1500: the mountain of memory sticks (1480 x 880, ram-sized sticks) runs past both side edges up to just under the caption band; their data center small at its foot; tiny you (86 px, 10:1) on the paper ground in front, holding your one stick. | HOLD |

## From `docs/v3/camera_plan_g3.md` (board v3), the plan table

| Panel | Time (s) | The one idea | Shot type | Framing | Cozy / scale element | Move | Readability note |
|---|---|---|---|---|---|---|---|
| **S9** | 19.40-21.32 | AI data centers run on memory chips too, lots of them. | **SCALE: S1 RISE-OVER REVEAL**, the film's ONE big move; it lands in an S3-style one-landmark frame | Eye level at roof height. START: our roof ledge (mid-grey mass with an ink lip, cut by both side edges) fills from y ~860 down and hides the lower half of the data center; only its roof, top rows and 56 px AI DATA CENTER sign show (top at y ~648). LAND (on "centers", ~20.8): the ledge is a thin foreground lip cut by the bottom (top y ~1380); the data center whole and centred (~447 px wide, roof y ~760, base y ~1210) on a low town band; plain sky above. | SCALE by comparison: the building ~4-5x a house in the town band. 4 planes: ledge, landmark, town band, sky. | **RISE**, 19.40-21.32, ease-out (visibly landed by ~20.8, drifting into the cut on "By"). Two layers, because the board has no parallax: the camera rises (y 1080 to 960, z 1.00 to 1.04; the world sinks ~120 px, so the roof never enters the caption band) while the ledge drops 384 px on its own move with a sine ease-out over the whole 1.92 s (520 px on screen with the camera; the camera lands at 20.8 with the `unveil` ease; peak 14.8 px per 30 fps frame on screen). Sticks (170 px) arc in from the side edges only from 19.75 (the roof is 48 px under the caption band at the start), into the roof. Animated, so no red mark. | Both end frames pass as panels: the start says "an AI data center behind our roof", the landing "memory sticks pouring into it". This replaces board v2's 140 px rise, which read as a nudge. |
| **S9b** | 21.32-22.68 | ... by the mountain: their memory dwarfs everything. | **SCALE CUT to a LOW ANGLE** (worm's-eye, K7), with a tiny figure | Ground-level camera, horizon low at y ~1200. The pile of memory sticks is the subject: a tall mound (w up to 460, h ~560) from the horizon up to y ~620, just under the caption band. The data center at its foot is half its S9 size (w ~220, mid role). Plain paper ground with one ground line. | SCALE: tiny you at the pile's foot, bottom left: board v2's 86 px mid figure (0.045 H, 5 px outline; 0.03 H would be a 15 px speck on the cold read), holding your one stick drawn 2x. Pile to you ~6.5:1 (the caption band caps the pile at ~580 px); the half-size data center at its foot carries the rest. | HOLD (the cut is the move) | The cut changes the angle (eye level to ground level) and the size (the building halves), so it steps up from S9 instead of repeating it: S9 and S9b are ONE scale moment of 3.28 s. The low angle goes on the pile (the quantity), never on the company's building (no villain). Drops the light ground block one reader called meaningless. |

## From `docs/v3/camera_plan_g3.md`, the notes strip table

| Panel | Line 1 | Line 2 |
|---|---|---|
| S9 | S9 · SCALE: RISE-OVER (the one big move) · CUT | Over our roof: the AI data center, sticks pour in |
| S9b | S9b · SCALE CUT: LOW ANGLE, tiny you · HOLD · CUT | Their mountain of memory vs your one stick |

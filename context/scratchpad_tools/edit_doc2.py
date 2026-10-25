p='/home/user/Test-/video/docs/scenes/S03.md'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old[:80], s.count(old))
    s=s.replace(old,new)
rep('''  (808.2, 680.1)). Unchanged. Fix round 2: the hopping disc is drawn above the side rows, so it is whole on S03's side
  (checked: Main f425 shows the full disc in front of R1-R3's roofs).
- **Pip into S04:** he crouches at **screen (410.0, 1438.4)** facing right (world (420, 1405) under the 1.04 lock). S04
  now imports S03's `PIP_AT` and `CAM_LOCK` (scene04/cast.tsx), so the hand-off cannot drift: checked Main f425 / f426,
  Pip ~405 -> ~412 px, the sun whole on both frames (S04 keeps it in front of its hero house).''','''  (808.2, 680.1)). Unchanged. Polish round 1: the disc is drawn BEHIND the side rows until the anticipation squash
  (13.845), then in front of them for the hop, so it is whole on S03's side at the cut (checked: S03 f164-f173).
- **Pip into S04:** he crouches at **screen (410.0, 1438.4)** (world (420, 1405) under the 1.04 lock), polish round 1:
  facing **LEFT** (`flip`), the way S04's settle-hop carries him (screen x ~425 -> ~374, to S04's PIP_AT). S04 imports
  S03's `PIP_AT` and `CAM_LOCK` (scene04/cast.tsx), so the position cannot drift; the FACING is the new contract
  `PIP_CUT_FLIP = true` (scene03/cast.tsx). **S04 must keep `flip: true` through its crouch and settle-hop**
  (scene04/cast.tsx `pipState`, the `t < b.pipTakeOff` and hop branches; import `PIP_CUT_FLIP`). Until it does, the film
  shows Pip facing left on S03's side (f422-f425) and right on S04's (f426+): a facing pop at the cut (checked with a
  scratch S02-S04 film entry). The crouch curve is unchanged (S04 continues `0.2 sin(...)` exactly).''')
rep('''- **The count is on blade SIGNS, not facade plaques; R1 and R4 swap roles.** Facade plaques at 2x on the side walls
  would sit at the frame edges (L1 at x ~0-70, R1 entirely under the right UI rail). A sign projecting from a side
  facade is parallel to the picture plane in one-point perspective, so it reads undistorted and sits INWARD of its
  facade. R1 (screen x ~1000-1100, all under the rail) is now one of the three non-PHP sites and R4 a PHP site
  (`S03_BLANK` = L3, L5, R1; count order P, L1, R2, L2, R3, L4, R4). The storyboard's '7 plaques tick, 3 blank plates on
  L3, L5, R4' becomes '7 signs tick, 3 blank plates on L3, L5, R1'. The count signs use a SOLID ink elephant, not the
  plaque prop's line-art emblem (only a silhouette reads at ~23 px on a phone).
- **The non-PHP screens never light** (the storyboard has every screen light): 7 lit pages with an elephant and 3 dark
  screens repeat the 7/10 pie on the street.''','''- **The count is on the SCREENS, not facade plaques (polish round 1: ONE street encoding).** The fix-round-2 blade
  signs on iron brackets (six elephant plates + three blank plates in a staircase at y 1040-1270, touching each other and
  walkers' heads, plus seven elephant pages on 'websites': ~16 elephant glyphs) are gone, brackets included. The side
  screens sit in a clean band (screen y ~870-980) that reads at phone size: on 'seven' the press house counts first
  (its plaque, the only plaque kept, pings orange and its lit screen re-pulses), then the six side PHP screens light with
  the elephant page and an orange ping; on 'ten' blank cream pages pop on the three non-PHP screens; on 'websites' the
  PHP pages re-pulse ('cream glow pop'). The storyboard's blanks L3, L5, R4 become **L1, R1, L5** (`S03_BLANK`): L1's
  screen is cut by the left frame edge (x -7..57) and R1's sits under the right UI rail (x 1012-1076), so the two nearest
  sites are the non-PHP ones and every PHP screen is inside x 89-980 (count order P, L2, R2, L3, R3, L4, R4). Elephant
  glyphs in frame at 'websites': 9 (stamp, Pip, press plaque, six pages).
- **The non-PHP screens get a blank page, not an elephant page**: 7 elephant pages + 3 blank pages = the 7/10 pie on
  the street.''')
rep('''- **Pip's pride on 'loves' is `trunk-up` (happy) + lean back + chest stretch**, then sit-front at end(loves)+0.10
  (the storyboard says sit-front + a -0.06 chest pulse, which did not read at phone size).''','''- **Pip's pride on 'loves' is sit-front (happy: closed eye-smiles + closed smile) + a -7 deg lean back (chin up) + a
  1.10 -> 1.0 chest stretch**, held to end(loves)+0.10 (the storyboard's sit-front + -0.06 pulse alone did not read at
  phone size; polish round 1 dropped fix round 2's trunk-up, whose open mouth and trumpet marks read as a cheer).''')
rep('''- **The pie snaps back to solid at 13.78** (w45-0.075) in one frame, instead of a shrink on 'it.'.''','''- **The pie snaps back to solid at 13.81** (w45-0.045: first solid frame f163 = 13.826, 0.03 s before 'it.') in one
  frame, instead of a shrink on 'it.'.
- **The bare plan is all paper** (polish round 1): S03's `FarPlain` (cream to the horizon, the grid running on to it,
  no far skyline) replaces the set's sage far peeks for the whole scene, and the sand street only exists from the
  pop-up (`GroundS03 streetAt`).''')
rep('''- **Near walkers = two `EdgeOnlooker`s at the bottom corners**, 40 px lower than fix round 1, with the near arm, a hood +
  bag strap (left) and a bun + collar (right), rim strips on their sun sides (not BLUEPRINT.walkers: those anchors cover
  the signs and the card).''','''- **Near walkers = two `EdgeOnlooker`s at the bottom corners** (polish round 1: raised 112 / 84 world px, heads at
  world (58, 1420) / (1040, 1388): head tops at screen y ~1400 / ~1363, clear of the stamp (L, x < 150) and the card
  (R, x > 930)), with the near arm, a hood + bag strap (left) and a bun + collar (right), rim strips on their sun sides
  (not BLUEPRINT.walkers: those anchors cover the stamp and the card). The kit's hanging hand read as a bare circle under
  a hairline cuff: S03 draws a coat-dark CUFF band over the top of each hand (`SleeveCuff`, offsets from the kit
  geometry for these seeds / head sizes, `NEAR_CUFF` in cast.tsx), and applies the kit's 1.5 px idle bob itself
  (`bob={0}` on the kit) so figure and cuff move together. Their 'look' is a 6 deg tilt about the neck.''')
rep('''- **Vent puffs x2** (end(PHP), end(loves)), tumbling up-left over the sky left of the press house.''','''- **Vent puffs x2** (end(PHP), end(loves)), three 22 x 27 sheets each, tumbling up-left over the sky left of the press
  house.''')
rep('''- **S02:** keep `S03_PICKUP` in step with S03's `PIP_FROM` (830, 905) / `PIP_VY0` +400 (already done by S02).''','''- **S02:** keep `S03_PICKUP` in step with S03's `PIP_FROM` (830, 905) / `PIP_VY0` +400 (already done by S02).
- **S04 (continuity, polish round 1):** keep Pip `flip: true` from the cut through the crouch and the settle-hop to his
  landing on step 2 (import `PIP_CUT_FLIP` from scene03/cast.tsx), so he faces the way he travels and does not flip on
  the cut. The alternative (S04 aims the hop right, toward the storyboard's step-2 spot (495, 1455)) would need S03's
  `PIP_CUT_FLIP` set back to false.
- **Captions (src/data/captions.json via resolve; orchestrator):** S02's last page 'take over a site / without a
  password.' stays up to 8.605 (0.21 s over S03's bare-plan shot) and S03's last page runs 0.22 s into S04. End each
  page at its cut (8.393 / 14.17) and start the next one on the cut or one empty frame after it (ref-2 grammar).
- **Props (EdgeOnlooker):** a visible cuff on the hanging arms (a coat-dark band or thicker cuff line at hero sizes) would
  let S03 drop `SleeveCuff`; a head-turn (`lookAt`) for back-view onlookers would make 'turn their heads' literal.''')
rep('''- **Sets (BlueprintStreet):** skip the old inked title block `tb` (world 190-470 x 1700-1860) when `titleBlock` is given
  (S03 no longer draws the set's ground, so it is not visible in S03 today); a `gridOrder: 'far-first'` option and a
  `vent: false | Pt` option would let S03 drop `GroundS03` and `VENT_HIDE` / `VentPatch`; draw the ElephantStamp print as a
  flat solid fill (S03's `scene03/stamp.tsx` is the stand-in); a facade `colors` option and per-house `lock` / `plaque` /
  `awning` / blade-sign slots would let S03 drop `SideRows`; per-building `screenOnAt`.''','''- **Sets (BlueprintStreet):** skip the old inked title block `tb` (world 190-470 x 1700-1860) when `titleBlock` is given
  (S03 no longer draws the set's ground, so it is not visible in S03 today); a `gridOrder: 'far-first'` option and a
  `vent: false | Pt` option would let S03 drop `GroundS03` and `VENT_HIDE` / `VentPatch`; a stamp slam timing option
  (`ring` / `drop` durations, ease-in drop) would let S03 drop `StampS03` (kit v3b's solid print is the same look, but
  its 0.13 s ring + 0.27 s in-out settle lands at 9.23, 0.27 s after 'PHP'); a facade `colors` option and per-house
  `lock` / `awning` slots would let S03 drop `SideRows`; per-building `screenOnAt` / screen page slots; a `paper` ground
  mode (plain + grid to the horizon, street from a time) would let S03 drop `FarPlain` and `streetAt`.''')
rep('''None. `StampS03`, `GroundS03`, `VentPatch` / `VentS03`, `SignPlate` and `QuestionScribble` are scene-owned stand-ins
for set / prop changes (above), not shims of missing kit pieces. Every kit piece S03 uses exists in src/scenes/shared
(BlueprintStreet, PerspRow, PopUp, LabelTag, Sticker, SunPie, ElephantEmblem, EdgeOnlooker, Citizen, Bit).''','''None. `StampS03`, `GroundS03`, `FarPlain`, `VentPatch` / `VentS03`, `SleeveCuff` and `QuestionScribble` are
scene-owned stand-ins for set / prop changes (above), not shims of missing kit pieces. Every kit piece S03 uses exists in
src/scenes/shared (BlueprintStreet, PerspRow, PopUp, LabelTag, Sticker, SunPie, ElephantEmblem, EdgeOnlooker, Citizen,
Bit). Kit v3b's ElephantStamp `print="solid"` (the set's `stampAt` + `stampFlip`) was checked as a replacement for
`StampS03`: same print, but its slam is the storyboard's settle (contact 0.40 s after the ring starts, 9.23), not the slam
ON 'PHP' (8.99) that fix round 2 was asked for, so S03 keeps its own.''')
rep('''- `bash scripts/qa/run_all.sh S03` (fix round 2): **gate PASS, life 10.0/10**, 8.28 events/s, longest gap between event
  onsets 0.73 s, longest dead run 0.10 s; framecheck 0 errors, 3 UI-zone warnings (the right rows' detail in the rail,
  R1's blank plate + R2's screen in the rail at 'ten' / 'websites', the near walkers at the bottom: framing only).
  `node scripts/capcheck.mjs S03`: 0 FAIL, 0 warn.
- Render cost: 118 ms/frame at scale 0.5 (QA render, 174 frames, concurrency 2, incl. page setup); 215 ms/frame at full
  1080 x 1920 (24 spread frames, concurrency 2) with the machine at load ~11 on 4 CPUs (fix round 1 measured 69 / 131 at
  a lower load).''','''- QA gate (polish round 1; `scripts/qa/run_all.sh S03` with the render pointed at `src/scenes/scene03/entry.tsx`,
  because the film entry did not bundle while another lane's scene08 file was mid-edit): **gate PASS, life 10.0/10**,
  9.14 events/s, longest gap between event onsets 0.73 s, longest dead run 0.10 s (f50-f52 / f61-f63, the calm before
  the bait, all <= 3 frames); framecheck 0 errors, 3 UI-zone warnings (the right rows' detail in the rail; R1's blank
  page + R2's screen + the right near walker's head tilt in the rail at 'ten' / 'websites'; the near walkers at the
  bottom: framing only). Caption check (24 frames, same entry): 0 FAIL, 0 warn.
- Render cost: 53-96 ms/frame at scale 0.5 (QA render, 174 frames, concurrency 2, incl. page setup, load 3-8); 236
  ms/frame at full 1080 x 1920 (24 spread frames, concurrency 2, load ~8 on 4 CPUs).''')
rep('''- The near walkers' "turn their heads" is a small lean (back-view figures); the far walker's wave is small on a phone.
- R1's blank plate and dark screen sit under the right UI rail (deliberately the non-PHP site).
- The sign row on the left (L1-L5) is dense at the 'ten' beat (five plates in a diagonal); it reads as a street of shop
  signs, but a reviewer may prefer fewer brackets on the blank sites.''','''- The near walkers' "turn their heads" is a 6 deg tilt about the neck (back-view figures, no head-turn prop); the far
  walker's wave is small on a phone.
- R1's blank page sits under the right UI rail and L1's is cut by the left edge (deliberately the non-PHP sites); R2's
  elephant page reaches x 980 (30 px into the rail's x range at its top end).
- Pip's hop-off crouch is the same 0.2 squash as before (S04 continues that exact curve); it still reads more as a
  stand than a deep crouch. A deeper crouch needs both lanes to change the curve together.
- Until S04 keeps `flip: true`, Pip turns round on the S03 -> S04 cut (see Hand-offs).''')
open(p,'w').write(s)
print('written')

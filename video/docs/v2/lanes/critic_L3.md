# L3 critic pass: V2S3 + V2S4 at phone size (2026-10-28, one art-director pass)

Judged at 360 px wide and at 0.4 (frames every 0.5 s, the joins, full-size crops where a number was needed) against the
owner's notes, DIRECTION, CRAFT §f, conform_L3 and the approved look v4.

## MUSTs
1. **S4 20.45-20.55, the birds cross SUN1 in the push-through.** The flock that lifts off G1 at 19.78 cruises west at
   y 632-690, straight through the disc (y 585-715): a bird reaches the right limb at 20.45 and sits on the disc at 20.50,
   magnified by the zoom into the sun. Breaks must-check 3 / conform §2 ("nothing crosses the disc") and CRAFT §f.1 (the
   disc is whole). Fix: `V2S4_wfar.tsx` FLOCK: cruise above the disc (y ~505-540) and lift the `ROW.top` clamp for the
   birds, so they climb west over the sun and leave the frame upward as the push grows.
2. **S4 15.0-20.4, blank cream slabs beside her.** The two rendered garden-wall stretches (stucco and limestone, screen
   #F0E3D3 / #EBE3D5, L* ~91) are flat, near-white rectangles in her band, the lightest shapes after the tag and plates;
   at 19.9 one sits right beside her. They read as placeholder cards and compete with the tag and plates. Breaks CRAFT
   §f.2 (a backing is a real thing of the set, never a blank slab) and DIRECTION 5 (the brightest area on the subject).
   Fix: `V2S4_wpath.tsx` SEGS / wallsInto: the render walls one step down to a warm mid render, plus one tone-on-tone
   recessed panel each (fills only, no lines), so the tag and plates stay the lightest things in the band.

## Passed must-checks (measured)
- S2 -> S3 cut, 12.95 vs 12.98: her window on the M box and Pip on (590, 1050) in both frames; L2's near lamp continuous
  (post x 1015-1044 at y 900, 1014-1045 at y 1300, the arm leaves the right edge at y 657-678 / 657-679, #8F553F on both
  sides).
- S3 -> S4: the dive lands on her plum (14.83-14.89 solid #36223A, no teal bar, no pane edge); her head is on (720, 912)
  at 15.01 / 15.06; nothing enters, pops or turns in 14.66-15.06.
- S4 -> S5: SUN1 at (250, 650) r 65 at 20.35 / 20.40, no lattice line on it (only the birds, MUST 1).
- Life <= 3 noticeable movers in both shots; no stranger's back in the foreground; the walkers are on screen from the cut.
- Squint: S3 her window is the middle's focal dark; S4 the tag / plates and her carry the eye (see SHOULD 2).
- Particles: the glints and the leaves read at 360 px; the far motes are specks, as in the approved S1.
- Her far window: 3/4 in at 16.0 (cut by the left edge), whole at 19.9, never over the plates, the tag or the band.

## SHOULDs (not done now; for the whole-film review)
1. S4 17.96-20.40: her far window's top-right corner (180, 647) is 5 px from SUN1's limb: at phone size they touch (a
   tangent). Fix needs map.ts (window 6+ px left, or SUN1 r <= 60): REQUEST to the integrator.
2. S3 + S4: the hull's full-width dark base band (and in S3 the bench's slate legs) is the darkest mass of the bottom
   third; one Shade step lighter would leave the subject's dark the heaviest at a squint (`V2S3_nboat.tsx`, `V2S4_boat.tsx`).
3. S4 15.8-16.3: the passing walker crosses right behind her shoulder at her own size: at 360 px the two read as one
   clump. Offset his path a body width, or pass him while she is clear.
4. S4 14.92: the pull-back's first frames show the pair's walker large at the left edge beside her head; a later start
   for the pair keeps the landing on her alone.

## Stills judged
`/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/critic/`: `sh_s3.png`, `sh_j2.png`,
`sh_s4a.png`, `sh_s4b.png`, `sh_j3.png`, `sh_dive.png`, `sh_sun.png`, `sh_squint.png`, `cut_match.png`, `farwin.png`,
`backing.png` (from `s04/`, `dive/` at 0.4 and `full/` at 1.0).

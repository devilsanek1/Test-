# G5b fix S10 / S14 (the queue): done, all five review items fixed, none skipped
1. Empty cold bottom: the front row's left wing on the near pavement (snowy hood; a shopper in earmuffs with a bag who leans up the queue, S10 1.0 / S14 1.85; x > 260, head tops >= 1500, clear of S14's shoved van); the near kerb corner (ploughed ridge, 4 bollards, GRIT bin, sledge, bike); grit-slush ruts in the tyre tracks; 5 meltwater puddles with a broken warm lamp reflection and drip rings; the CAFE / BAKERY windows spill warm light across the left pavement. No phone (a big white slab at the frame centre).
2. Pip: S10 on "first dibs" (1.66) switches to `ears-cover`, look -0.35, worried (reads from the back); S14 the slide nets +76 px toward the cab, feet end at screen x ~115, left of the dots, whole body in frame.
3. Bakery awning: `EMBER.beam` (warm) and ends ~40 px short of the first data center's edge (new optional `shop.awEnd`, S10_left only).
4. Warm light: wall-lamp halo outer ring = mix(snow, ring, 0.42); floodlight outer ring = mix(ring, skyLow, 0.18); headlight beam = HALO_SNOW[0].
5. S14 reactions staggered after the cut-in lands: birds 1.42, guard 1.45, bus stop 1.48, kid 1.52, barrier 1.70, wave 1.75.
Meter (0.5 scale, 60 fps, voice): S10 6.2 ev/s, gap 0.58 s, static 0 %, flat 16 %, 225 obj/Mpx, detail 54 % PASS; S14 8.7 ev/s, gap 0.55 s, static 0 %, flat 16 %, 223 obj/Mpx, detail 53 % PASS.
Bottom crop y 1100-1820 (fullness): S10 flat 5 % / detail 68 % (review: 9 % / 56 %); S14 4 % / 64 %.
Locked parts untouched (frame, camera, road, data centers, van + push, sticks, bubble, timings). tsc clean. Files: scenes/S10.tsx, S14.tsx, S10_geo.ts, S10_left.tsx, S10_near.tsx, S10_yard.tsx; no kit change.
Open: the van's wipers, Pip's real ear droop (G6), guard/barrier stay small background life at phone size (as the build noted).

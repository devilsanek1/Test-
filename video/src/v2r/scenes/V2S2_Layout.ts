// V2S2_Layout (lane L2): the shot's own shared numbers, used by V2S2.tsx (the story, the bench people, Pip) and
// V2S2_Set.tsx (the bench furniture, its shadow, the life around it). FILM seconds, screen px at the 6.70 pose.
// Deviation from map.ts S2 (a REQUEST line in report_L2.md): the bench sits 50-60 px lower and 40 px right
// (map bench x 560-780, y 1040-1230 -> x 600-800, y 1110-1290, on the A-board's ground line), because the map's own
// figure boxes put the reporter's head 15 px under Pip's seat (590, 1050): Pip read as sitting on her head.

/** The bench (kit `Bench` back view on this rect: feet line y1, backrest top y1 - 0.42 w). */
export const S2_BENCH = {x0: 600, y0: 1110, x1: 800, y1: 1290};

/** The bench's seat line (kit benchInto back view: the seat edge at y1 - 0.55 * 0.42 * w). */
export const S2_BENCH_SEAT = S2_BENCH.y1 - 0.55 * 0.42 * (S2_BENCH.x1 - S2_BENCH.x0);

/** Pip's box on its post (map S2.pipSeat (590, 1050), size ~100): keep >= 30 px of air round it (heads, the board). */
export const S2_PIP_BOX = {x0: 540, y0: 950, x1: 640, y1: 1050};

/** The staffer's hood must stay inside the key reads after the 1.06 push about W2 (335, 785): world x <= 755. */
export const S2_STAFFER_MAX_X = 755;

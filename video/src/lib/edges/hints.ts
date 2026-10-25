// edges/hints.ts — what the 'paint' edge knows about the scene under it, per scene id (EdgeHints in shared.ts):
//   ink   line-art density per region, 0 (a flat sky) .. 1 (a crowd, branches): a corner / the left bite is left bare
//         only where there is drawing to show; a flat region gets colour to the edge instead (no empty white tiles)
//   keep  screen rects that stay entirely in colour (a hero figure, the mascot and the ground under it, a lamp and its
//         halo): no colour edge ever cuts them
// FilmEdges applies EDGE_HINTS[scene] for `<FilmEdges scene={id}>`; a scene without an entry still works (every
// region allowed, bare corners get their block outline ruled in). To measure a scene: render it clean at one or more
// frames of the shot (scripts/still.sh), then
//   python3 review/edges/loose/final/tools/scan_hints.py <scene-id> frame1.png [frame2.png ...]
// prints the entry (ink + the mascot's keep rect); add hero figures / key props to `keep` by hand. A shot that
// changes a lot (a long camera move) can take the minimum over several frames (the tool does).

import type {EdgeHints} from './shared';

/** S01 (Government Plaza) and S12 (its rewind): Film puts S01's painting (seed + these hints) on S12 too, since S12
 *  ends ON S01's frame 0 (the loop seam), so the keep rects are the union over both shots. Ink: the min over S01 0-4.4 s
 *  and all of S12. tr 0.45: the hanging leaves (0.63-0.73 measured) make the top-right the bare corner (a ~90 x 80 px
 *  notch, x ~970-1060, y ~18-95, under the top UI). Held under 0.5 for the ruled pair, but that pair runs along the thin
 *  top / right margins (y ~12, x ~1069), not around the notch: in S01's dive (f134-137, f141) flat sky swings through
 *  and the notch reads as a blank white rectangle for ~5 frames. Accepted: tr 0.1 (no bare corner, the leaves go into
 *  colour for all of S01 and S12) is the only hints-level fix. bl / br are dense but their figures are kept, so they
 *  cannot go bare. */
const S01_HINTS: EdgeHints = {
  ink: {tl: 0, tr: 0.1, br: 1, bl: 0.62, left: 1, right: 0.13, bottom: 0.69}, // tr 0.1: no bare top corner (no white at the top)
  keep: [
    [0, 1380, 260, 1920], // the onlooker at the left frame edge (phone raised from 1.5 s; S12 too)
    [360, 1380, 760, 1920], // the near observer (grows in S01's dive)
    [910, 1700, 1080, 1920], // the cap onlooker at the bottom right
    [732, 1232, 907, 1511], // Pip on the bollard + hop
    [915, 750, 1080, 1040], // Pip's leap out at S01's end (4.45-4.7 s)
    [0, 990, 100, 1470], // the lamp at the left frame edge (S01: head at x 10-75)
  ],
};

export const EDGE_HINTS: Record<string, EdgeHints> = {
  // EdgeLab shots (src/dev/EdgeLab.tsx), measured on review/edges/loose/final/stills/clean_*.png (+ the street clip)
  'edgelab/street': {
    ink: {tl: 0.92, tr: 1, br: 0.02, bl: 0.39, left: 1, right: 1, bottom: 0.11},
    keep: [
      [331, 1479, 582, 1803], // the mascot (whole clip) + the ground under it
      [0, 980, 175, 1920], // the coat figure walking at the left frame edge
    ],
  },
  'edgelab/monument': {
    ink: {tl: 0.04, tr: 0.04, br: 1, bl: 1, left: 0.7, right: 0.91, bottom: 1},
    keep: [
      [76, 1349, 232, 1559], // the mascot on its pillar
      [15, 1470, 295, 1920], // the pillar
      [10, 700, 160, 1110], // the banner at the left frame edge
      [0, 1335, 80, 1445], // the lamp + halo at the left frame edge
      [745, 1590, 1080, 1920], // the foreground head (bottom right)
    ],
  },
  'edgelab/vista': {
    ink: {tl: 0, tr: 0, br: 1, bl: 0.93, left: 0.7, right: 0, bottom: 1},
    keep: [
      [657, 1679, 812, 1865], // the mascot on the parapet
      [0, 1555, 360, 1920], // the foreground hero (bottom left)
    ],
  },

  // ---- the film (Film: <FilmEdges scene={id}>, paint-subtle, seed 'film/<id>'). Measured with scan_hints.py on 6-7
  // clean full-res frames per scene (first / last 0.2 s and the camera extremes) + Pip's bbox every 0.1 s; keep rects
  // are the union over the scene's motion. paint-subtle leaves ONE corner bare (the densest corner that fits around the
  // keep rects); ink < 0.3 never goes bare, < 0.12 not even as the fallback. Checked on Main renders (docs/EDGES.md 5.1).
  // S07-S10: not yet (their scenes were still being polished).
  S01: S01_HINTS,
  S02: {
    // bare corner: bottom-left (the board's leg and the ground lines run into it)
    ink: {tl: 0, tr: 0, br: 0.9, bl: 1, left: 0.74, right: 1, bottom: 1},
    // no rect for Pip: he lands from S01 at x 939-1049 (f142) and stays left of that, clear of the 18-24 px right paper
    // (from x ~1060 at his height); a rect within 110 px of the side runs off it, and his only cut the paper at y 600-900
    keep: [
      [110, 1640, 790, 1920], // the three audience heads (from x 110: onlooker A's head stays whole in the 'take over' push)
      [20, 860, 130, 1020], // the site plaque at the left frame edge
    ],
  },
  S03: {
    // no bare corner: the top is flat sky and the near walkers fill both bottom corners (bottom: flat plan, no bite)
    ink: {tl: 0, tr: 0, br: 0.32, bl: 0.46, left: 0.92, right: 0.12, bottom: 0.13},
    keep: [
      [0, 1320, 140, 1920], // the near walker at the left frame edge
      [940, 1310, 1080, 1920], // the near walker at the right frame edge
      [289, 1277, 479, 1511], // Pip on the disc
      [684, 820, 890, 1086], // Pip arriving from S02
    ],
  },
  S04: {
    // no bare corner: br / bl set by hand to 0.1 (the scan's 0.48 / 0.16 come from the house and the lamp post; the
    // corner triangles themselves hold flat pavement, and nothing at all in the dive: a bare corner read as a blank)
    ink: {tl: 0, tr: 0, br: 0.1, bl: 0.1, left: 1, right: 0.51, bottom: 0.02},
    keep: [[187, 1057, 472, 1540]], // Pip (steps -> window)
  },
  S05: {
    // no bare corner: the foreground audience fills the whole bottom (kept: the world runs off the bottom in colour)
    ink: {tl: 0, tr: 0, br: 1, bl: 1, left: 1, right: 0.58, bottom: 1},
    keep: [
      [0, 1550, 1080, 1920], // the foreground audience
      [0, 1350, 200, 1550], // the team at the left frame edge
      [890, 1340, 1080, 1580], // the messenger running in at the right (last 0.3 s)
      [935, 1065, 1080, 1265], // Pip's exit right
      [528, 1200, 714, 1418], // Pip at the board
      [0, 690, 90, 890], // the AUG calendar at the left frame edge
    ],
  },
  S06: {
    // bare corner: bottom-right (the shrub and the bench as line art). Measured without the white page of the last
    // 0.15 s (paper on a white page does not show). bl 0.2 by hand: under the kept cart there is only flat pavement
    ink: {tl: 0.3, tr: 0.26, br: 0.49, bl: 0.2, left: 1, right: 1, bottom: 0},
    // the messenger entering at the left edge, the cart, Pip on it, and Pip's leap in above the messenger's head
    // (19.80-20.07, cut S05|S06)
    keep: [[0, 990, 270, 1700]],
  },
  S07: {
    // measured without the white opening page (the pen-like reveal starts on paper). The bottom-left readers raise
    // their phones at the frame edge: keep them in colour (the left paper strip used to bleach them, A1 r2 review)
    ink: {tl: 0, tr: 0, br: 0.97, bl: 1, left: 1, right: 0.81, bottom: 0.26},
    keep: [
      [0, 1180, 330, 1920], // the bottom-left readers (phones raised)
      [652, 794, 868, 995], // Pip on the blind / sign
    ],
  },
  S08: {
    // the counted heap on the dome's left flank, the roof count clumps and the near rattlers sit at the left edge:
    // kept in colour (the left paper strip used to bleach the heap at the count beat). Rects from S08's wrap-up fix r1
    ink: {tl: 0, tr: 0, br: 1, bl: 1, left: 1, right: 0, bottom: 0.74},
    keep: [
      [0, 930, 280, 1145], // the counted heap
      [0, 1060, 440, 1180], // the roof count clumps
      [280, 1256, 454, 1533], // Pip on the parapet
      [400, 895, 912, 1475], // the counter board
      [0, 1270, 340, 1490], // the near rattlers / queues / near crowd
      [0, 1480, 460, 1920], // the bottom-left neighbour
      [880, 1580, 1080, 1920], // the beanie onlooker at the bottom right
    ],
  },
  S09: {
    ink: {tl: 0, tr: 0, br: 0.76, bl: 0.6, left: 0.66, right: 0, bottom: 0},
    keep: [
      [132, 1251, 458, 1536], // Pip: stoop crouch + leap
      [17, 1051, 180, 1232], // Pip at the left edge (the hidden match cut from S08)
      [822, 1387, 947, 1549], // Pip on the pier
      [830, 850, 954, 994], // Pip's tram-boarding leap
    ],
  },
  S10: {
    ink: {tl: 0, tr: 0, br: 1, bl: 1, left: 0.52, right: 0.65, bottom: 1},
    keep: [
      [939, 584, 1058, 736], // Pip arriving at the right (the tram hand-over)
      [606, 1307, 791, 1528], // Pip on the bollard + the 'hey!' gag
    ],
  },
  S11: {
    // bare corner: bottom-right (govC's steps). bl 0.25 by hand: the lamp's foot and the onlookers fill it, so it
    // must not go bare (the lamp at x 95-180 needs no keep rect otherwise: it sits clear of the paper). No rect for
    // Pip's in-hop: he is in the 54 px left paper only for f1370-1372 (45.67-45.73 s), where his body stays in colour
    // (an actor fill) and only the peach inner ear goes paper; a rect ran a 200 px colour tongue down the left side
    // (paper / tongue / paper at y ~1250-1490) for the whole 6.5 s shot
    ink: {tl: 0, tr: 0, br: 0.84, bl: 0.25, left: 1, right: 1, bottom: 1},
    keep: [
      [229, 1159, 441, 1539], // Pip at govB's window
      [150, 1700, 500, 1920], // the two onlookers
    ],
  },
  // Film puts S01's painting (seed + hints) on S12 for the loop seam; this entry is the same, for a lookup by id
  S12: S01_HINTS,
};

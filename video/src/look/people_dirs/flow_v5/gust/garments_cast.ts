// FLOW v5, GUST: the strangers' garments, each ONE long outer piece that is the figure, in one calmer colour.
//   TRENCH   her friend from behind: a belted trench, a column cinched at the waist, its belt's tails and the back
//            vent's flap streaming downwind, the hem in points
//   SKIRT    a long bias skirt as a bell under a cropped knit, the skirt's back streaming in two flame points (ref 09),
//            the one acting arm out of the knit's elbow-length sleeve (ref 08)
//   OVERCOAT him walking: a long overcoat as a column flaring a little, a stand collar, the back vent flying
//   SHIRT    him in 3/4: a big open shirt over a dark tee and wide trousers, a dropped shoulder, an elbow sleeve with
//            the forearm out, the hem in short points
//   CHORE    him in 3/4: a boxy chore jacket open over a dark tee, wide trousers, one flared panel per leg
// Units: figure units of each person (H = 1000), at the designed wind (blowing to the screen right).
import {G, F, type GarmentView} from './garments';

export const TRENCH_B: GarmentView = {
  shapes: [
    {
      kind: 'flag',
      nodes: [
        G(10, 600, 'round', 4),
        G(34, 590, 'round', 4),
        {...F(196, 724, 58, 822, 'sharp', {f: 1.1, dl: 0.12, fl: [8, 10], sd: 1}), bow: -0.08},
        {...F(64, 812, 40, 826, 'round', {f: 1.6, dl: 0.06}), r: 6},
        G(10, 800, 'round', 4),
      ],
    },
    {
      kind: 'body',
      nodes: [
        G(-22, 190, 'smooth'),
        G(22, 190, 'smooth'),
        G(54, 204, 'smooth'),
        G(82, 250, 'round', 22),
        G(98, 430, 'round', 16),
        G(70, 462, 'round', 6),
        {...F(110, 600, 102, 600, 'round', {f: 2.0, fl: [2, 0]}), r: 12},
        F(162, 818, 124, 834, 'sharp', {f: 2.0, fl: [5, 3]}),
        {...F(86, 806, 78, 816, 'round', {f: 2.3}), r: 5},
        F(24, 842, 18, 844, 'sharp', {f: 2.2, fl: [4, 3]}),
        {...F(-30, 814, -32, 820, 'round', {f: 2.3}), r: 5},
        F(-104, 842, -110, 840, 'sharp', {f: 2.0, fl: [4, 3]}),
        G(-100, 600, 'round', 12),
        G(-66, 462, 'round', 6),
        G(-96, 430, 'round', 16),
        G(-82, 252, 'round', 22),
        G(-54, 204, 'smooth'),
      ],
    },
  ],
  planes: [{a: [-24, 214], b: [-12, 810], side: 1}],
  panels: [
    {pts: [G(-92, 446), G(92, 446), G(92, 474), G(-92, 474)], tone: 'deep', op: 0.5, blur: 0.3},
    {pts: [G(-56, 236), G(-92, 256), G(-102, 430), G(-74, 540), G(-56, 532), G(-62, 300)], tone: 'lit', op: 0.34},
  ],
  tails: [
    {root: [62, 460], a0: 22, L: 236, bend: -16, w: 24, seed: 1, front: true, tone: 'deep'},
    {root: [60, 466], a0: 38, L: 180, bend: -20, w: 22, seed: 2, front: true, tone: 'shade'},
  ],
};

export const SKIRT_Q: GarmentView = {
  shapes: [
    {
      kind: 'body',
      nodes: [
        G(-62, 428, 'round', 6),
        G(58, 428, 'round', 6),
        {...F(112, 600, 104, 600, 'round', {f: 2.0}), r: 14},
        {...F(296, 772, 140, 900, 'sharp', {f: 1.0, dl: 0.14, fl: [10, 12], sd: 1}), bow: -0.05},
        {...F(152, 822, 120, 900, 'round', {f: 1.4, dl: 0.08}), r: 6},
        {...F(262, 902, 120, 930, 'sharp', {f: 1.1, dl: 0.12, fl: [10, 10], sd: 2}), bow: -0.04},
        {...F(110, 922, 100, 934, 'round', {f: 1.8}), r: 6},
        F(40, 950, 36, 952, 'sharp', {f: 2.2, fl: [4, 2]}),
        {...F(-20, 926, -22, 930, 'round', {f: 2.3}), r: 5},
        F(-96, 944, -100, 942, 'sharp', {f: 2.0, fl: [4, 2]}),
        {...G(-84, 650, 'round', 20), bow: 0.01},
      ],
    },
    {
      kind: 'top',
      nodes: [
        G(-40, 198, 'smooth'),
        G(16, 192, 'smooth'),
        G(50, 204, 'smooth'),
        G(78, 248, 'round', 20),
        G(120, 392, 'round', 10),
        G(102, 412, 'round', 5),
        G(86, 362, 'round', 8),
        {...F(84, 448, 86, 450, 'sharp', {f: 2.5, fl: [2, 1]})},
        G(-20, 454, 'round', 4),
        G(-76, 442, 'round', 3),
        G(-80, 300, 'round', 10),
        G(-62, 252, 'round', 18),
        G(-46, 210, 'smooth'),
      ],
    },
  ],
  planes: [{a: [40, 440], b: [70, 940], side: 1}],
  panels: [
    {pts: [G(-52, 250), G(-76, 262), G(-82, 430), G(-64, 434)], tone: 'lit', op: 0.35, on: 'top'},
    {pts: [G(62, 240), G(86, 250), G(118, 392), G(100, 410), G(80, 360), G(58, 300)], tone: 'lit', op: 0.3, on: 'top'},
  ],
  arms: [{c: [[102, 396], [124, 458], [144, 512]], w: [28, 19], fist: 13, front: true}],
};

export const OVERCOAT_P: GarmentView = {
  shapes: [
    {
      kind: 'flag',
      nodes: [
        G(40, 560, 'round', 4),
        G(84, 560, 'round', 6),
        {...F(250, 704, 110, 822, 'sharp', {f: 1.0, dl: 0.14, fl: [8, 10], sd: 1}), bow: -0.08},
        {...F(122, 802, 110, 836, 'round', {f: 1.6, dl: 0.06}), r: 6},
        G(50, 780, 'round', 4),
      ],
    },
    {
      kind: 'body',
      nodes: [
        {...G(-44, 196, 'round', 10), bow: 0.02},
        G(14, 170, 'round', 8),
        G(42, 178, 'smooth'),
        G(70, 204, 'round', 12),
        G(80, 300, 'round', 14),
        {...F(96, 560, 88, 560, 'round', {f: 2.0, fl: [2, 0]}), r: 12},
        {...F(150, 846, 104, 852, 'sharp', {f: 1.9, fl: [5, 3]}), leg: 'back'},
        {...F(80, 818, 64, 824, 'round', {f: 2.2}), r: 5},
        F(22, 852, 10, 852, 'sharp', {f: 2.2, fl: [4, 3]}),
        {...F(-30, 822, -36, 826, 'round', {f: 2.3}), r: 5, leg: 'front'},
        {...F(-92, 850, -84, 850, 'sharp', {f: 2.0, fl: [4, 2]}), leg: 'front'},
        G(-74, 540, 'round', 12),
        G(-64, 290, 'round', 14),
        G(-58, 224, 'round', 12),
      ],
    },
  ],
  planes: [{a: [-14, 218], b: [-30, 580], side: -1}],
  panels: [{pts: [G(-22, 228), G(30, 232), G(48, 440), G(-12, 560), G(-46, 548), G(-36, 300)], tone: 'lit', op: 0.38}],
};

/** The big open shirt in 3/4 (facing the screen left), over a dark tee and wide trousers: a dropped shoulder corner,
 *  an elbow-length sleeve with the slim forearm out (the one acting arm), the open front over the tee, the hem in short
 *  points fluttering downwind; the windward side hangs. */
export const SHIRT_Q: GarmentView = {
  shapes: [
    {
      kind: 'dark',
      nodes: [
        G(-78, 540, 'round', 8),
        G(88, 540, 'round', 8),
        F(110, 958, 98, 962, 'sharp', {f: 2.2, fl: [4, 2]}),
        G(78, 966, 'round', 3),
        G(24, 960, 'round', 4),
        G(-2, 650, 'round', 6),
        G(-26, 962, 'round', 4),
        G(-58, 966, 'round', 3),
        F(-92, 960, -94, 962, 'sharp', {f: 2.2, fl: [3, 2]}),
        G(-86, 700, 'round', 10),
      ],
    },
    {
      kind: 'body',
      nodes: [
        G(-48, 200, 'smooth'),
        G(10, 184, 'round', 8),
        G(48, 196, 'smooth'),
        G(104, 224, 'round', 10),
        // the dropped shoulder's corner, the sleeve's outer edge to the elbow
        G(130, 262, 'round', 5),
        {...F(150, 398, 144, 404, 'round', {f: 2.2, fl: [3, 2]}), r: 4},
        // the sleeve's hem: the forearm comes out here
        {...F(136, 414, 128, 414, 'sharp', {f: 2.4, fl: [3, 2]})},
        G(104, 412, 'round', 4),
        G(104, 470, 'round', 8),
        // the hem in short points, downwind
        {...F(150, 600, 116, 612, 'sharp', {f: 1.8, dl: 0.06, fl: [6, 4], sd: 1}), bow: -0.02},
        {...F(94, 592, 86, 596, 'round', {f: 2.2}), r: 5},
        F(56, 614, 46, 616, 'sharp', {f: 2.2, fl: [4, 3], sd: 2}),
        {...F(10, 596, 6, 598, 'round', {f: 2.3}), r: 5},
        F(-30, 610, -36, 610, 'sharp', {f: 2.2, fl: [3, 2], sd: 3}),
        {...F(-62, 596, -66, 598, 'round', {f: 2.3}), r: 4},
        G(-90, 598, 'round', 6),
        // the windward side hangs; the far sleeve's short plane at the far shoulder
        G(-96, 420, 'round', 8),
        G(-112, 400, 'round', 4),
        G(-108, 268, 'round', 6),
        G(-86, 232, 'round', 10),
        G(-58, 208, 'smooth'),
      ],
    },
  ],
  planes: [{a: [60, 236], b: [96, 600], side: 1}],
  slit: [
    [-14, 214],
    [-40, 598],
    [12, 598],
  ],
  slitFull: true,
  panels: [
    // the near sleeve, a lit plane from the dropped shoulder to the elbow
    {pts: [G(100, 226), G(128, 262), G(148, 398), G(134, 410), G(104, 410), G(96, 300)], tone: 'lit', op: 0.4},
    // the far sleeve's plane
    {pts: [G(-84, 236), G(-106, 270), G(-110, 398), G(-96, 404), G(-90, 300)], tone: 'lit', op: 0.28},
    {pts: [G(-8, 640), G(10, 640), G(20, 960), G(-2, 960)], tone: 'deep', op: 0.35, on: 'dark'},
  ],
  arms: [{c: [[120, 404], [126, 462], [130, 520]], w: [24, 17], fist: 12, front: true}],
};

export const CHORE_Q: GarmentView = {
  shapes: [
    {
      kind: 'dark',
      nodes: [
        G(-70, 540, 'round', 8),
        G(84, 540, 'round', 8),
        F(104, 958, 92, 962, 'sharp', {f: 2.2, fl: [4, 2]}),
        G(72, 966, 'round', 3),
        G(20, 960, 'round', 4),
        G(-4, 650, 'round', 6),
        G(-28, 962, 'round', 4),
        G(-56, 966, 'round', 3),
        F(-92, 960, -94, 962, 'sharp', {f: 2.2, fl: [3, 2]}),
        G(-84, 700, 'round', 10),
      ],
    },
    {
      kind: 'body',
      nodes: [
        G(-44, 200, 'smooth'),
        G(12, 184, 'round', 8),
        G(46, 194, 'smooth'),
        G(98, 222, 'round', 14),
        G(122, 420, 'round', 18),
        {...F(116, 520, 114, 520, 'round', {f: 2.2}), r: 10},
        F(156, 574, 126, 590, 'sharp', {f: 2.0, fl: [5, 3]}),
        {...F(78, 568, 72, 576, 'round', {f: 2.3}), r: 5},
        F(8, 598, 4, 600, 'sharp', {f: 2.2, fl: [4, 3]}),
        {...F(-14, 572, -16, 576, 'round', {f: 2.3}), r: 3},
        F(-42, 592, -46, 592, 'sharp', {f: 2.2, fl: [4, 3]}),
        F(-102, 576, -106, 576, 'sharp', {f: 2.0, fl: [3, 2]}),
        G(-104, 420, 'round', 18),
        G(-84, 236, 'round', 14),
        G(-54, 208, 'smooth'),
      ],
    },
  ],
  planes: [{a: [62, 238], b: [100, 580], side: 1}],
  slit: [
    [-12, 236],
    [-26, 578],
    [-2, 578],
  ],
  slitFull: true,
  panels: [
    {pts: [G(64, 238), G(96, 250), G(124, 420), G(98, 534), G(74, 538), G(60, 300)], tone: 'lit', op: 0.38},
    {pts: [G(-66, 248), G(-94, 262), G(-106, 420), G(-84, 534), G(-66, 530), G(-80, 420)], tone: 'lit', op: 0.28},
    {pts: [G(-8, 640), G(10, 640), G(20, 960), G(-2, 960)], tone: 'deep', op: 0.35, on: 'dark'},
  ],
};

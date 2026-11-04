// PEOPLE v4 ASSEMBLED: the cuts FITTED to the v4 heads (people_v4/faces.ts). The hair round drew every cut on the LASH
// heads; the faces round kept their cranium exactly (so the crown, the back and the volume fit as drawn) but moved the
// ear to its anatomical place (3/4: from (0.27, 0.06) to her (0.36, 0.14) / his (0.38, 0.10), smaller; profile: from
// (0.135, 0.07) to her (0.08, 0.13) / his (0.10, 0.08)) and drew a real lost profile (yaw -138: the cheek's line, the
// jaw and one ear on the near side) where the hair round's back view was a yaw -150 back. So the hairlines that meet
// the ear (the tuck, the sideburn, the line behind the ear) and the nape seams are redrawn here, node by node, on the
// v4 heads (the design desk: each cut on each head at 600 px a skull, the nodes numbered), keeping every 3/4 drawing
// node-compatible with its profile (only coordinates move, never the node count). The hair round's originals stay in
// cut_*.ts (they still fit the LASH heads).
import type {N} from './bez';
import type {Chain, Cut, CutView, Flow, Over, Piece, View} from './cut';

type Patch = {
  view: View;
  /** a piece's name, or 'shadow0' / 'light0' / 'flow1' for the overlays */
  piece: string;
  /** replace these nodes (by index) */
  set?: Record<number, N>;
  /** replace the whole shape */
  shape?: N[];
  chains?: Chain[];
  z?: number;
  /** the share of the rim light the piece's edge takes (0: none) */
  rim?: number;
  drop?: boolean;
};

const FITS: Record<string, Patch[]> = {
  // her long layers: in profile the v4 head's underside sits higher behind the jaw, so a skin triangle showed between
  // the face-framing layer and the cap: the cap's lower edge now comes down over the nape
  // ... and from behind the v4 head is a real lost profile (yaw -138): the near side of the fall now drops from the
  // temple BEHIND the cheek and the jaw (the cheek's one line and the lash peek past it, as the faces round drew the
  // lost profile), then spreads over the shoulder
  LONG: [
    {view: 'p', piece: 'cap', set: {6: [0.31, 0.285, -0.07, -0.05]}},
    {view: 'b', piece: 'cap', set: {0: [-0.39, -0.045, 0.0, 0.0, -0.06, -0.06], 1: [-0.505, -0.23, 0.035, -0.125]}},
    {
      view: 'b',
      piece: 'back',
      set: {12: [-0.56, 0.96, 0.05, -0.15], 13: [-0.315, 0.4, 0.02, -0.14], 14: [-0.375, -0.02, 0.01, -0.12]},
      chains: [
        {pts: [[-0.33, 0.12], [-0.35, 0.5], [-0.5, 0.85], [-0.55, 1.2], [-0.5, 1.5], [-0.36, 1.78]], rigid: 0.12},
        {pts: [[0.02, 0.16], [0.02, 0.5], [0.03, 0.85], [0.04, 1.2], [0.04, 1.55], [0.04, 1.88]], rigid: 0.12},
        {pts: [[0.44, 0.12], [0.5, 0.5], [0.58, 0.85], [0.58, 1.2], [0.52, 1.5], [0.42, 1.78]], rigid: 0.12},
      ],
    },
  ],
  // the sleek ponytail (her): the hairline round the new, lower ear; the sideburn tip in front of it; the near tendril
  // falls in front of the ear (framing the face) instead of down the cheek
  PONY: [
    {view: 'q', piece: 'cap', set: {5: [0.455, 0.17, -0.03, 0.05], 6: [0.415, 0.255, 0.0, 0.0, 0.0, -0.07], 7: [0.41, 0.04, -0.015, -0.05], 8: [0.355, -0.02, -0.05, 0.0], 9: [0.27, 0.1, 0.0, 0.0, -0.02, -0.08], 10: [0.14, -0.19, -0.06, -0.07]}},
    {view: 'q', piece: 'tnear', rim: 0, shape: [[0.2, -0.13, 0.03, 0.08], [0.25, 0.12, 0.0, 0.1], [0.22, 0.36, 0.0, 0.07], [0.26, 0.52, 0.02, 0.04]]},
    {view: 'q', piece: 'flow1', set: {0: [0.17, -0.24, 0.08, -0.04]}},
    {view: 'p', piece: 'cap', set: {5: [0.5, 0.17, -0.05, 0.05], 6: [0.27, 0.285, 0.0, 0.0, 0.0, -0.07], 7: [0.17, 0.08, -0.025, -0.06], 8: [0.08, 0.0, -0.06, 0.0], 9: [-0.005, 0.105, 0.0, 0.0, -0.02, -0.08], 10: [-0.09, -0.17, -0.05, -0.07]}},
    {view: 'p', piece: 'tnear', rim: 0, shape: [[-0.04, -0.12, -0.02, 0.08], [-0.03, 0.12, 0.0, 0.1], [-0.06, 0.36, 0.0, 0.07], [-0.03, 0.52, 0.02, 0.04]]},
    // the lost profile: the hairline comes down the temple to the cheek's line, round the sideburn, over the ear and
    // down behind it to the nape (the ear and the cheek show, never a fin of jaw under a helmet)
    {
      view: 'b',
      piece: 'cap',
      shape: [
        [-0.405, -0.04, 0.0, 0.0, -0.02, -0.06],
        [-0.48, -0.2, 0.02, -0.12],
        [-0.32, -0.53, 0.14, -0.07],
        [0.04, -0.6, 0.2, 0.0],
        [0.38, -0.52, 0.12, 0.08],
        [0.54, -0.2, 0.02, 0.13],
        [0.5, 0.12, 0.0, 0.0, -0.06, 0.06],
        [0.3, 0.3, -0.1, 0.02],
        [0.04, 0.36, 0.0, 0.0, -0.09, -0.01],
        [-0.16, 0.29, -0.04, -0.05],
        [-0.205, 0.12, 0.0, -0.06],
        [-0.255, 0.012, -0.04, 0.0],
        [-0.33, 0.075, 0.0, 0.0, 0.0, -0.05],
      ],
    },
    {view: 'b', piece: 'tfar', shape: [[-0.41, -0.06, -0.03, 0.07], [-0.45, 0.14, 0.0, 0.08], [-0.43, 0.34, 0.01, 0.05]]},
    {view: 'b', piece: 'flow0', shape: [[-0.17, 0.24, 0.03, -0.14], [-0.13, -0.33, 0.06, -0.06]]},
    {view: 'b', piece: 'flow2', shape: [[-0.42, -0.12, 0.06, -0.1], [-0.14, -0.42, 0.08, -0.03]]},
  ],
  // the wavy lob (W1): the near side really TUCKED behind the new ear (the tuck's front edge runs under the ear, so no
  // hair shows in front of it); the cap's edge sweeps from the parting over the temple to the top of the ear
  LOB: [
    {view: 'q', piece: 'cap', set: {6: [0.445, 0.05, -0.04, -0.06], 7: [0.35, -0.025, -0.07, -0.01], 8: [0.21, -0.1, -0.06, -0.05], 9: [0.0, -0.32, -0.06, -0.06]}},
    {view: 'q', piece: 'tuck', set: {0: [0.38, -0.1, 0.07, -0.0], 4: [0.5, 0.58, -0.04, 0.0], 5: [0.42, 0.65, 0.02, -0.03, -0.02, -0.05], 6: [0.375, 0.46, -0.01, -0.08], 7: [0.355, 0.24, -0.005, -0.06], 8: [0.345, 0.04, 0.0, -0.05]}, chains: [{pts: [[0.42, -0.02], [0.46, 0.16], [0.48, 0.34], [0.52, 0.48], [0.57, 0.6]], rigid: 0.25}]},
    {view: 'p', piece: 'cap', set: {6: [0.17, 0.07, -0.04, -0.05], 7: [0.085, -0.005, -0.06, -0.01], 8: [-0.02, -0.07, -0.04, -0.05], 9: [-0.1, -0.3, -0.06, -0.06]}},
    {view: 'p', piece: 'tuck', set: {0: [0.12, -0.11, 0.1, -0.01], 4: [0.27, 0.58, -0.04, 0.0], 5: [0.18, 0.64, 0.02, -0.03, -0.02, -0.05], 6: [0.13, 0.46, -0.01, -0.08], 7: [0.105, 0.24, -0.005, -0.06], 8: [0.1, 0.04, 0.0, -0.05]}, chains: [{pts: [[0.18, -0.02], [0.24, 0.16], [0.28, 0.34], [0.33, 0.48], [0.4, 0.6]], rigid: 0.25}]},
  ],
  // the textured crop (M1): the faded sides' notch round the new ear (a short sideburn in front of it, the line behind
  // it); the fringe's three tips softened from points into one soft wave (the owner: no jagged tips)
  CROP: [
    {view: 'q', piece: 'sides', set: {3: [0.475, 0.05, -0.01, 0.07], 4: [0.44, 0.2, 0.03, -0.04, -0.01, -0.06], 5: [0.43, 0.0, -0.005, -0.05], 6: [0.375, -0.07, -0.045, 0.0], 7: [0.325, -0.03, -0.015, 0.04], 8: [0.3, 0.1, 0.0, -0.04, -0.02, -0.04], 9: [0.16, -0.19, -0.05, -0.06]}},
    {view: 'q', piece: 'top', set: {9: [-0.42, -0.255, 0.03, 0.0], 10: [-0.345, -0.29, 0.035, 0.0], 11: [-0.26, -0.245, 0.035, 0.0], 12: [-0.17, -0.29, 0.035, 0.0], 13: [-0.085, -0.255, 0.03, 0.0], 14: [0.0, -0.3, 0.035, 0.0]}},
    {view: 'p', piece: 'sides', set: {4: [0.33, 0.27, 0.04, -0.04, -0.03, -0.06], 5: [0.19, 0.08, -0.01, -0.06], 6: [0.11, -0.075, -0.05, 0.0], 7: [0.03, -0.04, -0.02, 0.04], 8: [0.0, 0.08, 0.0, -0.04, -0.02, -0.04], 9: [-0.07, -0.19, -0.04, -0.06]}},
    {view: 'p', piece: 'top', set: {9: [-0.47, -0.285, 0.025, 0.0], 10: [-0.415, -0.315, 0.03, 0.0], 11: [-0.355, -0.27, 0.03, 0.0], 12: [-0.285, -0.315, 0.03, 0.0], 13: [-0.205, -0.28, 0.03, 0.0], 14: [-0.13, -0.32, 0.035, 0.0]}},
    // the lost profile: the faded sides end at the cheek's line, round a short sideburn, over the ear, behind it
    {
      view: 'b',
      piece: 'sides',
      shape: [
        [-0.405, -0.05, 0.0, 0.0, -0.03, -0.07],
        [-0.47, -0.22, 0.02, -0.1],
        [-0.32, -0.45, 0.12, -0.04],
        [0.3, -0.45, 0.12, 0.04],
        [0.5, -0.2, 0.01, 0.1],
        [0.47, 0.1, 0.0, 0.0, -0.03, 0.06],
        [0.36, 0.26, -0.06, 0.03],
        [0.02, 0.32, -0.12, 0.0],
        [-0.165, 0.27, -0.04, -0.05],
        [-0.215, 0.1, 0.0, -0.06],
        [-0.275, -0.05, -0.045, 0.0],
        [-0.345, 0.04, 0.0, 0.0, -0.01, -0.05],
      ],
    },
  ],
  // the middle-part flow (M2): the cap's notch round the new ear, a short sideburn; the flicks stay above the ear
  FLOW: [
    {view: 'q', piece: 'cap', set: {5: [0.5, 0.22, 0.03, -0.06, -0.05, -0.02], 6: [0.43, 0.07, -0.02, -0.06], 7: [0.37, -0.06, -0.05, 0.0], 8: [0.3, 0.07, -0.03, -0.05]}},
    {view: 'p', piece: 'cap', set: {6: [0.19, 0.08, -0.02, -0.06], 7: [0.11, -0.07, -0.05, 0.0], 8: [0.01, 0.06, -0.03, -0.06]}},
    // the lost profile: the left section ends in its flick ABOVE the ear (as in 3/4 and profile), the line runs over
    // the ear and down behind it to the tapered nape
    {
      view: 'b',
      piece: 'back',
      shape: [
        [-0.44, -0.03, 0.0, 0.0, -0.04, -0.07],
        [-0.52, -0.22, 0.03, -0.12],
        [-0.32, -0.57, 0.14, -0.07],
        [0.04, -0.65, 0.2, 0.0],
        [0.4, -0.56, 0.12, 0.08],
        [0.57, -0.22, 0.0, 0.1],
        [0.47, 0.04, -0.02, 0.06],
        [0.46, 0.2, 0.0, 0.0, -0.04, -0.01],
        [0.34, 0.2, -0.06, 0.0],
        [0.18, 0.28, 0.03, -0.03, -0.04, -0.03],
        [0.02, 0.23, -0.07, 0.0],
        [-0.13, 0.28, 0.03, -0.03, -0.03, -0.04],
        [-0.2, 0.1, 0.0, -0.06],
        [-0.275, -0.06, -0.04, 0.0],
        [-0.37, -0.075, -0.03, 0.01],
      ],
      chains: [
        {pts: [[-0.36, -0.3], [-0.4, -0.22], [-0.43, -0.14], [-0.44, -0.08], [-0.44, -0.03]], rigid: 0.35},
        {pts: [[0.02, -0.14], [0.02, -0.02], [0.02, 0.08], [0.02, 0.16], [0.02, 0.24]], rigid: 0.35},
        {pts: [[0.44, -0.16], [0.46, -0.06], [0.47, 0.04], [0.47, 0.12], [0.46, 0.2]], rigid: 0.35},
      ],
    },
    {view: 'b', piece: 'flow0', shape: [[-0.12, -0.36, -0.04, 0.12], [-0.2, -0.08, -0.02, 0.1], [-0.17, 0.18, 0.01, 0.04]]},
  ],
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const MEMO = new Map<string, Cut>();

/** The cut fitted to the v4 heads (memoised by cut; each cut is worn by one sex in the cast). */
export function fitCut(cut: Cut, sex: 'f' | 'm'): Cut {
  const key = `${cut.id}|${sex}`;
  const hit = MEMO.get(key);
  if (hit) return hit;
  const c: Cut = clone(cut);
  for (const p of FITS[cut.id] ?? []) {
    const v: CutView | undefined = c.views[p.view];
    if (!v) continue;
    const m = /^(shadow|light|flow)(\d+)$/.exec(p.piece);
    if (m) {
      const list = (m[1] === 'shadow' ? v.shadow : m[1] === 'light' ? v.light : v.flows) as (Over | Flow)[] | undefined;
      if (!list) continue;
      const k = +m[2];
      const it = list[k];
      if (!it) continue;
      const shape = 'c' in it ? it.c : it.shape;
      if (p.shape) shape.splice(0, shape.length, ...p.shape);
      if (p.set) for (const [i, n] of Object.entries(p.set)) shape[+i] = n;
      if (p.drop) list.splice(k, 1);
      continue;
    }
    const idx = v.pieces.findIndex((q) => q.name === p.piece);
    if (idx < 0) continue;
    if (p.drop) {
      v.pieces.splice(idx, 1);
      continue;
    }
    const pc: Piece = v.pieces[idx];
    if (p.shape) pc.shape = p.shape;
    if (p.set) for (const [i, n] of Object.entries(p.set)) pc.shape[+i] = n;
    if (p.chains) pc.chains = p.chains;
    if (p.z !== undefined) pc.z = p.z;
    if (p.rim !== undefined) pc.rim = p.rim;
  }
  MEMO.set(key, c);
  return c;
}

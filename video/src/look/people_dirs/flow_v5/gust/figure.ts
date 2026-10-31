// FLOW v5, GUST: a person, assembled. One garment shape in one colour, the hair and the legs as the dark accent, a
// near-blank face, one wind per shot moving every free edge while the body stays calm; painted flat and soft inside,
// a thin lit edge on the light side (the screen left), a soft contact shadow. figure() returns the parts in figure
// units (H = 1000, soles at y = 1000); paint.ts place() draws them.
import {type V2, type Node, add, sub, mul, lerp, norm, outline, limb, poly, ellipse, clamp} from './geo';
import {type Part, type Paint} from './paint';
import {type Wind} from './air';
import {type Build, type View, type Pose, type Rig, type Leg, rig} from './body';
import {skinPath, eyePaths, headMap} from './head';
import {type Cut, capPath, ribbonPath, strand, cutView} from './hair';
import {type GarmentView, evalNodes, walkPush} from './garments';
import {lch, fromLch, mixLab} from '../../graphic/color';

export type Colors = {
  /** the garment's one colour (its lit, middle value) */
  garment: string;
  /** the inner layer (a deeper value of the same family), if any shows */
  inner?: string;
  /** a second piece in the same family (a cropped knit over the skirt, a jacket over trousers) */
  top?: string;
  skin: string;
  hair: string;
  legs: string;
  shoes: string;
};
export type Look = {
  id: string;
  name: string;
  build: Build;
  col: Colors;
  garment: Partial<Record<View, GarmentView>>;
  cut: Cut;
  /** cm, for placing people together */
  stature: number;
};
/** sun: a scene's low sun on the light side: every lit edge takes its warm colour, a little wider and stronger. */
export type Env = {t: number; wind: Wind; px: number; shadow?: {color: string; opacity: number}; sun?: {color: string; k?: number; width?: number}};

// ---------------------------------------------------------------- tones
type Tone = {lit: string; mid: string; shade: string; deep: string; rim: string};
/** The most chroma sRGB holds at this L* and hue (a binary search on the linear channels). */
function maxChroma(L: number, h: number): number {
  const fy = (L + 16) / 116;
  const fInv = (t: number) => (t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27));
  const inside = (C: number) => {
    const a = C * Math.cos((h * Math.PI) / 180);
    const b = C * Math.sin((h * Math.PI) / 180);
    const x = fInv(fy + a / 500) * 0.95047;
    const y = fInv(fy);
    const z = fInv(fy - b / 200) * 1.08883;
    const ch = [3.2404542 * x - 1.5371385 * y - 0.4985314 * z, -0.969266 * x + 1.8760108 * y + 0.041556 * z, 0.0556434 * x - 0.2040259 * y + 1.0572252 * z];
    return ch.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  };
  let lo = 0;
  let hi = 160;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (inside(m)) lo = m;
    else hi = m;
  }
  return lo;
}
/** A colour kept well inside the screen's range: the hue and value as asked, the chroma never past 80 % of what the
 *  screen holds there (and never past `cap`). Converting an out-of-range colour channel by channel clips it to a neon
 *  at the range's edge (the flag's shade was rgb 159, 0, 81); this keeps the same red a value darker, a deep wine. */
function inLch(L: number, C: number, h: number, cap = Infinity): string {
  return fromLch(L, Math.min(C, cap, maxChroma(L, h) * 0.8), h);
}
/** One material's values: lit (toward the warm key), mid, shade (toward plum), the rim (a warm light). The shade and
 *  the deep stay inside the screen's range and are never more colourful than the lit or the colour itself. */
export function toneOf(hex: string, o: {dark?: boolean} = {}): Tone {
  const q = lch(hex);
  const turn = (h: number, to: number, max: number) => {
    const d = ((to - h + 540) % 360) - 180;
    return h + Math.sign(d) * Math.min(Math.abs(d), max);
  };
  if (o.dark) {
    return {
      lit: fromLch(Math.min(100, q.L + 9), q.C + 3, turn(q.h, 30, 10)),
      mid: hex,
      shade: inLch(Math.max(2, q.L - 5), q.C, q.h, q.C + 3),
      deep: inLch(Math.max(1, q.L - 8), q.C, q.h, q.C + 3),
      rim: fromLch(Math.min(92, q.L + 38), Math.min(40, q.C + 14), turn(q.h, 40, 30)),
    };
  }
  const cap = Math.max(q.C * 1.02, q.C);
  return {
    lit: fromLch(Math.min(97, q.L + 9), q.C * 1.02, turn(q.h, 45, 8)),
    mid: hex,
    shade: inLch(Math.max(4, q.L - 15), q.C * 1.04, turn(q.h, 345, 14), cap),
    deep: inLch(Math.max(3, q.L - 26), q.C * 0.98, turn(q.h, 340, 18), cap),
    rim: fromLch(Math.min(96, q.L + 30), Math.max(8, q.C * 0.55), turn(q.h, 60, 30)),
  };
}

const lin = (a: V2, b: V2, stops: [number, string, number?][]): Paint => ({lin: [a, b], stops});

/** The rim's width in screen px for a figure px tall: crisp at every size. */
export const rimPx = (px: number) => clamp(0.85 + px / 520, 1.05, 2.3);

// ---------------------------------------------------------------- legs and feet
function legPart(l: Leg, b: Build, col: string, z: number, name: string, hemY: number): Part {
  // from a little under the hem to the ankle, tapering; the knee barely there
  const top = l.hip[1] < hemY - 120 ? lerp(l.hip, l.knee, 0.35) : l.hip;
  const c = [top, l.knee, l.ankle];
  const d = limb(c, (u) => b.leg[0] + (b.leg[1] - b.leg[0]) * Math.pow(u, 0.9));
  return {name, d, fill: col, z};
}
function shoePart(l: Leg, b: Build, view: View, col: string, z: number, name: string): Part {
  // a small dark wedge: the ankle, the heel, the toe; from behind, a small rounded block
  if (view === 'b') {
    const w = b.leg[1] * 1.3;
    const top = sub(l.ankle, [0, 16]);
    const d = outline([
      {p: add(top, [-w * 0.45, 0]), k: 'round', r: 4},
      {p: add(top, [w * 0.45, 0]), k: 'round', r: 4},
      {p: add(l.ankle, [w * 0.62, 34]), k: 'round', r: 6},
      {p: add(l.ankle, [-w * 0.62, 34]), k: 'round', r: 6},
    ]);
    return {name, d, fill: col, z};
  }
  const toe = l.toe;
  const heel = l.heel;
  const up = sub(l.ankle, [0, 18]);
  const fwd = norm(sub(toe, heel));
  const foot: Node[] = [
    {p: add(up, mul(fwd, -b.leg[1] * 0.55)), k: 'round', r: 4},
    {p: add(up, mul(fwd, b.leg[1] * 0.45)), k: 'round', r: 4},
    {p: add(lerp(heel, toe, 0.62), [0, -b.leg[1] * 0.75]), k: 'smooth'},
    {p: toe, k: 'round', r: 7},
    {p: heel, k: 'round', r: 5},
  ];
  const d = outline(foot.reverse());
  return {name, d, fill: col, z};
}

// ---------------------------------------------------------------- the figure
export function figure(look: Look, view: View, pose: Pose, env: Env, o: {headTilt?: number; headView?: View} = {}): Part[] {
  const b = look.build;
  const r: Rig = rig(b, view, pose, o.headTilt ?? 0, o.headView);
  const gv = (look.garment[view] ?? look.garment.p ?? look.garment.b ?? look.garment.q) as GarmentView;
  const T = toneOf(look.col.garment);
  const TI = toneOf(look.col.inner ?? look.col.garment);
  const S = toneOf(look.col.skin);
  const Hh = toneOf(look.col.hair, {dark: true});
  const Lg = toneOf(look.col.legs, {dark: true});
  const rp = rimPx(env.px);
  const parts: Part[] = [];
  const big = env.px >= 300;

  // the garment's shapes now
  const shapes = gv.shapes.map((sh) => ({kind: sh.kind, nodes: evalNodes(sh.nodes, r, {t: env.t, wind: env.wind}, {freeOffset: (i, n, q) => walkPush(r, n, q)})}));
  const body = shapes.find((s) => s.kind === 'body');
  const hemY = body ? Math.max(...body.nodes.map((n) => n.p[1])) - 40 : 800;
  const top = body ? Math.min(...body.nodes.map((n) => n.p[1])) : 200;
  // the light's gradient across the figure: from the upper left (lit) to the lower right
  const gA: V2 = [-180, top - 40];
  const gB: V2 = [260, hemY + 120];

  // contact shadow: soft, cast away from the key (to the screen right)
  const feet = r.legs.map((l) => l.ankle[0]);
  const fx0 = Math.min(...feet) - 40;
  const fx1 = Math.max(...feet) + 70;
  parts.push({name: 'ground', d: ellipse([(fx0 + fx1) / 2 + 30, 1002], (fx1 - fx0) / 2 + 50, 16), fill: env.shadow?.color ?? '#2a1830', opacity: env.shadow?.opacity ?? 0.32, z: 0, ground: true, blurPx: Math.max(1.2, env.px / 160)});

  // legs (far first, darker), under the garment
  r.legs.forEach((l, i) => {
    const col = l.far ? Lg.shade : Lg.mid;
    parts.push({...legPart(l, b, col, 10 + i, `leg${i}`, hemY), fill: lin([l.knee[0] - 30, l.knee[1]], [l.knee[0] + 30, l.knee[1]], [[0, l.far ? Lg.mid : Lg.lit], [1, l.far ? Lg.deep : Lg.shade]]), rim: l.far ? undefined : {px: rp * 0.8, color: Lg.rim, opacity: 0.55}});
    parts.push({...shoePart(l, b, view, look.col.shoes, 12 + i, `shoe${i}`)});
  });

  // the garment's planes (a straight line from the shoulder down, the shade to one side) and panels (a sleeve)
  const planeRegions = (TN: Tone) =>
    (gv.planes ?? []).map((pl) => {
      const a = add(pl.a, r.body);
      const bb = add(pl.b, r.body);
      const dv = norm(sub(bb, a));
      const far: V2 = [pl.side * 600, 0];
      const ext = (q: V2, k: number) => add(q, mul(dv, k));
      return {d: poly([ext(a, -400), ext(bb, 400), add(ext(bb, 400), far), add(ext(a, -400), far)]), fill: pl.side > 0 ? TN.shade : TN.lit, opacity: pl.side > 0 ? 0.62 : 0.5, blurPx: 0.7};
    });
  const panelRegions = (on: 'body' | 'top' | 'dark') =>
    (gv.panels ?? [])
      .filter((pn) => (pn.on ?? 'body') === on)
      .map((pn) => {
        const pts = evalNodes(pn.pts, r, {t: env.t, wind: env.wind});
        if (r.ph !== undefined) {
          // the sleeve swings a little with the walk (the arm inside, the hand in the pocket)
          const sw = 7 * Math.sin(2 * Math.PI * r.ph);
          pts.forEach((q, j) => {
            if (j >= 2 && j <= 4) q.p = [q.p[0] + sw * (j === 2 ? 1 : 0.6), q.p[1]];
          });
        }
        const TN = on === 'dark' ? Lg : on === 'top' ? toneOf(look.col.top ?? look.col.garment) : T;
        const tone = pn.tone === 'lit' ? TN.lit : pn.tone === 'shade' ? TN.shade : pn.tone === 'deep' ? TN.deep : TN.mid;
        return {d: outline(pts.map((q) => ({...q, k: 'round' as const, r: 3}))), fill: tone, opacity: pn.op ?? 0.5, blurPx: pn.blur ?? 0.35};
      });
  // the garment
  const TT = toneOf(look.col.top ?? look.col.garment);
  for (const sh of shapes) {
    const d = outline(sh.nodes);
    if (sh.kind === 'dark') {
      // trousers: one flared panel per leg in the legs' dark value, a lit edge
      parts.push({name: 'trousers', d, z: 14, fill: lin(gA, gB, [[0, Lg.lit], [0.5, Lg.mid], [1, Lg.shade]]), rim: {px: rp * 0.9, color: Lg.rim, opacity: 0.6}, regions: panelRegions('dark')});
      continue;
    }
    if (sh.kind === 'top') {
      parts.push({name: 'top', d, z: 22, fill: lin(gA, gB, [[0, TT.lit], [0.45, TT.mid], [1, mixLab(TT.mid, TT.shade, 0.7)]]), rim: {px: rp, color: TT.rim, opacity: 0.92}, regions: panelRegions('top')});
      continue;
    }
    if (sh.kind === 'flag') {
      const tip = sh.nodes.reduce((a, n) => (n.p[0] > a[0] ? n.p : a), sh.nodes[0].p);
      parts.push({name: 'flag', d, z: 15, fill: lin([60, 300], tip, [[0, mixLab(T.shade, T.deep, 0.35)], [0.5, T.shade], [1, mixLab(T.shade, T.mid, 0.6)]]), rim: {px: rp, color: T.rim, opacity: 0.9}});
    } else if (sh.kind === 'inner') {
      parts.push({name: 'inner', d, z: 17, fill: lin([-60, 300], [40, 860], [[0, TI.shade], [1, TI.deep]])});
    } else {
      const regions = [...planeRegions(T)];
      if (gv.slit) {
        const [s0, s1, s2] = gv.slit.map((q) => add(q, r.body));
        // the open front: the slip shows where the wind parts the coat (the lower half), its value close to the coat's
        regions.push({d: outline([{p: gv.slitFull ? s0 : lerp(s0, lerp(s1, s2, 0.5), 0.42), k: 'sharp'}, {p: s2, k: 'round', r: 3}, {p: s1, k: 'round', r: 3}]), fill: gv.slitFull ? TI.mid : TI.mid, opacity: gv.slitFull ? 1 : 0.9, blurPx: 0.5});
      }
      regions.push(...panelRegions('body'));
      // a soft glow of the key on the lit shoulder
      regions.push({d: ellipse(add([-70, top + 40], r.body), 120, 160), fill: T.lit, opacity: 0.35, blurPx: env.px / 40});
      parts.push({name: 'garment', d, z: 20, fill: lin(gA, gB, [[0, T.lit], [0.42, T.mid], [1, mixLab(T.mid, T.shade, 0.7)]]), regions, rim: {px: rp, color: T.rim, opacity: 0.92}});
    }
  }

  // a belt's tails: ribbons of cloth streaming from a root (garment units)
  (gv.tails ?? []).forEach((tl, i) => {
    const spec = {pts: strand([0, 0], tl.a0, tl.L, tl.bend, {n: 6, wave: 4, ph: tl.seed}), w: tl.w, seed: tl.seed, fl: 16, hang: [92, 1] as [number, number], band: true};
    const rr: Rig = {...r, head: {o: add(tl.root, r.body), k: 1, tilt: 0}};
    const {d, root, tip} = ribbonPath(rr, spec, {t: env.t, wind: env.wind, px: env.px});
    const TN = tl.tone === 'deep' ? T.deep : tl.tone === 'mid' ? T.mid : T.shade;
    parts.push({name: `tail${i}`, d, z: tl.front ? 24 + i * 0.1 : 16 + i * 0.1, fill: lin(root, tip, [[0, TN], [1, mixLab(TN, T.mid, 0.4)]]), rim: {px: rp * 0.8, color: T.rim, opacity: 0.7}});
  });
  // the one acting arm: a slim bare forearm out of the sleeve, a small closed fist
  (gv.arms ?? []).forEach((am, i) => {
    const c = am.c.map((q) => add(q, r.body));
    const tipP = c[c.length - 1];
    parts.push({name: `arm${i}`, d: limb(c, (u) => am.w[0] + (am.w[1] - am.w[0]) * u), z: am.front ? 23 : 13, fill: lin(add(c[0], [-30, 0]), add(c[0], [40, 80]), [[0, S.mid], [1, S.shade]]), rim: {px: rp * 0.9, color: S.rim, opacity: 0.8}});
    parts.push({name: `fist${i}`, d: ellipse(tipP, am.fist, am.fist * 1.15), z: am.front ? 23.1 : 13.1, fill: S.mid, rim: {px: rp * 0.9, color: S.rim, opacity: 0.8}});
  });

  // the neck: slim, from inside the jaw to under the collar
  const hm = headMap(r);
  const nTop = r.hv === 'p' ? hm([10, 84]) : r.hv === 'q' ? hm([8, 86]) : hm([2, 88]);
  const nBase = add(r.neck.base, [0, 10]);
  // his jaw: its shadow on the neck draws the jaw line and its corner under the ear
  const jaw = b.sex === 'm' && r.hv !== 'b' ? [{d: skinPath({...r, head: {...r.head, o: add(r.head.o, [3 * b.head, 9 * b.head])}}, b.sex), fill: S.shade, opacity: 0.85, blurPx: Math.max(0.4, env.px / 900)}] : [];
  parts.push({name: 'neck', d: limb([nTop, lerp(nTop, nBase, 0.5), nBase], (u) => b.neck * (1 + (b.sex === 'm' ? 0.2 : 0.12) * u)), z: 19, fill: lin(add(nTop, [-30, 0]), add(nTop, [30, 30]), [[0, S.mid], [1, S.shade]]), regions: jaw});

  // the head: the skin (face), the eye where big enough, the cap
  if (r.hv !== 'b' || big) {
    const hc = hm([0, 50]);
    const regions = [];
    if (big && r.hv === 'q') {
      // the face's side plane turning from the light, and (hers) a warm cheek
      regions.push({d: ellipse(hm([40, 70]), 30 * b.head, 46 * b.head), fill: S.shade, opacity: 0.55, blurPx: 6});
      if (b.sex === 'f') regions.push({d: ellipse(hm([-8, 74]), 10 * b.head, 7 * b.head), fill: '#f08a8a', opacity: 0.32, blurPx: 5});
    }
    if (big && r.hv === 'p' && b.sex === 'f') regions.push({d: ellipse(hm([-18, 72]), 9 * b.head, 7 * b.head), fill: '#f08a8a', opacity: 0.28, blurPx: 5});
    parts.push({name: 'skin', d: skinPath(r, b.sex), z: 32, fill: lin(add(hc, [-90, -40]), add(hc, [80, 70]), [[0, S.mid], [0.55, mixLab(S.mid, S.shade, 0.5)], [1, S.shade]]), regions, rim: {px: rp * 1.1, color: S.rim, opacity: 0.95}});
  }
  if (big && r.hv !== 'b') {
    const e = eyePaths(r, b.sex);
    if (e) {
      parts.push({name: 'eye', d: e.white, z: 33, fill: mixLab(S.lit, '#ffffff', 0.55), regions: [{d: e.dark, fill: Hh.deep}]});
      parts.push({name: 'lid', d: e.dark, z: 34, fill: Hh.deep});
      if (e.brow) parts.push({name: 'brow', d: e.brow, z: 34, fill: Hh.mid, opacity: 0.85});
    }
  }
  // ONE hair paint for the cap and every ribbon (the same point gets the same value in either: no seams)
  const hc = hm([0, 40]);
  const hairPaint = lin(add(hc, [-80 * b.head, -60 * b.head]), add(hc, [140 * b.head, 160 * b.head]), [[0, Hh.lit], [0.3, Hh.mid], [1, Hh.shade]]);
  parts.push({name: 'cap', d: capPath(r, look.cut), z: 36, fill: hairPaint, rim: {px: rp, color: Hh.rim, opacity: 0.8}});

  // the ribbons
  const cv = cutView(look.cut, r.hv);
  cv.ribbons.forEach((rs, i) => {
    if (rs.minPx && env.px < rs.minPx) return;
    const {d, root, tip} = ribbonPath(r, rs, {t: env.t, wind: env.wind, px: env.px});
    const front = rs.front || r.view === 'b' || r.view === 'p';
    parts.push({
      name: `ribbon${i}`,
      d,
      z: front ? 38 + i * 0.1 : 16 + i * 0.1,
      fill: hairPaint,
      fade: {a: root, b: tip, from: 0.8, to: 1},
      rim: {px: rp * 0.9, color: Hh.rim, opacity: 0.7},
    });
  });
  // a scene's low sun: the lit edges take its warm light
  const sun = env.sun;
  if (sun) {
    for (const pt of parts) {
      if (!pt.rim) continue;
      pt.rim = {px: pt.rim.px * (sun.width ?? 1.5), color: mixLab(pt.rim.color, sun.color, sun.k ?? 0.65), opacity: Math.min(1, (pt.rim.opacity ?? 1) + 0.1)};
    }
  }
  return parts;
}


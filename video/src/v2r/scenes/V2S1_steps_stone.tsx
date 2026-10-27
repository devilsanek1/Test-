// V2S1 helper (lane L1, our bank): the STONE of our canal-side steps (TREATMENT section 5 "the bottom third", S1):
// the waterline coping (y 1215-1234), the landing (1234-1302) and five broad stone treads rising toward us (nosings
// 1302 / 1392 / 1508 / 1660 / 1850), drawn NEW for this film (the kit's canal/steps.tsx drew its joints, the bike
// frame and the newspaper in COLOURED strokes; STYLE section 3: ink is CM.ink only, in every state).
//
// One band per tread, drawn back to front INTERLEAVED with the people (V2S1_steps.tsx): a tread's stone goes down
// after the row behind it, so its nosing edge runs in front of anyone sitting at the back of the lower tread.
//   fills   a base slab per tread + perspective slabs in three light stones (each its own <Fill>, so the Look
//           cascade ripples across the steps shot by shot), a lit arris under each nosing, a shade strip over the
//           next one, joints as thin stone-shade FILLS, October leaves.
//   ink     the nosing edges only (loose architectural line: 2-4 strokes, overshoots, a hair off level), weight by
//           depth 2.2 -> 4.8; the coping edge 2.2. Joints get an f0-only INK UNDERDRAWING (1.6 px) that lifts on
//           the frame the flood reaches each joint, so frame 0 reads as a dense line drawing and the coloured state
//           keeps ink off the ground (STYLE section 3).
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {CM, INK_PX} from '../palette';
import {floodAt} from './V2S1_clock';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';

/** Our bank, world px (zoom 1.00). The lens looks level at the far bank: every joint converges on VP. */
export const BANK = {
  coping: [1215, 1234] as [number, number],
  landing: [1234, 1302] as [number, number],
  nosings: [1302, 1392, 1508, 1660, 1850],
  bottom: 1990,
  vp: [540, 965] as Pt,
};

/** The bands (far to near): 0 = the landing, 1-5 = the treads whose front edge (nosing) is the band's top. */
export type Band = {k: number; y0: number; y1: number; base: string; ink: number; lip: number};
export const BANDS: Band[] = [
  {k: 0, y0: BANK.landing[0], y1: BANK.nosings[0], base: CM.paving, ink: 0, lip: 4},
  {k: 1, y0: BANK.nosings[0], y1: BANK.nosings[1], base: CM.limestone, ink: INK_PX.far, lip: 6},
  {k: 2, y0: BANK.nosings[1], y1: BANK.nosings[2], base: CM.stucco, ink: INK_PX.far, lip: 8},
  {k: 3, y0: BANK.nosings[2], y1: BANK.nosings[3], base: CM.limestone, ink: INK_PX.mid, lip: 10},
  {k: 4, y0: BANK.nosings[3], y1: BANK.nosings[4], base: CM.paving, ink: INK_PX.mid, lip: 13},
  {k: 5, y0: BANK.nosings[4], y1: BANK.bottom, base: CM.stucco, ink: INK_PX.front, lip: 16},
];

/** Screen x of the ground line u (the joint through (540 + u * (y - 965), y)). */
const xOf = (u: number, y: number) => BANK.vp[0] + u * (y - BANK.vp[1]);
/** Ground u of screen point (x, y). */
const uOf = (x: number, y: number) => (x - BANK.vp[0]) / (y - BANK.vp[1]);

type Slab = {d: string; color: string; seed: string};
type Joint = {fill: string; ink: string; mid: Pt; seed: string};
type BandGeo = {base: string; slabs: Slab[]; arris: string; shade: string; joints: Joint[]; leaves: {d: string; color: string}[]; edge: string};

const SLAB_TONES = [CM.limestone, CM.stucco, CM.paving];

function leaf(x: number, y: number, L: number, w: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a) * 0.55; // lying on the tread: foreshortened
  const nx = -Math.sin(a) * 0.55;
  const ny = Math.cos(a) * 0.55;
  const ax = x - (ux * L) / 2;
  const ay = y - (uy * L) / 2;
  const bx = x + (ux * L) / 2;
  const by = y + (uy * L) / 2;
  return `M${P(ax, ay)}Q${P(x + nx * w * 2, y + ny * w * 2)} ${P(bx, by)}Q${P(x - nx * w * 2, y - ny * w * 2)} ${P(ax, ay)}Z`;
}

function bandGeo(b: Band, seed: string): BandGeo {
  const r = rng(`${seed}/${b.k}`);
  const yTop = b.y0;
  const yBot = b.y1;
  const depth = (yTop + yBot) / 2 - BANK.vp[1];
  // base: the whole tread, overlapping the next band a little (fills sit 2-5 px off their line)
  const base = poly([
    [-80, yTop - (b.k === 0 ? 2 : 1)],
    [1160, yTop - (b.k === 0 ? 2 : 1)],
    [1160, yBot + 10],
    [-80, yBot + 10],
  ]);
  // slabs: ground widths of ~1.0-1.5 m; on screen 170 px (landing) to 330 px (the near tread)
  const slabs: Slab[] = [];
  const joints: Joint[] = [];
  const uL = uOf(-120, yTop);
  const uR = uOf(1200, yTop);
  const step = (b.k === 0 ? 0.62 : 0.5) * (1 + r.jitter(0.08));
  let u = uL + r.range(0, step);
  let prev = uL;
  let i = 0;
  const top = yTop + b.lip * 0.5;
  const bot = yBot - b.lip * 0.9;
  while (prev < uR) {
    const next = Math.min(uR + 0.5, u);
    const color = SLAB_TONES[(i + b.k) % 3 === 0 ? 0 : r.chance(0.5) ? 1 : 2];
    slabs.push({
      d: poly([
        [xOf(prev, top), top],
        [xOf(next, top), top],
        [xOf(next, bot), bot],
        [xOf(prev, bot), bot],
      ]),
      color,
      seed: `${seed}/${b.k}/s${i}`,
    });
    if (next < uR) {
      const jw = Math.max(1.2, depth / 260);
      const xa = xOf(next, top);
      const xb = xOf(next, bot);
      joints.push({
        fill: poly([
          [xa - jw / 2, top],
          [xa + jw / 2, top],
          [xb + jw / 2, bot],
          [xb - jw / 2, bot],
        ]),
        ink: `M${P(xa + r.jitter(1), top + 2)}L${P(xb + r.jitter(1.5), bot - 1)}`,
        mid: [(xa + xb) / 2, (top + bot) / 2],
        seed: `${seed}/${b.k}/j${i}`,
      });
    }
    prev = next;
    u = next + step * r.range(0.75, 1.3);
    i++;
  }
  // the landing also has one cross joint (its slabs are square): a horizontal fill line
  if (b.k === 0) {
    const yj = (yTop + yBot) / 2 + 4;
    joints.push({fill: poly([[-60, yj - 0.6], [1140, yj - 0.6], [1140, yj + 0.7], [-60, yj + 0.7]]), ink: `M${P(-40, yj)}L${P(1120, yj + r.jitter(1))}`, mid: [540, yj], seed: `${seed}/0/jx`});
  }
  // the lit arris under the nosing (the step's top edge catching the low sun) and the shade over the next nosing
  const arris = b.k === 0 ? '' : poly([[-80, yTop], [1160, yTop], [1160, yTop + b.lip * 0.42], [-80, yTop + b.lip * 0.42]]);
  const nextLip = BANDS[b.k + 1]?.lip ?? 0;
  const shade = nextLip ? poly([[-80, yBot - nextLip * 0.8], [1160, yBot - nextLip * 0.8], [1160, yBot + 2], [-80, yBot + 2]]) : '';
  // October leaves blown into the steps (more toward the back of each tread, where the wind drops them)
  const leaves: {d: string; color: string}[] = [];
  const n = b.k === 0 ? 10 : b.k >= 4 ? 9 : 12;
  const Ls = [9, 10, 12, 15, 19, 23][b.k];
  for (let j = 0; j < n; j++) {
    const lx = r.range(-10, 1090);
    const ly = r.range(yTop + b.lip, yBot - b.lip * 0.4);
    // keep Pip's bollard clear (x 620-780 on the landing)
    if (b.k === 0 && lx > 610 && lx < 790) continue;
    leaves.push({d: leaf(lx, ly, Ls * r.range(0.75, 1.25), Ls * 0.18, r.range(-60, 60)), color: r.pick([CM.leafGold, CM.leafRust, CM.leafGold, CM.coatMustard])});
  }
  // the nosing edge: one loose structural line along the band's top (2-4 strokes, overshoot, a hair off level)
  const edge = b.ink > 0 ? line(-36, yTop + r.jitter(0.8), 1116, yTop + r.jitter(1.6), {seed: `${seed}/edge${b.k}`, over: 'structural', drift: 0.25}) : '';
  return {base, slabs, arris, shade, joints, leaves, edge};
}

/** The f0-only underdrawing: an ink joint is drawn until the flood reaches its middle (then the fill joint shows). */
const JointInk: React.FC<{j: Joint}> = ({j}) => {
  const t = useTime();
  if (t >= floodAt(j.mid[0], j.mid[1]) + 1 / 60) return null;
  return <Ink d={j.ink} width={INK_PX.hair} color={CM.ink} seed={j.seed} />;
};

/** One tread of our steps (k 0 = the landing ... 5 = the tread under the near row). */
export const StoneBand: React.FC<{k: number; seed?: string}> = ({k, seed = 'v2s1bank'}) => {
  const b = BANDS[k];
  const g = useMemo(() => bandGeo(b, seed), [k, seed]);
  return (
    <>
      <Fill d={g.base} color={b.base} seed={`${seed}/base${k}`} />
      {g.slabs.map((s) => (
        <Fill key={s.seed} d={s.d} color={s.color} seed={s.seed} />
      ))}
      {g.shade ? <Fill d={g.shade} color={CM.stoneShade} seed={`${seed}/shade${k}`} /> : null}
      {g.joints.map((j) => (
        <React.Fragment key={j.seed}>
          <Fill d={j.fill} color={CM.stoneShade} seed={j.seed} offset={false} />
          <JointInk j={j} />
        </React.Fragment>
      ))}
      {g.leaves.length ? <Fill d={g.leaves.filter((l) => l.color === CM.leafGold).map((l) => l.d).join('')} color={CM.leafGold} seed={`${seed}/lg${k}`} /> : null}
      {g.leaves.length ? <Fill d={g.leaves.filter((l) => l.color === CM.leafRust).map((l) => l.d).join('')} color={CM.leafRust} seed={`${seed}/lr${k}`} /> : null}
      {g.leaves.length ? <Fill d={g.leaves.filter((l) => l.color === CM.coatMustard).map((l) => l.d).join('')} color={CM.coatMustard} seed={`${seed}/lm${k}`} /> : null}
      {g.arris ? <Fill d={g.arris} color={CM.paper} seed={`${seed}/arris${k}`} offset={false} /> : null}
      {g.edge ? <Ink d={g.edge} width={b.ink} color={CM.ink} seed={`${seed}/edge${k}`} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the waterline coping

type CopingGeo = {top: string; roll: string; joints: Joint[]; edge: string; rings: string};
function copingGeo(seed: string): CopingGeo {
  const r = rng(`${seed}/coping`);
  const [y0, y1] = BANK.coping;
  const top = poly([[-80, y0], [1160, y0], [1160, y1 + 2], [-80, y1 + 2]]);
  const roll = poly([[-80, y0], [1160, y0], [1160, y0 + 4.5], [-80, y0 + 4.5]]);
  const joints: Joint[] = [];
  let x = r.range(20, 80);
  let i = 0;
  while (x < 1100) {
    const u = uOf(x, y0);
    const xa = xOf(u, y0 + 5);
    const xb = xOf(u, y1);
    joints.push({
      fill: poly([[xa - 0.7, y0 + 5], [xa + 0.7, y0 + 5], [xb + 0.8, y1], [xb - 0.8, y1]]),
      ink: `M${P(xa, y0 + 5)}L${P(xb, y1 - 1)}`,
      mid: [(xa + xb) / 2, (y0 + y1) / 2],
      seed: `${seed}/cj${i++}`,
    });
    x += r.range(80, 125);
  }
  const edge = line(-36, y0 + 0.5, 1116, y0 + r.jitter(1.2), {seed: `${seed}/copingEdge`, over: 'structural', drift: 0.2});
  // two iron mooring rings lying flat in the coping (ink-only things)
  const ring = (cx: number, cy: number, rx: number, ry: number) => `M${P(cx - rx, cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${P(cx + rx, cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${P(cx - rx + 1.5, cy - 0.6)}`;
  const rings = ring(318, 1225, 9, 4.2) + `M${P(313, 1221)}L${P(323, 1221)}` + ring(1016, 1225, 9.5, 4.4) + `M${P(1011, 1221)}L${P(1021, 1221)}`;
  return {top, roll, joints, edge, rings};
}

/** The coping along our waterline (the first thing drawn on our bank). */
export const Coping: React.FC<{seed?: string}> = ({seed = 'v2s1bank'}) => {
  const g = useMemo(() => copingGeo(seed), [seed]);
  return (
    <>
      <Fill d={g.top} color={CM.limestone} seed={`${seed}/copTop`} />
      <Fill d={g.roll} color={CM.stoneShade} seed={`${seed}/copRoll`} offset={false} />
      {g.joints.map((j) => (
        <React.Fragment key={j.seed}>
          <Fill d={j.fill} color={CM.stoneShade} seed={j.seed} offset={false} />
          <JointInk j={j} />
        </React.Fragment>
      ))}
      <Ink d={g.edge} width={INK_PX.far} color={CM.ink} seed={`${seed}/copEdge`} />
      <Ink d={g.rings} width={INK_PX.hair} color={CM.ink} seed={`${seed}/rings`} />
    </>
  );
};

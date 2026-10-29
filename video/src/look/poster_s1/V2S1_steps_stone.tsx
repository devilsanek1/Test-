// V2S1 helper (lane L1, our bank): the STONE of our canal-side steps, in the clean pen, seen in TWO-POINT perspective
// (the owner's depth note + the orchestrator's ground pass, 2026-10-27: "the bottom part: little to no perspective or
// depth"; no line below the water exactly horizontal). Every edge of our bank that runs along the canal (the coping, the
// landing, five nosings, the terrace's edge) is a line to ONE vanishing point on the canal's horizon off-frame left, where
// the canal bends away under the bridge (GROUND_VP); the joints that run across the steps go to the second point far
// right (GROUND_VP2). So the steps fan open toward us at the right and close up toward the bridge at the left; the
// treads foreshorten (the landing ~56 px deep at x 540, the nearest tread ~245 px: 4.4x) and the step lips (risers)
// grow toward us. Tier C (environment): no lines, flat two-tone stone blocks; the joints are flat strips (a value
// step, never a dark line) finer with distance. The step lips are what `Shade` darkens (S1Steps).
import React, {useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {rng} from '../../lib/rng';
import {CM} from '../../v2r/palette';
import {useSwitches} from './switches';
import {nearMid} from './near';
import {dark} from './darks';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';

/** The ground's vanishing point (along the canal) and the second one (across it); the canal's horizon y 1000. The
 *  pair sits ~90 degrees apart for a ~1840 px viewing distance (a calm 2-point view, no fisheye). */
export const GROUND_VP: Pt = [-1100, 1000];
export const GROUND_VP2: Pt = [2600, 1000];
/** The line through GROUND_VP whose y at x = 540 is `y540`: an edge of our bank running along the canal. */
export const edgeY = (y540: number, x: number) => GROUND_VP[1] + ((y540 - GROUND_VP[1]) * (x - GROUND_VP[0])) / (540 - GROUND_VP[0]);
/** The local scale of our bank at a ground point (1 at x 540 on the line y540 = 1500): how big a thing standing
 *  there draws (things shrink toward the vanishing point and up the frame). */
export const groundScale = (x: number, y: number) => ((x - GROUND_VP[0]) / (540 - GROUND_VP[0])) * ((y - GROUND_VP[1]) / (1500 - GROUND_VP[1])) ** 0.5;
/** The slope (dy/dx) of the bank's edges through a point: tilt contact shadows and slabs by it. */
export const edgeSlope = (x: number, y: number) => (y - GROUND_VP[1]) / (x - GROUND_VP[0]);

/** Our bank's lit stone: a peach cream a hair under the frame's brightest 5 % (L* ~89 < 90.4), so the brightest area
 *  stays on the subject and the lit wing (CRAFT §d.2), not on the pale near steps. */
export const BANK_LIT = '#F5DBC9';
/** Our bank's paving and its second stone: peach cream (h ~61, the art director on v3: the sand-beige h 71-83 read
 *  muddy), the second a step down; the joints a mid step under them (L* ~80: a value step, never a dark line). */
export const BANK_PAVE = '#F4D6C2';
const BANK_ALT = '#EFCEB9';
/** The joints' stone: a warm mid step under the paving (L* ~80: a value step, never a dark line). */
const JOINT = '#E2C1AD';

/** (the look test's darks: the near world in mid-tones) our bank's stones with their rough area shares: lane E's near
 *  floor puts plane -1 at L* 60 (near.ts). */
const BANK_ENTRIES: [string, number][] = [[BANK_PAVE, 0.42], [BANK_LIT, 0.36], [BANK_ALT, 0.12], [JOINT, 0.05], [CM.stoneShade, 0.05]];
/** The bank's colour map: identity, or the near world's mid-tones under the darks switch. */
export function useBankTone(): (c: string) => string {
  const {darks, nearMid: nm} = useSwitches();
  if (!(nm ?? darks)) return (c) => c;
  const m = nearMid(BANK_ENTRIES, -1);
  return (c) => m[c] ?? c;
}

/** Our bank, as each edge's y at x = 540 (the edges themselves run to GROUND_VP). */
export const BANK = {
  coping: [1215, 1234] as [number, number],
  landing: [1234, 1290] as [number, number],
  nosings: [1290, 1362, 1456, 1580, 1745],
  /** The top of the steps: the terrace we stand on starts here. */
  terrace: 1990,
};

/** Band k: 0 = the landing, 1-5 = the treads whose front edge (nosing) is the band's top, 6 = the terrace (to the frame's
 *  bottom). `lip` = the step lip's height at x 540 (grows toward us and toward the right with the local scale). */
export const BANDS = [
  {k: 0, y0: BANK.landing[0], y1: BANK.nosings[0], top: BANK_PAVE, lip: 0},
  {k: 1, y0: BANK.nosings[0], y1: BANK.nosings[1], top: BANK_LIT, lip: 5},
  {k: 2, y0: BANK.nosings[1], y1: BANK.nosings[2], top: BANK_PAVE, lip: 8},
  {k: 3, y0: BANK.nosings[2], y1: BANK.nosings[3], top: BANK_LIT, lip: 11},
  {k: 4, y0: BANK.nosings[3], y1: BANK.nosings[4], top: BANK_PAVE, lip: 15},
  {k: 5, y0: BANK.nosings[4], y1: BANK.terrace, top: BANK_LIT, lip: 21},
  {k: 6, y0: BANK.terrace, y1: 3600, top: BANK_PAVE, lip: 28},
] as const;

const X0 = -80;
const X1 = 1160;
/** The band between two edges (y540 values), across the whole frame. */
const between = (a: number, b: number, grow = 0) => poly([[X0, edgeY(a, X0) - grow], [X1, edgeY(a, X1) - grow], [X1, edgeY(b, X1) + grow], [X0, edgeY(b, X0) + grow]]);
/** A step's lip (band k's nosing; the landing has none): its height scales with the distance from the vanishing point. */
const lipPath = (k: number): string => {
  const b = BANDS[k];
  if (b.lip <= 0) return '';
  const h = (x: number) => (b.lip * (x - GROUND_VP[0])) / (540 - GROUND_VP[0]);
  return poly([[X0, edgeY(b.y0, X0)], [X1, edgeY(b.y0, X1)], [X1, edgeY(b.y0, X1) + h(X1)], [X0, edgeY(b.y0, X0) + h(X0)]]);
};
/** A step's lip, for the `Shade` step in S1Steps. */
export const edgePath = (k: number): string => lipPath(k);

/** Where the line from GROUND_VP2 through p meets the bank edge y540 (a cross joint's end). */
function onEdge(p: Pt, y540: number): Pt {
  // edge: y = A + m x ; joint: y = p.y + n (x - p.x)
  const m = (y540 - GROUND_VP[1]) / (540 - GROUND_VP[0]);
  const A = GROUND_VP[1] - m * GROUND_VP[0];
  const n = (GROUND_VP2[1] - p[1]) / (GROUND_VP2[0] - p[0]);
  const x = (p[1] - n * p[0] - A) / (m - n);
  return [x, A + m * x];
}

/** One tread: the lit top, stone blocks in the two warm stones alternating (their cross joints to GROUND_VP2, wider
 *  toward us: ~1.2 m), the flat joint strips finer with distance, the step lip at its top. */
export const StoneBand: React.FC<{k: number; seed?: string}> = ({k, seed = 'v2s1bank'}) => {
  const b = BANDS[k];
  const g = useMemo(() => {
    const r = rng(`${seed}/${k}`);
    const yTop = b.y0 + b.lip;
    const yBot = Math.min(b.y1, 2400);
    const base = between(b.y0 - 1, b.y1 + 1);
    const other = k >= 3 ? BANK_ALT : b.top === BANK_LIT ? BANK_PAVE : BANK_LIT;
    const slabs: {d: string; color: string; seed: string}[] = [];
    const joints: string[] = [];
    // block boundaries along the tread's middle line, spaced in proportion to the distance from the vanishing point
    // (equal ground lengths: finer toward the bridge); staggered by half a block from tread to tread
    const mid = (yTop + yBot) / 2;
    let x = -60 - (k % 2) * 60;
    let i = 0;
    let prev: [Pt, Pt] | null = null;
    while (x < X1 + 200) {
      const p: Pt = [x, edgeY(mid, x)];
      const a = onEdge(p, yTop);
      const c = onEdge(p, yBot);
      if (prev && i % 2) slabs.push({d: poly([prev[0], a, c, prev[1]]), color: other, seed: `${seed}/${k}/s${i}`});
      // the joint strip: its width follows the local scale (0.6 px by the bridge, ~4 px at the nearest tread)
      const jw = Math.max(0.6, 2.6 * groundScale(x, mid));
      joints.push(poly([[a[0] - jw / 2, a[1]], [a[0] + jw / 2, a[1]], [c[0] + jw / 2, c[1]], [c[0] - jw / 2, c[1]]]));
      prev = [a, c];
      // a ground length ~1.2 m on screen: the local scale along the tread (toward the vanishing point) AND its depth
      // (finer toward the water: CRAFT §f.4's texture gradient)
      const step = 150 * ((x - GROUND_VP[0]) / (540 - GROUND_VP[0])) * ((mid - GROUND_VP[1]) / (1500 - GROUND_VP[1])) ** 1.5 * r.range(0.85, 1.2);
      x += Math.max(18, step);
      i++;
    }
    return {base, slabs, joints: joints.join(''), lip: lipPath(k)};
  }, [k, seed]);
  const tone = useBankTone();
  return (
    <>
      <Fill d={g.base} color={tone(b.top)} seed={`${seed}/base${k}`} offset={false} />
      {g.slabs.map((s) => (
        <Fill key={s.seed} d={s.d} color={tone(s.color)} seed={s.seed} offset={false} />
      ))}
      <Fill d={g.joints} color={tone(JOINT)} seed={`${seed}/joints${k}`} offset={false} />
      {g.lip ? <Fill d={g.lip} color={tone(BANK_PAVE)} seed={`${seed}/edge${k}`} offset={false} /> : null}
    </>
  );
};

/** The coping along our waterline (it runs to the vanishing point too): its top and its rounded lip one tone down. */
export const Coping: React.FC<{seed?: string}> = ({seed = 'v2s1bank'}) => {
  const [y0, y1] = BANK.coping;
  const {darks} = useSwitches();
  const tone = useBankTone();
  return (
    <>
      <Fill d={between(y0, y1 + 2)} color={tone(BANK_LIT)} seed={`${seed}/copTop`} offset={false} />
      {/* (the look test's darks) the wet dark edge where the coping drops into the water */}
      <Fill d={between(y0, y0 + 5)} color={darks ? dark('pane') : CM.stoneShade} seed={`${seed}/copLip`} offset={false} />
      {darks ? <Fill d={COPING_CLEATS} color={dark('iron')} seed={`${seed}/cleats`} offset={false} /> : null}
    </>
  );
};

/** (the look test's darks) three cast-iron mooring cleats on the coping's top, along its edge (scaled by the bank). */
const COPING_CLEATS: string = [150, 452, 968]
  .map((x) => {
    const y = edgeY(BANK.coping[0] + 9, x);
    const s = groundScale(x, y);
    const w = 26 * s;
    const h = 7 * s;
    const m = edgeSlope(x, y);
    const pt = (dx: number, dy: number): Pt => [x + dx, y + dy + m * dx];
    return poly([pt(-w / 2, 0), pt(-w * 0.32, -h), pt(w * 0.32, -h), pt(w / 2, 0), pt(w * 0.3, h * 0.5), pt(-w * 0.3, h * 0.5)]);
  })
  .join('');

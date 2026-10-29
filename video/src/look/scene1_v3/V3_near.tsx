// Scene 1, still v3: OUR BANK, the near frame (WORLD px, the shifted group). v2's steps in the look test's mid-tones
// (pass 2's darks: the near world at L* ~60, the patchwork stone, the wet coping edge, the cleats and grates), now only
// the landing and three treads in the frame; v2's foreground props (the planter's tree, the crates, the café set, the
// parapet) are gone: the camera stands on these steps, and the near frame is the stone itself, darker than the far
// world (the separation the owner liked), with her on the landing.
//   her    V3Her (tier A) at V3_HER: walking west along the landing by the water, rear 3/4, no face, the desk plant
//          under her arm; her contact shadow and her long cast shadow (the low western sun: right, a little toward us)
//   Pip    hidden on the near moored boat's roof between its pots (tier B, ~54 px), facing her across the water
import React from 'react';
import {Tier} from '../../lib/tier';
import {CastShadow, ContactShadow, Shade, ShadowLayer} from '../../lib/light';
import {Look} from '../../lib/exit';
import {useTime} from '../../lib/time';
import {PipTrack} from '../../v2r/kit/pip';
import {floodAt, S1_PIP} from './V2S1_clock';
import {BANDS, Coping, StoneBand, edgePath, edgeY, groundScale, edgeSlope} from './V2S1_steps_stone';
import {Fill} from '../../lib/Fill';
import {CM} from '../../v2r/palette';
import {S1Plane, S1_PLANE} from './V2S1_float';
import {V3Her} from './V2S1_row';
import {useSwitches} from './switches';
import {V3_HER, V3_PIP} from './V3_layout';

const HerShadows: React.FC = () => {
  const {x, feet, h} = V3_HER;
  const at = floodAt(x, feet);
  return (
    <ShadowLayer>
      <ContactShadow x={x} y={feet} w={h * 0.2} at={at} />
      <CastShadow x={x} y={feet} w={h * 0.17} h={h} at={at} />
    </ShadowLayer>
  );
};

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';

/** The near frame's cast shade: the low western sun is cut off behind us on the left (an off-frame plane tree), so the
 *  treads below the landing lie in its shade, its edge sloping down to the right with the light and bumped by the
 *  crown's lobes; she walks in the last sunlit strip by the water. A second, deeper step at the frame's bottom. */
const shadeEdge = (y540: number, drop: number, bump: number, seed: number): Pt[] => {
  const pts: Pt[] = [];
  for (let x = -60; x <= 1140; x += 30) {
    const u = (x + 60) / 1200;
    const lobes = bump * (Math.sin(u * 17 + seed) * 0.6 + Math.sin(u * 41 + seed * 2.1) * 0.4);
    pts.push([x, edgeY(y540, x) + drop * u + lobes]);
  }
  return pts;
};
const NEAR_SHADE = poly([...shadeEdge(1318, 70, 9, 1.3), [1140, 1800], [-60, 1800]]);
const NEAR_DEEP = poly([...shadeEdge(1560, 40, 6, 4.2), [1140, 1800], [-60, 1800]]);

/** A few small things on the treads (in the shade): fallen plane leaves, a takeaway cup, a folded newspaper. */
const LEAVES: [number, number, number, number, number][] = [
  // x, y540 of the tread line, length, angle, tone (0 gold, 1 rust)
  [118, 1338, 15, 20, 0], [196, 1350, 12, -30, 1], [404, 1400, 16, 60, 0], [612, 1384, 13, 10, 1], [930, 1348, 12, -50, 0],
  [80, 1500, 20, -15, 1], [342, 1520, 18, 35, 0], [700, 1498, 17, -70, 1], [880, 1540, 19, 25, 0], [1010, 1470, 16, 80, 1],
  [236, 1640, 24, 40, 0], [560, 1660, 22, -20, 1], [826, 1676, 25, 65, 0],
];
const leafD = (x: number, y540: number, len: number, ang: number): string => {
  const y = edgeY(y540, x);
  const s = groundScale(x, y);
  const l = len * s;
  const w = l * 0.42;
  const a = (ang * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a) * 0.55; // lying on the ground: foreshortened
  const p = (u: number, v: number): Pt => [x + u * ca - v * Math.sin(a), y + u * sa + v * Math.cos(a) * 0.55];
  const [a0, a1, b0, b1] = [p(-l / 2, 0), p(l / 2, 0), p(0, -w), p(0, w)];
  return `M${r1(a0[0])} ${r1(a0[1])}Q${r1(b0[0])} ${r1(b0[1])} ${r1(a1[0])} ${r1(a1[1])}Q${r1(b1[0])} ${r1(b1[1])} ${r1(a0[0])} ${r1(a0[1])}Z`;
};
const NearThings: React.FC = () => {
  const gold = LEAVES.filter((q) => q[4] === 0).map(([x, y, l, a]) => leafD(x, y, l, a)).join('');
  const rust = LEAVES.filter((q) => q[4] === 1).map(([x, y, l, a]) => leafD(x, y, l, a)).join('');
  // the cup on tread 2, the newspaper on tread 3 (scaled by the bank, its edges along the bank's lines)
  const cx = 842;
  const cy = edgeY(1430, cx);
  const cs = groundScale(cx, cy);
  const cup = poly([[cx - 8 * cs, cy - 24 * cs], [cx + 8 * cs, cy - 24 * cs], [cx + 6 * cs, cy], [cx - 6 * cs, cy]]);
  const lid = poly([[cx - 9 * cs, cy - 27 * cs], [cx + 9 * cs, cy - 27 * cs], [cx + 9 * cs, cy - 23 * cs], [cx - 9 * cs, cy - 23 * cs]]);
  const sleeve = poly([[cx - 7.4 * cs, cy - 17 * cs], [cx + 7.4 * cs, cy - 17 * cs], [cx + 6.8 * cs, cy - 9 * cs], [cx - 6.8 * cs, cy - 9 * cs]]);
  const nx = 520;
  const ny = edgeY(1540, nx);
  const ns = groundScale(nx, ny);
  const m = edgeSlope(nx, ny);
  const q = (dx: number, dy: number): Pt => [nx + dx * ns, ny + (dy + m * dx) * ns];
  const paper = poly([q(-34, -9), q(30, -12), q(36, 6), q(-30, 9)]);
  const fold = poly([q(-2, -10.5), q(30, -12), q(36, 6), q(2, 7.5)]);
  return (
    <Tier tier="environment">
      <Fill d={gold} color={CM.leafGold} seed="v3near/leavesG" offset={false} />
      <Fill d={rust} color={CM.leafRust} seed="v3near/leavesR" offset={false} />
      <Fill d={cup} color={CM.paper} seed="v3near/cup" offset={false} />
      <Fill d={sleeve} color={CM.brick} seed="v3near/cupSleeve" offset={false} />
      <Fill d={lid} color={CM.stoneShade} seed="v3near/cupLid" offset={false} />
      <Fill d={paper} color={CM.stucco} seed="v3near/paper" offset={false} />
      <Fill d={fold} color={CM.stoneShade} seed="v3near/paperFold" offset={false} />
    </Tier>
  );
};

/** Our bank and her (the `seated` slot). */
export const V3Near: React.FC = () => (
  <>
    <S1Plane plane={S1_PLANE.bank}>
      <Tier tier="environment">
        <Coping />
        <StoneBand k={0} />
      </Tier>
      {BANDS.slice(1).map((b) => (
        <React.Fragment key={b.k}>
          <Tier tier="environment">
            <StoneBand k={b.k} />
          </Tier>
          {/* the step's edge faces away from the low western sun: one shade step */}
          <Shade d={edgePath(b.k)} at={floodAt(540, b.y0)} />
        </React.Fragment>
      ))}
      <NearThings />
      {/* the near frame in shade (the cast tint), a deeper step at the bottom */}
      <Shade d={NEAR_SHADE} tint="cast" at={floodAt(540, 1500)} />
      <Shade d={NEAR_DEEP} tint="cast" at={floodAt(540, 1650)} />
    </S1Plane>
    <S1Plane plane={S1_PLANE.bank} texture={false} under={<HerShadows />}>
      <V3Her x={V3_HER.x} y={V3_HER.feet} h={V3_HER.h} step={V3_HER.step} turn={V3_HER.turn} />
    </S1Plane>
  </>
);

/** Pip, hidden (a quiet "find Pip"): on the near boat's roof, small, facing back across the water at her. */
export const V3Pip: React.FC = () => {
  const t = useTime();
  const sw = useSwitches();
  if (t < S1_PIP.from) return null;
  return (
    <Look ink={!sw.lineOff}>
      <PipTrack x={V3_PIP.x} y={V3_PIP.y} size={V3_PIP.size} facing="back" seed="pipV3" paint="look" tier="support" keys={[{t: S1_PIP.from, draw: S1_PIP.drawDur}]} />
    </Look>
  );
};

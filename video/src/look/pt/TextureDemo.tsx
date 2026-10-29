// PT lane demo: lib/texture's per-plane mottle on the patchwork canal set (PatchworkDemo's), under v2 S1's own evening
// sky (lib/sky: its gradient and dither), floating by depth (lib/depth PARALLAX_Z). One <Mottle> per plane group, each
// at its spec strength (mottleK) and its own seed: the sky 0.6, the far city 0.4, the water and the quay 0.7 (near C),
// the subject's plane 1.0. props.mode 'flat' | 'mottle'; the float runs 0.2-1.6 s and is home (at rest) from 1.6 s.
//   GL=angle node scripts/render-frames.mjs PtTextureDemo <dir> 0 --entry=src/look/pt/entry.tsx --props='{"mode":"mottle"}'
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {floatAt, parallaxOffset, PARALLAX_Z, type FloatLeg} from '../../lib/depth';
import {patchPaths, markShape} from '../../lib/patchwork';
import {Sky} from '../../lib/sky';
import {Mottle, mottleK} from '../../lib/texture';
import {useTime} from '../../lib/time';
import {S1_EVENING} from '../../v2r/world/skies';
import {CAM, demoPatchworks, skyline} from './PatchworkDemo';

const WATER = '#86B4AC';
const COPING = '#E6CFC2';
/** The float: two straight legs out and home (near ground px), then at rest (the hold). */
export const TEX_LEGS: FloatLeg[] = [
  {t0: 0.2, t1: 0.9, to: [-8, -5]},
  {t0: 0.9, t1: 1.6, to: [0, 0]},
];
const PLANES = {sky: Infinity, far: 3, water: -0.5, subject: 0, quay: -1} as const;

const Plane: React.FC<{plane: number; k: number; seed: number; mottle: boolean; region?: [number, number, number, number]; children?: React.ReactNode}> = ({plane, k, seed, mottle, region, children}) => {
  const t = useTime();
  const off = plane === Infinity ? ([0, 0] as [number, number]) : (parallaxOffset(floatAt(t, TEX_LEGS), plane, PARALLAX_Z) as [number, number]);
  return (
    <g transform={`translate(${off[0].toFixed(3)} ${off[1].toFixed(3)})`}>
      <Mottle k={mottle ? k : 0} seed={seed} offset={off} region={region}>
        {children}
      </Mottle>
    </g>
  );
};

export const PtTextureDemo: React.FC<{mode: 'flat' | 'mottle'}> = ({mode}) => {
  const {quay, far} = React.useMemo(() => demoPatchworks(0.3), []);
  const m = mode === 'mottle';
  const yQuay = Math.round(CAM.y(9.0));
  void skyline;
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Plane plane={PLANES.sky} k={mottleK({sky: true})} seed={11} mottle={m} region={[-40, -40, 1160, 1060]}>
          <Sky spec={S1_EVENING} />
        </Plane>
        <Plane plane={PLANES.far} k={mottleK({plane: 3})} seed={12} mottle={m} region={[-60, 560, 1200, 440]}>
          <path d={far.base.d} fill={far.base.color} />
          {patchPaths(far).map((p) => (
            <path key={p.key} d={p.d} fill={p.color} />
          ))}
          {far.facets.filter((f) => f.mark).map((f) => {
            const s = markShape(far, f, f.wV > f.wU * 1.2 ? 'pair' : 'band');
            return s ? <path key={`m${f.id}`} d={s.d} fill={s.color} /> : null;
          })}
        </Plane>
        <Plane plane={PLANES.water} k={mottleK({plane: -0.5})} seed={13} mottle={m} region={[-60, 940, 1200, yQuay - 900]}>
          <rect x={-40} y={965} width={1160} height={yQuay - 965} fill={WATER} />
        </Plane>
        <Plane plane={PLANES.quay} k={mottleK({plane: -1})} seed={14} mottle={m} region={[-60, yQuay - 60, 1200, 1980 - yQuay + 100]}>
          <rect x={-40} y={yQuay - 14} width={1160} height={14} fill={COPING} />
          <path d={quay.base.d} fill={quay.base.color} />
          {patchPaths(quay).map((p) => (
            <path key={p.key} d={p.d} fill={p.color} />
          ))}
          {quay.facets.filter((f) => f.mark).map((f) => {
            const s = markShape(quay, f, 'square');
            return s ? <path key={`m${f.id}`} d={s.d} fill={s.color} /> : null;
          })}
        </Plane>
        <Plane plane={PLANES.subject} k={mottleK({tier: 'subject'})} seed={15} mottle={m} region={[560, 1180, 180, 360]}>
          <path d="M600 1500L600 1280L650 1240L700 1280L700 1500Z" fill="#0B8577" />
          <path d="M650 1240L700 1280L700 1500L650 1500Z" fill="#06574E" />
        </Plane>
      </svg>
    </AbsoluteFill>
  );
};

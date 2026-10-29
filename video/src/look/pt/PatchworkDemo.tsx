// PT lane demo: lib/patchwork on a canal set through v2 S1's lens (groundCam horizon 965, f 1400, height 1.3).
// props.mode 'flat' (v2's way: one fill per surface) | 'patch' (the quay as a receding ground patchwork, the far city as
// frontal blocks, identity marks, the subject kept clear) | 'grid' (the same with a 0.3 m paving module: cuts align
// into rows). Raw <path>s: the tones are exactly the patchwork's.
//   GL=angle node scripts/render-frames.mjs PtPatchworkDemo <dir> 0 --entry=src/look/pt/entry.tsx --props='{"mode":"patch"}'
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {groundCam, makeAtmosphere, recede} from '../../lib/depth';
import {frontalBlocks, groundPatchwork, markShape, patchPaths, patchTones, patchworkProblems, patchStats, type Box, type Patchwork, type Pt} from '../../lib/patchwork';
import {rng} from '../../lib/rng';

export const CAM = groundCam({horizon: 965, f: 1400, height: 1.3});
const ATM = makeAtmosphere({name: 'pt demo', air: '#FDD6B8'});
const SKY = '#C5DDD3';
const BRICK = '#C9806A';
const WATER = '#86B4AC';
const PAVE = '#CFAFA4';
const COPING = '#E6CFC2';

/** The far skyline: one polygon (concave), buildings 50-110 px wide, flat tops and 45-degree gables, base y 965. */
export function skyline(seed: string, x0 = -40, x1 = 1120, base = 968): Pt[] {
  const r = rng(seed);
  const top: Pt[] = [];
  let x = x0;
  while (x < x1) {
    const w = Math.round(r.range(50, 110));
    const h = Math.round(r.range(120, 300));
    const y = base - h;
    if (r.chance(0.35) && w > 60) {
      const half = Math.round(w / 2);
      top.push([x, y + half], [x + half, y], [x + w, y + half]);
    } else top.push([x, y], [x + w, y]);
    x += w;
  }
  return [[x0, base], ...top, [x, base]];
}

const SUBJECT: Box = [600, 1240, 700, 1500];

export function demoPatchworks(grid = 0): {quay: Patchwork; far: Patchwork} {
  const quay = groundPatchwork(CAM, {
    seed: 'pt-demo-quay',
    grid,
    poly: [[-4.4, 1.95], [4.4, 1.95], [4.4, 9.0], [-4.4, 9.0]],
    cell: 0.8,
    tones: patchTones(PAVE, {plane: -1}),
    plane: -1,
    key: [-1, -0.25],
    avoid: [[SUBJECT[0] - 30, SUBJECT[1] - 10, SUBJECT[2] + 30, SUBJECT[3] + 16]],
  });
  const farBase = recede(BRICK, 3, ATM);
  const far = frontalBlocks({seed: 'pt-demo-far', poly: skyline('pt-demo-sky'), tones: patchTones(farBase, {plane: 3}), plane: 3, key: [-1, -0.25]});
  return {quay, far};
}

export const PtPatchworkDemo: React.FC<{mode: 'flat' | 'patch' | 'grid'; lint?: boolean}> = ({mode, lint}) => {
  const {quay, far} = React.useMemo(() => demoPatchworks(mode === 'grid' ? 0.3 : 0), [mode]);
  const sky = skyline('pt-demo-sky');
  const skyD = 'M' + sky.map(([x, y]) => `${x} ${y}`).join('L') + 'Z';
  const yQuay = Math.round(CAM.y(9.0));
  const subject = (
    <g>
      {/* a stand-in subject (tier A): a lit and a shade face, no outline */}
      <path d={`M${SUBJECT[0]} ${SUBJECT[3]}L${SUBJECT[0]} ${SUBJECT[1] + 40}L${(SUBJECT[0] + SUBJECT[2]) / 2} ${SUBJECT[1]}L${SUBJECT[2]} ${SUBJECT[1] + 40}L${SUBJECT[2]} ${SUBJECT[3]}Z`} fill="#0B8577" />
      <path d={`M${(SUBJECT[0] + SUBJECT[2]) / 2} ${SUBJECT[1]}L${SUBJECT[2]} ${SUBJECT[1] + 40}L${SUBJECT[2]} ${SUBJECT[3]}L${(SUBJECT[0] + SUBJECT[2]) / 2} ${SUBJECT[3]}Z`} fill="#06574E" />
    </g>
  );
  return (
    <AbsoluteFill style={{background: SKY}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect x={0} y={0} width={1080} height={1920} fill={SKY} />
        {/* the far city (plane +3) */}
        {mode === 'flat' ? (
          <path d={skyD} fill={far.base.color} />
        ) : (
          <g>
            <path d={far.base.d} fill={far.base.color} />
            {patchPaths(far).map((p) => (
              <path key={p.key} d={p.d} fill={p.color} />
            ))}
            {far.facets.filter((f) => f.mark).map((f) => {
              const m = markShape(far, f, f.wV > f.wU * 1.2 ? 'pair' : 'band');
              return m ? <path key={`m${f.id}`} d={m.d} fill={m.color} /> : null;
            })}
          </g>
        )}
        {/* the water and the far coping */}
        <rect x={0} y={965} width={1080} height={yQuay - 965} fill={WATER} />
        <rect x={0} y={yQuay - 14} width={1080} height={14} fill={COPING} />
        {/* our quay (plane -1) through the ONE camera */}
        {mode === 'flat' ? (
          <path d={quay.base.d} fill={quay.base.color} />
        ) : (
          <g>
            <path d={quay.base.d} fill={quay.base.color} />
            {patchPaths(quay).map((p) => (
              <path key={p.key} d={p.d} fill={p.color} />
            ))}
            {quay.facets.filter((f) => f.mark).map((f) => {
              const m = markShape(quay, f, 'square');
              return m ? <path key={`m${f.id}`} d={m.d} fill={m.color} /> : null;
            })}
          </g>
        )}
        {subject}
        {lint ? (
          <text x={40} y={1900} fontSize={22} fontFamily="DejaVu Sans, sans-serif" fill="#2B1B0A">
            {`quay ${JSON.stringify(patchStats(quay))} ${patchworkProblems(quay).join('; ') || 'OK'}`.slice(0, 120)}
          </text>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

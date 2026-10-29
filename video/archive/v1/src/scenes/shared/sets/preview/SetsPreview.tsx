// SetsPreview — dev harness for the SETS lane (its own Remotion entry, so the shared registry stays untouched).
//
//   ENTRY=src/scenes/shared/sets/preview/entry.ts  (see docs/SHARED_SETS.md "Preview")
//   npx remotion still src/scenes/shared/sets/preview/entry.ts SetsPreview out.png --frame=60 --props='{"set":"plaza"}'
//
// Each preview drives a set with DEMO event times taken from the v1 storyboard (they live HERE, never in the sets).

import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {canvas} from '../../../../lib/theme';
import {SET_CATALOG} from '../catalog';

type P = {set?: string; variant?: string};

export const SetsPreview: React.FC<P> = (props) => {
  const ip = {...(getInputProps() as P), ...props};
  const entry = SET_CATALOG.find((c) => c.id === (ip.set ?? 'plaza')) ?? SET_CATALOG[0];
  return <>{entry.preview(ip.variant)}</>;
};

/** Every set's thumbnail on one sheet (3 x N grid at 1/4 scale). */
export const SetsSheet: React.FC = () => {
  const cols = 4;
  const s = 0.25;
  const W = canvas.width * s;
  const H = canvas.height * s;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#FFFFFF'}}>
      <svg width={canvas.width} height={canvas.height} viewBox={`0 0 ${canvas.width} ${canvas.height}`}>
        {SET_CATALOG.map((c, i) => {
          const x = (i % cols) * W;
          const y = Math.floor(i / cols) * (H + 30);
          return (
            <g key={c.id} transform={`translate(${x} ${y}) scale(${s})`}>
              <clipPath id={`clip${i}`}>
                <rect x={0} y={0} width={canvas.width} height={canvas.height} />
              </clipPath>
              <g clipPath={`url(#clip${i})`}>
                <rect x={0} y={0} width={canvas.width} height={canvas.height} fill={c.sky} />
                {c.thumb()}
              </g>
              <text x={20} y={canvas.height + 90} fontSize={80} fill="#2B1B0A" fontFamily="sans-serif">
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const PreviewRoot: React.FC = () => (
  <>
    <Composition id="SetsPreview" component={SetsPreview} durationInFrames={Math.round(12 * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} defaultProps={{}} />
    <Composition id="SetsSheet" component={SetsSheet} durationInFrames={Math.round(12 * canvas.fps)} fps={canvas.fps} width={canvas.width} height={canvas.height} />
  </>
);


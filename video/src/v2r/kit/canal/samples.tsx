// canal/samples.tsx: the kit's sample frames (CanalSample-S1/S2/S4/S8) and the KitCanal sheet. Sets at the map's
// positions; her, the ghosts and the public as kit placeholders (the film's people come from K4 via <CanalCast>).

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {World} from '../../../lib/World';
import {useTime} from '../../../lib/time';
import {torso} from '../../../lib/sketch';
import {Batch, Paint, ovalPath, P} from './core';
import {S1Set} from './sets';
import * as MAP from '../../world/map';

const GOLDEN = [CM.sky, CM.bandGold];

/** A placeholder of HER (teal coat, plum bun, cream tote; back / walking profile) and the ghost row, at film time t. */
export const RowPlaceholders: React.FC<{t?: number}> = ({t: tIn}) => {
  const tt = useTime();
  const t = tIn ?? tt;
  const b = new Batch();
  const row = MAP.s1RowAt(t);
  // far members first
  for (let i = row.length - 1; i >= 0; i--) {
    const m = row[i];
    if (!m.visible) continue;
    const spec = MAP.S1_ROW[i];
    const H = m.h;
    const x = m.x;
    const y = m.feetY;
    const headH = H * 0.15;
    const torsoH = H * 0.5;
    const tw = H * 0.26;
    const legY = y - H * 0.3;
    const coat = m.kind === 'her' ? CM.hero : m.kind === 'ghost' ? CM.ghostPaper : 'none';
    const head = spec.headHex ?? 'none';
    b.layer();
    const body = torso(x, legY + 8, tw, torsoH, 0.4, 0.1) + 'Z';
    if (coat !== 'none') {
      b.rect(m.kind === 'her' ? CM.anchor : CM.ghostPaper, x - tw * 0.3, legY, tw * 0.22, H * 0.3);
      b.rect(m.kind === 'her' ? CM.anchor : CM.ghostPaper, x + tw * 0.08, legY, tw * 0.22, H * 0.3);
      b.fill(coat, body);
      if (head !== 'none') b.fill(head, ovalPath(x, legY - torsoH - headH * 0.35, headH * 0.42, headH * 0.5));
      b.fill(head !== 'none' ? head : CM.ghostPaper, ovalPath(x + 2, legY - torsoH - headH * 0.85, headH * 0.2, headH * 0.17));
      if (m.kind === 'her') b.rect(CM.coatOat, x + tw * 0.4, legY - torsoH * 0.5, tw * 0.3, torsoH * 0.35);
    }
    const ink = m.kind === 'her' ? 0 : INK_PX.far;
    if (ink > 0) {
      b.ink(body + `M${P(x - tw * 0.3, legY)}L${P(x - tw * 0.3, y)}L${P(x - tw * 0.08, y)}L${P(x - tw * 0.08, legY)}M${P(x + tw * 0.08, legY)}L${P(x + tw * 0.08, y)}L${P(x + tw * 0.3, y)}L${P(x + tw * 0.3, legY)}`, ink);
      b.ink(`M${P(x - headH * 0.42, legY - torsoH - headH * 0.35)}A${(headH * 0.42).toFixed(1)} ${(headH * 0.5).toFixed(1)} 0 1 1 ${P(x + headH * 0.42, legY - torsoH - headH * 0.35)}A${(headH * 0.42).toFixed(1)} ${(headH * 0.5).toFixed(1)} 0 1 1 ${P(x - headH * 0.42, legY - torsoH - headH * 0.35)}`, ink);
    }
  }
  return <Paint b={b} seed="rowph" misreg={false} />;
};

// ---------------------------------------------------------------- the samples

export const CanalSampleS1: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <S1Set towpath={<RowPlaceholders />} />
  </World>
);

export const CanalSampleS2: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <></>
  </World>
);
export const CanalSampleS4: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <></>
  </World>
);
export const CanalSampleS8: React.FC = () => (
  <World sky={[CM.sky, CM.bandSunset]} horizon={1000}>
    <></>
  </World>
);
export const KitCanal: React.FC = () => (
  <World sky={GOLDEN} horizon={1000}>
    <></>
  </World>
);

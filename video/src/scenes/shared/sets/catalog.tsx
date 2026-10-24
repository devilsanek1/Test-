// sets/catalog.tsx — every set with a label, its sky colour and two renderers:
//   thumb()   = the set at camera rest in a representative state (no World: draw your own sky rect, then this;
//               the props lane's SharedKitSheet uses it for the set thumbnails, scaled into a cell)
//   preview() = a full <World> demo with storyboard-v1 demo times (the SetsPreview harness)
// The demo times live here (and only here): sets never hard-code a beat time.

import React from 'react';
import {palette, skies} from '../../../lib/theme';
import {GovernmentPlaza, PLAZA} from './GovernmentPlaza';
import {DemoSun, DemoWorld} from './preview/demo';
import {mat, XG} from '../../../lib/xf';

/** Camera matrix: world point (x, y) at screen centre, zoom z. */
export const camMat = (x: number, y: number, z: number) => mat.compose(mat.translate(540, 960), mat.scale(z), mat.translate(-x, -y));

export type SetEntry = {id: string; label: string; sky: string; thumb: () => React.ReactNode; preview: (variant?: string) => React.ReactNode};

const S01_GOV = {
  govA: {chromeAt: 0.54, screenOnAt: 0.9, shutterAt: 2.4, offAt: 2.45, tagAt: 3.4, padlockAt: 3.64, glintAt: 4.28},
  govB: {chromeAt: 0.46, screenOnAt: 0.94, shutterAt: 2.82, offAt: 2.87, tagAt: 3.45, padlockAt: 3.72, glintAt: 4.28},
  govC: {chromeAt: 0.62, screenOnAt: 0.98, shutterAt: 3.04, offAt: 3.09, tagAt: 3.5, padlockAt: 3.8, glintAt: 4.28},
  govD: {chromeAt: 0.7, screenOnAt: 1.02, shutterAt: 3.25, offAt: 3.3, tagAt: 3.55, padlockAt: 3.88, glintAt: 4.28},
};

export const SET_CATALOG: SetEntry[] = [
  {
    id: 'plaza',
    label: 'GovernmentPlaza',
    sky: skies.day,
    thumb: () => <GovernmentPlaza state="built" sun={<DemoSun cx={PLAZA.sun.x} cy={PLAZA.sun.y} r={PLAZA.sun.r} glyph />} pennantsAt />,
    preview: (v) => (
      <DemoWorld push={v === undefined || v === 'built'}>
        {v === 'closeup' || v === 'dive' ? (
          <XG m={v === 'closeup' ? camMat(375, 793, 1.85) : camMat(394, 1095, 3.25)}>
            <GovernmentPlaza state="built" detail="close" gov={{govB: {shutterAt: 2.0, padlockAt: 2.5, tagAt: 2.3}}} sun={<DemoSun cx={720} cy={760} r={110 / 1.85} glyph />} />
          </XG>
        ) : v === 'lineArt' ? (
          <GovernmentPlaza state="lineArt" sun={<DemoSun cx={630} cy={850} r={150} glyph />} />
        ) : v === 'off' ? (
          <GovernmentPlaza state="off" sun={<DemoSun cx={630} cy={800} r={150} glyph />} />
        ) : (
          <GovernmentPlaza
            state="built"
            cascadeAt={0.03}
            gov={S01_GOV}
            pennantsAt={[1.23, 1.38, 1.53, 1.68]}
            citizensAt={1.06}
            phonesAt={2.05}
            lanternOffAt={3.25}
            pigeonsAt={1.7}
            pigeonsFlyAt={3.3}
            sun={<DemoSun cx={630} cy={800} r={150} glyph />}
          />
        )}
      </DemoWorld>
    ),
  },
];

void palette;

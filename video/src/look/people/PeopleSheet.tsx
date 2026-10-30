// The people recipe's proof sheet (docs/look/paint_recipes/people.md; written to people_sheet.png). Stills only.
//   Row A  our current her (src/look/scene1_v3 V3Her) vs the refined her (src/lib/figure): in the film's frame at 1:1
//          (both 210 px on the still v3 landing), then both at 640 px (+ the soft body gradient, a proposal), then the
//          owner's references at the same height.
//   Row B  the refined her in four poses (rear 3/4 standing, walking in profile on the beach couple's gait, walking
//          away, stepping out of a lit door with a box) + one variant lit by a local light (a phone).
//   Row C  the motion spec as stills: her scarf end at 4 phases of the 1.0 s wind cycle, beside the reference's
//          ribbons at the same 4 phases.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Figure, type FigurePose, type FigureLight} from '../../lib/figure';
import {CurrentHer} from './CurrentHer';

export const SHEET_W = 2400;
export const SHEET_H = 2760;

const PAGE = '#EFE7DF';
const FIELD = '#E3D8CF';
const INK = '#3A2A2E';
const SUB = '#7A6A6A';
/** The still v3 crop's origin in the still (public/figure/still_v3_crop.png = still_v3.png x 120-720, y 1150-1490). */
const CROP = {x: 120, y: 1150, w: 600, h: 340};
/** Her feet in still v3 (screen px): the current her stands at x ~300, y ~1458. */
const FEET_Y = 1457;

const T: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; children: React.ReactNode}> = ({x, y, s = 30, c = INK, w = 600, children}) => (
  <text x={x} y={y} fontFamily="Helvetica, Arial, sans-serif" fontSize={s} fill={c} fontWeight={w}>
    {children}
  </text>
);

const Field: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = FIELD}) => <rect x={x} y={y} width={w} height={h} rx={18} fill={c} />;

/** A lit doorway behind her (the box pose): the warm interior, a deep frame, the step. */
const Door: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g>
    <rect x={x - 26} y={y - h - 26} width={w + 52} height={h + 26} fill="#B48A78" />
    <rect x={x - 26} y={y - h - 26} width={w + 52} height={h + 26} fill="#8E6A5E" opacity={0.0} />
    <rect x={x} y={y - h} width={w} height={h} fill="#F4C987" />
    <rect x={x} y={y - h} width={w} height={h * 0.16} fill="#E9B36F" />
    <rect x={x + w * 0.62} y={y - h} width={w * 0.38} height={h} fill="#E7AE6A" />
    <rect x={x - 40} y={y} width={w + 80} height={16} fill="#9C786A" />
  </g>
);

export const PeopleSheet: React.FC = () => {
  const wind = (t: number) => ({t, strength: 1});
  const W0 = wind(0.2);
  const pose = (p: FigurePose) => p;
  const doorLight: FigureLight = {local: {color: '#FFC27A', dL: 11, dir: [1, -0.12], width: 18}};
  const phoneLight: FigureLight = {local: {color: '#CFE2FF', dL: 14, dir: [-0.55, 0.83], width: 30, radius: 250}};
  // row A: the in-frame test (1:1), the refined her on the same landing to the right of the current one
  const ax = 40;
  const ay = 140;
  const herX = 470; // still v3 x
  // row C: the wind strip windows
  const cy = 2010;
  const win = {w: 410, h: 560};
  const phases = [0, 0.25, 0.5, 0.75];
  return (
    <AbsoluteFill style={{background: PAGE}}>
      <svg width={SHEET_W} height={SHEET_H} viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}>
        <T x={40} y={70} s={44} w={700}>
          People recipe: the refined her (src/lib/figure) vs our current her. Stills.
        </T>

        {/* ---------------- row A */}
        <T x={ax} y={ay - 18} s={26}>
          A. In the film's frame, 1:1: current (left) vs refined (right), both 210 px
        </T>
        <rect x={ax - 4} y={ay - 4} width={CROP.w * 1.5 + 8} height={CROP.h * 1.5 + 8} fill="#FFFFFF" />
        <g transform={`translate(${ax} ${ay}) scale(1.5)`}>
          <image href={staticFile('figure/still_v3_crop.png')} x={0} y={0} width={CROP.w} height={CROP.h} />
          <Figure x={herX - CROP.x} y={FEET_Y - CROP.y} h={210} pose={pose({view: 'rear34', wind: W0})} shadow="#CDB3A6" />
        </g>
        <T x={ax} y={ay + CROP.h * 1.5 + 36} s={22} c={SUB} w={400}>
          (shown at 1.5x; the sheet's other figures are 640 px)
        </T>

        <Field x={980} y={ay - 4} w={1400} h={760} />
        <CurrentHer x={1110} y={ay + 712} h={640} />
        <Figure x={1390} y={ay + 712} h={640} pose={pose({view: 'rear34', wind: W0})} />
        <Figure x={1690} y={ay + 712} h={640} pose={pose({view: 'rear34', wind: W0})} light={{grad: 1}} />
        <T x={1020} y={ay + 748} s={22} w={500}>
          current her, 640
        </T>
        <T x={1300} y={ay + 748} s={22} w={500}>
          refined, 3 flat planes
        </T>
        <T x={1590} y={ay + 748} s={22} w={500}>
          + soft body gradient (proposal)
        </T>
        <image href={staticFile('figure/ref_girl.jpg')} x={1920} y={ay + 46} width={268 * 1.32} height={498 * 1.32} preserveAspectRatio="xMidYMid slice" />
        <T x={1930} y={ay + 748} s={22} w={500}>
          ref 04 (the girl)
        </T>

        <image href={staticFile('figure/ref_couple.jpg')} x={40} y={ay + 600} width={290 * 1.1} height={496 * 1.1} />
        <T x={44} y={ay + 600 + 496 * 1.1 + 30} s={22} w={500}>
          ref 03 (the couple's gait)
        </T>

        {/* ---------------- row B: the poses */}
        <T x={420} y={980} s={26}>
          B. The refined her, 640 px: rear 3/4 standing / walking in profile (ref 03's gait) / walking away / out of a lit door with a box / a local light (phone)
        </T>
        <Field x={400} y={1000} w={1980} h={900} />
        <Door x={1640} y={1860} w={250} h={700} />
        <Figure x={560} y={1860} h={640} pose={pose({view: 'rear34', wind: W0})} />
        <Figure x={960} y={1860} h={640} pose={pose({view: 'profile', step: 0, wind: W0})} />
        <Figure x={1320} y={1860} h={640} pose={pose({view: 'back', step: 0.5, wind: W0})} />
        <Figure x={1660} y={1860} h={640} pose={pose({view: 'profile', step: 0.15, carry: 'box', wind: W0})} light={doorLight} />
        <Figure x={2120} y={1860} h={640} pose={pose({view: 'profile', step: 0.6, carry: 'phone', wind: W0})} light={phoneLight} />

        {/* ---------------- row C: the wind cycle as stills */}
        <T x={40} y={cy - 30} s={26}>
          C. The scarf end at 4 phases of the 1.0 s flutter (lag 0.8 cycle root to tip, tip +-36 deg, the body still)
        </T>
        {phases.map((ph, i) => {
          const x0 = 40 + i * (win.w + 24);
          const id = `win${i}`;
          return (
            <g key={ph}>
              <defs>
                <clipPath id={id}>
                  <rect x={x0} y={cy} width={win.w} height={win.h} rx={18} />
                </clipPath>
              </defs>
              <rect x={x0} y={cy} width={win.w} height={win.h} rx={18} fill={FIELD} />
              <g clipPath={`url(#${id})`}>
                <Figure x={x0 + 120} y={cy + 1300} h={1200} pose={pose({view: 'profile', wind: wind(ph)})} shadow={null} />
              </g>
              <T x={x0 + 16} y={cy + win.h + 34} s={24} w={600}>
                t = {ph.toFixed(2)} s
              </T>
            </g>
          );
        })}
        <image href={staticFile('figure/ref_ribbons_4.jpg')} x={1760} y={cy} width={600} height={111} />
        <T x={1760} y={cy + 150} s={22} w={500}>
          ref 04's ribbons at t = 2.40 / 2.65 / 2.90 / 3.15 s
        </T>
        <T x={1760} y={cy + 186} s={22} c={SUB} w={400}>
          (the video's frames, head-aligned, 5x)
        </T>
        <T x={1760} y={cy + 260} s={22} w={500}>
          the spec (wind.ts): T1 1.0 s flutter, T2 2.3 s gust,
        </T>
        <T x={1760} y={cy + 292} s={22} w={500}>
          amplitude 8 deg at the root to 36 at the tip,
        </T>
        <T x={1760} y={cy + 324} s={22} w={500}>
          the bend travels root to tip (lag 0.8 cycle),
        </T>
        <T x={1760} y={cy + 356} s={22} w={500}>
          an inextensible chain: it never stretches
        </T>
      </svg>
    </AbsoluteFill>
  );
};

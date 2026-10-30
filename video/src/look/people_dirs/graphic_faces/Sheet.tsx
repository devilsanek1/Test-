// MODERN GRAPHIC people, FACE OPTIONS: the sheet (docs/look/people_design/faces_graphic.png), one frame, 2400 px wide.
// One row per face option (head.ts FaceOpt), the current mark first as the reference:
//   her head as drawn on a 640 px figure, shown 2x: 3/4, profile and a slight turn (yaw -16)
//   the whole cast (her, the man, the woman) at film size, 1:1: 200 px and 140 px tall, on the mid tone
//   her walking in profile in the painted still v6's doorway (~156 px), shown 2x, the compare sheet's crop
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Figure} from '../graphic/Figure';
import {BG} from '../graphic/palette';
import {DOOR_AFTER, DOOR_CROP} from '../graphic/doorway';
import {build, type Who, type View} from './cast';
import type {FaceOpt} from './head';

export const FACES_W = 2400;

const INK = '#3B2C2E';
const SUB = '#7A6668';
const TEAL = '#0B8577';
const FONT = 'Inter, DejaVu Sans, sans-serif';

type Row = {face: FaceOpt; name: string; lines: string[]; views?: {view: View; label: string}[]; castView?: View; rec?: boolean};
export const ROWS: Row[] = [
  {face: 'now', name: 'now', lines: ['the current mark: the brow', "ridge's shade running into", 'the nose (a "7")']},
  {face: 'edge', name: '1  EDGE', lines: ['the far contour is the face:', 'brow, nose, lips, chin;', 'nothing inside, light only']},
  {face: 'lash', name: '2  LASH', lines: ['closed-eye lash lines (one', 'flick each) and a short,', 'soft nose plane']},
  {face: 'glow', name: '3  GLOW', lines: ['ONE warm tone on the', "cheek's apple and the lips;", 'no lines']},
  {face: 'shades', name: '4  SHADES', lines: ['oversized sunglasses as the', 'default face, one streak;', 'the nose plane below']},
  {face: 'brim', name: '5  BRIM', lines: ["a cap: its brim's crisp", 'shadow over the eyes,', 'the nose plane below']},
  {
    face: 'turn',
    name: '6  TURN',
    lines: ['the face turned away: the', 'lost profile; the nose tip', 'and one lash flick peek;', 'in profile hair over the eye'],
    views: [
      {view: 'b', label: 'rear 3/4 (yaw -138)'},
      {view: 'p', label: 'profile, hair forward'},
      {view: 't', label: 'lost profile (yaw -118)'},
    ],
    castView: 'b',
  },
];
const VIEWS: {view: View; label: string}[] = [
  {view: 'q', label: '3/4'},
  {view: 'p', label: 'profile'},
  {view: 's', label: 'slight turn'},
];

// ---------------------------------------------------------------- layout
const X_LABEL = 40;
const X_HEADS = 300;
const HEAD_W = 330;
const HEAD_GAP = 10;
const X_CAST = X_HEADS + 3 * HEAD_W + 2 * HEAD_GAP + 24; // 1334
const CAST_W = 446;
const X_DOOR = X_CAST + CAST_W + 24; // 1804
const ROW_H = 460;
const ROW_GAP = 46;
const Y0 = 300;
export const FACES_H = Y0 + ROWS.length * (ROW_H + ROW_GAP) + 30;
/** the compare sheet's doorway crop (frame px of the 1080 x 1920 still), 50 px off its top, shown 2x */
const DOOR_VIEW = {x: 545, y: 880, w: 280, h: 230};
const DOOR_Z = 2;

const T: React.FC<{x: number; y: number; s?: number; w?: number; c?: string; a?: 'start' | 'middle' | 'end'; children: React.ReactNode}> = ({
  x,
  y,
  s = 21,
  w = 400,
  c = SUB,
  a = 'start',
  children,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a}>
    {children}
  </text>
);

/** Her head as drawn on a 640 px figure, magnified `mag`, framed on the head. */
const HeadCrop: React.FC<{face: FaceOpt; view: View; x: number; y: number; w: number; h: number; mag: number; id: string}> = ({face, view, x, y, w, h, mag, id}) => {
  const fig = build('herEvening', view, face);
  const H = 640 * mag;
  const s = H / 1000;
  const cx = x + w / 2 - fig.head[0] * s;
  const cy = y + h * 0.36 - fig.head[1] * s;
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx={10} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={BG.panel} />
      <g clipPath={`url(#${id})`}>
        <Figure fig={fig} x={cx} y={cy + H} h={H} uid={`${id}f`} />
      </g>
    </g>
  );
};

const RowView: React.FC<{r: Row; i: number}> = ({r, i}) => {
  const y = Y0 + i * (ROW_H + ROW_GAP);
  const views = r.views ?? VIEWS;
  const castView = r.castView ?? 'q';
  const cast: {who: Who; view: View}[] = [
    {who: 'herEvening', view: castView},
    {who: 'man', view: 'q'},
    {who: 'woman', view: 'q'},
  ];
  const doorFig = build('herEvening', 'p', r.face);
  return (
    <g>
      {r.rec ? <rect x={X_LABEL - 20} y={y - 18} width={FACES_W - 2 * (X_LABEL - 20)} height={ROW_H + 36} rx={16} fill="none" stroke={TEAL} strokeWidth={5} /> : null}
      {/* the label */}
      <T x={X_LABEL} y={y + 46} s={38} w={800} c={r.face === 'now' ? SUB : INK}>
        {r.name}
      </T>
      {r.rec ? (
        <g>
          <rect x={X_LABEL} y={y + 66} width={196} height={34} rx={17} fill={TEAL} />
          <T x={X_LABEL + 98} y={y + 90} s={18} w={700} c="#FFFFFF" a="middle">
            RECOMMENDED
          </T>
        </g>
      ) : null}
      {r.lines.map((l, k) => (
        <T key={k} x={X_LABEL} y={y + (r.rec ? 140 : 96) + k * 28} s={21}>
          {l}
        </T>
      ))}
      {/* her head, 640 px figure, 2x */}
      {views.map((v, k) => {
        const x = X_HEADS + k * (HEAD_W + HEAD_GAP);
        return (
          <g key={k}>
            <HeadCrop face={r.face} view={v.view} x={x} y={y} w={HEAD_W} h={ROW_H - 34} mag={2} id={`h${i}${k}`} />
            <T x={x + HEAD_W / 2} y={y + ROW_H - 6} s={19} a="middle">
              {v.label}
            </T>
          </g>
        );
      })}
      {/* the cast at film size, 1:1, on the mid tone */}
      <rect x={X_CAST} y={y} width={CAST_W} height={ROW_H - 34} rx={10} fill={BG.mid} />
      {cast.map((c, k) => (
        <Figure key={`a${k}`} fig={build(c.who, c.view, r.face)} x={X_CAST + 80 + k * 140} y={y + 224} h={200} uid={`c2${i}${k}`} />
      ))}
      {cast.map((c, k) => (
        <Figure key={`b${k}`} fig={build(c.who, c.view, r.face)} x={X_CAST + 80 + k * 140} y={y + 396} h={140} uid={`c1${i}${k}`} />
      ))}
      <T x={X_CAST + CAST_W / 2} y={y + ROW_H - 6} s={19} a="middle">
        her, the man, the woman: 200 px and 140 px, 1:1
      </T>
      {/* her in the v6 doorway, 2x */}
      <svg x={X_DOOR} y={y} width={DOOR_VIEW.w * DOOR_Z} height={DOOR_VIEW.h * DOOR_Z} viewBox={`${DOOR_VIEW.x} ${DOOR_VIEW.y} ${DOOR_VIEW.w} ${DOOR_VIEW.h}`}>
        <image href={DOOR_AFTER} x={DOOR_CROP.x} y={DOOR_CROP.y} width={DOOR_CROP.w} height={DOOR_CROP.h} />
        <Figure fig={doorFig} x={684} y={1083} h={156} uid={`d${i}`} shadowColor="#6A4A44" />
      </svg>
      <rect x={X_DOOR} y={y} width={DOOR_VIEW.w * DOOR_Z} height={DOOR_VIEW.h * DOOR_Z} fill="none" stroke="#D6C9C0" strokeWidth={2} rx={4} />
      <T x={X_DOOR + DOOR_VIEW.w} y={y + ROW_H - 6} s={19} a="middle">
        in the v6 doorway, walking, ~156 px, shown 2x
      </T>
    </g>
  );
};

export const FacesSheet: React.FC<{rec?: FaceOpt}> = ({rec}) => (
  <AbsoluteFill style={{background: BG.sheet}}>
    <Img src={DOOR_AFTER} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
    <svg width={FACES_W} height={FACES_H} viewBox={`0 0 ${FACES_W} ${FACES_H}`}>
      <T x={40} y={86} s={54} w={800} c={INK}>
        People C, MODERN GRAPHIC: six new faces
      </T>
      <T x={42} y={136} s={24}>
        The owner: "I actually kind of like the last one modern graphic except the face that looks messed up". Same figures, light and code as direction C; only the face
      </T>
      <T x={42} y={168} s={24}>
        changes (src/look/people_dirs/graphic_faces/, the option FaceOpt). Two flat tones, crisp rounded polygons, no outlines; no open eyes, pupils, brows or mouth lines.
      </T>
      <T x={42} y={200} s={24}>
        Each row: her head as drawn on a 640 px figure, shown 2x; the cast at film size; her in the v6 doorway. Look at it on a phone. 2026-10-30.
      </T>
      {/* column heads */}
      <T x={X_HEADS} y={Y0 - 30} s={22} w={700} c={INK}>
        Her head on a 640 px figure, shown 2x
      </T>
      <T x={X_CAST} y={Y0 - 30} s={22} w={700} c={INK}>
        The cast at film size, 1:1
      </T>
      <T x={X_DOOR} y={Y0 - 30} s={22} w={700} c={INK}>
        In the scene: v6's doorway, 2x
      </T>
      {ROWS.map((r, i) => (
        <RowView key={r.face} r={{...r, rec: r.face === rec}} i={i} />
      ))}
    </svg>
  </AbsoluteFill>
);

// PEOPLE v4: the stills (docs/look/people_design/faces_v2/V4.md). 01 her face and 02 his face (now vs v4: profile,
// 3/4, the lost profile, close and at film size, beside the references), 03 the bodies (now vs v4, front and side, at
// film size too). One composition per still:
//   node scripts/render-frames.mjs PvHer stills_v4 0 --entry=src/entry-look-people-v4.tsx --concurrency=1
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BG} from '../graphic/palette';
import {Figure} from '../graphic/Figure';
import type {Built} from '../graphic/part';
import {herV2, personV2, lookOf} from '../hair_v2/people';
import {CUTS} from '../hair_v2/cuts';
import {Tx, INK, SUB} from '../hair_v2/Sheets';
import {WOMAN_V2, MAN_V2} from '../hair_v2/stance';
import {partsSvg, mapPart, type PartV4} from './paint';
import {figureV4, headAloneV4, TONES} from './assemble';
import {compOf} from './body';
import {REFS4} from './refs';
import type {FaceView, Sex} from './faces';

const PANEL = '#EAE0D6';
const PANEL_V4 = '#E6DCD2';
const BAND = '#A99391';

// ---------------------------------------------------------------- pieces
/** v4 parts (any units) drawn through a similarity: centre (x, y), scale s. */
const V4: React.FC<{parts: PartV4[]; x: number; y: number; s: number; uid: string}> = ({parts, x, y, s, uid}) => (
  <g dangerouslySetInnerHTML={{__html: partsSvg(parts.map((p) => mapPart(p, {c: [x, y], s, rot: 0})), uid)}} />
);
const Box: React.FC<{x: number; y: number; w: number; h: number; id: string; fill?: string; ring?: boolean; children: React.ReactNode}> = ({x, y, w, h, id, fill, ring, children}) => (
  <g>
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} rx={10} />
    </clipPath>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={fill ?? PANEL} />
    <g clipPath={`url(#${id})`}>{children}</g>
    {ring ? <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx={9} fill="none" stroke="#2F7A6B" strokeWidth={3} /> : null}
  </g>
);
const RefBox: React.FC<{k: string; x: number; y: number; w: number; h: number; id: string}> = ({k, x, y, w, h, id}) => {
  const r = REFS4[k];
  const s = Math.max(w / r.w, h / r.h);
  return (
    <Box x={x} y={y} w={w} h={h} id={id} fill="#DCD2C8">
      <image href={r.src} x={x + (w - r.w * s) / 2} y={y + (h - r.h * s) / 2} width={r.w * s} height={r.h * s} />
    </Box>
  );
};
/** The current figure's head, magnified so its skull is `skull` px, its head at (cx, cy). */
const NowHead: React.FC<{fig: Built; cx: number; cy: number; skull: number; uid: string}> = ({fig, cx, cy, skull, uid}) => {
  const H = (skull * 1000) / 128;
  const s = H / 1000;
  return <Figure fig={fig} x={cx - fig.head[0] * s} y={cy - fig.head[1] * s + H} h={H} uid={uid} shadow={false} />;
};
const Label: React.FC<{x: number; y: number; t: string; sub?: string; green?: boolean}> = ({x, y, t, sub, green}) => (
  <g>
    <Tx x={x} y={y} s={21} w={700} c={green ? '#2F7A6B' : INK}>
      {t}
    </Tx>
    {sub ? (
      <Tx x={x} y={y + 25} s={17} c={SUB}>
        {sub}
      </Tx>
    ) : null}
  </g>
);

// ---------------------------------------------------------------- the current figures
const herLookNow = {...lookOf('W2'), skin: TONES.f.skin, hair: TONES.f.hair, cut: CUTS.W3, build: undefined, c: {top: TONES.f.body.top, bottom: TONES.f.body.bottom, shoe: TONES.f.body.shoe}};
const himLookNow = {...lookOf('M3'), cut: CUTS.M1, build: undefined, skin: TONES.m.skin, hair: TONES.m.hair, c: {top: TONES.m.body.top, bottom: TONES.m.body.bottom}};
const nowFig = (sex: Sex, yaw: number, headYaw: number, px: number): Built => personV2((sex === 'f' ? herLookNow : himLookNow) as never, {view: 'q', bodyYaw: yaw, headYaw, ver: 3, px});
const nowHer = (v: 'q' | 'p' | 'b', px: number) => herV2({view: v, ver: 3, px});

// ---------------------------------------------------------------- 01 / 02: the faces
export const FACE_W = 2400;
export const FACE_H = 1880;
type Cell = {kind: 'ref'; k: string; label: string; sub: string} | {kind: 'now'; view: 'q' | 'p' | 'b'; label: string; sub: string} | {kind: 'v4'; view: FaceView; eyes?: 'lash' | 'open'; label: string; sub: string; ring?: boolean};

const FaceSheet: React.FC<{sex: Sex}> = ({sex}) => {
  const her = sex === 'f';
  const W = 448;
  const Hc = 560;
  const x0 = 40;
  const gap = 16;
  const rows: Cell[][] = her
    ? [
        [
          {kind: 'ref', k: 'her05', label: 'REF 05: the blue-cliff woman', sub: 'the bar: delicate, soft, cute, appealing'},
          {kind: 'ref', k: 'girl03', label: 'REF 03: the students\' girl', sub: 'a small nose, a soft chin, alive'},
          {kind: 'now', view: 'p', label: 'NOW: LASH as built (profile)', sub: 'a long nose, sunken lips, a long jaw'},
          {kind: 'v4', view: 'p', label: 'V4 PROFILE (LASH)', sub: 'authored curves; a button nose, soft chin', ring: true},
          {kind: 'v4', view: 'p', eyes: 'open', label: 'V4 PROFILE, OPEN EYES (variant)', sub: 'looking away, never at us: the owner\'s pick'},
        ],
        [
          {kind: 'now', view: 'q', label: 'NOW: 3/4 as built', sub: 'the nose breaks the far cheek; a long jaw'},
          {kind: 'v4', view: 'q', label: 'V4 3/4 (LASH)', sub: 'a soft V jaw, the nose inside the face', ring: true},
          {kind: 'v4', view: 'q', eyes: 'open', label: 'V4 3/4, OPEN EYES (variant)', sub: 'both eyes looking down-left, away'},
          {kind: 'now', view: 'b', label: 'NOW: from behind, turned', sub: 'the lost profile as built'},
          {kind: 'v4', view: 'l', label: 'V4 LOST PROFILE', sub: 'the cheek\'s one line, a lash peeking, the ear', ring: true},
        ],
      ]
    : [
        [
          {kind: 'ref', k: 'boy03', label: 'REF 03: the student (principle only)', sub: 'a clear brow, a straight nose, a long jaw'},
          {kind: 'ref', k: 'bass04', label: 'REF 04: the bassist', sub: 'closed eyes, calm, manly'},
          {kind: 'now', view: 'p', label: 'NOW: LASH as built (profile)', sub: 'no brow ridge, a weak chin, no jaw corner'},
          {kind: 'v4', view: 'p', label: 'V4 PROFILE (LASH + brow)', sub: 'a brow shelf, a straight nose, a square chin', ring: true},
          {kind: 'v4', view: 'p', eyes: 'open', label: 'V4 PROFILE, OPEN EYES (variant)', sub: 'looking ahead, never at us'},
        ],
        [
          {kind: 'now', view: 'q', label: 'NOW: 3/4 as built', sub: 'a soft jaw, the nose breaking the cheek'},
          {kind: 'v4', view: 'q', label: 'V4 3/4 (LASH + brow)', sub: 'the jaw\'s corner low and wide, a blunt chin', ring: true},
          {kind: 'v4', view: 'q', eyes: 'open', label: 'V4 3/4, OPEN EYES (variant)', sub: 'looking away'},
          {kind: 'now', view: 'b', label: 'NOW: from behind, turned', sub: 'the lost profile as built'},
          {kind: 'v4', view: 'l', label: 'V4 LOST PROFILE', sub: 'the cheekbone, the square jaw from behind', ring: true},
        ],
      ];
  const skull = 300;
  const rowY = [196, 196 + Hc + 80];
  const bandY = rowY[1] + Hc + 86;
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={FACE_W} height={FACE_H} viewBox={`0 0 ${FACE_W} ${FACE_H}`}>
        <Tx x={40} y={66} s={42} w={800} c={INK}>
          {her ? 'People v4: her face redrawn at illustration quality (the recipe\'s B "cute")' : 'People v4: his face redrawn at illustration quality (the recipe\'s A "clean")'}
        </Tx>
        <Tx x={42} y={106} s={21}>
          {her
            ? 'Every contour an authored pen curve (cubic Beziers, the curvature varying, tangent-continuous joins): the features a little lower, a short button nose with the tip turned up, fuller lips as a tone, the chin'
            : 'Every contour an authored pen curve (cubic Beziers, tangent-continuous joins): a brow shelf over a deep bridge, a straight strong nose, a square chin on the face line, a jaw with a clear corner, a thick'}
        </Tx>
        <Tx x={42} y={134} s={21}>
          {her
            ? 'a touch forward, a short soft V jaw, the ear showing; soft modelling (a gentle gradient across the face, a warm cheek, the lit plane against ONE crisp shade plane). The cranium is kept, so the hair round\'s shapes fit.'
            : 'neck with a soft Adam\'s apple; a calm brow (friendly), the lash short and flat; soft modelling, ONE crisp shade plane. The cranium is kept, so the hair round\'s shapes fit. The hair here is a stand-in (hair_v4 owns the cuts).'}
        </Tx>
        <Tx x={42} y={162} s={19} c="#2F7A6B" w={600}>
          {her ? 'The hair here is a stand-in cut (the hair round, hair_v4, owns the cuts). Green rings: v4.' : 'Green rings: v4.'}
        </Tx>
        {rows.map((row, r) =>
          row.map((cell, i) => {
            const x = x0 + i * (W + gap);
            const y = rowY[r];
            const id = `f${sex}${r}${i}`;
            const cx = x + W / 2;
            const cy = y + Hc * 0.4;
            let body: React.ReactNode = null;
            if (cell.kind === 'ref') body = <RefBox k={cell.k} x={x} y={y} w={W} h={Hc} id={id} />;
            else if (cell.kind === 'now') {
              const fig = her ? nowHer(cell.view, 640) : personV2(himLookNow as never, {view: cell.view, ver: 3, px: 640, face: 'lash'});
              body = (
                <Box x={x} y={y} w={W} h={Hc} id={id}>
                  <NowHead fig={fig} cx={cx + (cell.view === 'p' ? 10 : 0)} cy={cy} skull={skull} uid={`${id}n`} />
                </Box>
              );
            } else {
              const parts = headAloneV4(sex, cell.view, {px: skull, eyes: cell.eyes});
              body = (
                <Box x={x} y={y} w={W} h={Hc} id={id} fill={PANEL_V4} ring={cell.ring}>
                  <V4 parts={parts} x={cx + (cell.view === 'p' ? 10 : cell.view === 'l' ? -6 : 0)} y={cy} s={skull} uid={id} />
                </Box>
              );
            }
            return (
              <g key={id}>
                {body}
                <Label x={x + 4} y={y + Hc + 30} t={cell.label} sub={cell.sub} green={cell.kind === 'v4'} />
              </g>
            );
          }),
        )}
        {/* the film-size band: 200 px figures, 1:1 */}
        <rect x={40} y={bandY} width={FACE_W - 80} height={300} rx={12} fill={BAND} />
        <Tx x={60} y={bandY + 34} s={20} w={700} c="#FFF8F0">
          film size 1:1 (a 200 px figure, the skull ~26 px): NOW (profile, 3/4, the lost profile) | V4 (the same three; at this size the face is the contour, the lash a pixel)
        </Tx>
        {([
          ['now', -90, 0],
          ['now', -58, 22],
          ['now', 200, 22],
          ['v4', -90, 0],
          ['v4', -58, 22],
          ['v4', 200, 22],
        ] as [string, number, number][]).map(([w, yaw, hy], i) => {
          const x = 300 + i * 300 + (i >= 3 ? 160 : 0);
          const base = bandY + 270;
          if (w === 'now') return <Figure key={i} fig={nowFig(sex, yaw, hy, 200)} x={x} y={base} h={200} uid={`b${sex}${i}`} />;
          const f = figureV4(sex, {yaw, headYaw: hy, px: 200});
          return <g key={i} dangerouslySetInnerHTML={{__html: partsSvg(f.parts.map((p) => mapPart(p, {c: [x, base - 200], s: 0.2, rot: 0})), `bv${sex}${i}`)}} />;
        })}
        <Tx x={40} y={FACE_H - 22} s={21} c={INK}>
          {her
            ? 'Look at: would a regular viewer call her face cute and appealing? Delicate like ref 05, alive like ref 03\'s girl, never a doll, never sexualised? And at film size: nothing odd?'
            : 'Look at: would a regular viewer call him manly and friendly? Clear brow, strong nose, square chin, a jaw with a corner, never a brute? And at film size: the jaw against the neck reads?'}
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};
export const PvHer: React.FC = () => <FaceSheet sex="f" />;
export const PvHim: React.FC = () => <FaceSheet sex="m" />;

// ---------------------------------------------------------------- 03: the bodies
export const BODY_W = 2400;
export const BODY_H = 2070;
export const PvBodies: React.FC = () => {
  const W = 448;
  const Hc = 680;
  const x0 = 40;
  const gap = 16;
  const FH = 610;
  const rowY = [176, 176 + Hc + 84];
  const bandY = rowY[1] + Hc + 84;
  const ratios = (sex: Sex, now: boolean) => {
    if (now) {
      const b = sex === 'f' ? WOMAN_V2 : MAN_V2;
      return sex === 'f'
        ? `shoulders ${b.shoulderW} / waist ${b.waistW} / hips ${b.hipW}; w:h ${(b.waistW / b.hipW).toFixed(2)}`
        : `shoulders ${b.shoulderW} / waist ${b.waistW}; s:w ${(b.shoulderW / b.waistW).toFixed(2)}; neck ${b.neckW}`;
    }
    const c = compOf(sex, 'average');
    return sex === 'f'
      ? `shoulders ${c.shoulderW} / waist ${c.waistW} / hips ${c.hipW}; w:h ${(c.waistW / c.hipW).toFixed(2)}`
      : `shoulders ${c.shoulderW} / waist ${c.waistW}; s:w ${(c.shoulderW / c.waistW).toFixed(2)}; neck ${c.neckW}`;
  };
  const rows: {sex: Sex; ref: string; refLabel: string; refSub: string}[] = [
    {sex: 'f', ref: 'body05', refLabel: 'REF 05: her body', refSub: 'slim, long-legged, sloping shoulders'},
    {sex: 'm', ref: 'pair03', refLabel: 'REF 03: the students (principle)', refSub: 'slim, tall, real stature'},
  ];
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={BODY_W} height={BODY_H} viewBox={`0 0 ${BODY_W} ${BODY_H}`}>
        <Tx x={40} y={66} s={42} w={800} c={INK}>
          People v4: the bodies (the recipe&apos;s composition, smooth contours, the upright relaxed stance)
        </Tx>
        <Tx x={42} y={106} s={21}>
          Built on the current skeleton (hair_v2 stance, the UPRIGHT neck, the weight on one leg, an arm off the body). Every outline one smooth curve: the limbs tubes with authored profiles (the thigh&apos;s taper,
        </Tx>
        <Tx x={42} y={134} s={21}>
          the knee, the calf, a slim ankle; the deltoid, the forearm&apos;s swell, a slim wrist), the torso rings at the recipe&apos;s widths. Her: a waist, sloping shoulders, slim wrists and ankles. Him: the V, a thick neck. Tasteful.
        </Tx>
        {rows.map((row, r) => {
          const y = rowY[r];
          const cells = [
            {k: 'ref'},
            {k: 'now', yaw: 0, hy: -36, label: `${row.sex === 'f' ? 'HER' : 'HIM'} NOW, front`},
            {k: 'now', yaw: -90, hy: 0, label: `${row.sex === 'f' ? 'HER' : 'HIM'} NOW, side`},
            {k: 'v4', yaw: 0, hy: -36, label: `${row.sex === 'f' ? 'HER' : 'HIM'} V4, front`},
            {k: 'v4', yaw: -90, hy: 0, label: `${row.sex === 'f' ? 'HER' : 'HIM'} V4, side`},
          ] as {k: string; yaw?: number; hy?: number; label?: string}[];
          return (
            <g key={r}>
              {cells.map((cl, i) => {
                const x = x0 + i * (W + gap);
                const id = `bd${r}${i}`;
                if (cl.k === 'ref')
                  return (
                    <g key={id}>
                      <RefBox k={row.ref} x={x} y={y} w={W} h={Hc} id={id} />
                      <Label x={x + 4} y={y + Hc + 30} t={row.refLabel} sub={row.refSub} />
                    </g>
                  );
                const base = y + Hc - 30;
                const cx = x + W / 2;
                const fig =
                  cl.k === 'now' ? (
                    <Figure fig={nowFig(row.sex, cl.yaw!, cl.hy!, FH)} x={cx} y={base} h={FH} uid={`${id}f`} />
                  ) : (
                    <g dangerouslySetInnerHTML={{__html: partsSvg(figureV4(row.sex, {yaw: cl.yaw!, headYaw: cl.hy!, px: FH}).parts.map((p) => mapPart(p, {c: [cx, base - FH], s: FH / 1000, rot: 0})), id)}} />
                  );
                return (
                  <g key={id}>
                    <Box x={x} y={y} w={W} h={Hc} id={id} fill={cl.k === 'v4' ? PANEL_V4 : PANEL} ring={cl.k === 'v4'}>
                      {fig}
                    </Box>
                    <Label x={x + 4} y={y + Hc + 30} t={cl.label!} sub={ratios(row.sex, cl.k === 'now')} green={cl.k === 'v4'} />
                  </g>
                );
              })}
            </g>
          );
        })}
        <rect x={40} y={bandY} width={BODY_W - 80} height={290} rx={12} fill={BAND} />
        <Tx x={60} y={bandY + 34} s={20} w={700} c="#FFF8F0">
          film size 1:1 (200 px): her now front, side | her v4 front, side || him now front, side | him v4 front, side
        </Tx>
        {(['f', 'm'] as Sex[]).map((sx, j) =>
          ([
            ['now', 0, -36],
            ['now', -90, 0],
            ['v4', 0, -36],
            ['v4', -90, 0],
          ] as [string, number, number][]).map(([w, yaw, hy], i) => {
            const x = 220 + j * 1080 + i * 150 + (i >= 2 ? 120 : 0);
            const base = bandY + 262;
            if (w === 'now') return <Figure key={`${j}${i}`} fig={nowFig(sx, yaw, hy, 200)} x={x} y={base} h={200} uid={`bb${j}${i}`} />;
            const f = figureV4(sx, {yaw, headYaw: hy, px: 200});
            return <g key={`${j}${i}`} dangerouslySetInnerHTML={{__html: partsSvg(f.parts.map((p) => mapPart(p, {c: [x, base - 200], s: 0.2, rot: 0})), `bbv${j}${i}`)}} />;
          }),
        )}
        <Tx x={40} y={BODY_H - 22} s={21} c={INK}>
          Look at: does she read feminine and elegant (a waist, sloping shoulders, slim wrists and ankles) and he manly (the V, the neck into the shoulders), both tasteful, the contours smooth?
        </Tx>
      </svg>
    </AbsoluteFill>
  );
};

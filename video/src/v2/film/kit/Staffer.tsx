// kit/Staffer.tsx: P3's interview: two generic Google staffers who are clearly NOT her (short hair or none, non-hero
// clothes, badges on non-hero lanyards), worried faces, seated waist-up behind an interview table, turned to the mic.
//   <Staffer variant 'A'>  the one who spoke (the subject; NAME WITHHELD goes over him: the lane's lettering):
//                          short dark-brown hair, a wine crew-neck sweater, anchor lanyard
//   <Staffer variant 'B'>  bald with side tufts, round glasses, a camel jacket over a cream shirt, wood-brown lanyard
//   <InterviewBackdrop>    the plain neutral-warm backdrop (CC.studio: not her home, not the cold pages)
//   <InterviewTable>       the table top (a deep surface) + its front face; draw it OVER the staffers' bodies and
//                          UNDER their arms: <Staffer part="body"/> <InterviewTable/> <Staffer part="arms"/>
//   <TablePage>            a page lying on the table (P3: CONTRACT; their contracts, no clause, no pop)
// Placement = the G3 board's figure box (x between the feet, y the ground, h standing height; head r 0.09 h): P3's
// A {x 640, y 1780, h 900, facing 'l'} (head r 81), B {x 905, y 1780, h 820, facing 'l'} (head r 74).

import React from 'react';
import {hline, line, polyPath, rect, smooth, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {CC} from '../palette';
import {At, b, Fill, fillAt, Ink, inkForHead, Letter, Pt, quadPt, W} from './util';
import {Badge} from './Props';
import {elbow, Facing, HerFace, HerHeadParts, HeadSpec, Talking, tube} from './Her';

const {Head} = HerHeadParts;

export const STAFF = {
  A: {sweater: CC.staffA, shade: CC.staffAShade, hair: CC.staffAHair, skin: CC.skin, lanyard: CC.lanyardA, style: 'short' as const, glasses: false},
  B: {sweater: CC.staffB, shade: CC.staffBShade, hair: CC.staffBHair, skin: CC.skin2, lanyard: CC.lanyardB, style: 'bald' as const, glasses: true},
};

/** The board's P3 figure boxes. */
export const P3_STAFF = {
  A: {x: 640, y: 1780, h: 900, facing: 'l' as Facing},
  B: {x: 905, y: 1780, h: 820, facing: 'l' as Facing},
};

export type StafferProps = {
  x: number;
  y: number;
  h: number;
  facing?: Facing;
  variant?: 'A' | 'B';
  face?: HerFace;
  talking?: Talking;
  /** 'all' | 'body' (head, torso, badge) | 'arms' (forearms + hands on the table: draw after the table). */
  part?: 'all' | 'body' | 'arms';
  badge?: boolean;
  /** Override hand positions (canvas px). */
  hands?: [Pt, Pt];
  at?: At;
  seed?: string;
  ink?: number;
};

export const Staffer: React.FC<StafferProps> = ({x, y, h, facing = 'l', variant = 'A', face = 'worried', talking, part = 'all', badge = true, hands, at, seed, ink: inkP}) => {
  const t = useTime();
  const V = STAFF[variant];
  const sd = seed ?? `staff${variant}`;
  const s = facing === 'r' ? 1 : -1;
  const r = 0.09 * h;
  const ink = inkP ?? inkForHead(r);
  const turn = 0.3;
  const bob = Math.sin(t * 1.5 + (variant === 'A' ? 0 : 1.7)) * 0.0016 * h;
  const P = (u: number, v: number): Pt => [x + s * u * h, y - v * h + bob];
  const H = P(0.04, 0.755);
  const S = P(0.02, 0.62);
  const Hp = P(-0.02, 0.33);
  const head: HeadSpec = {c: H, r, s, turn, face, talking, ink, at, seed: sd, hairStyle: V.style, hairColor: V.hair, skin: V.skin, glasses: V.glasses};
  const torso = smooth(
    [
      [S[0] - s * 0.04 * h, S[1] - 0.012 * h],
      [S[0] - s * 0.11 * h, S[1] + 0.004 * h],
      [S[0] - s * 0.13 * h, S[1] + 0.06 * h],
      [Hp[0] - s * 0.11 * h, Hp[1] - 0.1 * h],
      [Hp[0] - s * 0.11 * h, Hp[1] + 0.02 * h],
      [Hp[0] + s * 0.1 * h, Hp[1] + 0.02 * h],
      [Hp[0] + s * 0.1 * h, Hp[1] - 0.1 * h],
      [S[0] + s * 0.12 * h, S[1] + 0.06 * h],
      [S[0] + s * 0.1 * h, S[1] + 0.004 * h],
      [S[0] + s * 0.04 * h, S[1] - 0.012 * h],
    ],
    {closed: true, tension: 0.35},
  );
  const neck = polyPath([[H[0] - 0.36 * r, H[1] + 0.7 * r], [H[0] + 0.36 * r, H[1] + 0.7 * r], [H[0] + 0.42 * r, S[1] + 0.01 * h], [H[0] - 0.42 * r, S[1] + 0.01 * h]]);
  const cx = H[0] + s * 0.01 * h;
  // A: a crew-neck rib; B: a shirt V with jacket lapels
  const collar =
    variant === 'A'
      ? smooth([[cx - 0.5 * r, S[1] - 0.05 * r], [cx, S[1] + 0.5 * r], [cx + 0.5 * r, S[1] - 0.05 * r], [cx + 0.4 * r, S[1] - 0.32 * r], [cx, S[1] + 0.14 * r], [cx - 0.4 * r, S[1] - 0.32 * r]], {closed: true})
      : polyPath([[cx - 0.48 * r, S[1] - 0.2 * r], [cx + 0.48 * r, S[1] - 0.2 * r], [cx + 0.12 * r, S[1] + 2.2 * r], [cx - 0.12 * r, S[1] + 2.2 * r]]);
  const lapels =
    variant === 'B'
      ? smooth([[cx - 0.5 * r, S[1] - 0.15 * r], [cx - 0.95 * r, S[1] + 0.7 * r], [cx - 0.12 * r, S[1] + 2.2 * r]]) + smooth([[cx + 0.5 * r, S[1] - 0.15 * r], [cx + 0.95 * r, S[1] + 0.7 * r], [cx + 0.12 * r, S[1] + 2.2 * r]])
      : '';
  // arms: shoulders -> elbows -> hands on the table (toward the mic)
  const handsP: [Pt, Pt] = hands ?? [P(0.15, 0.462), P(0.21, 0.475)];
  const shB: Pt = [S[0] - s * 0.105 * h, S[1] + 0.035 * h];
  const shF: Pt = [S[0] + s * 0.095 * h, S[1] + 0.035 * h];
  const E0 = elbow(shB, handsP[0], 0.16 * h, 0.16 * h, -s);
  const E1 = elbow(shF, handsP[1], 0.16 * h, 0.16 * h, -s);
  const aw = 0.06 * h;
  const arm = (A: Pt, E: Pt, Z: Pt, k: string) => {
    const d = tube([A, E, Z], [aw * 1.05, aw, aw * 0.88]);
    const hd = smooth([[Z[0] - 0.034 * h, Z[1] - 0.02 * h], [Z[0] + s * 0.03 * h, Z[1] - 0.03 * h], [Z[0] + s * 0.05 * h, Z[1] + 0.006 * h], [Z[0] - 0.01 * h, Z[1] + 0.022 * h], [Z[0] - s * 0.03 * h, Z[1] + 0.01 * h]], {closed: true});
    return (
      <React.Fragment key={k}>
        <Fill d={d} color={V.sweater} at={fillAt(at, 0.06)} seed={`${sd}/${k}`} />
        <Ink d={d} width={ink * 0.85} at={b(at, 0.06)} open={0.1} />
        <Fill d={hd} color={V.skin} at={fillAt(at, 0.1)} seed={`${sd}/${k}h`} />
        <Ink d={hd} width={ink * 0.7} at={b(at, 0.1)} open={0.15} />
      </React.Fragment>
    );
  };
  const badgeC: Pt = [S[0] + s * 0.045 * h, S[1] + 0.1 * h];
  return (
    <>
      {part !== 'arms' ? (
        <>
          <Fill d={torso} color={V.sweater} at={fillAt(at)} seed={`${sd}/torso`} />
          {variant === 'B' ? <Fill d={collar} color={CC.staffBShirt} at={fillAt(at, 0.02)} offset={false} /> : null}
          <Ink d={torso} width={ink} at={at} open={0.05} />
          <Fill d={neck} color={V.skin} at={fillAt(at, 0.02)} offset={false} />
          {variant === 'A' ? <Fill d={collar} color={V.shade} at={fillAt(at, 0.03)} offset={false} /> : <Ink d={lapels} width={ink * 0.7} at={b(at, 0.04)} />}
          {badge ? <Badge x={badgeC[0]} y={badgeC[1]} w={Math.max(56, 0.069 * h)} rot={s * 4} strap={[[H[0] - 0.42 * r, S[1] + 0.01 * h], [H[0] + 0.42 * r, S[1] + 0.01 * h]]} lanyard={V.lanyard} at={b(at, 0.1)} seed={`${sd}/badge`} /> : null}
          <Head h={head} />
        </>
      ) : null}
      {part !== 'body' ? (
        <>
          {arm(shB, E0, handsP[0], 'a0')}
          {arm(shF, E1, handsP[1], 'a1')}
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the set

/** P3's plain neutral-warm backdrop (screen-filling, + bleed). */
export const InterviewBackdrop: React.FC<{at?: At}> = ({at}) => <Fill rect={[-200, -200, 1480, 2320]} color={CC.studio} at={at} mode="snap" offset={false} />;

/** The interview table: top surface from `top` to `front`, front face to `bottom` (canvas px; the board's 1362 / 1532 / 1732). */
export const InterviewTable: React.FC<{top?: number; front?: number; bottom?: number; x0?: number; x1?: number; at?: At; seed?: string}> = ({top = 1362, front = 1532, bottom = 1732, x0 = -60, x1 = 1140, at, seed = 'itable'}) => (
  <>
    <Fill rect={[x0, top, x1 - x0, front - top]} color={CC.table} at={fillAt(at)} mode="snap" offset={false} />
    <Fill rect={[x0, front, x1 - x0, bottom - front]} color={CC.tableFront} at={fillAt(at)} mode="snap" offset={false} />
    <Fill rect={[x0, bottom, x1 - x0, 2000 - bottom]} color={CC.studio} at={fillAt(at)} mode="snap" offset={false} />
    <Ink d={hline(x0, x1, top, {seed: `${seed}/t`, over: [0, 0]}) + hline(x0, x1, front, {seed: `${seed}/f`, over: [0, 0]}) + hline(x0, x1, bottom, {seed: `${seed}/b`, over: [0, 0]})} width={W.mid} at={at} />
    <Ink d={hline(x0, x1, front + 16, {seed: `${seed}/e`, over: [0, 0]})} width={W.hair} at={b(at, 0.05)} />
  </>
);

/** A page lying flat on the table (a perspective trapezoid: the far edge narrower), with a hand-lettered title and
 *  ruled lines (P3: CONTRACT at x 300, y 1380, 320 x 140). */
export const TablePage: React.FC<{x: number; y: number; w: number; h: number; title?: string; at?: At; seed?: string}> = ({x, y, w, h, title = 'CONTRACT', at, seed = 'tpage'}) => {
  const inset = w * 0.06;
  const q: [Pt, Pt, Pt, Pt] = [[x + inset, y], [x + w - inset, y], [x + w, y + h], [x, y + h]];
  const rows = [0.55, 0.7, 0.85].map((v, i) => {
    const a = quadPt(q, 0.1, v);
    const z = quadPt(q, 0.86 - (i % 2) * 0.12, v);
    return line(a[0], a[1], z[0], z[1], {over: [0, 0], seed: `${seed}/r${i}`});
  });
  const tc = quadPt(q, 0.5, 0.3);
  return (
    <>
      <Fill d={polyPath([[q[3][0] + 4, q[3][1] + 6], [q[2][0] + 4, q[2][1] + 6], [q[1][0] + 4, q[1][1] + 6], [q[0][0] + 4, q[0][1] + 6]])} color={CC.tableFront} offset={false} at={fillAt(at)} />
      <Fill d={polyPath(q)} color={CC.paper} offset={false} at={fillAt(at)} />
      <Ink d={polyPath(q)} width={W.mid} at={at} />
      <Letter x={tc[0]} y={tc[1] + h * 0.1} size={h * 0.3} fit={w * 0.7} anchor="middle" at={b(at, 0.1)}>
        {title}
      </Letter>
      <Ink d={rows.join('')} width={W.far} at={b(at, 0.12)} />
    </>
  );
};
void rect;
void textLines;

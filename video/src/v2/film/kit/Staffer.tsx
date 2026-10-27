// kit/Staffer.tsx: P3's interview: two generic Google staffers who are clearly NOT her (short hair or none, non-hero
// clothes, badges on non-hero lanyards), worried faces, seated waist-up behind an interview table, turned to the mic.
//   <Staffer variant 'A'>  the one who spoke (the subject; NAME WITHHELD goes over him: the lane's lettering):
//                          short dark-brown hair, a wine crew-neck sweater, anchor lanyard
//   <Staffer variant 'B'>  bald with side tufts, round glasses, a camel jacket over a cream shirt, wood-brown lanyard
//   (the room behind them is kit/Interview.tsx InterviewRoom: a cool periwinkle studio, dense but not cozy)
//   <InterviewTable>       the table top (a deep surface) + its front face; draw it OVER the staffers' bodies and
//                          UNDER their arms: <Staffer part="body"/> <InterviewTable/> <Staffer part="arms"/>
//   <TablePage>            a page lying on the table (P3: CONTRACT; their contracts, no clause, no pop)
// Placement = the G3 board's figure box (x between the feet, y the ground, h standing height; head r 0.09 h): P3's
// A {x 640, y 1780, h 900, facing 'l'} (head r 81), B {x 905, y 1780, h 820, facing 'l'} (head r 74).

import React from 'react';
import {hline, line, polyPath, rect, roundRect, smooth, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {CC} from '../palette';
import {At, b, Fill, fillAt, Ink, inkForHead, Letter, Pt, quadPt, W} from './util';
import {Badge} from './Props';
import {Live} from './Ambient';
import {elbow, Facing, fidget, HerFace, HerHeadParts, HeadSpec, Talking, tube} from './Her';
import {rand} from '../../../lib/rng';

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
  /** Override hand positions (canvas px; [back, front]). Default: A folds his hands on the table to the RIGHT of the
   *  CONTRACT page (x 220-540: its title stays clear); B rests his chin on his near hand, the other forearm on the table. */
  hands?: [Pt, Pt];
  /** Override the elbows (canvas px; default: placed under the shoulders on the table: an elbow break, never a Z). */
  elbows?: [Pt, Pt];
  /** Idle life (default true): breath, blink, a glance, a hand fidget, a swallow. */
  life?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
};

export const Staffer: React.FC<StafferProps> = ({x, y, h, facing = 'l', variant = 'A', face = 'worried', talking, part = 'all', badge = true, hands, elbows, at, seed, ink: inkP, life = true}) => {
  const t = useTime();
  const V = STAFF[variant];
  const sd = seed ?? `staff${variant}`;
  const s = facing === 'r' ? 1 : -1;
  const r = 0.09 * h;
  const ink = inkP ?? inkForHead(r);
  // idle life: breath, a glance (the head turns toward the camera for a beat every ~3.4 s), a fidget, a swallow
  const gper = 3.1 + rand(sd, 'gp') * 0.9;
  const gu = (((Math.floor(t * 12) / 12 + rand(sd, 'go') * gper) % gper) + gper) % gper;
  const turn = life ? (gu < 0.9 ? 0.3 - 0.22 * Math.sin((gu / 0.9) * Math.PI) : 0.3) : 0.3;
  const swallow = life && gu > 1.6 && gu < 1.8 ? 0.006 * h : 0;
  const bob = (life ? Math.sin(t * 1.5 + (variant === 'A' ? 0 : 1.7)) * 0.0016 * h : 0) - swallow * 0.3;
  const fg = life ? fidget(t, sd, 0.008 * h) : ([0, 0] as Pt);
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
  // arms: shoulders -> elbows (PLACED: on the table under the shoulders, a clear elbow break) -> hands.
  // A: both forearms on the table, hands folded together to the right of the page (worried, still).
  // B: chin on his near hand (the elbow on the table, the forearm up), the far forearm flat on the table.
  const shB: Pt = [S[0] - s * 0.105 * h, S[1] + 0.035 * h];
  const shF: Pt = [S[0] + s * 0.095 * h, S[1] + 0.035 * h];
  const pose: {hands: [Pt, Pt]; elbows: [Pt, Pt]} =
    variant === 'A'
      ? {hands: [P(0.0, 0.378), P(-0.04, 0.38)], elbows: [P(-0.105, 0.417), P(0.111, 0.422)]}
      : {hands: [P(-0.03, 0.4), [H[0] + s * 0.18 * r, H[1] + 1.22 * r]], elbows: [P(-0.1, 0.45), P(0.12, 0.47)]};
  const handsP0: [Pt, Pt] = hands ?? pose.hands;
  const handsP: [Pt, Pt] = variant === 'A' && !hands ? [handsP0[0], [handsP0[1][0] + fg[0], handsP0[1][1] + fg[1]]] : [[handsP0[0][0] + fg[0], handsP0[0][1] + fg[1]], handsP0[1]];
  const E0: Pt = elbows ? elbows[0] : hands ? elbow(shB, handsP[0], 0.16 * h, 0.16 * h, -s) : pose.elbows[0];
  const E1: Pt = elbows ? elbows[1] : hands ? elbow(shF, handsP[1], 0.16 * h, 0.16 * h, -s) : pose.elbows[1];
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


/** The interview table: top surface from `top` to `front`, front face to `bottom` (canvas px; the board's 1362 / 1532 /
 *  1732), broken up like a real one: the front's panel seams, a cable tray under the lip with the mic's cable and a
 *  power strip, the carpet in tiles with flecks, and two empty chair backs on our side (foreground; `chairs` false =
 *  none). */
export const InterviewTable: React.FC<{top?: number; front?: number; bottom?: number; x0?: number; x1?: number; chairs?: boolean; at?: At; seed?: string}> = ({top = 1362, front = 1532, bottom = 1732, x0 = -60, x1 = 1140, chairs = true, at, seed = 'itable'}) => {
  const seams = [300, 640, 980].map((x, i) => vline2(x, front + 22, bottom - 4, `${seed}/sm${i}`)).join('');
  const tray = front + 22;
  // carpet tiles in perspective (seams fan from a point above the table) and flecks
  const vp: Pt = [540, 900];
  const tileX = [-300, -60, 180, 420, 660, 900, 1140, 1380];
  const carpet = tileX.map((bx, i) => {
    const u = (bottom - vp[1]) / (2000 - vp[1]);
    return line(vp[0] + (bx - vp[0]) * u, bottom, bx, 2000, {over: [0, 0], seed: `${seed}/ct${i}`});
  }).join('') + [1800, 1890].map((yy, i) => hline(x0, x1, yy, {over: [0, 0], seed: `${seed}/ch${i}`})).join('');
  const flecks: Pt[] = [];
  for (let i = 0; i < 46; i++) flecks.push([((i * 197) % 1180) - 40, bottom + 18 + ((i * 89) % 170)]);
  const chairBack = (cx: number, cy: number, w: number, k: string) => {
    const back = roundRect(cx - w / 2, cy, w, w * 0.62, w * 0.16);
    const inner = roundRect(cx - w * 0.36, cy + w * 0.1, w * 0.72, w * 0.36, w * 0.1);
    return (
      <React.Fragment key={k}>
        <Fill rect={[cx - w * 0.07, cy + w * 0.6, w * 0.14, 2000 - cy]} color={CC.stand} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={back} color={CC.chairBack} at={fillAt(at, 0.02)} seed={`${seed}/${k}`} />
        <Fill d={inner} color={CC.micGrille} offset={false} at={fillAt(at, 0.03)} />
        <Ink d={back} width={W.mid} at={b(at, 0.02)} />
        <Ink d={inner} width={W.far} at={b(at, 0.04)} />
      </React.Fragment>
    );
  };
  return (
    <>
      <Fill rect={[x0, top, x1 - x0, front - top]} color={CC.table} at={fillAt(at)} mode="snap" offset={false} />
      <Fill rect={[x0, front, x1 - x0, bottom - front]} color={CC.tableFront} at={fillAt(at)} mode="snap" offset={false} />
      <Fill rect={[x0, bottom, x1 - x0, 2000 - bottom]} color={CC.studioFloor} at={fillAt(at)} mode="snap" offset={false} />
      <Ink d={carpet} width={W.hair} color={CC.shelfMetal} at={b(at, 0.04)} />
      <Live at={at} c={[540, bottom + 90]}>
        {flecks.map(([fx, fy], i) => (
          <rect key={i} x={fx} y={fy} width={7} height={4} fill={CC.carpet} />
        ))}
      </Live>
      {/* the cable tray under the lip: a darker channel, the mic's cable sagging out of it, a power strip */}
      <Fill rect={[x0, tray, x1 - x0, 26]} color={CC.studioDeep} offset={false} at={fillAt(at, 0.02)} />
      <Fill d={roundRect(700, tray + 4, 150, 18, 5)} color={CC.studioPanel} offset={false} at={fillAt(at, 0.03)} />
      <Ink d={smooth([[120, tray + 26], [180, tray + 70], [260, tray + 64], [330, tray + 26]]) + smooth([[860, tray + 22], [900, tray + 64], [960, tray + 70]])} width={4} color={CC.cable} taper={false} at={b(at, 0.06)} />
      <Ink d={hline(x0, x1, top, {seed: `${seed}/t`, over: [0, 0]}) + hline(x0, x1, front, {seed: `${seed}/f`, over: [0, 0]}) + hline(x0, x1, bottom, {seed: `${seed}/b`, over: [0, 0]}) + hline(x0, x1, tray + 26, {seed: `${seed}/tr`, over: [0, 0]})} width={W.mid} at={at} />
      <Ink d={hline(x0, x1, front + 16, {seed: `${seed}/e`, over: [0, 0]}) + seams} width={W.hair} at={b(at, 0.05)} />
      {chairs ? (
        <>
          {chairBack(210, 1660, 300, 'chA')}
          {chairBack(820, 1690, 280, 'chB')}
        </>
      ) : null}
    </>
  );
};

const vline2 = (x: number, y0: number, y1: number, seed: string) => line(x, y0, x, y1, {over: [0, 0], seed});

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

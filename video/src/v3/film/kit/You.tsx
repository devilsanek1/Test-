// kit/You.tsx: THE protagonist ("you"), one model for every lane: short dark hair with a fringe, the rust sweater with
// darker rib cuffs and collar (the POV hand's sleeve is the same sweater), dusk-blue jeans, warm skin. Three poses:
//   <YouFront>   waist-up, facing us, the one face beat (S5): a simple house-style face, 'happy' | 'worried' | 'neutral',
//                hands in front of the chest holding whatever the lane passes as children (laptop + tag).
//   <YouSeated>  seated 3/4 back view facing right, toward the window (S13), on a wooden chair; no face.
//   <YouTiny>    tiny standing back view (~86 px) holding up ONE memory stick (S9b).

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {arc, blob, ellipse, line, poly, polyPath, smooth} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt} from './util';
import {MemoryStick} from './Memory';

export const YOU = {hair: EMBER.hair, skin: EMBER.skin, sweater: EMBER.sleeve, rib: EMBER.sweaterRib, jeans: EMBER.jeans, shoe: EMBER.shoe, chair: EMBER.chair} as const;

export type Face = 'happy' | 'worried' | 'neutral';

// ---------------------------------------------------------------- front, waist-up (S5)

export type YouFrontProps = {
  /** Head centre x and head top y (canvas px). */
  x: number;
  y: number;
  /** Head height (px). S5: ~250 (the face reads at 25 %). The torso runs ~3.6 heads down (cut by the counter). */
  head?: number;
  /** The face, or a timeline [{t, face}] (the latest with t <= now). */
  face?: Face | {t: number; face: Face}[];
  /** Pupils' glance, -1 (left) .. 1 (right). */
  look?: number;
  /** Hands (canvas px). Default: in front of the chest. */
  hands?: [Pt, Pt];
  at?: At;
  seed?: string;
  ink?: number;
  /** The held prop: drawn over the body and under the hands. */
  children?: React.ReactNode;
};

const faceAt = (t: number, f: YouFrontProps['face']): Face => {
  if (!f) return 'happy';
  if (typeof f === 'string') return f;
  let cur: Face = f[0]?.face ?? 'happy';
  for (const k of f) if (t >= k.t) cur = k.face;
  return cur;
};

export const YouFront: React.FC<YouFrontProps> = ({x, y: y0, head: H = 250, face, look = 0, hands, at, seed = 'you', ink = 4.8, children}) => {
  const t = useTime();
  const bob = Math.sin(t * 1.9) * 1.5; // breathing
  const y = y0 + bob;
  const f = faceAt(t, face);
  const inner = Math.max(2.2, ink * 0.7);
  const cx = x;
  const cy = y + H * 0.52;
  const shY = y + H * 1.14;
  const waist = y + H * 4.4;
  const hw = H * 1.12; // half shoulder width
  const [hl, hr] = hands ?? [[x - H * 0.62, y + H * 2.75], [x + H * 0.62, y + H * 2.75]];
  // torso: rounded shoulders, slight taper, runs past the waist (the lane's counter cuts it)
  const torso = smooth(
    [
      [cx - H * 0.2, shY - H * 0.06],
      [cx - hw * 0.72, shY + H * 0.02],
      [cx - hw, shY + H * 0.3],
      [cx - hw * 1.02, shY + H * 1.4],
      [cx - hw * 0.94, waist],
      [cx + hw * 0.94, waist],
      [cx + hw * 1.02, shY + H * 1.4],
      [cx + hw, shY + H * 0.3],
      [cx + hw * 0.72, shY + H * 0.02],
      [cx + H * 0.2, shY - H * 0.06],
    ],
    {closed: true},
  );
  // arms: upper arm down the side, forearm in to the hand
  const arm = (side: -1 | 1, hand: Pt) => {
    const sh: Pt = [cx + side * hw * 0.86, shY + H * 0.28];
    const el: Pt = [cx + side * hw * 1.08, shY + H * 1.45];
    const wr: Pt = [hand[0] - side * H * 0.02, hand[1]];
    const thick = H * 0.21;
    // a sleeve as a fat stroke outline: offset the polyline both ways
    const pts = [sh, el, wr];
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)];
      const c = pts[Math.min(pts.length - 1, i + 1)];
      const dx = c[0] - a[0];
      const dy = c[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l;
      const ny = dx / l;
      const k = i === 0 ? 1.1 : 1;
      left.push([pts[i][0] + nx * thick * k, pts[i][1] + ny * thick * k]);
      right.push([pts[i][0] - nx * thick * k, pts[i][1] - ny * thick * k]);
    }
    const sleeve = smooth([...left, ...right.reverse()], {closed: true});
    // cuff band near the wrist
    const dirx = wr[0] - el[0];
    const diry = wr[1] - el[1];
    const dl = Math.hypot(dirx, diry) || 1;
    const ux = dirx / dl;
    const uy = diry / dl;
    const cuffC: Pt = [wr[0] - ux * H * 0.1, wr[1] - uy * H * 0.1];
    const cuff: Pt[] = [
      [cuffC[0] - uy * thick + ux * H * 0.08, cuffC[1] + ux * thick + uy * H * 0.08],
      [cuffC[0] + uy * thick + ux * H * 0.08, cuffC[1] - ux * thick + uy * H * 0.08],
      [cuffC[0] + uy * thick - ux * H * 0.08, cuffC[1] - ux * thick - uy * H * 0.08],
      [cuffC[0] - uy * thick - ux * H * 0.08, cuffC[1] + ux * thick - uy * H * 0.08],
    ];
    return {sleeve, cuff, wr};
  };
  const A = [arm(-1, hl), arm(1, hr)];
  const hand = (p: Pt, side: -1 | 1, key: string) => {
    const r = H * 0.17;
    const d = blob(p[0] + side * r * 0.2, p[1], r, r * 0.9, {seed: `${seed}/${key}`, wobble: 0.04});
    const thumb = smooth([[p[0] - side * r * 0.4, p[1] - r * 0.7], [p[0] - side * r * 0.1, p[1] - r * 1.25], [p[0] + side * r * 0.35, p[1] - r * 0.85]]);
    return (
      <>
        <Fill d={d} color={YOU.skin} at={fillAt(at, 0.12)} seed={`${seed}/${key}F`} />
        <Ink d={d} at={b(at, 0.12)} width={inner} open={0.15} />
        <Ink d={thumb} at={b(at, 0.16)} width={inner} />
      </>
    );
  };
  // face parts
  const ex = H * 0.16;
  const ey = y + H * 0.56;
  const er = H * 0.045;
  const px = look * er * 0.9;
  const brow = (side: -1 | 1) => {
    const bx = cx + side * ex;
    const by = y + H * 0.43;
    if (f === 'worried') return line(bx - side * H * 0.085, by - H * 0.035, bx + side * H * 0.075, by + H * 0.02, {over: [0, 0], seed: `${seed}/br${side}w`});
    return arc(bx, by + H * 0.03, H * 0.085, H * 0.035, 200, 340, {seed: `${seed}/br${side}`});
  };
  const mouth =
    f === 'happy'
      ? arc(cx, y + H * 0.68, H * 0.13, H * 0.08, 20, 160, {seed: `${seed}/smile`})
      : f === 'worried'
        ? smooth([[cx - H * 0.11, y + H * 0.79], [cx - H * 0.04, y + H * 0.755], [cx + H * 0.03, y + H * 0.765], [cx + H * 0.1, y + H * 0.8]])
        : line(cx - H * 0.08, y + H * 0.77, cx + H * 0.08, y + H * 0.77, {over: [0, 0], seed: `${seed}/flat`});
  const nose = smooth([[cx + H * 0.01, y + H * 0.58], [cx - H * 0.035, y + H * 0.66], [cx + H * 0.02, y + H * 0.67]]);
  const headD = blob(cx, cy, H * 0.42, H * 0.5, {seed: `${seed}/head`, wobble: 0.015});
  // hair: a cap over the top with a ragged fringe and short sides
  const hair = smooth(
    [
      [cx - H * 0.46, y + H * 0.56],
      [cx - H * 0.5, y + H * 0.28],
      [cx - H * 0.36, y + H * 0.04],
      [cx - H * 0.08, y - H * 0.05],
      [cx + H * 0.22, y - H * 0.03],
      [cx + H * 0.44, y + H * 0.12],
      [cx + H * 0.5, y + H * 0.36],
      [cx + H * 0.45, y + H * 0.54],
      [cx + H * 0.38, y + H * 0.34],
      [cx + H * 0.26, y + H * 0.27],
      [cx + H * 0.12, y + H * 0.31],
      [cx + H * 0.02, y + H * 0.25],
      [cx - H * 0.1, y + H * 0.32],
      [cx - H * 0.24, y + H * 0.27],
      [cx - H * 0.36, y + H * 0.36],
    ],
    {closed: true},
  );
  const neck = polyPath([[cx - H * 0.15, y + H * 0.9], [cx + H * 0.15, y + H * 0.9], [cx + H * 0.17, shY + H * 0.04], [cx - H * 0.17, shY + H * 0.04]]);
  const collar = smooth([[cx - H * 0.3, shY - H * 0.04], [cx, shY + H * 0.16], [cx + H * 0.3, shY - H * 0.04], [cx + H * 0.22, shY - H * 0.1], [cx, shY + H * 0.06], [cx - H * 0.22, shY - H * 0.1]], {closed: true});
  const drop = f === 'worried' ? smooth([[cx + H * 0.5, y + H * 0.3], [cx + H * 0.56, y + H * 0.42], [cx + H * 0.5, y + H * 0.46], [cx + H * 0.45, y + H * 0.41]], {closed: true}) : '';
  return (
    <>
      <Fill d={torso} color={YOU.sweater} at={fillAt(at)} seed={`${seed}/torso`} />
      <Ink d={torso} at={at} width={ink} open={0.06} />
      <Fill d={neck} color={YOU.skin} at={fillAt(at, 0.02)} seed={`${seed}/neck`} />
      <Fill d={collar} color={YOU.rib} at={fillAt(at, 0.04)} seed={`${seed}/collar`} />
      <Ink d={collar} at={b(at, 0.04)} width={inner} />
      {/* ears, head, hair */}
      <Fill d={blob(cx - H * 0.43, y + H * 0.58, H * 0.07, H * 0.1, {seed: `${seed}/earL`})} color={YOU.skin} at={fillAt(at, 0.03)} />
      <Fill d={blob(cx + H * 0.43, y + H * 0.58, H * 0.07, H * 0.1, {seed: `${seed}/earR`})} color={YOU.skin} at={fillAt(at, 0.03)} />
      <Ink d={ellipse(cx - H * 0.43, y + H * 0.58, H * 0.07, H * 0.1, {seed: `${seed}/earLI`}) + ellipse(cx + H * 0.43, y + H * 0.58, H * 0.07, H * 0.1, {seed: `${seed}/earRI`})} at={b(at, 0.03)} width={inner} />
      <Fill d={headD} color={YOU.skin} at={fillAt(at, 0.02)} seed={`${seed}/headF`} />
      <Ink d={headD} at={b(at, 0.02)} width={ink} open={0.05} />
      <Fill d={hair} color={YOU.hair} at={fillAt(at, 0.05)} seed={`${seed}/hair`} />
      <Ink d={hair} at={b(at, 0.05)} width={inner} />
      {/* the face */}
      <Fill d={blob(cx - ex + px, ey, er, er * 1.15, {seed: `${seed}/eL`})} color={EMBER.ink} at={fillAt(at, 0.08)} offset={false} />
      <Fill d={blob(cx + ex + px, ey, er, er * 1.15, {seed: `${seed}/eR`})} color={EMBER.ink} at={fillAt(at, 0.08)} offset={false} />
      <Ink d={brow(-1) + brow(1)} at={b(at, 0.1)} width={inner} />
      <Ink d={nose} at={b(at, 0.1)} width={Math.max(1.8, inner * 0.8)} />
      <Ink d={mouth} at={b(at, 0.12)} width={inner} />
      {drop ? (
        <>
          <Fill d={drop} color={EMBER.frost} at={fillAt(at, 0.1)} offset={false} />
          <Ink d={drop} at={b(at, 0.1)} width={2.2} />
        </>
      ) : null}
      {/* arms, the held prop, then the hands over it */}
      {A.map((a, i) => (
        <React.Fragment key={i}>
          <Fill d={a.sleeve} color={YOU.sweater} at={fillAt(at, 0.06)} seed={`${seed}/arm${i}`} />
          <Ink d={a.sleeve} at={b(at, 0.06)} width={inner} open={0.08} />
          <Fill d={polyPath(a.cuff)} color={YOU.rib} at={fillAt(at, 0.08)} offset={false} />
        </React.Fragment>
      ))}
      {children}
      {hand(hl, -1, 'hl')}
      {hand(hr, 1, 'hr')}
    </>
  );
};

// ---------------------------------------------------------------- seated, 3/4 back (S13)

export type YouSeatedProps = {
  /** Hip x and seat-top y (canvas px). */
  x: number;
  y: number;
  /** Head height (px). S13: ~92 (the seated figure ~450 px tall with the chair). */
  head?: number;
  /** Floor line (the chair legs and shins reach it; default y + 1.4 heads). */
  floorY?: number;
  at?: At;
  seed?: string;
  ink?: number;
};

export const YouSeated: React.FC<YouSeatedProps> = ({x, y, head: H = 92, floorY, at, seed = 'youS', ink = 4.8}) => {
  const t = useTime();
  const breathe = Math.sin(t * 1.6) * 1.2;
  const floor = floorY ?? y + H * 1.45;
  const inner = Math.max(2.2, ink * 0.65);
  const shY = y - H * 2.75 + breathe;
  // torso leans a little toward the window (right)
  const torso = smooth(
    [
      [x - H * 0.78, y + H * 0.05],
      [x - H * 0.86, shY + H * 1.2],
      [x - H * 0.72, shY + H * 0.22],
      [x - H * 0.36, shY - H * 0.02],
      [x + H * 0.36, shY - H * 0.06],
      [x + H * 0.82, shY + H * 0.2],
      [x + H * 0.9, shY + H * 1.2],
      [x + H * 0.78, y + H * 0.05],
    ],
    {closed: true},
  );
  const hem = polyPath([[x - H * 0.8, y - H * 0.18], [x + H * 0.8, y - H * 0.18], [x + H * 0.78, y + H * 0.05], [x - H * 0.78, y + H * 0.05]]);
  const hcx = x + H * 0.2;
  const hcy = shY - H * 0.55;
  const headD = blob(hcx, hcy, H * 0.44, H * 0.52, {seed: `${seed}/head`, wobble: 0.015});
  // back-of-head hair covers all but a sliver of cheek + the right ear (3/4 back, facing right)
  const hairD = smooth(
    [
      [hcx - H * 0.44, hcy + H * 0.1],
      [hcx - H * 0.42, hcy - H * 0.32],
      [hcx - H * 0.1, hcy - H * 0.55],
      [hcx + H * 0.26, hcy - H * 0.48],
      [hcx + H * 0.42, hcy - H * 0.2],
      [hcx + H * 0.3, hcy + H * 0.06],
      [hcx + H * 0.26, hcy + H * 0.36],
      [hcx, hcy + H * 0.44],
      [hcx - H * 0.3, hcy + H * 0.38],
    ],
    {closed: true},
  );
  const ear = blob(hcx + H * 0.36, hcy + H * 0.06, H * 0.08, H * 0.12, {seed: `${seed}/ear`});
  const neck = polyPath([[hcx - H * 0.18, hcy + H * 0.3], [hcx + H * 0.16, hcy + H * 0.3], [hcx + H * 0.2, shY + H * 0.06], [hcx - H * 0.2, shY + H * 0.06]]);
  // right arm forward along the side toward the desk
  const arm = smooth([[x + H * 0.62, shY + H * 0.16], [x + H * 0.98, shY + H * 0.32], [x + H * 1.06, shY + H * 1.2], [x + H * 1.6, shY + H * 1.55], [x + H * 1.62, shY + H * 1.85], [x + H * 0.98, shY + H * 1.62], [x + H * 0.66, shY + H * 0.9]], {closed: true});
  // thighs toward the desk, shins down to the floor
  const legs = smooth([[x - H * 0.6, y - H * 0.05], [x + H * 1.6, y - H * 0.14], [x + H * 2.0, y + H * 0.02], [x + H * 2.02, floor - H * 0.12], [x + H * 1.62, floor - H * 0.12], [x + H * 1.6, y + H * 0.38], [x - H * 0.5, y + H * 0.4]], {closed: true});
  const shoe = polyPath([[x + H * 1.56, floor - H * 0.16], [x + H * 2.06, floor - H * 0.16], [x + H * 2.4, floor - H * 0.04], [x + H * 2.4, floor], [x + H * 1.56, floor]]);
  // the chair: seat under the thighs, back rest IN FRONT of the lower back (it is between us and you)
  const seatD = polyPath([[x - H * 1.05, y + H * 0.36], [x + H * 0.9, y + H * 0.36], [x + H * 0.9, y + H * 0.6], [x - H * 1.05, y + H * 0.6]]);
  const backD = polyPath([[x - H * 1.08, y + H * 0.42], [x - H * 1.08, y - H * 1.9], [x - H * 0.78, y - H * 1.96], [x - H * 0.72, y + H * 0.42]]);
  const legsChair = `M${x - H * 0.96} ${y + H * 0.6}L${x - H * 0.98} ${floor}M${x + H * 0.78} ${y + H * 0.6}L${x + H * 0.8} ${floor}`;
  return (
    <>
      {/* chair seat + legs, then the legs (jeans), torso, arm, head */}
      <Ink d={legsChair} at={at} width={H * 0.16} color={YOU.chair} taper={false} />
      <Fill d={seatD} color={YOU.chair} at={fillAt(at)} seed={`${seed}/seat`} />
      <Ink d={polyPath([[x - H * 1.05, y + H * 0.36], [x + H * 0.9, y + H * 0.36], [x + H * 0.9, y + H * 0.6], [x - H * 1.05, y + H * 0.6]]).replace('Z', '')} at={at} width={inner} />
      <Fill d={legs} color={YOU.jeans} at={fillAt(at, 0.03)} seed={`${seed}/legs`} />
      <Ink d={legs} at={b(at, 0.03)} width={inner} open={0.08} />
      <Fill d={shoe} color={YOU.shoe} at={fillAt(at, 0.05)} seed={`${seed}/shoe`} />
      <Fill d={torso} color={YOU.sweater} at={fillAt(at, 0.02)} seed={`${seed}/torso`} />
      <Fill d={hem} color={YOU.rib} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={torso} at={b(at, 0.02)} width={ink} open={0.05} />
      <Ink d={line(x - H * 0.05, shY + H * 0.3, x + H * 0.02, y - H * 0.3, {over: [0, 0], seed: `${seed}/seam`})} at={b(at, 0.1)} width={1.8} />
      <Fill d={arm} color={YOU.sweater} at={fillAt(at, 0.05)} seed={`${seed}/arm`} />
      <Ink d={arm} at={b(at, 0.05)} width={inner} open={0.12} />
      <Fill d={blob(x + H * 1.68, shY + H * 1.72, H * 0.14, H * 0.12, {seed: `${seed}/hand`})} color={YOU.skin} at={fillAt(at, 0.07)} />
      <Fill d={neck} color={YOU.skin} at={fillAt(at, 0.04)} offset={false} />
      <Fill d={headD} color={YOU.skin} at={fillAt(at, 0.05)} seed={`${seed}/headF`} />
      <Fill d={ear} color={YOU.skin} at={fillAt(at, 0.06)} />
      <Fill d={hairD} color={YOU.hair} at={fillAt(at, 0.07)} seed={`${seed}/hair`} />
      <Ink d={headD} at={b(at, 0.05)} width={ink} open={0.1} />
      <Ink d={ellipse(hcx + H * 0.36, hcy + H * 0.06, H * 0.08, H * 0.12, {seed: `${seed}/earI`})} at={b(at, 0.08)} width={inner} />
      <Ink d={hairD} at={b(at, 0.07)} width={inner} open={0.2} />
      {/* the chair back over the lower back */}
      <Fill d={backD} color={YOU.chair} at={fillAt(at, 0.08)} seed={`${seed}/back`} />
      <Ink d={poly([[x - H * 1.08, y + H * 0.42], [x - H * 1.08, y - H * 1.9], [x - H * 0.78, y - H * 1.96], [x - H * 0.72, y + H * 0.42]], {seed: `${seed}/backI`, over: [1, 3]})} at={b(at, 0.08)} width={ink} />
    </>
  );
};

// ---------------------------------------------------------------- tiny, standing back view (S9b)

export type YouTinyProps = {
  /** Feet centre (canvas px). */
  x: number;
  y: number;
  /** Height (px; the board: 86). */
  h?: number;
  /** Hold up the one stick (default true) and its width (drawn ~2x a true-to-scale stick, so it reads). */
  stick?: boolean;
  stickW?: number;
  at?: At;
  seed?: string;
  ink?: number;
};

export const YouTiny: React.FC<YouTinyProps> = ({x, y, h = 86, stick = true, stickW = 46, at, seed = 'youT', ink = 2.2}) => {
  const u = h / 86;
  const headR = 9.5 * u;
  const headC: Pt = [x, y - h + headR];
  const shY = y - h + headR * 2 + 2 * u;
  const hipY = y - 36 * u;
  const torso = smooth([[x - 12 * u, hipY + 2 * u], [x - 14 * u, shY + 6 * u], [x - 8 * u, shY], [x + 8 * u, shY], [x + 14 * u, shY + 6 * u], [x + 12 * u, hipY + 2 * u]], {closed: true});
  const legL = polyPath([[x - 11 * u, hipY], [x - 1 * u, hipY], [x - 3 * u, y], [x - 11 * u, y]]);
  const legR = polyPath([[x + 1 * u, hipY], [x + 11 * u, hipY], [x + 11 * u, y], [x + 3 * u, y]]);
  // right arm raised: up and out, holding the stick above the shoulder
  const handP: Pt = [x + 22 * u, shY - 16 * u];
  const armD = `M${x + 11 * u} ${shY + 4 * u}L${handP[0]} ${handP[1]}`;
  return (
    <>
      <Fill d={legL} color={YOU.jeans} at={fillAt(at)} offset={[0.6, 0.4]} />
      <Fill d={legR} color={YOU.jeans} at={fillAt(at)} offset={[0.6, 0.4]} />
      <Fill d={polyPath([[x - 12 * u, y - 4 * u], [x - 2 * u, y - 4 * u], [x - 2 * u, y], [x - 13 * u, y]])} color={YOU.shoe} at={fillAt(at, 0.02)} offset={false} />
      <Fill d={polyPath([[x + 2 * u, y - 4 * u], [x + 12 * u, y - 4 * u], [x + 13 * u, y], [x + 2 * u, y]])} color={YOU.shoe} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={armD} at={b(at, 0.02)} width={7 * u} color={YOU.sweater} taper={false} />
      <Fill d={torso} color={YOU.sweater} at={fillAt(at)} offset={[0.6, 0.4]} />
      <Ink d={torso + legL + legR} at={at} width={ink} />
      <Fill d={blob(headC[0], headC[1], headR, headR * 1.05, {seed: `${seed}/h`})} color={YOU.hair} at={fillAt(at, 0.03)} offset={[0.5, 0.4]} />
      <Ink d={ellipse(headC[0], headC[1], headR, headR * 1.05, {seed: `${seed}/hI`})} at={b(at, 0.03)} width={ink} />
      <Fill d={blob(handP[0], handP[1], 3.2 * u, 3.2 * u, {seed: `${seed}/hand`})} color={YOU.skin} at={fillAt(at, 0.04)} offset={false} />
      {stick ? <MemoryStick x={handP[0] + 4 * u} y={handP[1] - stickW * 0.22} w={stickW} rot={-12} at={b(at, 0.06)} seed={`${seed}/stick`} ink={1.8} /> : null}
    </>
  );
};

/** A sweater-sleeve rib (for lanes drawing a cut-off arm, e.g. a hand reaching in). */
export const youColors = YOU;
void XG;
void mat;

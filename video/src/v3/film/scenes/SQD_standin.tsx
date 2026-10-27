// SQD_standin (REVEAL lane): STAND-INS for the shared pieces SQD draws but does not own (docs/v3/flow_v2.md §3), laid
// exactly to flow_v2's H2 numbers so the move lands where the real pieces will be:
//   OutsideTown / OutsideStreet  for `outside.tsx` (the WINDOW lane): the town 930-1040 with the road from our street
//                                (x ~300) up to the DC; our street 1040-1250 (the factory wall x 330-950, its lit gate
//                                x 480-640, the booth, the floodlight's pool (560, 1200) rx 230 ry 55, the notice board
//                                x 680-880, the waiting lane x 720-940, the DC trucks standing in the pool, the van unlit)
//   H2Window                     for `h2_window.tsx` (the window from inside: the sill 1250-1292, the room below it)
//   FrontPlane                   for `thread_plane.tsx` (the phone and the tag rising into LEFT 22.45-22.95)
// Each is swapped for its owner's piece as soon as it is committed (SQD.tsx imports them in one place). Tier C
// throughout (the street is environment until SQE's beats), the street rig's light (the open sky the key, the gate's
// floodlight the one practical: its pool, contact shadows under all that stands). H2 px.
import React from 'react';
import {ease, clamp} from '../../../lib/time';
import {EMBER, Phone, PriceTag} from '../kit';
import {LightPool, ContactShadow, ShadowLayer, LitWindow, rectD, polyD} from '../kit/Light';
import {roofRows, RoofRowsView, type RoofRowSpec} from './S9_far';
import {T9, planeTone, mix} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);

// ---------------------------------------------------------------- the town (930-1040): roof rows climbing to the DC
const TOWN_ROWS: RoofRowSpec[] = Array.from({length: 6}, (_, i) => {
  const haze = ((5 - i) / 5) * 0.3;
  return {
    y: 952 + i * 17,
    w: 13 + i * 4.6,
    dark: planeTone(i < 3 ? T9.midDark : T9.nmDark, haze),
    light: planeTone(i < 3 ? T9.midLight : T9.nmLight, haze * 0.6),
    dot: i < 3 ? T9.midDot : T9.nmWin,
    dotEvery: 3,
    chimEvery: 4,
    x0: -120,
    x1: 1260,
    tall: 0.16,
  };
});
const BACK = roofRows(TOWN_ROWS.slice(0, 3), 'sqd/townB');
const FRONT = roofRows(TOWN_ROWS.slice(3), 'sqd/townF');
/** The road up to the DC: from our street (x ~300, y 1040) to the DC's gate (~(372, 962)), narrowing with distance. */
export const ROAD: {pts: Pt[]; w: [number, number]} = {pts: [[300, 1046], [318, 1012], [346, 986], [372, 962]], w: [30, 7]};
export const roadAt = (u: number): {p: Pt; w: number} => {
  const P = ROAD.pts;
  const s = clamp(u) * (P.length - 1);
  const i = Math.min(P.length - 2, Math.floor(s));
  const k = s - i;
  return {p: [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k], w: ROAD.w[0] + (ROAD.w[1] - ROAD.w[0]) * clamp(u)};
};
const ROAD_D = (() => {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let k = 0; k <= 24; k++) {
    const {p, w} = roadAt(k / 24);
    L.push([p[0] - w / 2, p[1]]);
    R.push([p[0] + w / 2, p[1]]);
  }
  return polyD([...L, ...R.reverse()]);
})();

/** The town plane; `onRoad` draws on the road between the back rows and the front ones (the trucks). */
export const OutsideTown: React.FC<{onRoad?: React.ReactNode}> = ({onRoad}) => (
  <>
    <path d={rectD(-200, 955, 1500, 120)} fill={planeTone(T9.midDark, 0.18)} />
    <RoofRowsView rows={TOWN_ROWS.slice(0, 3)} paths={BACK} />
    <path d={ROAD_D} fill={mix(EMBER.road, EMBER.skyLow, 0.25)} />
    {onRoad}
    <RoofRowsView rows={TOWN_ROWS.slice(3)} paths={FRONT} />
  </>
);

// ---------------------------------------------------------------- our street (1040-1250, and our kerb below it)
const STREET = {
  ground: '#C9CFE6',
  wall: EMBER.brick,
  wallTop: '#B0573A',
  gate: [480, 1010, 160, 80] as [number, number, number, number],
  pool: {cx: 560, cy: 1200, rx: 230, ry: 55},
  board: [680, 1010, 200, 110] as [number, number, number, number],
};
/** The houses of our street either side of the factory (flat fronts, lit panes, snow on the eaves). */
const HOUSES: {x: number; w: number; top: number; win: [number, number][]}[] = [
  {x: -40, w: 170, top: 960, win: [[10, 1000], [70, 1000], [10, 1050]]},
  {x: 130, w: 205, top: 985, win: [[160, 1020], [250, 1020], [205, 1062]]},
  {x: 950, w: 180, top: 970, win: [[985, 1010], [1050, 1010]]},
];
/** A DC truck (H2 px; x = its left, y = its wheels' ground line, w its length): the data center's blue, cab right. */
export const truckD = (x: number, y: number, w: number) => {
  const h = w * 0.42;
  const box = rectD(x, y - h, w * 0.72, h * 0.86);
  const cab = polyD([[x + w * 0.74, y - h * 0.62], [x + w * 0.9, y - h * 0.62], [x + w, y - h * 0.3], [x + w, y - h * 0.14], [x + w * 0.74, y - h * 0.14]]);
  const wheels = [0.14, 0.56, 0.86].map((u) => {
    const r = w * 0.07;
    const cx = x + w * u;
    const cy = y - r;
    return `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
  }).join('');
  const win = polyD([[x + w * 0.79, y - h * 0.55], [x + w * 0.88, y - h * 0.55], [x + w * 0.95, y - h * 0.34], [x + w * 0.79, y - h * 0.34]]);
  const roofLit = rectD(x, y - h - 1, w * 0.72, Math.max(1.2, h * 0.08));
  return {box, cab, wheels, win, roofLit};
};
const Truck: React.FC<{x: number; y: number; w: number; lit?: boolean}> = ({x, y, w, lit = true}) => {
  const g = truckD(x, y, w);
  return (
    <>
      <path d={g.box} fill={EMBER.dc} />
      <path d={g.cab} fill={EMBER.dcSide} />
      <path d={g.roofLit} fill={EMBER.frost} />
      <path d={g.wheels} fill={EMBER.dcDark} />
      <path d={g.win} fill={lit ? EMBER.led : EMBER.dcDark} />
    </>
  );
};
export {Truck};

export const OutsideStreet: React.FC = () => {
  const [gx, gy, gw, gh] = STREET.gate;
  const [bx, by, bw, bh] = STREET.board;
  return (
    <>
      {/* the ground: our street's snow from the factory's foot down past our kerb */}
      <path d={rectD(-200, 1080, 1500, 700)} fill={STREET.ground} />
      {HOUSES.map((h, i) => (
        <React.Fragment key={i}>
          <path d={rectD(h.x, h.top, h.w, 1100 - h.top)} fill={i === 2 ? '#8E6A86' : '#A0788C'} />
          <path d={polyD([[h.x - 8, h.top + 2], [h.x + h.w / 2, h.top - 34], [h.x + h.w + 8, h.top + 2]])} fill={EMBER.frost} />
          {h.win.map(([wx, wy], k) => (
            <LitWindow key={k} rect={[wx, wy, 26, 30]} />
          ))}
        </React.Fragment>
      ))}
      {/* the chip factory's wall, its coping lit by the sky, the lit gate */}
      <path d={rectD(330, 1000, 620, 92)} fill={STREET.wall} />
      <path d={rectD(326, 994, 628, 8)} fill={EMBER.snow} />
      <path d={rectD(gx, gy, gw, gh)} fill="#F6E4CA" />
      <path d={rectD(gx + 10, gy + 18, gw - 20, gh - 18)} fill="#EADBD2" />
      {/* the booth on the gate's left and its lit pane; the floodlight over the gate */}
      <path d={rectD(424, 1030, 46, 62)} fill="#B88A8E" />
      <path d={rectD(420, 1024, 54, 8)} fill={EMBER.snow} />
      <LitWindow rect={[432, 1042, 30, 20]} />
      <path d={rectD(548, 990, 24, 10)} fill={EMBER.dcSide} />
      <path d={rectD(551, 999, 18, 4)} fill="#FFF3DE" />
      {/* the notice board on its two posts (blank until SQE's 5x) */}
      <path d={rectD(bx + 22, by + bh, 8, 40) + rectD(bx + bw - 30, by + bh, 8, 40)} fill={EMBER.dcSide} />
      <path d={rectD(bx, by, bw, bh)} fill="#E9E2EC" />
      <path d={rectD(bx, by - 5, bw, 6)} fill={EMBER.snow} />
      {/* the floodlight's pool on the snow (two flat steps, lighter and warmer than the ground) */}
      <LightPool pool={STREET.pool} colors={['#EADBD2', '#F6E4CA']} />
      {/* the waiting lane (trodden snow) */}
      <path d={rectD(720, 1140, 220, 100)} fill={EMBER.road} />
      <ShadowLayer>
        <ContactShadow x={545} y={1186} w={150} h={14} />
        <ContactShadow x={640} y={1168} w={120} h={12} />
        <ContactShadow x={815} y={1212} w={110} h={14} />
        <ContactShadow x={447} y={1092} w={50} h={8} />
      </ShadowLayer>
      {/* the DC trucks already standing in the pool (SQE's first beat), the van waiting unlit in the lane */}
      <Truck x={590} y={1166} w={110} />
      <Truck x={470} y={1184} w={150} />
      <path d={rectD(762, 1166, 104, 44)} fill="#8C8FA8" />
      <path d={rectD(840, 1176, 26, 20)} fill="#6F7391" />
      <path d={`M774 1210a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M836 1210a9 9 0 1 0 18 0a9 9 0 1 0 -18 0`} fill={EMBER.dcDark} />
      {/* our kerb (the near edge of the street) */}
      <path d={rectD(-200, 1250, 1500, 10)} fill={EMBER.frost} />
    </>
  );
};

// ---------------------------------------------------------------- the window from inside (h2_window stand-in)
/** The glass's frame and the sill (H2 px), the room's wall below it in the nook's warm night ambient. */
export const H2Window: React.FC = () => (
  <>
    <path d={rectD(-400, 1292, 1880, 900)} fill="#E8CDBE" />
    <path d={rectD(-400, 1250, 1880, 22)} fill={EMBER.sillTop} />
    <path d={rectD(-400, 1272, 1880, 20)} fill={EMBER.sillFront} />
    <path d={rectD(-400, 1292, 1880, 12)} fill="#D8B4A4" />
    <path d={rectD(-60, -200, 70, 1450) + rectD(1070, -200, 70, 1450)} fill={EMBER.trim} />
  </>
);

// ---------------------------------------------------------------- the thread plane's rise into LEFT (stand-in)
/** The phone and the tag rise from below into LEFT 22.45-22.95 (screen px, film time T). */
export const FrontPlane: React.FC<{T: number}> = ({T}) => {
  const u = ease.inOutCubic(clamp((T - 22.45) / 0.5));
  if (u <= 0) return null;
  const dy = (1 - u) * 860;
  return (
    <g transform={`translate(0 ${f1(dy)})`}>
      <Phone x={20} y={1100} w={320} rot={-3} price="$1,079" seed="sqd/phone" />
      <PriceTag x={36} y={1348} w={288} rot={-6} value="$1,079" seed="sqd/tag" />
    </g>
  );
};

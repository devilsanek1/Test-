// S10_near (S10 / S14 G5b): the near plane of the queue set. The road dressed in its perspective (kerbs with gaps,
// snowbanks, two tyre tracks, lane dashes, a steaming manhole, footprints on both pavements) with warm lamp pools;
// the wire with sparrows over the left street (they lift when the second data center cuts in, S14); the forecourt
// on the near right (the bus stop with three waiting, a bench under snow, a bin, a bike on the yard fence, a tall lamp
// post cut by the frame, a hydrant on the kerb) and the front row: a parent, a kid who points up the queue and a
// third with a coffee, their backs cut by the bottom edge. Pip rides on the van's roof (VanLife, inside the van's
// group so the S14 shove carries it): looking up the queue, snow slowly capping its head.
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {blob, rect as rectInk} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {BackRow, Bike3, BusStop, EMBER, Exhaust, Pip3, RoadDress, SnowCap, W, Wire3, ring} from '../kit';
import type {BackRowPerson, PipPoseKey, Pt} from '../kit';
import {P, X_ROAD_L, X_ROAD_R, kAtZ, mixHex, quad, type QueueBeats} from './S10_geo';
import {HALO_SNOW, QLamp, type Item} from './S10_left';

// ---------------------------------------------------------------- the road

const roadL = (y: number) => 832 - 1.452 * (y - 856);
const roadR = (y: number) => 912 - 0.649 * (y - 856);
const ROAD = {yB: 1990, yT: 856, xBL: roadL(1990), xBR: roadR(1990), xTL: 832, xTR: 912};

/** The road's dressing and the lamp pools (drawn right over the road band, under everything standing). */
export const RoadGround: React.FC = () => {
  const pools: React.ReactNode[] = [];
  // warm pools under the lamps (flat steps), on the pavements and the road's edges
  [
    {z: 20, X: X_ROAD_L - 0.5, r: 3.2},
    {z: 28, X: X_ROAD_L - 0.5, r: 2.8},
    {z: 15.5, X: -0.6, r: 3.4},
  ].forEach((p, i) => {
    const k = kAtZ(p.z);
    const [x, y] = P(p.X, k, 0);
    pools.push(<ellipse key={`o${i}`} cx={x} cy={y} rx={p.r * k} ry={p.r * k * 0.3} fill={mixHex(EMBER.road, EMBER.ring, 0.4)} />);
    pools.push(<ellipse key={`i${i}`} cx={x} cy={y} rx={p.r * k * 0.55} ry={p.r * k * 0.16} fill={mixHex(EMBER.snow, EMBER.ring, 0.45)} />);
  });
  return (
    <>
      <RoadDress road={ROAD} fill={false} manhole={{u: 0.78, d: 0.05, steam: true}} seed="q/road" />
      {pools}
      <Slush />
    </>
  );
};

/** Slush and grit on the near road: short darker strokes and specks along the tracks (texture on the big field). */
const Slush: React.FC = () => {
  const r = rng('q/slush');
  let d = '';
  for (let i = 0; i < 46; i++) {
    const y = r.range(1250, 1910);
    const xl = Math.max(-40, roadL(y));
    const xr = roadR(y);
    const x = r.range(xl + 20, xr - 20);
    const k = (y - 756) / 10.6;
    const len = r.range(0.4, 1.4) * k;
    d += `M${x.toFixed(0)} ${y.toFixed(0)}l${(len * 0.55).toFixed(1)} ${(-len * 0.5).toFixed(1)}`;
  }
  return <path d={d} stroke={mixHex(EMBER.road, EMBER.dcSide, 0.25)} strokeWidth={2.2} strokeLinecap="round" />;
};

// ---------------------------------------------------------------- forecourt props

const Bench: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 0.36;
  return (
    <>
      <rect x={x - w / 2} y={y - h * 0.62} width={w} height={h * 0.14} fill={EMBER.beam} />
      <rect x={x - w / 2} y={y - h} width={w} height={h * 0.12} fill={EMBER.beam} />
      <rect x={x - w / 2} y={y - h * 0.8} width={w} height={h * 0.1} fill={EMBER.beam} />
      <path d={`M${x - w * 0.42} ${y - h * 0.5}v${h * 0.5}M${x + w * 0.42} ${y - h * 0.5}v${h * 0.5}`} stroke={EMBER.anchor} strokeWidth={Math.max(2, w * 0.03)} />
      <path d={blob(x, y - h * 0.64, w * 0.48, h * 0.1 + 2, {seed: `${seed}/s1`}) + blob(x, y - h * 1.02, w * 0.46, h * 0.07 + 1.5, {seed: `${seed}/s2`})} fill={EMBER.snow} />
      <Ink d={`M${x - w / 2} ${y - h * 0.62}h${w}M${x - w / 2} ${y - h}h${w}`} width={W.far} />
    </>
  );
};

const Bin: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 1.35;
  return (
    <>
      <rect x={x - w * 0.06} y={y - h * 1.25} width={w * 0.12} height={h * 1.25} fill={EMBER.dcSide} />
      <path d={`M${x - w / 2} ${y - h}h${w}l${-w * 0.08} ${h * 0.9}h${-w * 0.84}Z`} fill={EMBER.dc} />
      <path d={`M${x - w * 0.36} ${y - h * 0.62}h${w * 0.72}`} stroke={EMBER.dcSide} strokeWidth={1.6} />
      <SnowCap x={x - w * 0.54} y={y - h} w={w * 1.08} h={w * 0.16} seed={`${seed}/sn`} />
      <Ink d={rectInk(x - w / 2, y - h, w, h * 0.9, {seed: `${seed}/i`, over: [0, 1]})} width={W.far} />
    </>
  );
};

/** A fire hydrant on the near kerb (cream with a terracotta cap, snow on top). Base centre on y. */
const Hydrant: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const w = h * 0.44;
  return (
    <>
      <path d={`M${x - w / 2} ${y}V${y - h * 0.72}Q${x} ${y - h * 0.98} ${x + w / 2} ${y - h * 0.72}V${y}Z`} fill={EMBER.wall} />
      <rect x={x - w * 0.8} y={y - h * 0.56} width={w * 1.6} height={h * 0.13} fill={EMBER.pot} />
      <rect x={x - w * 0.6} y={y - h * 0.08} width={w * 1.2} height={h * 0.08} fill={EMBER.pot} />
      <path d={blob(x, y - h * 0.92, w * 0.42, h * 0.07 + 1, {seed: `${seed}/s`})} fill={EMBER.snow} />
      <Ink d={`M${x - w / 2} ${y}V${y - h * 0.72}Q${x} ${y - h * 0.98} ${x + w / 2} ${y - h * 0.72}V${y}`} width={W.mid} />
    </>
  );
};

// ---------------------------------------------------------------- the front row

const FRONT_TOP = 1482;
const frontRow = (beats: QueueBeats) => {
  const people: BackRowPerson[] = [
    {hair: 'bun', wear: ['bag'], coat: '#6B4A6E', coatDetail: ['quilt', 'yoke'], sMul: 1.04, dy: 0, dx: -6},
    {hair: 'beanie', wear: ['point'], pointAt: beats.kidPointAt, coat: EMBER.pot, hat: EMBER.dcSide, coatDetail: ['quilt', 'zip'], sMul: 0.72, dy: 84, dx: -4},
    {hair: 'short', acc: ['scarf'], wear: ['coffee'], coat: EMBER.dc, coatDetail: ['quilt', 'yoke'], phoneWin: beats.phoneWin, sMul: 1.0, dy: 14, dx: 16},
  ];
  return {x0: 600, x1: 990, top: FRONT_TOP, head: 106, n: 3, seed: 'q/front', people, snow: true, lookX: 760};
};

export function nearItems(beats: QueueBeats): Item[] {
  const items: Item[] = [];
  // the wire over the left street (from off the left edge to the factory's corner), sparrows on its left half
  items.push({
    k: 31.7,
    el: <Wire3 key="wire" a={[-60, 778]} b={[648, 744]} sag={34} n={2} gap={11} birds={{us: [0.1, 0.17, 0.25, 0.31, 0.42], size: 16, liftAt: beats.birdsLiftAt, rise: 60, fly: 420}} seed="q/wire" />,
  });
  // the bus stop on the near right pavement
  {
    const z = 21;
    const k = kAtZ(z);
    const [x, y] = P(-3.5, k, 0);
    items.push({k, el: <BusStop key="bus" x={x} y={y} h={2.5 * k} people={3} turnAt={beats.busTurnAt} seed="q/bus" />});
  }
  // the bike on the yard's front fence, the bin, the bench
  {
    const k = kAtZ(30.6);
    const [x, y] = P(0.4, k, 0);
    items.push({k, el: <Bike3 key="bike" x={x} y={y} w={1.7 * k} seed="q/bike" ink={W.hair} />});
  }
  {
    const k = kAtZ(23);
    const [x, y] = P(0.6, k, 0);
    items.push({k, el: <Bin key="bin" x={x} y={y} w={0.55 * k} seed="q/bin" />});
  }
  {
    const k = kAtZ(18.2);
    const [x, y] = P(1.2, k, 0);
    items.push({k, el: <Bench key="bench" x={x} y={y} w={1.6 * k} seed="q/bench" />});
  }
  // the tall lamp post on the near right (cut by the front row)
  {
    const k = kAtZ(15.5);
    const [x, y] = P(-0.6, k, 0);
    items.push({k, el: <QLamp key="lpN" x={x} y={y} h={4.6 * k} halo={HALO_SNOW} r={[1.7, 1.05]} seed="q/lpN" ink={W.mid} />});
  }
  // the hydrant on the near kerb
  {
    const k = kAtZ(12);
    const [x, y] = P(X_ROAD_R + 0.6, k, 0);
    items.push({k, el: <Hydrant key="hyd" x={x} y={y} h={0.75 * k} seed="q/hyd" />});
  }
  // the front row (nearest of all)
  items.push({k: 400, el: <BackRow key="front" {...frontRow(beats)} />});
  return items;
}

// ---------------------------------------------------------------- the van's life (inside the van's group)

/** Pip on the van's roof, the exhaust, the headlight's beam on the road ahead and (S14) the snow shaken off the roof.
 *  `van` = the van's {x, y, w} (wheels' ground centre); everything is in the van's frame (the shove moves the group). */
export const VanLife: React.FC<{van: {x: number; y: number; w: number}; beats: QueueBeats; layer: 'under' | 'over'}> = ({van, beats, layer}) => {
  const t = useTime();
  const x0 = van.x - van.w / 2;
  const top = van.y - van.w * 0.5;
  const boxW = van.w * 0.68;
  if (layer === 'under') {
    // the beam on the road ahead (a flat step lighter than the road), the exhaust behind
    const hx = x0 + van.w * 0.99;
    const hy = top + van.w * 0.33;
    const beam = quad([
      [hx, hy + 4],
      [hx + 150, hy - 70],
      [hx + 210, hy - 40],
      [hx + 40, van.y - 4],
    ]);
    return (
      <>
        <path d={beam} fill={mixHex(EMBER.road, EMBER.snow, 0.7)} />
        <Exhaust x={x0 - 4} y={van.y - van.w * 0.06} dir={-1} size={1.1} seed="q/vanex" />
      </>
    );
  }
  // Pip: rides the roof, looking up the queue; S10 a worried jolt on "first dibs"; S14 slides and clings on the shove,
  // then shakes the snow off
  const pushAt = beats.pushAt;
  const keys: PipPoseKey[] = [{t: -1, pose: 'sit-back', look: 0.55}];
  if (beats.pipDroopAt !== undefined) keys.push({t: beats.pipDroopAt, pose: 'sit-back', look: 0.3, expression: 'worried'});
  if (pushAt !== undefined) {
    keys.push({t: pushAt + 0.02, pose: 'ears-cover', look: -0.4, expression: 'wide'});
    keys.push({t: pushAt + 0.62, pose: 'sit-back', look: 0.55});
  }
  const slide = pushAt !== undefined ? ring(t, pushAt, 30, 1.6, 4.5) : 0;
  const pipX = x0 + boxW * 0.62 + slide;
  const pipY = top - 5;
  const out: React.ReactNode[] = [
    <Pip3 key="pip" x={pipX} y={pipY} scale={0.94} keys={keys} jolts={beats.pipDroopAt !== undefined ? [beats.pipDroopAt] : undefined} outdoor snowCap={[0, 4.2]} shakeAt={beats.pipShakeAt} seed={5} />,
  ];
  // snow sliding off the roof on the shove: chunks drop off the back edge and burst on the road
  if (pushAt !== undefined && t >= pushAt) {
    const r = rng('q/vansnow');
    let d = '';
    for (let i = 0; i < 7; i++) {
      const t0 = pushAt + r.range(0, 0.18);
      const dt = t - t0;
      if (dt < 0 || dt > 0.55) continue;
      const sx = x0 + r.range(-6, boxW * 0.35);
      const sy = top - 4 + 300 * dt * dt + 40 * dt;
      const rr = r.range(4, 9) * (1 - Math.max(0, dt - 0.4) / 0.15);
      if (rr > 0.5) d += blob(sx - dt * 60, sy, rr, rr * 0.8, {seed: `q/vs${i}`});
    }
    if (d) out.push(<path key="vsnow" d={d} fill={EMBER.snow} />);
  }
  return <>{out}</>;
};


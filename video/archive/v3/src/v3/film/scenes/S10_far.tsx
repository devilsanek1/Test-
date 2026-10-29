// S10_far (S10 / S14 G5b): the far plane of the queue set, behind everything that stands on the street: cloud masses
// drifting above the caption band (y < 290), the hill town beyond the left street (rows of small houses climbing a
// pale hill, lit windows switching, chimney smoke, a road along the hill where a car passes), and the chip factory's
// works behind it on the right (an annex hall with lit sawtooth glass, two silos, a stack with smoke), all under
// y 612 so the caption band stays flat sky. Fill only or hair ink (far planes: ink by depth).
import React, {useMemo} from 'react';
import {Ink} from '../../../lib/Ink';
import {blob, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, PassingCar, SkyClouds, Smoke, TownHouse, W, windowLit} from '../kit';
import type {HouseKind, Pt} from '../kit';
import {mixHex, type QueueBeats} from './S10_geo';

const HILL = mixHex(EMBER.sky, EMBER.skyLow, 0.45);
const HILL_NEAR = mixHex(EMBER.sky, EMBER.dcSide, 0.25);
const FAR_HOUSE = mixHex(EMBER.dcSide, EMBER.sky, 0.4);
const STEEL = mixHex(EMBER.frost, EMBER.sky, 0.45);

/** The hill's top edge (screen y) at x: climbs from the factory (right) to the left edge. */
const hillY = (x: number) => 748 - (650 - Math.min(650, Math.max(-60, x))) * 0.085 + Math.sin(x * 0.012) * 6;
/** The nearer terrace of the hill (a second row of houses, lower down). */
const terraceY = (x: number) => hillY(x) + 34;

const KINDS: HouseKind[] = ['cottage', 'terrace', 'mansard', 'cottage', 'block', 'terrace', 'cottage', 'mansard'];

export const FarPlane: React.FC<{beats: QueueBeats}> = ({beats}) => {
  const t = useTime();
  const rows = useMemo(() => {
    const r = rng('q/hilltown');
    const back: {x: number; w: number; kind: HouseKind; smoke: boolean}[] = [];
    let x = -40;
    let i = 0;
    while (x < 640) {
      const w = r.range(30, 44);
      back.push({x, w, kind: KINDS[i % KINDS.length], smoke: i % 3 === 1});
      x += w + r.range(-4, 6);
      i++;
    }
    const front: {x: number; w: number; kind: HouseKind; smoke: boolean}[] = [];
    x = -20;
    i = 3;
    while (x < 620) {
      const w = r.range(38, 54);
      front.push({x, w, kind: KINDS[i % KINDS.length], smoke: i % 4 === 0});
      x += w + r.range(2, 18);
      i++;
    }
    return {back, front};
  }, []);
  // the hill silhouettes
  const hillPts: Pt[] = [];
  for (let x = -60; x <= 700; x += 20) hillPts.push([x, hillY(x)]);
  const hillD = smooth(hillPts) + 'L700 820L-60 820Z';
  const terrPts: Pt[] = [];
  for (let x = -60; x <= 700; x += 20) terrPts.push([x, terraceY(x) + 6]);
  const terrD = smooth(terrPts) + 'L700 820L-60 820Z';
  // the hill road (a pale band along the terrace) where the car passes
  const roadPts: Pt[] = [];
  for (let x = -60; x <= 700; x += 20) roadPts.push([x, terraceY(x) + 22]);
  const carT = beats.carPass;
  return (
    <>
      {/* cloud masses above the caption band, two steps: a lighter and a darker drift */}
      <SkyClouds x0={-260} x1={1340} y0={10} y1={236} n={4} w={[320, 600]} speed={9} color="#64739D" seed="q/cl1" />
      <SkyClouds x0={-260} x1={1340} y0={90} y1={250} n={2} w={[220, 380]} speed={6} color="#6B7AA5" seed="q/cl2" />
      {/* the hill town beyond the left street */}
      <path d={hillD} fill={HILL} />
      {rows.back.map((h, i) => (
        <TownHouse key={`hb${i}`} x={h.x} y={hillY(h.x + h.w / 2) + 12} w={h.w} kind={h.kind} color={FAR_HOUSE} far smoke={h.smoke} litFrac={0.55} seed={`q/hb${i}`} />
      ))}
      <path d={terrD} fill={HILL_NEAR} />
      <path d={smooth(roadPts)} fill="none" stroke={mixHex(EMBER.skyLow, EMBER.snow, 0.3)} strokeWidth={7} strokeLinecap="round" />
      {carT ? <PassingCar from={[-60, terraceY(-60) + 20]} to={[660, terraceY(660) + 20]} t0={carT[0]} t1={carT[1]} w={36} color={EMBER.beam} seed="q/hillcar" /> : null}
      {rows.front.map((h, i) => (
        <TownHouse key={`hf${i}`} x={h.x} y={terraceY(h.x + h.w / 2) + 14} w={h.w} kind={h.kind} color={mixHex(EMBER.dcSide, EMBER.sky, 0.2)} far smoke={h.smoke} litFrac={0.6} seed={`q/hf${i}`} />
      ))}
      <Works t={t} />
    </>
  );
};

/** The chip works behind the factory on the right: annex hall, silos, a stack (warm, ours; muted by distance). */
const Works: React.FC<{t: number}> = ({t}) => {
  const base = 864;
  const x0 = 908;
  const x1 = 1110;
  const top = 800;
  const teeth = 4;
  const tw = (x1 - x0) / teeth;
  const th = 22;
  const wall = mixHex(EMBER.brickShade, EMBER.sky, 0.25);
  let roof = `M${x0} ${top}`;
  let glass = '';
  let snow = '';
  for (let i = 0; i < teeth; i++) {
    const a = x0 + i * tw;
    roof += `L${a} ${top - th}L${a + tw} ${top}`;
    glass += `M${a + 2} ${top - th + 4}L${a + 2} ${top - 1}L${a + tw * 0.22} ${top - 1}Z`;
    snow += `M${a - 1} ${top - th - 2}L${a + tw + 1} ${top - 2}L${a + tw - 6} ${top + 3}L${a + 2} ${top - th + 5}Z`;
  }
  roof += `L${x1} ${base}L${x0} ${base}Z`;
  const wins: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const lit = windowLit(t, 'q/annex', i, 7, {litFrac: 0.7});
    wins.push(<rect key={i} x={x0 + 10 + i * 27} y={top + 18} width={14} height={16} fill={lit ? EMBER.houseLit : EMBER.dcDark} />);
  }
  // two silos and a stack
  const silo = (cx: number, w: number, h: number, key: string) => {
    const st = base - h;
    return (
      <g key={key}>
        <rect x={cx - w / 2} y={st} width={w} height={h} fill={STEEL} />
        <path d={`M${cx - w / 2 - 2} ${st}L${cx} ${st - w * 0.42}L${cx + w / 2 + 2} ${st}Z`} fill={EMBER.snow} />
        <path d={`M${cx - w / 2} ${st + h * 0.3}h${w}M${cx - w / 2} ${st + h * 0.6}h${w}`} stroke={mixHex(STEEL, EMBER.dcSide, 0.4)} strokeWidth={1.4} />
        <path d={`M${cx + w * 0.3} ${st + 4}v${h - 4}`} stroke={EMBER.dcSide} strokeWidth={1.2} strokeDasharray="3 4" />
      </g>
    );
  };
  return (
    <>
      {silo(1006, 36, 196, 's1')}
      {silo(1046, 34, 178, 's2')}
      <rect x={1066} y={628} width={16} height={base - 628} fill={wall} />
      <rect x={1064} y={640} width={20} height={6} fill={EMBER.snow} />
      <Smoke x={1074} y={624} seed="q/stack" rise={120} r1={14} r0={5} drift={-90} ceil={612} />
      <path d={roof} fill={wall} />
      <path d={glass} fill={EMBER.houseLit} />
      <path d={snow} fill={EMBER.snow} />
      {wins}
      <Ink d={`M${x0} ${top}L${x0} ${base}`} width={W.hair} />
      {/* a catwalk between the silos */}
      <path d={`M988 742H1066`} stroke={EMBER.dcSide} strokeWidth={2} />
      <path d={blob(1026, 741, 40, 2.5, {seed: 'q/catsn'})} fill={EMBER.snow} />
    </>
  );
};

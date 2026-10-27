// V2S4_path.tsx (lane L3, V2S4 WORLD part): her towpath plane (1.0x: paving, garden walls, lamps, bench + reader,
// planters, bin, bike, lifebuoy, coping with rings and bollards, an angler, walkers she passes, a jogger, a cyclist, a
// dog) with the post as `children` (drawn inside the plane after the props), and the canal strip y 1082-1220 (1.0x:
// water, ducks, the heron, floating leaves). v1: the kit's S4Set path layers, ported (the world build replaces them).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Batch, Paint, Pt, ovalPath, shadowInto} from '../kit/canal/core';
import {Towpath, Lamp, benchInto, binInto, planterInto, bikeInto, bollardInto} from '../kit/canal/towpath';
import {Water} from '../kit/canal/water';
import {Ducks, Heron, Movers} from '../kit/canal/life';
import * as MAP from '../world/map';
import {S4_K, s4PlaneDx} from './V2S4_rig';

const S4_PATH = {back: 860, edge: 1082, coping: 12, water: [1082, 1300] as [number, number]};

export const S4Path: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  const path = useMemo(() => {
    const b = new Batch();
    const sun: Pt = [MAP.SUN1.x, MAP.SUN1.y];
    for (const [x, y, h] of [[110, 1072, 300], [980, 1072, 300], [330, 1062, 70], [205, 1066, 48], [820, 1066, 70], [1180, 1066, 70]] as [number, number, number][]) shadowInto(b, x, y, Math.max(10, h * 0.08), h * 0.9, sun, CM.stoneShade, 0.25);
    b.layer();
    benchInto(b, 330, 1062, 150, 'side', 's4bench');
    binInto(b, 205, 1066, 48, 's4bin');
    planterInto(b, 760, 880, 1062, 46, 's4pl1');
    planterInto(b, 1120, 1240, 1062, 46, 's4pl2');
    bikeInto(b, 1040, 1066, 26, 's4bike', CM.coatMustard, -1);
    b.rect(CM.line, 46, 980, 8, 92);
    b.fill(CM.box, ovalPath(50, 1004, 24, 24));
    b.fill(CM.paving, ovalPath(50, 1004, 12, 12));
    for (const x of [260, 640, 900]) bollardInto(b, x, 1080, 24, `s4bol${x}`);
    return b;
  }, []);
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.path, t), 0)}>
      <Towpath x0={-200} x1={1500} top={S4_PATH.back} edge={S4_PATH.edge} coping={S4_PATH.coping} seed="s4path" leaves={22} ink={INK_PX.far} rings={[120, 470, 980]} />
      <Lamp x={110} y={1072} h={300} seed="s4lamp1" />
      <Lamp x={980} y={1072} h={300} seed="s4lamp2" />
      <Paint b={path} seed="s4pathprops" />
      <Movers
        idPrefix="s4w"
        movers={[
          {pose: 'walk', from: [-60, 1068], to: [1460, 1068], h: 160, speed: 52, phase: 0.15, seed: 's4wE', acc: 'bag'},
          {pose: 'cycle', from: [1480, 1070], to: [-100, 1070], h: 165, speed: 190, phase: 0.6, pause: 3, seed: 's4cyc'},
        ]}
      />
      {children}
    </XG>
  );
};

export const S4Canal: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.canal, t), 0)}>
      <Water y0={S4_PATH.water[0]} y1={S4_PATH.water[1]} x0={-100} x1={1500} seed="s4water" bankShade={0} reflTop={S4_PATH.edge + 6} reflections={[{x0: 360, x1: 1400, color: CM.brickLight, depth: 70}, {x0: 100, x1: 330, color: CM.brickDeep, depth: 50}, {x0: 90, x1: 130, color: CM.anchor, depth: 60}]} ripples={24} glints={12} />
      <Ducks ducks={[{x: 860, y: 1150, size: 26, vx: -12, drake: true}, {x: 910, y: 1162, size: 24, vx: -12}]} seed="s4ducks" x0={-100} x1={1500} />
      <Heron x={420} y={1112} h={92} face={-1} seed="s4heron" />
    </XG>
  );
};

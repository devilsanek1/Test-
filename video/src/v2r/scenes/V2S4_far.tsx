// V2S4_far.tsx (lane L3, V2S4 WORLD part): the far band behind her towpath, drawn at the 17.96 pose and slid by its
// plane's truck offset (V2S4_rig `s4PlaneDx`). S4Far (0.3x): far roof rows, the gasholder frame the sun is seen through,
// the viaduct with a train, aerials with birds (the flock that flies WEST into the sun at 19.80). S4Backs (0.6x): the
// terrace backs over garden walls (rear windows, extensions, a washing line, a tree, ivy, pigeons, chimney smoke).
// v1: the kit's S4Set far layers, ported (the world build replaces them).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Batch, Paint} from '../kit/canal/core';
import {roofRowInto, gasholderInto, viaductInto, warehouseInto, ViaductTrain} from '../kit/canal/far';
import {terraceBacksInto} from '../kit/canal/terrace';
import {Birds, Puffs} from '../kit/canal/life';
import {S4_BEATS, S4_K, s4PlaneDx} from './V2S4_rig';

const BACK = 860;

export const S4Far: React.FC = () => {
  const t = useTime();
  const far = useMemo(() => {
    const b = new Batch();
    gasholderInto(b, 250, 790, 118, 172, 's4gas1', {ink: 1.6});
    gasholderInto(b, 470, 800, 90, 150, 's4gas2', {drum: 1, ink: 1.4});
    b.layer();
    roofRowInto(b, {x0: -80, x1: 1300, base: 840, top: 712, spread: 22, seed: 's4roofs', walls: [CM.stoneShade, CM.limestone, CM.brickLight], roof: CM.shadeCool, wRange: [50, 120], win: 6});
    b.layer();
    viaductInto(b, -80, 1300, 772, 860, 96, 's4via', INK_PX.hair);
    return b;
  }, []);
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.far, t), 0)}>
      <Paint b={far} seed="s4far" />
      <ViaductTrain x0={-80} x1={1300} deck={769} h={20} seed="s4train" speed={140} every={11} phase={0.5} />
      <Birds from={[700, 784]} to={[1000, 790]} n={6} size={10} seed="s4birds" liftAt={[S4_BEATS.birdsWest]} dir={-1} />
    </XG>
  );
};

export const S4Backs: React.FC = () => {
  const t = useTime();
  const backs = new Batch();
  terraceBacksInto(backs, 360, 1400, BACK + 4, 664, 's4backs', t, 0.25);
  warehouseInto(backs, -60, BACK + 4, 200, 230, 's4ware', {ink: INK_PX.hair, lit: 0.2, t});
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.backs, t), 0)}>
      <Paint b={backs} seed="s4backs" />
      <Puffs x={566} y={668} seed="s4chim" kind="smoke" scale={0.5} drift={-24} ceil={600} />
    </XG>
  );
};

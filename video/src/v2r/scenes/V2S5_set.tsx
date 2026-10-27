// V2S5_set.tsx (lane L4): the S5 set on the crane, forked from kit/dc/CraneSet.tsx (same planes, ease, wipe and swap)
// so the shot can put its own layers between the kit's: the shot's far plane (V2S5_far), the deck's extra dressing
// and people (V2S5_deck), the start-only near foreground and top fringe (V2S5_start), the figures (V2S5_figs), the
// news box and the plaque (V2S5_text). Every plane rides ONE progress p (kit/dc/crane.ts craneP).
// Draw order: far -> far life -> river -> mid -> near-mid -> deck -> figures -> bench -> news box -> terrace tree ->
// end lamppost -> wipe -> start foreground -> petals.
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {PullLayer, boxMat} from '../../v3/film/kit/Pullback';
import {MID_PL, NEAR_MID_PL, T1_BOX, L2_BOX, WIPE, wipeMat} from '../kit/dc/crane';
import {RiverPlane} from '../kit/dc/vista';
import {MidGround, NearMid} from '../kit/dc/valley';
import {Pentagon} from '../kit/dc/pentagon';
import {Terrace, StrangerBench, TerraceTree, CornerTree, LampPost, LAMP_RIGHT, NearPetals, Pigeons} from '../kit/dc/terrace';
import {Gulls, BirdV} from '../kit/dc/life';
import {CRANE_T, craneP, DECK, planeMat, startMat, swapAt, FAR_S5, RIVER_S5} from './V2S5_rig';
import {S5Far, S5FarLife} from './V2S5_far';
import {FiguresStart, FiguresEnd} from './V2S5_figs';
import {NewsBox, Plaque} from './V2S5_text';

export const S5Set: React.FC<{p?: number}> = ({p: pIn}) => {
  const t = useTime();
  const p = pIn ?? craneP(t);
  const swapped = pIn !== undefined ? pIn >= 0.47 : t >= swapAt;
  return (
    <>
      <PullLayer m={planeMat(FAR_S5, p)}>
        <S5Far />
      </PullLayer>
      <S5FarLife />
      <Gulls centre={[700, 720]} r={[220, 36]} />
      <BirdV at={CRANE_T.t0 + 0.75 * (CRANE_T.t1 - CRANE_T.t0)} from={[-120, 760]} to={[700, 640]} dur={2.4} span={30} />
      <PullLayer m={planeMat(RIVER_S5, p)}>
        <RiverPlane />
      </PullLayer>
      <PullLayer m={planeMat(MID_PL, p)}>
        <MidGround />
        <Pentagon warmAt={CRANE_T.warm} />
      </PullLayer>
      <PullLayer m={startMat(NEAR_MID_PL, p)}>
        <NearMid burstAt={CRANE_T.april} />
      </PullLayer>
      <PullLayer m={planeMat(DECK, p)}>
        <Terrace />
        <Pigeons />
        <Plaque at={1.88} />
        {swapped ? <FiguresEnd /> : null}
      </PullLayer>
      {swapped ? null : (
        <PullLayer m={startMat(DECK, p)}>
          <FiguresStart />
        </PullLayer>
      )}
      <PullLayer m={planeMat(DECK, p)}>
        <StrangerBench />
      </PullLayer>
      <PullLayer m={startMat(DECK, p)}>
        <NewsBox />
      </PullLayer>
      <PullLayer m={boxMat(T1_BOX, p)}>
        <TerraceTree burstAt={CRANE_T.april} />
      </PullLayer>
      <PullLayer m={boxMat(L2_BOX, p)}>
        <CornerTree />
        <XG m={[1, 0, 0, 1, LAMP_RIGHT.x, LAMP_RIGHT.base]}>
          <LampPost h={LAMP_RIGHT.h} />
        </XG>
      </PullLayer>
      {p > 0.02 && p < 0.75 ? (
        <XG m={wipeMat(p)}>
          <LampPost h={WIPE.h} basket seed="wipe" />
        </XG>
      ) : null}
      <NearPetals n={10} />
    </>
  );
};

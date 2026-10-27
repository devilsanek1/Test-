// V2S5_set.tsx (lane L4): the S5 set on the crane, forked from kit/dc/CraneSet.tsx (same planes, ease, wipe and swap)
// so the shot can put its own layers between the kit's: the shot's far plane (V2S5_far), the deck's extra dressing
// and people (V2S5_deck), the start-only near foreground and top fringe (V2S5_start), the figures (V2S5_figs), the
// news box and the plaque (V2S5_text). Every plane rides ONE progress p (kit/dc/crane.ts craneP).
// Slots (one owner file each): V2S5_far, V2S5_river, V2S5_mid, V2S5_deck, V2S5_start, V2S5_figs, V2S5_text.
// Draw order: start back -> far -> far life -> river -> mid -> near-mid -> deck -> figures -> bench -> news box -> terrace tree ->
// end lamppost -> wipe -> start foreground -> petals.
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {PullLayer, boxMat} from '../../v3/film/kit/Pullback';
import {MID_PL, NEAR_MID_PL, T1_BOX, L2_BOX, WIPE, wipeMat} from '../kit/dc/crane';
import {NearMid} from '../kit/dc/valley';
import {StrangerBench, TerraceTree, CornerTree, LampPost, LAMP_RIGHT, NearPetals} from '../kit/dc/terrace';
import {S5River, RIVER_PL} from './V2S5_river';
import {S5Mid} from './V2S5_mid';
import {S5Deck, S5DeckOver, S5NearEnd} from './V2S5_deck';
import {S5StartBack, S5StartFore} from './V2S5_start';
import {Gulls, BirdV} from '../kit/dc/life';
import {CRANE_T, craneP, DECK, planeMat, startMat, swapAt, FAR_S5} from './V2S5_rig';
import {S5Far, S5FarLife} from './V2S5_far';
import {FiguresStart, FiguresEnd} from './V2S5_figs';
import {NewsBox, Plaque} from './V2S5_text';

export const S5Set: React.FC<{p?: number}> = ({p: pIn}) => {
  const t = useTime();
  const p = pIn ?? craneP(t);
  const swapped = pIn !== undefined ? pIn >= 0.47 : t >= swapAt;
  return (
    <>
      <S5StartBack p={p} />
      <PullLayer m={planeMat(FAR_S5, p)}>
        <S5Far />
      </PullLayer>
      <S5FarLife />
      <Gulls centre={[700, 720]} r={[220, 36]} />
      <BirdV at={CRANE_T.t0 + 0.75 * (CRANE_T.t1 - CRANE_T.t0)} from={[-120, 760]} to={[700, 640]} dur={2.4} span={30} />
      <PullLayer m={planeMat(RIVER_PL, p)}>
        <S5River />
      </PullLayer>
      <PullLayer m={planeMat(MID_PL, p)}>
        <S5Mid />
      </PullLayer>
      <PullLayer m={startMat(NEAR_MID_PL, p)}>
        <NearMid burstAt={CRANE_T.april} />
      </PullLayer>
      <PullLayer m={planeMat(DECK, p)}>
        <S5Deck />
        <Plaque at={1.88} />
        {swapped ? <FiguresEnd /> : null}
        <S5DeckOver />
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
      <S5NearEnd p={p} />
      <NearPetals n={10} />
      <S5StartFore p={p} />
    </>
  );
};

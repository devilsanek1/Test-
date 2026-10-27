// dc/CraneSet.tsx: the S5 set, assembled on the crane rig (crane.ts): every Arlington plane in its PullLayer on ONE
// progress, plus slots for the cast (K4), Pip (K5), the news box and the plaque (K3). Lane L4 owns S5; this is the
// set it builds on (and what the kit's CraneEnd / CraneMove compositions render).
//
//   <World stage="context" sky={...}>                      // or any parent; it draws its own sky slab if `sky`
//     <CraneSet
//       figuresStart={<>stranger + Pip in START coords</>}   // drawn through startMat(DECK) until swapAt
//       figuresEnd={<>tiny stranger + Pip in END coords</>}  // drawn in the deck plane from swapAt
//       deckStart={<NewsBox .../>}                          // START coords (the contract's box x 470-780, y 880-1230)
//       deckEnd={<><Plaque .../><terrace people/></>}        // END coords
//     />
// Draw order: far -> birds -> river -> mid -> near-mid -> deck -> terrace tree -> end lamppost -> wipe -> petals.

import React from 'react';
import {useTime} from '../../../lib/time';
import {PullLayer, planeMat, boxMat, startMat} from '../../../v3/film/kit/Pullback';
import {XG} from '../../../lib/xf';
import {CRANE_T, craneP, FAR, RIVER, MID_PL, NEAR_MID_PL, DECK, T1_BOX, L2_BOX, WIPE, wipeMat, swapAt} from './crane';
import {FarPlane, RiverPlane, VISTA} from './vista';
import {MidGround} from './valley';
import {NearMid} from './valley';
import {Pentagon} from './pentagon';
import {Terrace, StrangerBench, TerraceTree, CornerTree, LampPost, LAMP_RIGHT, NearPetals, Pigeons} from './terrace';
import {BirdV, Gulls} from './life';
import {CM} from '../../palette';
import {tiered, Slot} from '../tiers';

export type CraneSetProps = {
  /** Override the progress (sheets, stills). Default: craneP(scene time). */
  p?: number;
  figuresStart?: React.ReactNode;
  figuresEnd?: React.ReactNode;
  deckStart?: React.ReactNode;
  deckEnd?: React.ReactNode;
  /** The lamppost wipe across the backs (default on). */
  wipe?: boolean;
  /** Draw the flat mint sky slab here (when no World sky is behind it). */
  sky?: boolean;
  /** Override the swap time (scene s). */
  swap?: number;
};

const CraneSetBody: React.FC<CraneSetProps> = ({p: pIn, figuresStart, figuresEnd, deckStart, deckEnd, wipe = true, sky = false, swap = swapAt}) => {
  const t = useTime();
  const p = pIn ?? craneP(t);
  const swapped = pIn !== undefined ? pIn >= 0.47 : t >= swap;
  return (
    <>
      {sky ? <rect x={-50} y={-50} width={1180} height={2020} fill={CM.sky} /> : null}
      <PullLayer m={planeMat(FAR, p)}>
        <FarPlane sun={{flip: CRANE_T.flip}} />
      </PullLayer>
      <Gulls centre={[700, 720]} r={[220, 36]} />
      <BirdV at={CRANE_T.t0 + 0.75 * (CRANE_T.t1 - CRANE_T.t0)} from={[-120, 760]} to={[700, 640]} dur={2.4} span={30} />
      <PullLayer m={planeMat(RIVER, p)}>
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
        <Slot>{deckEnd}</Slot>
        <Slot>{swapped ? figuresEnd : null}</Slot>
      </PullLayer>
      {swapped ? null : <PullLayer m={startMat(DECK, p)}><Slot>{figuresStart}</Slot></PullLayer>}
      <PullLayer m={planeMat(DECK, p)}>
        <StrangerBench />
      </PullLayer>
      <PullLayer m={startMat(DECK, p)}><Slot>{deckStart}</Slot></PullLayer>
      <PullLayer m={boxMat(T1_BOX, p)}>
        <TerraceTree burstAt={CRANE_T.april} />
      </PullLayer>
      <PullLayer m={boxMat(L2_BOX, p)}>
        <CornerTree />
        <XG m={[1, 0, 0, 1, LAMP_RIGHT.x, LAMP_RIGHT.base]}>
          <LampPost h={LAMP_RIGHT.h} />
        </XG>
      </PullLayer>
      {wipe && p > 0.02 && p < 0.75 ? (
        <XG m={wipeMat(p)}>
          <LampPost h={WIPE.h} basket seed="wipe" />
        </XG>
      ) : null}
      <NearPetals n={10} />
    </>
  );
};
export const CraneSet = tiered('environment', {}, CraneSetBody);

void VISTA;

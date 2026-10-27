// V2S4_her.tsx (lane L3, V2S4 STORY part): HER, screen-fixed at x 720 while the world trucks: walking LEFT in profile
// (steps = travel / 62 px: the feet never slide), slowing with the truck, stopping on "objected" (17.96) and looking
// west along the post (stopLook). STUB (v0): the story build refines it.
import React from 'react';
import {useTime} from '../../lib/time';
import {Her, strideFor} from '../kit/cast';
import {S4_BEATS, S4_HER, s4HerSteps} from './V2S4_rig';

export const S4Her: React.FC = () => {
  const t = useTime();
  if (t >= S4_BEATS.stop) return <Her x={S4_HER.x} y={S4_HER.feetY} h={S4_HER.h} pose="stopLook" seed="s4her" />;
  return <Her x={S4_HER.x} y={S4_HER.feetY} h={S4_HER.h} pose="walk" view="profile" step={s4HerSteps(t)} stride={strideFor(S4_HER.stepPx, S4_HER.h)} seed="s4her" />;
};

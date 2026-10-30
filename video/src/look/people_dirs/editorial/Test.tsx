// Editorial people: a quick test frame (the 8 figures at 640 px), for iterating on the drawing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EdPerson, type Finish} from './Person';
import {HER_EVENING, HER_WEEKEND, MAN_SUEDE, WOMAN_SHIRT} from './cast';
import {POSES} from './poses';

export const TEST_W = 2400;
export const TEST_H = 900;

export const EdTest: React.FC<{finish?: Finish; h?: number}> = ({finish = 'gradient', h = 640}) => {
  const items = [
    {p: HER_EVENING, pose: POSES.herEveningFront},
    {p: HER_EVENING, pose: POSES.herEveningProfile},
    {p: HER_EVENING, pose: POSES.herEveningBack},
    {p: HER_WEEKEND, pose: POSES.herWeekendFront},
    {p: HER_WEEKEND, pose: POSES.herWeekendProfile},
    {p: HER_WEEKEND, pose: POSES.herWeekendBack},
    {p: MAN_SUEDE, pose: POSES.manFront},
    {p: WOMAN_SHIRT, pose: POSES.womanFront, flip: true},
  ];
  return (
    <AbsoluteFill style={{background: '#EFE8E1'}}>
      <svg width={TEST_W} height={TEST_H} viewBox={`0 0 ${TEST_W} ${TEST_H}`}>
        {items.map((it, i) => (
          <EdPerson key={i} x={150 + i * 300} y={800} h={h} person={it.p} pose={it.pose} flip={it.flip} finish={finish} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

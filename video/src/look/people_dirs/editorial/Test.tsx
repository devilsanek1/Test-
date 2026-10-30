// Editorial people: quick test frames (the 8 figures at 640 px; their heads, large), for iterating on the drawing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EdPerson, type Finish} from './Person';
import {HER_EVENING, HER_WEEKEND, MAN_SUEDE, WOMAN_SHIRT} from './cast';
import {POSES} from './poses';
import type {Person} from './figure';
import type {Pose} from './body';
import {buildPerson} from './figure';
import {proj} from './core';

export const TEST_W = 2400;
export const TEST_H = 900;

export const ITEMS: {p: Person; pose: Pose; flip?: boolean}[] = [
  {p: HER_EVENING, pose: POSES.herEveningFront},
  {p: HER_EVENING, pose: POSES.herEveningProfile},
  {p: HER_EVENING, pose: POSES.herEveningBack},
  {p: HER_WEEKEND, pose: POSES.herWeekendFront},
  {p: HER_WEEKEND, pose: POSES.herWeekendProfile},
  {p: HER_WEEKEND, pose: POSES.herWeekendBack},
  {p: MAN_SUEDE, pose: POSES.manFront},
  {p: WOMAN_SHIRT, pose: POSES.womanFront, flip: true},
];

export const EdTest: React.FC<{finish?: Finish; h?: number}> = ({finish = 'gradient', h = 640}) => (
  <AbsoluteFill style={{background: '#EFE8E1'}}>
    <svg width={TEST_W} height={TEST_H} viewBox={`0 0 ${TEST_W} ${TEST_H}`}>
      {ITEMS.map((it, i) => (
        <EdPerson key={i} x={150 + i * 300} y={800} h={h} person={it.p} pose={it.pose} flip={it.flip} finish={finish} />
      ))}
    </svg>
  </AbsoluteFill>
);

/** The heads, large: each panel shows the figure's top (crown to the chest) at `zoom` px per unit. */
export const HEADS_W = 2400;
export const HEADS_H = 620;
export const EdHeads: React.FC<{span?: number}> = ({span = 250}) => {
  const pw = HEADS_W / 4;
  const ph = HEADS_H / 2 - 10;
  return (
    <AbsoluteFill style={{background: '#EFE8E1'}}>
      <svg width={HEADS_W} height={HEADS_H} viewBox={`0 0 ${HEADS_W} ${HEADS_H}`}>
        {ITEMS.map((it, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const aspect = pw / ph;
          const vh = span;
          const vw = span * aspect;
          const b = buildPerson(it.p, it.pose);
          const c = proj(b.sk.pivot, {yaw: it.pose.yaw});
          const cx = it.flip ? -c.x : c.x;
          return (
            <svg key={i} x={col * pw} y={row * (ph + 10)} width={pw} height={ph} viewBox={`${cx - vw / 2} ${c.y - 0.42 * vh} ${vw} ${vh}`}>
              <EdPerson x={0} y={0} h={1000} person={it.p} pose={it.pose} flip={it.flip} shadow={null} />
            </svg>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

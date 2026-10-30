// people_dirs/painterly: a quick test frame (the entry's PtTest): people in views at a given height, side by side.
// head: a close crop on the heads (the figure drawn big, the frame on its head and shoulders).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PainterlyFigure, type View} from './PtFigure';
import {CAST, CAST_POSES, type Views} from './cast';

export const TEST_W = 2400;
export const TEST_H = 900;

export const poseKey = (v: View): keyof Views => (v === 'profileL' || v === 'profileR' ? 'profile' : v === 'back' || v === 'back34' ? 'back' : 'front34');

export type TestItem = {who: string; view: View; pose?: keyof Views};
export type TestProps = {items: TestItem[]; h: number; head?: boolean; flat?: boolean; bg?: string};

export const PtTest: React.FC<TestProps> = ({items, h, head, flat, bg}) => {
  const gap = TEST_W / (items.length + 1);
  const H = head ? TEST_H * 3.2 : h;
  // head mode: the crown at y = 70
  const y = head ? 70 + H : TEST_H - 60;
  return (
    <AbsoluteFill style={{background: bg ?? '#B9A7A4'}}>
      <svg width={TEST_W} height={TEST_H} viewBox={`0 0 ${TEST_W} ${TEST_H}`}>
        {items.map((it, i) => {
          const person = CAST[it.who] ?? CAST.herEvening;
          const poses = CAST_POSES[it.who] ?? CAST_POSES.herEvening;
          const pose = poses[it.pose ?? poseKey(it.view)];
          return <PainterlyFigure key={i} person={person} pose={pose} view={it.view} h={H} x={gap * (i + 1)} y={y} uid={`t${i}`} flat={flat} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// people_dirs/painterly: a quick test frame (the entry's PtTest): one person in three views at a given height.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PainterlyFigure, type View} from './PtFigure';
import {CAST} from './cast';
import {POSES} from './cast';

export const TEST_W = 2400;
export const TEST_H = 900;

export type TestProps = {who: string; h: number; views: View[]; pose?: string; flat?: boolean; bg?: string};

export const PtTest: React.FC<TestProps> = ({who, h, views, pose, flat, bg}) => {
  const person = CAST[who] ?? CAST.herEvening;
  const ps = POSES[pose ?? 'stand'] ?? POSES.stand;
  const gap = TEST_W / (views.length + 1);
  return (
    <AbsoluteFill style={{background: bg ?? '#B9A7A4'}}>
      <svg width={TEST_W} height={TEST_H} viewBox={`0 0 ${TEST_W} ${TEST_H}`}>
        {views.map((v, i) => (
          <PainterlyFigure key={i} person={person} pose={ps} view={v} h={h} x={gap * (i + 1)} y={TEST_H - 60} uid={`t${i}`} flat={flat} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

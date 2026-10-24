import React from 'react';
import {Elephant, ElephantProps} from './Elephant';
import {PoseKey, popSwitch, poseAt} from './motion';
import {clamp} from './ink';

export type ElephantTimelineProps = Omit<ElephantProps, 'pose'> & {
  keys: PoseKey[];
  /** 'pop' = squash-and-stretch switch (default); 'fade' = short cross-fade */
  mode?: 'pop' | 'fade';
  fadeDur?: number;
};

/** An elephant that changes pose on a schedule: <ElephantTimeline t={t} keys={[{t:0,pose:'sit-back'},{t:2.4,pose:'trunk-up'}]} .../> */
export const ElephantTimeline: React.FC<ElephantTimelineProps> = ({keys, mode = 'pop', fadeDur = 0.2, squash = 0, ...rest}) => {
  const {cur, prev, since} = poseAt(keys, rest.t);
  const pick = (k: PoseKey) => ({
    pose: k.pose,
    expression: k.expression ?? rest.expression,
    look: k.look ?? rest.look,
    amount: k.amount ?? rest.amount,
  });
  if (mode === 'fade' && prev && since < fadeDur) {
    const a = clamp(since / fadeDur);
    return (
      <g>
        <Elephant {...rest} {...pick(prev)} squash={squash} opacity={(rest.opacity ?? 1) * (1 - a)} />
        <Elephant {...rest} {...pick(cur)} squash={squash} opacity={(rest.opacity ?? 1) * a} />
      </g>
    );
  }
  // pop: anticipate into the next key, switch at peak squash
  const {next} = poseAt(keys, rest.t);
  let s = squash;
  if (prev) s += popSwitch(rest.t, cur.t);
  if (next) s += popSwitch(rest.t, next.t);
  return <Elephant {...rest} {...pick(cur)} squash={s} />;
};

import React from 'react';
import {Elephant, ElephantProps} from './Elephant';
import {PoseKey, popSwitch, poseAt} from './motion';

export type ElephantTimelineProps = Omit<ElephantProps, 'pose'> & {
  keys: PoseKey[];
  /** 'pop' = squash-and-stretch switch (the only mode).
   *  @deprecated 'fade': nothing fades in this film; it is mapped to 'pop'. */
  mode?: 'pop' | 'fade';
  /** @deprecated unused (there is no cross-fade) */
  fadeDur?: number;
};

/** An elephant that changes pose on a schedule: <ElephantTimeline t={t} keys={[{t:0,pose:'sit-back'},{t:2.4,pose:'trunk-up'}]} .../>
 *  Each switch is a squash-and-stretch pop: anticipate (squash) into the key, swap the pose at peak squash, overshoot
 *  (stretch) and settle. Never a cross-fade. */
export const ElephantTimeline: React.FC<ElephantTimelineProps> = ({keys, mode: _mode, fadeDur: _fadeDur, squash = 0, ...rest}) => {
  const {cur, prev, next} = poseAt(keys, rest.t);
  let s = squash;
  if (prev) s += popSwitch(rest.t, cur.t);
  if (next) s += popSwitch(rest.t, next.t);
  return (
    <Elephant
      {...rest}
      pose={cur.pose}
      expression={cur.expression ?? rest.expression}
      look={cur.look ?? rest.look}
      amount={cur.amount ?? rest.amount}
      squash={s}
    />
  );
};

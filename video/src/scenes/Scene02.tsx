import React from 'react';
import {World, Sun, XG, useTime, useScene} from '../lib';
import {BlueprintWall} from './shared/sets';
import {camAt, camMat} from './scene02/camera';

const Scene02: React.FC = () => {
  const t = useTime();
  const sc = useScene();
  const dur = sc ? sc.end - sc.start : 3.678;
  const cam = camAt(t, dur);
  return (
    <World sky={[{t: 0, tod: 'day'}]}>
      <Sun cx={870} cy={740} r={110} />
      <XG m={camMat(cam)}>
        <BlueprintWall drawAt={0} lock={{at: 1e6}} />
      </XG>
    </World>
  );
};
export default Scene02;

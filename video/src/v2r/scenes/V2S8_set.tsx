// V2S8 set (lane L6): STUB (the kit's S8Set at the clock's plane offsets). The set builder replaces this file.
import React from 'react';
import {useTime} from '../../lib/time';
import {S8Set} from '../kit/canal/sets';
import {planeOffset, S8T} from './V2S8_clock';

export const S8Back: React.FC = () => {
  const t = useTime();
  return <S8Set dxHouse={planeOffset('house', t)} dxNear={planeOffset('board', t)} wAt={S8T.wLights} lampRunAt={S8T.facts} board={null} pip={<></>} />;
};
export const S8Window: React.FC = () => null;
export const S8DoorLeaf: React.FC = () => null;
export const S8Front: React.FC = () => null;

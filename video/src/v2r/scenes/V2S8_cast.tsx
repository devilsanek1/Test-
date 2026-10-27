// V2S8 cast (lane L6): STUB. The cast builder replaces this file.
import React from 'react';
import {useTime} from '../../lib/time';
import {S8Ghosts} from '../kit/cast';
import {planeOffset} from './V2S8_clock';
export const S8Her: React.FC = () => null;
export const S8Public: React.FC = () => null;
export const S8GhostsLayer: React.FC = () => {
  const t = useTime();
  return <S8Ghosts dx={planeOffset('ghosts', t) + 0} />;
};

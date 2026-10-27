// V2S8 cast (lane L6): STUB. The cast builder replaces this file (her walk home, the ghosts, the public).
import React from 'react';
import {useTime} from '../../lib/time';
import {S8Ghosts} from '../kit/cast';
import {planeOffset, S8T} from './V2S8_clock';
import {LateExit} from './V2S8_exit';
export const S8Her: React.FC = () => null;
export const S8Public: React.FC = () => null;
/** The kit's S8Ghosts pops at film 33.78 by default: pass the scene-local time. */
export const S8GhostsLayer: React.FC = () => {
  const t = useTime();
  return (
    <LateExit>
      <S8Ghosts at={S8T.cant} dx={planeOffset('ghosts', t)} />
    </LateExit>
  );
};

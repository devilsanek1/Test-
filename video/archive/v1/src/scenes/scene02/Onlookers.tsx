// scene02/Onlookers.tsx — three back-view line-art onlookers in the bottom band (fix round 1; reference 1 f_9.0: the
// wall, the pinned sheet, the mascot on top, the sun above and three white back-view figures at the bottom). They give
// the colossal plan a human scale and sit in the platform-UI band (screen y ~1660-1920, cut by the bottom edge), so
// they never compete with the diagram. The set's own `foreground` heads sit below this tight framing, so S02 places
// these itself (world coords, in front of the steps). Life: the breathing bob (EdgeOnlooker), a head turn toward the
// site icon on 'over', a head turn toward the lock in the pause before 'without', a head turn toward the key on
// 'password'. Fix round 2: heads 50-54 world (~70 px, was ~95) and 40 world lower, so the 'colossal' master sheet reads
// 2+ figures tall (reference f_9.0: the board ~2x the figures); the phone raise is gone (a 250 px straight white arm
// that read as a post and overlapped the sheet's bottom rod).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {EdgeOnlooker} from '../shared/props';
import type {Hair, Acc} from '../../lib/kit/Person';

const OUT_BACK = E.outBack(1.6);

type Spec = {x: number; y: number; head: number; hair: Hair; acc: Acc[]; turnAt?: number; turnDeg?: number; seed: string};

/** A head turn seen from behind: the head + shoulders swing a few degrees about the neck (out(back), 0.24 s) and hold. */
const Turn: React.FC<{x: number; y: number; at?: number; deg?: number; children: React.ReactNode}> = ({x, y, at, deg = 0, children}) => {
  const t = useTime();
  const q = at === undefined ? 0 : OUT_BACK(prog(t, at, 0.24));
  const a = deg * q;
  const shift = Math.sign(deg) * 4 * q;
  return <XG m={mat.compose(mat.translate(shift, 0), mat.about(mat.rotate(a), x, y))}>{children}</XG>;
};

/** turnA: A looks toward the site icon; turnB: B looks toward the key; turnC: C looks toward the lock. */
export const Onlookers: React.FC<{turnA: number; turnB: number; turnC: number}> = ({turnA, turnB, turnC}) => {
  const specs: Spec[] = [
    {x: 336, y: 1434, head: 53, hair: 'short', acc: ['headphones'], turnAt: turnA, turnDeg: 6, seed: 's2on/a'},
    {x: 462, y: 1444, head: 50, hair: 'long', acc: [], turnAt: turnB, turnDeg: -6, seed: 's2on/b'},
    {x: 590, y: 1430, head: 54, hair: 'cap', acc: ['strap'], turnAt: turnC, turnDeg: -5, seed: 's2on/c'},
  ];
  return (
    <>
      {specs.map((s) => (
        <Turn key={s.seed} x={s.x} y={s.y + s.head * 0.55} at={s.turnAt} deg={s.turnDeg}>
          <EdgeOnlooker x={s.x} y={s.y} head={s.head} hair={s.hair} acc={s.acc} body={palette.white} rim={false} depth="mid" bob={1.2} seed={s.seed} />
        </Turn>
      ))}
    </>
  );
};

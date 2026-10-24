// scene02/Onlookers.tsx — three back-view line-art onlookers in the bottom band (fix round 1; reference 1 f_9.0: the
// wall, the pinned sheet, the mascot on top, the sun above and three white back-view figures at the bottom). They give
// the colossal plan a human scale and sit in the platform-UI band (screen y ~1660-1920, cut by the bottom edge), so
// they never compete with the diagram. The set's own `foreground` heads sit below this tight framing, so S02 places
// these itself (world coords, in front of the steps). Life: the breathing bob (EdgeOnlooker), a head turn toward the
// site icon on 'over', one raises a phone in the pause before 'without', a head turn toward the key on 'password'.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {EdgeOnlooker} from '../shared/props';
import type {Hair, Acc} from '../../lib/kit/Person';

const OUT_BACK = E.outBack(1.6);

type Spec = {x: number; y: number; head: number; hair: Hair; acc: Acc[]; turnAt?: number; turnDeg?: number; phoneAt?: number; seed: string};

/** A head turn seen from behind: the head + shoulders swing a few degrees about the neck (out(back), 0.24 s) and hold. */
const Turn: React.FC<{x: number; y: number; at?: number; deg?: number; children: React.ReactNode}> = ({x, y, at, deg = 0, children}) => {
  const t = useTime();
  const q = at === undefined ? 0 : OUT_BACK(prog(t, at, 0.24));
  const a = deg * q;
  const shift = Math.sign(deg) * 4 * q;
  return <XG m={mat.compose(mat.translate(shift, 0), mat.about(mat.rotate(a), x, y))}>{children}</XG>;
};

export const Onlookers: React.FC<{turnA: number; turnC: number; phone: number}> = ({turnA, turnC, phone}) => {
  const specs: Spec[] = [
    {x: 318, y: 1392, head: 70, hair: 'short', acc: ['headphones'], turnAt: turnA, turnDeg: 5, seed: 's2on/a'},
    {x: 470, y: 1404, head: 66, hair: 'long', acc: [], turnAt: turnC, turnDeg: -5, seed: 's2on/b'},
    {x: 624, y: 1388, head: 72, hair: 'cap', acc: ['strap'], phoneAt: phone, seed: 's2on/c'},
  ];
  return (
    <>
      {specs.map((s) => (
        <Turn key={s.seed} x={s.x} y={s.y + s.head * 0.55} at={s.turnAt} deg={s.turnDeg}>
          <EdgeOnlooker x={s.x} y={s.y} head={s.head} hair={s.hair} acc={s.acc} body={palette.white} rim={false} depth="mid" raisePhoneAt={s.phoneAt} bob={1.2} seed={s.seed} />
        </Turn>
      ))}
    </>
  );
};

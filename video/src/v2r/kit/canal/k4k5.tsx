// canal/k4k5.tsx: the kit samples' adapter that plugs K4's people (src/v2r/kit/cast) and K5's Pip (src/v2r/kit/pip)
// into the canal sets' slots, so CanalSample-* show the film's real cast. Lanes can copy it or write their own mapping:
//   <CanalCast person={k4Person} pip={k5Pip}> ...sets... </CanalCast>
// Dogs stay the kit's placeholder (K4 has none). Slot semantics: slots.tsx.

import React from 'react';
import {Person, Seated, NearBack, WindowPerson} from '../cast';
import {Pip} from '../pip';
import {PersonSlot, PipSeat, PlaceholderPerson} from './slots';

/** A canal PersonSlot as a K4 figure. */
export function k4Person(s: PersonSlot): React.ReactNode {
  switch (s.pose) {
    case 'walk':
    case 'jog':
    case 'cycle':
      return <Person x={s.x} y={s.y} h={s.h} seed={s.seed} pose={s.pose} view="profile" flip={s.dir === 1} walk={s.pose === 'cycle' ? undefined : {rate: s.pose === 'jog' ? 2.8 : 1.6}} />;
    case 'stand':
    case 'lean':
      return <Person x={s.x} y={s.y} h={s.h} seed={s.seed} pose="stand" view="back" flip={s.dir === 1} />;
    case 'sit':
    case 'read':
      return <Seated x={s.x} y={s.y} h={s.h} seed={s.seed} read={s.pose === 'read'} side={s.dir} />;
    case 'bust':
      return <NearBack x={s.x} y={s.y} hv={s.h} seed={s.seed} />;
    case 'window':
      return <WindowPerson x={s.x} y={s.y} hb={Math.max(12, Math.min(60, s.h))} seed={s.seed} />;
    default:
      return <PlaceholderPerson s={s} />;
  }
}

/** A canal PipSeat as K5's Pip (the 3/4 back watcher; size clamped to 86-120). */
export function k5Pip(seat: PipSeat): React.ReactNode {
  return <Pip x={seat.x} y={seat.y} size={Math.max(86, Math.min(120, seat.size))} facing="back" target={seat.look} seed={seat.id} />;
}

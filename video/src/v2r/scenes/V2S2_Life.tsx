// V2S2_Life (lane L2): the shot's own life on top of the set's (conform_L2 §5: <= 3 noticeable supporting movers at
// once, taking turns; every mover enters at an edge or from behind a mass, already moving; nothing pops or stops in open
// view). The set already holds the parapet pigeons (they lift once, 7.85), the urn's steam (the kit Newsstand), the
// passing narrowboat (from the right edge at 7.60) and the ducks at rest. No stranger's back, no dog's trot, no paving
// pigeons (conform_L2 §3, §5). FILM seconds.
//   S2FarLife   ONE far walker on the far towpath, already walking at the right edge from the first frame (the pull-back
//               brings it into view by 6.70), left-bound at a stroll (27 px/s), sized by the wall's scale (~64 px a
//               person at s2g 1), so it stays tiny and slow by the VP; behind the near lamp ~7.1-7.7; x ~874 by 12.98
//   S2Motes     a few motes in the low light at the left edge (the sun side, CRAFT §f.6; conform_L2 §10): over the
//               kiosk's painted body, clear of its lit opening, steady through the joins (6.10, 12.98)
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {Particles, CAPTION_BAND} from '../../lib/particles';
import {CastSlot} from '../kit/canal/slots';
import {s2g, s2u} from '../kit/canal/wall';
import {farPath} from './V2S2_Water';
import {S2_ATM} from './V2S2_Wall';

/** The far walker: at x 1060 at 6.10 (off screen under the pull's 1.12), walking left at 27 px/s. */
export const S2_WALKER = {t0: 6.1, x0: 1060, speed: 27, hPerG: 64};

export const S2FarLife: React.FC = () => {
  const t = useTime();
  const x = S2_WALKER.x0 - (t - S2_WALKER.t0) * S2_WALKER.speed;
  const [, y] = farPath(x);
  const h = S2_WALKER.hPerG * s2g(s2u(x));
  return (
    <Tier tier="environment">
      <CastSlot s={{id: 's2far0', x, y, h, pose: 'walk', dir: -1, seed: 's2fw', coat: CM.coatSlate, gait: t}} />
    </Tier>
  );
};

/** The motes' field (shot-local joins [0, 6.88] = film 6.10, 12.98): below the kiosk's counter and the papers' clips,
 *  over its painted sage body and the air in front of its corner. */
export const S2_MOTES = {
  region: [6, 1158, 128, 96] as [number, number, number, number],
  joins: [6.1, 12.98],
  sun: [-260, 700] as [number, number],
};
export const S2Motes: React.FC = () => (
  <Particles
    kind="motes"
    seed="S2/motes"
    region={{rect: S2_MOTES.region}}
    on={CM.sage}
    count={4}
    atm={S2_ATM}
    t0={6.1}
    joins={S2_MOTES.joins}
    avoid={[CAPTION_BAND]}
    sun={S2_MOTES.sun}
  />
);

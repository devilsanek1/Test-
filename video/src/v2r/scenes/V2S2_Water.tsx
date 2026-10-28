// V2S2_Water (lane L2): the canal and the far towpath in S2, on ONE camera (V2S2_Ground): the far towpath and its
// coping follow the wing's base to the VP (kit/canal/wall s2y), our water edge runs to the same VP, so the water narrows
// toward it. Flat colour (CRAFT §c, §f): the water one fill, a few long calm reflection bands tone-on-tone with it (the
// wing's lit band and its brick), the far coping's strip at the waterline in the rig's WATER tint (never a contact strip
// on water), the far towpath stepped to its plane by distance (`recede` toward S2's air). One far lamp in CM.line
// (STYLE §2: never plum), stepped to its plane. FILM seconds.
//   S2Water          the water + its reflections + the far towpath and coping, one far lamp (u 5.5)
//   S2PassingBoat    a narrowboat far down the canal: its bow comes in at the right edge at 7.60, small and slow (it
//                    nears us at walking pace), chimney puffs every ~0.5 s; it never reaches the story windows' columns
//                    or Pip (its bow at x ~742 by 12.98)
//   S2Ducks          two ducks paddling on the narrow water right of Pip, clear of it
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {ShadowLayer, Shadow} from '../../lib/light';
import {recede, toneOnTone} from '../../lib/depth';
import {Batch, Paint, P, Pt as KPt, lerp} from '../kit/canal/core';
import {Lamp} from '../kit/canal/towpath';
import {PerspBoat} from '../kit/canal/boat';
import {Ducks, Puffs} from '../kit/canal/life';
import {s2g, s2u, s2x, s2y} from '../kit/canal/wall';
import {S2_ATM, wallPlane} from './V2S2_Wall';
import {OUR_EDGE} from './V2S2_Ground';

type Pt = [number, number];

/** The far towpath's water edge (the far coping's foot) at column position u. */
export const farCoping = (u: number) => s2y('base', u) + 24 * s2g(u);
/** The far towpath's walking line (where far figures stand) at screen x. */
export const farPath = (x: number): Pt => {
  const u = s2u(x);
  return [x, s2y('base', u) + 12 * s2g(u)];
};
/** The water's middle at screen x (between the far coping and our edge). */
export const waterMid = (x: number): number => (farCoping(s2u(x)) + OUR_EDGE(x)) / 2;

const col = (c: string, p: number) => (p > 0 ? recede(c, p, S2_ATM) : c);

export const S2Water: React.FC = () => {
  const uEnd = s2u(1140);
  const b = useMemo(() => {
    const b = new Batch();
    // ---- the water: from the far coping down to our edge (and on under our coping; our bank covers it)
    const top: Pt[] = [];
    for (let u = -3; u <= uEnd; u += 0.25) top.push([s2x(u), farCoping(u) - 2]);
    const bot: Pt[] = [];
    for (let x = 1160; x >= -60; x -= 30) bot.push([x, OUR_EDGE(x) + 30]);
    b.poly(CM.water, [...top, ...bot] as KPt[]);
    b.layer();
    // ---- long calm reflection bands under the far bank: the wing's brick and its lit first storey, tone-on-tone with
    // the water (never dashes); each band runs along the bank (to the VP) and narrows with distance
    const bands: [number, number, boolean][] = [
      [10, 7, false],
      [26, 5, true],
      [40, 4, false],
    ];
    for (const [off, th, lit] of bands) {
      const pts: Pt[] = [];
      const pts2: Pt[] = [];
      for (let u = -3; u <= uEnd; u += 0.5) {
        const g = s2g(u);
        const y = farCoping(u) + off * g;
        if (y > OUR_EDGE(s2x(u)) - 4) continue;
        pts.push([s2x(u), y]);
        pts2.push([s2x(u), y + th * g]);
      }
      if (pts.length > 2) b.poly(toneOnTone(CM.water, {lit, dE: lit ? 6 : 4}), [...pts, ...pts2.reverse()] as KPt[]);
    }
    b.layer();
    // ---- the far towpath (paving) and its coping, per plane segment (stepped toward the air with distance)
    const seg: [number, number, number][] = [
      [-3, 2.5, 0],
      [2.5, 6.5, 1],
      [6.5, 14.5, 2],
      [14.5, uEnd, 3],
    ];
    for (const [u0, u1Raw, p] of seg) {
      const u1 = Math.min(u1Raw, uEnd);
      if (u0 >= u1) continue;
      const band = (a: (u: number) => number, c: (u: number) => number): Pt[] => {
        const out: Pt[] = [];
        const n = Math.max(2, Math.ceil((u1 - u0) * 3));
        for (let i = 0; i <= n; i++) out.push([s2x(lerp(u0, u1, i / n)), a(lerp(u0, u1, i / n))]);
        for (let i = n; i >= 0; i--) out.push([s2x(lerp(u0, u1, i / n)), c(lerp(u0, u1, i / n))]);
        return out;
      };
      b.poly(col(CM.paving, p), band((u) => s2y('base', u) - 1, (u) => farCoping(u) - 6 * s2g(u)) as KPt[]);
      b.poly(col(CM.limestone, p), band((u) => farCoping(u) - 6 * s2g(u), (u) => farCoping(u)) as KPt[]);
    }
    return b;
  }, [uEnd]);
  // the far coping's strip on the water (a cast-strength strip in the water tint: never a contact strip on water)
  const strip = useMemo(() => {
    const pts: Pt[] = [];
    const pts2: Pt[] = [];
    for (let u = -3; u <= uEnd; u += 0.5) {
      pts.push([s2x(u), farCoping(u)]);
      pts2.push([s2x(u), farCoping(u) + Math.max(2, 7 * s2g(u))]);
    }
    return 'M' + [...pts, ...pts2.reverse()].map(([x, y]) => P(x, y)).join('L') + 'Z';
  }, [uEnd]);
  return (
    <>
      <Tier tier="environment">
        <Paint b={b} seed="s2water" misreg={false} />
      </Tier>
      <ShadowLayer>
        <Shadow d={strip} tint="water" />
      </ShadowLayer>
      {/* ONE far lamp on the far towpath (u 5.5, plane +1, CM.line stepped to it), clear of the story windows; none
          farther (the far planes stay calm: no dark specks by the VP, CRAFT §f) */}
      <Tier tier="environment">
        {[5.5].map((u, i) => (
          <Lamp key={i} x={s2x(u)} y={s2y('base', u) + 12 * s2g(u)} h={290 * s2g(u)} color={col(CM.line, wallPlane(u))} seed={`s2lamp${i}`} />
        ))}
      </Tier>
    </>
  );
};

/** The passing narrowboat: its bow comes in at the right edge at 7.60 (clear of 8.44 / 8.96 by > 0.4 s), gliding left
 *  (toward us) along the water's middle; its length ~20 m in the wall's scale; growth as it nears. Its bow at x ~742
 *  by 12.98, right of the story windows' columns (x <= 520) and of Pip (x <= 640). */
export const S2_BOAT = {at: 7.6, x0: 1086, speed: 64};
export const S2PassingBoat: React.FC = () => {
  const t = useTime();
  if (t < S2_BOAT.at - 0.01) return null;
  const bowX = S2_BOAT.x0 - (t - S2_BOAT.at) * S2_BOAT.speed;
  const sternX = Math.min(1400, bowX + 230 * s2g(s2u(Math.min(1080, bowX))));
  const lane = (x: number) => waterMid(x) + 4;
  const h = (x: number) => 150 * s2g(s2u(Math.min(1300, x)));
  return (
    <Tier tier="environment">
      <PerspBoat stern={[sternX, lane(sternX)]} bow={[bowX, lane(bowX)]} hStern={h(sternX)} hBow={h(bowX)} seed="s2passing" cabin={CM.coatOat} />
      <Puffs x={sternX - 30 * s2g(s2u(Math.min(1080, sternX)))} y={lane(sternX) - h(sternX) - 6} seed="s2boatsmoke" kind="smoke" scale={0.42 * s2g(s2u(Math.min(1080, sternX))) * 2} drift={14} ceil={604} />
    </Tier>
  );
};

/** Two ducks on the narrow water right of Pip (x 660-760), paddling slowly, clear of Pip's box and the heads below. */
export const S2Ducks: React.FC = () => (
  <Tier tier="environment">
    <Ducks ducks={[{x: 690, y: waterMid(690) + 6, size: 26, vx: 0}, {x: 748, y: waterMid(748) + 4, size: 22, vx: 0, drake: true}]} seed="s2ducks2" />
  </Tier>
);

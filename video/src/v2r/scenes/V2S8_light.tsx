// V2S8 light (lane L6; conform_L6 §6, CRAFT §d, THROUGHLINE §5, lib/LIGHT.md). RIG_CANAL_S8 (V2S8.tsx's <Lit>): the
// key is the low sun ahead, SUN8 (420, 625): shadows fall TOWARD us (toward 85, el 36, casts capped at 0.8 h), backlit
// form. Every shape is a flat multiply step of the film's ONE tint family, or a flat light step lighter and warmer than
// what it lands on; nothing draws outside <Lit>, and `{"lightOff": true}` turns it all off (check_light.py's A side).
// The story's light, drawn here (the set's and the house row's own shades and shadows are in V2S8_set / V2S8_house):
//   S8HouseBandLight  under her house row's objects: W's spill on the forecourt below it from 34.95 (+4 L*, warm), the
//                     heritage lamp's pool at its switch-on (f2261: two flat steps)
//   S8LaneLight       on the near band: the near lamp's pool at its switch-on (f2237)
//   S8LaneShadows     contact + cast: her (house plane), the ghosts (ghost plane, from their pop), the walkers, the
//                     board's feet and its cast, the cafe owner, Pip's bollard and Pip on it (board plane)
// Her form shade and rim are V2S8_cast's (they need her drawing); Pip's bollard's form shade is V2S8_board's.
import React from 'react';
import {CastShadow, ContactShadow, LightPool, ShadowLayer, WindowSpill, poolUnder, relit} from '../../lib/light';
import {useTime} from '../../lib/time';
import * as MAP from '../world/map';
import {B_GEOM} from '../kit/boards';
import {herAt, lampRunAt, S8T} from './V2S8_clock';
import {S8Plane} from './V2S8_depth';
import {OWNER, S8_BOLLARD} from './V2S8_board';
import {WALKERS, walkerAt} from './V2S8_cast';
import {HOUSE_LAMP} from './V2S8_house';
import {NLAMP} from './V2S8_set';

// ---------------------------------------------------------------- ground light

/** The grounds the light lands on, as the set paints them (the A side of check_light, measured at 38.0): the forecourt
 *  setts under W and the heritage lamp (L* 89.0), the near band's paving under the near lamp (L* 82.7). */
const FORECOURT = '#EEDCCC';
const NEAR_PAVING = '#E1CAB4';
/** A pool's two flat steps over a ground: the ring +4.5 L*, the core +7 L*, both warmer (conform_L6 §6: "+4 L* over
 *  the paving, two flat steps, one lamp at a time"; check_light: each light shape >= its ground + 4). */
const poolOn = (ground: string): [string, string] => [relit(ground, 4.5, {warm: 30}), relit(ground, 7, {warm: 30})];

/** W's spill: from the forecourt's foot of the facade under W (y 1060), widening toward us over the setts. */
const W_RECT: [number, number, number, number] = [MAP.W.x - MAP.W.w / 2, MAP.W.y - MAP.W.h / 2, MAP.W.w, MAP.W.h];
/** The heritage lamp's pool: under its lantern, on the forecourt round its foot. */
const HOUSE_POOL = poolUnder({c: [HOUSE_LAMP.x, HOUSE_LAMP.y - HOUSE_LAMP.h * 0.8], halfW: HOUSE_LAMP.h * 0.045}, HOUSE_LAMP.y + 4);

export const S8HouseBandLight: React.FC = () => {
  const t = useTime();
  return (
    <S8Plane p="house">
      {t >= S8T.wLights ? <WindowSpill win={[W_RECT[0], 1060 - W_RECT[3] * 0.3, W_RECT[2], W_RECT[3] * 0.3]} base={1061} widen={1.4} depth={0.32} color={relit(FORECOURT, 4.5, {warm: 30})} /> : null}
      {t >= lampRunAt('houseLamp') ? <LightPool pool={HOUSE_POOL} colors={poolOn(FORECOURT)} /> : null}
    </S8Plane>
  );
};

/** The near lamp's pool round its foot on the near band (switch-on 1 of the run, f2237): under its lantern, CRAFT §d.7's
 *  rx 3.5x the lantern's half-width. */
const NEAR_POOL = poolUnder({c: [NLAMP.lantern.x, (NLAMP.lantern.y0 + NLAMP.lantern.y1) / 2], halfW: NLAMP.lantern.w / 2}, NLAMP.foot, {k: 3.5});
export const S8LaneLight: React.FC = () => {
  const t = useTime();
  if (t < lampRunAt('nearPool')) return null;
  return (
    <S8Plane p="near">
      <LightPool pool={NEAR_POOL} colors={poolOn(NEAR_PAVING)} />
    </S8Plane>
  );
};

// ---------------------------------------------------------------- shadows

/** A standing figure's contact strip and its cast toward us (the sun ahead), at its feet (its plane's coords). */
const Stand: React.FC<{x: number; y: number; h: number; k?: number; at?: number}> = ({x, y, h, k = 1.2, at}) => (
  <>
    <ContactShadow x={x} y={y} w={h * 0.24} k={k} at={at} />
    <CastShadow x={x} y={y} w={h * 0.2} h={h} at={at} />
  </>
);

/** Her (from the wipe; until she is through the door). */
const HerShadow: React.FC<{t: number}> = ({t}) => {
  const p = herAt(t);
  if (!p) return null;
  return <Stand x={p.x} y={p.y} h={p.h} />;
};

/** The ghosts: their shadows land with their fill (the pop + 0.06 s, staggered as the kit's S8Ghosts). */
const GhostShadows: React.FC = () => (
  <>
    {[...MAP.S8.ghosts].reverse().map((g, j) => {
      const i = MAP.S8.ghosts.length - 1 - j;
      return <Stand key={g.id} x={g.x} y={g.feetY} h={g.h} at={S8T.cant + i * 0.04 + 0.06} />;
    })}
  </>
);

/** Her board: a contact strip under each foot and its cast toward us from its base (the footprint a thin strip). */
const BOARD_H = MAP.B_LEGS_Y1 - B_GEOM.top;
const BoardShadows: React.FC = () => {
  const {outer, feet} = B_GEOM;
  const y = MAP.B_LEGS_Y1;
  return (
    <>
      {feet.map((f, i) => (
        <ContactShadow key={i} x={f.x} y={y} w={44} h={8} />
      ))}
      <CastShadow x={(outer.x0 + outer.x1) / 2} y={y} w={outer.x1 - outer.x0} pts={[[outer.x0 + 4, y - 2], [outer.x1 - 4, y - 2], [outer.x1 + 8, y + 10], [outer.x0 + 10, y + 10]]} h={BOARD_H} />
    </>
  );
};

/** Pip's bollard on the towpath and Pip's contact on its cap (from the landing to the seam's settle). */
const BollardShadows: React.FC<{t: number}> = ({t}) => (
  <>
    <ContactShadow x={S8_BOLLARD.x} y={S8_BOLLARD.foot} w={S8_BOLLARD.w * 0.84} />
    <CastShadow x={S8_BOLLARD.x} y={S8_BOLLARD.foot} w={S8_BOLLARD.w * 0.8} h={S8_BOLLARD.foot - S8_BOLLARD.top} />
    {t >= S8T.pipLands && t < S8T.unbuildT0 ? <ContactShadow x={S8_BOLLARD.x} y={S8_BOLLARD.top + 2} w={S8_BOLLARD.w * 0.86} h={6} /> : null}
  </>
);

export const S8LaneShadows: React.FC = () => {
  const t = useTime();
  return (
    <>
      <S8Plane p="house">
        <ShadowLayer>
          <HerShadow t={t} />
          {WALKERS.map((w) => {
            const p = walkerAt(w, t);
            return p && w.plane === 'house' ? <Stand key={w.seed} x={p.x} y={p.y} h={p.h} k={1.1} /> : null;
          })}
        </ShadowLayer>
      </S8Plane>
      {t >= S8T.cant ? (
        <S8Plane p="ghosts">
          <ShadowLayer>
            <GhostShadows />
          </ShadowLayer>
        </S8Plane>
      ) : null}
      <S8Plane p="board">
        <ShadowLayer>
          <BoardShadows />
          <BollardShadows t={t} />
          <Stand x={OWNER.x} y={OWNER.y} h={OWNER.h} />
        </ShadowLayer>
      </S8Plane>
    </>
  );
};

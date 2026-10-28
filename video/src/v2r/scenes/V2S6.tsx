// V2S6 "The gate" (lane L5). Film 23.80-28.10 s (scenes.json); TREATMENT.md sections 3, 5 (row S6), 8 (V1-V3, V9,
// V10, V12, V15); map.ts S6; conform_L5 §2 + §7; RESUME_2026-10-28. The Pentagon's perimeter footpath at eye level,
// looking SOUTH on an April morning (the sun in the east = screen left: SUN2, where the push-through into S7 dives).
// ONE camera (V2S6_rig CAM: eye 1.6 m, horizon y 771, VP (540, 771)); held, with one gentle parallax float.
//   23.62-23.98  S5's blossom tree wipes right -> left and uncovers the shot (the board last, clear by ~23.90): the
//                deal board is up (frame, tag, the FULL clause, the credit); nothing enters, pops or turns to 24.00
//   24.03  "any": the purpose line pops with the board's clack
//   24.30-26.40  the float, out and home (planes by depth; the sky and the captions never)
//   23.80-24.86  a staff member walks in at the service door (already under way); 25.0 it slides shut behind them
//   24.45-25.5   one jogger on the far promenade, left of the board
//   26.467 "veto": the F12 line pops (f1588); 26.50 Pip's ONE ear flick (seated at the board's foot all shot)
//   26.62-27.62  a staff member steps out for air and goes back in; 27.4 the door slides shut (never on anyone)
//   27.100 / 27.450 / 27.833  the facade's windows light in three groups (f1626 / 1647 / 1670: the sound lane)
//   27.90-28.30  nothing enters, pops or turns: the push-through into SUN2 (27.95-28.25) is the Film's
//   always: S6's own falling weather (petals from the near shrub, <= 7 at once)
// Planes (lib/depth; V2S6_rig S6_PLANE): +3 the facade band + door, +2 the lawn's cherries + the far promenade, +1 the
// fence + lawn, 0 the deal board + the footpath + Pip, -1 the tulip bed, the shrub and the bench. Light: RIG_APRIL.
// Tiers: A the deal board; B Pip, the door staff; C everything else.
// Parts: V2S6_rig (clock, camera, float), V2S6_board, V2S6_pip, V2S6_near (footpath, near plane, ground shadows),
// V2S6_life (lawn trees, jogger, staff, petals), V2S6_set (the hedge's colour fix). The set's far pieces are the dc
// kit's gate (GateFacade, GateFence), placed here plane by plane; the lawn's cherries are S6's own (air-stepped).
import React from 'react';
import {World} from '../../lib/World';
import {TimeShift} from '../../lib/time';
import {Lit} from '../../lib/light';
import {Sky} from '../../lib/sky';
import {CM, TOD} from '../palette';
import {GateFacade, GateFence} from '../kit/dc/gate';
import {S6} from '../world/map';
import {RIG_APRIL} from '../world/rigs';
import {S6_AIR, S6_MORNING} from '../world/skies';
import type {ToneKey} from '../../lib/Film';
import {HORIZON, S6Plane, S6_PLANE, S6_START, SUN, T0} from './V2S6_rig';
import {S6Board} from './V2S6_board';
import {S6PipSeat} from './V2S6_pip';
import {S6LawnTrees, S6Promenade, S6Staff, S6Petals, S6_AIR_K} from './V2S6_life';
import {S6Paving, S6GroundShadows, S6NearBed, S6NearBench, S6NearShadows, S6KerbShade} from './V2S6_near';
import {S6HedgeFix} from './V2S6_set';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** The facade's windows light in three groups, one per clip of the band (inner s): left of the board, right of it,
 *  past the door. The kit's own one-by-one run would be > 3 switch-ons a second (flash safety). */
const WIN_GROUPS: {x0: number; x1: number; at: number}[] = [
  {x0: -400, x1: 330, at: S6.facadeWindowsF[0] / 60 - T0},
  {x0: 330, x1: 760, at: S6.facadeWindowsF[1] / 60 - T0},
  {x0: 760, x1: 1500, at: S6.facadeWindowsF[2] / 60 - T0},
];

/** The facade band (the dc kit's GateFacade), drawn once per window group under that group's clip: the same seed, so
 *  the copies are identical but for their windows' switch-on; the doorway (and its staff) lives in the last one. Then
 *  the far plane's ONE flat step toward the April air (lib/depth CRAFT §f.2; the kit's colours are fixed, so the step is
 *  a flat air-coloured layer over the band, the mix every colour of it would take): the farthest plane is the closest
 *  to the air (check_depth). It stops at the lawn strip (y 831: a sage under a gold air would turn olive). */
const F = {y0: S6.facadeBandY[0], y1: S6.facadeBandY[1]};
/** The tall corner post above the fence's air step (GateFence: a 54 px shaft under a 68 px cap at map S6.cornerPost). */
const POST_TOP = (() => {
  const {x, y} = S6.cornerPost;
  const yb = F.y1 + 45;
  return `M${x - 34} ${y}H${x + 34}V${y + 16}H${x + 27}V${yb}H${x - 27}V${y + 16}H${x - 34}Z`;
})();
const S6Facade: React.FC = () => (
  <>
    <defs>
      {WIN_GROUPS.map((g, i) => (
        <clipPath key={i} id={`s6facade${i}`}>
          <rect x={g.x0} y={560} width={g.x1 - g.x0} height={480} />
        </clipPath>
      ))}
    </defs>
    {WIN_GROUPS.map((g, i) => (
      <g key={i} clipPath={`url(#s6facade${i})`}>
        <GateFacade lightAt={[g.at, g.at]} doorPeople={i === WIN_GROUPS.length - 1 ? <S6Staff /> : undefined} />
      </g>
    ))}
    <rect x={-300} y={F.y0 - 3} width={1800} height={F.y1 - 4 - (F.y0 - 3)} fill={S6_AIR} opacity={S6_AIR_K.facade} />
  </>
);

const V2S6: React.FC = () => (
  <World sky={CM.sky} tod={TOD.april} horizon={HORIZON}>
    <Lit rig={RIG_APRIL}>
      <TimeShift by={T0 - S6_START}>
        <Sky spec={S6_MORNING} />
        <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={CM.sun} />
        <S6Plane plane={S6_PLANE.facade}>
          <S6Facade />
        </S6Plane>
        <S6Plane plane={S6_PLANE.lawn}>
          <S6LawnTrees />
          <S6Promenade />
        </S6Plane>
        <S6Plane plane={S6_PLANE.fence}>
          <GateFence />
          <S6HedgeFix />
          {/* the fence + lawn's flat step toward the air (as the facade's: a sage under a gold air at 0.15 keeps h ~128) */}
          <rect x={-300} y={F.y1 + 45} width={1800} height={1252 - 4 - (F.y1 + 45)} fill={S6_AIR} opacity={S6_AIR_K.fence} />
          {/* the tall corner post's top (it rises over the band's top edge): the same step, so it never outshines the board */}
          <path d={POST_TOP} fill={S6_AIR} opacity={S6_AIR_K.fence} />
        </S6Plane>
        <S6Plane plane={S6_PLANE.subject}>
          <S6Paving />
          <S6GroundShadows />
          <S6Board />
          <S6PipSeat />
        </S6Plane>
        <S6Plane plane={S6_PLANE.near}>
          <S6NearShadows />
          <S6NearBench />
          <S6NearBed />
          <S6KerbShade />
          <S6Petals />
        </S6Plane>
      </TimeShift>
    </Lit>
  </World>
);
export default V2S6;

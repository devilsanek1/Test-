// v8_s1: the CAFE's people under the autumn tree in the plaza beyond the building's corner (paint_test/v8_card.md §3: the
// city's everyday evening going on around her, small and soft, never fighting her), drawn by the same people overhaul
// as her (person6; under ~200 px tall the head drops to the contour), and Pip hidden among them (DIRECTION rule 2: a
// second look's find, off her eye path). Each is backlit by the same low sun: a soft rose-lilac shade over the body and a
// thin gold rim on the edges that face the sun (tier B: thinner than hers).
import React, {useId, useMemo} from 'react';
import {CAST6, person6} from '../people_dirs/hair_v4/asm_bodies';
import {placeSvg} from '../people_dirs/hair_v4/asm_render';
import {ledge5, stand5, walk5, type Pose5} from '../people_dirs/people_v4/skel5';
import {Look} from '../../lib/exit';
import {Pip} from '../../v2r/kit/pip';
import {RimOf, ShadeOf, toward, type Region} from '../../lib/light2';
import {proj, SUN_IMG} from './rig';
import {useLit, useMoverOn} from './context';
import scene from './scene.json';

const XB = scene.street.x0;
type Who = {who: keyof typeof CAST6; X: number; Z: number; pose: () => Pose5; yaw: number; flip?: boolean; seat?: number};
/** Seated at the two near tables and one standing by the far umbrella (world metres; scene.json's camera). */
export const CAFE: Who[] = [
  {who: 'W6', X: XB - 1.45, Z: 15.2, pose: () => ledge5('f', 270, 150), yaw: -88, seat: 0.46},
  {who: 'M1', X: XB - 0.05, Z: 14.6, pose: () => ledge5('m', 270, 150), yaw: -92, flip: true, seat: 0.46},
  {who: 'W4', X: XB - 3.6, Z: 18.6, pose: () => stand5('f', {arms: 'loose', headYaw: 30}), yaw: -60},
  {who: 'M2', X: XB - 1.9, Z: 22.5, pose: () => walk5('m', 0.35), yaw: -90, flip: true},
];
/** Pip on the far end of the near table's bench, facing the water (its back half to us): ~45 px. */
export const PIP_AT = {X: XB - 0.62, Y: 0.46, Z: 15.4, size: 0.5} as const;

const Person: React.FC<{p: Who; shadow?: boolean}> = ({p, shadow = true}) => {
  const uid = 'v8p' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [x, y] = proj(p.X, 0, p.Z);
  const h = (scene.camera.f * 1.7) / p.Z;
  const svg = useMemo(() => {
    const b = person6(CAST6[p.who], {pose: p.pose(), yaw: p.yaw, px: h, eyes: 'open', contact: {color: '#2A1C30', opacity: 0.25}});
    return placeSvg(b.parts, uid, x, y, h, {shadow, flip: !!p.flip});
  }, [uid, x, y, h, shadow, p]);
  return <g dangerouslySetInnerHTML={{__html: svg}} />;
};

const Lit: React.FC<{p: Who}> = ({p}) => {
  const lit = useLit();
  const [x, y] = proj(p.X, 0, p.Z);
  const h = (scene.camera.f * 1.7) / p.Z;
  const region: Region = [x - 0.7 * h, y - 1.1 * h, 1.4 * h, 1.1 * h + 8];
  const fig = <Person p={p} shadow={false} />;
  return (
    <>
      <Person p={p} />
      {lit ? (
        <>
          <ShadeOf of={fig} region={region} tint="#B9A2C2" opacity={0.62} />
          <RimOf of={fig} region={region} l={toward([x, y - 0.6 * h], SUN_IMG)} width={1.3} color="#FFD7A0" opacity={0.7} steps={1} />
        </>
      ) : null}
    </>
  );
};

/** Pip in the cafe's backlit shade (tone-on-tone with the people there), a thin sun rim: found on a second look. */
const PipLit: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
  const lit = useLit();
  const pip = (
    <Look ink={false}>
      <Pip x={x} y={y} size={size} pose="sit" facing="back" paint="colour" seed="v8pip" idle={0} t={1.0} />
    </Look>
  );
  const region: Region = [x - size, y - size * 1.3, size * 2, size * 1.45];
  return (
    <>
      {pip}
      {lit ? (
        <>
          <ShadeOf of={pip} region={region} tint="#A891B4" opacity={0.7} />
          <RimOf of={pip} region={region} l={toward([x, y - size * 0.5], SUN_IMG)} width={1.1} color="#FFD7A0" opacity={0.6} steps={1} />
        </>
      ) : null}
    </>
  );
};

export const CafePeople: React.FC = () => {
  const on = useMoverOn('cafe');
  const pipOn = useMoverOn('pip');
  const [px, py] = proj(PIP_AT.X, PIP_AT.Y, PIP_AT.Z);
  const size = (scene.camera.f * PIP_AT.size) / PIP_AT.Z;
  return (
    <>
      {on ? [...CAFE].sort((a, b) => b.Z - a.Z).map((p, i) => <Lit key={i} p={p} />) : null}
      {pipOn ? <PipLit x={px} y={py} size={size} /> : null}
    </>
  );
};

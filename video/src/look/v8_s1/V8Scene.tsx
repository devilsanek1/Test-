// v8_s1: the scene's composer (paint_test/v8_card.md). The planes far to near, each its painted piece and its baked light
// maps in one group (so a later float moves a plane with its own light); the movers live in their plane:
//   mid       the cafe's people under the autumn tree and Pip among them (hidden on purpose: a second look's find)
//   building  then HER, a few steps out of the lobby's door, lit live by the scene's two lights: the low sun ahead of
//             her (a gold rim on the edges that face it, uneven by construction) and the lobby's warm light behind her
//             (its wrap round her back edge), her body in its own soft backlit shade (the sky's fill, never black), the
//             one paper locked to her
// Her shadow and her reflection in the wet stones are the street plane's (baked from her parts render), so they sit
// under her as the ground's light.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {World} from '../../lib/World';
import {GrainOn, RimOf, ShadeOf, WrapOf, toward, type Region} from '../../lib/light2';
import scene from './scene.json';
import {PLANES, PlaneMaps, useLit, useMoverOn, useV8, type Piece, type PlaneName} from './context';
import {HER_V8, V8Her} from './her_v8';
import {CafePeople} from './people_v8';
import {GustLeaves} from './particles_v8';
import {HER_LIGHT, SUN_IMG, herScreen, LOBBY_LIGHT} from './rig';

/** One painted plane's image, holding the frame until it has loaded. */
const PieceImage: React.FC<{p: Piece; name: string}> = ({p, name}) => {
  const [handle] = useState(() => delayRender(`v8 piece ${name}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const [x, y, w, h] = p.box;
  return <image href={p.src} x={x} y={y} width={w} height={h} preserveAspectRatio="none" onLoad={() => continueRender(handle)} onError={() => continueRender(handle)} />;
};

const Plane: React.FC<{name: PlaneName; children?: React.ReactNode}> = ({name, children}) => {
  const {pieces, parts} = useV8();
  const p = pieces[name];
  return (
    <g data-plane={name}>
      {!parts && p ? <PieceImage p={p} name={name} /> : null}
      <PlaneMaps name={name} />
      {children}
    </g>
  );
};

/** Her and her live light. */
const HerLit: React.FC = () => {
  const on = useMoverOn('her');
  const lit = useLit();
  const {maps} = useV8();
  if (!on) return null;
  const b = herScreen();
  const fig = <V8Her x={b.x} feetY={b.feetY} h={b.h} pose={HER_V8} shadow={false} />;
  const region: Region = [b.x - 0.62 * b.h, b.feetY - 1.15 * b.h, 1.24 * b.h, 1.15 * b.h + 12];
  const c: [number, number] = [b.x, b.feetY - 0.55 * b.h];
  const L = HER_LIGHT;
  const grain = maps.live.grain;
  return (
    <>
      <V8Her x={b.x} feetY={b.feetY} h={b.h} pose={HER_V8} shadow />
      {lit ? (
        <>
          <ShadeOf of={fig} region={region} tint={L.shade.tint} opacity={L.shade.opacity} />
          {grain ? <GrainOn of={fig} region={region} tile={grain} at={[region[0], region[1]]} opacity={0.8} /> : null}
          {maps.live.wrap ? <WrapOf of={fig} region={region} img={maps.live.wrap} width={L.wrap.width} opacity={L.wrap.opacity} blur={1.2} /> : null}
          <RimOf of={fig} region={region} l={toward(c, LOBBY_LIGHT.img)} width={L.lobby.width} color={LOBBY_LIGHT.color} opacity={L.lobby.opacity} soft={0.45} blur={0.9} />
          <RimOf of={fig} region={region} l={toward(c, SUN_IMG)} width={L.sun.width} color={L.sun.color} opacity={L.sun.opacity} soft={L.sun.soft} blur={0.7} />
        </>
      ) : null}
    </>
  );
};

export const V8Scene: React.FC<{slab?: string}> = ({slab}) => (
  <World sky={slab ?? '#E7C3B7'} horizon={scene.camera.cy}>
    {PLANES.map((name) => (
      <Plane key={name} name={name}>
        {name === 'mid' ? <CafePeople /> : null}
        {name === 'building' ? <HerLit /> : null}
        {name === 'near' ? <GustLeaves /> : null}
      </Plane>
    ))}
  </World>
);

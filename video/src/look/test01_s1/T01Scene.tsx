// test01_s1: the scene's composer (docs/tests/process_test_01_amsterdam/CARD.md; after src/look/v8_s1/V8Scene.tsx's
// pattern, never editing it). The planes far to near, each its painted piece and its baked light maps in one group (so
// a later float moves a plane with its own light); the movers live in their plane:
//   bridge  HER, the whole figure on the crown behind the near railing (lit live: the blue hour's cool shade over all of
//           her, the gold from below on the edges that face the waking pages, the low sky's wrap on her back edges)
//   boat    Pip among the pots on the houseboat's roof (a second look's find)
//   rail    her again ABOVE the railing's top (her forearms rest on it and her hands reach over it), so the iron passes
//           behind her arms and in front of her body
//   glow    the stream of light from the waking pages up to her phone, and the phone (the question and the answer are
//           one light); her face and hands lit by it
import React, {useEffect, useId, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {GrainOn, RimOf, ShadeOf, WrapOf, toward, type Region} from '../../lib/light2';
import {Pip} from '../../v2r/kit/pip/Pip';
import scene from './scene.json';
import {PLANES, PlaneMaps, useLit, useMoverOn, useT01, type Piece, type PlaneName} from './context';
import {HER_T01, T01Her, herWrist} from './her_t01';
import {Phone, Stream} from './stream_t01';
import {GOLD, HER_LIGHT, SRC_IMG, herScreen, pipScreen, railTopY} from './rig';

/** One painted plane's image, holding the frame until it has loaded. */
const PieceImage: React.FC<{p: Piece; name: string}> = ({p, name}) => {
  const [handle] = useState(() => delayRender(`t01 piece ${name}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const [x, y, w, h] = p.box;
  return <image href={p.src} x={x} y={y} width={w} height={h} preserveAspectRatio="none" onLoad={() => continueRender(handle)} onError={() => continueRender(handle)} />;
};

const Plane: React.FC<{name: PlaneName; children?: React.ReactNode}> = ({name, children}) => {
  const {pieces, parts} = useT01();
  const p = pieces[name];
  return (
    <g data-plane={name}>
      {!parts && p ? <PieceImage p={p} name={name} /> : null}
      <PlaneMaps name={name} />
      {children}
    </g>
  );
};

/** A warm light ON a mover: a radial pool of light (centre `at`, radius `r`) inside the mover's silhouette, screened
 *  (her face and hands lit by the phone and the stream right under them). */
const PoolOn: React.FC<{of: React.ReactNode; region: Region; at: [number, number]; r: number; color: string; opacity: number}> = ({of, region, at, r, color, opacity}) => {
  const id = 'pool' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [x, y, w, h] = region;
  return (
    <>
      <defs>
        <filter id={`${id}w`} filterUnits="userSpaceOnUse" x={x} y={y} width={w} height={h} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
          <g filter={`url(#${id}w)`}>{of}</g>
        </mask>
        <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={at[0]} cy={at[1]} r={r}>
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="0.45" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g style={{mixBlendMode: 'screen'}} opacity={opacity}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}g)`} mask={`url(#${id}m)`} />
      </g>
    </>
  );
};

/** Her and her live light; `above` draws only the part above the railing's top (in front of the iron). */
const HerLit: React.FC<{above?: boolean}> = ({above}) => {
  const on = useMoverOn('her');
  const lit = useLit();
  const {maps} = useT01();
  if (!on) return null;
  const b = herScreen();
  const clip = above ? railTopY(scene.her.X) + 1 : undefined;
  const wr0 = herWrist(b.x, b.feetY, b.h);
  const box = above ? ([wr0[0] - 0.16 * b.h, wr0[1] - 0.1 * b.h, 0.22 * b.h, 0.2 * b.h] as const) : undefined;
  const fig = <T01Her x={b.x} feetY={b.feetY} h={b.h} pose={HER_T01} clipAboveY={clip} alsoBox={box} />;
  const region: Region = [b.x - 0.75 * b.h, b.feetY - 1.2 * b.h, 1.5 * b.h, 1.2 * b.h + 10];
  const c: [number, number] = [b.x, b.feetY - 0.62 * b.h];
  const wr = herWrist(b.x, b.feetY, b.h);
  const L = HER_LIGHT;
  const grain = maps.live.grain;
  return (
    <>
      {fig}
      {lit ? (
        <>
          <ShadeOf of={fig} region={region} tint={L.shade.tint} opacity={L.shade.opacity} />
          {grain ? <GrainOn of={fig} region={region} tile={grain} at={[region[0], region[1]]} opacity={0.7} /> : null}
          {maps.live.wrap ? <WrapOf of={fig} region={region} img={maps.live.wrap} width={L.wrap.width} opacity={L.wrap.opacity} blur={0.8} /> : null}
          <RimOf of={fig} region={region} l={toward(c, SRC_IMG)} width={L.up.width} color={L.up.color} opacity={L.up.opacity} soft={L.up.soft} blur={0.6} />
          <PoolOn of={fig} region={region} at={[wr[0], wr[1] + 6]} r={L.pool.r * b.h} color={GOLD.gold} opacity={L.pool.opacity} />
        </>
      ) : null}
    </>
  );
};

/** Pip on the houseboat's roof among the pots, in the blue hour's shade (tone-on-tone): a second look's find. */
const PipHidden: React.FC = () => {
  const on = useMoverOn('pip');
  const lit = useLit();
  if (!on) return null;
  const p = pipScreen();
  const pip = (
    <Look ink={false}>
      <Pip x={p.x} y={p.y} size={p.size} pose="sit" facing="back" paint="colour" seed="t01pip" idle={0} t={1.0} />
    </Look>
  );
  const region: Region = [p.x - p.size, p.y - p.size * 1.3, p.size * 2, p.size * 1.45];
  return (
    <>
      {pip}
      {lit ? <ShadeOf of={pip} region={region} tint={HER_LIGHT.shade.tint} opacity={0.7} /> : null}
    </>
  );
};

/** The stream and her phone at its end (the wrist's screen point, a touch past it: the phone in her fingers). */
const StreamLit: React.FC = () => {
  const b = herScreen();
  const wr = herWrist(b.x, b.feetY, b.h);
  const phone: [number, number] = [wr[0] - 0.055 * b.h, wr[1] + 0.012 * b.h];
  return (
    <>
      <Stream phone={phone} />
      <Phone at={phone} />
    </>
  );
};

export const T01Scene: React.FC<{slab?: string}> = ({slab}) => (
  <World sky={slab ?? '#2E3160'} horizon={scene.camera.cy}>
    {PLANES.map((name) => (
      <Plane key={name} name={name}>
        {name === 'bridge' ? <HerLit /> : null}
        {name === 'boat' ? <PipHidden /> : null}
        {name === 'rail' ? <HerLit above /> : null}
        {name === 'glow' ? <StreamLit /> : null}
      </Plane>
    ))}
  </World>
);

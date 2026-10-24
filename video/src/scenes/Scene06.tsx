// S06 "A heads-up" — "They gave the PHP people a heads-up," (cut(was) -> cut(heads-up); 19.773-21.985 s).
// Makers' Lane at golden hour (MakersLane + Workshop, WORKSHOP_LANE): a CUT ON ACTION from S05 (the messenger enters
// left mid-stride, the camera trucking right at S05's exit speed, ~890 px/s, decelerating over a fixed 0.63 s with
// multiplane parallax), Pip mid-leap behind him; on 'They' the low lane-end sun presses and pops a wax seal along a
// dotted arc onto the envelope (a private letter); Bit peeks out of the messenger's collar on 'gave'; on 'PHP' the
// elephant sign swings and the slit under the blind glows (the makers are in); Pip goes 'shh'; the neighbours' curtains
// are drawn as the messenger reaches the door; the upstairs browser window lights on 'people'; on 'a' the envelope goes
// through the mail slot (Bit hops onto the sill) and on 'heads-up' three makers' heads pop UP in the browser window (a
// literal heads-up) while the blind ('still fixing...', J3) jolts; then a gust blows the printed leak sheet in from the
// left and lifts it at the lens: S07's lens wipe (this module's exported Wiper, scene06/page.tsx).
// Beats: scene06/beats.ts. Camera: scene06/camera.ts. Parts: scene06/parts.tsx. Page + Wiper: scene06/page.tsx.
// No shims (J3 uses the shared Workshop blindSign slot). Isolated previews: scene06/entry.tsx. Notes: docs/scenes/S06.md.

import React, {useId} from 'react';
import {Sun, useGlobalTime, useTime, World, XG} from '../lib';
import {MakersLane, MAKERS_LANE, People, Furniture, WORKSHOP_LANE} from './shared/sets';
import type {FurnitureItem, WalkerAnchor} from './shared/sets';
import {chromeScreen, LabelTag, SunPress, WaxSeal} from './shared/props';
import {useBeats} from './scene06/beats';
import {camAt, F, layerMat, toScreen, truckPx} from './scene06/camera';
import {BitS06, BlindJolt, envSealWorld, MakerHeads, MessengerS06, pipAt, PipS06, ShhMark} from './scene06/parts';
import {LeakPage} from './scene06/page';

export {Wiper} from './scene06/page';

// ---------------------------------------------------------------- layout (world px at camera rest)

const SUN = {x: 420, y: 985, r: 120};
/** Passers walking up the lane into the sun, sized on the messenger's camera (260 px at feet 1520: h = (y - 1040) /
 *  1.846), so nobody behind him reads as a giant. The set's stander is dropped (Pip's lane). */
const WALKERS: WalkerAnchor[] = [
  {...MAKERS_LANE.walkers[0], h: 114},
  {...MAKERS_LANE.walkers[1], x: 455, y: 1300, h: 141},
];
/** The set's bike by the left row; the makers' cart moved to the bottom-left corner (cropped framing), clear of Pip. */
const FURNITURE: FurnitureItem[] = [MAKERS_LANE.furniture[1], {kind: 'cart', x: 96, y: 1668, s: 1.25}];
const SCREEN = chromeScreen(...(WORKSHOP_LANE.browser as [number, number, number, number]));

const Scene06: React.FC = () => {
  const t = useTime();
  const T = useGlobalTime();
  const B = useBeats();
  const cam = camAt(t, B);
  const sealClip = 's6seal' + useId().replace(/[^a-zA-Z0-9]/g, '');

  // ---- the sun: screen space at the lane end, parallax x0.1 of the truck; 'They' = an in-place press squash
  const sx = SUN.x + F.sun * truckPx(cam);
  const sun = (
    <SunPress at={B.they} cx={sx} cy={SUN.y} r={SUN.r} mode="land">
      <Sun cx={sx} cy={SUN.y} r={SUN.r} drift={[0, 0]} />
    </SunPress>
  );

  // ---- the wax seal: out of the sun along a dotted arc onto the envelope (aimed where the envelope will be when it
  //      lands, then riding it into the slot)
  const sealLand = B.they + 0.1 + 0.33;
  const sealAt = (tt: number) => {
    const e = envSealWorld(tt, B);
    return e ? {p: toScreen(camAt(tt, B), F.near, e.p), clipY: e.clipY === null ? null : toScreen(camAt(tt, B), F.near, [0, e.clipY])[1]} : null;
  };
  const sealNow = sealAt(t);
  const sealTo = t < sealLand ? sealAt(sealLand) : sealNow;

  const wrap = (name: string, _near: number, node: React.ReactNode) => {
    if (name === 'sun') return node;
    const f = name === 'far' || name === 'roofs' ? F.far : name === 'floor' ? F.floor : name === 'houses' ? F.houses : name === 'workshop' ? F.workshop : F.floor;
    return (
      <XG key={name} m={layerMat(cam, f)}>
        {node}
        {name === 'workshop' ? (
          <>
            <BlindJolt x0={WORKSHOP_LANE.shop[0]} x1={WORKSHOP_LANE.shop[0] + WORKSHOP_LANE.shop[2]} y={WORKSHOP_LANE.blindTo} at={B.headsUp} />
            <MakerHeads screen={SCREEN} at={B.headsUp} />
          </>
        ) : null}
      </XG>
    );
  };

  const pipShh = pipAt(B.shh, B);
  return (
    <World sky={[{t: 0, tod: 'golden'}]}>
      <MakersLane
        sun={sun}
        curtainsAt={B.door}
        workshop={{
          glowAt: B.php,
          makersAt: false,
          blind: 'up',
          blindDownAt: -5,
          signSwingAt: B.php,
          slotClickAt: B.click,
          screenOnAt: B.people,
          // J3 'still fixing...' (the shared blindSign slot) on the half-down blind; it jolts on 'heads-up'
          blindSign: (a) => <LabelTag kind="card" x={a.x} y={a.y + 16} text={['still', 'fixing...']} fontSize={27} swing={[B.headsUp]} seed="s6J3" />,
        }}
        people={false}
        furniture={false}
        wrap={wrap}
        seed="lane"
      />

      {/* life on the lane floor (same parallax as the floor) */}
      <XG m={layerMat(cam, F.floor)}>
        <People anchors={WALKERS} vp={MAKERS_LANE.vp} spec={{walk: 0}} seed="s6ppl" />
        <Furniture items={FURNITURE} seed="s6furn" />
      </XG>

      {/* the reference plane: Pip (behind, feet 1480), the messenger (feet 1520), Bit on his shoulder, the 'shh' */}
      <XG m={layerMat(cam, F.near)}>
        <PipS06 B={B} />
        <ShhMark x={pipShh.x + 78} y={pipShh.y - 128} at={B.shh + 0.06} outAt={B.shh + 0.4} />
        <MessengerS06 B={B} />
        <BitS06 B={B} />
      </XG>

      {/* screen space: the seal (clipped by the slot while the envelope goes in), the leak page */}
      {sealNow && sealTo ? (
        <>
          {sealNow.clipY !== null ? (
            <defs>
              <clipPath id={sealClip}>
                <rect x={-200} y={-200} width={1500} height={sealNow.clipY + 200} />
              </clipPath>
            </defs>
          ) : null}
          <g clipPath={sealNow.clipY !== null ? `url(#${sealClip})` : undefined}>
            <WaxSeal from={[sx + SUN.r * 0.86, SUN.y - SUN.r * 0.72]} to={sealTo.p} at={B.they} dur={0.33} arc={60} seed="s6seal" />
          </g>
        </>
      ) : null}
      <LeakPage T={T} />
    </World>
  );
};

export default Scene06;

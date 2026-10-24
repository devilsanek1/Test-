// S06 "A heads-up" — "They gave the PHP people a heads-up," (cut(was) -> cut(heads-up); 19.773-21.985 s).
// Makers' Lane at golden hour (MakersLane + Workshop, WORKSHOP_LANE): a CUT ON ACTION from S05 (the messenger enters
// left mid-stride, the camera trucking right at S05's exit speed, the frame-filling layers too, decelerating over a
// fixed 0.63 s with multiplane parallax), Pip mid-leap behind him; on 'They' the low lane-end sun presses and pops a wax
// seal along a dotted arc onto the envelope (a private letter); Bit peeks out of the messenger's collar on 'gave'; on
// 'PHP' the elephant sign swings and the slit under the blind glows (the makers are in); Pip goes 'shh'; the neighbours'
// curtains are drawn as the messenger reaches the door; the upstairs browser window lights on 'people' while he leans in
// and knocks twice, a pigeon lands on the cornice; on 'a' the envelope goes through the mail slot (Bit hops onto the
// sill) and on 'heads-up' three makers' heads pop UP in the browser window (a literal heads-up) while the blind ('still
// fixing...', J3) jolts and the wire pigeons hop; then a gust blows the printed leak sheet in from the left and lifts
// it at the lens: S07's lens wipe (this module's exported Wiper, scene06/page.tsx).
// Beats: scene06/beats.ts. Camera: scene06/camera.ts. Parts: scene06/parts.tsx. Dressing: scene06/dress.tsx. Seal +
// sun press: scene06/seal.tsx. Page + Wiper: scene06/page.tsx. Shims (listed in docs/scenes/S06.md): the messenger's
// hair + collar (parts.tsx HairCollar), SunPressS06 / WaxSealS06 (seal.tsx). Isolated previews: scene06/entry.tsx.

import React, {useId} from 'react';
import {palette, Sun, useGlobalTime, useTime, World, XG} from '../lib';
import {MakersLane, MAKERS_LANE, People, Furniture, WORKSHOP_LANE} from './shared/sets';
import type {FurnitureItem, WalkerAnchor} from './shared/sets';
import {chromeScreen, LabelTag} from './shared/props';
import {useBeats} from './scene06/beats';
import {camAt, F, fOf, layerM, REST, toScreen, truckPx} from './scene06/camera';
import type {Layer} from './scene06/camera';
import {BitS06, BlindJolt, envSealWorld, MakerHeads, MessengerS06, pipAt, PipS06, Shadows, ShhMark} from './scene06/parts';
import {DoorDressing, FarSkyline, ForegroundRight, PolesAndWires} from './scene06/dress';
import {sealLandAt, SunPressS06, WaxSealS06} from './scene06/seal';
import {LeakPage} from './scene06/page';

export {Wiper} from './scene06/page';

// ---------------------------------------------------------------- layout (world px at camera rest)

const SUN = {x: 420, y: 985, r: 120};
/** Passers walking up the lane into the sun, sized on the messenger's camera (260 px at feet 1520: h = (y - 1040) /
 *  1.846), so nobody behind him reads as a giant; plus a far queue of tiny ones toward the sun (fix round 1: ref2 f_1's
 *  people converge on the vanishing point). The set's stander is dropped (Pip's lane). */
const WALKERS: WalkerAnchor[] = [
  {...MAKERS_LANE.walkers[0], h: 114},
  {...MAKERS_LANE.walkers[1], x: 455, y: 1300, h: 141},
  {x: 352, y: 1176, h: 74, go: 'vp', body: palette.tan, hair: 'bun'},
  {x: 418, y: 1150, h: 59, go: 'vp', body: palette.cream, hair: 'short', acc: ['backpack']},
  {x: 377, y: 1128, h: 48, go: 'vp', body: palette.sage, hair: 'curly'},
  {x: 446, y: 1114, h: 40, go: 'vp', body: palette.brown, hair: 'short'},
];
/** The set's bike by the left row; a planter on the left kerb; the makers' cart in the bottom-left corner (cropped). */
const FURNITURE: FurnitureItem[] = [MAKERS_LANE.furniture[1], {kind: 'planter', x: 156, y: 1384, s: 0.62}, {kind: 'cart', x: 96, y: 1668, s: 1.25}];
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
    <SunPressS06 at={B.they} cx={sx} cy={SUN.y} r={SUN.r}>
      <Sun cx={sx} cy={SUN.y} r={SUN.r} drift={[0, 0]} />
    </SunPressS06>
  );

  // ---- the wax seal: out of the sun along a low dotted arc onto the envelope (aimed where the envelope will be when it
  //      lands, then riding it into the slot)
  const SEAL_DUR = 0.4;
  const sealLand = sealLandAt(B.they, SEAL_DUR);
  const sealAt = (tt: number) => {
    const e = envSealWorld(tt, B);
    return e ? {p: toScreen(camAt(tt, B), F.near, e.p), clipY: e.clipY === null ? null : toScreen(camAt(tt, B), F.near, [0, e.clipY])[1]} : null;
  };
  const sealNow = sealAt(t);
  const sealTo = t < sealLand ? sealAt(sealLand) : sealNow;

  const layerOf = (name: string): Layer => (name === 'far' || name === 'roofs' ? 'far' : name === 'houses' ? 'houses' : name === 'workshop' ? 'workshop' : 'floor');
  const wrap = (name: string, _near: number, node: React.ReactNode) => {
    if (name === 'sun') return node;
    return (
      <XG key={name} m={layerM(cam, layerOf(name))}>
        {node}
        {name === 'roofs' ? <FarSkyline /> : null}
        {name === 'houses' ? <PolesAndWires hopAt={B.headsUp} /> : null}
        {name === 'workshop' ? (
          <>
            <DoorDressing pigeonAt={B.people + 0.13} />
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

      {/* life on the lane floor (same parallax as the floor): the low sun's shadows first, then the passers, furniture */}
      <XG m={layerM(cam, 'floor')}>
        <Shadows B={B} dx={(fOf(cam, 'floor') - fOf(cam, 'near')) * (cam.x - REST.x)} />
        <People anchors={WALKERS} vp={MAKERS_LANE.vp} spec={{walk: 0}} seed="s6ppl" />
        <Furniture items={FURNITURE} seed="s6furn" />
      </XG>

      {/* the reference plane: Pip (behind, feet 1480), the messenger (feet 1520), Bit on his shoulder, the 'shh' */}
      <XG m={layerM(cam, 'near')}>
        <PipS06 B={B} />
        <ShhMark x={pipShh.x + 84} y={pipShh.y - 132} at={B.shh + 0.06} outAt={B.shh + 0.42} />
        <MessengerS06 B={B} />
        <BitS06 B={B} />
      </XG>

      {/* the cropped foreground at the bottom-right edge */}
      <XG m={layerM(cam, 'fg')}>
        <ForegroundRight />
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
            <WaxSealS06 from={[sx + SUN.r * 0.86, SUN.y - SUN.r * 0.72]} to={sealTo.p} at={B.they} dur={SEAL_DUR} arc={26} r={23} sun={[sx, SUN.y]} />
          </g>
        </>
      ) : null}
      <LeakPage T={T} own />
    </World>
  );
};

export default Scene06;

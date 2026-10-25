// S06 "A heads-up" — "They gave the PHP people a heads-up," (cut(was) -> cut(heads-up); 19.773-21.985 s).
// Makers' Lane at golden hour (MakersLane + Workshop, WORKSHOP_LANE): a CUT ON ACTION from S05 (the messenger enters
// left mid-stride, the camera trucking right at S05's exit speed, the frame-filling layers too, decelerating over a
// fixed 0.63 s with multiplane parallax), Pip leaping in BEHIND him; on 'They' the low lane-end sun presses and pops a
// wax seal along a dotted arc onto the envelope (a private letter); Bit peeks out of the messenger's collar on 'gave'; on
// 'PHP' the elephant sign swings and the slit under the blind glows (the makers are in); Pip goes 'shh'; a neighbour
// draws a curtain as the messenger reaches the door; the upstairs browser window lights on 'people' while he leans in
// and knocks twice, a pigeon lands on the cornice; on 'a' the envelope goes through the mail slot (Bit hops onto the
// sill) and on 'heads-up' three makers' heads pop UP in the browser window (a literal heads-up) while the blind ('still
// fixing...', J3) jolts and the wire pigeons hop; then a gust blows the printed leak sheet in from the left and lifts
// it at the lens: S07's lens wipe (this module's exported Wiper, scene06/page.tsx).
// Fix round 3: the lens hand-over runs S07's lensOutAt from the hold (no pop at the cut), the seal pops from the sun's
// upper-right rim with a cream ring, festoon lights frame the top, the messenger walks on his own legs (scene06/parts).
// Beats: scene06/beats.ts. Camera: scene06/camera.ts. Parts: scene06/parts.tsx. Dressing: scene06/dress.tsx. Seal +
// sun press: scene06/seal.tsx. Page + Wiper: scene06/page.tsx. Messenger hero detail: scene06/msgDetail.tsx. Shims
// (listed in docs/scenes/S06.md): SunPressS06 / WaxSealS06 (seal.tsx), LensSheet (page.tsx), MessengerDetail, and the
// set overrides in dress.tsx. Isolated previews: scene06/entry.tsx.

import React, {useId} from 'react';
import {palette, Sun, useGlobalTime, useTime, World, XG} from '../lib';
import {MakersLane, MAKERS_LANE, People, Furniture, WORKSHOP_LANE} from './shared/sets';
import type {FurnitureItem, WalkerAnchor} from './shared/sets';
import {chromeScreen, FixSign} from './shared/props';
import {useBeats} from './scene06/beats';
import {camAt, F, fOf, layerM, REST, toScreen, truckPx} from './scene06/camera';
import type {Layer} from './scene06/camera';
import {BitS06, BlindJolt, envSealWorld, MakerHeads, MessengerS06, pipAt, PipS06, Shadows, SHH_HOLD, ShhMark, shhTipWorld} from './scene06/parts';
import {DoorDressing, FarSkyline, FestoonLights, FloorCover, ForegroundRight, LeftRowDetail, NeighbourRight, PaneCurtain, PolesAndWires} from './scene06/dress';
import {sealLandAt, SunPressS06, WaxSealS06} from './scene06/seal';
import {LeakPage} from './scene06/page';

export {Wiper} from './scene06/page';

// ---------------------------------------------------------------- layout (world px at camera rest)

const SUN = {x: 420, y: 985, r: 120};
/** The sun's idle drift (px/s, screen): ENGINE 9, the sun is never perfectly still (S07 does not match-cut on it). */
const SUN_DRIFT = 8;
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

  // ---- the sun: screen space at the lane end, parallax x0.1 of the truck, an 8 px/s idle drift (fix round 3: never
  //      perfectly still); 'They' = an in-place press squash that BOTTOMS OUT on the word (led 0.06 s: rule 5)
  const sx = SUN.x + F.sun * truckPx(cam);
  const sxd = sx + SUN_DRIFT * t;
  const sun = (
    <SunPressS06 at={B.they - 0.06} cx={sxd} cy={SUN.y} r={SUN.r}>
      <Sun cx={sx} cy={SUN.y} r={SUN.r} drift={[SUN_DRIFT, 0]} />
    </SunPressS06>
  );

  // ---- the wax seal: out of the sun along a low dotted arc onto the envelope (aimed where the envelope will be when it
  //      lands, then riding it into the slot)
  // fix round 2: the seal lands BEFORE Pip's shh (pop 0.08 + 0.25 s flight: 20.31). Fix round 3: it pops out of the
  // sun's UPPER-RIGHT rim (40 deg above its horizontal, 4 px outside the rim) against the mint sky, not into the peach
  // band and the far roofs (orange on orange read as a blob)
  const SEAL_DUR = 0.25;
  const SEAL_FROM: [number, number] = [sxd + (SUN.r + 4) * Math.cos(-0.7), SUN.y + (SUN.r + 4) * Math.sin(-0.7)];
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
        {name === 'floor' ? <FloorCover /> : null}
        {name === 'houses' ? (
          <>
            <LeftRowDetail />
            <PaneCurtain at={B.door} />
            <PolesAndWires hopAt={B.headsUp} />
          </>
        ) : null}
        {name === 'workshop' ? (
          <>
            <NeighbourRight />
            <DoorDressing pigeonAt={B.people + 0.13} />
            <BlindJolt x0={WORKSHOP_LANE.shop[0]} x1={WORKSHOP_LANE.shop[0] + WORKSHOP_LANE.shop[2]} y={WORKSHOP_LANE.blindTo} at={B.headsUp} />
            <MakerHeads screen={SCREEN} at={B.headsUp - 0.07} tickAt={B.headsUp} />
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
        // fix round 3: no set-wide pane pop (it read as lights switching on); ONE neighbour draws a curtain instead
        // (PaneCurtain in the houses layer below). Sets request: curtainsAt {t, panes: [i]}
        curtainsAt={1e9}
        workshop={{
          glowAt: B.php,
          makersAt: false,
          blind: 'up',
          blindDownAt: -5,
          signSwingAt: B.php,
          slotClickAt: B.click,
          screenOnAt: B.people,
          // J3 'still fixing...': props FixSign, THE one sign of J3 / J4 / J5 (S07's blind, S09's cart, S10), hung from the
          // blind's nail (the set's blindSign anchor); it swings on 'heads-up'. fs 26 = S07's J4 (~27 px on screen)
          blindSign: (a) => <FixSign x={a.x} y={a.y} fs={26} swingAt={[B.headsUp]} seed="s6J3" />,
        }}
        people={false}
        furniture={false}
        wrap={wrap}
        seed="lane"
      />

      {/* life on the lane floor (same parallax as the floor): the low sun's shadows first, then the passers, furniture */}
      <XG m={layerM(cam, 'floor')}>
        <Shadows B={B} dx={(fOf(cam, 'floor') - fOf(cam, 'near')) * (cam.x - REST.x)} walkers={WALKERS} />
        <People anchors={WALKERS} vp={MAKERS_LANE.vp} spec={{walk: 0}} seed="s6ppl" />
        <Furniture items={FURNITURE} seed="s6furn" />
      </XG>

      {/* the reference plane: Pip (behind, feet 1480), the messenger (feet 1520), Bit on his shoulder, the 'shh' */}
      <XG m={layerM(cam, 'near')}>
        <PipS06 B={B} />
        {/* fix round 3: the hush ticks re-flick mid-hold (20.72: the quiet pocket between the curtain and the screen) */}
        <ShhMark x={pipShh.x + 140} y={pipShh.y - 122} at={B.shh + 0.06} outAt={B.shh + SHH_HOLD - 0.05} flickAt={B.door + 0.055} tail={shhTipWorld(B.shh + 0.1, B)} />
        <MessengerS06 B={B} zoom={cam.z} />
        <BitS06 B={B} />
      </XG>

      {/* the cropped foreground at the bottom-right edge */}
      <XG m={layerM(cam, 'fg')}>
        <ForegroundRight />
        <FestoonLights />
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
            <WaxSealS06 from={SEAL_FROM} to={sealTo.p} at={B.they} dur={SEAL_DUR} arc={18} r={19} sun={[sxd, SUN.y]} />
          </g>
        </>
      ) : null}
      <LeakPage T={T} own />
    </World>
  );
};

export default Scene06;

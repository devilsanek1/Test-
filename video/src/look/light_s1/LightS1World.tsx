// light_s1: S1's WORLD with light slots (light_proof.md §2.1). A copy of src/look/paint_s1/V2S1_set.tsx's S1World
// (v6's scene 1; every part imported unchanged from paint_s1), with two additions and no other change:
//   <Seg name>   each part is a named segment (the bake renders segments alone for their masks; the movers can be off)
//   <Slot name>  each plane's baked light maps, INSIDE that plane's float group right after what they light, so they
//                ride the plane's float like its shapes (organic/light.md §4.2, §4.10)
// In look 'v6' no slot draws and the tree is v6's exactly (pixel-identical to PaintS1 set 'v6': checked by the bake).
// The west gap's three planes (+4 far roofs, +3 calm tower, +2 bridge) are drawn by paint_s1's S1WestGap in one go, so
// their three slots sit right after it (and the bridge's far life), each in its own plane's float.
import React from 'react';
import {Tier} from '../../lib/tier';
import {CM} from '../../v2r/palette';
import {Cloud} from '../../v2r/kit/canal/life';
import {CanalCast} from '../../v2r/kit/canal/slots';
import {k4Person} from '../../v2r/kit/canal/k4k5';
import * as MAP from '../../v2r/world/map';
import {useTime} from '../../lib/time';
import {PaintedGroup, PaintedLayer} from '../../lib/paint';
import {S1WestGap, FarRoofs, CalmTower} from '../paint_s1/V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from '../paint_s1/V2S1_set_wing';
import {S1FarTowpath, S1PathFurniture, S1Boats, S1FarLife, S1PlaneBranch} from '../paint_s1/V2S1_set_life';
import {S1Water, S1Duck} from '../paint_s1/V2S1_water';
import {S1BoatStrips, S1TowpathShadows, S1WingShades} from '../paint_s1/V2S1_light';
import {S1Plane, S1PlaneStack, S1_PLANE} from '../paint_s1/V2S1_float';
import {useSwitches} from '../paint_s1/switches';
import {CloudSlot, SpraySlot, TextureSlot} from '../paint_s1/engine';
import {S1PipShadows} from '../paint_s1/V2S1_pip';
import {DuskOverlay, DuskWater} from '../paint_s1/dusk';
import {Seg, Slot} from './context';

export type LightS1WorldProps = {
  behindDoor?: React.ReactNode;
  towpath?: React.ReactNode;
  seated?: React.ReactNode;
  pip?: React.ReactNode;
};

const S = MAP.S1_SHEET;
const CLOUD_BAR = {x: 40, y: 236, w: 300, h: 20, speed: 9} as const;

/** The sky things (paint_s1's S1SkyThings, which is not exported: the same tree). */
const SkyThings: React.FC = () => {
  const sw = useSwitches();
  const t = useTime();
  return (
    <TextureSlot sw={sw} t={t} plane={S1_PLANE.sky} sky>
      <PaintedGroup group="clouds">
        <PaintedLayer piece={'cloud'}>
          <CloudSlot
            sw={sw}
            fallback={<Cloud x={S.heroCloud.x0} y={S.heroCloud.y0 + 40} w={S.heroCloud.x1 - S.heroCloud.x0} h={(S.heroCloud.y1 - S.heroCloud.y0) * 0.7} seed="s1cloud" speed={S.heroCloudDriftPxS} top={CM.paper} />}
          />
        </PaintedLayer>
        <PaintedLayer piece={'cloudbar'}>
          {sw.cloud ? null : <Cloud x={CLOUD_BAR.x} y={CLOUD_BAR.y} w={CLOUD_BAR.w} h={CLOUD_BAR.h} seed="s1cloudbar" speed={CLOUD_BAR.speed} />}
        </PaintedLayer>
      </PaintedGroup>
    </TextureSlot>
  );
};

const Env: React.FC<{children?: React.ReactNode}> = ({children}) => <Tier tier="environment">{children}</Tier>;

export const LightS1World: React.FC<LightS1WorldProps> = ({behindDoor, towpath, seated, pip}) => {
  const sw = useSwitches();
  return (
    <CanalCast person={k4Person}>
      <Env>
        <Seg name="clouds">
          <SkyThings />
        </Seg>
        {/* the sky's maps: the sky never floats */}
        <Slot name="sky" />
        <S1Plane plane={S1_PLANE.near} texture={false} over={<Slot name="spray" />}>
          <Seg name="spray">
            <SpraySlot sw={sw} fallback={<S1PlaneBranch />} />
          </Seg>
        </S1Plane>
        <Seg name="westgap">
          <S1WestGap />
        </Seg>
        {/* mask-only (the bake's split of the west gap): the far roofs and the calm tower alone, as S1WestGap draws them */}
        <Seg name="farroofs">
          <S1Plane plane={S1_PLANE.farRoofs}>
            <PaintedLayer piece="farroofs">
              <FarRoofs />
            </PaintedLayer>
          </S1Plane>
        </Seg>
        <Seg name="fartower">
          <S1Plane plane={S1_PLANE.farTower}>
            <PaintedLayer piece="fartower">
              <CalmTower />
            </PaintedLayer>
          </S1Plane>
        </Seg>
        <S1Plane plane={S1_PLANE.bridge} texture={false}>
          <Seg name="farlife">
            <S1FarLife />
          </Seg>
        </S1Plane>
        {/* the west gap's three planes' maps, each in its own float (after the bridge's far life, which they also light) */}
        <S1Plane plane={S1_PLANE.farRoofs} texture={false}>
          <Slot name="farroofs" />
        </S1Plane>
        <S1Plane plane={S1_PLANE.farTower} texture={false}>
          <Slot name="fartower" />
        </S1Plane>
        <S1Plane plane={S1_PLANE.bridge} texture={false}>
          <Slot name="bridge" />
        </S1Plane>
        <S1Plane plane={S1_PLANE.water} over={<Slot name="water" />}>
          <Seg name="water">
            <PaintedLayer piece="water">
              <DuskWater>
                <S1Water />
              </DuskWater>
            </PaintedLayer>
          </Seg>
        </S1Plane>
      </Env>
      <S1PlaneStack
        plane={S1_PLANE.subject}
        layers={[
          {
            node: (
              <Env>
                <Seg name="fartowpath">
                  <S1FarTowpath />
                </Seg>
                <Seg name="wing">
                  <S1Wing behindDoor={behindDoor} />
                </Seg>
                <Seg name="doorleaves">
                  <S1DoorLeaves />
                </Seg>
              </Env>
            ),
          },
          {
            node: (
              <Seg name="wingshades">
                <Env>
                  <S1WingShades />
                </Env>
              </Seg>
            ),
            mottle: false,
          },
          {
            node: (
              <Seg name="winglife">
                <Env>
                  <S1WingLife />
                </Env>
              </Seg>
            ),
          },
          {node: <DuskOverlay x={300} y={596} w={780} h={470} stops={[[0, '#FFB070', 0.55], [0.55, '#FFC890', 0.25], [1, '#C8A8E0', 0.18]]} />, mottle: false},
          {
            node: (
              <Seg name="towpathshadows">
                <S1TowpathShadows />
              </Seg>
            ),
            mottle: false,
          },
          {
            node: (
              <>
                <Seg name="pathfurniture">
                  <Env>
                    <S1PathFurniture />
                  </Env>
                </Seg>
                {/* the subject plane's maps: the backlit facade, the lit doorway and its bloom, the sun's rims; then
                    her (and her live light) in the towpath slot */}
                <Slot name="subject" />
                {towpath}
              </>
            ),
          },
        ]}
      />
      <S1Plane
        plane={S1_PLANE.boats}
        texture={false}
        under={
          <Seg name="boatstrips">
            <Env>
              <S1BoatStrips which="A" />
              <S1BoatStrips which="B" />
            </Env>
          </Seg>
        }
        over={<Slot name="boats" />}
      >
        <Env>
          <Seg name="boats">
            <S1Boats />
          </Seg>
          <Seg name="duck">
            <S1Duck />
          </Seg>
        </Env>
      </S1Plane>
      {seated}
      <S1Plane
        plane={S1_PLANE.bank}
        under={
          pip ? (
            <Seg name="pipshadows">
              <S1PipShadows />
            </Seg>
          ) : null
        }
        texture={false}
      >
        {pip}
      </S1Plane>
    </CanalCast>
  );
};

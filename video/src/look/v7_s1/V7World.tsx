// v7_s1: S1's WORLD and OUR BANK, v7 (ORGANIC.md §6 steps 4, 1, 2). Built from src/look/light_s1/LightS1World.tsx and
// LightS1Steps.tsx (the segments and the per-plane light slots, each INSIDE its plane's float group right after what it
// lights) with three changes and nothing else:
//   the cut (step 4)   only what composition.md's T1/T3 keeps is drawn: the sky's one hero cloud and its calm planes,
//                      the far city, the bridge and its far life, the canal, the far towpath with its furniture, the wing
//                      with her, boat A with Pip on its roof (./V7Props), our bank, one table and one chair at the right
//                      edge, nine fallen leaves (./V7Props). Never drawn: the leaf spray, the cloud bar, the duck, boat
//                      B, the boater, the cat, the bench, the bay tree, the planter, the crates, the pier and its thyme,
//                      the fern pot, the composers' own seventeen fallen leaves
//   the lobby          the wing drawn a second time inside the door's opening only, through the ACCENT map: the lobby
//                      takes the scene's one hot accent while every lit pane takes the calm cream (they share v2's lamp
//                      role, and paint_s1 keeps the lobby inside S1Wing). Its own segment ('lobby'), so the bake finds it
//   the design frame   (V7CtxV.design) the canal drawn as the vector water, outside the key: the painter's input
// Every leaf part is paint_s1's, unchanged; the key (step 1) is applied around this tree by V7Scene's <Tod map>.
import React from 'react';
import {Tier} from '../../lib/tier';
import {Tod} from '../../lib/tod';
import {Shade} from '../../lib/light';
import {CanalCast} from '../../v2r/kit/canal/slots';
import {k4Person} from '../../v2r/kit/canal/k4k5';
import {PaintedGroup, PaintedLayer} from '../../lib/paint';
import {S1WestGap, FarRoofs, CalmTower} from '../paint_s1/V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from '../paint_s1/V2S1_set_wing';
import {S1FarTowpath, S1PathFurniture, S1FarLife} from '../paint_s1/V2S1_set_life';
import {S1Water} from '../paint_s1/V2S1_water';
import {S1BoatStrips, S1TowpathShadows, S1WingShades} from '../paint_s1/V2S1_light';
import {S1Plane, S1PlaneStack, S1_PLANE} from '../paint_s1/V2S1_float';
import {floodAt} from '../paint_s1/V2S1_clock';
import {BANDS, Coping, StoneBand, edgePath} from '../paint_s1/V2S1_steps_stone';
import {accentV7, identityV7} from './palette_v7';
import {Seg, Slot, useKeyed, useV7} from './context';
import {V7Boat, V7NearProps} from './V7Props';
import {PieceSlot, usePiece} from './pieces';

export type V7WorldProps = {
  /** Her (and her live light) in the subject plane's towpath slot. */
  towpath?: React.ReactNode;
  /** Pip (and its live light) on boat A's roof, over the boats' maps. */
  pip?: React.ReactNode;
};

/** The door's opening between its frame's posts (light_s1 labels.py OPENING, measured in the render). */
export const V7_OPENING = [553, 850, 705, 1076] as const;

const Env: React.FC<{children?: React.ReactNode}> = ({children}) => <Tier tier="environment">{children}</Tier>;

/** The sky things: the painted cloud planes only (the cloud bar and the leaf spray are cut). */
const SkyThings: React.FC = () => (
  <S1Plane plane={S1_PLANE.sky} texture={false}>
    <PaintedGroup group="clouds">
      <PaintedLayer piece={'cloud'} />
    </PaintedGroup>
    <PieceSlot name="clouds" />
  </S1Plane>
);

/** The lobby through the accent map: the wing again, clipped to the door's opening (only the lobby shows). */
const Lobby: React.FC = () => {
  const keyed = useKeyed();
  if (!keyed) return null;
  const [x0, y0, x1, y1] = V7_OPENING;
  return (
    <>
      <defs>
        <clipPath id="v7lobbyclip" clipPathUnits="userSpaceOnUse">
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
        </clipPath>
      </defs>
      <g clipPath="url(#v7lobbyclip)">
        <Tod map={accentV7}>
          <S1Wing />
        </Tod>
      </g>
    </>
  );
};

/** The canal: the painted piece (its flat fallback the vector water); for the painter's design frame the vector water
 *  outside the key (the painter reads v2's water hues as "water"). */
const Canal: React.FC = () => {
  const {design} = useV7();
  if (design)
    return (
      <Tod map={identityV7}>
        <S1Water />
      </Tod>
    );
  return (
    <PaintedLayer piece="water">
      <S1Water />
    </PaintedLayer>
  );
};

export const V7World: React.FC<V7WorldProps> = ({towpath, pip}) => (
  <CanalCast person={k4Person}>
    <Env>
      <Seg name="clouds">
        <SkyThings />
      </Seg>
      {/* the sky's maps: the sky never floats */}
      <Slot name="sky" />
      <Seg name="westgap">
        <S1WestGap />
        <S1Plane plane={S1_PLANE.farTower} texture={false}>
          <PieceSlot name="farcity" />
        </S1Plane>
      </Seg>
      {/* mask-only (the bake's split of the west gap): the far roofs and the calm tower alone */}
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
          <Canal />
          <PieceSlot name="water" />
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
                <S1Wing />
              </Seg>
              <Seg name="lobby">
                <Lobby />
              </Seg>
              <Seg name="wing">
                <PieceSlot name="facade" />
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
              {/* the subject plane's maps (the backlit facade, the lit doorway, its bloom, the sun's rims), then her */}
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
          </Env>
        </Seg>
      }
      over={
        <>
          <Slot name="boats" />
          {pip}
        </>
      }
    >
      <Env>
        <Seg name="boats">
          <V7Boat />
        </Seg>
      </Env>
    </S1Plane>
    <V7Steps />
  </CanalCast>
);

/** OUR BANK (light_s1's LightS1Steps, cut): the coping, the landing and the treads with their lips' shades (the bench
 *  is cut); the near plane holds the one table and chair (./V7Props). In look 'v7' the painted quay REPLACES the stone
 *  bands (painted from their flat render: the same coping, landing, treads and lips), so they are not drawn under it. */
export const V7Steps: React.FC = () => {
  const paving = usePiece('paving');
  const prop = usePiece('prop');
  return (
    <>
      <S1Plane plane={S1_PLANE.bank} over={<Slot name="bank" />}>
        <Seg name="bank">
          {paving ? null : (
            <>
              <Tier tier="environment">
                <Coping />
                <StoneBand k={0} />
              </Tier>
              {BANDS.slice(1).map((b) => (
                <React.Fragment key={b.k}>
                  <Tier tier="environment">
                    <StoneBand k={b.k} />
                  </Tier>
                  <Shade d={edgePath(b.k)} at={floodAt(540, b.y0)} />
                </React.Fragment>
              ))}
            </>
          )}
          <PieceSlot name="paving" />
        </Seg>
      </S1Plane>
      <S1Plane plane={S1_PLANE.near} over={<Slot name="near" />}>
        <Seg name="near">
          <V7NearProps props={!prop} />
          <PieceSlot name="prop" />
          <PieceSlot name="leaves" />
        </Seg>
      </S1Plane>
    </>
  );
};

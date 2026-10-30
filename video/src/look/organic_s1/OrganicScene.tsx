// The ORGANIC PROOF's scene (docs/look/organic/organic_proof.md; owner, 2026-10-30: "It feels like a lot of our design
// is too square and proper ... They are more regular more naturally blend"; playbook ORGANIC, NOT GEOMETRIC). v6's
// scene 1 exactly (src/look/paint_s1, set 'v6'), copied here at the three places where the proof needs a slot, so
// nothing in paint_s1 is edited:
//   V2S1     -> OrganicV2S1    the same body; it composes the world and our bank below
//   S1World  -> OrganicWorld   + the near cumulus (`cloud`) over v6's far and mid cloud planes, + the painted facade
//                               (`facade`) right over the wing, under the door's sliding leaves (the wing's baked shades
//                               are in it, so S1WingShades goes quiet)
//   S1Steps  -> OrganicSteps   the painted bank (`paving`: treads, lips, coping and the ground's cast shadows, baked) in
//                               place of the stone bands; the near tree (`tree`) in the near plane's `under`
// Each piece is ONE baked RGBA image (scripts/look/organic/organic_proof.py -> ./paint/), drawn in its own plane's group
// so it rides that plane's float (locked to its layer: nothing swims); her, the row, Pip, the props, the door and the
// captions are drawn over it by the scene itself, untouched (crisp). With `organic` off this file draws v6's frame.
// Variants (`variant`, for the bake's decomposition renders only, never in a film):
//   'v6'           the frame (default)
//   'groundUnlit'  the bench's and the near things' ground shadows off (<Lit off>): their ratio to 'v6' is the shadow
//   'noProps'      our bank's things gone (bench, planter, tree, crates, café set, leaves, pier, fern): the bare treads
//   'noPip'        Pip and its bollard's shadows gone
import React, {createContext, useContext, useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {Lit, Shade, useRig} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {useTime} from '../../lib/time';
import {PARALLAX_SKY} from '../../lib/depth';
import {PaintedGroup, PaintedLayer} from '../../lib/paint';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import {Cloud} from '../../v2r/kit/canal/life';
import {CanalCast} from '../../v2r/kit/canal/slots';
import {k4Person} from '../../v2r/kit/canal/k4k5';
import * as MAP from '../../v2r/world/map';
import {FLOOD, FLOOD_ORIGIN, S1_PALE, floodAt} from '../paint_s1/V2S1_clock';
import {SkyFlood} from '../paint_s1/V2S1_sky';
import {S1Row, S1HerBehindDoor} from '../paint_s1/V2S1_row';
import {S1Pip, S1PipShadows} from '../paint_s1/V2S1_pip';
import {S1Particles} from '../paint_s1/V2S1_particles';
import {useSwitches} from '../paint_s1/switches';
import {CloudSlot, SpraySlot, TextureSlot, shadeRig} from '../paint_s1/engine';
import {duskRig, useDusk, DuskOverlay, DuskWater} from '../paint_s1/dusk';
import {useV6, v6Rig} from '../paint_s1/v6';
import {S1WestGap} from '../paint_s1/V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from '../paint_s1/V2S1_set_wing';
import {S1FarTowpath, S1PathFurniture, S1Boats, S1FarLife, S1PlaneBranch} from '../paint_s1/V2S1_set_life';
import {S1Water, S1Duck} from '../paint_s1/V2S1_water';
import {S1BoatStrips, S1TowpathShadows, S1WingShades} from '../paint_s1/V2S1_light';
import {S1Plane, S1PlaneStack, S1_PLANE} from '../paint_s1/V2S1_float';
import {BANDS, Coping, StoneBand, edgePath} from '../paint_s1/V2S1_steps_stone';
import {S1ForeMid, S1ForeNear, S1ForeNearOver, S1ForeNearUnder} from '../paint_s1/V2S1_fore';
import {ORGANIC, type OrganicPieceName} from './organic_set';

export type OrganicVariant = 'v6' | 'groundUnlit' | 'noProps' | 'noPip';
export type OrganicState = {
  /** The four organic pieces on (default) or v6's own. */
  organic: boolean;
  /** A subset of the four (A/Bs); absent = all four. */
  only?: readonly OrganicPieceName[];
  variant: OrganicVariant;
};
const OrgCtx = createContext<OrganicState>({organic: false, variant: 'v6'});
export const OrganicProvider: React.FC<{value: OrganicState; children?: React.ReactNode}> = ({value, children}) => <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>;
export const useOrganic = () => useContext(OrgCtx);
/** Is this organic piece drawn here? */
export function useOrganicOn(name: OrganicPieceName): boolean {
  const s = useOrganic();
  return s.organic && (!s.only || s.only.includes(name));
}

/** One baked organic piece: its image in its layer's own px (the box), holding the frame until it has loaded (an SVG
 *  <image> loads asynchronously). The URL comes from the bundle (an imported PNG), so no public/ folder is needed. */
export const OrganicImage: React.FC<{name: OrganicPieceName}> = ({name}) => {
  const [handle] = useState(() => delayRender(`organic ${name}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const p = ORGANIC[name];
  const [x, y, w, h] = p.box;
  return <image href={p.src} x={x} y={y} width={w} height={h} preserveAspectRatio="none" onLoad={() => continueRender(handle)} onError={() => continueRender(handle)} />;
};

// ---------------------------------------------------------------- the world (S1World's copy)

const S = MAP.S1_SHEET;
/** The ONE thin cloud bar (as S1World). */
const CLOUD_BAR = {x: 40, y: 236, w: 300, h: 20, speed: 9} as const;

/** The sky things (as S1World), then the organic near cumulus over v6's far and mid planes (the nearest plane is drawn
 *  last there too; the active paint set leaves v6's own near plane out when the organic cloud is on). */
const SkyThings: React.FC = () => {
  const sw = useSwitches();
  const t = useTime();
  const cloud = useOrganicOn('cloud');
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
      {cloud ? <OrganicImage name="cloud" /> : null}
    </TextureSlot>
  );
};

const Env: React.FC<{children?: React.ReactNode}> = ({children}) => <Tier tier="environment">{children}</Tier>;

type WorldProps = {behindDoor?: React.ReactNode; towpath?: React.ReactNode; seated?: React.ReactNode; pip?: React.ReactNode};

const OrganicWorld: React.FC<WorldProps> = ({behindDoor, towpath, seated, pip}) => {
  const sw = useSwitches();
  const facade = useOrganicOn('facade');
  return (
    <CanalCast person={k4Person}>
      <Env>
        <SkyThings />
        <S1Plane plane={S1_PLANE.near} texture={false}>
          <SpraySlot sw={sw} fallback={<S1PlaneBranch />} />
        </S1Plane>
        <S1WestGap />
        <S1Plane plane={S1_PLANE.bridge} texture={false}>
          <S1FarLife />
        </S1Plane>
        <S1Plane plane={S1_PLANE.water}>
          <PaintedLayer piece="water">
            <DuskWater>
              <S1Water />
            </DuskWater>
          </PaintedLayer>
        </S1Plane>
      </Env>
      <S1PlaneStack
        plane={S1_PLANE.subject}
        layers={[
          {
            node: (
              <Env>
                <S1FarTowpath />
                <S1Wing behindDoor={behindDoor} />
                {/* (organic) the painted facade over the wing (the door's opening and W's glass left clear in it: the
                    lobby, her and W stay the scene's own), under the sliding leaves, which move */}
                {facade ? <OrganicImage name="facade" /> : null}
                <S1DoorLeaves />
              </Env>
            ),
          },
          // (organic) the wing's shades are painted into the facade
          {node: facade ? null : <Env><S1WingShades /></Env>, mottle: false},
          {node: <Env><S1WingLife /></Env>},
          {node: <DuskOverlay x={300} y={596} w={780} h={470} stops={[[0, '#FFB070', 0.55], [0.55, '#FFC890', 0.25], [1, '#C8A8E0', 0.18]]} />, mottle: false},
          {node: <S1TowpathShadows />, mottle: false},
          {
            node: (
              <>
                <Env>
                  <S1PathFurniture />
                </Env>
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
          <Env>
            <S1BoatStrips which="A" />
            <S1BoatStrips which="B" />
          </Env>
        }
      >
        <Env>
          <S1Boats />
          <S1Duck />
        </Env>
      </S1Plane>
      {seated}
      <S1Plane plane={S1_PLANE.bank} under={pip ? <S1PipShadows /> : null} texture={false}>
        {pip}
      </S1Plane>
    </CanalCast>
  );
};

// ---------------------------------------------------------------- our bank (S1Steps' copy)

/** The bank's light layers off (the bake's 'groundUnlit' variant; and, with the organic paving on, the shadows it
 *  bakes in), the rest of the light as the scene's. */
const Unlit: React.FC<{off: boolean; children?: React.ReactNode}> = ({off, children}) => {
  const rig = useRig();
  return off ? (
    <Lit rig={rig} off>
      {children}
    </Lit>
  ) : (
    <>{children}</>
  );
};

const OrganicSteps: React.FC = () => {
  const {variant} = useOrganic();
  const paving = useOrganicOn('paving');
  const tree = useOrganicOn('tree');
  const noProps = variant === 'noProps';
  // the bench's and the near things' ground shadows: off in the decomposition render, and baked into the organic paving
  const groundOff = variant === 'groundUnlit' || paving;
  return (
    <>
      <S1Plane plane={S1_PLANE.bank}>
        {paving ? (
          <OrganicImage name="paving" />
        ) : (
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
                {b.k === 2 && !noProps ? (
                  <Unlit off={groundOff}>
                    <S1ForeMid />
                  </Unlit>
                ) : null}
              </React.Fragment>
            ))}
          </>
        )}
        {/* (organic) the bench over the painted treads (the treads in front of it never reach it: band 3's top edge
            runs 40-75 px under its base) */}
        {paving && !noProps ? (
          <Unlit off>
            <S1ForeMid />
          </Unlit>
        ) : null}
      </S1Plane>
      {noProps ? null : (
        <S1Plane
          plane={S1_PLANE.near}
          under={
            tree ? (
              <>
                {/* the near things' ground shadows: baked into the organic paving; with v6's paving (a tree-only A/B)
                    the scene's, which come with v6's tree under the organic one (not exact: it may peek out) */}
                {paving ? null : <S1ForeNearUnder />}
                <OrganicImage name="tree" />
              </>
            ) : (
              <Unlit off={groundOff}>
                <S1ForeNearUnder />
              </Unlit>
            )
          }
          over={<S1ForeNearOver />}
        >
          <S1ForeNear />
        </S1Plane>
      )}
      <DuskOverlay x={0} y={1206} w={1080} h={714} stops={[[0, '#FF9F5C', 0.6], [0.45, '#FFB98A', 0.3], [1, '#8F7CC0', 0.45]]} />
    </>
  );
};

// ---------------------------------------------------------------- the scene (V2S1's copy)

const OrganicV2S1: React.FC = () => {
  const sw = useSwitches();
  const t = useTime();
  const dusk = useDusk();
  const v6 = useV6();
  const {variant} = useOrganic();
  const rig = shadeRig(sw, RIG_CANAL, CM.shadeWarm);
  return (
    <World sky={CM.white} horizon={1000}>
      <Lit rig={dusk ? duskRig(rig) : v6 ? v6Rig(rig) : rig}>
        <TextureSlot sw={sw} t={t} plane={PARALLAX_SKY} sky>
          <SkyFlood />
        </TextureSlot>
        <Look cascade={{at: FLOOD.t0, origin: FLOOD_ORIGIN, speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
          <OrganicWorld behindDoor={<S1HerBehindDoor />} towpath={<S1Row />} seated={<OrganicSteps />} pip={variant === 'noPip' ? null : <S1Pip />} />
        </Look>
        <S1Particles />
      </Lit>
    </World>
  );
};
export default OrganicV2S1;

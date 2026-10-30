// The ORGANIC PROOF's compositions (docs/look/organic/organic_proof.md): v6's scene 1 with the four organic pieces
// (the near cumulus, the near tree, the facade by the doorway, the paving of our bank) in their own slots
// (OrganicScene.tsx), and the bake's inputs.
//   OrganicS1    the frame: PaintS1 set 'v6' exactly (its shell: lib/Film over v2's shots and captions, the v2 switches
//                + `darks`, the v6 paint set and her), with `organic` (default true) swapping the four pieces in;
//                props: organic, only (a subset), variant (the bake's decomposition renders), captions, rowHidden
//   OrganicFlat  one piece's FLAT shapes alone on a transparent frame (lib/paint PaintBakeFrame), in the scene's own
//                contexts (switches, the v6 rig, the v6 paint set): 'wing' (the facade with its light: the shades the
//                organic facade bakes in; no her, no sliding leaves), 'bands' (our bank's coping, landing and treads
//                with their lips' shades; no props, no ground shadows)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Film, type FilmScene} from '../../lib/Film';
import {type CaptionBeat} from '../../lib/Captions';
import {PaintBakeFrame, PaintProvider} from '../../lib/paint';
import {Lit, Shade} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import {CanalCast} from '../../v2r/kit/canal/slots';
import {k4Person} from '../../v2r/kit/canal/k4k5';
import scenesJson from '../../v2r/film/scenes.json';
import captionsJson from '../../v2r/film/captions.json';
import {PosterSwitchProvider, resolveSwitches} from '../paint_s1/switches';
import {applyFloat, applyPalette, applyPen, shadeRig} from '../paint_s1/engine';
import {PAINT_SETS} from '../paint_s1/paint_set';
import {DuskProvider} from '../paint_s1/dusk';
import {V6Provider, v6Rig} from '../paint_s1/v6';
import {POSTER_S1_FPS, POSTER_S1_FRAMES} from '../paint_s1/PosterS1';
import {floodAt} from '../paint_s1/V2S1_clock';
import {S1Wing} from '../paint_s1/V2S1_set_wing';
import {S1WingShades} from '../paint_s1/V2S1_light';
import {BANDS, Coping, StoneBand, edgePath} from '../paint_s1/V2S1_steps_stone';
import OrganicV2S1, {OrganicProvider, type OrganicVariant} from './OrganicScene';
import type {OrganicPieceName} from './organic_set';

export const ORGANIC_S1_FPS = POSTER_S1_FPS;
export const ORGANIC_S1_FRAMES = POSTER_S1_FRAMES;

const SCENES = scenesJson as FilmScene[];
/** v2's captions with the hook page from frame 0 (as PosterS1). */
const CAPTIONS = (captionsJson as CaptionBeat[]).map((b, i) => (i ? b : {...b, s: 0, lines: b.lines.map((l, j) => (j ? l : {...l, s: 0}))}));
const COMPONENTS: Record<string, React.FC> = {V2S1: OrganicV2S1};

/** v6's switches: v2's preset with the darks (PaintS1 set 'v6'). */
const v6Switches = (rowHidden?: boolean) => resolveSwitches({preset: 'v2', darks: true, ...(rowHidden ? {rowHidden: true} : {})});

export type OrganicS1Props = {
  /** The four organic pieces (default on); off = v6's frame. */
  organic?: boolean;
  /** A subset of the four (A/Bs). */
  only?: OrganicPieceName[];
  /** The bake's decomposition renders (OrganicScene.tsx); never in a film. */
  variant?: OrganicVariant;
  /** v2's pop captions (default on). */
  captions?: boolean;
  /** QA: her and the row not drawn (her exact silhouette = the frame minus this one). */
  rowHidden?: boolean;
};

export const OrganicS1: React.FC<OrganicS1Props> = ({organic = true, only, variant = 'v6', captions = true, rowHidden}) => {
  const sw = v6Switches(rowHidden);
  const t = useCurrentFrame() / ORGANIC_S1_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  const cloudOn = organic && (!only || only.includes('cloud'));
  // v6's paint set; with the organic cloud on, v6's own near plane (clouds_p3) leaves the cloud group
  const set = cloudOn ? Object.fromEntries(Object.entries(PAINT_SETS.v6).filter(([k]) => k !== 'clouds_p3')) : PAINT_SETS.v6;
  return (
    <PaintProvider on set={set}>
      <DuskProvider on={false}>
        <V6Provider on>
          <OrganicProvider value={{organic, only, variant}}>
            <PosterSwitchProvider value={sw}>
              <AbsoluteFill>
                <Film scenes={SCENES} components={COMPONENTS} captions={CAPTIONS} only="V2S1" offset={0} audio={false} showCaptions={captions} captionMotion="pop" edges={false} />
              </AbsoluteFill>
            </PosterSwitchProvider>
          </OrganicProvider>
        </V6Provider>
      </DuskProvider>
    </PaintProvider>
  );
};

export type OrganicFlatProps = {piece: 'wing' | 'bands'};

/** The bake's input: one piece's flat shapes alone, in the scene's contexts (the camera at rest: the float is home
 *  until 1.10 s, so a frame at 1.0 s is in the layer's own px). */
export const OrganicFlat: React.FC<OrganicFlatProps> = ({piece}) => {
  const sw = v6Switches();
  const t = useCurrentFrame() / ORGANIC_S1_FPS;
  applyPalette(sw);
  applyPen(sw, t);
  applyFloat(sw);
  const rig = v6Rig(shadeRig(sw, RIG_CANAL, CM.shadeWarm));
  return (
    <PaintProvider on set={PAINT_SETS.v6}>
      <DuskProvider on={false}>
        <V6Provider on>
          <PosterSwitchProvider value={sw}>
            <PaintBakeFrame width={1080} height={1920}>
              <Lit rig={rig}>
                <CanalCast person={k4Person}>
                  {piece === 'wing' ? (
                    <Tier tier="environment">
                      <S1Wing />
                      <S1WingShades />
                    </Tier>
                  ) : null}
                  {piece === 'bands' ? (
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
                  ) : null}
                </CanalCast>
              </Lit>
            </PaintBakeFrame>
          </PosterSwitchProvider>
        </V6Provider>
      </DuskProvider>
    </PaintProvider>
  );
};

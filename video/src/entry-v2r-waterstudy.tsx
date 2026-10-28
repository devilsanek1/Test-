// Video 2 (restart) WATER STUDY (the owner on v5's water, 2026-10-28: "it's just looking way too cheap, not clean or
// premium quality or refined. Just lazy and cheap. I mean that about the water"): two designers each draw S1's canal in
// ONE file (src/v2r/water_study/candA.tsx, candB.tsx) without touching shared code; the seam is V2S1_set_life's
// S1WaterSlot / S1DuckSlot and V2S1_particles' S1GlintsOff (unset = S1 byte for byte as before). The palette module is
// imported FIRST. Three compositions, each the film's first 368 frames (0.00-6.13 s: S1 and the push-through's start,
// exactly the span of the G4 look clips), 1080 x 1920, 60 fps, with the voice, the captions and the frame-0 words, no
// draft label (props {draftLabel}):
//   WaterStudyBase  S1 as it is (v5's water, the glints, the kit duck)
//   WaterStudyA     S1 with candA's CandWater in S1Water's place, its GLINTS_OFF and its CandDuck (if any)
//   WaterStudyB     the same with candB
// Render (4 shared CPUs; docs/v2/water/DIAGNOSIS.md "The seam" has the full recipes):
//   node scripts/render-frames.mjs WaterStudyA <dir> 1.0,2.5,3.8,5.0 --entry=src/entry-v2r-waterstudy.tsx
//   node scripts/render-media.mjs WaterStudyA <out>.mp4 --entry=src/entry-v2r-waterstudy.tsx --frames=120-239 --master
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film2R, FILM2R_FPS} from './v2r/film/Film2R';
import {S1DuckSlot, S1WaterSlot} from './v2r/scenes/V2S1_set_life';
import {S1GlintsOff} from './v2r/scenes/V2S1_particles';
import * as CandA from './v2r/water_study/candA';
import * as CandB from './v2r/water_study/candB';

const W = 1080;
const H = 1920;
/** 0.00-6.13 s = frames 0-367: the G4 look clips' span (S1 to the push-through's plum bridge). */
export const WATER_STUDY_FRAMES = 368;

type Cand = {CandWater: React.FC<{t: number}>; GLINTS_OFF: boolean; CandDuck?: React.FC<{t: number}> | null};
type StudyProps = {draftLabel?: boolean};

/** The film's opening with a candidate's water (and duck) in S1's slots and the glint field on or off. */
const withCand = (c: Cand): React.FC<StudyProps> => {
  const Study: React.FC<StudyProps> = ({draftLabel = false}) => (
    <S1WaterSlot.Provider value={c.CandWater}>
      <S1DuckSlot.Provider value={c.CandDuck ?? null}>
        <S1GlintsOff.Provider value={c.GLINTS_OFF}>
          <Film2R draftLabel={draftLabel} />
        </S1GlintsOff.Provider>
      </S1DuckSlot.Provider>
    </S1WaterSlot.Provider>
  );
  return Study;
};

/** S1 as it is: no provider at all (the seam's defaults). */
const StudyBase: React.FC<StudyProps> = ({draftLabel = false}) => <Film2R draftLabel={draftLabel} />;
const StudyA = withCand(CandA);
const StudyB = withCand(CandB);

const WaterStudyRoot: React.FC = () => (
  <>
    <Composition id="WaterStudyBase" component={StudyBase} defaultProps={{draftLabel: false}} durationInFrames={WATER_STUDY_FRAMES} fps={FILM2R_FPS} width={W} height={H} />
    <Composition id="WaterStudyA" component={StudyA} defaultProps={{draftLabel: false}} durationInFrames={WATER_STUDY_FRAMES} fps={FILM2R_FPS} width={W} height={H} />
    <Composition id="WaterStudyB" component={StudyB} defaultProps={{draftLabel: false}} durationInFrames={WATER_STUDY_FRAMES} fps={FILM2R_FPS} width={W} height={H} />
  </>
);

registerRoot(WaterStudyRoot);

// K5 "towpath Pip" (docs/v2/TREATMENT.md section 3): the film's own Pip, drawn new. See README.md in this folder.
//   import {Pip, PipTrack, hopAt, aimAt, FACING} from '../kit/pip';

export {Pip, PipDrawing, resolveParams, defaultInk} from './Pip';
export type {PipProps, PipDrawingProps, PipPaint} from './Pip';
export {PipTrack, trackAt, clampApex} from './PipTrack';
export type {PipKey, PipHop, PipTrackProps, PipTrackState} from './PipTrack';
export {POSES, FACING, poseParams} from './poses';
export type {PoseName, FacingName} from './poses';
export {NEUTRAL, MODEL_H, WATCH, blendParams, buildPip, watchYaw, nearEar, plainHeadYaw} from './model';
export type {PoseParams, PipGeom, Part, Mark, WatchYaw} from './model';
export {hopAt, earFlop, rideAt, aimAt, drawOn, unBuild} from './motion';
export type {HopSpec, HopState} from './motion';
export {applyIdle, blinkAt, earFlickAt, flickShape} from './idle';
export type {IdleOpts} from './idle';
export {PIP_COLOURS, PIP_INK, pipFill} from './colours';

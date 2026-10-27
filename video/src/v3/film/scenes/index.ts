// src/v3/film scene registry (static; the engine lane owns it): one SEQUENCE per scenes.json row (docs/v3/flow_v2.md
// §2: SQA ... SQF), each in its own file scenes/<SQ>.tsx. A sequence module default-exports its scene (React.FC, no
// props) and may export `Wiper` (WiperComponent, for a foreground-wipe OUT of it) and `captionTone` (ToneKey[],
// sequence-local t: overrides its scenes.json captionTone, so a lane sets its own caption tone without touching a shared
// file). Each starts as a placeholder that plays the G5b panels it replaces (scenes/g5b_panels.tsx); the old panel
// files (O1, S4 ... S16 and their helpers) are no longer scenes, only sets the sequence builders reuse. How a sequence
// owns its camera and its joins: docs/G5_BLOCKING.md §2b.
import type React from 'react';
import type {ToneKey, WiperProps} from '../../../lib/Film';

import * as SQA from './SQA';
import * as SQB from './SQB';
import * as SQC from './SQC';
import * as SQD from './SQD';
import * as SQE from './SQE';
import * as SQF from './SQF';

type SceneModule = {default: React.FC; Wiper?: React.FC<WiperProps>; captionTone?: ToneKey[]};
const SEQUENCES: Record<string, SceneModule> = {SQA, SQB, SQC, SQD, SQE, SQF};

export const sceneComponents: Record<string, React.FC> = {};
export const sceneWipers: Record<string, React.FC<WiperProps>> = {};
export const sceneTones: Record<string, ToneKey[]> = {};
for (const [id, m] of Object.entries(SEQUENCES)) {
  sceneComponents[id] = m.default;
  if (typeof m.Wiper === 'function') sceneWipers[id] = m.Wiper;
  if (Array.isArray(m.captionTone) && m.captionTone.length) sceneTones[id] = m.captionTone;
}

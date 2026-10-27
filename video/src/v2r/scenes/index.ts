// src/v2r scene registry (static: every shot imported by name; the engine owns it). A shot module default-exports
// its scene (React.FC, no props) and may export `Wiper` (WiperComponent, for a foreground-wipe OUT of it: V2S7's
// narrowboat) and `captionTone` (ToneKey[], shot-local t: overrides scenes.json's, so a lane sets its own caption tone
// without touching a shared file). Lanes replace src/v2r/scenes/<ID>.tsx; never this file.
import type React from 'react';
import type {ToneKey, WiperProps} from '../../lib/Film';

import * as V2S1 from './V2S1';
import * as V2S2 from './V2S2';
import * as V2S3 from './V2S3';
import * as V2S4 from './V2S4';
import * as V2S5 from './V2S5';
import * as V2S6 from './V2S6';
import * as V2S7 from './V2S7';
import * as V2S8 from './V2S8';

type ShotModule = {default: React.FC; Wiper?: React.FC<WiperProps>; captionTone?: ToneKey[]};
const SHOTS: Record<string, ShotModule> = {V2S1, V2S2, V2S3, V2S4, V2S5, V2S6, V2S7, V2S8};

export const sceneComponents: Record<string, React.FC> = {};
export const sceneWipers: Record<string, React.FC<WiperProps>> = {};
export const sceneTones: Record<string, ToneKey[]> = {};
for (const [id, m] of Object.entries(SHOTS)) {
  sceneComponents[id] = m.default;
  if (typeof m.Wiper === 'function') sceneWipers[id] = m.Wiper;
  if (Array.isArray(m.captionTone) && m.captionTone.length) sceneTones[id] = m.captionTone;
}

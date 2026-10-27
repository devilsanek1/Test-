// The G5b panels (the cut the owner judged on 2026-10-27) as the STARTING PLACEHOLDERS of the sequences (engine lane).
// scenes.json now holds the six SEQUENCES of docs/v3/flow_v2.md §2 (SQA ... SQF). Until a lane builds a sequence, its
// file (scenes/SQ?.tsx) plays the old panels it replaces, each in its own window of film time, on its own time base and
// caption tone, exactly as the G5b film did (lib/sequence.tsx PanelWindows): the film plays end to end, frame for frame
// as before, except where a join's transition changed (J3's push-through, 18.905-20.005). The old panel files stay: the
// sequence builders reuse their sets (O1_set, S4_chart, S7_desk, S8_stick, S9_*, S10_set, S11 bars, S16's turn, ...).
// A lane that builds its sequence replaces its SQ file whole and drops this import; the last one to go deletes this file.
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {PanelWindows, panelTones, type PanelSpec} from '../../../lib/sequence';
import scenesJson from '../scenes.json';
import * as O1 from './O1';
import * as S4 from './S4';
import * as S5 from './S5';
import * as S6 from './S6';
import * as S7 from './S7';
import * as S8 from './S8';
import * as S9 from './S9';
import * as S10 from './S10';
import * as S11 from './S11';
import * as S12 from './S12';
import * as S13 from './S13';
import * as S14 from './S14';
import * as S15 from './S15';
import * as S16 from './S16';

type PanelModule = {default: React.FC; captionTone?: ToneKey[]};

/** The G5b scenes.json rows (id, start, end in VO seconds; every panel came in on a plain cut, O1 first), with each
 *  panel module's own caption tone (which won over its scenes.json row in the G5b film). */
const ROWS: [string, number, number, PanelModule][] = [
  ['O1', 0.0, 5.8, O1],
  ['S4', 5.8, 9.48, S4],
  ['S5', 9.48, 11.48, S5],
  ['S6', 11.48, 16.6, S6],
  ['S7', 16.6, 18.28, S7],
  ['S8', 18.28, 19.4, S8],
  ['S9', 19.4, 22.68, S9],
  ['S10', 22.68, 25.24, S10],
  ['S11', 25.24, 29.4, S11],
  ['S12', 29.4, 31.32, S12],
  ['S13', 31.32, 33.4, S13],
  ['S14', 33.4, 36.36, S14],
  ['S15', 36.36, 38.84, S15],
  ['S16', 38.84, 41.15, S16],
];

export const G5B_PANELS: PanelSpec[] = ROWS.map(([id, start, end, m], i) => ({id, start, end, C: m.default, first: i === 0, tone: m.captionTone}));

export type Placeholder = {Component: React.FC; captionTone: ToneKey[]};

/** A sequence's placeholder: the given G5b panels in their windows (the first also before, the last also after: the
 *  loop underlay and any overlap), and their caption tones as the sequence's own keys (from its scenes.json start). */
export function g5bPlaceholder(seqId: string, ids: string[]): Placeholder {
  const panels = ids.map((id) => {
    const p = G5B_PANELS.find((x) => x.id === id);
    if (!p) throw new Error(`g5bPlaceholder(${seqId}): no G5b panel ${id}`);
    return p;
  });
  const row = (scenesJson as {id: string; start: number}[]).find((s) => s.id === seqId);
  if (!row) throw new Error(`g5bPlaceholder: no scenes.json row ${seqId}`);
  const Component: React.FC = () => <PanelWindows panels={panels} />;
  Component.displayName = `${seqId}_g5b`;
  return {Component, captionTone: panelTones(row.start, panels)};
}

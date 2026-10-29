// scene02/Steps.tsx — S02's lighter version of BlueprintWall's 'steps' layer, swapped in through the set's `wrap`
// (polish, review: in this tight framing the set's 9 full-width SI.mid step lines were the densest, heaviest ink in the
// frame, competing with the onlookers' heads; reference f_9.0 carries 3-4 thin ground lines). Same fills, same
// forecourt marks (same seeds) as the set; only the step INK changes: the four tread nosings, ~2.3 px on screen at the
// 1.30-1.34 framing, broken and tapered. The band sits in the platform-UI zone: it only needs to read as 'steps'.

import React from 'react';
import {palette} from '../../lib/theme';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line, rectPath} from '../../lib/sketch';
import {BLUEPRINT_WALL} from '../shared/sets';
import {groundMarks, GroundMarks} from '../shared/sets/ground';
import {SI} from '../shared/sets/common';

const ST = BLUEPRINT_WALL.steps;
const SH = (ST.y1 - ST.y0) / ST.n;

const G = (() => {
  let treads = '';
  let risers = '';
  let nosings = '';
  for (let i = 0; i < ST.n; i++) {
    const y = ST.y0 + i * SH;
    treads += rectPath(-160, y, 1400, SH * 0.3);
    risers += rectPath(-160, y + SH * 0.3, 1400, SH * 0.7);
    nosings += line(-160, y + SH * 0.3, 1240, y + SH * 0.3 + 1, {seed: `s2steps/n${i}`, over: [0, 0]});
  }
  // the set's own forecourt marks (BlueprintWall: seed 'bpw/gm'), so the ground is unchanged
  const ground = groundMarks({vp: [540, 1250], top: ST.y1 + 8, bottom: 1920, x0: -380, x1: 1460, rays: 4, cross: 2, specks: 14, reach: 0.55, seed: 'bpw/gm'});
  return {treads, risers, nosings, ground};
})();

/** Width of the nosing lines (world px): ~2.3 px on screen at zoom 1.30-1.34. */
export const STEP_INK = 1.75;

export const S02Steps: React.FC = () => (
  <>
    <Fill rect={[-160, ST.y1, 1400, 600]} color={palette.mintPale} offset={false} seed="bpw/ground" />
    <GroundMarks marks={G.ground} width={SI.far} seed="bpw/gm" />
    <Fill d={G.risers} color={palette.cream} offset={false} seed="bpw/ris" />
    <Fill d={G.treads} color={palette.sand} offset={false} seed="bpw/tre" />
    <Ink d={G.nosings} width={STEP_INK} vary={0.15} seed="s2steps" />
  </>
);

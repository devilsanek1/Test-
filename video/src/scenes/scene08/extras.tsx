// S08 additions to the shared DomeCity v3: the three extra row-3 doors the rattlers hop to (the set's own door style),
// and a little clutter on our roof deck (seen during the crane; under the platform UI at rest).
import React from 'react';
import {palette} from '../../lib/theme';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ellipse, line, rect, rectPath} from '../../lib/sketch';
import {SI} from '../shared/sets';
import {EXTRA_DOORS3} from './layout';

const DOORS = (() => {
  let fill = '';
  let lintel = '';
  let ink = '';
  EXTRA_DOORS3.forEach((q, i) => {
    const h = q.h * 1.18;
    const w = h * 0.42;
    fill += rectPath(q.x - w / 2, q.y - h, w, h);
    lintel += rectPath(q.x - w / 2 - 3, q.y - h - 5, w + 6, 5);
    ink += rect(q.x - w / 2, q.y - h, w, h, {seed: `s8x3d${i}`, edges: 'tlr', over: 'small'}) + `M${(q.x + w * 0.26).toFixed(1)} ${(q.y - h * 0.5).toFixed(1)}l0 ${(h * 0.12).toFixed(1)}`;
  });
  return {fill, lintel, ink};
})();

/** Row-3 doors in the set's style (draw in the row-3 layer, before the rattlers). */
export const ExtraDoors: React.FC = () => (
  <>
    <Fill d={DOORS.fill} color={palette.teal} offset={false} mode="snap" seed="s8/xdoor" />
    <Fill d={DOORS.lintel} color={palette.sand} offset={false} mode="snap" seed="s8/xlint" />
    <Ink d={DOORS.ink} width={SI.far} taper={false} seed="s8/xdoori" />
  </>
);

const DECK = (() => {
  const hatch = rectPath(110, 1676, 150, 50);
  const hatchLid = rectPath(104, 1664, 162, 14);
  const pipes = rectPath(752, 1636, 20, 64) + rectPath(800, 1652, 16, 48);
  const pipeCaps = ellipse(762, 1636, 14, 5, {seed: 's8/pc1'}) + ellipse(808, 1652, 11, 4, {seed: 's8/pc2'});
  const crate = rectPath(900, 1690, 70, 52);
  const ink =
    rect(110, 1676, 150, 50, {seed: 's8/hatch', over: 'small'}) +
    rect(104, 1664, 162, 14, {seed: 's8/lid', over: 'small'}) +
    rect(752, 1636, 20, 64, {seed: 's8/p1', edges: 'lr', over: 0}) +
    rect(800, 1652, 16, 48, {seed: 's8/p2', edges: 'lr', over: 0}) +
    pipeCaps +
    rect(900, 1690, 70, 52, {seed: 's8/crate', over: 'small'}) +
    line(900, 1690, 970, 1742, {seed: 's8/cx1', over: 0}) +
    line(-160, 1780, 1240, 1770, {seed: 's8/tar1', over: 0}) +
    line(380, 1840, 1240, 1852, {seed: 's8/tar2', over: 0});
  return {hatch, hatchLid, pipes, crate, ink};
})();

/** Clutter on our own roof deck (depth 0): a hatch, two vent pipes, a crate, tar seams. */
export const DeckClutter: React.FC = () => (
  <>
    <Fill d={DECK.hatch} color={palette.tan} seed="s8/hatchf" />
    <Fill d={DECK.hatchLid} color={palette.teal} seed="s8/lidf" />
    <Fill d={DECK.pipes} color={palette.cream} seed="s8/pipef" />
    <Fill d={DECK.crate} color={palette.brown} seed="s8/cratef" />
    <Ink d={DECK.ink} width={SI.mid} taper={false} seed="s8/deck" />
  </>
);

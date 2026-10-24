// S08 additions to the shared DomeCity v3: the three extra row-3 doors the rattlers hop to (the set's own door style),
// and our own roof deck's foreground (fix round 1: the bottom quarter was a flat deck): a chimney stack cut by the
// bottom-left corner and a laundry line cut by the right edge (front ink 4.8 / 3.4, both below y 1520 and out of the
// centre third), the hatch, two vent pipes, a crate, a drain and tar seams.
import React from 'react';
import {palette} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ellipse, line, rect, rectPath} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
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
  // the chimney stack in the bottom-left corner (cut by both frame edges): brick body + shade side + cap + two pots
  const stack = rectPath(-60, 1712, 216, 300);
  const stackShade = rectPath(104, 1712, 52, 300);
  const cap = rectPath(-70, 1690, 236, 26);
  const pots = rectPath(-4, 1626, 46, 66) + rectPath(70, 1644, 40, 48);
  const potBands = rectPath(-4, 1640, 46, 9) + rectPath(70, 1656, 40, 8);
  let bricks = '';
  for (let r = 0; r < 6; r++) {
    const y = 1748 + r * 34;
    bricks += line(-60, y, 104, y + 1, {seed: `s8/br${r}`, over: 0});
    for (let c = 0; c < 3; c++) {
      const x = -30 + c * 52 + (r % 2) * 26;
      if (x < 100) bricks += line(x, y, x, y + 34, {seed: `s8/bv${r}${c}`, over: 0});
    }
  }
  const stackInk =
    rect(-60, 1712, 216, 320, {seed: 's8/stk', over: 'small', edges: 'tlr'}) +
    rect(-70, 1690, 236, 26, {seed: 's8/cap', over: 'small'}) +
    rect(-4, 1626, 46, 66, {seed: 's8/pt1', over: 'small', edges: 'tlr'}) +
    rect(70, 1644, 40, 48, {seed: 's8/pt2', over: 'small', edges: 'tlr'}) +
    ellipse(19, 1626, 23, 6, {seed: 's8/pt1t'}) +
    ellipse(90, 1644, 20, 5, {seed: 's8/pt2t'}) +
    line(104, 1716, 104, 2010, {seed: 's8/stks', over: 0});
  // the old deck clutter, moved clear of the stack
  const hatch = rectPath(232, 1688, 140, 46);
  const hatchLid = rectPath(226, 1676, 152, 14);
  const pipes = rectPath(752, 1636, 20, 64) + rectPath(800, 1652, 16, 48);
  const pipeCaps = ellipse(762, 1636, 14, 5, {seed: 's8/pc1'}) + ellipse(808, 1652, 11, 4, {seed: 's8/pc2'});
  const crate = rectPath(880, 1706, 70, 52);
  const drain = ellipse(470, 1846, 34, 10, {seed: 's8/drain'});
  const ink =
    rect(232, 1688, 140, 46, {seed: 's8/hatch', over: 'small'}) +
    rect(226, 1676, 152, 14, {seed: 's8/lid', over: 'small'}) +
    rect(752, 1636, 20, 64, {seed: 's8/p1', edges: 'lr', over: 0}) +
    rect(800, 1652, 16, 48, {seed: 's8/p2', edges: 'lr', over: 0}) +
    pipeCaps +
    rect(880, 1706, 70, 52, {seed: 's8/crate', over: 'small'}) +
    line(880, 1706, 950, 1758, {seed: 's8/cx1', over: 0}) +
    drain +
    line(444, 1846, 496, 1846, {seed: 's8/dr1', over: 0}) +
    line(454, 1840, 486, 1840, {seed: 's8/dr2', over: 0});
  const tar = line(160, 1780, 1240, 1770, {seed: 's8/tar1', over: 0}) + line(380, 1880, 1240, 1892, {seed: 's8/tar2', over: 0}) + line(600, 1620, 690, 1622, {seed: 's8/tar3', over: 0}) + line(990, 1660, 1100, 1664, {seed: 's8/tar4', over: 0});
  return {stack, stackShade, cap, pots, potBands, bricks, stackInk, hatch, hatchLid, pipes, crate, drain, ink, tar};
})();

// the laundry line: a post cut by the right edge, the line sagging to a short pole at x 800
const LINE = {a: [1075, 1606] as [number, number], b: [800, 1622] as [number, number], sag: 34};
const lineY = (x: number) => {
  const u = (x - LINE.b[0]) / (LINE.a[0] - LINE.b[0]);
  return LINE.b[1] + (LINE.a[1] - LINE.b[1]) * u + LINE.sag * 4 * u * (1 - u);
};
const CLOTHS = [
  {x: 858, w: 54, h: 62, color: palette.peach},
  {x: 930, w: 44, h: 78, color: palette.cream},
  {x: 1000, w: 36, h: 44, color: palette.sage},
];

/** Our roof deck (depth 0): the chimney stack, the laundry line (cloths sway: always alive), hatch, pipes, crate, drain. */
export const DeckClutter: React.FC = () => {
  const t = useTime();
  let lineD = '';
  for (let i = 0; i <= 16; i++) {
    const x = LINE.b[0] + ((LINE.a[0] - LINE.b[0]) * i) / 16;
    lineD += `${i ? 'L' : 'M'}${x.toFixed(1)} ${lineY(x).toFixed(1)}`;
  }
  return (
    <>
      <Ink d={DECK.tar} width={SI.far} taper={false} seed="s8/tar" />
      <Fill d={DECK.drain} color={palette.tan} offset={false} seed="s8/drainf" />
      <Fill d={DECK.hatch} color={palette.tan} seed="s8/hatchf" />
      <Fill d={DECK.hatchLid} color={palette.teal} seed="s8/lidf" />
      <Fill d={DECK.pipes} color={palette.cream} seed="s8/pipef" />
      <Fill d={DECK.crate} color={palette.brown} seed="s8/cratef" />
      <Ink d={DECK.ink} width={SI.mid} taper={false} seed="s8/deck" />
      {/* laundry line */}
      <Fill d={rectPath(1066, 1596, 16, 340) + rectPath(795, 1614, 10, 120)} color={palette.brown} seed="s8/lpost" />
      <Ink d={line(1066, 1600, 1066, 1940, {seed: 's8/lp1', over: 0}) + line(795, 1614, 795, 1736, {seed: 's8/lp2', over: 0}) + line(805, 1614, 805, 1736, {seed: 's8/lp3', over: 0})} width={SI.mid} taper={false} seed="s8/lposti" />
      <path d={lineD} fill="none" stroke={palette.ink} strokeWidth={SI.hair} strokeLinecap="round" />
      {CLOTHS.map((c, i) => {
        const py = lineY(c.x + c.w / 2);
        const sway = 4 * Math.sin(t * 2.3 + i * 1.7) + 1.5 * Math.sin(t * 5.1 + i);
        return (
          <XG key={i} m={mat.about(mat.rotate(sway), c.x + c.w / 2, py)}>
            <Fill d={rectPath(c.x, py - 2, c.w, c.h)} color={c.color} seed={`s8/cl${i}`} />
            <Ink d={rect(c.x, py - 2, c.w, c.h, {seed: `s8/cli${i}`, over: 'small'}) + line(c.x + 6, py - 6, c.x + 6, py + 6, {seed: `s8/pg${i}a`, over: 0}) + line(c.x + c.w - 6, py - 6, c.x + c.w - 6, py + 6, {seed: `s8/pg${i}b`, over: 0})} width={SI.mid} taper={false} seed={`s8/cli${i}`} />
          </XG>
        );
      })}
      {/* the chimney stack, cut by the bottom-left corner (front ink) */}
      <Fill d={DECK.stack} color={palette.tan} seed="s8/stkf" />
      <Fill d={DECK.stackShade} color={palette.tealDark} offset={false} seed="s8/stks" />
      <Fill d={DECK.cap} color={palette.sand} seed="s8/capf" />
      <Fill d={DECK.pots} color={palette.brown} seed="s8/potf" />
      <Fill d={DECK.potBands} color={palette.tan} offset={false} seed="s8/potb" />
      <Ink d={DECK.bricks} width={SI.far} taper={false} seed="s8/brk" />
      <Ink d={DECK.stackInk} width={SI.front} seed="s8/stki" />
    </>
  );
};

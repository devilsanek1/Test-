// S08 additions to the shared DomeCity v3 (fix round 2):
//   - LightDoors: the rattler doors drawn LIGHT (cream / peach, ink sides + top, a dark handle) on rows 2-3, so every
//     ink-dark rattler sits on a light door (the set's teal doors are off: `doors={false}`); row 3 has three big near
//     doors for the 86-92 px rattlers.
//   - WireSpans: the three wires continue PAST the rooftop pole to the right frame edge along S07's own curves (mapped
//     through the cut), so the whole wire set matches on the cut; the pole is a junction (the board covers the middle).
//   - DistrictTowers: 5 browser-chrome towers inside the glass (one glass step lighter), the protected sites.
//   - DeckClutter: our roof deck between the two neighbours (hatch, vent pipes, drain, tar seams).
//   - Neighbours: two back-view rooftop neighbours cropped by the bottom edge (EdgeOnlooker, 300-420 px), in their own
//     NEAR layer (parallax factor 1.2: they drop away faster than the parapet during the crane); one raises a phone on
//     'millions'.
import React from 'react';
import {palette} from '../../lib/theme';
import {springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ellipse, line, rect, rectPath} from '../../lib/sketch';
import {BrowserChrome, EdgeOnlooker} from '../shared/props';
import {Glass, SI, WIRES, wireAt} from '../shared/sets';
import {DOORS3, R2} from './layout';
import {doorPaths} from './crowd';

// ---------------------------------------------------------------- light doors (rows 2 and 3)

const doorSet = (list: {x: number; y: number; dh: number}[], seed: string) => {
  let cream = '';
  let peach = '';
  let ink = '';
  let handles = '';
  list.forEach((q, i) => {
    const p = doorPaths(q.x, q.y, q.dh);
    if (i % 3 === 1) peach += p.fill;
    else cream += p.fill;
    ink += rect(q.x - q.dh * 0.23, q.y - q.dh, q.dh * 0.46, q.dh, {seed: `${seed}${i}`, edges: 'tlr', over: 'small'});
    handles += `M${p.handle[0].toFixed(1)} ${(p.handle[1] - q.dh * 0.05).toFixed(1)}l0 ${(q.dh * 0.1).toFixed(1)}`;
  });
  return {cream, peach, ink, handles};
};
const D3 = doorSet(
  DOORS3.map((d) => ({x: d.x, y: d.y, dh: d.h})),
  's8/d3',
);
const D2 = doorSet(
  R2.map((q) => ({x: q.x, y: q.y, dh: q.h * 1.18})),
  's8/d2',
);

/** Row 3 (`row="3"`, the near layer) or row 2 light doors. */
export const LightDoors: React.FC<{row: 2 | 3}> = ({row}) => {
  const D = row === 3 ? D3 : D2;
  const w = row === 3 ? SI.far : SI.hair;
  return (
    <>
      <Fill d={D.cream} color={palette.cream} offset={false} mode="snap" seed={`s8/ld${row}c`} />
      <Fill d={D.peach} color={palette.peach} offset={false} mode="snap" seed={`s8/ld${row}p`} />
      <Ink d={D.ink} width={w} taper={false} seed={`s8/ld${row}i`} />
      <path d={D.handles} stroke={palette.ink} strokeWidth={w * 1.4} strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- wire spans past the pole (the S07 match)

/** S07 world -> S08 world at the cut (S07 camera (480, 760) zoom 1.06, S08 camera (540, 1260) zoom 1.3). */
const K = 1.06 / 1.3;
const SPANS = (() => {
  let d = '';
  for (let i = 0; i < 3; i++) {
    // S07's wire i continues right of x7 = 480 (our pole) past its own pole at x7 1000 (off frame at the cut)
    const pts: [number, number][] = [];
    for (let k = 0; k <= 24; k++) {
      const x8 = 540 + (k / 24) * 820;
      const x7 = 480 + (x8 - 540) / K;
      const y7 = wireAt(WIRES.S07, i, x7)[1];
      // anchored on our pole's tie-off height (S07 and S08 differ by < 1 px there)
      const y8 = WIRES.S08.ys[i] + K * (y7 - wireAt(WIRES.S07, i, 480)[1]);
      pts.push([x8, y8]);
    }
    d += pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  }
  return d;
})();

/** The wires' right-hand spans from the pole to the right edge (draw with the wires, before the board). */
export const WireSpans: React.FC = () => <Ink d={SPANS} width={SI.far} taper={false} order="all" seed="s8/spans" />;

// ---------------------------------------------------------------- the protected district (inside the glass)

const TOWERS = [
  {x: 150, y: 962, w: 58, h: 118},
  {x: 196, y: 918, w: 66, h: 162},
  {x: 262, y: 942, w: 60, h: 138},
  {x: 300, y: 990, w: 56, h: 90},
  {x: 386, y: 1000, w: 30, h: 80},
];

/** Five browser-chrome towers inside the dome (drawn under <Glass>: one glass step lighter than the rows outside),
 *  popping with the glass after the arc closes. Clip them to the dome interior in the scene. */
export const DistrictTowers: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  return (
    <Glass>
      {TOWERS.map((q, i) => {
        const k = springAt(t, at + i * 0.04, springs.pop);
        if (k <= 0.01) return null;
        const body = rectPath(q.x, q.y + 4, q.w, q.h);
        return (
          <g key={i} transform={k < 1 ? `translate(${q.x + q.w / 2} ${q.y + q.h}) scale(1 ${k.toFixed(3)}) translate(${-(q.x + q.w / 2)} ${-(q.y + q.h)})` : undefined}>
            <Fill d={body} color={i % 2 ? palette.sage : palette.teal} offset={false} mode="snap" seed={`s8/dt${i}`} />
            {q.w >= 50 ? <BrowserChrome x={q.x + 4} y={q.y + 10} w={q.w - 8} h={Math.min(46, q.h * 0.36)} depth="hair" seed={`s8/dtc${i}`} /> : null}
            <Ink d={rect(q.x, q.y + 4, q.w, q.h, {seed: `s8/dti${i}`, edges: 'tlr', over: 'small'})} width={SI.hair} taper={false} seed={`s8/dti${i}`} />
          </g>
        );
      })}
    </Glass>
  );
};

// ---------------------------------------------------------------- our roof deck

const DECK = (() => {
  const hatch = rectPath(366, 1700, 136, 46);
  const hatchLid = rectPath(360, 1688, 148, 14);
  const pipes = rectPath(530, 1650, 18, 64);
  const pipeCaps = ellipse(539, 1650, 13, 5, {seed: 's8/pc1'});
  const drain = ellipse(452, 1850, 34, 10, {seed: 's8/drain'});
  const ink =
    rect(366, 1700, 136, 46, {seed: 's8/hatch', over: 'small'}) +
    rect(360, 1688, 148, 14, {seed: 's8/lid', over: 'small'}) +
    rect(530, 1650, 18, 64, {seed: 's8/p1', edges: 'lr', over: 0}) +
    pipeCaps +
    drain +
    line(426, 1850, 478, 1850, {seed: 's8/dr1', over: 0}) +
    line(436, 1844, 468, 1844, {seed: 's8/dr2', over: 0});
  const tar = line(300, 1790, 640, 1782, {seed: 's8/tar1', over: 0}) + line(340, 1890, 620, 1896, {seed: 's8/tar2', over: 0}) + line(420, 1630, 560, 1632, {seed: 's8/tar3', over: 0});
  return {hatch, hatchLid, pipes, drain, ink, tar};
})();

/** Our roof deck between the neighbours (depth 0). */
export const DeckClutter: React.FC = () => (
  <>
    <Ink d={DECK.tar} width={SI.far} taper={false} seed="s8/tar" />
    <Fill d={DECK.drain} color={palette.tan} offset={false} seed="s8/drainf" />
    <Fill d={DECK.hatch} color={palette.tan} seed="s8/hatchf" />
    <Fill d={DECK.hatchLid} color={palette.teal} seed="s8/lidf" />
    <Fill d={DECK.pipes} color={palette.cream} seed="s8/pipef" />
    <Ink d={DECK.ink} width={SI.mid} taper={false} seed="s8/deck" />
  </>
);

// ---------------------------------------------------------------- the rooftop neighbours (near layer)

/** Parallax factor of the neighbours' layer (depth 1 - f): nearer than our parapet. */
export const NEIGHBOUR_F = 1.2;

/** Two back-view neighbours watching the city from our deck, cropped by the bottom edge (EdgeOnlooker: the coat always
 *  runs off the frame); the right one raises a phone on `phoneAt`. Heads at rest y ~1590-1660 (inside the bottom UI
 *  band, below the coping). */
export const Neighbours: React.FC<{phoneAt: number}> = ({phoneAt}) => (
  <>
    <EdgeOnlooker x={172} y={1692} head={164} hair="cap" body={palette.brown} acc={['collar']} rim="right" arms="near" depth="mid" bob={1.2} seed="s8/nbL" />
    <EdgeOnlooker x={770} y={1676} head={170} hair="long" body={palette.teal} acc={['hood']} rim="left" arms="near" depth="mid" bob={1.2} raisePhoneAt={phoneAt} phoneSide="right" seed="s8/nbR" />
  </>
);

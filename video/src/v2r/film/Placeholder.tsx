// The engine's shot placeholder (K8): a palette card in Canal Mint with the shot's id, words, picture text and lane,
// so Film2R plays end to end (voice, captions, cuts, the loop) before any set exists. Each src/v2r/scenes/V2S<n>.tsx
// starts as one of these; its lane REPLACES the whole file (never edit this one to build a shot).
// Built from engine primitives only (World, Fill, Ink, Look), so the un-build and the paper state work like a set's.
import React from 'react';
import {World} from '../../lib/World';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {Look, useExit} from '../../lib/exit';
import {useTime} from '../../lib/time';
import {circle, line, rect} from '../../lib/sketch';
import {captionFontStack} from '../../lib/font';
import {CM, INK_PX, LIGHT, SHOT_LIGHT} from '../palette';

export type PlaceholderProps = {
  id: string;
  title: string;
  /** The words spoken over the shot. */
  words: string;
  /** TREATMENT section 5's picture text (short). */
  picture: string;
  lane: string;
  /** The sun disc [cx, cy, r] (screen px at rest). */
  sun: [number, number, number];
  /** Shot length (s): drives the little progress walker. */
  dur: number;
  /** The film's FIRST shot: bare ink on paper at t < 0 (the loop underlay and frame 0), colour floods from the sun. */
  bare?: boolean;
};

/** Greedy word wrap by an average glyph width (caption font ~0.47 em). */
function wrap(text: string, size: number, maxW: number): string[] {
  const per = Math.max(8, Math.floor(maxW / (size * 0.47)));
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if (cur && (cur + ' ' + w).length > per) {
      out.push(cur);
      cur = w;
    } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push(cur);
  return out;
}

const SWATCHES: [string, string][] = [
  ['brick', CM.brickLight],
  ['', CM.brick],
  ['', CM.brickDeep],
  ['sage', CM.sage],
  ['water', CM.water],
  ['', CM.waterDeep],
  ['hero', CM.hero],
  ['anchor', CM.anchor],
  ['lamp', CM.lamp],
  ['box', CM.box],
];

export const Placeholder: React.FC<PlaceholderProps> = ({id, title, words, picture, lane, sun, dur, bare}) => {
  const t = useTime();
  const exit = useExit();
  const light = LIGHT[SHOT_LIGHT[id] ?? 'golden'];
  const bands = light.bands;
  const bandH = 70 / bands.length;
  const textOn = exit < 0.25; // the lettering pops away early in an un-build (no fade)
  const T = (s: string, x: number, y: number, size: number, anchor: 'start' | 'middle' = 'start', fill = CM.ink) => (
    <text x={x} y={y} fontFamily={captionFontStack} fontSize={size} fill={fill} textAnchor={anchor}>
      {s}
    </text>
  );
  const wordLines = wrap(words, 34, 860);
  const picLines = wrap(picture, 26, 860);
  const walkerX = 120 + (840 * Math.max(0, Math.min(1, t / dur)));
  const body = (
    <World sky={CM.sky}>
      {/* horizon bands (flat, below y 600) */}
      {bands.map((c, i) => (
        <Fill key={`b${i}`} rect={[-40, 600 + i * bandH, 1160, bandH + 1]} color={c} offset={false} />
      ))}
      {/* the sun disc: the one pop */}
      <Fill d={circle(sun[0], sun[1], sun[2], {seed: `${id}sun`})} color={CM.sun} />
      <Ink d={circle(sun[0], sun[1], sun[2], {seed: `${id}sunI`})} width={INK_PX.mid} />
      {/* the page: stucco card, paving ground, a brick course and the water */}
      <Fill rect={[-40, 670, 1160, 600]} color={CM.stucco} offset={false} />
      <Fill rect={[60, 700, 960, 520]} color={CM.paper} />
      <Ink d={rect(60, 700, 960, 520, {seed: `${id}card`})} width={INK_PX.mid} />
      <Fill rect={[-40, 1270, 1160, 120]} color={CM.water} offset={false} />
      <Ink d={line(-40, 1270, 1120, 1270, {seed: `${id}wl`})} width={INK_PX.mid} />
      <Fill rect={[-40, 1390, 1160, 90]} color={CM.brick} offset={false} />
      <Ink d={line(-40, 1390, 1120, 1390, {seed: `${id}br`})} width={INK_PX.mid} />
      <Fill rect={[-40, 1480, 1160, 480]} color={CM.paving} offset={false} />
      <Ink d={line(-40, 1480, 1120, 1480, {seed: `${id}pv`})} width={INK_PX.front} />
      {/* palette swatches */}
      {SWATCHES.map(([, c], i) => (
        <React.Fragment key={`s${i}`}>
          <Fill rect={[90 + i * 92, 1150, 76, 50]} color={c} />
          <Ink d={rect(90 + i * 92, 1150, 76, 50, {seed: `${id}sw${i}`})} width={INK_PX.far} />
        </React.Fragment>
      ))}
      {/* a walker on the paving: shot-local time, left to right */}
      <Fill d={circle(walkerX, 1640, 26, {seed: `${id}wk`})} color={CM.anchor} />
      <Fill rect={[walkerX - 24, 1666, 48, 90]} color={id === 'V2S2' || id === 'V2S5' || id === 'V2S6' || id === 'V2S7' ? CM.coatSlate : CM.hero} />
      <Ink d={line(walkerX - 30, 1760, walkerX + 30, 1760, {seed: `${id}wkI`})} width={INK_PX.mid} />
      {textOn ? (
        <g>
          {T(`${id} · ${title}`, 90, 770, 56)}
          {wordLines.map((l, i) => <React.Fragment key={`w${i}`}>{T(l, 90, 830 + i * 40, 34, 'start')}</React.Fragment>)}
          {picLines.map((l, i) => <React.Fragment key={`p${i}`}>{T(l, 90, 850 + wordLines.length * 40 + i * 32, 26, 'start', CM.line)}</React.Fragment>)}
          {T('palette 10 Canal Mint', 90, 1140, 22, 'start', CM.line)}
          {T(`Lane ${lane}: replace this file (src/v2r/scenes/${id}.tsx)`, 540, 1350, 30, 'middle')}
          {T(`shot t ${t.toFixed(2)} s`, 540, 1880, 24, 'middle', CM.line)}
        </g>
      ) : null}
    </World>
  );
  // the first shot's bare-line state (t < 0) and its colour flood from the sun (TREATMENT section 4: f1-f18)
  return bare ? <Look cascade={{at: 0, origin: [sun[0], sun[1]], speed: 7000}}>{body}</Look> : body;
};

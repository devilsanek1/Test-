// S11 LOCAL STAND-INS for shared props requested in docs/storyboard_v3.json "requests" that the props lane has not
// shipped yet. Same names and the props the requests describe, so a later fix round swaps the import to
// '../shared/props' and deletes this file:
//   LabelTag    (request: tag / card / slip / notice / sign / stamp; at, outAt, flipTo, swing)  -> only 'notice' + 'card'
//   StickyNote  (request: cream note, slapAt (flutter in + slap squash), strikeAt + strike substring; lettering >= 24 px)
//   BackSoonTag (request: LETTERED 'back soon' variant, CaptionHand >= 22 px on screen, tag >= 80 px wide; liftAt / outAt)
// House rules kept: no opacity anywhere (pops, springs, draw-ons, squashes, pendulums), flat fills misregistered in SCREEN
// px, ink weights given in SCREEN px and divided by the accumulated camera scale (so a push keeps the pen).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {circle, line, polyPath, rect, roundRect, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {matScale, misregScreen, pendulum} from '../shared/props/common';

const useScreenK = () => Math.max(1e-4, matScale(useXf()));

// ---------------------------------------------------------------- LabelTag (notice)

export type LabelTagProps = {
  /** Box centre (world). */
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  /** Font size in world px (pick it so it lands at 34-40 px on screen). */
  size: number;
  style?: 'notice' | 'card';
  /** Pops in (7 % spring, 0.2 s); a notice's 4 tape strips pop after it, `tapeStagger` apart. */
  at?: number;
  tapeStagger?: number;
  /** 1-frame shrink pop out. */
  outAt?: number;
  rot?: number;
  paper?: string;
  /** Outline width in SCREEN px (label style: 2.2). */
  inkPx?: number;
  seed?: string;
};

export const LabelTag: React.FC<LabelTagProps> = ({x, y, w, h, lines, size, style = 'notice', at, tapeStagger = 0.04, outAt, rot = 0, paper = palette.cream, inkPx = 2.2, seed = 'label'}) => {
  const t = useTime();
  useCaptionFont();
  const k = useScreenK();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt) return null;
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  if (pop <= 0.001) return null;
  const iw = inkPx / k;
  const mr = misregScreen(seed);
  const off: [number, number] = [mr[0] / k, mr[1] / k];
  const x0 = -w / 2;
  const y0 = -h / 2;
  const tapes: React.ReactNode[] = [];
  if (style === 'notice') {
    // 4 tape strips across the corners, popping in sequence (TL, TR, BR, BL)
    const tw = Math.min(30, w * 0.2);
    const th = tw * 0.36;
    const corners: [number, number, number][] = [
      [x0 + 2, y0 + 2, -38],
      [-x0 - 2, y0 + 2, 38],
      [-x0 - 2, -y0 - 2, -38],
      [x0 + 2, -y0 - 2, 38],
    ];
    corners.forEach(([cx, cy, a], i) => {
      const ta = at === undefined ? undefined : at + 0.08 + i * tapeStagger;
      if (ta !== undefined && t < ta) return;
      const tp = ta !== undefined ? springAt(t, ta, springs.pop) : 1;
      const d = polyPath([
        [-tw / 2, -th / 2],
        [tw / 2, -th / 2 + 0.6],
        [tw / 2 - 0.8, th / 2],
        [-tw / 2 + 0.6, th / 2 - 0.4],
      ]);
      tapes.push(
        <XG key={i} m={mat.compose(mat.translate(cx, cy), mat.rotate(a), mat.scale(tp))}>
          <Fill d={d} color={palette.mintPale} offset={false} mode="none" seed={`${seed}/tp${i}`} />
          <Ink d={d} width={iw * 0.55} taper={false} vary={0} seed={`${seed}/tpi${i}`} />
        </XG>,
      );
    });
  }
  const lh = size * 1.12;
  const ty0 = -((lines.length - 1) * lh) / 2 + size * 0.34;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(pop))}>
      <Fill d={roundRect(x0, y0, w, h, 3)} color={paper} offset={off} mode="none" seed={`${seed}/p`} />
      <Ink d={rect(x0, y0, w, h, {seed: `${seed}/o`, over: 'small'})} width={iw} vary={0} seed={`${seed}/o`} />
      {style === 'card' ? <path d={circle(0, y0 + 6, 2.4, {seed: `${seed}/pin`})} fill={palette.ink} /> : null}
      {lines.map((s, i) => (
        <text key={i} x={0} y={ty0 + i * lh} fontFamily={captionFontStack} fontSize={size} fill={palette.ink} textAnchor="middle">
          {s}
        </text>
      ))}
      {tapes}
    </XG>
  );
};

// ---------------------------------------------------------------- StickyNote (J6)

export type StickyNoteProps = {
  /** Rest centre on the surface (world). */
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  /** Font size (world px). */
  size: number;
  /** Substring whose LINE gets the strike-through. */
  strike?: string;
  /** The slap: the note lands flat at slapAt (0.12 s squash); it flutters in on the breeze before it. */
  slapAt: number;
  flutter?: {from: Pt; dur?: number; spin?: number};
  /** One ink strike-through (0.15 s). */
  strikeAt?: number;
  /** The bottom-right corner curls up and settles (0.35 s). */
  curlAt?: number | number[];
  rot?: number;
  color?: string;
  inkPx?: number;
  seed?: string;
};

export const StickyNote: React.FC<StickyNoteProps> = ({x, y, w, h, lines, size, strike, slapAt, flutter, strikeAt, curlAt, rot = -4, color = palette.cream, inkPx = 2.6, seed = 'note'}) => {
  const t = useTime();
  useCaptionFont();
  const k = useScreenK();
  const fd = flutter?.dur ?? 0.36;
  if (t < slapAt - (flutter ? fd : 0)) return null;
  const iw = inkPx / k;
  const mr = misregScreen(seed);
  const off: [number, number] = [mr[0] / k, mr[1] / k];
  // ---- placement: flutter in (a tumbling, edge-turning sheet on an arc), then the slap squash
  let cx = x;
  let cy = y;
  let a = rot;
  let sx = 1;
  let sy = 1;
  if (flutter && t < slapAt) {
    const q = prog(t, slapAt - fd, fd);
    const e = E.outQuad(q);
    const [fx, fy] = flutter.from;
    cx = lerp(fx, x, e) + Math.sin(q * Math.PI * 2.2) * 26 * (1 - q);
    cy = lerp(fy, y, e) - Math.sin(q * Math.PI) * 40;
    a = rot + (flutter.spin ?? 70) * (1 - e) * Math.cos(q * Math.PI * 1.5);
    sx = 0.3 + 0.7 * Math.abs(Math.cos(q * Math.PI * 1.6 * (1 - q * 0.4))); // the sheet turns edge-on and back (no fade)
    sy = 0.9 + 0.1 * q;
  } else {
    const q = prog(t, slapAt, 0.12, E.outCubic);
    if (q < 1) {
      sx = lerp(1.12, 1, q);
      sy = lerp(0.8, 1, q);
    }
  }
  // ---- the corner curl (bottom right)
  const curls = curlAt === undefined ? [] : Array.isArray(curlAt) ? curlAt : [curlAt];
  let c = 0;
  for (const ca of curls) if (t >= ca && t < ca + 0.4) c = Math.max(c, Math.sin(prog(t, ca, 0.4) * Math.PI) * Math.min(w, h) * 0.22);
  const x0 = -w / 2;
  const y0 = -h / 2;
  const x1 = w / 2;
  const y1 = h / 2;
  const body: Pt[] = c > 0.5 ? [[x0, y0], [x1, y0], [x1, y1 - c], [x1 - c, y1], [x0, y1]] : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const bodyD = polyPath(body);
  const flap = c > 0.5 ? polyPath([[x1, y1 - c], [x1 - c, y1], [x1 - c * 0.92, y1 - c * 0.92]]) : '';
  const lh = size * 1.12;
  const ty0 = y0 + h * 0.22 + ((h * 0.78 - (lines.length - 1) * lh) / 2) + size * 0.34;
  const strikeIdx = strike ? lines.findIndex((l) => l.includes(strike)) : -1;
  // strike-through: one ink line across the struck line's text width (estimated), drawn on in 0.15 s
  let strikeNode: React.ReactNode = null;
  if (strikeIdx >= 0 && strikeAt !== undefined && t >= strikeAt) {
    const sw = lines[strikeIdx].length * size * 0.43;
    const ly = ty0 + strikeIdx * lh - size * 0.3;
    strikeNode = <Ink d={line(-sw / 2 - 3, ly + 1.5, sw / 2 + 3, ly - 1.5, {seed: `${seed}/st`, over: [2, 5]})} at={strikeAt} dur={0.15} width={iw * 1.25} seed={`${seed}/sti`} />;
  }
  // slap marks: three short ink ticks for 0.16 s as it lands
  let slapMarks: React.ReactNode = null;
  if (t >= slapAt && t < slapAt + 0.16) {
    const q = prog(t, slapAt, 0.16);
    const L = 9 * Math.sin(Math.PI * q) + 2;
    const tk = (px: number, py: number, dx: number, dy: number) => `M${(px + dx * 4).toFixed(1)} ${(py + dy * 4).toFixed(1)}l${(dx * L).toFixed(1)} ${(dy * L).toFixed(1)}`;
    slapMarks = <path d={tk(x0 - 3, y0 - 3, -0.7, -0.7) + tk(x1 + 3, y0 - 3, 0.7, -0.7) + tk(x1 + 4, 0, 1, 0) + tk(x0 - 4, y1 * 0.4, -1, 0.15)} stroke={palette.ink} strokeWidth={iw * 0.8} strokeLinecap="round" fill="none" />;
  }
  return (
    <XG m={mat.compose(mat.translate(cx, cy), mat.rotate(a), mat.scale(sx, sy))}>
      <Fill d={bodyD} color={color} offset={off} mode="none" seed={`${seed}/p`} />
      {/* the adhesive band: one step darker strip along the top */}
      <Fill d={polyPath([[x0, y0], [x1, y0], [x1, y0 + h * 0.16], [x0, y0 + h * 0.16]])} color={palette.sand} offset={off} mode="none" seed={`${seed}/band`} />
      <Ink d={bodyD} width={iw} taper={false} vary={0} open={0.06} seed={`${seed}/o`} />
      {flap ? (
        <>
          <Fill d={flap} color={palette.sand} offset={false} mode="none" seed={`${seed}/fl`} />
          <Ink d={flap} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/fli`} />
        </>
      ) : null}
      {sx > 0.55
        ? lines.map((s, i) => (
            <text key={i} x={0} y={ty0 + i * lh} fontFamily={captionFontStack} fontSize={size} fill={palette.ink} textAnchor="middle">
              {s}
            </text>
          ))
        : null}
      {strikeNode}
      {slapMarks}
    </XG>
  );
};

// ---------------------------------------------------------------- BackSoonTag (lettered)

export type BackSoonTagProps = {
  /** Hang point (the string's top); the tag hangs below it. */
  x: number;
  y: number;
  /** Tag width (world px). Height = 0.8 w (incl. the notched top). */
  size?: number;
  /** Pops in and swings -16 -> 0 deg (0.5 s pendulum). */
  at?: number;
  /** Extra swings (taps / breeze). */
  tapAt?: number | number[];
  /** Twirls once about its string (0.45 s: the blank back shows edge-on, no fade). */
  twirlAt?: number | number[];
  lettered?: boolean;
  text?: [string, string];
  inkPx?: number;
  seed?: string;
};

export const BackSoonTag: React.FC<BackSoonTagProps> = ({x, y, size = 52, at, tapAt, twirlAt, lettered = true, text = ['back', 'soon'], inkPx = 2.2, seed = 'tagL'}) => {
  const t = useTime();
  useCaptionFont();
  const k = useScreenK();
  if (at !== undefined && t < at) return null;
  const iw = inkPx / k;
  const W = size;
  const H = size * 0.8;
  const str = size * 0.16;
  let a = pendulum(t, at, -16, 0.5, 0.8);
  const taps = tapAt === undefined ? [] : Array.isArray(tapAt) ? tapAt : [tapAt];
  for (const tp of taps) a += pendulum(t, tp, 12, 0.55, 0.9);
  const twirls = twirlAt === undefined ? [] : Array.isArray(twirlAt) ? twirlAt : [twirlAt];
  let tw = 1;
  for (const tr of twirls) if (t >= tr && t < tr + 0.45) tw = Math.cos(prog(t, tr, 0.45, E.inOutSine) * Math.PI * 2);
  const pop = at !== undefined ? Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7) : 1;
  const n = W * 0.16;
  const tag = polyPath([[-W / 2, str + n], [-W / 2 + n, str], [W / 2 - n, str], [W / 2, str + n], [W / 2, str + H], [-W / 2, str + H]]);
  const mr = misregScreen(seed);
  const fs = size * 0.27;
  const sx = Math.abs(tw) < 0.08 ? 0.08 : tw;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(pop))}>
      <Ink d={line(0, 0, 0, str + n * 0.6, {over: [0, 0], seed: `${seed}/str`})} width={iw * 0.6} taper={false} seed={`${seed}/str`} />
      <XG m={mat.scale(sx, 1)}>
        <Fill d={tag} color={palette.white} offset={[mr[0] / k / Math.abs(sx), mr[1] / k]} mode="none" seed={`${seed}/f`} />
        <Ink d={tag} width={iw / Math.max(0.3, Math.abs(sx))} taper={false} vary={0} seed={`${seed}/o`} />
        <path d={circle(0, str + n * 0.75, size * 0.045, {seed: `${seed}/h`})} fill="none" stroke={palette.ink} strokeWidth={iw * 0.6} />
        {lettered && tw > 0.35 ? (
          <>
            <text x={0} y={str + n * 0.9 + fs * 1.08} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
              {text[0]}
            </text>
            <text x={0} y={str + n * 0.9 + fs * 2.06} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
              {text[1]}
            </text>
          </>
        ) : null}
      </XG>
    </XG>
  );
};

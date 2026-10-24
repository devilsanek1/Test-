// Card.tsx — the mint page, the white polaroid card (theme.card) and the SVG art layer in CARD-LOCAL
// coordinates (0..card.w x 0..card.h = 960 x 1400). Main drives card transitions through `xf`.
//
//   <Page>
//     <Card xf={{rotY: 30, rotZ: -1.5}}>
//       <Art> <Panel/> ...scene svg... <Sun/> </Art>
//       <Captions beats={...}/>
//     </Card>
//   </Page>
//
// Transition math (measured on the reference, docs/motion_evidence) lives here too:
// flipOut/flipIn, swipeOut/swipeIn, pushOut/pushIn return CardXf for a time / progress value.

import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {card, cardSurface, palette, panel} from './theme';
import {clamp, ease as E, lerp, prog, springAt} from './time';
import {Fill, PanelClip} from './Fill';

export type CardXf = {rotY?: number; rotZ?: number; x?: number; y?: number; scale?: number; opacity?: number};

type CardCtxV = {rotY: number};
const CardCtx = createContext<CardCtxV>({rotY: 0});
/** Current card Y rotation in degrees (the Sun uses it to stay round during flips). */
export const useCardRotY = () => useContext(CardCtx).rotY;

/** CSS perspective (px). The reference flip is nearly orthographic: the card grows only ~2.7% taller edge-on. */
export const PERSPECTIVE = 18000;
/** Card thickness seen edge-on during flips (measured 12 px, sand coloured). */
export const CARD_EDGE = 12;

export const Page: React.FC<{children?: React.ReactNode; color?: string}> = ({children, color = palette.bg}) => (
  <AbsoluteFill style={{background: color, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

export const Card: React.FC<{
  xf?: CardXf;
  children?: React.ReactNode;
  /** Static paper grain overlay. Default theme cardSurface.grain (false: the reference card is flat white). */
  grain?: boolean;
  /** Soft shadow under the card. Default theme cardSurface.shadow (false). */
  shadow?: boolean;
}> = ({xf = {}, children, grain = cardSurface.grain, shadow = cardSurface.shadow}) => {
  const {rotY = 0, rotZ = 0, x = 0, y = 0, scale = 1, opacity = 1} = xf;
  if (opacity <= 0.001) return null;
  const has3d = Math.abs(rotY) > 0.01;
  const transform = `${has3d ? `perspective(${PERSPECTIVE}px) ` : ''}translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotateZ(${rotZ.toFixed(3)}deg)${
    has3d ? ` rotateY(${rotY.toFixed(3)}deg)` : ''
  }${scale !== 1 ? ` scale(${scale.toFixed(4)})` : ''}`;
  const edge: React.CSSProperties = {position: 'absolute', top: 0, width: CARD_EDGE, height: card.h, background: palette.sand, backfaceVisibility: 'hidden'};
  return (
    <div
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.w,
        height: card.h,
        transform: transform === 'translate(0.00px, 0.00px) rotateZ(0.000deg)' ? undefined : transform,
        transformOrigin: '50% 50%',
        transformStyle: has3d ? 'preserve-3d' : undefined,
        opacity: opacity < 1 ? opacity : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: palette.card,
          borderRadius: card.radius,
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          boxShadow: shadow ? '0 2px 3px rgba(40,60,50,0.10), 0 10px 26px rgba(40,60,50,0.10)' : undefined,
        }}
      >
        <CardCtx.Provider value={{rotY}}>{children}</CardCtx.Provider>
        {grain ? <Img src={staticFile('textures/grain.png')} style={{position: 'absolute', left: 0, top: 0, width: card.w, height: card.h, opacity: 0.55, pointerEvents: 'none'}} /> : null}
      </div>
      {has3d ? (
        <>
          <div style={{...edge, left: -CARD_EDGE, transformOrigin: 'right center', transform: 'rotateY(-90deg)'}} />
          <div style={{...edge, left: card.w, transformOrigin: 'left center', transform: 'rotateY(90deg)'}} />
        </>
      ) : null}
    </div>
  );
};

/** SVG layer in card-local coordinates. Fills inside are clipped to the panel (see Fill / Unclipped).
 *  `zoom` scales the art about a focus point (zoom transitions). */
export const Art: React.FC<{children?: React.ReactNode; zoom?: {s: number; x: number; y: number}; opacity?: number; clip?: boolean}> = ({children, zoom, opacity = 1, clip = true}) => {
  if (opacity <= 0.001) return null;
  const inner = zoom && zoom.s !== 1 ? <g transform={`translate(${zoom.x} ${zoom.y}) scale(${zoom.s}) translate(${-zoom.x} ${-zoom.y})`}>{children}</g> : children;
  return (
    <svg width={card.w} height={card.h} viewBox={`0 0 ${card.w} ${card.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden', opacity: opacity < 1 ? opacity : undefined}}>
      {clip ? <PanelClip>{inner}</PanelClip> : inner}
    </svg>
  );
};

/** The coloured illustration block (theme.panel). Default `sky`. Enters with a wipe/grow if `at` is set;
 *  as the biggest fill it collapses LAST in an un-build (like the reference's wall collapse). */
export const Panel: React.FC<{
  at?: number;
  color?: string;
  mode?: 'grow' | 'wipe' | 'fade' | 'pop';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}> = ({at, color = palette.sky, mode = 'wipe', x = panel.x, y = panel.y, w = panel.w, h = panel.h}) => (
  <Fill rect={[x, y, w, h]} color={color} at={at} mode={mode} dir="up" dur={0.35} offset={false} seed="panel" exitMode="wipe" exitDir="down" />
);

// ---------------------------------------------------------------- transition transforms (measured)

/** Seconds before the cut that a flip starts (quick pre-tilt, short hold, accelerating turn). */
export const FLIP_PRE = 0.62;
/** Seconds after the cut until the incoming card is flat. */
export const FLIP_POST = 0.45;

/** Outgoing card of a 3D flip. q = seconds relative to the cut (negative before it). tilt in degrees. */
export function flipOut(q: number, tilt = -1.5): CardXf {
  const z = tilt * prog(q, -FLIP_PRE, 0.15, E.outCubic);
  const u = clamp((q + 0.34) / 0.34);
  const rotY = 90 * Math.pow(u, 1.75);
  return {rotY: Math.min(rotY, 89.5), rotZ: z};
}

/** Incoming card of a 3D flip. q = seconds since the cut. */
export function flipIn(q: number, tilt = -1.5): CardXf {
  const u = clamp(q / 0.37);
  const rotY = -89.5 * Math.pow(1 - u, 2.5);
  const z = lerp(tilt * 0.7, 0, springAt(q, 0.05, {stiffness: 160, damping: 14}));
  return {rotY, rotZ: z};
}

export type PushDir = 'left' | 'right' | 'up' | 'down';
const pushVec = (dir: PushDir): [number, number] => (dir === 'left' ? [-1, 0] : dir === 'right' ? [1, 0] : dir === 'up' ? [0, -1] : [0, 1]);

/** Push: outgoing card leaves toward `dir`, incoming follows from the other side. p: 0..1. */
export function pushOut(p: number, dir: PushDir = 'left'): CardXf {
  const [vx, vy] = pushVec(dir);
  const k = E.inOutCubic(p);
  const dist = (vx ? card.w : card.h) + 140;
  return {x: vx * dist * k, y: vy * dist * k, rotZ: -vx * 1.2 * Math.sin(Math.PI * p)};
}
export function pushIn(p: number, dir: PushDir = 'left'): CardXf {
  const [vx, vy] = pushVec(dir);
  const k = E.inOutCubic(p);
  const dist = (vx ? card.w : card.h) + 140;
  return {x: -vx * dist * (1 - k), y: -vy * dist * (1 - k), rotZ: -vx * 1.2 * Math.sin(Math.PI * p)};
}

/** Swipe (measured T2): the outgoing card nudges +27 px with a 0.66 deg tilt (anticipation, 0.2 s), then the
 *  incoming card slides in from the right OVER it (0.63 s, slow start, long ease-out tail). q = s since slide start. */
export const SWIPE_ANTIC = 0.2;
export const SWIPE_SLIDE = 0.63;
export function swipeOut(q: number, dir: PushDir = 'left'): CardXf {
  const [vx] = pushVec(dir);
  const a = prog(q, -SWIPE_ANTIC, SWIPE_ANTIC, E.outCubic);
  return {x: -vx * 27 * a, rotZ: -vx * 0.66 * a};
}
export function swipeIn(q: number, dir: PushDir = 'left'): CardXf {
  const [vx] = pushVec(dir);
  const u = clamp(q / SWIPE_SLIDE);
  const p = u <= 0.12 ? 0.08 * E.inQuad(u / 0.12) : 0.08 + 0.92 * E.outCubic((u - 0.12) / 0.88);
  const dist = card.w + 130;
  return {x: -vx * dist * (1 - p)};
}

/** Sheet transition rectangle: grows from `from` to the full card, holds, shrinks to `to` (measured T1:
 *  grow 0.13 s, hold 0.1 s, shrink 0.23 s). q = seconds relative to the cut (cut = middle of the hold). */
export function sheetRect(q: number, from: [number, number, number, number], to: [number, number, number, number]): [number, number, number, number] | null {
  const full: [number, number, number, number] = [0, 0, card.w, card.h];
  const mix = (a: number[], b: number[], p: number) => a.map((v, i) => lerp(v, b[i], p)) as [number, number, number, number];
  if (q < -0.18 || q > 0.28) return null;
  if (q < -0.05) return mix(from, full, E.inCubic(prog(q, -0.18, 0.13)));
  if (q < 0.05) return full;
  return mix(full, to, E.outCubic(prog(q, 0.05, 0.23)));
}

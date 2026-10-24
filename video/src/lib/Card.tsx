// Card.tsx — the mint page, the white polaroid card (theme.card) and the SVG art layer in CARD-LOCAL
// coordinates (0..card.w x 0..card.h = 960 x 1400). Main drives card transitions through `xf`.
//
//   <Page>
//     <Card xf={{rotY: 30, rotZ: -2}}>
//       <Art> <Panel/> <Sun/> ...scene svg... </Art>
//       <Captions beats={...}/>
//     </Card>
//   </Page>
//
// Transition math lives here too: flipOut/flipIn/pushOut/pushIn return CardXf for a progress value.

import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {card, palette, panel} from './theme';
import {clamp, ease as E, lerp, prog, springAt} from './time';
import {Fill} from './Fill';

export type CardXf = {rotY?: number; rotZ?: number; x?: number; y?: number; scale?: number; opacity?: number};

type CardCtxV = {rotY: number};
const CardCtx = createContext<CardCtxV>({rotY: 0});
/** Current card Y rotation in degrees (the Sun uses it to stay round during flips). */
export const useCardRotY = () => useContext(CardCtx).rotY;

export const PERSPECTIVE = 2400;

export const Page: React.FC<{children?: React.ReactNode; color?: string}> = ({children, color = palette.bg}) => (
  <AbsoluteFill style={{background: color, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

export const Card: React.FC<{
  xf?: CardXf;
  children?: React.ReactNode;
  /** Subtle static paper grain overlay (one PNG, no per-frame filters). Default true. */
  grain?: boolean;
  /** Soft shadow under the card. Default true. */
  shadow?: boolean;
}> = ({xf = {}, children, grain = true, shadow = true}) => {
  const {rotY = 0, rotZ = 0, x = 0, y = 0, scale = 1, opacity = 1} = xf;
  if (opacity <= 0.001) return null;
  const has3d = rotY !== 0;
  const transform = `${has3d ? `perspective(${PERSPECTIVE}px) ` : ''}translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotateZ(${rotZ.toFixed(3)}deg)${has3d ? ` rotateY(${rotY.toFixed(3)}deg)` : ''}${scale !== 1 ? ` scale(${scale.toFixed(4)})` : ''}`;
  return (
    <div
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.w,
        height: card.h,
        transform,
        transformOrigin: '50% 50%',
        background: palette.card,
        borderRadius: card.radius,
        overflow: 'hidden',
        opacity: opacity < 1 ? opacity : undefined,
        backfaceVisibility: 'hidden',
        boxShadow: shadow ? '0 2px 3px rgba(40,60,50,0.10), 0 10px 26px rgba(40,60,50,0.10)' : undefined,
      }}
    >
      <CardCtx.Provider value={{rotY}}>{children}</CardCtx.Provider>
      {grain ? (
        <Img src={staticFile('textures/grain.png')} style={{position: 'absolute', left: 0, top: 0, width: card.w, height: card.h, opacity: 0.55, pointerEvents: 'none'}} />
      ) : null}
    </div>
  );
};

/** SVG layer in card-local coordinates. `zoom` scales the art about a focus point (zoom-through transitions). */
export const Art: React.FC<{children?: React.ReactNode; zoom?: {s: number; x: number; y: number}; opacity?: number}> = ({children, zoom, opacity = 1}) => {
  if (opacity <= 0.001) return null;
  return (
    <svg
      width={card.w}
      height={card.h}
      viewBox={`0 0 ${card.w} ${card.h}`}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden', opacity: opacity < 1 ? opacity : undefined}}
    >
      {zoom && zoom.s !== 1 ? <g transform={`translate(${zoom.x} ${zoom.y}) scale(${zoom.s}) translate(${-zoom.x} ${-zoom.y})`}>{children}</g> : children}
    </svg>
  );
};

/** The coloured illustration block (theme.panel). Default mint "sky". Enters with a wipe/grow if `at` is set. */
export const Panel: React.FC<{
  at?: number;
  color?: string;
  mode?: 'grow' | 'wipe' | 'fade' | 'pop';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** Exact edges (no misregistration). Default true. */
  exact?: boolean;
}> = ({at, color = palette.bg, mode = 'wipe', x = panel.x, y = panel.y, w = panel.w, h = panel.h, exact = true}) => (
  <Fill rect={[x, y, w, h]} color={color} at={at} mode={mode} dir={mode === 'wipe' ? 'down' : 'up'} dur={0.5} offset={exact ? false : undefined} seed="panel" />
);

// ---------------------------------------------------------------- transition transforms

/** Outgoing half of a 3D flip. p: 0..1 over the pre-roll (tilt + ease-in to edge-on). */
export function flipOut(p: number, tilt = -2.6): CardXf {
  // slow pre-tilt for the first ~70%, then accelerate to edge-on
  const z = tilt * E.inOutSine(clamp(p / 0.6));
  const yPre = 7 * E.inOutSine(clamp(p / 0.7));
  const yFast = E.inCubic(clamp((p - 0.62) / 0.38));
  const rotY = lerp(yPre, 90, yFast);
  return {rotY: Math.min(rotY, 89.4), rotZ: z, scale: 1 - 0.035 * yFast};
}

/** Incoming half of a 3D flip. q: seconds since the swap; total settle ~0.6 s. */
export function flipIn(q: number, tilt = -2.6): CardXf {
  const sw = prog(q, 0, 0.26, E.outCubic);
  const settle = springAt(q, 0.12, {stiffness: 150, damping: 13});
  const rotY = q <= 0 ? -89.4 : sw < 1 ? lerp(-89.4, 4, sw) : lerp(4, 0, prog(q, 0.26, 0.45, E.inOutSine));
  const z = lerp(tilt * 0.8, 0, settle);
  return {rotY: Math.max(rotY, -89.4), rotZ: z, scale: lerp(0.965, 1, prog(q, 0, 0.3, E.outCubic))};
}

export type PushDir = 'left' | 'right' | 'up' | 'down';
const pushVec = (dir: PushDir): [number, number] => (dir === 'left' ? [-1, 0] : dir === 'right' ? [1, 0] : dir === 'up' ? [0, -1] : [0, 1]);

/** Push: outgoing card leaves toward `dir`, incoming follows from the other side. p: 0..1. */
export function pushOut(p: number, dir: PushDir = 'left'): CardXf {
  const [vx, vy] = pushVec(dir);
  const k = E.inOutCubic(p);
  const dist = (vx ? card.w : card.h) + 140;
  return {x: vx * dist * k, y: vy * dist * k, rotZ: -vx * 1.5 * Math.sin(Math.PI * p)};
}
export function pushIn(p: number, dir: PushDir = 'left'): CardXf {
  const [vx, vy] = pushVec(dir);
  const k = E.inOutCubic(p);
  const dist = (vx ? card.w : card.h) + 140;
  return {x: -vx * dist * (1 - k), y: -vy * dist * (1 - k), rotZ: -vx * 1.5 * Math.sin(Math.PI * p)};
}

// S09's foreground wiper OUT (S10 transitionIn {type: 'foreground-wipe', element: 'scene', dur 0.5, dir 'right'}): the
// tram (props Tram's design: teal body, mintPale windows, sand stripe, tealDark skirt, peach lamp, ink 4.8) passing
// right in front of the lens, its roof line at screen y 600 and its body running off the frame bottom, Pip riding the
// roof. SCREEN px, centred on the wipe edge x (the seam is under the middle of the body).
// Above the roof both scenes show only the flat day sky at that moment (S09 holds still at rest: ridge 700, the sun
// takes off on the S10 sun's hop; S10 holds at rest, ceiling 600), so the open sky needs no cover; below it the body
// covers x +-670 top to bottom (Film's 'half').

import React from 'react';
import {Fill, Ink, palette, useTime, line, rect, rectPath, roundRect, WiperComponent, WiperProps} from '../../lib';
import {Elephant} from '../../lib/mascot';
import {B, S09_END, WIPE_DUR} from './beats';
import {wipeEdgeX} from '../../lib/cine/wipers';

/** Tram geometry in tram-local screen px (x relative to the wipe edge). `pipDx` = where Pip rides at the hand-over. */
export const TRAM = {L: 1340, roof: 600, nose: 170, pipDx: -590, pipScale: 0.75};
/** Pip leaves the roof here (S09 local; = 39.805 film: S10's 'Plus' + 0.10, where S10 picks him up). */
export const TRAM_PIP_UNTIL = B.end + 0.171;
/** The boarding (fix round 1): S09's Pip leaps straight up off his post (PartB NEAR.pip.x = 884) at B.board, past the
 *  roof line before the nose reaches him, and lands on the roof at B.boardLand, where this Wiper takes him over. */
export const BOARD = {x: 884, land: B.boardLand};

const W = 4.8;
const filmT0 = S09_END - WIPE_DUR / 2;
const edgeAt = (T: number) => wipeEdgeX(Math.max(0, Math.min(1, (T - filmT0) / WIPE_DUR)), 'right', TramWiper.half!);
const fT = (local: number) => local + (S09_END - B.end);

/** Where S09's tram carries Pip at FILM time T (screen px; Pip's feet). He lands on the roof at (884, 602) and runs
 *  back along it against the tram's travel, so on screen he only drifts right while the tram streams past under him,
 *  to the hand-over spot (edge + pipDx at film 39.805, unchanged) where S10 picks him up for its hop. */
export function tramPipAt(T: number): {x: number; y: number; scale: number} {
  const a = fT(BOARD.land);
  const b = fT(TRAM_PIP_UNTIL);
  const end = edgeAt(b) + TRAM.pipDx;
  const q = Math.max(0, Math.min(1, (T - a) / (b - a)));
  const x = T <= a ? BOARD.x : BOARD.x + (end - BOARD.x) * (q * q * (3 - 2 * q));
  return {x, y: TRAM.roof + 2, scale: TRAM.pipScale};
}

const TramBody: React.FC<{x: number; dir: 'left' | 'right'}> = ({x, dir}) => {
  const t = useTime();
  const {L, roof, nose} = TRAM;
  const bob = Math.sin(t * 38) * 1.6;
  const y0 = roof + bob;
  const h = 1500;
  // local frame: nose at +L/2 (dir right); mirrored for dir left
  const body = `M${-L / 2} ${y0}H${L / 2 - nose}Q${L / 2} ${y0} ${L / 2} ${y0 + nose}V${y0 + h}H${-L / 2}Z`;
  const winTop = y0 + 82;
  const winH = 380;
  const wins: string[] = [];
  let mull = '';
  const n = 4;
  const x0 = -L / 2 + 46;
  const ww = 214;
  const gap = 38;
  for (let i = 0; i < n; i++) {
    const wx = x0 + i * (ww + gap) + (i >= 2 ? 120 : 0);
    wins.push(roundRect(wx, winTop, ww, winH, 14));
    mull += rect(wx, winTop, ww, winH, {seed: `s9tw${i}`, over: 5, edges: 'tlb'}) + line(wx, winTop + winH * 0.38, wx + ww, winTop + winH * 0.38, {seed: `s9twm${i}`, over: [2, 4]});
  }
  // the door between windows 2 and 3 (tealDark frame, two tall glass leaves)
  const dx = x0 + 2 * (ww + gap) - 8;
  const door = rectPath(dx, winTop - 18, 136, 1100);
  const doorGlass = roundRect(dx + 14, winTop + 10, 48, winH + 120, 8) + roundRect(dx + 74, winTop + 10, 48, winH + 120, 8);
  // the windscreen at the nose
  const ws = `M${L / 2 - 250} ${winTop}H${L / 2 - nose * 0.7}Q${L / 2 - 26} ${winTop + 10} ${L / 2 - 22} ${winTop + 120}V${winTop + winH}H${L / 2 - 250}Z`;
  const stripeY = winTop + winH + 52;
  const skirtY = y0 + 1060;
  const lampX = L / 2 - 70;
  const lampY = stripeY + 150;
  const sx = dir === 'right' ? 1 : -1;
  return (
    <g transform={`translate(${x.toFixed(1)} 0) scale(${sx} 1)`}>
      <Fill d={body} color={palette.teal} offset={[5, 4]} mode="snap" seed="s9tram/body" />
      <Fill d={rectPath(-L / 2, y0, L - nose * 0.6, 34)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/roof" />
      <Fill d={door} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/door" />
      <Fill d={wins.join('') + ws + doorGlass} color={palette.mintPale} offset={false} mode="snap" seed="s9tram/win" />
      <Fill d={rectPath(-L / 2, stripeY, L, 34)} color={palette.sand} offset={false} mode="snap" seed="s9tram/stripe" />
      <Fill d={rectPath(-L / 2, skirtY, L, 600)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/skirt" />
      <Fill d={roundRect(lampX - 34, lampY, 68, 44, 18)} color={palette.peach} offset={false} mode="snap" seed="s9tram/lamp" />
      <Fill d={roundRect(L / 2 - 210, y0 + 38, 150, 34, 6)} color={palette.cream} offset={false} mode="snap" seed="s9tram/sign" />
      <Ink d={body} width={W} taper={false} seed="s9tram/bodyI" />
      <Ink d={mull + ws + line(-L / 2, stripeY, L / 2, stripeY, {seed: 's9tram/s1', over: [0, 0]}) + line(-L / 2, stripeY + 34, L / 2, stripeY + 34, {seed: 's9tram/s2', over: [0, 0]}) + line(-L / 2, skirtY, L / 2, skirtY, {seed: 's9tram/s3', over: [0, 0]}) + rect(dx, winTop - 18, 136, 1100, {seed: 's9tram/d', over: 4, edges: 'tlr'}) + `M${dx + 68} ${winTop - 10}V${winTop + 1060}`} width={W * 0.72} taper={false} seed="s9tram/det" />
      <Ink d={roundRect(lampX - 34, lampY, 68, 44, 18) + rect(L / 2 - 210, y0 + 38, 150, 34, {seed: 's9tram/sg', over: 3})} width={W * 0.6} taper={false} seed="s9tram/li" />
      {/* window glints: two short diagonal strokes per window (cream on mintPale reads as glass) */}
      <Ink d={wins.map((_, i) => {
        const wx = x0 + i * (ww + gap) + (i >= 2 ? 120 : 0);
        return `M${wx + 30} ${winTop + 120}l40 -60M${wx + 52} ${winTop + 140}l22 -33`;
      }).join('')} width={5} color={palette.white} taper={false} seed="s9tram/gl" />
    </g>
  );
};

const TramWiperFC: React.FC<WiperProps> = ({x, p, dir}) => {
  const t = useTime();
  const sx = dir === 'right' ? 1 : -1;
  // Pip on the roof from the boarding landing to the S10 hand-over (his screen path is tramPipAt; mirrored for 'left')
  const at = tramPipAt(fT(t));
  const pipX = dir === 'right' ? at.x : 1080 - at.x;
  const d = t - BOARD.land;
  const land = d >= 0 && d < 0.3 ? 0.24 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2) : 0;
  const bob = Math.abs(Math.sin(t * 19)) * -4;
  const on = t >= BOARD.land && t < TRAM_PIP_UNTIL && p > 0 && p < 1;
  return (
    <>
      <TramBody x={x} dir={dir} />
      {on ? <Elephant x={pipX} y={TRAM.roof + 2 + bob} scale={TRAM.pipScale} pose="walk-side" walkRate={3.2} flip={dir === 'right'} squash={land} look={-0.4 * sx} t={t} seed={9} /> : null}
    </>
  );
};

export const TramWiper: WiperComponent = Object.assign(TramWiperFC, {
  /** Over the body (y >= the roof) no caption is drawn; Pip on the roof dips into the band bottom: ink reads on him. */
  captionRegions: ({x}: WiperProps) => [{tone: 'dark' as const, rect: [x - TRAM.L / 2, 520, x + TRAM.L / 2, 2200] as [number, number, number, number]}],
  /** The body's real half-width about the edge (+ ink and the 5 px misregistration). */
  half: TRAM.L / 2 + 8,
});

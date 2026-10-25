// S09's foreground wiper OUT (S10 transitionIn {type: 'foreground-wipe', element: 'scene', dur 0.5, dir 'right'}): the
// tram (props Tram's design: teal body, mintPale windows, sand stripe, tealDark skirt, peach lamp, ink 4.8) passing
// right in front of the lens, its roof line at screen y 600 and its body running off the frame bottom, Pip riding the
// roof. SCREEN px, centred on the wipe edge x (the seam is under the middle of the body).
// Above the roof both scenes show only the flat day sky at that moment (S09 holds still at rest: ridge 700, the sun
// takes off on the S10 sun's hop; S10 holds at rest, ceiling 600), so the open sky needs no cover; below it the body
// covers x +-670 top to bottom (Film's 'half').

import React from 'react';
import {Fill, Ink, palette, useTime, line, rect, rectPath, roundRect, captionFontStack, WiperComponent, WiperProps} from '../../lib';
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
  // fix round 2 detail (the tram fills the frame for ~0.3 s): a roof rail on short posts + a folded pantograph (its
  // head stays under the caption floor), panel seams with overshoot on the lower body, misregistered window fills, a
  // destination board in the caption hand (a pauser joke for S10's Old Quarter), wheels + bogie under the skirt line,
  // rivet ticks, and a one-sided peach rim along the roof from the dawn sun behind it.
  const rail = rectPath(-L / 2 + 60, y0 - 12, L - nose - 120, 5);
  let posts = '';
  for (let px = -L / 2 + 90; px < L / 2 - nose - 70; px += 150) posts += `M${px} ${y0 - 8}V${y0}`;
  const pc = -L / 2 + 470; // pantograph base centre
  const panto = `M${pc - 60} ${y0 - 4}L${pc - 8} ${y0 - 22}L${pc + 46} ${y0 - 6}M${pc - 8} ${y0 - 22}L${pc + 30} ${y0 - 26}M${pc - 4} ${y0 - 26}H${pc + 70}`;
  let seams = '';
  for (let i = 0; i < 5; i++) {
    const qx = -L / 2 + 150 + i * 250 + (i >= 2 ? 40 : 0);
    seams += line(qx, stripeY + 40, qx, skirtY - 6, {seed: `s9tram/sm${i}`, over: [4, 10]});
  }
  seams += line(-L / 2, stripeY + 330, L / 2 - 20, stripeY + 330, {seed: 's9tram/smh', over: [0, 12]});
  let rivets = '';
  for (let rx = -L / 2 + 40; rx < L / 2 - 40; rx += 46) rivets += `M${rx} ${skirtY + 22}v6`;
  const wheelY = skirtY + 190;
  const wheels = [-L / 2 + 230, -L / 2 + 420, L / 2 - 420, L / 2 - 230];
  const wheelD = wheels.map((wx) => `M${wx - 72} ${wheelY}a72 72 0 1 0 144 0a72 72 0 1 0 -144 0Z`).join('');
  const hubD = wheels.map((wx) => `M${wx - 16} ${wheelY}a16 16 0 1 0 32 0a16 16 0 1 0 -32 0Z`).join('');
  const board = {x: L / 2 - 372, y: y0 + 30, w: 300, h: 48};
  return (
    <g transform={`translate(${x.toFixed(1)} 0) scale(${sx} 1)`}>
      <Fill d={body} color={palette.teal} offset={[5, 4]} mode="snap" seed="s9tram/body" />
      <Fill d={rectPath(-L / 2, y0, L - nose * 0.6, 34)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/roof" />
      <Fill d={rail} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/rail" />
      <Fill d={rectPath(-L / 2 + 20, y0 - 1, L - nose - 40, 6)} color={palette.peach} offset={false} mode="snap" seed="s9tram/rim" />
      <Fill d={door} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/door" />
      <Fill d={wins.join('') + ws + doorGlass} color={palette.mintPale} offset={[6, 4]} mode="snap" seed="s9tram/win" />
      <Fill d={rectPath(-L / 2, stripeY, L, 34)} color={palette.sand} offset={[4, 3]} mode="snap" seed="s9tram/stripe" />
      <Fill d={rectPath(-L / 2, skirtY, L, 600)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/skirt" />
      <Fill d={wheelD} color={palette.ink} offset={false} mode="snap" seed="s9tram/wheels" />
      <Fill d={hubD} color={palette.sand} offset={false} mode="snap" seed="s9tram/hubs" />
      <Fill d={roundRect(lampX - 34, lampY, 68, 44, 18)} color={palette.peach} offset={false} mode="snap" seed="s9tram/lamp" />
      <Fill d={roundRect(board.x, board.y, board.w, board.h, 6)} color={palette.cream} offset={[3, 2]} mode="snap" seed="s9tram/sign" />
      <g transform={`translate(${board.x + board.w / 2} ${board.y + board.h * 0.74}) scale(${sx} 1)`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={captionFontStack} fontSize={34} fill={palette.ink}>
          Old Quarter · v5.6
        </text>
      </g>
      <Ink d={posts + panto} width={W * 0.62} taper={false} seed="s9tram/panto" />
      <Ink d={seams + rivets} width={W * 0.5} taper={false} seed="s9tram/seams" />
      <Ink d={wheels.map((wx) => `M${wx - 72} ${wheelY}a72 72 0 1 0 144 0a72 72 0 1 0 -144 0Z`).join('') + line(wheels[0], wheelY, wheels[1], wheelY, {seed: 's9tram/b1', over: [10, 10]}) + line(wheels[2], wheelY, wheels[3], wheelY, {seed: 's9tram/b2', over: [10, 10]})} width={W * 0.6} color={palette.sand} taper={false} seed="s9tram/wi" />
      <Ink d={body} width={W} taper={false} seed="s9tram/bodyI" />
      <Ink d={mull + ws + line(-L / 2, stripeY, L / 2, stripeY, {seed: 's9tram/s1', over: [0, 0]}) + line(-L / 2, stripeY + 34, L / 2, stripeY + 34, {seed: 's9tram/s2', over: [0, 0]}) + line(-L / 2, skirtY, L / 2, skirtY, {seed: 's9tram/s3', over: [0, 0]}) + rect(dx, winTop - 18, 136, 1100, {seed: 's9tram/d', over: 4, edges: 'tlr'}) + `M${dx + 68} ${winTop - 10}V${winTop + 1060}`} width={W * 0.72} taper={false} seed="s9tram/det" />
      <Ink d={roundRect(lampX - 34, lampY, 68, 44, 18) + rect(board.x, board.y, board.w, board.h, {seed: 's9tram/sg', over: 4})} width={W * 0.6} taper={false} seed="s9tram/li" />
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

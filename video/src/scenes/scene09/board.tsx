// S09 A1 FR2 (reviewer major: 'Pip's tram-boarding leap starts 9 frames before any tram is on screen ... with sound off it
// reads as Pip flies away'): THE BOARDING, one module for the two places that draw it. Pip holds on the pier through the
// sigh and the tram's cue, crouches, and takes off only once the tram's nose is in frame (B.board - 1/60 = local 5.00:
// the nose's first Main frame is f1184 = 4.984); 0.26 s of ballistic flight (vertical speed falling linearly to ZERO at
// the apex = the tram's roof line, feet 602: never above screen y 600) with a body-colour smear on the first 2 airborne
// frames, landing on the roof at local 5.26 inside the wipe (the wipe runs to cut + 0.25 = 5.40). The tram's nose passes
// under him at ~5.10, so from the take-off the Wiper (drawn ABOVE both scenes) draws him too, in front of the tram; the
// scene's own copy (PartB) is identical and sits under it (the S09 composition alone has no Wiper).
// Horizontally he holds the pier's x, then drifts right along the SAME path as before (smoothstep from 5.167 to the S10
// hand-over spot at film 39.805): S10's leap reads tramPipAt there (position + backward-difference velocity), unchanged.

import React from 'react';
import {Fill, Ink, clamp, speedLines} from '../../lib';
import {Elephant} from '../../lib/mascot';
import {wipeEdgeX} from '../../lib/cine/wipers';
import {B, S09_END, WIPE_DUR} from './beats';

/** The pier (PartB NEAR.pier): Pip sits on its cap (feet CAP + 1) at x 884, scale 0.75. */
export const PIER = {x: 884, cap: 1480, scale: 0.75};
/** The tram (TramWiper TRAM): body length, roof line, nose radius; Pip's offset from the wipe edge at the S10 hand-over. */
export const TRAM = {L: 1340, roof: 600, nose: 170, pipDx: -590, pipScale: 0.75};
/** Take-off: the first airborne Main frame is f1185 (local 5.017), the frame after the nose's first. */
export const TAKEOFF = B.board - 1 / 60;
/** Landing on the roof (feet 602), inside the wipe. */
export const LAND = B.end + 0.11;
/** Pip leaves the roof here (S09 local; = 39.805 film: S10's 'Plus' + 0.10, where S10 picks him up). */
export const TRAM_PIP_UNTIL = B.end + 0.171;
/** The horizontal drift toward the hand-over spot starts here (the old landing time: keeps S10's hand-over velocity). */
const RUN_FROM = B.boardLand;
export const ROOF_Y = TRAM.roof + 2;
const SMEAR_DUR = 2 / 30 + 0.001;
const SPEED_LINES = 4 / 30 + 0.001;
/** Pip's body colour (lib/mascot colors: the lavender body) for the take-off smear. */
const PIP_BODY = '#8D90CC';

/** S09 local -> film time. */
export const fT = (local: number) => local + (S09_END - B.end);
const filmT0 = S09_END - WIPE_DUR / 2;
/** The tram's wipe edge (screen x of the body's centre) at film time T (TramWiper.half = L / 2 + 8). */
export const edgeAt = (T: number) => wipeEdgeX(Math.max(0, Math.min(1, (T - filmT0) / WIPE_DUR)), 'right', TRAM.L / 2 + 8);

/** Pip's screen x at S09-local t from the take-off: the pier's x, then the old roof-run smoothstep to the hand-over. */
function runX(t: number): number {
  const a = RUN_FROM;
  const b = TRAM_PIP_UNTIL;
  const end = edgeAt(fT(b)) + TRAM.pipDx;
  const q = clamp((t - a) / (b - a));
  return t <= a ? PIER.x : PIER.x + (end - PIER.x) * (q * q * (3 - 2 * q));
}

/** Pip's feet at S09-local t during the flight (TAKEOFF .. LAND) and on the roof (LAND .. TRAM_PIP_UNTIL). */
export function boardAt(t: number): {x: number; y: number; k: number} {
  const k = clamp((t - TAKEOFF) / (LAND - TAKEOFF));
  const y = ROOF_Y + (PIER.cap + 1 - ROOF_Y) * (1 - k) * (1 - k);
  return {x: runX(t), y: t >= LAND ? ROOF_Y : y, k};
}

/** Where S09's tram carries Pip at FILM time T (screen px; Pip's feet): S10 reads it at its hand-over. */
export function tramPipAt(T: number): {x: number; y: number; scale: number} {
  const p = boardAt(T - (S09_END - B.end));
  return {x: p.x, y: p.y, scale: TRAM.pipScale};
}

/** The flight (TAKEOFF .. LAND), drawn by PartB (under the tram) and by the Wiper (over it): stretched on the fast
 *  take-off frames (sy ~1.3), relaxing toward the apex; the smear (a body-colour teardrop from his belly toward the pier)
 *  on the first 2 airborne frames and 3 ink speed lines under him for 3 frames, so consecutive positions overlap. */
export const PipFlight: React.FC<{t: number}> = ({t}) => {
  if (t < TAKEOFF || t >= LAND) return null;
  const p = boardAt(t);
  const k = p.k;
  const squash = k < 0.45 ? -0.3 * (1 - k / 0.45) - 0.05 : -0.05;
  // the smear (first 2 airborne frames) reaches back over the last frame's travel (v / 30), so it joins the pier to him
  let smear: React.ReactNode = null;
  const step = (2 * (PIER.cap + 1 - ROOF_Y) * (1 - k)) / (LAND - TAKEOFF) / 30;
  if (t < TAKEOFF + SMEAR_DUR) {
    const top = p.y - 34;
    const bot = Math.min(PIER.cap + 1, p.y + 30 + step);
    const w = 24 * Math.min(1, 0.55 + step / 400);
    const d = `M${p.x - w} ${top}Q${p.x} ${top - 12} ${p.x + w} ${top}Q${p.x + w * 0.5} ${(top + bot) / 2} ${p.x} ${bot}Q${p.x - w * 0.5} ${(top + bot) / 2} ${p.x - w} ${top}Z`;
    smear = <Fill d={d} color={PIP_BODY} offset={false} mode="snap" seed="s9pip/smear" />;
  }
  // three ink speed lines under him on frames 1-4, as long as the frame's travel
  const lines = t < TAKEOFF + SPEED_LINES ? speedLines(p.x, p.y + 50, {n: 3, len: Math.min(110, step * 0.75), gap: 20, angle: 90, seed: 's9pip/sl'}) : '';
  return (
    <>
      {smear}
      {lines ? <Ink d={lines} width={3.4} taper={false} seed="s9pip/sli" /> : null}
      <Elephant x={p.x} y={p.y} scale={PIER.scale} pose="stand-side" amount={Math.sqrt(Math.min(1, k * 1.6))} squash={squash} look={-0.4} lineWeight={1} t={t} seed={9} />
    </>
  );
};

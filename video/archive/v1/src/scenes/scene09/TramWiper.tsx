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
import {LAND, PipFlight, TAKEOFF, TRAM, TRAM_PIP_UNTIL, fT, tramPipAt} from './board';

// A1 FR2: the tram geometry, the boarding (take-off once the nose is in frame, landing inside the wipe) and S10's
// hand-over (tramPipAt) live in board.tsx; re-exported here for S10.
export {TRAM, TRAM_PIP_UNTIL, tramPipAt};

const W = 4.8;

/** Passengers seen through the windows (polish A1, reviewer: two huge empty mintPale panes read as a placeholder):
 *  head-and-shoulders, flat hair masses with a parting (no faces), clipped to the glass; tram-local x, head centre y
 *  relative to the window top. */
const PASSENGERS: {x: number; hy: number; r: number; hair: string; coat: string; part: number}[] = [
  {x: -548, hy: 236, r: 46, hair: palette.brown, coat: palette.teal, part: 0.3},
  {x: -318, hy: 228, r: 44, hair: palette.ink, coat: palette.sand, part: -0.25},
  {x: -206, hy: 250, r: 41, hair: palette.brown, coat: palette.sage, part: 0.2},
  {x: 338, hy: 232, r: 45, hair: palette.ink, coat: palette.brown, part: -0.3},
];
/** Hand straps hanging from the ceiling rail (tram-local x): one held (its hand under it), one swinging free. */
const STRAPS: {x: number; held: boolean}[] = [
  {x: -262, held: true},
  {x: 120, held: false},
];

const TramBody: React.FC<{x: number; dir: 'left' | 'right'}> = ({x, dir}) => {
  const t = useTime();
  const clipId = 's9tw' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const {L, roof, nose} = TRAM;
  const bob = Math.sin(t * 38) * 1.6;
  const y0 = roof + bob;
  const h = 1500;
  // local frame: nose at +L/2 (dir right); mirrored for dir left
  const body = `M${-L / 2} ${y0}H${L / 2 - nose}Q${L / 2} ${y0} ${L / 2} ${y0 + nose}V${y0 + h}H${-L / 2}Z`;
  const winTop = y0 + 82;
  const winH = 380;
  const wins: string[] = [];
  const winX: number[] = [];
  let mull = '';
  const n = 4;
  const x0 = -L / 2 + 46;
  const ww = 214;
  const gap = 38;
  for (let i = 0; i < n; i++) {
    const wx = x0 + i * (ww + gap) + (i >= 2 ? 120 : 0);
    winX.push(wx);
    wins.push(roundRect(wx, winTop, ww, winH, 14));
    // polish A1: the frames in the body's 4.8 ink with overshooting corners
    mull += rect(wx, winTop, ww, winH, {seed: `s9tw${i}`, over: 9}) + line(wx - 4, winTop + winH * 0.38, wx + ww + 5, winTop + winH * 0.38, {seed: `s9twm${i}`, over: [3, 6]});
  }
  // the door between windows 2 and 3 (tealDark frame, two tall glass leaves), its seam, and a sand step under it
  const dx = x0 + 2 * (ww + gap) - 8;
  const door = rectPath(dx, winTop - 18, 136, 1100);
  const doorGlass = roundRect(dx + 14, winTop + 10, 48, winH + 120, 8) + roundRect(dx + 74, winTop + 10, 48, winH + 120, 8);
  // the windscreen at the nose
  const ws = `M${L / 2 - 250} ${winTop}H${L / 2 - nose * 0.7}Q${L / 2 - 26} ${winTop + 10} ${L / 2 - 22} ${winTop + 120}V${winTop + winH}H${L / 2 - 250}Z`;
  const stripeY = winTop + winH + 52;
  const skirtY = y0 + 1060;
  const stepY = skirtY + 36;
  const lampX = L / 2 - 74;
  const lampY = stripeY + 172;
  const sx = dir === 'right' ? 1 : -1;
  // fix round 2 detail (the tram fills the frame for ~0.3 s): a roof rail on short posts + a folded pantograph (its
  // head stays under the caption floor), panel seams with overshoot on the lower body, a destination board in the caption
  // hand (a pauser joke for S10's Old Quarter), rivet ticks, and a one-sided peach rim along the roof from the dawn sun.
  // Polish A1: passengers + hand straps behind the glass, one glint per pane, 4.8 frames, a white rim on the leading
  // edge, the wheels hidden behind a bogie skirt (tram bogies, no loco coupling rods), the door's step, a peach lamp disc.
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
  // the bogies: two teal boxes on the skirt, a slot and two wheel arches each (the wheels only show as dark arcs under them)
  const bogies = [-L / 2 + 325, L / 2 - 325];
  const bogieY = skirtY + 92;
  const bogieD = bogies.map((bx) => roundRect(bx - 170, bogieY, 340, 120, 10)).join('');
  const archD = bogies.map((bx) => [-85, 85].map((o) => `M${bx + o - 58} ${bogieY + 122}a58 52 0 0 1 116 0Z`).join('')).join('');
  const bogieI = bogies.map((bx) => rect(bx - 170, bogieY, 340, 120, {seed: `s9tram/bg${bx}`, over: 6}) + line(bx - 130, bogieY + 40, bx + 130, bogieY + 40, {seed: `s9tram/bs${bx}`, over: [0, 0]})).join('');
  const board = {x: L / 2 - 372, y: y0 + 30, w: 300, h: 48};
  // passengers (clipped to the glass)
  let hair = '';
  const coats: Record<string, string> = {};
  let pInk = '';
  for (const ps of PASSENGERS) {
    const hy = winTop + ps.hy;
    const sh = `M${ps.x - ps.r * 1.75} ${winTop + winH + 4}V${hy + ps.r * 1.15}Q${ps.x - ps.r * 1.7} ${hy + ps.r * 0.7} ${ps.x - ps.r * 0.9} ${hy + ps.r * 0.72}H${ps.x + ps.r * 0.9}Q${ps.x + ps.r * 1.7} ${hy + ps.r * 0.7} ${ps.x + ps.r * 1.75} ${hy + ps.r * 1.15}V${winTop + winH + 4}Z`;
    coats[ps.coat] = (coats[ps.coat] ?? '') + sh;
    const head = `M${ps.x - ps.r} ${hy}a${ps.r} ${ps.r} 0 1 0 ${2 * ps.r} 0a${ps.r} ${ps.r} 0 1 0 ${-2 * ps.r} 0Z`;
    hair += head;
    pInk += sh + head + `M${ps.x + ps.r * ps.part} ${hy - ps.r * 0.96}q${ps.r * 0.12} ${ps.r * 0.45} ${ps.r * 0.04} ${ps.r * 0.8}` + `M${ps.x - ps.r * 0.35} ${hy + ps.r * 0.72}q${ps.r * 0.35} ${ps.r * 0.3} ${ps.r * 0.7} 0`;
  }
  let straps = '';
  let strapHand = '';
  for (const st of STRAPS) {
    const sw = st.held ? 0 : Math.sin(t * 9) * 5;
    straps += `M${st.x} ${winTop + 4}V${winTop + 70}M${st.x + sw - 13} ${winTop + 92}a13 15 0 1 0 26 0a13 15 0 1 0 -26 0`;
    if (st.held) strapHand += `M${st.x - 14} ${winTop + 104}C${st.x - 16} ${winTop + 80} ${st.x + 16} ${winTop + 80} ${st.x + 14} ${winTop + 104}L${st.x + 12} ${winTop + 150}L${st.x - 12} ${winTop + 150}Z`;
  }
  const hairOf = (ps: (typeof PASSENGERS)[number]) => ps.hair;
  return (
    <g transform={`translate(${x.toFixed(1)} 0) scale(${sx} 1)`}>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={wins.join('')} />
        </clipPath>
      </defs>
      <Fill d={body} color={palette.teal} offset={[5, 4]} mode="snap" seed="s9tram/body" />
      <Fill d={rectPath(-L / 2, y0, L - nose * 0.6, 34)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/roof" />
      <Fill d={rail} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/rail" />
      <Fill d={rectPath(-L / 2 + 20, y0 - 1, L - nose - 40, 6)} color={palette.peach} offset={false} mode="snap" seed="s9tram/rim" />
      <Fill d={door} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/door" />
      <Fill d={wins.join('') + ws + doorGlass} color={palette.mintPale} offset={[6, 4]} mode="snap" seed="s9tram/win" />
      <g clipPath={`url(#${clipId})`}>
        {Object.entries(coats).map(([c, d], i) => (
          <Fill key={i} d={d} color={c} offset={false} mode="snap" seed={`s9tram/coat${i}`} />
        ))}
        {PASSENGERS.map((ps, i) => (
          <Fill key={`h${i}`} d={`M${ps.x - ps.r} ${winTop + ps.hy}a${ps.r} ${ps.r} 0 1 0 ${2 * ps.r} 0a${ps.r} ${ps.r} 0 1 0 ${-2 * ps.r} 0Z`} color={hairOf(ps)} offset={false} mode="snap" seed={`s9tram/hair${i}`} />
        ))}
        {strapHand ? <Fill d={strapHand} color={palette.sand} offset={false} mode="snap" seed="s9tram/strapHand" /> : null}
        <Ink d={pInk + straps + strapHand} width={W * 0.7} taper={false} seed="s9tram/pax" />
      </g>
      <Fill d={rectPath(-L / 2, stripeY, L, 34)} color={palette.sand} offset={[4, 3]} mode="snap" seed="s9tram/stripe" />
      <Fill d={rectPath(-L / 2, skirtY, L, 600)} color={palette.tealDark} offset={false} mode="snap" seed="s9tram/skirt" />
      <Fill d={archD} color={palette.ink} offset={false} mode="snap" seed="s9tram/arches" />
      <Fill d={bogieD} color={palette.teal} offset={false} mode="snap" seed="s9tram/bogies" />
      <Fill d={rectPath(dx - 12, stepY, 160, 18)} color={palette.sand} offset={false} mode="snap" seed="s9tram/step" />
      {/* the headlamp: a 2-step flat disc (peach, cream core) */}
      <Fill d={`M${lampX - 32} ${lampY}a32 32 0 1 0 64 0a32 32 0 1 0 -64 0Z`} color={palette.peach} offset={false} mode="snap" seed="s9tram/lamp" />
      <Fill d={`M${lampX - 15} ${lampY - 3}a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z`} color={palette.cream} offset={false} mode="snap" seed="s9tram/lampC" />
      <Fill d={roundRect(board.x, board.y, board.w, board.h, 6)} color={palette.cream} offset={[3, 2]} mode="snap" seed="s9tram/sign" />
      <g transform={`translate(${board.x + board.w / 2} ${board.y + board.h * 0.74}) scale(${sx} 1)`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={captionFontStack} fontSize={34} fill={palette.ink}>
          Old Quarter · v5.6
        </text>
      </g>
      <Ink d={posts + panto} width={W * 0.62} taper={false} seed="s9tram/panto" />
      <Ink d={seams + rivets} width={W * 0.5} taper={false} seed="s9tram/seams" />
      <Ink d={bogieI} width={W * 0.62} taper={false} seed="s9tram/bogieI" />
      <Ink d={body} width={W} taper={false} seed="s9tram/bodyI" />
      <Ink d={mull + ws} width={W} taper={false} seed="s9tram/winI" />
      <Ink d={line(-L / 2, stripeY, L / 2, stripeY, {seed: 's9tram/s1', over: [0, 0]}) + line(-L / 2, stripeY + 34, L / 2, stripeY + 34, {seed: 's9tram/s2', over: [0, 0]}) + line(-L / 2, skirtY, L / 2, skirtY, {seed: 's9tram/s3', over: [0, 0]}) + rect(dx, winTop - 18, 136, 1100, {seed: 's9tram/d', over: 6, edges: 'tlr'}) + `M${dx + 68} ${winTop - 10}V${winTop + 1060}` + rect(dx - 12, stepY, 160, 18, {seed: 's9tram/stI', over: 5})} width={W * 0.72} taper={false} seed="s9tram/det" />
      <Ink d={`M${lampX - 32} ${lampY}a32 32 0 1 0 64 0a32 32 0 1 0 -64 0` + rect(board.x, board.y, board.w, board.h, {seed: 's9tram/sg', over: 4})} width={W * 0.6} taper={false} seed="s9tram/li" />
      {/* one diagonal glint per pane (cream on mintPale reads as glass), over the passengers */}
      <Ink d={winX.map((wx) => `M${wx + 26} ${winTop + 118}l44 -66M${wx + 48} ${winTop + 138}l24 -36`).join('')} width={5} color={palette.white} taper={false} seed="s9tram/gl" />
      {/* the white rim strip down the leading edge (the nose), 4.5 px inside the outline */}
      <Ink d={`M${L / 2 - nose} ${y0 + 6}Q${L / 2 - 6} ${y0 + 6} ${L / 2 - 6} ${y0 + nose}V${y0 + h}`} width={4.5} color={palette.white} taper={false} seed="s9tram/rimW" />
    </g>
  );
};

const TramWiperFC: React.FC<WiperProps> = ({x, p, dir}) => {
  const t = useTime();
  const sx = dir === 'right' ? 1 : -1;
  // A1 FR2: Pip from the take-off (the nose passes under him mid-flight, so he is drawn IN FRONT of the tram: the scene's
  // identical copy is under it), then on the roof from the landing to the S10 hand-over (his screen path is tramPipAt;
  // mirrored for 'left')
  const at = tramPipAt(fT(t));
  const pipX = dir === 'right' ? at.x : 1080 - at.x;
  const d = t - LAND;
  const land = d >= 0 && d < 0.3 ? 0.24 * Math.exp(-d * 11) * Math.cos(d * Math.PI * 2 * 3.2) : 0;
  const bob = Math.abs(Math.sin(t * 19)) * -4;
  const live = p > 0 && p < 1;
  const flying = live && t >= TAKEOFF && t < LAND;
  const on = live && t >= LAND && t < TRAM_PIP_UNTIL;
  return (
    <>
      <TramBody x={x} dir={dir} />
      {flying ? dir === 'right' ? <PipFlight t={t} /> : <g transform="translate(1080 0) scale(-1 1)"><PipFlight t={t} /></g> : null}
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

// S10 street pieces (fix round 1), each replacing or extending one OldQuarter layer through the set's `wrap`:
//  - FarStreet ('far'): the empty street has a horizon from the cut: the pavement runs on to the eye line (1150) and a
//    thin fill-only sage skyline sits on it (no ink: far), so the sites pop up IN FRONT of something;
//  - StreetGround ('ground'): the set's ground (same seeds / geometry) with the street-gap wedge popping up WITH siteR
//    instead of floating in the empty street from the cut;
//  - SandwichBoard: the A-frame under L13 drawn as a sandwich board (slight trapezoid, hinge cap, splayed legs, the back
//    board's edge seen 3/4 with the open triangle), the LabelTag paper (frame={false}) on it, popping with it;
//  - BottomCrowd ('foreground'): two back-view heads + shoulders cropped by the frame bottom right of the railing's end.

import React from 'react';
import {palette} from '../../lib/theme';
import {springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {line, polyPath, rectPath, roundRect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {EdgeOnlooker, groundMarks, GroundMarks, OLD_QUARTER, PopUp, SI} from './kit';

const OQ = OLD_QUARTER;

// ---------------------------------------------------------------- FarStreet

const FAR = (() => {
  // low distant blocks along the horizon (fill only), a water tower and two thin towers for silhouette variety
  let d = '';
  let x = -170;
  const hs = [34, 52, 26, 44, 60, 30, 48, 38, 24, 56, 40, 30, 46, 28, 54, 36, 42, 26, 50, 34, 44, 30];
  let i = 0;
  while (x < 1250) {
    const w = 46 + ((i * 37) % 5) * 9;
    const h = hs[i % hs.length];
    d += rectPath(x, OQ.eye - h, w + 1, h + 1);
    x += w;
    i++;
  }
  // a water tower on legs and a thin spire (the city beyond)
  d += rectPath(214, OQ.eye - 96, 30, 22) + polyPath([[210, OQ.eye - 96], [229, OQ.eye - 110], [248, OQ.eye - 96]]) + rectPath(218, OQ.eye - 74, 3, 30) + rectPath(237, OQ.eye - 74, 3, 30);
  d += rectPath(866, OQ.eye - 112, 10, 80) + polyPath([[864, OQ.eye - 112], [871, OQ.eye - 130], [878, OQ.eye - 112]]);
  return d;
})();

export const FarStreet: React.FC = () => (
  <>
    <Fill rect={[-160, OQ.eye, 1400, OQ.base - OQ.eye + 2]} color={palette.mintPale} offset={false} seed="s10/farground" />
    <Fill d={FAR} color={palette.sage} offset={false} mode="snap" seed="s10/skyline" />
  </>
);

// ---------------------------------------------------------------- StreetGround

const GND = (() => {
  const s = 'oq';
  const VP = OQ.vp;
  return {
    wedge: polyPath([[640, OQ.base], [740, OQ.base], [VP[0] + 3, VP[1]], [VP[0] - 3, VP[1]]]),
    kerb: line(-160, OQ.kerb, 1240, OQ.kerb + 2, {seed: `${s}/k`, over: 0}) + line(-160, OQ.kerb + 20, 1240, OQ.kerb + 23, {seed: `${s}/k2`, over: 0}),
    walk: groundMarks({vp: [690, 1150], top: OQ.base + 30, bottom: OQ.kerb - 6, x0: -700, x1: 2000, rays: 4, cross: 1, specks: 8, reach: 0.9, seed: `${s}/gw`}),
    street: groundMarks({vp: [690, 1150], top: OQ.kerb + 40, bottom: 1920, x0: -200, x1: 1300, rays: 0, cross: 1, specks: 14, seed: `${s}/gs`}),
    ...railsAndSetts(),
  };
})();

/** Fix round 2: the empty street after the tram is not a bare stage: a row of kerb setts along the kerb's street side and
 *  the tram's RAIL PAIR across the street (the tram just passed), a tan groove strip under an ink rail head each. */
function railsAndSetts() {
  const y0 = OQ.kerb + 26;
  let setts = '';
  let settInk = '';
  for (let i = 0, x = -150; x < 1240; i++) {
    const w = 40 + ((i * 7) % 3) * 6;
    setts += roundRect(x, y0, w - 6, 18, 4);
    settInk += line(x, y0 + 19, x + w - 6, y0 + 19, {seed: `s10/sb${i}`, over: 0, breaks: false}) + (i % 2 ? line(x + w - 6, y0 + 2, x + w - 6, y0 + 18, {seed: `s10/sv${i}`, over: 0, breaks: false}) : '');
    x += w;
  }
  const rails = [1590, 1640].map((ry) => ({groove: rectPath(-160, ry, 1400, 8), head: line(-160, ry, 1240, ry + 1, {seed: `s10/rail${ry}`, over: 0})}));
  return {setts, settInk, railGroove: rails.map((r) => r.groove).join(''), railHead: rails.map((r) => r.head).join('')};
}

/** The set's ground layer, the street-gap wedge popping up from the base line at `wedgeAt` (with siteR). */
export const StreetGround: React.FC<{wedgeAt: number}> = ({wedgeAt}) => (
  <>
    <Fill rect={[-160, OQ.base, 1400, 800]} color={palette.mintPale} offset={false} seed="oq/pave" />
    <PopUp at={wedgeAt} x={690} y={OQ.base}>
      <Fill d={GND.wedge} color={palette.cream} offset={false} seed="oq/gap" />
    </PopUp>
    <Fill rect={[-160, OQ.kerb, 1400, 22]} color={palette.sand} offset={false} seed="oq/kerbF" />
    <Ink d={GND.kerb} width={SI.front} seed="oq/kerb" />
    <GroundMarks marks={GND.walk} width={SI.far} seed="oq/gw" />
    <GroundMarks marks={GND.street} width={SI.far} seed="oq/gs" />
    <Fill d={GND.setts} color={palette.cream} offset={false} mode="snap" seed="s10/setts" />
    <Ink d={GND.settInk} width={SI.hair} taper={false} seed="s10/settI" />
    <Fill d={GND.railGroove} color={palette.tan} offset={false} mode="snap" seed="s10/railG" />
    <Ink d={GND.railHead} width={SI.mid} seed="s10/railH" />
  </>
);

// ---------------------------------------------------------------- SandwichBoard

/** A sandwich-board A-frame around a board face `box` ([x0, y0, x1, y1], the label paper), standing on `ground`:
 *  the front board a slight trapezoid (narrower at the hinge), its side rails running on as splayed legs, a hinge cap on
 *  top, and the back board's edge seen 3/4 on the right (open triangle between the two, a chain across). `children` =
 *  the paper (LabelTag frame={false}); everything pops about the ground point at `at` (the label's spring). */
export const SandwichBoard: React.FC<{box: [number, number, number, number]; ground: number; at?: number; children?: React.ReactNode}> = ({box, ground, at, children}) => {
  const t = useTime();
  const k = at === undefined ? 1 : t < at ? 0 : springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  const [x0, y0, x1, y1] = box;
  const fw = 13; // rail width
  const tp = 12; // taper: the top is this much narrower each side
  const top = y0 - fw;
  const bot = y1 + fw;
  const cx = (x0 + x1) / 2;
  const off: [number, number] = [2.6, 2];
  // front board: outer trapezoid (the face sits inside it)
  const outer: Pt[] = [[x0 - fw + tp, top], [x1 + fw - tp, top], [x1 + fw + 2, bot], [x0 - fw - 2, bot]];
  // splayed legs: the side rails carry on to the ground, flaring out
  const legL: Pt[] = [[x0 - fw - 2, bot - 2], [x0 - 1, bot - 2], [x0 - 6, ground], [x0 - fw - 9, ground]];
  const legR: Pt[] = [[x1 + 1, bot - 2], [x1 + fw + 2, bot - 2], [x1 + fw + 9, ground], [x1 + 6, ground]];
  // the back board's edge (3/4 view, right side): from the hinge down and out to its own foot; open triangle between
  const hinge: Pt = [x1 + fw - tp + 2, top + 4];
  const backFoot: Pt = [x1 + fw + 44, ground];
  const back: Pt[] = [[hinge[0] - 2, hinge[1]], [hinge[0] + 9, hinge[1] + 2], [backFoot[0] + 4, backFoot[1]], [backFoot[0] - 9, backFoot[1]]];
  const chainY = (y0 + y1) / 2 + 40;
  const fx = (yy: number) => x1 + fw + 2 * ((yy - top) / (bot - top)); // the front board's right edge at yy
  const bx = (yy: number) => hinge[0] + ((backFoot[0] - hinge[0]) * (yy - hinge[1])) / (backFoot[1] - hinge[1]);
  const cap = roundRect(cx - (x1 - x0) / 2 - fw + tp - 6, top - 12, x1 - x0 + 2 * fw - 2 * tp + 12, 14, 6);
  return (
    <XG m={mat.about(mat.scale(k), cx, ground)}>
      {/* the back board's edge first (behind the front board) */}
      <Fill d={polyPath(back)} color={palette.tealDark} offset={off} seed="s10/ab/back" />
      <Ink d={line(back[0][0], back[0][1], back[3][0], back[3][1], {over: [0, 1], seed: 's10/ab/b1'}) + line(back[1][0], back[1][1], back[2][0], back[2][1], {over: [0, 1], seed: 's10/ab/b2'})} width={SI.mid} taper={false} seed="s10/ab/bi" />
      <Ink d={`M${fx(chainY).toFixed(1)} ${chainY}Q${((fx(chainY) + bx(chainY + 6)) / 2).toFixed(1)} ${chainY + 9} ${bx(chainY + 6).toFixed(1)} ${chainY + 6}`} width={1.8} taper={false} seed="s10/ab/chain" />
      {/* legs + front frame */}
      <Fill d={polyPath(legL) + polyPath(legR)} color={palette.teal} offset={off} seed="s10/ab/legs" />
      <Fill d={polyPath(outer)} color={palette.teal} offset={off} seed="s10/ab/frame" />
      <Fill d={rectPath(x0 - 10, ground - 5, 14, 5) + rectPath(x1 - 4, ground - 5, 14, 5)} color={palette.tealDark} offset={false} mode="none" seed="s10/ab/feet" />
      <Ink
        d={
          line(outer[0][0], outer[0][1], outer[3][0], outer[3][1], {over: [2, 0], seed: 's10/ab/f1'}) +
          line(outer[1][0], outer[1][1], outer[2][0], outer[2][1], {over: [2, 0], seed: 's10/ab/f2'}) +
          line(outer[3][0] + 1, bot, outer[2][0] - 1, bot, {over: [0, 0], seed: 's10/ab/f3'}) +
          line(legL[3][0], legL[3][1], outer[3][0], bot, {over: [0, 0], seed: 's10/ab/l1'}) +
          line(legL[2][0], legL[2][1], legL[1][0], legL[1][1], {over: [0, 0], seed: 's10/ab/l2'}) +
          line(legR[2][0], legR[2][1], outer[2][0], bot, {over: [0, 0], seed: 's10/ab/l3'}) +
          line(legR[3][0], legR[3][1], legR[0][0], legR[0][1], {over: [0, 0], seed: 's10/ab/l4'})
        }
        width={SI.mid * 1.1}
        taper={false}
        seed="s10/ab/fi"
      />
      {/* the hinge cap across the top, two hinge knuckles */}
      <Fill d={cap} color={palette.tealDark} offset={off} seed="s10/ab/cap" />
      <Ink d={roundRect(cx - (x1 - x0) / 2 - fw + tp - 6, top - 12, x1 - x0 + 2 * fw - 2 * tp + 12, 14, 6, {seed: 's10/ab/capi', closed: false}) + `M${cx - 70} ${top - 5}h18M${cx + 52} ${top - 5}h18`} width={SI.mid} taper={false} seed="s10/ab/capi" />
      {children}
    </XG>
  );
};

// ---------------------------------------------------------------- BottomCrowd

/** Two back-view heads + shoulders cropped by the frame bottom, right of the railing's end (ref/f_9.0, ref2/f_12). */
export const BottomCrowd: React.FC = () => (
  <>
    <EdgeOnlooker x={1066} y={1792} head={104} hair="bun" body={palette.sand} acc={['scarf']} rim={false} arms="near" bob={1.2} seed="s10/onl2" />
    <EdgeOnlooker x={884} y={1772} head={118} hair="curly" body={palette.teal} acc={[]} rim="left" arms="both" bob={1.6} seed="s10/onl1" />
  </>
);

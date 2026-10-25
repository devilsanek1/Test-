// S10 street pieces (fix round 1), each replacing or extending one OldQuarter layer through the set's `wrap`:
//  - FarStreet ('far'): the empty street has a horizon from the cut: the pavement runs on to the eye line (1150) and a
//    thin fill-only sage skyline sits on it (no ink: far), so the sites pop up IN FRONT of something;
//  - StreetGround ('ground'): the set's ground (same seeds / geometry) with the side street in the gap (fix round 3: a
//    sand lane between converging kerbs, cut flat at the far cross street, was a cream wedge) popping up WITH siteR
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
  // fix round 2b: a VARIED roofline (was a strip of plain rectangles): flat blocks with a parapet notch, gables, stepped
  // gables, chimney pots, a dome, a clock tower, a water tower and a thin spire, fill-only (far: no ink), with a few
  // pale window ticks so it reads as a city beyond, not a placeholder band
  const E0 = OQ.eye;
  let d = '';
  let win = '';
  const kinds = ['gable', 'flat', 'chim', 'step', 'flat', 'gable', 'dome', 'chim', 'flat', 'step', 'gable', 'chim', 'flat', 'gable', 'step', 'flat', 'chim', 'gable', 'dome', 'flat', 'step', 'chim'];
  const hs = [34, 52, 26, 44, 60, 30, 48, 38, 24, 56, 40, 30, 46, 28, 54, 36, 42, 26, 50, 34, 44, 30];
  let x = -170;
  let i = 0;
  while (x < 1250) {
    const w = 42 + ((i * 37) % 5) * 9;
    const h = hs[i % hs.length];
    const top = E0 - h;
    const k = kinds[i % kinds.length];
    d += rectPath(x, top, w + 1, h + 1);
    if (k === 'gable') d += polyPath([[x, top + 1], [x + w / 2, top - 16], [x + w + 1, top + 1]]);
    else if (k === 'step') d += rectPath(x + w * 0.2, top - 8, w * 0.6, 9) + rectPath(x + w * 0.36, top - 15, w * 0.28, 8);
    else if (k === 'chim') d += rectPath(x + w * 0.66, top - 13, 7, 14) + rectPath(x + w * 0.2, top - 9, 6, 10);
    else if (k === 'dome') d += `M${x + w * 0.18} ${top + 1}a${w * 0.32} ${w * 0.3} 0 0 1 ${w * 0.64} 0Z` + rectPath(x + w / 2 - 1.5, top - w * 0.3 - 9, 3, 10);
    else d += rectPath(x - 2, top - 4, 9, 5) + rectPath(x + w - 7, top - 4, 9, 5);
    // window ticks: one or two short rows on the taller blocks
    if (h >= 34) {
      for (let r = 0; r < (h >= 48 ? 2 : 1); r++) {
        for (let c = 0; c < Math.floor((w - 10) / 13); c++) if ((c + r + i) % 3 !== 0) win += rectPath(x + 7 + c * 13, top + 9 + r * 14, 4, 6);
      }
    }
    x += w;
    i++;
  }
  // a water tower on legs, a clock tower and a thin spire (the city beyond)
  d += rectPath(214, E0 - 96, 30, 22) + polyPath([[210, E0 - 96], [229, E0 - 110], [248, E0 - 96]]) + rectPath(218, E0 - 74, 3, 30) + rectPath(237, E0 - 74, 3, 30);
  d += rectPath(866, E0 - 112, 10, 80) + polyPath([[864, E0 - 112], [871, E0 - 130], [878, E0 - 112]]);
  d += rectPath(560, E0 - 104, 22, 104) + polyPath([[557, E0 - 104], [571, E0 - 124], [585, E0 - 104]]);
  win += `M${571 + 6} ${E0 - 88}a6 6 0 1 0 0.01 0Z`;
  return {d, win};
})();

/** The far ground before the sites stand on it: a far kerb (sand band + hair ink) and a far tram rail pair, so the empty
 *  street under the wipe has depth; the sites cover it once they pop (it stays in the street gap). */
const FARGROUND = {
  kerb: rectPath(-160, 1196, 1400, 7),
  kerbInk: line(-160, 1196, 1240, 1197, {seed: 's10/fk', over: 0, breaks: false}),
  rails: line(-160, 1238, 1240, 1239, {seed: 's10/fr1', over: 0, breaks: false}) + line(-160, 1256, 1240, 1257, {seed: 's10/fr2', over: 0, breaks: false}),
};

/** `skylineAt` (fix round 3): the fill-only skyline pops up from the eye line WITH siteL (scaleY 0 -> 1.06 -> 1), so the
 *  frames after the tram show only the near row's ink construction lines over bare ground (reference 1's clean
 *  line-art-on-paper state), not line art over an already-filled skyline (a double exposure). */
export const FarStreet: React.FC<{skylineAt?: number}> = ({skylineAt}) => (
  <>
    <Fill rect={[-160, OQ.eye, 1400, OQ.base - OQ.eye + 2]} color={palette.mintPale} offset={false} seed="s10/farground" />
    <Fill d={FARGROUND.kerb} color={palette.sand} offset={false} mode="snap" seed="s10/farkerb" />
    <Ink d={FARGROUND.kerbInk + FARGROUND.rails} width={SI.hair} taper={false} seed="s10/farI" />
    <PopUp at={skylineAt} x={540} y={OQ.eye}>
      <Fill d={FAR.d} color={palette.sage} offset={false} mode="snap" seed="s10/skyline" />
      <Fill d={FAR.win} color={palette.mintPale} offset={false} mode="snap" seed="s10/skywin" />
    </PopUp>
  </>
);

// ---------------------------------------------------------------- StreetGround

const GND = (() => {
  const s = 'oq';
  const VP = OQ.vp;
  return {
    ...sideStreet(VP),
    kerb: line(-160, OQ.kerb, 1240, OQ.kerb + 2, {seed: `${s}/k`, over: 0}) + line(-160, OQ.kerb + 20, 1240, OQ.kerb + 23, {seed: `${s}/k2`, over: 0}),
    walk: groundMarks({vp: [690, 1150], top: OQ.base + 30, bottom: OQ.kerb - 6, x0: -700, x1: 2000, rays: 4, cross: 1, specks: 8, reach: 0.9, seed: `${s}/gw`}),
    // fix round 2b: paving joints (two broken cross joints + three extra rays to the VP) and the building line's shadow
    // band, so the open pavement is a surface, not blank paper
    // (kept left of x 900: the right rail, x >= 950 on screen, already holds the tree, the bike and siteR's door)
    joints: line(-160, 1352, 380, 1352, {seed: 's10/j1', over: 0}) + line(520, 1353, 890, 1352, {seed: 's10/j2', over: 0}) + line(-160, 1428, 240, 1429, {seed: 's10/j3', over: 0}) + line(330, 1428, 780, 1428, {seed: 's10/j4', over: 0}) + [-260, 260, 860].map((xb, i2) => {
      const rx = (y: number) => 690 + ((xb - 690) * (y - 1150)) / (OQ.kerb - 1150);
      return line(rx(1342), 1342, rx(1488), 1488, {seed: `s10/jr${i2}`, over: 0, breaks: false});
    }).join(''),
    // (it ends under siteR's door, before the right rail: x >= 950 on screen holds the tree and the bike)
    shade: polyPath([[-160, OQ.base], [930, OQ.base], [900, OQ.base + 29], [-160, OQ.base + 26]]),
    street: groundMarks({vp: [690, 1150], top: OQ.kerb + 40, bottom: 1920, x0: -200, x1: 1300, rays: 0, cross: 1, specks: 14, seed: `${s}/gs`}),
    ...railsAndSetts(),
  };
})();

/** Fix round 3: the street gap as a SIDE STREET in the reference's language (it was a cream ink-less wedge tapering to a
 *  point at the VP, which read as a spotlight cone / a cream tent). A sand roadway between two inkThin kerb lines that
 *  converge on the VP (open ends, 6-8 px overshoot), two short sett ticks across it, cut FLAT where it meets the far
 *  cross street's near rail (y 1256: 54 px wide there, no point, the far kerb dash overshooting both kerbs); both near
 *  sites show their RETURN faces down the gap (siteM's right jamb tan, siteR's left jamb sage, ~14 px, receding to the
 *  VP), so the gap is a lane between two walls. Kerb lines that ran on to the eye line read as a ladder / an easel with
 *  the far rails crossing them, so the lane stops at the cross street. The return faces are drawn with the near row
 *  (Scene10 'sites'). */
function sideStreet(VP: Pt) {
  const B = OQ.base;
  const tipY = 1256;
  const xAt = (x0: number, y: number) => x0 + ((VP[0] - x0) * (B - y)) / (B - VP[1]);
  const L0 = 652;
  const R0 = 728;
  const road = polyPath([[L0, B + 1], [R0, B + 1], [xAt(R0, tipY), tipY], [xAt(L0, tipY), tipY]]);
  // kerbs: from 8 px below the base line (open, over the near pavement) to 6 px past the far end
  const kerbs = line(xAt(L0, B + 8), B + 8, xAt(L0, tipY - 6), tipY - 6, {seed: 's10/gk1', over: 0, breaks: false}) + line(xAt(R0, B + 8), B + 8, xAt(R0, tipY - 6), tipY - 6, {seed: 's10/gk2', over: 0, breaks: false});
  // the far kerb: one flat dash across the cut-off end, overshooting both kerbs
  const far = line(xAt(L0, tipY) - 6, tipY + 0.5, xAt(R0, tipY) + 7, tipY - 0.5, {seed: 's10/gk3', over: 0, breaks: false});
  // sett ticks: short, staggered, across the roadway
  let setts = '';
  [[1286, -0.5, -0.05], [1270, 0.1, 0.55]].forEach(([y, a, b], i) => {
    const hw = ((R0 - L0) / 2) * ((y - VP[1]) / (B - VP[1]));
    setts += line(VP[0] + a * hw, y, VP[0] + b * hw, y + 0.6, {seed: `s10/gs${i}`, over: 0, breaks: false});
  });
  // the two return faces down the jambs (x 640 / 740), receding to the VP: the lane's walls
  const w = 14;
  const face = (xj: number, top: number, dir: number) => {
    const k = w / Math.abs(VP[0] - xj);
    const xi = xj + dir * w;
    return {
      d: polyPath([[xj, top], [xi, top + (VP[1] - top) * k], [xi, B - (B - VP[1]) * k], [xj, B]]),
      ink: line(xi, top + (VP[1] - top) * k - 4, xi, B - (B - VP[1]) * k + 3, {seed: `s10/ret${xj}`, over: 0, breaks: false}),
    };
  };
  const retM = face(640, 832, 1);
  const retR = face(740, 712, -1);
  return {road, kerbs, farKerb: far, gapSetts: setts, retM, retR};
}

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

/** The set's ground layer, the side street in the gap popping up from the base line at `wedgeAt` (with siteR). */
export const StreetGround: React.FC<{wedgeAt: number}> = ({wedgeAt}) => (
  <>
    <Fill rect={[-160, OQ.base, 1400, 800]} color={palette.mintPale} offset={false} seed="oq/pave" />
    <Fill d={GND.shade} color={palette.sky} offset={false} mode="snap" seed="s10/shade" />
    <PopUp at={wedgeAt} x={690} y={OQ.base}>
      <Fill d={GND.road} color={palette.sand} offset={false} seed="oq/gap" />
      <Ink d={GND.kerbs + GND.farKerb} width={SI.far} taper={false} seed="s10/gapk" />
      <Ink d={GND.gapSetts} width={SI.hair} taper={false} seed="s10/gaps" />
    </PopUp>
    <Fill rect={[-160, OQ.kerb, 1400, 22]} color={palette.sand} offset={false} seed="oq/kerbF" />
    <Ink d={GND.kerb} width={SI.front} seed="oq/kerb" />
    <GroundMarks marks={GND.walk} width={SI.far} seed="oq/gw" />
    <Ink d={GND.joints} width={SI.hair} taper={false} seed="s10/joints" />
    <GroundMarks marks={GND.street} width={SI.far} seed="oq/gs" />
    {/* A1 FR1: sand setts (were cream, ~invisible on the pale street): a mid value along the kerb from the cut */}
    <Fill d={GND.setts} color={palette.sand} offset={false} mode="snap" seed="s10/setts" />
    <Ink d={GND.settInk} width={SI.hair} taper={false} seed="s10/settI" />
    <Fill d={GND.railGroove} color={palette.tan} offset={false} mode="snap" seed="s10/railG" />
    <Ink d={GND.railHead} width={SI.mid} seed="s10/railH" />
  </>
);

/** The near sites' return faces down the street gap (the lane's walls), popping with their sites (siteM, siteR): drawn
 *  after the near row's facades. */
export const GapReturns: React.FC<{atM: number; atR: number}> = ({atM, atR}) => (
  <>
    <PopUp at={atM} x={647} y={OQ.base}>
      <Fill d={GND.retM.d} color={palette.tan} offset={false} mode="none" seed="s10/retM" />
      <Ink d={GND.retM.ink} width={SI.far} taper={false} seed="s10/retMI" />
    </PopUp>
    <PopUp at={atR} x={733} y={OQ.base}>
      <Fill d={GND.retR.d} color={palette.sage} offset={false} mode="none" seed="s10/retR" />
      <Ink d={GND.retR.ink} width={SI.far} taper={false} seed="s10/retRI" />
    </PopUp>
  </>
);

// ---------------------------------------------------------------- SandwichBoard

/** The A-frame's face box from the set's noticeSign slot: 6 px lower (a >= 20 px band of wall under siteL's raised
 *  plaque) and, fix round 2b, 12 px further left and 24 px narrower (L13 still at full size), so its back leg clears the
 *  maker parked on the open pavement. */
/** A1 FR1: L13 drops to 28 px on screen (was 30) and the board shrinks around it (22 px lower top, 24 px narrower on the
 *  right): it was the brightest, biggest rectangle in the frame, above the plaques it annotates. */
export const signBox = (box: [number, number, number, number]): [number, number, number, number] => [box[0] - 12, box[1] + 28, box[2] - 60, box[3] + 6];
const AF = {fw: 13, tp: 12};
/** The A-frame's hinge cap: its right end x and its top y (world), for the slot box `box` (signBox applied). */
export const aFrameCap = (box: [number, number, number, number]) => ({right: box[2] + AF.fw - AF.tp + 6, top: box[1] - AF.fw - 12});

/** A sandwich-board A-frame around a board face `box` ([x0, y0, x1, y1], the label paper), standing on `ground`:
 *  the front board a slight trapezoid (narrower at the hinge), its side rails running on as splayed legs, a hinge cap on
 *  top, and the back board's edge seen 3/4 on the right (open triangle between the two, a chain across). `children` =
 *  the paper (LabelTag frame={false}); everything pops about the ground point at `at` (the label's spring). */
export const SandwichBoard: React.FC<{box: [number, number, number, number]; ground: number; at?: number; children?: React.ReactNode}> = ({box, ground, at, children}) => {
  const t = useTime();
  const k = at === undefined ? 1 : t < at ? 0 : springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  const [x0, y0, x1, y1] = box;
  const fw = AF.fw; // rail width
  const tp = AF.tp; // taper: the top is this much narrower each side
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
  // fix round 3: the back board splays less (+26, was +44): its edge stays left of the parked maker's body
  // A1 FR1: +18 (was +26): the board's back edge stays clear of the parked maker's left rim
  const backFoot: Pt = [x1 + fw + 18, ground];
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
      {/* fix round 3: the frame outline at ink (3.4), the legs keep the front weight (4.8): the board sits back */}
      <Ink
        d={
          line(outer[0][0], outer[0][1], outer[3][0], outer[3][1], {over: [2, 0], seed: 's10/ab/f1'}) +
          line(outer[1][0], outer[1][1], outer[2][0], outer[2][1], {over: [2, 0], seed: 's10/ab/f2'}) +
          line(outer[3][0] + 1, bot, outer[2][0] - 1, bot, {over: [0, 0], seed: 's10/ab/f3'})
        }
        width={SI.mid}
        taper={false}
        seed="s10/ab/fi"
      />
      <Ink
        d={
          line(legL[3][0], legL[3][1], outer[3][0], bot, {over: [0, 0], seed: 's10/ab/l1'}) +
          line(legL[2][0], legL[2][1], legL[1][0], legL[1][1], {over: [0, 0], seed: 's10/ab/l2'}) +
          line(legR[2][0], legR[2][1], outer[2][0], bot, {over: [0, 0], seed: 's10/ab/l3'}) +
          line(legR[3][0], legR[3][1], legR[0][0], legR[0][1], {over: [0, 0], seed: 's10/ab/l4'})
        }
        width={SI.front}
        taper={false}
        seed="s10/ab/li"
      />
      {/* the hinge cap across the top, two hinge knuckles */}
      <Fill d={cap} color={palette.tealDark} offset={off} seed="s10/ab/cap" />
      <Ink d={roundRect(cx - (x1 - x0) / 2 - fw + tp - 6, top - 12, x1 - x0 + 2 * fw - 2 * tp + 12, 14, 6, {seed: 's10/ab/capi', closed: false}) + `M${cx - 70} ${top - 5}h18M${cx + 52} ${top - 5}h18`} width={SI.mid} taper={false} seed="s10/ab/capi" />
      {/* the paper, hand-inked (fix round 3): the cream fill (the LabelTag, outline-less) misregistered 3 px right and
          2 px down from its own ink outline, the outline left OPEN at the top-right corner, two short edge overshoots */}
      <XG m={mat.translate(PAPER_MIS[0], PAPER_MIS[1])}>{children}</XG>
      <Ink d={paperInk(box)} width={SI.far} taper={false} seed="s10/ab/paper" />
    </XG>
  );
};

/** The paper fill's misregistration from its ink outline (world px). */
const PAPER_MIS: [number, number] = [3, 2];

/** The A-frame paper's hand-inked outline for the box [x0, y0, x1, y1]: the top edge stops ~26 px short of the right
 *  corner and the right edge starts ~22 px below it (the corner left open), the top edge overshoots the left corner by
 *  7 px and the bottom edge the right corner by 8 px. */
function paperInk([x0, y0, x1, y1]: [number, number, number, number]): string {
  return (
    line(x1 - 26, y0 + 0.5, x0 - 7, y0 - 0.5, {seed: 's10/ab/pt', over: 0, breaks: false}) +
    line(x0, y0 - 2, x0 + 0.8, y1 + 1, {seed: 's10/ab/pl', over: 0, breaks: false}) +
    line(x0 - 1, y1, x1 + 8, y1 - 0.8, {seed: 's10/ab/pb', over: 0, breaks: false}) +
    line(x1, y1 + 1, x1 - 0.6, y0 + 22, {seed: 's10/ab/pr', over: 0, breaks: false})
  );
}

// ---------------------------------------------------------------- BottomCrowd

/** Two back-view heads + shoulders cropped by the frame bottom, right of the railing's end (ref/f_9.0, ref2/f_12).
 *  A1 FR1: the nearer one (x 884, left of the rail zone) WATCHES the hand-out: on 'not' he turns toward the maker
 *  (the figure leans 4.5 deg left about a point 300 px under his head and narrows 4 %: the shoulders turning, S11's
 *  onlooker-turn language, local copy), follows the high lob to the right (+3 deg) and settles back on 'anymore'. Each
 *  turn is sprung (snappy): small, isolated onsets inside the hand-out chain. */
export const BottomCrowd: React.FC<{turns?: [number, number][]}> = ({turns = []}) => {
  const t = useTime();
  let ang = 0;
  let prev = 0;
  for (const [at, target] of turns) {
    ang += (target - prev) * springAt(t, at, springs.snappy);
    prev = target;
  }
  const hx = 884;
  const py = 1772 + 300;
  const nar = 1 - 0.04 * Math.min(1, Math.abs(ang) / 4.5);
  const m = Math.abs(ang) < 1e-3 ? mat.I : mat.compose(mat.about(mat.rotate(ang), hx, py), mat.about(mat.scale(nar, 1), hx, py));
  return (
    <>
      <EdgeOnlooker x={1066} y={1792} head={104} hair="bun" body={palette.sand} acc={['scarf']} rim={false} arms="near" bob={1.2} seed="s10/onl2" />
      <XG m={m}>
        <EdgeOnlooker x={hx} y={1772} head={118} hair="curly" body={palette.teal} acc={[]} rim="left" arms="both" bob={1.6} seed="s10/onl1" />
      </XG>
    </>
  );
};

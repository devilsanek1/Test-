// kit/Desk.tsx: HER DESK, the O1 / P12 / LOOP insert (HOME BASE desk, COZY, INSERT high 3/4), ported 1:1 from the
// approved style frame src/v2/StyleDesk.tsx (palette A = CC) so O1, P12 (O1's end frame, matched) and the loop land on
// the same drawing. Canvas px at camera rest (the style frame's numbers):
//   <DeskBack>   the wall, the bookcase cut by the top on the left, the short wall shelf + trailing plant (the top-edge
//                object), the dusk window cut by the right edge (only its gutter rises through the caption band), the
//                floor past the desk's right end, the wastebasket in the knee space, the desk with its golden lamp
//                pool, the books lying flat at the back-left.
//   <DeskFront>  the pen, the steaming mug, the lamp head cut by the right edge (draw after the box and the contract).
// The lane composes: <DeskBack/> <Box/> <ContractPage {...O1_PAGE} .../> <DeskFront/> <HerArm .../>.
// `at` builds a piece by the approved opening wave (O1_WAVE, from the contract outward; colour from the lamp pool)
// unless an enclosing <BuildWave> already drives it. The window and the moon follow the wave too.

import React, {useContext, useId} from 'react';
import {blob, crown, ellipse, glint, hline, line, poly, polyPath, rect, smooth, vline} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {CC} from '../palette';
import {add, BuildWave, BuildWaveCtx, BuildWaveV, dirDeg, Fill, Ink, Pt, radialWave, useWaveColour, W} from './util';
import {DustMotes, Live, Steam, Sway} from './Ambient';
import {DuskTown} from './Town';

// ---------------------------------------------------------------- layout (the style frame's canvas px)

export const DESK = {
  back: 668, // the desk's back edge (the wall line)
  front: 1384, // the desk's front edge
  apron: 76, // front face height
  right: [996, 1044] as [number, number], // the desk's right end, back -> front (it widens toward us)
  leg: {x: 1006, w: 30, foot: 1768},
  floorY: 1080, // the wall-floor line past the desk's right end
  pool: {cx: 575, cy: 965, rx: 380, ry: 255},
  window: {revealX: 932, frameX: 950, glassX: 964, sillY: 636, transomY: 262},
};

/** The approved opening build (StyleDeskOpen): ink from the contract at -0.26 s (3000 px/s), colour from the lamp pool
 *  at 0.16 s (2200 px/s). `o1Wave(cam)` gives the BuildWave value for a camera matrix (pass mat.inv(cam) as uncam). */
export const O1_WAVE = {inkO: [544, 954] as Pt, inkT0: -0.26, inkSpeed: 3000, colO: [575, 965] as Pt, colT0: 0.16, colSpeed: 2200};
export const o1Wave = (uncam = mat.I, dt = 0): BuildWaveV => ({
  inkAt: radialWave(O1_WAVE.inkO, O1_WAVE.inkT0 + dt, O1_WAVE.inkSpeed),
  colourAt: radialWave(O1_WAVE.colO, O1_WAVE.colT0 + dt, O1_WAVE.colSpeed),
  paper: CC.wall,
  uncam,
});

/** O1's one move: PULL OUT 1.05 -> 1.00, ease-in over the shot (6.12 s), about the frame centre. */
export const o1Cam = (t: number, shot = 6.12) => {
  const p = Math.max(0, Math.min(1, t / shot));
  return mat.about(mat.scale(1.05 - 0.05 * p * p), 540, 960);
};

/** Wraps children in the O1 wave starting `at - O1_WAVE.inkT0` later, unless a BuildWave already exists. */
const AtWave: React.FC<{at?: number; children?: React.ReactNode}> = ({at, children}) => {
  const w = useContext(BuildWaveCtx);
  if (at === undefined || w) return <>{children}</>;
  return <BuildWave value={o1Wave(mat.I, at - O1_WAVE.inkT0)}>{children}</BuildWave>;
};

// ---------------------------------------------------------------- the bookcase (left, cut by the top)

type Book = {x: number; w: number; h: number; c: string; band: number; band2: boolean};

function bookRow(x0: number, x1: number, hMin: number, hMax: number, seed: string): Book[] {
  const r = rng(`v2books/${seed}`);
  const out: Book[] = [];
  let x = x0;
  while (x < x1 - 14) {
    const w = Math.min(r.range(19, 32), x1 - x);
    out.push({x, w, h: r.range(hMin, hMax), c: r.chance(0.14) ? CC.anchor : r.pick(CC.books), band: r.range(0.12, 0.26), band2: r.chance(0.45)});
    x += w + (r.chance(0.18) ? r.range(2, 5) : 0);
  }
  return out;
}

/** A navy spine kept navy with probability `dark`, else a home mid-tone (seeded per book: the row's layout never moves). */
export const spineColour = (c: string, dark: number, seed: string): string =>
  c !== CC.anchor || dark >= 1 || rand(seed, 'dark') < dark ? c : CC.homeSpines[Math.floor(rand(seed, 'mid') * CC.homeSpines.length) % CC.homeSpines.length];

/** A row of books standing on a board (base y), x0..x1; ink thin (style frame). Shared with the nook's bookcase.
 *  `dark` = the share of navy spines that stay navy (default 1: the style frame's desk; the nook passes NOOK_DARK, so
 *  the dark anchor sits on her hair, the mic and the lamp shade instead of being scattered over the shelves). */
export const Books: React.FC<{x0: number; x1: number; base: number; hMin: number; hMax: number; seed: string; ink?: number; dark?: number; at?: number}> = ({x0, x1, base, hMin, hMax, seed, ink = W.far, dark = 1, at}) => {
  const row = bookRow(x0, x1, hMin, hMax, seed);
  let d = '';
  const fills = row.map((bk, i) => {
    const y = base - bk.h;
    d += rect(bk.x, y, bk.w, bk.h, {seed: `${seed}/r${i}`, over: 'small', edges: 'tlr'});
    d += hline(bk.x + 2, bk.x + bk.w - 2, y + bk.h * bk.band, {seed: `${seed}/b${i}`, over: [1, 1]});
    if (bk.band2) d += hline(bk.x + 2, bk.x + bk.w - 2, y + bk.h * (1 - bk.band * 0.7), {seed: `${seed}/c${i}`, over: [1, 1]});
    return <Fill key={i} rect={[bk.x, y, bk.w, bk.h]} color={spineColour(bk.c, dark, `${seed}/${i}`)} seed={`${seed}/${i}`} at={at === undefined ? undefined : at + 0.18} />;
  });
  return (
    <>
      {fills}
      <Ink d={d} width={ink} at={at} />
    </>
  );
};

const BC = {x0: -40, up: 76, upW: 20, boards: [-10, 226, 588]};

export const Bookcase: React.FC = () => {
  const ux = BC.up;
  let boards = '';
  BC.boards.forEach((y, i) => {
    boards += hline(BC.x0, ux, y, {seed: `bct${i}`, over: [0, 2]}) + hline(BC.x0, ux, y + 16, {seed: `bcb${i}`, over: [0, 2]});
  });
  return (
    <>
      <Fill rect={[BC.x0, -40, ux - BC.x0, DESK.back + 40]} color={CC.wallShade} offset={false} />
      <Books x0={-34} x1={ux - 4} base={BC.boards[1]} hMin={150} hMax={206} seed="top" />
      <Books x0={-34} x1={ux - 12} base={BC.boards[2]} hMin={118} hMax={164} seed="mid" />
      {BC.boards.map((y, i) => (
        <Fill key={i} rect={[BC.x0, y, ux - BC.x0, 16]} color={CC.shelf} seed={`bcboard${i}`} />
      ))}
      <Fill rect={[ux, -40, BC.upW, DESK.back + 40]} color={CC.shelf} offset={false} />
      <Ink d={boards} width={W.mid} />
      <Ink d={vline(ux, -40, DESK.back, {over: [0, 0], seed: 'bcu1'}) + vline(ux + BC.upW, -40, DESK.back, {over: [0, 0], seed: 'bcu2'})} width={W.mid} />
    </>
  );
};

/** Three books lying flat at the desk's back-left (abundance at the edges). */
export const BookStack: React.FC = () => {
  const bk: [number, number, number, string][] = [
    [-40, 684, 150, CC.books[1]],
    [-40, 660, 128, CC.books[4]],
    [-40, 640, 140, CC.anchor],
  ];
  return (
    <>
      {bk.map(([x, y, w, c], i) => {
        const h = i === 0 ? 28 : i === 1 ? 24 : 20;
        return (
          <React.Fragment key={i}>
            <Fill rect={[x, y, w, h]} color={c} seed={`stk${i}`} />
            <Ink d={rect(x, y, w, h, {seed: `stkI${i}`, over: 'small', edges: 'tbr'}) + vline(x + w - 14, y + 3, y + h - 3, {over: [0, 0], seed: `stkS${i}`})} width={W.far} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** A pointed leaf: from its stem (x, y) toward `deg`, length `len`. */
export const leafPath = (x: number, y: number, len: number, deg: number): string => {
  const u = dirDeg(deg);
  const n: Pt = [-u[1], u[0]];
  const w = len * 0.42;
  const tip = add([x, y], u, len);
  const c1 = add(add([x, y], u, len * 0.5), n, w);
  const c2 = add(add([x, y], u, len * 0.5), n, -w);
  return `M${x} ${y}Q${c1[0]} ${c1[1]} ${tip[0]} ${tip[1]}Q${c2[0]} ${c2[1]} ${x} ${y}Z`;
};

/** The top-edge object (COZY 2): a short wall shelf off the bookcase, a pot with a trailing plant. Above y 250. */
export const TopShelf: React.FC = () => {
  const x0 = BC.up + BC.upW;
  const x1 = 404;
  const y = 176;
  const pot: Pt[] = [[292, 132], [340, 132], [334, y], [298, y]];
  const vines: Pt[][] = [
    [[304, 170], [294, 196], [298, 222], [288, 246]],
    [[326, 172], [340, 198], [336, 220], [352, 238]],
  ];
  const leaves: [number, number, number][] = [[296, 190, 160], [298, 212, 20], [292, 236, 165], [292, 248, 70], [338, 192, 15], [337, 214, 165], [346, 232, 25], [352, 240, 95]];
  const brackets = [x0 + 34, x1 - 46].map((bx) => [[bx, y + 16], [bx + 30, y + 16], [bx, y + 50]] as Pt[]);
  return (
    <>
      <Books x0={x0 + 8} x1={252} base={y} hMin={162} hMax={198} seed="top2" />
      {brackets.map((br, i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(br)} color={CC.shelf} seed={`brk${i}`} />
          <Ink d={poly(br, {closed: true, seed: `brkI${i}`, over: [0, 0]})} width={W.far} />
        </React.Fragment>
      ))}
      <Fill d={polyPath(pot)} color={CC.pot} seed="tpot" />
      <Ink d={poly(pot, {closed: true, seed: 'tpotI', over: 'small'})} width={W.far} />
      <Fill d={crown(316, 118, 34, 30, {seed: 'tleaf', bumps: 7, round: 0.7})} color={CC.leaf} seed="tleafF" />
      <Ink d={crown(316, 118, 34, 30, {seed: 'tleaf', bumps: 7, round: 0.7})} width={W.far} open={0.3} />
      <Fill rect={[x0, y, x1 - x0, 16]} color={CC.shelf} seed="tboard" />
      <Ink d={rect(x0, y, x1 - x0, 16, {seed: 'tboardI', over: [0, 2], edges: 'tbr'})} width={W.mid} />
      <Sway x={316} y={172} amp={2.2} hz={0.2} seed="topvines">
        <Ink d={vines.map((v) => smooth(v)).join('')} width={W.far} />
        {leaves.map(([lx, ly, deg], i) => (
          <Fill key={i} d={leafPath(lx, ly, 24, deg)} color={CC.leaf} offset={false} />
        ))}
        <Ink d={leaves.map(([lx, ly, deg]) => leafPath(lx, ly, 24, deg)).join('')} width={W.hair} open={0.35} />
      </Sway>
    </>
  );
};

// ---------------------------------------------------------------- the window strip (right, cut by the top and right)

/** The living town in the window strip (kit/Town: the same evening as the nook's window), cut by the right edge. */
const DeskOutside: React.FC = () => {
  const {glassX, sillY} = DESK.window;
  return <DuskTown x={glassX} y={-60} w={240} h={sillY + 60} horizon={520} k={0.9} moon={[1034, 146]} stars={6} clouds={2} cloudSpeed={9} seed="desktown" />;
};

export const DeskWindow: React.FC = () => {
  const t = useTime();
  const id = 'v2kglass' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const {revealX, frameX, glassX, sillY, transomY} = DESK.window;
  const lit = useWaveColour([glassX + 100, 330], CC.sky);
  return (
    <>
      <Fill rect={[revealX, -40, frameX - revealX, sillY + 40]} color={CC.wallShade} offset={false} />
      <Fill rect={[frameX, -40, glassX - frameX, sillY + 40]} color={CC.trim} offset={false} />
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={glassX} y={-60} width={240} height={sillY + 60} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{lit === CC.sky ? <DeskOutside /> : lit ? <rect x={glassX - 10} y={-60} width={240} height={sillY + 80} fill={lit} /> : null}</g>
      <Fill rect={[glassX, transomY, 200, 14]} color={CC.trim} offset={false} />
      <Ink d={vline(revealX, -40, sillY, {over: [0, 0], seed: 'rv'}) + vline(glassX, -40, sillY, {over: [0, 0], seed: 'gl'}) + rect(glassX, transomY, 200, 14, {seed: 'tr', over: [0, 0], edges: 'tb'})} width={W.mid} />
      <Ink d={glint(1000, 410, 40, {seed: 'wglint'})} width={W.far} color={CC.star} />
      <Fill rect={[revealX - 14, sillY, 220, 16]} color={CC.sill} seed="sill" />
      <Ink d={hline(revealX - 14, 1140, sillY, {seed: 'sl1', over: [6, 0]}) + hline(revealX - 14, 1140, sillY + 16, {seed: 'sl2', over: [4, 0]}) + vline(revealX - 14, sillY, sillY + 16, {over: [0, 0], seed: 'sl3'})} width={W.mid} />
    </>
  );
};

// ---------------------------------------------------------------- floor, desk, basket

export const DeskFloor: React.FC = () => {
  const {right, floorY, leg, front, apron} = DESK;
  return (
    <>
      <Fill rect={[right[0] - 20, floorY - 18, 200, 18]} color={CC.wallShade} offset={false} />
      <Fill rect={[right[0] - 20, floorY, 200, 1000]} color={CC.floor} offset={false} />
      <Ink d={hline(right[0], 1140, floorY - 18, {seed: 'bb1', over: [0, 0]}) + hline(right[0], 1140, floorY, {seed: 'bb2', over: [0, 0]})} width={W.far} />
      <Fill rect={[-60, front + apron, leg.x + 60, leg.foot - front - apron]} color={CC.under} offset={false} />
      <Fill d={polyPath([[-60, leg.foot - 4], [1140, leg.foot + 14], [1140, 2000], [-60, 2000]])} color={CC.floor} offset={false} />
      <Ink d={line(-60, leg.foot - 4, leg.x, leg.foot + 11, {seed: 'fl0', over: [0, 0]})} width={W.far} />
      <Ink d={line(120, 1838, 1140, 1856, {seed: 'fl1', over: [0, 0]}) + line(-60, 1912, 1140, 1934, {seed: 'fl2', over: [0, 0]})} width={W.hair} />
    </>
  );
};

export const DeskTop: React.FC<{lampOn?: boolean}> = ({lampOn = true}) => {
  const {back, front, apron, right, leg, pool} = DESK;
  const top: Pt[] = [[-60, back], [right[0], back], [right[1], front], [-60, front]];
  return (
    <>
      <Fill d={polyPath(top)} color={CC.desk} offset={false} />
      <Fill rect={[-60, front, right[1] + 60, apron]} color={CC.deskFront} offset={false} />
      <Fill rect={[leg.x, front + apron, leg.w, leg.foot - front - apron]} color={CC.deskFront} seed="leg" />
      <Ink d={hline(-60, right[0], back, {seed: 'dkB', over: 'structural'})} width={W.mid} />
      <Ink d={line(right[0], back, right[1], front, {seed: 'dkR', over: [4, 0]}) + hline(-60, right[1], front, {seed: 'dkF', over: [0, 6]}) + hline(-60, right[1], front + apron, {seed: 'dkA', over: [0, 4]}) + vline(right[1], front, front + apron, {seed: 'dkE', over: [0, 0]})} width={W.mid} />
      <Ink d={vline(leg.x, front + apron, leg.foot, {seed: 'lg1', over: [0, 3]}) + vline(leg.x + leg.w, front + apron, leg.foot + 2, {seed: 'lg2', over: [0, 3]})} width={W.mid} />
      <Ink d={rect(600, front + 13, 300, apron - 26, {seed: 'drw', over: 'small'})} width={W.far} />
      <Fill d={blob(750, front + apron / 2, 13, 7, {seed: 'knob'})} color={CC.anchor} offset={false} />
      {lampOn ? (
        <>
          <Fill d={blob(pool.cx, pool.cy, pool.rx, pool.ry, {seed: 'pool1', wobble: 0.02})} color={CC.ring} offset={false} />
          <Fill d={blob(pool.cx - 8, pool.cy - 4, pool.rx * 0.64, pool.ry * 0.64, {seed: 'pool2', wobble: 0.025})} color={CC.core} offset={false} />
        </>
      ) : null}
      <Ink d={line(40, 1236, 236, 1240, {seed: 'gr1', over: [0, 0]}) + line(760, 712, 960, 716, {seed: 'gr2', over: [0, 0]}) + line(860, 1300, 1020, 1303, {seed: 'gr3', over: [0, 0]}) + line(600, 1346, 780, 1349, {seed: 'gr4', over: [0, 0]})} width={W.hair} />
    </>
  );
};

export const Basket: React.FC = () => {
  const top = 1590;
  const bot = 1738;
  const body: Pt[] = [[758, top], [882, top], [868, bot], [772, bot]];
  return (
    <>
      <Fill d={polyPath(body)} color={CC.boxSide} seed="bsk" />
      <Fill d={blob(820, top, 62, 13, {seed: 'bskO'})} color={CC.boxIn} offset={false} />
      {[
        [800, top - 8, 22],
        [840, top - 4, 17],
      ].map(([bx, by, br], i) => (
        <React.Fragment key={i}>
          <Fill d={crown(bx, by, br, br * 0.85, {seed: `ball${i}`, bumps: 8, round: 0.55})} color={CC.paperEdge} offset={false} />
          <Ink d={crown(bx, by, br, br * 0.85, {seed: `ball${i}`, bumps: 8, round: 0.55}) + poly([[bx - br * 0.5, by - br * 0.2], [bx - br * 0.1, by + br * 0.15], [bx + br * 0.35, by - br * 0.3]], {seed: `crease${i}`, over: [0, 0]})} width={W.hair} />
        </React.Fragment>
      ))}
      <Ink d={line(758, top, 772, bot, {seed: 'bsk1', over: [0, 0]}) + line(882, top, 868, bot, {seed: 'bsk2', over: [0, 0]}) + hline(772, 868, bot, {seed: 'bsk3', over: [0, 0]}) + ellipse(820, top, 62, 13, {seed: 'bskR'})} width={W.far} />
      <Ink d={line(790, top + 30, 798, bot - 12, {seed: 'bw1', over: [0, 0]}) + line(820, top + 30, 820, bot - 12, {seed: 'bw2', over: [0, 0]}) + line(850, top + 30, 842, bot - 12, {seed: 'bw3', over: [0, 0]})} width={W.hair} />
    </>
  );
};

// ---------------------------------------------------------------- pen, mug, lamp head (in front of the page)

/** The pen on the desk (the style frame's place, moved by dx / dy: O1 lays it 600 px left so her cat sits at the
 *  desk's front-right; lane L1's request, folded back). */
export const Pen: React.FC<{dx?: number; dy?: number}> = ({dx = 0, dy = 0}) => {
  const a: Pt = [706 + dx, 1182 + dy];
  const z: Pt = [874 + dx, 1238 + dy];
  const ang = (Math.atan2(z[1] - a[1], z[0] - a[0]) * 180) / Math.PI;
  const L = Math.hypot(z[0] - a[0], z[1] - a[1]);
  return (
    <>
      <Fill d={polyPath([[a[0] + 30, a[1] + 16], [z[0], z[1] + 12], [z[0] - 8, z[1] + 20], [a[0] + 24, a[1] + 22]])} color={CC.deskShade} offset={false} />
      <XG m={mat.compose(mat.translate(a[0], a[1]), mat.rotate(ang))}>
        <Fill d={polyPath([[0, 0], [20, -6], [20, 6]])} color={CC.paper} offset={false} />
        <Fill d={`M20 -8H${L - 7}Q${L} -8 ${L} 0Q${L} 8 ${L - 7} 8H20Z`} color={CC.anchor} seed="pen" />
        <Fill rect={[52, -8, 6, 16]} color={CC.paper} offset={false} />
        <Ink d={`M20 -8H${L - 7}Q${L} -8 ${L} 0Q${L} 8 ${L - 7} 8H20Z` + poly([[20, -6], [0, 0], [20, 6]], {seed: 'penT', over: [0, 0]})} width={W.far} />
        <Ink d={line(L - 70, -12, L - 14, -12, {seed: 'penC', over: [0, 0]})} width={W.far} color={CC.paper} />
      </XG>
    </>
  );
};

/** Steam off the desk mug (lane L1's, folded back by the assembler: the kit Steam's short dashes read as letters
 *  beside the contract at phone size): three long, thin, wavy wisps rising from the rim in a lighter warm ink, undulating slowly in
 *  step (they never cross into letter shapes), thin at the rim, widest low, tapering to nothing at the top. */
export const MugWisps: React.FC<{x: number; y: number}> = ({x, y}) => {
  const t = useTime();
  const wisps: [number, number, number, number][] = [
    [x - 22, 0, 104, 0.4],
    [x, 0.5, 142, 1.9],
    [x + 22, 1.0, 118, 3.3],
  ];
  return (
    <Live c={[x, y - 70]}>
      {wisps.map(([x0, ph, len0, lp], i) => {
        const len = len0 + 20 * Math.sin(t * 0.9 + lp);
        const N = 16;
        const C: Pt[] = [];
        for (let j = 0; j <= N; j++) {
          const s = j / N;
          C.push([x0 + (2 + 11 * s) * Math.sin(2 * Math.PI * (s * 0.8 - t * 0.3) + ph), y - s * len]);
        }
        const Lp: Pt[] = [];
        const Rp: Pt[] = [];
        C.forEach((p, j) => {
          const a = C[Math.max(0, j - 1)];
          const z = C[Math.min(N, j + 1)];
          const dx = z[0] - a[0];
          const dy = z[1] - a[1];
          const l = Math.hypot(dx, dy) || 1;
          const s = j / N;
          const w = 2.4 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + s * 0.88)), 0.8);
          Lp.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
          Rp.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
        });
        return <path key={i} d={smooth([...Lp, ...Rp.reverse()], {closed: true})} fill={CC.boxIn} />;
      })}
    </Live>
  );
};

export const DeskMug: React.FC = () => {
  const x0 = 800;
  const x1 = 898;
  const top = 950;
  const bot = 1054;
  const body = `M${x0} ${top}L${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}L${x1} ${top}Z`;
  return (
    <>
      <Fill d={smooth([[x0 + 10, bot - 6], [x0 - 40, bot + 18], [x0 - 70, bot + 40], [x0 - 30, bot + 46], [x1 - 10, bot + 6]], {closed: true})} color={CC.deskShade} offset={false} />
      <Ink d={`M${x1 - 2} ${top + 22}C${x1 + 44} ${top + 18} ${x1 + 44} ${top + 80} ${x1 - 2} ${top + 76}`} width={15} color={CC.mug} taper={false} />
      <Ink d={`M${x1 - 2} ${top + 14}C${x1 + 54} ${top + 10} ${x1 + 54} ${top + 88} ${x1 - 2} ${top + 84}`} width={W.far} />
      <Fill d={body} color={CC.mug} seed="mug" />
      <Fill rect={[x0, top + 40, x1 - x0, 18]} color={CC.mugBand} offset={false} />
      <Ink d={line(x0, top, x0, bot - 14, {over: [0, 0], seed: 'mg1'}) + line(x1, top, x1, bot - 14, {over: [0, 0], seed: 'mg2'}) + `M${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}`} width={W.mid} />
      <Fill d={blob((x0 + x1) / 2, top, (x1 - x0) / 2, 13, {seed: 'rim'})} color={CC.anchor} offset={false} />
      <Ink d={ellipse((x0 + x1) / 2, top, (x1 - x0) / 2, 13, {seed: 'rimI'})} width={W.mid} />
      <MugWisps x={(x0 + x1) / 2} y={top - 10} />
    </>
  );
};

/** The lamp head cut by the right edge (its golden mouth over the pool). */
export const LampHead: React.FC = () => {
  const B: Pt = [1094, 648];
  const M: Pt = [930, 806];
  const len = Math.hypot(M[0] - B[0], M[1] - B[1]);
  const ua: Pt = [(M[0] - B[0]) / len, (M[1] - B[1]) / len];
  const pa: Pt = [ua[1], -ua[0]];
  const shade: Pt[] = [add(B, pa, 30), add(M, pa, 88), add(M, pa, -88), add(B, pa, -30)];
  const ang = (Math.atan2(pa[1], pa[0]) * 180) / Math.PI;
  return (
    <>
      <Ink d={`M${B[0]} ${B[1]}L1170 520`} width={12} color={CC.anchor} taper={false} />
      <Fill d={polyPath(shade)} color={CC.anchor} offset={[1.5, 1]} />
      <Fill d={blob(B[0], B[1], 32, 32, {seed: 'lb'})} color={CC.anchor} offset={false} />
      <Ink d={line(...shade[0], ...shade[1], {seed: 'ls1', over: [0, 2]}) + line(...shade[3], ...shade[2], {seed: 'ls2', over: [0, 2]})} width={W.mid} />
      <XG m={mat.compose(mat.translate(M[0], M[1]), mat.rotate(ang))}>
        <Fill d={blob(0, 0, 88, 24, {seed: 'mouth'})} color={CC.core} offset={false} />
        <Ink d={ellipse(0, 0, 88, 24, {seed: 'mouthI'})} width={W.mid} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the two halves

/** Wall .. desk .. the books at the back-left (everything behind the box and the contract). */
/** How far the top shelf (and its trailing plant) sits above the style frame's place: 50 px, so P12's credit tab sits
 *  on bare wall (lane L1's fix, folded back by the assembler; dressing hung from the shelf moves with it). */
export const DESK_SHELF_UP = 50;

export const DeskBack: React.FC<{at?: number; lampOn?: boolean}> = ({at, lampOn = true}) => (
  <AtWave at={at}>
    <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" />
    <Bookcase />
    <XG m={mat.translate(0, -DESK_SHELF_UP)}>
      <TopShelf />
    </XG>
    <DeskWindow />
    <DeskFloor />
    <Basket />
    <DeskTop lampOn={lampOn} />
    <BookStack />
  </AtWave>
);

/** The pen, the mug, the lamp head (in front of the page). */
export const DeskFront: React.FC<{at?: number}> = ({at}) => (
  <AtWave at={at}>
    <DustMotes cx={DESK.pool.cx + 40} cy={DESK.pool.cy - 60} rx={DESK.pool.rx * 0.9} ry={DESK.pool.ry * 0.8} n={11} r={3.2} seed="deskmotes" />
    <Pen />
    <DeskMug />
    <LampHead />
  </AtWave>
);

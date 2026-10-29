// kit/Nook.tsx: HER HOME BASE, the nook (P2, P4, P13; P5 and P6 are the same home from closer / another angle). One
// dense, lived-in room (owner, 2026-10-26: a room full of real things, layered depth, ambient life that never stops):
// a wall cabinet and a high shelf at the top (inset from the frame's edge: never a slab), a full bookcase cut by the
// left edge with an upper cabinet to the high shelf, a wall clock, her coat and scarf on a hook, a
// framed print, the landscape window (660 x 470, ONE mullion, sill, a Roman blind in folds, the curtain rod across it)
// onto the living dusk town (kit/Town),
// a candle and a succulent on the sill, a honey curtain right, her desk with the table lamp and its golden light (on the
// wall and the desk), a corkboard leaning on the wall, papers on her closed laptop, the mug with steam, the interview
// mic and its cable, a pen cup, books; under the desk the radiator, a basket and cables; her chair; the floor with a
// rug and a big leafy plant. Every piece takes canvas px and is drawn like the style frame (lib Ink / Fill via util).
//
// LAYOUTS (one room, three sizes; the G3 board's numbers): the room is authored in P2's canvas px ("nook world") and
// placed by a matrix:   wide = P2 (identity)   m12 = P13 (x1.2 about (164, 957))   m14 = P4 (x1.4 about (254, 1139.5))
// <NookRoom layout="m14"> draws it; children are drawn in NOOK WORLD px inside the same matrix (her, the cat, a bubble's
// tail point; ink stays at screen weight). nookPt(layout, p) maps a world point to the screen. The board's figures in
// world px: P2 her standing (540, 1600, h 640); P4 / P13 her seated (420, 1600, h 600) on the chair; the mic (577, 1298,
// w 75). In the zoomed layouts the window's top is cut by the caption band's lower edge: the blind is drawn down to
// world y 736 (P4) / 690 (P2, P13), so mostly wall and blind fabric reach into the band (P4 shows a strip of sky).
//   <NookDeskClose>  P5: over her shoulder at the desk (laptop on the desk, the window right, the lamp, the pool)
//   <NookAngle>      P6: the new angle, 3/4 front: the window behind her (cut right), the bookcase left, the radiator
//                    right, her body in `behind`, then the desk across the full width in front of her, the floor plant

import React, {useId} from 'react';
import {blob, crown, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, textLines, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {ExitFade} from '../../../lib/exit';
import {CC} from '../palette';
import {applyM, At, b, Fill, fillAt, Ink, Pt, W} from './util';
import {CandleFlame, DustMotes, LampMoth, leafD, Live, Steam, Sway, swayAt, WallClock} from './Ambient';
import {DuskTown, DuskTownProps} from './Town';
import {Books, spineColour} from './Desk';
import {Mic} from './Props';
import {Cat, CatProps} from './Cat';

// ---------------------------------------------------------------- layouts

export type NookLayoutName = 'wide' | 'm12' | 'm14';
export const NOOK_LAYOUTS: Record<NookLayoutName, {s: number; fx: number; fy: number; blindY: number; panel: string}> = {
  wide: {s: 1, fx: 540, fy: 960, blindY: 690, panel: 'P2'},
  m12: {s: 1.2, fx: 164, fy: 957, blindY: 690, panel: 'P13'},
  m14: {s: 1.4, fx: 254, fy: 1139.5, blindY: 736, panel: 'P4'},
};
export const nookMat = (layout: NookLayoutName): Mat => {
  const L = NOOK_LAYOUTS[layout];
  return L.s === 1 ? mat.I : mat.about(mat.scale(L.s), L.fx, L.fy);
};
/** A nook-world point on the screen for a layout. */
export const nookPt = (layout: NookLayoutName, p: Pt): Pt => applyM(nookMat(layout), p[0], p[1]);
/** A screen point (e.g. a board number) in nook-world px for a layout. */
export const nookWorld = (layout: NookLayoutName, p: Pt): Pt => applyM(mat.inv(nookMat(layout)), p[0], p[1]);

/** The room's numbers (nook world px = P2 canvas px). */
export const NOOK = {
  floorY: 1540,
  soffit: {x1: 770, y: 110},
  /** The wall cabinet at the top left (inset 44 px from the frame's top edge in P2). */
  cabinet: {x0: 24, x1: 640, y0: 44, y1: 140},
  highShelf: {x1: 770, y: 250},
  /** The upper cabinet over the bookcase (to the high shelf: in P4 the left column runs to the frame's top edge), with
   *  an open niche under it where a book pile and a succulent stand on the bookcase. */
  upper: {x0: -170, x1: 174, y0: 266, y1: 516},
  bookcase: {x0: -170, x1: 152, side: 22, top: 600, boards: [600, 790, 980, 1170, 1360], bottom: 1540},
  strip: {x: 218}, // the wall strip between the bookcase and the window (clock, coat hook)
  window: {x0: 265, x1: 975, top: 600, glass: [290, 620, 660, 470] as [number, number, number, number], mullion: 740, sillY: 1090, sillH: 28},
  curtain: {x0: 990, x1: 1110, top: 600, bottom: 1546},
  /** The curtain rod over the window, its whole width (finial left; in P4 it frames the top right). */
  rod: {x0: 246, x1: 1140, y: 586},
  desk: {x0: 248, x1: 1110, top: 1294, apron: [1312, 1348] as [number, number], legs: [256, 1050]},
  lamp: {x: 845, y: 1296},
  chair: {x0: 330, x1: 450, backTop: 1270, seat: 1426, floor: 1600},
  mic: {x: 577, y: 1298, w: 75},
  rug: [[120, 1580], [960, 1580], [1160, 1940], [-80, 1940]] as [Pt, Pt, Pt, Pt],
  /** Where the cat lives in the nook (world px; Cat x, y): the sill (sit / loaf), the floor by the plant, under the desk. */
  catSpots: {sill: [862, 1090] as Pt, sillLeft: [612, 1090] as Pt, floor: [790, 1640] as Pt, underDesk: [700, 1540] as Pt, deskEnd: [990, 1294] as Pt},
  /** Her, the board's figures (world px). */
  herStand: {x: 540, y: 1600, h: 640},
  herSeat: {x: 420, y: 1600, h: 600},
};

// ---------------------------------------------------------------- small pieces (canvas px)

/** A potted plant: pot (top-left x, top y, w, h) and a crown of leaves that sways. kind 'leafy' | 'succulent' | 'trailing'. */
export const PotPlant: React.FC<{x: number; y: number; w: number; h?: number; kind?: 'leafy' | 'succulent' | 'trailing'; leaves?: number; at?: At; seed?: string}> = ({x, y, w, h = w * 0.85, kind = 'leafy', leaves, at, seed = 'pot'}) => {
  const t = useTime();
  const r = rng(`pot/${seed}`);
  const pot: Pt[] = [[x, y], [x + w, y], [x + w * 0.88, y + h], [x + w * 0.12, y + h]];
  const cx = x + w / 2;
  const n = leaves ?? (kind === 'succulent' ? 7 : kind === 'trailing' ? 9 : 8);
  const ls: React.ReactNode[] = [];
  let ink = '';
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    if (kind === 'trailing') {
      const sd = i % 2 === 0 ? -1 : 1;
      const len = w * r.range(0.9, 2.2);
      const sw = swayAt(t, `${seed}/v${i}`, 3, 0.3);
      const base: Pt = [cx + sd * w * r.range(0.1, 0.45), y + 2];
      const pts: Pt[] = [base, [base[0] + sd * w * 0.35 + sw, base[1] + len * 0.4], [base[0] + sd * w * 0.3 + sw * 1.6, base[1] + len]];
      ink += smooth(pts);
      for (let j = 1; j <= 3; j++) {
        const q = pts[Math.min(2, j)];
        const lp: Pt = [q[0] + (j === 3 ? 0 : sd * 4), q[1] - (3 - j) * len * 0.12];
        ls.push(<Fill key={`${i}/${j}`} d={leafD(lp[0], lp[1], w * 0.32, 90 + sd * 50 + j * 10)} color={j % 2 ? CC.leaf : CC.leafDark} offset={false} at={fillAt(at, 0.06)} />);
      }
    } else {
      const deg = -160 + 140 * u + r.jitter(8) + swayAt(t, `${seed}/l${i}`, kind === 'succulent' ? 1 : 3, 0.25);
      const len = (kind === 'succulent' ? w * 0.55 : w * 0.95) * r.range(0.8, 1.2);
      const d = leafD(cx + r.jitter(w * 0.12), y + 4, len, deg, kind === 'succulent' ? 0.32 : 0.44);
      ls.push(<Fill key={i} d={d} color={i % 3 === 0 ? CC.leafDark : i % 3 === 1 ? CC.leaf : CC.leafLight} offset={false} at={fillAt(at, 0.06)} />);
      ink += d;
    }
  }
  const pw = w >= 90 ? W.mid : W.far;
  return (
    <>
      {kind !== 'trailing' ? ls : null}
      {kind !== 'trailing' ? <Ink d={ink} width={W.hair} at={b(at, 0.05)} open={0.25} /> : null}
      <Fill d={polyPath(pot)} color={CC.pot} at={fillAt(at)} seed={`${seed}/pot`} />
      <Fill rect={[x - 3, y - 2, w + 6, Math.max(6, h * 0.16)]} color={CC.pot} at={fillAt(at, 0.01)} offset={false} />
      <Ink d={poly(pot, {closed: true, seed: `${seed}/potI`, over: 'small'}) + hline(x - 3, x + w + 3, y + Math.max(6, h * 0.16), {seed: `${seed}/rim`, over: [0, 0]})} width={pw} at={at} />
      {kind === 'trailing' ? (
        <>
          <Ink d={ink} width={W.hair} at={b(at, 0.05)} />
          {ls}
        </>
      ) : null}
    </>
  );
};

/** A framed print: frame (wood), mat, and a flat little picture (hills + sun / a portrait / shapes). */
export const FramedPicture: React.FC<{x: number; y: number; w: number; h: number; kind?: 'hills' | 'sea' | 'shapes' | 'portrait'; at?: At; seed?: string}> = ({x, y, w, h, kind = 'hills', at, seed = 'pic'}) => {
  const fw = Math.max(6, Math.min(w, h) * 0.08);
  const m = Math.max(5, Math.min(w, h) * 0.1);
  const ix = x + fw + m;
  const iy = y + fw + m;
  const iw = w - 2 * (fw + m);
  const ih = h - 2 * (fw + m);
  const P = CC.pictures;
  let art: React.ReactNode;
  if (kind === 'hills' || kind === 'sea') {
    art = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={kind === 'sea' ? P[5] : P[0]} offset={false} at={fillAt(at, 0.04)} />
        <Fill d={blob(ix + iw * 0.7, iy + ih * 0.32, ih * 0.14, ih * 0.14, {seed: `${seed}/sun`})} color={kind === 'sea' ? P[2] : P[5]} offset={false} at={fillAt(at, 0.05)} />
        <Fill d={polyPath([[ix, iy + ih], [ix, iy + ih * 0.62], [ix + iw * 0.3, iy + ih * 0.44], [ix + iw * 0.55, iy + ih * 0.66], [ix + iw * 0.8, iy + ih * 0.5], [ix + iw, iy + ih * 0.6], [ix + iw, iy + ih]])} color={kind === 'sea' ? P[4] : P[3]} offset={false} at={fillAt(at, 0.05)} />
      </>
    );
  } else if (kind === 'portrait') {
    art = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={P[1]} offset={false} at={fillAt(at, 0.04)} />
        <Fill d={blob(ix + iw / 2, iy + ih * 0.4, iw * 0.2, iw * 0.22, {seed: `${seed}/hd`})} color={CC.skin} offset={false} at={fillAt(at, 0.05)} />
        <Fill d={`M${ix + iw * 0.18} ${iy + ih}Q${ix + iw * 0.2} ${iy + ih * 0.66} ${ix + iw / 2} ${iy + ih * 0.66}Q${ix + iw * 0.8} ${iy + ih * 0.66} ${ix + iw * 0.82} ${iy + ih}Z`} color={P[2]} offset={false} at={fillAt(at, 0.05)} />
      </>
    );
  } else {
    art = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={CC.paper} offset={false} at={fillAt(at, 0.04)} />
        <Fill d={blob(ix + iw * 0.35, iy + ih * 0.42, iw * 0.24, iw * 0.24, {seed: `${seed}/c1`})} color={P[2]} offset={false} at={fillAt(at, 0.05)} />
        <Fill rect={[ix + iw * 0.48, iy + ih * 0.3, iw * 0.36, ih * 0.5]} color={P[4]} offset={false} at={fillAt(at, 0.05)} />
      </>
    );
  }
  return (
    <>
      <Fill rect={[x, y, w, h]} color={CC.frame} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill rect={[x + fw, y + fw, w - 2 * fw, h - 2 * fw]} color={CC.paper} offset={false} at={fillAt(at, 0.02)} />
      {art}
      <Ink d={rect(x, y, w, h, {seed: `${seed}/frI`, over: 'small'}) + rect(ix, iy, iw, ih, {seed: `${seed}/inI`, over: [0, 1]})} width={w >= 160 ? W.mid : W.far} at={at} />
    </>
  );
};

/** A corkboard (on the wall, or leaning: `lean` px the top sits back) with pinned notes, a photo and pins. */
export const Corkboard: React.FC<{x: number; y: number; w: number; h: number; lean?: number; at?: At; seed?: string}> = ({x, y, w, h, lean = 0, at, seed = 'cork'}) => {
  const r = rng(`cork/${seed}`);
  const fw = Math.max(7, w * 0.05);
  const q: Pt[] = [[x + lean, y], [x + w - lean, y], [x + w, y + h], [x, y + h]];
  const qi: Pt[] = [[x + lean + fw, y + fw], [x + w - lean - fw, y + fw], [x + w - fw, y + h - fw], [x + fw, y + h - fw]];
  const notes: React.ReactNode[] = [];
  let ink = '';
  const cols = 3;
  const rows = 2;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (r.chance(0.15)) continue;
      const nw = w * r.range(0.2, 0.26);
      const nh = nw * r.range(0.75, 1.1);
      const nx = x + fw + 6 + i * ((w - 2 * fw) / cols) + r.jitter(4);
      const ny = y + fw + 6 + j * ((h - 2 * fw) / rows) + r.jitter(4);
      const rot = r.jitter(8);
      const col = r.pick([CC.note, CC.note2, CC.note3, CC.note]);
      const photo = i === 1 && j === 0;
      const M = mat.about(mat.rotate(rot), nx + nw / 2, ny + nh / 2);
      const P = (px: number, py: number) => applyM(M, px, py);
      const pts: Pt[] = [P(nx, ny), P(nx + nw, ny), P(nx + nw, ny + nh), P(nx, ny + nh)];
      notes.push(<Fill key={`${i}${j}`} d={polyPath(pts)} color={photo ? CC.pictures[3] : col} offset={false} at={fillAt(at, 0.04)} />);
      if (photo) notes.push(<Fill key={`${i}${j}s`} d={polyPath([P(nx + nw * 0.1, ny + nh * 0.1), P(nx + nw * 0.9, ny + nh * 0.1), P(nx + nw * 0.9, ny + nh * 0.55), P(nx + nw * 0.1, ny + nh * 0.55)])} color={CC.pictures[0]} offset={false} at={fillAt(at, 0.05)} />);
      else ink += [0.4, 0.62, 0.82].map((v, k) => line(...P(nx + nw * 0.14, ny + nh * v), ...P(nx + nw * (k === 2 ? 0.6 : 0.86), ny + nh * v), {over: [0, 0], seed: `${seed}/n${i}${j}${k}`})).join('');
      notes.push(<Fill key={`${i}${j}p`} d={blob(...P(nx + nw / 2, ny + 5), 3.6, 3.6, {seed: `${seed}/pin${i}${j}`})} color={CC.pin} offset={false} at={fillAt(at, 0.06)} />);
    }
  return (
    <>
      <Fill d={polyPath(q)} color={CC.frame} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill d={polyPath(qi)} color={CC.cork} offset={false} at={fillAt(at, 0.02)} />
      {notes}
      <Ink d={poly(q, {closed: true, seed: `${seed}/frI`, over: 'small'}) + poly(qi, {closed: true, seed: `${seed}/inI`, over: [0, 0]})} width={w >= 200 ? W.mid : W.far} at={at} />
      <Ink d={ink} width={W.hair} at={b(at, 0.08)} />
    </>
  );
};

/** Her coat (dusty mauve) and a honey scarf on a wall hook at (x, y): the loop pinched at the hook, shoulders, two
 *  sleeves hanging, lapels and buttons, the scarf over it; `len` the coat's length. It sways a hair. */
export const CoatOnHook: React.FC<{x: number; y: number; len?: number; at?: At; seed?: string}> = ({x, y, len = 420, at, seed = 'coat'}) => {
  const t = useTime();
  const w = len * 0.34;
  const sw = swayAt(t, seed, 1.2, 0.18);
  const sh = y + len * 0.1; // shoulder line
  const coat = smooth([[x - 6, y + 4], [x - w * 0.42, sh], [x - w * 0.5, sh + len * 0.1], [x - w * 0.46 + sw * 0.6, y + len * 0.62], [x - w * 0.52 + sw * 1.4, y + len], [x + w * 0.52 + sw * 1.4, y + len + 4], [x + w * 0.46 + sw * 0.6, y + len * 0.62], [x + w * 0.5, sh + len * 0.1], [x + w * 0.42, sh], [x + 6, y + 4]], {closed: true, tension: 0.3});
  const sleeve = (sd: number) => smooth([[x + sd * w * 0.42, sh + 2], [x + sd * w * 0.58, sh + len * 0.2], [x + sd * w * 0.56 + sw, y + len * 0.7], [x + sd * w * 0.36 + sw, y + len * 0.72], [x + sd * w * 0.34, sh + len * 0.2]], {closed: true, tension: 0.35});
  const lapels = smooth([[x - w * 0.16, sh - 4], [x - w * 0.02, sh + len * 0.26], [x + w * 0.06, sh + len * 0.3]]) + smooth([[x + w * 0.16, sh - 4], [x + w * 0.04, sh + len * 0.24]]);
  const placket = line(x + w * 0.04, sh + len * 0.28, x + w * 0.04 + sw, y + len * 0.98, {over: [0, 0], seed: `${seed}/pl`});
  const buttons = [0.42, 0.56, 0.7].map((v) => blob(x + w * 0.12 + sw * v, y + len * v, 4.5, 4.5, {seed: `${seed}/bt${v}`})).join('');
  const scarf = smooth([[x - w * 0.2, sh - 8], [x - w * 0.26, y + len * 0.42], [x - w * 0.22 + sw, y + len * 0.66], [x - w * 0.04 + sw, y + len * 0.66], [x - w * 0.06, y + len * 0.36], [x + w * 0.1, sh - 10]], {closed: true});
  const fringe = Array.from({length: 4}, (_, i) => line(x - w * (0.21 - i * 0.05) + sw, y + len * 0.66, x - w * (0.21 - i * 0.05) + sw, y + len * 0.7, {over: [0, 0], seed: `${seed}/fr${i}`})).join('');
  return (
    <>
      <Fill d={coat} color={CC.coat} at={fillAt(at)} seed={`${seed}/c`} />
      <Fill d={sleeve(-1)} color={CC.coatShade} at={fillAt(at, 0.02)} offset={false} />
      <Fill d={sleeve(1)} color={CC.coatShade} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={coat + sleeve(-1) + sleeve(1)} width={W.far} at={at} open={0.05} />
      <Ink d={lapels + placket} width={W.hair + 0.4} at={b(at, 0.04)} />
      <Fill d={buttons} color={CC.anchor} offset={false} at={fillAt(at, 0.05)} />
      <Fill d={scarf} color={CC.scarf} at={fillAt(at, 0.04)} seed={`${seed}/s`} />
      <Ink d={scarf + fringe} width={W.hair + 0.4} at={b(at, 0.04)} />
      <Fill d={blob(x, y, 7, 7, {seed: `${seed}/hook`})} color={CC.trim} offset={false} at={fillAt(at)} />
    </>
  );
};

/** A table lamp standing on a surface at (x, y): base, stem, a dark shade with a lit rim, its warm glow on the wall
 *  behind it (`glow` ellipse, clipped to `glowClip` [y0, y1] if given), a pool on the surface (`pool` rx), dust motes. */
export const TableLamp: React.FC<{x: number; y: number; h?: number; glow?: {rx: number; ry: number; dy?: number} | false; glowClip?: [number, number]; pool?: number; motes?: boolean; at?: At; seed?: string}> = ({x, y, h = 104, glow = {rx: 190, ry: 104}, glowClip, pool = 170, motes = true, at, seed = 'lamp'}) => {
  const sTop = y - h;
  const sBot = y - h * 0.46;
  const tw = h * 0.33;
  const bw = h * 0.58;
  const shade: Pt[] = [[x - tw, sTop], [x + tw, sTop], [x + bw, sBot], [x - bw, sBot]];
  const gy = (sTop + sBot) / 2 + (glow ? glow.dy ?? 0 : 0);
  const clipId = ('lampglow' + useId()).replace(/[^a-zA-Z0-9-]/g, '');
  return (
    <>
      {glow ? (
        <>
          {glowClip ? (
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <rect x={x - glow.rx - 20} y={glowClip[0]} width={glow.rx * 2 + 40} height={glowClip[1] - glowClip[0]} />
              </clipPath>
            </defs>
          ) : null}
          <g clipPath={glowClip ? `url(#${clipId})` : undefined}>
            <Fill d={blob(x, gy, glow.rx, glow.ry, {seed: `${seed}/g1`, wobble: 0.02})} color={CC.wallGlow} offset={false} at={fillAt(at)} />
            <Fill d={blob(x, gy - glow.ry * 0.1, glow.rx * 0.62, glow.ry * 0.6, {seed: `${seed}/g2`, wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
          </g>
        </>
      ) : null}
      {pool ? <Fill d={blob(x, y - 2, pool, Math.max(8, pool * 0.08), {seed: `${seed}/pool`})} color={CC.ring} offset={false} at={fillAt(at)} /> : null}
      <Ink d={line(x, sBot, x, y - 8, {over: [0, 0], seed: `${seed}/stem`})} width={Math.max(5, h * 0.07)} color={CC.anchor} taper={false} at={at} />
      <Fill d={blob(x, y - 5, h * 0.3, h * 0.07, {seed: `${seed}/base`})} color={CC.anchor} at={fillAt(at)} offset={false} />
      <Fill d={polyPath(shade)} color={CC.lampShade} at={fillAt(at)} seed={`${seed}/shade`} />
      <Fill d={blob(x, sBot, bw * 0.96, Math.max(4, h * 0.07), {seed: `${seed}/mouth`})} color={CC.core} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={poly(shade, {closed: true, seed: `${seed}/shI`, over: 'small'})} width={h >= 140 ? W.mid : W.far} at={at} />
      {motes && glow ? <DustMotes cx={x} cy={gy} rx={glow.rx * 0.8} ry={glow.ry * 0.7} n={8} seed={`${seed}/motes`} at={at} /> : null}
    </>
  );
};

/** A mug with steam (nook sizes; the desk insert's is Desk.tsx DeskMug). Top-left x, top y, width w. */
export const NookMug: React.FC<{x: number; top: number; w?: number; at?: At; seed?: string}> = ({x, top, w = 46, at, seed = 'nmug'}) => {
  const x1 = x + w;
  const hgt = w * 1.06;
  const bot = top + hgt;
  const r = w * 0.18;
  const body = `M${x} ${top}L${x} ${bot - r}Q${x} ${bot} ${x + r} ${bot}L${x1 - r} ${bot}Q${x1} ${bot} ${x1} ${bot - r}L${x1} ${top}Z`;
  const handle = `M${x1 - 1} ${top + w * 0.2}C${x1 + w * 0.42} ${top + w * 0.18} ${x1 + w * 0.42} ${top + w * 0.78} ${x1 - 1} ${top + w * 0.74}`;
  return (
    <>
      <Ink d={handle} width={Math.max(4, w * 0.15)} color={CC.ink} taper={false} at={at} />
      <Ink d={handle} width={Math.max(2, w * 0.08)} color={CC.mug} taper={false} at={at} />
      <Fill d={body} color={CC.mug} seed={`${seed}/b`} at={fillAt(at)} />
      <Fill rect={[x, top + hgt * 0.38, w, hgt * 0.17]} color={CC.mugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={body} width={w >= 80 ? W.mid : W.far} at={at} />
      <Fill d={blob(x + w / 2, top, w / 2, Math.max(4, w * 0.12), {seed: `${seed}/rim`})} color={CC.anchor} offset={false} at={fillAt(at, 0.03)} />
      <Steam x={x + w / 2} y={top - 4} h={Math.max(64, w * 2.1)} amp={Math.max(6, w * 0.14)} seed={`${seed}/st`} at={at} />
    </>
  );
};

/** The share of navy book spines that stay navy in her home (lane L2's dark budget: the anchor belongs on her hair,
 *  the mic and the lamp shade; the rest of the spines take home mid-tones). */
export const NOOK_DARK = 0.25;

/** Books lying flat, a pile (left x, base y, width w, n books; `dark` as Books, default NOOK_DARK). */
export const BookPile: React.FC<{x: number; y: number; w: number; n?: number; dark?: number; at?: At; seed?: string}> = ({x, y, w, n = 3, dark = NOOK_DARK, at, seed = 'pile'}) => {
  const r = rng(`bpile/${seed}`);
  let yy = y;
  const out: React.ReactNode[] = [];
  let ink = '';
  for (let i = 0; i < n; i++) {
    const h = w * r.range(0.12, 0.18);
    const ww = w * r.range(0.82, 1);
    const xx = x + r.jitter(w * 0.06);
    yy -= h;
    out.push(<Fill key={i} rect={[xx, yy, ww, h]} color={i % 3 === 2 ? spineColour(CC.anchor, dark, `${seed}/${i}`) : r.pick(CC.books)} seed={`${seed}/${i}`} at={fillAt(at)} />);
    ink += rect(xx, yy, ww, h, {seed: `${seed}/I${i}`, over: 'small'}) + vline(xx + ww - w * 0.1, yy + 2, yy + h - 2, {over: [0, 0], seed: `${seed}/s${i}`});
  }
  return (
    <>
      {out}
      <Ink d={ink} width={W.far} at={at} />
    </>
  );
};

/** A paper stack (left x, base y, w): a few sheets, the top one ruled. */
export const PaperStack: React.FC<{x: number; y: number; w: number; at?: At; seed?: string}> = ({x, y, w, at, seed = 'papers'}) => {
  const h = Math.max(8, w * 0.1);
  return (
    <>
      <Fill rect={[x + 4, y - h, w, h]} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      <Fill rect={[x, y - h - 2, w, h]} color={CC.paper} at={fillAt(at)} seed={`${seed}/p`} />
      <Ink d={rect(x, y - h - 2, w, h, {seed: `${seed}/I`, over: 'small'}) + hline(x + 4, x + w - 4, y - h * 0.4, {over: [0, 0], seed: `${seed}/e`})} width={W.far} at={at} />
    </>
  );
};

// ---------------------------------------------------------------- the big pieces of the nook (nook-world px)

/** A long high wall shelf full of things (books, a pile, a framed photo, a box, a trailing plant, a jar), from x0 to x1
 *  with its top at y (keep y <= 260 so everything stays above the caption band). The nook's, P5's and P6's top edge. */
export const HighShelf: React.FC<{x0: number; x1: number; y: number; at?: At; seed?: string}> = ({x0, x1, y, at, seed = 'hs'}) => {
  const items: React.ReactNode[] = [];
  const r = rng(`hshelf/${seed}`);
  let x = x0 + 20;
  let k = 0;
  while (x < x1 - 60) {
    const kind = k % 6;
    if (kind === 0 || kind === 4) {
      const w = r.range(110, 190);
      items.push(<Books key={k} dark={NOOK_DARK} x0={x} x1={Math.min(x1 - 20, x + w)} base={y} hMin={64} hMax={92} seed={`${seed}/b${k}`} at={at} />);
      x += w + 18;
    } else if (kind === 1) {
      items.push(<BookPile key={k} x={x} y={y} w={92} n={3} seed={`${seed}/p${k}`} at={at} />);
      x += 112;
    } else if (kind === 2) {
      items.push(<FramedPicture key={k} x={x} y={y - 92} w={76} h={92} kind={r.chance(0.5) ? 'sea' : 'portrait'} seed={`${seed}/f${k}`} at={at} />);
      x += 96;
    } else if (kind === 3) {
      items.push(<PotPlant key={k} x={x} y={y - 34} w={50} h={34} kind="trailing" seed={`${seed}/t${k}`} at={at} />);
      x += 72;
    } else {
      items.push(
        <React.Fragment key={k}>
          <Fill rect={[x, y - 62, 92, 62]} color={CC.box} at={fillAt(at)} seed={`${seed}/x${k}`} />
          <Ink d={rect(x, y - 62, 92, 62, {seed: `${seed}/xI${k}`, over: 'small'}) + hline(x + 10, x + 82, y - 42, {over: [0, 0], seed: `${seed}/xL${k}`})} width={W.far} at={at} />
          <Fill d={roundRect(x + 104, y - 52, 38, 52, 8)} color={CC.candle} at={fillAt(at)} seed={`${seed}/j${k}`} />
          <Ink d={roundRect(x + 104, y - 52, 38, 52, 8, {seed: `${seed}/jI${k}`})} width={W.far} at={at} />
        </React.Fragment>,
      );
      x += 160;
    }
    k++;
  }
  return (
    <>
      {items}
      <Fill rect={[x0, y, x1 - x0, 14]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Ink d={rect(x0, y, x1 - x0, 14, {seed: `${seed}/I`, over: [0, 3], edges: 'tbr'})} width={W.mid} at={at} />
      {[x0 + 140, x1 - 60].map((bx, i) => (
        <Ink key={i} d={poly([[bx, y + 14], [bx + 26, y + 14], [bx, y + 44]], {closed: true, seed: `${seed}/br${i}`, over: [0, 0]})} width={W.far} at={at} />
      ))}
    </>
  );
};

/** The top of the wall (world px): a wall cabinet (three doors, knobs, a shadow under it) inset from the frame's top
 *  edge (never a slab flush with the edge: it would read as paper), and the long high shelf full of things under it. */
const Soffit: React.FC<{at?: At}> = ({at}) => {
  const sh = NOOK.highShelf;
  const C = NOOK.cabinet;
  const dw = (C.x1 - C.x0 - 16) / 3;
  const doors = [0, 1, 2].map((i) => rect(C.x0 + 8 + i * dw + 4, C.y0 + 8, dw - 8, C.y1 - C.y0 - 16, {seed: `cabd${i}`, over: [0, 0]})).join('');
  return (
    <>
      <Fill rect={[C.x0 + 6, C.y1, C.x1 - C.x0, 10]} color={CC.wallDeep} offset={false} at={fillAt(at)} />
      <Fill rect={[C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0]} color={CC.shelf} at={fillAt(at)} seed="cab" />
      {[0, 1, 2].map((i) => (
        <Fill key={i} rect={[C.x0 + 8 + i * dw + 4, C.y0 + 8, dw - 8, C.y1 - C.y0 - 16]} color={CC.wallShade} offset={false} at={fillAt(at, 0.02)} />
      ))}
      <Ink d={rect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0, {seed: 'cabI', over: 'small'})} width={W.mid} at={at} />
      <Ink d={doors} width={W.far} at={b(at, 0.03)} />
      {[0, 1, 2].map((i) => (
        <Fill key={`k${i}`} d={blob(C.x0 + 8 + i * dw + (i === 2 ? 22 : dw - 22), (C.y0 + C.y1) / 2 + 12, 6, 6, {seed: `cabk${i}`})} color={CC.anchor} offset={false} at={fillAt(at, 0.04)} />
      ))}
      {/* a long high shelf under it, full of things (above the caption band: y < 290) */}
      <HighShelf x0={-60} x1={sh.x1} y={sh.y} seed="hs" at={at} />
    </>
  );
};

const Bookcase: React.FC<{at?: At}> = ({at}) => {
  const B = NOOK.bookcase;
  const r = rng('nookcase');
  const shelves = B.boards.slice(1).map((y, i) => ({top: B.boards[i] + 16, base: y}));
  let boards = '';
  B.boards.forEach((y, i) => (boards += hline(B.x0, B.x1, y, {seed: `nb${i}`, over: [0, 2]}) + hline(B.x0, B.x1, y + 16, {seed: `nbb${i}`, over: [0, 2]})));
  const extras: React.ReactNode[] = [];
  // shelf objects among the books: a plant, a framed photo, a cardboard box, a jar
  extras.push(<PotPlant key="sp" x={70} y={1300} w={52} h={44} kind="leafy" seed="caseplant" at={at} />);
  extras.push(<FramedPicture key="sf" x={58} y={880} w={78} h={98} kind="portrait" seed="casephoto" at={at} />);
  extras.push(<Fill key="bx" rect={[-40, 1076, 120, 92]} color={CC.box} at={fillAt(at)} seed="casebox" />);
  extras.push(<Ink key="bxI" d={rect(-40, 1076, 120, 92, {seed: 'caseboxI', over: 'small'}) + hline(-30, 70, 1100, {over: [0, 0], seed: 'caseboxL'})} width={W.far} at={at} />);
  return (
    <>
      <Fill rect={[B.x0 - 40, B.top, B.x1 - B.x0 + 40, B.bottom - B.top]} color={CC.caseBack} offset={false} at={fillAt(at)} />
      <Books dark={NOOK_DARK} x0={B.x0 - 30} x1={54} base={shelves[0].base} hMin={130} hMax={168} seed="nk1" at={at} />
      <Books dark={NOOK_DARK} x0={B.x0 - 30} x1={B.x1 - 8} base={shelves[1].base} hMin={120} hMax={170} seed="nk2" at={at} />
      <Books dark={NOOK_DARK} x0={88} x1={B.x1 - 6} base={shelves[2].base} hMin={110} hMax={150} seed="nk3" at={at} />
      <Books dark={NOOK_DARK} x0={B.x0 - 30} x1={58} base={shelves[3].base} hMin={120} hMax={160} seed="nk4" at={at} />
      <Books dark={NOOK_DARK} x0={B.x0 - 30} x1={B.x1 - 10} base={B.bottom - 2} hMin={110} hMax={150} seed="nk5" at={at} />
      <Books dark={NOOK_DARK} x0={B.x0 - 30} x1={40} base={shelves[2].base} hMin={110} hMax={150} seed="nk6" at={at} />
      {extras}
      {B.boards.map((y, i) => (
        <Fill key={i} rect={[B.x0 - 40, y, B.x1 - B.x0 + 40, 16]} color={CC.shelf} seed={`nkb${i}`} at={fillAt(at)} />
      ))}
      <Fill rect={[B.x1, B.top - 4, B.side, B.bottom - B.top + 4]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Ink d={boards} width={W.mid} at={at} />
      <Ink d={vline(B.x1, B.top - 4, B.bottom, {over: [0, 0], seed: 'nku1'}) + vline(B.x1 + B.side, B.top - 4, B.bottom, {over: [0, 0], seed: 'nku2'}) + hline(B.x0 - 40, B.x1 + B.side, B.top - 4, {seed: 'nkt', over: [0, 0]})} width={W.mid} at={at} />
      {/* the upper cabinet over it (two tall flat doors: calm in P2's band; P4's left column runs to the top edge) */}
      <UpperCabinet at={at} />
      {/* in the niche on top (only small things) */}
      <BookPile x={-20} y={B.top - 4} w={110} n={2} seed="nktop" at={at} />
      <PotPlant x={100} y={B.top - 34} w={40} h={30} kind="succulent" seed="nktopplant" at={at} />
      {void r}
    </>
  );
};

const UpperCabinet: React.FC<{at?: At}> = ({at}) => {
  const U = NOOK.upper;
  const B = NOOK.bookcase;
  const mid = (U.x0 + U.x1) / 2 + 30;
  return (
    <>
      <Fill rect={[B.x0 - 40, U.y1, B.x1 - B.x0 + 40, B.top - U.y1]} color={CC.caseBack} offset={false} at={fillAt(at)} />
      <Fill rect={[B.x1, U.y1, B.side, B.top - U.y1]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Fill rect={[U.x0, U.y0, U.x1 - U.x0, U.y1 - U.y0]} color={CC.shelf} at={fillAt(at)} seed="upcab" />
      <Fill rect={[U.x0 + 10, U.y0 + 12, mid - U.x0 - 16, U.y1 - U.y0 - 24]} color={CC.wallShade} offset={false} at={fillAt(at, 0.02)} />
      <Fill rect={[mid + 6, U.y0 + 12, U.x1 - mid - 18, U.y1 - U.y0 - 24]} color={CC.wallShade} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={rect(U.x0, U.y0, U.x1 - U.x0, U.y1 - U.y0, {seed: 'upcabI', over: 'small'}) + vline(mid, U.y0 + 12, U.y1 - 12, {over: [0, 0], seed: 'upcabM'}) + vline(B.x1, U.y1, B.top, {over: [0, 0], seed: 'upcabS1'}) + vline(B.x1 + B.side, U.y1, B.top, {over: [0, 0], seed: 'upcabS2'})} width={W.mid} at={at} />
      <Fill d={blob(mid - 16, (U.y0 + U.y1) / 2 + 40, 6, 6, {seed: 'upk1'})} color={CC.anchor} offset={false} at={fillAt(at, 0.04)} />
      <Fill d={blob(mid + 22, (U.y0 + U.y1) / 2 + 40, 6, 6, {seed: 'upk2'})} color={CC.anchor} offset={false} at={fillAt(at, 0.04)} />
    </>
  );
};

const NookWindow: React.FC<{blindY: number; town?: Partial<DuskTownProps>; at?: At}> = ({blindY, town, at}) => {
  const t = useTime();
  const N = NOOK.window;
  const [gx, gy, gw, gh] = N.glass;
  const cordSw = swayAt(t, 'cord', 4, 0.4);
  const nf = Math.max(2, Math.round((blindY - gy) / 34));
  const folds: [number, number][] = Array.from({length: nf}, (_, i) => [gy - 8 + ((blindY - gy + 8) * i) / nf, gy - 8 + ((blindY - gy + 8) * (i + 1)) / nf]);
  return (
    <>
      {/* the recess and the trim behind the glass leave WITH the town in an un-build (the same shrink about the glass's
          centre): left behind, the trim read as a solid brown block at the loop seam (lane L2's request) */}
      <ExitFade x={gx + gw / 2} y={gy + gh / 2}>
        <Fill rect={[N.x0, N.top, N.x1 - N.x0, N.sillY - N.top]} color={CC.wallShade} offset={false} at={fillAt(at)} />
        <Fill rect={[gx - 10, gy - 10, gw + 20, gh + 10]} color={CC.trim} offset={false} at={fillAt(at)} />
      </ExitFade>
      <DuskTown x={gx} y={gy} w={gw} h={gh} horizon={gy + gh * 0.55} moon={[gx + gw * 0.8, blindY + 46]} {...town} seed={town?.seed ?? 'nooktown'} at={at} />
      {/* the blind (a Roman blind: fabric down to blindY in soft folds, alternate folds one step down; its bar, the
          fold shadow it casts on the glass, the pull cord with its toggle) */}
      <Fill rect={[gx - 6, blindY + 10, gw + 12, 9]} color={CC.winDark} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[gx - 6, gy - 8, gw + 12, blindY - gy + 8]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
      {folds.map(([y0, y1], i) => (i % 2 ? <Fill key={`bf${i}`} rect={[gx - 6, y0, gw + 12, y1 - y0]} color={CC.blindShade} offset={false} at={fillAt(at, 0.03)} /> : null))}
      <Ink d={folds.map(([y0], i) => (i ? hline(gx - 6, gx + gw + 6, y0, {seed: `blf${i}`, over: [0, 0]}) : '')).join('')} width={W.hair} color={CC.curtainShade} at={b(at, 0.03)} />
      <Fill rect={[gx - 8, blindY, gw + 16, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
      <Ink d={hline(gx - 8, gx + gw + 8, blindY + 10, {seed: 'blb', over: [0, 0]}) + hline(gx - 8, gx + gw + 8, blindY, {seed: 'blt', over: [0, 0]})} width={W.far} at={b(at, 0.03)} />
      <Ink d={line(gx + gw - 60, blindY + 10, gx + gw - 60 + cordSw, blindY + 74, {over: [0, 0], seed: 'cord'})} width={W.hair} at={b(at, 0.04)} />
      <Ink d={ellipse(gx + gw - 60 + cordSw, blindY + 82, 6, 8, {seed: 'ring'})} width={W.far} at={b(at, 0.04)} />
      {/* the mullion, the frame's inner edges */}
      <Fill rect={[N.mullion - 7, blindY + 10, 14, gy + gh - blindY - 10]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={vline(N.mullion - 7, blindY + 10, gy + gh, {over: [0, 0], seed: 'mu1'}) + vline(N.mullion + 7, blindY + 10, gy + gh, {over: [0, 0], seed: 'mu2'}) + vline(gx, gy, gy + gh, {over: [0, 0], seed: 'gl1'}) + vline(gx + gw, gy, gy + gh, {over: [0, 0], seed: 'gl2'})} width={W.mid} at={at} />
      <Ink d={vline(N.x0, N.top, N.sillY, {over: [0, 0], seed: 'rv1'}) + vline(N.x1, N.top, N.sillY, {over: [0, 0], seed: 'rv2'}) + hline(N.x0, N.x1, N.top, {over: [0, 0], seed: 'rv3'})} width={W.mid} at={at} />
      {/* the sill and what is on it: a succulent, a photo, a candle */}
      <Fill rect={[N.x0 - 12, N.sillY, N.x1 - N.x0 + 24, 12]} color={CC.sill} offset={false} at={fillAt(at)} />
      <Fill rect={[N.x0 - 12, N.sillY + 12, N.x1 - N.x0 + 24, N.sillH - 12]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Ink d={hline(N.x0 - 12, N.x1 + 12, N.sillY, {seed: 'si1', over: [4, 4]}) + hline(N.x0 - 12, N.x1 + 12, N.sillY + 12, {seed: 'si2', over: [0, 0]}) + hline(N.x0 - 12, N.x1 + 12, N.sillY + N.sillH, {seed: 'si3', over: [0, 0]})} width={W.mid} at={at} />
      <PotPlant x={312} y={N.sillY - 36} w={44} h={36} kind="succulent" seed="sillplant" at={at} />
      <FramedPicture x={812} y={N.sillY - 62} w={50} h={62} kind="sea" seed="sillphoto" at={at} />
      <Fill d={roundRect(888, N.sillY - 40, 36, 40, 6)} color={CC.candle} at={fillAt(at)} seed="candle" />
      <Ink d={roundRect(888, N.sillY - 40, 36, 40, 6, {seed: 'candleI'})} width={W.far} at={at} />
      <CandleFlame x={906} y={N.sillY - 42} h={20} seed="nookflame" at={at} />
    </>
  );
};

const Curtain: React.FC<{at?: At}> = ({at}) => {
  const t = useTime();
  const C = NOOK.curtain;
  const s1 = swayAt(t, 'cur1', 12, 0.19);
  const s2 = swayAt(t, 'cur2', 7, 0.27);
  const d = smooth([[C.x0 + 6, C.top], [C.x0 - 4, C.top + 300], [C.x0 + 4 + s2 * 0.4, C.top + 640], [C.x0 - 6 + s1, C.bottom], [C.x1 + 40, C.bottom + 4], [C.x1 + 40, C.top]], {closed: true, tension: 0.35});
  const folds = [28, 58, 90].map((dx, i) => smooth([[C.x0 + dx, C.top + 10], [C.x0 + dx + (i % 2 ? 4 : -4), C.top + 400], [C.x0 + dx + s1 * 0.8 + (i - 1) * 4, C.bottom - 6]])).join('');
  // the rod runs the window's whole width (finials at both ends), rings gathered over the curtain
  const R = NOOK.rod;
  return (
    <>
      <Ink d={hline(R.x0, R.x1, R.y, {over: [0, 0], seed: 'rod'})} width={7} color={CC.anchor} taper={false} at={at} />
      <Fill d={blob(R.x0 - 6, R.y, 11, 11, {seed: 'finial'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      {[R.x0 + 30, R.x0 + 300].map((bx, i) => (
        <Ink key={i} d={line(bx, R.y, bx, R.y + 16, {over: [0, 0], seed: `rodb${i}`})} width={5} color={CC.anchor} taper={false} at={at} />
      ))}
      <Fill d={d} color={CC.curtain} at={fillAt(at)} seed="curtain" />
      <Ink d={folds} width={W.far} color={CC.curtainShade} at={b(at, 0.04)} />
      <Ink d={d} width={W.mid} at={at} open={0.08} />
      <Ink d={[0, 1, 2, 3].map((i) => ellipse(C.x0 + 12 + i * 26, R.y + 2, 8, 9, {seed: `ring${i}`})).join('')} width={W.far} at={b(at, 0.04)} />
    </>
  );
};

const NookDesk: React.FC<{lampOn?: boolean; mic?: boolean; at?: At}> = ({lampOn = true, mic = true, at}) => {
  const D = NOOK.desk;
  const L = NOOK.lamp;
  return (
    <>
      {/* under the desk: the wall in shade, the radiator, a basket, cables */}
      <Fill rect={[D.legs[0] + 20, D.apron[1], D.legs[1] - D.legs[0] - 20, NOOK.floorY - D.apron[1]]} color={CC.wallDeep} offset={false} at={fillAt(at)} />
      <Fill rect={[560, 1374, 320, 132]} color={CC.radiator} at={fillAt(at)} seed="rad" />
      <Ink d={rect(560, 1374, 320, 132, {seed: 'radI', over: 'small'}) + Array.from({length: 12}, (_, i) => vline(560 + 26 * (i + 0.6), 1384, 1496, {over: [0, 0], seed: `rf${i}`})).join('')} width={W.hair} at={at} />
      <Ink d={vline(600, 1506, NOOK.floorY + 4, {over: [0, 0], seed: 'pipe'})} width={6} color={CC.radiator} taper={false} at={at} />
      <Ink d={smooth([[900, D.apron[1]], [880, 1430], [820, 1530], [760, 1552]])} width={4} color={CC.cableWarm} taper={false} at={b(at, 0.06)} />
      <Fill rect={[700, 1540, 110, 22]} color={CC.paper} at={fillAt(at)} seed="strip" />
      <Ink d={rect(700, 1540, 110, 22, {seed: 'stripI', over: [0, 0]})} width={W.far} at={at} />
      <Fill d={polyPath([[900, 1466], [990, 1466], [980, 1560], [910, 1560]])} color={CC.boxSide} at={fillAt(at)} seed="nbasket" />
      <Ink d={poly([[900, 1466], [990, 1466], [980, 1560], [910, 1560]], {closed: true, seed: 'nbasketI', over: 'small'}) + line(930, 1480, 934, 1550, {over: [0, 0], seed: 'nbw1'}) + line(960, 1480, 956, 1550, {over: [0, 0], seed: 'nbw2'})} width={W.far} at={at} />
      <Fill d={crown(935, 1462, 20, 16, {seed: 'nball', bumps: 8, round: 0.55})} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      {/* the lamp's light on the wall (between the sill and the desk) */}
      {lampOn ? <TableLamp x={L.x} y={L.y} h={104} glow={{rx: 200, ry: 110, dy: -10}} glowClip={[NOOK.window.sillY + NOOK.window.sillH, D.top]} pool={0} motes seed="nooklamp" at={at} /> : null}
      {/* the corkboard leaning on the wall, things on the desk */}
      <Corkboard x={624} y={1150} w={180} h={144} lean={6} seed="nookcork" at={at} />
      <Fill d={roundRect(306, 1240, 34, 56, 6)} color={CC.mugBand} at={fillAt(at)} seed="pencup" />
      <Ink d={line(314, 1240, 308, 1206, {over: [0, 0], seed: 'pc1'}) + line(324, 1240, 330, 1200, {over: [0, 0], seed: 'pc2'}) + line(332, 1240, 344, 1212, {over: [0, 0], seed: 'pc3'})} width={4} color={CC.anchor} taper={false} at={at} />
      <Ink d={roundRect(306, 1240, 34, 56, 6, {seed: 'pencupI'})} width={W.far} at={at} />
      {/* the desk itself */}
      <Fill rect={[D.x0, D.top, D.x1 - D.x0, D.apron[0] - D.top]} color={CC.desk} offset={false} at={fillAt(at)} />
      {lampOn ? <Fill d={blob(L.x - 10, (D.top + D.apron[0]) / 2, 190, 9, {seed: 'nookpool'})} color={CC.ring} offset={false} at={fillAt(at)} /> : null}
      <Fill rect={[D.x0, D.apron[0], D.x1 - D.x0, D.apron[1] - D.apron[0]]} color={CC.deskFront} offset={false} at={fillAt(at)} />
      {D.legs.map((lx, i) => (
        <Fill key={i} rect={[lx, D.apron[1], 20, NOOK.floorY + 8 - D.apron[1]]} color={CC.deskFront} seed={`nleg${i}`} at={fillAt(at)} />
      ))}
      <Ink d={hline(D.x0, D.x1, D.top, {seed: 'nd1', over: [6, 0]}) + hline(D.x0, D.x1, D.apron[0], {seed: 'nd2', over: [4, 0]}) + hline(D.x0, D.x1, D.apron[1], {seed: 'nd3', over: [0, 0]}) + vline(D.x0, D.top, D.apron[1], {seed: 'nd4', over: [0, 0]})} width={W.mid} at={at} />
      <Ink d={D.legs.map((lx, i) => vline(lx, D.apron[1], NOOK.floorY + 8, {over: [0, 0], seed: `nl${i}a`}) + vline(lx + 20, D.apron[1], NOOK.floorY + 8, {over: [0, 0], seed: `nl${i}b`})).join('') + rect(620, D.apron[0] + 7, 200, 22, {seed: 'ndrw', over: 'small'})} width={W.mid} at={at} />
      <Fill d={blob(720, D.apron[0] + 18, 9, 5, {seed: 'nknob'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      {/* on top, in front of the wall: the closed laptop under papers, books, the mug */}
      <Fill rect={[880, D.top - 12, 150, 12]} color={CC.laptop} at={fillAt(at)} seed="nlap" />
      <Ink d={rect(880, D.top - 12, 150, 12, {seed: 'nlapI', over: [0, 0]})} width={W.far} at={at} />
      <PaperStack x={890} y={D.top - 12} w={120} seed="npapers" at={at} />
      <BookPile x={1040} y={D.top} w={110} n={3} seed="ndeskbooks" at={at} />
      <NookMug x={676} top={D.top - 50} w={46} seed="nookmug" at={at} />
      {mic ? (
        <>
          <Ink d={smooth([[NOOK.mic.x + 16, D.top - 2], [NOOK.mic.x + 70, D.top + 2], [NOOK.mic.x + 92, D.apron[1] + 30], [NOOK.mic.x + 60, NOOK.floorY + 4]])} width={3.4} color={CC.cable} taper={false} at={b(at, 0.06)} />
          <Mic x={NOOK.mic.x} y={NOOK.mic.y} w={NOOK.mic.w} seed="nookmic" at={at} />
        </>
      ) : null}
      {/* a moth circling the lamp (O1's, the same home): a mover that never stops in the nook's holds */}
      {lampOn ? <LampMoth cx={L.x - 6} cy={L.y - 124} rx={66} ry={26} period={2.3} size={1.25} seed="nookmoth" at={at} /> : null}
    </>
  );
};

const Chair: React.FC<{at?: At}> = ({at}) => {
  const C = NOOK.chair;
  return (
    <>
      <Fill d={roundRect(C.x0, C.backTop - 10, 22, C.floor - C.backTop + 10, 8)} color={CC.chair} at={fillAt(at)} seed="chpost" />
      <Fill rect={[C.x1 - 18, C.seat, 18, C.floor - C.seat]} color={CC.chairShade} at={fillAt(at)} seed="chleg" />
      <Fill d={roundRect(C.x0 + 6, C.seat - 22, C.x1 - C.x0 - 6, 26, 10)} color={CC.scarf} at={fillAt(at)} seed="chcush" />
      <Fill rect={[C.x0, C.seat, C.x1 - C.x0, 16]} color={CC.chair} at={fillAt(at)} seed="chseat" />
      <Fill rect={[C.x0 + 18, 1530, C.x1 - C.x0 - 34, 10]} color={CC.chairShade} offset={false} at={fillAt(at)} />
      <Ink d={roundRect(C.x0, C.backTop - 10, 22, C.floor - C.backTop + 10, 8, {seed: 'chpI'}) + rect(C.x0, C.seat, C.x1 - C.x0, 16, {seed: 'chsI', over: 'small'}) + vline(C.x1 - 18, C.seat + 16, C.floor, {over: [0, 0], seed: 'chl1'}) + vline(C.x1, C.seat + 16, C.floor, {over: [0, 0], seed: 'chl2'})} width={W.mid} at={at} />
      <Ink d={roundRect(C.x0 + 6, C.seat - 22, C.x1 - C.x0 - 6, 26, 10, {seed: 'chcI'})} width={W.far} at={at} />
    </>
  );
};

const FloorAndRug: React.FC<{at?: At}> = ({at}) => {
  const y = NOOK.floorY;
  const R = NOOK.rug;
  const vp: Pt = [560, 1060];
  const boards = [-260, -60, 140, 340, 560, 780, 980, 1180, 1380].map((bx, i) => {
    const u = (y - vp[1]) / (2000 - vp[1]);
    const xTop = vp[0] + (bx - vp[0]) * u;
    return line(xTop, y, bx, 2000, {over: [0, 0], seed: `fb${i}`});
  });
  const inset = (q: Pt[], k: number): Pt[] => {
    const c: Pt = [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4];
    return q.map(([x, yy]) => [c[0] + (x - c[0]) * k, c[1] + (yy - c[1]) * k]);
  };
  const band = inset(R, 0.86);
  const inner = inset(R, 0.78);
  const stripes = [0.3, 0.5, 0.7].map((v, i) => {
    const l: Pt = [inner[0][0] + (inner[3][0] - inner[0][0]) * v, inner[0][1] + (inner[3][1] - inner[0][1]) * v];
    const r2: Pt = [inner[1][0] + (inner[2][0] - inner[1][0]) * v, inner[1][1] + (inner[2][1] - inner[1][1]) * v];
    return line(l[0], l[1], r2[0], r2[1], {over: [0, 0], seed: `rs${i}`});
  });
  return (
    <>
      <Fill rect={[-200, y, 1480, 600]} color={CC.floor} offset={false} at={fillAt(at)} />
      <Ink d={boards.join('')} width={W.hair} at={b(at, 0.04)} />
      <Fill rect={[-200, y - 16, 1480, 16]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Ink d={hline(-60, 1140, y - 16, {seed: 'bb1', over: [0, 0]}) + hline(-60, 1140, y, {seed: 'bb2', over: [0, 0]})} width={W.far} at={at} />
      <Fill d={polyPath(R)} color={CC.rug} at={fillAt(at)} seed="rug" />
      <Fill d={polyPath(band)} color={CC.rugBand} offset={false} at={fillAt(at, 0.02)} />
      <Fill d={polyPath(inner)} color={CC.rug} offset={false} at={fillAt(at, 0.03)} />
      <Ink d={stripes.join('')} width={7} color={CC.rugBand} taper={false} at={b(at, 0.04)} />
      <Ink d={poly(R, {closed: true, seed: 'rugI', over: 'small'})} width={W.mid} at={at} />
    </>
  );
};

/** A big leafy floor plant in a pot (pot centre x, floor y, height h). */
export const FloorPlant: React.FC<{x: number; y: number; h?: number; at?: At; seed?: string}> = ({x, y, h = 440, at, seed = 'fplant'}) => {
  const t = useTime();
  const r = rng(`fplant/${seed}`);
  const pw = h * 0.27;
  const ph = h * 0.27;
  const top = y - ph;
  const leaves: React.ReactNode[] = [];
  let ink = '';
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    const deg = -150 + 120 * u + r.jitter(10);
    const len = h * r.range(0.28, 0.42);
    const stemL = h * r.range(0.25, 0.55);
    const sw = swayAt(t, `${seed}/${i}`, 2.5, 0.21);
    const a = ((deg + sw) * Math.PI) / 180;
    const sx = x + Math.cos(a) * stemL;
    const sy = top + Math.sin(a) * stemL;
    ink += line(x, top + 6, sx, sy, {over: [0, 0], seed: `${seed}/s${i}`});
    const d = leafD(sx, sy, len, deg + sw * 2 + r.jitter(15), 0.5);
    leaves.push(<Fill key={i} d={d} color={i % 3 === 0 ? CC.leafDark : i % 3 === 1 ? CC.leaf : CC.leafLight} offset={false} at={fillAt(at, 0.04)} />);
    ink += d;
  }
  const pot: Pt[] = [[x - pw / 2, top], [x + pw / 2, top], [x + pw * 0.4, y], [x - pw * 0.4, y]];
  return (
    <>
      <Ink d={ink} width={W.far} at={b(at, 0.02)} open={0.12} />
      {leaves}
      <Fill d={polyPath(pot)} color={CC.pot} at={fillAt(at)} seed={`${seed}/pot`} />
      <Ink d={poly(pot, {closed: true, seed: `${seed}/potI`, over: 'small'}) + hline(x - pw / 2, x + pw / 2, top + ph * 0.16, {over: [0, 0], seed: `${seed}/rim`})} width={W.mid} at={at} />
    </>
  );
};

// ---------------------------------------------------------------- the room

export type NookRoomProps = {
  layout?: NookLayoutName;
  /** The town in the window (DuskTown props; default seed 'nooktown'). */
  town?: Partial<DuskTownProps>;
  /** The cat (Cat props in NOOK WORLD px; default: sitting on the sill, looking at her) or false. */
  cat?: Partial<CatProps> | false;
  lampOn?: boolean;
  mic?: boolean;
  /** Override the blind's bottom (world y). */
  blindY?: number;
  /** Draw the full-frame wall slab (default true). The LAST panel drops it while it un-builds (useExit() > 0), so the
   *  first panel's bare lines draw on in place under it (G5_BLOCKING section 8, the loop seam). */
  slab?: boolean;
  /** false = the curtain rod (world y 586) and the window recess's top line (600) are painted out with the wall they
   *  sit on (the zoomed layouts m12 / m14 put them right on the caption lines: a strike-through and an underline; the
   *  curtain itself is off-screen there). Default true. */
  rod?: boolean;
  /** A band-safe window top (world y, e.g. 746 in m14 = screen ~589): the wall runs down to it over the rod, the recess
   *  top and the blind (the clock stays whole), with a lintel line there, so the caption band is plain wall and the
   *  glass starts at its lower edge. Implies rod false. */
  bandTop?: number;
  at?: At;
  /** Drawn in nook-world px inside the room's matrix, after the chair and before the floor plant (her, the run-on). */
  children?: React.ReactNode;
};

/** The wall over the rod and the recess top (nook world px: x0, y, w, h): from the bookcase's side to past the right
 *  edge, the rod's top (586 - 24) to the glass top (lane L2's RodCover, folded back by the assembler). The last panel's
 *  loop seam clips this rect out of the room while it un-builds (P13 RodClip). */
export const nookRodCoverRect = (): [number, number, number, number] => {
  const R = NOOK.rod;
  const x0 = NOOK.bookcase.x1 + NOOK.bookcase.side + 2;
  return [x0, R.y - 24, 1400, NOOK.window.top - (R.y - 24) + 2.2];
};

const RodCover: React.FC<{at?: At}> = ({at}) => <Fill rect={nookRodCoverRect()} color={CC.wall} offset={false} at={fillAt(at)} />;

/** The band-safe window top (lane L2's BandCover14, folded back): wall from the rod's top down to `foot` over the
 *  window (and down to above the clock between the bookcase and the window), a lintel line at `foot`. */
const BandCover: React.FC<{foot: number; at?: At}> = ({foot, at}) => {
  const N = NOOK.window;
  const top = NOOK.rod.y - 24;
  const x0 = NOOK.bookcase.x1 + NOOK.bookcase.side + 2;
  const stripY = 632; // the clock's rim starts at world y 640
  const xs = N.x0 - 3;
  const d = `M${x0} ${top}H1400V${foot}H${xs}V${stripY}H${x0}Z`;
  return (
    <>
      <Fill d={d} color={CC.wall} offset={false} at={fillAt(at)} />
      <Ink d={`M${N.x0 - 2} ${foot}L${N.x1 + 2} ${foot}`} width={W.mid} at={at} />
    </>
  );
};

export const NookRoom: React.FC<NookRoomProps> = ({layout = 'wide', town, cat, lampOn = true, mic = true, blindY, slab = true, rod = true, bandTop, at, children}) => {
  const L = NOOK_LAYOUTS[layout];
  const M = nookMat(layout);
  const catP: Partial<CatProps> | false = cat === false ? false : {x: NOOK.catSpots.sill[0], y: NOOK.catSpots.sill[1], size: 116, pose: 'sit', facing: 'l', ...cat};
  return (
    <XG m={M}>
      <InkScale zoom={L.s}>
        {slab ? <Fill rect={[-400, -400, 2000, 2800]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
        <Soffit at={at} />
        <FramedPicture x={820} y={112} w={200} h={150} kind="hills" seed="toppic" at={at} />
        <Bookcase at={at} />
        <WallClock cx={NOOK.strip.x} cy={676} r={36} seed="nookclock" at={at} />
        <NookWindow blindY={blindY ?? L.blindY} town={town} at={at} />
        {catP && (catP.y ?? 0) <= NOOK.window.sillY + 2 ? <Cat x={catP.x ?? 640} y={catP.y ?? 1090} {...catP} at={at} seed={catP.seed ?? 'nookcat'} /> : null}
        <Curtain at={at} />
        <CoatOnHook x={NOOK.strip.x} y={792} len={430} seed="nookcoat" at={at} />
        <FloorAndRug at={at} />
        <NookDesk lampOn={lampOn} mic={mic} at={at} />
        <Chair at={at} />
        {catP && (catP.y ?? 0) > NOOK.window.sillY + 2 ? <Cat x={catP.x ?? 640} y={catP.y ?? 1640} {...catP} at={at} seed={catP.seed ?? 'nookcat'} /> : null}
        {bandTop !== undefined ? <BandCover foot={bandTop} at={at} /> : !rod ? <RodCover at={at} /> : null}
        {children}
        <FloorPlant x={1062} y={1560} h={340} seed="nookplant" at={at} />
      </InkScale>
    </XG>
  );
};

// ---------------------------------------------------------------- P5: over her shoulder at the desk (screen px)
// (lane L3's P5 set, folded back by the assembler: the mug off the lamp's line with thin warm steam, the near desk
// dressed with overlapping things and contact shadows, her phone face up with one notification)

/** P5's set (screen px, no figure): the wall, the window right (cut) onto the town, the high shelf and a hanging plant,
 *  the corkboard left (behind her head), a framed print over the laptop, the desk top seen from behind her (back edge
 *  y 980), the lamp right (its cable runs right, behind the desk's back edge), the golden pool (560, 1190), papers, a
 *  pen; the near desk: grain, a mug ring, a network printout under the notebook's corner, sticky notes, her phone FACE
 *  UP (`phoneOn`: a notification lights it once), a pencil cup, books, the desk's front lip and a drawer; the mug at
 *  CLOSE_MUG (front right of the pool) with thin warm steam. On top: the kit Laptop (530, 953, w 460, screen "ai"), her
 *  cat sitting in the pool (Cat sit at (792, 1246), size 168, look at the hub (530, 856)) and HerBack (x 120, 1600,
 *  h 1100, near the board's 110: her head, its lost profile and both shoulders in frame; its chair back crosses her
 *  waist). */
/** Her phone lying face up (top-left x, y; the geometry `g` per set): a warm screen; a notification lights it in
 *  [on0, on1) (lane L3's fix: the kit's navy slab read as a black box at phone size). */
type PhoneUpGeo = {w: number; h: number; r: number; sh: Pt; scr: [number, number, number, number, number]; note: [number, number, number, number]; l1: [number, number, number]; l2: [number, number, number]; dot: Pt; bar: Pt; seed: string};
export const PHONE_UP: Record<'close' | 'desk', PhoneUpGeo> = {
  close: {w: 100, h: 180, r: 18, sh: [8, 10], scr: [9, 14, 82, 152, 9], note: [16, 40, 68, 36], l1: [22, 49, 40], l2: [22, 62, 28], dot: [74, 54], bar: [34, 146], seed: 'p5phone'},
  desk: {w: 92, h: 150, r: 16, sh: [6, 8], scr: [8, 12, 76, 126, 8], note: [14, 34, 64, 32], l1: [20, 42, 38], l2: [20, 54, 26], dot: [68, 46], bar: [30, 120], seed: 'p6phone'},
};
export const PhoneUp: React.FC<{x: number; y: number; on: [number, number]; g: PhoneUpGeo; at?: At}> = ({x, y, on, g, at}) => {
  const t = useTime();
  const lit = t >= on[0] && t < on[1];
  return (
    <>
      <Fill d={roundRect(x + g.sh[0], y + g.sh[1], g.w, g.h, g.r)} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(x, y, g.w, g.h, g.r)} color={CC.anchor} seed={`${g.seed}B`} at={fillAt(at)} />
      <Ink d={roundRect(x, y, g.w, g.h, g.r, {seed: `${g.seed}I`})} width={W.mid} at={at} />
      <Live at={at} c={[x + g.w / 2, y + g.h / 2]}>
        <rect x={x + g.scr[0]} y={y + g.scr[1]} width={g.scr[2]} height={g.scr[3]} rx={g.scr[4]} fill={lit ? CC.core : CC.paperEdge} />
        {lit ? (
          <>
            <rect x={x + g.note[0]} y={y + g.note[1]} width={g.note[2]} height={g.note[3]} rx={6} fill={CC.paper} />
            <rect x={x + g.l1[0]} y={y + g.l1[1]} width={g.l1[2]} height={6} fill={CC.ink} />
            <rect x={x + g.l2[0]} y={y + g.l2[1]} width={g.l2[2]} height={6} fill={CC.ink} />
            <circle cx={x + g.dot[0]} cy={y + g.dot[1]} r={5} fill={CC.rug} />
          </>
        ) : (
          <rect x={x + g.bar[0]} y={y + g.bar[1]} width={32} height={5} rx={2} fill={CC.wallShade} />
        )}
      </Live>
    </>
  );
};

/** The mug (top-left x, top y, width): front right of the pool, right of her cat, clear of the lamp. */
export const CLOSE_MUG = {x: 878, top: 1302, w: 66};

/** A mug with thin warm steam (kit NookMug's body; the steam starts above the rim). */
const CloseMug: React.FC<{x: number; top: number; w: number; at?: At}> = ({x, top, w, at}) => {
  const x1 = x + w;
  const hgt = w * 1.06;
  const bot = top + hgt;
  const r = w * 0.18;
  const body = `M${x} ${top}L${x} ${bot - r}Q${x} ${bot} ${x + r} ${bot}L${x1 - r} ${bot}Q${x1} ${bot} ${x1} ${bot - r}L${x1} ${top}Z`;
  const handle = `M${x1 - 1} ${top + w * 0.2}C${x1 + w * 0.42} ${top + w * 0.18} ${x1 + w * 0.42} ${top + w * 0.78} ${x1 - 1} ${top + w * 0.74}`;
  return (
    <>
      <Fill d={blob(x + w / 2 + 8, bot + 2, w * 0.62, 9, {seed: 'p5mugsh'})} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Ink d={handle} width={Math.max(4, w * 0.15)} color={CC.ink} taper={false} at={at} />
      <Ink d={handle} width={Math.max(2, w * 0.08)} color={CC.mug} taper={false} at={at} />
      <Fill d={body} color={CC.mug} seed="p5mug/b" at={fillAt(at)} />
      <Fill rect={[x, top + hgt * 0.38, w, hgt * 0.17]} color={CC.mugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={body} width={W.far} at={at} />
      <Fill d={blob(x + w / 2, top, w / 2, Math.max(4, w * 0.12), {seed: 'p5mug/rim'})} color={CC.under} offset={false} at={fillAt(at, 0.03)} />
      <Steam x={x + w / 2} y={top - 14} h={86} amp={8} n={2} width={4.5} color={CC.deskFront} seed="p5mug/st" at={at} />
    </>
  );
};

/** A printout of the network diagram (the screen's echo), lying on the desk (a quad), its nodes and links in ink. */
const NetPrint: React.FC<{q: [Pt, Pt, Pt, Pt]; at?: At}> = ({q, at}) => {
  const P = (u: number, v: number): Pt => {
    const top: Pt = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
    const bot: Pt = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  const hub = P(0.5, 0.42);
  const ring: Pt[] = [[0.22, 0.2], [0.5, 0.12], [0.78, 0.22], [0.8, 0.62], [0.5, 0.72], [0.2, 0.6]].map(([u, v]) => P(u, v));
  let links = '';
  ring.forEach((p, i) => {
    const n = ring[(i + 1) % ring.length];
    links += line(hub[0], hub[1], p[0], p[1], {over: [0, 0], seed: `p5np/s${i}`}) + line(p[0], p[1], n[0], n[1], {over: [0, 0], seed: `p5np/r${i}`});
  });
  const shadow = q.map(([x, y]): Pt => [x + 6, y + 8]);
  return (
    <>
      <Fill d={polyPath(shadow)} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Fill d={polyPath(q)} color={CC.paper} seed="p5np" at={fillAt(at)} />
      <Ink d={poly(q, {closed: true, seed: 'p5npI', over: 'small'})} width={W.far} at={at} />
      <Ink d={links} width={W.hair + 0.4} at={b(at, 0.06)} />
      {ring.map(([x, y], i) => (
        <Fill key={i} d={blob(x, y, 9, 8, {seed: `p5np/n${i}`})} color={i % 2 ? CC.ring : CC.mugBand} offset={false} at={fillAt(at, 0.04)} />
      ))}
      <Fill d={blob(hub[0], hub[1], 17, 15, {seed: 'p5np/hub'})} color={CC.mugBand} offset={false} at={fillAt(at, 0.04)} />
      <Ink d={ring.map(([x, y], i) => ellipse(x, y, 9, 8, {seed: `p5np/nI${i}`})).join('') + ellipse(hub[0], hub[1], 17, 15, {seed: 'p5np/hubI'})} width={W.hair + 0.4} at={b(at, 0.08)} />
      <Ink d={textLines(q[3][0] + 18, q[3][1] - 34, 120, {n: 2, gap: 14, seed: 'p5np/t', heading: false})} width={W.hair} at={b(at, 0.1)} />
    </>
  );
};

/** A pencil cup (bottom centre x, y) with pencils and a ruler. */
const PencilCup: React.FC<{x: number; y: number; at?: At}> = ({x, y, at}) => {
  const w = 62;
  const h = 84;
  const sticks: [number, number, string][] = [[-16, -150, CC.pictures[0]], [-2, -164, CC.anchor], [12, -140, CC.pictures[3]], [20, -128, CC.pictures[1]]];
  return (
    <>
      <Fill d={blob(x + 10, y + 2, w * 0.6, 8, {seed: 'p5cupsh'})} color={CC.deskShade} offset={false} at={fillAt(at)} />
      {sticks.map(([dx, top, c], i) => (
        <Ink key={i} d={line(x + dx * 0.6, y - h + 10, x + dx, y + top, {over: [0, 0], seed: `p5cup/s${i}`})} width={9} color={c} taper={false} at={at} />
      ))}
      <Fill d={roundRect(x - w / 2, y - h, w, h, 8)} color={CC.rug} seed="p5cup" at={fillAt(at)} />
      <Fill rect={[x - w / 2, y - h * 0.62, w, h * 0.16]} color={CC.rugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={roundRect(x - w / 2, y - h, w, h, 8, {seed: 'p5cupI'}) + ellipse(x, y - h, w / 2, 7, {seed: 'p5cupR'})} width={W.far} at={at} />
    </>
  );
};

export const NookDeskClose: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; phoneOn?: [number, number]; children?: React.ReactNode}> = ({town, slab = true, at, phoneOn = [0.55, 1.1], children}) => (
  <>
    {slab ? <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
    {/* the window right, cut by the right edge; the blind down to 640 (the caption band stays wall) */}
    <Fill rect={[684, 560, 500, 400]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Fill rect={[700, 600, 480, 344]} color={CC.trim} offset={false} at={fillAt(at)} />
    <DuskTown x={712} y={612} w={460} h={320} horizon={800} k={1.25} moon={[1010, 690]} stars={4} clouds={2} seed="p5town" {...town} at={at} />
    <Fill rect={[706, 604, 480, 52]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
    <Fill rect={[704, 650, 480, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
    <Fill rect={[936, 660, 14, 272]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
    <Ink d={vline(684, 560, 944, {over: [0, 0], seed: 'p5r'}) + vline(712, 612, 932, {over: [0, 0], seed: 'p5g'}) + vline(936, 660, 932, {over: [0, 0], seed: 'p5m1'}) + vline(950, 660, 932, {over: [0, 0], seed: 'p5m2'}) + hline(704, 1184, 660, {over: [0, 0], seed: 'p5b'})} width={W.mid} at={at} />
    <Fill rect={[672, 932, 520, 14]} color={CC.sill} offset={false} at={fillAt(at)} />
    <Fill rect={[672, 946, 520, 14]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Ink d={hline(672, 1190, 932, {over: [4, 0], seed: 'p5s1'}) + hline(672, 1190, 960, {over: [0, 0], seed: 'p5s2'})} width={W.mid} at={at} />
    <PotPlant x={1000} y={892} w={50} h={40} kind="succulent" seed="p5sill" at={at} />
    {/* the top edge: the home's high shelf (above the caption band), a trailing plant hanging right */}
    <HighShelf x0={-40} x1={660} y={250} seed="p5hs" at={at} />
    {/* (finisher: moved right from x 880, clear of the engine's name super, which sat on it in the cold read) */}
    <Sway x={990} y={-20} amp={1.6} hz={0.17} seed="p5hang">
      <Ink d={line(990, -20, 974, 200, {over: [0, 0], seed: 'p5h1'}) + line(990, -20, 1006, 200, {over: [0, 0], seed: 'p5h2'})} width={W.hair} at={at} />
      <PotPlant x={964} y={200} w={54} h={36} kind="trailing" seed="p5hangpot" at={at} />
    </Sway>
    {/* the wall left and centre: corkboard (behind her head), a print over the laptop */}
    <Corkboard x={34} y={640} w={300} h={230} seed="p5cork" at={at} />
    <FramedPicture x={432} y={622} w={150} h={116} kind="shapes" seed="p5pic" at={at} />
    {/* the desk top seen from behind her: back edge 980, the lamp's pool */}
    <Fill rect={[-200, 980, 1480, 1200]} color={CC.desk} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 1140, 980, {seed: 'p5dk', over: [0, 0]})} width={W.mid} at={at} />
    <Fill d={blob(560, 1190, 400, 170, {seed: 'p5pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
    <Fill d={blob(552, 1186, 256, 108, {seed: 'p5pool2', wobble: 0.025})} color={CC.core} offset={false} at={fillAt(at)} />
    <Ink d={line(40, 1420, 260, 1426, {over: [0, 0], seed: 'p5g1'}) + line(780, 1500, 1000, 1506, {over: [0, 0], seed: 'p5g2'}) + line(860, 1080, 1060, 1083, {over: [0, 0], seed: 'p5g3'})} width={W.hair} at={at} />
    {/* the lamp's cable: from its base to the right, behind the desk's back edge (never near the mug) */}
    <Ink d={smooth([[930, 998], [990, 1008], [1060, 1000], [1120, 992]])} width={5} color={CC.cableWarm} taper={false} at={b(at, 0.06)} />
    <TableLamp x={900} y={1000} h={190} glow={false} pool={0} seed="p5lamp" at={at} />
    <DustMotes cx={600} cy={1090} rx={320} ry={150} n={10} seed="p5motes" at={at} />
    <Fill d={polyPath([[600, 1240], [860, 1226], [880, 1330], [612, 1346]])} color={CC.paper} at={fillAt(at)} seed="p5paper" />
    <Ink d={poly([[600, 1240], [860, 1226], [880, 1330], [612, 1346]], {closed: true, seed: 'p5paperI', over: 'small'}) + textLines(630, 1262, 200, {n: 3, gap: 22, seed: 'p5pl', heading: false})} width={W.far} at={at} />
    <Ink d={line(250, 1300, 420, 1340, {over: [0, 0], seed: 'p5pen'})} width={14} color={CC.anchor} taper={false} at={at} />
    {/* the near desk: grain, a mug ring, the network printout under the notebook's corner, the notebook, sticky notes,
        her phone face up, a pencil cup, books; the desk's front lip and a drawer along the bottom */}
    <Ink d={[1060, 1130, 1210, 1290, 1380, 1480, 1640, 1760].map((y, i) => smooth([[-40 + i * 30, y], [300, y + 6 * Math.sin(i)], [700, y - 4], [1120, y + 5]])).join('')} width={W.hair} color={CC.deskShade} at={at} />
    <Ink d={ellipse(700, 1392, 34, 13, {seed: 'p5ring'})} width={4} color={CC.deskShade} taper={false} at={at} />
    <NetPrint q={[[540, 1586], [790, 1572], [806, 1786], [552, 1800]]} at={at} />
    <Fill d={polyPath([[338, 1438], [618, 1438], [614, 1616], [342, 1620]])} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <Fill d={polyPath([[330, 1430], [470, 1424], [478, 1600], [334, 1606]])} color={CC.paper} at={fillAt(at)} seed="p5nb1" />
    <Fill d={polyPath([[470, 1424], [612, 1430], [606, 1606], [478, 1600]])} color={CC.paper} at={fillAt(at)} seed="p5nb2" />
    <Ink d={poly([[330, 1430], [470, 1424], [478, 1600], [334, 1606]], {closed: true, seed: 'p5nbI1', over: 'small'}) + poly([[470, 1424], [612, 1430], [606, 1606], [478, 1600]], {closed: true, seed: 'p5nbI2', over: 'small'}) + textLines(350, 1458, 110, {n: 5, gap: 26, seed: 'p5nbt1', heading: false}) + textLines(492, 1458, 100, {n: 4, gap: 26, seed: 'p5nbt2', heading: false})} width={W.far} at={at} />
    <Fill d={polyPath([[652, 1444], [740, 1436], [746, 1518], [658, 1526]])} color={CC.note3} at={fillAt(at)} seed="p5st1" />
    <Fill d={polyPath([[700, 1500], [784, 1506], [778, 1586], [694, 1580]])} color={CC.note2} at={fillAt(at)} seed="p5st2" />
    <Ink d={poly([[652, 1444], [740, 1436], [746, 1518], [658, 1526]], {closed: true, seed: 'p5stI1', over: [0, 0]}) + poly([[700, 1500], [784, 1506], [778, 1586], [694, 1580]], {closed: true, seed: 'p5stI2', over: [0, 0]}) + textLines(668, 1470, 60, {n: 2, gap: 20, seed: 'p5stt', heading: false})} width={W.far} at={at} />
    <PhoneUp x={800} y={1600} on={phoneOn} g={PHONE_UP.close} at={at} />
    <PencilCup x={900} y={1556} at={at} />
    <Fill rect={[938, 1766, 170, 10]} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <BookPile x={930} y={1760} w={170} n={3} seed="p5books" at={at} />
    <Fill rect={[-200, 1852, 1480, 120]} color={CC.deskFront} offset={false} at={fillAt(at)} />
    <Fill rect={[-200, 1852, 1480, 12]} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 1140, 1852, {seed: 'p5lip', over: [0, 0]}) + hline(-60, 1140, 1864, {seed: 'p5lip2', over: [0, 0]}) + roundRect(400, 1878, 380, 60, 6, {seed: 'p5drw'})} width={W.mid} at={at} />
    <Fill d={roundRect(560, 1896, 60, 12, 6)} color={CC.anchor} offset={false} at={fillAt(at)} />
    <CloseMug x={CLOSE_MUG.x} top={CLOSE_MUG.top} w={CLOSE_MUG.w} at={at} />
    {children}
  </>
);

// ---------------------------------------------------------------- P6: the new angle, 3/4 front, the window behind her
// (lane L3's P6 set, folded back by the assembler: the lamp beside the mic, wall between its shade and her; no desk
// succulent; her phone face up with one notification; a `cat` slot before the big floor plant)

/** P6's set (screen px): the back wall (the bookcase cut by the left edge, the window behind her: glass 560..1080 x
 *  640..1130, cut right, mullion 900, a candle on the sill; two prints and the clock between, clear of the bubble at
 *  120..520 x 650..914; the radiator under the window right of her, her chair's back behind her shoulder), the floor
 *  under the desk (boards, the rug's edge, a wicker bin), then `behind` (HER BODY: <HerSeated part="body" legs/>: the
 *  desk hides her waist, her shins show under it), then the desk running the FULL width in front of her (back edge
 *  y 1440, front edge 1640, apron and drawers to 1688, legs to the floor) with the lamp at ANGLE_LAMP beside the mic
 *  (its warm glow on the wall drawn first) and its pool, a mug, books, papers, a pen, her phone face up (`phoneOn`: a
 *  notification lights it once), a standing photo, a paper stack; then `cat` (her cat on the desk's right end: Cat sit
 *  at (878, 1486), size 158, as in P5) and the big floor plant in the right foreground (the cat partly behind its
 *  leaves); `children` last (screen px: the mic (260, 1452, w 120), her arms <HerSeated part="arms"/>; the bubble goes
 *  after the set). */
export const NOOK_ANGLE = {deskBack: 1440, deskFront: 1640, apron: 1688, floor: 1688, her: {x: 640, y: 1960, h: 1100}, mic: {x: 260, y: 1452, w: 120}, sill: 1130};

/** The lamp beside the mic (screen px; base on the desk's back edge). */
export const ANGLE_LAMP = {x: 165, h: 132};

export const NookAngle: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; behind?: React.ReactNode; cat?: React.ReactNode; phoneOn?: [number, number]; children?: React.ReactNode}> = ({town, slab = true, at, behind, cat, phoneOn = [3.0, 3.55], children}) => {
  const A = NOOK_ANGLE;
  const vp: Pt = [520, 1300];
  const boards = [-400, -160, 80, 320, 560, 800, 1040, 1280, 1520].map((bx, i) => {
    const u = (A.floor - vp[1]) / (2000 - vp[1]);
    return line(vp[0] + (bx - vp[0]) * u, A.floor, bx, 2000, {over: [0, 0], seed: `p6fb${i}`});
  });
  const rug: Pt[] = [[-60, 1800], [900, 1786], [1000, 2000], [-60, 2000]];
  const L = ANGLE_LAMP;
  return (
    <>
      {slab ? <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
      {/* the lamp's warm light on the wall first (the lamp itself stands on the desk, beside the mic) */}
      <TableLamp x={L.x} y={A.deskBack + 12} h={L.h} glow={{rx: 200, ry: 124, dy: -18}} glowClip={[1160, A.deskBack]} pool={0} motes seed="p6lampglow" at={at} />
      {/* window */}
      <Fill rect={[535, 618, 600, 512]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Fill rect={[552, 632, 600, 498]} color={CC.trim} offset={false} at={fillAt(at)} />
      <DuskTown x={560} y={640} w={560} h={490} horizon={905} k={1.12} moon={[860, 740]} seed="p6town" {...town} at={at} />
      <Fill rect={[556, 636, 560, 54]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
      <Fill rect={[556, 690, 560, 8]} color={CC.winDark} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[554, 684, 560, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[893, 698, 14, 432]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={vline(535, 618, 1130, {over: [0, 0], seed: 'p6r'}) + vline(560, 640, 1130, {over: [0, 0], seed: 'p6g'}) + vline(893, 698, 1130, {over: [0, 0], seed: 'p6m1'}) + vline(907, 698, 1130, {over: [0, 0], seed: 'p6m2'}) + hline(535, 1140, 618, {over: [0, 0], seed: 'p6t'}) + hline(554, 1140, 694, {over: [0, 0], seed: 'p6b'})} width={W.mid} at={at} />
      <Fill rect={[523, 1130, 600, 12]} color={CC.sill} offset={false} at={fillAt(at)} />
      <Fill rect={[523, 1142, 600, 14]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Ink d={hline(523, 1140, 1130, {over: [4, 0], seed: 'p6s1'}) + hline(523, 1140, 1156, {over: [0, 0], seed: 'p6s2'})} width={W.mid} at={at} />
      <Fill d={roundRect(1010, 1090, 36, 40, 6)} color={CC.candle} at={fillAt(at)} seed="p6candle" />
      <Ink d={roundRect(1010, 1090, 36, 40, 6, {seed: 'p6candleI'})} width={W.far} at={at} />
      <CandleFlame x={1028} y={1088} h={22} seed="p6flame" at={at} />
      {/* the radiator under the window (right of her), its pipe */}
      <Fill rect={[770, 1196, 300, 232]} color={CC.radiator} at={fillAt(at)} seed="p6rad" />
      <Ink d={rect(770, 1196, 300, 232, {seed: 'p6radI', over: 'small'}) + Array.from({length: 11}, (_, i) => vline(770 + 27 * (i + 0.6), 1210, 1414, {over: [0, 0], seed: `p6rf${i}`})).join('')} width={W.far} at={at} />
      <Ink d={vline(1050, 1428, 1446, {over: [0, 0], seed: 'p6pipe'})} width={8} color={CC.radiator} taper={false} at={at} />
      {/* bookcase */}
      <Fill rect={[-200, 640, 340, 900]} color={CC.caseBack} offset={false} at={fillAt(at)} />
      <Books dark={NOOK_DARK} x0={-190} x1={118} base={826} hMin={120} hMax={170} seed="p6b1" at={at} />
      <Books dark={NOOK_DARK} x0={-190} x1={60} base={1016} hMin={110} hMax={160} seed="p6b2" at={at} />
      <Books dark={NOOK_DARK} x0={-190} x1={118} base={1206} hMin={120} hMax={160} seed="p6b3" at={at} />
      <Books dark={NOOK_DARK} x0={-190} x1={118} base={1396} hMin={110} hMax={150} seed="p6b4" at={at} />
      <PotPlant x={70} y={970} w={46} h={44} kind="leafy" seed="p6caseplant" at={at} />
      {[640, 826, 1016, 1206, 1396].map((y, i) => (
        <Fill key={i} rect={[-200, y, 340, 16]} color={CC.shelf} seed={`p6bb${i}`} at={fillAt(at)} />
      ))}
      <Fill rect={[118, 636, 22, 904]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Ink d={[640, 826, 1016, 1206, 1396].map((y, i) => hline(-60, 118, y, {seed: `p6bl${i}`, over: [0, 0]}) + hline(-60, 118, y + 16, {seed: `p6bm${i}`, over: [0, 0]})).join('') + vline(118, 636, 1540, {over: [0, 0], seed: 'p6u1'}) + vline(140, 636, 1540, {over: [0, 0], seed: 'p6u2'})} width={W.mid} at={at} />
      {/* the top edge: the home's high shelf, a print over the window (cut right), a trailing plant hanging */}
      <HighShelf x0={-40} x1={520} y={250} seed="p6hs" at={at} />
      <FramedPicture x={720} y={96} w={260} h={170} kind="hills" seed="p6toppic" at={at} />
      <Sway x={620} y={-20} amp={2.4} hz={0.17} seed="p6hang">
        <Ink d={line(620, -20, 604, 196, {over: [0, 0], seed: 'p6h1'}) + line(620, -20, 636, 196, {over: [0, 0], seed: 'p6h2'})} width={W.hair} at={at} />
        <PotPlant x={594} y={196} w={54} h={36} kind="trailing" seed="p6hangpot" at={at} />
      </Sway>
      {/* the wall between: prints and the clock, under the bubble's place */}
      <FramedPicture x={190} y={968} w={128} h={160} kind="hills" seed="p6pic1" at={at} />
      <FramedPicture x={346} y={1002} w={110} h={90} kind="portrait" seed="p6pic2" at={at} />
      <WallClock cx={398} cy={1180} r={40} seed="p6clock" at={at} />
      {/* her chair's back behind her shoulder (her body covers most of it) */}
      <Fill d={roundRect(690, 1306, 120, 34, 14)} color={CC.chair} at={fillAt(at)} seed="p6chairT" />
      <Fill rect={[776, 1336, 24, 110]} color={CC.chairShade} offset={false} at={fillAt(at)} />
      <Ink d={roundRect(690, 1306, 120, 34, 14, {seed: 'p6chairTI'}) + vline(776, 1340, 1440, {over: [0, 0], seed: 'p6chp1'}) + vline(800, 1340, 1440, {over: [0, 0], seed: 'p6chp2'})} width={W.mid} at={at} />
      {/* the floor under the desk: boards, the rug's edge, a wicker bin */}
      <Fill rect={[-200, A.floor, 1480, 400]} color={CC.floor} offset={false} at={fillAt(at)} />
      <Ink d={boards.join('')} width={W.hair} at={b(at, 0.04)} />
      <Fill d={polyPath(rug)} color={CC.rug} at={fillAt(at)} seed="p6rug" />
      <Ink d={hline(-60, 900, 1830, {over: [0, 0], seed: 'p6rugb'})} width={8} color={CC.rugBand} taper={false} at={b(at, 0.04)} />
      <Ink d={poly(rug, {closed: false, seed: 'p6rugI', over: [0, 0]})} width={W.mid} at={at} />
      <Fill rect={[-200, A.floor, 1480, 40]} color={CC.under} offset={false} at={fillAt(at)} />
      <Fill d={polyPath([[760, 1740], [880, 1740], [866, 1900], [774, 1900]])} color={CC.boxSide} at={fillAt(at)} seed="p6bin" />
      <Ink d={poly([[760, 1740], [880, 1740], [866, 1900], [774, 1900]], {closed: true, seed: 'p6binI', over: 'small'}) + line(800, 1750, 804, 1890, {over: [0, 0], seed: 'p6bw1'}) + line(840, 1750, 836, 1890, {over: [0, 0], seed: 'p6bw2'}) + hline(764, 876, 1790, {over: [0, 0], seed: 'p6bw3'})} width={W.far} at={at} />
      <Fill d={crown(820, 1736, 40, 18, {seed: 'p6ball', bumps: 8, round: 0.55})} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      {/* HER body (behind the desk: it hides her waist; her shins show under it) */}
      {behind}
      {/* the desk, full width, in front of her: top, apron with drawers, legs */}
      <Fill rect={[-200, A.deskBack, 1480, A.deskFront - A.deskBack]} color={CC.desk} offset={false} at={fillAt(at)} />
      <Fill d={blob(236, 1540, 290, 60, {seed: 'p6pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
      <Fill d={blob(210, 1530, 170, 34, {seed: 'p6pool2', wobble: 0.02})} color={CC.core} offset={false} at={fillAt(at)} />
      <Ink d={[1490, 1560, 1610].map((y) => smooth([[-40, y], [300, y + 4], [700, y - 3], [1120, y + 4]])).join('')} width={W.hair} color={CC.deskShade} at={at} />
      <Fill rect={[-200, A.deskFront, 1480, A.apron - A.deskFront]} color={CC.deskFront} offset={false} at={fillAt(at)} />
      {[[10, 36], [1004, 1030]].map(([l0, l1], i) => (
        <Fill key={`lg${i}`} rect={[l0, A.apron, l1 - l0, 300]} color={CC.deskFront} seed={`p6leg${i}`} at={fillAt(at)} />
      ))}
      <Ink d={hline(-60, 1140, A.deskBack, {seed: 'p6dk', over: [0, 0]}) + hline(-60, 1140, A.deskFront, {seed: 'p6dkf', over: [0, 0]}) + hline(-60, 1140, A.apron, {seed: 'p6dka', over: [0, 0]}) + rect(200, A.deskFront + 8, 280, 32, {seed: 'p6drw1', over: 'small'}) + rect(620, A.deskFront + 8, 280, 32, {seed: 'p6drw2', over: 'small'}) + [10, 36, 1004, 1030].map((lx, i) => vline(lx, A.apron, 1960, {over: [0, 0], seed: `p6lgI${i}`})).join('')} width={W.mid} at={at} />
      <Fill d={blob(340, A.deskFront + 24, 10, 6, {seed: 'p6knob1'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      <Fill d={blob(760, A.deskFront + 24, 10, 6, {seed: 'p6knob2'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      {/* on the desk: the lamp (beside the mic), a mug, books, papers, a pen, her phone face up, a standing photo, a stack */}
      <TableLamp x={L.x} y={A.deskBack + 12} h={L.h} glow={false} pool={0} motes={false} seed="p6lamp" at={at} />
      {/* a moth circling the lamp (O1's, the same home), clear of the mic's head and the bubble */}
      <LampMoth cx={150} cy={A.deskBack + 6 - L.h} rx={70} ry={28} period={2.2} size={1.25} seed="p6moth" at={at} />
      <NookMug x={18} top={1468} w={70} seed="p6mug" at={at} />
      <BookPile x={-20} y={1636} w={200} n={3} seed="p6deskbooks" at={at} />
      <Fill d={polyPath([[300, 1552], [520, 1542], [530, 1630], [306, 1640]])} color={CC.paper} at={fillAt(at)} seed="p6paper" />
      <Ink d={poly([[300, 1552], [520, 1542], [530, 1630], [306, 1640]], {closed: true, seed: 'p6paperI', over: 'small'}) + textLines(322, 1570, 170, {n: 3, gap: 20, seed: 'p6pl', heading: false})} width={W.far} at={at} />
      <Fill d={polyPath([[600, 1560], [770, 1552], [778, 1626], [606, 1634]])} color={CC.note2} at={fillAt(at)} seed="p6note" />
      <Ink d={poly([[600, 1560], [770, 1552], [778, 1626], [606, 1634]], {closed: true, seed: 'p6noteI', over: 'small'}) + textLines(620, 1578, 120, {n: 2, gap: 20, seed: 'p6nl', heading: false})} width={W.far} at={at} />
      <Ink d={line(220, 1612, 380, 1596, {over: [0, 0], seed: 'p6pen'})} width={12} color={CC.anchor} taper={false} at={at} />
      <PhoneUp x={850} y={1520} on={phoneOn} g={PHONE_UP.desk} at={at} />
      <FramedPicture x={930} y={1330} w={104} h={118} kind="sea" seed="p6deskphoto" at={at} />
      <PaperStack x={960} y={1610} w={150} seed="p6stack" at={at} />
      {/* her cat on the desk's right end (partly behind the floor plant) */}
      {cat}
      {/* the big floor plant in the right foreground (in front of the desk's end: the right rail is UI anyway) */}
      <FloorPlant x={1150} y={1960} h={560} seed="p6floorplant" at={at} />
      {children}
    </>
  );
};

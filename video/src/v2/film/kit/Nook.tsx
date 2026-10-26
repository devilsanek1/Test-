// kit/Nook.tsx: HER HOME BASE, the nook (P2, P4, P13; P5 and P6 are the same home from closer / another angle). One
// dense, lived-in room (owner, 2026-10-26: a room full of real things, layered depth, ambient life that never stops):
// a soffit with a hanging plant, a full bookcase cut by the left edge, a wall clock, her coat and scarf on a hook, a
// framed print, the landscape window (660 x 470, ONE mullion, sill, a roller blind) onto the living dusk town (kit/Town),
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
// world y 760 (P4) / 690 (P2, P13), so only flat wall and blind fabric reach into the band.
//   <NookDeskClose>  P5: over her shoulder at the desk (laptop on the desk, the window right, the lamp, the pool)
//   <NookAngle>      P6: the new angle, 3/4 front: the window behind her (cut right), the bookcase left, the desk left

import React, {useId} from 'react';
import {blob, crown, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth, textLines, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {CC} from '../palette';
import {applyM, At, b, Fill, fillAt, Ink, Pt, W} from './util';
import {CandleFlame, DustMotes, leafD, Steam, Sway, swayAt, WallClock} from './Ambient';
import {DuskTown, DuskTownProps} from './Town';
import {Books} from './Desk';
import {Mic} from './Props';
import {Cat, CatProps} from './Cat';

// ---------------------------------------------------------------- layouts

export type NookLayoutName = 'wide' | 'm12' | 'm14';
export const NOOK_LAYOUTS: Record<NookLayoutName, {s: number; fx: number; fy: number; blindY: number; panel: string}> = {
  wide: {s: 1, fx: 540, fy: 960, blindY: 690, panel: 'P2'},
  m12: {s: 1.2, fx: 164, fy: 957, blindY: 690, panel: 'P13'},
  m14: {s: 1.4, fx: 254, fy: 1139.5, blindY: 760, panel: 'P4'},
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
  highShelf: {x1: 770, y: 250},
  bookcase: {x0: -170, x1: 152, side: 22, top: 600, boards: [600, 790, 980, 1170, 1360], bottom: 1540},
  strip: {x: 218}, // the wall strip between the bookcase and the window (clock, coat hook)
  window: {x0: 265, x1: 975, top: 600, glass: [290, 620, 660, 470] as [number, number, number, number], mullion: 740, sillY: 1090, sillH: 28},
  curtain: {x0: 990, x1: 1110, top: 600, bottom: 1546},
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
      <Steam x={x + w / 2} y={top - 4} h={w * 1.7} amp={w * 0.12} seed={`${seed}/st`} at={at} />
    </>
  );
};

/** Books lying flat, a pile (left x, base y, width w, n books). */
export const BookPile: React.FC<{x: number; y: number; w: number; n?: number; at?: At; seed?: string}> = ({x, y, w, n = 3, at, seed = 'pile'}) => {
  const r = rng(`bpile/${seed}`);
  let yy = y;
  const out: React.ReactNode[] = [];
  let ink = '';
  for (let i = 0; i < n; i++) {
    const h = w * r.range(0.12, 0.18);
    const ww = w * r.range(0.82, 1);
    const xx = x + r.jitter(w * 0.06);
    yy -= h;
    out.push(<Fill key={i} rect={[xx, yy, ww, h]} color={i % 3 === 2 ? CC.anchor : r.pick(CC.books)} seed={`${seed}/${i}`} at={fillAt(at)} />);
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
      items.push(<Books key={k} x0={x} x1={Math.min(x1 - 20, x + w)} base={y} hMin={64} hMax={92} seed={`${seed}/b${k}`} at={at} />);
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

const Soffit: React.FC<{at?: At}> = ({at}) => {
  const {x1, y} = NOOK.soffit;
  const sh = NOOK.highShelf;
  return (
    <>
      <Fill rect={[-200, -200, x1 + 200, y + 200]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Fill rect={[-200, y, x1 + 200, 10]} color={CC.wallDeep} offset={false} at={fillAt(at)} />
      <Ink d={hline(-60, x1, y, {seed: 'sof1', over: [0, 8]}) + vline(x1, -60, y, {seed: 'sof2', over: [0, 4]})} width={W.mid} at={at} />
      {/* a long high shelf under the soffit, full of things (above the caption band: y < 290) */}
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
      <Books x0={B.x0 - 30} x1={54} base={shelves[0].base} hMin={130} hMax={168} seed="nk1" at={at} />
      <Books x0={B.x0 - 30} x1={B.x1 - 8} base={shelves[1].base} hMin={120} hMax={170} seed="nk2" at={at} />
      <Books x0={88} x1={B.x1 - 6} base={shelves[2].base} hMin={110} hMax={150} seed="nk3" at={at} />
      <Books x0={B.x0 - 30} x1={58} base={shelves[3].base} hMin={120} hMax={160} seed="nk4" at={at} />
      <Books x0={B.x0 - 30} x1={B.x1 - 10} base={B.bottom - 2} hMin={110} hMax={150} seed="nk5" at={at} />
      <Books x0={B.x0 - 30} x1={40} base={shelves[2].base} hMin={110} hMax={150} seed="nk6" at={at} />
      {extras}
      {B.boards.map((y, i) => (
        <Fill key={i} rect={[B.x0 - 40, y, B.x1 - B.x0 + 40, 16]} color={CC.shelf} seed={`nkb${i}`} at={fillAt(at)} />
      ))}
      <Fill rect={[B.x1, B.top - 4, B.side, B.bottom - B.top + 4]} color={CC.shelf} offset={false} at={fillAt(at)} />
      <Ink d={boards} width={W.mid} at={at} />
      <Ink d={vline(B.x1, B.top - 4, B.bottom, {over: [0, 0], seed: 'nku1'}) + vline(B.x1 + B.side, B.top - 4, B.bottom, {over: [0, 0], seed: 'nku2'}) + hline(B.x0 - 40, B.x1 + B.side, B.top - 4, {seed: 'nkt', over: [0, 0]})} width={W.mid} at={at} />
      {/* on top (only small things: the caption band ends at 600) */}
      <BookPile x={-20} y={B.top - 4} w={110} n={2} seed="nktop" at={at} />
      <PotPlant x={100} y={B.top - 34} w={40} h={30} kind="succulent" seed="nktopplant" at={at} />
      {void r}
    </>
  );
};

const NookWindow: React.FC<{blindY: number; town?: Partial<DuskTownProps>; at?: At}> = ({blindY, town, at}) => {
  const t = useTime();
  const N = NOOK.window;
  const [gx, gy, gw, gh] = N.glass;
  const cordSw = swayAt(t, 'cord', 2.4, 0.4);
  return (
    <>
      <Fill rect={[N.x0, N.top, N.x1 - N.x0, N.sillY - N.top]} color={CC.wallShade} offset={false} at={fillAt(at)} />
      <Fill rect={[gx - 10, gy - 10, gw + 20, gh + 10]} color={CC.trim} offset={false} at={fillAt(at)} />
      <DuskTown x={gx} y={gy} w={gw} h={gh} horizon={gy + gh * 0.55} moon={[gx + gw * 0.8, blindY + 46]} {...town} seed={town?.seed ?? 'nooktown'} at={at} />
      {/* the roller blind (fabric down to blindY, its bar, the cord) */}
      <Fill rect={[gx - 6, gy - 8, gw + 12, blindY - gy + 8]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
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
  const s1 = swayAt(t, 'cur1', 5, 0.19);
  const s2 = swayAt(t, 'cur2', 3, 0.27);
  const d = smooth([[C.x0 + 6, C.top], [C.x0 - 4, C.top + 300], [C.x0 + 4 + s2 * 0.4, C.top + 640], [C.x0 - 6 + s1, C.bottom], [C.x1 + 40, C.bottom + 4], [C.x1 + 40, C.top]], {closed: true, tension: 0.35});
  const folds = [28, 58, 90].map((dx, i) => smooth([[C.x0 + dx, C.top + 10], [C.x0 + dx + (i % 2 ? 4 : -4), C.top + 400], [C.x0 + dx + s1 * 0.8 + (i - 1) * 4, C.bottom - 6]])).join('');
  return (
    <>
      <Ink d={hline(952, 1130, C.top - 4, {over: [0, 0], seed: 'rod'})} width={7} color={CC.anchor} taper={false} at={at} />
      <Fill d={blob(950, C.top - 4, 9, 9, {seed: 'finial'})} color={CC.anchor} offset={false} at={fillAt(at)} />
      <Fill d={d} color={CC.curtain} at={fillAt(at)} seed="curtain" />
      <Ink d={folds} width={W.far} color={CC.curtainShade} at={b(at, 0.04)} />
      <Ink d={d} width={W.mid} at={at} open={0.08} />
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
      <Ink d={smooth([[900, D.apron[1]], [880, 1430], [820, 1530], [760, 1552]])} width={4} color={CC.cable} taper={false} at={b(at, 0.06)} />
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
  at?: At;
  /** Drawn in nook-world px inside the room's matrix, after the chair and before the floor plant (her, the run-on). */
  children?: React.ReactNode;
};

export const NookRoom: React.FC<NookRoomProps> = ({layout = 'wide', town, cat, lampOn = true, mic = true, blindY, slab = true, at, children}) => {
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
        {children}
        <FloorPlant x={1062} y={1560} h={340} seed="nookplant" at={at} />
      </InkScale>
    </XG>
  );
};

// ---------------------------------------------------------------- P5: over her shoulder at the desk (screen px)

/** P5's set (screen px, no figure): the wall, the window right (cut) onto the town, a framed print over the laptop,
 *  the corkboard left (behind her head), the desk top seen from behind her (back edge y 980), the lamp right, the
 *  golden pool (560, 1190), papers, a pen, the mug with steam. Her laptop is the lane's (kit Laptop at the board's
 *  x 530 hinge y 953 w 460); her back view and the cat (loaf / tail in the pool) go on top. */
export const NookDeskClose: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; children?: React.ReactNode}> = ({town, slab = true, at, children}) => (
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
    <Sway x={880} y={-20} amp={1.6} hz={0.17} seed="p5hang">
      <Ink d={line(880, -20, 864, 200, {over: [0, 0], seed: 'p5h1'}) + line(880, -20, 896, 200, {over: [0, 0], seed: 'p5h2'})} width={W.hair} at={at} />
      <PotPlant x={854} y={200} w={54} h={36} kind="trailing" seed="p5hangpot" at={at} />
    </Sway>
    {/* the wall left and centre: corkboard (behind her head), a print over the laptop, a cable */}
    <Corkboard x={34} y={640} w={300} h={230} seed="p5cork" at={at} />
    <FramedPicture x={432} y={622} w={150} h={116} kind="shapes" seed="p5pic" at={at} />
    {/* the desk top seen from behind her: back edge 980, the lamp's pool */}
    <Fill rect={[-200, 980, 1480, 1200]} color={CC.desk} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 1140, 980, {seed: 'p5dk', over: [0, 0]})} width={W.mid} at={at} />
    <Fill d={blob(560, 1190, 400, 170, {seed: 'p5pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
    <Fill d={blob(552, 1186, 256, 108, {seed: 'p5pool2', wobble: 0.025})} color={CC.core} offset={false} at={fillAt(at)} />
    <Ink d={line(40, 1420, 260, 1426, {over: [0, 0], seed: 'p5g1'}) + line(780, 1500, 1000, 1506, {over: [0, 0], seed: 'p5g2'}) + line(860, 1080, 1060, 1083, {over: [0, 0], seed: 'p5g3'})} width={W.hair} at={at} />
    <TableLamp x={900} y={1000} h={190} glow={false} pool={0} seed="p5lamp" at={at} />
    <DustMotes cx={600} cy={1090} rx={320} ry={150} n={10} seed="p5motes" at={at} />
    <Fill d={polyPath([[600, 1240], [860, 1226], [880, 1330], [612, 1346]])} color={CC.paper} at={fillAt(at)} seed="p5paper" />
    <Ink d={poly([[600, 1240], [860, 1226], [880, 1330], [612, 1346]], {closed: true, seed: 'p5paperI', over: 'small'}) + textLines(630, 1262, 200, {n: 3, gap: 22, seed: 'p5pl', heading: false})} width={W.far} at={at} />
    <NookMug x={790} top={1040} w={74} seed="p5mug" at={at} />
    <Ink d={line(250, 1300, 420, 1340, {over: [0, 0], seed: 'p5pen'})} width={14} color={CC.anchor} taper={false} at={at} />
    {/* more on the desk: grain, an open notebook, sticky notes, her phone face down, books, the laptop's cable */}
    <Ink d={[1060, 1130, 1210, 1290, 1380, 1480, 1640, 1760, 1880].map((y, i) => smooth([[-40 + i * 30, y], [300, y + 6 * Math.sin(i)], [700, y - 4], [1120, y + 5]])).join('')} width={W.hair} color={CC.deskShade} at={at} />
    <Fill d={polyPath([[330, 1430], [470, 1424], [478, 1600], [334, 1606]])} color={CC.paper} at={fillAt(at)} seed="p5nb1" />
    <Fill d={polyPath([[470, 1424], [612, 1430], [606, 1606], [478, 1600]])} color={CC.paper} at={fillAt(at)} seed="p5nb2" />
    <Ink d={poly([[330, 1430], [470, 1424], [478, 1600], [334, 1606]], {closed: true, seed: 'p5nbI1', over: 'small'}) + poly([[470, 1424], [612, 1430], [606, 1606], [478, 1600]], {closed: true, seed: 'p5nbI2', over: 'small'}) + textLines(350, 1458, 110, {n: 5, gap: 26, seed: 'p5nbt1', heading: false}) + textLines(492, 1458, 100, {n: 4, gap: 26, seed: 'p5nbt2', heading: false})} width={W.far} at={at} />
    <Fill d={polyPath([[652, 1444], [740, 1436], [746, 1518], [658, 1526]])} color={CC.note3} at={fillAt(at)} seed="p5st1" />
    <Fill d={polyPath([[700, 1500], [784, 1506], [778, 1586], [694, 1580]])} color={CC.note2} at={fillAt(at)} seed="p5st2" />
    <Ink d={poly([[652, 1444], [740, 1436], [746, 1518], [658, 1526]], {closed: true, seed: 'p5stI1', over: [0, 0]}) + poly([[700, 1500], [784, 1506], [778, 1586], [694, 1580]], {closed: true, seed: 'p5stI2', over: [0, 0]}) + textLines(668, 1470, 60, {n: 2, gap: 20, seed: 'p5stt', heading: false})} width={W.far} at={at} />
    <Fill d={roundRect(800, 1600, 100, 180, 18)} color={CC.anchor} at={fillAt(at)} seed="p5phone" />
    <Ink d={roundRect(800, 1600, 100, 180, 18, {seed: 'p5phoneI'})} width={W.mid} at={at} />
    <BookPile x={930} y={1760} w={170} n={3} seed="p5books" at={at} />
    <Ink d={smooth([[762, 1000], [840, 1020], [880, 1090], [1000, 1110], [1120, 1100]])} width={5} color={CC.cable} taper={false} at={b(at, 0.06)} />
    {children}
  </>
);

// ---------------------------------------------------------------- P6: the new angle, 3/4 front, the window behind her

/** P6's set (screen px, no figure): the wall; the bookcase cut by the left edge (-150..140, 640..1540); the window
 *  behind her (glass 560..1080, 640..1130, cut by the right edge; mullion 900; sill 535..1105 x 1130..1156) onto the
 *  living town; two framed prints and the clock on the wall between (clear of the bubble at 120..520 x 650..914); the
 *  desk in front left (top edge y 1450, -20..620) with the lamp, its pool (260, 1540) and a mug. Her (kit HerSeated
 *  front34 at the board's 640, 1960, h 1100, facing l), the mic (200, 1452, w 120) and the cat go on top. */
export const NookAngle: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; children?: React.ReactNode}> = ({town, slab = true, at, children}) => (
  <>
    {slab ? <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
    {/* window */}
    <Fill rect={[535, 618, 600, 512]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Fill rect={[552, 632, 600, 498]} color={CC.trim} offset={false} at={fillAt(at)} />
    <DuskTown x={560} y={640} w={560} h={490} horizon={905} k={1.12} moon={[860, 740]} seed="p6town" {...town} at={at} />
    <Fill rect={[556, 636, 560, 54]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
    <Fill rect={[554, 688, 560, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
    <Fill rect={[893, 698, 14, 432]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
    <Ink d={vline(535, 618, 1130, {over: [0, 0], seed: 'p6r'}) + vline(560, 640, 1130, {over: [0, 0], seed: 'p6g'}) + vline(893, 698, 1130, {over: [0, 0], seed: 'p6m1'}) + vline(907, 698, 1130, {over: [0, 0], seed: 'p6m2'}) + hline(535, 1140, 618, {over: [0, 0], seed: 'p6t'}) + hline(554, 1140, 698, {over: [0, 0], seed: 'p6b'})} width={W.mid} at={at} />
    <Fill rect={[523, 1130, 600, 12]} color={CC.sill} offset={false} at={fillAt(at)} />
    <Fill rect={[523, 1142, 600, 14]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Ink d={hline(523, 1140, 1130, {over: [4, 0], seed: 'p6s1'}) + hline(523, 1140, 1156, {over: [0, 0], seed: 'p6s2'})} width={W.mid} at={at} />
    <Fill d={roundRect(1010, 1090, 36, 40, 6)} color={CC.candle} at={fillAt(at)} seed="p6candle" />
    <Ink d={roundRect(1010, 1090, 36, 40, 6, {seed: 'p6candleI'})} width={W.far} at={at} />
    <CandleFlame x={1028} y={1088} h={22} seed="p6flame" at={at} />
    {/* bookcase */}
    <Fill rect={[-200, 640, 340, 900]} color={CC.caseBack} offset={false} at={fillAt(at)} />
    <Books x0={-190} x1={118} base={826} hMin={120} hMax={170} seed="p6b1" at={at} />
    <Books x0={-190} x1={60} base={1016} hMin={110} hMax={160} seed="p6b2" at={at} />
    <Books x0={-190} x1={118} base={1206} hMin={120} hMax={160} seed="p6b3" at={at} />
    <Books x0={-190} x1={118} base={1396} hMin={110} hMax={150} seed="p6b4" at={at} />
    <PotPlant x={70} y={970} w={46} h={44} kind="leafy" seed="p6caseplant" at={at} />
    {[640, 826, 1016, 1206, 1396].map((y, i) => (
      <Fill key={i} rect={[-200, y, 340, 16]} color={CC.shelf} seed={`p6bb${i}`} at={fillAt(at)} />
    ))}
    <Fill rect={[118, 636, 22, 904]} color={CC.shelf} offset={false} at={fillAt(at)} />
    <Ink d={[640, 826, 1016, 1206, 1396].map((y, i) => hline(-60, 118, y, {seed: `p6bl${i}`, over: [0, 0]}) + hline(-60, 118, y + 16, {seed: `p6bm${i}`, over: [0, 0]})).join('') + vline(118, 636, 1540, {over: [0, 0], seed: 'p6u1'}) + vline(140, 636, 1540, {over: [0, 0], seed: 'p6u2'})} width={W.mid} at={at} />
    {/* the top edge: the home's high shelf, a print over the window (cut right), a trailing plant hanging */}
    <HighShelf x0={-40} x1={520} y={250} seed="p6hs" at={at} />
    <FramedPicture x={720} y={96} w={260} h={170} kind="hills" seed="p6toppic" at={at} />
    <Sway x={620} y={-20} amp={1.6} hz={0.17} seed="p6hang">
      <Ink d={line(620, -20, 604, 196, {over: [0, 0], seed: 'p6h1'}) + line(620, -20, 636, 196, {over: [0, 0], seed: 'p6h2'})} width={W.hair} at={at} />
      <PotPlant x={594} y={196} w={54} h={36} kind="trailing" seed="p6hangpot" at={at} />
    </Sway>
    {/* the wall between: prints and the clock, under the bubble's place */}
    <FramedPicture x={190} y={968} w={128} h={160} kind="hills" seed="p6pic1" at={at} />
    <FramedPicture x={346} y={1002} w={110} h={90} kind="portrait" seed="p6pic2" at={at} />
    <WallClock cx={398} cy={1180} r={40} seed="p6clock" at={at} />
    {/* the desk in front left, the lamp and its pool */}
    <TableLamp x={424} y={1452} h={150} glow={{rx: 210, ry: 130, dy: -20}} glowClip={[1160, 1452]} pool={0} seed="p6lamp" at={at} />
    <Fill rect={[-200, 1450, 840, 600]} color={CC.desk} offset={false} at={fillAt(at)} />
    <Fill d={blob(260, 1540, 300, 60, {seed: 'p6pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
    <Fill d={blob(256, 1536, 190, 36, {seed: 'p6pool2', wobble: 0.02})} color={CC.core} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 640, 1450, {seed: 'p6dk', over: [0, 8]})} width={W.mid} at={at} />
    <NookMug x={36} top={1420} w={70} seed="p6mug" at={at} />
    <BookPile x={-20} y={1700} w={210} n={3} seed="p6deskbooks" at={at} />
    <PotPlant x={170} y={1452} w={64} h={52} kind="succulent" seed="p6deskplant" at={at} />
    <Fill d={polyPath([[60, 1760], [300, 1744], [316, 1900], [70, 1916]])} color={CC.paper} at={fillAt(at)} seed="p6note" />
    <Fill d={polyPath([[300, 1744], [520, 1736], [530, 1890], [316, 1900]])} color={CC.paper} at={fillAt(at)} seed="p6note2" />
    <Ink d={poly([[60, 1760], [300, 1744], [316, 1900], [70, 1916]], {closed: true, seed: 'p6noteI', over: 'small'}) + poly([[300, 1744], [520, 1736], [530, 1890], [316, 1900]], {closed: true, seed: 'p6note2I', over: 'small'}) + textLines(86, 1784, 190, {n: 4, gap: 26, seed: 'p6nl1', heading: false}) + textLines(330, 1772, 170, {n: 4, gap: 26, seed: 'p6nl2', heading: false})} width={W.far} at={at} />
    <Ink d={line(240, 1700, 420, 1676, {over: [0, 0], seed: 'p6pen'})} width={12} color={CC.anchor} taper={false} at={at} />
    <Fill d={polyPath([[300, 1560], [520, 1550], [530, 1640], [306, 1652]])} color={CC.paper} at={fillAt(at)} seed="p6paper" />
    <Ink d={poly([[300, 1560], [520, 1550], [530, 1640], [306, 1652]], {closed: true, seed: 'p6paperI', over: 'small'}) + textLines(322, 1578, 170, {n: 3, gap: 20, seed: 'p6pl', heading: false})} width={W.far} at={at} />
    {children}
  </>
);

// kit/Shop.tsx: the places round the information and the face beat (docs/v3/density_plan_g5b.md S4/S6, S5, S11):
// the board round a card (Ember noticeboard behind glass, or the cork price board) with papers peeking at its corners;
// the computer shop's street wall (cornice with icicles, the COMPUTERS fascia, a drainpipe, the lit display window,
// the glass door with a swinging OPEN sign and a bell); the shop inside (shelving round the BETTER slot, the window
// onto the snowy street with walkers, the counter's card reader, receipt printer, bag, USB jar, bell); the drivers'
// room (a strip light that flickers once, a cable tray, the dock window with a truck and a passing forklift, the
// coffee machine, a no-smoking plate, a bench, a boot mat with snowy prints).
//
//   <CardBoard card={{x: 140, y: 615, w: 800, h: 735}} kind="notice" corners={[{corner: 'tl', kind: 'flyer'}, ...]} />
//   <Cornice x0={-60} x1={1140} y={262} />   <Fascia x={240} y={130} w={600} h={120} text="COMPUTERS" />
//   <ShopDoor x={965} y={600} w={260} h={800} />   <DisplayWindow x={-150} y={620} w={265} h={700} />
//   <ShopShelving x={560} y={620} w={520} h={780} slot={{shelf: 0, x: 760, w: 220}} joltAt={[10.06]} />
//   <ReceiptPrinter x={700} y={1420} feedAt={9.7} feedDur={0.6} />   <StripLight x={200} y={180} w={680} flickerAt={26.0} />

import React, {useMemo} from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, glint, line, poly, polyPath, rect as rectInk, roundRect, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, W} from './util';
import {crossing, ease01, rings, sway} from './idle';
import {PinnedThing} from './Room';
import {Icicles, SnowCap, SnowLayers, SnowSill, Steam} from './Weather';
import {LampPost3} from './Street';
import {Walker, personGeo} from './People3';
import {tiered} from '../../../lib/tier';

const CORK = '#C98A64';
const KRAFT = '#C98A64';

// ---------------------------------------------------------------- the board round a card

export type CornerItem = {
  corner: 'tl' | 'tr' | 'bl' | 'br';
  kind: 'flyer' | 'concert' | 'card' | 'slip' | 'note' | 'clipboard' | 'photo';
  w?: number;
  h?: number;
  rot?: number;
  /** How far the item sticks out past the card corner (fraction of its size, default 0.45). */
  out?: number;
};

export type CardBoardProps = {
  /** The card the lane draws on top (canvas px); the board frames it with `margin`. */
  card: {x: number; y: number; w: number; h: number};
  margin?: number;
  /** 'notice': a red-brown frame behind glass (glints), cork face. 'cork': a framed cork price board. */
  kind?: 'notice' | 'cork';
  corners?: CornerItem[];
  /** Times the papers lift (a draught, a reaction). */
  flutterAt?: number[];
  seed?: string;
  at?: At;
  ink?: number;
};

/** The board round an information card (the card stays straight-on and level; the world goes round it): frame, face,
 *  pins, glass glints, and 3-4 papers peeking out from behind the card's corners (the lost-cat flyer's tabs flutter). */
const CardBoardBody: React.FC<CardBoardProps> = ({card, margin = 27, kind = 'notice', corners = [], flutterAt, seed = 'board', at, ink = W.mid}) => {
  const t = useTime();
  const x = card.x - margin;
  const y = card.y - margin;
  const w = card.w + margin * 2;
  const h = card.h + margin * 2;
  const fr = 16;
  const items = corners.map((c, i) => {
    const iw = c.w ?? (c.kind === 'note' ? 90 : c.kind === 'slip' ? 120 : c.kind === 'clipboard' ? 150 : 150);
    const ih = c.h ?? (c.kind === 'note' ? 90 : c.kind === 'slip' ? 160 : c.kind === 'clipboard' ? 200 : 200);
    const out = c.out ?? 0.45;
    const cx = c.corner[1] === 'l' ? card.x - iw * out : card.x + card.w - iw * (1 - out);
    const cy = c.corner[0] === 't' ? card.y - ih * out * 0.7 : card.y + card.h - ih * (1 - out);
    const rot = c.rot ?? (c.corner[1] === 'l' ? -6 : 7);
    const fl = rings(t, flutterAt?.map((f) => f + i * 0.04), 6, 3, 3.5) + sway(t, 0.6, 3, i);
    return {c, x: cx, y: cy, w: iw, h: ih, rot: rot + fl, i};
  });
  return (
    <>
      {/* frame + face */}
      <Fill rect={[x - fr, y - fr, w + fr * 2, h + fr * 2]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill rect={[x, y, w, h]} color={CORK} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={rectInk(x - fr, y - fr, w + fr * 2, h + fr * 2, {seed: `${seed}/fo`, over: [6, 14]}) + rectInk(x, y, w, h, {seed: `${seed}/fi`, over: [0, 3]})} at={at} width={ink} />
      {/* papers behind the card */}
      {items.map((it) => (
        <XG key={it.i} m={mat.about(mat.rotate(it.rot), it.x + it.w / 2, it.y + 8)}>
          {it.c.kind === 'clipboard' ? (
            <Clipboard x={it.x} y={it.y} w={it.w} h={it.h} seed={`${seed}/cb${it.i}`} at={b(at, 0.1)} />
          ) : (
            <>
              <PinnedThing kind={it.c.kind} x={it.x} y={it.y} w={it.w} h={it.h} seed={`${seed}/it${it.i}`} at={b(at, 0.1 + it.i * 0.04)} color={EMBER.ring} tabsT={it.i} />
              {it.c.kind === 'note' ? <Ink d={rectInk(it.x, it.y, it.w, it.h, {seed: `${seed}/ni${it.i}`, over: [0, 1]})} at={b(at, 0.1)} width={W.hair} /> : null}
            </>
          )}
          <circle cx={it.x + it.w / 2} cy={it.y + 8} r={5} fill={it.i % 2 ? EMBER.anchor : EMBER.dcSide} />
        </XG>
      ))}
      {kind === 'notice' ? (
        <Show at={fillAt(at, 0.12)}>
          {/* glass glints at the corners, outside the card */}
          <path d={glint(x + 14, y + h - 30, 46, {seed: `${seed}/g1`}) + glint(x + w - 60, y + 40, 40, {seed: `${seed}/g2`})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
        </Show>
      ) : null}
      {/* pins at the card's top corners (the lane's card sits on them) */}
      <circle cx={card.x + 24} cy={card.y + 12} r={6} fill={EMBER.anchor} />
      <circle cx={card.x + card.w - 24} cy={card.y + 12} r={6} fill={EMBER.anchor} />
    </>
  );
};
export const CardBoard = tiered('support', {tone: EMBER.beam}, CardBoardBody);

/** A clipboard with a sheet and a metal clip (hangs on a board's corner, or a driver holds it). */
const ClipboardBody: React.FC<{x: number; y: number; w: number; h: number; seed?: string; at?: At; ink?: number; flutterAt?: number[]}> = ({x, y, w, h, seed = 'clip', at, ink = W.mid, flutterAt}) => {
  const t = useTime();
  const lift = rings(t, flutterAt, 1, 3, 3.5);
  let lines = '';
  for (let i = 0; i < 5; i++) lines += line(x + w * 0.18, y + h * (0.28 + i * 0.12), x + w * (0.6 + (i % 2) * 0.2), y + h * (0.28 + i * 0.12), {over: [0, 0], seed: `${seed}/l${i}`});
  return (
    <>
      <Fill d={roundRect(x, y, w, h, w * 0.05)} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/b`} />
      <XG m={mat.about(mat.skewY(lift * 8), x + w / 2, y + h * 0.1)}>
        <Fill rect={[x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.84]} color={EMBER.card} at={fillAt(at, 0.03)} offset={false} />
        <Ink d={lines} at={b(at, 0.1)} width={W.hair} />
      </XG>
      <Fill d={roundRect(x + w * 0.3, y - h * 0.03, w * 0.4, h * 0.1, w * 0.03)} color={EMBER.frost} at={fillAt(at, 0.05)} offset={false} />
      <Ink d={roundRect(x, y, w, h, w * 0.05, {closed: false, seed: `${seed}/i`}) + roundRect(x + w * 0.3, y - h * 0.03, w * 0.4, h * 0.1, w * 0.03, {closed: false, seed: `${seed}/ci`})} at={at} width={ink} />
    </>
  );
};
export const Clipboard = tiered('support', {tone: EMBER.card}, ClipboardBody);

// ---------------------------------------------------------------- the shop's street wall (S4 / S6)

/** The shop's cornice above the caption band: a double line overshooting both edges, a moulding one step darker,
 *  snow on top, icicles (that drip) under it. y = the cornice's top line. */
const CorniceBody: React.FC<{x0?: number; x1?: number; y: number; h?: number; icicles?: number; seed?: string; at?: At; ink?: number}> = ({x0 = -60, x1 = 1140, y, h = 46, icicles = 4, seed = 'cornice', at, ink = W.mid}) => (
  <>
    <Fill rect={[x0, y, x1 - x0, h]} color={EMBER.reveal} at={fillAt(at)} offset={false} />
    <Fill rect={[x0, y + h * 0.62, x1 - x0, h * 0.38]} color={EMBER.shelf} at={fillAt(at, 0.02)} offset={false} />
    <SnowSill x0={x0} x1={x1} y={y + 1} h={16} seed={`${seed}/sn`} ink={W.hair} />
    <Ink d={line(x0, y, x1, y, {seed: `${seed}/t`, over: 'structural'}) + line(x0, y + h, x1, y + h, {seed: `${seed}/b`, over: 'structural'}) + line(x0, y + h * 0.62, x1, y + h * 0.62, {seed: `${seed}/m`, over: 'medium'})} at={at} width={ink} />
    {icicles > 0 ? <Icicles x0={x0 + 140} x1={x1 - 140} y={y + h} n={icicles} seed={`${seed}/ice`} /> : null}
  </>
);
export const Cornice = tiered('environment', {}, CorniceBody);

/** The shop's fascia sign (letters ~56 px): a dusk-blue board with warm lit letters and a small laptop pictogram. */
const FasciaBody: React.FC<{x: number; y: number; w: number; h?: number; text?: string; size?: number; color?: string; textColor?: string; icon?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w, h = 120, text = 'COMPUTERS', size = 56, color = EMBER.dc, textColor = EMBER.core, icon = true, seed = 'fascia', at, ink = W.mid}) => {
  const iw = h * 0.5;
  return (
    <>
      <Fill rect={[x, y, w, h]} color={color} at={fillAt(at)} seed={`${seed}/b`} />
      <Show at={fillAt(at, 0.06)}>
        <Txt x={x + w / 2 + (icon ? iw * 0.45 : 0)} y={y + h * 0.66} size={size} fill={textColor} fit={w - (icon ? iw * 1.8 : 40)}>
          {text}
        </Txt>
      </Show>
      {icon ? (
        <>
          <Fill rect={[x + h * 0.3, y + h * 0.3, iw, iw * 0.6]} color={textColor} at={fillAt(at, 0.07)} offset={false} />
          <Fill rect={[x + h * 0.3 + iw * 0.1, y + h * 0.3 + iw * 0.1, iw * 0.8, iw * 0.4]} color={color} at={fillAt(at, 0.08)} offset={false} />
          <Fill rect={[x + h * 0.22, y + h * 0.3 + iw * 0.62, iw * 1.3, iw * 0.1]} color={textColor} at={fillAt(at, 0.08)} offset={false} />
        </>
      ) : null}
      <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: [4, 10]})} at={at} width={ink} />
      <SnowCap x={x} y={y} w={w} h={12} seed={`${seed}/sn`} />
    </>
  );
};
export const Fascia = tiered('environment', {}, FasciaBody);

/** A drainpipe down a wall, brackets, and an ice drip at its foot. */
const DrainpipeBody: React.FC<{x: number; y0: number; y1: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y0, y1, w = 24, seed = 'pipe', at, ink = W.mid}) => {
  let br = '';
  for (let yy = y0 + 120; yy < y1 - 60; yy += 220) br += line(x - w * 0.8, yy, x + w * 0.8, yy, {over: [0, 0], seed: `${seed}/b${yy}`});
  return (
    <>
      <Fill rect={[x - w / 2, y0, w, y1 - y0]} color={EMBER.dcSide} at={fillAt(at)} seed={`${seed}/p`} />
      <Fill rect={[x - w / 2 + 3, y0, 4, y1 - y0]} color={EMBER.skyLow} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={line(x - w / 2, y0, x - w / 2, y1, {over: [0, 0], seed: `${seed}/l`}) + line(x + w / 2, y0, x + w / 2, y1, {over: [0, 0], seed: `${seed}/r`}) + br} at={at} width={ink} />
      <Icicles x0={x - w / 2} x1={x + w / 2} y={y1} n={2} len={[18, 34]} seed={`${seed}/ice`} />
      <path d={blob(x + w * 0.2, y1 + 50, w * 1.2, 10, {seed: `${seed}/heap`})} fill={EMBER.frost} />
    </>
  );
};
export const Drainpipe = tiered('environment', {}, DrainpipeBody);

/** The shop's lit display window (a corner of it, cut by the frame edge): warm inside, laptop boxes with an ink laptop
 *  icon, a monitor with a screensaver loop, a price card, glass glints, snow on the sill. Never hero laptops. */
const DisplayWindowBody: React.FC<{x: number; y: number; w: number; h: number; seed?: string; at?: At; ink?: number}> = ({x, y, w, h, seed = 'disp', at, ink = W.mid}) => {
  const t = useTime();
  const fr = 18;
  const ix = x + fr;
  const iy = y + fr;
  const iw = w - fr * 2;
  const ih = h - fr * 2;
  const shelfY = iy + ih * 0.62;
  // screensaver: a dot bouncing in the monitor
  const mx = ix + iw * 0.18;
  const my = iy + ih * 0.22;
  const mw = iw * 0.6;
  const mh = mw * 0.62;
  const bx = mx + 8 + Math.abs(((t * 40) % (2 * (mw - 26))) - (mw - 26));
  const by = my + 8 + Math.abs(((t * 28) % (2 * (mh - 26))) - (mh - 26));
  return (
    <>
      <Fill rect={[x, y, w, h]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill rect={[ix, iy, iw, ih]} color={EMBER.core} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[ix, shelfY, iw, 10]} color={EMBER.shelf} at={fillAt(at, 0.04)} offset={false} />
      {/* monitor */}
      <Fill rect={[mx, my, mw, mh]} color={EMBER.anchor} at={fillAt(at, 0.05)} seed={`${seed}/m`} />
      <Fill rect={[mx + 6, my + 6, mw - 12, mh - 12]} color={EMBER.dc} at={fillAt(at, 0.06)} offset={false} />
      <Show at={fillAt(at, 0.08)}>
        <circle cx={bx} cy={by} r={8} fill={EMBER.skyLow} />
      </Show>
      <Fill rect={[mx + mw * 0.42, my + mh, mw * 0.16, ih * 0.62 - (my - iy) - mh]} color={EMBER.anchor} at={fillAt(at, 0.05)} offset={false} />
      {/* boxes on the floor of the window */}
      {[0, 1, 2].map((i) => {
        const bw = iw * (i === 2 ? 0.36 : 0.44);
        const bh = ih * (i === 2 ? 0.12 : 0.15);
        const bx2 = ix + (i === 1 ? iw * 0.46 : i === 2 ? iw * 0.12 : iw * 0.04);
        const by2 = i === 2 ? iy + ih - bh * 2.1 : iy + ih - bh;
        return <LaptopBox key={i} x={bx2} y={by2} w={bw} h={bh} seed={`${seed}/bx${i}`} at={b(at, 0.06)} />;
      })}
      <Fill rect={[ix + iw * 0.6, shelfY - 60, 70, 54]} color={EMBER.card} at={fillAt(at, 0.08)} offset={false} />
      <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: [4, 8]}) + rectInk(ix, iy, iw, ih, {seed: `${seed}/ii`, over: [0, 2]}) + rectInk(mx, my, mw, mh, {seed: `${seed}/mi`, over: [0, 1]})} at={at} width={ink} />
      <Show at={fillAt(at, 0.1)}>
        <path d={glint(ix + iw * 0.7, iy + ih * 0.12, 60, {seed: `${seed}/g`})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      </Show>
      <SnowSill x0={x - 6} x1={x + w + 6} y={y + h} h={14} seed={`${seed}/sill`} ink={W.hair} />
    </>
  );
};
export const DisplayWindow = tiered('environment', {}, DisplayWindowBody);

/** A laptop box (kraft or cream) with an ink laptop icon (never the hero colour). */
const LaptopBoxBody: React.FC<{x: number; y: number; w: number; h: number; color?: string; seed?: string; at?: At; ink?: number}> = ({x, y, w, h, color, seed = 'box', at, ink = W.far}) => {
  const c = color ?? (rng(`lbox/${seed}`).chance(0.5) ? KRAFT : EMBER.card);
  const iw = Math.min(w * 0.3, h * 0.9);
  const icx = x + w * 0.5;
  const icy = y + h * 0.5;
  return (
    <>
      <Fill rect={[x, y, w, h]} color={c} at={fillAt(at)} seed={`${seed}/b`} />
      <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: [1, 2]})} at={at} width={ink} />
      <Ink d={rectInk(icx - iw * 0.4, icy - iw * 0.32, iw * 0.8, iw * 0.46, {seed: `${seed}/l`, over: [0, 0]}) + line(icx - iw * 0.55, icy + iw * 0.2, icx + iw * 0.55, icy + iw * 0.2, {over: [0, 0], seed: `${seed}/d`})} at={b(at, 0.08)} width={W.hair} />
    </>
  );
};
export const LaptopBox = tiered('environment', {}, LaptopBoxBody);

/** The shop's glass door cut by the frame edge: a warm glimpse inside (shelves), a push bar, the OPEN sign on a string
 *  swinging +-4 deg over 1.6 s (S4's loop; `signX` = where across the glass it hangs, so it stays on the visible part),
 *  a bell over the door that rings on `bellAt`. */
const ShopDoorBody: React.FC<{x: number; y: number; w: number; h: number; bellAt?: number[]; signX?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w, h, bellAt, signX = 0.5, seed = 'door', at, ink = W.mid}) => {
  const t = useTime();
  const fr = 22;
  const gx = x + fr;
  const gy = y + fr;
  const gw = w - fr * 2;
  const gh = h - fr * 2;
  const sw = Math.min(150, gw * 0.7);
  const sh = sw * 0.46;
  const sx = gx + gw * signX - sw / 2;
  const sy = gy + gh * 0.26;
  const ang = sway(t, 4, 1.6) + rings(t, bellAt, 6, 1.4, 2);
  const bellA = rings(t, bellAt, 18, 3.4, 3) + sway(t, 1.2, 2.2);
  return (
    <>
      <Fill rect={[x, y, w, h]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill rect={[gx, gy, gw, gh]} color={EMBER.ring} at={fillAt(at, 0.02)} offset={false} />
      {/* the warm glimpse: shelves and boxes inside */}
      {[0.5, 0.72].map((v, i) => (
        <Fill key={i} rect={[gx, gy + gh * v, gw, 8]} color={EMBER.shelf} at={fillAt(at, 0.04)} offset={false} />
      ))}
      <Fill rect={[gx + gw * 0.1, gy + gh * 0.5 - 50, gw * 0.3, 50]} color={KRAFT} at={fillAt(at, 0.05)} offset={false} />
      <Fill rect={[gx + gw * 0.5, gy + gh * 0.72 - 40, gw * 0.36, 40]} color={EMBER.card} at={fillAt(at, 0.05)} offset={false} />
      <Fill rect={[gx + gw * 0.06, gy + gh * 0.56, 12, gh * 0.12]} color={EMBER.frost} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: [4, 10]}) + rectInk(gx, gy, gw, gh, {seed: `${seed}/gi`, over: [0, 2]}) + line(gx + 10, gy + gh * 0.58, gx + 10, gy + gh * 0.7, {over: [0, 0], seed: `${seed}/bar`})} at={at} width={ink} />
      <Show at={fillAt(at, 0.1)}>
        <path d={glint(gx + gw * 0.7, gy + gh * 0.08, 70, {seed: `${seed}/g`})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      </Show>
      {/* the OPEN sign on its string */}
      <XG m={mat.about(mat.rotate(ang), sx + sw / 2, gy + 6)}>
        <path d={`M${sx + sw / 2} ${gy + 6}L${sx + sw * 0.15} ${sy}M${sx + sw / 2} ${gy + 6}L${sx + sw * 0.85} ${sy}`} stroke={EMBER.ink} strokeWidth={W.hair} fill="none" />
        <Fill d={roundRect(sx, sy, sw, sh, 8)} color={EMBER.card} at={fillAt(at, 0.08)} seed={`${seed}/os`} />
        <Show at={fillAt(at, 0.1)}>
          <Txt x={sx + sw / 2} y={sy + sh * 0.72} size={sh * 0.62} fill={EMBER.beam} fit={sw * 0.84}>
            OPEN
          </Txt>
        </Show>
        <Ink d={roundRect(sx, sy, sw, sh, 8, {closed: false, seed: `${seed}/oi`})} at={b(at, 0.08)} width={W.far} />
      </XG>
      {/* the bell over the door */}
      <XG m={mat.about(mat.rotate(bellA), gx + gw * 0.25, y - 2)}>
        <path d={`M${gx + gw * 0.25} ${y - 2}v14`} stroke={EMBER.ink} strokeWidth={W.hair} />
        <path d={`M${gx + gw * 0.25 - 14} ${y + 36}Q${gx + gw * 0.25 - 14} ${y + 10} ${gx + gw * 0.25} ${y + 10}Q${gx + gw * 0.25 + 14} ${y + 10} ${gx + gw * 0.25 + 14} ${y + 36}Z`} fill={EMBER.books[0]} stroke={EMBER.ink} strokeWidth={W.far} />
      </XG>
    </>
  );
};
export const ShopDoor = tiered('environment', {}, ShopDoorBody);

// ---------------------------------------------------------------- inside the shop (S5)

export type ShopShelvingProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  shelves?: number;
  /** Leave this gap on a shelf (0 = top) for the lane's BETTER laptop. */
  slot?: {shelf: number; x: number; w: number};
  /** Things hop 4 px (the BETTER pop jolts the shelf). */
  joltAt?: number[];
  seed?: string;
  at?: At;
  ink?: number;
};

/** A shop shelving unit: uprights and 3 shelves of laptop boxes (kraft and cream, ink icons), a monitor with a
 *  screensaver, a router whose LEDs blink, headphones and cable packs on hooks, cream shelf talkers. */
const ShopShelvingBody: React.FC<ShopShelvingProps> = ({x, y, w, h, shelves = 3, slot, joltAt, seed = 'shelving', at, ink = W.mid}) => {
  const t = useTime();
  const jolt = -Math.abs(rings(t, joltAt, 4, 5, 8));
  const plan = useMemo(() => {
    const r = rng(`shelving/${seed}`);
    const rows: {y: number; items: {kind: string; x: number; w: number; h: number}[]}[] = [];
    for (let s = 0; s < shelves; s++) {
      const sy = y + ((s + 1) * h) / (shelves + 0.4);
      const items: {kind: string; x: number; w: number; h: number}[] = [];
      let xx = x + 26;
      let k = 0;
      while (xx < x + w - 40 && k < 20) {
        k++;
        if (slot && slot.shelf === s && xx + 40 > slot.x && xx < slot.x + slot.w) {
          xx = slot.x + slot.w + 10;
          continue;
        }
        const roll = r.next();
        const kind = s === 0 && roll < 0.3 ? 'monitor' : s === 1 && roll < 0.25 ? 'router' : roll < 0.45 ? 'stack' : 'box';
        const iw = kind === 'monitor' ? 150 : kind === 'router' ? 110 : r.range(90, 140);
        if (xx + iw > x + w - 20) break;
        items.push({kind, x: xx, w: iw, h: kind === 'monitor' ? 110 : kind === 'router' ? 40 : r.range(60, 100)});
        xx += iw + r.range(10, 22);
      }
      rows.push({y: sy, items});
    }
    return rows;
  }, [x, y, w, h, shelves, slot?.shelf, slot?.x, slot?.w, seed]);
  const out: React.ReactNode[] = [];
  out.push(<Fill key="back" rect={[x, y, w, h]} color={EMBER.reveal} at={fillAt(at)} offset={false} />);
  plan.forEach((row, s) => {
    row.items.forEach((it, i) => {
      const key = `${s}_${i}`;
      const top = row.y - it.h + jolt;
      if (it.kind === 'box') out.push(<LaptopBox key={key} x={it.x} y={top} w={it.w} h={it.h} seed={`${seed}/${key}`} at={b(at, 0.06)} />);
      else if (it.kind === 'stack') {
        out.push(<LaptopBox key={`${key}a`} x={it.x} y={row.y - it.h * 0.5 + jolt} w={it.w} h={it.h * 0.5} seed={`${seed}/${key}a`} at={b(at, 0.06)} />);
        out.push(<LaptopBox key={`${key}b`} x={it.x + 8} y={row.y - it.h + jolt} w={it.w - 16} h={it.h * 0.5} seed={`${seed}/${key}b`} at={b(at, 0.08)} />);
      } else if (it.kind === 'monitor') {
        const sx = it.x + 8 + Math.abs(((t * 34) % (2 * (it.w - 40))) - (it.w - 40));
        out.push(
          <React.Fragment key={key}>
            <Fill rect={[it.x, top, it.w, it.h - 22]} color={EMBER.anchor} at={fillAt(at, 0.05)} seed={`${seed}/${key}m`} />
            <Fill rect={[it.x + 7, top + 7, it.w - 14, it.h - 36]} color={EMBER.dc} at={fillAt(at, 0.06)} offset={false} />
            <Show at={fillAt(at, 0.08)}>
              <rect x={sx} y={top + 16 + Math.sin(t * 1.3) * 12} width={26} height={16} fill={EMBER.skyLow} />
            </Show>
            <Fill rect={[it.x + it.w * 0.4, top + it.h - 22, it.w * 0.2, 22]} color={EMBER.anchor} at={fillAt(at, 0.05)} offset={false} />
            <Ink d={rectInk(it.x, top, it.w, it.h - 22, {seed: `${seed}/${key}mi`, over: [0, 1]})} at={b(at, 0.04)} width={W.far} />
          </React.Fragment>,
        );
      } else {
        // router with blinking LEDs and two antennas
        const leds = [0, 1, 2, 3].map((j) => (Math.sin(t * (3 + j * 1.7) + j * 2) > 0.2 ? EMBER.led : EMBER.dcSide));
        out.push(
          <React.Fragment key={key}>
            <path d={`M${it.x + 14} ${top}l-8 -46M${it.x + it.w - 14} ${top}l8 -46`} stroke={EMBER.anchor} strokeWidth={4} strokeLinecap="round" />
            <Fill d={roundRect(it.x, top, it.w, it.h, 8)} color={EMBER.anchor} at={fillAt(at, 0.05)} seed={`${seed}/${key}r`} />
            <Show at={fillAt(at, 0.08)}>
              {leds.map((c, j) => (
                <rect key={j} x={it.x + 18 + j * 20} y={top + it.h * 0.4} width={9} height={7} fill={c} />
              ))}
            </Show>
          </React.Fragment>,
        );
      }
    });
    // the shelf plank and a talker or two
    out.push(<Fill key={`pl${s}`} rect={[x - 6, row.y, w + 12, 16]} color={EMBER.beam} at={fillAt(at, 0.03)} seed={`${seed}/pl${s}`} />);
    out.push(<Ink key={`pli${s}`} d={rectInk(x - 6, row.y, w + 12, 16, {seed: `${seed}/pli${s}`, over: [2, 4]})} at={at} width={ink} />);
    for (let k = 0; k < 2; k++) {
      const tx = x + 60 + k * (w * 0.45);
      const ta = sway(t, 3, 2.6, s + k);
      out.push(
        <XG key={`tk${s}${k}`} m={mat.about(mat.rotate(ta), tx + 30, row.y + 16)}>
          <Fill rect={[tx, row.y + 16, 60, 34]} color={EMBER.card} at={fillAt(at, 0.1)} offset={false} />
          <Ink d={rectInk(tx, row.y + 16, 60, 34, {seed: `${seed}/tki${s}${k}`, over: [0, 0]}) + line(tx + 10, row.y + 30, tx + 48, row.y + 30, {over: [0, 0], seed: `${seed}/tkl${s}${k}`})} at={b(at, 0.1)} width={W.hair} />
        </XG>,
      );
    }
  });
  // hooks under the bottom shelf: headphones and cable packs
  const hy = plan[plan.length - 1].y + 70;
  for (let k = 0; k < 4; k++) {
    const hx = x + 50 + k * (w - 100) / 3;
    const sw2 = sway(t, 2, 2.8, k);
    out.push(<Ink key={`hk${k}`} d={line(hx, hy - 20, hx, hy + 10, {over: [0, 0], seed: `${seed}/hk${k}`})} at={b(at, 0.1)} width={W.far} />);
    out.push(
      <XG key={`hg${k}`} m={mat.about(mat.rotate(sw2), hx, hy + 10)}>
        {k % 2 === 0 ? (
          <>
            <Fill d={roundRect(hx - 30, hy + 10, 60, 90, 6)} color={EMBER.card} at={fillAt(at, 0.12)} seed={`${seed}/pk${k}`} />
            <path d={`M${hx - 16} ${hy + 40}q16 -18 32 0q-16 18 -32 0`} fill="none" stroke={EMBER.dcSide} strokeWidth={4} />
            <Ink d={roundRect(hx - 30, hy + 10, 60, 90, 6, {closed: false, seed: `${seed}/pki${k}`})} at={b(at, 0.1)} width={W.hair} />
          </>
        ) : (
          <>
            <path d={`M${hx - 26} ${hy + 60}C${hx - 30} ${hy + 4} ${hx + 30} ${hy + 4} ${hx + 26} ${hy + 60}`} fill="none" stroke={EMBER.dcSide} strokeWidth={8} strokeLinecap="round" />
            <rect x={hx - 36} y={hy + 50} width={20} height={30} rx={6} fill={EMBER.dcSide} />
            <rect x={hx + 16} y={hy + 50} width={20} height={30} rx={6} fill={EMBER.dcSide} />
          </>
        )}
      </XG>,
    );
  }
  out.push(<Ink key="up" d={line(x, y, x, y + h + 60, {over: [0, 0], seed: `${seed}/u1`}) + line(x + w, y, x + w, y + h + 60, {over: [0, 0], seed: `${seed}/u2`})} at={at} width={ink} />);
  return <>{out}</>;
};
export const ShopShelving = tiered('environment', {}, ShopShelvingBody);

/** The shop's front window onto the snowy street: dusk glass, a snowy ground band, a lit lamp post, falling snow,
 *  passers-by (each walks across once in its window of time), a headphone stand on the sill. */
const ShopWindowViewBody: React.FC<{x: number; y: number; w: number; h: number; walkers?: {t0: number; t1: number; dir?: 1 | -1; h?: number; wear?: ('umbrella' | 'snow')[]; dog?: boolean}[]; seed?: string; at?: At; ink?: number}> = ({x, y, w, h, walkers = [], seed = 'swin', at, ink = W.mid}) => {
  const id = `swv-${seed}`;
  const ground = y + h * 0.72;
  return (
    <>
      <Fill rect={[x - 16, y - 16, w + 32, h + 32]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={EMBER.sky} />
        <rect x={x} y={y + h * 0.5} width={w} height={h * 0.22} fill={EMBER.roofs} />
        {[0.12, 0.42, 0.7].map((u, i) => (
          <rect key={i} x={x + w * u} y={y + h * 0.56} width={w * 0.1} height={h * 0.07} fill={EMBER.houseLit} />
        ))}
        <rect x={x} y={ground} width={w} height={h} fill={EMBER.snow} />
        <LampPost3 x={x + w * 0.72} y={ground + 6} h={h * 0.55} arm="top" seed={`${seed}/lp`} ink={W.far} />
        {walkers.map((wk, i) => {
          const dir = wk.dir ?? 1;
          return <Walker key={i} from={[dir > 0 ? x - 60 : x + w + 60, ground + 30]} to={[dir > 0 ? x + w + 60 : x - 60, ground + 30]} h={wk.h ?? 220} window={[wk.t0, wk.t1]} seed={`${seed}/wk${i}`} wear={wk.wear} dog={wk.dog} />;
        })}
        <SnowLayers x={x} y={y} w={w} h={h} band={null} density={1.6} seed={`${seed}/sn`} />
      </g>
      <Ink d={rectInk(x - 16, y - 16, w + 32, h + 32, {seed: `${seed}/fi`, over: [4, 8]}) + rectInk(x, y, w, h, {seed: `${seed}/gi`, over: [0, 2]})} at={at} width={ink} />
      <Show at={fillAt(at, 0.1)}>
        <path d={glint(x + w * 0.2, y + h * 0.15, 70, {seed: `${seed}/g`})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      </Show>
    </>
  );
};
export const ShopWindowView = tiered('environment', {}, ShopWindowViewBody);

/** A card reader on the counter (its LED blinks). Base centre on y. */
const CardReaderBody: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 90, seed = 'reader', at, ink = W.mid}) => {
  const t = useTime();
  const h = w * 1.2;
  const on = Math.floor(t * 1.6) % 2 === 0;
  return (
    <>
      <Fill d={roundRect(x - w / 2, y - h, w, h, w * 0.14)} color={EMBER.anchor} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill rect={[x - w * 0.34, y - h * 0.86, w * 0.68, h * 0.3]} color={EMBER.dc} at={fillAt(at, 0.04)} offset={false} />
      <Show at={fillAt(at, 0.06)}>
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x - w * 0.3 + c * w * 0.22} y={y - h * 0.48 + r * h * 0.13} width={w * 0.16} height={h * 0.08} fill={EMBER.reveal} />))}
        <circle cx={x + w * 0.3} cy={y - h * 0.92} r={w * 0.05} fill={on ? EMBER.led : EMBER.dcSide} />
      </Show>
      <Ink d={roundRect(x - w / 2, y - h, w, h, w * 0.14, {closed: false, seed: `${seed}/i`})} at={at} width={ink} />
    </>
  );
};
export const CardReader = tiered('environment', {}, CardReaderBody);

/** The receipt printer: a receipt feeds out of the slot from `feedAt` over `feedDur` and curls over the counter edge
 *  (S5's loop). Base centre on y; `curlTo` = how far down the paper hangs past the counter front at the end. */
const ReceiptPrinterBody: React.FC<{x: number; y: number; w?: number; feedAt?: number; feedDur?: number; len?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 120, feedAt = 0, feedDur = 0.6, len = 220, seed = 'printer', at, ink = W.mid}) => {
  const t = useTime();
  const h = w * 0.5;
  const k = ease01(t, feedAt, feedDur);
  const L = len * k;
  const pw = w * 0.34; // paper width
  const sx = x - w * 0.1; // slot centre
  const sy = y - h;
  // the strip: up out of the slot (40 px), over a small curl toward us, then hanging down over the printer's front and
  // past the counter edge; text ticks across it
  const up = Math.min(L, 40);
  const over = Math.max(0, Math.min(L - 40, 50));
  const hang = Math.max(0, L - 90);
  const top = sy - up;
  let strip = '';
  let ticks = '';
  if (L > 1) {
    strip += `M${sx - pw / 2} ${sy}V${top}`;
    strip += `M${sx + pw / 2} ${sy}V${top}`;
    if (over > 0) {
      const r = 16 * (over / 50);
      strip = `M${sx - pw / 2} ${sy}V${top}Q${sx - pw / 2} ${top - r} ${sx - pw / 2 + r * 0.4} ${top - r}M${sx + pw / 2} ${sy}V${top}Q${sx + pw / 2} ${top - r} ${sx + pw / 2 + r * 0.4} ${top - r}`;
    }
    for (let i = 1; i < 3 && i * 12 < up; i++) ticks += `M${sx - pw * 0.3} ${sy - i * 12}h${pw * (0.4 + (i % 2) * 0.2)}`;
  }
  const hx = sx + 10;
  return (
    <>
      {L > 1 ? (
        <>
          <rect x={sx - pw / 2} y={top} width={pw} height={sy - top + 2} fill={EMBER.card} />
          <path d={strip} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
          <path d={ticks} stroke={EMBER.ink} strokeWidth={1.2} />
        </>
      ) : null}
      <Fill d={roundRect(x - w / 2, y - h, w, h, w * 0.1)} color={EMBER.card} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill rect={[x - w * 0.5, y - h * 0.4, w, h * 0.4]} color={EMBER.reveal} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={roundRect(x - w / 2, y - h, w, h, w * 0.1, {closed: false, seed: `${seed}/i`}) + line(sx - pw * 0.7, sy + 4, sx + pw * 0.7, sy + 4, {over: [0, 0], seed: `${seed}/slot`})} at={at} width={ink} />
      {hang > 0 ? (
        <>
          {/* the hanging part, in front of the printer and over the counter edge, curling at its end */}
          <path d={`M${hx - pw / 2} ${top - 14}h${pw}v${hang}q0 ${pw * 0.5} ${-pw * 0.5} ${pw * 0.5}q${-pw * 0.5} 0 ${-pw * 0.5} ${-pw * 0.3}z`} fill={EMBER.card} />
          <path d={`M${hx - pw / 2} ${top - 14}v${hang + pw * 0.2}M${hx + pw / 2} ${top - 14}v${hang}q0 ${pw * 0.5} ${-pw * 0.5} ${pw * 0.5}q${-pw * 0.5} 0 ${-pw * 0.5} ${-pw * 0.3}`} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
          <path d={Array.from({length: Math.floor(hang / 14)}, (_, i) => `M${hx - pw * 0.32} ${top + 4 + i * 14}h${pw * (0.35 + ((i * 7) % 4) * 0.1)}`).join('')} stroke={EMBER.ink} strokeWidth={1.2} />
        </>
      ) : null}
    </>
  );
};
export const ReceiptPrinter = tiered('environment', {}, ReceiptPrinterBody);

/** A paper shopping bag with handles (base centre on y). */
const PaperBagBody: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 130, seed = 'bag', at, ink = W.mid}) => {
  const h = w * 1.1;
  return (
    <>
      <Ink d={`M${x - w * 0.22} ${y - h}Q${x - w * 0.22} ${y - h * 1.35} ${x} ${y - h * 1.35}Q${x + w * 0.22} ${y - h * 1.35} ${x + w * 0.22} ${y - h}`} at={at} width={ink * 0.8} />
      <Fill d={polyPath([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.46, y], [x - w * 0.46, y]])} color={KRAFT} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill rect={[x - w * 0.2, y - h * 0.6, w * 0.4, h * 0.22]} color={EMBER.card} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.46, y], [x - w * 0.46, y]], {closed: true, seed: `${seed}/i`, over: [1, 2]}) + line(x - w * 0.5, y - h * 0.88, x + w * 0.5, y - h * 0.88, {over: [0, 0], seed: `${seed}/f`})} at={at} width={ink} />
    </>
  );
};
export const PaperBag = tiered('environment', {}, PaperBagBody);

/** A jar of USB sticks on the counter (base centre on y). */
const UsbJarBody: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 80, seed = 'usb', at, ink = W.mid}) => {
  const h = w * 1.2;
  const r = rng(`usb/${seed}`);
  const sticks: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const sx = x - w * 0.32 + i * w * 0.12;
    const a = r.range(-25, 25);
    sticks.push(<rect key={i} x={sx} y={y - h * 1.05} width={w * 0.1} height={h * 0.4} fill={[EMBER.dc, EMBER.hl, EMBER.beam, EMBER.reveal][i % 4]} transform={`rotate(${a.toFixed(1)} ${sx} ${y - h * 0.7})`} />);
  }
  return (
    <>
      <Show at={fillAt(at, 0.05)}>{sticks}</Show>
      <Fill d={roundRect(x - w / 2, y - h * 0.8, w, h * 0.8, w * 0.16)} color={EMBER.frost} at={fillAt(at)} seed={`${seed}/g`} />
      <Ink d={roundRect(x - w / 2, y - h * 0.8, w, h * 0.8, w * 0.16, {closed: false, seed: `${seed}/i`})} at={at} width={ink} />
      <Ink d={line(x - w * 0.3, y - h * 0.6, x - w * 0.3, y - h * 0.3, {over: [0, 0], seed: `${seed}/gl`})} at={b(at, 0.08)} width={W.hair} color={EMBER.white} />
    </>
  );
};
export const UsbJar = tiered('environment', {}, UsbJarBody);

/** A counter bell (rings: a small hop on `ringAt`). Base centre on y. */
const CounterBellBody: React.FC<{x: number; y: number; w?: number; ringAt?: number[]; seed?: string; at?: At; ink?: number}> = ({x, y, w = 70, ringAt, seed = 'bell', at, ink = W.mid}) => {
  const t = useTime();
  const hop = -Math.abs(rings(t, ringAt, 4, 6, 8));
  return (
    <>
      <Fill rect={[x - w * 0.55, y - w * 0.12, w * 1.1, w * 0.12]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
      <XG m={mat.translate(0, hop)}>
        <Fill d={`M${x - w * 0.42} ${y - w * 0.12}Q${x - w * 0.42} ${y - w * 0.66} ${x} ${y - w * 0.66}Q${x + w * 0.42} ${y - w * 0.66} ${x + w * 0.42} ${y - w * 0.12}Z`} color={EMBER.books[0]} at={fillAt(at, 0.03)} seed={`${seed}/d`} />
        <Ink d={`M${x - w * 0.42} ${y - w * 0.12}Q${x - w * 0.42} ${y - w * 0.66} ${x} ${y - w * 0.66}Q${x + w * 0.42} ${y - w * 0.66} ${x + w * 0.42} ${y - w * 0.12}M${x} ${y - w * 0.66}v${-w * 0.1}`} at={at} width={ink} />
        <Ink d={`M${x - w * 0.22} ${y - w * 0.46}q${w * 0.06} ${-w * 0.1} ${w * 0.16} ${-w * 0.12}`} at={b(at, 0.08)} width={W.hair} color={EMBER.white} />
      </XG>
    </>
  );
};
export const CounterBell = tiered('environment', {}, CounterBellBody);

/** A ceiling strip light (above the caption band): housing, a lit tube, flat light steps below; one stepped flicker
 *  at each `flickerAt` (lit, dark, lit, dark, lit over 0.2 s). */
const StripLightBody: React.FC<{x: number; y: number; w: number; flickerAt?: number[]; halo?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w, flickerAt = [], halo = true, seed = 'strip', at, ink = W.mid}) => {
  const t = useTime();
  let lit = true;
  for (const f of flickerAt) {
    const d = t - f;
    if (d >= 0 && d < 0.22) lit = Math.floor(d / 0.044) % 2 === 1;
  }
  return (
    <>
      {halo && lit ? <path d={`M${x + 20} ${y + 30}L${x + w - 20} ${y + 30}L${x + w + 40} ${y + 110}L${x - 40} ${y + 110}Z`} fill={EMBER.core} /> : null}
      <Fill rect={[x, y, w, 30]} color={EMBER.card} at={fillAt(at)} seed={`${seed}/h`} />
      <Fill rect={[x + 10, y + 18, w - 20, 12]} color={lit ? EMBER.core : EMBER.reveal} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={rectInk(x, y, w, 30, {seed: `${seed}/i`, over: [3, 6]}) + line(x + w * 0.2, y, x + w * 0.2, y - 60, {over: [0, 0], seed: `${seed}/c1`}) + line(x + w * 0.8, y, x + w * 0.8, y - 60, {over: [0, 0], seed: `${seed}/c2`})} at={at} width={ink} />
    </>
  );
};
export const StripLight = tiered('environment', {}, StripLightBody);

/** A cable tray along the ceiling with a few cables sagging out of it. */
const CableTrayBody: React.FC<{x0: number; x1: number; y: number; seed?: string; at?: At; ink?: number}> = ({x0, x1, y, seed = 'tray', at, ink = W.far}) => (
  <>
    <Fill rect={[x0, y, x1 - x0, 22]} color={EMBER.frost} at={fillAt(at)} offset={false} />
    <path d={`M${x0 + (x1 - x0) * 0.3} ${y + 22}q60 50 120 0M${x0 + (x1 - x0) * 0.62} ${y + 22}q40 34 80 0`} fill="none" stroke={EMBER.dcSide} strokeWidth={6} />
    <Ink d={rectInk(x0, y, x1 - x0, 22, {seed: `${seed}/i`, over: [6, 12], edges: 'tb'})} at={at} width={ink} />
  </>
);
export const CableTray = tiered('environment', {}, CableTrayBody);

/** The dock window (cut by an edge): dusk glass, snow, a truck's back with lit tail lights, a forklift crossing in
 *  each window of time. */
const DockWindowBody: React.FC<{x: number; y: number; w: number; h: number; forklift?: [number, number][]; seed?: string; at?: At; ink?: number}> = ({x, y, w, h, forklift = [], seed = 'dock', at, ink = W.mid}) => {
  const t = useTime();
  const id = `dock-${seed}`;
  const ground = y + h * 0.74;
  let fl: React.ReactNode = null;
  for (const [t0, t1] of forklift) {
    const c = crossing(t, t0, t1, [x - 120, ground], [x + w + 120, ground]);
    if (c) {
      fl = (
        <g transform={`translate(${c.x} ${ground})`}>
          <rect x={-50} y={-60} width={80} height={40} fill={EMBER.pot} />
          <path d={`M30 -10V-110M40 -10V-110M36 -20H80`} stroke={EMBER.anchor} strokeWidth={5} />
          <rect x={44} y={-58} width={40} height={36} fill={KRAFT} />
          <circle cx={-30} cy={-14} r={14} fill={EMBER.anchor} />
          <circle cx={18} cy={-14} r={14} fill={EMBER.anchor} />
          <path d={`M-40 -60V-110H20V-60`} fill="none" stroke={EMBER.anchor} strokeWidth={4} />
        </g>
      );
    }
  }
  const tl = Math.floor(t * 1.2) % 3 !== 0;
  return (
    <>
      <Fill rect={[x - 16, y - 16, w + 32, h + 32]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={EMBER.sky} />
        <rect x={x} y={ground} width={w} height={h} fill={EMBER.snow} />
        {/* the truck's back */}
        <rect x={x + w * 0.1} y={y + h * 0.25} width={w * 0.8} height={h * 0.5} fill={EMBER.card} />
        <path d={`M${x + w * 0.5} ${y + h * 0.25}v${h * 0.5}`} stroke={EMBER.ink} strokeWidth={2.2} />
        <rect x={x + w * 0.14} y={y + h * 0.66} width={w * 0.1} height={h * 0.05} fill={tl ? EMBER.hl : EMBER.beam} />
        <rect x={x + w * 0.76} y={y + h * 0.66} width={w * 0.1} height={h * 0.05} fill={tl ? EMBER.hl : EMBER.beam} />
        <path d={blob(x + w * 0.5, y + h * 0.25, w * 0.42, 8, {seed: `${seed}/ts`})} fill={EMBER.snow} />
        {fl}
        <SnowLayers x={x} y={y} w={w} h={h} band={null} density={2} seed={`${seed}/sn`} />
      </g>
      <Ink d={rectInk(x - 16, y - 16, w + 32, h + 32, {seed: `${seed}/fi`, over: [4, 8]}) + rectInk(x, y, w, h, {seed: `${seed}/gi`, over: [0, 2]})} at={at} width={ink} />
    </>
  );
};
export const DockWindow = tiered('environment', {}, DockWindowBody);

/** A coffee machine (cut by an edge): a lit button that blinks, a cup in the tray with steam. */
/** `body`: the casing colour (optional; default the anchor brown). */
const CoffeeMachineBody: React.FC<{x: number; y: number; w?: number; h?: number; seed?: string; at?: At; ink?: number; body?: string}> = ({x, y, w = 200, h = 380, seed = 'coffee', at, ink = W.mid, body = EMBER.anchor}) => {
  const t = useTime();
  const on = Math.floor(t * 1.1) % 2 === 0;
  return (
    <>
      <Fill d={roundRect(x, y - h, w, h, 14)} color={body} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill rect={[x + w * 0.1, y - h * 0.86, w * 0.8, h * 0.22]} color={EMBER.dc} at={fillAt(at, 0.03)} offset={false} />
      <Fill rect={[x + w * 0.2, y - h * 0.45, w * 0.6, h * 0.3]} color={EMBER.dcSide} at={fillAt(at, 0.03)} offset={false} />
      <Show at={fillAt(at, 0.06)}>
        <circle cx={x + w * 0.25} cy={y - h * 0.56} r={w * 0.05} fill={on ? EMBER.houseLit : EMBER.beam} />
        <circle cx={x + w * 0.42} cy={y - h * 0.56} r={w * 0.05} fill={EMBER.reveal} />
        <path d={`M${x + w * 0.4} ${y - h * 0.2}h${w * 0.2}l-${w * 0.02} ${h * 0.08}h-${w * 0.16}z`} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={W.hair} />
      </Show>
      <Steam x={x + w * 0.5} y={y - h * 0.21} seed={`${seed}/st`} rise={50} r1={6} />
      <Ink d={roundRect(x, y - h, w, h, 14, {closed: false, seed: `${seed}/i`})} at={at} width={ink} />
    </>
  );
};
export const CoffeeMachine = tiered('environment', {}, CoffeeMachineBody);

/** A small no-smoking plate (a circle with a bar; the bar in the red-brown, never the hero). */
const NoSmokingBody: React.FC<{x: number; y: number; r?: number; at?: At; seed?: string}> = ({x, y, r = 34, at, seed = 'nosmoke'}) => (
  <>
    <Fill rect={[x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4]} color={EMBER.card} at={fillAt(at)} seed={`${seed}/p`} />
    <Ink d={circle(x, y, r, {seed: `${seed}/c`}) + line(x - r * 0.7, y - r * 0.7, x + r * 0.7, y + r * 0.7, {over: [0, 0], seed: `${seed}/s`}) + rectInk(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4, {seed: `${seed}/pi`, over: [0, 0]})} at={at} width={W.far} color={EMBER.beam} />
    <Fill rect={[x - r * 0.5, y - r * 0.1, r * 0.9, r * 0.2]} color={EMBER.anchor} at={fillAt(at, 0.05)} offset={false} />
  </>
);
export const NoSmoking = tiered('environment', {}, NoSmokingBody);

/** A bench edge (seat + legs), base on y. */
const BenchBody: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 400, seed = 'bench', at, ink = W.mid}) => (
  <>
    <Fill rect={[x, y - 90, w, 22]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/s`} />
    <Fill rect={[x + 20, y - 68, 14, 68]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
    <Fill rect={[x + w - 34, y - 68, 14, 68]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
    <Ink d={rectInk(x, y - 90, w, 22, {seed: `${seed}/i`, over: [3, 6]})} at={at} width={ink} />
  </>
);
export const Bench = tiered('environment', {}, BenchBody);

/** A door mat with snowy boot prints. */
const BootMatBody: React.FC<{x: number; y: number; w?: number; h?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 360, h = 110, seed = 'mat', at, ink = W.far}) => {
  const r = rng(`mat/${seed}`);
  let prints = '';
  for (let i = 0; i < 5; i++) prints += blob(x + w * (0.15 + i * 0.17), y + h * (0.35 + (i % 2) * 0.3), 16, 9, {seed: `${seed}/p${i}${r.next()}`});
  return (
    <>
      <Fill d={roundRect(x, y, w, h, 10)} color={EMBER.dcSide} at={fillAt(at)} seed={`${seed}/b`} />
      <Show at={fillAt(at, 0.05)}>
        <path d={prints} fill={EMBER.frost} />
      </Show>
      <Ink d={roundRect(x, y, w, h, 10, {closed: false, seed: `${seed}/i`})} at={at} width={ink} />
    </>
  );
};
export const BootMat = tiered('environment', {}, BootMatBody);

/** A driver / customer holding a coffee and a clipboard (re-export helper for S11's row: WinterPerson wears). */
export const personHeight = (seed: string, s: number) => {
  const g = personGeo(seed, {legs: true});
  return (g.legH - g.headTop) * s;
};

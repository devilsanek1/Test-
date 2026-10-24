// Building / Facade — parametric architectural facade in the reference's ink-sketch look, plus Wall.
//
//   <Building x={90} y={900} w={320} floors={4} at={0.5} seed="b1" shop={{sign: 'cart'}} balconies={[2]} roof="cornice" />
//   <Wall x={70} y={200} w={820} h={600} at={0} color={palette.cream} />   // f_9.0-style wall with cornice + ticks
//
// x = left edge, y = ground line (bottom). Build order: outline -> wall fill rises -> windows floor by floor
// (bottom -> top) -> balconies / shop / roof details -> glints.

import React from 'react';
import {palette, stroke} from '../theme';
import {rand, rng, Seed} from '../rng';
import {useTime} from '../time';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Window} from './Window';
import {Door} from './Door';
import {circle, hatch, hline, line, poly, polyPath, rect, roundRect, wallTicks, Pt} from '../sketch';
import {At, b} from './common';

export type ShopOpts = {sign?: 'cart' | 'cross' | 'cup' | 'text' | 'none'; awning?: string; color?: string; glass?: string};

export type BuildingProps = {
  x: number;
  y: number;
  w: number;
  floors: number;
  floorH?: number;
  at?: At;
  seed?: Seed;
  color?: string;
  roof?: 'flat' | 'cornice' | 'pitched' | 'mansard';
  cols?: number;
  win?: 'tall' | 'square' | 'wide' | 'grid';
  glass?: string;
  /** Balcony floors (1 = first floor above ground). true = all upper floors. */
  balconies?: boolean | number[];
  balconyColor?: string;
  shop?: boolean | ShopOpts;
  /** Door column on the ground floor (when no shop). */
  door?: number;
  /** Total build time budget (s). Default ~2.2. */
  span?: number;
  width?: number;
  /** Evening: from this time a seeded `lit` fraction of the windows switch on one by one (1-frame pops to `litColor`,
   *  spread over `litSpan` s, random order). */
  lightAt?: number;
  lit?: number;
  litColor?: string;
  litSpan?: number;
};

export const Building: React.FC<BuildingProps> = ({
  x,
  y,
  w,
  floors,
  floorH = 110,
  at,
  seed = 'bld',
  color = palette.peach,
  roof = 'cornice',
  cols: colsIn,
  win = 'tall',
  glass,
  balconies,
  balconyColor = palette.sage,
  shop,
  door,
  span = 2.2,
  width = stroke.ink,
  lightAt,
  lit = 0.55,
  litColor = palette.peach,
  litSpan = 0.8,
}) => {
  const t = useTime();
  const r = rng(`bld/${seed}`);
  // the rng sequence must not depend on time: the default glass is always drawn first, then maybe overridden
  const litGlass = (g: string, key: string) => (lightAt !== undefined && rand(key, 'on') < lit && t >= lightAt + rand(key, 't') * litSpan ? litColor : g);
  const H = floors * floorH;
  const top = y - H;
  const cols = colsIn ?? Math.max(1, Math.round(w / (win === 'wide' ? 150 : 95)));
  const cw = w / cols;
  const k = span / 2.2;
  const T = (dt: number) => b(at, dt * k);
  const out: React.ReactNode[] = [];
  const shopO: ShopOpts | null = shop ? (shop === true ? {} : shop) : null;

  // wall fill + outline
  // large base fill: linear wipe bottom -> top in 3-4 frames (motion spec #10), landing after the outline starts
  out.push(<Fill key="wall" rect={[x, top, w, H]} color={color} at={T(0.2)} mode="wipe" dir="up" dur={0.12} seed={`${seed}/wall`} />);
  out.push(
    <Ink
      key="outline"
      d={line(x, y, x, top, {seed: `${seed}/l`, over: [3, r.range(8, 30)]}) + line(x + w, y, x + w, top, {seed: `${seed}/r`, over: [3, r.range(6, 24)]})}
      at={T(0)}
      dur={0.45 * k}
      width={width}
      order="all"
    />,
  );
  // roof
  if (roof === 'cornice' || roof === 'flat') {
    let d = hline(x - (roof === 'cornice' ? 10 : 0), x + w + (roof === 'cornice' ? 10 : 0), top, {seed: `${seed}/rt`, over: [r.range(4, 26), r.range(4, 30)]});
    if (roof === 'cornice') d += hline(x - 6, x + w + 6, top + 12, {seed: `${seed}/rt2`});
    out.push(<Ink key="roof" d={d} at={T(0.35)} dur={0.35 * k} width={width} />);
    if (roof === 'cornice') out.push(<Fill key="corF" rect={[x - 8, top, w + 16, 12]} color={palette.tan} at={T(0.7)} seed={`${seed}/cor`} />);
  } else if (roof === 'pitched') {
    const ph = Math.min(w * 0.45, floorH * 1.1);
    const pts: Pt[] = [
      [x - 10, top],
      [x + w / 2, top - ph],
      [x + w + 10, top],
    ];
    out.push(<Fill key="roofF" d={polyPath(pts)} color={palette.tan} at={T(0.75)} mode="grow" seed={`${seed}/pf`} />);
    out.push(<Ink key="roof" d={poly(pts, {seed: `${seed}/pr`}) + hline(x - 10, x + w + 10, top, {seed: `${seed}/pb`})} at={T(0.35)} dur={0.45 * k} width={width} />);
    out.push(<Window key="roofwin" x={x + w / 2 - 18} y={top - ph * 0.55} w={36} h={36} at={T(1.6)} seed={`${seed}/rw`} panes={2} glint={false} />);
  } else if (roof === 'mansard') {
    const mh = floorH * 0.75;
    const inset = mh * 0.45;
    const pts: Pt[] = [
      [x - 6, top],
      [x + inset, top - mh],
      [x + w - inset, top - mh],
      [x + w + 6, top],
    ];
    out.push(<Fill key="roofF" d={polyPath(pts)} color={palette.teal} at={T(0.75)} mode="grow" seed={`${seed}/mf`} />);
    out.push(<Ink key="roof" d={poly(pts, {seed: `${seed}/mr`}) + hline(x - 12, x + w + 12, top, {seed: `${seed}/mb`})} at={T(0.35)} dur={0.5 * k} width={width} />);
    const nd = Math.max(1, Math.round((w - inset * 2) / 90));
    for (let i = 0; i < nd; i++) {
      const dx = x + inset + ((w - inset * 2) * (i + 0.5)) / nd;
      const dw = 30;
      const dh = mh * 0.5;
      const dy = top - mh * 0.62;
      const dp: Pt[] = [
        [dx - dw / 2 - 5, dy],
        [dx, dy - 18],
        [dx + dw / 2 + 5, dy],
      ];
      out.push(<Fill key={`dorF${i}`} rect={[dx - dw / 2, dy, dw, dh]} color={palette.mintPale} at={T(1.7 + i * 0.05)} seed={`${seed}/df${i}`} />);
      out.push(<Ink key={`dor${i}`} d={rect(dx - dw / 2, dy, dw, dh, {seed: `${seed}/d${i}`, over: 3}) + poly(dp, {seed: `${seed}/dp${i}`, over: 3})} at={T(1.5 + i * 0.05)} dur={0.3 * k} width={width * 0.85} />);
    }
  }
  // floors
  const balc = (f: number) => (balconies === true ? f >= 1 : Array.isArray(balconies) ? balconies.includes(f) : false);
  let wi = 0;
  for (let f = 0; f < floors; f++) {
    const fy = y - (f + 1) * floorH; // top of this floor
    if (f === 0 && (shopO || door !== undefined)) continue;
    if (f > 0 && r.chance(0.35)) out.push(<Ink key={`fl${f}`} d={hline(x, x + w, fy + floorH, {seed: `${seed}/fl${f}`, over: [r.range(2, 10), r.range(2, 18)]})} at={T(0.5 + f * 0.05)} dur={0.3 * k} width={width * 0.8} />);
    for (let c = 0; c < cols; c++) {
      const ww = win === 'wide' ? cw * 0.7 : win === 'square' ? Math.min(cw * 0.55, floorH * 0.5) : cw * 0.46;
      const wh = win === 'wide' ? floorH * 0.5 : win === 'square' ? ww : floorH * 0.62;
      const wx = x + c * cw + (cw - ww) / 2;
      const wy = fy + floorH * 0.16;
      out.push(
        <Window
          key={`w${f}-${c}`}
          x={wx}
          y={wy}
          w={ww}
          h={wh}
          at={T(0.75 + wi * (0.9 / Math.max(1, floors * cols)))}
          seed={`${seed}/w${f}/${c}`}
          glass={litGlass(glass ?? (r.chance(0.15) ? palette.teal : r.chance(0.12) ? palette.cream : palette.mintPale), `${seed}/lit${f}/${c}`)}
          panes={win === 'grid' ? 2 : win === 'wide' ? 3 : r.chance(0.5) ? 2 : 1}
          transom={win === 'grid' ? 0.35 : undefined}
          sill={!balc(f) && r.chance(0.6)}
          blind={r.chance(0.18) ? r.range(0.2, 0.5) : 0}
          width={width}
          speed={1.8}
        />,
      );
      wi++;
    }
    if (balc(f)) {
      const by = fy + floorH * 0.55;
      const bh = floorH * 0.4;
      const bx = x - 8;
      const bw = w + 16;
      const panels = Math.max(2, Math.round(bw / r.range(70, 110)));
      let dividers = '';
      for (let i = 1; i < panels; i++) dividers += line(bx + (bw * i) / panels, by, bx + (bw * i) / panels, by + bh, {over: [0, 1], seed: `${seed}/bd${f}/${i}`});
      out.push(<Fill key={`bf${f}`} rect={[bx, by, bw, bh]} color={balconyColor} at={T(1.55 + f * 0.06)} mode="wipe" dir="right" seed={`${seed}/bf${f}`} />);
      out.push(
        <Ink
          key={`b${f}`}
          d={hline(bx, bx + bw, by, {seed: `${seed}/bt${f}`, over: [r.range(6, 34), r.range(4, 24)]}) + hline(bx, bx + bw, by + bh, {seed: `${seed}/bb${f}`}) + line(bx, by, bx, by + bh, {seed: `${seed}/bl${f}`}) + line(bx + bw, by, bx + bw, by + bh, {seed: `${seed}/br${f}`}) + dividers}
          at={T(1.4 + f * 0.06)}
          dur={0.45 * k}
          width={width * 0.9}
        />,
      );
    }
  }
  // ground floor: shop or door
  if (shopO) {
    const gy = y - floorH;
    const sx = x + 12;
    const sw = w - 24;
    const signH = 30;
    const glassY = gy + signH + 14;
    const glassH = floorH - signH - 14;
    const dW = Math.min(64, sw * 0.28);
    const dX = x + w - 12 - dW - 6;
    out.push(<Fill key="sg" rect={[sx, glassY, dX - sx - 8, glassH]} color={shopO.glass ?? palette.teal} at={T(1.2)} mode="wipe" dir="down" seed={`${seed}/sg`} />);
    out.push(<Ink key="sgI" d={rect(sx, glassY, dX - sx - 8, glassH, {seed: `${seed}/sgi`})} at={T(1.0)} dur={0.4 * k} width={width} />);
    out.push(<Door key="sd" x={dX} y={glassY} w={dW} h={glassH} double={false} frameW={0} at={T(1.15)} seed={`${seed}/sd`} />);
    if (shopO.awning) {
      const aw: Pt[] = [
        [x + 4, gy + 4],
        [x + w - 4, gy + 4],
        [x + w + 10, gy + signH + 18],
        [x - 10, gy + signH + 18],
      ];
      out.push(<Fill key="aw" d={polyPath(aw)} color={shopO.awning} at={T(1.45)} mode="wipe" dir="down" seed={`${seed}/aw`} />);
      out.push(<Ink key="awI" d={poly(aw, {closed: true, seed: `${seed}/awi`}) + hatch(x, gy + 6, w, signH + 10, {angle: 100, gap: 26, seed: `${seed}/awh`})} at={T(1.3)} dur={0.4 * k} width={width * 0.85} />);
    } else {
      out.push(<Ink key="fascia" d={hline(x, x + w, gy + signH + 6, {seed: `${seed}/fa`, over: [r.range(2, 12), r.range(2, 20)]})} at={T(0.9)} dur={0.3 * k} width={width} />);
    }
    const sign = shopO.sign ?? 'none';
    if (sign !== 'none') {
      const bs = 52;
      const bxs = x + w * 0.22;
      const bys = gy - 6;
      out.push(<Fill key="signF" d={roundRect(bxs, bys, bs, bs, 4)} color={sign === 'cross' ? palette.card : palette.card} at={T(1.7)} mode="pop" seed={`${seed}/sf`} />);
      out.push(<Ink key="signI" d={rect(bxs, bys, bs, bs, {seed: `${seed}/si`, over: 3})} at={T(1.6)} dur={0.25 * k} width={width} />);
      const cx = bxs + bs / 2;
      const cy = bys + bs / 2;
      let icon = '';
      let iconFill: string | null = null;
      if (sign === 'cart') {
        icon = `M${cx - 17} ${cy - 13}L${cx - 11} ${cy - 13}L${cx - 6} ${cy + 6}L${cx + 15} ${cy + 6}L${cx + 18} ${cy - 7}L${cx - 9} ${cy - 7}` + circle(cx - 3, cy + 14, 3.2, {seed: 'c1'}) + circle(cx + 12, cy + 14, 3.2, {seed: 'c2'});
      } else if (sign === 'cross') {
        iconFill = `M${cx - 6} ${cy - 18}H${cx + 6}V${cy - 6}H${cx + 18}V${cy + 6}H${cx + 6}V${cy + 18}H${cx - 6}V${cy + 6}H${cx - 18}V${cy - 6}H${cx - 6}Z`;
        icon = iconFill;
      } else if (sign === 'cup') {
        icon = `M${cx - 14} ${cy - 8}L${cx - 11} ${cy + 14}L${cx + 9} ${cy + 14}L${cx + 12} ${cy - 8}Z` + `M${cx + 12} ${cy - 3}Q${cx + 22} ${cy} ${cx + 11} ${cy + 8}` + `M${cx - 5} ${cy - 13}Q${cx - 2} ${cy - 18} ${cx - 5} ${cy - 22}M${cx + 3} ${cy - 13}Q${cx + 6} ${cy - 18} ${cx + 3} ${cy - 22}`;
      } else if (sign === 'text') {
        icon = hline(cx - 16, cx + 16, cy - 6, {over: 0, seed: 't1'}) + hline(cx - 12, cx + 12, cy + 6, {over: 0, seed: 't2'});
      }
      if (iconFill) out.push(<Fill key="iconF" d={iconFill} color={palette.sage} at={T(1.9)} mode="pop" seed={`${seed}/if`} />);
      out.push(<Ink key="icon" d={icon} at={T(1.8)} dur={0.3 * k} width={width * 0.8} />);
    }
  } else if (door !== undefined) {
    const dw = Math.min(cw * 0.7, 110);
    const dx = x + door * cw + (cw - dw) / 2;
    out.push(<Door key="door" x={dx} y={y - floorH * 0.82} w={dw} h={floorH * 0.82} double={dw > 80} frameW={8} at={T(1.0)} seed={`${seed}/door`} />);
    for (let c = 0; c < cols; c++) {
      if (c === door) continue;
      out.push(<Window key={`gw${c}`} x={x + c * cw + cw * 0.22} y={y - floorH * 0.78} w={cw * 0.56} h={floorH * 0.5} at={T(1.1 + c * 0.05)} seed={`${seed}/gw${c}`} speed={1.6} width={width} />);
    }
  }
  out.push(<Ink key="base" d={hline(x - 4, x + w + 4, y, {seed: `${seed}/base`})} at={T(0.2)} dur={0.3 * k} width={width} />);
  return <>{out}</>;
};

// ---------------------------------------------------------------- Wall (f_9.0 style)

export type WallProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: At;
  seed?: Seed;
  color?: string;
  /** Cornice band at the top (double overshooting lines + tan band). Default true. */
  cornice?: boolean;
  /** Number of brick ticks (default by area). 0 = none. */
  ticks?: number;
  /** Ground strip at the bottom (mintPale) height. 0 = none. */
  ground?: number;
  width?: number;
};

export const Wall: React.FC<WallProps> = ({x, y, w, h, at, seed = 'wall', color = palette.cream, cornice = true, ticks, ground = 0, width = stroke.ink}) => {
  const r = rng(`wall/${seed}`);
  const out: React.ReactNode[] = [];
  out.push(<Fill key="f" rect={[x, y, w, h]} color={color} at={b(at, 0.15)} mode="wipe" dir="up" dur={0.13} offset={false} seed={`${seed}/f`} />);
  if (cornice) {
    out.push(<Fill key="cb" rect={[x, y + 14, w, 18]} color={palette.tan} at={b(at, 0.45)} mode="wipe" dir="right" offset={false} seed={`${seed}/cb`} />);
    out.push(
      <Ink
        key="c"
        d={hline(x - 30, x + w + 50, y + 6, {seed: `${seed}/c1`, over: [r.range(10, 40), r.range(10, 50)]}) + hline(x - 20, x + w + 30, y + 16, {seed: `${seed}/c2`}) + hline(x + 20, x + w - 10, y + 34, {seed: `${seed}/c3`, over: [4, 12]})}
        at={at}
        dur={0.5}
        width={width}
      />,
    );
  }
  if (ticks !== 0) out.push(<Ink key="t" d={wallTicks(x + 20, y + 60, w - 40, h - 120 - ground, {seed: `${seed}/t`, n: ticks})} at={b(at, 0.7)} dur={0.5} width={width * 0.8} order="all" />);
  if (ground > 0) {
    out.push(<Fill key="g" rect={[x, y + h - ground, w, ground]} color={palette.mintPale} at={b(at, 0.3)} mode="wipe" dir="right" offset={false} seed={`${seed}/g`} />);
    out.push(<Ink key="gl" d={hline(x - 30, x + w + 40, y + h - ground, {seed: `${seed}/gl`, over: [20, 45]}) + hline(x - 10, x + w + 20, y + h - ground + 18, {seed: `${seed}/gl2`})} at={b(at, 0.2)} dur={0.5} width={width} />);
  }
  return <>{out}</>;
};

/** A few horizontal ground / pavement lines with overshoot (street edge). */
export const Ground: React.FC<{x?: number; y: number; w?: number; at?: At; seed?: Seed; lines?: number; gap?: number; color?: string; fillH?: number; width?: number}> = ({
  x = 70,
  y,
  w = 820,
  at,
  seed = 'ground',
  lines = 2,
  gap = 22,
  color = palette.mintPale,
  fillH = 0,
  width = stroke.ink,
}) => {
  let d = '';
  for (let i = 0; i < lines; i++) d += hline(x - 20 + i * 14, x + w + 30 - i * 20, y + i * gap, {seed: `${seed}/${i}`, over: [10 + i * 6, 30 - i * 8]});
  return (
    <>
      {fillH > 0 ? <Fill rect={[x, y, w, fillH]} color={color} at={b(at, 0.25)} mode="wipe" dir="right" offset={false} seed={`${seed}/f`} /> : null}
      <Ink d={d} at={at} dur={0.5} width={width} />
    </>
  );
};


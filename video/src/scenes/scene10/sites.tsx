// S10 near row (replaces the OldQuarter 'sites' layer through the set's `wrap`): the same three SiteFacades, roofs,
// balconies and stoops as the set (geometry copied from sets/OldQuarter.tsx, anchors from OLD_QUARTER), with
//  - the stoops as their own component (`Stoops`, popping with their sites, drawn in front of the cart line),
//  - siteM's browser window starting the update that stalls (a fat progress bar + '10%' in the screen, a 1.4x ring).
// The hanging plaques are a separate component (`Plaques`), drawn above the cart line.

import React from 'react';
import {palette} from '../../lib/theme';
import {lerp, prog, ease as E, springAt, springs, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {crown, line, polyPath, Pt, rect, rectPath, roundRect} from '../../lib/sketch';
import {BrowserChrome, OLD_QUARTER, PopUp, SI, SiteFacade, siteFacadeLayout} from './kit';
import {HangPlaque, HangPlaqueProps} from './plaques';

type SiteId = 'L' | 'M' | 'R';
const IDS: SiteId[] = ['L', 'M', 'R'];
const S = OLD_QUARTER.sites;

// ---- static geometry (module scope: built once), copied from the set so the row looks identical
const G = (() => {
  const s = 'oq';
  const stoops = IDS.map((id) => {
    const d = S[id].door;
    return rectPath(d[0] - 14, OLD_QUARTER.base, d[2] + 28, 12) + rectPath(d[0] - 26, OLD_QUARTER.base + 12, d[2] + 52, 12);
  });
  const stoopInk = IDS.map((id) => {
    const d = S[id].door;
    return line(d[0] - 18, OLD_QUARTER.base, d[0] + d[2] + 18, OLD_QUARTER.base, {seed: `${s}/so${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 12, d[0] + d[2] + 30, OLD_QUARTER.base + 12, {seed: `${s}/st${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 24, d[0] + d[2] + 30, OLD_QUARTER.base + 24, {seed: `${s}/sb${id}`, over: 'small'});
  });
  const RF = OLD_QUARTER.roofs;
  const M = RF.mansard;
  const mansard = polyPath([[M.x0, M.base], [M.x0 + M.inset, M.top], [M.x1 - M.inset, M.top], [M.x1, M.base]]);
  let dormers = '';
  let dormerGlass = '';
  let dormerInk = '';
  for (const [dx, dy] of RF.dormers) {
    dormers += rectPath(dx - 20, dy, 40, 44) + polyPath([[dx - 25, dy + 1], [dx, dy - 18], [dx + 25, dy + 1]]);
    dormerGlass += rectPath(dx - 12, dy + 10, 24, 28);
    dormerInk += line(dx - 28, dy + 2, dx, dy - 18, {seed: `${s}/dr${dx}a`, over: [3, 1]}) + line(dx, dy - 18, dx + 28, dy + 2, {seed: `${s}/dr${dx}b`, over: [1, 3]}) + line(dx - 20, dy + 2, dx - 20, dy + 44, {seed: `${s}/dr${dx}c`, over: 0}) + line(dx + 20, dy + 2, dx + 20, dy + 44, {seed: `${s}/dr${dx}d`, over: 0}) + line(dx - 12, dy + 10, dx + 12, dy + 10, {seed: `${s}/dr${dx}e`, over: 0});
  }
  const mansardInk = line(M.x0 - 6, M.base + 2, M.x0 + M.inset, M.top, {seed: `${s}/ml`, over: [2, 4]}) + line(M.x1 - M.inset, M.top, M.x1 + 6, M.base + 2, {seed: `${s}/mr`, over: [4, 2]}) + line(M.x0 + M.inset - 10, M.top, M.x1 - M.inset + 10, M.top, {seed: `${s}/mt`, over: [6, 6]}) + line(M.x0 + 14, M.base - 34, M.x1 - 14, M.base - 34, {seed: `${s}/mm`, over: 0});
  // siteM's rooftop detail (fix round 2): the set's TV antenna (x 616) crossed the far row's plates right of the sun; a
  // short chimney pot at the roof's LEFT end instead (clear of the sun's disc and of every far plate by >= 20 px)
  const CH = {x: 376, base: 820, h: 22, w: 16};
  const chimney = rectPath(CH.x - CH.w / 2, CH.base - CH.h, CH.w, CH.h) + rectPath(CH.x - CH.w / 2 - 3, CH.base - CH.h - 5, CH.w + 6, 6);
  const chimneyInk = line(CH.x - CH.w / 2, CH.base, CH.x - CH.w / 2, CH.base - CH.h, {seed: `${s}/ch1`, over: 0}) + line(CH.x + CH.w / 2, CH.base - CH.h, CH.x + CH.w / 2, CH.base, {seed: `${s}/ch2`, over: 0}) + line(CH.x - CH.w / 2 - 5, CH.base - CH.h - 5, CH.x + CH.w / 2 + 5, CH.base - CH.h - 5, {seed: `${s}/ch3`, over: 0});
  const T = RF.tank;
  const tank = rectPath(T.x - T.w / 2, T.y, T.w, T.h) + polyPath([[T.x - T.w / 2 - 4, T.y], [T.x, T.y - 16], [T.x + T.w / 2 + 4, T.y]]);
  const tankInk = line(T.x - T.w / 2 - 6, T.y + 1, T.x, T.y - 16, {seed: `${s}/tk1`, over: [2, 0]}) + line(T.x, T.y - 16, T.x + T.w / 2 + 6, T.y + 1, {seed: `${s}/tk2`, over: [0, 2]}) + line(T.x - T.w / 2, T.y, T.x - T.w / 2, T.y + T.h, {seed: `${s}/tk3`, over: 0}) + line(T.x + T.w / 2, T.y, T.x + T.w / 2, T.y + T.h, {seed: `${s}/tk4`, over: 0}) + line(T.x - T.w / 2 - 2, T.y + T.h, T.x + T.w / 2 + 2, T.y + T.h, {seed: `${s}/tk5`, over: [2, 2]}) + line(T.x - T.w / 2 + 6, T.y + T.h, T.x - T.w / 2 + 2, T.legs, {seed: `${s}/tk6`, over: 0}) + line(T.x + T.w / 2 - 6, T.y + T.h, T.x + T.w / 2 - 2, T.legs, {seed: `${s}/tk7`, over: 0}) + line(T.x - T.w / 2 + 4, T.y + T.h + 22, T.x + T.w / 2 - 4, T.legs - 6, {seed: `${s}/tk8`, over: 0}) + line(T.x - 12, T.y + 10, T.x - 12, T.y + T.h - 6, {seed: `${s}/tk9`, over: 0});
  const plants = crown(800, 684, 26, 18, {seed: `${s}/pl1`, bumps: 6}) + crown(846, 688, 20, 14, {seed: `${s}/pl2`, bumps: 5}) + crown(890, 686, 24, 16, {seed: `${s}/pl3`, bumps: 6});
  const R = S.R;
  let balcSlab = '';
  let balcRail = '';
  let balcInk = '';
  for (const by of RF.balconies) {
    const bx0 = 952;
    const bx1 = R.x + R.w + 26;
    balcSlab += rectPath(bx0 - 14, by, bx1 - bx0 + 14, 9);
    balcRail += rectPath(bx0 - 8, by - 34, bx1 - bx0 + 2, 34);
    balcInk += line(bx0 - 22, by, bx1 + 10, by, {seed: `${s}/bs${by}`, over: [6, 10]}) + line(bx0 - 18, by + 9, bx1 + 6, by + 9, {seed: `${s}/bs2${by}`, over: [4, 8]}) + line(bx0 - 8, by - 34, bx1, by - 34, {seed: `${s}/br${by}`, over: [3, 6]});
    for (let x = bx0 + 14; x < bx1; x += 26) balcInk += line(x, by - 32, x, by - 2, {seed: `${s}/bv${by}/${x}`, over: 0});
  }
  return {stoops, stoopInk, mansard, dormers, dormerGlass, dormerInk, mansardInk, chimney, chimneyInk, tank, tankInk, plants, balcSlab, balcRail, balcInk};
})();

const Roof: React.FC<{id: SiteId}> = ({id}) =>
  id === 'L' ? (
    <>
      <Fill d={G.mansard} color={palette.teal} seed="oq/mans" />
      <Fill d={G.dormers} color={palette.sand} seed="oq/dorm" />
      <Fill d={G.dormerGlass} color={palette.tealDark} offset={false} seed="oq/dormg" />
      <Ink d={G.mansardInk + G.dormerInk} width={SI.mid} seed="oq/mansi" />
    </>
  ) : id === 'M' ? (
    <>
      <Fill d={G.chimney} color={palette.tan} seed="oq/chim" />
      <Ink d={G.chimneyInk} width={SI.far} taper={false} seed="oq/chimI" />
    </>
  ) : (
    <>
      <Fill d={G.tank} color={palette.tan} seed="oq/tank" />
      <Ink d={G.tankInk} width={SI.far} taper={false} seed="oq/tanki" />
      <Fill d={G.plants} color={palette.sage} seed="oq/plants" />
      <Ink d={G.plants} width={SI.far} open={0.15} seed="oq/plantsi" />
    </>
  );

/** siteM's update page (the scene's last focal beat, read on a phone): a FAT progress bar spanning the window (32 px,
 *  3.4 ink outline, white trough, orange fill) creeps 4 % -> 7 % -> 10 % and STOPS with a 1-frame shudder (another, smaller
 *  one on the cane wobble); a hand-lettered readout above it ('10%', the rhyme of S11's '8%') pops to each step. */
export const STALL = {steps: [[0.04, 0.04], [0.13, 0.07], [0.23, 0.1]] as [number, number][], shudder: 0.42};
const UpdatePage: React.FC<{w: number; h: number; at: number; wobbleAt?: number}> = ({w, h, at, wobbleAt}) => {
  useCaptionFont();
  const t = useTime();
  let v = 0;
  let shown = 0;
  let popT = -1;
  for (const [dt, vv] of STALL.steps) {
    const ts = at + dt;
    if (t < ts) break;
    v = lerp(v, vv, prog(t, ts, 0.08, E.outCubic));
    shown = Math.round(vv * 100);
    popT = ts;
  }
  // the stall: a 1-frame shudder (4 px right) when it stops, a 2.5 px one on the wobble
  let dx = 0;
  if (t >= at + STALL.shudder && t < at + STALL.shudder + 1 / 30) dx = 4;
  if (wobbleAt !== undefined && t >= wobbleAt && t < wobbleAt + 1 / 30) dx = -2.5;
  const pad = 8;
  const tw = w - pad * 2;
  const th = 32;
  const ty = h - th - 14;
  const fs = 28;
  const k = popT >= 0 ? 1 + 0.18 * Math.max(0, 1 - (t - popT) / 0.12) : 1;
  return (
    <XG m={mat.translate(dx, 0)}>
      {shown > 0 ? (
        <XG m={mat.about(mat.scale(k), pad + 22, ty - 12)}>
          <text x={pad + 2} y={ty - 6} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
            {`${shown}%`}
          </text>
        </XG>
      ) : null}
      <Fill d={roundRect(pad, ty, tw, th, 6)} color={palette.white} offset={false} mode="snap" seed="s10u/tr" />
      {v > 0.002 ? <Fill d={rectPath(pad + 3, ty + 3, (tw - 6) * v, th - 6)} color={palette.sun} offset={false} mode="none" seed="s10u/f" /> : null}
      <Ink d={roundRect(pad, ty, tw, th, 6, {seed: 's10u/ti', closed: false})} width={3.4} taper={false} vary={0} seed="s10u/ti" />
    </XG>
  );
};

/** The stalled update's loading ring in siteM's title bar (1.4 x the chrome's): peach band, ink rims, ONE ink tick that
 *  spins (1.3 rev/s), popping in on the update. World coords. */
const StallRing: React.FC<{x: number; y: number; r: number; at: number}> = ({x, y, r, at}) => {
  const t = useTime();
  if (t < at) return null;
  const k = springAt(t, at, springs.pop);
  const band = r * 0.42;
  const a = (((t - at) * 1.3 * 360 - 90) * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return (
    <g transform={`translate(${x} ${y}) scale(${k.toFixed(4)})`}>
      <circle r={r} fill="none" stroke={palette.peach} strokeWidth={band} />
      <circle r={r + band / 2} fill="none" stroke={palette.ink} strokeWidth={2.4} />
      <circle r={Math.max(0.5, r - band / 2)} fill="none" stroke={palette.ink} strokeWidth={1.7} />
      <path d={`M${(c * (r - band * 0.75)).toFixed(2)} ${(sn * (r - band * 0.75)).toFixed(2)}L${(c * (r + band * 0.75)).toFixed(2)} ${(sn * (r + band * 0.75)).toFixed(2)}`} stroke={palette.ink} strokeWidth={3.2} strokeLinecap="round" />
    </g>
  );
};

/** siteL's and siteR's pages (fix round 2b: the three windows were one stamped page): siteL a blog page (an image tile
 *  with a sun-over-hill doodle left, a sage title bar + two lines right, one more line under both); siteR a shop page (a
 *  centred peach banner, a row of three framed product tiles, a sage button). siteM keeps the plain default page until
 *  its update takes over on 'anymore'. Screen-local coords (BrowserChrome `content`), static. */
const PageL: React.FC<{w: number; h: number}> = ({w, h}) => {
  const pad = 9;
  const tw = w * 0.38;
  const th = h - pad * 2 - 16;
  const x1 = pad + tw + 9;
  const hill = `M${pad} ${pad + th}Q${pad + tw * 0.35} ${pad + th * 0.45} ${pad + tw * 0.7} ${pad + th * 0.7}T${pad + tw} ${pad + th * 0.6}V${pad + th}Z`;
  return (
    <>
      <Fill d={rectPath(pad, pad, tw, th)} color={palette.mintPale} offset={false} mode="none" seed="s10pg/L/img" />
      <Fill d={hill} color={palette.sage} offset={false} mode="none" seed="s10pg/L/hill" />
      <Fill d={`M${pad + tw * 0.68 + 6} ${pad + th * 0.3}a6 6 0 1 0 0.01 0Z`} color={palette.sun} offset={false} mode="none" seed="s10pg/L/sun" />
      <Fill d={rectPath(x1, pad, w - x1 - pad, 13)} color={palette.sage} offset={false} mode="none" seed="s10pg/L/title" />
      <Ink
        d={rect(pad, pad, tw, th, {seed: 's10pg/L/imgI', over: 1}) + line(x1, pad + 27, w - pad - 6, pad + 27, {seed: 's10pg/L/l1', over: 0, breaks: false}) + line(x1, pad + 39, w - pad - 22, pad + 39, {seed: 's10pg/L/l2', over: 0, breaks: false}) + line(pad, h - pad - 3, w * 0.62, h - pad - 3, {seed: 's10pg/L/l3', over: 0, breaks: false})}
        width={SI.hair}
        taper={false}
        seed="s10pg/L/ink"
      />
    </>
  );
};
const PageR: React.FC<{w: number; h: number}> = ({w, h}) => {
  const pad = 8;
  const bw = w * 0.62;
  const ty = pad + 22;
  const n = 3;
  const gap = 7;
  const tw = (w - pad * 2 - gap * (n - 1)) / n;
  const tH = Math.min(tw * 0.9, h - ty - 26);
  let tiles = '';
  let tileFill = '';
  for (let i = 0; i < n; i++) {
    const x = pad + i * (tw + gap);
    tiles += rect(x, ty, tw, tH, {seed: `s10pg/R/t${i}`, over: 1});
    tileFill += rectPath(x + tw * 0.28, ty + tH * 0.3, tw * 0.44, tH * 0.44);
  }
  const btnY = ty + tH + 6;
  return (
    <>
      <Fill d={rectPath((w - bw) / 2, pad, bw, 13)} color={palette.peach} offset={false} mode="none" seed="s10pg/R/ban" />
      <Fill d={tileFill} color={palette.tan} offset={false} mode="none" seed="s10pg/R/prod" />
      <Fill d={roundRect(w - pad - 40, btnY, 40, 12, 5)} color={palette.sage} offset={false} mode="none" seed="s10pg/R/btn" />
      <Ink d={tiles + line(pad, btnY + 6, pad + 46, btnY + 6, {seed: 's10pg/R/l1', over: 0, breaks: false})} width={SI.hair} taper={false} seed="s10pg/R/ink" />
    </>
  );
};

export type SitesProps = {
  popAt: [number, number, number];
  /** siteM's browser starts its stalled update. */
  updateAt: number;
  /** The stalled bar shudders again (the cane wobble). */
  wobbleAt?: number;
};

/** Face-local hang points of the support tags (100-unit face coords): tied to the top screw on the side the cart comes
 *  from... siteL's top-right, siteR's top-left, so the tag hangs over the plate's edge, clear of the A-frame sign. */
export const TAG_HANG: Record<'L' | 'R', Pt> = {L: [44, -40], R: [-44, -40]};
export const PLAQUE_SIZE: Record<SiteId, number> = {L: 112, M: 120, R: 112};
/** Fix round 2: the three plaques hang 26 px higher than the set's anchors (y 1190 -> 1164): a >= 20 px band of wall
 *  between siteL's plaque and the A-frame's top bar, and room under the plaques (bottoms 1220-1224) for the cart's sign
 *  card above the stoops (1300). */
export const PLAQUE_DY = -26;
/** A plaque's face centre (world, at rest). */
export const plaqueRest = (id: SiteId) => ({x: S[id].sign.x, y: S[id].sign.y + PLAQUE_DY, size: PLAQUE_SIZE[id]});

/** siteM's title-bar ring spot (world): where the chrome reserves its ring (BrowserChrome pill geometry). */
function ringSpot(r: [number, number, number, number]): {x: number; y: number; r: number} {
  const [x, y, w, h] = r;
  const bar = Math.min(30, h * 0.27);
  const dr = bar * 0.25;
  const sp = bar * 0.63;
  const d0 = bar * 0.47;
  const px = d0 + 2 * sp + dr + bar * 0.38;
  const ringR = bar * 0.33;
  const pw = Math.max(bar, w - px - (ringR * 2 + bar * 0.5));
  return {x: x + px + pw + bar * 0.25 + ringR, y: y + bar / 2, r: ringR * 1.4};
}

export const Sites: React.FC<SitesProps> = ({popAt, updateAt, wobbleAt}) => {
  const t = useTime();
  const node = (id: SiteId, i: number) => {
    const c = S[id];
    const browserSlot =
      id !== 'M'
        ? (r: [number, number, number, number]) => (
            <BrowserChrome x={r[0]} y={r[1]} w={r[2]} h={r[3]} ink={SI.mid} content={id === 'L' ? ({w, h}) => <PageL w={w} h={h} /> : ({w, h}) => <PageR w={w} h={h} />} seed={`oq/site${id}/bw`} />
          )
        : (r: [number, number, number, number]) => {
            const rs = ringSpot(r);
            return (
              <>
                {/* ring={{at: never}} keeps the chrome's pill short (the ring's slot reserved); ours draws there */}
                <BrowserChrome x={r[0]} y={r[1]} w={r[2]} h={r[3]} ink={SI.mid} ring={{at: 1e6}} content={t >= updateAt ? ({w, h}) => <UpdatePage w={w} h={h} at={updateAt} wobbleAt={wobbleAt} /> : undefined} seed="oq/siteM/bw" />
                <StallRing x={rs.x} y={rs.y} r={rs.r} at={updateAt} />
              </>
            );
          };
    return (
      <PopUp key={id} at={popAt[i]} x={c.x + c.w / 2} y={OLD_QUARTER.base + 24}>
        <Roof id={id} />
        <SiteFacade x={c.x} y={OLD_QUARTER.base} w={c.w} storeys={c.storeys} storeyH={(OLD_QUARTER.base - c.top) / c.storeys} fill={c.fill} roof="cornice" browser={c.browser} door={c.door} plaque={false} lock="closed" cols={c.w > 300 ? 3 : 2} seed={`oq/site${id}`} slots={{browser: browserSlot}} />
        {id === 'R' ? (
          <>
            <Fill d={G.balcRail} color={palette.sage} seed="oq/brail" />
            <Fill d={G.balcSlab} color={palette.cream} offset={false} seed="oq/bslab" />
            <Ink d={G.balcInk} width={SI.far} taper={false} seed="oq/balci" />
          </>
        ) : null}
      </PopUp>
    );
  };
  return (
    <>
      {node('M', 1)}
      {node('L', 0)}
      {node('R', 2)}
    </>
  );
};

/** The near row as LINE ART first (fix round 2b): under the tram wipe, from 'Plus', the three facades draw on as thin
 *  construction lines (edges overshooting the top, cornice and base lines, storey ticks, door, browser window and
 *  roof outlines, each site 0.06 s after the last, as the wipe uncovers it); on 'something' the filled sites pop up
 *  INTO their outlines (scaleY from the base) and cover them; only the overshoots stay, like the reference's pen
 *  construction. Drawn behind the Sites, in the 'sites' layer. */
const SKETCH = (() => {
  const s = 's10sk';
  const out: Record<SiteId, string> = {L: '', M: '', R: ''};
  const B = OLD_QUARTER.base;
  for (const id of IDS) {
    const c = S[id];
    const x0 = c.x;
    const x1 = c.x + c.w;
    const top = c.top;
    const sh = (B - top) / c.storeys;
    let d = line(x0, B + 6, x0, top - 9, {seed: `${s}/${id}l`, over: 0, breaks: false}) + line(x1, B + 6, x1, top - 9, {seed: `${s}/${id}r`, over: 0, breaks: false});
    d += line(x0 - 11, top, x1 + 11, top, {seed: `${s}/${id}t`, over: 0, breaks: false}) + line(x0 - 14, B, x1 + 14, B, {seed: `${s}/${id}b`, over: 0, breaks: false});
    for (let k = 1; k < c.storeys; k++) {
      const y = B - k * sh;
      d += `M${x0 + 2} ${y.toFixed(1)}h14M${x1 - 2} ${y.toFixed(1)}h-14`;
    }
    // the window grid as open pen boxes (the same layout SiteFacade fills, so the pop lands on them)
    const lay = siteFacadeLayout({x: c.x, y: B, w: c.w, storeys: c.storeys, storeyH: sh, browser: c.browser, door: c.door, plaque: false, cols: c.w > 300 ? 3 : 2});
    lay.windows.forEach((r, k) => {
      d += rect(r[0], r[1], r[2], r[3], {seed: `${s}/${id}win${k}`, over: 1.5, edges: k % 2 ? 'tlb' : 'tlr'});
    });
    const [dx, dy, dw, dh] = c.door;
    d += rect(dx, dy, dw, dh, {seed: `${s}/${id}d`, over: 1, edges: 'tlr'});
    if (c.browser) {
      const [bx, by, bw, bh] = c.browser;
      d += rect(bx, by, bw, bh, {seed: `${s}/${id}w`, over: 2});
    }
    out[id] = d;
  }
  const M = OLD_QUARTER.roofs.mansard;
  out.L += line(M.x0 - 4, M.base + 3, M.x0 + M.inset, M.top, {seed: `${s}/ml`, over: [0, 4], breaks: false}) + line(M.x0 + M.inset - 6, M.top, M.x1 - M.inset + 6, M.top, {seed: `${s}/mt`, over: 0, breaks: false}) + line(M.x1 - M.inset, M.top, M.x1 + 4, M.base + 3, {seed: `${s}/mr`, over: [4, 0], breaks: false});
  out.M += rect(368, 798, 16, 22, {seed: `${s}/ch`, over: 2, edges: 'tlr'});
  const T = OLD_QUARTER.roofs.tank;
  out.R += rect(T.x - T.w / 2, T.y, T.w, T.h, {seed: `${s}/tk`, over: 2}) + `M${T.x - T.w / 2 + 6} ${T.y + T.h}L${T.x - T.w / 2 + 2} ${T.legs}M${T.x + T.w / 2 - 6} ${T.y + T.h}L${T.x + T.w / 2 - 2} ${T.legs}`;
  return out;
})();

export const SiteSketch: React.FC<{at: [number, number, number]; dur?: number}> = ({at, dur = 0.26}) => (
  <>
    {IDS.map((id, i) => (
      <Ink key={id} d={SKETCH[id]} at={at[i]} dur={dur} order="all" width={SI.hair * 1.2} taper={false} seed={`s10sk/${id}`} />
    ))}
  </>
);

/** The three stoops, popping with their sites. Drawn IN FRONT of the cart line (Scene10's 'sign' layer): the cart rolls
 *  just behind the stoops' front edge, so its wheels and the maker's feet pass behind them (and clear of Pip's ears). */
export const Stoops: React.FC<{popAt: [number, number, number]}> = ({popAt}) => (
  <>
    {IDS.map((id, i) => (
      <PopUp key={id} at={popAt[i]} x={S[id].x + S[id].w / 2} y={OLD_QUARTER.base + 24}>
        <Fill d={G.stoops[i]} color={palette.sand} seed={`oq/stoop${id}`} />
        <Ink d={G.stoopInk[i]} width={SI.mid} taper={false} seed={`oq/stoopI${id}`} />
      </PopUp>
    ))}
  </>
);

export type PlaquesProps = {
  /** Plaques swing out (L, M, R). */
  plaqueAt: [number, number, number];
  /** siteM's plaque events (HangPlaque). */
  old: Pick<HangPlaqueProps, 'flipOldAt' | 'cobwebAt' | 'dustAt' | 'caneAt' | 'droopAt' | 'wobbleAt' | 'bit' | 'nudgeAt'>;
  /** Support tags landing on siteL's / siteR's plaques. */
  tagL?: {at: number; tickAt: number; ringAt?: number};
  tagR?: {at: number; tickAt: number; ringAt?: number};
};

/** The three hanging plaques. They project toward the camera from their brackets, so they are drawn ABOVE the cart line
 *  (the maker and the cart pass behind them): Scene10 renders them in the set's 'sign' layer. */
export const Plaques: React.FC<PlaquesProps> = ({plaqueAt, old, tagL, tagR}) => {
  const sg = (id: SiteId) => ({...S[id].sign, y: S[id].sign.y + PLAQUE_DY});
  return (
    <>
      <HangPlaque x={sg('L').x} y={sg('L').y} size={PLAQUE_SIZE.L} wallX={sg('L').wallX} at={plaqueAt[0]} tag={tagL ? {...tagL, hang: TAG_HANG.L} : undefined} seed="s10/plqL" />
      <HangPlaque x={sg('M').x} y={sg('M').y} size={PLAQUE_SIZE.M} wallX={sg('M').wallX} at={plaqueAt[1]} {...old} seed="s10/plqM" />
      <HangPlaque x={sg('R').x} y={sg('R').y} size={PLAQUE_SIZE.R} wallX={sg('R').wallX} at={plaqueAt[2]} tag={tagR ? {...tagR, hang: TAG_HANG.R} : undefined} seed="s10/plqR" />
    </>
  );
};

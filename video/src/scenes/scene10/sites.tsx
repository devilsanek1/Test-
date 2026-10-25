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
import {crown, line, polyPath, Pt, rectPath, roundRect} from '../../lib/sketch';
import {BrowserChrome, OLD_QUARTER, PopUp, SI, SiteFacade} from './kit';
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
  const A = RF.antenna;
  const antenna = line(A.x, A.base, A.x, A.top, {seed: `${s}/an`, over: 0}) + line(A.x - 34, A.top + 14, A.x + 30, A.top + 14, {seed: `${s}/an1`, over: [2, 2]}) + line(A.x - 26, A.top + 34, A.x + 24, A.top + 34, {seed: `${s}/an2`, over: [2, 2]}) + line(A.x - 18, A.top + 52, A.x + 16, A.top + 52, {seed: `${s}/an3`, over: [2, 2]}) + line(A.x, A.top + 60, A.x + 42, A.base, {seed: `${s}/an4`, over: 0});
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
  return {stoops, stoopInk, mansard, dormers, dormerGlass, dormerInk, mansardInk, antenna, tank, tankInk, plants, balcSlab, balcRail, balcInk};
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
    <Ink d={G.antenna} width={SI.far} taper={false} seed="oq/ant" />
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
      id === 'M'
        ? (r: [number, number, number, number]) => {
            const rs = ringSpot(r);
            return (
              <>
                {/* ring={{at: never}} keeps the chrome's pill short (the ring's slot reserved); ours draws there */}
                <BrowserChrome x={r[0]} y={r[1]} w={r[2]} h={r[3]} ink={SI.mid} ring={{at: 1e6}} content={t >= updateAt ? ({w, h}) => <UpdatePage w={w} h={h} at={updateAt} wobbleAt={wobbleAt} /> : undefined} seed="oq/siteM/bw" />
                <StallRing x={rs.x} y={rs.y} r={rs.r} at={updateAt} />
              </>
            );
          }
        : undefined;
    return (
      <PopUp key={id} at={popAt[i]} x={c.x + c.w / 2} y={OLD_QUARTER.base + 24}>
        <Roof id={id} />
        <SiteFacade x={c.x} y={OLD_QUARTER.base} w={c.w} storeys={c.storeys} storeyH={(OLD_QUARTER.base - c.top) / c.storeys} fill={c.fill} roof="cornice" browser={c.browser} door={c.door} plaque={false} lock="closed" cols={c.w > 300 ? 3 : 2} seed={`oq/site${id}`} slots={browserSlot ? {browser: browserSlot} : undefined} />
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
  old: Pick<HangPlaqueProps, 'flipOldAt' | 'cobwebAt' | 'dustAt' | 'caneAt' | 'droopAt' | 'wobbleAt' | 'bit'>;
  /** Support tags landing on siteL's / siteR's plaques. */
  tagL?: {at: number; tickAt: number};
  tagR?: {at: number; tickAt: number};
};

/** The three hanging plaques. They project toward the camera from their brackets, so they are drawn ABOVE the cart line
 *  (the maker and the cart pass behind them): Scene10 renders them in the set's 'sign' layer. */
export const Plaques: React.FC<PlaquesProps> = ({plaqueAt, old, tagL, tagR}) => {
  const sg = (id: SiteId) => S[id].sign;
  return (
    <>
      <HangPlaque x={sg('L').x} y={sg('L').y} size={PLAQUE_SIZE.L} wallX={sg('L').wallX} at={plaqueAt[0]} tag={tagL ? {...tagL, hang: TAG_HANG.L} : undefined} seed="s10/plqL" />
      <HangPlaque x={sg('M').x} y={sg('M').y} size={PLAQUE_SIZE.M} wallX={sg('M').wallX} at={plaqueAt[1]} {...old} seed="s10/plqM" />
      <HangPlaque x={sg('R').x} y={sg('R').y} size={PLAQUE_SIZE.R} wallX={sg('R').wallX} at={plaqueAt[2]} tag={tagR ? {...tagR, hang: TAG_HANG.R} : undefined} seed="s10/plqR" />
    </>
  );
};

// World.tsx — the FULL-BLEED stage. Every v2 scene returns one <World>. The 1080 x 1920 frame is a window into the
// world: world coordinates = canvas pixels at camera rest, no card, no panel clip. The sky is the background slab
// (it collapses downward last in an un-build). Captions are NOT part of the scene (Film draws them in screen space).
//
//   const Scene07: React.FC = () => (
//     <World sky={[{t: 0, tod: 'day'}, {t: 4.2, tod: 'dusk', wipe: 'down'}]} push>
//       <Sun cx={540} cy={860} beats={[1.3, 2.8]} horizon={900} />
//       ...ground, buildings, crowd, mascot (world px)...
//     </World>
//   );
//
// SKY + TIME OF DAY (one sky, one lighting model):
//   sky = colour | bands (string[], top -> horizon) | a cine TOD palette (TOD.night: its skyBands + its name) |
//         SkyKey[] = [{t, color?, tod?, wipe?, dur?}]
//   A key's `tod` RELIGHTS THE WHOLE SCENE (every <Fill> through lib/tod.tsx: reference 2's step table) in step with
//   the sky wipe: the sky slab wipes (default: down, 0.4 s, linear; or a 1-frame snap), and every OBJECT flips whole
//   in one frame when the sky edge reaches its centre / its <TodAnchor> (motion spec #12: per-object pops, staggered
//   by height; no clip edge through figures, no double render). A key with only `tod` takes its colour from
//   theme.todSky. Never a fade. Pair a dark sky with captionTone 'light' (scenes.json; give the tone key the same
//   `wipe` so the caption colour follows the edge too).
//   A key WITHOUT `tod` only recolours the sky (it inherits the light): a stepped UNIFORM tween (no wipe edge through
//   the captions) is consecutive `snap` keys with explicit colours, the last one carrying the new `tod` (every object
//   relights in that one frame, nothing relights on the colour-only steps):
//     [{t: 0, tod: 'golden'}, {t: 5.0, color: '#A0C7B5', wipe: 'snap'}, {t: 5.15, color: '#94BDAA', wipe: 'snap'},
//      {t: 5.3, color: '#88B3A0', wipe: 'snap'}, {t: 5.45, color: '#7CA995', wipe: 'snap'},
//      {t: 5.6, color: '#709F8B', tod: 'dusk', wipe: 'snap'}]
//
// CAMERA: `push` = the per-shot gentle zoom reference 2 gives every shot (default 1.00 -> 1.06 over 2 s from t 0,
//   ease in-out sine, about world.vp). After an incoming PULL-BACK (push-through, camera-continuous 'out') the default
//   becomes the matching pull-out (1 / 1.06, stage.pushTo): the leg lands into a slow continuing pull-back. An explicit
//   `to` that runs AGAINST the incoming leg waits until that leg has settled (stage.pushStart): no camera bounce, no
//   reversal a beat after the cut. For multiplane moves use <ShotCam> / cine <CineCamera stage> inside.
// INK: `push.inkComp` (and a Film transition flagged `inkComp`, applied here in flat mode) draws the engine's strokes at
//   width x zoom^-k (lib/inkComp.tsx). Default off.
// stage="flat" (default): the transition camera moves the whole scene as one plane and is CONSUMED here (children see
//   useStageCam() = rest, so a <CineCamera stage> inside can never apply it twice). stage="context": World does not
//   apply it; your <CineCamera stage> / <ShotCam> folds it in with real parallax. useWorldStage() tells which.

import React, {useId} from 'react';
import {AbsoluteFill} from 'remotion';
import {skies, TodName, todSky, world} from './theme';
import {Fill, FrameArea} from './Fill';
import {AppliedStageProvider, pushStart, pushTo, SceneInfo, StageCamProvider, stageMat, STAGE_REST, StageKindProvider, useAppliedStageMat, useScene, useStageCam, useStageClip, visibleRectOf, WorldStageProvider, zoomAbout} from './stage';
import {mat, Mat, XG} from './xf';
import {Ease, ease as E, clamp, prog, useTime} from './time';
import {exitFillProgress, SlabEdge, useExit} from './exit';
import {Tod, TodWave, waveEdgeP} from './tod';
import {MOTION} from './spec';
import {InkScale, inkCompFactor} from './inkComp';
import type {Pt} from './sketch';

export type SkyWipe = 'down' | 'up' | 'left' | 'right' | 'snap';

export type SkyKey = {
  /** Scene seconds. */
  t: number;
  /** Flat colour or bands (top -> horizon). Default: theme.todSky[tod] when `tod` is given, else the previous key's. */
  color?: string | string[];
  /** Time of day from this key on: relights every Fill with the same wipe. Default: the previous key's. */
  tod?: TodName;
  /** How this key arrives: 'down' (default: slides down from the top), 'up', 'left', 'right' or 'snap' (1 frame). */
  wipe?: SkyWipe;
  /** Wipe duration (s). Default 0.4. */
  dur?: number;
};

/** A cine TOD palette fits this shape (TOD.night): its bands become the sky and its name the time of day. */
export type TodSky = {name: TodName; skyBands: string[]};
export type SkySpec = string | string[] | SkyKey[] | TodSky;

export type WorldPush = {
  /** Zoom at the end. Default 1.06 (reference 2: +1.3 ... +5.9 %, median 3.7 %; the brief: 3-8 %); after an incoming
   *  pull-back (push-through, camera-continuous 'out') 1 / 1.06 (stage.pushTo). <1 = pull-out. */
  to?: number;
  /** Seconds. Default 2. */
  dur?: number;
  /** Start (scene s). Default 0 (reference 2 starts with the cut). */
  at?: number;
  /** World point that stays put. Default world.vp. */
  anchor?: Pt;
  /** Default in-out sine (reference 2 measured). */
  ease?: Ease;
  /** Opt-in ink compensation exponent (0.6 = house): strokes drawn at width x pushZoom^-inkComp (lib/inkComp.tsx).
   *  Default off (a 1.06 push needs none; meant for a big push). */
  inkComp?: number;
};

export type WorldProps = {
  /** Sky (see header). Default skies.day. */
  sky?: SkySpec;
  /** Time of day when the sky keys do not say (static scenes). Default 'day'. */
  tod?: TodName;
  /** Where sky bands end (y). Default world.horizon. Bands stay below y 600 (the caption band is one flat value). */
  horizon?: number;
  /** 'flat' (default): the transition camera moves the whole scene as one plane. 'context': your camera applies it. */
  stage?: 'flat' | 'context';
  /** Gentle per-shot zoom (true = defaults). */
  push?: WorldPush | boolean;
  /** Extra screen-space overlay (drawn above the scene, unaffected by any camera): letterbox bars, flashes. */
  overlay?: React.ReactNode;
  children?: React.ReactNode;
};

type NKey = {t: number; bands: string[]; tod: TodName; wipe: SkyWipe; dur: number};

const isTodSky = (s: SkySpec): s is TodSky => typeof s === 'object' && !Array.isArray(s) && Array.isArray((s as TodSky).skyBands);

/** Normalised sky keys: every key has bands and a time of day (inherited), the first one is always shown. */
export function skyKeys(sky: SkySpec | undefined, tod: TodName = 'day'): NKey[] {
  const one = (bands: string[], td: TodName): NKey[] => [{t: -1e9, bands, tod: td, wipe: 'snap', dur: 0}];
  if (sky === undefined) return one([tod === 'day' ? skies.day : todSky[tod]], tod);
  if (typeof sky === 'string') return one([sky], tod);
  if (isTodSky(sky)) return one(sky.skyBands.length ? sky.skyBands : [todSky[sky.name]], sky.name);
  if (!sky.length) return one([skies.day], tod);
  if (typeof sky[0] === 'string') return one(sky as string[], tod);
  const out: NKey[] = [];
  let prevBands = [todSky[tod]];
  let prevTod = tod;
  (sky as SkyKey[]).forEach((k, i) => {
    const td = k.tod ?? prevTod;
    const c = k.color ?? (k.tod ? todSky[k.tod] : prevBands);
    const bands = typeof c === 'string' ? [c] : c;
    out.push({t: i === 0 ? -1e9 : k.t, bands, tod: td, wipe: i === 0 ? 'snap' : k.wipe ?? 'down', dur: k.dur ?? 0.4});
    prevBands = bands;
    prevTod = td;
  });
  return out;
}

/** Current sky colour (top band) of a sky spec at scene time t (ignores wipes in progress). */
export function skyAt(sky: SkySpec | undefined, t: number): string {
  const ks = skyKeys(sky);
  let c = ks[0].bands[0];
  for (const k of ks) if (t >= k.t + (k.wipe === 'snap' ? 0 : k.dur * 0.5)) c = k.bands[0];
  return c;
}

/** Time of day of a sky spec at scene time t (switches when the wipe completes). */
export function todAt(sky: SkySpec | undefined, t: number, tod: TodName = 'day'): TodName {
  const ks = skyKeys(sky, tod);
  let v = ks[0].tod;
  for (const k of ks) if (t >= k.t + (k.wipe === 'snap' ? 0 : k.dur)) v = k.tod;
  return v;
}

/** Progress 0..1 of a key's wipe at t. */
const wipeP = (k: NKey, t: number) => (k.wipe === 'snap' ? (t >= k.t ? 1 : 0) : prog(t, k.t, k.dur));

/** The swept region [x, y, w, h] of a wipe at progress p inside rect r (the same edge for the sky and the relight). */
export function wipeRegion(wipe: SkyWipe, p: number, r: [number, number, number, number]): [number, number, number, number] {
  const [x, y, w, h] = r;
  const q = clamp(p);
  switch (wipe) {
    case 'down':
      return [x, y, w, h * q];
    case 'up':
      return [x, y + h * (1 - q), w, h * q];
    case 'right':
      return [x, y, w * q, h];
    case 'left':
      return [x + w * (1 - q), y, w * q, h];
    default:
      return q >= 1 ? r : [x, y, 0, 0];
  }
}

/** Band rectangles of a sky (same geometry as the cine <Sky>: geometric steps toward the horizon, all below y 600). */
function bandRects(bands: string[], horizon: number, r: [number, number, number, number]): [number, number, number, number][] {
  const n = bands.length;
  const [x, y, w, h] = r;
  if (n <= 1) return [r];
  const span = Math.max(160, Math.min(1150, horizon - 600));
  const ratio = n > 2 ? Math.pow(Math.min(110, span * 0.5) / span, 1 / (n - 2)) : 1;
  const e = Array.from({length: n - 1}, (_, i) => span * Math.pow(ratio, i));
  return bands.map((_, i) => {
    const y0 = i === 0 ? y : Math.max(y, horizon - e[i - 1]);
    return [x, y0, w, y + h - y0];
  });
}

const rectAttrs = (r: [number, number, number, number]) => ({x: r[0], y: r[1], width: Math.max(0, r[2]), height: Math.max(0, r[3])});

const SkyLayer: React.FC<{keys: NKey[]; rect: [number, number, number, number]; horizon: number; uid: string}> = ({keys, rect, horizon, uid}) => {
  const t = useTime();
  const e = useExit();
  const drain = exitFillProgress(e, 0, 1);
  if (drain >= 1) return null;
  const k = E.inCubic(drain);
  const parts: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  keys.forEach((key, i) => {
    if (i > 0 && t < key.t) return;
    // once a later key has fully covered this one, stop drawing it
    const next = keys[i + 1];
    if (next && t >= next.t + (next.wipe === 'snap' ? 0 : next.dur)) return;
    const p = i === 0 ? 1 : wipeP(key, t);
    if (p <= 0) return;
    const bands = bandRects(key.bands, horizon, rect).map((br, j) => <Fill key={j} rect={br} color={key.bands[j]} offset={false} exit={false} lookExempt seed={`sky${i}b${j}`} />);
    if (p >= 1) {
      parts.push(<React.Fragment key={i}>{bands}</React.Fragment>);
      return;
    }
    const id = `${uid}w${i}`;
    defs.push(
      <clipPath key={id} id={id} clipPathUnits="userSpaceOnUse">
        <rect {...rectAttrs(wipeRegion(key.wipe, p, rect))} />
      </clipPath>,
    );
    parts.push(
      <g key={i} clipPath={`url(#${id})`}>
        {bands}
      </g>,
    );
  });
  // un-build: the sky is the slab, it collapses downward last
  if (k > 0) {
    const id = `${uid}x`;
    return (
      <>
        <defs>
          {defs}
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <rect {...rectAttrs([rect[0], rect[1] + rect[3] * k, rect[2], rect[3] * (1 - k)])} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`}>{parts}</g>
      </>
    );
  }
  return (
    <>
      {defs.length ? <defs>{defs}</defs> : null}
      {parts}
    </>
  );
};

/** The push camera of a World at scene time t (rest when no push). With `scene` (useScene()), a push that would
 *  reverse the scene's incoming camera-continuous zoom starts when that transition has settled (pushStart). */
export function worldPushMat(push: WorldPush | boolean | undefined, t: number, scene?: SceneInfo): Mat {
  if (!push) return mat.I;
  const p = push === true ? {} : push;
  const to = pushTo(p.to, scene);
  const q = prog(t, pushStart(p.at ?? 0, to, scene), p.dur ?? MOTION.camera.push.dur, p.ease ?? MOTION.camera.push.ease);
  if (q <= 0 || to === 1) return mat.I;
  return stageMat(zoomAbout(p.anchor ?? world.vp, Math.exp(Math.log(to) * q)));
}

export const World: React.FC<WorldProps> = ({sky = skies.day, tod, horizon = world.horizon, stage = 'flat', push, overlay, children}) => {
  const t = useTime();
  const cam = useStageCam();
  const clip = useStageClip();
  const uid = 'wd' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const scene = useScene();
  const pm = worldPushMat(push, t, scene);
  const m = stage === 'flat' ? mat.mul(stageMat(cam), pm) : pm;
  // opt-in ink compensation (lib/inkComp.tsx): a flagged transition camera (flat only: a 'context' World passes it on
  // to <CineCamera stage>) x a flagged push (pm is a pure zoom: pm[0] = its zoom). 1 by default.
  const pk = push && push !== true ? push.inkComp : undefined;
  const inkF = (stage === 'flat' ? cam.ink ?? 1 : 1) * (pk ? inkCompFactor(pm[0], pk) : 1);
  const rect = visibleRectOf(m, 60);
  const keys = skyKeys(sky, tod);
  // time of day: the current key's light; while its wipe runs, a relight WAVE: every object flips whole (one frame)
  // when the sky edge reaches its centre (lib/tod.tsx), so the scene is drawn once and no edge cuts through a figure
  // The LIGHT follows only the keys that change `tod`: a colour-only key (e.g. the steps of a stepped uniform tween:
  // consecutive `snap` keys with explicit colours) inherits the time of day and never relights, and never cuts a
  // running relight wave short. A `snap` key that carries a new `tod` relights every object in its one frame.
  let cur = 0;
  for (let i = 1; i < keys.length; i++) if (t >= keys[i].t) cur = i;
  let light = 0;
  for (let i = 1; i <= cur; i++) if (keys[i].tod !== keys[i - 1].tod) light = i;
  const curTod = keys[cur].tod;
  const prevTod = light > 0 ? keys[light - 1].tod : curTod;
  const p = light > 0 ? wipeP(keys[light], t) : 1;
  let relit: React.ReactNode;
  if (prevTod !== curTod && p < 1) {
    const wave: TodWave = {from: prevTod, to: curTod, p, wipe: keys[light].wipe, rect, inv: mat.inv(m)};
    const vpTod = p >= waveEdgeP(wave, world.vp[0], world.vp[1]) ? curTod : prevTod;
    relit = (
      <Tod value={vpTod} wave={wave}>
        {children}
      </Tod>
    );
  } else relit = <Tod value={curTod}>{children}</Tod>;
  return (
    <AbsoluteFill style={{overflow: 'hidden', clipPath: clip}}>
      <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
        <StageKindProvider value="world">
          <WorldStageProvider value={stage}>
            <StageCamProvider value={stage === 'flat' ? STAGE_REST : cam}>
              <AppliedStageProvider value={m}>
                <FrameArea value={world.w * world.h}>
                  <XG m={m}>
                    <SkyLayer keys={keys} rect={rect} horizon={horizon} uid={uid} />
                    {/* slab fills (a bleed ground, a big wall) collapse under the sky's own falling edge: one slab */}
                    <SlabEdge value={{rect, m}}>
                      <InkScale value={inkF}>{relit}</InkScale>
                    </SlabEdge>
                  </XG>
                  {overlay}
                </FrameArea>
              </AppliedStageProvider>
            </StageCamProvider>
          </WorldStageProvider>
        </StageKindProvider>
      </svg>
    </AbsoluteFill>
  );
};

/** Children drawn in SCREEN space inside a <World> (they ignore the transition camera and the push): HUD-like layers.
 *  No camera zooms them, so no camera ink compensation either (InkScale reset to 1). */
export const ScreenSpace: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const m = useAppliedStageMat();
  return (
    <XG m={mat.inv(m)}>
      <InkScale reset>{children}</InkScale>
    </XG>
  );
};

/** Progress helper for sky-synced events: 0..1 over a sky key's wipe. */
export const skyWipeProgress = (k: SkyKey, t: number) => (k.wipe === 'snap' ? (t >= k.t ? 1 : 0) : prog(t, k.t, k.dur ?? 0.4));

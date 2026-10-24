// World.tsx — the FULL-BLEED stage. Every v2 scene returns one <World>. The 1080 x 1920 frame is a window into the
// world: world coordinates = canvas pixels at camera rest, no card, no panel clip. The sky is the background slab
// (it collapses downward last in an un-build). Captions are NOT part of the scene (Film draws them in screen space).
//
//   const Scene07: React.FC = () => (
//     <World sky={[{t: 0, color: skies.day}, {t: 4.2, color: skies.dusk, wipe: 'down'}]}>
//       <Sun cx={540} cy={860} beats={[1.3, 2.8]} horizon={900} />
//       ...ground, buildings, crowd, mascot (world px)...
//     </World>
//   );
//
// The sky changes by a WIPE (default: the new colour slides down from the top in 0.4 s) or a 1-frame snap. Never a
// fade. Pair a dark sky with captionTone 'light' in src/data/scenes.json at the same time.
// stage="context": the transition camera is NOT applied flat; read useStageCam() in your own (multiplane) camera.

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {skies, world} from './theme';
import {Fill, FrameArea} from './Fill';
import {stageMat, StageKindProvider, useStageCam, useStageClip, visibleRect} from './stage';
import {mat, XG} from './xf';
import {prog, useTime} from './time';

export type SkyKey = {
  /** Scene seconds. */
  t: number;
  color: string;
  /** How this colour arrives: 'down' (default: slides down from the top), 'up', 'left', 'right' or 'snap' (1 frame). */
  wipe?: 'down' | 'up' | 'left' | 'right' | 'snap';
  /** Wipe duration (s). Default 0.4. */
  dur?: number;
};

export type WorldProps = {
  /** Flat sky colour, or timed sky changes. Default skies.day (mint). */
  sky?: string | SkyKey[];
  /** 'flat' (default): the transition camera moves the whole scene as one plane. 'context': you apply useStageCam(). */
  stage?: 'flat' | 'context';
  /** Extra screen-space overlay (drawn above the scene, unaffected by any camera): letterbox bars, flashes. */
  overlay?: React.ReactNode;
  children?: React.ReactNode;
};

/** Current sky colour of a sky spec at scene time t (ignores wipes in progress). */
export function skyAt(sky: string | SkyKey[] | undefined, t: number): string {
  if (!sky) return skies.day;
  if (typeof sky === 'string') return sky;
  let c = sky[0]?.color ?? skies.day;
  for (const k of sky) if (t >= k.t + (k.wipe === 'snap' ? 0 : (k.dur ?? 0.4) * 0.5)) c = k.color;
  return c;
}

const Sky: React.FC<{sky: string | SkyKey[]; rect: [number, number, number, number]}> = ({sky, rect}) => {
  const t = useTime();
  const keys: SkyKey[] = typeof sky === 'string' ? [{t: -1e9, color: sky}] : sky.length ? sky : [{t: -1e9, color: skies.day}];
  return (
    <>
      {keys.map((k, i) => {
        if (i > 0 && t < k.t) return null;
        // once a later key has fully covered this one, stop drawing it
        const next = keys[i + 1];
        if (next && t >= next.t + (next.wipe === 'snap' ? 0 : next.dur ?? 0.4)) return null;
        const wipe = i === 0 ? undefined : k.wipe ?? 'down';
        return (
          <Fill
            key={i}
            rect={rect}
            color={k.color}
            at={i === 0 ? undefined : k.t}
            mode={wipe === 'snap' || wipe === undefined ? 'snap' : 'wipe'}
            dir={wipe === 'snap' || wipe === undefined ? undefined : wipe}
            dur={k.dur ?? 0.4}
            offset={false}
            seed={`sky${i}`}
            exitMode="slab"
            lookExempt
          />
        );
      })}
    </>
  );
};

export const World: React.FC<WorldProps> = ({sky = skies.day, stage = 'flat', overlay, children}) => {
  const cam = useStageCam();
  const clip = useStageClip();
  const m = stage === 'flat' ? stageMat(cam) : stageMat({ox: 0, oy: 0, zoom: 1, rot: 0});
  const rect = visibleRect(stage === 'flat' ? cam : {ox: 0, oy: 0, zoom: 1, rot: 0}, 60);
  return (
    <AbsoluteFill style={{overflow: 'hidden', clipPath: clip}}>
      <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
        <StageKindProvider value="world">
          <FrameArea value={world.w * world.h}>
            <XG m={m}>
              <Sky sky={sky} rect={rect} />
              {children}
            </XG>
            {overlay}
          </FrameArea>
        </StageKindProvider>
      </svg>
    </AbsoluteFill>
  );
};

/** Children drawn in SCREEN space inside a flat <World> (they ignore the transition camera): HUD-like layers. */
export const ScreenSpace: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const cam = useStageCam();
  return <XG m={mat.inv(stageMat(cam))}>{children}</XG>;
};

/** Progress helper for sky-synced events: 0..1 over a sky key's wipe. */
export const skyWipeProgress = (k: SkyKey, t: number) => (k.wipe === 'snap' ? (t >= k.t ? 1 : 0) : prog(t, k.t, k.dur ?? 0.4));

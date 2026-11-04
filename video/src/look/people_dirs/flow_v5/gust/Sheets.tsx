// FLOW v5, GUST: the compositions (the sheets are built as SVG strings in sheets.ts).
//   F5GHer     01_her.png        F5GCast    02_cast.png       F5GMotion  03_motion.png
//   F5GClip    motion.mp4 (4 s, 9:16, 60 fps)                 F5GScene   04_in_scene.png
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {PLATE_V6, PLATE_W, PLATE_H} from '../../hair_v2/plate';
import {herSheet, castSheet, motionSheet, clipFrame, sceneSheet, HER_W, HER_H, CAST_W, CAST_H, MOTION_W, MOTION_H, CLIP_W, CLIP_H, SCENE_W, SCENE_H, C} from './sheets';

const Svg: React.FC<{w: number; h: number; svg: string}> = ({w, h, svg}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} dangerouslySetInnerHTML={{__html: svg}} />
  </AbsoluteFill>
);

export const F5GHer: React.FC = () => <Svg w={HER_W} h={HER_H} svg={herSheet()} />;
export const F5GCast: React.FC = () => <Svg w={CAST_W} h={CAST_H} svg={castSheet()} />;
export const F5GMotion: React.FC = () => <Svg w={MOTION_W} h={MOTION_H} svg={motionSheet()} />;
export const F5GClip: React.FC = () => {
  const f = useCurrentFrame();
  return <Svg w={CLIP_W} h={CLIP_H} svg={clipFrame(f / 60)} />;
};
export const F5GScene: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {/* the hidden Img makes the render wait until the plate is decoded */}
    <Img src={PLATE_V6} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
    <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} dangerouslySetInnerHTML={{__html: sceneSheet(PLATE_V6, PLATE_W, PLATE_H)}} />
  </AbsoluteFill>
);
export const SIZES = {HER_W, HER_H, CAST_W, CAST_H, MOTION_W, MOTION_H, CLIP_W, CLIP_H, SCENE_W, SCENE_H};

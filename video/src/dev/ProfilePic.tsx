import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {palette} from '../lib/theme';
import {Elephant} from '../lib/mascot';
import {brush, spline, Pt} from '../lib/mascot/ink';

// Profile picture (dev): the square 1080 x 1080 art sits at the top of the 1080 x 1920 canvas; crop y 0-1080.
// Variants via --props='{"variant":"sun"|"power"|"trumpet"|"peek"}'. Everything important stays inside the central
// circle (platforms crop avatars round). Pip is drawn at scale 2 inside a x2.7 group, so his ink reads at ~9 px:
// thick enough to survive a ~100 px avatar.

type Variant = 'sun' | 'power' | 'trumpet' | 'peek';
const K = 2.7;

const Line: React.FC<{pts: Pt[]; w?: number; seed?: number; color?: string}> = ({pts, w = 8, seed = 1, color = palette.ink}) => (
  <path d={brush(spline(pts), {w, seed, tipIn: 0.6, tipOut: 0.6})} fill={color} />
);

const Disc: React.FC<{cx: number; cy: number; r: number; color?: string}> = ({cx, cy, r, color = palette.sun}) => (
  // flat fill, slightly off-register like the film's sun
  <circle cx={cx + 3} cy={cy - 2} r={r} fill={color} />
);

/** The power glyph (the film's hook icon), cream on the sun. */
const Power: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  const a0 = (35 * Math.PI) / 180;
  const a1 = (325 * Math.PI) / 180;
  const pts: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = a0 + ((a1 - a0) * i) / 24;
    pts.push([cx + Math.sin(a) * r, cy - Math.cos(a) * r]);
  }
  return (
    <g>
      <Line pts={pts} w={r * 0.2} seed={11} color={palette.cream} />
      <Line pts={[[cx, cy - r * 1.18], [cx + 1, cy - r * 0.2]]} w={r * 0.2} seed={12} color={palette.cream} />
    </g>
  );
};

const Pip: React.FC<{x: number; y: number; k?: number; pose: React.ComponentProps<typeof Elephant>['pose']; t: number; look?: number; expression?: React.ComponentProps<typeof Elephant>['expression']; flip?: boolean; amount?: number}> = ({x, y, k = K, ...rest}) => (
  <g transform={`scale(${k})`}>
    <Elephant x={x / k} y={y / k} scale={2} seed={3} idle={0} {...rest} />
  </g>
);

export const ProfilePic: React.FC<{variant?: Variant}> = ({variant = 'sun'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = 1 + frame / fps;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill={palette.bg} />
      {variant === 'sun' ? (
        <g>
          <Disc cx={540} cy={450} r={320} />
          <rect x={0} y={860} width={1080} height={220} fill={palette.teal} />
          <rect x={0} y={930} width={1080} height={150} fill={palette.tealDark} />
          <Line pts={[[-10, 860], [360, 858], [1090, 862]]} w={10} seed={2} />
          <Pip x={540} y={872} k={3.25} pose="sit-front" expression="happy" t={t} />
        </g>
      ) : variant === 'power' ? (
        <g>
          <Disc cx={540} cy={420} r={300} />
          <Power cx={540} cy={330} r={100} />
          <rect x={0} y={900} width={1080} height={180} fill={palette.teal} />
          <Line pts={[[-10, 900], [540, 898], [1090, 902]]} w={10} seed={4} />
          <Pip x={540} y={912} k={2.5} pose="sit-front" expression="happy" t={t} />
        </g>
      ) : variant === 'trumpet' ? (
        <g>
          <Disc cx={540} cy={470} r={330} />
          <rect x={0} y={890} width={1080} height={190} fill={palette.teal} />
          <Line pts={[[-10, 890], [540, 888], [1090, 892]]} w={10} seed={6} />
          <Pip x={540} y={902} k={3.0} pose="trunk-up" expression="happy" t={t} />
        </g>
      ) : (
        <g>
          <Disc cx={600} cy={430} r={260} />
          <rect x={0} y={0} width={470} height={1080} fill={palette.teal} />
          <rect x={60} y={190} width={330} height={460} fill={palette.mintPale} />
          <Line pts={[[470, -10], [472, 500], [470, 1090]]} w={10} seed={8} />
          <Line pts={[[56, 190], [394, 191]]} w={7} seed={9} />
          <Line pts={[[390, 186], [391, 654]]} w={7} seed={13} />
          <Line pts={[[394, 650], [56, 651]]} w={7} seed={14} />
          <Line pts={[[60, 654], [61, 186]]} w={7} seed={15} />
          <rect x={470} y={900} width={620} height={180} fill={palette.sand} />
          <Line pts={[[470, 900], [1090, 902]]} w={8} seed={10} />
          <Pip x={472} y={700} k={3.2} pose="peek" t={t} />
        </g>
      )}
    </svg>
  );
};

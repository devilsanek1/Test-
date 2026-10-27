// V2S3_near.tsx (lane L3, V2S3 NEAR part; WORLD px at the 12.98 match, inside V2S3's camera): the bottom third. Our
// moored narrowboat cut by both edges (roof y ~1260-1330 dressed, sage cabin side y 1330-1580, the same boat as V2S4's),
// our coping, our towpath y 1640-1920 with two walkers' head-backs cut by the bottom (<= ~140 px wide) and a lamp-post
// foot bottom-right. STUB (v0): the near build replaces it.
import React from 'react';
import {CM, INK_PX} from '../palette';
import {Water} from '../kit/canal/water';
import {Narrowboat} from '../kit/canal/boat';
import {Towpath} from '../kit/canal/towpath';

export const S3Near: React.FC = () => (
  <>
    <Narrowboat x={-300} water={1600} len={1700} h={250} dir={1} seed="s3boat" cabin={CM.sage} topView={36} hullK={0.12} roofItems panel fenders chimney={0.7} />
    <Water y0={1590} y1={1660} seed="s3near" ripples={8} glints={4} />
    <Towpath x0={-80} x1={1180} top={1650} edge={2010} seed="s3ourpath" leaves={14} ink={INK_PX.mid} />
  </>
);

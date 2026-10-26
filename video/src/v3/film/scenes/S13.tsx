// S13 (lane L3-you): the HOME BASE returns, objective MEDIUM-WIDE, 31.32-33.40 ("Normally you'd wait for the better
// one."). Locked board (public/v3/animatic.json S13, docs/v3/camera_plan_g3.md): the kit's objective nook (the shelf
// mass cut by the left and top edges, the ONE window cut by the right edge with its mullion and sill, the data center
// as a far silhouette outside, the lamp and its golden pool on the desk by the window's lower-left corner); you sit
// on your chair in 3/4 back view facing the window (the darkest shape, head about (437, 1010)); the wall clock upper
// left (its second hand ticks: the waiting); the thought bubble on the wall above your head holds the NEW laptop
// labelled BETTER. Everything is there from the cut. Camera: HOLD (the stillness is the waiting), breathing in 1.5 %
// (ease in-out) toward you and the bubble. Caption band (y 290-600) = flat wall: the clock's top sits at y ~610.
// The bubble is the kit ThoughtBubble (its cloud centred on (cx, cy) since the assembler's kit fix; S13_bubble.tsx retired).
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, Nook, ThoughtBubble, WallClock, YouSeated, type Pt} from '../kit';

const DUR = 33.4 - 31.32;
/** You: hip x, seat top y, head height (head centre = (x + 0.2 H, y - 3.3 H)). */
const YOU = {x: 420, y: 1287, head: 84};
const FLOOR_Y = 1400;
/** The thought bubble (on the wall, left of the window's reveal) and its tail's target (your head top). */
const BUBBLE = {cx: 326, cy: 790, rx: 144, ry: 112};
const HEAD_TOP: Pt = [430, YOU.y - 3.3 * YOU.head - 0.48 * YOU.head];
/** The NEW laptop in the bubble: label + lid + deck centred in the cloud. */
const THINK = {x: BUBBLE.cx, y: 841, w: 150};
const CLOCK = {cx: 166, cy: 662, r: 46};

const S13: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 420, 980)}>
        <Nook variant="objective" seed="s13/nook" />
        <WallClock cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} startMin={50} seed="s13/clock" />
        <YouSeated x={YOU.x} y={YOU.y} head={YOU.head} floorY={FLOOR_Y} seed="s13/you" />
        <ThoughtBubble cx={BUBBLE.cx} cy={BUBBLE.cy} rx={BUBBLE.rx} ry={BUBBLE.ry} to={HEAD_TOP} seed="s13/think">
          <Laptop x={THINK.x} y={THINK.y} w={THINK.w} variant="new" label="BETTER" seed="s13/lap" ink={2.6} />
        </ThoughtBubble>
      </XG>
    </World>
  );
};
export default S13;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

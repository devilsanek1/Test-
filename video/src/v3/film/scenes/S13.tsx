// S13 (lane S13, G5b dense pass; G5 by lane L3-you): the HOME BASE returns, objective MEDIUM-WIDE, 31.32-33.40
// ("Normally you'd wait for the better one."), the film's breath beat. Locked board (public/v3/animatic.json S13,
// docs/v3/camera_plan_g3.md, docs/v3/storyboard_g3.md): the kit's objective nook (the shelf mass cut by the left and top
// edges, the ONE window cut by the right edge with its mullion and sill, the data center as a far silhouette outside,
// the lamp and its golden pool on the desk by the window's lower-left corner); you sit on your chair in 3/4 back view
// facing the window (the darkest shape, head about (437, 1010)); the wall clock upper left (its second hand ticks: the
// waiting); the thought bubble on the wall above your head holds the NEW laptop labelled BETTER. Everything is there
// from the cut. Caption band (y 290-600) = flat wall: the clock's top sits at y ~610.
// G5b (owner: "way too empty"; the approved pilot's bar, docs/look/LIFE_AND_DENSITY.md): DENSE-CALM, a calm cozy hold
// (docs/v3/cozy_v2_application.md, which OVERRIDES the g5b plan here):
//   the world     the nook dressed to O1's level (S13_room.tsx): the attic beam with string lights and the paper star, photos,
//                 a hanging pothos, a print; the shelf's foot, a coat and scarf on a hook, a tote, the radiator with a
//                 sock, a bin; the desk calendar on 2026, pens, books, headphones; floorboards, a striped rug, slippers,
//                 an open book, a floor plant, a pouf and a yarn basket; Pip asleep on the rug (z's).
//   the window    the street seen from above as a sliver (S13_window.tsx): far roofs, the opposite houses' snowy roofs and
//                 warm fronts, a lit shop, the lamp, the road; 2-3 movers at every moment (a car, two walkers), half the
//                 people at rest; the plume, smoke, icicles, two snow layers.
//   you           hold still (the kit's 1-2 px breath); ONE gesture on "better" (VO 32.60 = 1.28), big enough to read at
//                 phone size (review): a 2.3 deg lean toward the window about the chair's feet (~15 px at the head) over
//                 0.35 s, settling to ~1 deg, with the head tilting up 7 deg toward the bubble, then held (cozy v2 §2:
//                 the foot tap is dropped).
//   the bubble    the BETTER laptop bobs +-3 px in it (slow).
//   camera        the FLOAT (cozy v2 §3, replaces the invisible 1.5 % breathe): translation only, 2 legs at 8-12 px/s that
//                 turn back (eased), within +-12 x / +-10 y of home; the captions and the UI stay fixed.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {ease01, EMBER, floatCam, Laptop, Nook, NOOK_LAYOUT, ThoughtBubble, WallClock, YouSeated, type Pt} from '../kit';
import {S13Desk, S13FloorBack, S13FloorFront, S13Pip, S13RugThings, S13ToteAndBin, S13WallLow, S13WallTop, S13WindowLights} from './S13_room';
import {S13Outside} from './S13_window';

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
/** "better" (VO 32.60). */
const BETTER = 32.6 - 31.32;
/** Pip asleep on the rug, in front of your chair's right side. */
const PIP = {x: 704, y: 1546};

/** The nook: the objective layout with the attic slope and beam on (O1's room: the string lights hang under it). */
const NOOK_S13 = {slope: true, shelf: {...NOOK_LAYOUT.objective.shelf!}, mug: null};

const S13: React.FC = () => {
  const t = useTime();
  const [dx, dy] = floatCam(t, {dur: DUR, seed: 's13/float'});
  // the weight shift on "better": lean toward the window (clockwise about the chair's feet), settle to ~1 deg; the head
  // tilts up toward the bubble (chin up) with it and holds
  const lean = 2.3 * ease01(t, BETTER - 0.04, 0.35) - 1.3 * ease01(t, BETTER + 0.42, 0.55);
  const tilt = -7.5 * ease01(t, BETTER + 0.02, 0.4) + 1.2 * ease01(t, BETTER + 0.5, 0.5);
  const bob = 3 * Math.sin((t / 2.6) * 2 * Math.PI + 0.6);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <Nook variant="objective" layout={NOOK_S13} seed="s13/nook">
          <S13Outside />
        </Nook>
        <S13WallTop />
        <S13WindowLights />
        <S13WallLow />
        <S13Desk />
        <S13FloorBack />
        <S13RugThings />
        <S13ToteAndBin />
        <WallClock cx={CLOCK.cx} cy={CLOCK.cy} r={CLOCK.r} startMin={50} seed="s13/clock" />
        <XG m={mat.about(mat.rotate(lean), YOU.x + 30, FLOOR_Y)}>
          <YouSeated x={YOU.x} y={YOU.y} head={YOU.head} floorY={FLOOR_Y} seed="s13/you" headRot={tilt} />
        </XG>
        <S13Pip x={PIP.x} y={PIP.y} />
        <S13FloorFront />
        <ThoughtBubble cx={BUBBLE.cx} cy={BUBBLE.cy} rx={BUBBLE.rx} ry={BUBBLE.ry} to={HEAD_TOP} seed="s13/think">
          <XG m={mat.translate(0, bob)}>
            <Laptop x={THINK.x} y={THINK.y} w={THINK.w} variant="new" label="BETTER" seed="s13/lap" ink={2.6} />
          </XG>
        </ThoughtBubble>
      </XG>
    </World>
  );
};
export default S13;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

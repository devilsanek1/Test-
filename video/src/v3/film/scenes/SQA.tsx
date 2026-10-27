// SQA HOOK (lines 1-2), film 0.00-5.80 (docs/v3/flow_v2.md §2, §4): H1 = O1's framing in POV; frame 0 = the loop target.
// The rework pilot (owner on G5b: "too busy, too incoherent ... too rough and messy ... the light is weirdly put"): the
// same hook in the clean pen, one focus at a time, gently lit, on the shared pieces:
//   home_set.tsx     the nook + the window view under homeCam(T) (pull-out 1.05 -> 1.00 easing out over 0-5.00; J1's
//                    pan to the card starts 5.15), lit by the nook rig (the lamp, screen-left, is the key)
//   thread_plane     the hand, the phone with the listing, THE TAG (the thread), Pip peeking from the phone's edge
// Beats (film seconds = SQA seconds; visuals lead their word by ~0.1 s):
//   T < 0     the loop underlay: the room lands as flat pale shapes (-0.5 .. -0.18), the subject's outlines and the
//             supporting lines draw on (-0.15 ..); frame 0 shows the scene being drawn under the core line's words
//   0.00      the thumb taps "Add to cart" (the cart pop), the badge "1" at 0.05; colour floods out from the tag
//             (0.00-0.31: each flat shape takes its colour as the wave reaches it; the light arrives with it)
//   0.25      the data center's sign; 1.22-1.50 Pip looks up at you on "soon?" and back
//   1.88 ...  five sticks lift off the listing's laptop and fly to the data center (small, tier B); each launch ticks
//             the tag one step: $1,015 / $1,031 / $1,047 / $1,063 / $1,079 (the $999 struck from 1.92); a warm rim on
//             the tag's lamp side while it ticks
//   3.64-4.00 the phone lowers 60 px (HIGH-C -> LOW-C); 4.04 the data center goes dark, its sign lights cold white
//             (the beat's subject: "AI data centers"); 4.40 the phone's screen dims a step (the stage leads)
//   5.15      J1: the head turns right to the card on the wall (homeCam pan, x 0 -> -775 by 6.45); SQA hands over
//             mid-pan at 5.80 (frame 348) to SQB, which draws the same home_set + thread_plane at film time.
// Hierarchy (flow_v2 §5): A the tag (each tick), then the data center at 4.04; B the sticks (small), the hand, Pip; C
// the room, the town, the snow. Nothing enters 5.40-6.20 (the seam).
import React from 'react';
import {Look} from '../../../lib/exit';
import {useFilmTime} from '../../../lib/sequence';
import {Tier} from '../../../lib/tier';
import {clamp, ease} from '../../../lib/time';
import type {Mat} from '../../../lib/xf';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {EMBER, MemoryStick, type Pt} from '../kit';
import {FilmClock, HomeSet, homeCam} from './home_set';
import {LAUNCHES, ThreadPlane, threadAt} from './thread_plane';

// ================================================================= the flights (screen space, film time)

const FLIGHT = 0.46;
/** Where each stick sinks into the data center's roof (far plane, H1 px). */
const LANDS: Pt[] = [
  [420, 652],
  [500, 654],
  [456, 650],
  [540, 654],
  [396, 652],
];
const apply = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt => {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};

/** One stick: it lifts off the listing's laptop, arcs up and a little left over the glass, and shrinks into the data
 *  center's roof. Small (96 -> 34 px), no speed ticks, one smooth ease: supporting motion, the tag's tick is the beat. */
const Stick: React.FC<{T: number; i: number}> = ({T, i}) => {
  const t0 = LAUNCHES[i];
  if (T < t0 || T >= t0 + FLIGHT) return null;
  const u = clamp((T - t0) / FLIGHT);
  const p = ease.inOutSine(u);
  const a = threadAt(T).listingScreen;
  const d = apply(homeCam(T).far, LANDS[i]);
  const b: Pt = [a[0] - 150, a[1] - 230];
  const c: Pt = [d[0] - 90, d[1] + 170];
  const [x, y] = bez(a, b, c, d, p);
  const grow = 0.6 + 0.4 * ease.outCubic(clamp(u / 0.12));
  const sink = 1 - ease.inCubic(clamp((u - 0.86) / 0.14));
  const w = (96 + (34 - 96) * p) * grow * sink;
  if (w < 4) return null;
  return <MemoryStick x={x} y={y} w={w} rot={-18 + 22 * p} seed={`sqa/stick${i}`} />;
};

const Flights: React.FC<{T: number}> = ({T}) => (
  <FilmClock T={T}>
    <Tier tier="support" lines tone={EMBER.board}>
      {LAUNCHES.map((_, i) => (
        <Stick key={i} T={T} i={i} />
      ))}
    </Tier>
  </FilmClock>
);

// ================================================================= the sequence

/** Frame 0's colour flood: from the tag outward, every flat shape takes its colour as the wave reaches it (pale until
 *  then: the clean pen's frame 0, DIRECTION rule 9). Reaches the top corners at ~0.31 s. */
export const SQA_CASCADE = {at: 0, origin: [558, 1380] as [number, number], speed: 4800, pale: 0.8, paper: EMBER.wall};

const SQA: React.FC = () => {
  const T = useFilmTime();
  const scene = (
    <World sky={EMBER.wall}>
      <HomeSet T={T} />
      <ThreadPlane T={T} />
      <Flights T={T} />
    </World>
  );
  return T < 0.6 ? <Look cascade={SQA_CASCADE}>{scene}</Look> : scene;
};
export default SQA;

/** Ink captions on the peach-cream wall (the caption band is the wall all through SQA). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

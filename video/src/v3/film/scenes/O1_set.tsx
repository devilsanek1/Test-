// O1_set (lane L1-opening): the HOOK's set, shared by O1 (0-5.80) and S15 (O1's end frame, held).
// The home-base nook in POV (kit Nook 'pov'): your phone held up in front of the ONE window with the laptop listing and
// its price tag; outside, the AI data center on the snowy horizon between two houses (blue hour, first snow).
//
// Locked board (public/v3/animatic.json O1, docs/v3/camera_plan_g3.md):
//   frame 0   bare ink lines being drawn (window, building with a blank sign, lamp, phone, listing, hand), the tag already
//             complete with its "$999" in ink; colour floods in by ~0.25 s; the thumb taps "Add to cart" at 0.0
//   0.25      the AI DATA CENTER sign pops
//   1.88 ...  a memory stick lifts off the listing's laptop, flies left past the lamp, up the clear glass and into the
//             data center's roof; each launch ticks the tag one step: 1.88 $1,019 · 2.18 $1,039 · 2.40 $1,059 ·
//             burst 2.60 $1,079 · 2.72 $1,099; the old $999 sits struck on the tag
//   3.64-4.00 you lower the phone 140 px
//   4.04      "data centers": the building goes dark (the subject) and its sign lights up cold white (the production
//             emphasis that replaces the board's red circle) with a small pop
//   camera    PULL OUT z 1.05 -> 1.00 about (540, 960), ease-in, the whole shot, as three planes (real multiplane
//             parallax): the outside moves half as much as the room, the phone / hand / tag 1.4x as much; all three meet
//             at z 1.00 on the last frame (= S15). t < 0 holds the start camera (the loop underlay: bare lines).
// Build timing: kit `at` values between -0.18 and 0 so the ink is mid-draw on frame 0 and every fill lands at t >= 0
// (FILL_LAG 0.18): t < 0 is bare lines only.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Look} from '../../../lib/exit';
import {clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {
  DataCenter,
  EMBER,
  Hand,
  laptopGeo,
  MemoryStick,
  NightSky,
  Nook,
  Phone,
  phonePoint,
  phoneSlots,
  PriceTag,
  Snowfall,
  TownBand,
  Txt,
  type Pt,
} from '../kit';

// ---------------------------------------------------------------- timing (O1-local seconds = VO seconds)

export const O1_END = 5.8;
const SIGN_AT = 0.25;
const PRESS_AT = 0.0;
const BADGE_AT = 0.05;
/** Stick launches (each ticks the tag one step). */
const LAUNCH = [1.88, 2.18, 2.4, 2.6, 2.72];
const PRICES = ['$1,019', '$1,039', '$1,059', '$1,079', '$1,099'];
const FLIGHT = 0.5;
const LOWER_AT = 3.64;
const LOWER_DUR = 0.36;
const LOWER_DY = 140;
const DARK_AT = 4.04;

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

const C: Pt = [540, 960];
/** The phone (top-left, width, the hold angle) and its button (phone-local y). Height runs past the frame bottom. */
export const PH = {x: 340, y: 980, w: 400, h: 1000, rot: -3, buttonY: 520};
const SL = phoneSlots(PH.w, 372, PH.buttonY);
const LAP = laptopGeo(SL.laptop.x, SL.laptop.y, SL.laptop.w); // the listing's laptop, phone-local
/** The tag (board: x 360, y 1262, w 360; 28 px lower so it clears the listing's laptop), hanging by its string from the listing laptop's front-left corner. */
export const TAG = {x: 360, y: 1290, w: 360, rot: -6, sway: 1.2, seed: 'o1/tag'};
const DC = {x: 540, y: 952, w: 436};
const HORIZON = 950;
const GLASS = {x: 180, y: 630, w: 720, h: 430};

/** Pull-out zoom of the room plane at O1 time t (1.05 -> 1.00, ease-in; t < 0 = the start camera). */
export function o1Zoom(t: number) {
  return 1.05 - 0.05 * prog(t, 0, O1_END, ease.inQuad);
}
const zoomM = (z: number): Mat => mat.about(mat.scale(z), C[0], C[1]);
const apply = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

/** The three planes' matrices at O1 time t. */
function planes(t: number) {
  const z = o1Zoom(t);
  return {room: zoomM(z), far: zoomM(1 + (z - 1) * 0.5), front: zoomM(1 + (z - 1) * 1.4)};
}

/** The phone's lowering offset (px) at time t. */
const lowerDy = (t: number) => LOWER_DY * prog(t, LOWER_AT, LOWER_DUR, ease.inOutCubic);

// ---------------------------------------------------------------- the flying sticks

type Flight = {t0: number; land: Pt; seed: string};
const FLIGHTS: Flight[] = LAUNCH.map((t0, i) => ({t0, land: ([[392, 650], [468, 652], [430, 648], [520, 652], [404, 652]] as Pt[])[i], seed: `o1/stick${i}`}));

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt => {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};

/** One stick: lifts off the listing's laptop (front plane), sweeps left past the lamp and up the clear glass (room
 *  plane), and shrinks into the data center's roof (far plane). Drawn in screen space. */
const Stick: React.FC<{f: Flight; t: number; P: ReturnType<typeof planes>}> = ({f, t, P}) => {
  if (t < f.t0 || t >= f.t0 + FLIGHT) return null;
  const u = clamp((t - f.t0) / FLIGHT);
  const p = ease.inOutSine(u);
  const launchLocal = LAP.screenC;
  const a = apply(P.front, phonePoint(PH, launchLocal[0], launchLocal[1]));
  const b = apply(P.room, [196, 1150]);
  const c = apply(P.room, [214, 650]);
  const d = apply(P.far, f.land);
  const [x, y] = bez(a, b, c, d, p);
  // size: 130 at launch (pops up from 0.55 in 0.06 s), 46 at the roof; shrinks into it over the last 0.07 s
  const grow = 0.55 + 0.45 * prog(t, f.t0, 0.06, ease.outCubic);
  const sink = 1 - prog(t, f.t0 + FLIGHT - 0.07, 0.07, ease.inCubic);
  const w = (130 + (46 - 130) * p) * grow * sink;
  if (w < 4) return null;
  const rot = -24 + 30 * p;
  // two short speed ticks behind it (direction of travel, from 1/30 s earlier)
  const q = ease.inOutSine(clamp((t - 1 / 30 - f.t0) / FLIGHT));
  const [px, py] = bez(a, b, c, d, q);
  const dx = x - px;
  const dy = y - py;
  const len = Math.hypot(dx, dy);
  let trail = '';
  if (len > 3 && u > 0.08 && u < 0.92) {
    const ux = dx / len;
    const uy = dy / len;
    const L = Math.min(w * 0.7, len * 1.6);
    for (const s of [-0.2, 0.2]) {
      const sx = x - ux * w * 0.55 - uy * w * s;
      const sy = y - uy * w * 0.55 + ux * w * s;
      trail += `M${sx.toFixed(1)} ${sy.toFixed(1)}L${(sx - ux * L).toFixed(1)} ${(sy - uy * L).toFixed(1)}`;
    }
  }
  return (
    <>
      {trail ? <path d={trail} stroke={EMBER.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" /> : null}
      <MemoryStick x={x} y={y} w={w} rot={rot} seed={f.seed} />
    </>
  );
};

// ---------------------------------------------------------------- the outside (far plane, clipped to the glass)

const Outside: React.FC = () => (
  <>
    <NightSky x={GLASS.x - 30} y={GLASS.y - 30} w={GLASS.w + 60} h={GLASS.h + 60} at={0.04} />
    <Fill rect={[GLASS.x - 30, HORIZON, GLASS.w + 60, GLASS.y + GLASS.h - HORIZON + 30]} color={EMBER.snow} at={0.08} offset={false} mode="snap" />
    <TownBand y={HORIZON + 2} houses={[{x: 205, w: 70, lit: true}, {x: 762, w: 60, lit: true, chimney: true}]} far at={-0.1} seed="o1/town" />
    <DataCenterBeat />
    <Snowfall x={GLASS.x} y={GLASS.y} w={GLASS.w} h={GLASS.h} n={22} at={0.12} seed="o1/snow" />
  </>
);

/** THE data center: blank sign on frame 0, the sign at 0.25, dark + lit sign + a small pop at 4.04. */
const DataCenterBeat: React.FC = () => {
  const t = useTime();
  const k = t >= DARK_AT ? Math.sin(Math.PI * prog(t, DARK_AT, 0.2, ease.linear)) : 0;
  const s = 1 + 0.045 * k;
  const body = <DataCenter x={DC.x} y={DC.y} w={DC.w} variant="normal" sign="AI DATA CENTER" signAt={SIGN_AT} darkAt={DARK_AT} signLitAt={DARK_AT} at={-0.14} seed="o1/dc" />;
  return s > 1.0005 ? <XG m={mat.about(mat.scale(s), DC.x, DC.y)}>{body}</XG> : body;
};

// ---------------------------------------------------------------- the tag

/** The tag: complete in ink with its "$999" on frame 0 (and through the loop underlay), fills from 0.12; the ticker. */
const Tag: React.FC<{t: number; dy: number}> = ({t, dy}) => {
  const corner = LAP.deck[3];
  const from = phonePoint(PH, corner[0] + 4, corner[1] - 6);
  const y = TAG.y + dy;
  const tagAt = -0.06; // fills land at 0.12
  const fillT = tagAt + 0.18;
  const ticker = [{t: -99, v: '$999'}, ...LAUNCH.map((lt, i) => ({t: lt, v: PRICES[i]}))];
  const struck = t >= LAUNCH[0];
  const common = {x: TAG.x, y, w: TAG.w, stringFrom: [from[0], from[1] + dy] as Pt, rot: TAG.rot, sway: TAG.sway, seed: TAG.seed};
  // the frame-0 outline (no fills) and its price in ink, until the fill has landed and the ink has caught up
  const outline = t < fillT + 0.3;
  const inkPrice = t < fillT + 0.04;
  const swing = TAG.sway * Math.sin(t * 1.7 + (TAG.seed.length % 5));
  const hole: Pt = [TAG.x + TAG.w * 0.12, y + TAG.w * 0.25];
  const h = TAG.w * 0.5;
  return (
    <>
      <PriceTag {...common} ticker={ticker} old={struck ? '$999' : undefined} oldAt={LAUNCH[0]} strikeAt={LAUNCH[0] + 0.04} at={tagAt} />
      {outline ? (
        <Look fills="none">
          <PriceTag {...common} value="$999" />
        </Look>
      ) : null}
      {inkPrice ? (
        <XG m={mat.compose(mat.translate(hole[0], hole[1]), mat.rotate(TAG.rot + swing), mat.translate(-TAG.w * 0.12, -TAG.w * 0.25))}>
          <Txt x={TAG.w * 0.6} y={h * 0.68} size={TAG.w * 0.25} fit={TAG.w * 0.66} fill={EMBER.ink}>
            $999
          </Txt>
        </XG>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the set

/** O1's whole set (no World: O1 and S15 wrap it). Reads O1 time from useTime(). */
export const O1Set: React.FC = () => {
  const t = useTime();
  const P = planes(t);
  const dy = lowerDy(t);
  const ph = {...PH, y: PH.y + dy};
  // the outside sits in the far plane: inside the room plane's group, undo the room and apply the far zoom
  const outside = (
    <XG m={mat.mul(mat.inv(P.room), P.far)}>
      <Outside />
    </XG>
  );
  return (
    <>
      <XG m={P.room}>
        <Nook variant="pov" at={-0.16} seed="o1/nook">
          {outside}
        </Nook>
      </XG>
      <XG m={P.front}>
        <Phone {...ph} price={null} badge={1} badgeAt={BADGE_AT} pressAt={PRESS_AT} at={-0.12} seed="o1/phone" />
        <Tag t={t} dy={dy} />
        <Hand phone={ph} pressAt={PRESS_AT} at={-0.1} seed="o1/hand" />
      </XG>
      {FLIGHTS.map((f, i) => (
        <Stick key={i} f={f} t={t} P={P} />
      ))}
    </>
  );
};

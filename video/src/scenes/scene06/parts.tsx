// scene06/parts.tsx — S06 local helpers: the messenger's walk (warped walk clock, stops on a planted stride), his raised
// arm + envelope (mirrors props Messenger so the hand-over is invisible), the door beat (lean, two knocks, the envelope
// lining up with the slot), his hair + collar (local shim over props Messenger's skin-coloured 'short' head), Bit the
// stowaway, the makers' heads popping UP into the upstairs browser window, Pip (hop in, tiptoe, 'shh', ear twitch, leap
// after the sheet), the 'shh' mark, the blind's jolt ticks, the low-sun shadows of the messenger and Pip.

import React, {useId} from 'react';
import {captionFontStack, clamp, ease as E, Fill, Ink, lerp, line, mat, Mat, osc, palette, prog, Pt, rng, springAt, springs, useCaptionFont, useTime, XG, blob, polyPath, TimeShift, PERSON_HAIR} from '../../lib';
import {Elephant, hop, MASCOT, popSwitch, walkSpeed} from '../../lib/mascot';
import type {PoseName, Expression} from '../../lib/mascot';
import {Bit, Envelope, Maker, Messenger, messengerHand} from '../shared/props';
import type {Beats} from './beats';

// ---------------------------------------------------------------- the messenger (props Messenger, 260 px)

/** The S05 messenger (src/scenes/scene05/cast.tsx MESSENGER.seed 's5msg': same coat, trousers), closer now. */
export const MSG = {seed: 's5msg', h: 260, y: 1520, x0: -140, hair: palette.ink} as const;
/** props Figures.tsx constants (FIG_H / LEG / TORSO) for the mirrored arm and envelope. */
const FIG_H = 199;
const LEG = 62;
const TORSO = 95;
const S = MSG.h / FIG_H;
const HIP_Y = MSG.y - LEG * S;
/** The mail slot (WORKSHOP_LANE.slot) and its plate top (Bit's sill). */
export const SLOT: Pt = [670, 1300];
export const SILL: Pt = [698, 1290];
/** Envelope centre relative to the feet x (props messengerHand). */
const HAND0 = messengerHand(0, MSG.y, MSG.h, MSG.seed);
/** The kit Person's torso width for this seed (inverted from messengerHand: x + (w * 0.7 + 6) * s). */
const GW = (HAND0[0] / S - 6) / 0.7;
/** Feet x at the door: the envelope sits right over the slot. */
export const MSG_X1 = SLOT[0] - HAND0[0];
/** Braking profile: x = x0 + L (1 - (1 - u)^P). P 2.4 enters at ~1100 px/s on screen (S05 exits at ~1200), and still
 *  comes to rest with zero speed on the door beat. */
const BRAKE_P = 2.4;

/** The kit Person's random draws for a seed (mirrors kit/Person makeSpec's draw order with torsoH, hair, acc, body
 *  given: w, hr, round, hairColor, legsColor, shoeColor, packColor, hat, signColor, phase). */
function personDraws(seed: string) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  r.range(0.36, 0.45);
  const hairColor = r.pick(PERSON_HAIR as unknown as string[]);
  for (let i = 0; i < 5; i++) r.next();
  return {w, hr, hairColor, phase: r.range(0, 6.28)};
}
const personPhase = (seed: string) => personDraws(seed).phase;
const MSG_HR = personDraws(MSG.seed).hr;

export type MsgWalk = {x: number; tau: number; hz: number; walking: boolean};

/** The messenger's feet x and his walk clock. He comes out of S05's dash still fast (outpacing the camera, so he enters
 *  from the left edge: ~1100 px/s on screen at the cut) and brakes to a stop at the door on B.door. The walk clock tau
 *  runs with the distance covered, so the cadence slows with him; hz is chosen so his last step lands with both feet
 *  down (no leg snap when he stops). */
export function msgWalk(t: number, B: Beats): MsgWalk {
  const D = B.door - B.cut;
  const u = clamp((t - B.cut) / D);
  const frac = 1 - Math.pow(1 - u, BRAKE_P);
  const x = MSG.x0 + (MSG_X1 - MSG.x0) * frac;
  const tau = (D * frac) / 2 + Math.min(0, t - B.cut);
  const tauEnd = D / 2;
  const ph = personPhase(MSG.seed);
  const n = Math.max(1, Math.round(3.4 * tauEnd + ph / Math.PI));
  const hz = (n * Math.PI - ph) / (tauEnd * Math.PI);
  return {x, tau, hz, walking: u < 1};
}

// ---- the door beat (fix round 1): he leans in, knocks twice with the envelope hand, lines the envelope up with the slot

/** Knock times (film-relative to the beats): on 'people' and 0.12 s later. */
export const knocks = (B: Beats) => [B.people + 0.08, B.people + 0.2];

/** Lean toward the door (deg, about his feet): in on the knocks, back upright by 'a' (the slot motion needs him square). */
function leanAt(t: number, B: Beats): number {
  const k0 = knocks(B)[0];
  return 3.2 * (E.outCubic(prog(t, k0 - 0.06, 0.1)) - E.inOutSine(prog(t, B.a - 0.12, 0.12)));
}

/** The envelope hand's offset (person units) and the envelope's extra rotation: a 1-frame jab toward the door per knock
 *  (back in 2 frames), then a small wiggle that lines the envelope up with the slot, square by 'a'. */
function handFx(t: number, B: Beats): {dx: number; dy: number; rot: number} {
  let dx = 0;
  let dy = 0;
  for (const k of knocks(B)) {
    const d = t - k;
    if (d >= -0.034 && d < 0.1) {
      const j = d < 0 ? (d + 0.034) / 0.034 : 1 - E.outQuad(d / 0.1);
      dx += 9 * j;
      dy += -2 * j;
    }
  }
  const w0 = knocks(B)[1] + 0.06;
  const wq = prog(t, w0, B.a - w0);
  const rot = wq > 0 && wq < 1 ? 7 * Math.sin(wq * Math.PI * 2.5) * (1 - wq) : 0;
  return {dx, dy, rot};
}

/** World matrix of the messenger's lean (about his feet). */
const leanMat = (t: number, B: Beats, w: MsgWalk): Mat => {
  const a = leanAt(t, B);
  return a === 0 ? mat.I : mat.about(mat.rotate(a), w.x, MSG.y);
};

/** Envelope centre (world, before the lean) while carried: props Envelope `carry` bob (hz 1.7, amp 3 figure units) on
 *  the walk clock; at rest once he stops (the props carry is off when he stands), plus the door beat's jabs. */
function carried(t: number, B: Beats, w: MsgWalk): {x: number; y: number; rot: number} {
  if (!w.walking) {
    const f = handFx(t, B);
    return {x: w.x + HAND0[0] + f.dx * S, y: HAND0[1] + f.dy * S, rot: -8 + f.rot};
  }
  const bob = -Math.abs(osc(w.tau, 0.85)) * 3 * S;
  return {x: w.x + HAND0[0], y: HAND0[1] + bob, rot: -8 + osc(w.tau, 0.85, 1) * 2};
}

const applyM = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

/** Where the wax seal sits on the envelope (world), or null once the envelope is through the slot. Mirrors props
 *  Envelope's slot motion (align 40 %, then slide down 60 %, clipped at the slot line). */
export function envSealWorld(t: number, B: Beats): {p: Pt; clipY: number | null; sx: number} | null {
  const w = msgWalk(t, B);
  const c = carried(t, B, w);
  const h = 60 * 0.66;
  let x = c.x;
  let y = c.y;
  let sx = 1;
  let clipY: number | null = null;
  if (t >= B.a) {
    const dur = 0.25;
    const a = prog(t, B.a, dur * 0.4, E.inOutSine);
    const b = prog(t, B.a + dur * 0.4, dur * 0.6, E.inCubic);
    if (b >= 1) return null;
    x = lerp(x, SLOT[0], a);
    y = lerp(y, SLOT[1] - h / 2, a) + b * h;
    sx = lerp(1, Math.min(1, (50 * 0.92) / 60), a);
    clipY = SLOT[1];
  }
  return {p: applyM(leanMat(t, B, w), [x, y + 60 * 0.03]), clipY, sx};
}

/** A sleeve from the shoulder to the hand (person units): mirrors the props Messenger's arm. */
const Arm: React.FC<{sh: Pt; hand: Pt; w?: number; coat: string; W: number; seed: string}> = ({sh, hand, w = 19, coat, W, seed}) => {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  const tipW = 0.85;
  const poly: Pt[] = [
    [sh[0] + nx, sh[1] + ny],
    [hand[0] + nx * tipW, hand[1] + ny * tipW],
    [hand[0] - nx * tipW, hand[1] - ny * tipW],
    [sh[0] - nx, sh[1] - ny],
  ];
  const f = (v: number) => v.toFixed(1);
  return (
    <>
      <Fill d={blob(hand[0] + (dx / L) * 4, hand[1] + (dy / L) * 4, w * 0.42, w * 0.46, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} />
      <Fill d={polyPath(poly)} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`M${f(poly[0][0])} ${f(poly[0][1])}L${f(poly[1][0])} ${f(poly[1][1])}M${f(poly[2][0])} ${f(poly[2][1])}L${f(poly[3][0])} ${f(poly[3][1])}M${f(poly[1][0])} ${f(poly[1][1])}L${f(poly[2][0])} ${f(poly[2][1])}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** LOCAL SHIM (props lane request: Messenger `hair` passthrough + a straight collar band): props Messenger hard-codes
 *  hair 'short', which for seed 's5msg' is a sand (skin-coloured) disc, and a V collar: from behind he read bald and
 *  faceless. Drawn over the kit head in person units: a full hair-colour cap over the top ~70 % of the head (a nape
 *  sliver of sand stays), and a straight tealDark collar band (props CollarBand geometry) over the V. */
const HairCollar: React.FC<{W: number; hair: string; seed: string}> = ({W, hair, seed}) => {
  const hr = MSG_HR;
  const hy = -TORSO - hr * 0.86;
  const f = (v: number) => v.toFixed(2);
  // hair cap: the head circle above a hairline at hy + 0.4 hr that dips to a soft nape point
  const R = hr * 1.02;
  const yl = hy + hr * 0.4;
  const xl = Math.sqrt(Math.max(0, R * R - (yl - hy) * (yl - hy)));
  const a0 = Math.atan2(yl - hy, xl);
  const a1 = Math.PI - a0;
  const pts: Pt[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = a0 - (i / 20) * (2 * Math.PI - (a1 - a0));
    pts.push([Math.cos(a) * R, hy + Math.sin(a) * R]);
  }
  const capD = `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Q${f(-xl * 0.4)} ${f(yl + hr * 0.16)} 0 ${f(yl + hr * 0.22)}Q${f(xl * 0.4)} ${f(yl + hr * 0.16)} ${f(pts[0][0])} ${f(pts[0][1])}Z`;
  const capInk = `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}`;
  const strands = `M${f(-hr * 0.2)} ${f(hy - hr * 0.8)}Q${f(-hr * 0.46)} ${f(hy - hr * 0.3)} ${f(-hr * 0.4)} ${f(hy + hr * 0.3)}M${f(hr * 0.28)} ${f(hy - hr * 0.72)}Q${f(hr * 0.5)} ${f(hy - hr * 0.2)} ${f(hr * 0.42)} ${f(hy + hr * 0.28)}`;
  // collar: cover the kit V (coat), then a straight band one step darker
  const top = -TORSO;
  const vCover = polyPath([[-hr * 0.74, top + hr * 0.1], [hr * 0.74, top + hr * 0.1], [hr * 0.12, top + hr * 1.12], [-hr * 0.12, top + hr * 1.12]]);
  const hw = hr * 1.05;
  const y0 = top - hr * 0.04;
  const y1 = top + hr * 0.34;
  const sag = hr * 0.07;
  const band = `M${f(-hw)} ${f(y0 + sag)}Q0 ${f(y0 - sag)} ${f(hw)} ${f(y0 + sag)}L${f(hw)} ${f(y1 + sag)}Q0 ${f(y1 - sag)} ${f(-hw)} ${f(y1 + sag)}Z`;
  const bandInk = `M${f(-hw)} ${f(y0 + sag)}Q0 ${f(y0 - sag)} ${f(hw)} ${f(y0 + sag)}M${f(-hw)} ${f(y1 + sag)}Q0 ${f(y1 - sag)} ${f(hw)} ${f(y1 + sag)}`;
  return (
    <>
      <Fill d={vCover} color={palette.teal} offset={false} mode="none" seed={`${seed}/vc`} />
      <Fill d={band} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/band`} />
      <Ink d={bandInk} width={W * 0.8} taper={false} seed={`${seed}/bandI`} />
      <Fill d={capD} color={hair} offset={false} mode="none" seed={`${seed}/cap`} />
      <Ink d={capInk} width={W} taper={false} seed={`${seed}/capI`} />
      <Ink d={strands} width={W * 0.55} color={palette.tealDark} taper={false} seed={`${seed}/str`} />
    </>
  );
};

/** Two short ink knock ticks at the door beside the envelope, 0.12 s each. */
const KnockTicks: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const parts: React.ReactNode[] = [];
  const base: Pt = [MSG_X1 + HAND0[0] + 40, HAND0[1] - 8];
  knocks(B).forEach((k, i) => {
    const d = t - k;
    if (d < 0 || d >= 0.13) return;
    const g = 0.6 + 0.4 * E.outCubic(d / 0.06);
    const L = 15 * g;
    const o = 9 + 6 * E.outCubic(d / 0.13);
    const [x, y] = [base[0] + i * 4, base[1] + i * 10];
    const dd = `M${x + o} ${y - o * 0.7}l${L} ${-L * 0.65}M${x + o + 2} ${y + 2}l${L * 1.1} 0M${x + o} ${y + o * 0.7}l${L} ${L * 0.65}`;
    parts.push(<Ink key={i} d={dd} width={3.2} taper={false} order="all" seed={`s6knock${i}`} />);
  });
  return <>{parts}</>;
};

/** The messenger: props Messenger (holding the envelope up) while he walks; from the door beat the arm + envelope are
 *  drawn here with the same geometry so the hand can knock, the envelope can line up and go through the slot (props
 *  Envelope `slot`) and the arm can drop. Hair + collar shim on top; the whole figure leans in on the knocks. */
export const MessengerS06: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const w = msgWalk(t, B);
  const own = !w.walking;
  const W = 4.8 / S; // props inkFor(260) = front 4.8, in person units
  const sh: Pt = [GW * 0.34, -TORSO * 0.8];
  const up: Pt = [GW * 0.7, -TORSO * 0.92];
  const down: Pt = [GW * 0.48, -TORSO * 0.2];
  // after posting, the arm drops (0.25 s)
  const q = 1 - prog(t, B.a + 0.27, 0.25, E.inOutCubic);
  const fx = handFx(t, B);
  const hand: Pt = [lerp(down[0], up[0] + fx.dx, q), lerp(down[1], up[1] + fx.dy, q)];
  const c = carried(t, B, w);
  const bob = msgBob(w);
  return (
    <>
      <XG m={leanMat(t, B, w)}>
        <TimeShift by={t - w.tau}>
          <Messenger x={w.x} y={MSG.y} h={MSG.h} holdEnvelope={!own} walk={{hz: w.hz}} seed={MSG.seed} />
        </TimeShift>
        <XG m={mat.compose(mat.translate(w.x, HIP_Y + bob), mat.scale(S))}>
          <HairCollar W={W} hair={MSG.hair} seed={`${MSG.seed}/hc`} />
        </XG>
        {own ? (
          <XG m={mat.compose(mat.translate(w.x, HIP_Y), mat.scale(S))}>
            <Envelope x={(c.x - w.x) / S} y={(c.y - HIP_Y) / S} size={60 / S} rot={c.rot} slot={{at: B.a, x: (SLOT[0] - w.x) / S, y: (SLOT[1] - HIP_Y) / S, w: 50 / S}} depth="mid" seed={`${MSG.seed}/env`} />
            {q > 0.02 ? <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${MSG.seed}/arm`} /> : null}
          </XG>
        ) : null}
      </XG>
      <KnockTicks B={B} />
    </>
  );
};

/** The messenger's body bob from the kit Person walk (so Bit and the hair ride it). */
function msgBob(w: MsgWalk): number {
  if (!w.walking) return 0;
  const ph = w.tau * w.hz * Math.PI + personPhase(MSG.seed);
  return -Math.abs(Math.sin(ph)) * LEG * 0.035 * S;
}

// ---------------------------------------------------------------- shadows (low sun at the lane end)

/** The left row's teal shade wedge (MakersLane G.shade, floor-layer world): a shadow inside it would not show. */
const SHADE: Pt[] = (() => {
  const rayAt = (xb: number, y: number) => 430 + ((xb - 430) * (y - 1040)) / 880;
  const baseX = (y: number) => 330 - ((330 + 140) * (y - 1120)) / 580;
  return [[330, 1121], [rayAt(150, 1121), 1121], [rayAt(150, 2060), 2060], [-200, 2060], [-200, 1760], [baseX(1700), 1700]];
})();

/** Flat clay shadow wedges cast toward the camera by the messenger and Pip (the sun sits at the lane end, behind them),
 *  fill only, on the floor layer (dx = near -> floor world offset during the truck), clipped out of the row's shade. */
export const Shadows: React.FC<{B: Beats; dx: number}> = ({B, dx}) => {
  const t = useTime();
  const id = 's6sh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const VP: Pt = [430, 1040];
  const wedge = (fx: number, fy: number, hw0: number, hw1: number, L: number) => {
    const ux = fx - VP[0];
    const uy = fy - VP[1];
    const n = Math.hypot(ux, uy) || 1;
    const [ax, ay] = [ux / n, uy / n];
    const [px, py] = [-ay, ax];
    return polyPath([
      [fx - px * hw0, fy - py * hw0],
      [fx + px * hw0, fy + py * hw0],
      [fx + ax * L + px * hw1, fy + ay * L + py * hw1],
      [fx + ax * L - px * hw1, fy + ay * L - py * hw1],
    ]);
  };
  const w = msgWalk(t, B);
  let d = wedge(w.x + dx, MSG.y - 4, 34, 46, 175);
  const p = pipAt(t, B);
  const air = clamp(1 - (PIP.y - p.y) / 160);
  if (air > 0.05) d += wedge(p.x + dx, PIP.y - 3, 26 * air, 32 * air, 92 * air);
  const shade = polyPath(SHADE);
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={`M-400 600H1500V2200H-400Z${shade}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Fill d={d} color={palette.tan} offset={false} mode="none" seed="s6shadow" />
      </g>
    </>
  );
};

// ---------------------------------------------------------------- Bit, the stowaway (20 px)

/** Bit: hidden in the messenger's collar, peeks out on 'gave' and rides his right shoulder; on 'a' he hops onto the
 *  mail slot's plate (the sill) and watches the envelope go in. */
export const BitS06: React.FC<{B: Beats; size?: number}> = ({B, size = 20}) => {
  const t = useTime();
  const id = 'b6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < B.gave) return null;
  const w = msgWalk(t, B);
  // on the shoulder curve, right of the collar (person units -> world)
  const shoulder: Pt = [w.x + GW * 0.3 * S, HIP_Y - (TORSO - 6.5) * S + msgBob(w)];
  const hopAt = B.a + 0.02;
  const hopDur = 0.3;
  if (t < hopAt) {
    // peek: rises out from behind the shoulder line (clipped), then rides
    const k = prog(t, B.gave, 0.2, E.outBack(1.6));
    const rise = (1 - k) * size * 0.75;
    return (
      <XG m={leanMat(t, B, w)}>
        <defs>
          <clipPath id={id}>
            <rect x={shoulder[0] - 60} y={shoulder[1] - 80} width={120} height={80 + 1.5} />
          </clipPath>
        </defs>
        <g clipPath={k < 1 ? `url(#${id})` : undefined}>
          <Bit x={shoulder[0]} y={shoulder[1] + rise} size={size} state="ride" look={k < 1 ? 'up' : 'forward'} seed="s6bit" />
        </g>
      </XG>
    );
  }
  // hop from the shoulder onto the sill (ballistic, landing squash), then sit facing the slot
  const from: Pt = [MSG_X1 + GW * 0.3 * S, HIP_Y - (TORSO - 6.5) * S];
  const u = prog(t, hopAt, hopDur);
  const x = lerp(from[0], SILL[0], E.inOutSine(u));
  const apex = Math.min(from[1], SILL[1]) - 34;
  const cy = 2 * apex - (from[1] + SILL[1]) / 2;
  const y = (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * cy + u * u * SILL[1];
  const land = t - (hopAt + hopDur);
  const sq = land >= 0 && land < 0.16 ? 1 - 0.22 * Math.sin((land / 0.16) * Math.PI) : u < 1 && u > 0 ? 1.08 : 1;
  return (
    <XG m={mat.about(mat.scale(2 - sq, sq), x, y)}>
      <Bit x={x} y={y} size={size} flip={u >= 1} state={u < 1 ? 'hop' : 'idle'} look={u >= 1 ? 'forward' : 'up'} seed="s6bit" />
    </XG>
  );
};

// ---------------------------------------------------------------- the makers' heads (upstairs browser window)

/** The third maker's seed: the first candidate whose kit hair is clay or ochre (never the tealDark 'blob'). */
const MAKER_SEEDS = (() => {
  const ok = (s: string) => {
    const c = personDraws(s).hairColor;
    return c === palette.tan || c === palette.brown;
  };
  const pickSeed = (base: string, avoid: string[]) => {
    for (let i = 0; i < 40; i++) {
      const s = `${base}${i ? `v${i}` : ''}`;
      if (ok(s) && !avoid.includes(personDraws(s).hairColor)) return s;
    }
    return base;
  };
  const s0 = 's6mk0';
  const s1 = 's6mk1';
  const s2 = pickSeed('s6mk2', [personDraws(s1).hairColor]);
  return [s0, s1, s2];
})();

/** Three makers (props Maker, waist-up, back view) pop UP into the browser window's screen: rise 0.2 s (outBack: the
 *  hair tops overshoot ~9 px over the browser bar), 0.06 s apart, middle first; three ink pop ticks above them. Clipped
 *  to the screen rect widened up over the bar (the window frame stays in front of their shoulders). */
export const MakerHeads: React.FC<{screen: {x: number; y: number; w: number; h: number; bar?: number}; at: number}> = ({screen, at}) => {
  const t = useTime();
  const id = 'mh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < at) return null;
  const h = 135;
  // bust: s = h / (FIG_H 0.62); head top = hip - (TORSO + hr 1.86) s, hr ~ 23: the head tops rest 3 px under the bar
  const sB = h / (FIG_H * 0.62);
  const hipY = screen.y + 3 + (TORSO + 23 * 1.86) * sB;
  const xs = [screen.x + screen.w * 0.19, screen.x + screen.w * 0.5, screen.x + screen.w * 0.81];
  const order = [1, 0, 2]; // the middle one first
  const tick = (() => {
    const d = t - at;
    if (d < 0 || d > 0.17) return null;
    const g = E.outCubic(d / 0.08);
    const o = 8 + 10 * E.outCubic(d / 0.17);
    const L = 14 * g;
    const cx = xs[1];
    // over the window's top frame (the browser bar sits between the screen and the frame)
    const cy = screen.y - (screen.bar ?? 30) - 4;
    const dd = `M${cx - 30 - o} ${cy - o * 0.3}l${-L} ${-L * 0.55}M${cx} ${cy - o * 0.6}l0 ${-L}M${cx + 30 + o} ${cy - o * 0.3}l${L} ${-L * 0.55}`;
    return <Ink d={dd} width={3.0} taper={false} order="all" seed="s6mktick" />;
  })();
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={screen.x} y={screen.y - 16} width={screen.w} height={screen.h + 16} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {xs.map((x, i) => {
          const a = at + order[i] * 0.06;
          if (t < a) return null;
          const k = prog(t, a, 0.2, E.outBack(1.7));
          return (
            <XG key={i} m={mat.translate(0, (1 - k) * 96)}>
              <Maker x={x} y={hipY + (i === 1 ? -3 : 3)} h={h} bust work={1.6 + i * 0.35} flip={i === 2} seed={MAKER_SEEDS[i]} />
            </XG>
          );
        })}
      </g>
      {tick}
    </>
  );
};

// ---------------------------------------------------------------- Pip

export const PIP = {scale: 1.2, y: 1480, land: [300, 1480] as Pt, hopFrom: [-100, 1350] as Pt} as const;

type PipState = {x: number; y: number; pose: PoseName; flip: boolean; squash: number; rotate: number; amount?: number; expression?: Expression; walkRate?: number; look?: number; shh?: boolean};

/** Pip's choreography (world, f = 1): mid-leap at the cut (he jumped off S05's rail to follow), lands behind the
 *  messenger, tiptoes; 'shh' (trunk raised straight up across his mouth like a finger to the lips, eyes open, glancing
 *  at the messenger) after the seal; tiptoes on; ear twitch at the sheet (he turns to it); leaps after it. */
export function pipAt(t: number, B: Beats): PipState {
  const landT = B.pipLand + 0.05;
  const hopDur = 0.3;
  const rate = 0.8;
  const v = walkSpeed(rate) * PIP.scale;
  const shhEnd = B.shh + 0.46;
  const leapT = B.sheet + 0.2;
  // x along the tiptoe (it pauses during the shh)
  const walked = (until: number) => Math.max(0, Math.min(until, B.shh) - landT) + Math.max(0, until - shhEnd);
  const xAt = (tt: number) => PIP.land[0] + v * walked(tt);
  if (t < landT) {
    const h = hop({t, t0: landT - hopDur, dur: hopDur, from: {x: PIP.hopFrom[0], y: PIP.hopFrom[1]}, to: {x: PIP.land[0], y: PIP.land[1]}, height: 60});
    return {x: h.x, y: h.y, pose: 'stand-side', flip: false, squash: h.squash, rotate: h.rotate, amount: h.spread};
  }
  if (t < B.shh) {
    const h = hop({t, t0: landT - hopDur, dur: hopDur, from: {x: PIP.hopFrom[0], y: PIP.hopFrom[1]}, to: {x: PIP.land[0], y: PIP.land[1]}, height: 60});
    return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: h.squash + popSwitch(t, B.shh), rotate: 0, walkRate: rate};
  }
  if (t < shhEnd) return {x: xAt(t), y: PIP.y, pose: 'trunk-up', flip: false, squash: popSwitch(t, B.shh) + popSwitch(t, shhEnd), rotate: 0, expression: 'neutral', look: 0.55, shh: true};
  if (t < B.sheet) return {x: xAt(t), y: PIP.y, pose: 'walk-side', flip: false, squash: popSwitch(t, shhEnd) + popSwitch(t, B.sheet), rotate: 0, walkRate: rate};
  const x0 = xAt(B.sheet);
  if (t < leapT - 0.14) return {x: x0, y: PIP.y, pose: 'stand-side', flip: true, squash: popSwitch(t, B.sheet), rotate: 0, expression: 'wide', amount: 0.25};
  const h = hop({t, t0: leapT, dur: 0.42, from: {x: x0, y: PIP.y}, to: {x: x0 - 260, y: 1150}, height: 150});
  return {x: h.x, y: h.y, pose: 'stand-side', flip: true, squash: h.squash, rotate: h.rotate, amount: Math.max(0.25, h.spread), expression: 'wide'};
}

/** The 'shh' face on the trunk-up rig (local, the mascot has no shush pose): the raised trunk is the finger at the
 *  lips; the trumpet marks at its tip are clipped away (a wedge right of the tip) and the open mouth is closed (a body-
 *  colour patch + a small pursed 'o'). Local elephant units: head centre (look 1.6, -69), tilt -7 + 2 look. */
function shhGeo(look: number) {
  const tilt = ((-7 + look * 2) * Math.PI) / 180;
  const H: Pt = [look * 1.6, -69];
  const hp = (p: Pt): Pt => [H[0] + p[0] * Math.cos(tilt) - p[1] * Math.sin(tilt), H[1] + p[0] * Math.sin(tilt) + p[1] * Math.cos(tilt)];
  const tb = hp([look * 1.4, 8.5]);
  const rel: Pt = [15.5, -44];
  const tip: Pt = [tb[0] + rel[0] * Math.cos(tilt) - rel[1] * Math.sin(tilt), tb[1] + rel[0] * Math.sin(tilt) + rel[1] * Math.cos(tilt)];
  return {tip, mouth: hp([0.5, 16]), tilt};
}

export const PipS06: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const id = 'p6' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = pipAt(t, B);
  const el = <Elephant x={p.x} y={p.y} scale={PIP.scale} pose={p.pose} flip={p.flip} t={t} seed={6} squash={p.squash} rotate={p.rotate} amount={p.amount} expression={p.expression} walkRate={p.walkRate ?? 0.8} look={p.look ?? 0} />;
  if (!p.shh) return el;
  const g = shhGeo(p.look ?? 0);
  const sc = PIP.scale;
  const W = (lx: number, ly: number): Pt => [p.x + lx * sc, p.y + ly * sc];
  // the trumpet-mark wedge: right of the tip, r 6.5..20, -80..+28 deg
  const wedge: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = ((-80 + (108 * i) / 8) * Math.PI) / 180;
    wedge.push(W(g.tip[0] + Math.cos(a) * 21, g.tip[1] + Math.sin(a) * 21));
  }
  for (let i = 8; i >= 0; i--) {
    const a = ((-80 + (108 * i) / 8) * Math.PI) / 180;
    wedge.push(W(g.tip[0] + Math.cos(a) * 6.8, g.tip[1] + Math.sin(a) * 6.8));
  }
  const m = W(g.mouth[0], g.mouth[1]);
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={`M${p.x - 400} ${p.y - 600}H${p.x + 400}V${p.y + 200}H${p.x - 400}Z${polyPath(wedge)}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{el}</g>
      <Fill d={blob(m[0], m[1] + 0.3 * sc, 5.2 * sc, 4.5 * sc, {seed: 's6pipm'})} color={MASCOT.body} offset={false} mode="none" seed="s6pipmf" />
      <Ink d={blob(m[0], m[1], 1.7 * sc, 1.9 * sc, {seed: 's6pipo'})} width={2.2} taper={false} seed="s6pipo" />
    </>
  );
};

/** 'shh' lettered beside Pip's trunk: pops in (7 % spring), shrinks away in 0.12 s. */
export const ShhMark: React.FC<{x: number; y: number; at: number; outAt: number; size?: number}> = ({x, y, at, outAt, size = 50}) => {
  const t = useTime();
  useCaptionFont();
  if (t < at || t >= outAt + 0.12) return null;
  const k = springAt(t, at, springs.pop) * (1 - E.inCubic(prog(t, outAt, 0.12)));
  if (k <= 0.01) return null;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(-8), mat.scale(k))}>
      <text x={0} y={0} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={palette.ink}>
        shh
      </text>
      <Ink d={line(size * 0.95, -size * 0.62, size * 1.25, -size * 0.85, {over: 0, seed: 's6shh1'}) + line(size * 1.0, -size * 0.25, size * 1.4, -size * 0.3, {over: 0, seed: 's6shh2'})} width={2.6} taper={false} seed="s6shhi" />
    </XG>
  );
};

// ---------------------------------------------------------------- blind jolt

/** Two little ink jolt ticks at the blind's bottom corners (the blind jolts once). */
export const BlindJolt: React.FC<{x0: number; x1: number; y: number; at: number}> = ({x0, x1, y, at}) => {
  const t = useTime();
  if (t < at || t > at + 0.22) return null;
  const k = Math.sin(Math.PI * prog(t, at, 0.22));
  const L = 16 * k;
  const d = `M${x0 - 6} ${y - 4}l${-L * 0.8} ${-L * 0.5}M${x0 - 6} ${y + 8}l${-L} ${L * 0.15}M${x1 + 6} ${y - 4}l${L * 0.8} ${-L * 0.5}M${x1 + 6} ${y + 8}l${L} ${L * 0.15}`;
  return <Ink d={d} width={2.6} taper={false} order="all" seed="s6jolt" />;
};

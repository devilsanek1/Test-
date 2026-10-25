// ---------------------------------------------------------------- Pip

/** Pip's on-screen scale at the cut (S03: 1.2 under its 1.04 lock zoom) and his world scale under this camera. */
const PIP_SCREEN = 1.2 * S03_CAM.zoom;
export const PIP_WORLD_SCALE = PIP_SCREEN / K_REST.zoom;
/** His on-screen scale never grows past S05's sleeping Pip (~1.30 on screen): through the dive (zoom 1.55 -> 1.9) he
 *  holds that size instead of growing to 1.58, so the match cut does not change his size (fix round, cut review). */
export const PIP_SCREEN_MAX = 1.3;
export const pipScreenScale = (cam: Cam) => Math.min(PIP_WORLD_SCALE * cam.zoom, PIP_SCREEN_MAX);
/** Where S03 leaves him: crouching on the blueprint stamp's rump, S03's PIP_AT under S03's lock camera (screen
 *  (410.0, 1438.4) today). Imported, so the hand-off cannot drift when S03 moves him. */
export const PIP_CUT_SCREEN: Pt = s03Screen(S03_CAM, S03_PIP_AT);
export const PIP_FROM: Pt = toWorld(K_REST, PIP_CUT_SCREEN);
/** His spot on step 2's tread, at its left end: the L5 tag hangs right of him, almost straight under lock4. He curls
 *  up asleep FACING LEFT (flipped), rump to the tag's blank bottom-left corner, so his head, his z's and the leaf on
 *  his crown are all left of the tag, over the door's left frame (fix round: head-to-tag crowded one 350 x 150 px spot). */
export const PIP_AT: Pt = [218, STOOP.step2[1]];
/** The sleeping crown (sleep pose, FLIPPED, local px at scale 1, feet = (0, 0)): where the leaf lands. */
export const SLEEP_CROWN: Pt = [-24, -45];

type PipState = {x: number; y: number; squash: number; rotate: number; pose: PoseName; expression?: Expression; amount?: number; look?: number; flip?: boolean};

function pipState(t: number, b: Beats): PipState {
  const crouchFrom = b.pipCrouch; // S03 pops him to stand-side and crouches from cut(it)-0.12
  const air = b.this - b.pipTakeOff;
  if (t < b.pipTakeOff) {
    // S03's crouch, continued exactly (same curve as S03's PipS03), plus the stand-side pop's settle
    const sq = 0.2 * Math.sin((Math.min(1, (t - crouchFrom) / 0.14) * Math.PI) / 2) + popSwitch(t, crouchFrom);
    return {x: PIP_FROM[0], y: PIP_FROM[1], squash: sq, rotate: 0, pose: 'stand-side', amount: 0};
  }
  // from S03's spot (already over step 2) a small settle-hop onto the tread
  const h = hop({t, t0: b.pipTakeOff, dur: air, from: {x: PIP_FROM[0], y: PIP_FROM[1]}, to: {x: PIP_AT[0], y: PIP_AT[1]}, height: 18});
  const base = {x: h.x, y: h.y, rotate: h.rotate};
  // fix round: the yawn waits until 'was' (it fired on 'bug' beside the lock: 150 px of the brightest colour stole the
  // beat from Bit). Until then he stands settled on the step (landing squash, then the pose's idle breathing).
  const yawnAt = b.yawn;
  const drowsyAt = b.yawn + 0.33;
  if (t < yawnAt) return {...base, squash: h.squash + popSwitch(t, yawnAt), pose: 'stand-side', amount: h.spread};
  if (t < drowsyAt) {
    // the yawn: trunk up, eyes shut, a long stretch (mouth open)
    const u = clamp((t - yawnAt) / (drowsyAt - yawnAt));
    return {...base, squash: popSwitch(t, yawnAt) + popSwitch(t, drowsyAt) - 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.25)), pose: 'trunk-up', expression: 'closed'};
  }
  if (t < b.sleep) {
    // drowsy: heavy lids, one slow nod
    const u = clamp((t - drowsyAt) / (b.sleep - drowsyAt));
    return {...base, squash: popSwitch(t, drowsyAt) + popSwitch(t, b.sleep) + 0.04 * Math.sin(Math.PI * u), rotate: 4 * Math.sin(Math.PI * u), pose: 'sit-front', expression: 'meh'};
  }
  // asleep (curls up on 'for', turning to face left); breathing is the pose's own idle
  return {...base, squash: popSwitch(t, b.sleep), rotate: 0, pose: 'sleep', flip: true};
}

/** Pip's sleeping crown in WORLD coords under camera `cam` (his screen scale is clamped in the dive, so the point is
 *  derived from his drawn size, not from the world scale): where the leaf sits. Also returns the leaf's scale factor. */
export const pipCrownWorld = (cam: Cam): {p: Pt; k: number} => {
  const ws = pipScreenScale(cam) / cam.zoom;
  return {p: [PIP_AT[0] + SLEEP_CROWN[0] * ws, PIP_AT[1] + SLEEP_CROWN[1] * ws], k: ws / PIP_WORLD_SCALE};
};

/** Pip, in screen space (render inside the world camera: this undoes it). */
export const PipS04: React.FC<{b: Beats; cam: Cam}> = ({b, cam}) => {
  const t = useTime();
  const s = pipState(t, b);
  const [sx, sy] = toScreen(cam, [s.x, s.y]);
  const scale = pipScreenScale(cam);
  return (
    <XG m={mat.inv(camMat(cam))}>
      <Elephant x={sx} y={sy} scale={scale} pose={s.pose} expression={s.expression} amount={s.amount} look={s.look} squash={s.squash} rotate={s.rotate} flip={s.flip} t={t} seed={3} />
    </XG>
  );
};

// ---------------------------------------------------------------- Bit

/** Bit sits on lock4's box top (its right half), in plain sight: 16 world = 24 px on screen at the 1.5 zoom (the size
 *  from which his eye gets a pupil, so the 'like' blink reads). */
const LOCK_TOP = STOOP.lock4.y - STOOP.lock4.h / 2;
export const BIT_AT: Pt = [STOOP.lock4.x + 7, LOCK_TOP];
export const BIT_SIZE = 16;
/** The hop on 'bug' (fix round: the most stressed word got the weakest event): take-off 0.15 s early so the APEX is on
 *  the word (HOP_DUR / 2), two body lengths high (48 px on screen). */
export const HOP_DUR = 0.3;
export const bitHopAt = (b: Beats) => b.bug - HOP_DUR / 2;
/** The 'bug' spot: a peach disc (the caption highlight's paint) with a mid-weight ink ring and five glint ticks around
 *  Bit's seat and the lock box's top (behind the lock), drawn on from w47-0.12 in 0.12 s, held 0.35 s, popped off. */
export const SPOT = {c: [330, 1112] as Pt, r: 30, lead: 0.12, draw: 0.12, hold: 0.35};
export const spotAt = (b: Beats) => b.bug - SPOT.lead;
export const spotOff = (b: Beats) => b.bug + SPOT.hold;

/** Bit: a hop on 'bug' (anticipation, apex on the word, landing squash); on 'like' a yawn (a long stretch up, then a
 *  squash) and a blink; otherwise still. A cream misregistered under-print (offset down-right) separates the ink beetle
 *  from the teal door behind him. */
export const BitS04: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const h0 = bitHopAt(b);
  const lift = hopY(t, h0, HOP_DUR, 2.0 * BIT_SIZE);
  const [lsx, lsy] = landSquash(t, h0 + HOP_DUR, 0.7);
  const antic = t >= h0 - 0.07 && t < h0 ? 1 - 0.2 * Math.sin((Math.PI * (t - (h0 - 0.07))) / 0.07) : 1;
  const air = t > h0 && t < h0 + HOP_DUR;
  // in the air: a stretch on the way up and down, round at the apex
  const u0 = air ? (t - h0) / HOP_DUR : 0;
  const st = air ? 0.16 * Math.abs(Math.cos(Math.PI * u0)) : 0;
  // 'like' (rule-5 lead): the yawn (stretch up, then a settle squash)
  const y0 = b.ghosts2 - 0.1;
  const u = clamp((t - y0) / 0.42);
  const stretch = t >= y0 && u < 0.7 ? Math.sin(Math.PI * (u / 0.7)) : 0;
  const settle = t >= y0 + 0.29 && t < y0 + 0.42 ? Math.sin(Math.PI * ((t - y0 - 0.29) / 0.13)) : 0;
  const sx = (1 - 0.1 * stretch + 0.1 * settle - st * 0.5) * lsx * (antic < 1 ? 2 - antic : 1);
  const sy = (1 + 0.24 * stretch - 0.12 * settle + st) * lsy * antic;
  const [bx, by] = BIT_AT;
  const under = bitPath(bx + 1.5, by + 0.6, BIT_SIZE * 1.06);
  return (
    <XG m={mat.compose(mat.translate(0, lift), mat.about(mat.scale(sx, sy), bx, by))}>
      <Fill d={under} color={palette.cream} offset={false} mode="none" seed="s4/bitu" />
      <Bit x={bx} y={by} size={BIT_SIZE} blinkAt={[y0 + 0.12, y0 + 0.5]} look={air || (t >= y0 && t < y0 + 0.3) ? 'up' : 'auto'} seed="s04/bit" />
    </XG>
  );
};

/** The 'bug' spot behind lock4 (draw it BEFORE the lock): a peach disc pops (20 % -> 100 %, pop spring) while a full
 *  ink ring (2.3 world = 3.4 px, the mid weight) draws on around it in 0.12 s with five glint ticks; held, then popped
 *  off (one frame at 85 %, then gone; no fade). ~90 px across on screen. */
export const BugSpot: React.FC<{at: number; off: number}> = ({at, off}) => {
  const t = useTime();
  if (t < at || t >= off) return null;
  const [cx, cy] = SPOT.c;
  const last = off - t < 1 / 30 + 1e-6;
  const k = last ? 0.85 : 0.2 + 0.8 * springAt(t, at, springs.pop);
  const r = SPOT.r;
  const ring = `M${(cx + r).toFixed(1)} ${cy}A${r} ${r} 0 1 0 ${(cx - r).toFixed(1)} ${cy}A${r} ${r} 0 1 0 ${(cx + r).toFixed(1)} ${cy}`;
  let ticks = '';
  for (const a of [-165, -125, -90, -55, -15]) {
    const q = (a * Math.PI) / 180;
    ticks += `M${(cx + Math.cos(q) * (r + 5)).toFixed(1)} ${(cy + Math.sin(q) * (r + 5)).toFixed(1)}L${(cx + Math.cos(q) * (r + 17)).toFixed(1)} ${(cy + Math.sin(q) * (r + 17)).toFixed(1)}`;
  }
  return (
    <XG m={mat.about(mat.scale(k), cx, cy)}>
      <Fill d={`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`} color={palette.peach} offset={false} mode="none" seed="s4/spot" />
      <Ink d={ring} at={at} dur={SPOT.draw} pace="free" width={2.3} taper={false} seed="s4/ring" />
      <Ink d={ticks} at={at + 0.04} dur={SPOT.draw} pace="free" width={2.3} taper={false} seed="s4/ticks" />
    </XG>
  );
};

/** A 3-frame glint star on lock4's box (its top-right corner) on 'bug': a cream four-point star with an ink outline
 *  pops 0 -> 1.15 -> 0.6, then gone. */
export const LockGlint: React.FC<{at: number; p: Pt; size?: number}> = ({at, p, size = 13}) => {
  const t = useTime();
  const dt = t - at;
  if (dt < 0 || dt >= 0.1) return null;
  const k = dt < 0.033 ? 0.7 : dt < 0.067 ? 1.15 : 0.6;
  const s = size;
  const w = s * 0.24;
  const star = `M0 ${-s}Q${w} ${-w} ${s} 0Q${w} ${w} 0 ${s}Q${-w} ${w} ${-s} 0Q${-w} ${-w} 0 ${-s}Z`;
  return (
    <XG m={mat.compose(mat.translate(p[0], p[1]), mat.scale(k), mat.rotate(12))}>
      <Fill d={star} color={palette.cream} offset={false} mode="none" seed="s4/gl" />
      <Ink d={star} width={1.6} taper={false} seed="s4/gli" />
    </XG>
  );
};


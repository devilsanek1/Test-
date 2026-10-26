// kit/Props.tsx: the film's small objects, one drawing each (kit/README.md "Consistency contract"):
//   <Badge>        the hand-lettered GOOGLE work badge (paper white, peach band, photo square; never a logo) with an
//                  optional worn strap (her lanyard is the hero; staffers' lanyards are not)
//   <Box>          the cardboard box she packs (O1): plant, photo frame, folder; her badge at rest inside with the hero
//                  lanyard spilling over the rim, or in flight (BadgeState); jolt / knock on the landing
//   <Mic>          the plain interview mic on a small desk stand (P3, P4, P6, P13): ONE mic everywhere
//   <Laptop>       her laptop (P5): anchor lid, the screen with an abstract "AI" network (no logos)
//   <Bubble>       her speech bubble: pops from its tail; speech lines (P4, P6) or her own word (P13: FACTS)
//   <Stamp>        APRIL 2026 / NO VETO: anchor ink, slams in (never the pop colour)
//   <InsertPage>, <ColdGround>, INSERT_PAGES   the cold inserts (P7, P9, P10, P11): warm white pages on ONE flat ground
//   <Mug>          the steaming mug (nook sizes)
// Geometry in canvas px; `at` = build / pop time (omit = there); `seed`.

import React from 'react';
import {blob, crown, ellipse, glint, hline, line, poly, polyPath, rect, roundRect, smooth, textLines} from '../../../lib/sketch';
import {ease as E, prog, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {useCaptionFont} from '../../../lib/font';
import {CC} from '../palette';
import {add, applyM, At, b, Fill, fillAt, Ink, Letter, Placed, Pt, W} from './util';

// ---------------------------------------------------------------- the badge

export type BadgeProps = {
  /** Card centre (canvas px). */
  x: number;
  y: number;
  /** Card width (style frame 168; O1's board 170; a staffer's chest badge ~62). */
  w?: number;
  rot?: number;
  /** The hand-lettered name (default GOOGLE; drawn from w >= 90, below that two ink lines). */
  text?: string;
  /** A worn strap: the two neck points (canvas px) the lanyard rises to from the clip. */
  strap?: [Pt, Pt];
  /** Lanyard colour: CC.hero for HER badge only; staffers pass CC.lanyardA / CC.lanyardB. */
  lanyard?: string;
  at?: At;
  seed?: string;
};

/** The badge card in badge-local units (168 x 112, centred; the clip at (0, -54)). */
const BadgeCard: React.FC<{text: string; small: boolean; at: At; seed: string}> = ({text, small, at, seed}) => {
  const ok = useCaptionFont();
  return (
    <>
      <Fill d={roundRect(-84, -54, 168, 112, 12)} color={CC.badge} seed={`${seed}/card`} at={fillAt(at)} />
      <Fill rect={[-84, -42, 168, 22]} color={CC.badgeBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={roundRect(-84, -54, 168, 112, 12, {seed: `${seed}/cardI`})} width={small ? W.far : W.mid} at={at} />
      <Fill d={roundRect(-14, -52, 28, 9, 4)} color={CC.anchor} offset={false} at={fillAt(at, 0.03)} />
      <Fill rect={[-72, -12, 42, 56]} color={CC.photo} offset={false} at={fillAt(at, 0.04)} />
      <Fill d={blob(-51, 8, 11, 12, {seed: `${seed}/phead`})} color={CC.badgeBand} offset={false} at={fillAt(at, 0.05)} />
      <Fill d={`M-68 44Q-66 24 -51 22Q-36 24 -34 44Z`} color={CC.badgeBand} offset={false} at={fillAt(at, 0.05)} />
      {!small ? <Ink d={rect(-72, -12, 42, 56, {seed: `${seed}/photoI`, over: [0, 1]})} width={W.far} at={b(at, 0.04)} /> : null}
      {!small && ok ? (
        <Letter x={-24} y={17} size={33} at={b(at, 0.1)}>
          {text}
        </Letter>
      ) : (
        <Ink d={hline(-22, 64, 4, {seed: `${seed}/n1`, over: [0, 0]})} width={14} at={b(at, 0.08)} taper={false} />
      )}
      <Ink d={textLines(-22, 32, 92, {n: 2, gap: 10, seed: `${seed}/bdgt`, heading: false})} width={small ? 6 : W.hair} at={b(at, 0.08)} />
    </>
  );
};

/** A lanyard ribbon along a path: ink under a narrower colour stroke (the style frame's look). */
export const Lanyard: React.FC<{d: string; color?: string; width?: number; at?: At}> = ({d, color = CC.hero, width = 12.5, at}) => (
  <>
    <Ink d={d} width={width * 1.52} color={CC.ink} taper={false} at={at} />
    <Ink d={d} width={width} color={color} taper={false} at={at} />
  </>
);

export const Badge: React.FC<BadgeProps> = ({x, y, w = 168, rot = 0, text = 'GOOGLE', strap, lanyard = CC.hero, at, seed = 'badge'}) => {
  const s = w / 168;
  const m: Mat = mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(s));
  const clip = applyM(m, 0, -54);
  const strapD = strap
    ? smooth([strap[0], [(strap[0][0] + clip[0]) / 2 - 4 * s, (strap[0][1] + clip[1]) / 2], clip]) + smooth([clip, [(strap[1][0] + clip[0]) / 2 + 4 * s, (strap[1][1] + clip[1]) / 2], strap[1]])
    : '';
  return (
    <>
      {strap ? <Lanyard d={strapD} color={lanyard} width={Math.max(5, 12.5 * s * 1.4)} at={at} /> : null}
      <Placed x={x} y={y} s={s} rot={rot}>
        <BadgeCard text={text} small={w < 90} at={at} seed={seed} />
      </Placed>
    </>
  );
};

// ---------------------------------------------------------------- the box (O1): she quit

/** The style frame's box (desk-insert canvas px): front-left 36, front-right 280, back 800, rim 930, bottom 1008. */
export const BOX = {fl: 36, fr: 280, bl: 56, br: 296, back: 800, rim: 930, bot: 1008};
/** The badge at rest in the box (box-local = desk-insert canvas px at the style frame's placement). */
export const BADGE_REST: Mat = mat.compose(mat.translate(170, 872), mat.rotate(-11));
/** A badge in motion: its transform (box-local), and how far its lanyard has draped (0 = bunched, 1 = over the rim). */
export type BadgeState = {m: Mat; drape: number};

export type BoxProps = {
  /** Placement: the box's back-left top corner (style frame: 56, 800) and width (style frame 260 = fl..br). */
  x?: number;
  y?: number;
  w?: number;
  /** omit = her badge at rest inside; null = not there yet; else the badge in flight (box-local transform). */
  badge?: BadgeState | null;
  /** 0..1 squashes the box (the badge landing); `knock` (deg) knocks the photo frame. */
  jolt?: number;
  knock?: number;
  at?: At;
  seed?: string;
};

export const Box: React.FC<BoxProps> = ({x = BOX.bl, y = BOX.back, w = BOX.br - BOX.fl, badge, jolt = 0, knock = 0, at, seed = 'box'}) => {
  const s = w / (BOX.br - BOX.fl);
  const {fl, fr, bl, br, back, rim, bot} = BOX;
  const opening: Pt[] = [[fl, rim], [fr, rim], [br, back], [bl, back]];
  const right: Pt[] = [[fr, rim], [br, back], [br, back + (bot - rim)], [fr, bot]];
  const flapBack: Pt[] = [[bl, back], [br, back], [br + 8, back - 44], [bl + 14, back - 46]];
  const flapL: Pt[] = [[fl, rim], [bl, back], [bl - 44, back + 6], [fl - 46, rim - 6]];
  const flapR: Pt[] = [[fr, rim], [br, back], [br + 46, back + 10], [fr + 44, rim + 4]];
  const bm = badge ? badge.m : BADGE_REST;
  const clip = applyM(BADGE_REST, 0, -54);
  const restPts: Pt[] = [clip, [112, 822], [74, 856], [80, 904], [104, rim], [116, 968], [158, 992], [204, 978], [224, 944], [226, rim - 6], [220, 896], [204, 858], add(clip, [12, 2])];
  const inv = mat.inv(BADGE_REST);
  const lanPts = badge
    ? restPts.map((q0): Pt => {
        const q = applyM(inv, q0[0], q0[1]);
        const k = 0.5 + 0.5 * badge.drape;
        return applyM(bm, q[0] * k, -54 + (q[1] + 54) * k);
      })
    : restPts;
  const lanyard = smooth(lanPts, {closed: true});
  const frameM = mat.compose(mat.translate(252, 788), mat.rotate(7 + knock));
  const a = (dt: number) => b(at, dt);
  const f = (dt: number) => fillAt(at, dt);
  return (
    <Placed x={x - bl * s} y={y - back * s} s={s}>
      <XG m={jolt ? mat.about(mat.scale(1 + 0.015 * jolt, 1 - 0.04 * jolt), (fl + br) / 2, bot) : mat.I}>
        <Fill d={polyPath([[fl - 30, bot - 6], [fr, bot - 6], [fr + 6, bot + 10], [fl - 40, bot + 12]])} color={CC.deskShade} offset={false} at={f(0)} />
        <Fill d={polyPath(flapBack)} color={CC.box} seed={`${seed}/flb`} at={f(0)} />
        <Ink d={poly(flapBack, {closed: true, seed: `${seed}/flbI`, over: 'small'})} width={W.mid} at={a(0)} />
        <Fill d={crown(104, 784, 46, 40, {seed: `${seed}/leaf`, bumps: 8, round: 0.7})} color={CC.leaf} seed={`${seed}/leafF`} at={f(0.04)} />
        <Ink d={crown(104, 784, 46, 40, {seed: `${seed}/leaf`, bumps: 8, round: 0.7})} width={W.far} open={0.25} at={a(0.04)} />
        <XG m={frameM}>
          <Fill rect={[-40, -50, 80, 96]} color={CC.frame} seed={`${seed}/frm`} at={f(0.05)} />
          <Fill rect={[-28, -38, 56, 72]} color={CC.photo} offset={false} at={f(0.06)} />
          <Fill d={polyPath([[-28, 34], [-28, 8], [-6, -10], [10, 6], [28, -4], [28, 34]])} color={CC.books[0]} offset={false} at={f(0.07)} />
          <Fill d={blob(14, -22, 8, 8, {seed: `${seed}/frsun`})} color={CC.ring} offset={false} at={f(0.07)} />
          <Ink d={rect(-40, -50, 80, 96, {seed: `${seed}/frmI`, over: 'small'}) + rect(-28, -38, 56, 72, {seed: `${seed}/frmJ`, over: [0, 1]})} width={W.far} at={a(0.05)} />
        </XG>
        <Fill d={polyPath(opening)} color={CC.boxIn} offset={false} at={f(0.02)} />
        <Fill d={polyPath([[bl + 2, back + 4], [br - 2, back + 4], [br - 4, back + 46], [bl + 4, back + 46]])} color={CC.boxSide} offset={false} at={f(0.02)} />
        <Fill d={blob(104, 836, 28, 10, {seed: `${seed}/potrim`})} color={CC.pot} offset={false} at={f(0.04)} />
        <Fill d={polyPath([[62, 846], [246, 838], [252, 922], [60, 926]])} color={CC.paperEdge} seed={`${seed}/fold`} at={f(0.05)} />
        <Ink d={poly([[62, 846], [246, 838], [252, 922]], {seed: `${seed}/foldI`, over: 'small'})} width={W.far} at={a(0.05)} />
        <Fill rect={[fl, rim, fr - fl, bot - rim]} color={CC.box} seed={`${seed}/bxF`} at={f(0.01)} />
        <Fill d={polyPath(right)} color={CC.boxSide} seed={`${seed}/bxR`} at={f(0.01)} />
        <Fill d={polyPath(flapL)} color={CC.box} seed={`${seed}/flL`} at={f(0.02)} />
        <Fill d={polyPath(flapR)} color={CC.boxSide} seed={`${seed}/flR`} at={f(0.02)} />
        <Ink d={poly(flapL, {closed: true, seed: `${seed}/flLI`, over: 'small'}) + poly(flapR, {closed: true, seed: `${seed}/flRI`, over: 'small'})} width={W.mid} at={a(0.02)} />
        <Ink d={rect(fl, rim, fr - fl, bot - rim, {seed: `${seed}/bxFI`, over: 'small'}) + poly([[fr, bot], [br, back + (bot - rim)], [br, back]], {seed: `${seed}/bxRI`, over: 'small'}) + line(bl, back, br, back, {seed: `${seed}/bxBI`, over: 'small'})} width={W.mid} at={a(0.01)} />
        <Ink d={hline(fl + 70, fr - 70, rim + 40, {seed: `${seed}/tape`, over: [0, 0]}) + hline(fl + 70, fr - 70, rim + 50, {seed: `${seed}/tape2`, over: [0, 0]})} width={W.hair} at={a(0.06)} />
        {badge === null ? null : (
          <>
            <Lanyard d={lanyard} at={a(0.08)} />
            <XG m={bm}>
              <BadgeCard text="GOOGLE" small={false} at={a(0.08)} seed={`${seed}/badge`} />
            </XG>
          </>
        )}
      </XG>
    </Placed>
  );
};

// ---------------------------------------------------------------- the mic (P3, P4, P6, P13)

export type MicProps = {
  /** Base centre on the table / desk (canvas px). */
  x: number;
  y: number;
  /** The board icon's width (P3 150, P4 105, P6 120, P13 90); total height = 1.7 w. */
  w?: number;
  /** Tilt of the head toward the speaker (deg; + = toward the right). */
  tilt?: number;
  at?: At;
  seed?: string;
};

/** The board's mic icon (top-left bx, by, width bw) -> Mic props. */
export const micFromBoard = (bx: number, by: number, bw: number): MicProps => ({x: bx + bw / 2, y: by + 0.99 * 1.7 * bw, w: bw});

export const Mic: React.FC<MicProps> = ({x, y, w = 105, tilt = 0, at, seed = 'mic'}) => {
  const h = 1.7 * w;
  const capW = 0.46 * w;
  const capH = 0.78 * w;
  const neck: Pt = [x, y - 0.54 * h + capH * 0.02];
  const baseW = 0.72 * w;
  const baseH = Math.max(8, 0.09 * h);
  const ink = w >= 110 ? W.mid : W.far + 0.4;
  const cap = roundRect(-capW / 2, -capH, capW, capH, capW / 2);
  const grille = [0.22, 0.36, 0.5].map((v) => hline(-capW * 0.36, capW * 0.36, -capH + capH * v, {seed: `${seed}/g${v}`, over: [0, 0]})).join('');
  return (
    <>
      {/* the stand: a short stem on a flat round base */}
      <Fill d={roundRect(x - baseW / 2, y - baseH, baseW, baseH, baseH / 2)} color={CC.micStand} seed={`${seed}/base`} at={fillAt(at)} />
      <Ink d={roundRect(x - baseW / 2, y - baseH, baseW, baseH, baseH / 2, {seed: `${seed}/baseI`})} width={ink} at={at} />
      <Ink d={line(x, y - baseH, neck[0], neck[1], {over: [0, 0], seed: `${seed}/stem`})} width={Math.max(5, w * 0.07)} color={CC.micStand} taper={false} at={at} />
      <Ink d={line(x, y - baseH, neck[0], neck[1], {over: [0, 0], seed: `${seed}/stemI`})} width={1.4} color={CC.ink} taper={false} at={at} />
      <XG m={mat.compose(mat.translate(neck[0], neck[1]), mat.rotate(tilt))}>
        <Fill d={roundRect(-capW * 0.28, -capH * 0.02, capW * 0.56, capH * 0.16, 4)} color={CC.micStand} offset={false} at={fillAt(at, 0.02)} />
        <Fill d={cap} color={CC.mic} seed={`${seed}/cap`} at={fillAt(at, 0.03)} />
        <Ink d={grille} width={Math.max(2, w * 0.022)} color={CC.micGrille} taper={false} at={b(at, 0.06)} />
        <Ink d={hline(-capW / 2, capW / 2, -capH * 0.3, {seed: `${seed}/ring`, over: [0, 0]})} width={Math.max(2.4, w * 0.03)} color={CC.micGrille} taper={false} at={b(at, 0.06)} />
        <Ink d={roundRect(-capW / 2, -capH, capW, capH, capW / 2, {seed: `${seed}/capI`})} width={ink} at={b(at, 0.03)} />
        <Ink d={glint(-capW * 0.18, -capH * 0.72, capW * 0.22, {seed: `${seed}/gl`})} width={W.hair} color={CC.core} at={b(at, 0.08)} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- her laptop (P5)

export type LaptopProps = {
  /** Hinge centre (canvas px). */
  x: number;
  y: number;
  /** Deck width at its front edge (P5: 460). */
  w?: number;
  /** Lid (screen) height as a fraction of w (default 0.42). */
  lidH?: number;
  /** 'ai' = the abstract AI network (P5) | 'blank' (lit, empty) | 'dark' (off). */
  screen?: 'ai' | 'blank' | 'dark';
  /** The hub's word on the 'ai' screen (default "AI"; never a logo or a company name). */
  hub?: string;
  at?: At;
  seed?: string;
};

/** Six nodes in a ring round a hub (screen-local 0..1 units, the board's nodes icon). */
const RING: Pt[] = [[0.12, 0.26], [0.5, 0.09], [0.88, 0.26], [0.88, 0.74], [0.5, 0.91], [0.12, 0.74]];

export const Laptop: React.FC<LaptopProps> = ({x, y, w = 460, lidH = 0.42, screen = 'ai', hub = 'AI', at, seed = 'laptop'}) => {
  const t = useTime();
  const lw = w * 0.64; // lid width
  const lh = w * lidH;
  const lid = {x: x - lw / 2, y: y - lh, w: lw, h: lh};
  const bz = w * 0.022; // bezel
  const sc = {x: lid.x + bz, y: lid.y + bz, w: lw - 2 * bz, h: lh - 2 * bz};
  const dh = w * 0.2; // deck depth on screen
  const deck: Pt[] = [[x - lw / 2, y], [x + lw / 2, y], [x + w / 2, y + dh], [x - w / 2, y + dh]];
  const P = (u: number, v: number): Pt => [sc.x + sc.w * (0.16 + 0.68 * u), sc.y + sc.h * (0.1 + 0.8 * v)];
  const hubC = P(0.5, 0.5);
  const hr = sc.h * 0.16;
  const nr = sc.h * 0.06;
  // a soft pulse round the network (one node lights at a time; a stepped walk, no fades)
  const lit = Math.floor((t + 0.3) * 3) % 6;
  let links = '';
  RING.forEach((p, i) => {
    const q = RING[(i + 1) % 6];
    const a = P(p[0], p[1]);
    const c = P(q[0], q[1]);
    links += line(hubC[0], hubC[1], a[0], a[1], {over: [0, 0], seed: `${seed}/s${i}`}) + line(a[0], a[1], c[0], c[1], {over: [0, 0], seed: `${seed}/r${i}`});
  });
  // keys: three rows of hairlines in perspective + a trackpad
  const keyRow = (v: number) => {
    const xl = x - (lw / 2 + (w - lw) / 2 * v) * 0.86;
    const xr = x + (lw / 2 + (w - lw) / 2 * v) * 0.86;
    return hline(xl, xr, y + dh * v, {seed: `${seed}/k${v}`, over: [0, 0]});
  };
  const pad = polyPath([[x - w * 0.09, y + dh * 0.7], [x + w * 0.09, y + dh * 0.7], [x + w * 0.1, y + dh * 0.94], [x - w * 0.1, y + dh * 0.94]]);
  return (
    <>
      <Fill d={polyPath(deck)} color={CC.laptopDeck} seed={`${seed}/deck`} at={fillAt(at, 0.04)} />
      <Ink d={poly(deck, {closed: true, seed: `${seed}/deckI`, over: 'small'})} width={W.mid} at={b(at, 0.04)} />
      <Fill d={polyPath([[x - w / 2, y + dh], [x + w / 2, y + dh], [x + w / 2, y + dh + w * 0.024], [x - w / 2, y + dh + w * 0.024]])} color={CC.laptop} offset={false} at={fillAt(at, 0.05)} />
      <Ink d={keyRow(0.18) + keyRow(0.36) + keyRow(0.54)} width={W.hair} color={CC.micGrille} at={b(at, 0.08)} />
      <Fill d={pad} color={CC.laptop} offset={false} at={fillAt(at, 0.08)} />
      <Fill d={roundRect(lid.x, lid.y, lid.w, lid.h, w * 0.02)} color={CC.laptop} seed={`${seed}/lid`} at={fillAt(at)} />
      <Ink d={roundRect(lid.x, lid.y, lid.w, lid.h, w * 0.02, {seed: `${seed}/lidI`})} width={W.mid} at={at} />
      {screen === 'dark' ? null : (
        <>
          <Fill rect={[sc.x, sc.y, sc.w, sc.h]} color={CC.screen} offset={false} at={fillAt(at, 0.06)} />
          {screen === 'ai' ? (
            <>
              <Ink d={links} width={Math.max(2, w * 0.006)} color={CC.screenInk} at={b(at, 0.12)} />
              {RING.map((p, i) => {
                const c = P(p[0], p[1]);
                return (
                  <React.Fragment key={i}>
                    <Fill d={blob(c[0], c[1], nr, nr, {seed: `${seed}/n${i}`})} color={i === lit ? CC.ring : CC.paper} offset={false} at={fillAt(at, 0.14)} />
                    <Ink d={ellipse(c[0], c[1], nr, nr, {seed: `${seed}/nI${i}`})} width={W.far} at={b(at, 0.14)} />
                  </React.Fragment>
                );
              })}
              <Fill d={blob(hubC[0], hubC[1], hr, hr, {seed: `${seed}/hub`})} color={CC.paper} offset={false} at={fillAt(at, 0.16)} />
              <Ink d={ellipse(hubC[0], hubC[1], hr, hr, {seed: `${seed}/hubI`})} width={W.mid} at={b(at, 0.16)} />
              <Letter x={hubC[0]} y={hubC[1] + hr * 0.42} size={hr * 1.15} anchor="middle" at={b(at, 0.2)}>
                {hub}
              </Letter>
            </>
          ) : null}
          <Ink d={glint(sc.x + sc.w * 0.86, sc.y + sc.h * 0.22, sc.w * 0.08, {seed: `${seed}/gl`})} width={W.far} color={CC.white} at={b(at, 0.2)} />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- her speech bubble

export type BubbleProps = {
  /** Box top-left and size (canvas px; the board's speech icon box: P4 / P6 small ~300 x 200, P13 400 x 264). */
  x: number;
  y: number;
  w: number;
  h?: number;
  /** The tail's tip (canvas px): her mouth / head. */
  tail: Pt;
  /** Pop time (scale from the tail, a springy landing); omit = there. */
  at?: number;
  /** Her own word (P13: FACTS), hand-lettered; omit = three speech lines (P4, P6: no words). */
  text?: string;
  /** The word writes on from here (default: with the pop). */
  textAt?: number;
  seed?: string;
};

export const Bubble: React.FC<BubbleProps> = ({x, y, w, h = w * 0.66, tail, at, text, textAt, seed = 'bubble'}) => {
  const cx = x + w * 0.5;
  const cy = y + h * 0.44;
  const rx = w * 0.49;
  const ry = h * 0.42;
  const a0 = Math.atan2((tail[1] - cy) / ry, (tail[0] - cx) / rx);
  const gap = Math.min(0.32, 0.24 * (rx / Math.max(rx, Math.hypot(tail[0] - cx, tail[1] - cy) * 0.6)) + 0.08);
  const pts: Pt[] = [tail];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const a = a0 + gap + ((2 * Math.PI - 2 * gap) * i) / N;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  const d = smooth(pts, {closed: true, tension: 0.3});
  const ink = w >= 360 ? W.front : 4.2;
  const lines = [[0.3, 0.56], [0.44, 0.66], [0.58, 0.4]].map(([v, lw], i) => hline(cx - (w * lw) / 2, cx + (w * lw) / 2, y + h * v, {seed: `${seed}/l${i}`, over: [0, 0]})).join('');
  return (
    <PopFrom at={at} x={tail[0]} y={tail[1]}>
      <Fill d={d} color={CC.paper} offset={false} />
      <Ink d={d} width={ink} taper={false} />
      {text ? (
        <Letter x={cx} y={cy + h * 0.13} size={h * 0.38} fit={w * 0.7} anchor="middle" at={textAt ?? (at !== undefined ? at + 0.08 : undefined)} dur={0.18}>
          {text}
        </Letter>
      ) : (
        <Ink d={lines} width={W.mid} at={at !== undefined ? at + 0.1 : undefined} dur={0.2} />
      )}
    </PopFrom>
  );
};

/** Pops from (x, y): 0.15 -> 1.08 -> 1 over 0.22 s (no fade). */
const PopFrom: React.FC<{at?: number; x: number; y: number; children?: React.ReactNode}> = ({at, x, y, children}) => {
  const t = useTime();
  if (at === undefined) return <>{children}</>;
  if (t < at) return null;
  const p = prog(t, at, 0.22, E.outBack(1.8));
  if (p >= 1) return <>{children}</>;
  const s = 0.15 + 0.85 * p;
  return <XG m={mat.about(mat.scale(s), x, y)}>{children}</XG>;
};

// ---------------------------------------------------------------- stamps (P7 APRIL 2026, P10 NO VETO)

export type StampProps = {
  /** Centre (canvas px). */
  x: number;
  y: number;
  /** Width (P7 240, P10 330); height = 0.38 w. */
  w: number;
  text: string;
  rot?: number;
  /** Slam time: it lands from 1.6x in 0.09 s with a small jolt; omit = there. */
  at?: number;
};

export const Stamp: React.FC<StampProps> = ({x, y, w, text, rot = -6, at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const h = w * 0.38;
  const p = at === undefined ? 1 : prog(t, at, 0.09, E.inQuad);
  const settle = at === undefined ? 0 : Math.max(0, t - at - 0.09);
  const jolt = settle > 0 && settle < 0.12 ? 0.035 * Math.sin((Math.PI * settle) / 0.12) : 0;
  const s = (1.6 - 0.6 * p) * (1 - jolt);
  const box = roundRect(-w / 2, -h / 2, w, h, h * 0.16);
  const inner = roundRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, h * 0.12);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(s))}>
      <Ink d={box} width={w >= 300 ? 7 : 5.5} color={CC.stamp} taper={false} />
      <Ink d={inner} width={2.4} color={CC.stamp} taper={false} />
      <Letter x={0} y={h * 0.2} size={h * 0.52} fit={w - 44} anchor="middle" fill={CC.stamp}>
        {text}
      </Letter>
    </XG>
  );
};

// ---------------------------------------------------------------- the cold inserts (P7, P9, P10, P11)

/** The board's page boxes: P9 and P11 share one box (Google's page at the deal page's size, position, ground, tone). */
export const INSERT_PAGES = {
  P7: {x: 320, y: 640, w: 440, h: 600},
  P9: {x: 310, y: 640, w: 460, h: 620},
  P10: {x: 344.5, y: 686.5, w: 391, h: 527},
  P11: {x: 310, y: 640, w: 460, h: 620},
} as const;

/** THE cold ground (kit/README.md): one flat CC.cold slab over the whole frame (+ bleed). */
export const ColdGround: React.FC<{at?: At; color?: string}> = ({at, color = CC.cold}) => (
  <Fill rect={[-200, -200, 1480, 2320]} color={color} at={at} mode="snap" offset={false} />
);

export type InsertPageProps = {x: number; y: number; w: number; h: number; at?: At; seed?: string; children?: React.ReactNode};

/** A warm white page with ink on the cold ground: a flat drop shadow (one step darker than the ground), the paper, the
 *  outline. Children draw on it in canvas px (use <Letter> for its words). */
export const InsertPage: React.FC<InsertPageProps> = ({x, y, w, h, at, seed = 'ipage', children}) => (
  <>
    <Fill rect={[x + 12, y + 14, w, h]} color={CC.coldShade} offset={false} at={fillAt(at)} />
    <Fill rect={[x, y, w, h]} color={CC.paper} offset={false} at={fillAt(at)} />
    <Ink d={rect(x, y, w, h, {seed: `${seed}/I`, over: 'small'})} width={W.mid} at={at} />
    {children}
  </>
);

// ---------------------------------------------------------------- the mug (nook sizes; O1's desk mug is DeskMug)

export const Mug: React.FC<{x: number; top: number; w?: number; steam?: boolean; at?: At; seed?: string}> = ({x, top, w = 50, steam = true, at, seed = 'mug'}) => {
  const t = useTime();
  const x1 = x + w;
  const hgt = w * 1.06;
  const bot = top + hgt;
  const r = w * 0.18;
  const body = `M${x} ${top}L${x} ${bot - r}Q${x} ${bot} ${x + r} ${bot}L${x1 - r} ${bot}Q${x1} ${bot} ${x1} ${bot - r}L${x1} ${top}Z`;
  const st = (sx: number, ph: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 4; i++) pts.push([sx + Math.sin(i * 1.3 + ph + t * 1.6) * w * 0.07, top - w * 0.16 - i * w * 0.18]);
    return smooth(pts);
  };
  const ink = w >= 80 ? W.mid : W.far + 0.4;
  return (
    <>
      <Ink d={`M${x1 - 1} ${top + w * 0.2}C${x1 + w * 0.42} ${top + w * 0.18} ${x1 + w * 0.42} ${top + w * 0.78} ${x1 - 1} ${top + w * 0.74}`} width={Math.max(4, w * 0.14)} color={CC.ink} taper={false} at={at} />
      <Ink d={`M${x1 - 1} ${top + w * 0.2}C${x1 + w * 0.42} ${top + w * 0.18} ${x1 + w * 0.42} ${top + w * 0.78} ${x1 - 1} ${top + w * 0.74}`} width={Math.max(2, w * 0.08)} color={CC.mug} taper={false} at={at} />
      <Fill d={body} color={CC.mug} seed={`${seed}/b`} at={fillAt(at)} />
      <Fill rect={[x, top + hgt * 0.38, w, hgt * 0.17]} color={CC.mugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={body} width={ink} at={at} />
      <Fill d={blob(x + w / 2, top, w / 2, Math.max(4, w * 0.12), {seed: `${seed}/rim`})} color={CC.anchor} offset={false} at={fillAt(at, 0.03)} />
      {steam ? <Ink d={st(x + w * 0.35, 0) + st(x + w * 0.66, 2.1)} width={W.far} at={b(at, 0.1)} /> : null}
    </>
  );
};

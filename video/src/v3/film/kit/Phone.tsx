// kit/Phone.tsx: your phone with the shop listing (header with the cart and its badge, the product photo with THE
// laptop, the listing price, the blue "Add to cart" button: the pop) and the hand holding it (POV: fingers round the
// left edge, the thumb on the button, palm and rust sleeve cut by the frame bottom). From the style frame
// (src/v3/StyleNook.tsx Phone / Hand), made parametric: everything is laid out in phone-local px (origin = the phone's
// top-left, unrotated; k = w / 400), so lanes can aim sticks, tags and strings at the listing with `phonePoint`.

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, glint, line, poly, polyPath, roundRect, smooth, textLines} from '../../../lib/sketch';
import {useTime, prog, ease} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt} from './util';
import {Laptop} from './Laptop';

export type PhoneProps = {
  /** Top-left of the phone (canvas px), before rotation. */
  x: number;
  y: number;
  /** Width (px; 400 in O1 / S15). Height defaults to 2.2 w (cut by the frame bottom in the POV shots). */
  w?: number;
  h?: number;
  /** Rotation about the phone's centre (degrees; default -3, the style frame's hold). */
  rot?: number;
  title?: string;
  /** Cart badge count (null = no badge) and when it pops in. */
  badge?: number | string | null;
  badgeAt?: At;
  /** Listing price (e.g. "$999"), struck from `priceStrikeAt`; `newPrice` pops next to it at `newPriceAt`. */
  price?: string | null;
  priceStrikeAt?: At;
  newPrice?: string;
  newPriceAt?: At;
  /** Local y of the price baseline and of the button's top (ref px at w 400; scaled with k). */
  priceY?: number;
  buttonY?: number;
  buttonText?: string;
  /** The button squashes as the thumb taps it (0.12 s). */
  pressAt?: number;
  /** Draw the listing's product laptop (default true); false leaves the photo panel empty (e.g. the laptop lifted off). */
  photoLaptop?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
  /** Drawn on the screen, in phone-local px (after the UI). */
  children?: React.ReactNode;
};

/** Phone-local layout (px) for a phone of width w. */
export function phoneSlots(w = 400, priceY = 372, buttonY = 400) {
  const k = w / 400;
  return {
    k,
    h: 880 * k,
    photo: {x: 36 * k, y: 114 * k, w: 328 * k, h: 160 * k},
    /** The product laptop in the photo: hinge centre and width (sticks lift off it). */
    laptop: {x: 200 * k, y: 222 * k, w: 164 * k},
    price: {x: 40 * k, y: priceY * k, size: 56 * k},
    button: {x: 40 * k, y: buttonY * k, w: 320 * k, h: 72 * k},
    cart: {x: 322 * k, y: 82 * k},
    badge: {x: 352 * k, y: 64 * k, r: 16 * k},
  };
}

/** Canvas point of a phone-local point (follows the phone's rotation). */
export function phonePoint(p: {x: number; y: number; w?: number; h?: number; rot?: number}, lx: number, ly: number): Pt {
  const w = p.w ?? 400;
  const h = p.h ?? w * 2.2;
  const rot = ((p.rot ?? -3) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const dx = lx - cx;
  const dy = ly - cy;
  return [p.x + cx + dx * Math.cos(rot) - dy * Math.sin(rot), p.y + cy + dx * Math.sin(rot) + dy * Math.cos(rot)];
}

const phoneMat = (x: number, y: number, w: number, h: number, rot: number) => mat.compose(mat.translate(x, y), mat.about(mat.rotate(rot), w / 2, h / 2));

export const Phone: React.FC<PhoneProps> = ({
  x,
  y,
  w = 400,
  h: hIn,
  rot = -3,
  title = 'Laptops',
  badge = 1,
  badgeAt,
  price = '$999',
  priceStrikeAt,
  newPrice,
  newPriceAt,
  priceY = 372,
  buttonY = 400,
  buttonText = 'Add to cart',
  pressAt,
  photoLaptop = true,
  at,
  seed = 'phone',
  ink = 4.8,
  children,
}) => {
  const t = useTime();
  const S = phoneSlots(w, priceY, buttonY);
  const k = S.k;
  const h = hIn ?? w * 2.2;
  const thin = 2.2;
  const press = pressAt !== undefined && t >= pressAt ? 1 - 0.05 * Math.sin(Math.PI * prog(t, pressAt, 0.14)) : 1;
  const bt = S.button;
  const strikeW = price ? price.length * S.price.size * 0.44 : 0;
  return (
    <XG m={phoneMat(x, y, w, h, rot)}>
      <Fill d={roundRect(0, 0, w, h, 56 * k)} color={EMBER.anchor} at={fillAt(at)} seed={`${seed}/body`} />
      <Fill d={roundRect(16 * k, 16 * k, w - 32 * k, h - 32 * k, 42 * k)} color={EMBER.screen} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={roundRect(0, 0, w, h, 56 * k, {seed: `${seed}/o`})} at={at} width={ink} />
      <Fill d={roundRect(160 * k, 30 * k, 80 * k, 20 * k, 10 * k)} color={EMBER.anchor} at={fillAt(at, 0.05)} offset={false} />
      {/* header: back chevron, title, cart (+ badge) */}
      <Ink d={poly([[52 * k, 70 * k], [40 * k, 82 * k], [52 * k, 94 * k]], {joined: true, seed: `${seed}/chev`})} at={b(at, 0.08)} width={thin} />
      <Show at={fillAt(at, 0.06)}>
        <Txt x={64 * k} y={93 * k} size={32 * k} anchor="start">
          {title}
        </Txt>
      </Show>
      <Ink
        d={poly([[300 * k, 70 * k], [310 * k, 70 * k], [318 * k, 94 * k], [342 * k, 94 * k], [348 * k, 78 * k], [313 * k, 78 * k]], {joined: true, seed: `${seed}/cart`}) + circle(322 * k, 102 * k, 4 * k, {seed: `${seed}/w1`}) + circle(340 * k, 102 * k, 4 * k, {seed: `${seed}/w2`})}
        at={b(at, 0.1)}
        width={thin}
      />
      {badge !== null ? (
        <>
          <Fill d={blob(S.badge.x, S.badge.y, S.badge.r, S.badge.r, {seed: `${seed}/badge`})} color={EMBER.pop} at={badgeAt ?? fillAt(at, 0.1)} mode="spring" offset={false} />
          <Show at={badgeAt ?? fillAt(at, 0.1)}>
            <Txt x={S.badge.x} y={S.badge.y + 9 * k} size={26 * k} fill={EMBER.popText}>
              {String(badge)}
            </Txt>
          </Show>
        </>
      ) : null}
      {/* product photo: THE laptop (the 'new' one, lit) on the listing panel */}
      <Fill d={roundRect(S.photo.x, S.photo.y, S.photo.w, S.photo.h, 18 * k)} color={EMBER.paper} at={fillAt(at, 0.04)} offset={false} />
      {photoLaptop ? <Laptop x={S.laptop.x} y={S.laptop.y} w={S.laptop.w} variant="new" at={b(at, 0.06)} seed={`${seed}/lap`} ink={3} /> : null}
      <Ink d={textLines(40 * k, 300 * k, 230 * k, {n: 1, gap: 18 * k, seed: `${seed}/title`, heading: false})} at={b(at, 0.14)} width={thin} />
      {/* the listing price (struck when it goes up; the new price pops beside it) */}
      {price ? (
        <Show at={fillAt(at, 0.08)}>
          <Txt x={S.price.x} y={S.price.y} size={S.price.size} anchor="start">
            {price}
          </Txt>
        </Show>
      ) : null}
      {price && priceStrikeAt !== undefined ? <Ink d={line(S.price.x - 4, S.price.y - S.price.size * 0.3, S.price.x + strikeW + 6, S.price.y - S.price.size * 0.34, {over: [2, 4], seed: `${seed}/strike`})} at={priceStrikeAt} width={3.4 * Math.max(0.8, k)} /> : null}
      {newPrice ? (
        <Show at={newPriceAt ?? fillAt(at, 0.08)}>
          <Txt x={S.price.x + strikeW + 26 * k} y={S.price.y} size={S.price.size} fill={EMBER.hero} anchor="start">
            {newPrice}
          </Txt>
        </Show>
      ) : null}
      {/* "Add to cart": the pop */}
      <XG m={mat.about(mat.scale(press), bt.x + bt.w / 2, bt.y + bt.h / 2)}>
        <Fill d={roundRect(bt.x, bt.y, bt.w, bt.h, 20 * k)} color={EMBER.pop} at={fillAt(at, 0.1)} seed={`${seed}/btn`} />
        <Ink d={roundRect(bt.x, bt.y, bt.w, bt.h, 20 * k, {seed: `${seed}/btnI`})} at={b(at, 0.1)} width={3.4} />
        <Show at={fillAt(at, 0.12)}>
          <Txt x={bt.x + bt.w / 2} y={bt.y + bt.h * 0.69} size={46 * k} fill={EMBER.popText} fit={bt.w * 0.86}>
            {buttonText}
          </Txt>
        </Show>
      </XG>
      <Ink d={textLines(40 * k, (buttonY + 110) * k, 300 * k, {n: 4, gap: 22 * k, seed: `${seed}/desc`, heading: false})} at={b(at, 0.2)} width={1.6} />
      {children}
    </XG>
  );
};

// ---------------------------------------------------------------- the hand (POV)

export type HandProps = {
  /** The phone it holds (same geometry props as <Phone>). */
  phone: {x: number; y: number; w?: number; h?: number; rot?: number; buttonY?: number};
  /** Thumb tip target in phone-local px (default: the right part of the "Add to cart" button). */
  thumbTo?: Pt;
  /** The thumb taps (dips 8 px) at this time. */
  pressAt?: number;
  at?: At;
  seed?: string;
  ink?: number;
};

const addP = (a: Pt, c: Pt, s = 1): Pt => [a[0] + c[0] * s, a[1] + c[1] * s];

export const Hand: React.FC<HandProps> = ({phone, thumbTo, pressAt, at, seed = 'hand', ink = 4.8}) => {
  const t = useTime();
  const w = phone.w ?? 400;
  const h = phone.h ?? w * 2.2;
  const k = w / 400;
  const S = phoneSlots(w, 372, phone.buttonY ?? 400);
  const dip = pressAt !== undefined && t >= pressAt ? 8 * Math.sin(Math.PI * prog(t, pressAt, 0.14, ease.linear)) : 0;
  const T: Pt = thumbTo ?? [S.button.x + S.button.w * 0.88, S.button.y + S.button.h * 0.55 + dip];
  const B: Pt = [460 * k, S.button.y + 344 * k];
  const len = Math.hypot(T[0] - B[0], T[1] - B[1]) || 1;
  const u: Pt = [(T[0] - B[0]) / len, (T[1] - B[1]) / len];
  const n: Pt = [-u[1], u[0]];
  const tw = 50 * k;
  const thumb: Pt[] = [addP(B, n, tw), addP(addP(T, n, 37 * k), u, -10 * k), addP(addP(T, n, 24 * k), u, 22 * k), addP(T, u, 34 * k), addP(addP(T, n, -24 * k), u, 22 * k), addP(addP(T, n, -37 * k), u, -10 * k), addP(B, n, -tw)];
  const nailC = addP(T, u, -6 * k);
  const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI + 90;
  const crease = (kk: number, s: number) => {
    const c = addP(T, u, -kk * k);
    return line(...addP(c, n, s * k), ...addP(c, n, -s * 0.7 * k), {over: [0, 0], seed: `${seed}/cr${kk}`});
  };
  // palm + sleeve, laid out from the button (style frame offsets), running past the frame bottom
  const py = S.button.y - 330 * k; // style frame: button at local 330
  const P = (px: number, yy: number): string => `${(px * k).toFixed(1)} ${(yy * k + py).toFixed(1)}`;
  const palm = `M${P(190, 924)}C${P(210, 794)} ${P(270, 706)} ${P(372, 664)}C${P(454, 632)} ${P(550, 640)} ${P(640, 664)}L${P(640, 1500)}L${P(190, 1500)}Z`;
  const palmInk = `M${P(190, 924)}C${P(210, 794)} ${P(270, 706)} ${P(372, 664)}C${P(454, 632)} ${P(550, 640)} ${P(640, 664)}`;
  const sleeve = polyPath([[410 * k, 924 * k + py], [450 * k, 814 * k + py], [640 * k, 766 * k + py], [640 * k, 1500 * k + py], [410 * k, 1500 * k + py]]);
  const fingersY = [538, 586, 634].map((v) => v * k + py);
  const fingers = fingersY.map((fy, i) => ({x: 2 * k - i * 2 * k, y: fy, r: 12 - i * 4}));
  void h;
  return (
    <XG m={phoneMat(phone.x, phone.y, w, h, phone.rot ?? -3)}>
      {fingers.map((f, i) => (
        <XG key={i} m={mat.compose(mat.translate(f.x, f.y), mat.rotate(f.r))}>
          <Fill d={roundRect(-56 * k, -22 * k, 82 * k, 44 * k, 21 * k)} color={EMBER.skin} at={fillAt(at, 0.04 * i)} seed={`${seed}/f${i}`} />
          <Ink d={roundRect(-56 * k, -22 * k, 82 * k, 44 * k, 21 * k, {seed: `${seed}/fI${i}`})} at={b(at, 0.03 * i)} width={3.4} />
          <Ink d={line(4 * k, -11 * k, 7 * k, 11 * k, {over: [0, 0], seed: `${seed}/fn${i}`})} at={b(at, 0.1)} width={1.6} />
        </XG>
      ))}
      <Fill d={smooth(thumb, {closed: true})} color={EMBER.skin} at={fillAt(at)} seed={`${seed}/thumb`} />
      <Ink d={smooth(thumb.slice(0, 6))} at={at} width={ink} />
      <Ink d={line(...thumb[5], ...addP(thumb[6], u, 40 * k), {over: [0, 0], seed: `${seed}/thE`})} at={b(at, 0.04)} width={ink} />
      <XG m={mat.compose(mat.translate(nailC[0], nailC[1]), mat.rotate(ang))}>
        <Fill d={roundRect(-19 * k, -22 * k, 38 * k, 42 * k, 14 * k)} color={EMBER.nail} at={fillAt(at, 0.06)} offset={false} />
        <Ink d={roundRect(-19 * k, -22 * k, 38 * k, 42 * k, 14 * k, {seed: `${seed}/nail`})} at={b(at, 0.08)} width={2.2} />
      </XG>
      <Ink d={crease(118, 20) + crease(132, 14)} at={b(at, 0.12)} width={2.2} />
      <Fill d={palm} color={EMBER.skin} at={fillAt(at, 0.02)} seed={`${seed}/palm`} />
      <Ink d={palmInk} at={b(at, 0.02)} width={ink} />
      <Fill d={sleeve} color={EMBER.sleeve} at={fillAt(at, 0.05)} seed={`${seed}/sleeve`} />
      <Ink d={line(450 * k, 814 * k + py, 640 * k, 766 * k + py, {seed: `${seed}/cuff`, over: 'medium'}) + line(470 * k, 840 * k + py, 640 * k, 798 * k + py, {seed: `${seed}/cuff2`, over: 'small'})} at={b(at, 0.06)} width={ink} />
    </XG>
  );
};

/** The glint of a phone screen (for an off / lowered phone). */
export const screenGlint = (x: number, y: number, len = 40, seed = 'pg') => glint(x, y, len, {seed});

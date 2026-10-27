// kit/PriceTag.tsx: THE price tag (O1, S5, S12, S15, S16): a hero burnt-orange paper tag on a string, pointed at its
// hole end, white price lettering, the blue eyelet (the pop accent). A ticker steps the value (each step pops and
// jolts the tag), a struck old price can sit above the new one, and the tag can turn over to show a small data
// center drawn on its back (S16).

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, line, poly, polyPath, smooth} from '../../../lib/sketch';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt} from './util';
import {DataCenter} from './Outside';

export type TickerStep = {t: number; v: string};

export type PriceTagProps = {
  /** Top-left of the tag box (canvas px) before rotation; the tag is w x 0.5 w, its hole at (x + 0.12 w, y + 0.25 w). */
  x: number;
  y: number;
  /** Width (px). 360 in O1 (the subject), 190 on S5's laptops, 460 in S16. */
  w: number;
  /** The price shown (or the first value of `ticker`). */
  value?: string;
  /** Steps: the latest step with t <= now shows; each change pops the price and jolts the tag. */
  ticker?: TickerStep[];
  /** A struck old price above the main one, struck from `strikeAt` (omit = struck already). */
  old?: string;
  /** The old price's size as a fraction of w (default 0.16: it reads at phone size; the first kit's 0.13 did not). */
  oldSize?: number;
  /** The old price's colour: 'white' (default, the price's own white) | 'cream' (the lamp core, a softer step). */
  oldTone?: 'white' | 'cream';
  oldAt?: At;
  strikeAt?: At;
  /** The string's far end (canvas px): the tag hangs from it. Omit = no string. */
  stringFrom?: Pt;
  /** Hang angle (degrees, about the hole). */
  rot?: number;
  /** Idle sway amplitude (degrees). */
  sway?: number;
  /** Turn the tag over from this time (0.36 s): the back shows a small data center. */
  turnAt?: number;
  /** The turn's progress 0..1 given directly (0 = front, 1 = back; overrides `turnAt`): S16's loop un-build turns the
   *  tag back to its front as it travels onto O1's frame-0 tag. */
  turn?: number;
  /** The sign on the back's mini data center (default "AI": the full "AI DATA CENTER" is ~6 px at phone size). */
  backSign?: string;
  /** 'hero' (burnt orange, default) | 'pop' (the style frame's blue tag). */
  tone?: 'hero' | 'pop';
  at?: At;
  seed?: string;
  ink?: number;
};

/** The tag outline in tag-local px (origin = the box's top-left). */
export function tagShape(w: number): Pt[] {
  const h = w * 0.5;
  const tip = w * 0.2;
  const c = w * 0.025; // softened corners
  return [
    [tip, 0],
    [w - c, 0],
    [w, c],
    [w, h - c],
    [w - c, h],
    [tip, h],
    [0, h * 0.5],
  ];
}
export const tagHole = (w: number): Pt => [w * 0.12, w * 0.25];

/** Current ticker value and the time of its last change. */
function tickerNow(t: number, value?: string, ticker?: TickerStep[]): {v: string; since: number | undefined} {
  if (!ticker || !ticker.length) return {v: value ?? '', since: undefined};
  let v = value ?? ticker[0].v;
  let since: number | undefined;
  for (const s of ticker) if (t >= s.t) {
    v = s.v;
    since = s.t;
  }
  return {v, since};
}

export const PriceTag: React.FC<PriceTagProps> = ({x, y, w, value, ticker, old, oldSize: oldK = 0.16, oldTone = 'white', oldAt, strikeAt, stringFrom, rot = 0, sway = 0, turnAt, turn, backSign = 'AI', tone = 'hero', at, seed = 'tag', ink = 3.4}) => {
  const t = useTime();
  const h = w * 0.5;
  const shape = tagShape(w);
  const [hx, hy] = tagHole(w);
  const body = tone === 'pop' ? EMBER.pop : EMBER.hero;
  const {v, since} = tickerNow(t, value, ticker);
  // a step: the price pops (1.3 -> 1) and the tag jolts (a damped swing about the hole)
  const k = since === undefined ? 1 : prog(t, since, 0.14, ease.outCubic);
  const popS = 1.3 - 0.3 * k;
  const jolt = since === undefined ? 0 : 7 * Math.exp(-(t - since) * 9) * Math.sin((t - since) * 34);
  const swing = sway ? sway * Math.sin(t * 1.7 + (seed.length % 5)) : 0;
  const ang = rot + jolt + swing;
  // turn-over: |cos| squash about the tag's centre; the back shows after the half-way point
  let sx = 1;
  let back = false;
  if (turn !== undefined || (turnAt !== undefined && t >= turnAt)) {
    const p = turn !== undefined ? clamp(turn) : prog(t, turnAt!, 0.36, ease.inOutSine);
    sx = Math.cos(Math.PI * p);
    back = p > 0.5;
    sx = Math.abs(sx) < 0.02 ? 0.02 : Math.abs(sx);
  }
  const holeAbs: Pt = [x + hx, y + hy];
  const m = mat.compose(mat.translate(holeAbs[0], holeAbs[1]), mat.rotate(ang), mat.translate(-hx, -hy), mat.about(mat.scale(sx, 1), w * 0.55, h / 2));
  const priceSize = old ? w * 0.2 : w * 0.25;
  const priceY = old ? h * 0.86 : h * 0.68;
  const textX = w * 0.6;
  const fit = w * 0.66;
  const oldSize = w * oldK;
  const oldY = h * 0.36 + (oldSize - w * 0.13) * 0.3;
  const strikeHalf = Math.min(w * 0.24, w * 0.17 * (oldK / 0.13));
  const strikeD = old ? line(textX - strikeHalf, oldY - oldSize * 0.32, textX + strikeHalf, oldY - oldSize * 0.36, {over: [2, 4], seed: `${seed}/strike`}) : '';
  // the string: from its anchor to the hole, with a little sag
  let stringD = '';
  if (stringFrom) {
    const [ax, ay] = stringFrom;
    const mx = (ax + holeAbs[0]) / 2;
    const my = Math.max(ay, holeAbs[1]) + Math.abs(holeAbs[0] - ax) * 0.08 + 6;
    stringD = smooth([stringFrom, [mx, my], holeAbs]);
  }
  return (
    <>
      {stringD ? <Ink d={stringD} at={at} width={2.2} /> : null}
      <XG m={m}>
        <Fill d={polyPath(shape)} color={back ? EMBER.heroDeep : body} at={fillAt(at)} seed={`${seed}/body`} />
        <Ink d={poly(shape, {closed: true, seed: `${seed}/o`, over: w < 240 ? [0, 3] : [2, 7]})} at={at} width={ink} />
        {/* the eyelet: the blue pop ring around the hole */}
        <Fill d={blob(hx, hy, w * 0.045, w * 0.045, {seed: `${seed}/ring`})} color={tone === 'pop' ? EMBER.card : EMBER.pop} at={fillAt(at, 0.04)} offset={false} />
        <Fill d={blob(hx, hy, w * 0.022, w * 0.022, {seed: `${seed}/hole`})} color={EMBER.wall} at={fillAt(at, 0.06)} offset={false} />
        <Ink d={circle(hx, hy, w * 0.045, {seed: `${seed}/ringI`})} at={b(at, 0.06)} width={Math.max(1.6, ink * 0.6)} />
        {back ? (
          <Show at={fillAt(at)}>
            <DataCenter x={w * 0.6} y={h * 0.8} w={w * 0.52} variant="mini" sign={backSign} seed={`${seed}/back`} ink={Math.max(1.6, ink * 0.6)} />
          </Show>
        ) : (
          <>
            {old ? (
              <Show at={oldAt ?? fillAt(at)}>
                <Txt x={textX} y={oldY} size={oldSize} fill={oldTone === 'white' ? EMBER.white : EMBER.core} fit={fit * 0.76}>
                  {old}
                </Txt>
              </Show>
            ) : null}
            {old ? <Ink d={strikeD} at={strikeAt ?? oldAt ?? b(at, 0.2)} width={Math.max(2.6, w * 0.013)} color={EMBER.ink} /> : null}
            <Show at={fillAt(at)}>
              <XG m={mat.about(mat.scale(clamp(popS, 1, 1.3)), textX, priceY - priceSize * 0.3)}>
                <Txt x={textX} y={priceY} size={priceSize} fill={EMBER.white} fit={fit}>
                  {v}
                </Txt>
              </XG>
            </Show>
          </>
        )}
      </XG>
    </>
  );
};

/** Screen position of the tag's hole (where a string ties on), for lanes chaining a tag to a phone or a laptop. */
export const tagHoleAt = (x: number, y: number, w: number): Pt => [x + tagHole(w)[0], y + tagHole(w)[1]];

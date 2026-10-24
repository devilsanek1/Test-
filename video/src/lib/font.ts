// font.ts — loads the caption hand font ('CaptionHand' from public/fonts/CaptionHand.woff2) once per tab and
// blocks rendering until it is ready (delayRender/continueRender). Use useCaptionFont() in any component
// that renders caption-style text; it returns true once the font is usable (measurements are then exact).

import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {type as typeTok} from './theme';

export const CAPTION_FONT = typeTok.family;
/** CSS font-family stack for caption text. */
export const captionFontStack = `'${CAPTION_FONT}', 'Patrick Hand', 'Comic Sans MS', cursive`;

let promise: Promise<void> | null = null;
let ready = false;

export function loadCaptionFont(): Promise<void> {
  if (ready) return Promise.resolve();
  if (!promise) {
    if (typeof document === 'undefined' || typeof FontFace === 'undefined') return Promise.resolve();
    const face = new FontFace(CAPTION_FONT, `url(${staticFile('fonts/CaptionHand.woff2')}) format('woff2')`);
    promise = face
      .load()
      .then((f) => {
        (document.fonts as unknown as {add: (x: FontFace) => void}).add(f);
        ready = true;
      })
      .catch((err) => {
        // never hang the render on a missing font; fall back to the stack
        console.warn('[font] CaptionHand failed to load', err);
        ready = true;
      });
  }
  return promise;
}

export function useCaptionFont(): boolean {
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender('Loading CaptionHand font', {timeoutInMilliseconds: 20000})));
  useEffect(() => {
    let alive = true;
    loadCaptionFont().then(() => {
      if (alive) setOk(true);
      if (handle !== null) continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [handle]);
  return ok;
}

let measureCtx: CanvasRenderingContext2D | null = null;
const widthCache = new Map<string, number>();

/** Width in px of `text` in the caption font at `size` px (exact once the font has loaded). */
export function measureCaption(text: string, size: number): number {
  const key = `${ready ? 1 : 0}|${size}|${text}`;
  const hit = widthCache.get(key);
  if (hit !== undefined) return hit;
  if (!measureCtx && typeof document !== 'undefined') measureCtx = document.createElement('canvas').getContext('2d');
  let w = text.length * size * 0.45;
  if (measureCtx) {
    measureCtx.font = `${size}px ${captionFontStack}`;
    w = measureCtx.measureText(text).width;
  }
  widthCache.set(key, w);
  return w;
}

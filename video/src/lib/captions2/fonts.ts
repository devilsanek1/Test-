// fonts.ts: loads the caption hand (Gaegu 300 / 400 / 700, public/fonts/Gaegu-<w>.woff2, OFL: Gaegu-OFL.txt) once
// per tab and holds the render until it is in (delayRender), so every measurement and frame uses the real face.
//
//   const ready = useHandFonts();          // in any component that draws or measures the hand
//   HAND_FAMILY                            // 'Gaegu': the CSS family name

import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import recipes from './recipes.json';

export const HAND_FAMILY: string = recipes.family;
export const HAND_WEIGHTS = [300, 400, 700] as const;
/** The CSS font-family stack for the hand (the fallback only ever shows if the files are missing). */
export const handStack = `'${HAND_FAMILY}', 'Patrick Hand', 'Comic Sans MS', cursive`;

let promise: Promise<void> | null = null;
let ready = false;

export function loadHandFonts(): Promise<void> {
  if (ready) return Promise.resolve();
  if (!promise) {
    if (typeof document === 'undefined' || typeof FontFace === 'undefined') return Promise.resolve();
    const files = recipes.fonts as Record<string, string>;
    promise = Promise.all(
      HAND_WEIGHTS.map((w) => {
        const face = new FontFace(HAND_FAMILY, `url(${staticFile(files[String(w)])}) format('woff2')`, {weight: String(w), style: 'normal'});
        return face.load().then((f) => {
          (document.fonts as unknown as {add: (x: FontFace) => void}).add(f);
        });
      }),
    )
      .then(() => document.fonts.ready)
      .then(() => {
        ready = true;
      })
      .catch((err) => {
        // never hang a render on a missing file: the stack falls back (and the layout with it)
        console.warn('[captions2] Gaegu failed to load', err);
        ready = true;
      });
  }
  return promise;
}

/** True once the hand is usable; holds the frame (delayRender) until then. */
export function useHandFonts(): boolean {
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender('captions2: loading Gaegu', {timeoutInMilliseconds: 30000})));
  useEffect(() => {
    let alive = true;
    loadHandFonts().then(() => {
      if (alive) setOk(true);
      if (handle !== null) continueRender(handle);
    });
    return () => {
      alive = false;
    };
  }, [handle]);
  return ok;
}

export const handFontsReady = () => ready;

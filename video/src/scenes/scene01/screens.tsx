// S01 browser windows with an INK-DARK dead screen (fix round 1, review: "a bunch of / only half" did not read: the
// kit's dead screen is tealDark, the same value as the tealDark shutter slats, so govC's half shutter over its dead
// screen looked fully shut). LOCAL STAND-IN through the set's public `windowSlot`: the same BrowserChrome the set's
// ChromeSlot draws (same seeds, ink, CRT power-off), except that a screen that has powered off shows an ink-dark glass
// with one cream diagonal glint. Then govC reads as teal slats over a black half. Drop this file (and the windowSlot
// prop in plaza.tsx) once GovernmentPlaza's screen-off state does the same (sets-lane request, docs/scenes/S01.md);
// S12 should pass the same slot (`s01WindowSlot`) until then so the plaza looks the same at both ends of the film.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {rectPath} from '../../lib/sketch';
import {BrowserChrome} from '../shared/props';
import {crtPhase, CRT, GovEvents, GovId, PLAZA, SI} from '../shared/sets';

type R4 = [number, number, number, number];

/** The set's CRT overlay (GovernmentPlaza crtContent: tealDark glass, the lit screen squashing to a bright line, the line
 *  to a dot, the dot to nothing), with the INK-dark glass. Screen-local coords. */
const crtContent = (u: number, seed: string) => ({w, h}: {w: number; h: number}) => {
  const cx = w / 2;
  const cy = h / 2;
  const lh = Math.max(4, h * 0.065);
  let core = '';
  let halo = '';
  if (u < CRT.line) {
    const p = E.inQuad(u / CRT.line);
    const bh = lh + (h - lh) * (1 - p);
    core = rectPath(0, cy - bh / 2, w, bh);
    halo = rectPath(0, cy - (bh / 2 + lh * 0.9), w, bh + lh * 1.8);
  } else if (u < CRT.dot) {
    const p = (u - CRT.line) / (CRT.dot - CRT.line);
    const bw = Math.max(lh * 2, (w - 8) * (1 - E.outQuad(p)));
    core = rectPath(cx - bw / 2, cy - lh / 2, bw, lh);
    halo = rectPath(cx - bw / 2 - lh * 0.6, cy - lh * 1.4, bw + lh * 1.2, lh * 2.8);
  } else {
    const r = lh * 1.1 * (1 - (u - CRT.dot) / (1 - CRT.dot));
    if (r > 0.4) {
      core = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
      const R = r * 2;
      halo = `M${cx - R} ${cy}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
    }
  }
  return (
    <>
      <Fill d={rectPath(-1, -1, w + 5, h + 5)} color={palette.ink} offset={false} mode="none" seed={`${seed}/crtg`} />
      {halo ? <Fill d={halo} color={palette.cream} offset={false} mode="none" seed={`${seed}/crth`} /> : null}
      {core ? <Fill d={core} color={palette.white} offset={false} mode="none" seed={`${seed}/crtc`} /> : null}
    </>
  );
};

/** A dead screen: ink-dark glass + one cream diagonal glint (a flat parallelogram, upper left). */
const deadContent = (seed: string) => ({w, h}: {w: number; h: number}) => {
  const g = Math.max(5, w * 0.05);
  const x0 = w * 0.1;
  const y0 = h * 0.62;
  const x1 = w * 0.26;
  const y1 = h * 0.14;
  const glint = `M${x0} ${y0}L${x1} ${y1}L${x1 + g} ${y1}L${x0 + g} ${y0}Z`;
  return (
    <>
      <Fill d={rectPath(-1, -1, w + 5, h + 5)} color={palette.ink} offset={false} mode="none" seed={`${seed}/dg`} />
      <Fill d={glint} color={palette.cream} offset={false} mode="none" seed={`${seed}/dgl`} />
    </>
  );
};

/** One plaza window as the set draws it (WindowRig's ChromeSlot args), with the ink-dark dead screen. */
const S01Window: React.FC<{id: GovId; ev: GovEvents; seed: string}> = ({id, ev, seed}) => {
  const t = useTime();
  const [x, y, w, h] = PLAZA.gov[id].window as R4;
  const crt = ev.screenOffAt !== undefined || ev.screenLineAt !== undefined;
  const u = crt ? crtPhase(t, ev, 12) : 0;
  const sd = `${seed}/${id}/bw`;
  const content = crt && u > 0.001 ? (u < 0.999 ? crtContent(u, `${seed}/${id}/crt`) : deadContent(`${seed}/${id}/dead`)) : undefined;
  const width = SI.mid * (id === 'govD' ? 4.0 / SI.mid : 1);
  return <BrowserChrome x={x} y={y} w={w} h={h} chromeAt={ev.chromeAt} plainFirst={ev.chromeAt !== undefined} screenOnAt={ev.chromeAt} state="built" offAt={crt ? undefined : ev.offAt} mode="window" ink={width} glass={palette.sage} content={content} seed={sd} />;
};

/** GovernmentPlaza `windowSlot` for S01 (state 'frame0': govB starts as the held bright line) and S12. */
export const s01WindowSlot = (gov: Partial<Record<GovId, GovEvents>>, frame0 = true, seed = 'plaza') => (id: GovId) => {
  const e = gov[id] ?? {};
  const ev = frame0 && id === 'govB' && e.screenLineAt === undefined ? {...e, screenLineAt: -1e6} : e;
  return <S01Window id={id} ev={ev} seed={seed} />;
};

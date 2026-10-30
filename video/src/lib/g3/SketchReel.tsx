// SketchReel (shared G3 kit): the G3 animated sketchbook drawn entirely from one JSON file (public/vN/animatic.json),
// so a storyboard revision is a data edit. Generalised from v3's src/v3/SketchReel.tsx (which stays v3's own) with
// the tier-1 deltas of docs/G3_ANIMATIC.md §7: tiers A / B / C at their grey weights, planes as grey steps and the
// vp, the rig per set (key side -> every auto shadow, the one shadow value, pools), a set's shared drawing (one world
// space: pushes and cranes are camera moves, not cuts), the dress layer, the ambient kit (loop), the pose test's smear,
// draw-on AND un-draw with a pen tip, the pipe, the multi-key camera (start, peak, landing), transition device +
// carrier, 60 fps. Schema: src/lib/g3/types.ts; how-to: src/lib/g3/README.md. Board look only (STORYBOARD_STYLE §2).
// Lint before every render: python3 -I scripts/g3/board_lint.py public/vN/animatic.json
// Never bundle it with a module that calls setPen('clean') (lib/pen.ts): the clean pen erases the board's scribble.

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionFontStack, useCaptionFont} from '../font';
import {BOARD, weightOf} from './board';
import {PopCaptions, type CaptionLayer, CAPTION_TOP} from './Captions';
import {Element} from './elements';
import {camAt, camForDepth, camKeys, camTf} from './motion';
import type {Animatic, El, Move, SetDef, Shot, Transition} from './types';

const W = 1080;
const H = 1920;
/** the notes strip under the stage (STORYBOARD_STYLE §3) */
export const NOTES_TOP = 1680;

type Item = {el: El; key: string; clock: number; moves: {m: Move; time: number}[]; seed: string};

/** One shot at film time t: the set's shared drawing (film clock) under the panel's own (shot clock), one camera,
 *  red marks on top. */
export const ShotView: React.FC<{shot: Shot; t: number; sets?: Record<string, SetDef>}> = ({shot, t, sets}) => {
  const set = shot.set ? sets?.[shot.set] : undefined;
  const c = camAt(shot.camera, shot, t);
  const local = t - shot.s;
  const hidden = new Set(shot.hide ?? []);
  const setEls = set?.els && !shot.ownWorld ? set.els : [];
  // moves: the panel's (shot clock) by index into its els or by id (its els first, then the set's)
  const shotIdx = new Map<string, number>();
  shot.els.forEach((e, i) => e.id && shotIdx.set(e.id, i));
  const setIdx = new Map<string, number>();
  setEls.forEach((e, i) => e.id && setIdx.set(e.id, i));
  const forShot: {m: Move; time: number}[][] = shot.els.map(() => []);
  const forSet: {m: Move; time: number}[][] = setEls.map(() => []);
  for (const m of shot.moves ?? []) {
    if (typeof m.el === 'number') forShot[m.el]?.push({m, time: local});
    else if (shotIdx.has(m.el)) forShot[shotIdx.get(m.el)!].push({m, time: local});
    else if (setIdx.has(m.el)) forSet[setIdx.get(m.el)!].push({m, time: local});
  }
  const setMoves = set?.moves ?? [];
  for (const m of setMoves) {
    const i = typeof m.el === 'number' ? m.el : setIdx.get(m.el);
    if (i !== undefined) forSet[i]?.push({m, time: t});
  }
  const items: Item[] = [];
  setEls.forEach((el, j) => {
    if (el.id && hidden.has(el.id)) return;
    items.push({el, key: `s${j}`, clock: t, moves: forSet[j], seed: `${shot.set}-${el.id ?? j}`});
  });
  shot.els.forEach((el, i) => items.push({el, key: `e${i}`, clock: local, moves: forShot[i], seed: `${shot.id}-${i}`}));
  // the annotation layer (marks) draws above the scene; everything else keeps its order
  const order = items.map((_, i) => i).sort((a, b) => Number(items[a].el.t === 'mark') - Number(items[b].el.t === 'mark') || a - b);
  const anyScale = (shot.moves ?? []).some((m) => m.s !== undefined && m.s !== 1) || setMoves.some((m) => m.s !== undefined && m.s !== 1);
  const keys = camKeys(shot.camera, shot);
  const end = keys[keys.length - 1];
  const vp = shot.vp ?? set?.vp;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={BOARD.paper} />
      {anyScale ? <style>{'.nss *{vector-effect:non-scaling-stroke}'}</style> : null}
      {order.map((i) => {
        const it = items[i];
        const cam = shot.parallax && it.el.f !== undefined && it.el.f !== 1 ? camForDepth(end, c, it.el.f) : c;
        return (
          <g key={it.key} transform={camTf(cam)}>
            <Element el={it.el} clock={it.clock} T={t} moves={it.moves} wt={weightOf(it.el, shot.tiers)} rig={set?.rig} vp={vp} seed={it.seed} />
          </g>
        );
      })}
    </svg>
  );
};

/** the slug's camera words: every moving segment's word (keys), or read from the move */
export function camWords(shot: Shot): string[] {
  const keys = camKeys(shot.camera, shot);
  const out: string[] = [];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    const word = b.word ?? (keys.length === 2 ? shot.camera.word : undefined) ?? readMove(a, b);
    if (word && out.indexOf(word) < 0) out.push(word);
  }
  if (!out.length) out.push(shot.camera.word ?? 'HOLD');
  return out;
}
function readMove(a: {x: number; y: number; z: number}, b: {x: number; y: number; z: number}): string {
  const zr = b.z / a.z;
  if (zr > 1.03) return 'PUSH IN';
  if (zr < 0.97) return 'PULL OUT';
  const dx = (b.x - a.x) * b.z;
  const dy = (b.y - a.y) * b.z;
  if (Math.abs(dy) > 24 && Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'RISE' : 'TILT DOWN';
  if (Math.abs(dx) > 24) return dx > 0 ? 'PAN R' : 'PAN L';
  return 'HOLD';
}

const DEVICE_WORD: Record<string, string> = {
  continuous: 'continuous camera', 'push-through': 'push-through', 'pull-back': 'pull back out', 'thread-match': 'thread match',
  'match-cut': 'match cut', 'match-zoom': 'match zoom', morph: 'morph', 'object-carry': 'object carry', wipe: 'object wipe',
  whip: 'whip', carry: 'carry', 'card-flip': 'card flip', swipe: 'swipe', 'plain-cut': 'plain cut', 'cut-on-action': 'cut on action',
  dissolve: 'dissolve', dip: 'dip', flash: 'flash',
};
/** "in: C continuous camera (the pen tip)" */
export function joinText(tr: Transition | undefined, first: boolean): string {
  if (!tr) return first ? 'frame 0' : '';
  const dev = tr.device ? DEVICE_WORD[tr.device] ?? tr.device : tr.type;
  const head = tr.carrier ? `${tr.carrier} ${dev}` : dev;
  return `${first ? 'loop in' : 'in'}: ${head}${tr.what ? ` (${tr.what})` : tr.label ? ` (${tr.label})` : ''}`;
}

/** board notes strip, line 1: "S9 · <shot type, COZY / SCALE> · <moves>" (the move words added unless the note names them) */
function notesLine1(shot: Shot): string {
  const head = (shot.note ?? '').split('\n')[0];
  const mv = shot.placeholder ? '' : camWords(shot).filter((w) => head.toUpperCase().indexOf(w) < 0).join(' + ');
  return [shot.id, head, mv].filter(Boolean).join(' · ');
}

export type SketchReelProps = {
  data: Animatic;
  /** the voice (a public/ path): overrides data.audio */
  voice?: string;
  /** the caption layer (default: PopCaptions, v3's pop captions) */
  captions?: CaptionLayer;
  /** draw the notes strip (default true; false = the picture alone, e.g. for a density-key still) */
  notes?: boolean;
};

export const SketchReel: React.FC<SketchReelProps> = ({data, voice, captions, notes = true}) => {
  useCaptionFont();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shots = data.shots;
  const k = Math.max(0, shots.findIndex((s, i) => t >= s.s && t < (shots[i + 1]?.s ?? Infinity)));
  const shot = shots[k];
  const prev = shots[k - 1];
  const since = t - shot.s;
  const tr = shot.transition.type;
  const dur = shot.transition.dur ?? (tr === 'dissolve' ? 0.2 : tr === 'push-through' ? 0.3 : tr === 'wipe' ? 0.25 : tr === 'dip' ? 0.3 : tr === 'flash' ? 0.12 : 0);
  const inTr = !!prev && dur > 0 && since < dur;
  const u = inTr ? since / dur : 1;
  const Cap = captions ?? PopCaptions;
  const trText = joinText(k === 0 ? data.loopJoin : shot.transition, k === 0);
  const audio = voice ?? data.audio;

  return (
    <AbsoluteFill style={{background: BOARD.paper, fontFamily: captionFontStack}}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {data.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.src)} volume={s.gain ?? 0.6} />
        </Sequence>
      ))}

      {inTr && tr === 'push-through' ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.4 * u})`, opacity: 1 - u}}><ShotView shot={prev} t={t} sets={data.sets} /></div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: inTr && tr !== 'wipe' && tr !== 'dip' && tr !== 'flash' ? u : 1,
        clipPath: inTr && tr === 'wipe' ? `inset(0 ${100 - u * 100}% 0 0)` : undefined}}>
        <ShotView shot={shot} t={t} sets={data.sets} />
      </div>
      {inTr && (tr === 'dissolve' || tr === 'wipe') ? (
        <div style={{position: 'absolute', inset: 0, opacity: tr === 'dissolve' ? 1 - u : 1, clipPath: tr === 'wipe' ? `inset(0 0 0 ${u * 100}%)` : undefined}}>
          <ShotView shot={prev} t={t} sets={data.sets} />
        </div>
      ) : null}
      {inTr && (tr === 'dip' || tr === 'flash') && u < 0.5 ? (
        <div style={{position: 'absolute', inset: 0}}><ShotView shot={prev} t={t} sets={data.sets} /></div>
      ) : null}
      {inTr && (tr === 'dip' || tr === 'flash') ? (
        <div style={{position: 'absolute', inset: 0, background: tr === 'dip' ? BOARD.ink : '#ffffff', opacity: 1 - Math.abs(2 * u - 1)}} />
      ) : null}

      {data.frame0 && t < (data.frame0Until ?? 0) ? (
        <div style={{position: 'absolute', top: CAPTION_TOP - 160, left: 60, right: 60, textAlign: 'center', fontSize: 86, fontWeight: 700,
          lineHeight: 1.05, color: BOARD.ink}}>
          {data.frame0}
          {data.frame0Credit ? <div style={{fontSize: 36, fontWeight: 400, lineHeight: 1.2, marginTop: 4, color: BOARD.mid}}>{data.frame0Credit}</div> : null}
        </div>
      ) : null}
      {shot.credit ? (
        <div style={{position: 'absolute', top: CAPTION_TOP + 236, left: 60, right: 60, textAlign: 'center', fontSize: 36, lineHeight: 1.2,
          color: BOARD.mid}}>{shot.credit}</div>
      ) : null}
      <Cap t={t} fps={fps} words={data.words} />

      {notes ? (
        // the notes strip (y 1680-1920, STORYBOARD_STYLE §3): big words the director reads on a 25 % sheet. Line 1 (48 px ink):
        // shot id, shot type, COZY / SCALE, the camera move(s); line 2 (38 px ink): the one idea and the join in with its
        // carrier. No label, no timecode.
        <div style={{position: 'absolute', top: NOTES_TOP, left: 0, right: 0, bottom: 0, background: BOARD.paper, borderTop: `2px solid ${BOARD.light}`}}>
          <div style={{margin: '14px 52px 0', fontSize: 48, lineHeight: 1.1, fontWeight: 700, color: BOARD.ink, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {notesLine1(shot)}
          </div>
          <div style={{margin: '6px 52px 0', fontSize: 38, lineHeight: 1.15, color: BOARD.ink, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {[(shot.note ?? '').split('\n')[1], trText].filter(Boolean).join(' · ')}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

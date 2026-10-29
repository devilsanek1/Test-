// lib/paint: PAINTED PIECES (owner, 2026-10-29: "I really like the “painted” pieces like the sky and the clouds ... or
// some foreground buildings and trees / greenery are uniquely painted / Is it possible to modify our engine to match the
// [style]"; "modifying our engine to be able to do that"; playbook PAINTED PIECES, DIRECTION rule 4). OPT-IN: nothing
// paints unless a <PaintProvider on> wraps the film, and every painted piece falls back to its own flat shapes, so the
// film works with the paint off.
//
// The engine's paint pass, in two halves (the full API, the cost and the method: docs/studies/2026-10-28_city_posters/
// paint_test/NOTES.md):
//   1. BAKE (offline, once per piece; deterministic): a piece's flat shapes are rendered ALONE on a transparent frame
//      (<PaintBakeFrame>, in the layer's own px), then scripts/look/paint/paint.py paints them stroke by stroke from a
//      seed and a style ('sky' | 'cloud' | 'foliage' | 'surface'; a cloud can also be made from lobes alone) and writes
//      one RGBA PNG per piece into public/paint/<film>/, with its box in <film>/manifest.json.
//   2. PLACE (at render): <PaintedLayer piece> draws that PNG in the piece's OWN slot, where its flat shapes were: inside
//      its plane's group, so it rides that plane's float exactly like the shapes it replaces (locked to its layer:
//      nothing swims), under whatever the scene draws in front of it (her, the people, Pip, the captions stay crisp and
//      are never painted). Before `from` (e.g. its flood time) and with the paint off it draws its children (the flat).
// Motion (later, once a still is approved): a piece is its own layer, so a cloud can drift or churn and a crown sway as
// a transform or a slow displacement of its own image (NOTES.md "motion"); nothing here animates yet.
import React, {createContext, useContext, useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useTime} from '../time';

/** Where a painted PNG sits, in its layer's own px (world px at rest): x, y, width, height. */
export type PaintBox = readonly [number, number, number, number];
/** The painter's styles (scripts/look/paint/paint.py STYLES). */
export type PaintStyle = 'sky' | 'cloud' | 'foliage' | 'surface';

/** One baked piece (a row of public/paint/<film>/manifest.json, written by the bake). */
export type PaintPiece = {
  /** '<film>/<piece>', e.g. 'v2s1/tree'. */
  id: string;
  /** Its PNG under public/, e.g. 'paint/v2s1/tree.png'. */
  src: string;
  box: PaintBox;
  style: PaintStyle;
  /** The seed it was painted with (a new seed = a new painting of the same shapes). */
  seed: number;
  /** A piece that is one plane of a group (paint.py's 'cloudscape' writes one PNG per cloud plane): the group's name
   *  and the plane's depth (0 near ... 1 far); a group's pieces are listed far to near (the drawing order). */
  group?: string;
  depth?: number;
};

/** A film's baked pieces by name (its manifest.json: {pieces: PaintPiece[]}). */
export function paintSet(manifest: {pieces: PaintPiece[]}): Record<string, PaintPiece> {
  const out: Record<string, PaintPiece> = {};
  for (const p of manifest.pieces) out[p.id.split('/').pop() as string] = p;
  return out;
}

type PaintState = {on: boolean; only?: readonly string[]; set?: Readonly<Record<string, PaintPiece>>};
const PaintCtx = createContext<PaintState>({on: false});

/** The film's paint switch: `on` (default false: the engine never paints unasked), `only` a subset of piece names or
 *  ids (A/Bs), `set` the baked pieces a scene names (paintSet(manifest): two bakes of one scene, e.g. a calmer and a
 *  bolder dose, are two sets; the scene code stays the same). */
export const PaintProvider: React.FC<{on?: boolean; only?: readonly string[]; set?: Readonly<Record<string, PaintPiece>>; children?: React.ReactNode}> = ({on = false, only, set, children}) => (
  <PaintCtx.Provider value={{on, only, set}}>{children}</PaintCtx.Provider>
);

/** A piece given as itself or by its name in the provider's set. */
export function usePiece(piece: PaintPiece | string | undefined): PaintPiece | undefined {
  const s = useContext(PaintCtx);
  return typeof piece === 'string' ? s.set?.[piece] : piece;
}

/** Is this piece painted here (the switch, its subset)? */
export function usePaintOn(pieceIn: PaintPiece | string | undefined): boolean {
  const s = useContext(PaintCtx);
  const piece = usePiece(pieceIn);
  if (!s.on || !piece) return false;
  if (!s.only) return true;
  const name = piece.id.split('/').pop() as string;
  return s.only.includes(piece.id) || s.only.includes(name);
}

/** The PNG as an SVG image that holds the frame until it has loaded (an SVG <image> loads asynchronously; Remotion
 *  must not capture the frame before it is drawn). */
const PaintImage: React.FC<{piece: PaintPiece; opacity?: number}> = ({piece, opacity}) => {
  const [handle] = useState(() => delayRender(`paint ${piece.id}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const [x, y, w, h] = piece.box;
  return (
    <image
      href={staticFile(piece.src)}
      x={x}
      y={y}
      width={w}
      height={h}
      preserveAspectRatio="none"
      opacity={opacity}
      onLoad={() => continueRender(handle)}
      onError={() => continueRender(handle)}
    />
  );
};

export type PaintedLayerProps = {
  /** The baked piece (paintSet(manifest).name) or its name in the provider's set; undefined or not in the set = not
   *  baked: the flat children. */
  piece?: PaintPiece | string;
  /** Scene seconds from which the paint shows (before it, the flat children: e.g. the piece's flood time, so the paint
   *  lands with the colour, as one shape). Default: always. */
  from?: number;
  opacity?: number;
  /** The piece's flat shapes: drawn when the paint is off or before `from`. */
  children?: React.ReactNode;
};

/** A painted piece in its own slot (its plane's group, so it rides that plane's float), or its flat shapes. */
export const PaintedLayer: React.FC<PaintedLayerProps> = ({piece: pieceIn, from, opacity, children}) => {
  const t = useTime();
  const piece = usePiece(pieceIn);
  const on = usePaintOn(piece);
  if (!on || !piece || (from !== undefined && t < from)) return <>{children}</>;
  return <PaintImage piece={piece} opacity={opacity} />;
};

/** True where the paint replaces a piece's flat shapes: its light layers (form shades, crescents) that the bake
 *  painted in go quiet so they are not drawn twice. */
export function usePainted(pieceIn: PaintPiece | string | undefined, from?: number): boolean {
  const t = useTime();
  const piece = usePiece(pieceIn);
  const on = usePaintOn(piece);
  return on && !!piece && (from === undefined || t >= from);
}

/** A painted GROUP in its slot: every piece of the set whose `group` is this, in the manifest's order (far to near: a
 *  layered cloudscape's planes, each its own image, so each can later drift at its own depth), or the children when the
 *  set has no such group (the paint off, or a set that paints these things one piece at a time). */
export const PaintedGroup: React.FC<{group: string; children?: React.ReactNode}> = ({group, children}) => {
  const s = useContext(PaintCtx);
  const pieces = s.on && s.set ? Object.values(s.set).filter((p) => p.group === group) : [];
  const shown = pieces.filter((p) => !s.only || s.only.includes(p.id) || s.only.includes(group) || s.only.includes(p.id.split('/').pop() as string));
  if (!shown.length) return <>{children}</>;
  return (
    <>
      {shown.map((p) => (
        <PaintImage key={p.id} piece={p} />
      ))}
    </>
  );
};


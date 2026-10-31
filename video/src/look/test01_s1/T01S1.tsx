// test01_s1: T01S1, THE HERO FRAME of process test 01 (Amsterdam; docs/tests/process_test_01_amsterdam/: CORE.md the
// moment, VISION.md the world, IDEAS.md 1 "The paper half", CARD.md the frame card). From a small boat low on her canal
// at blue hour we face her humped brick bridge; its arch and the arch's "reflection" close into one ring, and the lower
// half is the street's PAPER TWIN (ledgers spine-out for the arch stones, written sheets in courses, paper houses
// hanging down the water); under her the pages wake and their light climbs to the phone she holds out over the rail.
// Built with the look scenes' tools (src/look/v8_s1's pattern, never edited): the set's design (bake/set_t01.py), the
// painter's pieces (bake/paint_t01.py: MyPaint marks, the recipe book's sky), ONE story light solved into per-plane maps
// (bake/light_t01.py), the paper, her (the people in use) and the stream drawn live, the caption by captions2 (R4, the
// landing word lit in the honey light).
//   look 'flat'  the set's flat design (the pieces unpainted, unlit): the bake's check
//   look 't01'   the delivered still (1.0 s)
//   parts [...]  the bake's input: only these movers on the `slab` colour (no captions)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Captions2, type CaptionFile} from '../../lib/captions2';
import {T01CtxProvider, type LookName, type MoverName} from './context';
import {T01Scene} from './T01Scene';
import {PIECES_T01} from './pieces_t01';
import {FLAT_T01} from './flat_t01';
import {MAPS_T01} from './maps_t01';
import captionsJson from './captions_t01.json';

export const T01_S1_FPS = 60;
export const T01_S1_FRAMES = 366;

export type T01S1Props = {
  look?: LookName;
  captions?: boolean;
  /** The bake's parts render: only these movers, on the `slab` colour, no captions. */
  parts?: MoverName[];
  slab?: string;
};

const CAPTIONS = captionsJson as unknown as CaptionFile;

export const T01S1: React.FC<T01S1Props> = ({look = 't01', captions = true, parts, slab}) => {
  const pieces = look === 'flat' ? FLAT_T01 : PIECES_T01;
  return (
    <T01CtxProvider value={{look, parts: parts ?? null, pieces, maps: MAPS_T01}}>
      <AbsoluteFill style={{background: parts ? slab ?? '#000000' : '#2E3160'}}>
        <T01Scene slab={parts ? slab ?? '#000000' : undefined} />
        {!parts && captions ? <Captions2 data={CAPTIONS} /> : null}
      </AbsoluteFill>
    </T01CtxProvider>
  );
};

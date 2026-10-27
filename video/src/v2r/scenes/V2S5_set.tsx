// V2S5_set.tsx (lane L4): the S5 set on the crane: every plane in its PullLayer on ONE progress p (the rig,
// V2S5_rig.ts). Forked from kit/dc/CraneSet.tsx (same planes, ease, wipe and swap) so the shot's own slot files can be
// layered between the kit's planes. ONE OWNER PER SLOT FILE (builders never edit this file; a missing slot is a request):
//   V2S5_start     S5StartBack (behind all) / S5StartFore (over all): the start-only canopy + near foreground (screen, p)
//   V2S5_far       S5Far (far plane) + S5FarLife (sky life, screen)
//   V2S5_river     S5River          V2S5_mid  S5Mid          V2S5_nearmid  S5NearMid (start coords)
//   V2S5_deck      S5Deck / S5DeckOver (deck plane), S5TreeLeft / S5RightFrame (their boxes), S5WipeProp, S5NearEnd
//   V2S5_figs      FiguresStart (start coords until the swap) / FiguresEnd (deck plane from the swap)
//   V2S5_text      NewsBox (start coords, rides the deck) / Plaque (end coords, pops on "Pentagon")
// Draw order: start back -> far -> sky life -> river -> mid -> near-mid -> deck -> figures -> deck over (bench) -> news
// box -> plaque -> left frame -> right frame -> wipe -> end near masses -> start foreground.
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {PullLayer} from '../../v3/film/kit/Pullback';
import {craneP, planeMat, startMat, boxMat, wipeMat, swapAt, SWAP_P, T5, PLANES} from './V2S5_rig';
import {S5StartBack, S5StartFore} from './V2S5_start';
import {S5Far, S5FarLife} from './V2S5_far';
import {S5River} from './V2S5_river';
import {S5Mid} from './V2S5_mid';
import {S5NearMid} from './V2S5_nearmid';
import {S5Deck, S5DeckOver, S5TreeLeft, S5RightFrame, S5WipeProp, S5NearEnd} from './V2S5_deck';
import {FiguresStart, FiguresEnd} from './V2S5_figs';
import {NewsBox, Plaque} from './V2S5_text';

/** The wipe lamppost is drawn while p is inside this range (it enters / leaves outside the frame). */
export const WIPE_P: [number, number] = [0.02, 0.75];

/** The set's layer groups (for `only`): start, far, sky, river, mid, nearmid, deck, figs, text, frames, wipe, near. */
export type S5Layer = 'start' | 'far' | 'sky' | 'river' | 'mid' | 'nearmid' | 'deck' | 'figs' | 'text' | 'frames' | 'wipe' | 'near';

export const S5Set: React.FC<{p?: number; only?: S5Layer[]}> = ({p: pIn, only}) => {
  const t = useTime();
  const p = pIn ?? craneP(t);
  const swapped = pIn !== undefined ? pIn >= SWAP_P : t >= swapAt;
  const deck = planeMat(PLANES.deck, p);
  const deckStart = startMat(PLANES.deck, p);
  const on = (l: S5Layer) => !only || only.includes(l);
  return (
    <>
      {on('start') ? <S5StartBack p={p} /> : null}
      {on('far') ? (
        <PullLayer m={planeMat(PLANES.far, p)}>
          <S5Far />
        </PullLayer>
      ) : null}
      {on('sky') ? <S5FarLife p={p} /> : null}
      {on('river') ? (
        <PullLayer m={planeMat(PLANES.river, p)}>
          <S5River />
        </PullLayer>
      ) : null}
      {on('mid') ? (
        <PullLayer m={planeMat(PLANES.mid, p)}>
          <S5Mid />
        </PullLayer>
      ) : null}
      {on('nearmid') ? (
        <PullLayer m={startMat(PLANES.nearmid, p)}>
          <S5NearMid />
        </PullLayer>
      ) : null}
      <PullLayer m={deck}>
        {on('deck') ? <S5Deck /> : null}
        {swapped && on('figs') ? <FiguresEnd /> : null}
      </PullLayer>
      {swapped || !on('figs') ? null : (
        <PullLayer m={deckStart}>
          <FiguresStart />
        </PullLayer>
      )}
      {on('deck') ? (
        <PullLayer m={deck}>
          <S5DeckOver />
        </PullLayer>
      ) : null}
      {on('text') ? (
        <>
          <PullLayer m={deckStart}>
            <NewsBox />
          </PullLayer>
          <PullLayer m={deck}>
            <Plaque at={T5.pentagon} />
          </PullLayer>
        </>
      ) : null}
      {on('frames') ? (
        <>
          <PullLayer m={boxMat(PLANES.tree, p)}>
            <S5TreeLeft />
          </PullLayer>
          <PullLayer m={boxMat(PLANES.right, p)}>
            <S5RightFrame />
          </PullLayer>
        </>
      ) : null}
      {on('wipe') && p > WIPE_P[0] && p < WIPE_P[1] ? (
        <XG m={wipeMat(p)}>
          <S5WipeProp />
        </XG>
      ) : null}
      {on('near') ? <S5NearEnd p={p} /> : null}
      {on('start') ? <S5StartFore p={p} /> : null}
    </>
  );
};

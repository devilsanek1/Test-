// V2S5_set.tsx (lane L4): the S5 set on the crane: every plane in its PullLayer on ONE progress p (the rig,
// V2S5_rig.ts). Forked from kit/dc/CraneSet.tsx (same planes, ease, wipe and swap) so the shot's own slot files can be
// layered between the kit's planes. ONE OWNER PER SLOT FILE (builders never edit this file; a missing slot is a request):
//   V2S5_start     S5StartBack (behind all) / S5StartFore (over all): the start-only canopy + near foreground (screen, p)
//   V2S5_far       S5Far (far plane) + S5FarLife (sky life, screen)
//   V2S5_river     S5River          V2S5_mid  S5Mid          V2S5_nearmid  S5NearMid (start coords)
//   V2S5_deck      S5Deck / S5DeckOver (deck plane), S5TreeLeft / S5RightFrame (their boxes), S5WipeProp
//   V2S5_particles S5Particles (the 'near' slot: petals and motes, each field in its plane's map); S5NearMidParticles
//                  (the start's petals, drawn in the near-mid layer: they sink with the slope's crowns)
//   V2S5_figs      FiguresStart (start coords until the swap) / FiguresEnd (deck plane from the swap)
//   V2S5_text      NewsBox (start coords, rides the deck) / Plaque (end coords, pops on "Pentagon")
// Tiers (conform_L4 §5): every plane is C (environment: no outline, calm) but the figures (B, their kits' default) and
// the A pieces, which set their own: the news box (V2S5_text, 20.90-21.75), the Pentagon (V2S5_mid, from 22.43), the plaque.
// Draw order: start back -> far -> sky life -> river -> mid -> near-mid -> deck -> figures -> deck over (bench) -> news
// box -> plaque -> left frame -> right frame -> wipe -> end near masses -> start foreground.
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {PullLayer} from '../../lib/pullback';
import {Tier} from '../../lib/tier';
import {craneP, planeMat, startMat, boxMat, wipeMat, deckMat, deckStartMat, swapAt, SWAP_P, T5, PLANES} from './V2S5_rig';
import {S5StartBack, S5StartFore} from './V2S5_start';
import {S5Far, S5FarLife} from './V2S5_far';
import {S5River} from './V2S5_river';
import {S5Mid} from './V2S5_mid';
import {S5NearMid} from './V2S5_nearmid';
import {S5Deck, S5DeckOver, S5TreeLeft, S5RightFrame, S5WipeProp} from './V2S5_deck';
import {S5Particles, S5NearMidParticles} from './V2S5_particles';
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
  // the deck on its own pace (V2S5_rig deckP: calmer at the lamppost's edges, the same start, end and beats)
  const deck = deckMat(p);
  const deckStart = deckStartMat(p);
  const on = (l: S5Layer) => !only || only.includes(l);
  return (
    <>
      {on('start') ? <S5StartBack p={p} /> : null}
      {on('far') ? (
        <PullLayer m={planeMat(PLANES.far, p)}>
          <Tier tier="environment">
            <S5Far />
          </Tier>
        </PullLayer>
      ) : null}
      {on('sky') ? (
        <Tier tier="environment">
          <S5FarLife p={p} />
        </Tier>
      ) : null}
      {on('river') ? (
        <PullLayer m={planeMat(PLANES.river, p)}>
          <Tier tier="environment">
            <S5River />
          </Tier>
        </PullLayer>
      ) : null}
      {on('mid') ? (
        <PullLayer m={planeMat(PLANES.mid, p)}>
          <S5Mid />
        </PullLayer>
      ) : null}
      {on('nearmid') || on('near') ? (
        <PullLayer m={startMat(PLANES.nearmid, p)}>
          {on('nearmid') ? <S5NearMid /> : null}
          {/* the start's petals belong to the slope's crowns: they sink with them behind the balustrade */}
          {on('near') ? (
            <Tier tier="environment">
              <S5NearMidParticles />
            </Tier>
          ) : null}
        </PullLayer>
      ) : null}
      <PullLayer m={deck}>
        {on('deck') ? (
          <Tier tier="environment">
            <S5Deck />
          </Tier>
        ) : null}
        {swapped && on('figs') ? <FiguresEnd /> : null}
      </PullLayer>
      {swapped || !on('figs') ? null : (
        <PullLayer m={deckStart}>
          <FiguresStart />
        </PullLayer>
      )}
      {on('deck') ? (
        <PullLayer m={deck}>
          <Tier tier="environment">
            <S5DeckOver />
          </Tier>
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
          <Tier tier="environment">
            <PullLayer m={boxMat(PLANES.tree, p)}>
              <S5TreeLeft />
            </PullLayer>
            <PullLayer m={boxMat(PLANES.right, p)}>
              <S5RightFrame />
            </PullLayer>
          </Tier>
        </>
      ) : null}
      {on('wipe') && p > WIPE_P[0] && p < WIPE_P[1] ? (
        <Tier tier="environment">
          <XG m={wipeMat(p)}>
            <S5WipeProp />
          </XG>
        </Tier>
      ) : null}
      {on('near') ? (
        <Tier tier="environment">
          <S5Particles p={p} />
        </Tier>
      ) : null}
      {on('start') ? <S5StartFore p={p} /> : null}
    </>
  );
};

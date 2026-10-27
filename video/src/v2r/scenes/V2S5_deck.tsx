// V2S5_deck.tsx (lane L4): the S5 DECK (the viewpoint terrace, END coords, kit/dc/terrace.tsx's camera) and the end
// frame's near masses. S5Deck is drawn in the deck plane under the figures; S5DeckOver in the deck plane over them;
// S5NearEnd in screen space over everything but the start foreground (it gets the crane progress p).
import React from 'react';
import {Terrace, Pigeons} from '../kit/dc/terrace';

export const S5Deck: React.FC = () => (
  <>
    <Terrace />
    <Pigeons />
  </>
);
export const S5DeckOver: React.FC = () => null;
export const S5NearEnd: React.FC<{p: number}> = () => null;

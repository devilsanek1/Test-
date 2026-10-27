// V2S7 "Google says" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L5 owns src/v2r/scenes/V2S7.tsx and
// helpers src/v2r/scenes/V2S7_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 28.06-32.93 s; TREATMENT.md section 5 row S7.
import React from 'react';
import {Placeholder} from '../film/Placeholder';
import type {WiperComponent} from '../../lib/Film';
import {CM} from '../palette';

const V2S7: React.FC = () => (
  <Placeholder
    id="V2S7"
    title="Google says"
    lane="L5"
    dur={4.87}
    sun={[260, 620, 45]}
    words={"But Google says it follows its AI principles and bans retaliation \"of any kind\"."}
    picture={"Google's canal wing at human size from its forecourt: the GOOGLE SAYS A-board at B, fountains, café tables, string lights on 'principles', Pip at the board bollard; exports the narrowboat Wiper"}
  />
);
export default V2S7;

/** PLACEHOLDER foreground wiper for the wipe into V2S8 (TREATMENT section 5: the narrowboat, 32.70-33.16, travelling
 *  west = screen left). Screen px, centred on the boundary x, opaque over x +- 150 for the full height. L5 replaces
 *  it with the real bow (static `half` = its real half-width, `captionRegions` = its tone over the caption band). */
export const Wiper: WiperComponent = ({x}) => (
  <g>
    <rect x={x - 150} y={0} width={300} height={1920} fill={CM.sage} />
    <rect x={x - 150} y={1260} width={300} height={36} fill={CM.anchor} />
    <rect x={x - 150} y={0} width={300} height={1920} fill="none" stroke={CM.ink} strokeWidth={4.8} />
  </g>
);
Wiper.half = 160;
Wiper.captionRegions = ({x}) => [{tone: 'dark', rect: [x - 150, -200, x + 150, 2200]}];

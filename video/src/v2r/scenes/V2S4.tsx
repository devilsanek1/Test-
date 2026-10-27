// V2S4 "The walk home" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L3 owns src/v2r/scenes/V2S4.tsx and
// helpers src/v2r/scenes/V2S4_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 14.86-20.55 s; TREATMENT.md section 5 row S4.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S4: React.FC = () => (
  <Placeholder
    id="V2S4"
    title="The walk home"
    lane="L3"
    dur={5.69}
    sun={[250, 650, 65]}
    words={"She worked on Google's AI and told the BBC she objected to where its military work was heading."}
    picture={"The narrowboat glides with us; her walking LEFT in profile on her towpath; the name tag; she stops by the fingerpost (DEC 2025 / APR 2026 plates pointing west); push toward SUN1"}
  />
);
export default V2S4;

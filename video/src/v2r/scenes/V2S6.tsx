// V2S6 "The gate" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L5 owns src/v2r/scenes/V2S6.tsx and
// helpers src/v2r/scenes/V2S6_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 24.00-28.06 s; TREATMENT.md section 5 row S6.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S6: React.FC = () => (
  <Placeholder
    id="V2S6"
    title="The gate"
    lane="L5"
    dur={4.06}
    sun={[260, 620, 45]}
    words={"\"any lawful government purpose\". Google can't veto how it's used."}
    picture={"The Pentagon's perimeter footpath looking south: the deal board (the full clause, the purpose line on 'any', the F12 line on 'veto'), tulips, the fence, Pip on the tall corner post; a lateral truck left"}
  />
);
export default V2S6;

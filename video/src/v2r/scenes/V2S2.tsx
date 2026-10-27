// V2S2 "The wall" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L2 owns src/v2r/scenes/V2S2.tsx and
// helpers src/v2r/scenes/V2S2_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 6.10-12.98 s; TREATMENT.md section 5 row S2.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S2: React.FC = () => (
  <Placeholder
    id="V2S2"
    title="The wall"
    lane="L2"
    dur={6.88}
    sun={[200, 690, 80]}
    words={"You'd think that's one odd contract. But Google's staff told the BBC they're scared to speak out, because of their contracts."}
    picture={"Google's canal wing as a receding wall from the south towpath, her dark window ringed, five staff windows around it (blinds drop on 'scared'), the TOLD THE BBC A-board, the staffer and the reporter on the bench, Pip on the railing post"}
  />
);
export default V2S2;

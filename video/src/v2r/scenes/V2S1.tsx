// V2S1 "Walking out" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L1 owns src/v2r/scenes/V2S1.tsx and
// helpers src/v2r/scenes/V2S1_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 0.00-6.10 s; TREATMENT.md section 5 row S1.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S1: React.FC = () => (
  <Placeholder
    id="V2S1"
    title="Walking out"
    lane="L1"
    dur={6.1}
    sun={[200, 690, 80]}
    bare
    words={"She quit Google. And she says her contract bans her from criticizing it... for life."}
    picture={"Google's canal wing across the water (door, canopy 'Google', W lamp-lit), the far towpath with her walking LEFT and the ghost row popping in, the steps' seated public, Pip on the waterline bollard; frame 0 = bare ink on paper, colour floods from SUN0"}
  />
);
export default V2S1;

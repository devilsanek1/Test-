// V2S8 "Her words" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L6 owns src/v2r/scenes/V2S8.tsx and
// helpers src/v2r/scenes/V2S8_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 32.93-39.08 s; TREATMENT.md section 5 row S8.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S8: React.FC = () => (
  <Placeholder
    id="V2S8"
    title="Her words"
    lane="L6"
    dur={6.15}
    sun={[420, 640, 40]}
    words={"She says she can't criticize Google. But in her words, \"talking about facts is not criticising\"."}
    picture={"Her towpath looking west: her walking home, three ghosts ahead, her teal door and W lighting; the café boat's board wiped and her quote pen-drawn; lamps run west on 'facts'; un-builds into S1's frame 0"}
  />
);
export default V2S8;

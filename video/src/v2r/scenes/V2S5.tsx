// V2S5 "The far side" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L4 owns src/v2r/scenes/V2S5.tsx and
// helpers src/v2r/scenes/V2S5_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 20.55-24.00 s; TREATMENT.md section 5 row S5.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S5: React.FC = () => (
  <Placeholder
    id="V2S5"
    title="The far side"
    lane="L4"
    dur={3.45}
    sun={[250, 650, 65]}
    words={"In April, that meant a deal letting the Pentagon use its AI for"}
    picture={"Arlington heights, April morning: the bench under a blossoming canopy (the stranger, Pip, the news box), the calendar sun; the ONE crane back and up to the Pentagon, the Potomac and the city"}
  />
);
export default V2S5;

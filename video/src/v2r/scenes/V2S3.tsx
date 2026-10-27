// V2S3 "Her window" — PLACEHOLDER (engine K8). Lane: replace this file. Lane L3 owns src/v2r/scenes/V2S3.tsx and
// helpers src/v2r/scenes/V2S3_*.tsx; the scene contract is docs/v2/BUILD.md (default export, useTime() = shot-local
// seconds, optional `captionTone` / `Wiper` exports). Film time 12.98-14.86 s; TREATMENT.md section 5 row S3.
import React from 'react';
import {Placeholder} from '../film/Placeholder';

const V2S3: React.FC = () => (
  <Placeholder
    id="V2S3"
    title="Her window"
    lane="L3"
    dur={1.88}
    sun={[120, 650, 50]}
    words={"So why is she talking?"}
    picture={"A flash-forward in sunset light: her terrace across the water, her French window at W2 (teal frame, blind UP, lamp on), her silhouette pacing with a phone; the moored narrowboat below us"}
  />
);
export default V2S3;

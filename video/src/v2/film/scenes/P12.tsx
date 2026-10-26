// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// P12 board placeholder: plays the locked G3 board panel "P12" inside the Film engine (scene-local time t = board
// time - 33.08). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const P12: React.FC = () => <BoardPanel id="P12" />;
export default P12;

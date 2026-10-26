// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// P5 board placeholder: plays the locked G3 board panel "P5" inside the Film engine (scene-local time t = board
// time - 15.0). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const P5: React.FC = () => <BoardPanel id="P5" />;
export default P5;

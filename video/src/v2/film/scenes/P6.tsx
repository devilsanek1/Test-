// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// P6 board placeholder: plays the locked G3 board panel "P6" inside the Film engine (scene-local time t = board
// time - 16.6). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const P6: React.FC = () => <BoardPanel id="P6" />;
export default P6;

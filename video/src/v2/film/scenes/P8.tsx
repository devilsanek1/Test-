// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// P8 board placeholder: plays the locked G3 board panel "P8" inside the Film engine (scene-local time t = board
// time - 21.32). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const P8: React.FC = () => <BoardPanel id="P8" />;
export default P8;

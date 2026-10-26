// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// P9 board placeholder: plays the locked G3 board panel "P9" inside the Film engine (scene-local time t = board
// time - 23.8). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const P9: React.FC = () => <BoardPanel id="P9" />;
export default P9;

// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// S4 board placeholder: plays the locked G3 board panel "S4" inside the Film engine (scene-local time t = board
// time - 5.8). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const S4: React.FC = () => <BoardPanel id="S4" />;
export default S4;

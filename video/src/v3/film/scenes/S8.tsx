// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// S8 board placeholder: plays the locked G3 board panel "S8" inside the Film engine (scene-local time t = board
// time - 18.28). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const S8: React.FC = () => <BoardPanel id="S8" />;
export default S8;

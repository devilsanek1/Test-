// Lane: replace this file with the real set (docs/G5_BLOCKING.md).
// O1 board placeholder: plays the locked G3 board panel "O1" inside the Film engine (scene-local time t = board
// time - 0). Contract: default-export a React.FC with no props; optional exports `Wiper` (foreground-wipe element)
// and `captionTone` (ToneKey[], overrides scenes.json for this panel).
import React from 'react';
import {BoardPanel} from '../BoardPanel';

const O1: React.FC = () => <BoardPanel id="O1" />;
export default O1;

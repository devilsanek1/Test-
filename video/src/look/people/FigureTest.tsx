// A quick test frame of the refined figure (lib/figure): the four poses side by side on a calm field.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Figure} from '../../lib/figure';

export const FigureTest: React.FC = () => (
  <AbsoluteFill style={{background: '#EADFD6'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <Figure x={260} y={980} h={640} pose={{view: 'rear34', wind: {t: 0.2}}} />
      <Figure x={720} y={980} h={640} pose={{view: 'profile', step: 0, wind: {t: 0.2}}} />
      <Figure x={1180} y={980} h={640} pose={{view: 'back', step: 0.5, wind: {t: 0.2}}} />
      <Figure x={1640} y={980} h={640} pose={{view: 'profile', carry: 'box', step: 0, wind: {t: 0.2}}} />
    </svg>
  </AbsoluteFill>
);

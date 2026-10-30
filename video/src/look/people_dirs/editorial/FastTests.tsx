// Editorial people: test frames for quick iteration (the same components as the sheet; rendered by the Remotion entry
// or, while drawing, straight to SVG markup).
import React from 'react';
import {EdTest, TEST_W, TEST_H, EdHeads, HEADS_W, HEADS_H} from './Test';

export const TESTS: Record<string, {C: React.FC<any>; props?: Record<string, unknown>; w: number; h: number}> = {
  figures: {C: EdTest, props: {finish: 'gradient', h: 640}, w: TEST_W, h: TEST_H},
  heads: {C: EdHeads, props: {}, w: HEADS_W, h: HEADS_H},
};

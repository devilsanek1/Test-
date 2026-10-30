// Editorial people: test frames for quick iteration (the same components as the sheet; rendered by the Remotion entry
// or, while drawing, straight to SVG markup).
import React from 'react';
import {EdTest, TEST_W, TEST_H, EdHeads, HEADS_W, HEADS_H, EdZoom} from './Test';
import {EdSheet, SHEET_W, SHEET_H} from './Sheet';

export const TESTS: Record<string, {C: React.FC<any>; props?: Record<string, unknown>; w: number; h: number}> = {
  sheet: {C: EdSheet, props: {}, w: SHEET_W, h: SHEET_H},
  figures: {C: EdTest, props: {finish: 'gradient', h: 640}, w: TEST_W, h: TEST_H},
  heads: {C: EdHeads, props: {}, w: HEADS_W, h: HEADS_H},
  faces: {C: EdHeads, props: {span: 150}, w: HEADS_W, h: HEADS_H},
  z0: {C: EdZoom, props: {i: 0}, w: 1200, h: 1800},
  z1: {C: EdZoom, props: {i: 1}, w: 1200, h: 1800},
  z2: {C: EdZoom, props: {i: 2}, w: 1200, h: 1800},
  z3: {C: EdZoom, props: {i: 3}, w: 1200, h: 1800},
  z4: {C: EdZoom, props: {i: 4}, w: 1200, h: 1800},
  z5: {C: EdZoom, props: {i: 5}, w: 1200, h: 1800},
  z6: {C: EdZoom, props: {i: 6}, w: 1200, h: 1800},
  z7: {C: EdZoom, props: {i: 7}, w: 1200, h: 1800},
};

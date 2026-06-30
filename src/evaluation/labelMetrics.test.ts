import { describe, expect, test } from "vitest";

import type { ConfusionStats, LabelMetrics } from "./types.js";
import { createLabelMetrics } from "./labelMetrics.js";

describe("createLabelMetrics", () => {
  test("confusion stats から label ごとの metrics を計算できる", () => {
    expectLabelMetrics(createLabelMetrics(stats), {
      total: 7,
      correct: 3,
      accuracy: 3 / 7,
      precision: 3 / 5,
      recall: 3 / 7,
      f1: 0.5,
    });
  });

  test("入力 stats に副作用を持たない", () => {
    const original = { ...stats };

    createLabelMetrics(stats);

    expect(stats).toStrictEqual(original);
  });
});

function expectLabelMetrics(actual: LabelMetrics, expected: LabelMetrics): void {
  expect(actual.total).toBe(expected.total);
  expect(actual.correct).toBe(expected.correct);
  expect(actual.accuracy).toBeCloseTo(expected.accuracy);
  expect(actual.precision).toBeCloseTo(expected.precision);
  expect(actual.recall).toBeCloseTo(expected.recall);
  expect(actual.f1).toBeCloseTo(expected.f1);
}

const stats: ConfusionStats = {
  total: 7,
  tp: 3,
  fp: 2,
  fn: 4,
  tn: 11,
};

import { describe, expect, test } from "vitest";

import type { ConfusionStats, LabelMetrics } from "../types.js";
import { expectMetricValueToBe, expectMetricValueToBeCloseTo } from "../../metric.js";
import { createLabelMetrics } from "./metrics.js";

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

  test("分母が 0 の metric は null として扱える", () => {
    expectLabelMetrics(createLabelMetrics(zeroSupportStats), {
      total: 0,
      correct: 0,
      accuracy: null,
      precision: 0,
      recall: null,
      f1: null,
    });
  });
});

function expectLabelMetrics(actual: LabelMetrics, expected: LabelMetrics): void {
  expect(actual.total).toBe(expected.total);
  expect(actual.correct).toBe(expected.correct);

  expectMetricValue(actual.accuracy, expected.accuracy, "accuracy");
  expectMetricValue(actual.precision, expected.precision, "precision");
  expectMetricValue(actual.recall, expected.recall, "recall");
  expectMetricValue(actual.f1, expected.f1, "f1");
}

function expectMetricValue(
  actual: LabelMetrics["accuracy"],
  expected: LabelMetrics["accuracy"],
  label: string,
): void {
  if (expected === null) {
    expectMetricValueToBe(actual, expected, label);
    return;
  }

  expectMetricValueToBeCloseTo(actual, expected, 2, label);
}

const stats: ConfusionStats = {
  total: 7,
  tp: 3,
  fp: 2,
  fn: 4,
  tn: 11,
};

const zeroSupportStats: ConfusionStats = {
  total: 0,
  tp: 0,
  fp: 1,
  fn: 0,
  tn: 16,
};

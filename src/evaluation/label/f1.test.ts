import { describe, test } from "vitest";

import { expectMetricValueToBe, expectMetricValueToBeCloseTo } from "../../metric.js";
import type { ConfusionStatsRecord, Metrics } from "../types.js";
import { calcMacroF1, calcMicroF1, calcWeightedF1 } from "./f1.js";

describe("calcMacroF1", () => {
  test("各 label の f1 を単純平均できる", () => {
    expectMetricValueToBeCloseTo(calcMacroF1(metrics), (0.8 + 0.75 + 0.5) / 3);
  });

  test("f1 が null の label は平均から除外する", () => {
    expectMetricValueToBeCloseTo(calcMacroF1(metricsWithNullF1), (0.8 + 0.75) / 2);
  });
});

describe("calcMicroF1", () => {
  test("全 label の tp / fp / fn を合算して f1 を計算できる", () => {
    const precision = 14 / (14 + 22);
    const recall = 14 / (14 + 22);

    expectMetricValueToBeCloseTo(
      calcMicroF1(stats),
      (2 * precision * recall) / (precision + recall),
    );
  });

  test("分母がない場合は null を返す", () => {
    expectMetricValueToBe(calcMicroF1(emptyStats), null);
  });
});

describe("calcWeightedF1", () => {
  test("各 label の f1 を total で重み付け平均できる", () => {
    expectMetricValueToBeCloseTo(calcWeightedF1(metrics), (10 * 0.8 + 20 * 0.75 + 20 * 0.5) / 50);
  });

  test("total が 0 で f1 が null の label は重み付け平均から除外する", () => {
    expectMetricValueToBeCloseTo(calcWeightedF1(metricsWithNullF1), (10 * 0.8 + 20 * 0.75) / 30);
  });
});

const metrics: Metrics = {
  Entailment: {
    total: 10,
    correct: 8,
    accuracy: 0.8,
    precision: 0.8,
    recall: 0.8,
    f1: 0.8,
  },
  NotMentioned: {
    total: 20,
    correct: 15,
    accuracy: 0.75,
    precision: 0.75,
    recall: 0.75,
    f1: 0.75,
  },
  Contradiction: {
    total: 20,
    correct: 10,
    accuracy: 0.5,
    precision: 0.5,
    recall: 0.5,
    f1: 0.5,
  },
};

const metricsWithNullF1: Metrics = {
  Entailment: {
    total: 10,
    correct: 8,
    accuracy: 0.8,
    precision: 0.8,
    recall: 0.8,
    f1: 0.8,
  },
  NotMentioned: {
    total: 20,
    correct: 15,
    accuracy: 0.75,
    precision: 0.75,
    recall: 0.75,
    f1: 0.75,
  },
  Contradiction: {
    total: 0,
    correct: 0,
    accuracy: null,
    precision: 0,
    recall: null,
    f1: null,
  },
};

const stats: ConfusionStatsRecord = {
  Entailment: {
    total: 6,
    tp: 1,
    fp: 5,
    fn: 5,
    tn: 25,
  },
  NotMentioned: {
    total: 12,
    tp: 4,
    fp: 8,
    fn: 8,
    tn: 16,
  },
  Contradiction: {
    total: 18,
    tp: 9,
    fp: 9,
    fn: 9,
    tn: 9,
  },
};

const emptyStats: ConfusionStatsRecord = {
  Entailment: {
    total: 0,
    tp: 0,
    fp: 0,
    fn: 0,
    tn: 0,
  },
  NotMentioned: {
    total: 0,
    tp: 0,
    fp: 0,
    fn: 0,
    tn: 0,
  },
  Contradiction: {
    total: 0,
    tp: 0,
    fp: 0,
    fn: 0,
    tn: 0,
  },
};

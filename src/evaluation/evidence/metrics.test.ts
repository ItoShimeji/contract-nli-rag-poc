import { describe, expect, test } from "vitest";

import type { Label } from "../../contract-nli/types.js";
import { expectMetricValueToBe, expectMetricValueToBeCloseTo } from "../../metric.js";
import type { ResultRecord } from "../../results/types.js";
import type { EvidenceLabelMetrics } from "../types.js";
import { createEvidenceLabelMetrics } from "./metrics.js";

describe("createEvidenceLabelMetrics", () => {
  test("span id の一致・包含・重なりから evidence metrics を計算できる", () => {
    expectEvidenceLabelMetrics(
      createEvidenceLabelMetrics([
        getMockResultRecord([1, 2], [2, 1]),
        getMockResultRecord([3, 4], [3, 4, 5]),
        getMockResultRecord([6, 7], [7, 8]),
        getMockResultRecord([9], [10]),
        getMockResultRecord([], []),
      ]),
      {
        total: 5,
        evaluated: 5,
        correct: 2,
        correctRate: 2 / 5,
        precision: 5 / 8,
        recall: 5 / 7,
        f1: 2 / 3,
        containsGoldCorrect: 2,
        containsGoldRate: 2 / 5,
        hasOverlapCorrect: 3,
        hasOverlapRate: 3 / 5,
      },
    );
  });

  test("入力 records に副作用を持たない", () => {
    const records = [getMockResultRecord([1, 2], [2, 1])];
    const original = structuredClone(records);

    createEvidenceLabelMetrics(records);

    expect(records).toStrictEqual(original);
  });

  test("分母が 0 の metric は null として扱える", () => {
    expectEvidenceLabelMetrics(createEvidenceLabelMetrics([]), {
      total: 0,
      evaluated: 0,
      correct: 0,
      correctRate: null,
      precision: null,
      recall: null,
      f1: null,
      containsGoldCorrect: 0,
      containsGoldRate: null,
      hasOverlapCorrect: 0,
      hasOverlapRate: null,
    });
  });
});

function expectEvidenceLabelMetrics(
  actual: EvidenceLabelMetrics,
  expected: EvidenceLabelMetrics,
): void {
  expect(actual.total).toBe(expected.total);
  expect(actual.evaluated).toBe(expected.evaluated);
  expect(actual.correct).toBe(expected.correct);
  expectMetricValue(actual.correctRate, expected.correctRate, "correctRate");
  expectMetricValue(actual.precision, expected.precision, "precision");
  expectMetricValue(actual.recall, expected.recall, "recall");
  expectMetricValue(actual.f1, expected.f1, "f1");
  expect(actual.containsGoldCorrect).toBe(expected.containsGoldCorrect);
  expectMetricValue(actual.containsGoldRate, expected.containsGoldRate, "containsGoldRate");
  expect(actual.hasOverlapCorrect).toBe(expected.hasOverlapCorrect);
  expectMetricValue(actual.hasOverlapRate, expected.hasOverlapRate, "hasOverlapRate");
}

function expectMetricValue(
  actual: EvidenceLabelMetrics["correctRate"],
  expected: EvidenceLabelMetrics["correctRate"],
  label: string,
): void {
  if (expected === null) {
    expectMetricValueToBe(actual, expected, label);
    return;
  }

  expectMetricValueToBeCloseTo(actual, expected, 2, label);
}

function getMockResultRecord(
  goldEvidenceSpanIds: number[],
  predictedEvidenceSpanIds: number[],
): ResultRecord {
  return {
    documentId: 0,
    hypothesisId: "",
    goldLabel: "Entailment" satisfies Label,
    predictedLabel: "Entailment" satisfies Label,
    goldEvidenceSpanIds,
    predictedEvidenceSpanIds,
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    latency: { totalMs: 0 },
  };
}

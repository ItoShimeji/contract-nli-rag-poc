import { divideOrNull } from "../../metric.js";
import type { ResultRecord } from "../../results/types.js";
import type { EvidenceLabelMetrics } from "../types.js";
import { isContainingGold } from "./spanIds/containsGold.js";
import { isExactMatch } from "./spanIds/exactMatch.js";
import { isOverlapping } from "./spanIds/overlap.js";
import { isEvidenceEvaluable } from "./evaluable.js";

export function createEvidenceLabelMetrics(records: ResultRecord[]): EvidenceLabelMetrics {
  const total = records.length;
  const evaluatedRecords = records.filter(isEvidenceEvaluable);
  const evaluated = evaluatedRecords.length;
  const correct = evaluatedRecords.filter((record) =>
    isExactMatch(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds),
  ).length;
  const containsGoldCorrect = evaluatedRecords.filter((record) =>
    isContainingGold(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds),
  ).length;
  const hasOverlapCorrect = evaluatedRecords.filter((record) =>
    isOverlapping(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds),
  ).length;

  const overlapCount = evaluatedRecords.reduce(
    (sum, record) =>
      sum + countOverlap(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds),
    0,
  );
  const predictedCount = evaluatedRecords.reduce(
    (sum, record) => sum + record.predictedEvidenceSpanIds.length,
    0,
  );
  const goldCount = evaluatedRecords.reduce(
    (sum, record) => sum + record.goldEvidenceSpanIds.length,
    0,
  );
  const precision = divideOrNull(overlapCount, predictedCount);
  const recall = divideOrNull(overlapCount, goldCount);

  return {
    total,
    evaluated,
    correct,
    correctRate: divideOrNull(correct, evaluated),
    precision,
    recall,
    f1:
      precision === null || recall === null
        ? null
        : divideOrNull(2 * precision * recall, precision + recall),
    containsGoldCorrect,
    containsGoldRate: divideOrNull(containsGoldCorrect, evaluated),
    hasOverlapCorrect,
    hasOverlapRate: divideOrNull(hasOverlapCorrect, evaluated),
  };
}

function countOverlap(gold: number[], prediction: number[]): number {
  let count = 0;
  const uniqueGold = new Set(gold);
  const predictionSet = new Set(prediction);

  for (const spanId of uniqueGold) {
    if (predictionSet.has(spanId)) {
      count++;
    }
  }

  return count;
}

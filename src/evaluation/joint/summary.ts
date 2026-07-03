import { divideOrNull } from "../../metric.js";
import type { ResultRecord } from "../../results/types.js";
import type { JointEvaluationSummary, JointLabelMetrics } from "../types.js";
import { isContainingGold } from "../evidence/spanIds/containsGold.js";
import { isExactMatch } from "../evidence/spanIds/exactMatch.js";
import { isOverlapping } from "../evidence/spanIds/overlap.js";
import { isEvidenceEvaluable } from "../evidence/evaluable.js";

export function createJointEvaluationSummary(records: ResultRecord[]): JointEvaluationSummary {
  const evaluatedRecords = records.filter(isEvidenceEvaluable);
  const total = evaluatedRecords.length;
  const correct = evaluatedRecords.filter(isJointExactMatchCorrect).length;
  const containsGoldCorrect = evaluatedRecords.filter(isJointContainsGoldCorrect).length;
  const hasOverlapCorrect = evaluatedRecords.filter(isJointHasOverlapCorrect).length;

  return {
    total,
    correct,
    accuracy: divideOrNull(correct, total),
    containsGoldCorrect,
    containsGoldAccuracy: divideOrNull(containsGoldCorrect, total),
    hasOverlapCorrect,
    hasOverlapAccuracy: divideOrNull(hasOverlapCorrect, total),
    byGoldLabel: {
      Entailment: createJointLabelMetrics(
        records.filter((record) => record.goldLabel === "Entailment"),
      ),
      NotMentioned: createJointLabelMetrics(
        records.filter((record) => record.goldLabel === "NotMentioned"),
      ),
      Contradiction: createJointLabelMetrics(
        records.filter((record) => record.goldLabel === "Contradiction"),
      ),
    },
  };
}

function createJointLabelMetrics(records: ResultRecord[]): JointLabelMetrics {
  const total = records.length;
  const evaluatedRecords = records.filter(isEvidenceEvaluable);
  const evaluated = evaluatedRecords.length;
  const correct = evaluatedRecords.filter(isJointExactMatchCorrect).length;
  const containsGoldCorrect = evaluatedRecords.filter(isJointContainsGoldCorrect).length;
  const hasOverlapCorrect = evaluatedRecords.filter(isJointHasOverlapCorrect).length;

  return {
    total,
    evaluated,
    correct,
    accuracy: divideOrNull(correct, evaluated),
    containsGoldCorrect,
    containsGoldAccuracy: divideOrNull(containsGoldCorrect, evaluated),
    hasOverlapCorrect,
    hasOverlapAccuracy: divideOrNull(hasOverlapCorrect, evaluated),
  };
}

function isLabelCorrect(record: ResultRecord): boolean {
  return record.goldLabel === record.predictedLabel;
}

function isJointExactMatchCorrect(record: ResultRecord): boolean {
  return (
    isLabelCorrect(record) &&
    isExactMatch(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds)
  );
}

function isJointContainsGoldCorrect(record: ResultRecord): boolean {
  return (
    isLabelCorrect(record) &&
    isContainingGold(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds)
  );
}

function isJointHasOverlapCorrect(record: ResultRecord): boolean {
  return (
    isLabelCorrect(record) &&
    isOverlapping(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds)
  );
}

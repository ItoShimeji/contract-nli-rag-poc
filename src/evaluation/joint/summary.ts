import { divideOrNull } from "../../metric.js";
import type { ResultRecord } from "../../results/types.js";
import type { JointEvaluationSummary, JointLabelMetrics } from "../types.js";
import { isContainingGold } from "../evidence/spanIds/containsGold.js";
import { isExactMatch } from "../evidence/spanIds/exactMatch.js";
import { isOverlapping } from "../evidence/spanIds/overlap.js";

export function createJointEvaluationSummary(records: ResultRecord[]): JointEvaluationSummary {
  const total = records.length;
  const correct = records.filter(isJointExactMatchCorrect).length;
  const containsGoldCorrect = records.filter(isJointContainsGoldCorrect).length;
  const hasOverlapCorrect = records.filter(isJointHasOverlapCorrect).length;

  return {
    total,
    correct,
    accuracy: correct / total,
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
  const correct = records.filter(isJointExactMatchCorrect).length;
  const containsGoldCorrect = records.filter(isJointContainsGoldCorrect).length;
  const hasOverlapCorrect = records.filter(isJointHasOverlapCorrect).length;

  return {
    total,
    correct,
    accuracy: divideOrNull(correct, total),
    containsGoldCorrect,
    containsGoldAccuracy: divideOrNull(containsGoldCorrect, total),
    hasOverlapCorrect,
    hasOverlapAccuracy: divideOrNull(hasOverlapCorrect, total),
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

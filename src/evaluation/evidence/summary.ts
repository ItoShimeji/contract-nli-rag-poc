import type { ResultRecord } from "../../results/types.js";
import type { EvidenceEvaluationSummary } from "../types.js";
import { divideOrNull } from "../../metric.js";
import { countCorrect } from "./spanIds/count.js";
import { isExactMatch } from "./spanIds/exactMatch.js";
import { isContainingGold } from "./spanIds/containsGold.js";
import { isOverlapping } from "./spanIds/overlap.js";
import { createEvidenceLabelMetrics } from "./metrics.js";
import { isEvidenceEvaluable } from "./evaluable.js";

export function createEvidenceEvaluationSummary(
  records: ResultRecord[],
): EvidenceEvaluationSummary {
  const evaluatedRecords = records.filter(isEvidenceEvaluable);
  const total = evaluatedRecords.length;
  const correct = countCorrect(isExactMatch, evaluatedRecords);
  const containsGoldCorrect = countCorrect(isContainingGold, evaluatedRecords);
  const overlapCorrect = countCorrect(isOverlapping, evaluatedRecords);

  return {
    total,
    correct,
    correctRate: divideOrNull(correct, total),
    containsGoldCorrect: containsGoldCorrect,
    containsGoldRate: divideOrNull(containsGoldCorrect, total),
    hasOverlapCorrect: overlapCorrect,
    hasOverlapRate: divideOrNull(overlapCorrect, total),
    byGoldLabel: {
      Entailment: createEvidenceLabelMetrics(
        records.filter((record) => record.goldLabel === "Entailment"),
      ),
      NotMentioned: createEvidenceLabelMetrics(
        records.filter((record) => record.goldLabel === "NotMentioned"),
      ),
      Contradiction: createEvidenceLabelMetrics(
        records.filter((record) => record.goldLabel === "Contradiction"),
      ),
    },
  };
}

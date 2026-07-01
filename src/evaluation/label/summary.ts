import type { ResultRecord } from "../../results/types.js";
import { createConfusionMatrix } from "./confusionMatrix.js";
import { createConfusionStats } from "./confusionStats.js";
import { createLabelMetrics } from "./metrics.js";
import type { LabelEvaluationSummary } from "../types.js";
import { calcMacroF1, calcMicroF1, calcWeightedF1 } from "./f1.js";

export function createLabelEvaluationSummary(records: ResultRecord[]): LabelEvaluationSummary {
  const matrix = createConfusionMatrix(records);
  const stats = createConfusionStats(matrix);

  const metrics = {
    Entailment: createLabelMetrics(stats.Entailment),
    NotMentioned: createLabelMetrics(stats.NotMentioned),
    Contradiction: createLabelMetrics(stats.Contradiction),
  };

  return {
    byGoldLabel: metrics,
    confusionMatrix: matrix,
    macroF1: calcMacroF1(metrics),
    microF1: calcMicroF1(stats),
    weightedF1: calcWeightedF1(metrics),
  };
}

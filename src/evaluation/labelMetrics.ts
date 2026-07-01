import type { ConfusionStats, LabelMetrics } from "./types.js";
import { divideOrNull } from "../metric.js";

export function createLabelMetrics(stats: ConfusionStats): LabelMetrics {
  const { total, tp, fp, fn } = stats;
  const precision = divideOrNull(tp, tp + fp);
  const recall = divideOrNull(tp, tp + fn);

  return {
    total: total,
    correct: tp,
    accuracy: divideOrNull(tp, total),
    precision: precision,
    recall: recall,
    f1:
      precision === null || recall === null
        ? null
        : divideOrNull(2 * precision * recall, precision + recall),
  };
}

import type { ConfusionStats, LabelMetrics } from "./types.js";

export function createLabelMetrics(stats: ConfusionStats): LabelMetrics {
  const { total, tp, fp, fn } = stats;
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);

  return {
    total: total,
    correct: tp,
    accuracy: tp / total,
    precision: tp / (tp + fp),
    recall: tp / (tp + fn),
    f1: (2 * precision * recall) / (precision + recall),
  };
}

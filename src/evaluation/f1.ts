import type { ConfusionStatsRecord, Metrics } from "./types.js";

export function calcMacroF1(metrics: Metrics): number {
  return (metrics.Entailment.f1 + metrics.NotMentioned.f1 + metrics.Contradiction.f1) / 3;
}

export function calcMicroF1(stats: ConfusionStatsRecord): number {
  let tp = 0;
  let fp = 0;
  let fn = 0;

  Object.entries(stats)
    .map(([_, stats]) => stats)
    .forEach((stats) => {
      tp += stats.tp;
      fp += stats.fp;
      fn += stats.fn;
    });

  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);

  return (2 * precision * recall) / (precision + recall);
}

export function calcWeightedF1(metrics: Metrics): number {
  return (
    (metrics.Entailment.total * metrics.Entailment.f1 +
      metrics.NotMentioned.total * metrics.NotMentioned.f1 +
      metrics.Contradiction.total * metrics.Contradiction.f1) /
    (metrics.Entailment.total + metrics.NotMentioned.total + metrics.Contradiction.total)
  );
}

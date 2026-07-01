import type { MetricValue } from "../metric.js";
import { divideOrNull, isMetricNumber, meanOrNull } from "../metric.js";
import type { ConfusionStatsRecord, LabelMetrics, Metrics } from "./types.js";

export function calcMacroF1(metrics: Metrics): MetricValue {
  return meanOrNull(Object.values(metrics).map((metric) => metric.f1));
}

export function calcMicroF1(stats: ConfusionStatsRecord): MetricValue {
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

  const precision = divideOrNull(tp, tp + fp);
  const recall = divideOrNull(tp, tp + fn);
  if (precision === null || recall === null) return null;

  return divideOrNull(2 * precision * recall, precision + recall);
}

export function calcWeightedF1(metrics: Metrics): MetricValue {
  const validMetrics = Object.values(metrics).filter(hasWeightedF1);
  const total = validMetrics.reduce((sum, metric) => sum + metric.total, 0);
  if (total === 0) return null;

  return validMetrics.reduce((sum, metric) => sum + metric.total * metric.f1, 0) / total;
}

type LabelMetricsWithF1 = LabelMetrics & { f1: number };

const hasWeightedF1 = (metric: LabelMetrics): metric is LabelMetricsWithF1 => {
  return metric.total > 0 && isMetricNumber(metric.f1);
};

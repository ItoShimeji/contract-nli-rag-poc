import type { ResultRecord } from "../results/types.js";
import { createLabelEvaluationSummary } from "./labelEvaluationSummary.js";
import { createLatencyEvaluationSummary } from "./latency.js";
import type { EvaluationSummary } from "./types.js";
import { createUsageEvaluationSummary } from "./usage.js";

export function createEvaluationSummary(records: ResultRecord[]): EvaluationSummary {
  const total = records.length;
  const correct = records.filter((record) => record.goldLabel === record.predictedLabel).length;

  return {
    total,
    correct,
    accuracy: correct / correct,
    labels: createLabelEvaluationSummary(records),
    usage: createUsageEvaluationSummary(records),
    latency: createLatencyEvaluationSummary(records),
  };
}

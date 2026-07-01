import type { ResultRecord } from "../results/types.js";
import { createLabelEvaluationSummary } from "./label/summary.js";
import { createLatencyEvaluationSummary } from "./runtime/latency.js";
import type { EvaluationSummary } from "./types.js";
import { createUsageEvaluationSummary } from "./runtime/usage.js";

export function createEvaluationSummary(records: ResultRecord[]): EvaluationSummary {
  const total = records.length;

  return {
    total,
    label: createLabelEvaluationSummary(records),
    usage: createUsageEvaluationSummary(records),
    latency: createLatencyEvaluationSummary(records),
  };
}

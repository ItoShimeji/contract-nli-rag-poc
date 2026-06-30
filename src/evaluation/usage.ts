import type { ResultRecord } from "../results/types.js";
import type { UsageEvaluationSummary } from "./types.js";
import { calcNumberStats } from "./numberStats.js";

export function createUsageEvaluationSummary(records: ResultRecord[]): UsageEvaluationSummary {
  const inputTokens: number[] = [];
  const outputTokens: number[] = [];
  const totalTokens: number[] = [];

  for (const record of records) {
    inputTokens.push(record.usage.inputTokens);
    outputTokens.push(record.usage.outputTokens);
    totalTokens.push(record.usage.totalTokens);
  }

  return {
    inputTokens: calcNumberStats(inputTokens),
    outputTokens: calcNumberStats(outputTokens),
    totalTokens: calcNumberStats(totalTokens),
  };
}

import type { ResultRecord } from "../results/types.js";
import type { LatencyEvaluationSummary } from "./types.js";
import { calcNumberStats } from "./numberStats.js";
import { calcOverNsRates } from "./overNsRate.js";

export function createLatencyEvaluationSummary(records: ResultRecord[]): LatencyEvaluationSummary {
  const totalMs_list = records.map((record) => record.latency.totalMs);

  const overNsRates = calcOverNsRates(totalMs_list);
  const numberStats = calcNumberStats(totalMs_list);

  return {
    ...overNsRates,
    ...numberStats,
  };
}

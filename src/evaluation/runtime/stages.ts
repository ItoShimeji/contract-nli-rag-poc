import type { Usage } from "../../methods/types.js";
import type { ResultRecord } from "../../results/types.js";
import type {
  LatencyEvaluationSummary,
  StageRuntimeEvaluationSummary,
  UsageEvaluationSummary,
} from "../types.js";
import { calcNumberStats } from "../stats/numberStats.js";
import { calcOverNsRates } from "../stats/overNsRate.js";

export function createStageRuntimeEvaluationSummary(
  records: ResultRecord[],
): StageRuntimeEvaluationSummary | undefined {
  const retrieveLatencies: number[] = [];
  const rerankLatencies: number[] = [];
  const generateLatencies: number[] = [];
  const verifyLatencies: number[] = [];
  const rerankUsages: Usage[] = [];
  const generateUsages: Usage[] = [];
  const verifyUsages: Usage[] = [];

  for (const record of records) {
    if (record.stages?.retrieve) {
      retrieveLatencies.push(record.stages.retrieve.latencyMs);
    }
    if (record.stages?.rerank) {
      rerankLatencies.push(record.stages.rerank.latencyMs);
      rerankUsages.push(record.stages.rerank.usage);
    }
    if (record.stages?.generate) {
      generateLatencies.push(record.stages.generate.latencyMs);
      generateUsages.push(record.stages.generate.usage);
    }
    if (record.stages?.verify) {
      verifyLatencies.push(record.stages.verify.latencyMs);
      verifyUsages.push(record.stages.verify.usage);
    }
  }

  const summary: StageRuntimeEvaluationSummary = {};

  if (retrieveLatencies.length > 0) {
    summary.retrieve = {
      count: retrieveLatencies.length,
      latency: createLatencySummary(retrieveLatencies),
    };
  }
  if (rerankLatencies.length > 0) {
    summary.rerank = {
      count: rerankLatencies.length,
      usage: createUsageSummary(rerankUsages),
      latency: createLatencySummary(rerankLatencies),
    };
  }
  if (generateLatencies.length > 0) {
    summary.generate = {
      count: generateLatencies.length,
      usage: createUsageSummary(generateUsages),
      latency: createLatencySummary(generateLatencies),
    };
  }
  if (verifyLatencies.length > 0) {
    summary.verify = {
      count: verifyLatencies.length,
      usage: createUsageSummary(verifyUsages),
      latency: createLatencySummary(verifyLatencies),
    };
  }

  if (Object.keys(summary).length === 0) {
    return undefined;
  }

  return summary;
}

function createUsageSummary(usages: Usage[]): UsageEvaluationSummary {
  return {
    inputTokens: calcNumberStats(usages.map((usage) => usage.inputTokens)),
    outputTokens: calcNumberStats(usages.map((usage) => usage.outputTokens)),
    totalTokens: calcNumberStats(usages.map((usage) => usage.totalTokens)),
  };
}

function createLatencySummary(latenciesMs: number[]): LatencyEvaluationSummary {
  return {
    ...calcOverNsRates(latenciesMs),
    ...calcNumberStats(latenciesMs),
  };
}

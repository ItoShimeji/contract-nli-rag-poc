import { describe, expect, it } from "vitest";

import type { ResultRecord } from "../../results/types.js";
import { createStageRuntimeEvaluationSummary } from "./stages.js";

describe("createStageRuntimeEvaluationSummary", () => {
  it("stage ごとの usage と latency を集計する", () => {
    const records: ResultRecord[] = [
      {
        documentId: 1,
        hypothesisId: "h1",
        goldLabel: "Entailment",
        predictedLabel: "Entailment",
        goldEvidenceSpanIds: [1],
        predictedEvidenceSpanIds: [1],
        usage: { inputTokens: 15, outputTokens: 5, totalTokens: 20 },
        latency: { totalMs: 350 },
        stages: {
          retrieve: {
            latencyMs: 10,
            spans: [{ spanId: 1, score: 0.9 }],
          },
          rerank: {
            usage: { inputTokens: 5, outputTokens: 1, totalTokens: 6 },
            latencyMs: 100,
            inputSpanIds: [1, 2],
            outputSpanIds: [1],
          },
          generate: {
            usage: { inputTokens: 7, outputTokens: 2, totalTokens: 9 },
            latencyMs: 150,
            prediction: { label: "Entailment", evidenceSpanIds: [1] },
          },
          verify: {
            usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 },
            latencyMs: 90,
            decision: "accept",
            predictionBefore: { label: "Entailment", evidenceSpanIds: [1] },
            predictionAfter: { label: "Entailment", evidenceSpanIds: [1] },
          },
        },
      },
    ];

    const summary = createStageRuntimeEvaluationSummary(records);

    expect(summary?.retrieve?.count).toBe(1);
    expect(summary?.retrieve?.latency.total).toBe(10);
    expect(summary?.rerank?.usage?.totalTokens.total).toBe(6);
    expect(summary?.generate?.usage?.inputTokens.total).toBe(7);
    expect(summary?.verify?.latency.total).toBe(90);
  });

  it("stage 情報がない場合は undefined を返す", () => {
    expect(createStageRuntimeEvaluationSummary([getRecordWithoutStages()])).toBeUndefined();
  });
});

function getRecordWithoutStages(): ResultRecord {
  return {
    documentId: 1,
    hypothesisId: "h1",
    goldLabel: "Entailment",
    predictedLabel: "Entailment",
    goldEvidenceSpanIds: [1],
    predictedEvidenceSpanIds: [1],
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    latency: { totalMs: 0 },
  };
}

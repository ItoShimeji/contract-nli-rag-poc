import { describe, expect, it } from "vitest";

import type { ResultRecord } from "../../results/types.js";
import { createVerifierEvaluationSummary } from "./summary.js";

describe("createVerifierEvaluationSummary", () => {
  it("verifier 前後の改善と悪化を数える", () => {
    const records: ResultRecord[] = [
      getVerifiedRecord({
        decision: "revise",
        before: { label: "NotMentioned", evidenceSpanIds: [] },
        after: { label: "Entailment", evidenceSpanIds: [1] },
      }),
      getVerifiedRecord({
        decision: "revise",
        before: { label: "Entailment", evidenceSpanIds: [1] },
        after: { label: "Contradiction", evidenceSpanIds: [1] },
      }),
      getVerifiedRecord({
        decision: "accept",
        before: { label: "Entailment", evidenceSpanIds: [1] },
        after: { label: "Entailment", evidenceSpanIds: [1] },
      }),
      getVerifiedRecord({
        decision: "accept",
        before: { label: "Contradiction", evidenceSpanIds: [1] },
        after: { label: "Contradiction", evidenceSpanIds: [1] },
      }),
    ];

    expect(createVerifierEvaluationSummary(records)).toEqual({
      total: 4,
      acceptCount: 2,
      reviseCount: 2,
      revisionRate: 0.5,
      helpfulRevisionCount: 1,
      harmfulRevisionCount: 1,
      unchangedCorrectCount: 1,
      unchangedWrongCount: 1,
    });
  });

  it("verifier stage がない場合は undefined を返す", () => {
    expect(createVerifierEvaluationSummary([getRecordWithoutStages()])).toBeUndefined();
  });
});

type TestPrediction = {
  label: "Entailment" | "Contradiction" | "NotMentioned";
  evidenceSpanIds: number[];
};

function getVerifiedRecord(input: {
  decision: "accept" | "revise";
  before: TestPrediction;
  after: TestPrediction;
}): ResultRecord {
  return {
    documentId: 1,
    hypothesisId: "h1",
    goldLabel: "Entailment",
    predictedLabel: input.after.label,
    goldEvidenceSpanIds: [1],
    predictedEvidenceSpanIds: input.after.evidenceSpanIds,
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    latency: { totalMs: 0 },
    stages: {
      retrieve: {
        latencyMs: 0,
        spans: [{ spanId: 1, score: 1 }],
      },
      generate: {
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        latencyMs: 0,
        prediction: input.before,
      },
      verify: {
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        latencyMs: 0,
        decision: input.decision,
        predictionBefore: input.before,
        predictionAfter: input.after,
      },
    },
  };
}

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

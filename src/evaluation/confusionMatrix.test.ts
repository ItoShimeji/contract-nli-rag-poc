import { describe, expect, test } from "vitest";

import { createConfusionMatrix } from "./confusionMatrix.js";
import type { Label } from "../contract-nli/types.js";
import type { ResultRecord } from "../results/types.js";
import type { ConfusionMatrix } from "./types.js";

describe("createConfusionMatrix", () => {
  const labels: Label[] = ["Entailment", "NotMentioned", "Contradiction"];
  const records: ResultRecord[] = [];

  // 各セルは (i + 1) * (j + 1) 個の同じラベルが存在する
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let n = 0; n < (i + 1) * (j + 1); n++) {
        records.push(getMockResultRecord(labels[i]!, labels[j]!));
      }
    }
  }

  const result: ConfusionMatrix = {
    Entailment: { Entailment: 1, NotMentioned: 2, Contradiction: 3 },
    NotMentioned: { Entailment: 2, NotMentioned: 4, Contradiction: 6 },
    Contradiction: { Entailment: 3, NotMentioned: 6, Contradiction: 9 },
  };

  test("records を confusion matrix に変換できる", () => {
    expect(createConfusionMatrix(records)).toStrictEqual(result);
  });

  test("副作用を持たない", () => {
    const original = [...records];
    createConfusionMatrix(records);

    expect(records).toStrictEqual(original);
  });
});

function getMockResultRecord(goldLabel: Label, predictedLabel: Label): ResultRecord {
  return {
    documentId: 0,
    hypothesisId: "",
    goldLabel,
    predictedLabel,
    goldEvidenceSpanIds: [],
    predictedEvidenceSpanIds: [],
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    latency: { totalMs: 0 },
  };
}

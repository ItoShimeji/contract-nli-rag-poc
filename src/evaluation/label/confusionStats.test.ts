import { describe, expect, test } from "vitest";

import type { ConfusionMatrix } from "../types.js";
import type { ConfusionStatsRecord } from "../types.js";
import { createConfusionStats } from "./confusionStats.js";

describe("createConfusionStats", () => {
  const matrix: ConfusionMatrix = getMatrix();

  test("confusion matrix から計算の中間表現である confusion stats を計算できる", () => {
    expect(createConfusionStats(matrix)).toStrictEqual(result);
  });

  test("副作用を持たない", () => {
    const original = getMatrix();
    createConfusionStats(matrix);

    expect(matrix).toStrictEqual(original);
  });
});

function getMatrix(): ConfusionMatrix {
  return {
    Entailment: { Entailment: 1, NotMentioned: 2, Contradiction: 3 },
    NotMentioned: { Entailment: 2, NotMentioned: 4, Contradiction: 6 },
    Contradiction: { Entailment: 3, NotMentioned: 6, Contradiction: 9 },
  };
}

const result: ConfusionStatsRecord = {
  Entailment: {
    total: 6,
    tp: 1,
    fp: 5,
    fn: 5,
    tn: 25,
  },
  NotMentioned: {
    total: 12,
    tp: 4,
    fp: 8,
    fn: 8,
    tn: 16,
  },
  Contradiction: {
    total: 18,
    tp: 9,
    fp: 9,
    fn: 9,
    tn: 9,
  },
};

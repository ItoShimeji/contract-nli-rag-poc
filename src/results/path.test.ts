import { describe, expect, it } from "vitest";

import { getEvaluationSummaryFilePath, getResultFilePath } from "./path.js";

describe("result path", () => {
  it("model ごとに result file path を分ける", () => {
    expect(getResultFilePath("results", "gpt-5.4-nano", "rag-rerank")).toBe(
      "results/gpt-5.4-nano/rag-rerank.json",
    );
  });

  it("model ごとに evaluation summary file path を分ける", () => {
    expect(getEvaluationSummaryFilePath("results", "gpt-5.4-nano", "rag-rerank")).toBe(
      "results/gpt-5.4-nano/rag-rerank.summary.json",
    );
  });
});

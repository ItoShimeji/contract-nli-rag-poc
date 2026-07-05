import { describe, expect, it } from "vitest";

import type { Document, Hypothesis } from "../../contract-nli/types.js";
import type { ProgressReporter } from "../../progress.js";
import type { runMethod } from "../../methods/types.js";
import { runPredictionMethod } from "./runPredictionMethod.js";

describe("runPredictionMethod", () => {
  it("指定した並列数で method を実行し、結果順を入力順に保つ", async () => {
    let active = 0;
    let maxActive = 0;
    const run: runMethod = async (input) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await sleep(input.example.hypothesisId === "h1" ? 20 : 1);
      active -= 1;

      return {
        label: "Entailment",
        evidenceSpanIds: [input.document.id],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        latency: { totalMs: 1 },
      };
    };

    const results = await runPredictionMethod({
      run,
      progress: noopProgress,
      concurrency: 2,
      input: {
        documents: [getDocument(1), getDocument(2)],
        hypotheses: [getHypothesis("h1"), getHypothesis("h2")],
      },
    });

    expect(maxActive).toBe(2);
    expect(results.map((result) => `${result.documentId}:${result.hypothesisId}`)).toEqual([
      "1:h1",
      "1:h2",
      "2:h1",
      "2:h2",
    ]);
  });

  it("不正な並列数は 1 として扱う", async () => {
    let active = 0;
    let maxActive = 0;
    const run: runMethod = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await sleep(1);
      active -= 1;

      return {
        label: "NotMentioned",
        evidenceSpanIds: [],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        latency: { totalMs: 1 },
      };
    };

    await runPredictionMethod({
      run,
      progress: noopProgress,
      concurrency: 0,
      input: {
        documents: [getDocument(1)],
        hypotheses: [getHypothesis("h1"), getHypothesis("h2")],
      },
    });

    expect(maxActive).toBe(1);
  });
});

const noopProgress: ProgressReporter = {
  start: () => {},
  update: () => {},
  finish: () => {},
};

function getDocument(id: number): Document {
  return {
    id,
    text: "contract text",
    spans: [[0, 8]],
    annotations: [],
  };
}

function getHypothesis(id: string): Hypothesis {
  return {
    id,
    description: id,
    text: `hypothesis ${id}`,
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

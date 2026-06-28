import { describe, expect, test } from "vitest";

import type { Document } from "../contract-nli/types.js";
import { createResultRecords, createGoldAnnotationMap } from "./record.js";
import type { ResultInput } from "./types.js";

describe("createResultRecords", () => {
  test("result record 配列を作成する", () => {
    const records = createResultRecords(resultInputs, documents);
    expect(records.length).toBe(3);

    const first = records[0]!;
    expect(first.documentId).toBe(34);
    expect(first.hypothesisId).toBe("nda-1");
    expect(first.goldLabel).toBe("NotMentioned");
  });

  test("documents に定義されていない input が入力された場合にエラーを投げる", () => {
    expect(() => createResultRecords(invalidResultInputs, documents)).toThrow(
      "dataset に annotation が見つかりません",
    );
  });
});

describe("createGoldAnnotationMap", () => {
  const goldMap = createGoldAnnotationMap(documents);

  test("documet 配列から gold annotaion map を作成する", () => {
    expect(goldMap.has("34:nda-1")).toBe(true);
    expect(goldMap.has("34:nda-18")).toBe(true);
    expect(goldMap.has("2:nda-5")).toBe(true);
  });

  test("不適切な組み合わせは登録されない", () => {
    expect(goldMap.has("34:nda-5")).toBe(false);
    expect(goldMap.has("2:nda-18")).toBe(false);
  });
});

export const resultInputs: ResultInput[] = [
  {
    documentId: 34,
    hypothesisId: "nda-1",
    prediction: {
      label: "NotMentioned",
      evidenceSpanIds: [],
      usage: {
        inputTokens: 120,
        outputTokens: 12,
        totalTokens: 132,
      },
      latency: {
        totalMs: 850,
      },
    },
  },
  {
    documentId: 34,
    hypothesisId: "nda-18",
    prediction: {
      label: "Contradiction",
      evidenceSpanIds: [3],
      usage: {
        inputTokens: 140,
        outputTokens: 18,
        totalTokens: 158,
      },
      latency: {
        totalMs: 920,
      },
    },
  },
  {
    documentId: 2,
    hypothesisId: "nda-5",
    prediction: {
      label: "Contradiction",
      evidenceSpanIds: [0],
      usage: {
        inputTokens: 96,
        outputTokens: 10,
        totalTokens: 106,
      },
      latency: {
        totalMs: 730,
      },
    },
  },
];

export const invalidResultInputs: ResultInput[] = [
  {
    documentId: 43,
    hypothesisId: "nda-1",
    prediction: {
      label: "NotMentioned",
      evidenceSpanIds: [],
      usage: {
        inputTokens: 120,
        outputTokens: 12,
        totalTokens: 132,
      },
      latency: {
        totalMs: 850,
      },
    },
  },
];

const documents: Document[] = [
  {
    id: 34,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spans: [],
    annotations: [
      {
        hypothesisId: "nda-1",
        label: "NotMentioned",
        spanIds: [],
      },
      {
        hypothesisId: "nda-18",
        label: "Entailment",
        spanIds: [1, 2],
      },
    ],
  },
  {
    id: 2,
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    spans: [],
    annotations: [
      {
        hypothesisId: "nda-5",
        label: "Contradiction",
        spanIds: [0],
      },
    ],
  },
];

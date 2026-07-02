import { describe, expect, it } from "vitest";
import { createDocumentSpanEmbeddingsByDocumentId, retrieve } from "./retriever.js";
import type { CalcSimilarity } from "./types.js";

describe("createDocumentSpanEmbeddingsByDocumentId", () => {
  it("documentId ごとに span embedding をまとめる", () => {
    const result = createDocumentSpanEmbeddingsByDocumentId({
      totalTokens: 0,
      items: {
        "contract-nli:document:1:span:0": {
          documentId: 1,
          spanIndex: 0,
          embedding: [1, 0],
        },
        "contract-nli:document:1:span:1": {
          documentId: 1,
          spanIndex: 1,
          embedding: [0.8, 0.2],
        },
        "contract-nli:document:2:span:0": {
          documentId: 2,
          spanIndex: 0,
          embedding: [0, 1],
        },
      },
    });

    expect(result).toEqual({
      1: [
        { index: 0, embedding: [1, 0] },
        { index: 1, embedding: [0.8, 0.2] },
      ],
      2: [{ index: 0, embedding: [0, 1] }],
    });
  });
});

describe("retrieve", () => {
  it("コサイン類似度を用いて top k を返す", () => {
    const embeddings = {
      hypothesis: [1, 0],
      spans: [
        { index: 0, embedding: [1, 0] }, // cosine = 1
        { index: 1, embedding: [0, 1] }, // cosine = 0
        { index: 2, embedding: [0.8, 0.6] }, // cosine = 0.8
        { index: 3, embedding: [-1, 0] }, // cosine = -1
      ],
    };

    const result = retrieve(2, mockCalcSimilarity, embeddings);

    expect(result).toEqual([0, 2]);
  });

  it("span の数が k よりも小さい場合はエラーを投げる", () => {
    const embeddings = {
      hypothesis: [1, 0],
      spans: [{ index: 1, embedding: [1, 0] }],
    };

    expect(() => retrieve(2, mockCalcSimilarity, embeddings)).toThrow(
      "top k を計算するのに十分な span の数がありません",
    );
  });
});

const mockCalcSimilarity: CalcSimilarity = (_, b) => {
  return b[0]!;
};

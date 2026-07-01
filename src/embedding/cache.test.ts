import { describe, expect, test } from "vitest";

import type { DocumentEmbeddingItem, HypothesisEmbeddingItem } from "./types.js";
import { createDocumentsEmbeddingCache, createHypothesesEmbeddingCache } from "./cache.js";

describe("createDocumentsEmbeddingCache", () => {
  test("embedding cache オブジェクトを生成する", () => {
    const result = createDocumentsEmbeddingCache(documentItems);

    expect(result.items).toHaveProperty("contract-nli:document:1:span:0");
    expect(result.totalTokens).toBe(1000);
  });
});

describe("createHypothesesEmbeddingCache", () => {
  test("embedding cache オブジェクトを生成する", () => {
    const result = createHypothesesEmbeddingCache(hypothesisItems);

    expect(result.items).toHaveProperty("contract-nli:hypothesis:nda-1");
    expect(result.totalTokens).toBe(600);
  });
});

const documentItems: DocumentEmbeddingItem[] = [
  {
    key: "contract-nli:document:1:span:0",
    documentId: 1,
    spanIndex: 0,
    embedding: [],
    tokens: 200,
  },
  {
    key: "contract-nli:document:1:span:1",
    documentId: 1,
    spanIndex: 1,
    embedding: [],
    tokens: 300,
  },
  {
    key: "contract-nli:document:2:span:0",
    documentId: 2,
    spanIndex: 0,
    embedding: [],
    tokens: 500,
  },
];

const hypothesisItems: HypothesisEmbeddingItem[] = [
  { key: "contract-nli:hypothesis:nda-1", hypothesisId: "nda-1", embedding: [], tokens: 100 },
  { key: "contract-nli:hypothesis:nda-2", hypothesisId: "nda-2", embedding: [], tokens: 200 },
  { key: "contract-nli:hypothesis:nda-3", hypothesisId: "nda-3", embedding: [], tokens: 300 },
];

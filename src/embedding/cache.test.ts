import { expect, test } from "vitest";

import type { EmbeddingItem } from "./types.js";
import { createEmbeddingCache } from "./cache.js";

const INPUT_FILE_PATH = "example/sample.json";
const MODEL = "example_model";
const DIMENSIONS = 6;
const embedding = Array.from({ length: DIMENSIONS }, () => 0);

test("embedding cache オブジェクトを生成する", () => {
  const result = createEmbeddingCache(INPUT_FILE_PATH, MODEL, embeddingItems);

  expect(result.source.inputFile).toBe(INPUT_FILE_PATH);
  expect(result.embedding.model).toBe(MODEL);
  expect(result.embedding.dimensions).toBe(DIMENSIONS);
  expect(result.items).toHaveProperty("contract-nli:1:span:0");
  expect(result.embedding.totalTokens).toBe(1000);
});

const embeddingItems: EmbeddingItem[] = [
  {
    key: "contract-nli:1:span:0",
    documentId: 1,
    spanIndex: 0,
    embedding,
    tokens: 200,
  },
  {
    key: "contract-nli:1:span:1",
    documentId: 1,
    spanIndex: 1,
    embedding,
    tokens: 300,
  },
  {
    key: "contract-nli:2:span:0",
    documentId: 2,
    spanIndex: 0,
    embedding,
    tokens: 500,
  },
];

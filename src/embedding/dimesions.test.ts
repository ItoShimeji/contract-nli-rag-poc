import { describe, expect, test } from "vitest";

import type { DocumentEmbeddingItem } from "./types.js";
import { getEmbeddingDimensions } from "./dimesions.js";

const DIMENSIONS = 1000;
const embedding = Array.from({ length: DIMENSIONS }, () => 0);

describe("getEmbeddingDimensions", () => {
  test("埋め込みの次元数を取得する", () => {
    expect(getEmbeddingDimensions([])).toBe(0);
    expect(getEmbeddingDimensions(embeddingItems)).toBe(DIMENSIONS);
  });
});

const embeddingItems: DocumentEmbeddingItem[] = [
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

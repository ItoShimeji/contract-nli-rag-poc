import type { EmbeddingItem, EmbeddingCacheItem, EmbeddingCache } from "./types.js";

// ファイルに書き出すキャッシュの JS オブジェクトを作成
export function createEmbeddingCache(
  inputFilePath: string,
  model: string,
  embeddingItems: EmbeddingItem[],
): EmbeddingCache {
  const items: Record<string, EmbeddingCacheItem> = {};

  for (const e of embeddingItems) {
    items[e.key] = {
      documentId: e.documentId,
      spanIndex: e.spanIndex,
      embedding: e.embedding,
    };
  }

  const now = new Date().toISOString();

  return {
    version: 1,
    source: {
      dataset: "contract-nli",
      inputFile: inputFilePath,
    },
    embedding: {
      provider: "openai",
      model,
      dimensions: embeddingItems[0]?.embedding.length ?? 0,
    },
    createdAt: now,
    items,
  };
}

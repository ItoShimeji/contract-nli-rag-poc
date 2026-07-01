import type {
  EmbeddingMetadata,
  DocumentEmbeddingItem,
  DocumentsEmbeddingCache,
  DocumentEmbeddingCacheItem,
  HypothesisEmbeddingItem,
  HypothesesEmbeddingCache,
  HypothesisEmbeddingCacheItem,
} from "./types.js";

// ファイルに書き出すキャッシュの JS オブジェクトを作成
export function createEmbeddingCacheMetadata(
  inputFilePath: string,
  model: string,
  dimensions: number,
): EmbeddingMetadata {
  return {
    version: 1,
    source: {
      dataset: "contract-nli",
      inputFile: inputFilePath,
    },
    embedding: {
      provider: "openai",
      model,
      dimensions,
    },
    createdAt: new Date().toISOString(),
  };
}

export function createDocumentsEmbeddingCache(
  documentEmbeddingItems: DocumentEmbeddingItem[],
): DocumentsEmbeddingCache {
  const items: Record<string, DocumentEmbeddingCacheItem> = {};
  let totalTokens = 0;

  for (const e of documentEmbeddingItems) {
    items[e.key] = {
      documentId: e.documentId,
      spanIndex: e.spanIndex,
      embedding: e.embedding,
    };
    totalTokens += e.tokens;
  }

  return {
    totalTokens,
    items,
  };
}

export function createHypothesesEmbeddingCache(
  hypothesisEmbeddingItems: HypothesisEmbeddingItem[],
): HypothesesEmbeddingCache {
  const items: Record<string, HypothesisEmbeddingCacheItem> = {};
  let totalTokens = 0;

  for (const e of hypothesisEmbeddingItems) {
    items[e.key] = {
      hypothesisId: e.hypothesisId,
      embedding: e.embedding,
    };
    totalTokens += e.tokens;
  }

  return {
    totalTokens,
    items,
  };
}

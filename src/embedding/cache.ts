import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

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

// キャッシュをファイルに書き出し
export async function saveEmbeddingCache(cachePath: string, cache: EmbeddingCache) {
  await mkdir(path.dirname(cachePath), { recursive: true });

  const tmpPath = `${cachePath}.tmp`;

  await writeFile(tmpPath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  await rename(tmpPath, cachePath);
}

import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EmbeddingCache } from "./types.js";

// キャッシュをファイルに書き出し
export async function saveEmbeddingCache(cachePath: string, cache: EmbeddingCache) {
  await mkdir(path.dirname(cachePath), { recursive: true });

  const tmpPath = `${cachePath}.tmp`;

  await writeFile(tmpPath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  await rename(tmpPath, cachePath);
}

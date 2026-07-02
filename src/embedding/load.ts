import { loadJson } from "../load.js";
import type {
  DocumentsEmbeddingCache,
  EmbeddingData,
  EmbeddingMetadata,
  HypothesesEmbeddingCache,
} from "./types.js";
import { createEmbeddingCachePath } from "./path.js";

export async function loadEmbeddingCache(
  embeddingDir: string,
  model: string,
): Promise<EmbeddingData> {
  const {
    metadata: metadataPath,
    documents: documentsPath,
    hypotheses: hypothesesPath,
  } = createEmbeddingCachePath(embeddingDir, model);

  // 並行でファイルを取得
  const [metadata, documents, hypotheses] = await Promise.all([
    loadJson<EmbeddingMetadata>(metadataPath),
    loadJson<DocumentsEmbeddingCache>(documentsPath),
    loadJson<HypothesesEmbeddingCache>(hypothesesPath),
  ]);

  return {
    metadata,
    documents,
    hypotheses,
  };
}

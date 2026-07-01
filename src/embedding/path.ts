export function createEmbeddingCachePath(
  embeddingDir: string,
  model: string,
): {
  metadata: string;
  documents: string;
  hypotheses: string;
} {
  return {
    metadata: `${embeddingDir}/${model}/metadata.json`,
    documents: `${embeddingDir}/${model}/documents.json`,
    hypotheses: `${embeddingDir}/${model}/hypotheses.json`,
  };
}

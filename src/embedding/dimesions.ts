import type { DocumentEmbeddingItem } from "./types.js";

export function getEmbeddingDimensions(items: DocumentEmbeddingItem[]): number {
  return items[0]?.embedding.length ?? 0;
}

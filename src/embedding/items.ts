import { splitChunks } from "../contract-nli/chunk.js";
import type { Document } from "../contract-nli/types.js";
import type { Embed, EmbeddingItem } from "./types.js";

export async function createEmbeddingItems(
  documents: Document[],
  embeddingModel: string,
  embed: Embed,
): Promise<EmbeddingItem[]> {
  const embeddingItems: EmbeddingItem[] = [];
  for (const document of documents) {
    const chunks = splitChunks(document.text, document.spans);
    const embeddingResults = await embed(chunks, embeddingModel);

    for (const result of embeddingResults) {
      embeddingItems.push({
        key: `contract-nli:${document.id}:span:${result.index}`,
        documentId: document.id,
        spanIndex: result.index,
        embedding: result.embedding,
      });
    }
  }

  return embeddingItems;
}

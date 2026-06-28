import { splitChunks } from "../contract-nli/chunk.js";
import type { Document } from "../contract-nli/types.js";
import { embed } from "./embed.js";
import type { EmbeddingItem } from "./types.js";

export async function createEmbeddingItems(
  validatedDocuments: Document[],
  embeddingModel: string,
): Promise<EmbeddingItem[]> {
  const embeddingItems: EmbeddingItem[] = [];
  for (const document of validatedDocuments) {
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

import type OpenAI from "openai";

import { splitChunks } from "../contract-nli/chunk.js";
import type { Document } from "../contract-nli/types.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import type { Embed, EmbeddingItem } from "./types.js";

export async function createEmbeddingItems(
  openai: OpenAI,
  documents: Document[],
  embeddingModel: string,
  embed: Embed,
  progress: ProgressReporter = noopProgress,
): Promise<EmbeddingItem[]> {
  const embeddingItems: EmbeddingItem[] = [];

  progress.start(`Embedding documents: ${documents.length}`);

  for (const [index, document] of documents.entries()) {
    progress.update(`[${index + 1}/${documents.length}] document ${document.id}`);

    const chunks = splitChunks(document.text, document.spans);
    const { results, tokens } = await embed(openai, chunks, embeddingModel);

    for (const result of results) {
      embeddingItems.push({
        key: `contract-nli:${document.id}:span:${result.index}`,
        documentId: document.id,
        spanIndex: result.index,
        embedding: result.embedding,
        tokens,
      });
    }
  }

  progress.update(`Created embedding items: ${embeddingItems.length}`);

  return embeddingItems;
}

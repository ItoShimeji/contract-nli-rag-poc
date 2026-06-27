import OpenAI from "openai";

import type { Document } from "../types.js";
import type { EmbeddingItem } from "./types.js";
import { splitChunks } from "../dataset.js";

const openai = new OpenAI();

type EmbeddingResult = { index: number; embedding: number[] }[];

// document の chunk 列を埋め込み化
export async function embed(input: string[], model: string): Promise<EmbeddingResult> {
  // input 配列に対する結果が res.data に配列で入る
  const res = await openai.embeddings.create({
    model,
    input,
  });

  return res.data.map((d) => ({
    index: d.index,
    embedding: d.embedding,
  }));
}

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

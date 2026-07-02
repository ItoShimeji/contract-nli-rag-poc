import type OpenAI from "openai";

import type { Document, Hypothesis } from "../contract-nli/types.js";
import type { Embed, DocumentEmbeddingItem, HypothesisEmbeddingItem } from "./types.js";
import { splitChunks } from "../contract-nli/chunk.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import { createDocumentKey, createHypothesisKey } from "./key.js";

export async function createDocumentEmbeddingItems(
  openai: OpenAI,
  documents: Document[],
  embeddingModel: string,
  embed: Embed,
  progress: ProgressReporter = noopProgress,
): Promise<DocumentEmbeddingItem[]> {
  const embeddingItems: DocumentEmbeddingItem[] = [];

  progress.start(`Embedding documents: ${documents.length}`);

  for (const [index, document] of documents.entries()) {
    progress.update(`[${index + 1}/${documents.length}] document ${document.id}`);

    const chunkTexts = splitChunks(document.text, document.spans).map((chunk) => chunk.text);
    const { results, tokens } = await embed(openai, chunkTexts, embeddingModel);

    for (const result of results) {
      embeddingItems.push({
        key: createDocumentKey(document.id, result.index),
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

export async function createHypothesisEmbeddingItems(
  openai: OpenAI,
  hypotheses: Hypothesis[],
  embeddingModel: string,
  embed: Embed,
  progress: ProgressReporter = noopProgress,
): Promise<HypothesisEmbeddingItem[]> {
  const embeddingItems: HypothesisEmbeddingItem[] = [];

  progress.start(`Embedding hypotheses: ${hypotheses.length}`);

  const embeddingInput = hypotheses.map(({ text }) => text);

  const { results, tokens } = await embed(openai, embeddingInput, embeddingModel);

  for (const result of results) {
    const id = hypotheses[result.index]!.id;

    embeddingItems.push({
      key: createHypothesisKey(id),
      hypothesisId: id,
      embedding: result.embedding,
      tokens,
    });
  }

  progress.update(`Created embedding items: ${embeddingItems.length}`);

  return embeddingItems;
}

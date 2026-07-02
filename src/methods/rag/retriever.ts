import type { EmbeddingCache } from "../../embedding/types.js";
import type { CalcSimilarity } from "./types.js";
import type { DocumentsEmbeddingCache } from "../../embedding/types.js";
import { createHypothesisKey } from "../../embedding/key.js";

type RetrieverInput = {
  documentId: number;
  hypothesisId: string;
};

type Retriever = (input: RetrieverInput) => number[];

export type DocumentSpanEmbeddingsByDocumentId = Record<
  number,
  Array<{ index: number; embedding: number[] }>
>;

// retriever をクロージャとして生成
export function createEmbeddingRetriever(
  topK: number,
  cache: EmbeddingCache,
  calcSimilarity: CalcSimilarity,
): Retriever {
  const documentsRecord = createDocumentSpanEmbeddingsByDocumentId(cache.documents);

  return (input) =>
    retrieve(topK, calcSimilarity, {
      hypothesis: cache.hypotheses.items[createHypothesisKey(input.hypothesisId)]!.embedding,
      spans: documentsRecord[input.documentId]!,
    });
}

// ドキュメントの id ごとに span の配列を作成
export function createDocumentSpanEmbeddingsByDocumentId(
  documents: DocumentsEmbeddingCache,
): DocumentSpanEmbeddingsByDocumentId {
  const record: DocumentSpanEmbeddingsByDocumentId = {};

  for (const value of Object.values(documents.items)) {
    (record[value.documentId] ??= []).push({
      index: value.spanIndex,
      embedding: value.embedding,
    });
  }

  return record;
}

// top k の span id を返す
export function retrieve(
  topK: number,
  calcSimilarity: CalcSimilarity,
  embeddings: { hypothesis: number[]; spans: Array<{ index: number; embedding: number[] }> },
): number[] {
  if (embeddings.spans.length < topK) {
    throw new Error("top k を計算するのに十分な span の数がありません");
  }

  return embeddings.spans
    .map(({ index, embedding }) => ({
      index,
      similarity: calcSimilarity(embeddings.hypothesis, embedding),
    }))
    .toSorted((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(({ index }) => index);
}

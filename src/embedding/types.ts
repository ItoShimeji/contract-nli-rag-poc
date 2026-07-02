import type OpenAI from "openai";

type EmbeddingResult = { results: { index: number; embedding: number[] }[]; tokens: number };

export type Embed = (openai: OpenAI, input: string[], model: string) => Promise<EmbeddingResult>;

export type DocumentEmbeddingItem = {
  key: string;
  documentId: number;
  spanIndex: number;
  embedding: number[];
  tokens: number;
};

export type HypothesisEmbeddingItem = {
  key: string;
  hypothesisId: string;
  embedding: number[];
  tokens: number;
};

export type EmbeddingData = EmbeddingCache & {
  metadata: EmbeddingMetadata;
};

export type EmbeddingCache = {
  documents: DocumentsEmbeddingCache;
  hypotheses: HypothesesEmbeddingCache;
};

export type EmbeddingMetadata = {
  version: 1;
  source: {
    dataset: "contract-nli";
    inputFile: string;
  };
  embedding: {
    provider: "openai";
    model: string;
    dimensions: number;
  };
  createdAt: string;
};

export type DocumentsEmbeddingCache = {
  totalTokens: number;
  items: Record<string, DocumentEmbeddingCacheItem>;
};

export type DocumentEmbeddingCacheItem = {
  documentId: number;
  spanIndex: number;
  embedding: number[];
};

export type HypothesesEmbeddingCache = {
  totalTokens: number;
  items: Record<string, HypothesisEmbeddingCacheItem>;
};

export type HypothesisEmbeddingCacheItem = {
  hypothesisId: string;
  embedding: number[];
};

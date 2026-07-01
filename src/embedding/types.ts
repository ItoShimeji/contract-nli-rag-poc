import type OpenAI from "openai";

type EmbeddingResult = { results: { index: number; embedding: number[] }[]; tokens: number };

export type Embed = (openai: OpenAI, input: string[], model: string) => Promise<EmbeddingResult>;

export type EmbeddingItem = {
  key: string;
  documentId: number;
  spanIndex: number;
  embedding: number[];
  tokens: number;
};

export type EmbeddingCacheItem = {
  documentId: number;
  spanIndex: number;
  embedding: number[];
};

export type EmbeddingCache = {
  version: 1;
  source: {
    dataset: "contract-nli";
    inputFile: string;
  };
  embedding: {
    provider: "openai";
    model: string;
    dimensions: number;
    totalTokens: number;
  };
  createdAt: string;
  items: Record<string, EmbeddingCacheItem>;
};

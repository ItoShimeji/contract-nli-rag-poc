type EmbeddingResult = { index: number; embedding: number[] }[];

export type Embed = (input: string[], model: string) => Promise<EmbeddingResult>;

export type EmbeddingItem = {
  key: string;
  documentId: number;
  spanIndex: number;
  embedding: number[];
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
  };
  createdAt: string;
  items: Record<string, EmbeddingCacheItem>;
};

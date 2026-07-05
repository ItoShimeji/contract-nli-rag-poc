export type ExperimentConfig = {
  generationModel: string;
  embeddingModel: string;
  dataPath: string;
  embeddingDir: string;
  resultDir: string;
  rag: {
    simpleTopK: number;
    rerankerCandidateTopK: number;
    rerankerTopK: number;
  };
  execution: {
    methodConcurrency: number;
  };
};

export const config: ExperimentConfig = {
  generationModel: "gpt-5.4-mini",
  embeddingModel: "text-embedding-3-large",
  dataPath: "data/sample.json",
  embeddingDir: "data/cache/embedding",
  resultDir: "results",
  rag: {
    simpleTopK: 8,
    rerankerCandidateTopK: 16,
    rerankerTopK: 8,
  },
  execution: {
    methodConcurrency: 10,
  },
};

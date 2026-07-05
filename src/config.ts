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
  generationModel: "gpt-5.4-nano",
  embeddingModel: "text-embedding-3-small",
  dataPath: "data/sample.json",
  embeddingDir: "data/cache/embedding",
  resultDir: "results",
  rag: {
    simpleTopK: 5,
    rerankerCandidateTopK: 20,
    rerankerTopK: 5,
  },
  execution: {
    methodConcurrency: 3,
  },
};

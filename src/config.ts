export type ExperimentConfig = {
  generationModel: string;
  embeddingModel: string;
  dataPath: string;
  cachePath: string;
  resultDir: string;
  topK: number;
};

export const config: ExperimentConfig = {
  generationModel: "gpt-5-mini",
  embeddingModel: "text-embedding-3-small",
  dataPath: "data/sample.json",
  cachePath: "data/cache/cache.json",
  resultDir: "result",
  topK: 3,
};

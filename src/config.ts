export type ExperimentConfig = {
  generationModel: string;
  embeddingModel: string;
  dataPath: string;
  cachePath: string;
  resultDir: string;
  topK: number;
};

export const config: ExperimentConfig = {
  generationModel: "gpt-5.4-nano",
  embeddingModel: "text-embedding-3-small",
  dataPath: "data/sample-min.json",
  cachePath: "data/cache/cache.json",
  resultDir: "result",
  topK: 3,
};

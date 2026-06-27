type ExperimentConfig = {
  generationModel: string;
  embeddingModel: string;
  dataPath: string;
  cachePath: string;
  topK: number;
};

export const config: ExperimentConfig = {
  generationModel: "gpt-5-mini",
  embeddingModel: "text-embedding-3-small",
  dataPath: "data/sample.json",
  cachePath: "data/cache/cache.json",
  topK: 3,
};

import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createRagMethod } from "../methods/rag/index.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import { saveResult } from "../results/save.js";
import { loadEmbeddingCache } from "../embedding/load.js";
import { runPredictionMethod } from "./helpers/runPredictionMethod.js";
import type { RagPipeline } from "../methods/rag/types.js";

export const runRagMethod: Usecase<
  [openai: OpenAI, pipeline: RagPipeline, progress?: ProgressReporter]
> = async (config, openai, pipeline, progress = noopProgress) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

  const { documents: documentsEmbedding, hypotheses: hypothesesEmbedding } =
    await loadEmbeddingCache(config.embeddingDir, config.embeddingModel);

  const method = createRagMethod(
    {
      model: config.generationModel,
      pipeline,
      simpleTopK: config.rag.simpleTopK,
      rerankerCandidateTopK: config.rag.rerankerCandidateTopK,
      rerankerTopK: config.rag.rerankerTopK,
    },
    openai,
    {
      documents: documentsEmbedding,
      hypotheses: hypothesesEmbedding,
    },
  );

  const results = await runPredictionMethod({
    run: method.run,
    progress,
    input: { documents, hypotheses },
  });

  await saveResult(
    config.resultDir,
    documents,
    { name: method.name, config: method.config },
    results,
  );
  progress.finish(`Saved ${method.name} results: ${results.length}`);
};

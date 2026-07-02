import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createRagMethod } from "../methods/rag/index.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import { saveResult } from "../results/save.js";
import { loadEmbeddingCache } from "../embedding/load.js";
import { runPredictionMethod } from "./helpers/runPredictionMethod.js";

export const runRagMethod: Usecase<[openai: OpenAI, progress?: ProgressReporter]> = async (
  config,
  openai,
  progress = noopProgress,
) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

  const { documents: documentsEmbedding, hypotheses: hypothesesEmbedding } =
    await loadEmbeddingCache(config.embeddingDir, config.embeddingModel);

  const method = createRagMethod({ model: config.generationModel, topK: config.topK }, openai, {
    documents: documentsEmbedding,
    hypotheses: hypothesesEmbedding,
  });

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
  progress.finish(`Saved direct results: ${results.length}`);
};

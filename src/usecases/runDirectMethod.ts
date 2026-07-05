import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createDirectMethod } from "../methods/direct/index.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import { saveResult } from "../results/save.js";
import { runPredictionMethod } from "./helpers/runPredictionMethod.js";

export const runDirectMethod: Usecase<[openai: OpenAI, progress?: ProgressReporter]> = async (
  config,
  openai,
  progress = noopProgress,
) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

  const method = createDirectMethod({ model: config.generationModel }, openai);

  const results = await runPredictionMethod({
    run: method.run,
    progress,
    concurrency: config.execution.methodConcurrency,
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

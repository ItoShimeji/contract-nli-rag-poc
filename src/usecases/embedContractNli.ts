import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createEmbeddingCache } from "../embedding/cache.js";
import { embed } from "../embedding/embed.js";
import { createEmbeddingItems } from "../embedding/items.js";
import { saveEmbeddingCache } from "../embedding/store.js";
import { noopProgress, type ProgressReporter } from "../progress.js";

export const embedContractNli: Usecase<[openai: OpenAI, progress?: ProgressReporter]> = async (
  config,
  openai,
  progress = noopProgress,
) => {
  const { documents } = await loadContractNliDataset(config.dataPath);
  const embeddingItems = await createEmbeddingItems(
    openai,
    documents,
    config.embeddingModel,
    embed,
    progress,
  );
  const embeddingCache = createEmbeddingCache(
    config.dataPath,
    config.embeddingModel,
    embeddingItems,
  );

  await saveEmbeddingCache(config.cachePath, embeddingCache);
  progress.finish(`Saved embedding cache: ${config.cachePath}`);
};

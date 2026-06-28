import type { ExperimentConfig } from "../config.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createEmbeddingCache, saveEmbeddingCache } from "../embedding/cache.js";
import { createEmbeddingItems } from "../embedding/embed.js";

export async function embedContractNli(config: ExperimentConfig): Promise<void> {
  const { documents } = await loadContractNliDataset(config.dataPath);
  const embeddingItems = await createEmbeddingItems(documents, config.embeddingModel);
  const embeddingCache = createEmbeddingCache(
    config.dataPath,
    config.embeddingModel,
    embeddingItems,
  );

  await saveEmbeddingCache(config.cachePath, embeddingCache);
}

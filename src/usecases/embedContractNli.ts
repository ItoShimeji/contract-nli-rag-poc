import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createEmbeddingCache } from "../embedding/cache.js";
import { embed } from "../embedding/embed.js";
import { createEmbeddingItems } from "../embedding/items.js";
import { saveEmbeddingCache } from "../embedding/store.js";

export const embedContractNli: Usecase = async (config) => {
  const { documents } = await loadContractNliDataset(config.dataPath);
  const embeddingItems = await createEmbeddingItems(documents, config.embeddingModel, embed);
  const embeddingCache = createEmbeddingCache(
    config.dataPath,
    config.embeddingModel,
    embeddingItems,
  );

  await saveEmbeddingCache(config.cachePath, embeddingCache);
};

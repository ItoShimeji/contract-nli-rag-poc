import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import {
  createDocumentsEmbeddingCache,
  createEmbeddingCacheMetadata,
  createHypothesesEmbeddingCache,
} from "../embedding/cache.js";
import { embed } from "../embedding/embed.js";
import {
  createDocumentEmbeddingItems,
  createHypothesisEmbeddingItems,
} from "../embedding/items.js";
import { createEmbeddingCachePath } from "../embedding/path.js";
import { saveJson } from "../save.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import { getEmbeddingDimensions } from "../embedding/dimesions.js";

export const embedContractNli: Usecase<[openai: OpenAI, progress?: ProgressReporter]> = async (
  config,
  openai,
  progress = noopProgress,
) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);
  const path = createEmbeddingCachePath(config.embeddingDir, config.embeddingModel);

  // document 内で設定する
  let dimensions = 0;

  // document の埋め込み
  {
    const embeddingItems = await createDocumentEmbeddingItems(
      openai,
      documents,
      config.embeddingModel,
      embed,
      progress,
    );
    const embeddingCache = createDocumentsEmbeddingCache(embeddingItems);
    await saveJson(path.documents, embeddingCache);

    dimensions = getEmbeddingDimensions(embeddingItems);
  }

  // hypothesis の埋め込み
  {
    const embeddingItems = await createHypothesisEmbeddingItems(
      openai,
      hypotheses,
      config.embeddingModel,
      embed,
      progress,
    );
    const embeddingCache = createHypothesesEmbeddingCache(embeddingItems);
    await saveJson(path.hypotheses, embeddingCache);
  }

  // metadata
  {
    const metadata = createEmbeddingCacheMetadata(
      config.dataPath,
      config.embeddingModel,
      dimensions,
    );

    await saveJson(path.metadata, metadata);
  }

  progress.finish(`Saved embedding cache: ${config.embeddingDir}`);
};

import { cli, define } from "gunshi";

import { config } from "./config.js";
import { createEmbeddingCache, saveEmbeddingCache } from "./embedding/cache.js";
import { createEmbeddingItems } from "./embedding/embed.js";
import { loadContractNliDataset } from "./dataset.js";

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: async () => {
    // データセットからドキュメントを読み込み
    const validatedDocuments = await loadContractNliDataset(config.dataPath);

    // 埋め込みベクトルを取得
    const embeddingItems = await createEmbeddingItems(validatedDocuments, config.embeddingModel);

    // キャッシュオブジェクトを生成
    const embeddingCache = createEmbeddingCache(
      config.dataPath,
      config.embeddingModel,
      embeddingItems,
    );

    // キャッシュを保存
    await saveEmbeddingCache(config.cachePath, embeddingCache);
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: () => {
    console.error("todo");
  },
});

const mainCommand = define({
  name: "rag",
  description: "Contract NLI RAG POC",
  run: () => {
    console.log("Use a sub-command: embed or direct");
  },
});

await cli(process.argv.slice(2), mainCommand, {
  name: "rag",
  version: "0.0.1",
  subCommands: {
    embed: embedCommand,
    direct: directCommand,
  },
});

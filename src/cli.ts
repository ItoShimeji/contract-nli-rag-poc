import { cli, define } from "gunshi";

import { config } from "./config.js";
import { loadContractNliDataset } from "./contract-nli/load.js";
import { createDirectMethod } from "./methods/direct/index.js";
import type { PredictionResult } from "./methods/types.js";
import { embedContractNli } from "./usecases/embedContractNli.js";

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: async () => {
    await embedContractNli(config);
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: async () => {
    const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

    const method = createDirectMethod({ model: config.generationModel });

    const results: PredictionResult[] = [];

    for (const document of documents) {
      const documentInput = {
        id: document.id,
        text: document.text,
        spans: document.spans,
      };

      for (const hypothesis of hypotheses) {
        const example = {
          hypothesisId: hypothesis.id,
          hypothesis: hypothesis.text,
        };

        // ドキュメント & 仮説 を直列で一つずつ実行
        const result = await method.run({ example, document: documentInput });
        results.push(result);
      }
    }

    console.log({ documents, hypotheses });
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

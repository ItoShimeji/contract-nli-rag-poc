import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createDirectMethod } from "../methods/direct/index.js";
import type { ResultInput } from "../results/types.js";
import { saveResult } from "../results/save.js";

export const runDirectMethod: Usecase = async (config) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

  const method = createDirectMethod({ model: config.generationModel });

  const results: ResultInput[] = [];

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
      results.push({ documentId: document.id, hypothesisId: hypothesis.id, prediction: result });
    }
  }

  await saveResult(
    config.resultDir,
    documents,
    { name: method.name, config: method.config },
    results,
  );
};

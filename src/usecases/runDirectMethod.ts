import type OpenAI from "openai";

import type { Usecase } from "./types.js";
import { loadContractNliDataset } from "../contract-nli/load.js";
import { createDirectMethod } from "../methods/direct/index.js";
import { noopProgress, type ProgressReporter } from "../progress.js";
import type { ResultInput } from "../results/types.js";
import { saveResult } from "../results/save.js";

export const runDirectMethod: Usecase<[openai: OpenAI, progress?: ProgressReporter]> = async (
  config,
  openai,
  progress = noopProgress,
) => {
  const { documents, hypotheses } = await loadContractNliDataset(config.dataPath);

  const method = createDirectMethod({ model: config.generationModel }, openai);

  const results: ResultInput[] = [];
  const total = documents.length * hypotheses.length;
  let current = 0;

  progress.start(`Running direct: ${total} examples`);

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

      current += 1;
      const progressLabel = `[${current}/${total}] document ${document.id}, hypothesis ${hypothesis.id}`;
      progress.update(`Started ${progressLabel}`);

      // ドキュメント & 仮説 を直列で一つずつ実行
      const result = await method.run({ example, document: documentInput });
      progress.update(`Finished ${progressLabel} (${Math.round(result.latency.totalMs)}ms)`);
      results.push({ documentId: document.id, hypothesisId: hypothesis.id, prediction: result });
    }
  }

  await saveResult(
    config.resultDir,
    documents,
    { name: method.name, config: method.config },
    results,
  );
  progress.finish(`Saved direct results: ${results.length}`);
};

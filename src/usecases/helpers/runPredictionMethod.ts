import type { Document, Hypothesis } from "../../contract-nli/types.js";
import type { runMethod } from "../../methods/types.js";
import type { ProgressReporter } from "../../progress.js";
import type { ResultInput } from "../../results/types.js";

type runPredictionMethodProps = {
  run: runMethod;
  progress: ProgressReporter;
  input: {
    documents: Document[];
    hypotheses: Hypothesis[];
  };
};

export async function runPredictionMethod({
  run,
  progress,
  input,
}: runPredictionMethodProps): Promise<ResultInput[]> {
  const { documents, hypotheses } = input;
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
      const result = await run({ example, document: documentInput });
      progress.update(`Finished ${progressLabel} (${Math.round(result.latency.totalMs)}ms)`);
      results.push({ documentId: document.id, hypothesisId: hypothesis.id, prediction: result });
    }
  }

  return results;
}

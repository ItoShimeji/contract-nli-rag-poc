import type { Document, Hypothesis } from "../../contract-nli/types.js";
import type { runMethod } from "../../methods/types.js";
import type { ProgressReporter } from "../../progress.js";
import type { ResultInput } from "../../results/types.js";
import type { PredictionInput } from "../../methods/types.js";

type runPredictionMethodProps = {
  run: runMethod;
  progress: ProgressReporter;
  concurrency: number;
  input: {
    documents: Document[];
    hypotheses: Hypothesis[];
  };
};

type PredictionTask = {
  index: number;
  documentId: number;
  hypothesisId: string;
  input: PredictionInput;
};

export async function runPredictionMethod({
  run,
  progress,
  concurrency,
  input,
}: runPredictionMethodProps): Promise<ResultInput[]> {
  const tasks = createPredictionTasks(input.documents, input.hypotheses);
  const results: Array<ResultInput | undefined> = Array.from({ length: tasks.length });
  const workerCount = Math.min(normalizeConcurrency(concurrency), tasks.length);
  let nextTaskIndex = 0;
  let finished = 0;

  progress.start(`Running method: ${tasks.length} examples, concurrency ${workerCount}`);

  async function worker(): Promise<void> {
    while (nextTaskIndex < tasks.length) {
      const task = tasks[nextTaskIndex]!;
      nextTaskIndex += 1;

      const progressLabel = `[${task.index + 1}/${tasks.length}] document ${task.documentId}, hypothesis ${task.hypothesisId}`;
      progress.update(`Started ${progressLabel}`);

      const result = await run(task.input);
      results[task.index] = {
        documentId: task.documentId,
        hypothesisId: task.hypothesisId,
        prediction: result,
      };

      finished += 1;
      progress.update(
        `Finished ${progressLabel} (${Math.round(result.latency.totalMs)}ms, completed ${finished}/${tasks.length})`,
      );
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results.map((result) => {
    if (!result) {
      throw new Error("prediction result が見つかりません");
    }

    return result;
  });
}

function createPredictionTasks(documents: Document[], hypotheses: Hypothesis[]): PredictionTask[] {
  const tasks: PredictionTask[] = [];

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

      tasks.push({
        index: tasks.length,
        documentId: document.id,
        hypothesisId: hypothesis.id,
        input: { example, document: documentInput },
      });
    }
  }

  return tasks;
}

function normalizeConcurrency(concurrency: number): number {
  if (!Number.isFinite(concurrency)) {
    return 1;
  }

  return Math.max(1, Math.floor(concurrency));
}

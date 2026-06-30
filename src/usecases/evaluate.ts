import type { Usecase } from "./types.js";
import { loadResult } from "../results/load.js";
import { getEvaluationSummaryFilePath, getResultFilePath } from "../results/path.js";
import { createEvaluationSummary } from "../evaluation/summary.js";
import { writeEvaluationSummary } from "../evaluation/write.js";

export const evaluate: Usecase<[inputMethod: string]> = async (config, inputMethod) => {
  const resultPath = getResultFilePath(config.resultDir, inputMethod);
  const { method, records } = await loadResult(resultPath);

  const summary = createEvaluationSummary(records);

  const summaryPath = getEvaluationSummaryFilePath(config.resultDir, method.name);

  await writeEvaluationSummary(summaryPath, summary);
};

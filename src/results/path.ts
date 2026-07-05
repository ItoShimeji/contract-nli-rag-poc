export function getResultFilePath(resultDir: string, model: string, methodName: string): string {
  return `${resultDir}/${model}/${methodName}.json`;
}

export function getEvaluationSummaryFilePath(
  resultDir: string,
  model: string,
  methodName: string,
): string {
  return `${resultDir}/${model}/${methodName}.summary.json`;
}

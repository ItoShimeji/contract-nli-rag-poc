export function getResultFilePath(resultDir: string, methodName: string): string {
  return `${resultDir}/${methodName}.json`;
}

export function getEvaluationSummaryFilePath(resultDir: string, methodName: string): string {
  return `${resultDir}/${methodName}.summary.json`;
}

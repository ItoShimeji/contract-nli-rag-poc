import type { ResultRecord } from "../../../results/types.js";
import type { IsCorrect } from "./types.js";

export function countCorrect(isCorrect: IsCorrect, records: ResultRecord[]): number {
  return records.filter((record) =>
    isCorrect(record.goldEvidenceSpanIds, record.predictedEvidenceSpanIds),
  ).length;
}

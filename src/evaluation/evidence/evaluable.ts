import type { ResultRecord } from "../../results/types.js";

export function isEvidenceEvaluable(record: ResultRecord): boolean {
  return record.goldLabel !== "NotMentioned";
}

import { divideOrNull } from "../../metric.js";
import type { Prediction } from "../../methods/types.js";
import type { ResultRecord } from "../../results/types.js";
import { isExactMatch } from "../evidence/spanIds/exactMatch.js";
import type { VerifierEvaluationSummary } from "../types.js";

export function createVerifierEvaluationSummary(
  records: ResultRecord[],
): VerifierEvaluationSummary | undefined {
  const verifiedRecords = records.filter((record) => record.stages?.verify);

  if (verifiedRecords.length === 0) {
    return undefined;
  }

  let acceptCount = 0;
  let reviseCount = 0;
  let helpfulRevisionCount = 0;
  let harmfulRevisionCount = 0;
  let unchangedCorrectCount = 0;
  let unchangedWrongCount = 0;

  for (const record of verifiedRecords) {
    const verify = record.stages!.verify!;
    if (verify.decision === "accept") {
      acceptCount += 1;
    } else {
      reviseCount += 1;
    }

    const beforeCorrect = isJointExactCorrect(record, verify.predictionBefore);
    const afterCorrect = isJointExactCorrect(record, verify.predictionAfter);

    if (!beforeCorrect && afterCorrect) {
      helpfulRevisionCount += 1;
    } else if (beforeCorrect && !afterCorrect) {
      harmfulRevisionCount += 1;
    } else if (beforeCorrect && afterCorrect) {
      unchangedCorrectCount += 1;
    } else {
      unchangedWrongCount += 1;
    }
  }

  return {
    total: verifiedRecords.length,
    acceptCount,
    reviseCount,
    revisionRate: divideOrNull(reviseCount, verifiedRecords.length),
    helpfulRevisionCount,
    harmfulRevisionCount,
    unchangedCorrectCount,
    unchangedWrongCount,
  };
}

function isJointExactCorrect(record: ResultRecord, prediction: Prediction): boolean {
  return (
    record.goldLabel === prediction.label &&
    isExactMatch(record.goldEvidenceSpanIds, prediction.evidenceSpanIds)
  );
}

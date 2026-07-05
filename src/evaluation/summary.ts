import type { ResultRecord } from "../results/types.js";
import { createEvidenceEvaluationSummary } from "./evidence/summary.js";
import { createJointEvaluationSummary } from "./joint/summary.js";
import { createLabelEvaluationSummary } from "./label/summary.js";
import { createLatencyEvaluationSummary } from "./runtime/latency.js";
import type { EvaluationSummary } from "./types.js";
import { createUsageEvaluationSummary } from "./runtime/usage.js";
import { createStageRuntimeEvaluationSummary } from "./runtime/stages.js";
import { createVerifierEvaluationSummary } from "./verifier/summary.js";

export function createEvaluationSummary(records: ResultRecord[]): EvaluationSummary {
  const total = records.length;
  const stages = createStageRuntimeEvaluationSummary(records);
  const verifier = createVerifierEvaluationSummary(records);

  const summary: EvaluationSummary = {
    total,
    label: createLabelEvaluationSummary(records),
    evidence: createEvidenceEvaluationSummary(records),
    joint: createJointEvaluationSummary(records),
    usage: createUsageEvaluationSummary(records),
    latency: createLatencyEvaluationSummary(records),
  };

  if (stages) {
    summary.stages = stages;
  }
  if (verifier) {
    summary.verifier = verifier;
  }

  return summary;
}

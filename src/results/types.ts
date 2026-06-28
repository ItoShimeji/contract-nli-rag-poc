import type { Label } from "../contract-nli/types.js";
import type { Usage, Latency } from "../methods/types.js";
import type { PredictionResult } from "../methods/types.js";

export type ResultInput = {
  documentId: number;
  hypothesisId: string;
  prediction: PredictionResult;
};

export type ResultFile = {
  method: {
    name: string;
    config: Record<string, unknown>;
  };
  records: ResultRecord[];
};

export type ResultRecord = {
  documentId: number;
  hypothesisId: string;
  goldLabel: Label;
  predictedLabel: Label;
  goldEvidenceSpanIds: number[];
  predictedEvidenceSpanIds: number[];
  usage: Usage;
  latency: Latency;
};

export type GoldAnnotation = {
  label: Label;
  spanIds: number[];
};

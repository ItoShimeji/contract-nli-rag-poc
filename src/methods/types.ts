import type OpenAI from "openai";

import type { Label } from "../contract-nli/types.js";

export type PredictionMethod = {
  name: string;
  // コードベースで管理できる config をここで保持するのは、それぞれの呼び出し方法で
  // どの設定をしようしたかを明示的に保存するため
  config: Record<string, unknown>;
  run: runMethod;
};

export type runMethod = (input: PredictionInput) => Promise<PredictionResult>;

export type LlmClient = (
  openai: OpenAI,
  model: string,
  systemPrompt: string,
  prompt: string,
) => Promise<{ prediction: Prediction; usage: Usage }>;

export type PredictionInput = {
  example: Example;
  document: DocumentInput;
};

type Example = {
  hypothesisId: string;
  hypothesis: string;
};

type DocumentInput = {
  id: number;
  text: string;
  spans: [number, number][];
};

export type Prediction = {
  label: Label;
  evidenceSpanIds: number[];
};

export type PredictionResult = Prediction & {
  usage: Usage;
  latency: Latency;
  stages?: PredictionStages;
};

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type Latency = {
  totalMs: number;
};

export type Chunk = { index: number; text: string };

export type PredictionStages = {
  retrieve?: RetrieveStageTrace;
  rerank?: RerankStageTrace;
  generate: GenerateStageTrace;
  verify?: VerifyStageTrace;
};

export type RetrievedSpan = {
  spanId: number;
  score: number;
};

export type RetrieveStageTrace = {
  latencyMs: number;
  spans: RetrievedSpan[];
};

export type RerankStageTrace = {
  usage: Usage;
  latencyMs: number;
  inputSpanIds: number[];
  outputSpanIds: number[];
};

export type GenerateStageTrace = {
  usage: Usage;
  latencyMs: number;
  prediction: Prediction;
};

export type VerifyStageTrace = {
  usage: Usage;
  latencyMs: number;
  decision: "accept" | "revise";
  predictionBefore: Prediction;
  predictionAfter: Prediction;
};

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

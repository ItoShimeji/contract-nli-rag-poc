import type { Prediction, Usage } from "../types.js";

export type DirectConfig = {
  model: string;
};

export type LlmClient = (
  model: string,
  prompt: string,
) => Promise<{ prediction: Prediction; usage: Usage }>;

export type DirectDeps = {
  llmClient: LlmClient;
};

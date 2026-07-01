import type OpenAI from "openai";

import type { Prediction, Usage } from "../types.js";

export type DirectConfig = {
  model: string;
};

export type LlmClient = (
  openai: OpenAI,
  model: string,
  prompt: string,
) => Promise<{ prediction: Prediction; usage: Usage }>;

export type DirectDeps = {
  openai: OpenAI;
  llmClient: LlmClient;
};

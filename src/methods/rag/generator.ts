import type OpenAI from "openai";

import type { Prediction, PredictionInput, Usage } from "../types.js";
import type { LlmClient } from "../types.js";
import { createPrompt, systemPrompt } from "./prompt.js";

export async function generatePrediction(
  openai: OpenAI,
  llmClient: LlmClient,
  model: string,
  input: PredictionInput,
  spanIds: number[],
): Promise<{ prediction: Prediction; usage: Usage }> {
  const prompt = createPrompt(input, spanIds);
  const result = await llmClient(openai, model, systemPrompt, prompt);

  return {
    prediction: result.prediction,
    usage: result.usage,
  };
}

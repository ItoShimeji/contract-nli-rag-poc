import type OpenAI from "openai";

import type { LlmClient } from "../types.js";
import type { EmbeddingCache } from "../../embedding/types.js";

export type RagConfig = {
  model: string;
  topK: number;
};

export type RagDeps = {
  openai: OpenAI;
  llmClient: LlmClient;
  systemPrompt: string;
  cache: EmbeddingCache;
};

export type CalcSimilarity = (a: number[], b: number[]) => number;

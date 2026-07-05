import type OpenAI from "openai";

import type { LlmClient } from "../types.js";
import type { EmbeddingCache } from "../../embedding/types.js";

export type RagPipeline = "simple" | "rerank" | "rerank-verify";

export type RagConfig = {
  model: string;
  pipeline: RagPipeline;
  simpleTopK: number;
  rerankerCandidateTopK: number;
  rerankerTopK: number;
};

export type RagDeps = {
  openai: OpenAI;
  llmClient: LlmClient;
  systemPrompt: string;
  cache: EmbeddingCache;
};

export type CalcSimilarity = (a: number[], b: number[]) => number;

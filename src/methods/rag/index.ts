import type OpenAI from "openai";

import type { EmbeddingCache } from "../../embedding/types.js";
import type { PredictionMethod } from "../types.js";
import type { RagConfig } from "./types.js";
import { llmClient } from "../llm.js";
import { systemPrompt } from "./prompt.js";
import { runRagPipeline } from "./pipeline.js";

export function createRagMethod(
  config: RagConfig,
  openai: OpenAI,
  cache: EmbeddingCache,
): PredictionMethod {
  const deps = { openai, llmClient, systemPrompt, cache };

  return {
    name: getRagMethodName(config.pipeline),
    config,
    run: (input) => runRagPipeline(config, deps, input),
  };
}

function getRagMethodName(pipeline: RagConfig["pipeline"]): string {
  switch (pipeline) {
    case "simple":
      return "rag";
    case "rerank":
      return "rag-rerank";
    case "rerank-verify":
      return "rag-rerank-verify";
  }
}

import type OpenAI from "openai";

import type { EmbeddingCache } from "../../embedding/types.js";
import type { PredictionMethod, PredictionInput, PredictionResult } from "../types.js";
import type { RagConfig, RagDeps } from "./types.js";
import { measureAsync } from "../measureAsync.js";
import { llmClient } from "../llm.js";
import { createPrompt, systemPrompt } from "./prompt.js";
import { createEmbeddingRetriever } from "./retriever.js";
import { calcCosineSimilarity } from "./cosineSimilarity.js";

export function createRagMethod(
  config: RagConfig,
  openai: OpenAI,
  cache: EmbeddingCache,
): PredictionMethod {
  const deps = { openai, llmClient, systemPrompt, cache };

  return {
    name: "rag",
    config,
    run: (input) => runRagMethod(config, deps, input),
  };
}

// LLM 呼び出し
async function runRagMethod(
  config: RagConfig,
  deps: RagDeps,
  input: PredictionInput,
): Promise<PredictionResult> {
  const retriever = createEmbeddingRetriever(config.topK, deps.cache, calcCosineSimilarity);
  const indexesTopK = retriever({
    documentId: input.document.id,
    hypothesisId: input.example.hypothesisId,
  });

  const prompt = createPrompt(input, indexesTopK);

  // 実行時間を計測しながら LLM 呼び出し
  const { result, durationMs } = await measureAsync(
    async () => await deps.llmClient(deps.openai, config.model, deps.systemPrompt, prompt),
  );

  return {
    label: result.prediction.label,
    evidenceSpanIds: result.prediction.evidenceSpanIds,
    usage: result.usage,
    latency: { totalMs: durationMs },
  };
}

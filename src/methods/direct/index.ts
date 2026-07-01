import type OpenAI from "openai";

import { measureAsync } from "../measureAsync.js";
import type { PredictionMethod, PredictionInput, PredictionResult } from "../types.js";
import type { DirectConfig, DirectDeps } from "./types.js";
import { llmClient } from "./llm.js";
import { createPrompt } from "./prompt.js";

export function createDirectMethod(config: DirectConfig, openai: OpenAI): PredictionMethod {
  const deps = { openai, llmClient };

  return {
    name: "direct",
    config,
    run: (input) => runDirectMethod(config, deps, input),
  };
}

// LLM 呼び出し
async function runDirectMethod(
  config: DirectConfig,
  deps: DirectDeps,
  input: PredictionInput,
): Promise<PredictionResult> {
  const prompt = createPrompt(input);

  // 実行時間を計測しながら LLM 呼び出し
  const { result, durationMs } = await measureAsync(
    async () => await deps.llmClient(deps.openai, config.model, prompt),
  );

  return {
    label: result.prediction.label,
    evidenceSpanIds: result.prediction.evidenceSpanIds,
    usage: result.usage,
    latency: { totalMs: durationMs },
  };
}

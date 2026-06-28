import { createChunksPrompt } from "../index.js";
import { measureAsync } from "../measureAsync.js";
import { splitChunks } from "../../contract-nli/dataset.js";
import type { PredictionMethod, PredictionInput, PredictionResult } from "../types.js";
import type { DirectConfig, DirectDeps } from "./types.js";
import { llmClient } from "./llm.js";

export function createDirectMethod(config: DirectConfig): PredictionMethod {
  const deps = { llmClient };

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
    async () => await deps.llmClient(config.model, prompt),
  );

  return {
    label: result.prediction.label,
    evidenceSpanIds: result.prediction.evidenceSpanIds,
    usage: result.usage,
    latency: { totalMs: durationMs },
  };
}

function createPrompt(input: PredictionInput): string {
  const chunks = splitChunks(input.document.text, input.document.spans);
  const chunksPrompt = createChunksPrompt(chunks);

  return `
## 仮説
${input.example.hypothesis}

## 契約文書
${chunksPrompt}
  `;
}

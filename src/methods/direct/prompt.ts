import { splitChunks } from "../../contract-nli/chunk.js";
import { createChunksPrompt } from "../prompt.js";
import type { PredictionInput } from "../types.js";

export function createPrompt(input: PredictionInput): string {
  const chunks = splitChunks(input.document.text, input.document.spans);
  const chunksPrompt = createChunksPrompt(chunks);

  return `## 仮説
${input.example.hypothesis}

## 契約文書
${chunksPrompt}`;
}

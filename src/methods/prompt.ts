import type { Chunk } from "./types.js";

// LLM へのプロンプトとして使用する chunk の表示形式
export function createChunksPrompt(chunks: Chunk[]): string {
  return chunks.map((chunk) => `[chunk ${chunk.index}]\n${chunk.text}`).join("\n\n");
}

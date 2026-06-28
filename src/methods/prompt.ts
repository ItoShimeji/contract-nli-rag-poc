// LLM へのプロンプトとして使用する chunk の表示形式
export function createChunksPrompt(chunks: string[]): string {
  return chunks.map((chunk, index) => `[chunk ${index}]\n${chunk}`).join("\n\n");
}

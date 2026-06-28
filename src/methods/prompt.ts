// LLM へのプロンプトとして使用する chunk の表示形式
//
// ex)
// [span 0]
// NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT
//
// [span 1]
// This NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT ...
//
// [span 2]
// The Discloser and Recipient are also referred to ...
export function createChunksPrompt(chunks: string[]): string {
  return chunks.map((chunk, index) => `[cnunk ${index}]\n${chunk}`).join("\n\n");
}

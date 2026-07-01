import type { Embed } from "./types.js";

// document の chunk 列を埋め込み化
export const embed: Embed = async (openai, input, model) => {
  // input 配列に対する結果が res.data に配列で入る
  const res = await openai.embeddings.create({
    model,
    input,
  });

  return {
    results: res.data.map((d) => ({
      index: d.index,
      embedding: d.embedding,
    })),
    tokens: res.usage.total_tokens,
  };
};

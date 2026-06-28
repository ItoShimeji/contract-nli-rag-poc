import OpenAI from "openai";

import type { Embed } from "./types.js";

const openai = new OpenAI();

// document の chunk 列を埋め込み化
export const embed: Embed = async (input, model) => {
  // input 配列に対する結果が res.data に配列で入る
  const res = await openai.embeddings.create({
    model,
    input,
  });

  return res.data.map((d) => ({
    index: d.index,
    embedding: d.embedding,
  }));
};

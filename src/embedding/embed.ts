import OpenAI from "openai";
const openai = new OpenAI();

type EmbeddingResult = { index: number; embedding: number[] }[];

// document の chunk 列を埋め込み化
export async function embed(input: string[], model: string): Promise<EmbeddingResult> {
  // input 配列に対する結果が res.data に配列で入る
  const res = await openai.embeddings.create({
    model,
    input,
  });

  return res.data.map((d) => ({
    index: d.index,
    embedding: d.embedding,
  }));
}

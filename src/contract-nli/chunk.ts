import type { Chunk } from "../methods/types.js";

// ドキュメントを chunk に分割
export function splitChunks(text: string, spans: [number, number][]): Chunk[] {
  // const chunks: Chunk[] = [];

  const chunks: Chunk[] = spans.map((span, index) => ({
    index,
    text: text.slice(span[0], span[1]),
  }));
  // for (const [index, span] of spans.entries()) {
  //   chunks.push({ text: text.slice(span[0], span[1]) });
  // }

  return chunks;
}

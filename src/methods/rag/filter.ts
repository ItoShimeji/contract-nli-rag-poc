import type { Chunk } from "../types.js";

export function filterChunks(chunks: Chunk[], indexesTopK: number[]): Chunk[] {
  return indexesTopK.map((index) => {
    const chunk = chunks[index];
    if (chunk === undefined) {
      throw new RangeError(`Chunk index is out of range: ${index}`);
    }

    return { index, text: chunk.text };
  });
}

export function calcCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("ベクトルの長さが異なります");
  }

  if (a.length === 0) {
    throw new Error("ベクトルの大きさが 0 です");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! ** 2;
    normB += b[i]! ** 2;
  }

  return dotProduct / Math.sqrt(normA * normB);
}

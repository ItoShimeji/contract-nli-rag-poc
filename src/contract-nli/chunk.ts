// ドキュメントを chunk に分割
export function splitChunks(text: string, spans: [number, number][]): string[] {
  const chunks: string[] = [];

  for (const span of spans) {
    chunks.push(text.slice(span[0], span[1]));
  }

  return chunks;
}

export function createDocumentKey(documentId: number, spanIndex: number): string {
  return `contract-nli:document:${documentId}:span:${spanIndex}`;
}

export function createHypothesisKey(hypothesisId: string): string {
  return `contract-nli:hypothesis:${hypothesisId}`;
}

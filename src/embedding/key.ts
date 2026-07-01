export function createDocumentKey(documentId: number, resultIndex: number): string {
  return `contract-nli:document:${documentId}:span:${resultIndex}`;
}

export function createHypothesisKey(hypothesisId: string): string {
  return `contract-nli:hypothesis:${hypothesisId}`;
}

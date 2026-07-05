import type { Document } from "../contract-nli/types.js";
import type { ResultInput, ResultRecord, GoldAnnotation } from "./types.js";

export function createResultRecords(results: ResultInput[], documents: Document[]): ResultRecord[] {
  // documentId * hypothesisId を高速に探索するために map にする
  const goldMap = createGoldAnnotationMap(documents);

  const records: ResultRecord[] = [];

  for (const result of results) {
    const key: `${string}:${string}` = `${result.documentId}:${result.hypothesisId}`;
    const gold = goldMap.get(key);
    if (!gold) {
      throw new Error("dataset に annotation が見つかりません");
    }

    const record: ResultRecord = {
      documentId: result.documentId,
      hypothesisId: result.hypothesisId,
      goldLabel: gold.label,
      predictedLabel: result.prediction.label,
      goldEvidenceSpanIds: gold.spanIds,
      predictedEvidenceSpanIds: result.prediction.evidenceSpanIds,
      usage: result.prediction.usage,
      latency: result.prediction.latency,
    };

    if (result.prediction.stages) {
      record.stages = result.prediction.stages;
    }

    records.push(record);
  }

  return records;
}

export function createGoldAnnotationMap(
  documents: Document[],
): Map<`${string}:${string}`, GoldAnnotation> {
  const map = new Map<`${string}:${string}`, GoldAnnotation>();

  for (const document of documents) {
    for (const annotation of document.annotations) {
      const key: `${string}:${string}` = `${document.id}:${annotation.hypothesisId}`;
      map.set(key, {
        label: annotation.label,
        spanIds: annotation.spanIds,
      });
    }
  }

  return map;
}

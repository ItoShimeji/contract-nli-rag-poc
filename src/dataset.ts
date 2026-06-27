import fs from "node:fs/promises";
import * as v from "valibot";

import type { Document } from "./types.js";
import { DocumentSchema } from "./types.js";

export async function loadContractNliDataset(path: string): Promise<Document[]> {
  const raw = await fs.readFile(path, "utf8");
  const dataset = JSON.parse(raw);
  const documetsData = dataset.documents;

  const documents = documetsData.map((d: any) => {
    const annotationSet = d.annotation_sets[0];
    const annotations = Object.entries(annotationSet.annotations).map(
      ([hypothesisId, annotation]) => ({
        hypothesisId,
        label: (annotation as any).choice,
        spanIds: (annotation as any).spans,
      }),
    );

    return {
      id: d.id,
      text: d.text,
      spans: d.spans,
      annotations,
    };
  });

  return v.parse(v.array(DocumentSchema), documents);
}

// ドキュメントを chunk に分割
export function splitChunks(text: string, spans: [number, number][]): string[] {
  const chunks: string[] = [];

  for (const span of spans) {
    chunks.push(text.slice(span[0], span[1]));
  }

  return chunks;
}

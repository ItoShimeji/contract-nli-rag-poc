import fs from "node:fs/promises";
import * as v from "valibot";

import type { Document, Hypothesis } from "./types.js";
import { DocumentSchema, HypothesisSchema } from "./types.js";

type Dataset = {
  documents: Document[];
  hypotheses: Hypothesis[];
};

export async function loadContractNliDataset(path: string): Promise<Dataset> {
  const raw = await fs.readFile(path, "utf8");
  const dataset = JSON.parse(raw);

  return {
    documents: normalizeDocuments(dataset.documents),
    hypotheses: normalizeHypotheses(dataset.labels),
  };
}

function normalizeDocuments(documetsData: any): Document[] {
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

function normalizeHypotheses(hypothesesData: any): Hypothesis[] {
  const hypotheses = Object.entries(hypothesesData).map(([hypothesisId, label]) => ({
    id: hypothesisId,
    description: (label as any).short_description,
    text: (label as any).hypothesis,
  }));

  return v.parse(v.array(HypothesisSchema), hypotheses);
}

// ドキュメントを chunk に分割
export function splitChunks(text: string, spans: [number, number][]): string[] {
  const chunks: string[] = [];

  for (const span of spans) {
    chunks.push(text.slice(span[0], span[1]));
  }

  return chunks;
}

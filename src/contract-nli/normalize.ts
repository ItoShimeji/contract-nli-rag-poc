import * as v from "valibot";

import type { Document, Hypothesis } from "./types.js";
import { DocumentSchema, HypothesisSchema } from "./types.js";

export function normalizeDocuments(documetsData: any): Document[] {
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

export function normalizeHypotheses(hypothesesData: any): Hypothesis[] {
  const hypotheses = Object.entries(hypothesesData).map(([hypothesisId, label]) => ({
    id: hypothesisId,
    description: (label as any).short_description,
    text: (label as any).hypothesis,
  }));

  return v.parse(v.array(HypothesisSchema), hypotheses);
}

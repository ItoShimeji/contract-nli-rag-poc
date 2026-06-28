import * as v from "valibot";

export const LabelSchema = v.picklist(["Entailment", "Contradiction", "NotMentioned"]);

export type Label = v.InferOutput<typeof LabelSchema>;

const spanSchema = v.tuple([v.number(), v.number()]);

const AnnotationSchema = v.object({
  hypothesisId: v.string(),
  label: LabelSchema,
  spanIds: v.array(v.number()),
});

export const DocumentSchema = v.object({
  id: v.number(),
  text: v.string(),
  spans: v.array(spanSchema),
  annotations: v.array(AnnotationSchema),
});

export type Document = v.InferOutput<typeof DocumentSchema>;

export const HypothesisSchema = v.object({
  id: v.string(),
  description: v.string(),
  text: v.string(),
});

export type Hypothesis = v.InferOutput<typeof HypothesisSchema>;

export type Dataset = {
  documents: Document[];
  hypotheses: Hypothesis[];
};

import * as v from "valibot";

const LabelSchema = v.picklist(["Entailment", "Contradiction", "NotMentioned"]);

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

// interface Document {
//   id: number;
//   file_name: string;
//   text: string;
//   document_type: string;
//   url: string;
//   spans: [[number, number]];
//   annotation_sets: [{ annotations }];
// }

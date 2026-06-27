import fs from "node:fs/promises";
import { cli, define } from "gunshi";
import * as v from "valibot";
import { DocumentSchema } from "./types.js";

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: async () => {
    const raw = await fs.readFile("data/sample.json", "utf8");
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

    const ValidatedDocuments = v.parse(v.array(DocumentSchema), documents);
    console.log(ValidatedDocuments);
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: () => {
    console.error("todo");
  },
});

const mainCommand = define({
  name: "rag",
  description: "Contract NLI RAG POC",
  run: () => {
    console.log("Use a sub-command: embed or direct");
  },
});

await cli(process.argv.slice(2), mainCommand, {
  name: "rag",
  version: "0.0.1",
  subCommands: {
    embed: embedCommand,
    direct: directCommand,
  },
});

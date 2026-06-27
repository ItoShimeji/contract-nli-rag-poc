import fs from "node:fs/promises";
import { cli, define } from "gunshi";
import * as v from "valibot";
import { DocumentSchema } from "./types.js";
import type { EmbeddingItem } from "./embedding/types.js";
import { splitChunks } from "./input.js";
import { embed } from "./embedding/embed.js";
import { createEmbeddingCache, saveEmbeddingCache } from "./embedding/cache.js";

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

    const validatedDocuments = v.parse(v.array(DocumentSchema), documents);

    const embeddingImtes: EmbeddingItem[] = [];
    for (const document of validatedDocuments) {
      const chunks = splitChunks(document.text, document.spans);
      const embeddingResults = await embed(chunks, "text-embedding-3-small");

      for (const result of embeddingResults) {
        embeddingImtes.push({
          key: `contract-nli:${document.id}:span:${result.index}`,
          documentId: document.id,
          spanIndex: result.index,
          embedding: result.embedding,
        });
      }
    }

    const embeddingCache = createEmbeddingCache(
      "data/sample.json",
      "text-embedding-3-small",
      embeddingImtes,
    );

    await saveEmbeddingCache("data/cache/cache.json", embeddingCache);
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

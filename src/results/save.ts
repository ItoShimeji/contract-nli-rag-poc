import type { Document } from "../contract-nli/types.js";
import { createResultRecords } from "./record.js";
import type { ResultInput } from "./types.js";
import { writeResult } from "./write.js";

export async function saveResult(
  resultDir: string,
  documents: Document[],
  method: { name: string; config: Record<string, unknown> },
  results: ResultInput[],
): Promise<void> {
  const records = createResultRecords(results, documents);

  const resultPath = `${resultDir}/${method.name}.json`;

  await writeResult(resultPath, method, records);
}

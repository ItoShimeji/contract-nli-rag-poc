import type { Document } from "../contract-nli/types.js";
import { createResultRecords } from "./record.js";
import type { ResultInput } from "./types.js";
import { writeResult } from "./write.js";
import { getResultFilePath } from "./path.js";

export async function saveResult(
  resultDir: string,
  model: string,
  documents: Document[],
  method: { name: string; config: Record<string, unknown> },
  results: ResultInput[],
): Promise<void> {
  const records = createResultRecords(results, documents);

  const resultPath = getResultFilePath(resultDir, model, method.name);

  await writeResult(resultPath, method, records);
}

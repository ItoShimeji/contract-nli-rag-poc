import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EvaluationSummary } from "./types.js";

export async function writeEvaluationSummary(summaryPath: string, summary: EvaluationSummary) {
  await mkdir(path.dirname(summaryPath), { recursive: true });

  const tmpPath = `${summaryPath}.tmp`;

  await writeFile(tmpPath, `${JSON.stringify(summary, null, 2)}\n`, "utf-8");
  await rename(tmpPath, summaryPath);
}

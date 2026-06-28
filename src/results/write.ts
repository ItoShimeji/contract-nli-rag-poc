import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ResultFile, ResultRecord } from "./types.js";

export async function writeResult(
  resultPath: string,
  method: {
    name: string;
    config: Record<string, unknown>;
  },
  records: ResultRecord[],
) {
  const result: ResultFile = {
    method,
    records,
  };

  await mkdir(path.dirname(resultPath), { recursive: true });

  const tmpPath = `${resultPath}.tmp`;

  await writeFile(tmpPath, `${JSON.stringify(result, null, 2)}\n`, "utf-8");
  await rename(tmpPath, resultPath);
}

import fs from "node:fs/promises";

import type { ResultFile } from "./types.js";

export async function loadResult(path: string): Promise<ResultFile> {
  const raw = await fs.readFile(path, "utf8");
  return JSON.parse(raw) as ResultFile;
}

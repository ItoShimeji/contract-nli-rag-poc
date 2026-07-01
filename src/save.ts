import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function saveJson(jsonPath: string, cache: any) {
  await mkdir(path.dirname(jsonPath), { recursive: true });

  const tmpPath = `${jsonPath}.tmp`;

  await writeFile(tmpPath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  await rename(tmpPath, jsonPath);
}

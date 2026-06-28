import fs from "node:fs/promises";

import type { Dataset } from "./types.js";
import { normalizeDocuments, normalizeHypotheses } from "./normalize.js";

export async function loadContractNliDataset(path: string): Promise<Dataset> {
  const raw = await fs.readFile(path, "utf8");
  const dataset = JSON.parse(raw);

  return {
    documents: normalizeDocuments(dataset.documents),
    hypotheses: normalizeHypotheses(dataset.labels),
  };
}

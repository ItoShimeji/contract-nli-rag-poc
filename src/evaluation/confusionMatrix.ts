import type { Label } from "../contract-nli/types.js";
import type { ResultRecord } from "../results/types.js";
import type { ConfusionMatrix } from "./types.js";

export function createConfusionMatrix(records: ResultRecord[]): ConfusionMatrix {
  const matrix: ConfusionMatrix = {
    Entailment: { Entailment: 0, NotMentioned: 0, Contradiction: 0 },
    NotMentioned: { Entailment: 0, NotMentioned: 0, Contradiction: 0 },
    Contradiction: { Entailment: 0, NotMentioned: 0, Contradiction: 0 },
  };

  for (const record of records) {
    switch (record.goldLabel) {
      case "Entailment":
        increaseCount(matrix.Entailment, record.predictedLabel);
        break;
      case "NotMentioned":
        increaseCount(matrix.NotMentioned, record.predictedLabel);
        break;
      case "Contradiction":
        increaseCount(matrix.Contradiction, record.predictedLabel);
        break;
    }
  }

  return matrix;
}

function increaseCount(row: Record<Label, number>, predictedLabel: Label): void {
  switch (predictedLabel) {
    case "Entailment":
      row.Entailment++;
      break;
    case "NotMentioned":
      row.NotMentioned++;
      break;
    case "Contradiction":
      row.Contradiction++;
      break;
  }
}

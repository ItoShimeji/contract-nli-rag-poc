import type { Label } from "../contract-nli/types.js";
import type { ConfusionMatrix } from "./types.js";
import type { ConfusionStats, ConfusionStatsRecord } from "./types.js";

export function createConfusionStats(matrix: ConfusionMatrix): ConfusionStatsRecord {
  const labels: Label[] = ["Entailment", "NotMentioned", "Contradiction"];
  const stats_list: ConfusionStats[] = [];

  const total =
    matrix.Entailment.Entailment +
    matrix.Entailment.NotMentioned +
    matrix.Entailment.Contradiction +
    matrix.NotMentioned.Entailment +
    matrix.NotMentioned.NotMentioned +
    matrix.NotMentioned.Contradiction +
    matrix.Contradiction.Entailment +
    matrix.Contradiction.NotMentioned +
    matrix.Contradiction.Contradiction;

  for (const label of labels) {
    const totalByLabel = Object.entries(matrix[label]).reduce((acc, [_, cur]) => acc + cur, 0);

    const tp = matrix[label][label];
    const fp = Object.entries(matrix).reduce((acc, [_, cur]) => acc + cur[label], 0) - tp;
    const fn = totalByLabel - tp;
    const tn = total - (fp + fn + tp);

    stats_list.push({
      total: totalByLabel,
      tp,
      fp,
      fn,
      tn,
    });
  }

  return {
    Entailment: stats_list[0]!,
    NotMentioned: stats_list[1]!,
    Contradiction: stats_list[2]!,
  };
}

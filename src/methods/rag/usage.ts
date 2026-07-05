import type { Usage } from "../types.js";

export const emptyUsage: Usage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
};

export function sumUsage(usages: Usage[]): Usage {
  return usages.reduce<Usage>(
    (total, usage) => ({
      inputTokens: total.inputTokens + usage.inputTokens,
      outputTokens: total.outputTokens + usage.outputTokens,
      totalTokens: total.totalTokens + usage.totalTokens,
    }),
    emptyUsage,
  );
}

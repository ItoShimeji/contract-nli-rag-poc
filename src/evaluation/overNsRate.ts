import type { OverNsRates } from "./types.js";

export function calcOverNsRates(latenciesMs: number[]): OverNsRates {
  let length = latenciesMs.length;
  const sorted = latenciesMs.toSorted((a, b) => a - b);
  const ns_ms = [1_000, 3_000, 5_000, 10_000];
  const firstNsIndexes = Array.from({ length: ns_ms.length }, () => length);

  // ns のどのインデックスの数字を探しているか
  let nIndex = 0;

  for (let i = 0; i < length - 1; i++) {
    if (sorted[i]! <= ns_ms[nIndex]! && ns_ms[nIndex]! < sorted[i + 1]!) {
      firstNsIndexes[nIndex] = i + 1;
      nIndex++;
    }
  }

  return {
    over1sRate: (length - firstNsIndexes[0]!) / length,
    over3sRate: (length - firstNsIndexes[1]!) / length,
    over5sRate: (length - firstNsIndexes[2]!) / length,
    over10sRate: (length - firstNsIndexes[3]!) / length,
  };
}

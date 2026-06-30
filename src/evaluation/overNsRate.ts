import type { OverNsRates } from "./types.js";

export function calcOverNsRates(latencies: number[]): OverNsRates {
  let length = latencies.length;
  const sorted = latencies.toSorted((a, b) => a - b);
  const ns = [1, 3, 5, 10];
  const firstNsIndexes = Array.from({ length: ns.length }, () => length);

  // ns のどのインデックスの数字を探しているか
  let nIndex = 0;

  for (let i = 0; i < length - 1; i++) {
    if (sorted[i]! <= ns[nIndex]! && ns[nIndex]! < sorted[i]!) {
      firstNsIndexes[nIndex] = i + 1;
      nIndex++;
    }
  }

  return {
    over1sRate: (length - ns[0]!) / length,
    over3sRate: (length - ns[1]!) / length,
    over5sRate: (length - ns[2]!) / length,
    over10sRate: (length - ns[3]!) / length,
  };
}

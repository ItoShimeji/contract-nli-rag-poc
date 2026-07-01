import type { NumberStats } from "../types.js";

export function calcNumberStats(numbers: number[]): NumberStats {
  const sorted = numbers.toSorted((a, b) => a - b);
  const count = numbers.length;
  const total = sorted.reduce((acc, cur) => acc + cur, 0);

  const p50_index = Math.floor(count * (1 / 2)) - 1;
  const p90_index = Math.floor(count * (9 / 10)) - 1;
  const p95_index = Math.floor(count * (19 / 20)) - 1;
  const p99_index = Math.floor(count * (99 / 100)) - 1;

  return {
    total,
    mean: total / count,
    min: sorted.at(0)!,
    max: sorted.at(-1)!,
    p50: sorted[p50_index]!,
    p90: sorted[p90_index]!,
    p95: sorted[p95_index]!,
    p99: sorted[p99_index]!,
  };
}

import { describe, expect, test } from "vitest";

import { calcNumberStats } from "./numberStats.js";

describe("calcNumberStats", () => {
  // 1..=100 の公差1の等差数列を生成し、それをランダム順にする
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j]!, numbers[i]!];
  }

  test("1..=100 のランダム順数列の stats を計算する", () => {
    const stats = calcNumberStats(numbers);

    expect(stats.total).toBe(5050);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(100);
    expect(stats.mean).toBe(50.5);
    expect(stats.p50).toBe(50);
    expect(stats.p90).toBe(90);
    expect(stats.p95).toBe(95);
    expect(stats.p99).toBe(99);
  });

  test("副作用を持たない", () => {
    const original = [...numbers];
    calcNumberStats(numbers);

    expect(numbers).toStrictEqual(original);
  });
});

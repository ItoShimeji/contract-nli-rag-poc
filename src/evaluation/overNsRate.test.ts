import { describe, expect, test } from "vitest";

import { calcOverNsRates } from "./overNsRate.js";

describe("getOverNsRates", () => {
  // 1..=20 の公差1の等差数列を生成し、それをランダム順にする
  const latencies = Array.from({ length: 20 }, (_, i) => i + 1);

  for (let i = latencies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [latencies[i], latencies[j]] = [latencies[j]!, latencies[i]!];
  }

  test("1..=20 のランダム順数列の over ns rate を計算する", () => {
    const rates = calcOverNsRates(latencies);

    expect(rates.over1sRate).toBe(0.95);
    expect(rates.over3sRate).toBe(0.85);
    expect(rates.over5sRate).toBe(0.75);
    expect(rates.over10sRate).toBe(0.5);
  });

  const latencies_rand = Array.from({ length: 1000 }, () => Math.random() * 10);

  test("すべての要素が 0 以上 1 以下である", () => {
    const rates = calcOverNsRates(latencies_rand);

    expect(rates.over1sRate).toBeGreaterThanOrEqual(0);
    expect(rates.over1sRate).toBeLessThanOrEqual(1);

    expect(rates.over3sRate).toBeGreaterThanOrEqual(0);
    expect(rates.over3sRate).toBeLessThanOrEqual(1);

    expect(rates.over5sRate).toBeGreaterThanOrEqual(0);
    expect(rates.over5sRate).toBeLessThanOrEqual(1);

    expect(rates.over10sRate).toBeGreaterThanOrEqual(0);
    expect(rates.over10sRate).toBeLessThanOrEqual(1);
  });

  test("副作用を持たない", () => {
    const original = [...latencies];
    calcOverNsRates(latencies);

    expect(latencies).toStrictEqual(original);
  });
});

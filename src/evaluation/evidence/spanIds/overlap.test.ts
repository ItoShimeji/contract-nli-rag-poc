import { describe, expect, test } from "vitest";

import { getLongSpanIds } from "./spanIds.test-helper.js";
import { isOverlapping } from "./overlap.js";

describe("isOverlapping", () => {
  test("id が重複することを判定できる", () => {
    expect(isOverlapping([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true);
    expect(isOverlapping([1, 2, 3, 4], [2, 3])).toBe(true);
    expect(isOverlapping(getLongSpanIds(), getLongSpanIds())).toBe(true);
  });

  test("id が重複しないことを判定できる", () => {
    // 両方空は false
    expect(isOverlapping([], [])).toBe(false);

    expect(isOverlapping([1, 2, 3, 4], [])).toBe(false);
    expect(isOverlapping([], [1, 2, 3, 4])).toBe(false);

    expect(isOverlapping([1, 2, 3, 4], [10])).toBe(false);
    expect(isOverlapping([10], [1, 2, 3, 4])).toBe(false);
    expect(isOverlapping(getLongSpanIds(), [100000])).toBe(false);
  });

  test("副作用を持たない", () => {
    const ids = getLongSpanIds();
    const original = [...ids];
    isOverlapping(ids, ids);

    expect(ids).toStrictEqual(original);
  });
});

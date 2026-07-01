import { describe, expect, test } from "vitest";

import { getLongSpanIds } from "./spanIds.test-helper.js";
import { isExactMatch } from "./exactMatch.js";

describe("isExactMatch", () => {
  test("根拠が正しいことを判定できる", () => {
    expect(isExactMatch([], [])).toBe(true);
    expect(isExactMatch([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true);
    expect(isExactMatch([1, 2, 3, 4], [4, 3, 2, 1])).toBe(true);
    expect(isExactMatch(getLongSpanIds(), getLongSpanIds())).toBe(true);
  });

  test("根拠が誤っていることを判定できる", () => {
    expect(isExactMatch([1, 2, 3, 4], [1, 2, 3])).toBe(false);
    expect(isExactMatch([1, 2, 3, 4], [1, 2, 3, 5])).toBe(false);
    expect(isExactMatch(getLongSpanIds(), [...getLongSpanIds(), 100000])).toBe(false);
  });

  test("副作用を持たない", () => {
    const ids = getLongSpanIds();
    const original = [...ids];
    isExactMatch(ids, ids);

    expect(ids).toStrictEqual(original);
  });
});

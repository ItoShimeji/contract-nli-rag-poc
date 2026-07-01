import { describe, expect, test } from "vitest";

import { getLongSpanIds } from "./spanIds.test-helper.js";
import { isContainingGold } from "./containsGold.js";

describe("isEvidenceCorrect", () => {
  test("predicted が gold をすべて含んでいることを判定できる", () => {
    expect(isContainingGold([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true);
    expect(isContainingGold([1, 2, 3, 4], [4, 3, 2, 1])).toBe(true);
    expect(isContainingGold([1, 2], [1, 2, 3, 4])).toBe(true);
    expect(isContainingGold(getLongSpanIds(), [...getLongSpanIds(), 100000])).toBe(true);
  });

  test("predicted が gold をすべて含んでいないことを判定できる", () => {
    // gold が空の場合は「必要な根拠 span を含んだ」とは扱わない。
    expect(isContainingGold([], [])).toBe(false);
    expect(isContainingGold([], [1, 2, 3, 4])).toBe(false);

    expect(isContainingGold([1, 2, 3, 4], [1, 2, 3])).toBe(false);
    expect(isContainingGold([1, 2, 3, 4], [1, 2, 3, 5])).toBe(false);
    expect(isContainingGold([...getLongSpanIds(), 100000], getLongSpanIds())).toBe(false);
  });

  test("副作用を持たない", () => {
    const ids = getLongSpanIds();
    const original = [...ids];
    isContainingGold(ids, ids);

    expect(ids).toStrictEqual(original);
  });
});

import { describe, expect, test } from "vitest";
import { calcCosineSimilarity } from "./cosineSimilarity.js";

describe("calcCosineSimilarity", () => {
  test("コサイン類似度を計算できる", () => {
    expect(calcCosineSimilarity([1, 2, 3], [4, 5, 6])).toBeCloseTo(0.9746);
  });

  test("長さの異なるベクトルにはエラーを投げる", () => {
    expect(() => calcCosineSimilarity([1, 2, 3], [4, 5])).toThrow("ベクトルの長さが異なります");
  });

  test("長さが 0 のベクトルにはエラーを投げる", () => {
    expect(() => calcCosineSimilarity([], [])).toThrow("ベクトルの大きさが 0 です");
  });
});

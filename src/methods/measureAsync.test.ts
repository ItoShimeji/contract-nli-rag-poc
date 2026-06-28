import { expect, test } from "vitest";

import { measureAsync } from "./measureAsync.js";

test("async function の結果と実行時間を返す", async () => {
  const result = await measureAsync(async () => "ok");

  expect(result.result).toBe("ok");
  expect(result.durationMs).toEqual(expect.any(Number));
  expect(result.durationMs).toBeGreaterThanOrEqual(0);

  // performance を mock する方法もある
  // vi.spyOn(performance, "now")
  //   .mockReturnValueOnce(100)
  //   .mockReturnValueOnce(135);
});

test("fn が reject した場合はそのまま reject する", async () => {
  await expect(
    measureAsync(async () => {
      throw new Error("failed");
    }),
  ).rejects.toThrow("failed");
});

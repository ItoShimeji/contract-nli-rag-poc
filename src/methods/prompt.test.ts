import { describe, expect, test } from "vitest";

import { createChunksPrompt } from "./prompt.js";

describe("createChunksPrompt", () => {
  test("chunk を LLM が参照しやすい形式に変換できる", () => {
    expect(createChunksPrompt(chunks)).toBe(result);
  });
});

const chunks: string[] = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  "sed do eiusmod tempor incididunt",
  "ut labore et dolore magna aliqua.",
];

const result = `[chunk 0]
Lorem ipsum dolor sit amet, consectetur adipiscing elit,

[chunk 1]
sed do eiusmod tempor incididunt

[chunk 2]
ut labore et dolore magna aliqua.`;

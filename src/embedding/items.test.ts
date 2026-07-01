import { expect, test } from "vitest";
import type OpenAI from "openai";

import { createEmbeddingItems } from "./items.js";
import type { Embed } from "./types.js";
import type { Document } from "../contract-nli/types.js";

const DIMENSIONS = 6;
const openaiMock = {} as OpenAI;

test("embed api を呼び出し embedding items を生成する", async () => {
  const result = await createEmbeddingItems(openaiMock, documents, "example_model", embedMock);

  expect(result.length).toBe(6);
  expect(result[0]!.embedding.length).toBe(DIMENSIONS);
  expect(result.find((item) => item.key === "contract-nli:34:span:0")).toBeTruthy();
  expect(result[0]!.tokens).toBe(4);
});

const documents: Document[] = [
  {
    id: 34,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    spans: [
      [0, 17],
      [17, 39],
      [39, 78],
      [78, 123],
    ],
    annotations: [],
  },
  {
    id: 2,
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    spans: [
      [0, 24],
      [24, 107],
    ],
    annotations: [],
  },
];

const embedMock: Embed = async (_, input) => {
  return {
    results: input.map((_, index) => ({
      index,
      embedding: Array.from({ length: DIMENSIONS }, () => Math.random()),
    })),
    tokens: input.length,
  };
};

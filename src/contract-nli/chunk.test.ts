import { expect, test } from "vitest";

import { splitChunks } from "./chunk.js";
import type { Chunk } from "../methods/types.js";

test("span の指定により text を分割する", () => {
  expect(splitChunks(text, spans)).toStrictEqual(result);
});

const text =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const spans: [number, number][] = [
  [0, 17],
  [17, 39],
  [39, 78],
  [78, 123],
];

const result: Chunk[] = [
  { index: 0, text: "Lorem ipsum dolor" },
  { index: 1, text: " sit amet, consectetur" },
  { index: 2, text: " adipiscing elit, sed do eiusmod tempor" },
  { index: 3, text: " incididunt ut labore et dolore magna aliqua." },
];

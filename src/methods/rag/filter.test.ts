import { describe, expect, test } from "vitest";
import { filterChunks } from "./filter.js";
import type { Chunk } from "../types.js";

describe("filterChunks", () => {
  test("top k chunk をフィルタリングする", () => {
    expect(filterChunks(chunks, indexesTopK)).toStrictEqual(result);
  });
});

const chunks: Chunk[] = [
  {
    index: 0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    index: 1,
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    index: 2,
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    index: 3,
    text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];
const indexesTopK = [0, 3];

const result: Chunk[] = [
  {
    index: 0,
    text: chunks[0]!.text,
  },
  {
    index: 3,
    text: chunks[3]!.text,
  },
];

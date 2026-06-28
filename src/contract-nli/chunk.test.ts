import { expect, test } from "vitest";

import { splitChunks } from "./chunk.js";

test("span の指定により text を分割する", () => {
  const text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const spans: [number, number][] = [
    [0, 17],
    [17, 39],
    [39, 78],
    [78, 123],
  ];

  const result = [
    "Lorem ipsum dolor",
    " sit amet, consectetur",
    " adipiscing elit, sed do eiusmod tempor",
    " incididunt ut labore et dolore magna aliqua.",
  ];
  expect(splitChunks(text, spans)).toStrictEqual(result);
});

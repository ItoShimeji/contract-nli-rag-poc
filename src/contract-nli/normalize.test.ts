import { describe, expect, test } from "vitest";

import { normalizeDocuments, normalizeHypotheses } from "./normalize.js";

describe("normalizeDocuments", () => {
  test("document data を正規化", () => {
    expect(normalizeDocuments(documentsData)).toStrictEqual(normalizedDocuments);
  });

  test("フィールドが足りない場合はエラーを投げる", () => {
    expect(() => normalizeDocuments([{ id: 34 }])).toThrow();
  });

  test("フィールドの型が合わない場合はエラーを投げる", () => {
    const invalidDocumentsData = [...documentsData];
    invalidDocumentsData[0].id = "34";
    expect(() => normalizeDocuments(invalidDocumentsData)).toThrow();
  });
});

describe("normalizeHypotheses", () => {
  test("hypothesis data を正規化", () => {
    expect(normalizeHypotheses(hypothesesData)).toStrictEqual(normalizedHypotheses);
  });

  test("フィールドが足りない場合はエラーを投げる", () => {
    expect(() => normalizeHypotheses({ "nda-1": { text: "lorem" } })).toThrow();
  });

  test("フィールドの型が合わない場合はエラーを投げる", () => {
    const invalidHypothesisData = {
      "nda-1": {
        short_description: 1,
        hypothesis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    };
    expect(() => normalizeHypotheses(invalidHypothesisData)).toThrow();
  });
});

const documentsData: any = [
  {
    id: 34,
    file_name: "example file name",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n",
    spans: [
      [0, 17],
      [17, 39],
      [39, 78],
      [78, 123],
    ],
    annotation_sets: [
      {
        annotations: {
          "nda-1": {
            choice: "NotMentioned",
            spans: [],
          },
          "nda-18": {
            choice: "Entailment",
            spans: [1, 2],
          },
          "nda-5": {
            choice: "Contradiction",
            spans: [0],
          },
        },
      },
    ],
    document_type: "search-pdf",
    url: "https://www.ungm.org/UNUser/Documents/DownloadPublicDocument?docId=287983",
  },
];

const normalizedDocuments = [
  {
    id: 34,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n",
    spans: [
      [0, 17],
      [17, 39],
      [39, 78],
      [78, 123],
    ],
    annotations: [
      {
        hypothesisId: "nda-1",
        label: "NotMentioned",
        spanIds: [],
      },
      {
        hypothesisId: "nda-18",
        label: "Entailment",
        spanIds: [1, 2],
      },
      {
        hypothesisId: "nda-5",
        label: "Contradiction",
        spanIds: [0],
      },
    ],
  },
];

const hypothesesData = {
  "nda-1": {
    short_description: "One",
    hypothesis:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  "nda-18": {
    short_description: "Eighteen",
    hypothesis:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  "nda-5": {
    short_description: "Five",
    hypothesis:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
};

const normalizedHypotheses = [
  {
    id: "nda-1",
    description: "One",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "nda-18",
    description: "Eighteen",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: "nda-5",
    description: "Five",
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

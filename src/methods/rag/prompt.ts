import { splitChunks } from "../../contract-nli/chunk.js";
import { createChunksPrompt } from "../prompt.js";
import type { PredictionInput } from "../types.js";
import { filterChunks } from "./filter.js";

export function createPrompt(input: PredictionInput, indexesTopK: number[]): string {
  const chunks = splitChunks(input.document.text, input.document.spans);
  const chunksTopK = filterChunks(chunks, indexesTopK);
  const chunksPrompt = createChunksPrompt(chunksTopK);

  return `## 仮説
${input.example.hypothesis}

## 契約文書（top k）
${chunksPrompt}`;
}

export const systemPrompt = `
# 仮説判定タスク
- 提示された契約文書を根拠として、仮説を判定してください。
- 契約文書は仮説に関連すると思われる top k のみを提示します。
- ラベルは Entailment、Contradiction、NotMentioned のいずれかです。
- 根拠として使用したチャンク ID を返してください。

## ラベル
| ラベル        | 意味                             | 根拠 span |
| --------------| -------------------------------- | --------- |
| Entailment    | 契約文書が仮説を支持する         | 原則あり  |
| Contradiction | 契約文書が仮説と矛盾する         | 原則あり  |
| NotMentioned  | 契約文書には判断できる記載がない | 空        |
`;

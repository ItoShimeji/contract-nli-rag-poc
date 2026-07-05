import * as v from "valibot";
import type OpenAI from "openai";

import { splitChunks } from "../../contract-nli/chunk.js";
import { createChunksPrompt } from "../prompt.js";
import type { PredictionInput, Usage } from "../types.js";
import { structuredLlmClient } from "../llm.js";
import { filterChunks } from "./filter.js";

const RerankerOutputSchema = v.object({
  spanIds: v.array(v.number()),
});

export async function rerankSpans(
  openai: OpenAI,
  model: string,
  input: PredictionInput,
  candidateSpanIds: number[],
  topK: number,
): Promise<{ spanIds: number[]; usage: Usage }> {
  const prompt = createRerankerPrompt(input, candidateSpanIds, topK);
  const { output, usage } = await structuredLlmClient(
    openai,
    model,
    rerankerSystemPrompt,
    prompt,
    "contract_nli_reranking",
    RerankerOutputSchema,
  );

  return {
    spanIds: normalizeRerankedSpanIds(output.spanIds, candidateSpanIds, topK),
    usage,
  };
}

function createRerankerPrompt(
  input: PredictionInput,
  candidateSpanIds: number[],
  topK: number,
): string {
  const chunks = splitChunks(input.document.text, input.document.spans);
  const candidateChunks = filterChunks(chunks, candidateSpanIds);
  const chunksPrompt = createChunksPrompt(candidateChunks);

  return `## 仮説
${input.example.hypothesis}

## 候補チャンク
${chunksPrompt}

## 指示
仮説の判定に最も関連するチャンク ID を最大 ${topK} 件選んでください。`;
}

function normalizeRerankedSpanIds(
  spanIds: number[],
  candidateSpanIds: number[],
  topK: number,
): number[] {
  const candidateSet = new Set(candidateSpanIds);
  const normalized: number[] = [];

  for (const spanId of spanIds) {
    if (candidateSet.has(spanId) && !normalized.includes(spanId)) {
      normalized.push(spanId);
    }
  }

  for (const spanId of candidateSpanIds) {
    if (normalized.length >= topK) {
      break;
    }
    if (!normalized.includes(spanId)) {
      normalized.push(spanId);
    }
  }

  return normalized.slice(0, topK);
}

const rerankerSystemPrompt = `
# RAG reranker
- 仮説の Entailment / Contradiction / NotMentioned 判定に必要な候補チャンクを選んでください。
- 出力は指定された JSON schema に従ってください。
- spanIds には候補チャンクに含まれる ID だけを入れてください。
`;

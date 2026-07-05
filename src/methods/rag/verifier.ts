import * as v from "valibot";
import type OpenAI from "openai";

import { LabelSchema } from "../../contract-nli/types.js";
import { splitChunks } from "../../contract-nli/chunk.js";
import { createChunksPrompt } from "../prompt.js";
import type { Prediction, PredictionInput, Usage } from "../types.js";
import { structuredLlmClient } from "../llm.js";
import { filterChunks } from "./filter.js";

const PredictionSchema = v.object({
  label: LabelSchema,
  evidenceSpanIds: v.array(v.number()),
});

const VerifierOutputSchema = v.object({
  decision: v.picklist(["accept", "revise"]),
  prediction: PredictionSchema,
});

export async function verifyPrediction(
  openai: OpenAI,
  model: string,
  input: PredictionInput,
  spanIds: number[],
  prediction: Prediction,
): Promise<{ decision: "accept" | "revise"; prediction: Prediction; usage: Usage }> {
  const prompt = createVerifierPrompt(input, spanIds, prediction);
  const { output, usage } = await structuredLlmClient(
    openai,
    model,
    verifierSystemPrompt,
    prompt,
    "contract_nli_verification",
    VerifierOutputSchema,
  );

  return {
    decision: output.decision,
    prediction: normalizeVerifiedPrediction(output.prediction, spanIds),
    usage,
  };
}

function createVerifierPrompt(
  input: PredictionInput,
  spanIds: number[],
  prediction: Prediction,
): string {
  const chunks = splitChunks(input.document.text, input.document.spans);
  const selectedChunks = filterChunks(chunks, spanIds);
  const chunksPrompt = createChunksPrompt(selectedChunks);

  return `## 仮説
${input.example.hypothesis}

## 契約文書（選択済みチャンク）
${chunksPrompt}

## 検証対象の予測
${JSON.stringify(prediction, null, 2)}

## 指示
検証対象の予測が、提示された契約文書から妥当か確認してください。
妥当なら decision を accept にしてください。
修正が必要なら decision を revise にして、修正後の prediction を返してください。`;
}

function normalizeVerifiedPrediction(
  prediction: Prediction,
  selectedSpanIds: number[],
): Prediction {
  if (prediction.label === "NotMentioned") {
    return {
      label: prediction.label,
      evidenceSpanIds: [],
    };
  }

  const selectedSpanSet = new Set(selectedSpanIds);

  return {
    label: prediction.label,
    evidenceSpanIds: prediction.evidenceSpanIds.filter((spanId) => selectedSpanSet.has(spanId)),
  };
}

const verifierSystemPrompt = `
# RAG verifier
- 仮説、提示された契約文書、検証対象の予測を比較してください。
- 出力は指定された JSON schema に従ってください。
- prediction.evidenceSpanIds には提示されたチャンク ID だけを入れてください。
- NotMentioned の場合、evidenceSpanIds は空配列にしてください。
`;

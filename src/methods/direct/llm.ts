import * as v from "valibot";
import { toJsonSchema } from "@valibot/to-json-schema";

import { LabelSchema } from "../../contract-nli/types.js";
import type { LlmClient } from "./types.js";
import type { Usage } from "../types.js";

const PredictionSchema = v.object({
  label: LabelSchema,
  evidenceSpanIds: v.array(v.number()),
});

const predictionJsonSchema = {
  ...toJsonSchema(PredictionSchema, { target: "draft-07" }),
  additionalProperties: false,
};
const requestTimeoutMs = 120_000;

// LLM 呼び出し client
export const llmClient: LlmClient = async (openai, model, prompt) => {
  const response = await openai.responses.create(
    {
      model,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_output_tokens: 512,
      reasoning: { effort: "none" },
      text: {
        format: {
          type: "json_schema",
          name: "contract_nli_prediction",
          strict: true,
          schema: predictionJsonSchema,
        },
      },
    },
    { timeout: requestTimeoutMs },
  );

  return {
    prediction: v.parse(PredictionSchema, JSON.parse(response.output_text)),
    usage: toUsage(response.usage),
  };
};

function toUsage(
  usage: { input_tokens: number; output_tokens: number; total_tokens: number } | undefined,
): Usage {
  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

const systemPrompt = `
# 仮説判定タスク
- 提示された契約文書を根拠として、仮説を判定してください。
- ラベルは Entailment、Contradiction、NotMentioned のいずれかです。
- 根拠として使用したチャンク ID を返してください。

## ラベル
| ラベル        | 意味                             | 根拠 span |
| --------------| -------------------------------- | --------- |
| Entailment    | 契約文書が仮説を支持する         | 原則あり  |
| Contradiction | 契約文書が仮説と矛盾する         | 原則あり  |
| NotMentioned  | 契約文書には判断できる記載がない | 空        |
`;

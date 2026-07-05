import * as v from "valibot";
import { toJsonSchema } from "@valibot/to-json-schema";
import type OpenAI from "openai";

import { LabelSchema } from "../contract-nli/types.js";
import type { LlmClient, Usage } from "./types.js";

const PredictionSchema = v.object({
  label: LabelSchema,
  evidenceSpanIds: v.array(v.number()),
});

const requestTimeoutMs = 120_000;

// LLM 呼び出し client
export const llmClient: LlmClient = async (openai, model, systemPrompt, prompt) => {
  const { output: prediction, usage } = await structuredLlmClient(
    openai,
    model,
    systemPrompt,
    prompt,
    "contract_nli_prediction",
    PredictionSchema,
  );

  return {
    prediction,
    usage,
  };
};

export async function structuredLlmClient<
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  openai: OpenAI,
  model: string,
  systemPrompt: string,
  prompt: string,
  schemaName: string,
  schema: TSchema,
): Promise<{ output: v.InferOutput<TSchema>; usage: Usage }> {
  const jsonSchema = addAdditionalPropertiesFalse(
    toJsonSchema(schema, { target: "draft-07" }) as Record<string, unknown>,
  );

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
          name: schemaName,
          strict: true,
          schema: jsonSchema,
        },
      },
    },
    { timeout: requestTimeoutMs },
  );

  return {
    output: v.parse(schema, JSON.parse(response.output_text)),
    usage: toUsage(response.usage),
  };
}

function addAdditionalPropertiesFalse(value: Record<string, unknown>): Record<string, unknown> {
  return addAdditionalPropertiesFalseValue(value) as Record<string, unknown>;
}

function addAdditionalPropertiesFalseValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(addAdditionalPropertiesFalseValue);
  }

  if (!isJsonObject(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    result[key] = addAdditionalPropertiesFalseValue(nestedValue);
  }

  if (result["type"] === "object" && !("additionalProperties" in result)) {
    result["additionalProperties"] = false;
  }

  return result;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toUsage(
  usage: { input_tokens: number; output_tokens: number; total_tokens: number } | undefined,
): Usage {
  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

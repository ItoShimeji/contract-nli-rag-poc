import { chat } from "@tanstack/ai";
import type { ChatMiddleware } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import type { OpenAIChatModel } from "@tanstack/ai-openai";
import * as v from "valibot";

import { LabelSchema } from "../../contract-nli/types.js";
import type { LlmClient } from "./types.js";
import type { Usage } from "../types.js";

const outputSchema = v.object({
  label: LabelSchema,
  evidenceSpanIds: v.array(v.number()),
});

// LLM 呼び出し client
export const llmClient: LlmClient = async (model, prompt) => {
  // 使用量をリセット
  const usage: Usage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  const usageMiddleware: ChatMiddleware = {
    name: "usage",
    onUsage: (_ctx, u) => {
      usage.inputTokens += u.promptTokens;
      usage.outputTokens += u.completionTokens;
      usage.totalTokens += u.totalTokens;
    },
  };

  const prediction = await chat({
    // ここでの型 assertion は後で見直す必要がある
    adapter: openaiText(model as OpenAIChatModel),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    systemPrompts: [systemPrompt],
    outputSchema,
    middleware: [usageMiddleware],
  });

  return {
    prediction,
    usage,
  };
};

const systemPrompt = `
# 仮説判定タスク
- 提示された契約文書を根拠として、仮説を判定してください。
- ラベルは Entailment、Contradiction、NotMentioned のいずれかです。
- 根拠として使用したチャンク ID と短い説明も返してください。

## ラベル
| ラベル        | 意味                             | 根拠 span |
| --------------| -------------------------------- | --------- |
| Entailment    | 契約文書が仮説を支持する         | 原則あり  |
| Contradiction | 契約文書が仮説と矛盾する         | 原則あり  |
| NotMentioned  | 契約文書には判断できる記載がない | 空        |
`;

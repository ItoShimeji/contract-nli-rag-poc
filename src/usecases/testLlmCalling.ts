import type OpenAI from "openai";

import type { Usecase } from "./types.js";

export const testLlmCalling: Usecase<[openai: OpenAI, prompt: string]> = async (
  config,
  openai,
  prompt,
) => {
  const { output_text, usage } = await openai.responses.create({
    model: config.generationModel,
    input: prompt,
  });

  console.log({
    text: output_text,
    tokens: { input: usage?.input_tokens, output: usage?.output_tokens },
  });
};

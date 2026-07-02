import type OpenAI from "openai";

import type { LlmClient } from "../types.js";

export type DirectConfig = {
  model: string;
};

export type DirectDeps = {
  openai: OpenAI;
  llmClient: LlmClient;
  systemPrompt: string;
};

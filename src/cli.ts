import { cli, define } from "gunshi";
import OpenAI from "openai";

import { config } from "./config.js";
import { testLlmCalling } from "./usecases/testLlmCalling.js";
import { embedContractNli } from "./usecases/embedContractNli.js";
import { runDirectMethod } from "./usecases/runDirectMethod.js";
import { evaluate } from "./usecases/evaluate.js";
import { getEnv } from "./env.js";
import { consoleProgress } from "./progress.js";
import { runRagMethod } from "./usecases/runRagMethod.js";

const env = getEnv();
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const testCommand = define({
  name: "test",
  description: "Test LLM calling",
  args: {
    prompt: {
      type: "positional",
      description: "Prompt for LLM Calling",
      default: "RAG とはなにか 100 文字で説明してください。",
    },
  },
  run: async (ctx) => {
    await testLlmCalling(config, openai, ctx.values.prompt);
  },
});

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: async () => {
    await embedContractNli(config, openai, consoleProgress);
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: async () => {
    await runDirectMethod(config, openai, consoleProgress);
  },
});

const ragCommand = define({
  name: "rag",
  description: "Run RAG Rag",
  run: async () => {
    await runRagMethod(config, openai, consoleProgress);
  },
});

const evaluateCommand = define({
  name: "evaluate",
  description: "Evaluate result file",
  args: {
    method: {
      type: "positional",
      required: true,
      description: "Method name",
    },
  },
  run: async (ctx) => {
    await evaluate(config, ctx.values.method);
  },
});

const mainCommand = define({
  name: "contract-nli-rag-poc",
  description: "Contract NLI RAG POC",
  internal: true,
});

await cli(process.argv.slice(2), mainCommand, {
  name: "rag",
  version: "0.0.1",
  subCommands: {
    test: testCommand,
    embed: embedCommand,
    direct: directCommand,
    rag: ragCommand,
    evaluate: evaluateCommand,
  },
});

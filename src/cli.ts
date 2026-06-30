import { cli, define } from "gunshi";

import { config } from "./config.js";
import { embedContractNli } from "./usecases/embedContractNli.js";
import { runDirectMethod } from "./usecases/runDirectMethod.js";
import { evaluate } from "./usecases/evaluate.js";

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: async () => {
    await embedContractNli(config);
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: async () => {
    await runDirectMethod(config);
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
  name: "rag",
  description: "Contract NLI RAG POC",
  run: () => {
    console.log("Use a sub-command: embed or direct");
  },
});

await cli(process.argv.slice(2), mainCommand, {
  name: "rag",
  version: "0.0.1",
  subCommands: {
    embed: embedCommand,
    direct: directCommand,
    evaluate: evaluateCommand,
  },
});

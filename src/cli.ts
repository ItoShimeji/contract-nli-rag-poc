import { cli, define } from "gunshi";

const embedCommand = define({
  name: "embed",
  description: "Generate embedding data",
  run: () => {
    console.log("embed command");
  },
});

const directCommand = define({
  name: "direct",
  description: "Run Direct Rag",
  run: () => {
    console.error("todo");
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
  },
});

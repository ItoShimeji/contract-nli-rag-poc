import type { Prediction, PredictionInput, PredictionResult, PredictionStages } from "../types.js";
import { measureAsync } from "../measureAsync.js";
import { calcCosineSimilarity } from "./cosineSimilarity.js";
import { createEmbeddingRetriever } from "./retriever.js";
import { generatePrediction } from "./generator.js";
import { rerankSpans } from "./reranker.js";
import { verifyPrediction } from "./verifier.js";
import { sumUsage } from "./usage.js";
import type { RagConfig, RagDeps } from "./types.js";

export async function runRagPipeline(
  config: RagConfig,
  deps: RagDeps,
  input: PredictionInput,
): Promise<PredictionResult> {
  const retrieveTopK =
    config.pipeline === "simple" ? config.simpleTopK : config.rerankerCandidateTopK;
  const retriever = createEmbeddingRetriever(retrieveTopK, deps.cache, calcCosineSimilarity);

  const { result: retrievedSpans, durationMs: retrieveDurationMs } = await measureAsync(async () =>
    retriever({
      documentId: input.document.id,
      hypothesisId: input.example.hypothesisId,
    }),
  );

  const retrievedSpanIds = retrievedSpans.map((span) => span.spanId);
  const stages: PredictionStages = {
    retrieve: {
      latencyMs: retrieveDurationMs,
      spans: retrievedSpans,
    },
    generate: {
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      latencyMs: 0,
      prediction: { label: "NotMentioned", evidenceSpanIds: [] },
    },
  };

  let finalSpanIds = retrievedSpanIds;

  if (config.pipeline !== "simple") {
    const { result, durationMs } = await measureAsync(
      async () =>
        await rerankSpans(deps.openai, config.model, input, retrievedSpanIds, config.rerankerTopK),
    );

    stages.rerank = {
      usage: result.usage,
      latencyMs: durationMs,
      inputSpanIds: retrievedSpanIds,
      outputSpanIds: result.spanIds,
    };
    finalSpanIds = result.spanIds;
  }

  const { result: generated, durationMs: generateDurationMs } = await measureAsync(
    async () =>
      await generatePrediction(deps.openai, deps.llmClient, config.model, input, finalSpanIds),
  );

  stages.generate = {
    usage: generated.usage,
    latencyMs: generateDurationMs,
    prediction: generated.prediction,
  };

  let finalPrediction: Prediction = generated.prediction;

  if (config.pipeline === "rerank-verify") {
    const { result, durationMs } = await measureAsync(
      async () =>
        await verifyPrediction(
          deps.openai,
          config.model,
          input,
          finalSpanIds,
          generated.prediction,
        ),
    );

    stages.verify = {
      usage: result.usage,
      latencyMs: durationMs,
      decision: result.decision,
      predictionBefore: generated.prediction,
      predictionAfter: result.prediction,
    };
    finalPrediction = result.prediction;
  }

  return {
    label: finalPrediction.label,
    evidenceSpanIds: finalPrediction.evidenceSpanIds,
    usage: sumUsage(
      [stages.rerank?.usage, stages.generate.usage, stages.verify?.usage].filter(
        (usage) => usage !== undefined,
      ),
    ),
    latency: {
      totalMs:
        retrieveDurationMs +
        (stages.rerank?.latencyMs ?? 0) +
        stages.generate.latencyMs +
        (stages.verify?.latencyMs ?? 0),
    },
    stages,
  };
}

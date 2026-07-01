import type { MetricValue } from "../metric.js";
import type { Label } from "../contract-nli/types.js";

// 分類指標は「特定の label かどうか」を label ごとに見て計算する。
// LabelMetrics が Entailment の場合は以下のような具体例
// - TP (True Positive): Entailment と予測し、正解も Entailment だった件数。
// - FP (False Positive): Entailment と予測したが、正解は NotMentioned など別 label だった件数。
// - FN (False Negative): 正解は Entailment だったが、NotMentioned など別 label と予測した件数。
// - TN (True Negative): 正解も予測も Entailment ではなかった件数。
// precision は「その label と予測したもののうち、正しかった割合」。
// recall は「本当にその label だったもののうち、拾えた割合」。
// f1 は precision と recall の調和平均。

export type EvaluationSummary = {
  // 評価対象レコード数
  total: number;
  // predictedLabel === goldLabel の件数
  correct: number;
  // correct / total
  accuracy: number;
  labels: LabelEvaluationSummary;
  usage: UsageEvaluationSummary;
  latency: LatencyEvaluationSummary;
};

export type LabelEvaluationSummary = {
  // goldLabel ごとの分類指標
  byGoldLabel: Metrics;
  // 行を goldLabel、列を predictedLabel とする件数表
  confusionMatrix: ConfusionMatrix;
  // 各 label の f1 を単純平均
  macroF1: MetricValue;
  // 全 label の TP / FP / FN を合算して算出した f1
  microF1: MetricValue;
  // 各 label の f1 を support 件数で重み付け平均
  weightedF1: MetricValue;
};

export type LabelMetrics = {
  // goldLabel が対象 label だった件数
  total: number;
  // 対象 label で predictedLabel === goldLabel だった件数
  correct: number;
  // correct / total
  accuracy: MetricValue;
  // TP / (TP + FP)
  precision: MetricValue;
  // TP / (TP + FN)
  recall: MetricValue;
  // 2 * precision * recall / (precision + recall)
  f1: MetricValue;
};

export type ConfusionStats = {
  total: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
};

export type Metrics = Record<Label, LabelMetrics>;

export type ConfusionStatsRecord = Record<Label, ConfusionStats>;

export type ConfusionMatrix = Record<Label, Record<Label, number>>;

export type UsageEvaluationSummary = {
  // 各 record の usage.inputTokens の統計
  inputTokens: NumberStats;
  // 各 record の usage.outputTokens の統計
  outputTokens: NumberStats;
  // 各 record の usage.totalTokens の統計
  totalTokens: NumberStats;
};

export type LatencyEvaluationSummary = NumberStats & OverNsRates;

export type OverNsRates = {
  // latency.totalMs > 1000 の割合
  over1sRate: number;
  // latency.totalMs > 3000 の割合
  over3sRate: number;
  // latency.totalMs > 5000 の割合
  over5sRate: number;
  // latency.totalMs > 10000 の割合
  over10sRate: number;
};

export type NumberStats = {
  // 値の合計
  total: number;
  // total / count
  mean: number;
  // 最小値
  min: number;
  // 最大値
  max: number;
  // 50 percentile
  p50: number;
  // 90 percentile
  p90: number;
  // 95 percentile
  p95: number;
  // 99 percentile
  p99: number;
};

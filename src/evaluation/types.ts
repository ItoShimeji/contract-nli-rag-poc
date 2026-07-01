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
  // label 単体の評価。根拠 span が外れていても label が合っていれば正解として数える。
  label: LabelEvaluationSummary;
  // evidence span 単体の評価。label 正誤とは分けて、根拠の取り方だけを見る。
  evidence?: EvidenceEvaluationSummary;
  // label と evidence span の両方が正しい場合だけ正解とする評価。
  // 「根拠付きで正解したか」を見る主指標として使う。
  joint?: JointEvaluationSummary;
  usage: UsageEvaluationSummary;
  latency: LatencyEvaluationSummary;
};

export type LabelEvaluationSummary = {
  // 評価対象レコード数
  total: number;
  // predictedLabel === goldLabel の件数
  correct: number;
  // correct / total。これは label だけの accuracy で、evidence span の正誤は含めない。
  accuracy: number;
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

export type EvidenceEvaluationSummary = {
  // evidence span 評価対象レコード数。
  // Entailment / Contradiction は通常 gold span があるので対象になる。
  // NotMentioned は「根拠なし」を評価する場合は対象に含める。
  total: number;
  // span が評価基準を満たした件数
  correct: number;
  // correct / total。
  // label が外れていても span が gold と合っていれば evidence としては正解にできる。
  accuracy: MetricValue;
  // label が正解だった record に限定した span 正解率
  accuracyOnLabelCorrect: MetricValue;
  // goldLabel ごとの evidence 指標
  byGoldLabel: EvidenceMetrics;
};

export type EvidenceLabelMetrics = {
  // goldLabel が対象 label だった件数
  total: number;
  // span 評価対象件数。
  // NotMentioned で「根拠なし」を評価対象に含めるなら total と同じになる。
  // NotMentioned を overlap 指標から除外する設計なら 0 になり得る。
  evaluated: number;
  // 対象 label で span が評価基準を満たした件数
  correct: number;
  // correct / evaluated
  accuracy: MetricValue;
  // predictedEvidenceSpanIds のうち、goldEvidenceSpanIds と重なった割合。
  // 例: gold=[3,4], predicted=[4,5] なら overlap=[4] なので 1 / 2 = 0.5。
  // 余計な span を広く取りすぎると下がる。
  precision: MetricValue;
  // goldEvidenceSpanIds のうち、predictedEvidenceSpanIds が拾えた割合。
  // 例: gold=[3,4], predicted=[4,5] なら overlap=[4] なので 1 / 2 = 0.5。
  // 必要な span を取り漏らすと下がる。
  recall: MetricValue;
  // precision と recall の調和平均。
  // span を広く取りすぎる誤りと、狭く取りすぎる誤りの両方をまとめて見る。
  f1: MetricValue;
  // predictedEvidenceSpanIds と goldEvidenceSpanIds が完全一致した割合。
  // 順序は問わず、集合として同じ span id を持っていれば一致とする想定。
  exactMatch: MetricValue;
  // predictedEvidenceSpanIds が goldEvidenceSpanIds をすべて含んだ割合。
  // gold を含んでいれば、前後の余計な span があっても正解寄りに扱う緩い指標。
  containsGold: MetricValue;
  // goldEvidenceSpanIds と predictedEvidenceSpanIds に1つ以上共通 span があった割合。
  // 根拠に少しでも触れているかを見る最も緩い指標。
  hasOverlap: MetricValue;
};

export type JointEvaluationSummary = {
  // 評価対象レコード数
  total: number;
  // predictedLabel === goldLabel かつ evidence span も正しい件数
  correct: number;
  // correct / total
  accuracy: number;
  // goldLabel ごとの joint 指標
  byGoldLabel: JointMetrics;
};

export type JointLabelMetrics = {
  // goldLabel が対象 label だった件数
  total: number;
  // 対象 label で label と evidence span の両方が正しかった件数
  correct: number;
  // correct / total
  accuracy: MetricValue;
};

export type EvidenceMetrics = Record<Label, EvidenceLabelMetrics>;

export type JointMetrics = Record<Label, JointLabelMetrics>;

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

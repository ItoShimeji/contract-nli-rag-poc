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
  // 主指標の正解件数。
  // この研究ではまず exact match、つまり predictedEvidenceSpanIds と goldEvidenceSpanIds が
  // 集合として完全一致した件数を入れる。
  correct: number;
  // correct / total。
  // evidence span 単体の主指標で、label の正誤は含めない。
  correctRate: MetricValue;
  // predictedEvidenceSpanIds が goldEvidenceSpanIds をすべて含んだ件数。
  // exact match より緩い補助指標で、正しい根拠を含んでいるが余計な span もある場合を拾う。
  containsGoldCorrect: number;
  // containsGoldCorrect / total
  containsGoldRate: MetricValue;
  // goldEvidenceSpanIds と predictedEvidenceSpanIds に1つ以上共通 span があった件数。
  // 根拠に少しでも触れているかを見る最も緩い補助指標。
  hasOverlapCorrect: number;
  // hasOverlapCorrect / total
  hasOverlapRate: MetricValue;
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
  // この研究では exact match、つまり predictedEvidenceSpanIds と goldEvidenceSpanIds が
  // 集合として完全一致した件数を入れる。
  correct: number;
  // correct / evaluated。
  // exact match による span 正解率で、evidence の主指標として使う。
  correctRate: MetricValue;
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
  // predictedEvidenceSpanIds が goldEvidenceSpanIds をすべて含んだ件数。
  // 例: gold=[3,4], predicted=[2,3,4,5] なら exact match ではないが contains gold。
  containsGoldCorrect: number;
  // containsGoldCorrect / evaluated。
  // gold を含んでいれば、前後の余計な span があっても拾う緩い補助指標。
  containsGoldRate: MetricValue;
  // goldEvidenceSpanIds と predictedEvidenceSpanIds に1つ以上共通 span があった件数。
  hasOverlapCorrect: number;
  // hasOverlapCorrect / evaluated。
  // 根拠に少しでも触れているかを見る最も緩い補助指標。
  hasOverlapRate: MetricValue;
};

export type JointEvaluationSummary = {
  // 評価対象レコード数
  total: number;
  // 主指標の正解件数。
  // predictedLabel === goldLabel かつ evidence span が exact match だった件数。
  correct: number;
  // correct / total。
  // 「label も根拠 span も厳密に正しい」割合。
  accuracy: number;
  // predictedLabel === goldLabel かつ predictedEvidenceSpanIds が goldEvidenceSpanIds をすべて含んだ件数。
  containsGoldCorrect: number;
  // containsGoldCorrect / total。
  // label が正しく、必要な根拠も含められていた割合。余計な span は許す。
  containsGoldAccuracy: MetricValue;
  // predictedLabel === goldLabel かつ gold/predicted span に1つ以上重なりがあった件数。
  hasOverlapCorrect: number;
  // hasOverlapCorrect / total。
  // label が正しく、根拠にも少しは触れていた割合。
  hasOverlapAccuracy: MetricValue;
  // goldLabel ごとの joint 指標
  byGoldLabel: JointMetrics;
};

export type JointLabelMetrics = {
  // goldLabel が対象 label だった件数
  total: number;
  // 対象 label で label と evidence span の両方が正しかった件数
  // evidence span は exact match で判定する。
  correct: number;
  // correct / total
  accuracy: MetricValue;
  // 対象 label で predictedLabel === goldLabel かつ predictedEvidenceSpanIds が
  // goldEvidenceSpanIds をすべて含んだ件数。
  containsGoldCorrect: number;
  // containsGoldCorrect / total
  containsGoldAccuracy: MetricValue;
  // 対象 label で predictedLabel === goldLabel かつ gold/predicted span に
  // 1つ以上重なりがあった件数。
  hasOverlapCorrect: number;
  // hasOverlapCorrect / total
  hasOverlapAccuracy: MetricValue;
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

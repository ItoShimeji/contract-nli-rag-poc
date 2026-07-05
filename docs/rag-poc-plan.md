# RAG PoC 計画

本 PoC では、ContractNLI の契約文書と仮説文を対象に、契約書全文を LLM に渡す方式と、Embedding 検索で根拠候補を絞ってから渡す方式を比較する。

現段階では Agent までは扱わず、まず単純な判定手法と検索手法を同じ評価形式で実行できる状態を目指す。将来 Agent やより複雑な RAG を追加するときの比較基準として使えるように、精度、根拠取得、トークン数、レイテンシを記録する。

この PoC で確認したいことは、主に次の 2 点である。

- RAG によって LLM への入力を減らしても、全文入力と同程度のラベル判定ができるか。
- 正解ラベルだけでなく、判定に必要な gold evidence span を検索または出力できているか。

## 比較する方式

同じ ContractNLI の事例に対して、複数の方式を実行する。生成モデルと回答形式は揃え、LLM に渡す文書範囲だけを変える。

| 方式       | LLM への入力             |
| ---------- | ------------------------ |
| Direct LLM | 契約文書の全 span と仮説 |
| Simple RAG | 検索した上位 span と仮説 |

PoC では少数の文書から始める。プロンプト、出力検証、結果保存、評価集計が想定どおり動くことを確認した後、対象文書数を増やす。

## データセットの扱い

対象データセットは ContractNLI とする。

ContractNLI の文書には、契約全文 `text` と、文字位置 `[start, end]` で表される `spans` が含まれる。各 annotation は仮説 ID、ラベル、根拠 span のインデックスを持つ。

この PoC では、まず ContractNLI が提供する span を検索単位・根拠単位として扱う。固定長チャンクを独自に作る方式は、後続の比較対象として追加できる余地を残す。

```ts
type Label = "Entailment" | "Contradiction" | "NotMentioned";

type Document = {
  id: number;
  text: string;
  spans: Array<[number, number]>;
  annotations: Array<{
    hypothesisId: string;
    label: Label;
    spanIds: number[];
  }>;
};

type Hypothesis = {
  id: string;
  description: string;
  text: string;
};
```

## RAG の構成

RAG は、文書 span の事前 embedding と、仮説ごとの検索・回答生成に分ける。

```text
ContractNLI 文書
  ↓
span 単位に本文を切り出す
  ↓
各 span の Embedding を生成・保存

仮説文
  ↓
仮説文の Embedding を生成
  ↓
対象文書内の span embedding と類似度を計算
  ↓
上位 k 件の span を取得
  ↓
仮説文と取得 span を LLM に入力
  ↓
ラベル・根拠 span ID を出力
```

小規模な検証なので、ベクトルデータベースは使わない。Embedding は JSON に保存し、検索時には対象文書内の全 span とのコサイン類似度を計算する。

検索結果は、span のインデックス、類似度、順位を持つ。

```ts
type RetrievedSpan = {
  documentId: number;
  spanIndex: number;
  text: string;
  start: number;
  end: number;
  score: number;
  rank: number;
};
```

## 実装方針

- `TypeScript`: 言語
- `Node.js`: 実行環境
- `pnpm`: パッケージ管理
- `gunshi`: CLI
- `OpenAI API`: 回答生成と Embedding 生成
- `TanStack AI`: LLM 呼び出しの抽象化
- `valibot`: 入力データと LLM 出力の検証
- `Vitest`: 単体テスト

### ディレクトリ案

```text
src/
  cli.ts                    # CLI エントリポイント
  config.ts                 # 実験設定
  contract-nli/             # ContractNLI 固有の型・正規化・span 分割
  embedding/                # embedding 生成と cache 保存
  methods/                  # 判定手法
    direct/                 # Direct LLM
    rag/                    # Simple RAG
  results/                  # 実行結果ファイルの型・保存・読み込み
  evaluation/               # 結果ファイルからの評価集計
  usecases/                 # CLI から呼び出すユースケース
```

## 実験設定

モデル名や検索条件はコードに散らさず、実験設定として管理し、結果と一緒に保存する。

初回は次の値を仮置きする。

```ts
type ExperimentConfig = {
  generationModel: string;
  embeddingModel: string;
  dataPath: string;
  embeddingDir: string;
  resultDir: string;
  rag: {
    simpleTopK: number;
    rerankerCandidateTopK: number;
    rerankerTopK: number;
  };
  execution: {
    methodConcurrency: number;
  };
};

const config: ExperimentConfig = {
  generationModel: "gpt-5.4-nano",
  embeddingModel: "text-embedding-3-small",
  dataPath: "data/sample.json",
  embeddingDir: "data/cache/embedding",
  resultDir: "results",
  rag: {
    simpleTopK: 5,
    rerankerCandidateTopK: 20,
    rerankerTopK: 5,
  },
  execution: {
    methodConcurrency: 3,
  },
};
```

固定長チャンクを追加する場合は、`chunkSize` と `chunkOverlap` を別の method config として持たせる。

## Embedding キャッシュ

事前処理では、文書ごとに span 本文を切り出し、Embedding API へまとめて送る。結果は、入力ファイル、Embedding モデル、embedding 次元、document ID、span index とともに JSON へ保存する。

```ts
type EmbeddingCache = {
  version: 1;
  source: {
    dataset: "contract-nli";
    inputFile: string;
  };
  embedding: {
    provider: "openai";
    model: string;
    dimensions: number;
  };
  createdAt: string;
  items: Record<
    string,
    {
      documentId: number;
      spanIndex: number;
      embedding: number[];
    }
  >;
};
```

キャッシュの key は、データセット、文書 ID、span index が分かる形式にする。検索時にはこのキャッシュを読み込み、対象文書の span embedding だけを比較対象にする。

## LLM 出力

Direct LLM と Simple RAG は、どちらも同じ出力形式を使う。

```ts
type Prediction = {
  label: Label;
  evidenceSpanIds: number[];
};
```

LLM には、提示された契約文書だけを根拠に判定させる。Direct LLM では文書の全 span を原文順に並べる。Simple RAG では検索上位 span だけを並べる。

span は次のように ID 付きで提示する。

```text
[chunk 0]
...

[chunk 1]
...
```

プロンプトの中心部分は次の形にする。

```text
提示された契約文書を根拠として、仮説を判定してください。
ラベルは Entailment、Contradiction、NotMentioned のいずれかです。
根拠として使用した span ID を返してください。

仮説:
{hypothesis}

契約文書:
{evidence}
```

## 結果保存

LLM/API を呼び出す実行と、結果の評価・集計は分離する。method を実行した段階では、予測、gold label、usage、latency を結果ファイルに保存する。評価コマンドは LLM/API を再実行せず、この結果ファイルを入力として扱う。

結果ファイルは method 単位の JSON とする。

```text
result/
  direct.json
  rag.json
```

想定する結果ファイルの形は次のとおり。

```ts
type ResultFile = {
  method: {
    name: string;
    config: Record<string, unknown>;
  };
  records: ResultRecord[];
};

type ResultRecord = {
  documentId: number;
  hypothesisId: string;
  goldLabel: Label;
  predictedLabel: Label;
  goldEvidenceSpanIds: number[];
  predictedEvidenceSpanIds: number[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latency: {
    totalMs: number;
  };
};
```

Simple RAG では、追加で取得 span の順位とスコアを記録する。

```ts
type RagResultRecord = ResultRecord & {
  retrievedSpans: Array<{
    documentId: number;
    spanIndex: number;
    rank: number;
    score: number;
  }>;
};
```

## 評価と計測

PoC では次の項目を計測する。

- ラベル正答率
- label ごとの precision / recall / F1
- confusion matrix
- Evidence Recall@k
- gold evidence が最初に現れた順位
- LLM の input / output / total tokens
- Embedding の token 数
- 回答生成と検索にかかった時間
- API 利用料金の推定値

特に、gold evidence を取得できた場合とできなかった場合でラベル正答率がどう変わるかを見る。これにより、誤答が検索の失敗によるものか、取得した根拠を使った判定の失敗によるものかを分けて確認できる。

## CLI

PoC の CLI は、実行と評価を分ける。

```text
pnpm cli embed
pnpm cli direct
pnpm cli rag
pnpm cli rag --pipeline rerank
pnpm cli rag --pipeline rerank-verify
pnpm cli evaluate direct
pnpm cli evaluate rag
pnpm cli evaluate rag-rerank
pnpm cli evaluate rag-rerank-verify
```

`embed` は embedding cache を作成する。`direct` と `rag` は method を実行して結果ファイルを保存する。`evaluate` は保存済みの結果ファイルを読み込み、精度、token、latency を集計する。

## PoC の到達点

- 同じ ContractNLI 事例に対して Direct LLM と Simple RAG を実行できる。
- RAG が取得した span と類似度を確認できる。
- 予測ラベルと gold label、取得 span と gold evidence span を比較できる。
- 品質、トークン数、処理時間、推定料金を方式ごとに集計できる。
- 実験設定と結果を保存し、同じ条件で再実行できる。

この段階では、RAG が Direct LLM より優れていることまでは成功条件にしない。RAG の検索失敗と生成失敗を切り分けて観察でき、次にどの処理を追加すべきか判断できれば、PoC として成立したと考える。

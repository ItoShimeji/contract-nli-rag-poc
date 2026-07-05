# contract-nli-rag-poc

AI システムのタスクごとの精度、コスト、遅延を評価するための PoC です。

最終的には Rust で実装する予定ですが、その前段として、開発速度を優先して TypeScript で実験しています。

ContractNLI を実際に走らせながら、契約文書 NLI タスクでどの程度の精度が出るのか、手法ごとの token 使用量やレイテンシがどう変わるのかを確認します。あわせて、データセット処理、RAG、LLM 評価の実装を学ぶことも目的にしています。

## データセット

対象データセットは ContractNLI です。

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| 対象文書     | NDA                                           |
| 文書数       | 607 件                                        |
| 仮説数       | 17 個                                         |
| ラベル       | `Entailment`, `Contradiction`, `NotMentioned` |
| ファイル形式 | JSON                                          |
| ライセンス   | CC BY 4.0                                     |

各文書には契約全文 `text` と、文字位置の `[start, end]` で表される `spans` が含まれます。アノテーションには、仮説 ID ごとのラベルと根拠 span のインデックスが含まれます。

## ラベル

| ラベル          | 意味                             |
| --------------- | -------------------------------- |
| `Entailment`    | 契約文書が仮説を支持する         |
| `Contradiction` | 契約文書が仮説と矛盾する         |
| `NotMentioned`  | 契約文書には判断できる記載がない |

`Entailment` / `Contradiction` には原則として根拠 span が付与されます。`NotMentioned` は、関連しそうな記述があっても支持・矛盾とまでは言えないケースを含みます。

## 技術スタック

| 項目                 | 内容           |
| -------------------- | -------------- |
| 言語                 | TypeScript     |
| ランタイム           | Node.js        |
| パッケージマネージャ | pnpm           |
| CLI                  | gunshi         |
| LLM / embedding      | OpenAI API     |
| LLM 呼び出し         | TanStack AI    |
| スキーマ検証         | valibot        |
| テスト               | Vitest         |
| formatter / linter   | oxfmt / oxlint |

## ディレクトリ構成

```text
src/
  cli.ts                    # CLI エントリポイント
  config.ts                 # 実験設定
  contract-nli/             # ContractNLI 固有の型・データセット処理
  embedding/                # embedding 生成と cache 保存
  methods/                  # 判定手法
  results/                  # 実行結果ファイルの型・保存形式
  usecases/                 # CLI から呼び出すユースケース
```

## 実行結果と評価の方針

LLM/API を呼び出す実行と、結果の評価・集計は分離します。

```text
method を実行
  -> prediction, gold label, usage, latency を結果ファイルに記録
  -> 後から結果ファイルを読み込んで精度・コスト・遅延を集計
```

生成される結果ファイルは、生成モデル名と method 名で整理します。

```text
results/
  gpt-5.4-nano/
    direct.json
    direct.summary.json
```

結果ファイルには method の名前・設定、入力データセット、各 document / hypothesis ごとの予測、正解ラベル、token 使用量、レイテンシを残します。評価コマンドは LLM/API を再実行せず、この結果ファイルを入力として扱います。

## 結果の可視化

summary JSON から分析用の図を生成します。

```sh
uv run scripts/visualize_results.py \
  --result-dir results/gpt-5.4-mini \
  --out-dir analysis/gpt-5.4-mini
```

## 検証したいこと

- 契約全文を LLM に渡す direct 判定の限界
- span embedding による根拠候補検索の有効性
- `NotMentioned` に対する過剰な根拠提示の抑制
- 仮説タイプごとの難しさ
- 根拠 span の位置や数が判定精度に与える影響

## 参考

- [ContractNLI 公式ページ](https://stanfordnlp.github.io/contract-nli/)
- [ContractNLI 論文](https://aclanthology.org/2021.findings-emnlp.164/)

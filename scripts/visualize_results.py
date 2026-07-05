# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "matplotlib>=3.9",
#   "pandas>=2.2",
#   "seaborn>=0.13",
# ]
# ///

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
import pandas as pd
import seaborn as sns


METHOD_ORDER = ["direct", "rag", "rag-rerank", "rag-rerank-verify"]
LABEL_ORDER = ["Entailment", "NotMentioned", "Contradiction"]
STAGE_ORDER = ["retrieve", "rerank", "generate", "verify"]


def nested_get(data: dict[str, Any], path: str, default: Any = math.nan) -> Any:
    current: Any = data
    for key in path.split("."):
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    if current is None:
        return default
    return current


def to_number(value: Any) -> float:
    if value is None:
        return math.nan
    try:
        return float(value)
    except (TypeError, ValueError):
        return math.nan


def method_sort_key(method: str) -> tuple[int, str]:
    if method in METHOD_ORDER:
        return (METHOD_ORDER.index(method), method)
    return (len(METHOD_ORDER), method)


def load_summaries(result_dir: Path) -> dict[str, dict[str, Any]]:
    summaries: dict[str, dict[str, Any]] = {}
    for path in sorted(result_dir.glob("*.summary.json")):
        method = path.name.removesuffix(".summary.json")
        with path.open("r", encoding="utf-8") as file:
            summaries[method] = json.load(file)
    return dict(sorted(summaries.items(), key=lambda item: method_sort_key(item[0])))


def build_metrics_table(summaries: dict[str, dict[str, Any]]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for method, summary in summaries.items():
        rows.append(
            {
                "method": method,
                "label_accuracy": to_number(nested_get(summary, "label.accuracy")),
                "label_macro_f1": to_number(nested_get(summary, "label.macroF1")),
                "label_weighted_f1": to_number(nested_get(summary, "label.weightedF1")),
                "evidence_exact": to_number(nested_get(summary, "evidence.correctRate")),
                "evidence_contains_gold": to_number(
                    nested_get(summary, "evidence.containsGoldRate")
                ),
                "evidence_has_overlap": to_number(
                    nested_get(summary, "evidence.hasOverlapRate")
                ),
                "joint_exact": to_number(nested_get(summary, "joint.accuracy")),
                "mean_total_tokens": to_number(
                    nested_get(summary, "usage.totalTokens.mean")
                ),
                "mean_input_tokens": to_number(
                    nested_get(summary, "usage.inputTokens.mean")
                ),
                "mean_latency": to_number(nested_get(summary, "latency.mean")),
            }
        )
    return pd.DataFrame(rows)


def build_label_f1_table(summaries: dict[str, dict[str, Any]]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for method, summary in summaries.items():
        for label in LABEL_ORDER:
            rows.append(
                {
                    "method": method,
                    "label": label,
                    "f1": to_number(
                        nested_get(summary, f"label.byGoldLabel.{label}.f1")
                    ),
                }
            )
    return pd.DataFrame(rows)


def build_stage_cost_table(summaries: dict[str, dict[str, Any]]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for method, summary in summaries.items():
        stages = summary.get("stages")
        if not isinstance(stages, dict) or not stages:
            continue
        for stage in STAGE_ORDER:
            stage_data = stages.get(stage)
            if isinstance(stage_data, dict):
                latency_mean = to_number(nested_get(stage_data, "latency.mean"))
                if "usage" in stage_data:
                    total_tokens_mean = to_number(
                        nested_get(stage_data, "usage.totalTokens.mean")
                    )
                    input_tokens_mean = to_number(
                        nested_get(stage_data, "usage.inputTokens.mean")
                    )
                else:
                    total_tokens_mean = 0.0
                    input_tokens_mean = 0.0
            else:
                latency_mean = math.nan
                total_tokens_mean = math.nan
                input_tokens_mean = math.nan
            rows.append(
                {
                    "method": method,
                    "stage": stage,
                    "latency_mean": latency_mean,
                    "total_tokens_mean": total_tokens_mean,
                    "input_tokens_mean": input_tokens_mean,
                }
            )
    return pd.DataFrame(rows)


def save_quality_cost_tradeoff(metrics: pd.DataFrame, out_dir: Path) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.8), sharex=True)
    plots = [
        ("joint_exact", "Joint Exact", "Joint accuracy vs token cost"),
        ("label_macro_f1", "Label Macro F1", "Macro F1 vs token cost"),
    ]

    for axis, (y_column, y_label, title) in zip(axes, plots, strict=True):
        plot_data = metrics[["method", "mean_total_tokens", y_column]].dropna()
        sns.scatterplot(
            data=plot_data,
            x="mean_total_tokens",
            y=y_column,
            hue="method",
            hue_order=[m for m in METHOD_ORDER if m in plot_data["method"].values],
            s=90,
            ax=axis,
            legend=False,
        )
        for _, row in plot_data.iterrows():
            axis.annotate(
                row["method"],
                (row["mean_total_tokens"], row[y_column]),
                textcoords="offset points",
                xytext=(6, 6),
                fontsize=9,
            )
        axis.set_title(title)
        axis.set_xlabel("Mean total tokens")
        axis.set_ylabel(y_label)
        axis.yaxis.set_major_formatter(PercentFormatter(xmax=1.0))
        axis.grid(True, alpha=0.25)

    fig.suptitle("Quality / Cost Trade-off", fontsize=14, y=1.02)
    fig.tight_layout()
    fig.savefig(out_dir / "quality_cost_tradeoff.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def save_metric_ranking_heatmap(metrics: pd.DataFrame, out_dir: Path) -> None:
    columns = {
        "Label Accuracy": "label_accuracy",
        "Macro F1": "label_macro_f1",
        "Evidence Exact": "evidence_exact",
        "Evidence Contains Gold": "evidence_contains_gold",
        "Joint Exact": "joint_exact",
        "Mean Tokens": "mean_total_tokens",
        "Mean Latency": "mean_latency",
    }
    rank_table = pd.DataFrame(index=metrics["method"])
    for display_name, source_column in columns.items():
        ascending = display_name in {"Mean Tokens", "Mean Latency"}
        rank_table[display_name] = metrics[source_column].rank(
            ascending=ascending,
            method="min",
        ).to_numpy()

    fig, axis = plt.subplots(figsize=(12, 5.2))
    sns.heatmap(
        rank_table,
        annot=True,
        fmt=".0f",
        cmap="viridis_r",
        linewidths=0.5,
        linecolor="white",
        cbar_kws={"label": "Rank (1 = best)"},
        ax=axis,
    )
    axis.set_title("Workflow Ranking by Metric")
    axis.set_xlabel("Metric")
    axis.set_ylabel("Method")
    axis.set_xticklabels(axis.get_xticklabels(), rotation=30, ha="right")
    fig.tight_layout()
    fig.savefig(out_dir / "metric_ranking_heatmap.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def save_label_f1_by_method(label_f1: pd.DataFrame, out_dir: Path) -> None:
    fig, axis = plt.subplots(figsize=(9, 5))
    sns.barplot(
        data=label_f1,
        x="label",
        y="f1",
        hue="method",
        order=LABEL_ORDER,
        hue_order=[m for m in METHOD_ORDER if m in label_f1["method"].values],
        ax=axis,
    )
    axis.set_title("Label F1 by Method")
    axis.set_xlabel("Gold label")
    axis.set_ylabel("F1")
    axis.yaxis.set_major_formatter(PercentFormatter(xmax=1.0))
    axis.set_ylim(0, 1)
    axis.grid(axis="y", alpha=0.25)
    axis.legend(title="Method", frameon=False, loc="best")
    fig.tight_layout()
    fig.savefig(out_dir / "label_f1_by_method.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def confusion_matrix_frame(summary: dict[str, Any]) -> pd.DataFrame:
    matrix = nested_get(summary, "label.confusionMatrix", default={})
    rows: list[list[float]] = []
    for gold_label in LABEL_ORDER:
        row: list[float] = []
        for predicted_label in LABEL_ORDER:
            value = math.nan
            if isinstance(matrix, dict):
                value = to_number(
                    matrix.get(gold_label, {}).get(predicted_label)
                    if isinstance(matrix.get(gold_label), dict)
                    else math.nan
                )
            row.append(value)
        rows.append(row)
    return pd.DataFrame(rows, index=LABEL_ORDER, columns=LABEL_ORDER)


def save_confusion_matrices(summaries: dict[str, dict[str, Any]], out_dir: Path) -> None:
    methods = list(summaries.keys())
    matrices = {method: confusion_matrix_frame(summary) for method, summary in summaries.items()}
    vmax = max(
        (
            matrix.to_numpy(dtype=float)[~pd.isna(matrix.to_numpy(dtype=float))].max()
            for matrix in matrices.values()
            if not matrix.isna().all().all()
        ),
        default=1,
    )

    fig, axes = plt.subplots(2, 2, figsize=(10, 8), sharex=True, sharey=True)
    for axis, method in zip(axes.flatten(), METHOD_ORDER, strict=False):
        if method not in matrices:
            axis.axis("off")
            continue
        sns.heatmap(
            matrices[method],
            annot=True,
            fmt=".0f",
            cmap="Blues",
            vmin=0,
            vmax=vmax,
            cbar=False,
            linewidths=0.5,
            linecolor="white",
            ax=axis,
        )
        axis.set_title(method)
        axis.set_xlabel("Predicted label")
        axis.set_ylabel("Gold label")

    for axis in axes.flatten()[len(METHOD_ORDER) :]:
        axis.axis("off")

    fig.suptitle("Confusion Matrices", fontsize=14)
    fig.tight_layout()
    fig.savefig(out_dir / "confusion_matrices.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def save_stage_cost(stage_cost: pd.DataFrame, out_dir: Path) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(12, 5), sharex=True)

    if stage_cost.empty:
        for axis in axes:
            axis.text(0.5, 0.5, "No stage data", ha="center", va="center")
            axis.axis("off")
    else:
        method_order = [
            method
            for method in METHOD_ORDER
            if method in set(stage_cost["method"].dropna())
        ]
        colors = sns.color_palette("Set2", n_colors=len(STAGE_ORDER))

        for axis, value_column, title, y_label in [
            (axes[0], "latency_mean", "Stage Latency", "Mean latency (ms)"),
            (axes[1], "total_tokens_mean", "Stage Token Usage", "Mean total tokens"),
        ]:
            pivot = (
                stage_cost.pivot(index="method", columns="stage", values=value_column)
                .reindex(index=method_order, columns=STAGE_ORDER)
                .fillna(0)
            )
            bottom = pd.Series(0.0, index=pivot.index)
            for stage, color in zip(STAGE_ORDER, colors, strict=True):
                values = pivot[stage]
                axis.bar(
                    pivot.index,
                    values,
                    bottom=bottom,
                    label=stage,
                    color=color,
                    edgecolor="white",
                    linewidth=0.5,
                )
                bottom += values
            axis.set_title(title)
            axis.set_xlabel("Method")
            axis.set_ylabel(y_label)
            axis.tick_params(axis="x", rotation=20)
            axis.grid(axis="y", alpha=0.25)

        axes[1].legend(
            title="Stage",
            frameon=False,
            loc="center left",
            bbox_to_anchor=(1.02, 0.5),
            borderaxespad=0,
        )

    fig.suptitle("Stage Cost Breakdown", fontsize=14)
    fig.tight_layout(rect=(0, 0, 0.9, 1))
    fig.savefig(out_dir / "stage_cost.png", dpi=220, bbox_inches="tight")
    plt.close(fig)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate analysis figures from result summary JSON files.",
    )
    parser.add_argument(
        "--result-dir",
        required=True,
        type=Path,
        help="Directory containing *.summary.json files.",
    )
    parser.add_argument(
        "--out-dir",
        required=True,
        type=Path,
        help="Directory where PNG and CSV files will be written.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result_dir = args.result_dir
    out_dir = args.out_dir

    if not result_dir.exists():
        raise SystemExit(f"Result directory does not exist: {result_dir}")

    out_dir.mkdir(parents=True, exist_ok=True)
    sns.set_theme(style="whitegrid", context="notebook", font_scale=1.1)

    summaries = load_summaries(result_dir)
    if not summaries:
        raise SystemExit(f"No summary JSON files found in: {result_dir}")

    metrics = build_metrics_table(summaries)
    label_f1 = build_label_f1_table(summaries)
    stage_cost = build_stage_cost_table(summaries)

    metrics.to_csv(out_dir / "metrics_table.csv", index=False)
    label_f1.to_csv(out_dir / "label_f1_table.csv", index=False)
    stage_cost.to_csv(out_dir / "stage_cost_table.csv", index=False)

    save_quality_cost_tradeoff(metrics, out_dir)
    save_metric_ranking_heatmap(metrics, out_dir)
    save_label_f1_by_method(label_f1, out_dir)
    save_confusion_matrices(summaries, out_dir)
    save_stage_cost(stage_cost, out_dir)

    print(f"Wrote analysis artifacts to {out_dir}")


if __name__ == "__main__":
    main()

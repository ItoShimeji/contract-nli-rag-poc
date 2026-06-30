import type { ExperimentConfig } from "../config.ts";

export type Usecase<ExtraArgs extends unknown[] = []> = (
  config: ExperimentConfig,
  ...args: ExtraArgs
) => Promise<void>;

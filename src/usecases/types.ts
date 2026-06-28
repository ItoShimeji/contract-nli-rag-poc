import type { ExperimentConfig } from "../config.ts";

export type Usecase = (config: ExperimentConfig) => Promise<void>;

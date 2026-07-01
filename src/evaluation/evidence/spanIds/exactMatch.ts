import type { IsCorrect } from "./types.js";

export const isExactMatch: IsCorrect = (gold: number[], prediction: number[]) => {
  if (gold.length !== prediction.length) {
    return false;
  }

  const sortedGold = gold.toSorted((a, b) => a - b);
  const sortedPrediction = prediction.toSorted((a, b) => a - b);

  for (let i = 0; i < gold.length; i++) {
    if (sortedGold[i] !== sortedPrediction[i]) {
      return false;
    }
  }

  return true;
};

import type { IsCorrect } from "./types.js";

export const isContainingGold: IsCorrect = (gold: number[], prediction: number[]) => {
  if (gold.length === 0) {
    return false;
  }

  if (gold.length > prediction.length) {
    return false;
  }

  const sortedGold = gold.toSorted((a, b) => a - b);
  const sortedPrediction = prediction.toSorted((a, b) => a - b);

  let j = 0;
  outer: for (let i = 0; i < gold.length; i++) {
    for (; j < prediction.length; j++) {
      if (sortedGold[i] === sortedPrediction[j]) {
        j++;
        continue outer;
      }
    }
    return false;
  }

  return true;
};

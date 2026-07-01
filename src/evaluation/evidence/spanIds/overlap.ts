import type { IsCorrect } from "./types.js";

export const isOverlapping: IsCorrect = (gold: number[], prediction: number[]) => {
  const sortedGold = gold.toSorted((a, b) => a - b);
  const sortedPrediction = prediction.toSorted((a, b) => a - b);

  let i = 0;
  let j = 0;
  while (i < sortedGold.length && j < sortedPrediction.length) {
    const id_gold = sortedGold[i]!;
    const id_prediction = sortedPrediction[j]!;

    if (id_gold === id_prediction) {
      return true;
    } else if (id_gold < id_prediction) {
      i++;
    } else {
      j++;
    }
  }

  return false;
};

export type MetricValue = number | null;

export const divideOrNull = (numerator: number, denominator: number): MetricValue => {
  if (Number.isNaN(numerator) || Number.isNaN(denominator)) return null;
  return denominator === 0 ? null : numerator / denominator;
};

export const isMetricNumber = (value: MetricValue): value is number => {
  return value !== null;
};

export const meanOrNull = (values: MetricValue[]): MetricValue => {
  const validValues = values.filter(isMetricNumber);
  if (validValues.length === 0) return null;

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

export const expectMetricValueToBe = (
  actual: MetricValue,
  expected: MetricValue,
  label = "metric",
): void => {
  if (Object.is(actual, expected)) return;

  throw new Error(
    `${label}: expected ${formatMetricValue(expected)}, received ${formatMetricValue(actual)}`,
  );
};

export const expectMetricValueToBeCloseTo = (
  actual: MetricValue,
  expected: MetricValue,
  digits = 2,
  label = "metric",
): void => {
  if (actual === null || expected === null) {
    expectMetricValueToBe(actual, expected, label);
    return;
  }

  const tolerance = 0.5 * 10 ** -digits;
  const diff = Math.abs(actual - expected);
  if (diff < tolerance) return;

  throw new Error(
    `${label}: expected ${formatMetricValue(actual)} to be close to ${formatMetricValue(expected)} with ${digits} digits`,
  );
};

const formatMetricValue = (value: MetricValue): string => {
  return Number.isNaN(value) ? "NaN" : String(value);
};

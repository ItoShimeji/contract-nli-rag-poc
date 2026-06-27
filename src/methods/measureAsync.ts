export async function measureAsync<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();

  const result = await fn();

  const end = performance.now();

  return {
    result,
    durationMs: end - start,
  };
}

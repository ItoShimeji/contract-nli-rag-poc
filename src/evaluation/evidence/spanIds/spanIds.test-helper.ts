export function getLongSpanIds(): number[] {
  const ids = Array.from({ length: 1000 }, (_, i) => 2 * (i + 1));

  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }

  return ids;
}

/**
 * In-place Fisher–Yates. Same length as `ids`; mutates a copy, never the input.
 */
export function shuffleIdsInPlace(ids: string[], random: () => number = Math.random): string[] {
  const a = [...ids]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export const HEARTS_STORAGE_KEY = 'voluntail.hearts.v1' as const

const STORAGE_KEY = HEARTS_STORAGE_KEY

/** Same-tab notification when hearts change (localStorage does not trigger React). */
export const HEARTS_CHANGED_EVENT = 'voluntail-hearts-changed'

function notifyHeartsChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(HEARTS_CHANGED_EVENT))
}

/** Subscribe to heart add/remove from any `HeartButton` or storage helper. */
export function subscribeHeartsChanged(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (): void => {
    handler()
  }
  window.addEventListener(HEARTS_CHANGED_EVENT, listener)
  return () => window.removeEventListener(HEARTS_CHANGED_EVENT, listener)
}

/**
 * Normalize a JSON-parsed array: keep non-empty trimmed strings, first-seen order, deduped.
 * Drops nulls, numbers, duplicates, and empty strings so counts stay trustworthy.
 */
export function normalizeHeartIdsFromStorage(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of raw) {
    if (typeof x !== 'string') continue
    const id = x.trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

function persistNeedsRepair(parsed: unknown[], normalized: string[]): boolean {
  return JSON.stringify(normalized) !== JSON.stringify(parsed)
}

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      writeIds([])
      notifyHeartsChanged()
      return []
    }
    const normalized = normalizeHeartIdsFromStorage(parsed)
    if (persistNeedsRepair(parsed, normalized)) {
      writeIds(normalized)
      notifyHeartsChanged()
    }
    return normalized
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
      notifyHeartsChanged()
    } catch {
      /* ignore */
    }
    return []
  }
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // quota exceeded — silently ignore
  }
}

export function getHeartedIds(): Set<string> {
  return new Set(readIds())
}

export function isHearted(id: string): boolean {
  const t = id.trim()
  if (!t) return false
  return readIds().includes(t)
}

export function addHeartedId(id: string): void {
  const trimmed = id.trim()
  if (!trimmed) return
  const ids = readIds()
  if (!ids.includes(trimmed)) {
    ids.push(trimmed)
    writeIds(ids)
    notifyHeartsChanged()
  }
}

export function removeHeartedId(id: string): void {
  const t = id.trim()
  if (!t) return
  const ids = readIds()
  const next = ids.filter((x) => x !== t)
  if (next.length === ids.length) return
  writeIds(next)
  notifyHeartsChanged()
}

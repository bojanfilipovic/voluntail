const STORAGE_KEY = 'voluntail.hearts.v1'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
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
  return readIds().includes(id)
}

export function addHeartedId(id: string): void {
  const ids = readIds()
  if (!ids.includes(id)) {
    ids.push(id)
    writeIds(ids)
  }
}

export function removeHeartedId(id: string): void {
  writeIds(readIds().filter((x) => x !== id))
}

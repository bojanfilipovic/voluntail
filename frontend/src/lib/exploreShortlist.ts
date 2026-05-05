import { EXPLORE_STORAGE_KEY } from '@/explore/types'

export function getShortlistIds(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPLORE_STORAGE_KEY)
    if (!raw) return new Set()
    const o = JSON.parse(raw) as { shortlistIds?: unknown }
    if (Array.isArray(o.shortlistIds)) {
      return new Set(o.shortlistIds.filter((x: unknown): x is string => typeof x === 'string'))
    }
    return new Set()
  } catch {
    return new Set()
  }
}

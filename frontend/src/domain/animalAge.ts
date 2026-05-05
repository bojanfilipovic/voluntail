/**
 * Attempt to parse a birth date from a DOA-style description
 * (e.g. "Chihuahua, vrouwelijk, 29 Jul 2015") and return a
 * human-readable age string in rounded years.
 *
 * Returns null if no parseable date is found.
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

// Matches "DD Mon YYYY" at the end of the description (after the last comma)
const DATE_RE = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/

export function parseAnimalAge(description: string): string | null {
  const match = description.match(DATE_RE)
  if (!match) return null

  const day = Number(match[1])
  const monthKey = match[2].toLowerCase()
  const year = Number(match[3])
  const month = MONTHS[monthKey]
  if (month === undefined) return null

  const birth = new Date(year, month, day)
  if (isNaN(birth.getTime())) return null

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }

  if (years < 1) return '< 1 year'
  return `~${years} ${years === 1 ? 'year' : 'years'}`
}

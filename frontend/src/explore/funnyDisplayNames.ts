/** Picked once when the user has not set a display name; stored in explore session. */
export const FUNNY_DISPLAY_NAME_SAMPLES = [
  'Patron Saint of Nose Boops',
  'Certified Belly-Rub Enthusiast',
  'Future Foster Failure (Worth It)',
  'The Treat Budget Committee',
  'Chaos, But Make It Cuddly',
  'Emotionally Available for Snoots',
] as const

export function pickFunnyDisplayName(): string {
  const i = Math.floor(Math.random() * FUNNY_DISPLAY_NAME_SAMPLES.length)
  return FUNNY_DISPLAY_NAME_SAMPLES[i]!
}

/** Picked once when the user has not set a display name; stored in explore session. */
export const FUNNY_DISPLAY_NAME_SAMPLES = [
  'Patron Saint of Nose Boops',
  'Certified Belly-Rub Enthusiast',
  'Future Foster Failure (Worth It)',
  'The Treat Budget Committee',
  'Chaos, But Make It Cuddly',
  'Emotionally Available for Snoots',
  'Professional Zoomies Spectator',
  'One More Won't Hurt (It Will)',
  'Head of Snack Negotiations',
  'Fluffy Enabler Anonymous',
  'Walking Red Flag (For My Landlord)',
  'Allergic But Committed',
  'Impulse Adoption Risk: High',
  'Emotional Support Human',
  'Couch Space? What Couch Space?',
  'Chief Paw-Holding Officer',
  'The One Who Always Stops To Pet',
  'Just Looking (Lying)',
  'Dangerously Good At Baby Voice',
  'Clinically Unable To Say No',
] as const

export function pickFunnyDisplayName(): string {
  const i = Math.floor(Math.random() * FUNNY_DISPLAY_NAME_SAMPLES.length)
  return FUNNY_DISPLAY_NAME_SAMPLES[i]!
}

/**
 * On "yes", we roll for a match. Only a match is saved to
 * "your matches" (localStorage) and can show the full-screen moment.
 * About this fraction of yeses match; the rest are "no match this time"
 * and stay out of the saved list (for gamification).
 */
export const MATCH_MOMENT_PROBABILITY = 0.3

/** Roll for a full match (event handler / side-effect use only). */
export function rollMatchMoment(): boolean {
  return Math.random() < MATCH_MOMENT_PROBABILITY
}
